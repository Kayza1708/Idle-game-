import { describe, it, expect } from "vitest";
import {
  newGame,
  buyHardwareClass,
  exactEconomyValue,
  addData,
} from "./economy";
import { advance } from "./simulation";
import { serialize, restore } from "./storage";
import { ScientificNumber as S } from "./scientificNumber";
import { configureResearchDirector } from "./researchAutomation";
import { buyNode } from "./prestige";
import { runNaturalProfile } from "../scripts/natural-progression-profile";

describe("V2 real simulation continuity", () => {
  it("processes eight hours with over 32 Axioms across one, three and 96 saved chunks", () => {
    let base = buyHardwareClass(newGame(0, "v2-eight-hour"), "calculator");
    base = {
      ...base,
      axiomResetCount: 1,
      availableAxioms: 1e6,
      totalAxiomsEarned: 1e6,
      axioms: 1e6,
      exactAxioms: {
        available: S.from(1e6).toJSON(),
        total: S.from(1e6).toJSON(),
      },
      axiomUpgradeLevels: { ...base.axiomUpgradeLevels, B06: 1 },
      researchLevels: {
        ...base.researchLevels,
        commercialization: 500,
        modelArchitecture: 500,
      },
      progression: { ...base.progression, axiomAuto: true },
    };
    function run(parts: number) {
      let s = base;
      for (let i = 0; i < parts; i++) {
        s = advance(s, 28800 / parts, false, () => 0.5).state;
        const loaded = restore(serialize(s), s.savedAt);
        expect(loaded.error).toBeUndefined();
        s = loaded.state;
      }
      return s;
    }
    const whole = run(1);
    expect(whole.savedAt).toBe(28800000);
    expect(whole.axiomResetCount - base.axiomResetCount).toBeGreaterThan(32);
    for (const split of [run(3), run(96)]) {
      expect(split.axiomResetCount).toBe(whole.axiomResetCount);
      expect(split.hardwareCounts).toEqual(whole.hardwareCounts);
      expect(split.progression.axiomCycleStartedAt).toBe(
        whole.progression.axiomCycleStartedAt,
      );
      for (const key of [
        "credits",
        "data",
        "cycleEligibleCredits",
        "cycleINTEarned",
      ] as const) {
        const a = exactEconomyValue(split, key),
          b = exactEconomyValue(whole, key);
        expect(a.isZero()).toBe(b.isZero());
        if (!b.isZero()) expect(a.divide(b).toNumber()).toBeCloseTo(1, 10);
      }
      expect(split.progression.rng).toBe(whole.progression.rng);
      expect(split.progression.materialRng).toBe(whole.progression.materialRng);
    }
  }, 60000);
  it("starts F05 director jobs through the real elapsed-time scheduler", () => {
    let s = newGame(0);
    s = {
      ...s,
      unspentINT: 1e6,
      cycleINTEarned: 1e6,
      totalINTEarned: 1e6,
      exactEconomy: {
        ...s.exactEconomy,
        unspentINT: S.from(1e6).toJSON(),
        cycleINTEarned: S.from(1e6).toJSON(),
        totalINTEarned: S.from(1e6).toJSON(),
      },
    };
    s = buyNode(s, "F05");
    s = addData(s, 10000);
    s = configureResearchDirector(s, {
      enabled: true,
      budget: S.from(10000).toJSON(),
      entries: [{ id: "dataGeneration", targetLevel: 2 }],
    });
    s = advance(s, 11).state;
    expect(s.lifetime.researchStarted).toBeGreaterThan(0);
    expect(s.researchDirector.spent.m).toBeGreaterThanOrEqual(0);
    expect(restore(serialize(s), s.savedAt).error).toBeUndefined();
  });
  it("runs a fresh production profile with real three-per-second input and reload", () => {
    const p = runNaturalProfile({
      play: "continuous",
      priority: "model-first",
      seed: 1708,
      seconds: 300,
      tapsPerSecond: 3,
      claimRewards: true,
      build: "chip",
    });
    expect(p.taps).toBe(900);
    expect(p.reload).toBe(true);
    expect(p.tapIncome.relativeError).toBeLessThan(1e-9);
    expect(p.balances.relativeDataError).toBeLessThan(1e-10);
  });
});
