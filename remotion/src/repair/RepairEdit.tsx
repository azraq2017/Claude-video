import React from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {Outro, OUTRO_FRAMES} from '../Outro';

// Minimal-style LCD repair timelapse with the supplied voiceover.
// public/repair/timelapse.mp4 is pre-built by ffmpeg (see README in this folder) — frame
// boundaries below match its segments exactly.
const FPS = 30;
const VIDEO = staticFile('repair/timelapse.mp4');
const VO = staticFile('repair/vo.wav');
const YELLOW = '#FEC401';
export const REPAIR_BODY = 2183;
export const REPAIR_TOTAL = REPAIR_BODY + OUTRO_FRAMES;

// ---- timelapse segments (output frames) ----
type Step = {from: number; to: number; n?: number; label: string; speed: number; note?: string};
const STEPS: Step[] = [
  {from: 0, to: 156, label: 'Problem LCD', speed: 2},
  {from: 156, to: 498, n: 1, label: 'Sapu gam pada frame', speed: 5.4},
  {from: 498, to: 886, n: 2, label: 'Pasang LCD baru', speed: 8},
  {from: 886, to: 946, n: 2, label: 'Pasang LCD baru', speed: 2, note: 'Test paparan — OK'},
  {from: 946, to: 963, n: 2, label: 'Pasang LCD baru', speed: 8},
  {from: 963, to: 1433, n: 3, label: 'Pasang semula komponen', speed: 12},
  {from: 1433, to: 1583, n: 4, label: 'Gam & tutup back cover', speed: 6},
  {from: 1583, to: REPAIR_BODY, n: 5, label: 'Bersih & siap', speed: 2.25},
];
const N_STEPS = 5;

// ---- voiceover pieces: [srcStart, srcEnd, outStartFrame] ----
// Part 3 drops two pauses and the first, unfinished "kita boleh buat".
const VO_PARTS: [number, number, number][] = (() => {
  const parts: [number, number, number][] = [[0, 16.72, 0]];
  let f = 1598;
  for (const [a, b] of [
    [16.72, 22.4],
    [23.08, 30.55],
    [31.62, 34.45],
    [35.22, 37.6],
  ] as [number, number][]) {
    parts.push([a, b, f]);
    f += Math.round((b - a) * FPS);
  }
  return parts;
})();
// map a VO source time to an output frame; `end` picks the part that ends at t rather than the one that starts there
const srcToOut = (t: number, end = false) => {
  const part =
    VO_PARTS.find(([a, b]) => (end ? t > a && t <= b + 0.05 : t >= a && t < b)) ??
    VO_PARTS.find(([a, b]) => t >= a - 0.7 && t <= b + 0.7)!;
  const [a, b, o] = part;
  return o + Math.round((Math.min(Math.max(t, a), b) - a) * FPS);
};

// ---- subtitles (VO source seconds) ----
const SUBS: [number, number, string][] = [
  [0.0, 3.64, 'Ok guys, kita ada satu phone yang kita tengah repair ni'],
  [3.64, 5.18, 'Problem LCD.'],
  [5.18, 11.14, 'So macam ni lah proses kita buat untuk repair phone'],
  [11.14, 16.72, 'Pasang LCD, dan gamkan semula.'],
  [16.72, 20.34, 'Ok, so siapa yang ada masalah handphone'],
  [20.34, 22.4, 'yang skrin pecah'],
  [23.08, 24.54, 'ataupun yang sewaktu dengannya,'],
  [24.54, 26.16, 'boleh hantar ke kami.'],
  [26.16, 28.7, 'Kita akan repair secepat mungkin.'],
  [28.7, 32.96, 'Kalau ready stock, kita boleh buat terus on the spot.'],
  [32.96, 37.6, 'Yang penting, kita cuba siapkan pada hari yang sama.'],
];

