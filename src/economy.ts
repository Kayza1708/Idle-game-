import {challengeNetworkLinkAllowed,activeChallengeRules,challengeFamilyBonus,addChallengeMetrics} from './challengeStages';
import {classUpgradePackageQuote,hardwarePurchaseMaterialQuote,hardwareMaterialQuote,grantPaidHardwareMilestone,unlockPaidHardwareMaterials} from './materialEconomy';
import {deviceBonus} from './deviceEffects';
import {researchAccess,researchAreaFor,type ResearchAreaId} from './researchAreas';
import {ScientificNumber,type ScientificJSON} from './scientificNumber';
import { addEvent, addMetrics, newTelemetry, type LocalTelemetry } from './telemetry';
import { newStory, type StoryState } from './story';

/** All tunable alpha balance lives in this file. Domain modules consume these values. */
export const extendedItemCatalog = {
  "inference-router": {
    "name": "Inferenz-Router",
    "en": "Inference router",
    "slot": "processor",
    "role": "neighbor",
    "effect": "neighbor",
    "area": "architecture",
    "access": "server",
    "family": "semiconductor",
    "cap": 0.6,
    "strength": 1,
    "trigger": "aktive bezahlte Nachbarschaft",
    "secondary": "compute",
    "tertiary": "research",
    "recipe": {
      "rarity": "common",
      "name": "Inferenz-Router-Bauplan",
      "ingredients": {
        "circuits": 40,
        "copperCoils": 10,
        "siliconWafers": 14,
        "goldContacts": 7
      },
      "blueprints": 6,
      "data": 2400,
      "modules": {
        "computeBus": 1,
        "dataLattice": 1
      },
      "duration": 1200
    },
    "enTrigger": "Increase existing active paid hardware-neighbor contributions."
  },
  "burst-processor": {
    "name": "Burst-Prozessor",
    "en": "Burst processor",
    "slot": "processor",
    "role": "burst",
    "effect": "burst",
    "area": "architecture",
    "access": "prestige",
    "family": "base",
    "cap": 0.6,
    "strength": 1,
    "trigger": "bestehendes Overclock-Fenster",
    "secondary": "compute",
    "tertiary": "tap",
    "recipe": {
      "rarity": "common",
      "name": "Burst-Prozessor-Bauplan",
      "ingredients": {
        "circuits": 20,
        "copperCoils": 8,
        "ceramicCapacitors": 4
      },
      "blueprints": 4,
      "data": 1000,
      "modules": {},
      "duration": 600
    },
    "enTrigger": "Increase the existing active credit overclock window bonus."
  },
  "legacy-controller": {
    "name": "Legacy-Controller",
    "en": "Legacy controller",
    "slot": "processor",
    "role": "legacy",
    "effect": "legacy",
    "area": "architecture",
    "access": "prestige",
    "family": "base",
    "cap": 0.6,
    "strength": 1,
    "trigger": "calculator/sbc mit mindestens 10 Einheiten",
    "secondary": "credits",
    "tertiary": "compute",
    "recipe": {
      "rarity": "common",
      "name": "Legacy-Controller-Bauplan",
      "ingredients": {
        "circuits": 8,
        "copperCoils": 6,
        "ferriteCores": 4
      },
      "blueprints": 4,
      "data": 1000,
      "modules": {},
      "duration": 600
    },
    "enTrigger": "Support calculators and single-board computers with at least ten units."
  },
  "sparse-decoder": {
    "name": "Sparse-Decoder",
    "en": "Sparse decoder",
    "slot": "processor",
    "role": "sparse",
    "effect": "sparse",
    "area": "architecture",
    "access": "prestige",
    "family": "semiconductor",
    "cap": 0.6,
    "strength": 1,
    "trigger": "1–3 besessene Klassen",
    "secondary": "compute",
    "tertiary": "training",
    "recipe": {
      "rarity": "common",
      "name": "Sparse-Decoder-Bauplan",
      "ingredients": {
        "circuits": 20,
        "copperCoils": 6,
        "siliconWafers": 8,
        "ceramicSubstrates": 4
      },
      "blueprints": 4,
      "data": 1000,
      "modules": {},
      "duration": 600
    },
    "enTrigger": "Compute bonus while owning one to three hardware classes."
  },
  "photonic-matrix": {
    "name": "Photonik-Matrix",
    "en": "Photonic matrix",
    "slot": "processor",
    "role": "photonicCompute",
    "effect": "photonicCompute",
    "area": "architecture",
    "access": "campus",
    "family": "photonic",
    "cap": 0.6,
    "strength": 1,
    "trigger": "aktiver Overclock",
    "secondary": "compute",
    "tertiary": "data",
    "recipe": {
      "rarity": "common",
      "name": "Photonik-Matrix-Bauplan",
      "ingredients": {
        "circuits": 60,
        "copperCoils": 14,
        "photonicLenses": 20,
        "photonicCircuits": 10
      },
      "blueprints": 8,
      "data": 6000,
      "modules": {
        "computeBus": 1,
        "dataLattice": 1
      },
      "duration": 2400
    },
    "enTrigger": "Additional compute only while overclock is active."
  },
  "quantum-coupler": {
    "name": "Quantenkoppler",
    "en": "Quantum coupler",
    "slot": "processor",
    "role": "lateNeighbor",
    "effect": "lateNeighbor",
    "area": "architecture",
    "access": "matrioshka",
    "family": "quantum",
    "cap": 0.6,
    "strength": 1,
    "trigger": "aktive Nachbarn ab campus",
    "secondary": "compute",
    "tertiary": "research",
    "recipe": {
      "rarity": "common",
      "name": "Quantenkoppler-Bauplan",
      "ingredients": {
        "circuits": 80,
        "copperCoils": 18,
        "quantumCores": 26,
        "cryogenicResonators": 13
      },
      "blueprints": 10,
      "data": 12000,
      "modules": {
        "computeBus": 1,
        "dataLattice": 1
      },
      "duration": 3600
    },
    "enTrigger": "Support existing active neighbor links from campus onward."
  },
  "distillation-module": {
    "name": "Distillationsmodul",
    "en": "Distillation module",
    "slot": "core",
    "role": "pairs",
    "effect": "pairs",
    "area": "model",
    "access": "campus",
    "family": "photonic",
    "cap": 0.6,
    "strength": 1,
    "trigger": "abgeschlossene Q/E-Paare im Run, höchstens 5",
    "secondary": "training",
    "tertiary": "compute",
    "recipe": {
      "rarity": "common",
      "name": "Distillationsmodul-Bauplan",
      "ingredients": {
        "circuits": 60,
        "copperCoils": 14,
        "graphene": 20,
        "opticalFibers": 10
      },
      "blueprints": 8,
      "data": 6000,
      "modules": {
        "computeBus": 1,
        "dataLattice": 1
      },
      "duration": 2400
    },
    "enTrigger": "Compute bonus after completed Q/E pairs in this run; at most five pairs."
  },
  "curriculum-module": {
    "name": "Curriculum-Modul",
    "en": "Curriculum module",
    "slot": "core",
    "role": "curriculum",
    "effect": "curriculum",
    "area": "model",
    "access": "prestige",
    "family": "semiconductor",
    "cap": 0.6,
    "strength": 1,
    "trigger": "Trackwechsel beim nächsten Trainingsstart",
    "secondary": "training",
    "tertiary": "data",
    "recipe": {
      "rarity": "common",
      "name": "Curriculum-Modul-Bauplan",
      "ingredients": {
        "circuits": 20,
        "copperCoils": 6,
        "siliconWafers": 8,
        "ceramicSubstrates": 4
      },
      "blueprints": 4,
      "data": 1000,
      "modules": {},
      "duration": 600
    },
    "enTrigger": "Add a training-cost bonus on the next start after changing track."
  },
  "long-term-memory": {
    "name": "Langzeitspeicher",
    "en": "Long-term memory",
    "slot": "core",
    "role": "memory",
    "effect": "memory",
    "area": "data",
    "access": "prestige",
    "family": "semiconductor",
    "cap": 0.6,
    "strength": 1,
    "trigger": "passive Produktion, Runzeit bis 3600 s",
    "secondary": "data",
    "tertiary": "research",
    "recipe": {
      "rarity": "common",
      "name": "Langzeitspeicher-Bauplan",
      "ingredients": {
        "circuits": 20,
        "copperCoils": 6,
        "siliconWafers": 8,
        "goldContacts": 4
      },
      "blueprints": 4,
      "data": 1000,
      "modules": {},
      "duration": 600
    },
    "enTrigger": "Bounded passive credit bonus rising with run time, up to one hour."
  },
  "cryocontroller": {
    "name": "Kryocontroller",
    "en": "Cryocontroller",
    "slot": "core",
    "role": "overclockDuration",
    "effect": "overclockDuration",
    "area": "architecture",
    "access": "matrioshka",
    "family": "quantum",
    "cap": 0.6,
    "strength": 1,
    "trigger": "zukünftige Overclockstarts",
    "secondary": "research",
    "tertiary": "compute",
    "recipe": {
      "rarity": "common",
      "name": "Kryocontroller-Bauplan",
      "ingredients": {
        "circuits": 80,
        "copperCoils": 18,
        "quantumCores": 26,
        "cryogenicResonators": 13
      },
      "blueprints": 10,
      "data": 12000,
      "modules": {
        "computeBus": 1,
        "dataLattice": 1
      },
      "duration": 3600
    },
    "enTrigger": "Increase the duration of future overclock starts."
  },
  "manufacturing-controller": {
    "name": "Fertigungscontroller",
    "en": "Manufacturing controller",
    "slot": "core",
    "role": "recovery",
    "effect": "recovery",
    "area": "materials",
    "access": "server",
    "family": "semiconductor",
    "cap": 0.6,
    "strength": 1,
    "trigger": "Craft-Recycling, Gesamtrückgewinnung höchstens 60 %",
    "secondary": "compute",
    "tertiary": "training",
    "recipe": {
      "rarity": "common",
      "name": "Fertigungscontroller-Bauplan",
      "ingredients": {
        "circuits": 40,
        "copperCoils": 10,
        "titaniumBolts": 14,
        "thermalInterface": 7
      },
      "blueprints": 6,
      "data": 2400,
      "modules": {
        "computeBus": 1,
        "dataLattice": 1
      },
      "duration": 1200
    },
    "enTrigger": "Increase crafting recycling within the overall 60% recovery budget."
  },
  "diagnostic-adapter": {
    "name": "Diagnoseadapter",
    "en": "Diagnostic adapter",
    "slot": "research",
    "role": "hardwarePackage",
    "effect": "hardwarePackage",
    "area": "materials",
    "access": "prestige",
    "family": "semiconductor",
    "cap": 0.6,
    "strength": 1,
    "trigger": "bezahlte Hardwarekanten",
    "secondary": "experiment",
    "tertiary": "research",
    "recipe": {
      "rarity": "common",
      "name": "Diagnoseadapter-Bauplan",
      "ingredients": {
        "circuits": 20,
        "copperCoils": 6,
        "siliconWafers": 8,
        "goldContacts": 4
      },
      "blueprints": 4,
      "data": 1000,
      "modules": {},
      "duration": 600
    },
    "enTrigger": "Increase packages earned by actual paid hardware milestone edges."
  },
  "experiment-controller": {
    "name": "Versuchscontroller",
    "en": "Experiment controller",
    "slot": "research",
    "role": "areaSwitch",
    "effect": "areaSwitch",
    "area": "automation",
    "access": "server",
    "family": "semiconductor",
    "cap": 0.6,
    "strength": 1,
    "trigger": "zukünftiger Forschungsstart nach Bereichswechsel",
    "secondary": "research",
    "tertiary": "experiment",
    "recipe": {
      "rarity": "common",
      "name": "Versuchscontroller-Bauplan",
      "ingredients": {
        "circuits": 40,
        "copperCoils": 10,
        "siliconWafers": 14,
        "opticalFibers": 7
      },
      "blueprints": 6,
      "data": 2400,
      "modules": {
        "computeBus": 1,
        "dataLattice": 1
      },
      "duration": 1200
    },
    "enTrigger": "Improve future research starts after changing research area."
  },
  "precision-scanner": {
    "name": "Präzisionsscanner",
    "en": "Precision scanner",
    "slot": "research",
    "role": "focus",
    "effect": "focus",
    "area": "materials",
    "access": "server",
    "family": "photonic",
    "cap": 0.6,
    "strength": 1,
    "trigger": "zukünftige fokussierte Materialanalysen",
    "secondary": "experiment",
    "tertiary": "drop",
    "recipe": {
      "rarity": "common",
      "name": "Präzisionsscanner-Bauplan",
      "ingredients": {
        "circuits": 40,
        "copperCoils": 10,
        "photonicLenses": 14,
        "opticalFibers": 7
      },
      "blueprints": 6,
      "data": 2400,
      "modules": {
        "computeBus": 1,
        "dataLattice": 1
      },
      "duration": 1200
    },
    "enTrigger": "Increase the selected family weight of future focused analyses."
  },
  "recycling-probe": {
    "name": "Recycling-Sonde",
    "en": "Recycling probe",
    "slot": "research",
    "role": "fragment",
    "effect": "fragment",
    "area": "materials",
    "access": "server",
    "family": "photonic",
    "cap": 0.6,
    "strength": 1,
    "trigger": "Rare+-Zerlegung, Chance gedeckelt 60 %",
    "secondary": "experiment",
    "tertiary": "research",
    "recipe": {
      "rarity": "common",
      "name": "Recycling-Sonde-Bauplan",
      "ingredients": {
        "circuits": 40,
        "copperCoils": 10,
        "graphene": 14,
        "photonicCircuits": 7
      },
      "blueprints": 6,
      "data": 2400,
      "modules": {
        "computeBus": 1,
        "dataLattice": 1
      },
      "duration": 1200
    },
    "enTrigger": "Improve rare+ salvage fragment chance, capped at 60%."
  },
  "blueprint-archive": {
    "name": "Bauplanarchiv",
    "en": "Blueprint archive",
    "slot": "research",
    "role": "blueprintProgress",
    "effect": "blueprintProgress",
    "area": "materials",
    "access": "campus",
    "family": "frontier",
    "cap": 0.6,
    "strength": 1,
    "trigger": "bezahlter Forschungsabschluss",
    "secondary": "research",
    "tertiary": "experiment",
    "recipe": {
      "rarity": "common",
      "name": "Bauplanarchiv-Bauplan",
      "ingredients": {
        "circuits": 60,
        "copperCoils": 14,
        "neuralCrystals": 20,
        "spintronicDevices": 10
      },
      "blueprints": 8,
      "data": 6000,
      "modules": {
        "computeBus": 1,
        "dataLattice": 1
      },
      "duration": 2400
    },
    "enTrigger": "Improve blueprint progress from paid research completions."
  },
  "protocol-controller": {
    "name": "Protokollcontroller",
    "en": "Protocol controller",
    "slot": "research",
    "role": "planning",
    "effect": "planning",
    "area": "automation",
    "access": "server",
    "family": "semiconductor",
    "cap": 0.6,
    "strength": 1,
    "trigger": "bezahlter automatischer Start, einmalige Bonuszeit; keine Gratisaufträge",
    "secondary": "research",
    "tertiary": "training",
    "recipe": {
      "rarity": "common",
      "name": "Protokollcontroller-Bauplan",
      "ingredients": {
        "circuits": 40,
        "copperCoils": 10,
        "goldContacts": 14,
        "ceramicSubstrates": 7
      },
      "blueprints": 6,
      "data": 2400,
      "modules": {
        "computeBus": 1,
        "dataLattice": 1
      },
      "duration": 1200
    },
    "enTrigger": "Shorten newly paid automatic research starts by up to 10% of the item contribution; no free jobs."
  },
  "photonic-analyzer": {
    "name": "Photonik-Analysator",
    "en": "Photonic analyzer",
    "slot": "research",
    "role": "photonicYield",
    "effect": "photonicYield",
    "area": "materials",
    "access": "campus",
    "family": "photonic",
    "cap": 0.6,
    "strength": 1,
    "trigger": "Photonikfunde aus neuen Analysen/Paketen",
    "secondary": "experiment",
    "tertiary": "research",
    "recipe": {
      "rarity": "common",
      "name": "Photonik-Analysator-Bauplan",
      "ingredients": {
        "circuits": 60,
        "copperCoils": 14,
        "photonicLenses": 20,
        "photonicCircuits": 10
      },
      "blueprints": 8,
      "data": 6000,
      "modules": {
        "computeBus": 1,
        "dataLattice": 1
      },
      "duration": 2400
    },
    "enTrigger": "Improve photonic material yield from new analyses and paid hardware packages."
  },
  "quantum-diagnostic-module": {
    "name": "Quanten-Diagnosemodul",
    "en": "Quantum diagnostic module",
    "slot": "research",
    "role": "quantumYield",
    "effect": "quantumYield",
    "area": "materials",
    "access": "matrioshka",
    "family": "quantum",
    "cap": 0.6,
    "strength": 1,
    "trigger": "Quantenfunde aus neuen Analysen/Paketen",
    "secondary": "experiment",
    "tertiary": "research",
    "recipe": {
      "rarity": "common",
      "name": "Quanten-Diagnosemodul-Bauplan",
      "ingredients": {
        "circuits": 80,
        "copperCoils": 18,
        "quantumCores": 26,
        "cryogenicResonators": 13
      },
      "blueprints": 10,
      "data": 12000,
      "modules": {
        "computeBus": 1,
        "dataLattice": 1
      },
      "duration": 3600
    },
    "enTrigger": "Improve quantum material yield from new analyses and paid hardware packages."
  }
} as const;
export const BALANCE = {
  extendedItems:extendedItemCatalog,
  materialFamilies:{base:{name:'Basis',en:'Basic',hardware:null,ids:['circuits','copperCoils','ceramicCapacitors','ferriteCores']},semiconductor:{name:'Halbleiter',en:'Semiconductors',hardware:'pc',ids:['siliconWafers','titaniumBolts','goldContacts','ceramicSubstrates','thermalInterface']},photonic:{name:'Photonik',en:'Photonics',hardware:'server',ids:['photonicLenses','graphene','nanotubes','opticalFibers','photonicCircuits']},frontier:{name:'Frontier',en:'Frontier',hardware:'campus',ids:['superconductors','neuralCrystals','diamondSubstrates','spintronicDevices']},quantum:{name:'Quanten',en:'Quantum',hardware:'matrioshka',ids:['quantumCores','cryogenicResonators']}},
  hardwareMaterialPairs:{calculator:['circuits','copperCoils'],sbc:['circuits','copperCoils'],pc:['siliconWafers','thermalInterface'],gpu:['siliconWafers','thermalInterface'],rig:['goldContacts','opticalFibers'],server:['goldContacts','opticalFibers'],farm:['photonicLenses','opticalFibers'],campus:['graphene','photonicCircuits'],cloud:['superconductors','diamondSubstrates'],liquid:['neuralCrystals','spintronicDevices'],subsea:['superconductors','diamondSubstrates'],orbital:['photonicCircuits','spintronicDevices'],lunar:['photonicCircuits','spintronicDevices'],dyson:['quantumCores','cryogenicResonators'],matrioshka:['quantumCores','cryogenicResonators']},
  classUpgradeMinimum:50,
  hardwareMaterialAmounts:{10:[4,1],25:[10,3],50:[24,6],100:[60,15],250:[150,40],500:[400,100]},frontierMaterialFactor:.1,materialFocusWeight:3,materialFocusQuantity:.8,
  materialQualityPowers:{circuits:0,copperCoils:.125,siliconWafers:.25,titaniumBolts:.375,photonicLenses:.5,graphene:.625,nanotubes:.75,superconductors:.875,neuralCrystals:1,quantumCores:1.125,ceramicCapacitors:.125,ferriteCores:.125,goldContacts:.25,ceramicSubstrates:.25,opticalFibers:.5,thermalInterface:.25,diamondSubstrates:.875,spintronicDevices:1,photonicCircuits:.75,cryogenicResonators:1.125},
  newMaterialWeights:{ceramicCapacitors:10000,ferriteCores:8000,goldContacts:4000,ceramicSubstrates:4000,opticalFibers:3000,thermalInterface:4000,diamondSubstrates:1200,spintronicDevices:500,photonicCircuits:1000,cryogenicResonators:40},
  materialFamilyPriority:['quantum','frontier','photonic','semiconductor','base'],
  craftingPlannerTargets:[1,5,10],
  materialPackages:{base:{cost:40,amount:12},semiconductor:{cost:80,amount:8},photonic:{cost:120,amount:6},frontier:{cost:180,amount:3},quantum:{cost:250,amount:1}},
  recoveryFraction:.6,recoveryNumerator:3,recoveryDenominator:5,legacyItemRecovery:{common:2,uncommon:3,rare:5,epic:8,legendary:12,mythic:20},salvageFragmentChance:{common:0,uncommon:0,rare:.05,epic:.10,legendary:.20,mythic:.30},salvageFragmentCap:.6,blueprintDropChance:.01,blueprintResearchThreshold:10,
  forgeSpeeds:[1,1.25,1.6,2.1,2.8],forgeLimits:[4,8,12,16,20],forgeMultipliers:[1,2,4],forgeCosts:[{circuits:200,copperCoils:40,titaniumBolts:20},{circuits:600,ceramicSubstrates:80,goldContacts:40},{circuits:1800,graphene:120,nanotubes:80,superconductors:30},{circuits:5400,superconductors:150,thermalInterface:80,diamondSubstrates:40},{circuits:16200,neuralCrystals:120,cryogenicResonators:60,quantumCores:30}],forgeBaseSeconds:600,forgeDurationGrowth:1.35,forgeMinimumSeconds:60,forgeFamilyFrom:5,forgeRareFrom:9,forgeBaseMaterialsPerLevel:4,
  extendedItemCap:.6,extendedItemPlanningTime:.1,extendedItemRunTimeCap:3600,extendedItemPairCap:5,
  challengeCatalog:{version:2,stages:69,chapters:[10,20,30,45,60,69],credits:{base:'1e6',growth:.30},data:{base:'1e3',growth:.20},compute:{base:'1e2',growth:.25},users:{base:'1e2',growth:.25},int:{base:'1',growth:.15},rewardCoefficient:.08,prestigeMaximum:10,prestigeInterval:7,compactLimits:[5,5,4,4,3,3],dataFactors:[.1,.08,.06,.04,.02,.01],inflationFactors:[100,150,225,350,500,750],networkLimits:[5,4,3,2,1,1],earlyMilestones:[10,25,50,100,250,500],minimumMilestones:[1,2,3,4,5,6],trainingTargets:[1,2,3,4,5,6],researchTargets:[1,2,3,4,5,6],areaTargets:[1,2,3,4,5,5],craftedTargets:[1,2,3,4,5,6],rarityTargets:[0,1,2,3,4,5],classPurchaseTargets:[1,2,3,4,5,6],milestones:{7:'research-queue',14:'training-queue',21:'research-repeat',35:'analysis-planner',49:'crafting-planner',69:'prestige-agent'},families:{'no-taps':{name:'Hands Off',factor:1,reward:'offline'},'no-items':{name:'Bare Metal',factor:1,reward:'mastery'},'five-hardware':{name:'Compact Stack',factor:1,reward:'legacy'},'data-crunch':{name:'Data Drought',factor:1,reward:'data'},inflation:{name:'Brutal Inflation',factor:1,reward:'ownership'},'quality-lock':{name:'Quality Lock',factor:1,reward:'quality'},'efficiency-lock':{name:'Efficiency Lock',factor:1,reward:'efficiency'},'serial-science':{name:'Serial Science',factor:1,reward:'research'},'closed-supply-chain':{name:'Closed Supply Chain',factor:1,reward:'recycling'},'fragmented-network':{name:'Fragmented Network',factor:1,reward:'neighbors'}}},

  challengeCorrections:{trainingLevelsPerStep:8,researchBudgetBase:100,researchBudgetGrowth:1.22,entryHardware:['sbc','pc','gpu','server','campus','orbital'],supplyTypes:[1,1,2,2,3,3],automationTotals:[21,42,70,140,245,350]},
  runStartCredits:50,
  hardware: {
    calculator:{name:'Taschenrechner',description:'Bescheidener Start für die erste lokale KI.',baseCost:15,growth:1.17,compute:1,role:'Tap',milestones:[{threshold:10,compute:0.12,effect:'tap',value:0.03,label:'Tap Impuls'},{threshold:25,compute:0.16,effect:'tap',value:0.06,label:'Tap Kopplung'},{threshold:50,compute:0.22,effect:'tap',value:0.09,label:'Tap Protokoll'},{threshold:100,compute:0.3,effect:'tap',value:0.12,label:'Tap Netz'},{threshold:250,compute:0.42,effect:'tap',value:0.15,label:'Tap Matrix'},{threshold:500,compute:0.6,effect:'tap',value:0.18,label:'Tap Singularität'}]},
    sbc:{name:'Einplatinencomputer',description:'Kompakte Parallelverarbeitung im Miniaturformat.',baseCost:6000,growth:1.18,compute:10,role:'Daten',milestones:[{threshold:10,compute:0.12,effect:'data',value:0.035,label:'Daten Impuls'},{threshold:25,compute:0.16,effect:'data',value:0.07,label:'Daten Kopplung'},{threshold:50,compute:0.22,effect:'data',value:0.105,label:'Daten Protokoll'},{threshold:100,compute:0.3,effect:'data',value:0.14,label:'Daten Netz'},{threshold:250,compute:0.42,effect:'data',value:0.175,label:'Daten Matrix'},{threshold:500,compute:0.6,effect:'data',value:0.21,label:'Daten Singularität'}]},
    pc:{name:'Heim-PC',description:'Mehr Kerne für ernsthafte Modelle.',baseCost:100000,growth:1.19,compute:100,role:'Nutzer',milestones:[{threshold:10,compute:0.12,effect:'users',value:0.04,label:'Nutzer Impuls'},{threshold:25,compute:0.16,effect:'users',value:0.08,label:'Nutzer Kopplung'},{threshold:50,compute:0.22,effect:'users',value:0.12,label:'Nutzer Protokoll'},{threshold:100,compute:0.3,effect:'users',value:0.16,label:'Nutzer Netz'},{threshold:250,compute:0.42,effect:'users',value:0.2,label:'Nutzer Matrix'},{threshold:500,compute:0.6,effect:'users',value:0.24,label:'Nutzer Singularität'}]},
    gpu:{name:'Gaming-GPU',description:'Aktive Impulse und parallele Inferenz.',baseCost:4000000,growth:1.2,compute:1000,role:'Overclock',milestones:[{threshold:10,compute:0.12,effect:'overclock',value:0.045,label:'Overclock Impuls'},{threshold:25,compute:0.16,effect:'overclock',value:0.09,label:'Overclock Kopplung'},{threshold:50,compute:0.22,effect:'overclock',value:0.135,label:'Overclock Protokoll'},{threshold:100,compute:0.3,effect:'overclock',value:0.18,label:'Overclock Netz'},{threshold:250,compute:0.42,effect:'overclock',value:0.225,label:'Overclock Matrix'},{threshold:500,compute:0.6,effect:'overclock',value:0.27,label:'Overclock Singularität'}]},
    rig:{name:'KI-Workstation',description:'Liefert Compute für Modelle; Trainingszeiten bleiben fest.',baseCost:75000000,growth:1.21,compute:10000,role:'Training',milestones:[{threshold:10,compute:0.12,effect:'training',value:0.05,label:'Training Impuls'},{threshold:25,compute:0.16,effect:'training',value:0.1,label:'Training Kopplung'},{threshold:50,compute:0.22,effect:'training',value:0.15,label:'Training Protokoll'},{threshold:100,compute:0.3,effect:'training',value:0.2,label:'Training Netz'},{threshold:250,compute:0.42,effect:'training',value:0.25,label:'Training Matrix'},{threshold:500,compute:0.6,effect:'training',value:0.3,label:'Training Singularität'}]},
    server:{name:'Server-Rack',description:'Stabile Basis für Automation.',baseCost:15000000000,growth:1.22,compute:90000,role:'Automation',milestones:[{threshold:10,compute:0.12,effect:'automation',value:0.055,label:'Automation Impuls'},{threshold:25,compute:0.16,effect:'automation',value:0.11,label:'Automation Kopplung'},{threshold:50,compute:0.22,effect:'automation',value:0.165,label:'Automation Protokoll'},{threshold:100,compute:0.3,effect:'automation',value:0.22,label:'Automation Netz'},{threshold:250,compute:0.42,effect:'automation',value:0.275,label:'Automation Matrix'},{threshold:500,compute:0.6,effect:'automation',value:0.33,label:'Automation Singularität'}]},
    farm:{name:'GPU-Farm',description:'Gebündelte rohe Compute-Produktion.',baseCost:120000000000,growth:1.23,compute:650000,role:'Compute',milestones:[{threshold:10,compute:0.12,effect:'compute',value:0.06,label:'Compute Impuls'},{threshold:25,compute:0.16,effect:'compute',value:0.12,label:'Compute Kopplung'},{threshold:50,compute:0.22,effect:'compute',value:0.18,label:'Compute Protokoll'},{threshold:100,compute:0.3,effect:'compute',value:0.24,label:'Compute Netz'},{threshold:250,compute:0.42,effect:'compute',value:0.3,label:'Compute Matrix'},{threshold:500,compute:0.6,effect:'compute',value:0.36,label:'Compute Singularität'}]},
    campus:{name:'Modularer Rechenzentrumscampus',description:'Verbindet frühe Hardwareklassen.',baseCost:100000000000000.0,growth:1.24,compute:5000000,role:'Synergie',milestones:[{threshold:10,compute:0.12,effect:'synergy',value:0.065,label:'Synergie Impuls'},{threshold:25,compute:0.16,effect:'synergy',value:0.13,label:'Synergie Kopplung'},{threshold:50,compute:0.22,effect:'synergy',value:0.195,label:'Synergie Protokoll'},{threshold:100,compute:0.3,effect:'synergy',value:0.26,label:'Synergie Netz'},{threshold:250,compute:0.42,effect:'synergy',value:0.325,label:'Synergie Matrix'},{threshold:500,compute:0.6,effect:'synergy',value:0.39,label:'Synergie Singularität'}]},
    cloud:{name:'Hyperscale-Cloud',description:'Skaliert die Nutzerkapazität.',baseCost:1e+20,growth:1.25,compute:40000000,role:'Nutzer',milestones:[{threshold:10,compute:0.12,effect:'users',value:0.07,label:'Nutzer Impuls'},{threshold:25,compute:0.16,effect:'users',value:0.14,label:'Nutzer Kopplung'},{threshold:50,compute:0.22,effect:'users',value:0.21,label:'Nutzer Protokoll'},{threshold:100,compute:0.3,effect:'users',value:0.28,label:'Nutzer Netz'},{threshold:250,compute:0.42,effect:'users',value:0.35,label:'Nutzer Matrix'},{threshold:500,compute:0.6,effect:'users',value:0.42,label:'Nutzer Singularität'}]},
    liquid:{name:'Flüssigkeitsgekühlte Compute-Anlage',description:'Lenkt Compute in Training und Forschung.',baseCost:1e+28,growth:1.26,compute:300000000,role:'Labor',milestones:[{threshold:10,compute:0.12,effect:'research',value:0.075,label:'Labor Impuls'},{threshold:25,compute:0.16,effect:'research',value:0.15,label:'Labor Kopplung'},{threshold:50,compute:0.22,effect:'research',value:0.225,label:'Labor Protokoll'},{threshold:100,compute:0.3,effect:'research',value:0.3,label:'Labor Netz'},{threshold:250,compute:0.42,effect:'research',value:0.375,label:'Labor Matrix'},{threshold:500,compute:0.6,effect:'research',value:0.45,label:'Labor Singularität'}]},
    subsea:{name:'Untersee-Rechenzentrum',description:'Verbessert spätere Offline-Systeme.',baseCost:1e+38,growth:1.27,compute:2000000000,role:'Offline',milestones:[{threshold:10,compute:0.12,effect:'offline',value:0.08,label:'Offline Impuls'},{threshold:25,compute:0.16,effect:'offline',value:0.16,label:'Offline Kopplung'},{threshold:50,compute:0.22,effect:'offline',value:0.24,label:'Offline Protokoll'},{threshold:100,compute:0.3,effect:'offline',value:0.32,label:'Offline Netz'},{threshold:250,compute:0.42,effect:'offline',value:0.4,label:'Offline Matrix'},{threshold:500,compute:0.6,effect:'offline',value:0.48,label:'Offline Singularität'}]},
    orbital:{name:'Orbitales Rechenzentrum',description:'Öffnet Entdeckungsforschung.',baseCost:1e+52,growth:1.28,compute:1000000000000000.0,role:'Entdeckung',milestones:[{threshold:10,compute:0.12,effect:'research',value:0.085,label:'Entdeckung Impuls'},{threshold:25,compute:0.16,effect:'research',value:0.17,label:'Entdeckung Kopplung'},{threshold:50,compute:0.22,effect:'research',value:0.255,label:'Entdeckung Protokoll'},{threshold:100,compute:0.3,effect:'research',value:0.34,label:'Entdeckung Netz'},{threshold:250,compute:0.42,effect:'research',value:0.425,label:'Entdeckung Matrix'},{threshold:500,compute:0.6,effect:'research',value:0.51,label:'Entdeckung Singularität'}]},
    lunar:{name:'Lunarer KI-Forschungskomplex',description:'Zugang zu späten Forschungszweigen.',baseCost:1e+70,growth:1.29,compute:1e+22,role:'Forschung',milestones:[{threshold:10,compute:0.12,effect:'training',value:0.09,label:'Forschung Impuls'},{threshold:25,compute:0.16,effect:'training',value:0.18,label:'Forschung Kopplung'},{threshold:50,compute:0.22,effect:'training',value:0.27,label:'Forschung Protokoll'},{threshold:100,compute:0.3,effect:'training',value:0.36,label:'Forschung Netz'},{threshold:250,compute:0.42,effect:'training',value:0.45,label:'Forschung Matrix'},{threshold:500,compute:0.6,effect:'training',value:0.54,label:'Forschung Singularität'}]},
    dyson:{name:'Fusionsbetriebener Dyson-Schwarm',description:'Spezialisierte Endgame-Produktion.',baseCost:1e+95,growth:1.3,compute:1e+35,role:'Energie',milestones:[{threshold:10,compute:0.12,effect:'compute',value:0.095,label:'Energie Impuls'},{threshold:25,compute:0.16,effect:'compute',value:0.19,label:'Energie Kopplung'},{threshold:50,compute:0.22,effect:'compute',value:0.285,label:'Energie Protokoll'},{threshold:100,compute:0.3,effect:'compute',value:0.38,label:'Energie Netz'},{threshold:250,compute:0.42,effect:'compute',value:0.475,label:'Energie Matrix'},{threshold:500,compute:0.6,effect:'compute',value:0.57,label:'Energie Singularität'}]},
    matrioshka:{name:'Matrioshka-Gehirn',description:'Bereitet die spätere Axiom-Ebene vor.',baseCost:1e+125,growth:1.31,compute:1e+55,role:'Meta',milestones:[{threshold:10,compute:0.12,effect:'research',value:0.1,label:'Meta Impuls'},{threshold:25,compute:0.16,effect:'research',value:0.2,label:'Meta Kopplung'},{threshold:50,compute:0.22,effect:'research',value:0.3,label:'Meta Protokoll'},{threshold:100,compute:0.3,effect:'research',value:0.4,label:'Meta Netz'},{threshold:250,compute:0.42,effect:'research',value:0.5,label:'Meta Matrix'},{threshold:500,compute:0.6,effect:'research',value:0.6,label:'Meta Singularität'}]},
  },
  // Legacy save registry only: shares are no longer applied to production.
  operatingProfiles:{balanced:{name:'Ausgewogen',inference:.75,training:.15,research:.10},training:{name:'Training',inference:.60,training:.30,research:.10},discovery:{name:'Entdeckung',inference:.65,training:.10,research:.25}},
  hardwareMilestones:[10,25,50,100,250,500], hardwareUnlockCount:10, hardwareUnlockINT:[0,0,0,0,0,0,0,3,8,18,45,80,130,220,350], classUpgradeCount:15, classUpgradeCostFactor:1, // legacy v20 class-upgrade fields are migration-only; no new ×2 purchase is offered
  computePerUser:1,baseRevenuePerUser:1.35,baseDataPerSecond:.1,dataBonusScale:4,researchBaseRate:.12,researchComputeScale:10,dataScale:100,
  modelQualityPerLevel:.04,modelEfficiencyPerLevel:.03,qualitySoftcap:1,efficiencySoftcap:.75,tapQualityCoefficient:.04,
  trainingDurationBaseSeconds:90,trainingDurationGrowth:1.35,trainingDurationCapSeconds:72*60*60,trainingDataBase:15,trainingDataGrowth:1.75,trainingCostFloor:.5,
  legacyTrainingBase:40,legacyTrainingGrowth:1.65,
  baseOfflineSeconds:28800,maxOfflineSeconds:86400, simulationStep: 10,
  prestigeBaseRevenue:765100329.5513278,prestigeThreshold:428_273_652_944,prestigeScale:3,prestigePower:1.5,prestigeBonusLogScale:.55,
  seasonRewards:{
    free:{regularComponents:['circuits','copperCoils','siliconWafers','titaniumBolts','photonicLenses'],regularAmounts:[6,5,4,4,3],regularGems:[5,8,10,12,15],milestoneGems:[25,40,50,65,80,100,125,150,180,250],milestoneComponents:['copperCoils','siliconWafers','titaniumBolts','photonicLenses','graphene','nanotubes','superconductors','neuralCrystals','quantumCores','quantumCores'],milestoneAmounts:[10,9,8,7,6,6,5,4,4,5]},
    premium:{regularComponents:['copperCoils','siliconWafers','titaniumBolts','photonicLenses','graphene'],regularAmounts:[10,8,7,6,5],regularGems:[15,20,25,30,40],milestoneGems:[50,75,100,125,150,200,250,300,400,600],milestoneComponents:['siliconWafers','titaniumBolts','photonicLenses','graphene','nanotubes','superconductors','neuralCrystals','quantumCores','quantumCores','quantumCores'],milestoneAmounts:[15,14,12,10,9,8,7,6,6,8]}
  },
  axiom:{threshold:{m:3,e:3},creditPerTotal:.5,resonanceCost:1,resonanceMax:10,automationCost:2,archiveCost:5},
  experimentSeconds: 14400, shortExperimentSeconds:600, introExperimentSeconds:60,
  researchCategories:{
    data:{baseData:363,baseDuration:180},analysis:{baseData:100,baseDuration:600},model:{baseData:250,baseDuration:1800},automation:{baseData:600,baseDuration:3600},
  },
  researchKeyPricePower:24,researchKeyDurationSeconds:86400,researchMinimumSeconds:60,researchAutonomousPerLevel:.02,researchAlignmentFactor:.90,researchTransferFactor:.50,researchTransferStarts:6,researchAnalysisCostFactor:.80,researchRecyclingFraction:.05,researchAutomationInterval:10,
  researchDataGrowth:1.85,researchDurationGrowth:1.35,researchDurationCapSeconds:72*60*60,
  analysisCosts:{
    hardware:{short:{data:250,duration:600},long:{data:4800,duration:4*3600}},
    architecture:{short:{data:500,duration:30*60},long:{data:6400,duration:8*3600}},
    artifact:{short:{data:2000,duration:2*3600},long:{data:19200,duration:24*3600}},
  },
  baseTapCredits:1, tapRateFraction:.2, tapLimitPerSecond:5, tapCritBase:.05, tapCritMultiplier:3, tapComboPerTap:.015, tapComboCap:50, dropBaseMultiplier:1, overclockTaps:100, overclockSeconds:15, overclockCooldownSeconds:90,
  introRewards:[25,60,120,100,100,75,250,0],
  prestigeUpgrades:{
    shoppingAgent:{name:'Einkaufsagent',cost:1,depth:1,branch:5,requires:[],requiresPrestige:true,effect:'Autobuyer für Taschenrechner und Einplatinencomputer; je Klasse schaltbar.'},
    trainingPlan:{name:'Trainingsplan',cost:3,depth:1,branch:6,requires:[],requiresPrestige:true,effect:'Zwei wartende Quality-/Efficiency-Aufträge zusätzlich zum aktiven Training.'},
    componentScanner:{name:'Komponentenscanner',cost:3,depth:1,branch:7,requires:[],requiresPrestige:true,effect:'Verdoppelt das Gewicht eines zugänglichen passiven Komponentenfunds.'},
    dataArchive1:{name:'Datenarchiv I',cost:3,depth:1,branch:0,requires:[],effect:'Gemeinsamer Data-Bonus +0,25 (B); höchste Archivstufe ersetzt niedrigere. Dauerhafter Forschungszugang: Datenwissenschaft.'},
    dataArchive2:{name:'Datenarchiv II',cost:9,depth:2,branch:0,requires:['dataArchive1'],effect:'Gemeinsamer Data-Bonus +0,60 (B); ersetzt +0,25.'},
    dataArchive3:{name:'Datenarchiv III',cost:14,depth:3,branch:0,requires:['dataArchive2'],effect:'Gemeinsamer Data-Bonus +1,25 (B); ersetzt +0,60.'},
    computeNet1:{name:'Compute-Netz I',cost:4,depth:1,branch:1,requires:[],effect:'+8 % globaler Compute je freigeschalteter Hardwareklasse. Dauerhafter Forschungszugang: Modell-/Systemarchitektur.'},
    computeNet2:{name:'Compute-Netz II',cost:11,depth:2,branch:1,requires:['computeNet1'],effect:'+15 % globaler Compute je freigeschalteter Hardwareklasse.'},
    computeNet3:{name:'Compute-Netz III',cost:18,depth:3,branch:1,requires:['computeNet2'],effect:'+30 % globaler Compute je freigeschalteter Hardwareklasse.'},
    analysis1:{name:'Analyse I',cost:5,depth:1,branch:2,requires:[],effect:'+10 % Komponentenfunde aus Analysen. Dauerhafter Forschungszugang: Material-/Bauplanforschung.'},
    analysis2:{name:'Analyse II',cost:13,depth:2,branch:2,requires:['analysis1'],effect:'+20 % Komponentenfunde aus Analysen.'},
    analysis3:{name:'Analyse III',cost:22,depth:3,branch:2,requires:['analysis2'],effect:'+30 % Komponentenfunde; jede Analyse garantiert mindestens eine seltene Komponente.'},
    labs1:{name:'Labore I',cost:6,depth:1,branch:3,requires:[],effect:'Zweiter Forschungsslot. Dauerhafter Forschungszugang: Laborautomation.'},
    labs2:{name:'Labore II',cost:15,depth:2,branch:3,requires:['labs1'],effect:'Forschungsschlange mit 2 Plätzen.'},
    labs3:{name:'Labore III',cost:26,depth:3,branch:3,requires:['labs2'],effect:'Startet die nächste Forschung automatisch, sobald die Datenmenge bezahlbar ist.'},
    manufacturing1:{name:'Fertigung I',cost:7,depth:1,branch:4,requires:[],effect:'Zweiter Item-Sockel.'},
    manufacturing2:{name:'Fertigung II',cost:17,depth:2,branch:4,requires:['manufacturing1'],effect:'Item-Upgrade-Kosten −15 %.'},
    manufacturing3:{name:'Fertigung III',cost:30,depth:3,branch:4,requires:['manufacturing2'],effect:'Vertieft die Fertigungsinfrastruktur; Basis-Module werden bereits durch Offene Baupläne freigeschaltet.'},
    dataArchive4:{name:'Datenarchiv IV',cost:28,depth:4,branch:0,requires:['dataArchive3'],effect:'Data Synergy ^1,05; Daten-Items skalieren mit seltenen Komponenten.'},
    dataArchive5:{name:'Datenarchiv V',cost:48,depth:5,branch:0,requires:['dataArchive4'],effect:'Data Synergy ^1,10.'},
    dataArchive6:{name:'Datenarchiv VI',cost:80,depth:6,branch:0,requires:['dataArchive5'],effect:'Lifetime-Daten verstärken DataPower; gemeinsamer Data-Bonusbeitrag +1,5 (B).'},
    dataArchive7:{name:'Datenarchiv VII',cost:130,depth:7,branch:0,requires:['dataArchive6'],effect:'Data Synergy ^1,05 zusätzlich; gemeinsamer Data-Bonusbeitrag +2,5 (B).'},
    dataArchive8:{name:'Datenarchiv VIII',cost:210,depth:8,branch:0,requires:['dataArchive7'],effect:'Data Synergy ^1,10 zusätzlich; gemeinsamer Data-Bonusbeitrag +4 (B).'},
    computeNet4:{name:'Compute-Netz IV',cost:34,depth:4,branch:1,requires:['computeNet3'],effect:'Hardware-Besitzsynergie ^1,05; Legacy-Infrastruktur ab 500 Stück je Klasse wird aktiv.'},
    computeNet5:{name:'Compute-Netz V',cost:58,depth:5,branch:1,requires:['computeNet4'],effect:'Klassen-Diversität wird stärker; jede Legacy-Klasse verstärkt globalen Output.'},
    computeNet6:{name:'Compute-Netz VI',cost:95,depth:6,branch:1,requires:['computeNet5'],effect:'Klassen-Diversität wächst stärker; globaler Compute ×2.'},
    computeNet7:{name:'Compute-Netz VII',cost:150,depth:7,branch:1,requires:['computeNet6'],effect:'Hardware-Besitzsynergie ^1,05 zusätzlich; Compute ×2,5.'},
    computeNet8:{name:'Compute-Netz VIII',cost:240,depth:8,branch:1,requires:['computeNet7'],effect:'Hardware- und Infrastruktur-Synergien werden zu Late-Game-Wallbreakern.'},
    analysis4:{name:'Analyse IV',cost:40,depth:4,branch:2,requires:['analysis3'],effect:'+25 % Analysegeschwindigkeit.'},
    analysis5:{name:'Analyse V',cost:68,depth:5,branch:2,requires:['analysis4'],effect:'+50 % Analysegeschwindigkeit.'},
    analysis6:{name:'Analyse VI',cost:110,depth:6,branch:2,requires:['analysis5'],effect:'Seltene Item-Sekundäreffekte ×1,25; Analysegeschwindigkeit ×2.'},
    analysis7:{name:'Analyse VII',cost:170,depth:7,branch:2,requires:['analysis6'],effect:'Legendäre/mythische Tertiäreffekte ×1,35; Analysegeschwindigkeit ×2,5.'},
    analysis8:{name:'Analyse VIII',cost:270,depth:8,branch:2,requires:['analysis7'],effect:'Item-Synergien profitieren zusätzlich von seltenen Komponenten.'},
    labs4:{name:'Labore IV',cost:46,depth:4,branch:3,requires:['labs3'],effect:'Research Synergy ^1,05 und stärkere Model↔Research-Kopplung.'},
    labs5:{name:'Labore V',cost:78,depth:5,branch:3,requires:['labs4'],effect:'Modell-Autopilot: trainiert Qualität und Effizienz automatisch im Wechsel.'},
    labs6:{name:'Labore VI',cost:125,depth:6,branch:3,requires:['labs5'],effect:'Research Synergy ×1,5; permanente Forschung skaliert mit Model-Level.'},
    labs7:{name:'Labore VII',cost:190,depth:7,branch:3,requires:['labs6'],effect:'Research Synergy ^1,05; Forschung ×2.'},
    labs8:{name:'Labore VIII',cost:300,depth:8,branch:3,requires:['labs7'],effect:'Research Synergy ^1,10; Forschung ×3.'},
    manufacturing4:{name:'Fertigung IV',cost:52,depth:4,branch:4,requires:['manufacturing3'],effect:'Item-Synergien ^1,05; Items skalieren mit Hardware, Model und Daten.'},
    manufacturing5:{name:'Fertigung V',cost:88,depth:5,branch:4,requires:['manufacturing4'],effect:'Dritter Item-Sockel.'},
    manufacturing6:{name:'Fertigung VI',cost:140,depth:6,branch:4,requires:['manufacturing5'],effect:'Sekundäre Itemeffekte stärker; Item-Synergie ^1,05.'},
    manufacturing7:{name:'Fertigung VII',cost:210,depth:7,branch:4,requires:['manufacturing6'],effect:'Tertiäre Itemeffekte stärker; Item-Synergie ^1,07.'},
    manufacturing8:{name:'Fertigung VIII',cost:330,depth:8,branch:4,requires:['manufacturing7'],effect:'Item-Synergie ^1,10; Forge/Fusion werden echte Endgame-Skalierer.'}
    ,milestoneMemory:{name:'Milestone Memory',cost:100,depth:1,branch:5,requires:[],effect:'+2 % INT-Ertragswert je unterschiedlicher Hardware-Meilensteinkante dieses Runs, maximal +100 %.'}
    ,modelSynthesis:{name:'Model Synthesis',cost:1000,depth:2,branch:5,requires:['milestoneMemory'],effect:'+3 % INT-Ertragswert je abgeschlossenem Training dieses Runs, maximal +150 %.'}
    ,researchArchive:{name:'Research Archive',cost:10000,depth:3,branch:5,requires:['modelSynthesis'],effect:'+5 % INT-Ertragswert je abgeschlossenem Forschungsauftrag dieses Runs, maximal +200 %.'}
  },
  prestigeBranches:['Datenarchiv','Compute-Netz','Analyse','Labore','Fertigung','INT-Ertrag'],
  dataArchiveBonus:[.10,.20,.30],computeNetworkPerClass:[.02,.03,.05],analysisFindBonus:[.10,.20,.30],
  impulseNetworkPerTen:.01,impulseNetworkCap:.20,atlasPerClass:.10,computeNetworkBonus:.25,feedbackMinuteCap:.5,recyclingRewards:{25:2,50:4},scannerComponents:3,scannerBlueprints:1,
  upgradeBase: 60, upgradeGrowth: 1.35, maxUpgrade: 10,
  itemBaseEffect: .08,
  scalingSynergy:{
    legacyThreshold:500,legacyPerClass:.12,legacyCapClasses:15,
    masteryPerLevel:.025,masteryCap:2.5,
    classSynergyBase:1.10,classSynergyResearchPerLevel:.0025,classSynergyPrestige:[.015,.025,.04,.06,.09],
    ownershipBases:[.005,.006,.008,.010,.013,.017,.022,.030,.040,.055,.075,.10,.14,.20,.30],
    dataPowerBase:.10,dataPowerResearchPerLevel:.004,dataPowerPrestige:[0,0,.02,.04,.07,.10,.14,.20],
    modelGlobalBase:1.06,qualityBase:1.12,efficiencyBase:1.10,modelResearchBasePerLevel:.0015,
    intBase:1.10,achievementPer25:1.10,achievementPer100:1.25,
    itemClassScaling:.03,itemMilestoneScaling:.025,itemRareScaling:.08,ownedHundredsCap:4,ownedHundredsCredit:.025,
    milestoneLateExponentPerTier:.0125,artifactBase:1.25,breakthroughBase:1.35,
  },
  rarity: {
    common: { chance: .60, factor: 1, salvage: 10, craft: [30, 0] },
    uncommon: { chance: .25, factor: 1.15, salvage: 15, craft: [60, 2] },
    rare: { chance: .10, factor: 1.35, salvage: 25, craft: [120, 10] },
    epic: { chance: .04, factor: 1.65, salvage: 40, craft: [360, 30] },
    legendary: { chance: .01, factor: 2, salvage: 60, craft: [1080, 90] },
    mythic: { chance: 0, factor: 2.6, salvage: 100, craft: [2400, 180] },
  },
  components:{
    circuits:{name:"Leiterplatten",en:"Circuit boards",rarity:'häufig',atlasCell:[0,0],source:'Alle Drops und Analysen · häufig',description:'Logik und Steuerung für frühe Baupläne.'},
    copperCoils:{name:"Kupferspulen",en:"Copper coils",rarity:'häufig',atlasCell:[1,0],source:'Alle Drops und Analysen · häufig',description:'Leistungsführung und Magnetik.'},
    siliconWafers:{name:"Siliziumwafer",en:"Silicon wafers",rarity:'ungewöhnlich',atlasCell:[2,0],source:'Alle Drops und Analysen · ungewöhnlich',description:'Substrat für dichte Rechenlogik.'},
    titaniumBolts:{name:"Titanbefestigungen",en:"Titanium fasteners",rarity:'ungewöhnlich',atlasCell:[0,1],source:'Alle Drops und Analysen · ungewöhnlich',description:'Hochfeste Struktur für Fertigung.'},
    photonicLenses:{name:"Photonische Linsen",en:"Photonic lenses",rarity:'selten',atlasCell:[1,1],source:'Alle Drops und Analysen · selten',description:'Optische Kopplung für schnelle Systeme.'},
    graphene:{name:"Graphen",en:"Graphene",rarity:'selten',atlasCell:[2,1],source:'Alle Drops und Analysen · selten',description:'Leitfähige, leichte Struktur.'},
    nanotubes:{name:"Kohlenstoffnanoröhren",en:"Carbon nanotubes",rarity:'episch',atlasCell:[0,2],source:'Alle Drops und Analysen · sehr selten',description:'Dichte nanoskalige Leiter.'},
    superconductors:{name:"Supraleitende Leiter",en:"Superconducting wires",rarity:'episch',atlasCell:[1,2],source:'Alle Drops und Analysen · extrem selten',description:'Verlustarme Hochleistungsverbindungen.'},
    neuralCrystals:{name:"Memristor-Arrays",en:"Memristor arrays",rarity:'legendär',atlasCell:[2,2],source:'Alle Drops und Analysen · Jackpot',description:'Seltene adaptive Rechenmatrix.'},
    quantumCores:{name:"Quantenprozessorkerne",en:"Quantum processor cores",rarity:'mythisch',atlasCell:[3,2],source:'Alle Drops und Analysen · Ultra-Jackpot',description:'Extrem seltener Kern für Endgame-Fertigung.'},
    ceramicCapacitors:{name:"Keramikkondensatoren",en:"Ceramic capacitors",rarity:"häufig",source:'Bezahlte Hardware, zugängliche Analysen und Drops',description:'Material für Geräte und Schmieden.'},
    ferriteCores:{name:"Ferritkerne",en:"Ferrite cores",rarity:"häufig",source:'Bezahlte Hardware, zugängliche Analysen und Drops',description:'Material für Geräte und Schmieden.'},
    goldContacts:{name:"Goldkontakte",en:"Gold contacts",rarity:"ungewöhnlich",source:'Bezahlte Hardware, zugängliche Analysen und Drops',description:'Material für Geräte und Schmieden.'},
    ceramicSubstrates:{name:"Keramiksubstrate",en:"Ceramic substrates",rarity:"ungewöhnlich",source:'Bezahlte Hardware, zugängliche Analysen und Drops',description:'Material für Geräte und Schmieden.'},
    opticalFibers:{name:"Glasfasern",en:"Optical fibers",rarity:"selten",source:'Bezahlte Hardware, zugängliche Analysen und Drops',description:'Material für Geräte und Schmieden.'},
    thermalInterface:{name:"Wärmeleitmaterial",en:"Thermal interface material",rarity:"ungewöhnlich",source:'Bezahlte Hardware, zugängliche Analysen und Drops',description:'Material für Geräte und Schmieden.'},
    diamondSubstrates:{name:"Diamantsubstrate",en:"Diamond substrates",rarity:"episch",source:'Bezahlte Hardware, zugängliche Analysen und Drops',description:'Material für Geräte und Schmieden.'},
    spintronicDevices:{name:"Spintronik-Bauteile",en:"Spintronic devices",rarity:"legendär",source:'Bezahlte Hardware, zugängliche Analysen und Drops',description:'Material für Geräte und Schmieden.'},
    photonicCircuits:{name:"Photonische Schaltkreise",en:"Photonic circuits",rarity:"selten",source:'Bezahlte Hardware, zugängliche Analysen und Drops',description:'Material für Geräte und Schmieden.'},
    cryogenicResonators:{name:"Kryogene Resonatoren",en:"Cryogenic resonators",rarity:"mythisch",source:'Bezahlte Hardware, zugängliche Analysen und Drops',description:'Material für Geräte und Schmieden.'},
  },
  // Jede Quelle enthält jede Komponente. Progression verschiebt nur Gewichte; nichts wird hart gegated.
  componentSources:{
    hardware:{circuits:450000,copperCoils:300000,siliconWafers:140000,titaniumBolts:70000,photonicLenses:25000,graphene:9000,nanotubes:4000,superconductors:1500,neuralCrystals:450,quantumCores:50,ceramicCapacitors:0,ferriteCores:0,goldContacts:0,ceramicSubstrates:0,opticalFibers:0,thermalInterface:0,diamondSubstrates:0,spintronicDevices:0,photonicCircuits:0,cryogenicResonators:0},
    architecture:{circuits:180000,copperCoils:160000,siliconWafers:190000,titaniumBolts:130000,photonicLenses:90000,graphene:55000,nanotubes:24000,superconductors:9000,neuralCrystals:1800,quantumCores:200,ceramicCapacitors:0,ferriteCores:0,goldContacts:0,ceramicSubstrates:0,opticalFibers:0,thermalInterface:0,diamondSubstrates:0,spintronicDevices:0,photonicCircuits:0,cryogenicResonators:0},
    artifact:{circuits:80000,copperCoils:70000,siliconWafers:90000,titaniumBolts:80000,photonicLenses:100000,graphene:110000,nanotubes:70000,superconductors:30000,neuralCrystals:9000,quantumCores:1000,ceramicCapacitors:0,ferriteCores:0,goldContacts:0,ceramicSubstrates:0,opticalFibers:0,thermalInterface:0,diamondSubstrates:0,spintronicDevices:0,photonicCircuits:0,cryogenicResonators:0},
  },
  worldDropWeights:{circuits:450000,copperCoils:300000,siliconWafers:140000,titaniumBolts:70000,photonicLenses:25000,graphene:9000,nanotubes:4000,superconductors:1500,neuralCrystals:450,quantumCores:50,ceramicCapacitors:0,ferriteCores:0,goldContacts:0,ceramicSubstrates:0,opticalFibers:0,thermalInterface:0,diamondSubstrates:0,spintronicDevices:0,photonicCircuits:0,cryogenicResonators:0},
  worldDropSeconds:45,
  passiveCircuitSecondsPerClass:3600, hardwareMilestoneTitanium:1, gamingGpuMilestoneLaser:1,
  modules:{computeBus:{name:'Compute-Bus',ingredients:{circuits:10,copperCoils:6,siliconWafers:4,titaniumBolts:4},data:250,effect:'compute'},dataLattice:{name:'Daten-Gitter',ingredients:{graphene:6,nanotubes:3,photonicLenses:4,circuits:8},data:500,effect:'data'}},
  craftingSeconds:{module:60,common:300,uncommon:900,rare:3600,epic:14400,legendary:43200,mythic:86400},
  itemMaterialFamilies:{
    'impulse-relay':{base:'copperCoils',rare:'superconductors'},'insight-archive':{base:'neuralCrystals',rare:'quantumCores'},
    'quantum-chip':{base:'siliconWafers',rare:'superconductors'},'neural-asic':{base:'siliconWafers',rare:'superconductors'},'memory-crystal':{base:'siliconWafers',rare:'superconductors'},'tensor-core':{base:'siliconWafers',rare:'superconductors'},
    'photonic-array':{base:'photonicLenses',rare:'neuralCrystals'},'logic-seed':{base:'photonicLenses',rare:'neuralCrystals'},'lab-drone':{base:'photonicLenses',rare:'neuralCrystals'},'data-prism':{base:'photonicLenses',rare:'neuralCrystals'},
    'field-scanner':{base:'graphene',rare:'quantumCores'},
    ...({"inference-router":{"base":"siliconWafers","rare":"superconductors"},"burst-processor":{"base":"copperCoils","rare":"superconductors"},"legacy-controller":{"base":"copperCoils","rare":"superconductors"},"sparse-decoder":{"base":"siliconWafers","rare":"superconductors"},"photonic-matrix":{"base":"photonicLenses","rare":"neuralCrystals"},"quantum-coupler":{"base":"quantumCores","rare":"cryogenicResonators"},"distillation-module":{"base":"photonicLenses","rare":"neuralCrystals"},"curriculum-module":{"base":"siliconWafers","rare":"superconductors"},"long-term-memory":{"base":"siliconWafers","rare":"superconductors"},"cryocontroller":{"base":"quantumCores","rare":"cryogenicResonators"},"manufacturing-controller":{"base":"siliconWafers","rare":"superconductors"},"diagnostic-adapter":{"base":"siliconWafers","rare":"superconductors"},"experiment-controller":{"base":"siliconWafers","rare":"superconductors"},"precision-scanner":{"base":"photonicLenses","rare":"neuralCrystals"},"recycling-probe":{"base":"photonicLenses","rare":"neuralCrystals"},"blueprint-archive":{"base":"neuralCrystals","rare":"quantumCores"},"protocol-controller":{"base":"siliconWafers","rare":"superconductors"},"photonic-analyzer":{"base":"photonicLenses","rare":"neuralCrystals"},"quantum-diagnostic-module":{"base":"quantumCores","rare":"cryogenicResonators"}} as const),
  },
  itemUpgradeMaterials:{uncommon:{base:4,rare:0},rare:{base:12,rare:0},epic:{base:30,rare:2},legendary:{base:75,rare:8},mythic:{base:180,rare:25}},
  blueprintMasteryCosts:[10,25,60,150],blueprintMasteryFactors:[1,.95,.90,.85,.80],researchFragmentConversionRate:10,
  itemCombinations:{
    'compute-credit-link':{kind:'credits-bonus',effects:['compute','credits'],value:.08,legacy:true},
    'training-research-link':{kind:'research-bonus',effects:['training','research'],value:.12,legacy:true},
    'parallel-architecture':{kind:'compute-factor',items:[{slot:'processor',type:'quantum-chip'},{slot:'core',type:'tensor-core'}],value:1.20,legacy:false},
    'learning-pipeline':{kind:'training-bonus',items:[{slot:'processor',type:'photonic-array'},{slot:'core',type:'logic-seed'}],value:.50,legacy:false},
    'material-mapping':{kind:'analysis-components-factor',items:[{slot:'research',type:'field-scanner'},{slot:'core',type:'memory-crystal'}],value:1.25,legacy:false},
  } as const,
  itemRecipes:{
    'impulse-relay':{rarity:'common' as const,name:'Impulsrelais-Bauplan',ingredients:{circuits:12,copperCoils:2,siliconWafers:0,titaniumBolts:0,photonicLenses:0,graphene:0,nanotubes:0,superconductors:0,neuralCrystals:0,quantumCores:0},blueprints:0,data:0,modules:{},duration:300},
    // Entry crafting recipe: intentionally avoids jackpot-tier materials. The first crafted item
    // teaches the manufacturing loop; ultra-rare components remain goals for later recipes/fusion.
    'quantum-chip':{rarity:'common' as const,name:'Quantenchip-Bauplan',ingredients:{circuits:30,copperCoils:12,siliconWafers:18,titaniumBolts:8,photonicLenses:2,graphene:1,nanotubes:0,superconductors:0,neuralCrystals:0,quantumCores:0},blueprints:4,data:1800,modules:{computeBus:1}},
    'neural-asic':{rarity:'common' as const,name:'Neural-ASIC-Bauplan',ingredients:{circuits:40,copperCoils:12,siliconWafers:24,titaniumBolts:10,photonicLenses:5,graphene:8,nanotubes:4,superconductors:0,neuralCrystals:1,quantumCores:0},blueprints:5,data:2400,modules:{dataLattice:1}},
    'field-scanner':{rarity:'common' as const,name:'Feldscanner-Bauplan',ingredients:{circuits:20,copperCoils:14,siliconWafers:10,titaniumBolts:12,photonicLenses:14,graphene:8,nanotubes:5,superconductors:1,neuralCrystals:0,quantumCores:0},blueprints:5,data:3000,modules:{computeBus:1,dataLattice:1}},
    'data-prism':{rarity:'common' as const,name:'Datenprisma-Bauplan',ingredients:{circuits:20,copperCoils:8,siliconWafers:14,titaniumBolts:8,photonicLenses:10,graphene:12,nanotubes:4,superconductors:1,neuralCrystals:0,quantumCores:0},blueprints:5,data:2800,modules:{dataLattice:1}},
    'insight-archive':{rarity:'common' as const,name:'Erkenntnisarchiv-Bauplan',ingredients:{circuits:100,copperCoils:0,siliconWafers:20,titaniumBolts:0,photonicLenses:0,graphene:0,nanotubes:0,superconductors:0,neuralCrystals:5,quantumCores:0},blueprints:0,data:0,modules:{},duration:3600},
    // Auftrag 9C: fixed starting catalogue; balance has not been established.
    'photonic-array':{rarity:'common' as const,name:'Photonenfeld-Bauplan',research:'blueprints' as const,ingredients:{circuits:20,copperCoils:8,siliconWafers:12,titaniumBolts:0,photonicLenses:6,graphene:0,nanotubes:0,superconductors:0,neuralCrystals:0,quantumCores:0},blueprints:6,data:1200,modules:{computeBus:1},duration:900},
    'memory-crystal':{rarity:'common' as const,name:'Speicherkristall-Bauplan',research:'blueprints' as const,ingredients:{circuits:16,copperCoils:0,siliconWafers:16,titaniumBolts:0,photonicLenses:0,graphene:6,nanotubes:0,superconductors:0,neuralCrystals:2,quantumCores:0},blueprints:6,data:1800,modules:{dataLattice:1},duration:1200},
    'logic-seed':{rarity:'common' as const,name:'Logik-Saat-Bauplan',research:'blueprints' as const,ingredients:{circuits:12,copperCoils:0,siliconWafers:10,titaniumBolts:0,photonicLenses:0,graphene:4,nanotubes:2,superconductors:0,neuralCrystals:1,quantumCores:0},blueprints:6,data:1500,modules:{dataLattice:1},duration:900},
    'tensor-core':{rarity:'common' as const,name:'Tensor-Kern-Bauplan',research:'blueprints' as const,ingredients:{circuits:36,copperCoils:0,siliconWafers:20,titaniumBolts:12,photonicLenses:0,graphene:6,nanotubes:4,superconductors:2,neuralCrystals:0,quantumCores:0},blueprints:8,data:3000,modules:{computeBus:1,dataLattice:1},duration:1800},
    'lab-drone':{rarity:'common' as const,name:'Labordrohne-Bauplan',research:'blueprints' as const,ingredients:{circuits:24,copperCoils:12,siliconWafers:0,titaniumBolts:16,photonicLenses:8,graphene:0,nanotubes:4,superconductors:0,neuralCrystals:0,quantumCores:1},blueprints:10,data:3600,modules:{computeBus:1,dataLattice:1},duration:1800},
    ...({"inference-router":{"rarity":"common","name":"Inferenz-Router-Bauplan","ingredients":{"circuits":40,"copperCoils":10,"siliconWafers":14,"goldContacts":7},"blueprints":6,"data":2400,"modules":{"computeBus":1,"dataLattice":1},"duration":1200},"burst-processor":{"rarity":"common","name":"Burst-Prozessor-Bauplan","ingredients":{"circuits":20,"copperCoils":8,"ceramicCapacitors":4},"blueprints":4,"data":1000,"modules":{},"duration":600},"legacy-controller":{"rarity":"common","name":"Legacy-Controller-Bauplan","ingredients":{"circuits":8,"copperCoils":6,"ferriteCores":4},"blueprints":4,"data":1000,"modules":{},"duration":600},"sparse-decoder":{"rarity":"common","name":"Sparse-Decoder-Bauplan","ingredients":{"circuits":20,"copperCoils":6,"siliconWafers":8,"ceramicSubstrates":4},"blueprints":4,"data":1000,"modules":{},"duration":600},"photonic-matrix":{"rarity":"common","name":"Photonik-Matrix-Bauplan","ingredients":{"circuits":60,"copperCoils":14,"photonicLenses":20,"photonicCircuits":10},"blueprints":8,"data":6000,"modules":{"computeBus":1,"dataLattice":1},"duration":2400},"quantum-coupler":{"rarity":"common","name":"Quantenkoppler-Bauplan","ingredients":{"circuits":80,"copperCoils":18,"quantumCores":26,"cryogenicResonators":13},"blueprints":10,"data":12000,"modules":{"computeBus":1,"dataLattice":1},"duration":3600},"distillation-module":{"rarity":"common","name":"Distillationsmodul-Bauplan","ingredients":{"circuits":60,"copperCoils":14,"graphene":20,"opticalFibers":10},"blueprints":8,"data":6000,"modules":{"computeBus":1,"dataLattice":1},"duration":2400},"curriculum-module":{"rarity":"common","name":"Curriculum-Modul-Bauplan","ingredients":{"circuits":20,"copperCoils":6,"siliconWafers":8,"ceramicSubstrates":4},"blueprints":4,"data":1000,"modules":{},"duration":600},"long-term-memory":{"rarity":"common","name":"Langzeitspeicher-Bauplan","ingredients":{"circuits":20,"copperCoils":6,"siliconWafers":8,"goldContacts":4},"blueprints":4,"data":1000,"modules":{},"duration":600},"cryocontroller":{"rarity":"common","name":"Kryocontroller-Bauplan","ingredients":{"circuits":80,"copperCoils":18,"quantumCores":26,"cryogenicResonators":13},"blueprints":10,"data":12000,"modules":{"computeBus":1,"dataLattice":1},"duration":3600},"manufacturing-controller":{"rarity":"common","name":"Fertigungscontroller-Bauplan","ingredients":{"circuits":40,"copperCoils":10,"titaniumBolts":14,"thermalInterface":7},"blueprints":6,"data":2400,"modules":{"computeBus":1,"dataLattice":1},"duration":1200},"diagnostic-adapter":{"rarity":"common","name":"Diagnoseadapter-Bauplan","ingredients":{"circuits":20,"copperCoils":6,"siliconWafers":8,"goldContacts":4},"blueprints":4,"data":1000,"modules":{},"duration":600},"experiment-controller":{"rarity":"common","name":"Versuchscontroller-Bauplan","ingredients":{"circuits":40,"copperCoils":10,"siliconWafers":14,"opticalFibers":7},"blueprints":6,"data":2400,"modules":{"computeBus":1,"dataLattice":1},"duration":1200},"precision-scanner":{"rarity":"common","name":"Präzisionsscanner-Bauplan","ingredients":{"circuits":40,"copperCoils":10,"photonicLenses":14,"opticalFibers":7},"blueprints":6,"data":2400,"modules":{"computeBus":1,"dataLattice":1},"duration":1200},"recycling-probe":{"rarity":"common","name":"Recycling-Sonde-Bauplan","ingredients":{"circuits":40,"copperCoils":10,"graphene":14,"photonicCircuits":7},"blueprints":6,"data":2400,"modules":{"computeBus":1,"dataLattice":1},"duration":1200},"blueprint-archive":{"rarity":"common","name":"Bauplanarchiv-Bauplan","ingredients":{"circuits":60,"copperCoils":14,"neuralCrystals":20,"spintronicDevices":10},"blueprints":8,"data":6000,"modules":{"computeBus":1,"dataLattice":1},"duration":2400},"protocol-controller":{"rarity":"common","name":"Protokollcontroller-Bauplan","ingredients":{"circuits":40,"copperCoils":10,"goldContacts":14,"ceramicSubstrates":7},"blueprints":6,"data":2400,"modules":{"computeBus":1,"dataLattice":1},"duration":1200},"photonic-analyzer":{"rarity":"common","name":"Photonik-Analysator-Bauplan","ingredients":{"circuits":60,"copperCoils":14,"photonicLenses":20,"photonicCircuits":10},"blueprints":8,"data":6000,"modules":{"computeBus":1,"dataLattice":1},"duration":2400},"quantum-diagnostic-module":{"rarity":"common","name":"Quanten-Diagnosemodul-Bauplan","ingredients":{"circuits":80,"copperCoils":18,"quantumCores":26,"cryogenicResonators":13},"blueprints":10,"data":12000,"modules":{"computeBus":1,"dataLattice":1},"duration":3600}} as const),
  },
  experimentRewards: {
    hardware: { components: 45, blueprints: 1, research: 0, itemChance: 0 },
    architecture: { components: 20, blueprints: 0, research: 2, itemChance: 0 },
    artifact: { components: 20, blueprints: 2, research: 0, itemChance: .06 },
  },
  breakthroughs: { distillation: [10, .15], graph: [20, .20], planning: [30, .20] },
  gemShop:{labSlots:[500,1500],offline:[{hours:12,cost:250},{hours:16,cost:500},{hours:24,cost:1000}],crafting:[{seconds:1800,cost:20},{seconds:14400,cost:120}],training:[{seconds:900,cost:15},{seconds:3600,cost:45}],materials:{circuits:{cost:30,amount:50},advanced:{cost:60,copperCoils:10,siliconWafers:10}},labBoost:[80,3600],boostCap:86400},researchLabMax:4,equipmentSlotCosts:[1e9,1e20],
  achievementTierGems:[2,4,8,12],achievementPointsPerTier:[2,4,8,12],achievementResearchPerTen:.01,achievementResearchCap:.20,
  missionRewards:{daily:{task:2,bonus:6},weekly:{task:5,bonus:30},monthly:{task:15,bonus:120}},
  hardwareAutobuyerUnlock:100,hardwareAutobuyerInterval:5,
  adLimits: { creditBoost: 8, components: 12, creditDrop: 12 },
  researchProjects:{
    operations:{name:'Labororganisation',balanceCategory:'automation',effect:'Erweitert die durch labs2 freigeschaltete Queue von zwei auf vier wartende Aufträge.'},
    blueprints:{name:'Offene Baupläne',balanceCategory:'analysis',effect:'Schaltet fortgeschrittene Itemrezepte frei.'},
    alignment:{name:'Reproduzierbare Modelle',balanceCategory:'model',effect:'Grunddauer zukünftiger Trainings ×0,90.'},
    dataPipeline:{name:'Datenpipeline',balanceCategory:'data',effect:'Zukünftige Analysen bezahlen 80 % ihrer regulären Data-Kosten.'},
    distributedInference:{name:'Verteilte Inferenz',balanceCategory:'model',effect:'Verbindet benachbarte Hardwareklassen: 25 Vorgänger verstärken bis zu zehn Nachfolger.'},
    modelTransfer:{name:'Modelltransfer',balanceCategory:'model',effect:'Die ersten sechs Trainingsstarts jedes Runs: Grunddauer ×0,50.'},
    materialRecycling:{name:'Materialrecycling',balanceCategory:'analysis',effect:'5 % der reservierten Komponenten je hergestelltem Item zurück.'},
    researchScheduling:{name:'Forschungsplanung',balanceCategory:'automation',effect:'Schaltet zusammen mit labs4 den Forschungsdirektor frei.'},
  },
  repeatableResearch:{
    dataGeneration:{name:'Datenerzeugung',category:'Infrastruktur',balanceCategory:'data',effectPerLevel:.02,requires:null,effect:'Mehr Daten aus bestehenden Nutzern.'},
    materialAnalysis:{name:'Materialanalyse',category:'Analyse',balanceCategory:'analysis',effectPerLevel:.08,requires:'dataGeneration',effect:'Mehr garantierte Komponenten aus Analysen.'},
    blueprintAnalysis:{name:'Bauplananalyse',category:'Analyse',balanceCategory:'analysis',effectPerLevel:.10,requires:'materialAnalysis',effect:'Mehr Bauplanfragmente aus Analysen.'},
    modelArchitecture:{name:'Modellarchitektur',category:'Modelle',balanceCategory:'model',effectPerLevel:.18,requires:'dataGeneration',effect:'Multiplikativer Umsatz-Sprung pro Stufe; skaliert dauerhaft über Prestiges.'},
    computeOptimization:{name:'Compute-Optimierung',category:'Infrastruktur',balanceCategory:'model',effectPerLevel:.16,requires:'modelArchitecture',effect:'Multiplikativer globaler Compute-Bonus pro Stufe.'},
    userScaling:{name:'Nutzer-Skalierung',category:'Modelle',balanceCategory:'model',effectPerLevel:.14,requires:'computeOptimization',effect:'Multiplikative Nutzerkapazität pro Stufe.'},
    hardwareIntegration:{name:'Hardware-Integration',category:'Infrastruktur',balanceCategory:'model',effectPerLevel:.12,requires:'userScaling',effect:'Verstärkt späte Hardwareklassen exponentiell.'},
    labAutomation:{name:'Laborautomation',category:'Automation',balanceCategory:'automation',effectPerLevel:.05,requires:'blueprintAnalysis',effect:'Beschleunigt Analysen.'},
    commercialization:{name:'Kommerzialisierung',category:'Ökonomie',balanceCategory:'model',effectPerLevel:.15,requires:'modelArchitecture',effect:'Multiplikativer Umsatz pro Nutzer; verbindet Modellqualität mit Monetarisierung.'},
    networkEffects:{name:'Netzwerkeffekte',category:'Ökonomie',balanceCategory:'model',effectPerLevel:.018,requires:'commercialization',effect:'Nutzerzahl erzeugt einen logarithmisch skalierenden Umsatzmultiplikator.'},
    parallelArchitecture:{name:'Parallele Architektur',category:'Compute',balanceCategory:'model',effectPerLevel:.035,requires:'computeOptimization',effect:'Jede freigeschaltete Hardwareklasse verstärkt Compute pro Forschungsstufe.'},
    hardwareCoDesign:{name:'Hardware-Co-Design',category:'Compute',balanceCategory:'model',effectPerLevel:.006,requires:'parallelArchitecture',effect:'Model-Level und Hardwareklassen verstärken gemeinsam den Compute.'},
    syntheticData:{name:'Synthetische Daten',category:'Daten',balanceCategory:'model',effectPerLevel:.012,requires:'dataGeneration',effect:'Model-Level verstärkt die Datenerzeugung.'},
    dataFlywheel:{name:'Data Flywheel',category:'Daten',balanceCategory:'model',effectPerLevel:.01,requires:'syntheticData',effect:'Exponentiert die gesamte Data-Synergy pro Stufe.'},
    recursiveLearning:{name:'Rekursives Lernen',category:'Modelle',balanceCategory:'model',effectPerLevel:.008,requires:'modelArchitecture',effect:'Exponentiert die globale Model-Synergy pro Stufe.'},
    autonomousScience:{name:'Autonome Wissenschaft',category:'Automation',balanceCategory:'automation',effectPerLevel:.02,requires:'labAutomation',effect:'+0,02 Laborleistungsbonus je Level; Voraussetzung des Forschungsdirektors.'},
    tapAmplification:{name:'Impulsverstärkung',category:'Aktiv',balanceCategory:'model',effectPerLevel:.12,requires:'computeOptimization',effect:'Jede Stufe verstärkt aktive Taps multiplikativ.'},
    dropProtocols:{name:'Signalprotokolle',category:'Aktiv',balanceCategory:'analysis',effectPerLevel:.08,requires:'materialAnalysis',effect:'Erhöht Häufigkeit und Qualität aktiver Signal-Drops.'},
  },
} as const;

