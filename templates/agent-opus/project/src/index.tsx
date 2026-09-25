import React from "react";
import { Composition, registerRoot } from "remotion";
import { Film } from "./Film";
import timeline from "../config/timeline.json";
import "./style.css";
registerRoot(() => (
  <Composition
    id="ProductLaunch"
    component={Film}
    width={timeline.width}
    height={timeline.height}
    fps={timeline.fps}
    durationInFrames={timeline.durationInFrames}
  />
));
