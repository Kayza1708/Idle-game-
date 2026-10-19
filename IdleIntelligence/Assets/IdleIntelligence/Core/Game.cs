using System;
using System.Linq;
namespace IdleIntelligence.Core
{
    // Early V2 only: no Unity APIs, clocks, filesystem, hidden RNG or frame counters.
    public static class Game
    {
        public static GameState New(double now) { var s=new GameState {Workshop=new WorkshopState{runStartedAt=now},SavedAt=now,Credits=ScientificNumber.From(Balance.StartCredits)};Validate(s);return s; }
        public static void Validate(GameState s)
        {
            if(s==null||s.Credits==null||s.Data==null||s.Hardware==null||s.Hardware.Length!=Balance.Hardware.Length||s.Research==null||s.Research.Length!=Balance.Research.Length)throw new FormatException("Invalid state shape");
            if(s.Hardware.Any(n=>n<0||n>9007199254740991L)||s.Research.Any(n=>n<0)||s.Quality<0||s.Efficiency<0||s.Taps<0||s.Overdrives<0||s.Combo<0||s.Combo>Balance.ComboMax||s.Charge<0||s.Charge>Balance.OverdriveCharge)throw new FormatException("Invalid counts");
            if(!ScientificNumber.Finite(s.SavedAt)||s.SavedAt<0||s.SavedAt>9007199254740991d||!ScientificNumber.Finite(s.LastTap)||s.LastTap < -1||!ScientificNumber.Finite(s.ActiveUntil)||s.ActiveUntil<0||!ScientificNumber.Finite(s.CooldownUntil)||s.CooldownUntil<0)throw new FormatException("Invalid clock");
            if(!new[]{"tap","hardware","production","credits","training","research","done"}.Contains(s.Tutorial))throw new FormatException("Invalid tutorial");
            Workshop.Validate(s);
            ValidateJob(s.Training,new[]{"quality","efficiency"});ValidateJob(s.ResearchJob,Balance.Research.Select(r=>r.Id).ToArray());
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
            return total.Times(1+Workshop.Device(s,"sparse")+Workshop.Device(s,"photonicCompute")+Workshop.Device(s,"pairs")).Times(Workshop.Combination(s,"parallel-architecture")).Times(1+Workshop.Bonus(s,"compute")+Bonus(s,"compute")+Bonus(s,"synergy")).Multiply(ResearchFactor(s,"computeOptimization"));
        }
        static ScientificNumber ResearchFactor(GameState s,string id) { int i=ResearchIndex(id);return i<0?ScientificNumber.One:ScientificNumber.From(Balance.Research[i].Effect).Pow(s.Research[i]); }
        static double Strength(int n)=>n<=Balance.TrainingSoftStart?n:Balance.TrainingSoftStart+Balance.TrainingSoftScale*Math.Log(1+(n-Balance.TrainingSoftStart)/Balance.TrainingSoftScale);
        public static ScientificNumber Users(GameState s)=>Compute(s).Times(Math.Pow(Balance.EfficiencyBase,Strength(s.Efficiency))/Balance.ComputePerUser).Times(1+Bonus(s,"users")).Multiply(ResearchFactor(s,"userScaling"));
        public static ScientificNumber Income(GameState s,bool temporary=true)=>Users(s).Times(Balance.RevenuePerUser).Times(1+Workshop.Bonus(s,"credits")+Workshop.Combination(s,"compute-credit-link")).Times(Workshop.ModelCore(s)).Times(1+Workshop.Device(s,"memory")).Times(Math.Pow(Balance.QualityBase,Strength(s.Quality))).Multiply(ResearchFactor(s,"modelArchitecture")).Multiply(ResearchFactor(s,"commercialization")).Times(temporary&&s.ActiveUntil>s.SavedAt?Balance.OverdriveFactor*(1+Workshop.Device(s,"burst")):1);
        public static ScientificNumber DataRate(GameState s)=>Users(s).Pow(Balance.DataPower).Times(Balance.DataScale*(1+Workshop.Bonus(s,"data")+Bonus(s,"data"))).Multiply(ResearchFactor(s,"dataGeneration"));
        public static double WorkSpeed(GameState s,bool research=false)=>(1+Balance.ComputeLogScale*Math.Max(0,Compute(s).Add(ScientificNumber.One).Log10()))*(1+Workshop.Bonus(s,research?"research":"training")+Bonus(s,research?"research":"training"))*(1+Workshop.Combination(s,research?"training-research-link":"learning-pipeline"));
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
        public static GameState Buy(GameState state,string id,long quantity=1)
        {
            int i=Array.FindIndex(Balance.Hardware,h=>h.Id==id);
            if(i<0||quantity<=0||quantity>9007199254740991L-state.Hardware[i])return state;
            var cost=HardwareCost(state,i,quantity);if(state.Credits.CompareTo(cost)<0)return state;
            var s=state.Copy();s.Credits=s.Credits.Subtract(cost);s.Hardware[i]+=quantity;Workshop.PaidHardware(s,i,state.Hardware[i]);return Guide(s);
        }
        public static GameState Tap(GameState state,double now)
        {
            if(!ScientificNumber.Finite(now)||now<state.SavedAt||state.LastTap>=0&&now-state.LastTap<Balance.TapGap)return state;
            var s=state.Copy();uint rng=unchecked(s.CritRng*1664525u+1013904223u);
            int combo=s.LastTap>=0&&now-s.LastTap<=Balance.ComboIdle?s.Combo:0;
            var relay=Workshop.Equipped(s).FirstOrDefault(i=>i.type=="impulse-relay");double proc=relay!=null&&(relay.relayTaps+1)%10==0?2*Workshop.SpecialScale(s,relay)*Workshop.Amplifier(s):0;
            double x=Math.Max(1,1+Workshop.Bonus(s,"tap"));double q=Balance.TapBase*(1+Math.Log(x))*(1+Balance.TapCombo*combo)+proc;
            if(relay!=null)s.Workshop.inventory.First(i=>i.id==relay.id).relayTaps++;
            double seconds=Balance.TapSoft*q/(Balance.TapSoft+q*(1+Balance.TapCrit*(Balance.TapCritBase-1)));
            var basis=Income(s,false).Times(seconds);if(basis.CompareTo(ScientificNumber.One)<0)basis=ScientificNumber.One;
            s.Credits=s.Credits.Add(basis.Times(rng/4294967296d<Balance.TapCrit?Balance.TapCritBase:1));s.CritRng=rng;s.LastTap=now;s.Combo=(int)Math.Min(Balance.ComboMax,combo+1);s.Taps++;
            int charge=(int)Math.Min(Balance.OverdriveCharge,s.Charge+1);
            if(charge>=Balance.OverdriveCharge&&now>=s.CooldownUntil){s.Charge=0;s.ActiveUntil=now+Math.Min(Balance.OverdriveMaxSeconds,Balance.OverdriveSeconds*(1+Bonus(s,"overclock"))*(1+Workshop.Device(s,"overclockDuration")))*1000;s.CooldownUntil=now+Balance.OverdriveInterval;s.Overdrives++;}else s.Charge=charge;
            return Guide(s);
        }
        public static ScientificNumber Ceil(ScientificNumber n)
        {
            if(n.IsZero||n.Exponent>=16)return n;
            double x=n.ToDouble(),floor=Math.Floor(x),near=floor+(x-floor>=.5?1:0);return ScientificNumber.From(Math.Abs(x-near)<=2.220446049250313e-16*Math.Max(1,x)*16?near:Math.Ceiling(x));
        }
        public static bool IntroQuality(GameState s)=>!s.QualityUsed&&s.Tutorial=="training"&&s.Quality==0;
        public static bool IntroResearch(GameState s)=>!s.ResearchUsed&&s.Tutorial=="research"&&Level(s,"dataGeneration")==0;
        public static ScientificNumber TrainingCost(GameState s,string track)=>track=="quality"&&IntroQuality(s)?ScientificNumber.Zero:Ceil(ScientificNumber.From(Balance.TrainingCreditBase).Multiply(ScientificNumber.From(Balance.TrainingCreditGrowth).Pow(track=="quality"?s.Quality:s.Efficiency)).Times(Math.Max(Balance.TrainingCostFloor,1/(1+(!string.IsNullOrEmpty(s.Workshop.lastTrack)&&s.Workshop.lastTrack!=track?Workshop.Device(s,"curriculum"):0)))));
        public static double TrainingWork(GameState s,string track)=>track=="quality"&&IntroQuality(s)?Balance.IntroTrainingSeconds:Math.Min(Balance.TrainingCap,Balance.TrainingSeconds*Math.Pow(Balance.TrainingGrowth,track=="quality"?s.Quality:s.Efficiency));
        public static GameState Train(GameState state,string track)
        {
            if(track!="quality"&&track!="efficiency"||state.Training!=null)return state;
            var cost=TrainingCost(state,track);if(state.Credits.CompareTo(cost)<0)return state;
            var s=state.Copy();bool intro=track=="quality"&&IntroQuality(s);s.Credits=s.Credits.Subtract(cost);s.Training=new Job{id=track,required=TrainingWork(s,track),intro=intro};s.QualityUsed|=intro;s.Workshop.lastTrack=track;return Guide(s);
        }
        public static ScientificNumber ResearchCost(GameState s,int i)
        {
            if(i<0||i>=s.Research.Length)throw new ArgumentOutOfRangeException(nameof(i));
            if(Balance.Research[i].Id=="dataGeneration"&&IntroResearch(s))return ScientificNumber.Zero;
            if(Balance.Research[i].Project)return ScientificNumber.From(Balance.Research[i].Cost);
            int level=s.Research[i];double basis=Balance.Research[i].Early&&level<Balance.EarlyLevels?Math.Min(Balance.Research[i].Cost,Balance.EarlyDataCap[level]):Balance.Research[i].Cost;
            return Ceil(ScientificNumber.From(basis).Multiply(ScientificNumber.From(Balance.ResearchGrowth).Pow(level)));
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
            if(s.ResearchJob!=null)return "Labor belegt";if(Balance.Research[i].Project&&s.Research[i]>0)return "Abgeschlossen";
            foreach(var r in Balance.Research[i].Requires)if(Level(s,r.Id)<r.Level)return "Benötigt "+r.Id+" "+r.Level;
            return s.Data.CompareTo(ResearchCost(s,i))<0?"Zu wenig Daten":null;
        }
        public static GameState Research(GameState state,string id)
        {
            int i=ResearchIndex(id);if(ResearchBlock(state,i)!=null)return state;
            var s=state.Copy();bool intro=id=="dataGeneration"&&IntroResearch(s);s.Data=s.Data.Subtract(ResearchCost(s,i));s.ResearchJob=new Job{id=id,required=ResearchWork(s,i),intro=intro};s.ResearchUsed|=intro;s.Workshop.lastArea=new[]{"data","architecture","model","materials","automation"}[Workshop.ResearchArea(id)];return Guide(s);
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
                double trainSpeed=WorkSpeed(s),researchSpeed=s.ResearchJob?.intro==true?1:WorkSpeed(s,true);
                double slice=Math.Min(left,(Balance.SimulationStepMilliseconds-s.SavedAt%Balance.SimulationStepMilliseconds)/1000);
                if(s.Workshop.hasAnalysis)slice=Math.Min(slice,Math.Max(0,(s.Workshop.analysis.required-s.Workshop.analysis.done)/MaterialAnalysis.Speed(s)));
                if(s.Workshop.hasModuleJob)slice=Math.Min(slice,Math.Max(0,s.Workshop.moduleJob.required-s.Workshop.moduleJob.done));
                if(Workshop.Equipped(s).Any(i=>Workshop.Definition(i).Role=="memory")&&s.SavedAt-s.Workshop.runStartedAt<ItemBalance.MemorySeconds*1000)slice=Math.Min(slice,1);
                if(s.Training!=null)slice=Math.Min(slice,Math.Max(0,(s.Training.required-s.Training.done)/trainSpeed));
                if(s.ResearchJob!=null)slice=Math.Min(slice,Math.Max(0,(s.ResearchJob.required-s.ResearchJob.done)/researchSpeed));
                if(s.ActiveUntil>s.SavedAt)slice=Math.Min(slice,(s.ActiveUntil-s.SavedAt)/1000);
                if(slice<1e-8)slice=Math.Min(left,1e-6);
                MaterialAnalysis.Advance(s,slice,false);
                s.Credits=s.Credits.Add(Income(s).Times((1+Workshop.Device(s,"memory",s.SavedAt+slice*500))/(1+Workshop.Device(s,"memory"))).Times(slice));s.Data=s.Data.Add(DataRate(s).Times(slice));
                if(s.Training!=null)s.Training.done+=trainSpeed*slice;
                if(s.ResearchJob!=null)s.ResearchJob.done+=researchSpeed*slice;
                Workshop.Passive(s,slice);if(s.Workshop.hasModuleJob){s.Workshop.moduleJob.done+=slice;if(s.Workshop.moduleJob.done+1e-7>=s.Workshop.moduleJob.required){s.Workshop.modules[Array.FindIndex(ItemBalance.Modules,m=>m.Id==s.Workshop.moduleJob.id)]++;s.Workshop.hasModuleJob=false;s.Workshop.moduleJob=null;s.Workshop.revision++;}}
                s.SavedAt+=slice*1000;left-=slice;
                if(s.Training!=null&&s.Training.done+1e-7>=s.Training.required){if(s.Training.id=="quality"){s.Quality++;s.Workshop.qualityCompletions++;}else {s.Efficiency++;s.Workshop.efficiencyCompletions++;}s.Training=null;}
                if(s.ResearchJob!=null&&s.ResearchJob.done+1e-7>=s.ResearchJob.required){s.Research[ResearchIndex(s.ResearchJob.id)]++;Workshop.ResearchComplete(s,s.ResearchJob.id);s.ResearchJob=null;}
                MaterialAnalysis.Advance(s,0);
            }
            // Consume even discarded offline time. Loading or resuming twice cannot replay it.
            s.SavedAt=now;return Guide(s);
        }
    }
}
