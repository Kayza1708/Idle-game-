# Lokaler Unity-iOS-Weg

## Aktuell: aufgeräumte Hauptansichten und Mira · 26.10.2026

Installierter und gestarteter Spielcode **7e9a080765ee2ed7f98654734b0a58195fefb716**, iPhone16Pro-Simulator/iOS27.0, Unity6000.3.26f1/IL2CPP/ARM64. Separater Export/Xcode-Build `Builds/iOS-Clean-7e9a0807/` erfolgreich, fünf Projekteinstellungen restauriert.22Unity-/15Capacitor-Originale erhalten; normaler Save23 gültig/`prepared=false`, Identität/Inventar/Ausrüstung erhalten. Native Laboraufnahme mit vollständigem Mira-Hinweis, kompakter goldener Trainingstaste und Safe Area selbst angesehen.111PlayMode/142EditMode/1937Vitest sowie beide Code-CI-Prüfungen grün. [Bilder, Abnahme und verbleibende optische Punkte](unity-clean-ui.md). Kein physischer Geräte- oder60fps-Nachweis, nicht veröffentlicht.


## Vorheriger Stand: Drohnenlieferung · 26.10.2026

Installierter und gestarteter Unity-Spielcode **5f8e647bac9e9589e932840a87a8e26caf1c2e00**, iPhone16Pro-Simulator/iOS27.0, Unity6000.3.26f1/IL2CPP/ARM64. Export und Xcode-Build erfolgreich, separater Ordner `Builds/iOS-Drone-5f8e647b/`; fünf Originaleinstellungen restauriert.20Unity-/15Capacitor-Originale bei Installation erhalten, normaler Save23 gültig und `prepared=false`; Capacitor danach weiter bytegleich. Tatsächliches natives Bild einschließlich natürlich erschienener Drohne mit Paket angesehen. [Prüfbericht, Clip und Grenzen](unity-drone-delivery.md). Kein physischer iPhone- oder60fps-Nachweis, keine Veröffentlichung.


Aktueller tatsächlich installierter/gestarteter Unity-Spielcode seit26.10.2026: **48dd4756**, iPhone16Pro-Simulator/iOS27/ARM64. Separater Export `Builds/iOS-Navigation-48dd4756/`, erfolgreicher Unity-/Xcode-Build,19Unity-/15Capacitor-Originale bytegenau erhalten; normaler Save23 gültig und unfinanziert. Beide Code-CI-Prüfungen grün. [Aktueller UI-/Native-Prüfbericht](unity-navigation-forge.md). Ältere Commitangaben unten sind historische Prüfstände.

## Ziel und Schutz bestehender Daten

Device Hub zeigt **iPhone 16 Pro · iOS 27.0 · Simulator**. `devicectl` bestätigt `Reality: simulated`, UDID `2F5C4B2F-A725-45B9-881D-16DA5BD50057`. Ein physisches iPhone wurde nicht erkannt. Daher ist dies Simulatorprüfung, keine Geräteabnahme.

Unity 6000.3.26f1, iOS Build Support und Xcode 27.0 (27A266a) sind installiert. Der Simulator ist ARM64 auf Apple Silicon. Export über `IdleIntelligence.Editor.BuildIOSPlayer.BuildSimulator`, Ausgabe in jeweils neuem `IdleIntelligence/Builds/iOS-Simulator-…/`. Vorhandene Exporte werden abgewiesen. Buildparameter werden anschließend wiederhergestellt.

Die neue App heißt **Idle Intelligence Unity**, Kennung `com.kayza1708.idleintelligence.unity`. Die alte Capacitor-App `com.kayza1708.aisingularity`, deren Datencontainer sowie das unversionierte Repositoryverzeichnis `ios/` bleiben unverändert. Keine automatische Saveübernahme; ein neuer Unity-Simulatorstand beginnt separat. Vorhandene Desktop-Unity-Saves werden nicht in den Simulator kopiert.

Simulatorbuilds benötigen kein Entwicklerteam oder Store-Provisioning. Ein späterer echter Gerätebuild braucht einen tatsächlich verbundenen, vertrauten und für Entwicklung freigegebenen iPhone-Eintrag sowie gültiges Signing; diese Abnahme erfolgt gesondert.

## Audio

Fünf eigene, deterministisch synthetisierte PCM-WAVs (44,1 kHz, mono): `forge-impact`, `fusion-impact`, `purchase-confirm`, `gumball-turn`, `gumball-open`. Ursprung: `tools/audio/generate-unity-feedback.py`; keine fremden Samples oder zusätzlichen Lizenzpflichten. Bestehende Musik/Originalsounds bleiben erhalten. Schmiedesound am gespeicherten Ergebnis-Einschlag; Gumball mechanischer Auftakt und Ergebnisöffnung getrennt; Kaufbestätigung nur auf bestehendem Erfolgspfad. Stummschaltung, Lautstärke, Hintergrundpause und begrenzte Stimmen weiter gültig. Keine Ressourcenzuteilung aus Audio.

