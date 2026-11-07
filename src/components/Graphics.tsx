import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { ANTON, C, MONT } from "../fonts";
import { SAFE, SAFE_W } from "../safe";

/* ------------------------------------------------------------------ */
/* Shared helpers                                                       */
/* ------------------------------------------------------------------ */

/** Spring-in / quick-out envelope for a graphic living `dur` frames. */
export const useEnvelope = (dur: number, outFrames = 8) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inn = spring({ frame, fps, config: { damping: 12, stiffness: 180, mass: 0.8 } });
  const out = interpolate(frame, [dur - outFrames, dur], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.cubic),
  });
  return { frame, fps, inn, out, v: Math.min(inn, out) };
};

const pop = (frame: number, fps: number, at: number) =>
  spring({ frame: frame - at, fps, config: { damping: 9, stiffness: 260, mass: 0.6 } });

/** Places children inside the safe area at the slot's top, scaled to fit. */
export const Placed: React.FC<{ top: number; scale: number; children: React.ReactNode; align?: "center" | "left" }> = ({
  top,
  scale,
  children,
  align = "center",
}) => (
  <div
    style={{
      position: "absolute",
      left: SAFE.left,
      width: SAFE_W,
      top,
      display: "flex",
      flexDirection: "column",
      alignItems: align === "center" ? "center" : "flex-start",
      transform: `scale(${scale})`,
      transformOrigin: "50% 0%",
    }}
  >
    {children}
  </div>
);

const shadow = "0 14px 40px rgba(0,0,0,0.45), 0 4px 0 rgba(0,0,0,0.9)";

const Chip: React.FC<{
  children: React.ReactNode;
  bg?: string;
  color?: string;
  size?: number;
  style?: React.CSSProperties;
}> = ({ children, bg = C.white, color = C.ink, size = 54, style }) => (
  <div
    style={{
      fontFamily: MONT,
      fontWeight: 900,
      fontSize: size,
      textTransform: "uppercase",
      color,
      background: bg,
      padding: `${size * 0.18}px ${size * 0.42}px`,
      borderRadius: size * 0.36,
      border: "5px solid #000",
      boxShadow: shadow,
      whiteSpace: "nowrap",
      lineHeight: 1.05,
      display: "flex",
      alignItems: "center",
      gap: size * 0.25,
      ...style,
    }}
  >
    {children}
  </div>
);

/* ------------------------------------------------------------------ */
/* Icons (inline SVG so they render identically everywhere)             */
/* ------------------------------------------------------------------ */

export const Check: React.FC<{ s?: number; c?: string }> = ({ s = 48, c = C.green }) => (
  <svg width={s} height={s} viewBox="0 0 48 48">
    <circle cx="24" cy="24" r="22" fill={c} stroke="#000" strokeWidth="4" />
    <path d="M13 25 l7 7 l15 -16" fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
export const Warn: React.FC<{ s?: number }> = ({ s = 48 }) => (
  <svg width={s} height={s} viewBox="0 0 48 48">
    <path d="M24 3 L46 43 H2 Z" fill={C.yellow} stroke="#000" strokeWidth="4" strokeLinejoin="round" />
    <rect x="21.5" y="16" width="5" height="15" rx="2" fill="#000" />
    <circle cx="24" cy="36.5" r="3" fill="#000" />
  </svg>
);
export const Cross: React.FC<{ s?: number }> = ({ s = 48 }) => (
  <svg width={s} height={s} viewBox="0 0 48 48">
    <circle cx="24" cy="24" r="22" fill={C.red} stroke="#000" strokeWidth="4" />
    <path d="M16 16 L32 32 M32 16 L16 32" stroke="#fff" strokeWidth="6" strokeLinecap="round" />
  </svg>
);

/* ------------------------------------------------------------------ */
/* 1. HOOK title                                                        */
/* ------------------------------------------------------------------ */

export const HookTitle: React.FC<{
  dur: number;
  kicker?: string;
  lines?: string[];
  footer?: string;
  color?: string;
  footerAt?: number;
}> = ({ dur, kicker = "Tolak motor?", lines = ["Harga", "Maksimum"], footer = "Ini caranya 👇", color = C.yellow, footerAt = 34 }) => {
  const { frame, fps, v, out } = useEnvelope(dur, 6);
  const l1 = pop(frame, fps, 0);
  const l2 = pop(frame, fps, 10);
  const l3 = pop(frame, fps, footerAt);
  const shake = frame < 40 ? Math.sin(frame * 1.7) * 3 * (1 - frame / 40) : 0;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, opacity: out }}>
      <Chip bg={C.ink} color={C.white} size={44} style={{ transform: `scale(${l1}) rotate(-3deg)` }}>
        {kicker}
      </Chip>
      <div
        style={{
          fontFamily: ANTON,
          fontSize: 150,
          lineHeight: 0.95,
          color,
          textTransform: "uppercase",
          WebkitTextStroke: "10px #000",
          paintOrder: "stroke fill",
          textShadow: "0 10px 0 #000, 0 20px 40px rgba(0,0,0,0.5)",
          transform: `scale(${interpolate(l2, [0, 1], [2.2, 1])}) translateX(${shake}px)`,
          opacity: Math.min(1, l2 * 2),
          textAlign: "center",
        }}
      >
        {lines.map((l, i) => (
          <React.Fragment key={i}>
            {i > 0 && <br />}
            {l}
          </React.Fragment>
        ))}
      </div>
      <Chip bg={C.red} color={C.white} size={46} style={{ transform: `scale(${l3}) rotate(2deg)`, opacity: v }}>
        {footer}
      </Chip>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* 2. Generic sticker title (kicker + big line)                        */
