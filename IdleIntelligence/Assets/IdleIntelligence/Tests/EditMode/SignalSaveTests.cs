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
 public sealed class SignalSaveTests
 {
  static string Raw(StateData d,int version){var c=new UnitySaveCodec();string p=c.Encode(d),hash;using(var h=SHA256.Create())hash=BitConverter.ToString(h.ComputeHash(Encoding.UTF8.GetBytes(p))).Replace("-","").ToLowerInvariant();return c.EncodeEnvelope(new SaveEnvelope{format=AtomicSaveStore.Format,version=version,payload=p,sha256=hash});}
  [Test]public void V10MigrationPreservesSeasonAndClaimsWithoutInventingSignals()
  {string dir=Path.Combine(Path.GetTempPath(),"unity-signal-v10-"+Guid.NewGuid());Directory.CreateDirectory(dir);try{var s=Game.New(1000000);s.Missions.season.xp=50000;s=SeasonRules.Claim(s,"season-01",50,0);s.Credits=ScientificNumber.From(1e20);s=Game.Buy(s,"sbc");s.Prestige.resets=1;var run=ChallengeRules.Start(s,"no-taps",1,"signal-migration");var dto=StateData.From(run);dto.signals=dto.challengeMain.signals=null;string path=Path.Combine(dir,"save.json"),raw=Raw(dto,10);File.WriteAllText(path,raw);var store=new AtomicSaveStore(path,new UnitySaveCodec());var load=store.Load(run.SavedAt);Assert.That(load.Writable,Is.True,load.Message);Assert.That(load.State.Signals.visible,Is.Empty);Assert.That(load.State.Challenges.Main.Signals.visible,Is.Empty);var n=ChallengeRules.Return(load.State,false);Assert.That(n.Missions.season.claimed,Does.Contain(50));Assert.That(n.Rewards.chests.Length,Is.EqualTo(1));Assert.That(n.Retention.artifacts,Does.Contain("season-01-core"));store.Save(n);Assert.That(File.ReadAllText(Directory.GetFiles(dir,"*.v10-original-*").Single()),Is.EqualTo(raw));Assert.That(File.ReadAllText(path+".backup"),Is.EqualTo(raw));var reloaded=new AtomicSaveStore(path,new UnitySaveCodec()).Load(n.SavedAt);Assert.That(reloaded.Writable,Is.True,reloaded.Message);Assert.That(reloaded.State.Signals.visible,Is.Empty);}finally{Directory.Delete(dir,true);}}
  [Test]public void MissingCurrentMainOrInvalidVisibleSignalNeverOverwritesOriginal()
  {string dir=Path.Combine(Path.GetTempPath(),"unity-signal-invalid-"+Guid.NewGuid());Directory.CreateDirectory(dir);try{string path=Path.Combine(dir,"save.json");for(int mode=0;mode<3;mode++){var s=Game.New(1000000);var d=StateData.From(s);if(mode==0)d.signals=null;if(mode==1)d.signals.visible=new[]{new LootSignal{id="broken",spawnedAt=1000000,expiresAt=1,x=50,y=50}};if(mode==2){s.Credits=ScientificNumber.From(1e20);s=Game.Buy(s,"sbc");s.Prestige.resets=1;d=StateData.From(ChallengeRules.Start(s,"no-taps",1,"missing-main-signal"));Assert.That(d.hasChallenge,Is.True);d.challengeMain.signals=null;}string raw=Raw(d,11);File.WriteAllText(path,raw);Assert.That(new AtomicSaveStore(path,new UnitySaveCodec()).Load(s.SavedAt).Writable,Is.False,"invalid signal contract "+mode);Assert.That(File.ReadAllText(path),Is.EqualTo(raw));}}finally{Directory.Delete(dir,true);}}
 }
}
