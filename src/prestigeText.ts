import type {Language} from './i18n';
import type {runStartContract} from './economy';
import type {prestigeAgentStatus} from './prestige';

export const runStartText=(start:ReturnType<typeof runStartContract>,language:Language)=>language==='de'?`Neustart mit ${start.credits} Credits und ohne Hardware.`:`Restart with ${start.credits} credits and no hardware.`;
export const automaticRestartText=(available:boolean,language:Language)=>available?(language==='de'?'Automatischer Neustart bereit':'Automatic restart ready'):(language==='de'?'Automatischer Neustart benötigt einen aktivierten Einkaufsagenten':'Automatic restart requires an enabled shopping agent');
export function prestigeAgentReasonText(reason:ReturnType<typeof prestigeAgentStatus>,language:Language){
 const text=language==='de'?{locked:'Nicht freigeschaltet',disabled:'Deaktiviert','restart-unavailable':automaticRestartText(false,language),'insufficient-int':'Mindest-INT nicht erreicht','minimum-runtime':'Mindestlaufzeit nicht erreicht','training-active':'Wartet auf Training','analysis-active':'Wartet auf Analyse',ready:'Bereit'}:{locked:'Locked',disabled:'Disabled','restart-unavailable':automaticRestartText(false,language),'insufficient-int':'Minimum INT not met','minimum-runtime':'Minimum run time not met','training-active':'Waiting for training','analysis-active':'Waiting for analysis',ready:'Ready'};
 return text[reason];
}
