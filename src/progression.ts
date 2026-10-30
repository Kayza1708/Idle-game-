import {prestigeHardwareFirstV3,prestigeHardwareSecondV3,prestigeCreditHardwareV3,prestigeINTWeightV3,prestigeGainExponentV3,prestigeCreditFactorV3,progressionEffectsV3,discoverAxiomsV3,prestigeResearchActivityV3,prestigeResearchDataV3} from './prestigeV3';
import {usesItemV3,itemOverdriveStartV3,itemBurstFactorV3,itemV3Equipped,itemRelayBonusV3,itemDataFactorV3,itemTrainingStrengthV3,itemWorkFactorV3,itemKnowledgeFactorV3} from './itemSystemV3';
import { deviceBonus } from "./deviceEffects";
import {
  BALANCE,
  achievementSynergyScientific,
  artifactSynergyScientific,
  breakthroughSynergyScientific,
  quality,
  efficiency,
  equipmentSlots,
  equipmentSlotCount,
  equippedItems,
  specialItemEffectQuote,
  exactEconomyValue,
  axiomEconomyValue,
  equippedBonus,
  hardwareIds,
  milestoneBonus,
  itemCombinationBonus,
  itemCombinationQuote,
  usersRateScientific,
  computeRateScientific,
  creditRateScientific,
  addCreditsScientific,
  grantComponents,
  buyHardwareClass,
  scientificCeil,
  type GameState,
  type ItemSlot,
  type HardwareId,
  type TrainingTrack,
} from "./economy";
import { ScientificNumber, type ScientificJSON } from "./scientificNumber";
import { challengeFamilyBonus } from "./challengeStages";
import { addEvent, addMetrics } from "./telemetry";
export type PrestigeNodeV2 = keyof typeof BALANCE.progression.nodes;
export type AxiomNodeV2 = keyof typeof BALANCE.progression.axioms;
export type ModelId = keyof typeof BALANCE.progression.models;
export type ProgressionState = {
  version: 2;
  cycleLevelRecords: Record<TrainingTrack, number>;
  passiveRemainders: Partial<Record<import("./economy").ComponentId, number>>;
  modelPlan: Record<"reset" | "research" | "material", ModelId | null>;
  fusion: null | {
    id: string;
    inputs: import("./economy").Item[];
    done: number;
    required: number;
  };
  fusionPlanner: {
    enabled: boolean;
    types: import("./economy").ItemTypeId[];
    target: import("./economy").Rarity;
  };
  work: Record<string, import("./progressionWork").WorkContract>;
  critRng: number;
  materialRng: number;
  migrated: boolean;
  known: string[];
  licenses: string[];
  legacyAutobuyers: HardwareId[];
  permanentSlots: string[];
  entitlement: ScientificJSON;
  bestINT: ScientificJSON;
  knowledge: ScientificJSON;
  lab: boolean;
  labSeed: boolean;
  starterGift: boolean;
  models: Partial<Record<ModelId, number>>;
  active: ModelId | null;
  rng: number;
  combo: number;
  lastTap: number | null;
  axiomCycleStartedAt: number;
  resetIntent: null | {
    kind: "prestige" | "axiom";
    training: boolean;
    research: string[];
    crafting: string[];
    analysis: string | null;
  };
  trainingTargets: Record<TrainingTrack, number>;
  trainingAuto: boolean;
  axiomAuto: boolean;
  axiomMinimum: ScientificJSON;
  rebuild: PrestigeNodeV2[];
  lastPrestige: ScientificJSON;
  relative: 2 | 5 | 10 | null;
  maximumRunSeconds: number | null;
  trainingRecords: Record<TrainingTrack, number>;
  reserves: {
    credits: ScientificJSON;
    data: ScientificJSON;
    int: ScientificJSON;
  };
  synthesis: null | {
    id: string;
    component: string;
    work: number;
    required: number;
  };
  tutorial: "lab" | "axiom" | null;
  legacyNodes: string[];
  legacyCycle: Record<string, ScientificJSON>;
  legacyPermanent: Record<string, ScientificJSON>;
};
export function newProgression(
  now: number,
  campaignId = "unassigned",
): ProgressionState {
  let seed = Math.trunc(now) >>> 0;
  for (const c of campaignId)
    seed = (Math.imul(seed, 31) + c.charCodeAt(0)) >>> 0;
  return {
    version: 2,
    cycleLevelRecords: { quality: 0, efficiency: 0, integration: 0 },
    passiveRemainders: {},
    modelPlan: { reset: null, research: null, material: null },
    fusion: null,
    fusionPlanner: { enabled: false, types: [], target: "rare" },
    work: {},
    critRng: 991,
    materialRng: 7129,
    migrated: false,
    known: [],
    licenses: [],
    legacyAutobuyers: [],
    permanentSlots: [],
    entitlement: { m: 0, e: 0 },
    bestINT: { m: 0, e: 0 },
    knowledge: { m: 0, e: 0 },
    lab: false,
    labSeed: false,
    starterGift: false,
    models: {},
    active: null,
    rng: seed || 1708,
    combo: 0,
    lastTap: null,
    axiomCycleStartedAt: now,
    resetIntent: null,
    trainingTargets: { quality: 0, efficiency: 0, integration: 0 },
    trainingAuto: false,
    axiomAuto: false,
    axiomMinimum: { m: 1, e: 0 },
    rebuild: [],
    lastPrestige: { m: 0, e: 0 },
    relative: null,
    maximumRunSeconds: null,
    trainingRecords: { quality: 0, efficiency: 0, integration: 0 },
    reserves: {
      credits: { m: 0, e: 0 },
      data: { m: 0, e: 0 },
      int: { m: 0, e: 0 },
    },
    synthesis: null,
    tutorial: null,
    legacyNodes: [],
    legacyCycle: {},
    legacyPermanent: {},
  };
}
export function knownPurchaseCount(s: GameState) {
  const map = BALANCE.progression.legacyMap as Record<string, string>;
  return new Set(s.progression.known.map((id) => map[id] ?? id)).size;
}
export function knownProgressionNodes(s: GameState): PrestigeNodeV2[] {
  const map = BALANCE.progression.legacyMap as Record<string, string>;
  return [
    ...new Set(
      s.progression.known
        .map((id) => map[id] ?? id)
        .filter((id) => Object.hasOwn(BALANCE.progression.nodes, id)),
    ),
  ] as PrestigeNodeV2[];
}
export const hasProgressionNode = (s: GameState, id: string): boolean =>
  (id === "F02" && s.challengeUnlocks.includes("research-queue")) ||
  (id === "T03" && s.challengeUnlocks.includes("training-queue")) ||
  (id === "F03" && s.challengeUnlocks.includes("research-repeat")) ||
  (id === "I06" && s.challengeUnlocks.includes("prestige-agent")) ||
  s.nodes.includes(id) ||
  s.progression?.licenses.includes(id) === true ||
  (id === "T04" && s.nodes.includes("T10")) ||
  (id === "I06" &&
    (s.nodes.includes("I07") ||
      axiomLevel(s, "B04") > 0 ||
      axiomLevel(s, "B06") > 0));
