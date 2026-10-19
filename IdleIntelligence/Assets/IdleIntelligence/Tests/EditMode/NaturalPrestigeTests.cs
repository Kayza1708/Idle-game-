using System;using System.IO;using System.Collections.Generic;using IdleIntelligence.Core;using NUnit.Framework;using UnityEngine;
namespace IdleIntelligence.Tests
{
 [Serializable]public sealed class NaturalAction{public string kind,id;public double at;}
 [Serializable]public sealed class NaturalCheckpoint{public int action;public StateData state;}
 [Serializable]public sealed class NaturalRun{public string scope;public int seconds;public StateData initial;public NaturalAction[] actions;public NaturalCheckpoint[] checks;}
 public sealed class NaturalPrestigeTests
 {
  [Test,Timeout(180000)]public void FreshUnfundedRunReachesFirstPrestigeThroughPaidActionsMatchingTypeScript()
  {
   var trace=JsonUtility.FromJson<NaturalRun>(File.ReadAllText(Path.Combine(Application.dataPath,"IdleIntelligence/Tests/EditMode/NaturalPrestigeRun.json")));var s=trace.initial.ToState();Assert.That(s.Credits.CompareTo(ScientificNumber.From(50)),Is.Zero);Assert.That(s.Prestige.Free.IsZero,Is.True);Assert.That(s.Hardware,Is.All.Zero);var checks=new Dictionary<int,List<StateData>>();foreach(var c in trace.checks){if(!checks.ContainsKey(c.action))checks[c.action]=new List<StateData>();checks[c.action].Add(c.state);}
   for(int i=0;i<trace.actions.Length;i++){var a=trace.actions[i];switch(a.kind){case "advance":s=Game.Advance(s,a.at);break;case "tap":s=Game.Tap(s,a.at);break;case "buy":s=Game.Buy(s,a.id);break;case "train":s=Game.Train(s,a.id);break;case "research":s=Game.Research(s,a.id);break;case "reset":s=PrestigeRules.Reset(s);break;default:Assert.Fail("Unsupported natural action "+a.kind);break;}if(checks.TryGetValue(i,out var expected))foreach(var e in expected){try{PrestigeParityTests.Numbers(s,e,"Natural t="+(a.at-trace.initial.savedAt)/1000+" action "+i);}catch{File.WriteAllText("/tmp/natural-actual.json",JsonUtility.ToJson(StateData.From(s),true));File.WriteAllText("/tmp/natural-expected.json",JsonUtility.ToJson(e,true));throw;}}}
   Assert.That(s.Prestige.resets,Is.EqualTo(1));Assert.That(s.Prestige.Total.CompareTo(ScientificNumber.One),Is.Zero);Game.Validate(s);Debug.Log("NATURAL_PRESTIGE_VERIFIED: "+trace.seconds+" simulated seconds, "+trace.actions.Length+" real paid/tap/time actions; no funded stock");
  }
 }
}
