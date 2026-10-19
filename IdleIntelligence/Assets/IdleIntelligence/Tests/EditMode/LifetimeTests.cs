using System;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Security.Cryptography;
using System.Text;
using IdleIntelligence.Core;
using IdleIntelligence.Runtime;
using NUnit.Framework;
using UnityEngine;
namespace IdleIntelligence.Tests
{
    [Serializable] public sealed class LifetimeCase {public string name,action,id;public int amount;public double at;public bool active,hasMain;public StateData before;public LifetimeState expected,main;}
    [Serializable] public sealed class LifetimeCases {public string scope;public LifetimeCase[] cases;}
    public sealed class LifetimeTests
    {
        static void Equal(LifetimeState a,LifetimeState b,string context)
        {
            foreach(var f in typeof(LifetimeState).GetFields(BindingFlags.Public|BindingFlags.Instance))
            {
                if(f.Name=="since")continue;
                var actual=f.GetValue(a);var expected=f.GetValue(b);
                if(f.FieldType==typeof(double))Assert.That((double)actual,Is.EqualTo((double)expected).Within(Math.Max(1e-7,Math.Abs((double)expected)*2e-10)),context+" "+f.Name);
                else Assert.That(actual,Is.EqualTo(expected),context+" "+f.Name);
            }
        }
        [Test] public void EveryExistingProducerMatchesTypeScriptAndKeepsMainHistoryIsolated()
        {
            var data=JsonUtility.FromJson<LifetimeCases>(File.ReadAllText(Path.Combine(Application.dataPath,"IdleIntelligence/Tests/EditMode/LifetimeReferenceCases.json")));
            Assert.That(data.cases.Length,Is.GreaterThan(90));
            foreach(var c in data.cases)
            {
                var s=c.before.ToState();string original=JsonUtility.ToJson(StateData.From(s));var n=s;
                switch(c.action)
                {
                    case "hardware":n=Game.Buy(s,c.id,c.amount);break;case "train":n=Game.Train(s,c.id);break;case "research":n=Game.Research(s,c.id);break;
                    case "advance":n=Game.Advance(s,c.at,c.active);break;case "tap":n=Game.Tap(s,c.at);break;case "craft":n=Workshop.Craft(s,c.id);break;
                    case "fuse":n=Workshop.Fuse(s,s.Workshop.inventory.Skip(Math.Max(0,s.Workshop.inventory.Length-3)).Select(i=>i.id).ToArray());break;
                    case "salvage":n=MetaAutomation.Salvage(s,c.id,.99);break;case "synthesis":n=Industry.Synthesize(s,Array.IndexOf(ItemBalance.ComponentIds,c.id));break;
                    case "forge":n=Industry.QueueForge(s,c.id);break;case "analysis":n=MaterialAnalysis.Start(s,0);break;case "reset":n=PrestigeRules.Reset(s);break;
                    case "axiom-reset":n=MetaRules.AxiomReset(s);break;case "start":n=ChallengeRules.Start(s,"no-taps",1,"lifetime-test");break;case "abort":n=ChallengeRules.Return(s,false);break;
                }
                Assert.That(JsonUtility.ToJson(StateData.From(s)),Is.EqualTo(original),c.name+" pure");Equal(n.Lifetime,c.expected,c.name);
                if(c.hasMain)Equal(n.Challenges.Main.Lifetime,c.main,c.name+" main");Game.Validate(n);
                Equal(StateData.From(n).ToState().Lifetime,n.Lifetime,c.name+" roundtrip");
            }
        }
        static string Hash(string value){using(var h=SHA256.Create())return BitConverter.ToString(h.ComputeHash(Encoding.UTF8.GetBytes(value))).Replace("-","").ToLowerInvariant();}
        [Test] public void VersionSixMigrationKeepsOriginalAndDoesNotInventHistoricEvents()
        {
            string dir=Path.Combine(Path.GetTempPath(),"unity-lifetime-v6-"+Guid.NewGuid());Directory.CreateDirectory(dir);
            try
            {
                var s=Game.New(1000000);s.Credits=ScientificNumber.From(1e12);s=Game.Buy(s,"calculator",500);s.Taps=1000;
                var codec=new UnitySaveCodec();var dto=StateData.From(s);dto.lifetime=null;string payload=codec.Encode(dto),original=codec.EncodeEnvelope(new SaveEnvelope{format=AtomicSaveStore.Format,version=6,payload=payload,sha256=Hash(payload)}),path=Path.Combine(dir,"save.json");File.WriteAllText(path,original);
                var store=new AtomicSaveStore(path,codec);var loaded=store.Load(s.SavedAt);Assert.That(loaded.Writable,Is.True,loaded.Message);Assert.That(loaded.State.Hardware,Is.EqualTo(s.Hardware));Assert.That(loaded.State.Taps,Is.EqualTo(1000));Assert.That(loaded.State.Lifetime.historicalUnavailable,Is.True);Assert.That(loaded.State.Lifetime.hardwareBought,Is.Zero);Assert.That(loaded.State.Lifetime.taps,Is.Zero);Assert.That(loaded.State.Lifetime.hardwareMasteryXp,Is.All.Zero);Assert.That(File.ReadAllText(Directory.GetFiles(dir,"*.v6-original-*").Single()),Is.EqualTo(original));
                store.Save(loaded.State);Assert.That(codec.DecodeEnvelope(File.ReadAllText(path)).version,Is.EqualTo(7));Assert.That(File.ReadAllText(path+".backup"),Is.EqualTo(original));
                payload=codec.Encode(dto);string bad=codec.EncodeEnvelope(new SaveEnvelope{format=AtomicSaveStore.Format,version=7,payload=payload,sha256=Hash(payload)});File.WriteAllText(path,bad);Assert.That(new AtomicSaveStore(path,codec).Load(s.SavedAt).Writable,Is.False);Assert.That(File.ReadAllText(path),Is.EqualTo(bad));
            }
            finally{Directory.Delete(dir,true);}
        }
        [Test] public void ActiveVersionSixSessionPreservesMainAndRejectsMissingVersionSevenMainHistory()
        {
            string dir=Path.Combine(Path.GetTempPath(),"unity-lifetime-main-"+Guid.NewGuid());Directory.CreateDirectory(dir);
            try
            {
                var s=Game.New(1000);s.Credits=ScientificNumber.From(100000);s=Game.Buy(s,"sbc");s.Prestige.resets=1;var run=ChallengeRules.Start(s,"no-taps",1,"old-active");Assert.That(run.Challenges.Run,Is.Not.Null);
                var dto=StateData.From(run);dto.lifetime=null;dto.challengeMain.lifetime=null;var codec=new UnitySaveCodec();string payload=codec.Encode(dto),path=Path.Combine(dir,"save.json"),raw=codec.EncodeEnvelope(new SaveEnvelope{format=AtomicSaveStore.Format,version=6,payload=payload,sha256=Hash(payload)});File.WriteAllText(path,raw);
                var store=new AtomicSaveStore(path,codec);var loaded=store.Load(run.SavedAt);Assert.That(loaded.Writable,Is.True,loaded.Message);Assert.That(loaded.State.Lifetime.historicalUnavailable,Is.True);Assert.That(loaded.State.Challenges.Main.Lifetime.historicalUnavailable,Is.True);Assert.That(loaded.State.Challenges.Main.Credits.CompareTo(s.Credits),Is.Zero);Assert.That(loaded.State.Challenges.Main.Hardware,Is.EqualTo(s.Hardware));store.Save(loaded.State);
                dto=StateData.From(loaded.State);dto.challengeMain.lifetime=null;payload=codec.Encode(dto);raw=codec.EncodeEnvelope(new SaveEnvelope{format=AtomicSaveStore.Format,version=7,payload=payload,sha256=Hash(payload)});File.WriteAllText(path,raw);Assert.That(new AtomicSaveStore(path,codec).Load(run.SavedAt).Writable,Is.False);Assert.That(File.ReadAllText(path),Is.EqualTo(raw));
            }finally{Directory.Delete(dir,true);}
        }
        [Test] public void MasteryAndHistoryValidationUseCurrentSourceRules()
        {var s=Game.New(0);s.Credits=ScientificNumber.From(1e20);s=Game.Buy(s,"calculator",250);Assert.That(s.Lifetime.hardwareMasteryXp[0],Is.EqualTo(250));Assert.That(Lifetime.Mastery(s,0),Is.EqualTo(1));var bad=s.Copy();bad.Lifetime.regularData=double.NaN;Assert.Throws<FormatException>(()=>Game.Validate(bad));bad=s.Copy();bad.Lifetime.hardwareClasses=new[]{"calculator","calculator"};Assert.Throws<FormatException>(()=>Game.Validate(bad));var later=Game.Advance(s,1000,true);Assert.That(later.Lifetime.activeSeconds,Is.EqualTo(1));var offline=Game.Advance(later,2000);Assert.That(offline.Lifetime.activeSeconds,Is.EqualTo(1));Assert.That(Game.Advance(offline,2000,true),Is.SameAs(offline));}
    }
}
