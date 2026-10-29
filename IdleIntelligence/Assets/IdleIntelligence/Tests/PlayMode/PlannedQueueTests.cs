using System;
using System.IO;
using System.Linq;
using System.Collections;
using IdleIntelligence.Core;
using IdleIntelligence.Runtime;
using NUnit.Framework;
using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.TestTools;
namespace IdleIntelligence.PlayTests
{
    public sealed class PlannedQueueTests
    {
        GameRuntime game;string directory;
        [UnitySetUp]public IEnumerator Setup(){
#if UNITY_EDITOR
            PortraitGameView.Set(390,846);
#endif
            directory=Path.Combine(Path.GetTempPath(),"idle-planned-queue-"+Guid.NewGuid());Directory.CreateDirectory(directory);GameRuntime.SavePathOverride=Path.Combine(directory,"save.json");yield return SceneManager.LoadSceneAsync("IdleIntelligence");yield return null;game=UnityEngine.Object.FindFirstObjectByType<GameRuntime>();game.Act(s=>NarrativeBridge.Action(s,"name","AURA"));game.Act(s=>NarrativeBridge.Action(s,"skip-tutorial"));game.Act(s=>{var n=s.Copy();n.Story.enabled=false;n.Story.open=null;n.Story.queue=Array.Empty<string>();return n;});
        }
        [UnityTearDown]public IEnumerator Cleanup(){if(game!=null)UnityEngine.Object.Destroy(game.gameObject);yield return null;GameRuntime.SavePathOverride=null;if(Directory.Exists(directory))Directory.Delete(directory,true);}
        void Prepare()
        {
            Debug.Log("PREPARED_QUEUE_UI: isolated funded save; real paid starts, extended work and prepared 25% progress for stable layout review; not natural progress or V3 migration proof.");
            game.Act(s=>{
                var n=s.Copy();n.Legacy.prepared=true;n.Story.open=null;n.Story.queue=Array.Empty<string>();n.Story.seen=NarrativeCatalog.Dialogues.Select(d=>d.Id).ToArray();n.Story.tutorial="skipped";n.Story.target=null;n.Credits=n.Data=ScientificNumber.From(1e12);n.Workshop.nodes=new[]{"T03","F01","F04","F02"};for(int i=0;i<n.Research.Length;i++)n.Research[i]=Balance.Research[i].Project?1:5;
                n=Game.Train(n,"quality");Assert.That(n.Training,Is.Not.Null);n.Training.required=36000;n.Training.done=9000;
                foreach(string id in new[]{"dataGeneration","computeOptimization","userScaling"}){n=Game.Research(n,id);var job=PrestigeAutomation.ResearchJobs(n).FirstOrDefault(j=>j.id==id);Assert.That(job,Is.Not.Null,id);job.required=36000;job.done=9000;}
                n=PrestigeAutomation.QueueTraining(n,"quality");n=PrestigeAutomation.QueueTraining(n,"efficiency");foreach(string id in new[]{"modelArchitecture","syntheticData","hardwareIntegration","parallelArchitecture","networkEffects","hardwareCoDesign","dataFlywheel","recursiveLearning"})n=PrestigeAutomation.QueueResearch(n,id);
                n.Credits=n.Data=ScientificNumber.Zero;return n;
            });
            Assert.That(game.State.Prestige.trainingQueue.Length,Is.EqualTo(2));Assert.That(game.State.Prestige.researchQueue.Length,Is.EqualTo(8));Assert.That(game.Writable,Is.True,game.Status.text);
        }
        [UnityTest]public IEnumerator RealQueueCardsMoveRemoveSaveAndReloadWithoutPaymentOrRebuild()
        {
            Prepare();game.Show("training");yield return null;yield return null;var root=game.Content.Find("UnpaidQueues");Assert.That(root,Is.Not.Null);var card=root.Find("PlanScroll/Viewport/Content/PlanCard0");Assert.That(card,Is.Not.Null);int instance=card.GetInstanceID();
            var later=card.Find("PlanOrder/Later").GetComponent<UnityEngine.UI.Button>();Assert.That(later.interactable,Is.True);later.onClick.Invoke();Assert.That(game.State.Prestige.trainingQueue[0].track,Is.EqualTo("efficiency"));Assert.That(game.State.Credits.IsZero,Is.True);Assert.That(game.State.Data.IsZero,Is.True);
            yield return new WaitForSecondsRealtime(.6f);Assert.That(root.Find("PlanScroll/Viewport/Content/PlanCard0").GetInstanceID(),Is.EqualTo(instance));Assert.That(card.Find("PaymentAtStart").GetComponent<UnityEngine.UI.Text>().text,Is.EqualTo("Zahlung bei Start"));
            var loaded=new AtomicSaveStore(game.SavePath,new UnitySaveCodec()).Load(game.State.SavedAt);Assert.That(loaded.Writable,Is.True,loaded.Message);Assert.That(loaded.State.Prestige.trainingQueue[0].track,Is.EqualTo("efficiency"));
            card.Find("PlanOrder/Remove").GetComponent<UnityEngine.UI.Button>().onClick.Invoke();Assert.That(game.State.Prestige.trainingQueue.Length,Is.EqualTo(1));Assert.That(game.State.Credits.IsZero,Is.True);
            yield return SceneManager.LoadSceneAsync("IdleIntelligence");yield return null;game=UnityEngine.Object.FindFirstObjectByType<GameRuntime>();Assert.That(game.State.Prestige.trainingQueue.Length,Is.EqualTo(1));Assert.That(game.State.Training,Is.Not.Null);
        }
        [UnityTest]public IEnumerator ActualAutopilotFieldsPersistAndExplainV3AtMobileSizes()
        {
            game.Act(s=>{var n=s.Copy();n.Legacy.prepared=true;n.Quality=5;n.Efficiency=5;n.Prestige.Cycle=n.Prestige.Free=n.Prestige.Total=n.Prestige.Entitlement=ScientificNumber.From(1e6);foreach(string id in new[]{"T03","T04","T06"})n=PrestigeRules.Buy(n,id);return n;});Assert.That(game.Writable,Is.True,game.Status.text);Assert.That(game.State.Workshop.nodes,Does.Contain("T06"));game.Show("prestige");yield return null;var network=game.PrestigeView;Assert.That(network,Is.Not.Null);network.OpenNode("T06");yield return null;
            var field=GameObject.Find("TrainingTarget2").GetComponent<UnityEngine.UI.InputField>();field.text="2";field.onEndEdit.Invoke("2");yield return null;Assert.That(game.State.Prestige.trainingTargets[2],Is.EqualTo(2));var saved=new AtomicSaveStore(game.SavePath,new UnitySaveCodec()).Load(game.State.SavedAt);Assert.That(saved.Writable,Is.True);Assert.That(saved.State.Prestige.trainingTargets[2],Is.EqualTo(2));Assert.That(saved.State.ItemSystemV3,Is.Null);
            Debug.Log("PREPARED_T06_UI: isolated normal target edit/reload tested; V3 flags below are an in-memory read-only presentation fixture, not migrated or persisted V3 save proof.");var startedField=typeof(GameRuntime).GetField("started",System.Reflection.BindingFlags.Instance|System.Reflection.BindingFlags.NonPublic);Assert.That(startedField,Is.Not.Null);bool wasStarted=(bool)startedField.GetValue(game);game.enabled=false;startedField.SetValue(game,false);string output="/tmp/idle-v3-training-target-review";Directory.CreateDirectory(output);
            try{
                game.State.ItemSystemV3=new ItemV3State();foreach(string locale in SettingsCatalog.Languages){game.State.ItemSystemV3=null;startedField.SetValue(game,wasStarted);Assert.That(game.Act(s=>SettingsRules.Change(s,"language",locale)),Is.True,"actual locale action");startedField.SetValue(game,false);game.State.ItemSystemV3=new ItemV3State();network.OpenNode("T06");yield return null;game.FlushLocalization();foreach(int width in locale=="de"||locale=="en"?new[]{320,390,430}:new[]{390}){
#if UNITY_EDITOR
                    PortraitGameView.Set(width,width==320?694:width==390?846:932);
#endif
                    yield return null;yield return null;Canvas.ForceUpdateCanvases();var scroll=GameObject.Find("INTDetails").GetComponentInChildren<UnityEngine.UI.ScrollRect>();scroll.StopMovement();scroll.verticalNormalizedPosition=0;yield return null;yield return null;Canvas.ForceUpdateCanvases();scroll.verticalNormalizedPosition=0;yield return null;yield return null;Canvas.ForceUpdateCanvases();Assert.That(Screen.width,Is.EqualTo(width));for(int i=0;i<3;i++){var input=GameObject.Find("TrainingTarget"+i).GetComponent<UnityEngine.UI.InputField>();Assert.That(((RectTransform)input.transform).rect.height,Is.GreaterThanOrEqualTo(44));var bounds=RectTransformUtility.CalculateRelativeRectTransformBounds(scroll.viewport,input.transform);Assert.That(bounds.min.y,Is.GreaterThanOrEqualTo(scroll.viewport.rect.yMin-.5f),locale+" visible input "+i);Assert.That(bounds.max.y,Is.LessThanOrEqualTo(scroll.viewport.rect.yMax+.5f),locale+" visible input top "+i);var title=GameObject.Find("TrainingTarget"+i+"Title").GetComponent<UnityEngine.UI.Text>();Assert.That(title.preferredHeight,Is.LessThanOrEqualTo(title.rectTransform.rect.height+1),locale+" title "+i);}
                    Assert.That(GameObject.Find("TrainingTarget2Title").GetComponent<UnityEngine.UI.Text>().text,Is.EqualTo(PrestigeSettings.TrainingTargetLabel(game.State,2)));WorkshopTests.Capture(width,Screen.height,output+"/T06-"+locale+"-"+width+".png");
                }}
            }finally{game.State.ItemSystemV3=null;game.State.Settings.language="de";startedField.SetValue(game,wasStarted);game.enabled=true;network.CloseDetail();}
            Assert.That(new AtomicSaveStore(game.SavePath,new UnitySaveCodec()).Load(game.State.SavedAt).State.ItemSystemV3,Is.Null);
        }
        [UnityTest]public IEnumerator C01DescriptionUsesActualLocalizedV3ValuesAtMobileSizes()
        {
            game.Act(s=>{var n=s.Copy();n.Legacy.prepared=true;n.Meta.resets=1;n.Meta.total=n.Meta.available=ScientificNumber.From(10).ToData();return MetaRules.Buy(n,"C01");});Assert.That(game.Writable,Is.True,game.Status.text);Assert.That(MetaRules.Level(game.State,"C01"),Is.EqualTo(1));game.Show("prestige");yield return null;var network=game.PrestigeView;network.SetLayer(true);yield return null;
            var lifecycle=typeof(GameRuntime).GetField("started",System.Reflection.BindingFlags.Instance|System.Reflection.BindingFlags.NonPublic);Assert.That(lifecycle,Is.Not.Null);bool started=(bool)lifecycle.GetValue(game);game.enabled=false;lifecycle.SetValue(game,false);const string output="/tmp/idle-v3-C01-review";Directory.CreateDirectory(output);
            Debug.Log("PREPARED_C01_UI: isolated funded normal Axiom purchase; V3 flag only in-memory, lifecycle suspended, no V3 save migration claimed.");
            try{game.State.ItemSystemV3=new ItemV3State{axiomDiscovered=true,axiomDiscoveryAt=1000};foreach(string locale in SettingsCatalog.Languages){game.State.ItemSystemV3=null;lifecycle.SetValue(game,started);Assert.That(game.Act(s=>SettingsRules.Change(s,"language",locale)),Is.True,"actual locale action");lifecycle.SetValue(game,false);game.State.ItemSystemV3=new ItemV3State{axiomDiscovered=true,axiomDiscoveryAt=1000};network.OpenNode("C01");yield return null;game.FlushLocalization();foreach(int width in locale=="de"||locale=="en"?new[]{320,390,430}:new[]{390}){
#if UNITY_EDITOR
                PortraitGameView.Set(width,width==320?694:width==390?846:932);
#endif
                yield return null;yield return null;yield return null;yield return null;Canvas.ForceUpdateCanvases();var detail=GameObject.Find("INTDetails");Assert.That(detail,Is.Not.Null);var heading=detail.GetComponentsInChildren<UnityEngine.UI.Text>().First(t=>t.name=="DetailHeading");Assert.That(heading.cachedTextGenerator.lineCount,Is.LessThanOrEqualTo(1),locale+" heading lines");Assert.That(heading.preferredWidth,Is.LessThanOrEqualTo(heading.rectTransform.rect.width+1),locale+" heading width");Assert.That(heading.preferredHeight,Is.LessThanOrEqualTo(heading.rectTransform.rect.height+1),locale+" heading height");var description=detail.GetComponentsInChildren<UnityEngine.UI.Text>().First(t=>t.name=="Description");Assert.That(description.text,Does.Contain("×2 / ×3 / ×4"),locale);Assert.That(description.preferredHeight,Is.LessThanOrEqualTo(description.rectTransform.rect.height+1),locale);Assert.That(description.text,Does.Not.Contain("{"));Assert.That(Screen.width,Is.EqualTo(width));WorkshopTests.Capture(width,Screen.height,output+"/C01-"+locale+"-"+width+".png");
            }}}finally{game.State.ItemSystemV3=null;game.State.Settings.language="de";lifecycle.SetValue(game,started);game.enabled=true;network.CloseDetail();}
        }
        [UnityTest]public IEnumerator C06DescriptionUsesActualLocalizedV3ValuesAtMobileSizes()
        {
            game.Act(s=>{var n=s.Copy();n.Legacy.prepared=true;n.Meta.resets=1;n.Meta.total=n.Meta.available=ScientificNumber.From(100).ToData();return MetaRules.Buy(n,"C06");});Assert.That(game.Writable,Is.True,game.Status.text);Assert.That(MetaRules.Level(game.State,"C06"),Is.EqualTo(1));game.Show("prestige");yield return null;var network=game.PrestigeView;network.SetLayer(true);yield return null;
            var lifecycle=typeof(GameRuntime).GetField("started",System.Reflection.BindingFlags.Instance|System.Reflection.BindingFlags.NonPublic);Assert.That(lifecycle,Is.Not.Null);bool started=(bool)lifecycle.GetValue(game);game.enabled=false;lifecycle.SetValue(game,false);const string output="/tmp/idle-v3-C06-review";Directory.CreateDirectory(output);
            Debug.Log("PREPARED_C06_UI: isolated funded normal Axiom purchase; V3 flag only in-memory, lifecycle suspended, no V3 save migration claimed.");
            try{game.State.ItemSystemV3=new ItemV3State{axiomDiscovered=true,axiomDiscoveryAt=1000};network.SetLayer(false);network.SetLayer(true);foreach(string locale in SettingsCatalog.Languages){game.State.ItemSystemV3=null;lifecycle.SetValue(game,started);Assert.That(game.Act(s=>SettingsRules.Change(s,"language",locale)),Is.True,"actual locale action");lifecycle.SetValue(game,false);game.State.ItemSystemV3=new ItemV3State{axiomDiscovered=true,axiomDiscoveryAt=1000};network.OpenNode("C06");yield return null;game.FlushLocalization();foreach(int width in locale=="de"||locale=="en"?new[]{320,390,430}:new[]{390}){
#if UNITY_EDITOR
                PortraitGameView.Set(width,width==320?694:width==390?846:932);
#endif
                yield return null;yield return null;yield return null;yield return null;Canvas.ForceUpdateCanvases();var detail=GameObject.Find("INTDetails");Assert.That(detail,Is.Not.Null);var heading=detail.GetComponentsInChildren<UnityEngine.UI.Text>().First(t=>t.name=="DetailHeading");Assert.That(heading.cachedTextGenerator.lineCount,Is.LessThanOrEqualTo(1),locale+" heading lines");Assert.That(heading.preferredWidth,Is.LessThanOrEqualTo(heading.rectTransform.rect.width+1),locale+" heading width");Assert.That(heading.preferredHeight,Is.LessThanOrEqualTo(heading.rectTransform.rect.height+1),locale+" heading height");var description=detail.GetComponentsInChildren<UnityEngine.UI.Text>().First(t=>t.name=="Description");Assert.That(description.text,Does.Contain("×3"),locale);Assert.That(description.preferredHeight,Is.LessThanOrEqualTo(description.rectTransform.rect.height+1),locale);Assert.That(description.text,Does.Not.Contain("{"));Assert.That(Screen.width,Is.EqualTo(width));WorkshopTests.Capture(width,Screen.height,output+"/C06-"+locale+"-"+width+".png");
            }}}finally{game.State.ItemSystemV3=null;game.State.Settings.language="de";lifecycle.SetValue(game,started);game.enabled=true;network.CloseDetail();}
        }
        [UnityTest]public IEnumerator C06SynthesisOutputShowsActualNextWholeAmountAtMobileSizes()
        {
            game.Act(s=>{var n=s.Copy();n.Legacy.prepared=true;n.Data=ScientificNumber.From(1000);n.Meta.resets=1;n.Meta.total=n.Meta.available=ScientificNumber.From(100).ToData();return MetaRules.Buy(n,"C06");});Assert.That(game.Writable,Is.True,game.Status.text);
            var lifecycle=typeof(GameRuntime).GetField("started",System.Reflection.BindingFlags.Instance|System.Reflection.BindingFlags.NonPublic);bool started=(bool)lifecycle.GetValue(game);game.enabled=false;lifecycle.SetValue(game,false);const string output="/tmp/idle-v3-C06-review";Directory.CreateDirectory(output);
            Debug.Log("PREPARED_C06_SYNTHESIS_UI: isolated paid node, prepared half-component ledger, read-only V3 preview; no normal-save V3 activation.");
            try{foreach(string locale in SettingsCatalog.Languages){game.State.ItemSystemV3=null;lifecycle.SetValue(game,started);Assert.That(game.Act(s=>SettingsRules.Change(s,"language",locale)),Is.True);lifecycle.SetValue(game,false);game.State.ItemSystemV3=new ItemV3State{axiomDiscovered=true,axiomDiscoveryAt=1000};game.State.ItemSystemV3.synthesisRemainders[0]=.5;game.Show("items");yield return null;game.WorkshopView.OpenComponent(0);game.FlushLocalization();foreach(int width in locale=="de"||locale=="en"?new[]{320,390,430}:new[]{390}){
#if UNITY_EDITOR
                PortraitGameView.Set(width,width==320?694:width==390?846:932);
#endif
                yield return null;yield return null;yield return null;yield return null;Canvas.ForceUpdateCanvases();var label=game.WorkshopView.DetailActions.Find("ComponentSynthesisOutput").GetComponent<UnityEngine.UI.Text>();Assert.That(label.text,Does.Contain("+2"),locale);Assert.That(label.text,Does.Not.Contain("{"),locale);Assert.That(label.preferredHeight,Is.LessThanOrEqualTo(label.rectTransform.rect.height+1),locale);var button=game.WorkshopView.DetailActions.Find("Synthesis0").GetComponent<UnityEngine.UI.Button>();Assert.That(button.interactable,Is.True,locale);Assert.That(((RectTransform)button.transform).rect.height,Is.GreaterThanOrEqualTo(44));WorkshopTests.Capture(width,Screen.height,output+"/Synthesis-"+locale+"-"+width+".png");
            }}}finally{game.State.ItemSystemV3=null;lifecycle.SetValue(game,started);game.enabled=true;}
        }
        [UnityTest]public IEnumerator LinearIncomeNodesShowSixPercentagePointsAtMobileSizes()
        {
            game.Act(s=>{var n=s.Copy();n.Legacy.prepared=true;n.Prestige.Cycle=n.Prestige.Total=n.Prestige.Free=n.Prestige.Entitlement=ScientificNumber.From(1e12);n=PrestigeRules.Buy(n,"I05");return PrestigeRules.Buy(n,"I10");});Assert.That(game.Writable,Is.True,game.Status.text);Assert.That(game.State.Workshop.nodes,Does.Contain("I05"));Assert.That(game.State.Workshop.nodes,Does.Contain("I10"));game.Show("prestige");yield return null;var network=game.PrestigeView;
            var lifecycle=typeof(GameRuntime).GetField("started",System.Reflection.BindingFlags.Instance|System.Reflection.BindingFlags.NonPublic);bool started=(bool)lifecycle.GetValue(game);game.enabled=false;lifecycle.SetValue(game,false);const string output="/tmp/idle-v3-linear-INT-review";Directory.CreateDirectory(output);
            Debug.Log("PREPARED_LINEAR_INT_UI: isolated actual normal node purchases; localized V3 text preview only, lifecycle suspended, no V3 save migration.");
            try{foreach(string locale in SettingsCatalog.Languages){game.State.ItemSystemV3=null;lifecycle.SetValue(game,started);Assert.That(game.Act(s=>SettingsRules.Change(s,"language",locale)),Is.True);lifecycle.SetValue(game,false);game.State.ItemSystemV3=new ItemV3State();foreach(string id in new[]{"I05","I10"}){network.OpenNode(id);yield return null;game.FlushLocalization();foreach(int width in locale=="de"||locale=="en"?new[]{320,390,430}:new[]{390}){
#if UNITY_EDITOR
                PortraitGameView.Set(width,width==320?694:width==390?846:932);
#endif
                yield return null;yield return null;yield return null;yield return null;Canvas.ForceUpdateCanvases();var detail=GameObject.Find("INTDetails");var description=detail.GetComponentsInChildren<UnityEngine.UI.Text>().First(t=>t.name=="Description");Assert.That(description.text,Does.Contain("+6"),locale+" "+id);Assert.That(description.text,Does.Not.Contain("{"),locale);Assert.That(description.preferredHeight,Is.LessThanOrEqualTo(description.rectTransform.rect.height+1),locale+" "+id);WorkshopTests.Capture(width,Screen.height,output+"/"+id+"-"+locale+"-"+width+".png");
            }}}}finally{game.State.ItemSystemV3=null;lifecycle.SetValue(game,started);game.enabled=true;network.CloseDetail();}
        }
        [UnityTest]public IEnumerator ActualQueueViewsAtMobileSizesAndAllSevenLanguages()
        {
            Prepare();string output="/tmp/idle-v3-queue-review-v2";Directory.CreateDirectory(output);
            foreach(string locale in SettingsCatalog.Languages){game.Act(s=>SettingsRules.Change(s,"language",locale));foreach(string route in new[]{"training","research"}){
                game.Show(route);yield return null;yield return null;game.FlushLocalization();var view=game.Content.GetComponentInChildren<PlannedQueueView>();Assert.That(view,Is.Not.Null);Assert.That(view.GetComponentsInChildren<UnityEngine.UI.Button>().Where(b=>b.interactable).All(b=>{var r=(RectTransform)b.transform;return r.rect.width>=43.5f&&r.rect.height>=43.5f;}),Is.True,"44 unit targets");
                foreach(int width in locale=="de"||locale=="en"?new[]{320,390,430}:new[]{390}){
#if UNITY_EDITOR
                    PortraitGameView.Set(width,width==320?694:width==390?846:932);
#endif
                    yield return null;yield return null;Assert.That(Screen.width,Is.EqualTo(width),"Actual Game View width");Canvas.ForceUpdateCanvases();WorkshopTests.Capture(width,Screen.height,output+"/"+route+"-"+locale+"-"+width+".png");
                }
            }}
        }
    }
}
