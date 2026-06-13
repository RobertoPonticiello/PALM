import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { PhoneFrame, Caption } from "../components/PhoneFrame";

const Bubble = ({ text, side, top, delay }: {
  text: string; side: "user" | "ai"; top: number; delay: number;
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const e = spring({ frame: frame - delay, fps, config: { damping: 22, stiffness: 110 } });
  const opacity = interpolate(e, [0, 1], [0, 1]);
  const y = interpolate(e, [0, 1], [16, 0]);
  const isUser = side === "user";
  const words = text.split(" ");
  return (
    <div style={{
      position: "absolute", top, width: 380,
      left: isUser ? "calc(50% - 130px)" : "calc(50% - 250px)",
      padding: "16px 20px", borderRadius: 26,
      borderBottomRightRadius: isUser ? 8 : 26,
      borderBottomLeftRadius: isUser ? 26 : 8,
      background: isUser ? "#1f3d2e" : "rgba(245, 241, 230, 0.97)",
      color: isUser ? "#f5f1e6" : "#1f3d2e",
      fontFamily: "Plus Jakarta Sans, sans-serif",
      fontSize: 18, lineHeight: 1.4, fontWeight: 500,
      textAlign: isUser ? "right" : "left",
      boxShadow: "0 14px 32px rgba(0,0,0,0.25)",
      opacity, transform: `translateY(${y}px)`, zIndex: 6,
    }}>
      {words.map((w, i) => {
        const wf = frame - delay - 6 - i * 4;
        const wE = spring({ frame: wf, fps, config: { damping: 22, stiffness: 130 } });
        const op = interpolate(wE, [0, 1], [0, 1]);
        return (
          <span key={i} style={{ opacity: op, marginRight: "0.25em" }}>{w}</span>
        );
      })}
    </div>
  );
};

export const SceneChat = () => (
  <AbsoluteFill>
    <Caption
      title="Hai un dubbio sulla salute di tuo figlio?"
      subtitle="Palm risponde 24/7. Basato su protocolli medici validati, non internet."
      position="top" delay={6} fontSize={44}
    />
    <PhoneFrame src="shots/chat.png" />
    <Bubble text="Romeo ha il naso tappato, come faccio?" side="user" top={680} delay={40} />
    <Bubble text="Prova un lavaggio nasale con soluzione fisiologica, prima delle poppate. Te lo mostro passo passo?" side="ai" top={860} delay={130} />
  </AbsoluteFill>
);
