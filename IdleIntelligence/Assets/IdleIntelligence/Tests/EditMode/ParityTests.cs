using System;
using System.IO;
using System.Linq;
using IdleIntelligence.Core;
using IdleIntelligence.Runtime;
using NUnit.Framework;
using UnityEngine;
namespace IdleIntelligence.Tests
{
    [Serializable] public sealed class ReferenceSet { public string sourceHash;public NumberCase[] numberCases;public ReferenceCase[] cases; }
    [Serializable] public sealed class NumberCase {public string name,op;public NumberData a,b,expected;public int comparison;}
    [Serializable] public sealed class ReferenceCase {public string name,action,id;public long amount;public double at,seconds;public StateData before,expected;public NumberData compute,users,income,dataRate,quote,creditGain,creditSpent,dataGain,dataSpent;}
    public sealed class ParityTests
    {
        static ReferenceSet Cases()=>JsonUtility.FromJson<ReferenceSet>(File.ReadAllText(Path.Combine(Application.dataPath,"IdleIntelligence/Tests/EditMode/ReferenceCases.json")));
        static void Near(ScientificNumber actual,NumberData expected,string message)
        {
            var target=ScientificNumber.FromData(expected);
            if(target.IsZero){Assert.That(actual.IsZero,Is.True,message);return;}
            Assert.That(actual.Log10(),Is.EqualTo(target.Log10()).Within(2e-11),message);
        }
        [Test] public void EveryGoldenTransactionAndRateMatchesTypeScript()
        {
            var golden=Cases();Assert.That(golden.sourceHash,Is.EqualTo(Balance.SourceHash));Assert.That(golden.cases.Length,Is.GreaterThanOrEqualTo(20));
            foreach(var c in golden.cases)
            {
                var s=c.before.ToState();var original=JsonUtility.ToJson(StateData.From(s));var cost=ScientificNumber.Zero;double seconds=0;GameState result=s;
                switch(c.action)
                {
                    case "buy":cost=Game.HardwareCost(s,Array.FindIndex(Balance.Hardware,h=>h.Id==c.id),c.amount);result=Game.Buy(s,c.id,c.amount);break;
                    case "tap":result=Game.Tap(s,c.at);break;
                    case "advance":result=Game.Advance(s,c.at);break;
                    case "train":cost=Game.TrainingCost(s,c.id);seconds=Game.TrainingWork(s,c.id);result=Game.Train(s,c.id);break;
                    case "research":int i=Game.ResearchIndex(c.id);cost=Game.ResearchCost(s,i);seconds=Game.ResearchWork(s,i)/(Game.IntroResearch(s)&&c.id=="dataGeneration"?1:Game.WorkSpeed(s,true));result=Game.Research(s,c.id);break;
                }
                result=Game.Guide(result);var expected=c.expected.ToState();
                Assert.That(JsonUtility.ToJson(StateData.From(s)),Is.EqualTo(original),c.name+" mutated input");
                Near(cost,c.quote,c.name+" quote");Assert.That(seconds,Is.EqualTo(c.seconds).Within(1e-7),c.name+" duration");
                Near(result.Credits.Subtract(s.Credits),c.creditGain,c.name+" credit gain");Near(s.Credits.Subtract(result.Credits),c.creditSpent,c.name+" payment");Near(result.Data.Subtract(s.Data),c.dataGain,c.name+" data gain");Near(s.Data.Subtract(result.Data),c.dataSpent,c.name+" data payment");
                if(c.name=="first-calculator"||c.name=="too-poor"||c.name=="first-tap")Assert.That(result.Credits.CompareTo(ScientificNumber.FromData(c.expected.credits)),Is.Zero,c.name+" exact transaction");
                Near(result.Credits,c.expected.credits,c.name+" credits");Near(result.Data,c.expected.data,c.name+" data");
                Assert.That(result.Hardware,Is.EqualTo(expected.Hardware),c.name+" hardware");Assert.That(result.Research,Is.EqualTo(expected.Research),c.name+" research");
                Assert.That(result.Quality,Is.EqualTo(expected.Quality),c.name+" quality");Assert.That(result.Efficiency,Is.EqualTo(expected.Efficiency),c.name+" efficiency");
                Assert.That(result.SavedAt,Is.EqualTo(expected.SavedAt).Within(.001),c.name+" savedAt");Assert.That(result.CritRng,Is.EqualTo(expected.CritRng),c.name+" RNG");Assert.That(result.Combo,Is.EqualTo(expected.Combo),c.name+" combo");Assert.That(result.Charge,Is.EqualTo(expected.Charge),c.name+" charge");Assert.That(result.Taps,Is.EqualTo(expected.Taps),c.name+" taps");Assert.That(result.Overdrives,Is.EqualTo(expected.Overdrives),c.name+" overdrives");Assert.That(result.ActiveUntil,Is.EqualTo(expected.ActiveUntil).Within(.001),c.name+" active");Assert.That(result.CooldownUntil,Is.EqualTo(expected.CooldownUntil).Within(.001),c.name+" cooldown");
                Assert.That(result.QualityUsed,Is.EqualTo(expected.QualityUsed),c.name);Assert.That(result.ResearchUsed,Is.EqualTo(expected.ResearchUsed),c.name);Assert.That(result.Tutorial,Is.EqualTo(expected.Tutorial),c.name+" tutorial");
                AssertJob(result.Training,expected.Training,c.name+" training");AssertJob(result.ResearchJob,expected.ResearchJob,c.name+" research job");
                Near(Game.Compute(result),c.compute,c.name+" compute");Near(Game.Users(result),c.users,c.name+" users");Near(Game.Income(result),c.income,c.name+" income");Near(Game.DataRate(result),c.dataRate,c.name+" data rate");
            }
        }
        static void AssertJob(Job a,Job b,string message){if(b==null){Assert.That(a,Is.Null,message);return;}Assert.That(a,Is.Not.Null,message);Assert.That(a.id,Is.EqualTo(b.id),message);Assert.That(a.required,Is.EqualTo(b.required).Within(1e-7),message);Assert.That(a.done,Is.EqualTo(b.done).Within(1e-6),message);Assert.That(a.intro,Is.EqualTo(b.intro),message);}
        [Test] public void SparseNumbersPreserveExactTransactionResiduals()
        {
            foreach(var c in Cases().numberCases)
            {
                var a=ScientificNumber.FromData(c.a);var b=ScientificNumber.FromData(c.b);var result=c.op=="ceil"?Game.Ceil(a):c.op=="subtract"?a.Subtract(b):c.op=="add"?a.Add(b):c.op=="multiply"?a.Multiply(b):ScientificNumber.Zero;
                Assert.That(a.CompareTo(b),Is.EqualTo(c.comparison),c.name);
                Assert.That(result.CompareTo(ScientificNumber.FromData(c.expected)),Is.Zero,c.name);
                Assert.That(ScientificNumber.FromData(result.ToData()).CompareTo(result),Is.Zero,c.name+" roundtrip");
            }
            var large=ScientificNumber.Parse("1e350");var paid=large.Subtract(ScientificNumber.One);Assert.That(paid.CompareTo(large),Is.LessThan(0));Assert.That(paid.Add(ScientificNumber.One).CompareTo(large),Is.Zero);
        }
        [Test] public void PurchasesAreAtomicAndDoNotCreateFreeHardware()
        {
            var s=Game.New(1000);s.Credits=ScientificNumber.Parse("12.589254117941675");Assert.That(Game.Buy(s,"calculator"),Is.SameAs(s));
            s.Credits=ScientificNumber.From(15);var next=Game.Buy(s,"calculator");Assert.That(next.Credits.IsZero,Is.True);Assert.That(next.Hardware[0],Is.EqualTo(1));Assert.That(s.Hardware[0],Is.Zero);
            Assert.That(Game.Buy(next,"calculator",-1),Is.SameAs(next));Assert.That(Game.Buy(next,"unknown"),Is.SameAs(next));
        }
        [Test] public void ElapsedTimeSplitsReloadsAndDuplicateResumesDoNotDuplicateRewards()
        {
            var s=Game.Buy(Game.New(1000000),"calculator");s=Game.Tap(s,s.SavedAt);s=Game.Train(s,"quality");s=Game.Research(s,"dataGeneration");
            var once=Game.Advance(s,s.SavedAt+3600000);var split=s;
            for(int i=1;i<=60;i++)split=StateData.From(Game.Advance(split,s.SavedAt+i*60000)).ToState();
            Assert.That(split.Credits.Log10(),Is.EqualTo(once.Credits.Log10()).Within(1e-10));Assert.That(split.Research,Is.EqualTo(once.Research));Assert.That(split.Quality,Is.EqualTo(once.Quality));
            Assert.That(Game.Advance(once,once.SavedAt),Is.SameAs(once));Assert.That(Game.Advance(once,once.SavedAt-1000),Is.SameAs(once));
            var capped=Game.Advance(s,s.SavedAt+2*86400000);Assert.That(capped.SavedAt,Is.EqualTo(s.SavedAt+2*86400000));Assert.That(Game.Advance(capped,capped.SavedAt),Is.SameAs(capped));
        }
        [Test] public void HundredAcceptedTapsAutomaticallyTriggerOverdriveAndCooldown()
        {
            var s=Game.New(1000000);
            for(int i=0;i<100;i++)s=Game.Tap(s,s.SavedAt+i*Balance.TapGap);
            Assert.That(s.Overdrives,Is.EqualTo(1));Assert.That(s.Charge,Is.Zero);
            var blocked=Game.Tap(s,s.LastTap+100);Assert.That(blocked,Is.SameAs(s));
            for(int i=1;i<=100;i++)s=Game.Tap(s,s.LastTap+Balance.TapGap);
            Assert.That(s.Overdrives,Is.EqualTo(1));Assert.That(s.Charge,Is.EqualTo(100));
            s=Game.Tap(s,s.CooldownUntil);Assert.That(s.Overdrives,Is.EqualTo(2));
        }
    }
    public sealed class SaveTests
    {
        string directory,path;readonly UnitySaveCodec codec=new UnitySaveCodec();
        [SetUp]public void Setup(){directory=Path.Combine(Path.GetTempPath(),"idle-unity-tests-"+Guid.NewGuid());Directory.CreateDirectory(directory);path=Path.Combine(directory,"save.json");}
        [TearDown]public void Cleanup(){Directory.Delete(directory,true);}
        [Test]public void AtomicReplaceRetainsBackupAndExactResiduals()
        {
            var store=new AtomicSaveStore(path,codec);var s=store.Load(1000).State;s.Credits=ScientificNumber.Parse("1e350").Subtract(ScientificNumber.One);store.Save(s);var first=File.ReadAllText(path);s=Game.Buy(s,"calculator");store.Save(s);
            Assert.That(File.ReadAllText(path+".backup"),Is.EqualTo(first));Assert.That(File.Exists(path+".pending"),Is.False);Assert.That(new AtomicSaveStore(path,codec).Load(1000).State.Credits.CompareTo(s.Credits),Is.Zero);
        }
        [Test]public void CorruptMainLoadsBackupReadOnlyAndPreservesOriginal()
        {
            var store=new AtomicSaveStore(path,codec);var s=store.Load(1000).State;store.Save(s);store.Save(Game.Buy(s,"calculator"));File.WriteAllText(path,"broken");
            var load=store.Load(1000);Assert.That(load.Recovered,Is.True);Assert.That(load.Writable,Is.False);Assert.Throws<InvalidOperationException>(()=>store.Save(s));Assert.That(File.ReadAllText(path),Is.EqualTo("broken"));
        }
        [Test]public void FutureVersionsDoNotFallBackOrOverwrite()
        {
            var store=new AtomicSaveStore(path,codec);var s=store.Load(1000).State;store.Save(s);store.Save(s);string future=File.ReadAllText(path).Replace("\"version\":"+AtomicSaveStore.Version,"\"version\":999");File.WriteAllText(path,future);
            var load=store.Load(1000);Assert.That(load.State,Is.Null);Assert.That(load.Writable,Is.False);Assert.Throws<InvalidOperationException>(()=>store.Save(s));Assert.That(File.ReadAllText(path),Is.EqualTo(future));
        }
        [Test]public void MissingMainWithPendingDataNeverStartsOverAutomatically()
        {
            File.WriteAllText(path+".pending","interrupted");var store=new AtomicSaveStore(path,codec);Assert.That(store.Load(1000).Writable,Is.False);Assert.That(File.ReadAllText(path+".pending"),Is.EqualTo("interrupted"));Assert.That(File.Exists(path),Is.False);
        }
        [Test]public void InterruptedPendingAlongsideValidMainRemainsReadOnly()
        {
            var store=new AtomicSaveStore(path,codec);var s=store.Load(1000).State;store.Save(s);string main=File.ReadAllText(path);File.WriteAllText(path+".pending","pending original");
            var load=store.Load(1000);Assert.That(load.State,Is.Not.Null);Assert.That(load.Writable,Is.False);Assert.Throws<InvalidOperationException>(()=>store.Save(s));Assert.That(File.ReadAllText(path),Is.EqualTo(main));Assert.That(File.ReadAllText(path+".pending"),Is.EqualTo("pending original"));
        }
        [Test]public void ExternalCorruptionBetweenLoadAndWriteIsPreserved()
        {
            var store=new AtomicSaveStore(path,codec);var s=store.Load(1000).State;store.Save(s);File.WriteAllText(path,"external broken");Assert.Catch(()=>store.Save(s));Assert.That(File.ReadAllText(path),Is.EqualTo("external broken"));
        }
        [Test]public void OfflineRewardCommitsOnceAcrossDiskReloads()
        {
            var store=new AtomicSaveStore(path,codec);var s=Game.Buy(store.Load(1000).State,"calculator");store.Save(s);
            var advanced=Game.Advance(store.Load(61000).State,61000);store.Save(advanced);
            var reloaded=Game.Advance(new AtomicSaveStore(path,codec).Load(61000).State,61000);
            Assert.That(reloaded.Credits.CompareTo(advanced.Credits),Is.Zero);Assert.That(reloaded.SavedAt,Is.EqualTo(61000));
        }
        [Test]public void MalformedStateAndNumbersAreRejected()
        {
            var dto=StateData.From(Game.New(1000));dto.hardware[0]=-1;Assert.Throws<FormatException>(()=>dto.ToState());
            Assert.Throws<FormatException>(()=>ScientificNumber.FromData(new NumberData{m=1,e=10,terms=new[]{new NumberTerm{index=0,value=1}}}));
        }
    }
}
