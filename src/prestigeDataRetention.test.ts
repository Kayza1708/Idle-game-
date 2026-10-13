import {describe,it,expect} from 'vitest';
import {BALANCE,addCredits,addData,addDataScientific,axiomThresholdScientific,buyHardwareClass,exactEconomyValue,newGame,startTraining} from './economy';
import {axiomLayerVisible,axiomReset,prestige,prestigePreview} from './prestige';
import {queueExperiment} from './experiments';
import {ScientificNumber} from './scientificNumber';
import {restore,serialize} from './storage';
import {abortRunChallenge,startRunChallenge} from './retention';
const ready=()=>addData(addCredits(newGame(1000),1e12),10_000);
describe('normal prestige retains paid Data balance',()=>{
 it('retains fractional native balances and classifies Data as kept in the preview',()=>{
  const s=addData(ready(),.125),q=prestigePreview(s),next=prestige(s);
  expect(exactEconomyValue(next,'data').toJSON()).toEqual(exactEconomyValue(s,'data').toJSON());
  expect(next.data).toBe(s.data);expect(q.reset).not.toHaveProperty('data');expect(q.kept.data).toBe(s.data);expect(next.hardware).toBe(0);expect(next.credits).toBe(BALANCE.runStartCredits);
 });
 it('keeps a balance beyond Number range through prestige, reload and another eligible reset',()=>{
  const s=addDataScientific(ready(),ScientificNumber.fromString('1.234567e450')),first=prestige(s),loaded=restore(serialize(first),first.savedAt).state;
  for(const state of [first,loaded,prestige(addCredits(loaded,1e15))])expect(exactEconomyValue(state,'data').toJSON()).toEqual(exactEconomyValue(s,'data').toJSON());
  expect(prestige(first)).toBe(first);
 });
 it('does not refund previously paid training or analysis while cancelling their jobs',()=>{
  let s=buyHardwareClass(ready(),'calculator',25);s=buyHardwareClass(s,'sbc',1);s=startTraining(s,'quality');s=queueExperiment(s,'hardware',s.savedAt,'short');
  expect(s.activeTraining).not.toBeNull();expect(s.experiments.active).not.toBeNull();const balance=exactEconomyValue(s,'data').toJSON(),next=prestige(s);
  expect(next.activeTraining).toBeNull();expect(next.experiments.active).toBeNull();expect(exactEconomyValue(next,'data').toJSON()).toEqual(balance);
 });
 it('still starts a challenge with no imported Data and restores the main balance on abort',()=>{
  const s=buyHardwareClass({...ready(),prestigeCount:1},'sbc',1),run=startRunChallenge(s,'no-items',1);
  expect(run.challengeSession).toBeTruthy();expect(exactEconomyValue(run,'data').isZero()).toBe(true);
  expect(exactEconomyValue(abortRunChallenge(run),'data').toJSON()).toEqual(exactEconomyValue(s,'data').toJSON());
 });
 it('retains the explicit deeper Axiom reset contract',()=>{
  const s=ready(),amount=axiomThresholdScientific(),late={...s,cycleINTEarned:amount.toNumber(),exactEconomy:{...s.exactEconomy,cycleINTEarned:amount.toJSON()}},after=axiomReset(late);
  expect(after.axiomResetCount).toBe(1);expect(exactEconomyValue(after,'data').isZero()).toBe(true);
 });
});
describe('progressive Axiom visibility',()=>{
 it('hides below the first attainable scientific reward and shows at its boundary',()=>{
  const s=newGame(0),threshold=axiomThresholdScientific(),at=(value:ScientificNumber)=>({...s,cycleINTEarned:value.toNumber(),exactEconomy:{...s.exactEconomy,cycleINTEarned:value.toJSON()}});
  expect(axiomLayerVisible(s)).toBe(false);expect(axiomLayerVisible(at(threshold.subtract(ScientificNumber.from(1))))).toBe(false);expect(axiomLayerVisible(at(threshold))).toBe(true);
 });
 it('stays visible once reached even after spending or resetting its currency',()=>{expect(axiomLayerVisible({...newGame(0),axiomResetCount:1})).toBe(true)});
});
