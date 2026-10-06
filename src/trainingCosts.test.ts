import { describe, it, expect } from "vitest";
import {
  newGame,
  buyHardwareClass,
  addData,
  addDataScientific,
  trainingCostQuote,
  trainingPreview,
  startTraining,
  queueTraining,
  startQueuedTrainingIfAffordable,
  exactEconomyValue,
  grantComponents,
  itemEffectFor,
  deepPrestigeBonus,
  trainingDataCostForLevelScientific,
  usersRateScientific,
  creditRateScientific,
  type GameState,
} from "./economy";
import {
  createItem,
  equip,
  unequip,
  upgrade,
  forgeItem,
  itemImprovementPreview,
} from "./inventory";
import { itemImprovementHasEffect } from "./itemMechanics";
import { advance } from "./simulation";
import { SAVE_VERSION, serialize, importGame } from "./storage";
import { createBalanceExportFiles } from "./balanceReport";
import { ScientificNumber } from "./scientificNumber";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import {
  TrainingCostDetails,
  TrainingItemCostComparison,
} from "./TrainingCostDetails";
const ready = () =>
  grantComponents(
    {
      ...buyHardwareClass(addData(newGame(0), 1e6), "calculator"),
      prestigeCount: 1,
    },
    { circuits: 10000 },
  );
