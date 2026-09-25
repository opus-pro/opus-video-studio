import React, {useLayoutEffect, useRef} from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {Box, FitText, TextBox, box, ease, lerp, mixBox, mixColor, position, progress, textBox} from './primitives';

export const researchDefaults = {
  brand: 'Trace', query: 'Why do users leave?', answer: 'Onboarding needs work.',
  evidence: 'I got stuck connecting my data.', ending: 'More understanding.', precedingLine: 'Less searching.', ask: 'Ask',
  answerLabel: 'Answer with evidence', supportingLine: 'Connecting data is where people get stuck.', evidenceLabel: 'From user interviews',
  background: '#241006', paper: '#fffaf3', ink: '#30251b', copper: '#d7984a', light: '#fff5e9',
  quotation: {open: '\u201c', close: '\u201d'}, asset: 'evidence-room.png',
  colors: {opticalBase: '#ead4b1', opticalIvory: '#fffaf1', opticalOchre: '#c69450', label: '#8d806f', evidencePaper: '#f7efde', noiseSeed: 317, noiseOpacity: .012, glassAlpha: .028, centralDarkAlpha: .1, causticOpacity: .22, askText: '#ffffff'},
  geometry: {
    input: box(106, 191, 748, 164), answerSurface: box(118, 78, 724, 382),
    initialRadius: 82, finalRadius: 30, initialRotateY: -7, settledRotateY: -5, finalRotateY: -2, initialRotateZ: -4, settledRotateZ: -2, finalRotateZ: -.5, perspective: 1400, initialLift: 10,
    inputShadow: '0 28px 40px rgba(111,57,27,.22)', answerShadow: '0 30px 50px rgba(120,61,20,.20)',
    initialQuery: textBox(62, 62, 520, 42, 25, 19, 1, 400, 36), finalQuery: textBox(33, 36, 560, 34, 21, 19, 1, 400, 30),
    initialAsk: box(628, 58, 86, 48), finalAsk: box(621, 23, 73, 42), askSize: 18, askMin: 15, askPadding: 15, askArrowSize: 11, askArrowRight: 12, askDarken: .1,
    answerLabel: textBox(33, 105, 550, 18, 10, 10, 1, 400, 15), labelSparkle: {x: 18, y: 110, size: 8},
    answer: textBox(92, 146, 555, 57, 37, 27, 1, 400, 49),
    supporting: textBox(33, 211, 655, 22, 13, 13, 1, 400, 19),
    strip: box(33, 244, 655, 70), stripRadius: 7,
    evidenceLabel: textBox(14, 13, 612, 15, 9, 9, 1, 400, 13),
    quote: textBox(14, 37, 612, 27, 17, 14, 1, 400, 24),
    stripCorners: box(151, 322, 655, 70), roomCorners: box(105, 214, 750, 112), wideCorners: box(93, 209, 774, 120), logoCorners: box(327, 258, 24, 24),
    cornerInset: 3, cornerArm: 15, cornerStroke: 1.3, logoArm: 6, logoStroke: 1.7, logoDotRadius: 2,
    glass: box(80, 199, 800, 147), glassRadius: 1, glassEdge: 1,
    preceding: {...textBox(200, 226, 560, 86, 60, 43, 1, 400, 78), align: 'center' as const},
    ending: {...textBox(122, 226, 716, 86, 58, 40, 1, 400, 78), align: 'center' as const},
    brand: textBox(370, 217, 370, 110, 90, 55, 1, 400, 106),
    roomZoom: 1.055, cameraCenter: [480, 270], surfaceZoom: 1.12,
    revealUp: 18, revealBlur: 5, quoteX: 14, quoteBlur: 3, precedingUp: 22, textBlur: 6, precedingExitX: -30, endingEnterX: 35, brandBlur: 5,
    caustic: {x1: 140, y1: -100, x2: 1050, y2: 530, width: 250, blur: 70},
  },
  timing: {typing: [0, 16], openingSettle: [0, 20], askEmphasis: [16, 20, 24], grow: [24, 48], answer: [49, 68], wordStagger: 2, supporting: [65, 74], evidence: [75, 90], cornerDraw: [75, 83], transition: [109, 124], preceding: [125, 137], swap: [151, 169], roomZoom: [109, 200], centralDark: [170, 180], logo: [205, 226], dot: [215, 226]},
};
export type ResearchProps = typeof researchDefaults;

const Grain: React.FC<{seed: number; opacity: number}> = ({seed, opacity}) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const ctx = ref.current?.getContext('2d');
    if (!ctx) return;
    let state = seed >>> 0;
    const random = () => {state = (Math.imul(1664525, state) + 1013904223) >>> 0; return (state + 1) / 4294967297;};
    const pixels = ctx.createImageData(960, 540);
    for (let i = 0; i < pixels.data.length; i += 4) {
      const gaussian = Math.sqrt(-2 * Math.log(random())) * Math.cos(2 * Math.PI * random());
      const value = Math.max(0, Math.min(255, 127.5 + gaussian * 42));
      pixels.data[i] = value; pixels.data[i + 1] = value; pixels.data[i + 2] = value; pixels.data[i + 3] = 255;
    }
    ctx.putImageData(pixels, 0, 0);
  }, [seed]);
  return <canvas ref={ref} width={960} height={540} style={{position: 'absolute', inset: 0, opacity, pointerEvents: 'none', mixBlendMode: 'multiply'}} />;
};

