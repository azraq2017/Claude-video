import React from "react";
import { QuoteLabel, StressHit } from "../../components/Minimal";
import { createBase, Gfx, Project, Sfx } from "../../project";
import edl from "./edl.json";
import words from "./words.json";
import faces from "./faces.json";

/**
 * Video 11 — Tas Tech: "phone jackpot RM399" + how to avoid scams (shop is real,
 * pay only to the company account). MINIMAL STYLE, no subtitles.
 * Tas Tech brand → ends with the Tas Tech outro (not the 19 Motor Trading one).
 * One stress hit: the jackpot price. Everything else is calm quote labels.
 */
const base = createBase({ clips: edl, faces: faces as number[][], words, keywords: [] });
const { F, gfx, s, tl, face } = base;

const HOOK_END = tl.placed[1].from + tl.placed[1].frames;

/** Top (px) just under the speaker's face around source time t, inside the safe zone. */
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
  // Hook: who we are, up front
  fixed({ from: 0, dur: HOOK_END, height: 0, render: (d) => (
    <QuoteLabel dur={d} lines={["Tas Tech · kedai betul", "Bukan muka AI 😄"]} top={under(64.6)} />
  ) }),

  // jackpot price — STRESS
  fixed(gfx(4.4, 7.4, 0, (d) => <StressHit dur={d} kind="jackpot" lines={["Phone jackpot", "Serendah RM399"]} top={under(4.4, 280)} />)),

  fixed(gfx(23.9, 28.3, 0, (d) => <QuoteLabel dur={d} lines={["Boleh postage 📦", "setiap minggu"]} top={under(23.9)} />)),
  fixed(gfx(33.4, 38.9, 0, (d) => <QuoteLabel dur={d} lines={["COD: kawasan dekat", "Jauh: postage"]} top={under(33.4)} />)),
  fixed(gfx(54.1, 60.5, 0, (d) => <QuoteLabel dur={d} lines={["Check bio & content kami", "dari atas sampai bawah"]} top={under(54.1)} />)),
  fixed(gfx(79.9, 84.5, 0, (d) => <QuoteLabel dur={d} lines={["Transfer HANYA ke", "akaun company: Tas Tech"]} highlight={1} top={under(79.9)} />)),
  fixed(gfx(95.8, 101.9, 0, (d) => <QuoteLabel dur={d} lines={["Akaun personal?", "Hati-hati!"]} highlight={1} left={545} fontSize={42} top={under(95.8)} /* right side: keep the account card visible */ />)),
  fixed(gfx(123.6, 128.0, 0, (d) => <QuoteLabel dur={d} lines={["Tas Tech · ada kedai", "Bukan scammer"]} top={under(123.6)} />)),
];

// Sound only on the stress hit.
const SFX: Sfx[] = [s(4.45, "cash", 0.45)];

export const antiScam: Project = {
  id: "AntiScam",
  media: { video: "v11/source.mp4", voice: "v11/voice.m4a", music: "music/funky_chunk.mp3" },
  tl,
  face,
  captions: base.captions,
  speech: base.speech,
  graphics: GRAPHICS,
  sfx: SFX,
  flashCuts: [],
  captionMode: "none",
  plain: true,
  punches: [F(4.45)],
  musicLevels: { underVoice: 0.07, open: 0.2 },
  outro: true,
  outroBrand: "tastech",
};
