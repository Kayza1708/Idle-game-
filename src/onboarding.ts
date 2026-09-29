import { BALANCE, GameState, addCredits, grantComponents } from './economy';
import { addEvent, addMetrics } from './telemetry';

const calculator25Milestone=BALANCE.hardware.calculator.milestones.find(milestone=>milestone.threshold===25)!;
const calculator25Effect=`+${calculator25Milestone.compute*100} % Klassen-Compute und +${calculator25Milestone.value*100} % Tap-Ertrag`;

export const onboardingSteps=[
  {id:'first-buy',title:'Erste Erweiterung',text:'Kaufe deine erste Hardware.',reward:'25 Credits'},
  {id:'ten-calculators',title:'Rechenkollektiv',text:'Besitze 10 Taschenrechner.',reward:'60 Credits'},
  {id:'discover-sbc',title:'Neue Architektur',text:'Entdecke den Einplatinencomputer.',reward:'120 Credits'},
  {id:'first-level',title:'Lernendes Modell',text:'Erreiche Modelllevel 1.',reward:'100 Credits'},
  {id:'first-research',title:'Forschung beginnt',text:'Schließe dein erstes Forschungsprojekt ab.',reward:'100 Credits'},
  {id:'equip-item',title:'Labor ausrüsten',text:'Rüste ein Item aus.',reward:'75 Schaltkreise'},
  {id:'class-upgrade',title:'Tap-Kopplung',text:`Erreiche 25 Taschenrechner: ${calculator25Effect}.`,reward:'250 Credits'},
  {id:'first-prestige',title:'Neustart des Labors',text:'Führe den ersten Prestige durch.',reward:'Abgeschlossen'},
] as const;

export function updateOnboarding(s:GameState):GameState{
  const calculator25=s.hardwareCounts.calculator>=25||s.telemetry.permanentEvents.some(event=>event.type==='hardware-milestone'&&event.details.id==='calculator'&&event.details.threshold===25);
  const met:Record<string,boolean>={'first-buy':s.lifetime.hardwareBought>0,'ten-calculators':s.hardwareCounts.calculator>=10,'discover-sbc':s.discovered.includes('sbc'),'first-level':s.level>=1,'first-research':s.lifetime.researchCompleted>0,'equip-item':Object.keys(s.equipped).length>0,'class-upgrade':calculator25,'first-prestige':s.prestigeCount>0};
  const completed=[...s.onboarding.completed];for(const step of onboardingSteps)if(met[step.id]&&!completed.includes(step.id))completed.push(step.id);
  return completed.length===s.onboarding.completed.length?s:{...s,onboarding:{...s.onboarding,completed}};
}
export function claimOnboarding(s:GameState,id:string):GameState{
  const index=onboardingSteps.findIndex(step=>step.id===id);if(index<0||!s.onboarding.completed.includes(id)||s.onboarding.claimed.includes(id))return s;
  let next={...s,onboarding:{...s.onboarding,claimed:[...s.onboarding.claimed,id]}};
  if(id==='equip-item')next=addEvent(grantComponents(next,{circuits:75}),'component-found',s.savedAt,{source:'onboarding',component:'circuits',amount:75});else if(BALANCE.introRewards[index])next=addMetrics(addCredits(next,BALANCE.introRewards[index],false),s.savedAt,{other:BALANCE.introRewards[index]});
  return next;
}
export const currentOnboarding=(s:GameState)=>onboardingSteps.find(step=>!s.onboarding.claimed.includes(step.id));
