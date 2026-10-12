# Challenge / recovery corrections after PR #85

Base: `36a56c5` (main, PR #85 merged). This is a separate correction branch. No release, merge or commerce integration.

## Contracts and provisional balance

- New challenge starts use catalogue v2. Existing v0/v1 runs retain their rules, targets and fixed positional network restrictions. First-completion ownership, stars, jobs and previous automation ownership are retained.
- Save v48 adds a per-material fractional analysis yield ledger to both main and nested challenge states. v47 migration adds empty ledgers without retroactive grants. Invalid current ledgers are rejected.
- Quality/Efficiency targets use `ceil(stage / 8)`, at most 9. Existing training costs/rates/durations and production targets are unchanged. The maximum unmodified sequential time prerequisite is below one hour; this does not prove total challenge completion time or reachability.
- Serial Science adds paid, **completed** research Data to its goals: `100 × 1.22^(stage-1)`. From chapter 2 research starts must alternate areas. These are costs paid to real projects, not a second spend/refund mechanism.
- Closed Supply Chain adds a per-stage generated-Data target and chapter targets of 1/1/2/2/3/3 different locally crafted types. Copied loadout items do not count. Existing rarity targets remain. Neither these targets nor late material farming are calibrated.
- Account entry requires first prestige and an actually purchased main-game class by chapter: SBC/PC/GPU/server/campus/orbital. Discovery labels do not prove purchase. Science needs accessible repeatable research in enough areas; supply needs Open Blueprints; fragmented network needs a real inference unlock.
- Fragmented Network chooses permitted successor links before the run. Selection is copied, persisted and validated; changing hardware counts cannot activate an unselected edge. Existing chapter connection budgets remain.
- Shared automation uses total first-completion stages 21/42/70/140/245/350, never replay counts. Previously acquired options remain owned. These thresholds are provisional and need natural play calibration.
- Hands Off now extends the existing offline-time budget (24h maximum) and amplifies the long-term-memory item bonus. Bare Metal amplifies Mastery; Fragmented Network amplifies connections. All use the existing logarithmic family reward coefficient and disable their own reward inside their challenge.

## Item and analysis transactions

The first selected fusion instance is retained with its ID, level, Forge and relay counter; two matching duplicates are destroyed. Rarity increases once. All three material receipts and recovery-used amounts are combined; the 60% total recovery ceiling remains. No Data/module/blueprint refund is introduced. Preview and UI identify the base and use the preserved level/Forge. Protected, equipped, foundry-busy and challenge-copy instances remain ineligible.

New analysis snapshots carry `fractionalYield: true`. Combination and family yield multipliers are applied together before one rounding operation. Remainders persist separately per material, through reload and both resets, and are consumed only on analysis settlement. Old snapshots lacking the flag keep their old payout policy. Completed IDs continue to prevent double settlement. This prevents a +60% rare-material item bonus from disappearing on every individual find.

## What is not established

No proof of all 690 natural completions, months of retention, dominant-build avoidance or monetization readiness. No new routine system, foundry specialization, bonus-box generator or art assets are included. Full long-term balancing remains a separate task after this correction.
