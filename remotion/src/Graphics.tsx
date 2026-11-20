import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';

export const PURPLE = '#B794FF';
export const YELLOW = '#FFE14D';
export const GREEN = '#3EE07F';
export const INK = '#0b0612';

// Safe zone used for every overlay (1080x1920):
// top 220 (TikTok tabs / IG header), bottom 420 (caption, username, music),
// right 140 (like/comment/share rail), left 60.
export const SAFE = {top: 220, bottom: 1500, left: 60, right: 940};

const useSpring = (from: number, cfg = {damping: 12, stiffness: 180, mass: 0.7}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: f - from, fps, config: cfg});
};

// ---------- icons ----------
export const Check: React.FC<{c: string}> = ({c}) => (
  <svg width="44" height="44" viewBox="0 0 44 44">
    <circle cx="22" cy="22" r="20" fill={c} />
    <path d="M12 23 l7 7 l13 -15" stroke={INK} strokeWidth="5.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
export const Spark: React.FC<{c: string}> = ({c}) => (
  <svg width="44" height="44" viewBox="0 0 44 44">
    <path d="M22 2 C24 16 28 20 42 22 C28 24 24 28 22 42 C20 28 16 24 2 22 C16 20 20 16 22 2Z" fill={c} />
  </svg>
);
export const Phone: React.FC<{c: string}> = ({c}) => (
  <svg width="40" height="44" viewBox="0 0 40 44">
    <rect x="8" y="2" width="24" height="40" rx="6" fill="none" stroke={c} strokeWidth="4.5" />
    <rect x="15" y="6" width="10" height="3" rx="1.5" fill={c} />
  </svg>
);
export const Chip: React.FC<{c: string}> = ({c}) => (
  <svg width="44" height="44" viewBox="0 0 44 44">
    <rect x="9" y="9" width="26" height="26" rx="5" fill={c} />
    {[14, 22, 30].map((p) => (
      <g key={p}>
        <rect x={p - 1.5} y="2" width="3" height="6" fill={c} />
        <rect x={p - 1.5} y="36" width="3" height="6" fill={c} />
        <rect x="2" y={p - 1.5} width="6" height="3" fill={c} />
        <rect x="36" y={p - 1.5} width="6" height="3" fill={c} />
      </g>
    ))}
  </svg>
);
export const Star: React.FC<{c: string; s?: number}> = ({c, s = 46}) => (
  <svg width={s} height={s} viewBox="0 0 24 24">
    <path d="M12 1.8l3.1 6.6 7.2.9-5.3 5 1.4 7.1L12 17.9 5.6 21.4 7 14.3 1.7 9.3l7.2-.9z" fill={c} stroke={INK} strokeWidth="1.2" />
  </svg>
);
export const Chat: React.FC<{c: string; fg?: string}> = ({c, fg = '#fff'}) => (
  <svg width="54" height="54" viewBox="0 0 54 54">
    <path d="M27 5C14.8 5 5 14 5 25.3c0 4.3 1.5 8.3 4 11.6L6.5 48l11.6-4c2.7 1.1 5.7 1.7 8.9 1.7 12.2 0 22-9 22-20.3S39.2 5 27 5z" fill={c} />
    <circle cx="17" cy="25.5" r="3.2" fill={fg} />
    <circle cx="27" cy="25.5" r="3.2" fill={fg} />
    <circle cx="37" cy="25.5" r="3.2" fill={fg} />
  </svg>
);
export const Send: React.FC<{c: string}> = ({c}) => (
  <svg width="46" height="46" viewBox="0 0 24 24">
    <path d="M2.5 11.2 21 3l-6.8 18.5-3.4-7.3z" fill={c} />
    <path d="M10.8 14.2 21 3" stroke={INK} strokeWidth="1.6" />
  </svg>
);

// ---------- pills ----------
export const Pill: React.FC<{
  at: number;
  label: React.ReactNode;
  icon?: React.ReactNode;
  accent?: string;
  big?: boolean;
  solid?: boolean;
}> = ({at, label, icon, accent = PURPLE, big = false, solid = false}) => {
  const s = useSpring(at);
  const f = useCurrentFrame();
  if (f < at) return null;
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: big ? '18px 34px 18px 22px' : '12px 26px 12px 16px',
        borderRadius: 999,
        background: solid ? accent : 'rgba(14,8,24,0.72)',
        border: `3px solid ${solid ? 'rgba(255,255,255,0.35)' : accent}`,
        boxShadow: `0 10px 30px rgba(0,0,0,0.45), 0 0 26px ${accent}55`,
        backdropFilter: 'blur(14px)',
        transform: `translateY(${interpolate(s, [0, 1], [-40, 0])}px) scale(${interpolate(s, [0, 1], [0.6, 1])})`,
        opacity: interpolate(s, [0, 0.4], [0, 1], {extrapolateRight: 'clamp'}),
        transformOrigin: 'left center',
        color: solid ? INK : '#fff',
        fontFamily: 'InterDisplay',
        fontWeight: 800,
        fontSize: big ? 52 : 44,
        letterSpacing: -0.5,
        whiteSpace: 'nowrap',
      }}
    >
      {icon}
      <span>{label}</span>
    </div>
  );
};

