import { itemImprovementHasEffect } from "./itemMechanics";
import { useState } from "react";
import {
  BALANCE,
  type GameState,
  type ModuleId,
  type ItemTypeId,
  type ComponentId,
  type Item,
  itemTypes,
  componentIds,
  itemEffectProfile,
  itemEffectFor,
  deepPrestigeBonus,
  equipmentSlotCount,
  formatScientific,
} from "./economy";
import {
  equipmentEligibility,
  craftingAffordability,
  craftingMissingText,
  itemImprovementPreview,
  fusionPreview,
  rarities,
} from "./inventory";
import { ActivityArt, ComponentArt, ItemArt } from "./GameArt";
import {
  componentText,
  itemText,
  moduleText,
  rarityText,
  effectText,
} from "./gameplayI18n";
import { MobileDetailSheet } from "./MobileDetailSheet";
import { JobDetails } from "./JobDetails";
import { ScientificNumber } from "./scientificNumber";
type Action = (name: string, ...args: any[]) => void;
export function InventoryScreen({ s, act }: { s: GameState; act: Action }) {
  const language = s.settings.language,
    de = language === "de",
    [view, setView] = useState<
      "components" | "modules" | "workbench" | "items"
    >("components"),
    [component, setComponent] = useState<ComponentId | null>(null),
    [itemId, setItemId] = useState<string | null>(null),
    [fusion, setFusion] = useState<string[]>([]),
    [quantity, setQuantity] = useState(1);
  const item = s.inventory.find((i) => i.id === itemId),
    jobs = [s.crafting.active, ...s.crafting.queue].filter((j) => !!j),
    equipped = (id: string) => Object.values(s.equipped).includes(id);
  const source = () => {
    setComponent(null);
    act("open-analysis", "hardware");
  };
  const moduleLink = (id: ModuleId) => {
    setView("modules");
    requestAnimationFrame(() =>
      document
        .getElementById(`recipe-${id}`)
        ?.scrollIntoView({ block: "center" }),
    );
  };
  const effect = (entry: Item) => (
    <ul>
      {[...new Set(itemEffectProfile(entry))].map((e) => (
        <li key={e}>
          {effectText(e, language)}:{" "}
          {e === "training"
            ? de
              ? "Derzeit ohne Trainingswirkung (Rate 1)"
              : "Currently no training effect (rate 1)"
            : e === "relay" || e === "int-yield"
              ? effectText(e, language)
              : `+${(itemEffectFor(s, entry, e) * (1 + deepPrestigeBonus(s, "manufacturing")) * 100).toFixed(2)} %`}
        </li>
      ))}
    </ul>
  );
  const recipeCard = (kind: "module" | "item", id: string) => {
    const q = craftingAffordability(s, kind, id, quantity),
      recipe = q.recipe,
      name =
        kind === "module"
          ? moduleText(id as ModuleId, language)
          : itemText(id as ItemTypeId, language);
    return (
      <article id={`recipe-${id}`} className="recipe-card" key={id}>
        {kind === "item" ? (
          <ItemArt type={id as ItemTypeId} />
        ) : (
          <ActivityArt id="workbench" />
        )}
        <h3>{name}</h3>
        {kind === "module" && (
          <>
            <p>
              {de ? "Verfügbar" : "Available"}: {s.modules[id as ModuleId]} ·{" "}
              {de ? "Reserviert" : "Reserved"}:{" "}
              {jobs.reduce(
                (n, j) =>
                  n +
                  ((j!.ingredients.modules[id as ModuleId] ?? 0) /
                    j!.quantity) *
                    (j!.quantity - j!.completed),
                0,
              )}
            </p>
            <p>
              {de ? "Zutat für" : "Ingredient for"}:{" "}
              {Object.entries(BALANCE.itemRecipes)
                .filter(([, r]) => id in r.modules)
                .map(([type]) => itemText(type as ItemTypeId, language))
                .join(", ")}
            </p>
          </>
        )}
        {recipe && (
          <>
            <p>
              {de ? "Ergebnis" : "Result"}: {name} ×{recipe.quantity}{" "}
              {recipe.result.rarity &&
                rarityText(recipe.result.rarity, language)}{" "}
              · {recipe.durationPerUnit * recipe.quantity} s
            </p>
            <p>
              {formatScientific(
                ScientificNumber.from(recipe.ingredients.data),
                1,
              )}{" "}
              Data · {recipe.ingredients.blueprints}{" "}
              {de ? "Bauplanfragmente" : "Blueprint fragments"}
            </p>
            <ul>
              {Object.entries(recipe.ingredients.components).map(([key, n]) => (
                <li key={key}>
                  <button
                    className="ingredient-link"
                    onClick={() =>
                      q.missingComponents[key as ComponentId]
                        ? source()
                        : setComponent(key as ComponentId)
                    }
                  >
                    {componentText(key as ComponentId, language).name} ×{n}
                    {q.missingComponents[key as ComponentId]
                      ? ` · ${de ? "Fehlt" : "Missing"} ${q.missingComponents[key as ComponentId]}`
                      : ""}
                  </button>
                </li>
              ))}
              {Object.entries(recipe.ingredients.modules).map(([key, n]) => (
                <li key={key}>
                  <button
                    className="ingredient-link"
                    onClick={() => moduleLink(key as ModuleId)}
                  >
                    {moduleText(key as ModuleId, language)} ×{n}
                    {q.missingModules[key as ModuleId]
                      ? ` · ${de ? "Fehlt" : "Missing"} ${q.missingModules[key as ModuleId]}`
                      : ""}
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
        {Object.keys(q.missingComponents).length > 0 &&
          !s.discovered.includes("sbc") && (
            <p>
              {de
                ? "Analysequelle gesperrt: Einplatinencomputer entdecken. Aktive Drops am AI-Kern bleiben ein Beschaffungsweg."
                : "Analysis source locked: discover the single-board computer. Active AI core drops remain an acquisition path."}
            </p>
          )}
        {!q.affordable && (
          <p role="status">{craftingMissingText(q, language)}</p>
        )}
        {!q.unlocked && (
          <button
            onClick={() =>
              kind === "module"
                ? act("open-research", "blueprints")
                : id === "impulse-relay"
                  ? source()
                  : act("open-prestige-node", "researchArchive")
            }
          >
            {kind === "module"
              ? de
                ? "Offene Baupläne erforschen"
                : "Research Open Blueprints"
              : id === "impulse-relay"
                ? de
                  ? "Bauplan: Hardwareanalyse abschließen"
                  : "Blueprint: complete hardware analysis"
                : de
                  ? "Bauplan: Forschungsarchiv im Prestige-Baum"
                  : "Blueprint: Research Archive in prestige tree"}
          </button>
        )}
        {q.missingBlueprints > 0 && (
          <button onClick={() => source()}>
            {de
              ? "Bauplanfragmente: Hardwareanalyse"
              : "Blueprint fragments: hardware analysis"}
          </button>
        )}
        {q.data.missing > 0 && (
          <button
            onClick={() =>
              act("view-goal", "workshop", undefined, "tutorial-hardware")
            }
          >
            {de ? "Data-Produktion: Hardware" : "Data production: hardware"}
          </button>
        )}
        <button
          id={`tutorial-recipe-${id}`}
          disabled={!q.affordable}
          onClick={() =>
            kind === "module"
              ? act("craft-module", id, quantity)
              : act("craft", id, recipe!.result.rarity, quantity)
          }
        >
          {de ? "Herstellen" : "Craft"} ×{quantity}
        </button>
      </article>
    );
  };
  return (
    <div className="panel mobile-screen inventory-screen">
      <header className="mobile-screen-title">
        <h1>{de ? "Inventar" : "Inventory"}</h1>
        <button onClick={() => act("open-equipment")}>
          {de ? "Ausrüstung" : "Equipment"}{" "}
          {Object.values(s.equipped).filter(Boolean).length}/
          {equipmentSlotCount(s)}
        </button>
      </header>
      <div className="mobile-segments inventory-segments" role="tablist">
        {(["components", "modules", "workbench", "items"] as const).map(
          (id) => (
            <button
              key={id}
              role="tab"
              aria-selected={view === id}
              onClick={() => setView(id)}
            >
              {id === "components"
                ? de
                  ? "Komponenten"
                  : "Components"
                : id === "modules"
                  ? de
                    ? "Module"
                    : "Modules"
                  : id === "workbench"
                    ? de
                      ? "Baupläne / Herstellung"
                      : "Blueprints / crafting"
                    : de
                      ? "Items / Ausrüstung"
                      : "Items / equipment"}
            </button>
          ),
        )}
      </div>
      {view === "components" && (
        <>
          <p>
            {s.blueprintFragments}{" "}
            {de ? "Bauplanfragmente" : "Blueprint fragments"}
          </p>
          <section id="tutorial-components" className="mobile-component-grid">
            {componentIds.map((id) => (
              <button
                className="component-tile"
                key={id}
                onClick={() => setComponent(id)}
              >
                <ComponentArt id={id} />
                <strong>×{s.componentInventory[id]}</strong>
                <span>{componentText(id, language).name}</span>
                <small>
                  {de ? "Reserviert" : "Reserved"}:{" "}
                  {jobs.reduce(
                    (n, j) =>
                      n +
                      ((j!.ingredients.components[id] ?? 0) / j!.quantity) *
                        (j!.quantity - j!.completed),
                    0,
                  )}
                </small>
              </button>
            ))}
          </section>
        </>
      )}
      {(view === "modules" || view === "workbench") && (
        <>
          <JobDetails s={s} />
          <label className="craft-quantity">
            {de ? "Auftragsmenge" : "Order quantity"}
            <input
              aria-label={de ? "Auftragsmenge" : "Order quantity"}
              type="number"
              min="1"
              step="1"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
            />
          </label>
          <p>
            {de
              ? "Zutaten werden beim Start vollständig reserviert. Abbruch und Erstattung nur für wartende Aufträge."
              : "Ingredients are fully reserved on start. Cancellation and refund apply only to waiting orders."}
          </p>
          {s.crafting.queue.map((job) => (
            <div className="queue-option" key={job.id}>
              <span>
                {job.recipeId} ×{job.quantity}
              </span>
              <button onClick={() => act("craft-cancel", job.id)}>
                {de ? "Abbrechen / erstatten" : "Cancel / refund"}
              </button>
            </div>
          ))}
          <section className="recipe-list">
            {view === "modules"
              ? (Object.keys(BALANCE.modules) as ModuleId[]).map((id) =>
                  recipeCard("module", id),
                )
              : (Object.keys(BALANCE.itemRecipes) as ItemTypeId[]).map((id) =>
                  recipeCard("item", id),
                )}
          </section>
        </>
      )}
      {view === "items" && (
        <>
          <button
            className="equipment-strip"
            onClick={() => act("open-equipment")}
          >
            {de ? "Ausrüstung öffnen" : "Open equipment"}
          </button>
          {!s.inventory.length && (
            <p>
              {de
                ? "Noch keine Items. Vorhandene Baupläne findest du unter Herstellung."
                : "No items yet. Existing recipes are available under crafting."}
            </p>
          )}
          <section className="mobile-item-grid">
            {s.inventory.map((entry) => (
              <button
                className={`item-tile rarity-${entry.rarity}`}
                key={entry.id}
                onClick={() => {
                  setItemId(entry.id);
                  setFusion([]);
                }}
              >
                <ItemArt type={entry.type} />
                <span>{itemText(entry.type, language)}</span>
                <small>
                  {entry.id} · {rarityText(entry.rarity, language)} · Lv{" "}
                  {entry.level}
                </small>
                {equipped(entry.id) && <i>{de ? "Ausgerüstet" : "Equipped"}</i>}
              </button>
            ))}
          </section>
        </>
      )}
      {component && (
        <MobileDetailSheet
          closeLabel={de ? "Schließen" : "Close"}
          title={componentText(component, language).name}
          art={<ComponentArt id={component} />}
          onClose={() => setComponent(null)}
        >
          <p>×{s.componentInventory[component]}</p>
          <p>{componentText(component, language).source}</p>
          <button onClick={() => source()}>
            {de ? "Zur Hardwareanalyse" : "Go to hardware analysis"}
          </button>
          {!s.discovered.includes("sbc") && (
            <p>
              {de
                ? "Quelle gesperrt: Einplatinencomputer entdecken."
                : "Source locked: discover the single-board computer."}
            </p>
          )}
          <button
            disabled={s.retention.activeRun?.id === "no-taps"}
            onClick={() => {
              setComponent(null);
              act("view-goal", "workshop", undefined, "tutorial-tap");
            }}
          >
            {s.retention.activeRun?.id === "no-taps"
              ? de
                ? "Challenge sperrt aktive Taps"
                : "Challenge blocks active taps"
              : de
                ? "Aktive Drops: AI-Kern"
                : "Active drops: AI core"}
          </button>
        </MobileDetailSheet>
      )}
      {item && (
        <MobileDetailSheet
          closeLabel={de ? "Schließen" : "Close"}
          title={itemText(item.type, language)}
          art={<ItemArt type={item.type} />}
          onClose={() => setItemId(null)}
        >
          <p>
            {item.id} · {rarityText(item.rarity, language)} · Lv {item.level} ·{" "}
            {de ? "Schmiedestufe" : "Forge level"} {item.forge ?? 0}
          </p>
          <p>
            {equipped(item.id)
              ? de
                ? "Ausgerüstet"
                : "Equipped"
              : de
                ? "Nicht ausgerüstet: Effekte nicht aktiv"
                : "Unequipped: effects inactive"}
            {s.retention.activeRun?.id === "no-items" &&
              ` · ${de ? "Challenge deaktiviert Itemeffekte" : "Challenge disables item effects"}`}
          </p>
          <p>
            {de
              ? "Bonusbeiträge vor Kombination und Synergie; nur ausgerüstet wirksam."
              : "Bonus contributions before combination and synergy; effective only while equipped."}
          </p>
          {effect(item)}
          <button
            disabled={!equipmentEligibility(s, item.id).allowed}
            onClick={() => act("equip", item.id)}
          >
            {de ? "Ausrüsten" : "Equip"}
          </button>
          {equipmentEligibility(s, item.id).reason === "no-socket" && (
            <p>
              {de
                ? "Kein freier Ausrüstungsplatz; bestehenden Platz ersetzen oder weiteren Platz im Equipment-Dialog freischalten."
                : "No free equipment socket; replace an occupied socket or unlock another socket in the equipment dialog."}
            </p>
          )}
          {s.prestigeCount < 1 && (
            <p>{de ? "Benötigt erstes Prestige" : "Requires first prestige"}</p>
          )}
          <button onClick={() => act("lock", item.id)}>
            {item.locked
              ? de
                ? "Entsperren"
                : "Unlock"
              : de
                ? "Sperren"
                : "Lock"}
          </button>
          {(["upgrade", "forge"] as const).map((action) => {
            const q = itemImprovementPreview(s, item.id, action)!,
              effective = itemImprovementHasEffect(s, item, q.result);
            return (
              <section className="improvement-card" key={action}>
                <h3>
                  {action === "upgrade"
                    ? de
                      ? "Aufwerten"
                      : "Upgrade"
                    : de
                      ? "Schmieden"
                      : "Forge"}
                </h3>
                <p>
                  {q.componentCost} {componentText("circuits", language).name} ·{" "}
                  {formatScientific(ScientificNumber.from(q.dataCost), 1)} Data
                </p>
                <p>
                  {de ? "Ergebnis" : "Result"}:{" "}
                  {rarityText(q.result.rarity, language)} · Lv {q.result.level}{" "}
                  · {de ? "Schmiedestufe" : "Forge level"} {q.result.forge ?? 0}
                </p>
                {q.allowed && effect(q.result)}
                {!effective && (
                  <p>
                    {de
                      ? "Dieser Verbesserungsweg hat für die vorhandenen Effekte derzeit keine Wirkung; nicht bedienbar."
                      : "This improvement currently has no effect on the existing bonuses; unavailable."}
                  </p>
                )}
                {q.reason && (
                  <p role="status">
                    {q.reason === "maximum"
                      ? de
                        ? "Maximalstufe erreicht"
                        : "Maximum reached"
                      : q.reason === "circuits"
                        ? `${q.missingComponents} ${componentText("circuits", language).name} ${de ? "fehlen" : "missing"}`
                        : q.reason === "data"
                          ? `${q.data.missingExact.toScientificString()} Data ${de ? "fehlen" : "missing"}`
                          : de
                            ? "Ungültige Ressourcen"
                            : "Invalid resources"}
                  </p>
                )}
                <button
                  disabled={!q.allowed || !effective}
                  onClick={() => {
                    if (
                      confirm(
                        `${de ? "Kosten bestätigen" : "Confirm costs"}: ${q.componentCost} ${componentText("circuits", language).name}, ${q.dataCost} Data · ${item.id}`,
                      )
                    )
                      act(action, item.id);
                  }}
                >
                  {action === "upgrade"
                    ? de
                      ? "Aufwerten"
                      : "Upgrade"
                    : de
                      ? "Schmieden"
                      : "Forge"}
                </button>
              </section>
            );
          })}
          <section className="improvement-card">
            <h3>
              {de
                ? "Fusion: drei gleiche Items"
                : "Fusion: three matching items"}
            </h3>
            <p>
              {de
                ? "Drei Instanzen werden verbraucht; Qualität steigt um eine Stufe, Level und Schmiedestufe des neuen Items sind 0. Keine weiteren Ressourcenkosten."
                : "Three instances are consumed; rarity increases one tier, new item level and forge level are 0. No additional resource cost."}
            </p>
            {s.inventory
              .filter((i) => i.type === item.type && i.rarity === item.rarity)
              .map((i) => (
                <label className="fusion-choice" key={i.id}>
                  <input
                    type="checkbox"
                    disabled={i.locked || equipped(i.id)}
                    checked={fusion.includes(i.id)}
                    onChange={(e) =>
                      setFusion(
                        e.target.checked
                          ? [...fusion, i.id]
                          : fusion.filter((id) => id !== i.id),
                      )
                    }
                  />
                  {i.id} · Lv {i.level} · +{i.forge ?? 0}
                  {i.locked || equipped(i.id)
                    ? ` · ${de ? "Geschützt" : "Protected"}`
                    : ""}
                </label>
              ))}
            <p role="status">
              {fusionPreview(s, fusion).reason === "protected"
                ? de
                  ? "Gesperrte oder ausgerüstete Instanzen sind geschützt"
                  : "Locked or equipped instances are protected"
                : fusionPreview(s, fusion).reason === "maximum"
                  ? de
                    ? "Mythische Items können nicht fusioniert werden"
                    : "Mythic items cannot be fused"
                  : fusionPreview(s, fusion).allowed
                    ? `${de ? "Ergebnis" : "Result"}: ${rarityText(fusionPreview(s, fusion).result!.rarity, language)}`
                    : de
                      ? "Genau drei unterschiedliche, ungeschützte Instanzen gleicher Art und Qualität auswählen"
                      : "Select exactly three distinct unprotected instances of the same type and rarity"}
            </p>
            {fusionPreview(s, fusion).allowed && (
              <>
                <p>{de ? "Effekte des Ergebnisses" : "Result effects"}</p>
                {effect({
                  ...item,
                  rarity: fusionPreview(s, fusion).result!.rarity,
                  level: 0,
                  forge: 0,
                })}
                {!itemImprovementHasEffect(s, item, {
                  ...item,
                  rarity: fusionPreview(s, fusion).result!.rarity,
                  level: 0,
                  forge: 0,
                }) && (
                  <p>
                    {de
                      ? "Qualitätswechsel ohne angewendete Bonusänderung: derzeit nicht bedienbar."
                      : "Rarity change without an applied bonus change: currently unavailable."}
                  </p>
                )}
              </>
            )}
            <button
              disabled={
                !fusionPreview(s, fusion).allowed ||
                !itemImprovementHasEffect(s, item, {
                  ...item,
                  rarity:
                    fusionPreview(s, fusion).result?.rarity ?? item.rarity,
                  level: 0,
                  forge: 0,
                })
              }
              onClick={() => {
                const q = fusionPreview(s, fusion);
                if (
                  q.allowed &&
                  confirm(
                    `${de ? "Instanzen unwiderruflich verbrauchen" : "Permanently consume instances"}: ${fusion.join(", ")} → ${rarityText(q.result!.rarity, language)}`,
                  )
                ) {
                  act("item-fuse", fusion);
                  setFusion([]);
                  setItemId(null);
                }
              }}
            >
              {de ? "Fusion bestätigen" : "Confirm fusion"}
            </button>
          </section>
          <button
            disabled={item.locked || equipped(item.id)}
            onClick={() => {
              if (
                confirm(
                  `${de ? "Verbrauchen" : "Consume"} ${item.id} → ${BALANCE.rarity[item.rarity].salvage} ${componentText("circuits", language).name}?`,
                )
              ) {
                act("salvage", item.id);
                setItemId(null);
              }
            }}
          >
            {de ? "Zerlegen" : "Salvage"}
          </button>
        </MobileDetailSheet>
      )}
    </div>
  );
}