/* ------------------------------------------------------------------ */

export const Sticker: React.FC<{
  dur: number;
  kicker?: string;
  title: string;
  color?: string;
  bg?: string;
  tilt?: number;
  icon?: React.ReactNode;
}> = ({ dur, kicker, title, color = C.ink, bg = C.yellow, tilt = -2, icon }) => {
  const { frame, fps, inn, out } = useEnvelope(dur);
  const k = pop(frame, fps, 4);
  const wob = Math.sin(frame / 9) * 1.2;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        opacity: out,
        transform: `scale(${interpolate(inn, [0, 1], [0.3, 1])}) rotate(${tilt + wob}deg)`,
      }}
    >
      {kicker && (
        <Chip bg={C.ink} color={C.white} size={38} style={{ transform: `scale(${k})` }}>
          {kicker}
        </Chip>
      )}
      {/* auto-fit: keep long titles inside the 860px safe width */}
      <Chip bg={bg} color={color} size={Math.min(72, Math.floor(1180 / Math.max(8, [...title].length)))}>
        {icon}
        {title}
      </Chip>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* 3. Rows that reveal one by one (LUARAN ✅ / DALAM ⚠️)               */
/* ------------------------------------------------------------------ */

export type Row = { at: number; label: string; value: string; icon: "check" | "warn" | "cross"; accent?: string };

