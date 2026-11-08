import React from "react";
import { QuoteLabel, StressHit } from "../../components/Minimal";
import { createBase, Gfx, Project, Sfx } from "../../project";
import words from "../showroom/words.json";
import faces from "../showroom/faces.json";

/**
 * Style demo for the MINIMAL preset, cut from the Showroom footage:
 *  1. calm quote label with model + price up front
 *  2. stress hit on TRADE-IN
 *  3. stress hit on JACKPOT price
 */
const base = createBase({
  clips: [
    { start: 3.95, end: 7.4 },
    { start: 10.02, end: 12.5 },
    { start: 12.98, end: 13.68 },
    { start: 21.04, end: 26.16 },
    { start: 38.2, end: 39.38 },
    { start: 39.74, end: 42.28 },
  ],
  faces: faces as number[][],
  words,
  keywords: [],
});
const { F, gfx, s, tl } = base;

const GRAPHICS: Gfx[] = [
  { ...gfx(3.95, 13.68, 0, (d) => <QuoteLabel dur={d} lines={["Yamaha Y15ZR", "Bawah RM7,000"]} highlight={1} />), place: "fixed" },
  { ...gfx(21.88, 26.16, 0, (d) => <StressHit dur={d} kind="trade-in" lines={["Motor lama / rosak", "Masih bawah RM7K"]} />), place: "fixed" },
  { ...gfx(39.74, 42.28, 0, (d) => <StressHit dur={d} kind="jackpot" lines={["Y15ZR", "RM6,500"]} />), place: "fixed" },
];

const SFX: Sfx[] = [s(21.88, "impact", 0.4), s(39.8, "cash", 0.45)];

export const minimalDemo: Project = {
  id: "MinimalDemo",
  media: { video: "v3/source.mp4", voice: "v3/voice.m4a", music: "music/funky_chunk.mp3" },
  tl,
  face: base.face,
  captions: base.captions,
  speech: base.speech,
  graphics: GRAPHICS,
  sfx: SFX,
  flashCuts: [],
  captionMode: "none",
  plain: true,
  punches: [F(21.88), F(39.74)],
  musicLevels: { underVoice: 0.07, open: 0.2 },
};
