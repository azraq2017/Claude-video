# Minimal style (house style from Nov 2026)

Learned from two reference videos. Use this preset for future edits unless the user asks otherwise.

1. **"Beli motor bajet RM1500"** — pakcik buys a Suzuki scooter (93s, conversation, ~4 cuts).
2. **"Motor lelong minggu ini!"** — showroom walkthrough of ~12 "jackpot" bikes with prices (108s, ~17 cuts).

## What the reference does
| Element | Reference | Our preset |
|---|---|---|
| Opening | 5s cold-open teaser lifted from the climax (price + happy customer) | Hook = strongest price/reaction line |
| On-screen text | ONE label only: teal quote badge + black bold text on white line-boxes, left-aligned at body height, ~5s | `QuoteLabel` — model + price **up front** |
| Transition | Real "SOLD" paper shot, no graphic | Use real footage beats; no flashy transitions |
| Cutting | Long natural takes, ~4 cuts in 93s, laughs & small pauses kept | Cut only dead air (>1.5s), false starts and real repeats |
| Captions | None | `captionMode: "none"` — **no subtitles unless the user explicitly asks** (user decision, Nov 2026) |
| SFX | None | None — except on stress hits |
| Music | Upbeat bed, loud in b-roll/walking parts, ducked under talk | Funky Chunk / user-supplied, `musicLevels ≈ { underVoice: 0.07, open: 0.2 }` |
| Look | No vignette, no slow push-in | `plain: true` |

## Reference 2 adds
| Element | "Motor lelong minggu ini!" | Our preset |
|---|---|---|
| Opening label | Same quote style, but placed **above the head** (top-left) because the speaker is low in frame | `QuoteLabel top={...}` — pick the free band (above head or at body height) |
| Prices | Every spoken price pops on screen: big yellow→orange numbers, thick black outline, thin white rim, no box; characters pop in one-by-one (~2 frames each, slight tilt that settles), on/next to the bike being discussed, ~2s, no sound | `PricePop` (optional small model tag above in quote style) |
| Cutting (walkthrough) | Dead air between bikes cut out; each bike = one beat | Walkthroughs: cut gaps; conversations: keep natural (ref 1) |
| Spoken "jackpot" in the intro | Reference keeps it calm (label only) | Per user: jackpot price **does** get a stress hit |
| CTA | Spoken only ("DM kita, lokasi kat bio") — no CTA graphic | No CTA card; optional small `QuoteLabel` only if asked |

## Rules
1. **Model + price in front.** Every spoken price → `PricePop` (model tag above when the model is named), held ~2s (min 60 frames), on the bike, never on a face.
   Opening: First seconds show `QuoteLabel` with the bike/phone
   model and the price (price line highlighted yellow). Placed at body height
   (default `left: 250, top: 1090` on 1080x1920) — move it if a face is there.
2. **Stress effects ONLY for three things** — everything else stays calm:
   - **Trade-in** (trade-in, try-in, "tolak motor/phone")
   - **Jackpot price** (bertuah, termurah, serendah, jackpot, a price far below normal)
   - **Promotion** (promo, promosi, diskaun, offer, free/percuma, sale)
   A stress hit = `StressHit` (yellow tag slams + label) + 3-frame white flash +
   punch-in via `Project.punches` + ONE sound (`impact` or `cash`). Max ~1 per 20s.
3. Keep it authentic: don't over-trim conversation; keep reactions.
4. Still respect TikTok/IG safe zones (`src/safe.ts`) and never cover faces.
5. Minimum length rules from the user still apply when given (e.g. >= 1:31).

## Brand outro (19 Motor Trading)
- Every **19 Motor Trading** video ends with the logo outro: set `outro: true` on the project
  (4s; wipes in over the last 10 frames of the video). Override lines with
  `outro: { sub: "...", cta: "..." }`, or `cta: ""` to hide the CTA chip.
- **Tas Tech** (phone/TV/laptop repair) videos use their own outro: `outro: true, outroBrand: "tastech"`.
  Blue `#0C2AB0` / yellow `#FEC401`; 30° wipe (logo's isometric angle), blocks slide in along the
  isometric axis, **® pops in** (registered trademark — always keep it), "TAS TECH / Repair Phone · TV · Laptop /
  Sungai Petani · DM / Lokasi kat bio". Logo traced in `src/brand/tastech-paths.ts`; preview composition `OutroTasTech`.
- Sequence: navy panel wipes up on a 45° edge with red trim → M, T, R rise → "19" drops with one
  soft hit → wings slide out → light sweep → "19 MOTOR TRADING / Sungai Petani, Kedah / DM · Lokasi kat bio".
- Colours: navy `#1F334C`, red `#E22943`, white. Logo is traced to vectors in `src/brand/logo-paths.ts`
  from `public/brand/19mtr_logo.png`. Standalone preview: composition `Outro19`.

## When the user asks for subtitles
Use the clean style, never the old karaoke boxes: `captionMode: "auto", captionStyle: "clean"`
(white Montserrat 800, black outline, spoken word turns yellow, fades between pages; sits at y≈1320).
Move quote labels up (`top ≈ 960`) so they never overlap the subtitle band. Fix brand/model spellings in
`fixes.json` first (Solariz, Avantiz, MT-15, "bio", …).

## Dark footage
If the user says footage looks dark, grade the SOURCE with ffmpeg before editing (keeps Remotion fast):
`curves=all='0/0 0.18/0.27 0.45/0.53 0.8/0.84 1/1',eq=saturation=1.1:contrast=1.03,unsharp=5:5:0.4`
— lifts shadows/mids, keeps highlights (sky) intact. Add a second, stronger shadow curve with
`enable='lt(t,X)'` for backlit shots. Always show a before/after still.

## Code
- Components: `src/components/Minimal.tsx` (`QuoteLabel`, `PricePop`, `StressHit`, `STRESS_TRIGGERS`)
- Project flags: `captionMode: "none"`, `plain: true`, `punches: [...]`, `place: "fixed"` on graphics
- Example: `src/projects/minimal-demo` (composition `MinimalDemo`)
