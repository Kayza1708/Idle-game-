using System;
using System.IO;
using System.Linq;
using NUnit.Framework;
using UnityEngine;
using IdleIntelligence.Core;
namespace IdleIntelligence.Tests
{
    [Serializable]public sealed class ItemV3Case
    {
        public string name;public bool prepared,noItems;public long[] hardware;public int[] research;
        public int quality,efficiency,integration;public ItemInstance[] inventory;public string[] equipped;
        public NumberData regularData,regularKnowledge,compute,income,data,knowledge,cycle;public double minutes,training,researchSpeed;
        public string[] nodes;public int[] axioms,models;public string active;public bool lab;public int resets,purchased;public int[] occupied;
    }
    [Serializable]public sealed class ItemV3Cases{public string sourceHash;public bool prepared,productionEnabled;public ItemV3Case[] cases;}
    public sealed class ItemSystemV3Tests
    {
        static ItemV3Cases Cases()=>JsonUtility.FromJson<ItemV3Cases>(File.ReadAllText(Path.Combine(Application.dataPath,"IdleIntelligence/Tests/EditMode/ItemV3ReferenceCases.json")));
        public static GameState State(ItemV3Case row)
        {
            var s=Game.New(1000,"prepared-v3-reference");s.Hardware=(long[])row.hardware.Clone();s.Research=(int[])row.research.Clone();s.Quality=row.quality;s.Efficiency=row.efficiency;s.Workshop.integration=row.integration;
            s.Workshop.inventory=row.inventory.Select(item=>item.Copy()).ToArray();s.Workshop.equipped=(string[])row.equipped.Clone();
            s.Workshop.nodes=(string[])row.nodes.Clone();s.Meta.axioms=(int[])row.axioms.Clone();s.Meta.models=(int[])row.models.Clone();s.Meta.resets=row.resets;s.Workshop.activeModel=row.active;s.Workshop.activeModelLevel=string.IsNullOrEmpty(row.active)?0:row.models[Array.FindIndex(MetaBalance.Models,m=>m.Id==row.active)];s.Prestige.lab=row.lab;s.Prestige.Cycle=ScientificNumber.FromData(row.cycle);
            s.Upgrades.purchasedLabs=row.purchased;foreach(var slot in row.occupied??Array.Empty<int>()){var job=new Job{id="materialAnalysis",slot=slot,required=999,key="prepared-research-"+slot};if(s.ResearchJob==null)s.ResearchJob=job;else s.Prestige.labs=s.Prestige.labs.Concat(new[]{job}).ToArray();}
            s.ItemSystemV3=new ItemV3State{dataProduced=ScientificNumber.FromData(row.regularData),knowledgeProduced=ScientificNumber.FromData(row.regularKnowledge),runMinutes=row.minutes};
            if(row.noItems)s.Challenges.Run=new ChallengeRun{id="no-items",stage=1};return s;
        }
        static void Near(ScientificNumber actual,NumberData data,string message)
        {var expected=ScientificNumber.FromData(data);if(expected.IsZero)Assert.That(actual.IsZero,Is.True,message);else Assert.That(actual.Log10(),Is.EqualTo(expected.Log10()).Within(2e-10),message);}
        [Test]public void ActualProductionConsumersMatchPreparedTypeScriptCases()
        {
            var cases=Cases();Assert.That(cases.sourceHash,Is.EqualTo(ItemV3Balance.SourceHash));Assert.That(cases.productionEnabled,Is.False);Assert.That(cases.cases.Length,Is.GreaterThanOrEqualTo(32));
            foreach(var row in cases.cases){var s=State(row);var hardware=(long[])s.Hardware.Clone();var data=s.Data;
                Near(Game.Compute(s),row.compute,row.name+" compute");Near(Game.Income(s),row.income,row.name+" income");Near(Game.DataRate(s),row.data,row.name+" data");
                Assert.That(Game.WorkSpeed(s),Is.EqualTo(row.training).Within(Math.Max(1e-9,row.training*1e-10)),row.name+" training");Assert.That(Game.WorkSpeed(s,true),Is.EqualTo(row.researchSpeed).Within(Math.Max(1e-9,row.researchSpeed*1e-10)),row.name+" research speed");Near(PrestigeRules.KnowledgeRate(s),row.knowledge,row.name+" knowledge");
                Near(Game.Compute(s.Copy()),row.compute,row.name+" copied state");Assert.That(s.Hardware,Is.EqualTo(hardware),row.name+" pure hardware");Assert.That(s.Data,Is.SameAs(data));
            }
        }
        [Test]public void AxiomDiscoveryAndFirstManualResetAreDomainGuards()
        {
            var s=State(Cases().cases[0]);s.Meta.available=ScientificNumber.From(100).ToData();
            Assert.That(MetaRules.Buy(s,"A01"),Is.SameAs(s));
            s.SavedAt=2000000;s.ItemSystemV3.axiomDiscovered=true;s.ItemSystemV3.axiomDiscoveryAt=1000;
            s.Prestige.Cycle=ScientificNumber.Parse("1e12");s.Prestige.known=PrestigeBalance.Nodes.Take(30).Select(n=>n.Id).ToArray();
            s.Meta.axioms[Array.FindIndex(MetaBalance.Axioms,n=>n.Id=="B06")]=1;s.Meta.axiomAuto=true;s.Meta.cycleStartedAt=0;
            Assert.That(MetaRules.Reward(s).CompareTo(ScientificNumber.One),Is.GreaterThanOrEqualTo(0));
            Assert.That(PrestigeAutomation.Agent(s).Meta.resets,Is.Zero);
            var manual=MetaRules.AxiomReset(s);Assert.That(manual.Meta.resets,Is.EqualTo(1));
            manual.SavedAt+=2000000;manual.Prestige.Cycle=ScientificNumber.Parse("1e12");
            Assert.That(PrestigeAutomation.Agent(manual).Meta.resets,Is.EqualTo(2));
        }
        [Test]public void IntegrationAndResearchCostsUseCentralV3Values()
        {
            var s=State(Cases().cases[0]);s.Workshop.nodes=Array.Empty<string>();
            int research=Game.ResearchIndex("materialAnalysis");var old=Game.ResearchCost(s,research);
            s.ResearchJob=new Job{id="materialAnalysis",key="paid-before-upgrade",paidDataRecorded=true,paidData=old.ToData(),required=200};
            s.Workshop.nodes=new[]{"F07"};Assert.That(Game.ResearchCost(s,research).ToDouble(),Is.EqualTo(Math.Ceiling(old.ToDouble()*.7)));
            Assert.That(ScientificNumber.FromData(s.ResearchJob.paidData).CompareTo(old),Is.Zero);
            s.Meta.axioms[Array.FindIndex(MetaBalance.Axioms,n=>n.Id=="A05")]=3;Assert.That(MetaRules.IntegrationLimit(s),Is.EqualTo(275));
        }
        [Test]public void RealAdvanceRecordsCreditedProductionAndReloadCannotRepeatIt()
        {
            var s=State(Cases().cases.First(row=>row.name=="entropy-sink-0"));s.Prestige.lab=true;s.Prestige.Cycle=s.Prestige.Free=s.Prestige.Total=s.Prestige.Entitlement=ScientificNumber.From(1000);double end=s.SavedAt+30000;
            var measured=Game.AdvanceMeasured(s,end,true);var next=measured.State;
            Assert.That(next.ItemSystemV3.dataProduced.CompareTo(next.Data.Subtract(s.Data)),Is.Zero);
            Assert.That(next.ItemSystemV3.knowledgeProduced.CompareTo(measured.Report.Insight),Is.Zero);
            Assert.That(next.ItemSystemV3.knowledgeProduced.IsZero,Is.False);Assert.That(ScientificNumber.FromData(next.Prestige.knowledge).CompareTo(next.ItemSystemV3.knowledgeProduced),Is.GreaterThan(0),"lab seed is a grant, not regular production");
            Assert.That(next.ItemSystemV3.runMinutes,Is.EqualTo(.5).Within(1e-12));
            var repeated=Game.Advance(next,end,true);Assert.That(repeated.ItemSystemV3.runMinutes,Is.EqualTo(next.ItemSystemV3.runMinutes));
            Assert.That(repeated.ItemSystemV3.dataProduced.CompareTo(next.ItemSystemV3.dataProduced),Is.Zero);
            var offline=Game.Advance(s,s.SavedAt+86400000);Assert.That(offline.ItemSystemV3.runMinutes,Is.EqualTo(Game.OfflineLimit(s)/60).Within(1e-8));
            var copy=next.Copy();ItemSystemV3.ResetProduction(copy);Assert.That(copy.ItemSystemV3.dataProduced.IsZero,Is.True);Assert.That(copy.ItemSystemV3.knowledgeProduced.CompareTo(next.ItemSystemV3.knowledgeProduced),Is.Zero);
            ItemSystemV3.ResetProduction(copy,true);Assert.That(copy.ItemSystemV3.knowledgeProduced.IsZero,Is.True);Assert.That(next.ItemSystemV3.runMinutes,Is.EqualTo(.5));
        }
        [Test]public void DevelopmentStateCannotSilentlySaveOrAlterExistingNativeState()
        {
            Assert.That(Game.New(0).ItemSystemV3,Is.Null);var s=State(Cases().cases[0]);Assert.Throws<NotSupportedException>(()=>StateData.From(s));
            s.ItemSystemV3=null;Assert.That(StateData.From(s),Is.Not.Null);
        }
        [Test]public void StrengthScientificSoftcapAndLensHandleBoundaries()
        {
            var item=new ItemInstance{type="quantum-chip",rarity=5,level=69,forge=20};Assert.That(ItemSystemV3.Strength(item),Is.EqualTo(3.7632).Within(1e-12));Assert.That(Math.Sqrt(ItemSystemV3.Strength(item)),Is.EqualTo(1.9398969045).Within(1e-9));
            item.level=0;Assert.Throws<ArgumentOutOfRangeException>(()=>ItemSystemV3.Strength(item));item.level=1;item.forge=-1;Assert.Throws<ArgumentOutOfRangeException>(()=>ItemSystemV3.Strength(item));
            Assert.Throws<ArgumentOutOfRangeException>(()=>ItemSystemV3.Softcap(ScientificNumber.One,-1));
            Assert.That(ItemSystemV3.Softcap(ScientificNumber.From(240),240).ToDouble(),Is.EqualTo(240));Assert.That(ItemSystemV3.Softcap(ScientificNumber.Parse("1e1000"),240).Log10(),Is.EqualTo(501.1901056208558).Within(1e-9));
            var common=new ItemInstance{type="quantum-chip",rarity=0,level=1};Assert.That(ItemSystemV3.Lens(ScientificNumber.Parse("1e1000"),common).Log10(),Is.EqualTo(20).Within(1e-12));
        }
    }
}
