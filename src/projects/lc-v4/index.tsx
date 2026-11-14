import React from "react";
import { PricePop, QuoteLabel, StressHit } from "../../components/Minimal";
import { createBase, Gfx, Project, Sfx } from "../../project";
import edl from "./edl.json";
import words from "./words.json";
import faces from "./faces.json";

/**
 * Video 17 — 19 Motor Trading: Yamaha LC V4 ×2 (black PNK 4486 RM3,999; blue PNK 4483 RM4,500).
 * Voice-over walk-around; source was rotated HEVC → transcoded upright.
 * MINIMAL STYLE, no subtitles, 19MTR outro. The opening line is already the hook
 * ("LC V4 harga jackpot, ada 2 biji") so the edit keeps the natural order.
 * One stress hit: jackpot.
 */
const base = createBase({ clips: edl, faces: faces as number[][], words, keywords: [] });
const { F, gfx, s, tl } = base;

const fixed = (g: Gfx): Gfx => ({ ...g, place: "fixed" });
const TOP = 1060;

const GRAPHICS: Gfx[] = [
  // model + price up front
  fixed(gfx(0.0, 1.72, 0, (d) => <QuoteLabel dur={d} lines={["Yamaha LC V4", "Dari RM3,999"]} highlight={1} top={TOP} left={90} />)),
  // jackpot — STRESS
  fixed(gfx(1.72, 4.6, 0, (d) => <StressHit dur={d} kind="jackpot" lines={["LC V4 · 2 biji je", "Biru & hitam"]} top={1040} left={90} />)),
  fixed(gfx(11.0, 14.4, 0, (d) => <PricePop dur={d} price="RM3,999" model="LC V4 · Hitam (PNK 4486)" left={90} top={1080} fontSize={150} />)),
  fixed(gfx(25.6, 29.3, 0, (d) => <PricePop dur={d} price="RM4,500" model="LC V4 · Biru (PNK 4483)" left={90} top={1080} fontSize={150} />)),
  fixed(gfx(43.7, 48.0, 0, (d) => <QuoteLabel dur={d} lines={["Call / WhatsApp admin", "Siapa cepat dia dapat"]} top={TOP} left={90} />)),
];

const SFX: Sfx[] = [s(1.75, "cash", 0.45)];

export const lcV4: Project = {
  id: "LcV4",
  media: { video: "v17/source.mp4", voice: "v17/voice.m4a", music: "music/funky_chunk.mp3" },
  tl,
  face: base.face,
  captions: base.captions,
  speech: base.speech,
  graphics: GRAPHICS,
  sfx: SFX,
  flashCuts: [],
  captionMode: "none",
  plain: true,
  punches: [F(1.75)],
  musicLevels: { underVoice: 0.07, open: 0.2 },
  outro: true,
};
