using System.Collections;
using UnityEngine;
using UnityEngine.UI;
namespace IdleIntelligence.Runtime {
 // Cosmetic only. One coarse coroutine while the portrait is visible, no gameplay RNG.
 public sealed class MiraMotion:MonoBehaviour {
  Image image;GameRuntime game;MiraPortraitFrames frames;Coroutine motion;Vector2 origin;int showing=-1;
  public string Cue="explain";
  public static MiraMotion Attach(Image target,GameRuntime runtime,string cue="explain"){
   var result=target.GetComponent<MiraMotion>()??target.gameObject.AddComponent<MiraMotion>();result.image=target;result.game=runtime;result.Cue=cue;result.frames=Resources.Load<MiraPortraitFrames>("PixelUI/MiraPortraitFrames");result.origin=target.rectTransform.anchoredPosition;result.Restart();return result;
  }
  void Restart(){if(motion!=null)StopCoroutine(motion);if(isActiveAndEnabled&&image!=null)motion=StartCoroutine(Animate());}
  void OnEnable(){Restart();}
  void OnDisable(){if(motion!=null)StopCoroutine(motion);motion=null;if(image!=null)image.rectTransform.anchoredPosition=origin;}
  IEnumerator Animate(){var wait=new WaitForSecondsRealtime(.12f);while(true){
   if(frames?.Frames?.Length==6&&game?.State!=null){var s=game.State;bool reduced=s.Workshop.reducedMotion||!s.Settings.effects;string id=s.Story.open??"";bool milestone=Cue=="milestone"||id.Contains("prestige")||id.Contains("axiom")||id.Contains("company")||id.Contains("secret-lab");int expression=Cue=="warning"?4:milestone?5:Cue=="success"?3:Cue=="explain"?2:0;float age=(float)ReceiptMotion.Now;int next=reduced?expression:age%5.4f<.12f?1:expression;if(next!=showing){showing=next;image.sprite=frames.Frames[next];image.preserveAspect=true;}var position=origin+(reduced?Vector2.zero:new Vector2(0,Mathf.Round(Mathf.Sin(age*1.3f)*.65f)));if(image.rectTransform.anchoredPosition!=position)image.rectTransform.anchoredPosition=position;}
   yield return wait;
  }}
 }
}
