// Edit decision list. All times in SOURCE seconds (from the raw clip).
// Audio always comes from `a`; video comes from `v` (b-roll) when set, else from `a`.
export const FPS = 30;

export type Word = {t: string; s: number; e: number; hl?: boolean};
export type Seg = {
  id: string;
  a: [number, number];
  v?: number; // b-roll source start
  zoom?: number; // punch-in
  focusY?: number; // 0..1 transform-origin for punch-in
  words: Word[];
};

export const SEGS: Seg[] = [
  {
    // HOOK — strongest line moved to the front, over the purple back shot
    id: 'hook',
    a: [13.98, 17.8],
    v: 25.9,
    words: [
      {t: 'SIAPA', s: 16.3, e: 16.96},
      {t: 'CEPAT', s: 16.96, e: 17.4, hl: true},
      {t: 'DIA', s: 17.4, e: 17.5},
      {t: 'DAPAT!', s: 17.5, e: 17.8, hl: true},
    ],
  },
  {
    id: 'intro1',
    a: [0.03, 1.76],
    words: [
      {t: 'AKU', s: 0.03, e: 0.16},
      {t: 'ADA', s: 0.16, e: 0.58},
      {t: 'NAK', s: 0.58, e: 1.44},
      {t: 'LEGO', s: 1.44, e: 1.76, hl: true},
    ],
  },
  {
    // first "iPhone" was a restart — dropped
    id: 'intro2',
    a: [2.3, 3.72],
    zoom: 1.08,
    focusY: 0.45,
    words: [
      {t: 'IPHONE', s: 2.32, e: 3.0, hl: true},
      {t: '12', s: 3.0, e: 3.28, hl: true},
      {t: '128GB', s: 3.28, e: 3.68},
    ],
  },
  {
    id: 'purple',
    a: [4.85, 6.7],
    v: 26.2,
    zoom: 1.3,
    focusY: 0.35,
    words: [
      {t: 'COLOUR', s: 4.88, e: 5.78},
      {t: 'PURPLE', s: 5.78, e: 6.68, hl: true},
    ],
  },
  {
    id: 'condition',
    a: [17.85, 22.1],
    words: [
      {t: 'CONDITION', s: 17.85, e: 18.32},
      {t: 'TIP', s: 18.32, e: 19.1, hl: true},
      {t: 'TOP', s: 19.1, e: 19.36, hl: true},
      {t: 'BATTERY', s: 19.36, e: 19.68},
      {t: 'HEALTH', s: 19.68, e: 20.08},
      {t: 'CHARGING', s: 20.08, e: 20.58},
      {t: '100%', s: 20.58, e: 22.1, hl: true},
    ],
  },
  {
    id: 'body',
    a: [22.1, 24.92],
    words: [
      {t: 'KALAU', s: 22.6, e: 23.52},
      {t: 'TENGOK', s: 23.52, e: 23.94},
      {t: 'BODY', s: 23.94, e: 24.32, hl: true},
      {t: 'APA', s: 24.32, e: 24.66},
      {t: 'SEMUA', s: 24.66, e: 24.9},
    ],
  },
  {
    // long pause before this line removed
    id: 'perfect',
    a: [26.3, 28.05],
    words: [
      {t: 'CANTIK', s: 26.32, e: 27.22, hl: true},
      {t: 'ALMOST', s: 27.22, e: 27.5},
      {t: 'PERFECT', s: 27.5, e: 28.04, hl: true},
    ],
  },
  {
    // "ok... so" filler removed
    id: 'cta',
    a: [29.95, 35.5],
    words: [
      {t: 'SIAPA', s: 30.0, e: 31.26},
      {t: 'NAK', s: 31.26, e: 31.36},
      {t: 'BOLEH', s: 31.36, e: 31.56},
      {t: 'WHATSAPP', s: 31.56, e: 32.34, hl: true},
      {t: 'ADMIN', s: 32.34, e: 32.6, hl: true},
      {t: 'BOLEH', s: 32.6, e: 33.7},
      {t: 'DM', s: 33.7, e: 34.4, hl: true},
      {t: 'KAMI', s: 34.4, e: 34.58},
      {t: 'DI', s: 34.58, e: 34.84},
      {t: 'BIO', s: 34.84, e: 35.44, hl: true},
    ],
  },
];

export const END_CARD = 1.7; // seconds, after last segment

export type Placed = Seg & {from: number; dur: number}; // frames on output timeline

export const placed: Placed[] = (() => {
  let f = 0;
  return SEGS.map((s) => {
    const dur = Math.round((s.a[1] - s.a[0]) * FPS);
    const p = {...s, from: f, dur};
    f += dur;
    return p;
  });
})();

export const BODY_FRAMES = placed[placed.length - 1].from + placed[placed.length - 1].dur;
export const TOTAL_FRAMES = BODY_FRAMES + Math.round(END_CARD * FPS);

export const seg = (id: string) => placed.find((p) => p.id === id)!;
// convert a source time inside segment `id` to an output frame
export const at = (id: string, srcT: number) => {
  const p = seg(id);
  return p.from + Math.round((srcT - p.a[0]) * FPS);
};
