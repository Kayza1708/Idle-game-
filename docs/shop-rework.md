## Kantige Integration

Shopkarten, Buttons, Rabattschilder, Kaufbestätigungen, Itemrahmen und Crafting-/Fusions-Ergebnisse verwenden gerade Ecken wie die bestehende Spieloberfläche. Kräftige Seltenheitsfarben, Abmessungen und Animationen bleiben erhalten; kreisförmige Energieeffekte und Prozessor-Symbole behalten ihre Form.

Geprüft: acht Shopprofile (DE/EN, 360–430 px, reduzierte/abgeschaltete Effekte) und zwei Item-Aktionsprofile (360/390 px); berechnete Ecken zusätzlich an echten DOM-Elementen geprüft. Screenshots und Shopvideo aktualisiert.

# Shop rework · 2026-10-15 · Save v58

Built on the item/chest work in PR113. This feature adds a four-category shop, new pure transactions and durable claims. It does not activate a native SDK or real payment flow.

Actual browser tour (MP4) (historischer Nachweis: Git-Historie vor Bereinigung) · Today (historischer Nachweis: Git-Historie vor Bereinigung) · Chest catalogue (historischer Nachweis: Git-Historie vor Bereinigung) · Materials (historischer Nachweis: Git-Historie vor Bereinigung) · Gem/bundle previews (historischer Nachweis: Git-Historie vor Bereinigung) · Confirmed Legendary receipt (historischer Nachweis: Git-Historie vor Bereinigung).

The clip/captures use a prepared funded fixture and real application actions. The separate ad verification harness uses a mock provider; the recorded production UI correctly shows ads unavailable. No real ad or native purchase is represented as completed.

## Player-facing shop

- **Today:** free common chest, three optional video chests, one rotating discount, one exact daily rare item, three rotating material selections and a shortcut to the chest catalogue.
- **Chests:** Common, Rare, Epic and Legendary pixel-art chests. Material quantities are guaranteed. Conditional item chance, rarity distribution, eligible item names and weighted material draw chances are accessible before purchase.
- **Materials:** fixed packs of every component, using existing material access rules. The requested example is exactly 40 Graphene for 80 Gems. Purchases show actual delivered quantities.
- **Gems:** three gem packs and two starter/builder bundle previews with provisional product IDs and concrete contents. All purchase buttons remain disabled/Coming soon until the native commerce integration supplies verified products and fulfillment.
- **Extras:** existing permanent upgrades and boosts retained. The former capsule machine/material package catalogue is not the main shop presentation.

## Balance source

All new costs, quantities, weights, limits, time periods and native product contents live in `BALANCE.shop` / `BALANCE.adLimits.shopChest` in `src/economy.ts`. Initial V1 numbers, not a live-economy revenue or retention measurement:

| Chest | Gems | Guaranteed components | Item chance | Conditional item rarity |
| --- | ---: | ---: | ---: | --- |
| Common | 60 | 30–54 | 8% | 85% common, 14% uncommon, 1% rare |
| Rare | 180 | 75–120 | 22% | 60% uncommon, 35% rare, 5% epic |
| Epic | 450 | 140–240 | 40% | 65% rare, 30% epic, 5% legendary |
| Legendary | 1,200 | 300–500 | 100% | 70% epic, 30% legendary |

Material draws use the existing accessible world-material weights; repeated materials merge into one receipt entry. Item types use the existing capsule item pool and are equally likely conditional on an item. Special progression-only relay/archive items are excluded. Mythic items are not directly sold. Daily item: one exact Rare instance, level 1, 500 Gems, one purchase per offer day. Material discount: 40% off the genuine regular pack price, rounded up, one purchase per day. Regular material packs remain repeatable.

The free Common chest is available immediately and then 24 hours after each successful free claim. Video allowance is independent: an anchored 24-hour window beginning at the first successful video, three successful openings maximum, then replenishment. Failed/cancelled videos neither consume quota nor grant loot. Daily offers use global UTC 24-hour periods; the UI shows the actual countdown. No local-midnight double claim for the free chest/video window. There is no lost free-chest stockpile when absent for multiple days.

## Transactions, clock and persistence

- Paid and free purchases use an offer ID, current shop revision and offer day. Double taps, stale confirmations, changed rotations, sold daily stock, unknown offers, unavailable materials, insufficient Gems and invalid reward RNG reject without partial debit/grant.
- Gem debit, component/item creation, receipt, stock and cooldown update are one pure state transaction. RNG is bounded/validated and defaults to deterministic per-campaign receipt rolls; animation never calls it. Components retain canonical totals and lifetime accounting. Overflow rejects atomically.
- The paid daily item is exactly the previewed type/rarity. Chest receipts store the actual item snapshot and merged component amounts, independent of subsequent upgrades. UI clones the confirmed receipt and item stat strings once for the opening scene.
- Daily selections freeze on the first shop visit/transaction of the day, including their stock; unlocking a material mid-day does not reshuffle an already persisted offer. The next day’s item cycles through the eligible type pool. A persisted clock high-water mark prevents backwards-clock replenishment; local offline state is not a substitute for server-authoritative monetization/time validation at release.
- `shop-visit`, purchases and ad ticket transitions are saved immediately through the existing durable save coordinator. A rewarded video starts only after its pending ticket was saved successfully.
- No shop actions inside challenge sessions/runs. Prestige and axiom resets preserve the persistent shop state through existing durable state spreads; challenge return restores the main campaign’s claims.
- Save v57 and earlier migrate absent shop state to an empty structure without any retroactive reward, debit or balance change, including saved main challenge state. Malformed existing/current shop state is rejected, not silently replaced with fresh claims. v58 validates timers, counters, rotation/claimed IDs, receipt values and pending tickets.

