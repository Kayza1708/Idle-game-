# Balancebericht Phase 1.1 – historische Vergleichsbasis

## Lokaler Berichtsexport ab Save v8

Die Oberfläche bietet den manuellen Download `Balancebericht exportieren`. Das JSON-Format v1 enthält Spiel-/Save-Version, eine zufällige anonyme Kampagnen-ID, den aktuellen Run, den auswertbaren Spielzustand, Prestige-Snapshots, Schlüsselereignisse und 15-Minuten-Aggregate für Taps, aktive beziehungsweise Offline-Zeit, Einnahmequellen und Offline-Belohnungen. Es werden weder Account-/Geräteinformationen ergänzt noch Daten automatisch übertragen.

Häufige Werte wachsen nicht unbegrenzt: Detailereignisse sind auf die jüngsten 500 Einträge begrenzt, 15-Minuten-Fenster auf 31 Tage. Ältere Fenster werden in einer Kampagnensumme verdichtet; Prestige- und Hardware-Meilensteinereignisse bleiben dauerhaft erhalten. Migrierte ältere Spielstände kennzeichnen nicht vorhandene historische Dauer-, Ereignis- und Quellenwerte als `null` beziehungsweise in `unavailable`, statt sie zu schätzen.

> **Status v6:** Die folgenden Messwerte stammen aus dem unmittelbar vorherigen Kern ohne Betriebsprofile/Daten/Forschungsaufteilung. Sie bleiben als überprüfbare Baseline erhalten, sind aber keine behaupteten Resultate der neuen v6-Kurve. Eine erneute Simulation ist in `NEXT_STEPS.md` ausdrücklich offen; mangels installierbarer Vitest/Vite-Abhängigkeiten wurden keine Zahlen erfunden.

## v7-Kontrolllauf – 24. September 2026

Der echte kompilierte Economy-Kern wurde sekündlich ausgeführt. **Aktiv** kaufte alle 10 Sekunden nach bestem marginalem Compute/Preis und gab 3 Taps/s; **passiv** kaufte alle 60 Sekunden ohne Taps. Gems, Werbung, Debug und Training wurden nicht verwendet. Dieser isolierte Kontrolllauf prüft Kostenwände und ersten INT-Anspruch, nicht die komplette UI-Simulation.

| Profil | erste INT | Freischaltungen nach 2 h | INT nach 2 h |
|---|---:|---|---:|
| Aktiv | 22:52 | SBC 1:30, PC 3:30, GPU 5:40, Workstation 8:10, Server 13:00, Farm 17:50, Campus 22:50, Cloud 30:20, Kühlung 49:20 | 25 |
| Passiv | 115:15 | SBC 9:00, PC 21:00, GPU 34:00, Workstation 49:00, Server 78:00, Farm 107:00 | 1 |

Nach 24 Stunden waren beim aktiven und passiven ROI-Profil jeweils 55 beziehungsweise 53 INT verfügbar; die Untersee-Klasse erschien aktiv nach 3:42 h und passiv nach 5:07 h, die Orbitalklasse nach 12:28 h beziehungsweise 7:49 h. Der aktive erste Prestige liegt damit im Zielkorridor. Die aktive Kurve erreicht frühe Klassen weiterhin schnell; zusätzliche Forschungsbedingungen für spätere Klassen bleiben eine offene Balanceaufgabe.

Stand: 23. September 2026. Gemessen wurde mit dem echten Economy-/Simulationskern, ohne Gems, Werbung oder Debug. Training wurde bei jeder Kaufentscheidung abwechselnd als Qualität/Effizienz gestartet, sofern bezahlbar. **ROI** kauft die beste unmittelbare Compute/Kosten-Relation; **Neu** bevorzugt die neueste bezahlbare Klasse. Profil A entscheidet alle 10 Sekunden, tappt 3/s und aktiviert Overclock. Profil B entscheidet alle 60 Sekunden ohne Taps.

## Zwei Stunden

| Profil | Strategie | Prestige-Zeiten | Stand nach 2 h | Modell |
|---|---|---|---|---|
| A aktiv | ROI | 54:08 / 94:01 | 816.669 Compute, 28,02 Mrd. Lifetime-Umsatz | Q16 / E16 |
| A aktiv | Neu | 38:13 / 55:09 / 73:23 / 92:49 / 113:21 | 840.867 Compute, 86,63 Mrd. | Q15 / E14 |
| B gelegentlich | ROI | keiner | 366.766 Compute, 2,03 Mrd. | Q16 / E16 |
| B gelegentlich | Neu | 113:53 | 14.654 Compute, 13,01 Mrd. | Q3 / E2 |

