using System.Collections;using System.Collections.Generic;using UnityEngine;
namespace IdleIntelligence.Runtime {
 // Short interruptible reveal/pulse. UI remains interactive throughout; no grants or saves.
 public sealed class PanelMotion:MonoBehaviour {
  Coroutine routine;readonly List<GameObject> sparks=new List<GameObject>();CanvasGroup group;
  public static void Play(GameObject target,bool reduced,bool portrait){var fx=target.GetComponent<PanelMotion>()??target.AddComponent<PanelMotion>();fx.Cancel();if(!reduced&&target.activeInHierarchy)fx.routine=fx.StartCoroutine(fx.Reveal(portrait));}
  void Cancel(){var portrait=GetComponent<ItemPortrait>();if(portrait!=null)portrait.Art.canvasRenderer.SetAlpha(1);if(routine!=null)StopCoroutine(routine);routine=null;transform.localScale=Vector3.one;if(group!=null)group.alpha=1;foreach(var s in sparks)if(s!=null)Destroy(s);sparks.Clear();}
  void OnDisable()=>Cancel();
  IEnumerator Reveal(bool portrait){group=GetComponent<CanvasGroup>();if(group==null)group=gameObject.AddComponent<CanvasGroup>();var curve=AnimationCurve.EaseInOut(0,0,1,1);if(portrait){var tint=GetComponent<ItemPortrait>()?.Frame.color??GameTheme.Accent;for(int i=0;i<6;i++){var dot=WorkshopUIFactory.Node("RevealPixel",transform,typeof(UnityEngine.UI.Image));dot.GetComponent<UnityEngine.UI.Image>().color=tint;dot.GetComponent<UnityEngine.UI.Image>().raycastTarget=false;var r=(RectTransform)dot.transform;r.anchorMin=r.anchorMax=new Vector2(.5f,.58f);r.sizeDelta=Vector2.one*3;sparks.Add(dot);}}
   float elapsed=0;while(elapsed<.32f){elapsed+=Time.unscaledDeltaTime;float t=Mathf.Clamp01(elapsed/.24f),p=curve.Evaluate(t);var item=GetComponent<ItemPortrait>();if(portrait&&item!=null)item.Art.canvasRenderer.SetAlpha(Mathf.Clamp01((elapsed-.05f)/.16f));transform.localScale=Vector3.one*Mathf.Lerp(portrait ? .91f : .98f,1,p);group.alpha=Mathf.Lerp(.65f,1,p);for(int i=0;i<sparks.Count;i++){float a=i*Mathf.PI/3;var dot=sparks[i];((RectTransform)dot.transform).anchoredPosition=new Vector2(Mathf.Cos(a),Mathf.Sin(a))*(Mathf.Min(((RectTransform)transform).rect.width,((RectTransform)transform).rect.height)*(.36f+.13f*p));var image=dot.GetComponent<UnityEngine.UI.Image>();var c=image.color;c.a=1-p;image.color=c;}yield return null;}routine=null;Cancel();
  }
 }
}
