import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { CAPTION_PAGES } from "../data/captions";
import { C, MONT } from "../fonts";
import { SAFE, SAFE_CX, SAFE_W } from "../safe";

// Word-by-word "karaoke" captions. Sit at ~y=1330, just above the TikTok/IG
// bottom UI and well below the face (face never goes lower than ~y=1060).
const CAPTION_Y = 1300;

export const Captions: React.FC<{ hiddenRanges: [number, number][] }> = ({ hiddenRanges }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (hiddenRanges.some(([a, b]) => frame >= a && frame < b)) return null;

  const page = CAPTION_PAGES.find((p) => frame >= p.from && frame < p.to);
  if (!page) return null;

  const enter = spring({ frame: frame - page.from, fps, config: { damping: 14, stiffness: 220 } });

  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: SAFE.left,
          width: SAFE_W,
          top: CAPTION_Y,
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "center",
          gap: "6px 16px",
          transform: `translateY(${interpolate(enter, [0, 1], [24, 0])}px) scale(${interpolate(enter, [0, 1], [0.9, 1])})`,
          transformOrigin: `${SAFE_CX - SAFE.left}px 50%`,
          opacity: enter,
        }}
      >
        {page.words.map((w, i) => {
          const active = frame >= w.from && frame < w.to;
                    const pop = spring({ frame: frame - w.from, fps, config: { damping: 10, stiffness: 300 }, durationInFrames: 8 });
          const color = w.hl ? C.yellow : C.white;
          return (
            <span
              key={i}
              style={{
                fontFamily: MONT,
                fontWeight: 900,
                fontSize: w.hl ? 76 : 66,
                lineHeight: 1.08,
                textTransform: "uppercase",
                color,
                letterSpacing: -0.5,
                padding: "2px 12px",
                borderRadius: 14,
                background: active ? (w.hl ? C.red : C.blue) : "transparent",
                transform: `scale(${active ? 1 + 0.08 * pop : 1}) rotate(${active ? -2 : 0}deg)`,
                WebkitTextStroke: active ? "0px" : "3px #000",
                paintOrder: "stroke fill",
                textShadow: "0 6px 18px rgba(0,0,0,0.55), 0 2px 0 #000",
              }}
            >
              {w.text}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
