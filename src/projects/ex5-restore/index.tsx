import React from "react";
import { QuoteLabel } from "../../components/Minimal";
import { createBase, Gfx, Project, Sfx } from "../../project";
import edl from "./edl.json";
import words from "./words.json";
import faces from "./faces.json";

/**
 * Video 19 — 19 Motor Trading: Honda EX5 / Dream "full restore" stock walk-around (voice-over).
 * Source was rotated HEVC → transcoded upright. User asked for subtitles → clean subtitles.
 * No prices / trade-in / promo spoken → calm model labels only, no stress hits.
 * Silent walk-around shots kept (≤3s each) with the music brought up, like LcV4.
 */
const base = createBase({ clips: edl, faces: faces as number[][], words, keywords: [] });
const { gfx, tl } = base;

const fixed = (g: Gfx): Gfx => ({ ...g, place: "fixed" });
const TOP = 930; // above the subtitle band
const L = (from: number, to: number, lines: string[], highlight?: number) =>
  fixed(gfx(from, to, 0, (d) => <QuoteLabel dur={d} lines={lines} highlight={highlight} top={TOP} left={90} />));

const GRAPHICS: Gfx[] = [
  L(1.22, 5.2, ["Honda EX5 · Full restore", "Banyak stok!"], 1),
  L(6.7, 9.5, ["Hitam & merah"]),
  L(20.6, 24.0, ["Yang ni: SYM E-Smart"]),
  L(24.56, 26.3, ["Yang lain semua EX5"]),
  L(40.3, 42.6, ["Meter baru ✅"]),
  L(45.46, 47.2, ["Cover set baru ✅"]),
  L(52.86, 55.0, ["EX5 Dream"]),
  L(57.0, 60.0, ["EX5 Hi Power"]),
  L(62.92, 64.5, ["EX5 Dream"]),
  L(68.12, 70.5, ["EX5 Kambing"]),
  L(73.18, 74.2, ["EX5 Dream"]),
  L(75.54, 77.1, ["SYM E-Smart"]),
  L(80.9, 83.5, ["Semua dah restore", "Cantik-cantik"], 1),
  L(85.62, 89.0, ["WhatsApp / PM admin"]),
  L(93.3, 95.0, ["📍 Sungai Petani"]),
  L(100.7, 104.2, ["Jauh? Boleh postage 📦"]),
];

const SFX: Sfx[] = [];

// music up over every silent stretch ≥ 1.5s (gaps between subtitle pages)
const silences: { from: number; to: number; level: number }[] = [];
const sp = [...base.speech].sort((a, b) => a[0] - b[0]);
for (let i = 0; i <= sp.length; i++) {
  const a = i === 0 ? 0 : sp[i - 1][1];
  const b = i === sp.length ? tl.total : sp[i][0];
  if (b - a >= 45) silences.push({ from: a + 6, to: b - 6, level: 0.8 });
}

export const ex5Restore: Project = {
  id: "Ex5Restore",
  media: { video: "v19/source.mp4", voice: "v19/voice.m4a", music: "music/funky_chunk.mp3" },
  tl,
  face: base.face,
  captions: base.captions,
  speech: base.speech,
  graphics: GRAPHICS,
  sfx: SFX,
  flashCuts: [],
  captionMode: "auto",
  captionStyle: "clean",
  plain: true,
  musicLevels: { underVoice: 0.07, open: 0.2 },
  musicBoost: silences,
  outro: true,
};
