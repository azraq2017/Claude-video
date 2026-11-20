import React from 'react';
import {AbsoluteFill, Audio, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {FPS} from '../edl';
import {Captions} from '../Captions';
import {Clip, edgeFade, HookVideo} from '../Main';
import {
  BodyRow,
  ConditionRow,
  EndCard,
  Flash,
  GREEN,
  INK,
  Pill,
  SAFE,
  SafeZoneGuide,
  Send,
  SpecRow,
  TopRow,
  YELLOW,
} from '../Graphics';
import {at13, BODY13, placed13, seg13, TOTAL13} from './edl13';

const SRC = staticFile('ip13/src.mp4');
const VOICE = staticFile('ip13/voice.wav');
const sfx = (n: string) => staticFile(`sfx/${n}.wav`);
const BLUE = '#5AA9FF';
const BLUE_GLOW = 'rgba(90,160,255,0.45)';

// ---------- hook: old price -> slashed -> new price ----------
const Hook13: React.FC<{oldAt: number; newAt: number; sahajaAt: number}> = ({oldAt, newAt, sahajaAt}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pill = spring({frame: f, fps, config: {damping: 14, stiffness: 160}});
  const oldIn = spring({frame: f - oldAt, fps, config: {damping: 11, stiffness: 200}});
  const k = spring({frame: f - newAt, fps, config: {damping: 13, stiffness: 170}});
  const stamp = spring({frame: f - newAt - 4, fps, config: {damping: 8, stiffness: 200, mass: 0.8}});
  const sah = spring({frame: f - sahajaAt, fps, config: {damping: 9, stiffness: 220, mass: 0.6}});
  const jimat = spring({frame: f - newAt - 18, fps, config: {damping: 10, stiffness: 200}});
  const strike = interpolate(f, [oldAt + 14, oldAt + 24], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const shake = f >= newAt + 4 && f < newAt + 12 ? Math.sin(f * 2.7) * (12 - (f - newAt)) * 1.6 : 0;
  const big = {
    fontFamily: 'InterDisplay',
    fontWeight: 900,
    lineHeight: 1,
    letterSpacing: -6,
    WebkitTextStroke: `14px ${INK}`,
    paintOrder: 'stroke fill',
  } as const;
  return (
    <AbsoluteFill style={{pointerEvents: 'none', transform: `translateX(${shake}px)`}}>
      <div style={{position: 'absolute', top: SAFE.top + 6, width: '100%', display: 'flex', justifyContent: 'center', opacity: pill, transform: `translateY(${(1 - pill) * -30}px)`}}>
        <div style={{padding: '12px 30px', borderRadius: 999, background: 'rgba(90,169,255,0.22)', border: `3px solid ${BLUE}`, color: '#fff', fontFamily: 'InterDisplay', fontWeight: 800, fontSize: 42, letterSpacing: 1}}>
          iPHONE 13 • 128GB • BLUE
        </div>
      </div>

      {/* old price: big first, then shrinks up and gets slashed */}
      <div
        style={{
          position: 'absolute',
          top: interpolate(k, [0, 1], [330, 300]),
          width: '100%',
          textAlign: 'center',
          opacity: oldIn,
          transform: `scale(${interpolate(oldIn, [0, 1], [1.8, 1]) * interpolate(k, [0, 1], [1, 0.42])})`,
          transformOrigin: '50% 0%',
        }}
      >
        <span style={{position: 'relative', display: 'inline-block', ...big, fontSize: 190, color: '#fff', textShadow: '0 22px 40px rgba(0,0,0,0.6)'}}>
          <span style={{fontSize: 70, letterSpacing: 0, verticalAlign: 'middle', marginRight: 18, WebkitTextStroke: `10px ${INK}`}}>ASAL</span>
          RM1299
          <span style={{position: 'absolute', left: 250, top: '50%', height: 22, width: `${strike * 72}%`, background: '#ff3b5c', borderRadius: 11, transform: 'rotate(-6deg)', boxShadow: `0 0 0 6px ${INK}`}} />
        </span>
      </div>

      {/* new price stamp */}
      <div style={{position: 'absolute', top: 395, width: '100%', textAlign: 'center', opacity: interpolate(stamp, [0, 0.3], [0, 1], {extrapolateRight: 'clamp'}), transform: `scale(${interpolate(stamp, [0, 1], [2.6, 1])}) rotate(-3deg)`}}>
        <span style={{...big, fontSize: 196, color: YELLOW, textShadow: '0 12px 0 #2f6fd6, 0 22px 40px rgba(0,0,0,0.6)'}}>RM1099</span>
      </div>
      <div style={{position: 'absolute', top: 590, left: 640, transform: `scale(${sah}) rotate(8deg)`, background: '#ff3b5c', color: '#fff', padding: '8px 22px', borderRadius: 14, fontFamily: 'InterDisplay', fontWeight: 900, fontSize: 50, border: '3px solid #fff', boxShadow: '0 8px 24px rgba(0,0,0,0.5)'}}>
        SAHAJA!
      </div>
      <div style={{position: 'absolute', top: 596, left: 130, transform: `scale(${jimat}) rotate(-6deg)`, background: GREEN, color: INK, padding: '8px 22px', borderRadius: 14, fontFamily: 'InterDisplay', fontWeight: 900, fontSize: 46, border: '3px solid #fff', boxShadow: '0 8px 24px rgba(0,0,0,0.5)'}}>
        JIMAT RM200
      </div>
    </AbsoluteFill>
  );
};

const CtaDm: React.FC<{linkAt: number}> = ({linkAt}) => {
  const f = useCurrentFrame();
  const pulse = 1 + 0.035 * Math.sin((f / 30) * Math.PI * 2.2);
  return (
    <TopRow column>
      <div style={{transform: `scale(${pulse})`, transformOrigin: 'left center'}}>
        <Pill at={0} big solid accent={BLUE} icon={<Send c={INK} />} label="DM Kami Sekarang" />
      </div>
      <Pill at={linkAt} big accent={YELLOW} label={<span>Link di <span style={{color: YELLOW}}>Bio</span> ↑</span>} />
    </TopRow>
  );
};

type Hit = {f: number; n: string; v?: number};
const HITS: Hit[] = (() => {
  const h: Hit[] = [];
  const hookEnd = seg13('h2').from + seg13('h2').dur;
  h.push({f: 0, n: 'impact', v: 0.5});
  h.push({f: at13('h1', 26.3), n: 'pop', v: 0.45});
  h.push({f: at13('h1', 26.75), n: 'swipe', v: 0.4}); // slash
  h.push({f: at13('h2', 1.76) + 4, n: 'kaching', v: 0.5});
  h.push({f: at13('h2', 1.76) + 4, n: 'impact', v: 0.3});
  h.push({f: at13('h2', 1.76) + 18, n: 'pop', v: 0.4});
  h.push({f: at13('h2', 3.88), n: 'pop', v: 0.45});
  h.push({f: hookEnd - 30, n: 'riser', v: 0.26});
  placed13.slice(2).forEach((p) => h.push({f: p.from - 6, n: ['spec1', 'cond', 'best1', 'cta'].includes(p.id) ? 'whoosh' : 'swipe', v: 0.3}));
  h.push({f: at13('spec1', 11.0), n: 'pop', v: 0.42});
  h.push({f: at13('spec2', 12.88), n: 'pop', v: 0.42});
  h.push({f: at13('spec2', 12.88) + 15, n: 'sparkle', v: 0.32});
  h.push({f: at13('cond', 16.64), n: 'ding', v: 0.35});
  h.push({f: at13('bat1', 19.2), n: 'click', v: 0.4});
  h.push({f: at13('bat2', 23.3), n: 'notif', v: 0.4});
  for (let i = 0; i < 5; i++) h.push({f: at13('best1', 35.6) + i * 4, n: 'click', v: 0.35});
  h.push({f: at13('best2', 36.92), n: 'sparkle', v: 0.38});
  h.push({f: seg13('cta').from + 2, n: 'notif', v: 0.4});
  h.push({f: at13('cta', 40.6), n: 'pop', v: 0.45});
  h.push({f: BODY13, n: 'impact', v: 0.4});
  h.push({f: BODY13 + 4, n: 'kaching', v: 0.35});
  return h;
})();

export const Main13: React.FC<{showSafeZone?: boolean}> = ({showSafeZone = false}) => {
  const h1 = seg13('h1');
  const h2 = seg13('h2');
  const hookDur = h1.dur + h2.dur;
  const rel = (id: string, t: number, base: string) => at13(id, t) - seg13(base).from;
  return (
    <AbsoluteFill style={{backgroundColor: 'black', fontFamily: 'InterDisplay'}}>
      <style>{`
        @font-face{font-family:'InterDisplay';src:url('${staticFile('fonts/InterDisplay-Black.otf')}');font-weight:900}
        @font-face{font-family:'InterDisplay';src:url('${staticFile('fonts/InterDisplay-ExtraBold.otf')}');font-weight:800}
        @font-face{font-family:'InterDisplay';src:url('${staticFile('fonts/InterDisplay-SemiBold.otf')}');font-weight:600}
      `}</style>

      {/* VIDEO — hook is one continuous back-of-phone b-roll in a card */}
      <Sequence from={0} durationInFrames={hookDur} name="v:hook">
        <HookVideo src={SRC} start={h1.v!} dur={hookDur} glow={BLUE_GLOW} cardTop={700} />
      </Sequence>
      {placed13.slice(2).map((p) => (
        <Sequence key={p.id} from={p.from} durationInFrames={p.dur} name={`v:${p.id}`}>
          <Clip src={SRC} start={p.v ?? p.a[0]} dur={p.dur} zoom={p.zoom} focusY={p.focusY} />
        </Sequence>
      ))}
      <Sequence from={BODY13} name="v:end">
        <Clip src={SRC} start={42.4} dur={TOTAL13 - BODY13} punch={false} />
      </Sequence>
      {placed13.slice(2).map((p) => (
        <Sequence key={'fl' + p.id} from={p.from} durationInFrames={5}>
          <Flash />
        </Sequence>
      ))}

      {/* GRAPHICS */}
      <Sequence from={0} durationInFrames={hookDur} name="g:hook">
        <Hook13 oldAt={at13('h1', 26.3)} newAt={at13('h2', 1.76)} sahajaAt={at13('h2', 3.88)} />
      </Sequence>
      <Sequence from={seg13('spec1').from} durationInFrames={seg13('spec1').dur + seg13('spec2').dur} name="g:spec">
        <SpecRow
          a={rel('spec1', 11.0, 'spec1')}
          b={rel('spec2', 12.88, 'spec1')}
          c={rel('spec2', 12.88, 'spec1') + 15}
          model="iPhone 13"
          colour="Blue"
          swatch="linear-gradient(135deg,#9cc9ff,#2f6fd6)"
        />
      </Sequence>
      <Sequence from={seg13('cond').from} durationInFrames={seg13('bat2').from + seg13('bat2').dur - seg13('cond').from} name="g:condition">
        <ConditionRow a={rel('cond', 16.64, 'cond')} b={rel('bat1', 19.2, 'cond')} fill={rel('bat2', 23.3, 'cond')} />
      </Sequence>
      <Sequence from={seg13('best1').from} durationInFrames={seg13('best1').dur + seg13('best2').dur} name="g:best">
        <BodyRow a={2} b={rel('best1', 35.6, 'best1')} labelA="Condition Terbaik" labelB="Like New" />
      </Sequence>
      <Sequence from={seg13('cta').from} durationInFrames={seg13('cta').dur} name="g:cta">
        <CtaDm linkAt={rel('cta', 40.6, 'cta')} />
      </Sequence>
      <Sequence from={BODY13} name="g:end">
        <EndCard title="iPHONE 13 • 128GB" price="RM1099" was="RM1299" cta="DM • Link di Bio" />
      </Sequence>

      <Captions segs={placed13} />

      {/* AUDIO */}
      {placed13.map((p) => (
        <Sequence key={'a' + p.id} from={p.from} durationInFrames={p.dur} name={`a:${p.id}`}>
          <Audio src={VOICE} trimBefore={Math.round(p.a[0] * FPS)} volume={edgeFade(p.dur)} />
        </Sequence>
      ))}
      <Audio
        src={staticFile('sfx/bgm.wav')}
        volume={(f) =>
          interpolate(f, [0, 6, BODY13 - 4, BODY13 + 6, TOTAL13 - 12, TOTAL13], [0, 0.11, 0.11, 0.32, 0.32, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          })
        }
      />
      {HITS.map((h, i) => (
        <Sequence key={'s' + i} from={Math.max(0, h.f)} name={`sfx:${h.n}`}>
          <Audio src={sfx(h.n)} volume={h.v ?? 0.4} />
        </Sequence>
      ))}

      {showSafeZone ? <SafeZoneGuide /> : null}
    </AbsoluteFill>
  );
};
