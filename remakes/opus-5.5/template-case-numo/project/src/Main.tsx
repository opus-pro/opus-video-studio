import React from 'react';
import {AbsoluteFill, Easing, useCurrentFrame} from 'remotion';
import {C, H, MONO, T, W} from './theme';
import {ANOM_PT, S1Wall} from './S1Wall';
import {EU_BAR_RECT, PAY_COL_RECT, S2Where, S2_DRIFT, S2_ORIGIN} from './S2Where';
import {MARKER_RECT, ROW_RECT, S3When, S3_DRIFT, S3_ORIGIN} from './S3When';
import {BUTTON_RECT, S4Action} from './S4Action';
import {T1Content, T2Content, T3Content} from './Interstitials';
import {Blur, Rect, alpha, lerpRect, mix, tw} from './util';

const MORPH = Easing.bezier(0.83, 0, 0.17, 1);
const CIRCLE = Easing.bezier(0.7, 0, 0.25, 1);
const FULL: Rect = {x: 0, y: 0, w: W, h: H, r: 0};

const scaled = (r: Rect, s: number, o: {x: number; y: number}): Rect => ({
  x: o.x + (r.x - o.x) * s,
  y: o.y + (r.y - o.y) * s,
  w: r.w * s,
  h: r.h * s,
  r: r.r * s,
});

type Shape = {kind: 'circle'; r: number; color: string} | {kind: 'rect'; rect: Rect; color: string} | null;

const shapeAt = (f: number): Shape => {
  if (f < T.circleStart) return null;
  if (f < T.t1CollapseStart) {
    const r = tw(f, T.circleStart, T.circleFull, 7, 1150, CIRCLE);
    return {kind: 'circle', r, color: C.red};
  }
  if (f <= T.t1CollapseEnd) {
    const p = tw(f, T.t1CollapseStart, T.t1CollapseEnd, 0, 1, MORPH);
    return {kind: 'rect', rect: lerpRect(FULL, scaled(EU_BAR_RECT, S2_DRIFT(f), S2_ORIGIN), p), color: C.red};
  }
  if (f < T.t2ExpandStart) return null;
  if (f < T.t2CollapseStart) {
    const p = tw(f, T.t2ExpandStart, T.t2ExpandEnd, 0, 1, MORPH);
    return {kind: 'rect', rect: lerpRect(scaled(PAY_COL_RECT, S2_DRIFT(f), S2_ORIGIN), FULL, p), color: mix(C.red, C.paper, tw(f, T.t2ExpandStart + 4, T.t2ExpandEnd, 0, 1))};
  }
  if (f <= T.t2CollapseEnd) {
    const p = tw(f, T.t2CollapseStart, T.t2CollapseEnd, 0, 1, MORPH);
    return {kind: 'rect', rect: lerpRect(FULL, scaled(MARKER_RECT, S3_DRIFT(f), S3_ORIGIN), p), color: mix(C.paper, C.red, tw(f, T.t2CollapseStart + 6, T.t2CollapseEnd - 4, 0, 1))};
  }
  if (f < T.t3ExpandStart) return null;
  if (f < T.t3CollapseStart) {
    const p = tw(f, T.t3ExpandStart, T.t3ExpandEnd, 0, 1, MORPH);
    return {kind: 'rect', rect: lerpRect(scaled(ROW_RECT, S3_DRIFT(f), S3_ORIGIN), FULL, p), color: mix(C.red, C.mint, tw(f, T.t3ExpandStart + 4, T.t3ExpandEnd, 0, 1))};
  }
  if (f < T.t3CollapseEnd) {
    const p = tw(f, T.t3CollapseStart, T.t3CollapseEnd, 0, 1, MORPH);
    return {kind: 'rect', rect: lerpRect(FULL, BUTTON_RECT, p), color: C.mint};
  }
  return null;
};

