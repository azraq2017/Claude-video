import React from 'react';
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
} from 'remotion';
import {at, BODY_FRAMES, FPS, placed, seg, TOTAL_FRAMES} from './edl';
import {Captions} from './Captions';
import {BodyRow, ConditionRow, CtaRow, EndCard, Flash, HookTitle, PurpleWash, SafeZoneGuide, SpecRow} from './Graphics';

export const W = 1080;
export const H = 1920;

const SRC = staticFile('src_clean.mp4');
const VOICE = staticFile('voice.wav');
const sfx = (n: string) => staticFile(`sfx/${n}.wav`);

// ---------- video layer ----------
export const Clip: React.FC<{start: number; dur: number; zoom?: number; focusY?: number; punch?: boolean; src?: string}> = ({
  src = SRC,
  start,
  dur,
  zoom = 1,
  focusY = 0.5,
  punch = true,
}) => {
  const f = useCurrentFrame();
  // jump-cut punch + slow push-in
  const p = punch ? interpolate(f, [0, 7], [1.07, 1], {extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)}) : 1;
  const drift = interpolate(f, [0, dur], [1, 1.035]);
  return (
    <AbsoluteFill style={{overflow: 'hidden', backgroundColor: 'black'}}>
      <OffthreadVideo
        src={src}
        muted
        trimBefore={Math.round(start * FPS)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `scale(${zoom * p * drift})`,
          transformOrigin: `50% ${focusY * 100}%`,
        }}
      />
    </AbsoluteFill>
  );
};

