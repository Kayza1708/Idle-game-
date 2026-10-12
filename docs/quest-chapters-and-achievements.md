# Wochen-/Monatskapitel und Achievement-Produktion

Stand: Main nach PR #91, plus dieses Umsetzungspaket. Implementierte Mechanik und kurze Gegenmessung; keine nachgewiesene Wochen-/Monatskalibrierung.

## Problem und Entscheidung

Die vorige Messung zeigte zwölf fertige Wochenziele und acht bis zehn fertige Monatsziele nach zwei Stunden kontinuierlichen Spiels. Wiederholte Credit-/Dataziele verwendeten denselben Fortschritt mehrfach. Achievement-Punkte verstärkten die Produktion exponentiell zusätzlich zu ihrem bereits begrenzten Forschungsbonus.

Dieses Paket verbindet die längeren Questperioden mit konkreten Infrastrukturwänden, zählt wiederholte Arbeit in getrennten Abschnitten und macht die Punktwirkung logarithmisch. Hardwarekäufe brauchen weiterhin ausschließlich Credits. Quests führen keine Kaufvoraussetzungen, Ressourcen, Pflichtresets oder zusätzlichen Menüs ein.

## Questvertrag

### Freischaltung und Ziele

Normale Konten behalten sechs Tages-, zwölf Wochen- und dreißig Monatsaufgaben; Bonusanforderungen vier/acht/zwanzig. Bestehende Bauplan-, Schmiede- und Challengevorlagen behalten ihre Zugangsvoraussetzungen. Neue optionale Infrastrukturziele verlangen die erstmalige tatsächliche Entdeckung einer bestimmten Hardwareklasse, belegt durch `lifetime.hardwareClasses` aus dem bestehenden bezahlten Kaufpfad.

Wochenfrontiers wählen jede vierte, Monatsfrontiers jede zweite noch nicht entdeckte Klasse, jeweils ohne Taschenrechner. Vom leeren Startkonto aus sind das wöchentlich Rig/Cloud/Lunar und monatlich PC/Rig/Farm/Cloud/Subsea/Lunar/Matrioshka. Es werden keine bereits entdeckten Klassen erneut belohnt. Ein günstiger Wiederkauf nach Prestige erfüllt kein neues Frontierziel. Die Ziele sind optional: ihre Anzahl darf die Plätze über der Bonusanforderung nicht überschreiten. Auch Bauplan-/Schmiede-/Challengeziele teilen dieses optionale Budget.

Diese Klassen sind ein Fortschrittsplan für spätere Wände, keine Behauptung, dass jede im jeweiligen Zeitraum natürlich erreichbar ist. Besonders die späten Frontiers müssen über reale Mid-/Late-Spielstände geprüft werden.

### Mathematische Wirkung

Alle aktuellen Balancewerte stehen in `src/economy.ts`:

- Tagesband = heutiges Entdeckungsband.
- Wochenband = mindestens Band zwei, ansonsten heutiges Band + eins, höchstens Band fünf.
- Monatsband = mindestens Band zwei, ansonsten heutiges Band + zwei, höchstens Band fünf.
- Bandmultiplikatoren bleiben 1/2/4/8/16/32. Damit erzeugt ein neuer Account längere Perioden nicht mehr ausschließlich im billigsten Startband.
- Auch Produktionsbasisziele verwenden den Bandmultiplikator. Das bisherige Minimum aus regulärer momentaner Produktionsrate × 2/14/60 Stunden bleibt; temporäre Boosts bleiben ausgeschlossen.
- **Pro Periode höchstens ein Credit- und ein Dataziel.** Keine vier Auszahlungen allein durch dieselbe steigende Produktion.
- Wiederholte nicht endliche Wochen-/Monatsvorlagen zählen getrennte Arbeitsabschnitte. Für Ziele `g1,g2,g3` lauten Baselines `B, B+g1, B+g1+g2`. Erst `g1+g2` zusätzliche echte Aktionen erfüllen beide ersten Aufgaben. Mengenwachstum je Folgestufe bleibt ×2. Tagesziele behalten ihren bisherigen Baselinevertrag.
- Endliche Objectives bleiben eigene Domainnachweise; ihr Fortschritt fließt nicht in den Abschnittsoffset eines nur zufällig gleich benannten numerischen Metrics ein.

Beispiel neuer Startmonat: Trainingsabschnitte 160, 320, 640 mit Baselines 0, 160, 480. Nach 160 Trainings ist nur der erste fertig. Das verdeutlicht den Grind und ist noch keine bewiesene Monats-ETA.

