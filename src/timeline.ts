export const FPS = 30;

export type Clip = { start: number; end: number; zoom?: number; note?: string; muteAfter?: number; mute?: boolean };

export type PlacedClip = {
  srcStart: number; // seconds in source
  srcEnd: number;
  from: number; // output frame
  frames: number;
  zoom: number; // punch-in for jump-cut variety
  index: number;
  muteAfter?: number; // source second after which the voice is silenced (video keeps running)
  mute?: boolean; // b-roll: keep the picture, drop the voice (and its captions)
};

export type Timeline = ReturnType<typeof createTimeline>;

/** Lay an edit list (source seconds) end-to-end on the output timeline. */
export const createTimeline = (clips: Clip[]) => {
  let cursor = 0;
  const placed: PlacedClip[] = clips.map((c, index) => {
    const frames = Math.round((c.end - c.start) * FPS);
    const p = { srcStart: c.start, srcEnd: c.end, from: cursor, frames, zoom: c.zoom ?? 1, index, muteAfter: c.muteAfter, mute: c.mute };
    cursor += frames;
    return p;
  });
  const total = cursor;

  /**
   * Source timestamp -> output frame. `prefer` picks which occurrence when a
   * moment is used twice (hook + body). Returns null if that moment was cut.
   */
  const srcToFrame = (t: number, prefer: "first" | "last" = "last"): number | null => {
    const hits = placed.filter((c) => t >= c.srcStart - 1e-3 && t <= c.srcEnd + 1e-3);
    if (!hits.length) return null;
    const c = prefer === "first" ? hits[0] : hits[hits.length - 1];
    return c.from + Math.round((t - c.srcStart) * FPS);
  };

  const clipAt = (frame: number) =>
    placed.find((p) => frame >= p.from && frame < p.from + p.frames) ?? placed[placed.length - 1];

  /** Output frame -> source seconds. */
  const frameToSrc = (frame: number): number => {
    const c = clipAt(frame);
    return c.srcStart + (frame - c.from) / FPS;
  };

  return { placed, total, srcToFrame, frameToSrc, clipAt };
};
