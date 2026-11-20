import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

// TasTech brand outro — 1080x1920, 3.2s. Colours sampled from the TasTech logo.
export const OUTRO_FRAMES = 96;
const BLUE = '#0C2AB0';
const BLUE_DEEP = '#06145c';
const YELLOW = '#FEC401';

const sfx = (n: string) => staticFile(`sfx/${n}.wav`);
const MARK_W = 520; // logo mark width on screen
const MARK_H = (MARK_W * 1044) / 1165;

const Streak: React.FC<{y: number; delay: number; w: number; o: number; c?: string}> = ({y, delay, w, o, c = YELLOW}) => {
  const f = useCurrentFrame();
  const x = interpolate(f - delay, [0, 24], [-w, 1080 + w], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)});
  return <div style={{position: 'absolute', top: y, left: x - w, width: w, height: 5, borderRadius: 5, opacity: o, background: `linear-gradient(90deg, transparent, ${c})`}} />;
};

// The two pieces of the mark fly in from opposite corners and lock together
const Mark: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const a = spring({frame: f - 6, fps, config: {damping: 14, stiffness: 140, mass: 0.9}});
  const b = spring({frame: f - 11, fps, config: {damping: 14, stiffness: 140, mass: 0.9}});
  const lock = f >= 22 ? interpolate(f - 22, [0, 3, 10], [1, 1.08, 1], {extrapolateRight: 'clamp'}) : 1;
  const glow = interpolate(f, [20, 26, 50], [0, 1, 0.35], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const shine = interpolate(f, [26, 46], [-20, 120], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const piece: React.CSSProperties = {position: 'absolute', inset: 0, width: '100%', height: '100%'};
  return (
    <div style={{position: 'relative', width: MARK_W, height: MARK_H, transform: `scale(${lock})`}}>
      <div style={{position: 'absolute', inset: -80, borderRadius: '50%', background: `radial-gradient(circle, ${YELLOW}55 0%, transparent 62%)`, opacity: glow}} />
      <Img
        src={staticFile('brand/piece0.png')}
        style={{...piece, opacity: a, transform: `translate(${(1 - a) * -260}px, ${(1 - a) * 150}px) rotate(${(1 - a) * -12}deg)`}}
      />
      <Img
        src={staticFile('brand/piece1.png')}
        style={{...piece, opacity: b, transform: `translate(${(1 - b) * 260}px, ${(1 - b) * -150}px) rotate(${(1 - b) * 12}deg)`}}
      />
      {/* light sweep clipped to the mark */}
      <div
        style={{
          ...piece,
          background: `linear-gradient(110deg, transparent ${shine - 14}%, rgba(255,255,255,0.75) ${shine}%, transparent ${shine + 14}%)`,
          WebkitMaskImage: `url(${staticFile('brand/tastech-mark.png')})`,
          WebkitMaskSize: '100% 100%',
          maskImage: `url(${staticFile('brand/tastech-mark.png')})`,
          maskSize: '100% 100%',
        }}
      />
    </div>
  );
};

const Wordmark: React.FC<{from: number}> = ({from}) => {
  const f = useCurrentFrame();
  return (
    <div style={{display: 'flex', justifyContent: 'center', overflow: 'hidden', padding: '0 10px 8px'}}>
      {'TAS TECH'.split('').map((ch, i) => {
        const p = interpolate(f - from - i * 1.6, [0, 10], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              width: ch === ' ' ? 40 : undefined,
              fontFamily: 'InterDisplay',
              fontWeight: 900,
              fontSize: 136,
              letterSpacing: 6,
              color: '#fff',
              transform: `translateY(${(1 - p) * 110}%)`,
            }}
          >
            {ch}
          </span>
        );
      })}
    </div>
  );
};

