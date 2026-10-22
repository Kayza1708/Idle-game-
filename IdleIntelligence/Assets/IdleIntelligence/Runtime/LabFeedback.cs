using UnityEngine;using UnityEngine.EventSystems;
namespace IdleIntelligence.Runtime {
 // Display-only receipt consumer: no economy, RNG, save or reward access.
 public sealed class LabFeedback:MonoBehaviour,IPointerDownHandler,IPointerUpHandler {
  Vector2 point;Camera pointerCamera;bool pending;float elapsed=1,activation=1;bool active,reduced;UnityEngine.UI.Text gain;EnergyRing ring;RectTransform stage;
  public void OnPointerDown(PointerEventData e){point=e.position;pointerCamera=e.pressEventCamera;pending=true;}
  public void OnPointerUp(PointerEventData e){point=e.position;pointerCamera=e.pressEventCamera;}
  public void Initialize(UnityEngine.UI.Text label){gain=label;stage=(RectTransform)transform.parent;var g=WorkshopUIFactory.Node("CoreEnergy",stage,typeof(EnergyRing));ring=g.GetComponent<EnergyRing>();ring.raycastTarget=false;var r=ring.rectTransform;r.anchorMin=r.anchorMax=new Vector2(.5f,.61f);r.sizeDelta=new Vector2(72,72);r.SetSiblingIndex(transform.GetSiblingIndex());}
  public void Receipt(string text,bool activated){if(gain==null)return;Vector2 local=Vector2.zero;if(pending)RectTransformUtility.ScreenPointToLocalPointInRectangle(stage,point,pointerCamera,out local);pending=false;float half=stage.rect.width/2;local.x=Mathf.Clamp(local.x,-half+40,half-40);local.y=Mathf.Clamp(local.y,-stage.rect.height/2+42,stage.rect.height/2-20);gain.rectTransform.anchoredPosition=local;gain.text=text;elapsed=0;if(activated)activation=0;}
  public void State(bool value,bool reduce){active=value;reduced=reduce;if(ring!=null)ring.gameObject.SetActive(active);}
  void OnDisable(){pending=false;elapsed=activation=1;if(gain!=null)gain.color=Color.clear;if(ring!=null)ring.gameObject.SetActive(false);}
  void LateUpdate(){if(gain==null)return;elapsed+=Time.unscaledDeltaTime;activation+=Time.unscaledDeltaTime;gain.color=new Color(GameTheme.Gold.r,GameTheme.Gold.g,GameTheme.Gold.b,Mathf.Clamp01((.45f-elapsed)*10));if(!reduced&&elapsed<.45f)gain.rectTransform.anchoredPosition+=Vector2.up*Time.unscaledDeltaTime*22;if(ring!=null){ring.Phase=reduced?0:Time.unscaledTime*.35f;ring.Pulse=reduced?0:Mathf.Max(0,1-activation/.5f);ring.SetVerticesDirty();}}
 }
 [RequireComponent(typeof(CanvasRenderer))]
 public sealed class EnergyRing:UnityEngine.UI.MaskableGraphic {
  public float Phase,Pulse;
  protected override void OnPopulateMesh(UnityEngine.UI.VertexHelper vh){vh.Clear();var r=GetPixelAdjustedRect();float radius=Mathf.Min(r.width,r.height)*(.4f+Pulse*.09f);for(int i=0;i<48;i++){float a=i*Mathf.PI*2/48,b=(i+1)*Mathf.PI*2/48;float glow=.25f+.5f*Mathf.Pow((1+Mathf.Cos(a-Phase*6.28f))*.5f,6);var tint=GameTheme.Gold;tint.a=glow;int n=vh.currentVertCount;foreach(var p in new[]{new Vector2(Mathf.Cos(a),Mathf.Sin(a))*(radius-1.5f),new Vector2(Mathf.Cos(a),Mathf.Sin(a))*radius,new Vector2(Mathf.Cos(b),Mathf.Sin(b))*radius,new Vector2(Mathf.Cos(b),Mathf.Sin(b))*(radius-1.5f)})vh.AddVert((Vector3)(r.center+p),tint,Vector2.zero);vh.AddTriangle(n,n+1,n+2);vh.AddTriangle(n,n+2,n+3);}}
 }
}
