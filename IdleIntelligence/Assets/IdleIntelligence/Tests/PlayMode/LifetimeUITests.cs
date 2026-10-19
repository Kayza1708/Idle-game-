using System;
using System.IO;
using System.Collections;
using System.Linq;
using IdleIntelligence.Core;
using IdleIntelligence.Runtime;
using NUnit.Framework;
using UnityEngine;
using UnityEngine.UI;
using UnityEngine.SceneManagement;
using UnityEngine.TestTools;
namespace IdleIntelligence.PlayTests
{
 public sealed class LifetimeUITests
 {
  string dir;GameRuntime game;
  [UnitySetUp]public IEnumerator Setup(){dir=Path.Combine(Path.GetTempPath(),"unity-lifetime-ui-"+Guid.NewGuid());Directory.CreateDirectory(dir);GameRuntime.SavePathOverride=Path.Combine(dir,"save.json");yield return SceneManager.LoadSceneAsync("IdleIntelligence");yield return null;game=UnityEngine.Object.FindFirstObjectByType<GameRuntime>();}
  [UnityTearDown]public IEnumerator Cleanup(){if(game!=null)UnityEngine.Object.Destroy(game.gameObject);yield return null;GameRuntime.SavePathOverride=null;Directory.Delete(dir,true);}
  static void Click(string name){var button=GameObject.Find(name)?.GetComponent<Button>();Assert.That(button,Is.Not.Null,name);Assert.That(button.interactable,Is.True,name);button.onClick.Invoke();}
  [UnityTest]public IEnumerator ActualHardwareEventsShowInMobileStatisticsAndSurviveReload()
  {
   Debug.Log("FUNDED_LIFETIME_UI_STATE: temporary test save; no natural progression claim");
   game.Act(s=>{var n=s.Copy();n.Credits=ScientificNumber.From(1e40);return Game.Buy(n,"calculator",510);});
   Click("ResearchTab");yield return new WaitForSecondsRealtime(.3f);Assert.That(game.Content.Cast<Transform>().Count(t=>t.name=="ProgressAccess"&&t.gameObject.activeInHierarchy),Is.EqualTo(1));Click("ProgressAccess");yield return null;
   Assert.That(GameObject.Find("LifetimeSummary").GetComponent<Text>().alignment,Is.EqualTo(TextAnchor.UpperLeft),"Statistics must start at the top of their scroll area");Assert.That(GameObject.Find("LifetimeSummary").GetComponent<Text>().text,Does.Contain("Hardware gekauft: 510"));Assert.That(GameObject.Find("Mastery-calculator").GetComponent<Text>().text,Does.Contain("Mastery 1"));
   WorkshopTests.Capture(320,568,"/tmp/unity-lifetime-funded-320.png");WorkshopTests.Capture(390,844,"/tmp/unity-lifetime-funded-390.png");WorkshopTests.Capture(430,932,"/tmp/unity-lifetime-funded-430.png");
   game.Content.GetComponentInParent<ScrollRect>().verticalNormalizedPosition=0;yield return null;Assert.That(GameObject.Find("Mastery-matrioshka"),Is.Not.Null);
   var before=game.State.Lifetime.Copy();yield return SceneManager.LoadSceneAsync("IdleIntelligence");yield return null;game=UnityEngine.Object.FindFirstObjectByType<GameRuntime>();Assert.That(game.State.Lifetime.hardwareBought,Is.EqualTo(before.hardwareBought));Assert.That(game.State.Lifetime.hardwareMasteryXp,Is.EqualTo(before.hardwareMasteryXp));
  }
  [UnityTest]public IEnumerator SuspendedTimeIsConsumedOnceWithoutActiveTimeCredit()
  {
   game.SendMessage("OnApplicationPause",true);double before=game.State.Lifetime.activeSeconds;double saved=game.State.SavedAt;
   yield return new WaitForSecondsRealtime(.25f);game.SendMessage("OnApplicationPause",false);
   Assert.That(game.State.SavedAt,Is.GreaterThan(saved));Assert.That(game.State.Lifetime.activeSeconds,Is.EqualTo(before),"Resume consumes background interval as offline before foreground updates");
   var stored=new AtomicSaveStore(game.SavePath,new UnitySaveCodec()).Load(game.State.SavedAt);Assert.That(stored.Writable,Is.True,stored.Message);Assert.That(stored.State.Lifetime.activeSeconds,Is.EqualTo(before));
  }
 }
}
