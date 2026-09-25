import React, {useLayoutEffect, useRef} from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {FRAG, VERT} from './field-shader';

// Total field drift over the film: 160 px along a shallow up-left diagonal.
const DRIFT_ANGLE = Math.atan2(-40, -155);
export const DRIFT_PX = 160;
export const GRAIN = 0.012; // max deviation 1.2% (spec: <= 2%)
const SHADE = 0.2; // ribbon shading strength (OKLab L units per unit L step)

type GLState = {
  gl: WebGLRenderingContext;
  uRes: WebGLUniformLocation | null;
  uDrift: WebGLUniformLocation | null;
  uT: WebGLUniformLocation | null;
  uGrain: WebGLUniformLocation | null;
  uShade: WebGLUniformLocation | null;
};

const compile = (gl: WebGLRenderingContext, type: number, src: string) => {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    throw new Error('Shader compile failed: ' + gl.getShaderInfoLog(s));
  }
  return s;
};

const init = (canvas: HTMLCanvasElement): GLState => {
  const gl = canvas.getContext('webgl', {
    preserveDrawingBuffer: true,
    antialias: false,
    premultipliedAlpha: false,
    alpha: false,
  });
  if (!gl) throw new Error('WebGL unavailable');
  const prog = gl.createProgram()!;
  gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    throw new Error('Program link failed: ' + gl.getProgramInfoLog(prog));
  }
  gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'aPos');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  return {
    gl,
    uRes: gl.getUniformLocation(prog, 'uRes'),
    uDrift: gl.getUniformLocation(prog, 'uDrift'),
    uT: gl.getUniformLocation(prog, 'uT'),
    uGrain: gl.getUniformLocation(prog, 'uGrain'),
    uShade: gl.getUniformLocation(prog, 'uShade'),
  };
};

export const FieldCanvas: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height, fps, durationInFrames} = useVideoConfig();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<GLState | null>(null);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (!glRef.current) glRef.current = init(canvas);
    const {gl, uRes, uDrift, uT, uGrain, uShade} = glRef.current;
    // Linear drift: 0 px at the first frame, exactly DRIFT_PX at the last frame.
    const d = (frame / (durationInFrames - 1)) * DRIFT_PX;
    gl.viewport(0, 0, width, height);
    gl.uniform2f(uRes, width, height);
    gl.uniform2f(uDrift, Math.cos(DRIFT_ANGLE) * d, Math.sin(DRIFT_ANGLE) * d);
    gl.uniform1f(uT, frame / fps);
    gl.uniform1f(uGrain, GRAIN);
    gl.uniform1f(uShade, SHADE);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.finish();
  }, [frame, width, height, fps, durationInFrames]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{position: 'absolute', inset: 0, width, height}}
    />
  );
};
