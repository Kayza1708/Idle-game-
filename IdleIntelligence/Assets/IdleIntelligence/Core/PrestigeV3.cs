using System;
using System.Linq;
namespace IdleIntelligence.Core
{
    // Same V3 state and raw hardware stage as items. IDs and prices are still
    // owned by the existing node catalog; this file contains no tuning values.
    public static class PrestigeV3
    {
        static double C(string key)=>ItemV3Balance.Get("prestige."+key);
        public static double PassiveComponents(GameState s)
        {int level=MetaRules.Level(s,"C01");return level==0?1:ItemV3Balance.C01PassiveFactors[level-1];}
        public static ScientificNumber HardwareFirst(GameState s)
        {
            var value=ScientificNumber.From(PrestigeRules.Has(s,"H06")?C("hardware.H06"):1);
            if(PrestigeRules.Has(s,"H07"))value=value.Multiply(ScientificNumber.One.Add(ItemSystemV3.HardwareOwned(s).Divide(ScientificNumber.From(C("hardware.H07scale")))).Pow(C("hardware.H07exponent")));return value;
        }
        public static ScientificNumber UnmodifiedHardware(GameState s)
        {var plain=s.Copy();plain.ItemSystemV3=null;plain.Workshop.equipped=new string[ItemBalance.Slots.Length];return Enumerable.Range(0,s.Hardware.Length).Aggregate(ScientificNumber.Zero,(sum,i)=>sum.Add(Game.HardwareClass(plain,i)));}
        public static ScientificNumber HardwareSecond(GameState s)
        {
            var value=ScientificNumber.One;if(PrestigeRules.Has(s,"H09"))value=value.Times(C("hardware.H09")).Multiply(ScientificNumber.From(C("hardware.H09growth")).Pow(s.Hardware.Count(n=>n>=C("hardware.H09threshold"))));
            if(PrestigeRules.Has(s,"H10")){var raw=UnmodifiedHardware(s);value=value.Times(C("hardware.H10")).Multiply((raw.CompareTo(ScientificNumber.One)<0?ScientificNumber.One:raw).Pow(C("hardware.H10exponent")));}return value;
        }
        public static ScientificNumber CreditHardware(GameState s)
        {
            var value=ScientificNumber.One;if(PrestigeRules.Has(s,"H08"))value=value.Times(1+C("hardware.H08perClass")*s.Hardware.Count(n=>n>0));
            if(PrestigeRules.Has(s,"T07"))value=value.Multiply(ScientificNumber.One.Add(ItemSystemV3.TrainingLevels(s).Divide(ScientificNumber.From(C("training.T07scale")))).Pow(C("training.T07exponent")));return value;
        }
        public static ScientificNumber Weight(GameState s)
        {
            var value=ScientificNumber.One;if(PrestigeRules.Has(s,"I02"))value=value.Multiply(ScientificNumber.From(1+s.Prestige.milestones.Distinct().Count()/C("int.I02scale")).Pow(C("int.I02exponent")));
            if(PrestigeRules.Has(s,"I03"))value=value.Multiply(ScientificNumber.One.Add(ItemSystemV3.TrainingLevels(s).Divide(ScientificNumber.From(C("int.I03scale")))).Pow(C("int.I03exponent")));
            if(PrestigeRules.Has(s,"I04"))value=value.Multiply(ScientificNumber.One.Add(ItemSystemV3.ResearchLevels(s).Divide(ScientificNumber.From(C("int.I04scale")))).Pow(C("int.I04exponent")));
            if(PrestigeRules.Has(s,"I09"))value=value.Times(C("int.I09"));var archive=ItemSystemV3.Equipped(s).FirstOrDefault(i=>i.type=="insight-archive");if(archive!=null)value=value.Times(1+ItemV3Balance.Get("archive.weight")*ItemSystemV3.AbilityStrength(s,archive));return value;
        }
        public static double IntegrationBase(GameState s)=>ItemSystemV3.Enabled(s)?C(PrestigeRules.Has(s,"T10")?"training.integrationPerfect":"training.integrationBase"):PrestigeRules.V(PrestigeRules.Has(s,"T10")?"integrationPerfect":"integrationBase");
        public static int OccupiedRegularLabs(GameState s)
        {
            int regular=1+new[]{"F01","F04","F08"}.Count(id=>PrestigeRules.Has(s,id));
            return PrestigeAutomation.ResearchJobs(s).Count(job=>job.slot>=0&&job.slot<regular);
        }
        public static double ResearchActivity(GameState s)=>ItemSystemV3.Enabled(s)&&PrestigeRules.Has(s,"F08")?1+C("research.F08perLab")*OccupiedRegularLabs(s):1;
        public static ScientificNumber ResearchData(GameState s)=>ItemSystemV3.Enabled(s)&&PrestigeRules.Has(s,"F10")?ScientificNumber.One.Add(ItemSystemV3.ResearchLevels(s).Divide(ScientificNumber.From(C("research.F10scale")))).Pow(C("research.F10exponent")):ScientificNumber.One;
        public static double GainExponent(GameState s)=>PrestigeRules.V("intBaseExponent")+PrestigeRules.V("intAxiomExponent")*MetaRules.Level(s,"A01")+(PrestigeRules.Has(s,"I10")?C("int.I10gain"):0);
        public static double MaterialYield(GameState s)=>ItemSystemV3.Enabled(s)&&PrestigeRules.Has(s,"W08")?C("items.W08"):1;
        public static double CreditRate(GameState s)=>C("int.creditPerINT")+(PrestigeRules.Has(s,"I05")?C("int.I05"):0)+(PrestigeRules.Has(s,"I10")?C("int.I10credits"):0);
        public static ScientificNumber CreditFactor(GameState s)=>ScientificNumber.One.Add(s.Prestige.Cycle.Times(CreditRate(s)));
        public static bool DiscoveryEligible(GameState s)=>!ChallengeRules.Active(s)&&s.Prestige.Cycle.CompareTo(ScientificNumber.From(C("discovery.cycleINT")))>=0&&s.Prestige.known.Concat(s.Workshop.nodes).Where(id=>PrestigeBalance.Nodes.Any(node=>node.Id==id)).Distinct().Count()>=C("discovery.distinctNodes");
        public static void Discover(GameState s){if(ItemSystemV3.Enabled(s)&&!s.ItemSystemV3.axiomDiscovered&&DiscoveryEligible(s)){s.ItemSystemV3.axiomDiscovered=true;s.ItemSystemV3.axiomDiscoveryAt=s.SavedAt;}}
        public static ScientificNumber AxiomComputeExtra(GameState s)=>ItemSystemV3.Enabled(s)?ScientificNumber.From(C("axioms.A03")).Pow(MetaRules.Level(s,"A03")):ScientificNumber.One;
        public static ScientificNumber KnowledgeExtra(GameState s)=>ItemSystemV3.Enabled(s)?ScientificNumber.From(C("axioms.D01")).Pow(MetaRules.Level(s,"D01")):ScientificNumber.One;
    }
}
