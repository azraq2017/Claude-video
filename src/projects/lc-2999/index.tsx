import React from "react";
import { PricePop, QuoteLabel, StressHit } from "../../components/Minimal";
import { createBase, Gfx, Project, Sfx } from "../../project";
import edl from "./edl.json";
import words from "./words.json";
import faces from "./faces.json";

/**
 * Video 14 — 19 Motor Trading: Yamaha LC135 (KDM 7756) walk-around, voice-over.
 * Source was rotated HEVC → transcoded upright. MINIMAL STYLE, no subtitles, 19MTR outro.
 * One stress hit: jackpot price RM2,999 (normally RM3,500).
 */
const base = createBase({ clips: edl, faces: faces as number[][], words, keywords: [] });
const { F, gfx, s, tl } = base;

const HOOK_END = tl.placed[0].from + tl.placed[0].frames;
const fixed = (g: Gfx): Gfx => ({ ...g, place: "fixed" });

const GRAPHICS: Gfx[] = [
  // Hook: model + price up front
  fixed({ from: 0, dur: HOOK_END, height: 0, render: (d) => (
    <QuoteLabel dur={d} lines={["Yamaha LC135", "RM2,999 sahaja"]} highlight={1} top={1060} left={90} />
  ) }),
  fixed(gfx(1.5, 5.4, 0, (d) => <QuoteLabel dur={d} lines={["Yamaha LC135", "Harga marhaen"]} top={1060} left={90} />)),
  fixed(gfx(7.6, 9.9, 0, (d) => <PricePop dur={d} price="RM3,500" model="Harga biasa" left={90} top={1080} fontSize={150} />)),
  // jackpot price — STRESS
  fixed(gfx(12.45, 15.6, 0, (d) => <StressHit dur={d} kind="jackpot" lines={["LC135 kali ni", "RM2,999 sahaja"]} top={1040} left={90} />)),
  fixed(gfx(24.6, 27.0, 0, (d) => <QuoteLabel dur={d} lines={["Kondisi cun terbaik ✨"]} top={1060} left={90} />)),
];

const SFX: Sfx[] = [s(12.5, "cash", 0.45)];

export const lc2999: Project = {
  id: "Lc2999",
  media: { video: "v14/source.mp4", voice: "v14/voice.m4a", music: "music/funky_chunk.mp3" },
  tl,
  face: base.face,
  captions: base.captions,
  speech: base.speech,
  graphics: GRAPHICS,
  sfx: SFX,
  flashCuts: [],
  captionMode: "none",
  plain: true,
  punches: [F(12.5)],
  musicLevels: { underVoice: 0.07, open: 0.2 },
  outro: true,
};
