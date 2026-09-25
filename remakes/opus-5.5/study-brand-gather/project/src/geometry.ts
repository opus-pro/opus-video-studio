// Eight-petal symbol: the union of four identical capsules (stadiums) that share a
// center and sit at 0, 45, 90 and 135 degrees. Everything is derived from two
// numbers: the overall diameter (tip to tip) and the capsule width.
//
// For the defaults (diameter 130, width 30) each capsule is exactly the rounded
// rectangle x=0 y=50 w=130 h=30 rx=ry=15 in a 130x130 box, i.e. a centerline of
// length 100 stroked round with width 30.

export const CAPSULE_ANGLES = [0, 45, 90, 135] as const;

type Pt = readonly [number, number];

const fmt = (n: number) => {
  // Trim float noise so the path string is stable and exact on the axes.
  const r = Math.round(n * 10000) / 10000;
  return Object.is(r, -0) ? '0' : String(r);
};
const p = ([x, y]: Pt) => `${fmt(x)} ${fmt(y)}`;

/**
 * One closed capsule outline centered on (cx, cy). All four capsules are traced
 * with the same winding, so a nonzero fill of the combined path is their union:
 * one solid silhouette with a filled middle and no internal seams.
 */
const capsulePath = (cx: number, cy: number, halfLength: number, radius: number, angleDeg: number) => {
  const a = (angleDeg * Math.PI) / 180;
  const ux = Math.cos(a);
  const uy = Math.sin(a);
  const nx = -uy;
  const ny = ux;
  const at = (along: number, across: number): Pt => [cx + ux * along + nx * across, cy + uy * along + ny * across];

  const A = at(halfLength, radius);
  const B = at(-halfLength, radius);
  const tipB = at(-halfLength - radius, 0);
  const C = at(-halfLength, -radius);
  const D = at(halfLength, -radius);
  const tipA = at(halfLength + radius, 0);
  const r = fmt(radius);
  // Each semicircular cap is split into two quarter arcs through its tip so the
  // arc solution is unambiguous regardless of floating point.
  return [
    `M ${p(A)}`,
    `L ${p(B)}`,
    `A ${r} ${r} 0 0 1 ${p(tipB)}`,
    `A ${r} ${r} 0 0 1 ${p(C)}`,
    `L ${p(D)}`,
    `A ${r} ${r} 0 0 1 ${p(tipA)}`,
    `A ${r} ${r} 0 0 1 ${p(A)}`,
    'Z',
  ].join(' ');
};

/** Path for the full symbol inside a `diameter` x `diameter` box (origin top-left). */
export const symbolPath = (diameter: number, capsuleWidth: number) => {
  const c = diameter / 2;
  const radius = capsuleWidth / 2;
  const halfLength = (diameter - capsuleWidth) / 2;
  return CAPSULE_ANGLES.map((angle) => capsulePath(c, c, halfLength, radius, angle)).join(' ');
};