export type Rarity = keyof typeof BALANCE.rarity;
export type ComponentId=keyof typeof BALANCE.components;
export type ComponentInventory=Record<ComponentId,number>;
export type ModuleId=keyof typeof BALANCE.modules;
export type ModuleInventory=Record<ModuleId,number>;
export type ItemSlot = 'processor' | 'core' | 'research';
export type ItemEffect = ExpandedItemRole | 'relay'|'int-yield'|'compute' | 'credits' | 'data' | 'research' | 'training' | 'experiment' | 'components' | 'tap' | 'drop';
export type ExpandedItemId=keyof typeof extendedItemCatalog;
export type ExpandedItemRole=typeof extendedItemCatalog[ExpandedItemId]['role'];
export type ItemTypeId = ExpandedItemId | 'impulse-relay'|'insight-archive'|'quantum-chip'|'neural-asic'|'photonic-array'|'memory-crystal'|'logic-seed'|'tensor-core'|'field-scanner'|'lab-drone'|'data-prism';
export type ExperimentId = keyof typeof BALANCE.experimentRewards;
export type BreakthroughId = keyof typeof BALANCE.breakthroughs;
export type PrestigeUpgradeId=keyof typeof BALANCE.prestigeUpgrades;
export type HardwareId=keyof typeof BALANCE.hardware;
export type OperatingProfileId=keyof typeof BALANCE.operatingProfiles;
export type ResearchProjectId=keyof typeof BALANCE.researchProjects;
export type RepeatableResearchId=keyof typeof BALANCE.repeatableResearch;
export type ResearchId=ResearchProjectId|RepeatableResearchId;
export type TrainingTrack='quality'|'efficiency';
export type TrainingCostBasis={targetLevel:number;baseDataCostExact:ScientificJSON;factor:number;bonusTotal:number;sources:Record<string,number>};
export type ActiveTraining={durationBasis?:{baseDuration:number;alignment:number;modelTransfer:number;runStart:number};costBasis?:TrainingCostBasis;track:TrainingTrack;workRequired:number;creditCost:number;dataCost?:number;dataCostExact?:ScientificJSON;startedAt?:number;baseDuration?:number;startingRate?:number;onlineWork?:number;offlineWork?:number};
export type QueuedTraining={track:TrainingTrack;targetLevel:number};
export type ResearchStartBasis={planningFactor?:number;baseDuration:number;sources:Record<string,ScientificJSON>;bonusTotal:ScientificJSON;laborFactor:number;temporaryFactors:{labBoost:number;overclock:number;deviceSwitch?:number};minimumApplied:boolean};
export type ResearchTarget={id:ResearchId;targetLevel:number};
export type ResearchDirector={enabled:boolean;entries:ResearchTarget[];reservePercent:0|.25|.5|.75;budget:ScientificJSON|null;spent:ScientificJSON;mode:'strict'|'affordable';elapsed:number};
export type ActiveResearch={jobId?:string;quoteBasis?:ResearchStartBasis;id:ResearchId;level:number;startedAt:number;endsAt:number;durationSeconds:number;dataCost:number;dataCostExact?:ScientificJSON};
export type OverclockChannel='credits'|'training'|'research';
export type Item = { id: string; type: ItemTypeId; rarity: Rarity; level: number; locked: boolean; forge?:number;relayTaps?:number;challengeCopy?:true;materialBasis?:Partial<ComponentInventory>;recoveryUsed?:Partial<ComponentInventory> };
export type LootDrop={id:string;spawnedAt:number;expiresAt:number;x?:number;y?:number;variant?:'coin'|'cache'|'core'};
export type ExperimentLength='intro'|'short'|'long';
export type Experiment = { id: string; type: ExperimentId; length:ExperimentLength; startedAt: number; endsAt: number; durationSeconds?:number;creditCost?:number;dataCost?:number;combinationFactor?:number; rewardFactor?:number; contractVersion?:1|2|3;materialContract?:import('./materialEconomy').MaterialContract };
export type AnalysisResult={id:string;type:ExperimentId;length:Exclude<ExperimentLength,'intro'>;at:number;mode:'active'|'offline';components:Partial<ComponentInventory>;blueprintFragments:number;researchFragments:number};
export type ProgressMetric='hardwareBought'|'milestones'|'trainingStarted'|'trainingCompleted'|'researchStarted'|'researchCompleted'|'componentsEarned'|'itemsCrafted'|'dropsClaimed'|'itemsFused'|'forgeUpgrades'|'regularCredits'|'regularData'|'taps'|'overclocks'|'prestiges'|'activeSeconds';
export type MissionTask={id:string;metric:ProgressMetric;goal:number;baseline:number;reward:number;claimed:boolean;de:string;en:string};
export type MissionPeriod={key:string;endsAt:number;tasks:MissionTask[];required:number;bonus:number;bonusClaimed:boolean};
export type LifetimeStats={calculatorsBought:number;hardwareBought:number;hardwareClasses:HardwareId[];milestones:number;prestiges:number;intEarned:number;labSeconds:number;researchStarted:number;researchCompleted:number;trainingStarted:number;trainingCompleted:number;itemsCrafted:number;itemTypes:ItemTypeId[];taps:number;overclocks:number;componentsEarned:number;dropsClaimed:number;itemsFused:number;forgeUpgrades:number;regularCredits:number;regularData:number;activeSeconds:number};
export type GemLedgerEntry={id:string;at:number;amount:number;source:string};
export type SeasonState={id:string;startedAt:number;endsAt:number;xp:number;claimed:number[]};
export type PreviousSeason=SeasonState&{claimUntil:number};
export type PinnedGoalState={kind:'hardware'|'research'|'recipe'|'prestige'|'item-craft'|'item-upgrade'|'blueprint-mastery';id:string;target?:number};
export type ProfileMessage={id:string;title:string;body:string;at:number};
export type PlayerProfile={playerName:string;artifacts:string[];completedSeasons:string[];readMessages:string[];inbox:ProfileMessage[]};
export type ChallengeRunState={id:string;runId:string;startedAt:number;eligibleAtStart:ScientificJSON;stage?:number;catalogVersion?:0|1|2;networkLinks?:HardwareId[];metrics?:import('./challengeStages').ChallengeMetrics;loadout?:Item[]};
export type RetentionState={hardwareMasteryXp:Record<HardwareId,number>;challengeStars:number;claimedChallenges:string[];activeRun:ChallengeRunState|null;runCompletions:Record<string,number>;runBestSeconds:Record<string,number>};
export type CraftingReservation={components:Partial<ComponentInventory>;modules:Partial<ModuleInventory>;data:number;blueprints:number};
export type CraftingJob={masteryLevel?:number;fragmentContract?:'legacy-reserved';id:string;kind:'module'|'item';recipeId:ModuleId|ItemTypeId;quantity:number;completed:number;durationPerUnit:number;startedAt:number|null;endsAt:number|null;ingredients:CraftingReservation;result:{kind:'module'|'item';id:ModuleId|ItemTypeId;rarity?:Rarity}};
export type CraftingState={active:CraftingJob|null;queue:CraftingJob[]};
export type AxiomUpgradeId='axiomResonance'|'axiomAutomation'|'axiomArchive'|'anchoredShoppingAgent'|'analysisPlanner'|'craftingPlanner'|'prestigeAgent';
export const axiomUpgradeIds:AxiomUpgradeId[]=['axiomResonance','axiomAutomation','axiomArchive'];
export type AxiomUpgradeLevels=Record<'axiomResonance'|'axiomAutomation'|'axiomArchive',number>;
export const axiomUpgradeCost=(id:AxiomUpgradeId)=>id==='axiomResonance'?BALANCE.axiom.resonanceCost:id==='axiomAutomation'||id==='prestigeAgent'?BALANCE.axiom.automationCost:id==='axiomArchive'?BALANCE.axiom.archiveCost:1;
export type ChallengeSession={main:GameState;anchor:number;report:import('./simulation').AdvanceReport};
export type GameState = {
  materials:import('./materialEconomy').MaterialProgress;foundries:import('./foundries').FoundryState[];deviceProgress:import('./deviceEffects').DeviceProgress;challengeStages:Record<string,number>;challengeUnlocks:string[];
  challengeSession?:ChallengeSession;challengeReturn?:{runId:string;success:boolean;report:import('./simulation').AdvanceReport};challengeMigrationNotice?:'legacy-challenge-recovered';
  researchAccessIds:ResearchId[];researchRepeat:{enabled:boolean;id:RepeatableResearchId|null;targetLevel:number};researchDirector:ResearchDirector;runTrainingStarted:number;craftingRecycleRemainders:ComponentInventory;
  blueprintMastery:Record<ItemTypeId,number>;craftedItemCounts:Record<ItemTypeId,number>;craftedItemTypes:ItemTypeId[];discoveredComponents:ComponentId[];fragmentConversionRevision:number;
  learnedRecipes?:(keyof typeof BALANCE.itemRecipes)[];researchAreas?:ResearchAreaId[];aiName:string|null;credits:number;data:number;researchPoints:number;axioms:number;availableAxioms:number;totalAxiomsEarned:number;axiomResetCount:number;axiomUpgrades:AxiomUpgradeId[];axiomUpgradeLevels:AxiomUpgradeLevels;exactAxioms:{available:ScientificJSON;total:ScientificJSON};analysisPlanner:{enabled:boolean;type:ExperimentId;length:Exclude<ExperimentLength,'intro'>;elapsed:number};craftingPlanner:{enabled:boolean;recipeId:ItemTypeId;target:1|5|10;elapsed:number};prestigeAgent:{enabled:boolean;minimumReward:ScientificJSON;minimumRunMinutes:15|30|60|120;waitForTraining?:boolean;waitForAnalysis?:boolean;waitForJobs?:boolean;elapsed:number;lastReason?:string};runStartedAt:number;runMilestoneEdges:string[];runTrainingCompleted:number;runResearchCompleted:number;insightArchiveBlueprint:boolean;operatingProfile:OperatingProfileId;completedResearch:ResearchProjectId[];researchLevels:Record<RepeatableResearchId,number>;researchLabs:(ActiveResearch|null)[];researchQueue:ResearchId[];purchasedResearchLabs:number; hardware:number; hardwareCounts:Record<HardwareId,number>; classUpgrades:HardwareId[]; discovered:HardwareId[]; level:number; qualityLevel:number; efficiencyLevel:number; training:number; activeTraining:ActiveTraining|null; trainingQueue:QueuedTraining[]; offlineCapacitySeconds:number; savedAt:number; clockOffsetMs:number;
  runCreditsEarned:number; lifetimeCreditsEarned:number; lifetimeEligibleCredits:number;cycleEligibleCredits:number; prestigeEntitlementClaimed:number; totalINTEarned:number;cycleINTEarned:number; unspentINT:number; spentINT:number; prestigeCount:number; exactEconomy:ExactEconomy;
  nodes:string[]; modules:ModuleInventory; scannerRewards:string[];runRecyclingRewards:string[];gems:number; welcomeGiftClaimed:boolean; components:number; componentInventory:ComponentInventory; componentRemainder:number; archivePassiveFindCount:number; passiveCircuitProgress:number; worldDropProgress:number; lootDrops:LootDrop[]; researchRemainder:number; blueprintRemainder:number; researchFragments:number; blueprintFragments:number; impulseRelayBlueprint:boolean;
  breakthroughs:BreakthroughId[]; inventory:Item[]; equipped:Partial<Record<ItemSlot,string>>; purchasedEquipmentSlots:number;unlockedEquipmentSlots:number; pity:{rare:number;epic:number;legendary:number};
  experiments:{active:Experiment|null;queue:ExperimentId[];repeat:ExperimentId|null;completedIds:string[];firstReward:boolean;lastResult:AnalysisResult|null};
  crafting:CraftingState;
  automation:{enabled:boolean;reserve:number;reservePercent?:number;shoppingElapsed?:number;elapsed:number;target:HardwareId|null};hardwareAutoBuyers:Partial<Record<HardwareId,boolean>>;scannerTarget:ComponentId|null;retention:RetentionState;season:SeasonState;previousSeason:PreviousSeason|null;pinnedGoal:PinnedGoalState|null;profile:PlayerProfile;missions:{daily:MissionPeriod;weekly:MissionPeriod;monthly:MissionPeriod;mailbox:{id:string;gems:number}[]};lifetime:LifetimeStats;runMilestoneClasses:HardwareId[];achievementClaims:string[];achievementPoints:number;gemLedger:GemLedgerEntry[];processedGemPurchases:string[];trainingBoostUntil:number;labBoostUntil:number;creditBoostUntil:number; overclock:{taps:number;charged:boolean;activeUntil:number;cooldownUntil:number;channel?:OverclockChannel};feedback:{windowStartedAt:number;work:number};
  onboarding:{completed:string[];claimed:string[]}; legacySpecialization:string|null;
  ads:{day:string;counts:Record<string,number>;transactions:string[]}; settings:{effects:boolean;buyMode:1|10|'max';musicEnabled:boolean;musicVolume:number;sfxMuted:boolean;sfxVolume:number;hapticsEnabled:boolean;language:'en'|'de'|'es'|'fr'|'pt'|'it'|'pl';numberFormat:'auto'|'scientific'|'engineering'}; testSave:boolean; nextId:number; telemetry:LocalTelemetry;story:StoryState;
};


