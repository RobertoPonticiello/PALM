import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";

const Word = ({ text, delay, size, color = "#f5f1e6", italic = false, weight = 600, perWord = 4 }: {
  text: string; delay: number; size: number; color?: string; italic?: boolean; weight?: number; perWord?: number;
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(" ");
  return (
    <div style={{
      fontFamily: "Fraunces, serif", fontWeight: weight, fontStyle: italic ? "italic" : "normal",
      fontSize: size, color, lineHeight: 1.18, letterSpacing: -1, textAlign: "center",
    }}>
      {words.map((w, i) => {
        const wf = frame - delay - i * perWord;
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

const Card = ({ delay, x, y, rot, w, children }: {
  delay: number; x: number; y: number; rot: number; w: number; children?: React.ReactNode;
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const e = spring({ frame: frame - delay, fps, config: { damping: 18, stiffness: 70 } });
  const op = interpolate(e, [0, 1], [0, 0.92]);
  const drift = Math.sin((frame + delay) / 50) * 6;
  return (
    <div style={{
      position: "absolute", left: x, top: y + drift, width: w,
      transform: `rotate(${rot}deg) scale(${interpolate(e, [0, 1], [0.7, 1])})`,
      opacity: op,
      borderRadius: 20,
      background: "linear-gradient(160deg, rgba(245,241,230,0.96), rgba(220,210,190,0.88))",
      boxShadow: "0 30px 60px rgba(0,0,0,0.5)",
      padding: 16,
      fontFamily: "Plus Jakarta Sans, sans-serif",
      color: "#1f3d2e",
    }}>
      {children}
    </div>
  );
};

export const SceneProblem = () => {
  return (
    <AbsoluteFill style={{ background: "#0a1f15" }}>
      <AbsoluteFill style={{
        background: "radial-gradient(60% 50% at 50% 55%, transparent 0%, rgba(0,0,0,0.55) 80%)",
      }} />

      {/* lots of scattered cards */}
      <Card delay={0} x={40} y={120} rot={-8} w={300}>
        <div style={{ fontSize: 12, color: "#1f3d2e80", fontWeight: 700 }}>WHATSAPP · PEDIATRA</div>
        <div style={{ fontSize: 17, marginTop: 6 }}>"Le mando il referto appena posso 🙏"</div>
      </Card>
      <Card delay={6} x={680} y={90} rot={5} w={300}>
        <div style={{ fontSize: 12, color: "#1f3d2e80", fontWeight: 700 }}>NOTE · iPhone</div>
        <div style={{ fontSize: 16, marginTop: 6 }}>vit D — 1 gtt? o 2?<br/>controllare lunedì</div>
      </Card>
      <Card delay={12} x={420} y={260} rot={-3} w={260}>
        <div style={{ fontSize: 12, color: "#1f3d2e80", fontWeight: 700 }}>CALENDARIO</div>
        <div style={{ fontSize: 15, marginTop: 6 }}>Visita pediatra · 12/05 · 16:30</div>
      </Card>
      <Card delay={18} x={70} y={1330} rot={6} w={260}>
        <div style={{ fontSize: 12, color: "#1f3d2e80", fontWeight: 700 }}>📷 FOTO · 03/04</div>
        <div style={{ marginTop: 8, height: 70, borderRadius: 10, background: "linear-gradient(135deg,#d8c8a8,#b8a888)" }} />
      </Card>
      <Card delay={22} x={680} y={1300} rot={-8} w={300}>
        <div style={{ fontSize: 12, color: "#1f3d2e80", fontWeight: 700 }}>LETTERA DIMISSIONI · TIN</div>
        <div style={{ marginTop: 10, height: 4, background: "#1f3d2e22" }} />
        <div style={{ marginTop: 6, height: 4, background: "#1f3d2e22", width: "85%" }} />
        <div style={{ marginTop: 6, height: 4, background: "#1f3d2e22", width: "60%" }} />
        <div style={{ marginTop: 6, height: 4, background: "#1f3d2e22", width: "75%" }} />
      </Card>
      <Card delay={26} x={400} y={1500} rot={3} w={240}>
        <div style={{ fontSize: 36, textAlign: "center" }}>💊</div>
        <div style={{ fontSize: 12, textAlign: "center", marginTop: 4, color: "#1f3d2e99" }}>scatola medicinali</div>
      </Card>
      <Card delay={30} x={50} y={1550} rot={-4} w={250}>
        <div style={{ fontSize: 12, color: "#1f3d2e80", fontWeight: 700 }}>🎙 MEMO VOCALE</div>
        <div style={{ marginTop: 8, height: 6, background: "#1f3d2e22", borderRadius: 3 }} />
        <div style={{ marginTop: 4, fontSize: 11, color: "#1f3d2e80" }}>0:42 · "ricorda vaccino…"</div>
      </Card>
      <Card delay={34} x={720} y={1530} rot={9} w={240}>
        <div style={{ fontSize: 12, color: "#1f3d2e80", fontWeight: 700 }}>LIBRETTO VACCINI</div>
        <div style={{ marginTop: 8, height: 70, borderRadius: 6, background: "repeating-linear-gradient(90deg, #d8c8a8 0 12px, #c8b888 12px 14px)" }} />
      </Card>

      {/* Questions stack — much faster */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 600, padding: "0 80px" }}>
        <div style={{ marginBottom: 24 }}><Word text={'"Quando ha fatto l\u2019ultimo vaccino?"'} delay={20} size={48} italic perWord={3} /></div>
        <div style={{ marginBottom: 24 }}><Word text={'"Quando è il prossimo?"'} delay={75} size={48} italic perWord={3} /></div>
        <div style={{ marginBottom: 24 }}><Word text={'"Dove ho messo quel referto?"'} delay={130} size={48} italic perWord={3} /></div>
        <div><Word text={'"Che dosaggio era?"'} delay={185} size={48} italic perWord={3} /></div>
      </div>
    </AbsoluteFill>
  );
};