export const RevealRows: React.FC<{ dur: number; rows: Row[]; title?: string; compact?: boolean }> = ({ dur, rows, title, compact = false }) => {
  const k = compact ? 0.78 : 1;
  const { frame, fps, inn, out } = useEnvelope(dur);
  return (
    <div
      style={{
        opacity: out,
        transform: `translateY(${interpolate(inn, [0, 1], [-40, 0])}px)`,
        display: "flex",
        flexDirection: "column",
        gap: 14,
        alignItems: "stretch",
        minWidth: 640,
        maxWidth: 860,
      }}
    >
      {title && (
        <div style={{ alignSelf: "center", transform: `scale(${inn})` }}>
          <Chip bg={C.ink} color={C.white} size={40}>
            {title}
          </Chip>
        </div>
      )}
      {rows.map((r, i) => {
        const p = pop(frame, fps, r.at);
        const Icon = r.icon === "check" ? Check : r.icon === "warn" ? Warn : Cross;
        return (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 18,
              background: C.white,
              border: "5px solid #000",
              borderRadius: 26 * k,
              padding: compact ? "8px 20px" : "14px 24px",
              boxShadow: shadow,
              transform: `translateX(${interpolate(p, [0, 1], [i % 2 ? 300 : -300, 0])}px) scale(${interpolate(p, [0, 1], [0.6, 1])})`,
              opacity: Math.min(1, p * 1.5),
            }}
          >
            <Icon s={60 * k} />
            <div style={{ fontFamily: MONT, fontWeight: 800, fontSize: 36 * k, color: "#555", textTransform: "uppercase", whiteSpace: "nowrap" }}>
              {r.label}
            </div>
            <div
              style={{
                fontFamily: MONT,
                fontWeight: 900,
                fontSize: 52 * k,
                color: r.accent ?? C.ink,
                textTransform: "uppercase",
                marginLeft: "auto",
                paddingLeft: 24,
                whiteSpace: "nowrap",
              }}
            >
              {r.value}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* 4. Stamp slam ("MOTOR ROSAK? KAMI TERIMA")                          */
/* ------------------------------------------------------------------ */

export const Stamp: React.FC<{ dur: number; top: string; main: string; color?: string }> = ({
  dur,
  top,
  main,
  color = C.green,
}) => {
  const { frame, fps, out } = useEnvelope(dur);
  const s = spring({ frame, fps, config: { damping: 7, stiffness: 320, mass: 0.7 } });
  const scale = interpolate(s, [0, 1], [3, 1]);
  const t = pop(frame, fps, 0);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, opacity: out }}>
      <Chip bg={C.white} color={C.ink} size={44} style={{ transform: `scale(${t}) rotate(2deg)` }}>
        {top}
      </Chip>
      <div
        style={{
          fontFamily: ANTON,
          fontSize: 120,
          color,
          textTransform: "uppercase",
          padding: "4px 34px",
          border: `10px solid ${color}`,
          borderRadius: 24,
          background: "rgba(255,255,255,0.92)",
          transform: `scale(${scale}) rotate(-6deg)`,
          opacity: Math.min(1, s * 1.4),
          boxShadow: "0 18px 50px rgba(0,0,0,0.45)",
          letterSpacing: 2,
        }}
      >
        {main}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* 5. Chip cloud – brands we accept                                     */
/* ------------------------------------------------------------------ */

export const ChipCloud: React.FC<{ dur: number; title: string; items: { at: number; text: string }[] }> = ({
  dur,
  title,
  items,
}) => {
  const { frame, fps, inn, out } = useEnvelope(dur);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, opacity: out, width: 860 }}>
      <Chip bg={C.ink} color={C.yellow} size={46} style={{ transform: `scale(${inn}) rotate(-2deg)` }}>
        <Check s={46} /> {title}
      </Chip>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 14 }}>
        {items.map((it, i) => {
          const p = pop(frame, fps, it.at);
          return (
            <Chip
              key={i}
              bg={i % 2 ? C.white : C.yellow}
              size={46}
              style={{
                transform: `scale(${p}) rotate(${((i % 3) - 1) * 3}deg)`,
                opacity: Math.min(1, p * 2),
              }}
            >
              {it.text}
            </Chip>
          );
        })}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* 6. Price meter (fills to MAX)                                       */
/* ------------------------------------------------------------------ */

export const PriceMeter: React.FC<{ dur: number; fillAt: number; label: string }> = ({ dur, fillAt, label }) => {
  const { frame, fps, inn, out } = useEnvelope(dur);
  const fill = interpolate(frame, [fillAt, fillAt + 22], [0.12, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.back(1.4)),
  });
  const maxPop = pop(frame, fps, fillAt + 20);
  return (
    <div
      style={{
        opacity: out,
        transform: `scale(${interpolate(inn, [0, 1], [0.5, 1])})`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 14,
      }}
    >
      <Chip bg={C.ink} color={C.white} size={40}>
        {label}
      </Chip>
      <div style={{ position: "relative", width: 720, height: 84, borderRadius: 42, background: "#fff", border: "6px solid #000", boxShadow: shadow, overflow: "hidden" }}>
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: `${Math.min(1, fill) * 100}%`,
            background: `linear-gradient(90deg, ${C.green}, #A8F000, ${C.yellow})`,
          }}
        />
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 26px", fontFamily: MONT, fontWeight: 900, fontSize: 34, color: C.ink }}>
          <span>RM</span>
          <span>RM RM</span>
          <span>RM RM RM</span>
        </div>
      </div>
      <div
        style={{
          fontFamily: ANTON,
          fontSize: 96,
          color: C.yellow,
          WebkitTextStroke: "8px #000",
          paintOrder: "stroke fill",
          transform: `scale(${maxPop}) rotate(-4deg)`,
          textShadow: "0 8px 0 #000",
        }}
      >
        HARGA MAX 💰
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* 7. Price minus repair cost                                          */
/* ------------------------------------------------------------------ */

