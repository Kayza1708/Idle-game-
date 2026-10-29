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
        public string name,legacy;public bool prepared,noItems;public long[] hardware;public int[] research;
        public int quality,efficiency,integration;public ItemInstance[] inventory;public string[] equipped;
        public NumberData regularData,regularKnowledge,compute,income,data,knowledge,cycle;public double minutes,training,researchSpeed;
        public string[] nodes;public int[] axioms,models;public string active;public bool lab;public int resets,purchased;public int[] occupied;
    }
    [Serializable]public sealed class ArchiveV3Case
    {
        public string name;public bool prepared,v3,research,currentRight,knownRight,legacyRight,retainedRight,owned,funded;
        public int price,fragmentsAfter;public bool prerequisite,canLearn,learnedAfter,doubleLearnSame;
        public NumberData dataBefore,dataAfter,paidData;public long[] componentsBefore,componentsAfter,modulesBefore,modulesAfter;public string[] typesAfter;
    }
    [Serializable]public sealed class LearningV3Initial{public int quality;public bool intro;public ItemInstance[] inventory;public string[] equipped;}
    [Serializable]public sealed class LearningV3Step
    {
        public string action,track,lastTrack,jobId,cause;public double seconds,savedAt,workSpeed;public int quality,efficiency,integration,series,gems,prestiges,axioms;
        public long nextSequence,settledSequence;public NumberData credits,data,creditDebit,dataDebit;
    }
    [Serializable]public sealed class LearningV3Flow{public string name;public bool prepared;public LearningV3Initial initial;public LearningV3Step[] steps;}
    [Serializable]public sealed class TrainingAutomationV3Case
    {public string name,manual,track,jobId;public bool original,done,prepared;public int quality,efficiency,integration,target,remainingPlans;public NumberData protectedResearch,creditDebit,dataDebit;}
    [Serializable]public sealed class ItemV3Cases{public string sourceHash;public bool prepared,productionEnabled;public ItemV3Case[] cases;public ArchiveV3Case[] archiveCases;public LearningV3Flow[] learningFlows;public TrainingAutomationV3Case[] trainingAutomationCases;}
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
            if(!string.IsNullOrEmpty(row.legacy)){var n=ScientificNumber.Parse(row.legacy).ToData();s.Legacy.cycle=new[]{new LegacyFactor{key="item:compute",value=n},new LegacyFactor{key="item:credits",value=n}};s.Legacy.permanent=s.Legacy.cycle.Select(f=>f.Copy()).ToArray();}
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
        [Test]public void ActualArchiveOwnershipAndCraftPaymentsMatchTypeScript()
        {
            var cases=Cases();Assert.That(cases.archiveCases.Length,Is.EqualTo(11));
            foreach(var row in cases.archiveCases){
                var s=Game.New(1000,"prepared-archive-reference");if(row.v3)s.ItemSystemV3=new ItemV3State{archiveBlueprintRight=row.legacyRight||row.retainedRight};
                s.Workshop.nodes=row.currentRight?new[]{"I04"}:Array.Empty<string>();s.Prestige.known=row.knownRight?new[]{"I04"}:Array.Empty<string>();
                if(row.research)s.Research[Game.ResearchIndex("blueprints")]=1;int index=Workshop.Index("insight-archive");s.Workshop.learned[index]=row.owned;
                s.Data=ScientificNumber.FromData(row.dataBefore);s.Workshop.components=(long[])row.componentsBefore.Clone();s.Workshop.modules=(long[])row.modulesBefore.Clone();s.Workshop.fragments=0;
                Assert.That(ItemBalance.Items[index].BlueprintPrice,Is.EqualTo(row.price),row.name+" price");
                Assert.That(Workshop.Prerequisite(s,index),Is.EqualTo(row.prerequisite),row.name+" prerequisite");
                Assert.That(Workshop.LearnBlock(s,index)==null,Is.EqualTo(row.canLearn),row.name+" learnable");
                var learned=Workshop.Learn(s,"insight-archive");Assert.That(learned.Workshop.learned[index],Is.EqualTo(row.learnedAfter),row.name+" ownership");
                Assert.That(ReferenceEquals(Workshop.Learn(learned,"insight-archive"),learned),Is.EqualTo(row.doubleLearnSame),row.name+" duplicate");
                Assert.That(learned.Workshop.inventory,Is.Empty,row.name+" learning does not grant an item");
                var made=row.funded?Workshop.Craft(learned,"insight-archive"):learned;
                Near(s.Data.Subtract(made.Data),row.paidData,row.name+" actual debit");Near(made.Data,row.dataAfter,row.name+" data");
                Assert.That(made.Workshop.components,Is.EqualTo(row.componentsAfter),row.name+" materials");Assert.That(made.Workshop.modules,Is.EqualTo(row.modulesAfter),row.name+" modules");
                Assert.That(made.Workshop.fragments,Is.EqualTo(row.fragmentsAfter),row.name+" fragments");Assert.That(made.Workshop.inventory.Select(i=>i.type).ToArray(),Is.EqualTo(row.typesAfter),row.name+" actual item");
            }
        }
        [Test]public void ActualPaidLearningFlowsAndResetReceiptsMatchTypeScript()
        {
            var cases=Cases();Assert.That(cases.learningFlows.Length,Is.EqualTo(6));
            foreach(var flow in cases.learningFlows){
                var s=Game.New(1000,"prepared-learning-reference",true);s.ItemSystemV3=new ItemV3State();s.Quality=flow.initial.quality;s.Credits=s.Data=ScientificNumber.From(1e12);s.Retention.gems=1000;s.Workshop.nodes=new[]{"T04"};
                s.Workshop.inventory=flow.initial.inventory.Select(i=>i.Copy()).ToArray();s.Workshop.equipped=(string[])flow.initial.equipped.Clone();if(flow.initial.intro){s.Story.legacyIntro=false;s.Story.tutorial="active";s.Story.target="training";}
                foreach(var step in flow.steps){var beforeCredits=s.Credits;var beforeData=s.Data;
                    switch(step.action){
                        case "start":s=Game.Train(s,step.track);break;
                        case "finish":s=Game.Advance(s,s.SavedAt+step.seconds*1000);break;
                        case "bonus":s=GemShop.Buy(s,"training-15m");break;
                        case "unequip":s=s.Copy();s.Workshop.equipped=new string[ItemBalance.Slots.Length];break;
                        case "equip":s=Workshop.Equip(s,s.Workshop.inventory[0].id);break;
                        case "prestige":s=s.Copy();s.Prestige.Entitlement=ScientificNumber.From(100);s=PrestigeRules.Reset(s);break;
                        case "axiom":s=s.Copy();s.Prestige.Cycle=s.Prestige.Free=s.Prestige.Total=s.Prestige.Entitlement=ScientificNumber.Parse("1e12");s.Prestige.known=PrestigeBalance.Nodes.Take(30).Select(n=>n.Id).ToArray();s.ItemSystemV3.axiomDiscovered=true;s.ItemSystemV3.axiomDiscoveryAt=1000;s=MetaRules.AxiomReset(s);break;
                        default:Assert.Fail("Unknown source learning action "+step.action);break;
                    }
                    string at=flow.name+" "+step.action;var v=s.ItemSystemV3;
                    if(step.action=="start")Assert.That(s.Journal.recent.Last(e=>e.type=="training-start").job,Is.EqualTo(step.jobId),at+" start evidence");if(step.action=="finish"||step.action=="bonus")Assert.That(s.Journal.recent.Last(e=>e.type=="training-complete").job,Is.EqualTo("v3-training-"+step.settledSequence),at+" completion evidence");
                    Assert.That(v.learningStreak,Is.EqualTo(step.series),at+" series");Assert.That(v.lastLearningTrack??"",Is.EqualTo(step.lastTrack),at+" track");
                    Assert.That(v.lastTrainingCompletionCause??"",Is.EqualTo(step.cause),at+" cause");Assert.That(v.nextTrainingSequence,Is.EqualTo(step.nextSequence),at+" next ID");Assert.That(v.lastCompletedTrainingSequence,Is.EqualTo(step.settledSequence),at+" settled ID");Assert.That(s.Training?.key??"",Is.EqualTo(step.jobId),at+" live ID");
                    Assert.That(s.Quality,Is.EqualTo(step.quality),at+" quality");Assert.That(s.Efficiency,Is.EqualTo(step.efficiency),at+" efficiency");Assert.That(s.Workshop.integration,Is.EqualTo(step.integration),at+" integration");
                    Assert.That(Game.WorkSpeed(s),Is.EqualTo(step.workSpeed).Within(Math.Max(1e-10,step.workSpeed*1e-10)),at+" actual speed");
                    Near(beforeCredits.Subtract(s.Credits),step.creditDebit,at+" paid Credits");Near(beforeData.Subtract(s.Data),step.dataDebit,at+" paid data");Near(s.Credits,step.credits,at+" Credits");Near(s.Data,step.data,at+" data");
                    Assert.That(s.Retention.gems,Is.EqualTo(step.gems),at+" Gems");Assert.That(s.Prestige.resets,Is.EqualTo(step.prestiges),at+" prestiges");Assert.That(s.Meta.resets,Is.EqualTo(step.axioms),at+" axioms");Assert.That(s.SavedAt,Is.EqualTo(step.savedAt).Within(1e-6),at+" time");
                }
            }
        }
        [Test]public void TrainingReceiptRejectsPrematureMalformedDuplicateAndForbiddenTriggers()
        {
            var initial=Cases().learningFlows[0].initial;var s=Game.New(1000,"prepared-learning-receipt",true);s.ItemSystemV3=new ItemV3State();s.Quality=1;s.Credits=s.Data=ScientificNumber.From(1e12);s.Workshop.inventory=initial.inventory.Select(i=>i.Copy()).ToArray();s.Workshop.equipped=(string[])initial.equipped.Clone();s=Game.Train(s,"quality");
            ItemSystemV3.CompleteTraining(s,true);Assert.That(s.ItemSystemV3.lastCompletedTrainingSequence,Is.Zero,"premature");
            foreach(var key in new[]{null,"old-contract","v3-training-01","v3-training-2","v3-training-9007199254740992"}){var bad=s.Copy();bad.Training.done=bad.Training.required;bad.Training.key=key;ItemSystemV3.CompleteTraining(bad,true);Assert.That(bad.ItemSystemV3.learningStreak,Is.Zero,key);Assert.That(bad.ItemSystemV3.lastCompletedTrainingSequence,Is.Zero,key);}
            var done=s.Copy();done.Training.done=done.Training.required;ItemSystemV3.CompleteTraining(done,true);ItemSystemV3.CompleteTraining(done,true);Assert.That(done.ItemSystemV3.learningStreak,Is.EqualTo(1));Assert.That(s.ItemSystemV3.learningStreak,Is.Zero,"copied state");
            var forbidden=s.Copy();forbidden.Training.done=forbidden.Training.required;forbidden.Challenges.Run=new ChallengeRun{id="no-items",stage=1};ItemSystemV3.CompleteTraining(forbidden,true);Assert.That(forbidden.ItemSystemV3.learningStreak,Is.Zero);Assert.That(forbidden.ItemSystemV3.lastCompletedTrainingSequence,Is.EqualTo(1));
        }
        [Test]public void DevelopmentStateCannotSilentlySaveOrAlterExistingNativeState()
        {
            Assert.That(Game.New(0).ItemSystemV3,Is.Null);var s=State(Cases().cases[0]);Assert.Throws<NotSupportedException>(()=>StateData.From(s));
            s.ItemSystemV3=null;Assert.That(StateData.From(s),Is.Not.Null);
        }
        [Test]public void ActualTrainingAutomationAndReservesMatchSource()
        {
            var rows=Cases().trainingAutomationCases;Assert.That(rows.Length,Is.EqualTo(8));foreach(var row in rows){
                var s=Game.New(1000,"prepared-training-automation");s.Quality=row.quality;s.Efficiency=row.efficiency;s.Workshop.integration=row.integration;s.Workshop.nodes=new[]{"T03","T04","T06"};s.Credits=ScientificNumber.From(1e12);s.Data=ScientificNumber.From(1e12);s.Prestige.trainingAuto=true;s.Prestige.trainingTargets=new[]{row.done?row.quality:0,row.done?row.efficiency:0,row.target};if(!row.original)s.ItemSystemV3=new ItemV3State();
                if(!string.IsNullOrEmpty(row.manual))s.Prestige.trainingQueue=new[]{new TrainingTarget{track=row.manual,level=(row.manual=="integration"?row.integration:row.efficiency)+1}};
                Near(PrestigeAutomation.ProtectedData(s),row.protectedResearch,row.name+" protected data");var beforeCredits=s.Credits;var beforeData=s.Data;var after=PrestigeAutomation.StartJobs(s);
                Assert.That(after.Training?.id??"",Is.EqualTo(row.track),row.name+" track");Assert.That(after.Training?.key??"",Is.EqualTo(row.jobId),row.name+" job receipt");Assert.That(after.Prestige.trainingQueue.Length,Is.EqualTo(row.remainingPlans),row.name+" manual plan count");Near(beforeCredits.Subtract(after.Credits),row.creditDebit,row.name+" paid credits");Near(beforeData.Subtract(after.Data),row.dataDebit,row.name+" paid data");
            }
        }
        [Test]public void AutomationTargetLabelsAreLocalizedAndDescribeTheActiveContract()
        {
            var s=Game.New(1000);foreach(var language in new[]{"de","en","es","fr","pt","it","pl"}){s.Settings.language=language;var normal=IdleIntelligence.Runtime.PrestigeSettings.TrainingTargetLabel(s,2);s.ItemSystemV3=new ItemV3State();var explicitOnly=IdleIntelligence.Runtime.PrestigeSettings.TrainingTargetLabel(s,2);Assert.That(explicitOnly,Is.Not.EqualTo(normal),language);Assert.That(explicitOnly,Does.Contain("0 ="),language);Assert.That(explicitOnly,Does.Not.Contain("integration Ziellevel"),language);for(int i=0;i<2;i++)Assert.That(IdleIntelligence.Runtime.PrestigeSettings.TrainingTargetLabel(s,i),Does.Contain("0 ="),language);s.ItemSystemV3=null;}
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
