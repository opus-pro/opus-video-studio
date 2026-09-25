import type {ImageInfo} from './spatial';

export type ImageKey = 'coast' | 'desert' | 'forest' | 'mountains';

export const IMAGES: Record<ImageKey, ImageInfo & {file: string}> = {
  coast: {file: 'assets/coast.jpg', w: 1200, h: 800},
  desert: {file: 'assets/desert.jpg', w: 1200, h: 795},
  forest: {file: 'assets/forest.jpg', w: 1200, h: 800},
  mountains: {file: 'assets/mountains.jpg', w: 1200, h: 800},
};

/**
 * One photo per card. Repeated photos use different crops so the ring reads as
 * ten distinct frames. The assignment keeps neighbours different both around
 * the ring and along the opening flat row.
 * u / v: crop centre in the photo (0..1). zoom: > 1 crops tighter.
 */
export type CardSpec = {image: ImageKey; u: number; v: number; zoom: number};

export const CARDS: CardSpec[] = [
  {image: 'mountains', u: 0.3, v: 0.5, zoom: 1.0},
  {image: 'forest', u: 0.62, v: 0.55, zoom: 1.0},
  {image: 'coast', u: 0.5, v: 0.5, zoom: 1.0},
  {image: 'forest', u: 0.28, v: 0.5, zoom: 1.08},
  {image: 'mountains', u: 0.72, v: 0.46, zoom: 1.06},
  {image: 'desert', u: 0.3, v: 0.5, zoom: 1.0},
  {image: 'forest', u: 0.76, v: 0.44, zoom: 1.12},
  {image: 'desert', u: 0.72, v: 0.52, zoom: 1.04},
  {image: 'mountains', u: 0.5, v: 0.56, zoom: 1.14},
  {image: 'desert', u: 0.5, v: 0.4, zoom: 1.12},
];
