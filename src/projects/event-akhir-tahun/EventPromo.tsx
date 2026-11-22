import React from "react";
import {
  AbsoluteFill,
  Audio,
  Easing,
  interpolate,
  OffthreadVideo,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { FPS } from "../../timeline";
import { createBase } from "../../project";
import { CleanCaptions } from "../../components/Captions";
import { PricePop, QuoteLabel, StressHit } from "../../components/Minimal";
import { Outro19, OUTRO_FRAMES, OUTRO_OVERLAP } from "../../brand/Outro19";
import { ANTON, MONT } from "../../fonts";
import words from "./words.json";

/**
 * 19 Motor Trading — "Jualan Penghabisan Stok Motosikal Terpakai" event promo (26–29 Nov).
 * Multi-clip montage driven by the user's separate voice-over (public/event/vo.m4a).
 * User asked: combine all clips, cut what isn't needed, subtitles, make it hype ("gempak").
 * So: clean subtitles + bolder-than-minimal effects (flash cuts, whooshes, stress slams on the
 * dates and the promo price), upbeat music up between lines, 19MTR outro.
 */

const VO_END = 64.6; // seconds — voice-over ends at 63.6

/**
 * Output = voice-over sections with music-only b-roll "breathers" between them, so the whole
 * video lands on exactly 1:31 (user request) without slowing the voice down.
 * Fillers point at the VO's silent tail (64.2s+) and are muted.
 */
const FILL = 64.2;
const filler = (dur: number) => ({ start: FILL, end: FILL + dur, mute: true });
const SEGS = [
  filler(5.0), // teaser pre-roll
  { start: 0.0, end: 15.0 }, // event + dates
  filler(5.0),
  { start: 15.0, end: 31.2 }, // 100 bikes, price range
  filler(4.5),
  { start: 31.2, end: 47.85 }, // models
  filler(4.5),
  { start: 47.85, end: 60.3 }, // save the date + location
  filler(3.73),
  { start: 60.3, end: VO_END }, // DM
];

const base = createBase({
  clips: SEGS,
  faces: [[0, 0.3, 0.08, 0.4, 0.08], [70, 0.3, 0.08, 0.4, 0.08]],
  words,
  keywords: [],
});
const { tl } = base;
export const EVENT_FRAMES = tl.total + OUTRO_FRAMES - OUTRO_OVERLAP;
/** VO seconds → output frame (only for moments that are in a VO section). */
const F = (t: number) => {
  const c = tl.placed.find((c) => !c.mute && t >= c.srcStart - 1e-3 && t <= c.srcEnd + 1e-3);
  if (!c) throw new Error(`VO time ${t}s is not in the edit`);
  return c.from + Math.round((t - c.srcStart) * FPS);
};

/* ----------------------------- SHOT LIST ----------------------------- */
// VO-timed shots: [voFrom, voTo, clip, srcStart] — split onto the VO sections of the output
const VO_SHOTS: [number, number, number, number][] = [
  [0.0, 3.0, 7, 0.0], // wide: tents + banner
  [3.0, 6.0, 1, 0.0], // banner pan
  [6.0, 8.5, 5, 0.0], // crowd
  [8.5, 11.0, 6, 0.0], // crowd under tent
  [11.0, 15.0, 1, 13.5], // bikes under the tent
  [15.0, 19.0, 2, 0.0], // rows under tents
  [19.0, 23.0, 2, 32.0], // rows
  [23.0, 27.0, 2, 44.0], // rows
  [27.0, 31.2, 1, 28.0], // bikes + crowd
  [31.2, 34.4, 3, 17.0], // price tag close-up (EX5)
  [34.4, 36.2, 4, 0.0], // Y15
  [36.2, 38.3, 4, 4.0], // LC
  [38.3, 40.4, 4, 12.2], // yellow
  [40.4, 42.3, 4, 14.3], // red
  [42.3, 44.6, 3, 11.8], // scooter
  [44.6, 47.85, 3, 14.0], // scooter
  [47.85, 50.6, 4, 26.0], // RM4,999 → RM4,550 tag in hand
  [50.6, 52.0, 6, 5.6], // crowd
  [52.0, 55.0, 6, 2.5], // crowd
  [55.0, 59.0, 2, 66.0], // rows
  [59.0, 61.5, 5, 2.5], // crowd
  [61.5, VO_END, 1, 18.0], // crowd
];
// b-roll for each filler, in order: [clip, srcStart, seconds]
const FILLER_SHOTS: [number, number, number][][] = [
  [[1, 4.6, 1.25], [2, 11.0, 1.25], [6, 0.5, 1.25], [5, 3.0, 1.25]], // teaser: quick cuts
  [[2, 16.5, 2.5], [1, 32.0, 2.5]], // rows, crowd
  [[3, 0.0, 1.5], [3, 6.0, 1.5], [4, 8.2, 1.5]], // price-tag montage
  [[2, 49.0, 2.25], [2, 77.0, 2.25]], // rows
  [[7, 0.5, 3.73]], // wide tents
];

type Out = { from: number; frames: number; clip: number; src: number };
const SHOTS_OUT: Out[] = [];
for (const c of tl.placed.filter((c) => !c.mute)) {
  for (const [a, b, clip, src] of VO_SHOTS) {
    const lo = Math.max(a, c.srcStart), hi = Math.min(b, c.srcEnd);
    if (hi - lo < 0.2) continue;
    const from = c.from + Math.round((lo - c.srcStart) * FPS);
    const to = c.from + Math.round((hi - c.srcStart) * FPS);
    SHOTS_OUT.push({ from, frames: to - from, clip, src: src + (lo - a) });
  }
}
tl.placed.filter((c) => c.mute).forEach((c, k) => {
  let at = c.from;
  for (const [clip, src, sec] of FILLER_SHOTS[k]) {
    const n = Math.min(Math.round(sec * FPS), c.from + c.frames - at);
    SHOTS_OUT.push({ from: at, frames: n, clip, src });
    at += n;
  }
});
// section changes → flash + whoosh (start of every output section after the first)
const SECTION_FRAMES = tl.placed.slice(1).map((c) => c.from);

const Shot: React.FC<{ clip: number; srcStart: number; frames: number }> = ({ clip, srcStart, frames }) => {
  const frame = useCurrentFrame();
  const z = interpolate(frame, [0, frames], [1.04, 1.1]); // steady push-in keeps the montage moving
  return (
    <AbsoluteFill style={{ transform: `scale(${z})` }}>
      <OffthreadVideo
        src={staticFile(`event/f${clip}.mp4`)}
        trimBefore={Math.round(srcStart * FPS)}
        volume={0.12} // a little crowd ambience under the VO
        style={{ width: "100%", height: "100%", objectFit: "cover", filter: "contrast(1.08) saturate(1.2) brightness(1.03)" }}
      />
    </AbsoluteFill>
  );
};

/* ----------------------------- GRAPHICS ----------------------------- */

const EventTitle: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = spring({ frame, fps, config: { damping: 10, stiffness: 220, mass: 0.6 } });
  const b = spring({ frame: frame - 6, fps, config: { damping: 10, stiffness: 220, mass: 0.6 } });
  const c = spring({ frame: frame - 14, fps, config: { damping: 9, stiffness: 260, mass: 0.6 } });
  const out = interpolate(frame, [dur - 6, dur], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const shake = frame < 12 ? Math.sin(frame * 3) * 8 * (1 - frame / 12) : 0;
  const big = (txt: string, p: number, color: string, size: number) => (
    <div
      style={{
        fontFamily: ANTON,
        fontSize: size,
        lineHeight: 0.95,
        color,
        textTransform: "uppercase",
        WebkitTextStroke: `${size * 0.07}px #111`,
        paintOrder: "stroke fill",
        textShadow: `0 ${size * 0.07}px 0 #111`,
        transform: `scale(${interpolate(p, [0, 1], [2, 1])})`,
        opacity: Math.min(1, p * 2),
        whiteSpace: "nowrap",
      }}
    >
      {txt}
    </div>
  );
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start", paddingTop: 960, opacity: out }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, transform: `translateX(${shake}px)` }}>
        {big("Jualan", a, "#FFFFFF", 110)}
        {big("Penghabisan Stok", a, "#FFD60A", 112)}
        {big("Motosikal Terpakai", b, "#FFFFFF", 96)}
        <div
          style={{
            marginTop: 14,
            fontFamily: MONT,
            fontWeight: 900,
            fontSize: 44,
            whiteSpace: "nowrap",
            color: "#111",
            background: "#E22943",
            padding: "6px 26px",
            transform: `scale(${c}) rotate(-2deg)`,
            boxShadow: "0 6px 0 #111",
          }}
        >
          <span style={{ color: "#fff" }}>AKHIR TAHUN · 19 MOTOR TRADING</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** Big date slam: "26–29 NOV" with a ticking day counter. */
const DateSlam: React.FC<{ dur: number; kicker: string }> = ({ dur, kicker }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame, fps, config: { damping: 8, stiffness: 300, mass: 0.6 } });
  const k = spring({ frame: frame - 4, fps, config: { damping: 200 } });
  const flash = interpolate(frame, [0, 1, 4], [0, 0.7, 0], { extrapolateRight: "clamp" });
  const out = interpolate(frame, [dur - 6, dur], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: "#fff", opacity: flash }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 820, display: "flex", flexDirection: "column", alignItems: "center", opacity: out }}>
        <div
          style={{
            fontFamily: MONT,
            fontWeight: 900,
            fontSize: 48,
            color: "#111",
            background: "#FFD60A",
            padding: "4px 20px",
            clipPath: `inset(0 ${(1 - k) * 100}% 0 0)`,
            boxShadow: "0 6px 0 #111",
          }}
        >
          {kicker}
        </div>
        <div
          style={{
            fontFamily: ANTON,
            fontSize: 210,
            lineHeight: 1,
            marginTop: 10,
            color: "#fff",
            WebkitTextStroke: "14px #111",
            paintOrder: "stroke fill",
            textShadow: "0 14px 0 #E22943",
            transform: `scale(${interpolate(p, [0, 1], [2.4, 1])}) rotate(-3deg)`,
            opacity: Math.min(1, p * 2),
          }}
        >
          26–29 NOV
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** Model chips popping in on the beat of the list. */
const ModelChip: React.FC<{ dur: number; text: string }> = ({ dur, text }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame, fps, config: { damping: 9, stiffness: 300, mass: 0.5 } });
  const out = interpolate(frame, [dur - 5, dur], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 300, display: "flex", justifyContent: "center", opacity: out }}>
        <div
          style={{
            fontFamily: ANTON,
            fontSize: 130,
            color: "#FFD60A",
            WebkitTextStroke: "10px #111",
            paintOrder: "stroke fill",
            textShadow: "0 10px 0 #111",
            transform: `scale(${interpolate(p, [0, 1], [1.8, 1])}) rotate(${interpolate(p, [0, 1], [-10, -2])}deg)`,
            opacity: Math.min(1, p * 2),
            whiteSpace: "nowrap",
          }}
        >
          {text}
        </div>
      </div>
    </AbsoluteFill>
  );
};

