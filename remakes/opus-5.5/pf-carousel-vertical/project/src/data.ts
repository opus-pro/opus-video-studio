export type Poster = {
  image: string;
  color: string; // poster paper
  deep: string; // darker tone used for the stage glow
  kicker: string;
  title: string;
  caption: string;
  focus: string; // object-position for the photo crop
};

export const INK = '#F6F1E7';

export const POSTERS: Poster[] = [
  {
    image: 'assets/coast.jpg',
    color: '#0E5451',
    deep: '#0A3D3B',
    kicker: 'Coast',
    title: 'Still Water',
    caption: 'Morning light over a glacial lake.',
    focus: '50% 60%',
  },
  {
    image: 'assets/desert.jpg',
    color: '#B4482C',
    deep: '#7A2E1B',
    kicker: 'Desert',
    title: 'Red Silence',
    caption: 'Sandstone towers at the edge of noon.',
    focus: '40% 50%',
  },
  {
    image: 'assets/forest.jpg',
    color: '#33523A',
    deep: '#1F3826',
    kicker: 'Forest',
    title: 'Low Light',
    caption: 'Fog drifting through old growth.',
    focus: '55% 45%',
  },
  {
    image: 'assets/mountains.jpg',
    color: '#24467F',
    deep: '#182F58',
    kicker: 'Mountains',
    title: 'High Country',
    caption: 'Where the valley opens to the ice.',
    focus: '45% 55%',
  },
];
