import {
  trainingCostQuote,
  trainingDataCostForLevelScientific,
  itemTypes,
  type GameState,
  type Item,
  type TrainingTrack,
  formatScientific,
} from "./economy";
export function TrainingCostDetails({
  s,
  track,
}: {
  s: GameState;
  track: TrainingTrack;
}) {
  const q = trainingCostQuote(s, track),
    de = s.settings.language === "de",
    baseline = trainingDataCostForLevelScientific(q.targetLevel),
    actualDiscount = 1 - q.cost.divide(baseline).toNumber();
  return (
    <span className="training-cost-details">
      {track}: {de ? "Basis" : "Base"} {formatScientific(q.baseCost, 3)} Data →{" "}
      {formatScientific(q.cost, 3)} Data · {de ? "Kostenfaktor" : "Cost factor"}{" "}
      {q.factor.toFixed(4)} ·{" "}
      {de ? "Faktorrabatt vor Aufrundung" : "Factor discount before rounding"}{" "}
      {(q.discount * 100).toFixed(2)} % ·{" "}
      {de ? "Preisersparnis" : "Price saving"}{" "}
      {(Math.max(0, actualDiscount) * 100).toFixed(2)} % (
      {de ? "max. 50 %, danach aufgerundet" : "max. 50%, rounded up afterwards"}
      )
    </span>
  );
}
/** Hypothetically equip the exact instance; show actual rounded prices, never promise a saving from a raw bonus. */
export function TrainingItemCostComparison({
  s,
  before,
  after,
}: {
  s: GameState;
  before: Item;
  after: Item;
}) {
  const de = s.settings.language === "de",
    slot = itemTypes[before.type].slot,
    base = { ...s, equipped: { ...s.equipped, [slot]: before.id } },
    next = {
      ...base,
      inventory: base.inventory.map((item) =>
        item.id === before.id ? after : item,
      ),
    };
  return (
    <div>
      <p>
        {de
          ? "Bei Ausrüstung; feste Zeiten, maximal 50 % Rabatt:"
          : "When equipped; fixed duration, max. 50% discount:"}
      </p>
      {(["quality", "efficiency"] as const).map((track) => {
        const a = trainingCostQuote(base, track),
          b = trainingCostQuote(next, track),
          same = a.cost.compare(b.cost) === 0;
        return (
          <p key={track}>
            {track}: {formatScientific(a.cost, 3)} →{" "}
            {formatScientific(b.cost, 3)} Data{" "}
            {same &&
              (de
                ? "· Aktuell gleiche gerundete Kosten; keine sofortige Ersparnis."
                : "· Same rounded cost now; no immediate saving.")}
          </p>
        );
      })}
    </div>
  );
}
