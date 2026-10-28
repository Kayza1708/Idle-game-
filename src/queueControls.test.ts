import {describe,it,expect} from 'vitest';
import {newGame,type GameState} from './economy';
import {serialize,restore} from './storage';
import {changeQueuedPlan,queueSignature} from './queueControls';
const prepared=():GameState=>({...newGame(1000),nodes:['T03','F02'],trainingQueue:[{track:'quality',targetLevel:1},{track:'efficiency',targetLevel:1}],researchQueue:['dataGeneration','computeOptimization','userScaling']});
describe('Actual unpaid queue controls',()=>{
 it.each(['training','research'] as const)('moves %s plans with exact unchanged wallets',kind=>{
  const s=prepared(),n=changeQueuedPlan(s,{kind,signature:queueSignature(s,kind),index:0,action:'later'});expect(n).not.toBe(s);expect(n.credits).toBe(s.credits);expect(n.data).toBe(s.data);expect(n.exactEconomy).toBe(s.exactEconomy);expect(queueSignature(n,kind).split('|')[1]).toBe(queueSignature(s,kind).split('|')[0]);const loaded=restore(serialize(n),n.savedAt);expect(loaded.error).toBeUndefined();expect(queueSignature(loaded.state,kind)).toBe(queueSignature(n,kind));
 });
 it('rejects stale commands instead of removing the next job',()=>{
  const s=prepared(),ticket={kind:'research' as const,signature:queueSignature(s,'research'),index:0,action:'remove' as const},removed=changeQueuedPlan(s,ticket);expect(removed.researchQueue).toHaveLength(2);expect(changeQueuedPlan(removed,ticket)).toBe(removed);
 });
 it('cannot invert same-track dependencies, and removing a prerequisite removes later dependent plans',()=>{
  const s={...prepared(),trainingQueue:[{track:'quality' as const,targetLevel:1},{track:'quality' as const,targetLevel:2}]};expect(changeQueuedPlan(s,{kind:'training',signature:queueSignature(s,'training'),index:1,action:'earlier'})).toBe(s);expect(changeQueuedPlan(s,{kind:'training',signature:queueSignature(s,'training'),index:0,action:'remove'}).trainingQueue).toEqual([]);
 });
 it('rejects invalid indices and actions without mutating source',()=>{
  const s=prepared(),before=serialize(s);for(const index of [-1,99,NaN,.5])expect(changeQueuedPlan(s,{kind:'training',signature:queueSignature(s,'training'),index,action:'remove'})).toBe(s);expect(serialize(s)).toBe(before);
 });
});
