using System;
namespace IdleIntelligence.Core
{
    public sealed class Milestone
    {
        public readonly int Threshold; public readonly double Compute, Value; public readonly string Effect;
        public Milestone(int threshold,double compute,string effect,double value) { Threshold=threshold;Compute=compute;Effect=effect;Value=value; }
    }
    public sealed class HardwareDefinition
    {
        public readonly string Id,Name; public readonly double BaseCost,Growth,Compute; public readonly Milestone[] Milestones;
        public HardwareDefinition(string id,string name,double cost,double growth,double compute,Milestone[] milestones) { Id=id;Name=name;BaseCost=cost;Growth=growth;Compute=compute;Milestones=milestones; }
    }
    public sealed class Requirement
    {
        public readonly string Id; public readonly int Level;
        public Requirement(string id,int level) { Id=id;Level=level; }
    }
    public sealed class ResearchDefinition
    {
        public readonly string Id,Name; public readonly bool Project,Early; public readonly double Cost,Seconds,Effect; public readonly Requirement[] Requires;
        public ResearchDefinition(string id,string name,double cost,double seconds,double effect,bool project,bool early,Requirement[] requires) { Id=id;Name=name;Cost=cost;Seconds=seconds;Effect=effect;Project=project;Early=early;Requires=requires; }
    }
    [Serializable] public sealed class Job
    {
        public string id; public double required,done; public bool intro;
        public Job Copy() => (Job)MemberwiseClone();
    }
    public sealed class GameState
    {
        public ScientificNumber Credits=ScientificNumber.Zero, Data=ScientificNumber.Zero;
        public long[] Hardware=new long[Balance.Hardware.Length];
        public int[] Research=new int[Balance.Research.Length];
        public int Quality,Efficiency,Combo,Charge; public long Taps,Overdrives; public uint CritRng=(uint)Balance.InitialCritRng;
        public double SavedAt,LastTap=-1,ActiveUntil,CooldownUntil;
        public bool QualityUsed,ResearchUsed; public string Tutorial="tap";
        public WorkshopState Workshop=new WorkshopState();
        public Job Training,ResearchJob;
        public GameState Copy() { var s=(GameState)MemberwiseClone();s.Hardware=(long[])Hardware.Clone();s.Research=(int[])Research.Clone();s.Training=Training?.Copy();s.ResearchJob=ResearchJob?.Copy();s.Workshop=Workshop.Copy();return s; }
    }
    // Explicit, separate Unity save/fixture schema. Web saves are never silently consumed.
    [Serializable] public sealed class StateData
    {
        public NumberData credits,data; public long[] hardware; public int[] research;
        public int quality,efficiency,combo,charge; public long taps,overdrives; public uint critRng;
        public double savedAt,lastTap,activeUntil,cooldownUntil;
        public bool qualityUsed,researchUsed; public string tutorial;
        public WorkshopState workshop; public bool hasTraining,hasResearchJob; public Job training,researchJob;
        public static StateData From(GameState s) => new StateData {workshop=s.Workshop.Copy(),credits=s.Credits.ToData(),data=s.Data.ToData(),hardware=(long[])s.Hardware.Clone(),research=(int[])s.Research.Clone(),quality=s.Quality,efficiency=s.Efficiency,combo=s.Combo,charge=s.Charge,taps=s.Taps,overdrives=s.Overdrives,critRng=s.CritRng,savedAt=s.SavedAt,lastTap=s.LastTap,activeUntil=s.ActiveUntil,cooldownUntil=s.CooldownUntil,qualityUsed=s.QualityUsed,researchUsed=s.ResearchUsed,tutorial=s.Tutorial,hasTraining=s.Training!=null,hasResearchJob=s.ResearchJob!=null,training=s.Training?.Copy(),researchJob=s.ResearchJob?.Copy()};
        public GameState ToState(bool legacy=false)
        {
            if(legacy){if(research==null||research.Length!=5)throw new FormatException("Invalid v1 research");Array.Resize(ref research,Balance.Research.Length);workshop=new WorkshopState{runStartedAt=savedAt};}
            var s=new GameState {Workshop=workshop,Credits=ScientificNumber.FromData(credits),Data=ScientificNumber.FromData(data),Hardware=hardware,Research=research,Quality=quality,Efficiency=efficiency,Combo=combo,Charge=charge,Taps=taps,Overdrives=overdrives,CritRng=critRng,SavedAt=savedAt,LastTap=lastTap,ActiveUntil=activeUntil,CooldownUntil=cooldownUntil,QualityUsed=qualityUsed,ResearchUsed=researchUsed,Tutorial=tutorial,Training=hasTraining?training:null,ResearchJob=hasResearchJob?researchJob:null};
            Game.Validate(s);return s.Copy();
        }
    }
}
