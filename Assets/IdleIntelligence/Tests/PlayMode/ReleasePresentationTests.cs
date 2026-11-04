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
            PortraitGameView.Set(390,846);game.Show("profile");yield return null;yield return null;game.enabled=false;
            var frame=GameObject.Find("ProfileFrame").GetComponentInChildren<FlowAccent>();Assert.That(frame.raycastTarget,Is.False);
            var core=GameObject.Find("ProfileEmblem").GetComponent<Image>();var name=GameObject.Find("ProfileIdentityText").GetComponent<Text>();
            var coreScale=core.transform.localScale;var coreColor=core.color;var nameColor=name.color;
            Assert.That(frame.material.shader.name,Is.EqualTo("IdleIntelligence/UI/DarkMatterRing"));Assert.That(frame.material.shader.isSupported,Is.True);
            string before=JsonUtility.ToJson(StateData.From(game.State));float phase=frame.Phase;yield return new WaitForSecondsRealtime(.2f);
            Assert.That(frame.Phase,Is.Not.EqualTo(phase));Assert.That(JsonUtility.ToJson(StateData.From(game.State)),Is.EqualTo(before));
            int initialFrame=Time.frameCount;Debug.Log("RELEASE_UI_PIPELINE: "+(UnityEngine.Rendering.GraphicsSettings.currentRenderPipeline?.GetType().Name??"Built-in"));
            for(int i=0;i<30;i++){yield return new WaitForSecondsRealtime(.16f);WorkshopTests.Capture(390,846,Output+"/flow-"+i.ToString("D3")+".png");}
            var first=new Texture2D(2,2);var last=new Texture2D(2,2);first.LoadImage(File.ReadAllBytes(Output+"/flow-000.png"));last.LoadImage(File.ReadAllBytes(Output+"/flow-029.png"));
            var centre=RectTransformUtility.WorldToScreenPoint(null,frame.rectTransform.TransformPoint(frame.rectTransform.rect.center));int changedRing=0,changedCentre=0;
            for(int y=-45;y<=45;y++)for(int x=-45;x<=45;x++){
                var a=first.GetPixel(Mathf.RoundToInt(centre.x)+x,Mathf.RoundToInt(centre.y)+y);var b=last.GetPixel(Mathf.RoundToInt(centre.x)+x,Mathf.RoundToInt(centre.y)+y);
                if(a.Equals(b))continue;
                if(Mathf.Abs(x)<20&&Mathf.Abs(y)<20)changedCentre++;
                if(Mathf.Max(Mathf.Abs(x),Mathf.Abs(y))>35)changedRing++;
            }
            UnityEngine.Object.Destroy(first);UnityEngine.Object.Destroy(last);
            Assert.That(changedRing,Is.GreaterThan(80),"The rendered material must really flow, not just advance a timer");Assert.That(changedCentre,Is.Zero,"The actual rendered centre must remain identical");
            Assert.That(core.transform.localScale,Is.EqualTo(coreScale),"Only the outer ring may animate");Assert.That(core.color,Is.EqualTo(coreColor));Assert.That(name.color,Is.EqualTo(nameColor));
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
