import {BALANCE,dayKey,GameState,MissionPeriod,MissionTask,ProgressMetric,weekKey} from './economy';
import {addEvent} from './telemetry';
export type MissionKind='daily'|'weekly'|'monthly';
const monthKey=(ms:number)=>new Date(ms).toISOString().slice(0,7);
const dayEnd=(ms:number)=>{const d=new Date(ms);return Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate()+1)};
const weekEnd=(ms:number)=>{const d=new Date(ms),day=(d.getUTCDay()+6)%7;return Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate()-day+7)};
const monthEnd=(ms:number)=>{const d=new Date(ms);return Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+1,1)};
export const metricValue=(s:GameState,m:ProgressMetric)=>s.lifetime[m] as number;
type Template={id:string;metric:ProgressMetric;de:string;en:string;goals:[number,number,number];available:(s:GameState)=>boolean};
const templates:Template[]=[
 {id:'hardware',metric:'hardwareBought',de:'Hardware kaufen',en:'Buy hardware',goals:[5,40,180],available:()=>true},
 {id:'milestones',metric:'milestones',de:'Hardware-Meilensteine erreichen',en:'Reach hardware milestones',goals:[1,4,12],available:()=>true},
 {id:'train-start',metric:'trainingStarted',de:'Training starten',en:'Start training',goals:[1,5,18],available:()=>true},
 {id:'train-done',metric:'trainingCompleted',de:'Training abschließen',en:'Complete training',goals:[1,4,15],available:()=>true},
 {id:'research-start',metric:'researchStarted',de:'Forschung starten',en:'Start research',goals:[1,3,8],available:s=>s.discovered.includes('sbc')},
 {id:'research-done',metric:'researchCompleted',de:'Forschung abschließen',en:'Complete research',goals:[1,2,6],available:s=>s.discovered.includes('sbc')},
 {id:'components',metric:'componentsEarned',de:'Komponenten erhalten',en:'Gain components',goals:[10,60,200],available:s=>s.prestigeCount>0||s.experiments.firstReward},
 {id:'craft',metric:'itemsCrafted',de:'Item herstellen',en:'Craft an item',goals:[1,2,5],available:s=>s.blueprintFragments>0||s.lifetime.itemsCrafted>0},
 {id:'credits',metric:'regularCredits',de:'Credits regulär produzieren',en:'Produce regular credits',goals:[1000,100000,2000000],available:()=>true},
 {id:'data',metric:'regularData',de:'Daten regulär produzieren',en:'Produce regular data',goals:[50,1000,10000],available:()=>true},
 {id:'taps',metric:'taps',de:'Vergütete Taps ausführen (optional aktiv)',en:'Perform rewarded taps (optional active)',goals:[30,250,1000],available:()=>true},
 {id:'overclock',metric:'overclocks',de:'Overclock aktivieren (optional aktiv)',en:'Activate overclock (optional active)',goals:[1,4,12],available:()=>true},
 {id:'prestige',metric:'prestiges',de:'Prestige durchführen',en:'Perform prestige',goals:[0,1,2],available:s=>s.prestigeCount>0||s.lifetimeEligibleCredits>=1e8},
];
function makePeriod(s:GameState,kind:MissionKind,now:number):MissionPeriod{const index=kind==='daily'?0:kind==='weekly'?1:2,count=kind==='daily'?4:5,reward=BALANCE.missionRewards[kind],key=kind==='daily'?dayKey(now):kind==='weekly'?weekKey(now):monthKey(now),endsAt=kind==='daily'?dayEnd(now):kind==='weekly'?weekEnd(now):monthEnd(now);const passive=templates.filter(t=>t.available(s)&&!['taps','overclock','prestige'].includes(t.id)),optional=templates.filter(t=>t.available(s)&&['taps','overclock','prestige'].includes(t.id));const seed=[...key].reduce((n,c)=>n+c.charCodeAt(0),0),ordered=[...passive.slice(seed%passive.length),...passive.slice(0,seed%passive.length)],chosen=ordered.slice(0,count-1);if(optional.length)chosen.push(optional[seed%optional.length]);else chosen.push(ordered[count-1]);const tasks:MissionTask[]=chosen.map((t,i)=>({id:`${key}-${t.id}-${i}`,metric:t.metric,goal:t.goals[index],baseline:metricValue(s,t.metric),reward:reward.task,claimed:false,de:t.de,en:t.en}));return{key,endsAt,tasks,required:kind==='daily'?3:4,bonus:reward.bonus,bonusClaimed:false};}
const completed=(s:GameState,t:MissionTask)=>metricValue(s,t.metric)-t.baseline>=t.goal;
function settle(s:GameState,kind:MissionKind,p:MissionPeriod){const taskGems=p.tasks.filter(t=>completed(s,t)&&!t.claimed).reduce((n,t)=>n+t.reward,0),done=p.tasks.filter(t=>completed(s,t)).length,bonus=done>=p.required&&!p.bonusClaimed?p.bonus:0,total=taskGems+bonus;if(!total)return s;return{...s,gems:s.gems+total,gemLedger:[...s.gemLedger,{id:`mission-expiry-${kind}-${p.key}`,at:s.savedAt,amount:total,source:`mission-${kind}-expiry`}]};}
export function rollPeriods(s:GameState,now:number){let next=s;for(const kind of ['daily','weekly','monthly'] as MissionKind[]){let p=next.missions[kind],key=kind==='daily'?dayKey(now):kind==='weekly'?weekKey(now):monthKey(now);if(!p.tasks.length)p=makePeriod(next,kind,now);else if(p.key!==key){next=settle(next,kind,p);p=makePeriod(next,kind,now)}next={...next,missions:{...next.missions,[kind]:p}};}return next;}
export function addActive(s:GameState,seconds:number,now:number){s=rollPeriods(s,now);return{...s,lifetime:{...s.lifetime,activeSeconds:s.lifetime.activeSeconds+seconds}};}
export function claimMission(s:GameState,period:MissionKind,id:string){const p=s.missions[period],task=p.tasks.find(t=>t.id===id);if(!task||task.claimed||!completed(s,task))return s;const tasks=p.tasks.map(t=>t.id===id?{...t,claimed:true}:t),entry={id:`mission-${period}-${id}`,at:s.savedAt,amount:task.reward,source:`mission-${period}`};return addEvent({...s,gems:s.gems+task.reward,gemLedger:[...s.gemLedger,entry],missions:{...s.missions,[period]:{...p,tasks}}},'mission-claim',s.savedAt,{period,id,gems:task.reward});}
export function claimMissionBonus(s:GameState,period:MissionKind){const p=s.missions[period],done=p.tasks.filter(t=>completed(s,t)).length;if(p.bonusClaimed||done<p.required)return s;return addEvent({...s,gems:s.gems+p.bonus,gemLedger:[...s.gemLedger,{id:`mission-bonus-${period}-${p.key}`,at:s.savedAt,amount:p.bonus,source:`mission-${period}-bonus`}],missions:{...s.missions,[period]:{...p,bonusClaimed:true}}},'mission-claim',s.savedAt,{period,id:'bonus',gems:p.bonus});}
export function claimMailbox(s:GameState){return s;}
export const missionProgress=(s:GameState,t:MissionTask)=>Math.min(t.goal,Math.max(0,metricValue(s,t.metric)-t.baseline));
