import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { PricePop, QuoteLabel } from "../../components/Minimal";
import { MONT } from "../../fonts";
import { createBase, Gfx, Project } from "../../project";
import edl from "./edl.json";
import words from "./words.json";
import faces from "./faces.json";

/**
 * Video 24 — 19 Motor Trading "event jualan clear stock motor terpakai" (Kamis–Ahad, 26–29).
 * USER: "only add infographics where a date, day, event or price is mentioned — nothing else".
 * So: full take, original picture and original audio untouched (no cuts, no music, no SFX,
 * no subtitles, no zoom, no outro). Graphics sit low (y≈1180) under the held sign / faces,
 * inside the TikTok/IG safe zone.
 */
const base = createBase({ clips: edl, faces: faces as number[][], words, keywords: [] });
const { gfx, tl } = base;

const fixed = (g: Gfx): Gfx => ({ ...g, place: "fixed" });
const TOP = 1180;
const L = (from: number, to: number, lines: string[], highlight?: number) =>
  fixed(gfx(from, to, 0, (d) => <QuoteLabel dur={d} lines={lines} highlight={highlight} top={TOP} left={90} />));
const P = (from: number, to: number, price: string, model?: string) =>
  fixed(gfx(from, to, 0, (d) => <PricePop dur={d} price={price} model={model} left={90} top={TOP} fontSize={140} />));

/** Day chips that light up as each day is spoken. */
const Days: React.FC<{ dur: number; at: number[] }> = ({ dur, at }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const out = interpolate(frame, [dur - 8, dur], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const days = ["Khamis", "Jumaat", "Sabtu", "Ahad"];
  const dates = ["26", "27", "28", "29"];
  return (
    <div style={{ position: "absolute", left: 90, top: TOP, display: "flex", gap: 12, opacity: out }}>
      {days.map((d, i) => {
        const p = spring({ frame: frame - at[i], fps, config: { damping: 12, stiffness: 260, mass: 0.5 } });
        if (frame < at[i] - 1) return null;
        return (
          <div
            key={d}
            style={{
              transform: `translateY(${interpolate(p, [0, 1], [30, 0])}px)`,
              opacity: Math.min(1, p * 2),
              background: "#fff",
              border: "4px solid #111",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              width: 175,
            }}
          >
            <div style={{ width: "100%", textAlign: "center", background: "#FFD60A", fontFamily: MONT, fontWeight: 900, fontSize: 30, color: "#111", padding: "4px 0" }}>
              {d.toUpperCase()}
            </div>
            <div style={{ fontFamily: MONT, fontWeight: 900, fontSize: 64, color: "#111", lineHeight: 1.1 }}>{dates[i]}</div>
            <div style={{ fontFamily: MONT, fontWeight: 800, fontSize: 22, color: "#555", paddingBottom: 4 }}>NOV</div>
          </div>
        );
      })}
    </div>
  );
};

const GRAPHICS: Gfx[] = [
  // EVENT
  L(4.0, 9.4, ["Event Jualan", "Clear Stock", "Motor Terpakai"], 1),
  // DATE
  L(9.5, 13.7, ["📅 26 – 29 November"], 0),
  // DAYS
  fixed(gfx(13.7, 16.0, 0, (d, r) => <Days dur={d} at={[r(13.78), r(14.26), r(14.66), r(15.1)]} />)),
  // PRICE (cut prices for the sale)
  L(16.06, 21.3, ["Harga dipotong", "untuk lelong!"], 0),
  // DAYS / event length
  L(53.5, 57.5, ["4 hari sahaja!", "Lepas event,", "harga kembali normal"], 0),
  // PRICES — Lagenda example
  P(58.9, 63.8, "RM3,500", "Lagenda · masa event"),
  L(64.06, 66.6, ["Harga biasa: RM3,999", "(hampir RM4,000)"]),
  P(67.8, 69.7, "RM3,500", "Lagenda ni"),
  P(70.3, 74.3, "RM2,600", "Lagenda lagi murah"),
  // DAY / TIME
  L(92.3, 99.5, ["📅 26 – 29 Nov", "4 hari sahaja", "🕚 11 pagi – 7 malam"], 2),
];

export const eventClearStock: Project = {
  id: "EventClearStock",
  media: { video: "v24/source.mp4", voice: "v24/voice.m4a", music: "music/funky_chunk.mp3" },
  tl,
  face: base.face,
  captions: base.captions,
  speech: base.speech,
  graphics: GRAPHICS,
  sfx: [],
  flashCuts: [],
  captionMode: "none",
  plain: true,
  musicLevels: { underVoice: 0, open: 0 }, // no music (user: nothing else edited)
};
