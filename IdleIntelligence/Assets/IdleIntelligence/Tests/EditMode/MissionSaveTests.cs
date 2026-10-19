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
 public sealed class MissionSaveTests
 {
  static string Raw(StateData dto,int version){var c=new UnitySaveCodec();string p=c.Encode(dto),hash;using(var h=SHA256.Create())hash=BitConverter.ToString(h.ComputeHash(Encoding.UTF8.GetBytes(p))).Replace("-","").ToLowerInvariant();return c.EncodeEnvelope(new SaveEnvelope{format=AtomicSaveStore.Format,version=version,payload=p,sha256=hash});}
  [Test]public void V8ActiveMainMigrationKeepsOriginalAndInitializesOnlyAfterReturn()
  {
   string dir=Path.Combine(Path.GetTempPath(),"unity-missions-v8-"+Guid.NewGuid());Directory.CreateDirectory(dir);try{var s=Game.New(1000000);s.Credits=s.Data=ScientificNumber.From(1e30);s=Game.Buy(s,"sbc");s.Prestige.resets=1;s=Workshop.Discover(s);s=Workshop.Craft(s,"impulse-relay");var run=ChallengeRules.Start(s,"no-taps",1,"migration-missions");Assert.That(ChallengeRules.Active(run),Is.True);var d=StateData.From(run);d.missions=d.challengeMain.missions=null;string original=Raw(d,8),path=Path.Combine(dir,"save.json");File.WriteAllText(path,original);var store=new AtomicSaveStore(path,new UnitySaveCodec());var loaded=store.Load(run.SavedAt);Assert.That(loaded.Writable,Is.True,loaded.Message);var n=Game.Advance(loaded.State,run.SavedAt+2*86400000d);Assert.That(n.Challenges.Main.Missions.startPending,Is.True);n=ChallengeRules.Return(n,false);Assert.That(n.Missions.startPending,Is.True);Assert.That(n.Workshop.inventory.Single().id,Is.EqualTo(s.Workshop.inventory.Single().id));n=Game.Advance(n,n.SavedAt+1000);Assert.That(n.Missions.startPending,Is.False);Assert.That(n.Missions.season.startedAt,Is.EqualTo(n.SavedAt));Assert.That(n.Missions.season.xp,Is.Zero);store.Save(n);Assert.That(File.ReadAllText(Directory.GetFiles(dir,"*.v8-original-*").Single()),Is.EqualTo(original));Assert.That(File.ReadAllText(path+".backup"),Is.EqualTo(original));var reloaded=new AtomicSaveStore(path,new UnitySaveCodec()).Load(n.SavedAt);Assert.That(reloaded.Writable,Is.True,reloaded.Message);Assert.That(JsonUtility.ToJson(reloaded.State.Missions),Is.EqualTo(JsonUtility.ToJson(n.Missions)));}finally{Directory.Delete(dir,true);}
  }
  [Test]public void MissingCurrentContractsAndCorruptFrozenChoicesNeverOverwriteTheOriginal()
  {
   string dir=Path.Combine(Path.GetTempPath(),"unity-missions-invalid-"+Guid.NewGuid());Directory.CreateDirectory(dir);try{string path=Path.Combine(dir,"save.json");for(int mode=0;mode<4;mode++){var s=MissionRules.Roll(Game.New(1000000),1000000);var d=StateData.From(s);if(mode==0)d.missions=null;if(mode==1)d.missions.boxes.earned=1;if(mode==2)d.missions.daily.tasks[0].goal=0;if(mode==3){s.Credits=ScientificNumber.From(1e20);s.Prestige.resets=1;s=Game.Buy(s,"sbc");var run=ChallengeRules.Start(s,"no-taps",1,"bad-main");d=StateData.From(run);Assert.That(d.hasChallenge,Is.True);d.challengeMain.missions=null;}string raw=Raw(d,9);File.WriteAllText(path,raw);var store=new AtomicSaveStore(path,new UnitySaveCodec());Assert.That(store.Load(1000000).Writable,Is.False,"bad contract "+mode);Assert.That(File.ReadAllText(path),Is.EqualTo(raw));Assert.Throws<InvalidOperationException>(()=>store.Save(Game.New(1000000)));}}finally{Directory.Delete(dir,true);}
  }
 }
}
