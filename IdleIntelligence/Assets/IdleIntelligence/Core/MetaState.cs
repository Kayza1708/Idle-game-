using System;using System.Linq;
namespace IdleIntelligence.Core
{
 public sealed class AxiomNode {public readonly string Id,Name,Description;public readonly double[] Costs;public readonly int Branch,Depth;public readonly double X,Y;public AxiomNode(string id,string name,string text,double[] costs,int branch,int depth,double x,double y){Id=id;Name=name;Description=text;Costs=costs;Branch=branch;Depth=depth;X=x;Y=y;}}
 public sealed class ModelDefinition {public readonly string Id,Name,Kind,Secondary;public readonly double Base;public ModelDefinition(string id,string name,string kind,double basis,string secondary){Id=id;Name=name;Kind=kind;Base=basis;Secondary=secondary;}}
 [Serializable]public sealed class MetaState
 {
  public int schema=1;public int[] axioms=new int[24],models=Enumerable.Repeat(-1,10).ToArray(),records=new int[3],cycleRecords=new int[3];public uint rng;public long resets;public double cycleStartedAt;
  public NumberData available=ScientificNumber.Zero.ToData(),total=ScientificNumber.Zero.ToData(),intReserve=ScientificNumber.Zero.ToData(),axiomMinimum=ScientificNumber.One.ToData();
  public bool axiomAuto,intentAxiom;public string tutorial="",rebuildMode="";public string[] rebuild=Array.Empty<string>();public string[] modelPlan=new[]{"","",""};
  public bool analysisAuto,craftAuto,fusionAuto;public int analysisRecipe,craftTarget=1,fusionTarget=2;public string craftRecipe="quantum-chip";public string[] fusionTypes=Array.Empty<string>();public double analysisSeconds,craftSeconds;
  public double[] passiveRemainders=new double[ItemBalance.ComponentIds.Length],salvageRemainders=new double[ItemBalance.ComponentIds.Length];
  public MetaState Copy(){var m=(MetaState)MemberwiseClone();m.axioms=(int[])axioms.Clone();m.models=(int[])models.Clone();m.records=(int[])records.Clone();m.cycleRecords=(int[])cycleRecords.Clone();m.modelPlan=(string[])modelPlan.Clone();m.rebuild=(string[])rebuild.Clone();m.fusionTypes=(string[])fusionTypes.Clone();m.passiveRemainders=(double[])passiveRemainders.Clone();m.salvageRemainders=(double[])salvageRemainders.Clone();m.available=ScientificNumber.FromData(available).ToData();m.total=ScientificNumber.FromData(total).ToData();m.intReserve=ScientificNumber.FromData(intReserve).ToData();m.axiomMinimum=ScientificNumber.FromData(axiomMinimum).ToData();return m;}
  public static MetaState New(double now){uint seed=unchecked((uint)(long)now);foreach(char c in "unassigned")seed=unchecked(seed*31+c);return new MetaState{rng=seed==0?1708u:seed,cycleStartedAt=now};}
 }
}
