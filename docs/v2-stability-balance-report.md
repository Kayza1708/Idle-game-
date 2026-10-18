# V2-Stabilisierung und Balancebericht V4

Stand: 17.10.2026. Grundlage: Hauptbranch `a60415f` nach Release-Audit #119. Save v62, Report v3, ZIP-Export v4, sichtbarer Build `0.1.0-beta.4`.

## Korrigierte Fehler

- Integration gehört jetzt in API, Queue-Bedienung und Speicherprüfung zu den drei Trainingsarten. Vorgemerkte Jobs reservieren keine Ressourcen; bezahlt wird erst beim tatsächlichen Start. T04-Freischaltung, Challenge-Regeln, zwei Queue-Plätze und die Integrationsobergrenze gelten bereits beim Vormerken, einschließlich aktiver und vorgemerkter Stufen.
- Bereits durch manuelles Training oder Gem-Abschluss erfüllte, unbezahlte Queue-Ziele werden entfernt; verbleibende Ziele werden fortlaufend nummeriert. Dadurch blockiert ein manuell vorgezogenes Training nicht die restliche Queue, auch bei älteren gültigen Saves mit Ziellücken.
- Integration wird im laufenden Training korrekt bezeichnet; Kostenvergleich verwendet die tatsächliche Basis des jeweiligen Tracks. Der wissenschaftliche Produktionssnapshot enthält auch den dritten Track. Automatisches Training wählt in einer No-Items-Challenge keine unzulässige Integration aus.
- Prestige-Ereignisse innerhalb einer Challenge erhalten den Challenge-Kontext und deren Run-ID. Zuvor konnte die Rückkehr einen von der Archivvalidierung abgelehnten Eintrag erzeugen. Hauptspiel-Produktion und Challenge-Produktion bleiben getrennt.
- Bei einem Axiom-Reset wird auch der Telemetrie-Runstart neu gesetzt. Die Detailmessung schließt den bisherigen Run vor dem Reset und eröffnet den neuen Run mit eigenen Startwerten.
- V2-Data-Snapshots und Produktionsdetails zeigen die V2-Userpotenz und den tatsächlich wirksamen Gesamtfaktor. Die alte Data-Kompression wird für V2 ausdrücklich als inaktiv markiert. Gespeicherte Jobdiagnosen enthalten rohe V2-Arbeit, Fusion und Synthese sowie eine von Restarbeit und aktueller Rate abgeleitete Trainings-Endschätzung.

Keine Preise, Belohnungen oder Produktionsparameter wurden neu balanciert. Messgrenzen sind technische Speichergrenzen, keine Spielbalance.

## Dauerhafte Daten pro Run

Jeder Run besitzt eine eindeutige ID aus Kampagne, Axiom-Zyklus und Prestige-Zähler. Deshalb bleiben auch Runs nach einem Axiom-Reset unterscheidbar. Der aktuelle, noch nicht abgeschlossene Run wird mit exportiert.

| Daten | Bedeutung |
| --- | --- |
| Start, Beobachtungsbeginn, Ende, Reset-Art | Normales Prestige oder Axiom; automatische Resetabsicht separat |
| Aktivzeit, Offlinezeit, Taps | Tatsächlich simulierte Zeit; vor einem automatischen Reset pro Simulationsabschnitt zugeordnet |
| Passive Credits und erzeugte Data | Wissenschaftliche Akkumulatoren direkt aus den gebuchten Simulationsabschnitten |
| INT-/Axiom-Belohnung | Wissenschaftliche Darstellung ohne Begrenzung auf die native Number-Projektion |
| Ressourcen und Raten an Start/Ende | Wissenschaftliche Credits/Data/INT-Ledger sowie Credits-, Data-, Compute- und Userrate |
| Build an Start/Ende | Hardwareklassen, INT-Knoten, Forschungslevel, Q/E/G, aktive KI und Modelllevel, ausgerüstete Iteminstanzen, Einkommen-Pass/Werbefreiheit |
| Ereigniszähler und erste Zeitpunkte | Erfasste Trainingsstarts/-abschlüsse pro Track, Forschung, Analysen, Crafting, Modellwechsel usw.; unabhängig vom flüchtigen 500-Ereignisfenster |
| Beobachtete Jobkosten/-dauern | Start-/Reservierungsbelege für Training, Forschung, Analyse, Crafting; Track-getrennte Trainingsdauern, soweit der Abschluss eine Dauer liefert |
| Blockierte Aktionen | Aktion und gemeldeter Grund; keine aus UI-Renderings erfundene Wartezeit |
| Zwischenstände | Etwa alle fünf simulierten Minuten plus Rungrenzen: Ressourcen, Raten, Training, KI, Knoten-, Item- und Laborzahl |

