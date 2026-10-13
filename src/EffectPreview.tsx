import {computeRateScientific,creditRateScientific,dataRateScientific,usersRateScientific,trainingCostQuote,researchPerformanceQuote,formatScientific,type GameState} from './economy';
import {ScientificNumber} from './scientificNumber';
import {ResourceArt,type ResourceArtId} from './GameArt';
import {VectorIcon} from './VectorIcon';
/** Presentation of existing formulas only: previews never debit, unlock, or grant. */
export function effectPreviewRows(before:GameState,after:GameState){
 const rows=[
  {id:'compute',icon:'compute' as ResourceArtId,name:'Compute/s',before:computeRateScientific(before.hardware,before),after:computeRateScientific(after.hardware,after)},
  {id:'credits',icon:'credits' as ResourceArtId,name:'Credits/s',before:creditRateScientific(before.hardware,before.level,before,before.savedAt),after:creditRateScientific(after.hardware,after.level,after,before.savedAt)},
  {id:'data',icon:'data' as ResourceArtId,name:before.settings.language==='de'?'Daten/s':'Data/s',before:dataRateScientific(before),after:dataRateScientific(after)},
  {id:'users',name:before.settings.language==='de'?'Nutzer':'Users',before:usersRateScientific(before),after:usersRateScientific(after)},
  {id:'quality',icon:'data' as ResourceArtId,name:before.settings.language==='de'?'Qualität · Kosten':'Quality · cost',lower:true,before:trainingCostQuote(before,'quality').cost,after:trainingCostQuote(after,'quality').cost},
  {id:'efficiency',icon:'data' as ResourceArtId,name:before.settings.language==='de'?'Effizienz · Kosten':'Efficiency · cost',lower:true,before:trainingCostQuote(before,'efficiency').cost,after:trainingCostQuote(after,'efficiency').cost},
  {id:'research',icon:'research' as ResourceArtId,name:before.settings.language==='de'?'Laborleistung':'Lab performance',before:ScientificNumber.from(researchPerformanceQuote(before).laborFactor),after:ScientificNumber.from(researchPerformanceQuote(after).laborFactor)},
 ];return rows.filter(r=>r.before.compare(r.after)!==0);
}
export function EffectPreview({before,after}:{before:GameState;after:GameState}){
 const rows=effectPreviewRows(before,after),de=before.settings.language==='de';if(!rows.length)return null;
 return <dl className="effect-preview" aria-label={de?'Wirkung auf deinen Build':'Effect on your build'}>{rows.map(r=>{
  const direction=r.after.compare(r.before),gain=r.before.isZero()?null:(direction>0?r.after.subtract(r.before):r.before.subtract(r.after)).divide(r.before);
  return <div key={r.id} data-effect={r.id} className={direction*(r.lower?-1:1)>0?'positive':'negative'}><dt>{r.icon?<ResourceArt id={r.icon}/>:<VectorIcon name="profile"/>}{r.name}</dt><dd><span>{formatScientific(r.before,3,before.settings.numberFormat)}</span><i aria-hidden="true">→</i><b>{formatScientific(r.after,3,before.settings.numberFormat)}</b>{gain&&<small>{direction>0?'+':'−'}{formatScientific(gain.multiplyNumber(100),3,before.settings.numberFormat)}%</small>}</dd></div>;
 })}</dl>;
}
