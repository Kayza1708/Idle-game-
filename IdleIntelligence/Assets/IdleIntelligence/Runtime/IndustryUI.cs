using System;
using System.Linq;
using IdleIntelligence.Core;
using UnityEngine;
using UnityEngine.UI;
namespace IdleIntelligence.Runtime
{
 // Shared touch controls and existing detail windows; no separate presentation system.
 public static class IndustryUI
 {
  static Button Action(Transform parent,GameRuntime game,string id,string text,bool allowed,Func<GameState,GameState> action,Action refresh)
  {var b=WorkshopUIFactory.Button(id,parent,text,()=>{game.Act(action);refresh();});b.interactable=game.Writable&&allowed;var textView=b.GetComponentInChildren<Text>();float width=((RectTransform)parent).rect.width;var settings=textView.GetGenerationSettings(new Vector2(Math.Max(220,width>50?width-20:300),0));b.GetComponent<LayoutElement>().preferredHeight=Math.Max(54,textView.cachedTextGenerator.GetPreferredHeight(text,settings)/textView.pixelsPerUnit+16);return b;}
  public static void Materials(Transform parent,GameRuntime game,Action refresh)
  {
   var s=game.State;var i=s.Industry;var w=s.Workshop;

   // Per-component synthesis is reachable from the shared compact overview details.
   WorkshopUIFactory.Label("BreakthroughBalance",parent,"Forschungsfragmente: "+w.researchFragments+" · Durchbrüche",16,44);
   for(int n=0;n<IndustryBalance.BreakthroughIds.Length;n++){string id=IndustryBalance.BreakthroughIds[n];bool owned=i.breakthroughs.Contains(id);Action(parent,game,"Breakthrough"+id,SettingsRules.Text(s.Settings.language,"breakthrough:"+id)+" · "+SettingsRules.Text(s.Settings.language,"breakthrough-effect:"+id)+" · "+"Current shared breakthrough factor: ×"+Industry.BreakthroughFactor(s)+" · "+(owned?"Erforscht":IndustryBalance.BreakthroughCosts[n]+" Forschungsfragmente"),!owned&&w.researchFragments>=IndustryBalance.BreakthroughCosts[n],v=>Industry.BuyBreakthrough(v,id),refresh);}
   foreach(long amount in new[]{1L,10L,100L}){var t=Industry.QuoteConversion(s,amount);Action(parent,game,"ConvertFragments"+amount,"Umwandeln: "+amount*IndustryBalance.ConversionRate+" Forschungsfragmente → "+amount+" Bauplanfragmente"+(i.breakthroughs.Length<IndustryBalance.BreakthroughIds.Length?" · alle Durchbrüche erforderlich":""),t!=null,v=>Industry.Convert(v,t),refresh);}
   int level=i.foundries.Length>0?i.foundries[0].level:0;string reason=Industry.UpgradeBlock(s);string cost=level<IndustryBalance.FoundryMaxLevel?string.Join(" · ",IndustryBalance.ForgeCosts[level].Select((v,c)=>new{v,c}).Where(v=>v.v>0).Select(v=>v.v+" "+ItemBalance.ComponentNames[v.c])):"";
   Action(parent,game,"UpgradeFoundry","Schmiede Lv. "+level+" → "+Math.Min(IndustryBalance.FoundryMaxLevel,level+1)+" · "+cost+(reason==null?"":" · "+reason),reason==null,v=>Industry.UpgradeFoundry(v,level),refresh);
   for(int n=0;n<i.foundries.Length;n++){var f=i.foundries[n];if(f.active!=null)WorkshopUIFactory.Label("FoundryJob"+n,parent,"Schmiede "+(n+1)+": "+f.active.itemId+" → +"+f.active.target+" · "+Math.Floor(100*f.active.done/f.active.required)+" %",14,44);foreach(string id in f.queue)Action(parent,game,"RemoveForge"+id,"Wartend: "+id+" · entfernen (noch unbezahlt)",true,v=>Industry.RemoveQueued(v,id),refresh);}
  }
  public static void Item(Transform parent,GameRuntime game,string id,Action refresh)
  {var s=game.State;var item=s.Workshop.inventory.First(i=>i.id==id);var q=Industry.ForgeQuote(s,id);bool queue=!item.locked&&!item.challengeCopy&&!Industry.Busy(s,id)&&item.forge<IndustryBalance.ForgeItemLimit&&(s.Industry.foundries.Length==0||s.Industry.foundries[0].queue.Length<2);var costs=WorkshopUIFactory.Node("ForgeItemCosts",parent,typeof(CostStrip));costs.GetComponent<CostStrip>().Bind(game,q);WorkshopUIFactory.Label("ForgeItemWork",parent,Math.Ceiling(Industry.ForgeWork(s,item))+" Arbeitssek."+(q.Reason==null?"":" · "+q.Reason),12,40);Action(parent,game,"ForgeItem","Schmieden → +"+(item.forge+1),queue,v=>Industry.QueueForge(v,id),refresh);}
 }
}
