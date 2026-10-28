using System;
using System.Linq;
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
        public string id,key;public double startedAt;public bool startRecorded;public bool identityRecorded;public int slot;public NumberData paidData;public bool paidDataRecorded; public double required,done; public bool intro,modelTransferEligible;
        public Job Copy(){var j=(Job)MemberwiseClone();if(paidDataRecorded)j.paidData=ScientificNumber.FromData(paidData).ToData();else j.paidData=null;return j;}
    }
    public sealed class GameState
    {
        public ItemV3State ItemSystemV3;
        public ScientificNumber LifetimeCreditsExact=ScientificNumber.Zero;public bool LifetimeCreditsExactRecorded;public ScientificNumber LifetimeEligibleExact=ScientificNumber.Zero;public bool LifetimeEligibleExactRecorded;public ScientificNumber LifetimeDataExact=ScientificNumber.Zero;public bool LifetimeDataExactRecorded;public ScientificNumber RunCredits=ScientificNumber.Zero;public bool RunCreditsRecorded;public ScientificNumber Credits=ScientificNumber.Zero, Data=ScientificNumber.Zero;
        public long[] Hardware=new long[Balance.Hardware.Length];
        public int[] Research=new int[Balance.Research.Length];
        public int Quality,Efficiency,Combo,Charge; public long Taps,Overdrives,ModelLevel; public uint CritRng=(uint)Balance.InitialCritRng;
        public double SavedAt,LastTap=-1,ActiveUntil,CooldownUntil;
        public bool QualityUsed,ResearchUsed; public string Tutorial="tap";
        internal AdvanceCapture AdvanceLog;
        public GuidanceState Guidance=new GuidanceState();public LegacyState Legacy=new LegacyState();public WebArchive Web=new WebArchive();public ReturnReceipt Return=new ReturnReceipt();
        public StoryState Story=StoryState.Legacy("tap");public LocalJournal Journal=LocalJournal.New(0,false);
        public AppSettings Settings=AppSettings.New();public AdState Ads=AdState.New();public CommerceState Commerce=CommerceState.New();public UpgradeState Upgrades=UpgradeState.New();public CapsuleState Capsules=CapsuleState.New(0);
        public MarketState Market=MarketState.New();
        public SignalState Signals=SignalState.New();
        public RewardState Rewards=RewardState.New();
        public MissionState Missions=MissionState.Migrated();
        public RetentionState Retention=RetentionState.Migrated();
        public LifetimeState Lifetime=new LifetimeState{initialized=true};
        public ChallengeState Challenges=new ChallengeState();public IndustryState Industry=new IndustryState();public MetaState Meta=new MetaState();public WorkshopState Workshop=new WorkshopState();public PrestigeState Prestige=new PrestigeState();
        public Job Training,ResearchJob;
        public GameState Copy() { var s=(GameState)MemberwiseClone();s.ItemSystemV3=ItemSystemV3?.Copy();s.Hardware=(long[])Hardware.Clone();s.Research=(int[])Research.Clone();s.Training=Training?.Copy();s.ResearchJob=ResearchJob?.Copy();s.Workshop=Workshop.Copy();s.Prestige=Prestige.Copy();s.Meta=Meta.Copy();s.Industry=Industry.Copy();s.Challenges=Challenges.Copy();s.Lifetime=Lifetime.Copy();s.Retention=Retention.Copy();s.Missions=Missions.Copy();s.Rewards=Rewards.Copy();s.Signals=Signals.Copy();s.Market=Market.Copy();s.Upgrades=Upgrades.Copy();s.Capsules=Capsules.Copy();s.Commerce=Commerce.Copy();s.Ads=Ads.Copy();s.Settings=Settings.Copy();s.Guidance=Guidance.Copy();s.Legacy=Legacy.Copy();s.Web=Web.Copy();s.Return=Return.Copy();s.Story=Story.Copy();s.Journal=Journal.Copy();return s; }
    }
    // Explicit, separate Unity save/fixture schema. Web saves are never silently consumed.
    [Serializable] public class MainStateData
    {
        public NumberData lifetimeCreditsExact;public bool lifetimeCreditsExactRecorded;public NumberData lifetimeEligibleExact;public bool lifetimeEligibleExactRecorded;public NumberData lifetimeDataExact;public bool lifetimeDataExactRecorded;public NumberData runCredits;public bool runCreditsRecorded;public NumberData credits,data; public long[] hardware; public int[] research;
        public int quality,efficiency,combo,charge; public long taps,overdrives,modelLevel;public bool modelLevelRecorded; public uint critRng;
        public double savedAt,lastTap,activeUntil,cooldownUntil;
        public bool qualityUsed,researchUsed; public string tutorial;
        public IndustryState industry;public MetaState meta;public PrestigeState prestige; public WorkshopState workshop; public bool hasTraining,hasResearchJob; public Job training,researchJob;
        public ChallengeProgress challengeProgress;public LifetimeState lifetime;public RetentionState retention;public MissionState missions;public RewardState rewards;public SignalState signals;public MarketState market;public UpgradeState upgrades;public CapsuleState capsules;public CommerceState commerce;public AdState ads;public AppSettings settings;public GuidanceState guidance;public LegacyState legacy;public WebArchive webArchive;public ReturnReceipt returnReceipt;public bool storyRecorded;public StoryState story;public LocalJournal journal;
        static void Fill(MainStateData d,GameState s){if(s.ItemSystemV3!=null)throw new NotSupportedException("Item V3 migration is not yet accepted; original save remains unchanged.");d.lifetimeCreditsExact=s.LifetimeCreditsExact.ToData();d.lifetimeCreditsExactRecorded=s.LifetimeCreditsExactRecorded;d.lifetimeEligibleExact=s.LifetimeEligibleExact.ToData();d.lifetimeEligibleExactRecorded=s.LifetimeEligibleExactRecorded;d.lifetimeDataExact=s.LifetimeDataExact.ToData();d.lifetimeDataExactRecorded=s.LifetimeDataExactRecorded;d.runCredits=s.RunCredits.ToData();d.runCreditsRecorded=s.RunCreditsRecorded;d.guidance=s.Guidance.Copy();d.legacy=s.Legacy.Copy();d.webArchive=s.Web.Copy();d.returnReceipt=s.Return.Copy();d.storyRecorded=true;d.story=s.Story.Copy();d.journal=s.Journal.Copy(true);d.settings=s.Settings.Copy();d.ads=s.Ads.Copy();d.commerce=s.Commerce.Copy();d.upgrades=s.Upgrades.Copy();d.capsules=s.Capsules.Copy();d.market=s.Market.Copy();d.signals=s.Signals.Copy();d.rewards=s.Rewards.Copy();d.missions=s.Missions.Copy();d.modelLevelRecorded=true;d.modelLevel=s.ModelLevel;d.retention=s.Retention.Copy();d.lifetime=s.Lifetime.Copy();d.industry=s.Industry.Copy();d.meta=s.Meta.Copy();d.prestige=s.Prestige.Copy();d.workshop=s.Workshop.Copy();d.credits=s.Credits.ToData();d.data=s.Data.ToData();d.hardware=(long[])s.Hardware.Clone();d.research=(int[])s.Research.Clone();d.quality=s.Quality;d.efficiency=s.Efficiency;d.combo=s.Combo;d.charge=s.Charge;d.taps=s.Taps;d.overdrives=s.Overdrives;d.critRng=s.CritRng;d.savedAt=s.SavedAt;d.lastTap=s.LastTap;d.activeUntil=s.ActiveUntil;d.cooldownUntil=s.CooldownUntil;d.qualityUsed=s.QualityUsed;d.researchUsed=s.ResearchUsed;d.tutorial=s.Tutorial;d.hasTraining=s.Training!=null;d.hasResearchJob=s.ResearchJob!=null;d.training=s.Training?.Copy();d.researchJob=s.ResearchJob?.Copy();d.challengeProgress=s.Challenges.Progress.Copy();}
        public static StateData From(GameState s){var d=new StateData{hasChallenge=s.Challenges.Run!=null,challengeRun=s.Challenges.Run?.Copy(),challengeMain=s.Challenges.Main==null?null:FromMain(s.Challenges.Main)};Fill(d,s);return d;}
        public static MainStateData FromMain(GameState s){var d=new MainStateData();Fill(d,s);return d;}

        public GameState ToState(bool legacy=false,bool beforePrestige=false,bool beforeMeta=false,bool beforeIndustry=false,bool beforeChallenges=false,bool deferSession=false)
        {
            if(legacy){if(research==null||research.Length!=5)throw new FormatException("Invalid v1 research");Array.Resize(ref research,Balance.Research.Length);workshop=new WorkshopState{runStartedAt=savedAt};}
            if(!legacy&&(beforePrestige||beforeMeta||beforeIndustry)&&research!=null&&research.Length==10)Array.Resize(ref research,Balance.Research.Length);
            if(legacy||beforePrestige||beforeMeta||beforeIndustry)industry=new IndustryState{discovered=Balance.Hardware.Select((h,n)=>hardware[n]>0||workshop.milestones.Any(k=>k.StartsWith(h.Id+":"))).ToArray(),families=IndustryBalance.FamilyHardware.Select((h,n)=>n==0||Array.IndexOf(Balance.Hardware.Select(v=>v.Id).ToArray(),h)>=0&&(hardware[Array.FindIndex(Balance.Hardware,v=>v.Id==h)]>0||workshop.milestones.Any(k=>k.StartsWith(h+":")))).ToArray()};
            if(legacy||beforePrestige){prestige=new PrestigeState{historicalIncomeUnavailable=true,known=(string[])workshop.nodes.Clone()};if(workshop.hasAnalysis)workshop.analysis.rareGuarantee=workshop.nodes.Contains("W03");}
            if(legacy||beforePrestige||beforeMeta){meta=MetaState.New(savedAt);meta.cycleStartedAt=workshop.runStartedAt;meta.cycleRecords=new[]{quality,efficiency,workshop.integration};if(prestige.lab)meta.tutorial="lab";if(workshop.hasAnalysis)workshop.analysis.quantityIntegral=workshop.analysis.done;int model=Array.FindIndex(MetaBalance.Models,m=>m.Id==workshop.activeModel);if(model>=0)meta.models[model]=workshop.activeModelLevel;}
            if(industry!=null){if(!industry.hasSynthesis)industry.synthesis=null;if(industry.foundries!=null)foreach(var f in industry.foundries)if(f!=null&&!f.hasActive)f.active=null;}
            if(legacy||beforePrestige||beforeMeta||beforeIndustry||beforeChallenges)challengeProgress=new ChallengeProgress();
            if(rewards!=null&&rewards.hasReceipt&&rewards.receipt!=null&&!rewards.receipt.metadataRecorded){rewards.receipt.metadataRecorded=true;rewards.receipt.kind="chest";rewards.receipt.payment="season";rewards.receipt.cost=0;}
            bool missingMissions=missions==null||!missions.initialized;if(missingMissions&&lifetime!=null&&lifetime.initialized&&lifetime.analysesCompleted>0)industry.firstAnalysisReward=true;
            var s=new GameState {LifetimeCreditsExact=lifetimeCreditsExact==null?ScientificNumber.Zero:ScientificNumber.FromData(lifetimeCreditsExact),LifetimeCreditsExactRecorded=lifetimeCreditsExactRecorded,LifetimeEligibleExact=lifetimeEligibleExact==null?ScientificNumber.Zero:ScientificNumber.FromData(lifetimeEligibleExact),LifetimeEligibleExactRecorded=lifetimeEligibleExactRecorded,LifetimeDataExact=lifetimeDataExact==null?ScientificNumber.Zero:ScientificNumber.FromData(lifetimeDataExact),LifetimeDataExactRecorded=lifetimeDataExactRecorded,RunCredits=runCredits==null?ScientificNumber.Zero:ScientificNumber.FromData(runCredits),RunCreditsRecorded=runCreditsRecorded,Guidance=guidance??new GuidanceState(),Legacy=this.legacy??new LegacyState(),Web=webArchive??new WebArchive(),Return=returnReceipt==null||!returnReceipt.initialized?new ReturnReceipt():returnReceipt,Story=!storyRecorded||story==null||!story.initialized?StoryState.Legacy(tutorial):StoryState.Restore(story),Journal=journal==null||!journal.initialized?LocalJournal.New(0,false):LocalJournal.Restore(journal),Settings=settings==null||!settings.initialized?AppSettings.New(workshop?.reducedMotion??false):settings,Ads=ads==null||!ads.initialized?AdState.New():ads,Commerce=commerce==null||!commerce.initialized?CommerceState.New():commerce,Upgrades=upgrades==null||!upgrades.initialized?UpgradeState.New():upgrades,Capsules=capsules==null||!capsules.initialized?CapsuleState.New(0):capsules,Market=market==null||!market.initialized?MarketState.New():market,Signals=signals==null||!signals.initialized?SignalState.New():signals,Rewards=rewards==null||!rewards.initialized?RewardState.New():rewards,Missions=missingMissions?MissionState.Migrated():missions,ModelLevel=modelLevelRecorded?modelLevel:(long)quality+efficiency+(workshop?.integration??0),Retention=retention==null||!retention.initialized?RetentionState.Migrated():retention,Lifetime=lifetime==null||!lifetime.initialized?new LifetimeState{initialized=true,historicalUnavailable=true,since=savedAt}:lifetime,Challenges=new ChallengeState{Progress=challengeProgress},Industry=industry,Meta=meta,Prestige=prestige,Workshop=workshop,Credits=ScientificNumber.FromData(credits),Data=ScientificNumber.FromData(data),Hardware=hardware,Research=research,Quality=quality,Efficiency=efficiency,Combo=combo,Charge=charge,Taps=taps,Overdrives=overdrives,CritRng=critRng,SavedAt=savedAt,LastTap=lastTap,ActiveUntil=activeUntil,CooldownUntil=cooldownUntil,QualityUsed=qualityUsed,ResearchUsed=researchUsed,Tutorial=tutorial,Training=hasTraining?training:null,ResearchJob=hasResearchJob?researchJob:null};
            AdRewards.MigrateJobs(s);if(deferSession)return s;Game.Validate(s);return s.Copy();
        }
    }
    // A bounded main snapshot has no active-session fields: no recursive JSON graph.
    [Serializable] public sealed class StateData:MainStateData
    {
        public bool hasChallenge;public ChallengeRun challengeRun;public MainStateData challengeMain;
        public new GameState ToState(bool legacy=false,bool beforePrestige=false,bool beforeMeta=false,bool beforeIndustry=false,bool beforeChallenges=false)
        {
            var s=base.ToState(legacy,beforePrestige,beforeMeta,beforeIndustry,beforeChallenges,true);
            if(!(legacy||beforePrestige||beforeMeta||beforeIndustry||beforeChallenges)&&hasChallenge){s.Challenges.Run=challengeRun?.Copy();s.Challenges.Main=challengeMain?.ToState();}
            Game.Validate(s);return s.Copy();
        }
    }

}
