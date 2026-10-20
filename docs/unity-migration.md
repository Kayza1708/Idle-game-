# Unity-Rewrite: Bestand und Migrationsabnahme

Stand: 19.10.2026. Ursprüngliche Bestandsaufnahme: TypeScript-HEAD `625a42f90e459acce9d5c39dddd52f27172eb1b6`. Der INT-Abschnitt basiert auf `4aa4bbb0` und dem unveränderten aktuellen TypeScript-Code auf `codex/unity-rewrite`; Quellhash und Prüfdaten stehen im INT-Bericht. Die folgende Liste ist ein Arbeitsauftrag für den Port, keine Behauptung bereits implementierter Unity-Systeme. Historische Design-Dokumente können vom aktuellen Code abweichen; Code und laufende Schutztests entscheiden.

## Fortsetzung 20.10.2026: Gem-Angebote und Gumball

[Teilabschnitt 5c](unity-gems.md) ergänzt alle 17 Gem-Angebote, tatsächliche Zusatzlabore/Offlinekapazitäten/Laborbonus, Modul-/Trainingsverkürzungen und Kapselmaschine mit gespeicherten Belegen. Save v13 erhält v1–12 mit Originalkopien. Verbleibende Commerce-/Werbeverträge, Story/Sprachen/Einstellungen und Speicher-/Import-/Berichte bleiben offen. [Prüfbericht](unity-gems-verification.md).

## Fortsetzung 20.10.2026: Markt

[Teilabschnitt 5b](unity-market.md): alle Marktangebote mit Originalpreisen/Rotation, gemeinsame Truhenvergabe, Tagesbestand, Tickets, Cooldown, Ergebnisbelege und tatsächlich unverfügbarer vorbereiteter Videopfad. Save v12 erhält V1–11 samt Originalkopien. Gumball/Gem-Upgrades folgen im unten ergänzten 5c; vollständige Commerce-/Ad-Verträge bleiben offen. [Prüfdaten](unity-market-verification.json).

## Fortsetzung 20.10.2026: aktive Signal-Drops

[Teilabschnitt 5a](unity-signals.md) ergänzt Originalspawns, drei Varianten, echte Forschung-/Itemqualität, Material-/Credit-/Daten-/Item-/Bauplanbelohnungen und den tatsächlichen Missions-/Achievementproduzenten. Saves v1–10 bleiben mit Originalkopien erhalten. Der restliche Shop/Gumball, Angebote, Boosts und Adapter bleiben offen. [Prüfdaten](unity-signals-verification.json).

## Fortsetzung 20.10.2026: V2-Seasons

[Season-Abschnitt](unity-seasons.md): drei aktuelle Themen, 300 Free-/Premiumbelohnungen, exakte Claims, Materialien/Items, verdiente Truhen, Vitrine und tatsächlicher Artefakt-Einnahmenbonus. Save v10 erhält V1–9 mit Originalkopien und unveränderten Missions-/Seasonansprüchen. Premium benötigt das zugehörige Entitlement; keine SDKs oder erfundenen Käufe. [Prüfdaten](unity-seasons-verification.json). Legacy-Websaves und reale Geräte bleiben gesondert offen.

## Fortsetzung 20.10.2026: Missionen und Kalenderbelohnungen

[Teilabschnitt 3c](unity-missions.md) ergänzt alle 18 aktuellen Vorlagen, 6/12/30 Aufgaben, originale Baselines, Gems/Materialien/XP, UTC-Ablaufabrechnung, eingefrorene Tagesbonusboxen und Seasonuhr. Native Saves v1–8 erhalten Originalkopien und beginnen neue Missionsbaselines erst nach ihrer Hauptspiel-Synchronisierung. Die vollständigen Seasons, aktive Drops und Story-/Kapitelabläufe bleiben eigene offene Abhängigkeiten. Aktuelle Prüfdaten: [Nachweis](unity-missions-verification.json). Keine breite Systemzeile wird dadurch pauschal abgeschlossen.

## Fortschritt: erster spielbarer Abschnitt

Die Einrichtungsaufnahme unten beschreibt den ursprünglichen Stand. Inzwischen ist die Einrichtung in `ab67478` separat gesichert und der [erste spielbare Abschnitt](unity-playable-slice.md) implementiert: unabhängiger C#-Kern, erzeugte Balance, frühe Produktion/Käufe, Taps/Overdrive, Training, fünf Forschungen, getrennte atomare Unity-Saves und Offlinefortschritt. Die Szene heißt `Assets/Scenes/IdleIntelligence.unity`. Gemeinsame Referenzfälle sowie EditMode-/PlayMode-Prüfungen und die offenen Grenzen stehen im verlinkten Bericht. Der Gesamtrewrite bleibt offen; keine der folgenden vollständigen Systemzeilen wird durch einen Teilport pauschal abgehakt.

