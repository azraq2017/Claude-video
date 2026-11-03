import { CLIPS } from "./data/edl";

export const FPS = 30;

export type PlacedClip = {
  srcStart: number; // seconds in source
  srcEnd: number;
  from: number; // output frame
  frames: number;
  zoom: number; // punch-in for jump-cut variety
  index: number;
};

let cursor = 0;
export const PLACED: PlacedClip[] = CLIPS.map((c, index) => {
  const frames = Math.round((c.end - c.start) * FPS);
  const p = { srcStart: c.start, srcEnd: c.end, from: cursor, frames, zoom: c.zoom ?? 1, index };
  cursor += frames;
  return p;
});

export const TOTAL_FRAMES = cursor;

/**
 * Map a source timestamp (seconds) to an output frame.
 * `prefer` picks which occurrence when a source moment is used twice (hook + body).
 * Returns null if that moment was cut out.
 */
export const srcToFrame = (t: number, prefer: "first" | "last" = "last"): number | null => {
  const hits = PLACED.filter((c) => t >= c.srcStart - 1e-3 && t <= c.srcEnd + 1e-3);
  if (!hits.length) return null;
  const c = prefer === "first" ? hits[0] : hits[hits.length - 1];
  return c.from + Math.round((t - c.srcStart) * FPS);
};

/** Output frame -> source seconds (for face lookup). */
export const frameToSrc = (frame: number): number => {
  const c = PLACED.find((p) => frame >= p.from && frame < p.from + p.frames) ?? PLACED[PLACED.length - 1];
  return c.srcStart + (frame - c.from) / FPS;
};
