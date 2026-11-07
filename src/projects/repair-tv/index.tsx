import React from "react";
import { ChipCloud, CtaDM, HookTitle, PriceTag, RevealRows, Stamp, Sticker } from "../../components/Graphics";
import { C } from "../../fonts";
import { createBase, Gfx, Project, Sfx } from "../../project";
import edl from "./edl.json";
import words from "./words.json";
import faces from "./faces.json";

/**
 * Video 7 — "Tas Tech repair TV" (voice-over, no face on screen).
 * faces.json is a fixed virtual band near the top, so graphics sit upper-middle
 * and leave the TVs / parts in the lower half visible.
 * Must stay >= 1:31. captionMode "exclusive".
 */
const base = createBase({
  clips: edl,
  faces: faces as number[][],
  words,
  keywords: [
    "motherboard", "tv", "repair", "tas", "tech", "kilat", "spare", "part", "skrin", "pecah", "mahal",
    "berbaloi", "baru", "backlight", "gambar", "torchlight", "sungai", "petani", "bertam", "kulim",
    "second", "hand", "rm499", "lg", "dm", "follow", "limited", "kerosakan", "kerusakan",
  ],
});
const { F, gfx, s, tl } = base;

const HOOK_A_END = tl.placed[0].from + tl.placed[0].frames;
const HOOK_END = tl.placed[1].from + tl.placed[1].frames;

/* ------------------------------ GRAPHICS ------------------------------ */

const GRAPHICS: Gfx[] = [
  // Hook
  { from: 0, dur: HOOK_A_END, height: 560, render: (d) => (
    <HookTitle dur={d} kicker="Nak repair TV?" lines={["Skrin pecah?", "Tak payah", "hantar!"]} footer="Kenapa? 👇" footerAt={40} color={C.yellow} />
  ) },
  { from: HOOK_A_END, dur: HOOK_END - HOOK_A_END, height: 120, render: (d) => (
    <Sticker dur={d} title="Sebab apa? 🤔" bg={C.white} tilt={-3} />
  ) },

  gfx(1.1, 3.36, 200, (d) => <Sticker dur={d} kicker="Siapa tahu?" title="Ini apa? 🤔" bg={C.yellow} />),
  gfx(6.4, 7.86, 120, (d) => <Sticker dur={d} title="Motherboard TV 🔌" bg={C.white} tilt={2} />),
  gfx(10.6, 13.1, 200, (d) => <Sticker dur={d} kicker="Tas Tech" title="Repair TV pun ada! 📺" bg={C.green} color={C.white} />),
  gfx(27.4, 34.5, 330, (d, r) => (
    <RevealRows
      dur={d}
      compact
      title="Kerosakan yang kami buat"
      rows={[
        { at: r(27.8), label: "Kena kilat ⚡", value: "Boleh", icon: "check" },
        { at: r(28.8), label: "Motherboard", value: "Boleh", icon: "check" },
        { at: r(32.4), label: "Ada spare part", value: "Kita repair ✅", icon: "check", accent: C.green },
      ]}
    />
  )),
  gfx(37.6, 39.3, 270, (d) => <Stamp dur={d} top="Skrin pecah?" main="Tak berbaloi" color={C.red} />),
  gfx(47.7, 49.7, 200, (d) => <Sticker dur={d} kicker="Kos skrin terlalu mahal" title="= Macam beli TV baru 💸" bg={C.white} />),
  gfx(54.7, 56.95, 200, (d) => <Sticker dur={d} kicker="Selagi skrin tak pecah" title="Boleh repair ✅" bg={C.green} color={C.white} />),
  gfx(61.16, 62.66, 120, (d) => <Sticker dur={d} title="Isu: Backlight 💡" bg={C.yellow} tilt={-2} />),
  gfx(66.2, 72.5, 260, (d, r) => (
    <RevealRows
      dur={d}
      title="Masalah backlight"
      rows={[
        { at: r(66.7), label: "Skrin", value: "Tak ada gambar", icon: "cross" },
        { at: r(70.8), label: "Suluh torchlight", value: "Ada gambar 🔦", icon: "check", accent: C.green },
      ]}
    />
  )),
  gfx(75.0, 78.1, 120, (d) => <Sticker dur={d} title="Hantar je, kita buatkan 🔧" bg={C.white} tilt={2} />),
  gfx(79.9, 83.3, 200, (d) => <Sticker dur={d} kicker="Tas Tech" title="📍 Sungai Petani" bg={C.yellow} />),
  gfx(86.9, 92.7, 260, (d, r) => (
    <ChipCloud
      dur={d}
      title="Jauh pun boleh bawa"
      items={[
        { at: r(86.92), text: "Bertam" },
        { at: r(87.56), text: "Kulim" },
        { at: r(91.0), text: "Kawasan dekat-dekat" },
      ]}
    />
  )),
  gfx(96.4, 101.98, 330, (d) => <PriceTag dur={d} kicker="TV second hand" price="RM499" note="TV LG 📺" />),

  // CTA
  { from: F(109.76), dur: tl.total - F(109.76), height: 330, place: "below", render: (d) => (
    <CtaDM dur={d} tradeAt={20} bioAt={110} items={["Repair TV", "TV second hand"]} footer="📍 Cari Tas Tech · Sungai Petani" />
  ) },
];

/* -------------------------------- SFX -------------------------------- */
// Light touch: ~15 sounds, two whooshes.

const SFX: Sfx[] = [
  { frame: 2, name: "impact", vol: 0.4 },
  { frame: HOOK_A_END, name: "pop", vol: 0.35 },
  { frame: HOOK_END - 4, name: "whoosh", vol: 0.45 },

  s(1.1, "pop", 0.35),
  s(10.7, "ding", 0.35),
  s(27.8, "click", 0.3),
  s(28.8, "click", 0.3),
  s(32.4, "ding", 0.35),
  s(37.7, "stamp", 0.45),
  s(48.8, "cash", 0.4),
  s(66.7, "error", 0.22),
  s(70.8, "ding", 0.35),
  s(78.5, "whoosh", 0.3),
  s(97.0, "cash", 0.45),
  s(110.0, "notif", 0.45),
];

export const repairTv: Project = {
  id: "RepairTv",
  media: { video: "v7/source.mp4", voice: "v7/voice.m4a", music: "music/funky_chunk.mp3" },
  tl,
  face: base.face,
  captions: base.captions,
  speech: base.speech,
  graphics: GRAPHICS,
  sfx: SFX,
  flashCuts: [HOOK_END],
  captionMode: "exclusive",
};
