using System.IO;using IdleIntelligence.Core;using NUnit.Framework;using UnityEngine;
namespace IdleIntelligence.Tests {
 public sealed class RateProjectionTests {
  [Test]public void SharedDisplayProjectionPreservesEveryExactRateAcrossPrestigeFixtures(){var cases=JsonUtility.FromJson<PrestigeCases>(File.ReadAllText(Path.Combine(Application.dataPath,"IdleIntelligence/Tests/EditMode/PrestigeReferenceCases.json")));foreach(var c in cases.cases){var state=c.before.ToState();var rates=Game.ViewRates(state);Assert.That(rates.Compute.CompareTo(Game.Compute(state)),Is.Zero,c.name+" compute");Assert.That(rates.Users.CompareTo(Game.Users(state)),Is.Zero,c.name+" users");Assert.That(rates.Income.CompareTo(Game.Income(state)),Is.Zero,c.name+" income");Assert.That(rates.Data.CompareTo(Game.DataRate(state)),Is.Zero,c.name+" data");}}
 }
}
