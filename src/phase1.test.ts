import {describe,expect,it} from 'vitest';
import {activateOverclock,BALANCE,GameState,buyClassUpgrade,buyHardwareClass,classCompute,hardwareBulkCost,hardwareCost,maxAffordable,milestoneFactor,newGame,newInsight,newINT,canPrestige,hardwareIds,reachedMilestones,prestigeUpgradeCost,creditMultiplierFromINT,registerTap,tapCredits} from './economy';
import {completeExperiment,queueExperiment,splitMaterialReward} from './experiments';
import {prestige} from './prestige';
import {advance} from './simulation';

describe('phase 1 hardware and active play',()=>{
  it('uses exact geometric bulk costs and corrected analytic max purchases',()=>{const s=newGame(0),sum=Array.from({length:10},(_,i)=>hardwareCost('calculator',1+i,s)).reduce((a,b)=>a+b,0);expect(hardwareBulkCost('calculator',1,10,s)).toBeCloseTo(sum,10);const max=maxAffordable('calculator',1,1000,s);expect(hardwareBulkCost('calculator',1,max,s)).toBeLessThanOrEqual(1000+1e-9);expect(hardwareBulkCost('calculator',1,max+1,s)).toBeGreaterThan(1000)});
  it('defines and triggers all 90 class-specific milestones exactly at their thresholds',()=>{for(const id of hardwareIds){const milestones=BALANCE.hardware[id].milestones;expect(milestones.map(m=>m.threshold)).toEqual([10,25,50,100,250,500]);for(const milestone of milestones){expect(reachedMilestones(id,milestone.threshold-1)).not.toContainEqual(milestone);expect(reachedMilestones(id,milestone.threshold)).toContainEqual(milestone);expect(milestone.compute).toBeGreaterThan(0);expect(milestone.label.length).toBeGreaterThan(3)}}});
  it('applies milestone effects to class compute without generic doubling',()=>{for(const id of hardwareIds){expect(milestoneFactor(id,9)).toBe(1);expect(milestoneFactor(id,10)).toBeCloseTo(1.12);expect(milestoneFactor(id,500)).toBeGreaterThan(milestoneFactor(id,250));expect(milestoneFactor(id,500)).not.toBe(64)}});
  it('allows the first prestige as soon as one INT is available',()=>{const eligible=BALANCE.prestigeThreshold*(10**((1/BALANCE.prestigeScale)**(1/BALANCE.prestigePower))-1),state={...newGame(0),lifetimeEligibleCredits:eligible};expect(newINT(state)).toBe(1);expect(canPrestige(state)).toBe(true)});
  it('uses additive permanent INT and fixed depth costs',()=>{const state={...newGame(0),totalINTEarned:12};expect(creditMultiplierFromINT(state)).toBeCloseTo(2.2);expect(prestigeUpgradeCost('dataArchive1',2)).toBe(100);});
  it('unlocks classes and buys a class upgrade only once',()=>{let s={...newGame(0),credits:1e9};s=buyHardwareClass(s,'calculator',9);expect(s.discovered).toContain('sbc');s=buyHardwareClass(s,'calculator',6);const before=classCompute(s,'calculator');s=buyClassUpgrade(s,'calculator');expect(classCompute(s,'calculator')).toBe(before*2);expect(buyClassUpgrade(s,'calculator')).toBe(s)});
  it('tap reward excludes temporary boosts and charges overclock',()=>{let s={...newGame(0),creditBoostUntil:1e9,overclock:{taps:0,charged:false,activeUntil:1e9,cooldownUntil:0}};expect(tapCredits(s,1)).toBe(tapCredits({...s,creditBoostUntil:0,overclock:{...s.overclock,activeUntil:0}},1));for(let i=0;i<BALANCE.overclockTaps;i++)s=registerTap(s,1);expect(s.overclock.charged).toBe(true);s=activateOverclock(s,1);expect(s.overclock.activeUntil).toBe(15001);expect(s.overclock.cooldownUntil).toBe(90001);expect(activateOverclock(s,2)).toBe(s)});
  it('keeps overclock timer through prestige and expires it offline',()=>{let s:GameState={...newGame(0),lifetimeEligibleCredits:13e9,overclock:{taps:0,charged:true,activeUntil:0,cooldownUntil:0}};s=activateOverclock(s,0);s=prestige(s);expect(s.overclock.activeUntil).toBe(15000);const next=advance(s,20).state;expect(next.savedAt).toBe(20000);expect(next.overclock.activeUntil).toBe(15000)});
  it('grants the intro item only once',()=>{let s:GameState={...newGame(0),discovered:['calculator','sbc'],credits:1e9,data:1e9};s=queueExperiment(s,'hardware',0,'intro');s=completeExperiment(s,60000,()=>0);expect(s.inventory).toHaveLength(1);expect(queueExperiment(s,'hardware',60000,'intro')).toBe(s)});
  it.each(['hardware','architecture','artifact'] as const)('makes 24 short %s experiments equal one long material reward',(type:'hardware'|'architecture'|'artifact')=>{const base:GameState={...newGame(0),discovered:['calculator','sbc'],credits:1e9,data:1e9};let short=base;for(let i=0;i<24;i++){const start=i*600000;short=queueExperiment(short,type,start,'short');short=completeExperiment(short,start+600000,()=>1)}let long=queueExperiment(base,type,0,'long');long=completeExperiment(long,14400000,()=>1);expect(short.components).toBe(long.components);expect(short.researchFragments).toBe(long.researchFragments);expect(short.blueprintFragments).toBe(long.blueprintFragments);expect(short.componentRemainder).toBe(long.componentRemainder);expect(short.researchRemainder).toBe(long.researchRemainder);expect(short.blueprintRemainder).toBe(long.blueprintRemainder)});
  it('normalizes only floating-point values within machine precision of an integer',()=>{expect(splitMaterialReward(24*(1/24))).toEqual({whole:1,remainder:0});expect(splitMaterialReward(.999)).toEqual({whole:0,remainder:.999})});
  it('uses cumulative entitlement and cannot claim twice',()=>{let s:GameState={...newGame(0),lifetimeEligibleCredits:13e9};expect(newInsight(s)).toBe(3);s=prestige(s);expect(s.totalINTEarned).toBe(3);expect(s.unspentINT).toBe(3);expect(s.spentINT).toBe(0);expect(newInsight(s)).toBe(0);expect(prestige(s)).toBe(s)});
});

