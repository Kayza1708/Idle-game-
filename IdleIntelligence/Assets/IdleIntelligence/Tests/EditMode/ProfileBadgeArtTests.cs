using IdleIntelligence.Runtime;
using NUnit.Framework;
using UnityEngine;

namespace IdleIntelligence.Tests
{
    public sealed class ProfileBadgeArtTests
    {
        [Test] public void AllBadgeFamiliesHaveDistinctBronzeSilverGoldSprites()
        {
            string[] families={
                "company-founder","company-contributor","company-trader",
                "prestige","challenge","achievement","hardware"
            };
            foreach(string family in families)
            {
                var bronze=ProfileBadgeSprite.Get(family,1);
                var silver=ProfileBadgeSprite.Get(family,2);
                var gold=ProfileBadgeSprite.Get(family,3);
                Assert.That(bronze,Is.Not.Null,family);
                Assert.That(silver,Is.Not.SameAs(bronze),family);
                Assert.That(gold,Is.Not.SameAs(silver),family);
                Assert.That(bronze.texture.width,Is.EqualTo(80));
                Assert.That(silver.texture.filterMode,Is.EqualTo(FilterMode.Point));
                Assert.That(ProfileBadgeSprite.Get(family,1),Is.SameAs(bronze),"Art should be cached");
                Assert.That(bronze.texture.GetPixel(40,53).a,Is.GreaterThan(0f));
            }
        }
        [Test] public void ProfileFramesKeepPortraitCenterTransparent()
        {
            string[] frames={
                "basic","founder","bronze-lab","silver-lab","gold-lab",
                "neon","quantum","singularity"
            };
            foreach(string id in frames)
            {
                var sprite=ProfileFrameSprite.Get(id);
                Assert.That(sprite,Is.Not.Null,id);
                Assert.That(sprite.texture.width,Is.EqualTo(96));
                Assert.That(sprite.texture.GetPixel(48,48).a,Is.EqualTo(0f),id+" should not cover avatar");
                Assert.That(sprite.texture.GetPixel(8,48).a,Is.GreaterThan(0f),id+" has a visible rim");
                Assert.That(ProfileFrameSprite.Get(id),Is.SameAs(sprite));
            }
        }
    }
}
