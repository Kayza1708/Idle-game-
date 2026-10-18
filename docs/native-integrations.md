# Native integrations

## Store / IAP

`src/shopNative.ts`, `src/commerce.ts` and `src/CommerceOffers.tsx` now provide the active purchase contracts, verified fulfillment, durable-save-before-finish ordering and permanent restore flow. The unused `nativeCommerce.ts` predecessor has been removed. Native SDKs and the authenticated verification/ownership backend remain disconnected. See [Commercialization V1](commercialization-v1.md) for products, exact contents, limits and remaining release integration.

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

## ZIP aus dem iOS-Simulator zum Mac kopieren

In der laufenden App: Einstellungen → Spielstand & Berichte → Balancebericht exportieren → ZIP speichern / teilen. Den nativen Teilen-Dialog offen lassen. In einem Mac-Terminal im Repository `bash scripts/copy-simulator-balance.sh` ausführen. Das Script liest ausschließlich den App-Cache des gebooteten Simulators und kopiert Balance-ZIPs in den Downloads-Ordner. Beim Schließen des Teilen-Dialogs räumt die App den temporären Cache auf. Mit mehreren gebooteten Geräten zuvor das richtige Gerät auswählen; der Standard nutzt `booted`.

Alternativ Cacheordner im Finder öffnen: `open "$(xcrun simctl get_app_container booted com.kayza1708.aisingularity data)/Library/Caches/exports"`. ZIP von dort kopieren, solange der Teilen-Dialog offen ist. Auf einem echten iPhone im Teilen-Dialog „In Dateien sichern“ oder AirDrop verwenden. Der Simulator-Befehl wurde hier auf Shellsyntax geprüft; ein Mac/Xcode steht in dieser Umgebung nicht zur Ausführung bereit.

## App-Icon und Anzeigename

Das bestätigte Idle-Intelligence-Logo und native Icon-Exporte sind enthalten. Nach einem Pull `npm ci` und `npm run ios:prepare` ausführen; dieser Ablauf übernimmt nach Build/Sync das Icon und den sichtbaren Namen ins vorhandene iOS-Projekt und öffnet Xcode. Ein reines `cap sync` übernimmt App-Icons nicht. Bundle-ID und vorhandene Speicherkennungen bleiben erhalten. [Details und Abnahme](idle-intelligence-branding.md).
