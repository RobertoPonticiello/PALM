import { useState } from "react";
import { ChevronRight, Sparkles, Plus, FileText, MessageCircleHeart, GraduationCap, X } from "lucide-react";
import { useActiveProfile } from "@/hooks/useActiveProfile";

const STORAGE_KEY = "palm:onboarded";

export const hasOnboarded = () => {
  try { return localStorage.getItem(STORAGE_KEY) === "1"; } catch { return false; }
};

type ProfileKey = "matteo" | "chiara" | "riccardo" | "sofia";

const stepsByProfile: Record<ProfileKey, { icon: typeof Sparkles; title: string; body: string; gradient: string }[]> = {
  matteo: [
    { icon: Sparkles, title: "Palm conosce Romeo", body: "Età corretta, traiettoria di crescita, terapie post-TIN: Palm tiene tutto a mente. Chiedi pure di notte, sa rispondere su misura per lui.", gradient: "gradient-dawn" },
    { icon: Plus, title: "Registra in un tap", body: "Poppate, pannolini, peso, vitamina D. Due secondi e Palm trasforma tutto in tendenze utili al pediatra.", gradient: "gradient-warm" },
    { icon: GraduationCap, title: "Video per ex-prematuri", body: "Lavaggi nasali, massaggio anti-coliche, posizioni di allattamento. Curati per la sua età corretta.", gradient: "gradient-mint" },
    { icon: FileText, title: "Pronta per il pediatra in 30 secondi", body: "Crescita, sintomi, aderenza terapie, anamnesi: la Dr.ssa Bianchi entra in stanza già informata.", gradient: "gradient-sky" },
    { icon: MessageCircleHeart, title: "Mai sola — neanche di notte", body: "Se Romeo ti preoccupa, in 15 minuti parli in video con un neonatologo Palm. Ma prima Palm AI prova ad aiutarti.", gradient: "gradient-parent" },
  ],
  chiara: [
    { icon: Sparkles, title: "Palm prende cura di TE", body: "Sonno frammentato, post-partum, allattamento, ciclo: Palm conosce il tuo quadro e risponde su misura, senza giudicare.", gradient: "gradient-dawn" },
    { icon: GraduationCap, title: "Contenuti pensati per te", body: "Recupero pelvico, salute mentale perinatale, alimentazione in allattamento. Niente clickbait, solo evidenze.", gradient: "gradient-mint" },
    { icon: FileText, title: "Pronta per la ginecologa", body: "Sintomi, integratori, esami recenti: la dr.ssa Romano riceve tutto già organizzato prima del controllo.", gradient: "gradient-sky" },
    { icon: MessageCircleHeart, title: "Un medico in 15 minuti", body: "Quando ne senti il bisogno, parla in video con una ginecologa Palm o una psicologa perinatale. Mai da sola.", gradient: "gradient-parent" },
  ],
  riccardo: [
    { icon: Sparkles, title: "Palm segue tuo papà con te", body: "Pressione, glicemia, terapia cronica, appuntamenti dal cardiologo: Palm conosce Riccardo nei dettagli e ti risponde da caregiver.", gradient: "gradient-dawn" },
    { icon: MessageCircleHeart, title: "Promemoria sul SUO telefono", body: "Se Riccardo dimentica una pillola, Palm gli manda una notifica audio. Tu vedi cosa è preso e cosa manca.", gradient: "gradient-warm" },
    { icon: GraduationCap, title: "Contenuti pensati per la sua età", body: "Prevenzione cadute, attività fisica sicura, alimentazione in diabete e ipertensione. Curati per gli over-75.", gradient: "gradient-mint" },
    { icon: FileText, title: "Pronta per il geriatra", body: "Diario pressorio, aderenza terapeutica, ultimi esami: il dr. Lombardi entra in stanza già aggiornato.", gradient: "gradient-sky" },
    { icon: MessageCircleHeart, title: "Un geriatra in 15 minuti", body: "Quando qualcosa non torna, parli in video con un geriatra o un cardiologo Palm. Senza portarlo in ospedale.", gradient: "gradient-parent" },
  ],
  sofia: [
    { icon: Sparkles, title: "Palm conosce Sofia", body: "Crescita, vaccinazioni, sonno, linguaggio: Palm tiene tutto a mente e ti risponde su misura per i suoi 3 anni.", gradient: "gradient-dawn" },
    { icon: GraduationCap, title: "Contenuti per la sua età", body: "Febbre, capricci, sonno, alimentazione, prima visita dentistica. Curati con pediatri e psicologhe dell'infanzia.", gradient: "gradient-mint" },
    { icon: FileText, title: "Pronta per la pediatra", body: "Crescita, vaccinazioni, sintomi recenti: la Dr.ssa Bianchi entra in stanza già aggiornata.", gradient: "gradient-sky" },
    { icon: MessageCircleHeart, title: "Un pediatra in 15 minuti", body: "Se qualcosa non torna, parli in video con una pediatra Palm. Senza correre in ospedale.", gradient: "gradient-parent" },
  ],
};

