# Native integrations

## Store / IAP

`src/nativeCommerce.ts` defines the boundary for StoreKit/App Store metadata, verified purchases, and restore operations. Browser builds intentionally return no products and show no price or successful purchase state. A native implementation must supply signed/verified entitlement handling before Premium Pass, Gem Packs, Starter Packs, Season Packs, or special offers can be sold.

## Rewarded ads

`src/ads.ts` contains the reward settlement function and provider interface. Gameplay UI must only settle a reward after a native provider returns a real `success` result with a unique transaction identifier. This pass does not expose a simulated “watch video” completion and does not add forced ads.

## Notifications

The settings screen lists planned notification categories in a disabled capability section. No preferences are persisted and no completion is scheduled until a native notification adapter, permission flow, and platform scheduling implementation exist.

## Daily shop

The v58 daily shop uses saved rotations and claim windows; see `docs/shop-rework.md`. Ads and payments remain unavailable until their real providers are integrated.

## Balance ZIP export

`@capacitor/filesystem` and `@capacitor/share` v8 deliver an actual ZIP through the native share sheet. After pulling the merged change on the Mac, run `npm ci`, `npm run build`, `npx cap sync ios`, then rebuild/run in Xcode. A web-asset-only copy cannot install these native plugins. Choose “In Dateien sichern” in the share sheet.

The generated iOS project is not stored in this repository. Add/merge the `NSPrivacyAccessedAPICategoryFileTimestamp` entry with reason `C617.1` into the app target's existing `PrivacyInfo.xcprivacy`, as required by the official Filesystem documentation: https://capacitorjs.com/docs/apis/filesystem#apple-privacy-manifest-requirements . Preserve any existing privacy declarations. The ZIP is written to app cache, shared, then removed; no shared storage permission is requested. See https://capacitorjs.com/docs/apis/share .

Browser export prepares the archive first, then uses an explicit user click and a delayed blob-URL release. Progress, preparation errors, cancellation and retry are visible. A missing native plugin produces an explicit error instead of falsely reporting a successful download.

Native bridge calls are covered by mocks; actual iPhone share-sheet/file saving and the Xcode target remain device verification steps.