export const TopRow: React.FC<{children: React.ReactNode; column?: boolean}> = ({children, column}) => (
  <AbsoluteFill style={{pointerEvents: 'none'}}>
    <div
      style={{
        position: 'absolute',
        top: SAFE.top + 10,
        left: SAFE.left + 4,
        right: 1080 - SAFE.right,
        display: 'flex',
        flexDirection: column ? 'column' : 'row',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: 14,
      }}
    >
      {children}
    </div>
  </AbsoluteFill>
);

// ---------- segment groups ----------
export const SpecRow: React.FC<{a: number; b: number; c: number; model?: string; colour?: string; swatch?: string}> = ({a, b, c, model = 'iPhone 12', colour = 'Purple', swatch = 'linear-gradient(135deg,#d9c6ff,#9c7be6)'}) => (
  <TopRow>
    <Pill at={a} icon={<Phone c={PURPLE} />} label={model} />
    <Pill at={b} icon={<Chip c={YELLOW} />} label="128GB" accent={YELLOW} />
    <Pill
      at={c}
      icon={<div style={{width: 38, height: 38, borderRadius: 999, background: swatch, border: '3px solid #fff'}} />}
      label={colour}
    />
  </TopRow>
);

export const ConditionRow: React.FC<{a: number; b: number; fill: number}> = ({a, b, fill}) => {
  const f = useCurrentFrame();
  const lvl = interpolate(f, [b + 2, fill + 4], [0.08, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  const done = f >= fill;
  const flash = done ? interpolate(f - fill, [0, 10], [1, 0], {extrapolateRight: 'clamp'}) : 0;
  return (
    <TopRow>
      <Pill at={a} icon={<Check c={GREEN} />} label="Condition Tip Top" accent={GREEN} />
      <Pill
        at={b}
        accent={done ? GREEN : YELLOW}
        icon={
          <svg width="74" height="40" viewBox="0 0 74 40">
            <rect x="2" y="3" width="62" height="34" rx="9" fill="none" stroke="#fff" strokeWidth="4" />
            <rect x="66" y="13" width="6" height="14" rx="2.5" fill="#fff" />
            <rect x="7" y="8" width={52 * lvl} height="24" rx="5" fill={lvl > 0.95 ? GREEN : YELLOW} />
          </svg>
        }
        label={
          <span>
            Battery Health{' '}
            <span style={{color: done ? GREEN : YELLOW, textShadow: `0 0 ${20 * flash}px ${GREEN}`}}>{Math.round(lvl * 100)}%</span>
          </span>
        }
      />
    </TopRow>
  );
};

export const BodyRow: React.FC<{a: number; b: number; labelA?: string; labelB?: string}> = ({a, b, labelA = 'Body Cantik', labelB = 'Almost Perfect'}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <TopRow>
      <Pill at={a} icon={<Spark c={PURPLE} />} label={labelA} />
      <Pill
        at={b}
        accent={YELLOW}
        label={
          <span style={{display: 'flex', alignItems: 'center', gap: 4}}>
            {[0, 1, 2, 3, 4].map((i) => {
              const s = spring({frame: f - b - i * 4, fps, config: {damping: 9, stiffness: 260, mass: 0.5}});
              return (
                <span key={i} style={{display: 'inline-flex', transform: `scale(${s}) rotate(${(1 - s) * -90}deg)`}}>
                  <Star c={YELLOW} />
                </span>
              );
            })}
            <span style={{marginLeft: 10}}>{labelB}</span>
          </span>
        }
      />
    </TopRow>
  );
};

export const CtaRow: React.FC<{dmAt: number}> = ({dmAt}) => {
  const f = useCurrentFrame();
  const pulse = 1 + 0.035 * Math.sin((f / 30) * Math.PI * 2.2);
  return (
    <TopRow column>
      <div style={{transform: `scale(${pulse})`, transformOrigin: 'left center'}}>
        <Pill at={0} big solid accent={GREEN} icon={<Chat c={INK} fg={GREEN} />} label="WhatsApp Admin" />
      </div>
      <Pill at={dmAt} big icon={<Send c={PURPLE} />} label={<span>DM kami • <span style={{color: YELLOW}}>Link di Bio</span></span>} />
    </TopRow>
  );
};

// ---------- hook ----------
export const HookTitle: React.FC<{priceAt: number}> = ({priceAt}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pill = spring({frame: f, fps, config: {damping: 14, stiffness: 160}});
  const stamp = spring({frame: f - priceAt, fps, config: {damping: 8, stiffness: 200, mass: 0.8}});
  const sahaja = spring({frame: f - priceAt - 26, fps, config: {damping: 9, stiffness: 220, mass: 0.6}});
  const shake = f >= priceAt && f < priceAt + 8 ? Math.sin(f * 2.7) * (8 - (f - priceAt)) * 1.6 : 0;
  const shine = interpolate((f - priceAt) % 50, [10, 30], [-120, 220], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{pointerEvents: 'none', transform: `translateX(${shake}px)`}}>
      <div
        style={{
          position: 'absolute',
          top: SAFE.top + 6,
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          transform: `translateY(${interpolate(pill, [0, 1], [-30, 0])}px)`,
          opacity: pill,
        }}
      >
        <div
          style={{
            padding: '12px 30px',
            borderRadius: 999,
            background: 'rgba(183,148,255,0.22)',
            border: `3px solid ${PURPLE}`,
            color: '#fff',
            fontFamily: 'InterDisplay',
            fontWeight: 800,
            fontSize: 42,
            letterSpacing: 1,
          }}
        >
          iPHONE 12 • 128GB • PURPLE
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          top: 300,
          width: '100%',
          textAlign: 'center',
          transform: `scale(${interpolate(stamp, [0, 1], [2.6, 1])}) rotate(-3deg)`,
          opacity: interpolate(stamp, [0, 0.3], [0, 1], {extrapolateRight: 'clamp'}),
        }}
      >
        <span
          style={{
            position: 'relative',
            display: 'inline-block',
            fontFamily: 'InterDisplay',
            fontWeight: 900,
            fontSize: 210,
            lineHeight: 1,
            letterSpacing: -6,
            color: YELLOW,
            WebkitTextStroke: `14px ${INK}`,
            paintOrder: 'stroke fill',
            textShadow: `0 12px 0 #7a4fe0, 0 22px 40px rgba(0,0,0,0.6)`,
            overflow: 'hidden',
          }}
        >
          RM799
        </span>
      </div>
      <div
        style={{
          position: 'absolute',
          top: 470,
          left: 600,
          transform: `scale(${sahaja}) rotate(8deg)`,
          background: '#ff3b5c',
          color: '#fff',
          padding: '8px 22px',
          borderRadius: 14,
          fontFamily: 'InterDisplay',
          fontWeight: 900,
          fontSize: 50,
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
          border: '3px solid #fff',
        }}
      >
        SAHAJA!
      </div>
      {/* light sweep across the price */}
      <div
        style={{
          position: 'absolute',
          top: 300,
          left: 0,
          width: '100%',
          height: 220,
          background: `linear-gradient(100deg, transparent ${shine - 10}%, rgba(255,255,255,0.35) ${shine}%, transparent ${shine + 10}%)`,
          mixBlendMode: 'overlay',
          opacity: f > priceAt ? 1 : 0,
        }}
      />
    </AbsoluteFill>
  );
};

