/** All tunable alpha balance lives in this file. Domain modules consume these values. */
export const BALANCE = {
  hardware: {
    calculator:{name:'Taschenrechner',description:'Bescheidener Start für die erste lokale KI.',baseCost:10,growth:1.15,compute:1},
    sbc:{name:'Einplatinencomputer',description:'Kompakte Parallelverarbeitung im Miniaturformat.',baseCost:180,growth:1.15,compute:12},
    pc:{name:'Heim-PC',description:'Mehr Kerne für ernsthafte Modelle.',baseCost:2400,growth:1.15,compute:120},
    gpu:{name:'Gaming-GPU',description:'Massiv paralleles Training.',baseCost:32000,growth:1.15,compute:1200},
    rig:{name:'GPU-Rig',description:'Ein ganzes Rack aus Beschleunigern.',baseCost:450000,growth:1.15,compute:12000},
  },
  futureHardwareCatalog:['KI-Workstation','Server-Rack','GPU-Cluster','Hyperscale-Rechenzentrum','Photonik-Cluster','Quantenbeschleuniger','Autonome KI-Fabrik','Untersee-Rechenzentrum','Orbitales Rechenzentrum','Dyson-Rechenschwarm'],
  hardwareMilestones:[10,25,50], hardwareMilestoneFactors:[1.5,1.5,1.75], hardwareUnlockCount:10, classUpgradeCount:15, classUpgradeCostFactor:1,
  creditPerCompute: 1, modelCoefficient:.08, tapQualityCoefficient:.04,
  trainingPerCompute: .12, trainingBase: 30, trainingGrowth: 1.55, trainingCreditBase:25, trainingCreditGrowth:1.7, legacyTrainingBase:40, legacyTrainingGrowth:1.65,
  maxOfflineSeconds: 86400, simulationStep: 10,
  prestigeBase: 13_000_000_000, prestigeScale: 3, prestigePower: .45,
  insightBase: .35, insightPower: .7,
  experimentSeconds: 14400, shortExperimentSeconds:600, introExperimentSeconds:60,
  tapRateFraction:.2, tapLimitPerSecond:5, overclockTaps:30, overclockSeconds:15, overclockCooldownSeconds:90,
  introRewards:[25,60,120,100,0,75,250,0],
  specialization:{assistantCredit:.25,codingCost:.9,codingTraining:.1,researchSpeed:.25,researchTraining:.1},
  upgradeBase: 60, upgradeGrowth: 1.35, maxUpgrade: 10,
  itemBaseEffect: .05,
  rarity: {
    common: { chance: .60, factor: 1, salvage: 10, craft: [30, 0] },
    uncommon: { chance: .25, factor: 1.15, salvage: 15, craft: [60, 2] },
    rare: { chance: .10, factor: 1.35, salvage: 25, craft: [120, 10] },
    epic: { chance: .04, factor: 1.65, salvage: 40, craft: [360, 30] },
    legendary: { chance: .01, factor: 2, salvage: 60, craft: [1080, 90] },
  },
  experimentRewards: {
    hardware: { components: 45, blueprints: 1, research: 0, itemChance: 0 },
    architecture: { components: 20, blueprints: 0, research: 2, itemChance: 0 },
    artifact: { components: 20, blueprints: 2, research: 0, itemChance: .2 },
  },
  breakthroughs: { distillation: [10, .15], graph: [20, .20], planning: [30, .20] },
  prestigeNodeCosts: [1, 3, 10],
  gemShop: { components: [70, 60], trainingBoost: [60, 3600], boostCap: 86400 },
  achievementThresholds: [1e4, 1e5, 1e6, 1e7, 1e8, 1e9], achievementGems: 20, achievementPoints: 10,
  dailyMissionRewards: { active: 5, hardware: 5, training: 10, all: 10 }, weeklyMissionReward: 70,
  adLimits: { creditBoost: 8, trainingPulse: 8, components: 12, creditDrop: 12 },
} as const;