export const Outro: React.FC<{line?: string; withAudio?: boolean}> = ({line = 'Gajet terpakai • Repair • Servis', withAudio = true}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const bgIn = interpolate(f, [0, 8], [0, 1], {extrapolateRight: 'clamp'});
  const ring = spring({frame: f - 20, fps, config: {damping: 20, stiffness: 70}});
  const bar = interpolate(f, [34, 50], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  const tag = interpolate(f, [38, 52], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const cta = spring({frame: f - 50, fps, config: {damping: 13, stiffness: 160}});
  const out = interpolate(f, [OUTRO_FRAMES - 8, OUTRO_FRAMES], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill style={{backgroundColor: BLUE_DEEP, opacity: out, fontFamily: 'InterDisplay'}}>
      <style>{`
        @font-face{font-family:'InterDisplay';src:url('${staticFile('fonts/InterDisplay-Black.otf')}');font-weight:900}
        @font-face{font-family:'InterDisplay';src:url('${staticFile('fonts/InterDisplay-ExtraBold.otf')}');font-weight:800}
        @font-face{font-family:'InterDisplay';src:url('${staticFile('fonts/InterDisplay-SemiBold.otf')}');font-weight:600}
      `}</style>
      <AbsoluteFill style={{opacity: bgIn, background: `radial-gradient(ellipse at 50% 40%, #1d3fd6 0%, ${BLUE} 40%, ${BLUE_DEEP} 85%)`}} />
      {/* subtle isometric grid echoing the logo's angles */}
      <AbsoluteFill
        style={{
          opacity: 0.12 * bgIn,
          backgroundImage:
            'repeating-linear-gradient(30deg, rgba(255,255,255,0.6) 0 2px, transparent 2px 90px), repeating-linear-gradient(-30deg, rgba(255,255,255,0.6) 0 2px, transparent 2px 90px)',
          WebkitMaskImage: 'radial-gradient(ellipse at 50% 42%, black 5%, transparent 60%)',
          maskImage: 'radial-gradient(ellipse at 50% 42%, black 5%, transparent 60%)',
          transform: `translateY(${-f * 0.8}px)`,
        }}
      />
      <Streak y={520} delay={0} w={420} o={0.7} />
      <Streak y={1240} delay={6} w={320} o={0.55} c="#fff" />
      <Streak y={1380} delay={12} w={220} o={0.4} />

      <div
        style={{
          position: 'absolute',
          left: 540,
          top: 770,
          width: 820,
          height: 820,
          marginLeft: -410,
          marginTop: -410,
          borderRadius: '50%',
          border: `4px solid ${YELLOW}`,
          opacity: interpolate(ring, [0, 0.4, 1], [0, 0.6, 0]),
          transform: `scale(${interpolate(ring, [0, 1], [0.5, 1.15])})`,
        }}
      />

      {/* everything sits between y≈300 and y≈1450 — clear of TikTok/IG UI */}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', display: 'flex', paddingBottom: 220}}>
        <Mark />
        <div style={{marginTop: 46}}>
          <Wordmark from={28} />
        </div>
        <div style={{width: 600 * bar, height: 6, borderRadius: 6, marginTop: 10, background: `linear-gradient(90deg, transparent, ${YELLOW}, transparent)`}} />
        <div
          style={{
            marginTop: 26,
            opacity: tag,
            fontFamily: 'InterDisplay',
            fontWeight: 600,
            fontSize: 32,
            letterSpacing: interpolate(tag, [0, 1], [20, 9]),
            color: YELLOW,
            textAlign: 'center',
            whiteSpace: 'nowrap',
          }}
        >
          ELECTRONICS · REPAIR · SERVICE
        </div>
        <div
          style={{
            marginTop: 64,
            opacity: cta,
            transform: `translateY(${(1 - cta) * 40}px) scale(${interpolate(cta, [0, 1], [0.9, 1])})`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 22,
          }}
        >
          <div style={{fontFamily: 'InterDisplay', fontWeight: 800, fontSize: 44, color: '#fff'}}>{line}</div>
          <div
            style={{
              padding: '16px 40px',
              borderRadius: 999,
              background: YELLOW,
              color: BLUE_DEEP,
              fontFamily: 'InterDisplay',
              fontWeight: 900,
              fontSize: 44,
              boxShadow: `0 10px 40px ${YELLOW}55`,
            }}
          >
            Follow untuk deal seterusnya
          </div>
        </div>
      </AbsoluteFill>

      {withAudio ? (
        <>
          <Audio src={sfx('whoosh')} volume={0.4} />
          <Sequence from={10}>
            <Audio src={sfx('swipe')} volume={0.3} />
          </Sequence>
          <Sequence from={21}>
            <Audio src={sfx('impact')} volume={0.5} />
          </Sequence>
          <Sequence from={24}>
            <Audio src={sfx('sparkle')} volume={0.38} />
          </Sequence>
          <Sequence from={50}>
            <Audio src={sfx('pop')} volume={0.35} />
          </Sequence>
          <Audio
            src={staticFile('sfx/bgm.wav')}
            trimBefore={Math.round(19.2 * 30)}
            volume={(x) => interpolate(x, [0, 8, OUTRO_FRAMES - 16, OUTRO_FRAMES], [0, 0.3, 0.3, 0], {extrapolateRight: 'clamp'})}
          />
        </>
      ) : null}
    </AbsoluteFill>
  );
};
