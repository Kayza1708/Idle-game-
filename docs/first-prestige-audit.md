# Auftrag 8C: Hardware-Nachbesserung integrieren, attraktiven ersten Prestige abstimmen

## Git-Basis und geschützter Umfang

AGENTS.md gelesen; Repository /workspace/Idle-game-, origin Kayza1708/Idle-game-, Ausgangsarbeitsbaum sauber. `git fetch origin main` erfolgreich: main **600ca6d** enthält den Merge von PR #75 mit 8A, aber noch nicht d7060cc568463d8943599a01a172a208ddd78452. Neuer Branch `codex/first-prestige-calibration` direkt auf diesem aktuellen main; d7060cc ohne Konflikte als **8855dd2** cherry-picked. Keine späteren Main-Änderungen überschrieben, kein Reset/Force-Push. PR #75 bleibt geschlossen und wird hier nicht aktualisiert; eigener PR gegen main integriert 8B und 8C.

8B-Server-/Farmpreise 15 Mrd./120 Mrd. bleiben unverändert. Gegenüber dem übernommenen 8B-Stand ändert 8C **nur BALANCE.prestigeBaseRevenue**. Anspruchsfunktion, kumulative Einnahmengewichtung, beanspruchter Anspruch, INT-Creditbonus, Nodepreise, Axiomformeln und alle Hardware-/Data-/Training-/Forschungs-/Dropwerte bleiben unverändert. Alte Hardwaremessungen ohne Prestige werden nicht als Reset-Verläufe umgedeutet.

## Präzisierter Zielvertrag und deterministische Ableitung

45–75 aktive Minuten bezeichnet einen **attraktiven ersten regulären Prestige mit mindestens 3 INT**. Ein einzelner INT darf früher verfügbar sein; kein Zeitgate oder zusätzlicher Reset-Zwang. `canPrestige` bleibt allein von echtem neuem Anspruch abhängig.

Profil exakt wie 8B: `newGame(0)`, 50 Credits, 0 Hardware, keine Offline-Produktion/Grants/Claims/Items/Analysen; regulärer Kauf bei t=0-Entscheidung, ein echter Tap und aktives Domain-Advance pro Sekunde, Entscheidungen alle zehn Sekunden. Q/E-Training abwechselnd wenn bezahlbar, danach Datenerzeugung höchstens Level 2. A sortiert bezahlbare echte Preview-Creditgewinne/SCI-Kosten, B verfolgt den bestehenden Meilenstein-vs-Folgekaufvertrag. Beide verwenden jetzt denselben aus 8B extrahierten Helfer `scripts/early-hardware-profile.ts`; keine unabhängige Kauf-/Produktionsformel. Das im ursprünglichen Messskript verwendete findLastIndex wurde im gemeinsamen Helfer durch dieselbe Rückwärtssuche ersetzt, weil das App-Typecheckziel ES2022 verwendet; keine Profiländerung/Compileraufweichung.

Die erste Messung führt A **ohne Prestige** maximal 180 Minuten mit dem alten Parameter aus. Bei t=3.600 Sekunden, nach echtem Advance/Tap und vor der Entscheidung, liest sie `exactEconomyValue(state,'cycleEligibleCredits')`. Käufe verändern diesen Einnahmenledger nicht.

| Größe | Wert |
|---|---:|
| Alter prestigeBaseRevenue | 442.493.746.168 |
| Gewichteter berechtigter Umsatz bei 60:00 | SCI `{m:6.88590296596195,e:9}` = etwa 6.885.902.965,961950 Credits |
| Ableitung mit echter SCI-Division | Umsatz ÷ 9 |
| Neuer zentraler prestigeBaseRevenue | **765100329.5513278** |

Der native Parameter wird erst aus dem wissenschaftlichen Quotienten projiziert, mit Prüfung auf positive endliche Darstellbarkeit; keine fehlgeschlagene Konvertierung wird zu null. ScientificNumber verwendet etwa 15–16 signifikante Dezimalstellen (binäres Floating Point), keine beliebig exakte Dezimalarithmetik. Der vorhandene Wurzelanspruch einschließlich seiner bisherigen Rundungsregel wird **nicht** im Simulator nachgebaut; sämtliche 1-/3-INT-Zeitpunkte verwenden `newINTScientific`. `prestigeThreshold` und andere Legacy-Konstanten bleiben unverändert; der aktive Anspruch verwendet prestigeBaseRevenue.

