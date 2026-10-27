using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using IdleIntelligence.Core;
using UnityEngine;
using UnityEngine.EventSystems;
using UnityEngine.UI;

namespace IdleIntelligence.Runtime
{
 // Opt-in development acceptance only. Never loads or finances the normal save.
 public sealed class IsolatedChestReview : MonoBehaviour
 {
#if UNITY_EDITOR || DEVELOPMENT_BUILD
  GameRuntime game;string folder;readonly List<string> events=new List<string>();double began;
  [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.BeforeSceneLoad)]static void Boot(){if(Environment.GetEnvironmentVariable("IDLE_CHEST_REVIEW")!="1")return;GameRuntime.SavePathOverride=Path.Combine(Application.temporaryCachePath,"chest-review-"+Guid.NewGuid().ToString("N")+".json");var root=new GameObject("IsolatedChestReview");DontDestroyOnLoad(root);root.AddComponent<IsolatedChestReview>();}
  void Record(string text){events.Add((Time.realtimeSinceStartupAsDouble-began).ToString("F3",System.Globalization.CultureInfo.InvariantCulture)+" "+text);File.WriteAllLines(Path.Combine(folder,"actions.txt"),events);}
  IEnumerator Start()
  {
   folder=Path.Combine(Application.temporaryCachePath,"idle-chest-review");Directory.CreateDirectory(folder);began=Time.realtimeSinceStartupAsDouble;
   while((game=FindFirstObjectByType<GameRuntime>())==null||game.State==null)yield return null;
   game.Act(s=>NarrativeBridge.Action(s,"name","AURA"));game.Act(s=>{var n=s.Copy();n.Legacy.prepared=true;n.Retention.gems=100000;n.Story.enabled=false;n.Story.open=null;n.Story.queue=Array.Empty<string>();n.Story.seen=NarrativeCatalog.Dialogues.Select(d=>d.Id).ToArray();n.Story.tutorial="skipped";n.Workshop.components=Enumerable.Range(0,ItemBalance.ComponentIds.Length).Select(i=>i%4==0?0L:i==19?123456789L:17L*i).ToArray();return n;});
   Record("PREPARED isolated native review: supplied gems/components, actual shop payment and saved result; "+GameRuntime.SavePathOverride);
   game.Show("items");yield return null;game.WorkshopView.ChangeMode("inventory");yield return new WaitForSecondsRealtime(2);AssertStock();Record("All 20 component tiles shown");
   game.Show("market");yield return null;Canvas.ForceUpdateCanvases();var target=GameObject.Find("MarketOffer-chest:legendary").GetComponent<Button>();var scroll=game.Content.GetComponentInParent<ScrollRect>();var rect=(RectTransform)target.transform;float y=-((RectTransform)game.Content).InverseTransformPoint(rect.TransformPoint(rect.rect.center)).y;scroll.verticalNormalizedPosition=Mathf.Clamp01(1-(y-scroll.viewport.rect.height*.35f)/Mathf.Max(1,((RectTransform)game.Content).rect.height-scroll.viewport.rect.height));yield return new WaitForSecondsRealtime(1);Canvas.ForceUpdateCanvases();
   var pointer=new PointerEventData(EventSystem.current){position=RectTransformUtility.WorldToScreenPoint(null,target.transform.position),button=PointerEventData.InputButton.Left};var hits=new List<RaycastResult>();EventSystem.current.RaycastAll(pointer,hits);if(hits.Count==0||ExecuteEvents.GetEventHandler<IPointerClickHandler>(hits[0].gameObject)!=target.gameObject)throw new InvalidOperationException("Native chest target blocked");game.Audio.Unlock();ExecuteEvents.Execute(target.gameObject,pointer,ExecuteEvents.pointerDownHandler);yield return new WaitForSecondsRealtime(.08f);ExecuteEvents.Execute(target.gameObject,pointer,ExecuteEvents.pointerUpHandler);ExecuteEvents.Execute(target.gameObject,pointer,ExecuteEvents.pointerClickHandler);
   long receipt=game.State.Rewards.shopRevision;var saved=new AtomicSaveStore(game.SavePath,new UnitySaveCodec()).Load(game.State.SavedAt);if(!saved.Writable||saved.State.Rewards.shopRevision!=receipt)throw new InvalidOperationException("Chest not saved before animation");Record("Legendary chest paid and saved; receipt="+receipt);
   yield return new WaitForSecondsRealtime(1.12f);var stage=game.GetComponent<RewardPresentation>().Current;if(stage.Chest.Opening!=1||stage.Body.color.a<.99f)throw new InvalidOperationException("Native chest is not open during reveal");Record("Hinge fully open, original chest still visible, actual result emerging");yield return new WaitForSecondsRealtime(2);
   if(game.State.Rewards.shopRevision!=receipt)throw new InvalidOperationException("Animation changed receipt");game.Show("items");yield return null;game.WorkshopView.ChangeMode("inventory");yield return new WaitForSecondsRealtime(2);AssertStock();Record("COMPLETE: saved result in inventory; buildGUID="+Application.buildGUID);File.WriteAllText(Path.Combine(folder,"complete.txt"),"Actual prepared native chest/component run complete, no grant callbacks in animation.");
  }
  void AssertStock(){if(game.WorkshopView.ComponentPanel.Tiles.Length!=ItemBalance.ComponentIds.Length||game.WorkshopView.ComponentPanel.Tiles.Any(t=>!t.gameObject.activeInHierarchy))throw new InvalidOperationException("Component overview incomplete");}
#endif
 }
}
