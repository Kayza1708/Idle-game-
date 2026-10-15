# Immersive Mobile Feedback · 2026-10-15

Base: main `a330a4655c2a0ad839fbc35f3aaae392095be407` (PR112).

## Changes

- Bonus material boxes now open in a full-screen receipt scene: 0–350ms anticipation, independently lifted/rotated lid, light pulse, elapsed-time canvas particles, staggered material cards, continue/skip. Chest uses two real transparent pixel-art parts, not a closed/open image swap. No copied Archero art.
- Only a confirmed increase in `bonusBoxes.opened` mounts a scene. Its receipt is cloned once; animation never rolls, grants, spends, changes a save or schedules an economy action. No automatic close while reading. Reload displays history without replay. Campaign/challenge changes clear the cosmetic state.
- Escape and focus containment/restore; page hiding dismisses only the visual receipt. Timers, animation frames and listeners clean up. Effects off/reduced motion show the complete receipt immediately; no confetti animation. No ordinary lab-drop modal was added.
- Successful crafting/fusion triggers a bounded stage burst and ring. Fusion adds three item travelers; level badge pulses only on a real level increase. Existing action audio/haptics remain the source of sound, avoiding duplicate effects. Capsule dialog listener no longer re-registers/focuses on each game tick.
- Item upgrade cost, level change and percentage comparison are readable; raw six-decimal fractions, duplicated result stats and “Fehlt 0” removed. Special relay/INT comparisons retain their dedicated formulas. Build calculations and material sources remain available in disclosures after the action. Sockets still use domain eligibility.
- Item pickup notices are compact opaque banners with the latest item, avoiding overlapping transparent text.
- Research now uses full-width readable rows with required Data/time and visible blocking reason. Detailed quotes and affordability checks still use existing domain logic.

## Verification

- `npm run typecheck`, `npm test`: 1,473 tests / 108 files; `npm run build`; `git diff --check`.
- Browser audit uses prepared fixtures and actual UI actions, not a claim about natural progression. Reproduce with:

```sh
PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs CHROMIUM_PATH=/absolute/path/to/chromium node scripts/immersive-mobile-audit.mjs
```

- Profiles: 360×640, 390×844, 430×844; DE/EN; normal, OS reduced motion, game effects off. Checks actual opening/receipt persistence, no reload replay or repeat payout, focus/dismissal, successful craft and paid level-up, research row/title width, title height/font and page overflow. One profile exercises actual fusion and highest-level retention.
- Audit writes screenshots/results to `node_modules/.cache/immersive-mobile`. Screenshots of intermediate animations are captures of a moment, not pixel comparisons. Native iPhone/WKWebView, VoiceOver and subjective design approval remain unverified. Existing bundle size warning remains.

## Actual browser captures

Prepared fixtures, not mockups: [chest receipt](screenshots/immersive-chest.webp), [item upgrade](screenshots/immersive-item.webp), [research](screenshots/immersive-research.webp). The chest capture shows the completed scene; motion itself is implemented in the components/styles.

## Generated asset provenance

Mode: built-in image generation, style reference `public/assets/game/mobile-ui-sprites-v1.webp` (previously inspected). Output generated PNG encoded to lossless WebP without repainting. Final project asset: `public/assets/game/chest-rig-v1.webp` (1983×793, transparent, two horizontal cells). CSS positions the two independent sprites. No remote image service dependency at runtime.

Full generation prompt:

> Production game animation rig asset, transparent sprite atlas. Reference is STYLE and CHEST IDENTITY only; use the gunmetal sci-fi chest with bronze edges and turquoise energy strips, top left in reference. Create ONE horizontal 2-column by 1-row PNG sprite sheet with two equal square cells and 20% transparent padding around every object, no cell dividers, no labels. LEFT CELL: the chest BODY ONLY, a squat open rectangular gunmetal container with a dark turquoise interior, bronze front latch and corner fittings, shallow three-quarter front view. Absolutely NO LID attached. The body is centered, fits within 65% of the cell width. RIGHT CELL: the separate rigid LID ONLY for precisely that chest, a shallow curved rectangular top with bronze straps and turquoise trim, same width, same perspective, centered. Show lid in its CLOSED angle (top visible, shallow front rim), not upright. No chest body in this cell. Both independent sprites share the exact same lighting from upper left, detailed polished handcrafted pixel art with crisp stepped pixels and metallic shaded clusters matching reference. These two cutout pieces will be moved and rotated separately in a real opening animation. Preserve a visible gap between pieces by keeping each in its own cell. No particles, no rays, no text, no floor, no logos. Actual transparent background and alpha, not checkerboard.

The generator returned a wider sheet than the requested square cells; CSS uses the actual aspect ratio. Economy, balance and save schema unchanged. No merge or release.
