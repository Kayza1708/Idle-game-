using System;using System.Linq;
namespace IdleIntelligence.Core {
 [Serializable]public sealed class CrashMark {public double at,durationMs;public string name,phase,result,runId,sessionId;public long size;}
 [Serializable]public sealed class CrashFailure {public double at;public string kind,message,stack;}
 [Serializable]public sealed class CrashVisibility {public double at;public string state;}
 [Serializable]public sealed class CrashSession {
  public int version=1;public string sessionId,runId,userAgent;public double sessionStartedAt,sessionEndedAt,lastUiHeartbeat;public bool cleanExit,hasEnd,hasHeartbeat;public long renderCount;public CrashVisibility[] visibility=Array.Empty<CrashVisibility>();public CrashMark[] holds=Array.Empty<CrashMark>(),actions=Array.Empty<CrashMark>(),ticks=Array.Empty<CrashMark>(),saves=Array.Empty<CrashMark>();public CrashFailure[] failures=Array.Empty<CrashFailure>();
 }
 public sealed class CrashLedger {
  readonly Action<CrashSession> persist;public CrashSession Current{get;private set;}
  public CrashLedger(double at,string session,string run,string platform,Action<CrashSession> write){persist=write;Current=new CrashSession{sessionId=session,runId=run,userAgent=platform,sessionStartedAt=at};Write();}
  void Write(){try{persist?.Invoke(Current);}catch{/* Diagnostic failures cannot change gameplay. */}}
  static T[] Cap<T>(T[] entries,T entry,int limit)=>entries.Concat(new[]{entry}).TakeLast(limit).ToArray();
  void Mark(string target,CrashMark mark){switch(target){case "actions":Current.actions=Cap(Current.actions,mark,100);break;case "ticks":Current.ticks=Cap(Current.ticks,mark,20);break;case "saves":Current.saves=Cap(Current.saves,mark,20);break;case "holds":Current.holds=Cap(Current.holds,mark,20);break;default:throw new ArgumentException(nameof(target));}Write();}
  double lastTap=-1;
  public double Begin(string target,string name,double at,string run){if(target=="actions"&&name=="tap"&&lastTap>=0&&at-lastTap<1000)return -1;if(name=="tap")lastTap=at;Current.runId=run;Mark(target,new CrashMark{at=at,name=name,phase="begin",runId=run,sessionId=Current.sessionId});return at;}
  public void End(string target,string name,double started,double at,double duration,string result="ok",long size=0){if(started<0)return;Mark(target,new CrashMark{at=at,name=name,phase="end",durationMs=Math.Max(0,duration),result=result,size=size,runId=Current.runId,sessionId=Current.sessionId});}
  public void Failure(string kind,string message,string stack,double at){Current.failures=Cap(Current.failures,new CrashFailure{at=at,kind=kind,message=(message??"").Substring(0,Math.Min(500,(message??"").Length)),stack=(stack??"").Substring(0,Math.Min(4000,(stack??"").Length))},20);Write();}
  public void Heartbeat(double at,long renders){Current.hasHeartbeat=true;Current.lastUiHeartbeat=at;Current.renderCount=renders;Write();}
  public void Visibility(string state,double at){Current.visibility=Cap(Current.visibility,new CrashVisibility{at=at,state=state},20);Write();}
  public void SetRunId(string id){Current.runId=id;Write();}
  public void CleanExit(double at){Current.cleanExit=true;Current.hasEnd=true;Current.sessionEndedAt=at;Write();}
 }
}
