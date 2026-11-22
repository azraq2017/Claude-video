import React from "react";
import { QuoteLabel } from "../../components/Minimal";
import { createBase, Gfx, Project } from "../../project";
import edl from "./edl.json";
import words from "./words.json";
import faces from "./faces.json";

/**
 * Video 22 — 19 Motor Trading: Honda Vario 150 row in the showroom (voice-over).
 * Source was rotated HEVC → transcoded upright. MINIMAL STYLE, no subtitles (not requested),
 * 19MTR outro. No jackpot / trade-in / promo spoken → calm labels, no stress hits.
 * Price range comes from the tags visible in the shot (RM5,500 / RM5,999).
 */
const base = createBase({ clips: edl, faces: faces as number[][], words, keywords: [] });
const { gfx, tl } = base;

const fixed = (g: Gfx): Gfx => ({ ...g, place: "fixed" });
const TOP = 1060;
const L = (from: number, to: number, lines: string[], highlight?: number, badge = true) =>
  fixed(gfx(from, to, 0, (d) => <QuoteLabel dur={d} lines={lines} highlight={highlight} top={TOP} left={90} badge={badge} />));

const GRAPHICS: Gfx[] = [
  L(0.0, 4.3, ["Honda Vario 150", "RM5,500 – RM5,999"], 1),
  L(7.18, 11.6, ["📍 19 Motor Trading", "Sungai Petani"]),
  L(11.78, 14.3, ["Harga boleh adjust 🤝"]),
  L(19.32, 25.5, ["Bukan 160 / 125", "Ini Vario 150"], 1),
  L(28.52, 33.3, ["Kondisi tip-top", "Cover set · mileage", "Engine tune ✅"], 0),
  L(33.38, 36.4, ["Mai 19 Motor Trading", "Sungai Petani"], 0, false),
];

export const vario150: Project = {
  id: "Vario150",
  media: { video: "v22/source.mp4", voice: "v22/voice.m4a", music: "music/funky_chunk.mp3" },
  tl,
  face: base.face,
  captions: base.captions,
  speech: base.speech,
  graphics: GRAPHICS,
  sfx: [],
  flashCuts: [],
  captionMode: "none",
  plain: true,
  musicLevels: { underVoice: 0.07, open: 0.2 },
  outro: true,
};
