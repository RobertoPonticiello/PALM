import { AbsoluteFill } from "remotion";
import { PhoneFrame, Caption } from "../components/PhoneFrame";

export const SceneLearn = () => (
  <AbsoluteFill>
    <Caption title="Contenuti scelti per Romeo. Adesso." position="top" delay={6} fontSize={48}
      subtitle="Non per tutti. Per te." />
    <PhoneFrame
      src="shots/learn.png"
      glows={[
        { top: 540, left: 50, w: 480, h: 240, delay: 50 },
      ]}
    />
  </AbsoluteFill>
);
