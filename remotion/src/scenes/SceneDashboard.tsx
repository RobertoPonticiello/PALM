import { AbsoluteFill } from "remotion";
import { PhoneFrame, Caption } from "../components/PhoneFrame";

export const SceneDashboard = () => (
  <AbsoluteFill>
    <Caption title="Tieni traccia della salute di tuo figlio." position="top" delay={6} fontSize={44} subtitle="Ogni giorno. In tempo reale." />
    <PhoneFrame
      src="shots/dashboard.png"
      glows={[
        { top: 360, left: 60, w: 470, h: 240, delay: 40 },
        { top: 720, left: 60, w: 470, h: 200, delay: 70 },
      ]}
    />
  </AbsoluteFill>
);
