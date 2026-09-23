# Arbeitsregeln

- Halte Balance-Werte ausschließlich in `src/economy.ts` und dokumentiere Änderungen zusätzlich in `docs/economy.md`.
- Economy-Funktionen bleiben rein und erhalten Vitest-Tests. Zeitfortschritt muss von verstrichener Zeit statt der Bildrate abhängen.
- Speicherdaten sind versioniert. Inkompatible oder beschädigte Daten niemals automatisch überschreiben.
- Die Oberfläche bleibt mobile-first, touchfreundlich (mindestens 44 px), kontrastreich und ohne leere Platzhalter-Menüs.
- Nutze eigene SVG-/CSS-Grafik und respektiere `prefers-reduced-motion`.
- Vor einem Pull Request: `npm run typecheck`, `npm test` und `npm run build` ausführen.
- Keine Veröffentlichung, kein Merge und keine nativen, Werbe- oder Kauf-SDKs ohne neuen Auftrag.
- Pflege bei jedem abgeschlossenen Arbeitsauftrag `docs/ROADMAP.md` und `docs/NEXT_STEPS.md`; markiere nur nachweislich erfüllte Abnahmekriterien als erledigt.
