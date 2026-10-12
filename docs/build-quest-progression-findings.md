# Frühe feste Loadouts, Sitzungen und Questökonomie

Messstand: Main nach PR #90 (`bb06a9a`), plus der unten beschriebene Empty-Period-Fix. 27 natürliche Zwei-Stunden-Profile; Laufzeit 150,41 Sekunden. Rohdaten: `build-quest-progression-profiles.json`, kompakte Ergebnisse: `build-quest-progression-summary.json`. Keine Wochen-/Monatssimulation.

## Was tatsächlich gemessen wurde

Zwei Seeds × vier Eingabemuster × drei Strategien = 24 Profile. Drei weitere Profile vergleichen bei Seed 1708 drei fünfminütige Besuche mit dem bisherigen Muster aus zehn Minuten Einstieg und fünf Minuten Rückkehr. Beide Besuchsmuster haben exakt 900 Online-Sekunden. Kontinuierliche Profile haben 7.200 Online-Sekunden.

- Relais: regulär Relais und Chip herstellen, nach dem Prestige ausschließlich Relais ausrüsten.
- Chip: Relais bis zum tatsächlich hergestellten Chip, danach ausschließlich Chip ausrüsten.
- Forschungsportfolio: gleiche Chippräferenz, nach den Basisschritten zusätzliche zugängliche und bezahlbare Forschung starten. Operations und sieben Repeatables, maximal Level drei. Kein erfundenes Forschungsitem oder kostenloser Zugang.

Alle Profile beginnen mit echten 50 Credits, null Hardware und 50 Gems. Entscheidungen alle zehn Online-Sekunden und bei Rückkehr; Offline keine manuellen Handlungen. Bei Online-Zeit sichtbare Drops einsammeln, auch bei null Taps. Null Taps bedeutet daher **tapfreies kontinuierliches Management**, nicht unbeaufsichtigtes Idle. Keine Shop-/Ad-/Season-Track-/Onboardingbelohnungen, vorbereiteten Ressourcen, Items oder Freischaltungen. Ein Prestige ab drei claimbaren INT zwischen Analysen; keine weiteren Resets. Hardware-/Trainings-/Crafting-/Nodepolitik ansonsten identisch.

Rewards werden nur bei echten Online-Entscheidungen über die Domain beansprucht. Offline erreichte Ziele bleiben bis zur Rückkehr unbeansprucht. Milestone-/Readinessauflösung bis zehn Sekunden; Handlungszeitpunkte exakt. Der gemeinsame Calendarstart ist Unixzeit null: Ein bestimmter rotierender Questpool, keine Stichprobe aller Kalenderstarts. Identische Seeds bedeuten nach auseinanderlaufenden Entscheidungen keine identischen RNG-Drawstreams.

## Bestätigte Ergebnisse

| Eingabemuster | Erster claimbarer INT | Erster tatsächlicher Prestige | Gems nach 2h einschließlich 50 Startgems | Season-XP |
|---|---|---|---:|---:|
| Kontinuierlich, 0 Taps/s | 38:50–42:00 | 57:40 | 467–483 | 13.300 |
| Kontinuierlich, 1 Tap/s | 29:30–30:40 | 37:30 | 513–527 | 14.500 |
| Kontinuierlich, 3 Taps/s | 19:40 | 27:10 | 551–571 | 16.300 |
| Besuche 10+5 Minuten, 1 Tap/s | Nicht innerhalb 2h | Nicht innerhalb 2h | 169 | 2.300 |
| Drei Besuche à 5 Minuten, 1 Tap/s, ein Seed | Nicht innerhalb 2h | Nicht innerhalb 2h | 161 | 2.300 |

Die Besuchsprofile erreichen keine benutzbare Prozessorausrüstung innerhalb des Horizonts. Die drei Strategien sind dort noch identisch hinsichtlich Loadout und breiter Forschung. Das ist **kein Buildgleichgewicht**, sondern fehlender Zugang. Relais wird bei 10+5 Minuten erst bei 65:00 fertig; danach gibt es keinen weiteren Besuch zum Ausrüsten, und ohnehin noch keinen Prestige-Slot.

Kontinuierlich mit einem Tap/s: Chip nach 60:10/60:20, erster Server je Strategie/Seed nach 70:40–73:20. Zusätzliche Forschung schließt insgesamt sechs statt vier Forschungsjobs ab; bei null Taps sieben. Mehr Forschung beschleunigt späteren Fortschritt, verbraucht aber die Dataüberschüsse in diesen begrenzten Portfolios nicht.