export const MAX_ECONOMY_VALUE=1e300;
export function safeEconomy(value:number){if(Number.isNaN(value)||value<0)return 0;if(value===Infinity)return MAX_ECONOMY_VALUE;if(value===-Infinity)return 0;return Math.min(MAX_ECONOMY_VALUE,value);}
export const safeEconomyAdd=(a:number,b:number)=>safeEconomy(safeEconomy(a)+safeEconomy(b));
export const safeEconomyMul=(a:number,b:number)=>{a=safeEconomy(a);b=safeEconomy(b);if(a===0||b===0)return 0;const log=Math.log10(a)+Math.log10(b);return log>=300?MAX_ECONOMY_VALUE:safeEconomy(a*b);};
export const safeEconomyPow=(base:number,exponent:number)=>{if(base<=0)return 0;const log=Math.log10(base)*exponent;return log>=300?MAX_ECONOMY_VALUE:safeEconomy(base**exponent);};
export type ExactEconomy={credits:ScientificJSON;data:ScientificJSON;researchPoints:ScientificJSON;lifetimeDataGenerated:ScientificJSON;runCreditsEarned:ScientificJSON;lifetimeCreditsEarned:ScientificJSON;lifetimeEligibleCredits:ScientificJSON;cycleEligibleCredits:ScientificJSON;prestigeEntitlementClaimed:ScientificJSON;totalINTEarned:ScientificJSON;cycleINTEarned:ScientificJSON;unspentINT:ScientificJSON;spentINT:ScientificJSON};
export type ResourceCost={credits?:number;data?:number};
export const exactEconomyKeys=(['credits','data','researchPoints','lifetimeDataGenerated','runCreditsEarned','lifetimeCreditsEarned','lifetimeEligibleCredits','cycleEligibleCredits','prestigeEntitlementClaimed','totalINTEarned','cycleINTEarned','unspentINT','spentINT'] as const) satisfies readonly (keyof ExactEconomy)[];
const validResourceNumber=(value:unknown):value is number=>typeof value==='number'&&Number.isFinite(value)&&value>=0;
const exactFrom=(s:Partial<GameState>,key:keyof ExactEconomy,fallback:number)=>{
 if(!validResourceNumber(fallback))throw new RangeError(`Invalid ${key} projection`);
 const raw=s.exactEconomy?.[key];
 if(raw===undefined)return ScientificNumber.from(fallback);
 const stored=ScientificNumber.fromJSON(raw);
 // An old noncanonical pair must retain its value even if its native shadow was stale.
 if(raw.m!==stored.mantissa||raw.e!==stored.exponent)return stored;
 // Compatibility for legacy callers that replace scalar fields. Never replace a
 // scientific value beyond the projection cap with its capped native shadow.
 if(stored.exponent>300||(stored.exponent===300&&stored.mantissa>1))return stored;
 const projected=stored.toNumber(MAX_ECONOMY_VALUE);
 return Math.abs(projected-fallback)>Math.max(1,Math.abs(fallback))*1e-12?ScientificNumber.from(fallback):stored;
};
const exactSet=(s:GameState,key:keyof ExactEconomy,value:ScientificNumber):GameState=>{
 const projected=value.toNumber(MAX_ECONOMY_VALUE);
 const nearest=Math.round(projected);
 const normalized=Number.isFinite(projected)&&Math.abs(projected-nearest)<=Number.EPSILON*Math.max(1,Math.abs(projected))*16?nearest:projected;
 if(key==='lifetimeDataGenerated')return {...s,exactEconomy:{...s.exactEconomy,[key]:value.toJSON()}};return {...s,[key]:normalized,exactEconomy:{...s.exactEconomy,[key]:value.toJSON()}};
};
export function exactEconomyValue(s:GameState,key:keyof ExactEconomy){const fallback=key==='lifetimeDataGenerated'?s.lifetime.regularData:(s[key as keyof GameState] as number);return exactFrom(s,key,fallback)}
export const validEconomyValues=(s:GameState,keys:readonly (keyof ExactEconomy)[]=exactEconomyKeys)=>{try{return keys.every(key=>ScientificNumber.isValid(exactEconomyValue(s,key)));}catch{return false;}};
/** Normalize valid historical ledger pairs without changing the save schema. */
export function normalizeExactEconomy(s:GameState){let next=s;for(const key of exactEconomyKeys)next=exactSet(next,key,exactEconomyValue(s,key));const available=axiomEconomyValue(next,'available'),total=axiomEconomyValue(next,'total');return {...next,axioms:available.toNumber(MAX_ECONOMY_VALUE),availableAxioms:available.toNumber(MAX_ECONOMY_VALUE),totalAxiomsEarned:total.toNumber(MAX_ECONOMY_VALUE),exactAxioms:{available:available.toJSON(),total:total.toJSON()}};}

