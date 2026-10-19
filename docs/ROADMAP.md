# Idle Intelligence – aktueller Stand

## Unity-Rewrite lokal · 20.10.2026

- [x] Tatsächlichen Repositorypfad und Branch `codex/unity-rewrite` geprüft; TypeScript, lokale Backups, Exporte und iOS-Bestand erhalten.
- [x] Vorhandenes Unity-6000.3.26f1-Unterprojekt mit Git-Ignore für generierte Daten und Arbeitsregeln eingerichtet; vollständige Asset-/Meta-Paare geprüft.
- [x] Aktuellen Spielcode als [Migrationsliste](unity-migration.md) und [Dateikatalog](unity-source-inventory.md) erfasst; keine Spielsysteme entfernt und keine Balance geändert.
- [x] Bereits geöffneten passenden Editor und erfolgreichen Template-/Paket-Compile samt erstem Import im bestehenden Editorlog nachgewiesen.
- [x] TypeScript-Referenz unverändert geprüft: Typecheck, 1.843 reguläre Tests und Produktionsbuild erfolgreich; bekannte Bundlegrößenwarnung bleibt offen.
- [x] Separaten Batch-Import mit Unity 6000.3.26f1 nach manuellem Schließen des Projekts ausgeführt, Exitcode 0; siehe Migrationsdokument. Keine zweite Instanz gestartet.
- [x] Ersten spielbaren C#-Abschnitt umgesetzt: große Zahlen, erzeugte zentrale Balance, Hardware/Compute/Nutzer/Credits, Taps/Overdrive, Qualität/Effizienz, fünf frühe Forschungen, getrennte atomare Saves mit Backup und Offlinefortschritt. [Umfang und Grenzen](unity-playable-slice.md).
- [x] Hochformatszene mit vorhandener Labor-/Hardwaregrafik, Ressourcenleiste und wiederverwendbarem Aktionsprefab an echte Spielaktionen gebunden; 320/390/430 px gerendert und geprüft.
- [x] 24 gemeinsame TypeScript-Transaktions-/Ratenfälle und acht exakte Zahlenfälle, 13 EditMode- und drei PlayMode-Tests geprüft; TypeScript-Suite mit 1.845 Tests, Typecheck und Build erfolgreich.
- [x] Itemabschnitt: Komponenten, bezahlte Materialpakete/Analysen, Baupläne/Meisterschaft, Inventar/Ausrüstung, Sofortherstellung/Fusion und gemeinsame Schmiededarstellung mit rein kosmetischen Animationen implementiert. 509 zusätzliche TS-Fälle, 18 EditMode- und sechs PlayMode-Tests; Save-v1-Migration mit Originalkopie. [Anleitung und Grenzen](unity-playable-slice.md).
- [x] Normales INT-Prestige mit allen 60 Knoten, verbundenem Netz/Pan/Pinch, Integration, zusätzlichen Labs/Slots und benötigter Automation implementiert; 380 gemeinsame Fälle, natürlicher Erstlauf (39:38 simuliert), Save-v1/v2-Erhaltung nach v3. 25 EditMode-/9 PlayMode-Tests und 1.857 Vitest-Tests erfolgreich. [Prüfbericht](unity-int-prestige.md).
- [x] Axiome/Modelle: 24 Knoten, zehn Modelle, geheimes Labor/Mira, echte Effekte, Planer, sichere Resets und Save-v1/v2/v3-Migration nach v4. 323 gemeinsame technische Fälle; [Umfang und Prüfgrenzen](unity-axioms-models.md).
- [x] Aktuellen V2-Forschungs-/Industriekern portiert: alle 26 Forschungen, Raten, Foundry, Synthese, Durchbrüche, Fragmenttransaktionen und Save-v5-Migration mit Originalen; [221 Referenzfälle und tatsächliche Prüfergebnisse](unity-industry.md).
- [x] 690 V2-Challenge-Laufstufen mit eigenem Laufzustand, Hauptspielpause, sicheren Rückkehrtransaktionen, echter Regelwirkung und Save-v6-Migration; [Bericht](unity-challenges.md). Zwölf statische Langzeit-Challenges folgen mit ihren Abhängigkeiten.
- [x] Persistente Ereigniszähler/Mastery für vorhandene Produzenten und aktiver/offliner Zeitkontext als Abhängigkeit von Missionen/Achievements, mit konservativer Save-v7-Migration; [Umfang](unity-lifetime.md). Abschnitt 3 selbst bleibt offen.
- [x] 37 Achievementfamilien samt Claims/AP-Verbraucher, acht Laborziele und Profil/Postfach/Namensfilter mit Save-v8-Erhaltung portiert; zwölf statische Bedingungen vorhanden, zwei benötigen noch Seasons. [Teilabnahme 3b](unity-retention.md); Missionen bleiben offen.
- [x] UTC-Missionen mit originalen 6/12/30 Aufgaben, Claims/Bonus/Ablauf, eingefrorenen Tagesbonusboxen und konservativer Save-v9-Migration implementiert; [Teilumfang und Prüfgrenzen](unity-missions.md). Vollständige Seasons, aktive Drop-Erzeugung und Story/Kapitel bleiben offen.
- [ ] Funktionale Folgeabschnitte laut [Abnahmeliste](unity-functional-acceptance.md): Challenges, Missionen/Profil, Seasons, Shop/Belohnungen, vorbereitete Adapter, Tutorial/Sprachen und vollständige Speicher-/Diagnoseverträge. Fehlende spätere Verbraucher bleiben ausdrücklich offen.
- [ ] Player-Build und echte mobile Geräteabnahme durchführen; bisher sind Editor-PlayMode und gerenderte mobile Profile geprüft.

