import React from "react";
import { Composition, registerRoot } from "remotion";
import { FontReady } from "./shared";
import { Brand, brandDefaults } from "./brand";
import {
  Manifesto,
  manifestoDefaults,
  Ribbon,
  ribbonDefaults,
} from "./typography";
import { Analytics, analyticsDefaults } from "./analytics";
import { Search, searchDefaults } from "./search";
import { Numo, numoDefaults } from "./numo";
import { Companion, companionDefaults } from "./companion";
const wrap = (C: React.ComponentType<any>) => (props: any) => (
  <FontReady>
    <C {...props} />
  </FontReady>
);
const B = wrap(Brand),
  M = wrap(Manifesto),
  R = wrap(Ribbon),
  A = wrap(Analytics);
const Q = wrap(Search),
  N = wrap(Numo),
  C = wrap(Companion);
const Root = () => (
  <>
    <Composition
      id="template-manifesto"
      component={M}
      defaultProps={manifestoDefaults}
      width={960}
      height={540}
      fps={30}
      durationInFrames={270}
    />
    <Composition
      id="template-ribbon-manifesto"
      component={R}
      defaultProps={ribbonDefaults}
      width={960}
      height={540}
      fps={30}
      durationInFrames={240}
    />
    <Composition
      id="template-analytics-glow"
      component={A}
      defaultProps={analyticsDefaults}
      width={960}
      height={540}
      fps={60}
      durationInFrames={180}
    />
    <Composition
      id="template-case-search"
      component={Q}
      defaultProps={searchDefaults}
      width={960}
      height={540}
      fps={60}
      durationInFrames={590}
    />
    <Composition
      id="template-case-numo"
      component={N}
      defaultProps={numoDefaults}
      width={960}
      height={540}
      fps={60}
      durationInFrames={612}
    />
    <Composition
      id="template-case-companion"
      component={C}
      defaultProps={companionDefaults}
      width={960}
      height={540}
      fps={30}
      durationInFrames={316}
    />
    {Object.entries(brandDefaults).map(([id, props]) => (
      <Composition
        key={id}
        id={id}
        component={B}
        defaultProps={props}
        width={960}
        height={540}
        fps={30}
        durationInFrames={66}
      />
    ))}
  </>
);
registerRoot(Root);
