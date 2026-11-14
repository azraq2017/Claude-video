import { FPS, Timeline } from "./timeline";

export type Word = { w: string; s: number; e: number; p: boolean };
export type CapWord = { text: string; from: number; to: number; hl: boolean };
export type CapPage = { from: number; to: number; words: CapWord[] };

const DEFAULT_SKIP = ["okay", "eh", "ha", "haa", "ah", "ya", "lah", "kan", "weh"];
const MAX_WORDS = 3;
const MAX_CHARS = 16;

/** Group transcript words that survive the edit into short karaoke pages. */
export const buildCaptions = (tl: Timeline, words: Word[], keywords: string[], skip = DEFAULT_SKIP) => {
  const KEY = new Set(keywords.map((k) => k.toLowerCase()));
  const SKIP = new Set(skip);
  const pages: CapPage[] = [];
  for (const clip of tl.placed) {
    if (clip.mute) continue;
    const inClip = words.filter((w) => {
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
      cur.push({ text: w.w, from, to: Math.max(to, from + 3), hl: KEY.has(w.w.toLowerCase()) });
      if (w.p) flush();
    }
    flush(); // never let a page run across a cut
  }
  // Each page stays up until the next starts (max 0.6s hang) so there is no flicker.
  for (let i = 0; i < pages.length; i++) {
    const next = pages[i + 1];
    const hang = pages[i].to + Math.round(0.6 * FPS);
    pages[i].to = next ? Math.min(next.from, Math.max(pages[i].to, hang)) : Math.min(hang, tl.total);
    const ws = pages[i].words;
    for (let j = 0; j < ws.length; j++) ws[j].to = j < ws.length - 1 ? ws[j + 1].from : pages[i].to;
  }
  const speech: [number, number][] = pages.map((p) => [p.from, p.to]);
  return { pages, speech };
};
