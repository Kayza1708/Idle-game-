# Unity-first Repository Cleanup — 30.10.2026

## Ziel

`IdleIntelligence/` ist das aktive mobile Spiel; der alte TypeScript-Client bleibt vorläufig nur als überprüfbare Legacy-Referenz und Datenexportquelle erhalten. Diese erste Cleanup-Runde entfernt ausschließlich überholte Screenshots, Designvideos und historische Nachweisberichte aus dem aktuellen **Git-Arbeitsbaum**, nicht aus der Git-Historie. Kein Unity-Player-Binary, Produktasset, ScriptableObject oder aktiver C#-/NUnit-/Paritätstest wird gelöscht.

## Tatsächlich bereinigt

- `docs/media/unity-design-01/`: **31** alte Screenshots/Video-/Protokolldateien.
- `docs/media/unity-design-02/`: **40** alte Medien.
- `docs/media/unity-design-03/`: **40** alte Medien.
- Historische Designberichte `docs/unity-design-01.md`, `02.md`, `03.md` und die **4** alten Verifikations-/Assetreports.
- **118 Dateien, 15.644.655 Bytes** im Checkout weniger. Alle Belege sind bei Bedarf über die Git-Historie des Eltern-Commits wiederherstellbar.
- Verweise in `docs/unity-visual-backlog.md` sind auf den archivierten Nachweis umgestellt, sodass keine toten Links auf diese drei Designberichte verbleiben.

Nicht betroffen: aktuelle Unity-Szene, 42er-Itemkatalog, Portrait-/Atlas-Sprites, Forge-/Mira-Prefabs, neuere Designprüfungen 04–06, native Balancingsimulationen, MonoBehaviours, Meta-Dateien, Lizenzangaben, Cloudflare-Backend und die mit echten Gameplay-Daten belegten Unity-Tests.

## Größeninventar vor dieser Cleanup-Runde

Aus der rekursiven GitHub-Dateiliste (Datei-Größen, **nicht** `.git`-Packgröße oder APK-Größe):

| Bereich | Dateien | Summe |
|---|---:|---:|
| `docs/` | 1403 | ca. 279 MB |
| davon `docs/media/` | 1113 | ca. 258 MB |
| `IdleIntelligence/` | 1319 | ca. 243 MB |
| davon `Assets/IdleIntelligence/Tests/EditMode/` | 198 | ca. 184 MB |
| `public/` | 91 | ca. 41 MB |
| `src/` | 360 | ca. 3,1 MB |
| `scripts/` | 170 | ca. 1 MB |

Diese Zahlen sind ein **Aufräuminventar**, kein Hinweis auf einen 500-MB-Player: `docs/`, `src/` und EditMode-Tests werden nicht automatisch in das iOS-/Android-Spiel gepackt.

## Warum nicht sofort alles TypeScript löschen?

1. Es existieren mindestens **25 Unity-`*.g.cs`-Dateien** sowie **23 große Unity-`*ReferenceCases.json`-Datensätze** (zusammen ca. **181,5 MB**), die aus historischen `scripts/export-unity-*.ts`-Exportern stammen bzw. mit deren Referenzen geprüft werden.
2. `package.json` enthält noch `unity:export`, und `.github/workflows/ci.yml` führt `npm test`, `npm run typecheck` und `npm run build` aus. Die aktuellen generierten Unity-Itemdaten stehen wegen 36- versus 42-Item-Katalog nicht auf einem gemeinsam grünen Referenzstand. Auch Story-Referenzen wurden als veraltet gemeldet.
3. `cloudflare/` umfasst eigene Online-/Company-Backend-Bausteine; diese sind nicht bloß alte Frontend-Dateien und benötigen eine unabhängige Runtime-Abnahme.
4. Aus einem bestandenen nativen `.NET`-Smoke folgt **nicht**, dass alle alten Web-Funktionen in einer tatsächlich gestarteten Unity-App vollständig und unverändert vorhanden sind.

