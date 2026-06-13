import { useState, useRef, useEffect } from "react";
import { X, Send, Sparkles, Play, ShoppingBag, ShieldAlert, Stethoscope, Video, ChevronRight, Check, ExternalLink, Loader2, ClipboardList, Pill, Plus, BookCheck, FileText, MessageCircle, Download } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import { palmDoctors, type PalmDoctor } from "@/lib/mockData";
import { useActiveProfile } from "@/hooks/useActiveProfile";
import { useT } from "@/lib/i18n";
import { useLanguage } from "@/hooks/useLanguage";
import { usePregnancyMode } from "@/hooks/usePregnancyMode";
import { toast } from "@/hooks/use-toast";
import { addMedication, addLog, addAppointment } from "@/lib/store";
import { generateDoctorPdf } from "@/lib/generateDoctorPdf";

// Demo mode is "sticky": once the user lands on any URL with ?demo=1,
// we persist the flag in sessionStorage so it survives navigations
// (BottomNav, ProfileSelect redirects, etc.) that would otherwise
// strip the query string. Add ?demo=0 to turn it off explicitly.
const isDemoMode = (): boolean => {
  if (typeof window === "undefined") return false;
  try {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("demo");
    if (q === "1") {
      sessionStorage.setItem("lulla:demo", "1");
      return true;
    }
    if (q === "0") {
      sessionStorage.removeItem("lulla:demo");
      return false;
    }
    return sessionStorage.getItem("lulla:demo") === "1";
  } catch {
    return false;
  }
};

type RagMeta = { source: string; label: string; pages: number[]; url?: string };
type Msg = { role: "user" | "assistant"; content: string; rag?: RagMeta };
type Stage =
  | "chat"
  | "doctor-specialty"
  | "doctor-list"
  | "doctor-confirm"
  | "screening"
  | "doctor-booked";

/** Specialty filter the user chose after asking for a doctor. */
type SpecialtyFilter = "pediatra" | "mmg" | "specialista" | "any";

// Tiny "Suggerito da Palm" video card used for educational triggers in chat.
const VideoCard = ({
  href, title, subtitle, gradient,
}: { href: string; title: string; subtitle: string; gradient: string }) => (
  <div className="animate-slide-up-fade pl-2">
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-white/80 rounded-2xl shadow-soft overflow-hidden active:scale-[0.99] transition-transform"
    >
      <div className={cn("h-32 relative flex items-center justify-center", gradient)}>
        <div className="absolute inset-0 bg-foreground/5" />
        <div className="relative h-14 w-14 rounded-full bg-white/90 shadow-float flex items-center justify-center">
          <Play className="h-6 w-6 text-foreground fill-foreground ml-1" />
        </div>
        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-white/80 text-[9px] font-bold uppercase tracking-wider">
          Suggerito da Palm
        </div>
      </div>
      <div className="p-3">
        <div className="font-semibold text-sm">{title}</div>
        <div className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
          {subtitle} <ExternalLink className="h-2.5 w-2.5" />
        </div>
      </div>
    </a>
  </div>
);

/**
 * Real-YouTube video card: shows the actual video thumbnail (hqdefault.jpg)
 * with a Play button. On click, swaps to an inline iframe embed so the user
 * can watch the video right inside the chat — no leaving the app.
 * Used for curated videos that come from a controlled library
 * (e.g. hospital-vetted or Palm-team-vetted).
 */
const YoutubeVideoCard = ({
  youtubeId,
  title,
  subtitle,
  badge = "Video consigliato dal team Palm",
}: {
  youtubeId: string;
  title: string;
  subtitle: string;
  badge?: string;
}) => {
  const [playing, setPlaying] = useState(false);
  return (
    <div className="animate-slide-up-fade pl-2">
      <div className="block bg-white/85 rounded-2xl shadow-soft overflow-hidden">
        <div className="relative aspect-video bg-foreground/10">
          {playing ? (
            <iframe
              className="absolute inset-0 h-full w-full"
              src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <button
              type="button"
              onClick={() => setPlaying(true)}
              className="absolute inset-0 group"
              aria-label={`Guarda il video: ${title}`}
            >
              <img
                src={`https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`}
                alt={title}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-foreground/15 group-active:bg-foreground/25 transition-colors" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-14 w-14 rounded-full bg-white/95 shadow-float flex items-center justify-center group-active:scale-95 transition-transform">
                  <Play className="h-6 w-6 text-foreground fill-foreground ml-1" />
                </div>
              </div>
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-white/85 backdrop-blur text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                <BookCheck className="h-2.5 w-2.5" /> {badge}
              </div>
            </button>
          )}
        </div>
        <div className="p-3">
          <div className="font-semibold text-sm">{title}</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">{subtitle}</div>
        </div>
      </div>
    </div>
  );
};

// Split the FINAL assistant reply into 1–3 conversational bubbles.
//   • peel off a final wrap-up / question paragraph
//   • if the body is still long, give the empathetic opener its own bubble
// Always called once on the COMPLETE reply (not on tokens), so bubbles
// never reflow / re-render after they appear.
function splitReply(full: string): string[] {
  const trimmed = full.trim();
  if (!trimmed) return [""];
  const rawParas = trimmed.split(/\n{2,}/).map((s) => s.trim()).filter(Boolean);
  // Keep an intro paragraph (ending with ":") glued to the bullet list that
  // immediately follows it — otherwise the intro and the bullets land in
  // separate bubbles and look broken.
  const paras: string[] = [];
  for (let i = 0; i < rawParas.length; i++) {
    const cur = rawParas[i];
    const next = rawParas[i + 1];
    const introish = /[:：]\s*$/.test(cur) || /^\*\*.+\*\*\s*[:：]?\s*$/.test(cur);
    const nextIsList = next && /^(\s*[-*•]\s+|\s*\d+[.)]\s+)/.test(next);
    if (introish && nextIsList) {
      paras.push(`${cur}\n\n${next}`);
      i++;
    } else {
      paras.push(cur);
    }
  }
  if (paras.length === 1) return paras;

  let head = paras.slice();
  let tail: string | null = null;

  const last = head[head.length - 1];
  // 1) Strip "did this clarify your doubt?" style closing entirely — the app
  //    surfaces quick-click options for that. This kills the case where Palm
  //    asks the question even though we instructed it not to.
  const isClosingFeedbackQuestion =
    /\?\s*$/.test(last) &&
    /(chiarit\w*\s+(il\s+)?dubbio|hai\s+chiarito|senti\s+di\s+aver|come\s+ti\s+senti|ti\s+è\s+chiaro|ti\s+ho\s+chiarito|qualcos'?altro\s+che\s+ti\s+preoccup|c'?è\s+ancora\s+qualcosa)/i.test(
      last,
    );
  if (isClosingFeedbackQuestion && head.length > 1) {
    head = head.slice(0, -1);
    // Don't keep it as `tail` — drop it.
  } else {
    const looksLikeWrapUp =
      last.length < 240 &&
      (/\?\s*$/.test(last) ||
        /^(senti|dimmi|fammi sapere|vuoi|ti va|che ne pensi|ti torna|posso)/i.test(last));
    if (looksLikeWrapUp && head.length > 1) {
      tail = last;
      head = head.slice(0, -1);
    }
  }

  let opener: string | null = null;
  if (head.length > 1 && head[0].length < 140) {
    opener = head[0];
    head = head.slice(1);
  }

  const out: string[] = [];
  if (opener) out.push(opener);
  if (head.length) out.push(head.join("\n\n"));
  if (tail) out.push(tail);
  return out.length ? out : [trimmed];
}

// Normalize loose paragraph "lists" into proper markdown bullets.
// Models sometimes emit:
//   "Ecco cosa ti serve per Romeo:\n\nUn flacone...\n\nUna siringa...\n\nPer rendere..."
// We want:
//   "**Ecco cosa ti serve per Romeo:**\n\n- Un flacone...\n- Una siringa...\n- Per rendere..."
function normalizeLists(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return text;
  const paras = trimmed.split(/\n{2,}/).map((s) => s.trim()).filter(Boolean);
  if (paras.length < 3) return trimmed;

  const isAlreadyBullet = (p: string) => /^(\s*[-*•]\s+|\s*\d+[.)]\s+)/.test(p);
  const looksLikeListItem = (p: string) =>
    !isAlreadyBullet(p) &&
    p.length > 0 &&
    p.length < 320 &&
    !/\n/.test(p); // single-paragraph items only
  const looksLikeIntro = (p: string) =>
    /[:：]\s*$/.test(p) && p.length < 200 && !isAlreadyBullet(p);

  const out: string[] = [];
  let i = 0;
  while (i < paras.length) {
    const p = paras[i];
    if (looksLikeIntro(p)) {
      // collect run of list-like paragraphs after the intro
      let j = i + 1;
      const items: string[] = [];
      while (j < paras.length && looksLikeListItem(paras[j])) {
        items.push(paras[j]);
        j++;
      }
      if (items.length >= 2) {
        const intro = /^\*\*.+\*\*\s*[:：]?\s*$/.test(p)
          ? p
          : `**${p.replace(/[:：]\s*$/, "")}:**`;
        out.push(intro);
        out.push(items.map((it) => `- ${it.replace(/^\s*[-*•]\s+/, "")}`).join("\n"));
        i = j;
        continue;
      }
    }
    out.push(p);
    i++;
  }
  return out.join("\n\n");
}

