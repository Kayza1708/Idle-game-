import {describe,expect,it} from 'vitest';
import {BALANCE,newGame,type GameState} from './economy';
import {advanceTo} from './simulation';
import {ScientificNumber} from './scientificNumber';
import {restore,serialize} from './storage';
import {createItem} from './inventory';
import {nextGoal} from './nextGoal';
import {missionRewardClaimable,rollPeriods} from './missions';
import {seasonClaimable} from './season';

const noTutorial=(s:GameState):GameState=>({...s,story:{...s.story,tutorial:'completed',target:null,open:null}});
describe('return overview',()=>{
 it('reports actual elapsed and capped credited time with real scientific gains',()=>{const state={...newGame(0),credits:1e250,data:1e220,exactEconomy:{...newGame(0).exactEconomy,credits:{m:1,e:250},data:{m:1,e:220}}},elapsed=BALANCE.maxOfflineSeconds+3600,{report}=advanceTo(state,elapsed*1000);expect(report.elapsedSeconds).toBe(elapsed);expect(report.seconds).toBeLessThanOrEqual(BALANCE.maxOfflineSeconds);expect(report.lostSeconds).toBe(elapsed-report.seconds);expect(ScientificNumber.fromJSON(report.exactCredits).compare(ScientificNumber.zero())).toBeGreaterThan(0);expect(ScientificNumber.fromJSON(report.exactData).compare(ScientificNumber.zero())).toBeGreaterThan(0)});
 it('settles rewards once and a reload cannot award or report them again',()=>{const first=advanceTo(newGame(0),600_000),credits=first.state.exactEconomy.credits,restored=restore(serialize(first.state),600_000).state,second=advanceTo(restored,600_000);expect(second.report.elapsedSeconds).toBe(0);expect(second.report.exactCredits).toEqual({m:0,e:0});expect(second.state.exactEconomy.credits).toEqual(credits)});
});
describe('next workshop goal',()=>{
 it('uses the documented stable priority order',()=>{let state=newGame(0);expect(nextGoal(state).kind).toBe('tutorial');state=noTutorial({...state,onboarding:{completed:['first-buy'],claimed:[]}});expect(nextGoal(state).kind).toBe('onboarding');state={...state,onboarding:{completed:[],claimed:[]},prestigeCount:1};state=createItem(state,'quantum-chip','common');expect(nextGoal(state).kind).toBe('equipment')});
 it('selects affordable recipes before research and milestones',()=>{let state=noTutorial(newGame(0));state={...state,data:1e6,blueprintFragments:99,modules:{computeBus:2,dataLattice:2},componentInventory:Object.fromEntries(Object.keys(state.componentInventory).map(id=>[id,999])) as GameState['componentInventory'],components:9990,completedResearch:['blueprints'],discovered:['calculator','sbc']};const goal=nextGoal(state);expect(goal.kind).toBe('recipe');expect(goal.tab).toBe('inventory');expect(goal.targetId).toBe('tutorial-recipe-quantum-chip')});
 it('falls back to the next allowed hardware milestone in catalog order',()=>{const base=noTutorial(newGame(0)),state={...base,onboarding:{completed:[],claimed:[]},crafting:{active:null,queue:Array(3).fill({}) as any},researchLabs:base.researchLabs.map(()=>({id:'dataGeneration',level:1,startedAt:0,endsAt:999999,durationSeconds:1,dataCost:1})) as GameState['researchLabs'],hardwareCounts:{...base.hardwareCounts,calculator:25}};const goal=nextGoal(state);expect(goal.kind).toBe('hardware');expect(goal.title).toContain('50');expect(goal.progress).toBe('25 / 50')});
});
describe('claimable badge',()=>{
 it('appears only for actually claimable tasks, bonuses, or season rewards',()=>{let state=rollPeriods(newGame(0),0);expect(missionRewardClaimable(state,'daily')).toBe(false);const task=state.missions.daily.tasks[0];state={...state,lifetime:{...state.lifetime,[task.metric]:state.lifetime[task.metric]+task.goal}};expect(missionRewardClaimable(state,'daily')).toBe(true);state={...state,missions:{...state.missions,daily:{...state.missions.daily,tasks:state.missions.daily.tasks.map(t=>t.id===task.id?{...t,claimed:true}:t)}}};expect(missionRewardClaimable(state,'daily')).toBe(false);expect(seasonClaimable(state)).toBe(false);state={...state,season:{...state.season,xp:1000}};expect(seasonClaimable(state)).toBe(true)});
});
