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
 public sealed class MissionUITests
 {
  void OpenMenuRoute(string route){game.GetComponent<IdleIntelligence.Runtime.GameMenu>().Open();Click("Menu-"+route);}


  string dir;GameRuntime game;
  [UnitySetUp]public IEnumerator Setup(){dir=Path.Combine(Path.GetTempPath(),"unity-mission-ui-"+Guid.NewGuid());Directory.CreateDirectory(dir);GameRuntime.SavePathOverride=Path.Combine(dir,"save.json");yield return SceneManager.LoadSceneAsync("IdleIntelligence");yield return null;game=UnityEngine.Object.FindFirstObjectByType<GameRuntime>();}
  [UnityTearDown]public IEnumerator Cleanup(){if(game!=null)UnityEngine.Object.Destroy(game.gameObject);yield return null;GameRuntime.SavePathOverride=null;Directory.Delete(dir,true);}
  static Button B(string name){var b=GameObject.Find(name)?.GetComponent<Button>();Assert.That(b,Is.Not.Null,name);return b;}
  static void Click(string name){var b=B(name);Assert.That(b.interactable,Is.True,name);b.onClick.Invoke();}
  IEnumerator Open(){Click("ResearchTab");yield return null;OpenMenuRoute("missions");yield return null;}
  void ScrollTo(string name){Canvas.ForceUpdateCanvases();var scroll=game.Content.GetComponentInParent<ScrollRect>();var target=GameObject.Find(name).GetComponent<RectTransform>();var content=(RectTransform)game.Content;float y=-content.InverseTransformPoint(target.TransformPoint(target.rect.center)).y;scroll.verticalNormalizedPosition=Mathf.Clamp01(1-(y-scroll.viewport.rect.height*.3f)/Math.Max(1,content.rect.height-scroll.viewport.rect.height));Canvas.ForceUpdateCanvases();}
  void Prepare(){Debug.Log("FUNDED_MISSION_UI_STATE: lifetime counters prepared for isolated UI transaction tests; no natural-run claim");game.Act(s=>{var n=s.Copy();n.Industry.families[0]=true;foreach(var p in new[]{n.Missions.daily,n.Missions.weekly,n.Missions.monthly})foreach(var t in p.tasks)if(string.IsNullOrEmpty(t.objective)){var field=typeof(LifetimeState).GetField(t.metric);field.SetValue(n.Lifetime,Math.Max((double)field.GetValue(n.Lifetime),t.baseline+t.goal));}return n;});}
  [UnityTest]public IEnumerator ClaimBonusAndFrozenChoicePersistOnceDespiteOldCallbacksAndReload()
  {
   Prepare();yield return Open();var task=game.State.Missions.daily.tasks.First(t=>string.IsNullOrEmpty(t.objective));var old=B("Mission-"+task.id);long gems=game.State.Retention.gems;old.onClick.Invoke();old.onClick.Invoke();Assert.That(game.State.Retention.gems,Is.EqualTo(gems+task.reward));Assert.That(game.State.Missions.daily.tasks.First(t=>t.id==task.id).claimed,Is.True);var bonus=B("MissionBonus");bonus.onClick.Invoke();bonus.onClick.Invoke();Assert.That(game.State.Missions.boxes.earned,Is.EqualTo(1));Assert.That(game.State.Missions.boxes.pending.Length,Is.EqualTo(1));yield return null;ScrollTo("OpenBonusBox-1-0");WorkshopTests.Capture(390,844,"/tmp/unity-missions-funded-box-390.png");var open=B("OpenBonusBox-1-0");long before=game.State.Workshop.components[0];open.onClick.Invoke();open.onClick.Invoke();Assert.That(game.State.Workshop.components[0],Is.EqualTo(before+(long)MissionBalance.PackageAmounts[0]));Assert.That(game.State.Missions.boxes.opened,Is.EqualTo(1));var loaded=new AtomicSaveStore(game.SavePath,new UnitySaveCodec()).Load(game.State.SavedAt);Assert.That(loaded.Writable,Is.True,loaded.Message);Assert.That(loaded.State.Missions.boxes.opened,Is.EqualTo(1));Assert.That(loaded.State.Missions.daily.bonusClaimed,Is.True);Click("HardwareTab");yield return Open();Click("MissionPeriod-1");yield return null;Assert.That(game.State.Missions.weekly.tasks.Length,Is.EqualTo(12));Click("MissionPeriod-2");yield return null;Assert.That(game.State.Missions.monthly.tasks.Length,Is.EqualTo(30));Click("MissionPeriod-0");yield return null;foreach(int width in new[]{320,390,430}){WorkshopTests.Capture(width,width==320?568:width==390?844:932,"/tmp/unity-missions-funded-"+width+".png");}foreach(var b in game.Content.GetComponentsInChildren<Button>())Assert.That(b.GetComponent<RectTransform>().rect.height,Is.GreaterThanOrEqualTo(44),b.name);
  }
  [UnityTest]public IEnumerator AutomaticExpiryPaymentAlsoRollsBackWhenAtomicSaveFails()
  {Prepare();var p=game.State.Missions.daily;p.key="2000-01-01";long before=game.State.Retention.gems;int ledger=game.State.Retention.ledger.Length;File.WriteAllText(game.SavePath,"broken-expiry-original");yield return new WaitForSecondsRealtime(.25f);Assert.That(game.Writable,Is.False);Assert.That(game.State.Retention.gems,Is.EqualTo(before));Assert.That(game.State.Retention.ledger.Length,Is.EqualTo(ledger));Assert.That(game.State.Missions.daily.key,Is.EqualTo("2000-01-01"));Assert.That(File.ReadAllText(game.SavePath),Is.EqualTo("broken-expiry-original"));}
  [UnityTest]public IEnumerator FailedMissionSaveRollsBackClaimAndDisablesFurtherTransactions()
  {Prepare();yield return Open();var task=game.State.Missions.daily.tasks[0];long before=game.State.Retention.gems;File.WriteAllText(game.SavePath,"broken-original");Click("Mission-"+task.id);Assert.That(game.Writable,Is.False);Assert.That(game.State.Retention.gems,Is.EqualTo(before));Assert.That(game.State.Missions.daily.tasks[0].claimed,Is.False);Assert.That(File.ReadAllText(game.SavePath),Is.EqualTo("broken-original"));yield return null;Assert.That(B("Mission-"+task.id).interactable,Is.False);}
 }
}
