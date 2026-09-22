# AI Singularity
Ein kommerzielles Idle-/Incremental-Game für iOS und Android. Entwicklung zunächst als mobile Browser-Version, anschließend frühzeitige Tests als native App.

## Projektstatus
Neues Repository. Dieser erste Commit enthält ausschließlich die Arbeitsgrundlage. Spielcode, Builds und Tests folgen im ersten Implementierungsauftrag. Das vollständige Balancing ist noch nicht freigegeben.

## Zielbild
Vom Heimrechner zur technologischen Singularität. Hardware erzeugt Compute; Modelle nutzen Compute und erzeugen Einnahmen; Einnahmen finanzieren Hardware. Langfristig kommen Prestige, Forschung, Items, Crafting, Gems, freiwillige Werbung und Ranglisten hinzu. Die KI im Spiel ist simuliert; für den Core Loop sind keine echten KI-API-Aufrufe erforderlich.

## Arbeitsweise
- Nutzer entscheidet über Produkt und übernimmt Änderungen nach einem spielbaren Test.
- Codex implementiert kleine Arbeitspakete auf Feature-Branches und erstellt Pull Requests.
- main bleibt der geprüfte Ausgangsstand. Kein automatisches Merge oder öffentliches Deployment.
- Regeln und Balance-Werte zentral dokumentieren. Änderungen an Designentscheidungen ausdrücklich kennzeichnen.
- Der Nutzer hat keine Programmiererfahrung. Kurze, genaue Start- und Testanleitungen liefern.
- Keine bestehenden Projektdateien bei der Einrichtung ungeprüft überschreiben.

## Erster Codex-Auftrag: spielbarer, gestalteter Browser-Prototyp
Implementiere den folgenden begrenzten Abschnitt. Der Auftrag autorisiert Spielcode für diesen Prototyp, nicht die komplette langfristige Spielökonomie.

### Technische Grundlage
React, TypeScript und Vite für die Browser-Version. CSS/SVG für Oberfläche und Illustrationen; ein leichtgewichtiges Canvas-Overlay nur falls für Partikel erforderlich. Keine zusätzliche Game Engine notwendig für diesen Abschnitt. Verwende kompatible stabile Versionen, lege die passende Node-Version und ein Lockfile fest.

Vorbereitete Trennung:
- Reine Economy-Funktionen und zentral konfigurierte Balance-Werte.
- Spielzustand und versionierte lokale Speicherung.
- Darstellung, Animationen und Eingabe.
- Klare spätere Anschlussstellen für native Funktionen. Capacitor ist der vorgesehene Kandidat für einen folgenden iOS-/Android-Test; noch keine Werbung oder Kauf-SDKs einbauen.

### Umfang
Ein hochwertiger Hauptbildschirm im Hochformat mit automatischem Einkommen, Hardwarekauf, sichtbarem Training, Modellverbesserungen und Speichern. Ziel: die ersten 15 Minuten wirklich spielen und das Bediengefühl beurteilen.

### Vorläufige Economy-Regeln
Diese Werte stammen aus dem vereinfachten Designmodell 0.1 und sind keine fertige Release-Balance.
- Start: 1 kostenloser Hardwareblock, 0 Credits, Modelllevel 0.
- n = vorhandene Hardwareblöcke; L = Modelllevel.
- Preis des nächsten Blocks: 25 * 1.18^n Credits. Nicht vorzeitig runden.
- Compute/s = 10 * n * 2^floor(n / 25).
- Qualität = 1.08^L; Effizienz = 1.04^L.
- Credits/s = Compute/s * 0.1 * Qualität * Effizienz.
- Trainingsrate = Compute/s * 0.05 Arbeit/s. Training verringert den Betriebs-Compute nicht.
- Nächste Trainingsarbeit = 300 * 1.8^L.
- Training läuft automatisch und wiederholt sich. Beim Abschluss steigt L um 1; überschüssige Arbeit bleibt erhalten.
- Hardware wird manuell gekauft. Mehrfachkauf ist optional, aber seine Kosten müssen der Summe der Einzelkäufe entsprechen.
- Produktion und Training hängen von verstrichener Zeit ab, nicht von der Bildrate.
- Einkommensänderungen durch Trainingsabschlüsse während eines Zeitintervalls korrekt berücksichtigen. Keine doppelte Zeitgutschrift beim Wechsel zwischen Hintergrund und Vordergrund.
- Für diesen Prototyp Offline-Zeit auf 24 Stunden begrenzen, mit transparenter Rückkehrzusammenfassung. Negative Zeitdifferenzen ergeben keine Gutschrift.
- Kein Prestige, kein Achievement-Multiplikator, keine Items, Gems oder Werbung in dieser Implementierung. Diese absichtliche Umfangsgrenze bedeutet: Ergebnisse sind nicht 1:1 mit dem umfassenderen 30-Tage-Modell vergleichbar.

