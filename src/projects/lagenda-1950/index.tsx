import React from "react";
import { PricePop, QuoteLabel, StressHit } from "../../components/Minimal";
import { createBase, Gfx, Project, Sfx } from "../../project";
import edl from "./edl.json";
import words from "./words.json";
import faces from "./faces.json";

/**
 * Video 16 — 19 Motor Trading: Honda Lagenda 115ZR (BLP 8784) walk-around, voice-over.
 * Source was rotated HEVC → transcoded upright. MINIMAL STYLE, no subtitles, 19MTR outro.
 * One stress hit: jackpot price RM1,950 (normally RM2,500–RM2,999).
 */
const base = createBase({ clips: edl, faces: faces as number[][], words, keywords: [] });
const { F, gfx, s, tl } = base;

const HOOK_END = tl.placed[0].from + tl.placed[0].frames;
const fixed = (g: Gfx): Gfx => ({ ...g, place: "fixed" });
const TOP = 1060;

const GRAPHICS: Gfx[] = [
  // Hook: model + price up front, plus the urgency line being spoken
  fixed({ from: 0, dur: HOOK_END, height: 0, render: (d) => (
    <QuoteLabel dur={d} lines={["Honda Lagenda 115ZR", "RM1,950 · sebiji je!"]} highlight={1} top={TOP} left={90} />
  ) }),
  fixed(gfx(1.04, 7.5, 0, (d) => <PricePop dur={d} price="RM1,950" model="Honda Lagenda 115ZR" left={90} top={1080} fontSize={150} />)),
  fixed(gfx(11.2, 17.7, 0, (d) => <QuoteLabel dur={d} lines={["Harga biasa:", "RM2,500 – RM2,999"]} top={TOP} left={90} />)),
  // jackpot price — STRESS
  fixed(gfx(19.8, 23.0, 0, (d) => <StressHit dur={d} kind="jackpot" lines={["Lagenda 115ZR", "RM1,950 sahaja"]} top={1040} left={90} />)),
  fixed(gfx(26.8, 30.4, 0, (d) => <QuoteLabel dur={d} lines={["Keadaan terbaik ✨"]} top={TOP} left={90} />)),
  fixed(gfx(31.74, 35.4, 0, (d) => <QuoteLabel dur={d} lines={["Test dulu,", "puas hati baru angkat"]} top={TOP} left={90} />)),
];

const SFX: Sfx[] = [s(19.9, "cash", 0.45)];

export const lagenda1950: Project = {
  id: "Lagenda1950",
  media: { video: "v16/source.mp4", voice: "v16/voice.m4a", music: "music/funky_chunk.mp3" },
  tl,
  face: base.face,
  captions: base.captions,
  speech: base.speech,
  graphics: GRAPHICS,
  sfx: SFX,
  flashCuts: [],
  captionMode: "none",
  plain: true,
  punches: [F(19.9)],
  musicLevels: { underVoice: 0.07, open: 0.2 },
  outro: true,
};