export const axiomLevel = (s: GameState, id: string): number =>
  Math.max(
    (s.axiomUpgradeLevels as Record<string, number>)[id] ?? 0,
    (id === "C02" && s.challengeUnlocks.includes("analysis-planner")) ||
      (id === "C03" && s.challengeUnlocks.includes("crafting-planner"))
      ? 1
      : 0,
  );
export const modelLevel = (s: GameState) =>
  s.progression.active ? (s.progression.models[s.progression.active] ?? 0) : 0;
export const secondary = (s: GameState, id: ModelId) =>
  s.progression.active === id && axiomLevel(s, "D06") > 0;
export const modelFactor = (s: GameState, kind: string): number => {
  const p = s.progression;
  if (!p?.active) return 1;
  const m = BALANCE.progression.models[p.active];
  return m.kind === kind
    ? 1 +
        (m.base - 1) *
          (1 + BALANCE.progression.modelPrimaryLevel * modelLevel(s))
    : 1;
};
export const integrationLevel = (s: GameState) =>
  s.progression?.trainingRecords
    ? ((s as GameState & { integrationLevel?: number }).integrationLevel ?? 0)
    : 0;
export const integrationBase = (s: GameState) =>
  usesItemV3(s)?(hasProgressionNode(s,"T10")?BALANCE.prestigeV3.training.integrationPerfect:BALANCE.prestigeV3.training.integrationBase):hasProgressionNode(s, "T10")
    ? BALANCE.progression.integrationPerfect
    : BALANCE.progression.integrationBase;
export const integrationLimit = (s: GameState) =>
  (usesItemV3(s)?BALANCE.prestigeV3.training.integrationLimit:BALANCE.progression.integrationLimit) + 25 * axiomLevel(s, "A05");
export function modelCore(s: GameState) {
  if (!s.progression.active) return 1;
  const coupling = axiomLevel(s, "D05")
    ? Math.min(
        formula().modelCouplingCap,
        1 +
          formula().modelCouplingScale *
            (integrationBase(s) ** integrationLevel(s) - 1),
      )
    : 1;
  return (
    1 +
    (BALANCE.progression.modelCore *
      (1 + BALANCE.progression.modelCoreLevel * modelLevel(s)) -
      1) *
      (usesItemV3(s)?BALANCE.prestigeV3.axioms.A06:formula().modelAxiomCore) ** axiomLevel(s, "A06") *
      (usesItemV3(s)?BALANCE.prestigeV3.axioms.D03:formula().modelDevelopmentCore) ** axiomLevel(s, "D03") *
      coupling * (1 + deviceBonus(s,"modelEcho"))
  );
}
export function legacyItemFactorScientific(s: GameState, e: string) {
  return s.progression?.version === 2
    ? ScientificNumber.fromJSON(s.progression.legacyCycle["item:" + e] ?? { m: 1, e: 0 })
        .multiply(ScientificNumber.fromJSON(s.progression.legacyPermanent["item:" + e] ?? { m: 1, e: 0 }))
    : ScientificNumber.from(1);
}
export function legacyItemFactor(s: GameState, e: string) {
  return legacyItemFactorScientific(s, e).toNumber();
}
export function itemAmplifier(s: GameState) {
  if (s.retention.activeRun?.id === "no-items") return 1;
  const ki =
    s.progression.active === "K10"
      ? formula().modelItemBase + formula().modelItemLevel * modelLevel(s)
      : modelFactor(s, "items");
  return (
    integrationBase(s) ** integrationLevel(s) *
    (hasProgressionNode(s, "W05") ? (usesItemV3(s)?BALANCE.prestigeV3.items.W05:effectsFor(s).W05) : 1) *
    (hasProgressionNode(s, "W09") ? (usesItemV3(s)?BALANCE.prestigeV3.items.W09:effectsFor(s).W09) : 1) *
    (hasProgressionNode(s, "W10") ? (usesItemV3(s)?BALANCE.prestigeV3.items.W10:effectsFor(s).W10) : 1) *
    effectsFor(s).A05item ** axiomLevel(s, "A05") *
    (usesItemV3(s)?BALANCE.prestigeV3.axioms.B03:effectsFor(s).B03) ** axiomLevel(s, "B03") *
    ki
  );
}
export function activeSlotIds(s: GameState): ItemSlot[] {
  if (s.progression?.version !== 2)
    return equipmentSlots.slice(0, equipmentSlotCount(s));
  const ids: ItemSlot[] = ["processor", "core", "research"];
  for (const [node, slot] of [
    ["W01", "processorAux"],
    ["W02", "coreAux"],
    ["W06", "researchAux"],
  ] as const)
    if (
      hasProgressionNode(s, node) ||
      s.progression.permanentSlots.includes(slot)
    )
      ids.push(slot);
  if (s.progression.active === "K10") {
    ids.push("universal1");
    if (modelLevel(s) >= formula().modelSlotsLevel) ids.push("universal2");
  }
  return ids;
}
const formula = () => BALANCE.progression.formula;
const effectsFor = progressionEffectsV3;
const research = () => BALANCE.progression.researchEffects;
const S = (n: number) => ScientificNumber.from(n);
const power = (b: number, l: number) => S(b).pow(l);
const owned = (s: GameState) =>
  hardwareIds.filter((id) => s.hardwareCounts[id] > 0).length;
