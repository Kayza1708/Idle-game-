using System;
using System.Linq;
using IdleIntelligence.Core;
internal static class V3ProgressionContracts
{
    static void Check(bool condition,string detail){if(!condition)throw new Exception("V3 NODE CHECK: "+detail);}
    static GameState Standard()
    {
        var s=Game.NewV3(1000,"native-v3-node-coverage");
        s.Hardware[0]=100;s.Hardware[1]=25;s.Quality=2;s.Efficiency=2;
        s.Research[Game.ResearchIndex("dataGeneration")]=1;
        s.Research[Game.ResearchIndex("computeOptimization")]=1;
        s.Data=ScientificNumber.From(1000000);
        s.Credits=ScientificNumber.From(1000000);
        return s;
    }
    static void Rates(GameState s,string label)
    {
        Game.Validate(s);
        var rates=Game.ViewRates(s);
        Check(rates.Compute.CompareTo(ScientificNumber.Zero)>0,label+": nonzero hardware Compute");
        Check(rates.Income.CompareTo(ScientificNumber.Zero)>=0,label+": valid credit rate");
        Check(rates.Data.CompareTo(ScientificNumber.Zero)>=0,label+": valid data rate");
        Check(ScientificNumber.Finite(Game.WorkSpeed(s))&&Game.WorkSpeed(s)>0,label+": valid training speed");
        Check(ScientificNumber.Finite(Game.WorkSpeed(s,true))&&Game.WorkSpeed(s,true)>0,label+": valid research speed");
        Check(PrestigeRules.Weight(s).CompareTo(ScientificNumber.Zero)>0,label+": valid INT weight");
        Check(MetaRules.CreditFactor(s).CompareTo(ScientificNumber.Zero)>0,label+": valid axiom credit factor");
        Check(Workshop.ActiveSlots(s).Length==8,label+": native equipment layout");
    }
    public static void Run()
    {
        Check(PrestigeBalance.Nodes.Length==60,"exactly 60 prestige-node contracts");
        Check(MetaBalance.Axioms.Length==24,"exactly 24 axiom contracts");
        Check(MetaBalance.Models.Length==10,"exactly 10 native models");
        foreach(var node in PrestigeBalance.Nodes)
        {
            var s=Standard();s.Workshop.nodes=new[]{node.Id};
            Rates(s,"prestige "+node.Id);
        }
        foreach(var axiom in MetaBalance.Axioms)
        {
            var s=Standard();int index=Array.FindIndex(MetaBalance.Axioms,x=>x.Id==axiom.Id);
            s.Meta.axioms[index]=1;s.Meta.resets=1;s.ItemSystemV3.axiomDiscovered=true;
            Rates(s,"axiom "+axiom.Id);
        }
        var baseState=Standard();
        var h06=baseState.Copy();h06.Workshop.nodes=new[]{"H06"};
        Check(PrestigeV3.HardwareFirst(h06).CompareTo(PrestigeV3.HardwareFirst(baseState))>0,
            "H06 changes hardware compute path");
        var h08=baseState.Copy();h08.Workshop.nodes=new[]{"H08"};
        Check(PrestigeV3.CreditHardware(h08).CompareTo(PrestigeV3.CreditHardware(baseState))>0,
            "H08 changes real credits path");
        var i05=baseState.Copy();i05.Workshop.nodes=new[]{"I05"};
        Check(PrestigeV3.CreditRate(i05)>PrestigeV3.CreditRate(baseState),
            "I05 improves linear income per INT");
        var c01=baseState.Copy();
        int c01index=Array.FindIndex(MetaBalance.Axioms,x=>x.Id=="C01");
        c01.Meta.axioms[c01index]=1;
        Check(PrestigeV3.PassiveComponents(c01)>PrestigeV3.PassiveComponents(baseState),
            "C01 increases genuinely passive components");
        Console.WriteLine("UNITY V3 60 PRESTIGE AND 24 AXIOM RATE CONTRACTS OK");
    }
}
