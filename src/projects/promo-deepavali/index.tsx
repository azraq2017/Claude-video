import React from "react";
import { PricePop, QuoteLabel, StressHit } from "../../components/Minimal";
import { createBase, Gfx, Project, Sfx } from "../../project";
import edl from "./edl.json";
import words from "./words.json";
import faces from "./faces.json";

/**
 * Video 9 — "Promo Deepavali" showroom walkthrough. MINIMAL STYLE (docs/STYLE_MINIMAL.md):
 * no subtitles; calm quote label up front; every key price pops on the bike;
 * stress hits ONLY on the two Deepavali promos and the trade-in line.
 */
const base = createBase({ clips: edl, faces: faces as number[][], words, keywords: [] });
const { F, gfx, s, tl, face } = base;

const HOOK_END = tl.placed[1].from + tl.placed[1].frames;

/** Top position (px) just under the speaker's face at source time t, kept inside the safe zone. */
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
  // Hook: calm label, model + promo price up front
  fixed({ from: 0, dur: HOOK_END, height: 0, render: (d) => (
    <QuoteLabel dur={d} lines={["Promo Deepavali", "Lagenda RM2,999"]} highlight={1} top={under(44.9, 260)} />
  ) }),

  // Lagenda promo — STRESS
  fixed(gfx(36.6, 40.3, 0, (d) => <StressHit dur={d} kind="promo" lines={["Lagenda · Deepavali", "RM2,999"]} top={under(36.6, 280)} />)),
  fixed(gfx(45.8, 52.9, 0, (d) => <PricePop dur={d} price="RM3,500" model="Harga asal" left={120} top={under(45.8)} fontSize={150} />)),
  fixed(gfx(53.8, 56.2, 0, (d) => <PricePop dur={d} price="RM2,999" model="Lagenda · promo" left={120} top={under(53.8)} fontSize={150} />)),

  // Budget bikes
  fixed(gfx(71.9, 73.1, 0, (d) => <PricePop dur={d} price="RM2,000" model="Motor bajet · bawah" left={120} top={under(71.9)} fontSize={150} />)),
  // RM1,650 Deepavali promo — STRESS
  fixed(gfx(73.12, 76.35, 0, (d) => <StressHit dur={d} kind="promo" lines={["Promo Deepavali", "RM1,650"]} top={under(73.1, 280)} />)),
  fixed(gfx(77.55, 79.75, 0, (d) => <PricePop dur={d} price="RM1,999" left={120} top={under(77.6)} fontSize={150} />)),
  fixed(gfx(81.6, 83.6, 0, (d) => <PricePop dur={d} price="RM2,500" model="Motor bajet" left={120} top={under(81.6)} fontSize={150} />)),

  // Trade-in — STRESS
  fixed(gfx(128.1, 131.0, 0, (d) => <StressHit dur={d} kind="trade-in" lines={["Motor rosak pun", "kami terima"]} top={under(128.1, 280)} />)),
];

// Sound only on the three stress hits.
const SFX: Sfx[] = [s(36.62, "cash", 0.45), s(73.14, "cash", 0.45), s(128.12, "impact", 0.4)];

export const promoDeepavali: Project = {
  id: "PromoDeepavali",
  media: { video: "v9/source.mp4", voice: "v9/voice.m4a", music: "music/funky_chunk.mp3" },
  tl,
  face,
  captions: base.captions,
  speech: base.speech,
  graphics: GRAPHICS,
  sfx: SFX,
  flashCuts: [],
  captionMode: "none",
  plain: true,
  punches: [F(36.62), F(73.14), F(128.12)],
  musicLevels: { underVoice: 0.07, open: 0.2 },
};
