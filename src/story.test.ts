import { describe, expect, it } from 'vitest';
import { type GameState, newGame, registerTap } from './economy';
import { prestige } from './prestige';
import { continueDialogue, migratedStory, skipTutorial, syncStory } from './story';
import { restore, serialize } from './storage';

const reachTapPrompt=(state= newGame(0))=>{let next=state;for(let i=0;i<4;i++)next=continueDialogue(next);return next;};

describe('Mira story and tutorial',()=>{
 it('starts new campaigns with the prologue and advances after a real tap',()=>{
  let state=reachTapPrompt();expect(state.story.open).toBe('tutorial-tap');
  state=continueDialogue(state);expect(state.story.target).toBe('tap');expect(state.story.open).toBeNull();
  const tapped=registerTap(state,state.savedAt);state=syncStory(state,tapped);
  expect(state.story.open).toBe('tutorial-tap-result');
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
  expect(restored.migrated).toBe(true);expect(restored.state.story).toEqual(migratedStory());
 });

 it('skips a tutorial action that is already fulfilled',()=>{
  let state=reachTapPrompt(),tapped=registerTap(state,state.savedAt);state={...tapped,story:state.story};
  state=continueDialogue(state);expect(state.story.open).toBe('tutorial-tap-result');
 });

 it('queues simultaneous first-time events instead of stacking dialogues',()=>{
  const before={...newGame(0),story:migratedStory()},after={...before,hardware:10,hardwareCounts:{...before.hardwareCounts,calculator:10},level:1,qualityLevel:1,completedResearch:['operations'] as GameState['completedResearch'],lifetimeEligibleCredits:13e9};
  const next=syncStory(before,after);
  expect(next.story.open).toBe('first-hardware');
  expect(next.story.queue).toEqual(expect.arrayContaining(['first-training','first-research','first-milestone','prestige-ready']));
  expect(new Set([next.story.open,...next.story.queue]).size).toBe(1+next.story.queue.length);
 });

 it('uses the actual first prestige reward in the saved dialogue state',()=>{
  const before={...newGame(0),story:migratedStory(),credits:13e9,runCreditsEarned:13e9,lifetimeCreditsEarned:13e9,lifetimeEligibleCredits:13e9};
  const after=syncStory(before,prestige(before));
  expect(after.story.seen).toContain('first-prestige');expect(after.telemetry.prestigeHistory.at(-1)?.intEarned).toBeGreaterThan(0);
 });
});
