import {equipmentEligibility} from './inventory';
import {
  trainingDurationQuote,
  trainingCostQuote,
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
  const duration=trainingDurationQuote(s,track),q = trainingCostQuote(s, track),
    de = s.settings.language === "de",
    baseline = q.baseCost,
    actualDiscount = 1 - q.cost.divide(baseline).toNumber();
  if(q.intro||s.activeTraining?.intro&&s.activeTraining.track===track)return <span className="training-cost-details">{de?'Einführungsauftrag: kostenlos, feste Dauer 20 s. Weitere Stufen nutzen die regulären Creditkosten und Trainingszeiten.':'Introductory lesson: free, fixed 20 s. Later levels use normal Credit costs and training durations.'}</span>;
  return (
    <span className="training-cost-details">
      {de?'Grunddauer → Startdauer':'Base → start duration'}: {duration.baseDuration.toFixed(1)} → {duration.duration.toFixed(1)} s (alignment ×{duration.alignment}; modelTransfer ×{duration.modelTransfer}, {de?'Start':'start'} {duration.runStart}) · {track}: {de ? "Basis" : "Base"} {formatScientific(q.baseCost, 3)} Credits →{" "}
      {formatScientific(q.cost, 3)} Credits · {de ? "Kostenfaktor" : "Cost factor"}{" "}
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
    slot = Object.entries(s.equipped).find(([,id])=>id===before.id)?.[0]??equipmentEligibility(s,before.id).slot??itemTypes[before.type].slot,
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
            {formatScientific(b.cost, 3)} Credits{" "}
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
