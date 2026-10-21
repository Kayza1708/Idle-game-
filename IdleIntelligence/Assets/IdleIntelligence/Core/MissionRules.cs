using System;
using System.Linq;
using System.Collections.Generic;
using System.Globalization;
using System.Reflection;
namespace IdleIntelligence.Core
{
 public static class MissionRules
 {
  public static readonly string[] Kinds={"daily","weekly","monthly"};
  static readonly Dictionary<string,FieldInfo> Metrics=typeof(LifetimeState).GetFields().Where(f=>f.FieldType==typeof(double)&&f.Name!="since").ToDictionary(f=>f.Name);
  public static double Metric(GameState s,string metric)=>Metrics.TryGetValue(metric,out var field)?(double)field.GetValue(s.Lifetime):throw new ArgumentException("Unknown mission metric");
  public static double Objective(GameState s,string objective)=>objective=="blueprints"?s.Workshop.learned.Count(v=>v):objective=="hardware-class"?s.Lifetime.hardwareClasses.Length:objective=="foundries"?Industry.Infrastructure(s):s.Challenges.Progress.stages.Sum();
  public static double Value(GameState s,MissionTask task)=>task.objective=="hardware-class"?(s.Lifetime.hardwareClasses.Contains(task.targetHardware)?1:0):!string.IsNullOrEmpty(task.objective)?Objective(s,task.objective):Metric(s,task.metric);
  public static double Progress(GameState s,MissionTask task)=>Math.Min(task.goal,Math.Max(0,Value(s,task)-task.baseline));
  public static bool Complete(GameState s,MissionTask task)=>Value(s,task)-task.baseline>=task.goal;
  public static int Band(GameState s,int kind)=>Math.Max((int)MissionBalance.MinimumBands[kind],Math.Min(MissionBalance.BandMultipliers.Length-1,MissionBalance.BandClasses.Count(n=>s.Lifetime.hardwareClasses.Length>=n)+(int)MissionBalance.FutureBandOffsets[kind]));
  static bool Available(GameState s,string id)
  {
   switch(id){case "hardware":case "milestones":case "train-done":case "taps":case "overclock":case "active":return true;case "research-done":case "drops":return s.Industry.discovered[1];case "components":return s.Prestige.resets>0||s.Industry.firstAnalysisReward;case "craft":return s.Lifetime.itemsCrafted>0;case "fusion":case "prestige":case "foundries":return false;case "forge":return s.Industry.foundries.Length>0&&s.Lifetime.forgeUpgrades>0;case "credits":return s.Lifetime.regularCredits<LifetimeBalance.Maximum;case "data":return s.Lifetime.regularData<LifetimeBalance.Maximum;case "blueprints":return Game.Level(s,"blueprints")>0&&ItemBalance.Items.Where((d,n)=>d.BlueprintPrice>0&&!s.Workshop.learned[n]&&Workshop.Prerequisite(s,n)).Any();case "challenges":int total=s.Challenges.Progress.stages.Sum();return total>0&&total<ChallengeBalance.Stages.Length;default:return false;}
  }
  static double Goal(GameState s,MissionTemplate t,int kind,int stage)
  {
   if(t.Objective=="hardware-class")return 1;
   if(!string.IsNullOrEmpty(t.Objective)){double remaining=t.Objective=="blueprints"?MissionBalance.PricedRecipes-Objective(s,t.Objective):t.Objective=="foundries"?IndustryBalance.FoundryMaxLevel+s.Industry.legacyFoundryLevels-Objective(s,t.Objective):ChallengeBalance.Stages.Length-Objective(s,t.Objective);return Math.Min(remaining,t.Base[kind]);}
   bool scalable=new[]{"hardwareBought","milestones","trainingCompleted","researchCompleted","itemsCrafted","componentsEarned","regularCredits","regularData"}.Contains(t.Metric);
   double goal=t.Base[kind]*(scalable?MissionBalance.BandMultipliers[Band(s,kind)]:1)*Math.Pow(MissionBalance.RepeatMultiplier,stage);
   if(t.Metric=="regularCredits"||t.Metric=="regularData"){var permanent=s.Copy();permanent.ActiveUntil=0;var rate=t.Metric=="regularCredits"?Game.Income(permanent,false):Game.DataRate(permanent);goal=Math.Max(goal,rate.Times(MissionBalance.ProductionSeconds[kind]).ToDouble(LifetimeBalance.Maximum));}
   return Math.Min(LifetimeBalance.Maximum-Metric(s,t.Metric),Math.Ceiling(goal));
  }
  static MissionPeriod Make(GameState s,int kind,double now)
  {
   int count=(int)MissionBalance.Counts[kind];string key=MissionCalendar.Key(now,kind);var available=MissionBalance.Templates.Where(t=>Available(s,t.Id)).ToList();
   if(kind>0){int unseen=0;for(int i=1;i<Balance.Hardware.Length;i++)if(!s.Lifetime.hardwareClasses.Contains(Balance.Hardware[i].Id)){unseen++;if(unseen%(int)MissionBalance.FrontierStrides[kind]==0)available.Add(new MissionTemplate("hardware-frontier-"+Balance.Hardware[i].Id,"hardwareBought","hardware-class","Neue Hardwareklasse erschließen · "+MissionBalance.FrontierNames[i],"Discover a new hardware class · "+MissionBalance.FrontierEnglish[i],new[]{1d,1,1}));}}
   int seed=key.Sum(c=>(int)c),rotation=seed%available.Count;var rotated=available.Skip(rotation).Concat(available.Take(rotation));var pool=available.Where(t=>t.Id=="hardware"||t.Id=="credits").Concat(rotated.Where(t=>t.Id!="hardware"&&t.Id!="credits")).ToArray();
   var tasks=new List<MissionTask>();var uses=new Dictionary<string,int>();var allocated=new Dictionary<string,double>();int cursor=0;
   while(tasks.Count<count&&cursor<count*pool.Length)
   {
    var t=pool[cursor++%pool.Length];int stage=uses.TryGetValue(t.Id,out int old)?old:0;if((t.Metric=="regularCredits"||t.Metric=="regularData")&&stage>=MissionBalance.ProductionTasksPerMetric)continue;
    if(!string.IsNullOrEmpty(t.Objective)&&(stage>0||tasks.Count(v=>!string.IsNullOrEmpty(v.objective))>=count-MissionBalance.Required[kind]))continue;
    string hardware=t.Objective=="hardware-class"?t.Id.Substring("hardware-frontier-".Length):"";
    var basis=new MissionTask{metric=t.Metric,objective=t.Objective,targetHardware=hardware};double original=Value(s,basis),offset=kind==0||!string.IsNullOrEmpty(t.Objective)?0:allocated.TryGetValue(t.Metric,out double amount)?amount:0,baseline=original+offset,goal=Math.Min(Goal(s,t,kind,stage),LifetimeBalance.Maximum-baseline);if(goal<=0)continue;
    uses[t.Id]=stage+1;if(string.IsNullOrEmpty(t.Objective))allocated[t.Metric]=offset+goal;
    tasks.Add(new MissionTask{id=key+"-"+t.Id+"-"+tasks.Count,metric=t.Metric,objective=t.Objective,targetHardware=hardware,goal=goal,baseline=baseline,reward=(long)MissionBalance.TaskGems[kind],hasRewardTier=true,rewardTier=1,de=t.Name+(stage>0?" · Stufe "+(stage+1):""),en=t.English+(stage>0?" · Tier "+(stage+1):"")});
   }
   return new MissionPeriod{key=key,endsAt=MissionCalendar.End(now,kind),tasks=tasks.ToArray(),required=Math.Min((int)MissionBalance.Required[kind],tasks.Count),bonus=tasks.Count>0?(long)MissionBalance.BonusGems[kind]:0};
  }
  public static int SeasonLevel(GameState s)=>Math.Min((int)MissionBalance.SeasonLevels,(int)Math.Min(int.MaxValue,Math.Floor(s.Missions.season.xp/MissionBalance.XPPerLevel)));
  static void RollSeason(GameState s,double now)
  {
   var m=s.Missions;var season=m.season;if(now<season.endsAt){if(m.hasPrevious&&now>m.previous.claimUntil){m.hasPrevious=false;m.previous=null;}return;}
   if(SeasonLevel(s)>=MissionBalance.SeasonLevels)s.Retention.completedSeasons=s.Retention.completedSeasons.Union(new[]{season.id}).ToArray();double duration=MissionBalance.SeasonDays*86400000,elapsed=Math.Max(1,Math.Floor((now-season.startedAt)/duration));long number=Math.Max(2,long.Parse(season.id.Split('-')[1],CultureInfo.InvariantCulture)+(long)elapsed);var previous=season.Copy();previous.claimUntil=season.endsAt+MissionBalance.GraceDays*86400000;m.hasPrevious=now<=previous.claimUntil;m.previous=m.hasPrevious?previous:null;m.season=new SeasonProgress{hasClock=true,id="season-"+number.ToString("D2",CultureInfo.InvariantCulture),startedAt=season.endsAt+(elapsed-1)*duration,endsAt=season.endsAt+elapsed*duration};
  }
  public static GameState Roll(GameState state,double now)
  {
   if(ChallengeRules.Active(state)||state.Missions.startPending)return state;var s=state.Copy();RollSeason(s,now);
   for(int kind=0;kind<3;kind++){var p=s.Missions.Period(kind);string key=MissionCalendar.Key(now,kind);if(p.tasks.Length==0)p=Make(s,kind,now);else if(p.key!=key){long taskGems=p.tasks.Where(t=>Complete(s,t)&&!t.claimed).Sum(t=>t.reward),bonus=p.tasks.Count(t=>Complete(s,t))>=p.required&&!p.bonusClaimed?p.bonus:0,total=taskGems+bonus;if(total>0)RetentionRules.Gems(s,total,"mission-expiry-"+Kinds[kind]+"-"+p.key,"mission-"+Kinds[kind]+"-expiry");p=Make(s,kind,now);}s.Missions.Set(kind,p);}return s;
  }
  public static GameState InitializeAfterMigration(GameState state,double now)
  {if(!state.Missions.startPending||ChallengeRules.Active(state))return state;var s=state.Copy();string campaign=s.Missions.campaign;s.Missions=MissionState.New(now);s.Missions.campaign=campaign;return Roll(s,now);}
  static int Family(GameState s){foreach(string id in MissionBalance.FamilyPriority){int n=Array.IndexOf(MissionBalance.FamilyIds,id);if(s.Industry.families[n])return n;}return-1;}
  public static void Package(GameState s,int family)
  {if(!MaterialAnalysis.Access(s,family))return;foreach(string id in ItemBalance.MaterialFamilies[family]){int c=Array.IndexOf(ItemBalance.ComponentIds,id);long amount=(long)MissionBalance.PackageAmounts[family];s.Workshop.components[c]+=amount;Lifetime.Components(s,c,amount);}}
  public static GameState Claim(GameState state,int kind,string id)
  {
   if(kind<0||kind>2||ChallengeRules.Active(state))return state;var period=state.Missions.Period(kind);int index=Array.FindIndex(period.tasks,t=>t.id==id);if(index<0||period.tasks[index].claimed||!Complete(state,period.tasks[index]))return state;var s=state.Copy();var task=s.Missions.Period(kind).tasks[index];task.claimed=true;RetentionRules.Gems(s,task.reward,"mission-"+Kinds[kind]+"-"+id,"mission-"+Kinds[kind]);int tier=task.hasRewardTier?task.rewardTier:Math.Max(1,index/14+1);if(tier>0){s.Missions.season.xp+=MissionBalance.QuestXP[kind]*tier;LocalJournal.Record(s,"season-xp");}int family=Family(s);if(family>=0)Package(s,family);LocalJournal.Record(s,"mission-claim",permanent:false);return s;
  }
  public static GameState Bonus(GameState state,int kind)
  {
   if(kind<0||kind>2||ChallengeRules.Active(state))return state;var p=state.Missions.Period(kind);if(p.tasks.Length==0||p.required<=0||p.bonusClaimed||p.tasks.Count(t=>Complete(state,t))<p.required)return state;var s=state.Copy();p=s.Missions.Period(kind);p.bonusClaimed=true;RetentionRules.Gems(s,p.bonus,"mission-bonus-"+Kinds[kind]+"-"+p.key,"mission-"+Kinds[kind]+"-bonus");s.Missions.season.xp+=MissionBalance.QuestXP[kind]*2;LocalJournal.Record(s,"season-xp");int family=Family(s);if(kind==0){s=BonusBoxes.EarnDaily(s);if(family>=0&&s.Missions.boxes.earned==state.Missions.boxes.earned)return state;}else if(family>=0)Package(s,family);LocalJournal.Record(s,"mission-claim",permanent:false);return s;
  }
  public static void Validate(GameState s)
  {
   var m=s.Missions;if(m==null||!m.initialized||m.schema!=1||m.campaign==null||m.campaign.Length>200||m.legacyMailbox==null||m.legacyMailbox.Any(v=>v==null||v.id==null||v.gems<0||v.gems>9007199254740991L))throw new FormatException("Invalid missions");
   for(int kind=0;kind<3;kind++){var p=m.Period(kind);if(p==null||p.key==null||p.key.Length>64||!ScientificNumber.Finite(p.endsAt)||p.endsAt<0||p.tasks==null||p.tasks.Length>200||p.required<0||p.required>p.tasks.Length||p.bonus<0||p.bonus>9007199254740991L||p.tasks.Select(t=>t?.id).Distinct().Count()!=p.tasks.Length)throw new FormatException("Invalid mission period");foreach(var t in p.tasks){if(t==null||string.IsNullOrEmpty(t.id)||t.id.Length>200||!Metrics.ContainsKey(t.metric)||!new[]{"","blueprints","hardware-class","foundries","challenges"}.Contains(t.objective)||t.objective=="hardware-class"&&!Balance.Hardware.Any(h=>h.Id==t.targetHardware)||!ScientificNumber.Finite(t.goal)||t.goal<=0||t.goal>LifetimeBalance.Maximum||!ScientificNumber.Finite(t.baseline)||t.baseline<0||t.baseline>LifetimeBalance.Maximum||t.reward<0||t.reward>9007199254740991L||t.rewardTier<0||t.de==null||t.en==null)throw new FormatException("Invalid mission task");}}
   if(m.season==null||m.startPending&&(m.season.hasClock||m.season.xp!=0||m.daily.tasks.Length+m.weekly.tasks.Length+m.monthly.tasks.Length>0)||!m.startPending&&!m.season.hasClock)throw new FormatException("Invalid mission initialization");
   foreach(var season in m.hasPrevious?new[]{m.season,m.previous}:new[]{m.season})if(season==null||season.id==null||!System.Text.RegularExpressions.Regex.IsMatch(season.id,"^season-[0-9]{2,}$")||!ScientificNumber.Finite(season.startedAt)||season.startedAt<0||!ScientificNumber.Finite(season.endsAt)||season.endsAt<season.startedAt||!ScientificNumber.Finite(season.xp)||season.xp<0||season.claimed==null||season.premiumClaimed==null||new[]{season.claimed,season.premiumClaimed}.Any(list=>list.Any(n=>n<1||n>MissionBalance.SeasonLevels)||list.Distinct().Count()!=list.Length))throw new FormatException("Invalid season progress");BonusBoxes.Validate(s);
  }
 }
}
