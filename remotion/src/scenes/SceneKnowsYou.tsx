import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";

const Line = ({ text, delay, size, color, weight = 600, italic = false }: {
  text: string; delay: number; size: number; color: string; weight?: number; italic?: boolean;
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(" ");
  return (
    <div style={{
      fontFamily: "Fraunces, serif",
      fontWeight: weight,
      fontStyle: italic ? "italic" : "normal",
      fontSize: size,
      color,
      lineHeight: 1.1,
      letterSpacing: -1.5,
      textAlign: "center",
    }}>
      {words.map((w, i) => {
        const wf = frame - delay - i * 8;
        const e = spring({ frame: wf, fps, config: { damping: 22, stiffness: 130 } });
        const op = interpolate(e, [0, 1], [0, 1]);
        const y = interpolate(e, [0, 1], [16, 0]);
        return (
          <span key={i} style={{ display: "inline-block", opacity: op, transform: `translateY(${y}px)`, marginRight: "0.28em" }}>
            {w}
          </span>
        );
      })}
    </div>
  );
};

export const SceneKnowsYou = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lineIn = interpolate(frame - 30, [0, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const orbIn = spring({ frame, fps, config: { damping: 18, stiffness: 60 } });
  const orbPulse = 1 + Math.sin(frame / 22) * 0.04;

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      {/* Orb pulsante */}
      <div style={{
        position: "absolute",
        top: "26%",
        width: 280,
        height: 280,
        borderRadius: "50%",
        background: "radial-gradient(circle at 35% 30%, #d8e6c4 0%, #a3c79b 45%, #6a9a7a 100%)",
        boxShadow: "0 0 120px rgba(163, 199, 155, 0.45), 0 30px 100px rgba(0,0,0,0.4)",
        opacity: orbIn,
        transform: `scale(${orbPulse})`,
      }} />
      <div style={{
        position: "absolute",
        top: "26%",
        width: 280,
        height: 280,
        borderRadius: "50%",
        border: "1.5px solid rgba(220, 230, 210, 0.3)",
        opacity: orbIn,
        transform: `scale(${1.15 + Math.sin(frame / 30) * 0.05})`,
      }} />

      <div style={{ position: "absolute", bottom: "18%", left: 0, right: 0, padding: "0 80px" }}>
        <div style={{
          fontFamily: "Plus Jakarta Sans, sans-serif",
          fontSize: 22, fontWeight: 700, letterSpacing: 5,
          textTransform: "uppercase",
          color: "rgba(220, 230, 210, 0.55)",
          textAlign: "center", marginBottom: 36,
          opacity: interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" }),
        }}>
          Palm AI
        </div>
        <Line text="Un'AI che non conosce solo" delay={20} size={66} color="#f5f1e6" />
        <div style={{ height: 12 }} />
        <Line text="la medicina." delay={70} size={66} color="#f5f1e6" />
        <div style={{
          margin: "44px auto 36px",
          height: 1.5,
          width: 240 * lineIn,
          background: "linear-gradient(90deg, transparent, rgba(220,230,210,0.5), transparent)",
        }} />
        <Line text="Conosce te." delay={120} size={96} color="#f5f1e6" weight={600} italic />
      </div>
    </AbsoluteFill>
  );
};
