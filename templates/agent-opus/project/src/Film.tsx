import React from "react";
import {
  AbsoluteFill,
  Audio,
  Freeze,
  staticFile,
  useCurrentFrame,
} from "remotion";
import template from "./template";
import timeline from "../config/timeline.json";
import { BloomFull } from "./agent-opus/code-ui/BloomFull";
import { EditFrame, sourceAt } from "./agent-opus/code-ui/clock";
import { AgentWorkflow } from "./agent-opus/directed/Workflow";
import { LockedWorkflow } from "./agent-opus/locked/Workflow";
import { RichInputs } from "./agent-opus/multiples/Inputs";
import { MultipleCycles } from "./agent-opus/multiples/Cycles";
import { OpusBrandContext } from "./agent-opus/brand/OpusMark";

// One complete source render; never reads the preview movie or previous exports.
export function Film() {
  const f = useCurrentFrame();
  let picture: React.ReactNode;
  if (f < timeline.inputStart || f >= timeline.endingStart) {
    const old =
      f < timeline.inputStart
        ? f
        : timeline.endingLegacyStart + f - timeline.endingStart;
    const source = sourceAt(old);
    picture = (
      <EditFrame.Provider value={old}>
        <Freeze frame={source}>
          <BloomFull music={false} integratedCraft sourceFrame={source} />
        </Freeze>
      </EditFrame.Provider>
    );
  } else if (f < timeline.workflowStart) picture = <RichInputs frame={f} />;
  else if (f >= timeline.lockedStart && f < timeline.lockedEnd)
    picture = <LockedWorkflow frame={f + timeline.workflowClockOffset} />;
  else if (f < timeline.outputStart)
    picture = (
      <>
        {f >= timeline.outputOverlapStart && <MultipleCycles frame={f} />}
        <AgentWorkflow frame={f + timeline.workflowClockOffset} />
        {f < timeline.inputsEnd && <RichInputs frame={f} />}
      </>
    );
  else
    picture = (
      <EditFrame.Provider value={f}>
        <MultipleCycles frame={f} />
      </EditFrame.Provider>
    );
  return (
    <OpusBrandContext.Provider value={true}>
      <AbsoluteFill style={{ background: "#fff", overflow: "hidden" }}>
        {picture}
        {template.audio.mode === "master" ? (
          <Audio src={staticFile(template.audio.master)} />
        ) : null}
      </AbsoluteFill>
    </OpusBrandContext.Provider>
  );
}
