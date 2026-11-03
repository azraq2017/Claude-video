import words from "./words.json";
import { FPS, PLACED } from "../timeline";

type W = { w: string; s: number; e: number; p: boolean };
export type CapWord = { text: string; from: number; to: number; hl: boolean };
export type CapPage = { from: number; to: number; words: CapWord[] };

// Words that get the yellow/red "keyword" treatment
const KEYWORDS = new Set(
  [
    "maksimum", "harga", "rosak", "lc", "wave", "modenas", "sym", "city", "cap", "cai", "terima",
    "cun", "elok", "cantik", "repair", "kautim", "drop", "tips", "basuh", "gilap", "dm", "bio",
    "masalah", "problem", "buruk", "trade", "lokasi", "pembaikan", "dua",
  ].map((s) => s.toLowerCase()),
);
// Filler we keep in the audio but drop from captions
const SKIP = new Set(["okay", "eh", "ha", "ah", "ya", "lah", "kan"]);

const MAX_WORDS = 3;
const MAX_CHARS = 16;

const all = words as W[];

const pages: CapPage[] = [];
for (const clip of PLACED) {
  const inClip = all.filter((w) => {
    const mid = (w.s + w.e) / 2;
    return mid >= clip.srcStart && mid <= clip.srcEnd;
  });
  let cur: CapWord[] = [];
  const flush = () => {
    if (cur.length) pages.push({ from: cur[0].from, to: cur[cur.length - 1].to, words: cur });
    cur = [];
  };
  for (const w of inClip) {
    const from = clip.from + Math.max(0, Math.round((w.s - clip.srcStart) * FPS));
    const to = clip.from + Math.min(clip.frames, Math.round((w.e - clip.srcStart) * FPS));
    if (SKIP.has(w.w.toLowerCase())) {
      if (w.p) flush();
      continue;
    }
    const chars = cur.reduce((n, c) => n + c.text.length + 1, 0) + w.w.length;
    if (cur.length >= MAX_WORDS || chars > MAX_CHARS) flush();
    cur.push({ text: w.w, from, to: Math.max(to, from + 3), hl: KEYWORDS.has(w.w.toLowerCase()) });
    if (w.p) flush();
  }
  flush();
}

// Each page stays up until the next one starts (max 0.6s of hang time) so there is no flicker.
for (let i = 0; i < pages.length; i++) {
  const next = pages[i + 1];
  const hang = pages[i].to + Math.round(0.6 * FPS);
  pages[i].to = next ? Math.min(next.from, Math.max(pages[i].to, hang)) : hang;
  const ws = pages[i].words;
  for (let j = 0; j < ws.length; j++) ws[j].to = j < ws.length - 1 ? ws[j + 1].from : pages[i].to;
}

export const CAPTION_PAGES = pages;

/** Output frames during which someone is speaking (for music ducking). */
export const SPEECH: [number, number][] = pages.map((p) => [p.from, p.to]);
