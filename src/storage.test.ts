import { describe, expect, it } from 'vitest';
import { newGame } from './economy';
import { BACKUP_KEY, SAVE_KEY, TEMP_KEY, loadGame, persistGame, RECOVERY_KEY, restore, serialize, StorageLike } from './storage';

class MemoryStorage implements StorageLike {
  value: string | null = null;
  getItem() { return this.value; }
  setItem(_key: string, value: string) { this.value = value; }
  removeItem() { this.value = null; }
}

describe('save format', () => {
  it('assigns a persistent anonymous campaign id to a fresh local game',()=>{const storage=new MemoryStorage(),first=loadGame(storage,100).state;expect(first.telemetry.campaignId).not.toBe('unassigned');persistGame(storage,first,100);expect(loadGame(storage,100).state.telemetry.campaignId).toBe(first.telemetry.campaignId)});

  it('round-trips a versioned game state', () => {
    const state = { ...newGame(123), credits: 42.25, level: 3, training: 17 };
    expect(restore(serialize(state), 999)).toEqual({ state });
  });
  it('rejects corrupt and incompatible saves without throwing', () => {
    expect(restore('{nope', 50).error).toMatch(/beschädigt/);
    expect(restore('{"version":99,"state":{}}', 50).error).toMatch(/anderen Version/);
  });
  it('migrates automatic model levels and partial work into manual tracks',()=>{
    const old={...newGame(1000),level:5,training:20};
    const raw=JSON.stringify({version:4,state:Object.fromEntries(Object.entries(old).filter(([key])=>!['qualityLevel','efficiencyLevel','activeTraining'].includes(key)))});
    const migrated=restore(raw,1000);
    expect(migrated.migrated).toBe(true);
    expect(migrated.state.qualityLevel).toBe(3);
    expect(migrated.state.efficiencyLevel).toBe(2);
    expect(migrated.state.level).toBe(5);
    expect(migrated.state.activeTraining?.track).toBe('quality');
    expect(migrated.state.training).toBeGreaterThan(0);
  });

  it('migrates Erkenntnis and inactive specialization to INT without loss',()=>{const old={...newGame(0),totalInsightEarned:9,unspentInsight:4,specialization:'coding',nodes:['infrastructure-1']};const restored=restore(JSON.stringify({version:6,state:old}),0);expect(restored.migrated).toBe(true);expect(restored.state.totalINTEarned).toBe(9);expect(restored.state.unspentINT).toBe(9);expect(restored.state.spentINT).toBe(0);expect(restored.state.legacySpecialization).toBe('coding');expect(restored.state.nodes).toEqual([])});

  it('migrates v7 saves with explicitly unavailable earlier telemetry',()=>{const old=newGame(100) as any;delete old.telemetry;const restored=restore(JSON.stringify({version:7,state:old}),200);expect(restored.migrated).toBe(true);expect(restored.state.telemetry.historicalDataAvailable).toBe(false);expect(restored.state.credits).toBe(old.credits)});

  it('migrates v9 saves to empty research labs without changing resources',()=>{const old=newGame(100) as any;delete old.researchLabs;delete old.purchasedResearchLabs;old.credits=4321;const restored=restore(JSON.stringify({version:9,state:old}),200);expect(restored.migrated).toBe(true);expect(restored.state.credits).toBe(4321);expect(restored.state.researchLabs).toEqual([null,null,null,null]);expect(restored.state.purchasedResearchLabs).toBe(0)});

  it('migrates v10 audio settings without changing progress',()=>{const current=newGame(100),old={...current,credits:4321,settings:{effects:false,buyMode:10 as const}};const restored=restore(JSON.stringify({version:10,state:old}),200);expect(restored.migrated).toBe(true);expect(restored.state.credits).toBe(4321);expect(restored.state.settings).toMatchObject({effects:false,buyMode:10,musicEnabled:false,sfxMuted:false})});


  it('loads a valid migration even when writing its backup fails, without overwriting it',()=>{const old=newGame(100) as any;delete old.aiName;const raw=JSON.stringify({version:11,state:old});const writes:string[]=[];const storage:StorageLike={getItem:()=>raw,setItem:(key)=>{writes.push(key);throw new Error('quota')},removeItem:()=>{}};const result=loadGame(storage,200);expect(result.state.aiName).toBe('AURA');expect(result.error).toMatch(/Migrationskopie/);expect(result.writable).toBe(false);expect(result.recoveryRaw).toBe(raw);expect(writes).toEqual([BACKUP_KEY])});

  it('preserves corrupt original data for explicit recovery and never enables autosave',()=>{const raw='{broken';const saved:Record<string,string>={};const storage:StorageLike={getItem:()=>raw,setItem:(key,value)=>{saved[key]=value},removeItem:()=>{}};const result=loadGame(storage,200);expect(result.writable).toBe(false);expect(result.recoveryRaw).toBe(raw);expect(saved[RECOVERY_KEY]).toBe(raw)});

  it('does not lose or duplicate time across background, save, close and reload', () => {
    const storage = new MemoryStorage();
    const started = newGame(0);
    const saved = persistGame(storage, started, 30_000);
    expect(saved.saved).toBe(true);
    expect(saved.state.credits).toBeCloseTo(30.375);
    expect(saved.state.savedAt).toBe(30_000);
    expect(saved.state.training).toBe(0);

    const loaded = loadGame(storage, 50_000);
    const resumed = persistGame(storage, loaded.state, 50_000);
    expect(resumed.state.credits).toBeCloseTo(50.625);
    expect(resumed.state.savedAt).toBe(50_000);
  });

  it('turns localStorage read and write failures into visible error results', () => {
    const readFailure: StorageLike = { getItem: () => { throw new Error('blocked'); }, setItem: () => {}, removeItem: () => {} };
    expect(loadGame(readFailure, 10).error).toMatch(/nicht gelesen/);
    expect(loadGame(readFailure, 10).writable).toBe(false);

    const writeFailure: StorageLike = { getItem: () => null, setItem: () => { throw new Error('full'); }, removeItem: () => {} };
    const result = persistGame(writeFailure, newGame(0), 1_000);
    expect(result.saved).toBe(false);
    expect(result.error).toMatch(/nicht möglich/);
  });
});

