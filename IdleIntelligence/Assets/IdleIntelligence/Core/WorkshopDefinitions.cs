using System;
using System.Linq;
namespace IdleIntelligence.Core
{
    public sealed class ItemDefinition
    {
        public readonly string Id,Name,Family,Role,Access,Area;
        public readonly int Starter,BlueprintPrice,BaseMaterial,RareMaterial;
        public readonly string[][] Profiles;public readonly double[] Weights,ModuleCosts;public readonly double[][] Components;public readonly double Data,Cap;
        public ItemDefinition(string id,string name,string family,int starter,int blueprints,string role,double cap,string access,string area,string[][] profiles,double[] weights,double[][] components,double[] modules,double data,int basic,int rare)
        {Id=id;Name=name;Family=family;Starter=starter;BlueprintPrice=blueprints;Role=role;Cap=cap;Access=access;Area=area;Profiles=profiles;Weights=weights;Components=components;ModuleCosts=modules;Data=data;BaseMaterial=basic;RareMaterial=rare;}
    }
    public sealed class AnalysisDefinition {public readonly string Id;public readonly double Cost,Work,Units,Fragments,ItemChance;public AnalysisDefinition(string id,double cost,double work,double units,double fragments,double itemChance){Id=id;Cost=cost;Work=work;Units=units;Fragments=fragments;ItemChance=itemChance;}}
    [Serializable]public sealed class AnalysisJob {public double startedAt;public bool startRecorded;public bool rareGuarantee;public int definition;public double done,required,units,blueprints,quantityIntegral,photonicIntegral,quantumIntegral,combination;public double[] weights;public int[] order;public AnalysisJob Copy(){var a=(AnalysisJob)MemberwiseClone();a.weights=(double[])weights.Clone();a.order=(int[])order.Clone();return a;}}
    public sealed class ModuleDefinition {public readonly string Id,Name;public readonly double[] Costs;public readonly double Data,Work;public ModuleDefinition(string id,string name,double[] costs,double data,double work){Id=id;Name=name;Costs=costs;Data=data;Work=work;}}
    public sealed class CombinationDefinition {public readonly string Id;public readonly double Value;public readonly string[] Needs;public readonly bool Items,Multiplicative;public CombinationDefinition(string id,double value,string[] needs,bool items,bool multiplicative){Id=id;Value=value;Needs=needs;Items=items;Multiplicative=multiplicative;}}
    [Serializable] public sealed class ItemInstance
    {
        public string id,type;public int rarity,level=1,forge;public bool locked,challengeCopy,missingMaterialBasis;public long relayTaps;public double legacyLevelFactor=1;
        public double[] materialBasis=new double[ItemBalance.ComponentIds.Length],recoveryUsed=new double[ItemBalance.ComponentIds.Length];
        public ItemInstance Copy(){var v=(ItemInstance)MemberwiseClone();v.materialBasis=(double[])materialBasis.Clone();v.recoveryUsed=(double[])recoveryUsed.Clone();return v;}
    }
    [Serializable] public sealed class WorkshopState
    {
        public int schema=1;public long revision,nextId=1,fragments;public bool starterGift,blueprintPending,blueprintReward,reducedMotion;
        public long[] components=new long[ItemBalance.ComponentIds.Length],modules=new long[ItemBalance.Modules.Length];
        public double[] hardwareRemainders=new double[ItemBalance.ComponentIds.Length],recyclingRemainders=new double[ItemBalance.ComponentIds.Length];
        public bool[] learned=new bool[ItemBalance.Items.Length],knownBlueprints=new bool[ItemBalance.Items.Length];
        public int[] mastery=new int[ItemBalance.Items.Length],crafted=new int[ItemBalance.Items.Length];public double[] researchProgress=new double[5];
        public ItemInstance[] inventory=Array.Empty<ItemInstance>();public string[] equipped=Enumerable.Repeat("",8).ToArray(),nodes=Array.Empty<string>(),permanentSlots=Array.Empty<string>(),milestones=Array.Empty<string>();
        public string activeModel="",lastTrack="",lastArea="";public int activeModelLevel,integration,qualityCompletions,efficiencyCompletions;
        public double runStartedAt,passiveProgress;public uint materialRng=(uint)ItemBalance.MaterialRng;
        public bool hasAnalysis;public AnalysisJob analysis;public int focus=-1;public long researchFragments;public double componentRemainder,blueprintRemainder,researchRemainder;public double[] analysisRemainders=new double[ItemBalance.ComponentIds.Length];
        public bool hasModuleJob;public Job moduleJob;
        public WorkshopState Copy()
        {
            var w=(WorkshopState)MemberwiseClone();w.components=(long[])components.Clone();w.modules=(long[])modules.Clone();w.hardwareRemainders=(double[])hardwareRemainders.Clone();w.recyclingRemainders=(double[])recyclingRemainders.Clone();w.learned=(bool[])learned.Clone();w.knownBlueprints=(bool[])knownBlueprints.Clone();w.mastery=(int[])mastery.Clone();w.crafted=(int[])crafted.Clone();w.researchProgress=(double[])researchProgress.Clone();w.inventory=inventory.Select(i=>i.Copy()).ToArray();w.equipped=(string[])equipped.Clone();w.nodes=(string[])nodes.Clone();w.permanentSlots=(string[])permanentSlots.Clone();w.milestones=(string[])milestones.Clone();w.analysis=hasAnalysis?analysis?.Copy():null;w.analysisRemainders=(double[])analysisRemainders.Clone();w.moduleJob=hasModuleJob?moduleJob?.Copy():null;return w;
        }
    }
    public sealed class CraftQuote {public bool Allowed;public string Reason;public double[] Components,Modules;public double Data;public long Revision;}
}
