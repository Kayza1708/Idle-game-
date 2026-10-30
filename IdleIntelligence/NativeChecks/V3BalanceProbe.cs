using System;
using System.IO;
using System.Linq;
using System.Collections.Generic;
using System.Globalization;
using IdleIntelligence.Core;

/// <summary>
/// A deterministic, paid-only 30-minute native Unity V3 reference playtest.
/// No inventory, currency or research is injected. Its bot is deliberately
/// simple, NOT an optimized human proxy and NOT an assertion of good balance.
/// </summary>
internal static class V3BalanceProbe
{
    static readonly CultureInfo I=CultureInfo.InvariantCulture;
    const int Minutes=30;
    static readonly int[] Snapshots={0,1,3,5,10,15,20,25,30};
    static string Num(ScientificNumber n)=>n.ToString();
    static bool Bought(GameState s,string id,out GameState next)
    {
        next=Game.Buy(s,id);return !object.ReferenceEquals(s,next);
    }
    static GameState PurchaseFive(GameState state)
    {
        var s=state;
        for(int n=0;n<5;n++){
            bool found=false;
            // Reach the next affordable class naturally without an auto-buy cheat.
            foreach(string id in new[]{"gpu","pc","sbc","calculator"}){
                if(Bought(s,id,out var purchased)){s=purchased;found=true;break;}
            }
            if(!found)break;
        }
        return s;
    }
    static GameState Actions(GameState state)
    {
        var s=PurchaseFive(state);
        if(s.Training==null){
            string track=s.Quality<=s.Efficiency?"quality":"efficiency";
            var trained=Game.Train(s,track);
            if(!object.ReferenceEquals(s,trained))s=trained;
        }
        if(s.ResearchJob==null&&s.Prestige.labs.Length==0){
            foreach(string id in new[]{"blueprints","dataGeneration","computeOptimization"}){
                var next=Game.Research(s,id);
                if(!object.ReferenceEquals(s,next)){s=next;break;}
            }
        }
        return s;
    }
    static string[] Read(GameState s,int minute)
    {
        var rates=Game.ViewRates(s);
        return new[]{
            minute.ToString(I),Num(s.Credits),Num(rates.Income),
            Num(s.Data),Num(rates.Data),Num(rates.Compute),
            s.Hardware.Sum().ToString(I),s.Hardware.Count(n=>n>0).ToString(I),
            s.Quality.ToString(I),s.Efficiency.ToString(I),
            s.Research.Sum().ToString(I),Num(PrestigeRules.Claim(s)),
            s.Workshop.inventory.Length.ToString(I),s.Lifetime.trainingCompleted.ToString(I),
            s.Lifetime.researchCompleted.ToString(I),s.Prestige.resets.ToString(I)
        };
    }
    public static void Run()
    {
        var s=Game.NewV3(1_000,"native-v3-balance-baseline",true);
        var records=new List<string[]>();
        var headers=new[]{"minute","credits","credits_per_second","data","data_per_second","compute_per_second",
            "hardware_units","hardware_classes","quality","efficiency","research_levels",
            "claimable_int","items","training_finished","research_finished","prestige_resets"};
        records.Add(headers);
        records.Add(Read(s,0));
        Console.WriteLine("V3 native baseline minute=0 startCredits="+Num(s.Credits));
        for(int minute=1;minute<=Minutes;minute++)
        {
            s=Actions(s);
            for(int step=0;step<2;step++){
                // Two accepted active taps per simulated minute.
                s=Game.Tap(s,s.SavedAt);
                s=Game.Advance(s,s.SavedAt+30_000,true);
            }
            Game.Validate(s);
            if(Snapshots.Contains(minute)){
                var row=Read(s,minute);records.Add(row);
                Console.WriteLine("V3 baseline minute="+minute+" credits/s="+row[2]+
                    " data/s="+row[4]+" hardware="+row[6]+" training="+row[8]+"/"+row[9]+
                    " research="+row[10]+" claimableINT="+row[11]);
            }
        }
        string path=Path.Combine("IdleIntelligence","NativeChecks","out","unity-v3-balance-baseline.csv");
        Directory.CreateDirectory(Path.GetDirectoryName(path));
        // Deliberately invariant numbers, one record per snapshot, no source-code revisions.
        File.WriteAllLines(path,records.Select(fields=>string.Join(",",fields)));
        Console.WriteLine("V3 native baseline written: "+path);
    }
}