### Technische Freigabebedingungen für eine spätere Löschung

- Unity ist die **einzige wartbare** Quelle für Corebalance, 42 Items, Prestige, Axiome, Ads, Kauf-/Shoprechte, Challenges, Missions-/Seasons, Cloud-/Company-Funktionen, Lokalisierung und Saves.
- Alle nötigen generierten `*.g.cs`-Daten sind aus einer Version in `IdleIntelligence/` reproduzierbar, **ohne** `src/`, `scripts/` oder `npm`.
- Alte 23 Reference-JSON-Fixtures in **kleine unveränderliche native Goldens** umwandeln oder nach eigener C#-Parität durch neue reproduzierbare Fixtures ersetzen. EditMode/PlayMode-Verhalten bleibt überprüft.
- Live Mobile Player vollständig starten: New Game, Offline/Foreground, Shop, echtes Ad, echte Storekäufe mit Server-Verifizierung, Company-Backend und alle kritischen UI-/Progressionspfade auf Mac und Smartphone.
- Unity-only CI grün, alte Exportpflicht vollständig durch native Builds ersetzt; Tests und PR-Abnahme dokumentiert.
- Erst dann Legacy-Bestand als Git-Tag/Archiv bewahren und in einem **zweiten, separaten Cleanup-PR** `src/`, `scripts/`, `public/`, `package*.json`, Capacitor und alte Web-Workflows löschen. `cloudflare/` separat prüfen.

## Weitere Kandidaten, die bewusst **noch nicht** entfernt wurden

- Weitere rund 240 MB historischer Mediendokumentation: nur nach Sichtprüfung, ob ein Nachweis noch als Referenz für aktuelle UI-Regressionen dient.
- Unity-EditMode-Referenzen (ca. 184 MB): nicht entfernen, bevor native Tests dieselben Verhaltensfälle abdecken.
- Unity-`.meta`-Dateien, Fonts, Assets und Packages: keine kosmetische Löschung, solange Scene/Prefab/ScriptableObject/Package-Referenzen nicht durch Unity geprüft wurden.
- Veraltete Workflow-/Generator-Dateien: erst nach vollständig eigenständiger Unity-only-CI und eventuellen Abhängigkeiten anderer Featurebranches entfernen.
- Alte TS-Tests: trotz `V3`-Eigentümerschaft nicht einfach löschen, während sie noch Stale-Generator-/Parity-Fehler sichtbar machen.

## Status des SDK-/Monetarisierungscodes

PR [#163](https://github.com/Kayza1708/Idle-game-/pull/163) wurde **in den Entwicklungsbranch von PR #162** gemergt, nachdem #162 bereits nach `main` gemergt war. Diese Folge bedeutet nicht automatisch, dass die Werbe-Integration im aktuellen `main` enthalten ist. Der aktuelle `main`-Package-Manifeststand muss nochmals geprüft/übernommen werden; in dieser Prüfung war `com.unity.services.levelplay` dort **nicht** vorhanden.

Auch bei einem korrekt gemergten LevelPlay-Adapter fehlen bis zur Produktion die realen Ad-Unit-IDs, getestete mobile Impressionen, gültige DSGVO-/CMP- und ggf. ATT-Einwilligungen, Datenschutzdokumentation sowie eine verifizierte Kaufpipeline.

## Regressionsprüfung dieser Runde

Ausschließlich Dokumentationsdateien entfernt sowie README und Arbeitsregeln berichtigt; keine C#-, Unity-Asset-, Package- oder Runtimeänderung. Ein nativer Editor-/Player-Test ist **dadurch weder ausgeführt noch ersetzt**. Die allgemeine TS-Game-CI ist bereits vor diesem Cleanup aufgrund der historischen Unity-/TS-Paritätsdifferenzen teilweise fehlgeschlagen. Die Cleanup-Menge muss im GitHub-PR überprüft werden; bei Bedarf einzeln aus der Git-Historie wiederherstellen.
