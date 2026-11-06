import React from "react";
import {
  ChipCloud,
  CtaDM,
  DropDropDrop,
  HookTitle,
  MinusRepair,
  PriceMeter,
  RevealRows,
  Stamp,
  Sticker,
  TipCard,
} from "../../components/Graphics";
import { C } from "../../fonts";
import { FPS } from "../../timeline";
import { createBase, Gfx, Project, Sfx } from "../../project";
import edl from "./edl.json";
import words from "./words.json";
import faces from "./faces.json";

/**
 * Video 1 — "Tolak motor". Everything below is authored in SOURCE seconds
 * (timestamps from the raw recording / transcript) and mapped onto the edited
 * timeline, so the edit list can change without re-timing every graphic.
 */
const base = createBase({
  clips: edl,
  faces: faces as number[][],
  words,
  keywords: [
    "maksimum", "harga", "rosak", "lc", "wave", "modenas", "sym", "city", "cap", "cai", "terima",
    "cun", "elok", "cantik", "repair", "kautim", "drop", "tips", "basuh", "gilap", "dm", "bio",
    "masalah", "problem", "buruk", "trade", "lokasi", "pembaikan", "dua",
  ],
});
const { F, gfx, s, tl } = base;

const HOOK = tl.placed[0];
const HOOK_END = HOOK.from + HOOK.frames;

/* ------------------------------ GRAPHICS ------------------------------ */

const GRAPHICS: Gfx[] = [
  // Cold-open hook
  { from: 0, dur: HOOK_END, height: 460, render: (d) => <HookTitle dur={d} /> },

  gfx(2.0, 4.9, 200, (d) => <Sticker dur={d} kicker="Pagi ni ☀️" title="2 motor masuk!" />),
  gfx(7.6, 11.5, 200, (d) => <Sticker dur={d} kicker="Customer #1" title="Yamaha LC" bg={C.white} tilt={2} />),
  gfx(14.03, 16.2, 200, (d) => <Sticker dur={d} kicker="Customer #2" title="Motor kedua" tilt={-3} />),
  gfx(17.25, 22.2, 230, (d, r) => (
    <RevealRows
      dur={d}
      rows={[
        { at: r(18.5), label: "Luaran", value: "Nampak OK", icon: "check" },
        { at: r(20.14), label: "Dalam", value: "Ada masalah", icon: "warn", accent: C.red },
      ]}
    />
  )),
  gfx(23.9, 26.95, 270, (d) => <Stamp dur={d} top="Motor rosak?" main="Kami terima" />),
  gfx(26.68, 38.35, 300, (d, r) => (
    <ChipCloud
      dur={d}
      title="Semua kami ambil"
      items={[
        { at: r(26.7), text: "Cap Cai" },
        { at: r(27.78), text: "Wave" },
        { at: r(29.06), text: "Motor lama" },
        { at: r(31.28), text: "City" },
        { at: r(32.56), text: "Modenas" },
        { at: r(35.2), text: "SYM" },
      ]}
    />
  )),
  gfx(39.1, 51.28, 300, (d, r) => <PriceMeter dur={d} fillAt={r(50.4)} label="Motor cun & elok" />),
  gfx(53.6, 60.5, 210, (d, r) => <MinusRepair dur={d} minusAt={r(58.6)} />),
  gfx(63.5, 66.55, 200, (d) => (
    <Sticker dur={d} kicker="Nak harga maksimum?" title="Pastikan nampak elok ✨" bg={C.green} color={C.white} />
  )),
  gfx(72.0, 82.5, 330, (d, r) => (
    <RevealRows
      dur={d}
      title="Contoh: motor ni"
      rows={[
        { at: r(73.0), label: "Luaran", value: "Cantik", icon: "check" },
        { at: r(78.5), label: "Dalam", value: "Kena repair", icon: "warn", accent: C.red },
        { at: r(81.9), label: "Tapi", value: "Tetap ambil", icon: "check", accent: C.green },
      ]}
    />
  )),
  gfx(84.75, 88.2, 120, (d) => <Sticker dur={d} title="Owner dah cuci 🧽" bg={C.white} tilt={2} />),
  gfx(88.3, 92.98, 200, (d) => (
    <Sticker dur={d} kicker="Luaran cantik =" title="Harga boleh kautim 🤝" bg={C.green} color={C.white} />
  )),
  gfx(96.6, 103.5, 280, (d, r) => (
    <DropDropDrop dur={d} introAt={r(97.36)} drops={[r(102.18), r(102.6), r(102.82)]} />
  )),
  gfx(104.05, 109.72, 320, (d, r) => <TipCard dur={d} washAt={r(107.28)} shineAt={r(108.8)} />),
  gfx(110.9, 112.98, 120, (d) => <Sticker dur={d} title="Harga boleh kautim ✅" bg={C.yellow} tilt={-2} />),
  gfx(113.35, 122.4, 340, (d, r) => <CtaDM dur={d} tradeAt={r(115.84)} bioAt={r(119.68)} />),
];

