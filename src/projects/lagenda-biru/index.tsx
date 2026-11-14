import React from "react";
import { PricePop, QuoteLabel, StressHit } from "../../components/Minimal";
import { createBase, Gfx, Project, Sfx } from "../../project";
import edl from "./edl.json";
import words from "./words.json";
import faces from "./faces.json";

/**
 * Video 18 — 19 Motor Trading: Yamaha Lagenda 115ZR biru (PQM 7464), voice-over walk-around.
 * Source was rotated HEVC → transcoded upright.
 * USER ASKED FOR: special effects + subtitles. So: minimal look, clean subtitles, but more
 * effects than usual — jackpot stress + flash on the hook, price/mileage pops with sounds,
 * flash cut out of the hook, music up over the silent walk-around, 19MTR outro.
 */
const base = createBase({ clips: edl, faces: faces as number[][], words, keywords: [] });
const { F, gfx, s, tl } = base;

const HOOK_END = tl.placed[0].from + tl.placed[0].frames;
const fixed = (g: Gfx): Gfx => ({ ...g, place: "fixed" });
const TOP = 930; // above the subtitle band

const GRAPHICS: Gfx[] = [
  // Hook — jackpot STRESS + big price
  fixed({ from: 0, dur: HOOK_END, height: 0, render: (d) => <StressHit dur={d} kind="jackpot" lines={[]} top={890} left={90} /> }),
  fixed({ from: 25, dur: HOOK_END - 25, height: 0, render: (d) => <PricePop dur={d} price="RM2,999" left={90} top={980} fontSize={170} /> }),

  fixed(gfx(2.06, 7.3, 0, (d) => <QuoteLabel dur={d} lines={["Yamaha Lagenda 115ZR", "Biru · PQM 7464"]} top={TOP} left={90} />)),
  fixed(gfx(8.3, 10.2, 0, (d) => <QuoteLabel dur={d} lines={["Dah restore", "Condition tune ✨"]} highlight={1} top={TOP} left={90} />)),
  fixed(gfx(13.14, 15.75, 0, (d) => <QuoteLabel dur={d} lines={["Body semua ori ✅"]} top={TOP} left={90} />)),
  fixed(gfx(19.94, 21.65, 0, (d) => <PricePop dur={d} price="RM2,999" model="Harga kita" left={90} top={940} fontSize={150} />)),
  fixed(gfx(21.66, 24.6, 0, (d) => <QuoteLabel dur={d} lines={["Biasa: RM3,500"]} top={TOP} left={90} />)),
  fixed(gfx(30.9, 33.3, 0, (d) => <PricePop dur={d} price="8,189 km" model="Mileage" left={90} top={940} fontSize={150} />)),
  fixed(gfx(38.2, 41.7, 0, (d) => <QuoteLabel dur={d} lines={["DM kita", "Siapa cepat dia dapat!"]} highlight={1} top={TOP} left={90} badge={false} />)),
];

const SFX: Sfx[] = [
  { frame: 0, name: "impact", vol: 0.45 },
  { frame: 27, name: "cash", vol: 0.5 },
  { frame: HOOK_END - 4, name: "whoosh", vol: 0.4 },
  s(2.1, "pop", 0.35),
  s(9.9, "sparkle", 0.3),
  s(13.2, "ding", 0.3),
  s(20.0, "cash", 0.4),
  s(31.0, "pop", 0.4),
  s(33.3, "whoosh", 0.25),
  s(39.0, "notif", 0.45),
];

export const lagendaBiru: Project = {
  id: "LagendaBiru",
  media: { video: "v18/source.mp4", voice: "v18/voice.m4a", music: "music/funky_chunk.mp3" },
  tl,
  face: base.face,
  captions: base.captions,
  speech: base.speech,
  graphics: GRAPHICS,
  sfx: SFX,
  flashCuts: [HOOK_END],
  // user asked for subtitles → clean minimal subtitles
  captionMode: "auto",
  captionStyle: "clean",
  plain: true,
  punches: [2, F(20.0)],
  musicLevels: { underVoice: 0.07, open: 0.2 },
  musicBoost: tl.placed.filter((c) => c.mute).map((c) => ({ from: c.from, to: c.from + c.frames, level: 0.8 })),
  outro: true,
};
