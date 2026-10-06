import { describe, it, expect } from "vitest";
import {
  BALANCE,
  equippedBonus,
  newGame,
  addCredits,
  addData,
  buyHardwareClass,
  computeRateScientific,
  usersRateScientific,
  creditRateScientific,
  dataRateScientific,
  researchRateScientific,
  usersFactors,
  creditFactors,
  computeFactors,
  classComputeScientific,
  hardwareIds,
  scientificProduct,
  quality,
  efficiency,
  startTraining,
  startResearchProject,
  selectOperatingProfile,
  exactEconomyValue,
  trainingPreview,
  researchPreview,
  type GameState,
} from "./economy";
import { queueExperiment, analysisAffordability } from "./experiments";
import { createItem, equip } from "./inventory";
import { economySnapshot } from "./economySnapshot";
import { advance } from "./simulation";
import { serialize, importGame } from "./storage";
import { ScientificNumber } from "./scientificNumber";
import { createBalanceExportFiles } from "./balanceReport";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { ProductionDetails } from "./ProductionDetails";
const ready = () => {
  let s = addData(addCredits(newGame(0), 1e6, false), 1e6);
  return buyHardwareClass(buyHardwareClass(s, "calculator", 25), "sbc");
};
const rates = (s: GameState) =>
  [
    computeRateScientific(s.hardware, s),
    usersRateScientific(s),
    creditRateScientific(s.hardware, s.level, s),
    dataRateScientific(s),
    researchRateScientific(s),
  ].map((n) => n.toJSON());
