using UnityEngine;using UnityEngine.UI;
namespace IdleIntelligence.Runtime {
 // Reachable routes to existing screens only. No independent game or save state.
 public sealed class GameMenu:MonoBehaviour {
  GameRuntime game;GameObject sheet;public bool IsOpen=>sheet!=null&&sheet.activeSelf;public void Initialize(GameRuntime runtime){game=runtime;}
  public void Close(){if(sheet!=null){sheet.SetActive(false);Destroy(sheet);}sheet=null;}
  void OnDestroy()=>Close();
  public void Open(){Close();sheet=Instantiate(game.WorkshopPrefab.DetailRoot,game.Content.GetComponentInParent<Canvas>().transform);sheet.name="MainMenu";sheet.SetActive(true);WorkshopUIFactory.Fill((RectTransform)sheet.transform);sheet.AddComponent<SafeArea>();var scroll=sheet.GetComponentInChildren<ScrollRect>(true);foreach(Transform child in scroll.content)child.gameObject.SetActive(false);var body=WorkshopUIFactory.Vertical("MenuActions",scroll.content);WorkshopUIFactory.Label("MenuHeading",body.transform,UiLocalizedText.Translate("Menü",game.State.Settings.language),22,42);var close=sheet.transform.Find("DetailPanel/CloseItemDetail").GetComponent<Button>();close.onClick.RemoveAllListeners();close.onClick.AddListener(Close);
   string[] routes={"settings","production","storage","profile","missions","seasons","market","gems","ads","store","progress","story","challenges","goals","models"};string[] labels={"Einstellungen","Produktion / Nutzer","Spielstände / Recovery","Profil","Missionen","Seasons","Markt","Gems","Belohnungen","Pakete & Vorteile","Fortschritt","Mira","Challenges","Ziele","KI-Modelle"};for(int i=0;i<routes.Length;i++){string route=routes[i];var b=WorkshopUIFactory.Button("Menu-"+route,body.transform,UiLocalizedText.Translate(labels[i],game.State.Settings.language),()=>{Close();game.UserShow(route);});if(route=="models")b.interactable=game.State.Prestige.lab;if(route=="profile"&&ClaimNotice.Achievements(game.State)||route=="missions"&&ClaimNotice.Missions(game.State))ClaimNotice.Attach(b.transform).SetActive(true);}
   var save=WorkshopUIFactory.Button("Menu-Save",body.transform,UiLocalizedText.Translate("Jetzt speichern",game.State.Settings.language),()=>{game.SaveButton.onClick.Invoke();Close();});save.interactable=game.Writable;Canvas.ForceUpdateCanvases();scroll.verticalNormalizedPosition=1;
  }
 }
}
