import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { PhoneFrame } from "../components/PhoneFrame";

const Word = ({ text, delay, size, italic = false, weight = 600 }: {
  text: string; delay: number; size: number; italic?: boolean; weight?: number;
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(" ");
  return (
    <div style={{
      fontFamily: "Fraunces, serif", fontWeight: weight, fontStyle: italic ? "italic" : "normal",
      fontSize: size, color: "#f5f1e6", lineHeight: 1.15, letterSpacing: -1, textAlign: "center",
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

export const SceneSvolta = () => {
  const frame = useCurrentFrame();
  // Top text first (delay 0), phone fades in after (delay ~50), bottom text last (~110)
  const phoneOp = interpolate(frame, [50, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const halo = interpolate(frame, [50, 130], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{
        background: "radial-gradient(40% 30% at 50% 50%, rgba(220, 230, 200, 0.18), transparent 70%)",
        opacity: halo,
      }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 160, padding: "0 80px" }}>
        <Word text="E se ci fosse un posto unico?" delay={0} size={56} />
      </div>
      <div style={{ opacity: phoneOp }}>
        <PhoneFrame src="shots/profile-select.png" entryScale={0.94} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 140, padding: "0 80px" }}>
        <Word text="Per tutto. A portata di mano." delay={120} size={64} italic weight={700} />
      </div>
    </AbsoluteFill>
  );
};
