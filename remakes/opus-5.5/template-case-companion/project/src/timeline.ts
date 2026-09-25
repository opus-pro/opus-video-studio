import {Cam, EASE, P, Pose, childPose, poseTrack, prog, track} from './math';

export const PROMPT = 'A lighthouse on a floating island at dusk';

// Input panel geometry
export const PANEL = {w: 680, h: 124, r: 30};
export const BTN = {w: 136, h: 56, right: 22, top: 50};
export const BTN_C = {x: PANEL.w - BTN.right - BTN.w / 2, y: BTN.top + BTN.h / 2};

// Phone geometry
export const PHONE = {w: 212, h: 436, r: 40, inset: 9};
export const SCREEN = {w: PHONE.w - PHONE.inset * 2, h: PHONE.h - PHONE.inset * 2};
export const SLOT = {x: 11, y: 82, w: 172, h: 215, r: 18};
export const SLOT_C = {x: PHONE.inset + SLOT.x + SLOT.w / 2, y: PHONE.inset + SLOT.y + SLOT.h / 2};
export const SHARE_BTN = {x: 14 + 76 + 8, y: 364, w: 82, h: 34};

// Hero image (base size = card size)
export const HERO = {w: 240, h: 300};

// Glass card geometry
export const CARD = {w: 272, h: 392, r: 30, pad: 16};
export const CARD_C = {x: CARD.pad + HERO.w / 2, y: CARD.pad + HERO.h / 2};

export const T = {
  typeStart: 24,
  typeEnd: 80,
  click: 100,
  orbBorn: 105,
  orbLand: 150,
  tap: 194,
  liftStart: 204,
  liftEnd: 240,
};

export const typedCount = (f: number) => {
  if (f < T.typeStart) return 0;
  // slightly irregular cadence, deterministic
  const n = PROMPT.length;
  const t = (f - T.typeStart) / (T.typeEnd - T.typeStart);
  const wobble = Math.sin(t * 17) * 0.018 + Math.sin(t * 41) * 0.008;
  return Math.max(0, Math.min(n, Math.floor((t + wobble) * n)));
};

export const cameraAt = (f: number): Cam => ({
  x: track(f, [
    [0, 0],
    [70, 0],
    [104, -196, EASE.inOut],
    [112, -200, EASE.linear],
    [154, 0, EASE.inOut],
    [316, 0],
  ]),
  y: track(f, [
    [0, 6],
    [70, 0, EASE.soft],
    [104, -8, EASE.inOut],
    [112, -8, EASE.linear],
    [154, 0, EASE.inOut],
    [316, 0],
  ]),
  z: track(f, [
    [0, 30],
    [70, 84, EASE.soft],
    [104, 470, EASE.inOut],
    [112, 480, EASE.linear],
    [154, 0, EASE.inOut],
    [200, 46, EASE.soft],
    [240, -10, EASE.inOut],
    [316, 36, EASE.soft],
  ]),
  ry: track(f, [
    [0, 0],
    [236, 0],
    [262, -4, EASE.inOut],
    [316, 3, EASE.soft],
  ]),
  rx: track(f, [
    [0, 0],
    [236, 0],
    [316, -1.5, EASE.soft],
  ]),
  pz: -180,
});

export const panelPose = (f: number): Pose =>
  poseTrack(f, [
    [0, {x: 480, y: 318, z: -140, rx: 30, ry: -2, rz: 0, s: 1}],
    [34, {y: 262, z: 0, rx: 10, ry: -4}, EASE.out],
    [70, {y: 258, rx: 8, ry: -5}, EASE.soft],
    [104, {rx: 5, ry: -13}, EASE.inOut],
    [112, {rx: 5, ry: -13.5}, EASE.linear],
    [156, {x: 230, y: 250, z: -420, rx: 10, ry: 22}, EASE.inOut],
    [316, {x: 200, z: -480}],
  ]);

export const panelOpacity = (f: number) => (0.45 + 0.55 * prog(f, 0, 14, EASE.soft)) * (1 - prog(f, 128, 164, EASE.soft));

export const phonePose = (f: number): Pose => {
  const bob = Math.sin(f / 22) * 3;
  const p = poseTrack(f, [
    [0, {x: 1500, y: 330, z: -320, rx: 12, ry: -62, rz: 10, s: 1}],
    [114, {}],
    [162, {x: 480, y: 268, z: 0, rx: 5, ry: -17, rz: 0}, EASE.outSoft],
    [202, {ry: -10, rx: 4}, EASE.soft],
    [240, {y: 900, z: -320, rx: 38, ry: -2}, EASE.inOut],
    [316, {y: 900}],
  ]);
  return {...p, y: p.y + bob * (1 - prog(f, 204, 230))};
};

export const phoneSlotPose = (f: number): Pose =>
  childPose(phonePose(f), PHONE.w, PHONE.h, SLOT_C.x, SLOT_C.y, 1.5, SLOT.w / HERO.w);

export const cardPose = (f: number): Pose => {
  const p = poseTrack(f, [
    [0, {x: 480, y: 290, z: -120, rx: 10, ry: -12, rz: 0, s: 0.9}],
    [208, {}],
    [246, {y: 270, z: 0, rx: 3, ry: 6, s: 1}, EASE.out],
    [316, {ry: -2, rx: 2}, EASE.soft],
  ]);
  return {...p, y: p.y + Math.sin(f / 30) * 2.5 * prog(f, 240, 270)};
};

export const cardSlotPose = (f: number): Pose => childPose(cardPose(f), CARD.w, CARD.h, CARD_C.x, CARD_C.y, 1.5, 1);

export const btnWorld = (f: number) => {
  const p = panelPose(f);
  return childPose(p, PANEL.w, PANEL.h, BTN_C.x, BTN_C.y, 18);
};

export const heroPose = (f: number): {pose: Pose; radius: number} => {
  if (f <= T.liftStart) return {pose: phoneSlotPose(f), radius: SLOT.r / (SLOT.w / HERO.w)};
  // the image leaves from where it sat when the lift began; the phone drops away beneath it
  const a = phoneSlotPose(T.liftStart);
  const b = cardSlotPose(f);
  const t = prog(f, T.liftStart, T.liftEnd, EASE.inOut);
  const arc = Math.sin(Math.PI * t);
  const pose: Pose = {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t - arc * 26,
    z: a.z + (b.z - a.z) * t + arc * 170,
    rx: a.rx + (b.rx - a.rx) * t - arc * 6,
    ry: a.ry + (b.ry - a.ry) * t + arc * 10,
    rz: a.rz + (b.rz - a.rz) * t - arc * 2,
    s: a.s + (b.s - a.s) * t,
  };
  const r0 = SLOT.r / (SLOT.w / HERO.w);
  return {pose, radius: r0 + (18 - r0) * t};
};

export const P0 = P;
