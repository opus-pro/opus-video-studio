import {CELL, CONTENT_W, FONT, GREEN, H, INTRO_END, INTRO_START, M, PITCH, SWAP_END, SWAP_START, W, row} from './theme';

// ---------------------------------------------------------------------------
// Type. Cap height is exactly three mask cells (126 px) and the line pitch is
// four (168 px), so every line of caps sits in its own band of mask rows.
// ---------------------------------------------------------------------------
export const CAP = 3 * CELL;
export const LINE_PITCH = 4 * CELL;
export const TITLE_ROW = 3; // cap top of line 1 at row(3) = 171
export const WEIGHT = 700;
const TRACKING_EM = -0.022;

export type LayerId = 'design' | 'motion' | 'open' | 'date';
const TEXT: Record<LayerId, {text: string; line: number}> = {
  design: {text: 'DESIGN', line: 0},
  motion: {text: 'IN MOTION', line: 1},
  open: {text: 'IN THE OPEN', line: 1},
  date: {text: 'OCTOBER 24', line: 2},
};
export const LAYERS: LayerId[] = ['design', 'motion', 'open', 'date'];

export type Layer = {
  id: LayerId;
  canvas: HTMLCanvasElement;
  cov: Float32Array; // ink coverage per 7 px block, 180 x SUB_ROWS
  inkRight: number;
};

export type TitleSet = {size: number; layers: Record<LayerId, Layer>; widest: number};

// Mask grid covers every row the caps (and their overshoot) can touch.
export const MASK_ROW0 = TITLE_ROW - 1;
export const MASK_ROWS = 3 * 4 + 1; // rows 2..14
export const MASK_COLS = CONTENT_W / CELL; // 30
const SUB = CELL / PITCH; // 6 sub-blocks per cell side
const SUB_COLS = MASK_COLS * SUB;
const SUB_ROWS = MASK_ROWS * SUB;
const MASK_Y0 = row(MASK_ROW0);

let cached: TitleSet | null = null;

export const buildTitle = (): TitleSet => {
  if (cached) return cached;
  const probe = document.createElement('canvas').getContext('2d')!;
  probe.font = `${WEIGHT} 100px ${FONT}`;
  const capRatio = probe.measureText('H').actualBoundingBoxAscent / 100;
  const size = CAP / capRatio;
  const tracking = TRACKING_EM * size;

  const layers = {} as Record<LayerId, Layer>;
  let widest = 0;
  for (const id of LAYERS) {
    const {text, line} = TEXT[id];
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d', {willReadFrequently: true})!;
    ctx.font = `${WEIGHT} ${size}px ${FONT}`;
    ctx.letterSpacing = `${tracking}px`;
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = GREEN;
    const m = ctx.measureText(text);
    // Optical left edge: put the ink, not the advance origin, on the margin.
    const x = M + m.actualBoundingBoxLeft;
    const baseline = row(TITLE_ROW) + line * LINE_PITCH + CAP;
    ctx.fillText(text, x, baseline);
    const inkRight = x + m.actualBoundingBoxRight;
    widest = Math.max(widest, inkRight - M);

    // Ink coverage per 7 px block, used for the low-res resolve stages.
    const img = ctx.getImageData(M, MASK_Y0, SUB_COLS * PITCH, SUB_ROWS * PITCH).data;
    const rowStride = SUB_COLS * PITCH;
    const cov = new Float32Array(SUB_COLS * SUB_ROWS);
    for (let sr = 0; sr < SUB_ROWS; sr++) {
      for (let sc = 0; sc < SUB_COLS; sc++) {
        let a = 0;
        for (let yy = 0; yy < PITCH; yy++) {
          const base = ((sr * PITCH + yy) * rowStride + sc * PITCH) * 4 + 3;
          for (let xx = 0; xx < PITCH; xx++) a += img[base + xx * 4];
        }
        cov[sr * SUB_COLS + sc] = a / (255 * PITCH * PITCH);
      }
    }
    layers[id] = {id, canvas, cov, inkRight};
  }
  cached = {size, layers, widest};
  return cached;
};

