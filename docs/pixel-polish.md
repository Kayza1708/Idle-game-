# 2026-10-14 · Detailed art and introductory lessons

## Implemented

- Detailed original bitmap lab and capsule cabinet, generated with built-in Imagegen, copied into the project as lossless WebP. The lab has racks, monitors, tools, pipes, a central AI chamber, ambient LEDs/monitor/fan layers and a different Overclock state. Existing actual tap feedback remains.
- Capsule cabinet has independent shaded ball sprites, brass handle, outlet door, landing capsule, separating lid and reveal sparks. 1.8-second mechanical sequence: crank/mix → outlet → landing/bounce → opening/reveal. Rewards are still booked before animation; cosmetic completion never grants again. Effects-off and OS reduced motion show results immediately.
- Silkscreen replaces Pixelify for visual headings; self-hosted IBM Plex Mono reads small text and numbers. Included OFL licenses. HUD numeric values use a dedicated font/line-height to prevent clipping. Inventory illustrations, materials and Mira remain their existing art.
- The active coach is compact; Mira's full dialogue remains large. The finger follows the actionable prerequisite, buy-mode control, actual training button or research confirmation CTA. It does not simulate actions or unlock hardware.
- Meaningful shop lock reasons are visible beside their offer, not only in hover text. Affordability and purchase confirmation remain intact.

## Once-per-account introductory contract

Save v54 adds `intro.qualityUsed` and `intro.researchUsed`. Offers require the relevant active tutorial step, first run, quality level/Data Generation level zero and an unused proof. Only first quality training and Data Generation 1 are eligible; Efficiency, other research and challenges remain paid.

Both sponsored jobs cost zero Data and take 20 seconds. Proof is consumed atomically at successful start, not completion. A busy slot or blocked start consumes nothing. Duration/cost/intro proof freeze in the actual job and survive online/offline/reload. Intro Data Generation alone bypasses the existing screen's SBC gate; it does not grant hardware or unlock other research. Subsequent levels use normal increasing costs and times. Normal and Axiom resets retain proof and cannot offer a new first-run lesson. Challenge snapshots start without the main offer and restore its proof on return. v53/older migration conservatively marks existing training/research/reset progress used, creates no job, pays no refund and grants no resources. Current missing/corrupt proof is rejected.

The training/research introductory exceptions have explicit save validation and an explanatory detail view, rather than being misrepresented as a 100% equipment discount or violation of the normal research floor. Telemetry identifies sponsored starts. Players who skip the guide use normal prices; replay does not restore a consumed lesson. This accelerates the introductory model/research steps, not every later crafting/analysis/prestige lesson.

## Drop contract and balance assumptions

`worldDropSeconds=90`, `worldDropMinimumSeconds=30`, one visible drop, 12-second lifetime. Pixel material crates replace the old illustration; no `×1` badge. 48px keyboard/touch target, booked reward feedback, no new currency.

Fewer clicks should not simply halve resource supply. New drops freeze `rewardFactor = max(30,90/multiplier) / max(8,45/multiplier)` when spawned (2–3.75), preserving the prior *expected* active throughput under the same build, regular collection and variant mix. Material amounts use unbiased rounding only for fractional amounts. Credit/Data seconds scale by the frozen factor; existing core-drop item probability scales by it (at most 56.25%). The capsule machine's independent 1% chance is unchanged. Legacy drops without this factor keep their original reward. Quality/access tables and passive material acquisition are unchanged. Timing boundary epsilon prevents frequent small ticks from missing a spawn that a single elapsed-time step would produce.

This does not prove identical finite-run results: fewer random observations, variant selection, expiry/missed clicks and quest counts can still change progression. The new cadence/lifetime and 20-second lesson timings are authorized, uncalibrated balance choices. No long-run economic certification is claimed.

## Validation

- 1,394 tests passed across 103 files, followed by focused final verification. Typecheck/source casing, production build and diff check passed.
- Real Chromium app: 222 early/menu/detail/tutorial views, 336 late/prestige-node/foundry views in DE/EN at 360/390/430px; shorter-height and larger-text coverage in the early matrix.
- Seven capsule/provider interaction profiles; six actual zero-Data/no-hardware training/research UI profiles. These confirm free labels, successful starts, frozen 20s jobs, persisted proof and finger placement on the actual confirm action.
- Fixtures establish technical/UI behavior, not natural long-term balance. Native iPhone safe areas/VoiceOver/keyboard still need device acceptance. Real video delivery remains unavailable until a genuine rewarded-ad provider is integrated.

Reproduce with `npm run typecheck`, `npm test`, `npm run build`; renderer audits in `scripts/mobile-layout-audit.mjs`, `scripts/mira-late-ui-audit.mjs`, `scripts/pixel-interaction-audit.mjs` and `scripts/intro-polish-audit.mjs` accept the documented Playwright/Chromium paths.

## Graphics and final prompt specifications

Built-in Imagegen; no CLI fallback. Originals are retained. Project assets:

- `public/assets/game/lab-detailed-v2.webp`
- `public/assets/game/capsule-machine-v2.webp`

Lab prompt: Original detailed hand-crafted pixel-art AI research laboratory, front-on with modest depth, wide landscape 3:2 cropped to 2:1 on mobile. Navy/desaturated teal, warm amber practical lighting, mint/cyan signal lights. Central hexagonal AI computing chamber on workbench; racks on both sides, small monitors, keyboard, tools, cooling pipes, grilles, bolts, cables and panels. Crisp consistent pixel clusters and tangible material shading; calm upper central/lower HUD areas. No characters, text, logos, UI, watermark, blur, smooth 3D or basic vector-placeholder appearance.

Cabinet prompt: Original front-facing symmetrical sci-fi capsule vending machine sprite, full silhouette on transparent 2:3 canvas. Detailed uniform-grid pixel art; navy/teal, copper, coral enamel, pale gold and mint; bolts, bevels, service panels, cables, blank plaque and feet. Upper half: empty glass dome with edge reflections and blue interior for separately animated balls. Lower half: mechanical cabinet, centered brass empty crank mount at approximately 68% height and recessed empty outlet near 82%. No balls, separate capsules, characters, text, digits, logos, UI, watermark, blur or photoreal/vector rendering. Dynamic elements are original code-native SVG/CSS layers; no generated animation drives gameplay.
