import {staticFile} from 'remotion';
import {FONT} from './theme';

let fontPromise: Promise<void> | null = null;

export const loadFont = (): Promise<void> => {
  if (!fontPromise) {
    const face = new FontFace(FONT, `url(${staticFile('assets/GeistVF.woff2')}) format('woff2')`, {
      weight: '100 900',
      style: 'normal',
    });
    fontPromise = face.load().then((loaded) => {
      (document.fonts as unknown as {add: (f: FontFace) => void}).add(loaded);
    });
  }
  return fontPromise;
};

// Summed-area table of a tone channel. Lets every dither cell box-average its
// exact (fractional) source footprint, so the 5% crop move changes the pattern
// smoothly and deterministically instead of snapping or shimmering at random.
export type ToneImage = {w: number; h: number; sat: Float64Array};

let tonePromise: Promise<ToneImage> | null = null;

// Rec.601 luma: the blue sky lands in the mid-tones, so snow and cloud read as
// clean coral shapes against it while the conifers go deep green.
const toneOf = (r: number, g: number, b: number) => (0.299 * r + 0.587 * g + 0.114 * b) / 255;

export const loadTone = (): Promise<ToneImage> => {
  if (!tonePromise) {
    tonePromise = new Promise<ToneImage>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d', {willReadFrequently: true});
        if (!ctx) {
          reject(new Error('2d context unavailable'));
          return;
        }
        ctx.drawImage(img, 0, 0);
        const data = ctx.getImageData(0, 0, w, h).data;
        const stride = w + 1;
        const sat = new Float64Array(stride * (h + 1));
        for (let y = 0; y < h; y++) {
          let run = 0;
          for (let x = 0; x < w; x++) {
            const i = (y * w + x) * 4;
            run += toneOf(data[i], data[i + 1], data[i + 2]);
            sat[(y + 1) * stride + x + 1] = sat[y * stride + x + 1] + run;
          }
        }
        resolve({w, h, sat});
      };
      img.onerror = () => reject(new Error('mountains.jpg failed to load'));
      img.src = staticFile('assets/mountains.jpg');
    });
  }
  return tonePromise;
};