const fade = (f: number, a: number, b: number, n = 5) =>
  interpolate(f, [a, a + n, b - n, b], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

const Subtitle: React.FC = () => {
  const f = useCurrentFrame();
  const cur = SUBS.map(([s, e, text]) => ({s: srcToOut(s), e: srcToOut(e, true), text})).find((x) => f >= x.s && f < x.e);
  if (!cur) return null;
  const o = fade(f, cur.s, cur.e, 4);
  return (
    <div style={{position: 'absolute', left: 90, right: 150, top: 1330, display: 'flex', justifyContent: 'center', opacity: o, transform: `translateY(${(1 - o) * 10}px)`}}>
      <div
        style={{
          padding: '14px 28px',
          borderRadius: 20,
          background: 'rgba(10,12,16,0.55)',
          backdropFilter: 'blur(12px)',
          color: '#fff',
          fontFamily: 'InterDisplay',
          fontWeight: 600,
          fontSize: 46,
          lineHeight: 1.28,
          textAlign: 'center',
          letterSpacing: -0.2,
        }}
      >
        {cur.text}
      </div>
    </div>
  );
};

const StepHud: React.FC = () => {
  const f = useCurrentFrame();
  const step = STEPS.find((s) => f >= s.from && f < s.to) ?? STEPS[STEPS.length - 1];
  if (!step.n) return null;
  // the label animates only when the step number changes
  const first = STEPS.find((s) => s.n === step.n)!.from;
  const inP = interpolate(f - first, [0, 12], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  const hudIn = interpolate(f, [156, 170], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const hudOut = interpolate(f, [REPAIR_BODY - 12, REPAIR_BODY], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <div style={{position: 'absolute', left: 64, top: 232, opacity: hudIn * hudOut, fontFamily: 'InterDisplay'}}>
      {/* step tracker */}
      <div style={{display: 'flex', gap: 8, marginBottom: 22}}>
        {Array.from({length: N_STEPS}).map((_, i) => {
          const done = i + 1 < step.n!;
          const active = i + 1 === step.n;
          const w = active ? interpolate(inP, [0, 1], [0, 100]) : done ? 100 : 0;
          return (
            <div key={i} style={{width: 84, height: 5, borderRadius: 5, background: 'rgba(255,255,255,0.3)', overflow: 'hidden'}}>
              <div style={{width: `${w}%`, height: '100%', background: YELLOW}} />
            </div>
          );
        })}
      </div>
      <div style={{display: 'flex', alignItems: 'baseline', gap: 18, opacity: inP, transform: `translateX(${(1 - inP) * -24}px)`, textShadow: '0 2px 18px rgba(0,0,0,0.45)'}}>
        <span style={{fontWeight: 800, fontSize: 40, color: YELLOW}}>{String(step.n).padStart(2, '0')}</span>
        <span style={{fontWeight: 600, fontSize: 44, color: '#fff'}}>{step.label}</span>
      </div>
      <div style={{marginTop: 14, display: 'flex', gap: 12, alignItems: 'center', opacity: inP}}>
        {step.speed >= 5 || step.note ? <SpeedTag speed={step.speed} /> : null}
        {step.note ? <NoteTag text={step.note} from={step.from} /> : null}
      </div>
    </div>
  );
};

const SpeedTag: React.FC<{speed: number}> = ({speed}) => (
  <div
    style={{
      padding: '6px 14px',
      borderRadius: 999,
      border: '2px solid rgba(255,255,255,0.7)',
      color: '#fff',
      fontWeight: 600,
      fontSize: 26,
      letterSpacing: 2,
      background: 'rgba(10,12,16,0.35)',
    }}
  >
    {speed >= 5 ? `TIMELAPSE ${Math.round(speed)}×` : `${speed}×`}
  </div>
);

const NoteTag: React.FC<{text: string; from: number}> = ({text, from}) => {
  const f = useCurrentFrame();
  const o = interpolate(f - from, [0, 8], [0, 1], {extrapolateRight: 'clamp'});
  return (
    <div style={{padding: '6px 16px', borderRadius: 999, background: YELLOW, color: '#111', fontWeight: 800, fontSize: 26, opacity: o, transform: `scale(${0.9 + 0.1 * o})`}}>
      ✓ {text}
    </div>
  );
};

const IntroTitle: React.FC = () => {
  const f = useCurrentFrame();
  const o = fade(f, 0, 150, 12);
  return (
    <div style={{position: 'absolute', left: 64, right: 150, top: 250, opacity: o, fontFamily: 'InterDisplay', textShadow: '0 2px 22px rgba(0,0,0,0.5)'}}>
      <div style={{fontWeight: 600, fontSize: 30, letterSpacing: 8, color: YELLOW}}>REPAIR LOG</div>
      <div style={{fontWeight: 800, fontSize: 76, color: '#fff', lineHeight: 1.05, marginTop: 10}}>Tukar LCD</div>
      <div style={{fontWeight: 600, fontSize: 40, color: 'rgba(255,255,255,0.85)', marginTop: 8}}>Oppo · skrin pecah</div>
    </div>
  );
};

// soft vignette + slight grade keeps the bright teal mat calm and text readable
const Grade: React.FC = () => (
  <AbsoluteFill
    style={{
      pointerEvents: 'none',
      background:
        'linear-gradient(180deg, rgba(0,0,0,0.42) 0%, rgba(0,0,0,0) 26%, rgba(0,0,0,0) 62%, rgba(0,0,0,0.38) 100%)',
    }}
  />
);

export const RepairEdit: React.FC = () => {
  const f = useCurrentFrame();
  const stepStarts = [156, 498, 963, 1433, 1583];
  return (
    <AbsoluteFill style={{backgroundColor: '#000', fontFamily: 'InterDisplay'}}>
      <style>{`
        @font-face{font-family:'InterDisplay';src:url('${staticFile('fonts/InterDisplay-ExtraBold.otf')}');font-weight:800}
        @font-face{font-family:'InterDisplay';src:url('${staticFile('fonts/InterDisplay-SemiBold.otf')}');font-weight:600}
      `}</style>

      <Sequence durationInFrames={REPAIR_BODY} name="timelapse">
        <OffthreadVideo src={VIDEO} muted style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(0.88) contrast(1.04)'}} />
        <Grade />
        <IntroTitle />
        <StepHud />
        <Subtitle />
      </Sequence>

      {/* gentle dip into the outro */}
      <Sequence from={REPAIR_BODY - 8} durationInFrames={10}>
        <AbsoluteFill style={{background: '#06145c', opacity: interpolate(f - (REPAIR_BODY - 8), [0, 8], [0, 1], {extrapolateRight: 'clamp'})}} />
      </Sequence>
      <Sequence from={REPAIR_BODY} durationInFrames={OUTRO_FRAMES} name="outro">
        <Outro line="Repair skrin • Siap hari yang sama" music={false} />
      </Sequence>

      {/* voiceover */}
      {VO_PARTS.map(([a, b, o], i) => {
        const d = Math.round((b - a) * FPS);
        return (
          <Sequence key={i} from={o} durationInFrames={d} name={`vo${i}`}>
            <Audio src={VO} trimBefore={Math.round(a * FPS)} volume={(x) => interpolate(x, [0, 2, d - 2, d], [0, 1, 1, 0], {extrapolateRight: 'clamp'})} />
          </Sequence>
        );
      })}

      {/* music: low under the voice, lifts during the silent timelapse, rides into the outro */}
      <Audio
        src={staticFile('sfx/bgm_upbeat.wav')}
        volume={(x) =>
          interpolate(
            x,
            [0, 10, 480, 520, 1560, 1600, REPAIR_BODY - 10, REPAIR_BODY + 10, REPAIR_TOTAL - 20, REPAIR_TOTAL],
            [0, 0.11, 0.11, 0.56, 0.56, 0.11, 0.11, 0.45, 0.45, 0],
            {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
          )
        }
      />

      {/* minimal sfx: soft tick on each step, chime when the new LCD lights up */}
      {stepStarts.map((s) => (
        <Sequence key={s} from={s} durationInFrames={30}>
          <Audio src={staticFile('sfx/click.wav')} volume={0.28} />
        </Sequence>
      ))}
      <Sequence from={888} durationInFrames={60}>
        <Audio src={staticFile('sfx/ding.wav')} volume={0.25} />
      </Sequence>
    </AbsoluteFill>
  );
};
