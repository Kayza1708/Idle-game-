import {usesItemV3,identifyItemSynthesisV3,settleItemSynthesisV3} from './itemSystemV3';
import { addEvent } from "./telemetry";
import { trainingDataCostScientific } from "./economy";
import { deviceBonus } from "./deviceEffects";
import { advanceFusion, choosePhaseModel } from "./progressionAutomation";
import {
  BALANCE,
  exactEconomyValue,
  grantComponents,
  researchLevel,
  researchQuote,
  type GameState,
  type ComponentId,
} from "./economy";
import {
  knowledgeRate,
  discoverProgression,
  hasProgressionNode,
  axiomLevel,
  secondary,
  progressionResearchSpeed,
} from "./progression";
import { experimentSpeed,synthesisSpeed } from "./experiments";
import { ScientificNumber } from "./scientificNumber";
export type WorkContract = {
  required: number;
  done: number;
  speed: number;
  quantityIntegral: number;
  familyIntegral?: { photonic: number; quantum: number };
};
export const fabricationSpeed = (s: GameState) =>
  (!usesItemV3(s)&&hasProgressionNode(s, "W08") ? BALANCE.progression.effects.W08 : 1) *
  (usesItemV3(s)?1:(1 / BALANCE.progression.effects.C06) ** axiomLevel(s, "C06"));
export const analysisQuantity = (s: GameState) =>
  secondary(s, "K10") ? BALANCE.progression.effects.D06quantity : 1;
