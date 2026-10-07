import {learnBlueprint} from './blueprints';
import {buyNode} from "./prestige";
import { itemImprovementHasEffect } from "./itemMechanics";
import { describe, it, expect, vi } from "vitest";
import { ScientificNumber } from "./scientificNumber";
import {
  BALANCE,
  newGame,
  addData,
  exactEconomyValue,
  queueResearchProject,
  removeQueuedResearch,
  researchQueuePreview,
  startResearchProject,
  itemEffect,
  GameState,
} from "./economy";
import {
  craftModule,
  craft,
  settleCrafting,
  createItem,
  equip,
  upgrade,
  forgeItem,
  fuseItems,
  itemImprovementPreview,
  fusionPreview,
} from "./inventory";
import {
  analysisAffordability,
  queueExperiment,
  analysisBlockReason,
} from "./experiments";
import { serialize, importGame } from "./storage";
const ready = (): GameState => {
  let s = addData(newGame(0), 1e9);
  s = buyNode({...s,unspentINT:100,exactEconomy:{...s.exactEconomy,unspentINT:{m:1,e:2}}},"labs1");
  s = buyNode(s,"analysis1");
  return {
    ...s,
    prestigeCount: 1,
    nodes: [...s.nodes, "labs2"],
    completedResearch: ["blueprints"],
    discovered: ["calculator", "sbc"],
    blueprintFragments: 100,
    components: 10000,
    componentInventory: Object.fromEntries(
      Object.keys(BALANCE.components).map((id) => [id, 1000]),
    ) as GameState["componentInventory"],
  };
};
const items = () => {
  let s = ready();
  for (let i = 0; i < 4; i++) s = createItem(s, "quantum-chip", "common");
  return s;
};
describe("existing mechanics exposed through their domain contracts", () => {
  it("pays for a module, completes it and reserves it for an item recipe", () => {
    const s = ready(),
      started = craftModule(s, "computeBus");
    expect(started.modules.computeBus).toBe(0);
    expect(started.componentInventory.circuits).toBe(
      s.componentInventory.circuits - 10,
    );
    expect(exactEconomyValue(started, "data").toJSON()).toEqual(
      exactEconomyValue(s, "data")
        .subtract(ScientificNumber.from(250))
        .toJSON(),
    );
    const finished = settleCrafting({
      ...started,
      savedAt: started.crafting.active!.endsAt!,
    });
    expect(finished.modules.computeBus).toBe(1);
    const chip = craft(learnBlueprint(finished, "quantum-chip"), "quantum-chip");
    expect(chip.modules.computeBus).toBe(0);
    expect(chip.crafting.active?.ingredients.modules.computeBus).toBe(1);
    expect(chip.crafting.active?.quantity).toBe(1);
  });
  it.each(["upgrade", "forge"] as const)(
    "%s uses quoted costs and changes the real effect",
    (action) => {
      const s = items(),
        id = s.inventory[0].id,
        q = itemImprovementPreview(s, id, action)!;
      const next = action === "upgrade" ? upgrade(s, id) : forgeItem(s, id);
      expect(next.componentInventory.circuits).toBe(
        s.componentInventory.circuits - q.componentCost,
      );
      expect(exactEconomyValue(next, "data").toJSON()).toEqual(
        exactEconomyValue(s, "data")
          .subtract(ScientificNumber.from(q.dataCost))
          .toJSON(),
      );
      expect(next.inventory[0]).toEqual(q.result);
      expect(itemEffect(next.inventory[0])).toBeGreaterThan(
        itemEffect(s.inventory[0]),
      );
      const poor = {
        ...s,
        data: 0,
        exactEconomy: { ...s.exactEconomy, data: { m: 0, e: 0 } },
      };
      expect(
        action === "upgrade" ? upgrade(poor, id) : forgeItem(poor, id),
      ).toBe(poor);
    },
  );
  it("fusion consumes exactly three explicit IDs and creates one next-quality instance", () => {
    const s = items(),
      ids = s.inventory.slice(0, 3).map((i) => i.id),
      q = fusionPreview(s, ids),
      next = fuseItems(s, ids);
    expect(q.allowed).toBe(true);
    expect(next.inventory).toHaveLength(2);
    expect(
      next.inventory.find((i) => i.id !== s.inventory[3].id),
    ).toMatchObject({ ...q.result, level: 0 });
    expect(exactEconomyValue(next, "data").toJSON()).toEqual(
      exactEconomyValue(s, "data").toJSON(),
    );
    expect(next.inventory.some((i) => ids.includes(i.id))).toBe(false);
    expect(fuseItems(next, ids)).toBe(next);
  });
  it("fusion refuses equipped, locked, duplicate and unknown inputs without consumption", () => {
    let s = items();
    const ids = s.inventory.slice(0, 3).map((i) => i.id);
    s = equip(s, ids[0]);
    expect(fuseItems(s, ids)).toBe(s);
    const locked = {
      ...items(),
      inventory: items().inventory.map((i, n) => ({ ...i, locked: n === 0 })),
    };
    expect(fuseItems(locked, ids)).toBe(locked);
    expect(fuseItems(s, [ids[1], ids[1], ids[2]])).toBe(s);
    expect(fuseItems(s, [ids[1], ids[2], "missing"])).toBe(s);
  });
  it("enables relay and archive improvements with actual special-effect scaling", () => {
    let s = ready();
    for (const type of [
      "impulse-relay",
      "insight-archive",
    ] as const) {
      s = createItem(s, type, "common");
      const item = s.inventory.at(-1)!,
        q = itemImprovementPreview(s, item.id, "forge")!;
      expect(itemImprovementHasEffect(s, item, q.result)).toBe(true);
    }
    const q = itemImprovementPreview(
      items(),
      items().inventory[0].id,
      "forge",
    )!;
    expect(itemImprovementHasEffect(items(), q.item, q.result)).toBe(true);
  });
  it("maximum quality and forge level quote no fictitious result", () => {
    const s = createItem(ready(), "quantum-chip", "mythic");
    const item = s.inventory.at(-1)!;
    expect(itemImprovementPreview(s, item.id, "upgrade")).toMatchObject({
      allowed: false,
      result: item,
    });
    const capped = {
      ...s,
      inventory: s.inventory.map((i) => ({ ...i, forge: 20 })),
    };
    expect(itemImprovementPreview(capped, item.id, "forge")).toMatchObject({
      allowed: false,
      result: capped.inventory.at(-1),
    });
  });
  it("improvement and fusion previews do not mutate state, events or RNG", () => {
    const s = items(),
      before = JSON.stringify(s),
      rng = vi.spyOn(Math, "random");
    itemImprovementPreview(s, s.inventory[0].id, "forge");
    fusionPreview(
      s,
      s.inventory.slice(0, 3).map((i) => i.id),
    );
    expect(JSON.stringify(s)).toBe(before);
    expect(rng).not.toHaveBeenCalled();
    rng.mockRestore();
  });
  it("queues without charging, survives reload and removes only the requested entry", () => {
    const s = ready(),
      next = queueResearchProject(
        queueResearchProject(s, "dataGeneration"),
        "operations",
      );
    expect(next.researchQueue).toEqual(["dataGeneration", "operations"]);
    expect(next.data).toBe(s.data);
    const loaded = importGame(serialize(next));
    expect(loaded.researchQueue).toEqual(next.researchQueue);
    expect(removeQueuedResearch(loaded, 0).researchQueue).toEqual([
      "operations",
    ]);
    expect(removeQueuedResearch(loaded, -1)).toBe(loaded);
    expect(queueResearchProject(next, "alignment")).toBe(next);
  });
  it("queue unlock and prerequisites are checked, resources are checked at actual start", () => {
    const s = ready(),
      locked = { ...s, nodes: [] };
    expect(queueResearchProject(locked, "dataGeneration")).toBe(locked);
    expect(researchQueuePreview(s, "materialAnalysis").reason).toBe(
      "requirement",
    );
    const poor = {
      ...s,
      data: 0,
      exactEconomy: { ...s.exactEconomy, data: { m: 0, e: 0 } },
    };
    const queued = queueResearchProject(poor, "dataGeneration");
    expect(queued.researchQueue).toEqual(["dataGeneration"]);
    expect(startResearchProject(queued, "dataGeneration")).toBe(queued);
  });
  it.each(["short", "long"] as const)(
    "starts and pays the %s analysis and shows slot and shortage reasons",
    (length) => {
      const s = ready(),
        q = analysisAffordability(s, "hardware", length),
        next = queueExperiment(s, "hardware", 0, length);
      expect(next.experiments.active).toMatchObject({
        length,
        dataCost: q.cost.data,
        endsAt: q.duration * 1000,
      });
      expect(
        exactEconomyValue(s, "data")
          .subtract(exactEconomyValue(next, "data"))
          .toNumber(),
      ).toBeCloseTo(q.cost.data);
      expect(analysisBlockReason(next, "hardware", length, "en")).toMatch(
        /occupied/i,
      );
      const poor = {
        ...s,
        data: 0,
        exactEconomy: { ...s.exactEconomy, data: { m: 0, e: 0 } },
      };
      expect(analysisBlockReason(poor, "hardware", length, "en")).toMatch(
        /Data/i,
      );
      expect(
        queueExperiment(poor, "hardware", 0, length).experiments.active,
      ).toBeNull();
    },
  );
});