const legacy = (s: GameState, key: string) =>
  ScientificNumber.fromJSON(
    s.progression.legacyCycle[key] ?? { m: 1, e: 0 },
  ).multiply(
    ScientificNumber.fromJSON(
      s.progression.legacyPermanent[key] ?? { m: 1, e: 0 },
    ),
  );
export function progressionComputeFactors(s: GameState) {
  const n = s.researchLevels,
    k = owned(s);
  return {
    deviceCompute:
      1 +
      deviceBonus(s, "sparse") +
      deviceBonus(s, "photonicCompute") +
      deviceBonus(s, "pairs") + deviceBonus(s,"knowledgeCompute"),
    itemCombination: itemCombinationQuote(s, "parallel-architecture")
      .contribution,
    itemAndMilestoneAdditive:
      1 +
      equippedBonus(s, "compute") +
      milestoneBonus(s, "compute") +
      milestoneBonus(s, "synergy"),
    prestigePerClass:usesItemV3(s)?prestigeHardwareFirstV3(s):
      (hasProgressionNode(s, "H06") ? effectsFor(s).H06 : 1) *
      (hasProgressionNode(s, "H07")
        ? Math.min(
            effectsFor(s).H07cap,
            1 +
              effectsFor(s).H07per *
                hardwareIds.reduce(
                  (v, id) => v + Math.sqrt(s.hardwareCounts[id]),
                  0,
                ),
          )
        : 1),
    deepPrestige:usesItemV3(s)?prestigeHardwareSecondV3(s):
      (hasProgressionNode(s, "H09")
        ? effectsFor(s).H09 *
          (1 +
            Math.min(
              effectsFor(s).H09cap,
              effectsFor(s).H09per *
                hardwareIds.filter(
                  (id) => s.hardwareCounts[id] >= effectsFor(s).H09count,
                ).length,
            ))
        : 1) * (hasProgressionNode(s, "H10") ? effectsFor(s).H10 : 1),
    computeOptimization: power(
      research().computeOptimization,
      n.computeOptimization,
    ),
    hardwareIntegration: power(
      1 + research().hardwareIntegration * k,
      n.hardwareIntegration,
    ),
    parallelArchitecture: power(
      1 + research().parallelArchitecture * k,
      n.parallelArchitecture,
    ),
    hardwareCoDesign: power(
      1 +
        research().hardwareCoDesign *
          Math.min(
            research().hardwareCoDesignCap,
            s.qualityLevel + s.efficiencyLevel,
          ),
      n.hardwareCoDesign,
    ),
    milestoneSynergy: 1,
    legacyInfrastructure: legacy(s, "compute"),
    hardwareOwnership: S(1 + challengeFamilyBonus(s, "no-items")),
    infrastructure: axiomEconomyValue(s, "total")
      .add(S(1))
      .pow(effectsFor(s).A03 * axiomLevel(s, "A03")).multiply(usesItemV3(s)?power(BALANCE.prestigeV3.axioms.A03,axiomLevel(s,"A03")):S(1)),
    model: S(modelFactor(s, "compute")),
  };
}
export function progressionUserFactors(s: GameState) {
  const l = s.efficiencyLevel,
    x = trainingStrength(l,s),
    eff =
      1 +
      (formula().efficiencyBase ** x - 1) *
        (1 + challengeFamilyBonus(s, "efficiency-lock"));
  return {
    efficiencyPerCompute:
      eff ** (hasProgressionNode(s, "T02") ? (usesItemV3(s)?BALANCE.prestigeV3.training.T02:effectsFor(s).T02) : 1) /
      BALANCE.computePerUser,
    milestoneUsers: 1 + milestoneBonus(s, "users"),
    userScaling: power(research().userScaling, s.researchLevels.userScaling),
    infrastructure: S(modelFactor(s, "users")),
    milestoneSynergy: 1,
  };
}
export function progressionCreditFactors(
  s: GameState,
  now: number,
  temporary: boolean,
) {
  const n = s.researchLevels,
    q =
      1 +
      (formula().qualityBase ** trainingStrength(s.qualityLevel,s) - 1) *
        (1 + challengeFamilyBonus(s, "quality-lock"));
  const ma = axiomEconomyValue(s, "total")
    .add(S(1))
    .pow(
      formula().axiomCreditExponent +
        formula().axiomCreditLevelExponent *
          Math.min(formula().axiomCreditBoundedLevels, axiomLevel(s, "A02")),
    )
    .multiply(
      power(
        formula().axiomCreditTail,
        Math.max(0, axiomLevel(s, "A02") - formula().axiomCreditBoundedLevels),
      ),
    );
  const a =
    formula().intCreditExponent +
    (hasProgressionNode(s, "I05") ? formula().intCreditNodeExponent : 0) +
    (hasProgressionNode(s, "I10") ? formula().intCreditNodeExponent : 0);
  return {
    permanentIncome: s.commerce?.owned.includes('ai_singularity.pass.income') ? BALANCE.commerce.incomeMultiplier : 1,
    baseRevenuePerUser: BALANCE.baseRevenuePerUser,
    quality: q ** (hasProgressionNode(s, "T01") ? (usesItemV3(s)?BALANCE.prestigeV3.training.T01:effectsFor(s).T01) : 1),
    INT: usesItemV3(s)?prestigeCreditFactorV3(s):exactEconomyValue(s, "cycleINTEarned").add(S(1)).pow(a),
    axioms: ma,
    modelArchitecture: power(research().modelArchitecture, n.modelArchitecture),
    commercialization: power(research().commercialization, n.commercialization),
    networkEffects: S(
      1 +
        research().networkEffects *
          n.networkEffects *
          Math.max(0, usersRateScientific(s).add(S(1)).log10()),
    ),
    milestoneRevenue: 1,
    items: S(
      1 + equippedBonus(s, "credits") + itemCombinationBonus(s, "credits"),
    ),
    hardwareOwnership:usesItemV3(s)?prestigeCreditHardwareV3(s):
      (hasProgressionNode(s, "H08") ? 1 + effectsFor(s).H08 * owned(s) : 1) *
      (hasProgressionNode(s, "T07")
        ? 1 +
          effectsFor(s).T07per *
            Math.min(
              effectsFor(s).T07cap,
              s.qualityLevel + s.efficiencyLevel + integrationLevel(s),
            )
        : 1),
    infrastructure: S(
      (hasProgressionNode(s, "T09") ? effectsFor(s).T09 : 1) *
        (hasProgressionNode(s, "I01") ? effectsFor(s).I01 : 1),
    ),
    lifetimeData: S(1),
    model: S(modelCore(s) * modelFactor(s, "revenue")),
    achievements: achievementSynergyScientific(s),
    artifacts: artifactSynergyScientific(s),
    breakthroughs: breakthroughSynergyScientific(s).multiply(
      legacy(s, "credits"),
    ),
    devicePassive:
      1 + deviceBonus(s, "memory") * (1 + challengeFamilyBonus(s, "no-taps")),
    temporary: temporary
      ? (s.creditBoostUntil > now ? 2 : 1) *
        (s.overclock.activeUntil > now ? overdriveFactor(s) : 1) * itemBurstFactorV3(s,'credits',now)
      : 1,
  };
}
export function progressionDataRate(s: GameState) {
  const n = s.researchLevels;
  return usersRateScientific(s)
    .pow(formula().dataPower)
    .multiplyNumber(
      formula().dataScale *
        (1 + equippedBonus(s, "data") + milestoneBonus(s, "data")) *
        modelFactor(s, "data") *
        (secondary(s, "K02") ? effectsFor(s).D06data : 1) *
        (secondary(s, "K07") ? effectsFor(s).D06data : 1) *
        (hasProgressionNode(s, "F09") ? effectsFor(s).F09data : 1) *
        (hasProgressionNode(s, "F10") ? effectsFor(s).F10data : 1),
    )
    .multiply(power(research().dataGeneration, n.dataGeneration))
    .multiply(
      power(
        1 +
          research().syntheticData *
            Math.min(
              research().syntheticDataCap,
              s.qualityLevel + s.efficiencyLevel,
            ),
        n.syntheticData,
      ),
    )
    .multiply(power(research().dataFlywheel, n.dataFlywheel))
    .multiply(legacy(s, "data"))
    .multiplyNumber(
      s.retention.activeRun?.id === "data-crunch"
        ? BALANCE.challengeCatalog.dataFactors[
            challengeChapterIndex(s.retention.activeRun.stage ?? 1)
          ]
        : 1,
    ).multiply(usesItemV3(s)?itemDataFactorV3(s):S(1)).multiply(prestigeResearchDataV3(s));
}
export const trainingStrength = (n: number,s?:GameState) =>
  s&&usesItemV3(s)?itemTrainingStrengthV3(s,n):n <= formula().trainingSoftStart
    ? n
    : formula().trainingSoftStart +
      formula().trainingSoftScale *
        Math.log1p(
          (n - formula().trainingSoftStart) / formula().trainingSoftScale,
        );
