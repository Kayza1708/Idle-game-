using System;using System.IO;using IdleIntelligence.Core;using IdleIntelligence.Runtime;using NUnit.Framework;using UnityEngine;
namespace IdleIntelligence.Tests {
 [Serializable]public sealed class AgentControlCase{public string name;public StateData before;public NumberData minimum,total;public long resets;public bool intent;}
 [Serializable]public sealed class BudgetControlCase{public StateData before;public bool hasBudget,hasJob;public NumberData spent;}
 [Serializable]public sealed class ControlCases{public AgentControlCase[] agents;public BudgetControlCase[] budgets;}
 public sealed class ControlParityTests {
 [Test]public void ExactMinimumAndCapturedJobWaitingMatchOriginalAgent(){var cases=JsonUtility.FromJson<ControlCases>(File.ReadAllText(Path.Combine(Application.dataPath,"IdleIntelligence/Tests/EditMode/ControlReferenceCases.json")));foreach(var c in cases.agents){var s=c.before.ToState();Assert.That(s.Prestige.Minimum.CompareTo(ScientificNumber.FromData(c.minimum)),Is.Zero,c.name);var codec=new UnitySaveCodec();s=codec.Decode(codec.Encode(StateData.From(s)),AtomicSaveStore.Version).ToState();var next=PrestigeAutomation.Agent(s);Assert.That(next.Prestige.resets,Is.EqualTo(c.resets),c.name);Assert.That(next.Prestige.resetIntent,Is.EqualTo(c.intent),c.name);Assert.That(next.Prestige.Total.CompareTo(ScientificNumber.FromData(c.total)),Is.Zero,c.name);Game.Validate(next);}}
 [Test]public void ClearedZeroAndScientificBudgetsHaveActualSourceConsumers(){var cases=JsonUtility.FromJson<ControlCases>(File.ReadAllText(Path.Combine(Application.dataPath,"IdleIntelligence/Tests/EditMode/ControlReferenceCases.json")));foreach(var c in cases.budgets){var s=c.before.ToState();Assert.That(s.Prestige.directorBudgetSet,Is.EqualTo(c.hasBudget));var next=PrestigeAutomation.ResearchAuto(s);Assert.That(next.ResearchJob!=null,Is.EqualTo(c.hasJob));Assert.That(ScientificNumber.FromData(next.Prestige.directorSpent).CompareTo(ScientificNumber.FromData(c.spent)),Is.Zero);}}
 }
}
