# AI Singularity – Phase-1-Alpha

Die Browser-Alpha verbindet einen datengetriebenen Hardwarekatalog, Compute-Profile, Nutzer, Daten, aktives Tappen, Overclock, manuelles Training, frühe Forschung und Items sowie kumulatives Prestige mit dem bestehenden Inventar-, Gem- und Missionssystem.

## Auf einem Mac starten

Node.js 20 LTS und Git installieren, dann in Terminal:

```bash
git clone https://github.com/Kayza1708/Idle-game-.git
cd Idle-game-
git switch feat/core-loop-profiles
npm ci
npm run dev
```

Die angezeigte Adresse (typisch `http://localhost:5173`) öffnen. Für den Production-Build: `npm run build` und danach `npm run preview`; das startbare Ergebnis liegt in `dist/`.

## Phase 1

- 15 vorbereitete Hardwareklassen mit stabilen IDs; der erste Run nutzt die frühen Klassen mit Preisen, Compute, Anteilen, ×1/×10/Max, Meilensteinen und Klassen-Upgrades.
- Ausgewogenes, Trainings- und Entdeckungsprofil teilen Compute sichtbar auf Nutzer, Modelltraining und Forschung auf. Nutzer erzeugen Credits und Daten; Forschung erzeugt Forschungspunkte.
- Zugängliche Laborfläche: Tap und Tastatur, Halten mit drei Impulsen/s, gemeinsames Limit fünf/s, Overclock nach 30 Taps.
- Acht einmalige Aufträge, 60-Sekunden-Einführungsexperiment, garantierter Einstieg-Itemfund sowie kurze und lange Experimente.
- Kumulativer INT-Anspruch aus berechtigtem Lifetime-Umsatz, funktionsorientierte INT-Upgrades und rendite-/zielbasierter Autokauf.
- Save v8 mit verlustfreier Erkenntnis→INT-Migration, Rückzahlung alter Knoten, konservativer Migration übriger Hardware-/Meta-Spielstände und begrenzter lokaler Run-Telemetrie für manuelle Balanceberichte.
- Sechs individuelle Meilensteine je Klasse (90 insgesamt) und ein exponentiell bepreister, funktionsorientierter INT-Baum ohne Spezialisierungsmenü.

Die zentrale Mathematik steht in [`docs/economy.md`](docs/economy.md), tatsächliche Simulationsergebnisse in [`docs/balance-report.md`](docs/balance-report.md), die verbindliche Planung in [`docs/ROADMAP.md`](docs/ROADMAP.md) und die Übergabe in [`docs/NEXT_STEPS.md`](docs/NEXT_STEPS.md).

## Neun einfache manuelle Tests

1. Frischen Spielstand öffnen: Nach höchstens etwa zehn Sekunden muss der erste Taschenrechner bezahlbar sein.
2. Auf die Laborfläche tippen, Enter/Leertaste verwenden und halten; Credits steigen, Overclock lädt höchstens bis 30.
3. Overclock aktivieren und 15 Sekunden lang erhöhte Credit- und Trainingsrate beobachten; Taps selbst bleiben gleich stark.
4. Kaufmodi ×1, ×10 und Max testen. Beim zehnten Taschenrechner muss der Compute springen und der Einplatinencomputer erscheinen.
5. Das 60-Sekunden-Einführungsexperiment abschließen, das garantierte Item im Inventar ausrüsten und die Auftragsbelohnung einmal abholen.
6. 15 Einheiten einer Klasse kaufen, das Klassen-Upgrade erwerben und den verdoppelten Klassen-Compute prüfen.
7. Im Entwicklermenü eine Stunde springen, Prestige durchführen und prüfen, dass reale Sekunden sofort wieder Credits/Training geben.
8. Prestige-Vorschau prüfen und neu starten: INT, Entdeckungen und Items bleiben, Bestände und Run-Upgrades starten neu.
9. Seite neu laden sowie Tab verstecken/öffnen; Timer, Offline-Bericht und Fortschritt dürfen weder stehen bleiben noch doppelt zählen.

## Qualitätschecks

```bash
npm ci
npm run typecheck
npm test
npm run build
```

GitHub Actions führt dieselben Schritte aus. Keine echten Werbe-, Kauf- oder nativen SDKs sind enthalten. Es wird weder automatisch gemergt noch veröffentlicht.
