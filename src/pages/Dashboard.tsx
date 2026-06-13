import { useNavigate } from "react-router-dom";
import { ChevronLeft, Bell, Sparkles, ChevronRight, TrendingUp, GraduationCap, Play, MapPin, ClipboardList, BellRing, Check, Pill, Plus, X } from "lucide-react";
import { PhoneShell } from "@/components/PhoneShell";
import { StatusRing } from "@/components/StatusRing";
import { milestones, eduVideos, profileDashboards, chiaraPregnancyDashboard } from "@/lib/mockData";
import { OnboardingTour, hasOnboarded } from "@/components/OnboardingTour";
import { useConfetti } from "@/components/Confetti";
import { useEffect, useState } from "react";
import { useActiveProfile } from "@/hooks/useActiveProfile";
import { toast } from "@/hooks/use-toast";
import { useT } from "@/lib/i18n";
import { profilePhotos } from "@/lib/profilePhotos";
import { useProfileStore } from "@/hooks/useStore";
import { formatLogTime, removeMedication, removeAppointment } from "@/lib/store";
import { AddAppointmentSheet } from "@/components/AddAppointmentSheet";
import { usePregnancyMode } from "@/hooks/usePregnancyMode";
import { Baby } from "lucide-react";

const Dashboard = () => {
  const nav = useNavigate();
  const fire = useConfetti();
  const { id, profile } = useActiveProfile();
  const { t, isRtl } = useT(id);
  const { on: pregnant, toggle: togglePregnant } = usePregnancyMode();
  const isPregnancyView = id === "chiara" && pregnant;
  const data = isPregnancyView ? chiaraPregnancyDashboard : profileDashboards[id];
  const liveStore = useProfileStore(id);

  // Merge live (just-logged) entries on top of the mock recents so the user
  // immediately sees what they registered through Log or the chat.
  const liveRecents = liveStore.logs.slice(0, 4).map((l) => ({
    id: `live-${l.id}`,
    time: formatLogTime(l.ts),
    detail: l.detail,
  }));
  const recentList = [...liveRecents, ...data.recent].slice(0, 6);

  // If the user has logged a new weight (via Log or chat), surface the most
  // recent value as the live hero number — otherwise fall back to mock.
  const latestWeight = liveStore.logs.find((l) => l.kind === "weight");
  const liveWeightValue = (() => {
    if (!latestWeight) return null;
    // detail format: "Peso · 3,10 kg"
    const m = latestWeight.detail.match(/([\d.,]+)\s*kg/i);
    return m ? `${m[1]} kg` : null;
  })();
  const heroValue = liveWeightValue ?? data.hero.value;
  const heroSubtitle = liveWeightValue
    ? `Aggiornato ora · ${formatLogTime(latestWeight!.ts)}`
    : data.hero.label;
  const [showMilestone, setShowMilestone] = useState(id === "matteo");
  const [showTour, setShowTour] = useState(false);
  const [showAddAppt, setShowAddAppt] = useState(false);

  useEffect(() => {
    if (!hasOnboarded()) {
      const t = setTimeout(() => setShowTour(true), 350);
      return () => clearTimeout(t);
    }
  }, [id]);

  // Reset milestone visibility when switching profiles
  useEffect(() => {
    setShowMilestone(id === "matteo");
  }, [id]);

  const series = data.trend.series;
  const max = Math.max(...series.map((d) => d.v));
  const min = Math.min(...series.map((d) => d.v));

  const featuredVideo =
    eduVideos.find((v) => v.id === data.featuredVideoId) ?? eduVideos[0];

  const sendAlert = () => {
    toast({
      title: "Promemoria inviato a Riccardo 🔔",
      description: "Notifica audio + push: « Papà, ricordati il Bisoprololo delle 8 ».",
    });
  };

  return (
    <PhoneShell>
      <div className="px-5 pt-14 pb-6">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => nav("/app")} className="h-10 w-10 rounded-full glass flex items-center justify-center">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-full overflow-hidden ring-2 ring-primary/30 shadow-soft shrink-0">
              <img src={profilePhotos[id]} alt={profile.name} className="h-full w-full object-cover object-top scale-110" />
            </div>
            <div className="text-left leading-tight">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                {t(profile.relation)}
              </div>
              <div className="font-display text-base font-semibold">{t(profile.name)}</div>
            </div>
          </div>
          <button className="relative h-10 w-10 rounded-full glass flex items-center justify-center">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-status-bad" />
          </button>
        </div>

        {/* Pregnancy mode toggle — only on Chiara's profile */}
        {id === "chiara" && (
          <button
            onClick={togglePregnant}
            className={`mb-4 w-full flex items-center gap-3 rounded-2xl px-4 py-3 shadow-soft transition-all ${
              isPregnancyView ? "gradient-warm ring-1 ring-primary/30" : "bg-card"
            }`}
          >
            <div className={`h-9 w-9 rounded-xl flex items-center justify-center text-lg shrink-0 ${isPregnancyView ? "bg-white/70" : "bg-pastel-peach/40"}`}>
              <span aria-hidden>🤰</span>
            </div>
            <div className="flex-1 text-left">
              <div className="text-[10px] uppercase tracking-widest font-bold text-foreground/60">{t("Modalità gravidanza")}</div>
              <div className="text-xs font-semibold leading-tight">
                {isPregnancyView ? t("Attiva · settimana 24 · 2° trimestre") : t("Aspetti un bambino? Attiva la modalità gravidanza")}
              </div>
            </div>
            <div className={`relative h-6 w-11 rounded-full transition-colors ${isPregnancyView ? "bg-primary" : "bg-foreground/15"}`}>
              <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-soft transition-transform ${isPregnancyView ? "translate-x-5" : "translate-x-0.5"}`} />
            </div>
          </button>
        )}

        {/* Hero — ring only for baby (Romeo). Adults get a clean stat header.
            For Romeo we show weight as the primary number, with a smaller
            growth-curve ring beside it so the percentile reads as context, not
            as the main metric. */}
        {data.hero.hideRing ? (
          <div className="rounded-[2rem] gradient-dawn p-5 shadow-card relative overflow-hidden animate-scale-in">
            <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-white/40 blur-2xl" />
            <div className="relative">
              <div className="text-[10px] uppercase tracking-widest font-bold text-foreground/60">{data.hero.ringLabel}</div>
              <div className="font-display text-[2.5rem] leading-none font-semibold mt-1">{heroValue}</div>
              <div className="text-xs text-foreground/70 mt-2 flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-status-good" />
                {heroSubtitle}
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-[2rem] bg-card p-4 shadow-soft animate-scale-in flex items-center gap-4">
            <div className="shrink-0">
              <StatusRing status={profile.status} percentile={data.hero.ringPercentile} size={120} label={data.hero.ringLabel} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">{t("Peso attuale")}</div>
              <div className="font-display text-3xl font-semibold leading-none mt-1">{t(heroValue)}</div>
              <div className="text-[11px] text-foreground/70 mt-2 leading-snug flex items-start gap-1">
                <TrendingUp className="h-3 w-3 text-status-good mt-0.5 shrink-0" />
                <span>{t(heroSubtitle)}</span>
              </div>
              <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-status-good/15 text-status-good text-[10px] font-bold">
                {data.hero.ringPercentile}{t("° percentile · nella norma")}
              </div>
            </div>
          </div>
        )}

        {/* 3 quick metrics */}
        <div className="grid grid-cols-3 gap-2 mt-6">
          {data.metrics.map((m) => (
            <div key={m.label} className={`${m.gradient} rounded-2xl p-3 shadow-soft`}>
              <div className="text-[10px] uppercase tracking-wider text-foreground/60 font-semibold">{t(m.label)}</div>
              <div className="font-display text-lg font-semibold leading-tight mt-0.5">{t(m.value)}</div>
              <div className="text-[10px] text-foreground/60 mt-0.5">{t(m.sub)}</div>
            </div>
          ))}
        </div>

        {/* Active therapies — surfaces meds added via chat or Log */}
        {liveStore.meds.length > 0 && (
          <div className="mt-5 rounded-3xl bg-card p-4 shadow-soft animate-slide-up-fade">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-xl gradient-warm flex items-center justify-center">
                  <Pill className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-display text-base font-semibold leading-none">{t("Terapie attive")}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{liveStore.meds.length} {liveStore.meds.length === 1 ? t("farmaco") : t("farmaci")}</div>
                </div>
              </div>
              <button onClick={() => nav("/checklist")} className="text-[10px] font-bold uppercase tracking-wider text-primary">
                {t("Piano")}
              </button>
            </div>
            <div className="space-y-1.5">
              {liveStore.meds.map((m) => (
                <div key={m.id} className="flex items-center gap-3 rounded-2xl bg-muted/40 px-3 py-2">
                  <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center text-base shrink-0">
                    💊
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold leading-tight truncate">{m.name}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5 truncate">
                      {[m.dose, m.schedule].filter(Boolean).join(" · ") || t("aggiunta da Palm")}
                    </div>
                  </div>
                  <button
                    onClick={() => removeMedication(id, m.id)}
                    aria-label="Rimuovi"
                    className="h-7 w-7 rounded-full bg-white/70 flex items-center justify-center shrink-0 active:scale-90 transition-transform"
                  >
                    <X className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Caregiver checklist (Riccardo) — what Palm sees on Riccardo's phone today */}
        {data.caregiverChecklist && (
          <div className="mt-5 rounded-3xl bg-card p-4 shadow-soft animate-slide-up-fade">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-xl gradient-mint flex items-center justify-center">
                  <ClipboardList className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-display text-base font-semibold leading-none">Checklist di papà · oggi</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">Da app di Riccardo · in tempo reale</div>
                </div>
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-status-warn/15 text-status-warn">
                {data.caregiverChecklist.filter((c) => !c.done).length} da fare
              </div>
            </div>
            <div className="space-y-1.5">
              {data.caregiverChecklist.map((c) => (
                <div key={c.id} className={`flex items-center gap-3 rounded-2xl px-3 py-2 ${c.done ? "bg-muted/40" : "bg-status-warn/10"}`}>
                  <div className={`h-7 w-7 rounded-full flex items-center justify-center text-sm shrink-0 ${c.done ? "bg-status-good/20" : "bg-white"}`}>
                    {c.done ? <Check className="h-3.5 w-3.5 text-status-good" /> : <span>{c.emoji}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-semibold leading-tight ${c.done ? "text-muted-foreground line-through" : ""}`}>{c.label}</div>
                    {c.time && <div className="text-[10px] text-muted-foreground mt-0.5">programmato {c.time}</div>}
                  </div>
                  {!c.done && (
                    <button
                      onClick={sendAlert}
                      className="shrink-0 px-2.5 py-1.5 rounded-full bg-foreground text-background text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"
                    >
                      <BellRing className="h-3 w-3" /> Alert
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={sendAlert}
              className="mt-3 w-full h-10 rounded-2xl gradient-dawn shadow-soft text-xs font-semibold flex items-center justify-center gap-1.5"
            >
              <BellRing className="h-3.5 w-3.5" /> Manda promemoria a Riccardo
            </button>
          </div>
        )}

        {/* Milestone — only for Matteo */}
        {showMilestone && id === "matteo" && milestones[0].new && (
          <div className="mt-5 relative overflow-hidden rounded-3xl gradient-dawn p-4 shadow-card animate-scale-bounce">
            <div className="absolute -top-4 -right-4 h-20 w-20 rounded-full bg-white/40 blur-xl" />
            <div className="flex items-start gap-3 relative">
              <div className="h-10 w-10 rounded-2xl bg-white/70 flex items-center justify-center shrink-0">
                <Sparkles className="h-5 w-5 text-foreground" />
              </div>
              <div className="flex-1">
                <div className="text-[10px] uppercase tracking-widest font-bold text-foreground/70">{t("Traguardo")}</div>
                <div className="font-display text-lg font-semibold leading-tight mt-0.5">{t(milestones[0].text)}</div>
                <div className="text-xs text-foreground/70 mt-0.5">{t(milestones[0].subtext)}</div>
                <div className="flex gap-2 mt-3">
                  <button onClick={fire} className="px-3 py-1.5 rounded-full bg-foreground text-background text-xs font-semibold">
                    {t("Festeggia 🎉")}
                  </button>
                  <button onClick={() => setShowMilestone(false)} className="px-3 py-1.5 rounded-full bg-white/60 text-xs font-semibold">
                    {t("Più tardi")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Educational suggestion */}
        <button
          onClick={() => nav("/learn")}
          className="mt-5 w-full text-left bg-card rounded-3xl p-3 shadow-soft flex items-center gap-3 active:scale-[0.99] transition-transform"
        >
          <div className={`h-14 w-14 rounded-2xl ${featuredVideo.gradient} flex items-center justify-center relative shrink-0`}>
            <Play className="h-5 w-5 text-foreground fill-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <GraduationCap className="h-3 w-3 text-muted-foreground" />
              <div className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">{t("Palm consiglia oggi")}</div>
            </div>
            <div className="font-semibold text-sm leading-tight mt-0.5 truncate">{featuredVideo.title}</div>
            <div className="text-[11px] text-muted-foreground">{featuredVideo.duration} · per {t(profile.name)}</div>
          </div>
          {isRtl ? <ChevronLeft className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />}
        </button>

        {/* Trend mini chart */}
        <div className="mt-5 rounded-3xl bg-card p-4 shadow-soft">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="font-display text-base font-semibold">{t(data.trend.label)}</div>
              <div className="text-[11px] text-muted-foreground">{t("Aggiornato in tempo reale")}</div>
            </div>
            <div className="px-2.5 py-1 rounded-full bg-status-good/15 text-status-good text-[10px] font-bold uppercase tracking-wider">
              {t(data.trend.tag)}
            </div>
          </div>
          <div className="flex items-end justify-between gap-1.5 h-20 mt-2">
            {series.map((d, i) => {
              const span = max - min || 1;
              const h = ((d.v - min + span * 0.2) / (span * 1.2)) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                  <div
                    className="w-full rounded-t-lg gradient-sunset transition-all"
                    style={{ height: `${h}%`, minHeight: 8 }}
                  />
                  <div className="text-[10px] text-muted-foreground">{d.day}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <div className="font-display text-lg font-semibold">{t("Prossimi appuntamenti")}</div>
            <button
              onClick={() => setShowAddAppt(true)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold shadow-soft"
            >
              <Plus className="h-3.5 w-3.5" /> {t("Aggiungi")}
            </button>
          </div>
          <div className="space-y-2.5">
            {[
              ...liveStore.appointments.map((a) => ({
                id: `live-${a.id}`,
                liveId: a.id,
                title: a.title,
                date: a.date,
                time: a.time,
                icon: a.icon,
                color: a.color,
                location: a.location,
                prep: a.prep,
                isLive: true as const,
              })),
              ...data.upcoming.map((e) => ({ ...e, id: String(e.id), liveId: undefined, isLive: false as const })),
            ].map((e) => {
              const bg = e.color === "pastel-blue" ? "bg-pastel-blue" : e.color === "pastel-mint" ? "bg-pastel-mint" : "bg-pastel-lavender";
              return (
                <div key={e.id} className={`bg-card rounded-2xl p-3 shadow-soft ${e.isLive ? "ring-1 ring-primary/30" : ""}`}>
                  <div className="flex items-start gap-3">
                    <div className={`h-12 w-12 rounded-xl ${bg} flex items-center justify-center text-2xl shrink-0`}>
                      {e.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold leading-tight flex items-center gap-2">
                        <span>{t(e.title)}</span>
                        {e.isLive && <span className="text-[9px] uppercase tracking-wider font-bold text-primary">Aggiunto</span>}
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">{e.date} · {e.time}</div>
                      {e.location && (
                        <div className="text-[11px] text-foreground/70 mt-1.5 flex items-start gap-1">
                          <MapPin className="h-3 w-3 mt-0.5 shrink-0 text-muted-foreground" />
                          <span>{t(e.location)}</span>
                        </div>
                      )}
                    </div>
                    {e.isLive ? (
                      <button
                        onClick={() => removeAppointment(id, e.liveId!)}
                        className="h-6 w-6 rounded-full hover:bg-muted flex items-center justify-center shrink-0"
                        aria-label={t("Rimuovi appuntamento")}
                      >
                        <X className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                    ) : isRtl ? <ChevronLeft className="h-4 w-4 text-muted-foreground shrink-0 mt-1" /> : <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />}
                  </div>
                  {e.prep && (
                    <div className="mt-2 ml-[60px] rounded-xl bg-pastel-peach/40 px-3 py-2">
                      <div className="text-[9px] uppercase tracking-wider font-bold text-foreground/60">{t("Da preparare")}</div>
                      <div className="text-[11px] text-foreground/80 leading-snug mt-0.5">{t(e.prep)}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent activity */}
        <div className="mt-6">
          <div className="font-display text-lg font-semibold mb-3">{t("Attività recente")}</div>
          <div className="bg-card rounded-3xl p-2 shadow-soft">
            {recentList.map((l, i) => (
              <div key={l.id} className={`flex items-center gap-3 px-3 py-2.5 ${i !== recentList.length - 1 ? "border-b border-border" : ""}`}>
                <div className="text-xs font-mono text-muted-foreground w-12">{l.time}</div>
                <div className="flex-1 text-sm">{t(l.detail)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showTour && <OnboardingTour onClose={() => setShowTour(false)} />}
      {showAddAppt && <AddAppointmentSheet onClose={() => setShowAddAppt(false)} />}
    </PhoneShell>
  );
};

export default Dashboard;
