using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using IdleIntelligence.Core;
using IdleIntelligence.Runtime;
using NUnit.Framework;
using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.TestTools;
using UnityEngine.UI;

namespace IdleIntelligence.PlayTests
{
 public sealed class ChestInventoryRefinementTests
 {
  GameRuntime game; string save;
  [UnitySetUp] public IEnumerator Setup()
  {
   save=Path.Combine(Path.GetTempPath(),"idle-chest-grid-"+Guid.NewGuid(),"save.json");Directory.CreateDirectory(Path.GetDirectoryName(save));GameRuntime.SavePathOverride=save;
   yield return SceneManager.LoadSceneAsync("IdleIntelligence");yield return null;game=UnityEngine.Object.FindFirstObjectByType<GameRuntime>();
   game.Act(s=>NarrativeBridge.Action(s,"name","AURA"));for(int i=0;i<5;i++)game.Act(s=>NarrativeBridge.Action(s,"continue"));game.Act(s=>NarrativeBridge.Action(s,"skip-tutorial"));
   game.Act(s=>{var n=s.Copy();n.Legacy.prepared=true;n.Story.enabled=false;n.Story.open=null;n.Story.queue=Array.Empty<string>();n.Story.seen=NarrativeCatalog.Dialogues.Select(d=>d.Id).ToArray();n.Story.tutorial="skipped";n.Retention.gems=100000;n.Workshop.components=Enumerable.Range(0,ItemBalance.ComponentIds.Length).Select(i=>i%4==0?0L:i==19?123456789L:i*17L).ToArray();return n;});
   Debug.Log("PREPARED ISOLATED CHEST/COMPONENT REVIEW: gems and material amounts supplied; actual shop transaction and saved receipt.");
  }
  [UnityTearDown] public IEnumerator Cleanup(){if(game!=null)UnityEngine.Object.Destroy(game.gameObject);yield return null;GameRuntime.SavePathOverride=null;}
  [UnityTest] public IEnumerator EveryComponentFitsAndDetailsKeepActualStock()
  {
   game.Show("items");yield return null;game.WorkshopView.ChangeMode("components");yield return null;var panel=game.WorkshopView.ComponentPanel;var ids=panel.Tiles.Select(t=>t.GetInstanceID()).ToArray();
   foreach(string language in new[]{"de","en"}){game.Act(s=>SettingsRules.Change(s,"language",language));foreach(int width in new[]{320,390,430}){PortraitGameView.Set(width,width==320?694:width==390?846:932);yield return null;yield return null;Canvas.ForceUpdateCanvases();var viewport=game.Content.GetComponentInParent<ScrollRect>().viewport;Assert.That(panel.Tiles.Length,Is.EqualTo(ItemBalance.ComponentIds.Length));foreach(var tile in panel.Tiles){Assert.That(tile.gameObject.activeInHierarchy,Is.True);var rect=(RectTransform)tile.transform;Assert.That(rect.rect.height,Is.GreaterThanOrEqualTo(44));var corners=new Vector3[4];rect.GetWorldCorners(corners);Assert.That(viewport.InverseTransformPoint(corners[0]).y,Is.GreaterThanOrEqualTo(viewport.rect.yMin-1),tile.name+" below view");Assert.That(viewport.InverseTransformPoint(corners[1]).y,Is.LessThanOrEqualTo(viewport.rect.yMax+1),tile.name+" above view");}}}
   game.Act(s=>{var n=s.Copy();n.Workshop.components[1]+=42;n.Workshop.revision++;return n;});yield return null;CollectionAssert.AreEqual(ids,panel.Tiles.Select(t=>t.GetInstanceID()).ToArray(),"Stock refresh reuses all component tiles");
   var before=game.State.Workshop.components.ToArray();panel.Tiles[0].onClick.Invoke();yield return null;Assert.That(game.WorkshopView.DetailRoot.activeInHierarchy,Is.True);Assert.That(game.WorkshopView.DetailPortrait.Art.sprite,Is.SameAs(game.WorkshopView.ComponentSprites[0]));Assert.That(GameObject.Find("Synthesis0").GetComponent<Button>().interactable,Is.False,"No data means no free synthesis");game.WorkshopView.CloseDetail();CollectionAssert.AreEqual(before,game.State.Workshop.components);
  }
  [UnityTest] public IEnumerator LidRemainsHingedOpenAndPresentationCannotGrant()
  {
   game.Show("market");yield return null;GameObject.Find("MarketOffer-chest:legendary").GetComponent<Button>().onClick.Invoke();var stage=game.GetComponent<RewardPresentation>().Current;var rig=stage.Chest;var hinge=rig.Body.rectTransform.anchoredPosition;var components=game.State.Workshop.components.ToArray();long revision=game.State.Rewards.shopRevision,gems=game.State.Retention.gems;
   yield return new WaitForSecondsRealtime(.65f);Assert.That(rig.Opening,Is.InRange(.1f,.99f));Assert.That(rig.Body.rectTransform.anchoredPosition,Is.EqualTo(hinge));Assert.That(rig.Frame,Is.InRange(0,5));
   yield return new WaitForSecondsRealtime(.48f);Assert.That(rig.Opening,Is.EqualTo(1));Assert.That(rig.Frame,Is.EqualTo(5));Assert.That(rig.Assembly.Find("ChestInterior"),Is.Null,"Synthetic cavity renderer is removed");Assert.That(rig.Lid.gameObject.activeSelf,Is.False);Assert.That(rig.Body.sprite,Is.SameAs(Resources.Load<PresentationArt>("PixelUI/PresentationArt").ChestOpening[23]));Assert.That(rig.Body.color.a,Is.GreaterThan(.99f),"Open chest stays visible while the saved loot emerges");Assert.That(stage.Portrait.Art.canvasRenderer.GetAlpha(),Is.GreaterThan(.5f));
   yield return new WaitForSecondsRealtime(.5f);Canvas.ForceUpdateCanvases();var itemLabel=stage.Rewards.GetComponentsInChildren<Text>().First(t=>t.name.StartsWith("ReceiptAmount")&&t.text.Contains("Lv."));var material=stage.Rewards.GetComponentsInChildren<Image>().First(i=>i.name.StartsWith("ReceiptIcon")&&i.canvasRenderer.GetAlpha()>.5f);var labelBounds=new Vector3[4];var materialBounds=new Vector3[4];itemLabel.rectTransform.GetWorldCorners(labelBounds);material.rectTransform.GetWorldCorners(materialBounds);Assert.That(labelBounds[0].y,Is.GreaterThan(materialBounds[1].y),"Item name must sit clear above material icons in the final composition");
   stage.Cancel();game.Act(s=>SettingsRules.Change(s,"toggle-effects"));GameObject.Find("MarketOffer-free-common").GetComponent<Button>().onClick.Invoke();stage=game.GetComponent<RewardPresentation>().Current;Assert.That(stage.IsAnimating,Is.False);Assert.That(stage.Chest.Opening,Is.EqualTo(1));Assert.That(stage.Body.color.a,Is.EqualTo(1));long last=game.State.Rewards.shopRevision;var stock=game.State.Workshop.components.ToArray();stage.CloseButton.onClick.Invoke();CollectionAssert.AreEqual(stock,game.State.Workshop.components);Assert.That(game.State.Rewards.shopRevision,Is.EqualTo(last));Assert.That(game.State.Retention.gems,Is.EqualTo(gems));Assert.That(last,Is.EqualTo(revision+1));
   var loaded=new AtomicSaveStore(save,new UnitySaveCodec()).Load(game.State.SavedAt);Assert.That(loaded.Writable,Is.True,loaded.Message);CollectionAssert.AreEqual(stock,loaded.State.Workshop.components);yield return SceneManager.LoadSceneAsync("IdleIntelligence");yield return null;game=UnityEngine.Object.FindFirstObjectByType<GameRuntime>();Assert.That(game.GetComponent<RewardPresentation>().Current,Is.Null);Assert.That(game.State.Rewards.shopRevision,Is.EqualTo(last));
  }
  [UnityTest] public IEnumerator RecordChestAndInventory()
  {
   bool refined=typeof(RewardStage).GetField("Chest")!=null;string output="/tmp/idle-chest-components-"+(refined?"after":"before");Directory.CreateDirectory(output);
   game.Show("items");yield return null;game.WorkshopView.ChangeMode("inventory");yield return null;
   foreach(string language in new[]{"de","en"}){game.Act(s=>SettingsRules.Change(s,"language",language));foreach(int width in new[]{320,390,430}){PortraitGameView.Set(width,width==320?694:width==390?846:932);yield return null;yield return null;Canvas.ForceUpdateCanvases();WorkshopTests.Capture(width,Screen.height,output+"/inventory-"+language+"-"+width+".png");}}
   PortraitGameView.Set(390,846);yield return null;yield return null;game.Show("market");yield return null;game.Audio.Unlock();var listener=game.GetComponent<AudioListener>();if(listener!=null)listener.enabled=false;var probe=new GameObject("ChestReviewAudio",typeof(AudioListener),typeof(ReviewAudioCapture));probe.transform.SetParent(game.transform);var audio=probe.GetComponent<ReviewAudioCapture>();audio.Begin();
   var times=new List<string>();float start=Time.realtimeSinceStartup;bool bought=false;int frame=0;long receipt=0;
   while(Time.realtimeSinceStartup-start<4.2f){if(!bought&&Time.realtimeSinceStartup-start>.45f){bought=true;var button=GameObject.Find("MarketOffer-chest:legendary").GetComponent<Button>();Assert.That(button.interactable,Is.True);button.onClick.Invoke();receipt=game.State.Rewards.shopRevision;var loaded=new AtomicSaveStore(save,new UnitySaveCodec()).Load(game.State.SavedAt);Assert.That(loaded.Writable,Is.True,loaded.Message);Assert.That(loaded.State.Rewards.shopRevision,Is.EqualTo(receipt));}
    times.Add((Time.realtimeSinceStartup-start).ToString("R",System.Globalization.CultureInfo.InvariantCulture));WorkshopTests.Capture(390,846,output+"/"+(frame++).ToString("D4")+".png");yield return null;
   }
   audio.Save(output);File.WriteAllLines(output+"/times.txt",times);Assert.That(game.State.Rewards.shopRevision,Is.EqualTo(receipt));Assert.That(game.GetComponent<RewardPresentation>().Current.IsAnimating,Is.False);
  }
 }
}
