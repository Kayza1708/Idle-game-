import {type GameState,type HardwareId,formatScientific} from './economy';
import {hardwareSavingsGoals} from './hardwareGoals';
import {hardwareText} from './i18n';
import {hardwareMilestoneText} from './workshopI18n';
export function HardwareSavingsGoals({s,open}:{s:GameState;open:(id:HardwareId)=>void}){
 const goals=hardwareSavingsGoals(s),de=s.settings.language==='de';
 return <section className="hardware-savings-goals" aria-label={de?'Sparziele':'Savings goals'}>{[goals.next,goals.milestone].map((quote,index)=>quote&&<article key={index}>
 <b>{index===0?(de?'Nächste Klasse':'Next class'):(de?'Nächster Meilenstein':'Next milestone')}</b>
 <button onClick={()=>open(quote.id)}>{hardwareText(quote.id,s.settings.language).name}{index===1&&goals.milestone?` ×${goals.milestone.milestone.threshold}`:''}</button>
 <p>{de?'Kosten':'Cost'}: {formatScientific(quote.cost,2,s.settings.numberFormat)} Credits</p>
 <p>{de?'Fehlmenge':'Missing'}: {formatScientific(quote.resources.missingExact,2,s.settings.numberFormat)} Credits</p>
 {quote.resources.secondsToAfford!==null&&<small>ETA: {Math.ceil(quote.resources.secondsToAfford/60)} {de?'Min.':'min'} · {de?'bei aktueller Produktion, ohne Käufe/Taps':'at current production, excluding purchases/taps'}</small>}
 {index===1&&goals.milestone&&<p>{hardwareMilestoneText(quote.id,goals.milestone.milestone.threshold,s.settings.language)}</p>}
 </article>)}</section>;
}
