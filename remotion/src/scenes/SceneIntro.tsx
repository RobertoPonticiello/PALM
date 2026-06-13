import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig, Img, staticFile } from "remotion";

export const SceneIntro = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoIn = spring({ frame, fps, config: { damping: 20, stiffness: 90 } });
  const subIn = spring({ frame: frame - 60, fps, config: { damping: 22 } });
  const sub = "The AI that doesn't just know medicine — it knows you.";
  const words = sub.split(" ");

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", padding: "0 70px" }}>
        <Img
          src={staticFile("brand/palm-logo.png")}
          style={{
            width: 460,
            height: "auto",
            margin: "0 auto",
            opacity: logoIn,
            transform: `scale(${interpolate(logoIn, [0, 1], [0.85, 1])})`,
            filter: "drop-shadow(0 30px 50px rgba(0,0,0,0.45))",
          }}
        />
        <div style={{
          marginTop: 60,
          fontFamily: "Fraunces, serif", fontWeight: 600,
          fontSize: 50, lineHeight: 1.25, color: "#f5f1e6",
          opacity: subIn, letterSpacing: -1,
        }}>
          {words.map((w, i) => {
            const wf = frame - 70 - i * 4;
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
      </div>
    </AbsoluteFill>
  );
};