export const computeLog = (s: GameState) =>
  1 +
  formula().computeLogScale *
    Math.max(0, computeRateScientific(s.hardware, s).add(S(1)).log10());
export function progressionTrainingRate(s: GameState) {
  const track = s.activeTraining?.track ?? "quality",
    level =
      track === "quality"
        ? s.qualityLevel
        : track === "efficiency"
          ? s.efficiencyLevel
          : integrationLevel(s);
  const rebuild =
    level < s.progression.trainingRecords[track]
      ? effectsFor(s).B05 ** axiomLevel(s, "B05")
      : 1;
  return (
    itemWorkFactorV3(s,false) * (1 + deviceBonus(s,"modelTraining")) *
    computeLog(s) *
    (1 + equippedBonus(s, "training") + milestoneBonus(s, "training")) *
    (1 + itemCombinationQuote(s, "learning-pipeline").contribution) *
    (s.trainingBoostUntil > s.savedAt ? 2 : 1) *
    (1 + research().recursiveLearning * s.researchLevels.recursiveLearning) *
    modelFactor(s, "training") *
    Math.sqrt(modelFactor(s, "compute")) *
    (hasProgressionNode(s, "T05") ? effectsFor(s).T05 : 1) *
    (hasProgressionNode(s, "T09") ? effectsFor(s).T09training : 1) *
    (s.completedResearch.includes("alignment") ? 1 / research().alignment : 1) *
    (s.activeTraining?.modelTransferEligible === true
      ? research().modelTransfer
      : 1) *
    (track === "integration" && secondary(s, "K08") ? effectsFor(s).D06data : 1) *
    rebuild *
    legacy(s, "training").toNumber()
  );
}
export function progressionResearchSpeed(s: GameState) {
  return (
    itemWorkFactorV3(s,true) * prestigeResearchActivityV3(s) * (1 + deviceBonus(s,"cycleResearch")) *
    computeLog(s) *
    (1 + equippedBonus(s, "research") + milestoneBonus(s, "research")) *
    (1 + itemCombinationBonus(s, "research")) *
    (1 + research().autonomousScience * s.researchLevels.autonomousScience) *
    modelFactor(s, "research") *
    Math.sqrt(modelFactor(s, "compute")) *
    (hasProgressionNode(s, "F06") ? effectsFor(s).F06 : 1) *
    (hasProgressionNode(s, "F09") ? effectsFor(s).F09 : 1) *
    (hasProgressionNode(s, "F10") ? effectsFor(s).F10 : 1) *
    (secondary(s, "K03") ? effectsFor(s).D06speed : 1) *
    (secondary(s, "K06") ? effectsFor(s).D06speed : 1) *
    (s.completedResearch.includes("researchScheduling")
      ? research().researchScheduling
      : 1) *
    (1 + challengeFamilyBonus(s, "serial-science")) *
    legacy(s, "research").toNumber()
  );
}
export function progressionINTRate(s: GameState) {
  if(usesItemV3(s))return prestigeINTWeightV3(s).toNumber();
  return (
    (1 +
      (hasProgressionNode(s, "I02")
        ? Math.min(
            effectsFor(s).I02cap,
            effectsFor(s).I02per * s.runMilestoneEdges.length,
          )
        : 0) +
      (hasProgressionNode(s, "I03")
        ? effectsFor(s).I03per *
          Math.min(
            effectsFor(s).I03cap,
            s.qualityLevel + s.efficiencyLevel + integrationLevel(s),
          )
        : 0) +
      (hasProgressionNode(s, "I04")
        ? effectsFor(s).I04per *
          Math.min(
            effectsFor(s).I04cap,
            Object.values(s.researchLevels).reduce((a, b) => a + b, 0) +
              s.completedResearch.length,
          )
        : 0) +
      Math.min(
        effectsFor(s).archiveINTcap,
        equippedItems(s).reduce(
          (sum, i) =>
            sum +
            (i.type === "insight-archive"
              ? effectsFor(s).archiveINT *
                (specialItemEffectQuote(s, i)?.scale ?? 0) *
                itemAmplifier(s)
              : 0),
          0,
        ),
      )) *
    (hasProgressionNode(s, "I09") ? effectsFor(s).I09 : 1)
  );
}
export const intExponent = (s: GameState) =>
  usesItemV3(s)?prestigeGainExponentV3(s):formula().intBaseExponent +
  formula().intAxiomExponent * axiomLevel(s, "A01") +
  (hasProgressionNode(s, "I10") ? formula().intNodeExponent : 0);
