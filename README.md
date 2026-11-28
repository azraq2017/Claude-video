# Short-form video edits (Remotion)

Vertical 1080×1920 edits for TikTok / IG Reels. One shared engine, one folder per video.

| Composition | Video | Length |
|---|---|---|
| `TolakMotor` | Tolak motor — harga maksimum | 87s |
| `RepairPhone` | Repair phone — tukar LCD, siap hari sama | 55s |
| `Showroom` | 19 Motor Trading — Y15ZR, LC135, skuter | 86s |
| `StokBaru` | Stok baru sampai — E-Bonus, Lagenda 2022, LC (min 1:31) | 94s |
| `EventAkhirTahun` | 19 Motor Trading — event Jualan Penghabisan Stok 26–29 Nov: 7-clip montage on the user's voice-over, subtitles, hype effects + outro | 68s |
| `MotorBajet` | 19 Motor Trading — sebaris motor bajet RM1,500–RM2,150 + lokasi event, subtitles + outro | 72s |
| `EventClearStock` | 19 Motor Trading — event clear stock (Kamis–Ahad 26–29 Nov): infographics only, original video/audio untouched | 117s |
| `EventLelong` | 19 Motor Trading — event lelong motosikal terpakai 26–29 Nov (3 clips joined), exactly 1:31, minimal + subtitles + outro | 91s |
| `Lc135Row` | 19 Motor Trading — LC135 row, LC V8 + LC V4 biru jackpot, subtitles + outro | 42s |
| `Vario150` | 19 Motor Trading — Honda Vario 150 row (RM4,000++), minimal + outro | 35s |
| `XmaxV1` | 19 Motor Trading — Yamaha XMAX V1 RM19,000+, subtitles + outro | 61s |
| `YamahaSport` | 19 Motor Trading — Yamaha Sport CDI (Yamaha Sukan) RM2,999, minimal + outro | 68s |
| `Ex5Restore` | 19 Motor Trading — EX5 / Dream full restore stok, subtitles + outro | 96s |
| `LagendaBiru` | 19 Motor Trading — Lagenda 115ZR biru RM2,999, special effects + subtitles + outro | 40s |
| `LcV4` | 19 Motor Trading — LC V4 hitam RM3,999 / biru RM4,500, minimal + outro | 36s |
| `Lagenda1950` | 19 Motor Trading — Lagenda 115ZR RM1,950 (biasa RM2,500–2,999), minimal + outro | 41s |
| `Lc2999` | 19 Motor Trading — LC135 RM2,999 (biasa RM3,500), minimal + outro | 32s |
| `Stok100` | 19 Motor Trading — walkthrough stok ±100 biji (voice-over), minimal + outro | 87s |
| `TolakPhone` | Tas Tech — tolak phone lama (Android/iPhone), minimal + Tas Tech outro | 110s |
| `AntiScam` | Tas Tech — phone jackpot RM399 + cara elak scam (minimal, no outro) | 117s |
| `OfferBos` | Bos kata RM1,800, offer RM1,650 — outdoor walkthrough, graded, minimal + outro | 148s |
| `PromoDeepavali` | Promo Deepavali walkthrough — first edit in the minimal style | 118s |
| `Outro19` | 19 Motor Trading logo outro (4s), reusable via `outro: true` | 4s |
| `StokWalkthrough` | Stok 19 Motor Trading walkthrough — captions only | 101s |
| `RepairTv` | Tas Tech repair TV — skrin pecah tak berbaloi, backlight, TV second hand (voice-over) | 101s |
| `PhoneLama` | Phone lama/rosak jangan buang — tolak dapat duit (e-waste) | 94s |
| `Ex5Mahal` | EX5 Dream RM5,000 — kenapa customer pilih yang mahal (caption/graphic exclusive) | 116s |

## Run
```bash
npm install
bash scripts/setup.sh        # downloads the raw videos + builds cleaned voice tracks
npm run studio               # live preview in Remotion Studio
npm run preview:v2           # 720p draft
npm run render:v2            # final 1080p
```

## How it is built
| Path | What it does |
|---|---|
| `src/projects/<video>/transcript.json` | Whisper large-v3 word-level transcript (Malay) |
| `src/projects/<video>/edl.json` | Edit list in **source seconds** — hook first, repeats/stutters/pauses removed |
| `src/projects/<video>/words.json` | Cleaned caption words (`python3 scripts/build_words.py src/projects/<video>`) |
| `src/projects/<video>/faces.json` | Face track (`scripts/face_track.py` + `scripts/smooth_faces.py`) |
| `src/projects/<video>/index.tsx` | Every graphic + sound effect for that video, timed in source seconds |
| `src/Edit.tsx` | Shared renderer: cuts + punch-ins, voice, ducked music, SFX, captions, graphics |
| `src/layout.ts` | Face-aware placement — graphics follow the face frame-by-frame and never cover it |
| `src/safe.ts` | TikTok + IG safe zone (top 230px, bottom 480px, right 150px) |

Audio: voice is denoised/compressed/normalised to −14 LUFS; music auto-ducks under speech.
SFX in `public/sfx` are original, synthesised by `scripts/make_sfx.py`.

## Music credits (put in the post caption)
- Video 1: "Funky Chunk" Kevin MacLeod (incompetech.com)
- Video 2: "Getting it Done" Kevin MacLeod (incompetech.com)
- Video 3–21: "Funky Chunk"
- Event akhir tahun: "Getting it Done" Kevin MacLeod (incompetech.com) Kevin MacLeod (incompetech.com)

Licensed under Creative Commons: By Attribution 4.0 License — http://creativecommons.org/licenses/by/4.0/
