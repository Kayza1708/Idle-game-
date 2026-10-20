using System;
using System.Linq;
namespace IdleIntelligence.Core
{
 public sealed class AchievementDefinition
 {
  public readonly string Id,Name,English,Description,EnglishDescription;public readonly double[] Thresholds;
  public AchievementDefinition(string id,string name,string english,string description,string englishDescription,double[] thresholds){Id=id;Name=name;English=english;Description=description;EnglishDescription=englishDescription;Thresholds=thresholds;}
 }
 public sealed class StaticChallengeDefinition
 {public readonly string Id,Name,Description;public readonly int Stars;public StaticChallengeDefinition(string id,string name,string description,int stars){Id=id;Name=name;Description=description;Stars=stars;}}
 [Serializable] public sealed class GemEntry
 {public string id,source;public double at;public long amount;public GemEntry Copy()=>(GemEntry)MemberwiseClone();}
 [Serializable] public sealed class InboxMessage
 {public string id,title,body;public double at;public InboxMessage Copy()=>(InboxMessage)MemberwiseClone();}
 [Serializable] public sealed class RetentionState
 {
  public int schema=1,namePolicy;public bool initialized;public long gems,points;public string playerName="Operator",aiName="";
  public string[] achievementClaims=Array.Empty<string>(),challengeClaims=Array.Empty<string>(),onboardingCompleted=Array.Empty<string>(),onboardingClaimed=Array.Empty<string>();
  public string[] readMessages=Array.Empty<string>(),completedSeasons=Array.Empty<string>(),artifacts=Array.Empty<string>();
  public InboxMessage[] inbox=Array.Empty<InboxMessage>();public GemEntry[] ledger=Array.Empty<GemEntry>();
  public static RetentionState New(double now)=>new RetentionState{initialized=true,namePolicy=NameBalance.Version,gems=(long)RetentionBalance.InitialGems,playerName=RetentionBalance.InitialPlayerName,inbox=RetentionBalance.InitialInbox.Select(m=>new InboxMessage{id=m.id,title=m.title,body=m.body,at=now}).ToArray()};
  public static RetentionState Migrated()=>new RetentionState{initialized=true,namePolicy=NameBalance.Version,playerName=RetentionBalance.InitialPlayerName};
  public RetentionState Copy(){var s=(RetentionState)MemberwiseClone();s.achievementClaims=(string[])achievementClaims.Clone();s.challengeClaims=(string[])challengeClaims.Clone();s.onboardingCompleted=(string[])onboardingCompleted.Clone();s.onboardingClaimed=(string[])onboardingClaimed.Clone();s.readMessages=(string[])readMessages.Clone();s.completedSeasons=(string[])completedSeasons.Clone();s.artifacts=(string[])artifacts.Clone();s.inbox=inbox.Select(m=>m.Copy()).ToArray();s.ledger=ledger.Select(m=>m.Copy()).ToArray();return s;}
 }
}
