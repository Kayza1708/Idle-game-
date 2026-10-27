using UnityEngine;using UnityEngine.UI;
namespace IdleIntelligence.Runtime {
 // One shell-owned dock, outside the scroller and below the resource header.
 public sealed class MiraPresenter:MonoBehaviour {
  GameRuntime game;GameObject sheet;Transform dock;public void Initialize(GameRuntime runtime){game=runtime;var safe=game.Content.GetComponentInParent<SafeArea>().transform;dock=WorkshopUIFactory.Vertical("TutorialDock",safe).transform;var size=dock.gameObject.AddComponent<LayoutElement>();size.flexibleHeight=0;dock.SetSiblingIndex(game.Content.GetComponentInParent<ScrollRect>().transform.GetSiblingIndex());dock.gameObject.SetActive(false);var pointer=WorkshopUIFactory.Node("TutorialFinger",safe,typeof(TutorialPointer)).GetComponent<TutorialPointer>();pointer.Initialize(game);}
  void LateUpdate(){if(game?.State==null)return;var s=game.State;bool needed=game.Writable&&game.CurrentTab!="story"&&(s.Story.open!=null||s.Story.tutorial=="active");if(!needed){if(dock.gameObject.activeSelf)dock.gameObject.SetActive(false);return;}if(sheet==null){var prefab=Resources.Load<GameObject>("PixelUI/MiraCoach");if(prefab==null)return;sheet=Instantiate(prefab,dock);sheet.name="AutomaticMira";sheet.GetComponent<LayoutElement>().ignoreLayout=false;sheet.GetComponent<MiraCoach>().Initialize(game);}if(!dock.gameObject.activeSelf)dock.gameObject.SetActive(true);}
  void OnDestroy(){if(dock!=null)Destroy(dock.gameObject);}
 }
}
