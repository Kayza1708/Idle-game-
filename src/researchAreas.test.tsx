import { describe, it, expect } from "vitest";
import {
  newGame,
  addData,
  addCredits,
  grantComponents,
  buyHardwareClass,
  startResearchProject,
  researchPreview,
  queueResearchProject,
  type GameState,
} from "./economy";
import {
  researchAreas,
  researchAreaOrder,
  researchAccess,
  visibleResearchIds,
  nextResearchArea,
  assertResearchAreaCatalog,
} from "./researchAreas";
import { buyNode, prestige, axiomReset } from "./prestige";
import { startRunChallenge, abortRunChallenge } from "./retention";
import { advance } from "./simulation";
import { restore, importGame, serialize, SAVE_VERSION } from "./storage";
import { analysisAffordability, queueExperiment } from "./experiments";
import { craft, craftAffordability } from "./inventory";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { Research } from "./Panels";
const ready = (): GameState => {
  let s = addData(addCredits(newGame(0), 1e6, false), 1e6);
  s = buyHardwareClass(buyHardwareClass(s, "calculator", 10), "sbc");
  return {
    ...s,
    totalINTEarned: 10000,
    cycleINTEarned: 10000,
    unspentINT: 10000,
    exactEconomy: {
      ...s.exactEconomy,
      totalINTEarned: { m: 1, e: 4 },
      cycleINTEarned: { m: 1, e: 4 },
      unspentINT: { m: 1, e: 4 },
    },
  };
};
const legacy = (s: GameState) => {
  const old = structuredClone(s);
  delete old.researchAreas;
  if (old.challengeSession) delete old.challengeSession.main.researchAreas;
  return JSON.stringify({ version: SAVE_VERSION, state: old });
};
describe("permanent research area access", () => {
  it("covers every catalog ID exactly once and preserves an acyclic internal prerequisite graph", async () => {
    expect(() => assertResearchAreaCatalog()).not.toThrow();
    const e = await import("./economy"),
      ids = Object.values(researchAreas).flatMap((a) => a.ids);
    expect(ids).toHaveLength(
      Object.keys(e.BALANCE.repeatableResearch).length +
        Object.keys(e.BALANCE.researchProjects).length,
    );
    for (const id of Object.keys(e.BALANCE.repeatableResearch)) {
      const seen = new Set<string>();
      let current: string | null = id;
      while (current) {
        expect(seen.has(current)).toBe(false);
        seen.add(current);
        current =
          (e.BALANCE.repeatableResearch as any)[current]?.requires ?? null;
      }
    }
    for (const area of researchAreaOrder)
      expect(
        e.BALANCE.prestigeUpgrades[researchAreas[area].node].requires,
      ).toEqual([]);
  });
  it("exposes exactly the three initial projects, even with enough Data for every project", () => {
    expect(visibleResearchIds(newGame(0))).toEqual([
      "dataGeneration",
      "modelArchitecture",
      "blueprints",
    ]);
    expect(visibleResearchIds(ready())).toEqual([
      "dataGeneration",
      "modelArchitecture",
      "blueprints",
    ]);
    for (const area of researchAreaOrder)
      for (const id of researchAreas[area].ids) {
        const s = ready();
        expect(researchPreview(s, id)?.reason).toBe("area");
        expect(startResearchProject(s, id)).toBe(s);
        expect(
          queueResearchProject({ ...s, nodes: ["labs2"] }, id).researchQueue,
        ).toEqual([]);
      }
  });
  it("opens only the bought node area, once, without changing existing node prices/effects", () => {
    for (const area of researchAreaOrder) {
      const s = ready(),
        id = researchAreas[area].node,
        after = buyNode(s, id);
      expect(after.researchAreas).toEqual([area]);
      expect(after.nodes).toContain(id);
      expect(after.unspentINT).toBe(s.unspentINT - 1);
      expect(buyNode(after, id)).toBe(after);
      expect(nextResearchArea(after)).toBe(
        researchAreaOrder.find((a) => a !== area),
      );
    }
    const poor = newGame(0);
    expect(buyNode(poor, "dataArchive1")).toBe(poor);
  });
  it("keeps internal prerequisites after a real access purchase", () => {
    const s = buyNode(ready(), "computeNet1");
    expect(researchAccess(s, "computeOptimization").allowed).toBe(true);
    expect(researchPreview(s, "computeOptimization")?.reason).toBe(
      "requirement",
    );
    expect(startResearchProject(s, "computeOptimization")).toBe(s);
    const started = startResearchProject(s, "dataGeneration"),
      done = advance(started, 180).state,
      model = startResearchProject(done, "modelArchitecture");
    expect(model.researchLabs[0]?.id).toBe("modelArchitecture");
  });
  it("blocks autostart of a locked queued project and rechecks access in queue previews", () => {
    let s = buyNode(ready(), "labs1");
    s = {
      ...s,
      nodes: [...s.nodes, "labs2", "labs3"],
      researchLevels: { ...s.researchLevels, modelArchitecture: 1 },
      researchQueue: ["commercialization"],
    };
    const before = s.lifetime.researchStarted,
      after = advance(s, 1).state;
    expect(after.researchQueue).toEqual(["commercialization"]);
    expect(after.researchLabs.every((lab) => lab === null)).toBe(true);
    expect(after.lifetime.researchStarted).toBe(before);
    expect(
      queueResearchProject({ ...s, researchQueue: [] }, "commercialization")
        .researchQueue,
    ).toEqual([]);
  });
  it("keeps access across normal prestige, Axiom reset and reload while node effects reset as before", () => {
    let s = ready();
    for (const area of researchAreaOrder)
      s = buyNode(s, researchAreas[area].node);
    s = addCredits(s, 1e18);
    const normal = prestige(s);
    expect(normal.researchAreas).toEqual(s.researchAreas);
    expect(normal.prestigeCount).toBe(s.prestigeCount + 1);
    const axiom = axiomReset(normal);
    expect(axiom.axiomResetCount).toBe(1);
    expect(axiom.nodes).toEqual([]);
    expect(axiom.researchAreas).toEqual(s.researchAreas);
    const loaded = importGame(serialize(axiom));
    expect(loaded.researchAreas).toEqual(s.researchAreas);
    expect(researchAccess(loaded, "operations").allowed).toBe(true);
    const again = buyNode(prestige(addCredits(loaded, 1e18)), "labs1");
    expect(again.nodes).toContain("labs1");
    expect(again.researchAreas).toEqual(s.researchAreas);
    expect(again.researchAreas).toHaveLength(4);
  });
  it("migrates only proved nodes, positive levels, completed, active and queued projects without changing jobs", () => {
    let s = buyNode(ready(), "labs1");
    s = startResearchProject(s, "operations");
    s = {
      ...s,
      researchLevels: { ...s.researchLevels, syntheticData: 2 },
      completedResearch: ["alignment"],
      researchQueue: ["materialAnalysis"],
    };
    const restored = restore(legacy(s), 0);
    expect(restored.error).toBeUndefined();
    expect(restored.migrated).toBe(true);
    expect(restored.state.researchAreas).toEqual(researchAreaOrder);
    expect(restored.state.researchLabs).toEqual(s.researchLabs);
    expect(restored.state.researchQueue).toEqual(s.researchQueue);
    expect(restored.state.researchLevels).toEqual(s.researchLevels);
    expect(restored.state.exactEconomy).toEqual(s.exactEconomy);
    expect(importGame(legacy(newGame(0))).researchAreas).toEqual([]);
  });
  it("recognizes each legacy evidence path independently, including an active job after its node was lost", () => {
    for (const area of researchAreaOrder) {
      const s = buyNode(ready(), researchAreas[area].node);
      expect(importGame(legacy(s)).researchAreas).toEqual([area]);
    }
    for (const [id, area] of [
      ["syntheticData", "data"],
      ["computeOptimization", "architecture"],
      ["materialAnalysis", "materials"],
      ["labAutomation", "automation"],
    ] as const) {
      const s = ready();
      expect(
        importGame(
          legacy({ ...s, researchLevels: { ...s.researchLevels, [id]: 1 } }),
        ).researchAreas,
      ).toEqual([area]);
      expect(
        importGame(legacy({ ...s, researchQueue: [id] })).researchAreas,
      ).toEqual([area]);
    }
    const started = startResearchProject(
      buyNode(ready(), "labs1"),
      "operations",
    );
    const lost = { ...started, nodes: [] };
    const loaded = importGame(legacy(lost));
    expect(loaded.researchAreas).toEqual(["automation"]);
    expect(loaded.researchLabs).toEqual(lost.researchLabs);
    expect(
      importGame(legacy({ ...ready(), completedResearch: ["alignment"] }))
        .researchAreas,
    ).toEqual(["architecture"]);
  });
  it("does not infer unlocks from zero levels or unrelated progress, and rejects malformed access", () => {
    const s = ready();
    expect(importGame(legacy(s)).researchAreas).toEqual([]);
    for (const researchAreas of [["unknown"], ["data", "data"]] as any) {
      expect(() =>
        importGame(
          JSON.stringify({
            version: SAVE_VERSION,
            state: { ...s, researchAreas },
          }),
        ),
      ).toThrow(/researchAreas/);
    }
  });
  it("migrates the saved challenge main separately and never grants its access to a new run", () => {
    const main = buyNode(ready(), "computeNet1"),
      challenge = startRunChallenge(main, "no-taps");
    expect(challenge.researchAreas).toEqual([]);
    expect(challenge.challengeSession?.main.researchAreas).toEqual([
      "architecture",
    ]);
    expect(startResearchProject(challenge, "alignment")).toBe(challenge);
    expect(buyNode(challenge, "computeNet1")).toBe(challenge);
    const loaded = importGame(legacy(challenge));
    expect(loaded.researchAreas).toEqual([]);
    expect(loaded.challengeSession?.main.researchAreas).toEqual([
      "architecture",
    ]);
    const returned = abortRunChallenge(advance(loaded, 2).state);
    expect(returned.researchAreas).toEqual(["architecture"]);
    expect(startRunChallenge(returned, "no-taps").researchAreas).toEqual([]);
  });
  it("keeps Hardware analysis and first crafting reachable without a Prestige research area", () => {
    let s = ready();
    expect(analysisAffordability(s, "hardware", "short").affordable).toBe(true);
    expect(
      queueExperiment(s, "hardware", 0, "short").experiments.active?.type,
    ).toBe("hardware");
    s = advance(
      startResearchProject(
        queueExperiment(s, "hardware", 0, "short"),
        "blueprints",
      ),
      600,
    ).state;
    expect(s.completedResearch).toContain("blueprints");
    s = grantComponents(s, {
      circuits: 100,
      copperCoils: 100,
      siliconWafers: 100,
    });
    expect(craftAffordability(s, "impulse-relay").affordable).toBe(true);
    expect(craft(s, "impulse-relay").crafting.active?.recipeId).toBe(
      "impulse-relay",
    );
    expect(s.researchAreas).toEqual([]);
  });
  it("renders three cards and exactly one deterministic area preview in DE/EN, with completed projects compact", () => {
    for (const language of ["de", "en"] as const) {
      const s = { ...ready(), settings: { ...ready().settings, language } },
        html = renderToStaticMarkup(
          createElement(Research, { s, act: () => {} }),
        );
      expect(html.match(/class="research-card /g) ?? []).toHaveLength(3);
      expect(html.match(/data-research-area-preview=/g) ?? []).toHaveLength(1);
      expect(html).toContain('data-research-area-preview="data"');
      const open = buyNode(s, "dataArchive1"),
        second = renderToStaticMarkup(
          createElement(Research, { s: open, act: () => {} }),
        );
      expect(second).toContain('data-research-area-preview="architecture"');
      const done = {
          ...s,
          completedResearch: ["blueprints"] as GameState["completedResearch"],
        },
        compact = renderToStaticMarkup(
          createElement(Research, { s: done, act: () => {} }),
        );
      expect(compact.match(/class="research-card /g) ?? []).toHaveLength(2);
      expect(compact).toContain(
        language === "de" ? "Abgeschlossen" : "Completed",
      );
    }
  });
});
