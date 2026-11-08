import React from "react";
import { PricePop, QuoteLabel, StressHit } from "../../components/Minimal";
import { createBase, Gfx, Project, Sfx } from "../../project";
import edl from "./edl.json";
import words from "./words.json";
import faces from "./faces.json";

/**
 * Video 10 — "Bos kata RM1,800, aku offer RM1,650" (outdoor walkthrough, 19 Motor Trading).
 * MINIMAL STYLE. Source was graded before editing (shadow lift + extra lift on the
 * backlit opening, +10% saturation) — see scripts/setup.sh, v10.
 * Stress hits: jackpot offer (RM1,650 vs RM1,800), Honda Future promo, trade-in of a broken bike.
 */
const base = createBase({ clips: edl, faces: faces as number[][], words, keywords: [] });
const { F, gfx, s, tl, face } = base;

const HOOK_END = tl.placed[1].from + tl.placed[1].frames;

/** Top (px) just under the speaker's face around source time t, inside the safe zone. */
const under = (t: number, h = 230) => {
  let bottom = 0;
  for (let k = t - 0.5; k <= t + 2.5; k += 0.2) {
    const b = face.faceAt(k);
    bottom = Math.max(bottom, (b.y + b.h + 0.04) * 1920);
  }
  return Math.round(Math.min(1440 - h, Math.max(900, bottom + 30)));
};
const fixed = (g: Gfx): Gfx => ({ ...g, place: "fixed" });

const GRAPHICS: Gfx[] = [
  // Hook: model + price up front
  fixed({ from: 0, dur: HOOK_END, height: 0, render: (d) => (
    <QuoteLabel dur={d} lines={["Motor bajet bawah RM2K", "Kriss MR1 · RM1,650"]} highlight={1} top={under(28.3, 260)} />
  ) }),

  fixed(gfx(12.2, 14.4, 0, (d) => <PricePop dur={d} price="RM1,650" model="Kriss MR1" left={120} top={under(12.2)} fontSize={150} />)),
  // jackpot offer — STRESS
  fixed(gfx(32.5, 35.2, 0, (d) => <StressHit dur={d} kind="jackpot" lines={["Bos kata RM1,800", "Offer RM1,650"]} top={under(32.5, 280)} />)),

  fixed(gfx(74.4, 78.3, 0, (d) => <PricePop dur={d} price="RM2,600" left={120} top={under(74.4)} fontSize={150} />)),
  // Honda Future promo — STRESS, then its price
  fixed(gfx(85.8, 88.4, 0, (d) => <StressHit dur={d} kind="promo" lines={["Honda Future", "Unit promo"]} top={under(85.8, 280)} />)),
  fixed(gfx(90.7, 93.0, 0, (d) => <PricePop dur={d} price="RM2,500" model="Honda Future · PMF 2443" left={120} top={under(90.7)} fontSize={150} />)),
  // broken bike accepted — STRESS (trade-in)
  fixed(gfx(103.8, 106.9, 0, (d) => <StressHit dur={d} kind="trade-in" lines={["Motor rosak?", "Kami terima"]} top={under(103.8, 280)} />)),

  fixed(gfx(121.3, 123.6, 0, (d) => <PricePop dur={d} price="RM2,500" model="Motor bajet" left={120} top={under(121.3)} fontSize={150} />)),
  fixed(gfx(129.1, 134.1, 0, (d) => <PricePop dur={d} price="RM2,500" model="SYM E-Smart · ala-ala EX5" left={120} top={under(129.1)} fontSize={150} />)),
  // urgency at the end (calm)
  fixed(gfx(159.4, 164.9, 0, (d) => <QuoteLabel dur={d} lines={["Kriss MR1 RM1,650", "Seunit je — cepat!"]} highlight={0} top={under(159.4, 260)} />)),
];

// Sound only on the three stress hits.
const SFX: Sfx[] = [s(32.6, "cash", 0.45), s(85.86, "cash", 0.4), s(103.9, "impact", 0.4)];

export const offerBos: Project = {
  id: "OfferBos",
  media: { video: "v10/source.mp4", voice: "v10/voice.m4a", music: "music/funky_chunk.mp3" },
  tl,
  face,
  captions: base.captions,
  speech: base.speech,
  graphics: GRAPHICS,
  sfx: SFX,
  flashCuts: [],
  captionMode: "none",
  plain: true,
  punches: [F(32.6), F(85.86), F(103.9)],
  musicLevels: { underVoice: 0.07, open: 0.2 },
  outro: true,
};