export function recordINTIncome(
  before: GameState,
  after: GameState,
  delta: ScientificNumber,
) {
  const r = exactEconomyValue(before, "cycleEligibleCredits"),
    p = intExponent(before);
  let increment: ScientificNumber;
  if (r.isZero())
    increment = delta.divideNumber(BALANCE.prestigeBaseRevenue).pow(p);
  else {
    const ratio = delta.divide(r);
    const relative =
      ratio.log10() < -6
        ? ratio.multiplyNumber(p)
        : ratio.log10() > 6
          ? ratio.add(S(1)).pow(p).subtract(S(1))
          : S(Math.expm1(p * Math.log1p(ratio.toNumber())));
    increment = r
      .divideNumber(BALANCE.prestigeBaseRevenue)
      .pow(p)
      .multiply(relative);
  }
  return {
    ...after,
    progression: {
      ...after.progression,
      entitlement: ScientificNumber.fromJSON(before.progression.entitlement)
        .add(increment.multiply(usesItemV3(before)?prestigeINTWeightV3(before):S(progressionINTRate(before))))
        .toJSON(),
    },
  };
}
export const floorScientific = (v: ScientificNumber) =>
  v.exponent < 15 ? S(Math.floor(v.toNumber() + 1e-11)) : v.floor();
export const progressionINTClaim = (s: GameState) =>
  floorScientific(ScientificNumber.fromJSON(s.progression.entitlement));
