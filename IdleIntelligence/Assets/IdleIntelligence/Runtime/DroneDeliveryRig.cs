using UnityEngine;
using UnityEngine.UI;
namespace IdleIntelligence.Runtime
{
 // Original delivery sheet, composed independently from the saved reward transaction.
 public sealed class DroneDeliveryRig : MonoBehaviour
 {
  static Sprite parcelSprite;Image craft,parcel;Vector2 origin;
  public static Sprite ParcelSprite {
   get {
    if(parcelSprite==null){var texture=Resources.Load<PresentationArt>("PixelUI/PresentationArt").Drone.texture;float x=texture.width/1774f,y=texture.height/887f;parcelSprite=Sprite.Create(texture,new Rect(1182*x,120*y,546*x,380*y),Vector2.one*.5f,100,0,SpriteMeshType.FullRect);parcelSprite.name="OriginalDeliveryParcel";}
    return parcelSprite;
   }
  }
  static Image Picture(string name,Transform parent,Sprite sprite,Vector2 size,Vector2 position){var image=WorkshopUIFactory.Node(name,parent,typeof(Image)).GetComponent<Image>();image.sprite=sprite;image.preserveAspect=true;image.raycastTarget=false;var r=image.rectTransform;r.anchorMin=r.anchorMax=Vector2.one*.5f;r.sizeDelta=size;r.anchoredPosition=position;return image;}
  public static void AttachParcel(Transform parent){
   foreach(float x in new[]{-9f,9f}){var wire=Picture("ParcelCable",parent,null,new Vector2(1,16),new Vector2(x,-7));wire.color=new Color(.7f,.8f,.8f);}
   Picture("HangingParcel",parent,ParcelSprite,new Vector2(38,28),new Vector2(0,-25));
  }
  public void Prepare(PresentationArt art,Vector2 source){
   if(craft==null){craft=Picture("DepartingDrone",transform,art.Drone,new Vector2(82,60),Vector2.zero);parcel=Picture("FallingParcel",transform,ParcelSprite,new Vector2(38,28),Vector2.zero);}
   var r=(RectTransform)transform;r.anchorMin=r.anchorMax=Vector2.one*.5f;r.anchoredPosition=Vector2.zero;r.sizeDelta=Vector2.zero;origin=source;gameObject.SetActive(true);Pose(0,false);
  }
  public void Pose(float time,bool reduced){
   float fall=Mathf.Clamp01((time-.12f)/.5f),launch=ReceiptMotion.Ease((time-.15f)/.65f),open=ReceiptMotion.Ease((time-.72f)/.28f);
   craft.rectTransform.anchoredPosition=origin+new Vector2(launch*75,24+launch*180);craft.color=new Color(1,1,1,reduced?0:1-launch);
   parcel.rectTransform.sizeDelta=Vector2.Lerp(new Vector2(38,28),new Vector2(52,38),fall);var landing=new Vector2(0,-38);parcel.rectTransform.anchoredPosition=Vector2.Lerp(origin+Vector2.down*25,landing,fall*fall)+Vector2.up*(time>.62f&&time<.82f?Mathf.Sin((time-.62f)/.2f*Mathf.PI)*8:0);
   parcel.rectTransform.localEulerAngles=new Vector3(0,0,(1-fall)*-8);parcel.rectTransform.localScale=Vector3.one*(1+.06f*Mathf.Sin(open*Mathf.PI));parcel.color=new Color(1,1,1,reduced?0:1-open);
  }
 }
}