type G = { from: number; to: number; el: (dur: number) => React.ReactNode; out?: boolean };
const GFX: G[] = [
  { from: 0.0, to: 9.6, el: (d) => <EventTitle dur={d} /> },
  { from: 9.9, to: 15.0, el: (d) => <DateSlam dur={d} kicker="Event akhir tahun" /> },
  { from: 18.7, to: 22.9, el: (d) => <PricePop dur={d} price={"±100\u00A0BIJI"} model="Motosikal terpakai" left={90} top={960} fontSize={160} /> },
  { from: 24.6, to: 28.0, el: (d) => <PricePop dur={d} price="< RM2,000" model="Harga semurah" left={90} top={960} fontSize={160} /> },
  { from: 28.0, to: 31.2, el: (d) => <PricePop dur={d} price="RM5,000+" model="Sampai" left={90} top={960} fontSize={160} /> },
  { from: 33.0, to: 34.4, el: (d) => <ModelChip dur={d} text="EX5" /> },
  { from: 34.9, to: 36.2, el: (d) => <ModelChip dur={d} text="Y15ZR" /> },
  { from: 36.4, to: 38.3, el: (d) => <ModelChip dur={d} text="LC135" /> },
  { from: 38.5, to: 40.4, el: (d) => <ModelChip dur={d} text="Honda Dash" /> },
  { from: 40.9, to: 42.3, el: (d) => <ModelChip dur={d} text="Kriss" /> },
  { from: 42.4, to: 44.6, el: (d) => <ModelChip dur={d} text="Skuter" /> },
  { from: 45.1, to: 47.8, el: (d) => <ModelChip dur={d} text="Avantiz · Solariz" /> },
  // promo price — STRESS (matches the hand-held RM4,999 → RM4,550 tag)
  { from: 47.85, to: 50.55, el: (d) => <StressHit dur={d} kind="promo" lines={["Harga dipotong!", "Tinggal RM4,550"]} top={250} left={90} /> },
  { from: 50.06, to: 55.0, el: (d) => <DateSlam dur={d} kicker="Save the date!" /> },
  { from: 56.9, to: 60.3, el: (d) => <QuoteLabel dur={d} lines={["📍 Wisma Mazra", "Sungai Petani"]} highlight={1} top={930} left={90} /> },
  { from: 60.4, to: VO_END, el: (d) => <QuoteLabel dur={d} lines={["DM kami", "Info lanjut di bio"]} highlight={1} top={930} left={90} badge={false} /> },
];

