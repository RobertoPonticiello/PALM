import { createContext, useContext, useEffect, useRef, useState } from "react";
import { ArrowRight, Check, Heart, Sparkles, Stethoscope, MessageCircle, ChevronDown, Database, Link2, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { LandingLangProvider, useLandingLang } from "@/lib/landingLang";
import { landingCopy as c, tx } from "@/lib/landingCopy";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import palmIcon from "@/assets/palm-icon.png";
import heroStill from "@/assets/landing-hero-hands-v4.jpg";
import storyImg from "@/assets/landing-story-family-kitchen.jpg";
import appPreview from "@/assets/landing-app-dashboard-v3.png";

const Logo = ({ className = "h-9 w-9" }: { className?: string }) => (
  <img src={palmIcon} alt="Palm logo" className={className} width={512} height={512} />
);

const LangToggle = () => {
  const { locale, setLocale } = useLandingLang();
  return (
    <div className="inline-flex items-center rounded-full bg-card/70 backdrop-blur border border-border/60 p-1 text-xs font-medium">
      {(["it", "en"] as const).map((l) => (
        <button
          key={l}
          onClick={() => setLocale(l)}
          className={`px-3 py-1 rounded-full transition-colors ${
            locale === l ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
};

// ----- Waitlist dialog context -----
type WaitlistCtx = { open: () => void };
const WaitlistContext = createContext<WaitlistCtx>({ open: () => {} });
const useWaitlist = () => useContext(WaitlistContext);

const Nav = () => {
  const { locale } = useLandingLang();
  return (
    <header className="fixed top-0 inset-x-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 py-4">
        <div className="glass rounded-full px-4 sm:px-6 py-2.5 flex items-center justify-between shadow-soft">
          <a href="#top" className="flex items-center gap-2.5">
            <Logo className="h-8 w-8" />
            <span className="font-display text-xl text-foreground tracking-tight">Palm</span>
          </a>
          <nav className="hidden md:flex items-center gap-7 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition">{tx(c.nav.features, locale)}</a>
            <a href="#story" className="hover:text-foreground transition">{tx(c.nav.story, locale)}</a>
            <a href="#doctors" className="hover:text-foreground transition">{tx(c.nav.doctors, locale)}</a>
            <a href="#faq" className="hover:text-foreground transition">{tx(c.nav.faq, locale)}</a>
          </nav>
          <div className="flex items-center gap-2">
            <LangToggle />
            <NavWaitlistButton />
          </div>
        </div>
      </div>
    </header>
  );
};

const NavWaitlistButton = () => {
  const { locale } = useLandingLang();
  const { open } = useWaitlist();
  return (
    <Button
      size="sm"
      onClick={open}
      className="hidden sm:inline-flex rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
    >
      {tx(c.nav.waitlist, locale)}
    </Button>
  );
};

const Hero = () => {
  const { locale } = useLandingLang();
  const { open } = useWaitlist();
  return (
    <section id="top" className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      <div className="absolute inset-0 gradient-hero opacity-90" />
      <div className="absolute -top-20 -right-20 h-96 w-96 rounded-full gradient-mint opacity-50 blur-3xl" />
      <div className="absolute -bottom-32 -left-20 h-96 w-96 rounded-full gradient-warm opacity-60 blur-3xl" />
      <div className="relative mx-auto max-w-7xl px-6 lg:px-10 grid md:grid-cols-12 gap-10 md:gap-12 items-center">
        <div className="md:col-span-7 animate-[slide-up-fade_0.8s_cubic-bezier(0.22,1,0.36,1)_both]">
          <span className="inline-flex items-center gap-2 rounded-full bg-card/80 backdrop-blur px-3.5 py-1.5 text-xs font-medium text-primary border border-primary/15">
            <Sparkles className="h-3.5 w-3.5" /> {tx(c.hero.eyebrow, locale)}
          </span>
          <h1 className="mt-6 font-display text-5xl sm:text-6xl md:text-[5.5rem] leading-[0.95] text-primary tracking-tight lowercase">
            palm
          </h1>
          <p className="mt-4 font-display text-2xl sm:text-3xl md:text-[2.25rem] leading-[1.15] text-foreground lowercase">
            {tx(c.hero.title, locale)}
          </p>
          <p className="mt-7 text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl">
            {tx(c.hero.sub, locale)}
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Button
              size="lg"
              onClick={open}
              className="rounded-full px-8 h-14 text-base bg-primary text-primary-foreground hover:bg-primary/90 shadow-card"
            >
              {tx(c.hero.cta, locale)} <ArrowRight className="ml-1.5 h-5 w-5" />
            </Button>
          </div>
          <p className="mt-6 text-xs uppercase tracking-wider text-muted-foreground/80">
            {tx(c.hero.trust, locale)}
          </p>
        </div>
        <div className="md:col-span-5 relative animate-[scale-bounce_0.9s_cubic-bezier(0.22,1,0.36,1)_both]">
          <div className="absolute inset-0 rounded-full gradient-sunset opacity-40 blur-3xl" />
          <div className="relative rounded-[2rem] overflow-hidden shadow-float max-w-md mx-auto border border-primary/15">
            <img
              src={heroStill}
              alt="An elderly hand and a younger hand resting together — intergenerational care"
              width={1024}
              height={1024}
              className="w-full h-auto object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

const Story = () => {
  const { locale } = useLandingLang();
  return (
    <section id="story" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 grid md:grid-cols-2 gap-14 items-center">
        <div className="relative order-2 md:order-1">
          <div className="rounded-[2rem] overflow-hidden shadow-card border border-primary/10">
            <img
              src={storyImg}
              alt="Three generations of a family together in a sunlit kitchen"
              loading="lazy"
              width={1024}
              height={1024}
              className="w-full h-auto object-cover"
            />
          </div>
        </div>
        <div className="order-1 md:order-2">
          <span className="text-xs uppercase tracking-[0.2em] text-primary/80 font-medium">{tx(c.story.eyebrow, locale)}</span>
          <h2 className="mt-3 font-display text-4xl md:text-5xl leading-tight text-foreground">{tx(c.story.title, locale)}</h2>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">{tx(c.story.body1, locale)}</p>
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed">{tx(c.story.body2, locale)}</p>
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed">{tx(c.story.body3, locale)}</p>
        </div>
      </div>
    </section>
  );
};

const Features = () => {
  const { locale } = useLandingLang();
  const icons = [Database, Link2, MessageCircle, Brain];
  const tints = ["gradient-mint", "gradient-sunset", "gradient-sky", "gradient-warm"];
  return (
    <section id="features" className="relative py-24 md:py-32 bg-card/50">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="max-w-2xl mb-12">
          <span className="text-xs uppercase tracking-[0.2em] text-primary/80 font-medium">{tx(c.features.eyebrow, locale)}</span>
          <h2 className="mt-3 font-display text-4xl md:text-5xl leading-tight text-foreground">{tx(c.features.title, locale)}</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-5">
          {c.features.items.map((it, i) => {
            const Icon = icons[i];
            return (
              <div
                key={i}
                className="group relative rounded-3xl bg-card border-2 border-primary/40 p-7 transition-all duration-500 hover:-translate-y-1 hover:border-primary/70"
                style={{ boxShadow: "0 0 0 1px hsl(var(--primary) / 0.1), 0 10px 40px -10px hsl(var(--primary) / 0.35)" }}
              >
                <div className="absolute inset-0 rounded-3xl opacity-60 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: "radial-gradient(120% 80% at 50% 0%, hsl(var(--primary) / 0.10), transparent 65%)" }} />
                <div className={`relative h-12 w-12 rounded-2xl ${tints[i]} flex items-center justify-center shadow-soft`}>
                  <Icon className="h-5 w-5 text-primary" strokeWidth={2} />
                </div>
                <h3 className="relative mt-5 font-display text-2xl text-foreground">{tx(it.title, locale)}</h3>
                <p className="relative mt-3 text-muted-foreground leading-relaxed">{tx(it.body, locale)}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

const AppPreview = () => {
  const { locale } = useLandingLang();
  const isIt = locale === "it";
  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      <div className="absolute inset-0 gradient-warm opacity-60" />
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-[28rem] w-[28rem] rounded-full gradient-mint opacity-40 blur-3xl" />
      <div className="relative mx-auto max-w-7xl px-6 lg:px-10 grid md:grid-cols-2 gap-12 md:gap-16 items-center">
        <div>
          <span className="text-xs uppercase tracking-[0.2em] text-primary/80 font-medium">
            {isIt ? "Dentro l'app" : "Inside the app"}
          </span>
          <h2 className="mt-3 font-display text-4xl md:text-5xl leading-tight text-foreground">
            {isIt ? "Un assistente AI che conosce la tua storia." : "An AI that knows your story."}
          </h2>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-lg">
            {isIt
              ? "Apri Palm e parli subito con il tuo agente sanitario. Risponde nel contesto dei tuoi referti, delle tue terapie e di chi ami — con la stessa calma di un amico che sa di medicina."
              : "Open Palm and you're already talking to your health agent. It answers in the context of your records, your therapies and the people you love — with the calm of a friend who knows medicine."}
          </p>
        </div>
        <div className="relative flex justify-center">
          <div className="absolute inset-0 rounded-full gradient-mint opacity-50 blur-3xl" />
          <img
            src={appPreview}
            alt="Palm app dashboard preview on a phone"
            loading="lazy"
            width={896}
            height={1344}
            className="relative w-full max-w-sm h-auto drop-shadow-[0_40px_50px_rgba(31,69,49,0.25)]"
          />
        </div>
      </div>
    </section>
  );
};

const How = () => {
  const { locale } = useLandingLang();
  return (
    <section className="py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="max-w-2xl">
          <span className="text-xs uppercase tracking-[0.2em] text-primary/80 font-medium">{tx(c.how.eyebrow, locale)}</span>
          <h2 className="mt-3 font-display text-4xl md:text-5xl leading-tight text-foreground">{tx(c.how.title, locale)}</h2>
        </div>
        <div className="mt-14 grid md:grid-cols-3 gap-5">
          {c.how.steps.map((s, i) => (
            <div key={i} className="relative rounded-3xl bg-card border border-border/60 p-7 shadow-soft">
              <span className="font-display text-6xl text-primary/15 leading-none">{s.n}</span>
              <h3 className="mt-3 font-display text-2xl text-foreground">{tx(s.title, locale)}</h3>
              <p className="mt-3 text-muted-foreground leading-relaxed">{tx(s.body, locale)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Doctors = () => {
  const { locale } = useLandingLang();
  return (
    <section id="doctors" className="relative py-24 md:py-32 overflow-hidden">
      <div className="absolute inset-0 gradient-parent opacity-50" />
      <div className="absolute -top-32 -right-32 h-[28rem] w-[28rem] rounded-full gradient-mint opacity-40 blur-3xl" />
      <div className="relative mx-auto max-w-5xl px-6 lg:px-10 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-card/80 backdrop-blur px-3.5 py-1.5 text-xs font-medium text-primary border border-primary/15">
          <Stethoscope className="h-3.5 w-3.5" /> {tx(c.doctors.eyebrow, locale)}
        </div>
        <h2 className="mt-6 font-display text-4xl md:text-5xl leading-tight text-foreground max-w-3xl mx-auto">
          {tx(c.doctors.title, locale)}
        </h2>
        <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
          {tx(c.doctors.body, locale)}
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {c.doctors.bullets.map((b, i) => (
            <span key={i} className="inline-flex items-center gap-2 rounded-full bg-card/90 backdrop-blur px-4 py-2 text-sm text-foreground border border-border/60 shadow-soft">
              <Check className="h-4 w-4 text-primary" /> {tx(b, locale)}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

const FAQ = () => {
  const { locale } = useLandingLang();
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="py-24 md:py-32">
      <div className="mx-auto max-w-3xl px-6 lg:px-10">
        <span className="text-xs uppercase tracking-[0.2em] text-primary/80 font-medium">{tx(c.faq.eyebrow, locale)}</span>
        <h2 className="mt-3 font-display text-4xl md:text-5xl leading-tight text-foreground">{tx(c.faq.title, locale)}</h2>
        <div className="mt-10 space-y-3">
          {c.faq.items.map((it, i) => {
            const isOpen = open === i;
            return (
              <button
                key={i}
                onClick={() => setOpen(isOpen ? null : i)}
                className="w-full text-left rounded-2xl bg-card border border-border/60 p-6 shadow-soft transition-all hover:shadow-card"
              >
                <div className="flex items-start justify-between gap-4">
                  <h3 className="font-display text-xl text-foreground">{tx(it.q, locale)}</h3>
                  <ChevronDown className={`h-5 w-5 text-muted-foreground shrink-0 mt-1 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </div>
                {isOpen && <p className="mt-4 text-muted-foreground leading-relaxed">{tx(it.a, locale)}</p>}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

const WaitlistForm = ({ autoFocus = false }: { autoFocus?: boolean }) => {
  const { locale } = useLandingLang();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
    if (!valid) {
      toast({ title: tx(c.waitlist.invalidEmail, locale), variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("waitlist").insert({
      email: trimmed,
      name: name.trim() || null,
      role: null,
      locale,
      source: "landing",
    });
    setLoading(false);
    if (error) {
      const dup = (error.message || "").toLowerCase().includes("duplicate") || (error as any).code === "23505";
      toast({
        title: dup ? tx(c.waitlist.duplicate, locale) : tx(c.waitlist.error, locale),
        variant: dup ? "default" : "destructive",
      });
      if (dup) setDone(true);
      return;
    }
    setDone(true);
    toast({ title: tx(c.waitlist.successTitle, locale), description: tx(c.waitlist.successBody, locale) });
  };

  if (done) {
    return (
      <div className="rounded-3xl bg-card border border-primary/20 p-8 shadow-soft text-center animate-[scale-bounce_0.5s_cubic-bezier(0.34,1.56,0.64,1)_both]">
        <div className="mx-auto h-14 w-14 rounded-full gradient-mint flex items-center justify-center shadow-soft">
          <Check className="h-7 w-7 text-foreground" strokeWidth={2.5} />
        </div>
        <h3 className="mt-4 font-display text-2xl text-foreground">{tx(c.waitlist.successTitle, locale)}</h3>
        <p className="mt-2 text-muted-foreground">{tx(c.waitlist.successBody, locale)}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 text-left">
      <Input
        type="email"
        required
        autoFocus={autoFocus}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={tx(c.waitlist.emailPlaceholder, locale)}
        className="h-12 rounded-2xl bg-background border-border/60"
        maxLength={254}
      />
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={tx(c.waitlist.namePlaceholder, locale)}
        className="h-12 rounded-2xl bg-background border-border/60"
        maxLength={120}
      />
      <Button
        type="submit"
        disabled={loading}
        size="lg"
        className="w-full h-12 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft"
      >
        {loading ? tx(c.waitlist.submitting, locale) : tx(c.waitlist.submit, locale)}
        {!loading && <ArrowRight className="ml-1 h-4 w-4" />}
      </Button>
    </form>
  );
};

const Waitlist = () => {
  const { locale } = useLandingLang();
  return (
    <section id="waitlist" className="relative py-24 md:py-32 overflow-hidden">
      <div className="absolute inset-0 gradient-hero opacity-80" />
      <div className="relative mx-auto max-w-2xl px-6 lg:px-10 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-card/80 backdrop-blur px-3.5 py-1.5 text-xs font-medium text-primary border border-primary/15">
          <Heart className="h-3.5 w-3.5" /> {tx(c.waitlist.eyebrow, locale)}
        </div>
        <h2 className="mt-6 font-display text-4xl md:text-5xl leading-tight text-foreground">
          {tx(c.waitlist.title, locale)}
        </h2>
        <p className="mt-5 text-lg text-muted-foreground leading-relaxed">{tx(c.waitlist.sub, locale)}</p>
        <div className="mt-10 rounded-3xl bg-card border border-border/60 p-6 sm:p-8 shadow-card">
          <WaitlistForm />
        </div>
      </div>
    </section>
  );
};

const WaitlistDialog = ({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) => {
  const { locale } = useLandingLang();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-3xl border-border/60 bg-card p-6 sm:p-8">
        <DialogHeader className="text-left">
          <div className="inline-flex items-center gap-2 self-start rounded-full bg-secondary/60 px-3 py-1 text-xs font-medium text-primary">
            <Heart className="h-3.5 w-3.5" /> {tx(c.waitlist.eyebrow, locale)}
          </div>
          <DialogTitle className="mt-3 font-display text-3xl text-foreground leading-tight">
            {tx(c.waitlist.title, locale)}
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground leading-relaxed">
            {tx(c.waitlist.sub, locale)}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <WaitlistForm autoFocus />
        </div>
      </DialogContent>
    </Dialog>
  );
};

const Footer = () => {
  const { locale } = useLandingLang();
  return (
    <footer className="border-t border-border/50 bg-card/50">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <Logo className="h-8 w-8" />
          <div>
            <div className="font-display text-xl text-foreground leading-none">Palm</div>
            <div className="text-xs text-muted-foreground mt-1">{tx(c.footer.tagline, locale)}</div>
          </div>
        </div>
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <a href="#waitlist" className="hover:text-foreground transition">{tx(c.footer.contact, locale)}</a>
          <a href="#faq" className="hover:text-foreground transition">{tx(c.footer.privacy, locale)}</a>
          <span>© {new Date().getFullYear()} Palm. {tx(c.footer.rights, locale)}</span>
        </div>
      </div>
    </footer>
  );
};

const LandingInner = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
    return () => { document.documentElement.style.scrollBehavior = ""; };
  }, []);
  return (
    <WaitlistContext.Provider value={{ open: () => setDialogOpen(true) }}>
      <main className="min-h-screen bg-background text-foreground">
        <Nav />
        <Hero />
        <Story />
        <Features />
        <AppPreview />
        <How />
        <Doctors />
        <FAQ />
        <Waitlist />
        <Footer />
      </main>
      <WaitlistDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </WaitlistContext.Provider>
  );
};

const Landing = () => (
  <LandingLangProvider>
    <LandingInner />
  </LandingLangProvider>
);

export default Landing;
