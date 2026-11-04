# Native Unity V3 · Balance-Fassung 2026-11-03

Neue Balance-Anpassungen werden ausschließlich in `Assets/IdleIntelligence/Core/EconomyBalance.cs` gepflegt (vom Nutzer ausdrücklich als Ersatz für die entfallene `src/economy.ts` freigegeben). Bestehende generierte Tabellen bleiben als historische Grundwerte/Legacy-Kompatibilität erhalten. Keine parallele Web-Spielversion.

| Neue Aktion | Änderung gegenüber bisher |
| --- | --- |
| Wiederholbare Forschung auf bisherigem Level L | bisheriger Preis × 4 × 1,15^L, abschließend aufgerundet |
| Einmalige Forschungsprojekte | bisheriger Basispreis × 4 |
| Reguläre Item-Herstellung | Daten × 6 |
| Item-Levelupgrade, auch Starter | Daten × 4 |
| Erste drei Starter-Rezepte | unveränderte Rezeptkosten |
| Kostenloser Tutorial-Forschungsschritt | weiterhin kostenlos |

Prestige-Rabatte wirken weiterhin auf den neuen Forschungspreis. Komponenten, Module, Bauplanfragmente, Arbeitsdauer, Hardwarepreise und Effektmultiplikatoren sind unverändert. Damit wird zunächst der Datenüberschuss adressiert, ohne gleichzeitig Materialversorgung und Produktionskurve zu verschieben. Hohe Materialpreise ohne Vermessung ihrer Bezugsquellen wären kein belastbarer nächster Schritt.

Preise hängen ausschließlich von Definition, Forschungslevel und vorhandenen Freischaltungen ab, nicht vom aktuellen Einkommen oder Guthaben. Economy-Helfer sind rein; Simulation bleibt zeitbasiert. Bestehende Items, Level, bezahlte Materialbasis und bereits laufende Aufträge werden nicht nachträglich neu bepreist. Kein Saveformatwechsel, kein Zurücksetzen und kein Zugriff auf Nutzerspeicherstände.

## Reproduzierbare erste Messung

`NativeChecks/V3BalanceProbe.cs`: 120 simulierte Minuten, zwei Taps/Minute, maximal fünf bezahlte Hardwarekäufe/Minute, ausgeglichene Trainingspriorität, Forschung priorisiert Baupläne/Daten/Compute. Gleicher Seed und gleiche Strategie vorher/nachher; keine geschenkten Währungen. Invariante CSV-Zahlen ohne Tausendertrennzeichen: [vorher](balance/before.csv), [nachher](balance/after.csv).

| Zeitpunkt | Forschungslevel vorher → nachher | Daten/s vorher → nachher |
| --- | --- | --- |
| 30 min | 6 → 4 | 15,6 → 12,4 |
| 60 min | 8 → 6 | 90,2 → 71,9 |
| 120 min | 12 → 8 | 295,4 → 187,7 |

Hardware und Training verlaufen bei dieser Strategie identisch; erstes beanspruchbares INT weiterhin bis Minute 120. Forschung ist spürbar langsamer, ohne dass dieser Lauf beim Einstieg blockiert.

Diese Messung ist keine vollständige Langzeit-Abnahme: Der einfache Bot kauft nur vier Hardwareklassen, fertigt keine Items und führt keinen Prestige-/Axiomreset aus. Deshalb ist diese Fassung eine erste überprüfbare Kalibrierung. Noch offen: bezahlte Item-/Materialketten und spezialisierte Loadouts, mehrere Prestigezyklen, spätes Hardware-ROI und Langzeit-Spieltests. Erst damit lassen sich weitere Material-, Hardware- und Multiplikatoränderungen begründen.

## Teststrategie

Neue NUnit-Verträge prüfen alle 42 Rezeptpreise, tatsächliche Abbuchung/Abweisung bei fehlenden Daten, bezahlte Forschungsbelege, kostenlose Tutorial-Forschung, unveränderte Materialbasis und extrem hohe Forschungslevel. Vorhandene historische Referenzdaten bleiben unverändert. In den vorbereiteten Effekt-/Zeit-Fixtures gleicht `BalanceReferenceFunding` ausschließlich die zusätzliche Datengebühr explizit aus; Serien- und Upgrade-Fixtures erwarten die neuen Preise. Diese künstliche Testfinanzierung wird niemals im bezahlten Vergleichslauf verwendet.

Wiederholung der aktuellen bezahlten Simulation auf einem Host mit .NET 8: `dotnet run --project NativeChecks/UnityCoreCheck.csproj -- --balance`. Ausgabe: `NativeChecks/out/unity-v3-balance-current.csv`. Auf diesem Rechner wurde derselbe Quellcode mit dem gebündelten Unity-Mono-Compiler gegen die von Unity kompilierte Core-Assembly ausgeführt. Vorher-Daten stammen aus der unveränderten Core-Assembly vor diesem Balanceauftrag.

Abnahme: **248/248 EditMode**, **3/3 Schmiede-PlayMode**, native Core-Verträge und lokaler macOS-Build erfolgreich. [Prüfmanifest](balance/verification.json). Keine erneute vollständige PlayMode-Suite oder Endgame-Langzeitabnahme für diese Fassung.

## Gemeinsamer GitHub-Stand · 3. November 2026

Der aktuelle Upload mit Balance, zusätzlichen Gesamtprüfungen und nachkorrigierter Kostenanzeige ist in [GitHub-Status](github-status.md) und [Prüfmanifest](github-upload.verification.json) dokumentiert. Historische Prüfzahlen oben bezeichnen ihre jeweiligen Zwischenstände.

