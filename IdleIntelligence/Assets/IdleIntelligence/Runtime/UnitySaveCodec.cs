using IdleIntelligence.Core;
using UnityEngine;
namespace IdleIntelligence.Runtime
{
    public sealed class UnitySaveCodec : IVersionedSaveCodec
    {
        public string Encode(StateData data)=>JsonUtility.ToJson(data);
        public StateData Decode(string json)=>Decode(json,0);
        public StateData Decode(string json,int version){SaveJsonValidation.Validate(json,typeof(StateData),version==AtomicSaveStore.Version);return JsonUtility.FromJson<StateData>(json);}
        public string EncodeEnvelope(SaveEnvelope data)=>JsonUtility.ToJson(data);
        public SaveEnvelope DecodeEnvelope(string json){SaveJsonValidation.Validate(json,typeof(SaveEnvelope),true);return JsonUtility.FromJson<SaveEnvelope>(json);}
    }
}