export function formatScientific(value:ScientificNumber,digits=2,mode:'auto'|'scientific'|'engineering'='auto'){
 if(value.isZero())return '0';
 const log=value.log10();
 if(mode==='auto'&&log<15){const n=value.toNumber();return new Intl.NumberFormat('de-DE',{maximumFractionDigits:digits,notation:Math.abs(n)>=1e6?'compact':'standard'}).format(n);}
 return value.toDisplayString(digits,mode==='engineering');
}
export function formatExactEconomy(s:GameState,key:keyof ExactEconomy,digits=2){return formatScientific(exactEconomyValue(s,key),digits,s.settings.numberFormat)}
export function canAffordScientificCreditCost(s:GameState,cost:ScientificNumber,reserve=0){return ScientificNumber.isValid(cost)&&validResourceNumber(reserve)&&validEconomyValues(s,['credits'])&&exactEconomyValue(s,'credits').compare(cost.add(ScientificNumber.from(reserve)))>=0}
export const scientificProduct=(...values:(ScientificNumber|number)[])=>values.reduce<ScientificNumber>((out,value)=>out.multiply(typeof value==='number'?ScientificNumber.from(Math.max(0,value)):value),ScientificNumber.from(1));
export function exactEconomyJSON(s:GameState){return Object.fromEntries(exactEconomyKeys.map(key=>[key,exactEconomyValue(s,key).toJSON()])) as unknown as ExactEconomy}
export function canAffordResources(s:Pick<GameState,'credits'|'data'|'exactEconomy'>,cost:ResourceCost){if(!cost||typeof cost!=='object'||Array.isArray(cost)||(cost.credits!==undefined&&!validResourceNumber(cost.credits))||(cost.data!==undefined&&!validResourceNumber(cost.data)))return false;try{return exactFrom(s,'credits',s.credits).compare(ScientificNumber.from(cost.credits??0))>=0&&exactFrom(s,'data',s.data).compare(ScientificNumber.from(cost.data??0))>=0;}catch{return false;}}
export function spendResources<T extends GameState>(s:T,cost:ResourceCost):T{if(!canAffordResources(s,cost))return s;return spendScientificResources(s,ScientificNumber.from(cost.credits??0),ScientificNumber.from(cost.data??0));}
export function spendScientificCredits<T extends GameState>(s:T,cost:ScientificNumber):T{if(!canAffordScientificCreditCost(s,cost))return s;return exactSet(s,'credits',exactEconomyValue(s,'credits').subtract(cost)) as T;}
export function canAffordScientificResources(s:GameState,credits=ScientificNumber.zero(),data=ScientificNumber.zero()){return ScientificNumber.isValid(credits)&&ScientificNumber.isValid(data)&&validEconomyValues(s,['credits','data'])&&exactEconomyValue(s,'credits').compare(credits)>=0&&exactEconomyValue(s,'data').compare(data)>=0;}
export function spendScientificResources<T extends GameState>(s:T,credits=ScientificNumber.zero(),data=ScientificNumber.zero()):T{if(!canAffordScientificResources(s,credits,data))return s;let next=exactSet(s,'credits',exactEconomyValue(s,'credits').subtract(credits));next=exactSet(next,'data',exactEconomyValue(next,'data').subtract(data));return next as T;}
export function addDataScientific(s:GameState,gain:ScientificNumber){if(!ScientificNumber.isValid(gain)||!validEconomyValues(s,['data','lifetimeDataGenerated']))return s;let next=exactSet(s,'data',exactEconomyValue(s,'data').add(gain));next=exactSet(next,'lifetimeDataGenerated',exactEconomyValue(s,'lifetimeDataGenerated').add(gain));return {...next,lifetime:{...s.lifetime,regularData:safeEconomyAdd(s.lifetime.regularData,gain.toNumber(MAX_ECONOMY_VALUE))}};}
/** Restore reserved Data without counting a cancellation as newly produced Data. */
export function refundDataScientific(s:GameState,value:ScientificNumber){return ScientificNumber.isValid(value)&&validEconomyValues(s,['data'])?exactSet(s,'data',exactEconomyValue(s,'data').add(value)):s;}
export function addData(s:GameState,value:number){return validResourceNumber(value)?addDataScientific(s,ScientificNumber.from(value)):s;}
export function addResearchScientific(s:GameState,gain:ScientificNumber){return ScientificNumber.isValid(gain)&&validEconomyValues(s,['researchPoints'])?exactSet(s,'researchPoints',exactEconomyValue(s,'researchPoints').add(gain)):s;}

