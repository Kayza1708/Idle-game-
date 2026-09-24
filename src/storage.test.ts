import { describe, expect, it } from 'vitest';
import { newGame } from './economy';
import { BACKUP_KEY, loadGame, persistGame, RECOVERY_KEY, restore, serialize, StorageLike } from './storage';

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
