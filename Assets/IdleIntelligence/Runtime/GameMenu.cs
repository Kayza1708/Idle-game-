using System;using UnityEngine;using UnityEngine.UI;
namespace IdleIntelligence.Runtime {
 // Reachable routes to existing screens only. No independent game or save state.
 public sealed class GameMenu:MonoBehaviour {
  GameRuntime game;GameObject sheet;public bool IsOpen=>sheet!=null&&sheet.activeSelf;public void Initialize(GameRuntime runtime){game=runtime;}
  public void Navigate(string route){string previous=game.CurrentTab;string mode=game.WorkshopView?.Mode;float position=game.Content.GetComponentInParent<ScrollRect>().verticalNormalizedPosition;Close();game.UserShow(route);var bar=SmallClose(game.Content,"MenuReturn",()=>{game.UserShow(previous);if(mode!=null&&game.WorkshopView!=null)game.WorkshopView.ChangeMode(mode);Canvas.ForceUpdateCanvases();game.Content.GetComponentInParent<ScrollRect>().verticalNormalizedPosition=position;});bar.transform.SetAsFirstSibling();}
  // A compact, accessible 48x48 close affordance instead of a huge back card.
  // The parent row is kept in the vertical scroll layout.
  public static GameObject SmallClose(Transform parent,string name,Action close)
  {
   var bar=WorkshopUIFactory.Horizontal(name+"Bar",parent,50);
   var layout=bar.GetComponent<HorizontalLayoutGroup>();
   layout.childForceExpandWidth=false;
   layout.childAlignment=TextAnchor.MiddleRight;
   var fill=WorkshopUIFactory.Node(name+"Spacer",bar.transform,typeof(LayoutElement));
   fill.GetComponent<LayoutElement>().flexibleWidth=1;
   var button=WorkshopUIFactory.Button(name,bar.transform,"×",close);
   var size=button.GetComponent<LayoutElement>()??button.gameObject.AddComponent<LayoutElement>();
   size.minWidth=size.preferredWidth=size.minHeight=size.preferredHeight=48;
   size.flexibleWidth=size.flexibleHeight=0;
   button.GetComponentInChildren<Text>().fontSize=26;
   button.GetComponentInChildren<Text>().resizeTextMaxSize=26;
   return bar;
  }
  public void Close(){if(sheet!=null){sheet.SetActive(false);Destroy(sheet);}sheet=null;}
  void OnDestroy()=>Close();
  public void Open(){Close();sheet=Instantiate(game.WorkshopPrefab.DetailRoot,game.Content.GetComponentInParent<Canvas>().transform);sheet.name="MainMenu";sheet.SetActive(true);WorkshopUIFactory.Fill((RectTransform)sheet.transform);sheet.AddComponent<SafeArea>();var scroll=sheet.GetComponentInChildren<ScrollRect>(true);foreach(Transform child in scroll.content)child.gameObject.SetActive(false);var body=WorkshopUIFactory.Vertical("MenuActions",scroll.content);WorkshopUIFactory.Label("MenuHeading",body.transform,UiLocalizedText.Translate("Menü",game.State.Settings.language),22,42);var close=sheet.transform.Find("DetailPanel/CloseItemDetail").GetComponent<Button>();close.onClick.RemoveAllListeners();close.onClick.AddListener(Close);
   string[][] groups={new[]{"production","models","goals","challenges"},new[]{"missions","seasons","profile","progress"},new[]{"market","gems","ads","store"},new[]{"settings","storage","company","story"}};
   string[][] labels={new[]{"Produktion","KI-Modelle","Ziele","Challenges"},new[]{"Missionen","Seasons","Profil","Fortschritt"},new[]{"Markt","Gems","Belohnungen","Pakete"},new[]{"Einstellungen","Spielstände","Companies","Mira"}};
   string[] headings={"Labor","Fortschritt","Shop","Einstellungen"};
   for(int section=0;section<groups.Length;section++){
      var available=new System.Collections.Generic.List<int>();for(int i=0;i<groups[section].Length;i++){string id=groups[section][i];if(id=="company"&&!CompanyAccess.LocallyEligible(game.State)||id=="models"&&!game.State.Prestige.lab)continue;available.Add(i);}
      WorkshopUIFactory.Label("MenuSection"+section,body.transform,UiLocalizedText.Translate(headings[section],game.State.Settings.language),13,30).color=GameTheme.Muted;
      var grid=PresentationLayout.Grid("MenuGroup"+section,body.transform,2,available.Count,44);
      foreach(int i in available){string route=groups[section][i];var b=WorkshopUIFactory.Button("Menu-"+route,grid,UiLocalizedText.Translate(labels[section][i],game.State.Settings.language),()=>Navigate(route));if(route=="profile"&&ClaimNotice.Achievements(game.State)||route=="missions"&&ClaimNotice.Missions(game.State))ClaimNotice.Attach(b.transform).SetActive(true);}
   }

   var save=WorkshopUIFactory.Button("Menu-Save",body.transform,UiLocalizedText.Translate("Jetzt speichern",game.State.Settings.language),()=>{game.SaveButton.onClick.Invoke();Close();});save.interactable=game.Writable;Canvas.ForceUpdateCanvases();scroll.verticalNormalizedPosition=1;
  }
 }
}
