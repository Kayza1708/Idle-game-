# Native Unity V3 — deterministic fresh-start balance baseline

**Implementation:** `IdleIntelligence/NativeChecks/V3BalanceProbe.cs`

**Baseline run:** [GitHub Actions 41066892080](https://github.com/Kayza1708/Idle-game-/actions/runs/41066892080)  
**Raw measurement file:** [Unity V3 CSV artifact](https://github.com/Kayza1708/Idle-game-/actions/runs/41066892080/artifacts/12983130784)

## Scripted player contract

- A brand-new native V3 game created via `Game.NewV3`, no imported save or legacy progression.
- Two manual taps per simulated minute; maximum five *paid* hardware purchases each minute from the earliest four hardware classes, highest affordable class first.
- When idle, start a genuinely affordable quality or efficiency training job; when the research lab is free, start genuinely affordable blueprints, data generation or compute optimization research.
- No free currency, injected inventory, direct prestige grants, ads, real-money purchases or artificially completed research jobs.
- Use the real `Game.Advance`, `Game.Buy`, `Game.Tap`, `Game.Train` and `Game.Research` calls and run `Game.Validate` after each simulated minute.
- This is **one deterministic bot policy** for economy regression only, not a real mobile player or representative estimate of retention.

## Native V3 observations

| Simulated elapsed time | Credits/s | Data/s | Hardware units | Quality / efficiency | Research levels | Claimable INT |
|---:|---:|---:|---:|---:|---:|---:|
| 1 min | 2.7 | 0.1 | 2 | 0 / 0 | 0 | 0 |
| 3 min | 18.1 | 0.4 | 12 | 0 / 0 | 0 | 0 |
| 5 min | 37.3 | 0.7 | 22 | 1 / 0 | 1 | 0 |
| 10 min | 162.5 | 1.6 | 35 | 1 / 1 | 2 | 0 |
| 15 min | 391.5 | 2.6 | 48 | 2 / 2 | 3 | 0 |
| 20 min | 1,337.6 | 5.4 | 58 | 3 / 3 | 4 | 0 |
| 25 min | 3,099.5 | 9.0 | 76 | 4 / 3 | 5 | 0 |
| 30 min | 6,844.0 | 15.6 | 92 | 5 / 4 | 6 | 0 |
| 45 min | 22,444.9 | 29.6 | 125 | 7 / 6 | 7 | 0 |
| 60 min | 155,669.9 | 90.2 | 158 | 8 / 8 | 8 | 0 |
| 90 min | 366,787.4 | 175.3 | 213 | 10 / 10 | 10 | 0 |
| 120 min | 786,839.0 | 295.4 | 240 | 12 / 12 | 12 | 1 |

**Result:** In this script the first claimable INT is reached between 90 and 120 simulated minutes, and no prestige reset occurs because the probe deliberately logs eligibility before choosing resets.

## Questions for the first human balance session

1. Is first prestige after roughly 1.5–2 hours acceptable for active players, or should the first threshold be earlier?
2. Does training/research frequency (24 training levels and 12 research levels in two hours here) create compelling choices rather than busywork?
3. How quickly do normal players discover and craft their first items? The basic no-loot benchmark does not represent component analyses, blueprint acquisition, or drop cadence.
4. Do 30/60/120-minute check-ins show meaningful differences in the live Unity screens, not just in numeric rates?

Do **not** treat this baseline as a balancing recommendation or change global rates solely from a single automated route. Re-run it unchanged after any intended progression modification and compare the same snapshots. An actual Unity macOS/iOS player/PlayMode run is still needed before release.
