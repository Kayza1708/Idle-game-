# Item- und Materialgrafiken eingebunden

Basis: main 510bc7d nach Merge von #97. Alle 30 Itemtypen verwenden den vollständigen Reworkatlas mit sechs Spalten und fünf Reihen. Elf Materialien verwenden den neuen Atlas mit vier Spalten und drei Reihen; neun passende ältere Materialmotive bleiben auf components-atlas-v2.png. Hauptressourcen-Atlas unverändert. Die semantischen kleinen SVG-UI-Icons bleiben.

Eindeutige stabile IDs und Atlaspositionen stehen in `src/GameArt.tsx`: itemReworkCells und materialExtensionCells. Reihenfolge unabhängig von Katalogsortierung; kein Zugriff auf die leere zwölfte Materialzelle. Quadratische Kacheln, bestehende Iconbreiten und Touchziele unverändert. CSS nutzt 600%/500% beziehungsweise 400%/300% Hintergrundgröße, damit ausschließlich die gewählte Zelle angezeigt wird. Archivierte alte Atlanten bleiben verfügbar; der erste neue Gold-Blau-Itematlas wird nicht benutzt. Schmiedenatlas ist ebenfalls als Asset vorhanden, aber ohne neue Bildfläche noch nicht in der UI zugeordnet.

## Prüfung

- 1.346 Tests einschließlich aktualisierter vollständiger Item-/Materialzuordnung bestanden; Typecheck, Build und Diffcheck grün.
- Beide aktiven Atlanten haben quadratische, exakt teilbare Zellen und echten Alphakanal. Buildkopien sind bytegleich.
- Keine Save-, Wirtschaft-, Ressourcen- oder Resetänderung. Neues Bildmotiv wird für alte gespeicherte Items durch stabile IDs verwendet.
- Mobile Browser-/Geräteprüfung weiterhin offen. Routerkabel berühren den rechten Rand des generierten Atlasses; CSS verhindert Nachbarzellen, kann fehlende Originalpixel aber nicht rekonstruieren. Kein pixelgenauer 512px-Einzelassetexport behauptet.
- Vite meldet weiterhin den großen Hauptbundle. Kein Release und kein automatischer main-Merge.
