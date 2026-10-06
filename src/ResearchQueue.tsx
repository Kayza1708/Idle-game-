import {
  BALANCE,
  type GameState,
  type ResearchId,
  hasNode,
  isRepeatableResearch,
  researchQueuePreview,
  researchPreview,
} from "./economy";
import { projectText, researchText } from "./gameplayI18n";
export function ResearchQueue({
  s,
  act,
}: {
  s: GameState;
  act: (name: string, ...args: any[]) => void;
}) {
  const de = s.settings.language === "de",
    language = s.settings.language;
  if (!hasNode(s, "labs2", 1)) return null;
  const name = (id: ResearchId) =>
    isRepeatableResearch(id)
      ? researchText(id, language).name
      : projectText(id, language).name;
  const labels: Record<string, string> = {
    unknown: de ? "Unbekanntes Projekt" : "Unknown project",
    locked: de
      ? "Forschungsplan im Prestige-Baum benötigt"
      : "Research plan in prestige tree required",
    completed: de ? "Abgeschlossen" : "Completed",
    requirement: de ? "Voraussetzung fehlt" : "Missing requirement",
    running: de ? "Läuft bereits" : "Already running",
    queued: de ? "Bereits vorgemerkt" : "Already queued",
    full: de ? "Queue voll" : "Queue full",
  };
  return (
    <section className="research-queue-panel">
      <h2>
        {de ? "Forschungsqueue" : "Research queue"} · {s.researchQueue.length}/2
      </h2>
      <p>
        {de
          ? "Keine Reservierung beim Vormerken. Daten und Voraussetzungen werden beim tatsächlichen Start im freien Labor erneut geprüft."
          : "No reservation when queued. Data and prerequisites are checked again when a free lab actually starts the project."}
      </p>
      <ol>
        {s.researchQueue.map((id, index) => (
          <li key={id}>
            <span>
              {name(id)} · {de ? "Zielstufe" : "Target level"}{" "}
              {researchPreview(s, id)?.level}
            </span>
            <button
              aria-label={`${de ? "Entfernen" : "Remove"} ${name(id)}`}
              onClick={() => act("research-queue-remove", id)}
            >
              ×
            </button>
          </li>
        ))}
      </ol>
      <details>
        <summary>{de ? "Projekt vormerken" : "Queue a project"}</summary>
        {(
          [
            ...Object.keys(BALANCE.researchProjects),
            ...Object.keys(BALANCE.repeatableResearch),
          ] as ResearchId[]
        ).map((id) => {
          const q = researchQueuePreview(s, id);
          return (
            <div className="queue-option" data-research-id={id} key={id}>
              <span>
                {name(id)} · {q.level}
                {q.reason && (
                  <small>
                    {labels[q.reason]}
                    {q.reason === "requirement" &&
                      `: ${name(researchPreview(s, id)!.requirement!)} 1`}
                  </small>
                )}
              </span>
              <button
                disabled={!q.allowed}
                onClick={() => act("research-queue", id)}
              >
                {de ? "Vormerken" : "Queue"}
              </button>
            </div>
          );
        })}
      </details>
    </section>
  );
}
