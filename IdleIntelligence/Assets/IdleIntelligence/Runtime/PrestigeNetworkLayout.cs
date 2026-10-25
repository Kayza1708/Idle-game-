using UnityEngine;using UnityEngine.UI;
namespace IdleIntelligence.Runtime {
 // Keep the actual network visible, adapting only when the enclosing viewport changes.
 public sealed class PrestigeNetworkLayout:MonoBehaviour {
  public RectTransform Network;bool resizing;float lastAvailable=-1;ScrollRect enclosing;
  void LateUpdate(){if(Network==null)return;if(enclosing==null)enclosing=GetComponentInParent<ScrollRect>();if(enclosing!=null&&enclosing.viewport!=null&&Mathf.Abs(enclosing.viewport.rect.height-lastAvailable)>.5f)Resize();}
  void OnEnable()=>Resize();void OnRectTransformDimensionsChange()=>Resize();
  public void Resize(){if(resizing||Network==null)return;var scroll=GetComponentInParent<ScrollRect>();var group=GetComponent<VerticalLayoutGroup>();if(scroll==null||scroll.viewport==null||group==null)return;resizing=true;float available=scroll.viewport.rect.height;lastAvailable=available;float other=group.padding.vertical;int count=0;foreach(Transform child in transform){var element=child.GetComponent<LayoutElement>();if(!child.gameObject.activeSelf||element==null||element.ignoreLayout||child==Network)continue;other+=Mathf.Max(element.minHeight,element.preferredHeight);count++;}other+=group.spacing*count;float height=Mathf.Max(240,available-other);var view=Network.GetComponent<LayoutElement>();view.minHeight=view.preferredHeight=height;var root=GetComponent<LayoutElement>();root.minHeight=root.preferredHeight=height+other;resizing=false;}
 }
}
