# Gumball voucher and player profile art — 22 Oct 2026

## Initial audited game state
The **Gumball voucher economy was already implemented in main** prior to this art pass; this branch must not introduce duplicate ticket wallets, repeated Season awards, extra free tickets or parallel balance constants.

Existing economy (src/economy.ts, generated Unity VoucherBalance.g.cs):
- One voucher = exactly one normal Gumball draw, without charging Gems or rewarded-video quota.
- Voucher odds per opened chest: Common 0.5%, Rare 1%, Epic 1.5%, Legendary 2%; daily bonus box 0.25%.
- Existing 30-day V2 Season grants +1 on Free level 30, +1 on Premium level 40.
- Stored earned/spent wallet, max 999 available, one-time redemption, native save migration to v22, deterministic receipt-seeded odds; no transfer to Cloudflare inventory.
- Existing visual asset public/assets/game/gumball-voucher.svg plus native VoucherSprite.cs.
- Existing confirmation and Shop odds UI shows ticket chances. **No new balancing or voucher grant logic is authored in this branch.**

## What this branch changes
1. New differentiated design system for 7 achievement families in each Bronze/Silver/Gold tier: 21 original standalone SVGs under public/assets/game/profile/badges/.
2. 8 transparent original portrait frame sprites under public/assets/game/profile/frames/: Basic, Founder, Bronze/Silver/Gold Lab, Neon, Quantum and Singularity. Catalog IDs match cloudflare/company-api/src/social-catalog.mjs. Gold/Neon/Quantum/etc. remain locked until verified unlock/purchase.
3. Company crest vector art.
4. Native Unity ProfileBadgeSprite.cs procedurally creates cached 80×88 Pixel-Art medals and 96×96 transparent-center frames; no external graphics packages.
5. Native RetentionView shows family-specific medal art in achievement rows, a compact automatic local top-3 showcase in personal profile and a badge gallery. No local extra save data or online minting; the actual online showcase remains privacy-default and pending authentic/verified API UX.
6. Web ProfileModal shows the same local earned-badge preview and family artwork instead of a generic challenge icon; localProfileBadges keeps earned-claims distinct. Active avatar frame is basic only until an authenticated and verified purchase/equip flow exists.
7. SeasonPass visually highlights Gumball voucher on its actual existing level reward, adds voucher totals and corrects voucher-only art/title fallback. It does not reissue or increase vouchers.
8. Adds pure TypeScript unit tests and Unity EditMode tests for sprite caching and frame transparency (must run in actual Unity).

## Current gaps verified from repository
- Company profile artwork exists **but is not yet a connected live Unity Company profile**. Company backend is implemented separately; session/verified account pairing with the personal game, privacy toggles and online profile UI are still open.
- Bronze/Silver/Gold online Company research/trader badges are server-managed; the local Achievement showcase is not a proof suitable for publishing those badges.
- Frame selection and purchasing with Gems require a server-authoritative Gems wallet and idempotent purchase receipt.
- A user-selectable, persistently saved three-slot online showcase must be built around the existing Cloudflare showcase API and permission checks. The automatic local preview is not that feature.
- Components/items from local saves must not become server-tradable without verifiable minting or a separate server-owned inventory bridge.
- Rewarded ads, IAP and social multiplayer are not release-ready. No chat or direct messages will be added.
- Native Android/iPhone image, touch, notch and DE/EN/all-seven-language review is outstanding.
- Mobile visual review 320/390/430px, badge readability at 36/54/80px, accessibility contrast and reduced-motion settings must be verified before acceptance.

## Product recommendations (priority order)
- **P0 retention**: natural new-save gameplay sessions, measure time-to-first-upgrade, time-to-first-Prestige, D1/D7 retention and the effect of the voucher jackpot; do not optimize vanity KPIs from deterministic fixtures.
- **P0 release**: fix stale Unity export fixtures affecting general CI, finish mobile device/suspension testing and implement verified purchases and rewarded ads.
- **P1 UX**: standardize Shop/Seasons/Profile reward-reveal duration, animations and icon sizes. Limit vertical prose, preserve all needed facts in optional disclosure/popup.
- **P1 social**: complete invitation/profile/trade UI and privacy-by-default auth, no chat; only expose server-verified stats.
- **P1 economy**: preserve voucher rarity; avoid more guaranteed sources before measuring inflation/reward conversion.
- **P2 showcase**: badge collection book with an obvious next milestone, animated but short Bronze→Silver→Gold promotion and comparison of unlocked vs locked frames.

## Verification
New art and tests were committed, but GitHub text operations do not compile Unity or inspect real screen recordings. Automated CI and actual Unity/editor/phone confirmation must be reported separately. No production deployment or automatic merge.
