import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Baby,
  HeartHandshake,
  Users,
  Camera,
  ScanFace,
  ShieldCheck,
  Check,
  Upload,
  Sparkles,
  FileText,
} from "lucide-react";
import { PhoneShell } from "@/components/PhoneShell";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";

type Relation = "child" | "parent" | "other";
type Step =
  | "relation"
  | "consent"
  | "id-intro"
  | "id-scanning"
  | "guardian-doc-intro"
  | "guardian-doc-scanning"
  | "face-intro"
  | "face-scanning"
  | "done";

const relationCopy: Record<Relation, { title: string; subtitle: string; needsKyc: boolean }> = {
  child: {
    title: "Un figlio o una figlia",
    subtitle: "Verifichiamo che tu sia il genitore o tutore legale",
    needsKyc: true,
  },
  parent: {
    title: "Un mio genitore",
    subtitle: "Verificheremo il consenso con un breve KYC",
    needsKyc: true,
  },
  other: {
    title: "Un'altra persona di cui mi prendo cura",
    subtitle: "Coniuge, familiare, persona assistita",
    needsKyc: true,
  },
};

const ADD_PROFILE_EN: Record<string, string> = {
  "Indietro": "Back",
  "Nuovo profilo": "New profile",
  "Procedi con la verifica →": "Continue to verification →",
  "Procedi con la verifica": "Continue to verification",
  "Ho il suo consenso, continua": "I have their consent, continue",
  "Inquadra il documento": "Scan the document",
  "Carica il documento di tutela": "Upload proof of guardianship",
  "Inizia il riconoscimento": "Start face verification",
  "Chi vuoi\naggiungere?": "Who would you like\nto add?",
  "Palm tratta la salute degli altri con la stessa cura della tua. Scegli il tipo di relazione: cambia solo il modo in cui verifichiamo il consenso.": "Palm handles other people's health with the same care as your own. Choose the relationship type: the only thing that changes is how we verify consent.",
  "Un figlio o una figlia": "A child",
  "Verifichiamo che tu sia il genitore o tutore legale": "We'll verify that you're the parent or legal guardian",
  "Un mio genitore": "A parent",
  "Verificheremo il consenso con un breve KYC": "We'll verify consent with a quick identity check",
  "Un'altra persona di cui mi prendo cura": "Someone else I care for",
  "Coniuge, familiare, persona assistita": "Partner, relative, or person in your care",
  "Richiede verifica identità": "Identity check required",
  "Una verifica per\nproteggere il minore": "A quick check\nto protect a minor",
  "Una verifica veloce\nper proteggerlo davvero": "A quick check\nto protect them properly",
  "Per i dati sanitari di un minore la legge richiede che chi li gestisce sia genitore o tutore legale. Bastano tre passaggi rapidi.": "Health data for a minor can only be managed by a parent or legal guardian under the law. It only takes three quick steps.",
  "Dato che stai aggiungendo i dati di un'altra persona adulta — il tuo genitore — ci servono due passaggi rapidi per assicurarci che tu abbia il suo consenso.": "Since you're adding another adult's health data — your parent — we need two quick steps to make sure you have their consent.",
  "Dato che stai aggiungendo i dati di un'altra persona adulta — il persona che assisti — ci servono due passaggi rapidi per assicurarci che tu abbia il suo consenso.": "Since you're adding another adult's health data — the person you care for — we need two quick steps to make sure you have their consent.",
  "Il TUO documento d'identità": "YOUR ID document",
  "Carta d'identità o patente, fronte e retro": "ID card or driver's license, front and back",
  "Documento di tutela": "Proof of guardianship",
  "Stato di famiglia, certificato di nascita o decreto del tribunale": "Family status record, birth certificate, or court order",
  "Riconoscimento facciale": "Face verification",
  "Un breve scan in stile Face ID — durata 10 secondi": "A quick Face ID-style scan — 10 seconds",
  "Conferma istantanea": "Instant confirmation",
  "Palm completa la verifica in pochi secondi": "Palm completes the check in a few seconds",
  "🔒 I documenti vengono cifrati end-to-end e usati solo per verificare l'identità. Non li condividiamo con nessuno.": "🔒 Documents are end-to-end encrypted and used only to verify identity. We don't share them with anyone.",
  "Carica una foto di uno di questi documenti — ci basta a confermare che sei il genitore o tutore legale.": "Upload a photo of one of these documents — that's enough for us to confirm you're the parent or legal guardian.",
  "Stato di famiglia": "Family status record",
  "Rilasciato dal Comune (anche digitale)": "Issued by the municipality (digital version accepted)",
  "Certificato di nascita": "Birth certificate",
  "Estratto integrale con paternità/maternità": "Full extract showing maternity/paternity",
  "Decreto di tutela": "Guardianship order",
  "Solo se sei tutore non-genitore": "Only if you're a guardian and not a parent",
  "Inquadra il documento\ndi tutela": "Place the proof of\nguardianship in frame",
  "Oppure carica un PDF dalla galleria": "Or upload a PDF from your gallery",
  "Verifico la tutela…": "Checking guardianship…",
  "Confronto i tuoi dati con il documento e validità del rilascio.": "I'm matching your details with the document and validating the issuing authority.",
  "Lettura in corso…": "Reading…",
  "Documento riconosciuto": "Document recognized",
  "Verifica firma del Comune": "Municipality signature check",
  "Match con il tuo nome": "Name match",
  "Carta d'identità, patente o passaporto. Posiziona il documento sopra una superficie scura e ben illuminata.": "Use an ID card, driver's license, or passport. Place the document on a dark, well-lit surface.",
  "Documento qui": "Document here",
  "Oppure carica una foto dalla galleria": "Or upload a photo from your gallery",
  "Sto analizzando…": "Analyzing…",
  "Verifico autenticità e leggo i dati anagrafici.": "I'm checking authenticity and reading the personal details.",
  "Scan in corso…": "Scanning…",
  "Documento rilevato": "Document detected",
  "Anti-contraffazione": "Anti-counterfeit check",
  "Estrazione dati": "Data extraction",
  "Ora un breve scan\ndel viso": "Now a quick\nface scan",
  "Stessa esperienza del Face ID dell'iPhone. Servono 10 secondi e un po' di luce — ti basterà ruotare lentamente la testa.": "Just like iPhone Face ID. It takes 10 seconds and a little light — simply turn your head slowly.",
  "💡 Suggerimento: togli occhiali da sole e cappello, mantieni il viso a circa 30 cm.": "💡 Tip: remove sunglasses and hats, and keep your face about 30 cm away.",
  "Muovi lentamente\nla testa in cerchio": "Slowly move\nyour head in a circle",
  "Continua così…": "Keep going…",
  "Perfetto, fatto!": "Perfect, all done!",
  "Profilo creato": "Profile created",
  "Identità verificata": "Identity verified",
  "Bastano un paio di dati anagrafici e potrai iniziare a monitorarne la salute con Palm.": "Just a couple of basic details and you'll be ready to start tracking their health with Palm.",
  "Tutto in regola. Ora puoi continuare con i dati anagrafici e sanitari della persona.": "Everything checks out. You can now continue with the person's personal and health details.",
  "Prossimi passi": "Next steps",
  "Dati anagrafici di base": "Basic personal details",
  "Condizioni e terapie attive": "Conditions and active treatments",
  "Documenti medici (opzionale)": "Medical documents (optional)",
  "Torna alla home": "Back to home",
  "Demo Palm — il profilo non viene salvato": "Palm demo — this profile is not saved",
};

