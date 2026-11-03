using System;
using System.IO;
using System.Linq;
using System.Collections;
using IdleIntelligence.Core;
using IdleIntelligence.Runtime;
using NUnit.Framework;
using UnityEngine;
using UnityEngine.UI;
using UnityEngine.SceneManagement;
using UnityEngine.TestTools;
namespace IdleIntelligence.PlayTests
{
    public sealed class ReleasePresentationTests
    {
        GameRuntime game;string directory;bool wasRunningInBackground;const string Output="/tmp/idle-release-polish";
        [UnitySetUp]public IEnumerator Setup(){wasRunningInBackground=Application.runInBackground;Application.runInBackground=true;Directory.CreateDirectory(Output);directory=Path.Combine(Path.GetTempPath(),"release-ui-"+Guid.NewGuid());Directory.CreateDirectory(directory);GameRuntime.SavePathOverride=Path.Combine(directory,"save.json");yield return SceneManager.LoadSceneAsync("IdleIntelligence");yield return null;game=UnityEngine.Object.FindFirstObjectByType<GameRuntime>();game.Act(s=>{var n=NarrativeBridge.Action(s,"skip-tutorial");n.Story.enabled=false;n.Story.open=null;n.Story.queue=Array.Empty<string>();return n;});}
        [UnityTearDown]public IEnumerator Cleanup(){if(game!=null)UnityEngine.Object.Destroy(game.gameObject);yield return null;GameRuntime.SavePathOverride=null;Application.runInBackground=wasRunningInBackground;if(Directory.Exists(directory))Directory.Delete(directory,true);}
        static void Click(string name){var b=GameObject.Find(name)?.GetComponent<Button>();Assert.That(b,Is.Not.Null,name);Assert.That(b.interactable,Is.True,name);b.onClick.Invoke();}
        [UnityTest]public IEnumerator ProfileUsesRealIdentityAndFoldoutsAndCapturesBothLanguages()
        {
            foreach(string locale in new[]{"de","en"})foreach(int width in new[]{320,390,430}){
                game.Act(s=>SettingsRules.Change(s,"language",locale));PortraitGameView.Set(width,width==320?568:width==390?846:932);game.Show("profile");yield return null;yield return null;Canvas.ForceUpdateCanvases();
                Assert.That(GameObject.Find("ProfileIdentityText").GetComponent<Text>().text,Is.EqualTo(game.State.Retention.playerName));
                Assert.That(GameObject.Find("PlayerNameInput"),Is.Null);Assert.That(GameObject.Find("ProfileEmblem").GetComponent<Image>().sprite,Is.EqualTo(game.ModelPrefab.ModelArt));Assert.That(GameObject.Find("ProfileFrame").GetComponentInChildren<FlowAccent>(),Is.Not.Null);
                WorkshopTests.Capture(width,Screen.height,Output+"/profile-"+locale+"-"+width+".png");
                Click("ProfileEdit");yield return null;Assert.That(GameObject.Find("PlayerNameInput"),Is.Not.Null);Assert.That(GameObject.Find("PlayerNameError"),Is.Null,"No blank error panel before validation");
                Click("ProfileMailbox");yield return null;Assert.That(GameObject.Find("Read-progression-v2"),Is.Not.Null);WorkshopTests.Capture(width,Screen.height,Output+"/profile-edit-"+locale+"-"+width+".png");
            }
        }
        [UnityTest]public IEnumerator MotionStopsForReducedMotionAndEffectsOffWithoutChangingTheSave()
        {
            game.Show("profile");yield return null;yield return null;game.enabled=false;
            var frame=GameObject.Find("ProfileFrame").GetComponentInChildren<FlowAccent>();Assert.That(frame.raycastTarget,Is.False);
            string before=JsonUtility.ToJson(StateData.From(game.State));float phase=frame.Phase;yield return new WaitForSecondsRealtime(.2f);
            Assert.That(frame.Phase,Is.Not.EqualTo(phase));Assert.That(JsonUtility.ToJson(StateData.From(game.State)),Is.EqualTo(before));
            int initialFrame=Time.frameCount;Debug.Log("RELEASE_UI_PIPELINE: "+(UnityEngine.Rendering.GraphicsSettings.currentRenderPipeline?.GetType().Name??"Built-in"));
            for(int i=0;i<18;i++){yield return new WaitForSecondsRealtime(.24f);WorkshopTests.Capture(390,846,Output+"/flow-"+i.ToString("D3")+".png");}
            Assert.That(Time.frameCount,Is.GreaterThan(initialFrame),"The captured UI must be genuinely running");Assert.That(JsonUtility.ToJson(StateData.From(game.State)),Is.EqualTo(before),"The complete moving capture must leave the state unchanged");
            game.State.Workshop.reducedMotion=true;yield return null;yield return null;Canvas.ForceUpdateCanvases();int revision=frame.MeshRevision;yield return new WaitForSecondsRealtime(.15f);
            Assert.That(frame.Phase,Is.Zero);Assert.That(frame.IsAnimating,Is.False);Assert.That(frame.MeshRevision,Is.EqualTo(revision),"Static frame must not dirty the canvas every tick");
            game.State.Workshop.reducedMotion=false;game.State.Settings.effects=false;yield return new WaitForSecondsRealtime(.15f);Assert.That(frame.Phase,Is.Zero);Assert.That(frame.IsAnimating,Is.False);
            WorkshopTests.Capture(390,846,Output+"/profile-static.png");
        }
        [UnityTest]public IEnumerator AccentReuseNeverAddsHitTargetsOrGrowsTheHierarchy()
        {
            game.Show("profile");yield return null;var target=GameObject.Find("ProfileFrame").transform;int count=target.childCount;
            for(int i=0;i<30;i++)FlowAccent.Attach(target,game,FlowAccent.Contour.Portrait,GameTheme.Accent);
            Assert.That(target.childCount,Is.EqualTo(count));var frame=target.GetComponentInChildren<FlowAccent>();Assert.That(frame.raycastTarget,Is.False);Assert.That(frame.GetComponent<LayoutElement>().ignoreLayout,Is.True);
            game.enabled=false;yield return new WaitForSecondsRealtime(.4f);Assert.That(target.childCount,Is.EqualTo(count));Assert.That(frame.canvasRenderer.materialCount,Is.LessThanOrEqualTo(1));
            Click("ProfileEdit");yield return null;Assert.That(GameObject.Find("PlayerNameInput"),Is.Not.Null,"Decorations must leave the actual controls usable");
        }
    }
}