const withItem = (
  type: "logic-seed" | "photonic-array" | "tensor-core" = "logic-seed",
  rarity: "common" | "rare" = "common",
) => {
  const s = createItem(ready(), type, rarity);
  return equip(s, s.inventory[0].id);
};
describe("training Data cost bonuses", () => {
  it("retains unrounded base, rounds only the final price, and has no credit cost", () => {
    for (let level = 1; level < 15; level++) {
      const s = { ...ready(), qualityLevel: level - 1, level: level - 1 },
        q = trainingCostQuote(s, "quality");
      expect(q.cost.compare(trainingDataCostForLevelScientific(level))).toBe(0);
      expect(q.factor).toBe(1);
      expect(q.baseCost.toNumber()).toBeCloseTo(15 * 1.75 ** (level - 1), 8);
      expect(startTraining(s, "quality").credits).toBe(s.credits);
    }
  });
  it("converts graph +20% to 1/1.2 and adds actual milestone and item sources exactly once", () => {
    const graph = {
      ...ready(),
      breakthroughs: ["graph"] as GameState["breakthroughs"],
    };
    expect(trainingCostQuote(graph, "quality")).toMatchObject({
      bonusTotal: 0.2,
      factor: 1 / 1.2,
    });
    expect(trainingCostQuote(graph, "quality").cost.toNumber()).toBe(13);
    let s = withItem();
    s = {
      ...s,
      breakthroughs: ["graph"],
      hardwareCounts: { ...s.hardwareCounts, rig: 25, lunar: 10 },
    };
    const q = trainingCostQuote(s, "quality"),
      item = itemEffectFor(s, s.inventory[0], "training");
    expect(Object.values(q.sources)).toHaveLength(5);
    expect(q.bonusTotal).toBeCloseTo(0.2 + 0.05 + 0.1 + 0.09 + item, 14);
    expect(q.factor).toBeCloseTo(1 / (1 + q.bonusTotal), 14);
    expect(q.cost.toNumber()).toBe(Math.ceil(15 * q.factor));
  });
  it("caps the discount at 50%, including ceiling of odd costs and temporary expiry", () => {
    const s = { ...ready(), trainingBoostUntil: 1000 };
    expect(trainingCostQuote(s, "quality").cost.toNumber()).toBe(8);
    expect(trainingCostQuote(s, "quality").factor).toBe(0.5);
    const both = {
      ...s,
      overclock: {
        ...s.overclock,
        activeUntil: 2000,
        channel: "training" as const,
      },
    };
    expect(trainingCostQuote(both, "quality").bonusTotal).toBe(2);
    expect(trainingCostQuote(both, "quality", 2000).cost.toNumber()).toBe(15);
    expect(
      trainingCostQuote(
        {
          ...s,
          overclock: { ...s.overclock, activeUntil: 2000, channel: "credits" },
        },
        "quality",
        1000,
      ).bonusTotal,
    ).toBe(0);
  });
  it("uses only equipped items with real quality, level, forge and prestige scaling", () => {
    let s = withItem("tensor-core", "rare");
    const before = trainingCostQuote(s, "quality");
    expect(before.bonusTotal).toBeCloseTo(
      itemEffectFor(s, s.inventory[0], "training"),
      14,
    );
    s = upgrade(s, s.inventory[0].id);
    s = forgeItem(s, s.inventory[0].id);
    const q = trainingCostQuote(s, "quality");
    expect(q.bonusTotal).toBeGreaterThan(before.bonusTotal);
    expect(q.bonusTotal).toBeCloseTo(
      itemEffectFor(s, s.inventory[0], "training") *
        (1 + deepPrestigeBonus(s, "manufacturing")),
      14,
    );
    expect(trainingCostQuote(unequip(s, "core"), "quality").bonusTotal).toBe(0);
    const amplified = {
      ...s,
      nodes: ["manufacturing4", "analysis6"] as GameState["nodes"],
    };
    expect(trainingCostQuote(amplified, "quality").bonusTotal).toBeCloseTo(
      itemEffectFor(amplified, amplified.inventory[0], "training") * 1.2,
      14,
    );
    expect(
      trainingCostQuote(
        {
          ...amplified,
          retention: {
            ...amplified.retention,
            activeRun: { id: "no-items" } as any,
          },
        },
        "quality",
      ).sources,
    ).toEqual({});
  });
  it("enables genuine training-item improvements while showing equal rounded prices honestly in DE/EN", () => {
    const s = withItem("photonic-array"),
      p = itemImprovementPreview(s, s.inventory[0].id, "forge")!;
    expect(itemImprovementHasEffect(s, p.item, p.result)).toBe(true);
    expect(forgeItem(s, p.item.id).inventory[0].forge).toBe(1);
    for (const language of ["de", "en"] as const) {
      const state = { ...s, settings: { ...s.settings, language } },
        html = renderToStaticMarkup(
          createElement(TrainingItemCostComparison, {
            s: state,
            before: p.item,
            after: p.result,
          }),
        );
      expect(html).toContain(
        language === "de" ? "keine sofortige Ersparnis" : "no immediate saving",
      );
      expect(
        renderToStaticMarkup(
          createElement(TrainingCostDetails, { s: state, track: "quality" }),
        ),
      ).toContain("50");
    }
  });
  it("quotes, pays, freezes and exports the same scientific basis and actual price once", () => {
    const s = {
        ...withItem(),
        breakthroughs: ["graph"] as GameState["breakthroughs"],
      },
      before = JSON.stringify(s),
      p = trainingPreview(s, "quality");
    expect(JSON.stringify(s)).toBe(before);
    const started = startTraining(s, "quality");
    expect(exactEconomyValue(s, "data").subtract(p.cost).toJSON()).toEqual(
      started.exactEconomy.data,
    );
    expect(started.activeTraining?.costBasis).toMatchObject({
      factor: p.factor,
      bonusTotal: p.bonusTotal,
      baseDataCostExact: p.baseCost.toJSON(),
    });
    expect(startTraining(started, "quality")).toBe(started);
    const files = createBalanceExportFiles(started, 0),
      summary = JSON.parse(files["summary.json"]),
      economy = JSON.parse(files["economy.json"]);
    expect(summary.jobs.training.cost.data).toEqual(p.cost.toJSON());
    expect(summary.jobs.training.costBasis).toEqual(
      started.activeTraining!.costBasis,
    );
    expect(economy.formulas.trainingDataCost.cost).toBe(
      "ceil(unrounded base * factor)",
    );
    expect(files["events.jsonl"]).toContain("trainingBonusSources");
    expect(files["training.csv"]).toContain("trainingCostFactor");
  });
  it("uses current equipment and bonuses only when the queued job actually starts", () => {
    let s = { ...ready(), nodes: ["trainingPlan"] as GameState["nodes"] };
    s = queueTraining(s, "quality");
    const queued = s.trainingQueue;
    expect(exactEconomyValue(s, "data").toNumber()).toBe(1e6);
    s = createItem(s, "logic-seed", "rare");
    s = equip(s, s.inventory[0].id);
    const quote = trainingCostQuote(s, "quality"),
      started = startQueuedTrainingIfAffordable(s);
    expect(queued).toEqual([{ track: "quality", targetLevel: 1 }]);
    expect(started.trainingQueue).toEqual([]);
    expect(started.activeTraining?.dataCostExact).toEqual(quote.cost.toJSON());
    expect(started.activeTraining?.costBasis?.sources).toEqual(quote.sources);
  });
  it("starts the next queued job once on the regular simulation step after completion", () => {
    let s = { ...ready(), nodes: ["trainingPlan"] as GameState["nodes"] };
    s = startTraining(s, "quality");
    s = queueTraining(s, "efficiency");
    s = createItem(s, "logic-seed", "rare");
    s = equip(s, s.inventory.at(-1)!.id);
    const expected = trainingCostQuote(s, "efficiency"),
      before = exactEconomyValue(s, "data"),
      done = advance(s, 91).state;
    expect(done.qualityLevel).toBe(1);
    expect(done.activeTraining?.track).toBe("efficiency");
    expect(done.activeTraining?.dataCostExact).toEqual(expected.cost.toJSON());
    expect(done.activeTraining?.startedAt).toBe(90000);
    expect(done.trainingQueue).toEqual([]);
    expect(
      before.subtract(expected.cost).compare(exactEconomyValue(done, "data")),
    ).toBeLessThan(0);
    expect(
      done.telemetry.recentEvents.filter((e) => e.type === "training-start"),
    ).toHaveLength(2);
    expect(importGame(serialize(done)).activeTraining).toEqual(
      done.activeTraining,
    );
  });
  it("does not change active costs, duration or user economy after equipment changes, expiry and reload", () => {
    const s = { ...withItem(), trainingBoostUntil: 1000 },
      started = startTraining(s, "quality"),
      active = started.activeTraining;
    let changed = unequip(started, "core");
    changed = forgeItem(changed, changed.inventory[0].id);
    changed = advance(changed, 2).state;
    expect(changed.activeTraining).toMatchObject({
      costBasis: active!.costBasis,
      dataCostExact: active!.dataCostExact,
      workRequired: 90,
    });
    const loaded = importGame(serialize(changed));
    expect(loaded.activeTraining).toEqual(changed.activeTraining);
    expect(trainingPreview(loaded, "efficiency").factor).toBe(1);
    expect(usersRateScientific(started).toJSON()).toEqual(
      usersRateScientific(s).toJSON(),
    );
    expect(
      creditRateScientific(started.hardware, started.level, started).toJSON(),
    ).toEqual(creditRateScientific(s.hardware, s.level, s).toJSON());
    expect(advance(loaded, 88).state.qualityLevel).toBe(1);
  });
  it("handles levels above native overflow and rejects insufficient Data without any mutation", () => {
    const s = addDataScientific(
        {
          ...newGame(0),
          qualityLevel: 1500,
          level: 1500,
          breakthroughs: ["graph"],
        },
        ScientificNumber.fromParts(1, 1000),
      ),
      p = trainingPreview(s, "quality");
    expect(p.cost.exponent).toBeGreaterThan(308);
    const started = startTraining(s, "quality");
    expect(started.activeTraining?.dataCostExact).toEqual(p.cost.toJSON());
    expect(importGame(serialize(started)).activeTraining).toEqual(
      started.activeTraining,
    );
    expect(
      JSON.parse(createBalanceExportFiles(started)["summary.json"]).jobs
        .training.cost.data.e,
    ).toBeGreaterThan(308);
    const poor = addData(newGame(0), 12);
    expect(startTraining(poor, "quality")).toBe(poor);
    expect(
      startTraining({ ...poor, breakthroughs: ["graph"] }, "quality")
        .activeTraining,
    ).toBeNull();
  });
  it("rejects contradictory saved cost metadata while preserving valid legacy jobs", () => {
    const s = startTraining(ready(), "quality"),
      broken = {
        ...s,
        activeTraining: {
          ...s.activeTraining!,
          costBasis: { ...s.activeTraining!.costBasis!, factor: 0.5 },
        },
      };
    expect(() =>
      importGame(JSON.stringify({ version: SAVE_VERSION, state: broken })),
    ).toThrow(/Trainingskosten/);
    const legacy = {
      ...s,
      activeTraining: { ...s.activeTraining!, costBasis: undefined },
    };
    expect(importGame(serialize(legacy)).activeTraining?.dataCostExact).toEqual(
      s.activeTraining?.dataCostExact,
    );
  });
});
