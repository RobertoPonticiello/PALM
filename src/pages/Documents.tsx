import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Upload, FileText, Sparkles, ChevronRight, FlaskConical, Pill, Baby, Heart, Activity, Brain, MessageCircle, FileDown, Lock } from "lucide-react";
import { PhoneShell } from "@/components/PhoneShell";
import { dischargeLetter, bloodTest, neuroExam, profileDocuments, ProfileDoc, docSummaries } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { useActiveProfile } from "@/hooks/useActiveProfile";
import { useT } from "@/lib/i18n";

const iconMap = {
  file: <FileText className="h-5 w-5" />,
  flask: <FlaskConical className="h-5 w-5" />,
  brain: <Brain className="h-5 w-5" />,
  heart: <Heart className="h-5 w-5" />,
  pill: <Pill className="h-5 w-5" />,
} as const;

const headerCopy = {
  matteo: { title: "Tutto, in un unico posto", body: "Carica qualsiasi foto o documento contenente informazioni sanitarie. Palm pensa a tutto il resto." },
  chiara: { title: "Tutto, in un unico posto", body: "Carica qualsiasi foto o documento contenente informazioni sanitarie. Palm pensa a tutto il resto." },
  riccardo: { title: "Tutto, in un unico posto", body: "Carica qualsiasi foto o documento contenente informazioni sanitarie. Palm pensa a tutto il resto." },
} as const;

