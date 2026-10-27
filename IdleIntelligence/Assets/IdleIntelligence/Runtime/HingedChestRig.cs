using UnityEngine;
using UnityEngine.UI;
namespace IdleIntelligence.Runtime
{
 // Authored poses share one registered base pivot. No rectangular lid cut or
 // synthetic cavity: the rear hinge and interior are part of the same drawing.
 public sealed class HingedChestRig : MonoBehaviour
 {
  public RectTransform Assembly;
  public Image Body,Lid;
  public float Opening {get;private set;}
  public int Frame {get;private set;}
  PresentationArt art;int tier;
  public Vector3 Mouth=>Assembly.TransformPoint(new Vector3(0,14,0));
  public void Prepare(PresentationArt source,int value)
  {
   art=source;tier=Mathf.Clamp(value,0,3);Assembly.gameObject.SetActive(true);
   Lid.gameObject.SetActive(false);
   var r=Body.rectTransform;r.anchorMin=r.anchorMax=Vector2.one*.5f;
   r.sizeDelta=Vector2.one*256;r.anchoredPosition=new Vector2(0,-100);
   Body.preserveAspect=false;Pose(0,0,0);SetOpacity(1);
  }
  public void Pose(float opening,float preparation,float settle)
  {
   Opening=Mathf.Clamp01(opening);Frame=Mathf.Min(5,Mathf.FloorToInt(Opening*6));
   var sprite=art.ChestOpening[tier*6+Frame];if(Body.sprite!=sprite){Body.sprite=sprite;Body.rectTransform.pivot=sprite.pivot/sprite.rect.size;}if(Body.rectTransform.sizeDelta!=sprite.rect.size)Body.rectTransform.sizeDelta=sprite.rect.size;
   // Translation keeps the base registered; no independent lid translation,
   // squash, rotation or synthetic extra rim can separate it from the body.
   Assembly.anchoredPosition=new Vector2(0,Mathf.Lerp(-22,-156,settle)+preparation*2);
   Assembly.localScale=Vector3.one*Mathf.Lerp(1,.46f,settle);
  }
  public void SetOpacity(float value){Body.color=new Color(1,1,1,value);}
 }
}