describe("full compute user economy", () => {
  it("uses all compute at every legacy profile and keeps the saved profile", () => {
    const base = ready();
    for (const id of ["balanced", "training", "discovery"] as const) {
      const s = selectOperatingProfile(base, id);
      expect(rates(s)).toEqual(rates(base));
      const loaded = importGame(serialize(s));
      expect(loaded.operatingProfile).toBe(id);
      expect(rates(loaded)).toEqual(rates(s));
      expect(loaded.hardwareCounts).toEqual(s.hardwareCounts);
      expect(loaded.exactEconomy.credits).toEqual(s.exactEconomy.credits);
    }
  });
  it("starts three paid parallel jobs without subtracting capacity or credits per second", () => {
    const s = ready(),
      before = rates(s).slice(0, 3),
      training = trainingPreview(s, "quality"),
      research = researchPreview(s, "dataGeneration")!,
      analysis = analysisAffordability(s, "hardware", "short");
    const next = queueExperiment(
      startResearchProject(startTraining(s, "quality"), "dataGeneration"),
      "hardware",
      0,
      "short",
    );
    expect(next.activeTraining).not.toBeNull();
    expect(next.researchLabs.some(Boolean)).toBe(true);
    expect(next.experiments.active).not.toBeNull();
    expect(rates(next).slice(0, 3)).toEqual(before);
    const paid = training.cost.add(research.cost).add(analysis.costExact);
    expect(
      exactEconomyValue(next, "data").compare(
        exactEconomyValue(s, "data").subtract(paid),
      ),
    ).toBe(0);
    expect(next.activeTraining?.workRequired).toBe(training.duration);
    expect(next.researchLabs[0]?.durationSeconds).toBe(research.duration);
    expect(next.experiments.active?.durationSeconds).toBe(analysis.duration);
    const running = advance(next, 2, false).state;
    expect(rates(running).slice(0, 2)).toEqual(before.slice(0, 2));
  });
  it("quality changes revenue per user and efficiency changes full capacity", () => {
    const s = ready(),
      q = { ...s, qualityLevel: 4 },
      e = { ...s, efficiencyLevel: 4 };
    expect(usersRateScientific(q).toJSON()).toEqual(
      usersRateScientific(s).toJSON(),
    );
    expect(
      creditRateScientific(q.hardware, q.level, q)
        .divide(creditRateScientific(s.hardware, s.level, s))
        .toNumber(),
    ).toBeCloseTo(quality(4), 12);
    expect(
      usersRateScientific(e).divide(usersRateScientific(s)).toNumber(),
    ).toBeCloseTo(efficiency(4), 12);
  });
  it("reconstructs each factor once with hardware, items, research, INT and Axioms", () => {
    let s: GameState = {
      ...ready(),
      prestigeCount: 1,
      purchasedEquipmentSlots: 2,
      qualityLevel: 3,
      efficiencyLevel: 2,
      researchLevels: {
        ...ready().researchLevels,
        computeOptimization: 2,
        userScaling: 2,
        commercialization: 3,
      },
      cycleINTEarned: 10,
      totalINTEarned: 10,
      unspentINT: 10,
      totalAxiomsEarned: 2,
      axioms: 2,
      availableAxioms: 2,
    };
    s = createItem(
      createItem(s, "quantum-chip", "rare"),
      "memory-crystal",
      "common",
    );
    s = equip(equip(s, s.inventory[0].id), s.inventory[1].id);
    const raw = hardwareIds.reduce(
        (sum, id) => sum.add(classComputeScientific(s, id)),
        ScientificNumber.zero(),
      ),
      compute = scientificProduct(raw, ...Object.values(computeFactors(s))),
      users = scientificProduct(compute, ...Object.values(usersFactors(s))),
      credits = scientificProduct(users, ...Object.values(creditFactors(s)));
    expect(compute.toJSON()).toEqual(
      computeRateScientific(s.hardware, s).toJSON(),
    );
    expect(users.toJSON()).toEqual(usersRateScientific(s).toJSON());
    expect(credits.toJSON()).toEqual(
      creditRateScientific(s.hardware, s.level, s).toJSON(),
    );
    const snapshot = economySnapshot(s);
    expect(snapshot.reconstructed.users).toEqual(snapshot.users.rate);
    expect(snapshot.users.base).toEqual(snapshot.compute.rate);
    expect(snapshot.users.capacity).toEqual(snapshot.users.rate);
    expect(snapshot.users.utilization).toBe(1);
    expect(snapshot.credits.rate).toEqual(credits.toJSON());
    expect(snapshot.compute.additiveFactorTerms.items).toBeGreaterThan(0);
    expect(snapshot.credits.factors.INT).not.toEqual({ m: 1, e: 0 });
    expect(snapshot.credits.factors.axioms).not.toEqual({ m: 1, e: 0 });
  });
  it("applies isolated research, item, INT and Axiom effects once", () => {
    const base = { ...ready(), prestigeCount: 1 },
      rate = (s: GameState) => creditRateScientific(s.hardware, s.level, s);
    const research = {
      ...base,
      researchLevels: { ...base.researchLevels, computeOptimization: 2 },
    };
    expect(
      computeRateScientific(research.hardware, research)
        .divide(computeRateScientific(base.hardware, base))
        .toNumber(),
    ).toBeCloseTo(
      (1 + BALANCE.repeatableResearch.computeOptimization.effectPerLevel) ** 2,
      12,
    );
    const withItem = createItem(base, "quantum-chip", "common"),
      equipped = equip(withItem, withItem.inventory[0].id);
    expect(
      computeRateScientific(equipped.hardware, equipped)
        .divide(computeRateScientific(base.hardware, base))
        .toNumber(),
    ).toBeCloseTo(
      (computeFactors(base).itemAndMilestoneAdditive +
        equippedBonus(equipped, "compute")) /
        computeFactors(base).itemAndMilestoneAdditive,
      12,
    );
    const int = { ...base, cycleINTEarned: 10 };
    expect(rate(int).divide(rate(base)).toNumber()).toBeCloseTo(
      1 + BALANCE.prestigeBonusLogScale * Math.log1p(10),
      12,
    );
    const axiom = { ...base, totalAxiomsEarned: 2 };
    expect(rate(axiom).divide(rate(base)).toNumber()).toBeCloseTo(
      1 + 2 * BALANCE.axiom.creditPerTotal,
      12,
    );
  });
  it("matches short online/offline and reloaded intervals without new starter capital", () => {
    const s = ready(),
      online = advance(s, 3, true).state,
      offline = advance(s, 3, false).state;
    expect(online.exactEconomy).toEqual(offline.exactEconomy);
    const split = advance(
      importGame(serialize(advance(s, 1, false).state)),
      2,
      false,
    ).state;
    expect(
      exactEconomyValue(split, "credits")
        .divide(exactEconomyValue(offline, "credits"))
        .toNumber(),
    ).toBeCloseTo(1, 12);
    expect(
      exactEconomyValue(split, "data")
        .divide(exactEconomyValue(offline, "data"))
        .toNumber(),
    ).toBeCloseTo(1, 12);
    expect(split.hardwareCounts).toEqual(s.hardwareCounts);
  });
  it("keeps rates scientific beyond native range", () => {
    const s = {
      ...ready(),
      researchLevels: { ...ready().researchLevels, computeOptimization: 20000 },
    };
    const snap = economySnapshot(s);
    expect(snap.compute.rate.e).toBeGreaterThan(308);
    expect(snap.users.rate.e).toBeGreaterThan(308);
    expect(snap.credits.rate.e).toBeGreaterThan(308);
    expect(snap.reconstructed.users).toEqual(snap.users.rate);
    expect(rates(importGame(serialize(s)))).toEqual(rates(s));
    const produced = advance(s, 0.5, false).state;
    expect(exactEconomyValue(produced, "credits").toJSON().e).toBeGreaterThan(
      308,
    );
    for (const n of rates(s)) {
      expect(Number.isFinite(n.m)).toBe(true);
      expect(Number.isSafeInteger(n.e)).toBe(true);
    }
  });
  it("exports the same full capacity without obsolete allocation parameters", () => {
    const s = ready(),
      files = createBalanceExportFiles(s),
      economy = JSON.parse(files["economy.json"]);
    expect(economy.parameters.operatingProfiles).toBeUndefined();
    expect(economy).not.toHaveProperty("operatingProfiles");
    expect(
      economy.compatibility.legacyOperatingProfiles.affectsProduction,
    ).toBe(false);
    expect(economy.coreLoop.utilization).toBe(1);
    const snapshot = economySnapshot(s);
    expect(snapshot.users).not.toHaveProperty("inferenceShare");
    for (const language of ["de", "en"] as const) {
      const html = renderToStaticMarkup(
        createElement(ProductionDetails, {
          s: { ...s, settings: { ...s.settings, language } },
        }),
      );
      expect(html).toContain("100");
      expect(html).not.toMatch(/Inference/);
    }
  });
});
