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
    <section className="analysis-grid">
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
                      `${componentText(drop.id, language).name} (${(drop.chance * 100).toFixed(1)}%)`,
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
                      {formatScientific(q.costExact, 1)} Data ·{" "}
                      {(q.duration / 60).toFixed(1)} min
                    </p>
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
