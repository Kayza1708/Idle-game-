using System;
using System.IO;
using System.Linq;
using IdleIntelligence.Core;
using NUnit.Framework;
using UnityEngine;
namespace IdleIntelligence.Tests
{
 [Serializable]public sealed class PurchaseStep{public string action;public VerifiedPurchase p;public bool restoring,changed,fulfilled;public CommerceState commerce;public RetentionState retention;public string[] owned,transactions,itemTypes;public ItemInstance[] inventory;public long[] components;public double componentsEarned;public long nextId;public NumberData credits,eligible,income;public uint rng;}
 [Serializable]public sealed class PurchaseScenario{public string name;public StateData before;public PurchaseStep[] steps;}
 [Serializable]public sealed class PurchaseCases{public int transactions;public PurchaseScenario[] scenarios;}
 public sealed class PurchaseTests
 {
  static void Near(ScientificNumber actual,NumberData expected,string label){var e=ScientificNumber.FromData(expected);if(e.IsZero)Assert.That(actual.IsZero,Is.True,label);else Assert.That(actual.Log10(),Is.EqualTo(e.Log10()).Within(2e-10),label);}
  [Test]public void AllVerifiedProductRulesAndRealEntitlementConsumersMatchSource()
  {var f=JsonUtility.FromJson<PurchaseCases>(File.ReadAllText(Path.Combine(Application.dataPath,"IdleIntelligence/Tests/EditMode/PurchaseReferenceCases.json")));Assert.That(CommerceBalance.Products.Length,Is.EqualTo(12));int count=0;foreach(var scenario in f.scenarios){var s=scenario.before.ToState();foreach(var c in scenario.steps){string label=scenario.name+" / "+count++,original=JsonUtility.ToJson(StateData.From(s));var n=s;switch(c.action){case "fulfill":n=PurchaseRules.Fulfill(s,c.p,c.restoring);break;case "tap":n=Game.Tap(s,s.SavedAt);break;case "advance":n=Game.Advance(s,s.SavedAt+1000);break;case "start":n=ChallengeRules.Start(s,"no-taps",1,"commerce-run");break;case "abort":n=ChallengeRules.Return(s,false);break;}Assert.That(JsonUtility.ToJson(StateData.From(s)),Is.EqualTo(original),label+" pure");Assert.That(!ReferenceEquals(n,s),Is.EqualTo(c.changed),label+" transaction result");Assert.That(PurchaseRules.Fulfilled(n,c.p),Is.EqualTo(c.fulfilled),label+" durable fulfillment predicate");Assert.That(JsonUtility.ToJson(n.Commerce),Is.EqualTo(JsonUtility.ToJson(c.commerce)),label+" receipt");Assert.That(JsonUtility.ToJson(n.Retention),Is.EqualTo(JsonUtility.ToJson(c.retention)),label+" wallet/ledger");Assert.That(n.Rewards.owned,Is.EqualTo(c.owned),label+" exact ownership");Assert.That(n.Rewards.transactions,Is.EqualTo(c.transactions),label+" transaction deduplication");Assert.That(JsonUtility.ToJson(new SeasonTests.ItemList{items=n.Workshop.inventory}),Is.EqualTo(JsonUtility.ToJson(new SeasonTests.ItemList{items=c.inventory})),label+" actual starter items");Assert.That(n.Lifetime.itemTypes,Is.EqualTo(c.itemTypes),label+" item producer");Assert.That(n.Workshop.components,Is.EqualTo(c.components),label+" components");Assert.That(n.Lifetime.componentsEarned,Is.EqualTo(c.componentsEarned),label+" component producer");Assert.That(n.Workshop.nextId,Is.EqualTo(c.nextId),label+" IDs");Near(n.Credits,c.credits,label+" credits");Near(n.Prestige.Eligible,c.eligible,label+" eligible");Near(Game.Income(n),c.income,label+" actual income pass");Assert.That(n.CritRng,Is.EqualTo(c.rng),label+" taps");Game.Validate(n);s=n;}}Assert.That(count,Is.EqualTo(f.transactions));}
 }
}
