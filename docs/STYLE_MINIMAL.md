# Minimal style (house style from Nov 2026)

Learned from the reference video **"Beli motor bajet RM1500"** (pakcik buys a Suzuki
scooter, 93s). Use this preset for future edits unless the user asks otherwise.

## What the reference does
| Element | Reference | Our preset |
|---|---|---|
| Opening | 5s cold-open teaser lifted from the climax (price + happy customer) | Hook = strongest price/reaction line |
| On-screen text | ONE label only: teal quote badge + black bold text on white line-boxes, left-aligned at body height, ~5s | `QuoteLabel` — model + price **up front** |
| Transition | Real "SOLD" paper shot, no graphic | Use real footage beats; no flashy transitions |
| Cutting | Long natural takes, ~4 cuts in 93s, laughs & small pauses kept | Cut only dead air (>1.5s), false starts and real repeats |
| Captions | None | `captionMode: "none"` (offer clean captions only if asked) |
| SFX | None | None — except on stress hits |
| Music | Upbeat bed, loud in b-roll/walking parts, ducked under talk | Funky Chunk / user-supplied, `musicLevels ≈ { underVoice: 0.07, open: 0.2 }` |
| Look | No vignette, no slow push-in | `plain: true` |

## Rules
1. **Model + price in front.** First seconds show `QuoteLabel` with the bike/phone
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

## Code
- Components: `src/components/Minimal.tsx` (`QuoteLabel`, `StressHit`, `STRESS_TRIGGERS`)
- Project flags: `captionMode: "none"`, `plain: true`, `punches: [...]`, `place: "fixed"` on graphics
- Example: `src/projects/minimal-demo` (composition `MinimalDemo`)
