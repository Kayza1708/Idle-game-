using System;
using System.IO;
using System.Linq;
using System.Collections.Generic;
using System.Globalization;
using IdleIntelligence.Core;
internal static class EconomyMathAudit
{
    static readonly CultureInfo I=CultureInfo.InvariantCulture;
    static string N(double v)=>v.ToString("R",I);
    static void Write(string name,List<string> rows){Directory.CreateDirectory("NativeChecks/out/math");File.WriteAllLines("NativeChecks/out/math/"+name+".csv",rows);}
    public static void Run()
    {
        var recipes=new List<string>{"item,tier,target_days,frozen_days,learning_days,components,material_data_budget"};
        foreach(var d in ItemBalance.Items){var tier=EconomyBalance.TierOf(d.Id);if(!tier.HasValue)continue;var q=EconomyBalance.RecipeEffort(d.Id);double measured=EconomyBalance.RecipeLearningSeconds(d.Id),target=EconomyBalance.RecipeTargetSeconds(tier.Value);if(Math.Abs(measured/target-1)>.02)throw new Exception("Recipe effort drift: "+d.Id);recipes.Add(string.Join(",",d.Id,tier,N(EconomyBalance.RecipeTargetSeconds(tier.Value)/86400),N(q.Seconds/86400),N(EconomyBalance.RecipeLearningSeconds(d.Id)/86400),N(EconomyBalance.CraftComponents(true,d,0).Sum()),N(q.Data)));}Write("recipes",recipes);
        var powers=new List<string>{"exponent,tier,target_days"};foreach(double p in new[]{1.6,1.9,2.1,EconomyBalance.RecipeEffortExponent,2.5,3})foreach(EconomyBalance.RecipeTier tier in Enum.GetValues(typeof(EconomyBalance.RecipeTier)))powers.Add(N(p)+","+tier+","+N(EconomyBalance.RecipeTargetSeconds(tier,p)/86400));Write("exponents",powers);
        var hardware=new List<string>{"hardware,owned,cost_log10,bulk10_log10,compute_log10,income_log10,marginal_payback_seconds_log10,growth"};
        for(int h=0;h<Balance.Hardware.Length;h++)foreach(long owned in new[]{1L,25L,100L,250L,1000L}){
            var s=Game.NewV3(1000,"math-hardware");s.Hardware[h]=owned;var rates=Game.ViewRates(s);var next=s.Copy();next.Hardware[h]++;var delta=Game.Income(next).Subtract(rates.Income);var price=Game.HardwareCost(s,h);
            hardware.Add(string.Join(",",Balance.Hardware[h].Id,owned,N(price.Log10()),N(Game.HardwareCost(s,h,10).Log10()),N(rates.Compute.Log10()),N(rates.Income.Log10()),delta.CompareTo(ScientificNumber.Zero)>0?N(price.Divide(delta).Log10()):"Infinity",N(Balance.Hardware[h].Growth)));
        }Write("hardware",hardware);
        var research=new List<string>{"research,level,price_log10,work_seconds,effective_cost_growth,effect"};
        foreach(var d in Balance.Research)foreach(int level in new[]{0,5,10,20,50}){
            if(d.Project&&level>0)continue;var s=Game.NewV3(1000,"math-research");int i=Game.ResearchIndex(d.Id);s.Research[i]=level;s.QualityUsed=s.ResearchUsed=true;
            research.Add(string.Join(",",d.Id,level,N(Game.ResearchCost(s,i).Log10()),N(Game.ResearchWork(s,i)),N(Balance.ResearchGrowth*EconomyBalance.ResearchLevelGrowth),N(d.Effect)));
        }Write("research",research);
        var training=new List<string>{"track,level,cost_log10,work_seconds,strength"};foreach(string track in new[]{"quality","efficiency","integration"})foreach(int level in new[]{0,5,10,20}){
            var s=Game.NewV3(1000,"math-training");s.QualityUsed=true;if(track=="quality")s.Quality=level;else if(track=="efficiency")s.Efficiency=level;else s.Workshop.integration=level;
            training.Add(string.Join(",",track,level,N(Game.TrainingCost(s,track).Log10()),N(Game.TrainingWork(s,track)),N(ItemSystemV3.TrainingStrength(s,level))));
        }Write("training",training);
        var prestige=new List<string>{"A01_level,I10,gain_exponent,credit_per_int"};for(int level=0;level<=MetaBalance.Axioms.First(a=>a.Id=="A01").Costs.Length;level++)foreach(bool i10 in new[]{false,true}){
            var s=Game.NewV3(1000,"math-prestige");s.Meta.axioms[Array.FindIndex(MetaBalance.Axioms,a=>a.Id=="A01")]=level;if(i10)s.Workshop.nodes=new[]{"I10"};double p=PrestigeV3.GainExponent(s);if(p>=1)throw new Exception("Superlinear INT feedback");prestige.Add(level+","+i10+","+N(p)+","+N(PrestigeV3.CreditRate(s)));
        }Write("prestige",prestige);
        var scanner=new List<string>{"analyses,old_effective_learning,bounded_learning,common_speed_old,common_speed_new"};foreach(long c in new[]{0L,25L,100L,250L,1000L,1000000L}){double old=ItemSystemV3.Softcap(ScientificNumber.From(c),ItemV3Balance.Get("scanner.threshold")).ToDouble();scanner.Add(c+","+N(old)+","+N(EconomyBalance.ScannerLearning(c))+","+N(2*(1+.05*old))+","+N(2*(1+.05*EconomyBalance.ScannerLearning(c))));}Write("scanner",scanner);
        var seeds=new List<string>{"item,seed,days,jobs,data_spent,kind"};
        foreach(string id in new[]{"darklab-resonator","axiom-anchor","singularity-lens"})foreach(uint seed in new uint[]{1,1708,9157}){var result=Acquire(id,seed);if(result.Item1/86400<7||result.Item1/86400>14)throw new Exception("Late material pacing outside 1–2 weeks: "+id);seeds.Add(id+","+seed+","+N(result.Item1/86400)+","+result.Item2+","+N(result.Item3)+",prepared_material_only");Console.WriteLine(id+" seed="+seed+" actual material days="+N(result.Item1/86400)+" jobs="+result.Item2);}Write("seeded-materials",seeds);
        Console.WriteLine("ECONOMY MATH AUDIT COMPLETE");
    }
    // Real paid start/completion functions and RNG, with explicit prepared research/gear
    // and pre-funded DATA. No materials are injected. This is not a fresh-save campaign.
    static Tuple<double,int,double> Acquire(string id,uint seed)
    {
        var d=ItemBalance.Items[Workshop.Index(id)];var tier=EconomyBalance.TierOf(id).Value;var costs=EconomyBalance.CraftComponents(true,d,0);var sources=EconomyBalance.RecipeSources(id);int family=Enumerable.Range(0,costs.Length).Where(c=>costs[c]>0).Max(MaterialAnalysis.Family);
        var carry=EconomyBalance.MaterialReference(tier,family,"field-scanner");carry.Data=ScientificNumber.Parse("1e30");carry.Workshop.materialRng=seed;double elapsed=0,paid=0;int jobs=0;
        for(int round=0;round<10;round++){
            var missing=costs.Select((v,c)=>Math.Max(0,v-carry.Workshop.components[c])).ToArray();if(missing.All(v=>v==0))return Tuple.Create(elapsed,jobs,paid);
            var plan=MaterialEffort.Quote(missing,sources);
            foreach(int i in Enumerable.Range(0,sources.Length).OrderBy(i=>sources[i].JobSeconds)){
                if(plan.SourceSeconds[i]<1e-7)continue;string[] parts=sources[i].Id.Split(':');var equipped=parts[0].Split('+');var s=EconomyBalance.MaterialReference(tier,family,equipped[0],equipped.Length>1?equipped[1]:null);
                s.Data=carry.Data;s.Workshop.nextId=carry.Workshop.nextId;s.Workshop.components=(long[])carry.Workshop.components.Clone();s.Workshop.materialRng=carry.Workshop.materialRng;s.Workshop.analysisRemainders=(double[])carry.Workshop.analysisRemainders.Clone();s.Workshop.componentRemainder=carry.Workshop.componentRemainder;s.Workshop.blueprintRemainder=carry.Workshop.blueprintRemainder;s.ItemSystemV3.scannerAnalyses=carry.ItemSystemV3.scannerAnalyses;s.ItemSystemV3.componentsProduced=carry.ItemSystemV3.componentsProduced;s.ItemSystemV3.synthesisRemainders=(double[])carry.ItemSystemV3.synthesisRemainders.Clone();
                if(parts[1]=="synthesis"){
                    int c=int.Parse(parts[2],I);double perJob=ItemSystemV3.SynthesisYield(s),wanted=plan.SourceSeconds[i]*sources[i].PerSecond[c];int count=(int)Math.Ceiling(wanted/perJob);
                    for(int j=0;j<count;j++){s=Industry.Synthesize(s,c);if(s.Industry.synthesis==null)throw new Exception("Synthesis start rejected");double seconds=s.Industry.synthesis.required/(MaterialAnalysis.BaseSpeed(s)*ItemSystemV3.SynthesisWorkFactor(s));paid+=Industry.AnalysisCost(s,IndustryBalance.SynthesisCosts[MaterialAnalysis.Family(c)]);Industry.Work(s,seconds);s=Industry.Settle(s);elapsed+=seconds;jobs++;}
                }else{
                    int recipe=Array.FindIndex(ItemBalance.Analyses,a=>a.Id==parts[1]);s.Workshop.focus=int.Parse(parts[2],I);int count=(int)Math.Ceiling(plan.SourceSeconds[i]/sources[i].JobSeconds);
                    for(int j=0;j<count;j++){s=MaterialAnalysis.Start(s,recipe);if(!s.Workshop.hasAnalysis)throw new Exception("Analysis start rejected");double seconds=s.Workshop.analysis.required/MaterialAnalysis.Speed(s);paid+=Industry.AnalysisCost(s,ItemBalance.Analyses[recipe].Cost);MaterialAnalysis.Advance(s,seconds);elapsed+=seconds;jobs++;}
                }
                carry=s;if(jobs>200000)throw new Exception("Unbounded material benchmark");
            }
        }
        throw new Exception("Material procurement failed to converge for "+id);
    }
}
