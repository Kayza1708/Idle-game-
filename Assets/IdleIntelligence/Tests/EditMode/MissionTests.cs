using System;
using System.IO;
using System.Linq;
using IdleIntelligence.Core;
using NUnit.Framework;
using UnityEngine;
namespace IdleIntelligence.Tests
{
 [Serializable]public sealed class BoxRollCase{public string campaign,key;public double expected;}
 [Serializable]public sealed class MissionCase{public string name,action,id;public int kind,family;public double at,activeSeconds,componentsEarned;public bool active;public StateData before;public MissionState expected;public RetentionState retention;public long[] components;public long fragments;public bool[] known;}
 [Serializable]public sealed class MissionCases{public BoxRollCase[] rolls;public MissionCase[] cases;}
 public sealed class MissionTests
 {
  [Test]public void OriginalMissionGenerationClaimsExpiryBoxesAndCalendarMatchTypeScript()
  {
   var f=JsonUtility.FromJson<MissionCases>(File.ReadAllText(Path.Combine(Application.dataPath,"IdleIntelligence/Tests/EditMode/MissionReferenceCases.json")));Assert.That(f.cases.Length,Is.GreaterThanOrEqualTo(200));foreach(var r in f.rolls)Assert.That(BonusBoxes.Roll(r.campaign,r.key),Is.EqualTo(r.expected).Within(1e-15),r.campaign);
   foreach(var c in f.cases){var s=c.before.ToState();string original=JsonUtility.ToJson(StateData.From(s));var n=s;switch(c.action){case "roll":n=MissionRules.Roll(s,c.at);break;case "claim":n=MissionRules.Claim(s,c.kind,c.id);break;case "bonus":n=MissionRules.Bonus(s,c.kind);break;case "earn":n=BonusBoxes.EarnDaily(s);break;case "open":n=BonusBoxes.Open(s,long.Parse(c.id),c.family);break;case "advance":n=Game.Advance(s,c.at,c.active);break;case "reset":n=PrestigeRules.Reset(s);break;case "start":n=ChallengeRules.Start(s,"no-taps",1,"missions-test");break;case "abort":n=ChallengeRules.Return(s,false);break;}
   Assert.That(JsonUtility.ToJson(StateData.From(s)),Is.EqualTo(original),c.name+" pure");Assert.That(JsonUtility.ToJson(n.Missions),Is.EqualTo(JsonUtility.ToJson(c.expected)),c.name+" missions/season/frozen receipts");Assert.That(JsonUtility.ToJson(n.Retention),Is.EqualTo(JsonUtility.ToJson(c.retention)),c.name+" reward wallet");Assert.That(n.Workshop.components,Is.EqualTo(c.components),c.name+" materials");Assert.That(n.Workshop.fragments,Is.EqualTo(c.fragments),c.name+" fragments");Assert.That(n.Workshop.knownBlueprints,Is.EqualTo(c.known),c.name+" blueprints");Assert.That(n.Lifetime.activeSeconds,Is.EqualTo(c.activeSeconds).Within(1e-7),c.name+" active boundary");Assert.That(n.Lifetime.componentsEarned,Is.EqualTo(c.componentsEarned).Within(1e-7),c.name+" component producer");Game.Validate(n);Assert.That(JsonUtility.ToJson(StateData.From(n).ToState().Missions),Is.EqualTo(JsonUtility.ToJson(n.Missions)),c.name+" reload");}
  }
  [Test]public void NativeMigrationBaselinesAfterOfflineInsteadOfInventingHistoricalRewards()
  {var s=Game.New(1000000);s.Missions=MissionState.Migrated();s.Lifetime.hardwareBought=999999;s.Hardware[0]=100;s.Lifetime.activeSeconds=99999;var n=Game.Advance(s,s.SavedAt+60d*86400000);Assert.That(n.Missions.startPending,Is.False);Assert.That(n.Missions.season.startedAt,Is.EqualTo(n.SavedAt));Assert.That(n.Missions.season.xp,Is.Zero);Assert.That(n.Retention.gems,Is.EqualTo(s.Retention.gems));Assert.That(n.Missions.daily.tasks.First(t=>t.metric=="hardwareBought").baseline,Is.EqualTo(n.Lifetime.hardwareBought));Assert.That(n.Missions.daily.tasks.All(t=>!MissionRules.Complete(n,t)),Is.True);Assert.That(Game.Advance(n,n.SavedAt),Is.SameAs(n));}
 }
}
