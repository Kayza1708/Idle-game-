import {ItemHero,ItemPortrait} from './ItemPresentation';
import {itemStatLines} from './itemActionEvents';
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
import { useState,useEffect } from "react";
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
export function InventoryScreen({ s, act,mode,embedded=false }: { s: GameState; act: Action;mode?:"components"|"items";embedded?:boolean }) {
  const language = s.settings.language,
    de = language === "de",
    [view, setView] = useState<
      "components" | "modules" | "workbench" | "items"
    >(mode??"components"),
    [component, setComponent] = useState<ComponentId | null>(null),
    [itemId, setItemId] = useState<string | null>(null),
    [fusion, setFusion] = useState<string[]>([]),
    [quantity, setQuantity] = useState(1);
  useEffect(()=>{if(mode)setView(mode)},[mode]);
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
    <div className={`panel mobile-screen inventory-screen ${embedded?"embedded-inventory":""}`}>
      <header className="mobile-screen-title">
        <h1>{de ? "Inventar" : "Inventory"}</h1>
        <button onClick={() => act("open-equipment")}>
          {de ? "Ausrüstung" : "Equipment"}{" "}
          {Object.values(s.equipped).filter(Boolean).length}/
          {equipmentSlotCount(s)}
        </button>
      </header>
      {!embedded&&<BonusBoxes s={s} act={act}/>}
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
                      ? "Schmiede"
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
                <ItemPortrait item={entry}/>
                <span>{itemText(entry.type, language)}</span>
                <small>
                  {rarityText(entry.rarity, language)} · Lv {entry.level}{entry.locked?' · 🔒':''}
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
          <ItemHero item={item} language={language} stats={itemStatLines(s,item)}/>
          <p>
            {equipped(item.id)
              ? de
                ? "Ausgerüstet"
                : "Equipped"
              : de
                ? "Nicht ausgerüstet"
                : "Unequipped"}
            {s.retention.activeRun?.id === "no-items" &&
              ` · ${de ? "Challenge deaktiviert Itemeffekte" : "Challenge disables item effects"}`}
          </p>

          <button
            disabled={!equipmentEligibility(s, item.id).allowed}
            onClick={() => act("equip", item.id)}
          >
            {de ? "Ausrüsten" : "Equip"}
          </button>
          {equipmentEligibility(s, item.id).reason === "no-socket" && (
            <button onClick={()=>act('open-equipment')}>{de?'Plätze im Modell verwalten':'Manage model sockets'} ›</button>
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
                <p className="upgrade-price">{formatScientific(q.dataCostExact,1)} Data <span>Lv {item.level} → {q.result.level}</span></p>
                <ul className="recipe-ingredients">{Object.entries(q.componentCosts).map(([id,n])=><RecipeIngredient key={id} name={componentText(id as ComponentId,language).name} icon={<ComponentArt id={id as ComponentId}/>} balance={s.componentInventory[id as ComponentId]} required={n!} missing={q.missingMaterials[id]??0} de={de} onClick={()=>{setItemId(null);setComponent(id as ComponentId)}}/>)}</ul>

                <dl>{q.effectChanges.filter(change=>!['relay','int-yield'].includes(change.effect)).map(change=><div key={change.effect}><dt>{effectText(change.effect,language)}</dt><dd>+{(change.before*100).toFixed(2)} % <strong>→ +{(change.after*100).toFixed(2)} %</strong></dd></div>)}</dl>
                {specialItemComparisonText(s,item,q.result)&&<p className="special-item-comparison">{specialItemComparisonText(s,item,q.result)}</p>}
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
                  onClick={() => act(action, item.id,{rarity:item.rarity,level:item.level,forge:item.forge??0})}
                >
                  {action === "upgrade"
                    ? de
                      ? "Aufwerten"
                      : "Upgrade"
                    : de
                      ? "Schmieden"
                      : "Forge"}
                </button>
                <details className="system-disclosure"><summary>{de?'Materialquellen':'Material sources'}</summary>{Object.keys(q.componentCosts).filter(id=>id!=='circuits').map(id=><ComponentSources key={id} s={s} id={id as ComponentId} act={act}/>)}</details>
                <details className="system-disclosure"><summary>{de?"Wirkung im Build":"Effect on build"}</summary>
                {itemEffectProfile(item).includes("data") && <DataItemComparison s={s} before={item} after={q.result}/>}
                {itemEffectProfile(item).includes("research") && <ResearchItemComparison s={s} before={item} after={q.result}/>}
                {itemEffectProfile(item).includes("training") && <TrainingItemCostComparison s={s} before={item} after={q.result}/>}
                </details>
              </section>
            );
          })}
          <details className="system-disclosure"><summary>{de?'Build & Synergien':'Build & synergies'}</summary><DeviceDetails s={s} item={item}/></details><details className="system-disclosure"><summary>{de?'Forge & Recycling':'Forge & recycling'}</summary><ItemForgeDetails s={s} item={item} act={(name,...args)=>{if(name==='open-material'){setItemId(null);setComponent(args[0]);}else act(name,...args)}}/><RecoveryDetails s={s} item={item} act={act}/></details>{item.level<69&&<button onClick={()=>act('pin-goal',{kind:'item-upgrade',id:item.id,target:item.level+1})}>{de?'Nächste Aufwertung anheften':'Pin next upgrade'}</button>}
          <button onClick={()=>{setItemId(null);window.dispatchEvent(new CustomEvent('forge-navigate',{detail:'fusion'}))}}>{de?'Am Amboss fusionieren':'Fuse at the anvil'} ›</button>

        </MobileDetailSheet>
      )}
    </div>
  );
}
