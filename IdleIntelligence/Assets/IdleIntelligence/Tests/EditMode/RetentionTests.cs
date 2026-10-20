using System;
using System.IO;
using System.Linq;
using IdleIntelligence.Core;
using NUnit.Framework;
using UnityEngine;
namespace IdleIntelligence.Tests
{
 [Serializable]public sealed class NormalizationCase{public string input,kd,kc;}
 [Serializable]public sealed class NormalizationCases{public string unicode;public NormalizationCase[] cases;}
 [Serializable]public sealed class NameCase{public string input,name,error,moderation;public int maximum;public bool ok,blocked;}
 [Serializable]public sealed class RewardItem{public string id,type;public int rarity;}
 [Serializable]public sealed class RetentionCase{public string name,action,id,text;public int tier,stars;public StateData before;public RetentionState expected;public PrestigeMetrics rates;public NumberData credits;public long[] components;public RewardItem[] inventory;public double[] values;public bool[] staticReady;}
 [Serializable]public sealed class RetentionCases{public string scope;public NameCase[] policy;public RetentionCase[] cases;}
 public sealed class RetentionTests
 {
  static RetentionCases Load()=>JsonUtility.FromJson<RetentionCases>(File.ReadAllText(Path.Combine(Application.dataPath,"IdleIntelligence/Tests/EditMode/RetentionReferenceCases.json")));
  static void Near(ScientificNumber actual,NumberData expected,string label){var e=ScientificNumber.FromData(expected);if(e.IsZero)Assert.That(actual.IsZero,Is.True,label);else Assert.That(actual.Log10(),Is.EqualTo(e.Log10()).Within(2e-10),label);}
  [Test]public void JavaScriptUnicodeNormalizationMatchesAllChangedScalarsAndMixedSequences()
  {var data=JsonUtility.FromJson<NormalizationCases>(File.ReadAllText(Path.Combine(Application.dataPath,"IdleIntelligence/Tests/EditMode/NameNormalizationCases.json")));Assert.That(data.cases.Length,Is.GreaterThan(18000));foreach(var c in data.cases){Assert.That(NameRules.Canonical(c.input,false),Is.EqualTo(c.kd),c.input+" NFKD");Assert.That(NameRules.Canonical(c.input,true),Is.EqualTo(c.kc),c.input+" NFKC");}}
  [Test]public void OriginalMultilingualNamesAndNormalizationMatchTypeScript()
  {
   var f=Load();Assert.That(f.policy.Length,Is.GreaterThan(300));foreach(var c in f.policy){var r=NameRules.Validate(c.input,c.maximum);Assert.That(r.Ok,Is.EqualTo(c.ok),c.input+" valid");if(c.ok)Assert.That(r.Name,Is.EqualTo(c.name),c.input+" stored representation");else Assert.That(r.Error,Is.EqualTo(c.error),c.input+" rejection");Assert.That(NameRules.Moderation(c.input),Is.EqualTo(c.moderation),c.input+" normalization");Assert.That(NameRules.Blocked(c.input),Is.EqualTo(c.blocked),c.input+" moderation");}
  }
  [Test]public void RewardsEffectsAndPermanentClaimsMatchActualTypeScript()
  {
   var f=Load();Assert.That(RetentionBalance.Achievements.Length,Is.EqualTo(37));Assert.That(RetentionBalance.Challenges.Length,Is.EqualTo(12));Assert.That(f.cases.Length,Is.GreaterThan(900));
   foreach(var c in f.cases)
   {
    var s=c.before.ToState();string original=JsonUtility.ToJson(StateData.From(s));var n=s;
    switch(c.action){case "achievement":n=RetentionRules.Achievement(s,c.id,c.tier);break;case "challenge":n=RetentionRules.StaticChallenge(s,c.id);break;case "update":n=RetentionRules.UpdateOnboarding(s);break;case "intro":n=RetentionRules.Onboarding(s,c.id);break;case "player":n=RetentionRules.SetName(s,c.text);break;case "ai":n=RetentionRules.SetName(s,c.text,true);break;case "read":n=RetentionRules.ReadMessage(s,c.id);break;case "start":n=ChallengeRules.Start(s,"no-taps",1,"retention-test");break;case "abort":n=ChallengeRules.Return(s,false);break;case "reset":n=PrestigeRules.Reset(s);break;case "axiom-reset":n=MetaRules.AxiomReset(s);break;}
    Assert.That(JsonUtility.ToJson(StateData.From(s)),Is.EqualTo(original),c.name+" pure");Assert.That(JsonUtility.ToJson(n.Retention),Is.EqualTo(JsonUtility.ToJson(c.expected)),c.name+" permanent claims/wallet/profile");Assert.That(n.Challenges.Progress.stars,Is.EqualTo(c.stars),c.name+" stars");Assert.That(n.Workshop.components,Is.EqualTo(c.components),c.name+" supplied materials");Assert.That(n.Workshop.inventory.Select(i=>i.id+":"+i.type+":"+i.rarity),Is.EqualTo(c.inventory.Select(i=>i.id+":"+i.type+":"+i.rarity)),c.name+" item identity");
    for(int i=0;i<RetentionBalance.Achievements.Length;i++)Assert.That(RetentionRules.AchievementValue(n,RetentionBalance.Achievements[i].Id),Is.EqualTo(c.values[i]),c.name+" "+RetentionBalance.Achievements[i].Id+" consumer");
    for(int i=0;i<RetentionBalance.Challenges.Length;i++)Assert.That(RetentionRules.StaticReady(n,RetentionBalance.Challenges[i].Id),Is.EqualTo(c.staticReady[i]),c.name+" "+RetentionBalance.Challenges[i].Id+" ready");
    Assert.That(n.Credits.CompareTo(ScientificNumber.FromData(c.credits)),Is.Zero,c.name+" exact credit transaction");Near(Game.Compute(n),c.rates.compute,c.name+" compute");Near(Game.DataRate(n),c.rates.dataRate,c.name+" data rate");Assert.That(Game.WorkSpeed(n),Is.EqualTo(c.rates.trainingSpeed).Within(1e-7),c.name+" training speed");Assert.That(Game.WorkSpeed(n,true),Is.EqualTo(c.rates.researchSpeed).Within(1e-7),c.name+" research speed");Near(Game.Income(n),c.rates.income,c.name+" real AP production");Game.Validate(n);Assert.That(JsonUtility.ToJson(StateData.From(n).ToState().Retention),Is.EqualTo(JsonUtility.ToJson(n.Retention)),c.name+" reload");
   }
  }
 }
}
