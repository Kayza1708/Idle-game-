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
  bool De=>game.State.Settings.language=="de";
  GameRuntime game;Transform content;Text header;string page="profile";readonly List<Action> refresh=new List<Action>();
  public void Initialize(GameRuntime runtime)
  {
   game=runtime;header=WorkshopUIFactory.Label("ProfileWallet",transform,"",17,72);
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
  void Show(string next){page=next;Build();}
  void Update(){if(game==null)return;header.text=game.State.Retention.playerName+"\n"+game.State.Retention.gems+" Gems · "+game.State.Retention.points+" AP · "+game.State.Challenges.Progress.stars+(De?" Sterne":" stars")+(ChallengeRules.Active(game.State)?(De?"\nChallenge-Labor · Hauptspiel pausiert":"\nChallenge lab · main game paused"):"");foreach(var update in refresh)update();}
  Text Paragraph(string name,string text,int size=14)
  {var label=WorkshopUIFactory.Label(name,content,text,size,72);label.alignment=TextAnchor.UpperLeft;label.GetComponent<LayoutElement>().preferredHeight=Math.Max(54,label.cachedTextGenerator.GetPreferredHeight(text,label.GetGenerationSettings(new Vector2(Math.Max(220,((RectTransform)transform).rect.width-20),0)))/label.pixelsPerUnit+16);return label;}
  ActionCard Card(string name,string title,Action action)
  {var c=Instantiate(game.CardPrefab,content);c.gameObject.name=name;c.Title.text=title;c.Icon.gameObject.SetActive(false);c.GetComponent<LayoutElement>().preferredHeight=180;c.Title.fontSize=16;c.Detail.fontSize=14;c.Button.onClick.AddListener(()=>action());return c;}
  void Build()
  {
   WorkshopUIFactory.Clear(content);refresh.Clear();var s=game.State;
   if(page=="licenses")
   {foreach(string name in new[]{"NameModerationNotice","NameModerationLicense","UnicodeLicense"}){var data=Resources.Load<TextAsset>("Licenses/"+name);if(data==null)throw new InvalidOperationException("Missing shipped license: "+name);int index=0;for(int start=0;start<data.text.Length;start+=2500)Paragraph("License-"+name+"-"+index++,data.text.Substring(start,Math.Min(2500,data.text.Length-start)));}return;}
   if(page=="achievements")
   {
    Paragraph("AchievementExplanation","Jede erreichte Stufe kann einmal abgeholt werden. AP erhöhen die Einnahmen nach der bestehenden Formel; ein Claim wird sofort gespeichert.");
    foreach(var a in RetentionBalance.Achievements)
    {int tier=RetentionRules.CurrentTier(s,a);var card=Card("Achievement-"+a.Id,a.Name+" · Stufe "+(tier+1),()=>{if(game.Act(v=>RetentionRules.Achievement(v,a.Id,tier))){Build();var earned=content.GetComponentsInChildren<ActionCard>().FirstOrDefault(c=>c.name=="Achievement-"+a.Id);if(earned!=null)PanelMotion.Play(earned.Icon.gameObject,game.State.Workshop.reducedMotion||!game.State.Settings.effects,true);}});var claimNotice=ClaimNotice.Attach(card.Button.transform);card.Icon.gameObject.SetActive(true);card.Icon.sprite=ProfileBadgeSprite.Get(BadgeFamily(a.Id),BadgeTier(s,a.Id));card.Icon.color=BadgeClaimCount(s,a.Id)>0?Color.white:new Color(1f,1f,1f,.35f);card.Icon.preserveAspect=true;refresh.Add(()=>{var current=game.State;bool claimed=current.Retention.achievementClaims.Contains(a.Id+":"+tier);int reward=Math.Min(tier,RetentionBalance.TierGems.Length-1);card.Detail.text=a.Description+"\n"+ScientificNumber.From(RetentionRules.AchievementValue(current,a.Id))+" / "+ScientificNumber.From(a.Thresholds[tier])+"\n"+(claimed?"Abgeholt":(RetentionRules.AchievementReady(current,a.Id,tier)?"Abholen: ":"Belohnung: ")+RetentionBalance.TierGems[reward]+" Gems + "+RetentionBalance.TierPoints[reward]+" AP");card.Button.interactable=game.Writable&&RetentionRules.AchievementReady(current,a.Id,tier);claimNotice.SetActive(card.Button.interactable);});}return;
   }
   if(page=="badges"){BadgeLibrary(s);return;}
   if(page=="onboarding")
   {for(int i=0;i<RetentionBalance.IntroIds.Length;i++){string id=RetentionBalance.IntroIds[i];int index=i;var card=Card("Intro-"+id,RetentionBalance.IntroTitles[i],()=>{if(game.Act(v=>RetentionRules.Onboarding(v,id)))Build();});var claimNotice=ClaimNotice.Attach(card.Button.transform);refresh.Add(()=>{var r=game.State.Retention;bool claimed=r.onboardingClaimed.Contains(id),done=r.onboardingCompleted.Contains(id);card.Detail.text=RetentionBalance.IntroText[index]+"\n"+RetentionBalance.IntroRewards[index]+"\n"+(claimed?"Abgeholt":done?"Abholen":"Ziel noch offen");card.Button.interactable=game.Writable&&!ChallengeRules.Active(game.State)&&done&&!claimed;claimNotice.SetActive(card.Button.interactable);});}return;}
   if(page=="challenges")
   {foreach(var c in RetentionBalance.Challenges){var card=Card("StaticChallenge-"+c.Id,c.Name,()=>{if(game.Act(v=>RetentionRules.StaticChallenge(v,c.Id)))Build();});var claimNotice=ClaimNotice.Attach(card.Button.transform);refresh.Add(()=>{bool claimed=game.State.Retention.challengeClaims.Contains(c.Id);card.Detail.text=c.Description+"\n"+c.Stars+" Sterne · "+(claimed?"Abgeholt":RetentionRules.StaticReady(game.State,c.Id)?"Abholen":"Ziel noch offen");card.Button.interactable=game.Writable&&RetentionRules.StaticReady(game.State,c.Id);claimNotice.SetActive(card.Button.interactable);});}return;}
   ProfileIdentity(s);
   Paragraph("ProfileSummary",(De?"Spieler: ":"Player: ")+s.Retention.playerName+"\n"+(De?"KI: ":"AI: ")+(string.IsNullOrEmpty(s.Retention.aiName)?(De?"Noch unbenannt":"Not named yet"):s.Retention.aiName)+"\n"+(De?"Artefakte: ":"Artifacts: ")+s.Retention.artifacts.Length+(De?" · abgeschlossene Seasons: ":" · completed seasons: ")+s.Retention.completedSeasons.Length);
   WorkshopUIFactory.Button("ShowNameLicenses",content,"Namensfilter · Quellen und Lizenzen",()=>Show("licenses"));
   LocalBadgeShowcase(s);
   FramePreviews();
   NameInput(false);if(string.IsNullOrEmpty(s.Retention.aiName))NameInput(true);
   Paragraph("MailboxTitle","POSTFACH",17);if(s.Retention.inbox.Length==0)Paragraph("EmptyMailbox","Keine Nachrichten vorhanden.");
   foreach(var message in s.Retention.inbox)
   {Paragraph("Message-"+message.id,message.title+"\n"+message.body);bool read=s.Retention.readMessages.Contains(message.id);var b=WorkshopUIFactory.Button("Read-"+message.id,content,read?"Gelesen":"Als gelesen markieren",()=>{if(game.Act(v=>RetentionRules.ReadMessage(v,message.id)))Build();});b.interactable=game.Writable&&!read;}
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
    var row=WorkshopUIFactory.Horizontal("ProfileIdentity",content,108);
    var holder=WorkshopUIFactory.Node("ProfilePortrait",row.transform,typeof(Image));
    var icon=holder.GetComponent<Image>();
    icon.sprite=ProfileBadgeSprite.Get("achievement",1);
    icon.preserveAspect=true;icon.raycastTarget=false;
    var layout=holder.AddComponent<LayoutElement>();layout.minWidth=108;layout.preferredWidth=108;layout.preferredHeight=108;
    var frame=WorkshopUIFactory.Node("ProfileFrame",holder.transform,typeof(Image)).GetComponent<Image>();
    WorkshopUIFactory.Fill(frame.rectTransform);
    frame.sprite=ProfileFrameSprite.Get("basic");
    frame.preserveAspect=true;frame.raycastTarget=false;
    var label=WorkshopUIFactory.Label("ProfileIdentityText",row.transform,
      s.Retention.playerName+(De?"\nSpielerprofil · lokal\n":"\nPlayer profile · local\n")+s.Retention.achievementClaims.Length+(De?" erhaltene Achievement-Stufen":" claimed achievement tiers"),16,108);
    label.alignment=TextAnchor.MiddleLeft;
  }
  void LocalBadgeShowcase(GameState s)
  {
    var available=ShowcaseIds
      .Select(id=>new{id,definition=RetentionBalance.Achievements.FirstOrDefault(a=>a.Id==id),claims=BadgeClaimCount(s,id)})
      .Where(x=>x.definition!=null&&x.claims>0)
      .OrderByDescending(x=>x.claims).ThenBy(x=>x.id,StringComparer.Ordinal)
      .Take(3).ToArray();
    var heading=Paragraph("ProfileBadgeShowcaseTitle",De?"ABZEICHEN · persönlicher Schaukasten":"BADGES · personal showcase",16);
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
    Paragraph("ProfileBadgePrivacy","Diese Ansicht verwendet deinen lokalen Spielstand. Öffentliche Company-Badges und frei wählbare Online-Schaukastenplätze benötigen eine überprüfte Konto-Verknüpfung.");
  }
  void FramePreviews()
  {
    var title=Paragraph("ProfileRareFrames","SELTENE PROFILRAHMEN · Vorschau",16);
    title.GetComponent<LayoutElement>().preferredHeight=42;
    var row=WorkshopUIFactory.Horizontal("ProfileFramePreviewGallery",content,124);
    string[] ids={"neon","quantum","singularity"};
    string[] labels={"Neon · 60 Gems","Quantum · 150 Gems","Singularity · Event"};
    for(int i=0;i<ids.Length;i++)
    {
      var root=WorkshopUIFactory.Vertical("Preview-"+ids[i],row.transform);
      var node=WorkshopUIFactory.Node("FramePreviewIcon",root.transform,typeof(Image));
      WorkshopUIFactory.Size(node,83);
      var image=node.GetComponent<Image>();
      image.sprite=ProfileFrameSprite.Get(ids[i]);
      image.preserveAspect=true;image.raycastTarget=false;
      node.AddComponent<AnimatedProfileFrame>().Initialize(image,ids[i],()=>game!=null&&game.State.Settings.effects);
      var caption=WorkshopUIFactory.Label("FramePreviewCaption",root.transform,labels[i],11,32);
      caption.alignment=TextAnchor.MiddleCenter;caption.resizeTextForBestFit=true;
      caption.resizeTextMinSize=9;caption.resizeTextMaxSize=11;
    }
    Paragraph("FrameOwnershipNotice","Nur Vorschau. Kauf/Ausrüsten wird nach serverseitiger Gem-Prüfung freigeschaltet.");
  }
  void BadgeLibrary(GameState s)
  {
    Paragraph("ProfileBadgeIntro","ABZEICHEN · Bronze / Silber / Gold\nEchte lokale Achievement-Stufen werden hier sichtbar. Die Online-Veröffentlichung erfolgt erst nach sicherer Verifizierung.");
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
    WorkshopUIFactory.Button("ProfileBackToIdentity",content,"Zurück zum Profil",()=>Show("profile"));
  }

  [Serializable] sealed class NameCheckReply { public bool available; public string name,reason; }
  void NameInput(bool ai)
  {
   string key=ai?"AIName":"PlayerName";Paragraph(key+"Label",ai?"KI-Name · einmalig wählen":"Spielernamen ändern");
   var root=WorkshopUIFactory.Node(key+"Input",content,typeof(Image),typeof(InputField));WorkshopUIFactory.Size(root,54);root.GetComponent<Image>().color=new Color(.1f,.2f,.25f);
   var text=WorkshopUIFactory.Label("Value",root.transform,"",16);DestroyImmediate(text.GetComponent<LayoutElement>());WorkshopUIFactory.Fill(text.rectTransform);text.rectTransform.offsetMin=new Vector2(10,0);text.rectTransform.offsetMax=new Vector2(-10,0);var input=root.GetComponent<InputField>();input.textComponent=text;input.text=ai?"":game.State.Retention.playerName;input.interactable=game.Writable;
   var error=Paragraph(key+"Error"," ");
   Button button=null;
   button=WorkshopUIFactory.Button(key+"Save",content,"Namen speichern",()=>{
      string desired=input.text;var result=NameRules.Validate(desired,ai?NameBalance.AIMaximum:NameBalance.PlayerMaximum);
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