export function discoverProgression(s: GameState) {
  let p = { ...s.progression };
  const cycle = exactEconomyValue(s, "cycleINTEarned");
  p.cycleLevelRecords = {
    quality: Math.max(p.cycleLevelRecords.quality, s.qualityLevel),
    efficiency: Math.max(p.cycleLevelRecords.efficiency, s.efficiencyLevel),
    integration: Math.max(p.cycleLevelRecords.integration, s.integrationLevel),
  };
  if (cycle.compare(ScientificNumber.fromJSON(p.bestINT)) > 0)
    p.bestINT = cycle.toJSON();
  if (
    !p.lab &&
    exactEconomyValue(s, "totalINTEarned").compare(
      S(BALANCE.progression.labThreshold),
    ) >= 0
  ) {
    p.lab = true;
    p.tutorial = "lab";
  }
  if (p.lab && !p.labSeed) {
    p.knowledge = ScientificNumber.fromJSON(p.knowledge)
      .add(S(BALANCE.progression.labSeed))
      .toJSON();
    p.labSeed = true;
  }
  let next = { ...s, progression: p };
  if (
    !p.starterGift &&
    (s.hardware > 0 || s.inventory.length || s.components > 0)
  ) {
    const first = Object.entries(BALANCE.progression.starters).slice(0, 3),
      need: Record<string, number> = {};
    for (const [id, r] of first)
      if (
        !s.inventory.some((i) => i.type === id) &&
        !s.craftedItemTypes.includes(id as never) &&
        ![s.crafting.active, ...s.crafting.queue].some(
          (j) => j?.kind === "item" && j.recipeId === id,
        )
      )
        for (const [mat, n] of Object.entries(r.ingredients))
          need[mat] = (need[mat] ?? 0) + n;
    const gift = Object.fromEntries(
      Object.entries(need).map(([mat, n]) => [
        mat,
        Math.max(
          0,
          n -
            (s.componentInventory[mat as keyof typeof s.componentInventory] ??
              0),
        ),
      ]),
    );
    next = grantComponents(
      {
        ...next,
        learnedRecipes: [
          ...new Set([
            ...(s.learnedRecipes ?? []),
            ...first.map(([id]) => id as keyof typeof BALANCE.itemRecipes),
          ]),
        ],
        progression: { ...p, starterGift: true },
      },
      gift,
    );
  }
  return usesItemV3(next)?discoverAxiomsV3(next):next;
}
export function knowledgeRate(s: GameState) {
  if (!s.progression.lab || s.retention.activeRun)
    return ScientificNumber.zero();
  const i = exactEconomyValue(s, "cycleINTEarned"),
    floor = ScientificNumber.fromJSON(s.progression.bestINT).multiplyNumber(
      BALANCE.progression.knowledgeFloor,
    );
  return (i.compare(floor) > 0 ? i : floor)
    .sqrt()
    .multiplyNumber(
      BALANCE.progression.knowledgeRate * (1 + deviceBonus(s,"insight")) *
        (hasProgressionNode(s, "I08") ? effectsFor(s).I08 : 1),
    )
    .multiply(
      axiomEconomyValue(s, "total")
        .add(S(1))
        .pow(formula().knowledgeAxiomPower * axiomLevel(s, "D01")),
    ).multiply(itemKnowledgeFactorV3(s)).multiply(usesItemV3(s)?power(BALANCE.prestigeV3.axioms.D01,axiomLevel(s,"D01")):S(1));
}
export const nextModelCost = (s: GameState) =>
  scientificCeil(
    S(BALANCE.progression.modelPriceBase).multiply(
      power(
        BALANCE.progression.modelPriceGrowth,
        Object.keys(s.progression.models).length,
      ),
    ),
  );
export const nextModelUpgradeCost = (s: GameState, id: ModelId) =>
  scientificCeil(
    S(BALANCE.progression.modelUpgradeBase)
      .multiply(
        power(
          BALANCE.progression.modelUpgradeGrowth,
          s.progression.models[id] ?? 0,
        ),
      )
      .multiply(power((usesItemV3(s)?BALANCE.prestigeV3.axioms.D02:BALANCE.progression.modelDiscount), axiomLevel(s, "D02"))),
  );