### Visuelle Richtung
Eine stilisiert illustrierte Science-Fiction-Werkstatt. Dunkles Navy, warme helle Schrift, Cyan für Compute, Violett für Training, Gold für Meilensteine. Gute Kontraste und klare Zahlenhierarchie. Der Bildschirm soll wie ein Mobile-Spiel wirken.

Ein zentraler Hardwarebereich entwickelt sich visuell:
1. Kleiner Heimrechner ab 1 Block.
2. GPU-Aufbau ab 10 Blöcken.
3. Server-Rack ab 25 Blöcken.

Das sind drei Illustrationsstufen derselben aggregierten Hardwareklasse, keine drei unterschiedlich balancierten Generatoren. Erstelle dafür zusammengehörige eigene SVG-Illustrationen mit konsistenter Perspektive, Lichtführung und Formen. Keine Emojis als endgültige Hardware-Illustrationen und keine fremden Markenlogos.

Feedback:
- Kauf: kurze Druckreaktion, Lichtimpuls und begrenzte Partikel.
- Modellverbesserung: kleine Energiewelle und deutliche Levelanzeige.
- Hardware-Meilenstein: sichtbar stärkerer Effekt und Illustrationswechsel.
- Zahlen lesbar animieren; keine blockierenden Sequenzen bei normalen Käufen.
- Reduced-Motion-Einstellung unterstützen; Effekte abschaltbar.
- Partikelzahl begrenzen und Animationen bei versteckter Seite pausieren.
- Touch-Ziele mindestens 44 CSS-Pixel. Keine wichtigen Hover-only-Funktionen.
- Keine leeren Menüs für noch nicht implementierte Systeme.

### Speichern und Tests
- Automatisches lokales Speichern, Wiederherstellung nach Neuladen und expliziter Reset mit Bestätigung.
- Beschädigte oder inkompatible Saves dürfen keine weißen Bildschirme verursachen und nicht stillschweigend überschrieben werden.
- Meaningful Tests für Kaufkosten, unzureichendes Guthaben, mehrere Trainingsabschlüsse, Aufteilung eines Zeitintervalls, Zeitgrenzen und Save-Roundtrip.
- npm-Skripte für Entwicklung, Build, Tests und Typecheck.
- GitHub Actions prüft Installation aus Lockfile, Typecheck, Tests und Build auf Pull Requests. Noch keine automatische Veröffentlichung.
- Browser-Test bei ungefähr 390 x 844 und auf Desktop. Echte Gerätetests als noch ausstehend kennzeichnen, wenn sie nicht durchgeführt wurden.

### Dokumentation und Abgabe
Lege AGENTS.md mit diesen Arbeitsregeln an. Halte Regeln in docs/economy.md und visuelle Konventionen in docs/art-direction.md fest. Aktualisiere die README mit tatsächlichen Mac-Startbefehlen und fünf verständlichen manuellen Testschritten.

Erstelle einen Pull Request mit:
- sichtbaren Änderungen und verwendeten vorläufigen Regeln;
- tatsächlich ausgeführten Tests und deren Ergebnissen;
- Screenshots, falls Browserzugriff vorhanden;
- Anleitung zum lokalen Start und Test;
- bekannten Einschränkungen.

Keine Tests oder Screenshots als durchgeführt behaupten, die nicht ausgeführt wurden. Bei verfügbaren GitHub-Werkzeugen den PR tatsächlich öffnen; andernfalls den genauen verbleibenden Schritt nennen. Nicht selbst mergen.

## Quellen zur technischen Grundlage
- https://vite.dev/guide/
- https://capacitorjs.com/docs
