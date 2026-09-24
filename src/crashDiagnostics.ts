export const CRASH_DIAGNOSTICS_KEY='ai-singularity.crash-diagnostics-v1';
export const CRASH_PREVIOUS_KEY='ai-singularity.crash-diagnostics-v1.previous';
export type CrashCause='unhandled-exception'|'slow-simulation-tick'|'long-save'|'ui-heartbeat-missed'|'save-failed'|'unexpected-session-end'|'unknown';
type Mark={at:number;name:string;phase:'begin'|'end';durationMs?:number;result?:string;size?:number;runId?:string;sessionId:string};
type Failure={at:number;kind:CrashCause;message:string;stack?:string};
export type CrashDiagnostics={version:1;sessionId:string;runId:string|null;sessionStartedAt:number;sessionEndedAt:number|null;cleanExit:boolean;lastUiHeartbeat:number|null;renderCount:number;actions:Mark[];ticks:Mark[];saves:Mark[];failures:Failure[];longTasks:{at:number;durationMs:number}[];telemetry:{events:number;snapshots:number;saveBytes:number;storageSizes?:unknown} | null;userAgent:string|null};
const cap=<T,>(items:T[],limit:number)=>items.slice(-limit);
const fallback=():CrashDiagnostics=>({version:1,sessionId:`session-${Date.now().toString(36)}`,runId:null,sessionStartedAt:Date.now(),sessionEndedAt:null,cleanExit:false,lastUiHeartbeat:null,renderCount:0,actions:[],ticks:[],saves:[],failures:[],longTasks:[],telemetry:null,userAgent:typeof navigator==='undefined'?null:navigator.userAgent});
const safeParse=(raw:string|null)=>{try{if(!raw)return null;const x=JSON.parse(raw) as CrashDiagnostics;return x?.version===1&&Array.isArray(x.actions)&&Array.isArray(x.failures)?x:null}catch{return null}};
export class CrashRecorder{
 private state:CrashDiagnostics; private previous:CrashDiagnostics|null; readonly previousUnexpected:boolean; private lastTap=0;
 constructor(private storage:Pick<Storage,'getItem'|'setItem'>|undefined,runId:string|null){let previous:CrashDiagnostics|null=null,archived:CrashDiagnostics|null=null;try{previous=safeParse(storage?.getItem(CRASH_DIAGNOSTICS_KEY)??null);archived=safeParse(storage?.getItem(CRASH_PREVIOUS_KEY)??null)}catch{/* Diagnostics must never affect the game. */}this.previousUnexpected=!!previous&&!previous.cleanExit;if(this.previousUnexpected&&previous){previous={...previous,failures:cap([...previous.failures,{at:Date.now(),kind:'unexpected-session-end',message:'Die vorige Sitzung besaß keinen Abschlussmarker; die konkrete Ursache ist unbekannt.'}],20)};try{if(!archived)this.storage?.setItem(CRASH_PREVIOUS_KEY,JSON.stringify(previous))}catch{/* best effort */}}this.previous=archived??previous;this.state={...fallback(),runId};this.write();}
 private write(){try{this.storage?.setItem(CRASH_DIAGNOSTICS_KEY,JSON.stringify(this.state))}catch{/* A full/quarantined storage must not crash the game. */}}
 private mark(target:'actions'|'ticks'|'saves',mark:Mark){this.state={...this.state,[target]:cap([...this.state[target],mark],target==='actions'?100:20)};this.write();}
 begin(target:'actions'|'ticks'|'saves',name:string,runId=this.state.runId){const at=Date.now();if(target==='actions'&&name==='tap'&&at-this.lastTap<1000)return 0;if(name==='tap')this.lastTap=at;this.mark(target,{at,name,phase:'begin',runId:runId??undefined,sessionId:this.state.sessionId});return at;}
 end(target:'actions'|'ticks'|'saves',name:string,started:number,result='ok',size?:number,durationMs?:number){if(!started)return;this.mark(target,{at:Date.now(),name,phase:'end',durationMs:durationMs??Math.max(0,Date.now()-started),result,size,runId:this.state.runId??undefined,sessionId:this.state.sessionId});}
 failure(kind:CrashCause,error:unknown){try{const e=error instanceof Error?error:new Error(String(error));this.state={...this.state,failures:cap([...this.state.failures,{at:Date.now(),kind,message:e.message.slice(0,500),stack:e.stack?.slice(0,4000)}],20)};this.write()}catch{/* never throw from diagnostics */}}
 heartbeat(renderCount:number){this.state={...this.state,lastUiHeartbeat:Date.now(),renderCount};this.write()}
 setRunId(runId:string){if(this.state.runId===runId)return;this.state={...this.state,runId};this.write()}
 longTask(durationMs:number){this.state={...this.state,longTasks:cap([...this.state.longTasks,{at:Date.now(),durationMs}],20)};this.write()}
 counts(events:number,snapshots:number,saveBytes:number,storageSizes?:unknown){this.state={...this.state,telemetry:{events,snapshots,saveBytes,storageSizes}};this.write()}
 cleanExit(){this.state={...this.state,cleanExit:true,sessionEndedAt:Date.now()};this.write()}
 report(){return JSON.parse(JSON.stringify(this.state)) as CrashDiagnostics}
 private downloadReport(report:CrashDiagnostics){try{const blob=new Blob([JSON.stringify(report,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`ai-singularity-crash-${new Date().toISOString().replace(/[:.]/g,'-')}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),0)}catch(error){this.failure('unknown',error)}}
 download(){this.downloadReport(this.report())}
 downloadPrevious(){this.downloadReport(this.previous??this.report())}
}

export function createHeartbeatWorker(onStall:(durationMs:number)=>void){if(typeof Worker==='undefined')return()=>{};try{const source=`let last=Date.now();setInterval(()=>{postMessage({type:'ping',at:Date.now(),gap:Date.now()-last})},250);onmessage=e=>{if(e.data==='pong')last=Date.now()}`;const url=URL.createObjectURL(new Blob([source],{type:'text/javascript'})),worker=new Worker(url);worker.onmessage=event=>{const gap=Number(event.data?.gap??0);worker.postMessage('pong');if(gap>1500)onStall(gap)};return()=>{worker.terminate();URL.revokeObjectURL(url)}}catch{return()=>{}}}
