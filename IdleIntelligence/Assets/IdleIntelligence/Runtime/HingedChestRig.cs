using UnityEngine;
using UnityEngine.UI;

namespace IdleIntelligence.Runtime
{
 public sealed class HingedChestRig : MonoBehaviour
 {
  public RectTransform Assembly;
  public Image Body,Lid;
  public HingedLidMesh Hinge;
  public ChestWellGraphic Well;
  public float Opening=>Hinge.Opening;
  public Vector3 Mouth=>Assembly.TransformPoint(new Vector3(0,10,0));
  public void Prepare(PresentationArt art,int tier)
  {
   Assembly.gameObject.SetActive(true);Body.sprite=art.ChestBody[tier];Hinge.Exterior=art.ChestLid[tier];Hinge.Interior=art.ChestInner[tier];Hinge.SetOpening(0);
   Body.rectTransform.anchorMin=Body.rectTransform.anchorMax=Vector2.one*.5f;Body.rectTransform.pivot=Vector2.one*.5f;
   Body.rectTransform.sizeDelta=new Vector2(256,256*290f/627);Body.rectTransform.anchoredPosition=new Vector2(0,256*(145f/627-.5f));
   Lid.rectTransform.anchorMin=Lid.rectTransform.anchorMax=Vector2.one*.5f;Lid.rectTransform.pivot=new Vector2(.626f,.423f);
   Lid.rectTransform.sizeDelta=new Vector2(256,256*337f/627);Lid.rectTransform.anchoredPosition=new Vector2(256*(.626f-.5f),256*((290+337*.423f)/627-.5f));
   Lid.rectTransform.localScale=Vector3.one;Lid.rectTransform.localRotation=Quaternion.identity;Body.preserveAspect=Lid.preserveAspect=false;
   Well.Accent=ItemPortrait.RarityColor(tier==0?0:tier+1);Well.SetVerticesDirty();Pose(0,0,0);SetOpacity(1);
  }
  public void Pose(float opening,float preparation,float settle)
  {
   Assembly.anchoredPosition=new Vector2(preparation*2,Mathf.Lerp(-48,-160,settle));Assembly.localScale=Vector3.one*Mathf.Lerp(1,.55f,settle);
   if(Hinge.Opening!=Mathf.Clamp01(opening))Hinge.SetOpening(opening);
   Well.gameObject.SetActive(opening>.025f);
  }
  public void SetOpacity(float opacity){Body.color=Lid.color=new Color(1,1,1,opacity);Well.canvasRenderer.SetAlpha(opacity);}
 }
}
