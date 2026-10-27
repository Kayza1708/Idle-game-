import {describe,it,expect} from 'vitest';
import {newGame,BALANCE,lateMetaItemCatalog,lateMetaItemUnlocked,itemTypes,type GameState,type LateMetaItemId} from './economy';
import {createItem,equip,randomItem} from './inventory';
import {deviceBonus} from './deviceEffects';
import {ScientificNumber as S} from './scientificNumber';
import {knowledgeRate,modelCore,progressionResearchSpeed} from './progression';
const ids=Object.keys(lateMetaItemCatalog) as LateMetaItemId[];
function prepared():GameState{let s=newGame(1000);return {...s,axiomResetCount:5,progression:{...s.progression,lab:true,bestINT:S.from(1e6).toJSON(),knowledge:S.from(1e6).toJSON(),models:{K01:3,K02:2,K03:1,K04:0,K05:0},active:'K01'}};}
function equipped(id:LateMetaItemId){let s=createItem(prepared(),id,'legendary');s=equip(s,s.inventory.at(-1)!.id);expect(Object.values(s.equipped)).toContain(s.inventory.at(-1)!.id);return s;}
describe('six additional late-meta items',()=>{
 it('appends six IDs without replacing the original thirty and keeps distinct bounded primary roles',()=>{expect(Object.keys(itemTypes).slice(-6)).toEqual(ids);expect(new Set(ids.map(id=>lateMetaItemCatalog[id].role)).size).toBe(6);for(const id of ids){expect(BALANCE.itemRecipes[id].blueprints).toBeGreaterThan(0);expect(Object.keys(BALANCE.itemRecipes[id].ingredients).length).toBeGreaterThan(2);expect(lateMetaItemUnlocked(newGame(0),id)).toBe(false);}});
 it.each(ids)('requires real progression and an equipped %s before applying its effect',id=>{const s=equipped(id),role=lateMetaItemCatalog[id].role;expect(deviceBonus(s,role)).toBeGreaterThan(0);expect(deviceBonus(s,role)).toBeLessThanOrEqual(lateMetaItemCatalog[id].cap);expect(deviceBonus({...s,equipped:{}},role)).toBe(0);expect(deviceBonus({...s,progression:{...s.progression,lab:false}},role)).toBe(0);});
 it('uses capped knowledge, accumulated axiom cycles, model collection and an active model',()=>{let s=equipped('entropy-sink');expect(deviceBonus({...s,progression:{...s.progression,knowledge:S.from(1e90).toJSON()}},'knowledgeCompute')).toBe(deviceBonus(s,'knowledgeCompute'));s=equipped('cycle-observatory');expect(deviceBonus({...s,axiomResetCount:0},'cycleResearch')).toBe(0);s=equipped('model-echo-core');expect(deviceBonus({...s,progression:{...s.progression,active:null}},'modelEcho')).toBe(0);expect(modelCore(s)).toBeGreaterThan(modelCore({...s,equipped:{}}));});
 it('excludes locked new items from real random drops and admits all six once unlocked',()=>{for(const state of [newGame(1000),prepared()])for(let i=0;i<100;i++){const result=randomItem(state,()=>i/100);const type=result.inventory.at(-1)!.type;expect(lateMetaItemUnlocked(state,type)).toBe(true);}expect(randomItem(prepared(),()=>.999).inventory.at(-1)!.type).toBe('mnemonic-anchor');});
 it('feeds real knowledge and research consumers',()=>{const insight=equipped('darklab-resonator');const base={...insight,equipped:{}};expect(knowledgeRate(insight).compare(knowledgeRate(base))).toBeGreaterThan(0);const research=equipped('cycle-observatory');expect(progressionResearchSpeed(research)).toBeGreaterThan(progressionResearchSpeed({...research,equipped:{}}));});
});
