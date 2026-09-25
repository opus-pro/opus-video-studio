// Posters are drawn once into canvases (deterministic), then used both as DOM
// images and as the WebGL texture, so the DOM -> 3D hand-off is seamless.
import {POSTER_H, POSTER_W} from './timing';

export type PosterVariant = 'ring' | 'sun' | 'bars' | 'square';

const CANVAS_FONT = '"Helvetica Neue", Helvetica, Arial, sans-serif';

const mulberry32 = (seed: number) => () => {
  let t = (seed += 0x6d2b79f5);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const SPEC: Record<PosterVariant, {bg: [string, string]; fg: string; ink: string; no: string; title: string}> = {
  ring: {bg: ['#F45C35', '#E2462A'], fg: '#F8ECDD', ink: '#2A120B', no: 'Nº 04', title: 'Ring Study'},
  sun: {bg: ['#223158', '#18223F'], fg: '#F2D48A', ink: '#F2D48A', no: 'Nº 11', title: 'Low Sun'},
  bars: {bg: ['#F1E9DA', '#E8DECC'], fg: '#17181B', ink: '#17181B', no: 'Nº 07', title: 'Index'},
  square: {bg: ['#AFC4A8', '#9DB496'], fg: '#FBFAF6', ink: '#1F2A1D', no: 'Nº 19', title: 'Quiet Plot'},
};

const draw = (ctx: CanvasRenderingContext2D, variant: PosterVariant) => {
  const w = POSTER_W;
  const h = POSTER_H;
  const s = SPEC[variant];
  const g = ctx.createLinearGradient(0, 0, w * 0.3, h);
  g.addColorStop(0, s.bg[0]);
  g.addColorStop(1, s.bg[1]);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  // Motif
  ctx.save();
  if (variant === 'ring') {
    ctx.strokeStyle = s.fg;
    ctx.lineWidth = 17;
    ctx.beginPath();
    ctx.arc(w / 2, 108, 52, 0, Math.PI * 2);
    ctx.stroke();
    // a soft inner shadow line for print feel
    ctx.globalAlpha = 0.14;
    ctx.strokeStyle = '#7A1E0C';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(w / 2, 108, 43, 0, Math.PI * 2);
    ctx.stroke();
  } else if (variant === 'sun') {
    ctx.fillStyle = s.fg;
    ctx.beginPath();
    ctx.arc(w / 2, 150, 62, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.fillRect(22, 158, w - 44, 4);
    ctx.fillRect(40, 168, w - 80, 3);
  } else if (variant === 'bars') {
    ctx.fillStyle = s.fg;
    for (let i = 0; i < 4; i++) ctx.fillRect(18, 44 + i * 34, w - 36 - i * 30, 18);
    ctx.fillStyle = '#EF532D';
    ctx.beginPath();
    ctx.arc(w - 40, 170, 13, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.translate(w / 2, 112);
    ctx.rotate(Math.PI / 4);
    ctx.fillStyle = s.fg;
    ctx.fillRect(-44, -44, 88, 88);
  }
  ctx.restore();

  // Typography
  ctx.fillStyle = variant === 'ring' ? s.fg : s.ink;
  ctx.textBaseline = 'alphabetic';
  ctx.font = `700 8px ${CANVAS_FONT}`;
  ctx.fillText(s.no, 14, 22);
  ctx.textAlign = 'right';
  ctx.font = `500 8px ${CANVAS_FONT}`;
  ctx.fillText('2026', w - 14, 22);
  ctx.textAlign = 'left';
  ctx.globalAlpha = 0.9;
  ctx.fillRect(14, 202, w - 28, 0.8);
  ctx.globalAlpha = 1;
  ctx.font = `700 21px ${CANVAS_FONT}`;
  ctx.fillText(s.title, 13, 228);
  ctx.globalAlpha = 0.82;
  ctx.font = `500 7.5px ${CANVAS_FONT}`;
  ctx.fillText('SURFACE  /  FORM  /  LINE', 14, 246);
  ctx.textAlign = 'right';
  ctx.fillText('CASE 0' + (variant === 'ring' ? '4' : '2'), w - 14, 246);
  ctx.globalAlpha = 1;
  ctx.textAlign = 'left';

  // Fine print grain
  const rnd = mulberry32(variant.length * 97 + 13);
  for (let i = 0; i < 2600; i++) {
    const x = rnd() * w;
    const y = rnd() * h;
    ctx.fillStyle = rnd() > 0.5 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.045)';
    ctx.fillRect(x, y, 0.6, 0.6);
  }
};

const cache = new Map<string, HTMLCanvasElement>();

export const getPosterCanvas = (variant: PosterVariant, scale = 3): HTMLCanvasElement => {
  const key = `${variant}@${scale}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const c = document.createElement('canvas');
  c.width = Math.round(POSTER_W * scale);
  c.height = Math.round(POSTER_H * scale);
  const ctx = c.getContext('2d')!;
  ctx.scale(scale, scale);
  draw(ctx, variant);
  cache.set(key, c);
  return c;
};

const urlCache = new Map<string, string>();
export const getPosterUrl = (variant: PosterVariant, scale = 3): string => {
  const key = `${variant}@${scale}`;
  const hit = urlCache.get(key);
  if (hit) return hit;
  const url = getPosterCanvas(variant, scale).toDataURL('image/png');
  urlCache.set(key, url);
  return url;
};
