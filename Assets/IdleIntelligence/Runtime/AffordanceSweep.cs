using UnityEngine;using UnityEngine.UI;
namespace IdleIntelligence.Runtime {
 // A single bounded light pass when a main action becomes available; no per-frame allocation.
 public sealed class AffordanceSweep:MonoBehaviour {
  Button button;Image line;bool observed,ready;float time=1;double began=-1000;GameRuntime game;
  void Awake(){button=GetComponent<Button>();}
  void Update(){if(button==null)return;bool now=button.interactable;if(observed&&!ready&&now){time=0;began=ReceiptMotion.Now;}ready=now;observed=true;if(game==null)game=UnityEngine.Object.FindFirstObjectByType<GameRuntime>();bool reduced=game?.State==null||!game.State.Settings.effects||game.State.Workshop.reducedMotion;time=ReceiptMotion.Age(began);if(reduced||time>.35f){if(line!=null)line.gameObject.SetActive(false);return;}if(line==null){line=WorkshopUIFactory.Node("AffordableLightPass",transform,typeof(Image)).GetComponent<Image>();line.raycastTarget=false;line.rectTransform.anchorMin=line.rectTransform.anchorMax=new Vector2(0,.5f);line.rectTransform.sizeDelta=new Vector2(2,Mathf.Max(0,((RectTransform)transform).rect.height-14));}line.gameObject.SetActive(true);float width=((RectTransform)transform).rect.width;line.rectTransform.anchoredPosition=new Vector2(Mathf.Round(Mathf.Lerp(8,width-8,ReceiptMotion.Ease(time/.35f))),0);line.color=new Color(.7f,1,.85f,.4f*Mathf.Sin(time/.35f*Mathf.PI));}
 }
}