describe('transactional backup saves',()=>{
 it('restores the newest valid backup when the primary is corrupt',()=>{const values=new Map<string,string>(),storage:StorageLike={getItem:k=>values.get(k)??null,setItem:(k,v)=>{values.set(k,v)},removeItem:k=>{values.delete(k)}};values.set(BACKUP_KEY,serialize({...newGame(0),credits:77}));values.set('ai-singularity.save','{broken');const loaded=loadGame(storage,100);expect(loaded.state.credits).toBe(77);expect(loaded.error).toMatch(/Backup/);expect(loaded.writable).toBe(true);});
 it('refuses a non-finite snapshot without replacing the valid save',()=>{const values=new Map<string,string>(),storage:StorageLike={getItem:k=>values.get(k)??null,setItem:(k,v)=>{values.set(k,v)},removeItem:k=>{values.delete(k)}};const valid=serialize(newGame(0));values.set('ai-singularity.save',valid);const result=persistGame(storage,{...newGame(0),credits:Infinity},0);expect(result.saved).toBe(false);expect(values.get('ai-singularity.save')).toBe(valid);});
});

it('migrates v14 telemetry into persistent snapshots and diagnostics',()=>{const old:any=newGame(0);delete old.telemetry.snapshots;delete old.telemetry.diagnostics;for(const event of old.telemetry.recentEvents)delete event.resources;const restored=restore(JSON.stringify({version:14,state:old}),100);expect(restored.migrated).toBe(true);expect(restored.state.telemetry.snapshots).toEqual([]);expect(restored.state.telemetry.diagnostics.recoveries).toBe(0);});

describe('save-stage diagnostics and quota recovery',()=>{
 class QuotaStorage implements StorageLike {values=new Map<string,string>();constructor(readonly limit:number){}getItem(k:string){return this.values.get(k)??null}removeItem(k:string){this.values.delete(k)}setItem(k:string,v:string){const used=[...this.values].filter(([key])=>key!==k).reduce((n,[,value])=>n+value.length,0);if(used+v.length>this.limit)throw new DOMException(`quota ${used+v.length}/${this.limit}`,'QuotaExceededError');this.values.set(k,v)}seed(k:string,v:string){this.values.set(k,v)} }
 it('identifies the fifth full-size temporary copy as QuotaExceededError and retries without losing the primary',()=>{const state={...newGame(0),credits:123},raw=serialize(state),storage=new QuotaStorage(Math.ceil(raw.length*4.2));storage.seed('ai-singularity.save',raw);storage.seed(BACKUP_KEY,raw);storage.seed(`${BACKUP_KEY}.2`,raw);storage.seed(`${BACKUP_KEY}.3`,raw);const result=persistGame(storage,state,0);expect(result.saved).toBe(true);expect(result.quotaRecovery?.name).toBe('QuotaExceededError');expect(loadGame(storage,0).state.credits).toBe(123);expect(storage.getItem(`${BACKUP_KEY}.3`)).toBeTruthy()});
 it('reports the exact failing stage, name, message and sizes while preserving the valid primary',()=>{const valid=serialize({...newGame(0),credits:77}),storage:StorageLike={getItem:key=>key===SAVE_KEY?valid:null,setItem:(key)=>{if(key===TEMP_KEY)throw new DOMException('test quota','QuotaExceededError')},removeItem:()=>{}};const result=persistGame(storage,newGame(0),0);expect(result.saved).toBe(false);if(result.saved)return;expect(result.failure).toMatchObject({stage:'temp-write',name:'QuotaExceededError',message:'test quota'});expect(result.failure.sizes.main).toBe(valid.length);expect(storage.getItem(SAVE_KEY)).toBe(valid)});
});

it('migrates v16 research and fixed running durations losslessly',()=>{const old:any=newGame(100);delete old.researchLevels;old.researchLabs[0]={id:'operations',startedAt:100,endsAt:180100};const result=restore(JSON.stringify({version:16,state:old}),200);expect(result.migrated).toBe(true);expect(result.state.researchLevels.dataGeneration).toBe(0);expect(result.state.researchLabs[0]).toMatchObject({level:1,durationSeconds:180})});
