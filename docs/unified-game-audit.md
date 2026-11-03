# Einheitlicher Unity-Spielstand · 2. November 2026

## Verbindliche Basis

Basis dieses Auftrags ist GitHub-main `ccfb38df` nach PR #176. Der Repository-Root ist das einzige aktive Unity-Projekt (`Assets`, `Packages`, `ProjectSettings`), Unity 6000.3.26f1. Nicht den ehemaligen Unterordner `IdleIntelligence` in Unity Hub öffnen.

Der lokale ältere Branch `codex/mobile-ui-refactor-20261102` und der Stash `3ea0edf6add59881a60b60b7f600d59d8e27b69f` bewahren den früheren, nicht eingecheckten Arbeitsstand. Ignorierte alte Projekt-/Web-/iOS-Reste wurden zusätzlich außerhalb des aktiven Projekts unter `/Users/yannicrogowitz/Idle-game-archive-20261102/local-project-remnants` gesichert. Alte ausführbare Builds liegen separat unter `/Users/yannicrogowitz/Idle-game-archive-20261102/previous-builds`. Der Stash darf nicht pauschal über den aktuellen Unity-only-Stand gelegt werden: Das würde ältere Systeme wieder einmischen.

## GitHub-Abgleich

Alle 176 PRs (#1–#176) wurden nach Status, Beschreibung und Merge-Basis gesichtet; keine offenen PRs am Prüfzeitpunkt. Zusätzlich wurden 130 Remote-Branches zugeordnet: 127 gehören zu vorhandenen PRs; `BACKUP`, `archive/pre-unity-only-cleanup-20261102` und der weitere Speicherfix-Branch sind bereits Vorfahren von main. Die vollständige Zuordnung ist im [GitHub-Inventar](unified-github-inventory.json) festgehalten. Für den aktuellen Stand maßgeblich:

- [#161](https://github.com/Kayza1708/Idle-game-/pull/161): native V3-Erweiterung, 42 Items, Effekte und Migration.
- [#162](https://github.com/Kayza1708/Idle-game-/pull/162): frische V3-Kampagne, 12 Kombinationen, 60 INT-Knoten und 24 Axiome.
- #163–#173: nachfolgende Integrations-, Compiler-, Save- und Testkorrekturen. Diese bleiben Teil der Basis; ältere lokale Implementierungen ersetzen sie nicht.
- [#174](https://github.com/Kayza1708/Idle-game-/pull/174): ein Unity-Projekt direkt im Repository-Root; Web-/Capacitor-Quellen nicht mehr aktive Spielversion.
- [#175](https://github.com/Kayza1708/Idle-game-/pull/175): verbundener Shop, echte Kaufbestätigung und atomare Belege.
- [#176](https://github.com/Kayza1708/Idle-game-/pull/176): UI-Port. Seine Testzahlen stammten ausdrücklich vom früheren lokalen Stand und gelten nicht als Abnahme dieser Basis.

## Tatsächlicher Itemkatalog

`UnityV3Catalog.Extend` bewahrt die 36 bestehenden IDs und ihre Reihenfolge. Deshalb dürfen Starteritems weiterhin bekannte Grafiken haben. Die sechs zusätzlichen Items verwenden `UnityV3PixelArt`; ihre Details kommen aus `UnityV3ItemDetails` und ihre Spielwirkungen aus `ItemSystemV3`.

| Native ID | Name | Zugang | Native Wirkung |
| --- | --- | --- | --- |
| fleet-coordinator | Flottenkoordinator | Campus entdeckt | Compute aus Hardwareklassen mit mindestens 100 Geräten |
| gradient-buffer | Gradientenspeicher | INT T06 | Während Ausrüstung geleistete Trainingsarbeit für einen folgenden bezahlten Start speichern |
| overdrive-capacitor | Overdrive-Kondensator | INT F03 | Overdrive-Ladung nach tatsächlich abgeschlossenem bezahltem Forschungsauftrag, mit Dublettenschutz |
| synthesis-coordinator | Synthesekoordinator | Blaupausenforschung und Materialfamilie | Tatsächliches Synthesetempo statt Preis oder Ausbeute verändern |
| singularity-lens | Singularitätslinse | 3 Axiom-Resets | Compute-Skalierung aus dem laufenden Axiomzyklus |
| axiom-anchor | Axiomanker | 1 Axiom-Reset | Bei echtem Axiomreset zeitlich begrenzten Compute-/Trainingsbonus speichern |

Die native ID lautet `gradient-buffer`, nicht die ältere lokale experimentelle ID `gradient-storage`. Alte Quellordner oder Sprite-Arrays dürfen diese Zuordnung nicht ersetzen.

Neue Kampagnen verwenden `Game.NewV3`. Alte Saves können ihren bisherigen Regelsatz behalten; die bestehende Speicheransicht bietet eine validierte Vorschau und explizite Aktivierung nach separater Originalkopie. Der vorhandene Editor-Save wurde nur lesend geprüft: Version 25, `itemV3Recorded=true`, `itemV3.version=3`. Er wurde für diesen Auftrag nicht zurückgesetzt oder migriert. Prüfungen verwenden isolierte temporäre Saves.

## Darstellung dieses Auftrags

- Vollständige Truhe aus zusammengehörigem Deckel- und Körpersprite, keine abgeschnittene Körperhälfte.
- Rahmenlose Produktgrafiken und Kaufpreis; bezahlte Truhen in zwei Spalten, Tagesangebote seit der Folgekorrektur ebenfalls in zwei Spalten.
- Separate 44-Pixel-Infofläche; Tippen auf die Produktgrafik führt weiterhin durch die echte Preisbestätigung.
- Illustrierte Schmiedestation mit sechs physischen Itemplätzen; geometrische Sockelrahmen und Raster-/Verbindungslinien entfallen dort.
- Kaufregeln, Zufallsverteilung, Freischaltungen, Saveformat und Balance werden nicht verändert.

## Grafikherkunft

`Assets/IdleIntelligence/Resources/Artwork/Forge.png` wurde mit dem integrierten Imagegen-Werkzeug als neue Spielgrafik erstellt. Vorgabe: Pixelart in dunklem Navy, Bronze und Cyan, zentrale KI-Kammer, sechs integrierte seitliche Podeste, keine Schrift, Pfeile oder UI-Karten. Die tatsächlichen Items und Interaktionsflächen werden im Spiel darübergelegt. Die Illustration selbst ist statisch und benötigt keine Bewegung.

## Gesamtabnahme vor der Gem-Nachbesserung

**Abgeschlossen: 242/242 EditMode, 148/148 PlayMode, 16/16 gezielte PlayMode-Nachprüfungen und erfolgreicher macOS-Playerbuild** (250.596.135 Bytes). [Prüfmanifest](unified-game.verification.json), [12 finale Ansichten in DE/EN bei 320/390/430 px](media/unified-v3/). Raw-XML und Logs sowie die gebaute App liegen lokal unter `unity-acceptance/unified-v3-20261102/`. Frühere Screenshots und Testzahlen aus `unity-mobile-ui-refactor.md` sind historische Belege und keine Abnahme dieses Auftrags. Die Unity-only-Basis besitzt keine `package.json`; `npm run typecheck`, `npm test` und `npm run build` wurden ausgeführt und endeten jeweils mit ENOENT für die entfernte `package.json`; sie sind hier nicht anwendbar. Die relevante Abnahme sind native Unity-Kompilierung, EditMode, PlayMode und macOS-Playerbuild. Der zusätzliche dotnet-Runner ist lokal nicht auf PATH verfügbar.


## Noch nicht auf GitHub veröffentlicht

Die automatische Freigabeprüfung hat den kombinierten Commit-/Push-Aufruf wegen der Regel „Keine Veröffentlichung … ohne neuen Auftrag“ abgelehnt. Der Aufruf wurde nicht ausgeführt; es gibt keinen neuen PR für diesen Auftrag. Quellcode, Grafiken, Screenshots und Prüfbelege sind lokal fertig. Für Commit, Push und PR ist eine ausdrückliche neue Benutzerfreigabe erforderlich. Kein Merge und keine Release-Veröffentlichung vorgesehen.

Unity-generierte Shader-Prefilter-, Batching- und Serialisierungsänderungen wurden nach den Läufen separat bei den lokalen Prüfbelegen gesichert und aus dem vorgeschlagenen Quelldiff entfernt. Die getesteten Runtime-Dateien sind per SHA-256 im Prüfmanifest festgehalten.


## Nachtrag: Gem-Grafiken und Shopbreiten

Die Folgekorrektur ersetzt die Text-Rauten bei bezahlten Preisen durch den vorhandenen Gem-Sprite und zeigt ihn auch beim Guthaben sowie den Kauf-/Gumball-Aktionen. Tagesangebote stehen vollständig in zwei Spalten; die Shop-Reiter umbrechen statt seitlich abzuscheiden. Explizite flexible Mindestbreiten erlauben auch das nachträgliche Verkleinern derselben geöffneten Shopseite.

13/13 gezielte PlayMode-Regressionen sind bestanden. Sie prüfen alle fünf zugänglichen Shopbereiche in DE/EN mit derselben Instanz bei 430 → 320 → 390 → 320 px, Preiszeichen, Sprite-Zuweisungen, Kartenränder und echte Kauf-/Save-Flows. Die Aufnahmen mit 9e15 Gems verwenden einen isolierten Stresstest-Spielstand; die Standardaufnahmen mit 50 Gems zeigen den frischen Spielstand. [Aktuelle Shop-Aufnahmen](media/shop-gems-fit/). Das bisherige Gesamtprüfmanifest bleibt als Beleg des vorherigen Stands erhalten; der Folgeauftrag erhält ein eigenes Prüfmanifest.

Die Gem-Nachbesserung hat zusätzlich den aktuellen macOS-Playerbuild erfolgreich bestanden (250.597.159 Bytes). Das [eigene Prüfmanifest](shop-gems-fit.verification.json) hält die aktuellen Quelldatei-Hashes, 13/13 betroffene PlayMode-Prüfungen und die neuen Aufnahmen fest. Kein erneuter GitHub-Upload wurde versucht.


## Nachtrag: Mini-Gumball auf dem Homescreen

Der vorhandene Labor-Shortcut ist jetzt eine kleine freistehende Automatengrafik am rechten unteren Rand des Aktionsbereichs. Die zugehörige 76×44-Preisbox zeigt den bestehenden Preis aus `GemBalance.CapsuleCost` mit dem vorhandenen Gem-Sprite. Ein Tipp auf den Automaten öffnet Gumball im Shop; ein Tipp auf den Preis nutzt direkt `Capsules.Draw` mit dem angezeigten Vorgangsticket, `GameRuntime.Act` und der vorhandenen Belegdarstellung. Die Freischaltung nach dem ersten Prestige, Preise, Zufall und Belohnungsregeln werden nicht verändert.

Der Mini-Automat belegt ein 76×128-Feld, ohne die zentrale Tap-Aktion zu überdecken. Echte Pointer-Prüfungen, zwei direkte Aufrufe im selben Frame, Speicherung und das absichtlich beschädigte Testspeicher-Original sind abgenommen. 13/13 betroffene PlayMode-Tests sind bestanden; acht DE/EN-Aufnahmen decken vier Handygrößen einschließlich 320×568 ab. Alle Präparationen erfolgen in isolierten Testsaves. [Vorschauen](media/home-gumball/).

Der aktuelle macOS-Build mit Homescreen-Automat ist erfolgreich (250.598.183 Bytes). [Prüfmanifest](home-gumball.verification.json) und lokale Rohbelege unter `unity-acceptance/home-gumball-20261102/`.


## Korrektur: nur kleine Verknüpfungen auf dem Homescreen

Die vorherige Mini-Automatenvariante mit Preisbox wurde auf ausdrücklichen Wunsch entfernt. Aktuell gibt es rechts nur ein transparentes 44×52-Touchziel mit einer 30×36-Automatengrafik, das Gumball im Shop öffnet. Es gibt dort keine Preisangabe und keinen Aufruf von `Capsules.Draw`. Links gegenüber führt ein gleich großer Zugang zum bestehenden Werbefrei-Pass. Der Store wird nach Layout und Lokalisierung auf das tatsächliche Werbefrei-Angebot gescrollt. Bereits aktive Werbefrei-Rechte blenden den Kaufzugang aus.

14/14 betroffene PlayMode-Prüfungen sind bestanden. Navigation verändert weder Gems noch Ziehungen und erzeugt keine Kaufrechte. Der vorhandene Echtgeld-Anbieter und die Kaufprüfung bleiben unverfügbar; der Zielscreen zeigt daher keinen erfundenen funktionierenden Checkout. Acht Homescreen-Aufnahmen decken DE/EN und 320×568, 320×694, 390×846, 430×932 ab, plus eine Aufnahme des Werbefrei-Ziels. [Aktuelle Ansichten](media/tiny-home-links/).

Die abschließende Korrektur mit kleinen, preisfreien Rand-Links hat den macOS-Build erfolgreich bestanden (250.599.719 Bytes). [Aktuelles Prüfmanifest](tiny-home-links.verification.json); Rohbelege unter `unity-acceptance/tiny-home-links-20261102/`.


## Gemeinsame Bereinigung aller übrigen Seiten

[Aktueller Seitenbericht](all-pages-cleanup.md) und [Prüfmanifest](all-pages-cleanup.verification.json) dokumentieren die gemeinsame Darstellung, 420 mobile Ansichtsprüfungen, den ausgewerteten Gesamtlauf mit gezielter Fehlernachprüfung und den erfolgreichen aktuellen macOS-Build.

## Gemeinsamer GitHub-Stand · 3. November 2026

Der aktuelle Upload mit Balance, zusätzlichen Gesamtprüfungen und nachkorrigierter Kostenanzeige ist in [GitHub-Status](github-status.md) und [Prüfmanifest](github-upload.verification.json) dokumentiert. Historische Prüfzahlen oben bezeichnen ihre jeweiligen Zwischenstände.
