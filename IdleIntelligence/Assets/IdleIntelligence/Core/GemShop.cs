using System;
using System.Linq;
using System.Globalization;
namespace IdleIntelligence.Core
{
 public sealed class GemDefinition{public readonly string Id,Section,Name,English,Effect,EnglishEffect;public GemDefinition(string id,string section,string name,string english,string effect,string englishEffect){Id=id;Section=section;Name=name;English=english;Effect=effect;EnglishEffect=englishEffect;}}
 [Serializable]public sealed class UpgradeState
 {public int schema=1,purchasedLabs;public bool initialized;public double offlineSeconds,labBoostUntil;public string[] processed=Array.Empty<string>();public static UpgradeState New()=>new UpgradeState{initialized=true,offlineSeconds=Balance.OfflineSeconds};public UpgradeState Copy(){var u=(UpgradeState)MemberwiseClone();u.processed=(string[])processed.Clone();return u;}}
 public sealed class GemQuote{public long Cost;public bool Enabled,Owned;public string Reason;public double Remaining,Applied;public bool HasTime;}
 public static class GemShop
 {
  const long Max=9007199254740991L;
  static int Family(string id)=>id.StartsWith("material-family-",StringComparison.Ordinal)?Array.IndexOf(MissionBalance.FamilyIds,id.Substring(16)):-1;
  static int Offline(string id)=>Array.FindIndex(GemBalance.OfflineHours,h=>id=="offline-"+h);
  public static GemQuote Quote(GameState s,string id)
  {
   var q=new GemQuote{Enabled=true};int family=Family(id),offline=Offline(id);if(family>=0){q.Cost=(long)GemBalance.FamilyCosts[family];if(!MaterialAnalysis.Access(s,family)){q.Enabled=false;q.Reason="locked-materials";}}
   else if(id=="lab-slot-1"||id=="lab-slot-2"){int index=id=="lab-slot-1"?0:1;q.Cost=(long)GemBalance.LabCosts[index];q.Owned=s.Upgrades.purchasedLabs>index;if(q.Owned){q.Enabled=false;q.Reason="owned";}else if(!PrestigeRules.Has(s,"F01")){q.Enabled=false;q.Reason="prestige-lab";}else if(s.Upgrades.purchasedLabs!=index){q.Enabled=false;q.Reason="previous";}}
   else if(offline>=0){double hours=GemBalance.OfflineHours[offline];q.Cost=(long)GemBalance.OfflineCosts[offline];q.Owned=s.Upgrades.offlineSeconds>=hours*3600;if(q.Owned){q.Enabled=false;q.Reason="owned";}else if(s.Upgrades.offlineSeconds<(offline==0?Balance.OfflineSeconds:GemBalance.OfflineHours[offline-1]*3600)){q.Enabled=false;q.Reason="previous";}}
   else if(id=="craft-30m"||id=="craft-4h"||id=="training-15m"||id=="training-1h"){bool craft=id.StartsWith("craft-",StringComparison.Ordinal);int index=id=="craft-30m"||id=="training-15m"?0:1;var seconds=craft?GemBalance.CraftSeconds:GemBalance.TrainingSeconds;var costs=craft?GemBalance.CraftCosts:GemBalance.TrainingCosts;var job=craft?(s.Workshop.hasModuleJob?s.Workshop.moduleJob:null):s.Training;double speed=craft?MetaAutomation.Fabrication(s):Game.WorkSpeed(s);q.HasTime=true;q.Remaining=job==null?0:Math.Max(0,job.required-job.done)/Math.Max(speed,1e-12);q.Applied=Math.Min(seconds[index],q.Remaining);q.Cost=(long)Math.Ceiling(costs[index]*q.Applied/seconds[index]);if(job==null||q.Remaining<=0){q.Enabled=false;q.Reason=craft?"no-crafting":"no-training";}}
   else if(id=="materials-circuits")q.Cost=(long)GemBalance.CircuitPack[0];else if(id=="materials-advanced"){q.Cost=(long)GemBalance.AdvancedPack[0];if(!s.Industry.discovered[2]){q.Enabled=false;q.Reason="locked-materials";}}
   else if(id=="lab-boost"){q.Cost=(long)GemBalance.LabBoostCost;if(Math.Max(0,s.Upgrades.labBoostUntil-s.SavedAt)>=GemBalance.BoostCap*1000){q.Enabled=false;q.Reason="cap";}}
   if(id!="components"&&id!="training-boost"&&!GemBalance.Offers.Any(o=>o.Id==id)){q.Enabled=false;q.Reason="unknown";}if(q.Enabled&&s.Retention.gems<q.Cost){q.Enabled=false;q.Reason="gems";}if(ChallengeRules.Active(s)){q.Enabled=false;q.Reason="challenge";}return q;
  }
  static string At(double at)=>Math.Truncate(at)==at?((long)at).ToString(CultureInfo.InvariantCulture):at.ToString("R",CultureInfo.InvariantCulture);
  public static GameState Buy(GameState state,string id,double? when=null)
  {
   if(id=="training-boost")return state;if(id=="components")id="materials-circuits";var q=Quote(state,id);double now=when??state.SavedAt;string purchase=id+":"+At(now);if(!q.Enabled||q.Cost<=0||state.Retention.gems<q.Cost||state.Upgrades.processed.Contains(purchase))return state;var s=state.Copy();int family=Family(id),offline=Offline(id);
   if(family>=0)MissionRules.Package(s,family);
   else if(id=="lab-slot-1"||id=="lab-slot-2")s.Upgrades.purchasedLabs++;
   else if(offline>=0)s.Upgrades.offlineSeconds=Math.Max(s.Upgrades.offlineSeconds,GemBalance.OfflineHours[offline]*3600);
   else if(id.StartsWith("craft-",StringComparison.Ordinal)){var j=s.Workshop.moduleJob;if(!s.Workshop.hasModuleJob||j==null)return state;j.done=Math.Min(j.required,j.done+q.Applied*MetaAutomation.Fabrication(s));s=FinishModule(s);}
   else if(id.StartsWith("training-",StringComparison.Ordinal)){var j=s.Training;if(j==null)return state;double work=Math.Min(j.required-j.done,q.Applied*Game.WorkSpeed(s));j.done+=work;if(j.done+1e-7>=j.required){FinishTraining(s);s=StartQueued(s);}}
   else if(id=="materials-circuits"){s.Workshop.components[0]+=(long)GemBalance.CircuitPack[1];Lifetime.Components(s,0,(long)GemBalance.CircuitPack[1]);}
   else if(id=="materials-advanced"){s.Workshop.components[1]+=(long)GemBalance.AdvancedPack[1];Lifetime.Components(s,1,(long)GemBalance.AdvancedPack[1]);s.Workshop.components[2]+=(long)GemBalance.AdvancedPack[2];Lifetime.Components(s,2,(long)GemBalance.AdvancedPack[2]);}
   else s.Upgrades.labBoostUntil=now+Math.Min(GemBalance.BoostCap*1000,Math.Max(0,s.Upgrades.labBoostUntil-now)+GemBalance.LabBoostSeconds*1000);
   s.Upgrades.processed=s.Upgrades.processed.Concat(new[]{purchase}).ToArray();RetentionRules.Gems(s,-q.Cost,purchase,id);s.Retention.ledger[s.Retention.ledger.Length-1].at=now;s.Workshop.revision++;LocalJournal.Record(s,"gem-purchase",id);return s;
  }
  public static void FinishTraining(GameState s,bool regular=false)
  {var j=s.Training;if(j==null)return;ItemSystemV3.CompleteTraining(s,regular);ItemSystemV3.FinishGradientTraining(s,j);s.ModelLevel++;s.Lifetime.trainingCompleted++;if(j.id=="quality"){s.Quality++;s.Workshop.qualityCompletions++;}else if(j.id=="efficiency"){s.Efficiency++;s.Workshop.efficiencyCompletions++;}else s.Workshop.integration++;if(ChallengeRules.Active(s)){s.Challenges.Run.metrics.training++;if(j.id=="quality")s.Challenges.Run.metrics.quality++;if(j.id=="efficiency")s.Challenges.Run.metrics.efficiency++;}s.Training=null;LocalJournal.Record(s,"training-complete",ItemSystemV3.Enabled(s)&&!string.IsNullOrEmpty(j.key)?j.key:j.id,duration:j.startRecorded?(s.SavedAt-j.startedAt)/1000:-1);}
  static GameState StartQueued(GameState s)
  {if(s.Training!=null||s.Prestige.trainingQueue.Length==0)return s;int[] counts=new int[3];var queue=s.Prestige.trainingQueue.Where(j=>j.level>Game.TrainingLevel(s,j.track)).Select(j=>{int n=Array.IndexOf(PrestigeAutomation.Tracks,j.track);return new TrainingTarget{track=j.track,level=Game.TrainingLevel(s,j.track)+counts[n]++ +1};}).Where(j=>j.track!="integration"||j.level<=MetaRules.IntegrationLimit(s)).ToArray();s.Prestige.trainingQueue=queue;if(queue.Length==0)return s;var next=Game.Train(s,queue[0].track);if(!ReferenceEquals(next,s))next.Prestige.trainingQueue=next.Prestige.trainingQueue.Skip(1).ToArray();return next;}
  public static GameState FinishModule(GameState s)
  {if(s.Workshop.hasModuleJob&&s.Workshop.moduleJob.done+1e-7>=s.Workshop.moduleJob.required){s.Workshop.modules[Array.FindIndex(ItemBalance.Modules,m=>m.Id==s.Workshop.moduleJob.id)]++;LocalJournal.Record(s,"crafting_completed",s.Workshop.moduleJob.id);s.Workshop.hasModuleJob=false;s.Workshop.moduleJob=null;s.Workshop.revision++;if(s.Prestige.moduleQueue.Length>0){s.Workshop.hasModuleJob=true;s.Workshop.moduleJob=s.Prestige.moduleQueue[0].Copy();LocalJournal.Record(s,"crafting_started",s.Workshop.moduleJob.id);s.Prestige.moduleQueue=s.Prestige.moduleQueue.Skip(1).ToArray();}}return s;}
  public static void Validate(GameState s)
  {var u=s.Upgrades;if(u==null||!u.initialized||u.schema!=1||u.purchasedLabs<0||u.purchasedLabs>GemBalance.LabCosts.Length||!ScientificNumber.Finite(u.offlineSeconds)||u.offlineSeconds<Balance.OfflineSeconds||u.offlineSeconds>Balance.MaxOfflineSeconds||!ScientificNumber.Finite(u.labBoostUntil)||u.labBoostUntil<0||u.labBoostUntil>8.64e15||u.processed==null||u.processed.Any(id=>string.IsNullOrEmpty(id)||id.Length>200)||u.processed.Distinct().Count()!=u.processed.Length)throw new FormatException("Invalid Gem upgrades");}
 }
}
