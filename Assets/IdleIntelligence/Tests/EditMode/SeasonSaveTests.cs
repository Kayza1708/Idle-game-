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
 public sealed class SeasonSaveTests
 {
  static string Raw(StateData d,int version){var c=new UnitySaveCodec();string p=c.Encode(d),hash;using(var h=SHA256.Create())hash=BitConverter.ToString(h.ComputeHash(Encoding.UTF8.GetBytes(p))).Replace("-","").ToLowerInvariant();return c.EncodeEnvelope(new SaveEnvelope{format=AtomicSaveStore.Format,version=version,payload=p,sha256=hash});}
  [Test]public void VersionNineClaimsCalendarAndInventorySurviveWithoutInventedEntitlements()
  {string dir=Path.Combine(Path.GetTempPath(),"unity-season-v9-"+Guid.NewGuid());Directory.CreateDirectory(dir);try{var s=MissionRules.Roll(Game.New(1000000),1000000);s.Missions.season.xp=15000;s.Missions.season.claimed=new[]{1,2};s.Missions.weekly.tasks[0].claimed=true;s=RetentionRules.CreateItem(s,"impulse-relay",1);var d=StateData.From(s);d.rewards=null;string raw=Raw(d,9),path=Path.Combine(dir,"save.json");File.WriteAllText(path,raw);var store=new AtomicSaveStore(path,new UnitySaveCodec());var loaded=store.Load(s.SavedAt);Assert.That(loaded.Writable,Is.True,loaded.Message);Assert.That(loaded.State.Rewards.owned,Is.Empty);Assert.That(loaded.State.Rewards.chests,Is.Empty);Assert.That(loaded.State.Missions.season.xp,Is.EqualTo(15000));Assert.That(loaded.State.Missions.season.claimed,Is.EqualTo(new[]{1,2}));Assert.That(loaded.State.Missions.weekly.tasks[0].claimed,Is.True);Assert.That(loaded.State.Workshop.inventory.Single().id,Is.EqualTo(s.Workshop.inventory.Single().id));var reward=SeasonRules.Claim(loaded.State,"season-01",5,0);store.Save(reward);Assert.That(File.ReadAllText(Directory.GetFiles(dir,"*.v9-original-*").Single()),Is.EqualTo(raw));Assert.That(File.ReadAllText(path+".backup"),Is.EqualTo(raw));var reload=new AtomicSaveStore(path,new UnitySaveCodec()).Load(s.SavedAt);Assert.That(reload.Writable,Is.True,reload.Message);Assert.That(reload.State.Rewards.chests.Length,Is.EqualTo(1));Assert.That(SeasonRules.Claim(reload.State,"season-01",5,0),Is.SameAs(reload.State));}finally{Directory.Delete(dir,true);}}
  [Test]public void CurrentMissingMainEntitlementsAndCorruptChestReceiptsAreRejected()
  {string dir=Path.Combine(Path.GetTempPath(),"unity-season-invalid-"+Guid.NewGuid());Directory.CreateDirectory(dir);try{string path=Path.Combine(dir,"save.json");for(int mode=0;mode<4;mode++){var s=Game.New(1000000);var d=StateData.From(s);if(mode==0)d.rewards=null;if(mode==1)d.rewards.owned=new[]{"unknown-product"};if(mode==2)d.rewards.chests=new[]{new EarnedChest{id=1,tier="common",seasonId="season-01"}};if(mode==3){s.Credits=ScientificNumber.From(1e20);s.Prestige.resets=1;s=Game.Buy(s,"sbc");d=StateData.From(ChallengeRules.Start(s,"no-taps",1,"missing-season-main"));Assert.That(d.hasChallenge,Is.True);d.challengeMain.rewards=null;}string raw=Raw(d,10);File.WriteAllText(path,raw);Assert.That(new AtomicSaveStore(path,new UnitySaveCodec()).Load(s.SavedAt).Writable,Is.False,"bad contract "+mode);Assert.That(File.ReadAllText(path),Is.EqualTo(raw));}}finally{Directory.Delete(dir,true);}}
 }
}