const Overlay: React.FC<{f: number}> = ({f}) => {
  const s = shapeAt(f);
  if (!s) return null;
  let content: React.ReactNode = null;
  if (f < T.t1CollapseStart + 4) content = <T1Content f={f} ring={ANOM_PT} />;
  else if (f >= T.t2ExpandStart && f < T.t2CollapseStart + 6) content = <T2Content f={f} />;
  else if (f >= T.t3ExpandStart && f < T.t3CollapseStart + 12) content = <T3Content f={f} />;
  if (s.kind === 'circle') {
    return (
      <div style={{position: 'absolute', inset: 0, background: s.color, clipPath: `circle(${s.r.toFixed(2)}px at ${ANOM_PT.x}px ${ANOM_PT.y}px)`}}>
        {content}
      </div>
    );
  }
  const prev = shapeAt(f - 1);
  const pr = prev && prev.kind === 'rect' ? prev.rect : s.rect;
  const bx = (Math.abs(s.rect.x - pr.x) + Math.abs(s.rect.x + s.rect.w - pr.x - pr.w)) * 0.07;
  const by = (Math.abs(s.rect.y - pr.y) + Math.abs(s.rect.y + s.rect.h - pr.y - pr.h)) * 0.07;
  const {x, y, w, h, r} = s.rect;
  // the moving shape gets motion blur; its type content is clipped by the same shape but stays sharp
  return (
    <>
      <Blur id="morph" x={Math.min(bx, 6)} y={Math.min(by, 6)} style={{position: 'absolute', inset: 0}}>
        <div style={{position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: r, background: s.color}} />
      </Blur>
      {content && (
        <div style={{position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: r, overflow: 'hidden'}}>
          <div style={{position: 'absolute', left: -x, top: -y, width: W, height: H}}>{content}</div>
        </div>
      )}
    </>
  );
};

const STEPS = ['Detect', 'Locate', 'Explain', 'Act'];
const Rail: React.FC<{f: number}> = ({f}) => {
  if (f < T.s2Start) return null;
  const active = f < T.t2CollapseStart ? 1 : f < T.t3CollapseStart ? 2 : 3;
  return (
    <div style={{position: 'absolute', right: 24, top: 29, display: 'flex', alignItems: 'center', gap: 8, opacity: tw(f, 176, 196)}}>
      {STEPS.map((s, i) => {
        const done = i < active;
        const on = i === active;
        const col = on ? (i === 3 ? C.mint : C.red) : done ? C.sub : C.faint;
        return (
          <React.Fragment key={s}>
            {i > 0 && <div style={{width: 14, height: 1, background: done || on ? C.mute : C.faint}} />}
            <div style={{display: 'flex', alignItems: 'center', gap: 5}}>
              <div style={{width: 6, height: 6, borderRadius: 3, background: on ? col : done ? C.sub : 'transparent', boxShadow: `inset 0 0 0 1px ${col}`}} />
              <div style={{fontFamily: MONO, fontSize: 9.5, letterSpacing: '0.08em', textTransform: 'uppercase', color: col}}>{s}</div>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

const Backdrop: React.FC<{f: number}> = ({f}) => (
  <>
    <div
      style={{
        position: 'absolute',
        inset: -40,
        backgroundImage: `radial-gradient(${alpha('#8C9AB8', 0.09)} 1px, transparent 1.2px)`,
        backgroundSize: '24px 24px',
        transform: `translate(${(-f * 0.08) % 24}px, ${(-f * 0.04) % 24}px)`,
      }}
    />
    <div style={{position: 'absolute', inset: 0, background: `radial-gradient(120% 90% at 50% 40%, transparent 55%, rgba(0,0,0,0.55) 100%)`}} />
  </>
);

export const Main: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: `linear-gradient(180deg, ${C.bg2} 0%, ${C.bg} 100%)`, overflow: 'hidden'}}>
      <Backdrop f={f} />
      {f < T.s1End && <S1Wall f={f} />}
      {f >= T.s2Start && f < T.t2CollapseStart && <S2Where f={f} />}
      {f >= T.s3Start && f < T.t3CollapseStart && <S3When f={f} />}
      {f >= T.s4Start && <S4Action f={f} />}
      <Rail f={f} />
      <Overlay f={f} />
    </AbsoluteFill>
  );
};
