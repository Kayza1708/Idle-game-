using System.Globalization;
using System.Linq;
using IdleIntelligence.Core;
namespace IdleIntelligence.Runtime
{
    // Correct a known legacy tooltip using current source-owned consumers, never replacement rules.
    public static class ResearchCopy
    {
        public static string Describe(GameState state,string id)
        {
            string language=state.Settings.language;
            if(id!="researchScheduling")return SettingsRules.Text(language,(Balance.Research[Game.ResearchIndex(id)].Project?"project-effect:":"research-effect:")+id);
            string template=NativeCopy.Text("Forschungsgeschwindigkeit ×{FACTOR}. Der Direktor wird über den INT-Knoten „{NODE}“ freigeschaltet.",language);
            string name=NativeCopy.Text(PrestigeBalance.Nodes.First(n=>n.Id=="F05").Name,language);
            return template.Replace("{FACTOR}",Balance.Research[Game.ResearchIndex(id)].Effect.ToString("F2",CultureInfo.GetCultureInfo(language))).Replace("{NODE}",name);
        }
    }
}
