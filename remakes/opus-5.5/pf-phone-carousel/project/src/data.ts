// Editable content for the three FIELD phones. Everything a screen shows is
// driven from here (composition defaultProps), so screens can be swapped or
// re-worded without touching layout code.

export type FieldScreenData = {
  id: string;
  photo: string; // file in public/assets
  photoPosition: string; // CSS object-position for the header crop
  place: string; // current checkpoint
  clock: string; // status-bar time
  progress: number; // 0..1 along the route — the marker position on the map
  moving: string; // moving time h:mm
  next: string; // next checkpoint label
  nextProgress: number;
  eta: string;
};

export type CarouselProps = {
  trail: string;
  totalKm: number;
  accent: string;
  background: string;
  screens: FieldScreenData[];
};

export const defaultCarouselProps: CarouselProps = {
  trail: 'Larch Ridge Trail',
  totalKm: 11.8,
  accent: '#ff5a1f',
  background: '#eff2ed',
  screens: [
    {
      id: 'pine-hollow',
      photo: 'forest.jpg',
      photoPosition: '50% 40%',
      place: 'Pine Hollow',
      clock: '8:52',
      progress: 0.22,
      moving: '0:52',
      next: 'Glacier Saddle',
      nextProgress: 0.58,
      eta: '12:25',
    },
    {
      id: 'glacier-saddle',
      photo: 'mountains.jpg',
      photoPosition: '50% 45%',
      place: 'Glacier Saddle',
      clock: '10:31',
      progress: 0.58,
      moving: '2:31',
      next: 'Emerald Lake',
      nextProgress: 0.9,
      eta: '12:20',
    },
    {
      id: 'emerald-lake',
      photo: 'coast.jpg',
      photoPosition: '50% 35%',
      place: 'Emerald Lake',
      clock: '11:58',
      progress: 0.9,
      moving: '3:58',
      next: 'Trail end',
      nextProgress: 1,
      eta: '12:14',
    },
  ],
};
