# Forschung → erster erweiterter Craft – 12. Oktober 2026

## Implementiert

Der erste **regulär bezahlte** Abschluss von „Offene Baupläne“ im Hauptspiel vergibt genau **vier vorhandene Bauplanfragmente**. Der Betrag liegt ausschließlich in `BALANCE.firstBlueprintResearchFragments`. Die Auszahlung erfolgt zusammen mit dem tatsächlichen Abschluss, auch offline. Sie vergibt keine Items, Module, Materialien, Credits oder gratis Forschung.

Der neue permanente Nachweis `blueprintResearchReward` kennt drei Zustände: `unearned`, `pending`, `consumed`. Ein bezahlter Erstabschluss wechselt zu `pending`; die sichere vollständige Gutschrift wechselt zu `consumed`. Falls ein gültiger Fragmentbestand bereits die Grenze sicherer Ganzzahlen erreicht, bleibt die verdiente Gutschrift gespeichert und wird nach Verbrauch automatisch genau einmal gebucht. Es gibt keinen separaten Claimbutton.

Prestige und Axiom behalten den Nachweis. Wiederholte Completion-Aufrufe, erneut eingesetzte alte Jobs und Reload zahlen nicht erneut. Auch ein historischer Auftrag ohne positiven Zahlungsnachweis erhält keine Belohnung. Eine bloße Forschungsanfrage oder ein noch laufendes Projekt bezahlt nichts aus.

Challenge-Forschung erhält diese Hauptspielbelohnung nicht. Ein wirklich bezahlter Hauptspielauftrag darf während einer Challenge im unabhängigen Main-Snapshot abschließen und dort seine vier Fragmente erhalten. Challenge-Ressourcen und Rückkehrstand übernehmen keine Run-Auszahlung. Der Main-Nachweis bleibt beim Start als readonly Accountstatus getrennt von den Run-Ressourcen erhalten.

Die bestehenden Projekttexte nennen den Betrag in allen sieben vorhandenen Sprachen; DE/EN-Detailtexte zeigen den dauerhaften Status. Ein kompakter Hinweis in der vorhandenen Forschungsliste meldet eine tatsächlich protokollierte Auszahlung. Rendern/Öffnen/Ausblenden vergibt keine Ressourcen. Historische Abschlüsse erzeugen keinen erfundenen Auszahlungshinweis. Diagnoseexporte enthalten den Nachweis sowie ein eigenes `blueprint-research-reward`-Ereignis. `research.csv` ergänzt am Ende `blueprintFragmentsGranted`; die vorhandenen Spalten bleiben an ihrer Position.

## Save v49 und Bestandsregel

- Neue Spiele starten mit `unearned` und denselben tatsächlichen Startressourcen wie bisher.
- v48 und ältere unterstützte Saves mit bereits abgeschlossenen Offenen Bauplänen werden zu `consumed` migriert, **ohne nachträgliche Fragmente**. Dieser Status bezeichnet auch den abgeschlossenen historischen Vertrag, nicht eine erfundene historische Auszahlung.
- Ein noch laufender bezahlter Altauftrag bleibt erhalten und erhält die vier Fragmente bei seinem späteren erstmaligen Abschluss. Kosten, Dauer und Endzeit werden nicht neu gesetzt.
- Ein Challenge-Snapshot und dessen Main werden unabhängig migriert; die Migration verändert keinen Fragmentbestand.
- Fehlender/ungültiger Nachweis in einem aktuellen v49-Save wird abgelehnt. Die vorhandenen Recovery-/Nichtüberschreiben-Verträge bleiben bestehen.
- Der schon vorhandene Schutz gegen fehlenden dauerhaften Bauplanbesitz wurde von der alten Versionsliste auf `42..SAVE_VERSION` erweitert. Sonst hätte der Versionswechsel die Ownership-Prüfung unbeabsichtigt geöffnet; der bestehende Regressionstest hat dies erkannt.

## Natürlicher Vorher-/Nachher-Vergleich

Dieselben acht Zwei-Stunden-Profile aus PR #88 wurden erneut gemessen: Seeds 1708/2026, kontinuierliches Spiel oder 10+5-Minuten-Sitzungen, Modell-/Materialpriorität. Die Entscheidungspolitik, Projektziele, bezahlten Käufe, Taps, Sitzungen und einmalige Prestige-Regel bleiben identisch. Beobachtung von Projekt-/Grantabschluss und ein isolierter Itemvergleich wurden ergänzt. Keine vorbereiteten Ressourcen oder Unlocks im natürlichen Lauf. Ausführungszeit **38,89 Sekunden**, äußerer Prozesswächter 180 Sekunden, pro Profil 45 Sekunden.

| Ereignis | Aktiv, Modell zuerst | Aktiv, Materialien zuerst | Beide kurzen Sitzungsprofile |
|---|---:|---:|---:|
| Relais fertig | 22:30, unverändert | 21:30, unverändert | 65:00, unverändert |
| Erster INT claimbar | 41:38, unverändert | 44:34, unverändert | Nicht erreicht |
| Erster Prestige | 57:30, unverändert | 56:40, unverändert | Nicht erreicht |
| Offene Baupläne fertig / vier Fragmente gebucht | 58:00 | 59:40 | Nicht erreicht |
| Quantenchip fertig, vorher | Nicht erreicht | Nicht erreicht | Nicht erreicht |
| Quantenchip fertig, jetzt | **68:30** | **67:30** | Nicht erreicht |

