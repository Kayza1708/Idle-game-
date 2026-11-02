using UnityEngine;
namespace IdleIntelligence.Runtime
{
 // Shared steel window follows its actual content; long automation controls
 // keep the existing ScrollRect instead of growing beyond the safe area.
 public sealed class PrestigeDetailLayout:MonoBehaviour
 {
  public RectTransform Panel,Content;
  void LateUpdate(){if(Panel==null||Content==null)return;float available=((RectTransform)Panel.parent).rect.height*.9f;float desired=Mathf.Clamp(UnityEngine.UI.LayoutUtility.GetPreferredHeight(Content)+82,280,available);if(Mathf.Abs(Panel.rect.height-desired)>.5f)Panel.SetSizeWithCurrentAnchors(RectTransform.Axis.Vertical,desired);}
 }
}
