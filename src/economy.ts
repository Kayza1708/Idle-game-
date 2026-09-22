/** All tunable alpha balance lives in this file. Domain modules consume these values. */
export const BALANCE = {
  blockBaseCost: 25, blockGrowth: 1.18, computePerBlock: 10, tierSize: 25,
  creditPerCompute: .1, qualityGrowth: 1.08, efficiencyGrowth: 1.04,
  trainingPerCompute: .05, trainingBase: 300, trainingGrowth: 1.8,
  maxOfflineSeconds: 86400, simulationStep: 10,
  prestigeBase: 1_000_000, prestigeScale: 3, prestigePower: .45,
  insightBase: .35, insightPower: .7,
  experimentSeconds: 14400,
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
export type Item = { id: string; type: ItemTypeId; rarity: Rarity; level: number; locked: boolean };
export type Experiment = { id: string; type: ExperimentId; startedAt: number; endsAt: number };
export type MissionPeriod = { key: string; activeSeconds: number; hardware: number; training: number; days: string[]; claims: string[] };
export type GameState = {
  credits:number; hardware:number; level:number; training:number; savedAt:number;
  runCreditsEarned:number; lifetimeCreditsEarned:number; totalInsightEarned:number; unspentInsight:number; prestigeCount:number;
  nodes:string[]; gems:number; welcomeGiftClaimed:boolean; components:number; componentRemainder:number; researchFragments:number; blueprintFragments:number;
  breakthroughs:BreakthroughId[]; inventory:Item[]; equipped:Partial<Record<ItemSlot,string>>; pity:{rare:number;epic:number;legendary:number};
  experiments:{active:Experiment|null;queue:ExperimentId[];repeat:ExperimentId|null;completedIds:string[];firstReward:boolean};
  automation:{enabled:boolean;reserve:number;elapsed:number}; missions:{daily:MissionPeriod;weekly:MissionPeriod;mailbox:{id:string;gems:number}[]};
  achievementClaims:number[]; achievementPoints:number; trainingBoostUntil:number; creditBoostUntil:number;
  ads:{day:string;counts:Record<string,number>;transactions:string[]}; settings:{effects:boolean}; testSave:boolean; nextId:number;
};

export const dayKey=(ms:number)=>new Date(ms).toISOString().slice(0,10);
export const weekKey=(ms:number)=>{const d=new Date(ms); const day=(d.getUTCDay()+6)%7; d.setUTCDate(d.getUTCDate()-day); return dayKey(d.getTime())};
const period=(key:string):MissionPeriod=>({key,activeSeconds:0,hardware:0,training:0,days:[],claims:[]});
export const newGame=(now=Date.now()):GameState=>({credits:0,hardware:1,level:0,training:0,savedAt:now,runCreditsEarned:0,lifetimeCreditsEarned:0,totalInsightEarned:0,unspentInsight:0,prestigeCount:0,nodes:[],gems:50,welcomeGiftClaimed:true,components:0,componentRemainder:0,researchFragments:0,blueprintFragments:0,breakthroughs:[],inventory:[],equipped:{},pity:{rare:0,epic:0,legendary:0},experiments:{active:null,queue:[],repeat:null,completedIds:[],firstReward:false},automation:{enabled:false,reserve:0,elapsed:0},missions:{daily:period(dayKey(now)),weekly:period(weekKey(now)),mailbox:[]},achievementClaims:[],achievementPoints:0,trainingBoostUntil:0,creditBoostUntil:0,ads:{day:dayKey(now),counts:{},transactions:[]},settings:{effects:true},testSave:false,nextId:1});

export const hasNode=(s:GameState,b:PrestigeBranch,t:number)=>s.nodes.includes(`${b}-${t}`);
export const itemTypes:Record<ItemTypeId,{name:string;slot:ItemSlot;effect:ItemEffect}>={
 'quantum-chip':{name:'Quantenchip',slot:'processor',effect:'compute'},'neural-asic':{name:'Neural-ASIC',slot:'processor',effect:'credits'},'photonic-array':{name:'Photonenfeld',slot:'processor',effect:'training'},
 'memory-crystal':{name:'Speicherkristall',slot:'core',effect:'credits'},'logic-seed':{name:'Logik-Saat',slot:'core',effect:'training'},'tensor-core':{name:'Tensor-Kern',slot:'core',effect:'compute'},
 'field-scanner':{name:'Feldscanner',slot:'research',effect:'experiment'},'lab-drone':{name:'Labordrohne',slot:'research',effect:'components'},'data-prism':{name:'Datenprisma',slot:'research',effect:'credits'}};
export const itemEffect=(i:Item)=>BALANCE.itemBaseEffect*BALANCE.rarity[i.rarity].factor*(1+.1*i.level);
export const equippedBonus=(s:GameState,e:ItemEffect)=>Object.values(s.equipped).map(id=>s.inventory.find(i=>i.id===id)).filter((i):i is Item=>!!i&&itemTypes[i.type].effect===e).reduce((n,i)=>n+itemEffect(i),0)*(hasNode(s,'artifacts',3)?1.2:1);
export const blockCost=(owned:number,s?:GameState)=>BALANCE.blockBaseCost*BALANCE.blockGrowth**owned*(s&&hasNode(s,'infrastructure',2)?.95:1);
export const bulkCost=(owned:number,count:number,s?:GameState)=>Array.from({length:Math.max(0,count)},(_,i)=>blockCost(owned+i,s)).reduce((a,b)=>a+b,0);
export const computeRate=(hardware:number,s?:GameState)=>BALANCE.computePerBlock*hardware*2**Math.floor(hardware/BALANCE.tierSize)*(s?(1+(hasNode(s,'infrastructure',1)?.1:0)+(hasNode(s,'infrastructure',3)?.2:0))*(1+equippedBonus(s,'compute')):1);
export const quality=(level:number)=>BALANCE.qualityGrowth**level;
export const efficiency=(level:number)=>BALANCE.efficiencyGrowth**level;
export const permanentFactor=(s:GameState)=>1+BALANCE.insightBase*s.totalInsightEarned**BALANCE.insightPower;
export const achievementFactor=(s:GameState)=>1+.02*s.achievementPoints**.7;
export const creditRate=(hardware:number,level:number,s?:GameState,now=0,temporary=true)=>computeRate(hardware,s)*BALANCE.creditPerCompute*quality(level)*efficiency(level)*(s?permanentFactor(s)*achievementFactor(s)*(1+(hasNode(s,'models',2)?.1:0)+(s.breakthroughs.includes('distillation')?.15:0))*(1+equippedBonus(s,'credits'))*(temporary&&s.creditBoostUntil>now?2:1):1);
export const trainingRate=(hardware:number,s?:GameState,now=0,temporary=true)=>computeRate(hardware,s)*BALANCE.trainingPerCompute*(s?permanentFactor(s)*(1+(hasNode(s,'models',1)?.1:0)+(hasNode(s,'models',3)?.2:0)+(s.breakthroughs.includes('graph')?.2:0))*(1+equippedBonus(s,'training'))*(temporary&&s.trainingBoostUntil>now?2:1):1);
export const trainingGoal=(level:number)=>BALANCE.trainingBase*BALANCE.trainingGrowth**level;
export const prestigeClaim=(s:GameState)=>Math.floor(BALANCE.prestigeScale*(s.runCreditsEarned/BALANCE.prestigeBase)**BALANCE.prestigePower);
export const newInsight=(s:GameState)=>Math.max(0,prestigeClaim(s)-s.totalInsightEarned);
export const canPrestige=(s:GameState)=>newInsight(s)>=(s.prestigeCount?1:3);
export function buyHardware(s:GameState,count=1){const cost=bulkCost(s.hardware,count,s); if(count<1||s.credits<cost)return s; return {...s,credits:s.credits-cost,hardware:s.hardware+count,missions:{...s.missions,daily:{...s.missions.daily,hardware:s.missions.daily.hardware+count}}};}
export function addCredits(s:GameState,value:number,earned=true){return {...s,credits:s.credits+value,runCreditsEarned:s.runCreditsEarned+(earned?value:0),lifetimeCreditsEarned:s.lifetimeCreditsEarned+(earned?value:0)}};
