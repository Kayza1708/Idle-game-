using System;
using System.IO;
using System.Text;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using UnityEngine;
using UnityEngine.Profiling;
using Unity.Profiling;
using Unity.Profiling.LowLevel.Unsafe;
using IdleIntelligence.Core;
namespace IdleIntelligence.Runtime
{
    public static class PerformanceMarkers
    {
        public static readonly ProfilerMarker Tick=new ProfilerMarker("Idle.Tick"), Refresh=new ProfilerMarker("Idle.UIRefresh"), Save=new ProfilerMarker("Idle.AtomicSave"), Localize=new ProfilerMarker("Idle.LocalizeScan"), Diagnostic=new ProfilerMarker("Idle.DiagnosticWrite");
        public static long UiNodes;
        public sealed class SavePhases:IAtomicSaveProfiling { readonly Dictionary<string,ProfilerMarker> markers=new Dictionary<string,ProfilerMarker>();public IDisposable Phase(string name){if(!markers.TryGetValue(name,out var marker))markers[name]=marker=new ProfilerMarker("Idle.Save."+name);return marker.Auto();} }
    }
    // Opt-in development measurement, isolated save. No production telemetry or SDK.
    public sealed class PerformanceCapture:MonoBehaviour
    {
#if UNITY_EDITOR || DEVELOPMENT_BUILD
        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.BeforeSceneLoad)] static void Boot()
        {
            var tag=Environment.GetEnvironmentVariable("IDLE_PROFILE");
            if(string.IsNullOrEmpty(tag))return;
            GameRuntime.SavePathOverride=Path.Combine(Application.temporaryCachePath,"profile-"+tag+"-"+Guid.NewGuid().ToString("N")+".json");
            var go=new GameObject("IsolatedPerformanceCapture");DontDestroyOnLoad(go);go.AddComponent<PerformanceCapture>();
        }
        struct Sample {public string phase;public double elapsed,cpu,gpu;public long gc,heap,ui,tick,refresh,save,scan,diagnostic,layout,batch;}
        readonly List<Sample> samples=new List<Sample>(5000);
        readonly Dictionary<string,ProfilerRecorder> counters=new Dictionary<string,ProfilerRecorder>();
        string phase="warmup",folder;bool recording;GameRuntime game;readonly FrameTiming[] timing=new FrameTiming[1];
        long Read(string name)=>counters.TryGetValue(name,out var r)&&r.Valid?r.LastValue:0;
        IEnumerator Start()
        {
            folder=Path.Combine(Application.temporaryCachePath,"idle-profile-"+Environment.GetEnvironmentVariable("IDLE_PROFILE"));Directory.CreateDirectory(folder);
            while((game=FindFirstObjectByType<GameRuntime>())==null||game.State==null)yield return null;game.Storage.Profiling=new PerformanceMarkers.SavePhases();
            game.Act(s=>{var n=s.Copy();n.Legacy.prepared=true;n.Retention.aiName="AURA";n.Story.enabled=false;n.Story.open=null;n.Story.queue=Array.Empty<string>();n.Story.seen=NarrativeCatalog.Dialogues.Select(d=>d.Id).ToArray();n.Story.tutorial="skipped";n.Credits=ScientificNumber.From(1e8);n.Data=ScientificNumber.From(1e6);n.Hardware[0]=10;return n;});
            var handles=new List<ProfilerRecorderHandle>();ProfilerRecorderHandle.GetAvailable(handles);
            var available=handles.Select(ProfilerRecorderHandle.GetDescription).ToArray();File.WriteAllLines(Path.Combine(folder,"available-counters.txt"),available.Select(d=>d.Category.Name+" | "+d.Name));
            string[] names={"Main Thread","GC Allocated In Frame","GC Used Memory","Idle.Tick","Idle.UIRefresh","Idle.AtomicSave","Idle.LocalizeScan","Idle.DiagnosticWrite","Layout","Canvas.BuildBatch"};
            foreach(var name in names){var match=available.FirstOrDefault(d=>d.Name==name);if(match.Name==name)counters.Add(name,ProfilerRecorder.StartNew(match.Category,name,1));}
            Profiler.logFile=Path.Combine(folder,"unity-profiler.raw");Profiler.enableBinaryLog=true;Profiler.enabled=true;
            foreach(var tab in new[]{"hardware","training","research"})
            {
                game.Show(tab);phase=tab+"-warmup";yield return new WaitForSecondsRealtime(2);
                phase=tab;recording=true;yield return new WaitForSecondsRealtime(10);recording=false;
            }
            // Additional after-only input stress; kept separate from the matched three-view baseline.
            game.Act(s=>NarrativeBridge.Action(s,"skip"));game.Show("hardware");phase="input-warmup";yield return new WaitForSecondsRealtime(2);
            phase="taps";recording=true;for(int i=0;i<30;i++){game.TapButton.onClick.Invoke();yield return new WaitForSecondsRealtime(.34f);}recording=false;
            phase="purchases";recording=true;for(int i=0;i<20;i++){GameObject.Find("hardware-calculator").GetComponent<ActionCard>().Button.onClick.Invoke();yield return new WaitForSecondsRealtime(.5f);}recording=false;
            Profiler.enabled=false;Profiler.enableBinaryLog=false;
            var text=new StringBuilder("phase,frameMs,cpuNs,gpuMs,gcBytes,heapBytes,uiNodes,tickNs,refreshNs,saveNs,scanNs,diagnosticNs,layoutNs,batchNs\n");
            foreach(var s in samples)text.AppendFormat(System.Globalization.CultureInfo.InvariantCulture,"{0},{1:F4},{2:F0},{3:F4},{4},{5},{6},{7},{8},{9},{10},{11},{12},{13}\n",s.phase,s.elapsed,s.cpu,s.gpu,s.gc,s.heap,s.ui,s.tick,s.refresh,s.save,s.scan,s.diagnostic,s.layout,s.batch);
            File.WriteAllText(Path.Combine(folder,"frames.csv"),text.ToString());File.WriteAllText(Path.Combine(folder,"environment.txt"),Application.unityVersion+"\n"+Application.platform+"\n"+SystemInfo.operatingSystem+"\n"+SystemInfo.graphicsDeviceName+"\nresolution="+Screen.width+"x"+Screen.height+"\ntargetFrameRate="+Application.targetFrameRate+"\nPREPARED ISOLATED SAVE; actual domain and atomic save paths. GPU 0 means unavailable, not zero cost.\n");
            foreach(var r in counters.Values)r.Dispose();counters.Clear();Debug.Log("IDLE_PROFILE_COMPLETE "+folder);
        }
        void LateUpdate()
        {
            if(!recording)return;FrameTimingManager.CaptureFrameTimings();double gpu=FrameTimingManager.GetLatestTimings(1,timing)>0?timing[0].gpuFrameTime:0;
            samples.Add(new Sample{phase=phase,elapsed=Time.unscaledDeltaTime*1000,cpu=Read("Main Thread"),gpu=gpu,gc=Read("GC Allocated In Frame"),heap=Read("GC Used Memory"),ui=PerformanceMarkers.UiNodes,tick=Read("Idle.Tick"),refresh=Read("Idle.UIRefresh"),save=Read("Idle.AtomicSave"),scan=Read("Idle.LocalizeScan"),diagnostic=Read("Idle.DiagnosticWrite"),layout=Read("Layout"),batch=Read("Canvas.BuildBatch")});
        }
#endif
    }
}
