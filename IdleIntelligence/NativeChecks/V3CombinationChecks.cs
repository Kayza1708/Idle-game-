using System;
using System.Linq;
using IdleIntelligence.Core;
internal static class V3CombinationChecks
{
    static void Check(bool ok,string why){if(!ok)throw new Exception("V3 COMBO CONTRACT: "+why);}
    static bool Close(double actual,double expected,double epsilon=0.00001)
        =>Math.Abs(actual-expected)<=epsilon*Math.Max(1,Math.Abs(expected));
    static GameState Equipped(params string[] ids)
    {
        var s=Game.NewV3(1000,"combination-references");
        s.Workshop.nodes=new[]{"W01","W02","W06"};
        s.Workshop.activeModel="K10";
        s.Meta.models[Array.FindIndex(MetaBalance.Models,m=>m.Id=="K10")]=0;
        s.Hardware[0]=250;s.Hardware[1]=250;
        s.Meta.resets=3;
        s.Industry.families=Enumerable.Repeat(true,5).ToArray();
        s.Workshop.inventory=ids.Select(id=>new ItemInstance{id="test-"+id,type=id,rarity=0,level=1}).ToArray();
        foreach(var item in s.Workshop.inventory){
            string family=Workshop.Definition(item).Family;
            int slot=Array.IndexOf(ItemBalance.Slots,family);
            if(!string.IsNullOrEmpty(s.Workshop.equipped[slot]))
                slot=Array.IndexOf(ItemBalance.Slots,family+"Aux");
            if(slot<0||!string.IsNullOrEmpty(s.Workshop.equipped[slot]))
                slot=Array.IndexOf(ItemBalance.Slots,"universal1");
            if(slot<0||!string.IsNullOrEmpty(s.Workshop.equipped[slot]))
                throw new InvalidOperationException("No legal available Unity slot for "+item.type);
            s.Workshop.equipped[slot]=item.id;
        }
        Game.Validate(s);
        Check(ItemSystemV3.Equipped(s).Count()==ids.Length,"all real slot-qualified items equipped");
        return s;
    }
    static double Compute(GameState s)=>ItemSystemV3.ComputeFactor(s).ToDouble();
    static double Credits(GameState s)=>ItemSystemV3.CreditFactor(s).ToDouble();
    public static void Run()
    {
        // 1. Compute network: fixed pair bonus ×5, full trio adds quantum exponent.
        var q=Equipped("quantum-chip");var tensor=Equipped("tensor-core");
        var pair=Equipped("quantum-chip","tensor-core");
        Check(Close(Compute(pair)/(Compute(q)*Compute(tensor)),5),"Rechenverbund: compute pair ×5");
        Check(Compute(Equipped("quantum-chip","tensor-core","inference-router"))>Compute(pair),
            "Rechenverbund: quantum exponent from full trio");

        // 2. Early hardware packages: ×1.5 for the paid legacy/diagnostic pair.
        var diag=Equipped("diagnostic-adapter");
        var boot=Equipped("legacy-controller","diagnostic-adapter");
        Check(Close(ItemSystemV3.HardwarePackageFactor(boot)/
            ItemSystemV3.HardwarePackageFactor(diag),1.5),"Bootstrapping: milestone packages ×1.5");

        // 3. Learning spiral: both regular training and research ×1.5.
        var logic=Equipped("logic-seed");
        var learning=Equipped("photonic-array","logic-seed");
        Check(Close(ItemSystemV3.WorkFactor(learning,false)/
            ItemSystemV3.WorkFactor(logic,false),1.5),"Lernspirale: training ×1.5");
        Check(Close(ItemSystemV3.WorkFactor(learning,true)/
            ItemSystemV3.WorkFactor(logic,true),1.5),"Lernspirale: research ×1.5");

        // 4. Distillation: the pair grants ×5 credits (separate item bases retained).
        var neural=Equipped("neural-asic");
        var distill=Equipped("distillation-module");
        var distilled=Equipped("neural-asic","distillation-module");
        Check(Close(Credits(distilled)/(Credits(neural)*Credits(distill)),5),
            "Destillierte Intelligenz: credit pair ×5");

        // 5. Energy overflow: longer burst, ×3 credit, ×5 data with third item.
        var burst=Equipped("burst-processor");var energy=Equipped("burst-processor","cryocontroller");
        ItemSystemV3.StartOverdrive(burst,burst.SavedAt,15);
        ItemSystemV3.StartOverdrive(energy,energy.SavedAt,15);
        Check(Close((energy.ItemSystemV3.overdrive.burstUntil-energy.SavedAt)/1000,5),
            "Energieüberschuss: 5s burst");
        Check(Close(ItemSystemV3.BurstFactor(energy)/ItemSystemV3.BurstFactor(burst),3),
            "Energieüberschuss: credit burst ×3");
        var energyTrio=Equipped("burst-processor","cryocontroller","photonic-analyzer");
        ItemSystemV3.StartOverdrive(energyTrio,energyTrio.SavedAt,15);
        Check(Close(ItemSystemV3.BurstFactor(energyTrio,true),5),"Energieüberschuss: burst data ×5");

        // 6. Autonomous lab: paid automatic job starts at +5%, every third at +15%.
        var autonomous=Equipped("lab-drone","protocol-controller");
        var quote=ItemSystemV3.ResearchStartQuote(autonomous,"dataGeneration","automatic");
        Check(Close(quote.startingFraction,.05),"Autonomes Labor: +5% automatic paid start");
        var autonomousTrio=Equipped("lab-drone","protocol-controller","experiment-controller");
        autonomousTrio.ItemSystemV3.automaticResearchStarts=2;
        var third=ItemSystemV3.ResearchStartQuote(autonomousTrio,"dataGeneration","automatic");
        Check(Close(third.startingFraction,.15),"Autonomes Labor: third +10% stacking once");

        // 7. Recycling circuit: ×1.25 extra fragment progress, ×1.2 analysis materials.
        var probe=Equipped("recycling-probe");
        var recycling=Equipped("recycling-probe","manufacturing-controller");
        var target=new ItemInstance{id="rare-for-recycle",type="quantum-chip",rarity:2,level:1};
        var raw=ItemSystemV3.SalvageFragments(probe,target);
        var improved=ItemSystemV3.SalvageFragments(recycling,target);
        Check(raw.progress>0&&Close(improved.progress/raw.progress,1.25),
            "Geschlossener Kreislauf: fragments ×1.25");
        var recyclingTrio=Equipped("recycling-probe","manufacturing-controller","diagnostic-adapter");
        Check(Close(ItemSystemV3.AnalysisCombinationYield(recyclingTrio),1.2),
            "Geschlossener Kreislauf: paid analysis ×1.2");

        // 8. Photonic architecture: one pair yields ×2 when overdrive is active.
        var analyzer=Equipped("photonic-analyzer");
        var photons=Equipped("photonic-matrix","photonic-analyzer");
        analyzer.ActiveUntil=analyzer.SavedAt+1000;photons.ActiveUntil=photons.SavedAt+1000;
        Check(Close(ItemSystemV3.MaterialFamilyYield(photons,2)/
            ItemSystemV3.MaterialFamilyYield(analyzer,2),2),
            "Photonische Architektur: overdrive photonic finds ×2");

        // 9. Insight loop: pair grants at least the fixed ×3 insight bonus.
        var resonator=Equipped("darklab-resonator");
        var insight=Equipped("darklab-resonator","entropy-sink");
        Check(ItemSystemV3.KnowledgeFactor(insight).ToDouble()>=
            ItemSystemV3.KnowledgeFactor(resonator).ToDouble()*3*(1-1e-8),
            "Erkenntnisschleife: insight factor ×3");

        // 10. Axiom memory: ×2 reward; separate reset contract covered by core smoke.
        var lattice=Equipped("axiom-lattice");
        var memory=Equipped("axiom-lattice","cycle-observatory");
        Check(Close(ItemSystemV3.AxiomFactor(memory).ToDouble()/
            ItemSystemV3.AxiomFactor(lattice).ToDouble(),2),
            "Axiomgedächtnis: axiom reward ×2");

        // 11. Scientific library: blueprint+prism accelerates paid research by 50%.
        var archive=Equipped("blueprint-archive");
        var library=Equipped("blueprint-archive","data-prism");
        Check(ItemSystemV3.WorkFactor(library,true)>
            ItemSystemV3.WorkFactor(archive,true)*1.5,
            "Wissenschaftliche Bibliothek: research ×1.5 plus research-slot base");

        // 12. Industrial singularity: pair is ×1.5 synthesis yield; third boosts exponent.
        var industrial=Equipped("fleet-coordinator","synthesis-coordinator");
        Check(Close(ItemSystemV3.SynthesisYield(industrial),1.5),
            "Industrielle Singularität: synthesis ×1.5");
        var full=Equipped("fleet-coordinator","synthesis-coordinator","singularity-lens");
        var lens=full.Workshop.inventory.Single(i=>i.type=="singularity-lens");
        Check(ItemSystemV3.SingularityLensFactor(full,lens,true).CompareTo(
            ItemSystemV3.SingularityLensFactor(full,lens,false))>0,
            "Industrielle Singularität: third item ×1.5 lens exponent");
        Console.WriteLine("UNITY V3 TWELVE COMBINATION CONTRACT CHECKS OK");
    }
}
