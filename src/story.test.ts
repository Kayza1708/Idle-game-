import {ScientificNumber} from './scientificNumber';
import { describe, expect, it } from 'vitest';
import { type GameState, addCredits, newGame, registerTap, usersRate } from './economy';
import { prestige,axiomReset } from './prestige';
import { chooseAiName,continueDialogue, dialogues, migratedStory, prepareStoryOnLoad, reopenChapter, skipTutorial, syncStory, toggleStory } from './story';
import { restore, serialize } from './storage';

const reachTapPrompt=(state=newGame(0))=>{let next=chooseAiName(state,'Nova');for(let i=0;i<4;i++)next=continueDialogue(next);return next;};

describe('Mira story and tutorial',()=>{
 it('requires naming first only for a fresh campaign and persists the safe name',()=>{const fresh=newGame(0);expect(fresh.aiName).toBeNull();expect(fresh.story.target).toBe('name');const named=chooseAiName(fresh,'Nova');expect(named.story.open).toBe('prologue-welcome');expect(restore(serialize(named),1).state.aiName).toBe('Nova');expect(chooseAiName(named,'Other').aiName).toBe('Nova')});
 it('starts new campaigns with the prologue and advances after a real tap',()=>{
  let state=reachTapPrompt();expect(state.story.open).toBe('tutorial-tap');
  state=continueDialogue(state);expect(state.story.target).toBe('tap');expect(state.story.open).toBeNull();
  const tapped=registerTap(state,state.savedAt);state=syncStory(state,tapped);
  expect(state.story.open).toBe('tutorial-hardware');expect(state.story.target).toBe('hardware');
 });

 it('persists tutorial progress through save and reload',()=>{
  const state=continueDialogue(reachTapPrompt());
  const restored=restore(serialize(state),100).state;
  expect(restored.story.target).toBe('tap');expect(restored.story.open).toBeNull();
 });

 it('skips the tutorial without changing game progress',()=>{
  const state=newGame(0),skipped=skipTutorial(state);
  expect(skipped.story.tutorial).toBe('skipped');expect(skipped.story.open).toBeNull();
  expect(skipped.credits).toBe(state.credits);expect(skipped.hardwareCounts).toEqual(state.hardwareCounts);
 });

 it('does not send existing v8 campaigns back to the prologue',()=>{
  const old:any={...newGame(0)};delete old.story;
  const restored=restore(JSON.stringify({version:8,state:old}),100);
  expect(restored.migrated).toBe(true);expect(restored.state.story).toEqual(migratedStory());expect(restored.state.aiName).toBe('AURA');
 });

 it('skips a tutorial action that is already fulfilled',()=>{
  let state=reachTapPrompt(),tapped=registerTap(state,state.savedAt);state={...tapped,story:state.story};
  state=continueDialogue(state);expect(state.story.open).toBe('tutorial-hardware');expect(state.story.target).toBe('hardware');
 });

 it('queues simultaneous first-time events instead of stacking dialogues',()=>{
  const before={...newGame(0),story:migratedStory()},after={...before,hardware:10,hardwareCounts:{...before.hardwareCounts,calculator:10},level:1,qualityLevel:1,completedResearch:['operations'] as GameState['completedResearch'],lifetimeEligibleCredits:1e15,cycleEligibleCredits:1e15};
  const next=syncStory(before,after);
  expect(next.story.open).toBe('first-hardware');
  expect(next.story.queue).toEqual(expect.arrayContaining(['first-training','first-research','first-milestone','prestige-ready']));
  expect(new Set([next.story.open,...next.story.queue]).size).toBe(1+next.story.queue.length);
 });

 it('keeps the chosen AI name through reload and prestige',()=>{let state:GameState={...newGame(0),aiName:'Nova',credits:1e15,runCreditsEarned:1e15,lifetimeCreditsEarned:1e15,lifetimeEligibleCredits:1e15,cycleEligibleCredits:1e15};state=restore(serialize(state),10).state;expect(prestige(state).aiName).toBe('Nova')});

 it('uses the actual first prestige reward in the saved dialogue state',()=>{
  const funded=addCredits(newGame(0),1e15),before={...funded,story:migratedStory(),hardware:1,hardwareCounts:{...funded.hardwareCounts,calculator:1},discovered:['calculator'] as GameState['discovered']};
  const after=syncStory(before,prestige(before));
  expect(after.story.seen).toContain('first-prestige');expect(after.telemetry.prestigeHistory.at(-1)?.intEarned).toBeGreaterThan(0);
 });

 it('opens each progression chapter exactly once and in its fixed order',()=>{
  const before={...newGame(0),story:migratedStory()};
  const after={...before,qualityLevel:1,hardware:2e6,prestigeCount:1,equipped:{processor:'item-1'},hardwareCounts:{...before.hardwareCounts,server:1}};
  expect(usersRate(after)).toBeGreaterThanOrEqual(1000);
  const next=syncStory(before,after);
  expect(next.story.chapters).toEqual(['aura-signal','aura-customers','aura-company','aura-equipment','aura-infrastructure']);
  expect([next.story.open,...next.story.queue].filter(id=>id?.endsWith('-1'))).toEqual(['aura-signal-1','aura-customers-1','aura-company-1','aura-equipment-1','aura-infrastructure-1']);
  expect(syncStory(after,next).story).toEqual(next.story);
 });

 it('uses concurrent users and requires an actually equipped item',()=>{
  const before={...newGame(0),story:migratedStory(),lifetimeCreditsEarned:1e12,inventory:[{id:'item-1',type:'quantum-chip',rarity:'common',level:0,locked:false}] as GameState['inventory']};
  const owned=syncStory(before,{...before,inventory:before.inventory});
  expect(owned.story.chapters).not.toContain('aura-customers');expect(owned.story.chapters).not.toContain('aura-equipment');
  const equipped=syncStory(owned,{...owned,equipped:{processor:'item-1'}});
  expect(equipped.story.chapters).toContain('aura-equipment');
 });

 it('keeps tutorial dialogue ahead of simultaneous story chapters',()=>{
  const base=continueDialogue(reachTapPrompt()),before={...base,story:{...base.story,target:'hardware' as const}},after={...before,qualityLevel:1,lifetime:{...before.lifetime,calculatorsBought:1,hardwareBought:1}};
  const next=syncStory(before,after);
  expect(next.story.open).toBe('tutorial-production');
  expect(next.story.queue).toContain('aura-signal-1');
 });

 it('unlocks legacy progress on load without popups and does not replay after reload',()=>{
  const legacy={...newGame(0),qualityLevel:1,prestigeCount:1,story:{...migratedStory(),chapters:undefined}};
  const prepared=prepareStoryOnLoad(legacy);
  expect(prepared.story.chapters).toEqual(expect.arrayContaining(['aura-signal','aura-company']));expect(prepared.story.open).toBeNull();
  expect(prepareStoryOnLoad(restore(serialize(prepared),100).state).story.open).toBeNull();
 });

 it('unlocks disabled story for side-effect-free journal rereading',()=>{
  let before=toggleStory({...newGame(0),story:migratedStory()});
  const next=syncStory(before,{...before,qualityLevel:1});
  expect(next.story.enabled).toBe(false);expect(next.story.open).toBeNull();expect(next.story.chapters).toContain('aura-signal');
  const replay=reopenChapter(next,'aura-signal');expect(replay.story.open).toBe('aura-signal-1');
  const closed=continueDialogue(continueDialogue(replay));expect(closed.qualityLevel).toBe(next.qualityLevel);expect(closed.story.chapters).toEqual(next.story.chapters);
 });

 it('provides equivalent German and English copy with a safely substituted AI name',()=>{
  const de={...newGame(0),aiName:'Nova & Co',settings:{...newGame(0).settings,language:'de' as const}},en={...de,settings:{...de.settings,language:'en' as const}};
  expect(dialogues['aura-customers-1'].text(de)).toContain('Tausend Menschen');
  expect(dialogues['aura-customers-1'].text(en)).toContain('A thousand people');
  expect(dialogues['aura-customers-1'].text(en)).toContain('Nova & Co');
 });
});

it('shows the first axiom explanation exactly once',()=>{const fresh=newGame(0),before={...fresh,hardware:1,hardwareCounts:{...fresh.hardwareCounts,calculator:1},discovered:['calculator'] as GameState['discovered'],story:migratedStory(),cycleINTEarned:1e300,totalINTEarned:1e300,unspentINT:1e300,exactEconomy:{...newGame(0).exactEconomy,cycleINTEarned:{m:1,e:1000000000000000},totalINTEarned:{m:1,e:1000000000000000},unspentINT:{m:1,e:1000000000000000}}},first=syncStory(before,axiomReset(before));expect(first.story.seen).toContain('first-axiom');const again=syncStory(first,{...first,axiomResetCount:2});expect(again.story.queue.filter(id=>id==='first-axiom')).toHaveLength(0)});

it('does not force a v36 existing save into naming',()=>{const old:any=newGame(0);old.aiName=null;old.story={...old.story,target:'prologue',open:'prologue-welcome'};const restored=restore(JSON.stringify({version:36,state:old}),10);expect(restored.migrated).toBe(true);expect(restored.state.aiName).toBe('AURA');expect(restored.state.story.target).not.toBe('name')});