## Funktionaler Folgeauftrag: Forschung und Industrie

26 aktive V2-Forschungen (18 wiederholbar, acht Projekte einschließlich Labororganisation), aktuelle Ratenverbraucher, geteilte Analyse/Synthese, alle 20 Synthesen, Foundry-Level/Veredelung/Warteplätze, Durchbrüche und Fragmentumwandlung sind samt erreichbarer UI portiert. Unity-Save v5 migriert 1–4 mit Originalkopien. [Prüfbericht](unity-industry.md): 221 zusätzliche gemeinsame Fälle, 33 EditMode-/16 PlayMode-Tests und 1.860 Vitest-Tests. Breite Systemzeilen bleiben wegen Challenge-/Shopverbrauchern, Legacy-/Webimport und Geräteabnahme offen. Die [funktionale Abnahmeliste](unity-functional-acceptance.md) ordnet alle acht Abschnitte zu; [optischer Rückstand](unity-visual-backlog.md) wird zentral geführt.

## Funktionaler Folgeauftrag: Challenge-Läufe

Alle 690 aktuellen V2-Laufstufen sind mit Einschränkungen, echter Hauptspielpause online/offline, Abbruch, wiederholbaren sicheren Abschlüssen, Familienverbrauchern und gemeinsamen Freischaltungen portiert. [Prüfbericht und Quellabweichungen](unity-challenges.md), [Prüfdaten](unity-challenges-verification.json). Save v6 migriert v1–5 mit Originalkopien. Zwölf statische Langzeit-Challenges, historische Webkataloge und echte Geräte bleiben offen; die breite Challengezeile bleibt entsprechend ungecheckt.

## Funktionaler Folgeauftrag: dauerhafte Metriken

[Statistik-Abhängigkeit für Abschnitt 3](unity-lifetime.md): echte Produzenten, Mastery-XP, explizite aktive Zeit, Challenge-Historienisolation und Save-v7-Erhaltung. Alte Historien werden nicht aus Beständen erfunden. Missionen/Achievements/Profil bleiben bis zu ihren Transaktionen und Oberflächen offen.

## Funktionaler Folgeauftrag: Erfolge und Profil

[Erfolge, Laborziele und Profil](unity-retention.md): alle 37 Achievementfamilien mit Claims und AP-Einnahmen, zwölf statische Bedingungen, acht Einführungsbelohnungen, Namenspolicy/erste KI-Wahl und lesbares Postfach. Save v8 erhält v1–7 und speichert das Modelllevel unabhängig. 935 gemeinsame Transaktionen, 330 Namens- und 18.094 Unicodefälle. Missionen/Perioden sowie Season-Produzenten bleiben offen; die breite Systemzeile wird nicht pauschal abgeschlossen.

## Fortschritt: Items und Schmiede

