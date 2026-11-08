import React from "react";
import { AbsoluteFill, Audio, Easing, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { MONT } from "../fonts";
import { SEAM, TT } from "./tastech-paths";

/**
 * Tas Tech outro (4s), built from the traced logo:
 *  1. blue panel wipes up on a 30° edge (the logo's isometric angle) with yellow trim
 *  2. the three blocks slide in along the isometric axis, left → middle → right
 *  3. the mark settles, ® pops in (registered trademark)
 *  4. light sweep across the blocks, then name / services / location / CTA
 */

export const TT_BRAND = { blue: "#0C2AB0", yellow: "#FEC401", white: "#FFFFFF" };
export const TT_OUTRO_FRAMES = 120;
export const TT_OUTRO_OVERLAP = 10;

const ease = Easing.bezier(0.16, 1, 0.3, 1);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export type TasTechOutroProps = {
  name?: string;
  sub?: string;
  cta?: string;
  sound?: boolean;
};

export const OutroTasTech: React.FC<TasTechOutroProps> = ({
  name = "TAS TECH",
  sub = "Repair Phone · TV · Laptop",
  cta = "Sungai Petani · DM / Lokasi kat bio",
  sound = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 1. wipe with a 30° edge: rises 623px across the 1080px width
  const SLOPE = 623;
  const wipe = interpolate(frame, [0, 14], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const edgeY = interpolate(wipe, [0, 1], [1920 + SLOPE, -40]);
  const panel = `polygon(0 ${edgeY}px, 100% ${edgeY - SLOPE}px, 100% 100%, 0 100%)`;
  const trim = `polygon(0 ${edgeY - 24}px, 100% ${edgeY - SLOPE - 24}px, 100% ${edgeY - SLOPE}px, 0 ${edgeY}px)`;

  // 2. blocks slide in along the isometric axis (down-left → place)
  const block = (start: number) => interpolate(frame, [start, start + 16], [0, 1], { ...clamp, easing: ease });
  const b = [block(10), block(15), block(20)];
  const off = (t: number) => `translate(${-(1 - t) * 90} ${(1 - t) * 52})`;

  // 3. settle + ®
  const settle = spring({ frame: frame - 34, fps, config: { damping: 12, stiffness: 200 } });
  const markScale = frame < 34 ? 1 : 1 + 0.04 * Math.sin(Math.min(1, settle) * Math.PI);
  const reg = spring({ frame: frame - 38, fps, config: { damping: 10, stiffness: 260, mass: 0.5 } });

  // 4. shine + text
  const shine = interpolate(frame, [44, 66], [150, 1500], clamp); // skewX(-30) shifts left by ~0.58·y, so travel well past the mark
  const shineOn = frame >= 44 && frame <= 66 ? 1 : 0;
  const nameIn = interpolate(frame, [46, 60], [0, 1], { ...clamp, easing: ease });
  const subIn = interpolate(frame, [54, 68], [0, 1], { ...clamp, easing: ease });
  const ctaIn = interpolate(frame, [62, 76], [0, 1], { ...clamp, easing: ease });

  // mark bbox in viewBox ≈ x 246–754, y 272–728 → ~600px wide, centred, top ≈ 400px
  const S = 1.18;
  const left = 540 - 500 * S;
  const top = 400 - 272 * S;

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: TT_BRAND.yellow, clipPath: trim }} />
      <AbsoluteFill style={{ background: TT_BRAND.blue, clipPath: panel }} />

      <div style={{ position: "absolute", left, top, width: 1000 * S, height: 1000 * S, transform: `scale(${markScale})`, transformOrigin: "50% 50%" }}>
        <svg width={1000 * S} height={1000 * S} viewBox="0 0 1000 1000" style={{ overflow: "visible" }}>
          <defs>
            <clipPath id="ttLeft">
              <rect x={0} y={0} width={SEAM} height={1000} />
            </clipPath>
            <clipPath id="ttMid">
              <rect x={SEAM} y={0} width={1000 - SEAM} height={1000} />
            </clipPath>
            <clipPath id="ttAll">
              <path d={TT.leftMid} />
              <path d={TT.right} />
            </clipPath>
            <linearGradient id="ttShine" x1="0" x2="1">
              <stop offset="0" stopColor="#fff" stopOpacity="0" />
              <stop offset="0.5" stopColor="#FFF4C2" stopOpacity="0.95" />
              <stop offset="1" stopColor="#fff" stopOpacity="0" />
            </linearGradient>
          </defs>

          <g transform={off(b[0])} opacity={Math.min(1, b[0] * 2)}>
            <g clipPath="url(#ttLeft)">
              <path d={TT.leftMid} fill={TT_BRAND.yellow} />
            </g>
          </g>
          <g transform={off(b[1])} opacity={Math.min(1, b[1] * 2)}>
            <g clipPath="url(#ttMid)">
              <path d={TT.leftMid} fill={TT_BRAND.yellow} />
            </g>
          </g>
          <g transform={off(b[2])} opacity={Math.min(1, b[2] * 2)}>
            <path d={TT.right} fill={TT_BRAND.yellow} />
          </g>

          {/* light sweep along the isometric angle */}
          <g clipPath="url(#ttAll)">
            <rect x={shine} y={200} width={90} height={620} fill="url(#ttShine)" transform="skewX(-30)" opacity={shineOn} />
          </g>

          {/* ® — registered trademark, top-right of the mark */}
          <text
            x={764}
            y={392}
            fill={TT_BRAND.white}
            fontFamily={MONT}
            fontWeight={700}
            fontSize={44}
            opacity={Math.min(1, reg * 2)}
            transform={`translate(780 378) scale(${reg}) translate(-780 -378)`}
          >
            ®
          </text>
        </svg>
      </div>

      <div style={{ position: "absolute", top: 1100, width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
        <div
          style={{
            fontFamily: MONT,
            fontWeight: 900,
            fontSize: 76,
            letterSpacing: 8,
            color: TT_BRAND.white,
            clipPath: `inset(0 ${(1 - nameIn) * 50}% 0 ${(1 - nameIn) * 50}%)`,
          }}
        >
          {name}
        </div>
        <div
          style={{
            fontFamily: MONT,
            fontWeight: 800,
            fontSize: 38,
            color: TT_BRAND.blue,
            background: TT_BRAND.yellow,
            padding: "6px 22px",
            opacity: subIn,
            transform: `translateY(${(1 - subIn) * 16}px)`,
          }}
        >
          {sub}
        </div>
        {cta && (
          <div
            style={{
              fontFamily: MONT,
              fontWeight: 700,
              fontSize: 34,
              color: TT_BRAND.white,
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
          <Sequence from={34}>
            <Audio src={staticFile("sfx/pop.wav")} volume={0.4} />
          </Sequence>
        </>
      )}
    </AbsoluteFill>
  );
};

export const OutroTasTechPreview: React.FC<TasTechOutroProps> = (props) => (
  <AbsoluteFill style={{ background: "#000" }}>
    <OutroTasTech {...props} />
  </AbsoluteFill>
);
