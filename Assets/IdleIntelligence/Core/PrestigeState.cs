using System;
using System.Linq;
namespace IdleIntelligence.Core
{
    public sealed class PrestigeNode
    {
        public readonly string Id,Name,Description;public readonly double Cost,X,Y;public readonly int Branch,Depth;
        public PrestigeNode(string id,string name,double cost,int branch,int depth,string description,double x,double y){Id=id;Name=name;Cost=cost;Branch=branch;Depth=depth;Description=description;X=x;Y=y;}
    }
    [Serializable]public sealed class TrainingTarget {public string track;public int level;public TrainingTarget Copy()=>(TrainingTarget)MemberwiseClone();}
    [Serializable]public sealed class ResearchTarget {public string id;public int level;public ResearchTarget Copy()=>(ResearchTarget)MemberwiseClone();}
    // NumberData is the existing exact sparse-number wire format; properties are domain adapters.
    [Serializable]public sealed class PrestigeState
    {
        public int schema=1;public long resets,revision;public bool historicalIncomeUnavailable;
        public NumberData eligible=ScientificNumber.Zero.ToData(),entitlement=ScientificNumber.Zero.ToData(),cycleINT=ScientificNumber.Zero.ToData(),totalINT=ScientificNumber.Zero.ToData(),unspent=ScientificNumber.Zero.ToData(),spent=ScientificNumber.Zero.ToData(),best=ScientificNumber.Zero.ToData(),knowledge=ScientificNumber.Zero.ToData(),lastGain=ScientificNumber.Zero.ToData();
        public bool lab,labSeed;public string[] known=Array.Empty<string>(),milestones=Array.Empty<string>();
        public bool[] hardwareAuto=new bool[Balance.Hardware.Length];public double autoSeconds,otherAutoSeconds,agentSeconds,reservePercent;public NumberData creditReserve=ScientificNumber.Zero.ToData(),dataReserve=ScientificNumber.Zero.ToData();
        public TrainingTarget[] trainingQueue=Array.Empty<TrainingTarget>();public bool trainingAuto;public int[] trainingTargets=new int[3];
        public Job[] labs=Array.Empty<Job>();public string[] researchQueue=Array.Empty<string>();public bool researchRepeat,director;public string repeatId="";public ResearchTarget[] researchTargets=Array.Empty<ResearchTarget>();public bool directorAffordable,directorBudgetSet;public double researchAutoSeconds;public double directorReservePercent;public NumberData directorBudget=ScientificNumber.Zero.ToData(),directorSpent=ScientificNumber.Zero.ToData();
        public Job[] moduleQueue=Array.Empty<Job>();
        public bool agentMinimumExactRecorded;public NumberData agentMinimumExact=ScientificNumber.Zero.ToData();public ScientificNumber Minimum{get=>agentMinimumExactRecorded?ScientificNumber.FromData(agentMinimumExact):ScientificNumber.From(agentMinimum);set{if(value.IsZero)throw new ArgumentOutOfRangeException(nameof(value));agentMinimumExact=value.ToData();agentMinimumExactRecorded=true;agentMinimum=value.ToDouble();}}
        public bool agent,agentWaitTraining=true,agentWaitResearch,agentWaitAnalysis=true,agentWaitCrafting;public double agentMinimum=PrestigeBalance.Value("autoMinimum"),agentMinutes=PrestigeBalance.Value("autoMinutes"),relative,maximumRunSeconds;public string intentAnalysisKey="",intentModuleKey="";public string[] intentForgeKeys=Array.Empty<string>();public bool resetIntent,intentTraining;public string[] intentResearch=Array.Empty<string>();public bool intentAnalysis,intentCrafting;
        public ScientificNumber Eligible{get=>ScientificNumber.FromData(eligible);set=>eligible=value.ToData();}public ScientificNumber Entitlement{get=>ScientificNumber.FromData(entitlement);set=>entitlement=value.ToData();}public ScientificNumber Cycle{get=>ScientificNumber.FromData(cycleINT);set=>cycleINT=value.ToData();}public ScientificNumber Total{get=>ScientificNumber.FromData(totalINT);set=>totalINT=value.ToData();}public ScientificNumber Free{get=>ScientificNumber.FromData(unspent);set=>unspent=value.ToData();}public ScientificNumber Spent{get=>ScientificNumber.FromData(spent);set=>spent=value.ToData();}
        public PrestigeState Copy(){var p=(PrestigeState)MemberwiseClone();p.agentMinimumExact=agentMinimumExact==null?null:ScientificNumber.FromData(agentMinimumExact).ToData();p.eligible=Eligible.ToData();p.entitlement=Entitlement.ToData();p.cycleINT=Cycle.ToData();p.totalINT=Total.ToData();p.unspent=Free.ToData();p.spent=Spent.ToData();p.best=Clone(best);p.knowledge=Clone(knowledge);p.lastGain=Clone(lastGain);p.creditReserve=Clone(creditReserve);p.dataReserve=Clone(dataReserve);p.directorBudget=Clone(directorBudget);p.directorSpent=Clone(directorSpent);p.known=(string[])known.Clone();p.milestones=(string[])milestones.Clone();p.hardwareAuto=(bool[])hardwareAuto.Clone();p.trainingTargets=(int[])trainingTargets.Clone();p.trainingQueue=trainingQueue.Select(t=>t.Copy()).ToArray();p.labs=labs.Select(j=>j?.Copy()).ToArray();p.researchQueue=(string[])researchQueue.Clone();p.researchTargets=researchTargets.Select(t=>t.Copy()).ToArray();p.moduleQueue=moduleQueue.Select(j=>j.Copy()).ToArray();p.intentResearch=(string[])intentResearch.Clone();p.intentForgeKeys=(string[])intentForgeKeys.Clone();return p;}
        static NumberData Clone(NumberData v)=>ScientificNumber.FromData(v).ToData();
    }
}
