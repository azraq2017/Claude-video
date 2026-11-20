import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {FPS, placed as defaultPlaced, Placed, Word} from './edl';

// Word-by-word karaoke captions, max 3 words per chunk.
// Sits at y≈1450: under the phone, above the TikTok/IG caption + username zone.
export const CAPTION_Y = 1450;

type OutWord = Word & {fs: number; fe: number};
type Chunk = {words: OutWord[]; fs: number; fe: number};

const buildChunks = (placed: Placed[]): Chunk[] => {
  const out: Chunk[] = [];
  for (const p of placed) {
    const ws: OutWord[] = p.words.map((w) => ({
      ...w,
      fs: p.from + Math.max(0, Math.round((w.s - p.a[0]) * FPS)),
      fe: p.from + Math.min(p.dur, Math.round((w.e - p.a[0]) * FPS)),
    }));
    let cur: OutWord[] = [];
    const flush = () => {
      if (cur.length) out.push({words: cur, fs: cur[0].fs, fe: cur[cur.length - 1].fe});
      cur = [];
    };
    ws.forEach((w) => {
      const len = cur.reduce((a, c) => a + c.t.length, 0) + w.t.length;
      if (cur.length >= 3 || len > 14) flush();
      cur.push(w);
    });
    flush();
    // stretch each chunk to the start of the next one inside the segment (no flicker)
    const segChunks = out.filter((c) => c.fs >= p.from && c.fs < p.from + p.dur);
    segChunks.forEach((c, i) => {
      c.fe = i < segChunks.length - 1 ? segChunks[i + 1].fs : p.from + p.dur;
    });
  }
  return out;
};

export const Captions: React.FC<{segs?: Placed[]}> = ({segs = defaultPlaced}) => {
  const chunks = React.useMemo(() => buildChunks(segs), [segs]);
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const c = chunks.find((k) => f >= k.fs && f < k.fe);
  if (!c) return null;
  const local = f - c.fs;
  const enter = spring({frame: local, fps, config: {damping: 13, stiffness: 220, mass: 0.6}});
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div
        style={{
          position: 'absolute',
          top: CAPTION_Y,
          left: 60,
          right: 140,
          transform: `translateY(-50%) scale(${interpolate(enter, [0, 1], [0.8, 1])})`,
          opacity: enter,
          display: 'flex',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: '4px 34px',
        }}
      >
        {c.words.map((w, i) => {
          const active = f >= w.fs && f < Math.max(w.fe, w.fs + 4);
          const said = f >= w.fs;
          const pop = spring({frame: f - w.fs, fps, config: {damping: 10, stiffness: 300, mass: 0.5}});
          const color = !said ? 'rgba(255,255,255,0.55)' : w.hl ? (w.t.includes('RM') ? '#FFE14D' : '#FFE14D') : '#FFFFFF';
          return (
            <span
              key={i}
              style={{
                fontFamily: 'InterDisplay',
                fontWeight: 900,
                fontSize: 80,
                letterSpacing: -1,
                lineHeight: 1.05,
                color,
                WebkitTextStroke: '12px #0b0612',
                paintOrder: 'stroke fill',
                textShadow: '0 8px 22px rgba(0,0,0,0.55)',
                display: 'inline-block',
                transform: `scale(${active ? interpolate(pop, [0, 1], [1.0, 1.12]) : 1}) rotate(${active && w.hl ? -2 : 0}deg)`,
                ...(active && w.hl
                  ? {}
                  : {}),
              }}
            >
              {w.t}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