export const dayKey=(ms:number)=>new Date(ms).toISOString().slice(0,10);
export const weekKey=(ms:number)=>{const d=new Date(ms); const day=(d.getUTCDay()+6)%7; d.setUTCDate(d.getUTCDate()-day); return dayKey(d.getTime())};
const emptyPeriod=(key:string,endsAt:number):MissionPeriod=>({key,endsAt,tasks:[],required:0,bonus:0,bonusClaimed:false});
const lifetime=():LifetimeStats=>({calculatorsBought:0,hardwareBought:0,hardwareClasses:[],milestones:0,prestiges:0,intEarned:0,labSeconds:0,researchStarted:0,researchCompleted:0,trainingStarted:0,trainingCompleted:0,itemsCrafted:0,itemTypes:[],taps:0,overclocks:0,componentsEarned:0,dropsClaimed:0,itemsFused:0,forgeUpgrades:0,regularCredits:0,regularData:0,activeSeconds:0});
/** Start capital is a balance assignment, never earned income or a reward. */
export const runStartContract=()=>({credits:BALANCE.runStartCredits,hardware:0,hardwareCounts:Object.fromEntries(hardwareIds.map(id=>[id,0])) as Record<HardwareId,number>,creditLedger:ScientificNumber.from(BALANCE.runStartCredits).toJSON()});
export const initializeRun=(s:GameState):GameState=>{const start=runStartContract();return {...s,credits:start.credits,hardware:start.hardware,hardwareCounts:start.hardwareCounts,automation:{...s.automation,elapsed:0,shoppingElapsed:0},exactEconomy:{...s.exactEconomy,credits:start.creditLedger}};};
/** Effective route to the first paid calculator, including permanent legacy unlocks. */
export const automaticRestartAvailable=(s:GameState)=>shoppingAgentUnlocked(s)&&s.hardwareAutoBuyers.calculator===true;
export const newGame=(now=Date.now(),campaignId='unassigned'):GameState=>initializeRun({materials:{families:[],legacyMaterials:[],milestones:[],classUpgrades:[],hardwareRemainders:emptyComponentInventory(),salvageRemainders:emptyComponentInventory(),analysisRemainders:emptyComponentInventory(),knownBlueprints:[],researchProgress:{data:0,architecture:0,model:0,materials:0,automation:0},focus:null},foundries:[],deviceProgress:{qualityCompletions:0,efficiencyCompletions:0,lastTrack:null,lastResearchArea:null},challengeStages:{},challengeUnlocks:[],blueprintMastery:Object.fromEntries(Object.keys(BALANCE.itemRecipes).map(id=>[id,0])) as Record<ItemTypeId,number>,craftedItemCounts:Object.fromEntries(Object.keys(BALANCE.itemRecipes).map(id=>[id,0])) as Record<ItemTypeId,number>,craftedItemTypes:[],discoveredComponents:[],fragmentConversionRevision:0,researchAccessIds:[],researchRepeat:{enabled:false,id:null,targetLevel:1},researchDirector:{enabled:false,entries:[],reservePercent:0,budget:null,spent:{m:0,e:0},mode:'strict',elapsed:0},runTrainingStarted:0,craftingRecycleRemainders:{circuits:0,copperCoils:0,siliconWafers:0,titaniumBolts:0,photonicLenses:0,graphene:0,nanotubes:0,superconductors:0,neuralCrystals:0,quantumCores:0,ceramicCapacitors:0,ferriteCores:0,goldContacts:0,ceramicSubstrates:0,opticalFibers:0,thermalInterface:0,diamondSubstrates:0,spintronicDevices:0,photonicCircuits:0,cryogenicResonators:0},learnedRecipes:[],researchAreas:[],aiName:null,credits:0,data:0,researchPoints:0,axioms:0,availableAxioms:0,totalAxiomsEarned:0,axiomResetCount:0,axiomUpgrades:[],axiomUpgradeLevels:{axiomResonance:0,axiomAutomation:0,axiomArchive:0},exactAxioms:{available:{m:0,e:0},total:{m:0,e:0}},analysisPlanner:{enabled:false,type:'hardware',length:'short',elapsed:0},craftingPlanner:{enabled:false,recipeId:'quantum-chip',target:1,elapsed:0},prestigeAgent:{enabled:false,minimumReward:{m:3,e:0},minimumRunMinutes:60,waitForTraining:true,waitForAnalysis:true,elapsed:0,lastReason:'disabled'},runStartedAt:now,runMilestoneEdges:[],runTrainingCompleted:0,runResearchCompleted:0,insightArchiveBlueprint:false,operatingProfile:'balanced',completedResearch:[],researchLevels:{dataGeneration:0,materialAnalysis:0,blueprintAnalysis:0,modelArchitecture:0,computeOptimization:0,userScaling:0,hardwareIntegration:0,labAutomation:0,commercialization:0,networkEffects:0,parallelArchitecture:0,hardwareCoDesign:0,syntheticData:0,dataFlywheel:0,recursiveLearning:0,autonomousScience:0,tapAmplification:0,dropProtocols:0},researchLabs:[null,null,null,null],researchQueue:[],purchasedResearchLabs:0,hardware:0,hardwareCounts:{calculator:0,sbc:0,pc:0,gpu:0,rig:0,server:0,farm:0,campus:0,cloud:0,liquid:0,subsea:0,orbital:0,lunar:0,dyson:0,matrioshka:0},classUpgrades:[],discovered:[],level:0,qualityLevel:0,efficiencyLevel:0,training:0,activeTraining:null,trainingQueue:[],offlineCapacitySeconds:BALANCE.baseOfflineSeconds,savedAt:now,clockOffsetMs:0,runCreditsEarned:0,lifetimeCreditsEarned:0,lifetimeEligibleCredits:0,cycleEligibleCredits:0,prestigeEntitlementClaimed:0,totalINTEarned:0,cycleINTEarned:0,unspentINT:0,spentINT:0,prestigeCount:0,exactEconomy:{credits:{m:0,e:0},data:{m:0,e:0},researchPoints:{m:0,e:0},lifetimeDataGenerated:{m:0,e:0},runCreditsEarned:{m:0,e:0},lifetimeCreditsEarned:{m:0,e:0},lifetimeEligibleCredits:{m:0,e:0},cycleEligibleCredits:{m:0,e:0},prestigeEntitlementClaimed:{m:0,e:0},totalINTEarned:{m:0,e:0},cycleINTEarned:{m:0,e:0},unspentINT:{m:0,e:0},spentINT:{m:0,e:0}},nodes:[],modules:{computeBus:0,dataLattice:0},scannerRewards:[],runRecyclingRewards:[],gems:50,welcomeGiftClaimed:true,components:0,componentInventory:{circuits:0,copperCoils:0,siliconWafers:0,titaniumBolts:0,photonicLenses:0,graphene:0,nanotubes:0,superconductors:0,neuralCrystals:0,quantumCores:0,ceramicCapacitors:0,ferriteCores:0,goldContacts:0,ceramicSubstrates:0,opticalFibers:0,thermalInterface:0,diamondSubstrates:0,spintronicDevices:0,photonicCircuits:0,cryogenicResonators:0},componentRemainder:0,archivePassiveFindCount:0,passiveCircuitProgress:0,worldDropProgress:0,lootDrops:[],researchRemainder:0,blueprintRemainder:0,researchFragments:0,blueprintFragments:0,impulseRelayBlueprint:false,breakthroughs:[],inventory:[],equipped:{},purchasedEquipmentSlots:0,unlockedEquipmentSlots:0,pity:{rare:0,epic:0,legendary:0},experiments:{active:null,queue:[],repeat:null,completedIds:[],firstReward:false,lastResult:null},crafting:{active:null,queue:[]},automation:{enabled:false,reserve:0,reservePercent:0,shoppingElapsed:0,elapsed:0,target:null},hardwareAutoBuyers:{},scannerTarget:null,retention:{hardwareMasteryXp:Object.fromEntries(hardwareIds.map(id=>[id,0])) as Record<HardwareId,number>,challengeStars:0,claimedChallenges:[],activeRun:null,runCompletions:{},runBestSeconds:{}},season:{id:'season-01',startedAt:now,endsAt:now+30*86400000,xp:0,claimed:[]},previousSeason:null,pinnedGoal:null,profile:{playerName:'Operator',artifacts:[],completedSeasons:[],readMessages:[],inbox:[{id:'progression-v2',title:'Progression V2',body:'Langzeit-Achievements, 6/12/30 Missionen, Hardware-Mastery und der erweiterte INT-Baum sind live.',at:now},{id:'season-01',title:'Season 01 · Boot Sequence',body:'Die erste 30-Tage Neural Season ist gestartet. Erledige Missionen, sammle Season XP und sichere dir das Boot Sequence Core Artifact.',at:now}]},missions:{daily:emptyPeriod(dayKey(now),now),weekly:emptyPeriod(weekKey(now),now),monthly:emptyPeriod('',now),mailbox:[]},lifetime:lifetime(),runMilestoneClasses:[],achievementClaims:[],achievementPoints:0,gemLedger:[],processedGemPurchases:[],trainingBoostUntil:0,labBoostUntil:0,creditBoostUntil:0,overclock:{taps:0,charged:false,activeUntil:0,cooldownUntil:0,channel:'credits'},feedback:{windowStartedAt:now,work:0},onboarding:{completed:[],claimed:[]},legacySpecialization:null,ads:{day:dayKey(now),counts:{},transactions:[]},settings:{effects:true,buyMode:1,musicEnabled:false,musicVolume:.25,sfxMuted:false,sfxVolume:.5,hapticsEnabled:false,language:'de',numberFormat:'auto'},testSave:false,nextId:1,telemetry:newTelemetry(now,campaignId),story:newStory()});

export const upgradeLevel=(s:GameState,id:PrestigeUpgradeId)=>s.nodes.includes(id)||s.nodes.includes(`${id}:1`)?1:0;
export const hasNode=(s:GameState,b:string,t:number)=>upgradeLevel(s,b as PrestigeUpgradeId)>=t;
export const researchQueueUnlocked=(s:GameState)=>hasNode(s,'labs2',1)||s.challengeUnlocks.includes('research-queue');
export const researchRepeatUnlocked=(s:GameState)=>hasNode(s,'labs3',1)||s.challengeUnlocks.includes('research-repeat');
export const trainingQueueUnlocked=(s:GameState)=>hasNode(s,'trainingPlan',1)||s.challengeUnlocks.includes('training-queue');
export const automationFeatureUnlocked=(s:GameState,id:'analysisPlanner'|'craftingPlanner')=>s.axiomUpgrades.includes(id)||s.challengeUnlocks.includes(id==='analysisPlanner'?'analysis-planner':'crafting-planner');
export const deepPrestigeBonus=(s:GameState,branch:'data'|'compute'|'analysis'|'labs'|'manufacturing')=>{const tiers=branch==='data'?['dataArchive4','dataArchive5','dataArchive6','dataArchive7','dataArchive8']:branch==='compute'?['computeNet4','computeNet5','computeNet6','computeNet7','computeNet8']:branch==='analysis'?['analysis4','analysis5','analysis6','analysis7','analysis8']:branch==='labs'?['labs4','labs6','labs7','labs8']:['manufacturing4','manufacturing6','manufacturing7','manufacturing8'];const values=branch==='data'?[.5,1,1.5,2.5,4]:branch==='compute'?[.25,.5,1,1.5,2.5]:branch==='analysis'?[.25,.5,1,1.5,2.5]:branch==='labs'?[.25,.5,1,2]:[.2,.4,.75,1.25];return tiers.reduce((sum,id,i)=>sum+(hasNode(s,id,1)?values[i]:0),0);};
export const itemTypes:Record<ItemTypeId,{name:string;slot:ItemSlot;effect:ItemEffect}>={
 'impulse-relay':{name:'Impulsrelais',slot:'processor',effect:'relay'},'insight-archive':{name:'Erkenntnisarchiv',slot:'research',effect:'int-yield'},
 'quantum-chip':{name:'Quantenchip',slot:'processor',effect:'compute'},'neural-asic':{name:'Neural-ASIC',slot:'processor',effect:'credits'},'photonic-array':{name:'Photonenfeld',slot:'processor',effect:'training'},
 'memory-crystal':{name:'Speicherkristall',slot:'core',effect:'credits'},'logic-seed':{name:'Logik-Saat',slot:'core',effect:'training'},'tensor-core':{name:'Tensor-Kern',slot:'core',effect:'compute'},
 'field-scanner':{name:'Feldscanner',slot:'research',effect:'experiment'},'lab-drone':{name:'Labordrohne',slot:'research',effect:'research'},'data-prism':{name:'Datenprisma',slot:'research',effect:'data'},...Object.fromEntries(Object.entries(extendedItemCatalog).map(([id,v])=>[id,{name:v.name,slot:v.slot,effect:v.role}]))} as Record<ItemTypeId,{name:string;slot:ItemSlot;effect:ItemEffect}>;
export const rarityRank=(r:Rarity)=>(['common','uncommon','rare','epic','legendary','mythic'] as Rarity[]).indexOf(r);
export const itemEffect=(i:Item)=>BALANCE.itemBaseEffect*BALANCE.rarity[i.rarity].factor*(1+.18*i.level)*(1+.12*(i.forge??0));
export const equippedItems=(s:GameState)=>Object.values(s.equipped).map(id=>s.inventory.find(i=>i.id===id)).filter((i):i is Item=>!!i);
export const legacyHardwareClasses=(s:GameState)=>hardwareIds.filter(id=>s.hardwareCounts[id]>=BALANCE.scalingSynergy.legacyThreshold).length;
export const totalReachedMilestones=(s:GameState)=>hardwareIds.reduce((n,id)=>n+reachedMilestones(id,s.hardwareCounts[id]).length,0);
export const rareComponentTypesOwned=(s:GameState)=>['graphene','nanotubes','superconductors','neuralCrystals','quantumCores'].filter(id=>s.discoveredComponents.includes(id as ComponentId)).length;
export const itemScalingMultiplier=(s:GameState,i:Item)=>{
 const base=1+s.discovered.length*BALANCE.scalingSynergy.itemClassScaling+totalReachedMilestones(s)*BALANCE.scalingSynergy.itemMilestoneScaling;
 const rank=rarityRank(i.rarity),rare=(i.type==='data-prism'||i.type==='field-scanner')?rareComponentTypesOwned(s)*BALANCE.scalingSynergy.itemRareScaling:0;
 const legacy=i.type==='quantum-chip'?legacyHardwareClasses(s)*.10:0,ownership=i.type==='neural-asic'?hardwareIds.reduce((n,id)=>n+Math.sqrt(Math.max(0,s.hardwareCounts[id]))*.004,0):0;
 return base+rare+legacy+ownership+Math.max(0,rank-1)*.12;
};
/** Rarity controls effect count: common/uncommon=1, rare/epic=2, legendary/mythic=3. */
export const itemEffectProfile=(i:Item):ItemEffect[]=>{
 const primary=itemTypes[i.type].effect,rank=rarityRank(i.rarity),extended=BALANCE.extendedItems[i.type as keyof typeof BALANCE.extendedItems];if(extended)return [primary,...(rank>=2?[extended.secondary]:[]),...(rank>=4?[extended.tertiary]:[])];
 const secondary:Partial<Record<ItemTypeId,ItemEffect>>={'impulse-relay':'relay','insight-archive':'int-yield','quantum-chip':'tap','neural-asic':'compute','photonic-array':'tap','memory-crystal':'data','logic-seed':'research','tensor-core':'training','field-scanner':'drop','lab-drone':'data','data-prism':'credits'};
 const tertiary:Partial<Record<ItemTypeId,ItemEffect>>={'impulse-relay':'relay','insight-archive':'int-yield','quantum-chip':'research','neural-asic':'tap','photonic-array':'credits','memory-crystal':'research','logic-seed':'tap','tensor-core':'credits','field-scanner':'research','lab-drone':'drop','data-prism':'research'};
 return [primary,...(rank>=2?[secondary[i.type]!] :[]),...(rank>=4?[tertiary[i.type]!] :[])];
};
export const itemEffectFor=(s:GameState,i:Item,e:ItemEffect)=>{const effects=itemEffectProfile(i);if(!effects.includes(e))return 0;const position=effects.indexOf(e),baseWeight=position===0?1:position===1?.65:.40,prestigeWeight=position===1?(hasNode(s,'analysis6',1)?1.25:1):position===2?(hasNode(s,'analysis7',1)?1.35:1):1;return itemEffect(i)*itemScalingMultiplier(s,i)*baseWeight*prestigeWeight;};
export const equippedBonus=(s:GameState,e:ItemEffect)=>s.retention.activeRun?.id==='no-items'?0:equippedItems(s).reduce((n,i)=>n+itemEffectFor(s,i,e),0)*(1+deepPrestigeBonus(s,'manufacturing'));
/** Ratio against the same-context canonical Common/level-0/forge-0 instance.
 * Shared amplifiers apply equally to both values, never again to the special reward. */
export function specialItemEffectQuote(s:GameState,item:Item){
 const effect=item.type==='impulse-relay'?'relay':item.type==='insight-archive'?'int-yield':null;if(!effect)return null;
 const baseline={...item,rarity:'common' as const,level:0,forge:0},amplifier=1+deepPrestigeBonus(s,'manufacturing'),effectiveValue=itemEffectFor(s,item,effect)*amplifier,baselineValue=itemEffectFor(s,baseline,effect)*amplifier,scale=baselineValue>0?effectiveValue/baselineValue:0;
 const active=s.retention.activeRun?.id!=='no-items'&&s.inventory.some(i=>i.id===item.id)&&s.equipped[itemTypes[item.type].slot]===item.id;
 return{type:item.type,effect:effect as 'relay'|'int-yield',active,scale,effectiveValue,baselineValue,triggerInterval:effect==='relay'?10:null,bonusSeconds:effect==='relay'?2*scale:0,intWeightContribution:effect==='int-yield'?.25*scale:0,appliedBonusSeconds:active&&effect==='relay'?2*scale:0,appliedIntWeightContribution:active&&effect==='int-yield'?.25*scale:0,futureIncomeOnly:effect==='int-yield'};
}
export const itemSynergyExponent=(s:GameState)=>1+(hasNode(s,'manufacturing4',1)?.05:0)+(hasNode(s,'manufacturing6',1)?.05:0)+(hasNode(s,'manufacturing7',1)?.07:0)+(hasNode(s,'manufacturing8',1)?.10:0);
export type ItemCombinationId=keyof typeof BALANCE.itemCombinations;
export type CombinationRequirement={slot:ItemSlot|null;type:ItemTypeId|null;effect:ItemEffect|null;instanceId:string|null;matched:boolean};
/** Pure equipment-only quote. Legacy effect matching deliberately retains its original semantics. */
export function itemCombinationQuote(s:GameState,id:ItemCombinationId){
 const definition=BALANCE.itemCombinations[id],neededItems:CombinationRequirement[]='items' in definition?definition.items.map(required=>{
  const item=s.inventory.find(i=>i.id===s.equipped[required.slot]&&i.type===required.type&&itemTypes[i.type].slot===required.slot);
  const matched=!!item&&equipmentSlots.indexOf(required.slot)<equipmentSlotCount(s);
  return{...required,effect:null,instanceId:item?.id??null,matched};
 }):definition.effects.map(effect=>{const item=equippedItems(s).find(i=>itemEffectProfile(i).includes(effect));return{slot:item?itemTypes[item.type].slot:null,type:item?.type??null,effect,instanceId:item?.id??null,matched:!!item};});
 const disabled=!definition.legacy&&s.retention.activeRun?.id==='no-items',active=!disabled&&neededItems.every(i=>i.matched),multiplicative=definition.kind==='compute-factor'||definition.kind==='analysis-components-factor';
 return{id,kind:definition.kind,legacy:definition.legacy,neededItems,missingEquipment:neededItems.filter(i=>!i.matched),active,disabled,configuredValue:definition.value,contribution:active?definition.value:multiplicative?1:0};
}
export const itemCombinationQuotes=(s:GameState)=>(Object.keys(BALANCE.itemCombinations) as ItemCombinationId[]).map(id=>itemCombinationQuote(s,id));
export const itemCombinationBonus=(s:GameState,e:'credits'|'research')=>itemCombinationQuote(s,e==='credits'?'compute-credit-link':'training-research-link').contribution;

