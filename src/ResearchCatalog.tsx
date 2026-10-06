import {
  researchAreas,
  researchAreaOrder,
  nextResearchArea,
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
    next = nextResearchArea(s),
    name = (id: ResearchId) =>
      isRepeatableResearch(id)
        ? researchText(id, language)
        : projectText(id, language);
  return (
    <div className="research-catalog">
      {(["initial", ...researchAreaOrder] as const)
        .filter(
          (area) =>
            area === "initial" || (s.researchAreas ?? []).includes(area),
        )
        .map((area) => {
          const ids = researchAreas[area].ids as readonly ResearchId[];
          return (
            <section data-research-area={area} key={area}>
              <h2>{researchAreaText(area, language).name}</h2>
              {area !== "initial" && (
                <small>
                  {de ? "Dauerhaft freigeschaltet" : "Permanently unlocked"}
                </small>
              )}
              <div className="research-projects">
                {ids
                  .filter((id) => !researchPreview(s, id)!.done)
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
                          <p>{copy.effect}</p>
                          <small>
                            {formatScientific(q.cost, 1)} Data ·{" "}
                            {(q.duration / 60).toFixed(1)} min
                          </small>
                          {reason && <small>{reason}</small>}
                        </span>
                        <i>{running ? "◷" : reason ? "🔒" : "›"}</i>
                      </button>
                    );
                  })}
              </div>
            </section>
          );
        })}
      {next && (
        <section
          className="research-area-preview"
          data-research-area-preview={next}
        >
          <h2>
            {de ? "Nächster Forschungsbereich" : "Next research area"}:{" "}
            {researchAreaText(next, language).name}
          </h2>
          <p>{researchAreaText(next, language).benefit}</p>
          <p>
            {de ? "Dauerhaft zugänglich durch" : "Permanent access through"}{" "}
            {prestigeText(researchAreas[next].node, language).name}
          </p>
          <button
            type="button"
            onClick={() => act("open-prestige-node", researchAreas[next].node)}
          >
            {de ? "Prestige-Node ansehen" : "View prestige node"}
          </button>
        </section>
      )}
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
