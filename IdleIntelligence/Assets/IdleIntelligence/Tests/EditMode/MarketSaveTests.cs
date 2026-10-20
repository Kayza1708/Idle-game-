using System;
using System.IO;
using System.Linq;
using System.Text;
using System.Security.Cryptography;
using IdleIntelligence.Core;
using IdleIntelligence.Runtime;
using NUnit.Framework;
namespace IdleIntelligence.Tests
{
 public sealed class MarketSaveTests
 {
  static string Raw(StateData d,int version){var c=new UnitySaveCodec();string p=c.Encode(d),hash;using(var h=SHA256.Create())hash=BitConverter.ToString(h.ComputeHash(Encoding.UTF8.GetBytes(p))).Replace("-","").ToLowerInvariant();return c.EncodeEnvelope(new SaveEnvelope{format=AtomicSaveStore.Format,version=version,payload=p,sha256=hash});}
  [Test]public void VersionElevenEarnedChestReceiptMigratesWithoutResettingInventoryOrClaims()
  {string dir=Path.Combine(Path.GetTempPath(),"unity-market-v11-"+Guid.NewGuid());Directory.CreateDirectory(dir);try{var s=Game.New(1000000);s.Missions.season.xp=50000;s=SeasonRules.Claim(s,"season-01",50,0);s=SeasonRules.OpenChest(s,s.Rewards.chests.Single().id);var d=StateData.From(s);d.market=null;d.rewards.receipt.metadataRecorded=false;d.rewards.receipt.kind=d.rewards.receipt.payment=null;string path=Path.Combine(dir,"save.json"),raw=Raw(d,11);File.WriteAllText(path,raw);var store=new AtomicSaveStore(path,new UnitySaveCodec());var load=store.Load(s.SavedAt);Assert.That(load.Writable,Is.True,load.Message);Assert.That(load.State.Rewards.receipt.metadataRecorded,Is.True);Assert.That(load.State.Rewards.receipt.payment,Is.EqualTo("season"));Assert.That(load.State.Rewards.receipt.kind,Is.EqualTo("chest"));Assert.That(load.State.Workshop.components,Is.EqualTo(s.Workshop.components));Assert.That(load.State.Rewards.shopRevision,Is.EqualTo(s.Rewards.shopRevision));Assert.That(load.State.Missions.season.claimed,Does.Contain(50));Assert.That(load.State.Market.freeNextAt,Is.Zero);var bought=Market.Buy(load.State,Market.Quote(load.State,"free-common").Ticket);store.Save(bought);Assert.That(File.ReadAllText(Directory.GetFiles(dir,"*.v11-original-*").Single()),Is.EqualTo(raw));Assert.That(File.ReadAllText(path+".backup"),Is.EqualTo(raw));var reload=new AtomicSaveStore(path,new UnitySaveCodec()).Load(s.SavedAt);Assert.That(reload.Writable,Is.True,reload.Message);Assert.That(Market.Quote(reload.State,"free-common").Reason,Is.EqualTo("cooldown"));}finally{Directory.Delete(dir,true);}}
  [Test]public void InvalidMarketOrMissingReceiptMetadataNeverOverwritesOriginal()
  {string dir=Path.Combine(Path.GetTempPath(),"unity-market-invalid-"+Guid.NewGuid());Directory.CreateDirectory(dir);try{string path=Path.Combine(dir,"save.json");for(int mode=0;mode<6;mode++){var s=Market.Visit(Game.New(1000000));var d=StateData.From(s);if(mode==0)d.market=null;if(mode==1)d.market.adWindowUsed=4;if(mode==2){d.market.hasPending=true;d.market.pending=new MarketAdTicket{id="bad",at=1,expiresAt=2,context="[]"};}if(mode==3)d.market.rotation.claimed=new[]{"item:999"};if(mode==4){s=Market.Buy(s,Market.Quote(s,"free-common").Ticket);d=StateData.From(s);d.rewards.receipt.metadataRecorded=false;}if(mode==5){s.Credits=ScientificNumber.From(1e20);s.Prestige.resets=1;s=Game.Buy(s,"sbc");d=StateData.From(ChallengeRules.Start(s,"no-taps",1,"market-missing-main"));Assert.That(d.hasChallenge,Is.True);d.challengeMain.market=null;}string raw=Raw(d,12);File.WriteAllText(path,raw);Assert.That(new AtomicSaveStore(path,new UnitySaveCodec()).Load(s.SavedAt).Writable,Is.False,"bad market contract "+mode);Assert.That(File.ReadAllText(path),Is.EqualTo(raw));}}finally{Directory.Delete(dir,true);}}
 }
}
