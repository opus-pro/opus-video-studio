// Low-frequency procedural color field. Everything is a pure function of pixel
// position, the drift offset and the time uniform, so every frame is deterministic.

export const VERT = `
attribute vec2 aPos;
void main() {
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

export const FRAG = `
precision highp float;

uniform vec2 uRes;    // output size in px
uniform vec2 uDrift;  // field translation in px (screen space, +x right, +y down)
uniform float uT;     // seconds
uniform float uGrain; // grain amplitude (max deviation, 0..1)
uniform float uShade; // ribbon shading strength

// Palette (sRGB)
const vec3 CORAL = vec3(1.0, 0.4980, 0.4510);   // #ff7f73
const vec3 ICE   = vec3(0.7137, 0.8627, 0.9333); // #b6dcee
const vec3 GREEN = vec3(0.0784, 0.2941, 0.2549); // #144b41
const vec3 WHITE = vec3(0.9490, 0.9686, 0.9373); // #f2f7ef

vec3 toLinear(vec3 c) { return pow(c, vec3(2.2)); }
vec3 toSRGB(vec3 c)   { return pow(max(c, 0.0), vec3(1.0 / 2.2)); }

// OKLab so the transitions between bands stay luminous instead of going muddy.
vec3 toOklab(vec3 srgb) {
  vec3 c = toLinear(srgb);
  float l = 0.4122214708 * c.r + 0.5363325363 * c.g + 0.0514459929 * c.b;
  float m = 0.2119034982 * c.r + 0.6806995451 * c.g + 0.1073969566 * c.b;
  float s = 0.0883024619 * c.r + 0.2817188376 * c.g + 0.6299787005 * c.b;
  l = pow(l, 1.0 / 3.0); m = pow(m, 1.0 / 3.0); s = pow(s, 1.0 / 3.0);
  return vec3(
    0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s);
}
vec3 fromOklab(vec3 lab) {
  float l = lab.x + 0.3963377774 * lab.y + 0.2158037573 * lab.z;
  float m = lab.x - 0.1055613458 * lab.y - 0.0638541728 * lab.z;
  float s = lab.x - 0.0894841775 * lab.y - 1.2914855480 * lab.z;
  l = l * l * l; m = m * m * m; s = s * s * s;
  vec3 c = vec3(
     4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s);
  return toSRGB(c);
}

// Band ramp: broad plateaus joined by soft, wide transitions.
float band(float v, float a, float w) { return smoothstep(a - w, a + w, v); }

vec3 ramp(float v) {
  vec3 g = toOklab(GREEN);
  vec3 i = toOklab(ICE);
  vec3 w = toOklab(WHITE);
  vec3 c = toOklab(CORAL);
  vec3 col = g;
  col = mix(col, i, band(v, -0.05, 0.11));
  col = mix(col, w, band(v, 0.22, 0.10));
  col = mix(col, c, band(v, 0.47, 0.11));
  col = mix(col, i, band(v, 0.70, 0.10));
  col = mix(col, g, band(v, 0.90, 0.09));
  return col;
}

float fieldValue(vec2 p, float t) {
  // Layered low-frequency domain warps (shortest wavelength ~2.3 frame heights
  // wide), phase-shifting very slowly (<~20 px over the film) so the bands breathe
  // while the 160 px drift stays the dominant motion.
  vec2 q = p;
  q.x += 0.090 * sin(1.60 * p.y + 0.90 + 0.040 * t);
  q.y += 0.095 * sin(1.25 * q.x + 2.30 - 0.030 * t);
  q.y += 0.040 * sin(2.70 * q.x - 1.10 + 0.020 * t + 1.2 * q.y);
  // Diagonal band coordinate: bands rise gently toward the right.
  float v = q.y + 0.28 * (q.x - 0.89);
  // Let the bands swell and taper across the frame (spacing modulated around
  // the coral band) so they read as poured color rather than even stripes.
  return 0.47 + (v - 0.47) * (1.0 + 0.12 * sin(1.05 * q.x + 0.35 + 0.015 * t));
}

float hash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

void main() {
  vec2 px = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y); // top-left origin
  // The field content moves by uDrift, so sample it at (px - drift).
  vec2 p = (px - uDrift) / uRes.y;
  float t = uT;

  float v = fieldValue(p, t);
  vec3 lab = ramp(v);

  // Soft ribbon shading: light from above catches the upper side of each
  // lightness step, like folded silk. Wide sample distance keeps it soft.
  float e = 0.045;
  float lUp = ramp(fieldValue(p - vec2(0.0, e), t)).x;
  float lDn = ramp(fieldValue(p + vec2(0.0, e), t)).x;
  lab.x += uShade * (lUp - lDn);

  vec3 col = fromOklab(lab);

  // Static, screen-locked grain (no temporal flicker), max deviation = uGrain.
  float n = hash(floor(px)) + hash(floor(px) + 17.13) - 1.0; // triangular in [-1, 1]
  col += n * uGrain;

  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`;
