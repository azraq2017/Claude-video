import React from "react";
import { PricePop, QuoteLabel, StressHit } from "../../components/Minimal";
import { createBase, Gfx, Project, Sfx } from "../../project";
import edl from "./edl.json";
import words from "./words.json";
import faces from "./faces.json";

/**
 * Video 20 — 19 Motor Trading: Yamaha Sport CDI ("Yamaha Sukan", PCY 6514), voice-over.
 * Source was rotated HEVC → transcoded upright. MINIMAL STYLE, clean subtitles (user request),
 * full take kept so the edit runs > 1:31 with all the walk-around b-roll (user request),
 * 19MTR outro. Hook = the jackpot price (big RM2,999 like the LC V4 edit the user liked).
 * The engine-running b-roll is kept with the music up but the engine still audible.
 */
const base = createBase({ clips: edl, faces: faces as number[][], words, keywords: [] });
const { F, gfx, tl } = base;

const HOOK_END = tl.placed[0].from + tl.placed[0].frames;
const fixed = (g: Gfx): Gfx => ({ ...g, place: "fixed" });
const TOP = 930; // above the subtitle band
const L = (from: number, to: number, lines: string[], highlight?: number, badge = true) =>
  fixed(gfx(from, to, 0, (d) => <QuoteLabel dur={d} lines={lines} highlight={highlight} top={TOP} left={90} badge={badge} />));

const GRAPHICS: Gfx[] = [
  // Hook — jackpot STRESS + big price
  fixed({ from: 0, dur: HOOK_END, height: 0, render: (d) => <StressHit dur={d} kind="jackpot" lines={[]} top={890} left={90} /> }),
  fixed({ from: 8, dur: HOOK_END - 8, height: 0, render: (d) => <PricePop dur={d} price="RM2,999" left={90} top={980} fontSize={170} /> }),

  L(0.0, 6.8, ["Yamaha Sport CDI", "a.k.a. Yamaha Sukan"], 0),
  L(7.3, 12.3, ["Sebiji je", "Dah restore · kondisi terbaik"], 1),
  L(18.48, 22.7, ["Enjin & ekzos", "sedap bunyi"]),
  fixed(gfx(45.9, 47.6, 0, (d) => <PricePop dur={d} price="RM2,999" model="Yamaha Sport CDI" left={90} top={940} fontSize={150} />)),
  L(53.36, 56.05, ["2-stroke · pakai minyak 2T"]),
  L(81.2, 84.4, ["DM kami", "Link di bio"], 1, false),
];

const SFX: Sfx[] = [
  { frame: 0, name: "impact", vol: 0.45 },
  { frame: 10, name: "cash", vol: 0.5 },
  { frame: HOOK_END - 4, name: "whoosh", vol: 0.4 },
];

// engine-running walk-around (no speech) in the full take
const BROLL = { from: F(59.6), to: F(81.1) };

export const yamahaSport: Project = {
  id: "YamahaSport",
  media: { video: "v20/source.mp4", voice: "v20/voice.m4a", music: "music/funky_chunk.mp3" },
  tl,
  face: base.face,
  captions: base.captions,
  speech: base.speech,
  graphics: GRAPHICS,
  sfx: SFX,
  flashCuts: [HOOK_END],
  // user asked for subtitles → clean minimal subtitles
  captionMode: "auto",
  captionStyle: "clean",
  plain: true,
  punches: [2],
  musicLevels: { underVoice: 0.07, open: 0.2 },
  musicBoost: [{ ...BROLL, level: 0.55 }],
  outro: true,
};
