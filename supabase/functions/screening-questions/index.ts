// Palm — generates 4-5 short pre-visit screening questions for a Palm Doctor
// booking, based on the chat transcript + active profile. Returns JSON.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PROFILE_HINT: Record<string, string> = {
  matteo:
    "Paziente: Romeo, neonato 2 mesi (età corretta 0m 18g), ex-TIN. Mamma Chiara scrive. Domande tipiche: alimentazione, peso, rigurgiti, sonno, coliche, respiro, ittero, febbre.",
  chiara:
    "Paziente: Chiara, donna 35 anni, post-partum recente, allatta in mista, sonno frammentato. Domande tipiche: stanchezza, umore, ciclo, dolori, contraccezione, allattamento, ferro/anemia.",
  riccardo:
    "Paziente: Riccardo, uomo 79 anni, vive solo, caregiver: Chiara. Iperteso, DM2, cardiopatia ischemica, IRC lieve, politerapia. Domande tipiche: pressione, glicemia, fiato, dolore toracico, edemi, cadute, aderenza farmaci.",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { transcript, profileId, doctorSpecialty, lang } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY non configurata");

    const profileHint = PROFILE_HINT[profileId as string] ?? PROFILE_HINT.matteo;
    const transcriptText = Array.isArray(transcript)
      ? transcript.map((m: any) => `${m.role === "user" ? "Utente" : "Palm"}: ${m.content}`).join("\n")
      : "";

    const SYSTEM = `Sei Palm, un'assistente medica AI. Devi generare 4-5 brevi domande di SCREENING PRE-VISITA che il paziente compilerà PRIMA del videoconsulto col medico ${doctorSpecialty || "Palm"}.

Obiettivo: dare al medico un quadro sintetico così che durante i 15 minuti di video si vada subito al punto.

Regole:
- 4 o 5 domande, MAI di più. Ognuna brevissima (max 12 parole).
- Mix: 2-3 domande aperte (textarea) e 1-2 chiuse (chips o sì/no).
- In italiano, tono caldo e umano, MAI clinico-burocratico.
- Devono essere TARATE sul motivo della consulenza che emerge dalla chat. Se la chat è breve o vaga, fai domande generiche utili (durata sintomo, intensità, cosa già provato, contesto).
- NON ripetere domande a cui Palm ha già avuto risposta nella chat.
- NON chiedere dati anagrafici, terapie croniche o roba che il medico ha già nel briefing del profilo.

Rispondi SOLO con un JSON valido, niente testo intorno, esattamente in questo formato:
{
  "questions": [
    { "id": "q1", "label": "Da quanto dura?", "type": "text", "placeholder": "es. da 3 giorni" },
    { "id": "q2", "label": "Quanto è intenso?", "type": "chips", "options": ["Lieve", "Medio", "Forte"] },
    { "id": "q3", "label": "Hai notato sangue?", "type": "yesno" },
    { "id": "q4", "label": "Cosa hai già provato?", "type": "text", "placeholder": "rimedi, farmaci…" }
  ]
}
I tipi ammessi sono: "text", "chips", "yesno". Solo questi.${
      lang === "en"
        ? "\n\nLANGUAGE OVERRIDE: Generate every question label, placeholder and option in natural English (not literal translation). Keep the same warm tone."
        : ""
    }`;

    const USER = `${profileHint}

Trascritto della chat con Palm (più recente in basso):
${transcriptText || "(nessuna conversazione, l'utente ha cliccato direttamente su 'parla con un medico')"}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: USER },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      // Fallback: return a generic safe set
      return new Response(JSON.stringify(fallback()), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const raw = data?.choices?.[0]?.message?.content ?? "{}";
    let parsed: any;
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = fallback();
    }
    if (!parsed?.questions || !Array.isArray(parsed.questions) || parsed.questions.length === 0) {
      parsed = fallback();
    }
    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("screening error:", e);
    return new Response(JSON.stringify(fallback()), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function fallback() {
  return {
    questions: [
      { id: "q1", label: "Qual è il motivo principale della consulenza?", type: "text", placeholder: "in poche parole…" },
      { id: "q2", label: "Da quanto tempo va avanti?", type: "chips", options: ["Oggi", "Pochi giorni", "Più di una settimana", "Da sempre"] },
      { id: "q3", label: "Quanto ti preoccupa adesso?", type: "chips", options: ["Poco", "Abbastanza", "Molto"] },
      { id: "q4", label: "Hai già provato qualcosa?", type: "text", placeholder: "rimedi, farmaci, consigli…" },
    ],
  };
}