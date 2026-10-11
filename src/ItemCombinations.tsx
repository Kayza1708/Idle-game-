import {BALANCE,itemCombinationQuotes,trainingCombinationComparison,formatScientific,type GameState,type ItemCombinationId} from './economy';
import {ItemArt} from './GameArt';
import {itemText,effectText} from './gameplayI18n';
const names:Record<ItemCombinationId,[string,string]>={
 'compute-credit-link':['Compute + Credits','Compute + Credits'],
 'training-research-link':['Training + Forschung','Training + Research'],
 'parallel-architecture':['Parallelarchitektur','Parallel Architecture'],
 'learning-pipeline':['Lernpipeline','Learning Pipeline'],
 'material-mapping':['Materialkartierung','Material Mapping'],
};
export function ItemCombinations({s}:{s:GameState}){
 const de=s.settings.language==='de',cap=(1-BALANCE.trainingCostFloor)*100,slot=(id:string|null)=>id?(de?({processor:'Prozessor',core:'Kern',research:'Forschung'}[id]):({processor:'Processor',core:'Core',research:'Research'}[id])):null;
 return <section className="item-combinations" aria-label={de?'Kombinationen':'Combinations'}><h3>{de?'Kombinationen':'Combinations'}</h3>
  {itemCombinationQuotes(s).map(q=><article key={q.id} data-combination={q.id} data-active={q.active}>
   <div className="combination-title"><b>{names[q.id][de?0:1]}</b><span>{q.active?(de?'Aktiv':'Active'):(de?'Unvollständig':'Incomplete')}</span></div>
   {q.disabled&&<p>{de?'No-Items: Kombination deaktiviert':'No-Items: combination disabled'}</p>}
   <ul className="combination-required">{q.neededItems.map((required,index)=><li key={index}>
    {required.type&&<ItemArt type={required.type}/>}
    <span>{required.effect?`${effectText(required.effect,s.settings.language)}${de?' auf ausgerüstetem Item':' on an equipped item'}`:`${slot(required.slot)}: ${itemText(required.type!,s.settings.language)}`}
    {required.effect&&required.type&&` · ${itemText(required.type,s.settings.language)}`}
    {' · '}{required.matched?'✓':de?'Fehlt':'Missing'}</span>
   </li>)}</ul>
   <p className="combination-effect">{q.kind==='compute-factor'?`${de?'Regulärer Compute':'Regular compute'} ×${q.configuredValue.toFixed(2)} · ${de?'tatsächlich':'actual'} ×${q.contribution.toFixed(2)}`:
    q.kind==='training-bonus'?`B +${q.configuredValue.toFixed(2)} · ${de?'tatsächlich':'actual'} +${q.contribution.toFixed(2)}`:
    q.kind==='analysis-components-factor'?`${de?'Garantierte Komponenten je positiver Endmenge':'Guaranteed components per positive final quantity'}: floor(n ×${q.configuredValue.toFixed(2)}) · ${de?'tatsächlich':'actual'} ×${q.contribution.toFixed(2)}`:
    `${de?'Bestehende':'Existing'} ${q.kind==='credits-bonus'?(de?'Credit-Itemfamilie':'credit item family'):(de?'Forschungs-Itemfamilie':'research item family')}: +${q.configuredValue.toFixed(2)} · ${de?'tatsächlich':'actual'} +${q.contribution.toFixed(2)}`}</p>
   {q.kind==='compute-factor'&&<p>{de?'Nutzer und Credits folgen über den Core Loop. Kein direkter Credit-/Data-Faktor.':'Users and Credits follow through the core loop. No direct Credit/Data factor.'}</p>}
   {q.kind==='training-bonus'&&<><p>{de?'Nächster Start, ohne → mit aktivem Kombinationsbeitrag (Einzelwirkungen bleiben):':'Next start, without → with active combination contribution (individual effects retained):'}</p>
    {(['quality','efficiency'] as const).map(track=>{const c=trainingCombinationComparison(s,track);return <p className="combination-training-price" data-track={track} key={track}>{track==='quality'?(de?'Qualität':'Quality'):(de?'Effizienz':'Efficiency')}: {formatScientific(c.before.cost,3)} → {formatScientific(c.after.cost,3)} Data · B {c.before.bonusTotal.toFixed(2)} → {c.after.bonusTotal.toFixed(2)} · {de?'Faktor':'Factor'} {c.after.factor.toFixed(4)} · {de?`Rabattdeckel ${cap} %`:`Discount cap ${cap}%`}{c.after.capped?(de?' erreicht':' reached'):''}</p>})}
    <p>{de?'Nur zukünftige Trainingsstarts; laufende Kosten und Dauer bleiben fest.':'Future training starts only; running costs and duration stay fixed.'}</p></>}
   {q.kind==='analysis-components-factor'&&<p>{de?'Bei Analysestart festgelegt; Ausrüstungswechsel verändert diesen Auftrag nicht.':'Fixed at analysis start; equipment changes do not change this job.'}</p>}
  </article>)}
 </section>;
}
