// Generated from original capsule / Gem offer rules.
namespace IdleIntelligence.Core {public static class GemBalance {
public const string SourceHash="68008740567daaeddf0e7026fa9c46797891bda3481e504831d18fb6352cba87";
public const double CapsuleCost=10d;
public const double ItemChance=0.01d;
public const double GemChance=0.0475d;
public const double ComponentChance=0.35d;
public const double CreditChance=0.45d;
public const double DataChance=0.14d;
public const double JackpotChance=0.0025d;
public const double JackpotMultiplier=20d;
public const double CreditFloor=100d;
public const double DataFloor=5d;
public const double RareBoundary=0.01d;
public const double UncommonBoundary=0.1d;
public const double CapsuleVideoLimit=6d;
public const double LabBoostCost=80d;
public const double LabBoostSeconds=3600d;
public const double BoostCap=86400d;
public const double ResearchBoostMultiplier=2d;
public const double MaximumLabs=6d;
public static readonly double[] FamilyCosts=new double[]{40d,80d,120d,180d,250d};
public static readonly double[] GemRange=new double[]{2d,8d};
public static readonly double[] CreditSeconds=new double[]{15d,60d};
public static readonly double[] DataSeconds=new double[]{15d,60d};
public static readonly double[] LabCosts=new double[]{500d,1500d};
public static readonly double[] OfflineHours=new double[]{12d,16d,24d};
public static readonly double[] OfflineCosts=new double[]{250d,500d,1000d};
public static readonly double[] CraftSeconds=new double[]{1800d,14400d};
public static readonly double[] CraftCosts=new double[]{20d,120d};
public static readonly double[] TrainingSeconds=new double[]{900d,3600d};
public static readonly double[] TrainingCosts=new double[]{15d,45d};
public static readonly double[] CircuitPack=new double[]{30d,50d};
public static readonly double[] AdvancedPack=new double[]{60d,10d,10d};
public static readonly double[][] ComponentRanges={new double[]{3d,12d},new double[]{2d,5d},new double[]{1d,2d}};
public static readonly GemDefinition[] Offers={
new GemDefinition("material-family-base","materials","Basis-Materialpaket","Basic material pack","Zugängliche Familienmaterialien; feste Mengen","Accessible family materials; fixed amounts"),
new GemDefinition("material-family-semiconductor","materials","Halbleiter-Materialpaket","Semiconductors material pack","Zugängliche Familienmaterialien; feste Mengen","Accessible family materials; fixed amounts"),
new GemDefinition("material-family-photonic","materials","Photonik-Materialpaket","Photonics material pack","Zugängliche Familienmaterialien; feste Mengen","Accessible family materials; fixed amounts"),
new GemDefinition("material-family-frontier","materials","Frontier-Materialpaket","Frontier material pack","Zugängliche Familienmaterialien; feste Mengen","Accessible family materials; fixed amounts"),
new GemDefinition("material-family-quantum","materials","Quanten-Materialpaket","Quantum material pack","Zugängliche Familienmaterialien; feste Mengen","Accessible family materials; fixed amounts"),
new GemDefinition("lab-slot-1","permanent","Zusatzlabor I","Additional lab I","Ein zusätzlicher Laborplatz","One additional lab slot"),
new GemDefinition("lab-slot-2","permanent","Zusatzlabor II","Additional lab II","Ein zusätzlicher Laborplatz","One additional lab slot"),
new GemDefinition("offline-12","permanent","12 Stunden offline","12 hours offline","Dauerhafte Offline-Kapazität","Permanent offline capacity"),
new GemDefinition("offline-16","permanent","16 Stunden offline","16 hours offline","Dauerhafte Offline-Kapazität","Permanent offline capacity"),
new GemDefinition("offline-24","permanent","24 Stunden offline","24 hours offline","Dauerhafte Offline-Kapazität","Permanent offline capacity"),
new GemDefinition("lab-boost","time","Laborbonus · 60 Min.","Lab boost · 60 min","Bestehender Bonus: Forschung läuft doppelt","Existing boost: research runs twice as fast"),
new GemDefinition("craft-30m","time","Crafting −30 Min.","Crafting −30 min","Nur der aktive Auftrag","Active job only"),
new GemDefinition("craft-4h","time","Crafting −4 Std.","Crafting −4 h","Nur der aktive Auftrag","Active job only"),
new GemDefinition("training-15m","time","Training −15 Min.","Training −15 min","Nur das aktive Training","Active training only"),
new GemDefinition("training-1h","time","Training −1 Std.","Training −1 h","Nur das aktive Training","Active training only"),
new GemDefinition("materials-circuits","materials","50 Schaltkreise","50 circuits","Direkt in den Komponentenbestand","Added to component inventory"),
new GemDefinition("materials-advanced","materials","Spulen- & Waferpaket","Coil & wafer pack","10 Kupferspulen + 10 Siliziumwafer","10 copper coils + 10 silicon wafers"),
};
}}
