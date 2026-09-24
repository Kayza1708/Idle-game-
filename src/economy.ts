import { addEvent, addMetrics, newTelemetry, type LocalTelemetry } from './telemetry';
import { newStory, type StoryState } from './story';

/** All tunable alpha balance lives in this file. Domain modules consume these values. */
export const BALANCE = {
  hardware: {
    calculator:{name:'Taschenrechner',description:'Bescheidener Start für die erste lokale KI.',baseCost:10,growth:1.15,compute:1,role:'Tap',milestones:[{threshold:10,compute:0.12,effect:'tap',value:0.03,label:'Tap Impuls'},{threshold:25,compute:0.16,effect:'tap',value:0.06,label:'Tap Kopplung'},{threshold:50,compute:0.22,effect:'tap',value:0.09,label:'Tap Protokoll'},{threshold:100,compute:0.3,effect:'tap',value:0.12,label:'Tap Netz'},{threshold:250,compute:0.42,effect:'tap',value:0.15,label:'Tap Matrix'},{threshold:500,compute:0.6,effect:'tap',value:0.18,label:'Tap Singularität'}]},
    sbc:{name:'Einplatinencomputer',description:'Kompakte Parallelverarbeitung im Miniaturformat.',baseCost:180,growth:1.15,compute:12,role:'Daten',milestones:[{threshold:10,compute:0.12,effect:'data',value:0.035,label:'Daten Impuls'},{threshold:25,compute:0.16,effect:'data',value:0.07,label:'Daten Kopplung'},{threshold:50,compute:0.22,effect:'data',value:0.105,label:'Daten Protokoll'},{threshold:100,compute:0.3,effect:'data',value:0.14,label:'Daten Netz'},{threshold:250,compute:0.42,effect:'data',value:0.175,label:'Daten Matrix'},{threshold:500,compute:0.6,effect:'data',value:0.21,label:'Daten Singularität'}]},
    pc:{name:'Heim-PC',description:'Mehr Kerne für ernsthafte Modelle.',baseCost:2400,growth:1.15,compute:120,role:'Nutzer',milestones:[{threshold:10,compute:0.12,effect:'users',value:0.04,label:'Nutzer Impuls'},{threshold:25,compute:0.16,effect:'users',value:0.08,label:'Nutzer Kopplung'},{threshold:50,compute:0.22,effect:'users',value:0.12,label:'Nutzer Protokoll'},{threshold:100,compute:0.3,effect:'users',value:0.16,label:'Nutzer Netz'},{threshold:250,compute:0.42,effect:'users',value:0.2,label:'Nutzer Matrix'},{threshold:500,compute:0.6,effect:'users',value:0.24,label:'Nutzer Singularität'}]},
    gpu:{name:'Gaming-GPU',description:'Aktive Impulse und parallele Inferenz.',baseCost:32000,growth:1.15,compute:1200,role:'Overclock',milestones:[{threshold:10,compute:0.12,effect:'overclock',value:0.045,label:'Overclock Impuls'},{threshold:25,compute:0.16,effect:'overclock',value:0.09,label:'Overclock Kopplung'},{threshold:50,compute:0.22,effect:'overclock',value:0.135,label:'Overclock Protokoll'},{threshold:100,compute:0.3,effect:'overclock',value:0.18,label:'Overclock Netz'},{threshold:250,compute:0.42,effect:'overclock',value:0.225,label:'Overclock Matrix'},{threshold:500,compute:0.6,effect:'overclock',value:0.27,label:'Overclock Singularität'}]},
    rig:{name:'KI-Workstation',description:'Beschleunigt gewählte Trainingsläufe.',baseCost:450000,growth:1.16,compute:9000,role:'Training',milestones:[{threshold:10,compute:0.12,effect:'training',value:0.05,label:'Training Impuls'},{threshold:25,compute:0.16,effect:'training',value:0.1,label:'Training Kopplung'},{threshold:50,compute:0.22,effect:'training',value:0.15,label:'Training Protokoll'},{threshold:100,compute:0.3,effect:'training',value:0.2,label:'Training Netz'},{threshold:250,compute:0.42,effect:'training',value:0.25,label:'Training Matrix'},{threshold:500,compute:0.6,effect:'training',value:0.3,label:'Training Singularität'}]},
    server:{name:'Server-Rack',description:'Stabile Basis für Automation.',baseCost:6000000,growth:1.16,compute:75000,role:'Automation',milestones:[{threshold:10,compute:0.12,effect:'automation',value:0.055,label:'Automation Impuls'},{threshold:25,compute:0.16,effect:'automation',value:0.11,label:'Automation Kopplung'},{threshold:50,compute:0.22,effect:'automation',value:0.165,label:'Automation Protokoll'},{threshold:100,compute:0.3,effect:'automation',value:0.22,label:'Automation Netz'},{threshold:250,compute:0.42,effect:'automation',value:0.275,label:'Automation Matrix'},{threshold:500,compute:0.6,effect:'automation',value:0.33,label:'Automation Singularität'}]},
    farm:{name:'GPU-Farm',description:'Gebündelte rohe Compute-Produktion.',baseCost:80000000,growth:1.17,compute:650000,role:'Compute',milestones:[{threshold:10,compute:0.12,effect:'compute',value:0.06,label:'Compute Impuls'},{threshold:25,compute:0.16,effect:'compute',value:0.12,label:'Compute Kopplung'},{threshold:50,compute:0.22,effect:'compute',value:0.18,label:'Compute Protokoll'},{threshold:100,compute:0.3,effect:'compute',value:0.24,label:'Compute Netz'},{threshold:250,compute:0.42,effect:'compute',value:0.3,label:'Compute Matrix'},{threshold:500,compute:0.6,effect:'compute',value:0.36,label:'Compute Singularität'}]},
    campus:{name:'Modularer Rechenzentrumscampus',description:'Verbindet frühe Hardwareklassen.',baseCost:1200000000.0,growth:1.17,compute:5000000.0,role:'Synergie',milestones:[{threshold:10,compute:0.12,effect:'synergy',value:0.065,label:'Synergie Impuls'},{threshold:25,compute:0.16,effect:'synergy',value:0.13,label:'Synergie Kopplung'},{threshold:50,compute:0.22,effect:'synergy',value:0.195,label:'Synergie Protokoll'},{threshold:100,compute:0.3,effect:'synergy',value:0.26,label:'Synergie Netz'},{threshold:250,compute:0.42,effect:'synergy',value:0.325,label:'Synergie Matrix'},{threshold:500,compute:0.6,effect:'synergy',value:0.39,label:'Synergie Singularität'}]},
    cloud:{name:'Hyperscale-Cloud',description:'Skaliert die Nutzerkapazität.',baseCost:20000000000.0,growth:1.18,compute:40000000.0,role:'Nutzer',milestones:[{threshold:10,compute:0.12,effect:'users',value:0.07,label:'Nutzer Impuls'},{threshold:25,compute:0.16,effect:'users',value:0.14,label:'Nutzer Kopplung'},{threshold:50,compute:0.22,effect:'users',value:0.21,label:'Nutzer Protokoll'},{threshold:100,compute:0.3,effect:'users',value:0.28,label:'Nutzer Netz'},{threshold:250,compute:0.42,effect:'users',value:0.35,label:'Nutzer Matrix'},{threshold:500,compute:0.6,effect:'users',value:0.42,label:'Nutzer Singularität'}]},
    liquid:{name:'Flüssigkeitsgekühlte Compute-Anlage',description:'Lenkt Compute in Training und Forschung.',baseCost:400000000000.0,growth:1.18,compute:300000000.0,role:'Labor',milestones:[{threshold:10,compute:0.12,effect:'research',value:0.075,label:'Labor Impuls'},{threshold:25,compute:0.16,effect:'research',value:0.15,label:'Labor Kopplung'},{threshold:50,compute:0.22,effect:'research',value:0.225,label:'Labor Protokoll'},{threshold:100,compute:0.3,effect:'research',value:0.3,label:'Labor Netz'},{threshold:250,compute:0.42,effect:'research',value:0.375,label:'Labor Matrix'},{threshold:500,compute:0.6,effect:'research',value:0.45,label:'Labor Singularität'}]},
    subsea:{name:'Untersee-Rechenzentrum',description:'Verbessert spätere Offline-Systeme.',baseCost:8000000000000.0,growth:1.19,compute:2000000000.0,role:'Offline',milestones:[{threshold:10,compute:0.12,effect:'offline',value:0.08,label:'Offline Impuls'},{threshold:25,compute:0.16,effect:'offline',value:0.16,label:'Offline Kopplung'},{threshold:50,compute:0.22,effect:'offline',value:0.24,label:'Offline Protokoll'},{threshold:100,compute:0.3,effect:'offline',value:0.32,label:'Offline Netz'},{threshold:250,compute:0.42,effect:'offline',value:0.4,label:'Offline Matrix'},{threshold:500,compute:0.6,effect:'offline',value:0.48,label:'Offline Singularität'}]},
    orbital:{name:'Orbitales Rechenzentrum',description:'Öffnet Entdeckungsforschung.',baseCost:200000000000000.0,growth:1.19,compute:15000000000.0,role:'Entdeckung',milestones:[{threshold:10,compute:0.12,effect:'research',value:0.085,label:'Entdeckung Impuls'},{threshold:25,compute:0.16,effect:'research',value:0.17,label:'Entdeckung Kopplung'},{threshold:50,compute:0.22,effect:'research',value:0.255,label:'Entdeckung Protokoll'},{threshold:100,compute:0.3,effect:'research',value:0.34,label:'Entdeckung Netz'},{threshold:250,compute:0.42,effect:'research',value:0.425,label:'Entdeckung Matrix'},{threshold:500,compute:0.6,effect:'research',value:0.51,label:'Entdeckung Singularität'}]},
    lunar:{name:'Lunarer KI-Forschungskomplex',description:'Zugang zu späten Forschungszweigen.',baseCost:5000000000000000.0,growth:1.2,compute:100000000000.0,role:'Forschung',milestones:[{threshold:10,compute:0.12,effect:'training',value:0.09,label:'Forschung Impuls'},{threshold:25,compute:0.16,effect:'training',value:0.18,label:'Forschung Kopplung'},{threshold:50,compute:0.22,effect:'training',value:0.27,label:'Forschung Protokoll'},{threshold:100,compute:0.3,effect:'training',value:0.36,label:'Forschung Netz'},{threshold:250,compute:0.42,effect:'training',value:0.45,label:'Forschung Matrix'},{threshold:500,compute:0.6,effect:'training',value:0.54,label:'Forschung Singularität'}]},
    dyson:{name:'Fusionsbetriebener Dyson-Schwarm',description:'Spezialisierte Endgame-Produktion.',baseCost:2e17,growth:1.21,compute:800000000000.0,role:'Energie',milestones:[{threshold:10,compute:0.12,effect:'compute',value:0.095,label:'Energie Impuls'},{threshold:25,compute:0.16,effect:'compute',value:0.19,label:'Energie Kopplung'},{threshold:50,compute:0.22,effect:'compute',value:0.285,label:'Energie Protokoll'},{threshold:100,compute:0.3,effect:'compute',value:0.38,label:'Energie Netz'},{threshold:250,compute:0.42,effect:'compute',value:0.475,label:'Energie Matrix'},{threshold:500,compute:0.6,effect:'compute',value:0.57,label:'Energie Singularität'}]},
    matrioshka:{name:'Matrioshka-Gehirn',description:'Bereitet die spätere Axiom-Ebene vor.',baseCost:1e19,growth:1.22,compute:7000000000000.0,role:'Meta',milestones:[{threshold:10,compute:0.12,effect:'research',value:0.1,label:'Meta Impuls'},{threshold:25,compute:0.16,effect:'research',value:0.2,label:'Meta Kopplung'},{threshold:50,compute:0.22,effect:'research',value:0.3,label:'Meta Protokoll'},{threshold:100,compute:0.3,effect:'research',value:0.4,label:'Meta Netz'},{threshold:250,compute:0.42,effect:'research',value:0.5,label:'Meta Matrix'},{threshold:500,compute:0.6,effect:'research',value:0.6,label:'Meta Singularität'}]},
  },
  operatingProfiles:{balanced:{name:'Ausgewogen',inference:.75,training:.15,research:.10},training:{name:'Training',inference:.60,training:.30,research:.10},discovery:{name:'Entdeckung',inference:.65,training:.10,research:.25}},
  hardwareMilestones:[10,25,50,100,250,500], hardwareUnlockCount:10, classUpgradeCount:15, classUpgradeCostFactor:1,
  computePerUser:1,baseRevenuePerUser:1.35,baseDataPerUser:.08,researchBaseRate:.12,researchComputeScale:10,dataScale:100,
  modelQualityPerLevel:.04,modelEfficiencyPerLevel:.03,qualitySoftcap:1,efficiencySoftcap:.75,tapQualityCoefficient:.04,
  trainingBase: 30, trainingPower:1.25, trainingCreditBase:25, trainingCreditGrowth:1.7,trainingDataBase:2,legacyTrainingBase:40,legacyTrainingGrowth:1.65,
  baseOfflineSeconds:28800,maxOfflineSeconds:86400, simulationStep: 10,
  prestigeThreshold:1_400_000_000,prestigeScale:3,prestigePower:1.5,
  intCreditPerPoint:.10,
  experimentSeconds: 14400, shortExperimentSeconds:600, introExperimentSeconds:60,
  tapRateFraction:.2, tapLimitPerSecond:5, overclockTaps:30, overclockSeconds:15, overclockCooldownSeconds:90,
  introRewards:[25,60,120,100,0,75,250,0],
  prestigeUpgrades:{tapArchive:{name:'Impulsarchiv',baseCost:1,growth:2,maxLevel:5,requires:null,effect:'Taschenrechner-Taps speichern Trainingsdaten'},coldStart:{name:'Warmer Neustart',baseCost:2,growth:2.2,maxLevel:4,requires:'tapArchive',effect:'Zusätzlicher Taschenrechner nach Reset'},labLink:{name:'Labor-Kopplung',baseCost:3,growth:2.25,maxLevel:4,requires:'tapArchive',effect:'Hardware-Meilensteine verstärken Forschung'},autoRoute:{name:'Autonome Beschaffung',baseCost:5,growth:2.4,maxLevel:3,requires:'coldStart',effect:'Autokauf und längere Offline-Zeit'},artifactBus:{name:'Artefakt-Bus',baseCost:8,growth:2.5,maxLevel:3,requires:'labLink',effect:'Items koppeln an Klassenmeilensteine'},researchGate:{name:'Rekursives Labor',baseCost:13,growth:2.6,maxLevel:3,requires:'labLink',effect:'Neue Forschungsroute und Startdaten'}},
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
  gemShop: { components: [70, 60], trainingBoost: [60, 3600], boostCap: 86400 },
  achievementThresholds: [1e4, 1e5, 1e6, 1e7, 1e8, 1e9], achievementGems: 20, achievementPoints: 10,
  dailyMissionRewards: { active: 5, hardware: 5, training: 10, all: 10 }, weeklyMissionReward: 70,
  adLimits: { creditBoost: 8, trainingPulse: 8, components: 12, creditDrop: 12 },
  researchBaseSeconds:180,researchRankGrowth:1.3,researchLabGemCost:125,
  researchProjects:{operations:{name:'Labor-Automation',credits:5000,data:250,points:25,rank:0,effect:'Schaltet Labor-Automation als Forschungsdurchbruch frei.'},blueprints:{name:'Offene Baupläne',credits:25000,data:1000,points:100,rank:8,effect:'Schaltet fortgeschrittene Itemrezepte frei.'},alignment:{name:'Interpretierbare Modelle',credits:150000,data:5000,points:400,rank:20,effect:'Schaltet die Prestige-Option Interpretierbarkeit frei.'}},
} as const;