// ---------- end card ----------
export const EndCard: React.FC<{title?: string; price?: string; was?: string; cta?: string}> = ({title = 'iPHONE 12 • 128GB', price = 'RM799', was, cta = 'WhatsApp / DM'}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const bg = interpolate(f, [0, 8], [0, 1], {extrapolateRight: 'clamp'});
  const a = spring({frame: f, fps, config: {damping: 10, stiffness: 180}});
  const b = spring({frame: f - 6, fps, config: {damping: 10, stiffness: 180}});
  const c = spring({frame: f - 12, fps, config: {damping: 12, stiffness: 180}});
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill style={{backdropFilter: `blur(${24 * bg}px)`, background: `rgba(13,7,22,${0.55 * bg})`}} />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingBottom: 260, gap: 24, display: 'flex', flexDirection: 'column'}}>
        <div style={{transform: `scale(${a})`, fontFamily: 'InterDisplay', fontWeight: 800, fontSize: 56, color: '#fff', letterSpacing: 1}}>
          {title}
        </div>
        {was ? (
          <div style={{transform: `scale(${a})`, position: 'relative', fontFamily: 'InterDisplay', fontWeight: 800, fontSize: 64, color: 'rgba(255,255,255,0.75)'}}>
            Harga asal{' '}
            <span style={{position: 'relative', display: 'inline-block'}}>
              {was}
              <span style={{position: 'absolute', left: -6, right: -6, top: '50%', height: 8, background: '#ff3b5c', borderRadius: 4, transform: 'rotate(-6deg)'}} />
            </span>
          </div>
        ) : null}
        <div
          style={{
            transform: `scale(${b}) rotate(-3deg)`,
            fontFamily: 'InterDisplay',
            fontWeight: 900,
            fontSize: price.length > 5 ? 190 : 230,
            lineHeight: 1,
            color: YELLOW,
            WebkitTextStroke: `14px ${INK}`,
            paintOrder: 'stroke fill',
            textShadow: '0 12px 0 #7a4fe0, 0 22px 40px rgba(0,0,0,0.6)',
            letterSpacing: -6,
          }}
        >
          {price}
        </div>
        <div style={{transform: `scale(${c})`, display: 'flex', gap: 16}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 12, background: GREEN, color: INK, padding: '14px 30px', borderRadius: 999, fontFamily: 'InterDisplay', fontWeight: 900, fontSize: 44}}>
            <Chat c={INK} fg={GREEN} /> {cta}
          </div>
        </div>
        <div style={{opacity: c, fontFamily: 'InterDisplay', fontWeight: 800, fontSize: 44, color: '#fff'}}>Siapa cepat, dia dapat!</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------- misc ----------
