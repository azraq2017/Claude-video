import React from "react";
import { QuoteLabel, StressHit } from "../../components/Minimal";
import { createBase, Gfx, Project, Sfx } from "../../project";
import edl from "./edl.json";
import words from "./words.json";
import faces from "./faces.json";

/**
 * Video 12 — Tas Tech: "tolak phone" (sell / trade your old phone). MINIMAL STYLE,
 * no subtitles, Tas Tech outro. No prices are spoken, so no price pops.
 * Stress hits: the two trade-in lines only.
 */
const base = createBase({ clips: edl, faces: faces as number[][], words, keywords: [] });
const { F, gfx, s, tl, face } = base;

const HOOK_END = tl.placed[1].from + tl.placed[1].frames;

const under = (t: number, h = 260) => {
  let bottom = 0;
  for (let k = t - 0.5; k <= t + 2.5; k += 0.2) {
    const b = face.faceAt(k);
    bottom = Math.max(bottom, (b.y + b.h + 0.04) * 1920);
  }
  return Math.round(Math.min(1440 - h, Math.max(900, bottom + 30)));
};
const fixed = (g: Gfx): Gfx => ({ ...g, place: "fixed" });

const GRAPHICS: Gfx[] = [
  // Hook: model up front
  fixed({ from: 0, dur: HOOK_END, height: 0, render: (d) => (
    <QuoteLabel dur={d} lines={["Tolak phone kat Tas Tech", "iPhone 17 Pro Max pun terima"]} highlight={1} top={under(14.2)} />
  ) }),

  // trade-in — STRESS
  fixed(gfx(4.8, 7.8, 0, (d) => <StressHit dur={d} kind="trade-in" lines={["Phone lama?", "Tolak kat Tas Tech"]} top={under(4.8, 280)} />)),
  fixed(gfx(8.2, 9.86, 0, (d) => <QuoteLabel dur={d} lines={["Android & iPhone"]} top={under(8.2)} />)),
  fixed(gfx(44.5, 52.7, 0, (d) => <QuoteLabel dur={d} lines={["Musim sekolah bulan 12", "Tolak phone → dapat duit"]} highlight={1} top={under(44.5)} />)),
  fixed(gfx(61.4, 69.0, 0, (d) => <QuoteLabel dur={d} lines={["Ada dent / belakang teruk?", "Boleh, tak ada masalah"]} top={under(61.4)} />)),
  // broken / old models — STRESS (trade-in)
  fixed(gfx(82.6, 84.99, 0, (d) => <StressHit dur={d} kind="trade-in" lines={["Rosak / model lama?", "Boleh tolak juga"]} top={under(82.6, 280)} />)),
  fixed(gfx(88.6, 96.2, 0, (d) => <QuoteLabel dur={d} lines={["Rosak teruk / barai", "→ e-waste ♻️"]} top={under(88.6)} />)),
  fixed(gfx(98.4, 109.9, 0, (d) => <QuoteLabel dur={d} lines={["Phone · iPad · Tablet", "Elok = harga tinggi"]} highlight={1} top={under(98.4)} />)),
];

// Sound only on the stress hits.
const SFX: Sfx[] = [s(4.85, "impact", 0.4), s(82.65, "impact", 0.4)];

export const tolakPhone: Project = {
  id: "TolakPhone",
  media: { video: "v12/source.mp4", voice: "v12/voice.m4a", music: "music/funky_chunk.mp3" },
  tl,
  face,
  captions: base.captions,
  speech: base.speech,
  graphics: GRAPHICS,
  sfx: SFX,
  flashCuts: [],
  captionMode: "none",
  plain: true,
  punches: [F(4.85), F(82.65)],
  musicLevels: { underVoice: 0.07, open: 0.2 },
  outro: true,
  outroBrand: "tastech",
};
