import { useNavigate } from "react-router-dom";
import { ChevronLeft, Play, Sparkles, ExternalLink, Search } from "lucide-react";
import { PhoneShell } from "@/components/PhoneShell";
import { eduVideos } from "@/lib/mockData";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { useActiveProfile } from "@/hooks/useActiveProfile";
import { useT } from "@/lib/i18n";
import { VideoThumbArt } from "@/components/VideoThumbArt";
import { usePregnancyMode } from "@/hooks/usePregnancyMode";

const heroCopy = {
  matteo: {
    badge: "Palm ha scelto per Romeo",
    title: "Selezionati per età corretta:",
    sub: "0 mesi e 18 giorni",
    body: "Niente video generici. Solo cose che servono ora a te e a Romeo — riviste con i nostri Palm Doctors.",
  },
  chiara: {
    badge: "Palm ha scelto per Chiara",
    title: "Per il tuo recupero post-partum",
    sub: "35 anni · prime 12 settimane",
    body: "Recupero del corpo, salute mentale, allattamento e sonno. Tutto guidato da ostetriche e psicologhe perinatali.",
  },
  riccardo: {
    badge: "Palm ha scelto per Riccardo",
    title: "Per la tua salute, ogni giorno",
    sub: "79 anni · cuore e movimento",
    body: "Esercizi sicuri a casa, gestione dei farmaci, prevenzione cadute. Curati con geriatri e fisioterapisti.",
  },
  sofia: {
    badge: "Palm ha scelto per Sofia",
    title: "Per i suoi 3 anni",
    sub: "tappe, cura, gioco",
    body: "Sonno, alimentazione, capricci, linguaggio, salute orale. Tutto rivisto con pediatri e psicologhe dell'infanzia.",
  },
} as const;

const pregnancyHero = {
  badge: "Palm ha scelto per la tua gravidanza",
  title: "Per la settimana 24",
  sub: "2° trimestre · corpo, alimentazione, parto",
  body: "Contenuti curati con ostetriche e ginecologhe — niente paure inutili, solo quello che serve davvero a te ora.",
};

const Learn = () => {
  const nav = useNavigate();
  const { id, profile } = useActiveProfile();
  const { t } = useT(id);
  const { on: pregnant } = usePregnancyMode();
  const isPregnancyView = id === "chiara" && pregnant;

  // Filter to videos for the active profile (matteo legacy = no profile field)
  const profileVideos = useMemo(
    () => {
      if (isPregnancyView) {
        return eduVideos.filter((v) => v.id.startsWith("preg-"));
      }
      return eduVideos.filter((v) => (v.profile ?? "matteo") === id);
    },
    [id, isPregnancyView],
  );

  const cats = useMemo(
    () => ["Tutti", ...Array.from(new Set(profileVideos.map((v) => v.category)))],
    [profileVideos],
  );

  const [filter, setFilter] = useState<string>("Tutti");
  const list = filter === "Tutti" ? profileVideos : profileVideos.filter((v) => v.category === filter);
  const hero = isPregnancyView ? pregnancyHero : heroCopy[id];

  return (
    <PhoneShell>
      <div className="px-5 pt-14 pb-6">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => nav(-1)} className="h-10 w-10 rounded-full glass flex items-center justify-center">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="text-center">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">{t("Impara")}</div>
            <div className="font-display text-base font-semibold">{t(`Video per ${profile.name}`)}</div>
          </div>
          <button className="h-10 w-10 rounded-full glass flex items-center justify-center">
            <Search className="h-4 w-4" />
          </button>
        </div>

        {/* Hero — Palm proactive */}
        <div className="rounded-[2rem] gradient-dawn p-5 shadow-card relative overflow-hidden">
          <div className="absolute -top-6 -right-6 h-28 w-28 rounded-full bg-white/40 blur-2xl" />
          <div className="relative">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-2xl bg-white/70 flex items-center justify-center">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="text-[10px] uppercase tracking-widest font-bold text-foreground/70">{t(hero.badge)}</div>
            </div>
            <h1 className="font-display text-2xl font-semibold leading-tight mt-2">
              {t(hero.title)}<br />
              <span className="text-foreground/70 text-lg font-normal">{t(hero.sub)}</span>
            </h1>
            <p className="text-xs text-foreground/70 mt-2 leading-relaxed">{t(hero.body)}</p>
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-5 px-5 mt-5 pb-2">
          {cats.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={cn(
                "shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all",
                filter === c ? "bg-foreground text-background" : "bg-card text-muted-foreground",
              )}
            >
              {c}
            </button>
          ))}
        </div>

        {list.length === 0 ? (
          <div className="mt-6 text-center text-sm text-muted-foreground">{t("Nessun video in questa categoria.")}</div>
        ) : (
          <>
            {/* Featured card */}
            {filter === "Tutti" && (
              <a
                href={list[0].url}
                target="_blank"
                rel="noopener noreferrer"
                className="block mt-4 rounded-3xl bg-card shadow-card overflow-hidden active:scale-[0.99] transition-transform"
              >
                <div className={`h-44 ${list[0].gradient} relative overflow-hidden flex items-center justify-center`}>
                  <VideoThumbArt category={list[0].category} variant="featured" />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-foreground/25" />
                  <div className="relative h-16 w-16 rounded-full bg-white/95 shadow-float flex items-center justify-center backdrop-blur">
                    <Play className="h-7 w-7 text-foreground fill-foreground ml-1" />
                  </div>
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/85 backdrop-blur text-[10px] font-bold uppercase tracking-wider">
                    {t("In primo piano")}
                  </div>
                  <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-foreground/75 text-background text-[10px] font-mono">
                    {list[0].duration}
                  </div>
                </div>
                <div className="p-4">
                  <div className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">{list[0].category} · {list[0].ageBand}</div>
                  <div className="font-display text-lg font-semibold leading-tight mt-1">{list[0].title}</div>
                  <div className="text-xs text-muted-foreground mt-1">{list[0].description}</div>
                </div>
              </a>
            )}

            {/* Grid list */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              {(filter === "Tutti" ? list.slice(1) : list).map((v) => (
                <a
                  key={v.id}
                  href={v.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-card rounded-2xl shadow-soft overflow-hidden active:scale-[0.98] transition-transform"
                >
                  <div className={`h-28 ${v.gradient} relative overflow-hidden flex items-center justify-center`}>
                    <VideoThumbArt category={v.category} variant="grid" />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-foreground/20" />
                    <div className="relative h-10 w-10 rounded-full bg-white/95 shadow-soft flex items-center justify-center backdrop-blur">
                      <Play className="h-4 w-4 text-foreground fill-foreground ml-0.5" />
                    </div>
                    <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-full bg-white/80 backdrop-blur text-[9px] font-semibold uppercase tracking-wider">
                      {v.category}
                    </div>
                    <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded-full bg-foreground/75 text-background text-[9px] font-mono">
                      {v.duration}
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground">{v.category}</div>
                    <div className="font-semibold text-[13px] leading-tight mt-0.5 line-clamp-2">{v.title}</div>
                    <div className="flex items-center gap-1 mt-1.5 text-[10px] text-muted-foreground">
                      <ExternalLink className="h-2.5 w-2.5" /> {t("Apri video")}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </>
        )}

        <div className="mt-6 text-center text-[10px] text-muted-foreground">
          {t("Curato dal team Palm · revisionato da pediatri, ginecologi e geriatri")}
        </div>
      </div>
    </PhoneShell>
  );
};

export default Learn;