export const componentIds=Object.keys(BALANCE.components) as ComponentId[];
export function emptyComponentInventory():ComponentInventory{return Object.fromEntries(componentIds.map(id=>[id,0])) as ComponentInventory;}
export const componentTotal=(inventory:ComponentInventory)=>componentIds.reduce((sum,id)=>sum+inventory[id],0);
export function grantComponents(s:GameState,grant:Partial<ComponentInventory>){const componentInventory={...s.componentInventory};for(const id of componentIds)componentInventory[id]+=Math.max(0,Math.floor(grant[id]??0));const gained=componentTotal(componentInventory)-componentTotal(s.componentInventory);const discoveredComponents=[...s.discoveredComponents];for(const id of componentIds)if(componentInventory[id]>s.componentInventory[id]&&!discoveredComponents.includes(id))discoveredComponents.push(id);return{...s,discoveredComponents,componentInventory,components:componentTotal(componentInventory),lifetime:{...s.lifetime,componentsEarned:s.lifetime.componentsEarned+gained}};}
export function spendComponents(s:GameState,cost:Partial<ComponentInventory>){if(componentIds.some(id=>s.componentInventory[id]<(cost[id]??0)))return s;const componentInventory={...s.componentInventory};for(const id of componentIds)componentInventory[id]-=cost[id]??0;return{...s,componentInventory,components:componentTotal(componentInventory)};}
export const hardwareIds=Object.keys(BALANCE.hardware) as HardwareId[];
export const reachedMilestones=(id:HardwareId,count:number)=>BALANCE.hardware[id].milestones.filter(m=>count>=m.threshold);
export const milestoneFactor=(id:HardwareId,count:number)=>reachedMilestones(id,count).reduce((factor,m)=>factor*(1+m.compute),1);
export type MilestoneEffect=(typeof BALANCE.hardware)[HardwareId]['milestones'][number]['effect'];
export const milestoneBonus=(s:GameState,effect:MilestoneEffect)=>hardwareIds.reduce((sum,id)=>sum+reachedMilestones(id,s.hardwareCounts[id]).filter(m=>m.effect===effect).reduce((n,m)=>n+m.value,0),0);
export type MilestoneSynergy={compute:number;revenue:number;data:number;research:number;users:number;infrastructureExponent:number;dataExponent:number;modelExponent:number;itemExponent:number};
export const milestoneSynergy=(s:GameState):MilestoneSynergy=>{const out:MilestoneSynergy={compute:1,revenue:1,data:1,research:1,users:1,infrastructureExponent:1,dataExponent:1,modelExponent:1,itemExponent:1};for(const [index,id] of hardwareIds.entries()){const count=s.hardwareCounts[id];for(const threshold of [10,25,50,100,250,500] as const){if(count<threshold)continue;const tier=index+1,late=Math.max(0,index-6);if(threshold===10)out.compute*=1+0.04+tier*.004;if(threshold===25)out.compute*=1+0.06+tier*.005;if(threshold===50){out.compute*=1+0.08+tier*.006;out.users*=1+0.02+tier*.003;}if(threshold===100){out.revenue*=1+0.08+tier*.008;out.data*=1+0.04+tier*.004;}if(threshold===250){out.research*=1+0.10+tier*.01;out.data*=1+0.06+tier*.005;}if(threshold===500){out.revenue*=1+0.12+tier*.012;out.compute*=1+0.10+tier*.01;if(late>0)out.infrastructureExponent+=late*BALANCE.scalingSynergy.milestoneLateExponentPerTier/9;if(index>=10)out.dataExponent+=.01+(index-10)*.005;if(index>=11)out.modelExponent+=.008+(index-11)*.004;if(index>=12)out.itemExponent+=.006+(index-12)*.004;}}}return out;};
export const costModifier=(s?:GameState)=>s?.retention.activeRun?.id==='inflation'?100:1;
export const hardwareCostScientific=(id:HardwareId,owned:number,s?:GameState)=>{if(!hardwareIds.includes(id)||!Number.isSafeInteger(owned)||owned<0)throw new RangeError('Invalid hardware price request');return ScientificNumber.from(BALANCE.hardware[id].baseCost*costModifier(s)).multiply(ScientificNumber.from(BALANCE.hardware[id].growth).pow(owned));};
export const hardwareCost=(id:HardwareId,owned:number,s?:GameState)=>hardwareCostScientific(id,owned,s).toNumber(MAX_ECONOMY_VALUE);
export const hardwareBulkCostScientific=(id:HardwareId,owned:number,count:number,s?:GameState)=>{
 if(!Number.isSafeInteger(count)||count<0||!Number.isSafeInteger(owned+count))throw new RangeError('Invalid hardware quantity');
 const h=BALANCE.hardware[id],first=hardwareCostScientific(id,owned,s);
 if(count===0)return ScientificNumber.zero();if(count===1)return first;
 const growth:number=h.growth;if(growth===1)return first.multiplyNumber(count);
 const logGrowth=count*Math.log(h.growth),factor=logGrowth>690?ScientificNumber.from(h.growth).pow(count).subtract(ScientificNumber.from(1)).divideNumber(h.growth-1):ScientificNumber.from(Math.expm1(logGrowth)/(h.growth-1));return first.multiply(factor);
};
export const hardwareBulkCost=(id:HardwareId,owned:number,count:number,s?:GameState)=>hardwareBulkCostScientific(id,owned,count,s).toNumber(MAX_ECONOMY_VALUE);
export function maxAffordable(id:HardwareId,owned:number,credits:number,s?:GameState){
 if(!hardwareIds.includes(id)||!Number.isSafeInteger(owned)||owned<0||!validResourceNumber(credits)||(s&&!validEconomyValues(s,['credits'])))return 0;
 const budget=s&&credits===s.credits?exactEconomyValue(s,'credits'):ScientificNumber.from(credits),limit=Number.MAX_SAFE_INTEGER-owned;
 if(limit<=0||hardwareCostScientific(id,owned,s).compare(budget)>0)return 0;
 const affordable=(count:number)=>hardwareBulkCostScientific(id,owned,count,s).compare(budget)<=0;
 let low=1,high=1;while(high<limit&&affordable(high)){low=high;high=Math.min(limit,high*2);if(high===low)break;}
 if(high===limit&&affordable(high))low=high;
 else while(low+1<high){const mid=low+Math.floor((high-low)/2);if(affordable(mid))low=mid;else high=mid;}
 // Verify the result with the same geometric sum used by preview and debit.
 while(low>0&&!affordable(low))low--;
 while(low<limit&&affordable(low+1))low++;
 return low;
}
export const offlineTimeLimit=(s:GameState)=>Math.min(BALANCE.maxOfflineSeconds,Math.max(s.offlineCapacitySeconds,BALANCE.baseOfflineSeconds*(1+milestoneBonus(s,'offline')+challengeFamilyBonus(s,'no-taps'))));
export const hardwareMasteryLevel=(s:GameState,id:HardwareId)=>Math.floor(Math.sqrt(Math.max(0,s.retention.hardwareMasteryXp[id]??0)/250));
export const hardwareMasteryBonus=(s:GameState,id:HardwareId)=>Math.min(BALANCE.scalingSynergy.masteryCap,hardwareMasteryLevel(s,id)*BALANCE.scalingSynergy.masteryPerLevel);
export const legacyInfrastructureMultiplier=(s:GameState)=>{
 const classes=legacyHardwareClasses(s);
 if(classes===0)return 1;
 const nodeBoost=hasNode(s,'computeNet5',1)?.06:hasNode(s,'computeNet4',1)?.03:0;
 return (1+BALANCE.scalingSynergy.legacyPerClass+nodeBoost)**Math.min(classes,BALANCE.scalingSynergy.legacyCapClasses);
};
export const hardwareOwnershipCreditMultiplier=(s:GameState)=>1+Math.min(BALANCE.scalingSynergy.ownedHundredsCap,hardwareIds.reduce((n,id)=>n+Math.floor(s.hardwareCounts[id]/100),0)*BALANCE.scalingSynergy.ownedHundredsCredit);
export const infrastructureSynergyBase=(s:GameState)=>BALANCE.scalingSynergy.classSynergyBase+s.researchLevels.hardwareIntegration*BALANCE.scalingSynergy.classSynergyResearchPerLevel+(hasNode(s,'computeNet4',1)?.015:0)+(hasNode(s,'computeNet5',1)?.025:0)+(hasNode(s,'computeNet6',1)?.04:0)+(hasNode(s,'computeNet7',1)?.06:0)+(hasNode(s,'computeNet8',1)?.09:0);
export const infrastructureSynergyScientific=(s:GameState)=>ScientificNumber.from(infrastructureSynergyBase(s)).pow(s.discovered.length).pow(milestoneSynergy(s).infrastructureExponent);
export const hardwareOwnershipSynergyScientific=(s:GameState)=>{let result=ScientificNumber.from(1);hardwareIds.forEach((id,index)=>{const count=Math.max(0,s.hardwareCounts[id]),base=(BALANCE.scalingSynergy.ownershipBases[index]??.005)*(1+challengeFamilyBonus(s,'inflation'));if(count>0)result=result.multiply(ScientificNumber.from(1+base).pow(Math.sqrt(count)));});const exponent=1+(hasNode(s,'computeNet4',1)?.05:0)+(hasNode(s,'computeNet7',1)?.05:0)+(hasNode(s,'computeNet8',1)?.10:0);return result.pow(exponent);};
export const lifetimeDataMagnitude=(s:GameState)=>{const exact=exactEconomyValue(s,'lifetimeDataGenerated');if(exact.isZero())return 0;const log=exact.log10();return log<12?Math.log10(1+exact.toNumber()):Math.max(0,log);};
export const dataSynergyPower=(s:GameState)=>BALANCE.scalingSynergy.dataPowerBase+s.researchLevels.dataGeneration*BALANCE.scalingSynergy.dataPowerResearchPerLevel+BALANCE.scalingSynergy.dataPowerPrestige.reduce<number>((n,v,i)=>n+(hasNode(s,`dataArchive${i+1}`,1)?v:0),0);
export const dataSynergyScientific=(s:GameState)=>{const d=lifetimeDataMagnitude(s);let x=ScientificNumber.fromParts(1,Math.max(0,dataSynergyPower(s)*d**.72));const exponent=1+(hasNode(s,'dataArchive4',1)?.05:0)+(hasNode(s,'dataArchive5',1)?.05:0)+(hasNode(s,'dataArchive7',1)?.05:0)+(hasNode(s,'dataArchive8',1)?.10:0);return x.pow(exponent*milestoneSynergy(s).dataExponent*(1+s.researchLevels.dataFlywheel*BALANCE.repeatableResearch.dataFlywheel.effectPerLevel));};
/** Scientific quadrature of the same instantaneous lifetime-data formula.
 * A linear Data interval is integrated in log(1+D) coordinates. The normalized
 * exponential measure avoids native economic values and cancellation between
 * enormous zero-origin antiderivatives. Relative tolerance 1e-12 plus logarithmic binary64 roundoff, depth <= 20.
 */
export function averageDataSynergy(s:GameState,dataGain:ScientificNumber,current=dataSynergyScientific(s)){
 if(dataGain.isZero())return current;
 const start=exactEconomyValue(s,'lifetimeDataGenerated'),end=start.add(dataGain);
 if(end.compare(start)===0)return current; // gain is below mantissa precision
 const one=ScientificNumber.from(1),u0=start.add(one).log10()*Math.LN10,u1=end.add(one).log10()*Math.LN10,width=u1-u0;
 const power=dataSynergyPower(s)*(1+(hasNode(s,'dataArchive4',1)?.05:0)+(hasNode(s,'dataArchive5',1)?.05:0)+(hasNode(s,'dataArchive7',1)?.05:0)+(hasNode(s,'dataArchive8',1)?.10:0))*milestoneSynergy(s).dataExponent*(1+s.researchLevels.dataFlywheel*BALANCE.repeatableResearch.dataFlywheel.effectPerLevel);
 const value=(u:number)=>ScientificNumber.fromParts(1,power*(Math.max(0,u<12*Math.LN10?u:u+Math.log1p(-Math.exp(-u)))/Math.LN10)**.72);
 // Tiny relative gains need no subtraction of close logarithms.
 if(width===0)return current; // logarithm resolution, not a resource clamp
 if(width<1e-6&&value(u1).divide(current).toNumber(2)-1<1e-12){const mid=start.add(dataGain.multiplyNumber(.5));return value(mid.add(one).log10()*Math.LN10);}
 const normalization=-Math.expm1(-width),integrand=(v:number)=>value(u1-v).multiplyNumber(Math.exp(-v)/normalization),simpson=(a:number,b:number,fa:ScientificNumber,fm:ScientificNumber,fb:ScientificNumber)=>fa.add(fm.multiplyNumber(4)).add(fb).multiplyNumber((b-a)/6);
 const recurse=(a:number,b:number,fa:ScientificNumber,fm:ScientificNumber,fb:ScientificNumber,coarse:ScientificNumber,depth:number):ScientificNumber=>{
  const m=(a+b)/2,l=integrand((a+m)/2),r=integrand((m+b)/2),left=simpson(a,m,fa,l,fm),right=simpson(m,b,fm,r,fb),fine=left.add(right),ratio=coarse.isZero()?1:fine.divide(coarse).toNumber(2);
  const roundoff=Number.EPSILON*32*(1+Math.abs(coarse.log10()));
  if(depth===0||Math.abs(ratio-1)<=1e-12+roundoff)return fine;
  return recurse(a,m,fa,l,fm,left,depth-1).add(recurse(m,b,fm,r,fb,right,depth-1));
 };
 // Exponential tails are integrated in bounded spans; underflow contributes
 // less than binary64 precision, rather than capping any economic quantity.
 let mean=ScientificNumber.zero();
 for(let a=0;a<width&&a<745;a+=8){const b=Math.min(width,a+8),fa=integrand(a);if(!mean.isZero()&&fa.divide(mean).toNumber(1)<1e-16)break;const fm=integrand((a+b)/2),fb=integrand(b);mean=mean.add(recurse(a,b,fa,fm,fb,simpson(a,b,fa,fm,fb),20));}
 return mean;
}
export const modelSynergyBase=(s:GameState)=>BALANCE.scalingSynergy.modelGlobalBase+s.researchLevels.modelArchitecture*BALANCE.scalingSynergy.modelResearchBasePerLevel;
export const modelSynergyScientific=(s:GameState)=>ScientificNumber.from(modelSynergyBase(s)).pow(Math.max(0,s.level)).pow(milestoneSynergy(s).modelExponent*(1+s.researchLevels.recursiveLearning*BALANCE.repeatableResearch.recursiveLearning.effectPerLevel));
export const intSynergyScientific=(s:GameState)=>ScientificNumber.from(BALANCE.scalingSynergy.intBase).pow(Math.sqrt(Math.max(0,s.cycleINTEarned)));
export const achievementSynergyScientific=(s:GameState)=>ScientificNumber.from(BALANCE.scalingSynergy.achievementPer25).pow(Math.floor(s.achievementPoints/25)).multiply(ScientificNumber.from(BALANCE.scalingSynergy.achievementPer100).pow(Math.floor(s.achievementPoints/100)));
export const artifactSynergyScientific=(s:GameState)=>ScientificNumber.from(BALANCE.scalingSynergy.artifactBase).pow(s.profile.artifacts.length).pow(1+Math.min(.5,s.profile.artifacts.length*.03));
export const breakthroughSynergyScientific=(s:GameState)=>ScientificNumber.from(BALANCE.scalingSynergy.breakthroughBase).pow(s.breakthroughs.length).pow(1+Math.min(.35,s.breakthroughs.length*.04));
export function classComputeTerms(s:GameState,id:HardwareId,count=s.hardwareCounts[id]){const index=hardwareIds.indexOf(id);return{ownedCompute:count*BALANCE.hardware[id].compute,linkedCompute:researchModifiers(s).distributedInference&&index>0&&challengeNetworkLinkAllowed(s,index)&&s.hardwareCounts[hardwareIds[index-1]]>=25?Math.min(count,10)*BALANCE.hardware[id].compute*BALANCE.computeNetworkBonus*(1+challengeFamilyBonus(s,'fragmented-network'))*(1+deviceBonus(s,'neighbor')+(index>=hardwareIds.indexOf('campus')?deviceBonus(s,'lateNeighbor'):0)):0,milestone:1+(milestoneFactor(id,count)-1)*(1+((id==='calculator'||id==='sbc')?challengeFamilyBonus(s,'five-hardware'):0)),classUpgrade:(s.classUpgrades.includes(id)?2:1)*((id==='calculator'||id==='sbc')&&count>=10?1+deviceBonus(s,'legacy')*(1+challengeFamilyBonus(s,'five-hardware')):1),mastery:1+hardwareMasteryBonus(s,id)*(1+challengeFamilyBonus(s,'no-items'))};}
export const classCompute=(s:GameState,id:HardwareId,count=s.hardwareCounts[id])=>{const terms=classComputeTerms(s,id,count);return(terms.ownedCompute+terms.linkedCompute)*terms.milestone*terms.classUpgrade*terms.mastery;};
export const prestigeComputePerClass=(s:GameState)=>hasNode(s,'computeNet3',1)?.30:hasNode(s,'computeNet2',1)?.15:hasNode(s,'computeNet1',1)?.08:0;
export const classComputeScientific=(s:GameState,id:HardwareId,count=s.hardwareCounts[id])=>ScientificNumber.from(Math.max(0,classCompute(s,id,count)));
export function computeFactors(s:GameState){const tier=Math.max(0,Math.max(0,...s.discovered.map(id=>hardwareIds.indexOf(id)))-7);return {deviceCompute:1+deviceBonus(s,'sparse')+deviceBonus(s,'photonicCompute')+deviceBonus(s,'pairs'),itemCombination:itemCombinationQuote(s,'parallel-architecture').contribution,itemAndMilestoneAdditive:1+equippedBonus(s,'compute')+milestoneBonus(s,'compute')+milestoneBonus(s,'synergy'),prestigePerClass:1+prestigeComputePerClass(s)*s.discovered.length,deepPrestige:1+deepPrestigeBonus(s,'compute'),computeOptimization:ScientificNumber.from(1.16).pow(Math.max(0,s.researchLevels.computeOptimization)),hardwareIntegration:ScientificNumber.from(1.12).pow(Math.max(0,s.researchLevels.hardwareIntegration)*tier),parallelArchitecture:ScientificNumber.from(1+BALANCE.repeatableResearch.parallelArchitecture.effectPerLevel).pow(s.researchLevels.parallelArchitecture*s.discovered.length),hardwareCoDesign:ScientificNumber.from(1+BALANCE.repeatableResearch.hardwareCoDesign.effectPerLevel).pow(s.researchLevels.hardwareCoDesign*Math.max(0,s.level)*s.discovered.length),milestoneSynergy:milestoneSynergy(s).compute,legacyInfrastructure:legacyInfrastructureMultiplier(s),hardwareOwnership:hardwareOwnershipSynergyScientific(s),infrastructure:infrastructureSynergyScientific(s),model:modelSynergyScientific(s).pow(.20)};}
export const computeRateScientific=(_hardware:number,s?:GameState)=>{if(!s)return ScientificNumber.from(Math.max(0,_hardware));let base=ScientificNumber.zero();for(const id of hardwareIds)base=base.add(classComputeScientific(s,id));return scientificProduct(base,...Object.values(computeFactors(s)));};
export const computeRate=(_hardware:number,s?:GameState)=>computeRateScientific(_hardware,s).toNumber(MAX_ECONOMY_VALUE);
/** Legacy helpers retained for v1 tests/imports and mapped to calculators. */
export const blockCost=(owned:number,s?:GameState)=>hardwareCost('calculator',owned,s);
export const bulkCost=(owned:number,count:number,s?:GameState)=>hardwareBulkCost('calculator',owned,count,s);
export const softcap=(x:number,k:number)=>x<=k?x:k+Math.sqrt(k*(x-k));
export const quality=(level:number)=>1+softcap(BALANCE.modelQualityPerLevel*Math.max(0,level),BALANCE.qualitySoftcap);
export const efficiency=(level:number)=>1+softcap(BALANCE.modelEfficiencyPerLevel*Math.max(0,level),BALANCE.efficiencySoftcap);
export const usersFactors=(s:GameState)=>({efficiencyPerCompute:(1+(efficiency(s.efficiencyLevel)-1)*(1+challengeFamilyBonus(s,'efficiency-lock')))/BALANCE.computePerUser,milestoneUsers:1+milestoneBonus(s,'users'),userScaling:ScientificNumber.from(1.14).pow(Math.max(0,s.researchLevels.userScaling)),infrastructure:infrastructureSynergyScientific(s).pow(.25),milestoneSynergy:milestoneSynergy(s).users});
export const usersRateScientific=(s:GameState)=>scientificProduct(computeRateScientific(s.hardware,s),...Object.values(usersFactors(s)));
export const usersRate=(s:GameState)=>usersRateScientific(s).toNumber(MAX_ECONOMY_VALUE);
export const repeatableResearchIds=Object.keys(BALANCE.repeatableResearch) as RepeatableResearchId[];
export const isRepeatableResearch=(id:ResearchId):id is RepeatableResearchId=>repeatableResearchIds.includes(id as RepeatableResearchId);
export type ResearchBalanceCategory=keyof typeof BALANCE.researchCategories;
export const researchCategory=(id:ResearchId):ResearchBalanceCategory=>isRepeatableResearch(id)?BALANCE.repeatableResearch[id].balanceCategory:BALANCE.researchProjects[id].balanceCategory;
export const researchDurationForLevel=(category:ResearchBalanceCategory,level:number)=>Math.min(BALANCE.researchDurationCapSeconds,BALANCE.researchCategories[category].baseDuration*BALANCE.researchDurationGrowth**Math.max(0,level-1));
/** Preserve existing native ceil rounding where representable. Beyond native range,
 * the unit-sized ceil increment is below ScientificNumber's documented precision. */
export function scientificCeilGeometric(base:number,growth:number,power:number){
 const value=ScientificNumber.from(base).multiply(ScientificNumber.from(growth).pow(power));
 // Decimal integer ceiling of the represented scientific coefficient, never a native economic projection.
 // At >=16 decades one unit is below binary64 mantissa precision and cannot change the value.
 if(value.isZero()||value.exponent>=16)return value;
 if(value.exponent<0)return ScientificNumber.from(1);
 const [whole,fraction='']=value.mantissa.toString().split('.'),digits=whole+fraction,shift=value.exponent-fraction.length;
 if(shift>=0)return ScientificNumber.fromString(digits+'0'.repeat(shift));
 const divisor=10n**BigInt(-shift),coefficient=BigInt(digits),rounded=(coefficient+divisor-1n)/divisor;return ScientificNumber.fromString(rounded.toString());
}
export const researchDataCostForLevelScientific=(category:ResearchBalanceCategory,level:number)=>scientificCeilGeometric(BALANCE.researchCategories[category].baseData,BALANCE.researchDataGrowth,Math.max(0,level-1));
export const repeatableResearchDuration=(id:RepeatableResearchId,level:number)=>researchDurationForLevel(researchCategory(id),level);
export const repeatableResearchDataCostScientific=(id:RepeatableResearchId,level:number)=>researchDataCostForLevelScientific(researchCategory(id),level);
export const repeatableResearchDataCost=(id:RepeatableResearchId,level:number)=>repeatableResearchDataCostScientific(id,level).toNumber(MAX_ECONOMY_VALUE);
export const dataResearchMultiplier=(level:number)=>Math.min(1e120,1.18**Math.max(0,level));
export const prestigeDataBonus=(s:GameState)=>hasNode(s,'dataArchive3',1)?1.25:hasNode(s,'dataArchive2',1)?.60:hasNode(s,'dataArchive1',1)?.25:0;
export const dataBonusTerms=(s:GameState)=>({milestones:ScientificNumber.from(Math.max(0,milestoneBonus(s,'data'))*(1+challengeFamilyBonus(s,'data-crunch'))),dataGeneration:ScientificNumber.from(1.18).pow(Math.max(0,s.researchLevels.dataGeneration)).subtract(ScientificNumber.from(1)),syntheticData:ScientificNumber.from(1+BALANCE.repeatableResearch.syntheticData.effectPerLevel).pow(s.researchLevels.syntheticData*Math.max(0,s.level)).subtract(ScientificNumber.from(1)),milestoneSynergy:ScientificNumber.from(Math.max(0,milestoneSynergy(s).data-1)),prestige:ScientificNumber.from(Math.max(0,prestigeDataBonus(s))),deepPrestige:ScientificNumber.from(Math.max(0,deepPrestigeBonus(s,'data'))),items:ScientificNumber.from(1+equippedBonus(s,'data')).pow(itemSynergyExponent(s)).subtract(ScientificNumber.from(1)),model:modelSynergyScientific(s).pow(.10).subtract(ScientificNumber.from(1))});
export const dataRawBonusScientific=(s:GameState)=>Object.values(dataBonusTerms(s)).reduce((sum,bonus)=>sum.add(bonus),ScientificNumber.zero());
export const dataSoftBonusScientific=(rawBonus:ScientificNumber)=>{const threshold=ScientificNumber.from(BALANCE.dataBonusScale);return rawBonus.compare(threshold)<=0?rawBonus:threshold.add(rawBonus.subtract(threshold).multiply(threshold).sqrt());};
export const dataMultiplierScientific=(rawBonus:ScientificNumber)=>ScientificNumber.from(1).add(dataSoftBonusScientific(rawBonus));
export const dataMultiplier=(s:GameState)=>dataMultiplierScientific(dataRawBonusScientific(s)).toNumber();
export const baseDataRateScientific=(users:ScientificNumber)=>users.pow(.5).multiplyNumber(BALANCE.baseDataPerSecond);
export function dataProductionQuote(s:GameState){const sources=dataBonusTerms(s),rawBonus=Object.values(sources).reduce((sum,v)=>sum.add(v),ScientificNumber.zero()),baseRate=baseDataRateScientific(usersRateScientific(s)),multiplier=dataMultiplierScientific(rawBonus),challengeFactor=activeChallengeRules(s)?.dataFactor??1;return{baseRate,sources,rawBonus,multiplier,challengeFactor,rate:scientificProduct(baseRate,multiplier,challengeFactor)};}
export const dataRateScientific=(s:GameState)=>dataProductionQuote(s).rate;
export function dataProductionComparison(before:GameState,after:GameState){const a=dataProductionQuote(before),b=dataProductionQuote(after);return{before:a,after:b,direction:b.rate.compare(a.rate),relativeGain:a.rate.isZero()?null:b.rate.compare(a.rate)>=0?b.rate.divide(a.rate).subtract(ScientificNumber.from(1)):ScientificNumber.from(1).subtract(b.rate.divide(a.rate)),sameRoundedDisplay:formatScientific(a.rate,2)===formatScientific(b.rate,2)};}
export const dataRate=(s:GameState)=>dataRateScientific(s).toNumber(MAX_ECONOMY_VALUE);
export const passiveCircuitRate=(s:GameState)=>s.discovered.length/BALANCE.passiveCircuitSecondsPerClass;
const unavailableAffordability=(cost:ScientificNumber)=>({balanceExact:ScientificNumber.zero(),costExact:cost,missingExact:ScientificNumber.zero(),affordable:false,secondsToAfford:null,valid:false});
export function scientificAffordability(balance:ScientificNumber,cost:ScientificNumber,rate=ScientificNumber.zero()){
 const missing=cost.subtract(balance),eta=missing.isZero()?ScientificNumber.zero():rate.isZero()?null:missing.divide(rate),seconds=eta&&eta.compare(ScientificNumber.from(Number.MAX_SAFE_INTEGER))<=0?eta.toNumber():undefined;
 return{valid:true,balanceExact:balance,costExact:cost,missingExact:missing,affordable:balance.compare(cost)>=0,secondsToAfford:seconds!==undefined&&Number.isFinite(seconds)&&seconds>=0?seconds:null};
}
export const dataAffordability=(s:GameState,cost:number)=>{const quote=scientificAffordability(exactEconomyValue(s,'data'),ScientificNumber.from(cost),dataRateScientific(s));return {...quote,cost,balance:s.data,missing:quote.missingExact.toNumber(MAX_ECONOMY_VALUE)};};
/** Historical Research Points are inert; laboratory performance is quoted at start. */
export const researchRateScientific=(_s:GameState,_now=_s.savedAt)=>ScientificNumber.zero();
export const researchRate=(s:GameState,now=s.savedAt)=>researchRateScientific(s,now).toNumber(MAX_ECONOMY_VALUE);
export const creditMultiplierFromINT=(s:GameState)=>1+BALANCE.prestigeBonusLogScale*Math.LN10*exactEconomyValue(s,'cycleINTEarned').add(ScientificNumber.from(1)).log10();
/** Preserve small integer Axiom arithmetic without rounding fractional balances
 * up to a price. The decimal coefficient/exponent is decoded without projecting
 * an economic value to Number; large values retain scientific mantissa precision. */