export type Rarity = keyof typeof BALANCE.rarity;
export type ItemSlot = 'processor' | 'core' | 'research';
export type ItemEffect = 'compute' | 'credits' | 'training' | 'experiment' | 'components';
export type ItemTypeId = 'quantum-chip'|'neural-asic'|'photonic-array'|'memory-crystal'|'logic-seed'|'tensor-core'|'field-scanner'|'lab-drone'|'data-prism';
export type ExperimentId = keyof typeof BALANCE.experimentRewards;
export type BreakthroughId = keyof typeof BALANCE.breakthroughs;
export type PrestigeUpgradeId=keyof typeof BALANCE.prestigeUpgrades;
export type HardwareId=keyof typeof BALANCE.hardware;
export type OperatingProfileId=keyof typeof BALANCE.operatingProfiles;
export type ResearchProjectId=keyof typeof BALANCE.researchProjects;
export type TrainingTrack='quality'|'efficiency';
export type ActiveTraining={track:TrainingTrack;workRequired:number;creditCost:number};
export type ActiveResearch={id:ResearchProjectId;startedAt:number;endsAt:number};
export type Item = { id: string; type: ItemTypeId; rarity: Rarity; level: number; locked: boolean };
export type ExperimentLength='intro'|'short'|'long';
export type Experiment = { id: string; type: ExperimentId; length:ExperimentLength; startedAt: number; endsAt: number };
export type MissionPeriod = { key: string; activeSeconds: number; hardware: number; training: number; days: string[]; claims: string[] };
export type GameState = {
  credits:number;data:number;researchPoints:number;axioms:number;operatingProfile:OperatingProfileId;completedResearch:ResearchProjectId[];researchLabs:(ActiveResearch|null)[];purchasedResearchLabs:number; hardware:number; hardwareCounts:Record<HardwareId,number>; classUpgrades:HardwareId[]; discovered:HardwareId[]; level:number; qualityLevel:number; efficiencyLevel:number; training:number; activeTraining:ActiveTraining|null; savedAt:number; clockOffsetMs:number;
  runCreditsEarned:number; lifetimeCreditsEarned:number; lifetimeEligibleCredits:number; prestigeEntitlementClaimed:number; totalINTEarned:number; unspentINT:number; spentINT:number; prestigeCount:number;
  nodes:string[]; gems:number; welcomeGiftClaimed:boolean; components:number; componentRemainder:number; researchRemainder:number; blueprintRemainder:number; researchFragments:number; blueprintFragments:number;
  breakthroughs:BreakthroughId[]; inventory:Item[]; equipped:Partial<Record<ItemSlot,string>>; pity:{rare:number;epic:number;legendary:number};
  experiments:{active:Experiment|null;queue:ExperimentId[];repeat:ExperimentId|null;completedIds:string[];firstReward:boolean};
  automation:{enabled:boolean;reserve:number;elapsed:number;target:HardwareId|null}; missions:{daily:MissionPeriod;weekly:MissionPeriod;mailbox:{id:string;gems:number}[]};
  achievementClaims:number[]; achievementPoints:number; trainingBoostUntil:number; creditBoostUntil:number; overclock:{taps:number;charged:boolean;activeUntil:number;cooldownUntil:number};
  onboarding:{completed:string[];claimed:string[]}; legacySpecialization:string|null;
  ads:{day:string;counts:Record<string,number>;transactions:string[]}; settings:{effects:boolean;buyMode:1|10|'max'}; testSave:boolean; nextId:number; telemetry:LocalTelemetry;story:StoryState;
};

