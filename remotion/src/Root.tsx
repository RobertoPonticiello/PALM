import { Composition } from "remotion";
import { MainVideo } from "./MainVideo";

// Sum of sequences ~ 2610. Transitions overlap so total ~ 2610. Buffer.
const TOTAL = 2700;

export const RemotionRoot = () => (
  <Composition
    id="main"
    component={MainVideo}
    durationInFrames={TOTAL}
    fps={30}
    width={1080}
    height={1920}
  />
);