// ---------------------------------------------------------------------------
// Mask order. One deterministic rank per 42 px cell: a left-to-right sweep
// with a gentle top-down lean, broken up by a hash so it reads as pixels,
// not a wipe. The same ranks drive the intro and the IN THE OPEN swap.
// ---------------------------------------------------------------------------
const hash = (x: number, y: number) => {
  let h = Math.imul(x + 1, 0x27d4eb2d) ^ Math.imul(y + 7, 0x165667b1);
  h = Math.imul(h ^ (h >>> 15), 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
};

const RANK: Float32Array = (() => {
  const n = MASK_COLS * MASK_ROWS;
  const keys: {i: number; k: number}[] = [];
  for (let r = 0; r < MASK_ROWS; r++) {
    for (let c = 0; c < MASK_COLS; c++) {
      const sweep = 0.82 * (c / (MASK_COLS - 1)) + 0.18 * (r / (MASK_ROWS - 1));
      keys.push({i: r * MASK_COLS + c, k: 0.58 * sweep + 0.42 * hash(c, r)});
    }
  }
  keys.sort((a, b) => a.k - b.k);
  const rank = new Float32Array(n);
  keys.forEach((e, j) => {
    rank[e.i] = j / (n - 1);
  });
  return rank;
})();

// Resolve stages after a cell appears: 14 px blocks, then 7 px blocks, then crisp.
export const STAGES = [14, 14, 7, 7];
const RESOLVE = STAGES.length;

// Cells appear on an ease-in-out density curve (inverse of easeInOutSine).
const invEase = (p: number) => Math.acos(1 - 2 * p) / Math.PI;

const appearFrame = (rank: number, start: number, end: number) =>
  start + Math.round(invEase(rank) * (end - RESOLVE - start));

export const introFrame = (cell: number) => appearFrame(RANK[cell], INTRO_START, INTRO_END);
export const swapFrame = (cell: number) => appearFrame(RANK[cell], SWAP_START, SWAP_END);

// ---------------------------------------------------------------------------
// Drawing
// ---------------------------------------------------------------------------
type CellState = -1 | number; // -1 hidden, 0..RESOLVE-1 stage, RESOLVE crisp

const stateFor = (id: LayerId, cell: number, frame: number): CellState => {
  const intro = introFrame(cell);
  const swap = swapFrame(cell);
  if (id === 'open') {
    if (frame < swap) return -1;
    return Math.min(frame - swap, RESOLVE);
  }
  if (frame < intro) return -1;
  if (id === 'motion' && frame >= swap) return -1;
  return Math.min(frame - intro, RESOLVE);
};

const drawBlocks = (ctx: CanvasRenderingContext2D, layer: Layer, cr: number, cc: number, block: number) => {
  const k = block / PITCH; // sub-blocks per drawn block
  const per = SUB / k;
  for (let by = 0; by < per; by++) {
    for (let bx = 0; bx < per; bx++) {
      let a = 0;
      for (let yy = 0; yy < k; yy++) {
        for (let xx = 0; xx < k; xx++) {
          const sr = cr * SUB + by * k + yy;
          const sc = cc * SUB + bx * k + xx;
          a += layer.cov[sr * SUB_COLS + sc];
        }
      }
      a /= k * k;
      if (a > (block > PITCH ? 0.34 : 0.46)) {
        ctx.fillRect(M + cc * CELL + bx * block, MASK_Y0 + cr * CELL + by * block, block, block);
      }
    }
  }
};

export const drawTitle = (ctx: CanvasRenderingContext2D, set: TitleSet, frame: number) => {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = GREEN;
  for (const id of LAYERS) {
    const layer = set.layers[id];
    for (let cr = 0; cr < MASK_ROWS; cr++) {
      for (let cc = 0; cc < MASK_COLS; cc++) {
        const cell = cr * MASK_COLS + cc;
        const s = stateFor(id, cell, frame);
        if (s < 0) continue;
        const x = M + cc * CELL;
        const y = MASK_Y0 + cr * CELL;
        if (s >= RESOLVE) {
          ctx.drawImage(layer.canvas, x, y, CELL, CELL, x, y, CELL, CELL);
        } else {
          drawBlocks(ctx, layer, cr, cc, STAGES[s]);
        }
      }
    }
  }
};
