import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";

const Line = ({ text, delay, size, italic = false, weight = 600 }: {
  text: string; delay: number; size: number; italic?: boolean; weight?: number;
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(" ");
  return (
    <div style={{
      fontFamily: "Fraunces, serif", fontWeight: weight, fontStyle: italic ? "italic" : "normal",
      fontSize: size, color: "#f5f1e6", lineHeight: 1.18, letterSpacing: -1.5, textAlign: "center",
    }}>
      {words.map((w, i) => {
        const wf = frame - delay - i * 4;
        const e = spring({ frame: wf, fps, config: { damping: 22, stiffness: 130 } });
        const op = interpolate(e, [0, 1], [0, 1]);
        const y = interpolate(e, [0, 1], [10, 0]);
        return (
          <span key={i} style={{ display: "inline-block", opacity: op, transform: `translateY(${y}px)`, marginRight: "0.28em" }}>
            {w}
          </span>
        );
      })}
    </div>
  );
};

export const SceneBridge = () => (
  <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", background: "#0a1f15" }}>
    <div style={{ padding: "0 80px" }}>
      <Line text="Palm non sostituisce il tuo pediatra." delay={10} size={56} />
      <div style={{ height: 50 }} />
      <Line text="Lo prepara ad aiutarti meglio." delay={70} size={68} italic weight={700} />
    </div>
  </AbsoluteFill>
);
