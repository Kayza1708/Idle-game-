import type { GameState } from "./economy";
import type { TelemetryEvent } from "./telemetry";
import { economySnapshot } from "./economySnapshot";
import { ScientificNumber as S, type ScientificJSON } from "./scientificNumber";

// Measurement limits, not game balance. Bounded independently of transient event receipts.
export const BALANCE_HISTORY_LIMITS = {
  runs: 100,
  checkpointsPerRun: 12,
  checkpointsCurrent: 32,
  eventKeys: 100,
};
export type BalancePoint = {
  at: number;
  balances: ReturnType<typeof economySnapshot>["balances"];
  rates: Record<"credits" | "data" | "users" | "compute", ScientificJSON>;
  quality: number;
  efficiency: number;
  integration: number;
  hardware: GameState["hardwareCounts"];
  nodes: string[];
  research: GameState["researchLevels"];
  activeModel: string | null;
  modelLevels: GameState["progression"]["models"] | null;
  equipped: GameState["equipped"];
  items: {
    id: string;
    type: string;
    rarity: string;
    level: number;
    forge: number;
  }[];
  gems: number;
  paidIncome: boolean;
  adFree: boolean;
};
export type BalanceCheckpoint = Pick<
  BalancePoint,
  "at" | "rates" | "quality" | "efficiency" | "integration" | "activeModel"
> & {
  credits: ScientificJSON;
  data: ScientificJSON;
  runCredits: ScientificJSON;
  cycleINT: ScientificJSON;
  nodes: number;
  items: number;
  labs: number;
  training: string | null;
};
export type BalanceRun = {
  id: string;
  run: number;
  cycle: number;
  startedAt: number | null;
  observedFrom: number;
  endedAt: number | null;
  kind: "current" | "prestige" | "axiom";
  partial: boolean;
  activeSeconds: number;
  offlineSeconds: number;
  taps: number;
  production: { credits: ScientificJSON; data: ScientificJSON };
  spending: Record<string, { credits: ScientificJSON; data: ScientificJSON }>;
  jobSeconds: Record<string, { count: number; seconds: number }>;
  droppedEventKinds: number;
  events: Record<string, number>;
  firstEvents: Record<string, number>;
  checkpoints: BalanceCheckpoint[];
  droppedCheckpoints: number;
  start: BalancePoint;
  end: BalancePoint | null;
  intReward: ScientificJSON | null;
  axiomReward: ScientificJSON | null;
  automatic: boolean | null;
};
export type BalanceHistory = {
  version: 1;
  measuredSince: number;
  current: BalanceRun | null;
  runs: BalanceRun[];
  archived: {
    runs: number;
    prestiges: number;
    axioms: number;
    activeSeconds: number;
    offlineSeconds: number;
    intReward: ScientificJSON;
    axiomReward: ScientificJSON;
  };
};
const zero = (): ScientificJSON => ({ m: 0, e: 0 });
export const newBalanceHistory = (at: number): BalanceHistory => ({
  version: 1,
  measuredSince: at,
  current: null,
  runs: [],
  archived: {
    runs: 0,
    prestiges: 0,
    axioms: 0,
    activeSeconds: 0,
    offlineSeconds: 0,
    intReward: zero(),
    axiomReward: zero(),
  },
});
export function balancePoint(s: GameState): BalancePoint {
  const e = economySnapshot(s);
  return {
    at: s.savedAt,
    balances: e.balances,
    rates: {
      credits: e.credits.rate,
      data: e.data.rate,
      users: e.users.rate,
      compute: e.compute.rate,
    },
    quality: s.qualityLevel,
    efficiency: s.efficiencyLevel,
    integration: s.integrationLevel ?? 0,
    hardware: { ...s.hardwareCounts },
    nodes: [...s.nodes],
    research: { ...s.researchLevels },
    activeModel: s.progression?.active ?? null,
    modelLevels: s.progression ? structuredClone(s.progression.models) : null,
    equipped: { ...s.equipped },
    items: s.inventory
      .filter((i) => Object.values(s.equipped).includes(i.id))
      .map((i) => ({
        id: i.id,
        type: i.type,
        rarity: i.rarity,
        level: i.level,
        forge: i.forge ?? 0,
      })),
    gems: s.gems,
    paidIncome:
      s.commerce?.owned.includes("ai_singularity.pass.income") ?? false,
    adFree: s.commerce?.owned.includes("ai_singularity.pass.adfree") ?? false,
  };
}
const runId = (s: GameState) =>
  `${s.telemetry.campaignId}:main:${s.axiomResetCount}:${s.prestigeCount}`;
