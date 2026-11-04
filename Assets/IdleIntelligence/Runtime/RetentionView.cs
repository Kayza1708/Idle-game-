using System;
using System.Linq;
using System.Collections.Generic;
using IdleIntelligence.Core;
using UnityEngine;
using UnityEngine.UI;
namespace IdleIntelligence.Runtime
{
 public sealed class RetentionView:MonoBehaviour
 {
  string N(double value)=>NumberFormatting.Format(ScientificNumber.From(value),game.State.Settings.numberFormat,game.State.Settings.language);
  bool De=>game.State.Settings.language=="de";
  GameRuntime game;Transform content;Text header;string page="profile";bool editOpen,mailOpen;readonly List<Action> refresh=new List<Action>();
  public void Initialize(GameRuntime runtime)
  {
   game=runtime;header=WorkshopUIFactory.Label("ProfileWallet",transform,"",14,54);
   var nav=WorkshopUIFactory.Vertical("RetentionNavigation",transform).transform;
   var first=WorkshopUIFactory.Horizontal("RetentionPrimary",nav,48).transform;
   var second=WorkshopUIFactory.Horizontal("RetentionSecondary",nav,48).transform;
   bool de=game.State.Settings.language=="de";
   WorkshopUIFactory.Button("ShowProfile",first,de?"Profil":"Profile",()=>Show("profile"));
   WorkshopUIFactory.Button("ShowBadges",first,de?"Abzeichen":"Badges",()=>Show("badges"));
   WorkshopUIFactory.Button("ShowAchievements",first,de?"Erfolge":"Achievements",()=>Show("achievements"));
   WorkshopUIFactory.Button("ShowOnboarding",second,de?"Laborziele":"Lab goals",()=>Show("onboarding"));
   WorkshopUIFactory.Button("ShowStaticChallenges",second,de?"Langzeitziele":"Long-term goals",()=>Show("challenges"));
   content=WorkshopUIFactory.Vertical("RetentionContent",transform).transform;Build();
  }
  void Show(string next){page=next;editOpen=mailOpen=false;Build();}
  void Update(){if(game==null)return;header.text=N(game.State.Retention.gems)+" Gems · "+N(game.State.Retention.points)+" AP · "+N(game.State.Challenges.Progress.stars)+(De?" Sterne":" stars")+(ChallengeRules.Active(game.State)?(De?"\nChallenge-Labor · Hauptspiel pausiert":"\nChallenge lab · main game paused"):"");foreach(var update in refresh)update();}
  Text Paragraph(string name,string text,int size=14,Transform parent=null)
  {var label=WorkshopUIFactory.Label(name,parent??content,text,size,72);label.alignment=TextAnchor.UpperLeft;label.GetComponent<LayoutElement>().preferredHeight=Math.Max(54,label.cachedTextGenerator.GetPreferredHeight(text,label.GetGenerationSettings(new Vector2(Math.Max(220,((RectTransform)transform).rect.width-20),0)))/label.pixelsPerUnit+16);return label;}
  ActionCard Card(string name,string title,Action action)
  {var c=Instantiate(game.CardPrefab,content);c.gameObject.name=name;c.Title.text=title;c.Icon.gameObject.SetActive(false);c.GetComponent<LayoutElement>().preferredHeight=180;c.Title.fontSize=16;c.Detail.fontSize=14;c.Button.onClick.AddListener(()=>action());return c;}
  void Build()
  {
   WorkshopUIFactory.Clear(content);refresh.Clear();var s=game.State;
   string selected=page=="licenses"?"profile":page;
   string[] tabNames={"ShowProfile","ShowBadges","ShowAchievements","ShowOnboarding","ShowStaticChallenges"};string[] tabPages={"profile","badges","achievements","onboarding","challenges"};
   for(int n=0;n<tabNames.Length;n++){var tab=GetComponentsInChildren<Button>().FirstOrDefault(b=>b.name==tabNames[n]);if(tab==null)continue;bool active=selected==tabPages[n];tab.GetComponentInChildren<Text>().color=active?GameTheme.Accent:GameTheme.Muted;FlowAccent.Attach(tab.transform,game,FlowAccent.Contour.Rail,GameTheme.Accent,null,false).gameObject.SetActive(active);}
   if(page=="licenses")
   {foreach(string name in new[]{"NameModerationNotice","NameModerationLicense","UnicodeLicense"}){var data=Resources.Load<TextAsset>("Licenses/"+name);if(data==null)throw new InvalidOperationException("Missing shipped license: "+name);int index=0;for(int start=0;start<data.text.Length;start+=2500)Paragraph("License-"+name+"-"+index++,data.text.Substring(start,Math.Min(2500,data.text.Length-start)));}return;}
   if(page=="achievements")
   {
    Paragraph("AchievementExplanation","Jede erreichte Stufe kann einmal abgeholt werden. AP erhöhen die Einnahmen nach der bestehenden Formel; ein Claim wird sofort gespeichert.");
    foreach(var a in RetentionBalance.Achievements)
    {int tier=RetentionRules.CurrentTier(s,a);var card=Card("Achievement-"+a.Id,a.Name+" · Stufe "+(tier+1),()=>{if(game.Act(v=>RetentionRules.Achievement(v,a.Id,tier),"claim")){Build();var earned=content.GetComponentsInChildren<ActionCard>().FirstOrDefault(c=>c.name=="Achievement-"+a.Id);if(earned!=null)PanelMotion.Play(earned.Icon.gameObject,game.State.Workshop.reducedMotion||!game.State.Settings.effects,true);}});var claimNotice=ClaimNotice.Attach(card.Button.transform);card.Icon.gameObject.SetActive(true);card.Icon.sprite=ProfileBadgeSprite.Get(BadgeFamily(a.Id),BadgeTier(s,a.Id));card.Icon.color=BadgeClaimCount(s,a.Id)>0?Color.white:new Color(1f,1f,1f,.35f);card.Icon.preserveAspect=true;refresh.Add(()=>{var current=game.State;bool claimed=current.Retention.achievementClaims.Contains(a.Id+":"+tier);int reward=Math.Min(tier,RetentionBalance.TierGems.Length-1);card.Detail.text=a.Description+"\n"+N(RetentionRules.AchievementValue(current,a.Id))+" / "+N(a.Thresholds[tier])+"\n"+(claimed?"Abgeholt":(RetentionRules.AchievementReady(current,a.Id,tier)?"Abholen: ":"Belohnung: ")+RetentionBalance.TierGems[reward]+" Gems + "+RetentionBalance.TierPoints[reward]+" AP");card.Button.interactable=game.Writable&&RetentionRules.AchievementReady(current,a.Id,tier);claimNotice.SetActive(card.Button.interactable);});}return;
   }
   if(page=="badges"){BadgeLibrary(s);return;}
   if(page=="onboarding")
   {for(int i=0;i<RetentionBalance.IntroIds.Length;i++){string id=RetentionBalance.IntroIds[i];int index=i;var card=Card("Intro-"+id,RetentionBalance.IntroTitles[i],()=>{if(game.Act(v=>RetentionRules.Onboarding(v,id),"claim"))Build();});var claimNotice=ClaimNotice.Attach(card.Button.transform);refresh.Add(()=>{var r=game.State.Retention;bool claimed=r.onboardingClaimed.Contains(id),done=r.onboardingCompleted.Contains(id);card.Detail.text=RetentionBalance.IntroText[index]+"\n"+RetentionBalance.IntroRewards[index]+"\n"+(claimed?"Abgeholt":done?"Abholen":"Ziel noch offen");card.Button.interactable=game.Writable&&!ChallengeRules.Active(game.State)&&done&&!claimed;claimNotice.SetActive(card.Button.interactable);});}return;}
   if(page=="challenges")
   {foreach(var c in RetentionBalance.Challenges){var card=Card("StaticChallenge-"+c.Id,c.Name,()=>{if(game.Act(v=>RetentionRules.StaticChallenge(v,c.Id),"claim"))Build();});var claimNotice=ClaimNotice.Attach(card.Button.transform);refresh.Add(()=>{bool claimed=game.State.Retention.challengeClaims.Contains(c.Id);card.Detail.text=c.Description+"\n"+c.Stars+" Sterne · "+(claimed?"Abgeholt":RetentionRules.StaticReady(game.State,c.Id)?"Abholen":"Ziel noch offen");card.Button.interactable=game.Writable&&RetentionRules.StaticReady(game.State,c.Id);claimNotice.SetActive(card.Button.interactable);});}return;}
   ProfileIdentity(s);
   ProfileStats(s);
   LocalBadgeShowcase(s);
   var edit=WorkshopUIFactory.Button("ProfileEdit",content,De?"Profil bearbeiten":"Edit profile",()=>{editOpen=!editOpen;Build();});
   edit.GetComponentInChildren<Text>().color=editOpen?GameTheme.Accent:GameTheme.Text;
   if(editOpen){var fields=WorkshopUIFactory.Vertical("ProfileEditFields",content).transform;NameInput(false,fields);if(string.IsNullOrEmpty(s.Retention.aiName))NameInput(true,fields);}
   int unread=s.Retention.inbox.Count(message=>!s.Retention.readMessages.Contains(message.id));
   WorkshopUIFactory.Button("ProfileMailbox",content,(De?"Postfach":"Mailbox")+" · "+unread+(De?" ungelesen":" unread"),()=>{mailOpen=!mailOpen;Build();});
   if(mailOpen){
    if(s.Retention.inbox.Length==0)Paragraph("EmptyMailbox",De?"Alles gelesen. Neue Nachrichten findest du hier.":"All caught up. New messages will appear here.");
    foreach(var message in s.Retention.inbox){Paragraph("Message-"+message.id,message.title+"\n"+message.body);bool read=s.Retention.readMessages.Contains(message.id);var b=WorkshopUIFactory.Button("Read-"+message.id,content,read?(De?"Gelesen":"Read"):(De?"Als gelesen markieren":"Mark as read"),()=>{if(game.Act(v=>RetentionRules.ReadMessage(v,message.id)))Build();});b.interactable=game.Writable&&!read;}
   }
   WorkshopUIFactory.Button("ShowNameLicenses",content,De?"Namensregeln & Quellen":"Name policy & credits",()=>Show("licenses"));
  }

