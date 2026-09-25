import {CARDS, FONT_FAMILY, SERIES, type CardInfo} from './cards';

// Poster canvas at exactly 2x the front card's on-screen size (529.9 x 686.9 px),
// so mip level 1 lands 1:1 on the resting hero card: supersampled, crisp type.
export const POSTER_W = 1060;
export const POSTER_H = 1374;

const PAPER = '#F2EFE8';
const INK = '#151412';
const MUTED = '#6E695F';

const pad2 = (n: number) => String(n).padStart(2, '0');

const drawCover = (
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  focusX: number,
) => {
  const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
  const sw = w / scale;
  const sh = h / scale;
  const sx = Math.min(img.naturalWidth - sw, Math.max(0, img.naturalWidth * focusX - sw / 2));
  const sy = (img.naturalHeight - sh) / 2;
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
};

const font = (weight: number, size: number) => `${weight} ${size}px ${FONT_FAMILY}, sans-serif`;

export const drawPoster = (card: CardInfo, index: number, img: HTMLImageElement): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  canvas.width = POSTER_W;
  canvas.height = POSTER_H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2D canvas unavailable');
  const M = 46;
  const inner = POSTER_W - 2 * M;

  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, POSTER_W, POSTER_H);
  ctx.textBaseline = 'alphabetic';

  // Header: issue number + series.
  const headerBase = 82;
  ctx.fillStyle = card.accent;
  ctx.fillRect(M, headerBase - 20, 20, 20);
  ctx.font = font(620, 28);
  ctx.letterSpacing = '0.5px';
  ctx.fillStyle = INK;
  ctx.textAlign = 'left';
  ctx.fillText(`N°${pad2(index + 1)}`, M + 34, headerBase);
  ctx.font = font(540, 24);
  ctx.letterSpacing = '3.5px';
  ctx.fillStyle = MUTED;
  ctx.textAlign = 'right';
  ctx.fillText(SERIES.toUpperCase(), POSTER_W - M + 3.5, headerBase);

  // Plate.
  const photoY = 112;
  const photoH = 972;
  drawCover(ctx, img, M, photoY, inner, photoH, card.focusX);

  // Title.
  ctx.textAlign = 'left';
  ctx.fillStyle = INK;
  ctx.font = font(640, 112);
  ctx.letterSpacing = '-4px';
  ctx.fillText(card.title, M - 5, photoY + photoH + 118);

  // Rule + colophon.
  const ruleY = photoY + photoH + 156;
  ctx.fillStyle = 'rgba(21, 20, 18, 0.16)';
  ctx.fillRect(M, ruleY, inner, 2);

  const metaBase = ruleY + 58;
  ctx.font = font(500, 29);
  ctx.letterSpacing = '0px';
  ctx.fillStyle = MUTED;
  ctx.fillText(`${card.place}  ·  ${card.time}`, M, metaBase);
  ctx.textAlign = 'right';
  ctx.font = font(600, 29);
  ctx.fillStyle = INK;
  ctx.fillText(`${pad2(index + 1)} / ${pad2(CARDS.length)}`, POSTER_W - M, metaBase);

  // Key light from the upper left (the same direction the contact shadows fall away from):
  // a faint lift at the top-left corner, a faint falloff toward the bottom-right.
  const light = ctx.createLinearGradient(0, 0, POSTER_W, POSTER_H);
  light.addColorStop(0, 'rgba(255, 255, 255, 0.07)');
  light.addColorStop(0.45, 'rgba(255, 255, 255, 0)');
  light.addColorStop(1, 'rgba(20, 16, 10, 0.07)');
  ctx.fillStyle = light;
  ctx.fillRect(0, 0, POSTER_W, POSTER_H);

  return canvas;
};
