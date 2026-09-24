import { BALANCE, GameState, addCredits } from './economy';

export const onboardingSteps=[
  {id:'first-buy',title:'Erste Erweiterung',text:'Kaufe deine erste Hardware.',reward:'25 Credits'},
  {id:'ten-calculators',title:'Rechenkollektiv',text:'Besitze 10 Taschenrechner.',reward:'60 Credits'},
  {id:'discover-sbc',title:'Neue Architektur',text:'Entdecke den Einplatinencomputer.',reward:'120 Credits'},
  {id:'first-level',title:'Lernendes Modell',text:'Erreiche Modelllevel 1.',reward:'100 Credits'},
  {id:'intro-experiment',title:'Forschung beginnt',text:'Schließe das Einführungsexperiment ab.',reward:'Common-Item'},
  {id:'equip-item',title:'Labor ausrüsten',text:'Rüste ein Item aus.',reward:'75 Komponenten'},
  {id:'class-upgrade',title:'Spezialisierte Hardware',text:'Kaufe ein Klassen-Upgrade.',reward:'250 Credits'},
  {id:'first-prestige',title:'Neustart des Labors',text:'Führe den ersten Prestige durch.',reward:'Abgeschlossen'},
] as const;

export function updateOnboarding(s:GameState):GameState{
  const met:Record<string,boolean>={'first-buy':s.missions.daily.hardware>0,'ten-calculators':s.hardwareCounts.calculator>=10,'discover-sbc':s.discovered.includes('sbc'),'first-level':s.level>=1,'intro-experiment':s.experiments.completedIds.includes('intro'),'equip-item':Object.keys(s.equipped).length>0,'class-upgrade':s.classUpgrades.length>0,'first-prestige':s.prestigeCount>0};
  const completed=[...s.onboarding.completed];for(const step of onboardingSteps)if(met[step.id]&&!completed.includes(step.id))completed.push(step.id);
  return completed.length===s.onboarding.completed.length?s:{...s,onboarding:{...s.onboarding,completed}};
}
export function claimOnboarding(s:GameState,id:string):GameState{
  const index=onboardingSteps.findIndex(step=>step.id===id);if(index<0||!s.onboarding.completed.includes(id)||s.onboarding.claimed.includes(id))return s;
  let next={...s,onboarding:{...s.onboarding,claimed:[...s.onboarding.claimed,id]}};
  if(id==='equip-item')next={...next,components:next.components+75};else if(BALANCE.introRewards[index])next=addCredits(next,BALANCE.introRewards[index],false);
  return next;
}
export const currentOnboarding=(s:GameState)=>onboardingSteps.find(step=>!s.onboarding.claimed.includes(step.id));
