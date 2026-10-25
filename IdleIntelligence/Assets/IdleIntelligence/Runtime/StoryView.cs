using System;using System.Linq;using IdleIntelligence.Core;using UnityEngine;using UnityEngine.UI;
namespace IdleIntelligence.Runtime
{
 public sealed class StoryView:MonoBehaviour
 {
  GameRuntime game;string signature;bool De=>game.State.Settings.language=="de";public void Initialize(GameRuntime runtime){game=runtime;Build();}
  void Update(){if(game!=null&&signature!=Signature())Build();}
  string Signature()=>game.State.Settings.language+"|"+game.State.Story.open+"|"+game.State.Story.target+"|"+game.State.Story.tutorial+"|"+string.Join(",",game.State.Story.seen)+"|"+string.Join(",",game.State.Story.chapters)+"|"+game.State.Retention.aiName+"|"+CompanyAccess.LocallyEligible(game.State);
  void Action(string name,string value=""){game.Act(s=>NarrativeBridge.Action(s,name,value));Build();}
  static string ReplayTitle(GameState s,string id){string title=NarrativeBridge.Text(s,id,true);if(!string.IsNullOrWhiteSpace(title))return title;string text=NarrativeBridge.Text(s,id);int end=text.IndexOf('.');if(end>0)text=text.Substring(0,end);return text.Length<=48?text:text.Substring(0,45).TrimEnd()+"…";}
  void Build(){signature=Signature();WorkshopUIFactory.Clear(transform);var s=game.State;var story=s.Story;WorkshopUIFactory.Label("StoryTitle",transform,"Dr. Mira Voss · "+(De?"Dialoge und Kapitel":"Dialogues and chapters"),18,54);
   if(string.IsNullOrEmpty(s.Retention.aiName)||story.open!=null){var coach=Instantiate(Resources.Load<MiraCoach>("PixelUI/MiraCoach"),transform);coach.name="StorySpeechBubble";coach.GetComponent<LayoutElement>().ignoreLayout=false;coach.Initialize(game);}
   if(CompanyAccess.LocallyEligible(s)&&!string.IsNullOrEmpty(s.Retention.aiName)){
   var milestone=WorkshopUIFactory.Label("MiraCompanyMilestone",transform,
     CompanyAccess.Explanation(De,CompanyAccess.LocallyEligible(s)),15,165);
   milestone.alignment=TextAnchor.UpperLeft;
   if(CompanyAccess.LocallyEligible(s))
     WorkshopUIFactory.Label("MiraCompanyUnlockNotice",transform,
       De?"Mira: In der eigenen Welt beginnt jetzt die Ära der Companies. Der Onlinezugang muss noch sicher bestätigt werden.":"Mira: You can now begin the Company era. The server still needs a verified progress proof.",14,75);
   }
   if(story.tutorial=="active"){var guide=TutorialNavigation.Quote(s);WorkshopUIFactory.Label("StoryTarget",transform,guide?.Title??"",16,54);if(guide!=null)WorkshopUIFactory.Label("StoryGuideExplanation",transform,(guide.Explanation??"")+"\n"+(guide.Requirement??""),15,120);WorkshopUIFactory.Button("StoryShowTarget",transform,De?"Ziel zeigen":"Show target",ShowTarget);WorkshopUIFactory.Button("StoryEndGuide",transform,De?"Führung beenden":"End guide",()=>Action("skip-tutorial"));}else {var resume=WorkshopUIFactory.Button("StoryResume",transform,De?"Führung fortsetzen":"Resume guide",()=>Action("resume"));resume.interactable=game.Writable;}
   WorkshopUIFactory.Button("StoryToggle",transform,(De?"Kapitel automatisch öffnen: ":"Open chapters automatically: ")+(story.enabled?"An":"Aus"),()=>Action("toggle"));foreach(string chapter in story.chapters){string id=chapter;var d=NarrativeCatalog.Pages[Array.IndexOf(NarrativeCatalog.Chapters,id)][0];var b=WorkshopUIFactory.Button("Chapter-"+id,transform,NarrativeBridge.Text(s,d,true),()=>Action("chapter",id));b.interactable=game.Writable&&story.open==null;}foreach(string dialogue in story.seen){string id=dialogue;var b=WorkshopUIFactory.Button("Replay-"+id,transform,ReplayTitle(s,id),()=>Action("reopen",id));b.interactable=game.Writable&&story.open==null;}}
  void ShowTarget(){var guide=TutorialNavigation.Quote(game.State);if(guide!=null)game.NavigateTo(guide.Tab,guide.Element,guide.Mode);}
 }
}
