import {
  newGame,
  addCredits,
  addData,
  buyHardwareClass,
  computeRateScientific,
  usersRateScientific,
  creditRateScientific,
  dataRateScientific,
  selectOperatingProfile,
  type GameState,
} from "../src/economy";
let early = buyHardwareClass(newGame(0), "calculator");
let hardware = addData(addCredits(newGame(0), 1e6, false), 1e6);
hardware = buyHardwareClass(
  buyHardwareClass(hardware, "calculator", 25),
  "sbc",
);
const bonuses: GameState = {
  ...hardware,
  qualityLevel: 5,
  efficiencyLevel: 3,
  level: 8,
  researchLevels: {
    ...hardware.researchLevels,
    computeOptimization: 2,
    userScaling: 2,
    commercialization: 3,
  },
  nodes: ["computeNet1"],
  totalAxiomsEarned: 2,
};
console.log(
  JSON.stringify(
    [
      ["early", early],
      ["hardware", hardware],
      ["bonuses", bonuses],
    ].flatMap(([name, state]) =>
      (["balanced", "training", "discovery"] as const).map((profile) => {
        const s = selectOperatingProfile(state as GameState, profile);
        return {
          name,
          profile,
          compute: computeRateScientific(s.hardware, s).toScientificString(16),
          users: usersRateScientific(s).toScientificString(16),
          credits: creditRateScientific(
            s.hardware,
            s.level,
            s,
          ).toScientificString(16),
          data: dataRateScientific(s).toScientificString(16),
        };
      }),
    ),
    null,
    2,
  ),
);