export const dayKey=(ms:number)=>new Date(ms).toISOString().slice(0,10);
export const weekKey=(ms:number)=>{const d=new Date(ms); const day=(d.getUTCDay()+6)%7; d.setUTCDate(d.getUTCDate()-day); return dayKey(d.getTime())};
const period=(key:string):MissionPeriod=>({key,activeSeconds:0,hardware:0,training:0,days:[],claims:[]});
export const newGame=(now=Date.now(),campaignId='unassigned'):GameState=>({credits:0,data:0,researchPoints:0,axioms:0,operatingProfile:'balanced',completedResearch:[],researchLabs:[null,null,null],purchasedResearchLabs:0,hardware:1,hardwareCounts:{calculator:1,sbc:0,pc:0,gpu:0,rig:0,server:0,farm:0,campus:0,cloud:0,liquid:0,subsea:0,orbital:0,lunar:0,dyson:0,matrioshka:0},classUpgrades:[],discovered:['calculator'],level:0,qualityLevel:0,efficiencyLevel:0,training:0,activeTraining:null,savedAt:now,clockOffsetMs:0,runCreditsEarned:0,lifetimeCreditsEarned:0,lifetimeEligibleCredits:0,prestigeEntitlementClaimed:0,totalINTEarned:0,unspentINT:0,spentINT:0,prestigeCount:0,nodes:[],gems:50,welcomeGiftClaimed:true,components:0,componentRemainder:0,researchRemainder:0,blueprintRemainder:0,researchFragments:0,blueprintFragments:0,breakthroughs:[],inventory:[],equipped:{},pity:{rare:0,epic:0,legendary:0},experiments:{active:null,queue:[],repeat:null,completedIds:[],firstReward:false},automation:{enabled:false,reserve:0,elapsed:0,target:null},missions:{daily:period(dayKey(now)),weekly:period(weekKey(now)),mailbox:[]},achievementClaims:[],achievementPoints:0,trainingBoostUntil:0,creditBoostUntil:0,overclock:{taps:0,charged:false,activeUntil:0,cooldownUntil:0},onboarding:{completed:[],claimed:[]},legacySpecialization:null,ads:{day:dayKey(now),counts:{},transactions:[]},settings:{effects:true,buyMode:1},testSave:false,nextId:1,telemetry:newTelemetry(now,campaignId),story:newStory()});

