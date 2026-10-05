# Native integrations

## Store / IAP

`src/nativeCommerce.ts` defines the boundary for StoreKit/App Store metadata, verified purchases, and restore operations. Browser builds intentionally return no products and show no price or successful purchase state. A native implementation must supply signed/verified entitlement handling before Premium Pass, Gem Packs, Starter Packs, Season Packs, or special offers can be sold.

## Rewarded ads

`src/ads.ts` contains the reward settlement function and provider interface. Gameplay UI must only settle a reward after a native provider returns a real `success` result with a unique transaction identifier. This pass does not expose a simulated “watch video” completion and does not add forced ads.

## Notifications

The settings screen lists planned notification categories in a disabled capability section. No preferences are persisted and no completion is scheduled until a native notification adapter, permission flow, and platform scheduling implementation exist.

## Daily shop

No daily free item or rotating offer was added because the current save schema has no authoritative rotation/claim record and no approved reward table. A future implementation must add a versioned, deterministic server/save-safe rotation using existing reward types and centrally reviewed balance values.