### Loadoutvergleich

Nach dem einzigen Prestige ist am Ende weiterer INT claimbar, aber im Controller **noch nicht beansprucht**:

| Taps/s | Relais: claimbarer weiterer INT | Chip: claimbarer weiterer INT | Chip + breitere Forschung |
|---|---:|---:|---:|
| 0 | 59–63 | 85–100 | 175–178 |
| 1 | 778–785 | 809–835 | 990–1.060 |
| 3 | 2.004–2.018 | 1.923–1.967 | 2.348–2.402 |

Ohne Taps gewinnt der Chip klar gegen das Relais. Bei einem Tap/s liegt er in beiden Seeds leicht vorne; bei drei Taps/s liegt das Relais in beiden Seeds vorne. Beim Relais stammen rund 26,6–26,9% seiner gesamten Tap-Credits aus echten Bursts. Diese Beträge sind in der Creditbuchung enthalten; kein Vergleich allein anhand des normalen Tapquotes.

Der dritte Controller ist ein **Forschungs-Sink-Diagnosetest**, noch kein fairer dritter spezialisierter Build: Die beiden anderen stoppen ihr Forschungsportfolio künstlich früher. Dass zusätzlicher bezahlbarer Forschungseinsatz hilft, belegt keinen notwendigen Nachteil dieser Strategie. Auch das Relais könnte dieses Portfolio nutzen. Für drei reale Midgame-Builds fehlen hier zweite Resets, weiter erschlossene Ausrüstungsslots, tatsächliche Forschungsitems und konkurrierende Ausgaben.

### Quests und Season

- Kontinuierlich bei einem/drei Taps/s sind nach zwei Stunden alle zwölf Wochenziele fertig; elf wurden beansprucht. Das letzte erreicht die Bedingung erst nach der letzten Online-Entscheidung. Wochenbonus schon nach rund 35–59 Minuten.
- Monatsziele: acht von dreißig bei null/einem Tap/s, zehn bei drei Taps/s. Kein Monatsbonus. Acht frühe Abschlüsse sind vier Credit- und vier Dataziele; bei drei Taps/s kommen zwei Overclockziele hinzu.
- Kurze Besuche: sechs Tagesziele beansprucht, drei Wochenziele beansprucht, ein Monatsziel erst offline fertig und noch unbeansprucht. Kein Wochen-/Monatsbonus.
- Tagesbonus nach 4:00–4:10 mit Taps, nach 10:00 ohne Taps. Als Einstiegserfolg vertretbar; kein Beleg für ausreichende tägliche Herausforderung später.
- 13.300–16.300 Season-XP entsprechen 26,6–32,6% des 50.000-XP-Tracks schon in diesem aktiven Zweistundenfenster. Nicht linear auf Folgetage hochrechnen: Monatsquests sind endlich und viele Einmal-Erfolge frontgeladen.

Damit sind Wochen-/Monatsproduktion und Season-Fortschritt weiterhin zu frontgeladen gegenüber dem gewünschten Langzeitgefühl. Die neue bandabhängige Questgeneration hilft **zukünftigen** Perioden; der erste Monats-/Wochenpool wird noch im Startband erzeugt und bleibt danach bewusst unverändert. Vier ähnliche Produktionsstufen belohnen dieselbe stark steigende Produktion mehrfach.

### Achievement-Rückkopplung

Kontinuierlich sind 208–268 Achievement-Punkte nach zwei Stunden vorhanden; kurze Besuche 78–86. Der existierende Produktionsfaktor beträgt

`1.10^floor(Punkte/25) × 1.25^floor(Punkte/100)`.

Bei 244 Punkten sind das ungefähr ×3,68. Das ist ein anderer Effekt als der separat auf 20% begrenzte Forschungsbonus. Neue Claims sind daher nicht nur Gems, sondern wirklicher Produktionsfortschritt. Alte no-claim Profile sind kein kontrollierter Vorher-/Nachher-Vergleich für diesen Faktor: Claims vergeben zugleich Materialien, schaffen neue Ziele und verändern RNG-/Aktionsfolgen. Keine einzelne Mechanik bekommt deshalb pauschal die gesamte Beschleunigung zugeschrieben.

