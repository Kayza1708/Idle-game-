# Cohesive mobile art and UI

Basis: main `8aea149`, merged PR111. A separate worktree/branch preserves unrelated unfinished local work. This pass addresses capsule, box, model and prestige presentation plus the confirmed UI issues; no economy values, payment rules, odds, SDKs or save-schema change.

## What changed

A shared original bitmap atlas replaces primitive capsule/chest/socket drawings. One material language: gunmetal, bronze, cyan light, shaded recessed slots. The cabinet remains the original filled bitmap; its own crank texture rotates, and matching closed/open capsule sprites are dispensed. Cabinet controls fit above navigation in the tested 640px profiles. Reduced motion/effects off show the result directly.

The bonus receipt is displayed for 3.5 seconds after an actual newly confirmed opening, then collapses into a readable history disclosure. Saved receipts do not replay on reload. Component names/counts still come from the authoritative receipt; graphics/timers never grant rewards. Campaign/run changes clear transient feedback. Language-specific existing box strings are retained.

The six model sockets use circle/triangle/square art from the same atlas, supporting existing family identities, locks, selection, equipment effects and level labels. The existing core remains centered, with thin connections and readable external labels. Inherited CSS percentage translations were removed from the core.

Prestige uses small textured nodes, neutral lock states and compact status/header/actions. Six branch shortcuts and initial focus on an affordable/ready node expose actionable progression. The core remains directly reachable. Zoom clamps at 0.65; 88px logical nodes remain at least 57.2 CSS px. The map uses remaining screen space and stays above navigation. Mouse/touch taps open node sheets; capture begins only after drag threshold (6px), with suppression after a real drag. No node is purchased by a map gesture. Overview no longer shrinks nodes to 11px.

The archive-dependent prestige loss/retention text now reflects actual modelArchive behavior. Normal/challenge differences remain controlled by the domain. Forge recipe preference survives tab changes and reload in a separate local UI key, isolated by campaign and challenge run. Stored recipes are checked against actual learned/access gates; corrupt/disabled preference storage cannot block a game action or change the save.

## Assets and generation

Final project asset: `public/assets/game/mobile-ui-sprites-v1.webp` (1774×887 RGBA, lossless WebP, generated alpha preserved). `src/MobileArt.tsx` samples four columns/two rows with CSS background positioning; lower-row frames exclude the transparent top guard band so upper-row sprite tails cannot appear over sockets. The image tool returned a 2:1 atlas rather than the requested square; integration uses its actual regular 4×2 grid, never stretches individual sprites.

Tool: built-in Imagegen, not CLI/API fallback. Style references, inspected before generation: `public/assets/game/model-core-v2.webp` and `public/assets/game/capsule-machine-filled-v3.webp`. Both are style references, not edit targets. Original output retained; project copy is a lossless encoding of that output. No external brand art.

Complete prompt:

```text
Use case: stylized-concept. Asset type: ONE production sprite atlas for the existing mobile idle game AI Singularity. Images 1 and 2 are STYLE REFERENCES only: match their detailed dark gunmetal, bronze fittings, cyan luminous technology and chunky polished pixel-art illustration. Create a square transparent PNG, exact regular 4 columns by 2 rows, 8 equal square cells, generous transparent margins within each cell, no grid lines or text. Every sprite centered in its own cell, never overlapping another cell. Top row left to right: (1) a closed sci-fi loot chest with gunmetal panels, bronze latch, turquoise seam, front three-quarter view; (2) the identical loot chest OPEN with raised lid and a soft small cyan light inside; (3) one glossy turquoise-and-transparent round prize capsule matching the actual spheres in reference 2, closed and isolated, detailed reflected highlights and equatorial seam; (4) the identical capsule OPEN with lid lifted directly upward above its bottom bowl, fit wholly in this cell. Bottom row left to right: (5) a circular equipment socket frame, heavy beveled gunmetal, small bronze screws and cyan rim, EMPTY dark recessed center; (6) a triangular equipment socket frame of the same material and styling, point up, EMPTY dark recessed center; (7) a square equipment socket frame of the same material and styling, EMPTY dark recessed center; (8) a circular prestige hub badge frame with dark recessed center, matching material, two small bronze terminals, cyan rim. Consistent frontal perspective for all four socket frames, matching scale and outer dimensions, central empty opening large enough for an overlaid item icon. Crisp attractive handcrafted pixel-art edges with deliberate stepped pixels, fine metallic shaded clusters, cohesive game-ready sprites, all art visually legible at 64-96 CSS pixels. Actual transparent background with alpha; no white or checkerboard backdrop baked in, no ground planes, no labels, no typography, no watermarks. This is a sprite sheet, not a mockup or screenshot.
```

## Verification

All 1,473 tests across 108 files passed; additional focused UI/preferences regressions passed. Source-path/typecheck, production build and `git diff --check` passed. New tests cover corrupt/unavailable preference storage, ownership and campaign/challenge isolation, and minimum node hit size at allowed zooms. Existing tests now assert real raster capsule/frame roles instead of obsolete SVG paths.

`scripts/cohesive-mobile-ui-audit.mjs`: twelve prepared profiles at 360/390/430 × 640/844, DE/EN. Actual mouse and touchscreen node taps, mouse drag, one real CDP touchscreen drag, zoom minimum, branch navigation, archive details, centered model core, six family sprites, tab/reload recipe retention, actual paid capsule draw with visible controls, actual mission box opening and receipt persistence, no horizontal page overflow, asset/runtime checks and reduced motion. Technical resource/access fixtures are not natural progression or native device measurements.

Browser screenshots below show actual renderers, not generated mockups. Natural long-term balance, native iPhone/WKWebView/VoiceOver acceptance and final subjective design acceptance remain open. Existing Vite large-bundle warning remains. No merge/release.

## Actual mobile views

Model (historischer Nachweis: Git-Historie vor Bereinigung)

Prestige (historischer Nachweis: Git-Historie vor Bereinigung)

Capsule (historischer Nachweis: Git-Historie vor Bereinigung)

Bonus box (historischer Nachweis: Git-Historie vor Bereinigung)