function axiomInteger(value:ScientificNumber){
 const [whole,fraction='']=value.mantissa.toString().split('.');
 if(value.exponent<0||value.exponent>15||fraction.length>value.exponent)return null;
 return BigInt(whole+fraction+'0'.repeat(value.exponent-fraction.length));
}
export function addAxiomAmounts(a:ScientificNumber,b:ScientificNumber){const x=axiomInteger(a),y=axiomInteger(b);return x!==null&&y!==null?ScientificNumber.fromString((x+y).toString()):a.add(b);}
export function subtractAxiomAmounts(a:ScientificNumber,b:ScientificNumber){const x=axiomInteger(a),y=axiomInteger(b);return x!==null&&y!==null?ScientificNumber.fromString((x>y?x-y:0n).toString()):a.subtract(b);}
export function axiomEconomyValue(s:GameState,key:'available'|'total'){
 const fallback=key==='available'?s.availableAxioms:s.totalAxiomsEarned,raw=s.exactAxioms?.[key];
 if(!validResourceNumber(fallback))throw new RangeError('Invalid Axiom projection');
 if(!raw)return ScientificNumber.from(fallback);
 const value=ScientificNumber.fromJSON(raw);
 if(value.compare(ScientificNumber.from(MAX_ECONOMY_VALUE))>0)return value;
 return Math.abs(value.toNumber(MAX_ECONOMY_VALUE)-fallback)>Math.max(1,fallback)*1e-12?ScientificNumber.from(fallback):value;
}
export const creditMultiplierFromAxiomsScientific=(s:GameState)=>axiomEconomyValue(s,'total').multiplyNumber(BALANCE.axiom.creditPerTotal).add(ScientificNumber.from(1));
/** Bounded compatibility/display projection; production uses the scientific value. */
export const creditMultiplierFromAxioms=(s:GameState)=>creditMultiplierFromAxiomsScientific(s).toNumber(MAX_ECONOMY_VALUE);
export const permanentFactor=creditMultiplierFromINT;
export function creditFactors(s:GameState,now=s.savedAt,temporary=true){const architecture=ScientificNumber.from(1+BALANCE.repeatableResearch.modelArchitecture.effectPerLevel).pow(Math.max(0,s.researchLevels.modelArchitecture));const itemCredits=ScientificNumber.from(1+equippedBonus(s,'credits')+itemCombinationBonus(s,'credits')).pow(itemSynergyExponent(s)*milestoneSynergy(s).itemExponent);const commercialization=ScientificNumber.from(1+BALANCE.repeatableResearch.commercialization.effectPerLevel).pow(s.researchLevels.commercialization),userLog=Math.max(0,usersRateScientific(s).log10()),network=ScientificNumber.fromParts(1,Math.max(0,BALANCE.repeatableResearch.networkEffects.effectPerLevel*s.researchLevels.networkEffects*userLog**.8));return {baseRevenuePerUser:BALANCE.baseRevenuePerUser,quality:1+(quality(s.qualityLevel)-1)*(1+challengeFamilyBonus(s,'quality-lock')),INT:creditMultiplierFromINT(s),axioms:creditMultiplierFromAxiomsScientific(s),modelArchitecture:architecture,commercialization:commercialization,networkEffects:network,milestoneRevenue:milestoneSynergy(s).revenue,items:itemCredits,hardwareOwnership:hardwareOwnershipCreditMultiplier(s),infrastructure:infrastructureSynergyScientific(s),lifetimeData:dataSynergyScientific(s),model:modelSynergyScientific(s),achievements:achievementSynergyScientific(s),artifacts:artifactSynergyScientific(s),breakthroughs:breakthroughSynergyScientific(s),devicePassive:1+deviceBonus(s,'memory')*(1+challengeFamilyBonus(s,'no-taps')),temporary:temporary?1+(s.creditBoostUntil>now?1:0)+(s.overclock.activeUntil>now&&(s.overclock.channel??'credits')==='credits'?1+deviceBonus(s,'burst'):0):1};}
export const creditRateScientific=(hardware:number,level:number,s?:GameState,now=0,temporary=true)=>{if(!s)return ScientificNumber.from(Math.max(0,hardware*BALANCE.baseRevenuePerUser*quality(level)));return scientificProduct(usersRateScientific(s),...Object.values(creditFactors(s,now,temporary)));};
export const creditRate=(hardware:number,level:number,s?:GameState,now=0,temporary=true)=>creditRateScientific(hardware,level,s,now,temporary).toNumber(MAX_ECONOMY_VALUE);
export const equipmentSlots=['processor','core','research'] as const;
export const equipmentSlotCount=(s:GameState)=>s.prestigeCount<1?0:Math.min(3,Math.max(1,s.unlockedEquipmentSlots??0,1+(s.purchasedEquipmentSlots??0),hasNode(s,'manufacturing5',1)?3:hasNode(s,'manufacturing1',1)?2:1));
export function productionBreakdown(s:GameState,now=s.savedAt){const hardware=hardwareIds.map(id=>({id,count:s.hardwareCounts[id],milestone:milestoneFactor(id,s.hardwareCounts[id]),compute:classCompute(s,id)})),rawCompute=hardware.reduce((n,row)=>n+row.compute,0),computeGlobal=rawCompute?computeRate(s.hardware,s)/rawCompute:1,modelQuality=quality(s.qualityLevel),modelEfficiency=efficiency(s.efficiencyLevel),prestige=permanentFactor(s),achievement=achievementSynergyScientific(s).toNumber(MAX_ECONOMY_VALUE),creditFamily=breakthroughSynergyScientific(s).toNumber(MAX_ECONOMY_VALUE),legacyInfrastructure=legacyInfrastructureMultiplier(s),ownershipCredits=hardwareOwnershipCreditMultiplier(s),itemBonuses={credits:equippedBonus(s,'credits'),compute:equippedBonus(s,'compute'),data:equippedBonus(s,'data'),research:equippedBonus(s,'research'),training:equippedBonus(s,'training'),experiment:equippedBonus(s,'experiment')},items=creditFactors(s,now).items.toNumber(MAX_ECONOMY_VALUE),temporary=creditFactors(s,now).temporary;return{itemCombinations:itemCombinationQuotes(s),factors:{compute:computeFactors(s),users:usersFactors(s),credits:creditFactors(s,now),dataAdditive:dataBonusTerms(s)},hardware,rawCompute,computeGlobal,legacyInfrastructure,ownershipCredits,modelQuality,modelEfficiency,prestige,achievement,creditFamily,itemBonuses,items,temporary,synergies:{infrastructure:infrastructureSynergyScientific(s).toNumber(MAX_ECONOMY_VALUE),hardwareOwnership:hardwareOwnershipSynergyScientific(s).toNumber(MAX_ECONOMY_VALUE),data:dataSynergyScientific(s).toNumber(MAX_ECONOMY_VALUE),model:modelSynergyScientific(s).toNumber(MAX_ECONOMY_VALUE),int:1,artifacts:artifactSynergyScientific(s).toNumber(MAX_ECONOMY_VALUE)},passive:creditRate(s.hardware,s.level,s,now),tap:tapCredits(s,now)};}
/** Current class contribution after the same global multipliers used by computeRate. */
export const hardwareClassComputeRate=(s:GameState,id:HardwareId)=>scientificProduct(classComputeScientific(s,id),...Object.values(computeFactors(s))).toNumber(MAX_ECONOMY_VALUE);
/** Total compute-rate delta for a prospective bulk purchase, including milestone/synergy changes. */
/** Pure structural purchase result, shared with the paid transaction. */
export function hardwareOwnershipAfter(s:GameState,id:HardwareId,count:number){const hardwareCounts={...s.hardwareCounts,[id]:s.hardwareCounts[id]+count};return{hardwareCounts,hardware:Object.values(hardwareCounts).reduce((sum,owned)=>sum+owned,0),discovered:s.discovered.includes(id)?s.discovered:[...s.discovered,id],retention:{...s.retention,hardwareMasteryXp:{...s.retention.hardwareMasteryXp,[id]:(s.retention.hardwareMasteryXp[id]??0)+count}}};}
export const hardwarePurchaseComputeGain=(s:GameState,id:HardwareId,count:number)=>{if(!Number.isSafeInteger(count)||count<1)return 0;const after={...s,...hardwareOwnershipAfter(s,id,count)};return computeRateScientific(after.hardware,after).subtract(computeRateScientific(s.hardware,s)).toNumber(MAX_ECONOMY_VALUE);};
/** Training advances strictly by elapsed seconds; legacy compute, tap, item and timed boosts do not shorten it. */
export const trainingRate=(_hardware:number,_s?:GameState,_now=0,_temporary=true)=>1;
export const trainingDurationSeconds=(level:number)=>Math.min(BALANCE.trainingDurationCapSeconds,BALANCE.trainingDurationBaseSeconds*BALANCE.trainingDurationGrowth**Math.max(0,level-1));
export const trainingGoalSeconds=trainingDurationSeconds;
export const trainingGoal=(level:number)=>trainingDurationSeconds(level+1);
export const trainingCostScientific=(_s:GameState,_track:TrainingTrack)=>ScientificNumber.zero();
export const trainingCost=(_s:GameState,_track:TrainingTrack)=>0;
export const trainingDataCostForLevelScientific=(level:number)=>scientificCeil(trainingBaseDataCostScientific(Math.max(1,level)));
/** Existing training effects become additive cost bonuses, never elapsed-time multipliers. */
export function trainingCostBonusSources(s:GameState,now=s.savedAt){
 const sources:Record<string,number>={};
 const combination=itemCombinationQuote(s,'learning-pipeline');if(combination.active)sources[`combination:${combination.id}`]=combination.contribution;
 if(s.retention.activeRun?.id!=='no-items')for(const item of equippedItems(s)){const value=itemEffectFor(s,item,'training')*(1+deepPrestigeBonus(s,'manufacturing'));if(value>0)sources[`item:${item.id}:${item.type}`]=value;}
 for(const id of hardwareIds)for(const milestone of reachedMilestones(id,s.hardwareCounts[id]))if(milestone.effect==='training')sources[`milestone:${id}:${milestone.threshold}`]=milestone.value;
 if(s.breakthroughs.includes('graph'))sources['breakthrough:graph']=BALANCE.breakthroughs.graph[1];
 if(s.trainingBoostUntil>now)sources['temporary:trainingBoost']=1;
 if(s.overclock.activeUntil>now&&s.overclock.channel==='training')sources['temporary:trainingOverclock']=1;
 return sources;
}
/** At exponent 16 and above, unit rounding is below binary64 representation precision. */
export const scientificCeil=(value:ScientificNumber)=>value.isZero()||value.exponent>=16?value:ScientificNumber.from(Math.ceil(value.toNumber()));
export const trainingBaseDataCostScientific=(targetLevel:number)=>ScientificNumber.from(BALANCE.trainingDataBase).multiply(ScientificNumber.from(BALANCE.trainingDataGrowth).pow(targetLevel-1));
export function trainingCostQuote(s:GameState,track:TrainingTrack,now=s.savedAt){
 const targetLevel=(track==='quality'?s.qualityLevel:s.efficiencyLevel)+1,sources:Record<string,number>={...trainingCostBonusSources(s,now),...(s.deviceProgress.lastTrack&&s.deviceProgress.lastTrack!==track?{'device:curriculum':deviceBonus(s,'curriculum')}:{})},bonusTotal=Object.values(sources).reduce((sum,value)=>sum+value,0),factor=Math.max(BALANCE.trainingCostFloor,1/(1+bonusTotal)),baseCost=trainingBaseDataCostScientific(targetLevel),cost=scientificCeil(baseCost.multiplyNumber(factor));
 return{targetLevel,sources,bonusTotal,factor,baseCost,cost,discount:1-factor,capped:factor===BALANCE.trainingCostFloor};
}
/** Same rounded prices with only the additional build contribution removed; individual effects stay. */
export function trainingCombinationComparison(s:GameState,track:TrainingTrack){
 const after=trainingCostQuote(s,track),combination=itemCombinationQuote(s,'learning-pipeline'),beforeBonus=Object.entries(after.sources).filter(([key])=>key!==`combination:${combination.id}`).reduce((n,[,value])=>n+value,0),beforeFactor=Math.max(BALANCE.trainingCostFloor,1/(1+beforeBonus));
 return{track,combination,before:{bonusTotal:beforeBonus,factor:beforeFactor,cost:scientificCeil(after.baseCost.multiplyNumber(beforeFactor)),capped:beforeFactor===BALANCE.trainingCostFloor},after};
}
export const trainingDataCostScientific=(s:GameState,track:TrainingTrack)=>trainingCostQuote(s,track).cost;
export const trainingDataCost=(s:GameState,track:TrainingTrack)=>trainingDataCostScientific(s,track).toNumber(MAX_ECONOMY_VALUE);
export function trainingDurationQuote(s:GameState,track?:TrainingTrack){const baseDuration=trainingDurationSeconds((track==='quality'?s.qualityLevel:track==='efficiency'?s.efficiencyLevel:s.level)+1),modifiers=researchModifiers(s),alignment=modifiers.alignment,modelTransfer=modifiers.modelTransfer;return{baseDuration,alignment,modelTransfer,runStart:s.runTrainingStarted+1,duration:baseDuration*alignment*modelTransfer};}
export const trainingWork=(s:GameState,track?:TrainingTrack)=>trainingDurationQuote(s,track).duration;
export function trainingPreview(s:GameState,track:TrainingTrack){
 const valid=track==='quality'||track==='efficiency',level=(track==='quality'?s.qualityLevel:s.efficiencyLevel)+1,quote=trainingCostQuote(s,track),cost=valid?quote.cost:ScientificNumber.zero(),ledgerValid=validEconomyValues(s,['credits','data']),resources=ledgerValid?scientificAffordability(exactEconomyValue(s,'data'),cost,dataRateScientific(s)):unavailableAffordability(cost),reason=track==='quality'&&activeChallengeRules(s)?.qualityLocked||track==='efficiency'&&activeChallengeRules(s)?.efficiencyLocked?'challenge-rule':!ledgerValid?'invalid-resources':!valid?'invalid-track':s.activeTraining?'training-active':!resources.affordable?'data':null;
 return{...quote,durationBasis:trainingDurationQuote(s,track),track,level,cost,duration:trainingWork(s,track),resources,reason,allowed:reason===null,effect:track==='quality'?quality(level)/quality(level-1):efficiency(level)/efficiency(level-1)};
}
export function startTraining(s:GameState,track:TrainingTrack){if(track==='quality'&&activeChallengeRules(s)?.qualityLocked||track==='efficiency'&&activeChallengeRules(s)?.efficiencyLocked)return s;const preview=trainingPreview(s,track);if(!preview.allowed)return s;const dataCostExact=preview.cost,dataCost=dataCostExact.toNumber(MAX_ECONOMY_VALUE),duration=preview.duration;const paid=spendScientificResources(s,ScientificNumber.zero(),dataCostExact);return addEvent({...paid,deviceProgress:{...s.deviceProgress,lastTrack:track},runTrainingStarted:s.runTrainingStarted+1,training:0,activeTraining:{track,durationBasis:preview.durationBasis,costBasis:{targetLevel:preview.targetLevel,baseDataCostExact:preview.baseCost.toJSON(),factor:preview.factor,bonusTotal:preview.bonusTotal,sources:preview.sources},creditCost:0,dataCost,dataCostExact:dataCostExact.toJSON(),workRequired:duration,startedAt:s.savedAt,baseDuration:duration,startingRate:1,onlineWork:0,offlineWork:0},lifetime:{...s.lifetime,trainingStarted:s.lifetime.trainingStarted+1}},'training-start',s.savedAt,{track,baseDataCostExact:preview.baseCost.toScientificString(16),trainingCostFactor:preview.factor,trainingBonusTotal:preview.bonusTotal,trainingBonusSources:JSON.stringify(preview.sources),creditCost:0,dataCost,level:track==='quality'?s.qualityLevel:s.efficiencyLevel,baseDuration:duration,effectiveRate:1,expectedDuration:duration,startedAt:s.savedAt,endsAt:s.savedAt+duration*1000,exactDataCost:dataCostExact.toScientificString(16)});}
export function queueTraining(s:GameState,track:TrainingTrack){if(!trainingQueueUnlocked(s)||s.trainingQueue.length>=2)return s;const base=track==='quality'?s.qualityLevel:s.efficiencyLevel,active=s.activeTraining?.track===track?1:0,planned=s.trainingQueue.filter(job=>job.track===track).length,targetLevel=base+active+planned+1;return{...s,trainingQueue:[...s.trainingQueue,{track,targetLevel}]};}
export function removeQueuedTraining(s:GameState,index:number){if(index<0||index>=s.trainingQueue.length)return s;const removed=s.trainingQueue[index],queue=s.trainingQueue.filter((job,i)=>i<index||job.track!==removed.track);return{...s,trainingQueue:queue};}
export function startQueuedTrainingIfAffordable(s:GameState){if(s.activeTraining||!s.trainingQueue.length)return s;const job=s.trainingQueue[0],level=job.track==='quality'?s.qualityLevel:s.efficiencyLevel;if(job.targetLevel!==level+1)return s;const started=startTraining(s,job.track);return started===s?s:{...started,trainingQueue:s.trainingQueue.slice(1)};}
export function passiveComponentWeights(s:GameState){const accessible=(['circuits','copperCoils','siliconWafers','titaniumBolts','photonicLenses','graphene','nanotubes','superconductors','neuralCrystals','quantumCores'] as ComponentId[]).slice(0,Math.max(1,Math.min(componentIds.length,s.discovered.length))),target=hasNode(s,'componentScanner',1)&&s.scannerTarget&&accessible.includes(s.scannerTarget)?s.scannerTarget:null,total=accessible.reduce((sum,id)=>sum+BALANCE.componentSources.hardware[id]*(id===target?2:1),0);return accessible.map(id=>({id,weight:BALANCE.componentSources.hardware[id]*(id===target?2:1),chance:BALANCE.componentSources.hardware[id]*(id===target?2:1)/total,source:BALANCE.components[id].source}));}
export function rollPassiveComponent(s:GameState,rng=Math.random){const table=passiveComponentWeights(s);let roll=rng(),picked=table.at(-1)!.id;for(const row of table){roll-=row.chance;if(roll<=0){picked=row.id;break;}}return picked;}
export function selectScannerTarget(s:GameState,target:ComponentId|null){return !hasNode(s,'componentScanner',1)||target!==null&&!passiveComponentWeights({...s,scannerTarget:null}).some(row=>row.id===target)?s:{...s,scannerTarget:target};}
export const axiomThresholdScientific=()=>ScientificNumber.fromJSON(BALANCE.axiom.threshold);
export const prestigeClaimForEligibleScientific=(eligible:ScientificNumber)=>{const root=eligible.divideNumber(BALANCE.prestigeBaseRevenue).sqrt();if(root.exponent<15)return ScientificNumber.from(Math.floor(root.toNumber()+1e-12));return root;};
export const prestigeClaimForEligible=(eligible:ScientificNumber)=>prestigeClaimForEligibleScientific(eligible).toNumber(MAX_ECONOMY_VALUE);
export const prestigeClaimScientific=(s:GameState)=>prestigeClaimForEligibleScientific(exactEconomyValue(s,'cycleEligibleCredits'));
export const prestigeClaim=(s:GameState)=>prestigeClaimScientific(s).toNumber(MAX_ECONOMY_VALUE);
export const newINTScientific=(s:GameState)=>prestigeClaimScientific(s).subtract(exactEconomyValue(s,'prestigeEntitlementClaimed'));
export const newINT=(s:GameState)=>newINTScientific(s).toNumber(MAX_ECONOMY_VALUE);
export const newInsight=newINT;
export const canPrestige=(s:GameState)=>!newINTScientific(s).isZero();
export const nextPrestigeThresholdScientific=(s:GameState)=>exactEconomyValue(s,'prestigeEntitlementClaimed').add(ScientificNumber.from(1)).pow(2).multiplyNumber(BALANCE.prestigeBaseRevenue);
export const nextPrestigeThreshold=(s:GameState)=>nextPrestigeThresholdScientific(s).toNumber(MAX_ECONOMY_VALUE);
export const prestigeRequirementDepth=(id:PrestigeUpgradeId,seen=new Set<PrestigeUpgradeId>()):number=>{if(seen.has(id))return 1;const requirements=BALANCE.prestigeUpgrades[id].requires as readonly PrestigeUpgradeId[];if(!requirements.length)return 1;const next=new Set(seen).add(id);return 1+Math.max(...requirements.map(required=>prestigeRequirementDepth(required,next)))};
export const prestigeUpgradeCost=(id:PrestigeUpgradeId,_level=0)=>{if(id==='shoppingAgent')return 1;if(id==='trainingPlan'||id==='componentScanner')return 3;if(id==='milestoneMemory')return 100;if(id==='modelSynthesis')return 1000;if(id==='researchArchive')return 10000;return 10**Math.max(0,prestigeRequirementDepth(id)-1)};
export const prestigeUpgradeCostScientific=(id:PrestigeUpgradeId,level=0)=>ScientificNumber.from(prestigeUpgradeCost(id,level));
export const intYieldFactor=(s:GameState)=>{const runFactor=1+(hasNode(s,'milestoneMemory',1)?Math.min(1,s.runMilestoneEdges.length*.02):0)+(hasNode(s,'modelSynthesis',1)?Math.min(1.5,s.runTrainingCompleted*.03):0)+(hasNode(s,'researchArchive',1)?Math.min(2,s.runResearchCompleted*.05):0)+(equippedItems(s).find(item=>item.type==='insight-archive')?specialItemEffectQuote(s,equippedItems(s).find(item=>item.type==='insight-archive')!)!.appliedIntWeightContribution:0),resonance=1+.1*(s.axiomUpgradeLevels?.axiomResonance??0);return runFactor*resonance*resonance;};
export function selectOperatingProfile(s:GameState,id:OperatingProfileId){return BALANCE.operatingProfiles[id]?{...s,operatingProfile:id}:s;}
export const newResearchKeys=['dataPipeline','distributedInference','modelTransfer','materialRecycling','researchScheduling'] as const;
export const researchDuration=(id:ResearchProjectId)=>newResearchKeys.includes(id as typeof newResearchKeys[number])?BALANCE.researchKeyDurationSeconds:researchDurationForLevel(researchCategory(id),1);
export const researchProjectDataCostScientific=(id:ResearchProjectId)=>researchDataCostForLevelScientific(researchCategory(id),newResearchKeys.includes(id as typeof newResearchKeys[number])?BALANCE.researchKeyPricePower+1:1);
export const researchProjectDataCost=(id:ResearchProjectId)=>researchProjectDataCostScientific(id).toNumber(MAX_ECONOMY_VALUE);
export const researchLabCount=(s:GameState)=>Math.min(activeChallengeRules(s)?.labs??BALANCE.researchLabMax,1+(hasNode(s,'labs1',1)?1:0)+s.purchasedResearchLabs);
export function researchModifiers(s:GameState){return{alignment:s.completedResearch.includes('alignment')?BALANCE.researchAlignmentFactor:1,modelTransfer:s.completedResearch.includes('modelTransfer')&&s.runTrainingStarted<BALANCE.researchTransferStarts?BALANCE.researchTransferFactor:1,analysisCost:s.completedResearch.includes('dataPipeline')?BALANCE.researchAnalysisCostFactor:1,distributedInference:s.completedResearch.includes('distributedInference')||hasNode(s,'computeNetwork',1),materialRecycling:s.completedResearch.includes('materialRecycling')?Math.min(BALANCE.recoveryFraction,BALANCE.researchRecyclingFraction*(1+challengeFamilyBonus(s,'closed-supply-chain'))):0,queueCapacity:s.completedResearch.includes('operations')?4:2,director:hasNode(s,'labs4',1)&&s.completedResearch.includes('researchScheduling')};}
/** Applied permanent contributions only; economic magnitudes stay scientific. */
export function researchPerformanceQuote(s:GameState,now=s.savedAt,id?:ResearchId){
 const sources:Record<string,ScientificNumber>={};
 if(s.retention.activeRun?.id!=='no-items'){
  const amplifier=1+deepPrestigeBonus(s,'manufacturing');
  const validItems=equipmentSlots.flatMap((slot,index)=>index<equipmentSlotCount(s)?s.inventory.filter(item=>item.id===s.equipped[slot]&&itemTypes[item.type].slot===slot):[]);
  for(const item of validItems){const effect=itemEffectFor(s,item,'research');if(effect>0)sources[`item:${item.id}:${item.type}`]=ScientificNumber.from(effect).multiplyNumber(amplifier);}
  const itemSum=Object.values(sources).reduce((sum,v)=>sum.add(v),ScientificNumber.zero());if(!itemSum.isZero()){const applied=itemSum.add(ScientificNumber.from(1)).pow(itemSynergyExponent(s)).subtract(ScientificNumber.from(1));for(const key of Object.keys(sources))sources[key]=sources[key].divide(itemSum).multiply(applied);}
  const equipped=Object.fromEntries(equipmentSlots.map(slot=>[slot,validItems.find(item=>itemTypes[item.type].slot===slot)?.id??undefined])) as GameState['equipped'];
  const combo=itemCombinationQuote({...s,equipped},'training-research-link');if(combo.active)sources[`combination:${combo.id}`]=ScientificNumber.from(combo.contribution);
 }
 for(const id of hardwareIds)for(const m of reachedMilestones(id,s.hardwareCounts[id]))if(m.effect==='research')sources[`hardware:${id}:${m.threshold}`]=ScientificNumber.from(m.value);
 // The existing generic research milestone contribution is a separate permanent source.
 const milestone=milestoneSynergy(s).research-1;if(milestone>0)sources['hardware:milestone-synergy']=ScientificNumber.from(milestone*(1+challengeFamilyBonus(s,'serial-science')));
 const achievement=Math.min(BALANCE.achievementResearchCap,Math.floor(s.achievementPoints/10)*BALANCE.achievementResearchPerTen);if(achievement>0)sources.achievements=ScientificNumber.from(achievement);
 const labs=deepPrestigeBonus(s,'labs');if(labs>0)sources['prestige:deep-labs']=ScientificNumber.from(labs);
 if(s.researchLevels.autonomousScience>0)sources.autonomousScience=ScientificNumber.from(s.researchLevels.autonomousScience).multiplyNumber(BALANCE.researchAutonomousPerLevel);
 const bonusTotal=Object.values(sources).reduce((sum,v)=>sum.add(v),ScientificNumber.zero()),laborFactor=1+bonusTotal.add(ScientificNumber.from(1)).log10()*Math.LN10,temporaryFactors={deviceSwitch:id&&s.deviceProgress.lastResearchArea&&researchAreaFor(id)!==s.deviceProgress.lastResearchArea?1+deviceBonus(s,'areaSwitch'):1,labBoost:s.labBoostUntil>now?2:1,overclock:s.overclock.activeUntil>now&&(s.overclock.channel??'credits')==='research'?2:1};
 return{sources,bonusTotal,laborFactor,temporaryFactors};
}
export function researchPrerequisites(id:ResearchId):{id:ResearchId;level:number}[]{
 const keys:Partial<Record<ResearchId,{id:ResearchId;level:number}[]>>={dataPipeline:[{id:'dataFlywheel',level:5}],distributedInference:[{id:'parallelArchitecture',level:5}],modelTransfer:[{id:'recursiveLearning',level:5}],materialRecycling:[{id:'materialAnalysis',level:5},{id:'blueprintAnalysis',level:5}],researchScheduling:[{id:'operations',level:1},{id:'autonomousScience',level:5}]};
 if(keys[id])return keys[id]!;if(!isRepeatableResearch(id))return[];const required=BALANCE.repeatableResearch[id].requires;return required?[{id:required,level:1}]:[];
}
export const researchLevel=(s:GameState,id:ResearchId)=>isRepeatableResearch(id)?s.researchLevels[id]:s.completedResearch.includes(id)?1:0;
export const researchMissingRequirements=(s:GameState,id:ResearchId)=>researchPrerequisites(id).filter(r=>researchLevel(s,r.id)<r.level);
export const researchRequirement=(s:GameState,id:ResearchId)=>researchMissingRequirements(s,id)[0]?.id??null;
export function researchQuote(s:GameState,id:ResearchId){
 const repeat=isRepeatableResearch(id),known=repeat||Object.hasOwn(BALANCE.researchProjects,id);if(!known)return null;
 const level=repeat?s.researchLevels[id]+1:1,slot=s.researchLabs.findIndex((x,i)=>i<researchLabCount(s)&&x===null),requirements=researchMissingRequirements(s,id),requirement=requirements[0]?.id??null,running=s.researchLabs.find(x=>x?.id===id),done=!repeat&&s.completedResearch.includes(id),cost=repeat?repeatableResearchDataCostScientific(id,level):researchProjectDataCostScientific(id),access=researchAccess(s,id),ledgerValid=validEconomyValues(s,['credits','data']),resources=ledgerValid?scientificAffordability(exactEconomyValue(s,'data'),cost,dataRateScientific(s)):unavailableAffordability(cost),performance=researchPerformanceQuote(s,s.savedAt,id),baseDuration=repeat?repeatableResearchDuration(id,level):researchDuration(id),rawDuration=baseDuration/performance.laborFactor/performance.temporaryFactors.labBoost/performance.temporaryFactors.overclock/performance.temporaryFactors.deviceSwitch,duration=Math.max(BALANCE.researchMinimumSeconds,rawDuration),reason=!ledgerValid?'invalid-resources':activeChallengeRules(s)?.alternateResearch&&s.deviceProgress.lastResearchArea===researchAreaFor(id)?'challenge-rule':!access.allowed?'area':requirement?'requirement':done?'completed':running?'running':slot<0?'lab':!resources.affordable?'data':null;
 return{id,access,level,slot,requirements,requirement,running,done,cost,resources,baseDuration,...performance,minimumApplied:rawDuration<=BALANCE.researchMinimumSeconds,duration,reason,allowed:reason===null};
}
export const researchPreview=researchQuote;
export const researchDurationAtStart=(s:GameState,id:ResearchId,_level:number)=>researchQuote(s,id)!.duration;
export const researchQueueCapacity=(s:GameState)=>researchModifiers(s).queueCapacity;
export function researchQueuePreview(s:GameState,id:ResearchId){const quote=researchQuote(s,id),reason=!quote?'unknown':!researchQueueUnlocked(s)?'locked':!quote.access.allowed?'area':quote.done?'completed':quote.requirement?'requirement':quote.running?'running':s.researchQueue.includes(id)?'queued':s.researchQueue.length>=researchQueueCapacity(s)?'full':null;return{allowed:reason===null,reason,level:quote?.level??1};}
export function queueResearchProject(s:GameState,id:ResearchId){return researchQueuePreview(s,id).allowed?{...s,researchQueue:[...s.researchQueue,id]}:s;}
export function removeQueuedResearch(s:GameState,target:number|string){const index=typeof target==='string'?s.researchQueue.findIndex(id=>id===target):target;return !Number.isSafeInteger(index)||index<0||index>=s.researchQueue.length?s:{...s,researchQueue:s.researchQueue.filter((_,i)=>i!==index)};}
export function startResearchProject(s:GameState,id:ResearchId){const preview=researchQuote(s,id);if(!preview?.allowed)return s;const {slot,level,duration}=preview,dataCostExact=preview.cost,dataCost=dataCostExact.toNumber(MAX_ECONOMY_VALUE),jobId=`research-${s.nextId}`,quoteBasis:ResearchStartBasis={baseDuration:preview.baseDuration,sources:Object.fromEntries(Object.entries(preview.sources).map(([id,v])=>[id,v.toJSON()])),bonusTotal:preview.bonusTotal.toJSON(),laborFactor:preview.laborFactor,temporaryFactors:preview.temporaryFactors,minimumApplied:preview.minimumApplied};const labs=[...s.researchLabs];labs[slot]={id,jobId,quoteBasis,level,startedAt:s.savedAt,endsAt:s.savedAt+duration*1000,durationSeconds:duration,dataCost,dataCostExact:dataCostExact.toJSON()};const paid=spendScientificResources(s,ScientificNumber.zero(),dataCostExact);return addEvent({...paid,deviceProgress:{...s.deviceProgress,lastResearchArea:researchAreaFor(id)??null},nextId:s.nextId+1,researchLabs:labs,lifetime:{...s.lifetime,researchStarted:s.lifetime.researchStarted+1}},'research-start',s.savedAt,{id,jobId,level,labId:slot,dataCost,durationSeconds:duration,baseDuration:preview.baseDuration,quoteBasis:JSON.stringify(quoteBasis),startedAt:s.savedAt,endsAt:s.savedAt+duration*1000,exactDataCost:dataCostExact.toScientificString(16)});}
export const buyResearchProject=startResearchProject;
export function buyResearchLab(s:GameState){return s;}
export function hardwarePurchasePreview(s:GameState,id:HardwareId,count:number|'max'=1){
 const known=hardwareIds.includes(id),owned=known?s.hardwareCounts[id]:0,amount=known&&count==='max'?maxAffordable(id,owned,s.credits,s):count==='max'?0:count,valid=known&&Number.isSafeInteger(s.hardware)&&s.hardware>=0&&Number.isSafeInteger(owned)&&owned>=0&&Number.isSafeInteger(amount)&&(amount>0||(count==='max'&&amount===0))&&Number.isSafeInteger(owned+amount)&&validEconomyValues(s,['credits']),restricted=!!activeChallengeRules(s)&&hardwareIds.indexOf(id)>=activeChallengeRules(s)!.classLimit;
 const cost=valid?hardwareBulkCostScientific(id,owned,amount||1,s):ScientificNumber.zero(),resources=valid?scientificAffordability(exactEconomyValue(s,'credits'),cost):unavailableAffordability(cost),reason=!valid?'invalid-quantity':restricted?'challenge-rule':amount===0||!canAffordScientificCreditCost(s,cost)?'credits':null;
 const result=valid&&amount>0?{...s,...hardwareOwnershipAfter(s,id,amount)}:null;const materialQuote=valid&&amount>0?hardwarePurchaseMaterialQuote(s,id,amount):null,predicted=result&&materialQuote?{...result,discoveredComponents:[...new Set([...s.discoveredComponents,...Object.entries(materialQuote.components).filter(([,n])=>Number(n)>0).map(([id])=>id as ComponentId)])]}:result;return{materials:materialQuote,id,owned,amount,cost,resources,reason,allowed:reason===null,dataComparison:result?dataProductionComparison(s,predicted!):null,computeGain:result?computeRateScientific(predicted!.hardware,predicted!).subtract(computeRateScientific(s.hardware,s)):ScientificNumber.zero(),creditGain:result?creditRateScientific(predicted!.hardware,predicted!.level,predicted!,predicted!.savedAt).subtract(creditRateScientific(s.hardware,s.level,s,s.savedAt)):ScientificNumber.zero()};
}
export function buyHardwareClass(s:GameState,id:HardwareId,count:number|'max'=1){
 const preview=hardwarePurchasePreview(s,id,count);if(!preview.allowed)return s;const {owned,amount}=preview,costExact=preview.cost;
 const paid=spendScientificCredits(s,costExact);
 if(paid===s)return s;
 const cost=costExact.toNumber(MAX_ECONOMY_VALUE),creditsBefore=s.credits,computeBefore=computeRate(s.hardware,s),rateBefore=creditRate(s.hardware,s.level,s,s.savedAt);
 const ownership=hardwareOwnershipAfter(s,id,amount),counts=ownership.hardwareCounts,discovered=ownership.discovered,completed=[...s.onboarding.completed];for(const event of ['first-buy',...(counts.calculator>=10?['ten-calculators']:[]),...(discovered.includes('sbc')?['discover-sbc']:[]),...(counts.calculator>=25?['class-upgrade']:[])])if(!completed.includes(event))completed.push(event);
 const classes=s.lifetime.hardwareClasses.includes(id)?s.lifetime.hardwareClasses:[...s.lifetime.hardwareClasses,id];let next:GameState={...paid,...ownership,onboarding:{...s.onboarding,completed},lifetime:{...s.lifetime,hardwareBought:s.lifetime.hardwareBought+amount,calculatorsBought:s.lifetime.calculatorsBought+(id==='calculator'?amount:0),hardwareClasses:classes}};
 const computeAfter=computeRate(next.hardware,next),rateAfter=creditRate(next.hardware,next.level,next,next.savedAt),nextMilestone=BALANCE.hardware[id].milestones.find(m=>m.threshold>counts[id])?.threshold??null;
 next=addEvent(next,'hardware-purchase',s.savedAt,{id,amount,unitCost:hardwareCostScientific(id,owned,s).toNumber(MAX_ECONOMY_VALUE),exactUnitCost:hardwareCostScientific(id,owned,s).toScientificString(16),cost,exactCost:costExact.toScientificString(16),creditsBefore,creditsAfter:next.credits,computeBefore,computeAfter,rateBefore,rateAfter,nextMilestone,paybackSeconds:rateAfter>rateBefore?cost/(rateAfter-rateBefore):null,ownedAfter:counts[id]});
 if(next.retention.activeRun){const m=next.retention.activeRun.metrics!;next=addChallengeMetrics(next,{hardwarePurchases:m.hardwarePurchases+1});}next=unlockPaidHardwareMaterials(next,id);
 for(const milestone of BALANCE.hardware[id].milestones)if(owned<milestone.threshold&&counts[id]>=milestone.threshold){next={...next,lifetime:{...next.lifetime,milestones:next.lifetime.milestones+1},runMilestoneClasses:next.runMilestoneClasses.includes(id)?next.runMilestoneClasses:[...next.runMilestoneClasses,id]};next=addEvent(next,'hardware-milestone',s.savedAt,{id,threshold:milestone.threshold,label:milestone.label,effect:milestone.effect,effectValue:milestone.value,computeBefore,computeAfter},true);const key=`${id}:${milestone.threshold}`;if(!next.runMilestoneEdges.includes(key))next={...next,runMilestoneEdges:[...next.runMilestoneEdges,key]};next=grantPaidHardwareMilestone(next,id,milestone.threshold);if(next.retention.activeRun)next=addChallengeMetrics(next,{milestones:next.retention.activeRun.metrics!.milestones+1});}

 return next;
}
export const shoppingAgentUnlocked=(s:GameState)=>hasNode(s,'shoppingAgent',1)||s.axiomUpgrades.includes('anchoredShoppingAgent');
export const hardwareAutobuyerUnlocked=(s:GameState,id:HardwareId)=>s.hardwareCounts[id]>=BALANCE.hardwareAutobuyerUnlock||(shoppingAgentUnlocked(s)&&(id==='calculator'||id==='sbc'));
export function toggleHardwareAutobuyer(s:GameState,id:HardwareId){return hardwareAutobuyerUnlocked(s,id)?{...s,hardwareAutoBuyers:{...s.hardwareAutoBuyers,[id]:!s.hardwareAutoBuyers[id]}}:s;}
export function buyHardware(s:GameState,count=1){return buyHardwareClass(s,'calculator',count)}
export const classUpgradeCost=(id:HardwareId,s:GameState)=>hardwareCost(id,BALANCE.classUpgradeCount,s)*BALANCE.classUpgradeCostFactor;
export function classUpgradePreview(s:GameState,id:HardwareId){const valid=hardwareIds.includes(id),cost=valid?hardwareCostScientific(id,BALANCE.classUpgradeCount,s).multiplyNumber(BALANCE.classUpgradeCostFactor):ScientificNumber.zero(),materials=valid?classUpgradePackageQuote(s,id):null,reason=!valid?'unknown':s.classUpgrades.includes(id)||s.materials.classUpgrades.includes(id)?'owned':s.hardwareCounts[id]<BALANCE.classUpgradeMinimum?'milestone':hardwareIds.indexOf(id)>=(activeChallengeRules(s)?.classLimit??15)?'challenge-rule':!canAffordScientificCreditCost(s,cost)?'credits':null;return{id,cost,materials,reason,allowed:reason===null};}
export function buyClassUpgrade(s:GameState,id:HardwareId){const q=classUpgradePreview(s,id);if(!q.allowed||!q.materials?.allowed)return s;const paid=spendScientificCredits(s,q.cost);if(paid===s)return s;return addEvent(grantComponents({...paid,classUpgrades:[...s.classUpgrades,id],materials:{...s.materials,classUpgrades:[...s.materials.classUpgrades,id],hardwareRemainders:q.materials.remainders}},q.materials.components),'component-found',s.savedAt,{source:'paid-class-upgrade',hardware:id,components:JSON.stringify(q.materials.components),exactCreditCost:q.cost.toScientificString(16)},true);}
export function addCreditsScientific(s:GameState,delta:ScientificNumber,eligible=true,production=eligible){if(!ScientificNumber.isValid(delta)||!validEconomyValues(s,eligible?['credits','runCreditsEarned','lifetimeCreditsEarned','lifetimeEligibleCredits','cycleEligibleCredits']:['credits'])||(production&&!validResourceNumber(s.lifetime.regularCredits)))return s;let next=exactSet(s,'credits',exactEconomyValue(s,'credits').add(delta));if(eligible){next=exactSet(next,'runCreditsEarned',exactEconomyValue(s,'runCreditsEarned').add(delta));next=exactSet(next,'lifetimeCreditsEarned',exactEconomyValue(s,'lifetimeCreditsEarned').add(delta));next=exactSet(next,'lifetimeEligibleCredits',exactEconomyValue(s,'lifetimeEligibleCredits').add(delta));next=exactSet(next,'cycleEligibleCredits',exactEconomyValue(s,'cycleEligibleCredits').add(delta.multiplyNumber(intYieldFactor(s))));}return {...next,lifetime:production?{...s.lifetime,regularCredits:safeEconomyAdd(s.lifetime.regularCredits,delta.toNumber(MAX_ECONOMY_VALUE))}:s.lifetime};}
export function addCredits(s:GameState,value:number,eligible=true,production=eligible){return validResourceNumber(value)?addCreditsScientific(s,ScientificNumber.from(value),eligible,production):s;}
export const impulseNetworkBonus=(s:GameState,now=s.savedAt)=>hasNode(s,'impulseNetwork',1)?creditRate(s.hardware,s.level,s,now,false)*Math.min(BALANCE.impulseNetworkCap,Math.floor(s.hardwareCounts.calculator/10)*BALANCE.impulseNetworkPerTen):0;
export const tapPrestigeMultiplier=(s:GameState)=>1+(hasNode(s,'computeNet2',1)?.35:hasNode(s,'computeNet1',1)?.15:0)+(hasNode(s,'computeNet4',1)?.50:0)+(hasNode(s,'computeNet7',1)?.75:0);
export const tapDropMultiplier=(s:GameState)=>Math.max(.25,(1+s.researchLevels.dropProtocols*BALANCE.repeatableResearch.dropProtocols.effectPerLevel)*(1+equippedBonus(s,'drop'))*(1+(hasNode(s,'analysis4',1)?.25:0)+(hasNode(s,'analysis7',1)?.50:0)));
export const tapCreditsScientific=(s:GameState,now=s.savedAt)=>{if(s.retention.activeRun?.id==='no-taps')return ScientificNumber.zero();const activeScaling=ScientificNumber.from(1+BALANCE.tapQualityCoefficient*softcap(s.qualityLevel,25)+milestoneBonus(s,'tap')+equippedBonus(s,'tap'));const research=ScientificNumber.from(1+BALANCE.repeatableResearch.tapAmplification.effectPerLevel).pow(s.researchLevels.tapAmplification);const combo=1+Math.min(BALANCE.tapComboCap,s.overclock.taps)*BALANCE.tapComboPerTap;const crit=(s.lifetime.taps+1)%Math.max(2,Math.round(1/BALANCE.tapCritBase))===0?BALANCE.tapCritMultiplier:1;return creditRateScientific(s.hardware,s.level,s,now,false).multiplyNumber(BALANCE.tapRateFraction).add(ScientificNumber.from(BALANCE.baseTapCredits)).multiply(activeScaling).multiply(research).multiplyNumber(tapPrestigeMultiplier(s)*combo*crit).add(ScientificNumber.from(impulseNetworkBonus(s,now)));};
export const tapCredits=(s:GameState,now=s.savedAt)=>tapCreditsScientific(s,now).toNumber(MAX_ECONOMY_VALUE);
export function registerTap(s:GameState,now:number){if(s.retention.activeRun?.id==='no-taps')return s;const base=tapCreditsScientific(s,now),relayId=s.equipped.processor,candidate=s.inventory.find(i=>i.id===relayId&&i.type==='impulse-relay'),quote=candidate?specialItemEffectQuote(s,candidate):null,relay=quote?.active?candidate:undefined,paid=!base.isZero(),relayCount=(relay?.relayTaps??0)+(paid?1:0),relayBonus=relay&&paid&&relayCount%(quote!.triggerInterval as number)===0?creditRateScientific(s.hardware,s.level,s,now,false).multiplyNumber(quote!.appliedBonusSeconds):ScientificNumber.zero(),total=base.add(relayBonus),reward=total.toNumber(MAX_ECONOMY_VALUE),inventory=relay&&paid?s.inventory.map(i=>i.id===relay.id?{...i,relayTaps:relayCount}:i):s.inventory,nextTaps=s.overclock.taps+1,triggered=nextTaps>=BALANCE.overclockTaps,duration=BALANCE.overclockSeconds*(1+milestoneBonus(s,'overclock'))*(1+deviceBonus(s,'overclockDuration')),overclock=triggered?{...s.overclock,taps:0,charged:false,activeUntil:now+duration*1000,cooldownUntil:now+duration*1000}:{...s.overclock,taps:nextTaps,charged:false};const feedback=now-s.feedback.windowStartedAt>=60000?{windowStartedAt:now,work:0}:s.feedback;return addMetrics(addCreditsScientific({...s,inventory,lifetime:{...s.lifetime,taps:s.lifetime.taps+1,overclocks:s.lifetime.overclocks+(triggered?1:0)},feedback,overclock},total,true,false),now,{taps:1,tap:reward});}
export function selectOverclockChannel(s:GameState,channel:OverclockChannel){return hasNode(s,'overclockSwitch',1)&&s.overclock.activeUntil<=s.savedAt?{...s,overclock:{...s.overclock,channel}}:s}
export function activateOverclock(s:GameState,now:number){if(s.retention.activeRun?.id==='no-taps')return s;const duration=BALANCE.overclockSeconds*(1+milestoneBonus(s,'overclock'))*(1+deviceBonus(s,'overclockDuration'));return !s.overclock.charged||now<s.overclock.cooldownUntil?s:{...s,lifetime:{...s.lifetime,overclocks:s.lifetime.overclocks+1},overclock:{...s.overclock,taps:0,charged:false,activeUntil:now+duration*1000,cooldownUntil:now+BALANCE.overclockCooldownSeconds*1000}};}

