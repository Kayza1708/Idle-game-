import {
  BALANCE,
  addCreditsScientific,
  creditRateScientific,
  grantComponents,
  componentTotal,
  type GameState,
} from "./economy";
import { createItem } from "./inventory";
import { prepareProgressionWork } from "./progressionWork";
import { settleResearchCompletions } from "./simulation";
import { ScientificNumber, type ScientificJSON } from "./scientificNumber";
import { addEvent } from "./telemetry";
export type ProductId = (typeof BALANCE.commerce.products)[number]["id"];
export type RewardKind = "gems" | "creditDrop" | "research";
export type RewardTicket = {
  id: string;
  kind: RewardKind;
  context: string;
  expiresAt: number;
  job: string | null;
  amount: ScientificJSON;
};
export type CommerceState = {
  gemVideos?:number;
  gemNextAt?:number;
  owned: ProductId[];
  transactions: string[];
  pending: RewardTicket | null;
  day: number;
  counts: Partial<Record<RewardKind, number>>;
  droneNextAt: number;
  last: { id: string; kind: string; amount: string } | null;
};
export const emptyCommerce = (): CommerceState => ({
  owned: [],
  transactions: [],
  pending: null,
  day: 0,
  counts: {},
  droneNextAt: 0,
  last: null,
});
export const commerceState = (s: GameState) => s.commerce ?? emptyCommerce();
export const adFree = (s: GameState) =>
  commerceState(s).owned.includes("ai_singularity.pass.adfree");
export const commerceBlocked = (s: GameState) =>
  !!(s.retention.activeRun || s.challengeSession);
const context = (s: GameState) =>
  JSON.stringify([s.telemetry.campaignId, s.prestigeCount, s.axiomResetCount]);