it('finds circuits passively from unlocked hardware online and offline',()=>{
 const base={...newGame(0),discovered:['calculator','sbc'] as import('./economy').HardwareId[]};
 const online=advance(base,1800,true).state;expect(online.componentInventory.circuits).toBe(1);
 const offline=advance(base,1800,false).state;expect(offline.componentInventory.circuits).toBe(1);
});

it('keeps huge economy math finite for costs, bulk buys and credit accumulation',async()=>{
 const {MAX_ECONOMY_VALUE,safeEconomyAdd,safeEconomyMul,canAffordResources,spendResources}=await import('./economy');
 expect(safeEconomyAdd(1e300,1e300)).toBe(MAX_ECONOMY_VALUE);
 expect(safeEconomyMul,canAffordResources,spendResources(1e250,1e100)).toBe(MAX_ECONOMY_VALUE);
 expect(Number.isFinite(hardwareCost('matrioshka',500,newGame(0)))).toBe(true);
 expect(Number.isFinite(hardwareBulkCost('matrioshka',500,500,newGame(0)))).toBe(true);
});

it('uses scientific arithmetic for extreme hardware costs without unsafe counts',async()=>{
 const {hardwareCostScientific,hardwareBulkCostScientific,maxAffordable}=await import('./economy');
 const single=hardwareCostScientific('matrioshka',10_000,newGame(0));
 const bulk=hardwareBulkCostScientific('matrioshka',10_000,500,newGame(0));
 expect(single.exponent).toBeGreaterThan(300);
 expect(bulk.compare(single)).toBeGreaterThan(0);
 expect(single.toNumber()).toBe((await import('./economy')).MAX_ECONOMY_VALUE);
 expect(maxAffordable('calculator',Number.MAX_SAFE_INTEGER,1e300,newGame(0))).toBe(0);
});

describe('scientific-number arithmetic',()=>{
 it('adds, subtracts and serializes values beyond IEEE exponent range without Infinity',async()=>{const {ScientificNumber}=await import('./scientificNumber');const a=ScientificNumber.fromParts(9.5,420),b=ScientificNumber.fromParts(2.5,420),sum=a.add(b),back=ScientificNumber.fromJSON(JSON.parse(JSON.stringify(sum)));expect(sum.toScientificString(3)).toBe('1.20e+421');expect(sum.subtract(b).toScientificString(3)).toBe('9.50e+420');expect(back.compare(sum)).toBe(0);expect(JSON.stringify(sum)).not.toMatch(/Infinity|NaN/)});
 it('keeps tiny additions deterministic at the available significant precision',async()=>{const {ScientificNumber}=await import('./scientificNumber');const huge=ScientificNumber.fromParts(1,400),tiny=ScientificNumber.fromParts(1,1);expect(huge.add(tiny).compare(huge)).toBe(0)});

 it('spends credit and data costs atomically through the shared precision path',()=>{const s={...newGame(0),credits:1000,data:100};expect(canAffordResources(s,{credits:900,data:101})).toBe(false);expect(spendResources(s,{credits:900,data:101})).toBe(s);const paid=spendResources(s,{credits:900,data:40});expect(paid.credits).toBeCloseTo(100);expect(paid.data).toBeCloseTo(60);});
});

it('keeps an authoritative scientific balance beyond the UI number projection',async()=>{const {addCredits,exactEconomyValue}=await import('./economy');let s=newGame(0);for(let i=0;i<4;i++)s=addCredits(s,1e300);expect(Number.isFinite(s.credits)).toBe(true);expect(s.credits).toBe(1e300);expect(exactEconomyValue(s,'credits').toScientificString(3)).toContain('4.00e+300')});