function ensure(s: GameState) {
  const h = s.telemetry.balanceHistory ?? newBalanceHistory(s.savedAt);
  if (h.current?.id === runId(s)) return h;
  const r: BalanceRun = {
    id: runId(s),
    run: s.prestigeCount,
    cycle: s.axiomResetCount,
    startedAt: s.telemetry.runStartedAt,
    observedFrom: s.savedAt,
    endedAt: null,
    kind: "current",
    partial:
      s.telemetry.runStartedAt === null || s.savedAt > s.telemetry.runStartedAt,
    activeSeconds: 0,
    offlineSeconds: 0,
    taps: 0,
    production: { credits: zero(), data: zero() },
    spending: {},
    jobSeconds: {},
    droppedEventKinds: 0,
    events: {},
    firstEvents: {},
    checkpoints: [],
    droppedCheckpoints: 0,
    start: balancePoint(s),
    end: null,
    intReward: null,
    axiomReward: null,
    automatic: null,
  };
  return { ...h, current: r };
}
const withHistory = (s: GameState, h: BalanceHistory): GameState => ({
  ...s,
  telemetry: { ...s.telemetry, balanceHistory: h },
});
/** Challenge simulations own separate telemetry; never count them as campaign runs. */
export function balanceEvent(s: GameState, e: TelemetryEvent): GameState {
  if (s.retention.activeRun || s.progression?.version !== 2) return s;
  const h = ensure(s),
    r = h.current!,
    suffix = e.type.startsWith("training-")
      ? String(e.details.track)
      : e.type === "action-blocked"
        ? `${e.details.action ?? "unknown"}:${e.details.reason ?? "unknown"}`
        : null,
    key = suffix ? `${e.type}:${suffix}` : e.type;
  if (
    !(key in r.events) &&
    Object.keys(r.events).length >= BALANCE_HISTORY_LIMITS.eventKeys
  )
    return withHistory(s, {
      ...h,
      current: { ...r, droppedEventKinds: r.droppedEventKinds + 1 },
    });
  const spending = { ...r.spending },
    jobSeconds = { ...r.jobSeconds };
  const amount = (exact: unknown, projection: unknown) => {
    try {
      return typeof exact === "string"
        ? S.fromString(exact)
        : typeof projection === "number" &&
            Number.isFinite(projection) &&
            projection >= 0
          ? S.from(projection)
          : S.zero();
    } catch {
      return S.zero();
    }
  };
  if (
    [
      "training-start",
      "research-start",
      "experiment-start",
      "crafting_queued",
    ].includes(e.type)
  ) {
    const previous = spending[key] ?? { credits: zero(), data: zero() };
    spending[key] = {
      credits: S.fromJSON(previous.credits)
        .add(amount(e.details.exactCreditCost, e.details.creditCost))
        .toJSON(),
      data: S.fromJSON(previous.data)
        .add(amount(e.details.exactDataCost, e.details.dataCost))
        .toJSON(),
    };
  }
  const duration = e.details.actualDuration ?? e.details.actualDurationSeconds;
  if (
    e.type.endsWith("-complete") &&
    typeof duration === "number" &&
    Number.isFinite(duration) &&
    duration >= 0
  ) {
    const previous = jobSeconds[key] ?? { count: 0, seconds: 0 };
    jobSeconds[key] = {
      count: previous.count + 1,
      seconds: previous.seconds + duration,
    };
  }
  return withHistory(s, {
    ...h,
    current: {
      ...r,
      spending,
      jobSeconds,
      events: { ...r.events, [key]: (r.events[key] ?? 0) + 1 },
      firstEvents: { ...r.firstEvents, [key]: r.firstEvents[key] ?? e.at },
    },
  });
}
/** Called per integration slice before any automated reset, with scientific production. */
export function balanceProduction(
  s: GameState,
  seconds: number,
  active: boolean,
  offline: boolean,
  credits: ScientificJSON,
  data: ScientificJSON,
): GameState {
  if (s.retention.activeRun || s.progression?.version !== 2) return s;
  const h = ensure(s),
    r = h.current!;
  return withHistory(s, {
    ...h,
    current: {
      ...r,
      activeSeconds: r.activeSeconds + (active ? seconds : 0),
      offlineSeconds: r.offlineSeconds + (offline ? seconds : 0),
      production: {
        credits: S.fromJSON(r.production.credits)
          .add(S.fromJSON(credits))
          .toJSON(),
        data: S.fromJSON(r.production.data).add(S.fromJSON(data)).toJSON(),
      },
    },
  });
}
export function balanceTaps(s: GameState, taps: number): GameState {
  if (!taps || s.retention.activeRun || s.progression?.version !== 2) return s;
  const h = ensure(s),
    r = h.current!;
  return withHistory(s, { ...h, current: { ...r, taps: r.taps + taps } });
}
export function balanceCheckpoint(s: GameState, force = false): GameState {
  if (s.retention.activeRun || s.progression?.version !== 2) return s;
  const h = ensure(s),
    r = h.current!,
    last = r.checkpoints.at(-1);
  if (!force && last && s.savedAt - last.at < 300000)
    return h === s.telemetry.balanceHistory ? s : withHistory(s, h);
  const p = balancePoint(s),
    point: BalanceCheckpoint = {
      at: p.at,
      rates: p.rates,
      quality: p.quality,
      efficiency: p.efficiency,
      integration: p.integration,
      activeModel: p.activeModel,
      credits: p.balances.credits,
      data: p.balances.data,
      runCredits: p.balances.runCreditsEarned,
      cycleINT: p.balances.cycleINTEarned,
      nodes: s.nodes.length,
      items: s.inventory.length,
      labs: s.researchLabs.filter(Boolean).length,
      training: s.activeTraining?.track ?? null,
    };
  let checkpoints = [...r.checkpoints, point],
    dropped = 0;
  if (checkpoints.length > BALANCE_HISTORY_LIMITS.checkpointsCurrent) {
    const old = checkpoints;
    checkpoints = old.filter(
      (_, i) => i === 0 || i === old.length - 1 || i % 2 === 0,
    );
    dropped = old.length - checkpoints.length;
  }
  return withHistory(s, {
    ...h,
    current: {
      ...r,
      checkpoints,
      droppedCheckpoints: r.droppedCheckpoints + dropped,
    },
  });
}
export function closeBalanceRun(
  before: GameState,
  after: GameState,
  kind: "prestige" | "axiom",
  intReward: ScientificJSON,
  axiomReward: ScientificJSON | null = null,
): GameState {
  if (before.retention.activeRun || before.progression?.version !== 2)
    return after;
  const measured = balanceCheckpoint(before, true),
    h = ensure(measured),
    r = h.current!,
    limit = BALANCE_HISTORY_LIMITS.checkpointsPerRun;
  const checkpoints = r.checkpoints
    .filter(
      (_, i, a) =>
        i === 0 ||
        i === a.length - 1 ||
        i % Math.max(1, Math.ceil((a.length - 2) / (limit - 2))) === 0,
    )
    .slice(-limit);
  const closed: BalanceRun = {
    ...r,
    endedAt: before.savedAt,
    kind,
    end: balancePoint(before),
    intReward,
    axiomReward,
    automatic: !!before.progression.resetIntent,
    checkpoints,
    droppedCheckpoints:
      r.droppedCheckpoints + r.checkpoints.length - checkpoints.length,
  };
  const all = [...h.runs, closed],
    dropped = all.slice(0, -BALANCE_HISTORY_LIMITS.runs),
    archived = { ...h.archived };
  for (const old of dropped) {
    archived.runs++;
    archived.prestiges += old.kind === "prestige" ? 1 : 0;
    archived.axioms += old.kind === "axiom" ? 1 : 0;
    archived.activeSeconds += old.activeSeconds;
    archived.offlineSeconds += old.offlineSeconds;
    archived.intReward = S.fromJSON(archived.intReward)
      .add(S.fromJSON(old.intReward ?? zero()))
      .toJSON();
    archived.axiomReward = S.fromJSON(archived.axiomReward)
      .add(S.fromJSON(old.axiomReward ?? zero()))
      .toJSON();
  }
  return balanceCheckpoint(
    withHistory(
      {
        ...after,
        telemetry: { ...after.telemetry, runStartedAt: after.runStartedAt },
      },
      {
        ...h,
        current: null,
        runs: all.slice(-BALANCE_HISTORY_LIMITS.runs),
        archived,
      },
    ),
    true,
  );
}
export function balanceHistoryReport(s: GameState) {
  const measured = balanceCheckpoint(s),
    h = ensure(measured);
  const ratio = (a: ScientificJSON | null, b: ScientificJSON | null) =>
    a && b && !S.fromJSON(b).isZero()
      ? S.fromJSON(a).divide(S.fromJSON(b)).toJSON()
      : null;
  const comparisons = h.runs.map((r, i) => {
    const previous = h.runs
      .slice(0, i)
      .reverse()
      .find((x) => x.kind === r.kind && x.cycle === r.cycle);
    return {
      runId: r.id,
      previousRunId: previous?.id ?? null,
      cycle: r.cycle,
      kind: r.kind,
      partial: r.partial,
      wallSeconds:
        r.startedAt === null || r.endedAt === null
          ? null
          : (r.endedAt - r.startedAt) / 1000,
      activeSeconds: r.activeSeconds,
      offlineSeconds: r.offlineSeconds,
      intPerActiveHour:
        r.intReward && r.activeSeconds > 0
          ? S.fromJSON(r.intReward)
              .multiplyNumber(3600 / r.activeSeconds)
              .toJSON()
          : null,
      intRewardRatio: ratio(r.intReward, previous?.intReward ?? null),
      endCreditRateRatio: ratio(
        r.end?.rates.credits ?? null,
        previous?.end?.rates.credits ?? null,
      ),
      durationRatio:
        previous && previous.activeSeconds > 0
          ? r.activeSeconds / previous.activeSeconds
          : null,
    };
  });
  return {
    ...h,
    comparisons,
    current: h.current ? { ...h.current, end: balancePoint(s) } : null,
    coverage: {
      oldRunsAvailable: s.telemetry.prestigeHistory.length,
      newDetailedRuns: h.runs.length,
      limits: BALANCE_HISTORY_LIMITS,
      spending:
        "observed start/reservation receipts; prefer exact costs, fallback is numeric projection; no inferred refunds or totals for uninstrumented offers",
      production:
        "passive credited production only; tap income is included in exact runCredits balances",
      time: "simulated active/offline seconds; capped-away absence is excluded",
      checkpoints:
        "sampled every five simulated minutes plus run boundaries; thinning is counted",
      legacy:
        "Earlier prestigeHistory remains available; missing detailed history is not reconstructed",
      bottlenecks:
        "blocked actions are observations, not inferred waiting time",
    },
  };
}

