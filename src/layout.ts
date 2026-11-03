import { faceAt } from "./face";
import { frameToSrc, PLACED, TOTAL_FRAMES } from "./timeline";
import { SAFE } from "./safe";

export const CAPTION_TOP = 1285; // captions occupy ~1285-1440

/* Per output frame: where the face is (px, after punch-in zoom), dilated over
 * +-10 frames so graphics move out of the way *before* the face arrives. */
const RAW_TOP = new Float32Array(TOTAL_FRAMES);
const RAW_BOT = new Float32Array(TOTAL_FRAMES);
for (let f = 0; f < TOTAL_FRAMES; f++) {
  const b = faceAt(frameToSrc(f));
  const z = (PLACED.find((c) => f >= c.from && f < c.from + c.frames)?.zoom ?? 1) * 1.03;
  const cy = b.y + b.h / 2;
  RAW_TOP[f] = (cy - (b.h / 2) * z - 0.045) * 1920; // hijab / forehead margin
  RAW_BOT[f] = (cy + (b.h / 2) * z + 0.03) * 1920; // chin margin
}
const R = 10;
export const FACE_TOP = new Float32Array(TOTAL_FRAMES);
export const FACE_BOT = new Float32Array(TOTAL_FRAMES);
for (let f = 0; f < TOTAL_FRAMES; f++) {
  let t = Infinity, b = -Infinity;
  for (let k = Math.max(0, f - R); k <= Math.min(TOTAL_FRAMES - 1, f + R); k++) {
    t = Math.min(t, RAW_TOP[k]);
    b = Math.max(b, RAW_BOT[k]);
  }
  FACE_TOP[f] = t;
  FACE_BOT[f] = b;
}

const GAP = 16;
const median = (a: number[]) => [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)];

export type Layout = { top: Float32Array; scale: Float32Array; coversCaptions: Uint8Array };

/**
 * Face-aware placement for one graphic over output frames [from, from+dur).
 * Picks a side once (above the head / below the chin) so it never jumps
 * across the face, then follows the face frame-by-frame with smoothing and
 * shrinks when space gets tight. Below-chin graphics may borrow the caption
 * band; captions are hidden for those frames.
 */
export const computeLayout = (from: number, dur: number, h: number): Layout => {
  const fr = Array.from({ length: dur }, (_, i) => Math.min(TOTAL_FRAMES - 1, from + i));
  const topSpace = fr.map((f) => FACE_TOP[f] - GAP - SAFE.top);
  const midSpace = fr.map((f) => CAPTION_TOP - 12 - (FACE_BOT[f] + GAP));
  const midSpaceFull = fr.map((f) => SAFE.bottom - (FACE_BOT[f] + GAP));
  const mt = median(topSpace), mm = median(midSpace), mf = median(midSpaceFull);

  let mode: "top" | "mid" | "midFull";
  if (mt >= h * 0.85) mode = "top";
  else if (mm >= h * 0.85) mode = "mid";
  else mode = mt >= mf ? "top" : "midFull";

  const rawTop: number[] = [], rawScale: number[] = [];
  fr.forEach((f, i) => {
    if (mode === "top") {
      const space = topSpace[i];
      const s = Math.min(1, Math.max(0.55, space / h));
      rawScale.push(s);
      rawTop.push(SAFE.top + Math.max(0, Math.min(30, space - h * s)));
    } else {
      const a = FACE_BOT[f] + GAP;
      const limit = mode === "mid" ? CAPTION_TOP - 12 : SAFE.bottom;
      const s = Math.min(1, Math.max(0.55, (limit - a) / h));
      rawScale.push(s);
      rawTop.push(Math.min(a, limit - h * s));
    }
  });
  // smooth (moving average, 9 frames) for calm motion
  const sm = (a: number[]) =>
    a.map((_, i) => {
      let s = 0, n = 0;
      for (let k = i - 4; k <= i + 4; k++) if (k >= 0 && k < a.length) { s += a[k]; n++; }
      return s / n;
    });
  const top = Float32Array.from(sm(rawTop));
  const scale = Float32Array.from(sm(rawScale));
  const coversCaptions = Uint8Array.from(fr.map((_, i) => (top[i] + h * scale[i] > CAPTION_TOP - 5 ? 1 : 0)));
  return { top, scale, coversCaptions };
};
