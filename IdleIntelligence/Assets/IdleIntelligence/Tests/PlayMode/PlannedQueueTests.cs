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
            Debug.Log("PREPARED_T06_UI: isolated normal target edit/reload tested; V3 flags below are an in-memory read-only presentation fixture, not migrated or persisted V3 save proof.");game.enabled=false;string output="/tmp/idle-v3-training-target-review";Directory.CreateDirectory(output);
            try{
                game.State.ItemSystemV3=new ItemV3State();foreach(string locale in SettingsCatalog.Languages){game.State.Settings.language=locale;network.OpenNode("T06");yield return null;game.FlushLocalization();foreach(int width in locale=="de"||locale=="en"?new[]{320,390,430}:new[]{390}){
#if UNITY_EDITOR
                    PortraitGameView.Set(width,width==320?694:width==390?846:932);
#endif
                    yield return null;yield return null;Canvas.ForceUpdateCanvases();var scroll=GameObject.Find("INTDetails").GetComponentInChildren<UnityEngine.UI.ScrollRect>();scroll.StopMovement();scroll.verticalNormalizedPosition=0;yield return null;yield return null;Canvas.ForceUpdateCanvases();scroll.verticalNormalizedPosition=0;yield return null;yield return null;Canvas.ForceUpdateCanvases();Assert.That(Screen.width,Is.EqualTo(width));for(int i=0;i<3;i++){var input=GameObject.Find("TrainingTarget"+i).GetComponent<UnityEngine.UI.InputField>();Assert.That(((RectTransform)input.transform).rect.height,Is.GreaterThanOrEqualTo(44));var bounds=RectTransformUtility.CalculateRelativeRectTransformBounds(scroll.viewport,input.transform);Assert.That(bounds.min.y,Is.GreaterThanOrEqualTo(scroll.viewport.rect.yMin-.5f),locale+" visible input "+i);Assert.That(bounds.max.y,Is.LessThanOrEqualTo(scroll.viewport.rect.yMax+.5f),locale+" visible input top "+i);var title=GameObject.Find("TrainingTarget"+i+"Title").GetComponent<UnityEngine.UI.Text>();Assert.That(title.preferredHeight,Is.LessThanOrEqualTo(title.rectTransform.rect.height+1),locale+" title "+i);}
                    Assert.That(GameObject.Find("TrainingTarget2Title").GetComponent<UnityEngine.UI.Text>().text,Is.EqualTo(PrestigeSettings.TrainingTargetLabel(game.State,2)));WorkshopTests.Capture(width,Screen.height,output+"/T06-"+locale+"-"+width+".png");
                }}
            }finally{game.State.ItemSystemV3=null;game.State.Settings.language="de";game.enabled=true;network.CloseDetail();}
            Assert.That(new AtomicSaveStore(game.SavePath,new UnitySaveCodec()).Load(game.State.SavedAt).State.ItemSystemV3,Is.Null);
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
