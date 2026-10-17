import { describe, it, expect } from "vitest";
import {
  newGame,
  addCreditsScientific,
  addDataScientific,
  startTraining,
  queueTraining,
  removeQueuedTraining,
  canQueueTraining,
  exactEconomyValue,
  newINTScientific,
  buyHardwareClass,
  type GameState,
} from "./economy";
import { buyNode, prestige, axiomReset } from "./prestige";
import { ScientificNumber as S } from "./scientificNumber";
import { advance } from "./simulation";
import { serialize, restore, SAVE_VERSION } from "./storage";
import {
  balanceHistoryReport,
  BALANCE_HISTORY_LIMITS,
  balanceCheckpoint,
} from "./balanceHistory";
import { createBalanceExportFiles, createBalanceZip } from "./balanceReport";
import { addEvent } from "./telemetry";
import { startRunChallenge, abortRunChallenge } from "./retention";
const reload = (s: GameState) => {
  const r = restore(serialize(s), s.savedAt);
  expect(r.error).toBeUndefined();
  return r.state;
};
function funded() {
  let s = newGame(0, "v2-stability");
  s = {
    ...s,
    unspentINT: 2e6,
    totalINTEarned: 2e6,
    cycleINTEarned: 2e6,
    exactEconomy: {
      ...s.exactEconomy,
      unspentINT: S.from(2e6).toJSON(),
      totalINTEarned: S.from(2e6).toJSON(),
      cycleINTEarned: S.from(2e6).toJSON(),
    },
  };
  return addDataScientific(
    addCreditsScientific(s, S.fromString("1e50"), false, false),
    S.fromString("1e20"),
  );
}
const queued = () => buyNode(buyNode(funded(), "T03"), "T04");
function earnReset(s: GameState) {
  return addCreditsScientific(
    s,
    exactEconomyValue(s, "cycleEligibleCredits")
      .multiplyNumber(2)
      .add(S.from(765100329.5513278 * 100)),
  );
}
describe("real V2 training queue contracts", () => {
  it("persists, pays and completes all three tracks once through split offline progress", () => {
    let s = startTraining(queued(), "quality");
    s = queueTraining(queueTraining(s, "integration"), "efficiency");
    expect(s.trainingQueue.map((j) => j.track)).toEqual([
      "integration",
      "efficiency",
    ]);
    const original = s;
    s = reload(s);
    s = advance(s, 10, false).state;
    s = reload(s);
    s = advance(s, 2000, false).state;
    expect([s.qualityLevel, s.efficiencyLevel, s.integrationLevel]).toEqual([
      1, 1, 1,
    ]);
    expect(s.lifetime.trainingStarted).toBe(3);
    expect(s.lifetime.trainingCompleted).toBe(3);
    expect(s.trainingQueue).toEqual([]);
    const done = reload(s);
    expect(advance(done, 1).state.lifetime.trainingCompleted).toBe(3);
    expect(original.trainingQueue).toHaveLength(2);
    expect(original.integrationLevel).toBe(0);
    expect(
      balanceHistoryReport(s).current?.events["training-complete:integration"],
    ).toBe(1);
  });
  it("numbers same-track targets and removes dependent successors without losing other tracks", () => {
    let s = startTraining(queued(), "integration");
    s = queueTraining(queueTraining(s, "integration"), "integration");
    expect(s.trainingQueue.map((j) => j.targetLevel)).toEqual([2, 3]);
    s = removeQueuedTraining(s, 0);
    expect(s.trainingQueue).toEqual([]);
    s = queueTraining(queueTraining(s, "integration"), "efficiency");
    s = removeQueuedTraining(s, 0);
    expect(s.trainingQueue.map((j) => j.track)).toEqual(["efficiency"]);
    reload(s);
  });
  it("does not strand later jobs when manual training satisfies the first queued target", () => {
    let s = queueTraining(queued(), "quality");
    s = startTraining(s, "quality");
    s = queueTraining(s, "quality");
    expect(s.trainingQueue.map((j) => j.targetLevel)).toEqual([1, 2]);
    s = advance(reload(s), 2000).state;
    expect(s.qualityLevel).toBe(2);
    expect(s.lifetime.trainingStarted).toBe(2);
    expect(s.trainingQueue).toEqual([]);
    reload(s);
  });
  it("rebases an older unpaid queue gap without double-paying a completed level", () => {
    let s = queued();
    s = {
      ...s,
      qualityLevel: 1,
      level: 1,
      trainingQueue: [
        { track: "quality", targetLevel: 1 },
        { track: "efficiency", targetLevel: 3 },
      ],
    };
    s = advance(reload(s), 1000).state;
    expect(s.qualityLevel).toBe(1);
    expect(s.efficiencyLevel).toBe(1);
    expect(s.trainingQueue).toEqual([]);
    expect(s.lifetime.trainingStarted).toBe(1);
    reload(s);
  });
  it("rejects locked, capped and unknown tracks before adding an unpaid job", () => {
    const s = buyNode(funded(), "T03");
    expect(queueTraining(s, "integration")).toBe(s);
    expect(queueTraining(s, "oops" as "quality")).toBe(s);
    let cap = { ...queued(), integrationLevel: 199 };
    cap = addDataScientific(
      addCreditsScientific(cap, S.fromString("1e400"), false, false),
      S.fromString("1e400"),
    );
    cap = startTraining(cap, "integration");
    expect(cap.activeTraining?.track).toBe("integration");
    expect(canQueueTraining(cap, "integration")).toBe(false);
    expect(queueTraining(cap, "integration")).toBe(cap);
  });
  it("waits for Integration data without charging credits, then pays once", () => {
    let s = queued();
    s = {
      ...s,
      data: 0,
      exactEconomy: { ...s.exactEconomy, data: S.zero().toJSON() },
    };
    const credits = exactEconomyValue(s, "credits");
    s = queueTraining(s, "integration");
    s = advance(reload(s), 1).state;
    expect(s.activeTraining).toBeNull();
    expect(exactEconomyValue(s, "credits").compare(credits)).toBe(0);
    s = addDataScientific(s, S.from(1e9));
    s = advance(reload(s), 1).state;
    expect(s.activeTraining?.track).toBe("integration");
    expect(s.lifetime.trainingStarted).toBe(1);
    reload(s);
  });
  it("drops unpaid queues on reset and retains a paid Integration job only with T08", () => {
    for (const archive of [false, true]) {
      let s = queued();
      if (archive) s = buyNode(s, "T08");
      s = startTraining(s, "integration");
      s = queueTraining(s, "quality");
      s = advance(s, 5).state;
      const paid = s.activeTraining;
      s = prestige(earnReset(s));
      expect(s.trainingQueue).toEqual([]);
      expect(s.activeTraining).toEqual(archive ? paid : null);
      s = advance(reload(s), 1000).state;
      expect(s.integrationLevel).toBe(archive ? 1 : 0);
      reload(s);
    }
  });
});
describe("durable balance measurements across real resets", () => {
  it("retains three runs and scientific rewards through reload and event eviction", () => {
    let s = balanceCheckpoint(newGame(0, "multi-prestige"));
    const rewards = [];
    for (let i = 0; i < 3; i++) {
      s = advance(s, 30, true).state;
      s = earnReset(s);
      rewards.push(newINTScientific(s).toJSON());
      s = reload(prestige(s));
    }
    for (let i = 0; i < 510; i++)
      s = addEvent(s, "action-blocked", s.savedAt, {
        action: "research",
        reason: "data",
      });
    const h = balanceHistoryReport(reload(s));
    expect(h.runs).toHaveLength(3);
    expect(h.runs.map((r) => r.intReward)).toEqual(rewards);
    expect(h.runs.map((r) => r.activeSeconds)).toEqual([30, 30, 30]);
    expect(h.runs.every((r) => !r.partial)).toBe(true);
    expect(new Set(h.runs.map((r) => r.id)).size).toBe(3);
    expect(h.current?.events["action-blocked:research:data"]).toBe(510);
    expect(s.telemetry.recentEvents.length).toBe(500);
    const files = createBalanceExportFiles(s, s.savedAt);
    expect(JSON.parse(files["balance-history.json"]).runs).toHaveLength(3);
    expect(files["runs.csv"]).toContain("axiomCycle");
    expect(files["run-checkpoints.csv"]).toContain("scientificCreditRate");
    expect(files["prestige-comparisons.csv"]).toContain("intPerActiveHour");
  });
  it("closes Axiom cycles independently of the ordinary prestige counter", () => {
    let s = funded();
    s = {
      ...s,
      axiomResetCount: 1,
      progression: { ...s.progression, entitlement: S.from(2e6).toJSON() },
    };
    s = advance(s, 30, false).state;
    s = axiomReset(s);
    expect(s.axiomResetCount).toBe(2);
    const h = balanceHistoryReport(reload(s));
    expect(h.runs.at(-1)?.kind).toBe("axiom");
    expect(h.runs.at(-1)?.axiomReward).not.toBeNull();
    expect(h.current?.cycle).toBe(2);
    expect(h.current?.startedAt).toBe(s.savedAt);
    expect(h.current?.partial).toBe(false);
  });
  it("assigns per-slice production and time before an automatic reset", () => {
    let s = buyHardwareClass(buyNode(funded(), "I06"), "calculator");
    s = earnReset(s);
    s = {
      ...s,
      prestigeAgent: {
        ...s.prestigeAgent,
        enabled: true,
        minimumRunMinutes: 15,
        minimumReward: S.from(1).toJSON(),
        waitForTraining: false,
        waitForAnalysis: false,
      },
      progression: { ...s.progression, maximumRunSeconds: 900 },
    };
    const before = JSON.stringify(s);
    s = advance(s, 930, true).state;
    expect(s.prestigeCount).toBeGreaterThan(0);
    const h = balanceHistoryReport(reload(s));
    expect(h.runs[0].activeSeconds).toBe(900);
    expect(h.runs[0].automatic).toBe(true);
    expect(
      h.runs.reduce((n, r) => n + r.activeSeconds, 0) +
        (h.current?.activeSeconds ?? 0),
    ).toBe(930);
    expect(h.runs[0].production.credits.m).toBeGreaterThan(0);
    expect(before).toContain("v2-stability");
  });
  it("keeps measurements bounded and archives totals without merging distinct run ids", () => {
    let s = balanceCheckpoint(newGame(0, "bounded"));
    for (let i = 0; i < 105; i++) {
      for (let j = 0; j < 40; j++)
        s = balanceCheckpoint({ ...s, savedAt: s.savedAt + 300000 });
      s = earnReset(s);
      s = prestige(s);
    }
    for (let i = 0; i < 510; i++)
      s = addEvent(s, "action-blocked", s.savedAt, {
        action: "research",
        reason: "data",
      });
    const h = balanceHistoryReport(reload(s));
    expect(h.runs).toHaveLength(BALANCE_HISTORY_LIMITS.runs);
    expect(h.archived.runs).toBe(5);
    expect(h.archived.prestiges).toBe(5);
    expect(h.archived.intReward.m).toBeGreaterThan(0);
    const files = createBalanceExportFiles(s, s.savedAt);
    expect(JSON.parse(files["balance-history.json"]).runs).toHaveLength(100);
    expect(JSON.parse(files["summary.json"]).multiPrestige).toMatchObject({
      file: "balance-history.json",
      completedRuns: 100,
    });
    expect(createBalanceZip(s, s.savedAt).length).toBeLessThan(8 * 1024 * 1024);
  }, 15000);
  it("marks old saves as partial and rejects malformed current history without repairing it", () => {
    let s = advance(newGame(0), 30).state;
    const old = JSON.parse(serialize(s));
    old.version = 61;
    delete old.state.telemetry.balanceHistory;
    const migrated = restore(JSON.stringify(old), s.savedAt);
    expect(migrated.error).toBeUndefined();
    s = reload(migrated.state);
    expect(balanceHistoryReport(s).current?.partial).toBe(true);
    expect(s.progression.version).toBe(2);
    expect(s.exactEconomy).toEqual(old.state.exactEconomy);
    const current = JSON.parse(serialize(s));
    expect(current.version).toBe(SAVE_VERSION);
    current.state.telemetry.balanceHistory.runs = [{}];
    expect(restore(JSON.stringify(current), s.savedAt).error).toBeTruthy();
    delete current.state.telemetry.balanceHistory;
    expect(restore(JSON.stringify(current), s.savedAt).error).toBeTruthy();
  });
  it("exports scientific balances above native number range without changing state or RNG", () => {
    let s = balanceCheckpoint(newGame(0));
    s = addCreditsScientific(s, S.fromString("1e350"));
    s = prestige(s);
    const before = JSON.stringify(s),
      files = createBalanceExportFiles(s, s.savedAt);
    const history = JSON.parse(files["balance-history.json"]);
    expect(
      S.fromJSON(history.runs[0].end.balances.runCreditsEarned).compare(
        S.fromString("1e350"),
      ),
    ).toBe(0);
    expect(
      S.fromJSON(history.runs[0].intReward).compare(S.fromString("1e100")),
    ).toBeGreaterThan(0);
    expect(createBalanceZip(s, s.savedAt).length).toBeLessThan(8 * 1024 * 1024);
    expect(JSON.stringify(s)).toBe(before);
  });
  it("retains run boundaries when periodic checkpoints are thinned", () => {
    let s = balanceCheckpoint(newGame(0, "checkpoints"));
    for (let i = 1; i <= 80; i++)
      s = balanceCheckpoint({ ...s, savedAt: i * 300000 });
    expect(
      s.telemetry.balanceHistory?.current?.checkpoints.length,
    ).toBeLessThanOrEqual(32);
    expect(
      s.telemetry.balanceHistory?.current?.droppedCheckpoints,
    ).toBeGreaterThan(0);
    s = prestige(earnReset(s));
    s = reload(s);
    const run = s.telemetry.balanceHistory!.runs[0];
    expect(run.checkpoints.length).toBeLessThanOrEqual(12);
    expect(run.checkpoints[0].at).toBe(0);
    expect(run.checkpoints.at(-1)?.at).toBe(80 * 300000);
    expect(run.droppedCheckpoints).toBeGreaterThan(0);
  });
  it("excludes isolated challenge income, taps and training from the main history", () => {
    let s = funded();
    s = {
      ...s,
      prestigeCount: 1,
      lifetime: { ...s.lifetime, hardwareClasses: ["calculator", "sbc"] },
    };
    s = balanceCheckpoint(s);
    const before = s.telemetry.balanceHistory;
    s = startRunChallenge(s, "no-taps", 1);
    expect(s.retention.activeRun).not.toBeNull();
    s = advance(s, 60, false).state;
    s = prestige(addCreditsScientific(s, S.fromString("1e20")));
    expect(s.prestigeCount).toBe(2);
    s = abortRunChallenge(s);
    expect(
      s.telemetry.challengeArchive?.events.find((e) => e.type === "prestige")
        ?.context,
    ).toBe("challenge");
    expect(s.telemetry.balanceHistory?.current?.production).toEqual(
      before?.current?.production,
    );
    expect(s.telemetry.balanceHistory?.current?.offlineSeconds).toBe(0);
    reload(s);
  });
});
