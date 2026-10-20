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
 public sealed class PurchaseSaveTests
 {
  static string Raw(StateData d,int version){var c=new UnitySaveCodec();string p=c.Encode(d),hash;using(var h=SHA256.Create())hash=BitConverter.ToString(h.ComputeHash(Encoding.UTF8.GetBytes(p))).Replace("-","").ToLowerInvariant();return c.EncodeEnvelope(new SaveEnvelope{format=AtomicSaveStore.Format,version=version,payload=p,sha256=hash});}
  [Test]public void V13MigrationRetainsRightsAndGemReceiptWithoutInventedPurchase()
  {string dir=Path.Combine(Path.GetTempPath(),"unity-purchase-v13-"+Guid.NewGuid());Directory.CreateDirectory(dir);try{var s=Game.New(1000000);s.Prestige.resets=1;s.Retention.gems=1000;s.Rewards.owned=new[]{"ai_singularity.pass.income","ai_singularity.season.01"};s.Rewards.transactions=new[]{"historic-permanent"};s=Capsules.Draw(s,1,()=>0);s=GemShop.Buy(s,"offline-12");var d=StateData.From(s);d.commerce=null;string raw=Raw(d,13),path=Path.Combine(dir,"save.json");File.WriteAllText(path,raw);var store=new AtomicSaveStore(path,new UnitySaveCodec());var load=store.Load(s.SavedAt);Assert.That(load.Writable,Is.True,load.Message);Assert.That(load.State.Commerce.hasLast,Is.False);Assert.That(load.State.Rewards.owned,Is.EqualTo(s.Rewards.owned));Assert.That(load.State.Retention.gems,Is.EqualTo(s.Retention.gems));Assert.That(load.State.Capsules.draws,Is.EqualTo(1));Assert.That(load.State.Workshop.inventory.Single().id,Is.EqualTo(s.Workshop.inventory.Single().id));var grant=new VerifiedPurchase{productId="ai_singularity.gems.100",transactionId="persisted-gems",originalTransactionId="original",status="active"};var next=PurchaseRules.Fulfill(load.State,grant);store.Save(next);Assert.That(File.ReadAllText(Directory.GetFiles(dir,"*.v13-original-*").Single()),Is.EqualTo(raw));var reload=new AtomicSaveStore(path,new UnitySaveCodec()).Load(s.SavedAt);Assert.That(reload.Writable,Is.True,reload.Message);Assert.That(PurchaseRules.Fulfill(reload.State,grant),Is.SameAs(reload.State));Assert.That(reload.State.Retention.gems,Is.EqualTo(s.Retention.gems+100));Assert.That(SeasonRules.Premium(reload.State,"season-01"),Is.True);}finally{Directory.Delete(dir,true);}}
  [Test]public void MissingCurrentCommerceMarkerLocksRootAndChallengeMainOriginal()
  {string dir=Path.Combine(Path.GetTempPath(),"unity-purchase-invalid-"+Guid.NewGuid());Directory.CreateDirectory(dir);try{string path=Path.Combine(dir,"save.json");for(int mode=0;mode<3;mode++){var s=Game.New(1000000);s.Prestige.resets=1;s.Credits=ScientificNumber.From(1e20);s=Game.Buy(s,"sbc");if(mode==2)s=ChallengeRules.Start(s,"no-taps",1,"purchase-save");var d=StateData.From(s);if(mode==0)d.commerce=null;if(mode==1){d.commerce.hasLast=true;d.commerce.last=new CommerceReceipt{id="",kind="gems",amount="100"};}if(mode==2)d.challengeMain.commerce=null;string raw=Raw(d,14);File.WriteAllText(path,raw);Assert.That(new AtomicSaveStore(path,new UnitySaveCodec()).Load(s.SavedAt).Writable,Is.False,"invalid "+mode);Assert.That(File.ReadAllText(path),Is.EqualTo(raw));}}finally{Directory.Delete(dir,true);}}
 }
}
