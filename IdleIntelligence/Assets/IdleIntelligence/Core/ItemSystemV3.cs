using System;
using System.Linq;
using System.Collections.Generic;
namespace IdleIntelligence.Core
{
    // Development contract; the save boundary rejects it until full V3 migration
    // and all completion-event contracts are accepted. Never silently drop it.
    [Serializable] public sealed class ItemV3Overdrive {public double startedAt,burstUntil,creditFactor=1,dataFactor=1;public ItemV3Overdrive Copy()=>(ItemV3Overdrive)MemberwiseClone();}
    [Serializable] public sealed class ItemV3Synthesis {public string id,component;public double multiplier;public ItemV3Synthesis Copy()=>(ItemV3Synthesis)MemberwiseClone();}
    public sealed class ItemV3State
    {
        public int version=3;
        public ScientificNumber dataProduced=ScientificNumber.Zero,knowledgeProduced=ScientificNumber.Zero,componentsProduced=ScientificNumber.Zero;
        public double runMinutes,recyclingFragmentProgress;
        // Native V3 event receipts. These counters belong to the save, never to traded items.
        public double gradientStoredWork,gradientAccruedWork,gradientLastRequirement;
        public string gradientAccruedJob;
        public double capacitorFraction,axiomAnchorFactor=1,axiomAnchorSeconds;
        public string[] capacitorCompletedJobs=Array.Empty<string>();
        public long nextTrainingSequence=1,lastCompletedTrainingSequence;public int learningStreak;public long scannerAnalyses,automaticResearchStarts;public string lastLearningTrack,lastTrainingCompletionCause;public bool archiveBlueprintRight,axiomDiscovered;public double axiomDiscoveryAt=-1;
        public double[] synthesisRemainders=new double[ItemBalance.ComponentIds.Length];public ItemV3Synthesis synthesisContract;public ItemV3Overdrive overdrive;
        public ItemV3State Copy(){var v=(ItemV3State)MemberwiseClone();v.synthesisRemainders=(double[])synthesisRemainders.Clone();v.synthesisContract=synthesisContract?.Copy();v.overdrive=overdrive?.Copy();v.capacitorCompletedJobs=(string[])capacitorCompletedJobs.Clone();return v;}
    }
    public static class ItemSystemV3
    {
        static double C(string key)=>ItemV3Balance.Get(key);
        public static bool Enabled(GameState s)=>s.ItemSystemV3?.version==3;
        public static void Validate(GameState s)
        {
            var v=s?.ItemSystemV3;if(v==null)return;if(PrestigeAutomation.ResearchJobs(s).Any(j=>!ScientificNumber.Finite(j.required)||j.required<=0||!ScientificNumber.Finite(j.done)||j.done<0||j.done>j.required+1e-6||!ScientificNumber.Finite(j.eventWork)||j.eventWork<0||j.eventWork>j.done+1e-6))throw new FormatException("Invalid V3 research work contract");double maxP=ItemV3Balance.RarityFactors.Max()*(1+C("levelStep")*(C("levelMax")-1))*(1+C("forgeStep")*C("forgeMax"))*ItemV3Balance.Get("prestige.items.W10ability");var od=v.overdrive;if(od!=null&&(!ScientificNumber.Finite(od.startedAt)||!ScientificNumber.Finite(od.burstUntil)||!ScientificNumber.Finite(od.creditFactor)||!ScientificNumber.Finite(od.dataFactor)||od.startedAt<0||od.burstUntil<od.startedAt||od.burstUntil-od.startedAt>C("combinations.energy.seconds")*1000+.001||od.creditFactor<1||od.creditFactor>(1+C("burst.coefficient")*maxP)*C("combinations.energy.credits")+1e-10||od.dataFactor!=1&&od.dataFactor!=C("combinations.energy.data")))throw new FormatException("Invalid V3 overdrive contract");
            foreach(var job in PrestigeAutomation.ResearchJobs(s)){if(job.researchStartVersion!=0&&job.researchStartVersion!=3)throw new FormatException("Unknown research start contract");if(job.researchStartVersion==3&&(!new[]{"manual","queue","automatic"}.Contains(job.researchStartCause)||!new[]{"data","architecture","model","materials","automation"}.Contains(job.area)||job.previousArea!=null&&!new[]{"data","architecture","model","materials","automation"}.Contains(job.previousArea)||!ScientificNumber.Finite(job.minimumSeconds)||job.minimumSeconds<C("protocol.minimumBase")||job.minimumSeconds>Math.Max(C("protocol.minimumBase"),C("protocol.floor"))||!ScientificNumber.Finite(job.minimumUntil)||Math.Abs(job.minimumUntil-job.startedAt-job.minimumSeconds*1000)>1e-6||!ScientificNumber.Finite(job.startingFraction)||job.startingFraction<0||job.startingFraction>C("switch.cap")+C("combinations.autonomous.start")+C("combinations.autonomous.extra")+1e-12||job.eventWork+1e-6<job.required*job.startingFraction||job.automaticOrdinal<0||job.automaticOrdinal>MaxExactSequence||job.completionCause!=null&&job.completionCause!="bonus"))throw new FormatException("Invalid V3 research start contract");}
            if(!ScientificNumber.Finite(v.recyclingFragmentProgress)||v.recyclingFragmentProgress<0||v.recyclingFragmentProgress>=1)throw new FormatException("Invalid V3 fragment progress");
            if(v.synthesisRemainders==null||v.synthesisRemainders.Length!=ItemBalance.ComponentIds.Length||v.synthesisRemainders.Any(n=>!ScientificNumber.Finite(n)||n<0||n>=1)||v.synthesisContract!=null&&(string.IsNullOrEmpty(v.synthesisContract.id)||!ItemBalance.ComponentIds.Contains(v.synthesisContract.component)||!ScientificNumber.Finite(v.synthesisContract.multiplier)||v.synthesisContract.multiplier<1))throw new FormatException("Invalid V3 synthesis receipt");
            if(v.capacitorCompletedJobs==null||v.capacitorCompletedJobs.Length>4096||v.capacitorCompletedJobs.Any(id=>string.IsNullOrEmpty(id)||id.Length>200)||v.capacitorCompletedJobs.Distinct().Count()!=v.capacitorCompletedJobs.Length||
                new[]{v.gradientStoredWork,v.gradientAccruedWork,v.gradientLastRequirement,v.capacitorFraction,v.axiomAnchorSeconds,v.axiomAnchorFactor}.Any(n=>!ScientificNumber.Finite(n)||n<0)||
                v.capacitorFraction>=1||v.axiomAnchorFactor<1||v.axiomAnchorSeconds>C("axiomAnchor.minutes")*60+1e-7||
                v.gradientAccruedJob!=null&&v.gradientAccruedJob.Length>200||
                v.gradientStoredWork>v.gradientLastRequirement+1e-7)throw new FormatException("Invalid native V3 event receipts");
            if(v.version!=3||v.dataProduced==null||v.knowledgeProduced==null||v.componentsProduced==null||!ScientificNumber.Finite(v.runMinutes)||v.runMinutes<0||v.nextTrainingSequence<1||v.nextTrainingSequence>MaxExactSequence||v.lastCompletedTrainingSequence<0||v.lastCompletedTrainingSequence>=v.nextTrainingSequence||v.automaticResearchStarts<0||v.automaticResearchStarts>MaxExactSequence||v.scannerAnalyses<0||v.scannerAnalyses>MaxExactSequence||v.learningStreak<0||v.learningStreak>C("logic.maxStreak")||v.lastLearningTrack!=null&&v.lastLearningTrack!="quality"&&v.lastLearningTrack!="efficiency"||v.lastTrainingCompletionCause!=null&&v.lastTrainingCompletionCause!="regular"&&v.lastTrainingCompletionCause!="bonus"&&v.lastTrainingCompletionCause!="intro")throw new FormatException("Invalid V3 production counters");
        }
        public static void RecordProduction(GameState s,double seconds,ScientificNumber data,ScientificNumber knowledge)
        {
            if(!Enabled(s))return;if(!ScientificNumber.Finite(seconds)||seconds<0)throw new ArgumentOutOfRangeException(nameof(seconds));
            var v=s.ItemSystemV3;v.dataProduced=v.dataProduced.Add(data);v.knowledgeProduced=v.knowledgeProduced.Add(knowledge);v.runMinutes+=seconds/60;v.axiomAnchorSeconds=Math.Max(0,v.axiomAnchorSeconds-seconds);
        }
        public static void RecordComponents(GameState s,int component,long amount,string source)
        {
            if(!Enabled(s))return;switch(source){case "analysis":case "synthesis":case "passive-hardware":case "paid-hardware-package":case "paid-class-upgrade":break;default:return;}
            if(component<0||component>=ItemBalance.ComponentIds.Length||amount<0)throw new ArgumentOutOfRangeException(nameof(amount));
            s.ItemSystemV3.componentsProduced=s.ItemSystemV3.componentsProduced.Add(ScientificNumber.From(amount));
        }
        public static void ResetProduction(GameState s,bool axiom=false)
        {
            if(!Enabled(s))return;var v=s.ItemSystemV3;v.dataProduced=ScientificNumber.Zero;v.runMinutes=0;v.learningStreak=0;v.lastLearningTrack=null;v.scannerAnalyses=0;v.automaticResearchStarts=0;v.overdrive=null;v.gradientAccruedWork=0;v.gradientAccruedJob=null;v.gradientStoredWork=0;v.gradientLastRequirement=0;v.capacitorFraction=0;v.capacitorCompletedJobs=Array.Empty<string>();
            if(!axiom){v.axiomAnchorSeconds=0;v.axiomAnchorFactor=1;}
            if(axiom){v.knowledgeProduced=ScientificNumber.Zero;v.componentsProduced=ScientificNumber.Zero;}
        }
        public static ItemV3State ChallengeState(GameState main)
        {
            if(!Enabled(main))return null;Validate(main);var v=main.ItemSystemV3;return new ItemV3State{nextTrainingSequence=v.nextTrainingSequence,archiveBlueprintRight=ArchiveBlueprintRight(main),axiomDiscovered=v.axiomDiscovered,axiomDiscoveryAt=v.axiomDiscoveryAt};
        }
        public static void RestoreChallengeSequence(GameState main,GameState shadow)
        {
            if(!Enabled(main)||!Enabled(shadow))return;Validate(main);Validate(shadow);main.ItemSystemV3.nextTrainingSequence=Math.Max(main.ItemSystemV3.nextTrainingSequence,shadow.ItemSystemV3.nextTrainingSequence);
            // Keep the main completion marker and active paid job. A later shadow
            // completion must not make that older main job unclaimable.
        }
        // Exact IDs, not economy bounds. No normal-save or item payload changes.
        const long MaxExactSequence=9007199254740991L;
        public static void IdentifyTraining(GameState s)
        {
            if(!Enabled(s)||s.Training==null||!string.IsNullOrEmpty(s.Training.key))return;Validate(s);var v=s.ItemSystemV3;
            if(v.nextTrainingSequence<1||v.nextTrainingSequence>=MaxExactSequence)throw new FormatException("Invalid V3 training sequence");
            s.Training.key="v3-training-"+v.nextTrainingSequence.ToString(System.Globalization.CultureInfo.InvariantCulture);v.nextTrainingSequence++;
        }
        public static void CompleteTraining(GameState s,bool regular)
        {
            if(!Enabled(s)||s.Training==null)return;Validate(s);var job=s.Training;var v=s.ItemSystemV3;const string prefix="v3-training-";
            if(!ScientificNumber.Finite(job.required)||job.required<=0||!ScientificNumber.Finite(job.done)||job.done<0||!new[]{"quality","efficiency","integration"}.Contains(job.id)||string.IsNullOrEmpty(job.key)||!job.key.StartsWith(prefix,StringComparison.Ordinal)||!long.TryParse(job.key.Substring(prefix.Length),System.Globalization.NumberStyles.None,System.Globalization.CultureInfo.InvariantCulture,out long id)||id<1||id>=v.nextTrainingSequence||id<=v.lastCompletedTrainingSequence||job.done+1e-7<job.required)return;
            if(job.key!=prefix+id.ToString(System.Globalization.CultureInfo.InvariantCulture))return;
            v.lastCompletedTrainingSequence=id;v.lastTrainingCompletionCause=job.intro?"intro":regular?"regular":"bonus";
            if(regular&&!job.intro)GrantPhotonWork(s);
            if(!regular||job.intro||job.id=="integration"||!Has(s,"logic-seed"))return;
            if(v.learningStreak<0||v.learningStreak>C("logic.maxStreak"))throw new FormatException("Invalid V3 learning series");
            v.learningStreak=v.lastLearningTrack==job.id?(int)Math.Floor(v.learningStreak/C("logic.sameTrackDivisor")):Math.Min((int)C("logic.maxStreak"),v.learningStreak+1);v.lastLearningTrack=job.id;
        }
        /** Regular time-only training work, never a gem completion or an intro. */
        public static void RecordGradientWork(GameState s,double work)
        {
            if(!Enabled(s)||s.Training==null||s.Training.intro||work<=0)return;
            var buffer=Equipped(s).FirstOrDefault(i=>i.type=="gradient-buffer");
            if(buffer==null)return;
            var job=s.Training;var v=s.ItemSystemV3;
            if(!ScientificNumber.Finite(work)||!ScientificNumber.Finite(job.required)||job.required<=0)
                throw new FormatException("Invalid gradient work");
            if(v.gradientAccruedJob!=job.key){v.gradientAccruedWork=0;v.gradientAccruedJob=job.key;}
            double fraction=Math.Min(C("gradient.cap"),C("gradient.rate")*AbilityStrength(s,buffer));
            v.gradientAccruedWork=Math.Min(job.required,v.gradientAccruedWork+work*fraction);
        }
        /** The carry is consumed on exactly the next paid, non-intro start. */
        public static void ApplyGradientStart(GameState s)
        {
            if(!Enabled(s)||s.Training==null||s.Training.intro)return;
            var v=s.ItemSystemV3;double carry=Math.Min(v.gradientStoredWork,s.Training.required*C("gradient.startCap"));
            if(!ScientificNumber.Finite(carry)||carry<0)throw new FormatException("Invalid gradient carry");
            s.Training.done=Math.Min(s.Training.required,s.Training.done+carry);
            v.gradientStoredWork=0;v.gradientLastRequirement=0;
        }
        /** Exactly one new carry per regular completed job; cannot duplicate on claim. */
        public static void FinishGradientTraining(GameState s,Job completed)
        {
            if(!Enabled(s)||completed==null)return;
            var v=s.ItemSystemV3;
            if(!completed.intro&&completed.key==v.gradientAccruedJob)
            {v.gradientLastRequirement=completed.required;v.gradientStoredWork=Math.Min(completed.required,v.gradientAccruedWork);}
            v.gradientAccruedJob=null;v.gradientAccruedWork=0;
        }
        /** Ledger ticket + cap means reloads, late claims and duplicate completions are inert. */
        public static void CompleteCapacitorResearch(GameState s,Job job)
        {
            if(!Enabled(s)||job==null||job.intro||!job.identityRecorded||!job.paidDataRecorded||
               job.researchStartVersion!=3||job.completionCause=="bonus"||
               string.IsNullOrEmpty(job.key)||job.key.Length>200||s.ItemSystemV3.capacitorCompletedJobs.Contains(job.key))return;
            var capacitor=Equipped(s).FirstOrDefault(i=>i.type=="overdrive-capacitor");
            if(capacitor==null)return;
            var v=s.ItemSystemV3;
            if(v.capacitorCompletedJobs.Length>=4096)return;
            v.capacitorCompletedJobs=v.capacitorCompletedJobs.Concat(new[]{job.key}).ToArray();
            double amount=C("capacitor.charge")*AbilityStrength(s,capacitor)+v.capacitorFraction;
            int whole=Math.Max(0,Math.Min((int)C("prestige.training.integrationLimit"),(int)Math.Floor(amount)));
            v.capacitorFraction=amount-Math.Floor(amount);
            s.Charge=Math.Min((int)Balance.OverdriveCharge,s.Charge+whole);
            if(s.Charge>=Balance.OverdriveCharge&&s.SavedAt>=s.CooldownUntil&&
               !ChallengeRules.Is(s,"no-taps")&&s.ActiveUntil<=s.SavedAt)
                Game.BeginOverdrive(s,s.SavedAt);
        }
        /** Snapshot only on a real axiom reset, after applying retention rules. */
        public static void CaptureAxiomAnchor(GameState before,GameState after)
        {
            if(!Enabled(before)||!Enabled(after))return;
            var item=Equipped(before).FirstOrDefault(i=>i.type=="axiom-anchor");
            var v=after.ItemSystemV3;
            v.axiomAnchorSeconds=0;v.axiomAnchorFactor=1;
            if(item==null||!Equipped(after).Any(i=>i.id==item.id))return;
            v.axiomAnchorFactor=1+C("axiomAnchor.coefficient")*AbilityStrength(before,item);
            v.axiomAnchorSeconds=C("axiomAnchor.minutes")*60;
        }
        public static double AxiomAnchorFactor(GameState s)
            =>Enabled(s)&&s.ItemSystemV3.axiomAnchorSeconds>0?s.ItemSystemV3.axiomAnchorFactor:1;
        public static double AxiomAnchorBoundary(GameState s)
            =>Enabled(s)&&s.ItemSystemV3.axiomAnchorSeconds>0?s.ItemSystemV3.axiomAnchorSeconds:double.PositiveInfinity;

