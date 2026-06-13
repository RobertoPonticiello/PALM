import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { TransitionSeries, springTiming, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { loadFont as loadFraunces } from "@remotion/google-fonts/Fraunces";
import { loadFont as loadJakarta } from "@remotion/google-fonts/PlusJakartaSans";

import { SceneIntro } from "./scenes/SceneIntro";
import { SceneProblem } from "./scenes/SceneProblem";
import { SceneProblemBeat } from "./scenes/SceneProblemBeat";
import { SceneSvolta } from "./scenes/SceneSvolta";
import { SceneDashboard } from "./scenes/SceneDashboard";
import { SceneLog } from "./scenes/SceneLog";
import { SceneDocs } from "./scenes/SceneDocs";
import { SceneChat } from "./scenes/SceneChat";
import { SceneLearn } from "./scenes/SceneLearn";
import { SceneReport } from "./scenes/SceneReport";
import { SceneBridge } from "./scenes/SceneBridge";
import { SceneOutro } from "./scenes/SceneOutro";

loadFraunces("normal", { weights: ["600", "700"], subsets: ["latin"] });
loadJakarta("normal", { weights: ["400", "500", "600", "700"], subsets: ["latin"] });

const TRANS = 20;

const Backdrop = () => {
  const frame = useCurrentFrame();
  const drift = interpolate(frame, [0, 1800], [0, 80]);
  return (
    <AbsoluteFill style={{
      background: "radial-gradient(120% 80% at 30% 20%, #1f3d2e 0%, #122518 55%, #0a1610 100%)",
    }}>
      <div style={{
        position: "absolute", inset: -200,
        background: "radial-gradient(60% 40% at 70% 80%, rgba(180, 210, 170, 0.18), transparent 60%)",
        transform: `translate(${drift}px, ${-drift}px)`,
      }} />
    </AbsoluteFill>
  );
};

export const MainVideo = () => (
  <AbsoluteFill style={{ background: "#0a1610" }}>
    <Backdrop />
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={180}><SceneIntro /></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 30 })} />

      <TransitionSeries.Sequence durationInFrames={360}><SceneProblem /></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 30 })} />

      <TransitionSeries.Sequence durationInFrames={150}><SceneProblemBeat /></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 40 })} />

      <TransitionSeries.Sequence durationInFrames={180}><SceneSvolta /></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: TRANS })} />

      <TransitionSeries.Sequence durationInFrames={210}><SceneDashboard /></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={springTiming({ config: { damping: 200 }, durationInFrames: TRANS })} />

      <TransitionSeries.Sequence durationInFrames={180}><SceneLog /></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={springTiming({ config: { damping: 200 }, durationInFrames: TRANS })} />

      <TransitionSeries.Sequence durationInFrames={270}><SceneDocs /></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={springTiming({ config: { damping: 200 }, durationInFrames: TRANS })} />

      <TransitionSeries.Sequence durationInFrames={240}><SceneChat /></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={springTiming({ config: { damping: 200 }, durationInFrames: TRANS })} />

      <TransitionSeries.Sequence durationInFrames={180}><SceneLearn /></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={springTiming({ config: { damping: 200 }, durationInFrames: TRANS })} />

      <TransitionSeries.Sequence durationInFrames={300}><SceneReport /></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 30 })} />

      <TransitionSeries.Sequence durationInFrames={150}><SceneBridge /></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 30 })} />

      <TransitionSeries.Sequence durationInFrames={210}><SceneOutro /></TransitionSeries.Sequence>
    </TransitionSeries>
  </AbsoluteFill>
);
