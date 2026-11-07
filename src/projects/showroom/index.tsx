import React from "react";
import {
  ChipCloud,
  CtaDM,
  PriceLadder,
  PriceTag,
  RevealRows,
  Sticker,
} from "../../components/Graphics";
import { C } from "../../fonts";
import { createBase, Gfx, Project, Sfx } from "../../project";
import edl from "./edl.json";
import words from "./words.json";
import faces from "./faces.json";

/**
 * Video 3 — "Showroom 19 Motor Trading: Y15ZR, LC135, skuter".
 * Authored in SOURCE seconds. Hook = "Ada yang mencari Y15 tak?" +
 * "kalau bertuah RM6,500 pun kadang-kadang boleh".
 * SFX are deliberately sparse (user asked: not too many whooshes) —
 * sounds only on prices, the hook, section change and the CTA.
 */
const base = createBase({
  clips: edl,
  faces: faces as number[][],
  words,
  keywords: [
    "y15", "rm7,000", "rm6,800", "rm6,500", "rm3,900", "kautim", "restore", "di-restore", "test", "deal",
    "trade-in", "rosak", "lama", "stock", "bertuah", "lc", "v8", "v6", "v5", "v1", "pcx", "nmax",
    "wave", "skuter", "engine", "tayar", "cat", "bio", "dm", "trading", "costing",
  ],
});
const { F, gfx, s, tl } = base;

const HOOK_END = tl.placed[2].from + tl.placed[2].frames;

/* ------------------------------ GRAPHICS ------------------------------ */