/** Reproducible layer-one measurement: no taps, training, research, items, quests or prestige. */
export type LayerOneProfile={baseCosts:readonly number[];growth:readonly number[];compute:readonly number[]};
export const layerOneProfile=():LayerOneProfile=>({baseCosts:hardwareIds.map(id=>BALANCE.hardware[id].baseCost),growth:hardwareIds.map(id=>BALANCE.hardware[id].growth),compute:hardwareIds.map(id=>BALANCE.hardware[id].compute)});
export const legacyLayerOneProfile=():LayerOneProfile=>({baseCosts:[10,180,2400,32000,450000,6000000,80000000,1e14,1e20,1e28,1e38,1e52,1e70,1e95,1e125],growth:[1.15,1.15,1.15,1.15,1.16,1.16,1.17,1.19,1.20,1.21,1.22,1.23,1.24,1.26,1.28],compute:[1,12,120,1200,9000,75000,650000,5e6,4e7,3e8,2e9,1e15,1e22,1e35,1e55]});
export const isolatedClassComputeScientific=(profile:LayerOneProfile,index:number,count:number)=>ScientificNumber.from(profile.compute[index]??0).multiplyNumber(Math.max(0,count)).multiplyNumber(milestoneFactor(hardwareIds[index],count));
export const isolatedCreditRateScientific=(profile:LayerOneProfile,counts:readonly number[])=>counts.reduce((sum,count,index)=>sum.add(isolatedClassComputeScientific(profile,index,count)),ScientificNumber.zero());
export const isolatedHardwareCostScientific=(profile:LayerOneProfile,index:number,owned:number)=>ScientificNumber.from(profile.baseCosts[index]??0).multiply(ScientificNumber.from(profile.growth[index]??1).pow(owned));
export const isolatedBulkCostScientific=(profile:LayerOneProfile,index:number,owned:number,count:number)=>{if(!Number.isSafeInteger(count)||count<=0)return ScientificNumber.zero();const growth=profile.growth[index],first=isolatedHardwareCostScientific(profile,index,owned);if(count===1)return first;return growth===1?first.multiplyNumber(count):first.multiply(ScientificNumber.from(growth).pow(count).subtract(ScientificNumber.from(1))).divideNumber(growth-1);};
