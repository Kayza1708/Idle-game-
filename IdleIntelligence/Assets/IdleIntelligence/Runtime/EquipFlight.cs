using System.Collections;
using IdleIntelligence.Core;
using UnityEngine;
using UnityEngine.UI;
namespace IdleIntelligence.Runtime {
 // One bounded visual receipt. The saved equipment is never changed here.
 public sealed class EquipFlight:MonoBehaviour {
  Coroutine running;GameObject layer;ItemPortrait target;string caption;
  public bool IsAnimating=>running!=null;
  public void Cancel(){if(running!=null)StopCoroutine(running);running=null;if(target!=null){target.Art.canvasRenderer.SetAlpha(1);target.Caption.text=caption;}if(layer!=null){layer.SetActive(false);Destroy(layer);}layer=null;target=null;}
  void OnDisable()=>Cancel();
  public void Play(ItemPortrait prefab,ItemInstance item,Vector3 origin,ItemPortrait destination,string effect,bool reduced){Cancel();if(reduced||destination==null)return;target=destination;caption=target.Caption.text;layer=WorkshopUIFactory.Node("EquipmentFlightLayer",GetComponentInParent<Canvas>().transform);WorkshopUIFactory.Fill((RectTransform)layer.transform);layer.transform.SetAsLastSibling();running=StartCoroutine(Fly(prefab,item,origin,effect));}
  IEnumerator Fly(ItemPortrait prefab,ItemInstance item,Vector3 origin,string effect){Canvas.ForceUpdateCanvases();var root=(RectTransform)layer.transform;var ghost=Instantiate(prefab,root);ghost.name="EquippingItem";ghost.ShowLevel=false;ghost.Bind(item);ghost.Button.interactable=false;foreach(var g in ghost.GetComponentsInChildren<Graphic>())g.raycastTarget=false;var r=(RectTransform)ghost.transform;r.anchorMin=r.anchorMax=new Vector2(.5f,.5f);r.sizeDelta=new Vector2(130,130);Vector2 start=root.InverseTransformPoint(origin),end=root.InverseTransformPoint(target.Frame.transform.position);target.Art.canvasRenderer.SetAlpha(0);float time=0;while(time<.65f){time+=Time.unscaledDeltaTime;float t=Mathf.Clamp01(time/.65f),p=t*t*(3-2*t);r.anchoredPosition=Vector2.Lerp(start,end,p)+Vector2.up*(Mathf.Sin(t*Mathf.PI)*38);r.sizeDelta=Vector2.Lerp(new Vector2(130,130),target.Frame.rectTransform.rect.size*.85f,p);yield return null;}ghost.gameObject.SetActive(false);target.Art.canvasRenderer.SetAlpha(1);PanelMotion.Play(target.gameObject,false,true);var label=WorkshopUIFactory.Label("EquipmentEffectReceipt",root,System.Text.RegularExpressions.Regex.Replace(effect,"<.*?>","").Replace("\n"," · "),14);Destroy(label.GetComponent<LayoutElement>());var lr=label.rectTransform;lr.anchorMin=new Vector2(.05f,.13f);lr.anchorMax=new Vector2(.95f,.13f);lr.sizeDelta=new Vector2(0,54);lr.anchoredPosition=Vector2.zero;label.alignment=TextAnchor.MiddleCenter;label.color=ItemPortrait.RarityColor(item.rarity);target.Caption.text=caption+" ✓";yield return new WaitForSecondsRealtime(.6f);running=null;Cancel();}
 }
}
