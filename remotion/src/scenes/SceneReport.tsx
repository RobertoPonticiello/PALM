import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig, Img, staticFile } from "remotion";
import { PhoneFrame, Caption } from "../components/PhoneFrame";

export const SceneReport = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // Scroll the screenshot upward over time
  const scroll = interpolate(frame, [40, 160], [0, 220], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // Tap pulse on the CTA
  const tapPulse = interpolate((frame - 170) % 30, [0, 15, 30], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const tapVisible = frame >= 160 && frame <= 210 ? 1 : 0;
  // PDF slides in
  const pdfIn = spring({ frame: frame - 200, fps, config: { damping: 18, stiffness: 90 } });
  const pdfX = interpolate(pdfIn, [0, 1], [400, 0]);
  const pdfRot = interpolate(pdfIn, [0, 1], [12, 4]);

  return (
    <AbsoluteFill>
      <Caption title="Condividi tutto con il tuo pediatra." position="top" delay={6} fontSize={46} subtitle="In pochi secondi. Sempre aggiornato." />
      <PhoneFrame src="shots/report.png" scrollY={scroll} entryScale={0.94} />
      {/* tap pulse roughly where the "Genera report" CTA would be after scroll */}
      <div style={{
        position: "absolute", top: 1180, left: "50%", marginLeft: -50, width: 100, height: 100,
        borderRadius: "50%", background: "rgba(216, 230, 196, 0.5)",
        opacity: tapVisible * tapPulse, transform: `scale(${1 + tapPulse * 0.6})`,
        zIndex: 7, pointerEvents: "none",
      }} />
      {/* PDF mock slides in */}
      <div style={{
        position: "absolute", top: 1280, left: "50%", marginLeft: -180, width: 360,
        opacity: pdfIn, transform: `translateX(${pdfX}px) rotate(${pdfRot}deg)`,
        boxShadow: "0 40px 80px rgba(0,0,0,0.5)",
        borderRadius: 12, overflow: "hidden",
        zIndex: 8,
      }}>
        <Img src={staticFile("shots/report-pdf.png")} style={{ width: "100%", display: "block" }} />
      </div>
      <Caption title="Tu non devi ricordare niente." position="bottom" delay={230} fontSize={38} />
    </AbsoluteFill>
  );
};
