using System;
using System.Linq;
using System.Collections.Generic;
namespace IdleIntelligence.Core
{
    // Development contract; the save boundary rejects it until full V3 migration
    // and all completion-event contracts are accepted. Never silently drop it.
    public sealed class ItemV3State
    {
        public int version=3;
        public ScientificNumber dataProduced=ScientificNumber.Zero,knowledgeProduced=ScientificNumber.Zero,componentsProduced=ScientificNumber.Zero;
        public double runMinutes;
        public long nextTrainingSequence=1,lastCompletedTrainingSequence;public int learningStreak;public long scannerAnalyses;public string lastLearningTrack,lastTrainingCompletionCause;public bool archiveBlueprintRight,axiomDiscovered;public double axiomDiscoveryAt=-1;
        public ItemV3State Copy()=>(ItemV3State)MemberwiseClone();
    }
    public static class ItemSystemV3
    {
        static double C(string key)=>ItemV3Balance.Get(key);
        public static bool Enabled(GameState s)=>s.ItemSystemV3?.version==3;
        public static void Validate(GameState s)
        {
            var v=s?.ItemSystemV3;if(v==null)return;
            if(v.version!=3||v.dataProduced==null||v.knowledgeProduced==null||v.componentsProduced==null||!ScientificNumber.Finite(v.runMinutes)||v.runMinutes<0||v.nextTrainingSequence<1||v.nextTrainingSequence>MaxExactSequence||v.lastCompletedTrainingSequence<0||v.lastCompletedTrainingSequence>=v.nextTrainingSequence||v.scannerAnalyses<0||v.scannerAnalyses>MaxExactSequence||v.learningStreak<0||v.learningStreak>C("logic.maxStreak")||v.lastLearningTrack!=null&&v.lastLearningTrack!="quality"&&v.lastLearningTrack!="efficiency"||v.lastTrainingCompletionCause!=null&&v.lastTrainingCompletionCause!="regular"&&v.lastTrainingCompletionCause!="bonus"&&v.lastTrainingCompletionCause!="intro")throw new FormatException("Invalid V3 production counters");
        }
        public static void RecordProduction(GameState s,double seconds,ScientificNumber data,ScientificNumber knowledge)
        {
            if(!Enabled(s))return;if(!ScientificNumber.Finite(seconds)||seconds<0)throw new ArgumentOutOfRangeException(nameof(seconds));
            var v=s.ItemSystemV3;v.dataProduced=v.dataProduced.Add(data);v.knowledgeProduced=v.knowledgeProduced.Add(knowledge);v.runMinutes+=seconds/60;
        }
        public static void RecordComponents(GameState s,int component,long amount,string source)
        {
            if(!Enabled(s))return;switch(source){case "analysis":case "synthesis":case "passive-hardware":case "paid-hardware-package":case "paid-class-upgrade":break;default:return;}
            if(component<0||component>=ItemBalance.ComponentIds.Length||amount<0)throw new ArgumentOutOfRangeException(nameof(amount));
            s.ItemSystemV3.componentsProduced=s.ItemSystemV3.componentsProduced.Add(ScientificNumber.From(amount));
        }
        public static void ResetProduction(GameState s,bool axiom=false)
        {
            if(!Enabled(s))return;var v=s.ItemSystemV3;v.dataProduced=ScientificNumber.Zero;v.runMinutes=0;v.learningStreak=0;v.lastLearningTrack=null;v.scannerAnalyses=0;
            if(axiom){v.knowledgeProduced=ScientificNumber.Zero;v.componentsProduced=ScientificNumber.Zero;}
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
            if(!regular||job.intro||job.id=="integration"||!Has(s,"logic-seed"))return;
            if(v.learningStreak<0||v.learningStreak>C("logic.maxStreak"))throw new FormatException("Invalid V3 learning series");
            v.learningStreak=v.lastLearningTrack==job.id?(int)Math.Floor(v.learningStreak/C("logic.sameTrackDivisor")):Math.Min((int)C("logic.maxStreak"),v.learningStreak+1);v.lastLearningTrack=job.id;
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
        public static ScientificNumber AnalysisFactor(GameState s)
        {
            if(!Enabled(s))return ScientificNumber.One;Validate(s);var item=Equipped(s).FirstOrDefault(i=>i.type=="field-scanner");if(item==null)return ScientificNumber.One;
            double p=AbilityStrength(s,item);return ScientificNumber.From(C("scanner.base")).Pow(p).Multiply(ScientificNumber.One.Add(Softcap(ScientificNumber.From(s.ItemSystemV3.scannerAnalyses),C("scanner.threshold")).Times(C("scanner.perAnalysis")*p)));
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
            return result;
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
