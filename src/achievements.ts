import {BALANCE,GameState,HardwareId,ItemTypeId,itemCombinationBonus} from './economy';
import {addEvent} from './telemetry';
export type Achievement={id:string;de:string;en:string;descriptionDe:string;descriptionEn:string;thresholds:number[];progress:(s:GameState)=>number};
const family=(id:string,de:string,en:string,descriptionDe:string,descriptionEn:string,thresholds:number[],progress:(s:GameState)=>number):Achievement=>({id,de,en,descriptionDe,descriptionEn,thresholds,progress});
export const achievements:Achievement[]=[
 family('calculators','Das passt noch auf den Schreibtisch','Still desk-sized','Kaufe insgesamt Taschenrechner.','Buy calculators in total.',[10,100,1000,10000],s=>s.lifetime.calculatorsBought),
 family('hardware','Schrauben zählen nicht','Screws do not count','Kaufe insgesamt Hardware-Einheiten.','Buy hardware units in total.',[25,250,2500,25000],s=>s.lifetime.hardwareBought),
 family('classes','Siliziumzoo','Silicon zoo','Besitze unterschiedliche Hardwareklassen mindestens einmal.','Own distinct hardware classes at least once.',[2,5,10,15],s=>s.lifetime.hardwareClasses.length),
 family('milestones','Kabelmanagement','Cable management','Erreiche Hardware-Meilensteine insgesamt.','Reach hardware milestones in total.',[3,15,75,300],s=>s.lifetime.milestones),
 family('prestiges','Schon wieder Montag','Monday again','Führe Prestige-Neustarts durch.','Perform prestige resets.',[1,5,25,100],s=>s.lifetime.prestiges),
 family('int','Denken in Großbuchstaben','Thinking in capitals','Verdiene INT insgesamt.','Earn INT in total.',[1,16,256,4096],s=>s.lifetime.intEarned),
 family('lab-time','Licht im Labor','Lab lights on','Sammle Laborarbeitszeit; parallele Labore zählen einzeln.','Accumulate lab work; parallel labs count separately.',[3600,86400,432000,864000],s=>s.lifetime.labSeconds),
 family('research','Peer Review später','Peer review later','Schließe Forschungsprojekte ab.','Complete research projects.',[1,10,50,250],s=>s.lifetime.researchCompleted),
 family('training','Noch eine Epoche','One more epoch','Schließe Modelltrainings ab.','Complete model trainings.',[1,10,50,250],s=>s.lifetime.trainingCompleted),
 family('crafting','Mit Absicht gebaut','Built on purpose','Stelle Items gezielt her.','Craft items intentionally.',[1,5,25,100],s=>s.lifetime.itemsCrafted),
 family('items','Kuriositätenkabinett','Cabinet of curiosities','Entdecke unterschiedliche Itemtypen.','Discover distinct item types.',[2,4,7,9],s=>s.lifetime.itemTypes.length),
 family('taps','Fünf pro Sekunde reichen','Five per second is enough','Führe vergütete aktive Labor-Taps aus.','Perform rewarded active lab taps.',[10,250,2500,25000],s=>s.lifetime.taps),
];
const singles:[string,string,string,string,string,(s:GameState)=>boolean][]=[
 ['named','Hallo, Welt','Hello, world','Benenne dein KI-Modell.','Name your AI model.',s=>!!s.aiName],
 ['dual-lab','Beide Hände voll','Both hands full','Beschäftige zwei Labore gleichzeitig.','Run two labs simultaneously.',s=>s.researchLabs.filter(Boolean).length>=2],
 ['breakthrough','Heureka-ish','Eureka-ish','Schalte einen Forschungsdurchbruch frei.','Unlock a research breakthrough.',s=>s.breakthroughs.length>0],
 ['rare','Glitzert wissenschaftlich','Scientifically shiny','Finde mindestens ein seltenes Item.','Find at least one rare item.',s=>s.inventory.some(i=>['rare','epic','legendary'].includes(i.rarity))],
 ['run-mix','Gemischte Signale','Mixed signals','Erreiche in einem Run Meilensteine in drei Klassen.','Reach milestones in three classes in one run.',s=>s.runMilestoneClasses.length>=3],
 ['combo','Stecker passt','It plugs in','Rüste eine wirksame Item-Kombination aus.','Equip an effective item combination.',s=>itemCombinationBonus(s,'credits')>0||itemCombinationBonus(s,'research')>0],
 ['overclock','Kurz mal schneller','Just a little faster','Aktiviere Overclock mindestens einmal.','Activate overclock once.',s=>s.lifetime.overclocks>0],
 ['experiment','Keine Kontrollgruppe','No control group','Schließe ein Experiment ab.','Complete an experiment.',s=>s.experiments.completedIds.length>0],
 ['upgrade','Jetzt mit Aufkleber','Now with sticker','Kaufe ein Klassen-Upgrade.','Buy a class upgrade.',s=>s.classUpgrades.length>0],
];
for(const [id,de,en,descriptionDe,descriptionEn,test] of singles)achievements.push(family(id,de,en,descriptionDe,descriptionEn,[1],s=>test(s)?1:0));
export const achievementResearchBonus=(s:GameState)=>Math.min(BALANCE.achievementResearchCap,Math.floor(s.achievementPoints/10)*BALANCE.achievementResearchPerTen);
export function claimAchievement(s:GameState,id:string,tier:number){const a=achievements.find(x=>x.id===id),key=`${id}:${tier}`;if(!a||tier<0||tier>=a.thresholds.length||a.progress(s)<a.thresholds[tier]||s.achievementClaims.includes(key))return s;const gems=BALANCE.achievementTierGems[Math.min(tier,3)],points=BALANCE.achievementPointsPerTier[Math.min(tier,3)];return addEvent({...s,gems:s.gems+gems,achievementPoints:s.achievementPoints+points,achievementClaims:[...s.achievementClaims,key],gemLedger:[...s.gemLedger,{id:`achievement-${key}`,at:s.savedAt,amount:gems,source:'achievement'}]},'achievement',s.savedAt,{id,tier,gems,points});}
export const achievementReady=(s:GameState)=>achievements.some(a=>a.thresholds.some((t,i)=>a.progress(s)>=t&&!s.achievementClaims.includes(`${a.id}:${i}`)));
