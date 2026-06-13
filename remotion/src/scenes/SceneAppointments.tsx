import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { PhoneFrame, Caption } from "../components/PhoneFrame";

const TypingBubble = ({ text, top, delay }: { text: string; top: number; delay: number }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const e = spring({ frame: frame - delay, fps, config: { damping: 22, stiffness: 110 } });
  const op = interpolate(e, [0, 1], [0, 1]);
  const y = interpolate(e, [0, 1], [20, 0]);
  const words = text.split(" ");
  return (
    <div style={{
      position: "absolute", top, right: 50, maxWidth: 420,
      padding: "20px 26px", borderRadius: 28, borderBottomRightRadius: 8,
      background: "#1f3d2e", color: "#f5f1e6",
      fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: 22, fontWeight: 500, lineHeight: 1.4,
      boxShadow: "0 14px 32px rgba(0,0,0,0.25)",
      opacity: op, transform: `translateY(${y}px)`, zIndex: 6,
    }}>
      {words.map((w, i) => {
        const wf = frame - delay - 8 - i * 7;
        const wE = spring({ frame: wf, fps, config: { damping: 22, stiffness: 130 } });
        const wOp = interpolate(wE, [0, 1], [0, 1]);
        return <span key={i} style={{ opacity: wOp, marginRight: "0.25em" }}>{w}</span>;
      })}
    </div>
  );
};

export const SceneAppointments = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cardIn = spring({ frame: frame - 150, fps, config: { damping: 18, stiffness: 100 } });

  return (
    <AbsoluteFill>
      <Caption eyebrow="05 · Smart capture" title="Cita una data. Palm la salva." position="top" delay={6} fontSize={58} />
      <PhoneFrame src="shots/dashboard.png" parallax={0.03} />
      <TypingBubble
        text="Prossima visita dal neonatologo il 23 maggio 2026."
        top={680}
        delay={50}
      />
      <div style={{
        position: "absolute", top: 920, left: "50%", marginLeft: -240, width: 480,
        padding: 24, borderRadius: 28, background: "rgba(245, 241, 230, 0.97)",
        boxShadow: "0 30px 60px rgba(0,0,0,0.35)",
        opacity: cardIn, transform: `translateY(${interpolate(cardIn, [0, 1], [60, 0])}px)`,
        display: "flex", gap: 18, alignItems: "center", zIndex: 6,
      }}>
        <div style={{ width: 78, height: 78, borderRadius: 22, background: "#cfe0c8",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40 }}>🩺</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#6a9a7a" }}>Aggiunto</div>
          <div style={{ fontFamily: "Fraunces, serif", fontSize: 28, fontWeight: 700, color: "#1f3d2e", lineHeight: 1.1, marginTop: 4 }}>Visita neonatologo</div>
          <div style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: 18, color: "#1f3d2e99", marginTop: 4 }}>23 maggio 2026</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
