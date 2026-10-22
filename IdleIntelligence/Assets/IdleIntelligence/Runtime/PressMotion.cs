using UnityEngine;using UnityEngine.EventSystems;
namespace IdleIntelligence.Runtime {
 // Only the label moves. The actual button hit rectangle never shrinks or moves.
 public sealed class PressMotion:MonoBehaviour,IPointerDownHandler,IPointerUpHandler,IPointerExitHandler {
  RectTransform label;Vector2 rest;bool down;GameRuntime game;
  bool Reduced{get{if(game==null)game=UnityEngine.Object.FindFirstObjectByType<GameRuntime>();return game==null||game.State==null||game.State.Workshop.reducedMotion||!game.State.Settings.effects;}}
  public void OnPointerDown(PointerEventData e){if(GetComponent<UnityEngine.UI.Button>()?.interactable!=true)return;var text=GetComponentInChildren<UnityEngine.UI.Text>();if(text==null)return;label=text.rectTransform;if(!down)rest=label.anchoredPosition;down=true;}
  public void OnPointerUp(PointerEventData e)=>down=false;public void OnPointerExit(PointerEventData e)=>down=false;
  void Update(){if(label==null)return;label.anchoredPosition=Vector2.Lerp(label.anchoredPosition,rest+(down&&!Reduced?Vector2.down*2:Vector2.zero),1-Mathf.Exp(-Time.unscaledDeltaTime*38));}
  void OnDisable(){down=false;if(label!=null)label.anchoredPosition=rest;}
 }
}
