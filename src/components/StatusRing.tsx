import { cn } from "@/lib/utils";

interface StatusRingProps {
  status: "good" | "warn" | "bad";
  percentile: number;
  size?: number;
  label?: string;
}

const colorMap = {
  good: "hsl(var(--status-good))",
  warn: "hsl(var(--status-warn))",
  bad: "hsl(var(--status-bad))",
};

/**
 * Growth-trajectory ring.
 * The ring is divided into the 0–100 percentile range. We show:
 *   - a soft "healthy band" (10°–90°) in muted green
 *   - a marker dot at the child's current percentile
 *   - the percentile number in the center
 * This makes it instantly clear: am I inside the green range? Yes/No.
 */
export const StatusRing = ({ status, percentile, size = 200, label }: StatusRingProps) => {
  const stroke = 12;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const cx = size / 2;
  const cy = size / 2;

  // Healthy band: 10th–90th percentile (covers 80% of the ring)
  const bandStart = 0.1;
  const bandEnd = 0.9;
  const bandLen = (bandEnd - bandStart) * c;
  const bandOffset = -bandStart * c;

  // Marker position (start at top, go clockwise)
  const angle = (percentile / 100) * 360 - 90;
  const rad = (angle * Math.PI) / 180;
  const markerX = cx + r * Math.cos(rad);
  const markerY = cy + r * Math.sin(rad);

  const inBand = percentile >= 10 && percentile <= 90;
  const ringColor = inBand ? "hsl(var(--status-good))" : colorMap[status];

  return (
    // The decorative halo uses `blur-3xl` which physically extends BEYOND the
    // SVG bounds. We therefore allow the wrapper to overflow and pin the SVG
    // to its own clean square — otherwise neighbouring layout (parent flex
    // container, hero card padding) clips the ring on small screens and the
    // circle looks "cropped".
    <div
      className="relative inline-flex items-center justify-center shrink-0 overflow-visible"
      style={{ width: size, height: size }}
    >
      {/* halo glow — kept inside the box so it never pushes the ring out */}
      <div
        className="absolute rounded-full blur-2xl opacity-30 pointer-events-none"
        style={{ background: ringColor, inset: size * 0.08 }}
      />
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90 relative block overflow-visible"
      >
        {/* Track */}
        <circle cx={cx} cy={cy} r={r} stroke="hsl(var(--muted))" strokeWidth={stroke} fill="none" />
        {/* Healthy band */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          stroke={ringColor}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${bandLen} ${c}`}
          strokeDashoffset={bandOffset}
          opacity={0.35}
        />
        {/* Marker dot */}
        <circle
          cx={markerX}
          cy={markerY}
          r={stroke * 0.85}
          fill={ringColor}
          style={{ filter: `drop-shadow(0 0 8px ${ringColor})` }}
        />
        <circle cx={markerX} cy={markerY} r={stroke * 0.45} fill="white" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center px-2 text-center">
        <div className="font-display font-semibold leading-none" style={{ fontSize: size * 0.26 }}>
          {percentile}°
        </div>
        <div className="text-[9px] text-muted-foreground mt-0.5 uppercase tracking-wider font-semibold">
          percentile
        </div>
        {size >= 160 && (
          <div className="text-[9px] text-muted-foreground/70 mt-1 uppercase tracking-wider">
            fascia sana 10°–90°
          </div>
        )}
      </div>
    </div>
  );
};
