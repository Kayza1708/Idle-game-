# Freigabe zum nächsten Xcode-Playtest

29.10.2026: Nutzerentscheidung **erst vollständigen Item-/Prestige-V3-Umbau fertigstellen**, danach den Xcode-Playtest vorbereiten. Kein normaler Zwischenstand wird als V3 installiert. Fortführung auf `codex/unity-rewrite`, Draft #156; kein Merge oder Release.

## Vor Freigabe noch zu erfüllen

- Alle42 Items und12 Kombinationen: tatsächliche Produktions-/Ereignisverbraucher, Erwerb, Kosten, Slots, Originalgrafiken, verständliche Details und sieben Sprachen. Keine reine Katalogabnahme.
- Alle60 INT- und24 Axiomknoten: Zielwirkung statt versteckter Altwirkung; bezahlte Startverträge, Automationen, Budgets, graphische Queues und Erhaltung gemeinsam prüfen.
- Auftragsursachen und monotone Ereignisse: regulär/Intro/Bonus/Übertrag getrennt; keine rekursiven Arbeitsspenden, doppelten Vergütungen oder von Animationen vergebenen Ressourcen.
- Komponentenproduktion, Materialprovenienz, Rückgewinnungsreste und höchstens90% der ursprünglichen bezahlten Basis; fusionierte und fremd erworbene Exemplare korrekt behandeln.
- Neue versionierte TS-/Unity-Migration mit Originalkopie und atomarem Commit, unbekannte/beschädigte Daten sperren. Unbekannte historische Produktion nicht erfinden, doppelte Ausrüstung lösen ohne Besitzverlust. Hauptspiel und Challenges getrennt erhalten. Der bestehende V3-Schreibschutz bleibt bis dahin aktiv.
- Spoilerfreie dauerhafte Axiomentdeckung, klare Erhaltungs-/Verlustvorschau, Mira und erster manueller Reset; Reload/Abbruch dürfen nichts erneut auslösen.
- Erweiterte echte Vorher-/Nachherprofile, acht spezialisierte Loadouts, mehrere echte Resets, Arbeits-/Offlinegrenzen und längste Phasen ohne sinnvolle bezahlbare Aktion prüfen. Die vorhandene begrenzte Strategie ist dafür kein Ersatz.
- Alle referenzierten UI-Aktionen erreichbar; DE/EN320/390/430 und übrige Sprachen prüfen, relevante echte Clips selbst beurteilen. Vollständige Abschlussregression einschließlich PlayMode.

## Danach: lokaler nativer Test

Unity6000.3.26f1 und iOS Build Support, Xcode27.0 (27A266a) vorhanden. Tatsächlich aufgelistetes bisheriges Ziel: iPhone16Pro, iOS27.0, `Reality: simulated`, UDID `2F5C4B2F-A725-45B9-881D-16DA5BD50057`; kein physisches Gerät nachgewiesen. Simulator wurde nur für die Umgebungsprüfung gebootet, kein neuer Spielcode installiert.

Vor Build/Installation: endgültigen geprüften Commit sichern, getrennten neuen Exportordner wählen, bestehende Unity-/Capacitor-Saves und Originals sichern, Bootszene und SafeArea beibehalten. ARM64-Simulator-Xcode-Projekt bauen, aktualisieren ohne Deinstallation, Kaltstart und bestehende Save-Migration prüfen. Installierten Commit aus der App-Provenienz lesen. Kein Web-Build und keine Store-Veröffentlichung.

Echte Cloudkonten, produktive Companyanmeldung, echte Ads/IAP und physische Geräte-/Releaseabnahme bleiben separat. Ohne Entwicklerkonten darf kein Plattformkontakt oder erfolgreicher Kauf behauptet werden; lokale Spielfunktionen bleiben unabhängig prüfbar. Cloudstatus: `docs/unity-platform-cloud.md`.
