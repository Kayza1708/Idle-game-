import {advanceTo,emptyReport} from './simulation';
import {exactEconomyValue,GameState,HardwareId,hardwareIds,hardwareMasteryLevel,newGame,prestigeClaimForEligible,itemTypes} from './economy';
import {ScientificNumber} from './scientificNumber';
import type {Language} from './i18n';
export type Challenge={id:string;name:string;description:string;stars:number;check:(s:GameState)=>boolean};
export const challenges:Challenge[]=[
{id:'first-empire',name:'Compute Empire',description:'Besitze 500 Einheiten in 5 Hardwareklassen.',stars:1,check:s=>hardwareIds.filter(id=>s.hardwareCounts[id]>=500).length>=5},
{id:'master-network',name:'Master Network',description:'Erreiche insgesamt 25 Hardware-Mastery-Level.',stars:2,check:s=>hardwareIds.reduce((n,id)=>n+hardwareMasteryLevel(s,id),0)>=25},
{id:'prestige-25',name:'Recursive Intelligence',description:'Führe 25 Prestiges durch.',stars:2,check:s=>s.lifetime.prestiges>=25},
{id:'prestige-100',name:'Deep Recursion',description:'Führe 100 Prestiges durch.',stars:4,check:s=>s.lifetime.prestiges>=100},
{id:'research-500',name:'Research Institute',description:'Schließe 500 Forschungen ab.',stars:3,check:s=>s.lifetime.researchCompleted>=500},
{id:'components-100k',name:'Material Vault',description:'Finde 100.000 Komponenten.',stars:3,check:s=>s.lifetime.componentsEarned>=100000},
{id:'items-250',name:'Master Fabricator',description:'Stelle 250 Items her.',stars:3,check:s=>s.lifetime.itemsCrafted>=250},
{id:'achievement-500',name:'Completionist',description:'Erreiche 500 Achievement Points.',stars:4,check:s=>s.achievementPoints>=500},
{id:'season-3',name:'Seasoned Operator',description:'Schließe 3 Seasons vollständig ab.',stars:4,check:s=>s.profile.completedSeasons.length>=3},
{id:'season-12',name:'Year One',description:'Schließe 12 Seasons vollständig ab.',stars:8,check:s=>s.profile.completedSeasons.length>=12},
{id:'mastery-100',name:'Hardware Savant',description:'Erreiche insgesamt 100 Hardware-Mastery-Level.',stars:8,check:s=>hardwareIds.reduce((n,id)=>n+hardwareMasteryLevel(s,id),0)>=100},
{id:'all-mastered',name:'Machine Civilization',description:'Erreiche Mastery 5 mit allen 15 Hardwareklassen.',stars:12,check:s=>hardwareIds.every(id=>hardwareMasteryLevel(s,id)>=5)}];
export type RunChallenge={id:string;name:string;description:string;stars:number};
export const runChallenges:RunChallenge[]=[
{id:'no-taps',name:'Hands Off',description:'Erreiche 1 INT ohne Tap-Credits.',stars:2},
{id:'no-items',name:'Bare Metal',description:'Erreiche 1 INT ohne ausgerüstete Itemeffekte.',stars:2},
{id:'five-hardware',name:'Compact Stack',description:'Erreiche 1 INT nur mit den ersten fünf Hardwareklassen.',stars:3},
{id:'data-crunch',name:'Data Drought',description:'Erreiche 1 INT mit nur 10 % Datenproduktion.',stars:3},
{id:'inflation',name:'Brutal Inflation',description:'Erreiche 1 INT bei 100× Hardwarepreisen.',stars:5}];

type ChallengeCopy={
  name:string;
  description:Record<Language,string>;
};