export const MinusRepair: React.FC<{ dur: number; minusAt: number }> = ({ dur, minusAt }) => {
  const { frame, fps, inn, out } = useEnvelope(dur);
  const m = pop(frame, fps, minusAt);
  const shake = frame > minusAt && frame < minusAt + 10 ? Math.sin(frame * 3) * 8 : 0;
  return (
    <div style={{ opacity: out, display: "flex", flexDirection: "column", alignItems: "center", gap: 12, transform: `translateX(${shake}px)` }}>
      <Chip bg={C.white} size={56} style={{ transform: `scale(${inn})` }}>
        <Warn s={58} /> Ada rosak / problem?
      </Chip>
      <Chip bg={C.red} color={C.white} size={60} style={{ transform: `scale(${m}) rotate(-3deg)`, opacity: Math.min(1, m * 2) }}>
        Harga − kos repair 🔧
      </Chip>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* 8. Price drop x3                                                     */
/* ------------------------------------------------------------------ */

export const DropDropDrop: React.FC<{ dur: number; drops: number[]; introAt?: number }> = ({ dur, drops, introAt = 0 }) => {
  const { frame, fps, inn, out } = useEnvelope(dur);
  const head = pop(frame, fps, introAt);
  return (
    <div style={{ opacity: out, display: "flex", alignItems: "center", gap: 26 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, transform: `scale(${inn})` }}>
        <Chip bg={C.ink} color={C.white} size={40} style={{ transform: `scale(${head})` }}>
          Buruk + rosak
        </Chip>
        <svg width="150" height="190" viewBox="0 0 150 190" style={{ transform: `translateY(${interpolate(frame, [drops[0], drops[2] + 10], [0, 30], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px)` }}>
          <path d="M45 10 H105 V110 H140 L75 182 L10 110 H45 Z" fill={C.red} stroke="#000" strokeWidth="8" strokeLinejoin="round" />
        </svg>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {drops.map((at, i) => {
          const p = spring({ frame: frame - at, fps, config: { damping: 10, stiffness: 300 } });
          return (
            <div
              key={i}
              style={{
                fontFamily: ANTON,
                fontSize: 92 - i * 4,
                lineHeight: 1,
                color: i === 2 ? C.red : C.white,
                WebkitTextStroke: "7px #000",
                paintOrder: "stroke fill",
                textShadow: "0 7px 0 #000",
                transform: `translateY(${interpolate(p, [0, 1], [-80, 0])}px) rotate(${(i - 1) * 4}deg)`,
                opacity: Math.min(1, p * 2),
                marginLeft: i * 30,
              }}
            >
              DROP!
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* 9. Tip card with sparkles                                            */
/* ------------------------------------------------------------------ */

const Sparkle: React.FC<{ x: number; y: number; s: number; t: number }> = ({ x, y, s, t }) => {
  const k = Math.max(0, Math.sin(t));
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 40 40"
      style={{ position: "absolute", left: x, top: y, transform: `scale(${k}) rotate(${t * 40}deg)`, opacity: k }}
    >
      <path d="M20 0 C22 14 26 18 40 20 C26 22 22 26 20 40 C18 26 14 22 0 20 C14 18 18 14 20 0Z" fill="#fff" stroke={C.yellow} strokeWidth="2" />
    </svg>
  );
};

export const TipCard: React.FC<{ dur: number; washAt: number; shineAt: number }> = ({ dur, washAt, shineAt }) => {
  const { frame, fps, inn, out } = useEnvelope(dur);
  const w = pop(frame, fps, washAt);
  const g = pop(frame, fps, shineAt);
  const sweep = interpolate(frame, [shineAt, shineAt + 18], [-120, 820], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ opacity: out, position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      <Chip bg={C.yellow} size={52} style={{ transform: `scale(${inn}) rotate(-4deg)` }}>
        💡 Tips harga max
      </Chip>
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          background: C.blue,
          border: "6px solid #000",
          borderRadius: 30,
          padding: "18px 40px",
          boxShadow: shadow,
          transform: `scale(${w})`,
          textAlign: "center",
        }}
      >
        <div style={{ fontFamily: ANTON, fontSize: 104, color: C.white, lineHeight: 1, textTransform: "uppercase" }}>
          Basuh dulu 🧽
        </div>
        <div
          style={{
            fontFamily: MONT,
            fontWeight: 900,
            fontSize: 54,
            color: C.yellow,
            textTransform: "uppercase",
            transform: `scale(${g})`,
            marginTop: 6,
          }}
        >
          bagi nampak gilap ✨
        </div>
        <div
          style={{
            position: "absolute",
            top: -40,
            bottom: -40,
            left: sweep,
            width: 90,
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.75), transparent)",
            transform: "rotate(18deg)",
          }}
        />
      </div>
      {frame > shineAt &&
        [
          [-30, 60, 70, 0],
          [640, 40, 56, 1.3],
          [700, 200, 44, 2.1],
          [-10, 230, 50, 0.7],
          [320, -30, 40, 1.9],
        ].map(([x, y, s, ph], i) => <Sparkle key={i} x={x} y={y} s={s} t={(frame - shineAt) / 7 + ph} />)}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* 10. CTA: DM + location in bio                                       */
/* ------------------------------------------------------------------ */

export const CtaDM: React.FC<{
  dur: number;
  tradeAt: number;
  bioAt: number;
  items?: string[];
  footer?: string;
}> = ({ dur, tradeAt, bioAt, items = ["Jual", "Trade-in", "Beli"], footer = "📍 Lokasi & no. phone kat BIO ☝️" }) => {
  const { frame, fps, inn, out } = useEnvelope(dur, 1);
  const t = (n: number) => pop(frame, fps, tradeAt + n * 6);
  const b = pop(frame, fps, bioAt);
  const bob = Math.sin(frame / 5) * 6;
  return (
    <div style={{ opacity: out, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 18,
          background: C.white,
          border: "6px solid #000",
          borderRadius: 40,
          padding: "16px 34px 16px 18px",
          boxShadow: shadow,
          transform: `scale(${inn}) rotate(-2deg)`,
        }}
      >
        <div
          style={{
            width: 92,
            height: 92,
            borderRadius: 46,
            background: "linear-gradient(135deg,#FEDA75,#FA7E1E,#D62976,#962FBF,#4F5BD5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 50,
            border: "4px solid #000",
          }}
        >
          💬
        </div>
        <div style={{ fontFamily: ANTON, fontSize: 92, color: C.ink, lineHeight: 1 }}>DM JE!</div>
        <div
          style={{
            marginLeft: 6,
            background: C.red,
            color: "#fff",
            fontFamily: MONT,
            fontWeight: 900,
            fontSize: 36,
            borderRadius: 30,
            padding: "4px 16px",
            transform: `scale(${pop(frame, fps, 8)})`,
          }}
        >
          1
        </div>
      </div>
      <div style={{ display: "flex", gap: 12 }}>
        {items.map((s, i) => (
          <Chip key={s} bg={i === 1 ? C.yellow : C.white} size={44} style={{ transform: `scale(${t(i)})`, opacity: Math.min(1, t(i) * 2) }}>
            <Check s={40} /> {s}
          </Chip>
        ))}
      </div>
      <Chip bg={C.ink} color={C.white} size={46} style={{ transform: `scale(${b}) translateY(${bob}px)`, opacity: Math.min(1, b * 2) }}>
        {footer}
      </Chip>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* 11. Burst – words slam in one by one ("PECAH! PECAH! PECAH!")        */
/* ------------------------------------------------------------------ */

export const Burst: React.FC<{ dur: number; label?: string; word: string; at: number[]; color?: string; crack?: boolean }> = ({
  dur,
  label,
  word,
  at,
  color = C.red,
  crack = false,
}) => {
  const { frame, fps, inn, out } = useEnvelope(dur);
  const last = at[at.length - 1];
  const shake = at.some((a) => frame >= a && frame < a + 6) ? Math.sin(frame * 4) * 7 : 0;
  return (
    <div style={{ opacity: out, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, transform: `translateX(${shake}px)` }}>
      {label && (
        <Chip bg={C.ink} color={C.white} size={40} style={{ transform: `scale(${inn}) rotate(-2deg)` }}>
          {label}
        </Chip>
      )}
      <div style={{ position: "relative", display: "flex", gap: 10, maxWidth: 860, justifyContent: "center" }}>
        {at.map((a, i) => {
          const p = spring({ frame: frame - a, fps, config: { damping: 8, stiffness: 320, mass: 0.6 } });
          return (
            <div
              key={i}
              style={{
                fontFamily: ANTON,
                fontSize: 78 + i * 8,
                lineHeight: 1,
                color: i === at.length - 1 ? color : C.white,
                WebkitTextStroke: "8px #000",
                paintOrder: "stroke fill",
                textShadow: "0 8px 0 #000",
                transform: `scale(${interpolate(p, [0, 1], [2.4, 1])}) rotate(${(i - 1) * 6}deg) translateY(${(i - 1) * -10}px)`,
                opacity: Math.min(1, p * 2),
              }}
            >
              {word}
            </div>
          );
        })}
        {crack && frame >= last && (
          <svg width="520" height="200" viewBox="0 0 520 200" style={{ position: "absolute", left: "50%", top: -20, marginLeft: -260, pointerEvents: "none" }}>
            <path
              d="M260 100 L200 40 L170 10 M260 100 L330 30 L360 0 M260 100 L120 120 L40 110 M260 100 L400 140 L500 130 M260 100 L240 190 M260 100 L300 180"
              fill="none"
              stroke="#fff"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray="420"
              strokeDashoffset={interpolate(frame - last, [0, 8], [420, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
              style={{ filter: "drop-shadow(0 0 3px #000)" }}
            />
          </svg>
        )}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* 12. Price tag swinging in                                            */
/* ------------------------------------------------------------------ */

export const PriceTag: React.FC<{ dur: number; kicker: string; price: string; note?: string }> = ({ dur, kicker, price, note }) => {
  const { frame, fps, inn, out } = useEnvelope(dur);
  const swing = spring({ frame, fps, config: { damping: 5, stiffness: 120, mass: 0.8 } });
  const rot = interpolate(swing, [0, 1], [-35, 0]);
  const n = pop(frame, fps, 12);
  return (
    <div style={{ opacity: out, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      <Chip bg={C.ink} color={C.white} size={40} style={{ transform: `scale(${inn})` }}>
        {kicker}
      </Chip>
      <div style={{ transform: `rotate(${rot - 4}deg)`, transformOrigin: "50% -40px", display: "flex", alignItems: "center" }}>
        <div
          style={{
            position: "relative",
            background: C.yellow,
            border: "7px solid #000",
            borderRadius: "28px 70px 70px 28px",
            padding: "8px 60px 8px 80px",
            boxShadow: shadow,
          }}
        >
          <div style={{ position: "absolute", left: 26, top: "50%", marginTop: -16, width: 32, height: 32, borderRadius: 16, background: "#fff", border: "6px solid #000" }} />
          <div style={{ fontFamily: ANTON, fontSize: 150, color: C.ink, lineHeight: 1 }}>{price}</div>
        </div>
      </div>
      {note && (
        <Chip bg={C.green} color={C.white} size={40} style={{ transform: `scale(${n}) rotate(2deg)` }}>
          {note}
        </Chip>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* 13. WhatsApp chat card                                               */
/* ------------------------------------------------------------------ */

export const WhatsAppCard: React.FC<{ dur: number; title: string; msgs: { at: number; text: string }[]; footer?: { at: number; text: string } }> = ({
  dur,
  title,
  msgs,
  footer,
}) => {
  const { frame, fps, inn, out } = useEnvelope(dur);
  const f = footer ? pop(frame, fps, footer.at) : 0;
  return (
    <div
      style={{
        opacity: out,
        width: 720,
        transform: `translateY(${interpolate(inn, [0, 1], [60, 0])}px) scale(${interpolate(inn, [0, 1], [0.7, 1])})`,
        background: "#ECE5DD",
        border: "6px solid #000",
        borderRadius: 34,
        overflow: "hidden",
        boxShadow: shadow,
      }}
    >
      <div style={{ background: "#075E54", padding: "14px 24px", display: "flex", alignItems: "center", gap: 16 }}>
        <svg width="56" height="56" viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="22" fill="#25D366" stroke="#fff" strokeWidth="3" />
          <path d="M15 33 l2-6 a9 9 0 1 1 4 4 z" fill="#fff" />
        </svg>
        <div style={{ fontFamily: MONT, fontWeight: 900, fontSize: 44, color: "#fff", textTransform: "uppercase" }}>{title}</div>
      </div>
      <div style={{ padding: "16px 22px", display: "flex", flexDirection: "column", gap: 12, alignItems: "flex-end" }}>
        {msgs.map((m, i) => {
          const p = pop(frame, fps, m.at);
          return (
            <div
              key={i}
              style={{
                background: "#DCF8C6",
                borderRadius: "22px 4px 22px 22px",
                padding: "10px 22px",
                fontFamily: MONT,
                fontWeight: 800,
                fontSize: 40,
                color: C.ink,
                boxShadow: "0 3px 0 rgba(0,0,0,0.25)",
                transform: `scale(${p})`,
                transformOrigin: "100% 0%",
                opacity: Math.min(1, p * 2),
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              {m.text}
              <span style={{ fontSize: 26, color: "#34B7F1", fontWeight: 900 }}>✓✓</span>
            </div>
          );
        })}
        {footer && (
          <div style={{ alignSelf: "center", transform: `scale(${f})`, opacity: Math.min(1, f * 2) }}>
            <Chip bg={C.yellow} size={40}>
              {footer.text}
            </Chip>
          </div>
        )}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* 14. Price ladder – each new price strikes the previous one          */
/* ------------------------------------------------------------------ */

export const PriceLadder: React.FC<{
  dur: number;
  title: string;
  steps: { at: number; price: string; tag?: string }[];
  note?: { at: number; text: string };
}> = ({ dur, title, steps, note }) => {
  const { frame, fps, inn, out } = useEnvelope(dur);
  const n = note ? pop(frame, fps, note.at) : 0;
  return (
    <div style={{ opacity: out, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      <Chip bg={C.ink} color={C.white} size={40} style={{ transform: `scale(${inn})` }}>
        {title}
      </Chip>
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        {steps.map((st, i) => {
          const p = pop(frame, fps, st.at);
          const next = steps[i + 1];
          const struck = next ? interpolate(frame, [next.at, next.at + 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;
          const isLast = i === steps.length - 1;
          if (frame < st.at - 1) return null;
          // keep only "previous (struck) -> current" on screen so the row fits the safe width
          const current = steps.reduce((ci, x, j) => (frame >= x.at - 1 ? j : ci), 0);
          if (i < current - 1) return null;
          return (
            <div
              key={i}
              style={{
                position: "relative",
                transform: `scale(${p * (1 - 0.25 * struck)})`,
                opacity: Math.min(1, p * 2) * (1 - 0.45 * struck),
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  fontFamily: ANTON,
                  fontSize: isLast ? 112 : 72,
                  lineHeight: 1,
                  color: isLast ? C.yellow : C.white,
                  WebkitTextStroke: "8px #000",
                  paintOrder: "stroke fill",
                  textShadow: "0 7px 0 #000",
                }}
              >
                {st.price}
              </div>
              {st.tag && (
                <div style={{ marginTop: 4 }}>
                  <Chip bg={isLast ? C.green : C.white} color={isLast ? C.white : C.ink} size={30}>
                    {st.tag}
                  </Chip>
                </div>
              )}
              <div
                style={{
                  position: "absolute",
                  left: -8,
                  top: "38%",
                  height: 10,
                  width: `${struck * 106}%`,
                  background: C.red,
                  border: "3px solid #000",
                  borderRadius: 6,
                  transform: "rotate(-8deg)",
                }}
              />
            </div>
          );
        })}
      </div>
      {note && (
        <div style={{ transform: `scale(${n})`, opacity: Math.min(1, n * 2) }}>
          <Chip bg={C.white} size={36}>
            {note.text}
          </Chip>
        </div>
      )}
    </div>
  );
};
