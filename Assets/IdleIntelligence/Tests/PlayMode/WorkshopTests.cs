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
            Fund();Click("ItemsTab");yield return null;var ui=game.WorkshopView;ui.ChangeMode("craft");string type=ItemBalance.Items.First(i=>i.Starter==0).Id;var before=game.State.Workshop.components[0];Click("CommitForge");Assert.That(game.State.Workshop.inventory.Length,Is.EqualTo(1));Assert.That(game.State.Workshop.components[0],Is.LessThan(before));Assert.That(ui.Forge.IsAnimating,Is.True);ui.Forge.Cancel();Assert.That(game.State.Workshop.inventory.Length,Is.EqualTo(1));
            Click("CommitForge");Click("CommitForge");Assert.That(game.State.Workshop.inventory.Length,Is.EqualTo(3));ui.ChangeMode("fusion");foreach(var item in game.State.Workshop.inventory.ToArray())ui.ToggleSelection(item.id);Click("CommitForge");Assert.That(game.State.Workshop.inventory.Length,Is.EqualTo(1));Assert.That(game.State.Workshop.inventory[0].rarity,Is.EqualTo(1));Click("HardwareTab");yield return null;yield return new WaitForSecondsRealtime(2);Assert.That(game.State.Workshop.inventory.Length,Is.EqualTo(1));
            Click("ItemsTab");yield return null;ui=game.WorkshopView;ui.ChangeMode("inventory");ui.OpenItem(game.State.Workshop.inventory[0].id);Assert.That(ui.DetailRoot.activeInHierarchy,Is.True);Click("equip-processor");Assert.That(game.State.Workshop.equipped[0],Is.EqualTo(game.State.Workshop.inventory[0].id));Assert.That(Workshop.Equipped(game.State).Count(),Is.EqualTo(1));
        }
        [UnityTest]public IEnumerator ReducedMotionPersistsAndShowsStaticActualResult()
        {
            Fund();Click("ItemsTab");yield return null;var ui=game.WorkshopView;ui.ChangeMode("craft");Click("ReducedMotion");Assert.That(game.State.Workshop.reducedMotion,Is.True);Click("CommitForge");Assert.That(ui.Forge.IsAnimating,Is.False);Assert.That(ui.Forge.Result.Item.id,Is.EqualTo(game.State.Workshop.inventory.Last().id));
            var read=new AtomicSaveStore(game.SavePath,new UnitySaveCodec()).Load(game.State.SavedAt);Assert.That(read.State.Workshop.reducedMotion,Is.True);Assert.That(read.State.Workshop.inventory.Length,Is.EqualTo(1));
        }
        [UnityTest]public IEnumerator RecordActualCraftAndFusionAtMobileSizes()
        {
            Fund();Click("ItemsTab");yield return null;var ui=game.WorkshopView;ui.ChangeMode("craft");Directory.CreateDirectory("/tmp/unity-forge-frames");int frame=0;
            for(int i=0;i<4;i++){Capture(390,844,"/tmp/unity-forge-frames/"+(frame++).ToString("D4")+".png");yield return new WaitForSecondsRealtime(.05f);}
            Click("CommitForge");for(int i=0;i<40;i++){Capture(390,844,"/tmp/unity-forge-frames/"+(frame++).ToString("D4")+".png");yield return new WaitForSecondsRealtime(.05f);}
            Click("CommitForge");Click("CommitForge");ui.ChangeMode("fusion");foreach(var item in game.State.Workshop.inventory.ToArray())ui.ToggleSelection(item.id);yield return null;
            for(int i=0;i<8;i++){Capture(390,844,"/tmp/unity-forge-frames/"+(frame++).ToString("D4")+".png");yield return new WaitForSecondsRealtime(.05f);}
            Click("CommitForge");Assert.That(game.State.Workshop.inventory.Length,Is.EqualTo(1));string result=game.State.Workshop.inventory[0].id;
            for(int i=0;i<40;i++){Capture(390,844,"/tmp/unity-forge-frames/"+(frame++).ToString("D4")+".png");yield return new WaitForSecondsRealtime(.05f);}
            Assert.That(ui.Forge.Result.Item.id,Is.EqualTo(result));Assert.That(ui.Forge.Result.Frame.color,Is.EqualTo(ItemPortrait.RarityColor(1)));Capture(320,568,"/tmp/unity-forge-compact.png");Capture(390,844,"/tmp/unity-forge-portrait.png");Capture(430,932,"/tmp/unity-forge-large.png");ui.ChangeMode("inventory");yield return null;Capture(390,844,"/tmp/unity-inventory.png");ui.OpenItem(result);yield return null;Capture(390,844,"/tmp/unity-item-detail.png");Capture(320,568,"/tmp/unity-item-detail-compact.png");Click("MoreItemActionsToggle");yield return null;var scroll=ui.DetailRoot.GetComponentInChildren<ScrollRect>();Capture(320,568,"/tmp/unity-item-detail-expanded.png");Assert.That(scroll.content.rect.height,Is.GreaterThan(scroll.viewport.rect.height));scroll.verticalNormalizedPosition=0;Capture(320,568,"/tmp/unity-item-detail-compact-bottom.png");
        }
        [UnityTest]public IEnumerator FiveMaterialRecipesFitMobileAndFusionReturnsToThreeSlots()
        {
            game.Act(s=>NarrativeBridge.Action(s,"name","AURA"));
            game.Act(s=>{var n=NarrativeBridge.Action(NarrativeBridge.Action(s,"name","AURA"),"skip-tutorial");n.Story.enabled=false;n.Story.open=null;n.Story.queue=Array.Empty<string>();n.Data=ScientificNumber.Parse("1e15");n.Meta.resets=3;n.Research[Game.ResearchIndex("blueprints")]=1;n.Workshop.learned=Enumerable.Repeat(true,ItemBalance.Items.Length).ToArray();n.Workshop.components=Enumerable.Repeat(1000000L,ItemBalance.ComponentIds.Length).ToArray();n.Workshop.modules=Enumerable.Repeat(1000000L,ItemBalance.Modules.Length).ToArray();return n;});
            Directory.CreateDirectory("/tmp/idle-five-materials");
            foreach(string locale in new[]{"de","en"})foreach(int width in new[]{320,390,430}){
                game.Act(s=>{var n=SettingsRules.Change(s,"language",locale).Copy();n.Story.open=null;n.Story.queue=Array.Empty<string>();return n;});PortraitGameView.Set(width,width==320?568:width==390?846:932);game.Show("items");yield return null;
                var ui=game.WorkshopView;ui.SelectRecipe(Workshop.Index("singularity-lens"));yield return null;Canvas.ForceUpdateCanvases();
                var quote=Workshop.Quote(game.State,"singularity-lens");Assert.AreEqual(5,quote.Components.Count(v=>v>0));Assert.AreEqual(5,ui.Forge.Inputs.Count(p=>p.gameObject.activeSelf));
                Assert.AreEqual(8,ui.CostView.transform.childCount,"Five components, data and two modules");
                var bounds=new Vector3[4];((RectTransform)ui.Forge.transform).GetWorldCorners(bounds);
                foreach(var slot in ui.Forge.Inputs.Where(p=>p.gameObject.activeSelf)){
                    var corners=new Vector3[4];((RectTransform)slot.transform).GetWorldCorners(corners);
                    Assert.GreaterOrEqual(corners[0].x,bounds[0].x-1);Assert.LessOrEqual(corners[2].x,bounds[2].x+1);
                    Assert.GreaterOrEqual(corners[0].y,bounds[0].y-1);Assert.LessOrEqual(corners[2].y,bounds[2].y+1);
                }
                var scroll=ui.GetComponentInParent<ScrollRect>();
                void Focus(RectTransform target){Canvas.ForceUpdateCanvases();var relative=RectTransformUtility.CalculateRelativeRectTransformBounds(scroll.content,target);float distance=scroll.content.rect.yMax-relative.center.y-scroll.viewport.rect.height*.5f;scroll.verticalNormalizedPosition=1-Mathf.Clamp01(distance/Mathf.Max(1,scroll.content.rect.height-scroll.viewport.rect.height));Canvas.ForceUpdateCanvases();}
                Focus((RectTransform)ui.Forge.transform);
                Capture(width,width==320?568:width==390?846:932,"/tmp/idle-five-materials/"+locale+"-"+width+".png");
                Focus((RectTransform)ui.CostView.transform);Capture(width,width==320?568:width==390?846:932,"/tmp/idle-five-materials/"+locale+"-"+width+"-costs.png");
                Click("CommitForge");Assert.AreEqual(5,ui.Forge.FlightCount);var sequence=ui.Forge.GetComponentInChildren<ForgeSequence>();Assert.IsNotNull(sequence);Assert.AreEqual(5,sequence.Sources.Count(p=>p.gameObject.activeSelf));
                ((RectTransform)sequence.transform).GetWorldCorners(bounds);
                foreach(var slot in sequence.Sources.Where(p=>p.gameObject.activeSelf)){var corners=new Vector3[4];((RectTransform)slot.transform).GetWorldCorners(corners);Assert.GreaterOrEqual(corners[0].x,bounds[0].x-1);Assert.LessOrEqual(corners[2].x,bounds[2].x+1);}
                ui.Forge.Cancel();

                int count=ui.Forge.Inputs.Length;for(int i=0;i<10;i++)ui.Forge.ShowMaterials(quote.Components,1);Assert.AreEqual(count,ui.Forge.Inputs.Length,"Bounded reusable sockets");
                ui.ChangeMode("fusion");Assert.AreEqual(3,ui.Forge.Inputs.Count(p=>p.gameObject.activeSelf));
            }
        }
        public static void Capture(int width,int height,string path)
        {
            UnityEngine.Object.FindFirstObjectByType<GameRuntime>()?.FlushLocalization();foreach(var label in UnityEngine.Object.FindObjectsByType<UiLocalizedText>(FindObjectsSortMode.None))label.RefreshNow();Canvas.ForceUpdateCanvases();foreach(var label in UnityEngine.Object.FindObjectsByType<AdaptiveTextHeight>(FindObjectsSortMode.None))label.RefreshNow();foreach(var card in UnityEngine.Object.FindObjectsByType<CompactActionCard>(FindObjectsSortMode.None))card.RefreshNow();Canvas.ForceUpdateCanvases();var canvas=UnityEngine.Object.FindObjectsByType<Canvas>(FindObjectsSortMode.None).First(c=>c.isRootCanvas);var positions=UnityEngine.Object.FindObjectsByType<ScrollRect>(FindObjectsSortMode.None).Select(s=>new {scroll=s,position=s.verticalNormalizedPosition}).ToArray();var camera=UnityEngine.Object.FindFirstObjectByType<Camera>();var texture=new RenderTexture(width,height,24);camera.targetTexture=texture;canvas.renderMode=RenderMode.ScreenSpaceCamera;canvas.worldCamera=camera;canvas.planeDistance=1;Canvas.ForceUpdateCanvases();foreach(var p in positions)p.scroll.verticalNormalizedPosition=p.position;Canvas.ForceUpdateCanvases();camera.Render();if(path.Contains("idle-mainview-review"))MainViewRepairTests.CheckTextGeometry();if(path.Contains("idle-design2-review")||path.Contains("idle-design-review/detail"))DesignReviewTests.CheckItemTouchTargets(camera);if(path.Contains("idle-design-review/labor"))DesignReviewTests.CheckGeometry(width,height,camera,path);if(path.Contains("unity-int"))File.WriteAllLines(path+".layout.txt",UnityEngine.Object.FindObjectsByType<RectTransform>(FindObjectsSortMode.None).Where(r=>new[]{"PrestigeNetwork(Clone)","NetworkViewport","NetworkWorld","Content","Viewport","INTDetails"}.Contains(r.name)).Select(r=>r.name+" rect="+r.rect+" anchored="+r.anchoredPosition+" parent="+r.parent?.name));var prior=RenderTexture.active;RenderTexture.active=texture;var pixels=new Texture2D(width,height,TextureFormat.RGB24,false);pixels.ReadPixels(new Rect(0,0,width,height),0,0);pixels.Apply();File.WriteAllBytes(path,pixels.EncodeToPNG());RenderTexture.active=prior;camera.targetTexture=null;canvas.renderMode=RenderMode.ScreenSpaceOverlay;UnityEngine.Object.Destroy(pixels);UnityEngine.Object.Destroy(texture);
        }
    }
}
