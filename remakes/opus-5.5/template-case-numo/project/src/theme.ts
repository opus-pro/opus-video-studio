export const W = 960;
export const H = 540;

export const C = {
  bg: '#090B10',
  bg2: '#0D1017',
  panel: '#11151E',
  panelHi: '#161B26',
  line: '#232A39',
  lineSoft: '#1A202C',
  text: '#EEF1F6',
  sub: '#A1A9BA',
  mute: '#5F687B',
  faint: '#3A4252',
  red: '#FF4B2B',
  redDeep: '#D8341A',
  mint: '#35E3A2',
  mintDeep: '#1FB57D',
  paper: '#F2EEE5',
  ink: '#0A0C11',
  blue: '#7C95FF',
  amber: '#F5B544',
};

export const SANS =
  '"SF Pro Display", "SF Pro Text", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif';
export const MONO = '"SF Mono", SFMono-Regular, Menlo, Monaco, Consolas, monospace';

// Scene timing (global frames, 60 fps)
export const T = {
  // S1 data wall
  s1End: 116,
  circleStart: 90,
  circleFull: 114,
  // T1 interstitial (-23.4%)
  t1TextIn: 102,
  t1TextOut: 150,
  t1CollapseStart: 158,
  t1CollapseEnd: 186,
  // S2 where
  s2Start: 156,
  t2ExpandStart: 282,
  t2ExpandEnd: 304,
  // T2 interstitial (14:02)
  t2TextIn: 294,
  t2TextOut: 334,
  t2CollapseStart: 344,
  t2CollapseEnd: 366,
  // S3 when
  s3Start: 342,
  t3ExpandStart: 452,
  t3ExpandEnd: 474,
  // T3 interstitial (roll back)
  t3TextIn: 464,
  t3TextOut: 502,
  t3CollapseStart: 506,
  t3CollapseEnd: 532,
  // S4 action
  s4Start: 504,
};
