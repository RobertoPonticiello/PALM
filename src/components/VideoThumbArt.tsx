/**
 * Abstract, on-brand SVG artwork for video thumbnails.
 * Uses the app's pastel palette via currentColor + low-opacity layers,
 * so it sits nicely on top of any gradient background.
 * No emoji, no photos — just soft geometric shapes that hint at the topic.
 */

type Variant = "featured" | "grid";

const Wrap = ({ children }: { children: React.ReactNode }) => (
  <svg
    viewBox="0 0 200 120"
    preserveAspectRatio="xMidYMid slice"
    className="absolute inset-0 h-full w-full text-foreground"
    aria-hidden
  >
    {children}
  </svg>
);

const ArtCura = () => (
  <Wrap>
    {/* water droplets */}
    <circle cx="55" cy="55" r="28" fill="white" fillOpacity="0.45" />
    <circle cx="55" cy="55" r="18" fill="white" fillOpacity="0.55" />
    <circle cx="140" cy="40" r="14" fill="currentColor" fillOpacity="0.08" />
    <circle cx="160" cy="80" r="22" fill="white" fillOpacity="0.35" />
    <circle cx="100" cy="95" r="6" fill="white" fillOpacity="0.5" />
  </Wrap>
);

const ArtAllattamento = () => (
  <Wrap>
    {/* soft heart + curves */}
    <path d="M40 70 q-20 -25 5 -35 q15 -6 25 8 q10 -14 25 -8 q25 10 5 35 q-15 18 -30 30 q-15 -12 -30 -30 z" fill="white" fillOpacity="0.5" />
    <circle cx="160" cy="35" r="20" fill="currentColor" fillOpacity="0.08" />
    <circle cx="170" cy="90" r="12" fill="white" fillOpacity="0.45" />
  </Wrap>
);

const ArtComfort = () => (
  <Wrap>
    {/* concentric soft rings */}
    <circle cx="100" cy="60" r="50" fill="white" fillOpacity="0.25" />
    <circle cx="100" cy="60" r="34" fill="white" fillOpacity="0.35" />
    <circle cx="100" cy="60" r="18" fill="white" fillOpacity="0.55" />
    <circle cx="40" cy="100" r="10" fill="currentColor" fillOpacity="0.1" />
  </Wrap>
);

const ArtSviluppo = () => (
  <Wrap>
    {/* growing arc */}
    <path d="M20 100 Q 100 20, 180 100" stroke="white" strokeOpacity="0.6" strokeWidth="6" fill="none" strokeLinecap="round" />
    <circle cx="180" cy="100" r="9" fill="white" fillOpacity="0.85" />
    <circle cx="60" cy="78" r="5" fill="currentColor" fillOpacity="0.2" />
    <circle cx="110" cy="50" r="6" fill="currentColor" fillOpacity="0.15" />
  </Wrap>
);

const ArtSonno = () => (
  <Wrap>
    {/* moon + stars */}
    <path d="M150 30 a 35 35 0 1 0 20 70 a 28 28 0 1 1 -20 -70 z" fill="white" fillOpacity="0.6" />
    <circle cx="40" cy="40" r="2.5" fill="white" fillOpacity="0.9" />
    <circle cx="70" cy="80" r="2" fill="white" fillOpacity="0.7" />
    <circle cx="30" cy="90" r="1.8" fill="white" fillOpacity="0.7" />
    <circle cx="100" cy="30" r="2" fill="white" fillOpacity="0.6" />
  </Wrap>
);

const ArtMente = () => (
  <Wrap>
    {/* soft brain-like loops */}
    <path d="M55 35 q-25 25 0 50 q-15 5 -10 25" stroke="white" strokeOpacity="0.55" strokeWidth="5" fill="none" strokeLinecap="round" />
    <path d="M120 25 q35 20 25 55 q-5 15 10 25" stroke="white" strokeOpacity="0.55" strokeWidth="5" fill="none" strokeLinecap="round" />
    <circle cx="100" cy="60" r="14" fill="white" fillOpacity="0.5" />
  </Wrap>
);

