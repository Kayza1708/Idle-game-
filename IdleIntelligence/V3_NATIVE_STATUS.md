# Idle Intelligence V3 — nativer Unity-Teststand

**Aktueller Stand am 30.10.2026:** Die Unity-PRs [#161](https://github.com/Kayza1708/Idle-game-/pull/161) und [#162](https://github.com/Kayza1708/Idle-game-/pull/162) sind in `main` gemergt; die native Unity-V3 inklusive 120-Minuten-Messung ist dort. [PR #163](https://github.com/Kayza1708/Idle-game-/pull/163) (Rewarded Ads) wurde erst nach dem Merge von #162 in dessen **Featurebranch** gemergt. Die Ads-Änderungen sind deshalb **nicht automatisch in `main` angekommen**. Die Unity-Version in `main` ist für vollständige Store-/Player-Freigabe nicht nachgewiesen.

Alle Spielcodeänderungen dieser Weiterentwicklung liegen in **`IdleIntelligence/` (Unity/C#)**. TypeScript bleibt unverändert.

## V3-Start ohne Altspielstand

Der produktive Unity-Spielstart ruft `Game.NewV3(...)` auf und aktiviert alle V3-Regeln von der ersten Session an. Gespeichert wird unter:

`Application.persistentDataPath/idle-intelligence-unity-v3.json`

Die vorherige Unity-Datei `unity-slice-v1.json` wird dabei **nicht geladen oder überschrieben**. Die Aktion „Neue Kampagne“ startet ebenfalls erneut mit V3. Du brauchst weder eine Datenmigration noch alte Item-/Progressionswerte.

## Was implementiert ist

- 42 native Items, sechs neue bezahlte Rezepte, native Freischaltbedingungen und sieben sprachspezifische Namen (`en,de,es,fr,pt,it,pl`).
- Gradientenspeicher, Overdrive-Kondensator, Axiomanker, Flottenkoordinator, Synthesekoordinator und Singularitätslinse mit Berechnungen im Unity-C#-Gameplay.
- 12 Itemkombinationen, darunter zeitabhängiger Axiom-Resetvertrag, Forschungstransfer, Synthese-Ausbeute und die fünfte Analyse der Wissenschaftlichen Bibliothek.
- Native 32×32-Pixelmotive, Inventar-/Bauplan-/Itemdetail-Anzeige, Werte und Ausrüstungsbedingungen.
- Atomare native Unity-V3-Speicherung (Version 25), ohne dass eine V2-Migration für den Spielstart benötigt wird.

## Erfolgreiche native C#-Checks

- Neue V3: erster Hardwarekauf, aktive 30 Sekunden Produktion, bezahltes Training und Forschungsstart mit echten Ereignis-IDs.
- Alle sechs Items: Rezeptbezahlung, Herstellung, Inventarzähler, Wiederherstellung des Zustands.
- Alle **12 Itemkombinationen**, mit tatsächlich ausgerüsteten, slotkonformen Items und ihren Rechenpfaden.
- Alle **60 Prestige-Nodes** und **24 Axiome**: native Compute-/Credits-/Daten-/Training-/Forschungsrechenpfade; außerdem zehn KI-Modelle im Katalog.
- Kein unendlicher Overdrive-Kondensator-Speicher: jüngste 256 Forschungsbelege plus einmalige reguläre Completion.
- **120-Minuten-Balance-Probe** mit bezahlten Gameplayaktionen ohne Ressourcengeschenke, als CSV in den GitHub-Actions-Artefakten.

Daten, Strategie, Einschränkungen: [V3_BALANCE_BASELINE.md](V3_BALANCE_BASELINE.md). Die erste INT-Freigabe liegt bei der einfachen Botstrategie zwischen Minute 90 und Minute 120.

Diese Prüfungen bauen den echten C#-Core mit .NET. **Das ist kein erfolgreicher Unity-Editor-, PlayMode- oder nativer iOS-Player-Build.**

## Jetzt auf deinem Mac testen

1. In deinem Repository `git fetch origin` und `git switch codex/unity-v3-fresh-playtest-20261030` ausführen (vorher ungespeicherte lokale Änderungen sichern).
2. Mit **Unity 6000.3.26f1** den Projektordner `IdleIntelligence/` öffnen.
3. Im Unity-Editor die Szene starten. Dadurch wird ein **frischer V3-Spielstand** unter dem neuen Dateinamen angelegt. Die alte `unity-slice-v1.json` bleibt unangetastet.
4. Über **Window → General → Test Runner → EditMode** die Testklasse `UnityV3CompletionTests` und anschließend die komplette Testsuite ausführen. PlayMode-Tests separat ausführen.
5. Über **Idle Intelligence → V3 → Build macOS Smoke Player** den nativen macOS-Testplayer bauen. Hardware, Training, Forschung, Itemmenü, Prestige, Axiome, Boni, Save/Reload und Challenge-Rückkehr prüfen.
6. Über **Idle Intelligence → V3 → Build iOS Player** den iOS-Player erstellen; das Xcode-Projekt auf iPhone oder Simulator auf Touchbedienung, UI, Performance und Speicherzugriffe testen.

Der tatsächliche Unity-Player-Build erfordert lokal einen lauffähigen Unity-Editor und das passende Buildmodul. Es wird durch das Vorhandensein der Build-Menüs **nicht** behauptet, dass ein solcher Player bereits erstellt wurde.

## Vor einem Release weiter offen

- Tatsächliche Unity-Engine-Kompilierung, EditMode/PlayMode-Suite, macOS/iOS-Testplayer und sichtbare Pixelgrafikabnahme.
- Menschlicher Langzeit-/Balancingtest: 120 Minuten Script mit eingeschränkter Botstrategie sind keine repräsentative Nutzungsstudie.
- UI und Prestige-/Axiom-Effekte im realen Unity-Player verifizieren, bevor der Draft-PR gemergt und ein Store-Release erwogen wird.


## 30.10.2026 – Native Unity Online-/Analytics-Durability (PR #166)
- [x] C#-Telemetriequeue mit explizitem Opt-in, validiertem max.-48-Ereignisse-Journal, atomarer Offline-Persistenz und sofortiger Datenlöschung beim Widerruf; ein `session_end` pro Sitzung und `first_purchase` nur bei echtem erstem Lifetime-Kauf.
- [x] Cloudflare D1/D7 nur für zustimmende Onlinekonto-Kohorten mit vollständigem UTC-Rückkehrfenster; keine Install-/Gesamtspieleretention behauptet. Verifizierte SQLite-Tests für D1-D7-Kohortenselektion.
- [x] Serverseitiger Ausschluss überlappender UTC-Saisons via D1-Migration 0012 (keine Remote-Ausführung).
- [x] Google Play Games serverseitiger Einmalcode via Worker und optionaler nativer Unity Android-Adapter nachgetragen; Authentifizierung benötigt offiziell eingebundenen Plugin-/OAuth-Gerätefluss.
- [x] Ein eigenständiger Unity-C#-Katalog mit 25 eingefrorenen, gehashten Sourceblobs; native CI testet nach temporärer Entfernung aller alten TS/npm/Web-Dateien den Kern und die 120-Minuten-Balance.
- [ ] Verifizierter Unity-Editor-/PlayMode-/macOS-/iOS-/Android-Player mit echten SDKs, Google-Play-Games-/Apple-Login und gesicherter Konto-/Cloud-Recovery.
- [ ] Serverautoritärer Nachweis von 1.000 INT, verified Gems/Inventar-/Handelsrechten; bisher sind lokale Spielstände ausdrücklich nicht vertrauenswürdig und können keine Companies freischalten.
- [ ] Alle 23 großen ReferenceCases-JSON-Fixtures durch geprüfte native Verhaltensparität ersetzen; Unity-Editor und komplette Features abnehmen, bevor der TypeScript-/Capacitor-Client gelöscht wird.
- [ ] Remote-Cloudflare-Rollout, Datenbank-Backups, 0011/0012-Migration, Consent-/Privacy-Review, Device-Smoke und LiveOps-Operator-Prozess gesondert freigeben.

Prüf- und Setup-Anleitung: [Unity Online Release Gates](../IdleIntelligence/UNITY_ONLINE_RELEASE_GATES.md). Die C#-Unitchecks allein belegen keine vollständige TS→Unity-Migration oder einen Store-Release.
