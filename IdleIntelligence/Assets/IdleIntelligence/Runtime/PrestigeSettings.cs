using System;using System.Linq;using System.Globalization;using IdleIntelligence.Core;using UnityEngine;using UnityEngine.UI;
namespace IdleIntelligence.Runtime
{
 public static class PrestigeSettings
 {
  static void Edit(GameRuntime game,Action<GameState> edit,Action refresh){game.Act(s=>{var n=s.Copy();edit(n);n.Prestige.revision++;return n;});refresh();}
  static void Toggle(Transform parent,GameRuntime game,string name,string label,bool value,Action<GameState> change,Action refresh){var b=WorkshopUIFactory.Button(name,parent,label+": "+(value?"An":"Aus"),()=>Edit(game,change,refresh));b.interactable=game.Writable;}
  static void Number(Transform parent,GameRuntime game,string name,string label,string value,Action<GameState,string> change,Action refresh)
  {
   WorkshopUIFactory.Label(name+"Title",parent,label,13,24);var root=WorkshopUIFactory.Node(name,parent,typeof(Image),typeof(InputField));WorkshopUIFactory.Size(root,54);root.GetComponent<Image>().color=new Color(.1f,.2f,.25f);var text=WorkshopUIFactory.Label("Value",root.transform,value,16);UnityEngine.Object.DestroyImmediate(text.GetComponent<LayoutElement>());WorkshopUIFactory.Fill(text.rectTransform);var field=root.GetComponent<InputField>();field.textComponent=text;field.text=value;field.lineType=InputField.LineType.SingleLine;field.interactable=game.Writable;bool modified=false;field.onValueChanged.AddListener(_=>modified=true);field.onEndEdit.AddListener(v=>{if(!modified)return;modified=false;try{Edit(game,s=>change(s,v),refresh);}catch(FormatException){}catch(ArgumentOutOfRangeException){}});
  }
  static string Input(ScientificNumber value){var d=value.ToData();return d.m.ToString("R",CultureInfo.InvariantCulture)+"e"+d.e.ToString(CultureInfo.InvariantCulture);}
  static int Nonnegative(string v){if(!int.TryParse(v,NumberStyles.Integer,CultureInfo.InvariantCulture,out int n)||n<0)throw new FormatException();return n;}
  public static void Build(Transform parent,GameRuntime game,string id,Action refresh)
  {
   var s=game.State;var p=s.Prestige;if(!PrestigeRules.Has(s,id))return;
   if(id.StartsWith("H")&&int.Parse(id.Substring(1))<=5)
   {
    for(int i=0;i<Balance.Hardware.Length;i++)if(PrestigeBalance.HardwareGroup[i]==id){int index=i;Toggle(parent,game,"auto-"+Balance.Hardware[i].Id,"Auto: "+Balance.Hardware[i].Name,p.hardwareAuto[i],n=>n.Prestige.hardwareAuto[index]=!n.Prestige.hardwareAuto[index],refresh);}
    WorkshopUIFactory.Button("HardwareReserve",parent,"Einkaufsreserve: "+(p.reservePercent*100)+" %",()=>Edit(game,n=>n.Prestige.reservePercent=(n.Prestige.reservePercent+.25)%1,refresh));Number(parent,game,"SharedCreditReserve","Gemeinsame feste Creditreserve",Input(ScientificNumber.FromData(p.creditReserve)),(n,v)=>n.Prestige.creditReserve=ScientificNumber.Parse(v).ToData(),refresh);
   }
   if(id=="T06")
   {
    Toggle(parent,game,"TrainingAutopilot","Trainingsautopilot",p.trainingAuto,n=>n.Prestige.trainingAuto=!n.Prestige.trainingAuto,refresh);for(int i=0;i<3;i++){int t=i;Number(parent,game,"TrainingTarget"+i,PrestigeAutomation.Tracks[i]+" Ziellevel (0 = unbegrenzt)",p.trainingTargets[i].ToString(),(n,v)=>n.Prestige.trainingTargets[t]=Nonnegative(v)<=100000?Nonnegative(v):throw new ArgumentOutOfRangeException(),refresh);}
   }
   if(id=="F02"||id=="F03")WorkshopUIFactory.Button("OpenAnalysisPlanning",parent,s.Settings.language=="de"?"Analysen in der Schmiede planen":"Plan analyses in the forge",()=>{var network=UnityEngine.Object.FindFirstObjectByType<PrestigeNetworkView>();network?.CloseDetail();game.Show("items");game.WorkshopView.ChangeMode("components");});
   if(id=="F03")
   {
    Toggle(parent,game,"ResearchRepeat","Forschung wiederholen",p.researchRepeat,n=>n.Prestige.researchRepeat=!n.Prestige.researchRepeat&&!string.IsNullOrEmpty(n.Prestige.repeatId),refresh);WorkshopUIFactory.Button("RepeatProject",parent,"Projekt: "+(string.IsNullOrEmpty(p.repeatId)?"wählen":p.repeatId),()=>Edit(game,n=>{var ids=Balance.Research.Where(r=>!r.Project).Select(r=>r.Id).ToArray();n.Prestige.repeatId=ids[(Array.IndexOf(ids,n.Prestige.repeatId)+1)%ids.Length];},refresh));
   }
   if(id=="F05")
   {
    Toggle(parent,game,"ResearchDirector","Forschungsdirektor",p.director,n=>n.Prestige.director=!n.Prestige.director,refresh);Toggle(parent,game,"DirectorMode","Bezahlbares Ziel überspringend wählen",p.directorAffordable,n=>n.Prestige.directorAffordable=!n.Prestige.directorAffordable,refresh);
    Number(parent,game,"DirectorBudget","Gesamtbudget Daten (leer = pausiert; bisher ausgegeben: "+ScientificNumber.FromData(p.directorSpent)+")",p.directorBudgetSet?Input(ScientificNumber.FromData(p.directorBudget)):"",(n,v)=>{n.Prestige.directorBudgetSet=!string.IsNullOrWhiteSpace(v);n.Prestige.directorBudget=n.Prestige.directorBudgetSet?ScientificNumber.Parse(v).ToData():ScientificNumber.Zero.ToData();},refresh);
    WorkshopUIFactory.Button("DirectorReserve",parent,"Datenreserve: "+(p.directorReservePercent*100)+" %",()=>Edit(game,n=>n.Prestige.directorReservePercent=(n.Prestige.directorReservePercent+.25)%1,refresh));
    for(int i=0;i<p.researchTargets.Length;i++){int index=i;var target=p.researchTargets[i];WorkshopUIFactory.Button("DirectorProject"+i,parent,target.id+" · Projekt wechseln",()=>Edit(game,n=>{var ids=Balance.Research.Where(r=>!n.Prestige.researchTargets.Where((t,k)=>k!=index).Any(t=>t.id==r.Id)).Select(r=>r.Id).ToArray();n.Prestige.researchTargets[index].id=ids[(Array.IndexOf(ids,target.id)+1)%ids.Length];if(Balance.Research[Game.ResearchIndex(n.Prestige.researchTargets[index].id)].Project)n.Prestige.researchTargets[index].level=1;},refresh));Number(parent,game,"DirectorTarget"+i,"Endliches Ziellevel",target.level.ToString(),(n,v)=>n.Prestige.researchTargets[index].level=Balance.Research[Game.ResearchIndex(n.Prestige.researchTargets[index].id)].Project?1:Math.Max(1,Nonnegative(v)),refresh);WorkshopUIFactory.Button("RemoveTarget"+i,parent,"Ziel entfernen",()=>Edit(game,n=>n.Prestige.researchTargets=n.Prestige.researchTargets.Where((t,k)=>k!=index).ToArray(),refresh));}
    if(p.researchTargets.Length<(Game.Level(game.State,"researchScheduling")>0?6:3))WorkshopUIFactory.Button("AddResearchTarget",parent,"Forschungsziel hinzufügen",()=>Edit(game,n=>n.Prestige.researchTargets=n.Prestige.researchTargets.Concat(new[]{new ResearchTarget{id=Balance.Research.First(r=>!n.Prestige.researchTargets.Any(t=>t.id==r.Id)).Id,level=1}}).ToArray(),refresh));
   }
   if(id=="I06"||id=="I07")
   {
    Toggle(parent,game,"PrestigeAgent","Prestige-Agent",p.agent,ResetControls.TogglePrestige,refresh);Number(parent,game,"MinimumINT","Mindestgewinn INT",Input(p.Minimum),(n,v)=>n.Prestige.Minimum=ScientificNumber.Parse(v),refresh);WorkshopUIFactory.Button("AgentMinutes",parent,"Mindestlaufzeit: "+p.agentMinutes+" min",()=>Edit(game,n=>{double[] a={15,30,60,120};n.Prestige.agentMinutes=a[(Array.IndexOf(a,n.Prestige.agentMinutes)+1)%a.Length];},refresh));
    Toggle(parent,game,"WaitTraining","Laufendes Training abwarten",p.agentWaitTraining,n=>n.Prestige.agentWaitTraining=!n.Prestige.agentWaitTraining,refresh);Toggle(parent,game,"WaitResearch","Laufende Forschung abwarten",p.agentWaitResearch,n=>n.Prestige.agentWaitResearch=!n.Prestige.agentWaitResearch,refresh);Toggle(parent,game,"WaitAnalysis","Laufende Analyse abwarten",p.agentWaitAnalysis,n=>n.Prestige.agentWaitAnalysis=!n.Prestige.agentWaitAnalysis,refresh);Toggle(parent,game,"WaitCrafting","Herstellung / Schmiede abwarten",p.agentWaitCrafting,n=>n.Prestige.agentWaitCrafting=!n.Prestige.agentWaitCrafting,refresh);
    if(PrestigeRules.Has(s,"I07")){WorkshopUIFactory.Button("RelativeINT",parent,"Relatives Ziel: "+(p.relative>0?"×"+p.relative:"Aus"),()=>Edit(game,n=>{double[] a={0,2,5,10};n.Prestige.relative=a[(Array.IndexOf(a,n.Prestige.relative)+1)%a.Length];},refresh));Number(parent,game,"MaximumRun","Optionale Zeitobergrenze in Sekunden (0 = aus)",p.maximumRunSeconds.ToString(CultureInfo.InvariantCulture),(n,v)=>n.Prestige.maximumRunSeconds=double.TryParse(v,NumberStyles.Float,CultureInfo.InvariantCulture,out double seconds)&&ScientificNumber.Finite(seconds)&&seconds>=0&&seconds<=86400?seconds:throw new ArgumentOutOfRangeException(),refresh);}
   }
  }
 }
}
