using IdleIntelligence.Runtime;
using System.Linq;
using NUnit.Framework;
namespace IdleIntelligence.Tests
{
    public sealed class LocalizationCompletionTests
    {
        [TestCase("en","Previous tier required","Season level required")]
        [TestCase("es","Se requiere el nivel anterior","Falta nivel de temporada")]
        [TestCase("fr","Palier précédent requis","Niveau de saison requis")]
        [TestCase("pt","Nível anterior necessário","Nível da temporada necessário")]
        [TestCase("it","Richiesto il livello precedente","Livello stagione richiesto")]
        [TestCase("pl","Wymagany poprzedni poziom","Wymagany poziom sezonu")]
        public void AuditedCompositeCostAndSeasonLabelsUseActualSelectedLanguage(string lang,string tier,string season)
        {
            Assert.That(UiLocalizedText.Translate("1500 Gems · Vorherige Stufe erforderlich",lang),Does.Contain(tier));
            Assert.That(UiLocalizedText.Translate("30 Gems · Season-Level fehlt",lang),Does.Contain(season));
            Assert.That(UiLocalizedText.Translate("Dein erstes Netzwerk",lang),Is.Not.EqualTo("Dein erstes Netzwerk"));
            Assert.That(UiLocalizedText.Translate("K01 · Kommerzmodell",lang),Does.Not.Contain("Kommerzmodell"));
        }
        [Test] public void EnglishFallbackStillResolvesNativeTranslations()
        {
            Assert.That(UiLocalizedText.Translate("No taps, drops or manual overclocks; paid automatic starter only.\nEach prestige at least 1 INT.\nOwn family bonus disabled; Axiom locked.","fr"),Does.StartWith("Aucun tap"));
        }
        [Test] public void EveryMiraBodyHasDistinctTranslationsBeforePersonalization()
        {
            foreach(var dialogue in IdleIntelligence.Core.NarrativeCatalog.Dialogues)
            foreach(string lang in new[]{"es","fr","pt","it","pl"})
            {
                string text=IdleIntelligence.Core.NativeCopy.Text(dialogue.Texts[0],lang);
                Assert.That(text,Is.Not.Empty,dialogue.Id+" "+lang);
                Assert.That(text,Is.Not.EqualTo(dialogue.Texts[0]),dialogue.Id+" "+lang+" may not silently use the English fallback");
                if(dialogue.Texts[0].Contains("{AI}"))Assert.That(text,Does.Contain("{AI}"),"Personal name is inserted after template localization");
            }
        }
        [Test] public void EveryNodeTitleHasNativePresentationCopyInAllOtherLanguages()
        {
            foreach(var node in IdleIntelligence.Core.PrestigeBalance.Nodes)
            foreach(string language in new[]{"en","es","fr","pt","it","pl"})
                Assert.That(IdleIntelligence.Core.NativeUiCatalog.Copies.Any(copy=>copy.Values[1]==node.Name&&copy.Values[System.Array.IndexOf(IdleIntelligence.Core.SettingsCatalog.Languages,language)].Length>0),Is.True,node.Id+" "+language);
            foreach(var node in IdleIntelligence.Core.MetaBalance.Axioms)
            foreach(string language in new[]{"en","es","fr","pt","it","pl"})
                Assert.That(IdleIntelligence.Core.NativeUiCatalog.Copies.Any(copy=>copy.Values[1]==node.Name&&copy.Values[System.Array.IndexOf(IdleIntelligence.Core.SettingsCatalog.Languages,language)].Length>0),Is.True,node.Id+" "+language);
        }
        [Test] public void TranslatedHardwareTrainingResearchAndWorkshopDescriptionsRetainNumericConstants()
        {
            string[] Numbers(string text)=>System.Text.RegularExpressions.Regex.Matches(text,@"(?<![A-Za-z0-9])[0-9]+(?:[.,][0-9]+)?").Cast<System.Text.RegularExpressions.Match>().Select(m=>decimal.Parse(m.Value.Replace(',','.'),System.Globalization.CultureInfo.InvariantCulture).ToString("G29",System.Globalization.CultureInfo.InvariantCulture)).OrderBy(v=>v).ToArray();
            foreach(var node in IdleIntelligence.Core.PrestigeBalance.Nodes.Where(n=>n.Branch<4))
            foreach(string language in new[]{"en","es","fr","pt","it","pl"})
            {
                string text=IdleIntelligence.Core.NativeCopy.Text(node.Description,language);
                Assert.That(text,Is.Not.EqualTo(node.Description),node.Id+" "+language);
                CollectionAssert.AreEqual(Numbers(node.Description),Numbers(text),node.Id+" "+language+" must retain all numeric constants");
            }
        }
        [TestCase("de","1.234,5")][TestCase("en","1,234.5")][TestCase("es","1.234,5")][TestCase("fr","1 234,5")][TestCase("pt","1.234,5")][TestCase("it","1.234,5")][TestCase("pl","1 234,5")]
        public void RuntimeNumberGroupingUsesSelectedLocaleWithoutChangingTheSourceFormatter(string language,string expected)
        {
            var value=IdleIntelligence.Core.ScientificNumber.From(1234.5);
            string actual=IdleIntelligence.Core.NumberFormatting.Format(value,"auto",language).Replace('\u202f','\u00a0');
            Assert.That(actual,Is.EqualTo(expected));
            Assert.That(IdleIntelligence.Core.NumberFormatting.Format(value,"auto"),Is.EqualTo("1.234,5"),"Shared source reference formatter remains unchanged");
        }
    }
}
