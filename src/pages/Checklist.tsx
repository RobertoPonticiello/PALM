import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Check } from "lucide-react";
import { PhoneShell } from "@/components/PhoneShell";
import { todayChecklist, childProfile } from "@/lib/mockData";
import { useConfetti } from "@/components/Confetti";
import { cn } from "@/lib/utils";
import { useActiveProfile } from "@/hooks/useActiveProfile";
import { useProfileStore } from "@/hooks/useStore";
import { setChecklistDone, getChecklistDone } from "@/lib/store";
import { usePregnancyMode } from "@/hooks/usePregnancyMode";

const sofiaChecklist = [
  { id: "sof-teeth-am", label: "Lavare i denti al mattino", emoji: "🪥", done: true },
  { id: "sof-fruit", label: "Frutta o verdura a pranzo", emoji: "🍎", done: false },
  { id: "sof-outdoor", label: "30 minuti all'aria aperta", emoji: "🌳", done: false },
  { id: "sof-screen", label: "Schermo < 1 ora oggi", emoji: "📵", done: false },
  { id: "sof-teeth-pm", label: "Lavare i denti la sera", emoji: "🌙", done: false },
  { id: "sof-bed", label: "A letto entro le 21:00", emoji: "😴", done: false },
];

const pregnancyChecklist = [
  { id: "preg-folate", label: "Acido folico 400 mcg", emoji: "💊", done: true },
  { id: "preg-iron", label: "Ferro · 1 compressa", emoji: "🩸", done: false },
  { id: "preg-water", label: "2 litri di acqua", emoji: "💧", done: false },
  { id: "preg-walk", label: "Camminata di 30 minuti", emoji: "🚶‍♀️", done: false },
  { id: "preg-movements", label: "Conta movimenti fetali (10 in 2h)", emoji: "👶", done: false },
  { id: "preg-pelvic", label: "Esercizi pavimento pelvico", emoji: "🌸", done: false },
];

const Checklist = () => {
  const nav = useNavigate();
  const fire = useConfetti();
  const { id } = useActiveProfile();
  const profileStore = useProfileStore(id);
  const { on: pregnant } = usePregnancyMode();
  const isPregnancyView = id === "chiara" && pregnant;

  // Merge: mock baseline + meds added via chat / log, then apply persisted
  // done overrides per-item.
  const items = useMemo(() => {
    const baseline = isPregnancyView
      ? pregnancyChecklist
      : id === "sofia"
      ? sofiaChecklist
      : todayChecklist;
    const extras = profileStore.meds.map((m) => ({
      id: `med-${m.id}`,
      label: `${m.name}${m.dose ? ` · ${m.dose}` : ""}`,
      emoji: "✨",
      done: false as boolean,
    }));
    return [...baseline, ...extras].map((it) => ({
      ...it,
      done: getChecklistDone(id, it.id, it.done),
    }));
  }, [id, profileStore.meds, isPregnancyView]);

  const [celebrated, setCelebrated] = useState(false);

  const done = items.filter((i) => i.done).length;
  const pct = items.length ? Math.round((done / items.length) * 100) : 0;
  const allDone = done === items.length;

  const toggle = (itemId: string) => {
    const current = items.find((i) => i.id === itemId);
    if (!current) return;
    setChecklistDone(id, itemId, !current.done);
    // Celebrate when this toggle would complete the list.
    if (!current.done && done + 1 === items.length && !celebrated) {
      fire();
      setCelebrated(true);
    }
  };

  return (
    <PhoneShell>
      <div className="px-5 pt-14 pb-6">
        <div className="flex items-center justify-between mb-5">
          <button onClick={() => nav(-1)} className="h-10 w-10 rounded-full glass flex items-center justify-center">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="text-center">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Oggi</div>
            <div className="font-display text-base font-semibold">Piano di cura</div>
          </div>
          <div className="w-10" />
        </div>

        {/* Progress hero */}
        <div className="rounded-[2rem] gradient-mint p-5 shadow-card relative overflow-hidden">
          <div className="absolute -bottom-8 -right-8 h-32 w-32 rounded-full bg-white/40 blur-2xl" />
          <div className="relative">
            <div className="flex items-end justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-widest font-bold text-foreground/70">Progresso di oggi</div>
                <div className="font-display text-5xl font-semibold leading-none mt-1">{pct}%</div>
                <div className="text-xs text-foreground/70 mt-1">{done} di {items.length} completati</div>
              </div>
              {allDone && <div className="text-3xl animate-scale-bounce">🎉</div>}
            </div>
            <div className="mt-4 h-2.5 w-full rounded-full bg-white/40 overflow-hidden">
              <div
                className="h-full rounded-full gradient-sunset transition-all duration-700"
                style={{ width: `${pct}%` }}
              />
            </div>
            {allDone && (
              <div className="mt-4 text-sm font-semibold animate-fade-in">
                Bravissima Chiara. Romeo ha avuto una giornata perfetta. 💛
              </div>
            )}
          </div>
        </div>

        {/* Items */}
        <div className="mt-5 space-y-2">
          {items.map((item, idx) => (
            <button
              key={item.id}
              onClick={() => toggle(item.id)}
              style={{ animationDelay: `${idx * 50}ms` }}
              className={cn(
                "w-full rounded-2xl p-4 flex items-center gap-3 transition-all text-left animate-slide-up-fade",
                item.done ? "bg-card/50 shadow-none" : "bg-card shadow-soft",
              )}
            >
              <div className={cn(
                "h-11 w-11 rounded-2xl flex items-center justify-center transition-all",
                item.done ? "gradient-mint" : "bg-muted",
              )}>
                {item.done ? <Check className="h-5 w-5 text-foreground" strokeWidth={3} /> : <span className="text-xl">{item.emoji}</span>}
              </div>
              <div className="flex-1">
                <div className={cn("font-semibold text-sm", item.done && "line-through text-muted-foreground")}>
                  {item.label}
                </div>
              </div>
              <div className={cn(
                "h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all",
                item.done ? "bg-status-good border-status-good" : "border-muted-foreground/30",
              )}>
                {item.done && <Check className="h-3.5 w-3.5 text-white" strokeWidth={4} />}
              </div>
            </button>
          ))}
        </div>

        <div className="mt-6 text-center text-[11px] text-muted-foreground">
          Configurato dalla {childProfile.pediatrician} · aggiornato 2 giorni fa
        </div>
      </div>
    </PhoneShell>
  );
};

export default Checklist;
