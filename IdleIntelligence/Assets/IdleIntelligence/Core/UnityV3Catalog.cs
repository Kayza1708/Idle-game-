using System;
using System.Linq;
using System.Collections.Generic;
namespace IdleIntelligence.Core
{
    /// <summary>
    /// Native V3 extension of the 36 shipped items. This table is authored in
    /// Unity/C# only: its IDs, prices and access gates do not depend on web code.
    /// The original first 36 ordinals remain stable for every old save.
    /// </summary>
    public static class UnityV3Catalog
    {
        public const int OldItemCount=36;
        public static readonly string[] AddedIds={
            "fleet-coordinator","gradient-buffer","overdrive-capacitor",
            "synthesis-coordinator","singularity-lens","axiom-anchor"
        };
        // Native-only product names: en, de, es, fr, pt, it, pl.
        static readonly string[] Languages={"en","de","es","fr","pt","it","pl"};
        static readonly Dictionary<string,string[]> Names=new Dictionary<string,string[]>{
            {"fleet-coordinator",new[]{"Fleet Coordinator","Flottenkoordinator","Coordinador de flota","Coordinateur de flotte","Coordenador de frota","Coordinatore di flotta","Koordynator floty"}},
            {"gradient-buffer",new[]{"Gradient Buffer","Gradientenspeicher","Búfer de gradiente","Tampon de gradient","Buffer de gradiente","Buffer del gradiente","Bufor gradientu"}},
            {"overdrive-capacitor",new[]{"Overdrive Capacitor","Overdrive-Kondensator","Condensador de sobrecarga","Condensateur d'overdrive","Capacitor de sobrecarga","Condensatore overdrive","Kondensator nadbiegu"}},
            {"synthesis-coordinator",new[]{"Synthesis Coordinator","Synthesekoordinator","Coordinador de síntesis","Coordinateur de synthèse","Coordenador de síntese","Coordinatore di sintesi","Koordynator syntezy"}},
            {"singularity-lens",new[]{"Singularity Lens","Singularitätslinse","Lente de singularidad","Lentille de singularité","Lente de singularidade","Lente della singolarità","Soczewka osobliwości"}},
            {"axiom-anchor",new[]{"Axiom Anchor","Axiomanker","Ancla axiomática","Ancre d'axiome","Âncora axiomática","Ancora degli assiomi","Kotwica aksjomatu"}}
        };
        public static string LocalizedName(string id,string language)
        {
            if(!Names.TryGetValue(id,out var translations))return id;
            int index=Array.IndexOf(Languages,language);
            return translations[index<0?0:index];
        }
        static int Component(string id)
        {
            int index=Array.IndexOf(ItemBalance.ComponentIds,id);
            if(index<0)throw new InvalidOperationException("Unknown Unity component: "+id);
            return index;
        }
        static double[] Inputs(params object[] pairs)
        {
            var result=new double[ItemBalance.ComponentIds.Length];
            for(int i=0;i<pairs.Length;i+=2)result[Component((string)pairs[i])]=Convert.ToDouble(pairs[i+1]);
            return result;
        }
        static ItemDefinition Build(string id,string name,string family,string role,
            string access,string area,int fragments,double data,int basic,int rare,
            int bus,int lattice,params object[] inputs)
        {
            var costs=Inputs(inputs);
            // Fixed costs across each paid mastery tier; no live-price recomputation.
            var mastery=new[]{1d,.95d,.90d,.85d,.80d};
            var variants=mastery.Select(v=>costs.Select(n=>Math.Ceiling(n*v)).ToArray()).ToArray();
            var profile=new[]{new[]{role},new[]{role},new[]{role,"compute"},
                new[]{role,"compute"},new[]{role,"compute","research"},
                new[]{role,"compute","research"}};
            return new ItemDefinition(id,name,family,-1,fragments,role,0,access,area,
                profile,new[]{1d,.65d,.4d},variants,new[]{(double)bus,(double)lattice},
                data,basic,rare);
        }
        public static ItemDefinition[] Extend(ItemDefinition[] original)
        {
            if(original==null||original.Length!=OldItemCount)
                throw new InvalidOperationException("V3 requires the exact 36-item Unity base catalog.");
            var additional=new[]{
                Build("fleet-coordinator","Flottenkoordinator","processor","fleet","campus","architecture",
                    10,7500,Component("photonicLenses"),Component("neuralCrystals"),2,2,
                    "circuits",75,"copperCoils",18,"photonicLenses",25,"photonicCircuits",13),
                Build("gradient-buffer","Gradientenspeicher","core","gradient","training-auto","model",
                    5,1250,Component("siliconWafers"),Component("superconductors"),0,0,
                    "circuits",25,"copperCoils",8,"siliconWafers",10,"ceramicSubstrates",5),
                Build("overdrive-capacitor","Overdrive-Kondensator","core","capacitor","overdrive-auto","automation",
                    5,1250,Component("siliconWafers"),Component("superconductors"),0,0,
                    "circuits",25,"copperCoils",8,"siliconWafers",10,"goldContacts",5),
                Build("synthesis-coordinator","Synthesekoordinator","research","synthesis","synthesis","materials",
                    8,3000,Component("siliconWafers"),Component("superconductors"),2,2,
                    "circuits",50,"copperCoils",13,"goldContacts",18,"ceramicSubstrates",9),
                Build("singularity-lens","Singularitätslinse","processor","lens","axiom-three","architecture",
                    160,24000000,Component("quantumCores"),Component("diamondSubstrates"),4,4,
                    "quantumCores",24,"diamondSubstrates",32,"spintronicDevices",40,"superconductors",48),
                Build("axiom-anchor","Axiomanker","core","axiomAnchor","axiom-one","model",
                    90,12500000,Component("neuralCrystals"),Component("quantumCores"),3,3,
                    "neuralCrystals",30,"nanotubes",50,"ceramicCapacitors",75,"diamondSubstrates",20),
            };
            if(original.Select(i=>i.Id).Intersect(AddedIds).Any()||
               additional.Select(i=>i.Id).Distinct().Count()!=AddedIds.Length)
                throw new InvalidOperationException("Duplicate item ID in Unity V3.");
            return original.Concat(additional).ToArray();
        }
        public static double[] ExtendRecipeData(double[] previous)
        {
            if(previous==null||previous.Length!=OldItemCount)
                throw new InvalidOperationException("Unexpected native recipe base length.");
            return previous.Concat(new[]{7500d,1250d,1250d,3000d,24000000d,12500000d}).ToArray();
        }
        public static bool IsAdded(string id)=>AddedIds.Contains(id);
        public static bool Unlocked(GameState s,string id)
        {
            if(!IsAdded(id))return true;
            if(!ItemSystemV3.Enabled(s))return false;
            switch(id)
            {
                case "fleet-coordinator":return s.Industry.discovered.Length>7&&s.Industry.discovered[7];
                case "gradient-buffer":return PrestigeRules.Has(s,"T06");
                case "overdrive-capacitor":return PrestigeRules.Has(s,"F03");
                case "synthesis-coordinator":return Game.Level(s,"blueprints")>0&&
                    s.Industry.families.Any(x=>x);
                case "singularity-lens":return s.Meta.resets>=3;
                case "axiom-anchor":return s.Meta.resets>=1;
                default:return false;
            }
        }
    }
}