        public sealed class ResearchStartContract
        {
            public string cause,area,previousArea;public double minimumSeconds,minimumUntil,startingFraction;public long automaticOrdinal;
        }
        public static ResearchStartContract ResearchStartQuote(GameState s,string id,string cause="manual")
        {
            if(!Enabled(s))return null;if(!new[]{"manual","queue","automatic"}.Contains(cause))throw new FormatException("Unknown research start cause");Validate(s);string area=new[]{"data","architecture","model","materials","automation"}[Workshop.ResearchArea(id)],previous=string.IsNullOrEmpty(s.Workshop.lastArea)?null:s.Workshop.lastArea;var protocol=Equipped(s).FirstOrDefault(i=>i.type=="protocol-controller");var controller=Equipped(s).FirstOrDefault(i=>i.type=="experiment-controller");bool automatic=cause!="manual"&&protocol!=null&&Has(s,"lab-drone");long count=s.ItemSystemV3.automaticResearchStarts;if(automatic&&count>=MaxExactSequence)throw new FormatException("Automatic research sequence exhausted");long next=count+(automatic?1:0);double minimum=protocol==null?C("protocol.minimumBase"):Math.Max(C("protocol.floor"),C("protocol.minimumBase")/(1+AbilityStrength(s,protocol))),fraction=controller!=null&&previous!=null&&area!=previous?Math.Min(C("switch.cap"),C("switch.rate")*AbilityStrength(s,controller)):0;fraction+=(automatic?C("combinations.autonomous.start"):0)+(automatic&&controller!=null&&next%(long)C("combinations.autonomous.interval")==0?C("combinations.autonomous.extra"):0);return new ResearchStartContract{cause=cause,area=area,previousArea=previous,minimumSeconds=minimum,minimumUntil=s.SavedAt+minimum*1000,startingFraction=fraction,automaticOrdinal=next};
        }
        public static void ApplyResearchStart(GameState s,Job job,ResearchStartContract contract)
        {
            if(contract==null||job.intro)return;job.researchStartVersion=3;job.researchStartCause=contract.cause;job.area=contract.area;job.previousArea=contract.previousArea;job.minimumSeconds=contract.minimumSeconds;job.minimumUntil=contract.minimumUntil;job.startingFraction=contract.startingFraction;job.automaticOrdinal=contract.automaticOrdinal;job.done=job.required*contract.startingFraction;job.eventWork=job.done;s.ItemSystemV3.automaticResearchStarts=contract.automaticOrdinal;
        }
        public static double[] DistributeLongestResearchWork(double[] remaining,double budget)
        {
            if(!ScientificNumber.Finite(budget)||budget<0||remaining.Any(n=>!ScientificNumber.Finite(n)||n<0))throw new FormatException("Invalid research work allocation");var result=new double[remaining.Length];var order=Enumerable.Range(0,remaining.Length).OrderByDescending(i=>remaining[i]).ThenBy(i=>i).ToArray();
            for(int count=1;count<=order.Length&&budget>0;count++){double high=remaining[order[count-1]],low=count<order.Length?remaining[order[count]]:0,cost=(high-low)*count,used=Math.Min(budget,cost);for(int n=0;n<count;n++)result[order[n]]+=used/count;budget-=used;}return result;
        }
        public static double ResearchTransferFraction(GameState s){if(!Enabled(s))return 0;var item=Equipped(s).FirstOrDefault(i=>i.type=="lab-drone");return item==null?0:Math.Min(C("drone.cap"),C("drone.rate")*AbilityStrength(s,item));}
        public static double ResearchBoundary(GameState s)
        {
            double fraction=ResearchTransferFraction(s);if(fraction==0)return double.PositiveInfinity;var jobs=PrestigeAutomation.ResearchJobs(s).Where(j=>!j.intro&&j.required>j.done).ToArray();if(jobs.Length==0)return double.PositiveInfinity;double speed=Game.ResearchSpeed(s,jobs[0]);if(!ScientificNumber.Finite(speed)||speed<=0)return double.PositiveInfinity;var remaining=jobs.Select(j=>Math.Max(0,j.required-j.done)).ToArray();return Math.Min(remaining.Min()/speed,remaining.Sum()/(jobs.Length*speed*(1+fraction)));
        }
        public static void AdvanceResearchWork(GameState s,double seconds)
        {
            var jobs=PrestigeAutomation.ResearchJobs(s).ToArray();double regular=0;foreach(var job in jobs){double delta=Math.Min(Math.Max(0,job.required-job.done),Game.ResearchSpeed(s,job)*seconds);job.done+=delta;if(!job.intro)regular+=delta;}double fraction=ResearchTransferFraction(s);if(fraction==0)return;var targets=jobs.Where(j=>!j.intro).ToArray();var extra=DistributeLongestResearchWork(targets.Select(j=>Math.Max(0,j.required-j.done)).ToArray(),regular*fraction);for(int n=0;n<targets.Length;n++){targets[n].done=Math.Min(targets[n].required,targets[n].done+extra[n]);targets[n].eventWork+=extra[n];}
        }
        static void GrantPhotonWork(GameState s)
        {
            var item=Equipped(s).FirstOrDefault(i=>i.type=="photonic-array");if(item==null)return;double seconds=C("photon.seconds")*AbilityStrength(s,item)*(Has(s,"logic-seed")&&Has(s,"lab-drone")?C("combinations.learning.photonWork"):1);foreach(var job in PrestigeAutomation.ResearchJobs(s).Where(j=>!j.intro&&j.required>j.done)){double delta=Math.Min(job.required-job.done,Game.ResearchSpeed(s,job)*seconds);job.done+=delta;job.eventWork+=delta;}
        }
        public static double Strength(ItemInstance item)
        {
            if(item==null||item.rarity<0||item.rarity>=ItemV3Balance.RarityFactors.Length||item.level<1||item.level>C("levelMax")||item.forge<0||item.forge>C("forgeMax"))throw new ArgumentOutOfRangeException(nameof(item));
            return ItemV3Balance.RarityFactors[item.rarity]*(1+C("levelStep")*(item.level-1))*(1+C("forgeStep")*item.forge);
        }
        public static double AbilityStrength(GameState s,ItemInstance item)=>Strength(item)*(PrestigeRules.Has(s,"W10")?ItemV3Balance.Get("prestige.items.W10ability"):1);
        public static double ExponentStrength(GameState s,ItemInstance item)=>Math.Sqrt(Strength(item))*(PrestigeRules.Has(s,"W10")?ItemV3Balance.Get("prestige.items.W10exponent"):1);
        public static ScientificNumber Softcap(ScientificNumber value,double threshold)
        {
            if(!ScientificNumber.Finite(threshold)||threshold<=0)throw new ArgumentOutOfRangeException(nameof(threshold));var k=ScientificNumber.From(threshold);return value.CompareTo(k)<=0?value:k.Add(value.Subtract(k).Multiply(k).Pow(.5));
        }
        public static IEnumerable<ItemInstance> Equipped(GameState s)
        {var seen=new HashSet<string>();foreach(var item in Workshop.Equipped(s))if(seen.Add(item.type))yield return item;}
        public static ScientificNumber RelayBonus(GameState s,bool critical)
        {
            if(!Enabled(s))return ScientificNumber.Zero;
            var item=Equipped(s).FirstOrDefault(i=>i.type=="impulse-relay");if(item==null)return ScientificNumber.Zero;
            if(item.relayTaps<0||item.relayTaps>9007199254740991L)throw new FormatException("Invalid relay counter");
            if((item.relayTaps+1)%(long)C("relay.interval")!=0)return ScientificNumber.Zero;
            var regular=s.Copy();regular.ActiveUntil=0;
            return Game.Income(regular,false).Times(C("relay.seconds")*AbilityStrength(s,item)*(critical?C("relay.critical"):1));
        }
        public static void StartOverdrive(GameState s,double now,double baseDuration)
        {
            if(!Enabled(s))return;if(!ScientificNumber.Finite(now)||now<s.SavedAt||!ScientificNumber.Finite(baseDuration)||baseDuration<=0)throw new FormatException("Invalid V3 overdrive start");
            var items=Equipped(s).ToArray();var burst=items.FirstOrDefault(i=>i.type=="burst-processor");var cryo=items.FirstOrDefault(i=>i.type=="cryocontroller");bool pair=burst!=null&&cryo!=null,trio=pair&&items.Any(i=>i.type=="photonic-analyzer");double duration=baseDuration*(1+(cryo!=null?C("cryo.duration")*AbilityStrength(s,cryo):0));
            s.ActiveUntil=now+duration*1000;s.ItemSystemV3.overdrive=new ItemV3Overdrive{startedAt=now,burstUntil=now+Math.Min(duration,pair?C("combinations.energy.seconds"):C("burst.seconds"))*1000,creditFactor=burst!=null?(1+C("burst.coefficient")*AbilityStrength(s,burst))*(pair?C("combinations.energy.credits"):1):1,dataFactor=trio?C("combinations.energy.data"):1};
        }
        public static double BurstFactor(GameState s,bool data=false)
        {var v=s.ItemSystemV3?.overdrive;if(!Enabled(s)||ChallengeRules.Is(s,"no-items")||v==null||s.SavedAt<v.startedAt||s.SavedAt>=v.burstUntil||s.SavedAt>=s.ActiveUntil)return 1;return data?v.dataFactor:v.creditFactor;}
        public static double OverdriveFraction(GameState s)
        {double remaining=Math.Max(0,s.ActiveUntil-s.SavedAt),duration=Enabled(s)&&s.ItemSystemV3.overdrive!=null?s.ActiveUntil-s.ItemSystemV3.overdrive.startedAt:Balance.OverdriveMaxSeconds*1000;return duration<=0?0:Math.Min(1,remaining/duration);}
        public static double BurstBoundary(GameState s)
        {var v=s.ItemSystemV3?.overdrive;return Enabled(s)&&v!=null&&v.burstUntil>s.SavedAt?(v.burstUntil-s.SavedAt)/1000:double.PositiveInfinity;}
        public static double FocusFactor(GameState s)
        {if(!Enabled(s))return 1;var item=Equipped(s).FirstOrDefault(i=>i.type=="precision-scanner");return 1+(item!=null?C("focus.coefficient")*AbilityStrength(s,item):0);}
        public static double FocusQuantity(GameState s)=>Enabled(s)?1-(1-ItemBalance.MaterialFocusQuantity)/FocusFactor(s):ItemBalance.MaterialFocusQuantity;
        public static double HardwarePackageFactor(GameState s)
        {if(!Enabled(s))return 1;var diagnostic=Equipped(s).FirstOrDefault(i=>i.type=="diagnostic-adapter");return(1+(diagnostic!=null?C("diagnostic.coefficient")*AbilityStrength(s,diagnostic):0))*(Has(s,"legacy-controller")&&Has(s,"diagnostic-adapter")?C("combinations.boot.components"):1);}
        public static double MaterialFamilyYield(GameState s,int family)
        {if(!Enabled(s)||family!=2&&family!=4)return 1;var item=Equipped(s).FirstOrDefault(i=>i.type==(family==2?"photonic-analyzer":"quantum-diagnostic-module"));bool pair=Has(s,"photonic-matrix")&&Has(s,"photonic-analyzer"),active=s.ActiveUntil>s.SavedAt;return(1+(item!=null?C("familyYield.coefficient")*AbilityStrength(s,item):0))*(active&&pair&&(family==2||Has(s,"cryocontroller")&&MaterialAnalysis.Access(s,4))?C("combinations.photonic.yield"):1);}
        public static double MaximumFamilyYield()
        {double maxP=ItemV3Balance.RarityFactors.Max()*(1+C("levelStep")*(C("levelMax")-1))*(1+C("forgeStep")*C("forgeMax"))*ItemV3Balance.Get("prestige.items.W10ability");return ItemV3Balance.Get("prestige.items.W03focus")*(1+C("familyYield.coefficient")*maxP)*C("combinations.photonic.yield");}
        public static double CraftRecoveryFraction(GameState s)
        {double existing=Game.Level(s,"materialRecycling")>0?ItemBalance.ResearchRecycling:0;var item=Equipped(s).FirstOrDefault(i=>i.type=="manufacturing-controller");return Math.Min(ItemBalance.RecoveryFraction,Math.Max(existing,item!=null?Math.Min(C("manufacturing.cap"),C("manufacturing.rate")*AbilityStrength(s,item)):0));}
        public static double AnalysisCombinationYield(GameState s)=>Enabled(s)&&Has(s,"manufacturing-controller")&&Has(s,"recycling-probe")&&Has(s,"diagnostic-adapter")?C("combinations.recycling.materials"):1;
        public static double SalvageAllocated(double paid,double used,double rate)=>Math.Min(Math.Max(0,paid-used)*rate,Math.Max(0,paid*C("recovery.maximumFraction")-used));
        public static (long gained,double remainder,double progress) SalvageFragments(GameState s,ItemInstance item)
        {
            if(!Enabled(s))return(0,0,0);double remainder=s.ItemSystemV3.recyclingFragmentProgress;if(!ScientificNumber.Finite(remainder)||remainder<0||remainder>=1)throw new FormatException("Invalid V3 fragment progress");var probe=Equipped(s).FirstOrDefault(i=>i.type=="recycling-probe");double progress=item.rarity>=Array.IndexOf(ItemBalance.Rarities,"rare")&&probe!=null?C("recycling.fragment")*AbilityStrength(s,probe)*(Has(s,"manufacturing-controller")?C("combinations.recycling.fragments"):1):0;if(progress==0)return(0,remainder,0);double value=remainder+progress,nearest=Math.Floor(value+.5);if(Math.Abs(value-nearest)<=2.220446049250313e-16*Math.Max(1,value)*16)value=nearest;long gained=(long)Math.Floor(value);return(gained,value-gained,progress);
        }
        public static bool ArchiveBlueprintRight(GameState s)=>Enabled(s)&&(s.ItemSystemV3.archiveBlueprintRight||PrestigeRules.Has(s,"I04")||s.Prestige.known.Contains("I04")||s.Workshop.learned[Workshop.Index("insight-archive")]);
        public static bool Has(GameState s,string id)=>Equipped(s).Any(i=>i.type==id);
        public static ScientificNumber BaseFactorScientific(GameState s,string family)
        {
            if(!Enabled(s))return ScientificNumber.One;string effect=family=="processor"?"compute":family=="core"?"credits":"research";
            return Equipped(s).Where(i=>Workshop.Definition(i).Family==family).Aggregate(ScientificNumber.One,(sum,i)=>sum.Add(LegacyEffects.Factor(s,"item:"+effect).Times(C("baseValue")*Strength(i)*Workshop.Amplifier(s))));
        }
        public static double BaseFactor(GameState s,string family)=>BaseFactorScientific(s,family).ToDouble();
        public static ScientificNumber HardwareOwned(GameState s)=>s.Hardware.Aggregate(ScientificNumber.Zero,(sum,count)=>sum.Add(ScientificNumber.From(count)));
        public static ScientificNumber TrainingLevels(GameState s)=>ScientificNumber.From(s.Quality).Add(ScientificNumber.From(s.Efficiency)).Add(ScientificNumber.From(s.Workshop.integration));
        public static ScientificNumber ResearchLevels(GameState s)=>s.Research.Aggregate(ScientificNumber.Zero,(sum,level)=>sum.Add(ScientificNumber.From(level)));
        public static ScientificNumber ModelUpgrades(GameState s)=>s.Meta.models.Where(level=>level>=0).Aggregate(ScientificNumber.Zero,(sum,level)=>sum.Add(ScientificNumber.From(level)));
        public static ScientificNumber Quantum(ScientificNumber hardware,ItemInstance item,double extraExponent=0,GameState context=null)
        {double p=context==null?Strength(item):AbilityStrength(context,item),q=context==null?Math.Sqrt(p):ExponentStrength(context,item);return ScientificNumber.From(C("quantum.base")).Pow(p).Multiply(ScientificNumber.One.Add(hardware.Divide(ScientificNumber.From(C("quantum.hardwareScale")))).Pow(C("quantum.exponent")*q+extraExponent));}
        public static ScientificNumber Neural(ScientificNumber training,ItemInstance item,double extraExponent=0,GameState context=null)
        {double p=context==null?Strength(item):AbilityStrength(context,item),q=context==null?Math.Sqrt(p):ExponentStrength(context,item);return ScientificNumber.From(C("neural.base")).Pow(p).Multiply(ScientificNumber.One.Add(training.Divide(ScientificNumber.From(C("neural.trainingScale")))).Pow(C("neural.exponent")*q+extraExponent));}
        public static ScientificNumber Tensor(ScientificNumber training,ItemInstance item,GameState context=null)
        {double p=context==null?Strength(item):AbilityStrength(context,item),q=context==null?Math.Sqrt(p):ExponentStrength(context,item);return ScientificNumber.From(C("tensor.base")).Pow(p).Multiply(ScientificNumber.One.Add(training.Divide(ScientificNumber.From(C("tensor.trainingScale")))).Pow(q));}
        public static ScientificNumber Lens(ScientificNumber raw,ItemInstance item,bool combination=false)=>
            (raw.CompareTo(ScientificNumber.One)<0?ScientificNumber.One:raw).Pow(C("lens.exponent")*Math.Sqrt(Strength(item))*(combination?C("combinations.industrial.lensExponent"):1));
        public static double SynthesisYield(GameState s)
        {
            if(!Enabled(s))return 1;int level=MetaRules.Level(s,"C06");if(level<0||level>ItemV3Balance.C06SynthesisFactors.Length)throw new FormatException("Invalid C06 level");
            return (level==0?1:ItemV3Balance.C06SynthesisFactors[level-1])*(Has(s,"fleet-coordinator")&&Has(s,"synthesis-coordinator")?C("combinations.industrial.yield"):1);
        }
        public static long SynthesisOutput(GameState s,int component)
        {double remainder=Enabled(s)?s.ItemSystemV3.synthesisRemainders[component]:0;return (long)Math.Floor(remainder+SynthesisYield(s)+1e-12);}
        public static void IdentifySynthesis(GameState s)
        {if(!Enabled(s)||s.Industry.synthesis==null)return;if(s.ItemSystemV3.synthesisContract!=null)throw new FormatException("Existing paid synthesis receipt");var job=s.Industry.synthesis;s.ItemSystemV3.synthesisContract=new ItemV3Synthesis{id=job.key,component=job.id,multiplier=SynthesisYield(s)};}
        public static long SettleSynthesis(GameState s,Job job)
        {
            if(!Enabled(s)||s.ItemSystemV3.synthesisContract==null)return 1;var v=s.ItemSystemV3;var receipt=v.synthesisContract;int component=Array.IndexOf(ItemBalance.ComponentIds,job.id);
            if(receipt.id!=job.key||receipt.component!=job.id||component<0||!ScientificNumber.Finite(receipt.multiplier)||receipt.multiplier<1)throw new FormatException("Mismatched paid synthesis receipt");
            double remainder=v.synthesisRemainders[component];if(!ScientificNumber.Finite(remainder)||remainder<0||remainder>=1)throw new FormatException("Invalid synthesis remainder");double total=remainder+receipt.multiplier;long amount=(long)Math.Floor(total+1e-12);v.synthesisRemainders[component]=Math.Max(0,total-amount);v.synthesisContract=null;return amount;
        }
        public static ScientificNumber AnalysisFactor(GameState s)
        {
            if(!Enabled(s))return ScientificNumber.One;Validate(s);var item=Equipped(s).FirstOrDefault(i=>i.type=="field-scanner");if(item==null)return ScientificNumber.One;
            double p=AbilityStrength(s,item);return ScientificNumber.From(C("scanner.base")).Pow(p).Multiply(ScientificNumber.One.Add(Softcap(ScientificNumber.From(s.ItemSystemV3.scannerAnalyses),C("scanner.threshold")).Times(C("scanner.perAnalysis")*p)));
        }
        public static ScientificNumber FleetFactor(GameState s,ItemInstance item)
        {
            double p=AbilityStrength(s,item);
            int v=s.Hardware.Count(n=>n>=C("fleet.minimumOwned"));
            return ScientificNumber.From(C("fleet.base")).Pow(p).Times(1+C("fleet.perClass")*p*v);
        }
        public static ScientificNumber RawHardwareCompute(GameState s)
        {
            var plain=s.Copy();plain.ItemSystemV3=null;
            plain.Workshop.equipped=new string[ItemBalance.Slots.Length];
            var total=ScientificNumber.Zero;
            for(int i=0;i<s.Hardware.Length;i++)total=total.Add(Game.HardwareClass(plain,i));
            return total;
        }
        public static ScientificNumber SingularityLensFactor(GameState s,ItemInstance item,bool fullCombination)
        {
            if(s.Meta.resets<C("lens.minimumCycles"))return ScientificNumber.One;
            var raw=RawHardwareCompute(s);
            double power=C("lens.exponent")*ExponentStrength(s,item)*
                (fullCombination?C("combinations.industrial.lensExponent"):1);
            return (raw.CompareTo(ScientificNumber.One)<0?ScientificNumber.One:raw).Pow(power);
        }
        public static double SynthesisCoordinatorFactor(GameState s,ItemInstance item)
        {
            double p=AbilityStrength(s,item),q=ExponentStrength(s,item);
            double k=s.ItemSystemV3.componentsProduced.Add(ScientificNumber.One).Log10();
            return Math.Pow(C("synthesis.base"),p)*
                Math.Pow(1+k/C("synthesis.componentLogScale"),C("synthesis.exponent")*q);
        }
        public static double SynthesisWorkFactor(GameState s)
        {
            if(!Enabled(s))return 1;
            var item=Equipped(s).FirstOrDefault(i=>i.type=="synthesis-coordinator");
            return item==null?1:SynthesisCoordinatorFactor(s,item);
        }
        public static ScientificNumber ComputeFactor(GameState s)
        {
            if(!Enabled(s))return ScientificNumber.One;Validate(s);var result=ScientificNumber.One;var h=HardwareOwned(s);var m=TrainingLevels(s);
            bool pair=Has(s,"quantum-chip")&&Has(s,"tensor-core"),trio=pair&&Has(s,"inference-router");
            foreach(var item in Equipped(s)){
                if(item.type=="quantum-chip")result=result.Multiply(Quantum(h,item,trio?C("combinations.compute.quantumExponent"):0,s));
                if(item.type=="tensor-core")result=result.Multiply(Tensor(Has(s,"neural-asic")&&Has(s,"distillation-module")&&Has(s,"darklab-resonator")?m.Add(ModelUpgrades(s).Times(C("combinations.distilled.upgrades"))):m,item,s));
                if(item.type=="entropy-sink")result=result.Multiply(ScientificNumber.From(C("entropy.base")).Pow(AbilityStrength(s,item)).Multiply(ScientificNumber.From(1+s.ItemSystemV3.knowledgeProduced.Add(ScientificNumber.One).Log10()).Pow(C("entropy.exponent")*ExponentStrength(s,item))));
                if(item.type=="inference-router")result=result.Times(1+C("router.perLink")*AbilityStrength(s,item)*Enumerable.Range(0,s.Hardware.Length).Count(i=>ValidLink(s,i)));
                if(item.type=="photonic-matrix"&&s.ActiveUntil>s.SavedAt)result=result.Times(1+C("photonic.coefficient")*AbilityStrength(s,item));
                if(item.type=="fleet-coordinator")result=result.Multiply(FleetFactor(s,item));
                if(item.type=="singularity-lens")result=result.Multiply(SingularityLensFactor(s,item,Has(s,"fleet-coordinator")&&Has(s,"synthesis-coordinator")));
            }
            if(pair)result=result.Times(C("combinations.compute.factor"));return result.Multiply(BaseFactorScientific(s,"processor"));
        }
        public static ScientificNumber CreditFactor(GameState s)
        {
            if(!Enabled(s))return ScientificNumber.One;Validate(s);var result=ScientificNumber.One;var m=TrainingLevels(s);
            bool pair=Has(s,"neural-asic")&&Has(s,"distillation-module"),trio=pair&&Has(s,"darklab-resonator");
            foreach(var item in Equipped(s)){
                double p=AbilityStrength(s,item),q=ExponentStrength(s,item);
                if(item.type=="neural-asic")result=result.Multiply(Neural(trio?m.Add(ModelUpgrades(s).Times(C("combinations.distilled.upgrades"))):m,item,trio?C("combinations.distilled.neuralExponent"):0,s));
                if(item.type=="memory-crystal")result=result.Multiply(ScientificNumber.From(C("memoryCrystal.base")).Pow(p).Multiply(ScientificNumber.From(1+s.ItemSystemV3.dataProduced.Add(ScientificNumber.One).Log10()/C("memoryCrystal.dataLogScale")).Pow(q)));
                if(item.type=="long-term-memory")result=result.Multiply(ScientificNumber.From(C("longMemory.base")).Pow(p).Multiply(ScientificNumber.One.Add(Softcap(ScientificNumber.From(s.ItemSystemV3.runMinutes),C("longMemory.threshold")).Divide(ScientificNumber.From(C("longMemory.minuteScale")))).Pow(C("longMemory.exponent")*q)));
            }
            if(pair)result=result.Times(C("combinations.distilled.credits"));
            if(Has(s,"legacy-controller")&&Has(s,"diagnostic-adapter")&&Has(s,"memory-crystal"))result=result.Multiply(ScientificNumber.From(C("combinations.boot.creditsPerClass")).Pow(s.Hardware.Take((int)C("combinations.boot.classes")).Count(n=>n>=C("combinations.boot.threshold"))));
            return result.Multiply(BaseFactorScientific(s,"core")).Multiply(ModelEcho(s));
        }
        public static ScientificNumber DataFactor(GameState s)
        {
            if(!Enabled(s))return ScientificNumber.One;Validate(s);var result=ScientificNumber.One;
            foreach(var item in Equipped(s))if(item.type=="data-prism")result=result.Multiply(ScientificNumber.From(C("prism.base")).Pow(AbilityStrength(s,item)).Multiply(ScientificNumber.One.Add(ResearchLevels(s).Divide(ScientificNumber.From(C("prism.researchScale")))).Pow(ExponentStrength(s,item))));
            foreach(var item in Equipped(s))if(item.type=="photonic-matrix"&&s.ActiveUntil>s.SavedAt)result=result.Times(1+C("photonic.coefficient")*AbilityStrength(s,item));
            return result.Times(BurstFactor(s,true));
        }
        public static ScientificNumber ModelEcho(GameState s)
        {
            var item=Equipped(s).FirstOrDefault(i=>i.type=="model-echo-core");if(item==null||string.IsNullOrEmpty(s.Workshop.activeModel))return ScientificNumber.One;
            return ScientificNumber.From(MetaRules.Core(s)).Times(MetaRules.Factor(s,"revenue")).Pow(C("echo.exponent")*ExponentStrength(s,item));
        }
        static bool ValidLink(GameState s,int i)=>i>0&&Game.Level(s,"distributedInference")>0&&s.Hardware[i]>0&&s.Hardware[i-1]>=C("link.previous")&&ChallengeRules.Link(s,i);
        public static ScientificNumber[] HardwareClasses(GameState s)
        {
            var plain=s.Copy();plain.ItemSystemV3=null;plain.Workshop.equipped=new string[ItemBalance.Slots.Length];
            var equipped=Equipped(s).ToArray();var legacy=equipped.FirstOrDefault(i=>i.type=="legacy-controller");var coupler=equipped.FirstOrDefault(i=>i.type=="quantum-coupler");var sparse=equipped.FirstOrDefault(i=>i.type=="sparse-decoder");
            var values=Enumerable.Range(0,s.Hardware.Length).Select(i=>{
                var value=Game.HardwareClass(plain,i,coupler!=null&&ValidLink(s,i)?1+AbilityStrength(s,coupler):1);
                if(legacy!=null&&i<C("legacy.classes"))value=value.Multiply(ScientificNumber.From(C("legacy.base")).Pow(AbilityStrength(s,legacy)).Multiply(ScientificNumber.One.Add(ScientificNumber.From(s.Hardware[i]).Divide(ScientificNumber.From(C("legacy.countScale")))).Pow(ExponentStrength(s,legacy))));
                return value;
            }).ToArray();
            if(sparse!=null){var selected=Enumerable.Range(0,values.Length).Where(i=>s.Hardware[i]>0).OrderByDescending(i=>values[i],Comparer<ScientificNumber>.Default).ThenBy(i=>i).Take((int)C("sparse.classes"));double coefficient=s.Hardware.Count(n=>n>0)<=C("sparse.classes")?C("sparse.few"):C("sparse.normal");foreach(int i in selected.ToArray())values[i]=values[i].Times(1+coefficient*AbilityStrength(s,sparse));}
            return values;
        }
        public static double TrainingStrength(GameState s,int level)
        {
            if(level<0)throw new ArgumentOutOfRangeException(nameof(level));var curriculum=Equipped(s).FirstOrDefault(i=>i.type=="curriculum-module");var distillation=Equipped(s).FirstOrDefault(i=>i.type=="distillation-module");
            double threshold=Balance.TrainingSoftStart*(curriculum!=null?1+C("curriculum.threshold")*AbilityStrength(s,curriculum):1),scale=Balance.TrainingSoftScale;
            if(level<=threshold)return level;double delta=level-threshold,curve=scale*Math.Log(1+delta/scale);if(distillation==null)return threshold+curve;
            double strength=C("distillation.strength")*ExponentStrength(s,distillation),rho=strength/(1+strength);return threshold+Math.Exp((1-rho)*Math.Log(curve)+rho*Math.Log(delta));
        }
        public static double WorkFactor(GameState s,bool research)
        {
            if(!Enabled(s))return 1;double result=1;foreach(var item in Equipped(s)){
                double p=AbilityStrength(s,item),q=ExponentStrength(s,item);
                if(!research&&item.type=="logic-seed")result*=Math.Pow(C("logic.base"),p)*(1+C("logic.perStreak")*p*s.ItemSystemV3.learningStreak);
                if(!research&&item.type=="mnemonic-anchor")result*=Math.Pow(C("anchorMemory.base"),p)*ScientificNumber.One.Add(ModelUpgrades(s).Divide(ScientificNumber.From(C("anchorMemory.upgradeScale")))).Pow(C("anchorMemory.exponent")*q).ToDouble();
                if(research&&item.type=="blueprint-archive")result*=Math.Pow(C("blueprint.base"),p)*(1+C("blueprint.perBlueprint")*p*s.Workshop.mastery.Count(level=>level>=1));
                if(research&&item.type=="cycle-observatory")result*=Math.Pow(C("cycle.base"),p)*Math.Pow(1+s.Meta.resets,C("cycle.exponent")*q);
            }
            if(Has(s,"photonic-array")&&Has(s,"logic-seed"))result*=C("combinations.learning.speed");
            if(research&&Has(s,"blueprint-archive")&&Has(s,"data-prism"))result*=C("combinations.library.research");
            return result*(research?BaseFactor(s,"research"):1);
        }
        public static ScientificNumber KnowledgeFactor(GameState s)
        {
            if(!Enabled(s))return ScientificNumber.One;var result=ScientificNumber.One;var resonator=Equipped(s).FirstOrDefault(i=>i.type=="darklab-resonator");
            if(resonator!=null){var regular=s.Copy();regular.ActiveUntil=0;var rate=Game.DataRate(regular);result=result.Multiply(ScientificNumber.From(C("resonator.base")).Pow(AbilityStrength(s,resonator)).Multiply(ScientificNumber.From(1+rate.Add(ScientificNumber.One).Log10()/C("resonator.dataLogScale")).Pow(C("resonator.exponent")*ExponentStrength(s,resonator))));}
            if(resonator!=null&&Has(s,"entropy-sink")){result=result.Times(C("combinations.insight.factor"));if(Has(s,"model-echo-core")&&!string.IsNullOrEmpty(s.Workshop.activeModel))result=result.Times(Math.Pow(1+s.Workshop.activeModelLevel/C("combinations.insight.upgradeScale"),C("combinations.insight.exponent")));}
            return result;
        }
        public static ScientificNumber AxiomFactor(GameState s)
        {
            if(!Enabled(s))return ScientificNumber.One;var result=ScientificNumber.One;var lattice=Equipped(s).FirstOrDefault(i=>i.type=="axiom-lattice");if(lattice!=null){int n=s.Workshop.nodes.Where(id=>PrestigeBalance.Nodes.Any(node=>node.Id==id)).Distinct().Count();result=result.Multiply(ScientificNumber.From(C("lattice.base")).Pow(Strength(lattice)).Times(Math.Pow(1+n/C("lattice.nodeScale"),C("lattice.exponent")*Math.Sqrt(Strength(lattice)))));}
            if(lattice!=null&&Has(s,"cycle-observatory"))result=result.Times(C("combinations.axiom.factor"));return result;
        }
        public static ScientificNumber WithItemV3(this ScientificNumber value,GameState state,List<ProductionStep> trace,string kind)
        {
            if(!Enabled(state))return value;
            var factor=kind=="compute"?ComputeFactor(state):kind=="credits"?CreditFactor(state):DataFactor(state);
            return value.MultiplyObserved(factor,trace,"Item V3 "+kind);
        }
    }
}
