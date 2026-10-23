using UnityEngine;using UnityEngine.UI;
namespace IdleIntelligence.Runtime {
 // Sparse authored accents at the original conduit/monitor locations. Never advances the game.
 public sealed class LaboratoryAmbient:MonoBehaviour {
  GameRuntime game;RectTransform stage;Image puff;readonly Image[] monitors=new Image[3],packets=new Image[4];float phase;
  public void Initialize(GameRuntime runtime,RectTransform parent){game=runtime;stage=parent;var art=Resources.Load<PresentationArt>("PixelUI/PresentationArt");if(art==null){enabled=false;return;}puff=Image("VentSteam",art.Steam,new Vector2(22,26));for(int i=0;i<3;i++)monitors[i]=Image("MonitorScan"+i,null,new Vector2(13,2));for(int i=0;i<4;i++)packets[i]=Image("ConduitPacket"+i,null,new Vector2(3,5));}
  Image Image(string name,Sprite sprite,Vector2 size){var i=WorkshopUIFactory.Node(name,stage,typeof(Image)).GetComponent<Image>();i.sprite=sprite;i.raycastTarget=false;i.preserveAspect=true;i.rectTransform.anchorMin=i.rectTransform.anchorMax=Vector2.one*.5f;i.rectTransform.sizeDelta=size;return i;}
  void Update(){if(game==null||puff==null)return;bool active=game.State.ActiveUntil>game.State.SavedAt;bool reduce=game.State.Workshop.reducedMotion||!game.State.Settings.effects;phase+=Time.unscaledDeltaTime*(active?1.6f:1);float t=Mathf.Repeat(phase,12);
   float vent=Mathf.Repeat(phase+3,9);puff.gameObject.SetActive(!reduce&&vent<.7f);puff.rectTransform.anchoredPosition=new Vector2(-stage.rect.width*.34f-vent*12,-stage.rect.height*.3f+ReceiptMotion.Out(vent/.7f)*18);puff.color=new Color(.6f,.8f,.85f,(active?.23f:.12f)*(1-vent/.7f));
   for(int i=0;i<3;i++){monitors[i].gameObject.SetActive(!reduce);monitors[i].rectTransform.anchoredPosition=new Vector2(stage.rect.width*(i==0?-.30f:i==1?.30f:.37f),stage.rect.height*(i==2?-.07f:.03f)+Mathf.Floor(Mathf.Repeat(phase*.9f+i,3))*2);monitors[i].color=new Color(.2f,.9f,1,.18f+(active?.2f:0));}for(int i=0;i<4;i++){packets[i].gameObject.SetActive(!reduce);float u=Mathf.Repeat(phase*.12f+i*.25f,1);packets[i].rectTransform.anchoredPosition=new Vector2((i%2==0?-1:1)*stage.rect.width*.19f,Mathf.Lerp(stage.rect.height*.43f,stage.rect.height*.11f,u));packets[i].color=new Color(.3f,1,1,active?.8f:.3f);}
  }
  void OnDisable(){if(puff!=null)puff.gameObject.SetActive(false);foreach(var i in monitors)if(i!=null)i.gameObject.SetActive(false);foreach(var i in packets)if(i!=null)i.gameObject.SetActive(false);}
 }
}