Die neue Kurve ist bewusst langsamer: Der aktive ROI-Erstprestige verschob sich von 24:41 auf 54:08, weil `1,08^L×1,04^L` entfernt wurde und Trainingsstarts Credits/Entscheidungen verlangen. Es gibt nicht mehr automatisch bei jedem Abschluss einen neuen Lauf. „Neu“ bleibt schneller als ROI, erreicht aber nicht mehr binnen 13 Minuten den ersten Reset. Profil B zeigt weiterhin zu lange Prestigezeiten; weitere Kalibrierung muss Hardwarepreise und Prestige gemeinsam betrachten, nicht Modellboni wieder exponentiell machen.

## Sieben Tage Rückkehrer

Sieben Zyklen aus fünf sichtbaren Minuten, fünf ROI-Käufen und acht Stunden Offline ergaben 1.216,5 Compute, 132,67 Mio. berechtigten Umsatz, Q4/E3 und noch keinen Prestige. Offline schließt einen gestarteten Lauf ab, startet aber keinen neuen. Das ist die beabsichtigte Entscheidungsgrenze, zeigt aber auch, dass Rückkehrer mehr klare Max-Kauf- und Trainingsentscheidungen benötigen.

## Wartezeiten und Timeline

Im aktiven Profil erfolgen Kauf-/Trainingsentscheidungen im 10-Sekunden-Raster; im gelegentlichen Profil im 60-Sekunden-Raster. Trainingsstarts lagen aktiv zunächst bei 0:10 Q, 1:10 E, 1:50 Q, 2:00 E und danach zunehmend weiter auseinander. Gelegentlich lagen die ersten Starts bei 1:00 Q, 3:00 E, 5:00 Q und 7:00 E. Diese Zeitpunkte sind tatsächliche Simulationsergebnisse, keine UI-Vorschau.

## Offene Balancearbeit

Zielkorridor für den ersten aktiven Prestige ist vorerst 40–60 Minuten, gelegentlich 90–120 Minuten. Damit bleiben Hardwarekauf, Trainingswahl und Overclock mehrere Zyklen relevant. Menschliche Browsertests müssen bestätigen, dass zwischen bezahlbaren Käufen keine mehrminütigen Leerphasen entstehen. Der Rückkehrerpfad und die Strategiedifferenz bleiben offen; die Roadmap markiert Phase 1 deshalb nicht als vollständig abgenommen.

## Diagnose des ersten echten Exports (Save v12)

Der gemeldete Lauf (rund 32,5 Minuten, 9 INT, 39 Trainingsstufen, Cloud, etwa 1,08 Mio. Forschungspunkte, ein Projekt, kein Item) ist ein wertvoller Einzelpunkt, aber keine Grundlage für eine Kurvenänderung. Die hohe Forschungssumme ist mit dem aktuellen System grundsätzlich erklärbar: Jedes Betriebsprofil weist Compute dauerhaft der Forschung zu; `researchRate` skaliert sublinear mit diesem Compute und leicht mit dem Datenbestand. Forschungspunkte bleiben über Prestige erhalten, während die derzeit drei Projekte zusammen nur 525 Punkte verbrauchen. Der Engpass ist daher sichtbar zu wenig Forschungsausgabe, nicht nachgewiesen eine fehlerhafte Erzeugung. Weitere Projektsenken werden erst nach mehreren Exporten vorgeschlagen.

Exportformat v1 ergänzt deshalb nun eine verständliche Herkunftsbeschreibung, aktuellen und durch protokollierte Projektstarts ausgegebenen FP-Bestand sowie Zähler für Hardwarekäufe, Trainingsstarts/-abschlüsse, Forschungsstarts/-abschlüsse, Erfolge und Prestige. Neue Starts erfassen Zeitpunkt und tatsächliche Kosten lokal. Alte, vor Telemetrie entstandene Historie bleibt weiterhin ausdrücklich als nicht verfügbar markiert.

Die reproduzierbaren aktiven/gelegentlichen Kontrollläufe oben verwenden den echten Economy-/Simulationscode. Sie zeigen weiterhin die dokumentierten Engpässe: eine starke Strategiedifferenz, einen langsamen Rückkehrerpfad und einen sehr großen Abstand zwischen passiver Forschungsproduktion und den nur drei kleinen Ausgaben. Produktions- und Prestigekurven wurden für diesen Einzel-Export nicht verändert.

## Export-/Komponentenprüfung – 25. September 2026

Der lokale ZIP-Export enthält jetzt zusätzlich die ausdrücklich maschinenlesbaren Kerndateien `manifest.json`, `events.csv`, `events.jsonl` und `economy.json`; `summary.json`, `snapshots.csv` und `diagnostics.json` bleiben erhalten. Das Manifest dokumentiert Version, Datenschutz und Grenzen. Die Economy-Datei exportiert die zentrale Forschungs- und Komponenten-Konfiguration, nicht den vollständigen Save. Die Summary aggregiert aktive/offline Zeit, Abschlusszahlen, Produktionsraten, aktuelle Daten/Projektkosten und Komponentenfunde nach Quelle. Ereignisse und Snapshots bleiben auf 500 beziehungsweise 300 Einträge begrenzt.