export const researchJobKey = (
  j: NonNullable<GameState["researchLabs"][number]>,
) => j.jobId ?? `${j.id}:${j.startedAt}`;
export function researchSkipQuote(s: GameState, index: number) {
  const state = s.progression?.version === 2 ? prepareProgressionWork(s) : s,
    lab = state.researchLabs[index],
    seconds = lab ? Math.max(0, (lab.endsAt - s.savedAt) / 1000) : 0;
  return {
    job: lab ? researchJobKey(lab) : null,
    seconds,
    cost: Math.ceil((seconds / 60) * BALANCE.commerce.researchGemsPerMinute),
    allowed: !commerceBlocked(s) && seconds > 0,
  };
}
function skipResearch(s: GameState, job: string, seconds: number) {
  let n = s.progression?.version === 2 ? prepareProgressionWork(s) : s;
  const index = n.researchLabs.findIndex(
      (j) => !!j && researchJobKey(j) === job,
    ),
    lab = n.researchLabs[index];
  if (!lab) return s;
  const remaining = Math.max(0, (lab.endsAt - n.savedAt) / 1000),
    applied = Math.min(remaining, seconds);
  if (applied <= 0) return s;
  if (n.progression?.version === 2) {
    const work = n.progression.work[job];
    if (!work) return s;
    n = {
      ...n,
      progression: {
        ...n.progression,
        work: {
          ...n.progression.work,
          [job]: {
            ...work,
            done: Math.min(work.required, work.done + applied * work.speed),
          },
        },
      },
    };
    n = prepareProgressionWork(n);
  } else
    n = {
      ...n,
      researchLabs: n.researchLabs.map((j, i) =>
        i === index && j
          ? { ...j, endsAt: Math.max(s.savedAt, j.endsAt - applied * 1000) }
          : j,
      ),
    };
  return settleResearchCompletions(n);
}
export function buyResearchSkip(
  s: GameState,
  index: number,
  expectedJob: string,
  expectedCost: number,
) {
  const q = researchSkipQuote(s, index);
  if (
    !q.allowed ||
    q.job !== expectedJob ||
    q.cost !== expectedCost ||
    s.gems < q.cost ||
    !Number.isSafeInteger(q.cost)
  )
    return s;
  const n = skipResearch(s, q.job, q.seconds);
  if (n === s) return s;
  const id = `research:${q.job}`;
  return addEvent(
    {
      ...n,
      gems: s.gems - q.cost,
      gemLedger: [
        ...s.gemLedger,
        { id, at: s.savedAt, amount: -q.cost, source: "research-skip" },
      ],
      commerce: {
        ...commerceState(n),
        last: { id, kind: "research", amount: `${Math.ceil(q.seconds)} s` },
      },
    },
    "gem-purchase",
    s.savedAt,
    { offer: "research-skip", cost: q.cost, jobId: q.job },
  );
}
export function rewardQuote(s: GameState, kind: RewardKind, index = 0) {
  const c = commerceState(s),
    day = Math.max(c.day, Math.floor(s.savedAt / BALANCE.shop.cycleMs)),
    count = day === c.day ? (c.counts[kind] ?? 0) : 0,
    lab = researchSkipQuote(s, index);
  const amount =
    kind === "gems"
      ? ScientificNumber.from(BALANCE.commerce.rewardGems*((((c.gemVideos??0)+1)%BALANCE.seasonV2.droneEvery===0)?BALANCE.seasonV2.droneBonusMultiplier:1))
      : kind === "creditDrop"
        ? creditRateScientific(
            s.hardware,
            s.level,
            s,
            s.savedAt,
            false,
          ).multiplyNumber(BALANCE.commerce.droneSeconds)
        : ScientificNumber.from(
            Math.min(lab.seconds, BALANCE.commerce.researchAdSeconds),
          );
  const cooldown =
    kind === "creditDrop" ? Math.max(0, c.droneNextAt - s.savedAt) : kind === "gems" ? Math.max(0,(c.gemNextAt??0)-s.savedAt) : 0;
  return {
    amount,
    day,
    remaining: Math.max(0, BALANCE.adLimits[kind] - count),
    cooldown,
    job: kind === "research" ? lab.job : null,
    allowed:
      !commerceBlocked(s) &&
      count < BALANCE.adLimits[kind] &&
      (kind!=="gems"||Number.isSafeInteger((c.gemVideos??0)+1))&&
      cooldown === 0 &&
      !amount.isZero() &&
      (kind !== "research" || lab.allowed),
  };
}
export function beginCommerceReward(
  s: GameState,
  kind: RewardKind,
  id: string,
  index = 0,
  expectedJob?: string,
) {
  const c = commerceState(s),
    q = rewardQuote(s, kind, index);
  if (expectedJob !== undefined && q.job !== expectedJob) return s;
  if (
    !id ||
    id.length > 160 ||
    c.transactions.includes(id) ||
    (c.pending &&
      c.pending.context === context(s) &&
      c.pending.expiresAt > s.savedAt) ||
    !q.allowed
  )
    return s;
  return {
    ...s,
    commerce: {
      ...c,
      pending: {
        id,
        kind,
        context: context(s),
        expiresAt: s.savedAt + BALANCE.commerce.ticketMs,
        job: q.job,
        amount: q.amount.toJSON(),
      },
    },
  };
}
export function cancelCommerceReward(s: GameState, id: string) {
  const c = commerceState(s);
  return c.pending?.id === id ? { ...s, commerce: { ...c, pending: null } } : s;
}
export function completeCommerceReward(
  s: GameState,
  id: string,
  result: "success" | "cancel" | "error",
) {
  const c = commerceState(s),
    t = c.pending;
  if (!t || t.id !== id) return s;
  const cancelled = cancelCommerceReward(s, id);
  if (
    result !== "success" ||
    commerceBlocked(s) ||
    t.context !== context(s) ||
    s.savedAt > t.expiresAt ||
    c.transactions.includes(id)
  )
    return cancelled;
  const index = t.job
      ? s.researchLabs.findIndex((j) => !!j && researchJobKey(j) === t.job)
      : 0,
    q = rewardQuote(cancelled, t.kind, index);
  if (!q.allowed) return cancelled;
  const value = ScientificNumber.fromJSON(t.amount);
  let n = cancelled;
  if (t.kind === "research") {
    n = skipResearch(
      n,
      t.job!,
      Math.min(value.toNumber(), q.amount.toNumber()),
    );
    if (n === cancelled) return cancelled;
  }
  if (t.kind === "creditDrop") n = addCreditsScientific(n, value, false, false);
  if (t.kind === "gems") {
    const amount = value.toNumber();
    if (!Number.isSafeInteger(n.gems + amount)) return cancelled;
    n = {
      ...n,
      gems: n.gems + amount,
      gemLedger: [
        ...n.gemLedger,
        { id, at: s.savedAt, amount, source: "rewarded-gems" },
      ],
    };
  }
  return addEvent(
    {
      ...n,
      commerce: {
        ...c,
        pending: null,
        gemVideos:(c.gemVideos??0)+(t.kind==="gems"?1:0),
        gemNextAt:t.kind==="gems"?s.savedAt+BALANCE.commerce.gemVideoCooldownMs:c.gemNextAt,
        day: q.day,
        counts: {
          ...(q.day === c.day ? c.counts : {}),
          [t.kind]: (q.day === c.day ? (c.counts[t.kind] ?? 0) : 0) + 1,
        },
        transactions: [...c.transactions, id],
        droneNextAt:
          t.kind === "creditDrop"
            ? s.savedAt + BALANCE.commerce.droneCooldownMs
            : c.droneNextAt,
        last: { id, kind: t.kind, amount: value.toScientificString(3) },
      },
    },
    "ad-reward",
    s.savedAt,
    { offer: t.kind, transaction: id },
  );
}
/** Server-verifier output only. Never pass raw storefront receipts to fulfillment. */
export type VerifiedPurchase = {
  productId: ProductId;
  transactionId: string;
  originalTransactionId: string;
  status: "active" | "revoked";
};
export function fulfillVerifiedPurchase(
  s: GameState,
  p: VerifiedPurchase,
  restoring = false,
) {
  if (commerceBlocked(s) || !p.transactionId || !p.originalTransactionId)
    return s;
  const product = BALANCE.commerce.products.find((x) => x.id === p.productId);
  if (!product) return s;
  const c = commerceState(s),
    permanent = product.kind === "adfree" || product.kind === "income" || product.kind === "season";
  if (p.status === "revoked")
    return permanent
      ? {
          ...s,
          commerce: { ...c, owned: c.owned.filter((x) => x !== p.productId) },
        }
      : s;
  if (p.status !== "active" || (restoring && !permanent)) return s;
  // Restoring a permanent right never grants consumables, even on a new device.
  if (permanent) {
    if (c.owned.includes(p.productId)) return s;
    return {
      ...s,
      commerce: {
        ...c,
        owned: [...c.owned, p.productId],
        transactions: c.transactions.includes(p.transactionId)
          ? c.transactions
          : [...c.transactions, p.transactionId],
        last: { id: p.transactionId, kind: product.kind, amount: "0" },
      },
    };
  }
  if (
    c.transactions.includes(p.transactionId) ||
    (product.once && c.owned.includes(p.productId))
  )
    return s;
  const components = Object.values(product.components).reduce<number>(
    (sum, n) => sum + n,
    0,
  );
  if (
    !Number.isSafeInteger(s.gems + product.gems) ||
    !Number.isSafeInteger(componentTotal(s.componentInventory) + components) ||
    !Number.isSafeInteger(s.lifetime.componentsEarned + components) ||
    (product.kind === "starter" &&
      (!Number.isSafeInteger(s.nextId + BALANCE.commerce.starterItems.length) ||
        BALANCE.commerce.starterItems.some((_, i) =>
          s.inventory.some((item) => item.id === `item-${s.nextId + i}`),
        )))
  )
    return s;
  let n = grantComponents(
    {
      ...s,
      gems: s.gems + product.gems,
      gemLedger: product.gems
        ? [
            ...s.gemLedger,
            {
              id: p.transactionId,
              at: s.savedAt,
              amount: product.gems,
              source: product.id,
            },
          ]
        : s.gemLedger,
    },
    product.components,
  );
  if (product.kind === "starter")
    for (const item of BALANCE.commerce.starterItems)
      n = createItem(n, item.type, item.rarity);
  return addEvent(
    {
      ...n,
      commerce: {
        ...c,
        owned: product.once ? [...c.owned, p.productId] : c.owned,
        transactions: [...c.transactions, p.transactionId],
        last: {
          id: p.transactionId,
          kind: product.kind,
          amount: String(product.gems),
        },
      },
    },
    "gem-purchase",
    s.savedAt,
    {
      offer: product.id,
      transaction: p.transactionId,
      source: "verified-store",
    },
  );
}

export function purchaseFulfilled(s: GameState, p: VerifiedPurchase) {
  const c = commerceState(s);
  return p.status === "revoked"
    ? !c.owned.includes(p.productId)
    : p.productId === "ai_singularity.pass.adfree" ||
        p.productId === "ai_singularity.pass.income" || p.productId.startsWith("ai_singularity.season.")
      ? c.owned.includes(p.productId)
      : c.transactions.includes(p.transactionId);
}
