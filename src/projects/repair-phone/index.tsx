import React from "react";
import {
  Burst,
  CtaDM,
  HookTitle,
  PriceTag,
  RevealRows,
  Stamp,
  Sticker,
  WhatsAppCard,
} from "../../components/Graphics";
import { C } from "../../fonts";
import { FPS } from "../../timeline";
import { createBase, Gfx, Project, Sfx } from "../../project";
import edl from "./edl.json";
import words from "./words.json";
import faces from "./faces.json";

/**
 * Video 2 — "Repair phone / tukar LCD". Authored in SOURCE seconds.
 * Hook = two teasers: "pecah, pecah, pecah!" then "terus siap pada hari yang sama".
 */
const base = createBase({
  clips: edl,
  faces: faces as number[][],
  words,
  keywords: [
    "lcd", "bateri", "pecah", "rm100", "full", "house", "line", "hidup", "repairkan", "kakak",
    "barang", "order", "whatsapp", "model", "stock", "spot", "siap", "sama", "dm", "kedai", "sibuk",
  ],
});
const { F, gfx, s, tl } = base;

const HOOK_A_END = tl.placed[0].from + tl.placed[0].frames;
const HOOK_END = tl.placed[1].from + tl.placed[1].frames;

/* ------------------------------ GRAPHICS ------------------------------ */

const GRAPHICS: Gfx[] = [
  // Hook A: cracked LCD tease
  gfx(20.28, 22.22, 300, (d, r) => (
    <Burst dur={d} label="LCD macam ni? 😱" word="PECAH!" at={[r(20.4, "first"), r(21.0, "first"), r(21.4, "first")]} crack />
  ), "first"),
  // Hook B: the promise
  { from: HOOK_A_END, dur: HOOK_END - HOOK_A_END, height: 440, render: (d) => (
    <HookTitle dur={d} kicker="Repair phone" lines={["Siap", "hari sama"]} footer="Ni caranya 👇" color={C.green} footerAt={22} />
  ) },

  gfx(0.75, 4.32, 200, (d) => <Sticker dur={d} kicker="Hari ni 🔥" title="Kedai full house!" />),
  gfx(4.4, 20.15, 330, (d, r) => (
    <RevealRows
      dur={d}
      title="📋 Queue hari ni"
      rows={[
        { at: r(4.9), label: "Job 1", value: "Tukar LCD", icon: "check" },
        { at: r(15.3), label: "Job 2", value: "Tukar bateri", icon: "check" },
        { at: r(19.3), label: "Job 3", value: "LCD pecah", icon: "cross", accent: C.red },
      ]}
    />
  )),
  gfx(20.28, 22.22, 300, (d, r) => (
    <Burst dur={d} word="PECAH!" at={[r(20.4), r(21.0), r(21.4)]} crack />
  )),
  gfx(23.3, 25.16, 120, (d) => <Sticker dur={d} title="Tak boleh hidup 💀" bg={C.red} color={C.white} tilt={3} />),
  gfx(27.3, 31.06, 200, (d) => <Sticker dur={d} kicker="Tengok tu 👀" title="Ada line = LCD rosak" bg={C.white} />),
  gfx(31.6, 33.1, 330, (d) => <PriceTag dur={d} kicker="Harga tukar LCD ni" price="RM100" note="Hari ni ✅" />),
  gfx(34.75, 37.16, 120, (d) => <Sticker dur={d} title="Datang je kedai 🏪" bg={C.white} tilt={-2} />),
  gfx(37.16, 40.46, 200, (d) => (
    <Sticker dur={d} kicker="Jumpa kakak ni 👩‍🔧" title="Terus repair! 🔧" bg={C.yellow} tilt={2} />
  )),
  gfx(41.75, 46.7, 260, (d, r) => (
    <RevealRows
      dur={d}
      rows={[
        { at: r(41.9), label: "Ada barang", value: "Terus buat", icon: "check", accent: C.green },
        { at: r(44.7), label: "Takde barang", value: "Order dulu", icon: "warn" },
      ]}
    />
  )),
  gfx(46.94, 54.7, 380, (d, r) => (
    <WhatsAppCard
      dur={d}
      title="WhatsApp dulu"
      msgs={[
        { at: r(49.6), text: "Nak tukar: LCD / bateri" },
        { at: r(50.8), text: "Model phone: ✍️" },
      ]}
      footer={{ at: r(54.1), text: "Model banyak sangat! 😵" }}
    />
  )),
  gfx(55.0, 63.62, 330, (d, r) => (
    <RevealRows
      dur={d}
      title="📦 Stock kami"
      rows={[
        { at: r(57.6), label: "Bateri", value: "Banyak", icon: "check" },
        { at: r(58.5), label: "LCD", value: "Banyak", icon: "check" },
        { at: r(61.0), label: "Semua model?", value: "Tak cukup", icon: "cross", accent: C.red },
      ]}
    />
  )),
  gfx(63.7, 67.62, 200, (d) => (
    <Sticker dur={d} kicker="Nak siap on the spot?" title="WhatsApp dulu 💬" bg={C.green} color={C.white} />
  )),
  gfx(68.56, 73.4, 330, (d, r) => (
    <RevealRows
      dur={d}
      title="⚡ Cara paling laju"
      rows={[
        { at: 0, label: "1", value: "WhatsApp kami", icon: "check" },
        { at: r(68.8), label: "2", value: "Kami save barang", icon: "check" },
        { at: r(70.0), label: "3", value: "Datang & tengok", icon: "check", accent: C.green },
      ]}
    />
  )),
  gfx(73.74, 75.5, 270, (d) => <Stamp dur={d} top="Terus siap" main="Hari sama" />),
  gfx(75.94, 78.5, 330, (d, r) => (
    <CtaDM dur={d} tradeAt={r(76.2)} bioAt={r(77.0)} items={["LCD", "Bateri", "Repair"]} footer="📍 Datang kedai / DM je ☝️" />
  )),
];

