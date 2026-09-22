# AI Singularity – zusammenhängende Alpha

AI Singularity ist jetzt eine spielbare mobile Browser-Alpha: Hardware kaufen, Modelle trainieren, ein Labor neu starten, permanente Knoten wählen, Experimente durchführen, Items craften/verbessern/ausrüsten und über Missionen Gems verdienen. Dazu kommen Offline-Fortschritt, Autokäufer, Achievements, Boosts und ausschließlich lokale Mock-Testbelohnungen. Es gibt keine echten Käufe, Werbung, Veröffentlichung oder Ranglisten.

## Auf einem Mac starten

Benötigt werden **Node.js 20 LTS**, Git und die Terminal-App:

```bash
git clone https://github.com/Kayza1708/Idle-game-.git
cd Idle-game-
git switch work
npm ci
npm run dev
```

Die angezeigte Adresse (meist `http://localhost:5173`) im Browser öffnen. `Ctrl+C` beendet den Server. Ein fertiger Production-Build entsteht mit `npm run build` und liegt in `dist/`; zum lokalen Prüfen danach `npm run preview` ausführen.

## Was implementiert ist

- Mobile Navigation: Werkstatt, Forschung, Inventar, Prestige und Missionen.
- Versionierter Save (v2), Migration des Prototyp-Saves, Importprüfung und maximal 24 Stunden Offline-Simulation.
- Prestige mit Umsatzstatistiken, 18 Knoten, optionaler Rückverteilung und permanentem Faktor.
- Drei Experimente, Warteschlange/Wiederholung, drei Durchbrüche und einmalige Abschlussbelohnungen.
- Neun illustrierte Itemtypen, fünf Seltenheiten, Pity, Crafting, Upgrade, Sperren, Zerlegen und drei Slots.
- Daily/Weekly-Missionen, dauerhaftes Belohnungsfach, Achievements, Gems und zwei echte Ingame-Ausgaben.
- Offline-Autokäufer, Gem-/Credit-Boosts und vier transaktionssichere lokale Mock-Angebote.
- Nur im Vite-Entwicklungsmodus sichtbares Testmenü mit Ressourcen, Zeitsprüngen, Vorlagen und Save-Import/-Export.

Balance und bekannte Alpha-Vereinfachungen: [`docs/economy.md`](docs/economy.md). Stilregeln: [`docs/art-direction.md`](docs/art-direction.md).

## Acht manuelle Tests

1. Credits/Training beobachten, einen Block kaufen und Wirkung, Meilenstein und Trainingszeit prüfen.
2. Im Entwicklermenü „Vor Prestige“ laden, Prestige öffnen und den Laborneustart bestätigen.
3. Einen Knoten kaufen, danach erneut Prestige mit kostenloser Neuverteilung testen.
4. Nach Prestige ein Experiment einreihen, per 24-Stunden-Sprung abschließen und Item/Materialien prüfen.
5. Im Inventar ein Item craften, ausrüsten, verbessern, sperren und den blockierten Zerlegeknopf prüfen.
6. Mission mit sichtbarer Seite erfüllen, manuell beanspruchen und im Gem-Shop Komponenten kaufen.
7. Autokäufer aktivieren, Reserve setzen, eine Stunde springen und prüfen, dass die Reserve bleibt.
8. Seite neu laden und einen Tab verstecken/wieder öffnen; Fortschritt und zusammengefassten Rückkehrbericht prüfen.

## Qualität

```bash
npm ci
npm run typecheck
npm test
npm run build
```

GitHub Actions führt dieselben Prüfungen aus. Browser-Zielgrößen sind etwa 390 × 844 Pixel und Desktop. Die Grundlage enthält den bereits auf `main` gemergten Stand von PR #1; diese Alpha hängt daher nicht von einem offenen PR #1 ab. Nicht automatisch mergen oder veröffentlichen.