// graphics on the music-only fillers (output frames)
const fill = tl.placed.filter((c) => c.mute);
const FILL_GFX: { from: number; frames: number; el: (dur: number) => React.ReactNode }[] = [
  { from: fill[0].from + 4, frames: fill[0].frames - 4, el: (d) => <StressHit dur={d} kind="promo" lines={["Event akhir tahun", "100+ motor terpakai"]} top={890} left={90} /> },
  { from: fill[2].from, frames: fill[2].frames, el: (d) => <QuoteLabel dur={d} lines={["Harga potong", "habis-habisan!"]} highlight={1} top={250} left={90} badge={false} /> },
  { from: fill[4].from, frames: fill[4].frames, el: (d) => <QuoteLabel dur={d} lines={["26–29 Nov", "Wisma Mazra, Sungai Petani"]} highlight={0} top={930} left={90} badge={false} /> },
];

type S = { frame: number; name: string; vol: number };
const vo = (t: number, name: string, vol: number): S => ({ frame: F(t), name, vol });
const SFX: S[] = [
  // teaser
  { frame: 0, name: "impact", vol: 0.55 },
  { frame: 4, name: "cash", vol: 0.45 },
  ...[1, 2, 3].map((k) => ({ frame: fill[0].from + Math.round(k * 1.25 * FPS) - 3, name: "whoosh", vol: 0.25 })),
  // every section change
  ...SECTION_FRAMES.map((fr) => ({ frame: Math.max(0, fr - 4), name: "whoosh", vol: 0.35 })),
  // price-tag montage cuts
  ...[1, 2].map((k) => ({ frame: fill[2].from + Math.round(k * 1.5 * FPS), name: "click", vol: 0.35 })),
  vo(9.9, "stamp", 0.55),
  vo(18.8, "pop", 0.4),
  vo(24.7, "cash", 0.4),
  vo(28.1, "cash", 0.4),
  ...[33.0, 34.9, 36.4, 38.5, 40.9, 42.4, 45.1].map((t) => vo(t, "pop", 0.38)),
  vo(47.9, "cash", 0.5),
  vo(50.06, "stamp", 0.55),
  vo(60.4, "notif", 0.45),
];