// Heuristic: did the user ask, in plain Italian, to talk to a real doctor?
// We're permissive — false positives just open the doctor list, which the
// user can dismiss with "← Torna alla chat".
function looksLikeDoctorRequest(text: string): boolean {
  const t = text.toLowerCase();
  // Must mention a clinician/doctor concept.
  // NOTE: we deliberately do NOT close with `\b` because Italian inflections
  // ("dottore", "medico", "pediatra") add a vowel after the stem — `\b` after
  // "dottor" wouldn't match "dottore". We only anchor at the start.
  const mentionsDoctor =
    /\b(dottor|medic|pediatr|geriatr|cardiolog|ginecolog|specialist|teleconsult|videoconsult|consulto|visita medica)/.test(
      t,
    );
  if (!mentionsDoctor) return false;
  // …AND express intent / availability
  const intent =
    /\b(devo|voglio|vorrei|posso|si può|si puo|si puo'|prenotare|prenota|prenotazione|parlare|sentire|chiamare|chiamo|fissare|appuntamento|adesso|subito|disponibil|bisogno)/.test(
      t,
    );
  return intent;
}

/** Detect "the doctor told me to take X" mentions in the LATEST user message,
 *  so we can surface a one-tap "Save to therapies" card. Returns the therapy
 *  name (e.g. "Vitamina D") or null. Heuristic, intentionally permissive. */
function detectTherapyMention(text: string): string | null {
  const t = text.toLowerCase();
  // Trigger phrase: doctor said / prescribed / advised
  const hasTrigger =
    /(dottor|medic|pediatr|geriatr|cardiolog|ginecolog|specialist|farmacist)\w*\s+(ha\s+)?(detto|consigliat|prescritt|suggerit|raccomand|fatto\s+prendere|prescrive)/.test(
      t,
    ) || /(prendere|assumere|dare|somministrare|aggiungere)\s+(la\s+|il\s+|una\s+|un\s+|del\s+|della\s+)?(vitamin|integrator|gocce|sciroppo|antibiot|paracetam|tachipirin|ibuprofen|ferr|omega|probiotic|fermenti|melaton)/.test(
        t,
      );
  if (!hasTrigger) return null;
  // Common therapy keywords → return canonical name
  const map: Array<[RegExp, string]> = [
    [/vitamin[ae]\s*d/, "Vitamina D"],
    [/vitamin[ae]\s*c/, "Vitamina C"],
    [/vitamin[ae]\s*b\s*12/, "Vitamina B12"],
    [/acido\s+folico/, "Acido folico"],
    [/ferr[oi]/, "Ferro"],
    [/omega\s*3/, "Omega 3"],
    [/probiotic|fermenti\s+lattici/, "Fermenti lattici"],
    [/paracetam|tachipirin/, "Paracetamolo"],
    [/ibuprofen|nurofen/, "Ibuprofene"],
    [/melaton/, "Melatonina"],
    [/multivitamin/, "Multivitaminico"],
  ];
  for (const [re, name] of map) if (re.test(t)) return name;
  return null;
}

/**
 * Parse and EXECUTE inline action tags emitted by Palm.
 *
 * Format: `[[ACTION:add_medication name="Vitamina C" dose="1000 mg"]]`
 *         `[[ACTION:log_weight value_g="3150"]]`
 *         `[[ACTION:log_feed method="bottle" amount_ml="60"]]`
 *         `[[ACTION:log_diaper kind="poop" consistency="normale"]]`
 *         `[[ACTION:log_spitup amount="medio"]]`
 *
 * Returns the cleaned text (with tags removed) and a list of human summaries.
 */
function executeActionTags(
  raw: string,
  profileId: "matteo" | "chiara" | "riccardo" | "sofia",
): { clean: string; performed: string[] } {
  const re = /\[\[ACTION:([a-z_]+)([^\]]*)\]\]/gi;
  const performed: string[] = [];
  let clean = raw;
  let m: RegExpExecArray | null;
  // Reset regex state per call.
  while ((m = re.exec(raw)) !== null) {
    const [, name, argsRaw] = m;
    const args: Record<string, string> = {};
    const argRe = /(\w+)\s*=\s*"([^"]*)"/g;
    let a: RegExpExecArray | null;
    while ((a = argRe.exec(argsRaw)) !== null) args[a[1]] = a[2];
    try {
      switch (name) {
        case "add_medication": {
          if (args.name) {
            addMedication(profileId, args.name, {
              dose: args.dose,
              schedule: args.schedule,
              source: "chat",
            });
            performed.push(`✨ ${args.name}${args.dose ? ` (${args.dose})` : ""} aggiunta alle terapie`);
          }
          break;
        }
        case "log_weight": {
          if (args.value_g) {
            const kg = (parseInt(args.value_g) / 1000).toFixed(2).replace(".", ",");
            addLog(profileId, "weight", `Peso · ${kg} kg`);
            performed.push(`⚖️ Peso registrato: ${kg} kg`);
          }
          break;
        }
        case "log_feed": {
          const via = args.method === "breast" ? "Seno" : args.method === "tube" ? "Sondino" : "Biberon";
          const detail = args.amount_ml ? `${via} · ${args.amount_ml} ml` : via;
          addLog(profileId, "feed", detail);
          performed.push(`🍼 Pasto registrato: ${detail}`);
          break;
        }
        case "log_diaper": {
          const k = args.kind === "pee" ? "Pipì" : args.kind === "poop" ? "Cacca" : "Pipì + cacca";
          const c = args.consistency ? ` · ${args.consistency}` : "";
          addLog(profileId, "diaper", `Pannolino · ${k}${c}`);
          performed.push(`🌿 Pannolino registrato: ${k}${c}`);
          break;
        }
        case "log_spitup": {
          if (args.amount) {
            addLog(profileId, "spitup", `Rigurgito · ${args.amount}`);
            performed.push(`💧 Rigurgito registrato: ${args.amount}`);
          }
          break;
        }
        case "add_appointment": {
          if (args.title && args.date) {
            const iconGuess = (() => {
              const t = args.title.toLowerCase();
              if (/vaccin/.test(t)) return "💉";
              if (/cardio|cuore/.test(t)) return "❤️";
              if (/neurolog|cerebr/.test(t)) return "🧠";
              if (/ginecolog|pap/.test(t)) return "🌸";
              if (/ocul|vista/.test(t)) return "👁️";
              if (/ematic|sangue|emo/.test(t)) return "🩸";
              if (/neonatolog|pediatr/.test(t)) return "🩺";
              return args.icon || "📅";
            })();
            const color = (args.color as any) || "pastel-blue";
            addAppointment(profileId, {
              title: args.title,
              date: args.date,
              time: args.time || "—",
              icon: iconGuess,
              color,
              location: args.location,
              prep: args.prep,
              source: "chat",
            });
            performed.push(`📅 Appuntamento aggiunto: ${args.title} · ${args.date}${args.time ? ` ${args.time}` : ""}`);
          }
          break;
        }
      }
    } catch (e) {
      console.warn("action tag failed", name, e);
    }
  }
  clean = raw.replace(re, "").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  return { clean, performed };
}

