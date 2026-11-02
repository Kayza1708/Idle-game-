using System;
using System.Linq;
using System.Collections.Generic;
using IdleIntelligence.Core;
using UnityEngine;
using UnityEngine.UI;
namespace IdleIntelligence.Runtime
{
 public sealed class MissionView:MonoBehaviour
 {
  string N(double value)=>NumberFormatting.Format(ScientificNumber.From(value),game.State.Settings.numberFormat,game.State.Settings.language);
  GameRuntime game;Transform content;Text header;int kind;string signature="";readonly List<Action> updates=new List<Action>();
  public void Initialize(GameRuntime runtime){game=runtime;header=WorkshopUIFactory.Label("MissionHeader",transform,"",16,84);var nav=WorkshopUIFactory.Horizontal("MissionPeriods",transform).transform;for(int i=0;i<3;i++){int k=i;WorkshopUIFactory.Button("MissionPeriod-"+i,nav,new[]{"Täglich","Wöchentlich","Monatlich"}[i],()=>{kind=k;Build();});}content=WorkshopUIFactory.Vertical("MissionContent",transform).transform;Build();}
  string Signature()=>kind+":"+game.State.Missions.Period(kind).key+":"+string.Join(",",game.State.Missions.boxes.pending.Select(b=>b.id))+":"+game.State.Missions.startPending;
  void Update(){if(game==null)return;var s=game.State;header.text=s.Retention.gems+" Gems · "+s.Missions.season.id+" · Stufe "+MissionRules.SeasonLevel(s)+" / "+MissionBalance.SeasonLevels+"\n"+s.Missions.season.xp+" Season-XP\n"+(ChallengeRules.Active(s)?"Hauptspiel pausiert · Claims gesperrt":"UTC-Perioden · Fortschritt bleibt bei Prestige erhalten");if(signature!=Signature())Build();foreach(var update in updates)update();}
  void Paragraph(string name,string text,int height=90){var label=WorkshopUIFactory.Label(name,content,text,14,height);label.alignment=TextAnchor.UpperLeft;}
  void Build()
  {
   signature=Signature();WorkshopUIFactory.Clear(content);updates.Clear();var s=game.State;var p=s.Missions.Period(kind);int period=kind;string key=p.key;
   if(s.Missions.startPending){Paragraph("MissionMigrationPending","Missionen beginnen nach der ersten Hauptspiel-Synchronisierung. Historischer Fortschritt wird nicht rückwirkend belohnt.");return;}
   Paragraph("MissionPeriodInfo",p.key+" · Ende UTC: "+MissionCalendar.Key(p.endsAt,0)+" 00:00"+"\nAbgelaufene Ziele zahlen nur Gems automatisch aus. Materialien, Bonusbox und XP durch rechtzeitiges Abholen.",108);
   foreach(var task in p.tasks)
   {
    string id=task.id;var card=Instantiate(game.CardPrefab,content);card.gameObject.name="Mission-"+id;card.Icon.gameObject.SetActive(false);card.Title.text=task.de;card.Title.fontSize=16;card.Detail.fontSize=14;card.GetComponent<LayoutElement>().preferredHeight=180;
    var claimNotice=ClaimNotice.Attach(card.Button.transform);card.Button.onClick.AddListener(()=>game.Act(v=>v.Missions.Period(period).key==key?MissionRules.Claim(v,period,id):v,"claim"));
    updates.Add(()=>{var state=game.State;var t=state.Missions.Period(period).tasks.FirstOrDefault(v=>v.id==id);if(t==null)return;bool ready=MissionRules.Complete(state,t);card.Detail.text=N(MissionRules.Progress(state,t))+" / "+N(t.goal)+"\n"+t.reward+" Gems · "+MissionBalance.QuestXP[period]*t.rewardTier+" XP\n"+(t.claimed?"Abgeholt":ready?"Abholen":"Ziel noch offen");card.Button.interactable=game.Writable&&!ChallengeRules.Active(state)&&ready&&!t.claimed;claimNotice.SetActive(card.Button.interactable);});
   }
   var bonus=WorkshopUIFactory.Button("MissionBonus",content,"",()=>game.Act(v=>v.Missions.Period(period).key==key?MissionRules.Bonus(v,period):v,"claim"));var bonusNotice=ClaimNotice.Attach(bonus.transform);bonus.GetComponent<LayoutElement>().preferredHeight=78;
   updates.Add(()=>{var current=game.State;var v=current.Missions.Period(period);int done=v.tasks.Count(t=>MissionRules.Complete(current,t));bonus.GetComponentInChildren<Text>().text=v.bonusClaimed?"Periodenbonus abgeholt":"Bonus: "+done+" / "+v.required+" · "+v.bonus+" Gems + "+(period==0?"Bonusbox":"Materialpaket")+" + XP";bonus.interactable=game.Writable&&!ChallengeRules.Active(current)&&!v.bonusClaimed&&v.required>0&&done>=v.required;bonusNotice.SetActive(bonus.interactable);});
   Paragraph("BonusBoxHelp","BONUSBOXEN · Einmalige Tagesbonus-Belege\nFamilie beim Öffnen wählen. Inhalt wurde beim Erhalt festgelegt. Bei 32 offenen Boxen wird nur die neue Box automatisch geöffnet.",108);
   foreach(var box in s.Missions.boxes.pending){long id=box.id;Paragraph("BonusBox-"+id,"Bonusbox #"+id+" · "+(box.blueprint==""?"Materialien":box.blueprint=="fragment"?"mit Bauplanfragment":"mit Bauplan"),54);foreach(var choice in box.choices){int family=choice.family;var button=WorkshopUIFactory.Button("OpenBonusBox-"+id+"-"+family,content,MissionBalance.FamilyIds[family]+" · "+choice.amount+" je Komponente",()=>game.Act(v=>BonusBoxes.Open(v,id,family),"bonus-box-open"));updates.Add(()=>button.interactable=game.Writable&&!ChallengeRules.Active(game.State));}}
   if(s.Missions.boxes.pending.Length==0)Paragraph("NoBonusBoxes","Keine offenen Bonusboxen.",54);
   if(s.Missions.boxes.hasLast){var last=s.Missions.boxes.last;Paragraph("BonusBoxReceipt","Zuletzt geöffnet: #"+last.id+" · "+MissionBalance.FamilyIds[last.family]+" · "+last.components.Sum()+" Komponenten"+(last.automatic?" · automatisch":""),72);}
  }
 }
}
