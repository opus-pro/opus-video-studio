import React from "react";
import { AbsoluteFill, Easing, Freeze, OffthreadVideo, staticFile } from "remotion";
import template from "../../template";
import { OpusMark } from "../brand/OpusMark";

const clamp = (n: number) => Math.max(0, Math.min(1, n));
const mix = (a: number, b: number, p: number) => a + (b - a) * p;
const arrive = Easing.bezier(0.18, 1, 0.3, 1);
const unfold = Easing.bezier(0.24, 0.82, 0.24, 1);
const focus = Easing.bezier(0.66, 0, 0.35, 1);
const pass = Easing.bezier(0.55, 0, 0.78, 0.36);
const q = (t: number, a: number, b: number, curve = arrive) => curve(clamp((t - a) / (b - a)));

// Three films open from one shared origin; their layout is intentionally
// asymmetric, with the two headline lines framing the films from the left.
const cards = [
  { left: 1180, top: 225, width: 355, height: 532, angle: 2, start: 0.25, layer: 3 },
  { left: 1475, top: 380, width: 550, height: 310, angle: 7, start: 0.37, layer: 1 },
  { left: 600, top: 435, width: 530, height: 314, angle: -7, start: 0.46, layer: 2 },
];
const seed = { x: 1440, y: 315 };
const focal = { x: cards[0].left + cards[0].width / 2, y: cards[0].top + cards[0].height / 2 };

export function ideaOpeningMotion(t: number) {
  const zoom = q(t, 1.13, 1.42, focus);
  const sweep = q(t, 1.37, 1.6, pass);
  return {
    zoom, sweep,
    scale: mix(1, 5.8, zoom),
    x: (960 - focal.x) * zoom + (960 + cards[0].width * 5.8 / 2) * sweep,
    y: (540 - focal.y) * zoom,
    titleExit: q(t, 1.13, 1.29, focus),
  };
}

const lightTravel = Easing.bezier(0.33, 0.26, 0.66, 0.74);
const softReveal = Easing.bezier(0.26, 0.12, 0.32, 1);
export function openingTextMaterial(t: number, row: number) {
  const start = row === 0 ? -0.035 : 0.57;
  const width = row === 0 ? 1060 : 1380;
  const colorProgress = q(t, start, row === 0 ? 0.88 : 1.14, lightTravel);
  return {
    width,
    front: mix(-220, width + 110, colorProgress),
    reveal: mix(-70, width + 250, q(t, start, row === 0 ? 0.27 : 0.88, softReveal)),
    blur: 0.45 + 13 * (1 - q(t, start, row === 0 ? 0.37 : 0.94)),
    glow: 0.2 * (1 - q(t, start + 0.28, start + 0.57)),
    glint: 0.3 * Math.sin(Math.PI * colorProgress),
  };
}

function OpeningLine({ t, row, exit }: {t:number;row:number;exit:number}) {
  const enter = row === 0 ? q(t, -0.035, 0.33) : q(t, 0.57, 0.94);
  const opacity = (row === 0 ? mix(0.28, 1, q(t, 0, 0.12)) : q(t, 0.57, 0.71)) * (1 - exit);
  const x = 125 + (1-enter) * (row === 0 ? -48 : -90) - exit * 64;
  const y = (row === 0 ? 355 : 995) + (1-enter) * (row === 0 ? 105 : 155);
  const material = openingTextMaterial(t, row);
  const id = `idea-type-${row}`;
  const text = <text x="0" y="0" fontFamily="Fraunces" fontSize={row === 0 ? 262 : 267} fontWeight="520" letterSpacing="-.045em" xmlSpace="preserve"
    style={{fontVariationSettings:'"opsz" 72,"SOFT" 85,"WONK" 1'}}>{template.copy.openingLines[row]}</text>;
  return <svg width="1920" height="1080" viewBox="0 0 1920 1080" style={{position:"absolute",inset:0,overflow:"visible",opacity}}>
    <defs>
      <linearGradient id={`${id}-color`} gradientUnits="userSpaceOnUse" x1={material.front-75} x2={material.front+380} y1="0" y2="-18">
        <stop offset="0" stopColor={template.brand.titleColors[0]}/>
        <stop offset=".22" stopColor={template.brand.titleColors[1]}/>
        <stop offset=".52" stopColor={template.brand.titleColors[2]}/>
        <stop offset=".8" stopColor={template.brand.titleColors[3]}/>
        <stop offset="1" stopColor={template.brand.titleColors[4]}/>
      </linearGradient>
      <linearGradient id={`${id}-reveal`} gradientUnits="userSpaceOnUse" x1={material.reveal-185} x2={material.reveal+80} y1="0" y2="0">
        <stop offset="0" stopColor="white"/><stop offset="1" stopColor="black"/>
      </linearGradient>
      <mask id={`${id}-mask`} maskUnits="userSpaceOnUse" x="-60" y="-300" width={material.width+160} height="370">
        <rect x="-60" y="-300" width={material.width+160} height="370" fill={`url(#${id}-reveal)`}/>
      </mask>
      <linearGradient id={`${id}-glint`} gradientUnits="userSpaceOnUse" x1={material.front-200} x2={material.front+140} y1="-270" y2="20">
        <stop offset="0" stopColor="#fff" stopOpacity="0"/>
        <stop offset=".42" stopColor="#fff" stopOpacity="0"/>
        <stop offset=".54" stopColor="#fff"/>
        <stop offset=".64" stopColor="#ffe4ff" stopOpacity=".8"/>
        <stop offset=".82" stopColor="#fff" stopOpacity="0"/>
        <stop offset="1" stopColor="#fff" stopOpacity="0"/>
      </linearGradient>
      <filter id={`${id}-surface`} filterUnits="userSpaceOnUse" x="-60" y="-310" width={material.width+180} height="395" colorInterpolationFilters="sRGB">
        <feGaussianBlur in="SourceAlpha" stdDeviation="4" result="height"/>
        <feSpecularLighting in="height" surfaceScale="5" specularConstant=".2" specularExponent="28" lightingColor="#f9eaff" result="shine">
          <feDistantLight azimuth="235" elevation="30"/>
        </feSpecularLighting>
        <feComposite in="shine" in2="SourceAlpha" operator="in" result="insideShine"/>
        <feBlend in="SourceGraphic" in2="insideShine" mode="screen"/>
        <feGaussianBlur stdDeviation={material.blur + exit*2.5}/>
      </filter>
      <filter id={`${id}-halo`} filterUnits="userSpaceOnUse" x="-70" y="-310" width={material.width+190} height="395">
        <feGaussianBlur stdDeviation="5"/>
      </filter>
    </defs>
    <g transform={`translate(${x} ${y})`}>
      <g mask={`url(#${id}-mask)`}>
        <g fill={`url(#${id}-color)`} opacity={material.glow} filter={`url(#${id}-halo)`}>{text}</g>
        <g fill={`url(#${id}-color)`} filter={`url(#${id}-surface)`}>{text}</g>
        <g fill={`url(#${id}-glint)`} opacity={material.glint} filter={`url(#${id}-surface)`}>{text}</g>
      </g>
    </g>
  </svg>;
}