  // Local Achievement art is intentionally separate from server-verified Company badges.
  // A modified Unity save must NEVER be enough to publish online achievements.
  static readonly string[] ShowcaseIds={"prestiges","challenge-stages","hardware","research","crafting","items","int"};
  static string BadgeFamily(string id)
  {
    if(id=="prestiges"||id=="int")return "prestige";
    if(id.StartsWith("challenge",StringComparison.Ordinal))return "challenge";
    if(id=="hardware"||id=="classes"||id=="calculators"||id=="milestones")return "hardware";
    return "achievement";
  }
  static int BadgeClaimCount(GameState s,string id)=>
    s.Retention.achievementClaims.Count(key=>key.StartsWith(id+":",StringComparison.Ordinal));
  static int BadgeTier(GameState s,string id)
  {
    int n=BadgeClaimCount(s,id);
    return n>=8?3:n>=4?2:1;
  }
  static string TierLabel(int tier)=>tier>=3?"Gold":tier==2?"Silber":"Bronze";
  void ProfileIdentity(GameState s)
  {
    var row=WorkshopUIFactory.Horizontal("ProfileIdentity",content,124);row.GetComponent<HorizontalLayoutGroup>().childForceExpandHeight=false;row.GetComponent<HorizontalLayoutGroup>().childAlignment=TextAnchor.MiddleLeft;
    var holder=WorkshopUIFactory.Node("ProfilePortrait",row.transform,typeof(Image));
    var icon=holder.GetComponent<Image>();icon.color=Color.clear;icon.raycastTarget=false;
    var layout=holder.AddComponent<LayoutElement>();layout.minWidth=layout.preferredWidth=96;layout.minHeight=layout.preferredHeight=96;layout.flexibleWidth=0;
    var emblem=WorkshopUIFactory.Node("ProfileEmblem",holder.transform,typeof(Image)).GetComponent<Image>();
    WorkshopUIFactory.Fill(emblem.rectTransform);emblem.rectTransform.offsetMin=Vector2.one*13;emblem.rectTransform.offsetMax=Vector2.one*-13;
    emblem.sprite=game.ModelPrefab.ModelArt;emblem.preserveAspect=true;emblem.raycastTarget=false;
    var frame=WorkshopUIFactory.Node("ProfileFrame",holder.transform,typeof(Image)).GetComponent<Image>();WorkshopUIFactory.Fill(frame.rectTransform);frame.color=Color.clear;frame.raycastTarget=false;
    FlowAccent.Attach(frame.transform,game,FlowAccent.Contour.Portrait,GameTheme.Accent);
    var copy=WorkshopUIFactory.Vertical("ProfileIdentityCopy",row.transform).transform;
    var name=WorkshopUIFactory.Label("ProfileIdentityText",copy,s.Retention.playerName,21,42);name.font=s.Retention.playerName.All(c=>GameTheme.Display.HasCharacter(c))?GameTheme.Display:GameTheme.Bold;name.alignment=TextAnchor.MiddleLeft;name.resizeTextForBestFit=true;name.resizeTextMinSize=14;name.resizeTextMaxSize=21;
    var identity=WorkshopUIFactory.Label("ProfileIdentityStatus",copy,(De?"LOKALES PROFIL":"LOCAL PROFILE")+"\n"+(string.IsNullOrEmpty(s.Retention.aiName)?(De?"Dein Labor beginnt hier.":"Your lab starts here."):(De?"KI":"AI")+" · "+s.Retention.aiName),12,52);identity.color=GameTheme.Muted;identity.alignment=TextAnchor.MiddleLeft;
  }
  void ProfileStats(GameState s)
  {
    var row=WorkshopUIFactory.Horizontal("ProfileStats",content,68);
    var values=new[]{s.Retention.achievementClaims.Length,s.Retention.artifacts.Length,s.Prestige.resets};
    var titles=De?new[]{"Erfolgsstufen","Artefakte","Prestiges"}:new[]{"Achievements","Artifacts","Prestiges"};
    for(int i=0;i<3;i++){
      var column=WorkshopUIFactory.Vertical("ProfileStat-"+i,row.transform).transform;
      var value=WorkshopUIFactory.Label("StatValue",column,N(values[i]),19,30);value.font=GameTheme.Display;value.color=GameTheme.Accent;value.alignment=TextAnchor.MiddleCenter;
      var title=WorkshopUIFactory.Label("StatTitle",column,titles[i],11,26);title.color=GameTheme.Muted;title.alignment=TextAnchor.MiddleCenter;title.resizeTextForBestFit=true;title.resizeTextMinSize=10;title.resizeTextMaxSize=11;
    }
  }
  void LocalBadgeShowcase(GameState s)
  {
    var available=ShowcaseIds
      .Select(id=>new{id,definition=RetentionBalance.Achievements.FirstOrDefault(a=>a.Id==id),claims=BadgeClaimCount(s,id)})
      .Where(x=>x.definition!=null&&x.claims>0)
      .OrderByDescending(x=>x.claims).ThenBy(x=>x.id,StringComparer.Ordinal)
      .Take(3).ToArray();
    var heading=Paragraph("ProfileBadgeShowcaseTitle",De?"DEINE ABZEICHEN":"YOUR BADGES",14);
    heading.GetComponent<LayoutElement>().preferredHeight=42;
    if(available.Length==0)
    {
      Paragraph("ProfileNoBadges",De?"Noch keine Abzeichen freigeschaltet. Erledige Achievements oder Challenges.":"No badges unlocked yet. Complete achievements or challenges.");return;
    }
    var row=WorkshopUIFactory.Horizontal("ProfileBadgeShowcase",content,120);
    foreach(var entry in available)
    {
      var slot=WorkshopUIFactory.Vertical("BadgeSlot-"+entry.id,row.transform);
      var badge=WorkshopUIFactory.Node("BadgeArtwork",slot.transform,typeof(Image));
      var art=badge.GetComponent<Image>();art.sprite=ProfileBadgeSprite.Get(BadgeFamily(entry.id),BadgeTier(s,entry.id));
      art.preserveAspect=true;art.raycastTarget=false;
      WorkshopUIFactory.Size(badge,77);
      var caption=WorkshopUIFactory.Label("BadgeName",slot.transform,TierLabel(BadgeTier(s,entry.id))+"\n"+entry.definition.Name,12,40);
      caption.alignment=TextAnchor.MiddleCenter;
      caption.resizeTextForBestFit=true;caption.resizeTextMinSize=10;caption.resizeTextMaxSize=12;
    }
    WorkshopUIFactory.Button("ProfileOpenAllBadges",content,"Alle Abzeichen ansehen",()=>Show("badges"));

  }
  void BadgeLibrary(GameState s)
  {
    Paragraph("ProfileBadgeIntro",De?"DEINE ABZEICHEN\nDeine erreichten Erfolgsstufen werden zu Bronze, Silber und Gold.":"YOUR BADGES\nAchievement tiers grow into bronze, silver and gold badges.");
    foreach(string id in ShowcaseIds)
    {
      var a=RetentionBalance.Achievements.FirstOrDefault(x=>x.Id==id);
      if(a==null)continue;
      int claims=BadgeClaimCount(s,id),tier=BadgeTier(s,id);
      var card=Card("ProfileBadge-"+id,a.Name+" · "+(claims==0?"Gesperrt":TierLabel(tier)),()=>{});
      card.Button.interactable=false;
      card.GetComponent<LayoutElement>().preferredHeight=132;
      card.Icon.gameObject.SetActive(true);card.Icon.sprite=ProfileBadgeSprite.Get(BadgeFamily(id),tier);
      card.Icon.preserveAspect=true;
      card.Icon.color=claims>0?Color.white:new Color(1f,1f,1f,.35f);
      card.Detail.text=a.Description+"\n"+claims+" Achievement-Stufen erhalten"+
        (claims==0?" · Bronze ab erster Stufe":claims<4?" · Silber ab 4 Stufen":claims<8?" · Gold ab 8 Stufen":" · Gold freigeschaltet");
    }
    GameMenu.SmallClose(content,"ProfileBackToIdentity",()=>Show("profile"));
  }