## Gemessene Anspruchszeitpunkte, ohne Reset

| Profil | Alter ≥1 INT | Alter ≥3 INT | Neuer ≥1 INT | Neuer ≥3 INT |
|---|---|---|---|---|
| A | 117:40 | 172:27 | **45:14** | **60:00** |
| B | 158:37 | nicht beobachtet bis 180:00 | **44:56** | **59:14** |

Alte A-Zeitpunkte erneut im echten Lauf bestätigt; alte B-Zeitpunkte stammen ausdrücklich aus dem erhaltenen 8B-Finalbericht. Neue A/B-Läufe jeweils frisch bis 180:00, ohne Prestige. Ein gemeinsamer Parameter, keine B-Sonderkurve. A-Ziel erfüllt; B erreicht ≥3 INT 46 Sekunden früher. Kein verfehltes neues A-Ziel, aber keine Verallgemeinerung auf menschliche Strategien. Der neue Parameter verändert **ohne Reset** keine Hardware-/Produktionsentscheidungen; der gebuchte 60-Minuten-Umsatz bleibt identisch. Die früheren 8B-Hardwarezeitpunkte bleiben No-Prestige-Messungen.

## Tatsächlicher regulärer Reset und bezahlter Neustart

Ein zusätzlicher frischer A-Lauf wird beim ersten regulären ≥3-INT-Anspruch bei **60:00** mittels `prestige(state)` zurückgesetzt, ohne weiteren Prestige/Axiom-Reset. Echtes Ergebnis:

- genau 3 INT, Prestigezähler +1, neuer Run-Timer 60:00;
- 50 Credits, SCI `{m:5,e:1}`, 0 Hardware aller Klassen, runCreditsEarned=0;
- reguläre Lifetime-Produktion unverändert durch das Startkapital (vor/nach Reset 4.752.471.087,852046 Credits);
- beanspruchter kumulativer Anspruch erhöht; unmittelbar danach 0 neuer INT. Wiederholtes `prestige(reset)` liefert denselben Zustand;
- Einkaufsagent regulär mit `buyNode(...,'shoppingAgent')` bezahlt: **1 INT**, 2 unspent, 3 earned INT;
- verdiente Creditfaktor vor/nach Node-Kauf identisch **1,76246189861594**;
- Taschenrechner-/SBC-Autobuyer über die vorhandenen Toggleaktionen aktiviert, reguläre Reserveeinstellung **25 %**;
- keine Hardwareaktion im Resetzeitpunkt. Erster Kauf erfolgt erst nach zehn Sekunden über den regulären Simulations-Autobuyer. Danach normale Simulation, ein Tap/Sekunde und unveränderte manuelle A-Entscheidungen alle zehn Sekunden.

Der Zusatznachweis endet nach **zehn Minuten im neuen Run**, absolute Zeit 70:00. Er ist ein aktiver Neustartnachweis mit Automation und Profil-A-Käufen, kein Nachweis für eine komplett tapfreie Folgestrategie.

| Ereignis | Erster Run | Neuer Run seit Reset | Tatsächliche Quelle im neuen Run |
|---|---|---|---|
| erster Taschenrechner | 0:00 | **0:10** | regulärer Autobuyer, bezahlt 15 Credits |
| Taschenrechner 10 | 1:30 | **0:50** | Profil-A-Domainkauf; vorher zusätzlich reguläre Autobuyer |
| erster SBC | 3:30 | **1:10** | regulärer Autobuyer, bezahlt 6.000 Credits |
| SBC 10 | 8:20 | **2:40** | Profil-A-Domainkauf, echter 10er-Meilenstein |
| erster PC | 13:10 | **4:10** | Profil-A-Domainkauf, bezahlt 100.000 Credits |
| PC 10 | 18:30 | **8:40** | Profil-A-Domainkauf, echter Meilenstein |

Erster Taschenrechner: Guthaben 59,54→44,54; Kosten 15. Erster SBC: 9.735,163723524132→3.735,163723524133; Kosten 6.000. Eventkosten wissenschaftlich gespeichert; kleine Abweichungen entsprechen der dokumentierten Floating-Point-Präzision. Keine vorgekaufte Hardware, kostenlose Preisreduktion oder zusätzliche Ressourcenvergabe.

