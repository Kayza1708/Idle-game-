import {describe,it,expect} from 'vitest';
import {newGame,type GameState} from './economy';
import {migratedStory,openAnalysisGuide,syncStory,continueDialogue} from './story';
import {serialize,restore} from './storage';
const fresh=():GameState=>({...newGame(1000000),aiName:'AURA',story:migratedStory()});
describe('progress-aware Mira analysis guidance',()=>{
 it('does not expose locked queue or repeat help',()=>{const s=fresh();for(const id of ['analysis-queue','analysis-repeat','analysis-budget'])expect(openAnalysisGuide(s,id)).toBe(s);});
 it('introduces queue and offline reserve only after the real feature unlock',()=>{const b=fresh(),s=syncStory(b,{...b,nodes:['F02']});expect(s.story.open).toBe('analysis-queue');expect(s.story.queue).toEqual(['analysis-budget']);expect(s.story.queue).not.toContain('analysis-repeat');expect(s.credits).toBe(b.credits);expect(s.data).toBe(b.data);});
 it('introduces repeat through either F03 or C02 without awarding anything',()=>{for(const axiom of [false,true]){const b=fresh(),s=syncStory(b,{...b,nodes:axiom?[]:['F03'],axiomUpgradeLevels:{...b.axiomUpgradeLevels,...(axiom?{C02:1}:{})}});expect(s.story.open).toBe('analysis-repeat');expect(s.story.queue).toEqual(['analysis-budget']);expect(s.inventory).toEqual(b.inventory);}});
 it('supports existing saves via manual help even with automatic chapters disabled',()=>{const b=fresh(),s={...b,nodes:['F02'],story:{...b.story,enabled:false}} as GameState;expect(openAnalysisGuide(s,'analysis-queue').story.open).toBe('analysis-queue');expect(syncStory({...s,nodes:[]},s).story.open).toBeNull();});
 it('persists seen guidance and does not automatically repeat it after reload',()=>{const b=fresh();let s=syncStory(b,{...b,nodes:['F02']});s=continueDialogue(continueDialogue(s));const loaded=restore(serialize(s),s.savedAt);expect(loaded.error).toBeUndefined();expect(loaded.state.story.seen).toContain('analysis-queue');expect(loaded.state.story.seen).toContain('analysis-budget');expect(syncStory(loaded.state,{...loaded.state,nodes:['F02','F03']}).story.queue).not.toContain('analysis-budget');expect(loaded.state.credits).toBe(b.credits);});
});