## Ad / native commerce boundaries

`beginShopVideo` creates a matching pending ID/context/expiry before calling `RewardedAdProvider.show('shopChest', tx)`. `completeShopVideo` requires that exact pending ID, successful result, same campaign/prestige/axiom/challenge context, valid expiry and available quota. Unknown, repeated, cancelled, error, stale or parallel callbacks cannot grant another chest. The App handles thrown SDK errors and cancels a restored ticket when no current provider call is in progress; reload never invents a success. Callback/claim fulfillment for an SDK that resumes across process death is an explicit native integration task.

`shopNative.ts` prepares product IDs, rewards and a receipt-only adapter contract. The unavailable adapter cannot report a successful paid fulfillment. Store prices must come from the platform, not invented currency labels. Native setup, product approval, receipt verification, transaction-ID deduplication, refunds/restoration and server-authoritative fulfillment remain release integration work. The old general `nativeCommerce.ts` remains for its existing consumers; it does not fulfill the new shop products.

## Presentation

New transparent four-cell pixel atlas: `public/assets/game/shop-chests-v1.webp`. Chest cards use rarity colors and large bitmap cutouts. Chest purchases use the already integrated separately moving lid/body opening rig with tier lighting, particles, material cards and the actual item’s vibrant rarity portrait. Direct purchases use short nonmodal item/material confirmation animations and existing audio/haptic settings. Item receipts from this flow do not also trigger the older general item-drop notification.

Reduced motion/effects off show complete receipts immediately. Escape/mobile back, focus containment/restore, background scroll locking and cleanup use the existing reveal/sheet behavior. Larger loot receipts can scroll internally while retaining the continue action. No replay on reload or tab return.

## Verification

- 1,521 Vitest tests / 110 files pass, including 31 new shop cases: all chest tiers, exact Graphene price/quantity, random misses/guarantees, invalid RNG and overflow, stale/double purchases, stock/rotation/cooldown boundaries, saved receipts and corruption/migration, challenges and ad callback limits. Existing save-version assertions advanced to 58.
- Typecheck, production build and diff check pass. Existing bundle-size warning remains.
- `scripts/shop-market-audit.mjs`: eight real UI profiles, 360×640/390×844/430×844 DE/EN plus reduced motion and effects off at 390×844. Free opening, exact Graphene purchase, daily item, daily discount, Legendary purchase/reveal, reload without replay or duplicate charge, native products disabled, continue target visibility, overflow and asset/page errors checked.
- Separate test-only `scripts/shop-ad-audit-entry.tsx` checks provider cancel/error/throw, three successful additional chests, fourth opening disabled and durable quota after returning to the production entry. It is not imported by the production build.
- Native iPhone/WKWebView, VoiceOver, actual ad SDK callbacks and real StoreKit billing are unverified. No merge, release or SDK activation.

Reproduce:

```sh
PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs CHROMIUM_PATH=/absolute/path/to/chromium node scripts/shop-market-audit.mjs
```

The video recorder requires Playwright’s ffmpeg executable. Optional `SHOP_FAST=1` runs one production UI profile plus provider checks; `SHOP_AD_ONLY=1` runs only the separate mock boundary checks. Output: `node_modules/.cache/shop-market`.

## Art provenance

Built-in Imagegen, transparent output; style reference was inspected `public/assets/game/chest-rig-v1.webp`. Output encoded to lossless WebP without repainting; final project asset `public/assets/game/shop-chests-v1.webp`. Original prompt:

> Use case: stylized-concept. Production transparent pixel-art shop sprite atlas for a sci-fi mobile idle game. Input image is a STYLE REFERENCE only: match its crisp stepped pixels, gunmetal panels, metallic highlights and turquoise technology. Create ONE square PNG atlas with a perfectly regular 2 by 2 grid of equal square cells, no grid lines. Each cell contains exactly one CLOSED treasure chest in the same shallow three-quarter front perspective, centered with 18 percent transparent padding on all sides, same footprint and camera angle. Top left COMMON: simple silver steel sci-fi supply chest with teal light, modest fittings. Top right RARE: cobalt blue armored chest with vivid azure crystal latch and silver edging. Bottom left EPIC: rich violet and indigo chest with purple illuminated latch and heavy silver straps. Bottom right LEGENDARY: luminous warm gold plated sci-fi chest, amber energy crystal latch, elaborate gold corners, dark gunmetal recesses. All must visibly be rigid rectangular chests with real hinged lids, cohesive silhouettes and high-end handcrafted pixel art, no smooth vector shapes, no generic UI frames. Strong differentiated rarity colors but dark readable panels. Absolutely no text, labels, logos, particle trails, scene backgrounds, ground shadows, floating loot or characters. Actual transparent alpha background, not checkerboard. Four distinct closed chest cutouts and nothing else.
