# Pixel UI and AI capsule machine

The app now uses a shared angular console skin: self-hosted Pixelify Sans (OFL license included), filled 16px orthogonal menu icons, cream dialogue bubbles, midnight blue surfaces, mint actions and copper/gold accents. Existing item/material/character illustrations remain; this is a UI pass, not a replacement of every bitmap with newly drawn pixel sprites. Original SVG lab console, capsule machine and tutorial hand have no external artwork dependency.

## Machine contract

- Shop → Capsules. Unlock: first normal prestige. Challenges cannot draw, earn video rewards or import the main receipt. No automation.
- One draw costs 10 existing Gems. Debit, inventory grant, last receipt and monotonic draw ID form one immutable state transaction, immediately scheduled for durable save. A stale ID cannot repeat the purchase. Failed/overflowing grants leave the entire state untouched.
- Exactly `roll < 0.01` selects an item. The other 99% select one component type from the existing accessible world table, without analysis focus. Components: common 3–12, uncommon 2–5, rare 1–2; tier is based on the conditional table chance (≥10%, 1–<10%, <1%). The odds sheet shows actual unconditional probabilities and quantities for the current pool.
- Item types are uniform across eligible existing types; extended items require their existing blueprint/access gates. Impulse Relay and Insight Archive remain exclusive to their normal acquisition path. Existing item-rarity probabilities apply inside the 1% branch. There is no pity, guaranteed-item draw, recipe learning or fabrication of a crafting completion.
- The deterministic per-campaign/per-draw stream prevents rerolling the same saved draw by reopening. It is local game randomness, not a cryptographic/server-authoritative lottery.
- Receipt and earned inventory survive normal and Axiom reset. A new challenge has an empty receipt and restores the untouched main receipt on return. Export includes the state in the versioned save and records a `capsule-draw` event with post-debit resources.
- Save v53 migrates older main/challenge snapshots with an empty machine only. It does not grant Gems or loot retrospectively. Missing/corrupt current receipts are rejected without overwriting the original save.

## Video boundary

Production defaults to `unavailableRewardedAdProvider`; no mock reward is connected to a video-button click. A native adapter must explicitly declare availability and return `success` after the SDK's rewarded completion callback. Pending draws disable both machine buttons. Cancel/error does not grant or consume the daily limit. Successful transaction IDs are deduplicated across reloads and day boundaries. Six completed videos/day is provisional, not calibrated. No ad SDK, ad-unit IDs or store consent configuration have been added by this task. Browser provider tests explicitly inject a test double; they do not verify a real advertisement.

## Motion and tutorial

A 1.2s stepped crank/ball/ejection sequence reveals the already-booked reward. Closing, reloading, hiding the app or disabling effects never books another reward. Reduced motion skips the sequence and reveals immediately. Successful hardware purchases, research/training starts, nodes and item receipts receive brief cosmetic feedback. Existing tap impulses remain.

The original SVG finger measures the real target after navigation, resize, scroll and mount changes. It routes to the relevant tab or training entry when the actual control is absent. It never simulates a click, advances the tutorial or taps disabled actions. The guide is hidden with obstructing meta menus; the hand hides behind unrelated modal dialogs. Effects-off and OS reduced motion stop tapping.

## Verification and remaining work

Unit/domain coverage checks exact probability boundary, gates, payment/grant atomicity, safe numeric capacity, stale IDs, deterministic reload, item pools, reset ownership, recursive save migration, corrupt saves and successful/cancelled/duplicate/day-limited videos. Browser scripts render the real application using clearly marked prepared fixtures; they do not measure natural balance.

`mobile-layout-audit.mjs`: early screens, menus, details, shop categories, tutorial, shorter height and larger text in DE/EN at 360/390/430px. `mira-late-ui-audit.mjs`: populated late inventory, every INT node detail, Axiom layer, foundries and research automation. `pixel-interaction-audit.mjs`: actual Gem draw/save/reload, reduced motion, finger anchors and an explicitly injected provider completion test.

Verified: 1,387 tests passed (102 files), plus focused final contracts; typecheck/build/source paths and diff check passed. Browser matrix: 222 early views, 336 late/node views and seven interaction profiles, DE/EN at 360/390/430px.

Native WKWebView safe areas, VoiceOver, keyboard and real rewarded-ad delivery still require iPhone acceptance. The provisional 10-Gem price, amount tiers and six-video cap need economic measurement before release; no claim of commercial balance or App Store readiness follows from these checks.
