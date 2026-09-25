export type CardInfo = {
  file: string;
  title: string;
  place: string;
  time: string;
  /** Poster accent, sRGB hex. */
  accent: string;
  /** Horizontal focus of the cover crop, 0..1. */
  focusX: number;
};

export const CARDS: CardInfo[] = [
  {file: 'coast.jpg', title: 'Still Water', place: 'Alpine Lake', time: '06:40', accent: '#1E7A72', focusX: 0.5},
  {file: 'desert.jpg', title: 'Red Earth', place: 'Mesa Country', time: '17:05', accent: '#B4502C', focusX: 0.44},
  {file: 'forest.jpg', title: 'Understory', place: 'Old Growth', time: '08:15', accent: '#56753A', focusX: 0.6},
  {file: 'mountains.jpg', title: 'High Country', place: 'Glacial Valley', time: '12:30', accent: '#3A6BA5', focusX: 0.47},
];

export const SERIES = 'Field Studies';
export const FONT_FAMILY = 'Geist';
