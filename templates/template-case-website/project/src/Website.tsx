import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {Box, E, FitText, box, ease, lerp, mixColor, position, progress, textBox} from './primitives';

export const websiteDefaults = {
  section: 'Featured', publication: 'FIELDNOTES',
  paletteNames: ['White', 'Lavender', 'Charcoal'],
  paletteColors: ['#ffffff', '#ebe1fc', '#171719'],
  titles: ['Somewhere worth getting lost.', 'Out where the light stays.', 'A different kind of weekend.', 'Notes from the open road.'],
  eyebrow: 'FIELD JOURNAL, 4 MIN READ',
  description: 'Stories, places and a fresh perspective. A dispatch from somewhere different.',
  footer: 'Stories worth exploring.', selection: '#8650ed',
  copy: {inspector: 'Section', background: 'Background', separator: '/'},
  assets: ['alpine-valley.png', 'sandstone-desert.png', 'rowboat-lake.png', 'ridge-meadow.png'],
  colors: {canvas: '#ffffff', lightInk: '#100f21', lightSecondary: '#686774', darkInk: '#f4f4f4', darkSecondary: '#aaa8b0', inspector: '#ffffff', inspectorInk: '#24232a', border: '#c9c7ce', cursor: '#080809', cursorOutline: '#ffffff', pickerHue: '#8650ed'},
  geometry: {
    page: box(110, 147, 505, 266), finalPage: {x: 104, y: 62, scale: 1.49},
    pageShadow: '0 7px 17px rgba(0,0,0,.07)', outlineOffset: 3, outlineWidth: 1.5, outlineRadius: 7, handleSize: 5,
    section: textBox(15, 18, 470, 22, 16, 13, 1, 700, 20),
    columnStart: 15, columnStep: 118,
    photo: box(0, 48, 109, 72),
    eyebrow: textBox(0, 126, 109, 8, 4.5, 4.5, 1, 400, 6),
    title: textBox(0, 137, 109, 16, 7.4, 6, 2, 700, 8),
    description: textBox(0, 152, 109, 24, 5.9, 5.9, 3, 400, 8),
    footerGap: 14,
    footer: textBox(15, 242, 470, 10, 6.6, 6.6, 1, 400, 9),
    inspector: box(650, 147, 178, 103), pickerHeight: 226, inspectorRadius: 4,
    inspectorShadow: '0 4px 16px rgba(0,0,0,.08)',
    inspectorTitle: textBox(13, 15, 140, 15, 10, 10, 1, 700, 13),
    inspectorLabel: textBox(13, 36, 140, 10, 7, 7, 1, 400, 9),
    currentSwatch: box(13, 49, 15, 10),
    hex: textBox(33, 51, 110, 12, 7, 7, 1, 400, 9),
    chevron: {x: 160, y: 54, size: 6},
    saturation: box(13, 89, 147, 58), hue: box(13, 152, 147, 4),
    palette: {x: 19, y: 172, step: 31, size: 12, border: 1, selectionOffset: 3},
    inspectorExitX: 90,
    cursor: {size: 20, outline: 1, compressedScale: .86, ringStart: 5, ringEnd: 15, ringOpacity: .35, ringStroke: 1.2},
    cursorPoints: [[723, 255], [789, 201], [748, 264], [706, 325], [737, 325], [855, 352]],
  },
  timing: {approach: [0, 19], open: [20, 27], pickerFade: [21, 26], toSaturation: [28, 36], toLavender: [36, 45], lavenderClick: 49, lavender: [50, 65], toCharcoal: [66, 85], charcoalClick: 91, charcoal: [92, 112], close: [113, 127], camera: [128, 157], inspectorExit: [128, 143], clickCompressFrames: 2, clickRecoverFrames: 3, clickRingFrames: 6},
};
export type WebsiteProps = typeof websiteDefaults;

