# Erster Prestige ab 1 oder 3 INT und gleiche Rückkehrpause

12. Oktober 2026. Ergänzung zum noch offenen Draft-PR #93; Vorgängerartefakte bleiben historische Messungen ihrer jeweiligen Quellhashes. **Keine Balance-/Save-/UIänderung.** `firstPrestigeINT` ist eine optionale Messpolicy, keine neue Mindestanforderung des Spiels. Default bleibt 3; der Spieler kann weiterhin regulär ab 1 INT prestigen.

## Kontrollierter Umfang

Acht natürliche Profile: zwei Seeds (1708/2026), erster Reset ab 1/3 INT, je Fertigung-/Queue-first. Regulärer Start, Credits-only-Hardware, echte bezahlte Nodes/Jobs, gleiche begrenzte Forschung, gleicher Chipbuild und echte Claims wie in `passive-return-findings.md`. Maximal zwei Resets, zweiter weiterhin ab 3 INT und 15-Minuten-Run zwischen Analysen. Keine Startbestände/Freischaltungen vorgegeben.

Alle acht Profile verwenden dieselben Besuche: 0–10min, 1h–1h05, 3h–3h05, 6h–6h05 und 9h–9h05. Horizon **9h05**, Onlinebudget **30min**, ein Tap/s nur online. Tatsächliche Pausen werden einmal mit `advanceTo` verarbeitet. Beide ersten Resetfenster haben **300s online + 10.500s offline**; entsprechende Rückkehrberichte sind im Artefakt ausdrücklich zugeordnet. Kein Offlinecap-Überlauf in dieser Teilmessung; der frühere Nachtcap-Vertrag bleibt separat geprüft.

Gemeinsames Laufzeitbudget 60s, je Profil 15s; tatsächliche Messung **25,13s**. Der neue Parameter lehnt andere Ziele ab. Zwei zusätzliche Tests sichern reale 1-INT-Zahlung und unverändertes 3-INT-Defaultverhalten. Der aktive Vertragsfall wartet ausreichend auf das reguläre Analyseende, statt Claim-Reife mit einem erlaubten Reset der Messpolicy gleichzusetzen.

## Bestätigte Ergebnisse

| Erste Resetpolicy | Kaufreihenfolge | Erster Reset | Offlinekäufe danach | Trainingsabschlüsse in gleicher Pause | Nodes beim letzten Besuch | INT erhalten + aktuell abholbar bei 9h05 |
|---|---|---|---|---|---|---|
| ab 1 INT | beide | bei 3h: +1 | 61–62 | 1 | Einkaufsagent | 1 + 2 = 3 |
| ab 3 INT | Fertigung zuerst | bei 6h: +6 | 96 | 1 | Einkaufsagent, Dataarchiv, Analyse, Fertigung, Labor | 6 + 1 = 7 |
| ab 3 INT | Queue zuerst | bei 6h: +6 | 99 | 3 | Einkaufsagent, Trainingsplan, Dataarchiv, Analyse | 6 + 1 = 7 |

Die Resetpolicy wartet auf die Besuchszeiten: „ab 3“ beansprucht deshalb tatsächlich 6 INT. Es ist **kein** Vergleich eines exakt bei 3 ausgeführten Resets mit einem exakt bei 1 ausgeführten Reset.

- Mit 1 erhaltenem INT kostet der Einkaufsagent den gesamten ersten Reward. Die zwei Nodeprioritäten unterscheiden sich zunächst nicht: weder 1-INT-Basisnode noch 3-INT-Trainingsplan ist bezahlbar. Beide bleiben bis 9h05 auf diesem Stand; kein zweiter Reset in der erklärten Policy.
- Mit 6 INT kauft Fertigung-first fünf frühe Nodes und behält 1 INT. Queue-first kauft den Trainingsplan für 3 INT plus Einkaufsagent/Dataarchiv/Analyse und verwendet alle 6 INT. **Fertigung/Labor fehlen dort**, obwohl der Controller sie danach anstrebt. Damit existiert ein konkreter Verzicht, statt eine kostenlose bevorzugte Automation.
- Queue-first startet in der gleichen 2h55-Pause das aktive Training plus zwei vorgemerkte Jobs. Fertigung-first hat nur das aktive Training. Bei Rückkehr sind alle zwei wartenden Jobs verbraucht; außerhalb der Besuche wird nichts nachgefüllt. Die Queue erlaubt drei statt eines Offlineabschlusses. Nach dem anschließenden Besuch: insgesamt 15 statt 14 abgeschlossene Trainings, frühe 1-INT-Profile 13.
- Die drei zusätzlichen automatischen Hardwarekäufe bei Queue-first werden weiterhin aus Credits bezahlt. Keine Sonderressource, Gratis-Hardware oder Upgradepflicht.
- Die späteren Resetprofile haben bei Rückkehr ca. 227k Data (Fertigung) bzw. 236k Data (Queue); frühe Resetprofile ca. 66k. Dies sind Restbestände nach echten Ausgaben, keine identischen Startzustände für einen isolierten Wirkungsvergleich.
- Alle acht Profile: kein zweiter Reset bis 9h05, kein gefertigter Chip, 5.000 Season-XP, Tagesbonus, kein Wochen-/Monatsbonus. Noch nicht abgeschlossene Jobs werden nicht als erledigtes Contentziel gezählt.

