import React from "react";
import { QuoteLabel, StressHit } from "../../components/Minimal";
import { createBase, Gfx, Project, Sfx } from "../../project";
import edl from "./edl.json";
import words from "./words.json";
import faces from "./faces.json";

/**
 * Video 23 — 19 Motor Trading: Yamaha LC135 row in the showroom (LC V8, LC V4 biru PNK 4483).
 * Source was rotated HEVC → transcoded upright. MINIMAL STYLE + clean subtitles (user request),
 * 19MTR outro. One stress hit: "harga jackpot" (used as the hook too). The spoken slip
 * ("...harga cun-cun. Oh silap, yang ni") is cut.
 */
const base = createBase({ clips: edl, faces: faces as number[][], words, keywords: [] });
const { F, gfx, s, tl } = base;

const HOOK_END = tl.placed[0].from + tl.placed[0].frames;
const fixed = (g: Gfx): Gfx => ({ ...g, place: "fixed" });
const TOP = 930; // above the subtitle band
const L = (from: number, to: number, lines: string[], highlight?: number, badge = true) =>
  fixed(gfx(from, to, 0, (d) => <QuoteLabel dur={d} lines={lines} highlight={highlight} top={TOP} left={90} badge={badge} />));

const GRAPHICS: Gfx[] = [
  // Hook — jackpot STRESS
  fixed({ from: 0, dur: HOOK_END, height: 0, render: (d) => <StressHit dur={d} kind="jackpot" lines={["Yamaha LC135 V4", "PNK 4483"]} top={890} left={90} /> }),

  L(2.16, 6.2, ["Yamaha LC135", "Harga terbaik", "Full restore ✅"], 0),
  L(6.38, 12.0, ["📍 19 Motor Trading", "Sungai Petani"]),
  L(12.9, 17.7, ["Hujung sekali:", "LC V8 · sebiji je"], 1),
  L(22.08, 26.8, ["Kondisi tip-top", "Yang biru: LC V4"], 0),
  L(32.25, 34.45, ["LC V4 · PNK 4483"]),
  fixed(gfx(35.4, 37.6, 0, (d) => <StressHit dur={d} kind="jackpot" lines={["LC V4 biru", "Let go harga jackpot!"]} top={890} left={90} />)),
  L(37.7, 40.3, ["DM kita", "Info di bio"], 1, false),
  L(41.42, 43.4, ["Kondisi terbaik ✅"]),
];

const SFX: Sfx[] = [
  { frame: 0, name: "impact", vol: 0.45 },
  { frame: 6, name: "cash", vol: 0.45 },
  { frame: HOOK_END - 4, name: "whoosh", vol: 0.4 },
  s(35.45, "cash", 0.45),
];

export const lc135Row: Project = {
  id: "Lc135Row",
  media: { video: "v23/source.mp4", voice: "v23/voice.m4a", music: "music/funky_chunk.mp3" },
  tl,
  face: base.face,
  captions: base.captions,
  speech: base.speech,
  graphics: GRAPHICS,
  sfx: SFX,
  flashCuts: [HOOK_END],
  captionMode: "auto",
  captionStyle: "clean",
  plain: true,
  punches: [2, F(35.45)],
  musicLevels: { underVoice: 0.07, open: 0.2 },
  outro: true,
};
