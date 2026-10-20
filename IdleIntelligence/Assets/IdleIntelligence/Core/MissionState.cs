using System;
using System.Linq;
namespace IdleIntelligence.Core
{
 public sealed class MissionTemplate
 {public readonly string Id,Metric,Objective,Name,English;public readonly double[] Base;public MissionTemplate(string id,string metric,string objective,string name,string english,double[] basis){Id=id;Metric=metric;Objective=objective;Name=name;English=english;Base=basis;}}
 [Serializable]public sealed class MissionTask
 {public string id,metric,objective="",targetHardware="",de,en;public double goal,baseline;public long reward;public int rewardTier=1;public bool hasRewardTier,claimed;public MissionTask Copy()=>(MissionTask)MemberwiseClone();}
 [Serializable]public sealed class MissionPeriod
 {public string key="";public double endsAt;public MissionTask[] tasks=Array.Empty<MissionTask>();public int required;public long bonus;public bool bonusClaimed;public MissionPeriod Copy(){var p=(MissionPeriod)MemberwiseClone();p.tasks=tasks.Select(t=>t.Copy()).ToArray();return p;}}
 [Serializable]public sealed class SeasonProgress
 {public bool hasClock;public string id=MissionBalance.InitialSeasonId;public double startedAt,endsAt,xp,claimUntil;public int[] claimed=Array.Empty<int>(),premiumClaimed=Array.Empty<int>();public SeasonProgress Copy(){var s=(SeasonProgress)MemberwiseClone();s.claimed=(int[])claimed.Clone();s.premiumClaimed=(int[])premiumClaimed.Clone();return s;}public static SeasonProgress New(double at)=>new SeasonProgress{hasClock=true,startedAt=at,endsAt=at+MissionBalance.SeasonDays*86400000};}
 [Serializable]public sealed class BonusChoice
 {public int family;public long amount;public BonusChoice Copy()=>(BonusChoice)MemberwiseClone();}
 [Serializable]public sealed class BonusBox
 {public long id;public double at;public string blueprint="";public BonusChoice[] choices=Array.Empty<BonusChoice>();public BonusBox Copy(){var b=(BonusBox)MemberwiseClone();b.choices=choices.Select(c=>c.Copy()).ToArray();return b;}}
 [Serializable]public sealed class BonusReceipt
 {public long id;public double at;public int family;public string blueprint="";public bool automatic;public long[] components=new long[ItemBalance.ComponentIds.Length];public BonusReceipt Copy(){var r=(BonusReceipt)MemberwiseClone();r.components=(long[])components.Clone();return r;}}
 [Serializable]public sealed class BonusState
 {public long earned,opened;public string lastDailyKey="";public BonusBox[] pending=Array.Empty<BonusBox>();public bool hasLast;public BonusReceipt last;public BonusState Copy(){var b=(BonusState)MemberwiseClone();b.pending=pending.Select(p=>p.Copy()).ToArray();b.last=hasLast?last?.Copy():null;return b;}}
 [Serializable]public sealed class LegacyMissionMail
 {public string id;public long gems;public LegacyMissionMail Copy()=>(LegacyMissionMail)MemberwiseClone();}
 [Serializable]public sealed class MissionState
 {
  public int schema=1;public bool initialized,startPending;public string campaign="unassigned";public MissionPeriod daily=new MissionPeriod(),weekly=new MissionPeriod(),monthly=new MissionPeriod();public SeasonProgress season=new SeasonProgress();public bool hasPrevious;public SeasonProgress previous;public BonusState boxes=new BonusState();public LegacyMissionMail[] legacyMailbox=Array.Empty<LegacyMissionMail>();
  public MissionPeriod Period(int kind)=>kind==0?daily:kind==1?weekly:monthly;public void Set(int kind,MissionPeriod p){if(kind==0)daily=p;else if(kind==1)weekly=p;else monthly=p;}
  public static MissionState New(double at)=>new MissionState{initialized=true,season=SeasonProgress.New(at),daily=new MissionPeriod{key=MissionCalendar.Key(at,0),endsAt=at},weekly=new MissionPeriod{key=MissionCalendar.Key(at,1),endsAt=at},monthly=new MissionPeriod{endsAt=at}};
  public static MissionState Migrated()=>new MissionState{initialized=true,startPending=true};
  public MissionState Copy(){var m=(MissionState)MemberwiseClone();m.daily=daily.Copy();m.weekly=weekly.Copy();m.monthly=monthly.Copy();m.season=season.Copy();m.previous=hasPrevious?previous?.Copy():null;m.boxes=boxes.Copy();m.legacyMailbox=legacyMailbox.Select(v=>v.Copy()).ToArray();return m;}
 }
}
