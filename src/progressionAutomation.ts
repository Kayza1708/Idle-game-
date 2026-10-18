import {
  BALANCE,
  exactEconomyValue,
  type GameState,
} from "./economy";
import {
  axiomLevel,
  knownProgressionNodes,
  hasProgressionNode,
} from "./progression";
import { buyProgressionNode } from "./progressionReset";
import { fuseItemsNow } from "./inventory";
import { fabricationSpeed } from "./progressionWork";
import { ScientificNumber } from "./scientificNumber";
export function rebuildKnown(s: GameState) {
  if (
    !axiomLevel(s, "B04") ||
    !s.progression.rebuild.length ||
    s.retention.activeRun
  )
    return s;
  let next = s;
  for (const id of s.progression.rebuild) {
    if (!knownProgressionNodes(s).includes(id) || hasProgressionNode(next, id))
      continue;
    const cost = BALANCE.progression.nodes[id].cost;
    if (
      exactEconomyValue(next, "unspentINT").compare(
        ScientificNumber.from(cost).add(
          ScientificNumber.fromJSON(next.progression.reserves.int),
        ),
      ) < 0
    )
      break;
    next = buyProgressionNode(next, id);
  }
  return next;
}

export function startFusion(s: GameState, ids: string[]) {
  return fuseItemsNow(s,ids);
}

export function advanceFusion(s: GameState, seconds: number) {
  const f = s.progression.fusion;
  if (!f) return s;
  const done = f.done + seconds * fabricationSpeed(s);
  if (done + 1e-8 < f.required)
    return { ...s, progression: { ...s.progression, fusion: { ...f, done } } };
  return fuseItemsNow(
    {
      ...s,
      inventory: [...s.inventory, ...f.inputs],
      progression: { ...s.progression, fusion: null },
    },
    f.inputs.map((i) => i.id),
  );
}
export function runFusionPlanner(s: GameState) {
  const p = s.progression.fusionPlanner;
  if (
    !p.enabled ||
    !axiomLevel(s, "C04") ||
    s.progression.resetIntent ||
    s.retention.activeRun
  )
    return s;
  const target = [
    "common",
    "uncommon",
    "rare",
    "epic",
    "legendary",
    "mythic",
  ].indexOf(p.target);
  for (const type of p.types)
    for (const rarity of [
      "common",
      "uncommon",
      "rare",
      "epic",
      "legendary",
      "mythic",
    ].slice(0, target)) {
      const items = s.inventory
        .filter(
          (i) =>
            i.type === type &&
            i.rarity === rarity &&
            !i.locked &&
            !Object.values(s.equipped).includes(i.id),
        )
        .slice(0, 3);
      if (items.length === 3) {
        const next = startFusion(
          s,
          items.map((i) => i.id),
        );
        if (next !== s) return next;
      }
    }
  return s;
}

export { choosePhaseModel } from "./progression";