const useAddProfileT = () => {
  const { lang } = useLanguage();
  return (key: string) => (lang === "en" ? ADD_PROFILE_EN[key] ?? key : key);
};

const AddProfile = () => {
  const nav = useNavigate();
  const t = useAddProfileT();
  const [relation, setRelation] = useState<Relation | null>(null);
  const [step, setStep] = useState<Step>("relation");

  const goNext = () => {
    if (step === "relation" && relation) {
      setStep("consent");
    } else if (step === "consent") setStep("id-intro");
    else if (step === "id-intro") setStep("id-scanning");
    else if (step === "guardian-doc-intro") setStep("guardian-doc-scanning");
    else if (step === "face-intro") setStep("face-scanning");
  };

  // Auto-advance scanning steps
  useEffect(() => {
    if (step === "id-scanning") {
      // For child relation we go ID → guardian doc → face. Parents/other skip the guardian-doc step.
      const next: Step = relation === "child" ? "guardian-doc-intro" : "face-intro";
      const t = setTimeout(() => setStep(next), 2400);
      return () => clearTimeout(t);
    }
    if (step === "guardian-doc-scanning") {
      const t = setTimeout(() => setStep("face-intro"), 2400);
      return () => clearTimeout(t);
    }
    if (step === "face-scanning") {
      const t = setTimeout(() => setStep("done"), 3200);
      return () => clearTimeout(t);
    }
  }, [step, relation]);

  return (
    <PhoneShell showNav={false} showChat={false} background="gradient-hero">
      <div className="relative min-h-full px-6 pt-12 pb-8 flex flex-col" data-palm-no-translate>
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => (step === "relation" ? nav("/app") : setStep("relation"))}
            className="h-10 w-10 rounded-full bg-white/70 flex items-center justify-center shadow-soft"
            aria-label={t("Indietro")}
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground">
            {t("Nuovo profilo")}
          </div>
          <div className="w-10" />
        </div>

        {/* Progress dots */}
        {step !== "relation" && step !== "done" && (
          <ProgressDots step={step} relation={relation} />
        )}

        <div className="flex-1 mt-2">
          {step === "relation" && (
            <RelationStep relation={relation} onPick={setRelation} />
          )}
          {step === "consent" && relation && (
            <ConsentStep relation={relation} />
          )}
          {step === "id-intro" && <IdIntro />}
          {step === "id-scanning" && <IdScanning />}
          {step === "guardian-doc-intro" && <GuardianDocIntro />}
          {step === "guardian-doc-scanning" && <GuardianDocScanning />}
          {step === "face-intro" && <FaceIntro />}
          {step === "face-scanning" && <FaceScanning />}
          {step === "done" && <DoneStep onHome={() => nav("/app")} relation={relation} />}
        </div>

        {/* Bottom CTA */}
        {step !== "id-scanning" && step !== "face-scanning" && step !== "guardian-doc-scanning" && step !== "done" && (
          <button
            disabled={step === "relation" && !relation}
            onClick={goNext}
            className="mt-4 w-full h-14 rounded-2xl bg-foreground text-background font-display text-lg font-semibold shadow-card transition-transform active:scale-[0.98] disabled:opacity-40"
          >
            {step === "relation"
              ? t("Procedi con la verifica →")
              : step === "consent"
              ? relation === "child"
                ? t("Procedi con la verifica")
                : t("Ho il suo consenso, continua")
              : step === "id-intro"
              ? t("Inquadra il documento")
              : step === "guardian-doc-intro"
              ? t("Carica il documento di tutela")
              : t("Inizia il riconoscimento")}
          </button>
        )}
      </div>
    </PhoneShell>
  );
};

