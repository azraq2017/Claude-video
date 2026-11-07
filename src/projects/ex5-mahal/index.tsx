import React from "react";
import { ChipCloud, CtaDM, HookTitle, PriceTag, RevealRows, Stamp, Sticker } from "../../components/Graphics";
import { C } from "../../fonts";
import { createBase, Gfx, Project, Sfx } from "../../project";
import edl from "./edl.json";
import words from "./words.json";
import faces from "./faces.json";

/**
 * Video 5 — "EX5 Dream RM5,000: kenapa customer pilih yang mahal?"
 * Authored in SOURCE seconds. Must stay >= 1:31.
 * captionMode "exclusive": a caption OR a graphic is on screen, never both,
 * so graphics are kept short and only on key beats.
 */
const base = createBase({
  clips: edl,
  faces: faces as number[][],
  words,
  keywords: [
    "ex5", "dream", "carburetor", "sold", "rm5,000", "mahal", "rm3,000", "rm3,500", "rm2,500", "test",
    "kondisi", "terbaik", "cantik", "baru", "rosak", "tolak", "e-smart", "sym", "celup", "restore", "cun",
    "masjid", "sekolah", "future", "skuter", "murah", "lc", "y15", "bio", "terjah",
  ],
});
const { F, gfx, s, tl } = base;

const HOOK_A_END = tl.placed[1].from + tl.placed[1].frames;
const HOOK_END = tl.placed[2].from + tl.placed[2].frames;

/* ------------------------------ GRAPHICS ------------------------------ */

const GRAPHICS: Gfx[] = [
  // Hook: price shock, then the question
  { from: 0, dur: HOOK_A_END, height: 330, render: (d) => (
    <PriceTag dur={d} kicker="EX5 Dream · sold semalam" price="RM5,000" note="Mahal kan? 🤔" />
  ) },
  { from: HOOK_A_END, dur: HOOK_END - HOOK_A_END, height: 440, render: (d) => (
    <HookTitle dur={d} kicker="Ada EX5 lagi murah..." lines={["Tapi dia pilih", "yang mahal?"]} footer="Sebab apa? 👇" footerAt={30} />
  ) },

  // EX5 Dream sold
  gfx(11.1, 12.7, 270, (d) => <Stamp dur={d} top="Honda EX5 Dream" main="Sold" color={C.red} />),
  gfx(14.45, 16.0, 330, (d) => <PriceTag dur={d} kicker="Harga jual" price="RM5,000" />),
  gfx(26.1, 28.28, 200, (d) => <Sticker dur={d} kicker="Tak payah buat apa dah" title="Beli → terus bawa 🏍️" bg={C.white} />),
  gfx(38.44, 39.4, 120, (d) => <Sticker dur={d} title="Agak-agak sebab apa? 🤔" bg={C.yellow} tilt={-2} />),
  gfx(40.3, 47.6, 330, (d, r) => (
    <RevealRows
      dur={d}
      compact
      title="Sebab dia pilih yang mahal"
      rows={[
        { at: r(40.5), label: "Kondisi", value: "Terbaik", icon: "check" },
        { at: r(45.9), label: "Luar & dalam", value: "Dah buat", icon: "check" },
        { at: r(47.3), label: "Rasa", value: "Macam baru ✨", icon: "check", accent: C.green },
      ]}
    />
  )),
  gfx(50.5, 53.0, 120, (d) => <Sticker dur={d} title="Motor baru sampai 🚚" bg={C.white} tilt={2} />),
  gfx(59.5, 62.75, 200, (d) => <Sticker dur={d} kicker="Nak tolak motor?" title="Rosak / elok, kami ambil ✅" bg={C.green} color={C.white} />),

  // What else the customer tested
  gfx(83.4, 85.2, 330, (d) => <PriceTag dur={d} kicker="EX5 yang dia test" price="RM3,500" />),
  gfx(92.4, 94.75, 330, (d) => <PriceTag dur={d} kicker="Yang ni pula" price="RM2,500" />),
  gfx(101.8, 104.65, 200, (d) => <Sticker dur={d} kicker="Bukan EX5 betul — 'celup' 😅" title="SYM E-Smart" bg={C.white} tilt={-2} />),
  gfx(108.6, 111.4, 330, (d, r) => (
    <RevealRows
      dur={d}
      compact
      title="Customer test 3 motor..."
      rows={[
        { at: r(108.7), label: "SYM E-Smart", value: "RM2,500", icon: "cross" },
        { at: r(109.0), label: "EX5", value: "RM3,500", icon: "cross" },
        { at: r(109.5), label: "EX5 Dream", value: "RM5,000 ✅", icon: "check", accent: C.green },
      ]}
    />
  )),

  gfx(128.0, 132.0, 200, (d) => <Sticker dur={d} kicker="Dah restore" title="Cun sangat-sangat ✨" bg={C.yellow} />),
  gfx(135.0, 140.02, 260, (d, r) => (
    <ChipCloud
      dur={d}
      title="Sesuai untuk"
      items={[
        { at: r(136.04), text: "🕌 Pergi masjid" },
        { at: r(138.4), text: "🎒 Hantar anak sekolah" },
      ]}
    />
  )),
  gfx(145.0, 150.15, 260, (d, r) => (
    <ChipCloud
      dur={d}
      title="Semua ada kat sini"
      items={[
        { at: r(145.2), text: "Honda Future" },
        { at: r(146.4), text: "Motor mahal / murah" },
        { at: r(147.9), text: "Skuter" },
      ]}
    />
  )),

  // CTA
  { from: F(150.4), dur: tl.total - F(150.4), height: 330, place: "below", render: (d) => (
    <CtaDM dur={d} tradeAt={12} bioAt={36} items={["Skuter", "LC135", "Y15ZR"]} footer="📍 19 Motor Trading · nombor kat bio" />
  ) },
];

/* -------------------------------- SFX -------------------------------- */
// Light touch, same as the last two videos: ~17 sounds, two whooshes.

const SFX: Sfx[] = [
  s(14.6, "cash", 0.5, "first"),
  { frame: HOOK_END - 4, name: "whoosh", vol: 0.45 },

  s(11.24, "stamp", 0.45),
  s(14.6, "cash", 0.4),
  s(38.5, "pop", 0.4),
  s(40.5, "click", 0.3),
  s(45.9, "click", 0.3),
  s(47.3, "click", 0.3),
  s(50.6, "pop", 0.35),
  s(83.5, "cash", 0.4),
  s(92.5, "cash", 0.4),
  s(101.9, "error", 0.22),
  s(109.5, "ding", 0.4),
  s(128.2, "sparkle", 0.3),
  s(140.3, "whoosh", 0.3),
  s(150.6, "notif", 0.5),
];

export const ex5Mahal: Project = {
  id: "Ex5Mahal",
  media: { video: "v5/source.mp4", voice: "v5/voice.m4a", music: "music/funky_chunk.mp3" },
  tl,
  face: base.face,
  captions: base.captions,
  speech: base.speech,
  graphics: GRAPHICS,
  sfx: SFX,
  flashCuts: [HOOK_END],
  captionMode: "exclusive",
};