const Documents = () => {
  const nav = useNavigate();
  const { id, profile } = useActiveProfile();
  const { t } = useT(id);
  const docs = profileDocuments[id];
  const [opened, setOpened] = useState<string | null>(null);
  const [tab, setTab] = useState<"explained" | "originals">("explained");

  // Open the Palm chat with a prefilled question about the currently opened doc.
  const askPalmAbout = (docTitle: string) => {
    const prefill = `Spiegami i valori della « ${docTitle} » e dimmi se c'è qualcosa a cui devo stare attenta.`;
    sessionStorage.setItem("palm:chat-prefill", prefill);
    window.dispatchEvent(new CustomEvent("palm:open-chat"));
  };

  /* ---------- DISCHARGE LETTER (Matteo) ---------- */
  if (opened === "discharge") {
    return (
      <PhoneShell>
        <div className="px-5 pt-14 pb-6">
          <DocHeader title="Lettera di dimissione" onBack={() => setOpened(null)} />
          <AiSummary text="9 farmaci, 3 problemi attivi, piano nutrizionale completo" sub="Tutto sincronizzato sul profilo di Matteo." />

          <div className="mt-5 bg-card rounded-3xl p-4 shadow-soft">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Da</div>
            <div className="font-display text-lg font-semibold mt-0.5">{dischargeLetter.hospital}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{dischargeLetter.date}</div>
          </div>

          <Section icon={<Heart className="h-4 w-4" />} title="Anamnesi" tone="gradient-baby">
            <p className="text-sm text-foreground/80 leading-relaxed">{dischargeLetter.history}</p>
          </Section>

          <Section icon={<Activity className="h-4 w-4" />} title="Crescita alla dimissione" tone="gradient-mint" badge={dischargeLetter.growth.weight.ref}>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Peso", ...dischargeLetter.growth.weight },
                { label: "Lunghezza", ...dischargeLetter.growth.length },
                { label: "Testa", ...dischargeLetter.growth.head },
              ].map((m) => (
                <div key={m.label} className="bg-white/60 rounded-2xl p-3">
                  <div className="text-[10px] uppercase tracking-wider font-semibold text-foreground/60">{m.label}</div>
                  <div className="font-display text-base font-semibold mt-1">{m.value}</div>
                  <div className="text-[10px] text-foreground/60 mt-0.5">{m.percentile}° perc.</div>
                </div>
              ))}
            </div>
          </Section>

          <Section icon={<FlaskConical className="h-4 w-4" />} title="Esami strumentali" tone="gradient-sky">
            <div className="grid grid-cols-2 gap-2">
              {dischargeLetter.labs.map((l) => (
                <div key={l} className="bg-white/60 rounded-xl px-3 py-2 text-xs font-medium">{l}</div>
              ))}
            </div>
          </Section>

          <Section icon={<Pill className="h-4 w-4" />} title="Terapia" tone="gradient-warm">
            <div className="space-y-2">
              {dischargeLetter.medications.map((m) => (
                <div key={m.name} className="bg-white/60 rounded-2xl p-3 flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-white flex items-center justify-center text-base">💊</div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold">{m.name}</div>
                    <div className="text-[11px] text-muted-foreground">{m.dose} · {m.freq}</div>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section icon={<Baby className="h-4 w-4" />} title="Piano nutrizionale" tone="gradient-baby">
            <p className="text-sm text-foreground/80 leading-relaxed">{dischargeLetter.nutrition.qualitative}</p>
            <div className="bg-white/60 rounded-2xl p-3 font-mono text-xs leading-relaxed mt-2">
              {dischargeLetter.nutrition.quantitative}
            </div>
          </Section>
          <AskPalmCta onClick={() => askPalmAbout("Lettera di dimissione TIN")} />
          <OriginalFileCard />
        </div>
      </PhoneShell>
    );
  }

  /* ---------- BLOOD TEST (Matteo) ---------- */
  if (opened === "blood") {
    return (
      <PhoneShell>
        <div className="px-5 pt-14 pb-6">
          <DocHeader title="Esami del sangue" onBack={() => setOpened(null)} />
          <AiSummary text={bloodTest.summary} sub="Nessun valore critico. Confrontato con la dimissione." />

          <div className="mt-5 bg-card rounded-3xl p-4 shadow-soft">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Da</div>
            <div className="font-display text-lg font-semibold mt-0.5">{bloodTest.hospital}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{bloodTest.date}</div>
          </div>

          <Section icon={<FlaskConical className="h-4 w-4" />} title="Risultati" tone="gradient-sky">
            <div className="space-y-1.5">
              {bloodTest.results.map((r) => (
                <div key={r.name} className="bg-white/60 rounded-xl px-3 py-2.5 flex items-center gap-3">
                  <div className={cn(
                    "h-2 w-2 rounded-full shrink-0",
                    r.flag === "ok" ? "bg-status-good" : r.flag === "low" ? "bg-status-warn" : "bg-status-bad",
                  )} />
                  <div className="flex-1 text-sm font-medium">{r.name}</div>
                  <div className="font-mono text-sm font-semibold">{r.value} <span className="text-[10px] text-muted-foreground font-normal">{r.unit}</span></div>
                  <div className="text-[10px] text-muted-foreground w-16 text-right">{r.range}</div>
                </div>
              ))}
            </div>
          </Section>

          <Section icon={<Sparkles className="h-4 w-4" />} title="Conclusioni" tone="gradient-mint">
            <p className="text-sm text-foreground/80 leading-relaxed">{bloodTest.conclusion}</p>
          </Section>
          <AskPalmCta onClick={() => askPalmAbout("Emocromo di controllo")} />
          <OriginalFileCard />
        </div>
      </PhoneShell>
    );
  }

  /* ---------- NEURO EXAM (Matteo) ---------- */
  if (opened === "neuro") {
    return (
      <PhoneShell>
        <div className="px-5 pt-14 pb-6">
          <DocHeader title="Visita neurologica" onBack={() => setOpened(null)} />
          <AiSummary text={neuroExam.summary} sub="Sviluppo nella norma per età corretta." />

          <div className="mt-5 bg-card rounded-3xl p-4 shadow-soft">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Da</div>
            <div className="font-display text-lg font-semibold mt-0.5">{neuroExam.hospital}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{neuroExam.date}</div>
          </div>

          <Section icon={<Brain className="h-4 w-4" />} title="Riscontri clinici" tone="gradient-parent">
            <div className="space-y-1.5">
              {neuroExam.findings.map((f) => (
                <div key={f.area} className="bg-white/60 rounded-xl px-3 py-2.5 flex items-start gap-3">
                  <div className="h-2 w-2 rounded-full bg-status-good shrink-0 mt-1.5" />
                  <div className="flex-1">
                    <div className="text-xs font-semibold">{f.area}</div>
                    <div className="text-[11px] text-foreground/70">{f.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section icon={<Activity className="h-4 w-4" />} title="Raccomandazioni" tone="gradient-warm">
            <ul className="space-y-1.5">
              {neuroExam.recommendations.map((r) => (
                <li key={r} className="text-sm flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-foreground/60 shrink-0" />
                  {r}
                </li>
              ))}
            </ul>
          </Section>

          <Section icon={<Sparkles className="h-4 w-4" />} title="Conclusioni" tone="gradient-mint">
            <p className="text-sm text-foreground/80 leading-relaxed">{neuroExam.conclusion}</p>
          </Section>
          <AskPalmCta onClick={() => askPalmAbout("Visita neurologica")} />
          <OriginalFileCard />
        </div>
      </PhoneShell>
    );
  }

  /* ---------- Generic doc preview (Chiara/Riccardo) ---------- */
  if (opened) {
    const doc = docs.find((d) => d.id === opened);
    if (doc) return <GenericDocView doc={doc} onBack={() => setOpened(null)} onAskPalm={() => askPalmAbout(doc.title)} />;
  }

  /* ---------- LIBRARY ---------- */
  const copy = headerCopy[id];
  return (
    <PhoneShell>
      <div className="px-5 pt-14 pb-6">
        <div className="flex items-center justify-between mb-5">
          <button onClick={() => nav(-1)} className="h-10 w-10 rounded-full glass flex items-center justify-center">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="text-center">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">{t("Libreria")}</div>
            <div className="font-display text-base font-semibold">{t(`Documenti · ${profile.name}`)}</div>
          </div>
          <div className="w-10" />
        </div>

        <h1 className="font-display text-3xl font-semibold leading-tight mt-2">{t(copy.title)}</h1>
        <p className="text-sm text-muted-foreground mt-2">{t(copy.body)}</p>

        <button className="mt-5 w-full rounded-3xl border-2 border-dashed border-primary/30 bg-white/40 p-6 flex flex-col items-center gap-2 transition-all active:scale-[0.99]">
          <div className="h-14 w-14 rounded-2xl gradient-dawn flex items-center justify-center shadow-soft">
            <Upload className="h-6 w-6" />
          </div>
          <div className="font-display text-lg font-semibold mt-1">{t("Carica un documento")}</div>
          <div className="text-xs text-muted-foreground text-center max-w-[18rem]">
            {t("Carica qui PDF degli esami, foto di documenti cartacei, scans o screenshots dal telefono.")}
          </div>
        </button>

        {/* Tab switcher: Spiegati da Palm  ⇄  Originali */}
        <div className="mt-6 grid grid-cols-2 gap-1 p-1 rounded-2xl bg-muted/60">
          <button
            onClick={() => setTab("explained")}
            className={cn(
              "flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all",
              tab === "explained"
                ? "bg-card text-foreground shadow-soft"
                : "text-muted-foreground",
            )}
          >
            <Sparkles className="h-3.5 w-3.5" />
            {t("Spiegati da Palm")}
          </button>
          <button
            onClick={() => setTab("originals")}
            className={cn(
              "flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all",
              tab === "originals"
                ? "bg-card text-foreground shadow-soft"
                : "text-muted-foreground",
            )}
          >
            <Lock className="h-3.5 w-3.5" />
            {t("Originali")} <span className="opacity-60">· {docs.length}</span>
          </button>
        </div>

        {tab === "explained" && (
          <div className="mt-3 space-y-2.5 animate-fade-in">
            <p className="px-1 text-[11px] text-muted-foreground leading-snug">
              {t("Palm ti aiuta a comprendere meglio cosa dicono i tuoi esami e referti.")}
            </p>
            {docs.map((d) => (
              <DocCard
                key={d.id}
                onClick={() => setOpened(d.id)}
                icon={iconMap[d.icon]}
                tone={d.tone}
                title={t(d.title)}
                sub={t(d.sub)}
                badge={t(d.badge)}
              />
            ))}
          </div>
        )}

        {tab === "originals" && (
          <div className="mt-3 animate-fade-in">
            <p className="px-1 text-[11px] text-muted-foreground leading-snug mb-2">
              {t("Qui trovi i tuoi file originali. Scaricali o condividili in un tap.")}
            </p>
            <div className="rounded-3xl bg-card shadow-soft overflow-hidden">
              {docs.map((d, i) => (
                <button
                  key={`orig-${d.id}`}
                  onClick={() => setOpened(d.id)}
                  className={cn(
                    "w-full px-4 py-3 flex items-center gap-3 text-left transition-colors active:bg-muted/50",
                    i !== docs.length - 1 && "border-b border-border",
                  )}
                >
                  <div className="h-9 w-9 rounded-xl bg-muted/50 flex items-center justify-center shrink-0">
                    <FileText className="h-4 w-4 text-foreground/70" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{d.title}.pdf</div>
                    <div className="text-[10px] text-muted-foreground">{d.sub}</div>
                  </div>
                  <FileDown className="h-4 w-4 text-muted-foreground shrink-0" />
                </button>
              ))}
            </div>
            <p className="mt-2 px-2 text-[10.5px] text-muted-foreground leading-snug">
              🔒 {t("I file originali sono custoditi cifrati.")}
            </p>
          </div>
        )}
      </div>
    </PhoneShell>
  );
};

const GenericDocView = ({ doc, onBack, onAskPalm }: { doc: ProfileDoc; onBack: () => void; onAskPalm: () => void }) => {
  const summary = docSummaries[doc.id];
  return (
      <PhoneShell>
        <div className="px-5 pt-14 pb-6">
        <DocHeader title={doc.title} onBack={onBack} />
        <AiSummary
          text={summary?.headline ?? "Palm ha estratto i dati chiave da questo documento."}
          sub={summary ? `${summary.source} · ${summary.date}` : `${doc.sub} · indicizzato per Palm.`}
        />

        {summary && (
          <>
            <Section icon={<FlaskConical className="h-4 w-4" />} title="Valori chiave" tone="gradient-sky">
              <div className="space-y-1.5">
                {summary.bullets.map((b) => (
                  <div key={b.label} className="bg-white/60 rounded-xl px-3 py-2.5 flex items-center gap-3">
                    <div className={cn(
                      "h-2 w-2 rounded-full shrink-0",
                      b.tone === "good" ? "bg-status-good" : b.tone === "warn" ? "bg-status-warn" : b.tone === "bad" ? "bg-status-bad" : "bg-muted-foreground",
                    )} />
                    <div className="flex-1 text-xs font-medium">{b.label}</div>
                    <div className="font-mono text-[11px] font-semibold text-right">{b.value}</div>
                  </div>
                ))}
              </div>
            </Section>

            <Section icon={<Sparkles className="h-4 w-4" />} title="Conclusioni di Palm" tone="gradient-mint">
              <p className="text-sm text-foreground/80 leading-relaxed">{summary.conclusion}</p>
            </Section>
          </>
        )}

        <AskPalmCta onClick={onAskPalm} />
        <OriginalFileCard />
      </div>
    </PhoneShell>
  );
};

const DocHeader = ({ title, onBack }: { title: string; onBack: () => void }) => (
  <div className="flex items-center justify-between mb-4">
    <button onClick={onBack} className="h-10 w-10 rounded-full glass flex items-center justify-center">
      <ChevronLeft className="h-5 w-5" />
    </button>
    <div className="text-center">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Documento</div>
      <div className="font-display text-base font-semibold">{title}</div>
    </div>
    <div className="w-10" />
  </div>
);

const AiSummary = ({ text, sub }: { text: string; sub: string }) => (
  <div className="rounded-3xl gradient-dawn p-4 shadow-card relative overflow-hidden">
    <div className="absolute -top-4 -right-4 h-20 w-20 rounded-full bg-white/40 blur-xl" />
    <div className="flex items-start gap-3 relative">
      <div className="h-9 w-9 rounded-2xl bg-white/70 flex items-center justify-center shrink-0">
        <Sparkles className="h-5 w-5" />
      </div>
      <div>
        <div className="text-[10px] uppercase tracking-widest font-bold text-foreground/70">Palm ha estratto</div>
        <div className="font-display text-base font-semibold leading-tight mt-1">{text}</div>
        <div className="text-xs text-foreground/70 mt-1">{sub}</div>
      </div>
    </div>
  </div>
);

const DocCard = ({ icon, tone, title, sub, badge, onClick }: any) => (
  <button onClick={onClick} className="w-full bg-card rounded-3xl p-4 shadow-soft flex items-center gap-3 text-left transition-transform active:scale-[0.99]">
    <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center shrink-0", tone)}>
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <div className="font-semibold text-sm truncate">{title}</div>
      <div className="text-[11px] text-muted-foreground">{sub}</div>
      <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-status-good/15 text-[10px] font-bold uppercase tracking-wider text-status-good">
        <Sparkles className="h-2.5 w-2.5" /> {badge}
      </div>
    </div>
    <ChevronRight className="h-4 w-4 text-muted-foreground" />
  </button>
);

const Section = ({ icon, title, tone, badge, children }: { icon: React.ReactNode; title: string; tone: string; badge?: string; children: React.ReactNode }) => (
  <div className={cn("mt-4 rounded-3xl p-4 shadow-soft", tone)}>
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-2">
        <div className="h-7 w-7 rounded-xl bg-white/60 flex items-center justify-center">{icon}</div>
        <div className="font-display text-base font-semibold">{title}</div>
      </div>
      {badge && <span className="px-2 py-0.5 rounded-full bg-white/60 text-[10px] font-bold uppercase tracking-wider">{badge}</span>}
    </div>
    {children}
  </div>
);

/* "Chiedi a Palm su questi valori" CTA — used inside every doc view. */
const ASK_EXAMPLES: Record<string, string> = {
  matteo: "Es. « il peso di Matteo è in linea con la sua età corretta? »",
  chiara: "Es. « la mia ferritina è troppo bassa? »",
  riccardo: "Es. « la pressione di papà è sotto controllo? »",
};
const AskPalmCta = ({ onClick }: { onClick: () => void }) => {
  const { id } = useActiveProfile();
  const example = ASK_EXAMPLES[id] ?? ASK_EXAMPLES.matteo;
  return (
  <button
    onClick={onClick}
    className="mt-5 w-full rounded-3xl gradient-dawn p-4 shadow-card flex items-center gap-3 text-left active:scale-[0.99] transition-transform"
  >
    <div className="h-12 w-12 rounded-2xl bg-white/70 flex items-center justify-center shrink-0">
      <MessageCircle className="h-5 w-5 text-foreground" />
    </div>
    <div className="flex-1">
      <div className="text-[10px] uppercase tracking-widest font-bold text-foreground/70">Hai una domanda?</div>
      <div className="font-display text-base font-semibold leading-tight mt-0.5">Chiedi a Palm su questi valori</div>
      <div className="text-[11px] text-foreground/70 mt-0.5">{example}</div>
    </div>
    <ChevronRight className="h-4 w-4 text-foreground/60 shrink-0" />
  </button>
  );
};

/* "Originale custodito" mini-card — appears at the bottom of every doc view. */
const OriginalFileCard = () => (
  <div className="mt-3 rounded-3xl p-4 shadow-soft bg-card flex items-center gap-3">
    <div className="h-10 w-10 rounded-xl bg-muted/50 flex items-center justify-center shrink-0">
      <Lock className="h-4 w-4 text-foreground/70" />
    </div>
    <div className="flex-1">
      <div className="text-[10px] uppercase tracking-widest font-bold text-foreground/60">Originale custodito</div>
      <div className="text-xs text-foreground/80 leading-snug mt-0.5">Il PDF originale è cifrato e sempre tuo. Scaricalo o condividilo con un medico in un tap.</div>
    </div>
    <button className="shrink-0 h-9 px-3 rounded-full bg-foreground text-background text-[11px] font-semibold flex items-center gap-1.5">
      <FileDown className="h-3.5 w-3.5" /> PDF
    </button>
  </div>
);

export default Documents;
