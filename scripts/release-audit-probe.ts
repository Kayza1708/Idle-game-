/** Read-only prepared-state audit probes; no grants are persisted to a player save.
 * Run from the repository root: npx vite-node --script scripts/release-audit-probe.ts
 * Values demonstrate mechanics/validation, not natural player pacing.
 */
import {
  newGame,
  queueTraining,
  addData,
  startResearchProject,
  buyHardwareClass,
  researchLabCount,
  type GameState,
} from "../src/economy";
import { prepareProgressionWork } from "../src/progressionWork";
import { buyGemOffer, gemOfferQuote } from "../src/gemShop";
import { craftingRecipe } from "../src/craftingRecipes";
import { advance } from "../src/simulation";
import { serialize, restore } from "../src/storage";
import { researchAccess } from "../src/researchAreas";
const out: Record<string, unknown> = {};
const factory = () => {
  const s = newGame(0, "audit"),
    recipe = craftingRecipe(
      "item",
      "insight-archive",
      2,
      false,
      0,
      false,
      true,
    )!;
  return prepareProgressionWork({
    ...s,
    gems: 5000,
    crafting: {
      active: {
        ...recipe,
        progressionVersion: 2,
        id: "paid-audit-craft",
        kind: "item",
        recipeId: "insight-archive",
        completed: 0,
        startedAt: 0,
        endsAt: recipe.durationPerUnit * 1000,
      },
      queue: [],
    },
  } as GameState);
};
{
  const s = factory(),
    n = buyGemOffer(s, "craft-30m"),
    restored = prepareProgressionWork(restore(serialize(n), 0).state);
  out.craftingSkip = {
    gemsSpent: s.gems - n.gems,
    beforeSeconds: (s.crafting.active!.endsAt! - s.savedAt) / 1000,
    immediateSeconds: (n.crafting.active!.endsAt! - n.savedAt) / 1000,
    afterPrepareSeconds:
      (restored.crafting.active!.endsAt! - restored.savedAt) / 1000,
    workDone: n.progression.work[s.crafting.active!.id].done,
  };
}
{
  const s = factory();
  const n = advance(s, 3600.01).state;
  out.bulkCraftWork = {
    elapsed: n.savedAt / 1000,
    items: n.inventory.length,
    requiredPerItem: s.crafting.active!.durationPerUnit,
    activeRemaining: n.crafting.active
      ? (n.crafting.active.endsAt! - n.savedAt) / 1000
      : null,
  };
}
{
  const s = newGame(0),
    ready = {
      ...s,
      gems: 5000,
      nodes: ["F01"],
      progression: { ...s.progression, known: ["F01"] },
    };
  out.paidLab = {
    regularLabs: researchLabCount(ready),
    quote: gemOfferQuote(ready, "lab-slot-1"),
    boughtLabs: buyGemOffer(ready, "lab-slot-1").purchasedResearchLabs,
  };
}
{
  const s = newGame(0),
    ready = {
      ...s,
      purchasedResearchLabs: 2,
      nodes: ["F01", "F04", "F08"],
      progression: { ...s.progression, known: ["F01", "F04", "F08"] },
      researchLabs: [null, null, null, null, null, null],
    };
  try {
    serialize(ready);
    out.sixLabSave = { labs: researchLabCount(ready), saved: true };
  } catch (e) {
    out.sixLabSave = {
      labs: researchLabCount(ready),
      saved: false,
      error: String(e),
    };
  }
}
{
  const s = newGame(0),
    ready = {
      ...s,
      gems: 5000,
      activeTraining: {
        track: "integration" as const,
        workRequired: 10,
        creditCost: 0,
        dataCost: 0,
        startedAt: 0,
      },
    },
    n = buyGemOffer(ready, "training-15m");
  out.integrationSkip = {
    gemsSpent: ready.gems - n.gems,
    levelBefore: s.integrationLevel,
    levelAfter: n.integrationLevel,
    modelLevel: n.level,
    completed: n.activeTraining === null,
  };
}
{
  const s = buyHardwareClass(addData(newGame(0), 1e6), "calculator");
  const n = startResearchProject(
    { ...s, intro: { ...s.intro, researchUsed: true } },
    "dataGeneration",
  );
  const prepared = prepareProgressionWork(n);
  out.researchStart = {
    started: !!n.researchLabs[0],
    quotedSeconds: n.researchLabs[0]?.durationSeconds,
    preparedSeconds: prepared.researchLabs[0]
      ? (prepared.researchLabs[0].endsAt - prepared.savedAt) / 1000
      : null,
  };
}
{
  const s = newGame(0);
  out.researchVisibility = {
    visibleAreas: [
      "dataGeneration",
      "syntheticData",
      "commercialization",
      "autonomousScience",
    ].map((id) => [id, researchAccess(s, id as never).allowed]),
  };
}
{
  const s = newGame(0),
    ready = {
      ...s,
      nodes: ["T03", "T04"],
      progression: { ...s.progression, known: ["T03", "T04"] },
    };
  let before = true;
  try {
    serialize(ready);
  } catch {
    before = false;
  }
  const queued = queueTraining(ready, "integration");
  try {
    serialize(queued);
    out.integrationQueue = {
      beforeValid: before,
      queue: queued.trainingQueue,
      saved: true,
    };
  } catch (e) {
    out.integrationQueue = {
      beforeValid: before,
      queue: queued.trainingQueue,
      saved: false,
      error: String(e),
    };
  }
}
console.log(JSON.stringify(out, null, 2));
