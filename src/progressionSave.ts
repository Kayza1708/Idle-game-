import {
  BALANCE,
  exactEconomyValue,
  computeRateScientific,
  creditRateScientific,
  dataRateScientific,
  trainingRate,
  researchPerformanceQuote,
  prestigeClaimScientific,
  prestigeUpgradeCost,
  hardwareIds,
  hardwareAutobuyerUnlocked,
  type GameState,
  type PrestigeUpgradeId,
} from "./economy";
import { experimentSpeed } from "./experiments";
import { itemEffectFor, equippedItems, itemEffectProfile } from "./economy";
import {
  newProgression,
  discoverProgression,
  progressionResearchSpeed,
  type ModelId,
} from "./progression";
import { ScientificNumber } from "./scientificNumber";
const S = ScientificNumber.from;
function rates(s: GameState) {
  return {
    compute: computeRateScientific(s.hardware, s),
    credits: creditRateScientific(s.hardware, s.level, s, s.savedAt, false),
    data: dataRateScientific(s),
    training: S(trainingRate(s.hardware, s)),
    research: S(
      s.progression?.version === 2
        ? progressionResearchSpeed(s)
        : researchPerformanceQuote(s).laborFactor,
    ),
    analysis: S(experimentSpeed(s)),
  };
}
export function migrateProgressionV2(s: GameState): GameState {
  if (s.progression?.version === 2) return s;
  const before = rates(s),
    oldNodes = [...s.nodes],
    p = newProgression(s.savedAt);
  p.migrated = true;
  p.legacyNodes = oldNodes;
  if (oldNodes.includes("componentScanner"))
    p.licenses.push("componentScanner");
  p.known = [...oldNodes];
  p.bestINT = exactEconomyValue(s, "cycleINTEarned").toJSON();
  p.entitlement = prestigeClaimScientific(s).toJSON();
  p.legacyAutobuyers = hardwareIds.filter((id) =>
    hardwareAutobuyerUnlocked(s, id),
  );
  p.axiomCycleStartedAt = s.runStartedAt;
  const mapping = BALANCE.progression.legacyMap as Record<string, string>,
    mapped = oldNodes.flatMap((id) => (mapping[id] ? [mapping[id]] : []));
  p.permanentSlots = ["processorAux", "coreAux", "researchAux"].slice(
    0,
    Math.max(0, Math.min(3, (s.unlockedEquipmentSlots ?? 0) - 3)),
  );
  let refund = ScientificNumber.zero();
  for (const id of ["manufacturing1", "manufacturing3", "manufacturing5"])
    if (oldNodes.includes(id))
      refund = refund.add(S(prestigeUpgradeCost(id as PrestigeUpgradeId)));
  const spent = exactEconomyValue(s, "spentINT");
  if (refund.compare(spent) > 0)
    throw new TypeError(
      "Historische INT-Käufe sind nicht mit dem Investitionsledger vereinbar. Originalstand bleibt erhalten.",
    );
  const u = exactEconomyValue(s, "unspentINT").add(refund),
    paid = spent.subtract(refund);
  const levels = { ...s.axiomUpgradeLevels };
  if (levels.axiomResonance) levels.A01 = Math.min(5, levels.axiomResonance);
  if (levels.axiomArchive) levels.C01 = 1;
  if (levels.axiomAutomation || s.axiomUpgrades.includes("prestigeAgent")) {
    levels.B02 = 1;
    p.licenses.push("I06");
  }
  if (s.axiomUpgrades.includes("anchoredShoppingAgent")) levels.B01 = 1;
  if (s.axiomUpgrades.includes("analysisPlanner")) levels.C02 = 1;
  if (s.axiomUpgrades.includes("craftingPlanner")) levels.C03 = 1;
  let next: GameState = {
    ...s,
    integrationLevel: 0,
    nodes: mapped,
    axiomUpgradeLevels: levels,
    progression: p,
    unspentINT: u.toNumber(),
    spentINT: paid.toNumber(),
    exactEconomy: {
      ...s.exactEconomy,
      unspentINT: u.toJSON(),
      spentINT: paid.toJSON(),
    },
  };
  // Old current production is preserved once. Numeric INT continuity expires on AX.
  // Persistent baseline is computed without either generation's INT nodes.
  const effects = [
    ...new Set(equippedItems(s).flatMap((i) => itemEffectProfile(i))),
  ];
  for (const permanent of [true, false])
    for (const effect of effects) {
      const oldState = permanent ? { ...s, nodes: [] } : s,
        newState = permanent ? { ...next, nodes: [] } : next,
        sum = (state: GameState) =>
          equippedItems(state).reduce(
            (n, i) => n + itemEffectFor(state, i, effect),
            0,
          ),
        a = sum(newState),
        b = sum(oldState);
      (permanent ? p.legacyPermanent : p.legacyCycle)["item:" + effect] = S(
        a > 0 ? Math.max(1, b / a) : 1,
      ).toJSON();
    }
  const permanentBefore = rates({ ...s, nodes: [] });
  for (const key of [
    "compute",
    "data",
    "training",
    "research",
    "analysis",
    "credits",
  ] as const) {
    const a = rates({ ...next, nodes: [] })[key],
      b = permanentBefore[key];
    p.legacyPermanent[key] =
      !a.isZero() && b.compare(a) > 0 ? b.divide(a).toJSON() : S(1).toJSON();
  }
  for (const key of [
    "compute",
    "data",
    "training",
    "research",
    "analysis",
    "credits",
  ] as const) {
    const after = rates(next)[key];
    p.legacyCycle[key] =
      !after.isZero() && before[key].compare(after) > 0
        ? before[key].divide(after).toJSON()
        : S(1).toJSON();
  }

  // Translate elapsed historical work once; do not restart an already paid job.
  const remember = (
    id: string,
    start: number,
    end: number,
    required: number,
  ) => {
    const fraction =
        end > start
          ? Math.min(1, Math.max(0, (s.savedAt - start) / (end - start)))
          : 1,
      done = required * fraction;
    p.work[id] = { required, done, speed: 1, quantityIntegral: done };
  };
  for (const j of s.researchLabs)
    if (j)
      remember(
        j.jobId ?? `${j.id}:${j.startedAt}`,
        j.startedAt,
        j.endsAt,
        j.intro
          ? BALANCE.introResearchSeconds
          : j.quoteBasis
            ? (j.quoteBasis.baseDuration * (j.quoteBasis.planningFactor ?? 1)) /
              (j.quoteBasis.temporaryFactors.deviceSwitch ?? 1)
            : j.durationSeconds,
      );
  if (s.crafting.active) {
    const j = s.crafting.active;
    remember(
      j.id,
      j.startedAt ?? s.savedAt,
      j.endsAt ?? s.savedAt,
      j.durationPerUnit,
    );
  }
  for (const f of s.foundries)
    if (f.active) {
      const j = f.active;
      remember(
        `forge:${j.itemId}:${j.startedAt}`,
        j.startedAt,
        j.endsAt,
        j.duration,
      );
    }
  if (s.experiments.active) {
    const j = s.experiments.active,
      required =
        BALANCE.analysisCosts[j.type][j.length === "intro" ? "short" : j.length]
          .duration;
    remember(j.id, j.startedAt, j.endsAt, required);
    const w = p.work[j.id];
    w.familyIntegral = {
      photonic: w.done * (j.materialContract?.familyFactors.photonic ?? 1),
      quantum: w.done * (j.materialContract?.familyFactors.quantum ?? 1),
    };
  }
  next = { ...next, progression: { ...p } };
  if (s.challengeSession)
    next = {
      ...next,
      challengeSession: {
        ...s.challengeSession,
        main: migrateProgressionV2(s.challengeSession.main),
      },
    };
  return discoverProgression(next);
}
export function assertProgressionV2(s: GameState) {
  const p = s.progression;
  if (!p) return;
  const fail = () => {
    throw new TypeError(
      "Ungültiger Prestige-v2-Spielstand. Originalstand bleibt erhalten.",
    );
  };
  if (
    p.version !== 2 ||
    !Number.isSafeInteger(s.integrationLevel) ||
    s.integrationLevel < 0 ||
    s.integrationLevel > 300 ||
    !Array.isArray(p.known) ||
    new Set(p.known).size !== p.known.length ||
    p.known.some(
      (id) =>
        !Object.hasOwn(BALANCE.prestigeUpgrades, id) &&
        !Object.hasOwn(BALANCE.progression.nodes, id),
    ) ||
    !Array.isArray(p.licenses) ||
    p.licenses.some(
      (id) =>
        !Object.hasOwn(BALANCE.prestigeUpgrades, id) &&
        !Object.hasOwn(BALANCE.progression.nodes, id),
    ) ||
    !Number.isSafeInteger(p.rng) ||
    p.rng < 0 ||
    p.rng > 4294967295 ||
    !Number.isSafeInteger(p.combo) ||
    p.combo < 0 ||
    p.combo > 50 ||
    !Number.isFinite(p.axiomCycleStartedAt) ||
    p.axiomCycleStartedAt < 0 ||
    (p.lastTap !== null && (!Number.isFinite(p.lastTap) || p.lastTap < 0))
  )
    fail();
  for (const x of [
    p.entitlement,
    p.bestINT,
    p.knowledge,
    p.lastPrestige,
    p.axiomMinimum,
    ...Object.values(p.reserves),
    ...Object.values(p.legacyCycle),
    ...Object.values(p.legacyPermanent),
  ])
    if (!ScientificNumber.isValidJSON(x)) fail();
  if (
    !p.models ||
    Object.entries(p.models).some(
      ([id, l]) =>
        !Object.hasOwn(BALANCE.progression.models, id) ||
        !Number.isSafeInteger(l) ||
        l! < 0 ||
        l! > BALANCE.progression.modelLevelLimit,
    ) ||
    (p.active !== null && p.models[p.active as ModelId] === undefined)
  )
    fail();
  const integer = (n: unknown, max = Number.MAX_SAFE_INTEGER): n is number =>
    typeof n === "number" && Number.isSafeInteger(n) && n >= 0 && n <= max;
  const finite = (n: unknown): n is number =>
    typeof n === "number" && Number.isFinite(n) && n >= 0;
  const unique = (xs: unknown, allowed: readonly string[]): xs is string[] =>
    Array.isArray(xs) &&
    new Set(xs).size === xs.length &&
    xs.every((id) => typeof id === "string" && allowed.includes(id));
  const nodes = Object.keys(BALANCE.progression.nodes),
    models = Object.keys(BALANCE.progression.models),
    components = Object.keys(BALANCE.components),
    tracks = ["quality", "efficiency", "integration"];
  for (const key of [
    "migrated",
    "lab",
    "labSeed",
    "starterGift",
    "trainingAuto",
    "axiomAuto",
  ] as const)
    if (typeof p[key] !== "boolean") fail();
  for (const key of ["critRng", "materialRng"] as const)
    if (!integer(p[key], 4294967295)) fail();
  if (
    !unique(p.rebuild, nodes) ||
    !unique(p.permanentSlots, ["processorAux", "coreAux", "researchAux"]) ||
    !unique(p.legacyAutobuyers, hardwareIds) ||
    !unique(p.legacyNodes, Object.keys(BALANCE.prestigeUpgrades))
  )
    fail();
  if (
    ![null, "lab", "axiom"].includes(p.tutorial) ||
    ![null, 2, 5, 10].includes(p.relative) ||
    (p.maximumRunSeconds !== null && !finite(p.maximumRunSeconds))
  )
    fail();
  for (const value of [
    p.trainingTargets,
    p.trainingRecords,
    p.cycleLevelRecords,
  ])
    if (
      !value ||
      tracks.some((track) => !integer(value[track as keyof typeof value]))
    )
      fail();
  if (
    !p.reserves ||
    ["credits", "data", "int"].some(
      (key) =>
        !ScientificNumber.isValidJSON(
          p.reserves[key as keyof typeof p.reserves],
        ),
    )
  )
    fail();
  if (
    !p.modelPlan ||
    ["reset", "research", "material"].some((phase) => {
      const id = p.modelPlan[phase as keyof typeof p.modelPlan];
      return (
        id !== null && (!models.includes(id) || p.models[id] === undefined)
      );
    })
  )
    fail();
  if (
    !p.fusionPlanner ||
    typeof p.fusionPlanner.enabled !== "boolean" ||
    !unique(p.fusionPlanner.types, Object.keys(BALANCE.itemRecipes)) ||
    !["common", "uncommon", "rare", "epic", "legendary", "mythic"].includes(
      p.fusionPlanner.target,
    )
  )
    fail();
  if (
    !p.passiveRemainders ||
    Object.entries(p.passiveRemainders).some(
      ([id, n]) => !components.includes(id) || !finite(n) || n >= 1,
    )
  )
    fail();
  if (
    !p.work ||
    Object.values(p.work).some(
      (w) =>
        !w ||
        !finite(w.required) ||
        w.required === 0 ||
        !finite(w.done) ||
        w.done > w.required + 1e-7 ||
        !finite(w.speed) ||
        !finite(w.quantityIntegral) ||
        (w.familyIntegral &&
          Object.values(w.familyIntegral).some((n) => !finite(n))),
    )
  )
    fail();
  if (
    p.synthesis &&
    (!p.synthesis.id ||
      !components.includes(p.synthesis.component) ||
      !finite(p.synthesis.work) ||
      !finite(p.synthesis.required) ||
      p.synthesis.required === 0 ||
      p.synthesis.work > p.synthesis.required)
  )
    fail();
  if (
    p.fusion &&
    (!p.fusion.id ||
      !finite(p.fusion.done) ||
      !finite(p.fusion.required) ||
      p.fusion.required === 0 ||
      p.fusion.done > p.fusion.required ||
      p.fusion.inputs.length !== 3 ||
      new Set(p.fusion.inputs.map((i) => i.id)).size !== 3 ||
      p.fusion.inputs.some(
        (i) =>
          !Object.hasOwn(BALANCE.itemRecipes, i.type) ||
          ![
            "common",
            "uncommon",
            "rare",
            "epic",
            "legendary",
            "mythic",
          ].includes(i.rarity) ||
          !integer(i.level) ||
          s.inventory.some((owned) => owned.id === i.id) ||
          (i.materialBasis &&
            Object.entries(i.materialBasis).some(
              ([id, n]) => !components.includes(id) || !finite(n),
            )),
      ))
  )
    fail();
  if (
    p.resetIntent &&
    (!["prestige", "axiom"].includes(p.resetIntent.kind) ||
      typeof p.resetIntent.training !== "boolean" ||
      !Array.isArray(p.resetIntent.research) ||
      !Array.isArray(p.resetIntent.crafting) ||
      [...p.resetIntent.research, ...p.resetIntent.crafting].some(
        (id) => typeof id !== "string",
      ) ||
      (p.resetIntent.analysis !== null &&
        typeof p.resetIntent.analysis !== "string"))
  )
    fail();
  for (const [id, n] of Object.entries(s.axiomUpgradeLevels)) {
    if (!Object.hasOwn(BALANCE.progression.axioms, id)) continue;
    const config =
      BALANCE.progression.axioms[id as keyof typeof BALANCE.progression.axioms];
    if (
      !integer(n, id === "A02" ? Number.MAX_SAFE_INTEGER : config.costs.length)
    )
      fail();
  }
  if (
    s.activeTraining?.modelTransferEligible !== undefined &&
    typeof s.activeTraining.modelTransferEligible !== "boolean"
  )
    fail();
}