/* -------------------------------- SFX -------------------------------- */

const SFX: Sfx[] = [
  // hook A: three slams + glass
  s(20.4, "impact", 0.55, "first"),
  s(21.0, "stamp", 0.5, "first"),
  s(21.4, "glass", 0.6, "first"),
  // hook B
  { frame: HOOK_A_END - 3, name: "whoosh", vol: 0.6 },
  { frame: HOOK_A_END, name: "shutter", vol: 0.45 },
  s(74.3, "ding", 0.5, "first"),
  { frame: Math.max(0, HOOK_END - Math.round(1.2 * FPS)), name: "riser", vol: 0.35 },
  { frame: HOOK_END - 4, name: "whoosh", vol: 0.7 },

  s(0.75, "pop", 0.55),
  s(3.3, "pop", 0.5),
  s(4.4, "whoosh", 0.35),
  s(4.9, "click", 0.55),
  s(15.3, "click", 0.55),
  s(19.3, "error", 0.35),
  s(20.4, "stamp", 0.45),
  s(21.0, "stamp", 0.45),
  s(21.4, "glass", 0.55),
  s(23.3, "error", 0.3),
  s(27.3, "pop", 0.5),
  s(31.6, "whoosh", 0.4),
  s(32.3, "cash", 0.6),
  s(34.75, "pop", 0.5),
  s(37.2, "pop", 0.5),
  s(41.9, "ding", 0.4),
  s(44.7, "click", 0.55),
  s(46.94, "whoosh", 0.4),
  s(49.6, "send", 0.6),
  s(50.8, "send", 0.6),
  s(54.1, "pop", 0.5),
  s(57.6, "click", 0.5),
  s(58.5, "click", 0.5),
  s(61.0, "error", 0.3),
  s(63.7, "notif", 0.55),
  s(68.56, "whoosh", 0.35),
  s(68.8, "click", 0.5),
  s(70.0, "click", 0.5),
  s(73.74, "stamp", 0.6),
  s(75.94, "whoosh", 0.45),
  s(76.0, "notif", 0.6),
  s(76.2, "pop", 0.45),
  s(76.4, "pop", 0.45),
  s(76.6, "pop", 0.45),
];

/** Cuts that get a quick white flash. */
const FLASH_CUTS: number[] = [HOOK_A_END, HOOK_END];

export const repairPhone: Project = {
  id: "RepairPhone",
  media: { video: "v2/source.mp4", voice: "v2/voice.m4a", music: "music/getting_it_done.mp3" },
  tl,
  face: base.face,
  captions: base.captions,
  speech: base.speech,
  graphics: GRAPHICS,
  sfx: SFX,
  flashCuts: FLASH_CUTS,
  // this track masters ~2 dB hotter than video 1's
  musicLevels: { underVoice: 0.042, open: 0.12 },
};
