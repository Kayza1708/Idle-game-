using System;
using System.Linq;
using System.Collections.Generic;
namespace IdleIntelligence.Core
{
    public static class PrestigeAutomation
    {
        public static readonly string[] Tracks={"quality","efficiency","integration"};
        public static int LabCount(GameState s)=>Math.Min(ChallengeRules.Is(s,"serial-science")?1:int.MaxValue,s.Upgrades.purchasedLabs+1+(PrestigeRules.Has(s,"F01")?1:0)+(PrestigeRules.Has(s,"F04")?1:0)+(PrestigeRules.Has(s,"F08")?1:0));
        public static IEnumerable<Job> ResearchJobs(GameState s)=>new[]{s.ResearchJob}.Concat(s.Prestige.labs).Where(j=>j!=null);
        public static GameState QueueTraining(GameState state,string track)
        {
            var p=state.Prestige;if(!PrestigeRules.Has(state,"T03")||p.trainingQueue.Length>=2||!Game.TrainingAvailable(state,track))return state;
            int target=Game.TrainingLevel(state,track)+(state.Training?.id==track?1:0)+p.trainingQueue.Count(j=>j.track==track)+1;if(track=="integration"&&target>MetaRules.IntegrationLimit(state))return state;
            var s=state.Copy();s.Prestige.trainingQueue=p.trainingQueue.Concat(new[]{new TrainingTarget{track=track,level=target}}).ToArray();return s;
        }
        public static int ResearchCapacity(GameState s)=>(int)((PrestigeRules.Has(s,"F02")?IndustryBalance.QueueF02:IndustryBalance.QueueBase)+(Game.Level(s,"operations")>0?IndustryBalance.QueueOperations:0));
        public static bool CanQueueResearch(GameState state,string id)
        {
            int index=Game.ResearchIndex(id);var p=state.Prestige;return index>=0&&!p.researchQueue.Contains(id)&&p.researchQueue.Length<ResearchCapacity(state)&&!ResearchJobs(state).Any(j=>j.id==id)&&!(Balance.Research[index].Project&&state.Research[index]>0)&&!Balance.Research[index].Requires.Any(r=>Game.Level(state,r.Id)<r.Level);
        }
        public static GameState QueueResearch(GameState state,string id)
        {if(!CanQueueResearch(state,id))return state;var s=state.Copy();s.Prestige.researchQueue=s.Prestige.researchQueue.Concat(new[]{id}).ToArray();return s;}
        static string DesiredTrack(GameState s)
        {if(s.Training!=null)return null;if(s.Prestige.trainingQueue.Length>0)return s.Prestige.trainingQueue[0].track;if(!s.Prestige.trainingAuto||!PrestigeRules.Has(s,"T06"))return null;return Tracks.Where(t=>Game.TrainingAvailable(s,t)).OrderBy(t=>Game.TrainingLevel(s,t)).FirstOrDefault(t=>s.Prestige.trainingTargets[Array.IndexOf(Tracks,t)]==0||Game.TrainingLevel(s,t)<s.Prestige.trainingTargets[Array.IndexOf(Tracks,t)]);}
        public static ScientificNumber ProtectedCredits(GameState s)
        {var reserve=ScientificNumber.FromData(s.Prestige.creditReserve);string track=DesiredTrack(s);if(track==null)return reserve;var cost=Game.TrainingCost(s,track);return reserve.Add(cost);}
        public static ScientificNumber ProtectedData(GameState s)
        {var reserve=ScientificNumber.FromData(s.Prestige.dataReserve);if(s.Training==null&&(s.Prestige.trainingQueue.FirstOrDefault()?.track=="integration"||s.Prestige.trainingQueue.Length==0&&s.Prestige.trainingAuto&&PrestigeRules.Has(s,"T06")&&PrestigeRules.Has(s,"T04")&&s.Workshop.integration<Math.Min(s.Quality,s.Efficiency)&&(s.Prestige.trainingTargets[2]==0||s.Workshop.integration<s.Prestige.trainingTargets[2]))){var cost=Game.TrainingData(s,"integration");if(cost.CompareTo(reserve)>0)reserve=cost;}return reserve;}
        public static GameState StartJobs(GameState state)
        {
            if(state.Prestige.resetIntent)return state;var s=state;
            if(s.Training==null)
            {
                if(s.Prestige.trainingQueue.Any(j=>j.level<=Game.TrainingLevel(s,j.track))){s=s.Copy();s.Prestige.trainingQueue=s.Prestige.trainingQueue.Where(j=>j.level>Game.TrainingLevel(s,j.track)).ToArray();}
                string track=DesiredTrack(s);if(track!=null&&(s.Prestige.trainingQueue.Length>0||s.Credits.CompareTo(Game.TrainingCost(s,track).Add(ScientificNumber.FromData(s.Prestige.creditReserve)))>=0))
                {var before=s;var next=Game.Train(s,track);if(!ReferenceEquals(next,before)){s=next;if(s.Prestige.trainingQueue.Length>0)s.Prestige.trainingQueue=s.Prestige.trainingQueue.Skip(1).ToArray();}}
            }
            if(!s.Workshop.hasModuleJob&&s.Prestige.moduleQueue.Length>0){s=s.Copy();s.Workshop.moduleJob=s.Prestige.moduleQueue[0].Copy();s.Workshop.hasModuleJob=true;s.Prestige.moduleQueue=s.Prestige.moduleQueue.Skip(1).ToArray();}
            return StartResearchQueue(s);
        }
        public static GameState StartResearchQueue(GameState state)
        {
            if(state.Prestige.resetIntent)return state;var s=state;
            for(int attempt=0;attempt<GemBalance.MaximumLabs&&AdRewards.FreeLab(s)>=0;attempt++)
            {
                string candidate=null;
                foreach(string id in s.Prestige.researchQueue){int n=Game.ResearchIndex(id);if(Balance.Research[n].Project&&s.Research[n]>0||ResearchJobs(s).Any(j=>j.id==id))continue;string block=Game.ResearchBlock(s,n);if(block=="Zu wenig Daten")return s;if(block==null){candidate=id;break;}}
                if(candidate==null)break;var before=s;s=Game.Research(s,candidate);if(ReferenceEquals(before,s))break;var job=ResearchJobs(s).First(j=>j.id==candidate);job.required=Math.Max(.001,job.required*(1-Workshop.Device(before,"planning")*PrestigeRules.V("planningTime")));s.Prestige.researchQueue=s.Prestige.researchQueue.Where(id=>id!=candidate).ToArray();
            }
            return s;
        }
        // Shared paid start: each later lab observes the preceding debit.
        public static GameState ResearchAuto(GameState state)
        {
            if(state.Prestige.resetIntent)return state;var s=StartJobs(state);foreach(string id in s.Prestige.researchQueue){string block=Game.ResearchBlock(s,Game.ResearchIndex(id));if(block=="Zu wenig Daten")return s;if(block==null)break;}
            for(int slot=ResearchJobs(s).Count();slot<LabCount(s);slot++)
            {
                int chosen=-1;var p=s.Prestige;
                if(p.director&&PrestigeRules.Has(s,"F05"))
                {
                    foreach(var target in p.researchTargets.Where(t=>Game.Level(s,t.id)<t.level&&!ResearchJobs(s).Any(j=>j.id==t.id)))
                    {int i=Game.ResearchIndex(target.id);var cost=Game.ResearchCost(s,i);bool valid=Game.ResearchBlock(s,i)==null&&p.directorBudgetSet&&cost.CompareTo(ScientificNumber.FromData(p.directorBudget).Subtract(ScientificNumber.FromData(p.directorSpent)))<=0&&cost.CompareTo(s.Data.Times(1-p.directorReservePercent))<=0;if(valid){chosen=i;break;}if(!p.directorAffordable)break;}
                }
                else if(p.researchRepeat&&PrestigeRules.Has(s,"F03")){int i=Game.ResearchIndex(p.repeatId);if(i>=0&&!Balance.Research[i].Project&&Game.ResearchBlock(s,i)==null)chosen=i;}
                if(chosen<0)break;var price=Game.ResearchCost(s,chosen);if(s.Data.CompareTo(price.Add(ProtectedData(s)))<0)break;var before=s;s=Game.Research(s,Balance.Research[chosen].Id);if(ReferenceEquals(s,before))break;
                // Device planning is exclusively an automatic-start modifier in TS.
                var job=ResearchJobs(s).First(j=>j.id==Balance.Research[chosen].Id);job.required=Math.Max(.001,job.required*(1-Workshop.Device(before,"planning")*PrestigeRules.V("planningTime")));
                if(p.director&&PrestigeRules.Has(s,"F05"))s.Prestige.directorSpent=ScientificNumber.FromData(p.directorSpent).Add(price).ToData();
            }return s;
        }
        public static bool HardwareUnlocked(GameState s,int index)=>s.Legacy.autobuyers.Contains(Balance.Hardware[index].Id)||PrestigeRules.Has(s,PrestigeBalance.HardwareGroup[index]);
        public static GameState ToggleHardware(GameState state,int index)
        {if(index<0||index>=state.Hardware.Length||!HardwareUnlocked(state,index))return state;var s=state.Copy();s.Prestige.hardwareAuto[index]=!s.Prestige.hardwareAuto[index];return s;}
        public static GameState Hardware(GameState state,bool shoppingDue=true,bool otherDue=true)
        {
            if(state.Prestige.resetIntent)return state;var s=state;
            for(int n=0;n<s.Hardware.Length;n++)if(s.Prestige.hardwareAuto[n]&&HardwareUnlocked(s,n)&&(n<2?shoppingDue:otherDue))
            {var reserve=ProtectedCredits(s);var ordinary=n<2?s.Credits.Times(n==0&&s.Hardware.All(c=>c==0)?0:s.Prestige.reservePercent):ScientificNumber.Zero;if(ordinary.CompareTo(reserve)>0)reserve=ordinary;var cost=Game.HardwareCost(s,n);if(s.Credits.CompareTo(cost.Add(reserve))>=0)s=Game.Buy(s,Balance.Hardware[n].Id);}
            return s;
        }
        public static string JobIdentity(Job j)=>string.IsNullOrEmpty(j?.key)?j?.id??"":j.key;
        public static string AnalysisIdentity(GameState s)=>s.Workshop.hasAnalysis?(s.Workshop.analysis.key??"legacy-analysis"):s.Industry.synthesis!=null?JobIdentity(s.Industry.synthesis):"";
        public static string ForgeIdentity(ForgeJob job)=>string.IsNullOrEmpty(job.key)?"legacy-forge:"+job.itemId+":"+job.target:job.key;
        public static GameState Agent(GameState state)
        {
            state=MetaAutomation.Rebuild(state);var p=state.Prestige;bool meta=state.Meta.axiomAuto&&MetaRules.Level(state,"B06")>0&&state.SavedAt-state.Meta.cycleStartedAt>=PrestigeRules.V("autoAxiomMinSeconds")*1000&&MetaRules.Reward(state).CompareTo(ScientificNumber.FromData(state.Meta.axiomMinimum))>=0;if(!p.resetIntent)
            {
                var reward=PrestigeRules.Claim(state);var last=ScientificNumber.FromData(p.lastGain);var relative=p.relative>0&&!last.IsZero?last.Times(p.relative):p.Minimum;bool timeout=p.maximumRunSeconds>0&&state.SavedAt-state.Workshop.runStartedAt>=p.maximumRunSeconds*1000;
                if(!meta&&(!PrestigeRules.Has(state,"I06")||!p.agent||state.SavedAt-state.Workshop.runStartedAt<p.agentMinutes*60000||reward.CompareTo(p.Minimum)<0||!timeout&&reward.CompareTo(relative)<0))return state;
                state=state.Copy();p=state.Prestige;p.resetIntent=true;state.Meta.intentAxiom=meta;p.intentTraining=p.agentWaitTraining&&state.Training!=null;p.intentResearch=p.agentWaitResearch?ResearchJobs(state).Select(JobIdentity).ToArray():Array.Empty<string>();p.intentAnalysis=p.agentWaitAnalysis&&(state.Workshop.hasAnalysis||state.Industry.synthesis!=null);p.intentCrafting=p.agentWaitCrafting&&state.Workshop.hasModuleJob;p.intentAnalysisKey=p.intentAnalysis?AnalysisIdentity(state):"";p.intentModuleKey=p.intentCrafting?JobIdentity(state.Workshop.moduleJob):"";p.intentForgeKeys=p.agentWaitCrafting?state.Industry.foundries.Where(f=>f.active!=null).Select(f=>ForgeIdentity(f.active)).ToArray():Array.Empty<string>();
            }
            bool waiting=p.intentTraining&&state.Training!=null||p.intentAnalysis&&!string.IsNullOrEmpty(p.intentAnalysisKey)&&AnalysisIdentity(state)==p.intentAnalysisKey||p.intentCrafting&&state.Workshop.hasModuleJob&&JobIdentity(state.Workshop.moduleJob)==p.intentModuleKey||state.Industry.foundries.Any(f=>f.active!=null&&p.intentForgeKeys.Contains(ForgeIdentity(f.active)))||ResearchJobs(state).Any(j=>p.intentResearch.Contains(JobIdentity(j)));return waiting?state:state.Meta.intentAxiom?MetaRules.AxiomReset(state):PrestigeRules.Reset(state);
        }
    }
}