## Company/Profil

Company-Zugangstext und Datenschutz-/Serverhinweise wachsen mit Textbreite statt fester abgeschnittener Höhe. Profilnavigation nutzt zwei kompakte gemeinsame Buttonzeilen; alle bisherigen Aktionen und IDs bleiben erhalten. Company ist weiterhin ein vorbereiteter Onlineclient ohne eingerichteten Produktionsserver bzw. vertrauenswürdige Kontoverknüpfung. Die lokale Abzeichensammlung ist keine serververifizierte Company-Auszeichnung.

## Migrationsbewertung

Die historischen 26 breiten funktionalen Migrationszeilen haben dokumentierte C#-Verbraucher und Testnachweise; das bedeutet nicht vollständige native/Onlineparität. Neue Company-/Handelsfunktionen sind noch nicht produktiv online abgenommen. Echte Ads/IAP, native Dokumentfreigabe/Haptik und Geräte-/Releaseprüfung bleiben separat. Dokumentierte Quellprobleme (insbesondere Erkenntnisarchiv) und bewusst abgewiesene nicht unterstützte Webimportverträge bleiben bestehen. Siehe `unity-functional-audit.md` und `unity-functional-remaining.md`. Keine pauschale Fertigmeldung.

## Tatsächliches Ergebnis

Erfolgreich nativ exportiert, mit Xcode gebaut, installiert und gestartet: **a5a59bdd0182de426bd64f0aadfaea913a662931**. Unity 6000.3.26f1, iOS Simulator ARM64, iPhone 16 Pro / iOS 27.0. Das installierte App-`Info.plist` enthält `IdleUnityCommit` mit genau diesem Commit sowie `CFBundleSupportedPlatforms = iPhoneSimulator`. Kein Web-Build. Der spätere Dokumentationscommit ist kein anderer installierter Spielcode.

Finales Projekt: `IdleIntelligence/Builds/iOS-Simulator-a5a59bdd-20261023/Unity-iPhone.xcodeproj`. Fertige App: `DerivedData/Build/Products/Debug-iphonesimulator/IdleIntelligenceUnity.app` darunter. Beide Exporte bleiben lokal erhalten; der erste `eb251e84`-Export wurde nicht überschrieben. Unity-Exporte und Xcode-Builds endeten mit Exitcode 0 / Succeeded, letztere mit vorhandenen Unity-/SDK-Warnungen.

Der Simulator wurde zwischenzeitlich heruntergefahren; der erste Updateversuch meldete entsprechend Shutdown und installierte nichts. Nach erneutem Boot desselben Geräts erfolgreich installiert und gestartet. Das OS hat dabei den Datencontainerpfad gewechselt, die Inhalte aber übernommen. 27 konkrete Vergleiche bestätigen Namen, Gems/AP, Inventar, Ausrüstung, Baupläne, Nodes/Slots, Prestige-/Axiomguthaben und vorhandene Modelle. Save v22 hat eine gültige Prüfsumme, `legacy.prepared` ist false. Änderungen an Produktions-/Automationsuhren, Prestige-Eignung und Training entsprechen dem regulären Offlinefortschritt. Kein Import oder Zurücksetzen des gerade erspielten Fortschritts. Eine zusätzliche lokale Kopie vor dem Update liegt unter `/tmp/idle-unity-simulator-played-before-update/`; keine echten Spielstände im Repository.

Die alte Capacitor-App wurde nicht gestartet oder ersetzt. 15 vorher erfasste Originaldateien ihres Datenbereichs haben unveränderte Hashes. Das unversionierte `ios/` sowie die übrigen sieben ursprünglichen unversionierten Gruppen wurden nicht gestaged oder verändert.

Xcode-Projekt wurde geöffnet. Die UI-Abfrage blockierte bei der ersten Initialisierung lange und später zeitweise mit Timeout. Eine Auswahl von iPhone 16 Pro wurde per UI versucht; die endgültige Dropdown-Auswahl war nicht zuverlässig auslesbar. Build, Installation und Start sind dagegen nachweislich auf die genaue 16-Pro-Simulator-ID festgelegt. Für einen späteren GUI-Run gegebenenfalls oben **Unity-iPhone → iPhone 16 Pro (iOS 27.0)** wählen. Simulator benötigt keine Apple-Anmeldung, Teamwahl oder Gerätefreigabe. Vorhandenes Device-Signing wurde nicht verändert.