export function IdeaOpening({t}: {t:number}) {
  const motion = ideaOpeningMotion(t);
  const bloom = q(t, 0.25, 0.78, unfold);
  if (t >= 1.6) return null;
  return <AbsoluteFill style={{overflow:"hidden",background:"#fff"}}>
    <AbsoluteFill style={{opacity:(1-motion.zoom)*0.58,background:"radial-gradient(ellipse at 76% 32%,#efe4fb77,transparent 48%)"}}/>
    <OpeningLine t={t} row={0} exit={motion.titleExit}/>
    <OpeningLine t={t} row={1} exit={motion.titleExit}/>
    <div style={{position:"absolute",inset:0,opacity:(1-q(t,0.48,0.76))*(1-motion.zoom)}}>
      <OpusMark x={seed.x} y={seed.y} size={mix(150,220,q(t,-0.03,0.25))} turn={mix(-17,2,q(t,0,0.43))} opacity={mix(0.6,1,q(t,0,0.15))} id="idea-origin"/>
    </div>
    <div style={{position:"absolute",inset:0,transformOrigin:`${focal.x}px ${focal.y}px`,transform:`translate(${motion.x}px,${motion.y}px) scale(${motion.scale})`}}>
      {cards.map((card, i) => {
        const open = q(t, card.start, card.start + 0.42, unfold);
        if (open <= 0) return null;
        const size = mix(0.16, 1, open);
        const width = card.width * size, height = card.height * size;
        const clip = template.media.openingVideos[i];
        const videoSeconds = clip.startSeconds + Math.max(0,t-card.start) * clip.playbackRate;
        const angle = mix(17, card.angle, open) * (1-motion.zoom);
        return <div key={i} style={{position:"absolute",left:mix(seed.x-card.width/2,card.left,open)+(card.width-width)/2,top:mix(seed.y-card.height/2,card.top,open)+(card.height-height)/2,width,height,zIndex:card.layer,
          opacity:q(t,card.start,card.start+0.075)*(i === 0 ? 1 : 1-q(t,1.13,1.32,focus)),transform:`rotate(${angle}deg)`,borderRadius:mix(58,19,open),overflow:"hidden",background:"#ece5f0",border:"1.5px solid #ffffffdd",boxShadow:`0 ${mix(8,18,open)}px ${mix(15,42,open)}px #49315120`,filter:`blur(${(1-open)*3.5+Math.sin(Math.PI*motion.sweep)*2.4}px)`}}>
          <Freeze frame={Math.round(videoSeconds*30)}>
            <OffthreadVideo muted src={staticFile(clip.file)} style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:clip.objectPosition}}/>
          </Freeze>
          <div style={{position:"absolute",inset:0,borderRadius:"inherit",boxShadow:"inset 0 1px 2px #ffffffbc,inset 1px 0 1px #fff7",pointerEvents:"none"}}/>
          <div style={{position:"absolute",inset:0,opacity:0.32*Math.sin(Math.PI*open),background:"linear-gradient(120deg,#e5baff99,transparent 35%,#fff9 52%,transparent 75%)",translate:`${(open-.5)*70}% 0`}}/>
        </div>;
      })}
    </div>
    <div style={{position:"absolute",left:1630,top:80,opacity:q(t,0.69,0.85)*(1-motion.titleExit)}}>
      <OpusMark x={70} y={70} size={100} turn={-9+3*bloom} id="idea-signature"/>
    </div>
  </AbsoluteFill>;
}
