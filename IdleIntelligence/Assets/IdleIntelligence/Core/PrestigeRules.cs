using System;
using System.Linq;
namespace IdleIntelligence.Core
{
    public static class PrestigeRules
    {
        public static bool Has(GameState s,string id)=>(id=="F02"&&s.Challenges.Progress.unlocks.Contains("research-queue"))||(id=="T03"&&s.Challenges.Progress.unlocks.Contains("training-queue"))||(id=="F03"&&s.Challenges.Progress.unlocks.Contains("research-repeat"))||(id=="I06"&&s.Challenges.Progress.unlocks.Contains("prestige-agent"))||s.Workshop.nodes.Contains(id)||s.Legacy.licenses.Contains(id)||(id=="T04"&&s.Workshop.nodes.Contains("T10"))||(id=="I06"&&(s.Workshop.nodes.Contains("I07")||MetaRules.Level(s,"B04")>0||MetaRules.Level(s,"B06")>0));
        public static double E(string key)=>PrestigeBalance.Effect(key);
        public static double V(string key)=>PrestigeBalance.Value(key);
        public static double F(GameState s,string id)=>Has(s,id)?E(id):1;
        public static double Weight(GameState s)
        {
            double archive=Workshop.Equipped(s).Where(i=>i.type=="insight-archive").Sum(i=>E("archiveINT")*Workshop.SpecialScale(s,i)*Workshop.Amplifier(s));
            return (1+(Has(s,"I02")?Math.Min(E("I02cap"),E("I02per")*s.Prestige.milestones.Length):0)+(Has(s,"I03")?E("I03per")*Math.Min(E("I03cap"),s.Quality+s.Efficiency+s.Workshop.integration):0)+(Has(s,"I04")?E("I04per")*Math.Min(E("I04cap"),s.Research.Sum()):0)+Math.Min(E("archiveINTcap"),archive))*F(s,"I09");
        }
        public static double Exponent(GameState s)=>V("intBaseExponent")+V("intAxiomExponent")*MetaRules.Level(s,"A01")+(Has(s,"I10")?V("intNodeExponent"):0);
        static double Expm1(double x)=>Math.Abs(x)<1e-5?x+x*x/2+x*x*x/6+x*x*x*x/24:Math.Exp(x)-1;
        static double Log1p(double x)=>Math.Abs(x)<1e-5?x-x*x/2+x*x*x/3-x*x*x*x/4:Math.Log(1+x);
        // Only newly earned eligible income contributes, with the BEFORE-transaction weight.
        public static void Earn(GameState s,ScientificNumber delta)
        {
            var p=s.Prestige;var r=p.Eligible;double exponent=Exponent(s);ScientificNumber increment;
            if(r.IsZero)increment=delta.Divide(ScientificNumber.From(V("prestigeBaseRevenue"))).Pow(exponent);
            else {var ratio=delta.Divide(r);var relative=ratio.Log10() < -6?ratio.Times(exponent):ratio.Log10()>6?ratio.Add(ScientificNumber.One).Pow(exponent).Subtract(ScientificNumber.One):ScientificNumber.From(Expm1(exponent*Log1p(ratio.ToDouble())));increment=r.Divide(ScientificNumber.From(V("prestigeBaseRevenue"))).Pow(exponent).Multiply(relative);}
            p.Entitlement=p.Entitlement.Add(increment.Times(Weight(s)));p.Eligible=r.Add(delta);s.LifetimeCreditsExact=s.LifetimeCreditsExact.Add(delta);s.LifetimeEligibleExact=s.LifetimeEligibleExact.Add(delta);s.RunCredits=s.RunCredits.Add(delta);s.Credits=s.Credits.Add(delta);
        }
        public static ScientificNumber Claim(GameState s)
        {var n=s.Prestige.Entitlement;var whole=n.Exponent<15?ScientificNumber.From(Math.Floor(n.ToDouble()+1e-11)):n.Floor();return whole.Subtract(s.Prestige.Cycle);}
        public static ScientificNumber CreditFactor(GameState s)=>s.Prestige.Cycle.Add(ScientificNumber.One).Pow(V("intCreditExponent")+(Has(s,"I05")?V("intCreditNodeExponent"):0)+(Has(s,"I10")?V("intCreditNodeExponent"):0));
        public static GameState Buy(GameState state,string id)
        {
            var node=PrestigeBalance.Nodes.FirstOrDefault(n=>n.Id==id);if(ChallengeRules.Active(state)||node==null||Has(state,id)||state.Prestige.Free.CompareTo(ScientificNumber.From(node.Cost))<0)return state;
            var s=state.Copy();s.Prestige.Free=s.Prestige.Free.Subtract(ScientificNumber.From(node.Cost));s.Prestige.Spent=s.Prestige.Spent.Add(ScientificNumber.From(node.Cost));s.Workshop.nodes=s.Workshop.nodes.Concat(new[]{id}).ToArray();s.Prestige.known=s.Prestige.known.Union(new[]{id}).ToArray();
            if(id=="W01"||id=="W02"||id=="W06")s.Workshop.permanentSlots=ItemBalance.Slots.Where((slot,i)=>i>=3&&i<6&&Workshop.ActiveSlots(s)[i]).ToArray();s.Prestige.revision++;s.Workshop.revision++;LocalJournal.Record(s,"prestige-node-buy",permanent:false);return s;
        }
        public static void Discover(GameState s)
        {
            var p=s.Prestige;for(int i=0;i<3;i++)s.Meta.cycleRecords[i]=Math.Max(s.Meta.cycleRecords[i],Game.TrainingLevel(s,PrestigeAutomation.Tracks[i]));if(p.Cycle.CompareTo(ScientificNumber.FromData(p.best))>0)p.best=p.Cycle.ToData();if(!p.lab&&p.Total.CompareTo(ScientificNumber.From(V("labThreshold")))>=0){p.lab=true;s.Meta.tutorial="lab";}
            if(p.lab&&!p.labSeed){p.knowledge=ScientificNumber.FromData(p.knowledge).Add(ScientificNumber.From(V("labSeed"))).ToData();p.labSeed=true;}
        }
        public static ScientificNumber KnowledgeRate(GameState s)
        {if(!s.Prestige.lab)return ScientificNumber.Zero;var floor=ScientificNumber.FromData(s.Prestige.best).Times(V("knowledgeFloor"));return (s.Prestige.Cycle.CompareTo(floor)>0?s.Prestige.Cycle:floor).Pow(.5).Times(V("knowledgeRate")*F(s,"I08")*(1+Workshop.Device(s,"insight"))).Multiply(ScientificNumber.FromData(s.Meta.total).Add(ScientificNumber.One).Pow(V("knowledgeAxiomPower")*MetaRules.Level(s,"D01")));}
        public static GameState Reset(GameState state,long expectedRevision=-1)
        {
            if(expectedRevision>=0&&state.Prestige.revision!=expectedRevision)return state;var gain=Claim(state);if(gain.CompareTo(ScientificNumber.One)<0||ChallengeRules.Active(state)&&gain.CompareTo(ChallengeRules.Current(state).MinimumINT)<0)return state;
            var s=state.Copy();var p=s.Prestige;p.Cycle=p.Cycle.Add(gain);p.Total=p.Total.Add(gain);p.Free=p.Free.Add(gain);p.lastGain=gain.ToData();p.resets++;p.revision++;Discover(s);s=Workshop.Discover(s);p=s.Prestige;foreach(var f in s.Industry.foundries)f.queue=Array.Empty<string>();
            s.Legacy.classUpgrades=Array.Empty<string>();s.Legacy.classUpgradesRecorded=true;s.RunCredits=ScientificNumber.Zero;s.RunCreditsRecorded=true;s.Hardware=new long[s.Hardware.Length];s.Credits=ScientificNumber.From(Balance.StartCredits);
            if(!Has(s,"T08")){s.ModelLevel=0;s.Quality=s.Efficiency=s.Workshop.integration=0;s.Training=null;}
            p.trainingQueue=Array.Empty<TrainingTarget>();p.researchQueue=Array.Empty<string>();
            // Modules were paid at enqueue time. Release only waiting contracts, as in TS.
            foreach(var job in p.moduleQueue){var d=ItemBalance.Modules.First(m=>m.Id==job.id);s.Data=s.Data.Add(ScientificNumber.From(d.Data));for(int c=0;c<d.Costs.Length;c++)s.Workshop.components[c]+=(long)d.Costs[c];}p.moduleQueue=Array.Empty<Job>();
            s.Industry.trainingStarted=0;s.Workshop.runStartedAt=s.SavedAt;s.Workshop.qualityCompletions=s.Workshop.efficiencyCompletions=0;s.Workshop.lastTrack="";p.milestones=Array.Empty<string>();p.autoSeconds=p.otherAutoSeconds=0;ResetControls.ClearIntent(s);p.intentResearch=Array.Empty<string>();p.intentTraining=p.intentAnalysis=p.intentCrafting=false;
            s.Lifetime.prestiges++;s.Lifetime.intEarned+=gain.ToDouble();s.Lifetime.runMilestoneClasses=Array.Empty<string>();s.Combo=s.Charge=0;s.LastTap=-1;s.ActiveUntil=s.CooldownUntil=0;s.Workshop.revision++;
            if(ChallengeRules.Active(s)){var m=s.Challenges.Run.metrics;m.minimumINT=m.prestiges==0||ScientificNumber.FromData(m.minimumINT).CompareTo(gain)>0?gain.ToData():m.minimumINT;m.prestiges++;}s=MetaAutomation.Rebuild(MetaRules.Phase(s,0));if(Has(s,"I06"))s=Game.Buy(s,"calculator");LocalJournal.Record(s,"prestige",permanent:true,run:state.Prestige.resets);LocalBalanceHistory.Close(state,s,"prestige",gain);return s;
        }
        public static void Validate(GameState s)
        {
            var p=s.Prestige;if(p==null||p.schema!=1||p.resets<0||p.revision<0||p.known==null||p.milestones==null||p.known.Distinct().Count()!=p.known.Length||p.known.Any(id=>!PrestigeBalance.Nodes.Any(n=>n.Id==id))||p.hardwareAuto==null||p.hardwareAuto.Length!=s.Hardware.Length||p.trainingTargets==null||p.trainingTargets.Length!=3||p.trainingTargets.Any(n=>n<0)||p.trainingQueue==null||p.trainingQueue.Length>2||p.trainingQueue.Any(t=>t==null||!new[]{"quality","efficiency","integration"}.Contains(t.track)||t.level<1)||p.labs==null||p.labs.Length>GemBalance.MaximumLabs-1||p.researchQueue==null||p.researchQueue.Length>8||p.researchQueue.Any(id=>Game.ResearchIndex(id)<0)||p.researchQueue.Distinct().Count()!=p.researchQueue.Length||p.researchTargets==null||p.researchTargets.Length>(Game.Level(s,"researchScheduling")>0?6:3)||p.researchTargets.Any(t=>t==null||Game.ResearchIndex(t.id)<0||t.level<1||Balance.Research[Game.ResearchIndex(t.id)].Project&&t.level!=1)||p.researchTargets.Select(t=>t.id).Distinct().Count()!=p.researchTargets.Length||p.intentForgeKeys==null||p.moduleQueue==null||p.moduleQueue.Length>100||p.moduleQueue.Any(j=>j==null||!ItemBalance.Modules.Any(m=>m.Id==j.id)||!ScientificNumber.Finite(j.required)||j.required<=0||!ScientificNumber.Finite(j.done)||j.done!=0)||p.intentResearch==null)throw new FormatException("Invalid prestige state");
            foreach(var n in new[]{p.eligible,p.entitlement,p.cycleINT,p.totalINT,p.unspent,p.spent,p.best,p.knowledge,p.lastGain,p.creditReserve,p.dataReserve,p.directorBudget,p.directorSpent})ScientificNumber.FromData(n);
            if(p.Free.Add(p.Spent).CompareTo(p.Cycle)!=0||p.Total.CompareTo(p.Cycle)<0||p.Entitlement.Add(ScientificNumber.From(1e-9)).CompareTo(p.Cycle)<0||!ScientificNumber.Finite(p.autoSeconds)||p.autoSeconds<0||!ScientificNumber.Finite(p.otherAutoSeconds)||p.otherAutoSeconds<0||!ScientificNumber.Finite(p.agentSeconds)||p.agentSeconds<0||!ScientificNumber.Finite(p.researchAutoSeconds)||p.researchAutoSeconds<0||!new[]{0d,.25,.5,.75}.Contains(p.reservePercent)||!new[]{0d,.25,.5,.75}.Contains(p.directorReservePercent)||!ScientificNumber.Finite(p.agentMinimum)||p.agentMinimum<0||!p.agentMinimumExactRecorded&&p.agentMinimum==0||p.Minimum.IsZero||!new[]{15d,30,60,120}.Contains(p.agentMinutes)||!new[]{0d,2,5,10}.Contains(p.relative)||!ScientificNumber.Finite(p.maximumRunSeconds)||p.maximumRunSeconds<0)throw new FormatException("Invalid prestige ledger/settings");
            foreach(var j in p.labs)if(j!=null&&(Game.ResearchIndex(j.id)<0||!ScientificNumber.Finite(j.required)||j.required<=0||!ScientificNumber.Finite(j.done)||j.done<0||j.done>j.required+1e-6))throw new FormatException("Invalid extra research work");
        }
    }
}