const challengeCopy:Record<string,ChallengeCopy>={
  'first-empire':{
    name:'Compute Empire',
    description:{
      en:'Own 500 units in 5 hardware classes.',
      de:'Besitze 500 Einheiten in 5 Hardwareklassen.',
      es:'Posee 500 unidades en 5 clases de hardware.',
      fr:'Possède 500 unités dans 5 classes de matériel.',
      pt:'Possui 500 unidades em 5 classes de hardware.',
      it:'Possiedi 500 unità in 5 classi hardware.',
      pl:'Posiadaj 500 jednostek w 5 klasach sprzętu.'
    }
  },
  'master-network':{
    name:'Master Network',
    description:{
      en:'Reach a total of 25 Hardware Mastery levels.',
      de:'Erreiche insgesamt 25 Hardware-Mastery-Level.',
      es:'Alcanza un total de 25 niveles de maestría de hardware.',
      fr:'Atteins un total de 25 niveaux de maîtrise du matériel.',
      pt:'Alcança um total de 25 níveis de maestria de hardware.',
      it:'Raggiungi un totale di 25 livelli di maestria hardware.',
      pl:'Osiągnij łącznie 25 poziomów mistrzostwa sprzętu.'
    }
  },
  'prestige-25':{
    name:'Recursive Intelligence',
    description:{
      en:'Perform 25 prestiges.',
      de:'Führe 25 Prestiges durch.',
      es:'Realiza 25 prestigios.',
      fr:'Effectue 25 prestiges.',
      pt:'Realiza 25 prestígios.',
      it:'Esegui 25 prestigio.',
      pl:'Wykonaj 25 prestiży.'
    }
  },
  'prestige-100':{
    name:'Deep Recursion',
    description:{
      en:'Perform 100 prestiges.',
      de:'Führe 100 Prestiges durch.',
      es:'Realiza 100 prestigios.',
      fr:'Effectue 100 prestiges.',
      pt:'Realiza 100 prestígios.',
      it:'Esegui 100 prestigio.',
      pl:'Wykonaj 100 prestiży.'
    }
  },
  'research-500':{
    name:'Research Institute',
    description:{
      en:'Complete 500 research projects.',
      de:'Schließe 500 Forschungen ab.',
      es:'Completa 500 investigaciones.',
      fr:'Termine 500 recherches.',
      pt:'Conclui 500 pesquisas.',
      it:'Completa 500 ricerche.',
      pl:'Ukończ 500 badań.'
    }
  },
  'components-100k':{
    name:'Material Vault',
    description:{
      en:'Find 100,000 components.',
      de:'Finde 100.000 Komponenten.',
      es:'Encuentra 100.000 componentes.',
      fr:'Trouve 100 000 composants.',
      pt:'Encontra 100.000 componentes.',
      it:'Trova 100.000 componenti.',
      pl:'Znajdź 100 000 komponentów.'
    }
  },
  'items-250':{
    name:'Master Fabricator',
    description:{
      en:'Craft 250 items.',
      de:'Stelle 250 Items her.',
      es:'Fabrica 250 objetos.',
      fr:'Fabrique 250 objets.',
      pt:'Fabrica 250 itens.',
      it:'Crea 250 oggetti.',
      pl:'Wytwórz 250 przedmiotów.'
    }
  },
  'achievement-500':{
    name:'Completionist',
    description:{
      en:'Reach 500 Achievement Points.',
      de:'Erreiche 500 Achievement Points.',
      es:'Alcanza 500 puntos de logros.',
      fr:'Atteins 500 points de succès.',
      pt:'Alcança 500 pontos de conquistas.',
      it:'Raggiungi 500 punti obiettivi.',
      pl:'Osiągnij 500 punktów osiągnięć.'
    }
  },
  'season-3':{
    name:'Seasoned Operator',
    description:{
      en:'Fully complete 3 seasons.',
      de:'Schließe 3 Seasons vollständig ab.',
      es:'Completa totalmente 3 temporadas.',
      fr:'Termine entièrement 3 saisons.',
      pt:'Conclui totalmente 3 temporadas.',
      it:'Completa interamente 3 stagioni.',
      pl:'Ukończ w pełni 3 sezony.'
    }
  },
  'season-12':{
    name:'Year One',
    description:{
      en:'Fully complete 12 seasons.',
      de:'Schließe 12 Seasons vollständig ab.',
      es:'Completa totalmente 12 temporadas.',
      fr:'Termine entièrement 12 saisons.',
      pt:'Conclui totalmente 12 temporadas.',
      it:'Completa interamente 12 stagioni.',
      pl:'Ukończ w pełni 12 sezonów.'
    }
  },
  'mastery-100':{
    name:'Hardware Savant',
    description:{
      en:'Reach a total of 100 Hardware Mastery levels.',
      de:'Erreiche insgesamt 100 Hardware-Mastery-Level.',
      es:'Alcanza un total de 100 niveles de maestría de hardware.',
      fr:'Atteins un total de 100 niveaux de maîtrise du matériel.',
      pt:'Alcança um total de 100 níveis de maestria de hardware.',
      it:'Raggiungi un totale di 100 livelli di maestria hardware.',
      pl:'Osiągnij łącznie 100 poziomów mistrzostwa sprzętu.'
    }
  },
  'all-mastered':{
    name:'Machine Civilization',
    description:{
      en:'Reach Mastery 5 with all 15 hardware classes.',
      de:'Erreiche Mastery 5 mit allen 15 Hardwareklassen.',
      es:'Alcanza maestría 5 con las 15 clases de hardware.',
      fr:'Atteins la maîtrise 5 avec les 15 classes de matériel.',
      pt:'Alcança maestria 5 com as 15 classes de hardware.',
      it:'Raggiungi maestria 5 con tutte le 15 classi hardware.',
      pl:'Osiągnij mistrzostwo 5 we wszystkich 15 klasach sprzętu.'
    }
  },

  'no-taps':{
    name:'Hands Off',
    description:{
      en:'Reach 1 INT without tap credits.',
      de:'Erreiche 1 INT ohne Tap-Credits.',
      es:'Alcanza 1 INT sin créditos de toques.',
      fr:'Atteins 1 INT sans crédits de taps.',
      pt:'Alcança 1 INT sem créditos de toques.',
      it:'Raggiungi 1 INT senza crediti dai tap.',
      pl:'Osiągnij 1 INT bez kredytów z tapnięć.'
    }
  },
  'no-items':{
    name:'Bare Metal',
    description:{
      en:'Reach 1 INT without equipped item effects.',
      de:'Erreiche 1 INT ohne ausgerüstete Itemeffekte.',
      es:'Alcanza 1 INT sin efectos de objetos equipados.',
      fr:'Atteins 1 INT sans effets d’objets équipés.',
      pt:'Alcança 1 INT sem efeitos de itens equipados.',
      it:'Raggiungi 1 INT senza effetti degli oggetti equipaggiati.',
      pl:'Osiągnij 1 INT bez efektów wyposażonych przedmiotów.'
    }
  },
  'five-hardware':{
    name:'Compact Stack',
    description:{
      en:'Reach 1 INT using only the first five hardware classes.',
      de:'Erreiche 1 INT nur mit den ersten fünf Hardwareklassen.',
      es:'Alcanza 1 INT usando solo las primeras cinco clases de hardware.',
      fr:'Atteins 1 INT uniquement avec les cinq premières classes de matériel.',
      pt:'Alcança 1 INT usando apenas as primeiras cinco classes de hardware.',
      it:'Raggiungi 1 INT usando solo le prime cinque classi hardware.',
      pl:'Osiągnij 1 INT, używając tylko pierwszych pięciu klas sprzętu.'
    }
  },
  'data-crunch':{
    name:'Data Drought',
    description:{
      en:'Reach 1 INT with only 10% data production.',
      de:'Erreiche 1 INT mit nur 10 % Datenproduktion.',
      es:'Alcanza 1 INT con solo un 10 % de producción de datos.',
      fr:'Atteins 1 INT avec seulement 10 % de production de données.',
      pt:'Alcança 1 INT com apenas 10% de produção de dados.',
      it:'Raggiungi 1 INT con solo il 10% della produzione dati.',
      pl:'Osiągnij 1 INT przy zaledwie 10% produkcji danych.'
    }
  },
  'inflation':{
    name:'Brutal Inflation',
    description:{
      en:'Reach 1 INT with hardware prices multiplied by 100.',
      de:'Erreiche 1 INT bei 100× Hardwarepreisen.',
      es:'Alcanza 1 INT con precios de hardware multiplicados por 100.',
      fr:'Atteins 1 INT avec des prix du matériel multipliés par 100.',
      pt:'Alcança 1 INT com preços de hardware multiplicados por 100.',
      it:'Raggiungi 1 INT con prezzi hardware moltiplicati per 100.',
      pl:'Osiągnij 1 INT przy cenach sprzętu pomnożonych przez 100.'
    }
  }
};

