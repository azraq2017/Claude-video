import React from "react";
import { PricePop, QuoteLabel } from "../../components/Minimal";
import { createBase, Gfx, Project } from "../../project";
import edl from "./edl.json";
import words from "./words.json";
import faces from "./faces.json";

/**
 * Video 25 — 19 Motor Trading event: row of budget bikes with a spoken price each (voice-over).
 * Source was rotated HEVC → transcoded upright. MINIMAL STYLE + clean subtitles (user request),
 * 19MTR outro. A price pop per bike (held until the next price), calm location labels.
 * No jackpot/trade-in/promo wording → no stress hits.
 */
const base = createBase({ clips: edl, faces: faces as number[][], words, keywords: [] });
const { gfx, tl } = base;

const fixed = (g: Gfx): Gfx => ({ ...g, place: "fixed" });
const TOP = 930; // above the subtitle band
const L = (from: number, to: number, lines: string[], highlight?: number, badge = true) =>
  fixed(gfx(from, to, 0, (d) => <QuoteLabel dur={d} lines={lines} highlight={highlight} top={TOP} left={90} badge={badge} />));
const P = (from: number, to: number, price: string, model?: string) =>
  fixed(gfx(from, to, 0, (d) => <PricePop dur={d} price={price} model={model} left={90} top={960} fontSize={150} />));

const GRAPHICS: Gfx[] = [
  L(0.0, 3.5, ["Motor bajet", "Dari RM1,500"], 1),
  P(3.6, 6.6, "RM2,150"),
  P(10.7, 14.4, "RM1,500"),
  P(15.86, 18.3, "RM1,700"),
  P(19.26, 21.5, "RM1,500"),
  P(22.14, 24.1, "RM2,100"),
  P(24.82, 27.9, "RM1,900"),
  P(31.08, 32.6, "RM1,950"),
  P(33.66, 37.7, "RM1,500"),
  L(38.54, 41.1, ["Sebaris motor", "harga bajet"], 1),
  L(41.86, 46.4, ["LC & Lagenda", "pun ada ✅"]),
  L(49.6, 56.1, ["📍 Wisma Mazra", "Sungai Petani", "Hari ni sampai esok"], 2),
  L(57.7, 62.5, ["Petron Taman Keladi", "Depan Super Ceramic"]),
  L(66.7, 70.8, ["Cari banner ni", "Wisma Mazra 📍"], 1, false),
];

export const motorBajet: Project = {
  id: "MotorBajet",
  media: { video: "v25/source.mp4", voice: "v25/voice.m4a", music: "music/funky_chunk.mp3" },
  tl,
  face: base.face,
  captions: base.captions,
  speech: base.speech,
  graphics: GRAPHICS,
  sfx: [],
  flashCuts: [],
  captionMode: "auto",
  captionStyle: "clean",
  plain: true,
  musicLevels: { underVoice: 0.07, open: 0.2 },
  outro: true,
};
