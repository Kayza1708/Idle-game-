using System;using IdleIntelligence.Core;using UnityEngine;using UnityEngine.UI;
namespace IdleIntelligence.Runtime
{
 public sealed class SettingsView:MonoBehaviour
 {
  GameRuntime game;string language="";bool resetConfirmation;public void Initialize(GameRuntime runtime){game=runtime;Build();}
  void Update(){if(game!=null&&language!=game.State.Settings.language)Build();}
  string T(string key)=>SettingsRules.Text(game.State.Settings.language,"ui:"+key);
  void Build(){language=game.State.Settings.language;WorkshopUIFactory.Clear(transform);WorkshopUIFactory.Label("SettingsTitle",transform,T("settings"),18,44);WorkshopUIFactory.Label("LanguageTitle",transform,T("language"),16,40);var languages=PresentationLayout.Grid("LanguageGrid",transform,3,SettingsCatalog.Languages.Length);for(int i=0;i<SettingsCatalog.Languages.Length;i++){string code=SettingsCatalog.Languages[i];WorkshopUIFactory.Button("Language-"+code,languages,SettingsCatalog.LanguageNames[i]+(language==code?" ✓":""),()=>game.Act(s=>SettingsRules.Change(s,"language",code)));}var buying=WorkshopUIFactory.Horizontal("BuyModeOptions",transform,44).transform;foreach(string mode in new[]{"1","10","max"}){string value=mode;WorkshopUIFactory.Button("BuyMode-"+value,buying,"×"+value,()=>game.Act(s=>SettingsRules.Change(s,"buy-mode",value)));}WorkshopUIFactory.Label("NumberFormatTitle",transform,T("numberFormat"),16,44);var numbers=PresentationLayout.Grid("NumberFormatOptions",transform,3,3);foreach(string format in new[]{"auto","scientific","engineering"}){string value=format;WorkshopUIFactory.Button("NumberFormat-"+value,numbers,UiLocalizedText.Translate(value=="auto"?"Automatisch":value=="scientific"?"Wissenschaftlich":"Technisch",language),()=>game.Act(s=>SettingsRules.Change(s,"number-format",value)));}var toggles=PresentationLayout.Grid("SettingToggles",transform,2,4,48);foreach(string action in new[]{"toggle-effects","toggle-haptics","toggle-music","toggle-sfx"}){string id=action;string key=id=="toggle-effects"?"animations":id=="toggle-haptics"?"haptics":id=="toggle-music"?"music":"muteEffects";var button=WorkshopUIFactory.Button("Setting-"+id,toggles,T(key),()=>{game.Act(s=>SettingsRules.Change(s,id));Build();});button.GetComponentInChildren<Text>().text+=" · "+((id=="toggle-effects"?game.State.Settings.effects:id=="toggle-haptics"?game.State.Settings.hapticsEnabled:id=="toggle-music"?game.State.Settings.musicEnabled:game.State.Settings.sfxMuted)?UiLocalizedText.Translate("An",language):UiLocalizedText.Translate("Aus",language));}Volume("music-volume",T("musicVolume"),game.State.Settings.musicVolume);Volume("sfx-volume",T("effectsVolume"),game.State.Settings.sfxVolume);WorkshopUIFactory.Button("SettingsSoundTest",transform,T("testSound"),()=>{game.Audio.Unlock();game.Audio.Play("unlock");});WorkshopUIFactory.Label("HapticsAvailability",transform,language=="de"?"Haptik: keine vorhandene Unity-Patternanbindung auf dieser Plattform. Einstellung bleibt gespeichert.":"Haptics: no existing Unity pattern bridge on this platform. Preference is saved.",14,80);AdvertisingUI();ResetUI();CompactView.Attach(gameObject);}
  void AdvertisingUI()
  {
    bool german=language=="de";
    var config=Resources.Load<NativeAdConfiguration>("NativeAdConfiguration");
    WorkshopUIFactory.Label("AdvertisingPrivacyHeading",transform,
      german?"Werbung & Datenschutz":"Advertising & privacy",16,42).color=GameTheme.Accent;
    WorkshopUIFactory.Label("AdvertisingPrivacyInfo",transform,
      german?"Videos sind freiwillig. Ohne Werbeanbieter und Einwilligung bleiben alle Video-Belohnungen gesperrt. Keine Vollbildwerbung mitten im Spiel.":
             "Rewarded videos are optional. Without an ad provider and consent no video rewards are granted. No unsolicited full-screen ads.",
      13,92).color=GameTheme.Muted;
    if(NativeAdPrivacy.Development)
    {
      var label=WorkshopUIFactory.Label("AdTestConsentLabel",transform,
        german?"Werbe-SDK im Entwicklungstest: "+(NativeAdPrivacy.QaOptIn?"erlaubt":"ausgeschaltet"):
               "Development ad SDK: "+(NativeAdPrivacy.QaOptIn?"allowed":"off"),13,46);
      label.color=NativeAdPrivacy.QaOptIn?GameTheme.Enough:GameTheme.Muted;
      var row=WorkshopUIFactory.Horizontal("AdsConsentActions",transform,52).transform;
      WorkshopUIFactory.Button("AdsDevConsentEnable",row,german?"Testanzeigen erlauben":"Allow test ads",()=>{
        NativeAdPrivacy.SetDevelopmentOptIn(true);Build();
      }).interactable=!NativeAdPrivacy.QaOptIn;
      WorkshopUIFactory.Button("AdsDevConsentRevoke",row,german?"Deaktivieren":"Disable",()=>{
        NativeAdPrivacy.SetDevelopmentOptIn(false);NativeAdPrivacy.Revoke();Build();
      }).interactable=NativeAdPrivacy.QaOptIn;
      WorkshopUIFactory.Label("AdsTestLegalNote",transform,german?
        "Nur Entwicklungsbuilds. Dieser Testschalter ersetzt keine zertifizierte Einwilligungsplattform (CMP). Vor Store-Release muss das SDK samt Datenschutz geprüft werden.":
        "Development builds only. This testing switch is not a certified consent-management platform (CMP). Complete privacy checks before store release.",
        12,91).color=GameTheme.Muted;
    }
    else
      WorkshopUIFactory.Label("AdsProductionConsentInfo",transform,german?
        "Werbung ist bis zur Anbindung einer zertifizierten Einwilligungsplattform abgeschaltet.":
        "Ads remain disabled until a certified consent platform is connected.",13,70);
    if(config!=null&&Uri.TryCreate(config.privacyPolicyUrl,UriKind.Absolute,out var url)&&
       (url.Scheme=="https"))
      WorkshopUIFactory.Button("AdsPrivacyPolicy",transform,
        german?"Datenschutzerklärung öffnen":"Open privacy policy",()=>Application.OpenURL(url.AbsoluteUri));
    if(config==null||!config.HasCredentials)
      WorkshopUIFactory.Label("AdsSetupNeeded",transform,german?
        "LevelPlay App-Key und Rewarded-Ad-Unit müssen vor einem Videotest konfiguriert werden.":
        "Configure the LevelPlay app key and rewarded-ad unit before testing videos.",12,70)
        .color=GameTheme.Muted;
  }
  void ResetUI(){WorkshopUIFactory.Button("ManualSave",transform,language=="de"?"Jetzt speichern":"Save now",()=>game.SaveButton.onClick.Invoke()).interactable=game.Writable;WorkshopUIFactory.Button("SaveToolsFromSettings",transform,T("exportSave")+" / Recovery",()=>game.UserShow("storage"));var b=WorkshopUIFactory.Button("RequestCampaignReset",transform,"Reset saved game",()=>{resetConfirmation=true;Build();});b.interactable=game.Writable&&!ChallengeRules.Active(game.State);if(!resetConfirmation)return;WorkshopUIFactory.Label("CampaignResetWarning",transform,"All progress will reset. A complete original copy is preserved locally before replacement.",14,110);WorkshopUIFactory.Button("CancelCampaignReset",transform,"Cancel",()=>{resetConfirmation=false;Build();});var confirm=WorkshopUIFactory.Button("ConfirmCampaignReset",transform,"Confirm new campaign",()=>{resetConfirmation=false;game.StartNewCampaign();});confirm.interactable=game.Writable&&!ChallengeRules.Active(game.State);}
  void Volume(string action,string title,double current){var row=WorkshopUIFactory.Horizontal("VolumeButtons-"+action,transform,44).transform;var label=WorkshopUIFactory.Label("Volume-"+action,row,title+" · "+Math.Round(current*100)+" %",13,44);label.GetComponent<LayoutElement>().flexibleWidth=1;foreach(int direction in new[]{-1,1}){int step=direction;var b=WorkshopUIFactory.Button(action+(step<0?"-minus":"-plus"),row,step<0?"−":"+",()=>{game.Act(s=>SettingsRules.Change(s,action,amount:(action=="music-volume"?s.Settings.musicVolume:s.Settings.sfxVolume)+step*.01));Build();});var size=b.GetComponent<LayoutElement>();size.minWidth=size.preferredWidth=44;size.flexibleWidth=0;}}
 }
}
