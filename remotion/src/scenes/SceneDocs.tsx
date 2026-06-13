import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { PhoneFrame, Caption } from "../components/PhoneFrame";

const Step = ({ n, label, delay, top }: { n: number; label: string; delay: number; top: number }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const e = spring({ frame: frame - delay, fps, config: { damping: 22, stiffness: 110 } });
  const op = interpolate(e, [0, 1], [0, 1]);
  const x = interpolate(e, [0, 1], [40, 0]);
  return (
    <div style={{
      position: "absolute", left: 60, top, width: 460,
      display: "flex", alignItems: "center", gap: 18,
      opacity: op, transform: `translateX(${x}px)`,
      fontFamily: "Plus Jakarta Sans, sans-serif",
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: "50%",
        background: "linear-gradient(135deg, #d8e6c4, #a3c79b)", color: "#1f3d2e",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "Fraunces, serif", fontSize: 28, fontWeight: 700,
        boxShadow: "0 10px 24px rgba(0,0,0,0.3)",
      }}>{n}</div>
      <div style={{
        fontSize: 26, fontWeight: 600, color: "#f5f1e6", lineHeight: 1.2,
      }}>{label}</div>
    </div>
  );
};

export const SceneDocs = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const subIn = spring({ frame: frame - 200, fps, config: { damping: 22 } });

  return (
    <AbsoluteFill>
      <Caption title="Tutto in un posto." position="top" delay={6} fontSize={62} />
      <PhoneFrame src="shots/documents.png" entryScale={0.92} />
      {/* Steps appear over the lower band */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1180, height: 380 }}>
        <Step n={1} top={20}  label="Fai una foto al referto." delay={50} />
        <Step n={2} top={110} label="Upload." delay={100} />
        <Step n={3} top={200} label="Palm lo legge, lo cataloga, lo conserva." delay={150} />
      </div>
      <div style={{
        position: "absolute", left: 0, right: 0, bottom: 70, padding: "0 80px",
        textAlign: "center", fontFamily: "Plus Jakarta Sans, sans-serif",
        fontSize: 22, fontWeight: 500, color: "rgba(220,230,210,0.8)",
        opacity: subIn, fontStyle: "italic",
      }}>
        Non capisci cosa c'è scritto? Palm te lo spiega.
      </div>
    </AbsoluteFill>
  );
};
