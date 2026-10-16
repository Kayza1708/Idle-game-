import {newGame} from './legacyContractFixture';
import {describe,it,expect,vi} from 'vitest';
import {type GameState} from './economy';
import {validForgeSelection,readForgeSelection,rememberForgeSelection} from './forgePreferences';
import {prestigeMapScale,PRESTIGE_CANVAS} from './prestigeTree';
const learned=():GameState=>({...newGame(0,'preferences'),completedResearch:['blueprints'],learnedRecipes:['quantum-chip']});
describe('mobile recipe preference isolation',()=>{
 it('persists only accessible recipes across mounts and rejects unlearned or invalid input',()=>{const values=new Map<string,string>();vi.stubGlobal('localStorage',{getItem:(k:string)=>values.get(k)??null,setItem:(k:string,v:string)=>values.set(k,v)});try{const s=learned();rememberForgeSelection(s,{kind:'item',id:'quantum-chip'});expect(readForgeSelection(s)).toEqual({kind:'item',id:'quantum-chip'});expect(readForgeSelection({...s,learnedRecipes:[]})).toBeNull();expect(validForgeSelection(s,{kind:'item',id:'not-an-item'})).toBe(false);expect(readForgeSelection({...s,telemetry:{...s.telemetry,campaignId:'other'}})).toBeNull();expect(readForgeSelection({...s,retention:{...s.retention,activeRun:{runId:'challenge'} as any}})).toBeNull();expect(values.size).toBe(1)}finally{vi.unstubAllGlobals()}});
 it('survives corrupt and unavailable preference storage without changing a game state',()=>{const s=learned(),before=JSON.stringify(s);vi.stubGlobal('localStorage',{getItem:()=>'{broken',setItem:()=>{throw Error('storage disabled')}});try{expect(readForgeSelection(s)).toBeNull();expect(()=>rememberForgeSelection(s,{kind:'item',id:'quantum-chip'})).not.toThrow();expect(JSON.stringify(s)).toBe(before)}finally{vi.unstubAllGlobals()}});
 it('keeps all prestige nodes larger than the mobile touch minimum at every permitted zoom',()=>{for(const scale of [.01,.1,.5,.65,1,1.5,5])expect(PRESTIGE_CANVAS.nodeWidth*prestigeMapScale(scale)).toBeGreaterThanOrEqual(44)});
});
