import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { MONT } from "../fonts";

/**
 * MINIMAL STYLE — learned from the "Beli motor bajet RM1500" reference video.
 *
 *  - One quiet label up front: teal quote badge + black bold text on white
 *    line-boxes, left-aligned, at body height (never on the face).
 *  - No karaoke captions, no stickers, no SFX beds.
 *  - The ONLY loud moments are "stress" hits on: trade-in, jackpot price, promotion.
 */

export const MIN = {
  teal: "#2FA894",
  ink: "#111111",
  paper: "#FFFFFF",
  stress: "#FFD60A", // highlight colour used only for stress hits
};

/* ------------------------------------------------------------------ */
/* Quote label (the reference's only on-screen text)                   */
/* ------------------------------------------------------------------ */

export const QuoteBadge: React.FC<{ size?: number; bg?: string }> = ({ size = 68, bg = MIN.teal }) => (
  <div
    style={{
      width: size * 1.45,
      height: size,
      background: bg,
      borderRadius: 6,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <svg width={size * 0.7} height={size * 0.5} viewBox="0 0 28 20">
      <path
        d="M2 20 V11 C2 5 5 1.5 11 0 L12 3 C8.5 4.5 7.5 6.5 7.5 9 H12 V20 Z M16 20 V11 C16 5 19 1.5 25 0 L26 3 C22.5 4.5 21.5 6.5 21.5 9 H26 V20 Z"
        fill="#fff"
      />
    </svg>
  </div>
);

/**
 * Left-aligned label: badge on top, then one white box per line.
 * `highlight` (0-based line index) paints that line yellow — used for prices.
 */
export const QuoteLabel: React.FC<{
  lines: string[];
  dur: number;
  highlight?: number;
  left?: number;
  top?: number;
  fontSize?: number;
}> = ({ lines, dur, highlight, left: leftIn = 250, top = 1090, fontSize: fsIn }) => {
  const frame = useCurrentFrame();
  // auto-fit inside the safe zone (right edge x=930): shrink, and if still long, start further left
  const maxChars = Math.max(...lines.map((l) => [...l].length));
  const fit = (l: number) => Math.floor((930 - l) / (maxChars * 0.6 + 0.5));
  let left = leftIn;
  let fontSize = fsIn ?? Math.min(60, fit(left));
  if (!fsIn && fontSize < 50) {
    left = Math.max(80, Math.min(leftIn, 930 - Math.ceil(maxChars * 0.6 + 0.5) * 54));
    fontSize = Math.min(60, fit(left));
  }
  const { fps } = useVideoConfig();
  // gentle: fade/slide in, fade out. No bounce — this is the calm style.
  const inn = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const out = interpolate(frame, [dur - 8, dur], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const v = Math.min(inn, out);
  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left,
          top,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: 6,
          opacity: v,
          transform: `translateX(${interpolate(inn, [0, 1], [-24, 0])}px)`,
        }}
      >
        <div style={{ marginBottom: 8 }}>
          <QuoteBadge size={fontSize * 1.1} />
        </div>
        {lines.map((l, i) => {
          const d = spring({ frame: frame - 3 - i * 3, fps, config: { damping: 200 } });
          return (
            <div
              key={i}
              style={{
                fontFamily: MONT,
                fontWeight: 800,
                fontSize,
                lineHeight: 1.18,
                color: MIN.ink,
                background: i === highlight ? MIN.stress : MIN.paper,
                padding: `0 ${fontSize * 0.22}px`,
                whiteSpace: "nowrap",
                clipPath: `inset(0 ${(1 - d) * 100}% 0 0)`,
              }}
            >
              {l}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* Stress hit — ONLY for trade-in / jackpot price / promotion          */
/* ------------------------------------------------------------------ */

export type StressKind = "trade-in" | "jackpot" | "promo";

const STRESS_TAG: Record<StressKind, string> = {
  "trade-in": "TRADE-IN",
  jackpot: "HARGA JACKPOT",
  promo: "PROMOSI",
};

/**
 * A short, loud beat: 3-frame white flash + punch-in (Project.punches, applied by Edit)
 * + the same quote label but with a yellow tag line that slams in and shakes.
 */
export const StressHit: React.FC<{
  kind: StressKind;
  lines: string[];
  dur: number;
  left?: number;
  top?: number;
}> = ({ kind, lines, dur, left = 250, top = 1040 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const flash = interpolate(frame, [0, 1, 4], [0, 0.7, 0], { extrapolateRight: "clamp" });
  const slam = spring({ frame, fps, config: { damping: 9, stiffness: 320, mass: 0.6 } });
  const shake = frame < 10 ? Math.sin(frame * 3.2) * 6 * (1 - frame / 10) : 0;
  const out = interpolate(frame, [dur - 8, dur], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: "#fff", opacity: flash }} />
      <div
        style={{
          position: "absolute",
          left,
          top,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: 6,
          opacity: out,
          transform: `translateX(${shake}px)`,
        }}
      >
        <div
          style={{
            fontFamily: MONT,
            fontWeight: 900,
            fontSize: 62,
            lineHeight: 1.1,
            color: MIN.ink,
            background: MIN.stress,
            padding: "2px 18px",
            transform: `scale(${interpolate(slam, [0, 1], [1.8, 1])}) rotate(-2deg)`,
            transformOrigin: "0% 50%",
            opacity: Math.min(1, slam * 2),
            boxShadow: "0 8px 0 #000",
          }}
        >
          {STRESS_TAG[kind]}
        </div>
        {lines.map((l, i) => {
          const d = spring({ frame: frame - 6 - i * 3, fps, config: { damping: 200 } });
          return (
            <div
              key={i}
              style={{
                fontFamily: MONT,
                fontWeight: 800,
                fontSize: 60,
                lineHeight: 1.18,
                color: MIN.ink,
                background: MIN.paper,
                padding: "0 13px",
                whiteSpace: "nowrap",
                clipPath: `inset(0 ${(1 - d) * 100}% 0 0)`,
              }}
            >
              {l}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/** Words that trigger a stress hit (Malay + English, as spoken in the videos). */
export const STRESS_TRIGGERS: Record<StressKind, RegExp> = {
  "trade-in": /^(trade-?in|tolak|try-?in)$/i,
  jackpot: /^(jackpot|bertuah|termurah|serendah|gila-gila)$/i,
  promo: /^(promo|promosi|promotion|diskaun|discount|offer|free|percuma|sale)$/i,
};

/* ------------------------------------------------------------------ */
/* Price pop — learned from the "Motor lelong minggu ini" reference    */
/* ------------------------------------------------------------------ */

/**
 * Big yellow→orange price with a thick black outline and thin white rim.
 * Characters pop in one by one (~2 frames each) with a small tilt that settles,
 * starting on the spoken price. Place it on/next to the bike being discussed,
 * never on a face. Optional small model tag above, in the quote-label style.
 */
export const PricePop: React.FC<{
  price: string;
  dur: number;
  model?: string;
  left: number;
  top: number;
  fontSize?: number;
}> = ({ price, dur, model, left, top, fontSize = 120 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const out = interpolate(frame, [dur - 6, dur], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const chars = [...price];
  const PER = 2; // frames per character
  const tag = model ? interpolate(frame, [chars.length * PER, chars.length * PER + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }) : 0;
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left, top, opacity: out, display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
        {model && (
          <div
            style={{
              fontFamily: MONT,
              fontWeight: 800,
              fontSize: fontSize * 0.36,
              color: MIN.ink,
              background: MIN.paper,
              padding: `0 ${fontSize * 0.1}px`,
              marginBottom: 4,
              marginLeft: fontSize * 0.06,
              clipPath: `inset(0 ${(1 - tag) * 100}% 0 0)`,
              whiteSpace: "nowrap",
            }}
          >
            {model}
          </div>
        )}
        <div style={{ display: "flex", whiteSpace: "nowrap" }}>
          {chars.map((ch, i) => {
            const p = spring({ frame: frame - i * PER, fps, config: { damping: 10, stiffness: 300, mass: 0.5 } });
            if (frame < i * PER) return <span key={i} style={{ opacity: 0, fontSize, fontFamily: MONT, fontWeight: 900 }}>{ch}</span>;
            const base: React.CSSProperties = {
              gridArea: "1 / 1",
              fontFamily: MONT,
              fontWeight: 900,
              fontSize,
              lineHeight: 1,
            };
            const k = fontSize * 0.06; // outline width
            return (
              <span
                key={i}
                style={{
                  display: "inline-grid",
                  transform: `scale(${interpolate(p, [0, 1], [1.5, 1])}) rotate(${interpolate(p, [0, 1], [-14, 0])}deg)`,
                  transformOrigin: "50% 90%",
                  filter: `drop-shadow(0 ${fontSize * 0.04}px 0 rgba(0,0,0,0.35))`,
                }}
              >
                {/* 1: thin white rim */}
                <span style={{ ...base, color: "#fff", WebkitTextStroke: `${k * 2 + fontSize * 0.05}px #fff` }}>{ch}</span>
                {/* 2: thick black outline */}
                <span style={{ ...base, color: "#111", WebkitTextStroke: `${k * 2}px #111` }}>{ch}</span>
                {/* 3: gradient fill */}
                <span
                  style={{
                    ...base,
                    background: "linear-gradient(180deg, #FFE14D 0%, #FFC21A 55%, #F59E0B 100%)",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    color: "transparent",
                  }}
                >
                  {ch}
                </span>
              </span>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
