import {runChallenges,challenges} from './retention';
import {ScientificNumber} from './scientificNumber';
import {BALANCE,componentIds,hardwareIds,itemTypes,equipmentSlots,equipmentSlotCount,trainingBaseDataCostScientific,scientificCeil,validEconomyValues,type GameState,type CraftingJob,type CraftingReservation} from './economy';
import {craftingRecipe,sameReservation} from './craftingRecipes';

const fail=(path:string,reason:string):never=>{throw new TypeError(`${path}: ${reason}`)};
const object=(value:unknown):value is Record<string,unknown>=>!!value&&typeof value==='object'&&!Array.isArray(value);
const finite=(value:unknown,min=0):value is number=>typeof value==='number'&&Number.isFinite(value)&&value>=min;
const integer=(value:unknown,min=0):value is number=>finite(value,min)&&Number.isSafeInteger(value);
const time=(value:unknown)=>finite(value)&&value<=8.64e15;
const id=(value:unknown):value is string=>typeof value==='string'&&value.length>0;
function counts(value:unknown,keys:readonly string[],path:string,partial=false){
 if(!object(value))fail(path,'Bestand fehlt oder ist ungültig');
 const record=value as Record<string,unknown>;
 if(Object.keys(record).some(key=>!keys.includes(key)))fail(path,'unbekannte ID');
 if(!partial&&keys.some(key=>!Object.hasOwn(record,key)))fail(path,'Bestand ist unvollständig');
 if(Object.values(record).some(n=>!integer(n)))fail(path,'Mengen müssen nicht negative sichere Ganzzahlen sein');
}
function ids(value:unknown,keys:readonly string[],path:string){if(!Array.isArray(value)||value.some(key=>typeof key!=='string'||!keys.includes(key)))fail(path,'unbekannte ID oder ungültige Liste');}
function timing(job:{startedAt?:unknown;endsAt?:unknown},path:string){if(!time(job.startedAt)||!time(job.endsAt)||Number(job.endsAt)<Number(job.startedAt))fail(path,'ungültige Start-/Endzeit');}
function reservation(value:unknown,path:string):asserts value is CraftingReservation{
 if(!object(value))fail(path,'Reservierung fehlt');
 const r=value as CraftingReservation;
 if(Object.keys(r).some(key=>!['components','modules','data','blueprints'].includes(key)))fail(path,'unbekannte reservierte Ressource');
 counts(r.components,componentIds,`${path}.components`,true);counts(r.modules,Object.keys(BALANCE.modules),`${path}.modules`,true);
 if(!integer(r.data)||!integer(r.blueprints))fail(path,'ungültige reservierte Data/Fragmente');
}
export function assertChallengeRun(value:unknown):asserts value is NonNullable<GameState['retention']['activeRun']>{
 if(!object(value)||!runChallenges.some(c=>c.id===value.id)||!id(value.runId)||!time(value.startedAt)||!ScientificNumber.isValidJSON(value.eligibleAtStart)||ScientificNumber.fromJSON(value.eligibleAtStart as {m:number;e:number}).compare(ScientificNumber.zero())<0)fail('retention.activeRun','unbekannte Challenge oder ungültiger Run/Zeit/Umsatz');
}
/** v24 originally stored only id/startedAt. Later saves added both revenue
 * baseline and run ID; accept either known shape only while ending a legacy run. */
