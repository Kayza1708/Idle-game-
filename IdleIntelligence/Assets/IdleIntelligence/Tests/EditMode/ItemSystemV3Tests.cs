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
        public int quality,efficiency,integration;public int[] mastery;public string[] unknownMastery;public ItemInstance[] inventory;public string[] equipped;
        public NumberData intIncome,regularData,regularKnowledge,compute,income,data,knowledge,cycle;public double minutes,training,researchSpeed;
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
    [Serializable]public sealed class ComponentV3Step{public string action;public int amount,gems,prestiges,axioms;public string synthesisReceipt,synthesisComponent;public double[] synthesisRemainders;public long scannerAnalyses;public double synthesisMultiplier,synthesisSpeed,fabricationSpeed,analysisSpeed,seconds,at;public NumberData intIncome,cycleINT,freeINT,counter,credits,data,axiomFunds,totalINT;public long[] components;public bool analysis,synthesis,pending;}
    [Serializable]public sealed class ComponentV3Flow{public string name;public bool v3,prepared;public int C01,C06,W08;public ComponentV3Step[] steps;}
    [Serializable]public sealed class V3CounterWire
    {
        public NumberData dataProduced,knowledgeProduced,componentsProduced;public bool hasOverdrive;public double overdriveStarted,burstUntil,burstCredits,burstData;public double runMinutes,discoveryAt,synthesisMultiplier;public long nextTrainingSequence,lastCompletedTrainingSequence,scannerAnalyses;public int learningStreak;public string lastTrack,cause,synthesisKey,synthesisComponent;public bool archiveRight,discovered;public double[] synthesisRemainders;
    }
    [Serializable]public sealed class ChallengeV3Step
    {
        public bool hasMain,active;public string action,track,scope,trainingKey,mainTrainingKey,mainSynthesisKey;public V3CounterWire current,main;public NumberData credits,data,intIncome,totalINT,cycleINT,freeINT,compute,income,mainCredits,mainData;public double at,seconds,trainingDone,trainingRequired,trainingSpeed,mainAt,mainTrainingDone,mainSynthesisDone;public int[] levels,records,cycleRecords;public int stars,stage,resets,axioms,slots;public long[] components;public int amount;
    }
    [Serializable]public sealed class ChallengeV3Flow{public string name,id,initialCase;public bool prepared;public ChallengeV3Step[] steps;}
    [Serializable]public sealed class RelayV3Step{public string action;public double now,until,cooldown;public bool accepted;public V3CounterWire current;public NumberData quote,basic,gain,credits;public long[] counts;public string[] equipped;public uint rng;public int combo,charge;}
    [Serializable]public sealed class RelayV3Flow{public string name,initialCase,scope;public bool prepared,v3,temporary;public uint seed;public RelayV3Step[] steps;}
    [Serializable]public sealed class OverdriveV3Step{public string action,slot;public bool active;public double at,seconds,until,cooldown,fraction;public int activations;public V3CounterWire current;public NumberData credits,data,income,regularIncome,dataRate,compute;public string[] equipped;}
    [Serializable]public sealed class OverdriveV3Flow{public string name,initialCase;public bool prepared;public OverdriveV3Step[] steps;}
    [Serializable]public sealed class HardwarePackageV3Case{public string mode,hardware;public int threshold;public bool prepared;public long[] components;public double[] remainders;public NumberData counter;}
    [Serializable]public sealed class ItemV3Cases{public string sourceHash;public bool prepared,productionEnabled;public ItemV3Case[] cases;public ArchiveV3Case[] archiveCases;public LearningV3Flow[] learningFlows;public TrainingAutomationV3Case[] trainingAutomationCases;public ComponentV3Flow[] componentFlows;public ChallengeV3Flow[] challengeFlows;public RelayV3Flow[] relayFlows;public OverdriveV3Flow[] overdriveFlows;public HardwarePackageV3Case[] hardwarePackageCases;}
    public sealed class ItemSystemV3Tests
    {
        static ItemV3Cases Cases()=>JsonUtility.FromJson<ItemV3Cases>(File.ReadAllText(Path.Combine(Application.dataPath,"IdleIntelligence/Tests/EditMode/ItemV3ReferenceCases.json")));
        public static GameState State(ItemV3Case row)
        {
            var s=Game.New(1000,"prepared-v3-reference");s.Hardware=(long[])row.hardware.Clone();s.Research=(int[])row.research.Clone();s.Quality=row.quality;s.Efficiency=row.efficiency;s.Workshop.integration=row.integration;
            s.Workshop.mastery=(int[])row.mastery.Clone();s.Workshop.inventory=row.inventory.Select(item=>item.Copy()).ToArray();s.Workshop.equipped=(string[])row.equipped.Clone();
            s.Workshop.nodes=(string[])row.nodes.Clone();s.Meta.axioms=(int[])row.axioms.Clone();s.Meta.models=(int[])row.models.Clone();s.Meta.resets=row.resets;s.Workshop.activeModel=row.active;s.Workshop.activeModelLevel=string.IsNullOrEmpty(row.active)?0:row.models[Array.FindIndex(MetaBalance.Models,m=>m.Id==row.active)];s.Prestige.lab=row.lab;s.Prestige.Cycle=ScientificNumber.FromData(row.cycle);
            s.Upgrades.purchasedLabs=row.purchased;foreach(var slot in row.occupied??Array.Empty<int>()){var job=new Job{id="materialAnalysis",slot=slot,required=999,key="prepared-research-"+slot};if(s.ResearchJob==null)s.ResearchJob=job;else s.Prestige.labs=s.Prestige.labs.Concat(new[]{job}).ToArray();}
            s.ItemSystemV3=new ItemV3State{dataProduced=ScientificNumber.FromData(row.regularData),knowledgeProduced=ScientificNumber.FromData(row.regularKnowledge),runMinutes=row.minutes};
            if(!string.IsNullOrEmpty(row.legacy)){var n=ScientificNumber.Parse(row.legacy).ToData();s.Legacy.cycle=new[]{new LegacyFactor{key="item:compute",value=n},new LegacyFactor{key="item:credits",value=n}};s.Legacy.permanent=s.Legacy.cycle.Select(f=>f.Copy()).ToArray();}
            if(row.noItems)s.Challenges.Run=new ChallengeRun{id="no-items",stage=1};return s;
        }
        static GameState FundAxiomReference(GameState state,bool pending=false)
        {
            var s=state.Copy();var cycle=ScientificNumber.Parse("1e12");s.Prestige.Total=s.Prestige.Total.Add(cycle.Subtract(s.Prestige.Cycle));s.Prestige.Cycle=cycle;s.Prestige.Free=cycle.Subtract(s.Prestige.Spent);s.Prestige.Entitlement=cycle.Times(pending?2:1);s.Prestige.known=PrestigeBalance.Nodes.Take(30).Select(n=>n.Id).ToArray();s.ItemSystemV3.axiomDiscovered=true;s.ItemSystemV3.axiomDiscoveryAt=1000;return s;
        }
        static void Near(ScientificNumber actual,NumberData data,string message)
        {var expected=ScientificNumber.FromData(data);if(expected.IsZero)Assert.That(actual.IsZero,Is.True,message);else Assert.That(actual.Log10(),Is.EqualTo(expected.Log10()).Within(2e-10),message);}
        [Test]public void ActualProductionConsumersMatchPreparedTypeScriptCases()
        {
            var cases=Cases();Assert.That(cases.sourceHash,Is.EqualTo(ItemV3Balance.SourceHash));Assert.That(cases.productionEnabled,Is.False);Assert.That(cases.cases.Length,Is.GreaterThanOrEqualTo(32));
            foreach(var row in cases.cases){var s=State(row);var hardware=(long[])s.Hardware.Clone();var data=s.Data;
                Near(Game.Compute(s),row.compute,row.name+" compute");Near(Game.Income(s),row.income,row.name+" income");Near(PrestigeRules.CreditFactor(s),row.intIncome,row.name+" linear earned-INT income");Near(Game.DataRate(s),row.data,row.name+" data");
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
                        case "prestige":s=s.Copy();s.Prestige.Entitlement=s.Prestige.Cycle.Add(ScientificNumber.From(100));s=PrestigeRules.Reset(s);break;
                        case "axiom":s=MetaRules.AxiomReset(FundAxiomReference(s));break;
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
        [Test]public void ActualComponentProductionAndResetFlowsMatchSource()
        {
            var flows=Cases().componentFlows;Assert.That(flows.Length,Is.EqualTo(32));foreach(var flow in flows){
                var s=Game.New(1000,"prepared-component-reference");s.Credits=s.Data=ScientificNumber.From(1e12);s.Retention.gems=1000;if(flow.v3)s.ItemSystemV3=new ItemV3State();if(flow.C01>0||flow.C06>0){s.Meta.resets=1;s.Meta.total=s.Meta.available=ScientificNumber.From(1000).ToData();s.ItemSystemV3.axiomDiscovered=true;s.ItemSystemV3.axiomDiscoveryAt=1000;for(int i=0;i<flow.C01;i++){var before=s;s=MetaRules.Buy(s,"C01");Assert.That(s,Is.Not.SameAs(before),"prepared paid C01 purchase");}for(int i=0;i<flow.C06;i++){var before=s;s=MetaRules.Buy(s,"C06");Assert.That(s,Is.Not.SameAs(before),"prepared paid C06 purchase");}}
                if(flow.W08>0){s=FundAxiomReference(s);if(flow.W08==1)s=PrestigeRules.Buy(s,"W08");}
                foreach(var step in flow.steps){switch(step.action){
                    case "seed-rests":s=s.Copy();s.Workshop.hardwareRemainders=Enumerable.Repeat(.25,ItemBalance.ComponentIds.Length).ToArray();break;
                    case "diagnostic-equip":case "boot-maximum":s=PreparedHardwareItems(s,step.action=="boot-maximum");break;
                    case "diagnostic-unequip":s=Workshop.Unequip(s,"research");break;
                    case "duplicate-package":s=s.Copy();Workshop.PaidHardware(s,0,24);break;
                    case "buy-W08":s=PrestigeRules.Buy(s,"W08");break;
                    case "buy-C06":s=MetaRules.Buy(s,"C06");break;
                    case "scanner-equip":var scanner=s.Workshop.inventory.FirstOrDefault(i=>i.type=="field-scanner");if(scanner==null){s=s.Copy();scanner=new ItemInstance{id="item-"+s.Workshop.nextId++,type="field-scanner",missingMaterialBasis=true};s.Workshop.inventory=s.Workshop.inventory.Concat(new[]{scanner}).ToArray();Lifetime.Item(s,scanner.type);}s=Workshop.Equip(s,scanner.id,"research");break;
                    case "scanner-unequip":s=Workshop.Unequip(s,"research");break;
                    case "gift":s=s.Copy();s.Workshop.components[0]+=500;Lifetime.Components(s,0,500);break;
                    case "shop":s=GemShop.Buy(s,"materials-circuits");break;
                    case "hardware":s=Game.Buy(s,"calculator",step.amount);break;
                    case "analysis":s=MaterialAnalysis.Start(s,Array.FindIndex(ItemBalance.Analyses,d=>d.Id=="hardware-short"));break;
                    case "cancel":s=MaterialAnalysis.Cancel(s);break;
                    case "synthesis":s=Industry.Synthesize(s,0);break;
                    case "advance":case "finish":case "repeat":s=Game.Advance(s,step.at);break;
                    case "prestige":s=s.Copy();s.Prestige.Entitlement=s.Prestige.Cycle.Add(ScientificNumber.From(100));s=PrestigeRules.Reset(s);break;
                    case "axiom":s=MetaRules.AxiomReset(FundAxiomReference(s,step.pending));break;
                    default:Assert.Fail("Unknown component action "+step.action);break;
                }
                string context=flow.name+" "+step.action;Near(PrestigeRules.CreditFactor(s),step.intIncome,context+" actual INT income factor");Near(s.Prestige.Cycle,step.cycleINT,context+" earned cycle INT");Near(s.Prestige.Free,step.freeINT,context+" free INT");Assert.That(s.ItemSystemV3?.synthesisContract?.id??"",Is.EqualTo(step.synthesisReceipt),context+" paid synthesis receipt");Assert.That(s.ItemSystemV3?.synthesisContract?.component??"",Is.EqualTo(step.synthesisComponent),context+" receipt component");Assert.That(s.ItemSystemV3?.synthesisContract?.multiplier??0,Is.EqualTo(step.synthesisMultiplier),context+" frozen yield");Assert.That(s.ItemSystemV3?.synthesisRemainders??new double[ItemBalance.ComponentIds.Length],Is.EqualTo(step.synthesisRemainders).Within(1e-12),context+" synthesis fractions");Assert.That(MaterialAnalysis.BaseSpeed(s),Is.EqualTo(step.synthesisSpeed).Within(1e-9),context+" synthesis speed");Assert.That(MetaAutomation.Fabrication(s),Is.EqualTo(step.fabricationSpeed).Within(1e-9),context+" fabrication speed");Assert.That(s.ItemSystemV3?.scannerAnalyses??0,Is.EqualTo(step.scannerAnalyses),context+" scanner receipts");Assert.That(MaterialAnalysis.Speed(s),Is.EqualTo(step.analysisSpeed).Within(Math.Max(1e-9,step.analysisSpeed*1e-10)),context+" live analysis speed");if(flow.v3)Near(s.ItemSystemV3.componentsProduced,step.counter,context+" produced K");else Assert.That(s.ItemSystemV3,Is.Null,context+" legacy flag");Assert.That(s.Workshop.components,Is.EqualTo(step.components),context+" wallet components");Near(s.Credits,step.credits,context+" credits");Near(s.Data,step.data,context+" data");Near(ScientificNumber.FromData(s.Meta.available),step.axiomFunds,context+" Axiom funds");Near(s.Prestige.Total,step.totalINT,context+" lifetime INT preserved");Assert.That(s.Retention.gems,Is.EqualTo(step.gems),context+" gems");Assert.That(s.Workshop.hasAnalysis,Is.EqualTo(step.analysis),context+" analysis");Assert.That(s.Industry.synthesis!=null,Is.EqualTo(step.synthesis),context+" synthesis");Assert.That(s.Prestige.resets,Is.EqualTo(step.prestiges),context+" prestige count");Assert.That(s.Meta.resets,Is.EqualTo(step.axioms),context+" axiom count");
                }
            }
        }
        static void Counter(GameState state,V3CounterWire row,string context)
        {
            if(row==null){Assert.That(state,Is.Null,context+" absent held state");return;}Assert.That(state,Is.Not.Null,context);Assert.That(ItemSystemV3.Enabled(state),Is.True,context);var v=state.ItemSystemV3;Assert.That(v.overdrive!=null,Is.EqualTo(row.hasOverdrive),context+" overdrive receipt");Assert.That(v.overdrive?.startedAt??0,Is.EqualTo(row.overdriveStarted).Within(1e-6),context+" start instant");Assert.That(v.overdrive?.burstUntil??0,Is.EqualTo(row.burstUntil).Within(1e-6),context+" burst boundary");Assert.That(v.overdrive?.creditFactor??1,Is.EqualTo(row.burstCredits).Within(1e-10),context+" snapshotted burst credits");Assert.That(v.overdrive?.dataFactor??1,Is.EqualTo(row.burstData),context+" snapshotted burst data");Near(v.dataProduced,row.dataProduced,context+" D");Near(v.knowledgeProduced,row.knowledgeProduced,context+" E");Near(v.componentsProduced,row.componentsProduced,context+" K");Assert.That(v.runMinutes,Is.EqualTo(row.runMinutes).Within(1e-8),context+" credited minutes");Assert.That(v.nextTrainingSequence,Is.EqualTo(row.nextTrainingSequence),context+" issued IDs");Assert.That(v.lastCompletedTrainingSequence,Is.EqualTo(row.lastCompletedTrainingSequence),context+" main/shadow completion marker; job="+state.Training?.key+" done="+state.Training?.done+" required="+state.Training?.required+" speed="+Game.WorkSpeed(state)+" levels="+state.Quality+","+state.Efficiency);Assert.That(v.scannerAnalyses,Is.EqualTo(row.scannerAnalyses),context+" scanner");Assert.That(v.learningStreak,Is.EqualTo(row.learningStreak),context+" learning series");Assert.That(v.lastLearningTrack??"",Is.EqualTo(row.lastTrack),context);Assert.That(v.lastTrainingCompletionCause??"",Is.EqualTo(row.cause),context);Assert.That(v.archiveBlueprintRight,Is.EqualTo(row.archiveRight),context);Assert.That(v.axiomDiscovered,Is.EqualTo(row.discovered),context);Assert.That(v.axiomDiscoveryAt,Is.EqualTo(row.discoveryAt),context);Assert.That(v.synthesisRemainders,Is.EqualTo(row.synthesisRemainders).Within(1e-12),context);Assert.That(v.synthesisContract?.id??"",Is.EqualTo(row.synthesisKey),context);Assert.That(v.synthesisContract?.component??"",Is.EqualTo(row.synthesisComponent),context);Assert.That(v.synthesisContract?.multiplier??0,Is.EqualTo(row.synthesisMultiplier),context);
        }
        [Test]public void ActualRelayInputsQuotesAndTransactionsMatchSourceFlows()
        {
            var cases=Cases();Assert.That(cases.relayFlows.Length,Is.EqualTo(7));foreach(var flow in cases.relayFlows){var s=State(cases.cases.First(c=>c.name==flow.initialCase));if(!flow.v3)s.ItemSystemV3=null;s.CritRng=flow.seed;s.Charge=99;s.ActiveUntil=flow.temporary?100000:0;s.Ads.creditBoostUntil=flow.temporary?100000:0;foreach(var item in s.Workshop.inventory)item.relayTaps=item.type=="impulse-relay"?9:0;if(!string.IsNullOrEmpty(flow.scope))s.Challenges.Run=new ChallengeRun{id=flow.scope,stage=1};
                foreach(var step in flow.steps){var before=s;if(step.action=="copy")s=s.Copy();else if(step.action=="unequip")s=Workshop.Unequip(s,"processor");else if(step.action=="equip")s=Workshop.Equip(s,s.Workshop.inventory[0].id,"processor");var wallet=s.Credits;string c=flow.name+" "+step.action+" "+step.now;Near(Game.TapValue(s,step.now),step.quote,c+" pure next amount");Near(Game.TapValue(s,step.now,false),step.basic,c+" no relay bonus");if(step.action=="tap")s=Game.Tap(s,step.now);Assert.That(step.action=="tap"&&!ReferenceEquals(before,s),Is.EqualTo(step.accepted),c+" accepted input");Near(s.Credits.Subtract(wallet),step.gain,c+" actual gain");Near(s.Credits,step.credits,c+" wallet");Assert.That(s.Workshop.inventory.Select(i=>i.relayTaps),Is.EqualTo(step.counts),c+" exemplar progress");Assert.That(s.Workshop.equipped,Is.EqualTo(step.equipped),c);Assert.That(s.CritRng,Is.EqualTo(step.rng),c);Assert.That(s.Combo,Is.EqualTo(step.combo),c);Assert.That(s.Charge,Is.EqualTo(step.charge),c);Assert.That(s.ActiveUntil,Is.EqualTo(step.until),c);Assert.That(s.CooldownUntil,Is.EqualTo(step.cooldown),c);if(flow.v3)Counter(s,step.current,c);}
            }
        }
        [Test]public void RelayProgressDoesNotAdvanceFromTimeAndSurvivesBothResets()
        {
            var s=State(Cases().cases.First(c=>c.name=="relay-common-reference"));s.Workshop.inventory[0].relayTaps=9;var elapsed=Game.Advance(s,s.SavedAt+100000);Assert.That(elapsed.Workshop.inventory[0].relayTaps,Is.EqualTo(9));s.Prestige.Entitlement=ScientificNumber.From(100);var reset=PrestigeRules.Reset(s);Assert.That(reset.Prestige.resets,Is.EqualTo(1));Assert.That(reset.Workshop.inventory[0].relayTaps,Is.EqualTo(9));var axiom=MetaRules.AxiomReset(FundAxiomReference(reset));Assert.That(axiom.Meta.resets,Is.EqualTo(1));Assert.That(axiom.Workshop.inventory[0].relayTaps,Is.EqualTo(9));Assert.That(ItemSystemV3.RelayBonus(Game.New(1000),false).IsZero,Is.True);
        }
        [Test]public void ActualOverdriveSnapshotsAndTimedProductionMatchSourceFlows()
        {
            var cases=Cases();Assert.That(cases.overdriveFlows.Length,Is.EqualTo(8));foreach(var flow in cases.overdriveFlows){var s=State(cases.cases.First(c=>c.name==flow.initialCase));s.CritRng=1;foreach(var step in flow.steps){switch(step.action){
                case "manual":s=s.Copy();s.Charge=(int)Balance.OverdriveCharge;s=Game.ActivateOverdrive(s,s.SavedAt);break;
                case "trigger":s=s.Copy();s.Charge=99;s=Game.Tap(s,s.SavedAt);break;
                case "time":s=Game.Advance(s,step.at,step.active);break;
                case "copy":s=s.Copy();break;
                case "remove":s=Workshop.Unequip(s,step.slot);break;
                case "equip":s=Workshop.Equip(s,s.Workshop.inventory.First(i=>Workshop.Definition(i).Family==step.slot).id,step.slot);break;
                case "weaken":s=s.Copy();s.Workshop.nodes=Array.Empty<string>();foreach(var item in s.Workshop.inventory){item.rarity=0;item.level=1;item.forge=0;}break;
                case "prestige":s=s.Copy();s.Prestige.Entitlement=s.Prestige.Cycle.Add(ScientificNumber.From(100));s=PrestigeRules.Reset(s);break;
                default:Assert.Fail(step.action);break;
            }string c=flow.name+" "+step.action+" "+step.at;Counter(s,step.current,c);Assert.That(ItemSystemV3.OverdriveFraction(s),Is.EqualTo(step.fraction).Within(1e-8),c+" displayed countdown");Assert.That(s.SavedAt,Is.EqualTo(step.at).Within(1e-6),c);Assert.That(s.ActiveUntil,Is.EqualTo(step.until).Within(1e-6),c);Assert.That(s.CooldownUntil,Is.EqualTo(step.cooldown),c);Assert.That(s.Lifetime.overclocks,Is.EqualTo(step.activations),c);Near(s.Credits,step.credits,c+" credits");Near(s.Data,step.data,c+" data");Near(Game.Income(s),step.income,c+" live income");Near(Game.Income(s,false),step.regularIncome,c+" regular reference");Near(Game.DataRate(s),step.dataRate,c+" live data");Near(Game.Compute(s),step.compute,c+" compute");Assert.That(s.Workshop.equipped,Is.EqualTo(step.equipped),c);}}
        }
        [Test]public void OverdriveContractsCopyValidateAndDoNotBackfillLegacyWindows()
        {
            var s=State(Cases().cases.First(c=>c.name=="overdrive-start-snapshot-survives-removal"));s.Charge=99;s=Game.Tap(s,s.SavedAt);Assert.That(s.ActiveUntil-s.SavedAt,Is.GreaterThan(Balance.OverdriveMaxSeconds*1000));var copy=s.Copy();copy.ItemSystemV3.overdrive.creditFactor=1;Assert.That(s.ItemSystemV3.overdrive.creditFactor,Is.GreaterThan(1));copy.ItemSystemV3.overdrive=null;Assert.That(ItemSystemV3.BurstFactor(copy),Is.EqualTo(1));Assert.That(copy.ActiveUntil,Is.EqualTo(s.ActiveUntil));Assert.That(s.ItemSystemV3.overdrive,Is.Not.Null);
            var malformed=s.Copy();malformed.ItemSystemV3.overdrive.creditFactor=double.NaN;Assert.Throws<FormatException>(()=>ItemSystemV3.Validate(malformed));malformed=s.Copy();malformed.ItemSystemV3.overdrive.creditFactor=1e100;Assert.Throws<FormatException>(()=>ItemSystemV3.Validate(malformed));malformed=s.Copy();malformed.ItemSystemV3.overdrive.dataFactor=2;Assert.Throws<FormatException>(()=>ItemSystemV3.Validate(malformed));var normal=s.Copy();normal.Prestige.Entitlement=ScientificNumber.From(100);normal=PrestigeRules.Reset(normal);Assert.That(normal.ItemSystemV3.overdrive,Is.Null);Assert.That(normal.ActiveUntil,Is.Zero);var axiom=MetaRules.AxiomReset(FundAxiomReference(s));Assert.That(axiom.Meta.resets,Is.EqualTo(1));Assert.That(axiom.ItemSystemV3.overdrive,Is.Null);Assert.That(axiom.ActiveUntil,Is.Zero);
        }
        static GameState PreparedHardwareItems(GameState state,bool maximum)
        {
            var s=state.Copy();if(maximum)s.Workshop.nodes=s.Workshop.nodes.Union(new[]{"W10"}).ToArray();foreach(string type in maximum?new[]{"legacy-controller","diagnostic-adapter","memory-crystal"}:new[]{"diagnostic-adapter"}){var item=s.Workshop.inventory.FirstOrDefault(i=>i.type==type);if(item==null){item=new ItemInstance{id="item-"+s.Workshop.nextId++,type=type,missingMaterialBasis=true};s.Workshop.inventory=s.Workshop.inventory.Concat(new[]{item}).ToArray();Lifetime.Item(s,type);}if(maximum){item.rarity=5;item.level=69;item.forge=20;}s=Workshop.Equip(s,item.id,Workshop.Definition(item).Family);}return s;
        }
        [Test]public void EveryHardwareMilestonePackageMatchesActualSourceGrant()
        {
            var rows=Cases().hardwarePackageCases;Assert.That(rows.Length,Is.EqualTo(360));foreach(var row in rows){var s=Game.New(1000,"prepared-package-reference");bool maximum=row.mode=="maximum-boot"||row.mode=="no-items";if(row.mode!="normal")s.ItemSystemV3=new ItemV3State();if(maximum)s.Workshop.nodes=new[]{"W08","W10"};s=PreparedHardwareItems(s,maximum);s.Workshop.hardwareRemainders=Enumerable.Repeat(.25,ItemBalance.ComponentIds.Length).ToArray();if(row.mode=="no-items")s.Challenges.Run=new ChallengeRun{id="no-items",stage=1};int hardware=Array.FindIndex(Balance.Hardware,h=>h.Id==row.hardware);s.Hardware[hardware]=row.threshold;Workshop.PaidHardware(s,hardware,row.threshold-1);string c=row.mode+" "+row.hardware+" "+row.threshold;Assert.That(s.Workshop.components,Is.EqualTo(row.components),c+" actual component wallet");Assert.That(s.Workshop.hardwareRemainders,Is.EqualTo(row.remainders).Within(1e-10),c+" fractional remainders");if(s.ItemSystemV3!=null)Near(s.ItemSystemV3.componentsProduced,row.counter,c+" actual K");else Assert.That(row.counter==null||row.counter.m==0,Is.True,c+" normal mode");var paid=(long[])s.Workshop.components.Clone();var counter=s.ItemSystemV3?.componentsProduced;Workshop.PaidHardware(s,hardware,row.threshold-1);Assert.That(s.Workshop.components,Is.EqualTo(paid),c+" duplicate ignored");if(counter!=null)Assert.That(s.ItemSystemV3.componentsProduced,Is.SameAs(counter),c+" no repeated receipt");}
        }
        [Test]public void BlueprintArchiveCountsKnownDistinctMasteriesOnly()
        {
            var rows=Cases().cases.Where(c=>c.name.StartsWith("blueprint-valid-",StringComparison.Ordinal)).ToArray();Assert.That(rows.Length,Is.EqualTo(6));double Rate(string name)=>Game.WorkSpeed(State(rows.First(c=>c.name=="blueprint-valid-"+name)),true);double baseline=Rate("zero");Assert.That(Rate("one")/baseline,Is.EqualTo(1+ItemV3Balance.Get("blueprint.perBlueprint")).Within(1e-12));Assert.That(Rate("higher-same"),Is.EqualTo(Rate("one")));Assert.That(Rate("two")/baseline,Is.EqualTo(1+2*ItemV3Balance.Get("blueprint.perBlueprint")).Within(1e-12));Assert.That(Rate("unknown-only"),Is.EqualTo(baseline));Assert.That(Rate("mixed"),Is.EqualTo(Rate("one")));Assert.That(rows.First(c=>c.name=="blueprint-valid-mixed").unknownMastery,Is.EquivalentTo(new[]{"foreign-blueprint","toString"}),"Unknown source metadata remains in fixture; this is not a V3 disk-import claim");
        }
        static GameState SharedChallengeMain(ItemV3Case row)
        {
            var s=State(row);s.Credits=s.Data=ScientificNumber.From(1e6);s.Prestige.resets=1;s.Prestige.Cycle=s.Prestige.Free=s.Prestige.Entitlement=ScientificNumber.From(20000);s.Prestige.Total=ScientificNumber.From(1e6);s.Meta.total=ScientificNumber.From(1000).ToData();s.Meta.available=ScientificNumber.From(1000-MetaBalance.Axioms.First(a=>a.Id=="B05").Costs[0]).ToData();s.Lifetime.hardwareClasses=new[]{"sbc"};s.Tutorial="done";s.Story=StoryState.Migrated();s.Meta.records=new[]{10,10,0};var v=s.ItemSystemV3;v.scannerAnalyses=5;v.learningStreak=2;v.lastLearningTrack="quality";v.nextTrainingSequence=5;v.lastCompletedTrainingSequence=3;v.lastTrainingCompletionCause="regular";v.archiveBlueprintRight=v.axiomDiscovered=true;v.axiomDiscoveryAt=1000;v.synthesisRemainders[0]=.5;s=PrestigeRules.Buy(s,"I05");s=Game.Train(s,"quality");s=Industry.Synthesize(s,0);return s;
        }
        [Test]public void ActualChallengeFactoriesProductionAndReturnMatchSourceFlows()
        {
            var cases=Cases();Assert.That(cases.challengeFlows.Length,Is.EqualTo(7));foreach(var flow in cases.challengeFlows){var s=SharedChallengeMain(cases.cases.First(c=>c.name==flow.initialCase));foreach(var step in flow.steps){switch(step.action){
                case "prepared-overdrive":s=s.Copy();s.Workshop.inventory=new[]{"burst-processor","cryocontroller","photonic-analyzer"}.Select((type,i)=>new ItemInstance{id="prepared-overdrive-"+i,type=type}).ToArray();s.Workshop.equipped=new[]{"prepared-overdrive-0","prepared-overdrive-1","prepared-overdrive-2","","","","",""};s.Charge=99;s=Game.Tap(s,s.SavedAt);break;
                case "advance":s=Game.Advance(s,step.at,step.active);break;
                case "record-boundary":s=s.Copy();s.Meta.records=new[]{0,1,0};break;
                case "copy":s=s.Copy();break;
                case "start":s=ChallengeRules.Start(s,flow.id,1,"prepared:"+flow.name);break;
                case "fund":s=s.Copy();s.Credits=s.Data=ScientificNumber.Parse("1e30");break;
                case "hardware":s=Game.Buy(s,"calculator",step.amount);break;
                case "analysis":s=MaterialAnalysis.Start(s,Array.FindIndex(ItemBalance.Analyses,d=>d.Id=="hardware-short"));break;
                case "train":s=Game.Train(s,step.track);break;
                case "finish-training":case "finish-analysis":case "finish-synthesis":case "repeat":s=Game.Advance(s,step.at,step.active);break;
                case "abort":s=ChallengeRules.Return(s,false);break;
                case "complete":s=ChallengeRules.Return(s,true);break;
                case "prestige":s=s.Copy();s.Prestige.Entitlement=s.Prestige.Cycle.Add(ScientificNumber.From(100));s=PrestigeRules.Reset(s);break;
                default:Assert.Fail("Unknown challenge action "+step.action);break;
            }string c=flow.name+" "+step.action;Assert.That(s.Challenges.Run?.id??"main",Is.EqualTo(step.scope),c);Assert.That(s.Training?.required??0,Is.EqualTo(step.trainingRequired).Within(1e-7),c+" paid required work");Assert.That(Game.WorkSpeed(s),Is.EqualTo(step.trainingSpeed).Within(1e-7),c+" actual training speed");Counter(s,step.current,c+" current");if(step.hasMain)Counter(s.Challenges.Main,step.main,c+" held");else Assert.That(s.Challenges.Main,Is.Null,c+" no held snapshot");Near(s.Credits,step.credits,c+" credits");Near(s.Data,step.data,c+" data");Near(PrestigeRules.CreditFactor(s),step.intIncome,c+" actual INT income");Near(s.Prestige.Total,step.totalINT,c+" total INT");Near(s.Prestige.Cycle,step.cycleINT,c+" cycle INT");Near(s.Prestige.Free,step.freeINT,c+" free INT");Near(Game.Compute(s),step.compute,c+" compute");Near(Game.Income(s),step.income,c+" income");Assert.That(s.Training?.key??"",Is.EqualTo(step.trainingKey),c);Assert.That(s.Training?.done??0,Is.EqualTo(step.trainingDone).Within(1e-6),c);Assert.That(new[]{s.Quality,s.Efficiency,s.Workshop.integration},Is.EqualTo(step.levels),c);Assert.That(s.Meta.records,Is.EqualTo(step.records),c+" retained training records");Assert.That(s.Meta.cycleRecords,Is.EqualTo(step.cycleRecords),c+" local cycle records");Assert.That(s.Workshop.components,Is.EqualTo(step.components),c+" owned components");Assert.That(s.Challenges.Progress.stars,Is.EqualTo(step.stars),c);Assert.That(s.Challenges.Progress.stages[ChallengeRules.Index(flow.id)],Is.EqualTo(step.stage),c);Assert.That(s.Prestige.resets,Is.EqualTo(step.resets),c);Assert.That(s.Meta.resets,Is.EqualTo(step.axioms),c+" real axiom history");Assert.That(Workshop.ActiveSlots(s).Count(x=>x),Is.EqualTo(step.slots),c+" slot capacity");if(s.Challenges.Main!=null){var main=s.Challenges.Main;Assert.That(main.SavedAt,Is.EqualTo(step.mainAt).Within(1e-6),c);Near(main.Credits,step.mainCredits,c+" paused credits");Near(main.Data,step.mainData,c+" paused data");Assert.That(main.Training?.key??"",Is.EqualTo(step.mainTrainingKey),c);Assert.That(main.Training?.done??0,Is.EqualTo(step.mainTrainingDone).Within(1e-6),c);Assert.That(main.Industry.synthesis?.key??"",Is.EqualTo(step.mainSynthesisKey),c);Assert.That(main.Industry.synthesis?.done??0,Is.EqualTo(step.mainSynthesisDone).Within(1e-6),c);}}
            }
        }
        static GameState ChallengeMain()
        {
            var s=Game.New(1000,"prepared-v3-challenge",true);s.Credits=s.Data=ScientificNumber.From(1e6);s.Prestige.resets=1;s.Lifetime.hardwareClasses=new[]{"sbc"};s.ItemSystemV3=new ItemV3State{dataProduced=ScientificNumber.From(100),knowledgeProduced=ScientificNumber.From(200),componentsProduced=ScientificNumber.From(300),runMinutes=40,scannerAnalyses=5,learningStreak=2,lastLearningTrack="quality",nextTrainingSequence=5,lastCompletedTrainingSequence=3,lastTrainingCompletionCause="regular",archiveBlueprintRight=true,axiomDiscovered=true,axiomDiscoveryAt=1000};s.Meta.resets=3;s.Meta.axioms[Array.FindIndex(MetaBalance.Axioms,n=>n.Id=="B05")]=1;s.Meta.records=new[]{10,10,0};return s;
        }
        [Test]public void ActualChallengeEntryIsolatesV3CountersButRetainsPermanentHistory()
        {
            var main=ChallengeMain();var run=ChallengeRules.Start(main,"no-items",1,"prepared-no-items");Assert.That(run,Is.Not.SameAs(main));Assert.That(ItemSystemV3.Enabled(run),Is.True);Assert.That(run.ItemSystemV3.dataProduced.IsZero&&run.ItemSystemV3.knowledgeProduced.IsZero&&run.ItemSystemV3.componentsProduced.IsZero,Is.True);Assert.That(run.ItemSystemV3.runMinutes,Is.Zero);Assert.That(run.ItemSystemV3.scannerAnalyses,Is.Zero);Assert.That(run.ItemSystemV3.learningStreak,Is.Zero);Assert.That(run.ItemSystemV3.nextTrainingSequence,Is.EqualTo(5));Assert.That(run.ItemSystemV3.archiveBlueprintRight&&run.ItemSystemV3.axiomDiscovered,Is.True);Assert.That(run.Meta.resets,Is.EqualTo(3));Assert.That(run.Meta.records,Is.EqualTo(main.Meta.records));Assert.That(main.ItemSystemV3.componentsProduced.ToDouble(),Is.EqualTo(300));var returned=ChallengeRules.Return(run,false);Assert.That(returned.ItemSystemV3.componentsProduced.ToDouble(),Is.EqualTo(300));Assert.That(returned.ItemSystemV3.runMinutes,Is.EqualTo(40));
            main.ItemSystemV3=null;Assert.That(ChallengeRules.Start(main,"no-items",1,"prepared-legacy").ItemSystemV3,Is.Null);
        }
        [Test]public void ChallengeTrainingIDsDoNotSuppressOlderPaidMainCompletion()
        {
            var main=ChallengeMain();main.Quality=1;main=Game.Train(main,"quality");Assert.That(main.Training.key,Is.EqualTo("v3-training-5"));var run=ChallengeRules.Start(main,"no-items",1,"prepared-issued-IDs");run.Credits=run.Data=ScientificNumber.From(1e6);run=Game.Train(run,"efficiency");Assert.That(run.Training.key,Is.EqualTo("v3-training-6"));run=Game.Advance(run,run.SavedAt+(run.Training.required-run.Training.done)/Game.WorkSpeed(run)*1000+.01);Assert.That(run.ItemSystemV3.lastCompletedTrainingSequence,Is.EqualTo(6));Assert.That(run.ItemSystemV3.learningStreak,Is.Zero);
            var restored=ChallengeRules.Return(run.Copy(),false);Assert.That(restored.Training.key,Is.EqualTo("v3-training-5"));Assert.That(restored.ItemSystemV3.nextTrainingSequence,Is.EqualTo(7));Assert.That(restored.ItemSystemV3.lastCompletedTrainingSequence,Is.EqualTo(3));Assert.That(restored.ItemSystemV3.learningStreak,Is.EqualTo(2));Assert.That(restored.ItemSystemV3.componentsProduced.ToDouble(),Is.EqualTo(300));var done=Game.Advance(restored,restored.SavedAt+(restored.Training.required-restored.Training.done)/Game.WorkSpeed(restored)*1000+.01);Assert.That(done.Quality,Is.EqualTo(2));Assert.That(done.ItemSystemV3.lastCompletedTrainingSequence,Is.EqualTo(5));Assert.That(done.ItemSystemV3.nextTrainingSequence,Is.EqualTo(7));Assert.That(Game.Train(done,"efficiency").Training.key,Is.EqualTo("v3-training-7"));
        }
        [Test]public void NewChallengeExemplarsKeepMainRelayAndHardwareUpgradesIsolated()
        {
            var main=ChallengeMain();main.Workshop.inventory=new[]{new ItemInstance{id="prepared-relay",type="impulse-relay",relayTaps=9}};main=Workshop.Equip(main,"prepared-relay","processor");main.Legacy.classUpgrades=new[]{"calculator"};main.Legacy.classUpgradesRecorded=true;var run=ChallengeRules.Start(main,"data-crunch",1,"prepared-relay-copy");Assert.That(run.Workshop.inventory[0].relayTaps,Is.Zero);Assert.That(run.Legacy.classUpgrades,Is.Empty);var restored=ChallengeRules.Return(run,false);Assert.That(restored.Workshop.inventory[0].relayTaps,Is.EqualTo(9));Assert.That(restored.Legacy.classUpgrades,Is.EqualTo(new[]{"calculator"}));
        }
        [Test]public void LinearINTUsesEarnedLedgerDespiteSpendingAndPreservesGainNode()
        {
            var s=Game.New(1000);s.ItemSystemV3=new ItemV3State();s.Prestige.Cycle=s.Prestige.Free=s.Prestige.Total=s.Prestige.Entitlement=ScientificNumber.From(10000);Assert.That(PrestigeRules.CreditFactor(s).ToDouble(),Is.EqualTo(1001));s=PrestigeRules.Buy(s,"I05");Assert.That(s.Prestige.Free.ToDouble(),Is.EqualTo(5000));Assert.That(PrestigeRules.CreditFactor(s).ToDouble(),Is.EqualTo(1601));
            s.Workshop.nodes=new[]{"I05","I10"};s.Prestige.Entitlement=ScientificNumber.From(10100);s=PrestigeRules.Reset(s);Assert.That(s.Prestige.Cycle.ToDouble(),Is.EqualTo(10100));Assert.That(PrestigeRules.CreditFactor(s).ToDouble(),Is.EqualTo(2223).Within(1e-9));Assert.That(PrestigeV3.GainExponent(s),Is.EqualTo(.53).Within(1e-12));s=MetaRules.AxiomReset(FundAxiomReference(s));Assert.That(s.Meta.resets,Is.EqualTo(1));Assert.That(PrestigeRules.CreditFactor(s).ToDouble(),Is.EqualTo(1));
        }
        [Test]public void PaidSynthesisReceiptCopiesAndLegacyJobKeepOriginalContracts()
        {
            var s=Game.New(1000);s.Data=ScientificNumber.From(1e12);s.ItemSystemV3=new ItemV3State();s.Meta.axioms[Array.FindIndex(MetaBalance.Axioms,n=>n.Id=="C06")]=1;s=Industry.Synthesize(s,0);Assert.That(s.ItemSystemV3.synthesisContract.multiplier,Is.EqualTo(1.5));var independent=s.Copy();independent.ItemSystemV3.synthesisContract.multiplier=3;independent.ItemSystemV3.synthesisRemainders[0]=.5;Assert.That(s.ItemSystemV3.synthesisContract.multiplier,Is.EqualTo(1.5));Assert.That(s.ItemSystemV3.synthesisRemainders[0],Is.Zero);
            var bad=s.Copy();bad.ItemSystemV3.synthesisContract.id="unknown-contract";bad.Industry.synthesis.done=bad.Industry.synthesis.required;Assert.Throws<FormatException>(()=>Industry.Settle(bad));Assert.That(s.Workshop.components[0],Is.Zero);
            var legacy=s.Copy();legacy.ItemSystemV3.synthesisContract=null;legacy.Industry.synthesis.done=legacy.Industry.synthesis.required;legacy=Industry.Settle(legacy);Assert.That(legacy.ItemSystemV3.componentsProduced.ToDouble(),Is.EqualTo(1));Assert.That(legacy.ItemSystemV3.synthesisRemainders[0],Is.Zero);
            var malformed=s.Copy();malformed.ItemSystemV3.synthesisRemainders[0]=1;Assert.Throws<FormatException>(()=>ItemSystemV3.Validate(malformed));
        }
        [Test]public void ScannerSoftcapCopiesAndNoItemsUseActualAnalysisRateOnly()
        {
            var s=Game.New(1000);s.ItemSystemV3=new ItemV3State();s.Workshop.inventory=new[]{new ItemInstance{id="prepared-scanner",type="field-scanner"}};s=Workshop.Equip(s,"prepared-scanner","research");
            foreach(long count in new long[]{0,24,25,26,1000000}){s.ItemSystemV3.scannerAnalyses=count;double soft=count<=25?count:25+Math.Sqrt((count-25)*25);Assert.That(MaterialAnalysis.Speed(s),Is.EqualTo(2*(1+.05*soft)).Within(1e-8));Assert.That(MaterialAnalysis.BaseSpeed(s),Is.EqualTo(1));var copy=s.Copy();copy.ItemSystemV3.scannerAnalyses++;Assert.That(s.ItemSystemV3.scannerAnalyses,Is.EqualTo(count));}
            s.Challenges.Run=new ChallengeRun{id="no-items",stage=1};Assert.That(MaterialAnalysis.Speed(s),Is.EqualTo(1));s.Challenges.Run=null;
            foreach(bool axiom in new[]{false,true}){var copy=s.Copy();ItemSystemV3.ResetProduction(copy,axiom);Assert.That(copy.ItemSystemV3.scannerAnalyses,Is.Zero);}
            s.ItemSystemV3.scannerAnalyses=-1;Assert.Throws<FormatException>(()=>ItemSystemV3.Validate(s));
        }
        [Test]public void ComponentReceiptsPreserveScientificRemaindersAndIndependentCopies()
        {
            var s=Game.New(1000);s.ItemSystemV3=new ItemV3State{componentsProduced=ScientificNumber.Parse("1e1000")};var copy=s.Copy();Lifetime.Components(copy,0,100,"analysis");Assert.That(copy.ItemSystemV3.componentsProduced.CompareTo(s.ItemSystemV3.componentsProduced),Is.GreaterThan(0));Assert.That(s.ItemSystemV3.componentsProduced.CompareTo(ScientificNumber.Parse("1e1000")),Is.EqualTo(0));
            foreach(string source in new[]{"shop","gift","trade","import","refund","salvage","recovery",null}){var before=copy.ItemSystemV3.componentsProduced;Lifetime.Components(copy,0,3,source);Assert.That(copy.ItemSystemV3.componentsProduced.CompareTo(before),Is.EqualTo(0),source??"unspecified");}
            var regular=Game.New(1000);Lifetime.Components(regular,0,3,"analysis");Assert.That(regular.ItemSystemV3,Is.Null);Assert.Throws<ArgumentOutOfRangeException>(()=>ItemSystemV3.RecordComponents(copy,0,-1,"analysis"));
        }
        [Test]public void C01UsesOnlyTheGeneratedCurrentDescriptionAndLevels()
        {
            var s=Game.New(1000);string legacy=MetaBalance.Axioms.First(n=>n.Id=="C01").Description;foreach(string language in SettingsCatalog.Languages){Assert.That(IdleIntelligence.Runtime.PrestigeCopy.Describe(s,"C01",legacy,language),Is.EqualTo(IdleIntelligence.Runtime.PrestigeCopy.Describe(legacy,language)));s.ItemSystemV3=new ItemV3State();string copy=IdleIntelligence.Runtime.PrestigeCopy.Describe(s,"C01",legacy,language);Assert.That(copy,Does.Contain("×2 / ×3 / ×4"),language);Assert.That(copy,Does.Not.Contain("{"),language);s.ItemSystemV3=null;}
            s.ItemSystemV3=new ItemV3State();for(int level=0;level<=3;level++){s.Meta.axioms[Array.FindIndex(MetaBalance.Axioms,n=>n.Id=="C01")]=level;Assert.That(PrestigeV3.PassiveComponents(s),Is.EqualTo(level==0?1:ItemV3Balance.C01PassiveFactors[level-1]));}
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
