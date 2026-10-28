using System;
using System.IO;
using IdleIntelligence.Core;
using IdleIntelligence.Runtime;
using NUnit.Framework;
using UnityEngine;
namespace IdleIntelligence.Tests
{
    [Serializable] public sealed class AnalysisGuideCases { public AnalysisGuideCase[] rows; }
    [Serializable] public sealed class AnalysisGuideCase { public string name,node,guide,text;public bool axiom,automatic;public StoryState story;public double credits,data;public int items; }
    public sealed class AnalysisGuideTests
    {
        [Test] public void GuidanceUnlocksAndManualAccessMatchEightActualTypeScriptCases()
        {
            var fixture=JsonUtility.FromJson<AnalysisGuideCases>(File.ReadAllText(Path.Combine(Application.dataPath,"IdleIntelligence/Tests/EditMode/AnalysisGuideReference.json")));
            Assert.That(fixture.rows.Length,Is.EqualTo(8));
            foreach(var row in fixture.rows)
            {
                var before=Game.New(1000000);before.Retention.aiName="AURA";before.Story=StoryState.Migrated();
                var s=before.Copy();if(!string.IsNullOrEmpty(row.node))s.Workshop.nodes=new[]{row.node};if(row.axiom)s.Meta.axioms[Array.FindIndex(MetaBalance.Axioms,a=>a.Id=="C02")]=1;
                if(row.automatic)s=NarrativeBridge.Sync(before,s);if(!string.IsNullOrEmpty(row.guide))s=NarrativeBridge.Action(s,"guide",row.guide);
                Assert.That(s.Story.open??"",Is.EqualTo(row.story.open??""),row.name);Assert.That(s.Story.queue,Is.EqualTo(row.story.queue),row.name);Assert.That(s.Story.seen,Is.EqualTo(row.story.seen),row.name);
                Assert.That(s.Credits.ToDouble(),Is.EqualTo(row.credits));Assert.That(s.Data.ToDouble(),Is.EqualTo(row.data));Assert.That(s.Workshop.inventory.Length,Is.EqualTo(row.items));
                if(s.Story.open!=null)Assert.That(NarrativeBridge.Text(s,s.Story.open),Is.EqualTo(row.text),row.name);
            }
        }
        [Test] public void ActualNodePurchaseSavesGuidanceAndSeenStateWithoutRepeatAfterReload()
        {
            var s=Game.New(1000000);s.Retention.aiName="AURA";s.Story=StoryState.Migrated();s.Prestige.Total=s.Prestige.Free=s.Prestige.Cycle=s.Prestige.Entitlement=ScientificNumber.From(1e7);
            s=NarrativeBridge.Sync(s,PrestigeRules.Buy(s,"F02"));Assert.That(s.Story.open,Is.EqualTo("analysis-queue"));
            var directory=Path.Combine(Path.GetTempPath(),"idle-guide-save-"+Guid.NewGuid());Directory.CreateDirectory(directory);
            var store=new AtomicSaveStore(Path.Combine(directory,"save.json"),new UnitySaveCodec());store.Load(s.SavedAt);store.Save(s);var reloaded=store.Load(s.SavedAt);Assert.That(reloaded.Writable,Is.True,reloaded.Message);
            Assert.That(reloaded.State.Story.open,Is.EqualTo("analysis-queue"));Assert.That(reloaded.State.Story.queue,Is.EqualTo(new[]{"analysis-budget"}));
            var continued=NarrativeBridge.Action(NarrativeBridge.Action(reloaded.State,"continue"),"continue");
            var next=NarrativeBridge.Sync(continued,continued.Copy());Assert.That(next.Story.open,Is.Null);Assert.That(next.Story.seen,Does.Contain("analysis-budget"));Assert.That(next.Credits.CompareTo(s.Credits),Is.Zero);
        }
    }
}
