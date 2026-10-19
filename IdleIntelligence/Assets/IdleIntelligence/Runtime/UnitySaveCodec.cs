using IdleIntelligence.Core;
using UnityEngine;
namespace IdleIntelligence.Runtime
{
    public sealed class UnitySaveCodec : IEnvelopeCodec
    {
        public string Encode(StateData data)=>JsonUtility.ToJson(data);
        public StateData Decode(string json)=>JsonUtility.FromJson<StateData>(json);
        public string EncodeEnvelope(SaveEnvelope data)=>JsonUtility.ToJson(data);
        public SaveEnvelope DecodeEnvelope(string json)=>JsonUtility.FromJson<SaveEnvelope>(json);
    }
}
