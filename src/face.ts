import faces from "./data/faces.json";

// [t, x, y, w, h] normalised to the 1072x1920 source, sampled at 5 fps
const TRACK = faces as number[][];

export type Box = { x: number; y: number; w: number; h: number };

export const faceAt = (srcT: number): Box => {
  const i = Math.max(0, Math.min(TRACK.length - 1, Math.round(srcT * 5)));
  // light smoothing over +-2 samples
  const win = TRACK.slice(Math.max(0, i - 2), i + 3);
  const avg = (k: number) => win.reduce((s, r) => s + r[k], 0) / win.length;
  return { x: avg(1), y: avg(2), w: avg(3), h: avg(4) };
};

/** Union of face boxes over a source time range (in output pixels, 1080x1920). */
export const faceRegion = (srcFrom: number, srcTo: number): Box => {
  let x0 = 1, y0 = 1, x1 = 0, y1 = 0;
  for (let t = srcFrom; t <= srcTo; t += 0.2) {
    const b = faceAt(t);
    x0 = Math.min(x0, b.x); y0 = Math.min(y0, b.y);
    x1 = Math.max(x1, b.x + b.w); y1 = Math.max(y1, b.y + b.h);
  }
  // pad generously: hijab + sunglasses region around the detected face
  const padX = 0.06, padTop = 0.07, padBottom = 0.05;
  return {
    x: Math.max(0, x0 - padX) * 1080,
    y: Math.max(0, y0 - padTop) * 1920,
    w: (Math.min(1, x1 + padX) - Math.max(0, x0 - padX)) * 1080,
    h: (Math.min(1, y1 + padBottom) - Math.max(0, y0 - padTop)) * 1920,
  };
};
