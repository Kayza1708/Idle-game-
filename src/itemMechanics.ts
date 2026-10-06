import {
  itemEffectProfile,
  itemEffectFor,
  type GameState,
  type Item,
} from "./economy";
/** Training is fixed at rate 1; relay and archive rewards are fixed by type.
 * Higher rarity/level/forge on these effects currently has no applied scaling. */
export function itemImprovementHasEffect(
  s: GameState,
  before: Item,
  after: Item,
) {
  return itemEffectProfile(after).some(
    (effect) =>
      !["training", "relay", "int-yield"].includes(effect) &&
      itemEffectFor(s, before, effect) !== itemEffectFor(s, after, effect),
  );
}
