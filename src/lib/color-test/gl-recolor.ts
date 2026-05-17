// WebGL recolour renderer for the paint colour-test camera.
//
// The per-pixel wall recolour used to run as a JavaScript loop on the main
// thread, which dropped the camera preview to a stutter on phones. This moves
// the whole operation onto the GPU: the main thread only uploads the current
// video frame as a texture and issues a single draw call per frame.
//
// The same shader supports two ways of deciding which pixels are wall:
//   - "chroma": a colour-similarity heuristic against a tapped reference
//     colour — the original behaviour, kept as a fallback.
//   - "mask":   a per-pixel wall mask texture produced by the AI segmenter,
//     uploaded asynchronously via `uploadMask`.

import type { RGB } from "./recolor";

export type WallMode = "chroma" | "mask";

export type GLRenderOpts = {
  active: boolean; // false = passthrough (before/after view, no wall yet)
  mode: WallMode;
  refColor: RGB | null;
  paint: RGB;
  opacity: number; // 0..1
  tolerance: number; // 0..1 — widens the chroma match
};

export type GLRecolor = {
  render: (frame: TexImageSource, opts: GLRenderOpts) => void;
  uploadMask: (mask: ImageData) => void;
  resize: (w: number, h: number) => void;
  dispose: () => void;
};

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  // clip-space quad (-1..1) -> texture uv, flipping Y so the video
  // (top-left origin) renders upright
  vUv = vec2((aPos.x + 1.0) * 0.5, (1.0 - aPos.y) * 0.5);
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

const FRAG = `
precision mediump float;
varying vec2 vUv;
uniform sampler2D uFrame;
uniform sampler2D uMask;
uniform int uMaskMode;     // 0 = chroma heuristic, 1 = mask texture
uniform int uActive;       // 0 = passthrough
uniform vec3 uRefChroma;   // reference chromaticity (rgb / sum)
uniform float uRefBright;  // reference brightness 0..1
uniform float uChromaThresh;
uniform float uBrightThresh;
uniform vec3 uPaint;       // paint colour 0..1
uniform float uOpacity;

void main() {
  vec3 c = texture2D(uFrame, vUv).rgb;
  if (uActive == 0) {
    gl_FragColor = vec4(c, 1.0);
    return;
  }

  float wall;
  if (uMaskMode == 1) {
    wall = texture2D(uMask, vUv).r; // AI mask: 0..1 wall coverage
  } else {
    float sum = max(c.r + c.g + c.b, 0.00392);
    vec3 chroma = c / sum;
    float chromaDist = distance(chroma, uRefChroma);
    float bright = sum / 3.0;
    // soft edges so the painted region does not look cut out
    float ch = 1.0 - smoothstep(uChromaThresh * 0.6, uChromaThresh, chromaDist);
    float br = 1.0 - smoothstep(
      uBrightThresh * 0.7, uBrightThresh, abs(bright - uRefBright));
    wall = ch * br;
  }

  vec3 painted = mix(c, uPaint * c, uOpacity); // multiply blend keeps texture
  gl_FragColor = vec4(mix(c, painted, wall), 1.0);
}`;

function compile(
  gl: WebGLRenderingContext,
  type: number,
  src: string,
): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("colour-test shader error:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function setTexParams(gl: WebGLRenderingContext) {
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
}

export function createGLRecolor(canvas: HTMLCanvasElement): GLRecolor | null {
  const gl = canvas.getContext("webgl", {
    preserveDrawingBuffer: true, // required for canvas.toDataURL() on capture
    alpha: false,
  });
  if (!gl) return null;

  const vs = compile(gl, gl.VERTEX_SHADER, VERT);
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return null;

  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("colour-test program link error:", gl.getProgramInfoLog(program));
    return null;
  }
  gl.useProgram(program);

  // full-screen quad (two triangles)
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
    gl.STATIC_DRAW,
  );
  const aPos = gl.getAttribLocation(program, "aPos");
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  // texture unit 0 — the live video frame
  const frameTex = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, frameTex);
  setTexParams(gl);

  // texture unit 1 — the wall mask; starts 1x1 so the sampler is always valid
  const maskTex = gl.createTexture();
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, maskTex);
  setTexParams(gl);
  gl.texImage2D(
    gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
    new Uint8Array([0, 0, 0, 255]),
  );

  const u = {
    frame: gl.getUniformLocation(program, "uFrame"),
    mask: gl.getUniformLocation(program, "uMask"),
    maskMode: gl.getUniformLocation(program, "uMaskMode"),
    active: gl.getUniformLocation(program, "uActive"),
    refChroma: gl.getUniformLocation(program, "uRefChroma"),
    refBright: gl.getUniformLocation(program, "uRefBright"),
    chromaThresh: gl.getUniformLocation(program, "uChromaThresh"),
    brightThresh: gl.getUniformLocation(program, "uBrightThresh"),
    paint: gl.getUniformLocation(program, "uPaint"),
    opacity: gl.getUniformLocation(program, "uOpacity"),
  };
  gl.uniform1i(u.frame, 0);
  gl.uniform1i(u.mask, 1);
  gl.viewport(0, 0, canvas.width, canvas.height);

  return {
    render(frame, opts) {
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, frameTex);
      gl.texImage2D(
        gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, frame,
      );

      const wallReady = opts.mode === "mask" || opts.refColor != null;
      gl.uniform1i(u.active, opts.active && wallReady ? 1 : 0);
      gl.uniform1i(u.maskMode, opts.mode === "mask" ? 1 : 0);

      if (opts.refColor) {
        const { r, g, b } = opts.refColor;
        const sum = Math.max(r + g + b, 1);
        gl.uniform3f(u.refChroma, r / sum, g / sum, b / sum);
        gl.uniform1f(u.refBright, sum / 3 / 255);
      }
      gl.uniform1f(u.chromaThresh, 0.012 + opts.tolerance * 0.06);
      gl.uniform1f(u.brightThresh, (40 + opts.tolerance * 150) / 255);
      gl.uniform3f(
        u.paint, opts.paint.r / 255, opts.paint.g / 255, opts.paint.b / 255,
      );
      gl.uniform1f(u.opacity, opts.opacity);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
    },

    uploadMask(mask) {
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, maskTex);
      gl.texImage2D(
        gl.TEXTURE_2D, 0, gl.RGBA, mask.width, mask.height, 0,
        gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(mask.data.buffer),
      );
    },

    resize(w, h) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    },

    dispose() {
      gl.deleteProgram(program);
      gl.deleteBuffer(buffer);
      gl.deleteTexture(frameTex);
      gl.deleteTexture(maskTex);
    },
  };
}
