using UnityEngine;using UnityEngine.UI;
namespace IdleIntelligence.Runtime {
 // One authored sprite sequence per named local anchor; repeats replace the previous receipt.
 public sealed class PixelImpact:MonoBehaviour {
  static Sprite[] frames;Image image;float elapsed=1,duration;Color tint;double began;
  public static void Play(Transform parent,string key,Vector2 position,float size,Color color,float seconds=.22f){var child=parent.Find(key);if(child==null)child=WorkshopUIFactory.Node(key,parent,typeof(Image),typeof(PixelImpact)).transform;var fx=child.GetComponent<PixelImpact>();fx.image=child.GetComponent<Image>();fx.image.raycastTarget=false;var r=fx.image.rectTransform;r.anchorMin=r.anchorMax=new Vector2(.5f,.5f);r.anchoredPosition=position;r.sizeDelta=Vector2.one*size;fx.elapsed=0;fx.began=ReceiptMotion.Now;fx.duration=seconds;fx.tint=color;if(frames==null)frames=Resources.Load<ForgeSequence>("PixelUI/ForgeSequence").ImpactFrames;fx.image.sprite=frames[0];fx.image.color=Color.white;fx.image.enabled=true;}
  void LateUpdate(){if(image==null||!image.enabled)return;elapsed=ReceiptMotion.Age(began);float t=elapsed/duration;if(t>=1){image.enabled=false;return;}image.sprite=frames[Mathf.Min(frames.Length-1,(int)(t*frames.Length))];image.color=Color.Lerp(Color.white,tint,Mathf.Clamp01(t*3));}
  void OnDisable(){if(image!=null)image.enabled=false;elapsed=1;}
 }
}
