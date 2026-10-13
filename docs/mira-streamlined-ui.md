# Mira and streamlined progression UI

## Confirmed screenshot findings

The current iPhone build showed Data gone after prestige, early Axiom tabs, narrow multi-column effect prose, tiny Mira inside a rectangular outer container, and long permanent equipment-combination explanations. This pass is based on the supplied screenshots and real rendered follow-up views.

## Reset and unlock contracts

Normal prestige retains unspent Data and its exact scientific ledger, including balances greater than 1e308. Cancelling paid training/analysis does not refund their booked costs. Repeated claims do not duplicate Data; reload preserves it. Preview/confirmation/story wording agree. Axiom retains the existing deeper Data reset, shown explicitly in its confirmation. Challenge starts still receive zero main Data; abort returns the isolated main balance. Save schema unchanged.

Axioms appear at the first attainable scientific reward (cycle INT meets `axiomThresholdScientific`), or once historical Axioms/reset history proves the layer was reached. The profile respects the same visibility. Visibility changes no reward calculation or reset permission.

## Integrated UI

Mira uses the existing transparent pixel artwork at character scale, on a transparent stage, with an angular cream speech bubble and no outer box. Brief tutorial instructions, optional requirements, a 44px target-navigation action and target arrow connect to real existing targets. Story pages keep their narrative in optional detail where shortened. Generic dialogue heading is accessibility-only. The guide remains a measured shell row so detail sheets do not cover its controls; stage height adapts to expanded text and small viewports.

Prestige nodes show one full-width mechanical description, an INT price, concrete build changes and optional research unlocks. `EffectPreview` calls existing Compute/Users/Credits/Data/training-cost/lab-performance formulas, shows only changed rows and retains signed deltas. No generic independent percentage is invented. Research and equipment reuse it. Calculations remain accessible in disclosures, unchanged.

Equipment combinations, challenge rules and each of the three foundries open independently. Foundries now use their previously supplied 3-cell PNG atlas. Empty saved-job panels and duplicate unlock labels are removed from the main view; active job details remain. Hardware main rows show price/owned/output without repeating missing Credits below every locked class. Large resource balances use exact scientific ledgers, not clipped display projections; huge INT claims are formatted as compact values. Normal prestige details quote the actual next INT threshold, including the first attainable INT.

## Verification and scope

- Seven reset/visibility tests cover fractional Data, scientific balances through reload/another reset, paid job cancellation, challenge isolation, deeper Axiom reset, threshold boundary and persistent layer visibility.
- Four presentation tests cover real multi-resource node gain, negative/no-change previews, scientific resource cells and hidden early Axiom UI/Mira structure.
- Complete suite: 101 files / 1,375 tests passed. Typecheck/source-case validation/build and diffcheck pass; existing main-bundle size advisory remains.
- `scripts/mobile-layout-audit.mjs`: 216 views, DE/EN, widths 360/390/430, height 844, tutorial also height 640 and root font 20px. Covers five screens, shop categories, research/analysis/crafting, equipment, profile/settings/missions/season, shared confirmations and Mira story/coach/target sheets. Assertions include bounds, horizontal overflow, asset response errors, price alignment, disabled unaffordable confirmation and focus retention.
- `scripts/mira-late-ui-audit.mjs`: 336 views, prepared late save, all 46 node sheets at six width/language combinations; first attainable Axiom layer, inventory with all 30 item types, three filled slots, individual foundries and research automation. These are renderer fixtures, not naturally achieved progression. Every node is opened programmatically for detail validation; physical pan/pinch and every purchase path are not thereby certified.

Total: 552 rendered views passed the stated checks. Thirty targeted tests also passed after the final presentation edits.

The screenshots are reproducible under `node_modules/.cache`. Native WKWebView safe areas, real keyboard, VoiceOver and every alternative quest/forge/job state still need device acceptance. A larger browser font is not a real iOS Dynamic Type test. No complete release certification or new long-term balance claim is made. Existing art is reused; no large asset regeneration or effect/balance overhaul is claimed.