export function assertLegacyChallengeRun(value:unknown){
 if(!object(value)||!runChallenges.some(c=>c.id===value.id)||!time(value.startedAt))fail('retention.activeRun','unbekannte Challenge oder ungültige Startzeit');
 const run=value as Record<string,unknown>;
 if(run.runId===undefined&&run.eligibleAtStart===undefined)return;
 assertChallengeRun(value);
}
function report(value:unknown){
 if(!object(value))return fail('challenge.report','Rückkehrbericht fehlt');
 const numbers=['credits','data','research','levels','researchCompleted','experiments','craftingCompleted','hardware','seconds','elapsedSeconds','lostSeconds','newQuestRewards','newSeasonRewards'];
 if(numbers.some(key=>!finite(value[key]))||!ScientificNumber.isValidJSON(value.exactCredits)||!ScientificNumber.isValidJSON(value.exactData)||ScientificNumber.fromJSON(value.exactCredits as {m:number;e:number}).compare(ScientificNumber.zero())<0||ScientificNumber.fromJSON(value.exactData as {m:number;e:number}).compare(ScientificNumber.zero())<0)fail('challenge.report','ungültige Ressourcen/Zeit');
 counts(value.components,componentIds,'challenge.report.components',true);
 if(!Array.isArray(value.analysisResults))fail('challenge.report','Analyseergebnisse fehlen');
 for(const r of value.analysisResults as GameState['experiments']['lastResult'][]){if(!r||!Object.hasOwn(BALANCE.experimentRewards,r.type)||!['short','long'].includes(r.length)||!id(r.id)||!time(r.at)||!['active','offline'].includes(r.mode)||!integer(r.blueprintFragments)||!integer(r.researchFragments))fail('challenge.report','ungültiges Analyseergebnis');counts(r!.components,componentIds,'challenge.report.analysisResults.components',true);}
}
/** Called after existing version migrations and before simulation or any save write. */
function savedScientificCost(value:unknown,native:number|undefined,field:string){if(value===undefined)return;if(!ScientificNumber.isValidJSON(value)||native===undefined||ScientificNumber.fromJSON(value).toNumber(1e300)!==native)fail(field,'ungültige wissenschaftliche Auftragskosten');}
export function assertDomainState(value:unknown):asserts value is GameState{
 if(!object(value))fail('Spielstand','kein Zustandsobjekt');
 const s=value as GameState;
 if(!object(s.retention))fail('retention','Challenge-Fortschritt fehlt');
 const retention=s.retention;
 counts(retention.hardwareMasteryXp,hardwareIds,'retention.hardwareMasteryXp');
 if(!integer(retention.challengeStars))fail('retention.challengeStars','ungültige Sterne');
 ids(retention.claimedChallenges,challenges.map(c=>c.id),'retention.claimedChallenges');
 counts(retention.runCompletions,runChallenges.map(c=>c.id),'retention.runCompletions',true);
 if(!object(retention.runBestSeconds)||Object.entries(retention.runBestSeconds).some(([key,v])=>!runChallenges.some(c=>c.id===key)||!finite(v)))fail('retention.runBestSeconds','unbekannte Challenge oder ungültige Bestzeit');
 if(retention.activeRun!==null){assertChallengeRun(retention.activeRun);if(retention.activeRun.startedAt>s.savedAt||!s.challengeSession)fail('challengeSession','Hauptspiel fehlt oder Startzeit widersprüchlich');}
 if(s.challengeSession!==undefined){
  const session=s.challengeSession;
  if(!object(session)||!retention.activeRun||!object(session.main)||session.main.challengeSession!==undefined||session.main.retention?.activeRun!==null||!time(session.anchor)||session.anchor!==session.main.savedAt||session.anchor>s.savedAt||session.anchor<retention.activeRun.startedAt)fail('challengeSession','widersprüchlicher Hauptspiel-/Zeitanker');
  assertDomainState(session.main);report(session.report);
 }
 if(s.challengeReturn!==undefined){const result=s.challengeReturn;if(!object(result)||!id(result.runId)||typeof result.success!=='boolean')fail('challengeReturn','ungültige Rückkehr');report(result.report);}
 if(s.challengeMigrationNotice!==undefined&&s.challengeMigrationNotice!=='legacy-challenge-recovered')fail('challengeMigrationNotice','ungültiger Hinweis');
 if(!validEconomyValues(s))fail('ScientificNumber-Ledger','ungültiger Ressourcenwert');
 counts(s.componentInventory,componentIds,'componentInventory');counts(s.modules,Object.keys(BALANCE.modules),'modules');
 counts(s.hardwareCounts,hardwareIds,'hardwareCounts');counts(s.researchLevels,Object.keys(BALANCE.repeatableResearch),'researchLevels');
 for(const key of ['hardware','level','qualityLevel','efficiencyLevel','prestigeCount','purchasedResearchLabs','researchFragments','blueprintFragments','nextId'] as const)if(!integer(s[key],key==='nextId'?1:0))fail(key,'ungültige sichere Ganzzahl');
 if(s.purchasedEquipmentSlots!==undefined&&!integer(s.purchasedEquipmentSlots))fail('purchasedEquipmentSlots','ungültige Ganzzahl');
 for(const key of ['components','training','componentRemainder','researchRemainder','blueprintRemainder','passiveCircuitProgress','worldDropProgress','gems'] as const)if(!finite(s[key]))fail(key,'ungültiger oder negativer Bestand/Fortschritt');
 if(!time(s.savedAt)||!finite(s.clockOffsetMs))fail('Spielzeit','ungültige Zeit');
 ids(s.discovered,hardwareIds,'discovered');ids(s.classUpgrades,hardwareIds,'classUpgrades');
 ids(s.completedResearch,Object.keys(BALANCE.researchProjects),'completedResearch');ids(s.researchQueue,[...Object.keys(BALANCE.researchProjects),...Object.keys(BALANCE.repeatableResearch)],'researchQueue');
 ids(s.breakthroughs,Object.keys(BALANCE.breakthroughs),'breakthroughs');
 if(!Array.isArray(s.nodes)||s.nodes.some(key=>typeof key!=='string'||!Object.hasOwn(BALANCE.prestigeUpgrades,key.replace(/:1$/,''))))fail('nodes','unbekannte Prestige-ID');
 if(s.pinnedGoal!==null){const goal=s.pinnedGoal;if(!object(goal)||!['hardware','research','recipe','prestige'].includes(goal.kind))fail('pinnedGoal','ungültiges Ziel');const catalog=goal.kind==='hardware'?BALANCE.hardware:goal.kind==='research'?{...BALANCE.researchProjects,...BALANCE.repeatableResearch}:goal.kind==='recipe'?BALANCE.itemRecipes:BALANCE.prestigeUpgrades;if(!Object.hasOwn(catalog,goal.id)||(goal.target!==undefined&&!integer(goal.target,1)))fail('pinnedGoal','unbekannte Ziel-ID/Menge');}

 if(!object(s.lifetime))fail('lifetime','Statistik fehlt');
 ids(s.lifetime.itemTypes,Object.keys(itemTypes),'lifetime.itemTypes');ids(s.lifetime.hardwareClasses,hardwareIds,'lifetime.hardwareClasses');
 if(!object(s.automation)||!Object.hasOwn(BALANCE.operatingProfiles,s.operatingProfile))fail('Produktion','ungültiges Betriebsprofil/Automation');
 if(s.automation.target!==null&&!hardwareIds.includes(s.automation.target))fail('automation.target','unbekannte Hardware');
 if(s.scannerTarget!==null&&!componentIds.includes(s.scannerTarget))fail('scannerTarget','unbekannte Komponente');
 if(!object(s.hardwareAutoBuyers)||Object.entries(s.hardwareAutoBuyers).some(([key,v])=>!hardwareIds.includes(key as typeof hardwareIds[number])||typeof v!=='boolean'))fail('hardwareAutoBuyers','ungültige Hardware/Schaltung');
 if(!Array.isArray(s.inventory))fail('inventory','Inventar fehlt');
 const inventoryIds=new Set<string>(),liveIds=new Set<string>();
 const claim=(key:unknown,path:string)=>{if(!id(key)||liveIds.has(key))fail(path,'fehlende oder doppelte Instanz-/Auftrags-ID');liveIds.add(key as string);};
 for(const item of s.inventory){
  if(!object(item)||!Object.hasOwn(itemTypes,item.type))fail('inventory.type','unbekannter Itemtyp');
  if(!Object.hasOwn(BALANCE.rarity,item.rarity))fail('inventory.rarity','unbekannte Qualität');
  claim(item.id,'inventory.id');inventoryIds.add(item.id);
  if(!integer(item.level)||typeof item.locked!=='boolean'||(item.forge!==undefined&&(!integer(item.forge)||item.forge>20))||(item.relayTaps!==undefined&&!integer(item.relayTaps)))fail('inventory','ungültiges Level oder Itemfortschritt');
 }
 if(!object(s.equipped))fail('equipped','Ausrüstung fehlt');
 const equippedIds=new Set<string>();
 for(const [slot,key] of Object.entries(s.equipped)){
  const item=s.inventory.find(item=>item.id===key);
  if(!equipmentSlots.includes(slot as typeof equipmentSlots[number])||!id(key)||!inventoryIds.has(key)||!item||itemTypes[item.type].slot!==slot||equippedIds.has(key))fail('equipped','Instanz fehlt, Slot ist inkompatibel oder Instanz mehrfach ausgerüstet');
  equippedIds.add(key);
 }
 if(equippedIds.size>equipmentSlotCount(s))fail('equipped','mehr Instanzen als freigeschaltete Sockel');
 if(!object(s.crafting)||!Array.isArray(s.crafting.queue)||s.crafting.queue.length>3||(s.crafting.active===null&&s.crafting.queue.length>0))fail('crafting','ungültige Warteschlange');
 function job(value:unknown,queued:boolean){
  if(!object(value))fail('crafting','Auftragsobjekt fehlt');
  const j=value as CraftingJob,recipe=craftingRecipe(j.kind,j.recipeId,j.quantity);
  if(!recipe)return fail('crafting','unbekanntes Rezept oder ungültige Menge');
  if(!integer(j.completed)||j.completed>=j.quantity||j.durationPerUnit!==recipe.durationPerUnit)fail('crafting','ungültige Menge oder Laufzeit');
  claim(j.id,'crafting.id');reservation(j.ingredients,'crafting.ingredients');
  if(!sameReservation(j.ingredients,recipe.ingredients))fail('crafting.ingredients','Reservierung entspricht nicht der gesamten Rezeptmenge');
  if(!object(j.result)||j.result.kind!==recipe.result.kind||j.result.id!==recipe.result.id||j.result.rarity!==recipe.result.rarity)fail('crafting.result','Ergebnis passt nicht zum Rezept');
  if(queued){if(j.completed!==0||j.startedAt!==null||j.endsAt!==null)fail('crafting.queue','wartender Auftrag wurde bereits gestartet');}
  else{timing(j,'crafting.active');if(Number(j.startedAt)>s.savedAt+.1||Number(j.endsAt)-Number(j.startedAt)>j.durationPerUnit*1000+.1)fail('crafting.active','widersprüchliche Laufzeit');}
 }
 if(s.crafting.active!==null)job(s.crafting.active,false);for(const queued of s.crafting.queue)job(queued,true);
 if(!Array.isArray(s.researchLabs))fail('researchLabs','Labore fehlen');
 const researchIds=[...Object.keys(BALANCE.researchProjects),...Object.keys(BALANCE.repeatableResearch)];
 for(const lab of s.researchLabs)if(lab!==null){if(!object(lab)||!researchIds.includes(lab.id)||!integer(lab.level,1)||!finite(lab.dataCost)||!finite(lab.durationSeconds,Number.MIN_VALUE))fail('researchLabs','ungültiger Forschungsauftrag');timing(lab,'researchLabs');savedScientificCost(lab.dataCostExact,lab.dataCost,'researchLabs.dataCostExact');}
 if(!Array.isArray(s.trainingQueue))fail('trainingQueue','Trainingsliste fehlt');
 for(const queued of s.trainingQueue)if(!object(queued)||!['quality','efficiency'].includes(queued.track)||!integer(queued.targetLevel,1))fail('trainingQueue','ungültiger Trainingsauftrag');
 if(s.activeTraining!==null){const j=s.activeTraining;if(!object(j)||!['quality','efficiency'].includes(j.track)||!finite(j.workRequired,Number.MIN_VALUE)||!finite(j.creditCost)||(j.dataCost!==undefined&&!finite(j.dataCost))||(j.startedAt!==undefined&&!time(j.startedAt))||(j.baseDuration!==undefined&&!finite(j.baseDuration,Number.MIN_VALUE))||(j.startingRate!==undefined&&!finite(j.startingRate,Number.MIN_VALUE))||(j.onlineWork!==undefined&&!finite(j.onlineWork))||(j.offlineWork!==undefined&&!finite(j.offlineWork))||s.training>j.workRequired+.1)fail('activeTraining','ungültiger Trainingsauftrag');savedScientificCost(j.dataCostExact,j.dataCost,'activeTraining.dataCostExact');if(j.costBasis!==undefined){const b=j.costBasis;if(!object(b)||!integer(b.targetLevel,1)||!finite(b.factor,.5)||b.factor>1||!finite(b.bonusTotal)||!object(b.sources)||Object.values(b.sources).some(v=>!finite(v)))fail('activeTraining.costBasis','ungültige Trainingskostenbasis');const base=(()=>{try{return ScientificNumber.fromJSON(b.baseDataCostExact);}catch{return fail('activeTraining.costBasis','ungültige wissenschaftliche Basiskosten');}})();if(base.isZero()||!j.dataCostExact)fail('activeTraining.costBasis','fehlende Trainingskosten');if(b.targetLevel!==(j.track==='quality'?s.qualityLevel:s.efficiencyLevel)+1||base.compare(trainingBaseDataCostScientific(b.targetLevel))!==0||b.bonusTotal!==Object.values(b.sources).reduce((sum,v)=>sum+(v as number),0)||b.factor!==Math.max(BALANCE.trainingCostFloor,1/(1+b.bonusTotal))||scientificCeil(base.multiplyNumber(b.factor)).compare(ScientificNumber.fromJSON(j.dataCostExact))!==0)fail('activeTraining.costBasis','widersprüchliche Trainingskosten');}}
 if(!object(s.experiments))fail('experiments','Analysen fehlen');
 const experimentIds=Object.keys(BALANCE.experimentRewards);ids(s.experiments.queue,experimentIds,'experiments.queue');
 if(s.experiments.repeat!==null&&!experimentIds.includes(s.experiments.repeat))fail('experiments.repeat','unbekanntes Rezept');
 if(!Array.isArray(s.experiments.completedIds)||s.experiments.completedIds.some(key=>!id(key))||new Set(s.experiments.completedIds).size!==s.experiments.completedIds.length)fail('experiments.completedIds','ungültige Abschluss-IDs');
 if(s.experiments.active!==null){const j=s.experiments.active;if(!object(j)||!experimentIds.includes(j.type)||!['intro','short','long'].includes(j.length)||s.experiments.completedIds.includes(j.id)||(j.durationSeconds!==undefined&&!finite(j.durationSeconds))||(j.dataCost!==undefined&&!finite(j.dataCost))||(j.creditCost!==undefined&&!finite(j.creditCost)))fail('experiments.active','ungültiger oder bereits abgeschlossener Analyseauftrag');claim(j.id,'experiments.active.id');timing(j,'experiments.active');}
 if(s.experiments.lastResult!==null&&s.experiments.lastResult!==undefined){const r=s.experiments.lastResult;if(!object(r)||!experimentIds.includes(r.type)||!['short','long'].includes(r.length)||!id(r.id)||!time(r.at)||!['active','offline'].includes(r.mode)||!integer(r.blueprintFragments)||!integer(r.researchFragments))fail('experiments.lastResult','ungültiges Analyseergebnis');counts(r.components,componentIds,'experiments.lastResult.components',true);}
 if(!Array.isArray(s.lootDrops))fail('lootDrops','Drops fehlen');
 for(const drop of s.lootDrops){if(!object(drop)||(drop.variant!==undefined&&!['coin','cache','core'].includes(drop.variant))||!time(drop.spawnedAt)||!time(drop.expiresAt)||drop.expiresAt<drop.spawnedAt)fail('lootDrops','ungültiger Drop');claim(drop.id,'lootDrops.id');}
 for(const key of [...liveIds,...s.experiments.completedIds]){const generated=/^(?:item|craft|exp|drop)-(\d+)$/.exec(key);if(generated&&Number(generated[1])>=s.nextId)fail('nextId','würde eine bestehende Instanz-/Auftrags-ID erneut vergeben');}
}