const GRAPHICS: Gfx[] = [
  // Hook
  gfx(1.6, 3.68, 200, (d) => <Sticker dur={d} kicker="Tengah cari?" title="Y15ZR 🏍️" />, "first"),
  { from: F(38.2, "first"), dur: HOOK_END - F(38.2, "first"), height: 330, render: (d) => (
    <PriceTag dur={d} kicker="Kalau bertuah..." price="RM6,500" note="Y15ZR siap restore 😳" />
  ) },

  gfx(4.0, 7.4, 200, (d) => <Sticker dur={d} kicker="Stock Y15ZR" title="Semua siap restore ✨" bg={C.white} />),
  gfx(7.9, 9.18, 200, (d) => <Sticker dur={d} kicker="Harga kertas ni?" title="Jangan tengok ❌" bg={C.red} color={C.white} tilt={3} />),
  gfx(10.02, 13.68, 330, (d) => <PriceTag dur={d} kicker="Boleh kautim lagi" price="< RM7K" note="Tak ada masalah 🤝" />),
  gfx(14.9, 21.04, 330, (d, r) => (
    <RevealRows
      dur={d}
      title="Cara beli 🛒"
      rows={[
        { at: r(15.8), label: "1", value: "Test motor dulu", icon: "check" },
        { at: r(18.26), label: "2", value: "Deal harga", icon: "check" },
        { at: r(20.36), label: "3", value: "Terus bawa balik", icon: "check", accent: C.green },
      ]}
    />
  )),
  gfx(21.2, 26.16, 200, (d) => (
    <Sticker dur={d} kicker="Trade-in motor rosak / lama?" title="Masih bawah RM7K ✅" bg={C.green} color={C.white} />
  )),
  gfx(28.3, 30.42, 120, (d) => <Sticker dur={d} title="Banyak stock Y15 🔥" bg={C.yellow} tilt={-2} />),
  { ...gfx(36.14, 43.84, 280, (d, r) => (
    <PriceLadder
      dur={d}
      title="Y15ZR boleh jadi..."
      steps={[
        { at: 0, price: "RM7,000" },
        { at: r(37.3), price: "RM6,800" },
        { at: r(40.66), price: "RM6,500", tag: "Kalau bertuah 🍀" },
      ]}
      note={{ at: r(42.9), text: "*ikut costing motor" }}
    />
  )), place: "below" },

  // LC section
  gfx(63.9, 65.16, 200, (d) => <Sticker dur={d} kicker="Seterusnya 👉" title="Yamaha LC135" bg={C.white} tilt={-3} />),
  gfx(68.9, 71.6, 330, (d) => <PriceTag dur={d} kicker="LC135 dalam stock" price="RM3,900" note="Siap restore ✅" />),
  gfx(74.5, 78.52, 200, (d) => <Sticker dur={d} kicker="Nak LC? Datang terus 📍" title="19 Motor Trading" bg={C.yellow} />),
  gfx(83.3, 97.96, 370, (d, r) => (
    <RevealRows
      dur={d}
      compact
      title="🔧 Bukan jual macam asal"
      rows={[
        { at: r(90.6), label: "Tune", value: "Dalam & luar", icon: "check" },
        { at: r(93.8), label: "Cover set", value: "Cat baru", icon: "check" },
        { at: r(94.8), label: "Engine", value: "Buat balik", icon: "check" },
        { at: r(96.6), label: "Tayar", value: "Tukar baru", icon: "check", accent: C.green },
      ]}
    />
  )),
  gfx(99.3, 101.46, 120, (d) => <Sticker dur={d} title="Harga boleh kautim 🤝" bg={C.green} color={C.white} tilt={2} />),
  gfx(104.82, 108.38, 300, (d, r) => (
    <ChipCloud
      dur={d}
      title="Semua versi LC ada"
      items={[
        { at: r(105.1), text: "V8" },
        { at: r(106.36), text: "V6" },
        { at: r(106.84), text: "V5" },
        { at: r(107.52), text: "V1" },
      ]}
    />
  )),
  gfx(108.76, 110.8, 330, (d) => <PriceTag dur={d} kicker="Yang macam ni" price="RM3,900" />),

  // Scooters & Wave
  gfx(116.2, 126.08, 300, (d, r) => (
    <ChipCloud
      dur={d}
      title="Skuter pun ada 🛵"
      items={[
        { at: r(119.4), text: "Yang pelik-pelik 😂" },
        { at: r(121.46), text: "Honda PCX" },
        { at: r(123.46), text: "Yamaha NMAX" },
      ]}
    />
  )),
  gfx(134.2, 137.38, 200, (d) => <Sticker dur={d} kicker="Cari Wave 100?" title="Ada! Banyak ✅" bg={C.yellow} tilt={2} />),
  gfx(128.9, 134.16, 260, (d, r) => (
    <RevealRows
      dur={d}
      title="Trade-in? Boleh!"
      rows={[
        { at: r(131.2), label: "Motor lama", value: "Boleh", icon: "check" },
        { at: r(132.88), label: "Motor rosak", value: "Terima", icon: "check", accent: C.green },
      ]}
    />
  )),
  // CTA spans "lokasi kat bio" + "terus DM kita" (consecutive in the edit)
  { from: F(126.32), dur: tl.total - F(126.32), height: 330, place: "below", render: (d) => (
    <CtaDM dur={d} tradeAt={8} bioAt={20} items={["Y15ZR", "LC135", "Skuter"]} footer="📍 19 Motor Trading · lokasi kat bio" />
  ) },
];

/* -------------------------------- SFX -------------------------------- */
// Sparse on purpose: ~20 sounds over ~86s, only two whooshes.

const SFX: Sfx[] = [
  s(1.6, "pop", 0.45, "first"),
  s(40.8, "cash", 0.55, "first"),
  { frame: HOOK_END - 4, name: "whoosh", vol: 0.45 },

  s(7.95, "error", 0.25),
  s(13.0, "cash", 0.45),
  s(20.4, "ding", 0.35),
  s(24.0, "pop", 0.4),
  s(37.3, "drop", 0.35),
  s(40.75, "cash", 0.5),

  s(63.9, "whoosh", 0.35),
  s(70.6, "cash", 0.45),
  s(77.3, "ding", 0.35),
  s(90.6, "click", 0.3),
  s(93.8, "click", 0.3),
  s(94.8, "click", 0.3),
  s(96.6, "click", 0.3),
  s(109.6, "cash", 0.4),
  s(119.4, "pop", 0.4),
  s(133.6, "ding", 0.35),
  s(138.7, "notif", 0.5),
];

export const showroom: Project = {
  id: "Showroom",
  media: { video: "v3/source.mp4", voice: "v3/voice.m4a", music: "music/funky_chunk.mp3" },
  tl,
  face: base.face,
  captions: base.captions,
  speech: base.speech,
  graphics: GRAPHICS,
  sfx: SFX,
  flashCuts: [HOOK_END],
};
