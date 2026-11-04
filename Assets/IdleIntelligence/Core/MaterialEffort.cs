using System;
using System.Collections.Generic;
using System.Linq;
namespace IdleIntelligence.Core
{
    // Continuous expected-output model for ONE shared analysis/synthesis slot.
    // No balances live here: sources and target pacing are supplied by EconomyBalance.
    public sealed class MaterialSource
    {
        public string Id;
        public double[] PerSecond;
        public double DataPerSecond;
        public double JobSeconds,ScannerPower,ScannerCount;
    }
    public sealed class MaterialEffortQuote
    {
        public double Seconds,Data;
        public double[] SourceSeconds;
    }
    public static class MaterialEffort
    {
        // Dual covering LP: max needs*y, subject to sourceRates*y <= 1, y >= 0.
        // Every ingredient has a synthesis source, so the model is bounded.
        // Primal source-time allocations are recovered from the slack columns.
        public static MaterialEffortQuote Quote(double[] needs,MaterialSource[] sources)
        {
            if(needs==null||sources==null||needs.Any(v=>!ScientificNumber.Finite(v)||v<0))throw new ArgumentException("Invalid material needs");
            int[] inputs=Enumerable.Range(0,needs.Length).Where(c=>needs[c]>0).ToArray();
            int m=sources.Length,n=inputs.Length,width=n+m+1;var a=new double[m+1,width];var basis=new int[m];
            for(int row=0;row<m;row++){
                if(sources[row].PerSecond.Length!=needs.Length||sources[row].PerSecond.Any(v=>!ScientificNumber.Finite(v)||v<0)||!ScientificNumber.Finite(sources[row].DataPerSecond)||sources[row].DataPerSecond<0)throw new ArgumentException("Invalid material source");
                for(int col=0;col<n;col++)a[row,col]=sources[row].PerSecond[inputs[col]];
                a[row,n+row]=1;a[row,width-1]=1;basis[row]=n+row;
            }
            for(int col=0;col<n;col++)a[m,col]=-needs[inputs[col]];
            for(int iteration=0;iteration<10000;iteration++){
                int entering=-1;for(int col=0;col<width-1;col++)if(a[m,col]<-1e-9){entering=col;break;}
                if(entering<0){
                    var time=new double[m];for(int row=0;row<m;row++)time[row]=Math.Max(0,a[m,n+row]);
                    return new MaterialEffortQuote{Seconds=a[m,width-1],SourceSeconds=time,Data=time.Select((t,i)=>t*sources[i].DataPerSecond).Sum()};
                }
                int leaving=-1;double ratio=double.PositiveInfinity;
                for(int row=0;row<m;row++)if(a[row,entering]>1e-12){double candidate=a[row,width-1]/a[row,entering];if(candidate<ratio-1e-9||Math.Abs(candidate-ratio)<=1e-9&&(leaving<0||basis[row]<basis[leaving])){ratio=candidate;leaving=row;}}
                if(leaving<0)throw new InvalidOperationException("Material has no supply source");
                double pivot=a[leaving,entering];for(int col=0;col<width;col++)a[leaving,col]/=pivot;
                for(int row=0;row<=m;row++)if(row!=leaving){double factor=a[row,entering];for(int col=0;col<width;col++)a[row,col]-=factor*a[leaving,col];}
                basis[leaving]=entering;
            }
            throw new InvalidOperationException("Material optimization did not converge");
        }
        // Integral of the live scanner's sqrt-softcap learning law over completed jobs.
        // A continuous approximation; the discrete seeded simulator audits its error.
        public static double ScannerTime(double start,double jobs,double power)
        {
            if(jobs<=0)return 0;if(power<=0)return jobs;
            double k=ItemV3Balance.Get("scanner.threshold"),b=ItemV3Balance.Get("scanner.perAnalysis")*power;
            double end=start+jobs,time=0;
            double cap=k*EconomyBalance.ScannerLearningCapMultiplier,capCount=k+(cap-k)*(cap-k)/k;
            if(end>capCount){time+=(end-Math.Max(start,capCount))/(1+b*cap);end=Math.Min(end,capCount);}
            if(start>=end)return time;
            if(start<k){double stop=Math.Min(k,end);time+=Math.Log((1+b*stop)/(1+b*start))/b;start=stop;}
            if(end>start){double u0=Math.Sqrt(Math.Max(0,start-k)),u1=Math.Sqrt(end-k),a=1+b*k,d=b*Math.Sqrt(k);time+=2*(u1-u0)/d-2*a/(d*d)*Math.Log((a+d*u1)/(a+d*u0));}
            return time;
        }
        public static double LearningSeconds(MaterialSource[] sources,double[] initialTimes,double scale=1)
        {
            double counter=sources.Select(s=>s.ScannerCount).DefaultIfEmpty().Max(),total=0;
            // Short jobs first: their learning also benefits the later long jobs.
            foreach(int i in Enumerable.Range(0,sources.Length).OrderBy(i=>sources[i].JobSeconds)){
                var source=sources[i];double seconds=initialTimes[i]*scale;
                if(source.ScannerPower<=0||seconds<=0){total+=seconds;continue;}
                double jobs=seconds/source.JobSeconds;
                double initial=1+ItemV3Balance.Get("scanner.perAnalysis")*source.ScannerPower*EconomyBalance.ScannerLearning(source.ScannerCount);
                total+=source.JobSeconds*initial*ScannerTime(counter,jobs,source.ScannerPower);counter+=jobs;
            }
            return total;
        }
        public static MaterialSource[] Prune(double[] needs,MaterialSource[] sources)
        {
            int[] inputs=Enumerable.Range(0,needs.Length).Where(c=>needs[c]>0).ToArray();var kept=new List<MaterialSource>();
            for(int i=0;i<sources.Length;i++){
                if(!inputs.Any(c=>sources[i].PerSecond[c]>0))continue;
                bool dominated=false;
                for(int j=0;j<sources.Length&&!dominated;j++)if(j!=i){
                    bool all=true,better=false;foreach(int c in inputs){double delta=sources[j].PerSecond[c]-sources[i].PerSecond[c];if(delta< -1e-12){all=false;break;}if(delta>1e-12)better=true;}
                    if(all&&(better||sources[j].DataPerSecond<sources[i].DataPerSecond||sources[j].DataPerSecond==sources[i].DataPerSecond&&j<i))dominated=true;
                }
                if(!dominated)kept.Add(sources[i]);
            }
            return kept.ToArray();
        }
        // Uses the same production/bonus functions as the live game, not guessed drop rates.
        // Reference states are isolated mathematical fixtures, never player saves.
        public static MaterialSource[] Sources(GameState reference,string label)
        {
            var result=new List<MaterialSource>();
            for(int recipe=0;recipe<ItemBalance.Analyses.Length;recipe++){
                if(!MaterialAnalysis.RecipeAccess(reference,recipe))continue;
                var d=ItemBalance.Analyses[recipe];int max=d.Id.StartsWith("hardware")?2:d.Id.StartsWith("architecture")?3:5;
                for(int focus=-1;focus<5;focus++){
                    if(focus>=0&&(!MaterialAnalysis.Access(reference,focus)||focus>=max))continue;
                    var s=reference.Copy();s.Workshop.focus=focus;double duration=d.Work/MaterialAnalysis.Speed(s);
                    var weights=Enumerable.Range(0,ItemBalance.ComponentIds.Length).Select(c=>{int f=MaterialAnalysis.Family(c);return f>=max||!MaterialAnalysis.Access(s,f)?0:f==focus?ItemBalance.MaterialFocusWeight*ItemSystemV3.FocusFactor(s):1d;}).ToArray();
                    double total=weights.Sum(),units=MaterialAnalysis.Units(s,recipe);
                    var rate=weights.Select((w,c)=>units*w/total/duration*ItemSystemV3.MaterialFamilyYield(s,MaterialAnalysis.Family(c))*(focus==MaterialAnalysis.Family(c)&&PrestigeRules.Has(s,"W03")?ItemV3Balance.Get("prestige.items.W03focus"):1)).ToArray();
                    result.Add(new MaterialSource{Id=label+":"+d.Id+":"+focus,PerSecond=rate,DataPerSecond=Industry.AnalysisCost(s,d.Cost)/duration,JobSeconds=duration,ScannerPower=ItemSystemV3.Equipped(s).Where(i=>i.type=="field-scanner").Select(i=>ItemSystemV3.AbilityStrength(s,i)).FirstOrDefault(),ScannerCount=s.ItemSystemV3.scannerAnalyses});
                }
            }
            for(int c=0;c<ItemBalance.ComponentIds.Length;c++){
                int family=MaterialAnalysis.Family(c);if(!MaterialAnalysis.Access(reference,family))continue;
                double duration=IndustryBalance.SynthesisWork[family]/(MaterialAnalysis.BaseSpeed(reference)*ItemSystemV3.SynthesisWorkFactor(reference));
                var rate=new double[ItemBalance.ComponentIds.Length];rate[c]=ItemSystemV3.SynthesisYield(reference)/duration;
                result.Add(new MaterialSource{Id=label+":synthesis:"+c,PerSecond=rate,DataPerSecond=Industry.AnalysisCost(reference,IndustryBalance.SynthesisCosts[family])/duration});
            }
            return result.ToArray();
        }
    }
}
