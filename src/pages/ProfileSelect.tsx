import { useNavigate } from "react-router-dom";
import { ChevronRight, Plus, Settings } from "lucide-react";
import { PhoneShell } from "@/components/PhoneShell";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { profiles, ProfileId, profileOrder } from "@/lib/mockData";
import { setActiveProfile } from "@/hooks/useActiveProfile";
import { profilePhotos } from "@/lib/profilePhotos";
import { useLanguage } from "@/hooks/useLanguage";
import palmLogo from "@/assets/palm-logo.png";

const gradientByProfile: Record<ProfileId, string> = {
  matteo: "gradient-baby",
  chiara: "gradient-parent",
  riccardo: "gradient-warm",
  sofia: "gradient-sunset",
};

const ProfileSelect = () => {
  const nav = useNavigate();
  const { lang } = useLanguage();
  const isEn = lang === "en";

  const open = (id: ProfileId) => {
    setActiveProfile(id);
    nav("/dashboard");
  };

  return (
    <PhoneShell showNav={false} showChat={false} background="gradient-hero">
      <div className="relative h-full px-6 pt-14 pb-8 flex flex-col">
        <div className="absolute -top-10 -right-16 h-48 w-48 rounded-full gradient-sunset opacity-50 blur-3xl" />
        <div className="absolute top-40 -left-20 h-56 w-56 rounded-full gradient-sky opacity-50 blur-3xl" />

        <div className="relative flex items-center justify-between mb-2">
          <img src={palmLogo} alt="Palm — healthcare in your hands" className="h-10 w-auto object-contain" />
          <LanguageSwitcher />
        </div>

        <div className="relative mt-6" data-palm-no-translate>
          <div className="text-sm text-muted-foreground">{isEn ? "Good afternoon, Chiara" : "Buon pomeriggio, Chiara"}</div>
          <h1 className="font-display text-[2rem] font-semibold leading-tight mt-1 whitespace-pre-line">
            {isEn ? "Who are we caring\nfor today?" : "Di chi ci prendiamo\ncura oggi?"}
          </h1>
        </div>

        <div className="relative mt-6 space-y-3">
          {profileOrder.map((pid) => {
            const p = profiles[pid];
            return (
              <button
                key={pid}
                onClick={() => open(pid)}
                className={`relative w-full overflow-hidden rounded-[1.75rem] ${gradientByProfile[pid]} p-4 text-left shadow-card ring-1 ring-primary/25 border border-primary/15 transition-transform active:scale-[0.98] no-tap-highlight group`}
              >
                <div className="absolute -right-6 -bottom-6 h-24 w-24 rounded-full bg-white/40 blur-2xl" />
                <div className="relative flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-white/70 shadow-soft overflow-hidden ring-2 ring-primary/30 shrink-0">
                    <img
                      src={profilePhotos[pid]}
                      alt={p.name}
                      className="h-full w-full object-cover object-top scale-110"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] uppercase tracking-wider text-foreground/60 font-semibold">{p.relation}</div>
                    <div className="font-display text-2xl font-semibold leading-tight truncate">{p.name}</div>
                    <div className="text-[11px] text-foreground/70 mt-0.5">{p.ageLabel}</div>
                  </div>
                  <div className="h-9 w-9 rounded-full bg-foreground text-background flex items-center justify-center transition-transform group-hover:translate-x-1 shrink-0">
                    <ChevronRight className="h-5 w-5" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Add new family member — simplified */}
        <button
          onClick={() => nav("/add-profile")}
          data-palm-no-translate
          className="relative mt-3 w-full rounded-[1.5rem] border-2 border-dashed border-foreground/15 bg-white/40 p-4 text-left transition-colors hover:bg-white/60 flex items-center gap-3 active:scale-[0.99]"
        >
          <div className="h-12 w-12 rounded-full bg-white/60 flex items-center justify-center text-muted-foreground shrink-0">
            <Plus className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{isEn ? "Add family member" : "Aggiungi familiare"}</div>
            <div className="font-display text-base font-semibold text-foreground/80">{isEn ? "Create profile" : "Nuovo profilo"}</div>
          </div>
        </button>

        <div className="flex-1" />

        <button data-palm-no-translate className="relative mt-6 self-center text-xs text-muted-foreground flex items-center gap-1.5">
          <Settings className="h-3.5 w-3.5" />
          {isEn ? "Account and settings" : "Account e impostazioni"}
        </button>
      </div>
    </PhoneShell>
  );
};

export default ProfileSelect;