Der neue Run ist schneller durch die **bestehenden** verdienten INT-, Mastery-/Discovery- und erhaltenen Forschungs-/Resetwirkungen sowie reguläre Automation. Datenerzeugung 2 stammt ausschließlich aus dem ersten echten Run, alle anderen Forschungsstufen bleiben 0. Mastery/Inventar/temporäre Resetwirkungen werden nach dem bestehenden Resetvertrag erhalten; hier nicht neu kalibriert oder durch vorbereitete Hochlevel-Forschung ergänzt. Die First-Buy-Events geben tatsächliche aktuelle Compute-/Creditraten und gezahlte Preise an. Mehr Käufe pro Zehnsekundenentscheidung durch den bereits bestehenden Autobuyer plus manuelle A-Aktion sind ausdrücklich Bestandteil dieses Neustartvergleichs.

## Reproduktion, Budget und technische Grenzen

`Node 22; npx vite-node --script scripts/first-prestige-calibration.ts output.json` führt eine deterministische Ableitung aus dem aktuellen zentralen Ausgangsparameter und die A/B-/Reset-Prüfung aus. Historischer alter Parameter steht im erhaltenen Rohbericht. `--restart-only` ergänzt einen bestehenden Bericht nur bei exakt identischem gemessenem und zentralem neuen Parameter; kein neuer Suchparameter. Kumuliertes 300-s-Budget in ignoriertem node_modules/.cache/first-prestige-budget.json, jede Schleife kontrolliert es. Kein Parametersuchlauf.

[Messbericht](first-prestige/calibration.json), [Budgetprotokoll](first-prestige/runtime-budget.json). Erste Durchführung 30,46 s, zusätzlicher kurzer identischer Resetnachweis etwa 3,63 s, **34,09 s gesamte Mess-Rechenzeit**, unter fünf Minuten. A/B-No-Prestige jeweils maximal 180 simulierte Minuten; finaler Resetlauf 60+10 Minuten. Der erste Kontrolllauf hatte den Resetfortschritt zunächst bis 180 Minuten beobachtet; auch diese Laufzeit ist vollständig im Budget enthalten, der finale kurze Bericht enthält nur 70 Minuten. Keine 7-/30-/60-Tage-Kampagne, kein FAST/DEEP, keine Gesamtsuite.

Gezielte Tests prüfen echten gebuchten gewichteten Umsatz (Faktor zum Buchungszeitpunkt, keine rückwirkende Neubewertung), Ausschluss initialer/reset/reward Credits, kumulativen Anspruch minus bereits beanspruchten INT, genau einmaligen Reset einschließlich Reload, tatsächlich bezahlten Einkaufsagenten und unveränderten verdienten INT-Creditbonus, SCI-Ansprüche >1e308. Der frühere Prestige-Kalibrierungstest für eine andere 45-Minuten-Vergleichsstrategie folgt nun dem ausdrücklich neuen ≥3-INT/60-Minuten-Vertrag und führt **das echte gemeinsame frische 8B-Profil A** bis 60:00 aus; keine Assertions deaktiviert, keine fachfremden Forschungsreferenzen geändert.

Typecheck, gezielte Tests, Build und Diffprüfung werden mit tatsächlichem finalen Ergebnis ergänzt. Bekannte Schicht-3-Referenzabweichungen, Relay-/Archiv-Skalierung und optionale Langzeit-/Axiombalance bleiben offen. Zielerfüllung im deterministischen aktiven Profil ist keine bestätigte Langzeit-, Axiom- oder durchschnittliche Human-Balance. Commit `[skip ci]` verhindert die beauftragten Grenzen überschreitende pauschale CI-Gesamtsuite.

Technische Abnahme des finalen Implementierungsstands: **7 Testdateien / 91 Tests bestanden**, 13,91 s (firstPrestige8c, prestigeCurve, prestigeBonusCurve, prestigePreview, scientificNumber, runStart, hardware8b), Timeout 120 s/maxWorkers=1. Typecheck bestanden; Production-Build bestanden (2,21 s), bekannte Vite-Hauptchunkgrößenwarnung 653,38 kB bleibt; git diff --check sauber. Keine Gesamtsuite oder bestätigte Gesamt-/Langzeitbalance.
