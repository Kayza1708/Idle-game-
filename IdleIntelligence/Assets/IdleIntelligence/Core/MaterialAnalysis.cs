using System;
using System.Linq;
namespace IdleIntelligence.Core
{
    public static class MaterialAnalysis
    {
        public static bool Access(GameState s,int family)=>family==0||family==1&&Game.Level(s,"blueprints")>0||family==2&&Game.Level(s,"materialAnalysis")>=3||family==3&&Game.Level(s,"blueprintAnalysis")>=5||family==4&&Game.Level(s,"materialAnalysis")>=10;
        public static int Family(int component)=>Array.FindIndex(ItemBalance.MaterialFamilies,ids=>ids.Contains(ItemBalance.ComponentIds[component]));
        public static string Block(GameState s,int n)
        {
            if(n<0||n>=ItemBalance.Analyses.Length)return "Unbekannt";string type=ItemBalance.Analyses[n].Id.Split('-')[0];return s.Workshop.hasAnalysis?"Analyse läuft":type=="architecture"&&Game.Level(s,"blueprints")==0?"Forschung: Baupläne":type=="artifact"&&Game.Level(s,"blueprintAnalysis")<3?"Bauplananalyse Lv. 3":s.Data.CompareTo(ScientificNumber.From(ItemBalance.Analyses[n].Cost))<0?"Zu wenig Daten":null;
        }
        public static double Speed(GameState s)=>(1+Workshop.Bonus(s,"experiment"))*(1+ItemBalance.LabAutomationEffect*Game.Level(s,"labAutomation"))*MetaRules.Factor(s,"analysis")*(MetaRules.Secondary(s,"K05")?PrestigeRules.E("D06speed"):1);
        public static GameState Start(GameState state,int n)
        {
            var selected=MetaRules.Phase(state,2);if(Block(selected,n)!=null)return state;var s=selected.Copy();var w=s.Workshop;var d=ItemBalance.Analyses[n];string type=d.Id.Split('-')[0];int max=type=="hardware"?2:type=="architecture"?3:5;var weights=new double[w.components.Length];
            bool focus=w.focus>=0&&Access(s,w.focus);for(int c=0;c<weights.Length;c++){int family=Family(c);weights[c]=family<max&&Access(s,family)?(focus&&family==w.focus?ItemBalance.MaterialFocusWeight*(1+Workshop.Device(s,"focus")):1):0;}
            s.Data=s.Data.Subtract(ScientificNumber.From(d.Cost));w.nextId++;w.hasAnalysis=true;w.analysis=new AnalysisJob{rareGuarantee=PrestigeRules.Has(s,"W03"),definition=n,required=d.Work,units=d.Units*(1+ItemBalance.MaterialAnalysisEffect*Game.Level(s,"materialAnalysis"))*(focus?ItemBalance.MaterialFocusQuantity:1),blueprints=d.Fragments*(1+.1*Game.Level(s,"blueprintAnalysis")),weights=weights,order=ItemBalance.MaterialFamilies.Take(max).SelectMany(ids=>ids).Select(id=>Array.IndexOf(ItemBalance.ComponentIds,id)).Where(c=>weights[c]>0).ToArray(),combination=Workshop.Combination(s,"material-mapping")};w.revision++;return s;
        }
        static double Draw(WorkshopState w){w.materialRng=unchecked(w.materialRng*1664525u+1013904223u);return w.materialRng/4294967296d;}
        static long Split(double value,out double remainder)
        {double near=Math.Floor(value+.5);if(Math.Abs(value-near)<=2.220446049250313e-16*Math.Max(1,Math.Abs(value))*16)value=near;long whole=(long)Math.Floor(value);remainder=value-whole;return whole;}
        public static void Advance(GameState s,double seconds,bool finish=true)
        {
            var w=s.Workshop;if(!w.hasAnalysis)return;var job=w.analysis;double delta=Math.Min(job.required-job.done,Speed(s)*seconds);job.done+=delta;double quantity=MetaRules.Secondary(s,"K10")?PrestigeRules.E("D06quantity"):1;job.quantityIntegral+=delta*quantity;job.photonicIntegral+=delta*quantity*(1+Workshop.Device(s,"photonicYield"));job.quantumIntegral+=delta*quantity*(1+Workshop.Device(s,"quantumYield"));if(!finish||job.done+1e-7<job.required)return;
            var definition=ItemBalance.Analyses[job.definition];long count=Split(job.units+w.componentRemainder,out w.componentRemainder);var found=new long[w.components.Length];double total=job.weights.Sum();
            for(long i=0;i<count;i++){double roll=Draw(w);int picked=job.order.Last();foreach(int c in job.order){roll-=job.weights[c]/total;if(roll<=0){picked=c;break;}}found[picked]++;}
            if(job.rareGuarantee&&!Enumerable.Range(0,found.Length).Any(c=>found[c]>0&&ItemBalance.RareComponents[c]))found[5]++;
            for(int c=0;c<found.Length;c++){int family=Family(c);double v=found[c]*job.combination*(family==2?job.photonicIntegral/job.required:family==4?job.quantumIntegral/job.required:job.quantityIntegral/job.required)+w.analysisRemainders[c];long amount=Split(v,out w.analysisRemainders[c]);w.components[c]+=amount;}
            w.fragments+=Split(job.blueprints+w.blueprintRemainder,out w.blueprintRemainder);double research=definition.Id.StartsWith("architecture")?definition.Fragments:0;w.researchFragments+=Split(research+w.researchRemainder,out w.researchRemainder);
            if(definition.ItemChance>0&&Draw(w)<definition.ItemChance){var candidates=ItemBalance.Items.Where(i=>i.Id!="impulse-relay"&&i.Id!="insight-archive").ToArray();var item=new ItemInstance{id="item-"+w.nextId++,type=candidates[(int)Math.Floor(Draw(w)*candidates.Length)].Id};w.inventory=w.inventory.Concat(new[]{item}).ToArray();}
            w.hasAnalysis=false;w.analysis=null;w.revision++;
        }
    }
}
