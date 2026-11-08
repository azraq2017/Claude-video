import React, { useMemo } from "react";
import { AbsoluteFill, Audio, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { FPS } from "./timeline";
import { Captions } from "./components/Captions";
import { Placed } from "./components/Graphics";
import { createLayoutEngine, Layout } from "./layout";
import type { Project } from "./project";

/* ----------------------------- VIDEO ----------------------------- */

const ClipVideo: React.FC<{ p: Project; srcStart: number; frames: number; zoom: number }> = ({ p, srcStart, frames, zoom }) => {
  const frame = useCurrentFrame();
  // anchor the punch-in on the speaker's face so it never gets cropped
  const face = p.face.faceAt(srcStart + 0.3);
  const ox = (face.x + face.w / 2) * 100;
  const oy = (face.y + face.h / 2) * 100;
  // slow push-in across each clip keeps static shots alive
  const z = zoom * (p.plain ? 1 : interpolate(frame, [0, frames], [1, 1.025]));
  return (
    <AbsoluteFill style={{ transform: `scale(${z})`, transformOrigin: `${ox}% ${oy}%` }}>
      <OffthreadVideo
        src={staticFile(p.media.video)}
        trimBefore={Math.round(srcStart * FPS)}
        muted
        style={{ width: "100%", height: "100%", objectFit: "cover", filter: "contrast(1.07) saturate(1.15) brightness(1.02)" }}
      />
    </AbsoluteFill>
  );
};

/* ----------------------------- AUDIO ----------------------------- */

const VoiceClip: React.FC<{ src: string; srcStart: number; frames: number; muteAfter?: number }> = ({
  src,
  srcStart,
  frames,
  muteAfter,
}) => {
  const end = muteAfter ? Math.min(frames, Math.round((muteAfter - srcStart) * FPS)) : frames;
  return (
  <Audio
    src={staticFile(src)}
    trimBefore={Math.round(srcStart * FPS)}
    trimAfter={Math.round(srcStart * FPS) + frames}
    // 1-frame fades kill clicks at every cut
    volume={(f) => interpolate(f, [0, 1, end - 2, end], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
  />
  );
};

/** Music ducking curve: low under speech, opens up in gaps, smoothed. */
const makeMusicVolume = (p: Project) => {
  const T = p.tl.total;
  const { underVoice, open } = p.musicLevels ?? { underVoice: 0.055, open: 0.16 };
  const speaking = new Float32Array(T);
  for (const [a, b] of p.speech) for (let f = Math.max(0, a - 3); f < Math.min(T, b + 3); f++) speaking[f] = 1;
  const duck = new Float32Array(T);
  const R = 8;
  for (let f = 0; f < T; f++) {
    let s = 0, n = 0;
    for (let k = -R; k <= R; k++) {
      const i = f + k;
      if (i >= 0 && i < T) { s += speaking[i]; n++; }
    }
    duck[f] = s / n;
  }
  return (f: number) => {
    const base = open + (underVoice - open) * (duck[f] ?? 1);
    const fadeIn = interpolate(f, [0, 6], [0.4, 1], { extrapolateRight: "clamp" });
    const fadeOut = interpolate(f, [T - 45, T], [1, 0], { extrapolateLeft: "clamp" });
    return base * fadeIn * fadeOut;
  };
};

/* ----------------------------- OVERLAYS ----------------------------- */

const Flash: React.FC = () => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 1, 5], [0, 0.85, 0], { extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ background: "#fff", opacity: o }} />;
};

const Vignette: React.FC = () => (
  <AbsoluteFill
    style={{
      background:
        "radial-gradient(ellipse at 50% 40%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.35) 100%), linear-gradient(180deg, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0) 14%, rgba(0,0,0,0) 62%, rgba(0,0,0,0.35) 100%)",
    }}
  />
);

const FollowFace: React.FC<{ layout: Layout; children: React.ReactNode }> = ({ layout, children }) => {
  const f = Math.min(useCurrentFrame(), layout.top.length - 1);
  return (
    <Placed top={layout.top[f]} scale={layout.scale[f]}>
      {children}
    </Placed>
  );
};

/* ----------------------------- MAIN ----------------------------- */

export const Edit: React.FC<{ project: Project }> = ({ project: p }) => {
  const { layouts, captionHidden, musicVolume } = useMemo(() => {
    const engine = createLayoutEngine(p.tl, p.face, { captionFree: p.captionMode === "exclusive" });
    const layouts = p.graphics.map((g) => engine.computeLayout(g.from, g.dur, g.height, g.place));
    // Hide captions only while a big graphic has had to borrow the caption band
    // (or, in "exclusive" mode, whenever any graphic is showing).
    const captionHidden: [number, number][] = [];
    if (p.captionMode === "exclusive") p.graphics.forEach((g) => captionHidden.push([g.from - 2, g.from + g.dur + 3]));
    else p.graphics.forEach((g, i) => {
      const c = layouts[i].coversCaptions;
      let start = -1;
      for (let k = 0; k <= c.length; k++) {
        if (k < c.length && c[k]) { if (start < 0) start = k; }
        else if (start >= 0) { captionHidden.push([g.from + start, g.from + k]); start = -1; }
      }
    });
    return { layouts, captionHidden, musicVolume: makeMusicVolume(p) };
  }, [p]);

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {p.tl.placed.map((c) => (
        <Sequence key={`v${c.index}`} from={c.from} durationInFrames={c.frames} name={`clip ${c.index}`}>
          <ClipVideo p={p} srcStart={c.srcStart} frames={c.frames} zoom={c.zoom} />
          <VoiceClip src={p.media.voice} srcStart={c.srcStart} frames={c.frames} muteAfter={c.muteAfter} />
        </Sequence>
      ))}

      {!p.plain && <Vignette />}

      {p.graphics.map((g, i) => (
        <Sequence key={`g${i}`} from={g.from} durationInFrames={g.dur} name={`gfx ${i}`}>
          <FollowFace layout={layouts[i]}>{g.render(g.dur)}</FollowFace>
        </Sequence>
      ))}

      <Captions pages={p.captions} hiddenRanges={captionHidden} />

      {p.flashCuts.map((f, i) => (
        <Sequence key={`fl${i}`} from={f} durationInFrames={6}>
          <Flash />
        </Sequence>
      ))}

      <Audio src={staticFile(p.media.music)} volume={musicVolume} loop />

      {p.sfx.map((s, i) => (
        <Sequence key={`s${i}`} from={s.frame} name={`sfx ${s.name}`}>
          <Audio src={staticFile(`sfx/${s.name}.wav`)} volume={s.vol ?? 0.6} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
