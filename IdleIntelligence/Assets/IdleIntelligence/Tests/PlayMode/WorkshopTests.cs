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
    public sealed class WorkshopTests
    {
        string directory;GameRuntime game;
        [UnitySetUp]public IEnumerator Setup(){directory=Path.Combine(Path.GetTempPath(),"unity-forge-"+Guid.NewGuid());Directory.CreateDirectory(directory);GameRuntime.SavePathOverride=Path.Combine(directory,"save.json");yield return SceneManager.LoadSceneAsync("IdleIntelligence");yield return null;game=UnityEngine.Object.FindFirstObjectByType<GameRuntime>();}
        [UnityTearDown]public IEnumerator Cleanup(){if(game!=null)UnityEngine.Object.Destroy(game.gameObject);yield return null;GameRuntime.SavePathOverride=null;if(Directory.Exists(directory))Directory.Delete(directory,true);}
        static void Click(string name){var button=GameObject.Find(name)?.GetComponent<Button>();Assert.That(button,Is.Not.Null,name);Assert.That(button.interactable,Is.True,name);button.onClick.Invoke();}
        void Fund()
        {
            game.Act(s=>{var n=s.Copy();n.Data=ScientificNumber.From(1000000);n.Workshop.starterGift=true;n.Workshop.components=Enumerable.Repeat(500L,ItemBalance.ComponentIds.Length).ToArray();n.Workshop.learned=Enumerable.Repeat(true,ItemBalance.Items.Length).ToArray();n.Workshop.fragments=100;return n;});
        }
        [UnityTest]public IEnumerator ForgeTransactionsFinishBeforeAnimationAndCancelWithoutAwards()
        {
            Fund();Click("ItemsTab");yield return null;var ui=game.WorkshopView;string type=ItemBalance.Items.First(i=>i.Starter==0).Id;var before=game.State.Workshop.components[0];Click("CommitForge");Assert.That(game.State.Workshop.inventory.Length,Is.EqualTo(1));Assert.That(game.State.Workshop.components[0],Is.LessThan(before));Assert.That(ui.Forge.IsAnimating,Is.True);ui.Forge.Cancel();Assert.That(game.State.Workshop.inventory.Length,Is.EqualTo(1));
            Click("CommitForge");Click("CommitForge");Assert.That(game.State.Workshop.inventory.Length,Is.EqualTo(3));ui.ChangeMode("fusion");foreach(var item in game.State.Workshop.inventory.ToArray())ui.ToggleSelection(item.id);Click("CommitForge");Assert.That(game.State.Workshop.inventory.Length,Is.EqualTo(1));Assert.That(game.State.Workshop.inventory[0].rarity,Is.EqualTo(1));Click("HardwareTab");yield return null;yield return new WaitForSecondsRealtime(2);Assert.That(game.State.Workshop.inventory.Length,Is.EqualTo(1));
            Click("ItemsTab");yield return null;ui=game.WorkshopView;ui.ChangeMode("inventory");ui.OpenItem(game.State.Workshop.inventory[0].id);Assert.That(ui.DetailRoot.activeInHierarchy,Is.True);Click("equip-processor");Assert.That(game.State.Workshop.equipped[0],Is.EqualTo(game.State.Workshop.inventory[0].id));Assert.That(Workshop.Equipped(game.State).Count(),Is.EqualTo(1));
        }
        [UnityTest]public IEnumerator ReducedMotionPersistsAndShowsStaticActualResult()
        {
            Fund();Click("ItemsTab");yield return null;var ui=game.WorkshopView;Click("ReducedMotion");Assert.That(game.State.Workshop.reducedMotion,Is.True);Click("CommitForge");Assert.That(ui.Forge.IsAnimating,Is.False);Assert.That(ui.Forge.Result.Item.id,Is.EqualTo(game.State.Workshop.inventory.Last().id));
            var read=new AtomicSaveStore(game.SavePath,new UnitySaveCodec()).Load(game.State.SavedAt);Assert.That(read.State.Workshop.reducedMotion,Is.True);Assert.That(read.State.Workshop.inventory.Length,Is.EqualTo(1));
        }
        [UnityTest]public IEnumerator RecordActualCraftAndFusionAtMobileSizes()
        {
            Fund();Click("ItemsTab");yield return null;var ui=game.WorkshopView;Directory.CreateDirectory("/tmp/unity-forge-frames");int frame=0;
            for(int i=0;i<4;i++){Capture(390,844,"/tmp/unity-forge-frames/"+(frame++).ToString("D4")+".png");yield return new WaitForSecondsRealtime(.05f);}
            Click("CommitForge");for(int i=0;i<40;i++){Capture(390,844,"/tmp/unity-forge-frames/"+(frame++).ToString("D4")+".png");yield return new WaitForSecondsRealtime(.05f);}
            Click("CommitForge");Click("CommitForge");ui.ChangeMode("fusion");foreach(var item in game.State.Workshop.inventory.ToArray())ui.ToggleSelection(item.id);yield return null;
            for(int i=0;i<8;i++){Capture(390,844,"/tmp/unity-forge-frames/"+(frame++).ToString("D4")+".png");yield return new WaitForSecondsRealtime(.05f);}
            Click("CommitForge");Assert.That(game.State.Workshop.inventory.Length,Is.EqualTo(1));string result=game.State.Workshop.inventory[0].id;
            for(int i=0;i<40;i++){Capture(390,844,"/tmp/unity-forge-frames/"+(frame++).ToString("D4")+".png");yield return new WaitForSecondsRealtime(.05f);}
            Assert.That(ui.Forge.Result.Item.id,Is.EqualTo(result));Assert.That(ui.Forge.Result.Frame.color,Is.EqualTo(ItemPortrait.RarityColor(1)));Capture(320,568,"/tmp/unity-forge-compact.png");Capture(390,844,"/tmp/unity-forge-portrait.png");Capture(430,932,"/tmp/unity-forge-large.png");ui.ChangeMode("inventory");yield return null;Capture(390,844,"/tmp/unity-inventory.png");ui.OpenItem(result);yield return null;Capture(390,844,"/tmp/unity-item-detail.png");Capture(320,568,"/tmp/unity-item-detail-compact.png");var scroll=ui.DetailRoot.GetComponentInChildren<ScrollRect>();Assert.That(scroll.content.rect.height,Is.GreaterThan(scroll.viewport.rect.height));scroll.verticalNormalizedPosition=0;Capture(320,568,"/tmp/unity-item-detail-compact-bottom.png");
        }
        public static void Capture(int width,int height,string path)
        {
            var canvas=UnityEngine.Object.FindObjectsByType<Canvas>(FindObjectsSortMode.None).First(c=>c.isRootCanvas);var positions=UnityEngine.Object.FindObjectsByType<ScrollRect>(FindObjectsSortMode.None).Select(s=>new {scroll=s,position=s.verticalNormalizedPosition}).ToArray();var camera=UnityEngine.Object.FindFirstObjectByType<Camera>();var texture=new RenderTexture(width,height,24);camera.targetTexture=texture;canvas.renderMode=RenderMode.ScreenSpaceCamera;canvas.worldCamera=camera;canvas.planeDistance=1;Canvas.ForceUpdateCanvases();foreach(var p in positions)p.scroll.verticalNormalizedPosition=p.position;Canvas.ForceUpdateCanvases();camera.Render();if(path.Contains("idle-design-review/labor"))DesignReviewTests.CheckGeometry(width,height,camera,path);if(path.Contains("unity-int"))File.WriteAllLines(path+".layout.txt",UnityEngine.Object.FindObjectsByType<RectTransform>(FindObjectsSortMode.None).Where(r=>new[]{"PrestigeNetwork(Clone)","NetworkViewport","NetworkWorld","Content","Viewport","INTDetails"}.Contains(r.name)).Select(r=>r.name+" rect="+r.rect+" anchored="+r.anchoredPosition+" parent="+r.parent?.name));var prior=RenderTexture.active;RenderTexture.active=texture;var pixels=new Texture2D(width,height,TextureFormat.RGB24,false);pixels.ReadPixels(new Rect(0,0,width,height),0,0);pixels.Apply();File.WriteAllBytes(path,pixels.EncodeToPNG());RenderTexture.active=prior;camera.targetTexture=null;canvas.renderMode=RenderMode.ScreenSpaceOverlay;UnityEngine.Object.Destroy(pixels);UnityEngine.Object.Destroy(texture);
        }
    }
}