export const Flash: React.FC = () => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{background: '#fff', opacity: interpolate(f, [0, 4], [0.28, 0], {extrapolateRight: 'clamp'}), pointerEvents: 'none'}} />;
};

export const PurpleWash: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        pointerEvents: 'none',
        boxShadow: `inset 0 0 220px rgba(160,110,255,${interpolate(f, [0, 10], [0, 0.55], {extrapolateRight: 'clamp'})})`,
      }}
    />
  );
};

export const ProgressBar: React.FC<{total: number}> = ({total}) => {
  const f = useCurrentFrame();
  return (
    <div style={{position: 'absolute', top: 204, left: SAFE.left, width: SAFE.right - SAFE.left, height: 6, borderRadius: 6, background: 'rgba(255,255,255,0.18)'}}>
      <div style={{width: `${(f / total) * 100}%`, height: '100%', borderRadius: 6, background: `linear-gradient(90deg, ${PURPLE}, ${YELLOW})`}} />
    </div>
  );
};

export const SafeZoneGuide: React.FC = () => (
  <AbsoluteFill style={{pointerEvents: 'none'}}>
    <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: SAFE.top, background: 'rgba(255,0,60,0.25)'}} />
    <div style={{position: 'absolute', left: 0, right: 0, top: SAFE.bottom, bottom: 0, background: 'rgba(255,0,60,0.25)'}} />
    <div style={{position: 'absolute', left: SAFE.right, width: 1080 - SAFE.right, top: 700, bottom: 1920 - SAFE.bottom, background: 'rgba(255,0,60,0.25)'}} />
    <div style={{position: 'absolute', left: 0, width: SAFE.left, top: 0, bottom: 0, background: 'rgba(255,0,60,0.18)'}} />
  </AbsoluteFill>
);
