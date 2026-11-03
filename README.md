# Tolak Motor — Remotion edit

Vertical 1080×1920 edit (TikTok / IG Reels) of the "tolak motor" talking-head video.

## Run
```bash
npm install
bash scripts/setup.sh        # downloads the raw video + builds the cleaned voice track
npm run studio               # live preview in Remotion Studio
npm run preview              # 720p draft  -> out/preview_720p.mp4
npm run render               # final 1080p -> out/final.mp4
```

## How it is built
| File | What it does |
|---|---|
| `scripts/transcript.json` | Whisper large-v3 word-level transcript (Malay) |
| `src/data/edl.json` | Edit list in **source seconds** – hook first, repeats/stutters/pauses removed. Change cuts here. |
| `src/data/words.json` | Cleaned words for captions (`scripts/build_words.py`) |
| `src/data/faces.json` | Face track (YuNet, 5 fps) – graphics follow it so they never cover the face |
| `src/fx.tsx` | Every graphic + sound effect, timed in source seconds |
| `src/components/` | Captions + motion-graphic components |
| `src/safe.ts` | TikTok + IG safe zone (top 230px, bottom 480px, right 150px) |

Audio: voice is denoised/compressed/normalised to −14 LUFS; music auto-ducks to ~5% under speech.
SFX in `public/sfx` are original, synthesised in `scripts/make_sfx.py`.

## Music credit (required in the post caption)
"Funky Chunk" Kevin MacLeod (incompetech.com)
Licensed under Creative Commons: By Attribution 4.0 License — http://creativecommons.org/licenses/by/4.0/
