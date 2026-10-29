using System;
using System.Linq;
namespace IdleIntelligence.Core
{
 [Serializable] public sealed class ForgeJob
 {
  public string key,itemId;public int rarity,level,forge,target;public double done,required,data;public double[] components;
  public ForgeJob Copy(){var j=(ForgeJob)MemberwiseClone();j.components=(double[])components.Clone();return j;}
 }
 [Serializable] public sealed class FoundryState
 {
  public int level;public bool hasActive;public ForgeJob active;public string[] queue=Array.Empty<string>();
  public FoundryState Copy()=>new FoundryState{level=level,hasActive=hasActive,active=active?.Copy(),queue=(string[])queue.Clone()};
 }
 [Serializable] public sealed class IndustryState
 {
  public int[] analysisQueue=Array.Empty<int>();public int lastAnalysisRecipe=-1;public long[] lastAnalysisAmounts=new long[ItemBalance.ComponentIds.Length];
  public bool firstAnalysisReward;public long legacyFoundryLevels;public int schema=1,trainingStarted;public long conversionRevision;public string[] breakthroughs=Array.Empty<string>();
  public bool[] discovered=new bool[Balance.Hardware.Length],families=new bool[5];public bool hasSynthesis;public FoundryState[] foundries=Array.Empty<FoundryState>();public Job synthesis;
  public IndustryState Copy(){var i=(IndustryState)MemberwiseClone();i.analysisQueue=(int[])analysisQueue.Clone();i.lastAnalysisAmounts=(long[])lastAnalysisAmounts.Clone();i.discovered=(bool[])discovered.Clone();i.families=(bool[])families.Clone();i.breakthroughs=(string[])breakthroughs.Clone();i.foundries=foundries.Select(f=>f.Copy()).ToArray();i.synthesis=synthesis?.Copy();return i;}
 }
 public sealed class ConversionTicket {public long revision,beforeResearch,beforeBlueprints,amount;}
 public static class Industry
 {
  public static long Infrastructure(GameState s)=>s.Industry.legacyFoundryLevels+(s.Industry.foundries.Length==0?0:s.Industry.foundries.Max(f=>f.level));
  public static bool Busy(GameState s,string id)=>s.Industry.foundries.Any(f=>f.active?.itemId==id||f.queue.Contains(id));
  public static double AnalysisCost(GameState s,double cost)=>Math.Ceiling(cost*(Game.Level(s,"dataPipeline")>0?Balance.Research[Game.ResearchIndex("dataPipeline")].Effect:1));
  public static ScientificNumber BreakthroughFactor(GameState s)=>ScientificNumber.From(IndustryBalance.BreakthroughBase).Pow(s.Industry.breakthroughs.Length).Pow(1+Math.Min(IndustryBalance.BreakthroughCap,s.Industry.breakthroughs.Length*IndustryBalance.BreakthroughPer));
  public static GameState BuyBreakthrough(GameState state,string id)
  {int n=Array.IndexOf(IndustryBalance.BreakthroughIds,id);if(n<0||state.Industry.breakthroughs.Contains(id)||state.Workshop.researchFragments<IndustryBalance.BreakthroughCosts[n])return state;var s=state.Copy();s.Workshop.researchFragments-=(long)IndustryBalance.BreakthroughCosts[n];s.Industry.breakthroughs=s.Industry.breakthroughs.Concat(new[]{id}).ToArray();s.Workshop.revision++;LocalJournal.Record(s,"breakthrough",permanent:false);return s;}
  public static ConversionTicket QuoteConversion(GameState s,long amount)=>amount<1||amount>9007199254740991L/IndustryBalance.ConversionRate||s.Workshop.fragments>9007199254740991L-amount||s.Industry.conversionRevision>=9007199254740991L||IndustryBalance.BreakthroughIds.Any(id=>!s.Industry.breakthroughs.Contains(id))||s.Workshop.researchFragments<amount*IndustryBalance.ConversionRate?null:new ConversionTicket{revision=s.Industry.conversionRevision,beforeResearch=s.Workshop.researchFragments,beforeBlueprints=s.Workshop.fragments,amount=amount};
  public static GameState Convert(GameState state,ConversionTicket t)
  {if(t==null||t.revision!=state.Industry.conversionRevision||t.beforeResearch!=state.Workshop.researchFragments||t.beforeBlueprints!=state.Workshop.fragments||QuoteConversion(state,t.amount)==null)return state;var s=state.Copy();s.Workshop.researchFragments-=(long)(t.amount*IndustryBalance.ConversionRate);s.Workshop.fragments+=t.amount;s.Industry.conversionRevision++;s.Workshop.revision++;LocalJournal.Record(s,"fragment-conversion",permanent:false);return s;}
  public static string SynthesisBlock(GameState s,int component)
  {if(component<0||component>=ItemBalance.ComponentIds.Length)return "Unbekannt";int f=MaterialAnalysis.Family(component);return !MaterialAnalysis.Access(s,f)?"Materialfamilie gesperrt":s.Workshop.hasAnalysis||s.Industry.synthesis!=null?"Analyseplatz belegt":s.Data.CompareTo(ScientificNumber.From(AnalysisCost(s,IndustryBalance.SynthesisCosts[f])))<0?"Zu wenig Daten":null;}
  public static GameState Synthesize(GameState state,int component)
  {var selected=MetaRules.Phase(state,2);if(SynthesisBlock(selected,component)!=null)return state;var s=selected.Copy();int f=MaterialAnalysis.Family(component);s.Data=s.Data.Subtract(ScientificNumber.From(AnalysisCost(s,IndustryBalance.SynthesisCosts[f])));s.Industry.hasSynthesis=true;s.Industry.synthesis=new Job{key="synthesis-"+s.Workshop.nextId,id=ItemBalance.ComponentIds[component],required=IndustryBalance.SynthesisWork[f]};s.Workshop.nextId++;s.Workshop.revision++;LocalJournal.Record(s,"synthesis-start",permanent:false);return s;}
  public static CraftQuote ForgeQuote(GameState s,string id,int station=0)
  {
   var i=s.Workshop.inventory.FirstOrDefault(v=>v.id==id);var costs=new double[ItemBalance.ComponentIds.Length];var q=new CraftQuote{Components=costs,Revision=s.Workshop.revision};
   if(i==null){q.Reason="Item fehlt";return q;}int target=i.forge+1;var d=Workshop.Definition(i);
   double baseCircuits=Math.Ceiling(IndustryBalance.ForgeComponentBase*Math.Pow(IndustryBalance.ForgeComponentGrowth,i.forge)*(1+i.rarity));costs[0]=baseCircuits;
   if(target>=IndustryBalance.ForgeFamilyFrom)costs[d.BaseMaterial]=target*IndustryBalance.ForgeBaseMaterialsPerLevel;
   if(target>=IndustryBalance.ForgeRareFrom)costs[d.RareMaterial]=Math.Ceiling(target/4d);
   q.Data=Math.Ceiling(IndustryBalance.ForgeDataBase*Math.Pow(IndustryBalance.ForgeDataGrowth,i.forge)*(1+i.rarity));
   q.Reason=station<0||station>0&&station>=s.Industry.foundries.Length?"Unbekannte Schmiede":i.locked||i.challengeCopy?"Geschützt":Busy(s,id)?"Item in Schmiede":target>IndustryBalance.ForgeItemLimit?"Maximallevel":s.Data.CompareTo(ScientificNumber.From(q.Data))<0?"Zu wenig Daten":(s.Workshop.components[0]<baseCircuits||Enumerable.Range(0,costs.Length).Any(c=>s.Workshop.components[c]<costs[c]))?"Komponenten fehlen":null;q.Allowed=q.Reason==null;return q;
  }
  public static double ForgeWork(GameState s,ItemInstance item,int station=0)
  {int level=s.Industry.foundries.Length>station?s.Industry.foundries[station].level:1;return Math.Max(IndustryBalance.ForgeMinimumSeconds,IndustryBalance.ForgeBaseSeconds*Math.Pow(IndustryBalance.ForgeDurationGrowth,item.forge)/(IndustryBalance.ForgeSpeeds[level-1]*(1+Math.Log(1+Workshop.Device(s,"recovery")))));}
  static GameState StartForge(GameState state,string id,int station)
  {var q=ForgeQuote(state,id,station);if(!q.Allowed||state.Industry.foundries[station].active!=null)return state;var s=state.Copy();var item=s.Workshop.inventory.First(i=>i.id==id);s.Data=s.Data.Subtract(ScientificNumber.From(q.Data));for(int c=0;c<q.Components.Length;c++)s.Workshop.components[c]-=(long)q.Components[c];s.Industry.foundries[station].hasActive=true;s.Industry.foundries[station].active=new ForgeJob{key="forge-"+s.Workshop.nextId,itemId=id,rarity=item.rarity,level=item.level,forge=item.forge,target=item.forge+1,required=ForgeWork(s,item,station),components=q.Components,data=q.Data};s.Workshop.nextId++;s.Workshop.revision++;LocalJournal.Record(s,"forge-start",permanent:false);return s;}
  public static GameState QueueForge(GameState state,string id)
  {var i=state.Workshop.inventory.FirstOrDefault(v=>v.id==id);if(i==null||i.locked||i.challengeCopy||Busy(state,id)||i.forge>=IndustryBalance.ForgeItemLimit)return state;var s=state;if(s.Industry.foundries.Length==0){s=s.Copy();s.Industry.foundries=new[]{new FoundryState{level=1}};return StartForge(s,id,0);}var f=s.Industry.foundries[0];if(f.queue.Length>=2)return state;if(f.active==null)return StartForge(s,id,0);s=s.Copy();s.Industry.foundries[0].queue=f.queue.Concat(new[]{id}).ToArray();s.Workshop.revision++;return s;}
  public static GameState RemoveQueued(GameState state,string id)
  {if(!state.Industry.foundries.Any(f=>f.queue.Contains(id)))return state;var s=state.Copy();foreach(var f in s.Industry.foundries)f.queue=f.queue.Where(v=>v!=id).ToArray();s.Workshop.revision++;return s;}
  public static string UpgradeBlock(GameState s)
  {int level=s.Industry.foundries.Length>0?s.Industry.foundries[0].level:0;return level>=IndustryBalance.FoundryMaxLevel?"Maximallevel":IndustryBalance.ForgeCosts[level].Where((v,c)=>v>s.Workshop.components[c]).Any()?"Komponenten fehlen":null;}
  public static GameState UpgradeFoundry(GameState state,int expectedLevel)
  {int level=state.Industry.foundries.Length>0?state.Industry.foundries[0].level:0;if(level!=expectedLevel||UpgradeBlock(state)!=null)return state;var s=state.Copy();for(int c=0;c<s.Workshop.components.Length;c++)s.Workshop.components[c]-=(long)IndustryBalance.ForgeCosts[level][c];if(level==0)s.Industry.foundries=new[]{new FoundryState()};s.Industry.foundries[0].level++;s.Workshop.revision++;LocalJournal.Record(s,"foundry-upgrade",permanent:false);return s;}
  public static double NextBoundary(GameState s)
  {double result=double.PositiveInfinity;if(s.Industry.synthesis!=null)result=(s.Industry.synthesis.required-s.Industry.synthesis.done)/MaterialAnalysis.Speed(s);foreach(var f in s.Industry.foundries)if(f.active!=null)result=Math.Min(result,(f.active.required-f.active.done)/MetaAutomation.Fabrication(s));return Math.Max(0,result);}
  public static void Work(GameState s,double seconds)
  {if(s.Industry.synthesis!=null)s.Industry.synthesis.done=Math.Min(s.Industry.synthesis.required,s.Industry.synthesis.done+seconds*MaterialAnalysis.Speed(s));foreach(var f in s.Industry.foundries)if(f.active!=null)f.active.done=Math.Min(f.active.required,f.active.done+seconds*MetaAutomation.Fabrication(s));}
  public static GameState Settle(GameState state)
  {
   var s=state;var syn=s.Industry.synthesis;if(syn!=null&&syn.done+1e-7>=syn.required){s=s.Copy();int component=Array.IndexOf(ItemBalance.ComponentIds,syn.id);s.Workshop.components[component]++;Lifetime.Components(s,component,1,"synthesis");s.Industry.synthesis=null;LocalJournal.Record(s,"synthesis-complete",syn.id);s.Industry.hasSynthesis=false;s.Workshop.revision++;}
   for(int n=0;n<s.Industry.foundries.Length;n++){var f=s.Industry.foundries[n];var j=f.active;if(j!=null&&j.done+1e-7>=j.required){var item=s.Workshop.inventory.FirstOrDefault(i=>i.id==j.itemId);if(item==null||item.rarity!=j.rarity||item.level!=j.level||item.forge!=j.forge)continue;s=s.Copy();f=s.Industry.foundries[n];item=s.Workshop.inventory.First(i=>i.id==j.itemId);if(item.missingMaterialBasis){item.materialBasis[0]=IndustryBalance.LegacyItemRecovery[item.rarity];item.missingMaterialBasis=false;}item.forge=j.target;s.Lifetime.forgeUpgrades++;LocalJournal.Record(s,"forge-complete",item.id);for(int c=0;c<j.components.Length;c++)item.materialBasis[c]+=j.components[c];f.active=null;f.hasActive=false;s.Workshop.revision++;}if(f.active==null&&f.queue.Length>0){var candidate=s.Copy();candidate.Industry.foundries[n].queue=f.queue.Skip(1).ToArray();var next=StartForge(candidate,f.queue[0],n);if(!ReferenceEquals(next,candidate))s=next;}}
   if(s.Industry.foundries.Length>1){s=s.Copy();s.Industry.foundries[0].level=s.Industry.foundries.Max(f=>f.level);int count=s.Industry.foundries.Length;while(count>1&&s.Industry.foundries[count-1].active==null&&s.Industry.foundries[count-1].queue.Length==0)count--;Array.Resize(ref s.Industry.foundries,count);}
   return s;
  }
  public static void Validate(GameState s)
  {var i=s.Industry;if(i==null||i.lastAnalysisRecipe< -1||i.lastAnalysisRecipe>=ItemBalance.Analyses.Length||i.lastAnalysisAmounts==null||i.lastAnalysisAmounts.Length!=ItemBalance.ComponentIds.Length||i.lastAnalysisAmounts.Any(n=>n<0)||i.analysisQueue==null||i.analysisQueue.Length>IndustryBalance.AnalysisQueueCapacity||i.analysisQueue.Any(n=>n<0||n>=ItemBalance.Analyses.Length)||i.schema!=1||i.legacyFoundryLevels<0||i.legacyFoundryLevels>9007199254740991L-IndustryBalance.FoundryMaxLevel||i.trainingStarted<0||i.conversionRevision<0||i.conversionRevision>9007199254740991L||i.breakthroughs==null||i.breakthroughs.Any(id=>!IndustryBalance.BreakthroughIds.Contains(id))||i.breakthroughs.Distinct().Count()!=i.breakthroughs.Length||i.foundries==null||i.discovered==null||i.discovered.Length!=Balance.Hardware.Length||i.families==null||i.families.Length!=5)throw new FormatException("Invalid industry");if(i.synthesis!=null&&(Array.IndexOf(ItemBalance.ComponentIds,i.synthesis.id)<0||i.synthesis.required<=0||!ScientificNumber.Finite(i.synthesis.required)||!ScientificNumber.Finite(i.synthesis.done)||i.synthesis.done<0||i.synthesis.done>i.synthesis.required+1e-6||s.Workshop.hasAnalysis))throw new FormatException("Invalid synthesis");foreach(var f in i.foundries){if(f==null||f.level<1||f.level>IndustryBalance.FoundryMaxLevel||f.queue==null||f.queue.Length>2||f.queue.Distinct().Count()!=f.queue.Length||f.queue.Any(id=>!s.Workshop.inventory.Any(item=>item.id==id)))throw new FormatException("Invalid foundry");var j=f.active;if(j!=null&&(j.components==null||j.components.Length!=ItemBalance.ComponentIds.Length||j.components.Any(v=>v<0||!ScientificNumber.Finite(v))||j.target!=j.forge+1||j.target>IndustryBalance.ForgeItemLimit||!s.Workshop.inventory.Any(item=>item.id==j.itemId)||!ScientificNumber.Finite(j.required)||j.required<=0||!ScientificNumber.Finite(j.done)||j.done<0||j.done>j.required+1e-6))throw new FormatException("Invalid forge job");}}
 }
}
