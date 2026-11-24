import React from "react";
import { QuoteLabel, StressHit } from "../../components/Minimal";
import { createBase, Gfx, Project, Sfx } from "../../project";
import edl from "./edl.json";
import words from "./words.json";
import faces from "./faces.json";

/**
 * Event lelong motosikal terpakai (19 Motor Trading, 26–29 Nov) — three walkthrough clips
 * ("promo event 1–3", rotated HEVC → upright, concatenated into public/event2/source.mp4;
 * clip 2 starts at 45.162s, clip 3 at 88.745s). User asked: one video of exactly 1:31,
 * minimal style, subtitles, focus on the event. Only event/stock lines kept.
 * Stress hits only on the two "harga special" (promo) lines.
 */
const base = createBase({ clips: edl, faces: faces as number[][], words, keywords: [] });
const { F, gfx, s, tl } = base;

const C2 = 45.162, C3 = 45.162 + 43.583;
const fixed = (g: Gfx): Gfx => ({ ...g, place: "fixed" });
const TOP = 930; // above the subtitle band
const L = (from: number, to: number, lines: string[], highlight?: number, badge = true) =>
  fixed(gfx(from, to, 0, (d) => <QuoteLabel dur={d} lines={lines} highlight={highlight} top={TOP} left={90} badge={badge} />));

const GRAPHICS: Gfx[] = [
  // Event up front
  L(0.0, 6.19, ["Event Lelong", "Motosikal Terpakai", "26 – 29 November"], 2),
  L(10.5, 18.0, ["Banyak Honda EX5", "Harga murah-murah"], 1),
  L(24.2, 26.5, ["📅 Reserve tarikh", "26 – 29 Nov"], 1),
  L(28.2, 35.21, ["📍 19 Motor Trading", "Sungai Petani"], 1),
  // promo — STRESS
  fixed(gfx(C2 + 4.3, C2 + 12.0, 0, (d) => <StressHit dur={d} kind="promo" lines={["LC135 masa event", "Harga special!"]} top={890} left={90} />)),
  L(C2 + 21.9, C2 + 23.51, ["Vario pun banyak"]),
  L(C2 + 31.5, C2 + 35.01, ["Motor bajet pun ada ✅"]),
  L(C3 + 0.9, C3 + 11.07, ["NMAX · PCX", "MT-15 · NVX 155"]),
  L(C3 + 12.2, C3 + 26.6, ["Skuter model lama", "Ego S · Ego Gear · Beat", "Avantiz · Solariz"], 0),
  // promo — STRESS
  fixed(gfx(C3 + 27.58, C3 + 34.09, 0, (d) => <StressHit dur={d} kind="promo" lines={["Datang event 26–29 Nov", "Dapat harga special!"]} top={890} left={90} />)),
  L(C3 + 35.7, C3 + 44.9, ["Wave 100 · Wave DX", "RS150 · Lagenda"]),
  L(C3 + 45.0, C3 + 50.36, ["Jangan lupa datang!", "26 – 29 Nov", "Sungai Petani"], 1, false),
];

// Sound only on the two promo stress hits.
const SFX: Sfx[] = [s(C2 + 4.35, "cash", 0.45), s(C3 + 27.6, "cash", 0.45)];

export const eventLelong: Project = {
  id: "EventLelong",
  media: { video: "event2/source.mp4", voice: "event2/voice.m4a", music: "music/funky_chunk.mp3" },
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
  punches: [F(C2 + 4.35), F(C3 + 27.6)],
  musicLevels: { underVoice: 0.07, open: 0.2 },
  outro: true,
};
