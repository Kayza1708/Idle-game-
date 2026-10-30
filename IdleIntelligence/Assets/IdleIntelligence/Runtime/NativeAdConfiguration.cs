using UnityEngine;

namespace IdleIntelligence.Runtime
{
    /// <summary>
    /// Store platform IDs from your own LevelPlay dashboard here. Never ship
    /// placeholders as real IDs; empty settings deliberately disable video ads.
    /// Create the asset via Idle Intelligence > Advertising > Create Configuration.
    /// </summary>
    [CreateAssetMenu(fileName="NativeAdConfiguration",menuName="Idle Intelligence/Advertising Configuration")]
    public sealed class NativeAdConfiguration : ScriptableObject
    {
        [Header("LevelPlay dashboard identifiers")]
        public string iOSAppKey = "";
        public string androidAppKey = "";
        public string iOSRewardedAdUnit = "";
        public string androidRewardedAdUnit = "";
        [Header("Privacy and store publishing")]
        [Tooltip("Add the live, public privacy policy address before Store submission.")]
        public string privacyPolicyUrl = "";
        [Tooltip("Release gate: only enable after a certified CMP has been integrated and store disclosures reviewed.")]
        public bool certifiedCmpReadyForProduction = false;

        public string AppKey
        {
            get {
#if UNITY_IOS
                return iOSAppKey?.Trim() ?? "";
#elif UNITY_ANDROID
                return androidAppKey?.Trim() ?? "";
#else
                return "";
#endif
            }
        }
        public string RewardedId
        {
            get {
#if UNITY_IOS
                return iOSRewardedAdUnit?.Trim() ?? "";
#elif UNITY_ANDROID
                return androidRewardedAdUnit?.Trim() ?? "";
#else
                return "";
#endif
            }
        }
        public bool HasCredentials=>!string.IsNullOrWhiteSpace(AppKey)&&!string.IsNullOrWhiteSpace(RewardedId);
    }

    /// <summary>
    /// QA opt-in is explicitly development-only. Production ads require an
    /// external, certified CMP to call ApplyCertifiedConsent after presenting
    /// its genuine user choice. A debug toggle is NOT a legally valid CMP.
    /// </summary>
    public static class NativeAdPrivacy
    {
        const string QaPreference="idle-intelligence-ad-qa-opt-in-v1";
        static bool certifiedAllowed;
        public static bool Development=>Debug.isDebugBuild || Application.isEditor;
        public static bool QaOptIn=>Development&&PlayerPrefs.GetInt(QaPreference,0)==1;
        public static bool CanInitialize(NativeAdConfiguration config)
            =>config!=null&&config.HasCredentials&&
              (Development?QaOptIn:config.certifiedCmpReadyForProduction&&certifiedAllowed);
        public static void SetDevelopmentOptIn(bool allow)
        {
            if(!Development)return;
            PlayerPrefs.SetInt(QaPreference,allow?1:0);
            PlayerPrefs.Save();
        }
        // Only a linked and authenticated CMP adapter may invoke this for production.
        public static void ApplyCertifiedConsent(bool permitted)=>certifiedAllowed=permitted;
        public static void Revoke()=>certifiedAllowed=false;
    }
}
