import {GridItem} from './objects';
import {EASE, HERO_X, HERO_Y, TL, lerp, prog} from './timing';

export const introDelay = (index: number) => 6 + index * 3;
export const floatY = (f: number, i: number) => 1.1 * Math.sin((f / 300) * Math.PI * 2 + i * 1.7);
export const recedeProgress = (f: number) => prog(f, TL.fly[0] - 4, TL.fly[1] + 14, EASE.inOut);
export const filterProgress = (f: number) => prog(f, TL.filter[0], TL.filter[1], EASE.inOut);

/** Shared pose for every non-selected grid object (DOM and WebGL layers). */
export const gridPose = (item: GridItem, index: number, f: number) => {
  const intro = prog(f, introDelay(index), introDelay(index) + 36, EASE.out);
  const fp = filterProgress(f);
  const rp = recedeProgress(f);
  const dx = item.x - HERO_X;
  const dy = item.y - HERO_Y;
  const inHeroZone = Math.abs(dx) < 130 && Math.abs(dy) < 150;
  const push = 1 + 0.1 * rp;
  const x = HERO_X + dx * push;
  const y = HERO_Y + dy * push + (1 - intro) * 14 + floatY(f, index);
  const scale = (0.94 + 0.06 * intro) * (1 - 0.16 * rp);
  const filtered = item.match ? 1 : lerp(1, 0.24, fp);
  const receded = inHeroZone ? 0 : item.match ? 0.17 : 0.085 / 0.24;
  const opacity = intro * filtered * lerp(1, receded, rp);
  const blur = 2.4 * rp;
  const gray = item.match ? 0 : 0.7 * fp;
  return {x, y, scale, opacity, blur, gray, intro};
};
