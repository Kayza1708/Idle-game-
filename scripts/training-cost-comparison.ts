import {
  newGame,
  addData,
  grantComponents,
  trainingPreview,
  startTraining,
  type GameState,
} from "../src/economy";
import { createItem, equip, upgrade, forgeItem } from "../src/inventory";
const base = () =>
  grantComponents(
    { ...addData(newGame(0), 1e6), prestigeCount: 1 },
    { circuits: 10000 },
  );
let item = createItem(base(), "photonic-array", "common");
item = equip(item, item.inventory[0].id);
const improved = forgeItem(
  upgrade(item, item.inventory[0].id),
  item.inventory[0].id,
);
const states: [string, GameState][] = [
  ["none", base()],
  ["graph", { ...base(), breakthroughs: ["graph"] }],
  ["common-item", item],
  ["upgraded-forged-item", improved],
  ["temporary-boost", { ...base(), trainingBoostUntil: 1000 }],
  [
    "combined",
    {
      ...item,
      breakthroughs: ["graph"],
      hardwareCounts: { ...item.hardwareCounts, rig: 25, lunar: 10 },
    },
  ],
];
console.log(
  JSON.stringify(
    states.map(([name, s]) => {
      const p = trainingPreview(s, "quality"),
        started = startTraining(s, "quality");
      return {
        name,
        cost: p.cost.toScientificString(16),
        duration: p.duration,
        creditCost: started.activeTraining?.creditCost,
        basis: started.activeTraining?.costBasis ?? null,
      };
    }),
    null,
    2,
  ),
);
