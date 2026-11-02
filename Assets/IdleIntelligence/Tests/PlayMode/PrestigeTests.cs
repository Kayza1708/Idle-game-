using System;using System.IO;using System.Linq;using System.Collections;using IdleIntelligence.Core;using IdleIntelligence.Runtime;using NUnit.Framework;using UnityEngine;using UnityEngine.UI;using UnityEngine.EventSystems;using UnityEngine.SceneManagement;using UnityEngine.TestTools;
namespace IdleIntelligence.PlayTests
{
 public sealed class PrestigeTests
 {
  string directory;GameRuntime game;
  [UnitySetUp]public IEnumerator Setup(){directory=Path.Combine(Path.GetTempPath(),"unity-prestige-"+Guid.NewGuid());Directory.CreateDirectory(directory);GameRuntime.SavePathOverride=Path.Combine(directory,"save.json");yield return SceneManager.LoadSceneAsync("IdleIntelligence");yield return null;game=UnityEngine.Object.FindFirstObjectByType<GameRuntime>();}
  [UnityTearDown]public IEnumerator Cleanup(){if(game!=null)UnityEngine.Object.Destroy(game.gameObject);yield return null;GameRuntime.SavePathOverride=null;if(Directory.Exists(directory))Directory.Delete(directory,true);}
  static void Click(string name){var b=GameObject.Find(name)?.GetComponent<Button>();Assert.That(b,Is.Not.Null,name);Assert.That(b.interactable,Is.True,name);b.onClick.Invoke();}
  void Fund(){game.Act(s=>{var n=s.Copy();n.Prestige.Cycle=ScientificNumber.From(1e14);n.Prestige.Total=n.Prestige.Cycle;n.Prestige.Free=n.Prestige.Cycle;n.Prestige.Entitlement=n.Prestige.Cycle.Add(ScientificNumber.From(100));return n;});}
  [UnityTest]public IEnumerator ConnectedNetworkPanPinchAndIndependentPurchasesUseRealLedger()
  {
   Fund();Click("PrestigeTab");yield return null;var view=game.PrestigeView;Assert.That(view.NodeCount,Is.EqualTo(60));Assert.That(view.GetComponentInChildren<NetworkWires>(),Is.Not.Null);var before=view.World.anchoredPosition;view.OnBeginDrag(new PointerEventData(EventSystem.current));view.OnDrag(new PointerEventData(EventSystem.current){delta=new Vector2(100,-60)});Assert.That(view.World.anchoredPosition,Is.Not.EqualTo(before));float z=view.Zoom;view.Pinch(new Vector2(-40,0),new Vector2(40,0),new Vector2(-70,0),new Vector2(70,0));Assert.That(view.Zoom,Is.GreaterThan(z));view.ZoomAt(100,Vector2.zero);Assert.That(view.Zoom,Is.EqualTo((float)PrestigeBalance.ZoomMax));view.Home();yield return new WaitForSecondsRealtime(.3f);
   Click("int-node-H10");Click("BuyINTNode");Assert.That(PrestigeRules.Has(game.State,"H10"),Is.True);Assert.That(PrestigeRules.Has(game.State,"H01"),Is.False,"Connections must not create predecessor purchases");view.CloseDetail();view.OpenNode("W01");Click("BuyINTNode");Assert.That(Workshop.ActiveSlots(game.State)[3],Is.True);Assert.That(game.State.Workshop.permanentSlots,Does.Contain("processorAux"));var load=new AtomicSaveStore(game.SavePath,new UnitySaveCodec()).Load(game.State.SavedAt);Assert.That(load.State.Prestige.Spent.CompareTo(game.State.Prestige.Spent),Is.Zero);
  }
  [UnityTest]public IEnumerator PrestigeIsDurableBeforeItsCosmeticAnimationAndReloadCannotReplay()
  {
   Fund();Click("PrestigeTab");yield return null;var view=game.PrestigeView;Click("PrestigeReset");Assert.That(game.State.Prestige.resets,Is.EqualTo(1));Assert.That(view.Pulse.IsAnimating,Is.True);Assert.That(new AtomicSaveStore(game.SavePath,new UnitySaveCodec()).Load(game.State.SavedAt).State.Prestige.resets,Is.EqualTo(1));view.Cancel();Click("HardwareTab");yield return null;yield return new WaitForSecondsRealtime(1.4f);Assert.That(game.State.Prestige.resets,Is.EqualTo(1));yield return SceneManager.LoadSceneAsync("IdleIntelligence");yield return null;game=UnityEngine.Object.FindFirstObjectByType<GameRuntime>();Assert.That(game.State.Prestige.resets,Is.EqualTo(1));Assert.That(PrestigeRules.Claim(game.State).IsZero,Is.True);
  }
  [UnityTest]public IEnumerator ReducedPrestigeAndMobileNetworkDetailsRender()
  {
   Fund();Click("PrestigeTab");yield return null;var view=game.PrestigeView;Click("ReducedPrestigeMotion");Assert.That(game.State.Workshop.reducedMotion,Is.True);Click("PrestigeReset");Assert.That(view.Pulse.IsAnimating,Is.False);Assert.That(view.Pulse.Message.text,Does.Contain("100"));view.Cancel();view.Home();view.GetComponentInParent<ScrollRect>().verticalNormalizedPosition=0;yield return null;WorkshopTests.Capture(320,568,"/tmp/unity-int-320.png");WorkshopTests.Capture(390,844,"/tmp/unity-int-390.png");WorkshopTests.Capture(430,932,"/tmp/unity-int-430.png");view.OpenNode("T06");yield return null;WorkshopTests.Capture(320,568,"/tmp/unity-int-details-320.png");Assert.That(GameObject.Find("BuyINTNode"),Is.Not.Null);view.CloseDetail();Click("ReducedPrestigeMotion");game.Act(s=>{var n=s.Copy();PrestigeRules.Earn(n,ScientificNumber.From(PrestigeRules.V("prestigeBaseRevenue")));return n;});yield return null;Click("PrestigeReset");Assert.That(view.Pulse.IsAnimating,Is.True);yield return new WaitForSecondsRealtime(.4f);WorkshopTests.Capture(390,844,"/tmp/unity-int-pulse.png");view.Cancel();
  }
 }
}