export type Rarity = keyof typeof BALANCE.rarity;
export type ItemSlot = 'processor' | 'core' | 'research';
export type ItemEffect = 'compute' | 'credits' | 'training' | 'experiment' | 'components';
export type ItemTypeId = 'quantum-chip'|'neural-asic'|'photonic-array'|'memory-crystal'|'logic-seed'|'tensor-core'|'field-scanner'|'lab-drone'|'data-prism';
export type ExperimentId = keyof typeof BALANCE.experimentRewards;
export type BreakthroughId = keyof typeof BALANCE.breakthroughs;
export type PrestigeBranch = 'infrastructure'|'models'|'research'|'automation'|'artifacts'|'recursion';
export type HardwareId=keyof typeof BALANCE.hardware;
export type Specialization='assistant'|'coding'|'research'|null;
export type TrainingTrack='quality'|'efficiency';
export type ActiveTraining={track:TrainingTrack;workRequired:number;creditCost:number};
export type Item = { id: string; type: ItemTypeId; rarity: Rarity; level: number; locked: boolean };
export type ExperimentLength='intro'|'short'|'long';
export type Experiment = { id: string; type: ExperimentId; length:ExperimentLength; startedAt: number; endsAt: number };
export type MissionPeriod = { key: string; activeSeconds: number; hardware: number; training: number; days: string[]; claims: string[] };
export type GameState = {
  credits:number; hardware:number; hardwareCounts:Record<HardwareId,number>; classUpgrades:HardwareId[]; discovered:HardwareId[]; level:number; qualityLevel:number; efficiencyLevel:number; training:number; activeTraining:ActiveTraining|null; savedAt:number; clockOffsetMs:number;
  runCreditsEarned:number; lifetimeCreditsEarned:number; lifetimeEligibleCredits:number; prestigeEntitlementClaimed:number; totalInsightEarned:number; unspentInsight:number; prestigeCount:number;
  nodes:string[]; gems:number; welcomeGiftClaimed:boolean; components:number; componentRemainder:number; researchRemainder:number; blueprintRemainder:number; researchFragments:number; blueprintFragments:number;
  breakthroughs:BreakthroughId[]; inventory:Item[]; equipped:Partial<Record<ItemSlot,string>>; pity:{rare:number;epic:number;legendary:number};
  experiments:{active:Experiment|null;queue:ExperimentId[];repeat:ExperimentId|null;completedIds:string[];firstReward:boolean};
  automation:{enabled:boolean;reserve:number;elapsed:number;target:HardwareId|null}; missions:{daily:MissionPeriod;weekly:MissionPeriod;mailbox:{id:string;gems:number}[]};
  achievementClaims:number[]; achievementPoints:number; trainingBoostUntil:number; creditBoostUntil:number; overclock:{taps:number;charged:boolean;activeUntil:number;cooldownUntil:number};
  onboarding:{completed:string[];claimed:string[]}; specialization:Specialization;
  ads:{day:string;counts:Record<string,number>;transactions:string[]}; settings:{effects:boolean;buyMode:1|10|'max'}; testSave:boolean; nextId:number;
};

export const dayKey=(ms:number)=>new Date(ms).toISOString().slice(0,10);
export const weekKey=(ms:number)=>{const d=new Date(ms); const day=(d.getUTCDay()+6)%7; d.setUTCDate(d.getUTCDate()-day); return dayKey(d.getTime())};
const period=(key:string):MissionPeriod=>({key,activeSeconds:0,hardware:0,training:0,days:[],claims:[]});
export const newGame=(now=Date.now()):GameState=>({credits:0,hardware:1,hardwareCounts:{calculator:1,sbc:0,pc:0,gpu:0,rig:0},classUpgrades:[],discovered:['calculator'],level:0,qualityLevel:0,efficiencyLevel:0,training:0,activeTraining:null,savedAt:now,clockOffsetMs:0,runCreditsEarned:0,lifetimeCreditsEarned:0,lifetimeEligibleCredits:0,prestigeEntitlementClaimed:0,totalInsightEarned:0,unspentInsight:0,prestigeCount:0,nodes:[],gems:50,welcomeGiftClaimed:true,components:0,componentRemainder:0,researchRemainder:0,blueprintRemainder:0,researchFragments:0,blueprintFragments:0,breakthroughs:[],inventory:[],equipped:{},pity:{rare:0,epic:0,legendary:0},experiments:{active:null,queue:[],repeat:null,completedIds:[],firstReward:false},automation:{enabled:false,reserve:0,elapsed:0,target:null},missions:{daily:period(dayKey(now)),weekly:period(weekKey(now)),mailbox:[]},achievementClaims:[],achievementPoints:0,trainingBoostUntil:0,creditBoostUntil:0,overclock:{taps:0,charged:false,activeUntil:0,cooldownUntil:0},onboarding:{completed:[],claimed:[]},specialization:null,ads:{day:dayKey(now),counts:{},transactions:[]},settings:{effects:true,buyMode:1},testSave:false,nextId:1});

