import {
  itemEffectProfile,
  itemEffectFor,
  specialItemEffectQuote,
  type GameState,
  type Item,
} from "./economy";
/** Improvement relevance uses the same applied special-effect quote as the domain. */
export function itemImprovementHasEffect(
  s: GameState,
  before: Item,
  after: Item,
) {
  const beforeSpecial=specialItemEffectQuote(s,before),afterSpecial=specialItemEffectQuote(s,after);
  if(beforeSpecial&&afterSpecial)return beforeSpecial.bonusSeconds!==afterSpecial.bonusSeconds||beforeSpecial.intWeightContribution!==afterSpecial.intWeightContribution;
  return itemEffectProfile(after).some(
    (effect) =>
      !["relay", "int-yield"].includes(effect) &&
      itemEffectFor(s, before, effect) !== itemEffectFor(s, after, effect),
  );
}
