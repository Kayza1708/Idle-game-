# Idle Intelligence

**Hauptprojekt: natives Mobile-Idle-Game mit Unity 6.** Die spielbare Fassung wird in `IdleIntelligence/` entwickelt. Die frühere TypeScript-/Capacitor-Version ist aktuell ein **Legacy-Referenzprojekt**, kein zweites Spiel, das weiterentwickelt werden soll.

## Selbst testen (neuer V3-Spielstand)

1. Unity Hub öffnen und `IdleIntelligence/` als Projekt hinzufügen.
2. Mit **Unity 6000.3.26f1** öffnen (`IdleIntelligence/ProjectSettings/ProjectVersion.txt`).
3. Szene `Assets/Scenes/IdleIntelligence.unity` starten; V3 wird für neue Kampagnen automatisch aktiviert.
4. Editor-Test Runner → EditMode und PlayMode ausführen; die Tests laufen nicht über den Web-Browser.
5. Über **Idle Intelligence → V3 → Build macOS Smoke Player** beziehungsweise **Build iOS Player** die Testversion bauen. Ein erfolgreicher GitHub-C#-Core-Test ersetzt keinen Unity-/Xcode-Build.

V3-Stand und Testkriterien: [IdleIntelligence/V3_NATIVE_STATUS.md](IdleIntelligence/V3_NATIVE_STATUS.md). Gameplay-/Balance-Simulationen: [V3_BALANCE_BASELINE.md](IdleIntelligence/V3_BALANCE_BASELINE.md). Für einen neuen Spielstand werden keine alten Saves benötigt.

## Projektstruktur

| Ordner | Bedeutung | Status |
|---|---|---|
| `IdleIntelligence/Assets/IdleIntelligence/Core` | native C#-Spielregeln, Save-/Produktions-/Itemlogik | aktiv |
| `IdleIntelligence/Assets/IdleIntelligence/Runtime` | Unity UI, Animationen, Store-/Werbeanbieter-Adapter | aktiv |
| `IdleIntelligence/Assets/IdleIntelligence/Tests` | EditMode-/PlayMode- und Sourceparität | **behalten** bis vollständige native Abnahme |
| `IdleIntelligence/NativeChecks` | C#-Core-Smoketests und Balance-Pfade | aktiv |
| `IdleIntelligence/Assets/IdleIntelligence/Resources`, `Art` | verwendete Szenen-/Pixelgrafik-/Audioressourcen | aktiv |
| `src/`, `scripts/`, `public/`, `package.json` | frühere Web-App, alte Balance-/Exportquelle und Unity-Referenzgeneratoren | **noch nicht löschbar** |
| `cloudflare/` | Company-/Leaderboard-Backend | separat prüfen, keine pauschale Löschung |
| `docs/` | Entwicklernotizen und ältere Prüfbelege | teilweise archiviert; nicht Bestandteil des Unity-Players |

## Status und Freigabe

Der aktuelle **Unity-Core** besitzt native 42-Item-/Prestige-/Axiom-Systeme und einen automatisierten Balancing-Smoke. Das ist **keine vollständige Plattformfreigabe**. Noch erforderlich: vollständiger Unity-Editor-/Player-Test, monetarisierte echte Mobile-Sessions, datenschutzkonforme Anzeigen und native Storekäufe mit verifizierten Transaktionen, Device-Safe-Area/Touchprüfung, Crash-/Analytics-Messung, LiveOps und Nutzertests.

Die geschlossenen PRs [#162](https://github.com/Kayza1708/Idle-game-/pull/162) und [#163](https://github.com/Kayza1708/Idle-game-/pull/163) haben unterschiedliche Basisbranches: #163 wurde **nach** dem Merge von #162 in dessen Arbeitsbranch gemergt. Daraus folgt **nicht**, dass die SDK-Werbeänderungen von #163 in `main` gelandet sind. Bei Änderungen immer die tatsächliche `main`-Dateiliste prüfen.

### Warum TypeScript noch im Repository liegt

Zahlreiche `*.g.cs`-Dateien, Referenz-`JSON`-Fixtures, Copy- und Testfälle stammen aus `scripts/export-unity-*.ts` und der früheren TypeScript-Spielquelle. Der allgemeine `Game checks`-Workflow hat zuletzt Abweichungen zwischen dem alten 36- und dem neuen 42-Item-Katalog gemeldet. **Eine vollständige funktionale 1:1-Übernahme ist damit noch nicht bewiesen.**

Die Web-App und ihre Tests sollen nicht mehr erweitert werden. Die Löschung von `src/`, `scripts/`, `public/` und den alten Tests erfolgt erst, wenn das Unity-Projekt alle benötigten Daten **eigenständig** reproduzierbar bereitstellt, native Tests gegen feste verifizierte Referenzen bestehen und die alte Unity-Export-CI durch eine funktionierende Unity-only-CI ersetzt ist. Danach kann der Legacy-Stand separat markiert/archiviert und in einem eigenen PR entfernt werden.

## Entwicklerchecks

Native Spiellogik ohne UnityEngine testen:

```bash
dotnet run --project IdleIntelligence/NativeChecks/UnityCoreCheck.csproj -c Release
dotnet run --project IdleIntelligence/NativeChecks/UnityCoreCheck.csproj -c Release -- --balance
```

Legacy-Verträge nur bei Änderungen an deren Exporten oder zur Paritätsprüfung ausführen:

```bash
npm ci
npm run typecheck
npm test
npm run unity:export
```

Die alte CI kann bis zur Ablösung der Unity-Exporter rot sein; Fehler nicht als Erfolg deklarieren und Tests nicht einfach abschalten.

## Cleanup

Die ersten Unity-Designaufnahmen (01–03) wurden aus dem aktiven Dateibaum entfernt, weil sie nur historische Prüfbilder und Videos waren. Sie bleiben in der Git-Historie abrufbar. Aktuelle Playerassets, Source-Referenzdaten, Lizenzen und produktive C#-Tests bleiben erhalten. Weitere Entschlackung wird unter [docs/UNITY_REPO_CLEANUP.md](docs/UNITY_REPO_CLEANUP.md) erfasst.

Das Projekt enthält selbst erstellte Sounds und die Original-Master unter den dokumentierten Assets. Audio-/Grafik-Lizenzen und Unity-Asset-`.meta`-GUIDs müssen bei jeder Bereinigung erhalten bleiben.
