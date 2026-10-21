using System;using System.Linq;
namespace IdleIntelligence.Core {
 [Serializable]public sealed class DiagnosticPhase {public string id;public long count;public DiagnosticPhase Copy()=>(DiagnosticPhase)MemberwiseClone();}
 [Serializable]public sealed class LocalDiagnostics {
  public int schema=1;public bool initialized=true,historicalUnavailable=true,hasTick,hasSave,hasLoad;public double since,lastSuccessfulTick,lastSuccessfulSave,lastSuccessfulLoad,lastSaveDurationMs,lastTickDurationMs,maxTickDurationMs;public long lastSaveBytes,ticks,discardedTicks,nonFiniteWarnings,longTicks,watchdogEvents,saveErrors,recoveries,simulationErrors;public string lastWarning="";public DiagnosticPhase[] researchCompletionPhases=Array.Empty<DiagnosticPhase>();
  public LocalDiagnostics Copy(){var n=(LocalDiagnostics)MemberwiseClone();n.researchCompletionPhases=researchCompletionPhases.Select(p=>p.Copy()).ToArray();return n;}
  public void Observe(double at){if(since==0&&historicalUnavailable)since=at;}
  public void Loaded(double at){Observe(at);hasLoad=true;lastSuccessfulLoad=at;}
  public void Tick(double at,double duration){Observe(at);hasTick=true;lastSuccessfulTick=at;ticks++;lastTickDurationMs=duration;maxTickDurationMs=Math.Max(maxTickDurationMs,duration);}
  public void Saved(double at,double duration,long bytes){Observe(at);hasSave=true;lastSuccessfulSave=at;lastSaveDurationMs=duration;lastSaveBytes=bytes;}
  public void Research(string phase,double amount){if(amount<=0)return;var old=researchCompletionPhases.FirstOrDefault(p=>p.id==phase);if(old==null){old=new DiagnosticPhase{id=phase};researchCompletionPhases=researchCompletionPhases.Concat(new[]{old}).ToArray();}old.count+=(long)amount;}
  public static void Validate(LocalDiagnostics d){if(d==null||!d.initialized||d.schema!=1||d.researchCompletionPhases==null||d.researchCompletionPhases.Length>100||d.researchCompletionPhases.Any(p=>p==null||string.IsNullOrEmpty(p.id)||p.id.Length>200||p.count<0)||d.lastWarning==null||d.lastWarning.Length>16000)throw new FormatException("Invalid local diagnostics");foreach(double value in new[]{d.since,d.lastSuccessfulTick,d.lastSuccessfulSave,d.lastSuccessfulLoad,d.lastSaveDurationMs,d.lastTickDurationMs,d.maxTickDurationMs})if(!ScientificNumber.Finite(value)||value<0)throw new FormatException("Invalid diagnostic measurement");foreach(long count in new[]{d.lastSaveBytes,d.ticks,d.discardedTicks,d.nonFiniteWarnings,d.longTicks,d.watchdogEvents,d.saveErrors,d.recoveries,d.simulationErrors})if(count<0)throw new FormatException("Invalid diagnostic counter");}
 }
}
