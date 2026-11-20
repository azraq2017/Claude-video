import {FPS, placeSegs, Seg} from '../edl';

// iPhone 13 video — all times in SOURCE seconds (public/ip13/src.mp4)
export const SEGS13: Seg[] = [
  {
    // HOOK pt.1 — price anchor pulled from the middle of the clip
    id: 'h1',
    a: [25.45, 27.15],
    v: 29.0,
    words: [
      {t: 'HARGA', s: 25.52, e: 26.0},
      {t: 'ASAL', s: 26.0, e: 26.28},
      {t: 'RM1299', s: 26.28, e: 27.1},
    ],
  },
  {
    // HOOK pt.2 — the deal (original opening line)
    id: 'h2',
    a: [0.1, 4.68],
    v: 30.7,
    words: [
      {t: 'IPHONE', s: 0.1, e: 0.32},
      {t: '13', s: 0.32, e: 0.78},
      {t: 'NAK', s: 0.78, e: 1.34},
      {t: 'LEGO', s: 1.34, e: 1.74},
      {t: 'RM1099', s: 1.74, e: 3.86, hl: true},
      {t: 'SAHAJA!', s: 3.86, e: 4.46, hl: true},
    ],
  },
  // "ok so dekat depan hampa ni iPhone 13" — repeat, dropped
  {
    id: 'spec1',
    a: [10.93, 12.27],
    words: [
      {t: 'YANG', s: 10.95, e: 11.2},
      {t: 'INI', s: 11.2, e: 11.4},
      {t: 'SPEK', s: 11.4, e: 12.2},
    ],
  },
  {
    id: 'spec2',
    a: [12.83, 14.32],
    zoom: 1.06,
    words: [{t: '128GB', s: 12.85, e: 14.3, hl: true}],
  },
  {
    // "ok so" removed
    id: 'cond',
    a: [15.96, 18.72],
    words: [
      {t: 'CONDITION', s: 16.0, e: 16.62},
      {t: 'TIP', s: 16.62, e: 18.06, hl: true},
      {t: 'TOP', s: 18.06, e: 18.32, hl: true},
    ],
  },
  {
    id: 'bat1',
    a: [19.15, 20.48],
    words: [
      {t: 'BATTERY', s: 19.2, e: 19.98},
      {t: 'HEALTH', s: 19.98, e: 20.4},
    ],
  },
  {
    // "seperti biasa" removed
    id: 'bat2',
    a: [21.78, 24.88],
    zoom: 1.06,
    words: [
      {t: 'YANG', s: 21.8, e: 22.1},
      {t: 'HAMPA', s: 22.1, e: 22.3},
      {t: 'NAK', s: 22.3, e: 22.46},
      {t: 'TAHU', s: 22.46, e: 22.76},
      {t: 'ADALAH', s: 22.76, e: 23.28},
      {t: '100%', s: 23.28, e: 24.4, hl: true},
    ],
  },
  // "so yang ni kita nak lego jadi RM1099 sahaja" — repeat of the hook, dropped
  {
    id: 'best1',
    a: [35.36, 36.58],
    words: [{t: 'CONDITION', s: 35.42, e: 36.5}],
  },
  {
    id: 'best2',
    a: [36.86, 37.72],
    zoom: 1.08,
    words: [{t: 'TERBAIK!', s: 36.9, e: 37.7, hl: true}],
  },
  {
    id: 'cta',
    a: [38.78, 42.45],
    words: [
      {t: 'BOLEH', s: 39.0, e: 39.7},
      {t: 'DM', s: 40.05, e: 40.4, hl: true},
      {t: 'KAMI', s: 40.4, e: 40.6},
      {t: 'LINK', s: 40.6, e: 41.05, hl: true},
      {t: 'DI', s: 41.05, e: 41.35},
      {t: 'BIO', s: 41.35, e: 42.17, hl: true},
    ],
  },
];

export const placed13 = placeSegs(SEGS13);
export const BODY13 = placed13[placed13.length - 1].from + placed13[placed13.length - 1].dur;
export const TOTAL13 = BODY13 + Math.round(1.7 * FPS);
export const seg13 = (id: string) => placed13.find((p) => p.id === id)!;
export const at13 = (id: string, srcT: number) => {
  const p = seg13(id);
  return p.from + Math.round((srcT - p.a[0]) * FPS);
};