const ArtCardio = () => (
  <Wrap>
    {/* heartbeat line */}
    <path d="M0 70 L50 70 L65 45 L80 95 L100 55 L115 70 L200 70" stroke="white" strokeOpacity="0.7" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="160" cy="35" r="14" fill="currentColor" fillOpacity="0.08" />
  </Wrap>
);

const ArtMovimento = () => (
  <Wrap>
    {/* steps / arrows ascending */}
    <rect x="20" y="80" width="35" height="18" rx="4" fill="white" fillOpacity="0.5" />
    <rect x="60" y="60" width="35" height="38" rx="4" fill="white" fillOpacity="0.55" />
    <rect x="100" y="40" width="35" height="58" rx="4" fill="white" fillOpacity="0.6" />
    <rect x="140" y="20" width="35" height="78" rx="4" fill="white" fillOpacity="0.65" />
  </Wrap>
);

const ArtTerapia = () => (
  <Wrap>
    {/* pill capsule */}
    <g transform="rotate(-25 100 60)">
      <rect x="55" y="45" width="90" height="34" rx="17" fill="white" fillOpacity="0.55" />
      <rect x="55" y="45" width="45" height="34" rx="17" fill="currentColor" fillOpacity="0.12" />
    </g>
    <circle cx="40" cy="30" r="8" fill="white" fillOpacity="0.5" />
    <circle cx="170" cy="100" r="6" fill="white" fillOpacity="0.5" />
  </Wrap>
);

const ArtRecupero = () => (
  <Wrap>
    {/* blooming petals */}
    <g transform="translate(100 60)">
      {[0, 60, 120, 180, 240, 300].map((a) => (
        <ellipse
          key={a}
          cx="0"
          cy="-22"
          rx="10"
          ry="22"
          fill="white"
          fillOpacity="0.45"
          transform={`rotate(${a})`}
        />
      ))}
      <circle r="9" fill="white" fillOpacity="0.85" />
    </g>
  </Wrap>
);

const ArtNutrizione = () => (
  <Wrap>
    {/* bowl with leaf */}
    <path d="M40 60 q60 -45 120 0 z" fill="currentColor" fillOpacity="0.1" />
    <path d="M40 60 q60 60 120 0 z" fill="white" fillOpacity="0.55" />
    <path d="M95 30 q15 -15 30 0 q-5 18 -30 0 z" fill="white" fillOpacity="0.7" />
  </Wrap>
);

const ArtDefault = () => (
  <Wrap>
    <circle cx="60" cy="50" r="32" fill="white" fillOpacity="0.4" />
    <circle cx="140" cy="80" r="26" fill="white" fillOpacity="0.35" />
    <circle cx="170" cy="30" r="10" fill="currentColor" fillOpacity="0.1" />
  </Wrap>
);

const MAP: Record<string, () => JSX.Element> = {
  Cura: ArtCura,
  Allattamento: ArtAllattamento,
  Comfort: ArtComfort,
  Sviluppo: ArtSviluppo,
  Sonno: ArtSonno,
  Mente: ArtMente,
  Cardio: ArtCardio,
  Movimento: ArtMovimento,
  Terapia: ArtTerapia,
  Recupero: ArtRecupero,
  Nutrizione: ArtNutrizione,
};

export const VideoThumbArt = ({ category, variant = "grid" }: { category: string; variant?: Variant }) => {
  const Art = MAP[category] ?? ArtDefault;
  return (
    <div className="absolute inset-0">
      {/* soft glow accents shared across all variants */}
      <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-white/35 blur-2xl" />
      <div className="absolute -bottom-8 -left-8 h-28 w-28 rounded-full bg-foreground/10 blur-2xl" />
      <div className={variant === "featured" ? "opacity-95" : "opacity-90"}>
        <Art />
      </div>
    </div>
  );
};