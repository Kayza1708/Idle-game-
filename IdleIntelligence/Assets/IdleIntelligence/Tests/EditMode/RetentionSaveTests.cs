using System;
using System.IO;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using IdleIntelligence.Core;
using IdleIntelligence.Runtime;
using NUnit.Framework;
using UnityEngine;
namespace IdleIntelligence.Tests
{
 public sealed class RetentionSaveTests
 {
  static string Hash(string value){using(var h=SHA256.Create())return BitConverter.ToString(h.ComputeHash(Encoding.UTF8.GetBytes(value))).Replace("-","").ToLowerInvariant();}
  static string Envelope(UnitySaveCodec codec,StateData dto,int version){string payload=codec.Encode(dto);return codec.EncodeEnvelope(new SaveEnvelope{format=AtomicSaveStore.Format,version=version,payload=payload,sha256=Hash(payload)});}
  [Test]public void VersionSevenActiveSessionKeepsOriginalAssetsAndAddsNoHistoricWalletRewards()
  {
   string dir=Path.Combine(Path.GetTempPath(),"unity-retention-v7-"+Guid.NewGuid());Directory.CreateDirectory(dir);try
   {
    var s=Game.New(1000000);s.Credits=s.Data=ScientificNumber.From(100000000);s=Game.Buy(s,"calculator",25);s=Game.Buy(s,"sbc");s.Prestige.resets=1;s=Workshop.Discover(s);s=Workshop.Craft(s,"impulse-relay");s=Workshop.Equip(s,s.Workshop.inventory[0].id);s=Game.Train(s,"quality");var run=ChallengeRules.Start(s,"no-taps",1,"v7-active");Assert.That(run.Challenges.Run,Is.Not.Null);
    var dto=StateData.From(run);dto.retention=null;dto.modelLevelRecorded=false;dto.challengeMain.retention=null;dto.challengeMain.modelLevelRecorded=false;var codec=new UnitySaveCodec();string original=Envelope(codec,dto,7),path=Path.Combine(dir,"save.json");File.WriteAllText(path,original);var store=new AtomicSaveStore(path,codec);var load=store.Load(run.SavedAt);Assert.That(load.Writable,Is.True,load.Message);Assert.That(load.State.Retention.gems,Is.Zero);Assert.That(load.State.Challenges.Main.Retention.gems,Is.Zero);Assert.That(load.State.Challenges.Main.Workshop.inventory[0].id,Is.EqualTo(s.Workshop.inventory[0].id));Assert.That(load.State.Challenges.Main.Training.id,Is.EqualTo("quality"));Assert.That(load.State.Challenges.Main.Lifetime.hardwareBought,Is.EqualTo(s.Lifetime.hardwareBought));Assert.That(File.ReadAllText(Directory.GetFiles(dir,"*.v7-original-*").Single()),Is.EqualTo(original));store.Save(load.State);Assert.That(codec.DecodeEnvelope(File.ReadAllText(path)).version,Is.EqualTo(AtomicSaveStore.Version));Assert.That(File.ReadAllText(path+".backup"),Is.EqualTo(original));
    foreach(int badField in Enumerable.Range(0,3)){var bad=StateData.From(load.State);if(badField==0)bad.retention=null;else if(badField==1)bad.challengeMain.retention=null;else bad.challengeMain.modelLevelRecorded=false;string raw=Envelope(codec,bad,8);File.WriteAllText(path,raw);Assert.That(new AtomicSaveStore(path,codec).Load(run.SavedAt).Writable,Is.False,"Missing current contract "+badField);Assert.That(File.ReadAllText(path),Is.EqualTo(raw));}
   }finally{Directory.Delete(dir,true);}
  }
  [Test]public void EarnedClaimsSurviveOfflineReloadAndRepeatedCallbacksExactlyOnce()
  {
   string dir=Path.Combine(Path.GetTempPath(),"unity-retention-claim-"+Guid.NewGuid());Directory.CreateDirectory(dir);try
   {
    var codec=new UnitySaveCodec();string path=Path.Combine(dir,"save.json");var store=new AtomicSaveStore(path,codec);var loaded=store.Load(1000);var s=loaded.State;s.Credits=ScientificNumber.From(100000000);s=Game.Buy(s,"calculator",25);Assert.That(RetentionRules.AchievementReady(s,"hardware",0),Is.True);var n=RetentionRules.Achievement(s,"hardware",0);Assert.That(n.Retention.points,Is.GreaterThan(0));Assert.That(Game.Income(n).CompareTo(Game.Income(s)),Is.GreaterThan(0));store.Save(n);var reload=new AtomicSaveStore(path,codec).Load(n.SavedAt);Assert.That(reload.Writable,Is.True,reload.Message);Assert.That(RetentionRules.Achievement(reload.State,"hardware",0),Is.SameAs(reload.State));Assert.That(reload.State.Retention.ledger.Length,Is.EqualTo(1));long gems=reload.State.Retention.gems;var offline=Game.Advance(reload.State,reload.State.SavedAt+3600000);Assert.That(offline.Retention.gems,Is.EqualTo(gems));Assert.That(offline.Retention.achievementClaims,Is.EqualTo(new[]{"hardware:0"}));var eligible=offline.Prestige.Eligible;var intro=RetentionRules.Onboarding(offline,"first-buy");Assert.That(intro.Credits.CompareTo(offline.Credits.Add(ScientificNumber.From(RetentionBalance.IntroCredits[0]))),Is.Zero);Assert.That(intro.Prestige.Eligible.CompareTo(eligible),Is.Zero,"Intro credits are not eligible income");Assert.That(RetentionRules.Onboarding(intro,"first-buy"),Is.SameAs(intro));
   }finally{Directory.Delete(dir,true);}
  }
  [Test]public void ModelLevelIsRecordedIndependentlyAndFollowsArchiveAndAxiomResetRules()
  {
   var s=Game.New(10000000);s.Credits=s.Data=ScientificNumber.From(100000000);s=Game.Train(s,"quality");s=Game.Advance(s,s.SavedAt+1000000);Assert.That(s.Training,Is.Null);Assert.That(s.ModelLevel,Is.EqualTo(1));s.Prestige.Entitlement=ScientificNumber.From(1e20);var archived=s.Copy();archived.Workshop.nodes=new[]{"T08"};archived=PrestigeRules.Reset(archived);Assert.That(archived.ModelLevel,Is.EqualTo(s.ModelLevel));var reset=PrestigeRules.Reset(s);Assert.That(reset.ModelLevel,Is.Zero);s.Meta.cycleStartedAt=0;s.Prestige.known=PrestigeBalance.Nodes.Take((int)PrestigeRules.V("firstAxiomNodes")).Select(n=>n.Id).ToArray();var axiom=MetaRules.AxiomReset(s);Assert.That(axiom.Meta.resets,Is.EqualTo(1),"Prepared first-axiom gate met");Assert.That(axiom.ModelLevel,Is.Zero);Assert.That(JsonUtility.ToJson(axiom.Retention),Is.EqualTo(JsonUtility.ToJson(s.Retention)));var dto=StateData.From(s);dto.modelLevel=5;var restored=dto.ToState();Assert.That(restored.ModelLevel,Is.EqualTo(5));Assert.That(restored.Quality,Is.EqualTo(1),"Independent persisted field, no recomputation from tracks");
  }
 }
}
