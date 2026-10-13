import {CostBadge} from './CostBadge';
import {exactEconomyValue} from './economy';
import {ResourceArt} from './GameArt';
import {MaterialBuildAutomation} from './MaterialBuildAutomation';
import {MaterialFocus} from './ProgressionDetails';
import { type GameState, type ExperimentId, formatScientific } from "./economy";
import {
  analysisAffordability,
  analysisBlockReason,
  analysisDropTable,
} from "./experiments";
import { ActivityArt } from "./GameArt";
import { componentText, experimentText } from "./gameplayI18n";
export function AnalysisContracts({
  s,
  act,
}: {
  s: GameState;
  act: (name: string, ...args: any[]) => void;
}) {
  const de = s.settings.language === "de",
    language = s.settings.language;
  return (
    <section className="analysis-grid"><details className="system-disclosure"><summary>{de?'Farmziel & Automation':'Farm target & automation'}</summary><MaterialFocus s={s} act={act}/><MaterialBuildAutomation s={s} kind="analysis" act={act}/></details>
      <h2>{de ? "Unabhängiger Analyseslot" : "Independent analysis slot"}</h2>
      {(["hardware", "architecture", "artifact"] as ExperimentId[]).map(
        (id) => (
          <article className="analysis-card" key={id}>
            <ActivityArt id={id} />
            <div className="analysis-copy">
              <h3>{experimentText(id, language)}</h3>
              <small>
                {de
                  ? "Mögliche Komponenten (Chancen, keine garantierten Funde)"
                  : "Possible components (chances, not guaranteed finds)"}
                :{" "}
                {analysisDropTable(s, id)
                  .map(
                    (drop) =>
                      `${componentText(drop.id, language).name} (${(drop.chance * 100).toPrecision(3)}%)`,
                  )
                  .join(", ")}
              </small>
              {(["short", "long"] as const).map((length) => {
                const q = analysisAffordability(s, id, length),
                  reason = analysisBlockReason(s, id, length, de ? "de" : "en");
                return (
                  <div
                    className="contract-option"
                    id={`analysis-${id}-${length}`}
                    key={length}
                  >
                    <b>
                      {length === "short"
                        ? de
                          ? "Kurzvertrag"
                          : "Short contract"
                        : de
                          ? "Langvertrag"
                          : "Long contract"}
                    </b>
                    <p>
                      <CostBadge name="Data" icon={<ResourceArt id="data"/>} balance={exactEconomyValue(s,'data')} required={q.costExact} de={de}/> {q.dataFactor<1&&<small>{de?'Datenpipeline':'Data pipeline'}: {q.baseCost.data} ×{q.dataFactor}, {de?'aufgerundet':'rounded up'}</small>} ·{" "}
                      {(q.duration / 60).toFixed(1)} min
                    </p>
                    <p>{de?'Grunddauer':'Base duration'}: {q.baseDuration/60} min · {de?'Grundbelohnungsfaktor':'Base reward factor'}: {q.rewardFactor.toFixed(6)}</p>
                    <p>{de?'Langpreis pro gleicher Grundbelohnung':'Long price per equal base reward'}: {Math.round(q.longPriceFactor*100)}% ({de?'20 % Mengenrabatt':'20% bulk discount'})</p>
                    <dl>{(['components','research','blueprints'] as const).map((key)=><div key={key}><dt>{key==='components'?(de?'Komponenten':'Components'):key==='research'?(de?'Forschungsfragmente':'Research fragments'):(de?'Bauplanfragmente':'Blueprint fragments')}</dt><dd>{q.rewards[key].whole} {de?'ganz beim Abschluss':'whole at completion'} + {q.rewards[key].remainder.toFixed(6)} {de?'Rest (inkl. angesammelter Bruchteile)':'remainder (including accumulated fractions)'}</dd></div>)}</dl>
                    <p>{de?'Reguläre Grundbelohnung vor Mengenboni':'Regular base reward before quantity bonuses'}: {(q.baseRewards.components*q.rewardFactor).toFixed(6)} {de?'Komponenten':'components'}, {(q.baseRewards.research*q.rewardFactor).toFixed(6)} {de?'Forschungsfragmente':'research fragments'}, {(q.baseRewards.blueprints*q.rewardFactor).toFixed(6)} {de?'Bauplanfragmente':'blueprint fragments'}</p>
                    <p>{de?'Zusätzliche Mengenboni':'Additional quantity bonuses'}: ×{q.additional.quantityBonus.toFixed(3)} · {de?'Itemwurf-Chance':'Item roll chance'}: {(q.itemChance*100).toFixed(3)}%</p>
                    <p>{q.additional.rareGuarantee?(de?'Analyse III: mindestens eine seltene Komponente zusätzlich gesichert; keine Grundbelohnung.':'Analysis III: at least one rare component ensured separately; not a base reward.'):(de?'Keine Seltenheitsgarantie.':'No rare-component guarantee.')} {q.additional.combinationFactor>1&&<span>{de?'Materialkartierung':'Material mapping'}: ×{q.additional.combinationFactor}, {de?'beim Start festgelegt; je Material abgerundet':'fixed at start; rounded down per material'}.</span>}</p>
                    {reason && <p role="status">{reason}</p>}
                    <button
                      id={
                        id === "hardware" && length === "short"
                          ? "tutorial-hardware-analysis"
                          : undefined
                      }
                      disabled={!!reason}
                      onClick={() => act("experiment", id, length)}
                    >
                      {de ? "ANALYSE STARTEN" : "START ANALYSIS"}
                    </button>
                  </div>
                );
              })}
            </div>
          </article>
        ),
      )}
    </section>
  );
}