## Bestätigter Bug und Korrektur

`claimMissionBonus(newGame(...), kind)` konnte für eine uninitialisierte leere Periode (`required=0`) Season-XP vergeben. Die erste Vorprüfung wurde verworfen. Die Domain weist nun leere Perioden und Bonusanforderungen von null zurück. Der Messcontroller initialisiert außerdem normale Questperioden vor ersten Claims. Die akzeptierten 27 Profile verwenden beide Korrekturen; es gibt keinen Gratisbonus bei Zeit null. Bereits vorhandenes XP wird nicht nachträglich entzogen. Saveformat und Balancewerte bleiben unverändert.

## Nächste abhängige Entscheidung

1. **Wochen-/Monatsstruktur vor Zahlennerfs:** im Pool weniger duplizierte Produktionsziele, mehr Fortschrittskapitel. Für neue frühe Wochen-/Monatsperioden ein konservatives höheres Zielband als das Startband prüfen; vorhandene Perioden erhalten. Ziele bleiben bei Erzeugung fix. Zunächst alternative Generatoren auf denselben begrenzten Profilen prüfen, ohne Rewards mehrfach zu buchen.
2. **Achievementwirkung getrennt messen:** gleicher Controller mit echten Claim-Modi, getrennt protokolliertem Produktionsfaktor und echten Materialgrants. Erst danach über abflachende Wirkung oder Bonusbudget entscheiden; bereits ausgezahlte Gems/Claims erhalten. Bloß größere Ziele lösen den bestehenden Punktmultiplikator nicht vollständig.
3. **Passive Rückkehr und echte dritte Rolle:** zwei bis drei zusätzliche, weiterhin kurze Sitzungsprofile bis zum tatsächlichen zweiten Besuch nach dem ersten INT; gleiche frei investierbare Forschung für Relais/Chip. Erst dann drei reale Ausrüstungs-/Forschungs-/Prestige-Builds entwickeln und testen. Keine kostenlosen Items, kein pauschal früherer Prestige.

Zielannahmen für diese nächste Kalibrierung müssen ausdrücklich festgelegt werden: Tagesbonus erreichbar bei wenigen Besuchen; Wochenbonus mehrere Spieltage; Monatserfolge verteilt statt viele numerische Kopien. Diese Zeitziele sind Vorschläge, keine bereits bewiesenen ETAs. Keine Spielpreise oder XPwerte werden in diesem Messpaket vorsorglich geändert.

## Verifikation und Grenzen

27/27 Profile: Reload unverändert, keine manuellen Handlungen außerhalb der Sitzungen, reine Relaisbelegung bzw. kein Rückwechsel nach Chip, tatsächlich bezahltes Lernen/Crafting/Forschung. Maximale relative Data-Abweichung 1,42e-14; Tapquote inklusive Bursts gegen echte Creditbuchung 2,73e-15. Quellhashes der Rohprofile gegen den ausgelieferten Domain-/Controllerstand geprüft. Lokale Abnahme: 1.282 Standardtests, App- und strikter CLI-Typecheck, Build und Diffcheck grün. Gem-Ledger und Season-XP vollständig aus den tatsächlichen Claims abgeglichen. Acht neue Standardtests decken Tapkadenz, krumme Sitzungsgrenzen, Reward-Doppelclaim, Reproduzierbarkeit, alte Defaults und leere Bonusperioden ab.

Nicht geprüft: Browser/Geräte, menschliche Entscheidungen/Retention, realer Gem-Shop-Einsatz, alle Kalenderstarts, natürliche Forge-/Challenge-/Monatsprogression. Zwei Seeds sind keine Dropwahrscheinlichkeits- oder Dominanzstatistik.

Reproduktion:

```sh
npx vite-node --script scripts/build-quest-progression-study.ts docs/build-quest-progression-profiles.json
npx vite-node --script scripts/summarize-build-quest-study.ts docs/build-quest-progression-profiles.json docs/build-quest-progression-summary.json
```

Die Zusammenfassung prüft Quellhashes, Claim-XP, Gem-Ledger und Belegungs-/Sitzungsinvarianten. Der Messlauf hat ein gemeinsames 180-Sekunden- und je Profil ein 30-Sekunden-Wallclockbudget; bei Überschreitung keine unvollständige akzeptierte Ausgabe.
