using NUnit.Framework;
using UnityEngine;
using IdleIntelligence.Core;
using IdleIntelligence.Runtime;

namespace IdleIntelligence.Tests
{
    public sealed class UnityV3AdvertisingTests
    {
        [Test]public void MissingSdkCredentialsAlwaysBlockAds()
        {
            var settings=ScriptableObject.CreateInstance<NativeAdConfiguration>();
            try {
                settings.androidAppKey="";
                settings.iOSAppKey="";
                settings.androidRewardedAdUnit="";
                settings.iOSRewardedAdUnit="";
                Assert.That(settings.HasCredentials,Is.False);
                Assert.That(NativeAdPrivacy.CanInitialize(settings),Is.False);
            } finally {Object.DestroyImmediate(settings);}
        }
        [Test]public void RewardProviderWithoutSdkCannotInventCompletedVideo()
        {
            var unavailable=new UnavailableRewardedVideoProvider();
            var result=unavailable.ShowAsync("gems","test-id",
                System.Threading.CancellationToken.None).GetAwaiter().GetResult();
            Assert.That(result,Is.EqualTo(RewardProviderResult.Unavailable));
            Assert.That(RewardProviderFactory.IsReady(unavailable),Is.False);
            var state=Game.NewV3(1000,"ad-ui-no-provider");
            var ticket=AdRewards.Begin(state,"gems","no-sdk-reward");
            var denied=AdRewards.Complete(ticket,"no-sdk-reward","error");
            Assert.That(denied.Retention.gems,Is.EqualTo(state.Retention.gems));
            Assert.That(denied.Ads.counts[0],Is.EqualTo(0));
        }
        [Test]public void DevelopmentQaOptInIsNotProductionConsent()
        {
            var settings=ScriptableObject.CreateInstance<NativeAdConfiguration>();
            try {
                settings.certifiedCmpReadyForProduction=false;
                NativeAdPrivacy.ApplyCertifiedConsent(true);
                Assert.That(NativeAdPrivacy.CanInitialize(settings),Is.False);
                NativeAdPrivacy.Revoke();
            }finally{Object.DestroyImmediate(settings);}
        }
    }
}
