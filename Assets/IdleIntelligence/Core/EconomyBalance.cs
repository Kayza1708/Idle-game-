using System;
using System.Collections.Generic;
using System.Linq;
namespace IdleIntelligence.Core
{
    /// <summary>Native V3 tuning authority. Historical generated tables remain frozen for legacy saves.</summary>
    public static class EconomyBalance
    {
        public const double ResearchBaseFactor = 4;
        public const double ResearchLevelGrowth = 1.15;
        public const double CraftDataFactor = 6;
        public const double ItemUpgradeDataFactor = 4;
        public const int StarterRecipeCount = 3;

        // Native recipe inputs, before the five paid mastery discounts. Frozen legacy tables stay untouched.
        public enum RecipeTier { Mid, Advanced, Campus, Frontier, Lab, Axiom, Apex }
        static readonly double[] RecipeFactors = { 6, 10, 20, 35, 50, 80, 100 };
        static readonly double[] RecipeMastery = { 100, 95, 90, 85, 80 };
        sealed class RecipePlan
        {
            public RecipeTier Tier;
            public double[] Inputs;
        }
        static RecipePlan Plan(RecipeTier tier,params object[] pairs)
        {
            var inputs=new double[ItemBalance.ComponentIds.Length];
            for(int n=0;n<pairs.Length;n+=2){int c=Array.IndexOf(ItemBalance.ComponentIds,(string)pairs[n]);if(c<0||inputs[c]>0)throw new InvalidOperationException("Invalid balanced recipe component");inputs[c]=Convert.ToDouble(pairs[n+1]);}
            if(inputs.Count(v=>v>0)>5)throw new InvalidOperationException("At most five recipe components");
            return new RecipePlan{Tier=tier,Inputs=inputs};
        }
        static readonly Dictionary<string,RecipePlan> Recipes=new Dictionary<string,RecipePlan>{
            {"insight-archive",Plan(RecipeTier.Mid,"circuits",100,"siliconWafers",20,"neuralCrystals",5,"goldContacts",12,"superconductors",3)},
            {"neural-asic",Plan(RecipeTier.Mid,"circuits",40,"siliconWafers",24,"titaniumBolts",10,"graphene",8,"neuralCrystals",2)},
            {"photonic-array",Plan(RecipeTier.Mid,"circuits",20,"copperCoils",8,"siliconWafers",12,"photonicLenses",6,"opticalFibers",4)},
            {"logic-seed",Plan(RecipeTier.Mid,"circuits",12,"siliconWafers",10,"graphene",4,"nanotubes",2,"neuralCrystals",1)},
            {"data-prism",Plan(RecipeTier.Mid,"circuits",20,"siliconWafers",14,"photonicLenses",10,"graphene",12,"superconductors",2)},
            {"burst-processor",Plan(RecipeTier.Mid,"circuits",20,"copperCoils",8,"ceramicCapacitors",8,"ferriteCores",6)},
            {"legacy-controller",Plan(RecipeTier.Mid,"circuits",20,"copperCoils",8,"ferriteCores",8,"ceramicCapacitors",6)},
            {"sparse-decoder",Plan(RecipeTier.Mid,"circuits",20,"copperCoils",6,"siliconWafers",8,"ceramicSubstrates",4)},
            {"curriculum-module",Plan(RecipeTier.Mid,"circuits",20,"copperCoils",6,"siliconWafers",8,"ceramicSubstrates",4)},
            {"long-term-memory",Plan(RecipeTier.Mid,"circuits",20,"copperCoils",6,"siliconWafers",8,"goldContacts",4)},
            {"diagnostic-adapter",Plan(RecipeTier.Mid,"circuits",20,"copperCoils",6,"siliconWafers",8,"goldContacts",4)},
            {"inference-router",Plan(RecipeTier.Advanced,"circuits",40,"copperCoils",10,"siliconWafers",14,"goldContacts",7,"ceramicSubstrates",8)},
            {"manufacturing-controller",Plan(RecipeTier.Advanced,"circuits",40,"copperCoils",10,"titaniumBolts",14,"thermalInterface",7,"ceramicSubstrates",8)},
            {"experiment-controller",Plan(RecipeTier.Advanced,"circuits",40,"copperCoils",10,"siliconWafers",14,"opticalFibers",7,"photonicLenses",8)},
            {"precision-scanner",Plan(RecipeTier.Advanced,"circuits",40,"copperCoils",10,"photonicLenses",14,"opticalFibers",7,"goldContacts",8)},
            {"recycling-probe",Plan(RecipeTier.Advanced,"circuits",40,"copperCoils",10,"graphene",14,"photonicCircuits",7,"thermalInterface",8)},
            {"protocol-controller",Plan(RecipeTier.Advanced,"circuits",40,"copperCoils",10,"goldContacts",14,"ceramicSubstrates",7,"siliconWafers",8)},
            {"photonic-matrix",Plan(RecipeTier.Campus,"circuits",60,"copperCoils",14,"photonicLenses",20,"photonicCircuits",10,"opticalFibers",16)},
            {"distillation-module",Plan(RecipeTier.Campus,"circuits",60,"copperCoils",14,"graphene",20,"opticalFibers",10,"photonicCircuits",16)},
            {"blueprint-archive",Plan(RecipeTier.Campus,"circuits",60,"copperCoils",14,"neuralCrystals",20,"spintronicDevices",10,"siliconWafers",16)},
            {"photonic-analyzer",Plan(RecipeTier.Campus,"circuits",60,"copperCoils",14,"photonicLenses",20,"photonicCircuits",10,"opticalFibers",16)},
            {"quantum-coupler",Plan(RecipeTier.Frontier,"circuits",80,"copperCoils",18,"quantumCores",26,"cryogenicResonators",13,"superconductors",24)},
            {"cryocontroller",Plan(RecipeTier.Frontier,"circuits",80,"copperCoils",18,"quantumCores",26,"cryogenicResonators",13,"superconductors",24)},
            {"quantum-diagnostic-module",Plan(RecipeTier.Frontier,"circuits",80,"copperCoils",18,"quantumCores",26,"cryogenicResonators",13,"neuralCrystals",24)},
            {"darklab-resonator",Plan(RecipeTier.Lab,"photonicLenses",10,"superconductors",8,"neuralCrystals",12,"quantumCores",4,"photonicCircuits",20)},
            {"model-echo-core",Plan(RecipeTier.Lab,"graphene",30,"neuralCrystals",16,"ceramicSubstrates",20,"photonicCircuits",18,"nanotubes",24)},
            {"entropy-sink",Plan(RecipeTier.Lab,"graphene",40,"superconductors",30,"thermalInterface",60,"photonicCircuits",20,"ceramicCapacitors",80)},
            {"mnemonic-anchor",Plan(RecipeTier.Lab,"nanotubes",40,"neuralCrystals",24,"ceramicCapacitors",60,"diamondSubstrates",16,"spintronicDevices",30)},
            {"axiom-lattice",Plan(RecipeTier.Axiom,"superconductors",24,"quantumCores",12,"diamondSubstrates",16,"spintronicDevices",20,"neuralCrystals",30)},
            {"cycle-observatory",Plan(RecipeTier.Axiom,"photonicLenses",30,"quantumCores",16,"goldContacts",60,"cryogenicResonators",24,"photonicCircuits",40)},
            {"fleet-coordinator",Plan(RecipeTier.Campus,"circuits",75,"copperCoils",18,"photonicLenses",25,"photonicCircuits",13,"opticalFibers",20)},
            {"gradient-buffer",Plan(RecipeTier.Mid,"circuits",25,"copperCoils",8,"siliconWafers",10,"ceramicSubstrates",5)},
            {"overdrive-capacitor",Plan(RecipeTier.Mid,"circuits",25,"copperCoils",8,"siliconWafers",10,"goldContacts",5)},
            {"synthesis-coordinator",Plan(RecipeTier.Advanced,"circuits",50,"copperCoils",13,"goldContacts",18,"ceramicSubstrates",9,"thermalInterface",15)},
            {"singularity-lens",Plan(RecipeTier.Apex,"quantumCores",24,"diamondSubstrates",32,"spintronicDevices",40,"superconductors",48,"cryogenicResonators",28)},
            {"axiom-anchor",Plan(RecipeTier.Axiom,"neuralCrystals",30,"nanotubes",50,"ceramicCapacitors",75,"diamondSubstrates",20,"spintronicDevices",24)},
        };
        public static double[] CraftComponents(bool nativeV3,ItemDefinition definition,int mastery)
        {
            if(!nativeV3||!Recipes.TryGetValue(definition.Id,out var plan))return (double[])definition.Components[mastery].Clone();
            double factor=RecipeFactors[(int)plan.Tier];
            // Integer percentages avoid ceil(480.0000000000001) charging an extra part.
            return plan.Inputs.Select(amount=>Math.Ceiling(amount*factor*RecipeMastery[mastery]/100)).ToArray();
        }

        // Pure quote helpers: no production-dependent prices or state mutation.
        public static ScientificNumber ResearchFactor(bool nativeV3, int level) =>
            nativeV3 ? ScientificNumber.From(ResearchBaseFactor).Multiply(ScientificNumber.From(ResearchLevelGrowth).Pow(Math.Max(0, level))) : ScientificNumber.One;
        public static double CraftData(bool nativeV3, double original, int starter) =>
            Math.Ceiling(original * (nativeV3 && !(starter >= 0 && starter < StarterRecipeCount) ? CraftDataFactor : 1));
        public static double UpgradeFactor(bool nativeV3) => nativeV3 ? ItemUpgradeDataFactor : 1;
    }
}
