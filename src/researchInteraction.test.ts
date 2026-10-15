import {advanceTo} from './simulation';
import {describe,it,expect} from 'vitest';
import {newGame,addData,startResearchProject,exactEconomyValue} from './economy';
import {researchActionQuote,requestResearchProject} from './researchInteraction';
import {serialize,restore} from './storage';
const ready=()=>{const s=addData(newGame(0,'manual-queue'),1e12);return {...s,nodes:['labs1','labs2','computeNet1'] as typeof s.nodes,discovered:['calculator','sbc'] as typeof s.discovered,researchLevels:{...s.researchLevels,dataGeneration:1},intro:{...s.intro,researchUsed:true}}};
const full=()=>{const n=startResearchProject(startResearchProject(ready(),'dataGeneration'),'modelArchitecture');return n};
describe('one manual research action',()=>{
 it('starts immediately in a free lab and charges exactly once',()=>{const s=ready(),n=requestResearchProject(s,'dataGeneration');expect(n.researchQueue).toEqual([]);expect(n.researchLabs[0]?.id).toBe('dataGeneration');expect(exactEconomyValue(n,'data').compare(exactEconomyValue(s,'data'))).toBe(-1);expect(requestResearchProject(n,'dataGeneration')).toBe(n)});
 it('queues when labs are full without charging; rejects duplicate taps',()=>{const s=full(),q=researchActionQuote(s,'blueprints'),n=requestResearchProject(s,'blueprints');expect(q).toMatchObject({allowed:true,mode:'queue'});expect(n.researchQueue).toEqual(['blueprints']);expect(exactEconomyValue(n,'data').toJSON()).toEqual(exactEconomyValue(s,'data').toJSON());expect(requestResearchProject(n,'blueprints')).toBe(n)});
 it('retains the queue on reload and starts only once when a lab frees',()=>{const s=requestResearchProject(full(),'blueprints'),reloaded=restore(serialize(s),s.savedAt).state,end=Math.min(...reloaded.researchLabs.filter(Boolean).map(l=>l!.endsAt));const n=advanceTo(reloaded,end+1000,false,()=>.5).state;expect(n.researchQueue).toEqual([]);expect(n.researchLabs.filter(l=>l?.id==='blueprints')).toHaveLength(1);expect(n.lifetime.researchStarted).toBe(3)});
 it('respects locked queues and unavailable research',()=>{const s={...full(),nodes:[] as ReturnType<typeof ready>['nodes']};expect(researchActionQuote(s,'blueprints')).toMatchObject({allowed:false,reason:'locked'});expect(requestResearchProject(s,'blueprints')).toBe(s);expect(requestResearchProject(ready(),'distributedInference')).toEqual(ready())});
});
