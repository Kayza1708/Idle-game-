// Generated from current TypeScript mission/reward contracts.
namespace IdleIntelligence.Core { public static class MissionBalance {
public const string SourceHash="c7c9ec2cbe9ee8361829a2094229a1f25cf53dc58d70f44fc75be19fef7e8a0f",InitialSeasonId="season-01";
public static readonly double[] Counts=new double[]{6d,12d,30d};
public static readonly double[] Required=new double[]{4d,8d,20d};
public static readonly double[] TaskGems=new double[]{2d,5d,15d};
public static readonly double[] BonusGems=new double[]{6d,30d,120d};
public static readonly double[] QuestXP=new double[]{100d,500d,900d};
public static readonly double[] FrontierStrides=new double[]{0d,4d,2d};
public static readonly double[] MinimumBands=new double[]{0d,2d,2d};
public static readonly double[] FutureBandOffsets=new double[]{0d,1d,2d};
public static readonly double[] BandClasses=new double[]{3d,6d,9d,12d,15d};
public static readonly double[] BandMultipliers=new double[]{1d,2d,4d,8d,16d,32d};
public static readonly double[] ProductionSeconds=new double[]{7200d,50400d,216000d};
public const double RepeatMultiplier=2d,ProductionTasksPerMetric=1d;
public static readonly string[] FrontierNames=new string[]{"Taschenrechner","Einplatinencomputer","Heim-PC","Gaming-GPU","KI-Workstation","Server-Rack","GPU-Farm","Modularer Rechenzentrumscampus","Hyperscale-Cloud","Flüssigkeitsgekühlte Compute-Anlage","Untersee-Rechenzentrum","Orbitales Rechenzentrum","Lunarer KI-Forschungskomplex","Fusionsbetriebener Dyson-Schwarm","Matrioshka-Gehirn"},FrontierEnglish=new string[]{"Calculator","Single-Board Computer","Home PC","Gaming GPU","AI Workstation","Server Rack","GPU Farm","Modular Data Center Campus","Hyperscale Cloud","Liquid-Cooled Compute Facility","Subsea Data Center","Orbital Data Center","Lunar AI Research Complex","Fusion-Powered Dyson Swarm","Matrioshka Brain"};
public static readonly MissionTemplate[] Templates={
new MissionTemplate("hardware","hardwareBought","","Hardware kaufen","Buy hardware",new double[]{25d,300d,2500d}),
new MissionTemplate("milestones","milestones","","Hardware-Meilensteine erreichen","Reach hardware milestones",new double[]{2d,12d,50d}),
new MissionTemplate("train-done","trainingCompleted","","Training abschließen","Complete training",new double[]{1d,10d,40d}),
new MissionTemplate("research-done","researchCompleted","","Forschung abschließen","Complete research",new double[]{1d,7d,30d}),
new MissionTemplate("components","componentsEarned","","Komponenten erhalten","Gain components",new double[]{25d,250d,1500d}),
new MissionTemplate("craft","itemsCrafted","","Items herstellen","Craft items",new double[]{1d,5d,20d}),
new MissionTemplate("drops","dropsClaimed","","Signal-Drops einsammeln","Claim signal drops",new double[]{5d,60d,250d}),
new MissionTemplate("fusion","itemsFused","","Items fusionieren","Fuse items",new double[]{1d,5d,20d}),
new MissionTemplate("forge","forgeUpgrades","","Schmiede-Upgrades durchführen","Forge item upgrades",new double[]{1d,8d,30d}),
new MissionTemplate("credits","regularCredits","","Credits produzieren","Produce credits",new double[]{10000d,10000000d,10000000000d}),
new MissionTemplate("data","regularData","","Daten produzieren","Produce data",new double[]{250d,5000d,50000d}),
new MissionTemplate("taps","taps","","Vergütete Taps ausführen","Perform rewarded taps",new double[]{250d,5000d,50000d}),
new MissionTemplate("overclock","overclocks","","Overclocks auslösen","Trigger overclocks",new double[]{2d,20d,100d}),
new MissionTemplate("prestige","prestiges","","Prestige durchführen","Perform prestige",new double[]{1d,3d,10d}),
new MissionTemplate("active","activeSeconds","","Aktiv spielen","Play actively",new double[]{600d,7200d,36000d}),
new MissionTemplate("blueprints","itemsCrafted","blueprints","Neue Itembaupläne lernen","Learn new item blueprints",new double[]{1d,2d,4d}),
new MissionTemplate("foundries","forgeUpgrades","foundries","Veredelung ausbauen","Upgrade refining",new double[]{1d,1d,2d}),
new MissionTemplate("challenges","prestiges","challenges","Neue Challenge-Stufen abschließen","Complete new challenge stages",new double[]{1d,3d,9d}),
};
public const double SeasonDays=30d;
public const double SeasonLevels=50d;
public const double XPPerLevel=1000d;
public const double GraceDays=7d;
public const double BlueprintChance=0.01d,MaxBoxes=32d,MaxBoxMaterial=1000d;
public static readonly string[] FamilyIds=new string[]{"base","semiconductor","photonic","frontier","quantum"},FamilyPriority=new string[]{"quantum","frontier","photonic","semiconductor","base"},ExtendedIds=new string[]{"inference-router","burst-processor","legacy-controller","sparse-decoder","photonic-matrix","quantum-coupler","distillation-module","curriculum-module","long-term-memory","cryocontroller","manufacturing-controller","diagnostic-adapter","experiment-controller","precision-scanner","recycling-probe","blueprint-archive","protocol-controller","photonic-analyzer","quantum-diagnostic-module","darklab-resonator","model-echo-core","axiom-lattice","cycle-observatory","entropy-sink","mnemonic-anchor"},ExtendedAccess=new string[]{"server","prestige","prestige","prestige","campus","matrioshka","campus","prestige","prestige","matrioshka","server","prestige","server","server","server","campus","server","campus","matrioshka","lab","lab","axiom","axiom","lab","model-set"};
public static readonly double[] PackageAmounts=new double[]{12d,8d,6d,3d,1d};
public static readonly string[][] LegacyFamilyComponents={new string[]{"circuits","copperCoils","ceramicCapacitors","ferriteCores"},new string[]{"siliconWafers","titaniumBolts","goldContacts","ceramicSubstrates","thermalInterface"},new string[]{"photonicLenses","graphene","nanotubes","opticalFibers","photonicCircuits"},new string[]{"superconductors","neuralCrystals","diamondSubstrates","spintronicDevices"},new string[]{"quantumCores","cryogenicResonators"}};
public const double PricedRecipes=34d;
} }