Die Mengen liegen beim Erzeugen fest. Wachsende Leistung erleichtert den Abschluss; Prestige kann ihn vorübergehend verlangsamen. Es gibt kein nachträgliches Hochsetzen laufender Aufgaben. Dreißig Monatsplätze sind weiterhin teilweise gestufte Arbeit innerhalb bestehender Mechaniken, nicht dreißig erfundene unabhängige Systeme. Bei vollständig gesättigten künstlichen Zählerständen verhindert ein begrenzter Generatorlauf Null-Ziele und leere Bonusauszahlungen.

### Kosten, Rewards und Automation

Quests selbst reservieren keine Credits/Materialien. Kosten entstehen ausschließlich durch die normalen Käufe, bezahlten Jobs und Handlungen. Mengen, Quellen und Budgets der Gems, Materialpakete und Season-XP werden nicht pauschal erhöht oder gesenkt. Unterschiedlich ist, wie schnell und durch welche Fortschritte sie verdient werden. Die maximalen normalen Perioden-Gembudgets mit Bonus bleiben 18/90/570.

Vorhandene Quest-Claim-Automation, Autobuyer, Forschungs-/Trainingsautomation und Offline-Simulation zählen über dieselben Domainnachweise. Jede Aufgabe und jeder Bonus ist weiterhin einmal beanspruchbar. Erste Hardwareentdeckung kann gleichzeitig einen passenden Wochen- und Monatsauftrag erfüllen; das sind unabhängige Periodenbudgets, keine mehrfach wiederholbare Erstabschlussbelohnung.

## Achievement-Produktion

Vorher: `1.10^floor(P/25) × 1.25^floor(P/100)`.

Jetzt: `1 + 0.25 × ln(1 + P/100)`.

| Punkte P | Vorher, gleicher Punktestand | Jetzt, gleicher Punktestand |
|---:|---:|---:|
| 0 | ×1 | ×1 |
| 100 | ×1,8301 | ×1,1733 |
| 244 | ×3,6843 | ×1,3089 |
| 1.000 | ca. ×421,5 | ×1,5995 |
| 3.000 | ca. ×74,9 Mio. | ×1,8585 |

Die exakten Gegenquotes stehen in `quest-chapter-profiles.json`. Sie sind ein Vergleich derselben Punkte, kein künstlich als natürlich ausgegebener Spielstand. Jeder weitere Punkt hilft; der Grenznutzen fällt mit `0.25/(100+P)`. Es gibt keinen neuen harten Punktcap. Der bestehende separate Forschungsbonus bleibt bei maximal 20%. Der Produktionsfaktor wirkt weiterhin an seinem bestehenden zentralen Credit-Pfad; keine zusätzliche Verstärkung in mehreren neuen Systemen.

Gems, Claims und Punkte vorhandener Konten bleiben erhalten. **Der daraus berechnete Produktionsmultiplikator wird auch für vorhandene Konten schwächer.** Es wird kein historischer Exponentialfaktor konserviert, der gegenüber neuen Spielern eine dauerhaft dominante Altaccountstrategie erzeugen würde. Historisch gestartete Jobs behalten ihre gespeicherten bezahlten Verträge und Endzeiten.

## Save, Reset, Export und UI

Save v51 ergänzt optional `targetHardware` und das Objective `hardware-class`. Ungültige Klassen, fehlender Target, falscher Metric oder eine andere Goal/Baseline als 1/0 werden abgelehnt; neue Targets sind nicht für andere Objectivearten gültig. v50 wird ohne neue Questerzeugung übernommen. Bereits gespeicherte Ziele, Baselines, Claims, Gems, Punkte und XP werden nicht umgeschrieben.

Neue Questregeln gelten für neue/leere Perioden und den nächsten regulären Periodenwechsel. Ein aktuell laufender alter Monats-/Wochenpool bleibt bis zu seinem Ende bestehen. Die neue Punktkurve gilt dagegen sofort bei der nächsten Produktionsberechnung. Keine Änderung an Prestige-/Axiom-Ressourcenverträgen: Lifetime-Entdeckungen, Questdaten und Claims bleiben bestehen. Challenge-Runs dürfen keine Hauptspielclaims übernehmen; das passive Main bleibt unabhängig.

Die bestehende kompakte Missionsansicht zeigt das konkrete Ziel mit den bereits lokalisierten Hardwareklassennamen in sieben Sprachen. Fortschritt und Claims verwenden die reguläre Anzeige. Diagnoseexport und Save übernehmen `targetHardware` sowie Abschnittsbaselines durch den bestehenden Missionsdatenpfad; keine eigene Automation oder neue Währung.

## Bestätigte kurze Gegenmessung

Acht gematchte natürliche Zweistundenprofile (finaler Lauf 45,32 Sekunden): zwei Seeds, festes Chiploadout mit bisherigem capped Forschungscontroller, 0/1/3 Online-Taps pro Sekunde und zwei kurze Besuche (10+5 Minuten). Echte Claims und bezahlte Jobs, keine Shop/Ad/Season-Track-/Onboardinggrants. Gleiche Policies und Unixzeit-null-Kalenderpool wie die Vorläuferprofile aus PR #91.

