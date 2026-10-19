using System;
using System.Linq;
namespace IdleIntelligence.Core
{
 public static class RetentionRules
 {
  public static double AchievementValue(GameState s,string id)
  {
   var l=s.Lifetime;switch(id)
   {
    case "calculators":return l.calculatorsBought;case "hardware":return l.hardwareBought;case "classes":return l.hardwareClasses.Length;case "milestones":return l.milestones;case "prestiges":return l.prestiges;case "int":return l.intEarned;case "lab-time":return l.labSeconds;case "research":return l.researchCompleted;case "training":return l.trainingCompleted;case "crafting":return l.itemsCrafted;case "items":return l.itemTypes.Length;case "taps":return l.taps;case "components":return l.componentsEarned;case "credits":return l.regularCredits;case "data":return l.regularData;case "active":return l.activeSeconds;case "overclock":return l.overclocks;case "drops":return l.dropsClaimed;case "fusion":return l.itemsFused;case "forge":return l.forgeUpgrades;
    case "material-types":return l.discoveredComponents.Length;case "blueprints":return s.Workshop.learned.Count(v=>v);case "crafted-types":return s.Workshop.crafted.Count(v=>v>0);case "material-families":return s.Industry.families.Count(v=>v);case "foundry-network":return Industry.Infrastructure(s)+s.Workshop.inventory.Select(i=>i.forge).DefaultIfEmpty(0).Max();case "challenge-stages":return s.Challenges.Progress.stages.Sum();case "challenge-depth":return s.Challenges.Progress.stages.Max();
    case "named":return string.IsNullOrEmpty(s.Retention.aiName)?0:1;case "dual-lab":return PrestigeAutomation.ResearchJobs(s).Count()>=RetentionBalance.DualLabs?1:0;case "breakthrough":return s.Industry.breakthroughs.Length>0?1:0;case "rare":return s.Workshop.inventory.Any(i=>i.rarity>=2)?1:0;case "run-mix":return l.runMilestoneClasses.Length>=RetentionBalance.RunMix?1:0;case "combo":return Workshop.Combination(s,"compute-credit-link")>0||Workshop.Combination(s,"training-research-link")>0?1:0;case "experiment":return l.analysesCompleted>0?1:0;case "all-classes":return s.Industry.discovered.All(v=>v)?1:0;case "mastery":return s.Hardware.Any(n=>n>=RetentionBalance.MasteryOwned)?1:0;case "automation":return s.Prestige.hardwareAuto.Any(v=>v)?1:0;default:throw new ArgumentException("Unknown achievement");
   }
  }
  public static double AchievementFactor(GameState s)=>1+RetentionBalance.AchievementLogStrength*Math.Log(1+s.Retention.points/RetentionBalance.AchievementPointScale);
  public static bool AchievementReady(GameState s,string id,int tier)
  {var a=RetentionBalance.Achievements.FirstOrDefault(v=>v.Id==id);return !ChallengeRules.Active(s)&&a!=null&&tier>=0&&tier<a.Thresholds.Length&&AchievementValue(s,id)>=a.Thresholds[tier]&&!s.Retention.achievementClaims.Contains(id+":"+tier);}
  public static int CurrentTier(GameState s,AchievementDefinition a)
  {int i=0;while(i<a.Thresholds.Length&&s.Retention.achievementClaims.Contains(a.Id+":"+i))i++;return Math.Min(i,a.Thresholds.Length-1);}
  public static GameState Achievement(GameState state,string id,int tier)
  {
   if(!AchievementReady(state,id,tier))return state;var s=state.Copy();int reward=Math.Min(tier,RetentionBalance.TierGems.Length-1);string key=id+":"+tier;s.Retention.achievementClaims=s.Retention.achievementClaims.Concat(new[]{key}).ToArray();s.Retention.points+=(long)RetentionBalance.TierPoints[reward];Gems(s,(long)RetentionBalance.TierGems[reward],"achievement-"+key,"achievement");return s;
  }
  public static void Gems(GameState s,long amount,string id,string source)
  {s.Retention.gems+=amount;s.Retention.ledger=s.Retention.ledger.Concat(new[]{new GemEntry{id=id,source=source,at=s.SavedAt,amount=amount}}).ToArray();}
  public static bool StaticReady(GameState s,string id)
  {
   if(ChallengeRules.Active(s)||s.Retention.challengeClaims.Contains(id))return false;int index=Array.FindIndex(RetentionBalance.Challenges,c=>c.Id==id);if(index<0)return false;var values=RetentionBalance.ChallengeNumbers[index];double goal=values.Last();switch(id)
   {
    case "first-empire":return s.Hardware.Count(n=>n>=values[0])>=goal;case "master-network":case "mastery-100":return Enumerable.Range(0,s.Hardware.Length).Sum(n=>Lifetime.Mastery(s,n))>=goal;case "all-mastered":return Enumerable.Range(0,s.Hardware.Length).All(n=>Lifetime.Mastery(s,n)>=goal);case "prestige-25":case "prestige-100":return s.Lifetime.prestiges>=goal;case "research-500":return s.Lifetime.researchCompleted>=goal;case "components-100k":return s.Lifetime.componentsEarned>=goal;case "items-250":return s.Lifetime.itemsCrafted>=goal;case "achievement-500":return s.Retention.points>=goal;case "season-3":case "season-12":return s.Retention.completedSeasons.Length>=goal;default:return false;
   }
  }
  public static GameState StaticChallenge(GameState state,string id)
  {if(!StaticReady(state,id))return state;var s=state.Copy();s.Retention.challengeClaims=s.Retention.challengeClaims.Concat(new[]{id}).ToArray();s.Challenges.Progress.stars+=RetentionBalance.Challenges.First(c=>c.Id==id).Stars;return s;}
  public static void HardwareOnboarding(GameState s)
  {var ids=new[]{"first-buy"}.Concat(s.Hardware[0]>=RetentionBalance.IntroCalculatorCounts[1]?new[]{"ten-calculators"}:Array.Empty<string>()).Concat(s.Industry.discovered[1]?new[]{"discover-sbc"}:Array.Empty<string>()).Concat(s.Hardware[0]>=RetentionBalance.IntroCalculatorCounts[0]?new[]{"class-upgrade"}:Array.Empty<string>());s.Retention.onboardingCompleted=s.Retention.onboardingCompleted.Union(ids).ToArray();}
  public static GameState UpdateOnboarding(GameState s)
  {
   bool[] met={s.Lifetime.hardwareBought>0,s.Hardware[0]>=RetentionBalance.IntroCalculatorCounts[1],s.Industry.discovered[1],s.ModelLevel>=1,Game.Level(s,"dataGeneration")>=1,s.Workshop.equipped.Any(v=>!string.IsNullOrEmpty(v)),s.Hardware[0]>=RetentionBalance.IntroCalculatorCounts[0]||s.Workshop.milestones.Contains("calculator:"+RetentionBalance.IntroCalculatorCounts[0]),s.Prestige.resets>0};
   var completed=s.Retention.onboardingCompleted.Union(RetentionBalance.IntroIds.Where((id,n)=>met[n])).ToArray();if(completed.Length==s.Retention.onboardingCompleted.Length)return s;s=s.Copy();s.Retention.onboardingCompleted=completed;return s;
  }
  // Same createItem boundary for onboarding and later season/shop sources.
  public static GameState CreateItem(GameState state,string type,int rarity)
  {
   if(Workshop.Index(type)<0||rarity<0||rarity>=ItemBalance.RarityFactors.Length||state.Workshop.nextId<1||state.Workshop.nextId>=9007199254740991L||state.Workshop.inventory.Any(i=>i.id=="item-"+state.Workshop.nextId))return state;var s=state.Copy();var i=new ItemInstance{id="item-"+s.Workshop.nextId++,type=type,rarity=rarity,missingMaterialBasis=true};s.Workshop.inventory=s.Workshop.inventory.Concat(new[]{i}).ToArray();Lifetime.Item(s,type);s.Workshop.revision++;return s;
  }
  public static GameState Onboarding(GameState state,string id)
  {
   int n=Array.IndexOf(RetentionBalance.IntroIds,id);if(ChallengeRules.Active(state)||n<0||!state.Retention.onboardingCompleted.Contains(id)||state.Retention.onboardingClaimed.Contains(id))return state;var s=state.Copy();s.Retention.onboardingClaimed=s.Retention.onboardingClaimed.Concat(new[]{id}).ToArray();if(id=="first-research")return CreateItem(s,"quantum-chip",0);if(id=="equip-item"){long amount=(long)RetentionBalance.IntroComponentReward;s.Workshop.components[0]+=amount;Lifetime.Components(s,0,amount);}else if(RetentionBalance.IntroCredits[n]>0)s.Credits=s.Credits.Add(ScientificNumber.From(RetentionBalance.IntroCredits[n]));return s;
  }
  public static GameState SetName(GameState state,string input,bool ai=false)
  {if(ai&&!string.IsNullOrEmpty(state.Retention.aiName))return state;var name=NameRules.Validate(input,ai?NameBalance.AIMaximum:NameBalance.PlayerMaximum);if(!name.Ok||name.Name==(ai?state.Retention.aiName:state.Retention.playerName))return state;var s=state.Copy();if(ai)s.Retention.aiName=name.Name;else s.Retention.playerName=name.Name;return s;}
  public static GameState ReadMessage(GameState state,string id)
  {if(string.IsNullOrEmpty(id)||id.Length>200||state.Retention.readMessages.Contains(id))return state;var s=state.Copy();s.Retention.readMessages=s.Retention.readMessages.Concat(new[]{id}).ToArray();return s;}
  public static void Validate(GameState s)
  {
   var r=s.Retention;if(r==null||!r.initialized||r.schema!=1||r.namePolicy!=NameBalance.Version||r.gems<0||r.gems>9007199254740991L||r.points<0||r.points>9007199254740991L||r.playerName==null||!NameRules.Validate(r.playerName).Ok||r.aiName==null||r.aiName.Length>0&&!NameRules.Validate(r.aiName,NameBalance.AIMaximum).Ok)throw new FormatException("Invalid profile/wallet");
   foreach(var list in new[]{r.achievementClaims,r.challengeClaims,r.onboardingCompleted,r.onboardingClaimed,r.readMessages,r.completedSeasons,r.artifacts})if(list==null||list.Any(v=>v==null||v.Length>200)||list.Distinct().Count()!=list.Length)throw new FormatException("Invalid retention receipts");
   if(r.achievementClaims.Any(key=>!RetentionBalance.Achievements.Any(a=>Enumerable.Range(0,a.Thresholds.Length).Any(i=>key==a.Id+":"+i)))||r.challengeClaims.Any(id=>!RetentionBalance.Challenges.Any(c=>c.Id==id))||r.onboardingCompleted.Any(id=>!RetentionBalance.IntroIds.Contains(id))||r.onboardingClaimed.Any(id=>!r.onboardingCompleted.Contains(id)))throw new FormatException("Invalid reward claim IDs");
   if(r.inbox==null||r.inbox.Any(m=>m==null||string.IsNullOrEmpty(m.id)||m.id.Length>200||m.title==null||m.title.Length>1000||m.body==null||m.body.Length>20000||!ScientificNumber.Finite(m.at)||m.at<0)||r.inbox.Select(m=>m.id).Distinct().Count()!=r.inbox.Length||r.ledger==null||r.ledger.Any(e=>e==null||string.IsNullOrEmpty(e.id)||e.source==null||!ScientificNumber.Finite(e.at)||e.at<0||Math.Abs((double)e.amount)>9007199254740991d))throw new FormatException("Invalid inbox/gem ledger");
  }
 }
}
