import { AbsoluteFill } from "remotion";
import { PhoneFrame, Caption } from "../components/PhoneFrame";

export const SceneLog = () => (
  <AbsoluteFill>
    <Caption title="Peso. Pasto. Pannolino. In un tap." position="top" delay={6} fontSize={48} />
    <PhoneFrame
      src="shots/log.png"
      glows={[
        { top: 320, left: 60, w: 470, h: 320, delay: 40 },
        { top: 680, left: 60, w: 470, h: 200, delay: 70 },
      ]}
    />
    <Caption title="Niente fogli. Niente note sparse." position="bottom" delay={90} fontSize={38} />
  </AbsoluteFill>
);