**Jetzt spielen:** Im Device Hub den vorhandenen iPhone 16 Pro öffnen. Die App **Idle Intelligence Unity** ist bereits gestartet; bei Miras Trainingsabschluss mit „Weiter“ fortfahren. Für einen erneuten Start die gleichnamige Unity-App wählen; die alte App „Idle Intelligence“ ist weiterhin die separate Capacitor-Version. Der Nutzer hat ausdrücklich zunächst den Simulator gewählt. Physische Geräte-, Performance-, Haptik- und Releaseabnahme sind nicht erfolgt.

Nachweis ohne private Spielstandinhalte: `unity-ios-installed-verification.json`. Die lokale tatsächliche Nachheraufnahme liegt im finalen Buildordner als `actual-simulator.png`; sie zeigt bereits den gerade erspielten Nutzerfortschritt und wird daher nicht als finanzierter Teststand oder öffentliches Testfixture eingecheckt.

## Regression und visuelle Einordnung

Typecheck und Web-Build erfolgreich; 1.896/1.896 Vitest-Fälle (145 Dateien, Europe/Berlin). Unity: 135/135 vollständige EditMode-Fälle, 77/77 vollständige PlayMode-Fälle. Danach kleine Company-/Badge-/Textkorrekturen gezielt erneut mit allen vier Retention-UI-Fällen und drei lokalen Mobile-Fällen geprüft; genaue Läufe inklusive eines gefundenen und korrigierten Fehlers stehen in `unity-ios-verification.json`. Keine Behauptung eines einzelnen vollständigen Schlusslaufs nach jeder kleinen UI-Korrektur.

Company-/Profilbilder bei 320/390/430 px in DE/EN wurden tatsächlich angesehen. Der erste Bildtest war durch automatisch erscheinende Mira-Dialoge verdeckt und wurde mit ausdrücklich isolierten vorbereiteten Zuständen wiederholt. Erkannte Probleme: zu lange permanente Gate-Erklärung, unnötige Mindesthöhen und englische Profil-Mischtexte; gezielt korrigiert. Die gesamte Profil-/Company-Onlinegestaltung ist damit nicht pauschal fertig. Konkrete offene Punkte stehen im visuellen Backlog.

Vier echte Unity-Aktionsclips mit tatsächlichem AudioListener-Mix (48 kHz Stereo), unveränderter Zeitbasis und vorbereiteten isolierten Testständen: Hardwarekauf, Herstellung, Fusion, Gumball unter `docs/media/unity-ios-local/`. Keine ersetzte Tonspur oder nachträglichen Effekte. Neue WAV-Quellen, Pegel und Hashes sind in `unity-ios-audio-assets.json` dokumentiert. Subjektive Klangabnahme auf echter Hardware steht noch aus.

## Zusätzlicher Befund aus dem nativen Erststart

Der erste erfolgreiche native Export/Build aus `eb251e84` zeigte eine bereits vorhandene UI-Verknüpfung: Die Company-Erklärung stand bedingungslos vor der Namenswahl. Korrigiert: nur bei tatsächlich lokal freigeschalteter Company und bereits benannter KI anzeigen. Kein Freischalt-, Kosten-, Dialog- oder Savevertrag verändert. Alle neun gezielt betroffenen PlayMode-Fälle bestanden, einschließlich echtem Namens-/Tutorialablauf und Reload. Das Bild `before-native-company-in-intro.png` dokumentiert den gefundenen Fehler; es ist kein Nachherbild. Der Nutzer hat ausdrücklich zunächst den Simulator gewählt.


## Materialanalyse-Player · 27.10.2026

Aktuell tatsächlich installiert/gestartet: `9ee80e60769891d513aafc69d0b114abdfeed5cc`, Unity6000.3.26f1, ARM64 **iPhone16Pro-Simulator/iOS27.0**, Bundle `com.kayza1708.idleintelligence.unity`. Xcodeprojekt `Builds/iOS-Analysis-9ee80e60/Xcode/Unity-iPhone.xcodeproj`, erfolgreicher lokaler nativer Build und Start. Kein Web-/Capacitorstart.23Unity-/15Capacitor-Originale vor Installation und nach Installation vor Start bytegleich;15Capacitor-Dateien auch nach Unity-Start unverändert. Gültiger normaler Save24 mit `prepared=false`, Name/Inventar/Ausrüstung erhalten. Quellenprüfungen und tatsächliches natives Startbild in `unity-analysis-planning.md` dokumentiert; private Originale/Aufnahme bleiben im ignorierten Buildordner. Physisches Gerät/60fps/Touch nicht daraus ableiten.
