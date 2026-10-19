# Prestigenetz und Schmiedebewegung – Beta 11

Basis: main `625a42f` nach Merge von PR #126. Diese Änderung betrifft Darstellung und Bedienung, keine Preise, Produktionsraten oder Save-Regeln.

## Prestigenetz

Die 60 INT-Knoten liegen wieder als verbundenes Netz um den INT-Kern, mit sechs Bereichen und sichtbaren Leitungen. Der spätere Axiombereich verwendet dieselbe Oberfläche für seine 24 Knoten. Jede Verbindung dient der Orientierung: Ein INT-Knoten wird weiterhin ausschließlich durch seinen Preis kaufbar. Vorgänger müssen nicht gekauft werden.

Der Ausschnitt lässt sich ziehen, mit zwei Fingern zoomen sowie über Zoom-/Zentrum-Tasten und Bereichsauswahl bewegen. Auf schmalen Displays passt sich der Startzoom an. Tastaturfokus holt entfernte Knoten in den Ausschnitt; Pfeiltasten verschieben, Plus/Minus zoomen, Home zentriert. Alle Knoten bleiben inspizierbar, auch ohne ausreichendes Guthaben. Die eigentlichen Kauf- und Resetbestätigungen bleiben erhalten. Die Darstellung nutzt die vorhandenen Hardware-, Item- und Ressourcenmotive und eckige Rahmen.

## Herstellung und Fusion

Die ursprünglichen beiden Schmiedegrafiken bleiben erhalten. Ein zentrales Stage-Stylesheet besitzt jetzt Sockelpositionen, Itemgrößen und Bewegungen; ältere widersprüchliche Positionsregeln, Glow-Effekte und der zusätzliche Vollbild-Ergebnisraum wurden entfernt.

- Herstellung: tatsächlich bezahlte Komponenten heben ab, fliegen zum Amboss und verschwinden dort. Energiepfade, kurze mechanische Klammerbewegungen und gerichtete Funken begleiten die Materialisierung des tatsächlichen Items.
- Fusion: die drei tatsächlich ausgewählten Items verlassen ihre jeweiligen Sockel. Der höchste Level und die Identität des beibehaltenen Inputs stammen aus dem wirklichen Ergebnis. Anschließend erscheint das neue Item mit lebendiger Seltenheitsfarbe; Ungewöhnlich ist grün.
- Die Transaktion bleibt sofortig. Die Animation ist reine Darstellung, keine Produktionszeit und keine Warteschlange. Wiederholte Aktionen ersetzen die laufende Darstellung. Es gibt keinen obligatorischen Weiter-Button.
- Bewegungen laufen über Web Animations und einen begrenzten Canvas-Funkenlauf. Alle Animationen, Timer und Frames werden beim Entfernen aufgeräumt. Tabwechsel und Hintergrundwechsel verwerfen die Darstellung. Reduzierte Bewegung oder deaktivierte Effekte zeigen das tatsächliche Ergebnis ohne bewegte Sequenz.

## Nachweise

`src/progressionNetwork.test.tsx` prüft vollständige, überlappungsfreie Netze, Erreichbarkeit jedes Knotens vom Kern, Zoomanker, Mindestgröße, stabile Tutorial-IDs und einen echten H06-Kauf ohne H01. `src/forgeMotion.test.tsx` prüft echte sofortige Craft-/Fusionstransaktionen, bezahlte Komponenten, beibehaltenen Level/ID und Slotzuordnung. Die Darstellung erteilt selbst keine Belohnungen.

`scripts/network-forge-audit.mjs` verwendet finanzierte synthetische Spielstände und echte App-Aktionen bei 320, 390 und 430 × 844 CSS-Pixeln. Geprüft: 60 Knoten/Leitungen, Zwei-Finger-Zoom, Verschieben ohne versehentliches Öffnen, Tastaturkauf von H06 ohne H01, sichtbare Komponentenbewegung, sofortiges persistiertes Crafting/Fusionieren, Level-3-Erhaltung, kein zusätzlicher Gewinn nach Animationsende, selbstständiges Schließen, reduzierte Bewegung und Navigation ohne hängende Szene. Keine Browser-Laufzeitfehler und kein horizontaler Seitenüberlauf.

- [Prestigenetz](screenshots/prestige-network.webp)
- [Herstellung](screenshots/forge-craft-motion.webp)
- [Fusion](screenshots/forge-fusion-motion.webp)
- [Kurzer Mitschnitt echter UI-Aktionen](previews/forge-motion.mp4)

Der Clip stammt aus dem Browser, nicht aus einem gerenderten Konzeptfilm. Synthetische Ressourcen belegen keine natürliche Balance. Die Gesten und Animationen müssen zusätzlich im echten iPhone-/WKWebView-Build auf Bildrate, Touchverhalten und Safe Areas geprüft werden. Die bekannte Vite-Warnung zur Hauptbundle-Größe bleibt offen.

Lokale Abschlussprüfung: `npm run typecheck`, `npm test` (125 Dateien, 1.851 Tests) und `npm run build` erfolgreich. Nach der letzten Darstellungsbereinigung wurden zusätzlich vier betroffene Testdateien mit 18 Tests erneut erfolgreich geprüft.