export const ChatPanel = ({ onClose }: { onClose: () => void }) => {
  const { id: profileId, profile } = useActiveProfile();
  const { t } = useT(profileId);
  const { lang } = useLanguage();
  const { on: pregnant } = usePregnancyMode();
  const greeting =
    profileId === "matteo"
      ? "Ciao Chiara 💛 Sono Palm. Come posso aiutarti oggi?"
      : profileId === "chiara"
      ? "Ciao Chiara 💛 Sono Palm. Come posso aiutarti oggi?"
      : "Ciao 💛 Sono Palm. Come posso aiutarti oggi?";
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content: greeting,
    },
  ]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [stage, setStage] = useState<Stage>("chat");
  const [chosenDoctor, setChosenDoctor] = useState<PalmDoctor | null>(null);
  const [specialty, setSpecialty] = useState<SpecialtyFilter>("any");
  const [resolved, setResolved] = useState(false);
  const [kbInset, setKbInset] = useState(0);
  // Quick-add therapy card surfaced when the user mentions a doctor's advice.
  // We track which therapy mentions have already been actioned (saved or
  // dismissed) so the card doesn't keep popping up for the same item.
  const [therapyHandled, setTherapyHandled] = useState<Record<string, boolean>>({});
  // Once Palm has shown an educational video card in the chat, we hide all
  // further trigger-based cards so the same video never appears twice.
  const [videoShown, setVideoShown] = useState<string | null>(null);
  // True from the moment the user explicitly asks for a doctor — used to
  // suppress unrelated rich content (videos, products) so we don't show the
  // bath video when the user just wants a pediatrician.
  const [doctorFlow, setDoctorFlow] = useState(false);
  // PS prep flow: when Palm rinvia al PS, propose a clinical summary BEFORE the
  // 3-option close panel. Stages: null = card not yet shown / answered,
  // "skipped" = user declined, "done" = PDF generated.
  const [psPrepStage, setPsPrepStage] = useState<null | "skipped" | "done">(null);
  // Doctor-summary card: when the user asks Palm for a riassunto/report to
  // bring to a doctor (any profile), surface a download CTA so the promised
  // PDF actually materializes. Stages mirror psPrepStage.
  const [docSummaryStage, setDocSummaryStage] = useState<null | "skipped" | "done">(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // # of user turns — used to surface the escalation CTA after meaningful interaction
  const userTurns = messages.filter((m) => m.role === "user").length;
  // If the LAST assistant message ends with a question, Palm is waiting on the
  // user — never show the escalation in that moment.
  const lastAssistantMsg = [...messages].reverse().find((m) => m.role === "assistant")?.content ?? "";
  const lastUserMsg = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";
  const detectedTherapy = detectTherapyMention(lastUserMsg);
  const showTherapyCard = !!detectedTherapy && !therapyHandled[detectedTherapy] && stage === "chat" && !streaming;
  const palmIsAsking = !!lastAssistantMsg && /\?\s*$/.test(lastAssistantMsg.trim());

  // Saline-product card REMOVED on purpose. Per user feedback: never
  // proactively suggest products. Palm should ask first ("hai già la
  // fisiologica in casa?") and only if the user says no, surface a product.
  // The system prompt rule 4-sexies enforces this on the AI side.
  const showSalineProduct = false;

  // ── Video trigger logic ─────────────────────────────────────────────
  // We pick AT MOST ONE video for the whole session, gated on:
  //  1. profile = baby (Romeo)
  //  2. user is NOT in the doctor booking flow
  //  3. no video has already been shown this session
  //  4. ANY user message in this session mentioned that topic (so the card
  //     stays attached even after the user replies "sì" / "penso sia chiuso")
  //  5. Palm is actually addressing it in her latest reply
  // This kills the "asked for doctor → got bath video" bug.
  const canSurfaceVideo = profileId === "matteo" && !doctorFlow && stage === "chat";
  const allUserText = messages
    .filter((m) => m.role === "user")
    .map((m) => m.content)
    .join(" \n ")
    .toLowerCase();
  // Same idea but for Palm's side of the conversation. We use this to detect
  // when Palm has explicitly ANNOUNCED a video ("qui sotto trovi un video di
  // Palm…") so the card always renders, even if the user's exact wording
  // doesn't match our regexes (e.g. "non respira bene" vs "raffreddore").
  const allAssistantText = messages
    .filter((m) => m.role === "assistant")
    .map((m) => m.content)
    .join(" \n ")
    .toLowerCase();
  // Only consider the LAST assistant message for "did Palm just announce a
  // video?" — otherwise an announcement from an earlier, unrelated turn
  // (e.g. "ti mando un video" about nasal washes) would combine with a
  // stray topic keyword from any other turn (e.g. "vestire") and surface
  // the wrong video. The announcement and the topic must co-occur in the
  // same assistant turn.
  const lastAssistantText = (
    [...messages].reverse().find((m) => m.role === "assistant")?.content ?? ""
  ).toLowerCase();
  const announceRe = /video di palm|qui sotto trovi un video|sotto trovi un video|trovi un video di palm|ti mando un video|ti lascio un video|guarda questo video/;
  const palmAnnouncedVideoInLast = announceRe.test(lastAssistantText);
  // Topic must be present in the SAME (last) assistant message as the
  // announcement. Helper below replaces the old `palmAddresses` for the
  // announcement branch only — `palmAddresses` (full history) is still used
  // for the user-asked branch, where it's safe.
  const palmAnnouncedTopic = (re: RegExp) =>
    palmAnnouncedVideoInLast && re.test(lastAssistantText);
  // Red-flag suppressor: only true when Palm has *actually* told the mother
  // to act now — not when she's listing hypothetical "if you see X, then
  // urgent" guidance. We require either:
  //   (a) a hard destination keyword (PS, 118, 112, guardia medica), OR
  //   (b) an explicit imperative to go ("vai/recati/portalo subito",
  //       "chiama subito", "non aspettare"), OR
  //   (c) the exact phrase "valutazione medica immediata".
  // We also strip out clauses introduced by "se " (conditional advice) so
  // sentences like "se noti rientramenti, è necessaria una valutazione
  // medica urgente" no longer trip the alert.
  const nonConditional = allAssistantText.replace(
    /\bse\s+[^.!?\n]{0,180}[.!?\n]/gi,
    " ",
  );
  const palmFlaggedRedAlert =
    /\b(pronto soccorso|\b118\b|\b112\b|guardia medica|valutazione medica immediata|non aspettare|chiama(re|la)?\s+subito|recat[ei]\s+subito|vai\s+subito|porta(lo|la)\s+subito)\b/i.test(
      nonConditional,
    );
  const userAsks = (re: RegExp) => re.test(allUserText);
  // Look across ALL of Palm's replies (not just the latest one), so the card
  // doesn't disappear after the user replies "sì" or "ok".
  const palmAddresses = (re: RegExp) => re.test(allAssistantText);
  const conversationMentionsNasal = /lavagg(io|i)? nasal|naso chius|naso ostruit|soluzione fisiologic|siringa|naric[ei]|congestion|fialett|fisiologic/.test(
    `${allUserText} \n ${allAssistantText}`,
  );

  // A video card is shown when:
  //   (A) the user mentioned the topic AND Palm is addressing it, OR
  //   (B) Palm has explicitly announced "qui sotto trovi un video di Palm…"
  //       on this topic (covers cases like "raffreddore" → "lavaggi nasali"
  //       where the user word and the assistant word differ).
  // This kills the "Palm promises a video but it never appears" bug.
  const nasalMatch =
    canSurfaceVideo &&
    !palmFlaggedRedAlert &&
    // Strict gate: the user must have explicitly asked HOW to do nasal washes
    // (topic-specific only — no generic "non so come" / "tutorial" catch-alls,
    // those would fire on unrelated topics).
    ((userAsks(/come (si )?fa(nno)? (il |i )?lavagg|come pul(ire|isco) il naso|non so come (si )?fa(nno)? (il |i )?lavagg|lavagg(i|io)? nasal|naso chiuso.*video/) &&
      palmAddresses(/lavagg(io)? nasal|soluzione fisiologic|siringa|fialett|fisiologic/)) ||
      palmAnnouncedTopic(/lavagg(io)? nasal|soluzione fisiologic|siringa|fialett|fisiologic/));
  const colicMatch =
    canSurfaceVideo &&
    !palmIsAsking &&
    !palmFlaggedRedAlert &&
    // Strict gate (see nasal): topic-specific user ask, OR explicit Palm announcement.
    ((userAsks(/come (si )?fa(nno)? (il )?massagg|massagg(io)? (anti-?)?colich|come (faccio|posso) (a )?(calmar|aiutar).*colich/) &&
      palmAddresses(/massagg(io)? anti-colich|i-l-u/)) ||
      palmAnnouncedTopic(/massagg(io)? anti-colich|colich/));
  const breastfeedMatch =
    canSurfaceVideo &&
    !palmIsAsking &&
    !palmFlaggedRedAlert &&
    ((userAsks(/come (lo )?attacco|come (si )?attacca al seno|non so come allattar|posizion[ei] di allattament/) &&
      palmAddresses(/posizion[ei] di allatt|attacco al seno/)) ||
      palmAnnouncedTopic(/posizion[ei] di allatt|attacco al seno/));
  const bottleMatch =
    canSurfaceVideo &&
    !palmIsAsking &&
    !palmFlaggedRedAlert &&
    ((userAsks(/come (si )?da il biberon|come do il biberon|paced (bottle )?feeding|come faccio (a )?dargli (il )?latte (col |con il )?biberon/) &&
      palmAddresses(/paced|biberon|tettarella/)) ||
      palmAnnouncedTopic(/paced|biberon|tettarella/));
  const pumpingMatch =
    canSurfaceVideo &&
    !palmIsAsking &&
    !palmFlaggedRedAlert &&
    ((userAsks(/come (si )?usa il tiralatte|come uso il tiralatte|non so usare il tiralatte/) &&
      palmAddresses(/tiralatte|estrazione|conservazione/)) ||
      palmAnnouncedTopic(/tiralatte/));
  const bathMatch =
    canSurfaceVideo &&
    !palmIsAsking &&
    !palmFlaggedRedAlert &&
    ((userAsks(/come (si )?fa il bagn|come (gli|le) faccio il bagn|primo bagn(ett)?o/) &&
      palmAddresses(/bagnett|primo bagno/)) ||
      palmAnnouncedTopic(/bagnett|primo bagno/));
  // "Come vestire Romeo quando fa caldo / esco" — sourced from Palm's
  // controlled video library (see rag_videos table, source=palm-team).
  const dressMatch =
    canSurfaceVideo &&
    !palmIsAsking &&
    !palmFlaggedRedAlert &&
    ((userAsks(/come (lo|la) vesto|cosa (gli|le) metto|come vestir(lo|la)|non so come (vestir|coprir)/) &&
      palmAddresses(/vestir|abbigliament|strat[oi]|body|tutina/)) ||
      palmAnnouncedTopic(/vestir|come vestire|abbigliament/));
  const surfacedVideo =
    videoShown ??
    (nasalMatch
      ? "nasal"
      : colicMatch
      ? "colic"
      : breastfeedMatch
      ? "breastfeed"
      : bottleMatch
      ? "bottle"
      : pumpingMatch
      ? "pumping"
      : bathMatch
      ? "bath"
      : dressMatch
      ? "dress"
      : null);

  // Surface the "did this clear it up? / talk to a doctor" quick-click
  // escalation when EITHER (a) we've had 3+ user turns of real back-and-forth,
  // OR (b) Palm has just shown a video card — at that point the conversation
  // has reached its natural "ok now what?" beat. Never while Palm is
  // mid-question or mid-stream, never inside the doctor flow.
  const anyVideoShown = !!surfacedVideo;
  // PS-prep card: show whenever Palm has flagged a red alert AND the user
  // hasn't answered the prep prompt yet. This must appear BEFORE the
  // 3-option close panel, and only once per session.
  const showPsPrepCard =
    !streaming &&
    !thinking &&
    stage === "chat" &&
    !resolved &&
    !palmIsAsking &&
    !doctorFlow &&
    profileId === "matteo" &&
    palmFlaggedRedAlert &&
    psPrepStage === null;
  // Detect a "prepare a summary I can take to the doctor" request. Works for
  // any profile (Romeo, Chiara, Riccardo). User must ask for some kind of
  // riassunto/report/summary AND mention a doctor/appointment context, and
  // Palm must have acknowledged she's preparing it. Only one shot per session.
  const userAskedForDoctorSummary =
    /(riassunt|riepilog|sommari|report|recap|summary|prepar(a|i|ar)|portare|bring|hand).{0,40}(medic|dottor|pediatr|visita|appuntament|specialist|doctor|appointment|gp|consult)/.test(
      allUserText,
    ) ||
    /(medic|dottor|pediatr|doctor|appointment|visita).{0,40}(riassunt|riepilog|sommari|report|recap|summary)/.test(
      allUserText,
    );
  const palmAckSummary =
    /(preparo|preparer|preparand|prepari il|preparo subito|preparing|i['']ll prepare|riassunt|riepilog|sommari|report|summary|recap|qui sotto|trovi pronto|tra un istante|in un istante|just a moment|right below|here it is)/.test(
      lastAssistantText,
    );
  const showDocSummaryCard =
    !streaming &&
    !thinking &&
    stage === "chat" &&
    !resolved &&
    !palmIsAsking &&
    !doctorFlow &&
    !showPsPrepCard &&
    userAskedForDoctorSummary &&
    palmAckSummary &&
    docSummaryStage === null;
  // 3-option close panel ("dubbio risolto / ho un'altra domanda / parlo con
  // un medico"). When there's a red alert, we gate it behind the PS-prep
  // card so the mom answers that first.
  const showEscalation =
    !streaming &&
    !thinking &&
    stage === "chat" &&
    !resolved &&
    !palmIsAsking &&
    !doctorFlow &&
    !showPsPrepCard &&
    !showDocSummaryCard &&
    (userTurns >= 3 || anyVideoShown || psPrepStage !== null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, streaming, thinking, stage]);

  // Mark a video as "shown" once any one of them is rendered, so we never
  // duplicate cards in subsequent turns.
  useEffect(() => {
    if (!videoShown && surfacedVideo) setVideoShown(surfacedVideo);
  }, [surfacedVideo, videoShown]);

  // Keyboard-aware bottom inset using visualViewport so the composer
  // (and the latest message) stay visible when the on-screen keyboard opens.
  useEffect(() => {
    const vv = (window as any).visualViewport as VisualViewport | undefined;
    if (!vv) return;
    const update = () => {
      const inset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      setKbInset(inset);
    };
    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, []);

  // Pick up any prefill from the dashboard quick-input bar and auto-send it.
  useEffect(() => {
    const prefill = sessionStorage.getItem("palm:chat-prefill");
    if (prefill) {
      sessionStorage.removeItem("palm:chat-prefill");
      // Slight delay so the panel finishes mounting before we send.
      setTimeout(() => { send(prefill); }, 150);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const send = async (text: string) => {
    if (!text.trim() || streaming) return;
    const userMsg: Msg = { role: "user", content: text };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setResolved(false);

    // ── Fast-path: if the user explicitly asks to talk to a doctor, jump
    // straight into the booking flow. We DON'T waste turns asking sintomi
    // o piccoli talk — the user already wants to book. The clinical
    // screening happens AT THE END, just before pagamento.
    if (looksLikeDoctorRequest(text)) {
      setDoctorFlow(true);
      setMessages((p) => [
        ...p,
        {
          role: "assistant",
          content:
            "Certo. Con quale medico vuoi parlare? Scegli qui sotto e ti mostro subito le disponibilità.",
        },
      ]);
      setTimeout(() => setStage("doctor-specialty"), 250);
      return;
    }

    setStreaming(true);
    setThinking(true);

    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;
      // Isolated demo mode: when the page URL has ?demo=1, the edge function
      // swaps in an entirely different system prompt for tomorrow's demo.
      // Default behavior of the main app is completely untouched.
      const demoMode = isDemoMode();
      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: next, profileId, demo: demoMode, lang, pregnant: profileId === "chiara" && pregnant }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        setMessages((p) => [...p, { role: "assistant", content: err.error || "Mi dispiace, non riesco a rispondere ora." }]);
        setStreaming(false);
        setThinking(false);
        return;
      }
      if (!resp.body) throw new Error("no body");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let assistantSoFar = "";
      let ragMeta: RagMeta | null = null;
      // Track the SSE event name across lines (event:/data: pairs).
      let pendingEvent: string | null = null;

      // ── Phase 1: silently accumulate the FULL reply ─────────────────────
      // We do NOT render tokens as they arrive, because Palm's reply will
      // later be split into 1–3 bubbles. Rendering then replacing causes the
      // ugly "block reflows" the user complained about. Keep the typing
      // indicator visible for the entire stream instead.
      let done = false;
      while (!done) {
        const { done: d, value } = await reader.read();
        if (d) break;
        textBuffer += decoder.decode(value, { stream: true });

        let nl: number;
        while ((nl = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, nl);
          textBuffer = textBuffer.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":")) continue;
          if (line.trim() === "") {
            // Blank line = SSE event boundary → reset event name
            pendingEvent = null;
            continue;
          }
          if (line.startsWith("event: ")) {
            pendingEvent = line.slice(7).trim();
            continue;
          }
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") {
            done = true;
            break;
          }
          // Custom Palm metadata event (RAG source info, sent before tokens).
          if (pendingEvent === "palm-meta") {
            try {
              const meta = JSON.parse(json);
              if (meta?.rag?.source && meta?.rag?.label) {
                ragMeta = meta.rag as RagMeta;
              }
            } catch (e) {
              console.warn("bad palm-meta payload", e);
            }
            continue;
          }
          try {
            const parsed = JSON.parse(json);
            const c = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (c) assistantSoFar += c;
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // ── Phase 2: split into bubbles & type each one in its OWN bubble ───
      // Each bubble starts empty and is filled by a typewriter — bubbles
      // never get replaced or reflowed once they have content.
      // First, parse + execute any `[[ACTION:...]]` tags so the data
      // actually lands in the store before we render.
      const { clean, performed } = executeActionTags(
        assistantSoFar || "",
        profileId as "matteo" | "chiara" | "riccardo" | "sofia",
      );
      if (performed.length) {
        performed.forEach((p) =>
          toast({ title: p, description: "Aggiornato in tempo reale" }),
        );
      }
      const normalized = normalizeLists(clean || "");
      const parts = splitReply(normalized || "Mi dispiace, non sono riuscita a rispondere. Puoi riprovare?");
      const CHAR_DELAY_MS = 12; // ~80 chars/sec — feels like a fast friend typing
      const PAUSE_BETWEEN_BUBBLES_MS = 550;

      // Only show the "Fonte verificata" card if the reply actually USES the
      // source (cites SIP / linea guida). Pure follow-up question turns must
      // not show the badge even when the RAG router pre-loaded context.
      const replyUsesSource = /(linea\s+guida|secondo\s+la\s+sip|sip\s+202|bronchiolit)/i
        .test(clean || "");
      // Fallback: if Palm cites SIP but the RAG router didn't match (e.g. user
      // typed an unusual phrasing like "espira" or "costoline" that escaped
      // the regex), still surface the verified-source card with the canonical
      // URL so the user always has a clickable reference.
      const fallbackRag: RagMeta = {
        source: "SIP-2023-bronchiolitis",
        label: "Linea guida nazionale sulla bronchiolite — Società Italiana di Pediatria (2023)",
        pages: [],
        url: "https://doi.org/10.1186/s13052-022-01392-6",
      };
      const effectiveRagMeta = replyUsesSource ? (ragMeta ?? fallbackRag) : null;

      for (let p = 0; p < parts.length; p++) {
        if (p === 0) setThinking(false);
        else await new Promise((r) => setTimeout(r, PAUSE_BETWEEN_BUBBLES_MS));

        // Push an empty assistant bubble that we will fill in place.
        // Only the FIRST bubble of the reply carries the RAG source card,
        // so the user immediately sees "verified source" before the text appears.
        const attachRag = p === 0 ? effectiveRagMeta ?? undefined : undefined;
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "", rag: attachRag },
        ]);

        const target = parts[p];
        let shown = "";
        // Reveal slightly more chars per tick on long bubbles so they
        // don't feel sluggish, but always at least 1 per tick.
        const step = target.length > 220 ? 2 : 1;
        for (let k = 0; k < target.length; k += step) {
          shown = target.slice(0, k + step);
          const snapshot = shown;
          setMessages((prev) =>
            prev.map((m, i) =>
              i === prev.length - 1 && m.role === "assistant"
                ? { ...m, content: snapshot }
                : m,
            ),
          );
          await new Promise((r) => setTimeout(r, CHAR_DELAY_MS));
        }
      }
    } catch (e) {
      console.error(e);
      setMessages((p) => [...p, { role: "assistant", content: "Mi dispiace, ho avuto un problema di connessione. Riprova tra un momento." }]);
      setThinking(false);
    } finally {
      setStreaming(false);
      setThinking(false);
    }
  };

  return (
    <div className="absolute inset-0 z-[60] animate-fade-in">
      <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={onClose} />
      <div
        className="absolute inset-x-0 top-0 md:top-12 glass md:rounded-t-[2.5rem] flex flex-col shadow-float animate-slide-up-fade overflow-hidden"
        style={{
          bottom: kbInset,
          paddingTop: kbInset > 0 ? 0 : "env(safe-area-inset-top)",
        }}
      >
        {/* Header */}
        <div className="px-5 pt-4 pb-3 border-b border-white/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full gradient-dawn flex items-center justify-center shadow-soft">
                <Sparkles className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <div className="font-display text-lg font-semibold leading-none flex items-center gap-2">
                  Palm
                  {isDemoMode() && (
                      <span className="px-1.5 py-0.5 rounded-md bg-status-warn text-[9px] font-bold uppercase tracking-wider text-foreground">
                        Demo
                      </span>
                    )}
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5">{t("Sempre qui per te")}</div>
              </div>
            </div>
            <button onClick={onClose} className="h-9 w-9 rounded-full bg-white/60 flex items-center justify-center">
              <X className="h-4 w-4" />
            </button>
          </div>
          {/* Disclaimer */}
          <div className="mt-3 flex items-start gap-2 rounded-2xl bg-status-warn/10 border border-status-warn/20 px-3 py-2">
            <ShieldAlert className="h-3.5 w-3.5 text-status-warn shrink-0 mt-0.5" />
            <p className="text-[10.5px] leading-snug text-foreground/70">
              {t("Palm offre")} <span className="font-semibold">{t("supporto educativo e informativo")}</span>{t(". Non fornisce diagnosi né terapie.")}
              {profileId === "matteo"
                ? " " + t("Per sintomi gravi o urgenti contatta il pediatra o il 118.")
                : profileId === "riccardo"
                ? " Per sintomi gravi o urgenti contatta il medico curante o il 118."
                : " Per sintomi gravi o urgenti contatta il tuo medico o il 118."}
            </p>
          </div>
        </div>

        {/* Body */}
        {stage === "chat" && (
          <>
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scrollbar-hide">
              {messages.map((m, i) => (
                <div key={i} className="space-y-1.5">
                  {m.role === "assistant" && m.rag && (
                    <div className="flex justify-start animate-slide-up-fade">
                      <div className="max-w-[82%] rounded-2xl px-3 py-2 bg-status-good/12 border border-status-good/30 shadow-soft">
                        <div className="flex items-start gap-2">
                          <div className="h-7 w-7 rounded-full bg-status-good/20 flex items-center justify-center shrink-0">
                            <BookCheck className="h-3.5 w-3.5 text-status-good" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-[10px] uppercase tracking-widest font-bold text-status-good">
                              Fonte verificata
                            </div>
                            <div className="text-[12px] font-semibold leading-snug text-foreground">
                              Linea Guida nazionale sulla bronchiolite
                            </div>
                            <div className="text-[10.5px] text-muted-foreground mt-0.5">
                              Società Italiana di Pediatria (SIP), 2023
                              {m.rag.pages.length > 0 ? ` · pag. ${m.rag.pages.join(", ")}` : ""}
                            </div>
                            {m.rag.url ? (
                              <a
                                href={m.rag.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 mt-1.5 text-[11px] font-semibold text-status-good hover:underline"
                              >
                                Apri il documento originale (PDF)
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            ) : (
                              <div className="mt-1 text-[10px] text-muted-foreground/70 italic">
                                Documento ufficiale consultabile nella knowledge base
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className={cn("flex animate-fade-in", m.role === "user" ? "justify-end" : "justify-start")}>
                    <div
                      className={cn(
                        "max-w-[82%] rounded-3xl px-4 py-2.5 text-sm leading-relaxed",
                        m.role === "user"
                          ? "gradient-sunset text-foreground rounded-br-md"
                          : "bg-white/80 text-foreground rounded-bl-md shadow-soft",
                      )}
                    >
                      <div className="prose prose-sm max-w-none [&_p]:m-0 [&_p+p]:mt-2 [&_strong]:font-semibold [&_ul]:my-1 [&_li]:my-0">
                        <ReactMarkdown>{m.content}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* "Palm is typing" bubble — only between user msg and first token */}
              {thinking && (
                <div className="flex justify-start animate-fade-in">
                  <div className="bg-white/80 text-foreground rounded-3xl rounded-bl-md shadow-soft px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-foreground/50 animate-typing-dot" style={{ animationDelay: "0s" }} />
                      <span className="h-2 w-2 rounded-full bg-foreground/50 animate-typing-dot" style={{ animationDelay: "0.18s" }} />
                      <span className="h-2 w-2 rounded-full bg-foreground/50 animate-typing-dot" style={{ animationDelay: "0.36s" }} />
                    </div>
                  </div>
                </div>
              )}

              {/* Rich content cards.
                  IMPORTANT: each card is gated on `surfacedVideo === "<id>"`
                  so only ONE video ever appears per session. Without this
                  guard, multiple matches (e.g. nasal + bottle) could render
                  side-by-side and surprise the user with an unrelated video. */}
              {surfacedVideo === "nasal" && !streaming && (
                <YoutubeVideoCard
                  youtubeId="-uwx2DE2ukE"
                  title="Lavaggio nasale passo per passo"
                  subtitle="Guida del team Palm · soluzione fisiologica, posizione, gocce"
                />
              )}

              {/* Saline-product suggestion — only when Palm explicitly raises
                  saline in her LATEST reply, and never while she's mid-question.
                  Decoupled from the nasal video on purpose: ask first, video,
                  THEN — only if useful — offer the product. */}
              {showSalineProduct && (
                <div className="animate-slide-up-fade pl-2">
                  <button className="flex items-center gap-3 w-full bg-white/80 rounded-2xl p-3 shadow-soft text-left">
                    <div className="h-12 w-12 rounded-xl gradient-warm flex items-center justify-center">
                      <ShoppingBag className="h-5 w-5 text-foreground" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold">3 soluzioni saline più amate</div>
                      <div className="text-[11px] text-muted-foreground">Top recensite · spedizione domani</div>
                    </div>
                  </button>
                </div>
              )}

              {surfacedVideo === "colic" && !streaming && (
                <div className="animate-slide-up-fade pl-2">
                  <a
                    href="https://www.youtube.com/results?search_query=massaggio+coliche+neonato+tecnica+i+love+u"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-white/80 rounded-2xl shadow-soft overflow-hidden active:scale-[0.99] transition-transform"
                  >
                    <div className="h-32 gradient-mint relative flex items-center justify-center">
                      <div className="absolute inset-0 bg-foreground/5" />
                      <div className="relative h-14 w-14 rounded-full bg-white/90 shadow-float flex items-center justify-center">
                        <Play className="h-6 w-6 text-foreground fill-foreground ml-1" />
                      </div>
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-white/80 text-[9px] font-bold uppercase tracking-wider">
                        Suggerito da Palm
                      </div>
                    </div>
                    <div className="p-3">
                      <div className="font-semibold text-sm">Massaggio anti-coliche · tecnica I-L-U</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
                        3 min · prova mentre tieni Romeo a pancia in su <ExternalLink className="h-2.5 w-2.5" />
                      </div>
                    </div>
                  </a>
                </div>
              )}

              {surfacedVideo === "breastfeed" && !streaming && (
                <VideoCard
                  href="https://www.youtube.com/results?search_query=posizioni+allattamento+al+seno+neonato"
                  title="Le 4 posizioni di allattamento più comode"
                  subtitle="4 min · culla, rugby, sdraiata, biological nurturing"
                  gradient="gradient-warm"
                />
              )}
              {surfacedVideo === "bottle" && !streaming && (
                <VideoCard
                  href="https://www.youtube.com/results?search_query=paced+bottle+feeding+neonato+come+dare+biberon"
                  title="Come dare il biberon · paced feeding"
                  subtitle="3 min · ritmo, pausa, posizione semi-eretta"
                  gradient="gradient-baby"
                />
              )}
              {surfacedVideo === "pumping" && !streaming && (
                <VideoCard
                  href="https://www.youtube.com/results?search_query=tiralatte+come+usarlo+conservazione+latte+materno"
                  title="Tiralatte: come usarlo e conservare il latte"
                  subtitle="5 min · estrazione, igiene, frigorifero/freezer"
                  gradient="gradient-sky"
                />
              )}
              {surfacedVideo === "bath" && !streaming && (
                <VideoCard
                  href="https://www.youtube.com/results?search_query=bagnetto+neonato+come+fare+sicurezza"
                  title="Il primo bagnetto · passo per passo"
                  subtitle="4 min · temperatura, presa, asciugatura"
                  gradient="gradient-mint"
                />
              )}
              {surfacedVideo === "dress" && !streaming && (
                <YoutubeVideoCard
                  youtubeId="Gw8hTZpqisg"
                  title="Come vestire il neonato in base alla temperatura"
                  subtitle="Guida del team Palm · strati, materiali, segnali di troppo caldo"
                />
              )}

              {/* PS-prep card — appears RIGHT AFTER Palm rinvia al PS, before
                  the 3-option close panel. Proactively offers to generate a
                  clinical summary the mom can hand to the ER team. */}
              {showPsPrepCard && (
                <div className="animate-slide-up-fade pt-1">
                  <div className="rounded-2xl bg-gradient-to-br from-status-warn/10 to-status-warn/5 border border-status-warn/30 p-3.5 shadow-soft">
                    <div className="flex items-start gap-2.5">
                      <div className="h-9 w-9 rounded-xl bg-status-warn/20 flex items-center justify-center shrink-0">
                        <FileText className="h-4 w-4 text-status-warn" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] uppercase tracking-widest font-bold text-status-warn">
                          Prima di andare
                        </div>
                        <div className="text-sm font-semibold leading-snug mt-0.5">
                          Vuoi che ti prepari un riassunto clinico di Romeo da mostrare in PS?
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-1 leading-snug">
                          Anamnesi, prematurità, terapie attive e ultimi segni — pronto in un PDF
                          per non dover ricordare tutto sotto stress.
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setPsPrepStage("skipped")}
                        className="rounded-xl bg-white/70 text-foreground/70 py-2 text-xs font-semibold active:scale-[0.98] transition-transform"
                      >
                        No, vado e basta
                      </button>
                      <button
                        onClick={() => {
                          try {
                            generateDoctorPdf(lang === "en" ? "en" : "it");
                            toast({
                              title: lang === "en" ? "📄 Summary ready" : "📄 Riassunto pronto",
                              description: lang === "en" ? "Downloaded. Show it to the ER doctor." : "Scaricato. Mostralo al medico in PS.",
                            });
                          } catch (e) {
                            console.error("PDF gen failed", e);
                            toast({ title: lang === "en" ? "Couldn't generate the PDF" : "Non sono riuscita a generare il PDF", description: lang === "en" ? "Please try again in a moment." : "Riprova tra un momento." });
                          }
                          setPsPrepStage("done");
                        }}
                        className="rounded-xl gradient-warm text-foreground py-2 text-xs font-bold flex items-center justify-center gap-1.5 active:scale-[0.98] transition-transform shadow-soft"
                      >
                        <Download className="h-3.5 w-3.5" /> Sì, generalo
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Doctor-summary card — appears when the user explicitly
                  asks Palm to prepare a recap to bring to a doctor/visit.
                  Without this, Palm promises the doc in text but nothing
                  ever materializes. */}
              {showDocSummaryCard && (
                <div className="animate-slide-up-fade pt-1">
                  <div className="rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/30 p-3.5 shadow-soft">
                    <div className="flex items-start gap-2.5">
                      <div className="h-9 w-9 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] uppercase tracking-widest font-bold text-primary">
                          {lang === "en" ? "Summary for the doctor" : "Riassunto per il medico"}
                        </div>
                        <div className="text-sm font-semibold leading-snug mt-0.5">
                          {lang === "en"
                            ? "Your recap is ready — download the PDF to bring to the visit."
                            : "Il riassunto è pronto — scarica il PDF da portare alla visita."}
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-1 leading-snug">
                          {lang === "en"
                            ? "Anamnesis, growth, active therapies and latest exams — all in one place."
                            : "Anamnesi, crescita, terapie attive ed ultimi esami — tutto in un unico documento."}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setDocSummaryStage("skipped")}
                        className="rounded-xl bg-white/70 text-foreground/70 py-2 text-xs font-semibold active:scale-[0.98] transition-transform"
                      >
                        {lang === "en" ? "Not now" : "Non ora"}
                      </button>
                      <button
                        onClick={() => {
                          try {
                            generateDoctorPdf(lang === "en" ? "en" : "it");
                            toast({
                              title: lang === "en" ? "📄 Summary ready" : "📄 Riassunto pronto",
                              description: lang === "en" ? "Downloaded. Bring it to the visit." : "Scaricato. Portalo alla visita.",
                            });
                          } catch (e) {
                            console.error("PDF gen failed", e);
                            toast({ title: lang === "en" ? "Couldn't generate the PDF" : "Non sono riuscita a generare il PDF", description: lang === "en" ? "Please try again in a moment." : "Riprova tra un momento." });
                          }
                          setDocSummaryStage("done");
                        }}
                        className="rounded-xl gradient-warm text-foreground py-2 text-xs font-bold flex items-center justify-center gap-1.5 active:scale-[0.98] transition-transform shadow-soft"
                      >
                        <Download className="h-3.5 w-3.5" /> {lang === "en" ? "Download PDF" : "Scarica PDF"}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 3-option close panel — "dubbio risolto / un'altra domanda /
                  preferisco un medico". Replaces the old "Come ti senti?" card. */}
              {showEscalation && (
                 <div className="animate-slide-up-fade pt-1">
                   <div className="rounded-2xl bg-white/70 border border-white/60 p-3 shadow-soft">
                     <div className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                       {t("Come vuoi proseguire?")}
                     </div>
                    <div className="grid grid-cols-1 gap-2 mt-2">
                      <button
                        onClick={() => { setResolved(true); }}
                        className="rounded-xl bg-status-good/15 text-foreground p-2.5 flex items-center gap-2 text-left active:scale-[0.99] transition-transform"
                      >
                        <Check className="h-4 w-4 text-status-good shrink-0" />
                        <span className="text-xs font-semibold">{t("Mi hai aiutata, grazie")}</span>
                      </button>
                      <button
                        onClick={() => {
                          // Re-open the conversation: hide the panel until the
                          // next meaningful turn so the user can keep typing.
                          setResolved(false);
                          // Bump psPrepStage so the panel doesn't immediately
                          // re-render after the next reply (user is now in
                          // active dialogue, not at a closing beat).
                          setPsPrepStage((s) => s ?? "skipped");
                          // Focus the composer
                          setTimeout(() => {
                            const ta = document.querySelector<HTMLTextAreaElement>(
                              'textarea[placeholder*="Palm"]',
                            );
                            ta?.focus();
                          }, 50);
                        }}
                        className="rounded-xl bg-white text-foreground border border-foreground/10 p-2.5 flex items-center gap-2 text-left active:scale-[0.99] transition-transform"
                      >
                        <MessageCircle className="h-4 w-4 text-foreground/70 shrink-0" />
                        <span className="text-xs font-semibold flex-1">{t("Ho un'altra domanda")}</span>
                      </button>
                       <button
                         onClick={() => setStage("doctor-list")}
                         className="rounded-xl bg-white text-foreground/80 border border-foreground/10 p-2.5 flex items-center gap-2 text-left active:scale-[0.99] transition-transform"
                       >
                         <Stethoscope className="h-4 w-4 text-foreground/60 shrink-0" />
                         <span className="text-xs font-medium flex-1">{t("Preferisco parlare con un medico Palm")}</span>
                         <ChevronRight className="h-3.5 w-3.5 text-foreground/40" />
                       </button>
                    </div>
                  </div>
                </div>
              )}

              {resolved && (
                <div className="animate-fade-in pl-2 text-center">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-status-good/15 text-status-good text-[11px] font-semibold">
                    <Check className="h-3 w-3" /> {t("Sessione chiusa con serenità")}
                  </div>
                </div>
              )}

              {/* Quick-add therapy card */}
              {showTherapyCard && detectedTherapy && (
                <div className="animate-slide-up-fade pl-2">
                  <div className="bg-white/90 rounded-2xl shadow-soft p-3 border border-primary/20">
                    <div className="flex items-start gap-2.5">
                      <div className="h-9 w-9 rounded-xl gradient-mint flex items-center justify-center shrink-0">
                        <Pill className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                          {t("Aggiungo alle terapie?")}
                        </div>
                        <div className="text-sm font-semibold leading-snug mt-0.5">
                          {detectedTherapy}
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                          {t("Suggerito dal dottore · salva in un tap su Palm")}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2.5 grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setTherapyHandled((p) => ({ ...p, [detectedTherapy]: true }))}
                        className="rounded-xl bg-muted/70 text-foreground/70 py-2 text-xs font-semibold active:scale-[0.98] transition-transform"
                      >
                        {t("No, grazie")}
                      </button>
                      <button
                        onClick={() => {
                          setTherapyHandled((p) => ({ ...p, [detectedTherapy]: true }));
                          addMedication(profileId, detectedTherapy, { source: "chat" });
                          toast({
                            title: `✨ ${detectedTherapy} ${t("aggiunta")}`,
                            description: t("La trovi nella sezione Terapie del profilo."),
                          });
                        }}
                        className="rounded-xl gradient-dawn text-foreground py-2 text-xs font-bold flex items-center justify-center gap-1 active:scale-[0.98] transition-transform shadow-soft"
                      >
                        <Plus className="h-3.5 w-3.5" /> {t("Aggiungi")}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input — real chat composer */}
            <div
              className="px-3 pt-3 bg-white/95 border-t border-foreground/10 shadow-[0_-4px_20px_-8px_rgba(0,0,0,0.08)]"
              style={{ paddingBottom: `calc(1rem + ${kbInset > 0 ? "0px" : "env(safe-area-inset-bottom)"})` }}
            >
              <div className="flex items-end gap-2 bg-background border border-foreground/15 rounded-3xl pl-4 pr-1.5 py-1.5 focus-within:border-primary/50 focus-within:shadow-soft transition-all">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  name="palm-message"
                  autoComplete="off"
                  autoCorrect="on"
                  autoCapitalize="sentences"
                  spellCheck
                  enterKeyHint="send"
                  inputMode="text"
                  onFocus={(e) => {
                    // Make sure the composer (and last message) stay visible above the keyboard.
                    setTimeout(() => {
                      e.currentTarget?.scrollIntoView({ block: "center", behavior: "smooth" });
                    }, 250);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      send(input);
                    }
                  }}
                  placeholder={t("Scrivi un messaggio a Palm…")}
                  rows={1}
                  className="flex-1 min-w-0 bg-transparent outline-none text-sm placeholder:text-muted-foreground py-2 resize-none max-h-28"
                  disabled={streaming}
                />
                <button
                  onClick={() => send(input)}
                  disabled={!input.trim() || streaming}
                  aria-label="Invia messaggio"
                  className="h-10 w-10 rounded-full gradient-dawn flex items-center justify-center disabled:opacity-40 transition-transform active:scale-90 shrink-0 shadow-soft"
                >
                  <Send className="h-4 w-4 text-foreground" />
                </button>
              </div>
              <div className="hidden md:block text-center mt-1.5 text-[10px] text-muted-foreground">
                {t("Premi Invio per inviare · Shift+Invio per andare a capo")}
              </div>
            </div>
          </>
        )}

        {stage === "doctor-list" && (
          <DoctorList
            profileId={profileId}
            specialty={specialty}
            transcript={messages}
            onBack={() => setStage("doctor-specialty")}
            onPick={(d) => { setChosenDoctor(d); setStage("doctor-confirm"); }}
          />
        )}
        {stage === "doctor-specialty" && (
          <SpecialtyPicker
            onBack={() => { setStage("chat"); setDoctorFlow(false); }}
            onPick={(s) => { setSpecialty(s); setStage("doctor-list"); }}
          />
        )}
        {stage === "doctor-confirm" && chosenDoctor && (
          <DoctorConfirm
            profileId={profileId}
            profileName={profile?.name ?? ""}
            doctor={chosenDoctor}
            transcript={messages}
            onBack={() => setStage("doctor-list")}
            onBook={() => setStage("screening")}
          />
        )}
        {stage === "screening" && chosenDoctor && (
          <Screening
            profileId={profileId}
            doctor={chosenDoctor}
            transcript={messages}
            onBack={() => setStage("doctor-confirm")}
            onComplete={() => setStage("doctor-booked")}
          />
        )}
        {stage === "doctor-booked" && chosenDoctor && (
          <DoctorBooked doctor={chosenDoctor} profileName={profile?.name ?? ""} onClose={onClose} />
        )}
      </div>
    </div>
  );
};

const DoctorList = ({
  profileId,
  specialty,
  transcript,
  onBack,
  onPick,
}: {
  profileId: string | null;
  specialty: SpecialtyFilter;
  transcript: Msg[];
  onBack: () => void;
  onPick: (d: PalmDoctor) => void;
}) => {
  // Filter by active profile
  let eligible = palmDoctors.filter((d) =>
    d.forProfiles.includes((profileId as PalmDoctor["forProfiles"][number]) ?? "matteo"),
  );
  // Then narrow by user-chosen specialty
  if (specialty === "pediatra") {
    eligible = eligible.filter((d) => /pediatr/i.test(d.specialty));
  } else if (specialty === "mmg") {
    eligible = eligible.filter((d) => /medic(o|ina) (di base|generale)|mmg/i.test(d.specialty));
  } else if (specialty === "specialista") {
    eligible = eligible.filter((d) => !/pediatr|medic(o|ina) (di base|generale)|mmg/i.test(d.specialty));
  }
  if (eligible.length === 0) {
    // Fallback: never show an empty list — revert to all profile-eligible doctors.
    eligible = palmDoctors.filter((d) =>
      d.forProfiles.includes((profileId as PalmDoctor["forProfiles"][number]) ?? "matteo"),
    );
  }
  // Rank by keyword match against the chat
  const haystack = transcript.map((m) => m.content).join(" ").toLowerCase();
  const ranked = [...eligible].sort((a, b) => {
    const score = (d: PalmDoctor) => (d.tags ?? []).filter((t) => haystack.includes(t.toLowerCase())).length;
    return score(b) - score(a);
  });
  const topScore = (ranked[0]?.tags ?? []).filter((t) => haystack.includes(t.toLowerCase())).length;

  return (
  <div className="flex-1 overflow-y-auto px-5 pt-4 pb-6 scrollbar-hide">
    <button onClick={onBack} className="text-xs text-muted-foreground mb-2">← Torna alla chat</button>
    <h3 className="font-display text-2xl font-semibold leading-tight">Scegli un Palm Doctor</h3>
    <p className="text-xs text-foreground/70 mt-1.5 leading-relaxed">
      Videoconsulto di 15 minuti. Il medico riceverà in automatico il riassunto della tua chat con Palm,
      così può aiutarti subito senza ripartire da zero.
    </p>

    <div className="mt-4 space-y-2.5">
      {ranked.map((d, idx) => (
        <button
          key={d.id}
          onClick={() => onPick(d)}
          className={cn(
            "w-full bg-white/80 rounded-3xl p-3.5 shadow-soft flex items-center gap-3 text-left active:scale-[0.99] transition-transform relative",
            idx === 0 && topScore > 0 && "ring-2 ring-primary/40",
          )}
        >
          {idx === 0 && topScore > 0 && (
            <div className="absolute -top-2 left-4 px-2 py-0.5 rounded-full gradient-dawn text-[9px] font-bold uppercase tracking-wider shadow-soft">
              ⭐ Più adatto a te
            </div>
          )}
          <div className="h-12 w-12 rounded-2xl gradient-parent flex items-center justify-center text-2xl shrink-0">
            {d.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm">{d.name}</div>
            <div className="text-[11px] text-muted-foreground truncate">{d.specialty}</div>
            <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-status-good/15 text-status-good text-[10px] font-bold uppercase tracking-wider">
              Disponibile in {d.availableIn}
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
        </button>
      ))}
    </div>

    <div className="mt-5 rounded-2xl bg-white/60 p-3 text-[11px] text-foreground/70 leading-relaxed">
      <span className="font-semibold">Servizio extra a pagamento.</span> Vedrai il prezzo finale prima di confermare.
    </div>
  </div>
  );
};

const DoctorConfirm = ({
  profileId, profileName, doctor, transcript, onBack, onBook,
}: {
  profileId: string | null;
  profileName: string;
  doctor: PalmDoctor;
  transcript: Msg[];
  onBack: () => void;
  onBook: () => void;
}) => {
  const summaryPoints = transcript
    .filter((m) => m.role === "user")
    .slice(-3)
    .map((m) => m.content);

  return (
    <div className="flex-1 overflow-y-auto px-5 pt-4 pb-6 scrollbar-hide">
      <button onClick={onBack} className="text-xs text-muted-foreground mb-2">← Cambia medico</button>
      <h3 className="font-display text-2xl font-semibold leading-tight">Conferma il consulto</h3>

      <div className="mt-4 rounded-3xl gradient-parent p-4 shadow-card flex items-center gap-3">
        <div className="h-12 w-12 rounded-2xl bg-white/70 flex items-center justify-center text-2xl">{doctor.emoji}</div>
        <div className="flex-1">
          <div className="font-semibold text-sm">{doctor.name}</div>
          <div className="text-[11px] text-foreground/70">{doctor.specialty}</div>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-wider font-bold text-foreground/60">In</div>
          <div className="font-display text-base font-semibold">{doctor.availableIn}</div>
        </div>
      </div>

      <div className="mt-5">
        <div className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Riassunto che invieremo al medico</div>
        <div className="mt-2 rounded-2xl bg-white/70 p-3 space-y-1.5 shadow-soft">
          {profileId === "matteo" && (
            <>
              <div className="text-xs"><span className="font-semibold">Bambino:</span> Romeo, 2m 3g (età corretta 0m 18g) · ex TIN</div>
              <div className="text-xs"><span className="font-semibold">Terapie attive:</span> Vit D 400 UI, ferro, multivitaminico</div>
            </>
          )}
          {profileId === "chiara" && (
            <>
              <div className="text-xs"><span className="font-semibold">Paziente:</span> Chiara, 35 anni · post-partum 3 settimane</div>
              <div className="text-xs"><span className="font-semibold">Quadro:</span> sonno frammentato (~4-5h), allatta in mista, sideremia ai limiti bassi</div>
              <div className="text-xs"><span className="font-semibold">Terapie attive:</span> vitamine prenatali + DHA, vitamina D</div>
            </>
          )}
          {profileId === "riccardo" && (
            <>
              <div className="text-xs"><span className="font-semibold">Paziente:</span> Riccardo, 79 anni · vive da solo, caregiver: Chiara</div>
              <div className="text-xs"><span className="font-semibold">Quadro:</span> ipertensione, DM2 (HbA1c 6,8%), cardiopatia ischemica stabile, IRC lieve (eGFR 58)</div>
              <div className="text-xs"><span className="font-semibold">Terapia cronica:</span> Ramipril 5, Bisoprololo 2,5, Atorvastatina 20, Metformina 500x2, ASA 100, Omeprazolo 20</div>
              <div className="text-xs"><span className="font-semibold">Ultime misure:</span> PA media 138/82, glicemia digiuno 118 mg/dL</div>
            </>
          )}
          {summaryPoints.length > 0 && (
            <div className="text-xs">
              <span className="font-semibold">Motivo della consulenza:</span>
              <ul className="mt-1 space-y-0.5 list-disc list-inside text-foreground/80">
                {summaryPoints.map((s, i) => <li key={i} className="line-clamp-2">{s}</li>)}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 rounded-2xl bg-card p-3 shadow-soft flex items-center justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Videochiamata</div>
          <div className="font-display text-base font-semibold">15 minuti · Palm Doctor</div>
        </div>
        <Video className="h-5 w-5 text-muted-foreground" />
      </div>

      <button
        onClick={onBook}
        className="mt-5 w-full h-14 rounded-2xl gradient-sunset font-display text-lg font-semibold shadow-card transition-transform active:scale-[0.98] flex items-center justify-center gap-2"
      >
        <ClipboardList className="h-5 w-5" /> Continua · 4 domande veloci
      </button>
      <div className="mt-2 text-center text-[10px] text-muted-foreground">
        Palm fa qualche domanda di screening così il medico arriva preparato. Pagamento alla fine.
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────
// Pre-visit screening: 4-5 short AI-generated questions tailored to
// the conversation + active profile. The answers are bundled with the
// profile briefing and (in the demo) "sent" to the doctor before the
// videoconsult.
// ─────────────────────────────────────────────────────────────────────
type ScreeningQ = {
  id: string;
  label: string;
  type: "text" | "chips" | "yesno";
  options?: string[];
  placeholder?: string;
};

const Screening = ({
  profileId,
  doctor,
  transcript,
  onBack,
  onComplete,
}: {
  profileId: string | null;
  doctor: PalmDoctor;
  transcript: Msg[];
  onBack: () => void;
  onComplete: () => void;
}) => {
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<ScreeningQ[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const { lang } = useLanguage();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/screening-questions`;
        const resp = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ transcript, profileId, doctorSpecialty: doctor.specialty, lang }),
        });
        const json = await resp.json();
        if (cancelled) return;
        const qs: ScreeningQ[] = Array.isArray(json?.questions) ? json.questions : [];
        setQuestions(qs);
      } catch (e) {
        console.error("screening fetch error", e);
        if (!cancelled) setQuestions([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const allAnswered = questions.length > 0 && questions.every((q) => (answers[q.id] ?? "").trim().length > 0);

  const submit = async () => {
    setSubmitting(true);
    // Mock-send: we just pause briefly, then move to booked.
    await new Promise((r) => setTimeout(r, 600));
    onComplete();
  };

  return (
    <div className="flex-1 overflow-y-auto px-5 pt-4 pb-6 scrollbar-hide">
      <button onClick={onBack} className="text-xs text-muted-foreground mb-2">← Torna indietro</button>

      <div className="flex items-center gap-2 mb-1">
        <div className="h-8 w-8 rounded-2xl gradient-dawn flex items-center justify-center">
          <Sparkles className="h-4 w-4" />
        </div>
        <div className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
          Screening pre-visita · generato da Palm
        </div>
      </div>
      <h3 className="font-display text-2xl font-semibold leading-tight">Qualche domanda veloce</h3>
      <p className="text-xs text-foreground/70 mt-1.5 leading-relaxed">
        Le risposte arrivano a <span className="font-semibold">{doctor.name}</span> prima del videoconsulto, insieme al riassunto del profilo. Così non si parte da zero.
      </p>

      {loading && (
        <div className="mt-8 flex flex-col items-center text-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-foreground/60" />
          <div className="text-xs text-muted-foreground">Palm sta preparando le domande giuste per te…</div>
        </div>
      )}

      {!loading && questions.length === 0 && (
        <div className="mt-6 rounded-2xl bg-status-warn/10 border border-status-warn/20 p-3 text-xs">
          Non sono riuscita a generare le domande. Procedi pure: il medico ti farà tutto in video.
          <button onClick={onComplete} className="mt-3 w-full h-11 rounded-xl bg-foreground text-background font-semibold text-sm">
            Continua senza screening
          </button>
        </div>
      )}

      {!loading && questions.length > 0 && (
        <>
          <div className="mt-5 space-y-3.5">
            {questions.map((q, i) => (
              <div key={q.id} className="bg-white/80 rounded-3xl p-3.5 shadow-soft">
                <div className="flex items-start gap-2">
                  <div className="h-5 w-5 rounded-full bg-foreground text-background text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <div className="flex-1 text-sm font-semibold leading-snug">{q.label}</div>
                </div>

                <div className="mt-2.5 pl-7">
                  {q.type === "text" && (
                    <textarea
                      value={answers[q.id] ?? ""}
                      onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                      onFocus={(e) =>
                        setTimeout(
                          () => e.currentTarget?.scrollIntoView({ block: "center", behavior: "smooth" }),
                          250,
                        )
                      }
                      placeholder={q.placeholder ?? "Scrivi qui…"}
                      rows={2}
                      className="w-full bg-background border border-foreground/10 rounded-2xl px-3 py-2 text-sm outline-none focus:border-primary/50 resize-none"
                    />
                  )}

                  {q.type === "chips" && q.options && (
                    <div className="flex flex-wrap gap-1.5">
                      {q.options.map((opt) => {
                        const sel = answers[q.id] === opt;
                        return (
                          <button
                            key={opt}
                            onClick={() => setAnswers((a) => ({ ...a, [q.id]: opt }))}
                            className={cn(
                              "px-3 py-1.5 rounded-full text-xs font-semibold border transition-all",
                              sel
                                ? "bg-foreground text-background border-foreground"
                                : "bg-background text-foreground border-foreground/15 hover:border-foreground/40",
                            )}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {q.type === "yesno" && (
                    <div className="flex gap-2">
                      {["Sì", "No"].map((opt) => {
                        const sel = answers[q.id] === opt;
                        return (
                          <button
                            key={opt}
                            onClick={() => setAnswers((a) => ({ ...a, [q.id]: opt }))}
                            className={cn(
                              "flex-1 py-2 rounded-2xl text-sm font-semibold border transition-all",
                              sel
                                ? "bg-foreground text-background border-foreground"
                                : "bg-background text-foreground border-foreground/15",
                            )}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={submit}
            disabled={!allAnswered || submitting}
            className="mt-5 w-full h-14 rounded-2xl gradient-sunset font-display text-lg font-semibold shadow-card transition-transform active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-40"
          >
            {submitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" /> Invio al medico…
              </>
            ) : (
              <>
                <Video className="h-5 w-5" /> Prenota e paga
              </>
            )}
          </button>
          <div className="mt-2 text-center text-[10px] text-muted-foreground">
            {allAnswered ? "Tutto pronto per il videoconsulto" : "Rispondi a tutte le domande per continuare"}
          </div>
        </>
      )}
    </div>
  );
};

const DoctorBooked = ({ doctor, profileName, onClose }: { doctor: PalmDoctor; profileName: string; onClose: () => void }) => (
  <div className="flex-1 overflow-y-auto px-5 pt-6 pb-6 scrollbar-hide flex flex-col items-center text-center">
    <div className="h-20 w-20 rounded-full gradient-mint flex items-center justify-center shadow-card animate-scale-bounce">
      <Check className="h-10 w-10 text-foreground" strokeWidth={3} />
    </div>
    <h3 className="font-display text-2xl font-semibold leading-tight mt-4">Tutto pronto.</h3>
    <p className="text-sm text-foreground/70 mt-2 leading-relaxed max-w-xs">
      {doctor.name} ti chiamerà in video tra <span className="font-semibold">{doctor.availableIn}</span>.
      Riceverà il riassunto della chat: arriverà già preparato.
    </p>
    <div className="mt-6 w-full bg-white/70 rounded-3xl p-4 shadow-soft text-left">
      <div className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Cosa succede ora</div>
      <ul className="mt-2 space-y-1.5 text-xs text-foreground/80">
        <li className="flex gap-2"><span className="text-status-good">✓</span> Hai ricevuto un'email di conferma</li>
        <li className="flex gap-2"><span className="text-status-good">✓</span> Il medico ha già il tuo briefing</li>
        <li className="flex gap-2"><span className="text-status-good">✓</span> Notifica 2 minuti prima dell'appuntamento</li>
      </ul>
    </div>
    <button
      onClick={onClose}
      className="mt-6 w-full h-12 rounded-2xl bg-foreground text-background font-semibold"
    >
      Chiudi
    </button>
  </div>
);

// ─────────────────────────────────────────────────────────────────────
// SpecialtyPicker — first step of the booking flow.
// We DO NOT ask sintomi yet: only "with whom do you want to talk?".
// All clinical screening happens later, after the user has chosen
// doctor + slot, just before pagamento.
// ─────────────────────────────────────────────────────────────────────
const SpecialtyPicker = ({
  onBack,
  onPick,
}: {
  onBack: () => void;
  onPick: (s: SpecialtyFilter) => void;
}) => {
  const opts: { id: SpecialtyFilter; emoji: string; title: string; sub: string }[] = [
    { id: "pediatra", emoji: "🧸", title: "Pediatra", sub: "per Romeo o per dubbi sui bambini" },
    { id: "mmg", emoji: "🩺", title: "Medico di base", sub: "salute generale, ricette, dubbi quotidiani" },
    { id: "specialista", emoji: "✨", title: "Specialista", sub: "ginecologa, cardiologo, dermatologa…" },
    { id: "any", emoji: "💛", title: "Non sono sicura", sub: "Mostrami tutti i medici disponibili ora" },
  ];
  return (
    <div className="flex-1 overflow-y-auto px-5 pt-4 pb-6 scrollbar-hide">
      <button onClick={onBack} className="text-xs text-muted-foreground mb-2">← Torna alla chat</button>
      <h3 className="font-display text-2xl font-semibold leading-tight">Con quale medico vuoi parlare?</h3>
      <p className="text-xs text-foreground/70 mt-1.5 leading-relaxed">
        Scegli e ti mostro chi è disponibile adesso. Le domande di screening arrivano dopo, in 30 secondi.
      </p>
      <div className="mt-4 space-y-2">
        {opts.map((o) => (
          <button
            key={o.id}
            onClick={() => onPick(o.id)}
            className="w-full bg-white/80 rounded-2xl p-3.5 shadow-soft flex items-center gap-3 text-left active:scale-[0.99] transition-transform"
          >
            <div className="h-11 w-11 rounded-2xl gradient-parent flex items-center justify-center text-xl shrink-0">
              {o.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm">{o.title}</div>
              <div className="text-[11px] text-muted-foreground">{o.sub}</div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
};
