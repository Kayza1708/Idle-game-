# Item presentation and animation · 2026-10-15

Continuation of PR113. Previous chest work is retained; this replaces the brief forge burst with actual item-centered action sequences and a shared item presentation.

Actual browser recording, 16 seconds (historischer Nachweis: Git-Historie vor Bereinigung) · Craft result (historischer Nachweis: Git-Historie vor Bereinigung) · Fusion inputs (historischer Nachweis: Git-Historie vor Bereinigung) · Fusion result (historischer Nachweis: Git-Historie vor Bereinigung) · Detail sheet (historischer Nachweis: Git-Historie vor Bereinigung).

The recording and captures use prepared fixtures and actual UI actions. They are not image-generated mockups or evidence of natural progression/native-device performance. Existing project bitmap assets are reused; no new generated art or SDK.

## Vibrant rarity refinement

The entire rim now uses the rarity color, with a dark interior so the bitmap remains legible. Names still state rarity: color is an additional cue. All six share the same frame geometry and the processor/core/research family mark.

| Rarity | Rim color |
| --- | --- |
| Common | Silver `#b7cad8` |
| Uncommon | Green `#35ef88` |
| Rare | Blue `#36adff` |
| Epic | Violet `#a965ff` |
| Legendary | Gold `#ffba32` |
| Mythic | Pink-red `#ff4c87` |

Six-rarity actual inventory capture (historischer Nachweis: Git-Historie vor Bereinigung). A one-shot rim highlight accompanies the confirmed item reveal; no permanent flashing. Skip and reduced motion stop that highlight.

Portraits enlarged about 10–15%: inventory 66→74px (60→68px on narrow screens), detail 96→108px, result 156→176px (130→146px on short screens). Detail padding tightened to retain action space. The existing physical model/forge sockets keep their fitted sizes.

The refreshed recording/captures use the new style. `scripts/rarity-presentation-audit.mjs` verifies six distinct computed border colors, a truly green uncommon rim, ≥2px borders, readable portrait size and no overflow in a prepared six-instance inventory. The 18-profile action audit was repeated with the larger portraits; 1,490 tests, typecheck, build and diff check remain green.

Further animation opportunities (proposals, not additional implementations): short lab-completion reveals, hardware milestone pulses, energy tracing along newly unlocked prestige paths, and claimed resources traveling to the header. Reserve longer sequences for rare milestones; ordinary actions should remain brief and responsive.

## Shared presentation

`ItemPortrait` uses the real item atlas, one consistent metal well, rarity color/rail, processor/core/research family glyph and instance level. Hero, compact and tile sizes share that identity in inventory, recipes, fusion selection/results, details, equipment, capsule items and received-item notices. Names/rarities use existing localization. Instance IDs are removed from player-facing inventory labels. Detail sheets use a compact horizontal hero so the upgrade action remains near the top.

## Confirmed events and timing

| Action | Presentation | Trigger |
| --- | --- | --- |
| Item crafting | Material icons assemble into energy, light pulse, item forms at center, receipt/stat reveal | Paid new instances + increased craft count |
| Fusion | Three actual old instances converge; actual retained instance appears with new rarity and old/new stats | Successful fusion count + rarity change + two consumed instances |
| Level upgrade | Short item lift, ring, old → new level notice | Confirmed level increase |
| Timed forging | Short completed-item pulse with old → new Forge level | Forge level and completion counter increase; queue/start alone is silent |
| Recycling | Item fades into returned material icons and exact quote amounts | Confirmed removal from successful salvage |
| Equip/unequip | Shared framed item and short confirmation; existing socket transfer retained | Actual equipment map changes |
| Protect/unprotect | Short confirmation with the actual item | Actual locked flag changes |
| Ordinary item drops | Compact shared item identity; existing nonmodal pickup behavior retained | Existing confirmed received-item flow |
| Capsule/bonus boxes | Existing opening sequences retained; capsule item uses the shared portrait | Existing confirmed receipts |

Craft/fusion: anticipation ~0–250ms, convergence ~250–1050ms, flash ~850–1200ms, item forms ~900–1650ms, stats appear ~1450–1850ms. Continue is available after 1850ms; Skip instantly reveals the completed receipt, without another transaction. Ready receipts remain until dismissed. Other item actions use a nonmodal notice for 3 seconds, avoiding a dialog on each paid upgrade.

A single deterministic 36-particle burst is elapsed-time based, capped at DPR2 and ~2 seconds, canceled on unmount. CSS animates decorative UI only. No animation calls economy actions, rolls rewards, changes game time, saves flags or delays the payout. Presentation snapshots contain the confirmed item, its actual inputs, old/new stats and batch count.

## Lifecycle and accessibility

- No event on initial load, failed/no-op actions, replayed identical state, import/reset, changed campaign/prestige/axiom/challenge context, or an offline jump over 60 seconds. Existing return reports remain authoritative for offline completions.
- Presentation originates at App's confirmed state transition, so tick renders do not restart it and all relevant screens share the same behavior.
- Craft/fusion modal contains focus, supports Escape and mobile back, restores prior focus, and locks background scroll. Backgrounding dismisses the cosmetic scene. Timers, canvas frames and listeners clean up.
- Game effects off and OS reduced motion immediately show the complete readable receipt. A live switch to reduced motion also finishes the visual reveal. No ordinary lab-drop modal added.
- Short confirmations do not steal focus. New modal/notice elements use `dialog`/`status`; controls ≥44px.

## Verification

- Typecheck, 1,490 Vitest tests / 109 files, production build and diff check pass. Seventeen focused tests cover no-op rejection, snapshot purity, actual batch/fusion inputs/results, failed/replayed actions, recovery, timed completion, equipment/protection, context/offline/import/reset boundaries and shared sprite/rarity/family identity.
- `scripts/item-presentation-audit.mjs`: 18 profiles, 360×640/390×844/430×844 × DE/EN × normal/reduced motion/effects off. Actual craft → reload → paid upgrade → fusion → protection → equipment → salvage flow; batch count, retained level/rarity, modal focus/skip/Escape, durable state and no replay, shared portraits, page errors/assets and horizontal overflow checked.
- Browser recording uses the 390×844 DE normal-motion fixture. OS reduced motion and effects off use separate profiles.
- Existing `scripts/immersive-mobile-audit.mjs` selectors updated for the replacement item scenes; a 360×640 DE regression profile also passes chest/reload, forge, upgrade, fusion and research checks.
- Native iPhone/WKWebView/VoiceOver, audio timing on device and subjective final visual approval remain open. Existing bundle-size warning remains. No merge/release, balance or save schema changes.

Reproduce (Playwright video capture requires its ffmpeg executable):

```sh
PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs CHROMIUM_PATH=/absolute/path/to/chromium node scripts/item-presentation-audit.mjs
```

Optional `AUDIT_WIDTHS`, `AUDIT_LANGUAGES`, `AUDIT_MOTION` comma-separated filters support focused visual checks. Output is written to `node_modules/.cache/item-presentation`.