const CornerBrackets: React.FC<{bounds: Box; inset: number; arm: number; stroke: number; color: string; opacity: number}> = ({bounds, inset, arm, stroke, color, opacity}) => {
  const x = bounds.x + inset;
  const y = bounds.y + inset;
  const right = bounds.x + bounds.width - inset;
  const bottom = bounds.y + bounds.height - inset;
  return <svg width={960} height={540} style={{position: 'absolute', inset: 0, overflow: 'visible', opacity}} aria-label="Evidence corners">
    <path d={`M${x + arm} ${y} H${x} V${y + arm}`} fill="none" stroke={color} strokeWidth={stroke} />
    <path d={`M${right - arm} ${y} H${right} V${y + arm}`} fill="none" stroke={color} strokeWidth={stroke} />
    <path d={`M${x} ${bottom - arm} V${bottom} H${x + arm}`} fill="none" stroke={color} strokeWidth={stroke} />
    <path d={`M${right} ${bottom - arm} V${bottom} H${right - arm}`} fill="none" stroke={color} strokeWidth={stroke} />
  </svg>;
};

export const Research: React.FC<ResearchProps> = p => {
  const f = useCurrentFrame();
  const {geometry: g, timing: t, colors: c} = p;
  const grow = ease(f, t.grow);
  const settle = ease(f, t.openingSettle);
  const crossing = ease(f, t.transition);
  const swap = ease(f, t.swap);
  const logo = ease(f, t.logo);
  const surface = mixBox({...g.input, y: g.input.y - g.initialLift * settle}, g.answerSurface, grow);
  const query: TextBox = {...g.initialQuery, ...mixBox(g.initialQuery, g.finalQuery, grow), size: lerp(g.initialQuery.size, g.finalQuery.size, grow), lineHeight: lerp(g.initialQuery.lineHeight, g.finalQuery.lineHeight, grow)};
  const ask = mixBox(g.initialAsk, g.finalAsk, grow);
  const emphasis = f <= t.askEmphasis[1] ? ease(f, t.askEmphasis.slice(0, 2)) : 1 - ease(f, t.askEmphasis.slice(1, 3));
  const answer = ease(f, t.answer);
  const support = ease(f, t.supporting);
  const evidence = ease(f, t.evidence);
  const draw = ease(f, t.cornerDraw);
  const firstLine = ease(f, t.preceding);
  const quote = p.quotation.open + p.evidence + p.quotation.close;
  const corners = mixBox(mixBox(mixBox(g.stripCorners, g.roomCorners, crossing), g.wideCorners, swap), g.logoCorners, logo);
  const cornerColor = mixColor(p.copper, p.light, logo);
  return <AbsoluteFill style={{background: p.background, letterSpacing: 0}}>
    <AbsoluteFill style={{opacity: 1 - crossing, background: `radial-gradient(ellipse 1600px 1000px at -220px -390px,${c.opticalIvory} 0%,transparent 85%),linear-gradient(130deg,transparent 30%,${c.opticalOchre} 160%),${c.opticalBase}`}}>
      <svg width={960} height={540} style={{position: 'absolute', inset: 0}}><defs><filter id="caustic"><feGaussianBlur stdDeviation={g.caustic.blur} /></filter></defs><path d={`M${g.caustic.x1} ${g.caustic.y1} L${g.caustic.x2} ${g.caustic.y2}`} fill="none" stroke={c.opticalIvory} strokeWidth={g.caustic.width} opacity={c.causticOpacity} filter="url(#caustic)" /></svg>
      <Grain seed={c.noiseSeed} opacity={c.noiseOpacity} />
    </AbsoluteFill>
    <AbsoluteFill style={{opacity: crossing}}>
      <Img src={staticFile(`generated-assets/${p.asset}`)} style={{width: 960, height: 540, objectFit: 'cover', transform: `scale(${lerp(1, g.roomZoom, progress(f, t.roomZoom))})`, transformOrigin: `${g.cameraCenter[0]}px ${g.cameraCenter[1]}px`}} />
      <AbsoluteFill style={{opacity: c.centralDarkAlpha * ease(f, t.centralDark), background: 'linear-gradient(to bottom,transparent 15%,#000 37%,#000 66%,transparent 86%)'}} />
    </AbsoluteFill>
    <AbsoluteFill style={{opacity: 1 - crossing, transform: `scale(${lerp(1, g.surfaceZoom, crossing)})`, transformOrigin: `${g.cameraCenter[0]}px ${g.cameraCenter[1]}px`}}>
      <div style={{...position(surface), background: p.paper, borderRadius: lerp(g.initialRadius, g.finalRadius, grow), transform: `perspective(${g.perspective}px) rotateY(${lerp(lerp(g.initialRotateY, g.settledRotateY, settle), g.finalRotateY, grow)}deg) rotateZ(${lerp(lerp(g.initialRotateZ, g.settledRotateZ, settle), g.finalRotateZ, grow)}deg)`, boxShadow: grow < .5 ? g.inputShadow : g.answerShadow, overflow: 'hidden'}}>
        <FitText text={p.query} box={query} color={p.ink}>{p.query.slice(0, Math.floor(p.query.length * progress(f, t.typing)))}</FitText>
        <div style={{...position(ask), borderRadius: ask.height / 2, background: p.copper, filter: `brightness(${1 - g.askDarken * emphasis})`}}>
          <FitText text={p.ask} box={textBox(g.askPadding, 0, ask.width - g.askPadding - g.askArrowRight - g.askArrowSize - 3, ask.height, g.askSize, g.askMin, 1, 400, ask.height)} color={c.askText} />
          <svg width={g.askArrowSize} height={g.askArrowSize} viewBox="0 0 12 12" style={{position: 'absolute', right: g.askArrowRight, top: (ask.height - g.askArrowSize) / 2}}><path d="M2 10 L10 2 M3 2 H10 V9" stroke={c.askText} strokeWidth="1.5" fill="none" /></svg>
        </div>
        <div style={{opacity: answer, transform: `translateY(${g.revealUp * (1 - answer)}px)`, filter: `blur(${g.revealBlur * (1 - answer)}px)`}}>
          <svg width={g.labelSparkle.size} height={g.labelSparkle.size} viewBox="0 0 8 8" style={{position: 'absolute', left: g.labelSparkle.x, top: g.labelSparkle.y}}><path d="M4 0 L5 3 L8 4 L5 5 L4 8 L3 5 L0 4 L3 3 Z" fill={c.label} /></svg>
          <FitText text={p.answerLabel} box={g.answerLabel} color={c.label} />
        </div>
        <FitText text={p.answer} box={g.answer} color={p.ink}>{p.answer.split(' ').map((word, i, words) => {
          const reveal = ease(f, [t.answer[0] + i * t.wordStagger, t.answer[1]]);
          return <React.Fragment key={i}><span style={{display: 'inline-block', opacity: reveal, transform: `translateY(${g.revealUp * (1 - reveal)}px)`, filter: `blur(${g.revealBlur * (1 - reveal)}px)`}}>{word}</span>{i < words.length - 1 ? ' ' : ''}</React.Fragment>;
        })}</FitText>
        <FitText text={p.supportingLine} box={g.supporting} color={p.ink} style={{opacity: support, transform: `translateY(${g.revealUp * (1 - support)}px)`}} />
        <div style={{...position(g.strip), height: g.strip.height * evidence, background: c.evidencePaper, borderRadius: g.stripRadius, overflow: 'hidden'}}>
          <FitText text={p.evidenceLabel} box={g.evidenceLabel} color={c.label} />
          <FitText text={quote} box={g.quote} color={p.ink} style={{opacity: evidence, transform: `translateX(${g.quoteX * (1 - evidence)}px)`, filter: `blur(${g.quoteBlur * (1 - evidence)}px)`}} />
        </div>
      </div>
    </AbsoluteFill>
    <div style={{...position(g.glass), borderRadius: g.glassRadius, background: `rgba(255,255,255,${c.glassAlpha})`, border: `${g.glassEdge}px solid rgba(255,239,214,.15)`, boxSizing: 'border-box', opacity: crossing * (1 - logo)}} />
    <CornerBrackets bounds={corners} inset={g.cornerInset * (1 - logo)} arm={lerp(g.cornerArm, g.logoArm, logo) * draw} stroke={lerp(g.cornerStroke, g.logoStroke, logo)} color={cornerColor} opacity={draw} />
    <FitText text={p.precedingLine} box={g.preceding} color={p.light} style={{opacity: firstLine * (1 - swap), clipPath: `inset(0 ${(1 - firstLine) * 100}% 0 0)`, transform: `translate(${g.precedingExitX * swap}px, ${g.precedingUp * (1 - firstLine)}px)`, filter: `blur(${g.textBlur * Math.max(1 - firstLine, swap)}px)`}} />
    <FitText text={p.ending} box={g.ending} color={p.light} style={{opacity: swap * (1 - logo), transform: `translateX(${g.endingEnterX * (1 - swap)}px)`, filter: `blur(${g.textBlur * (1 - swap) + g.brandBlur * logo}px)`}} />
    <FitText text={p.brand} box={g.brand} color={p.light} style={{opacity: logo, filter: `blur(${g.brandBlur * (1 - logo)}px)`}} />
    <svg width={960} height={540} style={{position: 'absolute', inset: 0, opacity: ease(f, t.dot)}}><circle cx={g.logoCorners.x + g.logoCorners.width / 2} cy={g.logoCorners.y + g.logoCorners.height / 2} r={g.logoDotRadius} fill={p.copper} /></svg>
  </AbsoluteFill>;
};
