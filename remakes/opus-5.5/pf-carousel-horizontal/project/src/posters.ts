export type PosterData = {
  image: string;
  footer: string;
  ink: string;
  title: string;
  /** Focal point of the photo (object-position x, y in %). */
  focus: [number, number];
  /** Extra photo height hidden under the footer (crops scan junk at the bottom edge). */
  cropBottom?: number;
};

export const POSTERS: PosterData[] = [
  {image: 'coast.jpg', footer: '#cce789', ink: '#184c3a', title: 'Along the coast.', focus: [50, 55]},
  {image: 'forest.jpg', footer: '#184c3a', ink: '#cce789', title: 'Into the green.', focus: [58, 50]},
  {image: 'desert.jpg', footer: '#f4876e', ink: '#3a160d', title: 'A little further.', focus: [52, 0], cropBottom: 20},
  {image: 'mountains.jpg', footer: '#dae5ef', ink: '#1b2e44', title: 'Above it all.', focus: [50, 50]},
];

export const POSTER_W = 560;
export const POSTER_H = 720;
export const IMAGE_H = 538;
export const FOOTER_H = POSTER_H - IMAGE_H; // 182