| Profil | Fertige Wochenziele vorher → jetzt | Fertige Monatsziele vorher → jetzt | Beanspruchte Season-XP vorher → jetzt |
|---|---:|---:|---:|
| Kontinuierlich, 0 Taps/s | 10 → 4 | 8 → 4 | 13.300 → 5.700 |
| Kontinuierlich, 1 Tap/s | 12 → 6 | 8 → 4 | 14.500 → 6.900 |
| Kontinuierlich, 3 Taps/s | 12 → 6 | 10 → 6 | 16.300 → 8.700 |
| Kurze Besuche, 1 Tap/s | 3 → 2 | 1 → 1 | 2.300 → 1.700 |

In allen acht neuen Profilen kein Wochen-/Monatsbonus. Kontinuierlich sind ein Wochenziel und bei kurzen Besuchen beide Wochenziele erst nach der letzten Entscheidung fertig und noch nicht beansprucht; deshalb unterscheiden sich Fertigstellung und XPbuchung.

Erster tatsächlicher Prestige: tapfreies kontinuierliches Management 67:40, bei einem Tap/s 47:30, bei drei Taps/s 37:20. Kurze Sitzungen weiterhin kein erster INT/Prestige in zwei Stunden. Der Chip bleibt mit einem Tap/s nach 60:10 und mit drei Taps/s nach 58:30 erreichbar. Kurze Besuche behalten sechs Tagesclaims und 169 Gems einschließlich 50 Startgems. Der Tagesabschluss bleibt als Einstiegsmotivation erhalten.

Die Änderungen wirken gleichzeitig auf Quests, Materialpakete, Punktwachstum und dadurch Produktions-/Kauffolgen. Gesamte Run-Unterschiede werden deshalb nicht allein der neuen Kurve zugeschrieben. Bei zwei Seeds ist kein statistischer Dominanz- oder Retentionnachweis möglich.

Eine erste verworfene Variante bot die vier billigsten neuen Klassen als Wochenziele an; sie ersetzten die alten einfachen Produktionsziele und ließen den Wochenbonus weiter binnen zwei Stunden zu. Erst die räumlich weiter verteilten Frontierziele wurden als finale Variante akzeptiert. Die ausgelieferten Rohprofile gehören ausschließlich zum finalen Quellstand.

## Prüfung und nächste Arbeit

Lokale Abnahme: 1.295 Standardtests, App- und strikter CLI-Typecheck, Build und Diffcheck grün. 13 neue Kapitel-/Kurvenverträge; Quellhashes, unverändertes Vorläuferartefakt und vollständige Gem-/Season-XP-Buchungen geprüft. Maximale relative Data-/Tapabweichung 5,04e-15/8,63e-16. Auditbeleg: `quest-chapter-validation.json`.

Neue Verträge prüfen Periodengröße/Produktionsquota, Zukunftsbänder, getrennte Arbeit, reale Hardwarekaufnachweise, Lokalisierung, Reset/Reload, v50-Erhalt, strikte Targetvalidierung und gesättigte Zähler ohne Bonus. Die logarithmische Kurve ist monoton, ohne Punktsprünge, mit fallendem Grenznutzen. Historische Parameterfixtures bleiben unverändert; nur die zwei ausdrücklich entfernten Exponentialparameter sind aus deren Schutzvergleich ausgenommen. Andere Werte bleiben geschützt, neue Kurve und Abwesenheit alter Parameter haben eigene Tests.

Offen: tatsächliche Abschlussquoten nach sieben/30 Tagen, erste Monatsbonus-Erreichbarkeit mit dem eingefrorenen Einstiegspool, später alle 30 Plätze, alternative Kalenderstarts, Mid-/Late-Snapshots, Browser/Geräte. Das Paket belegt geringere frühe Ausschüttung, nicht bereits ideale Wartezeiten.

Nächster abhängiger Block: natürliche passive Rückkehr und zweiten Prestige mit realer Automation erfassen; danach gleichberechtigte breitere Forschungsfreiheit für die Loadouts und erste echte Forschungs-/Fertigungsbuilds. Wochen-/Monatsziele anhand dieser Progression weiter prüfen; keine pauschale Verteuerung sämtlicher Spielpreise.

Reproduktion: `npx vite-node --script scripts/quest-chapter-calibration.ts docs/quest-chapter-profiles.json`. Lauf maximal 120 Sekunden gemeinsam, 30 Sekunden je Profil, Horizont maximal zwei Stunden. Sourcehashes und unverändertes Vorläuferartefakt sind im Rohbericht dokumentiert.
