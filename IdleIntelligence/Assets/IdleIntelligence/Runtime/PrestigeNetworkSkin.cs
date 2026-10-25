using UnityEngine;
namespace IdleIntelligence.Runtime
{
 // Shared presentation only: no progression rules, prices or save fields.
 public static class PrestigeNetworkSkin
 {
  public static void Node(PrestigeNodeView node)
  {
   var r=(RectTransform)node.transform;r.sizeDelta=new Vector2(120,132);
   GameTheme.SurfaceOn(node.Panel,GameTheme.Surface);node.Panel.pixelsPerUnitMultiplier=12;
   GameTheme.ButtonStyle(node.Button);node.Panel.pixelsPerUnitMultiplier=12;
   foreach(var outline in node.GetComponents<UnityEngine.UI.Outline>())outline.enabled=false;
   Place(node.Title.rectTransform,new Vector2(0,45),new Vector2(108,34));
   node.Title.font=GameTheme.Bold;node.Title.fontSize=14;node.Title.resizeTextForBestFit=true;node.Title.resizeTextMinSize=12;node.Title.resizeTextMaxSize=14;node.Title.alignment=TextAnchor.MiddleCenter;node.Title.raycastTarget=false;
   Place(node.Art.rectTransform,new Vector2(0,-3),Vector2.one*56);node.Art.raycastTarget=false;
   Place(node.Price.rectTransform,new Vector2(0,-49),new Vector2(108,22));node.Price.font=GameTheme.Bold;node.Price.fontSize=14;node.Price.alignment=TextAnchor.MiddleCenter;node.Price.raycastTarget=false;
  }
  static void Place(RectTransform r,Vector2 position,Vector2 size){r.anchorMin=r.anchorMax=Vector2.one*.5f;r.pivot=Vector2.one*.5f;r.anchoredPosition=position;r.sizeDelta=size;}
  static void Bar(Transform bar)
  {
   if(bar==null)return;
   var image=bar.GetComponent<UnityEngine.UI.Image>()??bar.gameObject.AddComponent<UnityEngine.UI.Image>();image.color=GameTheme.Hex("102331");image.raycastTarget=false;
   foreach(var button in bar.GetComponentsInChildren<UnityEngine.UI.Button>(true)){GameTheme.CompactAction(button,false);foreach(var text in button.GetComponentsInChildren<UnityEngine.UI.Text>()){text.rectTransform.offsetMin=new Vector2(4,4);text.rectTransform.offsetMax=new Vector2(-4,-4);text.resizeTextForBestFit=false;text.fontSize=button.name=="ZoomOut"||button.name=="ZoomIn"?22:12;}}
  }
  public static void Apply(PrestigeNetworkView view)
  {
   foreach(var text in view.GetComponentsInChildren<UnityEngine.UI.Text>(true)){if(text.GetComponentInParent<PrestigeNodeView>()==null){text.font=GameTheme.Body;text.color=GameTheme.Text;}}
   foreach(var button in view.GetComponentsInChildren<UnityEngine.UI.Button>(true))if(button.GetComponent<PrestigeNodeView>()==null)GameTheme.ButtonStyle(button);
   Bar(view.transform.Find("NetworkTools"));Bar(view.transform.Find("Branches"));Bar(view.transform.Find("NetworkAccess"));
   view.Ledger.font=GameTheme.Bold;view.Ledger.fontSize=14;view.Ledger.alignment=TextAnchor.MiddleLeft;
   GameTheme.ButtonStyle(view.ResetButton,true);
   view.Viewport.GetComponent<UnityEngine.UI.Image>().color=GameTheme.Hex("08131F");
   var core=view.World.Find("INTCore").GetComponent<UnityEngine.UI.Button>();GameTheme.ButtonStyle(core);core.GetComponent<UnityEngine.UI.Image>().color=new Color(.65f,.95f,1);
   var label=core.GetComponentInChildren<UnityEngine.UI.Text>();label.font=GameTheme.Display;label.fontSize=18;
   var coreArt=core.transform.Find("INTCoreArt");Place((RectTransform)coreArt,new Vector2(0,9),Vector2.one*60);Place(label.rectTransform,new Vector2(0,-33),new Vector2(90,22));
   var hint=view.transform.Find("GestureHint").GetComponent<UnityEngine.UI.Text>();hint.font=GameTheme.Body;hint.fontSize=12;hint.color=GameTheme.Muted;
  }
 }
}
