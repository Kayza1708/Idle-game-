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
  GameRuntime game;Transform content;Text header;string page="achievements";readonly List<Action> refresh=new List<Action>();
  public void Initialize(GameRuntime runtime)
  {
   game=runtime;header=WorkshopUIFactory.Label("ProfileWallet",transform,"",17,72);
   var nav=WorkshopUIFactory.Vertical("RetentionNavigation",transform).transform;
   WorkshopUIFactory.Button("ShowAchievements",nav,"Achievements",()=>Show("achievements"));WorkshopUIFactory.Button("ShowOnboarding",nav,"Laborziele · Einführungsbelohnungen",()=>Show("onboarding"));WorkshopUIFactory.Button("ShowStaticChallenges",nav,"Langzeit-Challenges",()=>Show("challenges"));WorkshopUIFactory.Button("ShowProfile",nav,"Profil und Postfach",()=>Show("profile"));
   content=WorkshopUIFactory.Vertical("RetentionContent",transform).transform;Build();
  }
  void Show(string next){page=next;Build();}
  void Update(){if(game==null)return;header.text=game.State.Retention.playerName+"\n"+game.State.Retention.gems+" Gems · "+game.State.Retention.points+" AP · "+game.State.Challenges.Progress.stars+" Sterne"+(ChallengeRules.Active(game.State)?"\nChallenge-Labor · Hauptspiel pausiert":"");foreach(var update in refresh)update();}
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
    {int tier=RetentionRules.CurrentTier(s,a);var card=Card("Achievement-"+a.Id,a.Name+" · Stufe "+(tier+1),()=>{if(game.Act(v=>RetentionRules.Achievement(v,a.Id,tier)))Build();});refresh.Add(()=>{var current=game.State;bool claimed=current.Retention.achievementClaims.Contains(a.Id+":"+tier);int reward=Math.Min(tier,RetentionBalance.TierGems.Length-1);card.Detail.text=a.Description+"\n"+ScientificNumber.From(RetentionRules.AchievementValue(current,a.Id))+" / "+ScientificNumber.From(a.Thresholds[tier])+"\n"+(claimed?"Abgeholt":(RetentionRules.AchievementReady(current,a.Id,tier)?"Abholen: ":"Belohnung: ")+RetentionBalance.TierGems[reward]+" Gems + "+RetentionBalance.TierPoints[reward]+" AP");card.Button.interactable=game.Writable&&RetentionRules.AchievementReady(current,a.Id,tier);});}return;
   }
   if(page=="onboarding")
   {for(int i=0;i<RetentionBalance.IntroIds.Length;i++){string id=RetentionBalance.IntroIds[i];int index=i;var card=Card("Intro-"+id,RetentionBalance.IntroTitles[i],()=>{if(game.Act(v=>RetentionRules.Onboarding(v,id)))Build();});refresh.Add(()=>{var r=game.State.Retention;bool claimed=r.onboardingClaimed.Contains(id),done=r.onboardingCompleted.Contains(id);card.Detail.text=RetentionBalance.IntroText[index]+"\n"+RetentionBalance.IntroRewards[index]+"\n"+(claimed?"Abgeholt":done?"Abholen":"Ziel noch offen");card.Button.interactable=game.Writable&&!ChallengeRules.Active(game.State)&&done&&!claimed;});}return;}
   if(page=="challenges")
   {foreach(var c in RetentionBalance.Challenges){var card=Card("StaticChallenge-"+c.Id,c.Name,()=>{if(game.Act(v=>RetentionRules.StaticChallenge(v,c.Id)))Build();});refresh.Add(()=>{bool claimed=game.State.Retention.challengeClaims.Contains(c.Id);card.Detail.text=c.Description+"\n"+c.Stars+" Sterne · "+(claimed?"Abgeholt":RetentionRules.StaticReady(game.State,c.Id)?"Abholen":"Ziel noch offen");card.Button.interactable=game.Writable&&RetentionRules.StaticReady(game.State,c.Id);});}return;}
   Paragraph("ProfileSummary","Spieler: "+s.Retention.playerName+"\nKI: "+(string.IsNullOrEmpty(s.Retention.aiName)?"Noch unbenannt":s.Retention.aiName)+"\nArtefakte: "+s.Retention.artifacts.Length+" · abgeschlossene Seasons: "+s.Retention.completedSeasons.Length);
   WorkshopUIFactory.Button("ShowNameLicenses",content,"Namensfilter · Quellen und Lizenzen",()=>Show("licenses"));
   NameInput(false);if(string.IsNullOrEmpty(s.Retention.aiName))NameInput(true);
   Paragraph("MailboxTitle","POSTFACH",17);if(s.Retention.inbox.Length==0)Paragraph("EmptyMailbox","Keine Nachrichten vorhanden.");
   foreach(var message in s.Retention.inbox)
   {Paragraph("Message-"+message.id,message.title+"\n"+message.body);bool read=s.Retention.readMessages.Contains(message.id);var b=WorkshopUIFactory.Button("Read-"+message.id,content,read?"Gelesen":"Als gelesen markieren",()=>{if(game.Act(v=>RetentionRules.ReadMessage(v,message.id)))Build();});b.interactable=game.Writable&&!read;}
  }
  void NameInput(bool ai)
  {
   string key=ai?"AIName":"PlayerName";Paragraph(key+"Label",ai?"KI-Name · einmalig wählen":"Spielernamen ändern");
   var root=WorkshopUIFactory.Node(key+"Input",content,typeof(Image),typeof(InputField));WorkshopUIFactory.Size(root,54);root.GetComponent<Image>().color=new Color(.1f,.2f,.25f);
   var text=WorkshopUIFactory.Label("Value",root.transform,"",16);DestroyImmediate(text.GetComponent<LayoutElement>());WorkshopUIFactory.Fill(text.rectTransform);text.rectTransform.offsetMin=new Vector2(10,0);text.rectTransform.offsetMax=new Vector2(-10,0);var input=root.GetComponent<InputField>();input.textComponent=text;input.text=ai?"":game.State.Retention.playerName;input.interactable=game.Writable;
   var error=Paragraph(key+"Error"," ");var button=WorkshopUIFactory.Button(key+"Save",content,"Namen speichern",()=>{var result=NameRules.Validate(input.text,ai?NameBalance.AIMaximum:NameBalance.PlayerMaximum);if(!result.Ok){error.text=result.Error=="length"?"Bitte wähle einen Namen mit 2 bis "+(ai?NameBalance.AIMaximum:NameBalance.PlayerMaximum)+" Zeichen.":result.Error=="characters"?"Bitte verwende nur Buchstaben, Zahlen, Leerzeichen, - oder _.":"Bitte wähle einen anderen Namen.";return;}if(game.Act(v=>RetentionRules.SetName(v,input.text,ai)))Build();});button.interactable=game.Writable;
  }
 }
}
