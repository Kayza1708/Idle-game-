using System;
using System.IO;
using System.Linq;
using System.Collections;
using IdleIntelligence.Core;
using IdleIntelligence.Runtime;
using NUnit.Framework;
using UnityEngine;
using UnityEngine.UI;
using UnityEngine.EventSystems;
using System.Collections.Generic;
using UnityEngine.SceneManagement;
using UnityEngine.TestTools;
namespace IdleIntelligence.PlayTests
{
 public sealed class SignalUITests
 {
  string dir;GameRuntime game;
  [UnitySetUp]public IEnumerator Setup(){
#if UNITY_EDITOR
PortraitGameView.Set();
#endif
yield return null;dir=Path.Combine(Path.GetTempPath(),"unity-signal-ui-"+Guid.NewGuid());Directory.CreateDirectory(dir);GameRuntime.SavePathOverride=Path.Combine(dir,"save.json");yield return SceneManager.LoadSceneAsync("IdleIntelligence");yield return null;game=UnityEngine.Object.FindFirstObjectByType<GameRuntime>();}
  [UnityTearDown]public IEnumerator Cleanup(){if(game!=null)UnityEngine.Object.Destroy(game.gameObject);yield return null;GameRuntime.SavePathOverride=null;Directory.Delete(dir,true);}
  void Prepare(){Debug.Log("PREPARED_SIGNAL_UI_STATE: elapsed active-drop progress only; no direct item or credit grant");game.Act(s=>{var n=s.Copy();n.Signals.progress=Signals.Interval(n);return n;});}
  [UnityTest]public IEnumerator VisibleLabSignalUsesRealClaimAndSavesExactlyOnce()
  {Prepare();yield return new WaitForSecondsRealtime(.2f);var button=GameObject.Find("LootSignal")?.GetComponent<Button>();Assert.That(button,Is.Not.Null);Assert.That(button.interactable,Is.True);Assert.That(button.GetComponent<RectTransform>().rect.height,Is.GreaterThanOrEqualTo(44));foreach(int width in new[]{320,390,430})WorkshopTests.Capture(width,width==320?568:width==390?844:932,"/tmp/unity-signals-prepared-"+width+".png");long components=game.State.Workshop.components.Sum();double count=game.State.Lifetime.dropsClaimed;yield return null;Canvas.ForceUpdateCanvases();var data=new PointerEventData(EventSystem.current){position=RectTransformUtility.WorldToScreenPoint(null,button.transform.position)};var hits=new List<RaycastResult>();EventSystem.current.RaycastAll(data,hits);File.WriteAllLines("/tmp/idle-signal-raycast.txt",hits.Select(h=>h.gameObject.name+" pos="+data.position+" mode="+button.GetComponentInParent<Canvas>().renderMode+" button="+button.transform.position+" root="+button.GetComponentInParent<Canvas>().rootCanvas.name));Assert.That(hits.Count,Is.GreaterThan(0));Assert.That(ExecuteEvents.GetEventHandler<IPointerClickHandler>(hits[0].gameObject),Is.EqualTo(button.gameObject),"Visible drone must be the first real raycast target");ExecuteEvents.Execute(button.gameObject,data,ExecuteEvents.pointerClickHandler);button.onClick.Invoke();Assert.That(game.State.Signals.visible,Is.Empty);Assert.That(game.State.Lifetime.dropsClaimed,Is.EqualTo(count+1));Assert.That(game.State.Workshop.components.Sum(),Is.GreaterThan(components));var loaded=new AtomicSaveStore(game.SavePath,new UnitySaveCodec()).Load(game.State.SavedAt);Assert.That(loaded.Writable,Is.True,loaded.Message);Assert.That(loaded.State.Lifetime.dropsClaimed,Is.EqualTo(count+1));Assert.That(loaded.State.Signals.visible,Is.Empty);yield return null;Assert.That(GameObject.Find("LootSignal"),Is.Null);}
  [UnityTest]public IEnumerator SignalSaveFailureKeepsRewardAndVisibleReceiptUnconsumed()
  {Prepare();yield return new WaitForSecondsRealtime(.2f);var button=GameObject.Find("LootSignal").GetComponent<Button>();double count=game.State.Lifetime.dropsClaimed;long components=game.State.Workshop.components.Sum();string id=game.State.Signals.visible.Single().id;File.WriteAllText(game.SavePath,"signal-damaged-original");button.onClick.Invoke();Assert.That(game.Writable,Is.False);Assert.That(game.State.Lifetime.dropsClaimed,Is.EqualTo(count));Assert.That(game.State.Workshop.components.Sum(),Is.EqualTo(components));Assert.That(game.State.Signals.visible.Single().id,Is.EqualTo(id));Assert.That(File.ReadAllText(game.SavePath),Is.EqualTo("signal-damaged-original"));}
  [UnityTest]public IEnumerator HitTargetTracksMotionAndReducedModeThenExpiryCannotReward(){Prepare();yield return new WaitForSecondsRealtime(.2f);var button=GameObject.Find("LootSignal").GetComponent<Button>();var first=button.transform.position;yield return new WaitForSecondsRealtime(.25f);Assert.That(button.transform.position,Is.Not.EqualTo(first));game.Act(s=>{var n=s.Copy();n.Workshop.reducedMotion=true;return n;});yield return null;first=button.transform.position;yield return new WaitForSecondsRealtime(.25f);Assert.That(button.transform.position,Is.EqualTo(first));double count=game.State.Lifetime.dropsClaimed;string id=game.State.Signals.visible[0].id;game.Act(s=>Game.Advance(s,s.Signals.visible[0].expiresAt+1,false));yield return null;Assert.That(button.gameObject.activeSelf,Is.False);game.Act(s=>Signals.Claim(s,id,()=>.5));Assert.That(game.State.Lifetime.dropsClaimed,Is.EqualTo(count));}

 }
}