// Hook layout: blurred backdrop + framed card so the headline never sits on the phone
export const HookVideo: React.FC<{start: number; dur: number; src?: string; glow?: string; cardTop?: number}> = ({start, dur, src = SRC, glow = 'rgba(170,120,255,0.35)', cardTop = 560}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: f, fps, config: {damping: 14, stiffness: 120}});
  const scale = interpolate(s, [0, 1], [0.95, 0.74]);
  const drift = interpolate(f, [0, dur], [1, 1.06]);
  return (
    <AbsoluteFill style={{backgroundColor: '#0d0716'}}>
      <OffthreadVideo
        src={src}
        muted
        trimBefore={Math.round(start * FPS)}
        style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(38px) brightness(0.45) saturate(1.4)', transform: 'scale(1.2)'}}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 50% 30%, ${glow}, rgba(0,0,0,0) 60%)`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: W / 2 - (W * scale) / 2,
          top: cardTop,
          width: W * scale,
          height: H * scale,
          borderRadius: 48,
          overflow: 'hidden',
          boxShadow: `0 30px 90px rgba(0,0,0,0.6), 0 0 0 4px ${glow}`,
        }}
      >
        <OffthreadVideo
          src={src}
          muted
          trimBefore={Math.round(start * FPS)}
          style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${drift})`}}
        />
      </div>
    </AbsoluteFill>
  );
};

// ---------- audio helpers ----------
export const edgeFade = (dur: number, n = 2) => (f: number) =>
  interpolate(f, [0, n, dur - n, dur], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

type Hit = {f: number; n: string; v?: number};

const buildSfx = (): Hit[] => {
  const h: Hit[] = [];
  const hook = seg('hook');
  h.push({f: 0, n: 'impact', v: 0.55});
  h.push({f: at('hook', 14.04), n: 'kaching', v: 0.5});
  h.push({f: at('hook', 15.0), n: 'pop', v: 0.45});
  h.push({f: hook.from + hook.dur - 36, n: 'riser', v: 0.28});
  // whoosh on every cut (starting slightly before the cut)
  placed.slice(1).forEach((p) => h.push({f: Math.max(0, p.from - 6), n: p.id === 'purple' || p.id === 'cta' ? 'whoosh' : 'swipe', v: 0.32}));
  // intro chips
  h.push({f: at('intro2', 2.36), n: 'pop', v: 0.45});
  h.push({f: at('intro2', 3.3), n: 'pop', v: 0.45});
  // purple
  h.push({f: at('purple', 5.8), n: 'sparkle', v: 0.4});
  // condition
  h.push({f: at('condition', 18.4), n: 'ding', v: 0.35});
  h.push({f: at('condition', 19.4), n: 'click', v: 0.4});
  h.push({f: at('condition', 20.6), n: 'notif', v: 0.4});
  // body / stars
  for (let i = 0; i < 5; i++) h.push({f: at('perfect', 26.35) + i * 4, n: 'click', v: 0.35});
  h.push({f: at('perfect', 27.55), n: 'sparkle', v: 0.38});
  // CTA
  h.push({f: at('cta', 31.58), n: 'notif', v: 0.42});
  h.push({f: at('cta', 33.72), n: 'pop', v: 0.45});
  // end
  h.push({f: BODY_FRAMES, n: 'impact', v: 0.4});
  h.push({f: BODY_FRAMES + 4, n: 'kaching', v: 0.35});
  return h;
};
const HITS = buildSfx();

export const Main: React.FC<{showSafeZone?: boolean}> = ({showSafeZone = false}) => {
  return (
    <AbsoluteFill style={{backgroundColor: 'black', fontFamily: 'InterDisplay'}}>
      <style>{`
        @font-face{font-family:'InterDisplay';src:url('${staticFile('fonts/InterDisplay-Black.otf')}');font-weight:900}
        @font-face{font-family:'InterDisplay';src:url('${staticFile('fonts/InterDisplay-ExtraBold.otf')}');font-weight:800}
        @font-face{font-family:'InterDisplay';src:url('${staticFile('fonts/InterDisplay-SemiBold.otf')}');font-weight:600}
      `}</style>

      {/* VIDEO */}
      {placed.map((p) => (
        <Sequence key={p.id} from={p.from} durationInFrames={p.dur} name={`v:${p.id}`}>
          {p.id === 'hook' ? (
            <HookVideo start={p.v ?? p.a[0]} dur={p.dur} />
          ) : (
            <Clip start={p.v ?? p.a[0]} dur={p.dur} zoom={p.zoom} focusY={p.focusY} />
          )}
        </Sequence>
      ))}
      <Sequence from={BODY_FRAMES} name="v:end">
        <Clip start={35.4} dur={TOTAL_FRAMES - BODY_FRAMES} punch={false} />
      </Sequence>

      {/* cut flashes */}
      {placed.slice(1).map((p) => (
        <Sequence key={'fl' + p.id} from={p.from} durationInFrames={5}>
          <Flash />
        </Sequence>
      ))}

      {/* GRAPHICS */}
      <Sequence from={0} durationInFrames={seg('hook').dur} name="g:hook">
        <HookTitle priceAt={at('hook', 14.04)} />
      </Sequence>

      <Sequence from={seg('intro2').from} durationInFrames={seg('intro2').dur + seg('purple').dur} name="g:spec">
        <SpecRow a={at('intro2', 2.36) - seg('intro2').from} b={at('intro2', 3.3) - seg('intro2').from} c={at('purple', 5.78) - seg('intro2').from} />
      </Sequence>
      <Sequence from={seg('purple').from} durationInFrames={seg('purple').dur} name="g:wash">
        <PurpleWash />
      </Sequence>
      <Sequence from={seg('condition').from} durationInFrames={seg('condition').dur} name="g:condition">
        <ConditionRow a={at('condition', 18.35) - seg('condition').from} b={at('condition', 19.4) - seg('condition').from} fill={at('condition', 20.6) - seg('condition').from} />
      </Sequence>
      <Sequence from={seg('body').from} durationInFrames={seg('body').dur + seg('perfect').dur} name="g:body">
        <BodyRow a={4} b={at('perfect', 26.35) - seg('body').from} />
      </Sequence>
      <Sequence from={at('cta', 31.5)} durationInFrames={BODY_FRAMES - at('cta', 31.5)} name="g:cta">
        <CtaRow dmAt={at('cta', 33.7) - at('cta', 31.5)} />
      </Sequence>

      <Sequence from={BODY_FRAMES} name="g:end">
        <EndCard />
      </Sequence>

      <Captions />

      {/* AUDIO: cleaned voice, cut to match video */}
      {placed.map((p) => (
        <Sequence key={'a' + p.id} from={p.from} durationInFrames={p.dur} name={`a:${p.id}`}>
          <Audio src={VOICE} trimBefore={Math.round(p.a[0] * FPS)} volume={edgeFade(p.dur)} />
        </Sequence>
      ))}

      {/* BGM — sits well under the voice, swells on the end card */}
      <Audio
        src={staticFile('sfx/bgm.wav')}
        volume={(f) =>
          interpolate(f, [0, 6, BODY_FRAMES - 4, BODY_FRAMES + 6, TOTAL_FRAMES - 12, TOTAL_FRAMES], [0, 0.11, 0.11, 0.32, 0.32, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          })
        }
      />

      {HITS.map((h, i) => (
        <Sequence key={'s' + i} from={h.f} name={`sfx:${h.n}`}>
          <Audio src={sfx(h.n)} volume={h.v ?? 0.4} />
        </Sequence>
      ))}

      {showSafeZone ? <SafeZoneGuide /> : null}
    </AbsoluteFill>
  );
};
