import {researchQueueUnlocked,researchRepeatUnlocked} from './economy';
import {visibleResearchIds} from './researchAreas';
import {
  BALANCE,
  type GameState,
  type ResearchId,
  hasNode,
  isRepeatableResearch,
  researchQueueCapacity,
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
  if (!researchQueueUnlocked(s)) return null;
  const name = (id: ResearchId) =>
    isRepeatableResearch(id)
      ? researchText(id, language).name
      : projectText(id, language).name;
  const labels: Record<string, string> = {
    unknown: de ? "Unbekanntes Projekt" : "Unknown project",
    area: de ? "Forschungsbereich gesperrt" : "Research area locked",
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
        {de ? "Forschungsqueue" : "Research queue"} · {s.researchQueue.length}/{researchQueueCapacity(s)}
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
        {visibleResearchIds(s).map((id) => {
          const q = researchQueuePreview(s, id);
          return (
            <div className="queue-option" data-research-id={id} key={id}>
              <span>
                {name(id)} · {q.level}
                {q.reason && (
                  <small>
                    {labels[q.reason]}
                    {q.reason === "requirement" &&
                      `: ${researchPreview(s,id)!.requirements.map(r=>`${name(r.id)} ${r.level}`).join(', ')}`}
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
