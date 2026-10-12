import {grantMaterialPackage,type MaterialFamily} from './materialEconomy';
import {BALANCE,MAX_ECONOMY_VALUE,creditRateScientific,dataRateScientific,dayKey,GameState,MissionPeriod,MissionTask,MissionObjective,ProgressMetric,weekKey} from './economy';
import {addEvent} from './telemetry';
import {addSeasonXP,questSeasonXP,rollSeason} from './season';
import type {Language} from './i18n';
import {blueprintQuote} from './blueprints';
export type MissionKind='daily'|'weekly'|'monthly';
const monthKey=(ms:number)=>new Date(ms).toISOString().slice(0,7);
const dayEnd=(ms:number)=>{const d=new Date(ms);return Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate()+1)};
const weekEnd=(ms:number)=>{const d=new Date(ms),day=(d.getUTCDay()+6)%7;return Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate()-day+7)};
const monthEnd=(ms:number)=>{const d=new Date(ms);return Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+1,1)};
export const metricValue=(s:GameState,m:ProgressMetric)=>s.lifetime[m] as number;
type Template={objective?:MissionObjective;id:string;metric:ProgressMetric;de:string;en:string;base:readonly [number,number,number];available:(s:GameState)=>boolean};
export const objectiveValue=(s:GameState,objective:MissionObjective)=>objective==='blueprints'?new Set(s.learnedRecipes).size:objective==='foundries'?s.foundries.reduce((n,f)=>n+f.level,0):Object.values(s.challengeStages).reduce((n,v)=>n+v,0);
const taskValue=(s:GameState,t:Pick<MissionTask,'metric'|'objective'>)=>t.objective?objectiveValue(s,t.objective):metricValue(s,t.metric);
const templates:Template[]=[
 {id:'hardware',metric:'hardwareBought',de:'Hardware kaufen',en:'Buy hardware',base:BALANCE.missionBaseGoals['hardware'],available:()=>true},{id:'milestones',metric:'milestones',de:'Hardware-Meilensteine erreichen',en:'Reach hardware milestones',base:BALANCE.missionBaseGoals['milestones'],available:()=>true},{id:'train-done',metric:'trainingCompleted',de:'Training abschließen',en:'Complete training',base:BALANCE.missionBaseGoals['train-done'],available:()=>true},{id:'research-done',metric:'researchCompleted',de:'Forschung abschließen',en:'Complete research',base:BALANCE.missionBaseGoals['research-done'],available:s=>s.discovered.includes('sbc')},{id:'components',metric:'componentsEarned',de:'Komponenten erhalten',en:'Gain components',base:BALANCE.missionBaseGoals['components'],available:s=>s.prestigeCount>0||s.experiments.firstReward},{id:'craft',metric:'itemsCrafted',de:'Items herstellen',en:'Craft items',base:BALANCE.missionBaseGoals['craft'],available:s=>s.lifetime.itemsCrafted>0},{id:'drops',metric:'dropsClaimed',de:'Signal-Drops einsammeln',en:'Claim signal drops',base:BALANCE.missionBaseGoals['drops'],available:s=>s.discovered.includes('sbc')},{id:'fusion',metric:'itemsFused',de:'Items fusionieren',en:'Fuse items',base:BALANCE.missionBaseGoals['fusion'],available:()=>false},{id:'forge',metric:'forgeUpgrades',de:'Schmiede-Upgrades durchführen',en:'Forge item upgrades',base:BALANCE.missionBaseGoals['forge'],available:s=>s.foundries.length>0&&s.lifetime.forgeUpgrades>0},{id:'credits',metric:'regularCredits',de:'Credits produzieren',en:'Produce credits',base:BALANCE.missionBaseGoals['credits'],available:s=>s.lifetime.regularCredits<MAX_ECONOMY_VALUE},{id:'data',metric:'regularData',de:'Daten produzieren',en:'Produce data',base:BALANCE.missionBaseGoals['data'],available:s=>s.lifetime.regularData<MAX_ECONOMY_VALUE},{id:'taps',metric:'taps',de:'Vergütete Taps ausführen',en:'Perform rewarded taps',base:BALANCE.missionBaseGoals['taps'],available:()=>true},{id:'overclock',metric:'overclocks',de:'Overclocks auslösen',en:'Trigger overclocks',base:BALANCE.missionBaseGoals['overclock'],available:()=>true},{id:'prestige',metric:'prestiges',de:'Prestige durchführen',en:'Perform prestige',base:BALANCE.missionBaseGoals['prestige'],available:()=>false},{id:'active',metric:'activeSeconds',de:'Aktiv spielen',en:'Play actively',base:BALANCE.missionBaseGoals['active'],available:()=>true},
 {id:'blueprints',objective:'blueprints',metric:'itemsCrafted',de:'Neue Itembaupläne lernen',en:'Learn new item blueprints',base:BALANCE.missionProgression.objectiveGoals.blueprints,available:s=>s.completedResearch.includes('blueprints')&&Object.keys(BALANCE.itemRecipes).some(id=>blueprintQuote(s,id).price>0&&!(s.learnedRecipes??[]).includes(id as never)&&blueprintQuote(s,id).prerequisite)},
 {id:'foundries',objective:'foundries',metric:'forgeUpgrades',de:'Schmieden ausbauen',en:'Expand foundries',base:BALANCE.missionProgression.objectiveGoals.foundries,available:s=>s.foundries.length>0&&s.foundries.some(f=>f.level<5)},
 {id:'challenges',objective:'challenges',metric:'prestiges',de:'Neue Challenge-Stufen abschließen',en:'Complete new challenge stages',base:BALANCE.missionProgression.objectiveGoals.challenges,available:s=>objectiveValue(s,'challenges')>0&&objectiveValue(s,'challenges')<690}
];
const missionTranslations={
 challenges:{en:"Complete new challenge stages",de:"Neue Challenge-Stufen abschließen",es:"Completar nuevas etapas de desafíos",fr:"Terminer de nouvelles étapes de défis",pt:"Concluir novas etapas de desafios",it:"Completare nuove fasi delle sfide",pl:"Ukończ nowe etapy wyzwań"},
 foundries:{en:"Expand foundries",de:"Schmieden ausbauen",es:"Ampliar forjas",fr:"Agrandir les forges",pt:"Expandir forjas",it:"Espandere le fucine",pl:"Rozbuduj kuźnie"},
 blueprints:{en:"Learn new item blueprints",de:"Neue Itembaupläne lernen",es:"Aprender nuevos planos de objetos",fr:"Apprendre de nouveaux plans d’objets",pt:"Aprender novos projetos de itens",it:"Imparare nuovi progetti di oggetti",pl:"Poznaj nowe schematy przedmiotów"},
 hardware:{en:'Buy hardware',de:'Hardware kaufen',es:'Comprar hardware',fr:'Acheter du matériel',pt:'Comprar hardware',it:'Acquistare hardware',pl:'Kup sprzęt'},
 milestones:{en:'Reach hardware milestones',de:'Hardware-Meilensteine erreichen',es:'Alcanzar hitos de hardware',fr:'Atteindre des paliers de matériel',pt:'Alcançar marcos de hardware',it:'Raggiungere traguardi hardware',pl:'Osiągnij kamienie milowe sprzętu'},
 'train-start':{en:'Start training',de:'Training starten',es:'Iniciar entrenamiento',fr:'Démarrer un entraînement',pt:'Iniciar treino',it:'Avviare addestramento',pl:'Rozpocznij trening'},
 'train-done':{en:'Complete training',de:'Training abschließen',es:'Completar entrenamiento',fr:'Terminer un entraînement',pt:'Concluir treino',it:'Completare addestramento',pl:'Ukończ trening'},
 'research-start':{en:'Start research',de:'Forschung starten',es:'Iniciar investigación',fr:'Démarrer une recherche',pt:'Iniciar pesquisa',it:'Avviare ricerca',pl:'Rozpocznij badania'},
 'research-done':{en:'Complete research',de:'Forschung abschließen',es:'Completar investigación',fr:'Terminer une recherche',pt:'Concluir pesquisa',it:'Completare ricerca',pl:'Ukończ badania'},
 components:{en:'Gain components',de:'Komponenten erhalten',es:'Obtener componentes',fr:'Obtenir des composants',pt:'Obter componentes',it:'Ottenere componenti',pl:'Zdobywaj komponenty'},
 craft:{en:'Craft items',de:'Items herstellen',es:'Fabricar objetos',fr:'Fabriquer des objets',pt:'Fabricar itens',it:'Creare oggetti',pl:'Wytwarzaj przedmioty'},
 drops:{en:'Claim signal drops',de:'Signal-Drops einsammeln',es:'Recoger señales',fr:'Récupérer des signaux',pt:'Coletar sinais',it:'Raccogliere segnali',pl:'Zbieraj zrzuty sygnału'},
 fusion:{en:'Fuse items',de:'Items fusionieren',es:'Fusionar objetos',fr:'Fusionner des objets',pt:'Fundir itens',it:'Fondere oggetti',pl:'Łącz przedmioty'},
 forge:{en:'Forge item upgrades',de:'Schmiede-Upgrades durchführen',es:'Mejorar objetos en la forja',fr:'Améliorer des objets à la forge',pt:'Melhorar itens na forja',it:'Potenziare oggetti nella forgia',pl:'Ulepszaj przedmioty w kuźni'},
 credits:{en:'Produce credits',de:'Credits produzieren',es:'Producir créditos',fr:'Produire des crédits',pt:'Produzir créditos',it:'Produrre crediti',pl:'Produkuj kredyty'},
 data:{en:'Produce data',de:'Daten produzieren',es:'Producir datos',fr:'Produire des données',pt:'Produzir dados',it:'Produrre dati',pl:'Produkuj dane'},
 taps:{en:'Perform rewarded taps',de:'Vergütete Taps ausführen',es:'Realizar toques recompensados',fr:'Effectuer des taps récompensés',pt:'Realizar toques recompensados',it:'Eseguire tap ricompensati',pl:'Wykonuj nagradzane tapnięcia'},
 overclock:{en:'Trigger overclocks',de:'Overclocks auslösen',es:'Activar overclocks',fr:"Déclencher l'overclock",pt:'Ativar overclocks',it:"Attivare overclock",pl:'Uruchamiaj overclock'},
 prestige:{en:'Perform prestige',de:'Prestige durchführen',es:'Realizar prestigio',fr:'Effectuer un prestige',pt:'Realizar prestígio',it:'Eseguire prestigio',pl:'Wykonaj prestiż'},
 active:{en:'Play actively',de:'Aktiv spielen',es:'Jugar activamente',fr:'Jouer activement',pt:'Jogar ativamente',it:'Giocare attivamente',pl:'Graj aktywnie'},
} as const;