/** Current saves are rejected when detailed measurements are malformed; never silently reset them. */
export function validBalanceHistory(value: unknown): value is BalanceHistory {
  try {
    if (!value || typeof value !== "object") return false;
    const h = value as BalanceHistory,
      n = (v: unknown) => typeof v === "number" && Number.isFinite(v) && v >= 0,
      scientific = (v: unknown) => S.isValidJSON(v),
      record = (v: unknown): v is Record<string, unknown> =>
        !!v && typeof v === "object" && !Array.isArray(v),
      counts = (v: unknown) =>
        record(v) &&
        Object.keys(v).length <= BALANCE_HISTORY_LIMITS.eventKeys &&
        Object.values(v).every(n),
      rates = (v: unknown) =>
        record(v) &&
        ["credits", "data", "users", "compute"].every((k) =>
          scientific((v as Record<string, unknown>)[k]),
        );
    const point = (p: BalancePoint) =>
      record(p) &&
      n(p.at) &&
      record(p.balances) &&
      Object.values(p.balances).every(scientific) &&
      rates(p.rates) &&
      n(p.quality) &&
      n(p.efficiency) &&
      n(p.integration) &&
      record(p.hardware) &&
      Object.values(p.hardware).every(n) &&
      Array.isArray(p.nodes) &&
      p.nodes.every((x) => typeof x === "string") &&
      record(p.research) &&
      Object.values(p.research).every(n) &&
      record(p.equipped) &&
      Array.isArray(p.items) &&
      p.items.length <= 20 &&
      p.items.every(
        (i) =>
          record(i) &&
          typeof i.id === "string" &&
          typeof i.type === "string" &&
          typeof i.rarity === "string" &&
          n(i.level) &&
          n(i.forge),
      ) &&
      n(p.gems) &&
      typeof p.paidIncome === "boolean" &&
      typeof p.adFree === "boolean" &&
      (p.activeModel === null || typeof p.activeModel === "string") &&
      (p.modelLevels === null || record(p.modelLevels));
    const checkpoint = (p: BalanceCheckpoint) =>
      record(p) &&
      n(p.at) &&
      rates(p.rates) &&
      [p.credits, p.data, p.runCredits, p.cycleINT].every(scientific) &&
      [p.quality, p.efficiency, p.integration, p.nodes, p.items, p.labs].every(
        n,
      ) &&
      (p.activeModel === null || typeof p.activeModel === "string") &&
      (p.training === null ||
        ["quality", "efficiency", "integration"].includes(p.training));
    const run = (r: BalanceRun, current: boolean) =>
      record(r) &&
      typeof r.id === "string" &&
      [
        r.run,
        r.cycle,
        r.observedFrom,
        r.activeSeconds,
        r.offlineSeconds,
        r.taps,
        r.droppedCheckpoints,
      ].every(n) &&
      (r.startedAt === null || n(r.startedAt)) &&
      (current
        ? r.kind === "current" && r.endedAt === null
        : ["prestige", "axiom"].includes(r.kind) && n(r.endedAt)) &&
      typeof r.partial === "boolean" &&
      record(r.production) &&
      scientific(r.production.credits) &&
      scientific(r.production.data) &&
      n(r.droppedEventKinds) &&
      record(r.spending) &&
      Object.keys(r.spending).length <= BALANCE_HISTORY_LIMITS.eventKeys &&
      Object.values(r.spending).every(
        (v) => record(v) && scientific(v.credits) && scientific(v.data),
      ) &&
      record(r.jobSeconds) &&
      Object.keys(r.jobSeconds).length <= BALANCE_HISTORY_LIMITS.eventKeys &&
      Object.values(r.jobSeconds).every(
        (v) => record(v) && n(v.count) && n(v.seconds),
      ) &&
      counts(r.events) &&
      counts(r.firstEvents) &&
      Array.isArray(r.checkpoints) &&
      r.checkpoints.length <=
        (current
          ? BALANCE_HISTORY_LIMITS.checkpointsCurrent
          : BALANCE_HISTORY_LIMITS.checkpointsPerRun) &&
      r.checkpoints.every(checkpoint) &&
      point(r.start) &&
      (r.end === null || point(r.end)) &&
      (r.intReward === null || scientific(r.intReward)) &&
      (r.axiomReward === null || scientific(r.axiomReward)) &&
      (r.automatic === null || typeof r.automatic === "boolean");
    return (
      h.version === 1 &&
      n(h.measuredSince) &&
      (h.current === null || run(h.current, true)) &&
      Array.isArray(h.runs) &&
      h.runs.length <= BALANCE_HISTORY_LIMITS.runs &&
      h.runs.every((r) => run(r, false)) &&
      record(h.archived) &&
      [
        h.archived.runs,
        h.archived.prestiges,
        h.archived.axioms,
        h.archived.activeSeconds,
        h.archived.offlineSeconds,
      ].every(n) &&
      scientific(h.archived.intReward) &&
      scientific(h.archived.axiomReward)
    );
  } catch {
    return false;
  }
}
export function migrateBalanceHistory(s: GameState): GameState {
  const main = s.challengeSession
    ? migrateBalanceHistory(s.challengeSession.main)
    : null;
  return {
    ...s,
    telemetry: {
      ...s.telemetry,
      balanceHistory:
        s.telemetry.balanceHistory ?? newBalanceHistory(s.savedAt),
    },
    ...(main ? { challengeSession: { ...s.challengeSession!, main } } : {}),
  };
}
export function requireBalanceHistory(s: GameState): void {
  if (
    s.progression?.version === 2 &&
    !validBalanceHistory(s.telemetry?.balanceHistory)
  )
    throw new TypeError("Balance-Historie fehlt oder ist beschädigt.");
  if (s.challengeSession) requireBalanceHistory(s.challengeSession.main);
}
