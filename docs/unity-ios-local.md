# Lokaler Unity-iOS-Weg

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

Export, Xcode-Build, Installation, Startcommit und Beobachtungen werden nach dem jeweiligen Schritt eingetragen. Dieser Abschnitt ist bis dahin kein Erfolgsnachweis.

## Regression und visuelle Einordnung

Typecheck und Web-Build erfolgreich; 1.896/1.896 Vitest-Fälle (145 Dateien, Europe/Berlin). Unity: 135/135 vollständige EditMode-Fälle, 77/77 vollständige PlayMode-Fälle. Danach kleine Company-/Badge-/Textkorrekturen gezielt erneut mit allen vier Retention-UI-Fällen und drei lokalen Mobile-Fällen geprüft; genaue Läufe inklusive eines gefundenen und korrigierten Fehlers stehen in `unity-ios-verification.json`. Keine Behauptung eines einzelnen vollständigen Schlusslaufs nach jeder kleinen UI-Korrektur.

Company-/Profilbilder bei 320/390/430 px in DE/EN wurden tatsächlich angesehen. Der erste Bildtest war durch automatisch erscheinende Mira-Dialoge verdeckt und wurde mit ausdrücklich isolierten vorbereiteten Zuständen wiederholt. Erkannte Probleme: zu lange permanente Gate-Erklärung, unnötige Mindesthöhen und englische Profil-Mischtexte; gezielt korrigiert. Die gesamte Profil-/Company-Onlinegestaltung ist damit nicht pauschal fertig. Konkrete offene Punkte stehen im visuellen Backlog.

Vier echte Unity-Aktionsclips mit tatsächlichem AudioListener-Mix (48 kHz Stereo), unveränderter Zeitbasis und vorbereiteten isolierten Testständen: Hardwarekauf, Herstellung, Fusion, Gumball unter `docs/media/unity-ios-local/`. Keine ersetzte Tonspur oder nachträglichen Effekte. Neue WAV-Quellen, Pegel und Hashes sind in `unity-ios-audio-assets.json` dokumentiert. Subjektive Klangabnahme auf echter Hardware steht noch aus.

## Zusätzlicher Befund aus dem nativen Erststart

Der erste erfolgreiche native Export/Build aus `eb251e84` zeigte eine bereits vorhandene UI-Verknüpfung: Die Company-Erklärung stand bedingungslos vor der Namenswahl. Korrigiert: nur bei tatsächlich lokal freigeschalteter Company und bereits benannter KI anzeigen. Kein Freischalt-, Kosten-, Dialog- oder Savevertrag verändert. Alle neun gezielt betroffenen PlayMode-Fälle bestanden, einschließlich echtem Namens-/Tutorialablauf und Reload. Das Bild `before-native-company-in-intro.png` dokumentiert den gefundenen Fehler; es ist kein Nachherbild. Der Nutzer hat ausdrücklich zunächst den Simulator gewählt.
