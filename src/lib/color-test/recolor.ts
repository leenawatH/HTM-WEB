// Wall recolouring — the colour-region heuristic at the heart of the
// colour-test feature. Pure functions so they are easy to reason about.

export type RGB = { r: number; g: number; b: number };

export function hexToRgb(hex: string): RGB {
  const n = parseInt(hex.replace("#", ""), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

// Average colour of a small patch around (x, y) — used to sample the wall
// when the user taps. Coordinates are in ImageData pixel space.
export function samplePatch(
  data: ImageData,
  x: number,
  y: number,
  radius = 4,
): RGB {
  let r = 0,
    g = 0,
    b = 0,
    count = 0;
  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      const px = x + dx;
      const py = y + dy;
      if (px < 0 || py < 0 || px >= data.width || py >= data.height) continue;
      const i = (py * data.width + px) * 4;
      r += data.data[i];
      g += data.data[i + 1];
      b += data.data[i + 2];
      count++;
    }
  }
  if (!count) return { r: 0, g: 0, b: 0 };
  return { r: r / count, g: g / count, b: b / count };
}

// Does a pixel belong to the wall? Compared on chromaticity (robust to
// shadows — hue stays constant as brightness changes) plus a generous
// brightness band so dark objects on a light wall are excluded.
function isWall(
  r: number,
  g: number,
  b: number,
  ref: RGB,
  refSum: number,
  refBright: number,
  chromaThresh: number,
  brightThresh: number,
): boolean {
  const sum = r + g + b || 1;
  const dr = r / sum - ref.r / refSum;
  const dg = g / sum - ref.g / refSum;
  const db = b / sum - ref.b / refSum;
  const chromaDist = Math.sqrt(dr * dr + dg * dg + db * db);
  if (chromaDist > chromaThresh) return false;
  const bright = sum / 3;
  return Math.abs(bright - refBright) <= brightThresh;
}

export type RecolorOptions = {
  refColor: RGB | null;
  paint: RGB;
  opacity: number; // 0..1
  tolerance: number; // 0..1 — widens the match
  personMask?: Uint8Array | null; // value > 128 = person, left untouched
};

// Recolours wall pixels from `src` into `dst` using a multiply blend so the
// wall's texture and shadows show through the new paint. Returns the number
// of pixels painted (useful for UI feedback).
export function recolor(
  src: ImageData,
  dst: ImageData,
  opts: RecolorOptions,
): number {
  const { refColor, paint, opacity, tolerance, personMask } = opts;
  const s = src.data;
  const d = dst.data;

  // no wall sampled yet — passthrough
  if (!refColor) {
    d.set(s);
    return 0;
  }

  const refSum = refColor.r + refColor.g + refColor.b || 1;
  const refBright = refSum / 3;
  const chromaThresh = 0.012 + tolerance * 0.06;
  const brightThresh = 40 + tolerance * 150;

  let painted = 0;
  for (let i = 0; i < s.length; i += 4) {
    const r = s[i];
    const g = s[i + 1];
    const b = s[i + 2];

    const person = personMask ? personMask[i >> 2] > 128 : false;

    if (
      !person &&
      isWall(r, g, b, refColor, refSum, refBright, chromaThresh, brightThresh)
    ) {
      // multiply blend keeps shadows/texture, then mix by opacity
      const mr = (paint.r * r) / 255;
      const mg = (paint.g * g) / 255;
      const mb = (paint.b * b) / 255;
      d[i] = r + (mr - r) * opacity;
      d[i + 1] = g + (mg - g) * opacity;
      d[i + 2] = b + (mb - b) * opacity;
      painted++;
    } else {
      d[i] = r;
      d[i + 1] = g;
      d[i + 2] = b;
    }
    d[i + 3] = 255;
  }
  return painted;
}
