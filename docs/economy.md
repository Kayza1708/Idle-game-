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
