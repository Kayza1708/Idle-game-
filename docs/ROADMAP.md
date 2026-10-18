# Idle Intelligence – aktueller Stand

Stand: Prestigenetz und Schmiedebewegung nach main `625a42f` (PR #126). Frühere doppelte Arbeitsprotokolle und erledigte Branch-Abhängigkeiten stehen in der Git-Historie; diese Datei beschreibt die verbleibende Arbeit.

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
