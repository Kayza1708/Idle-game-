using IdleIntelligence.Core;using UnityEngine;using UnityEngine.UI;
namespace IdleIntelligence.Runtime {
 public sealed class MiraPresenter:MonoBehaviour {
  GameRuntime game;GameObject sheet;public void Initialize(GameRuntime runtime){game=runtime;}
  void LateUpdate(){if(game?.State==null)return;var s=game.State;bool needed=game.Writable&&game.CurrentTab!="story"&&(s.Story.open!=null||s.Story.tutorial=="active");if(!needed){Close();return;}if(sheet==null){var prefab=Resources.Load<GameObject>("PixelUI/MiraCoach");if(prefab==null)return;sheet=Instantiate(prefab,game.Content.GetComponentInParent<SafeArea>().transform);sheet.name="AutomaticMira";sheet.GetComponent<MiraCoach>().Initialize(game);}bool embedded=s.Story.open==null&&!string.IsNullOrEmpty(s.Retention.aiName);var parent=embedded?game.Content:game.Content.GetComponentInParent<SafeArea>().transform;if(sheet.transform.parent!=parent){sheet.transform.SetParent(parent,false);if(!embedded){var rect=(RectTransform)sheet.transform;rect.anchorMin=Vector2.zero;rect.anchorMax=new Vector2(1,0);rect.pivot=new Vector2(.5f,0);rect.anchoredPosition=new Vector2(0,82);rect.sizeDelta=new Vector2(-16,240);}}var layout=sheet.GetComponent<LayoutElement>();layout.ignoreLayout=!embedded;layout.minHeight=layout.preferredHeight=174;if(embedded)sheet.transform.SetAsFirstSibling();else sheet.transform.SetAsLastSibling();}
  void Close(){if(sheet!=null){sheet.SetActive(false);Destroy(sheet);sheet=null;}}void OnDestroy()=>Close();
 }
}
