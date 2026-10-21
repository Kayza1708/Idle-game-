using System;
using System.Linq;
namespace IdleIntelligence.Core
{
    // Source counters are JS numbers, including fractional seconds. Do not infer lost history.
    [Serializable] public sealed class LifetimeState
    {
        public int schema=1;public bool initialized;
        public bool historicalUnavailable;
        public double since;
        public double calculatorsBought,hardwareBought,milestones,prestiges,intEarned,labSeconds;
        public double researchStarted,researchCompleted,trainingStarted,trainingCompleted,itemsCrafted;
        public double taps,overclocks,componentsEarned,dropsClaimed,itemsFused,forgeUpgrades;
        public double regularCredits,regularData,activeSeconds;
        public string[] hardwareClasses=Array.Empty<string>(),itemTypes=Array.Empty<string>(),discoveredComponents=Array.Empty<string>(),runMilestoneClasses=Array.Empty<string>();
        public double[] hardwareMasteryXp=new double[Balance.Hardware.Length];
        public double analysesCompleted;
        public LifetimeState Copy()
        {
            var s=(LifetimeState)MemberwiseClone();s.hardwareClasses=(string[])hardwareClasses.Clone();s.itemTypes=(string[])itemTypes.Clone();s.discoveredComponents=(string[])discoveredComponents.Clone();s.runMilestoneClasses=(string[])runMilestoneClasses.Clone();s.hardwareMasteryXp=(double[])hardwareMasteryXp.Clone();return s;
        }
    }
    public static class Lifetime
    {
        public static void Components(GameState s,int component,long amount)
        {if(s.AdvanceLog!=null)s.AdvanceLog.Components[component]+=amount;
            if(amount<=0)return;
            s.Lifetime.componentsEarned+=amount;
            s.Lifetime.discoveredComponents=s.Lifetime.discoveredComponents.Union(new[]{ItemBalance.ComponentIds[component]}).ToArray();
        }
        public static void Item(GameState s,string type)=>s.Lifetime.itemTypes=s.Lifetime.itemTypes.Union(new[]{type}).ToArray();
        public static void Hardware(GameState s,int index,long amount,long before)
        {
            var l=s.Lifetime;string id=Balance.Hardware[index].Id;l.hardwareBought+=amount;if(index==0)l.calculatorsBought+=amount;
            l.hardwareClasses=l.hardwareClasses.Union(new[]{id}).ToArray();l.hardwareMasteryXp[index]+=amount;
            int edges=Balance.Hardware[index].Milestones.Count(m=>before<m.Threshold&&before+amount>=m.Threshold);
            l.milestones+=edges;if(edges>0)l.runMilestoneClasses=l.runMilestoneClasses.Union(new[]{id}).ToArray();
        }
        public static double Mastery(GameState s,int index)=>Math.Floor(Math.Sqrt(Math.Max(0,s.Lifetime.hardwareMasteryXp[index])/LifetimeBalance.MasteryDivisor));
        static double AddCapped(double old,ScientificNumber gain)=>Math.Min(LifetimeBalance.Maximum,old+gain.ToDouble(LifetimeBalance.Maximum));
        public static void Produced(GameState s,ScientificNumber credits,ScientificNumber data)
        {s.LifetimeDataExact=s.LifetimeDataExact.Add(data);s.Lifetime.regularCredits=AddCapped(s.Lifetime.regularCredits,credits);s.Lifetime.regularData=AddCapped(s.Lifetime.regularData,data);}
        public static void Validate(GameState s)
        {
            var l=s.Lifetime;if(l==null||!l.initialized||l.schema!=1||!ScientificNumber.Finite(l.since)||l.since<0||l.since>s.SavedAt)throw new FormatException("Invalid lifetime state");
            foreach(var v in new[]{l.calculatorsBought,l.hardwareBought,l.milestones,l.prestiges,l.intEarned,l.labSeconds,l.researchStarted,l.researchCompleted,l.trainingStarted,l.trainingCompleted,l.itemsCrafted,l.taps,l.overclocks,l.componentsEarned,l.dropsClaimed,l.itemsFused,l.forgeUpgrades,l.regularCredits,l.regularData,l.activeSeconds,l.analysesCompleted})if(!ScientificNumber.Finite(v)||v<0||v>LifetimeBalance.Maximum)throw new FormatException("Invalid lifetime counter");
            string[][] lists={l.hardwareClasses,l.itemTypes,l.discoveredComponents,l.runMilestoneClasses};string[][] catalogs={Balance.Hardware.Select(h=>h.Id).ToArray(),ItemBalance.Items.Select(i=>i.Id).ToArray(),ItemBalance.ComponentIds,Balance.Hardware.Select(h=>h.Id).ToArray()};
            for(int i=0;i<lists.Length;i++)if(lists[i]==null||lists[i].Distinct().Count()!=lists[i].Length||lists[i].Any(id=>!catalogs[i].Contains(id)))throw new FormatException("Invalid lifetime discoveries");
            if(l.hardwareMasteryXp==null||l.hardwareMasteryXp.Length!=Balance.Hardware.Length||l.hardwareMasteryXp.Any(v=>!ScientificNumber.Finite(v)||v<0||v>LifetimeBalance.Maximum))throw new FormatException("Invalid mastery history");
        }
    }
}
