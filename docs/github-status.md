# GitHub-Abgleich · 3. November 2026

## Aktueller Quellstand

Der vollständige aktuelle Entwicklungsstand liegt im Branch [codex/unified-v3-art-shop](https://github.com/Kayza1708/Idle-game-/tree/codex/unified-v3-art-shop) und in [Pull Request #177](https://github.com/Kayza1708/Idle-game-/pull/177). Der erste gemeinsame Codecommit ist `3532142c`; die anschließende Korrektur und Abschlussdokumentation ergänzen diesen Branch. `main` steht weiterhin auf `ccfb38df` (PR #176); ein Merge ist nicht Teil dieses Auftrags.

Enthalten sind die native V3-Basis mit 42 Items, die illustrierte Schmiede, Shop-Gem-Grafiken und flexible Breiten, kleine preisfreie Homescreen-Verknüpfungen, die gemeinsame Seiten-/Unterseitenbereinigung und die zentrale C#-Balance. Die älteren Spielversionen werden nicht zurückgemischt. Aktives Unity-Projekt ist ausschließlich der Repository-Root.

## Nachgewiesene Prüfungen

- **248/248 EditMode** bestanden; Core-Balancequellen stimmen unverändert mit dem dokumentierten Lauf überein.
- **Vollständiger gemeinsamer PlayMode-Lauf: 151/152 bestanden.** Der eine Befund war ein englischer Preisumbruch beim jetzt höheren Item-Upgradepreis. `CostStrip` misst jetzt die tatsächliche volle Zeilenbreite bei Mindestschriftgröße statt einen bereits verkleinerten Wert erneut herunterzurechnen.
- **7/7 Nachtests nach der Korrektur bestanden**: tatsächliche Serienfertigung und Preisvorschauen in sieben Sprachen, finanzierte/fehlende Upgrade-Eingaben in DE/EN bei 320/390/430 px, Schmiedeaktionen und gesamte Seitenmatrix. Die bestehende Einzeilen-Prüfung bleibt erhalten; zusätzlich wird geprüft, dass der volle Betrag ohne Abschneiden hineinpasst.
- **420 Layoutprüfungen nach der Korrektur ohne Fehler**: 70 Ansichtsvarianten × 2 Sprachen × 3 Breiten. Kein erneuter vollständiger 152er-Lauf nach dieser gezielten UI-Korrektur behauptet.
- Abschließender lokaler macOS-Build einschließlich der Kostenkorrektur: siehe [Prüfmanifest](github-upload.verification.json).
- Die [native GitHub-CI des ersten Codecommits](https://github.com/Kayza1708/Idle-game-/actions/runs/41678105600) ist erfolgreich. Die jeweils aktuellen Checks stehen am [PR](https://github.com/Kayza1708/Idle-game-/pull/177/checks); diese CI kompiliert native C#-Logik und simuliert Fortschritt. Unity-Editorprüfungen liefen lokal.
- Die verlangten npm-Kommandos `npm run typecheck`, `npm test -- --run`, `npm run build` wurden vor dem PR versucht; alle enden mit ENOENT, da der Unity-only-Root keine `package.json` enthält. Maßgeblich sind die nativen C#-/Unity-Prüfungen; es wird keine zusätzliche Webversion angelegt.

## Aktuelle Vorschauen

[Schmiede](media/github-final/forge-de-390.png) · [Shop](media/github-final/shop-de-390.png) · [Homescreen](media/github-final/home-tiny-links-de-390.png) · [Navigation](media/github-final/menu-de-320.png) · [korrigierter Upgradepreis bei 320 px](media/github-final/upgrade-en-320-funded.png).

## Vollständigkeit und Grenzen

Quellcode, Unity-Assets einschließlich Metadaten, Tests, Dokumentation und Prüfabbildungen werden gemeinsam übertragen. Generierte Library-/Cache-Dateien, lokale .app-Builds, Test-Spielstände und alte lokale Sicherungen gehören nicht zum Quellstand. Rohbelege und aktueller Build liegen lokal unter `unity-acceptance/github-final-20261103/`.

Lokaler und entfernter Commit wurden nach dem ersten Push identisch bestätigt; die im [Manifest](github-upload.verification.json) enthaltenen Quellhashes erfassen auch die nachträgliche Kostenkorrektur. Die Abschlussprüfung umfasst zusätzlich den erneuten Commit-Abgleich nach dem Folgepush. Kein Merge und kein App-Store-Release wurden ausgeführt. Die längerfristige Endgame-Balance bleibt als offener Punkt dokumentiert.
