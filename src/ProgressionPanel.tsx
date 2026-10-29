import {prestigeV3Description} from './prestigeV3Copy';
import {usesItemV3} from './itemSystemV3';
import {ProgressionNetwork,type NetworkNode} from './ProgressionNetwork';
import { synthesisQuote } from "./progressionWork";
import { useState, useEffect, useRef } from "react";
import {
  BALANCE,
  exactEconomyValue,
  newINTScientific,
  formatScientific,
  axiomEconomyValue,
  type GameState,
} from "./economy";
import {
  hasProgressionNode,
  axiomLevel,
  nextModelCost,
  nextModelUpgradeCost,
  modelCore,
  knowledgeRate,
  type PrestigeNodeV2,
  type AxiomNodeV2,
  type ModelId,
} from "./progression";
import {
  axiomNodeCost,
  axiomRewardV2,
  axiomThresholdV2,
} from "./progressionReset";
import { ScientificNumber } from "./scientificNumber";
import { ResourceArt } from "./GameArt";
import "./progression-v2.css";
type Props = { s: GameState; act: (name: string, ...args: any[]) => void };
const labels = {
  H: "Hardware & Compute",
  T: "Modell & Training",
  F: "Forschung & Daten",
  W: "Items & Fertigung",
  S: "Taps & Overdrive",
  I: "INT & Wiederanlauf",
};
export function ProgressionPanel({ s, act }: Props) {
  const [layer, setLayer] = useState<"int" | "axiom">("int"),
    [selected, setSelected] = useState<PrestigeNodeV2 | AxiomNodeV2 | null>(
      null,
    ),
    [confirm, setConfirm] = useState<"prestige" | "axiom" | null>(null);
  const de = s.settings.language === "de",
    fmt = (n: ScientificNumber) =>
      formatScientific(n, 2, s.settings.numberFormat),
    meta =
      s.axiomResetCount > 0 ||
      axiomRewardV2(s).compare(ScientificNumber.from(1)) >= 0;
  const gain = newINTScientific(s),
    ag = axiomRewardV2(s),
    node = selected
      ? layer === "int"
        ? BALANCE.progression.nodes[selected as PrestigeNodeV2]
        : BALANCE.progression.axioms[selected as AxiomNodeV2]
      : null,
    cost = selected
      ? layer === "int"
        ? ScientificNumber.from(
            BALANCE.progression.nodes[selected as PrestigeNodeV2].cost,
          )
        : axiomNodeCost(s, selected as AxiomNodeV2)
      : null,
    done =
      selected &&
      (layer === "int" ? hasProgressionNode(s, selected) : cost === null),
    afford =
      cost &&
      (layer === "int"
        ? exactEconomyValue(s, "unspentINT")
        : axiomEconomyValue(s, "available")
      ).compare(cost) >= 0;
  useEffect(() => {
    if (!selected && !confirm) return;
    const before = document.activeElement as HTMLElement | null,
      overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelected(null);
        setConfirm(null);
      }
      if (e.key === "Tab") {
        const buttons = Array.from(
          document.querySelectorAll<HTMLElement>(
            ".v2-dialog button:not(:disabled),.v2-dialog input,.v2-dialog select",
          ),
        );
        const first = buttons[0],
          last = buttons.at(-1);
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", key);
    document
      .querySelector<HTMLElement>(".v2-dialog button:not(:disabled)")
      ?.focus();
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", key);
      before?.focus();
    };
  }, [selected, confirm]);
  return (
    <div className="panel progression-v2">
      {meta&&<div className="v2-tabs">
        <button
          aria-pressed={layer === "int"}
          onClick={() => {
            setSelected(null);
            setLayer("int");
          }}
        >
          INT
        </button>
        {meta && (
          <button
            aria-pressed={layer === "axiom"}
            onClick={() => {
              setSelected(null);
              setLayer("axiom");
            }}
          >
            {de ? "Axiome" : "Axioms"}
          </button>
        )}
      </div>}
      <section className="v2-summary">
        <ResourceArt id="int" />
        <div>
          <h2>{layer === "int" ? "Prestige" : de ? "Axiome" : "Axioms"}</h2>
          <span className="v2-balance-label">{de?'Verfügbar':'Available'}</span>
          <b>
            {fmt(
              layer === "int"
                ? exactEconomyValue(s, "unspentINT")
                : axiomEconomyValue(s, "available"),
            )}{" "}
            {layer === "int" ? "INT" : de ? "frei" : "available"}
          </b>
          <small>
            {layer === "int"
              ? `${Object.keys(BALANCE.progression.nodes).filter((id) => hasProgressionNode(s, id)).length} / 60 ${de ? "aktiv" : "active"}`
              : `${de ? "Zyklusziel" : "Cycle goal"} ${fmt(axiomThresholdV2(s))} INT`}
          </small>
        </div>
        <button
          disabled={
            s.retention.activeRun !== null ||
            (layer === "int" ? gain : ag).compare(ScientificNumber.from(1)) < 0
          }
          onClick={() => setConfirm(layer === "int" ? "prestige" : "axiom")}
        >
          <span>{layer==='int'?'Prestige':de?'Axiom-Neustart':'Axiom reset'}</span>
          <strong>+{fmt(layer === "int" ? gain : ag)} {layer==='int'?'INT':de?'Axiome':'Axioms'}</strong>
        </button>
      </section>
      {layer==='int'&&<section className="v2-system-info v2-company-milestone" data-company-gate={exactEconomyValue(s,"totalINTEarned").compare(ScientificNumber.from(1000))>=0?"unlocked":"locked"}><h3>{de?'◆ COMPANIES · 1.000 INT':'◆ COMPANIES · 1,000 INT'}</h3><p>{exactEconomyValue(s,'totalINTEarned').compare(ScientificNumber.from(1000))>=0?de?'Freigeschaltet. Beitritt kostenlos, Gründung 500 Gems – Online-Beleg und sicherer Account erforderlich. Kein Chat.':'Unlocked. Join for free, found for 500 Gems – requires a verified account and online proof. No chat.':de?'Später verfügbar: Ab 1.000 insgesamt verdienten INT erschließt du Companies. Beitritt gratis, Gründung 500 Gems.':'Locked until 1,000 lifetime INT. Joining is free; founding costs 500 Gems.'}</p></section>}
      <ProgressionNetwork key={layer} kind={layer} de={de} effects={s.settings.effects} onSelect={setSelected}
        labels={layer==='int'?(de?labels:{H:'Hardware & compute',T:'Models & training',F:'Research & data',W:'Items & crafting',S:'Taps & overdrive',I:'INT & recovery'}):{A:de?'Skalierung':'Scaling',B:de?'Wiederaufbau':'Recovery',C:de?'Materialien':'Materials',D:de?'KI-Entwicklung':'AI development'}}
        nodes={layer==='int'?Object.entries(BALANCE.progression.nodes).map(([id,n])=>({id:id as PrestigeNodeV2,name:n.name,order:n.cost,cost:fmt(ScientificNumber.from(n.cost))+' INT',owned:hasProgressionNode(s,id),affordable:exactEconomyValue(s,'unspentINT').compare(ScientificNumber.from(n.cost))>=0})):Object.entries(BALANCE.progression.axioms).map(([id,n],index)=>{const c=axiomNodeCost(s,id as AxiomNodeV2);return{id:id as AxiomNodeV2,name:n.name,order:index,cost:c?fmt(c)+' '+(de?'Axiome':'Axioms'):'MAX',owned:c===null,affordable:!!c&&axiomEconomyValue(s,'available').compare(c)>=0,level:axiomLevel(s,id)}}) satisfies NetworkNode[]}/>
      {!meta&&<details className="system-disclosure v2-system-info"><summary>{de?'Spätere Systeme':'Later systems'}</summary><p className="v2-note">{de?'Axiome: ab 1e6 Zyklus-INT und 30 verschiedenen Knoten.':'Axioms: 1e6 cycle INT and 30 distinct nodes.'}</p></details>}
      <AutomationSettings s={s} act={act} />
      {selected && node && (
        <div className="v2-backdrop" onClick={() => setSelected(null)}>
          <section
            className="v2-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="v2-node-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="v2-close"
              aria-label="Schließen"
              onClick={() => setSelected(null)}
            >
              ×
            </button>
            <h2 id="v2-node-title">{node.name}</h2>
            <p>{usesItemV3(s)?prestigeV3Description(selected,s.settings.language)??node.effect:node.effect}</p>
            {cost && (
              <p>
                <ResourceArt id="int" /> {fmt(cost)}{" "}
                {layer === "int" ? "INT" : de ? "Axiome" : "Axioms"}
              </p>
            )}
            <button
              disabled={!!done || !afford || !!s.retention.activeRun}
              onClick={() =>
                act(layer === "int" ? "node" : "axiom-upgrade", selected)
              }
            >
              {done ? (de ? "Erfüllt" : "Owned") : de ? "Kaufen" : "Buy"}
            </button>
          </section>
        </div>
      )}
      {confirm && (
        <div className="v2-backdrop">
          <section
            className="v2-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="v2-reset-title"
          >
            <h2 id="v2-reset-title">
              {confirm === "axiom" ? "Axiom" : "Prestige"}
            </h2>
            <p>
              {de
                ? "Credits und Hardware werden zurückgesetzt. Ausrüstung, Forschung, Komponenten und KI-Sammlung bleiben erhalten."
                : "Credits and hardware reset. Equipment, research, components and developed models remain."}
            </p>
            <p>
              {confirm === "axiom"
                ? de
                  ? "INT-Knoten und Training werden neu aufgebaut. Zusatzslots bleiben."
                  : "INT nodes and training restart. Extra slots remain."
                : hasProgressionNode(s, "T08")
                  ? de
                    ? "Training bleibt durch das Modellarchiv erhalten."
                    : "Training is archived."
                  : de
                    ? "Quality, Efficiency und Integration werden zurückgesetzt."
                    : "Quality, Efficiency and Integration reset."}
            </p>
            <p>
              {de
                ? "Noch nicht gestartete Aufträge werden vor dem Währungsreset aufgehoben. Laufendes Training geht ohne Archiv verloren; laufende Forschung, Analyse und Fertigung laufen weiter."
                : "Unstarted orders are released before currency reset. Training without archive is lost; running research, analysis and crafting continue."}
            </p>
            <button
              onClick={() => {
                act(confirm === "axiom" ? "axiom-reset" : "prestige");
                setConfirm(null);
              }}
            >
              {de ? "Reset bestätigen" : "Confirm reset"}
            </button>
            <button onClick={() => setConfirm(null)}>
              {de ? "Zurück" : "Back"}
            </button>
          </section>
        </div>
      )}
    </div>
  );
}
export function SecretLab({ s, act }: Props) {
  const [reveal, setReveal] = useState<ModelId | null>(null),
    previous = useRef(Object.keys(s.progression.models));
  const keys = Object.keys(s.progression.models);
  useEffect(() => {
    const fresh = keys.find((id) => !previous.current.includes(id));
    previous.current = keys;
    if (fresh) setReveal(fresh as ModelId);
  }, [keys.join(",")]);
  useEffect(() => {
    if (!reveal) return;
    const timer = setTimeout(() => setReveal(null), 1500);
    return () => clearTimeout(timer);
  }, [reveal]);
  const de = s.settings.language === "de",
    p = s.progression,
    fmt = (v: ScientificNumber) =>
      formatScientific(v, 2, s.settings.numberFormat);
  if (!p.lab) return null;
  return (
    <section className="v2-lab">
      {reveal && (
        <div className="v2-backdrop">
          <section
            className="v2-dialog v2-ki-reveal"
            role="dialog"
            aria-modal="true"
            aria-label={de ? "KI entwickelt" : "AI developed"}
          >
            <span className="v2-symbol">{reveal}</span>
            <h2>{BALANCE.progression.models[reveal].name}</h2>
            <p>
              {de
                ? "Entwickelt · dauerhaft in deiner Sammlung"
                : "Developed · permanently in your collection"}
            </p>
            <button autoFocus onClick={() => setReveal(null)}>
              {de ? "Weiter" : "Continue"}
            </button>
          </section>
        </div>
      )}
      <header>
        <ResourceArt id="int" />
        <div>
          <h2>{de ? "Geheimes Labor" : "Secret lab"}</h2>
          <span className="v2-balance-label">{de?'Verfügbar':'Available'}</span>
          <b>
            {fmt(ScientificNumber.fromJSON(p.knowledge))}{" "}
            {de ? "Erkenntnis" : "Insight"}
          </b>
          <small>
            +{fmt(knowledgeRate(s))}/s · {Object.keys(p.models).length}/10 KI
          </small>
        </div>
      </header>
      {p.tutorial === "lab" && (
        <div className="v2-mira">
          <b>Mira</b>
          <p>
            {de
              ? "Hier entwickelst du fähigere KI-Modelle. 1.000 Erkenntnis für deine erste zufällige KI stehen bereit. Genau ein Modell ist aktiv; Sammlung und Upgrades bleiben beim Axiom erhalten."
              : "Develop stronger AI models here. Your first random model is funded with 1,000 insight. Only one is active; the collection and upgrades survive Axioms."}
          </p>
          <button onClick={() => act("v2-tutorial-done")}>
            {de ? "Verstanden" : "Got it"}
          </button>
        </div>
      )}
      {Object.keys(p.models).length < 10 && (
        <button
          className="v2-develop"
          disabled={
            !!s.retention.activeRun ||
            ScientificNumber.fromJSON(p.knowledge).compare(nextModelCost(s)) < 0
          }
          onClick={() => act("v2-model-develop")}
        >
          {de ? "Zufällige KI entwickeln" : "Develop random AI"} ·{" "}
          {fmt(nextModelCost(s))}
          <small>
            {de
              ? "Keine Duplikate · gleiche Chance je unbekanntem Modell"
              : "No duplicates · equal chance among unknown models"}
          </small>
        </button>
      )}
      <div className="v2-model-grid">
        {Object.entries(BALANCE.progression.models).map(([key, m]) => {
          const id = key as ModelId,
            l = p.models[id],
            active = p.active === id;
          return (
            <article key={id} className={`v2-model ${active ? "active" : ""}`}>
              <span className="v2-symbol">{id}</span>
              <h3>{m.name}</h3>
              {l === undefined ? (
                <small>{de ? "Noch unbekannt" : "Undiscovered"}</small>
              ) : (
                <>
                  <b>
                    Lv {l} · {m.kind} ×
                    {(
                      1 +
                      (m.base - 1) *
                        (1 + BALANCE.progression.modelPrimaryLevel * l)
                    ).toFixed(2)}
                  </b>
                  <small>
                    {de ? "Gemeinsamer Revenue-Kern" : "Common revenue core"} ×
                    {(
                      BALANCE.progression.modelCore *
                      (1 + BALANCE.progression.modelCoreLevel * l)
                    ).toFixed(2)}
                  </small>
                  {id === "K10" && (
                    <small>
                      {l >= BALANCE.progression.formula.modelSlotsLevel ? 2 : 1}{" "}
                      {de ? "universelle Slots" : "universal slots"}
                    </small>
                  )}
                  {axiomLevel(s, "D06") > 0 && <p>{m.secondary}</p>}
                  <button
                    aria-pressed={active}
                    disabled={!!s.retention.activeRun}
                    onClick={() => act("v2-model-select", id)}
                  >
                    {active
                      ? de
                        ? "Aktiv"
                        : "Active"
                      : de
                        ? "Einsetzen"
                        : "Activate"}
                  </button>
                  <button
                    disabled={
                      !!s.retention.activeRun ||
                      l >=
                        BALANCE.progression.modelBaseLimit +
                          BALANCE.progression.formula.modelLimitStep *
                            axiomLevel(s, "D03") ||
                      ScientificNumber.fromJSON(p.knowledge).compare(
                        nextModelUpgradeCost(s, id),
                      ) < 0
                    }
                    onClick={() => act("v2-model-upgrade", id)}
                  >
                    +1 · {fmt(nextModelUpgradeCost(s, id))}
                  </button>
                </>
              )}
            </article>
          );
        })}
      </div>
      <small>
        {de ? "Aktiver Kern" : "Active core"} ×{modelCore(s).toFixed(3)} ·{" "}
        {de ? "Genau eine KI aktiv" : "Exactly one AI active"}
      </small>
    </section>
  );
}
function AutomationSettings({ s, act }: Props) {
  const de = s.settings.language === "de",
    p = s.progression;
  return (
    <details className="v2-settings">
      <summary>
        {de ? "Automation & Sparziele" : "Automation & reserves"}
      </summary>
      {hasProgressionNode(s, "I06") && (
        <>
          <label>
            <input
              type="checkbox"
              checked={s.prestigeAgent.enabled}
              onChange={() => act("prestige-agent-enabled")}
            />
            Auto-Prestige
          </label>
          <label>
            {de ? "Mindestgewinn INT" : "Minimum INT"}
            <input
              defaultValue={ScientificNumber.fromJSON(
                s.prestigeAgent.minimumReward,
              ).toScientificString()}
              onBlur={(e) =>
                act("prestige-agent-reward", e.currentTarget.value)
              }
            />
          </label>
          <label>
            {de ? "Mindestlaufzeit" : "Minimum run time"}
            <select
              value={s.prestigeAgent.minimumRunMinutes}
              onChange={(e) =>
                act("prestige-agent-minutes", Number(e.currentTarget.value))
              }
            >
              {[15, 30, 60, 120].map((n) => (
                <option key={n} value={n}>
                  {n} min
                </option>
              ))}
            </select>
          </label>
          <label>
            <input
              type="checkbox"
              checked={s.prestigeAgent.waitForTraining ?? true}
              onChange={() => act("prestige-agent-wait-training")}
            />
            {de ? "Laufendes Training abwarten" : "Wait for current training"}
          </label>
          <label>
            <input
              type="checkbox"
              checked={s.prestigeAgent.waitForAnalysis ?? true}
              onChange={() => act("prestige-agent-wait-analysis")}
            />
            {de ? "Laufende Analyse abwarten" : "Wait for current analysis"}
          </label>
        </>
      )}
      {hasProgressionNode(s, "T06") && (
        <label>
          <input
            type="checkbox"
            checked={p.trainingAuto}
            onChange={() => act("v2-training-auto")}
          />
          {de ? "Trainingsautopilot" : "Training autopilot"}
        </label>
      )}
      {(["credits", "data", "int"] as const).map((resource) => (
        <label key={resource}>
          {de ? "Sparziel" : "Reserve"} {resource}
          <input
            defaultValue={ScientificNumber.fromJSON(
              p.reserves[resource],
            ).toScientificString()}
            onBlur={(e) => act("v2-reserve", resource, e.currentTarget.value)}
          />
        </label>
      ))}
      {axiomLevel(s, "B06") > 0 && (
        <label>
          <input
            type="checkbox"
            checked={p.axiomAuto}
            onChange={() => act("v2-axiom-auto")}
          />
          Auto-Axiom
        </label>
      )}
      {hasProgressionNode(s, "T06") &&
        (["quality", "efficiency", "integration"] as const).map((track) => (
          <label key={track}>
            {track} {de ? "Ziel (0=endlos)" : "target (0=repeat)"}
            <input
              type="number"
              min="0"
              value={p.trainingTargets[track]}
              onChange={(e) =>
                act("v2-training-target", track, e.currentTarget.value)
              }
            />
          </label>
        ))}
      {hasProgressionNode(s, "I07") && (
        <>
          <label>
            {de ? "Relatives Ziel" : "Relative goal"}
            <select
              value={p.relative ?? 0}
              onChange={(e) => act("v2-relative", e.currentTarget.value)}
            >
              {[0, 2, 5, 10].map((v) => (
                <option key={v} value={v}>
                  {v === 0 ? (de ? "Aus" : "Off") : "×" + v}
                </option>
              ))}
            </select>
          </label>
          <label>
            {de ? "Zeitobergrenze (min, 0=aus)" : "Maximum run (min, 0=off)"}
            <input
              type="number"
              min="0"
              value={(p.maximumRunSeconds ?? 0) / 60}
              onChange={(e) => act("v2-max-run", e.currentTarget.value)}
            />
          </label>
        </>
      )}
      {axiomLevel(s, "B04") > 0 && (
        <>
          <button onClick={() => act("v2-rebuild-remember")}>
            {de
              ? "Bekannten Ausbau für Wiederaufbau merken"
              : "Remember known node order"}
          </button>
          <button onClick={() => act("v2-rebuild-clear")}>
            {de ? "Wiederaufbau pausieren" : "Pause rebuilding"}
          </button>
          <small>
            {p.rebuild.length} {de ? "Knoten vorgemerkt" : "nodes planned"}
          </small>
        </>
      )}
      {axiomLevel(s, "B06") > 0 && (
        <label>
          {de ? "Mindest-Axiome" : "Minimum Axioms"}
          <input
            defaultValue={ScientificNumber.fromJSON(
              p.axiomMinimum,
            ).toScientificString()}
            onBlur={(e) => act("v2-axiom-minimum", e.currentTarget.value)}
          />
        </label>
      )}
      {axiomLevel(s, "D04") > 0 &&
        (["reset", "research", "material"] as const).map((phase) => (
          <label key={phase}>
            KI · {phase}
            <select
              value={p.modelPlan[phase] ?? ""}
              onChange={(e) =>
                act("v2-model-plan", phase, e.currentTarget.value)
              }
            >
              <option value="">{de ? "Kein Wechsel" : "No switch"}</option>
              {Object.keys(p.models).map((id) => (
                <option key={id} value={id}>
                  {BALANCE.progression.models[id as ModelId].name}
                </option>
              ))}
            </select>
          </label>
        ))}
      {axiomLevel(s, "C04") > 0 && (
        <>
          <label>
            <input
              type="checkbox"
              checked={p.fusionPlanner.enabled}
              onChange={() => act("v2-fusion-enabled")}
            />
            {de ? "Fusionsplaner" : "Fusion planner"}
          </label>
          <label>
            {de ? "Zielseltenheit" : "Target rarity"}
            <select
              value={p.fusionPlanner.target}
              onChange={(e) => act("v2-fusion-target", e.currentTarget.value)}
            >
              {["uncommon", "rare", "epic", "legendary", "mythic"].map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </label>
          <small>
            {de
              ? "Nur ausdrücklich erlaubte Typen, keine ausgerüsteten oder gesperrten Items:"
              : "Only explicitly selected types, never equipped or locked items:"}
          </small>
          {[...new Set(s.inventory.map((i) => i.type))].map((type) => (
            <label key={type}>
              <input
                type="checkbox"
                checked={p.fusionPlanner.types.includes(type)}
                onChange={() => act("v2-fusion-type", type)}
              />
              {type}
            </label>
          ))}
        </>
      )}
      {hasProgressionNode(s, "I06") && (
        <>
          <label>
            <input
              type="checkbox"
              checked={s.prestigeAgent.waitForResearch ?? false}
              onChange={() => act("v2-wait-research")}
            />
            {de ? "Laufende Forschung abwarten" : "Wait for running research"}
          </label>
          <label>
            <input
              type="checkbox"
              checked={s.prestigeAgent.waitForCrafting ?? false}
              onChange={() => act("v2-wait-crafting")}
            />
            {de ? "Laufende Fertigung abwarten" : "Wait for running crafting"}
          </label>
        </>
      )}
      {p.resetIntent && (
        <button onClick={() => act("v2-resets-pause")}>
          {de ? "Automatische Resets pausieren" : "Pause automatic resets"}
        </button>
      )}
      {p.resetIntent && (
        <p>
          {de
            ? "Reset vorgemerkt. Laufende ausgewählte Aufträge werden beendet."
            : "Reset pending. Waiting for selected running jobs."}
        </p>
      )}
    </details>
  );
}
export function MaterialSynthesis({ s, act }: Props) {
  const [id, setId] = useState<import("./economy").ComponentId>("circuits"),
    q = synthesisQuote(s, id),
    de = s.settings.language === "de",
    active = s.progression.synthesis;
  return (
    <details className="v2-settings">
      <summary>
        {de ? "Gezielte Materialsynthese" : "Targeted material synthesis"}
      </summary>
      <label>
        {de ? "Komponente" : "Component"}
        <select
          value={id}
          onChange={(e) => setId(e.currentTarget.value as typeof id)}
        >
          {Object.keys(BALANCE.components).map((key) => (
            <option key={key} value={key}>
              {BALANCE.components[key as keyof typeof BALANCE.components].name}
            </option>
          ))}
        </select>
      </label>
      {active ? (
        <p>
          {
            BALANCE.components[
              active.component as keyof typeof BALANCE.components
            ].name
          }{" "}
          · {Math.min(100, (active.work / active.required) * 100).toFixed(0)} %
        </p>
      ) : (
        <button disabled={!q.allowed} onClick={() => act("v2-synthesis", id)}>
          {de ? "1 herstellen" : "Make 1"} · {formatScientific(q.cost, 0)} Data
        </button>
      )}
      {!q.access && (
        <p>
          {de
            ? "Weitere Materialgruppen werden durch Baupläne und Materialforschung geöffnet."
            : "More families unlock through blueprint and material research."}
        </p>
      )}
    </details>
  );
}
