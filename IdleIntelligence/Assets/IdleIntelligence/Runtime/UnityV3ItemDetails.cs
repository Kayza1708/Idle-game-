using System;
using System.Linq;
using System.Collections.Generic;
using IdleIntelligence.Core;
namespace IdleIntelligence.Runtime
{
    /// <summary>Live native Unity V3 item explanations; values are read from C# rules,
    /// not static web captions or the old 36-item generated localization atlas.</summary>
    public static class UnityV3ItemDetails
    {
        static readonly Dictionary<string,string[]> Combos=new Dictionary<string,string[]>{
            {"Rechenverbund",new[]{"quantum-chip","tensor-core","inference-router"}},
            {"Bootstrapping",new[]{"legacy-controller","diagnostic-adapter","memory-crystal"}},
            {"Lernspirale",new[]{"photonic-array","logic-seed","lab-drone"}},
            {"Destillierte Intelligenz",new[]{"neural-asic","distillation-module","darklab-resonator"}},
            {"Energieüberschuss",new[]{"burst-processor","cryocontroller","photonic-analyzer"}},
            {"Autonomes Labor",new[]{"lab-drone","protocol-controller","experiment-controller"}},
            {"Geschlossener Kreislauf",new[]{"manufacturing-controller","recycling-probe","diagnostic-adapter"}},
            {"Photonik-Architektur",new[]{"photonic-matrix","photonic-analyzer","cryocontroller"}},
            {"Erkenntnisschleife",new[]{"darklab-resonator","entropy-sink","model-echo-core"}},
            {"Axiomgedächtnis",new[]{"axiom-lattice","cycle-observatory","axiom-anchor"}},
            {"Wissenschaftliche Bibliothek",new[]{"blueprint-archive","data-prism","field-scanner"}},
            {"Industrielle Singularität",new[]{"fleet-coordinator","synthesis-coordinator","singularity-lens"}}
        };
        public static bool Handles(GameState state,ItemInstance item)
            =>state!=null&&item!=null&&UnityV3Catalog.IsAdded(item.type);
        static string Number(double value)=>value.ToString("0.##",System.Globalization.CultureInfo.InvariantCulture);
        static string English(string type)
        {
            switch(type){
                case "fleet-coordinator":return "Fleet Coordinator";
                case "gradient-buffer":return "Gradient Buffer";
                case "overdrive-capacitor":return "Overdrive Capacitor";
                case "synthesis-coordinator":return "Synthesis Coordinator";
                case "singularity-lens":return "Singularity Lens";
                case "axiom-anchor":return "Axiom Anchor";
                default:return type;
            }
        }
        static string Title(GameState s,ItemInstance item)
            =>s.Settings.language=="de"?Workshop.Definition(item).Name:English(item.type);
        public static string Primary(GameState s,ItemInstance item)
        {
            var v=s.ItemSystemV3;double p=ItemSystemV3.AbilityStrength(s,item);
            if(v==null)return Title(s,item);
            string value;
            switch(item.type){
                case "fleet-coordinator":value="Compute ×"+Number(ItemSystemV3.FleetFactor(s,item).ToDouble());break;
                case "gradient-buffer":value="Transfer "+Number(Math.Min(.4,.1*p)*100)+" %";break;
                case "overdrive-capacitor":value="+"+Number(2*p)+" charge";break;
                case "synthesis-coordinator":value="Synthesis ×"+Number(ItemSystemV3.SynthesisCoordinatorFactor(s,item));break;
                case "singularity-lens":value="Compute ×"+Number(ItemSystemV3.SingularityLensFactor(s,item,false).ToDouble());break;
                case "axiom-anchor":value="Compute / training ×"+Number(1+2*p);break;
                default:value="";
            }
            return "<b>"+Title(s,item)+"</b>\n<size=24><color=#92EEDC>"+value+"</color></size>";
        }
        public static string Text(GameState s,ItemInstance item,string requestedSlot=null)
        {
            bool de=s.Settings.language=="de";string L(string german,string english)=>de?german:english;
            var d=Workshop.Definition(item);double p=ItemSystemV3.AbilityStrength(s,item),q=ItemSystemV3.ExponentStrength(s,item);
            bool worn=ItemSystemV3.Has(s,item.type);
            var lines=new List<string>{"<b>"+Title(s,item)+"</b>",
                ItemBalance.Rarities[item.rarity]+" · Lv. "+item.level+" · +"+item.forge,
                L("Sockel: ","Slot: ")+d.Family,
                L("Status: ","Status: ")+(worn?L("ausgerüstet","equipped"):L("nicht ausgerüstet","unequipped")),
                L("Stärke P=","Strength P=")+Number(p)+" · Q="+Number(q)};
            switch(item.type)
            {
                case "fleet-coordinator":
                    int classes=s.Hardware.Count(n=>n>=100);
                    lines.Add(L("Computerverbund: ","Compute fleet: ")+"×"+Number(ItemSystemV3.FleetFactor(s,item).ToDouble()));
                    lines.Add(L("Hardwareklassen mit ≥100 Geräten: ","Hardware classes with ≥100 owned units: ")+classes);
                    lines.Add("2^P × (1+0.15×P×V)");break;
                case "gradient-buffer":
                    lines.Add(L("Regulär erarbeiteter Trainingsübertrag: ","Regular paid training work carry: ")+Number(Math.Min(.4,.1*p)*100)+" %");
                    lines.Add(L("Nächster Auftrag maximal 50 %; einmaliger Verbrauch.","Next paid job receives at most 50%; consumed once."));
                    lines.Add(L("Aktuelles Übertragsbudget: ","Stored work: ")+Number(s.ItemSystemV3?.gradientStoredWork??0));break;
                case "overdrive-capacitor":
                    lines.Add(L("Regulärer bezahlter Forschungsabschluss: ","Regular paid research completion: ")+"+"+Number(2*p)+" "+L("Ladungspunkte","charge"));
                    lines.Add(L("Bruchteil gespeichert: ","Fractional remainder: ")+Number(s.ItemSystemV3?.capacitorFraction??0));
                    lines.Add(L("Wiederholte Ereignisse erzeugen keine neue Ladung.","Repeated completion receipts cannot grant charge."));break;
                case "synthesis-coordinator":
                    lines.Add(L("Tatsächliche Synthesearbeit: ","Actual synthesis work speed: ")+"×"+Number(ItemSystemV3.SynthesisCoordinatorFactor(s,item)));
                    lines.Add(L("Eigene erzeugte Komponenten K: ","Self-produced components K: ")+(s.ItemSystemV3?.componentsProduced.ToString()??"0"));
                    lines.Add("2^P × (1+log10(1+K)/4)^(0.5×Q)");break;
                case "singularity-lens":
                    lines.Add(L("Roh-Compute-Effekt: ","Raw compute factor: ")+"×"+Number(ItemSystemV3.SingularityLensFactor(s,item,false).ToDouble()));
                    lines.Add(L("Erst ab drei echten Axiomzyklen.","Only after three actual axiom cycles."));
                    lines.Add("max(1,C)^(0.02×Q)");break;
                case "axiom-anchor":
                    lines.Add(L("Bei echtem Axiomreset: ","On a real axiom reset: ")+"×"+Number(1+2*p)+" / 30 min");
                    lines.Add(L("Laufender Resetvertrag: ","Current reset contract: ")+"×"+Number(ItemSystemV3.AxiomAnchorFactor(s)));
                    lines.Add(L("Verbleibende anrechenbare Sekunden: ","Remaining credited seconds: ")+Number(s.ItemSystemV3?.axiomAnchorSeconds??0));break;
            }
            foreach(var entry in Combos.Where(k=>k.Value.Contains(item.type))){
                int owned=entry.Value.Count(id=>ItemSystemV3.Has(s,id));
                var missing=entry.Value.Where(id=>!ItemSystemV3.Has(s,id)).Select(id=>ItemBalance.Items[Workshop.Index(id)].Name).ToArray();
                lines.Add("\n<b>"+entry.Key+"</b> · "+owned+"/3");
                lines.Add(missing.Length==0?L("Vollständiger Build aktiv","Full build active")
                    :L("Fehlt: ","Missing: ")+string.Join(", ",missing));
                bool pair=ItemSystemV3.Has(s,entry.Value[0])&&ItemSystemV3.Has(s,entry.Value[1]);
                if(pair)lines.Add(L("Zweierbonus aktiv","Pair bonus active"));
                else lines.Add(L("Zweierbonus noch gesperrt","Pair bonus still locked"));
            }
            string slot=Workshop.EquipmentSlot(s,item.id,requestedSlot);
            if(slot!=null&&!worn){
                var equipped=Workshop.Equip(s,item.id,slot);
                if(!ReferenceEquals(equipped,s)){
                    var before=Game.Compute(s);var after=Game.Compute(equipped);
                    if(before.CompareTo(after)!=0)lines.Add("\nCompute: "+NumberFormatting.Format(before,s.Settings.numberFormat,s.Settings.language)+" → "+NumberFormatting.Format(after,s.Settings.numberFormat,s.Settings.language));
                    var beforeSpeed=ItemSystemV3.SynthesisWorkFactor(s),afterSpeed=ItemSystemV3.SynthesisWorkFactor(equipped);
                    if(Math.Abs(beforeSpeed-afterSpeed)>1e-8)lines.Add(L("Synthesetempo: ","Synthesis speed: ")+"×"+Number(beforeSpeed)+" → ×"+Number(afterSpeed));
                }
            }
            return string.Join("\n",lines);
        }
    }
}
