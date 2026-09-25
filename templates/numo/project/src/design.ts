import config from '../config/brand.json';
import timeline from '../config/timeline.json';
export const FPS=timeline.fps;
export const BPM=timeline.bpm;
export const BEAT=60/BPM;
export const CUT_BEATS=timeline.cutBeats;
export const CUTS=timeline.cutFrames;
export type Brand={template:string;name:string;tagline:string;background:string;ink:string;accent:string;paper:string};
// Template identity stays fixed when changing the display name.
export const brand:Brand={template:'NUMO',...config.product,...config.palette};
export const audio=config.audio;
