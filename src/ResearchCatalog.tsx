import {CostBadge} from './CostBadge';
import {exactEconomyValue} from './economy';
import {BlueprintResearchRewardNotice} from './ResearchQuoteDetails';
import {
  researchAreas,
  researchAreaOrder,
  researchAccess, nextResearchStage,
} from "./researchAreas";
import { researchAreaText } from "./researchAreaText";
import {
  researchPreview,
  isRepeatableResearch,
  formatScientific,
  type GameState,
  type ResearchId,
} from "./economy";
import { researchText, projectText, prestigeText } from "./gameplayI18n";
import { ResourceArt } from "./GameArt";
export function ResearchCatalog({
  s,
  act,
  onSelect,
  block,
}: {
  s: GameState;
  act: (name: string, ...args: any[]) => void;
  onSelect: (id: ResearchId) => void;
  block: (
    quote: NonNullable<ReturnType<typeof researchPreview>>,
  ) => string | null;
}) {
  const de = s.settings.language === "de",
    language = s.settings.language,
    name = (id: ResearchId) =>
      isRepeatableResearch(id)
        ? researchText(id, language)
        : projectText(id, language);
  return (
    <div className="research-catalog">
      <BlueprintResearchRewardNotice s={s}/>
      {researchAreaOrder
        .filter(
          (area) =>
            researchAreas[area].ids.some(id=>researchAccess(s,id).allowed),
        )
        .map((area) => {
          const ids = researchAreas[area].ids as readonly ResearchId[];
          return (
            <details className="research-area-group" data-research-area={area} key={area} open={ids.some(id=>['dataGeneration','modelArchitecture','blueprints'].includes(id)||s.researchLabs.some(lab=>lab?.id===id))}>
              <summary>{researchAreaText(area, language).name}</summary>
              <div className="research-projects">
                {ids
                  .filter((id) => researchAccess(s,id).allowed && !researchPreview(s, id)!.done)
                  .map((id) => {
                    const q = researchPreview(s, id)!,
                      copy = name(id),
                      running = !!q.running,
                      reason = block(q),
                      state = running
                        ? "running"
                        : reason
                          ? "locked"
                          : "available";
                    return (
                      <button
                        type="button"
                        id={
                          id === "dataGeneration" &&
                          s.story.tutorial === "active" &&
                          s.story.target === "research"
                            ? "tutorial-data-generation"
                            : `research-${id}`
                        }
                        className={`research-card ${state}`}
                        key={id}
                        onClick={() => onSelect(id)}
                      >
                        <ResourceArt id="research" />
                        <span>
                          <h3>
                            {copy.name}
                            {isRepeatableResearch(id)
                              ? ` · Lv ${s.researchLevels[id]}`
                              : ""}
                          </h3>
                          <small>{isRepeatableResearch(id)?(de?'Wiederholbare Grundlagenforschung':'Repeatable fundamentals'):(de?'Einmaliges Schlüsselprojekt':'One-time key project')}</small><p>{copy.effect}</p>{isRepeatableResearch(id)&&<span className="research-marks" aria-label={de?'Fortschrittsmarken ohne zusätzliche Belohnung':'Progress marks without extra rewards'}>{[5,10,25,50,100].map(mark=><i className={s.researchLevels[id]>=mark?'reached':''} key={mark}>{mark}</i>)}</span>}
                          <small>
                            <CostBadge name="Data" icon={<ResourceArt id="data"/>} balance={exactEconomyValue(s,'data')} required={q.cost} de={de}/> ·{" "}
                            {(q.duration / 60).toFixed(1)} min
                          </small>
                          {reason && <small>{reason}</small>}
                        </span>
                        <i>{running ? "◷" : reason ? "🔒" : "›"}</i>
                      </button>
                    );
                  })}
              </div>
            </details>
          );
        })}
      <details className="system-disclosure"><summary>{de?'Gebiete freischalten':'Unlock areas'}</summary>{researchAreaOrder.map(area=>{const node=nextResearchStage(s,area);return node&&<section className="research-area-preview" data-research-area-preview={area} key={area}><h3>{researchAreaText(area,language).name}</h3><p>{de?'Nächste Gebietsstufe':'Next area stage'}: {prestigeText(node,language).name}</p><button onClick={()=>act('open-prestige-node',node)}>{de?'Prestige-Node ansehen':'View prestige node'}</button></section>})}</details>
      {s.completedResearch.length > 0 && (
        <details className="research-completed">
          <summary>
            {de ? "Abgeschlossen" : "Completed"} ({s.completedResearch.length})
          </summary>
          {s.completedResearch.map((id) => (
            <p key={id}>{name(id).name} ✓</p>
          ))}
        </details>
      )}
    </div>
  );
}
