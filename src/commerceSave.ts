import { BALANCE, type GameState } from "./economy";
import { emptyCommerce, type CommerceState } from "./commerce";
import { ScientificNumber } from "./scientificNumber";
export function validCommerce(value: unknown): value is CommerceState {
  if (!value || typeof value !== "object") return false;
  const c = value as CommerceState;
  const time = (n: unknown) =>
    typeof n === "number" &&
    Number.isFinite(n) &&
    n >= 0 &&
    n <= Number.MAX_SAFE_INTEGER;
  const integer = (n: unknown) => Number.isSafeInteger(n) && Number(n) >= 0;
  const strings = (v: unknown): v is string[] =>
    Array.isArray(v) &&
    v.every((x) => typeof x === "string" && x.length > 0) &&
    new Set(v).size === v.length;
  return (
    strings(c.owned) &&
    c.owned.every((id) =>
      BALANCE.commerce.products.some((p) => p.id === id && p.once),
    ) &&
    strings(c.transactions) &&
    integer(c.day) &&
    time(c.droneNextAt) &&
    !!c.counts &&
    typeof c.counts === "object" &&
    Object.entries(c.counts).every(
      ([k, n]) =>
        ["gems", "creditDrop", "research"].includes(k) &&
        integer(n) &&
        Number(n) <= BALANCE.adLimits[k as keyof typeof c.counts],
    ) &&
    (c.last === null ||
      (!!c.last &&
        typeof c.last.id === "string" &&
        typeof c.last.kind === "string" &&
        typeof c.last.amount === "string")) &&
    (c.pending === null ||
      (!!c.pending &&
        typeof c.pending.id === "string" &&
        c.pending.id.length > 0 &&
        ["gems", "creditDrop", "research"].includes(c.pending.kind) &&
        typeof c.pending.context === "string" &&
        time(c.pending.expiresAt) &&
        (c.pending.job === null || typeof c.pending.job === "string") &&
        ScientificNumber.isValidJSON(c.pending.amount)))
  );
}
export function migrateCommerce(s: GameState): GameState {
  return {
    ...s,
    commerce: s.commerce ?? emptyCommerce(),
    ...(s.challengeSession
      ? {
          challengeSession: {
            ...s.challengeSession,
            main: migrateCommerce(s.challengeSession.main),
          },
        }
      : {}),
  };
}
export function requireCommerce(s: GameState) {
  if (!validCommerce(s.commerce))
    throw new TypeError("Ungültiger Kauf- oder Werbezustand.");
  if (s.challengeSession) requireCommerce(s.challengeSession.main);
}
