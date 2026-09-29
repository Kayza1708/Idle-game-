# AI Singularity – scalable economy mathematics

All unbounded economy values are canonical `ScientificNumber` values (`mantissa × 10^exponent`). JavaScript `number` fields remain compatibility/UI projections only and must never be used as the source of truth for production, affordability, spending, prestige entitlement, or exponential costs.

## Production chain

For hardware class `i` with owned count `n_i`:

`classCompute_i = (n_i × baseCompute_i + networkLink_i) × milestoneFactor_i × classUpgrade_i × mastery_i`

`rawCompute = Σ classCompute_i`

`compute/s = rawCompute × itemCompute × milestoneCompute × prestigeCompute × researchCompute × hardwareIntegration × legacyInfrastructure`

where:

- `researchCompute = 1.16 ^ computeOptimizationLevel`
- `hardwareIntegration = 1.12 ^ (hardwareIntegrationLevel × max(0, highestHardwareIndex - 7))`
- `prestigeCompute = 1 + prestigeComputePerClass × discoveredClasses`

The operating profile partitions compute but does not destroy it:

`inferenceCompute = compute/s × inferenceShare`
`trainingCompute = compute/s × trainingShare`
`researchComputeAllocation = compute/s × researchShare`

Users are capacity and are always filled:

`users = inferenceCompute × modelEfficiency / computePerUser × userMilestones × 1.14 ^ userScalingLevel`

Credits:

`credits/s = users × baseRevenuePerUser × modelQuality × INT × breakthroughs × items × modelArchitecture × ownership × temporaryBoosts`

with permanent model architecture compounding:

`modelArchitecture = (1 + architectureEffectPerLevel) ^ architectureLevel`

Data:

`data/s = users × baseDataPerUser × dataMilestones × 1.18 ^ dataGenerationLevel × prestigeData × items`

Research points:

`research/s = researchBaseRate × (researchComputeAllocation / researchComputeScale)^0.65 × dataKnowledge × milestones × achievements × items × prestigeLabs × temporaryBoosts`

The compute exponent `0.65` deliberately gives diminishing returns to raw compute while all other permanent systems can continue compounding.

## Exponential costs

Hardware unit `n`:

`hardwareCost(n) = baseCost × growth ^ n`

Bulk purchases use the exact geometric sum:

`bulkCost(n,k) = hardwareCost(n) × (growth^k - 1) / (growth - 1)`

Repeatable research level `L`:

`creditCost(L) = baseCreditCost × creditGrowth ^ (L-1)`
`dataCost(L) = baseDataCost × dataGrowth ^ (L-1)`
`duration(L) = min(baseDuration × durationGrowth ^ (L-1), durationCap)`

Training track level `L`:

`creditCost(L) = trainingCreditBase × trainingCreditGrowth ^ L`
`dataCost(L) = trainingDataBase × (L+1)`

All of these costs are computed as `ScientificNumber`; no `1e300` clamp participates in affordability.

## Prestige

Prestige entitlement is based on the logarithm of exact lifetime eligible credits, not the projected UI number:

`ratioLog = max(0, log10(lifetimeEligibleCredits) - log10(prestigeThreshold))`

`totalEntitlement = floor(prestigeScale × ratioLog ^ prestigePower)`

`newINT = totalEntitlement - alreadyClaimedEntitlement`

This means `1e500`, `1e5000`, etc. remain mathematically meaningful instead of collapsing into the old `1e300` ceiling.

## Invariants

1. Canonical balances and lifetime credit totals live in `exactEconomy`.
2. Production is calculated in scientific space before multiplying by elapsed seconds.
3. Affordability and spending compare/subtract scientific values.
4. Legacy `number` fields are projections for old UI/tests only.
5. No balance formula may depend on reaching a value at a specific real-world hour/day. Time-to-unlock is an outcome of the formulas, not an input.
6. Permanent systems compound through explicit multipliers; walls are crossed by improving interacting systems, not by hidden time gates.

## Display and compatibility boundary

The `number` fields in `GameState` are compatibility projections only. UI resource totals must render from `exactEconomy`; unbounded rates must render from their `*Scientific` functions. A projected `1e300` value must never be interpreted as the player's real balance.

Automation affordability uses exact scientific balances and exact scientific hardware costs, including the configured reserve. UI button eligibility for scientific training costs uses the same exact comparison as the transaction itself. This keeps display, automation, and transactions consistent beyond IEEE-754 range.

## Cross-system synergy architecture

The economy is intentionally multiplicative. Progress is not targeted to a clock time; it emerges from scalable functions.

- Infrastructure diversity: `B_class ^ unlockedClasses`, where research and Compute-Net prestige raise `B_class`.
- Hardware ownership: product across classes of `(1 + classOwnershipBase) ^ sqrt(count)`. Later Compute-Net nodes raise this multiplier to a power.
- Data flywheel: `10 ^ (DataPower * log10(1 + lifetimeData)^0.72)`. Data research and Data Archive nodes raise DataPower and later exponentiate the result.
- Model: Quality is `1.12^Q`, Efficiency is `1.10^E`, and global Model Synergy is `B_model^(Q+E)`. Model Architecture research raises `B_model`.
- INT: `1.10^sqrt(totalINTEarned)` in addition to the legacy direct INT multiplier.
- Achievements: milestone multipliers every 25 and 100 achievement points.
- Artifacts and breakthroughs are rule-layer multipliers, not flat additive percentages.
- Items: rarity controls effect count. Common/Uncommon have one effect, Rare/Epic two, Legendary/Mythic three. Secondary and tertiary effects are weaker than the primary effect but inherit rarity/forge/scaling. Manufacturing prestige raises the exponent applied to item synergies.

The principal flywheels are:

`Hardware -> Compute -> Users -> Data -> Data Synergy -> Revenue -> Hardware`

`Hardware -> Compute -> Model -> Model Synergy -> Compute/Research/Revenue`

`Research -> synergy bases/exponents -> all production systems -> more Research`

`Prestige -> stronger bases/exponents -> faster runs -> more INT -> stronger permanent scaling`


## Long-term cross-synergy content pass

The economy now intentionally uses layered cross-system scaling rather than isolated flat bonuses.

- Hardware milestones at 10/25/50/100/250/500 contribute global compute, users, revenue, data and research multipliers. Late 500 milestones on Subsea+ hardware also modify synergy exponents.
- Infrastructure synergy is based on unlocked classes and can itself be exponentiated by late hardware milestones.
- Data Flywheel research exponentiates Data Synergy; Synthetic Data couples Model Level into data production.
- Parallel Architecture couples research level to unlocked hardware classes. Hardware Co-Design couples research × Model Level × hardware classes into compute.
- Commercialization is a multiplicative revenue layer. Network Effects derives an additional log-domain revenue multiplier from the user magnitude.
- Recursive Learning exponentiates Model Synergy. Autonomous Science increases the share of Model Synergy applied to research.
- Item rarity controls effect count: common/uncommon one effect, rare/epic two, legendary/mythic three. Prestige can strengthen secondary and tertiary effects; late hardware milestones can exponentiate the aggregate item layer.
- Artifacts and breakthroughs remain compact rule-changing permanent layers and gain mild superlinear scaling with collection size.

These coefficients are intentionally not considered final balance. Their purpose is to establish scalable mathematical levers before 1/7/30/60/90-day tuning.