export const hasNode=(s:GameState,b:PrestigeBranch,t:number)=>s.nodes.includes(`${b}-${t}`);
export const itemTypes:Record<ItemTypeId,{name:string;slot:ItemSlot;effect:ItemEffect}>={
 'quantum-chip':{name:'Quantenchip',slot:'processor',effect:'compute'},'neural-asic':{name:'Neural-ASIC',slot:'processor',effect:'credits'},'photonic-array':{name:'Photonenfeld',slot:'processor',effect:'training'},
 'memory-crystal':{name:'Speicherkristall',slot:'core',effect:'credits'},'logic-seed':{name:'Logik-Saat',slot:'core',effect:'training'},'tensor-core':{name:'Tensor-Kern',slot:'core',effect:'compute'},
 'field-scanner':{name:'Feldscanner',slot:'research',effect:'experiment'},'lab-drone':{name:'Labordrohne',slot:'research',effect:'components'},'data-prism':{name:'Datenprisma',slot:'research',effect:'credits'}};
export const itemEffect=(i:Item)=>BALANCE.itemBaseEffect*BALANCE.rarity[i.rarity].factor*(1+.1*i.level);
export const equippedBonus=(s:GameState,e:ItemEffect)=>Object.values(s.equipped).map(id=>s.inventory.find(i=>i.id===id)).filter((i):i is Item=>!!i&&itemTypes[i.type].effect===e).reduce((n,i)=>n+itemEffect(i),0)*(hasNode(s,'artifacts',3)?1.2:1);
export const hardwareIds=Object.keys(BALANCE.hardware) as HardwareId[];
export const milestoneFactor=(count:number)=>BALANCE.hardwareMilestones.reduce((factor,milestone,index)=>count>=milestone?factor*BALANCE.hardwareMilestoneFactors[index]:factor,1);
export const costModifier=(s?:GameState)=>s?((hasNode(s,'infrastructure',2)?.95:1)*(s.specialization==='coding'?BALANCE.specialization.codingCost:1)):1;
export const hardwareCost=(id:HardwareId,owned:number,s?:GameState)=>BALANCE.hardware[id].baseCost*BALANCE.hardware[id].growth**owned*costModifier(s);
export const hardwareBulkCost=(id:HardwareId,owned:number,count:number,s?:GameState)=>{if(!Number.isInteger(count)||count<=0)return 0;const h=BALANCE.hardware[id];return h.baseCost*costModifier(s)*h.growth**owned*(h.growth**count-1)/(h.growth-1)};
export function maxAffordable(id:HardwareId,owned:number,credits:number,s?:GameState){if(credits<hardwareCost(id,owned,s))return 0;const h=BALANCE.hardware[id],start=h.baseCost*costModifier(s)*h.growth**owned;let count=Math.max(0,Math.floor(Math.log1p(credits*(h.growth-1)/start)/Math.log(h.growth)));while(count>0&&hardwareBulkCost(id,owned,count,s)>credits*(1+1e-12))count--;while(hardwareBulkCost(id,owned,count+1,s)<=credits*(1+1e-12))count++;return count;}
export const classCompute=(s:GameState,id:HardwareId,count=s.hardwareCounts[id])=>count*BALANCE.hardware[id].compute*milestoneFactor(count)*(s.classUpgrades.includes(id)?2:1);
export const computeRate=(_hardware:number,s?:GameState)=>s?hardwareIds.reduce((sum,id)=>sum+classCompute(s,id),0)*(1+(hasNode(s,'infrastructure',1)?.1:0)+(hasNode(s,'infrastructure',3)?.2:0))*(1+equippedBonus(s,'compute')):_hardware;
/** Legacy helpers retained for v1 tests/imports and mapped to calculators. */
export const blockCost=(owned:number,s?:GameState)=>hardwareCost('calculator',owned,s);
export const bulkCost=(owned:number,count:number,s?:GameState)=>hardwareBulkCost('calculator',owned,count,s);
export const quality=(level:number)=>1+BALANCE.modelCoefficient*Math.sqrt(Math.max(0,level));
export const efficiency=(level:number)=>1+BALANCE.modelCoefficient*Math.sqrt(Math.max(0,level));
export const permanentFactor=(s:GameState)=>1+BALANCE.insightBase*s.totalInsightEarned**BALANCE.insightPower;
export const achievementFactor=(s:GameState)=>1+.02*s.achievementPoints**.7;
export const creditRate=(hardware:number,level:number,s?:GameState,now=0,temporary=true)=>computeRate(hardware,s)*BALANCE.creditPerCompute*quality(s?s.qualityLevel:level)*efficiency(s?s.efficiencyLevel:level)*(s?permanentFactor(s)*achievementFactor(s)*(1+(hasNode(s,'models',2)?.1:0)+(s.breakthroughs.includes('distillation')?.15:0)+(s.specialization==='assistant'?BALANCE.specialization.assistantCredit:0))*(1+equippedBonus(s,'credits'))*(temporary?1+(s.creditBoostUntil>now?1:0)+(s.overclock.activeUntil>now?1:0):1):1);
export function productionBreakdown(s:GameState,now=s.savedAt){const hardware=hardwareIds.map(id=>({id,count:s.hardwareCounts[id],milestone:milestoneFactor(s.hardwareCounts[id]),compute:classCompute(s,id)})),rawCompute=hardware.reduce((n,row)=>n+row.compute,0),computeGlobal=rawCompute?computeRate(s.hardware,s)/rawCompute:1,modelQuality=quality(s.qualityLevel),modelEfficiency=efficiency(s.efficiencyLevel),prestige=permanentFactor(s),achievement=achievementFactor(s),creditFamily=1+(hasNode(s,'models',2)?.1:0)+(s.breakthroughs.includes('distillation')?.15:0)+(s.specialization==='assistant'?BALANCE.specialization.assistantCredit:0),items=1+equippedBonus(s,'credits'),temporary=1+(s.creditBoostUntil>now?1:0)+(s.overclock.activeUntil>now?1:0);return{hardware,rawCompute,computeGlobal,modelQuality,modelEfficiency,prestige,achievement,creditFamily,items,temporary,passive:creditRate(s.hardware,s.level,s,now),tap:tapCredits(s,now)};}
export const trainingRate=(hardware:number,s?:GameState,now=0,temporary=true)=>computeRate(hardware,s)*BALANCE.trainingPerCompute*(s?permanentFactor(s)*(1+(hasNode(s,'models',1)?.1:0)+(hasNode(s,'models',3)?.2:0)+(s.breakthroughs.includes('graph')?.2:0)+((s.specialization==='coding'||s.specialization==='research')?BALANCE.specialization.codingTraining:0))*(1+equippedBonus(s,'training'))*(temporary?1+(s.trainingBoostUntil>now?1:0)+(s.overclock.activeUntil>now?1:0):1):1);
export const trainingGoal=(level:number)=>BALANCE.trainingBase*BALANCE.trainingGrowth**level;
export const trainingCost=(s:GameState,track:TrainingTrack)=>BALANCE.trainingCreditBase*BALANCE.trainingCreditGrowth**(s.qualityLevel+s.efficiencyLevel+(track==='quality'?0:0));
export const trainingWork=(s:GameState)=>trainingGoal(s.qualityLevel+s.efficiencyLevel);
export function startTraining(s:GameState,track:TrainingTrack){if(s.activeTraining)return s;const cost=trainingCost(s,track);return s.credits<cost?s:{...s,credits:s.credits-cost,training:0,activeTraining:{track,creditCost:cost,workRequired:trainingWork(s)}};}
export const prestigeClaim=(s:GameState)=>Math.floor(BALANCE.prestigeScale*(s.lifetimeEligibleCredits/BALANCE.prestigeBase)**BALANCE.prestigePower);
export const newInsight=(s:GameState)=>Math.max(0,prestigeClaim(s)-s.prestigeEntitlementClaimed);
export const canPrestige=(s:GameState)=>newInsight(s)>=(s.prestigeCount?1:3);
export const nextPrestigeThreshold=(s:GameState)=>BALANCE.prestigeBase*((s.prestigeEntitlementClaimed+1)/BALANCE.prestigeScale)**(1/BALANCE.prestigePower);
export function buyHardwareClass(s:GameState,id:HardwareId,count:number|'max'=1){if(!s.discovered.includes(id))return s;const owned=s.hardwareCounts[id],amount=count==='max'?maxAffordable(id,owned,s.credits,s):count,cost=hardwareBulkCost(id,owned,amount,s);if(amount<1||s.credits+1e-9<cost)return s;const counts={...s.hardwareCounts,[id]:owned+amount},index=hardwareIds.indexOf(id),next=hardwareIds[index+1],discovered=next&&counts[id]>=BALANCE.hardwareUnlockCount&&!s.discovered.includes(next)?[...s.discovered,next]:s.discovered,completed=[...s.onboarding.completed];for(const event of ['first-buy',...(counts.calculator>=10?['ten-calculators']:[]),...(discovered.includes('sbc')?['discover-sbc']:[])])if(!completed.includes(event))completed.push(event);return{...s,credits:Math.max(0,s.credits-cost),hardware:Object.values(counts).reduce((a,b)=>a+b,0),hardwareCounts:counts,discovered,onboarding:{...s.onboarding,completed},missions:{...s.missions,daily:{...s.missions.daily,hardware:s.missions.daily.hardware+amount}}};}
export function buyHardware(s:GameState,count=1){return buyHardwareClass(s,'calculator',count)}
export const classUpgradeCost=(id:HardwareId,s:GameState)=>hardwareCost(id,BALANCE.classUpgradeCount,s)*BALANCE.classUpgradeCostFactor;
export function buyClassUpgrade(s:GameState,id:HardwareId){const cost=classUpgradeCost(id,s);return s.hardwareCounts[id]<BALANCE.classUpgradeCount||s.classUpgrades.includes(id)||s.credits<cost?s:{...s,credits:s.credits-cost,classUpgrades:[...s.classUpgrades,id],onboarding:{...s.onboarding,completed:[...new Set([...s.onboarding.completed,'class-upgrade'])]}};}
export function addCredits(s:GameState,value:number,eligible=true){return {...s,credits:s.credits+value,runCreditsEarned:s.runCreditsEarned+(eligible?value:0),lifetimeCreditsEarned:s.lifetimeCreditsEarned+(eligible?value:0),lifetimeEligibleCredits:s.lifetimeEligibleCredits+(eligible?value:0)};}
export const tapCredits=(s:GameState,now=s.savedAt)=>Math.max(1,BALANCE.tapRateFraction*creditRate(s.hardware,s.level,s,now,false)*(1+BALANCE.tapQualityCoefficient*Math.sqrt(s.qualityLevel)));
export function registerTap(s:GameState,now:number){const reward=tapCredits(s,now),canCharge=now>=s.overclock.cooldownUntil&&!s.overclock.charged,taps=canCharge?Math.min(BALANCE.overclockTaps,s.overclock.taps+1):s.overclock.taps;return addCredits({...s,overclock:{...s.overclock,taps,charged:taps>=BALANCE.overclockTaps}},reward,true);}
export function activateOverclock(s:GameState,now:number){return !s.overclock.charged||now<s.overclock.cooldownUntil?s:{...s,overclock:{taps:0,charged:false,activeUntil:now+BALANCE.overclockSeconds*1000,cooldownUntil:now+BALANCE.overclockCooldownSeconds*1000}};}
