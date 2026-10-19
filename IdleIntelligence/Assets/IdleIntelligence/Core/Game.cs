using System;
using System.Linq;
namespace IdleIntelligence.Core
{
    // Early V2 only: no Unity APIs, clocks, filesystem, hidden RNG or frame counters.
    public static class Game
    {
        public static GameState New(double now) { var s=new GameState {Meta=MetaState.New(now),Workshop=new WorkshopState{runStartedAt=now},SavedAt=now,Credits=ScientificNumber.From(Balance.StartCredits)};Validate(s);return s; }
        public static void Validate(GameState s)
        {
            if(s==null||s.Credits==null||s.Data==null||s.Hardware==null||s.Hardware.Length!=Balance.Hardware.Length||s.Research==null||s.Research.Length!=Balance.Research.Length)throw new FormatException("Invalid state shape");
            if(s.Hardware.Any(n=>n<0||n>9007199254740991L)||s.Research.Any(n=>n<0)||s.Quality<0||s.Efficiency<0||s.Taps<0||s.Overdrives<0||s.Combo<0||s.Combo>Balance.ComboMax||s.Charge<0||s.Charge>Balance.OverdriveCharge)throw new FormatException("Invalid counts");
            if(!ScientificNumber.Finite(s.SavedAt)||s.SavedAt<0||s.SavedAt>9007199254740991d||!ScientificNumber.Finite(s.LastTap)||s.LastTap < -1||!ScientificNumber.Finite(s.ActiveUntil)||s.ActiveUntil<0||!ScientificNumber.Finite(s.CooldownUntil)||s.CooldownUntil<0)throw new FormatException("Invalid clock");
            if(!new[]{"tap","hardware","production","credits","training","research","done"}.Contains(s.Tutorial))throw new FormatException("Invalid tutorial");
            Workshop.Validate(s);PrestigeRules.Validate(s);MetaRules.Validate(s);
            ValidateJob(s.Training,new[]{"quality","efficiency","integration"});ValidateJob(s.ResearchJob,Balance.Research.Select(r=>r.Id).ToArray());
        }
        static void ValidateJob(Job j,string[] ids) { if(j!=null&&(!ids.Contains(j.id)||!ScientificNumber.Finite(j.required)||j.required<=0||!ScientificNumber.Finite(j.done)||j.done<0||j.done>j.required+1e-6))throw new FormatException("Invalid job"); }
        public static int ResearchIndex(string id)=>Array.FindIndex(Balance.Research,r=>r.Id==id);
        public static int Level(GameState s,string id) { int i=ResearchIndex(id);return i<0?0:s.Research[i]; }
        public static double Bonus(GameState s,string effect)
        {
            double v=0;for(int i=0;i<Balance.Hardware.Length;i++) foreach(var m in Balance.Hardware[i].Milestones)if(s.Hardware[i]>=m.Threshold&&m.Effect==effect)v+=m.Value;return v;
        }
        public static ScientificNumber Compute(GameState s)
        {
            var total=ScientificNumber.Zero;
            for(int i=0;i<s.Hardware.Length;i++) { double factor=1;foreach(var m in Balance.Hardware[i].Milestones)if(s.Hardware[i]>=m.Threshold)factor*=1+m.Compute;total=total.Add(ScientificNumber.From(s.Hardware[i]*Balance.Hardware[i].Compute*factor*(i<2&&s.Hardware[i]>=10?1+Workshop.Device(s,"legacy"):1))); }
            return total.Times(PrestigeRules.F(s,"H06")*(PrestigeRules.Has(s,"H07")?Math.Min(PrestigeRules.E("H07cap"),1+PrestigeRules.E("H07per")*s.Hardware.Sum(n=>Math.Sqrt(n))):1)).Times((PrestigeRules.Has(s,"H09")?PrestigeRules.E("H09")*(1+Math.Min(PrestigeRules.E("H09cap"),PrestigeRules.E("H09per")*s.Hardware.Count(n=>n>=PrestigeRules.E("H09count")))):1)*PrestigeRules.F(s,"H10")).Times(1+Workshop.Device(s,"sparse")+Workshop.Device(s,"photonicCompute")+Workshop.Device(s,"pairs")).Times(Workshop.Combination(s,"parallel-architecture")).Times(1+Workshop.Bonus(s,"compute")+Bonus(s,"compute")+Bonus(s,"synergy")).Multiply(ResearchFactor(s,"computeOptimization")).Times(MetaRules.Factor(s,"compute")).Multiply(ScientificNumber.FromData(s.Meta.total).Add(ScientificNumber.One).Pow(PrestigeRules.E("A03")*MetaRules.Level(s,"A03")));
        }
        static ScientificNumber ResearchFactor(GameState s,string id) { int i=ResearchIndex(id);return i<0?ScientificNumber.One:ScientificNumber.From(Balance.Research[i].Effect).Pow(s.Research[i]); }
        static double Strength(int n)=>n<=Balance.TrainingSoftStart?n:Balance.TrainingSoftStart+Balance.TrainingSoftScale*Math.Log(1+(n-Balance.TrainingSoftStart)/Balance.TrainingSoftScale);
        public static ScientificNumber Users(GameState s)=>Compute(s).Times(Math.Pow(Math.Pow(Balance.EfficiencyBase,Strength(s.Efficiency)),PrestigeRules.F(s,"T02"))/Balance.ComputePerUser).Times(1+Bonus(s,"users")).Multiply(ResearchFactor(s,"userScaling")).Times(MetaRules.Factor(s,"users"));
        public static ScientificNumber Income(GameState s,bool temporary=true)=>Users(s).Times(Balance.RevenuePerUser).Times(1+Workshop.Bonus(s,"credits")+Workshop.Combination(s,"compute-credit-link")).Times(Workshop.ModelCore(s)).Times(1+Workshop.Device(s,"memory")).Times(Math.Pow(Math.Pow(Balance.QualityBase,Strength(s.Quality)),PrestigeRules.F(s,"T01"))).Multiply(ResearchFactor(s,"modelArchitecture")).Multiply(ResearchFactor(s,"commercialization")).Multiply(PrestigeRules.CreditFactor(s)).Times((PrestigeRules.Has(s,"H08")?1+PrestigeRules.E("H08")*s.Hardware.Count(n=>n>0):1)*(PrestigeRules.Has(s,"T07")?1+PrestigeRules.E("T07per")*Math.Min(PrestigeRules.E("T07cap"),s.Quality+s.Efficiency+s.Workshop.integration):1)*PrestigeRules.F(s,"T09")*PrestigeRules.F(s,"I01")).Times(temporary&&s.ActiveUntil>s.SavedAt?OverdriveFactor(s):1).Multiply(MetaRules.CreditFactor(s)).Times(MetaRules.Factor(s,"revenue"));
        public static ScientificNumber DataRate(GameState s)=>Users(s).Pow(Balance.DataPower).Times(Balance.DataScale*(1+Workshop.Bonus(s,"data")+Bonus(s,"data"))).Multiply(ResearchFactor(s,"dataGeneration")).Times((PrestigeRules.Has(s,"F09")?PrestigeRules.E("F09data"):1)*(PrestigeRules.Has(s,"F10")?PrestigeRules.E("F10data"):1)).Times(MetaRules.Factor(s,"data")*(MetaRules.Secondary(s,"K02")?PrestigeRules.E("D06data"):1)*(MetaRules.Secondary(s,"K07")?PrestigeRules.E("D06data"):1));
        public static double WorkSpeed(GameState s,bool research=false)=>(1+Balance.ComputeLogScale*Math.Max(0,Compute(s).Add(ScientificNumber.One).Log10()))*(1+Workshop.Bonus(s,research?"research":"training")+Bonus(s,research?"research":"training"))*(1+Workshop.Combination(s,research?"training-research-link":"learning-pipeline"))*(research?PrestigeRules.F(s,"F06")*PrestigeRules.F(s,"F09")*PrestigeRules.F(s,"F10"):PrestigeRules.F(s,"T05")*(PrestigeRules.Has(s,"T09")?PrestigeRules.E("T09training"):1))*MetaRules.Factor(s,research?"research":"training")*Math.Sqrt(MetaRules.Factor(s,"compute"))*(research?(MetaRules.Secondary(s,"K03")?PrestigeRules.E("D06speed"):1)*(MetaRules.Secondary(s,"K06")?PrestigeRules.E("D06speed"):1):RebuildTraining(s)*(s.Training?.id=="integration"&&MetaRules.Secondary(s,"K08")?PrestigeRules.E("D06data"):1));
        public static ScientificNumber HardwareCost(GameState s,int index,long quantity=1)
        {
            if(index<0||index>=s.Hardware.Length||quantity<1||quantity>9007199254740991L-s.Hardware[index])throw new ArgumentOutOfRangeException(nameof(quantity));
            var h=Balance.Hardware[index];var first=ScientificNumber.From(h.BaseCost).Multiply(ScientificNumber.From(h.Growth).Pow(s.Hardware[index]));
            if(quantity==1)return first;
            double log=quantity*Math.Log(h.Growth);
            // expm1-compatible expansion avoids cancellation for small logarithms.
            double expm1=Math.Abs(log)<1e-5?log+log*log/2+log*log*log/6:Math.Exp(log)-1;
            var factor=log>690?ScientificNumber.From(h.Growth).Pow(quantity).Subtract(ScientificNumber.One).Divide(ScientificNumber.From(h.Growth-1)):ScientificNumber.From(expm1/(h.Growth-1));
            return first.Multiply(factor);
        }
        static double RebuildTraining(GameState s){string track=s.Training?.id??"quality";int i=Array.IndexOf(PrestigeAutomation.Tracks,track);return Game.TrainingLevel(s,track)<s.Meta.records[i]?MetaRules.Pow(s,"B05"):1;}
        public static GameState Buy(GameState state,string id,long quantity=1)
        {
            int i=Array.FindIndex(Balance.Hardware,h=>h.Id==id);
            if(i<0||quantity<=0||quantity>9007199254740991L-state.Hardware[i])return state;
            var cost=HardwareCost(state,i,quantity);if(state.Credits.CompareTo(cost)<0)return state;
            var s=state.Copy();s.Credits=s.Credits.Subtract(cost);s.Hardware[i]+=quantity;foreach(var edge in Balance.Hardware[i].Milestones.Where(m=>state.Hardware[i]<m.Threshold&&s.Hardware[i]>=m.Threshold))s.Prestige.milestones=s.Prestige.milestones.Union(new[]{id+":"+edge.Threshold}).ToArray();Workshop.PaidHardware(s,i,state.Hardware[i]);return Guide(s);
        }
        public static GameState Tap(GameState state,double now)
        {
            if(!ScientificNumber.Finite(now)||now<state.SavedAt||state.LastTap>=0&&now-state.LastTap<Balance.TapGap)return state;
            var s=state.Copy();uint rng=unchecked(s.CritRng*1664525u+1013904223u);
            int combo=s.LastTap>=0&&now-s.LastTap<=Balance.ComboIdle?s.Combo:0;
            var relay=Workshop.Equipped(s).FirstOrDefault(i=>i.type=="impulse-relay");double proc=relay!=null&&(relay.relayTaps+1)%10==0?2*Workshop.SpecialScale(s,relay)*Workshop.Amplifier(s):0;
            double chance=Math.Min(PrestigeRules.V("critCap"),Balance.TapCrit+(PrestigeRules.Has(s,"S02")?PrestigeRules.E("S02"):0)+(PrestigeRules.Has(s,"S05")?PrestigeRules.E("S05"):0)+(MetaRules.Secondary(s,"K04")?PrestigeRules.E("D06crit"):0)),crit=Balance.TapCritBase+(PrestigeRules.Has(s,"S03")?PrestigeRules.E("S03"):0)+(PrestigeRules.Has(s,"S06")?PrestigeRules.E("S06"):0);crit*=MetaRules.Pow(s,"A04");
            double x=Math.Max(1,(1+Workshop.Bonus(s,"tap"))*PrestigeRules.F(s,"S01")*PrestigeRules.F(s,"S08"));double q=Balance.TapBase*(1+Math.Log(x))*PrestigeRules.F(s,"S10")*MetaRules.Factor(s,"tap")*(1+Balance.TapCombo*combo)+proc;
            if(relay!=null)s.Workshop.inventory.First(i=>i.id==relay.id).relayTaps++;
            double seconds=Balance.TapSoft*q/(Balance.TapSoft+q*(1+chance*(crit-1)));
            var basis=Income(s,false).Times(seconds);if(basis.CompareTo(ScientificNumber.One)<0)basis=ScientificNumber.One;
            PrestigeRules.Earn(s,basis.Times(rng/4294967296d<chance?crit:1));s.CritRng=rng;s.LastTap=now;s.Combo=(int)Math.Min(Balance.ComboMax,combo+1);s.Taps++;
            int charge=(int)Math.Min(Balance.OverdriveCharge,s.Charge+1);
            if(charge>=Balance.OverdriveCharge&&now>=s.CooldownUntil){s.Charge=0;s.ActiveUntil=now+Math.Min(Balance.OverdriveMaxSeconds,Balance.OverdriveSeconds*PrestigeRules.F(s,"S07")*(1+Bonus(s,"overclock"))*(1+Workshop.Device(s,"overclockDuration")))*1000;s.CooldownUntil=now+Balance.OverdriveInterval;s.Overdrives++;}else s.Charge=charge;
            return Guide(s);
        }
        public static ScientificNumber Ceil(ScientificNumber n)
        {
            if(n.IsZero||n.Exponent>=16)return n;
            double x=n.ToDouble(),floor=Math.Floor(x),near=floor+(x-floor>=.5?1:0);return ScientificNumber.From(Math.Abs(x-near)<=2.220446049250313e-16*Math.Max(1,x)*16?near:Math.Ceiling(x));
        }
        public static double OverdriveFactor(GameState s)=>Balance.OverdriveFactor*PrestigeRules.F(s,"S04")*PrestigeRules.F(s,"S09")*(1+Workshop.Device(s,"burst"))*(MetaRules.Secondary(s,"K01")?PrestigeRules.E("D06overdrive"):1);
        public static bool IntroQuality(GameState s)=>s.Prestige.resets==0&&!s.QualityUsed&&s.Tutorial=="training"&&s.Quality==0;
        public static bool IntroResearch(GameState s)=>s.Prestige.resets==0&&!s.ResearchUsed&&s.Tutorial=="research"&&Level(s,"dataGeneration")==0;
        public static ScientificNumber TrainingCost(GameState s,string track)=>track=="quality"&&IntroQuality(s)?ScientificNumber.Zero:Ceil(ScientificNumber.From(track=="integration"?PrestigeRules.V("trainingGBase"):Balance.TrainingCreditBase).Multiply(ScientificNumber.From(track=="integration"?PrestigeRules.V("trainingGGrowth"):Balance.TrainingCreditGrowth).Pow(TrainingLevel(s,track))).Times(Math.Max(Balance.TrainingCostFloor,1/(1+(!string.IsNullOrEmpty(s.Workshop.lastTrack)&&s.Workshop.lastTrack!=track?Workshop.Device(s,"curriculum"):0)))));
        public static double TrainingWork(GameState s,string track)=>track=="quality"&&IntroQuality(s)?Balance.IntroTrainingSeconds:Math.Min(Balance.TrainingCap,(track=="integration"?PrestigeRules.V("integrationSeconds"):Balance.TrainingSeconds)*Math.Pow(track=="integration"?PrestigeRules.V("integrationGrowth"):Balance.TrainingGrowth,TrainingLevel(s,track)));
        public static int TrainingLevel(GameState s,string track)=>track=="quality"?s.Quality:track=="integration"?s.Workshop.integration:s.Efficiency;
        public static ScientificNumber TrainingData(GameState s,string track)=>track=="integration"?Ceil(ScientificNumber.From(PrestigeRules.V("trainingGData")).Multiply(ScientificNumber.From(PrestigeRules.V("trainingGDataGrowth")).Pow(s.Workshop.integration))):ScientificNumber.Zero;
        public static bool TrainingAvailable(GameState s,string track)=>new[]{"quality","efficiency","integration"}.Contains(track)&&(track!="integration"||PrestigeRules.Has(s,"T04")&&s.Workshop.integration<MetaRules.IntegrationLimit(s));
        public static GameState Train(GameState state,string track)
        {
            if(!TrainingAvailable(state,track))return state;if(state.Training!=null)return PrestigeAutomation.QueueTraining(state,track);
            var cost=TrainingCost(state,track);if(state.Credits.CompareTo(cost)<0||state.Data.CompareTo(TrainingData(state,track))<0)return state;
            var s=state.Copy();s.Data=s.Data.Subtract(TrainingData(s,track));bool intro=track=="quality"&&IntroQuality(s);s.Credits=s.Credits.Subtract(cost);s.Training=new Job{id=track,required=TrainingWork(s,track),intro=intro};s.QualityUsed|=intro;s.Workshop.lastTrack=track;return Guide(s);
        }
        public static ScientificNumber ResearchCost(GameState s,int i)
        {
            if(i<0||i>=s.Research.Length)throw new ArgumentOutOfRangeException(nameof(i));
            if(Balance.Research[i].Id=="dataGeneration"&&IntroResearch(s))return ScientificNumber.Zero;
            if(Balance.Research[i].Project)return Ceil(ScientificNumber.From(Balance.Research[i].Cost).Times(PrestigeRules.Has(s,"F07")?PrestigeRules.E("F07"):1));
            int level=s.Research[i];double basis=Balance.Research[i].Early&&level<Balance.EarlyLevels?Math.Min(Balance.Research[i].Cost,Balance.EarlyDataCap[level]):Balance.Research[i].Cost;
            return Ceil(ScientificNumber.From(basis).Multiply(ScientificNumber.From(Balance.ResearchGrowth).Pow(level)).Times(PrestigeRules.Has(s,"F07")?PrestigeRules.E("F07"):1));
        }
        public static double ResearchWork(GameState s,int i)
        {
            if(Balance.Research[i].Id=="dataGeneration"&&IntroResearch(s))return Balance.IntroResearchSeconds;
            double work=Math.Min(Balance.ResearchCap,Balance.Research[i].Project?Balance.Research[i].Seconds:Balance.Research[i].Early&&s.Research[i]<Balance.EarlyLevels?Balance.EarlySeconds[s.Research[i]]:Balance.Research[i].Seconds*Math.Pow(Balance.ResearchTimeGrowth,s.Research[i]));
            string area=new[]{"data","architecture","model","materials","automation"}[Workshop.ResearchArea(Balance.Research[i].Id)];return work/(!string.IsNullOrEmpty(s.Workshop.lastArea)&&s.Workshop.lastArea!=area?1+Workshop.Device(s,"areaSwitch"):1);
        }
        public static string ResearchBlock(GameState s,int i)
        {
            if(i<0||i>=s.Research.Length)return "Unbekannt";
            if(PrestigeAutomation.ResearchJobs(s).Any(j=>j.id==Balance.Research[i].Id))return "Läuft bereits";if(PrestigeAutomation.ResearchJobs(s).Count()>=PrestigeAutomation.LabCount(s))return "Labor belegt";if(Balance.Research[i].Project&&s.Research[i]>0)return "Abgeschlossen";
            foreach(var r in Balance.Research[i].Requires)if(Level(s,r.Id)<r.Level)return "Benötigt "+r.Id+" "+r.Level;
            return s.Data.CompareTo(ResearchCost(s,i))<0?"Zu wenig Daten":null;
        }
        public static GameState Research(GameState state,string id)
        {
            var selected=MetaRules.Phase(state,1);int i=ResearchIndex(id);if(ResearchBlock(selected,i)=="Labor belegt")return PrestigeAutomation.QueueResearch(state,id);if(ResearchBlock(selected,i)!=null)return state;
            var s=selected.Copy();bool intro=id=="dataGeneration"&&IntroResearch(s);s.Data=s.Data.Subtract(ResearchCost(s,i));s.Workshop.nextId++;s.Workshop.revision++;var job=new Job{id=id,required=ResearchWork(s,i),intro=intro};if(s.ResearchJob==null)s.ResearchJob=job;else s.Prestige.labs=s.Prestige.labs.Concat(new[]{job}).ToArray();s.ResearchUsed|=intro;s.Workshop.lastArea=new[]{"data","architecture","model","materials","automation"}[Workshop.ResearchArea(id)];return Guide(s);
        }
        public static GameState Guide(GameState s)
        {
            // Early tutorial after the TS name/prologue: same fulfillment conditions.
            for(int n=0;n<6;n++)
            {
                string next=s.Tutorial;
                switch(s.Tutorial){case "tap":if(s.Taps>0)next="hardware";break;case "hardware":if(s.Hardware.Any(x=>x>0))next="production";break;case "production":if(!Users(s).IsZero)next="credits";break;case "credits":if(s.Credits.CompareTo(ScientificNumber.From(Balance.TutorialCreditGoal))>=0)next="training";break;case "training":if(s.Training!=null||s.QualityUsed)next="research";break;case "research":if(s.ResearchJob!=null||s.ResearchUsed)next="done";break;}
                if(next==s.Tutorial)break;s=s.Copy();s.Tutorial=next;
            }
            return s;
        }
        public static GameState Advance(GameState state,double now)
        {
            if(!ScientificNumber.Finite(now)||now<=state.SavedAt)return state;
            var s=Workshop.Discover(state.Copy());double elapsed=(now-s.SavedAt)/1000,limit=Math.Min(Balance.MaxOfflineSeconds,Balance.OfflineSeconds*(1+Bonus(s,"offline"))),left=Math.Min(elapsed,limit);
            while(left>1e-9)
            {
                PrestigeRules.Discover(s);s=PrestigeAutomation.Agent(s);s=PrestigeAutomation.StartJobs(s);s=MetaAutomation.Fusion(s);
                double trainSpeed=WorkSpeed(s),researchSpeed=s.ResearchJob?.intro==true?1:WorkSpeed(s,true);
                double slice=Math.Min(left,(Balance.SimulationStepMilliseconds-s.SavedAt%Balance.SimulationStepMilliseconds)/1000);
                if(s.Workshop.hasAnalysis)slice=Math.Min(slice,Math.Max(0,(s.Workshop.analysis.required-s.Workshop.analysis.done)/MaterialAnalysis.Speed(s)));
                if(s.Workshop.hasModuleJob)slice=Math.Min(slice,Math.Max(0,(s.Workshop.moduleJob.required-s.Workshop.moduleJob.done)/MetaAutomation.Fabrication(s)));
                bool shoppingActive=s.Prestige.hardwareAuto.Take(2).Any(v=>v),otherAutoActive=s.Prestige.hardwareAuto.Skip(2).Any(v=>v),researchAutoActive=(s.Prestige.researchRepeat&&PrestigeRules.Has(s,"F03"))||(s.Prestige.director&&PrestigeRules.Has(s,"F05")),agentActive=s.Prestige.agent&&PrestigeRules.Has(s,"I06")||s.Meta.axiomAuto&&MetaRules.Level(s,"B06")>0;
                bool planners=s.Meta.analysisAuto&&MetaRules.Level(s,"C02")>0||s.Meta.craftAuto&&MetaRules.Level(s,"C03")>0;
                if(planners)slice=Math.Min(slice,Math.Max(0,PrestigeRules.V("agentInterval")-Math.Max(s.Meta.analysisSeconds,s.Meta.craftSeconds)));
                if(shoppingActive)slice=Math.Min(slice,Math.Max(0,PrestigeRules.V("automaticShoppingSeconds")-s.Prestige.autoSeconds));
                if(otherAutoActive)slice=Math.Min(slice,Math.Max(0,PrestigeRules.V("hardwareAutoInterval")-s.Prestige.otherAutoSeconds));
                if(researchAutoActive)slice=Math.Min(slice,Math.Max(0,PrestigeRules.V("researchAutomationInterval")-s.Prestige.researchAutoSeconds));
                if(agentActive)slice=Math.Min(slice,Math.Max(0,PrestigeRules.V("agentInterval")-s.Prestige.agentSeconds));
                foreach(var job in s.Prestige.labs)slice=Math.Min(slice,Math.Max(0,(job.required-job.done)/(job.intro?1:WorkSpeed(s,true))));
                if(Workshop.Equipped(s).Any(i=>Workshop.Definition(i).Role=="memory")&&s.SavedAt-s.Workshop.runStartedAt<ItemBalance.MemorySeconds*1000)slice=Math.Min(slice,1);
                if(s.Training!=null)slice=Math.Min(slice,Math.Max(0,(s.Training.required-s.Training.done)/trainSpeed));
                if(s.ResearchJob!=null)slice=Math.Min(slice,Math.Max(0,(s.ResearchJob.required-s.ResearchJob.done)/researchSpeed));
                if(s.ActiveUntil>s.SavedAt)slice=Math.Min(slice,(s.ActiveUntil-s.SavedAt)/1000);
                if(slice<1e-8)slice=Math.Min(left,1e-6);
                MaterialAnalysis.Advance(s,slice,false);
                PrestigeRules.Earn(s,Income(s).Times((1+Workshop.Device(s,"memory",s.SavedAt+slice*500))/(1+Workshop.Device(s,"memory"))).Times(slice));s.Prestige.knowledge=ScientificNumber.FromData(s.Prestige.knowledge).Add(PrestigeRules.KnowledgeRate(s).Times(slice)).ToData();s.Data=s.Data.Add(DataRate(s).Times(slice));
                if(s.Training!=null)s.Training.done+=trainSpeed*slice;
                if(s.ResearchJob!=null)s.ResearchJob.done+=researchSpeed*slice;foreach(var job in s.Prestige.labs)job.done+=(job.intro?1:WorkSpeed(s,true))*slice;
                Workshop.Passive(s,slice);if(s.Workshop.hasModuleJob)s.Workshop.moduleJob.done+=slice*MetaAutomation.Fabrication(s);
                s.SavedAt+=slice*1000;left-=slice;
                if(s.Training!=null&&s.Training.done+1e-7>=s.Training.required){if(s.Training.id=="quality"){s.Quality++;s.Workshop.qualityCompletions++;}else if(s.Training.id=="efficiency"){s.Efficiency++;s.Workshop.efficiencyCompletions++;}else s.Workshop.integration++;s.Training=null;}
                s.Prestige.autoSeconds+=slice;s.Prestige.otherAutoSeconds+=slice;s.Meta.analysisSeconds+=slice;s.Meta.craftSeconds+=slice;
                bool shoppingDue=shoppingActive&&s.Prestige.autoSeconds+1e-7>=PrestigeRules.V("automaticShoppingSeconds"),otherDue=otherAutoActive&&s.Prestige.otherAutoSeconds+1e-7>=PrestigeRules.V("hardwareAutoInterval");
                if(!s.Prestige.resetIntent&&(shoppingDue||otherDue)){if(shoppingDue)s.Prestige.autoSeconds%=PrestigeRules.V("automaticShoppingSeconds");if(otherDue)s.Prestige.otherAutoSeconds%=PrestigeRules.V("hardwareAutoInterval");s=PrestigeAutomation.Hardware(s,shoppingDue,otherDue);}
                if(agentActive){s.Prestige.agentSeconds+=slice;if(s.Prestige.agentSeconds+1e-7>=PrestigeRules.V("agentInterval")){s.Prestige.agentSeconds%=PrestigeRules.V("agentInterval");s=PrestigeAutomation.Agent(s);}}
                if(planners&&!s.Prestige.resetIntent){if(s.Meta.analysisSeconds+1e-7>=PrestigeRules.V("agentInterval")){s.Meta.analysisSeconds%=PrestigeRules.V("agentInterval");s=MetaAutomation.Analysis(s);}if(s.Meta.craftSeconds+1e-7>=PrestigeRules.V("agentInterval")){s.Meta.craftSeconds%=PrestigeRules.V("agentInterval");s=MetaAutomation.Craft(s);}}
                if(s.ResearchJob!=null&&s.ResearchJob.done+1e-7>=s.ResearchJob.required){s.Research[ResearchIndex(s.ResearchJob.id)]++;if(!s.ResearchJob.intro)Workshop.ResearchComplete(s,s.ResearchJob.id);s.ResearchJob=null;}
                foreach(var job in s.Prestige.labs.Where(j=>j.done+1e-7>=j.required).ToArray()){s.Research[ResearchIndex(job.id)]++;if(!job.intro)Workshop.ResearchComplete(s,job.id);}s.Prestige.labs=s.Prestige.labs.Where(j=>j.done+1e-7<j.required).ToArray();
                if(s.Workshop.hasModuleJob&&s.Workshop.moduleJob.done+1e-7>=s.Workshop.moduleJob.required){s.Workshop.modules[Array.FindIndex(ItemBalance.Modules,m=>m.Id==s.Workshop.moduleJob.id)]++;s.Workshop.hasModuleJob=false;s.Workshop.moduleJob=null;s.Workshop.revision++;}
                MaterialAnalysis.Advance(s,0);PrestigeRules.Discover(s);s=PrestigeAutomation.Agent(s);
                if(researchAutoActive)s.Prestige.researchAutoSeconds+=slice;if(s.Prestige.researchAutoSeconds+1e-7>=PrestigeRules.V("researchAutomationInterval")){s.Prestige.researchAutoSeconds%=PrestigeRules.V("researchAutomationInterval");s=PrestigeAutomation.ResearchAuto(s);}
            }
            // Consume even discarded offline time. Loading or resuming twice cannot replay it.
            s.SavedAt=now;return Guide(s);
        }
    }
}
