# Mac-Build und Menüscroll

## Mac-Build und Menüs korrigiert – 13. Oktober 2026

Auf main e1f7cb7: UI-Module BonusBoxes.tsx → BonusBoxPanel.tsx und ResearchAutomation.tsx → ResearchAutomationPanel.tsx umbenannt; Domainmodule bleiben. Imports und Renderverträge angepasst. Neue check:source-paths-Prüfung läuft vor jedem Typecheck/Build, lehnt case-insensitive Modulkonflikte und falsch geschriebene lokale Imports ab. Drei künstliche Negativ-/Positivfälle geprüft.

Seitliches Meta-Menü mit eigenem vertikalem Touchscroll, horizontaler Begrenzung, dynamischer Viewporthöhe und vh-Fallback. Alle 20 Komponenten waren bereits im Katalog/Inventar; neue Atlanten und Zuordnungen sind auf main vorhanden. Keine Materialgrants, Unlock-, Balance- oder Saveänderung.

1.346 Tests, Typecheck, Build und Diffcheck bestanden. Echter Mac-/iOS-Simulatorlauf und mobile Scrollabnahme bleiben offen; hier kein Xcodezugang und bereitgestellte Screenshotpfade nicht vorhanden. Vite-Hauptbundlewarnung bleibt. Auf dem Mac erst nach Merge: git pull --ff-only && npm run build && npx cap sync ios && npx cap open ios. Die &&-Kette stoppt vor dem Sync bei Buildfehlern, damit nicht wieder ein alter dist-Stand kopiert wird. Lokalen ios-Ordner/Spielstand nicht löschen.

