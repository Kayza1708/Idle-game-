using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
namespace IdleIntelligence.Runtime
{
 // A fixed cabinet, registered rotor, packed bowl and a capsule following the
 // actual outlet. The capsule halves are original sprites, never a door squash.
 public sealed class CapsuleMachineRig : MonoBehaviour
 {
  readonly List<Image> balls=new List<Image>();
  Image body,crank,capsule,top,bottom;PresentationArt art;
  public Vector2 CapsulePosition {get;private set;}
  public bool Split {get;private set;}
  static void Place(Image image,Vector2 point,Vector2 size){var r=image.rectTransform;r.anchorMin=r.anchorMax=Vector2.one*.5f;r.pivot=Vector2.one*.5f;r.anchoredPosition=point;r.sizeDelta=size;image.preserveAspect=true;image.raycastTarget=false;}
  Image Part(string name){var i=WorkshopUIFactory.Node(name,transform,typeof(Image)).GetComponent<Image>();i.raycastTarget=false;return i;}
  public void Prepare(PresentationArt source,Image cabinet,Image rotor,Image shell,Image door)
  {
   art=source;body=cabinet;crank=rotor;capsule=shell;door.gameObject.SetActive(false);
   body.sprite=art.MachineEmpty;Place(body,new Vector2(0,28),new Vector2(208,312));
   crank.sprite=art.Crank;Place(crank,new Vector2(0,-19),Vector2.one*60);
   capsule.sprite=art.Capsule;capsule.color=Color.white;Place(capsule,new Vector2(0,-72),Vector2.one*36);
   if(top==null){top=Part("CapsuleUpperShell");bottom=Part("CapsuleLowerShell");}
   top.sprite=art.CapsuleTop;bottom.sprite=art.CapsuleBottom;
   while(balls.Count<12){var b=Part("BowlCapsule"+balls.Count);balls.Add(b);}
   var shades=new[]{Color.white,new Color(.5f,.75f,1),new Color(1,.65f,.85f),new Color(1,.9f,.45f)};
   for(int i=0;i<balls.Count;i++){balls[i].sprite=art.Capsule;balls[i].color=shades[i%shades.Length];Place(balls[i],Vector2.zero,Vector2.one*38);balls[i].transform.SetSiblingIndex(body.transform.GetSiblingIndex()+1);balls[i].gameObject.SetActive(true);}
   crank.transform.SetAsLastSibling();capsule.transform.SetAsLastSibling();bottom.transform.SetAsLastSibling();top.transform.SetAsLastSibling();Pose(0,false);
  }
  public void Pose(float t,bool reduced)
  {
   float turn=ReceiptMotion.Ease((t-.12f)/.62f),retire=ReceiptMotion.Ease((t-1.2f)/.32f);
   float alpha=1-retire;body.color=new Color(1,1,1,alpha);crank.color=body.color;
   crank.rectTransform.localRotation=Quaternion.Euler(0,0,-360*turn);
   for(int i=0;i<balls.Count;i++){
    int row=i<5?0:i<9?1:2,index=i-(row==0?0:row==1?5:9),count=5-row;
    float agitation=reduced?0:Mathf.Sin(Mathf.Clamp01((t-.12f)/.62f)*Mathf.PI);
    // Packed staggered rows stay within the bowl silhouette. Motion decays
    // into their original resting positions rather than orbiting through glass.
    var position=new Vector2((index-(count-1)*.5f)*28,55+row*25);
    position+=new Vector2(Mathf.Sin(t*19+i*1.7f)*2,Mathf.Abs(Mathf.Sin(t*17+i*2.1f))*5)*agitation;
    position+=new Vector2((i%3-1)*2,(i%2)*2);balls[i].rectTransform.localRotation=Quaternion.Euler(0,0,(i*47)%110-55);balls[i].rectTransform.anchoredPosition=position;balls[i].canvasRenderer.SetAlpha(alpha);
    balls[i].gameObject.SetActive(alpha>0);
   }
   float drop=Mathf.Clamp01((t-.76f)/.38f),lift=ReceiptMotion.Ease((t-1.18f)/.34f);
   float bounce=t>1.04f&&t<1.18f?Mathf.Sin((t-1.04f)/.14f*Mathf.PI)*7:0;
   CapsulePosition=Vector2.Lerp(new Vector2(0,Mathf.Lerp(-72,-142,drop*drop)+bounce),new Vector2(0,30),lift);
   float size=Mathf.Lerp(36,70,lift);Place(capsule,CapsulePosition,Vector2.one*size);
   capsule.rectTransform.localRotation=Quaternion.Euler(0,0,Mathf.Lerp(90,0,ReceiptMotion.Out(drop)));
   Split=t>=1.52f;capsule.gameObject.SetActive(t>=.76f&&!Split);top.gameObject.SetActive(Split);bottom.gameObject.SetActive(Split);
   float split=ReceiptMotion.Out((t-1.52f)/.26f),fade=1-ReceiptMotion.Ease((t-1.78f)/.18f);
   Place(top,CapsulePosition+new Vector2(0,26+split*28),new Vector2(90,54));
   Place(bottom,CapsulePosition+new Vector2(0,-18-split*14),new Vector2(90,36));
   top.color=bottom.color=new Color(1,1,1,fade);
   if(reduced){body.color=crank.color=Color.clear;foreach(var ball in balls)ball.gameObject.SetActive(false);capsule.gameObject.SetActive(false);top.gameObject.SetActive(false);bottom.gameObject.SetActive(false);}
  }
  public void Hide(){foreach(var b in balls)b.gameObject.SetActive(false);if(top!=null){top.gameObject.SetActive(false);bottom.gameObject.SetActive(false);}enabled=false;}
 }
}