/* -------------------------------- SFX -------------------------------- */


const SFX: Sfx[] = [
  // hook
  { frame: 0, name: "impact", vol: 0.75 },
  { frame: 10, name: "whoosh", vol: 0.5 },
  s(63.1, "cash", 0.55, "first"),
  { frame: Math.max(0, HOOK_END - Math.round(1.5 * FPS)), name: "riser", vol: 0.4 },
  { frame: HOOK_END - 4, name: "whoosh", vol: 0.7 },
  { frame: HOOK_END, name: "shutter", vol: 0.5 },

  s(2.0, "whoosh", 0.35),
  s(3.06, "pop", 0.6),
  s(7.6, "whoosh", 0.35),
  s(7.96, "pop", 0.55),
  s(14.03, "pop", 0.55),
  s(18.5, "click", 0.6),
  s(20.14, "error", 0.35),
  s(23.9, "impact", 0.6),

  // chip cloud
  s(26.7, "pop", 0.5),
  s(27.78, "pop", 0.5),
  s(29.06, "pop", 0.5),
  s(31.28, "pop", 0.5),
  s(32.56, "pop", 0.5),
  s(35.2, "pop", 0.5),

  // price meter
  s(39.1, "whoosh", 0.35),
  s(50.4, "riser", 0.25),
  s(51.0, "cash", 0.6),

  // repair minus
  s(53.6, "error", 0.35),
  s(58.6, "swoosh_down", 0.5),

  // payoff
  s(63.5, "ding", 0.5),

  // example motor
  s(72.0, "whoosh", 0.35),
  s(73.0, "click", 0.55),
  s(78.5, "error", 0.3),
  s(81.9, "ding", 0.45),

  // owner cleaned / kautim
  s(84.75, "pop", 0.5),
  s(88.3, "whoosh", 0.35),
  s(89.74, "cash", 0.5),

  // drop drop drop
  s(97.36, "error", 0.35),
  s(102.18, "drop", 0.45),
  s(102.6, "drop", 0.45),
  s(102.82, "drop", 0.5),

  // tips
  s(104.05, "whoosh", 0.5),
  s(104.15, "ding", 0.45),
  s(108.8, "sparkle", 0.55),
  s(112.5, "cash", 0.5),

  // CTA
  s(113.35, "whoosh", 0.45),
  s(114.5, "notif", 0.6),
  s(115.84, "pop", 0.45),
  s(116.06, "pop", 0.45),
  s(116.3, "pop", 0.45),
  s(119.68, "click", 0.55),
];

/** Cuts that get a quick white flash + whoosh (output frames). */
const FLASH_CUTS: number[] = [HOOK_END, F(104.05)];

export const tolakMotor: Project = {
  id: "TolakMotor",
  media: { video: "v1/source.mp4", voice: "v1/voice.m4a", music: "music/funky_chunk.mp3" },
  tl,
  face: base.face,
  captions: base.captions,
  speech: base.speech,
  graphics: GRAPHICS,
  sfx: SFX,
  flashCuts: FLASH_CUTS,
};
