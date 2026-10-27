using System;
using System.Linq;
using IdleIntelligence.Core;
using UnityEngine;
using UnityEngine.UI;
namespace IdleIntelligence.Runtime
{
 public sealed class SignalView:MonoBehaviour
 {
  GameRuntime game;Button button;Image icon;Text label;readonly System.Random random=new System.Random();string current="";Sprite drone;
  public void Initialize(GameRuntime runtime)
  {
   game=runtime;drone=Resources.Load<PresentationArt>("PixelUI/PresentationArt")?.Drone;button=WorkshopUIFactory.Button("LootSignal",transform,"",()=>{string id=current;game.GetComponent<RewardPresentation>()?.SetOrigin(button.transform);if(game.Act(s=>Signals.Claim(s,id,random.NextDouble),"signal-claim"))Update();});DestroyImmediate(button.GetComponent<LayoutElement>());button.GetComponent<Image>().color=Color.clear;var r=(RectTransform)button.transform;r.anchorMin=r.anchorMax=new Vector2(.5f,.5f);r.sizeDelta=new Vector2(96,106);label=button.GetComponentInChildren<Text>();label.fontSize=12;var shadow=label.gameObject.AddComponent<Shadow>();shadow.effectColor=new Color(0,0,0,.85f);shadow.effectDistance=new Vector2(1,-1);label.raycastTarget=false;label.alignment=TextAnchor.MiddleCenter;label.rectTransform.anchorMin=label.rectTransform.anchorMax=Vector2.one*.5f;label.rectTransform.sizeDelta=new Vector2(24,20);label.rectTransform.anchoredPosition=new Vector2(34,-25);var art=WorkshopUIFactory.Node("SignalArt",button.transform,typeof(Image));icon=art.GetComponent<Image>();icon.preserveAspect=true;icon.raycastTarget=false;var ir=(RectTransform)art.transform;ir.anchorMin=ir.anchorMax=new Vector2(.5f,.5f);ir.pivot=new Vector2(.5f,.5f);ir.sizeDelta=new Vector2(82,60);ir.anchoredPosition=new Vector2(0,24);DroneDeliveryRig.AttachParcel(button.transform);button.gameObject.SetActive(false);
  }
  void Update()
  {
   if(game?.State==null||button==null)return;var s=game.State;var drop=s.Signals.visible.FirstOrDefault(d=>d.expiresAt>=s.SavedAt);bool visible=drop!=null&&!ChallengeRules.Is(s,"no-taps");button.gameObject.SetActive(visible);if(!visible){current="";return;}current=drop.id;button.interactable=game.Writable;label.text=Math.Max(0,Math.Ceiling((drop.expiresAt-s.SavedAt)/1000))+"s";icon.sprite=drone;var parent=(RectTransform)transform;var r=(RectTransform)button.transform;float drift=s.Workshop.reducedMotion||!s.Settings.effects?0:Mathf.Sin(Time.unscaledTime*1.2f)*12;r.anchoredPosition=new Vector2(Mathf.Clamp((float)(drop.x/100-.5)*parent.rect.width+drift,-parent.rect.width/2+48,parent.rect.width/2-48),Mathf.Clamp((float)(.5-drop.y/100)*parent.rect.height,-parent.rect.height/2+53,parent.rect.height/2-53));if(button.transform.GetSiblingIndex()!=transform.childCount-1)button.transform.SetAsLastSibling();
  }
 }
}
