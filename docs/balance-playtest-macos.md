# Balance-Playtest auf macOS (isolierter Unity-Spielstand)

**Status: optionaler Playtest-Builder im Draft-PR; noch kein lokaler Unity-Build auf einem Mac nachgewiesen.** Der Stand von `main` enthält die normale, spielbare Unity-Logik. Die isolierten V3-Berechnungsverträge sind **keine vollständige V3-Freigabe**: 42er-Itemkatalog, Erwerb, Verbraucher und verlustfreie V3-Dateimigration sind noch nicht abgeschlossen. Der Playtest aktiviert keine teilweise migrierten Regeln und darf nicht als V3-Balanceabnahme interpretiert werden.

## Voraussetzungen

- macOS, Unity Editor **6000.3.26f1** mit macOS-Buildsupport; der Standardpfad ist `/Applications/Unity/Hub/Editor/6000.3.26f1/Unity.app/Contents/MacOS/Unity`.
- Das ganze Repository lokal, einschließlich `IdleIntelligence/`.
- Den **bereits geöffneten Unity Editor regulär schließen**, bevor das Buildskript startet. Keine Unity-Lockdateien löschen.
- Lokale Änderungen vor `git switch`/`git pull` selbst prüfen; kein Skript überschreibt oder setzt das Repository zurück.

Nach Merge des PRs (oder auf dessen Branch):

```bash
cd /pfad/zu/Idle-game-
git status --short --branch
git rev-parse --short HEAD
bash scripts/playtest-macos.sh
```

Wenn Unity in einem anderen Pfad installiert ist:

```bash
UNITY_BIN="/anderer/Pfad/Unity.app/Contents/MacOS/Unity" bash scripts/playtest-macos.sh
```

Nur bauen, nicht automatisch öffnen: `bash scripts/playtest-macos.sh --build-only`.

## Was das Skript macht

1. Prüft macOS, Unity-Binary und laufende Unity-Editor-Prozesse. Bei einem offenen Editor wird **abgebrochen**, nicht gewaltsam geschlossen.
2. Erstellt einen neuen **Development-/StrictMode-macOS-Build** mit den bestehenden Spiel-Scenes und einer eindeutigen Ausgabe unter `IdleIntelligence/Builds/BalancePlaytest-<commit>-<timestamp>.app`.
3. Verwendet während des Builds ausschließlich die Playtest-Identität `IdleIntelligenceBalance / Idle Intelligence Balance Playtest / com.kayza1708.idleintelligence.balanceplaytest`. Dadurch liegt der persistente macOS-Spielstand getrennt vom normalen Unity-Spiel und vom iOS-/Capacitor-Spielstand. Die ursprünglichen Unity-PlayerSettings werden in `finally` wiederhergestellt.
4. Prüft, dass eine `.app` und eine erfolgreiche Buildreport-Datei existieren. Bewahrt Log und Report neben der App auf und öffnet die App, sofern `--build-only` nicht angegeben ist.
5. Nimmt **keine** automatischen Spielstandimporte, Spielstandresets, Git-Resets oder Änderungen an globalen Balancewerten vor.

Hinweis: Ein anderer Buildpfad allein trennt Saves nicht. Die andere macOS-App-Identität ist die relevante Trennung. Laufende `BuildBalancePlaytest`-Anwendung und normale Anwendung sind dennoch nur nach tatsächlichem macOS-Build gegen ihre Laufzeit-Speicherpfade zu vergleichen.

## So messen wir den aktuellen V2-Balancezustand

1. Neuen isolierten Playtest starten, Tutorial regulär spielen und erste Hardware, Training, Forschung, Analyse und Crafting tatsächlich bezahlen. Keine vorbereiteten Teststände, Debug-Grants oder künstlichen Ressourcen.
2. Nach 15, 30, 60 und 120 Minuten die tatsächlichen Käufe, Wartezeiten, nicht finanzierbaren Alternativen, Items und Progressions-Walls notieren. Training/Forschung dürfen auch zwischen Sessions weiterlaufen.
3. Einmal schließen und wieder öffnen; anschließend eine echte Offline-Phase und später mindestens einen tatsächlichen Prestige-Reset prüfen. Keine fremden Saves importieren.
4. Im Spiel `Spielstände und Berichte` → **Balancehistorie exportieren** verwenden. Der zugehörige `balance-*.json`-Export liegt im angezeigten `Exports`-Ordner; `Exportordner öffnen` zeigt den Pfad. Zusätzlich Screenshots von zu schnellen/zu langsamen Upgrades dokumentieren.
5. Getrennt drei Spielstile vergleichen: aktiv (Taps/Käufe), normal (kurze Sessions) und passiv. Wiederhole Messungen vor und nach jeder einzelnen Balanceänderung auf derselben Codebasis. Ohne echte Spieler lassen sich Langzeit-Retention und Schwierigkeit nur vorläufig beurteilen.

## Bestehende automatisierte Checks

```bash
npm ci
npm run typecheck
npm test -- --testTimeout 30000
npm run unity:check
npm run test:campaigns
```

`npm run test:campaigns` startet vorhandene deterministische Simulations-Tests und ist keine native Playerabnahme. In GitHub Actions: **Manual balance campaigns** → **Run workflow** → `FAST` oder `DEEP`; keine automatischen Unity-Builds.

## Abnahmekriterien / noch offen

- [ ] Auf einem Mac mit Unity 6000.3.26f1 kompiliert und gestartet (der PR liefert diesen Nachweis **noch nicht**).
- [ ] Unterschiedliche `Application.persistentDataPath`-Pfade für normalen Unity- und Balance-Playtest-Player bestätigt.
- [ ] Laufender Save → Neustart → gleiche Ausrüstung / Fortschritt; kein Datenverlust.
- [ ] Mindestens 120 Minuten natürlicher Test mit exportierter Balancehistorie; tatsächliche erste Prestige-/Crafting-Wall dokumentiert.
- [ ] Separater iPhone-Simulator-/physischer-Geräte-Test für Touchbedienung, Performance und Layout.
- [ ] Vollständige 42-Item-V3-Migration, Verbraucher, Erwerbswege und Langzeit-Balance **separat** abgeschlossen, bevor V3 in normalen Saves aktiviert wird.

Wichtig: Aus einem bestandenen TypeScript-Test oder einem erfolgreichen Editor-Compile darf kein bereits durchgeführter Player-/iPhone-Test abgeleitet werden.
