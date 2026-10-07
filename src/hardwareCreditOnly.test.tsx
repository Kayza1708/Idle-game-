import {describe,it,expect} from 'vitest';
import {renderToStaticMarkup} from 'react-dom/server';
import {BALANCE,newGame,addCreditsScientific,buyHardwareClass,hardwareIds,hardwarePurchasePreview,exactEconomyValue,creditRateScientific,hardwareBulkCostScientific,passiveCircuitRate,type GameState} from './economy';
import {ScientificNumber} from './scientificNumber';
import {hardwareSavingsGoals,hardwareSavingsQuote} from './hardwareGoals';
import {HardwareSavingsGoals} from './HardwareSavingsGoals';
import {Workshop} from './Panels';
import {advance} from './simulation';
import {tutorialGuide} from './tutorialGuide';
import {resolvePinnedGoal} from './nextGoal';
const funded=()=>addCreditsScientific(newGame(0),ScientificNumber.fromJSON({m:1,e:200}),false,false);
describe('Credit-only hardware and pure savings goals',()=>{
 it.each(hardwareIds)('buys %s without any predecessor, research, level, INT or story unlock',id=>{
  const s=addCreditsScientific(newGame(0),ScientificNumber.from(BALANCE.hardware[id].baseCost),false,false),q=hardwarePurchasePreview(s,id),out=buyHardwareClass(s,id);
  expect(q.allowed).toBe(true);expect(out.hardwareCounts[id]).toBe(1);expect(out.hardware).toBe(1);expect(out.discovered).toEqual([id]);expect(out.lifetime.hardwareClasses).toEqual([id]);expect(out.nodes).toEqual([]);expect(out.level).toBe(0);expect(exactEconomyValue(out,'credits').compare(exactEconomyValue(s,'credits').subtract(q.cost))).toBe(0);
 });
 it('rejects insufficient credit and rechecks a stale quote',()=>{
  const s=newGame(0),q=hardwareSavingsQuote(s,'calculator');expect(q.allowed).toBe(true);
  const after=buyHardwareClass(s,'calculator',3);expect(after.hardwareCounts.calculator).toBe(0);expect(after).toBe(s);
  const spent=buyHardwareClass(buyHardwareClass(s,'calculator'),'calculator');expect(buyHardwareClass(spent,'calculator')).toBe(spent);
  expect(buyHardwareClass(s,'sbc')).toBe(s);
 });
 it('visibility and previews never discover, grant mastery, resources or rewards',()=>{
  const s=newGame(0),snapshot=JSON.stringify(s);hardwareIds.forEach(id=>hardwarePurchasePreview(s,id));hardwareSavingsGoals(s);
  const html=renderToStaticMarkup(<Workshop s={s} act={()=>{}}/>);expect((html.match(/data-discovered="false"/g)??[]).length).toBe(15);expect(html).not.toContain('Discover previous class');expect(html).not.toContain('Vorherige Klasse');expect(JSON.stringify(s)).toBe(snapshot);expect(passiveCircuitRate(s)).toBe(0);
  const out=buyHardwareClass(funded(),'gpu');expect(passiveCircuitRate(out)).toBe(1/BALANCE.passiveCircuitSecondsPerClass);expect(out.retention.hardwareMasteryXp.gpu).toBe(1);
 });
 it.each(BALANCE.hardwareMilestones)('preserves actual %s milestone effects and bulk sums',threshold=>{
  const s=funded(),q=hardwareSavingsQuote(s,'calculator',threshold),out=buyHardwareClass(s,'calculator',threshold);
  expect(q.cost.compare(hardwareBulkCostScientific('calculator',0,threshold,s))).toBe(0);expect(out.hardwareCounts.calculator).toBe(threshold);expect(out.runMilestoneEdges).toContain(`calculator:${threshold}`);expect(creditRateScientific(out.hardware,out.level,out).subtract(creditRateScientific(s.hardware,s.level,s)).compare(q.creditGain)).toBe(0);
 });
 it('next class and milestone use real SCI costs and rate-based ETA; no infinite ETA',()=>{
  const s=buyHardwareClass(newGame(0),'calculator'),goals=hardwareSavingsGoals(s);expect(goals.next?.id).toBe('sbc');expect(goals.milestone?.amount).toBe(9);expect(goals.milestone?.cost.compare(hardwareBulkCostScientific('calculator',1,9,s))).toBe(0);expect(goals.next?.resources.secondsToAfford).toBeGreaterThan(0);expect(hardwareSavingsQuote(newGame(0),'sbc').resources.secondsToAfford).toBeNull();
  const pin=resolvePinnedGoal(s,{kind:'hardware',id:'calculator',target:10});expect(pin?.etaSeconds).toBe(goals.milestone?.resources.secondsToAfford);
  for(const language of ['de','en'] as const){const html=renderToStaticMarkup(<HardwareSavingsGoals s={{...s,settings:{...s.settings,language}}} open={()=>{}}/>);expect(html).toContain('Credits');expect(html).not.toMatch(/Infinity|NaN/);}
 });
 it('shopping automation can buy an unowned SBC, using the transaction and reserve',()=>{
  let s=addCreditsScientific(newGame(0),ScientificNumber.from(BALANCE.hardware.sbc.baseCost),false,false);s={...s,nodes:['shoppingAgent'],hardwareAutoBuyers:{sbc:true}};
  const out=advance(s,10,true,()=>.5).state;expect(out.hardwareCounts.sbc).toBe(1);expect(out.discovered).toContain('sbc');expect(exactEconomyValue(out,'credits').toNumber()).toBeCloseTo(50,8);
  const blocked={...s,hardwareAutoBuyers:{}};expect(advance(blocked,10,true,()=>.5).state.hardware).toBe(0);
 });
 it('legacy milestone automation considers visible unowned classes without granting automation unlocks',()=>{
  let s=buyHardwareClass(funded(),'server',10);s={...s,automation:{...s.automation,enabled:true}};const out=advance(s,BALANCE.simulationStep,true,()=>.5).state;expect(out.hardwareCounts.calculator).toBeGreaterThan(0);expect(out.discovered).toContain('calculator');
 });
 it('invalid savings quantities never become affordable zero-cost quotes',()=>{const q=hardwareSavingsQuote(newGame(0),'calculator',NaN);expect(q.allowed).toBe(false);expect(q.resources.valid).toBe(false);});
 it('tutorial requires the actual SBC purchase, not ten predecessors',()=>{
  const s={...newGame(0),story:{...newGame(0).story,target:'research' as const}};expect(tutorialGuide(s)?.requirement).toContain('Kaufe den Einplatinencomputer');const bought=buyHardwareClass(addCreditsScientific(s,ScientificNumber.from(BALANCE.hardware.sbc.baseCost),false,false),'sbc');expect(bought.hardwareCounts.calculator).toBe(0);expect(tutorialGuide(bought)?.requirement).not.toContain('Taschenrechner');
 });
 it('all prices remain strictly increasing',()=>expect(hardwareIds.every((id,i)=>i===0||BALANCE.hardware[id].baseCost>BALANCE.hardware[hardwareIds[i-1]].baseCost)).toBe(true));
});
