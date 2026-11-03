import React from "react";
import {
  AbsoluteFill,
  Audio,
  interpolate,
  OffthreadVideo,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { FPS, PLACED, TOTAL_FRAMES } from "./timeline";
import { faceAt } from "./face";
import { Captions } from "./components/Captions";
import { Placed } from "./components/Graphics";
import { computeLayout, Layout } from "./layout";
import { FLASH_CUTS, GRAPHICS, SFX } from "./fx";
import { SPEECH } from "./data/captions";

/* ----------------------------- VIDEO ----------------------------- */

const ClipVideo: React.FC<{ srcStart: number; frames: number; zoom: number }> = ({ srcStart, frames, zoom }) => {
  const frame = useCurrentFrame();
  // anchor the punch-in on the speaker's face so it never gets cropped
  const face = faceAt(srcStart + 0.3);
  const ox = (face.x + face.w / 2) * 100;
  const oy = (face.y + face.h / 2) * 100;
  // slow push-in across each clip keeps static shots alive
  const z = zoom * interpolate(frame, [0, frames], [1, 1.025]);
  return (
    <AbsoluteFill style={{ transform: `scale(${z})`, transformOrigin: `${ox}% ${oy}%` }}>
      <OffthreadVideo
        src={staticFile("source.mp4")}
        trimBefore={Math.round(srcStart * FPS)}
        muted
        style={{ width: "100%", height: "100%", objectFit: "cover", filter: "contrast(1.07) saturate(1.15) brightness(1.02)" }}
      />
    </AbsoluteFill>
  );
};

/* ----------------------------- AUDIO ----------------------------- */

const VoiceClip: React.FC<{ srcStart: number; frames: number }> = ({ srcStart, frames }) => (
  <Audio
    src={staticFile("voice.m4a")}
    trimBefore={Math.round(srcStart * FPS)}
    trimAfter={Math.round(srcStart * FPS) + frames}
    // 1-frame fades kill clicks at every cut
    volume={(f) => interpolate(f, [0, 1, frames - 1, frames], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
  />
);

// Music ducking: precompute a smoothed "speaking" curve per frame.
const MUSIC_UNDER_VOICE = 0.055;
const MUSIC_OPEN = 0.16;
const speaking = new Float32Array(TOTAL_FRAMES);
for (const [a, b] of SPEECH) for (let f = Math.max(0, a - 3); f < Math.min(TOTAL_FRAMES, b + 3); f++) speaking[f] = 1;
const duck = new Float32Array(TOTAL_FRAMES);
{
  const R = 8; // ~0.27s smoothing window
  for (let f = 0; f < TOTAL_FRAMES; f++) {
    let s = 0, n = 0;
    for (let k = -R; k <= R; k++) {
      const i = f + k;
      if (i >= 0 && i < TOTAL_FRAMES) { s += speaking[i]; n++; }
    }
    duck[f] = s / n;
  }
}
const musicVolume = (f: number) => {
  const base = MUSIC_OPEN + (MUSIC_UNDER_VOICE - MUSIC_OPEN) * (duck[f] ?? 1);
  const fadeIn = interpolate(f, [0, 6], [0.4, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(f, [TOTAL_FRAMES - 45, TOTAL_FRAMES], [1, 0], { extrapolateLeft: "clamp" });
  return base * fadeIn * fadeOut;
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

/* ----------------------------- LAYOUT ----------------------------- */

const LAYOUTS: Layout[] = GRAPHICS.map((g) => computeLayout(g.from, g.dur, g.height));

// Hide captions only while a big graphic has had to borrow the caption band.
const CAPTION_HIDDEN: [number, number][] = [];
GRAPHICS.forEach((g, i) => {
  const c = LAYOUTS[i].coversCaptions;
  let start = -1;
  for (let k = 0; k <= c.length; k++) {
    if (k < c.length && c[k]) { if (start < 0) start = k; }
    else if (start >= 0) { CAPTION_HIDDEN.push([g.from + start, g.from + k]); start = -1; }
  }
});

const FollowFace: React.FC<{ layout: Layout; children: React.ReactNode }> = ({ layout, children }) => {
  const f = Math.min(useCurrentFrame(), layout.top.length - 1);
  return (
    <Placed top={layout.top[f]} scale={layout.scale[f]}>
      {children}
    </Placed>
  );
};

/* ----------------------------- MAIN ----------------------------- */

export const TolakMotor: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    {PLACED.map((c) => (
      <Sequence key={`v${c.index}`} from={c.from} durationInFrames={c.frames} name={`clip ${c.index}`}>
        <ClipVideo srcStart={c.srcStart} frames={c.frames} zoom={c.zoom} />
        <VoiceClip srcStart={c.srcStart} frames={c.frames} />
      </Sequence>
    ))}

    <Vignette />

    {GRAPHICS.map((g, i) => (
      <Sequence key={`g${i}`} from={g.from} durationInFrames={g.dur} name={`gfx ${i}`}>
        <FollowFace layout={LAYOUTS[i]}>{g.render(g.dur, () => 0)}</FollowFace>
      </Sequence>
    ))}

    <Captions hiddenRanges={CAPTION_HIDDEN} />

    {FLASH_CUTS.map((f, i) => (
      <Sequence key={`fl${i}`} from={f} durationInFrames={6}>
        <Flash />
      </Sequence>
    ))}

    <Audio src={staticFile("music/funky_chunk.mp3")} volume={musicVolume} loop />

    {SFX.map((s, i) => (
      <Sequence key={`s${i}`} from={s.frame} name={`sfx ${s.name}`}>
        <Audio src={staticFile(`sfx/${s.name}.wav`)} volume={s.vol ?? 0.6} />
      </Sequence>
    ))}
  </AbsoluteFill>
);
