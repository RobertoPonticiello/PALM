import { ReactNode } from "react";
import { useCurrentFrame, interpolate, spring, useVideoConfig, Img, staticFile } from "remotion";

export type Glow = { top: number; left: number; w: number; h: number; delay?: number };

type Props = {
  src?: string;
  children?: ReactNode;
  parallax?: number;
  entryScale?: number;
  glows?: Glow[];
  scrollY?: number; // px to translate the screenshot upward
};

export const PhoneFrame = ({ src, children, parallax = 0, entryScale = 0.94, glows = [], scrollY = 0 }: Props) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({ frame, fps, config: { damping: 18, stiffness: 90 } });
  const scale = interpolate(enter, [0, 1], [entryScale, 1]);
  const opacity = interpolate(enter, [0, 1], [0, 1]);

  const float = Math.sin(frame / 40) * 5;
  const drift = parallax ? frame * parallax : 0;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity,
        transform: `translateY(${float - drift}px) scale(${scale})`,
      }}
    >
      <div
        style={{
          width: 540,
          height: 1170,
          borderRadius: 78,
          background: "#0c1a12",
          padding: 14,
          boxShadow: "0 60px 120px rgba(0, 0, 0, 0.55), 0 0 0 1.5px rgba(255, 255, 255, 0.06) inset",
          position: "relative",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: 64,
            overflow: "hidden",
            background: "#fff",
            position: "relative",
          }}
        >
          {src && (
            <Img
              src={staticFile(src)}
              style={{
                width: "100%",
                height: "auto",
                minHeight: "100%",
                objectFit: "cover",
                objectPosition: "top",
                display: "block",
                transform: `translateY(${-scrollY}px)`,
              }}
            />
          )}
          {glows.map((g, i) => {
            const gd = g.delay ?? 0;
            const ge = spring({ frame: frame - gd, fps, config: { damping: 20 } });
            const pulse = 0.55 + Math.sin((frame - gd) / 14) * 0.18;
            return (
              <div key={i} style={{
                position: "absolute", top: g.top, left: g.left, width: g.w, height: g.h,
                borderRadius: 28,
                boxShadow: `0 0 0 3px rgba(195, 220, 170, ${0.7 * ge * pulse}), 0 0 60px rgba(195, 220, 170, ${0.6 * ge * pulse})`,
                opacity: ge,
                pointerEvents: "none",
              }} />
            );
          })}
          {children}
          <div
            style={{
              position: "absolute",
              top: 12,
              left: "50%",
              transform: "translateX(-50%)",
              width: 140,
              height: 32,
              borderRadius: 18,
              background: "#0c1a12",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export const Caption = ({
  title,
  subtitle,
  position = "top",
  delay = 0,
  fontSize = 56,
  perWord = 4,
}: {
  title: string;
  subtitle?: string;
  position?: "top" | "bottom";
  delay?: number;
  fontSize?: number;
  perWord?: number;
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = frame - delay;
  const enter = spring({ frame: f, fps, config: { damping: 22, stiffness: 110 } });
  const opacity = interpolate(enter, [0, 1], [0, 1]);
  const y = interpolate(enter, [0, 1], [position === "top" ? -20 : 20, 0]);

  const words = title.split(" ");
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        ...(position === "top" ? { top: 110 } : { bottom: 130 }),
        textAlign: "center",
        opacity,
        transform: `translateY(${y}px)`,
        padding: "0 70px",
        zIndex: 5,
      }}
    >
      <div
        style={{
          fontFamily: "Fraunces, serif",
          fontSize,
          fontWeight: 600,
          lineHeight: 1.15,
          color: "#f5f1e6",
          letterSpacing: -1.2,
        }}
      >
        {words.map((w, i) => {
          const wf = f - 8 - i * perWord;
          const wEnter = spring({ frame: wf, fps, config: { damping: 22, stiffness: 130 } });
          const wOp = interpolate(wEnter, [0, 1], [0, 1]);
          const wY = interpolate(wEnter, [0, 1], [10, 0]);
          return (
            <span key={i} style={{ display: "inline-block", opacity: wOp, transform: `translateY(${wY}px)`, marginRight: "0.28em" }}>
              {w}
            </span>
          );
        })}
      </div>
      {subtitle && (
        <div style={{
          marginTop: 18,
          fontFamily: "Plus Jakarta Sans, sans-serif",
          fontSize: 22,
          fontWeight: 500,
          color: "rgba(220,230,210,0.75)",
          opacity: interpolate(f - 8 - words.length * perWord, [0, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}>
          {subtitle}
        </div>
      )}
    </div>
  );
};
