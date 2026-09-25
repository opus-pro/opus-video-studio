// Eight-petal "forma" symbol: the solid union of four identical capsules
// rotated 0/45/90/135 degrees about the centre. Implemented with the spec's
// equivalent construction: four centreline segments of length (D - W), centred
// on the origin, each swept by a round stroke of width W. For D=130, W=30 that
// is four 100px segments with a 15px radius -- identical to the 130x30 rounded
// rectangles with rx=ry=15 (x=0, y=50 in a 130 viewBox).
//
// Rendering uses the exact signed distance to that union, so edges are
// analytically antialiased and every frame is deterministic (no dependence on
// the GPU rasterizer's MSAA pattern).

export type SymbolSpec = {
  construction: 'four-capsule-union';
  diameter: number;
  capsuleWidth: number;
};

export type Capsules = {
  /** unit directions of the centreline segments */
  dirs: ReadonlyArray<readonly [number, number]>;
  /** half the centreline length */
  half: number;
  /** stroke radius */
  radius: number;
};

export const capsulesFor = ({diameter, capsuleWidth}: SymbolSpec): Capsules => ({
  dirs: [0, 45, 90, 135].map((deg) => {
    const r = (deg * Math.PI) / 180;
    return [Math.cos(r), Math.sin(r)] as const;
  }),
  half: (diameter - capsuleWidth) / 2,
  radius: capsuleWidth / 2,
});

/** Signed distance (symbol units) from a point, relative to the centre, to the union. */
export const unionDistance = (c: Capsules, x: number, y: number): number => {
  let best = Infinity;
  for (let k = 0; k < c.dirs.length; k++) {
    const ux = c.dirs[k][0];
    const uy = c.dirs[k][1];
    let t = x * ux + y * uy;
    if (t > c.half) t = c.half;
    else if (t < -c.half) t = -c.half;
    const dx = x - t * ux;
    const dy = y - t * uy;
    const d = Math.sqrt(dx * dx + dy * dy);
    if (d < best) best = d;
  }
  return best - c.radius;
};
