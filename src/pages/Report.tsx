import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Share2, AlertTriangle, TrendingUp, Activity, Stethoscope, Pill, Heart, ShieldCheck, Users, Link2, FileText, Bell } from "lucide-react";
import { PhoneShell } from "@/components/PhoneShell";
import { childProfile, anamnesis, adultReportChiara, geriatricReportRiccardo } from "@/lib/mockData";
import { generateDoctorPdf, generateAdultPdf, generateGeriatricPdf, type ReportLang } from "@/lib/generateDoctorPdf";
import { toast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/useLanguage";
import { useActiveProfile } from "@/hooks/useActiveProfile";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";

const Report = () => {
  const nav = useNavigate();
  const { id } = useActiveProfile();
  const { t } = useT(id);
  const { lang } = useLanguage();
  const [pdfLang, setPdfLang] = useState<ReportLang>((typeof window!=="undefined" && localStorage.getItem("palm.lang")==="en") ? "en" : "it");

  useEffect(() => {
    setPdfLang(lang === "en" ? "en" : "it");
  }, [lang]);

  if (id === "chiara") return <AdultReport onBack={() => nav(-1)} />;
  if (id === "riccardo") return <GeriatricReport onBack={() => nav(-1)} />;
  if (id === "sofia") return <SofiaPlaceholder onBack={() => nav(-1)} />;

  return (
    <PhoneShell>
      <div className="px-5 pt-14 pb-6">
        <div className="flex items-center justify-between mb-5">
          <button onClick={() => nav(-1)} className="h-10 w-10 rounded-full glass flex items-center justify-center">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="text-center">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">{t("Per la Dr.ssa")} {childProfile.pediatrician.replace(/^Dr\.ssa\s*/, "")}</div>
            <div className="font-display text-base font-semibold">{t("Briefing visita")}</div>
          </div>
          <button className="h-10 w-10 rounded-full glass flex items-center justify-center">
            <Share2 className="h-4 w-4" />
          </button>
        </div>

        {/* Mode explainer */}
        <div className="mb-3 rounded-2xl bg-muted/60 p-3 flex items-start gap-2.5">
          <Link2 className="h-3.5 w-3.5 mt-0.5 shrink-0 text-muted-foreground" />
          <div className="text-[11px] text-muted-foreground leading-snug">
            <span className="font-semibold text-foreground">{t("Vista link completo")}</span> — {t("questo è ciò che vede il pediatra aprendo il link condiviso. Per la stampa o l'invio email, esporta il")} <span className="font-semibold text-foreground">{t("PDF at-a-glance")}</span> {t("in fondo.")}
          </div>
        </div>

        {/* Header card */}
        <div className="rounded-[2rem] gradient-parent p-5 shadow-card relative overflow-hidden">
          <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-white/40 blur-2xl" />
          <div className="relative flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-white/70 flex items-center justify-center text-2xl shadow-soft">
              <Stethoscope className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <div className="text-[10px] uppercase tracking-widest font-bold text-foreground/70">{t("Riassunto in 30 secondi")}</div>
              <div className="font-display text-2xl font-semibold leading-tight">{t(childProfile.name)}, 2m 3g</div>
              <div className="text-xs text-foreground/70 mt-0.5">{t("Visita · 2 mag 2025 · 16:00")}</div>
            </div>
          </div>
          <div className="mt-4 text-sm text-foreground/80 leading-relaxed bg-white/40 rounded-2xl p-3">
            <span className="font-semibold">{t("In sintesi —")} </span>
            {t("Crescita costante in traiettoria. Tolleranza alimentare ottima.")} <span className="font-semibold text-status-warn">{t("2 episodi di rigurgito ↑ questa settimana")}</span>{t(", per il resto nulla da segnalare. Aderenza terapia 96%.")}
          </div>
        </div>

        {/* Key flags */}
        <div className="mt-5 rounded-3xl bg-card p-4 shadow-soft">
          <div className="font-display text-base font-semibold mb-3">{t("Punti di attenzione")}</div>
          <div className="space-y-2">
            <FlagRow tone="warn" title={t("Rigurgiti in aumento")} detail={t("6 negli ultimi 7g vs 2 settimana precedente")} />
            <FlagRow tone="good" title={t("Aumento di peso costante")} detail={t("+25 g/giorno · nel target")} />
            <FlagRow tone="good" title={t("Aderenza Vitamina D")} detail={t("7/7 giorni")} />
          </div>
        </div>

        {/* Anamnesi essenziale (extended) */}
        <Card title={t("Anamnesi essenziale")} icon={<ShieldCheck className="h-4 w-4" />}>
          <div className="space-y-1.5">
            <AnamnesisRow label={t("Limitazioni attività vs coetanei")} present={anamnesis.dailyLimitations.has} note={anamnesis.dailyLimitations.note} yesLabel={t("Sì")} noLabel={t("No")} />
            <AnamnesisRow label={t("Trapianti")} present={anamnesis.transplants.has} note={anamnesis.transplants.note} yesLabel={t("Sì")} noLabel={t("No")} />
            <AnamnesisRow label={t("Dispositivi medici / ausili")} present={anamnesis.medicalDevices.has} note={anamnesis.medicalDevices.note} yesLabel={t("Sì")} noLabel={t("No")} />
            <AnamnesisRow label={t("Allergie (farmaci, alimenti, insetti)")} present={anamnesis.allergies.has} note={anamnesis.allergies.note} yesLabel={t("Sì")} noLabel={t("No")} />
            <AnamnesisRow label={t("Patologie importanti (asma, epilessia, diabete, cardiopatie)")} present={anamnesis.majorConditions.has} note={anamnesis.majorConditions.note} yesLabel={t("Sì")} noLabel={t("No")} />
          </div>
        </Card>

        {/* Terapie regolari */}
        <Card title={t("Farmaci e terapie regolari")} icon={<Pill className="h-4 w-4" />}>
          <ul className="space-y-1.5">
            {anamnesis.regularTherapies.items.map((t) => (
              <li key={t} className="text-sm flex items-start gap-2 bg-muted/60 rounded-xl px-3 py-2">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-foreground/60 shrink-0" />
                {t}
              </li>
            ))}
          </ul>
        </Card>

        {/* Patologie familiari */}
        <Card title={t("Patologie familiari rilevanti")} icon={<Users className="h-4 w-4" />}>
          <ul className="space-y-1.5">
            {anamnesis.familyHistory.items.map((t) => (
              <li key={t} className="text-sm flex items-start gap-2 bg-muted/60 rounded-xl px-3 py-2">
                <Heart className="h-3.5 w-3.5 mt-0.5 shrink-0 text-status-warn" />
                {t}
              </li>
            ))}
          </ul>
        </Card>

        {/* Growth */}
        <Card title={t("Crescita tra visite")} icon={<TrendingUp className="h-4 w-4" />}>
          <div className="grid grid-cols-3 gap-2">
            <Stat label={t("Peso")} value={t("3,10 kg")} delta="+170 g" tone="good" />
            <Stat label={t("Lunghezza")} value={t("49 cm")} delta="+1,5 cm" tone="good" />
            <Stat label={t("Testa")} value={t("35,5 cm")} delta="+0,8 cm" tone="good" />
          </div>
          <div className="text-xs text-muted-foreground mt-3">{t("Tutti i parametri nelle fasce di riferimento INeS.")}</div>
        </Card>

        {/* Feeding */}
        <Card title={t("Alimentazione · ultimi 7 giorni")} icon={<Activity className="h-4 w-4" />}>
          <div className="grid grid-cols-2 gap-2">
            <Stat label={t("Pasti/giorno")} value="7,6" delta="target 8" tone="warn" />
            <Stat label={t("Intake medio")} value="148 ml/kg" delta="target 150" tone="good" />
            <Stat label={t("Metodo")} value="65% biberon" delta="35% seno" tone="neutral" />
            <Stat label={t("Tipo")} value="LM + formulato" delta="fortificato" tone="neutral" />
          </div>
        </Card>

        {/* Bowel */}
        <Card title={t("Intestino e rigurgiti")} icon={<Activity className="h-4 w-4" />}>
          <div className="grid grid-cols-2 gap-2">
            <Stat label={t("Scariche/giorno")} value="3,4" delta="normale" tone="good" />
            <Stat label={t("Consistenza")} value="Morbide" delta="80% dei log" tone="good" />
            <Stat label={t("Rigurgiti/giorno")} value="0,9" delta="↑ da 0,3" tone="warn" />
            <Stat label={t("Volume")} value={t("Piccolo")} delta="Non a getto" tone="good" />
          </div>
        </Card>

        {/* Therapy */}
        <Card title={t("Aderenza terapia")} icon={<Activity className="h-4 w-4" />}>
          <div className="space-y-2">
            <AdherenceBar label={t("Vitamina D₃ 400 UI")} pct={100} />
            <AdherenceBar label={t("Solfato di ferro")} pct={93} />
            <AdherenceBar label={t("Multivitaminico")} pct={94} />
          </div>
        </Card>

        {/* Symptoms */}
        <Card title={t("Sintomi registrati")} icon={<AlertTriangle className="h-4 w-4" />}>
          <div className="flex flex-wrap gap-2">
            {[
              { l: "Rigurgito ↑", t: "warn" },
              { l: "Lieve congestione", t: "neutral" },
              { l: "Agitato 18–21", t: "neutral" },
            ].map((s) => (
              <span
                key={s.l}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                  s.t === "warn" ? "bg-status-warn/20 text-status-warn" : "bg-muted text-muted-foreground"
                }`}
              >
                {s.l}
              </span>
            ))}
          </div>
        </Card>

        {/* Actions */}
        <div className="mt-5 space-y-2">
          <PdfLangToggle lang={pdfLang} setLang={setPdfLang} t={t} />
          <button
            onClick={() => {
              try {
                generateDoctorPdf(pdfLang);
                toast({
                  title: pdfLang === "en" ? "PDF generated ✨" : "PDF generato ✨",
                  description: pdfLang === "en"
                    ? "At-a-glance briefing ready to share."
                    : "Briefing at-a-glance pronto da condividere.",
                });
              } catch (e) {
                toast({ title: "Errore", description: "Impossibile generare il PDF.", variant: "destructive" });
              }
            }}
            className="w-full h-14 rounded-2xl gradient-dawn shadow-card text-sm font-semibold flex items-center justify-center gap-2"
          >
            <FileText className="h-4 w-4" />
            {pdfLang === "en"
              ? "Export at-a-glance PDF for the pediatrician"
              : t("Esporta PDF at-a-glance per il pediatra")}
          </button>
          <button
            onClick={() => toast({ title: "Link copiato", description: "Vista completa pronta da condividere col pediatra." })}
            className="w-full h-12 rounded-2xl bg-card shadow-soft text-sm font-semibold flex items-center justify-center gap-2"
          >
            <Share2 className="h-4 w-4" /> {t("Condividi link vista completa")}
          </button>
        </div>

        <div className="mt-3 text-center text-[10px] text-muted-foreground px-4 leading-relaxed">
          Il <span className="font-semibold">PDF</span> contiene un riassunto sintetico per la visita. Il <span className="font-semibold">link</span> dà accesso a tutti i dati storici e all'anamnesi estesa.
        </div>
      </div>
    </PhoneShell>
  );
};

const SofiaPlaceholder = ({ onBack }: { onBack: () => void }) => (
  <PhoneShell>
    <div className="px-5 pt-14 pb-6">
      <div className="flex items-center justify-between mb-5">
        <button onClick={onBack} className="h-10 w-10 rounded-full glass flex items-center justify-center">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="text-center">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Per la Dr.ssa Bianchi</div>
          <div className="font-display text-base font-semibold">Briefing visita · Sofia</div>
        </div>
        <div className="w-10" />
      </div>
      <div className="rounded-3xl gradient-mint p-6 shadow-card text-center">
        <div className="text-4xl mb-2">🌱</div>
        <div className="font-display text-xl font-semibold">Report pediatrico per Sofia</div>
        <p className="text-sm text-foreground/70 mt-2 leading-relaxed">
          Stiamo finalizzando il template di briefing per i bambini in età prescolare (3–6 anni). Per ora puoi consultare i suoi documenti e chiedere a Palm di prepararti un riassunto vocale o testuale per la prossima visita.
        </p>
      </div>
    </div>
  </PhoneShell>
);

const Card = ({ title, icon, children }: any) => (
  <div className="mt-4 rounded-3xl bg-card p-4 shadow-soft">
    <div className="flex items-center gap-2 mb-3">
      <div className="h-7 w-7 rounded-xl gradient-warm flex items-center justify-center">{icon}</div>
      <div className="font-display text-base font-semibold">{title}</div>
    </div>
    {children}
  </div>
);

const PdfLangToggle = ({ lang, setLang, t }: { lang: ReportLang; setLang: (l: ReportLang) => void; t: (s: string) => string }) => (
  <div className="flex items-center justify-between bg-muted/60 rounded-2xl px-3 py-2">
    <div className="text-[11px] text-muted-foreground font-semibold">{t("Lingua del PDF")}</div>
    <div className="flex gap-1 bg-background rounded-full p-0.5">
      {(["it", "en"] as ReportLang[]).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={cn(
            "px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all",
            lang === l ? "bg-foreground text-background" : "text-muted-foreground",
          )}
        >
          {l === "it" ? "🇮🇹 IT" : "🇬🇧 EN"}
        </button>
      ))}
    </div>
  </div>
);

const Stat = ({ label, value, delta, tone }: { label: string; value: string; delta: string; tone: "good" | "warn" | "bad" | "neutral" }) => (
  <div className="bg-muted/60 rounded-2xl p-3">
    <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">{label}</div>
    <div className="font-display text-base font-semibold mt-0.5">{value}</div>
    <div className={`text-[10px] mt-0.5 font-semibold ${
      tone === "good" ? "text-status-good" : tone === "warn" ? "text-status-warn" : tone === "bad" ? "text-status-bad" : "text-muted-foreground"
    }`}>{delta}</div>
  </div>
);

const FlagRow = ({ tone, title, detail }: { tone: "good" | "warn" | "bad"; title: string; detail: string }) => {
  const c = tone === "good" ? "bg-status-good" : tone === "warn" ? "bg-status-warn" : "bg-status-bad";
  return (
    <div className="flex items-center gap-3 py-1">
      <div className={`h-2.5 w-2.5 rounded-full ${c}`} />
      <div className="flex-1">
        <div className="text-sm font-semibold">{title}</div>
        <div className="text-[11px] text-muted-foreground">{detail}</div>
      </div>
    </div>
  );
};

const AnamnesisRow = ({ label, present, note, yesLabel = "Sì", noLabel = "No" }: { label: string; present: boolean; note: string; yesLabel?: string; noLabel?: string }) => (
  <div className="flex items-start gap-3 bg-muted/60 rounded-xl px-3 py-2">
    <span className={`mt-1 h-2 w-2 rounded-full shrink-0 ${present ? "bg-status-warn" : "bg-status-good"}`} />
    <div className="flex-1 min-w-0">
      <div className="text-xs font-semibold leading-tight">{label}</div>
      <div className="text-[11px] text-muted-foreground mt-0.5">{note}</div>
    </div>
    <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${
      present ? "bg-status-warn/15 text-status-warn" : "bg-status-good/15 text-status-good"
    }`}>
      {present ? yesLabel : noLabel}
    </span>
  </div>
);

const AdherenceBar = ({ label, pct }: { label: string; pct: number }) => (
  <div>
    <div className="flex items-center justify-between mb-1">
      <div className="text-xs font-semibold">{label}</div>
      <div className="text-xs font-mono text-muted-foreground">{pct}%</div>
    </div>
    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
      <div className="h-full gradient-mint" style={{ width: `${pct}%` }} />
    </div>
  </div>
);

export default Report;

/* ─────────────────────────────────────────────────────────────────
   ADULT REPORT (Chiara) — for the GP / "medico di base"
   ───────────────────────────────────────────────────────────────── */
const AdultReport = ({ onBack }: { onBack: () => void }) => {
  const r = adultReportChiara;
  const { lang } = useLanguage();
  const { t } = useT("chiara");
  const [pdfLang, setPdfLang] = useState<ReportLang>((typeof window!=="undefined" && localStorage.getItem("palm.lang")==="en") ? "en" : "it");

  useEffect(() => {
    setPdfLang(lang === "en" ? "en" : "it");
  }, [lang]);

  return (
    <PhoneShell>
      <div className="px-5 pt-14 pb-6">
        <div className="flex items-center justify-between mb-5">
          <button onClick={onBack} className="h-10 w-10 rounded-full glass flex items-center justify-center">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="text-center">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">{t("Briefing")}</div>
            <div className="font-display text-base font-semibold">{t("Briefing visita")}</div>
          </div>
          <button className="h-10 w-10 rounded-full glass flex items-center justify-center">
            <Share2 className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-3 rounded-2xl bg-muted/60 p-3 flex items-start gap-2.5">
          <Link2 className="h-3.5 w-3.5 mt-0.5 shrink-0 text-muted-foreground" />
          <div className="text-[11px] text-muted-foreground leading-snug">
            <span className="font-semibold text-foreground">{t("Vista link completo")}</span> — {t("— quello che vedrebbe il tuo medico aprendo il link. Per la visita, esporta il")} <span className="font-semibold text-foreground">{t("PDF di una pagina")}</span> {t("in fondo.")}
          </div>
        </div>

        {/* Header card */}
        <div className="rounded-[2rem] gradient-warm p-5 shadow-card relative overflow-hidden">
          <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-white/40 blur-2xl" />
          <div className="relative flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-white/70 flex items-center justify-center shadow-soft">
              <Stethoscope className="h-6 w-6" />
            </div>
            <div className="flex-1">
               <div className="text-[10px] uppercase tracking-widest font-bold text-foreground/70">{t("Riassunto in 30 secondi")}</div>
              <div className="font-display text-2xl font-semibold leading-tight">{r.patient.name}, {r.patient.age}</div>
              <div className="text-xs text-foreground/70 mt-0.5">{r.patient.sex} · {r.patient.height} · {r.patient.weight} (BMI {r.patient.bmi})</div>
            </div>
          </div>
          <div className="mt-4 text-sm text-foreground/80 leading-relaxed bg-white/40 rounded-2xl p-3">{r.context}</div>
        </div>

        {/* Vitals */}
         <Card title={t("Parametri")} icon={<Activity className="h-4 w-4" />}>
          <div className="grid grid-cols-3 gap-2">
            <Stat label="Pressione" value={r.vitals.bp} delta="seduta" tone="good" />
            <Stat label="FC" value={r.vitals.hr} delta="riposo" tone="good" />
            <Stat label="Temp" value={r.vitals.temp} delta="auricolare" tone="good" />
          </div>
        </Card>

        {/* Reasons */}
         <Card title={t("Motivi della visita")} icon={<AlertTriangle className="h-4 w-4" />}>
          <ul className="space-y-1.5">
            {r.reasons.map((t) => (
              <li key={t} className="text-sm flex items-start gap-2 bg-status-warn/10 rounded-xl px-3 py-2">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-status-warn shrink-0" />
                {t}
              </li>
            ))}
          </ul>
        </Card>

        {/* Labs */}
         <Card title={t("Esami recenti")} icon={<TrendingUp className="h-4 w-4" />}>
          <div className="space-y-1.5">
            {r.labs.map((l) => (
              <div key={l.label} className="flex items-center gap-3 bg-muted/60 rounded-xl px-3 py-2">
                <div className={cn("h-2 w-2 rounded-full shrink-0", l.tone === "good" ? "bg-status-good" : l.tone === "warn" ? "bg-status-warn" : "bg-status-bad")} />
                <div className="flex-1 text-xs font-semibold">{l.label}</div>
                <div className="font-mono text-xs">{l.value}</div>
                <div className="text-[10px] text-muted-foreground w-16 text-right">rif. {l.ref}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Meds */}
         <Card title={t("Terapia in corso")} icon={<Pill className="h-4 w-4" />}>
          <ul className="space-y-1.5">
            {r.meds.map((t) => (
              <li key={t} className="text-sm flex items-start gap-2 bg-muted/60 rounded-xl px-3 py-2">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-foreground/60 shrink-0" />{t}
              </li>
            ))}
          </ul>
        </Card>

        {/* Lifestyle */}
         <Card title={t("Stile di vita · ultimi 7 gg")} icon={<Activity className="h-4 w-4" />}>
          <ul className="space-y-1.5">
            {r.lifestyle.map((t) => (
              <li key={t} className="text-sm flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-foreground/60 shrink-0" />{t}</li>
            ))}
          </ul>
        </Card>

        {/* Anamnesi */}
         <Card title={t("Anamnesi rilevante")} icon={<ShieldCheck className="h-4 w-4" />}>
          <ul className="space-y-1.5">
            {r.history.map((t) => (
              <li key={t} className="text-sm flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-foreground/60 shrink-0" />{t}</li>
            ))}
          </ul>
        </Card>

        {/* Doctor ask */}
         <Card title={t("Reminder per il medico")} icon={<Heart className="h-4 w-4" />}>
          <ul className="space-y-1.5">
            {r.doctorAsk.map((t) => (
              <li key={t} className="text-sm flex items-start gap-2 bg-status-warn/10 rounded-xl px-3 py-2">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-status-warn shrink-0" />{t}
              </li>
            ))}
          </ul>
        </Card>

        {/* Actions */}
        <div className="mt-5 space-y-2">
          <PdfLangToggle lang={pdfLang} setLang={setPdfLang} t={(s) => s} />
          <button
            onClick={() => {
              try {
                generateAdultPdf(pdfLang);
                toast({
                  title: pdfLang === "en" ? "PDF generated ✨" : "PDF generato ✨",
                  description: pdfLang === "en" ? "GP briefing ready." : "Briefing per il MMG pronto.",
                });
              } catch {
                toast({ title: "Errore", description: "Impossibile generare il PDF.", variant: "destructive" });
              }
            }}
            className="w-full h-14 rounded-2xl gradient-dawn shadow-card text-sm font-semibold flex items-center justify-center gap-2"
          >
            <FileText className="h-4 w-4" /> {pdfLang === "en" ? "Export PDF for your doctor" : "Esporta PDF per il tuo medico"}
          </button>
          <button
            onClick={() => toast({ title: "Link copiato", description: "Vista completa pronta da condividere." })}
            className="w-full h-12 rounded-2xl bg-card shadow-soft text-sm font-semibold flex items-center justify-center gap-2"
          >
            <Share2 className="h-4 w-4" /> Condividi link vista completa
          </button>
        </div>
      </div>
    </PhoneShell>
  );
};

/* ─────────────────────────────────────────────────────────────────
   GERIATRIC REPORT (Riccardo) — for the geriatra / cardiologo
   ───────────────────────────────────────────────────────────────── */
const GeriatricReport = ({ onBack }: { onBack: () => void }) => {
  const r = geriatricReportRiccardo;
  const { lang } = useLanguage();
  const { t } = useT("riccardo");
  const [pdfLang, setPdfLang] = useState<ReportLang>((typeof window!=="undefined" && localStorage.getItem("palm.lang")==="en") ? "en" : "it");

  useEffect(() => {
    setPdfLang(lang === "en" ? "en" : "it");
  }, [lang]);

  return (
    <PhoneShell>
      <div className="px-5 pt-14 pb-6">
        <div className="flex items-center justify-between mb-5">
          <button onClick={onBack} className="h-10 w-10 rounded-full glass flex items-center justify-center">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="text-center">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">{t("Briefing")}</div>
            <div className="font-display text-base font-semibold">{t("Briefing visita")}</div>
          </div>
          <button className="h-10 w-10 rounded-full glass flex items-center justify-center">
            <Share2 className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-3 rounded-2xl bg-muted/60 p-3 flex items-start gap-2.5">
          <Link2 className="h-3.5 w-3.5 mt-0.5 shrink-0 text-muted-foreground" />
          <div className="text-[11px] text-muted-foreground leading-snug">
            <span className="font-semibold text-foreground">{t("Vista link completo")}</span> — {t("— tutto ciò che il geriatra vede aprendo il link. Per portare in studio, esporta il")} <span className="font-semibold text-foreground">{t("PDF di una pagina")}</span> {t("in fondo.")}
          </div>
        </div>

        {/* Header */}
        <div className="rounded-[2rem] gradient-parent p-5 shadow-card relative overflow-hidden">
          <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-white/40 blur-2xl" />
          <div className="relative flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-white/70 flex items-center justify-center shadow-soft">
              <Heart className="h-6 w-6" />
            </div>
            <div className="flex-1">
               <div className="text-[10px] uppercase tracking-widest font-bold text-foreground/70">{t("Riassunto in 30 secondi")}</div>
              <div className="font-display text-2xl font-semibold leading-tight">{r.patient.name}, {r.patient.age}</div>
              <div className="text-xs text-foreground/70 mt-0.5">{r.patient.sex} · {r.patient.height} · {r.patient.weight} (BMI {r.patient.bmi})</div>
            </div>
          </div>
          <div className="mt-4 text-sm text-foreground/80 leading-relaxed bg-white/40 rounded-2xl p-3">{r.context}</div>
        </div>

        {/* Vitals */}
         <Card title={t("Parametri vitali (media 7 gg)")} icon={<Activity className="h-4 w-4" />}>
          <div className="grid grid-cols-2 gap-2">
            <Stat label="Pressione" value={r.vitals.bp} delta="dom. + studio" tone="warn" />
            <Stat label="FC" value={r.vitals.hr} delta="riposo" tone="good" />
            <Stat label="Temp" value={r.vitals.temp} delta="ascellare" tone="good" />
            <Stat label="SpO₂" value={r.vitals.sat ?? "—"} delta="aa" tone="good" />
          </div>
        </Card>

        {/* Conditions */}
         <Card title={t("Patologie attive")} icon={<Heart className="h-4 w-4" />}>
          <ul className="space-y-1.5">
            {r.conditions.map((t) => (
              <li key={t} className="text-sm flex items-start gap-2 bg-muted/60 rounded-xl px-3 py-2">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-status-warn shrink-0" />{t}
              </li>
            ))}
          </ul>
        </Card>

        {/* Politerapia + adherence */}
        <Card title="Politerapia · aderenza" icon={<Pill className="h-4 w-4" />}>
          <div className="space-y-2.5">
            {r.meds.map((m) => {
              const adh = r.adherence.find((a) => m.name.toLowerCase().includes(a.drug.toLowerCase()));
              return (
                <div key={m.name}>
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <div className="text-xs font-semibold">{m.name}</div>
                      <div className="text-[10px] text-muted-foreground">{m.dose}</div>
                    </div>
                    {adh && (
                      <div className={cn("text-xs font-mono font-bold", adh.pct >= 90 ? "text-status-good" : adh.pct >= 80 ? "text-status-warn" : "text-status-bad")}>
                        {adh.pct}%
                      </div>
                    )}
                  </div>
                  {adh && (
                    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                      <div className={cn("h-full", adh.pct >= 90 ? "gradient-mint" : adh.pct >= 80 ? "bg-status-warn" : "bg-status-bad")} style={{ width: `${adh.pct}%` }} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* Labs */}
        <Card title="Esami recenti" icon={<TrendingUp className="h-4 w-4" />}>
          <div className="space-y-1.5">
            {r.labs.map((l) => (
              <div key={l.label} className="flex items-center gap-3 bg-muted/60 rounded-xl px-3 py-2">
                <div className={cn("h-2 w-2 rounded-full shrink-0", l.tone === "good" ? "bg-status-good" : l.tone === "warn" ? "bg-status-warn" : "bg-status-bad")} />
                <div className="flex-1 text-xs font-semibold">{l.label}</div>
                <div className="font-mono text-xs">{l.value}</div>
                <div className="text-[10px] text-muted-foreground w-16 text-right">rif. {l.ref}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Caregiver alerts */}
        <Card title="Alert dalla app del caregiver" icon={<Bell className="h-4 w-4" />}>
          <ul className="space-y-1.5">
            {r.alerts.map((t) => (
              <li key={t} className="text-sm flex items-start gap-2 bg-status-warn/10 rounded-xl px-3 py-2">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-status-warn shrink-0" />{t}
              </li>
            ))}
          </ul>
        </Card>

        {/* Lifestyle */}
        <Card title="Stile di vita · ultimi 7 gg" icon={<Activity className="h-4 w-4" />}>
          <ul className="space-y-1.5">
            {r.lifestyle.map((t) => (
              <li key={t} className="text-sm flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-foreground/60 shrink-0" />{t}</li>
            ))}
          </ul>
        </Card>

        {/* Family / allergies */}
        <Card title="Familiarità e allergie" icon={<Users className="h-4 w-4" />}>
          <ul className="space-y-1.5">
            {r.family.map((t) => (
              <li key={t} className="text-sm flex items-start gap-2"><Heart className="h-3.5 w-3.5 mt-0.5 shrink-0 text-status-warn" />{t}</li>
            ))}
            <li className="text-sm flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-status-good shrink-0" />Allergie: {r.allergies}</li>
          </ul>
        </Card>

        {/* Doctor ask */}
        <Card title="Reminder per il medico" icon={<AlertTriangle className="h-4 w-4" />}>
          <ul className="space-y-1.5">
            {r.doctorAsk.map((t) => (
              <li key={t} className="text-sm flex items-start gap-2 bg-pastel-peach/30 rounded-xl px-3 py-2">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-status-warn shrink-0" />{t}
              </li>
            ))}
          </ul>
        </Card>

        {/* Actions */}
        <div className="mt-5 space-y-2">
          <PdfLangToggle lang={pdfLang} setLang={setPdfLang} t={(s) => s} />
          <button
            onClick={() => {
              try {
                generateGeriatricPdf(pdfLang);
                toast({
                  title: pdfLang === "en" ? "PDF generated ✨" : "PDF generato ✨",
                  description: pdfLang === "en" ? "Geriatric briefing ready." : "Briefing per il geriatra pronto.",
                });
              } catch {
                toast({ title: "Errore", description: "Impossibile generare il PDF.", variant: "destructive" });
              }
            }}
            className="w-full h-14 rounded-2xl gradient-dawn shadow-card text-sm font-semibold flex items-center justify-center gap-2"
          >
            <FileText className="h-4 w-4" /> {pdfLang === "en" ? "Export PDF for your doctor" : "Esporta PDF per il tuo medico"}
          </button>
          <button
            onClick={() => toast({ title: "Link copiato", description: "Vista completa pronta da condividere." })}
            className="w-full h-12 rounded-2xl bg-card shadow-soft text-sm font-semibold flex items-center justify-center gap-2"
          >
            <Share2 className="h-4 w-4" /> Condividi link vista completa
          </button>
        </div>
      </div>
    </PhoneShell>
  );
};
