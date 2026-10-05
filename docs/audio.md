# Audio- und Haptik-Zuordnung

## Verwendete Dateien

Die Audioverwaltung prüft OGG und verwendet MP3 als vorhandenen Fallback. WAV bleibt als Distributionsreserve vorhanden. Sämtliche referenzierten Basen wurden unter `public/assets/audio/` geprüft:

| Datei | Verwendung |
| --- | --- |
| `ui-click.ogg/.mp3` | Navigation und normale Buttons |
| `purchase.ogg/.mp3` | erfolgreicher manueller Hardware-/Gem-/Slot-Kauf |
| `unlock.ogg/.mp3` | Hardwareklasse oder Hardware-Meilenstein |
| `gem-pickup.ogg/.mp3` | Komponentenfund sowie Quest-/Season-Abholung |
| `research-complete.ogg/.mp3` | fertiges Training, Forschung, Analyse oder Crafting |
| `prestige.ogg/.mp3` | normaler Prestige und Axiom-Reset |
| `error.ogg/.mp3` | reservierte explizite Fehlermeldung; Ressourcenmangel löst keinen Erfolgssound aus |
| `idle-loop.ogg/.mp3` | einzige, pausierbare Musikinstanz im Loop |

Automatische Hardwarekäufe und beim Laden zusammengefasste Offline-Abschlüsse bleiben stumm. Vordergrundabschlüsse werden pro Simulationstick zusammengefasst ausgewertet. Klick/Kauf sind auf 100 ms gedrosselt; maximal vier Effektinstanzen dürfen gleichzeitig laufen.

## Fehlende eigenständige Motive

Die vorhandenen Dateien decken alle Aktionen funktional ab, besitzen aber keine getrennten Motive für die folgenden Ereignisse. Bis zu einer gezielten Produktion werden bewusst passende vorhandene Sounds wiederverwendet und keine ungültigen Pfade angelegt:

- `public/assets/audio/hardware-milestone.ogg` + `.mp3` – eigenes Meilensteinmotiv statt `unlock`.
- `public/assets/audio/component-found.ogg` + `.mp3` – eigener Komponentenfund statt `gem-pickup`.
- `public/assets/audio/training-complete.ogg`, `analysis-complete.ogg`, `crafting-complete.ogg` jeweils plus `.mp3` – getrennte Abschlussmotive statt `research-complete`.
- `public/assets/audio/quest-claim.ogg` + `.mp3` – eigene Quest-/Season-Abholung statt `gem-pickup`.
- `public/assets/audio/axiom-reset.ogg` + `.mp3` – eigenes Axiom-Motiv statt `prestige`.

## Native Haptik

Wenn eine Host-Anbindung `globalThis.NativeHaptics.vibrate(pattern)` bereitstellt, wird sie verwendet. Andernfalls nutzt die gemeinsame Funktion defensiv `navigator.vibrate`. Fehlende oder abgelehnte Unterstützung bleibt ohne Auswirkung auf das Spiel. Haptik ist standardmäßig aus und wird nur für direkte Nutzeraktionen ausgelöst.
