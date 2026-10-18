import { describe, it, expect } from "vitest";
import {
  BALANCE,
  newGame,
  addCreditsScientific,
  newINTScientific,
  exactEconomyValue,
  equipmentSlotCount,
  computeRateScientific,
  creditRateScientific,
  type GameState,
} from "./economy";
import { buyNode, prestige, axiomReset, buyAxiomUpgrade } from "./prestige";
import { ScientificNumber as S } from "./scientificNumber";
import {
  discoverProgression,
  developModel,
  activeSlotIds,
  progressionTap,
} from "./progression";
import { serialize, restore, validate } from "./storage";
const funded = (s: GameState, n: number): GameState => ({
  ...s,
  unspentINT: n,
  cycleINTEarned: n,
  totalINTEarned: n,
  exactEconomy: {
    ...s.exactEconomy,
    unspentINT: S.from(n).toJSON(),
    cycleINTEarned: S.from(n).toJSON(),
    totalINTEarned: S.from(n).toJSON(),
  },
});
describe("Progression v2 production integration", () => {
  it("creates a writable save with three usable slots before prestige", () => {
    const s = newGame(0);
    expect(equipmentSlotCount(s)).toBe(3);
    expect(validate(s)).toBe(true);
    expect(restore(serialize(s), 0).error).toBeUndefined();
  });
  it("retains a one-credit debit beside 1e350 through serialization", () => {
    const a = S.fromString("1e350"),
      b = a.subtract(S.from(1));
    expect(b.compare(a)).toBe(-1);
    expect(
      S.fromJSON(JSON.parse(JSON.stringify(b)))
        .add(S.from(1))
        .compare(a),
    ).toBe(0);
    expect(S.from(0.001).multiplyNumber(1000).compare(S.from(1))).toBe(0);
  });
  it("allows each fixed extra slot in any order with only INT", () => {
    let s = funded(newGame(0), 200000);
    for (const id of ["W06", "W01", "W02"] as const) {
      const before = activeSlotIds(s);
      s = buyNode(s, id);
      expect(activeSlotIds(s).length).toBe(before.length + 1);
    }
    expect(s.nodes).toEqual(["W06", "W01", "W02"]);
  });
  it("produces INT, claims it once and restarts without H01", () => {
    let s = buyNode(funded(newGame(0), 30000), "I06");
    s = addCreditsScientific(s, S.from(765100329.5513278));
    const gain = newINTScientific(s);
    expect(gain.toNumber()).toBeGreaterThanOrEqual(1);
    const next = prestige(s);
    expect(next.hardwareCounts.calculator).toBe(1);
    expect(newINTScientific(next).isZero()).toBe(true);
    expect(prestige(next)).toBe(next);
  });
  it("opens the lab with seed and draws useful, nonduplicate models", () => {
    let s = discoverProgression(funded(newGame(0), 200000));
    expect(s.progression.labSeed).toBe(true);
    s = developModel(s);
    expect(Object.keys(s.progression.models)).toHaveLength(1);
    expect(s.progression.active).not.toBeNull();
    const rate = creditRateScientific(1, 0, {
      ...s,
      hardware: 1,
      hardwareCounts: { ...s.hardwareCounts, calculator: 1 },
    });
    expect(rate.compare(S.from(1.35))).toBeGreaterThan(0);
    expect(validate(s)).toBe(true);
  });
  it("rejects fast taps without adding charge or combo", () => {
    let s = progressionTap(newGame(0), 1000);
    expect(progressionTap(s, 1050)).toBe(s);
    expect(s.progression.combo).toBe(1);
  });
  it("does not change historical entitlement when an exponent is bought", () => {
    let s = addCreditsScientific(newGame(0), S.from(4 * 765100329.5513278));
    const old = s.progression.entitlement;
    s = {
      ...s,
      availableAxioms: 1,
      totalAxiomsEarned: 1,
      exactAxioms: { available: { m: 1, e: 0 }, total: { m: 1, e: 0 } },
    };
    s = buyAxiomUpgrade(s, "A01");
    expect(s.progression.entitlement).toEqual(old);
    expect(s.axiomUpgradeLevels.A01).toBe(1);
  });
});
import { advance } from "./simulation";
import {
  buyHardwareClass,
  addData,
  startResearchProject,
  trainingPreview,
  startTraining,
  grantComponents,
  trainingRate,
  type ItemTypeId,
} from "./economy";
import {
  craft,
  cancelCrafting,
  equip,
  createItem,
  fuseItems,
} from "./inventory";
import { queueExperiment, analysisQuote } from "./experiments";
import { startSynthesis } from "./progressionWork";
import {
  normalResetV2,
  axiomRewardV2,
  axiomNodeCost,
  progressionAgent,
} from "./progressionReset";
import {
  selectModel,
  knowledgeRate,
  modelFactor,
  integrationLevel,
} from "./progression";
import { startRunChallenge, abortRunChallenge } from "./retention";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { ProgressionPanel, SecretLab } from "./ProgressionPanel";
function v2Account() {
  let s = funded(newGame(0), 2000000);
  s = {
    ...s,
    prestigeEntitlementClaimed: 2000000,
    exactEconomy: {
      ...s.exactEconomy,
      prestigeEntitlementClaimed: S.from(2000000).toJSON(),
    },
    progression: { ...s.progression, entitlement: S.from(2000000).toJSON() },
  };
  return discoverProgression(
    addData(addCreditsScientific(s, S.fromString("1e50"), false, false), 1e8),
  );
}
const roundtrip = (s: GameState) => {
  const r = restore(serialize(s), s.savedAt);
  expect(r.error).toBeUndefined();
  return r.state;
};
describe("V2 real jobs and reset lifecycles", () => {
  it("crafts and equips every basic family without prestige or random blueprints", () => {
    let s = buyHardwareClass(newGame(0), "calculator");
    s = advance(s, 1).state;
    s = addData(s, 1000);
    for (const id of [
      "impulse-relay",
      "memory-crystal",
      "lab-drone",
    ] as ItemTypeId[]) {
      const before = s.inventory.length;
      s = craft(s, id);
      expect(s.crafting.active).toBeNull();
      s = roundtrip(s);
      s = advance(s, 301).state;
      expect(s.inventory.length).toBe(before + 1);
      s = equip(s, s.inventory.at(-1)!.id);
      s = roundtrip(s);
    }
    expect(Object.keys(s.equipped)).toHaveLength(3);
  });
  it("creates a whole instant batch and does not refund completed units",()=>{
    let s=buyNode(v2Account(),'W07');s={...s,learnedRecipes:[...(s.learnedRecipes??[]),'impulse-relay']};s=grantComponents(s,{circuits:1000,copperCoils:1000});
    const before=s.componentInventory.circuits;s=craft(s,'impulse-relay','common',3);
    expect(s.crafting.active).toBeNull();expect(s.crafting.queue).toEqual([]);expect(s.inventory.filter(i=>i.type==='impulse-relay')).toHaveLength(3);expect(s.componentInventory.circuits).toBe(before-36);
    expect(cancelCrafting(s,'craft-1')).toBe(s);roundtrip(s);
  });
  it("starts and completes paid research with no old prestige access nodes", () => {
    let s = buyHardwareClass(newGame(0), "calculator");
    s = addData(s, 363);
    s = startResearchProject(s, "dataGeneration");
    expect(s.researchLabs[0]).not.toBeNull();
    s = roundtrip(s);
    s = advance(s, 181).state;
    expect(s.researchLevels.dataGeneration).toBe(1);
    s = roundtrip(s);
    expect(advance(s, 5).state.researchLevels.dataGeneration).toBe(1);
  });
  it("pays Integration in both currencies and finishes only once", () => {
    let s = buyNode(v2Account(), "T04");
    const q = trainingPreview(s, "integration"),
      data = exactEconomyValue(s, "data");
    expect(q.allowed).toBe(true);
    s = startTraining(s, "integration");
    expect(data.subtract(exactEconomyValue(s, "data")).toNumber()).toBe(100);
    s = roundtrip(s);
    s = advance(s, 121).state;
    expect(integrationLevel(s)).toBe(1);
    s = roundtrip(s);
    expect(advance(s, 2).state.integrationLevel).toBe(1);
  });
  it("keeps archived levels and their INT strength through prestige", () => {
    let s = buyNode(buyNode(v2Account(), "T08"), "I03");
    s = {
      ...s,
      qualityLevel: 20,
      efficiencyLevel: 15,
      integrationLevel: 10,
      level: 45,
    };
    s = addCreditsScientific(s, S.from(765100329.5513278 * 100));
    const next = normalResetV2(s);
    expect(next.qualityLevel).toBe(20);
    expect(next.efficiencyLevel).toBe(15);
    expect(next.integrationLevel).toBe(10);
    expect(roundtrip(next).nodes).toContain("T08");
  });
  it("preserves all paid fixed slots through first Axiom and never charges again", () => {
    let s = v2Account();
    const nodes = Object.entries(BALANCE.progression.nodes)
      .sort((a, b) => a[1].cost - b[1].cost)
      .slice(0, 30)
      .map(([id]) => id);
    for (const id of [...nodes, "W06"]) s = buyNode(s, id as never);
    expect(axiomRewardV2(s).compare(S.from(1))).toBeGreaterThanOrEqual(0);
    const before = activeSlotIds(s);
    s = axiomReset(s);
    expect(activeSlotIds(s)).toEqual(before);
    expect(exactEconomyValue(s, "cycleINTEarned").isZero()).toBe(true);
    expect(buyNode(s, "W06")).toBe(s);
    expect(roundtrip(s).progression.lab).toBe(true);
  });
  it("finishes targeted synthesis with no random draw and no lab unlock", () => {
    let s = addData(buyHardwareClass(newGame(0), "calculator"), 100);
    s = startSynthesis(s, "circuits");
    expect(s.progression.synthesis).not.toBeNull();
    const stock = s.componentInventory.circuits;
    s = advance(s, 60).state;
    expect(s.progression.synthesis).toBeNull();
    expect(s.componentInventory.circuits).toBeGreaterThanOrEqual(stock + 1);
    expect(roundtrip(s).progression.lab).toBe(false);
  });
  it("freezes analysis prices and guarantees a rare material from a common-only pool", () => {
    let s = buyNode(v2Account(), "W03");
    const q = analysisQuote(s, "hardware", "short");
    expect(q.cost.data).toBe(250);
    s = queueExperiment(s, "hardware", s.savedAt, "short");
    expect(s.experiments.active).not.toBeNull();
    s = roundtrip(s);
    s = advance(s, 600).state;
    expect(s.experiments.active).toBeNull();
    expect(
      s.experiments.lastResult?.components.graphene,
    ).toBeGreaterThanOrEqual(1);
    expect(roundtrip(s).experiments.completedIds).toHaveLength(1);
  });
  it("uses a higher material research level without raising the same analysis price", () => {
    const s = v2Account(),
      a = analysisQuote(s, "hardware", "short"),
      b = analysisQuote(
        { ...s, researchLevels: { ...s.researchLevels, materialAnalysis: 10 } },
        "hardware",
        "short",
      );
    expect(b.cost.data).toBe(a.cost.data);
    expect(b.rewards.components.whole).toBeGreaterThan(
      a.rewards.components.whole,
    );
  });
  it("changes remaining research work with the one active KI, without repricing", () => {
    let s = buyHardwareClass(v2Account(), "calculator");
    s = {
      ...s,
      researchLevels: { ...s.researchLevels, dataGeneration: 1 },
      progression: {
        ...s.progression,
        models: { K07: 0, K01: 0 },
        active: "K07",
      },
    };
    s = startResearchProject(s, "modelArchitecture");
    const paid = s.researchLabs.find(Boolean)!.dataCostExact;
    s = advance(s, 10).state;
    const fast = s.researchLabs.find(Boolean)!.endsAt;
    s = selectModel(s, "K01");
    s = advance(s, 1).state;
    expect(s.researchLabs.find(Boolean)!.endsAt).toBeGreaterThan(fast);
    expect(s.researchLabs.find(Boolean)!.dataCostExact).toEqual(paid);
    roundtrip(s);
  });
  it("fuses immediately and carries exactly the material basis", () => {
    let s = v2Account();
    for (let i = 0; i < 3; i++) s = createItem(s, "quantum-chip", "common");
    s = {
      ...s,
      inventory: s.inventory.map((i) => ({
        ...i,
        materialBasis: { circuits: 10 },
      })),
    };
    const ids = s.inventory.map((i) => i.id);
    s = fuseItems(s, ids);
    expect(s.inventory).toHaveLength(1);
    expect(s.progression.fusion).toBeNull();
    s = advance(s, 60).state;
    expect(s.inventory).toHaveLength(1);
    expect(s.inventory[0].rarity).toBe("uncommon");
    expect(s.inventory[0].materialBasis?.circuits).toBe(30);
    roundtrip(s);
  });
  it("renders real Prestige, Axiom and lab controls without old layout positions", () => {
    const s = v2Account(),
      markup = renderToStaticMarkup(
        createElement(ProgressionPanel, { s, act: () => {} }),
      );
    expect(markup.match(/id="prestige-node-/g) ?? []).toHaveLength(60);
    const lab = renderToStaticMarkup(
      createElement(SecretLab, { s, act: () => {} }),
    );
    expect(lab).toContain("Geheimes Labor");
    expect(lab).toContain("1.000");
  });
});
import { startFusion } from "./progressionAutomation";
import { salvageQuote } from "./recovery";
import { migrateProgressionV2 } from "./progressionSave";
import { newGame as legacyGame } from "./legacyContractFixture";
describe("V2 boundary and automation regressions", () => {
  it("keeps lab model RNG independent from accepted combat taps", () => {
    const base = v2Account(),
      other = progressionTap(base, 1000);
    expect(developModel(base).progression.active).toBe(
      developModel(other).progression.active,
    );
  });
  it("retains a useful common revenue core for every possible first model", () => {
    const base = buyHardwareClass(v2Account(), "calculator"),
      baseline = creditRateScientific(base.hardware, base.level, {
        ...base,
        progression: { ...base.progression, active: null },
      });
    for (const id of Object.keys(
      BALANCE.progression.models,
    ) as import("./progression").ModelId[]) {
      const s = {
        ...base,
        progression: { ...base.progression, models: { [id]: 0 }, active: id },
      };
      expect(
        creditRateScientific(s.hardware, s.level, s).compare(baseline),
      ).toBeGreaterThan(0);
    }
  });
  it("finishes an already running job before reset without starting endless successors", () => {
    let s = buyNode(buyNode(v2Account(), "I06"), "T06");
    s = addCreditsScientific(s, S.from(765100329.5513278 * 100));
    s = {
      ...s,
      progression: { ...s.progression, trainingAuto: true },
      prestigeAgent: {
        ...s.prestigeAgent,
        enabled: true,
        minimumRunMinutes: 15,
        minimumReward: { m: 1, e: 0 },
      },
    };
    s = startTraining(s, "quality");
    const result = advance(s, 1800).state;
    expect(result.prestigeCount).toBeGreaterThan(0);
    expect(result.hardwareCounts.calculator).toBeGreaterThan(0);
    expect(result.progression.resetIntent).toBeNull();
    roundtrip(result);
  });
  it("uses the Axiom cycle clock independently of ordinary run resets", () => {
    const s = v2Account(),
      p = { ...s.progression, axiomCycleStartedAt: 0 };
    const next = {
      ...s,
      savedAt: 600000,
      runStartedAt: 599999,
      axiomResetCount: 1,
      axiomUpgradeLevels: { ...s.axiomUpgradeLevels, B06: 1 },
      progression: { ...p, axiomAuto: true },
    };
    expect(progressionAgent(next).axiomResetCount).toBeGreaterThan(1);
  });
  it("does not turn queued crafting Data into post-Axiom currency", () => {
    let s = v2Account();
    for (const id of Object.keys(BALANCE.progression.nodes)
      .sort(
        (a, b) =>
          BALANCE.progression.nodes[a as keyof typeof BALANCE.progression.nodes]
            .cost -
          BALANCE.progression.nodes[b as keyof typeof BALANCE.progression.nodes]
            .cost,
      )
      .slice(0, 30))
      s = buyNode(s, id as never);
    s = { ...s, completedResearch: [...s.completedResearch, "blueprints"] };
    s = discoverProgression(
      grantComponents(s, { circuits: 1000, copperCoils: 1000 }),
    );
    s = craft(s, "impulse-relay");
    s = craft(s, "memory-crystal");
    expect(s.crafting.queue.length).toBe(0);
    s = axiomReset(s);
    expect(exactEconomyValue(s, "data").isZero()).toBe(true);
    expect(s.crafting.queue).toHaveLength(0);
    expect(s.crafting.active).toBeNull();
    expect(s.inventory.some(i=>i.type==="impulse-relay")).toBe(true);
    roundtrip(s);
  });
  it("returns no imaginary salvage material for a free loot item", () => {
    let s = createItem(v2Account(), "quantum-chip", "common");
    expect(salvageQuote(s, s.inventory[0].id).returned).toEqual({});
  });
  it("preserves the single purchased INT balance and migrates exactly once", () => {
    let old = legacyGame(0);
    old = {
      ...old,
      nodes: ["manufacturing1"],
      totalINTEarned: 349,
      cycleINTEarned: 349,
      unspentINT: 97,
      spentINT: 252,
      exactEconomy: {
        ...old.exactEconomy,
        totalINTEarned: S.from(349).toJSON(),
        cycleINTEarned: S.from(349).toJSON(),
        unspentINT: S.from(97).toJSON(),
        spentINT: S.from(252).toJSON(),
      },
    };
    const s = migrateProgressionV2(old);
    expect(exactEconomyValue(s, "unspentINT").toNumber()).toBe(98);
    expect(exactEconomyValue(s, "spentINT").toNumber()).toBe(251);
    expect(migrateProgressionV2(s)).toBe(s);
    expect(
      restore(JSON.stringify({ version: 59, state: old }), 0).error,
    ).toBeUndefined();
  });
  it("rejects a damaged current model collection without rewriting it", () => {
    const s = v2Account(),
      raw = JSON.stringify({
        version: 60,
        state: {
          ...s,
          progression: { ...s.progression, models: { K01: Infinity } },
        },
      });
    expect(restore(raw, 0).error).toBeTruthy();
  });
  it("pauses main production and paid boost duration while a real challenge runs", () => {
    let main = buyHardwareClass(v2Account(), "calculator");
    main = {
      ...main,
      prestigeCount: 1,
      lifetime: { ...main.lifetime, hardwareClasses: ["calculator", "sbc"] },
      creditBoostUntil: 100000,
    };
    let run = startRunChallenge(main, "no-taps");
    expect(run.retention.activeRun).not.toBeNull();
    expect(run.hardwareCounts.calculator).toBe(1);
    const credits = exactEconomyValue(main, "credits");
    run = advance(run, 60).state;
    const returned = abortRunChallenge(run);
    expect(returned.retention.activeRun).toBeNull();
    expect(exactEconomyValue(returned, "credits").compare(credits)).toBe(0);
    expect(returned.creditBoostUntil - returned.savedAt).toBe(100000);
    roundtrip(returned);
  });
  it("does not allow Critical/Overdrive bypasses in Hands Off", () => {
    const base = {
      ...v2Account(),
      retention: {
        ...v2Account().retention,
        activeRun: {
          id: "no-taps",
          runId: "test",
          startedAt: 0,
          eligibleAtStart: { m: 0, e: 0 },
          metrics: undefined,
        },
      },
    };
    expect(progressionTap(base, 1000)).toBe(base);
  });
  it("keeps late A02 purchases bounded in exponent and unbounded in price", () => {
    let s = v2Account();
    s = { ...s, axiomUpgradeLevels: { ...s.axiomUpgradeLevels, A02: 6 } };
    expect(axiomNodeCost(s, "A02")?.toNumber()).toBe(1458);
    s = { ...s, axiomUpgradeLevels: { ...s.axiomUpgradeLevels, A02: 7 } };
    expect(axiomNodeCost(s, "A02")?.toNumber()).toBe(4374);
  });
});

import { queueTraining, addDataScientific } from "./economy";
import { knownProgressionNodes } from "./progression";
describe("V2 job and save boundaries", () => {
  it("runs a manual queued training without enabling autopilot", () => {
    let s = buyNode(v2Account(), "T03");
    s = startTraining(s, "quality");
    s = queueTraining(s, "efficiency");
    s = advance(s, 1000).state;
    expect(s.runTrainingStarted).toBe(2);
    expect(s.trainingQueue).toHaveLength(0);
    expect(s.qualityLevel).toBe(1);
    expect(s.efficiencyLevel).toBe(1);
    roundtrip(s);
  });
  it("does not grant archived seventh training a new model-transfer bonus", () => {
    let s = buyNode(v2Account(), "T08");
    s = {
      ...s,
      completedResearch: [...s.completedResearch, "modelTransfer"],
      runTrainingStarted: 6,
    };
    s = startTraining(s, "quality");
    expect(s.activeTraining?.modelTransferEligible).toBe(false);
    s = addCreditsScientific(s, S.from(765100329.5513278));
    s = prestige(s);
    expect(s.runTrainingStarted).toBe(0);
    expect(s.activeTraining?.modelTransferEligible).toBe(false);
    expect(
      trainingRate(s.hardware, {
        ...s,
        activeTraining: { ...s.activeTraining!, modelTransferEligible: true },
      }),
    ).toBeCloseTo(2 * trainingRate(s.hardware, s));
    roundtrip(s);
  });
  it.each([
    "critRng",
    "materialRng",
    "work",
    "modelPlan",
    "fusionPlanner",
    "reserves",
  ] as const)("protects a damaged %s field", (field) => {
    const s = v2Account(),
      raw = JSON.stringify({
        version: 60,
        state: { ...s, progression: { ...s.progression, [field]: null } },
      });
    expect(restore(raw, 0).error).toBeTruthy();
  });
  it("rejects a zero projection hiding a nonzero scientific residual", () => {
    expect(() => S.fromJSON({ m: 0, e: 0, terms: [[0, 1]] })).toThrow();
  });
});

import { pauseMain, prepareProgressionWork } from "./progressionWork";
import { forgeItem } from "./inventory";
describe("paused paid forge contract", () => {
  it("preserves raw progress when challenge time shifts a forge timestamp", () => {
    let s = createItem(
      grantComponents(v2Account(), { circuits: 100 }),
      "quantum-chip",
      "common",
    );
    s = forgeItem(s, s.inventory[0].id);
    expect(s.foundries[0]?.active).toBeTruthy();
    s = advance(s, 10).state;
    const active = s.foundries[0].active!,
      key = `forge:${active.itemId}:${active.startedAt}`,
      work = s.progression.work[key];
    expect(work.done).toBeGreaterThan(0);
    const paused = pauseMain(s, s.savedAt + 60000),
      shifted = paused.foundries[0].active!,
      newKey = `forge:${shifted.itemId}:${shifted.startedAt}`;
    expect(prepareProgressionWork(paused).progression.work[newKey]).toEqual(
      work,
    );
    roundtrip(paused);
  });
});

describe("live v59 job migration", () => {
  it("keeps work already performed by a paid legacy research job", () => {
    let old = buyHardwareClass(addData(legacyGame(0), 10000), "calculator");
    old = startResearchProject(old, "dataGeneration");
    expect(old.researchLabs[0]).not.toBeNull();
    old = advance(old, 1).state;
    const read = restore(serialize(old), old.savedAt);
    expect(read.error).toBeUndefined();
    const migrated = read.state,
      job = migrated.researchLabs[0]!;
    expect(
      migrated.progression.work[job.jobId ?? `${job.id}:${job.startedAt}`].done,
    ).toBeGreaterThan(0);
    const contract =
      migrated.progression.work[job.jobId ?? `${job.id}:${job.startedAt}`];
    expect(contract.done / contract.required).toBeCloseTo(
      (old.savedAt - job.startedAt) / (job.endsAt - job.startedAt),
      12,
    );
    const done = advance(migrated, contract.required + 1).state;
    expect(done.researchLevels.dataGeneration).toBe(1);
    expect(done.lifetime.researchCompleted).toBe(1);
    roundtrip(done);
  });
});

import { itemTypes, hardwareAutobuyerUnlocked } from "./economy";
describe("model and migration licenses in late loops", () => {
  it("carries both K10 universal slots into a challenge without replacing an item", () => {
    let s = v2Account();
    for (const id of ["W01", "W02", "W06"] as const) s = buyNode(s, id);
    s = {
      ...s,
      prestigeCount: 1,
      lifetime: { ...s.lifetime, hardwareClasses: ["calculator", "sbc"] },
      progression: { ...s.progression, models: { K10: 15 }, active: "K10" },
    };
    for (const [family, count] of [
      ["processor", 3],
      ["core", 3],
      ["research", 2],
    ] as const)
      for (const type of (Object.keys(itemTypes) as ItemTypeId[])
        .filter((id) => itemTypes[id].slot === family)
        .slice(0, count)) {
        s = createItem(s, type, "common");
        s = equip(s, s.inventory.at(-1)!.id);
      }
    expect(Object.values(s.equipped)).toHaveLength(8);
    const run = startRunChallenge(s, "no-taps");
    expect(run.retention.activeRun).not.toBeNull();
    expect(Object.values(run.equipped)).toHaveLength(8);
    expect(new Set(Object.values(run.equipped)).size).toBe(8);
    roundtrip(run);
  });
  it("keeps a protected historical hardware license through Axiom", () => {
    let s = v2Account();
    s = {
      ...s,
      axiomResetCount: 1,
      progression: { ...s.progression, legacyAutobuyers: ["server"] },
    };
    s = axiomReset(s);
    expect(s.axiomResetCount).toBe(2);
    expect(hardwareAutobuyerUnlocked(s, "server")).toBe(true);
    roundtrip(s);
  });
});