Die Atlasdatei wurde direkt als PNG geprüft: 1536 × 1024 Pixel, RGBA (8 Bit), nicht interlaced und exakt in sechs 512-×-512-Zellen teilbar. Die Reihenfolge entspricht Schaltkreise, Laser, Graphen / Titan-Schrauben, Nanoröhrchen, Quantenkerne. Alle Zellen besitzen sichtbare Alpha-Pixel. Der Atlas wurde als Ganzes visuell geprüft; ein gerenderter Browser-Screenshot war wegen der blockierten Paketinstallation nicht möglich.

Die bereits vorhandene Forschungsabschlusskorrektur wurde nicht dupliziert. Ihr Regressionstest prüft weiterhin aktive/offline Abschlüsse, Queue, Reload unmittelbar vor Abschluss, die instrumentierte Phasenfolge und genau ein Abschlussereignis. Die gemessene feste Laufzeit des ersten Projekts ist 180 Sekunden; die nachfolgenden zentral berechneten Laufzeiten sind rund 24,48 Minuten (Rang 8) und 9,50 Stunden (Rang 20; 34.209 Sekunden). Der in der vorhandenen Diagnose dokumentierte frühere Fehlerpfad erreichte bis zu 200.000 Mikroiterationen; nach dem Fix wird der Slot vor Belohnung/Ereignis entfernt.

### Reproduzierbare Abschlussmessung

Ein am 25. September 2026 direkt aus den TypeScript-Kernmodulen kompilierter Lauf maß für Operationen/Blueprints/Alignment feste 180/1.468/34.209 Sekunden und exakt 250/1.000/5.000 Daten Startkosten. Die reine Abschlussfunktion benötigte in diesem Lauf 0,170/0,061/0,057 ms und erzeugte jeweils genau ein Abschlussereignis. Der 181-Sekunden-Gesamtlauf des ersten Projekts benötigte aktiv 7,34 ms und offline 2,69 ms; in beiden Fällen waren Slot leer, Zähler eins und Ereigniszahl eins. Diese Wall-Zeiten sind Maschinenmessungen des Kernlaufs, keine Browser-Frametimes.

## Reproduzierbare v17-Kernsimulation – 25. September 2026

Die Simulation verwendete ausschließlich `newGame`, `advance`, Hardwarekauf, Tap, Forschungsstart, Experiment, Crafting und Prestige aus dem Spielcode sowie den festen RNG-Wert 0,424242. Das aktive Profil entschied alle 10 Sekunden und tappte dreimal pro Sekunde; das passive Profil entschied alle 60 Sekunden ohne Taps. Beide liefen 86.400 simulierte Sekunden. Die Teststrategie hielt die fünf Forschungen möglichst auf gleicher Stufe und startete lange Analysen in fester Rotation.

| Messwert | Aktiv | Passiv |
|---|---:|---:|
| Datenerzeugung Stufe 1 gestartet | 2:50 | 5:00 |
| Materialanalyse Stufe 1 | 6:20 | 12:00 |
| Bauplananalyse Stufe 1 | 11:10 | 15:00 |
| Modellarchitektur Stufe 1 | 14:50 | 19:00 |
| Laborautomation Stufe 1 | 19:50 | 28:00 |
| erster Prestige | 56:30 | 6:16:00 |
| erster Quantenchip | 12:36:40 | 12:46:00 |
| Forschungsstand nach 24 h | 15/15/14/14/14 | 15/14/14/14/14 |
| Titan-Schrauben nach Crafting | 35 | 35 |

Alle drei Baupläne wurden in getrennten, ansonsten identischen Läufen craftbar: aktiv jeweils nach 45.400 s, passiv nach 45.960 s. Der gemeinsame Zeitpunkt entsteht durch den ersten vollständigen garantierten Analysezyklus und genügend Bauplanfragmente; das ist ein messbarer Analyse-/Zeitengpass, kein seltener Zufallsdrop. Das gemeinsame Craftingfenster ist noch wenig differenziert und bleibt ein offener Balancingpunkt.

Für Datenerzeugung ergeben die zentralen Funktionen:

| Ziellevel | feste Dauer | Datenkosten |
|---:|---:|---:|
| 1 | 90 s | 40 |
| 5 | 199,3801104 s | 108 |
| 10 | 538,866252 s | 369 |
| 20 | 3.936,219353 s | 4.356 |
| 50 | 259.200 s (72-h-Cap) | 7.167.184 |

