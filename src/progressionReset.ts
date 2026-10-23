import {deviceBonus} from './deviceEffects';
import {closeBalanceRun} from './balanceHistory';
import {
  challengeCatalogQuote,
  addChallengeMetrics,
  type ChallengeFamily,
} from "./challengeStages";
import { choosePhaseModel, rebuildKnown } from "./progressionAutomation";
import {
  BALANCE,
  exactEconomyValue,
  axiomEconomyValue,
  initializeRun,
  newINTScientific,
  newGame,
  MAX_ECONOMY_VALUE,
  type GameState,
  type AxiomUpgradeId,
} from "./economy";
import { ScientificNumber } from "./scientificNumber";
import {
  axiomLevel,
  knownPurchaseCount,
  hasProgressionNode,
  discoverProgression,
  minimalRestart,
  activeSlotIds,
  type AxiomNodeV2,
  type PrestigeNodeV2,
} from "./progression";
import { addEvent, recordPrestige } from "./telemetry";
import { cancelCrafting } from "./inventory";
const S = ScientificNumber.from;
export function buyProgressionNode(s: GameState, id: PrestigeNodeV2) {
  if (s.retention.activeRun || hasProgressionNode(s, id)) return s;
  const node = BALANCE.progression.nodes[id];
  if (!node) return s;
  const u = exactEconomyValue(s, "unspentINT"),
    cost = S(node.cost);
  if (u.compare(cost) < 0) return s;
  const free = u.subtract(cost),
    spent = exactEconomyValue(s, "spentINT").add(cost),
    next = {
      ...s,
      nodes: [...s.nodes, id],
      unspentINT: free.toNumber(),
      spentINT: spent.toNumber(),
      exactEconomy: {
        ...s.exactEconomy,
        unspentINT: free.toJSON(),
        spentINT: spent.toJSON(),
      },
      progression: {
        ...s.progression,
        known: [...new Set([...s.progression.known, id])],
        permanentSlots: [...s.progression.permanentSlots],
      },
    };
  if (["W01", "W02", "W06"].includes(id))
    next.progression.permanentSlots = activeSlotIds(next).filter((slot) =>
      slot.endsWith("Aux"),
    );
  return addEvent(next, "prestige-node-buy", s.savedAt, {
    id,
    cost: node.cost,
    effect: node.effect,
  });
}
export function axiomNodeCost(s: GameState, id: AxiomNodeV2) {
  const n = BALANCE.progression.axioms[id],
    l = axiomLevel(s, id);
  if (!n) return null;
  return l < n.costs.length
    ? S(n.costs[l])
    : id === "A02"
      ? S(BALANCE.progression.formula.axiomTailPrice).multiply(
          S(BALANCE.progression.formula.axiomTailGrowth).pow(
            l - BALANCE.progression.formula.axiomCreditBoundedLevels,
          ),
        )
      : null;
}
export function buyProgressionAxiom(s: GameState, id: AxiomNodeV2) {
  if (s.retention.activeRun) return s;
  const cost = axiomNodeCost(s, id),
    available = axiomEconomyValue(s, "available");
  if (!cost || available.compare(cost) < 0) return s;
  const free = available.subtract(cost);
  return addEvent(
    {
      ...s,
      axioms: free.toNumber(),
      availableAxioms: free.toNumber(),
      exactAxioms: { ...s.exactAxioms, available: free.toJSON() },
      axiomUpgrades: [...new Set([...s.axiomUpgrades, id as AxiomUpgradeId])],
      axiomUpgradeLevels: {
        ...s.axiomUpgradeLevels,
        [id]: axiomLevel(s, id) + 1,
      },
    },
    "axiom-upgrade-buy",
    s.savedAt,
    { id, cost: cost.toScientificString(), level: axiomLevel(s, id) + 1 },
  );
}
export function axiomThresholdV2(s: GameState) {
  return axiomEconomyValue(s, "total")
    .add(S(1))
    .multiplyNumber(BALANCE.progression.axiomThreshold);
}
export function axiomRewardV2(s: GameState) {
  if (s.retention.activeRun) return ScientificNumber.zero();
  if (
    !s.axiomResetCount &&
    knownPurchaseCount(s) < BALANCE.progression.firstAxiomNodes
  )
    return ScientificNumber.zero();
  const i = exactEconomyValue(s, "cycleINTEarned").add(newINTScientific(s));
  return i.divide(axiomThresholdV2(s)).sqrt().multiplyNumber(1+deviceBonus(s,"axiomResonance")).floor();
}
function releaseUnstarted(state: GameState) {
  let s = state;
  for (const j of [...s.crafting.queue]) s = cancelCrafting(s, j.id);
  return {
    ...s,
    researchQueue: [],
    trainingQueue: [],
    experiments: { ...s.experiments, queue: [] },
    foundries: s.foundries.map((f) => ({ ...f, queue: [] })),
  };
}
function claimINT(s: GameState) {
  const gain = newINTScientific(s),
    I = exactEconomyValue(s, "cycleINTEarned").add(gain),
    U = exactEconomyValue(s, "unspentINT").add(gain),
    total = exactEconomyValue(s, "totalINTEarned").add(gain);
  return discoverProgression({
    ...s,
    cycleINTEarned: I.toNumber(),
    unspentINT: U.toNumber(),
    totalINTEarned: total.toNumber(),
    prestigeEntitlementClaimed: I.toNumber(),
    exactEconomy: {
      ...s.exactEconomy,
      cycleINTEarned: I.toJSON(),
      unspentINT: U.toJSON(),
      totalINTEarned: total.toJSON(),
      prestigeEntitlementClaimed: I.toJSON(),
    },
  });
}
export function normalResetV2(state: GameState) {
  const gain = newINTScientific(state);
  if (gain.compare(S(1)) < 0) return state;
  if (state.retention.activeRun) {
    const q = challengeCatalogQuote(
      state.retention.activeRun.id as ChallengeFamily,
      state.retention.activeRun.stage ?? 1,
    );
    if (!q || gain.compare(q.minimumINT) < 0) return state;
  }
  const s = releaseUnstarted(claimINT(state)),
    archive = hasProgressionNode(s, "T08"),
    base = newGame(s.savedAt);
  let next = initializeRun({
    ...s,
    hardwareCounts: base.hardwareCounts,
    hardware: 0,
    classUpgrades: [],
    qualityLevel: archive ? s.qualityLevel : 0,
    efficiencyLevel: archive ? s.efficiencyLevel : 0,
    integrationLevel: archive ? s.integrationLevel : 0,
    level: archive ? s.level : 0,
    training: archive ? s.training : 0,
    activeTraining: archive ? s.activeTraining : null,
    runMilestoneEdges: [],
    runMilestoneClasses: [],
    runTrainingStarted: 0,
    runTrainingCompleted: 0,
    runResearchCompleted: 0,
    runStartedAt: s.savedAt,
    runCreditsEarned: 0,
    exactEconomy: { ...s.exactEconomy, runCreditsEarned: { m: 0, e: 0 } },
    prestigeCount: s.prestigeCount + 1,
    overclock: base.overclock,
    progression: {
      ...s.progression,
      combo: 0,
      lastTap: null,
      resetIntent: null,
      lastPrestige: gain.toJSON(),
    },
    lifetime: {
      ...s.lifetime,
      prestiges: s.lifetime.prestiges + 1,
      intEarned: s.lifetime.intEarned + gain.toNumber(),
    },
    deviceProgress: {
      ...s.deviceProgress,
      qualityCompletions: 0,
      efficiencyCompletions: 0,
      lastTrack: null,
    },
  });
  next = minimalRestart(rebuildKnown(choosePhaseModel(next, "reset")));
  next = recordPrestige(state, next, gain.toNumber(MAX_ECONOMY_VALUE));
  if (state.retention.activeRun) {
    const m = state.retention.activeRun.metrics!;
    next = addChallengeMetrics(next, {
      prestiges: m.prestiges + 1,
      minimumINT:
        m.prestiges === 0 ||
        ScientificNumber.fromJSON(m.minimumINT).compare(gain) > 0
          ? gain.toJSON()
          : m.minimumINT,
    });
  }
  return next;
}
export function axiomResetV2(state: GameState) {
  const gain = axiomRewardV2(state);
  if (gain.compare(S(1)) < 0) return state;
  const s = releaseUnstarted(claimINT(state)),
    total = axiomEconomyValue(s, "total").add(gain),
    free = axiomEconomyValue(s, "available").add(gain);
  const keep = [
    "W01",
    "W02",
    "W06",
    ...(axiomLevel(s, "B01") ? ["H01", "H02", "H03", "H04", "H05"] : []),
    ...(axiomLevel(s, "B02")
      ? ["T03", "T06", "F02", "F03", "F05", "I06", "I07"]
      : []),
  ];
  const exact = { ...s.exactEconomy };
  for (const key of [
    "credits",
    "data",
    "runCreditsEarned",
    "cycleINTEarned",
    "unspentINT",
    "spentINT",
    "cycleEligibleCredits",
    "prestigeEntitlementClaimed",
  ] as const)
    exact[key] = { m: 0, e: 0 };
  const base = newGame(s.savedAt);
  const reset = minimalRestart(
      initializeRun({
        ...s,
        nodes: s.nodes.filter((id) => keep.includes(id)),
        axiomResetCount: s.axiomResetCount + 1,
        axioms: free.toNumber(),
        availableAxioms: free.toNumber(),
        totalAxiomsEarned: total.toNumber(),
        exactAxioms: { available: free.toJSON(), total: total.toJSON() },
        cycleINTEarned: 0,
        unspentINT: 0,
        spentINT: 0,
        cycleEligibleCredits: 0,
        prestigeEntitlementClaimed: 0,
        runCreditsEarned: 0,
        exactEconomy: exact,
        credits: 0,
        data: 0,
        qualityLevel: 0,
        efficiencyLevel: 0,
        integrationLevel: 0,
        level: 0,
        training: 0,
        activeTraining: null,
        classUpgrades: [],
        runMilestoneEdges: [],
        runMilestoneClasses: [],
        runTrainingStarted: 0,
        runTrainingCompleted: 0,
        runResearchCompleted: 0,
        runStartedAt: s.savedAt,
        overclock: base.overclock,
        progression: {
          ...s.progression,
          entitlement: { m: 0, e: 0 },
          legacyCycle: {},
          legacyAutobuyers: s.progression.legacyAutobuyers,
          combo: 0,
          lastTap: null,
          resetIntent: null,
          lastPrestige: { m: 0, e: 0 },
          axiomCycleStartedAt: s.savedAt,
          trainingRecords: { ...s.progression.cycleLevelRecords },
          cycleLevelRecords: { quality: 0, efficiency: 0, integration: 0 },
          tutorial: s.progression.tutorial === "lab" ? "lab" : "axiom",
        },
      }),
    );
  const measured = closeBalanceRun(state, reset, "axiom", newINTScientific(state).toJSON(), gain.toJSON());
  return addEvent({...measured,telemetry:{...measured.telemetry,runStartedAt:s.savedAt}},
    "axiom-reset",
    s.savedAt,
    { gain: gain.toScientificString(), cycleINT: s.cycleINTEarned },
  );
}
export function progressionAgent(s: GameState) {
  s = rebuildKnown(s);
  const p = s.progression;
  const meta =
    p.axiomAuto &&
    axiomLevel(s, "B06") > 0 &&
    s.savedAt - p.axiomCycleStartedAt >=
      BALANCE.progression.formula.autoAxiomMinSeconds * 1000 &&
    axiomRewardV2(s).compare(ScientificNumber.fromJSON(p.axiomMinimum)) >= 0;
  const min = ScientificNumber.fromJSON(s.prestigeAgent.minimumReward),
    reward = newINTScientific(s),
    relative =
      p.relative && ScientificNumber.fromJSON(p.lastPrestige).compare(S(0)) > 0
        ? ScientificNumber.fromJSON(p.lastPrestige).multiplyNumber(p.relative)
        : min,
    timeout =
      p.maximumRunSeconds !== null &&
      s.savedAt - s.runStartedAt >= p.maximumRunSeconds * 1000;
  const ordinary =
    hasProgressionNode(s, "I06") &&
    s.prestigeAgent.enabled &&
    s.savedAt - s.runStartedAt >= s.prestigeAgent.minimumRunMinutes * 60000 &&
    reward.compare(min) >= 0 &&
    (timeout || reward.compare(relative) >= 0);
  if (!meta && !ordinary && !p.resetIntent) return s;
  let intent = p.resetIntent;
  if (!intent)
    intent = {
      kind: meta ? "axiom" : "prestige",
      training: !!s.activeTraining && (s.prestigeAgent.waitForTraining ?? true),
      research: s.prestigeAgent.waitForResearch
        ? s.researchLabs.filter(Boolean).map((j) => j!.jobId ?? j!.id)
        : [],
      crafting: s.prestigeAgent.waitForCrafting
        ? [
            s.crafting.active?.id,
            ...s.foundries.map((f) => f.active?.id),
            s.progression.fusion?.id,
          ].filter((id): id is string => !!id)
        : [],
      analysis: s.prestigeAgent.waitForAnalysis
        ? (s.experiments.active?.id ?? s.progression.synthesis?.id ?? null)
        : null,
    };
  const waiting =
    (intent.training && !!s.activeTraining) ||
    s.researchLabs.some(
      (j) => j && intent!.research.includes(j.jobId ?? j.id),
    ) ||
    (intent.analysis !== null &&
      (s.experiments.active?.id === intent.analysis ||
        s.progression.synthesis?.id === intent.analysis)) ||
    intent.crafting.some(
      (id) =>
        s.crafting.active?.id === id ||
        s.foundries.some((f) => f.active?.id === id) ||
        s.progression.fusion?.id === id,
    );
  const next = { ...s, progression: { ...p, resetIntent: intent } };
  return waiting
    ? next
    : intent.kind === "axiom"
      ? axiomResetV2(next)
      : normalResetV2(next);
}
