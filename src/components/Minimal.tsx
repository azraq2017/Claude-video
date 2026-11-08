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
}> = ({ lines, dur, highlight, left = 250, top = 1090, fontSize = 60 }) => {
  const frame = useCurrentFrame();
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
