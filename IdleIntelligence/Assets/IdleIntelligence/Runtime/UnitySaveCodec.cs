using IdleIntelligence.Core;
using UnityEngine;
namespace IdleIntelligence.Runtime
{
    public sealed class UnitySaveCodec : IVersionedSaveCodec
    {
        public string Encode(StateData data)=>JsonUtility.ToJson(data);
        public StateData Decode(string json)=>Decode(json,0);
        static string[] MigrationFields(int version){if(version<16||version>18)return null;var fields=new System.Collections.Generic.List<string>();void Add(string type,params string[] names){foreach(string name in names)fields.Add("IdleIntelligence.Core."+type+"."+name);}Add("MainStateData","guidance","runCredits","runCreditsRecorded","lifetimeCreditsExact","lifetimeCreditsExactRecorded","lifetimeEligibleExact","lifetimeEligibleExactRecorded","lifetimeDataExact","lifetimeDataExactRecorded");Add("LocalJournal","diagnostics");Add("LocalBalanceHistory","measurementKnown");Add("BalanceObservation","lifetimeCredits","lifetimeEligible","lifetimeData","lifetimeCreditsRecorded","lifetimeEligibleRecorded","lifetimeDataRecorded","metaBalancesRecorded","projectLevelsRecorded","modelLevelsRecorded","fullRecorded","runCreditsRecorded","gems","paidIncome","adFree","nodeIds","equipped","research","modelLevels","inventory","totalINT","unspentINT","spentINT","availableAxioms","totalAxioms","knowledge");if(version==18)return fields.ToArray();if(version==16)Add("MainStateData","story","storyRecorded","journal","returnReceipt");Add("MainStateData","webArchive","legacy");Add("LocalJournal","history","returns","challengeEvents","droppedChallengeEvents","measuredTaps","tapsRecorded");Add("WorkshopState","blueprintPending");Add("Job","startedAt","startRecorded");Add("AnalysisJob","startedAt","startRecorded");Add("LocalEvent","costsRecorded","durationRecorded","actualSeconds","creditCost","dataCost");Add("BalanceRunRecord","events","droppedEventKinds");Add("BalanceObservation","hardwareRecorded","labsRecorded");Add("ReturnReceipt","components","items","fragments","researchFragments");return fields.ToArray();}
        public StateData Decode(string json,int version){SaveJsonValidation.Validate(json,typeof(StateData),version>=16,MigrationFields(version));return JsonUtility.FromJson<StateData>(json);}
        public string EncodeEnvelope(SaveEnvelope data)=>JsonUtility.ToJson(data);
        public SaveEnvelope DecodeEnvelope(string json){SaveJsonValidation.Validate(json,typeof(SaveEnvelope),true);return JsonUtility.FromJson<SaveEnvelope>(json);}
    }
}