export function prepareProgressionWork(s: GameState) {
  const work = { ...s.progression.work };
  const live = new Set<string>();
  function track(id: string, required: number, speed: number) {
    live.add(id);
    const saved = work[id] ?? { required, done: 0, speed, quantityIntegral: 0 };
    work[id] = { ...saved, speed };
    return (
      s.savedAt + Math.max(0, (saved.required - saved.done) / speed) * 1000
    );
  }
  const labs = s.researchLabs.map((j) =>
    !j
      ? null
      : {
          ...j,
          endsAt: track(
            j.jobId ?? `${j.id}:${j.startedAt}`,
            j.intro
              ? BALANCE.introResearchSeconds
              : j.quoteBasis
                ? (j.quoteBasis.baseDuration *
                    (j.quoteBasis.planningFactor ?? 1)) /
                  (j.quoteBasis.temporaryFactors.deviceSwitch ?? 1)
                : j.durationSeconds,
            j.intro
              ? 1
              : progressionResearchSpeed(s) *
                  (s.labBoostUntil > s.savedAt ? 2 : 1),
          ),
        },
  );
  const active = s.experiments.active;
  const exp = active
    ? {
        ...active,
        endsAt: track(
          active.id,
          active.progressionWorkRequired ??
            BALANCE.analysisCosts[active.type][
              active.length === "intro" ? "short" : active.length
            ].duration,
          experimentSpeed(s),
        ),
      }
    : null;
  const job = s.crafting.active;
  const craft = job
    ? {
        ...job,
        endsAt: track(job.id, job.durationPerUnit, fabricationSpeed(s)),
      }
    : null;
  const foundries = s.foundries.map((f) => ({
    ...f,
    active: f.active
      ? {
          ...f.active,
          endsAt: track(
            `forge:${f.active.itemId}:${f.active.startedAt}`,
            f.active.duration,
            fabricationSpeed(s),
          ),
        }
      : null,
  }));
  for (const id of Object.keys(work)) if (!live.has(id)) delete work[id];
  return {
    ...s,
    researchLabs: labs,
    experiments: { ...s.experiments, active: exp },
    crafting: { ...s.crafting, active: craft },
    foundries,
    progression: { ...s.progression, work },
  };
}
export function advanceProgressionWork(s: GameState, seconds: number) {
  const p = s.progression,
    work = { ...p.work };
  for (const [id, w] of Object.entries(work)) {
    const delta = Math.min(w.required - w.done, w.speed * seconds);
    work[id] = {
      ...w,
      done: w.done + delta,
      quantityIntegral:
        w.quantityIntegral +
        delta * (id === s.experiments.active?.id ? analysisQuantity(s) : 1),
      ...(id === s.experiments.active?.id
        ? {
            familyIntegral: {
              photonic:
                (w.familyIntegral?.photonic ?? 0) +
                delta *
                  analysisQuantity(s) *
                  (1 + deviceBonus(s, "photonicYield")),
              quantum:
                (w.familyIntegral?.quantum ?? 0) +
                delta *
                  analysisQuantity(s) *
                  (1 + deviceBonus(s, "quantumYield")),
            },
          }
        : {}),
    };
  }
  let next = {
    ...s,
    progression: {
      ...p,
      work,
      knowledge: ScientificNumber.fromJSON(p.knowledge)
        .add(knowledgeRate(s).multiplyNumber(seconds))
        .toJSON(),
    },
  };
  const synth = p.synthesis;
  if (synth) {
    const done = synth.work + seconds * synthesisSpeed(s);
    if (done + 1e-8 >= synth.required) {
      const settled=settleItemSynthesisV3(next,synth);next=settled.state;
      next = addEvent(
        grantComponents(
          { ...next, progression: { ...next.progression, synthesis: null } },
          { [synth.component]: settled.amount },
          "synthesis",
        ),
        "synthesis-complete",
        s.savedAt,
        { id: synth.id, component: synth.component, amount: settled.amount },
      );
    } else
      next = {
        ...next,
        progression: {
          ...next.progression,
          synthesis: { ...synth, work: done },
        },
      };
  }
  return discoverProgression(advanceFusion(next, seconds));
}
export function protectedData(
  s: GameState,
  kind: "research" | "analysis" | "craft",
) {
  let reserve = ScientificNumber.fromJSON(s.progression.reserves.data);
  const integrationPending =
    !s.activeTraining &&
    (s.trainingQueue[0]?.track === "integration" ||
      (!s.trainingQueue.length &&
        s.progression.trainingAuto &&
        hasProgressionNode(s, "T06") &&
        hasProgressionNode(s, "T04") &&
        s.integrationLevel < Math.min(s.qualityLevel, s.efficiencyLevel) &&
        (!usesItemV3(s) || s.progression.trainingTargets.integration > 0) &&
        (!s.progression.trainingTargets.integration ||
          s.integrationLevel < s.progression.trainingTargets.integration)));
  if (integrationPending) {
    const cost = trainingDataCostScientific(s, "integration");
    if (cost.compare(reserve) > 0) reserve = cost;
  }
  if (
    kind !== "research" &&
    hasProgressionNode(s, "F05") &&
    s.researchDirector.enabled
  ) {
    const entry = s.researchDirector.entries.find(
      (e) => researchLevel(s, e.id) < e.targetLevel,
    );
    const quote = entry ? researchQuote(s, entry.id) : null;
    if (
      quote &&
      !quote.requirement &&
      !quote.done &&
      !quote.running &&
      quote.cost.compare(reserve) > 0
    )
      reserve = quote.cost;
  }
  return reserve;
}
export function automaticCanSpendData(
  s: GameState,
  cost: ScientificNumber,
  kind: "research" | "analysis" | "craft",
) {
  return (
    !s.progression.resetIntent &&
    exactEconomyValue(s, "data").compare(protectedData(s, kind).add(cost)) >= 0
  );
}
export function synthesisQuote(s: GameState, component: ComponentId) {
  const groups = Object.entries(BALANCE.progression.materials),
    index = groups.findIndex(([, ids]) =>
      (ids as readonly string[]).includes(component),
    ),
    access =
      index === 0 ||
      (index === 1 && s.completedResearch.includes("blueprints")) ||
      (index === 2 && s.researchLevels.materialAnalysis >= 3) ||
      (index === 3 && s.researchLevels.blueprintAnalysis >= 5) ||
      (index === 4 && s.researchLevels.materialAnalysis >= 10);
  const cost = ScientificNumber.from(
    Math.ceil(
      (BALANCE.progression.synthesisCosts[index] ?? 0) *
        (s.completedResearch.includes("dataPipeline")
          ? BALANCE.progression.researchEffects.dataPipeline
          : 1),
    ),
  );
  return {
    access,
    cost,
    required: BALANCE.progression.synthesisWork[index] ?? 0,
    allowed:
      index >= 0 &&
      access &&
      !s.experiments.active &&
      !s.progression.synthesis &&
      exactEconomyValue(s, "data").compare(cost) >= 0,
  };
}
export function startSynthesis(s: GameState, id: ComponentId) {
  const original = s;
  s = choosePhaseModel(s, "material");
  const q = synthesisQuote(s, id);
  if (!q.allowed) return original;
  const data = exactEconomyValue(s, "data").subtract(q.cost);
  return identifyItemSynthesisV3(addEvent(
    {
      ...s,
      data: data.toNumber(),
      exactEconomy: { ...s.exactEconomy, data: data.toJSON() },
      progression: {
        ...s.progression,
        synthesis: {
          id: `synthesis-${s.nextId}`,
          component: id,
          work: 0,
          required: q.required,
        },
      },
      nextId: s.nextId + 1,
    },
    "synthesis-start",
    s.savedAt,
    {
      id: `synthesis-${s.nextId}`,
      component: id,
      dataCost: q.cost.toScientificString(),
      required: q.required,
    },
  ));
}
/** Paused main session follows wall time without production or ageing paid work. */
export function pauseMain(s: GameState, at: number) {
  const delta = Math.max(0, at - s.savedAt),
    shift = (x: number) => (x > s.savedAt ? x + delta : x);
  const work = { ...s.progression.work };
  if (delta > 0)
    for (const f of s.foundries)
      if (f.active) {
        const j = f.active,
          old = `forge:${j.itemId}:${j.startedAt}`,
          key = `forge:${j.itemId}:${j.startedAt + delta}`;
        if (work[old]) {
          work[key] = work[old];
          delete work[old];
        }
      }
  return {
    ...s,
    savedAt: at,
    runStartedAt: s.runStartedAt + delta,
    ...(usesItemV3(s)&&s.itemSystemV3?.overdrive&&s.overclock.activeUntil>s.savedAt?{itemSystemV3:{...s.itemSystemV3,overdrive:{...s.itemSystemV3.overdrive,startedAt:s.itemSystemV3.overdrive.startedAt+delta,burstUntil:s.itemSystemV3.overdrive.burstUntil+delta}}}:{}),
    creditBoostUntil: shift(s.creditBoostUntil),
    trainingBoostUntil: shift(s.trainingBoostUntil),
    labBoostUntil: shift(s.labBoostUntil),
    overclock: {
      ...s.overclock,
      activeUntil: shift(s.overclock.activeUntil),
      cooldownUntil: shift(s.overclock.cooldownUntil),
    },
    activeTraining: s.activeTraining
      ? {
          ...s.activeTraining,
          startedAt:
            s.activeTraining.startedAt === undefined
              ? undefined
              : s.activeTraining.startedAt + delta,
        }
      : null,
    researchLabs: s.researchLabs.map((j) =>
      j
        ? { ...j, startedAt: j.startedAt + delta, endsAt: j.endsAt + delta }
        : null,
    ),
    crafting: {
      ...s.crafting,
      active: s.crafting.active
        ? {
            ...s.crafting.active,
            startedAt:
              s.crafting.active.startedAt === null
                ? null
                : s.crafting.active.startedAt + delta,
            endsAt:
              s.crafting.active.endsAt === null
                ? null
                : s.crafting.active.endsAt + delta,
          }
        : null,
    },
    experiments: {
      ...s.experiments,
      active: s.experiments.active
        ? {
            ...s.experiments.active,
            startedAt: s.experiments.active.startedAt + delta,
            endsAt: s.experiments.active.endsAt + delta,
          }
        : null,
    },
    foundries: s.foundries.map((f) => ({
      ...f,
      active: f.active
        ? {
            ...f.active,
            startedAt: f.active.startedAt + delta,
            endsAt: f.active.endsAt + delta,
          }
        : null,
    })),
    progression: {
      ...s.progression,
      work,
      axiomCycleStartedAt: s.progression.axiomCycleStartedAt + delta,
      lastTap:
        s.progression.lastTap === null ? null : s.progression.lastTap + delta,
    },
  };
}
