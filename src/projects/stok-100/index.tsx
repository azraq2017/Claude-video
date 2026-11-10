import React from "react";
import { QuoteLabel } from "../../components/Minimal";
import { createBase, Gfx, Project } from "../../project";
import edl from "./edl.json";
import words from "./words.json";
import faces from "./faces.json";

/**
 * Video 13 — 19 Motor Trading stock walkthrough (WITH clean subtitles — user request) (voice-over, no face; source was
 * rotated HEVC → transcoded upright). MINIMAL STYLE, no subtitles, 19MTR outro.
 * No prices, trade-in or promo are spoken → no price pops, no stress hits, no SFX.
 * Only calm quote labels naming what's on screen (models Whisper heard clearly).
 */
const base = createBase({ clips: edl, faces: faces as number[][], words, keywords: [] });
const { gfx, tl } = base;

const HOOK_END = tl.placed[0].from + tl.placed[0].frames;
const TOP = 960; // above the subtitle band (user asked for subtitles on this video)
const fixed = (g: Gfx): Gfx => ({ ...g, place: "fixed" });

const GRAPHICS: Gfx[] = [
  // Hook
  fixed({ from: 0, dur: HOOK_END, height: 0, render: (d) => (
    <QuoteLabel dur={d} lines={["19 Motor Trading", "±100 biji motor dalam stok"]} highlight={1} top={TOP} left={90} />
  ) }),
  fixed(gfx(6.9, 12.0, 0, (d) => <QuoteLabel dur={d} lines={["Depan kedai:", "Sport Rider · NVX · Y15 · EX5 · MT-15"]} top={TOP} left={90} />)),
  fixed(gfx(19.8, 27.4, 0, (d) => <QuoteLabel dur={d} lines={["Atas: banyak EX5", "Wave S · MR3 · Wave 125 · Y15"]} top={TOP} left={90} />)),
  fixed(gfx(42.6, 45.2, 0, (d) => <QuoteLabel dur={d} lines={["Total stok ±100 biji"]} highlight={0} top={TOP} left={90} />)),
  fixed(gfx(56.7, 62.4, 0, (d) => <QuoteLabel dur={d} lines={["LC banyak", "Lagenda 3 biji"]} top={TOP} left={90} />)),
  fixed(gfx(67.9, 74.9, 0, (d) => <QuoteLabel dur={d} lines={["NMAX · PCX · LC · EX5"]} top={TOP} left={90} />)),
  fixed(gfx(78.5, 87.4, 0, (d) => <QuoteLabel dur={d} lines={["Honda Dash · Wave S · XMAX", "Solariz · Ego S · Avantiz"]} top={TOP} left={90} />)),
];

export const stok100: Project = {
  id: "Stok100",
  media: { video: "v13/source.mp4", voice: "v13/voice.m4a", music: "music/funky_chunk.mp3" },
  tl,
  face: base.face,
  captions: base.captions,
  speech: base.speech,
  graphics: GRAPHICS,
  sfx: [],
  flashCuts: [],
  // user explicitly asked for subtitles on this video → clean minimal subtitles
  captionMode: "auto",
  captionStyle: "clean",
  plain: true,
  musicLevels: { underVoice: 0.07, open: 0.2 },
  outro: true,
};
