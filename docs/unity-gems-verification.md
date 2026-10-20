# Gem-Angebote / Gumball · Prüfnachweis 20.10.2026

Teilabschnitt 5c, Unity 6000.3.26f1, Branch `codex/unity-rewrite`, Saveformat 13. Keine vollständige Rewrite-, Geräte-, Kauf- oder Releaseabnahme.

- 315 tatsächlich ausgeführte TS-/C#-Transaktionen in 47 Szenarien, alle 17 Angebote. Enthalten: Sperren, Kosten, sechs tatsächliche Labore, Bonusablauf/-limit, Offlinekapazität, Challengepause, Trainingsqueue, Modulabschluss, RNG-Grenzen/-fehler, zugängliche Pools, hohe Produktion, deterministische Folgeziehungen und Videolimit-/Wiederholungsfälle. Exporte reproduzierbar.
- Vollständiger EditMode-Lauf nach Korrekturen: **65/65**, Exit 0, `/tmp/unity-gems-edit-final.xml`. Vorheriger Lauf 63/65 deckte einen Daten-Lifetimeverbraucher und den unaufgezeichneten Videotag alter Challenge-Fixtures auf; beides korrigiert. Gezielter Zwischenlauf 6/6. Kein Fehler verschwiegen oder durch geänderte Preise umgangen.
- Natürlicher Erstprestige-Regressionslauf erneut erfolgreich: 2.378 simulierte Sekunden, 14.532 echte bezahlte/Tap-/Zeitaktionen, keine finanzierten Vorräte. Dies prüft den bestehenden frühen Lauf, keinen natürlichen Erwerb aller Shopangebote.
- Vollständiger PlayMode-Lauf: **39/39**, Exit 0, `/tmp/unity-gems-play.xml`, `--burst-force-sync-compilation`. Echte UI-Käufe, alte doppelte Callbackereignisse, dauerhaftes Speichern, nicht verfügbarer Videoprovider ohne Quote-/Walletänderung sowie Rollback bei beschädigter Originaldatei.
- Typecheck, `npm run unity:check`, **1.876 Vitest-Tests in 138 Dateien** und `npm run build`: Exit 0. Beim Worker-Test trat im eingeschränkten Prozess eine Vite-HMR-Portwarnung `EPERM` auf; der Worker-Test und die gesamte Suite bestanden. Bekannte Hauptbundlewarnung über 500 kB bleibt offen.
- Assets mit `.meta` gepaart, kein TypeScript-Spielcode geändert, kein verschachteltes Repository, keine SDKs.

Vorbereitete Teststände verwenden ausdrücklich technische Gem-/Daten-/F01-/Prestigevorräte. Hohe Produktionsreferenzen kaufen Hardware über echte Quellfunktionen mit vorbereitetem Budget. Simulierte erfolgreiche Videoergebnisse bleiben Testeingaben; die Runtime bietet keine solche Erfolgsquelle.

Zusätzliche Save-Abnahme: **4/4**, Exit 0, `/tmp/unity-gems-save-final.xml`, einschließlich Challenge-Hauptspiel über Reload, pausiertem Laborbonus und fehlendem aktuellem Hauptspielmarker. Abschließende UI-Abnahme: **3/3**, Exit 0, `/tmp/unity-gems-play-final.xml`. Die echten Renderbilder für 320/390/430 px wurden visuell geprüft; der Ergebnisbeleg steht für Lesbarkeit nun unmittelbar über dem Ziehungsbutton. [320-px-Ergebnis](screenshots/unity-gems-funded-result-320.png), [390-px-Zeitangebote](screenshots/unity-gems-funded-time-390.png). Die Speicher-Rohschemavalidierung und Legacy-/Webübernahme bleiben Abschnitt 8. Keine echte Geräte-/Notch-/Touch-/Playerexportabnahme aus Editorbildern ableiten.

Separater Import/Compile nach letztem C#-Stand: Exit 0, `/tmp/unity-gems-compile.log`, `Exiting batchmode successfully now!`; keine C#-Compilefehler. Vor jedem Batch war kein Projekt-Editorprozess aktiv. Kein Playerexport oder Gerätetest in diesem Teilabschnitt.
