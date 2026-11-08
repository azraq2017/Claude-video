import React from "react";
import { AbsoluteFill, Audio, Easing, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { MONT } from "../fonts";
import { LOGO } from "./logo-paths";

/**
 * 19 Motor Trading outro (4s). Built from the traced logo so every part animates:
 *  1. navy panel wipes up with a 45° edge (the logo's chamfer angle) + red trim
 *  2. M, T, R rise one by one
 *  3. "19" drops in and lands (one soft hit)
 *  4. the six wing bars slide out from the 19
 *  5. light sweep across MTR, then name + location line
 * Ends on a held logo so it also works as the last frame / loop point.
 */

export const BRAND = { navy: "#1F334C", red: "#E22943", white: "#FFFFFF" };
export const OUTRO_FRAMES = 120;
/** Frames the outro wipe overlaps the end of the video before it. */
export const OUTRO_OVERLAP = 10;

const ease = Easing.bezier(0.16, 1, 0.3, 1);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export type OutroProps = {
  name?: string;
  sub?: string;
  cta?: string;
  sound?: boolean;
};

export const Outro19: React.FC<OutroProps> = ({
  name = "19 MOTOR TRADING",
  sub = "Sungai Petani, Kedah",
  cta = "DM · Lokasi kat bio",
  sound = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 1. wipe: panel with a 45° top edge travels from below the frame to fully covering it
  const wipe = interpolate(frame, [0, 14], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const edgeY = interpolate(wipe, [0, 1], [1920 + 1080, -40]); // y of the edge at x=0
  const panel = `polygon(0 ${edgeY}px, 100% ${edgeY - 1080}px, 100% 100%, 0 100%)`;
  const trim = `polygon(0 ${edgeY - 26}px, 100% ${edgeY - 1106}px, 100% ${edgeY - 1080}px, 0 ${edgeY}px)`;

  // 2. letters rise (reveal from the bottom of each band)
  const rise = (start: number) => interpolate(frame, [start, start + 16], [0, 1], { ...clamp, easing: ease });
  const bands = [
    { x0: 230, x1: 408, t: rise(10) },
    { x0: 408, x1: 592, t: rise(14) },
    { x0: 592, x1: 770, t: rise(18) },
  ];

  // 3. "19" drops and lands
  const drop = spring({ frame: frame - 22, fps, config: { damping: 11, stiffness: 180, mass: 0.7 } });
  const nineY = interpolate(drop, [0, 1], [-140, 0]);
  const nineS = interpolate(drop, [0, 1], [1.25, 1]);

  // 4. wings slide out from the 19 (bar 1 first)
  const wing = (i: number) => interpolate(frame, [30 + i * 3, 42 + i * 3], [0, 1], { ...clamp, easing: ease });

  // 5. shine + text
  const shine = interpolate(frame, [46, 66], [-300, 1300], clamp);
  const nameIn = interpolate(frame, [48, 62], [0, 1], { ...clamp, easing: ease });
  const subIn = interpolate(frame, [56, 70], [0, 1], { ...clamp, easing: ease });
  const ctaIn = interpolate(frame, [64, 78], [0, 1], { ...clamp, easing: ease });

  // logo placement: content bbox in viewBox ≈ x 234–766, y 163–837 → ~560px wide, centred, top ≈ 330px
  const S = 1.06;
  const logoLeft = 540 - 500 * S;
  const logoTop = 410 - 163 * S;

  return (
    <AbsoluteFill>
      {/* panel + red trim */}
      <AbsoluteFill style={{ background: BRAND.red, clipPath: trim }} />
      <AbsoluteFill style={{ background: BRAND.navy, clipPath: panel }} />

      <div style={{ position: "absolute", left: logoLeft, top: logoTop, width: 1000 * S, height: 1000 * S }}>
        <svg width={1000 * S} height={1000 * S} viewBox="0 0 1000 1000" style={{ overflow: "visible" }}>
          <defs>
            {bands.map((b, i) => (
              <clipPath id={`band${i}`} key={i}>
                <rect x={b.x0 - 1.5} y={837 - (837 - 340) * b.t} width={b.x1 - b.x0 + 3} height={(837 - 340) * b.t + 2} />
              </clipPath>
            ))}
            <clipPath id="mtrClip">
              <path d={`${LOGO.mtr} ${LOGO.rHole}`} clipRule="evenodd" />
            </clipPath>
            <linearGradient id="shine" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0" stopColor="#fff" stopOpacity="0" />
              <stop offset="0.5" stopColor="#C9D6E8" stopOpacity="0.9" />
              <stop offset="1" stopColor="#fff" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* MTR, one band per letter (whole shape once all three have landed → no seams) */}
          {bands.every((b) => b.t >= 1) ? (
            <path d={`${LOGO.mtr} ${LOGO.rHole}`} fill={BRAND.white} fillRule="evenodd" />
          ) : bands.map((b, i) => (
            <g key={i} clipPath={`url(#band${i})`} transform={`translate(0 ${(1 - b.t) * 40})`}>
              <path d={`${LOGO.mtr} ${LOGO.rHole}`} fill={BRAND.white} fillRule="evenodd" />
            </g>
          ))}
          {/* light sweep across the letters */}
          <g clipPath="url(#mtrClip)">
            <rect x={shine} y={300} width={140} height={600} fill="url(#shine)" transform={`skewX(-20)`} />
          </g>

          {/* "19" */}
          <g
            transform={`translate(500 241) scale(${nineS}) translate(-500 -241) translate(0 ${nineY})`}
            opacity={Math.min(1, drop * 3)}
          >
            <path d={LOGO.one} fill={BRAND.red} />
            <path d={`${LOGO.nine} ${LOGO.nineHole}`} fill={BRAND.red} fillRule="evenodd" />
          </g>

          {/* wings: slide outward from the 19 */}
          {(["wingL1", "wingL2", "wingL3"] as const).map((k, i) => (
            <g key={k} transform={`translate(${(1 - wing(i)) * 70} 0)`} opacity={wing(i)}>
              <path d={LOGO[k]} fill={BRAND.red} />
            </g>
          ))}
          {(["wingR1", "wingR2", "wingR3"] as const).map((k, i) => (
            <g key={k} transform={`translate(${-(1 - wing(i)) * 70} 0)`} opacity={wing(i)}>
              <path d={LOGO[k]} fill={BRAND.red} />
            </g>
          ))}
        </svg>
      </div>

      {/* name + location + CTA */}
      <div style={{ position: "absolute", top: 1190, width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
        <div
          style={{
            fontFamily: MONT,
            fontWeight: 900,
            fontSize: 64,
            letterSpacing: 6,
            color: BRAND.white,
            clipPath: `inset(0 ${(1 - nameIn) * 50}% 0 ${(1 - nameIn) * 50}%)`,
          }}
        >
          {name}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, opacity: subIn, transform: `translateY(${(1 - subIn) * 16}px)` }}>
          <div style={{ width: 44 * subIn, height: 6, background: BRAND.red }} />
          <div style={{ fontFamily: MONT, fontWeight: 700, fontSize: 40, color: BRAND.white, letterSpacing: 1 }}>{sub}</div>
          <div style={{ width: 44 * subIn, height: 6, background: BRAND.red }} />
        </div>
        {cta && (
          <div
            style={{
              marginTop: 10,
              fontFamily: MONT,
              fontWeight: 800,
              fontSize: 36,
              color: BRAND.navy,
              background: BRAND.white,
              padding: "8px 24px",
              opacity: ctaIn,
              transform: `translateY(${(1 - ctaIn) * 16}px)`,
            }}
          >
            {cta}
          </div>
        )}
      </div>

      {sound && (
        <>
          <Sequence from={0}>
            <Audio src={staticFile("sfx/whoosh.wav")} volume={0.3} />
          </Sequence>
          <Sequence from={24}>
            <Audio src={staticFile("sfx/stamp.wav")} volume={0.4} />
          </Sequence>
        </>
      )}
    </AbsoluteFill>
  );
};

/** Standalone composition (black behind the wipe, as it would sit after a video). */
export const OutroPreview: React.FC<OutroProps> = (props) => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Outro19 {...props} />
  </AbsoluteFill>
);
