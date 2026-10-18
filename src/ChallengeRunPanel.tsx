import {challengeCompletionQuote,challengeGoalText,challengeRuleText} from './challengeStages';
import {formatScientific,BALANCE} from './economy';
import type {GameState} from './economy';
import {runChallenges,runChallengeReady} from './retention';

export const challengeUi=(language:GameState['settings']['language'])=>language==='de'?{
 legacyNotice:'Alter Challenge-Run beendet: Der vorhandene Fortschritt wurde erhalten. Ein historischer Hauptspielstand wurde damals nicht gespeichert und kann nicht wiederhergestellt werden.',
 passive:'Hauptspiel läuft passiv weiter',blocked:'Axiom-Reset, Shop und Claims sind während einer Challenge deaktiviert.',
 abort:'Challenge abbrechen',confirm:'Challenge wirklich abbrechen? Du kehrst zum passiv fortgeschrittenen Hauptspiel zurück, ohne Erfolgsbelohnung.',
 complete:'Challenge abschließen',start:'Start mit 50 Credits und ohne Hardware.',reward:'Belohnung',once:'Sterne nur beim ersten Abschluss dieser Stufe',
}: {
 legacyNotice:'Legacy challenge ended: existing saved progress was preserved. No historical main game was saved, so it cannot be restored.',
 passive:'Main game continues passively',blocked:'Axiom reset, shop and claims are disabled during a challenge.',
 abort:'Abort challenge',confirm:'Really abort this challenge? Return to the passively advanced main game without a completion reward.',
 complete:'Complete challenge',start:'Start with 50 Credits and no hardware.',reward:'Reward',once:'Stars only on first completion of this stage',
};

export function ChallengeRunPanel({s,act}:{s:GameState;act:(name:string)=>void}){
 const run=s.retention.activeRun,challenge=runChallenges.find(c=>c.id===run?.id);
 if(!challenge)return null;
 const text={name:challenge.name,description:s.settings.language==='de'?'Die angezeigten Regeln und Ziele bleiben für diesen Run fest.':'The displayed rules and targets remain fixed for this run.'},ui=challengeUi(s.settings.language);
 const quote=challengeCompletionQuote(s);const rewarded=(s.challengeSession?.main.challengeStages[challenge.id]??0)>=(run?.stage??1);
 return <section className="challenge-run-panel" aria-label={text.name}>
  <h2>{text.name}</h2><p>{text.description}</p><strong>{ui.passive}</strong>
  <p>{ui.start} · {s.settings.language==='de'?'Stufe':'Stage'} {run?.stage??1}/69</p><ul>{quote.goals.map(goal=><li key={goal.id}>{challengeGoalText(goal.id,s.settings.language==='de')}: {formatScientific(goal.value,4)} / {formatScientific(goal.target,4)} {goal.reached?'✓':'○'}</li>)}</ul>
  <p>{run?.catalogVersion===2?(s.settings.language==='de'?'Challenge-Vertrag v2':'Challenge contract v2'):(s.settings.language==='de'?'Bestehender Challenge-Vertrag bleibt erhalten':'Existing challenge contract is preserved')}</p>{run?.networkLinks&&<p>{run.networkLinks.map(id=>BALANCE.hardware[id].name).join(', ')}</p>}
  <ul>{quote.catalog&&challengeRuleText(quote.catalog,s.settings.language==='de').map(rule=><li key={rule}>{rule}</li>)}</ul><p>{ui.reward}: ★ {rewarded?0:challenge.stars} · {ui.once}</p>
  <div><button disabled={!runChallengeReady(s)} onClick={()=>act('challenge-run-complete')}>{ui.complete}</button>
   <button onClick={()=>act('challenge-run-abort')}>{ui.abort}</button></div>
 </section>;
}