const ProgressDots = ({ step, relation }: { step: Step; relation: Relation | null }) => {
  // Stages: consent · id · (tutela for child only) · face
  const isChild = relation === "child";
  const total = isChild ? 4 : 3;
  let current = 0;
  if (step === "consent") current = 0;
  else if (step === "id-intro" || step === "id-scanning") current = 1;
  else if (step === "guardian-doc-intro" || step === "guardian-doc-scanning") current = 2;
  else if (step === "face-intro" || step === "face-scanning") current = isChild ? 3 : 2;
  return (
    <div className="flex items-center justify-center gap-1.5 mt-4">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-1.5 rounded-full transition-all",
            i === current ? "w-8 bg-foreground" : i < current ? "w-4 bg-foreground/60" : "w-4 bg-foreground/15",
          )}
        />
      ))}
    </div>
  );
};

const RelationStep = ({
  relation,
  onPick,
}: {
  relation: Relation | null;
  onPick: (r: Relation) => void;
}) => {
  const t = useAddProfileT();
  const options: { id: Relation; icon: typeof Baby; gradient: string }[] = [
    { id: "child", icon: Baby, gradient: "gradient-baby" },
    { id: "parent", icon: HeartHandshake, gradient: "gradient-warm" },
    { id: "other", icon: Users, gradient: "gradient-parent" },
  ];
  return (
    <div className="pt-4">
      <h1 className="font-display text-[1.75rem] font-semibold leading-tight whitespace-pre-line">
        {t("Chi vuoi\naggiungere?")}
      </h1>
      <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
        {t("Palm tratta la salute degli altri con la stessa cura della tua. Scegli il tipo di relazione: cambia solo il modo in cui verifichiamo il consenso.")}
      </p>

      <div className="mt-6 space-y-3">
        {options.map((opt) => {
          const copy = relationCopy[opt.id];
          const Icon = opt.icon;
          const selected = relation === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => onPick(opt.id)}
              className={cn(
                "w-full text-left rounded-3xl p-4 shadow-soft transition-all flex items-center gap-3 border-2",
                selected
                  ? "border-foreground bg-white"
                  : "border-transparent bg-white/70 active:scale-[0.99]",
              )}
            >
              <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center shrink-0", opt.gradient)}>
                <Icon className="h-6 w-6 text-foreground" strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-display text-base font-semibold leading-tight">{t(copy.title)}</div>
                <div className="text-[11px] text-muted-foreground mt-1 leading-snug">{t(copy.subtitle)}</div>
                {copy.needsKyc && (
                  <div className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-semibold text-primary">
                    <ShieldCheck className="h-2.5 w-2.5" /> {t("Richiede verifica identità")}
                  </div>
                )}
              </div>
              <div
                className={cn(
                  "h-6 w-6 rounded-full border-2 flex items-center justify-center shrink-0",
                  selected ? "border-foreground bg-foreground" : "border-foreground/20",
                )}
              >
                {selected && <Check className="h-3.5 w-3.5 text-background" strokeWidth={3} />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

const ConsentStep = ({ relation }: { relation: Relation }) => {
  const t = useAddProfileT();
  const isChild = relation === "child";
  return (
    <div className="pt-4">
      <div className="h-16 w-16 rounded-3xl gradient-dawn flex items-center justify-center shadow-soft">
        <ShieldCheck className="h-7 w-7 text-foreground" />
      </div>
      <h1 className="font-display text-[1.6rem] font-semibold leading-tight mt-4">
        <span className="whitespace-pre-line">
          {isChild ? t("Una verifica per\nproteggere il minore") : t("Una verifica veloce\nper proteggerlo davvero")}
        </span>
      </h1>
      <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
        {isChild
          ? t("Per i dati sanitari di un minore la legge richiede che chi li gestisce sia genitore o tutore legale. Bastano tre passaggi rapidi.")
          : t(`Dato che stai aggiungendo i dati di un'altra persona adulta — il ${relation === "parent" ? "tuo genitore" : "persona che assisti"} — ci servono due passaggi rapidi per assicurarci che tu abbia il suo consenso.`)}
      </p>

      <div className="mt-5 space-y-2.5">
        <ConsentRow icon={Camera} title={t("Il TUO documento d'identità")} detail={t("Carta d'identità o patente, fronte e retro")} />
        {isChild && (
          <ConsentRow
            icon={FileText}
            title={t("Documento di tutela")}
            detail={t("Stato di famiglia, certificato di nascita o decreto del tribunale")}
          />
        )}
        <ConsentRow icon={ScanFace} title={t("Riconoscimento facciale")} detail={t("Un breve scan in stile Face ID — durata 10 secondi")} />
        <ConsentRow icon={Sparkles} title={t("Conferma istantanea")} detail={t("Palm completa la verifica in pochi secondi")} />
      </div>

      <div className="mt-5 rounded-2xl bg-white/60 p-3 text-[11px] leading-relaxed text-foreground/70">
        {t("🔒 I documenti vengono cifrati end-to-end e usati solo per verificare l'identità. Non li condividiamo con nessuno.")}
      </div>
    </div>
  );
};

const GuardianDocIntro = () => {
  const t = useAddProfileT();
  return (
    <div className="pt-4">
      <div className="h-16 w-16 rounded-3xl gradient-sky flex items-center justify-center shadow-soft">
        <FileText className="h-7 w-7 text-foreground" />
      </div>
      <h1 className="font-display text-[1.6rem] font-semibold leading-tight mt-4">
        {t("Documento di tutela")}
      </h1>
      <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
        {t("Carica una foto di uno di questi documenti — ci basta a confermare che sei il genitore o tutore legale.")}
      </p>

      <div className="mt-5 space-y-2">
        <DocOption emoji="👨‍👩‍👧" title={t("Stato di famiglia")} detail={t("Rilasciato dal Comune (anche digitale)")} />
        <DocOption emoji="🍼" title={t("Certificato di nascita")} detail={t("Estratto integrale con paternità/maternità")} />
        <DocOption emoji="⚖️" title={t("Decreto di tutela")} detail={t("Solo se sei tutore non-genitore")} />
      </div>

      <div className="mt-5 relative aspect-[4/3] rounded-3xl bg-foreground/90 overflow-hidden flex items-center justify-center">
        <div className="relative w-[80%] aspect-[1.4] rounded-xl border-2 border-dashed border-white/50">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white/60 text-xs uppercase tracking-widest text-center px-2 whitespace-pre-line">
              {t("Inquadra il documento\ndi tutela")}
            </div>
          </div>
          {["top-left", "top-right", "bottom-left", "bottom-right"].map((c) => (
            <span
              key={c}
              className={cn(
                "absolute h-5 w-5 border-white",
                c.includes("top") ? "top-0 border-t-[3px]" : "bottom-0 border-b-[3px]",
                c.includes("left") ? "left-0 border-l-[3px]" : "right-0 border-r-[3px]",
              )}
            />
          ))}
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground">
        <Upload className="h-3.5 w-3.5" />
        <span>{t("Oppure carica un PDF dalla galleria")}</span>
      </div>
    </div>
  );
};

const DocOption = ({ emoji, title, detail }: { emoji: string; title: string; detail: string }) => (
  <div className="flex items-center gap-3 bg-white/80 rounded-2xl p-2.5 shadow-soft">
    <div className="h-10 w-10 rounded-xl bg-foreground/5 flex items-center justify-center text-xl shrink-0">
      {emoji}
    </div>
    <div className="flex-1">
      <div className="text-sm font-semibold leading-tight">{title}</div>
      <div className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{detail}</div>
    </div>
  </div>
);

const GuardianDocScanning = () => {
  const t = useAddProfileT();
  return (
    <div className="pt-4">
      <h1 className="font-display text-[1.6rem] font-semibold leading-tight">
        {t("Verifico la tutela…")}
      </h1>
      <p className="text-sm text-muted-foreground mt-2">
        {t("Confronto i tuoi dati con il documento e validità del rilascio.")}
      </p>

      <div className="mt-6 relative aspect-[4/3] rounded-3xl bg-foreground/90 overflow-hidden flex items-center justify-center">
        <div className="relative w-[80%] aspect-[1.4] rounded-xl border-2 border-primary/80 overflow-hidden bg-foreground/60">
          <div
            className="absolute inset-x-0 h-12 bg-gradient-to-b from-transparent via-primary/40 to-transparent"
            style={{ animation: "scan-sweep 1.6s ease-in-out infinite" }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-white/80 text-xs uppercase tracking-widest">
            {t("Lettura in corso…")}
          </div>
        </div>
      </div>

      <div className="mt-5 space-y-2">
        <ScanProgressRow label={t("Documento riconosciuto")} delay={0} />
        <ScanProgressRow label={t("Verifica firma del Comune")} delay={700} />
        <ScanProgressRow label={t("Match con il tuo nome")} delay={1400} />
      </div>
    </div>
  );
};

const ConsentRow = ({ icon: Icon, title, detail }: { icon: typeof Camera; title: string; detail: string }) => (
  <div className="flex items-start gap-3 bg-white/80 rounded-2xl p-3 shadow-soft">
    <div className="h-10 w-10 rounded-xl bg-foreground/5 flex items-center justify-center shrink-0">
      <Icon className="h-5 w-5 text-foreground" />
    </div>
    <div className="flex-1">
      <div className="text-sm font-semibold leading-tight">{title}</div>
      <div className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{detail}</div>
    </div>
  </div>
);

const IdIntro = () => {
  const t = useAddProfileT();
  return (
    <div className="pt-4">
      <div className="h-16 w-16 rounded-3xl gradient-warm flex items-center justify-center shadow-soft">
        <Camera className="h-7 w-7 text-foreground" />
      </div>
      <h1 className="font-display text-[1.6rem] font-semibold leading-tight mt-4">
        {t("Inquadra il documento")}
      </h1>
      <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
        {t("Carta d'identità, patente o passaporto. Posiziona il documento sopra una superficie scura e ben illuminata.")}
      </p>

      <div className="mt-6 relative aspect-[4/3] rounded-3xl bg-foreground/90 overflow-hidden flex items-center justify-center">
        <div className="relative w-[80%] aspect-[1.586] rounded-xl border-2 border-dashed border-white/50">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white/60 text-xs uppercase tracking-widest">{t("Documento qui")}</div>
          </div>
          {["top-left", "top-right", "bottom-left", "bottom-right"].map((c) => (
            <span
              key={c}
              className={cn(
                "absolute h-5 w-5 border-white",
                c.includes("top") ? "top-0 border-t-[3px]" : "bottom-0 border-b-[3px]",
                c.includes("left") ? "left-0 border-l-[3px]" : "right-0 border-r-[3px]",
              )}
            />
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-[11px] text-muted-foreground">
        <Upload className="h-3.5 w-3.5" />
        <span>{t("Oppure carica una foto dalla galleria")}</span>
      </div>
    </div>
  );
};

const IdScanning = () => {
  const t = useAddProfileT();
  return (
    <div className="pt-4">
      <h1 className="font-display text-[1.6rem] font-semibold leading-tight">
        {t("Sto analizzando…")}
      </h1>
      <p className="text-sm text-muted-foreground mt-2">
        {t("Verifico autenticità e leggo i dati anagrafici.")}
      </p>

      <div className="mt-6 relative aspect-[4/3] rounded-3xl bg-foreground/90 overflow-hidden flex items-center justify-center">
        <div className="relative w-[80%] aspect-[1.586] rounded-xl border-2 border-primary/80 overflow-hidden bg-foreground/60">
          <div
            className="absolute inset-x-0 h-12 bg-gradient-to-b from-transparent via-primary/40 to-transparent"
            style={{ animation: "scan-sweep 1.6s ease-in-out infinite" }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-white/80 text-xs uppercase tracking-widest">
            {t("Scan in corso…")}
          </div>
        </div>
      </div>

      <div className="mt-5 space-y-2">
        <ScanProgressRow label={t("Documento rilevato")} delay={0} />
        <ScanProgressRow label={t("Anti-contraffazione")} delay={700} />
        <ScanProgressRow label={t("Estrazione dati")} delay={1400} />
      </div>

      <style>{`
        @keyframes scan-sweep {
          0% { top: 0; opacity: 0; }
          15% { opacity: 1; }
          85% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};

const ScanProgressRow = ({ label, delay }: { label: string; delay: number }) => {
  const [done, setDone] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setDone(true), delay + 600);
    return () => clearTimeout(t);
  }, [delay]);
  return (
    <div className="flex items-center gap-3 bg-white/70 rounded-xl px-3 py-2 shadow-soft">
      <div
        className={cn(
          "h-5 w-5 rounded-full flex items-center justify-center shrink-0 transition-all",
          done ? "bg-status-good" : "bg-foreground/10",
        )}
      >
        {done ? (
          <Check className="h-3 w-3 text-white" strokeWidth={3} />
        ) : (
          <span className="h-1.5 w-1.5 rounded-full bg-foreground/40 animate-pulse" />
        )}
      </div>
      <span className={cn("text-xs", done ? "text-foreground font-medium" : "text-muted-foreground")}>{label}</span>
    </div>
  );
};

const FaceIntro = () => {
  const t = useAddProfileT();
  return (
    <div className="pt-4">
      <div className="h-16 w-16 rounded-3xl gradient-mint flex items-center justify-center shadow-soft">
        <ScanFace className="h-7 w-7 text-foreground" />
      </div>
      <h1 className="font-display text-[1.6rem] font-semibold leading-tight mt-4">
        <span className="whitespace-pre-line">{t("Ora un breve scan\ndel viso")}</span>
      </h1>
      <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
        {t("Stessa esperienza del Face ID dell'iPhone. Servono 10 secondi e un po' di luce — ti basterà ruotare lentamente la testa.")}
      </p>

      <div className="mt-6 flex items-center justify-center">
        <div className="relative h-56 w-56 rounded-full border-2 border-dashed border-foreground/25 flex items-center justify-center">
          <div className="h-44 w-44 rounded-full gradient-dawn flex items-center justify-center shadow-glow">
            <ScanFace className="h-16 w-16 text-foreground/80" strokeWidth={1.5} />
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl bg-white/60 p-3 text-[11px] leading-relaxed text-foreground/70">
        {t("💡 Suggerimento: togli occhiali da sole e cappello, mantieni il viso a circa 30 cm.")}
      </div>
    </div>
  );
};

const FaceScanning = () => {
  const t = useAddProfileT();
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      i += 4;
      setProgress(Math.min(i, 100));
      if (i >= 100) clearInterval(id);
    }, 100);
    return () => clearInterval(id);
  }, []);

  // Build the 32 ticks of the iOS-style ring
  const ticks = Array.from({ length: 32 });

  return (
    <div className="pt-4 flex flex-col items-center">
      <h1 className="font-display text-[1.6rem] font-semibold leading-tight text-center">
        <span className="whitespace-pre-line">{t("Muovi lentamente\nla testa in cerchio")}</span>
      </h1>
      <p className="text-sm text-muted-foreground mt-2 text-center">
        {progress < 100 ? t("Continua così…") : t("Perfetto, fatto!")}
      </p>

      <div className="mt-6 relative h-64 w-64">
        {/* Ring of ticks (iOS Face ID style) */}
        {ticks.map((_, i) => {
          const filled = (i / ticks.length) * 100 < progress;
          const angle = (i / ticks.length) * 360;
          return (
            <span
              key={i}
              className={cn(
                "absolute left-1/2 top-1/2 h-4 w-1 rounded-full -translate-x-1/2 origin-[50%_128px] transition-colors duration-200",
                filled ? "bg-status-good" : "bg-foreground/15",
              )}
              style={{ transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-118px)` }}
            />
          );
        })}
        {/* Center face placeholder */}
        <div className="absolute inset-8 rounded-full gradient-dawn flex items-center justify-center shadow-glow">
          <ScanFace
            className={cn("h-20 w-20 transition-all", progress >= 100 ? "text-status-good" : "text-foreground/70")}
            strokeWidth={1.5}
          />
        </div>
      </div>
    </div>
  );
};

const DoneStep = ({ onHome, relation }: { onHome: () => void; relation: Relation | null }) => {
  const t = useAddProfileT();
  return (
    <div className="pt-12 flex flex-col items-center text-center">
      <div className="h-24 w-24 rounded-full gradient-mint flex items-center justify-center shadow-card animate-scale-bounce">
        <Check className="h-12 w-12 text-foreground" strokeWidth={3} />
      </div>
      <h1 className="font-display text-[1.75rem] font-semibold leading-tight mt-5">
        {relation === "child" ? t("Profilo creato") : t("Identità verificata")}
      </h1>
      <p className="text-sm text-muted-foreground mt-3 leading-relaxed max-w-xs">
        {relation === "child"
          ? t("Bastano un paio di dati anagrafici e potrai iniziare a monitorarne la salute con Palm.")
          : t("Tutto in regola. Ora puoi continuare con i dati anagrafici e sanitari della persona.")}
      </p>

      <div className="mt-6 w-full bg-white/70 rounded-3xl p-4 shadow-soft text-left">
        <div className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">{t("Prossimi passi")}</div>
        <ul className="mt-2 space-y-1.5 text-xs text-foreground/80">
          <li className="flex gap-2"><span className="text-status-good">✓</span> {t("Identità verificata")}</li>
          <li className="flex gap-2"><span className="text-foreground/40">•</span> {t("Dati anagrafici di base")}</li>
          <li className="flex gap-2"><span className="text-foreground/40">•</span> {t("Condizioni e terapie attive")}</li>
          <li className="flex gap-2"><span className="text-foreground/40">•</span> {t("Documenti medici (opzionale)")}</li>
        </ul>
      </div>

      <button
        onClick={onHome}
        className="mt-6 w-full h-14 rounded-2xl bg-foreground text-background font-display text-lg font-semibold shadow-card"
      >
        {t("Torna alla home")}
      </button>
      <div className="mt-2 text-[11px] text-muted-foreground flex items-center gap-1">
        <Sparkles className="h-3 w-3" /> {t("Demo Palm — il profilo non viene salvato")}
      </div>
    </div>
  );
};

export default AddProfile;