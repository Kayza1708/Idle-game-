# Idle Intelligence V3 — Unity only

**Source:** `IdleIntelligence/` contains the native C# changes. No V3 changes to TypeScript are required by this branch. This remains an **unmerged draft** until native Unity Editor tests and an actual Player test succeed.

## Implemented on the native Unity branch

- 42 item identifiers, with old 36 positions unchanged, native-only six recipes, module/material costs and late-progression gates.
- Real C# per-event contracts: gradient carry only on regular paid training work; capacitor charge from paid research completions with idempotent receipts; axiom anchor after true axiom reset only.
- Compute, synthesis and axiom memory combinations: fleet coordinator, raw hardware singularity lens and synthesis work; two-stage 15-minute axiom memory; scientific-library blueprint progress on real fifth analysis completion.
- Native 32x32 point-filtered sprites for each of the six new items and current-value/combination item-detail descriptions.
- Explicit opt-in migration from 36 to 42 items, preserving old ordinal ownership, mastered blueprints, paid resources, equipped items and isolated challenge main state. Unity save envelope v25 persists V3 counters; old v24 source is copied before switching.
- Native Core (without Editor dependencies) compiles and runs smoke assertions using `dotnet run --project IdleIntelligence/NativeChecks/UnityCoreCheck.csproj -c Release`.

## What is verified

GitHub Action `Unity V3 CSharp core checks` compiles `IdleIntelligence/Assets/IdleIntelligence/Core` and runs direct C# transactions. `UnityV3CompletionTests.cs` additionally defines NUnit tests for the Editor, including old v24 import, save roundtrip, 42 native item types and live combination contracts. These Editor tests **are not claimed as executed** until run in the Unity Test Runner.

## Native Editor and player acceptance on macOS

1. Open the `IdleIntelligence` project with the Unity Editor version pinned in `ProjectSettings/ProjectVersion.txt`.
2. Open **Window → General → Test Runner**, select **EditMode**, and run `UnityV3CompletionTests` and the full suite. Then run the existing PlayMode tests.
3. Use **Idle Intelligence → V3 → Build macOS Smoke Player** to produce `Builds/V3-Smoke.app`, launch it and test a new profile, all six item details, paid research/training completions, prestige and axiom resets, challenge return and save/reload.
4. Use **Idle Intelligence → V3 → Build iOS Player** to produce `Builds/V3-iOS`. Open the generated Xcode project, run it on an iPhone or simulator and verify UI, 30-minute credited-duration behavior and storage migration before any store submission.
5. On a copied **v24** save, use Storage → Preview Unity V3 migration. Confirm that ownership, INT, axioms, paid jobs, equipped IDs and challenge main are unchanged. Only then explicitly opt in. Confirm there is an untouched file in `V3Originals`.

The build menu items require an installed licensed Unity editor and relevant platform modules. Their presence alone does **not** establish that any player was built or launched.

## Release blockers

- **CI type scope:** Core C# smoke is not a substitute for Unity Editor/Runtime UnityEngine compile, EditMode/PlayMode testing, an iOS Xcode build or playtesting.
- Original Unity generated reference fixtures still describe 36 historical items. The new six are kept separate in a Unity-owned extension. A repo-wide TypeScript export check may flag the intentional native-only table change; do not claim old fixture parity for the new six.
- Verify the broader 12 combinations and all Prestige/Axiom interactions during Editor/Player tests; current unit contracts do not establish a multi-week natural retention/balance playthrough.
- Do not merge, update existing production saves automatically, or publish the Player until these gates pass.