Die folgende TypeScript-Roadmap bleibt als Referenz und offener Releasebestand erhalten.

Stand: Bereinigung nach main `d3040a9` (PR #125). Frühere doppelte Arbeitsprotokolle und erledigte Branch-Abhängigkeiten stehen in der Git-Historie; diese Datei beschreibt die verbleibende Arbeit.

## Implementiert

- [x] Verbundenes INT-/Axiomnetz mit Verschieben, Zoom und Tastatur; Craft-/Fusionsbewegung direkt in der ursprünglichen Schmiede. Browserprüfung und Grenzen: [Prestigenetz und Schmiedebewegung](network-forge-motion.md).

- [x] V2-Prestige, Axiome, Modelle und zugehörige Save-/Offline-Verträge; siehe [V2-Stabilisierung](v2-stability-balance-report.md).
- [x] Sofortiges Crafting und Fusion sowie drei vorbereitete Seasons; siehe [Items und Seasons](instant-items-seasons.md).
- [x] Gemeinsame Itemdarstellung, überarbeitete Oberflächen und freigegebenes Idle-Intelligence-Branding.
- [x] Frühe Hardware-/Forschungspreise nach Nutzerbericht angepasst; gemessene Grenzen stehen im [Balancebericht](early-balance-rework.md).
- [x] Unreferenzierte Grafiken, Audioreserven, Altkomponenten, zwei unbenutzte Testbaselines, alte Vorschauen und erzeugte Prüfberichte entfernt; Save-Wiederherstellung und laufende Regressionen erhalten.
- [x] Typecheck verbietet ungenutzte Imports/Variablen/Parameter; statische Assetprüfung und einheitliche PR-Prüfungen aktiviert.
- [x] Startbildschirm vor dem Spielbundle und während des Save-Ladens, Spieltipps in sieben Spielsprachen, reduzierte Bewegung und Wiederholen bei fehlgeschlagenem Bundle-Start.
- [x] Gemeinsamer Unicode-Namensfilter mit zehn Sprachlisten, Umgangssprache, ausgewählten politischen Namen und extremistischen Parolen; Nachprüfung alter/importierter Anzeigenamen ohne Fortschrittsreset.

Die aktuelle Abnahme dieser Bereinigung wird in [cleanup-loading-names.md](cleanup-loading-names.md) dokumentiert. Implementiert bedeutet keine App-Store-Freigabe.

## Vor einem kommerziellen Release

- [ ] Echte iPhone-/WKWebView-Abnahme: Start/Resume, Hintergrund/Offline, Safe Areas, Touch, Audio/Haptik, lange Sitzungen, Save-Import/-Export und Share-Sheet.
- [ ] Natürliche V2-Runs über mehrere Prestiges bis zu späteren Systemen messen; Daten aus echten Runs mit dem erweiterten Balancebericht vergleichen. Kataloggröße und technische Fixtures belegen keine langfristige Balance.
- [ ] Storeprodukte und native Käufe/Rewarded Ads an die vorbereiteten Grenzen anschließen; serverseitige Belegprüfung, Eigentumsabgleich, Restore, Widerruf, Wiederzustellung und Einmalauslieferung real testen. Siehe [native Integrationen](native-integrations.md) und [Kommerzialisierung](commercialization-v1.md).
- [ ] Datenschutz-/Einwilligungsabläufe, erforderliche Plattformangaben und tatsächliche native Privacy-Manifeste prüfen; Storetexte und Screenshots aus dem geprüften Gerätebuild erstellen.
- [ ] Vollständigkeit und Lesbarkeit der vorhandenen Spielsprachen auf Geräten prüfen.
- [ ] Falls Benachrichtigungen zum Release gehören: echte Berechtigungs-/Planungsschnittstelle implementieren und testen; derzeit keine fertige native Zustellung.

## Vor späteren sozialen Funktionen

- [ ] Serverseitige, versionsgleiche Namensprüfung, Moderation, Meldung und Einspruch ergänzen. Die lokale Wortliste ist keine vollständige Bedeutungs- oder Personenprüfung.
- [ ] Authentifizierung, manipulationssichere Ranglisten und Clanrechte separat entwickeln und prüfen.
