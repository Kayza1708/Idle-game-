import {
  itemEffectProfile,
  itemEffectFor,
  type GameState,
  type Item,
} from "./economy";
/** Training effects reduce future Data costs; relay and archive rewards are fixed by type.
 * Higher rarity/level/forge on relay and archive effects has no applied scaling. */
export function itemImprovementHasEffect(
  s: GameState,
  before: Item,
  after: Item,
) {
  return itemEffectProfile(after).some(
    (effect) =>
      !["relay", "int-yield"].includes(effect) &&
      itemEffectFor(s, before, effect) !== itemEffectFor(s, after, effect),
  );
}
