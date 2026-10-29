/** Joint V3 prestige consumers, not a second item evaluator. All scaling
 * snapshots and unmodified C come from the shared Item V3 dependency graph. */
import {BALANCE,hardwareIds,exactEconomyValue,type GameState} from './economy';
import {hasProgressionNode,axiomLevel} from './progression';
import {usesItemV3,itemV3Snapshot,unmodifiedHardwareComputeV3,itemV3Equipped,itemAbilityStrengthV3} from './itemSystemV3';
import {ScientificNumber as S} from './scientificNumber';
const c=()=>BALANCE.prestigeV3;
const one=()=>S.from(1);
/** The mapping contains no independent tuning values. It also drives the
 * generated native override keys, so old scalar consumers are replaced. */
export function prestigeEffectOverridesV3(){const v=c();return{
 H06:v.hardware.H06,H08:v.hardware.H08perClass,
 T01:v.training.T01,T02:v.training.T02,T05:v.training.T05,T09:v.training.T09,T09training:v.training.T09training,
 F06:v.research.F06,F07:v.research.F07,F09:v.research.F09,F09data:v.research.F09data,F10:v.research.F10,F10data:v.research.F10data,
 W05:v.items.W05,W09:v.items.W09,W10:v.items.W10,
 S04:v.tap.S04,S07:v.tap.S07,S09:v.tap.S09,
 I01:v.int.I01,I08:v.int.I08,I09:v.int.I09,
 A04:v.axioms.A04,B03:v.axioms.B03,B05:v.axioms.B05,
};}
export function progressionEffectsV3(s:GameState){return usesItemV3(s)?{...BALANCE.progression.effects,...prestigeEffectOverridesV3()}:BALANCE.progression.effects;}
export function prestigeHardwareFirstV3(s:GameState){
 const snapshot=itemV3Snapshot(s);return S.from(hasProgressionNode(s,'H06')?c().hardware.H06:1).multiply(hasProgressionNode(s,'H07')?one().add(snapshot.H.divide(S.from(c().hardware.H07scale))).pow(c().hardware.H07exponent):one());
}
export function prestigeHardwareSecondV3(s:GameState){
 let factor=one();if(hasProgressionNode(s,'H09'))factor=factor.multiply(S.from(c().hardware.H09).multiply(S.from(c().hardware.H09growth).pow(hardwareIds.filter(id=>s.hardwareCounts[id]>=c().hardware.H09threshold).length)));
 if(hasProgressionNode(s,'H10')){const raw=unmodifiedHardwareComputeV3(s);factor=factor.multiplyNumber(c().hardware.H10).multiply((raw.compare(one())<0?one():raw).pow(c().hardware.H10exponent));}return factor;
}
export function prestigeCreditHardwareV3(s:GameState){
 const snapshot=itemV3Snapshot(s);let result=one();if(hasProgressionNode(s,'H08'))result=result.multiplyNumber(1+c().hardware.H08perClass*hardwareIds.filter(id=>s.hardwareCounts[id]>0).length);
 if(hasProgressionNode(s,'T07'))result=result.multiply(one().add(snapshot.M.divide(S.from(c().training.T07scale))).pow(c().training.T07exponent));return result;
}
export function prestigeINTWeightV3(s:GameState){
 const snapshot=itemV3Snapshot(s);let result=one();
 if(hasProgressionNode(s,'I02'))result=result.multiply(S.from(1+new Set(s.runMilestoneEdges).size/c().int.I02scale).pow(c().int.I02exponent));
 if(hasProgressionNode(s,'I03'))result=result.multiply(one().add(snapshot.M.divide(S.from(c().int.I03scale))).pow(c().int.I03exponent));
 if(hasProgressionNode(s,'I04'))result=result.multiply(one().add(snapshot.F.divide(S.from(c().int.I04scale))).pow(c().int.I04exponent));
 if(hasProgressionNode(s,'I09'))result=result.multiplyNumber(c().int.I09);
 const archive=itemV3Equipped(s).find(i=>i.type==='insight-archive');if(archive)result=result.multiplyNumber(1+BALANCE.itemV3.archive.weight*itemAbilityStrengthV3(s,archive).P);
 return result;
}
export const prestigeGainExponentV3=(s:GameState)=>BALANCE.progression.formula.intBaseExponent+BALANCE.progression.formula.intAxiomExponent*axiomLevel(s,'A01')+(hasProgressionNode(s,'I10')?c().int.I10gain:0);
export const prestigeCreditRateV3=(s:GameState)=>c().int.creditPerINT+(hasProgressionNode(s,'I05')?c().int.I05:0)+(hasProgressionNode(s,'I10')?c().int.I10credits:0);
/** User-approved linear stacking. Earned cycle INT includes spent INT; only
 * the actual axiom reset clears that ledger. No exponential compounding. */
export const prestigeCreditFactorV3=(s:GameState)=>one().add(exactEconomyValue(s,'cycleINTEarned').multiplyNumber(prestigeCreditRateV3(s)));
export function axiomDiscoveryEligibleV3(s:GameState){
 return !s.retention.activeRun&&exactEconomyValue(s,'cycleINTEarned').compare(S.from(c().discovery.cycleINT))>=0&&new Set([...s.progression.known,...s.nodes].filter(id=>Object.hasOwn(BALANCE.progression.nodes,id))).size>=c().discovery.distinctNodes;
}
export function axiomDiscoveredV3(s:GameState){return s.itemSystemV3?.axiomDiscovered===true;}
/** Idempotent domain event. Existing Mira event handling must enqueue the
 * corresponding dialogue after durable save; animation grants nothing. */
export function discoverAxiomsV3(s:GameState){
 if(!s.itemSystemV3||s.itemSystemV3.axiomDiscovered||!axiomDiscoveryEligibleV3(s))return s;
 return{...s,itemSystemV3:{...s.itemSystemV3,axiomDiscovered:true,axiomDiscoveryAt:s.savedAt}};
}

/** Count only occupied regular slots at the interval boundary. Bought labs
 * receive the same speed but never increase this count. Paid retained jobs
 * outside current capacity still run, without manufacturing new capacity. */
export function prestigeOccupiedResearchV3(s:GameState){
 const regular=1+['F01','F04','F08'].filter(id=>hasProgressionNode(s,id)).length;
 return s.researchLabs.slice(0,regular).filter(job=>job!==null).length;
}
export function prestigeResearchActivityV3(s:GameState){
 return usesItemV3(s)&&hasProgressionNode(s,'F08')?1+c().research.F08perLab*prestigeOccupiedResearchV3(s):1;
}
export function prestigeResearchDataV3(s:GameState){
 return usesItemV3(s)&&hasProgressionNode(s,'F10')?one().add(itemV3Snapshot(s).F.divide(S.from(c().research.F10scale))).pow(c().research.F10exponent):one();
}

/** Actual passive producer, not the old insight-archive item multiplier. */
export function prestigePassiveComponentsV3(s:GameState){
 const level=axiomLevel(s,'C01');if(!level)return 1;const factor=c().axioms.C01[level-1];if(factor===undefined)throw new RangeError('Invalid C01 level');return factor;
}
