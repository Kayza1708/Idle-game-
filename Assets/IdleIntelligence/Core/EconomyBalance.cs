using System;
namespace IdleIntelligence.Core
{
    /// <summary>Native V3 tuning authority. Historical generated tables remain frozen for legacy saves.</summary>
    public static class EconomyBalance
    {
        public const double ResearchBaseFactor = 4;
        public const double ResearchLevelGrowth = 1.15;
        public const double CraftDataFactor = 6;
        public const double ItemUpgradeDataFactor = 4;
        public const int StarterRecipeCount = 3;

        // Pure quote helpers: no production-dependent prices or state mutation.
        public static ScientificNumber ResearchFactor(bool nativeV3, int level) =>
            nativeV3 ? ScientificNumber.From(ResearchBaseFactor).Multiply(ScientificNumber.From(ResearchLevelGrowth).Pow(Math.Max(0, level))) : ScientificNumber.One;
        public static double CraftData(bool nativeV3, double original, int starter) =>
            Math.Ceiling(original * (nativeV3 && !(starter >= 0 && starter < StarterRecipeCount) ? CraftDataFactor : 1));
        public static double UpgradeFactor(bool nativeV3) => nativeV3 ? ItemUpgradeDataFactor : 1;
    }
}