Beim ersten aktiven Start betrug die echte Datenrate 4,732416/s, entsprechend etwa 8,45 s Ansparzeit für Stufe 1; passiv begann die Stufe nach fünf Minuten. Nach 24 Stunden betrugen die simulierten Datenraten etwa 63,86 Mrd./s aktiv und 1,58 Mrd./s passiv. Ansparzeiten später Stufen sind in diesen Läufen deshalb gegenüber der gespeicherten Forschungsdauer vernachlässigbar: Die Dauer, nicht Daten, wird zum Engpass. Das starke Wachstum der Datenproduktion und der Verlust strategischer Datenknappheit nach frühem Spiel sind als konkretes Balanceproblem bestätigt; die Werte wurden in diesem Auftrag nicht ohne weitere Mehrprestige-Messungen verschärft.

Die Ereignisgrenze griff erwartungsgemäß: 500 Detailereignisse blieben erhalten, 1.310 aktive beziehungsweise 1.044 passive Ereignisse wurden geordnet verworfen und in `diagnostics.droppedEvents` gezählt. Der Export arbeitet jetzt dateiweise, gibt zwischen Dateien den Eventloop frei, meldet Fortschritt, akzeptiert `AbortSignal` und erstellt ihn aus einem geklonten Zustand.

## Analyse-Regression und offener Langlauf – 25. September 2026

Der reproduzierte Defekt bestand aus zwei zusammenwirkenden Pfaden: Analyseaktionen
waren nicht Teil der sofort gespeicherten Transaktionen und die Oberfläche zeigte den
bereits belegten separaten Slot überhaupt nicht. Ein Reload direkt nach Start ließ den
Auftrag deshalb verschwinden; ein unterbrochener Altzustand mit derselben ID in
`active` und `completedIds` blockierte den Slot dauerhaft. Der Kern repariert diesen
Zustand nun deterministisch, und Startkosten sowie Slot werden atomar reserviert.

Die neuen Kosten entsprechen bei 24 Kurzläufen bewusst einer höheren Summe als ein
vierstündiger Vertrag; der lange Vertrag belohnt Planung, der kurze Flexibilität. Die
vorhandenen v17-24-Stunden-Werte bleiben historische Vergleichswerte. Ein neuer
7-/30-Tage-Lauf konnte in diesem Checkout nicht seriös ausgeführt werden, weil die
vorhandene unvollständige `node_modules`-Installation keine Vitest-Binärdatei enthielt
und `npm ci` beim Abruf von Vitest mit HTTP 403 scheiterte. Deshalb werden für die neue
Softcap-/Kostenkurve keine erfundenen Langzeitwerte behauptet.

## Deterministische A–H-Abnahme – Seed 1708 (2026-09-25)

Der bestehende Simulator wurde um `simulateBalance()` erweitert; er verwendet dieselben `advance`, Kauf-, Forschungs-, Analyse- und Prestige-Regeln wie das Spiel. Schrittweite der Abnahme: 300 s. Aktive Runs modellieren zusätzlich kontinuierliche Tap-Einnahmen und Modelltraining; passive Runs nicht.

| Szenario | erste Forschung | erstes Item | Prestige 1 | Prestige 2 | Prestige 3 | Prestige 4 | Prestige 5 | ungültige Zahl |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| 7 Tage aktiv | 10 min | 50 h 45 min | 50 min | 1 h 30 min | 2 h 15 min | 2 h 50 min | 3 h 35 min | nein |
| 7 Tage passiv | 10 min | 50 h 20 min | 1 h | 1 h 45 min | 2 h 35 min | 3 h 25 min | 4 h 10 min | nein |
| 30 Tage aktiv | 10 min | 50 h 45 min | 50 min | 1 h 30 min | 2 h 15 min | 2 h 50 min | 3 h 35 min | nein |

Hardware-Erstkäufe im aktiven 30-Tage-Run: Taschenrechner 5 min, SBC 10 min, PC 15 min, Gaming-GPU 20 min, Workstation 25 min, Server 35 min, GPU-Farm 45 min, Campus 1 h 30 min, Cloud 4 h 20 min, Flüssigkeitsanlage 4 h 40 min, Untersee 5 h 15 min, Orbital 12 h 30 min, Lunar 33 h 25 min, Dyson 6 d 14 h 50 min. Matrioshka wurde innerhalb von 30 Tagen entdeckt, aber in der protokollierten Erstkaufkarte nicht vor Simulationsende gekauft. Keine Klasse wurde durch den Freischaltpfad übersprungen.

Hinweis: Die fünf Prestige-Zeitpunkte sind sehr früh. Da der Auftrag keine Zielzeit für Prestige vorgibt, wurde der verbindliche Prestige-Anspruch nicht willkürlich verschoben; der Bericht macht dieses Messergebnis stattdessen explizit sichtbar.