Die letzten **100 abgeschlossenen Runs** bleiben mit höchstens zwölf Zwischenständen je Run erhalten. Der aktuelle Run hält höchstens 32 Zwischenstände. Beim Ausdünnen bleiben erster und letzter Messpunkt erhalten; entfernte Punkte werden gezählt. Für ältere Runs bleiben Anzahl, Reset-Arten, Aktiv-/Offlinezeit und wissenschaftliche INT-/Axiom-Belohnungssummen archiviert. Unbekannte Ereignisschlüssel sind auf 100 pro Run begrenzt; verworfene Einträge werden gezählt.

Die Ereignisse im alten Ereignisfenster und dessen CSVs bleiben weiterhin verfügbar. Die neuen Zähler überleben dessen Kürzung und Reloads.

## Dateien im bisherigen ZIP-Export

| Neue Datei | Verwendung |
| --- | --- |
| `balance-history.json` | Vollständige begrenzte Run-Historie, aktueller Run, Build-Snapshots, Summen, Messabdeckung |
| `runs.csv` | Eine Zeile je Run, Zeiten, Belohnungen, Produktion, Raten und Ereigniszähler |
| `run-checkpoints.csv` | Zwischenstände mit Run-ID und Axiom-Zyklus für Verlaufskurven |
| `prestige-comparisons.csv` | Vergleich zum vorherigen gleichartigen Reset im selben Zyklus: INT-Ertrag, Creditrate, aktive Laufdauer |

`summary.json` verweist unter `multiPrestige` auf die vollständige `balance-history.json` und enthält Anzahl/Messabdeckung. Ereignisse stehen weiterhin vollständig in `timeline.json`, `events.jsonl` und den bisherigen CSVs; im ZIP-Summary stehen dafür Zähler und Dateiverweise statt weiterer Kopien. Die drei großen JSON-Dateien sind ohne Einrückungsleerzeichen gespeichert. Alle bisherigen Dateien bleiben erhalten; Exportversion 4 kennzeichnet diese Strukturänderung. `null` bedeutet bei Quotienten eine fehlende Grundlage oder Division durch null, nicht null Fortschritt. INT pro aktiver Stunde ist als Vergleichswert zu lesen: Offlineproduktion kann zum selben Run beitragen und wird separat ausgewiesen. Wissenschaftliche Zellen sind JSON-Objekte, nicht verlustbehaftet in Excel-Number konvertierte E-Werte.

Kostenaggregate beruhen auf vorhandenen Start-/Reservierungsereignissen, bevorzugt auf wissenschaftlichen Kostenbelegen; numerische Rückfälle und deren Genauigkeitsgrenzen werden im Report erläutert. Es handelt sich nicht um eine vollständige Buchhaltung aller Shopausgaben oder Rückerstattungen. Kostenzahlen in bestehenden Ereignissen können auf 16 signifikante Stellen gerundet sein; Start-/End-Ledger behalten ihre wissenschaftliche Darstellung.

## Migration und Messgrenzen