## Materialrezepte · 4. November 2026

Die frühere Aussage „Komponenten unverändert“ beschreibt den Stand vom 3. November. Ab diesem Nachtrag gelten für neue native V3-Herstellungen die Rezepte in `Assets/IdleIntelligence/Core/EconomyBalance.cs`. Die eingefrorenen historischen Tabellen bleiben erhalten. Alle sechs Einstiegsrezepte mit Starter-Kennung behalten ihre bisherigen Materialkosten; die übrigen 36 Rezepte werden angehoben.

| Rezeptgruppe | Faktor auf die neue Zutatenbasis | Verschiedene Komponenten |
| --- | ---: | ---: |
| Midgame / erste Prestige- und Automationsitems | ×6 | 4–5 |
| Server / fortgeschrittene Werkstatt | ×10 | 5 |
| Campus / Photonik | ×20 | 5 |
| Quanten-/Matrioshka-Ausrüstung | ×35 | 5 |
| Geheimlabor und Modellsets | ×50 | 5 |
| Axiom-Ausrüstung | ×80 | 5 |
| Singularitätslinse ab drittem Axiomzyklus | ×100 | 5 |

Die Zutatenbasis wurde pro Item ausgewählt, statt jede historische Zutat blind zu vervielfachen. Vorherige Rezepte mit acht Zutaten werden auf fünf konzentriert. Zusätzliche Zutaten stammen höchstens aus der höchsten zuvor benötigten Materialfamilie; es wird keine spätere Materialfamilie als neue Zugangshürde eingeführt. Die Mengen betonen wiederholte Analysen, Materialfokus, Synthese und bestehende Ausbeuteverbesserungen. Die Freischaltungen und Materialquellen selbst bleiben unverändert.

| Item | Gesamtmenge vorher → nachher | Zutaten vorher → nachher |
| --- | ---: | ---: |
| Photonik-Array | 46 → 300 | 4 → 5 |
| Neuraler ASIC | 104 → 504 | 8 → 5 |
| Photonische Matrix | 104 → 2.400 | 4 → 5 |
| Quantenkoppler | 137 → 5.635 | 4 → 5 |
| Entropiesenke | 150 → 11.500 | 4 → 5 |
| Singularitätslinse | 144 → 17.200 | 4 → 5 |

Beispiel Singularitätslinse: 4.800 supraleitende Leiter, 2.400 Quantenprozessorkerne, 3.200 Diamantsubstrate, 4.000 Spintronik-Bauteile und 2.800 kryogene Resonatoren. Daten und Module kommen weiterhin hinzu. Die vollständige [42-Rezepte-Tabelle](balance/item-recipes-20261104.csv) enthält auch Zutaten-IDs und Mengen bei maximaler Meisterschaft.

Meisterschaft senkt die neuen Kosten weiterhin auf 95/90/85/80 Prozent; jede Zutat wird einzeln aufgerundet. Serienfertigung zeigt und bezahlt das Vielfache aller Zutaten. Fehlt auch nur eine davon, werden weder Daten noch Materialien abgebucht. Neue Items speichern exakt die bezahlten Mengen als Materialbasis. Bestehende Items, bezahlte Rückgewinnungsbasis, laufende Aufträge und Speicherversion werden nicht nachträglich verändert. Datenpreise bleiben beim vorherigen Tuning; keine zusätzlichen Hardware-, Forschungs- oder Levelupgrade-Preisänderungen.

Die Schmiedevorschau verwendet für fünf Materialien zwei Reihen mit wiederverwendbaren Plätzen. Die Kostenliste zeigt weiterhin jede Komponente, Daten und beide Module; die Fusion kehrt zu drei Itemplätzen zurück.

Reproduktion der Preistabelle auf .NET 8: `dotnet run --project NativeChecks/UnityCoreCheck.csproj -- --recipes`. Dies ist eine deterministische Preisprüfung, keine Langzeit-Spielsimulation. Die tatsächliche Sammeldauer hängt stark von Forschung, Fokus, Ausrüstung und Prestigeausbeute ab; eine feste Stundenanzahl oder vollständig kalibriertes Endgame wird nicht behauptet.

Aktuelle Testergebnisse und Buildnachweis: [Materialpreis-Prüfmanifest](balance/item-recipes-20261104.verification.json).

Prüfung dieses Nachtrags: erster vollständiger EditMode-Lauf 247/250; dabei einen echten Meisterschafts-Rundungsfehler und zwei veraltete Preisannahmen in historischen Transaktions-Fixtures gefunden. Rundung auf ganzzahlige Prozentrechnung umgestellt; die zwei Fixtures berücksichtigen explizit die neuen Materialpreise, behalten aber Fehlmengen-, Abbruch-, ID- und Belegprüfungen bei. Danach 10/10 gezielte EditMode-Nachtests bestanden. Kein erneuter vollständiger 250er-Lauf nach dieser gezielten Korrektur behauptet. Native Core-Verträge ebenfalls erfolgreich; gezielte PlayMode-Abnahme und finaler Build sind im Manifest festgehalten. Kein bezahlter Langzeit-Sammellauf durchgeführt.

Aktuelle Unity-Aufnahmen: [fünf Materialien bei 320 px](media/item-recipes/de-320.png), [vollständige Kosten bei 320 px](media/item-recipes/de-320-costs.png), [englische Ansicht](media/item-recipes/en-390.png).