export const Website: React.FC<WebsiteProps> = p => {
  const f = useCurrentFrame();
  const {geometry: g, timing: t, colors: c} = p;
  const purple = ease(f, t.lavender);
  const dark = ease(f, t.charcoal);
  const fill = f < t.charcoal[0] ? mixColor(p.paletteColors[0], p.paletteColors[1], purple) : mixColor(p.paletteColors[1], p.paletteColors[2], dark);
  const ink = mixColor(c.lightInk, c.darkInk, dark);
  const secondary = mixColor(c.lightSecondary, c.darkSecondary, dark);
  const zoom = ease(f, t.camera);
  const unfold = ease(f, t.open) * (1 - ease(f, t.close));
  const selected = f >= t.charcoalClick ? 2 : f >= t.lavenderClick ? 1 : 0;
  const track = (a: number, b: number, range: number[]) => g.cursorPoints[a].map((v, i) => lerp(v, g.cursorPoints[b][i], ease(f, range)));
  let cursor = track(0, 1, t.approach);
  if (f >= t.toSaturation[0]) cursor = track(1, 2, t.toSaturation);
  if (f >= t.toLavender[0]) cursor = track(2, 3, t.toLavender);
  if (f >= t.toCharcoal[0]) cursor = track(3, 4, t.toCharcoal);
  if (f >= t.close[0]) cursor = track(4, 5, t.close);
  const lastClick = [t.open[0], t.lavenderClick, t.charcoalClick].filter(v => v <= f).at(-1);
  const clickAge = lastClick === undefined ? Infinity : f - lastClick;
  const press = clickAge <= t.clickCompressFrames ? lerp(1, g.cursor.compressedScale, clickAge / t.clickCompressFrames) : lerp(g.cursor.compressedScale, 1, Math.min(1, (clickAge - t.clickCompressFrames) / t.clickRecoverFrames));
  const ring = progress(clickAge, [0, t.clickRingFrames]);
  const activeHex = p.paletteColors[selected];
  const page: Box = {...g.page, x: lerp(g.page.x, g.finalPage.x, zoom), y: lerp(g.page.y, g.finalPage.y, zoom)};
  return <AbsoluteFill style={{background: c.canvas, letterSpacing: 0}}>
    <div style={{...position(page), background: fill, boxShadow: g.pageShadow, transformOrigin: 'top left', transform: `scale(${lerp(1, g.finalPage.scale, zoom)})`}}>
      <div style={{position: 'absolute', inset: -g.outlineOffset, border: `${g.outlineWidth}px solid ${p.selection}`, borderRadius: g.outlineRadius}}>
        {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([x, y]) => <div key={`${x}:${y}`} style={{position: 'absolute', width: g.handleSize, height: g.handleSize, background: c.canvas, border: `1px solid ${p.selection}`, left: x < 0 ? -g.handleSize / 2 : `calc(100% - ${g.handleSize / 2}px)`, top: y < 0 ? -g.handleSize / 2 : `calc(100% - ${g.handleSize / 2}px)`, boxSizing: 'border-box'}} />)}
      </div>
      <FitText text={p.section} box={g.section} color={ink} />
      {p.titles.map((title, i) => {
        const x = g.columnStart + g.columnStep * i;
        return <React.Fragment key={i}>
          <Img src={staticFile(`generated-assets/${p.assets[i]}`)} style={{...position({...g.photo, x}), objectFit: 'cover'}} />
          <FitText text={p.eyebrow} box={{...g.eyebrow, x}} color={secondary} />
          <FitText text={title} box={{...g.title, x}} color={ink} />
          <FitText text={p.description} box={{...g.description, x}} color={secondary} />
        </React.Fragment>;
      })}
      <FitText text={`${p.publication} ${p.copy.separator} ${p.footer}`} box={g.footer} color={secondary}>
        <span>{p.publication}</span><span style={{marginLeft: g.footerGap}}>{p.copy.separator}</span><span style={{marginLeft: g.footerGap}}>{p.footer}</span>
      </FitText>
    </div>
    <div style={{...position(g.inspector), height: lerp(g.inspector.height, g.pickerHeight, unfold), background: c.inspector, borderRadius: g.inspectorRadius, boxShadow: g.inspectorShadow, overflow: 'hidden', transform: `translateX(${g.inspectorExitX * ease(f, t.inspectorExit)}px)`, opacity: 1 - ease(f, t.inspectorExit)}}>
      <FitText text={p.copy.inspector} box={g.inspectorTitle} color={c.inspectorInk} />
      <FitText text={p.copy.background} box={g.inspectorLabel} color={c.inspectorInk} />
      <div style={{...position(g.currentSwatch), background: fill, border: `1px solid ${c.border}`, boxSizing: 'border-box'}} />
      <FitText text={activeHex} box={g.hex} color={c.inspectorInk} />
      <svg width={g.chevron.size} height={g.chevron.size} style={{position: 'absolute', left: g.chevron.x, top: g.chevron.y}} viewBox="0 0 6 6"><path d="M1 2 L3 4 L5 2" fill="none" stroke={c.inspectorInk} strokeWidth=".7" /></svg>
      <div style={{opacity: ease(f, t.pickerFade) * (1 - ease(f, t.close))}}>
        <div style={{...position(g.saturation), background: `linear-gradient(to top,#000,transparent),linear-gradient(to right,#fff,transparent),${c.pickerHue}`}} />
        <div style={{...position(g.hue), background: 'linear-gradient(to right,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)'}} />
        {p.paletteColors.map((color, i) => <div key={p.paletteNames[i]} style={{position: 'absolute', left: g.palette.x + i * g.palette.step, top: g.palette.y, width: g.palette.size, height: g.palette.size, background: color, border: `${g.palette.border}px solid ${c.border}`, boxSizing: 'border-box', outline: selected === i ? `${g.outlineWidth}px solid ${p.selection}` : 'none', outlineOffset: g.palette.selectionOffset}} />)}
      </div>
    </div>
    <div style={{position: 'absolute', left: cursor[0], top: cursor[1], opacity: 1 - ease(f, t.close)}}>
      {clickAge < t.clickRingFrames && <div style={{position: 'absolute', width: 2 * lerp(g.cursor.ringStart, g.cursor.ringEnd, ring), height: 2 * lerp(g.cursor.ringStart, g.cursor.ringEnd, ring), borderRadius: '50%', border: `${g.cursor.ringStroke}px solid ${p.selection}`, transform: 'translate(-50%,-50%)', opacity: g.cursor.ringOpacity * (1 - ring)}} />}
      <svg width={g.cursor.size} height={g.cursor.size} viewBox="0 0 20 20" style={{display: 'block', transformOrigin: '0 0', transform: `scale(${press})`, overflow: 'visible'}}><path d="M0 0 L4.5 17 L8.4 12.5 L12.2 19 L15.2 17.3 L11.5 11 L17.7 10.5 Z" fill={c.cursor} stroke={c.cursorOutline} strokeWidth={g.cursor.outline} strokeLinejoin="round" /></svg>
    </div>
  </AbsoluteFill>;
};
