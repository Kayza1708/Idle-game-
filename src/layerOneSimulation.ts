import {hardwareIds,isolatedClassComputeScientific,isolatedCreditRateScientific,isolatedHardwareCostScientific,type HardwareId,type LayerOneProfile} from './economy';
import {ScientificNumber} from './scientificNumber';

export type LayerOnePurchase={at:number;id:HardwareId;owned:number;cost:string;gain:string;share:number;paybackSeconds:number;waitSeconds:number};
export type LayerOneResult={strategy:'A'|'B';durationSeconds:number;firstPurchases:Partial<Record<HardwareId,number>>;milestones:{id:HardwareId;threshold:number;at:number}[];purchases:LayerOnePurchase[];longestWaits:number[]};
const thresholds=new Set([10,25,50,100,250,500]);
export function simulateLayerOne(profile:LayerOneProfile,strategy:'A'|'B',durationSeconds=24*3600):LayerOneResult{
 const counts:number[]=hardwareIds.map((_,index)=>index===0?1:0),firstPurchases:Partial<Record<HardwareId,number>>={},milestones:LayerOneResult['milestones']=[],purchases:LayerOnePurchase[]=[],waits:number[]=[];let credits=ScientificNumber.zero(),at=0,nextClass=1;
 for(let steps=0;steps<100_000&&at<=durationSeconds;steps++){
  const rate=isolatedCreditRateScientific(profile,counts);if(rate.isZero())break;
  const candidates=hardwareIds.map((id,index)=>{const cost=isolatedHardwareCostScientific(profile,index,counts[index]),before=isolatedClassComputeScientific(profile,index,counts[index]),after=isolatedClassComputeScientific(profile,index,counts[index]+1),gain=after.subtract(before);return{id,index,cost,gain,payback:gain.isZero()?Infinity:cost.divide(gain).toNumber()};});
  let candidate;if(strategy==='B'){candidate=candidates[nextClass];if(!candidate)break;}else{const affordable=candidates.filter(row=>credits.compare(row.cost)>=0);candidate=affordable.sort((a,b)=>a.payback-b.payback||a.index-b.index)[0]??candidates.slice().sort((a,b)=>a.cost.compare(b.cost)||a.index-b.index)[0];}
  if(credits.compare(candidate.cost)<0){const wait=candidate.cost.subtract(credits).divide(rate).toNumber();if(!Number.isFinite(wait)||at+wait>durationSeconds)break;credits=credits.add(rate.multiplyNumber(wait));at+=wait;waits.push(wait);}
  const oldRate=rate;credits=credits.subtract(candidate.cost);counts[candidate.index]++;const newRate=isolatedCreditRateScientific(profile,counts),owned=counts[candidate.index];
  if((candidate.index===0&&owned===2)||(candidate.index>0&&owned===1))firstPurchases[candidate.id]=at;
  if(thresholds.has(owned))milestones.push({id:candidate.id,threshold:owned,at});
  purchases.push({at,id:candidate.id,owned,cost:candidate.cost.toScientificString(8),gain:candidate.gain.toScientificString(8),share:isolatedClassComputeScientific(profile,candidate.index,owned).divide(newRate).toNumber(),paybackSeconds:candidate.payback,waitSeconds:waits.at(-1)??0});
  if(strategy==='B')nextClass++;
  if(newRate.compare(oldRate)<=0)break;
 }
 return{strategy,durationSeconds,firstPurchases,milestones,purchases,longestWaits:waits.sort((a,b)=>b-a).slice(0,10)};
}