## Kritische Einordnung und Entscheidung

Der erste 1-INT-Reset ist in **diesen Besuchsprofilen** wirtschaftlich schwächer, obwohl Automation und Ausrüstung früher geöffnet werden. Er setzt das bereits aufgebaute Modell zurück und lässt nur einen bezahlten Node zu. Der spätere Reset behält länger die alte Produktion und finanziert mehrere Systeme auf einmal. Die Werte 3 versus 7 sind erhaltene plus derzeit abholbare INT; sie sind keine frei ausgebbaren INTbestände und kein Beweis für die weltweit beste Prestigezeit.

Das spricht **gegen einen pauschalen 1-INT-Rush als Empfehlung**, aber nicht gegen seine erlaubte Existenz. Unterschiedliche Besuchsdichte, Tapbuilds, weitere Nodes oder andere Researchbudgets sind nicht getestet. Wir erhöhen keine Mindestanforderung und geben kein kostenloses Starterpaket. Den schwächeren ersten Reset durch Gratis-Hardware oder günstigere Nodes aufzuwerten würde den gezeigten Aufbauverzicht ohne ausreichenden Grund entfernen.

Die bezahlte Queue hat im gleich langen Folgeabschnitt einen nachgewiesenen Nutzen und einen echten Gegenpreis: zusätzliche Offline-Modellarbeit versus frühere Labor-/Fertigungsprogression. **Kosten und Freischaltung bleiben unverändert.** Beide werden zuerst vollständig über normale Ressourcen erreichbar, bleiben über Prestige erhalten; aktive und vorgemerkte Trainings unterliegen weiterhin dem realen Resetvertrag. Die Queue ist ein endlicher Puffer, keine unbegrenzte Automation.

Zwei Seeds und ein einfaches Controllerportfolio reichen nicht, um langfristige Dominanz oder Retention zu belegen. Gleiche Seeds garantieren nach unterschiedlichem Reset-/Dropverbrauch keinen identischen RNGstrom. Gleiche Kalenderbesuche und gleich lange Folgepausen trennen die Pause als Störgröße; sie gleichen den absichtlich unterschiedlich verdienten Accountstand **nicht** an.

## Abnahme und nächster integrierter Block

Quellhashes geprüft. Acht Reloads, vollständige Gem-/Quest-Season-XP-Buchung und Data-/Tap-Ausgabenabgleich; keine manuellen Aktionen außerhalb der Sessions. Automatische Käufe/Trainingszahlungen weiter über den vorhandenen Simulatorobserver erfasst. Rohdaten samt Reset-/Abreise-/Rückkehrzuständen und Validierung: `first-prestige-return-profiles.json`. Reproduktion: `npx vite-node scripts/first-prestige-return-study.ts docs/first-prestige-return-profiles.json`.

Nächster V1-Block: vorhandene zusätzliche Equipmentplätze und Forschungsfreischaltungen auf reguläre Erreichbarkeit prüfen, dann drei feste Builds mit **gleicher Forschungsfreiheit und gleichem Eingabebudget** vergleichen. Der Forschungsbuild soll einen spezifischen Nutzen/Gegenpreis gegenüber Tap- und Produktionsbuild erhalten; bei einem belegten Integrationsloch erfolgt eine konkrete Änderung samt Save-/Reset-/Automationsvertrag. Keine neuen Menüs oder Währungen als Ersatz für diese Verbindung.

Offen bleiben zweiter passiver Prestige über 9h05/15h hinaus, echte Mid-/Late-Builds, Wochen-/Monatskalibrierung, Browser-/Geräteabnahme und übrige V1-Releasepunkte. Die Kalibrierungsaufgaben sind keine Releasefreigabe.

Lokale Gesamtabnahme: **1.303 Standardtests**, App- und strikter CLI-Typecheck, Produktionsbuild und Diffcheck grün. Keine Browser-/Geräteabnahme.
