using System;
using System.IO;
using System.Linq;
using IdleIntelligence.Core;
using NUnit.Framework;
using UnityEngine;
namespace IdleIntelligence.Tests
{
 [Serializable]public sealed class OfferSnapshot
 {public string id,kind,payment,tier,item;public int component,rarity;public long cost,amount,originalCost;public bool stock;public static OfferSnapshot From(MarketOffer o)=>new OfferSnapshot{id=o.Id,kind=o.Kind,payment=o.Payment,tier=o.Tier,item=o.Item,component=o.Component,rarity=o.Rarity,cost=o.Cost,amount=o.Amount,originalCost=o.OriginalCost,stock=o.Stock};}
 [Serializable]public sealed class OfferSnapshots{public OfferSnapshot[] offers;}
 [Serializable]public sealed class QuoteSnapshot{public string reason;public long revision,day;public double freeRemaining,rotationRemaining;}
 [Serializable]public sealed class VideoSnapshot{public string reason;public int remaining;public double resetIn;}
 [Serializable]public sealed class MarketStep
 {public string action,id,random,result,context;public double at,componentsEarned;public int draws;public MarketTicketData ticket;public MarketState expected;public RewardState rewards;public RetentionState retention;public long[] components;public ItemInstance[] inventory;public long nextId;public uint metaRng;public OfferSnapshot[] offers;public QuoteSnapshot quote;public VideoSnapshot video;}
 [Serializable]public sealed class MarketTicketData{public string id;public long revision,day;public MarketTicket Value()=>new MarketTicket{id=id,revision=revision,day=day};}
 [Serializable]public sealed class MarketScenario{public string name;public StateData before;public MarketStep[] steps;}
 [Serializable]public sealed class CampaignSeedCase{public double at;public string campaign;public uint expected;}
 [Serializable]public sealed class MarketCases{public CampaignSeedCase[] seeds;public int transactions;public MarketScenario[] scenarios;}
 public sealed class MarketTests
 {
  [Test]public void OriginalMarketPricesRotationTicketsTransactionsAndVideoLimitsMatchTypeScript()
  {
   var f=JsonUtility.FromJson<MarketCases>(File.ReadAllText(Path.Combine(Application.dataPath,"IdleIntelligence/Tests/EditMode/MarketReferenceCases.json")));Assert.That(f.transactions,Is.GreaterThan(450));foreach(var seed in f.seeds)Assert.That(MetaState.New(seed.at,seed.campaign).rng,Is.EqualTo(seed.expected),"original campaign seed "+seed.campaign);int count=0;
   foreach(var scenario in f.scenarios){var s=scenario.before.ToState();foreach(var c in scenario.steps){string label=scenario.name+" / "+count++ +" "+c.action+" "+c.id,original=JsonUtility.ToJson(StateData.From(s));int draws=0;Func<double> rng=c.random=="seeded"?null:(Func<double>)(()=>{draws++;if(c.random=="throws")throw new InvalidOperationException("Injected RNG failure");return c.random=="nan"?double.NaN:double.Parse(c.random,System.Globalization.CultureInfo.InvariantCulture);});var n=s;
    switch(c.action){case "visit":n=Market.Visit(s);break;case "buy":n=Market.Buy(s,c.ticket.Value(),rng);break;case "begin":n=Market.BeginVideo(s,c.id);break;case "cancel":n=Market.CancelVideo(s,c.id);break;case "complete":n=Market.CompleteVideo(s,c.id,c.result);break;case "time":n=s.Copy();n.SavedAt=c.at;n=Market.Visit(n);break;case "start":n=ChallengeRules.Start(s,"no-taps",1,"market-source");break;case "abort":n=ChallengeRules.Return(s,false);break;}
    Assert.That(JsonUtility.ToJson(StateData.From(s)),Is.EqualTo(original),label+" pure");Assert.That(draws,Is.EqualTo(c.draws),label+" exact injected RNG calls");Assert.That(JsonUtility.ToJson(n.Market),Is.EqualTo(JsonUtility.ToJson(c.expected)),label+" rotation/cooldown/pending/limits");Assert.That(JsonUtility.ToJson(n.Rewards),Is.EqualTo(JsonUtility.ToJson(c.rewards)),label+" revision/atomic receipt");Assert.That(JsonUtility.ToJson(n.Retention),Is.EqualTo(JsonUtility.ToJson(c.retention)),label+" wallet/debit/ledger");Assert.That(n.Workshop.components,Is.EqualTo(c.components),label+" materials");Assert.That(JsonUtility.ToJson(new SeasonTests.ItemList{items=n.Workshop.inventory}),Is.EqualTo(JsonUtility.ToJson(new SeasonTests.ItemList{items=c.inventory})),label+" item identity and rarity");Assert.That(n.Workshop.nextId,Is.EqualTo(c.nextId),label+" item IDs");Assert.That(n.Lifetime.componentsEarned,Is.EqualTo(c.componentsEarned).Within(1e-7),label+" material counter");Assert.That(n.Meta.rng,Is.EqualTo(c.metaRng),label+" campaign RNG");Assert.That(Market.Context(n),Is.EqualTo(c.context),label+" callback context");Assert.That(JsonUtility.ToJson(new OfferSnapshots{offers=Market.Offers(n).Select(OfferSnapshot.From).ToArray()}),Is.EqualTo(JsonUtility.ToJson(new OfferSnapshots{offers=c.offers})),label+" all actual offers and costs");var quote=Market.Quote(n,"free-common");Assert.That(quote.Reason??"",Is.EqualTo(c.quote.reason),label+" quote reason");Assert.That(quote.Ticket.revision,Is.EqualTo(c.quote.revision),label+" ticket revision");Assert.That(quote.Ticket.day,Is.EqualTo(c.quote.day),label+" day");Assert.That(quote.FreeRemaining,Is.EqualTo(c.quote.freeRemaining),label+" free cooldown");Assert.That(quote.RotationRemaining,Is.EqualTo(c.quote.rotationRemaining),label+" rotation time");var video=Market.VideoQuote(n);Assert.That(video.Reason??"",Is.EqualTo(c.video.reason),label+" video reason");Assert.That(video.Remaining,Is.EqualTo(c.video.remaining),label+" video limit");Assert.That(video.ResetIn,Is.EqualTo(c.video.resetIn),label+" video reset");Game.Validate(n);Assert.That(JsonUtility.ToJson(StateData.From(n).ToState().Market),Is.EqualTo(JsonUtility.ToJson(n.Market)),label+" reload");s=n;
   }}Assert.That(count,Is.EqualTo(f.transactions));
  }
 }
}
