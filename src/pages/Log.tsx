import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Mic, Check, Minus, Plus, Droplet, Baby, Pill, Activity, Play, Pause, RotateCcw } from "lucide-react";
import { PhoneShell } from "@/components/PhoneShell";
import { useConfetti } from "@/components/Confetti";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useActiveProfile } from "@/hooks/useActiveProfile";
import { useT } from "@/lib/i18n";
import { addLog, addMedication } from "@/lib/store";
import { useProfileStore } from "@/hooks/useStore";

type Tab = "weight" | "feed" | "diaper" | "spitup" | "meds";
type FeedMethod = "breast" | "bottle" | "tube";
type FeedType = "breast-milk" | "formula";
type Side = "L" | "R" | null;

const Log = () => {
  const nav = useNavigate();
  const fire = useConfetti();
  const { id } = useActiveProfile();
  const { t } = useT(id);
  const profileStore = useProfileStore(id);
  const [tab, setTab] = useState<Tab>("weight");
  const [weight, setWeight] = useState(3100);
  const [showFeedback, setShowFeedback] = useState(false);

  // feed
  const [feedMethod, setFeedMethod] = useState<FeedMethod>("bottle");
  const [feedType, setFeedType] = useState<FeedType>("breast-milk");
  const [feedMl, setFeedMl] = useState(60);

  // breast timer
  const [activeSide, setActiveSide] = useState<Side>(null);
  const [leftSec, setLeftSec] = useState(0);
  const [rightSec, setRightSec] = useState(0);
  const tickRef = useRef<number | null>(null);

  useEffect(() => {
    if (activeSide) {
      tickRef.current = window.setInterval(() => {
        if (activeSide === "L") setLeftSec((s) => s + 1);
        else setRightSec((s) => s + 1);
      }, 1000);
    }
    return () => {
      if (tickRef.current) window.clearInterval(tickRef.current);
    };
  }, [activeSide]);

  const fmt = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
  const resetBreast = () => { setActiveSide(null); setLeftSec(0); setRightSec(0); };

  // diaper
  const [diaperType, setDiaperType] = useState<"pee" | "poop" | "both" | null>(null);
  const [stoolConsistency, setStoolConsistency] = useState<string | null>(null);

  // spit
  const [spitAmount, setSpitAmount] = useState<string | null>(null);

  // meds — base list + any therapies added through chat / "Aggiungi" actions
  const baseMeds = [
    { id: "vit-d", name: "Vitamina D₃", dose: "400 UI", emoji: "💧" },
    { id: "iron", name: "Solfato di ferro", dose: "2 mg/kg", emoji: "🩸" },
    { id: "multi", name: "Multivitaminico", dose: "0,3 ml", emoji: "💊" },
  ];
  const [givenMap, setGivenMap] = useState<Record<string, boolean>>({});
  const meds = [
    ...baseMeds,
    ...profileStore.meds.map((m) => ({
      id: m.id,
      name: m.name,
      dose: m.dose ?? "—",
      emoji: "✨",
    })),
  ].map((m) => ({ ...m, given: !!givenMap[m.id] }));

  const tabs: { id: Tab; label: string; icon: any; gradient: string }[] = [
    { id: "weight", label: t("Peso"), icon: Activity, gradient: "gradient-sunset" },
    { id: "feed", label: t("Pasto"), icon: Baby, gradient: "gradient-warm" },
    { id: "diaper", label: t("Pannolino"), icon: Droplet, gradient: "gradient-mint" },
    { id: "spitup", label: t("Rigurgito"), icon: Droplet, gradient: "gradient-sky" },
    { id: "meds", label: t("Farmaci"), icon: Pill, gradient: "gradient-baby" },
  ];

  const submitWeight = () => {
    addLog(id, "weight", `Peso · ${(weight / 1000).toFixed(2).replace(".", ",")} kg`);
    setShowFeedback(true);
    setTimeout(() => setShowFeedback(false), 4000);
  };

  const submitFeed = () => {
    if (feedMethod === "breast") {
      const total = leftSec + rightSec;
      if (total < 10) {
        toast.error("Avvia il timer per registrare la poppata");
        return;
      }
      addLog(id, "feed", `Seno · Sx ${fmt(leftSec)} · Dx ${fmt(rightSec)}`);
      toast.success("Poppata al seno registrata ✨", {
        description: `Sx ${fmt(leftSec)} · Dx ${fmt(rightSec)}`,
      });
      resetBreast();
    } else {
      const lat = feedType === "breast-milk" ? "latte materno" : "formula";
      const via = feedMethod === "bottle" ? "biberon" : "sondino";
      addLog(id, "feed", `${via.charAt(0).toUpperCase() + via.slice(1)} · ${feedMl} ml · ${lat}`);
      toast.success("Pasto registrato ✨", { description: `${feedMl} ml · ${feedMethod === "bottle" ? "biberon" : "sondino"}` });
    }
  };

  const submitDiaper = () => {
    if (!diaperType) return;
    const label =
      diaperType === "pee" ? "Pipì" :
      diaperType === "poop" ? `Cacca · ${stoolConsistency || "—"}` :
      `Pipì + cacca · ${stoolConsistency || "—"}`;
    addLog(id, "diaper", `Pannolino · ${label}`);
    toast.success("Pannolino registrato 🌿", { description: label });
    setDiaperType(null);
    setStoolConsistency(null);
  };

  const submitSpit = () => {
    if (!spitAmount) return;
    addLog(id, "spitup", `Rigurgito · ${spitAmount}`);
    toast.success("Rigurgito registrato", { description: spitAmount });
    setSpitAmount(null);
  };

  const toggleMed = (medId: string) => {
    const wasDone = !!givenMap[medId];
    const next = !wasDone;
    setGivenMap((p) => ({ ...p, [medId]: next }));
    if (next) {
      const m = meds.find((x) => x.id === medId);
      if (m) addLog(id, "med", `${m.name} ${m.dose} · somministrata`);
    }
  };

  return (
    <PhoneShell>
      <div className="px-5 pt-14 pb-6">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-5">
          <button onClick={() => nav(-1)} className="h-10 w-10 rounded-full glass flex items-center justify-center">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="text-center">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">{t("Registra")}</div>
            <div className="font-display text-base font-semibold">{t("In un tap")}</div>
          </div>
          <button className="h-10 w-10 rounded-full gradient-dawn flex items-center justify-center shadow-soft">
            <Mic className="h-5 w-5 text-foreground" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-5 px-5 pb-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all",
                tab === t.id ? `${t.gradient} text-foreground shadow-soft` : "bg-card text-muted-foreground",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* WEIGHT */}
        {tab === "weight" && (
          <div className="mt-6 animate-fade-in">
            <div className="text-center">
              <div className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">{t("Peso di oggi")}</div>
              <div className="font-display text-7xl font-semibold mt-3 text-gradient leading-none">{(weight / 1000).toFixed(2).replace(".", ",")}</div>
              <div className="text-sm text-muted-foreground mt-1">{t("kg · ")}{weight}{t(" g")}</div>
            </div>

            <div className="mt-6 px-2">
              <input
                type="range" min={2500} max={3800} step={5}
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none bg-gradient-to-r from-pastel-peach via-pastel-pink to-pastel-lavender accent-primary"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1.5">
                <span>2500 g</span><span>3800 g</span>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-center gap-3">
              <button onClick={() => setWeight((w) => w - 5)} className="h-12 w-12 rounded-full bg-card shadow-soft flex items-center justify-center">
                <Minus className="h-5 w-5" />
              </button>
              <div className="text-xs text-muted-foreground font-medium">±5 g</div>
              <button onClick={() => setWeight((w) => w + 5)} className="h-12 w-12 rounded-full bg-card shadow-soft flex items-center justify-center">
                <Plus className="h-5 w-5" />
              </button>
            </div>

            <button
              onClick={submitWeight}
              className="mt-7 w-full h-14 rounded-2xl gradient-sunset font-display text-lg font-semibold shadow-card transition-transform active:scale-[0.98]"
            >
              {t("Registra peso")}
            </button>

            {showFeedback && (
              <div className="mt-4 rounded-3xl gradient-mint p-4 shadow-soft animate-scale-bounce">
                <div className="text-[10px] uppercase tracking-widest font-bold text-foreground/70">{t("Bellissimo")}</div>
                <div className="font-display text-lg font-semibold leading-snug mt-1">
                  {t("3 giorni di crescita costante.")}
                </div>
                <div className="text-xs text-foreground/70 mt-1">
                  {t("Romeo è al 25° percentile, perfettamente in linea con la traiettoria di dimissione.")}
                </div>
              </div>
            )}
          </div>
        )}

        {/* FEED */}
        {tab === "feed" && (
          <div className="mt-6 animate-fade-in space-y-5">
            <div>
              <div className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-2">{t("Metodo")}</div>
              <div className="grid grid-cols-3 gap-2">
                {([
                  ["breast", "🤱", t("Seno")],
                  ["bottle", "🍼", t("Biberon")],
                  ["tube", "🩺", t("Sondino")],
                ] as const).map(([id, emoji, label]) => (
                  <button
                    key={id}
                    onClick={() => setFeedMethod(id)}
                    className={cn(
                      "rounded-2xl p-3 flex flex-col items-center gap-1 transition-all",
                      feedMethod === id ? "gradient-warm shadow-soft scale-105" : "bg-card text-muted-foreground",
                    )}
                  >
                    <span className="text-xl">{emoji}</span>
                    <span className="text-[11px] font-semibold">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Type — only when bottle/tube */}
            {feedMethod !== "breast" && (
              <div className="animate-fade-in">
                <div className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-2">{t("Tipo di latte")}</div>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    ["breast-milk", t("Latte materno")],
                    ["formula", t("Formulato")],
                  ] as const).map(([id, label]) => (
                    <button
                      key={id}
                      onClick={() => setFeedType(id)}
                      className={cn(
                        "rounded-2xl py-2.5 text-xs font-semibold transition-all",
                        feedType === id ? "gradient-baby shadow-soft" : "bg-card text-muted-foreground",
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Breast timer */}
            {feedMethod === "breast" ? (
              <div className="rounded-3xl bg-card p-4 shadow-soft animate-fade-in">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs uppercase tracking-widest font-semibold text-muted-foreground">{t("Timer poppata")}</div>
                  <button onClick={resetBreast} className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <RotateCcw className="h-3 w-3" /> {t("reset")}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {(["L", "R"] as const).map((side) => {
                    const isActive = activeSide === side;
                    const sec = side === "L" ? leftSec : rightSec;
                    return (
                      <button
                        key={side}
                        onClick={() => setActiveSide(isActive ? null : side)}
                        className={cn(
                          "relative rounded-2xl p-4 flex flex-col items-center gap-2 transition-all",
                          isActive ? "gradient-dawn shadow-card scale-[1.02]" : "bg-muted/60",
                        )}
                      >
                        {isActive && (
                          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-status-bad animate-pulse" />
                        )}
                        <div className="text-[10px] uppercase tracking-widest font-bold text-foreground/60">
                          {side === "L" ? t("Sinistro") : t("Destro")}
                        </div>
                        <div className="font-mono text-3xl font-semibold tabular-nums">
                          {fmt(sec)}
                        </div>
                        <div className={cn(
                          "h-9 w-9 rounded-full flex items-center justify-center",
                          isActive ? "bg-foreground text-background" : "bg-card",
                        )}>
                          {isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-3 text-center text-[11px] text-muted-foreground">
                  {t("Tocca un seno per avviare/mettere in pausa · totale")} {fmt(leftSec + rightSec)}
                </div>
              </div>
            ) : (
              <div className="rounded-3xl bg-card p-4 shadow-soft">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs uppercase tracking-widest font-semibold text-muted-foreground">{t("Quantità")}</div>
                  <div className="font-display text-3xl font-semibold">{feedMl} <span className="text-sm text-muted-foreground">ml</span></div>
                </div>
                <input
                  type="range" min={0} max={150} step={5}
                  value={feedMl}
                  onChange={(e) => setFeedMl(Number(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none bg-gradient-to-r from-pastel-yellow to-pastel-coral accent-primary"
                />
                <div className="grid grid-cols-5 gap-1.5 mt-3">
                  {[30, 45, 60, 75, 90].map((v) => (
                    <button
                      key={v}
                      onClick={() => setFeedMl(v)}
                      className="py-1.5 rounded-full bg-muted text-[11px] font-semibold"
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={submitFeed}
              className="w-full h-14 rounded-2xl gradient-warm font-display text-lg font-semibold shadow-card transition-transform active:scale-[0.98]"
            >
              {t("Registra pasto · ora")}
            </button>
          </div>
        )}

        {/* DIAPER */}
        {tab === "diaper" && (
          <div className="mt-6 animate-fade-in space-y-5">
            <div>
              <div className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-3">{t("Tipo di pannolino")}</div>
              <div className="grid grid-cols-3 gap-2">
                {([
                  ["pee", "💛", t("Pipì")],
                  ["poop", "💩", t("Cacca")],
                  ["both", "💛💩", t("Entrambi")],
                ] as const).map(([id, emoji, label]) => (
                  <button
                    key={id}
                    onClick={() => setDiaperType(id)}
                    className={cn(
                      "rounded-2xl p-3 flex flex-col items-center gap-1 transition-all",
                      diaperType === id ? "gradient-mint shadow-card scale-105" : "bg-card text-muted-foreground",
                    )}
                  >
                    <span className="text-xl">{emoji}</span>
                    <span className="text-[11px] font-semibold">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {(diaperType === "poop" || diaperType === "both") && (
              <div className="animate-fade-in">
                <div className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-3">{t("Consistenza")}</div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "watery", label: t("Acquosa"), emoji: "💧", color: "gradient-sky" },
                    { id: "loose", label: t("Morbida"), emoji: "🌊", color: "gradient-mint" },
                    { id: "normal", label: t("Normale"), emoji: "✅", color: "gradient-warm" },
                    { id: "firm", label: t("Soda"), emoji: "🪨", color: "gradient-baby" },
                    { id: "hard", label: t("Dura"), emoji: "🥥", color: "gradient-sunset" },
                    { id: "mucousy", label: t("Mucosa"), emoji: "🌫️", color: "gradient-parent" },
                  ].map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setStoolConsistency(c.label)}
                      className={cn(
                        "rounded-2xl p-3 flex items-center gap-2 transition-all text-left",
                        stoolConsistency === c.label ? `${c.color} shadow-card scale-[1.02]` : "bg-card",
                      )}
                    >
                      <span className="text-xl">{c.emoji}</span>
                      <span className="font-semibold text-xs">{c.label}</span>
                      {stoolConsistency === c.label && <Check className="h-4 w-4 ml-auto" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              disabled={!diaperType || ((diaperType === "poop" || diaperType === "both") && !stoolConsistency)}
              onClick={submitDiaper}
              className="w-full h-14 rounded-2xl gradient-mint font-display text-lg font-semibold shadow-card transition-transform active:scale-[0.98] disabled:opacity-40"
            >
              {t("Registra pannolino")}
            </button>
          </div>
        )}

        {/* SPIT-UP */}
        {tab === "spitup" && (
          <div className="mt-6 animate-fade-in">
            <div className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-3">{t("Quanto è uscito?")}</div>
            <div className="space-y-2">
              {[
                { label: t("Goccia"), emoji: "💧", desc: t("appena una goccia") },
                { label: t("Piccolo"), emoji: "💦", desc: t("un cucchiaino") },
                { label: t("Medio"), emoji: "🌊", desc: t("un cucchiaio") },
                { label: t("Tanto"), emoji: "🚨", desc: t("tutto il pasto") },
              ].map((s) => (
                <button
                  key={s.label}
                  onClick={() => setSpitAmount(s.label)}
                  className={cn(
                    "w-full rounded-2xl p-4 flex items-center gap-4 transition-all text-left",
                    spitAmount === s.label ? "gradient-sky shadow-card scale-[1.02]" : "bg-card",
                  )}
                >
                  <span className="text-3xl">{s.emoji}</span>
                  <div className="flex-1">
                    <div className="font-semibold text-sm">{s.label}</div>
                    <div className="text-[11px] text-muted-foreground">{s.desc}</div>
                  </div>
                  {spitAmount === s.label && <Check className="h-5 w-5" />}
                </button>
              ))}
            </div>
            <button
              disabled={!spitAmount}
              onClick={submitSpit}
              className="mt-6 w-full h-14 rounded-2xl gradient-sky font-display text-lg font-semibold shadow-card transition-transform active:scale-[0.98] disabled:opacity-40"
            >
              {t("Registra rigurgito")}
            </button>
          </div>
        )}

        {/* MEDS */}
        {tab === "meds" && (
          <div className="mt-6 animate-fade-in">
            <div className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-3">
              {t("Farmaci di oggi · tocca quando dato")}
            </div>
            <div className="space-y-2.5">
              {meds.map((m) => (
                <button
                  key={m.id}
                  onClick={() => toggleMed(m.id)}
                  className={cn(
                    "w-full rounded-2xl p-4 flex items-center gap-4 transition-all text-left",
                    m.given ? "gradient-mint shadow-card" : "bg-card shadow-soft",
                  )}
                >
                  <div className={cn(
                    "h-12 w-12 rounded-xl flex items-center justify-center text-2xl",
                    m.given ? "bg-white/60" : "bg-muted",
                  )}>
                    {m.given ? <Check className="h-6 w-6" strokeWidth={3} /> : m.emoji}
                  </div>
                  <div className="flex-1">
                    <div className={cn("font-semibold text-sm", m.given && "line-through text-foreground/60")}>{t(m.name)}</div>
                    <div className="text-[11px] text-muted-foreground">{t(m.dose)}</div>
                  </div>
                  <div className={cn(
                    "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase",
                    m.given ? "bg-white/60 text-status-good" : "bg-muted text-muted-foreground",
                  )}>
                    {m.given ? t("Dato") : t("Da dare")}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </PhoneShell>
  );
};

export default Log;
