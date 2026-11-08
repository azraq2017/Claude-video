# Video edits (Remotion)

- One folder per video in `src/projects/<name>`; shared renderer `src/Edit.tsx`. See README.md.
- **Default style for new edits: `docs/STYLE_MINIMAL.md`** (minimal; model + price up front;
  stress effects only on trade-in, jackpot price, promotion). Earlier projects used the
  busier style — don't copy their graphics density.
- **No subtitles/captions unless the user explicitly requests them** (`captionMode: "none"`).
- Always: transcribe first (Whisper large-v3), keep faces clear, TikTok/IG safe zone,
  show a 720p preview before any final render, final = `npm run render:vN` (includes limiter).
- Reply to the user in Malay unless they write in English.
