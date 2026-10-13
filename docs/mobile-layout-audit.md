# Mobile layout audit — 2026-10-13

## Confirmed causes

The user confirmed the newest main build was on the iPhone. Their five screenshots showed a story dialogue clipped off the left, a two-column shop with vertically separated gem icons/prices, oversized research exposition and an unreadable prestige overview.

The story overlay inherited `transform: translateX(-50%)` while the newer skin also applied `translate: -50%`. The second translation is removed. The separate active tutorial coach remains in its own shell row.

Shop selectors in the legacy stylesheet were more specific than the mobile skin. The skin now matches structural specificity, explicitly assigning the info button and price button to separate columns. The icon rule sets only background color so atlas imagery remains intact.

The prestige canvas inherited important percentage width/auto height, overriding its inline domain layout dimensions. Dedicated CSS variables preserve the full canvas, putting the core and links in the same coordinate system. Entry zoom is readable, Overview remains available, and node labels appear above their prices.

## Integrated changes

- Workshop keeps its pixel-art laboratory and price-only credit purchases.
- Research uses adjacent laboratory tiles, compact project rows and optional detail sheets. Progress marks are no longer presented like purchase buttons.
- Analyses retain short/long start buttons, costs and duration. Drop probabilities and reward arithmetic move into named disclosures.
- Inventory uses tighter component spacing; zero-count entries are dimmed. Crafting rules, blueprint acquisition and ingredient details are optional. Challenge families open individually.
- Profile, settings, equipment, missions, seasons and common detail windows use the same rectangular theme. Destructive confirmation actions have a separate danger state.
- Shared sheets have stable initial focus, a keyboard focus loop, Escape handling, unique accessible heading IDs and trigger focus restoration.
- Challenge minimum INT strings use the scientific formatter; no challenge calculation changed.

## Verification

`npm test`: 99 files, 1,364 tests passed. `npm run build` (including typecheck and case-safe source path validation) passed; existing >500 kB main chunk advisory remains. `git diff --check` passed.

`scripts/mobile-layout-audit.mjs` renders the real App, using a prepared saved-game fixture (not a natural progression test). DE and EN, widths 360, 390, 430, height 844; active tutorial additionally height 640. It captures workshop/hardware/training, research and its three tabs/detail, inventory and its four tabs/material/crafting, populated equipment, prestige, three shop categories and an unaffordable purchase sheet, menu/profile and all six sections, expanded challenge, settings/destructive confirmation, season/missions, story dialogue and active coach with guided training sheet.

Final run: 210 captured views passed. Representative screenshots were inspected and corrected during the pass.

The script asserts visible panels remain horizontally inside the viewport, no horizontal content overflow, shop prices sit next to offer info and gems remain on one line, unaffordable confirmation is disabled, focus stays in a detail dialog, and challenge UI has no `[object Object]` requirement. Screenshots are kept under `node_modules/.cache/mobile-layout-audit`; the script is reusable via PLAYWRIGHT_MODULE and CHROMIUM_PATH, without adding game dependencies.

## Acceptance still required

These are Chromium mobile viewports, not WKWebView/device screenshots. Real iPhone notch/home-indicator safe areas, on-screen keyboard, VoiceOver, system large fonts and long localized names still need native checks. Late-game filled forge queues, all item rarities and every challenge loadout are not exhaustively rendered. No monetization, balance or release-readiness claim follows from this UI pass. Existing pixel artwork is retained; this pass corrects its placement and sizing rather than regenerating it.
