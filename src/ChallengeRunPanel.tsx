import type {GameState} from './economy';
import {challengeText,runChallenges,runChallengeProgress,runChallengeReady} from './retention';

export const challengeUi=(language:GameState['settings']['language'])=>language==='de'?{
 legacyNotice:'Alter Challenge-Run beendet: Der vorhandene Fortschritt wurde erhalten. Ein historischer Hauptspielstand wurde damals nicht gespeichert und kann nicht wiederhergestellt werden.',
 passive:'Hauptspiel läuft passiv weiter',blocked:'Hauptspiel-Resets, Shop und Claims sind während einer Challenge deaktiviert.',
 abort:'Challenge abbrechen',confirm:'Challenge wirklich abbrechen? Du kehrst zum passiv fortgeschrittenen Hauptspiel zurück, ohne Erfolgsbelohnung.',
 complete:'Challenge abschließen',start:'Start mit 50 Credits und ohne Hardware.',reward:'Belohnung',once:'Sterne nur beim ersten Erfolg',
}: {
 legacyNotice:'Legacy challenge ended: existing saved progress was preserved. No historical main game was saved, so it cannot be restored.',
 passive:'Main game continues passively',blocked:'Main game resets, shop and claims are disabled during a challenge.',
 abort:'Abort challenge',confirm:'Really abort this challenge? Return to the passively advanced main game without a completion reward.',
 complete:'Complete challenge',start:'Start with 50 Credits and no hardware.',reward:'Reward',once:'Stars on first completion only',
};

export function ChallengeRunPanel({s,act}:{s:GameState;act:(name:string)=>void}){
 const run=s.retention.activeRun,challenge=runChallenges.find(c=>c.id===run?.id);
 if(!challenge)return null;
 const text=challengeText(challenge,s.settings.language),ui=challengeUi(s.settings.language);
 const rewarded=(s.challengeSession?.main.retention.runCompletions[challenge.id]??0)>0;
 return <section className="challenge-run-panel" aria-label={text.name}>
  <h2>{text.name}</h2><p>{text.description}</p><strong>{ui.passive}</strong>
  <p>{ui.start} · {runChallengeProgress(s)} / 1 INT</p>
  <p>{ui.reward}: ★ {rewarded?0:challenge.stars} · {ui.once}</p>
  <div><button disabled={!runChallengeReady(s)} onClick={()=>act('challenge-run-complete')}>{ui.complete}</button>
   <button onClick={()=>act('challenge-run-abort')}>{ui.abort}</button></div>
 </section>;
}