Diese Zeiten gelten in beiden gemessenen Seeds. Keiner der kurzen Sitzungsruns erreicht innerhalb von zwei Stunden das Schlüsselprojekt; dort wird folgerichtig kein Bonus vergeben. Die passive Einstiegshürde bleibt offen. Der Grant wirkt hier nach dem ersten Prestige und beschleunigt dessen Zeitpunkt nicht.

Der Chip wird **bezahlt gefertigt**: vier Fragmente fürs einmalige Lernen, regulärer Compute-Bus mit seinen eigenen Zutaten/Data/Zeit, 1.800 Data und die unveränderten Chipmaterialien und Herstellungszeit. Es wird kein Item kostenlos in das Inventar gelegt. Nachher enthalten alle vier aktiven Profile genau ein regulär gefertigtes Relais und einen regulär gefertigten Quantenchip.

## Buildwirkung und echte Grenze des Nachweises

Die Profile vergleichen am ersten möglichen Zeitpunkt die zwei tatsächlich gefertigten Prozessoren auf getrennten Kopien **derselben** Hardware, Forschung und Accountboni. Beide belegen dieselbe Prozessorrolle; sie sind keine gleichzeitig stapelbaren Erstitems.

- Der Chip liefert in diesen Zuständen **10,4 % mehr Compute/s und passive Credits/s** als das Relais.
- Data/s steigt dabei um rund **5,07 %**; die vorhandene Dataformel bleibt unverändert.
- Das Relais behält seinen tatsächlichen Spezialeffekt: in diesen Quotes zwei Credit-Einkommenssekunden je zehn Taps. Bei konstantem Einkommen entspricht das im Mittel 0,2 Einkommenssekunden pro Tap; diese Burst-Gutschrift ist in einem gewöhnlichen Tap- oder passiven Produktionssnapshot nicht enthalten.

Damit entsteht eine nutzbare passive Prozessoralternative. Die Quote beweist keine allgemeine Dominanz und keine langfristige optimale Buildwahl. Der unveränderte Messcontroller rüstet vorhandene nicht aktive Prozessoren nacheinander aus; mit zwei Prozessoren wechselt er deshalb regelmäßig. Seine gesamten Runerträge sind **kein Vergleich zweier fest gehaltener optimierter Builds**. Das nächste Buildprofil muss eine dauerhafte Loadout-Präferenz deklarieren und Relaisbursts als gebuchtes Einkommen zählen.

Die vier zusätzlichen Fragmente sind pro Account begrenzt. Weitere Rezepte, Blueprint-Meisterschaft, seltene Materialien und spätere Synergien behalten ihre bisherigen Kosten und Beschaffungswege. Keine Hardwarepreise, Data-Produktionswerte, Forschungszeiten, Prestigeformeln oder späteren Drop-/Analysekurven wurden angepasst.

## Verifikation

Lokale vollständige Abnahme: 1.257 Standardtests, Typecheck und Build grün. Zwanzig neue gezielte Tests prüfen Zahlung/Endzeit, online/offline, doppelte Completion/Reload, Prestige/Axiom, unbezahlte Legacy-Jobs, vollständige kostenpflichtige Crafting-Kette, Kapazitätsgrenze, echte Challenge-/Main-Isolation, alte abgeschlossene/laufende/nested Saves, aktuelle beschädigte Nachweise, DE/EN-Feedback und Export.

Alle acht natürlichen Fälle laden ihren Save unverändert wieder, haben keine manuellen Aktionen außerhalb ihrer Sitzungen und schließen die Data-Bilanz mit einer relativen Abweichung unter 4e-15. Drop-Data, passive Data, bezahlte Jobs und Prestigeverluste bleiben getrennt erfasst. Die Messdatei enthält Git-Blobhashes der relevanten ausgeführten Quellen, da auf der dokumentierten Main-Basis die neue Implementierung gemessen wurde.

Reproduktion:

`timeout 180 npx vite-node --script scripts/natural-progression-baseline.ts docs/blueprint-bridge-profiles.json`

Daten: `blueprint-bridge-profiles.json`, Vergleich: `blueprint-bridge-comparison.json`, unveränderte frühere Basis: `natural-progression-baseline.json`.

Keine neue Browser-/Geräteabnahme und keine Wochen-/Monatskampagnen. Lokaler Node 24; CI ist weiterhin auf Node 22 konfiguriert. Die bekannte Build-Chunkwarnung bleibt. Keine Veröffentlichung oder Merge durch diesen Auftrag.

## Nächste abhängige Arbeit

Zuerst passive Sitzungskadenz und Tapintensität getrennt messen, dann feste Relais-/Chiploadouts mit tatsächlichen Bursteinkünften vergleichen. Anschließend ein breiteres zugängliches Forschungsportfolio als Data-Sink nutzen. Keine globalen Preis-Nerfs aus einem absichtlich begrenzten Controller ableiten. Natürliche Forge-/Midgame-/Challenge-Pfade und die Wochen-/Monatsbalance bleiben spätere Mess- und Integrationsaufgaben.