export const upgradeLevel=(s:GameState,id:PrestigeUpgradeId)=>{const hit=s.nodes.find(x=>x.startsWith(`${id}:`));return hit?Number(hit.split(':')[1])||0:0};
export const hasNode=(s:GameState,b:string,t:number)=>upgradeLevel(s,b as PrestigeUpgradeId)>=t;
export const itemTypes:Record<ItemTypeId,{name:string;slot:ItemSlot;effect:ItemEffect}>={
 'quantum-chip':{name:'Quantenchip',slot:'processor',effect:'compute'},'neural-asic':{name:'Neural-ASIC',slot:'processor',effect:'credits'},'photonic-array':{name:'Photonenfeld',slot:'processor',effect:'training'},
 'memory-crystal':{name:'Speicherkristall',slot:'core',effect:'credits'},'logic-seed':{name:'Logik-Saat',slot:'core',effect:'training'},'tensor-core':{name:'Tensor-Kern',slot:'core',effect:'compute'},
 'field-scanner':{name:'Feldscanner',slot:'research',effect:'experiment'},'lab-drone':{name:'Labordrohne',slot:'research',effect:'components'},'data-prism':{name:'Datenprisma',slot:'research',effect:'credits'}};
export const itemEffect=(i:Item)=>BALANCE.itemBaseEffect*BALANCE.rarity[i.rarity].factor*(1+.1*i.level);
export const equippedBonus=(s:GameState,e:ItemEffect)=>Object.values(s.equipped).map(id=>s.inventory.find(i=>i.id===id)).filter((i):i is Item=>!!i&&itemTypes[i.type].effect===e).reduce((n,i)=>n+itemEffect(i),0)*(1+.1*upgradeLevel(s,'artifactBus'));
export const hardwareIds=Object.keys(BALANCE.hardware) as HardwareId[];
export const reachedMilestones=(id:HardwareId,count:number)=>BALANCE.hardware[id].milestones.filter(m=>count>=m.threshold);
export const milestoneFactor=(id:HardwareId,count:number)=>reachedMilestones(id,count).reduce((factor,m)=>factor*(1+m.compute),1);
export type MilestoneEffect=(typeof BALANCE.hardware)[HardwareId]['milestones'][number]['effect'];
export const milestoneBonus=(s:GameState,effect:MilestoneEffect)=>hardwareIds.reduce((sum,id)=>sum+reachedMilestones(id,s.hardwareCounts[id]).filter(m=>m.effect===effect).reduce((n,m)=>n+m.value,0),0);
export const costModifier=(_s?:GameState)=>1;
export const hardwareCost=(id:HardwareId,owned:number,s?:GameState)=>BALANCE.hardware[id].baseCost*BALANCE.hardware[id].growth**owned*costModifier(s);
export const hardwareBulkCost=(id:HardwareId,owned:number,count:number,s?:GameState)=>{if(!Number.isInteger(count)||count<=0)return 0;const h=BALANCE.hardware[id];return h.baseCost*costModifier(s)*h.growth**owned*(h.growth**count-1)/(h.growth-1)};
export function maxAffordable(id:HardwareId,owned:number,credits:number,s?:GameState){if(credits<hardwareCost(id,owned,s))return 0;const h=BALANCE.hardware[id],start=h.baseCost*costModifier(s)*h.growth**owned;let count=Math.max(0,Math.floor(Math.log1p(credits*(h.growth-1)/start)/Math.log(h.growth)));while(count>0&&hardwareBulkCost(id,owned,count,s)>credits*(1+1e-12))count--;while(hardwareBulkCost(id,owned,count+1,s)<=credits*(1+1e-12))count++;return count;}
export const classCompute=(s:GameState,id:HardwareId,count=s.hardwareCounts[id])=>count*BALANCE.hardware[id].compute*milestoneFactor(id,count)*(s.classUpgrades.includes(id)?2:1);
export const computeRate=(_hardware:number,s?:GameState)=>s?hardwareIds.reduce((sum,id)=>sum+classCompute(s,id),0)*(1+equippedBonus(s,'compute')+milestoneBonus(s,'compute')+milestoneBonus(s,'synergy')):_hardware;
/** Legacy helpers retained for v1 tests/imports and mapped to calculators. */
export const blockCost=(owned:number,s?:GameState)=>hardwareCost('calculator',owned,s);
export const bulkCost=(owned:number,count:number,s?:GameState)=>hardwareBulkCost('calculator',owned,count,s);
export const softcap=(x:number,k:number)=>x<=k?x:k+Math.sqrt(k*(x-k));
export const quality=(level:number)=>1+softcap(BALANCE.modelQualityPerLevel*Math.max(0,level),BALANCE.qualitySoftcap);
export const efficiency=(level:number)=>1+softcap(BALANCE.modelEfficiencyPerLevel*Math.max(0,level),BALANCE.efficiencySoftcap);
export const profileShares=(s:GameState)=>BALANCE.operatingProfiles[s.operatingProfile];
export function computeAllocation(s:GameState){const total=computeRate(s.hardware,s),profile=profileShares(s);return{total,inference:total*profile.inference,training:total*profile.training,research:total*profile.research};}
export const usersRate=(s:GameState)=>computeAllocation(s).inference*efficiency(s.efficiencyLevel)/BALANCE.computePerUser*(1+milestoneBonus(s,'users'));
export const dataRate=(s:GameState)=>usersRate(s)*BALANCE.baseDataPerUser*(1+milestoneBonus(s,'data'));
export const researchRate=(s:GameState)=>{const compute=computeAllocation(s).research;return compute<=0?0:BALANCE.researchBaseRate*(compute/BALANCE.researchComputeScale)**.65*(1+.05*Math.log1p(s.data/BALANCE.dataScale))*(1+milestoneBonus(s,'research'));};
export const creditMultiplierFromINT=(s:GameState)=>1+BALANCE.intCreditPerPoint*s.totalINTEarned;
export const permanentFactor=creditMultiplierFromINT;
export const achievementFactor=(s:GameState)=>1+.02*s.achievementPoints**.7;
export const creditRate=(hardware:number,level:number,s?:GameState,now=0,temporary=true)=>(s?usersRate(s):hardware)*BALANCE.baseRevenuePerUser*quality(s?s.qualityLevel:level)*(s?creditMultiplierFromINT(s)*achievementFactor(s)*(1+(s.breakthroughs.includes('distillation')?.15:0))*(1+equippedBonus(s,'credits'))*(temporary?1+(s.creditBoostUntil>now?1:0)+(s.overclock.activeUntil>now?1:0):1):1);
export function productionBreakdown(s:GameState,now=s.savedAt){const hardware=hardwareIds.map(id=>({id,count:s.hardwareCounts[id],milestone:milestoneFactor(id,s.hardwareCounts[id]),compute:classCompute(s,id)})),rawCompute=hardware.reduce((n,row)=>n+row.compute,0),computeGlobal=rawCompute?computeRate(s.hardware,s)/rawCompute:1,modelQuality=quality(s.qualityLevel),modelEfficiency=efficiency(s.efficiencyLevel),prestige=permanentFactor(s),achievement=achievementFactor(s),creditFamily=1+(s.breakthroughs.includes('distillation')?.15:0),items=1+equippedBonus(s,'credits'),temporary=1+(s.creditBoostUntil>now?1:0)+(s.overclock.activeUntil>now?1:0);return{hardware,rawCompute,computeGlobal,modelQuality,modelEfficiency,prestige,achievement,creditFamily,items,temporary,passive:creditRate(s.hardware,s.level,s,now),tap:tapCredits(s,now)};}
export const trainingRate=(hardware:number,s?:GameState,now=0,temporary=true)=>(s?computeAllocation(s).training:hardware)*(s?(1+(s.breakthroughs.includes('graph')?.2:0)+milestoneBonus(s,'training'))*(1+equippedBonus(s,'training'))*(temporary?1+(s.trainingBoostUntil>now?1:0)+(s.overclock.activeUntil>now?1:0):1):1);
export const trainingGoal=(level:number)=>BALANCE.trainingBase*(level+1)**BALANCE.trainingPower;
export const trainingCost=(s:GameState,track:TrainingTrack)=>BALANCE.trainingCreditBase*BALANCE.trainingCreditGrowth**(s.qualityLevel+s.efficiencyLevel+(track==='quality'?0:0));
export const trainingWork=(s:GameState)=>trainingGoal(s.qualityLevel+s.efficiencyLevel);
export function startTraining(s:GameState,track:TrainingTrack){if(s.activeTraining)return s;const cost=trainingCost(s,track),dataCost=BALANCE.trainingDataBase*(s.level+1);return s.credits<cost||s.data<dataCost?s:{...s,credits:s.credits-cost,data:s.data-dataCost,training:0,activeTraining:{track,creditCost:cost,workRequired:trainingWork(s)}};}
export const prestigeClaim=(s:GameState)=>Math.floor(BALANCE.prestigeScale*Math.max(0,Math.log10(1+s.lifetimeEligibleCredits/BALANCE.prestigeThreshold))**BALANCE.prestigePower+1e-12);
export const newINT=(s:GameState)=>Math.max(0,prestigeClaim(s)-s.prestigeEntitlementClaimed);
export const newInsight=newINT;
export const canPrestige=(s:GameState)=>newINT(s)>=1;
export const nextPrestigeThreshold=(s:GameState)=>BALANCE.prestigeThreshold*(10**(((prestigeClaim(s)+1)/BALANCE.prestigeScale)**(1/BALANCE.prestigePower))-1);
export const prestigeUpgradeCost=(id:PrestigeUpgradeId,level:number)=>Math.ceil(BALANCE.prestigeUpgrades[id].baseCost*BALANCE.prestigeUpgrades[id].growth**level);
export function selectOperatingProfile(s:GameState,id:OperatingProfileId){return BALANCE.operatingProfiles[id]?{...s,operatingProfile:id}:s;}
export const researchDuration=(id:ResearchProjectId)=>Math.round(BALANCE.researchBaseSeconds*BALANCE.researchRankGrowth**BALANCE.researchProjects[id].rank);
export const researchLabCount=(s:GameState)=>Math.min(3,1+(upgradeLevel(s,'labLink')>=1?1:0)+s.purchasedResearchLabs);
export function startResearchProject(s:GameState,id:ResearchProjectId){const p=BALANCE.researchProjects[id],slot=s.researchLabs.findIndex((x,i)=>i<researchLabCount(s)&&x===null);if(!p||slot<0||s.completedResearch.includes(id)||s.researchLabs.some(x=>x?.id===id)||s.credits<p.credits||s.data<p.data||s.researchPoints<p.points)return s;const labs=[...s.researchLabs],duration=researchDuration(id);labs[slot]={id,startedAt:s.savedAt,endsAt:s.savedAt+duration*1000};return {...s,credits:s.credits-p.credits,data:s.data-p.data,researchPoints:s.researchPoints-p.points,researchLabs:labs};}
export const buyResearchProject=startResearchProject;
export function buyResearchLab(s:GameState){if(s.purchasedResearchLabs>=1||s.gems<BALANCE.researchLabGemCost)return s;return{...s,gems:s.gems-BALANCE.researchLabGemCost,purchasedResearchLabs:s.purchasedResearchLabs+1};}
export function buyHardwareClass(s:GameState,id:HardwareId,count:number|'max'=1){
 if(!s.discovered.includes(id))return s;const owned=s.hardwareCounts[id],amount=count==='max'?maxAffordable(id,owned,s.credits,s):count,cost=hardwareBulkCost(id,owned,amount,s);if(amount<1||s.credits+1e-9<cost)return s;
 const counts={...s.hardwareCounts,[id]:owned+amount},index=hardwareIds.indexOf(id),nextId=hardwareIds[index+1],discovered=nextId&&counts[id]>=BALANCE.hardwareUnlockCount&&!s.discovered.includes(nextId)?[...s.discovered,nextId]:s.discovered,completed=[...s.onboarding.completed];for(const event of ['first-buy',...(counts.calculator>=10?['ten-calculators']:[]),...(discovered.includes('sbc')?['discover-sbc']:[])])if(!completed.includes(event))completed.push(event);
 let next:GameState={...s,credits:Math.max(0,s.credits-cost),hardware:Object.values(counts).reduce((a,b)=>a+b,0),hardwareCounts:counts,discovered,onboarding:{...s.onboarding,completed},missions:{...s.missions,daily:{...s.missions.daily,hardware:s.missions.daily.hardware+amount}}};
 next=addEvent(next,'hardware-purchase',s.savedAt,{id,amount,cost,ownedAfter:counts[id]});
 for(const milestone of BALANCE.hardware[id].milestones)if(owned<milestone.threshold&&counts[id]>=milestone.threshold)next=addEvent(next,'hardware-milestone',s.savedAt,{id,threshold:milestone.threshold,label:milestone.label},true);
 return next;
}
export function buyHardware(s:GameState,count=1){return buyHardwareClass(s,'calculator',count)}
export const classUpgradeCost=(id:HardwareId,s:GameState)=>hardwareCost(id,BALANCE.classUpgradeCount,s)*BALANCE.classUpgradeCostFactor;
export function buyClassUpgrade(s:GameState,id:HardwareId){const cost=classUpgradeCost(id,s);return s.hardwareCounts[id]<BALANCE.classUpgradeCount||s.classUpgrades.includes(id)||s.credits<cost?s:addEvent({...s,credits:s.credits-cost,classUpgrades:[...s.classUpgrades,id],onboarding:{...s.onboarding,completed:[...new Set([...s.onboarding.completed,'class-upgrade'])]}},'hardware-purchase',s.savedAt,{id,amount:0,cost,classUpgrade:true});}
export function addCredits(s:GameState,value:number,eligible=true){return {...s,credits:s.credits+value,runCreditsEarned:s.runCreditsEarned+(eligible?value:0),lifetimeCreditsEarned:s.lifetimeCreditsEarned+(eligible?value:0),lifetimeEligibleCredits:s.lifetimeEligibleCredits+(eligible?value:0)};}
export const tapCredits=(s:GameState,now=s.savedAt)=>Math.max(1,BALANCE.tapRateFraction*creditRate(s.hardware,s.level,s,now,false)*(1+BALANCE.tapQualityCoefficient*softcap(s.qualityLevel,25)+milestoneBonus(s,'tap')));
export function registerTap(s:GameState,now:number){const reward=tapCredits(s,now),canCharge=now>=s.overclock.cooldownUntil&&!s.overclock.charged,taps=canCharge?Math.min(BALANCE.overclockTaps,s.overclock.taps+1):s.overclock.taps,storedData=upgradeLevel(s,'tapArchive')*.02*milestoneBonus(s,'tap');return addMetrics(addCredits({...s,data:s.data+storedData,overclock:{...s.overclock,taps,charged:taps>=BALANCE.overclockTaps}},reward,true),now,{taps:1,tap:reward});}
export function activateOverclock(s:GameState,now:number){const duration=BALANCE.overclockSeconds*(1+milestoneBonus(s,'overclock'));return !s.overclock.charged||now<s.overclock.cooldownUntil?s:{...s,overclock:{taps:0,charged:false,activeUntil:now+duration*1000,cooldownUntil:now+BALANCE.overclockCooldownSeconds*1000}};}