- v60/v61 werden nach v62 übernommen, ohne erneute Prestige-V2-Konvertierung, neue Items oder Belohnungen. Die Migration umfasst auch den geparkten Hauptstand einer Challenge. Bestehende ältere Prestige-Snapshots bleiben erhalten.
- Neue Detaildaten beginnen beim Update. Ein bereits laufender Run wird als `partial` markiert; frühere Detaildaten werden nicht aus dem aktuellen Inventar rekonstruiert.
- Aktive und offline simulierte Sekunden werden gezählt. Weggefallene Abwesenheit oberhalb des Offlinecaps ist nicht produzierte Spielzeit. Kleine inaktive Schritte bis zehn Sekunden entsprechen der bisherigen Zeitklassifikation und werden nicht als Offlinezeit gezählt. Kalenderdauer kann zusätzlich Challenge-Pausen enthalten.
- Raten sind Momentaufnahmen; Zwischenpunkte werden ausgedünnt. Sie beweisen keine kurzzeitigen Spitzen zwischen Messpunkten.
- Ein gültiger aktueller v62-Spielstand benötigt eine gültige Detailhistorie. Beschädigte Historie wird nicht stillschweigend durch eine leere ersetzt. Die vorhandenen Recovery-/Backup-Wege bleiben zuständig.
- Alle Messungen bleiben lokal. Kein Remote-Analytics-SDK, automatischer Upload oder personenbezogener Spielername wird hinzugefügt.

## Benutzung

Nach Übernahme des PR die neue App bauen. Wichtig: Abbruch bei einem fehlgeschlagenen Build, damit keine alte `dist`-Version nach Xcode kopiert wird:

```sh
npm ci && npm run build && npx cap sync ios && npx cap open ios
```

Im Spiel den vorhandenen Menüpunkt **Balancebericht** öffnen und **ZIP speichern / teilen** wählen. Über mehrere Prestiges spielen; ein späterer Export enthält die vorherigen Runs automatisch. Für eine erste Kalibrierung sind drei bis fünf echte Prestiges mit unterschiedlichen Runs hilfreicher als nur ein einzelner Endstand. Ein Export während des ersten Axiom-Zyklus und nach dessen Reset erlaubt zusätzlich den Vergleich des Neuaufbaus.

## Verifikation

`src/v2Stability.test.ts` nutzt den tatsächlichen V2-Startzustand und Save-/Reloadpfad. Abgedeckt sind alle drei Trainingsarten, bezahltes/ungezahltes Warten, Queue-Abbruch und Cap, T08-Retention, drei echte Prestiges, Axiomgrenze, automatische Zeitzuordnung, wissenschaftliche Werte über 1e300, Ereignisverdrängung, über 100 Runs, Zwischenpunktausdünnung, v61-Migration, beschädigte v62-Historie, Challenge-Prestige und Rückkehr sowie unveränderlicher ZIP-Export.

Die bestehende echte V2-Matrix (`prestigeConceptV2.test.ts`, `progressionOfflineV2.test.ts`, `commerce.test.tsx`) prüft zusätzlich Forschung/Director, Analyse, Crafting/Mehrfachaufträge, Fusion, Synthese, Forge-Pausen, Gem-Abschluss und Offline-Splits über mehrere Axiom-Resets. Legacy-Verträge bleiben separat erhalten.

**Abschlussprüfung mit Node 22.23.3:** `npm run build` einschließlich Typecheck bestanden; `npm test`: **1.633 Tests / 117 Dateien bestanden**, Laufzeit 228,24 s. Darunter 15 neue V2-Stabilisierungs-/Messfälle. Der synthetische Kapazitätscheck mit 105 Resets, 40 Zwischenstandsversuchen pro Run und 510 zusätzlichen Ereignissen behält 100 Runs und fünf archivierte Runs; sein ZIP nach Reload umfasst **6.331.674 Bytes**, unter der bestehenden 8-MiB-Grenze. Dies ist ein technischer Export-/Speichertest, keine Aussage zur natürlichen Spielgeschwindigkeit. Vorhandene Vite-Warnung zur Hauptchunkgröße bleibt bestehen.

Maschinenlesbare Prüfergebnisse (historischer Nachweis: Git-Historie vor Bereinigung). Echte iPhone-/WKWebView-/TestFlight-Abnahme und langfristige Balancekalibrierung sind weiterhin auszuführen.