export function developModel(s: GameState) {
  const p = s.progression,
    cost = nextModelCost(s),
    pool = (Object.keys(BALANCE.progression.models) as ModelId[]).filter(
      (id) => p.models[id] === undefined,
    );
  if (
    s.retention.activeRun ||
    !p.lab ||
    !pool.length ||
    ScientificNumber.fromJSON(p.knowledge).compare(cost) < 0
  )
    return s;
  const rng = (Math.imul(p.rng, 1664525) + 1013904223) >>> 0,
    id = pool[Math.floor((rng / 4294967296) * pool.length)];
  return addEvent(
    {
      ...s,
      progression: {
        ...p,
        rng,
        knowledge: ScientificNumber.fromJSON(p.knowledge)
          .subtract(cost)
          .toJSON(),
        models: { ...p.models, [id]: 0 },
        active: p.active ?? id,
      },
    },
    "ki-develop",
    s.savedAt,
    { id, cost: cost.toScientificString(), resource: "knowledge" },
  );
}
export function upgradeModel(s: GameState, id: ModelId) {
  const p = s.progression,
    l = p.models[id],
    cost = nextModelUpgradeCost(s, id);
  if (
    s.retention.activeRun ||
    l === undefined ||
    l >=
      BALANCE.progression.modelBaseLimit +
        formula().modelLimitStep * axiomLevel(s, "D03") ||
    ScientificNumber.fromJSON(p.knowledge).compare(cost) < 0
  )
    return s;
  return addEvent(
    {
      ...s,
      progression: {
        ...p,
        knowledge: ScientificNumber.fromJSON(p.knowledge)
          .subtract(cost)
          .toJSON(),
        models: { ...p.models, [id]: l + 1 },
      },
    },
    "ki-upgrade",
    s.savedAt,
    {
      id,
      level: l + 1,
      cost: cost.toScientificString(),
      resource: "knowledge",
    },
  );
}
export function selectModel(s: GameState, id: ModelId | null) {
  if (
    s.retention.activeRun ||
    id === s.progression.active ||
    (id !== null && s.progression.models[id] === undefined)
  )
    return s;
  const next = { ...s, progression: { ...s.progression, active: id } },
    allowed = activeSlotIds(next);
  return addEvent(
    {
      ...next,
      equipped: Object.fromEntries(
        Object.entries(s.equipped).filter(([slot]) =>
          allowed.includes(slot as ItemSlot),
        ),
      ),
    },
    "ki-select",
    s.savedAt,
    { id: id ?? "none" },
  );
}
export const overdriveFactor = (s: GameState) =>
  formula().overdriveFactor *
  (hasProgressionNode(s, "S04") ? effectsFor(s).S04 : 1) *
  (hasProgressionNode(s, "S09") ? effectsFor(s).S09 : 1) *
  (secondary(s, "K01") ? effectsFor(s).D06overdrive : 1) *
  (1 + deviceBonus(s, "burst"));
export function tapQuote(s: GameState, now = s.savedAt, proc = 0) {
  const p = s.progression,
    combo =
      p.lastTap !== null && now - p.lastTap <= BALANCE.progression.comboIdle
        ? p.combo
        : 0;
  const c = Math.min(
      formula().critCap,
      BALANCE.progression.tapCrit +
        (hasProgressionNode(s, "S02") ? effectsFor(s).S02 : 0) +
        (hasProgressionNode(s, "S05") ? effectsFor(s).S05 : 0) +
        (secondary(s, "K04") ? effectsFor(s).D06crit : 0),
    ),
    m =
      (BALANCE.progression.tapCritBase +
        (hasProgressionNode(s, "S03") ? effectsFor(s).S03 : 0) +
        (hasProgressionNode(s, "S06") ? effectsFor(s).S06 : 0)) *
      effectsFor(s).A04 ** axiomLevel(s, "A04"),
    x = Math.max(
      1,
      (1 + equippedBonus(s, "tap")) *
        research().tapAmplification ** s.researchLevels.tapAmplification *
        (hasProgressionNode(s, "S01") ? effectsFor(s).S01 : 1) *
        (hasProgressionNode(s, "S08") ? effectsFor(s).S08 : 1),
    ),
    q =
      BALANCE.progression.tapBase *
        (1 + Math.log(x)) *
        (hasProgressionNode(s, "S10") ? effectsFor(s).S10 : 1) *
        modelFactor(s, "tap") *
        (1 + BALANCE.progression.tapCombo * combo) +
      proc,
    seconds =
      (BALANCE.progression.tapSoft * q) /
      (BALANCE.progression.tapSoft + q * (1 + c * (m - 1)));
  return { chance: c, crit: m, seconds, combo };
}
function overdriveBaseDuration(s:GameState){return Math.min(
      BALANCE.progression.overdriveMaxSeconds,
      BALANCE.progression.overdriveSeconds *
        (hasProgressionNode(s, "S07") ? effectsFor(s).S07 : 1) *
        (1 + milestoneBonus(s, "overclock")) *
        (1 + deviceBonus(s, "overclockDuration")),
    );}
