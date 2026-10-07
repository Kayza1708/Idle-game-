import {learnBlueprint} from './blueprints';
import {describe,expect,it} from 'vitest';
import {BALANCE,newGame,addData,grantComponents,creditRate,type GameState} from './economy';
import {craft,craftModule,createItem,equip} from './inventory';
import {advance} from './simulation';
import {SAVE_VERSION,SAVE_KEY,BACKUP_KEYS,TEMP_KEY,importGame,restore,serialize,validate,persistGame,loadGame,type StorageLike} from './storage';
import {persistDurableGame} from './durableStorage';

function ready(){let s=grantComponents({...addData(newGame(0),20000),prestigeCount:1,completedResearch:['blueprints' as const],modules:{computeBus:10,dataLattice:10},blueprintFragments:100},{circuits:1000,copperCoils:1000,siliconWafers:1000,titaniumBolts:1000,photonicLenses:1000,graphene:1000,nanotubes:1000});s=createItem(s,'quantum-chip','rare');return learnBlueprint(equip(s,s.inventory[0].id),'quantum-chip');}
const raw=(s:unknown,version=SAVE_VERSION)=>JSON.stringify({version,state:s});
const badStates:{name:string;change:(s:GameState)=>void;error?:RegExp}[]=[
 {name:'unknown item type',change:s=>{s.inventory[0].type='alien' as never},error:/Itemtyp/},
 {name:'invalid rarity',change:s=>{s.inventory[0].rarity='godlike' as never},error:/Qualität/},
 {name:'duplicate inventory instance ID',change:s=>{s.inventory.push({...s.inventory[0]})},error:/doppelte/},
 {name:'missing equipped instance',change:s=>{s.equipped.processor='missing'},error:/equipped/},
 {name:'incompatible equipment slot',change:s=>{s.equipped={core:s.inventory[0].id}},error:/equipped/},
 {name:'same instance equipped twice',change:s=>{s.equipped.research=s.inventory[0].id},error:/equipped/},
 {name:'equipment before socket unlock',change:s=>{s.prestigeCount=0},error:/equipped/},
 {name:'unknown equipment slot',change:s=>{(s.equipped as Record<string,string>).utility=s.inventory[0].id},error:/equipped/},
 {name:'missing component',change:s=>{delete(s.componentInventory as Partial<typeof s.componentInventory>).circuits}},
 {name:'unknown component',change:s=>{(s.componentInventory as Record<string,number>).alien=1}},
 {name:'negative component',change:s=>{s.componentInventory.circuits=-1}},
 {name:'fractional component',change:s=>{s.componentInventory.circuits=.5}},
 {name:'negative module',change:s=>{s.modules.computeBus=-1}},
 {name:'unknown module',change:s=>{(s.modules as Record<string,number>).alien=1}},
 {name:'negative blueprint fragments',change:s=>{s.blueprintFragments=-1}},
 {name:'invalid instance level',change:s=>{s.inventory[0].level=.5}},
 {name:'invalid forge level',change:s=>{s.inventory[0].forge=21}},
 {name:'unsafe next ID',change:s=>{s.nextId=Number.MAX_SAFE_INTEGER+1}},
 {name:'colliding next ID',change:s=>{s.nextId=1}},
 {name:'unknown research',change:s=>{s.completedResearch=['alien' as never]}},
 {name:'unknown queued research',change:s=>{s.researchQueue=['alien' as never]}},
 {name:'unknown hardware',change:s=>{s.discovered=['alien' as never]}},
 {name:'corrupt scientific Data',change:s=>{s.exactEconomy.data={m:1,e:NaN}}},
 {name:'negative scientific credits',change:s=>{s.exactEconomy.credits={m:-1,e:0}}},
 {name:'nonfinite projection',change:s=>{s.data=Infinity}},
 {name:'invalid timestamp',change:s=>{s.savedAt=-1}},
 {name:'unknown planner recipe',change:s=>{s.craftingPlanner.recipeId='alien' as never}},
];
describe('one catalog-aware save/load/import validation boundary',()=>{
 it.each(badStates)('rejects $name without accepting a production-crashing state',({change,error})=>{const s=structuredClone(ready());change(s);expect(validate(s)).toBe(false);const loaded=restore(raw(s),0);expect(loaded.error).toMatch(error??/beschädigt/);expect(()=>importGame(raw(s))).toThrow(error??/beschädigt/);expect(()=>serialize(s)).toThrow();});
 it('rejects empty import payloads without substituting a fresh game, while a missing local save still starts normally',()=>{let current=ready();const before=structuredClone(current);for(const empty of ['', '  ',null,undefined]){expect(()=>{current=importGame(empty as string)}).toThrow(/Import enthält keinen Spielstand/);expect(current).toEqual(before);}expect(restore(null,0).error).toBeUndefined();expect(restore(null,0).state.savedAt).toBe(0);});
 it('rejects malformed structures without uncontrolled validation exceptions',()=>{for(const s of [null,[],{}, {...ready(),inventory:[null]},{...ready(),equipped:[]},{...ready(),crafting:{active:null,queue:[null]}},{...ready(),researchLabs:[null,null,null,{}]}]){expect(()=>validate(s)).not.toThrow();expect(validate(s)).toBe(false);expect(restore(raw(s),0).error).toBeTruthy();}});
 it('rejects every invalid reservation or active job instead of dropping it or creating a free replacement',()=>{const valid=craft(ready(),'quantum-chip','common',5);expect(validate(valid)).toBe(true);const mutations:((s:GameState)=>void)[]=[s=>{s.crafting.active!.recipeId='alien' as never},s=>{s.crafting.active!.quantity=1.5},s=>{s.crafting.active!.completed=5},s=>{s.crafting.active!.ingredients.modules.computeBus=1},s=>{s.crafting.active!.ingredients.data=0},s=>{s.crafting.active!.ingredients.blueprints=4},s=>{s.crafting.active!.ingredients.components.circuits=-1},s=>{(s.crafting.active!.ingredients.components as Record<string,number>).alien=0},s=>{s.crafting.active!.result.id='neural-asic'},s=>{s.crafting.active!.result.rarity='rare'},s=>{s.crafting.active!.startedAt=1000;s.crafting.active!.endsAt=301000},s=>{s.crafting.active!.endsAt=-1},s=>{s.crafting.active!.durationPerUnit=0},s=>{s.crafting.queue=[{...s.crafting.active!,startedAt:null,endsAt:null}]},s=>{s.crafting.active=null;s.crafting.queue=[valid.crafting.active!]}];for(const mutate of mutations){const s=structuredClone(valid);mutate(s);expect(validate(s)).toBe(false);expect(()=>importGame(raw(s))).toThrow();}});
 it('rejects unknown or contradictory active research, training and analysis jobs',()=>{const bad=[{...ready(),researchLabs:[{id:'alien',level:1,startedAt:0,endsAt:1000,durationSeconds:1,dataCost:100},null,null,null]},{...ready(),activeTraining:{track:'alien',workRequired:100,creditCost:0}},{...ready(),experiments:{...ready().experiments,active:{id:'exp-99',type:'alien',length:'short',startedAt:0,endsAt:1000}}}];for(const s of bad)expect(()=>importGame(raw(s))).toThrow();});
 it('preserves running state, valid primary, pending and every backup on a failed import',()=>{let current=ready();const before=structuredClone(current),values=new Map<string,string>([SAVE_KEY,TEMP_KEY,...BACKUP_KEYS].map(key=>[key,serialize(current)])),storage:StorageLike={getItem:k=>values.get(k)??null,setItem:(k,v)=>{values.set(k,v)},removeItem:k=>{values.delete(k)}},stored=[...values];const bad=structuredClone(current);bad.inventory[0].type='alien' as never;expect(()=>{current=importGame(raw(bad))}).toThrow(/Itemtyp/);expect(current).toEqual(before);expect([...values]).toEqual(stored);expect(loadGame(storage,0).state.inventory).toEqual(before.inventory);});
 it('rejects an invalid save before simulation and preserves valid saves/backups',async()=>{const current=ready(),values=new Map<string,string>([SAVE_KEY,...BACKUP_KEYS].map(key=>[key,serialize(current)])),storage:StorageLike={getItem:k=>values.get(k)??null,setItem:(k,v)=>{values.set(k,v)},removeItem:k=>{values.delete(k)}},stored=[...values],bad=structuredClone(current);bad.inventory[0].type='alien' as never;const result=persistGame(storage,bad,1000);expect(result.saved).toBe(false);if(!result.saved)expect(result.failure.stage).toBe('validate');expect([...values]).toEqual(stored);await expect(persistDurableGame(bad,1000)).rejects.toThrow(/Itemtyp/);});
 it('accepts a genuine crafted and equipped state and all scientific ledgers after roundtrip',()=>{const state=advance(craftModule(craft(ready(),'quantum-chip','common',5),'computeBus',2),600).state,loaded=restore(serialize(state),600000);expect(loaded.error).toBeUndefined();expect(loaded.state).toEqual(state);expect(validate(importGame(serialize(state)))).toBe(true);expect(()=>creditRate(loaded.state.hardware,loaded.state.level,loaded.state)).not.toThrow();});
 it('preserves a valid full reservation during existing older-format migration',()=>{const s=craft(ready(),'quantum-chip','common',5),old=structuredClone(s) as any;delete old.settings.hapticsEnabled;const loaded=restore(raw(old,39),0);expect(loaded.error).toBeUndefined();expect(loaded.migrated).toBe(true);expect(loaded.state.crafting).toEqual(s.crafting);expect(advance(loaded.state,BALANCE.craftingSeconds.common*5).state.inventory).toHaveLength(6);});
 it('normalizes value-preserving old scientific ledgers before validating purchase/reservation',()=>{const s=ready(),old={...s,data:1,exactEconomy:{...s.exactEconomy,data:{m:90,e:2}}},loaded=importGame(raw(old));expect(loaded.data).toBe(9000);expect(loaded.exactEconomy.data).toEqual({m:9,e:3});expect(craft(loaded,'quantum-chip','common',5).data).toBe(0);});
});
