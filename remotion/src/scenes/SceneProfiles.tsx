import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { PhoneFrame, Caption } from "../components/PhoneFrame";

const ProfileCard = ({ delay, label, name, age, accent, top }: {
  delay: number; label: string; name: string; age: string; accent: string; top: number;
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const e = spring({ frame: frame - delay, fps, config: { damping: 22, stiffness: 110 } });
  const op = interpolate(e, [0, 1], [0, 1]);
  const y = interpolate(e, [0, 1], [30, 0]);
  return (
    <div style={{
      position: "absolute", top, left: 30, right: 30,
      padding: "20px 22px", borderRadius: 28,
      background: "rgba(255, 253, 248, 0.98)",
      boxShadow: "0 14px 32px rgba(31, 61, 46, 0.18)",
      opacity: op, transform: `translateY(${y}px)`,
      display: "flex", gap: 16, alignItems: "center",
      fontFamily: "Plus Jakarta Sans, sans-serif",
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: 22, background: accent,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "Fraunces, serif", fontSize: 30, fontWeight: 700, color: "#1f3d2e",
      }}>{name[0]}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: "#6a9a7a", textTransform: "uppercase" }}>{label}</div>
        <div style={{ fontFamily: "Fraunces, serif", fontSize: 26, fontWeight: 700, color: "#1f3d2e", lineHeight: 1.1 }}>{name}</div>
        <div style={{ fontSize: 14, color: "#1f3d2e99", marginTop: 2 }}>{age}</div>
      </div>
      <div style={{
        width: 36, height: 36, borderRadius: 18, background: "#1f3d2e",
        color: "#f5f1e6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
      }}>›</div>
    </div>
  );
};

export const SceneProfiles = () => {
  return (
    <AbsoluteFill>
      <Caption eyebrow="01 · I tuoi cari" title="Una sola app per tutta la famiglia." position="top" delay={6} fontSize={58} />
      <PhoneFrame>
        {/* Soft pastel app backdrop, no real screenshot */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(180deg, #fef4ec 0%, #f5e6dc 40%, #e8d8d0 100%)",
        }}>
          {/* fake header */}
          <div style={{ paddingTop: 70, paddingLeft: 28, paddingRight: 28 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 12,
                background: "linear-gradient(135deg, #f5d7c7, #e8c5b0)" }} />
              <div>
                <div style={{ fontFamily: "Fraunces, serif", fontSize: 22, fontWeight: 700, color: "#1f3d2e" }}>Palm</div>
                <div style={{ fontSize: 9, color: "#1f3d2e80" }}>healthcare in your hands</div>
              </div>
            </div>
            <div style={{ marginTop: 30, fontSize: 13, color: "#1f3d2e99", fontFamily: "Plus Jakarta Sans, sans-serif" }}>
              Buon pomeriggio, Chiara
            </div>
            <div style={{ fontFamily: "Fraunces, serif", fontSize: 32, fontWeight: 600, color: "#1f3d2e", lineHeight: 1.1, marginTop: 4 }}>
              Di chi ci prendiamo<br />cura oggi?
            </div>
          </div>
          <ProfileCard top={310} delay={50} label="Tu" name="Chiara" age="32 anni" accent="#f5d7c7" />
          <ProfileCard top={430} delay={85} label="Tuo padre" name="Riccardo" age="79 anni · nonno" accent="#e8d8a8" />
          <ProfileCard top={550} delay={120} label="Tuo figlio" name="Romeo" age="2 mesi" accent="#cfe0c8" />
        </div>
      </PhoneFrame>
    </AbsoluteFill>
  );
};
