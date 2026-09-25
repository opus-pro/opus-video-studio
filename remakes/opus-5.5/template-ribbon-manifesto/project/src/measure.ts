// Synchronous text measurement through a shared 2D canvas (system fonts only).
let ctx: CanvasRenderingContext2D | null = null;

export const SANS = 'Arial, Helvetica, sans-serif';
export const SERIF = 'Georgia, "Times New Roman", serif';

export const measureText = (text: string, fontSize: number, family: string, weight = 700): number => {
  if (typeof document !== 'undefined') {
    if (!ctx) ctx = document.createElement('canvas').getContext('2d');
    if (ctx) {
      ctx.font = `${weight} ${fontSize}px ${family}`;
      return ctx.measureText(text).width;
    }
  }
  // Fallback estimate (never used in the browser renderer).
  return text.length * fontSize * 0.56;
};

/**
 * Largest font size in [min, max] at which `text` fits `maxWidth` on one line.
 * Returns the chosen size and the measured width at that size.
 */
export const fitOneLine = (
  text: string,
  maxWidth: number,
  maxSize: number,
  minSize: number,
  family: string,
  weight = 700,
): {fontSize: number; width: number} => {
  const atMax = measureText(text, maxSize, family, weight);
  if (atMax <= maxWidth) return {fontSize: maxSize, width: atMax};
  // Width scales linearly with size; refine once to absorb hinting/kerning drift.
  let size = Math.max(minSize, (maxSize * maxWidth) / atMax);
  let width = measureText(text, size, family, weight);
  while (width > maxWidth && size > minSize) {
    size = Math.max(minSize, size - 0.25);
    width = measureText(text, size, family, weight);
  }
  return {fontSize: size, width};
};
