import {
  BALANCE,
  type GameState,
  type ResearchId,
  type PrestigeUpgradeId,
} from "./economy";
export const researchAreas = {
  initial: {
    node: null,
    ids: ["dataGeneration", "modelArchitecture", "blueprints"],
  },
  data: { node: "dataArchive1", ids: ["syntheticData", "dataFlywheel"] },
  architecture: {
    node: "computeNet1",
    ids: [
      "computeOptimization",
      "userScaling",
      "hardwareIntegration",
      "commercialization",
      "networkEffects",
      "parallelArchitecture",
      "hardwareCoDesign",
      "recursiveLearning",
      "tapAmplification",
      "alignment",
    ],
  },
  materials: {
    node: "analysis1",
    ids: ["materialAnalysis", "blueprintAnalysis", "dropProtocols"],
  },
  automation: {
    node: "labs1",
    ids: ["operations", "labAutomation", "autonomousScience"],
  },
} as const;
export type ResearchAreaId = Exclude<keyof typeof researchAreas, "initial">;
export const researchAreaOrder: ResearchAreaId[] = [
  "data",
  "architecture",
  "materials",
  "automation",
];
export const researchAreaFor = (id: ResearchId) =>
  Object.entries(researchAreas).find(([, area]) =>
    (area.ids as readonly string[]).includes(id),
  )?.[0] as keyof typeof researchAreas | undefined;
export const researchAccess = (s: GameState, id: ResearchId) => {
  const area = researchAreaFor(id);
  return {
    area: area ?? null,
    allowed:
      area === "initial" ||
      (!!area && (s.researchAreas ?? []).includes(area as ResearchAreaId)),
    node: area ? researchAreas[area].node : null,
  };
};
export const visibleResearchIds = (s: GameState) =>
  (
    Object.values(researchAreas).flatMap((area) => area.ids) as ResearchId[]
  ).filter((id) => researchAccess(s, id).allowed);
export const nextResearchArea = (s: GameState) =>
  researchAreaOrder.find((area) => !(s.researchAreas ?? []).includes(area)) ??
  null;
export function unlockResearchAreaForNode(
  s: GameState,
  node: PrestigeUpgradeId,
) {
  const area = researchAreaOrder.find(
    (area) => researchAreas[area].node === node,
  );
  return !area || (s.researchAreas ?? []).includes(area)
    ? s
    : { ...s, researchAreas: [...(s.researchAreas ?? []), area] };
}
/** Infer only evidence in a legacy state, never during normal actions or from another run. */
export function migrateResearchAreas(
  s: GameState,
  original: unknown,
): GameState {
  const raw =
    original && typeof original === "object"
      ? (original as Partial<GameState>)
      : {};
  let next = s;
  if (!Object.hasOwn(raw, "researchAreas")) {
    const evidence = [
      ...Object.entries(s.researchLevels)
        .filter(([, level]) => level > 0)
        .map(([id]) => id),
      ...s.completedResearch,
      ...s.researchQueue,
      ...s.researchLabs.filter(Boolean).map((job) => job!.id),
    ];
    const open = researchAreaOrder.filter(
      (area) =>
        s.nodes.includes(researchAreas[area].node) ||
        evidence.some((id) =>
          (researchAreas[area].ids as readonly string[]).includes(id),
        ),
    );
    next = { ...s, researchAreas: open };
  }
  if (s.challengeSession) {
    const main = migrateResearchAreas(
      s.challengeSession.main,
      raw.challengeSession?.main,
    );
    if (main !== s.challengeSession.main)
      next = { ...next, challengeSession: { ...s.challengeSession, main } };
  }
  return next;
}
export function assertResearchAreaCatalog() {
  const ids = Object.values(researchAreas).flatMap(
      (area) => area.ids,
    ) as string[],
    catalog = [
      ...Object.keys(BALANCE.researchProjects),
      ...Object.keys(BALANCE.repeatableResearch),
    ];
  if (
    new Set(ids).size !== ids.length ||
    ids.length !== catalog.length ||
    catalog.some((id) => !ids.includes(id))
  )
    throw new Error(
      "Research area matrix must contain every registered ID exactly once",
    );
}
