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

export const HookTitle: React.FC<{ dur: number }> = ({ dur }) => {
  const { frame, fps, v, out } = useEnvelope(dur, 6);
  const l1 = pop(frame, fps, 0);
  const l2 = pop(frame, fps, 10);
  const l3 = pop(frame, fps, 34);
  const shake = frame < 40 ? Math.sin(frame * 1.7) * 3 * (1 - frame / 40) : 0;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, opacity: out }}>
      <Chip bg={C.ink} color={C.white} size={44} style={{ transform: `scale(${l1}) rotate(-3deg)` }}>
        Tolak motor?
      </Chip>
      <div
        style={{
          fontFamily: ANTON,
          fontSize: 150,
          lineHeight: 0.95,
          color: C.yellow,
          textTransform: "uppercase",
          WebkitTextStroke: "10px #000",
          paintOrder: "stroke fill",
          textShadow: "0 10px 0 #000, 0 20px 40px rgba(0,0,0,0.5)",
          transform: `scale(${interpolate(l2, [0, 1], [2.2, 1])}) translateX(${shake}px)`,
          opacity: Math.min(1, l2 * 2),
          textAlign: "center",
        }}
      >
        Harga
        <br />
        Maksimum
      </div>
      <Chip bg={C.red} color={C.white} size={46} style={{ transform: `scale(${l3}) rotate(2deg)`, opacity: v }}>
        Ini caranya 👇
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

export const RevealRows: React.FC<{ dur: number; rows: Row[]; title?: string }> = ({ dur, rows, title }) => {
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
        width: 760,
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
              borderRadius: 26,
              padding: "14px 24px",
              boxShadow: shadow,
              transform: `translateX(${interpolate(p, [0, 1], [i % 2 ? 300 : -300, 0])}px) scale(${interpolate(p, [0, 1], [0.6, 1])})`,
              opacity: Math.min(1, p * 1.5),
            }}
          >
            <Icon s={60} />
            <div style={{ fontFamily: MONT, fontWeight: 800, fontSize: 40, color: "#555", textTransform: "uppercase" }}>
              {r.label}
            </div>
            <div
              style={{
                fontFamily: MONT,
                fontWeight: 900,
                fontSize: 52,
                color: r.accent ?? C.ink,
                textTransform: "uppercase",
                marginLeft: "auto",
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

export const CtaDM: React.FC<{ dur: number; tradeAt: number; bioAt: number }> = ({ dur, tradeAt, bioAt }) => {
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
        {["Jual", "Trade-in", "Beli"].map((s, i) => (
          <Chip key={s} bg={i === 1 ? C.yellow : C.white} size={44} style={{ transform: `scale(${t(i)})`, opacity: Math.min(1, t(i) * 2) }}>
            <Check s={40} /> {s}
          </Chip>
        ))}
      </div>
      <Chip bg={C.ink} color={C.white} size={46} style={{ transform: `scale(${b}) translateY(${bob}px)`, opacity: Math.min(1, b * 2) }}>
        📍 Lokasi & no. phone kat BIO ☝️
      </Chip>
    </div>
  );
};
