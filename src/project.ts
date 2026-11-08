import type React from "react";
import { createTimeline, Clip, Timeline } from "./timeline";
import { createFaceTrack, FaceTrack } from "./face";
import { buildCaptions, CapPage, Word } from "./captions";
import { OUTRO_FRAMES, OUTRO_OVERLAP, type OutroProps } from "./brand/Outro19";

export type Occ = "first" | "last";

export type SfxName =
  | "whoosh" | "swoosh_down" | "pop" | "click" | "ding" | "cash" | "impact"
  | "riser" | "error" | "drop" | "sparkle" | "shutter" | "notif" | "glass" | "send" | "stamp";

export type Sfx = { frame: number; name: SfxName; vol?: number };

export type Gfx = {
  from: number; // output frame
  dur: number; // frames
  height: number; // approx px height, for face-aware placement
  place?: "auto" | "below" | "fixed"; // "below": under the chin; "fixed": component positions itself (minimal style)
  render: (dur: number) => React.ReactNode;
};

export type Project = {
  id: string;
  media: { video: string; voice: string; music: string }; // paths inside /public
  tl: Timeline;
  face: FaceTrack;
  captions: CapPage[];
  speech: [number, number][];
  graphics: Gfx[];
  sfx: Sfx[];
  flashCuts: number[];
  musicLevels?: { underVoice: number; open: number };
  /** "exclusive": captions are hidden whenever any motion graphic is on screen (less crowded). */
  captionMode?: "auto" | "exclusive" | "none";
  /** "Captions only" look: no vignette, no slow push-in, no flash cuts. */
  plain?: boolean;
  /** Output frames that get a quick punch-in zoom (minimal style stress hits). */
  punches?: number[];
  /** Append the 19 Motor Trading logo outro (true = defaults, or override the text lines). */
  outro?: boolean | OutroProps;
};

/** Total output length including the outro (which overlaps the last OUTRO_OVERLAP frames). */
export const projectFrames = (p: Project) => p.tl.total + (p.outro ? OUTRO_FRAMES - OUTRO_OVERLAP : 0);

/** Shared plumbing every project needs: timeline, face track, captions and time helpers. */
export const createBase = (opts: { clips: Clip[]; faces: number[][]; words: Word[]; keywords: string[] }) => {
  const tl = createTimeline(opts.clips);
  const face = createFaceTrack(opts.faces);
  const { pages, speech } = buildCaptions(tl, opts.words, opts.keywords);

  /** source seconds -> output frame (throws if that moment was cut) */
  const F = (t: number, occ: Occ = "last"): number => {
    const f = tl.srcToFrame(t, occ);
    if (f === null) throw new Error(`Source time ${t}s is not in the edit`);
    return f;
  };

  /** A graphic shown from source time a to b; `r(t)` gives frames relative to its start. */
  const gfx = (
    fromSrc: number,
    toSrc: number,
    height: number,
    render: (dur: number, r: (t: number, occ?: Occ) => number) => React.ReactNode,
    occ: Occ = "last",
  ): Gfx => {
    const from = F(fromSrc, occ);
    const dur = F(toSrc, occ) - from;
    return { from, dur, height, render: (d) => render(d, (t, o) => F(t, o ?? occ) - from) };
  };

  const s = (t: number, name: SfxName, vol = 0.6, occ: Occ = "last"): Sfx => ({ frame: F(t, occ), name, vol });

  return { tl, face, captions: pages, speech, F, gfx, s };
};
