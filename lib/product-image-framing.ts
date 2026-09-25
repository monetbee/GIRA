export type ImageBounds = { x: number; y: number; width: number; height: number };

// Measure blank studio-image margins only; lifestyle/non-uniform images stay intact.
// Coordinates use a small analysis bitmap, not the original image dimensions.
export function productImageBounds(pixels: Uint8ClampedArray, width: number, height: number): ImageBounds {
  const full = { x: 0, y: 0, width, height };
  const corners = [0, width - 1, (height - 1) * width, height * width - 1];
  const transparent = corners.every((i) => pixels[i * 4 + 3] <= 16);
  const white = corners.every((i) => [0, 1, 2].every((c) => pixels[i * 4 + c] >= 240));
  if (!transparent && !white) return full;
  const blank = (x: number, y: number) => {
    const i = (y * width + x) * 4;
    return pixels[i + 3] <= 16 || (!transparent && pixels[i] >= 240 && pixels[i + 1] >= 240 && pixels[i + 2] >= 240);
  };
  // Any subject touching an edge is kept at the original framing.
  for (let x = 0; x < width; x++) if (!blank(x, 0) || !blank(x, height - 1)) return full;
  for (let y = 0; y < height; y++) if (!blank(0, y) || !blank(width - 1, y)) return full;
  let left = width, top = height, right = -1, bottom = -1;
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    if (!blank(x, y)) {
      left = Math.min(left, x); right = Math.max(right, x);
      top = Math.min(top, y); bottom = Math.max(bottom, y);
    }
  }
  if (right < left || right - left < width * 0.15 || bottom - top < height * 0.08) return full;
  // Keep a safety margin for anti-aliased frame edges and soft shadows.
  const padding = Math.max(2, Math.ceil(Math.max(width, height) * 0.02));
  left = Math.max(0, left - padding); top = Math.max(0, top - padding);
  right = Math.min(width - 1, right + padding); bottom = Math.min(height - 1, bottom + padding);
  return { x: left, y: top, width: right - left + 1, height: bottom - top + 1 };
}

export function productImageFrame(bounds: ImageBounds, width: number, height: number) {
  const ratio = 4 / 3;
  const scale = Math.min((ratio * 0.92) / bounds.width, 0.84 / bounds.height);
  return {
    width: `${(width * scale / ratio) * 100}%`,
    height: `${height * scale * 100}%`,
    left: `${50 - ((bounds.x + bounds.width / 2) * scale / ratio) * 100}%`,
    top: `${50 - (bounds.y + bounds.height / 2) * scale * 100}%`,
  };
}
