using System;
using System.IO;
using System.Linq;
using System.Globalization;
using IdleIntelligence.Core;

// Deterministic recipe quotations, not a claim about time-to-obtain or live income.
internal static class RecipeCostProbe
{
    public static void Run()
    {
        Directory.CreateDirectory("NativeChecks/out");
        using(var output=new StreamWriter("NativeChecks/out/recipe-costs.csv")){
            output.WriteLine("item,old_types,new_types,old_total,new_total,mastered_total,components");
            foreach(var d in ItemBalance.Items){
                var original=d.Components[0];var costs=EconomyBalance.CraftComponents(true,d,0);var mastered=EconomyBalance.CraftComponents(true,d,4);
                string inputs=string.Join(";",Enumerable.Range(0,costs.Length).Where(c=>costs[c]>0).Select(c=>ItemBalance.ComponentIds[c]+":"+costs[c].ToString(CultureInfo.InvariantCulture)));
                output.WriteLine(string.Join(",",d.Id,original.Count(v=>v>0),costs.Count(v=>v>0),original.Sum().ToString(CultureInfo.InvariantCulture),costs.Sum().ToString(CultureInfo.InvariantCulture),mastered.Sum().ToString(CultureInfo.InvariantCulture),inputs));
            }
        }
        Console.WriteLine("42 native recipe quotations written to NativeChecks/out/recipe-costs.csv");
    }
}