export function challengeText(
  challenge:{id:string;name:string;description:string},
  language:Language
){
  const copy=challengeCopy[challenge.id];
  return {
    name:copy?.name??challenge.name,
    description:copy?.description[language]??copy?.description.en??challenge.description
  };
}

export const challengeClaimable=(s:GameState,c:Challenge)=>!s.retention.activeRun&&c.check(s)&&!s.retention.claimedChallenges.includes(c.id);
export function claimChallenge(s:GameState,id:string){const c=challenges.find(x=>x.id===id);if(s.retention.activeRun||!c||!challengeClaimable(s,c))return s;return{...s,retention:{...s.retention,challengeStars:s.retention.challengeStars+c.stars,claimedChallenges:[...s.retention.claimedChallenges,id]}};}
/** No inherited economy bonuses or account stock are permitted. Only cosmetic
 * preferences, the campaign identity and the existing clock cross this boundary. */
export function startRunChallenge(s:GameState,id:string):GameState{
 if(s.retention.activeRun||s.challengeSession||!runChallenges.some(c=>c.id===id))return s;
 const fresh=newGame(s.savedAt,s.telemetry.campaignId),runId=`${s.telemetry.campaignId}:${id}:${crypto.randomUUID()}`;
 return {...fresh,aiName:s.aiName,profile:{...fresh.profile,playerName:s.profile.playerName},settings:{...s.settings},clockOffsetMs:s.clockOffsetMs,gems:0,
  story:{...fresh.story,tutorial:'skipped',target:null,open:null,queue:[],enabled:false},
  retention:{...fresh.retention,activeRun:{id,runId,startedAt:s.savedAt,eligibleAtStart:fresh.exactEconomy.lifetimeEligibleCredits}},
  challengeSession:{main:s,anchor:s.savedAt,report:emptyReport()}};
}
export const runChallengeEligibleRevenue=(s:GameState)=>s.retention.activeRun?exactEconomyValue(s,'lifetimeEligibleCredits').subtract(ScientificNumber.fromJSON(s.retention.activeRun.eligibleAtStart)):ScientificNumber.zero();
export const runChallengeProgress=(s:GameState)=>prestigeClaimForEligible(runChallengeEligibleRevenue(s));
export const runChallengeReady=(s:GameState)=>!!s.retention.activeRun&&runChallengeProgress(s)>=1;
function returnToMain(s:GameState,success:boolean):GameState{
 if(!s.retention.activeRun||!s.challengeSession)return s;
 const settled=advanceTo(s,s.savedAt-s.clockOffsetMs).state,session=settled.challengeSession!,run=settled.retention.activeRun!,main=session.main;
 const challenge=runChallenges.find(c=>c.id===run.id);
 if(success&&(!challenge||!runChallengeReady(settled)))return s;
 const previous=main.retention.runCompletions[run.id]??0;
 const retention=success?{...main.retention,challengeStars:main.retention.challengeStars+(previous===0?challenge!.stars:0),
  runCompletions:{...main.retention.runCompletions,[run.id]:previous+1},
  runBestSeconds:{...main.retention.runBestSeconds,[run.id]:Math.min(main.retention.runBestSeconds[run.id]??Infinity,(settled.savedAt-run.startedAt)/1000)}}:main.retention;
 return {...main,clockOffsetMs:s.clockOffsetMs,retention,challengeReturn:{runId:run.runId,success,report:session.report}};
}
export function completeRunChallenge(s:GameState):GameState{return runChallengeReady(s)?returnToMain(s,true):s;}
export function abortRunChallenge(s:GameState):GameState{return returnToMain(s,false);}
export const totalMastery=(s:GameState)=>hardwareIds.reduce((n,id)=>n+hardwareMasteryLevel(s,id),0);
export const collectionSummary=(s:GameState)=>({hardware:s.lifetime.hardwareClasses.length,hardwareTotal:hardwareIds.length,components:Object.values(s.componentInventory).filter(v=>v>0).length,componentsTotal:Object.keys(s.componentInventory).length,itemTypes:s.lifetime.itemTypes.length,itemTypesTotal:Object.keys(itemTypes).length,artifacts:s.profile.artifacts.length,seasons:s.profile.completedSeasons.length});
export const prestigeGate=(s:GameState,depth:number)=>depth<=4?null:depth===5?{ok:s.achievementPoints>=100,label:'100 Achievement Points'}:depth===6?{ok:totalMastery(s)>=10,label:'10 Hardware Mastery'}:depth===7?{ok:s.retention.challengeStars>=10,label:'10 Challenge Stars'}:{ok:s.achievementPoints>=500&&totalMastery(s)>=50&&s.retention.challengeStars>=25,label:'500 AP · 50 Mastery · 25 Stars'};
export const masteryName=(id:HardwareId)=>id;
