using System.Linq;
using IdleIntelligence.Core;
using UnityEngine;
namespace IdleIntelligence.Runtime
{
    public sealed class UnitySaveCodec : IVersionedSaveCodec
    {
        public string Encode(StateData data)=>JsonUtility.ToJson(data);
        public StateData Decode(string json)=>Decode(json,0);
        static string[] MigrationFields(int version){if(version<16)return null;var receiptFlags=new[]{"IdleIntelligence.Core.UnityV3SaveData.receiptPresenceRecorded","IdleIntelligence.Core.UnityV3SaveData.hasSynthesisContract","IdleIntelligence.Core.UnityV3SaveData.hasOverdrive"};if(version>=25)return receiptFlags;var nativeV3=new[]{"IdleIntelligence.Core.MainStateData.itemV3Recorded","IdleIntelligence.Core.MainStateData.itemV3"};if(version==24)return nativeV3.Concat(receiptFlags).ToArray();var fields=new System.Collections.Generic.List<string>{"IdleIntelligence.Core.MainStateData.itemV3Recorded","IdleIntelligence.Core.MainStateData.itemV3","IdleIntelligence.Core.IndustryState.analysisQueue","IdleIntelligence.Core.IndustryState.lastAnalysisAmounts","IdleIntelligence.Core.IndustryState.lastAnalysisRecipe"};fields.AddRange(receiptFlags);if(version>=22)return fields.ToArray();void Add(string type,params string[] names){foreach(string name in names)fields.Add("IdleIntelligence.Core."+type+"."+name);}Add("RewardState","vouchersEarned","vouchersSpent");Add("ChestReceipt","voucherGranted");Add("BonusReceipt","voucherGranted");if(version==21)return fields.ToArray();Add("PrestigeState","agentMinimumExact","agentMinimumExactRecorded","intentAnalysisKey","intentModuleKey","intentForgeKeys");Add("AnalysisJob","key");Add("ForgeJob","key");if(version==20)return fields.ToArray();Add("LegacyState","classUpgrades","classUpgradesRecorded");if(version==19)return fields.ToArray();Add("MainStateData","guidance","runCredits","runCreditsRecorded","lifetimeCreditsExact","lifetimeCreditsExactRecorded","lifetimeEligibleExact","lifetimeEligibleExactRecorded","lifetimeDataExact","lifetimeDataExactRecorded");Add("LocalJournal","diagnostics");Add("LocalBalanceHistory","measurementKnown");Add("BalanceObservation","lifetimeCredits","lifetimeEligible","lifetimeData","lifetimeCreditsRecorded","lifetimeEligibleRecorded","lifetimeDataRecorded","metaBalancesRecorded","projectLevelsRecorded","modelLevelsRecorded","fullRecorded","runCreditsRecorded","gems","paidIncome","adFree","nodeIds","equipped","research","modelLevels","inventory","totalINT","unspentINT","spentINT","availableAxioms","totalAxioms","knowledge");if(version==18)return fields.ToArray();if(version==16)Add("MainStateData","story","storyRecorded","journal","returnReceipt");Add("MainStateData","webArchive","legacy");Add("LocalJournal","history","returns","challengeEvents","droppedChallengeEvents","measuredTaps","tapsRecorded");Add("WorkshopState","blueprintPending");Add("Job","startedAt","startRecorded");Add("AnalysisJob","startedAt","startRecorded");Add("LocalEvent","costsRecorded","durationRecorded","actualSeconds","creditCost","dataCost");Add("BalanceRunRecord","events","droppedEventKinds");Add("BalanceObservation","hardwareRecorded","labsRecorded");Add("ReturnReceipt","components","items","fragments","researchFragments");return fields.ToArray();}
        // Unity JsonUtility materializes some null custom-class fields as
        // recursively default-constructed objects. The historical V2 source
        // genuinely has no ItemSystemV3; these placeholders must not be
        // mistaken for an injected V3 payload. Compare against a serializer-
        // generated null-field reference, rather than guessing field defaults.
        // A non-placeholder unmarked V3 object remains invalid and read-only.
        static void NormalizeUnmarkedV3(MainStateData data,UnityV3SaveData nullPlaceholder)
        {
            if(data==null||data.itemV3Recorded||data.itemV3==null)return;
            if(nullPlaceholder==null||
               JsonUtility.ToJson(data.itemV3)!=JsonUtility.ToJson(nullPlaceholder))
                throw new System.FormatException("Unexpected unmarked Unity V3 payload");
            data.itemV3=null;
        }
        public StateData Decode(string json,int version)
        {
            SaveJsonValidation.Validate(json,typeof(StateData),version>=16,MigrationFields(version));
            var decoded=JsonUtility.FromJson<StateData>(json);
            if(decoded==null)throw new System.FormatException("Missing Unity state payload");
            if(!decoded.itemV3Recorded||(decoded.hasChallenge&&decoded.challengeMain!=null&&
                !decoded.challengeMain.itemV3Recorded))
            {
                // Compute the canonical placeholder using the same Unity
                // serializer. Do not change a genuine V3 state or grant one to
                // old campaigns.
                var sample=JsonUtility.FromJson<MainStateData>(JsonUtility.ToJson(new MainStateData()));
                var placeholder=sample?.itemV3;
                NormalizeUnmarkedV3(decoded,placeholder);
                if(decoded.hasChallenge)NormalizeUnmarkedV3(decoded.challengeMain,placeholder);
            }
            if(version>0&&version<24){RestoreAnalysisQueue(decoded);if(decoded.hasChallenge)RestoreAnalysisQueue(decoded.challengeMain);}
            if(version>0&&version<21){RepairLegacyIntent(decoded);if(decoded.hasChallenge)RepairLegacyIntent(decoded.challengeMain);}
            if(version>0&&version<20){RestoreClassUpgrades(decoded,!decoded.hasChallenge,decoded.challengeRun?.runId);if(decoded.hasChallenge)RestoreClassUpgrades(decoded.challengeMain,true,null);}
            if(version>0&&version<23){ExpandItemCatalog(decoded.workshop);if(decoded.hasChallenge)ExpandItemCatalog(decoded.challengeMain?.workshop);}
            return decoded;
        }
        static void RestoreAnalysisQueue(MainStateData data){if(data?.industry==null)return;if(data.industry.analysisQueue==null)data.industry.analysisQueue=System.Array.Empty<int>();if(data.industry.lastAnalysisAmounts==null)data.industry.lastAnalysisAmounts=new long[ItemBalance.ComponentIds.Length];data.industry.lastAnalysisRecipe=-1;}
        // Schema22 and earlier have exactly30 catalog entries. New IDs append; never truncate
        // a longer/unknown catalog or guess that arbitrary missing entries were empty.
        static void ExpandItemCatalog(WorkshopState w){if(w==null)return;void B(ref bool[] a){if(a==null)return;if(a.Length==30)System.Array.Resize(ref a,ItemBalance.Items.Length);else if(a.Length!=ItemBalance.Items.Length)throw new System.FormatException("Unknown legacy item catalog; original preserved");}void I(ref int[] a){if(a==null)return;if(a.Length==30)System.Array.Resize(ref a,ItemBalance.Items.Length);else if(a.Length!=ItemBalance.Items.Length)throw new System.FormatException("Unknown legacy item catalog; original preserved");}B(ref w.learned);B(ref w.knownBlueprints);I(ref w.mastery);I(ref w.crafted);}
        static void RepairLegacyIntent(MainStateData data){if(data.prestige==null||!data.prestige.resetIntent)return;var p=data.prestige;var jobs=System.Linq.Enumerable.Where(new[]{data.hasResearchJob?data.researchJob:null}.Concat(data.prestige.labs),j=>j!=null);p.intentResearch=p.intentResearch.Select(id=>jobs.FirstOrDefault(j=>j.id==id||j.key==id)).Where(j=>j!=null).Select(PrestigeAutomation.JobIdentity).ToArray();p.intentAnalysisKey=p.intentAnalysis?(data.workshop.hasAnalysis?data.workshop.analysis.key??"legacy-analysis":data.industry.synthesis!=null?PrestigeAutomation.JobIdentity(data.industry.synthesis):""):"";p.intentModuleKey=p.intentCrafting&&data.workshop.hasModuleJob?PrestigeAutomation.JobIdentity(data.workshop.moduleJob):"";p.intentForgeKeys=System.Array.Empty<string>();}
        static void RestoreClassUpgrades(MainStateData data,bool mainContext,string runId){if(data.legacy==null||data.legacy.classUpgradesRecorded)return;data.legacy.classUpgrades=System.Array.Empty<string>();if(data.webArchive?.present==true){var root=SaveJsonValidation.Parse(data.webArchive.normalized).Field("state");var session=root.Field("challengeSession");bool archivedChallenge=session!=null&&session.Kind!="null";if(mainContext&&archivedChallenge)root=session.Field("main");else if(!mainContext&&(!archivedChallenge||root.Field("retention")?.Field("activeRun")?.Field("runId")?.Text!=runId))root=null;if(root!=null&&root.Field("prestigeCount")?.Text==data.prestige.resets.ToString(System.Globalization.CultureInfo.InvariantCulture)&&root.Field("axiomResetCount")?.Text==data.meta.resets.ToString(System.Globalization.CultureInfo.InvariantCulture)){var upgrades=root.Field("classUpgrades");if(upgrades?.Kind=="array")data.legacy.classUpgrades=System.Linq.Enumerable.ToArray(System.Linq.Enumerable.Select(upgrades.Items,x=>x.Text));}}data.legacy.classUpgradesRecorded=true;}
        public string EncodeEnvelope(SaveEnvelope data)=>JsonUtility.ToJson(data);
        public SaveEnvelope DecodeEnvelope(string json){var value=SaveJsonValidation.Parse(json);SaveJsonValidation.ValidateValue(value,typeof(SaveEnvelope),true);if(value.Kind=="null")return null;if(value.Fields.Count==0)return new SaveEnvelope();return new SaveEnvelope{format=value.Field("format").Text,version=int.Parse(value.Field("version").Text,System.Globalization.CultureInfo.InvariantCulture),payload=value.Field("payload").Text,sha256=value.Field("sha256").Text};}
    }
}
