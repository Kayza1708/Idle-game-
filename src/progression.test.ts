import {describe,expect,it} from 'vitest';
import {buyHardwareClass,newGame,researchLabCount,startResearchProject} from './economy';
import {claimAchievement,achievementResearchBonus} from './achievements';
import {buyGemOffer,nativeGemProducts} from './gemShop';
import {claimMission,rollPeriods} from './missions';
import {prestige} from './prestige';
import {advance} from './simulation';
import {restore,serialize} from './storage';

describe('persistent achievements, missions and gem shop',()=>{
 it('counts x10 and max hardware by the actual purchased amount',()=>{let s={...newGame(0),credits:1e9};s=buyHardwareClass(s,'calculator',10);expect(s.lifetime.calculatorsBought).toBe(10);const before=s.hardwareCounts.calculator;s=buyHardwareClass(s,'calculator','max');expect(s.lifetime.calculatorsBought).toBe(s.hardwareCounts.calculator-1);expect(s.hardwareCounts.calculator).toBeGreaterThan(before)});
 it('claims every achievement tier once and applies capped research bonus',()=>{let s={...newGame(0),lifetime:{...newGame(0).lifetime,calculatorsBought:10000}};for(let i=0;i<4;i++)s=claimAchievement(s,'calculators',i);const gems=s.gems;expect(claimAchievement(s,'calculators',3).gems).toBe(gems);expect(s.achievementPoints).toBe(26);expect(achievementResearchBonus({...s,achievementPoints:999})).toBe(.2)});
 it('keeps lifetime counters, achievement points and gems through prestige and reload',()=>{let s={...newGame(0),gems:777,achievementPoints:12,lifetimeEligibleCredits:13e9,lifetime:{...newGame(0).lifetime,hardwareBought:250}};s=prestige(s);expect(s).toMatchObject({gems:777,achievementPoints:12});expect(s.lifetime.hardwareBought).toBe(250);expect(restore(serialize(s)).state.lifetime.hardwareBought).toBe(250)});
 it('rolls UTC daily, weekly and monthly periods and settles completed rewards once',()=>{let s=rollPeriods(newGame(Date.UTC(2026,0,1)),Date.UTC(2026,0,1));const old=s.missions.daily,task=old.tasks[0];s={...s,lifetime:{...s.lifetime,[task.metric]:task.baseline+task.goal}};const after=rollPeriods(s,Date.UTC(2026,0,2));expect(after.gems).toBe(s.gems+task.reward);expect(rollPeriods(after,Date.UTC(2026,0,2)).gems).toBe(after.gems);expect(after.missions.daily.key).toBe('2026-01-02')});
 it('gives new players only currently measurable missions',()=>{const s=rollPeriods(newGame(0),0);expect(s.missions.daily.tasks).toHaveLength(6);expect(s.missions.daily.tasks.some(t=>['researchStarted','researchCompleted','itemsCrafted','prestiges'].includes(t.metric))).toBe(false)});
 it('prevents duplicate claims and insufficient or duplicate gem purchases',()=>{let s=rollPeriods(newGame(0),0),task=s.missions.daily.tasks[0];s={...s,lifetime:{...s.lifetime,[task.metric]:task.baseline+task.goal}};s=claimMission(s,'daily',task.id);const gems=s.gems;expect(claimMission(s,'daily',task.id).gems).toBe(gems);expect(buyGemOffer({...s,gems:59},'training-boost',1).gems).toBe(59);let rich=buyGemOffer({...s,gems:1000},'training-boost',1);expect(buyGemOffer(rich,'training-boost',1)).toBe(rich)});
 it('keeps INT and two purchased gem labs additive up to four',()=>{let s={...newGame(0),gems:5000,nodes:['parallelLab']};s=buyGemOffer(s,'lab-slot-1',1);s=buyGemOffer(s,'lab-slot-2',2);expect(researchLabCount(s)).toBe(4);expect(s.gems).toBe(1400)});
 it('counts parallel offline lab work separately and accelerates projects with lab boost',()=>{let s={...newGame(0),credits:1e6,data:1e6,researchPoints:1e6,nodes:['parallelLab']};s=startResearchProject(s,'operations');s=startResearchProject(s,'blueprints');s=buyGemOffer({...s,gems:100},'lab-boost',1);const next=advance(s,10).state;expect(next.lifetime.labSeconds).toBe(20);expect(next.researchLabs[0]!.endsAt).toBeLessThan(s.researchLabs[0]!.endsAt)});
 it('exposes stable native products without a browser purchase function',()=>{expect(nativeGemProducts.map(p=>p.id)).toEqual(['ai_singularity_gems_120','ai_singularity_gems_650','ai_singularity_gems_1400'])});
});
