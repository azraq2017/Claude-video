import React from "react";
import { ChipCloud, HookTitle, RevealRows, Stamp, Sticker } from "../../components/Graphics";
import { C } from "../../fonts";
import { createBase, Gfx, Project, Sfx } from "../../project";
import edl from "./edl.json";
import words from "./words.json";
import faces from "./faces.json";

/**
 * Video 6 — "Phone lama / rosak jangan buang — tolak, dapat duit (e-waste)".
 * Authored in SOURCE seconds. Must stay >= 1:31.
 * captionMode "exclusive": a caption OR a graphic, never both.
 */
const base = createBase({
  clips: edl,
  faces: faces as number[][],
  words,
  keywords: [
    "phone", "jangan", "buang", "duit", "tolak", "bateri", "tablet", "lenovo", "android", "support",
    "rosak", "e-waste", "seguni", "ratus", "banyak", "motherboard", "repair", "laci", "menyemak", "nokia",
    "laptop", "sungai", "petani", "waze", "lokasi", "singgah", "drop", "spot", "lama",
  ],
});
const { F, gfx, s, tl } = base;

const HOOK_A_END = tl.placed[0].from + tl.placed[0].frames;
const HOOK_END = tl.placed[1].from + tl.placed[1].frames;

/* ------------------------------ GRAPHICS ------------------------------ */

const GRAPHICS: Gfx[] = [
  // Hook
  { from: 0, dur: HOOK_A_END, height: 440, render: (d) => (
    <HookTitle dur={d} kicker="Phone lama / rosak?" lines={["Jangan", "buang!"]} footer="Boleh jadi duit 💸" footerAt={30} />
  ) },
  { from: HOOK_A_END, dur: HOOK_END - HOOK_A_END, height: 200, render: (d) => (
    <Sticker dur={d} kicker="Pakcik bawa seguni 🛍️" title="Dapat RATUS juga! 💸" bg={C.green} color={C.white} />
  ) },

  gfx(3.7, 6.8, 200, (d) => <Sticker dur={d} kicker="Phone lama / rosak?" title="Tolak sini = dapat duit 💸" bg={C.yellow} />),
  gfx(17.66, 20.54, 200, (d) => <Sticker dur={d} kicker="Tablet lama · Lenovo" title="Siapa nak pakai? 🤷" bg={C.white} tilt={2} />),
  gfx(30.7, 33.2, 200, (d) => <Sticker dur={d} kicker="Dah rosak? Main tolak" title="Jadikan e-waste ♻️" bg={C.green} color={C.white} />),
  gfx(39.3, 41.5, 120, (d) => <Sticker dur={d} title="Semua hantar ke e-waste ♻️" bg={C.white} tilt={-2} />),
  gfx(47.3, 49.24, 200, (d) => <Sticker dur={d} kicker="Bawa banyak?" title="Lagi banyak duit 💰" bg={C.yellow} tilt={2} />),
  gfx(55.7, 58.3, 200, (d) => <Sticker dur={d} kicker="Seguni phone rosak" title="Dapat ratus-ratus! 💸" bg={C.green} color={C.white} />),
  gfx(79.0, 84.1, 330, (d, r) => (
    <RevealRows
      dur={d}
      compact
      title="Phone macam ni?"
      rows={[
        { at: r(79.8), label: "Repair", value: "Tak berbaloi", icon: "cross" },
        { at: r(82.1), label: "Motherboard", value: "Rosak", icon: "cross" },
        { at: r(83.5), label: "Jalan terbaik", value: "Tolak sini ✅", icon: "check", accent: C.green },
      ]}
    />
  )),
  gfx(87.06, 90.1, 200, (d) => <Sticker dur={d} kicker="Daripada simpan dalam laci..." title="Menyemak je! 🗑️" bg={C.white} tilt={-2} />),
  gfx(108.6, 116.7, 260, (d, r) => (
    <ChipCloud
      dur={d}
      title="Kami ambil"
      items={[
        { at: r(109.3), text: "📱 Phone lama" },
        { at: r(110.3), text: "Nokia lama" },
        { at: r(111.8), text: "Tablet" },
        { at: r(113.9), text: "💻 Laptop" },
      ]}
    />
  )),
  gfx(94.6, 96.0, 120, (d) => <Sticker dur={d} title="📍 Sungai Petani" bg={C.yellow} tilt={2} />),
  gfx(96.8, 98.15, 120, (d) => <Sticker dur={d} title="🧭 Cari kat Waze" bg={C.white} tilt={-2} />),
  gfx(100.7, 103.76, 200, (d) => <Sticker dur={d} kicker="Main drop je 📦" title="Duit on the spot 💸" bg={C.green} color={C.white} />),
  { from: F(118.12), dur: tl.total - F(118.12), height: 270, render: (d) => <Stamp dur={d} top="Phone lama / rosak" main="Jangan buang" color={C.red} /> },
];

/* -------------------------------- SFX -------------------------------- */
// Light touch: ~14 sounds, two whooshes.

const SFX: Sfx[] = [
  { frame: 2, name: "pop", vol: 0.4 },
  s(57.0, "cash", 0.5, "first"),
  { frame: HOOK_END - 4, name: "whoosh", vol: 0.45 },

  s(6.0, "cash", 0.4),
  s(17.7, "pop", 0.35),
  s(30.8, "ding", 0.35),
  s(48.6, "cash", 0.4),
  s(57.0, "cash", 0.4),
  s(79.8, "click", 0.3),
  s(82.1, "click", 0.3),
  s(83.5, "ding", 0.35),
  s(108.1, "whoosh", 0.3),
  s(109.3, "pop", 0.3),
  s(101.0, "cash", 0.45),
  s(118.2, "stamp", 0.45),
];

export const phoneLama: Project = {
  id: "PhoneLama",
  media: { video: "v6/source.mp4", voice: "v6/voice.m4a", music: "music/funky_chunk.mp3" },
  tl,
  face: base.face,
  captions: base.captions,
  speech: base.speech,
  graphics: GRAPHICS,
  sfx: SFX,
  flashCuts: [HOOK_END],
  captionMode: "exclusive",
};
