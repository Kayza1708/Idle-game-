using System;
using System.IO;
using System.Linq;
using IdleIntelligence.Core;
using NUnit.Framework;
using UnityEngine;
namespace IdleIntelligence.Tests
{
 [Serializable]public sealed class SeasonStep{public string action,id;public int level,track;public double at,componentsEarned;public long nextId;public RewardState rewards;public SeasonProgress season,previous;public bool hasPrevious;public RetentionState retention;public long[] components;public ItemInstance[] inventory;public string[] itemTypes;public NumberData income;}
 [Serializable]public sealed class SeasonScenario{public string name;public StateData before;public SeasonStep[] steps;}
 [Serializable]public sealed class SeasonCases{public int transactions;public SeasonScenario[] scenarios;}
 public sealed class SeasonTests
 {
  [Test]public void AllOriginalSeasonRewardsChestsPoolsGraceAndIsolationMatchTypeScript()
  {
   var f=JsonUtility.FromJson<SeasonCases>(File.ReadAllText(Path.Combine(Application.dataPath,"IdleIntelligence/Tests/EditMode/SeasonReferenceCases.json")));Assert.That(f.transactions,Is.GreaterThan(1000));int count=0;
   foreach(var scenario in f.scenarios){var s=scenario.before.ToState();foreach(var step in scenario.steps){string name=scenario.name+" / "+count++ +" "+step.action+" "+step.id+" "+step.level+" "+step.track,original=JsonUtility.ToJson(StateData.From(s));var n=s;switch(step.action){case "claim":n=SeasonRules.Claim(s,step.id,step.level,step.track);break;case "open":n=SeasonRules.OpenChest(s,step.level);break;case "roll":n=s.Copy();n.SavedAt=step.at;n=MissionRules.Roll(n,step.at);break;case "reset":n=PrestigeRules.Reset(s);break;case "start":n=ChallengeRules.Start(s,"no-taps",1,"season-challenge");break;case "abort":n=ChallengeRules.Return(s,false);break;}Assert.That(JsonUtility.ToJson(StateData.From(s)),Is.EqualTo(original),name+" pure");Assert.That(JsonUtility.ToJson(n.Rewards),Is.EqualTo(JsonUtility.ToJson(step.rewards)),name+" entitlements/chests/receipt");Assert.That(JsonUtility.ToJson(n.Missions.season),Is.EqualTo(JsonUtility.ToJson(step.season)),name+" season claims");Assert.That(n.Missions.hasPrevious,Is.EqualTo(step.hasPrevious),name+" grace");if(step.hasPrevious)Assert.That(JsonUtility.ToJson(n.Missions.previous),Is.EqualTo(JsonUtility.ToJson(step.previous)),name+" previous season");Assert.That(JsonUtility.ToJson(n.Retention),Is.EqualTo(JsonUtility.ToJson(step.retention)),name+" wallet/artifacts");Assert.That(n.Workshop.components,Is.EqualTo(step.components),name+" components");Assert.That(JsonUtility.ToJson(new ItemList{items=n.Workshop.inventory}),Is.EqualTo(JsonUtility.ToJson(new ItemList{items=step.inventory})),name+" item identity/rarity/basis");Assert.That(n.Workshop.nextId,Is.EqualTo(step.nextId),name+" item IDs");Assert.That(n.Lifetime.componentsEarned,Is.EqualTo(step.componentsEarned).Within(1e-6),name+" producer");Assert.That(n.Lifetime.itemTypes,Is.EqualTo(step.itemTypes),name+" collected types");var expectedIncome=ScientificNumber.FromData(step.income);if(expectedIncome.IsZero)Assert.That(Game.Income(n).IsZero,Is.True,name+" income");else Assert.That(Game.Income(n).Log10(),Is.EqualTo(expectedIncome.Log10()).Within(2e-10),name+" actual artifact production consumer");Game.Validate(n);Assert.That(JsonUtility.ToJson(StateData.From(n).ToState().Rewards),Is.EqualTo(JsonUtility.ToJson(n.Rewards)),name+" reload");s=n;}}
   Assert.That(count,Is.EqualTo(f.transactions));Assert.That(SeasonBalance.Rewards.Sum(t=>t.Length),Is.EqualTo(300));
  }
  [Serializable]public sealed class ItemList{public ItemInstance[] items;}
 }
}
