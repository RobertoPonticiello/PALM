import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig, Img, staticFile } from "remotion";

export const SceneOutro = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoIn = spring({ frame, fps, config: { damping: 20, stiffness: 90 } });
  const line1In = spring({ frame: frame - 50, fps, config: { damping: 22 } });
  const line2In = spring({ frame: frame - 110, fps, config: { damping: 22 } });

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <Img
        src={staticFile("brand/palm-logo.png")}
        style={{
          width: 380,
          height: "auto",
          opacity: logoIn,
          transform: `scale(${interpolate(logoIn, [0, 1], [0.85, 1])})`,
          filter: "drop-shadow(0 30px 50px rgba(0,0,0,0.45))",
        }}
      />
      <div style={{
        marginTop: 40, padding: "0 80px", textAlign: "center",
        fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 600, fontSize: 32,
        color: "rgba(245,241,230,0.85)", letterSpacing: 0.5, lineHeight: 1.3,
        opacity: line1In, transform: `translateY(${interpolate(line1In, [0, 1], [12, 0])}px)`,
      }}>
        Healthcare in your hands.
      </div>
      <div style={{
        marginTop: 36, padding: "0 80px", textAlign: "center",
        fontFamily: "Fraunces, serif", fontWeight: 600, fontSize: 44,
        color: "#f5f1e6", letterSpacing: -1, lineHeight: 1.25,
        opacity: line2In, transform: `translateY(${interpolate(line2In, [0, 1], [12, 0])}px)`,
      }}>
        La tua salute. Quella di chi ami.
      </div>
      <div style={{
        marginTop: 14, padding: "0 80px", textAlign: "center",
        fontFamily: "Fraunces, serif", fontWeight: 700, fontStyle: "italic", fontSize: 60,
        color: "#f5f1e6", letterSpacing: -2, lineHeight: 1.1,
        opacity: line2In, transform: `translateY(${interpolate(line2In, [0, 1], [12, 0])}px)`,
      }}>
        In un solo posto.
      </div>
    </AbsoluteFill>
  );
};