/* ----------------------------- MUSIC ----------------------------- */
const T = EVENT_FRAMES;
const speaking = new Float32Array(T);
for (const [a, b] of base.speech) for (let i = Math.max(0, a - 3); i < Math.min(T, b + 3); i++) speaking[i] = 1;
const duck = new Float32Array(T);
for (let i = 0; i < T; i++) {
  let s = 0, n = 0;
  for (let k = -8; k <= 8; k++) if (i + k >= 0 && i + k < T) { s += speaking[i + k]; n++; }
  duck[i] = s / n;
}
const musicVolume = (fr: number) => {
  const base = 0.38 + (0.1 - 0.38) * (duck[fr] ?? 1); // louder than usual: hype promo
  const fadeIn = interpolate(fr, [0, 8], [0.5, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(fr, [T - 45, T], [1, 0], { extrapolateLeft: "clamp" });
  return base * fadeIn * fadeOut;
};

/* ----------------------------- COMPOSITION ----------------------------- */

const Flash: React.FC = () => {
  const fr = useCurrentFrame();
  return <AbsoluteFill style={{ background: "#fff", opacity: interpolate(fr, [0, 1, 5], [0, 0.85, 0], { extrapolateRight: "clamp" }) }} />;
};

export const EventPromo: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    {SHOTS_OUT.map((sh, i) => (
      <Sequence key={`s${i}`} from={sh.from} durationInFrames={sh.frames} name={`shot ${i} · f${sh.clip}@${sh.src.toFixed(1)}`}>
        <Shot clip={sh.clip} srcStart={sh.src} frames={sh.frames} />
      </Sequence>
    ))}
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.35) 100%), linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0) 16%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.4) 100%)",
      }}
    />

    {GFX.map((g, i) => (
      <Sequence key={`g${i}`} from={F(g.from)} durationInFrames={F(g.to) - F(g.from)}>
        {g.el(F(g.to) - F(g.from))}
      </Sequence>
    ))}
    {FILL_GFX.map((g, i) => (
      <Sequence key={`fg${i}`} from={g.from} durationInFrames={g.frames}>
        {g.el(g.frames)}
      </Sequence>
    ))}

    <CleanCaptions pages={base.captions} hiddenRanges={[[F(0), F(9.6)], [F(9.9), F(15.0)], [F(50.06), F(55.0)]]} />

    {[...SECTION_FRAMES, F(3.0)].map((fr, i) => (
      <Sequence key={`fl${i}`} from={fr} durationInFrames={6}>
        <Flash />
      </Sequence>
    ))}

    <Sequence from={tl.total - OUTRO_OVERLAP} durationInFrames={OUTRO_FRAMES} name="outro">
      <Outro19 />
    </Sequence>

    {tl.placed
      .filter((c) => !c.mute)
      .map((c, i) => (
        <Sequence key={`vo${i}`} from={c.from} durationInFrames={c.frames}>
          <Audio src={staticFile("event/vo.m4a")} trimBefore={Math.round(c.srcStart * FPS)} trimAfter={Math.round(c.srcStart * FPS) + c.frames} />
        </Sequence>
      ))}
    <Audio src={staticFile("music/getting_it_done.mp3")} volume={musicVolume} loop />
    {SFX.map((s, i) => (
      <Sequence key={`x${i}`} from={s.frame}>
        <Audio src={staticFile(`sfx/${s.name}.wav`)} volume={s.vol} />
      </Sequence>
    ))}
  </AbsoluteFill>
);
