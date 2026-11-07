import React from "react";
import { ChipCloud, CtaDM, PriceTag, RevealRows, Stamp, Sticker } from "../../components/Graphics";
import { C } from "../../fonts";
import { createBase, Gfx, Project, Sfx } from "../../project";
import edl from "./edl.json";
import words from "./words.json";
import faces from "./faces.json";

/**
 * Video 4 — "Stok baru sampai" (19 Motor Trading). Authored in SOURCE seconds.
 * Requirement: final length must be >= 1:31, so only true repeats and dead air
 * were cut, with natural breathing room kept between lines.
 * Same light SFX style as the Showroom video (two whooshes in total).
 */
const base = createBase({
  clips: edl,
  faces: faces as number[][],
  words,
  keywords: [
    "honda", "wave", "alpha", "lagenda", "vario", "ex5", "sold", "e-bonus", "engine", "tahan",
    "rm2,700", "rm2,000", "rm3,500", "rm3,900", "rm7,000", "tip-top", "tayar", "meter", "cun", "cantik",
    "2022", "injection", "kautim", "y15", "test", "lc", "dua", "costing", "dm", "bio", "sedap",
  ],
});
const { F, gfx, s, tl } = base;

const HOOK_END = tl.placed[1].from + tl.placed[1].frames;

/* ------------------------------ GRAPHICS ------------------------------ */

const GRAPHICS: Gfx[] = [
  // Hook: LC from RM3,900
  { from: 0, dur: HOOK_END, height: 330, render: (d) => (
    <PriceTag dur={d} kicker="LC135 serendah..." price="RM3,900" note="Ada 2 biji je! ✌️" />
  ) },

  gfx(1.6, 3.42, 200, (d) => <Sticker dur={d} kicker="19 Motor Trading" title="Stok baru sampai! 🚚" />),
  gfx(3.9, 11.68, 300, (d, r) => (
    <ChipCloud
      dur={d}
      title="Baru masuk"
      items={[
        { at: r(5.6), text: "Honda Wave Alpha" },
        { at: r(8.44), text: "Lagenda" },
        { at: r(10.84), text: "Vario" },
      ]}
    />
  )),
  gfx(19.8, 22.12, 270, (d, r) => <Stamp dur={d} top="Honda EX5" main="Sold out" color={C.red} />),
  gfx(26.12, 27.9, 200, (d) => <Sticker dur={d} kicker="Nak EX5?" title="Ada lagi, jangan risau ✅" bg={C.green} color={C.white} />),
  gfx(31.4, 33.9, 120, (d) => <Sticker dur={d} title="E-Bonus 110 🏍️" bg={C.white} tilt={-2} />),
  gfx(38.5, 41.3, 200, (d) => <Sticker dur={d} kicker="Orang kata..." title="Engine sangat tahan 💪" />),
  gfx(41.92, 44.75, 330, (d) => <PriceTag dur={d} kicker="E-Bonus ni" price="RM2,700" />),
  gfx(44.9, 57.1, 330, (d, r) => (
    <RevealRows
      dur={d}
      compact
      title="🔧 Kondisi"
      rows={[
        { at: r(46.0), label: "Dalam & luar", value: "Buat balik", icon: "check" },
        { at: r(53.0), label: "Tayar D + B", value: "Dah tukar", icon: "check" },
        { at: r(56.7), label: "Meter", value: "Cun ✨", icon: "check", accent: C.green },
      ]}
    />
  )),
  gfx(58.0, 65.6, 200, (d) => <Sticker dur={d} kicker="Biasa bawah RM2K, tapi yang ni..." title="Tip-top macam baru ✨" bg={C.yellow} />),

  // Lagenda 2022
  gfx(68.3, 75.85, 330, (d) => <PriceTag dur={d} kicker="Lagenda 2022 · injection" price="RM3,500" note="Boleh kautim 🤝" />),
  gfx(77.96, 82.7, 260, (d, r) => (
    <RevealRows
      dur={d}
      rows={[
        { at: r(78.7), label: "Tahun", value: "2022", icon: "check" },
        { at: r(82.1), label: "Engine", value: "Injection", icon: "check", accent: C.green },
      ]}
    />
  )),
  gfx(87.9, 90.8, 200, (d) => <Sticker dur={d} kicker="Dah buat balik" title="Cun & sedap bawa 🏍️" bg={C.white} tilt={2} />),
  gfx(91.7, 95.0, 120, (d) => <Sticker dur={d} title="Banyak lagi stok 🔥" bg={C.yellow} tilt={-2} />),

  // Y15
  gfx(97.3, 102.8, 330, (d) => <PriceTag dur={d} kicker="Yamaha Y15ZR" price="< RM7K" note="Boleh kautim 🤝" />),
  gfx(103.4, 111.0, 260, (d, r) => (
    <RevealRows
      dur={d}
      title="Yang penting"
      rows={[
        { at: r(105.9), label: "Hampa", value: "Puas hati", icon: "check" },
        { at: r(107.88), label: "Semua motor", value: "Boleh test", icon: "check", accent: C.green },
      ]}
    />
  )),

  // LC (body)
  gfx(114.9, 121.95, 330, (d) => <PriceTag dur={d} kicker="LC135 serendah" price="RM3,900" note="Ada 2 biji ✌️" />),
  gfx(122.66, 125.5, 120, (d) => <Sticker dur={d} title="*Ikut costing motor" bg={C.white} tilt={-2} />),

  // CTA
  { from: F(126.02), dur: tl.total - F(126.02), height: 330, place: "below", render: (d) => (
    <CtaDM dur={d} tradeAt={6} bioAt={18} items={["Y15ZR", "LC135", "Lagenda"]} footer="📍 19 Motor Trading · lokasi kat bio" />
  ) },
];

/* -------------------------------- SFX -------------------------------- */
// Sparse on purpose: ~18 sounds over ~94s, two whooshes.

const SFX: Sfx[] = [
  s(118.0, "cash", 0.55, "first"),
  { frame: HOOK_END - 4, name: "whoosh", vol: 0.45 },

  s(1.6, "pop", 0.4),
  s(21.75, "stamp", 0.45),
  s(26.2, "ding", 0.3),
  s(43.5, "cash", 0.45),
  s(46.0, "click", 0.3),
  s(53.0, "click", 0.3),
  s(56.7, "click", 0.3),
  s(63.6, "ding", 0.35),
  s(67.0, "whoosh", 0.3),
  s(69.8, "cash", 0.45),
  s(101.8, "cash", 0.4),
  s(108.0, "ding", 0.3),
  s(118.1, "cash", 0.45),
  s(126.2, "notif", 0.5),
];

export const stokBaru: Project = {
  id: "StokBaru",
  media: { video: "v4/source.mp4", voice: "v4/voice.m4a", music: "music/funky_chunk.mp3" },
  tl,
  face: base.face,
  captions: base.captions,
  speech: base.speech,
  graphics: GRAPHICS,
  sfx: SFX,
  flashCuts: [HOOK_END],
};