const introByProfile: Record<ProfileKey, string> = {
  matteo: "Benvenuta in Palm",
  chiara: "Benvenuta in Palm",
  riccardo: "Palm per la tua famiglia",
  sofia: "Benvenuta in Palm",
};

export const OnboardingTour = ({ onClose }: { onClose: () => void }) => {
  const { id } = useActiveProfile();
  const profileKey = (["matteo", "chiara", "riccardo"].includes(id) ? id : "matteo") as ProfileKey;
  const steps = stepsByProfile[profileKey];
  const intro = introByProfile[profileKey];
  const [i, setI] = useState(0);
  const Step = steps[i];
  const Icon = Step.icon;
  const last = i === steps.length - 1;

  const finish = () => {
    try { localStorage.setItem(STORAGE_KEY, "1"); } catch {}
    onClose();
  };

  return (
    <div className="absolute inset-0 z-[60] animate-fade-in">
      <div className="absolute inset-0 bg-foreground/30 backdrop-blur-md" />
      <div className="absolute inset-x-4 top-16 bottom-20 glass rounded-[2.5rem] shadow-float flex flex-col overflow-hidden animate-slide-up-fade">
        <div className="flex items-center justify-between px-5 pt-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl gradient-dawn shadow-soft" />
            <span className="font-display text-base font-semibold">{intro}</span>
          </div>
          <button onClick={finish} aria-label="Salta" className="h-9 w-9 rounded-full bg-white/60 flex items-center justify-center">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Hero illustration */}
        <div className={`mx-5 mt-4 rounded-3xl ${Step.gradient} relative overflow-hidden h-44 flex items-center justify-center shadow-card`}>
          <div className="absolute -top-8 -right-8 h-28 w-28 rounded-full bg-white/40 blur-2xl" />
          <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/30 blur-2xl" />
          <div className="relative h-20 w-20 rounded-3xl bg-white/70 shadow-soft flex items-center justify-center animate-scale-bounce">
            <Icon className="h-10 w-10 text-foreground" strokeWidth={1.8} />
          </div>
        </div>

        <div className="flex-1 px-6 pt-5 overflow-y-auto">
          <div className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
            Passo {i + 1} di {steps.length}
          </div>
          <h2 className="font-display text-2xl font-semibold leading-tight mt-1.5">{Step.title}</h2>
          <p className="text-sm text-foreground/70 leading-relaxed mt-2.5">{Step.body}</p>
        </div>

        {/* Dots + CTA */}
        <div className="px-5 pb-5">
          <div className="flex items-center justify-center gap-1.5 mb-3">
            {steps.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all ${idx === i ? "w-6 bg-foreground" : "w-1.5 bg-foreground/25"}`}
              />
            ))}
          </div>
          <button
            onClick={() => (last ? finish() : setI(i + 1))}
            className="w-full h-14 rounded-2xl gradient-sunset font-display text-lg font-semibold shadow-card transition-transform active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {last ? "Inizia con Palm" : "Avanti"}
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