/** Charged legacy control uses the same V3 contract; it never creates a tap. */
export function progressionActivateOverdrive(s:GameState,now:number){
 if(!usesItemV3(s)||s.retention.activeRun?.id==='no-taps'||!Number.isFinite(now)||now<s.savedAt||!s.overclock.charged||s.overclock.taps<formula().overdriveCharge||now<s.overclock.cooldownUntil)return s;
 const start=itemOverdriveStartV3(s,now,overdriveBaseDuration(s));
 return{...s,itemSystemV3:{...s.itemSystemV3!,overdrive:start.contract},overclock:{...s.overclock,taps:0,charged:false,activeUntil:now+start.duration*1000,cooldownUntil:now+BALANCE.progression.overdriveInterval},lifetime:{...s.lifetime,overclocks:s.lifetime.overclocks+1}};
}
export function progressionTap(s: GameState, now: number) {
  if (
    s.retention.activeRun?.id === "no-taps" ||
    (usesItemV3(s)&&(!Number.isFinite(now)||now<s.savedAt)) ||
    (s.progression.lastTap !== null &&
      now - s.progression.lastTap < BALANCE.progression.tapGap)
  )
    return s;
  let p = { ...s.progression },
    rng = (Math.imul(p.critRng, 1664525) + 1013904223) >>> 0;
  const relay = (usesItemV3(s)?itemV3Equipped(s):equippedItems(s)).find((i) => i.type === "impulse-relay"),
    relayCount = (relay?.relayTaps ?? 0) + 1,
    proc =
      !usesItemV3(s) && relay && relayCount % 10 === 0
        ? (specialItemEffectQuote(s, relay)?.appliedBonusSeconds ?? 0) *
          itemAmplifier(s)
        : 0;
  const q = tapQuote(s, now, proc),
    crit = rng / 4294967296 < q.chance ? q.crit : 1,
    base = creditRateScientific(
      s.hardware,
      s.level,
      s,
      now,
      false,
    ).multiplyNumber(q.seconds),
    gain = (base.compare(S(s.commerce?.owned.includes('ai_singularity.pass.income')?BALANCE.commerce.incomeMultiplier:1)) < 0 ? S(s.commerce?.owned.includes('ai_singularity.pass.income')?BALANCE.commerce.incomeMultiplier:1) : base).multiplyNumber(crit).add(usesItemV3(s)?itemRelayBonusV3(s,rng/4294967296<q.chance):S(0)),
    charge = Math.min(formula().overdriveCharge, s.overclock.taps + 1),
    trigger =
      charge >= formula().overdriveCharge && now >= s.overclock.cooldownUntil,
    duration = overdriveBaseDuration(s);
  const overdrive=trigger&&usesItemV3(s)?itemOverdriveStartV3(s,now,duration):null;
  p = {
    ...p,
    critRng: rng,
    lastTap: now,
    combo: Math.min(formula().comboMax, q.combo + 1),
  };
  return addMetrics(
    addCreditsScientific(
      {
        ...s,
        inventory: relay
          ? s.inventory.map((i) =>
              i.id === relay.id ? { ...i, relayTaps: usesItemV3(s)?relayCount%BALANCE.itemV3.relay.interval:relayCount } : i,
            )
          : s.inventory,
        progression: p,
        ...(overdrive?{itemSystemV3:{...s.itemSystemV3!,overdrive:overdrive.contract}}:{}),
        overclock: trigger
          ? {
              ...s.overclock,
              taps: 0,
              charged: false,
              activeUntil: now + (overdrive?.duration??duration) * 1000,
              cooldownUntil: now + BALANCE.progression.overdriveInterval,
            }
          : {
              ...s.overclock,
              taps: charge,
              charged: charge === formula().overdriveCharge,
            },
        lifetime: {
          ...s.lifetime,
          taps: s.lifetime.taps + 1,
          overclocks: s.lifetime.overclocks + (trigger ? 1 : 0),
        },
      },
      gain,
      true,
      false,
    ),
    now,
    { taps: 1, tap: gain.toNumber() },
  );
}
export const challengeChapterIndex = (s: number) =>
  BALANCE.challengeCatalog.chapters.findIndex((n) => s <= n);
export function minimalRestart(s: GameState) {
  return s.hardware === 0 && hasProgressionNode(s, "I06")
    ? buyHardwareClass(s, "calculator", 1)
    : s;
}

export function choosePhaseModel(
  s: GameState,
  phase: "reset" | "research" | "material",
) {
  if (!axiomLevel(s, "D04") || s.retention.activeRun) return s;
  const id = s.progression.modelPlan[phase];
  return id && s.progression.models[id] !== undefined ? selectModel(s, id) : s;
}

/** Exact quote of the next accepted tap; looking never advances a random stream. */
export function nextTapCredit(
  s: GameState,
  now = s.savedAt,
  includeProc = true,
) {
  if (
    s.retention.activeRun?.id === "no-taps" ||
    (usesItemV3(s)&&(!Number.isFinite(now)||now<s.savedAt)) ||
    (s.progression.lastTap !== null &&
      now - s.progression.lastTap < BALANCE.progression.tapGap)
  )
    return ScientificNumber.zero();
  const relay = (usesItemV3(s)?itemV3Equipped(s):equippedItems(s)).find((i) => i.type === "impulse-relay"),
    count = (relay?.relayTaps ?? 0) + 1,
    proc =
      !usesItemV3(s) && includeProc && relay && count % 10 === 0
        ? (specialItemEffectQuote(s, relay)?.appliedBonusSeconds ?? 0) *
          itemAmplifier(s)
        : 0,
    q = tapQuote(s, now, proc),
    seed = (Math.imul(s.progression.critRng, 1664525) + 1013904223) >>> 0,
    base = creditRateScientific(
      s.hardware,
      s.level,
      s,
      now,
      false,
    ).multiplyNumber(q.seconds);
  return (base.compare(S(s.commerce?.owned.includes('ai_singularity.pass.income')?BALANCE.commerce.incomeMultiplier:1)) < 0 ? S(s.commerce?.owned.includes('ai_singularity.pass.income')?BALANCE.commerce.incomeMultiplier:1) : base).multiplyNumber(
    seed / 4294967296 < q.chance ? q.crit : 1,
  ).add(usesItemV3(s)&&includeProc?itemRelayBonusV3(s,seed/4294967296<q.chance):S(0));
}

export const effectiveQuality = (s: GameState, level = s.qualityLevel) =>
  s.progression?.version === 2
    ? (1 +
        (formula().qualityBase ** trainingStrength(level,s) - 1) *
          (1 + challengeFamilyBonus(s, "quality-lock"))) **
      (hasProgressionNode(s, "T01") ? (usesItemV3(s)?BALANCE.prestigeV3.training.T01:effectsFor(s).T01) : 1)
    : quality(level);
export const effectiveEfficiency = (s: GameState, level = s.efficiencyLevel) =>
  s.progression?.version === 2
    ? (1 +
        (formula().efficiencyBase ** trainingStrength(level,s) - 1) *
          (1 + challengeFamilyBonus(s, "efficiency-lock"))) **
      (hasProgressionNode(s, "T02") ? (usesItemV3(s)?BALANCE.prestigeV3.training.T02:effectsFor(s).T02) : 1)
    : efficiency(level);
