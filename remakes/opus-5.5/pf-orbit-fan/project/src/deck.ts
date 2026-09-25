// Poster deck. `slot` is the card's position on the fan before any rotation:
// slot 0 sits at 0deg, slot j at j*17deg. Slots -3..3 are the seven cards on the
// fan at rest; slots 4 and 5 wait offscreen (opacity 0) and are carried onto the
// fan by the two one-position rotations while slots -3 and -2 leave it, so every
// rest pose shows exactly seven cards at j*17deg, j = -3..3.

export type Photo = 'coast' | 'desert' | 'forest' | 'mountains';

export type Poster = {
  slot: number;
  photo: Photo;
  // Crop inside the 340x320 photo window: zoom factor and focal point (0..1).
  zoom: number;
  fx: number;
  fy: number;
  no: string;
  title: string;
  place: string;
  coords: string;
  footer: string;
  ink: string;
  // Muted secondary ink for the metadata rows.
  sub: string;
};

export const DECK: Poster[] = [
  {
    slot: -3, photo: 'desert', zoom: 1.35, fx: 0.18, fy: 0.42,
    no: '01', title: 'Ember', place: 'Monument Valley, UT', coords: '36.99° N  110.10° W',
    footer: '#7C2F24', ink: '#FFF1EA', sub: 'rgba(255,241,234,0.62)',
  },
  {
    slot: -2, photo: 'forest', zoom: 1.12, fx: 0.62, fy: 0.45,
    no: '02', title: 'Hollow', place: 'Black Forest, DE', coords: '48.30° N  8.15° E',
    footer: '#27402F', ink: '#EAF1E6', sub: 'rgba(234,241,230,0.6)',
  },
  {
    slot: -1, photo: 'mountains', zoom: 1.2, fx: 0.2, fy: 0.5,
    no: '03', title: 'Summit', place: 'Kluane, Yukon', coords: '60.75° N  139.50° W',
    footer: '#1F46A0', ink: '#EEF3FF', sub: 'rgba(238,243,255,0.62)',
  },
  {
    slot: 0, photo: 'coast', zoom: 1.05, fx: 0.5, fy: 0.5,
    no: '04', title: 'Stillwater', place: 'Lago di Braies, IT', coords: '46.69° N  12.08° E',
    footer: '#0D5C58', ink: '#E7F6F3', sub: 'rgba(231,246,243,0.62)',
  },
  {
    slot: 1, photo: 'desert', zoom: 1.08, fx: 0.72, fy: 0.5,
    no: '05', title: 'Dune', place: 'Colorado Plateau, AZ', coords: '36.10° N  111.60° W',
    footer: '#E2B173', ink: '#3A2411', sub: 'rgba(58,36,17,0.62)',
  },
  {
    slot: 2, photo: 'mountains', zoom: 1.02, fx: 0.55, fy: 0.42,
    no: '06', title: 'Glacier', place: 'Saint Elias Range, YT', coords: '60.29° N  140.93° W',
    footer: '#E4572E', ink: '#FFF4EE', sub: 'rgba(255,244,238,0.72)',
  },
  {
    slot: 3, photo: 'forest', zoom: 1.3, fx: 0.78, fy: 0.3,
    no: '07', title: 'Canopy', place: 'Schwarzwald, DE', coords: '47.90° N  8.10° E',
    footer: '#B7C6A2', ink: '#1C2A1F', sub: 'rgba(28,42,31,0.6)',
  },
  {
    slot: 4, photo: 'coast', zoom: 1.7, fx: 0.02, fy: 0.3,
    no: '08', title: 'Wake', place: 'South Tyrol, IT', coords: '46.70° N  12.09° E',
    footer: '#5B2F1A', ink: '#F8EBDD', sub: 'rgba(248,235,221,0.6)',
  },
  {
    slot: 5, photo: 'desert', zoom: 1.4, fx: 0.82, fy: 0.3,
    no: '09', title: 'Mesa', place: 'Navajo Nation, AZ', coords: '37.00° N  110.20° W',
    footer: '#D88C6E', ink: '#3B1A10', sub: 'rgba(59,26,16,0.62)',
  },
];
