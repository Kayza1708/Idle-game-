using System;using System.IO;using System.Linq;using System.Security.Cryptography;using System.Text;using IdleIntelligence.Core;using IdleIntelligence.Runtime;using NUnit.Framework;using UnityEngine;
namespace IdleIntelligence.Tests
{
 public sealed class PrestigeSaveTests
 {
  static string Hash(string text){using(var sha=SHA256.Create())return BitConverter.ToString(sha.ComputeHash(Encoding.UTF8.GetBytes(text))).Replace("-","").ToLowerInvariant();}
  [Test]public void VersionTwoRetainsEveryExistingFieldAndItsByteExactOriginal()
  {
   string dir=Path.Combine(Path.GetTempPath(),"unity-int-migrate-"+Guid.NewGuid());Directory.CreateDirectory(dir);try{var codec=new UnitySaveCodec();var s=Game.New(1000);s=Game.Buy(s,"calculator");s=Workshop.Discover(s);s=Workshop.Craft(s,"impulse-relay");s=Workshop.Equip(s,s.Workshop.inventory[0].id);s=Game.Tap(s,1000);var data=StateData.From(s);data.research=data.research.Take(10).ToArray();data.industry=null;data.prestige=null;string payload=codec.Encode(data),original=codec.EncodeEnvelope(new SaveEnvelope{format=AtomicSaveStore.Format,version=2,payload=payload,sha256=Hash(payload)});string path=Path.Combine(dir,"unity-slice-v1.json");File.WriteAllText(path,original);var store=new AtomicSaveStore(path,codec);var load=store.Load(1000);Assert.That(load.Writable,Is.True,load.Message);Assert.That(File.ReadAllText(Directory.GetFiles(dir,"*.v2-original-*").Single()),Is.EqualTo(original));var expected=StateData.From(s);expected.prestige=load.State.Prestige.Copy();Assert.That(JsonUtility.ToJson(StateData.From(load.State)),Is.EqualTo(JsonUtility.ToJson(expected)),"All old fields retained");Assert.That(load.State.Prestige.Eligible.IsZero,Is.True,"Do not invent unrecorded historical income");Assert.That(load.State.Prestige.historicalIncomeUnavailable,Is.True);store.Save(load.State);Assert.That(codec.DecodeEnvelope(File.ReadAllText(path)).version,Is.EqualTo(AtomicSaveStore.Version));Assert.That(File.ReadAllText(path+".backup"),Is.EqualTo(original));}finally{Directory.Delete(dir,true);}
  }
  [Test]public void LedgerTamperingAndMissingVersionThreeStateCannotBeSilentlyReplaced()
  {
   var s=Game.New(1000);s.Prestige.Free=ScientificNumber.From(1);Assert.Throws<FormatException>(()=>Game.Validate(s));var dto=StateData.From(Game.New(1000));dto.prestige=null;Assert.Throws<FormatException>(()=>dto.ToState());
  }
 }
}