type MissionTranslationId=keyof typeof missionTranslations;

const missionTemplateId=(task:MissionTask):MissionTranslationId|undefined=>{
  const ids=Object.keys(missionTranslations) as MissionTranslationId[];
  return ids
    .sort((a,b)=>b.length-a.length)
    .find(id=>task.id.includes(`-${id}-`));
};

export function missionText(task:MissionTask,language:Language){
  const id=missionTemplateId(task);

  if(!id)
    return language==='de' ? task.de : task.en;

  const base=missionTranslations[id][language] ?? missionTranslations[id].en;

  const tierMatch=task.en.match(/ · Tier (\d+)$/);
  const stageMatch=task.de.match(/ · Stufe (\d+)$/);
  const stage=Number(tierMatch?.[1]??stageMatch?.[1]??1);

  if(stage<=1)return base;

  const suffix:Record<Language,string>={
    en:`Tier ${stage}`,
    de:`Stufe ${stage}`,
    es:`Nivel ${stage}`,
    fr:`Niveau ${stage}`,
    pt:`Nível ${stage}`,
    it:`Livello ${stage}`,
    pl:`Poziom ${stage}`,
  };

  return `${base} · ${suffix[language]}`;
}

const counts=BALANCE.missionCounts;
const required=BALANCE.missionRequired;
export function missionProgressionBand(s:GameState){return BALANCE.missionProgression.bandClasses.filter(n=>s.lifetime.hardwareClasses.length>=n).length;}
function missionGoal(s:GameState,t:Template,index:number,stage:number){
 const balance=BALANCE.missionProgression,band=missionProgressionBand(s);
 if(t.objective){const remaining=t.objective==='blueprints'?Object.values(BALANCE.itemRecipes).filter(r=>r.blueprints>0).length-objectiveValue(s,t.objective):t.objective==='foundries'?15-objectiveValue(s,t.objective):690-objectiveValue(s,t.objective);return Math.min(remaining,t.base[index]);}
 const scalable=['hardwareBought','milestones','trainingCompleted','researchCompleted','itemsCrafted','componentsEarned'].includes(t.metric);
 let goal=t.base[index]*(scalable?balance.bandMultipliers[band]:1)*balance.repeatMultiplier**stage;
 if(t.metric==='regularCredits'||t.metric==='regularData'){
  const permanent={...s,creditBoostUntil:0,overclock:{...s.overclock,activeUntil:0}};
  const rate=t.metric==='regularCredits'?creditRateScientific(s.hardware,s.level,permanent,s.savedAt):dataRateScientific(permanent);
  goal=Math.max(goal,rate.multiplyNumber(balance.productionSeconds[index]).toNumber(MAX_ECONOMY_VALUE));
 }
 return Math.min(MAX_ECONOMY_VALUE-metricValue(s,t.metric),Math.ceil(goal));
}
function makePeriod(s:GameState,kind:MissionKind,now:number):MissionPeriod{
 const index=kind==='daily'?0:kind==='weekly'?1:2,count=counts[kind],reward=BALANCE.missionRewards[kind],key=kind==='daily'?dayKey(now):kind==='weekly'?weekKey(now):monthKey(now),endsAt=kind==='daily'?dayEnd(now):kind==='weekly'?weekEnd(now):monthEnd(now);
 const available=templates.filter(t=>t.available(s)),seed=[...key].reduce((n,c)=>n+c.charCodeAt(0),0),tasks:MissionTask[]=[],uses=new Map<string,number>();
 // Hardware and production always provide passive alternatives. Scarce finite objectives occur once.
 const rotated=[...available.slice(seed%available.length),...available.slice(0,seed%available.length)];
 const pool=[...available.filter(t=>['hardware','credits'].includes(t.id)),...rotated.filter(t=>!['hardware','credits'].includes(t.id))];
 let cursor=0;
 while(tasks.length<count){const t=pool[cursor++%pool.length],stage=uses.get(t.id)??0;if(t.objective&&(stage>0||tasks.filter(x=>x.objective).length>=count-required[kind]))continue;uses.set(t.id,stage+1);const i=tasks.length;
  tasks.push({id:`${key}-${t.id}-${i}`,metric:t.metric,...(t.objective?{objective:t.objective}:{}),goal:missionGoal(s,t,index,stage),baseline:taskValue(s,t),reward:reward.task,rewardTier:1,claimed:false,de:`${t.de}${stage?` · Stufe ${stage+1}`:''}`,en:`${t.en}${stage?` · Tier ${stage+1}`:''}`});
 }
 return{key,endsAt,tasks,required:required[kind],bonus:reward.bonus,bonusClaimed:false};
}
const completed=(s:GameState,t:MissionTask)=>taskValue(s,t)-t.baseline>=t.goal;
function settle(s:GameState,kind:MissionKind,p:MissionPeriod){if(s.retention.activeRun||s.challengeSession)return s;const taskGems=p.tasks.filter(t=>completed(s,t)&&!t.claimed).reduce((n,t)=>n+t.reward,0),done=p.tasks.filter(t=>completed(s,t)).length,bonus=done>=p.required&&!p.bonusClaimed?p.bonus:0,total=taskGems+bonus;if(!total)return s;return{...s,gems:s.gems+total,gemLedger:[...s.gemLedger,{id:`mission-expiry-${kind}-${p.key}`,at:s.savedAt,amount:total,source:`mission-${kind}-expiry`}]};}
export function rollPeriods(s:GameState,now:number){if(s.retention.activeRun||s.challengeSession)return s;let next=rollSeason(s,now);for(const kind of ['daily','weekly','monthly'] as MissionKind[]){let p=next.missions[kind],key=kind==='daily'?dayKey(now):kind==='weekly'?weekKey(now):monthKey(now);if(!p.tasks.length)p=makePeriod(next,kind,now);else if(p.key!==key){next=settle(next,kind,p);p=makePeriod(next,kind,now)}next={...next,missions:{...next.missions,[kind]:p}};}return next;}
export function addActive(s:GameState,seconds:number,now:number){s=rollPeriods(s,now);return{...s,lifetime:{...s.lifetime,activeSeconds:s.lifetime.activeSeconds+seconds}};}
export function claimMission(s:GameState,period:MissionKind,id:string){if(s.retention.activeRun||s.challengeSession)return s;const p=s.missions[period],task=p.tasks.find(t=>t.id===id);if(!task||task.claimed||!completed(s,task))return s;const tasks=p.tasks.map(t=>t.id===id?{...t,claimed:true}:t),entry={id:`mission-${period}-${id}`,at:s.savedAt,amount:task.reward,source:`mission-${period}`};const tier=task.rewardTier??Math.max(1,Math.floor(p.tasks.findIndex(t=>t.id===id)/14)+1),rewarded=addSeasonXP({...s,gems:s.gems+task.reward,gemLedger:[...s.gemLedger,entry],missions:{...s.missions,[period]:{...p,tasks}}},questSeasonXP(period,tier),`mission-${period}`);const family=BALANCE.materialFamilyPriority.find(id=>s.materials.families.includes(id as MaterialFamily)) as MaterialFamily|undefined;const supplied=family?grantMaterialPackage(rewarded,family,'quest-material-package'):rewarded;return addEvent(supplied,'mission-claim',s.savedAt,{period,id,gems:task.reward,seasonXP:questSeasonXP(period,tier)});}
export function claimMissionBonus(s:GameState,period:MissionKind){if(s.retention.activeRun||s.challengeSession)return s;const p=s.missions[period],done=p.tasks.filter(t=>completed(s,t)).length;if(p.bonusClaimed||done<p.required)return s;const xp=questSeasonXP(period,2),rewarded=addSeasonXP({...s,gems:s.gems+p.bonus,gemLedger:[...s.gemLedger,{id:`mission-bonus-${period}-${p.key}`,at:s.savedAt,amount:p.bonus,source:`mission-${period}-bonus`}],missions:{...s.missions,[period]:{...p,bonusClaimed:true}}},xp,`mission-${period}-bonus`);const family=BALANCE.materialFamilyPriority.find(id=>s.materials.families.includes(id as MaterialFamily)) as MaterialFamily|undefined;const supplied=family?grantMaterialPackage(rewarded,family,'quest-material-package'):rewarded;return addEvent(supplied,'mission-claim',s.savedAt,{period,id:'bonus',gems:p.bonus,seasonXP:xp});}
export function claimMailbox(s:GameState){return s;}
export const missionProgress=(s:GameState,t:MissionTask)=>Math.min(t.goal,Math.max(0,taskValue(s,t)-t.baseline));
export const missionRewardClaimable=(s:GameState,kind:MissionKind)=>{const period=s.missions[kind],done=period.tasks.filter(task=>completed(s,task)).length;return period.tasks.some(task=>completed(s,task)&&!task.claimed)||(period.tasks.length>0&&done>=period.required&&!period.bonusClaimed)};
