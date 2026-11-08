import { createBase, Project } from "../../project";
import edl from "./edl.json";
import words from "./words.json";
import faces from "./faces.json";

/**
 * Video 8 — "Stok 19 Motor Trading" walkthrough (voice-over, no face).
 * User asked for CAPTIONS ONLY: no motion graphics, no SFX, no flash, no
 * vignette / push-in. Background music stays low and ducks under the voice.
 * Long silent b-roll gaps were compressed to ~1s; must stay >= 1:31.
 */
const base = createBase({
  clips: edl,
  faces: faces as number[][],
  words,
  keywords: [
    "19", "trading", "y15", "y16", "v2", "wave", "s125", "vario", "alpha", "nouvo", "lc", "kriss", "mr1",
    "c100", "sym", "sport", "rider", "marhaen", "4", "8", "lagenda", "nmax", "pcx", "xmax", "dash",
    "avantiz", "solariz", "bajet", "roger", "baris",
  ],
});

export const stokWalkthrough: Project = {
  id: "StokWalkthrough",
  media: { video: "v8/source.mp4", voice: "v8/voice.m4a", music: "music/funky_chunk.mp3" },
  tl: base.tl,
  face: base.face,
  captions: base.captions,
  speech: base.speech,
  graphics: [],
  sfx: [],
  flashCuts: [],
  plain: true,
};