Der nächste [spielbare Abschnitt](unity-playable-slice.md#items-und-schmiede-mit-play-testen) enthält 20 Komponenten, bezahlte Hardwarepakete/passive Funde, sechs Analysen, zwei Modulrezepte, Bauplanlernen/-meisterschaft, den vollständigen 30-Typen-/sechs-Seltenheiten-Katalog, Inventar, Ausrüsten/Ablegen/Sperren/Levelverbesserung und sofortige Herstellung/Fusion. Originalkosten und Erhaltungsregeln werden gegen 509 zusätzliche TypeScript-Fälle geprüft. Gemeinsame Porträts/Formen/Farben/Details und kosmetische Schmiedeanimationen sind an sofort gespeicherte Transaktionen gebunden. Unity-Save v1 wird mit Originalkopie nach v2 ergänzt. [Prüfnachweis](unity-items-verification.json) und [tatsächlicher Mitschnitt](recordings/unity-forge.mp4).

Die vollständigen Systemzeilen unten bleiben offen: Axiom-/Modellerwerb, Erkenntnisarchiv-Freischaltung im aktuellen V2, restliche Effektverbraucher, Zerlegen, vollständige Foundries, Fragmentumwandlung, Legacy-Queues und Web-Import sind damit nicht als vollständig migriert abgenommen. TypeScript, iOS und lokale Backups bleiben erhalten.

## Fortschritt: normales INT-Prestige

[INT-Umfang, Resetmatrix und Prüfbericht](unity-int-prestige.md): alle 60 aktuellen Knoten, exakter Einkommens-/Anspruchsledger, Guthaben/Vergabe, normale Resets und ihre Erhaltung, Integrationstraining, bis zu vier Labs, benötigte Queues/Automationen, zusätzliche permanente Slots und Mengenverträge. Verbundenes Netz mit sechs Bereichen, Pan/Pinch und kosmetischer Resetanimation nach dauerhaftem Transaktionssave. 380 neue gemeinsame technische Referenzfälle und ein frischer natürlicher Lauf bis zum ersten Prestige; siehe [Prüfdaten](unity-int-verification.json). Unity-Saves v1/v2 migrieren verlustfrei nach v3 mit bytegleicher Originalkopie; historischer INT-Einkommensanspruch wurde früher nicht gespeichert und wird nicht erfunden.

- [x] Normales INT-V2-Prestige und alle 60 Knoten für die bereits portierten Systeme; keine Vorgängerpflicht und keine Balanceänderung.
- [x] Zusätzliche Itemslots, Integration, Trainings-/Forschungsplanung und Hardware-Autokäufer als benötigte INT-Abhängigkeiten.
- [x] Axiome und neue KI-Modelle im unten beschriebenen Folgeabschnitt; I08-Erkenntnis besitzt jetzt echte Modellverbraucher.
- [ ] Restliche Foundry-/Forschung-/Planer-/Meta-/Challengeverbraucher und Geräte-/Playerabnahme. Die breiten Systemzeilen bleiben entsprechend offen.

## Fortschritt: Axiome und neue KI-Modelle

[Axiom-/Modellbericht](unity-axioms-models.md): alle 24 aktuellen Axiomknoten und zehn Modelle mit echten Verbrauchern in den portierten Systemen, gemeinsames Axiomnetz, Erhaltungsvorschau, geheimes Labor/Mira, verbleibender Zufallspool, Kosten/Upgrades, Modellwechsel und Slotverlust ohne Itemverlust. Benötigte Wiederkauf-/Analyse-/Fertigungs-/Fusions-/Axiomsnittler und Zerlegen ergänzt. 323 zusätzliche gemeinsame technische Fälle; [Prüfdaten](unity-meta-verification.json). Save-Versionen 1–3 migrieren mit Originalkopie nach v4. Frühere INT-/Itemberichte bleiben historische Nachweise.

- [x] Vollständiger aktueller V2-Axiomkatalog und alle neuen KI-Modelle für die vorhandenen Unity-Systeme.
- [x] Verlustfreie Erhaltung vorhandener Unity-Felder und sicher gespeicherte, kosmetische Erwerbs-/Resetbelege.
- [ ] Weitere Foundry-/Synthese-/Forschungsverbraucher, Web-/Legacyimport und Geräteabnahme. Erkenntnisarchiv-Neuerwerb bleibt ungeklärt; keine Ersatzfreischaltung.

## Lokale Einrichtung und Nachweis

- Repository: `/Users/yannicrogowitz/Idle-game-`; Unity: `IdleIntelligence/`; kein verschachteltes `.git`.
- Anfangszustand: keine Änderungen an versionierten Dateien; unversioniert waren `.patch-backups/`, `IdleIntelligence/`, `ios/`, `full_simulation_source_dump.txt`, `longTermSimulation_current.txt`, `simulation_actions.txt`, `simulation_api_dump.txt`, `simulation_current.txt`. Diese Bestände bleiben erhalten und werden nicht pauschal hinzugefügt.
- Installiert: `/Applications/Unity/Hub/Editor/6000.3.26f1/Unity.app`; zusätzlich vorhandener Editor `6000.6.6f1` wird nicht verwendet. Projektversion ist `6000.3.26f1 (de8167e7440c)`.
- Vorhandenes 2D-URP-Template mit `Assets/Scenes/SampleScene.unity`, URP-Renderer, Input Actions, Szenenvorlage und Settings erhalten. Noch keine eigenen C#-Spielsysteme vorhanden. Paketmanifest und Lockdatei bleiben unverändert, einschließlich vorhandener Template-Pakete.
- `EditorSettings.asset`: `m_SerializationMode: 2` (Text). `VersionControlSettings.asset`: `Visible Meta Files`. Keine Umstellung erforderlich.
- Eigene `.gitignore` schließt Unity-Caches, lokale Einstellungen, IDE-Erzeugnisse, Testausgaben und Builds aus. Assets mit Ordner-/Datei-Metas, Packages und ProjectSettings werden im Hauptrepository erfasst.
- Editor war bereits für genau diesen Pfad geöffnet (Hauptprozess PID 34845; Import-Worker desselben Editors). `Temp/UnityLockfile` vorhanden. Kein zusätzlicher Editor-/Batchprozess gestartet und keine Lockdatei entfernt.
- Bestehendes `~/Library/Logs/Unity/Editor.log` nennt die passende Version, den Projektpfad und den erfolgreichen Template-/Paket-Compile: `Tundra build success (15.68 seconds)`, 949 ausgewertete Schritte; `AssetDatabase: script compilation time: 17.061238s`; anschließender Assembly-Reload und `InitialRefreshV2` in 52.935 Sekunden. Assemblies sind in `Library/ScriptAssemblies` vorhanden. Keine `error CS...`-/`Scripts have compiler errors`-Treffer bei dieser Prüfung. Weitere Paketimporte sind im Log sichtbar; dies belegt keinen neuen vollständigen Batchlauf und keine fehlerfreie Spielimplementierung.
- Ein reproduzierbarer separater Batch-Import, Unity-Spieltests, Player-Build, Play-Mode-Abnahme und Geräteabnahme stehen aus. Vollständige Editorlogs wegen möglicher Zugangsdaten nicht einchecken.
- Abschließende Git-Prüfung: 19 Dateien unter Assets einschließlich aller Datei-/Ordner-Metas, zwei Package-Dateien und 25 ProjectSettings-Dateien im Index; keine fehlenden oder verwaisten Metas, keine erzeugten Cache-/Builddateien aufgenommen. Unity-YAML behält seine erzeugten Leerwerte; `.gitattributes` erlaubt deren nachgestellte Leerzeichen. `git diff --cached --check` und `git diff --check` erfolgreich. Änderungen sind gestaged, noch nicht committed.
- TypeScript-Referenz geprüft: `npm run typecheck` erfolgreich; `npm test` mit 123 Dateien / 1.843 Tests erfolgreich; `npm run build` erfolgreich (bekannte Warnung zum großen Hauptbundle). Im ersten Testlauf war Vites lokaler WebSocket-Port durch die Sandbox blockiert; der betroffene `simulationWorker.test.ts` wurde außerhalb der Sandbox erneut erfolgreich geprüft (sechs Tests, ohne Portfehler). Separate Langzeitkampagnen wurden nicht zusätzlich gestartet. Keine Änderungen unter `src/`.

## Vollständige fachliche Migrationsliste

### Nachprüfung der Einrichtung

Nach vollständigem Schließen des Editors am 19.10.2026: separater Import-/Compile-Aufruf mit dem installierten Editor `6000.3.26f1`, `-batchmode -nographics -quit`, Exitcode **0**. Lokales Log: `/tmp/idle-intelligence-baseline.log`. Dies prüft weiterhin das unveränderte Template, keine Spielparität. Die Einrichtung wird vor dem ersten C#-Spielabschnitt separat committed.

Alle folgenden Kriterien bleiben als vollständige Systemabnahme offen; den nachgewiesenen Teilumfang beschreibt der Bericht oben. Bei Implementierung pro Zeile TypeScript-Fixtures, C#-Parität und relevante UI-Abnahme dokumentieren. Alte und V2-Pfade bewusst unterscheiden: vorhandene Legacy-Verträge nicht als neue aktive Features duplizieren und nicht ungeprüft entfernen.

| Offen | Bestand / Mechanik | Aktuelle Quellen | Nachweis für den Unity-Port |
|---|---|---|---|
| [ ] | Gesamter GameState, stabile IDs, Kataloge, Startzustand, Freischaltungen | `src/economy.ts`, `src/progression.ts`, `src/progressionValidation.ts` | Identischer neuer Zustand, stabile ID-Zuordnung, keine Inspector-Defaults als zweite Balancequelle |
| [ ] | Große Zahlen, exakte Ressourcen, Anzeigeformate, Kaufmathematik, Softcaps | `scientificNumber.ts`, `economy.ts`; `scientificNumber.test.ts`, `purchaseMath.test.ts` | Mantisse/Exponent-JSON, Überlaufgrenzen, Addition/Multiplikation/Potenzen, Vergleiche, Bulk/Max und Rundungen identisch |
| [ ] | Credits, Compute, Nutzer, Daten, Forschung, INT, Axiome, Gems und Komponenten | `economy.ts`, `progression.ts`, `materialEconomy.ts`, `economySnapshot.ts` | Produktionsfaktoren, Kaufberechtigung, berechtigte Einkommensquellen und Statistik getrennt erhalten |
| [ ] | Alle Hardwareklassen, Nachbarschaft, Meilensteine, Klassenupgrades | `economy.ts`, `hardwareGoals.ts`, `materialEconomy.ts`; `hardware8b.test.ts`, `hardwareCreditOnly.test.tsx` | Käufe 1/10/Max, bestehende Credit-/Materialverträge und bezahlte Meilensteine vergleichen |
| [ ] | Tap, Combos, Krits, Impulsrelais, Overclock/Overdrive, Eingabefeedback | `tapInteraction.ts`, `progression.ts`, `economy.ts` | Jeder echte Tap genau einmal; gesperrte Aktionen ohne Auszahlung; Touch/Cancel/Mehrfingereingabe prüfen |
| [ ] | Training Qualität/Effizienz/Integration, Arbeitsvorrat, Warteschlangen | `progressionWork.ts`, `economy.ts`, `TrainingCostDetails.tsx` | Kostenbasis beim Start erhalten; Arbeitsraten, Limits, Warteschlange, Transfer und Online-/Offlinearbeit vergleichen |
| [ ] | Forschungsprojekte, wiederholbare Forschung, Bereiche, Labs, Queue und Automation | `researchAreas.ts`, `researchInteraction.ts`, `researchAutomation.ts`, `researchValidation.ts`, `economy.ts` | Kosten-/Dauerangebote, Quellenaufschlüsselung, Freischaltungen und Abschlussreihenfolge; kein kostenloser Doppelstart |
| [ ] | Hardwareanalyse, Architekturstudie, Artefaktsuche; Fokus, kurz/lang, Intro und Queue | `experiments.ts`, `AnalysisContracts.tsx`, `DataComparison.tsx` | Zahlung/Reservierung, Abbruch, Auszahlungen, RNG und Rezepte/Forschung als Ergebnis vergleichen |
| [ ] | Komponentenfamilien, Fragmente, Entdeckung, Baupläne, Lernen, Meisterschaft und Konvertierung | `materialEconomy.ts`, `blueprints.ts`, `blueprintResearchReward.ts`, `itemProgress.ts` | Entdeckungen/Freischaltungen und Mengen gegen echte Aktionen prüfen; keine unverdienten Ressourcen |
| [ ] | Module, sämtliche Itemrezepte, sofortige Herstellung, Mengenwahl und alte bezahlte Jobs | `craftingRecipes.ts`, `inventory.ts`, `progressionWork.ts` | Atomare Kosten/Auszahlung, ungültige Mengen, Legacy-Reservierungen, Save-/Reload-Sicherheit |
| [ ] | Inventar, Seltenheiten, Level, Slots, Ausrüsten, Sperren, Zerlegen, Spezialeffekte/Builds | `inventory.ts`, `itemMechanics.ts`, `deviceEffects.ts`, `ItemPresentation.tsx` | Vollständiger `ItemTypeId`-Katalog; Quellen, Caps, effektive Boni, Slotlimits und Effektvorschau vergleichen |
| [ ] | Modellschmiede/Foundry, Infrastruktur, Verbesserung, Fusion und Planer | `foundries.ts`, `progressionAutomation.ts`, `ForgeScreen.tsx`, `ItemCombinations.tsx` | Aktuellen Sofortpfad und alte Queue-/Recoverydaten erhalten; keine erneute Zahlung alter Jobs |
| [x] | Neue V2-KI-Modelle entwickeln, upgraden, wählen, Wissensfortschritt, Phasenwechsel | `progression.ts`, `progressionWork.ts`, `modelForgeMigration.ts` | [Axiom-/Modellbericht](unity-axioms-models.md): Pool/RNG, Kosten, alle zehn Modelle, Integration, aktive Auswahl/Slots und Phasen; Legacy-/Webimport separat offen |
| [x] | Normales Prestige V2, INT-Anspruch, alle 60 Knoten, Unlocks, Reset und Runstart | `progressionReset.ts`, `progression.ts`, `prestige.ts`, `prestigeTree.ts` | [INT-Prüfbericht](unity-int-prestige.md): Reset-Retention-Matrix, 380 gemeinsame Fälle, drei Folgeresets, natürlicher Erstlauf; Axiome/Modelle separat offen |
| [x] | Aktuelle 24 V2-Axiomknoten, Axiom-Reset/-Upgrades, Archive und Axiom-/Prestige-Agent | `progressionReset.ts`, `economy.ts`; `axiom.test.ts`, `axiomUpgrades.test.ts`, `runStart.test.ts` | [Axiom-/Modellbericht](unity-axioms-models.md): tatsächliche Schwellen, Kosten, Erhaltung, mehrere Zyklen, Mindestlaufzeit, Wartegründe und sichere Belege |
| [ ] | Hardware-Autokäufer, Reserve, Forschung, Training, Analyse-, Craft-/Fusion-/Prestigeplaner | `economy.ts`, `researchAutomation.ts`, `progressionAutomation.ts`, `progressionWork.ts` | Gleiche Aktionsreihenfolge und Zahlungsregeln bei Online-/Offlinefortschritt |
| [ ] | Challenges, Stufen/Kapitel, Einschränkungen, Sterne, Bestzeiten, Hauptspielisolation | `challengeStages.ts`, `retention.ts`, `simulation.ts`, `ChallengeRunPanel.tsx` | Start/Abbruch/Abschluss/Reload; separaten Hauptzustand, passive Fortschritte und Einmalbelohnungen vergleichen |
| [ ] | Daily/Weekly/Monthly-Aufgaben, Kapitelquests, Erfolge, Mailbox und Profil | `missions.ts`, `achievements.ts`, `retention.ts`, `profileName.ts` | Periodenwechsel, Baselines, Claim-IDs, Kapitelaufstieg und permanente Belohnungen identisch |
| [x] | Aktuelle V2-Seasons: drei Themen, Free/Premium-Spuren, XP, Vitrine, Truhen und Kulanzfrist | `season.ts`, `seasonLoot.ts`, `SeasonPass.tsx`, `SeasonChestTray.tsx` | [Season-Bericht](unity-seasons.md): Claims über Wechsel/Reload, Entitlements, volles Lager und Challenges geprüft; Legacy-/Webimport separat offen |
| [ ] | Shop, Gem-Angebote, permanente Slots/Upgrades, Boosts, Drops und Truhen | `shop.ts`, `gemShop.ts`, `ShopMarket.tsx`, `ShopUpgrades.tsx` | Limits, Preise, Verfügbarkeit, Kaufabzug, Ergebnis und kein Claim bei Fehler vergleichen |
| [ ] | Bonusboxen, Dropauswahl, Kapselmaschine, Pity/Jackpot und Ergebnisbelege | `bonusBoxes.ts`, `capsuleMachine.ts`, `RewardReveal.tsx`, `ItemReceipt.tsx` | Deterministische Seeds/Transaktions-IDs, Pools, Auswahl und genau einmalige Belohnung |
| [ ] | Story, Mira, Tutorial, Finger/Fokus, AI-/Spielername und Namensmoderation | `story.ts`, `onboarding.ts`, `tutorialGuide.ts`, `aiName.ts`, `namePolicy.ts`, `moderation/` | Tutorialzustände, übersprungene Dialoge, Unicode-Normalisierung, reservierte Namen und Alt-Save-Nachprüfung |
| [ ] | Sprachen und Zahlen-/Effekt-/Audio-/Haptikeinstellungen | `i18n.ts`, `gameplayI18n.ts`, `workshopI18n.ts`, übrige `*Text.ts`, `SettingsPanel.tsx` | EN/DE/ES/FR/PT/IT/PL, Plurale, lange Texte, persistente Einstellungen und lesbare große Zahlen |
| [ ] | Gesamte Navigation, Overlays, Detailblätter, Vergleich/Vorschau, Unlock-/Rückkehrführung | `App.tsx`, `Panels.tsx`, `MetaHub.tsx`, `MetaMenu.tsx`, `MobileDetailSheet.tsx`, `nextGoal.ts`, `returnGuidance.ts` | Alle bestehenden Aktionen erreichbar; mindestens 44 Einheiten Touchziele, Safe Areas, Kontrast, keine leeren Menüs |
| [ ] | Loading, Startfehler, Crash-Recovery und Dateizustellung | `bootstrap.ts`, `LoadingScreen.tsx`, `CrashBoundary.tsx`, `crashDiagnostics.ts`, `fileDelivery.ts`, `mobileIntegration.ts` | Start ohne Save/mit Fehler, Wiederholen, Import/Export/Teilen und diagnostischer Export |
| [ ] | Lokale Telemetrie, Run-/Balancehistorie und Diagnose-/Balanceexporte | `telemetry.ts`, `balanceHistory.ts`, `balanceReport.ts`, `balanceExport*`, `*Export.ts`, `BalanceExportDialog.tsx` | Ereigniskontext, exakte Zahlen, Historienlimits und exportierte Fakten erhalten; kein neues Analytics-SDK |

Quellen ohne `src/` in der Tabelle liegen ebenfalls unter `src/`. Der ergänzende [vollständige Dateikatalog](unity-source-inventory.md) erfasst auch UI-/Hilfsmodule, Tests, Simulatoren und konkrete Runtime-Assets, die nicht einzeln in jede Tabellenzeile passen.

## Balance und Zeitvertrag

- [ ] Alle `BALANCE`-Abschnitte, `extendedItemCatalog`, Hardware-, Forschungs-, Material-, Rezept-, Item-, Prestige-, Axiom-, Shop-, Ad- und Seasonkataloge aus `src/economy.ts` verlustfrei übernehmen. Quellhash und Datenformat dokumentieren, IDs nie aus übersetzten Anzeigenamen ableiten.
- [ ] Zusätzlich bestehende verstreute Konstanten erfassen (beispielsweise Season-Dauer/Level in `season.ts`, einzelne Ad-Beträge in `ads.ts` und Regeln/Formeln in Domainmodulen). Dies ist eine Bestandsabweichung vom Ziel einer einzigen Balancequelle, keine Erlaubnis zur Bereinigung in diesem Auftrag. Vor dem Datenexport ausdrücklich entscheiden und mit Paritätstests absichern.
- [ ] `simulation.ts` (`advanceTo`, `simulationNow`), `progressionWork.ts` und `progressionOfflineV2.test.ts` portieren: reale verstrichene Zeit, Offlinekapazität, abgeschnittene Zeit, `savedAt`, Uhrversatz, rückwärts/vorwärts springende Uhr, diskrete Jobgrenzen und gleiche Reihenfolge der automatischen Aktionen.
- [ ] RNG als Parameter/gespeicherten Seed führen; JavaScript-32-Bit-Operationen bei Material-RNG exakt nachbilden. Kein neuer UnityEngine.Random-Verlauf für historische Auszahlungen.
- [ ] Suspend/Resume, mehrfacher Resume, Save direkt vor/nach Abschluss, lange Abwesenheit und passives Hauptspiel während einer Challenge prüfen. Keine Doppelgutschrift und keine aktiven Taps im Hintergrund.
- [ ] Rückkehrbericht aus tatsächlich gutgeschriebenen Ressourcen/Jobs/Items erzeugen (`ReturnReport.tsx`, `returnOverview.test.ts`, `returnReport.test.tsx`), verlorene Zeit getrennt anzeigen.
- [ ] TypeScript-Simulatoren und Tests als Referenz erhalten (`scripts/`, `*Simulation.ts`, `testSupport/`). Reguläre Tests und separate Langzeitkampagnen unterscheiden; vorbereitete Fixtures sind keine natürliche Balanceabnahme.

## Speicherstände und Migration

- [ ] Web-Envelope aktuell `SAVE_VERSION = 63`, Hauptschlüssel `ai-singularity.save`; Pending, drei Backups (`backup-v15` samt `.2`/`.3`) und Recoverydaten berücksichtigen. Version des Envelopes und `progression.version = 2` sind unterschiedliche Verträge.
- [ ] `storage.ts`, `durableStorage.ts`, `saveValidation.ts`, `progressionValidation.ts`, `savePolicy.ts`, `recovery.ts` und alle `*Migration.ts`/`*Save.ts` anhand echter Exportfixtures portieren. Save enthält auch laufende/alte Jobs, Reserve-/Queuezustände, RNG, Claims, Transaktionen, Challenges und exakte Zahlen.
- [ ] Separates Unity-Saveformat und Speicherort definieren. JSON-Import zunächst explizit, validiert und mit unveränderter Originalkopie; unterstützte alte Versionen auflisten. Unbekannte Zukunftsversionen, NaN/Infinity, ungültige IDs, defekte/zu große Dateien und Fehler bei Migration ablehnen.
- [ ] Atomarer Write (Temp schreiben, zurücklesen/validieren, Backup, Commit), Quota-/Dateifehler und Crash zwischen jedem Schritt testen. Ein unlesbarer oder inkompatibler Originalstand darf nicht automatisch durch NewGame ersetzt werden. Recovery muss sichtbar und exportierbar bleiben.
- [ ] Sofortiges dauerhaftes Speichern nach relevanten Aktionen, beim Hintergrundwechsel und nach verifizierten Käufen nachbilden; Save-/Load-Fehler sperren riskante Aktionen. Web-/Capacitor-Bestände unverändert lassen.

## Grafik, Animation und Audio

- [ ] Runtime-Zuordnungen aus `GameArt.tsx`, `artIconCatalog.ts`, `RasterMotif.tsx`, `MobileArt.tsx`, `ProgressionArt.tsx`, `PixelIcon.tsx`, `VectorIcon.tsx`, `ShopIcon.tsx` erfassen; tatsächliche Nutzung vor historischen Art-Dokumenten priorisieren. Atlas-Ausschnitte, Pivot, Filter, Alpha und Safe-Area-Skalierung prüfen. Reservierte Atlaszellen nicht versehentlich aktivieren.
- [ ] Alle verwendeten Dateien aus `public/assets/game/`, `public/icons/` und Branding (Favicon/Touchicon/Manifest) zuordnen. SVG-/CSS-Geometrie, Labormotive, Hardware, Items, Materialien, Modelle, Forge, Drops, Kapseln, Mira, Prestige, Meta und Shop in Unity nachbauen bzw. vorhandene Rasterassets importieren. Keine Löschung der Originale.
- [ ] Schriften IBM Plex Mono/Silkscreen samt Lizenzdateien erhalten; WOFF2 nicht als bereits funktionierenden Unity-Font behandeln. Geeignete Fontquellen und Glyphenabdeckung separat prüfen. Audio-MP3/OGG aus `public/assets/audio/` mit bestehender Lautstärke-/Mute-/Resume-Logik (`audio.ts`) übernehmen.
- [ ] `gameMotion.ts`, `progressionMotionPlan.ts`, `LabMotion.tsx`, `ProgressionFeedback.tsx`, `RewardFeedback.tsx`, `RewardReveal.tsx`, `CapsuleCelebration.tsx`, `TutorialFinger.tsx`, `tapInteraction.ts` und alle CSS-Keyframes/Transitions inventarisieren und sinngemäß portieren.
- [ ] Tap-/Produktionsfeedback, Laborschleifen, Forschungs-/Craft-/Forge-Abschluss, Itemflug, Prestigeverbindungen, Kapsel-/Truhenöffnung, Drops, Tutorial und Loading prüfen. Bestätigte Aktionen genau einmal darstellen; keine nachträgliche Effektserie bei Load/Offline/Prestige/Axiom/Challengewechsel.
- [ ] Animation nie zur Auszahlung verwenden. Bei Effekte aus/reduzierter Bewegung statische Meldung; Unterbrechung räumt Effekte auf und fängt keine Touch-Eingaben ab. Geräte-Audio/Haptik getrennt abnehmen.

## Vorbereitete Monetarisierung und Plattformgrenzen

- [ ] `ads.ts`: verfügbarer Mock nur für Tests, Produktionsanbieter derzeit unverfügbar. Erfolgs-/Abbruch-/Fehlerpfade, Limits, Transaktionsdeduplizierung, Forschungsskip, Creditboost/-drop, Komponenten, Gems, Shoptruhe und Kapsel erhalten.
- [ ] `commerce.ts`, `commerceSave.ts`, `shopNative.ts`, `shop.ts`, `gemShop.ts`: Produkt-IDs und Inhalt aus der Referenz übernehmen, nicht aus UI-Preisen ableiten. `ShopNativeAdapter` und `PurchaseVerifier` sind derzeit unverfügbar; keine lokale erfundene erfolgreiche Kaufprüfung.
- [ ] Dauerhafte Entitlements, Season-Premium, Gem-Ledger, Pending-/verarbeitete Transaktionen und Claim-IDs erhalten. Kauf erst nach verifizierter Lieferung und erfolgreichem dauerhaftem Save abschließen (`persistAndFinishPurchases`).
- [ ] Restore, Widerruf, Wiederzustellung, Eigentumsabgleich, echte Storepreise und serverseitige Belegprüfung bleiben spätere Integrationsabnahmen. Kein Werbe-/IAP-SDK oder Echtgeldfluss in diesem Einrichtungsauftrag.
- [ ] Capacitor-Grenzen aus `mobileIntegration.ts`, `fileDelivery.ts`, `audio.ts`, `deviceEffects.ts`, `capacitor.config.*` und `ios/` erfassen: Lifecycle, Dateisystem/Share, Haptik, Keyboard/Safe Areas. Native Adapter separat beauftragen; vorhandenes iOS-Projekt nicht ersetzen. Benachrichtigungen, soziale Funktionen und Cloud-Saves nicht als fertig migrierte Funktionen ausgeben.

## Reihenfolge und Abnahme

1. Offenen Editor nach Sichern ungespeicherter Änderungen manuell schließen. Dann untenstehenden Batch-Import ausführen und Exitcode sowie Log prüfen. Keine Lockdatei löschen. Alternativ im bereits geöffneten Editor Refresh und Console prüfen; das ersetzt keinen protokollierten Batchlauf.
2. Reine C#-Domain/Tests, ScientificNumber und versionierten Balanceexport mit TypeScript-Referenzfixtures aufbauen. Noch keine neue Balance.
3. NewGame, Simulation, sichere Saves und Offline-/Lifecycle-Verträge implementieren; danach erster spielbarer Slice aus Hardware, Tap, Training und Forschung.
4. Materialien/Items/Forge/Modelle, Prestige/Axiome/Automation und Challenges portieren; danach Meta, Seasons, Shop und vorbereitete Schnittstellen.
5. Vollständige mobile UI/Grafik/Audio/Animation, sieben Sprachen, Import/Export und Diagnostik abnehmen. PlayMode-/Gerätetests und natürliche Runs folgen; TypeScript erst nach gesondertem Auftrag ersetzen.

Batch-Import **erst nach Schließen des Projekts**, vom Repositoryordner aus:

```sh
/Applications/Unity/Hub/Editor/6000.3.26f1/Unity.app/Contents/MacOS/Unity \
  -batchmode -nographics -quit \
  -projectPath "$PWD/IdleIntelligence" \
  -logFile /tmp/idle-intelligence-unity-import.log
```

Der Befehl importiert/kompiliert, führt aber keine Spieltests und keinen Player-Build aus. Nach Einführen der Tests separat `-runTests -testPlatform EditMode -testResults /tmp/idle-intelligence-editmode.xml` mit eigenem Log ausführen (ohne `-quit`, Test Runner beendet den Lauf); anschließend nötige PlayMode-Tests. Nur ein Exitcode 0 zusammen mit geprüftem Log bestätigt den Batch-Import; Testergebnisse separat auswerten.
