import React from "react";
import { PricePop, QuoteLabel } from "../../components/Minimal";
import { createBase, Gfx, Project, Sfx } from "../../project";
import edl from "./edl.json";
import words from "./words.json";
import faces from "./faces.json";

/**
 * Video 21 — 19 Motor Trading: Yamaha XMAX V1 (SYJ 9844), voice-over walk-around.
 * Source was rotated HEVC → transcoded upright. MINIMAL STYLE + clean subtitles (user request),
 * 19MTR outro. No jackpot / trade-in / promo spoken → no stress hits; price pop only.
 * The opening line already carries model + price, so the natural order is kept.
 */
const base = createBase({ clips: edl, faces: faces as number[][], words, keywords: [] });
const { gfx, tl } = base;

const fixed = (g: Gfx): Gfx => ({ ...g, place: "fixed" });
const TOP = 930; // above the subtitle band
const L = (from: number, to: number, lines: string[], highlight?: number, badge = true) =>
  fixed(gfx(from, to, 0, (d) => <QuoteLabel dur={d} lines={lines} highlight={highlight} top={TOP} left={90} badge={badge} />));

const GRAPHICS: Gfx[] = [
  L(0.0, 2.9, ["Yamaha XMAX V1", "Untuk dilepaskan"], 0),
  fixed(gfx(5.3, 9.6, 0, (d) => <PricePop dur={d} price="RM19,000+" model="Yamaha XMAX V1" left={90} top={940} fontSize={150} />)),
  L(17.14, 22.6, ["XMAX V1 · SYJ 9844"]),
  L(29.2, 30.4, ["Bawa sedap"]),
  L(37.74, 40.5, ["Roger admin"], 0, false),
  L(40.88, 42.5, ["Boleh test dulu ✅"]),
  L(46.04, 53.7, ["Meter analog", "(V2 & V3 dah digital)"]),
  L(54.22, 58.9, ["Kondisi tip-top", "Jalan jauh memang mantul"], 1),
];

const SFX: Sfx[] = [];

// music up over silent walk-around stretches ≥ 1.5s
const silences: { from: number; to: number; level: number }[] = [];
const sp = [...base.speech].sort((a, b) => a[0] - b[0]);
for (let i = 0; i <= sp.length; i++) {
  const a = i === 0 ? 0 : sp[i - 1][1];
  const b = i === sp.length ? tl.total : sp[i][0];
  if (b - a >= 45) silences.push({ from: a + 6, to: b - 6, level: 0.8 });
}

export const xmaxV1: Project = {
  id: "XmaxV1",
  media: { video: "v21/source.mp4", voice: "v21/voice.m4a", music: "music/funky_chunk.mp3" },
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