  [Serializable] sealed class NameCheckReply { public bool available; public string name,reason; }
  void NameInput(bool ai,Transform parent)
  {
   string key=ai?"AIName":"PlayerName";Paragraph(key+"Label",ai?(De?"KI-Name · einmalig wählen":"AI name · choose once"):(De?"Spielernamen ändern":"Change player name"),14,parent);
   var root=WorkshopUIFactory.Node(key+"Input",parent,typeof(Image),typeof(InputField));WorkshopUIFactory.Size(root,54);root.GetComponent<Image>().color=GameTheme.Raised;
   var text=WorkshopUIFactory.Label("Value",root.transform,"",16);DestroyImmediate(text.GetComponent<LayoutElement>());WorkshopUIFactory.Fill(text.rectTransform);text.rectTransform.offsetMin=new Vector2(10,0);text.rectTransform.offsetMax=new Vector2(-10,0);var input=root.GetComponent<InputField>();input.textComponent=text;input.text=ai?"":game.State.Retention.playerName;input.interactable=game.Writable;
   var error=Paragraph(key+"Error","",14,parent);error.gameObject.SetActive(false);
   Button button=null;
   button=WorkshopUIFactory.Button(key+"Save",parent,De?"Namen speichern":"Save name",()=>{
      error.gameObject.SetActive(true);string desired=input.text;var result=NameRules.Validate(desired,ai?NameBalance.AIMaximum:NameBalance.PlayerMaximum);
      if(!result.Ok){
         error.text=result.Error=="length"?"Bitte wähle einen Namen mit 2 bis "+(ai?NameBalance.AIMaximum:NameBalance.PlayerMaximum)+" Zeichen.":
           result.Error=="characters"?"Bitte verwende nur Buchstaben, Zahlen, Leerzeichen, - oder _.":"Bitte wähle einen anderen Namen.";
         return;
      }
      Action saveLocal=()=>{if(game!=null&&game.Act(v=>RetentionRules.SetName(v,desired,ai)))Build();};
      if(ai||desired==game.State.Retention.playerName){saveLocal();return;}
      var api=FindObjectOfType<CompanyApiClient>();
      if(api==null||!api.IsConfigured){
        // Offline is playable; the server will reserve a unique name only when account linking is available.
        saveLocal();return;
      }
      button.interactable=false;error.text="Prüfe Namen weltweit…";
      StartCoroutine(api.CheckUniqueName(desired,(code,json)=>{
        if(this==null||button==null)return;
        button.interactable=game.Writable;
        if(code!=200){
          error.text="Online-Namensprüfung derzeit nicht erreichbar. Bitte später erneut versuchen.";
          return;
        }
        NameCheckReply checkedName=null;
        try{checkedName=JsonUtility.FromJson<NameCheckReply>(json);}catch(Exception){}
        if(checkedName==null||!checkedName.available){
          error.text="Dieser Spielername ist schon vergeben oder nicht zulässig.";return;
        }
        if(!api.HasSession){
          // Anonymous availability is only a preview; never claim this is a server reservation.
          saveLocal();return;
        }
        button.interactable=false;
        StartCoroutine(api.ReserveUniqueName(desired,(reserveCode,reserveJson)=>{
          if(this==null||button==null)return;
          button.interactable=game.Writable;
          if(reserveCode>=200&&reserveCode<300){saveLocal();return;}
          error.text=reserveCode==409?"Name wurde inzwischen vergeben. Bitte anderen wählen.":
            "Online-Reservierung fehlgeschlagen. Name noch nicht gespeichert.";
        }));
      }));
   });button.interactable=game.Writable;
  }
 }
}
