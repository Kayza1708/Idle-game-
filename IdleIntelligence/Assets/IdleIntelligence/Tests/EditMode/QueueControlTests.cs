using System;
using System.IO;
using System.Linq;
using IdleIntelligence.Core;
using IdleIntelligence.Runtime;
using NUnit.Framework;
using UnityEngine;
namespace IdleIntelligence.Tests
{
    [Serializable]public sealed class QueueWire{public TrainingTarget[] training;public string[] research;}
    [Serializable]public sealed class QueueControlCase{public string name,signature,action;public bool training,changed;public int index;public QueueWire before,expected;}
    [Serializable]public sealed class QueueControlCases{public string sourceHash;public QueueControlCase[] cases;}
    public sealed class QueueControlTests
    {
        [Test]public void UnpaidPlanTransactionsMatchAllTypeScriptReferences()
        {
            var rows=JsonUtility.FromJson<QueueControlCases>(File.ReadAllText(Path.Combine(Application.dataPath,"IdleIntelligence/Tests/EditMode/QueueControlCases.json")));Assert.That(rows.cases.Length,Is.EqualTo(20));
            foreach(var row in rows.cases){var s=Game.New(1000);s.Workshop.nodes=new[]{"T03","F02"};s.Prestige.trainingQueue=row.before.training.Select(j=>new TrainingTarget{track=j.track,level=j.level}).ToArray();s.Prestige.researchQueue=(string[])row.before.research.Clone();var before=JsonUtility.ToJson(StateData.From(s));
                var result=QueueControls.Change(s,row.training,row.signature,row.index,row.action);Assert.That(ReferenceEquals(result,s),Is.EqualTo(!row.changed),row.name);Assert.That(result.Prestige.trainingQueue.Select(j=>j.track+":"+j.level),Is.EqualTo(row.expected.training.Select(j=>j.track+":"+j.level)),row.name);Assert.That(result.Prestige.researchQueue,Is.EqualTo(row.expected.research),row.name);Assert.That(result.Credits,Is.SameAs(s.Credits),row.name);Assert.That(result.Data,Is.SameAs(s.Data),row.name);Assert.That(JsonUtility.ToJson(StateData.From(s)),Is.EqualTo(before),row.name+" purity");
            }
        }
        [Test]public void StalePlanCannotRemoveTheNextEntryAndOrderSurvivesNativeSave()
        {
            var s=Game.New(1000);s.Workshop.nodes=new[]{"F02"};s.Prestige.researchQueue=new[]{"dataGeneration","computeOptimization","userScaling"};string ticket=QueueControls.Signature(s,false);var next=QueueControls.Change(s,false,ticket,0,"remove");Assert.That(QueueControls.Change(next,false,ticket,0,"remove"),Is.SameAs(next));
            string directory=Path.Combine(Path.GetTempPath(),"idle-queue-control-"+Guid.NewGuid());Directory.CreateDirectory(directory);try{string path=Path.Combine(directory,"save.json");var store=new AtomicSaveStore(path,new UnitySaveCodec());Assert.That(store.Load(1000).Writable,Is.True);store.Save(next);var loaded=new AtomicSaveStore(path,new UnitySaveCodec()).Load(1000);Assert.That(loaded.Writable,Is.True,loaded.Message);Assert.That(loaded.State.Prestige.researchQueue,Is.EqualTo(next.Prestige.researchQueue));}finally{Directory.Delete(directory,true);}
        }
    }
}
