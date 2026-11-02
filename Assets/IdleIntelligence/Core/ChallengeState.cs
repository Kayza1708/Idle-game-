using System;
using System.Linq;
namespace IdleIntelligence.Core
{
 public sealed class ChallengeGoal
 {public readonly string Id;public readonly ScientificNumber Target;public ChallengeGoal(string id,NumberData target){Id=id;Target=ScientificNumber.FromData(target);}}
 public sealed class ChallengeDefinition
 {
  public readonly ScientificNumber MinimumINT;public readonly string Id,EntryHardware,Rules;public readonly int Stage,Chapter,Stars,Areas,ClassLimit,Labs,NetworkLimit,Links;public readonly double DataFactor,PriceFactor;public readonly bool Alternate;public readonly ChallengeGoal[] Goals;
  public ChallengeDefinition(string id,int stage,int chapter,int stars,string entry,int areas,int classes,int labs,int networks,int links,double data,double price,bool alternate,NumberData minimumINT,string rules,ChallengeGoal[] goals){MinimumINT=ScientificNumber.FromData(minimumINT);Id=id;Stage=stage;Chapter=chapter;Stars=stars;EntryHardware=entry;Areas=areas;ClassLimit=classes;Labs=labs;NetworkLimit=networks;Links=links;DataFactor=data;PriceFactor=price;Alternate=alternate;Rules=rules;Goals=goals;}
 }
 [Serializable] public sealed class ChallengeProgress
 {
  public int schema=1,stars;public int[] stages=new int[10];public long[] completions=new long[10];public double[] bestSeconds=Enumerable.Repeat(-1d,10).ToArray();public string[] unlocks=Array.Empty<string>();
  public string lastReturnId="";public bool lastSuccess;
  public ChallengeProgress Copy(){var p=(ChallengeProgress)MemberwiseClone();p.stages=(int[])stages.Clone();p.completions=(long[])completions.Clone();p.bestSeconds=(double[])bestSeconds.Clone();p.unlocks=(string[])unlocks.Clone();return p;}
 }
 [Serializable] public sealed class ChallengeMetrics
 {
  public NumberData credits=ScientificNumber.Zero.ToData(),data=ScientificNumber.Zero.ToData(),minimumINT=ScientificNumber.Zero.ToData(),researchData=ScientificNumber.Zero.ToData();public long prestiges,hardwarePurchases,milestones,training,research,quality,efficiency;public int craftRarity;public string[] researchAreas=Array.Empty<string>(),craftedIds=Array.Empty<string>(),craftedTypes=Array.Empty<string>();
  public ChallengeMetrics Copy(){var m=(ChallengeMetrics)MemberwiseClone();m.credits=ScientificNumber.FromData(credits).ToData();m.data=ScientificNumber.FromData(data).ToData();m.minimumINT=ScientificNumber.FromData(minimumINT).ToData();m.researchData=ScientificNumber.FromData(researchData).ToData();m.researchAreas=(string[])researchAreas.Clone();m.craftedIds=(string[])craftedIds.Clone();m.craftedTypes=(string[])craftedTypes.Clone();return m;}
 }
 [Serializable] public sealed class ChallengeRun
 {
  public string id,runId;public int stage=1,catalogVersion=2;public double startedAt;public ItemInstance[] loadout=Array.Empty<ItemInstance>();public string[] networkLinks=Array.Empty<string>();public ChallengeMetrics metrics=new ChallengeMetrics();
  public ChallengeRun Copy(){var r=(ChallengeRun)MemberwiseClone();r.loadout=loadout.Select(i=>i.Copy()).ToArray();r.networkLinks=(string[])networkLinks.Clone();r.metrics=metrics.Copy();return r;}
 }
 public sealed class ChallengeState
 {
  public ChallengeProgress Progress=new ChallengeProgress();public ChallengeRun Run;public GameState Main;
  public ChallengeState Copy()=>new ChallengeState{Progress=Progress.Copy(),Run=Run?.Copy(),Main=Main?.Copy()};
 }
}
