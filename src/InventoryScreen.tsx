import {CostBadge} from './CostBadge';
import {exactEconomyValue} from './economy';
import {ResourceArt} from './GameArt';
import {BonusBoxes} from './BonusBoxPanel';
import {MaterialBuildAutomation} from './MaterialBuildAutomation';
import {FoundryDetails,ItemForgeDetails,DeviceDetails,RecoveryDetails} from './ProgressionDetails';
import {BlueprintMasteryDetails,ComponentSources} from './ItemProgressDetails';
import {DataItemComparison} from './DataComparison';
import {ResearchItemComparison} from './ResearchItemComparison';
import {RecipeIngredient} from './RecipeIngredient';
import {blueprintQuote} from './blueprints';
import {specialItemEffectText,specialItemComparisonText} from './specialItemText';
import {TrainingItemCostComparison} from "./TrainingCostDetails";
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
    requestAnimationFrame(() => {
      const target=document.getElementById(`recipe-${id}`);
      target?.closest<HTMLDetailsElement>('details')?.setAttribute('open','');
      target?.scrollIntoView({block:'nearest'});
    });
  };
  const effect = (entry: Item) => (
    <ul>
      {[...new Set(itemEffectProfile(entry))].map((e) => (
        <li key={e}>
          {e==="research"?(de?"Laborleistung (B, vor Synergiepotenz)":"Laboratory contribution (B, before synergy power)"):e==="data"?(de?"Gemeinsamer Data-Bonusbeitrag (B)":"Shared Data bonus contribution (B)"):effectText(e, language)}{e === "training" ? " (B)" : ""}:{" "}
          {e === "relay" || e === "int-yield"
              ? specialItemEffectText(s,entry)
              : `+${(itemEffectFor(s, entry, e) * (1 + deepPrestigeBonus(s, "manufacturing")) * 100).toFixed(2)} %`}
        </li>
      ))}
    </ul>
  );
  const recipeCard = (kind: "module" | "item", id: string) => {
    const q = craftingAffordability(s, kind, id, quantity),
      recipe = q.recipe,
      blueprint = kind==='item'?blueprintQuote(s,id):null,
      name =
        kind === "module"
          ? moduleText(id as ModuleId, language)
          : itemText(id as ItemTypeId, language);
    return (
      <details className="recipe-disclosure" key={id}><summary>{kind==='item'?<ItemArt type={id as ItemTypeId}/>:<ActivityArt id="workbench"/>}<span>{name}</span><b className={q.affordable?'sufficient':'insufficient'}>{q.affordable?'✓':'›'}</b></summary><article id={`recipe-${id}`} className="recipe-card">
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
        {kind==='item'&&<><details className="system-disclosure"><summary>{de?"Bauplan & Mastery":"Blueprint & mastery"}</summary><BlueprintMasteryDetails s={s} id={id as ItemTypeId} act={act}/></details><button onClick={()=>act('pin-goal',{kind:'item-craft',id,target:s.craftedItemCounts[id as ItemTypeId]+1})}>{de?'Herstellung anheften':'Pin crafting'}</button></>}
        {recipe && (
          <>
            <p>
              {de ? "Ergebnis" : "Result"}: {name} ×{recipe.quantity}{" "}
              {recipe.result.rarity &&
                rarityText(recipe.result.rarity, language)}{" "}
              · {recipe.durationPerUnit * recipe.quantity} s
              {kind==="item" && " · Level 0 · Forge 0"}
            </p>
            {kind==="item" && <details className="recipe-result-effects system-disclosure"><summary>{de?"Effekte":"Effects"}</summary>
              <p>{de?"Common-Effekte nach Ausrüsten":"Common effects when equipped"}</p>
              {effect({id:`preview-${id}`,type:id as ItemTypeId,rarity:recipe.result.rarity!,level:0,forge:0,locked:false})}
            </details>}
            <div className="manufacturing-cost"><CostBadge name="Data" icon={<ResourceArt id="data"/>} balance={exactEconomyValue(s,'data')} required={recipe.ingredients.data} de={de}/></div>
            <ul className="recipe-ingredients">
              {Object.entries(recipe.ingredients.components).filter(([,n])=>Number(n)>0).map(([key, n]) => (
                <RecipeIngredient key={key} name={componentText(key as ComponentId,language).name}
                  icon={<ComponentArt id={key as ComponentId}/>} balance={s.componentInventory[key as ComponentId]}
                  required={n??0} missing={q.missingComponents[key as ComponentId]??0} de={de}
                  onClick={()=>setComponent(key as ComponentId)}/>
              ))}
              {Object.entries(recipe.ingredients.modules).filter(([,n])=>Number(n)>0).map(([key, n]) => (
                <RecipeIngredient key={key} name={moduleText(key as ModuleId,language)}
                  icon={<ActivityArt id="workbench"/>} balance={s.modules[key as ModuleId]}
                  required={n??0} missing={q.missingModules[key as ModuleId]??0} de={de}
                  onClick={()=>moduleLink(key as ModuleId)}/>
              ))}
            </ul>
          </>
        )}
        {q.recycling.fraction>0&&<p>{de?'Materialrecycling bei jedem Item-Abschluss: 5 % der reservierten Komponenten; Bruchteile werden je Typ gespeichert. Keine Module oder Data zurück.':'Material recycling at each item completion: 5% of reserved components; fractions are stored separately per type. No modules or Data returned.'}</p>}
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
        {kind==='item' && 'research' in BALANCE.itemRecipes[id as keyof typeof BALANCE.itemRecipes] && <p className="recipe-prerequisite">{de?'Voraussetzung: Offene Baupläne abgeschlossen':'Prerequisite: Open Blueprints completed'} · {blueprint?.prerequisite?(de?'Abgeschlossen':'Completed'):(de?'Noch nicht abgeschlossen':'Not completed')}</p>}
        {(kind==='module'?!q.unlocked:!blueprint?.prerequisite) && (
          <button
            onClick={() =>
              kind === "module" || (kind==='item' && 'research' in BALANCE.itemRecipes[id as keyof typeof BALANCE.itemRecipes])
                ? act("open-research", "blueprints")
                : id === "impulse-relay"
                  ? source()
                  : act("open-prestige-node", "researchArchive")
            }
          >
            {kind === "module" || (kind==='item' && 'research' in BALANCE.itemRecipes[id as keyof typeof BALANCE.itemRecipes])
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
        {blueprint && blueprint.price>0 && (
          <section className="blueprint-learning">
            <p>{`${de?'Einmaliger Lernpreis':'One-time learning price'}: ${blueprint.price} ${de?'Bauplanfragmente':'blueprint fragments'} · ${de?'Bestand':'Balance'}: ${blueprint.balance} · ${de?'Fehlt':'Missing'}: ${blueprint.missing}`}</p>
            {blueprint.learned && <p>{de?'Bauplan dauerhaft gelernt':'Blueprint permanently learned'}</p>}
            {!blueprint.learned && <button disabled={!blueprint.canLearn} onClick={()=>{
              if(confirm(`${de?'Bauplan lernen':'Learn blueprint'}: ${name}\n${de?'Bauplanfragmente vorher → nachher':'Blueprint fragments before → after'}: ${blueprint.balance} → ${blueprint.balance-blueprint.price}`))act('blueprint-learn',id);
            }}>{de?'Bauplan lernen':'Learn blueprint'}</button>}
          </section>
        )}
        {(blueprint?.missing??0) > 0 && (
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
      </article></details>
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
      <BonusBoxes s={s} act={act}/>
      <div className="mobile-segments inventory-segments" role="tablist">
        {(["components", "modules", "workbench", "items"] as const).map(
          (id) => (
            <button
              key={id}
              id={`tutorial-subtab-${id}`}
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
                      ? "Werkstatt"
                      : "Crafting"
                    : de
                      ? "Items"
                      : "Items"}
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
                data-empty={s.componentInventory[id]===0}
                key={id}
                aria-label={`${componentText(id,language).name} ×${s.componentInventory[id]}`}
                onClick={() => setComponent(id)}
              >
                <ComponentArt id={id} />
                <strong>×{s.componentInventory[id]}</strong>
                <span className="component-name">{componentText(id, language).name}</span>

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
          <details className="system-disclosure"><summary>{de?'Auftragsregeln':'Order rules'}</summary><p>
            {de
              ? "Zutaten werden beim Start vollständig reserviert. Abbruch und Erstattung nur für wartende Aufträge."
              : "Ingredients are fully reserved on start. Cancellation and refund apply only to waiting orders."}
          </p></details>
          {s.crafting.queue.map((job) => (
            <div className="queue-option" key={job.id}>
              <span>
                {job.recipeId} ×{job.quantity}
                {job.fragmentContract==='legacy-reserved'&&<small>{de?' · Historische Fragmente bleiben ausgegeben':' · Historical fragments remain spent'}</small>}
              </span>
              <button onClick={() => act("craft-cancel", job.id)}>
                {de ? "Abbrechen / erstatten" : "Cancel / refund"}
              </button>
            </div>
          ))}
          <details className="system-disclosure"><summary>{de?'Schmieden & Automation':'Foundries & automation'}</summary><FoundryDetails s={s} act={(name,...args)=>{if(name==='open-material')setComponent(args[0]);else act(name,...args)}}/><MaterialBuildAutomation s={s} kind="crafting" act={act}/></details><details className="system-disclosure"><summary>{de?'Baupläne finden':'Find blueprints'}</summary><p>{de?'Neue Baupläne: zehn bezahlte Forschungsabschlüsse je Bereich oder 1-%-Chance aus echten Materialdrops. Danach regulär lernen.':'New blueprints: ten paid research completions per area or a 1% chance from actual material drops. Then learn normally.'}</p></details><section className="recipe-list">
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
                id={`item-detail-${entry.id}`}
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
          <p>{componentText(component, language).source}</p><ComponentSources s={s} id={component} act={act}/>
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
          {(["upgrade"] as const).map((action) => {
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
                <p>{formatScientific(q.dataCostExact,1)} Data · {de?'Fehlt':'Missing'} {formatScientific(q.data.missingExact,1)}</p>
                <ul className="recipe-ingredients">{Object.entries(q.componentCosts).map(([id,n])=><RecipeIngredient key={id} name={componentText(id as ComponentId,language).name} icon={<ComponentArt id={id as ComponentId}/>} balance={s.componentInventory[id as ComponentId]} required={n!} missing={q.missingMaterials[id]??0} de={de} onClick={()=>{setItemId(null);setComponent(id as ComponentId)}}/>)}</ul>
                {Object.keys(q.componentCosts).filter(id=>id!=='circuits').map(id=><ComponentSources key={id} s={s} id={id as ComponentId} act={act}/>)}
                <dl>{q.effectChanges.map(change=><div key={change.effect}><dt>{effectText(change.effect,language)} {de?'Beitrag bei Ausrüstung':'Contribution when equipped'}</dt><dd>{change.before.toFixed(6)} → {change.after.toFixed(6)}</dd></div>)}</dl>
                <p>
                  {de ? "Ergebnis" : "Result"}:{" "}
                  {rarityText(q.result.rarity, language)} · Lv {q.result.level}{" "}
                  · {de ? "Schmiedestufe" : "Forge level"} {q.result.forge ?? 0}
                </p>
                {effect(q.result)}
                {specialItemComparisonText(s,item,q.result)&&<p className="special-item-comparison">{specialItemComparisonText(s,item,q.result)}</p>}
                {itemEffectProfile(item).includes("data") && <DataItemComparison s={s} before={item} after={q.result}/>}
                {itemEffectProfile(item).includes("research") && <ResearchItemComparison s={s} before={item} after={q.result}/>}
                {itemEffectProfile(item).includes("training") && <TrainingItemCostComparison s={s} before={item} after={q.result}/>}
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
                      : q.reason === "materials" ? Object.entries(q.missingMaterials).map(([id,n])=>`${n} ${componentText(id as ComponentId,language).name} ${de?'fehlen':'missing'}`).join(', ')
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
                        `${de ? "Kosten bestätigen" : "Confirm costs"}: ${Object.entries(q.componentCosts).map(([id,n])=>`${n} ${componentText(id as ComponentId,language).name}`).join(', ')}, ${q.dataCost} Data · ${item.id}`,
                      )
                    )
                      act(action, item.id,{rarity:item.rarity,level:item.level,forge:item.forge??0});
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
          <details className="system-disclosure"><summary>{de?'Build & Synergien':'Build & synergies'}</summary><DeviceDetails s={s} item={item}/></details><details className="system-disclosure"><summary>{de?'Forge & Recycling':'Forge & recycling'}</summary><ItemForgeDetails s={s} item={item} act={(name,...args)=>{if(name==='open-material'){setItemId(null);setComponent(args[0]);}else act(name,...args)}}/><RecoveryDetails s={s} item={item} act={act}/></details>{item.rarity!=='mythic'&&<button onClick={()=>act('pin-goal',{kind:'item-upgrade',id:item.id,target:rarities.indexOf(item.rarity)+1})}>{de?'Nächste Aufwertung anheften':'Pin next upgrade'}</button>}
          <section className="improvement-card">
            <h3>
              {de
                ? "Fusion: drei gleiche Items"
                : "Fusion: three matching items"}
            </h3>
            <p>
              {de
                ? "Die zuerst ausgewählte Instanz bleibt als Basis erhalten: Level und Schmiedestufe bleiben. Zwei Duplikate werden verbraucht; Qualität steigt um eine Stufe."
                : "The first selected instance is retained: level and forge are kept. Two duplicates are consumed; rarity increases one tier."}
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
            <p>{de ? "Basisinstanz" : "Base instance"}: {fusion[0] ?? "—"}</p>
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
                  ...(fusionPreview(s, fusion).result ?? item),
                  rarity: fusionPreview(s, fusion).result!.rarity,
                  level: fusionPreview(s, fusion).result!.level,
                  forge: fusionPreview(s, fusion).result!.forge ?? 0,
                })}
                {!itemImprovementHasEffect(s, s.inventory.find(i => i.id === fusion[0]) ?? item, {
                  ...(fusionPreview(s, fusion).result ?? item),
                  rarity: fusionPreview(s, fusion).result!.rarity,
                  level: fusionPreview(s, fusion).result!.level,
                  forge: fusionPreview(s, fusion).result!.forge ?? 0,
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
                !itemImprovementHasEffect(s, s.inventory.find(i => i.id === fusion[0]) ?? item, {
                  ...(fusionPreview(s, fusion).result ?? item),
                  rarity:
                    fusionPreview(s, fusion).result?.rarity ?? item.rarity,
                  level: fusionPreview(s, fusion).result?.level ?? item.level,
                  forge: fusionPreview(s, fusion).result?.forge ?? item.forge ?? 0,
                })
              }
              onClick={() => {
                const q = fusionPreview(s, fusion);
                if (
                  q.allowed &&
                  confirm(
                    `${de ? "Instanzen unwiderruflich verbrauchen" : "Permanently consume instances"}: ${fusion.slice(1).join(", ")} → ${rarityText(q.result!.rarity, language)}`,
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

        </MobileDetailSheet>
      )}
    </div>
  );
}
