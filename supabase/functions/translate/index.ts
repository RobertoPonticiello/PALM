// Batch IT → EN translator powered by the Lovable AI Gateway.
// Used by the runtime DOM translator to translate any string that's not
// already in the static dictionary. Returns a parallel array of English
// translations (or the original IT string when translation fails).
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SYSTEM = `You are a professional Italian → English translator for a
premium digital health product called "Palm" (NICU-graduate, postpartum and
elderly-care companion app).

RULES:
- Translate each input string into natural, idiomatic English. NEVER literal.
- Match the warm, calm, premium tone of a polished consumer health app.
- Keep proper names (Romeo, Matteo, Chiara, Riccardo, Palm, Lulla, Dr.
  Bianchi, Dr.ssa Romano → "Dr. Romano", etc.).
- Use standard English clinical terms: "Bisoprolol", "iron sulfate",
  "hexavalent vaccine", "blood pressure", "fasting glucose", "GP", etc.
- Preserve emoji, numbers, units, punctuation and casing pattern.
- Preserve newlines exactly.
- Output ONLY a JSON object: { "items": ["en1", "en2", ...] } with the
  SAME length and order as the input array. Nothing else.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { items } = await req.json();
    if (!Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({ items: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const userPayload = JSON.stringify({ items });
    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: userPayload },
        ],
        response_format: { type: "json_object" },
      }),
    });
    if (!resp.ok) {
      const t = await resp.text();
      console.error("translate gateway error", resp.status, t);
      return new Response(JSON.stringify({ items }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const data = await resp.json();
    const raw = data?.choices?.[0]?.message?.content ?? "{}";
    let parsed: { items?: string[] } = {};
    try { parsed = JSON.parse(raw); } catch { parsed = {}; }
    const out = Array.isArray(parsed.items) && parsed.items.length === items.length
      ? parsed.items
      : items;
    return new Response(JSON.stringify({ items: out }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("translate error", e);
    return new Response(JSON.stringify({ items: [] }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});