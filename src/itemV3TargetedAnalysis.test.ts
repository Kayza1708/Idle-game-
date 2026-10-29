import {prestigeV3Description} from './prestigeV3Copy';
import {languages} from './i18n';
import {describe,it,expect} from 'vitest';
import {newGame,type GameState} from './economy';
import {newItemSystemV3} from './itemSystemV3';
import {queueExperiment,completeExperiment} from './experiments';
import {ScientificNumber as S} from './scientificNumber';
const prepared=(material=0,blueprint=0):GameState=>{const s=newGame(1000,'prepared-W03');return{...s,itemSystemV3:newItemSystemV3(),nodes:['W03'],data:1e12,exactEconomy:{...s.exactEconomy,data:S.from(1e12).toJSON()},researchLevels:{...s.researchLevels,materialAnalysis:material,blueprintAnalysis:blueprint},materials:{...s.materials,focus:'base'}};};
const finish=(s:GameState)=>completeExperiment(s,s.experiments.active!.endsAt,()=>.5);
describe('V3 targeted analysis W03 paid family contract',()=>{
 it('does not introduce locked rare materials when no rare family was unlocked',()=>{const done=finish(queueExperiment(prepared(),'hardware',1000,'short'));expect(done.componentInventory.graphene).toBe(0);expect(done.componentInventory.nanotubes).toBe(0);});
 it('keeps a valid old rare preference and uses an unlocked fallback rather than locked graphene',()=>{const photonic=finish(queueExperiment(prepared(3),'hardware',1000,'short'));expect(photonic.componentInventory.graphene).toBe(1);const frontier=finish(queueExperiment(prepared(0,5),'hardware',1000,'short'));expect(frontier.componentInventory.graphene).toBe(0);expect(frontier.componentInventory.nanotubes).toBe(1);});
 it('honors an existing paid legacy guarantee without retroactively changing its family terms',()=>{const started=queueExperiment(prepared(),'hardware',1000,'short'),job=started.experiments.active!,old={...started,experiments:{...started.experiments,active:{...job,familyContractVersion:undefined,rareCandidate:undefined,materialContract:{...job.materialContract!,familyFactors:{base:1,semiconductor:1,photonic:1,frontier:1,quantum:1}}}}};expect(finish(old).componentInventory.graphene).toBe(1);});
 it('rejects malformed family receipts before paying',()=>{const started=queueExperiment(prepared(),'hardware',1000,'short'),job=started.experiments.active!;for(const patch of [{rareCandidate:'circuits' as const},{rareCandidate:undefined},{familyContractVersion:2 as never}]){const bad={...started,experiments:{...started.experiments,active:{...job,...patch}}};expect(()=>finish(bad)).toThrow('Invalid analysis family contract');expect(bad.componentInventory).toEqual(started.componentInventory);}});
 it('describes the actual new rule in all seven languages',()=>{for(const language of languages){const text=prestigeV3Description('W03',language)!;expect(text).toContain('×2');expect(text).not.toContain('{');}});
 it('doubles only the selected family and keeps paid start factors after focus/node changes',()=>{const s=prepared(3),started=queueExperiment(s,'hardware',1000,'short'),a=finish(started),without=queueExperiment({...s,nodes:[]},'hardware',1000,'short'),b=finish(without);for(const id of ['circuits','copperCoils','ceramicCapacitors','ferriteCores'] as const)expect(a.componentInventory[id]).toBe(b.componentInventory[id]*2);expect(a.componentInventory.graphene).toBe(1);const changed={...started,nodes:[],materials:{...started.materials,focus:null}};expect(finish(changed).componentInventory).toEqual(a.componentInventory);});
});
