using IdleIntelligence.Core;
namespace IdleIntelligence.Runtime {
 // Visibility consumes existing progression; it never grants or changes unlocks.
 public static class ProgressionVisibility {
  public static bool Prestige(GameState s)=>s.Prestige.resets>0||s.Meta.resets>0||!s.Prestige.Total.IsZero||PrestigeRules.Claim(s).CompareTo(ScientificNumber.One)>=0;
  public static bool Axioms(GameState s)=>s.Meta.resets>0||MetaRules.Reward(s).CompareTo(ScientificNumber.One)>=0;
 }
 public static class NavigationWords {
  public static string Copy(string key,string language){int l=System.Array.IndexOf(SettingsCatalog.Languages,language);if(l<0)l=0;string[] values=key=="learned"?new[]{"Learned · Details","Gelernt · Details","Aprendido · Detalles","Appris · Détails","Aprendido · Detalhes","Appreso · Dettagli","Poznano · Szczegóły"}:key=="offers"?new[]{"Offers & chests","Angebote & Truhen","Ofertas y cofres","Offres et coffres","Ofertas e baús","Offerte e forzieri","Oferty i skrzynie"}:key=="gems"?new[]{"Gems & Gumball","Gems & Gumball","Gemas y Gumball","Gemmes et Gumball","Gemas e Gumball","Gemme e Gumball","Klejnoty i Gumball"}:key=="bundles"?new[]{"Bundles & benefits","Pakete & Vorteile","Paquetes y ventajas","Packs et avantages","Pacotes e vantagens","Pacchetti e vantaggi","Pakiety i korzyści"}:key=="rewards"?new[]{"Rewards","Belohnungen","Recompensas","Récompenses","Recompensas","Ricompense","Nagrody"}:new[]{"Seasons","Seasons","Temporadas","Saisons","Temporadas","Stagioni","Sezony"};return values[l];}
  public static string Label(string route,string language){int l=System.Array.IndexOf(SettingsCatalog.Languages,language);if(l<0)l=0;string[] values=route=="hardware"?new[]{"Lab","Labor","Laboratorio","Laboratoire","Laboratório","Laboratorio","Laboratorium"}:route=="research"?new[]{"Research","Forschung","Investigación","Recherche","Pesquisa","Ricerca","Badania"}:route=="items"?new[]{"Forge","Schmiede","Forja","Forge","Forja","Fucina","Kuźnia"}:route=="prestige"?new[]{"Prestige","Prestige","Prestigio","Prestige","Prestígio","Prestigio","Prestiż"}:new[]{"Shop","Shop","Tienda","Boutique","Loja","Negozio","Sklep"};return values[l];}
 }
}
