# Progressionsanimationen · 14.10.2026

## Implementierung

Reine Darstellung auf Basis der gemergten #107: keine Balance-, Kosten-, Produktions-, Reset- oder Save-Schemaänderung. Kein neues Asset und kein SDK.

`progressionMotionPlan` vergleicht zwei bestätigte Zustände. Nur frische tatsächliche Forschungs-/Craft-/Forge-Abschlussereignisse erzeugen Meldungen; Forschung/Forge benötigen zusätzlich gestiegene Abschlusszähler. Ereignisse werden strukturell abgeglichen, damit geklonte Telemetrie keine alte Meldung wiederholt. Ohne geänderte Abschlusszähler/Module wird die Ereignisliste nicht durchsucht. Maximal drei Meldungsgruppen: Forschung, Forge und Herstellung; mehrere gleichzeitige Abschlüsse desselben Typs erhalten einen gemeinsamen Zähler.

Die frei schwebende Abschlusszeile nutzt vorhandene Forschungs-, Werkbank- und Itemgrafiken. Ein dezenter bodennaher Verlauf sorgt für Kontrast; kein Rahmen oder Modal. Sie verschwindet nach 2,6 s und fängt keine Touch-Eingaben ab. `role=status`, polite/atomic Live-Region. Forge-/Craft-Items mit eigener Abschlusszeile werden aus dem gleichzeitig erzeugten alten Itemtoast gefiltert; Domain-Auszahlungen bleiben unverändert. Alle anderen Itemmeldungen bleiben erhalten.

Sichtbare zugehörige Forschungskachel/Laborslots, Itemkacheln und Schmieden erhalten einen kurzen Helligkeitsimpuls (600 ms). Bei verborgenem Ziel bleibt die Abschlusszeile als screenübergreifendes Feedback. Normales passives Einkommen erzeugt keine Animation.

Beim bestätigten Anlegen eines Items fliegt eine rein kosmetische Kopie der vorhandenen Illustration in 500 ms von der sichtbaren Ausrüstungsauswahl zum sichtbaren Slot. Quelle wird vor dem React-Commit erfasst, Ziel danach. Fehlt eines der sichtbaren Ziele, gibt es keinen Flug. Bei Ablegen nur Slotfeedback; blockierte/unveränderte Aktionen erzeugen keinen Transfer. Kopie aria-hidden, ohne Pointer-Eingaben, automatisch entfernt. Der Domain-Equip erfolgt sofort und wartet nicht auf die Animation.

Neue Prestige-Knoten erhalten einen kurzen Impuls. Eingehende und neu aktivierte ausgehende SVG-Verbindungen haben 850 ms wanderndes Licht; danach gelten wieder die bestehenden Pfadfarben. Mehrfachanforderungen behalten ihre Domainregeln. Keine Kameraänderung oder automatische Scrollbewegung.

## Bewegung, Unterbrechung und Resetvertrag

Web-Animations verändern ausschließlich bereits gerenderte Elemente; kein Fortschritt hängt an Framezahl oder Animationsende. Effekteinstellung und `prefers-reduced-motion` verhindern Bewegungen. Bei einer Änderung werden aktive Animationen/Kopien abgebrochen; Generationsnachweis verwirft auch noch geplante Frames. Unmount bereinigt Animationen und Meldungstimer. Statische Abschlussmeldungen bleiben lesbar, wenn Bewegung deaktiviert ist.

Laden/Import, Kampagnenwechsel, Prestige-/Axiom-Reset, Eintritt/Austritt einer Challenge und Fortschrittssprünge über 60 s erzeugen keine nachträgliche Animationsserie. Kontextwechsel löschen laufende Meldungen/Kopien. Offline-Ergebnisse bleiben im bestehenden Rückkehrbericht. Bei regulärem Foreground-Tick oder einer echten Benutzeraktion mit zwischenzeitlichem Abschluss erscheint einmal das neue Feedback. Keine Nachweise im Save nötig; Reload hydriert ohne alten Animationstrigger.

## Prüfung

- Gesamte reguläre Suite: 1.410 Tests in 105 Dateien grün, einschließlich sechs neuer Tests mit realen Forschungs-, Modul- und drei parallelen Forge-Abschlüssen sowie Equip-/Reset-/Reload-Verträgen. Keine langen Kampagnensimulationen gestartet.
- Nachlauf: 99 Tests in vier betroffenen Dateien; Typecheck/Production-Build/Diffcheck grün. Bestehender Hinweis zum großen Vite-Bundle bleibt.
- Sechs vorbereitete Rendererprofile: 360/390/430 px, DE/EN; echte Online-Abschlüsse, keine doppelte Itemmeldung, einmalige Meldung, Reload, Itemflug/Entfernung, gekaufte Prestige-Verbindungen, reduzierte Bewegung und Effekte aus. UI-Profile verwenden bezahlte vorbereitete Jobs nahe ihrem Ende und freigeschaltete Ressourcen. Sie belegen Bedienung/Darstellung, keine natürlichen Unlock-Timings oder Balance.
- Native iPhone-/WKWebView-/VoiceOver-Abnahme weiterhin offen. Neues Feedback ist kein Nachweis einer vollständig releasefähigen App. Keine Langzeitbalanceänderung; Kapselkalibrierung und Produktions-Werbeanbieter bleiben Aufgaben aus #107.
