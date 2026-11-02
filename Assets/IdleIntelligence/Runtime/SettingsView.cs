using System;using IdleIntelligence.Core;using UnityEngine;using UnityEngine.UI;
namespace IdleIntelligence.Runtime
{
 public sealed class SettingsView:MonoBehaviour
 {
  GameRuntime game;string language="";bool resetConfirmation;public void Initialize(GameRuntime runtime){game=runtime;Build();}
  void Update(){if(game!=null&&language!=game.State.Settings.language)Build();}
  string T(string key)=>SettingsRules.Text(game.State.Settings.language,"ui:"+key);
  void Build(){language=game.State.Settings.language;WorkshopUIFactory.Clear(transform);WorkshopUIFactory.Label("SettingsTitle",transform,T("settings"),18,44);WorkshopUIFactory.Label("LanguageTitle",transform,T("language"),16,40);var languages=PresentationLayout.Grid("LanguageGrid",transform,3,SettingsCatalog.Languages.Length);for(int i=0;i<SettingsCatalog.Languages.Length;i++){string code=SettingsCatalog.Languages[i];WorkshopUIFactory.Button("Language-"+code,languages,SettingsCatalog.LanguageNames[i]+(language==code?" ✓":""),()=>game.Act(s=>SettingsRules.Change(s,"language",code)));}var buying=WorkshopUIFactory.Horizontal("BuyModeOptions",transform,44).transform;foreach(string mode in new[]{"1","10","max"}){string value=mode;WorkshopUIFactory.Button("BuyMode-"+value,buying,"×"+value,()=>game.Act(s=>SettingsRules.Change(s,"buy-mode",value)));}WorkshopUIFactory.Label("NumberFormatTitle",transform,T("numberFormat"),16,44);var numbers=PresentationLayout.Grid("NumberFormatOptions",transform,3,3);foreach(string format in new[]{"auto","scientific","engineering"}){string value=format;WorkshopUIFactory.Button("NumberFormat-"+value,numbers,UiLocalizedText.Translate(value=="auto"?"Automatisch":value=="scientific"?"Wissenschaftlich":"Technisch",language),()=>game.Act(s=>SettingsRules.Change(s,"number-format",value)));}var toggles=PresentationLayout.Grid("SettingToggles",transform,2,4,48);foreach(string action in new[]{"toggle-effects","toggle-haptics","toggle-music","toggle-sfx"}){string id=action;string key=id=="toggle-effects"?"animations":id=="toggle-haptics"?"haptics":id=="toggle-music"?"music":"muteEffects";var button=WorkshopUIFactory.Button("Setting-"+id,toggles,T(key),()=>{game.Act(s=>SettingsRules.Change(s,id));Build();});button.GetComponentInChildren<Text>().text+=" · "+((id=="toggle-effects"?game.State.Settings.effects:id=="toggle-haptics"?game.State.Settings.hapticsEnabled:id=="toggle-music"?game.State.Settings.musicEnabled:game.State.Settings.sfxMuted)?UiLocalizedText.Translate("An",language):UiLocalizedText.Translate("Aus",language));}Volume("music-volume",T("musicVolume"),game.State.Settings.musicVolume);Volume("sfx-volume",T("effectsVolume"),game.State.Settings.sfxVolume);WorkshopUIFactory.Button("SettingsSoundTest",transform,T("testSound"),()=>{game.Audio.Unlock();game.Audio.Play("unlock");});WorkshopUIFactory.Label("HapticsAvailability",transform,language=="de"?"Haptik: keine vorhandene Unity-Patternanbindung auf dieser Plattform. Einstellung bleibt gespeichert.":"Haptics: no existing Unity pattern bridge on this platform. Preference is saved.",14,80);OnlinePrivacyControls();ResetUI();CompactView.Attach(gameObject);}
  void OnlinePrivacyControls()
  {
    bool de=language=="de";var online=game.Online;
    WorkshopUIFactory.Label("SettingsOnlineHeader",transform,de?
      "Onlinekonto · Datenschutz":"Online account · Privacy",16,48).color=GameTheme.Accent;
    WorkshopUIFactory.Label("SettingsOnlineStatus",transform,
      online==null?"Offline":online.Status,13,64).color=GameTheme.Muted;
    if(online==null)return;
    WorkshopUIFactory.Label("UsageStatisticsExplainer",transform,de?
      "Freiwillige, pseudonyme Nutzungsstatistik: Menüs, wichtige Fortschritte, Werbeaktionen und Abstürze ohne Text/Spielständen. Keine Auswertung ohne Zustimmung. Abschalten verwirft noch nicht übertragene Ereignisse.":
      "Optional pseudonymous usage metrics: screens, progression milestones, video outcomes and crashes, never raw logs or save data. Nothing is sent without consent. Disabling clears pending events.",13,104).color=GameTheme.Muted;
    WorkshopUIFactory.Button("ToggleUsageStatistics",transform,de?
      (online.AnalyticsAllowed?"Nutzungsstatistik ausschalten":"Nutzungsstatistik erlauben"):
      (online.AnalyticsAllowed?"Disable usage analytics":"Enable usage analytics"),()=>{
        online.SetAnalyticsConsent(!online.AnalyticsAllowed);Build();
      });
    if(online.LiveOps!=null&&NativeLiveOpsRules.Valid(online.LiveOps))
    {
      var live=online.LiveOps;
      var line=de?"Serverstatus: ":"Server status: ";
      line+=(live.maintenance?(de?"Wartung":"Maintenance"):(de?"Online":"Online"));
      if(online.NeedsUpdate)line+=de?" · Update erforderlich":" · Update required";
      if(NativeLiveOpsRules.HasCurrentSeason(live))
         line+=" · "+live.season.label;
      WorkshopUIFactory.Label("LiveOpsServerStatus",transform,line,13,70).color=GameTheme.Muted;
    }
  }
  void ResetUI(){WorkshopUIFactory.Button("ManualSave",transform,language=="de"?"Jetzt speichern":"Save now",()=>game.SaveButton.onClick.Invoke()).interactable=game.Writable;WorkshopUIFactory.Button("SaveToolsFromSettings",transform,T("exportSave")+" / Recovery",()=>game.UserShow("storage"));var b=WorkshopUIFactory.Button("RequestCampaignReset",transform,"Reset saved game",()=>{resetConfirmation=true;Build();});b.interactable=game.Writable&&!ChallengeRules.Active(game.State);if(!resetConfirmation)return;WorkshopUIFactory.Label("CampaignResetWarning",transform,"All progress will reset. A complete original copy is preserved locally before replacement.",14,110);WorkshopUIFactory.Button("CancelCampaignReset",transform,"Cancel",()=>{resetConfirmation=false;Build();});var confirm=WorkshopUIFactory.Button("ConfirmCampaignReset",transform,"Confirm new campaign",()=>{resetConfirmation=false;game.StartNewCampaign();});confirm.interactable=game.Writable&&!ChallengeRules.Active(game.State);}
  void Volume(string action,string title,double current){var row=WorkshopUIFactory.Horizontal("VolumeButtons-"+action,transform,44).transform;var label=WorkshopUIFactory.Label("Volume-"+action,row,title+" · "+Math.Round(current*100)+" %",13,44);label.GetComponent<LayoutElement>().flexibleWidth=1;foreach(int direction in new[]{-1,1}){int step=direction;var b=WorkshopUIFactory.Button(action+(step<0?"-minus":"-plus"),row,step<0?"−":"+",()=>{game.Act(s=>SettingsRules.Change(s,action,amount:(action=="music-volume"?s.Settings.musicVolume:s.Settings.sfxVolume)+step*.01));Build();});var size=b.GetComponent<LayoutElement>();size.minWidth=size.preferredWidth=44;size.flexibleWidth=0;}}
 }
}
