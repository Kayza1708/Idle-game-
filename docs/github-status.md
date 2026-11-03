# GitHub-Abgleich · 3. November 2026

## Gemeinsamer Stand

Repository: [Kayza1708/Idle-game-](https://github.com/Kayza1708/Idle-game-). Gemeinsamer Branch: `codex/unified-v3-art-shop`, ausgehend von main `ccfb38df` (PR #176). Beim erneuten Abruf vor dem Upload war main unverändert; es gab keine offenen PRs.

Der Stand enthält die native V3-Basis mit 42 Items, die illustrierte Schmiede, Shop-Gem-Grafiken und flexible Breiten, kleine preisfreie Homescreen-Verknüpfungen, die gemeinsame Seiten-/Unterseitenbereinigung und die zentrale C#-Balance. Die älteren Spielversionen werden nicht zurückgemischt. Aktives Unity-Projekt ist ausschließlich der Repository-Root.

## Prüfungen

- Balance-Quellen und CSV-Dateien stimmen mit dem dokumentierten erfolgreichen Lauf überein: 248/248 EditMode, 3/3 Schmiede-PlayMode, nativer Core-Smoke und macOS-Build. Siehe [Economy](economy.md) und [Manifest](balance/verification.json).
- UI-Abnahme: 70 Varianten × 2 Sprachen × 3 Breiten; 420 Prüfungen. Historische Zwischenstände sind in ihren jeweiligen Berichten bezeichnet.
- Zusätzlicher vollständiger PlayMode-Lauf für den gemeinsamen Uploadstand läuft. Ergebnis wird nachgetragen.
- Die verlangten npm-Kommandos `npm run typecheck`, `npm test -- --run`, `npm run build` wurden vor dem PR versucht; alle enden mit ENOENT, da der Unity-only-Root keine `package.json` enthält. Maßgeblich sind die nativen C#-/Unity-Prüfungen; es wird keine zusätzliche Webversion angelegt.

## Umfang des Uploads

Quellcode, Unity-Assets einschließlich Metadaten, Tests, Dokumentation und Prüfabbildungen werden gemeinsam übertragen. Generierte Library-/Cache-Dateien, lokale .app-Builds, Test-Spielstände und alte lokale Sicherungen gehören nicht zum Quellstand. Der lokale Build bleibt unter `unity-acceptance/balance-20261103/` verfügbar.

Commit-/Remote-Gleichheit und GitHub-CI werden nach dem Push geprüft. Kein Merge und kein App-Store-Release sind Teil dieses Auftrags. Die längerfristige Endgame-Balance bleibt als offener Punkt dokumentiert.
