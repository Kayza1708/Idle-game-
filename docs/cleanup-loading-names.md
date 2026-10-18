# Bereinigung, Startbildschirm und Namensprüfung

Basis: main `d3040a98987dfe1eec4331f5654c5644ecf0a310` nach PR #125. Auftragsumfang: tatsächlich ungenutzte Dateien entfernen, einen zusammenhängenden Startbildschirm integrieren und familienfreundliche Namen deutlich zuverlässiger prüfen.

## Bereinigung

- 283 bisher verfolgte Dateien mit zusammen 37.673.359 Bytes entfernt. Der verschobene aktuelle Berichtstestzustand ist darin als alter Pfad enthalten; diese Zahl ist die Bruttoentfernung, nicht die Nettogröße des Diffs.
- 15 nicht zur Laufzeit verwendete Dateien aus `public` entfernt: acht WAV-Reserven, sechs alte Grafiken und das alte SVG-Favicon. Ihre 13.513.142 Bytes wurden zuvor von Vite unverändert mit ausgeliefert.
- Der unkomprimierte gesamte `dist`-Ordner sinkt von **53.589.508 auf 40.123.518 Bytes**, rund **25,1 %**. Das ist die Webpaketgröße, keine gemessene IPA-/Downloadgröße. Die neue Wortliste, Lizenzhinweise und Startoberfläche sind enthalten.
- Alte Grafiken: `components-atlas-v1.png`, `items-extension-atlas-v1.png`, `capsule-machine-v2.webp`, `early-lab-pixel-art.png`, `forge-workshop-v1.webp`, `pixel-lab-console.svg`. Aktuelle Atlanten, das freigegebene Logo, native Icon-Exporte und Schriften samt Lizenzen bleiben erhalten.
- Unbenutzte Komponenten `Hardware.tsx`, `HardwareSavingsGoals.tsx`, `NextGoalCard.tsx`, die getrennte Kugelberechnung `machineBallPile.ts` und der alte Kaufadapter `nativeCommerce.ts` entfernt. Der Test des alten Kaufadapters prüft jetzt die echte aktuelle Grenze. Der noch bestehende Tutorial-Zielverweis auf die entfernte Zielkarte zeigt auf die tatsächliche Aktionsfläche.
- Zwei unbenutzte JSON-Testbaselines, die alte Lockfile-Sicherung, 17 überholte Visualisierungs-/Prüfskripte, alte Videovorschauen und historische Ergebnisdateien entfernt. Historische Markdownlinks verweisen nicht mehr auf entfernte Dateien. Die verbleibenden 15 Screenshots belegen die aktuelle Oberfläche einschließlich dieser Änderung.
- Ungenutzte Imports, Variablen und Funktionsreste entfernt; 25 CSS-Selektoren und zwei Animationen für entfernte Oberflächen bereinigt. Die Zufallszahl-Reihenfolge des Kapselautomaten bleibt trotz entfernter, wirkungsloser Seltenheitsberechnung erhalten.
- `ROADMAP.md` und `NEXT_STEPS.md` ersetzen die doppelte historische Branch-Chronik durch einen aktuellen Stand und verbleibende Aufgaben. Frühere Inhalte sind über Git wieder auffindbar.
- CI führt für jeden PR dieselben Standardprüfungen aus. TypeScript weist künftig ungenutzte Deklarationen zurück; `check:assets` prüft 54 wörtliche Runtime-Dateipfade zusätzlich zu den Quellimporten. Dynamisch zusammengesetzte Pfade benötigen weiterhin ihre jeweiligen Domänentests.

Nicht entfernt: tatsächlich verwendete Regressionstests, Offline-/Kauf-/Werbe-/Save-Verträge, aktuelle Testfixtures und die Save-Migration/Wiederherstellung. Vier lange Kampagnentests haben weiterhin einen eigenen Befehl und GitHub-Workflow. Es wurden **keine Geräte-Spielstände gelöscht** und keine alten Migrationen durch einen stillen Neustart ersetzt. Der aktuelle anonymisierte Produktionsnachbau liegt passend zu seinem Verbraucher unter `src/testSupport/earlyReportedSnapshot.json`.

## Startbildschirm

Die statische HTML-Hülle zeigt das vorhandene Chip-Logo schon vor Download/Auswertung des Spielbundles. Während des tatsächlichen Save-Ladens übernimmt dieselbe Gestaltung als `LoadingScreen`; danach verschwindet sie ohne künstliche Mindestwartezeit. Dunkles Laborgitter, dezenter Lichtschein und eine laufende Verbindungslinie verwenden die bestehenden Farben. Keine erfundene Prozentanzeige.

Sechs Spieltipps wechseln alle fünf Sekunden, übersetzt in alle sieben vorhandenen Spielsprachen. Die Tipps beschreiben bestehende Hardware-, Modell-, Item-, Offline- und Herstellungsregeln. `prefers-reduced-motion` stoppt die Bewegung. Ein fehlgeschlagener Bundle-Start zeigt eine mindestens 44 px hohe Wiederholen-Schaltfläche; Save-Daten werden dabei nicht verändert.

![Ladebildschirm bei 390 px](screenshots/loading-screen.png)

## Namensfilter v2

- `src/moderation/blockedTerms.json`: **1.273 Einträge** in **zehn Sprachen**. Enthalten sind Englisch, Chinesisch, Hindi, Spanisch und Arabisch sowie Deutsch, Französisch, Portugiesisch, Italienisch und Polnisch.
- Grundlage: [LDNOOBW / Shutterstock und Mitwirkende](https://github.com/LDNOOBW/List-of-Dirty-Naughty-Obscene-and-Otherwise-Bad-Words), gepinnter Stand und Änderungen in [NOTICE](../src/moderation/NOTICE.md). Lizenz CC BY 4.0; Quellen und vollständiger Lizenztext werden mit der App ausgeliefert und in Einstellungen → Lizenzen zugänglich gemacht.
- Aus der Autocomplete-Liste wurden neutrale Identitätsbegriffe, gewöhnliche Wörter und mehrdeutige Namen ausgewählt entfernt. Umgangssprachliche Beleidigungen sowie zusätzliche Hindi-, Arabisch- und Chinesischvarianten ergänzt. Politische Namen und extremistische Parolen stehen separat in `reservedNames.json` und sind eine eigene, gepflegte Auswahl.
- Die bisherige Normalisierung löschte nichtlateinische Schrift vollständig. Die neue Prüfung erhält diese Schrift und insbesondere Hindi-Vokalzeichen. Sie berücksichtigt Unicode-/Breitenvarianten, Akzente, gängige visuell ähnliche Zeichen, Zahlentausch, getrennte Buchstaben, Groß-/Kleinschreibung, CamelCase, Wiederholungen und unsichtbare Zeichen.
- Kurze und mehrdeutige Wörter werden als ganze Wörter geprüft; nur gezielt ausgewählte starke Begriffe als Teil dekorierter Namen. Harmlose Namen wie Scunthorpe, Yoshito, Cassian und normale Namen in Hindi/Arabisch/Chinesisch bleiben erlaubt.
- KI- und Spielernamen verwenden denselben Validator an Eingabe- und Aktionsgrenze. Vor Anzeige eines geladenen oder importierten Spielstands werden inzwischen gesperrte Namen durch `AURA`/`Operator` ersetzt; alle übrigen Spieldaten bleiben erhalten. Abgelehnte Eingaben werden nicht als Profil-/KI-Name übernommen.
- Zusätzlich beim Browsertest gefunden: Namensänderungen waren nicht für sofortiges Speichern vorgemerkt. Namen, Importe und Einstellungen nutzen jetzt dieselbe explizite `savePolicy`; vorhandene Spielaktionen behalten ihren Speichervertrag. Ein gültiger Import schaltet erst nach erfolgreichem Parsen wieder auf beschreibbar.

Eine gepflegte Liste kann weder jede beleidigende Bedeutung noch jede politische Person oder jede Umgehung erkennen. Vor Leaderboards/Clans muss dieselbe Policy serverseitig ausgeführt und durch Moderation, Meldungen und Einsprüche ergänzt werden. Es wurde kein Online-Moderationsdienst oder sonstiges SDK angeschlossen.

## Abnahme

- Node 22: Typecheck einschließlich ungenutzter Deklarationen und Produktionsbuild bestanden. Die vorhandene Warnung über das große Hauptbundle bleibt bestehen.
- Browser: 320×568, 390×844 und 430×932; Start vor JS, nur eine Ladeoberfläche, tatsächliche verzögerte Save-Ladung, Tippwechsel, kein Seitenüberlauf, Reduced Motion, Ablehnung politischer/Hindi-Namen, gültiger Spielername mit tatsächlichem Speichern und Reload, Wiederholung nach fehlgeschlagenem Bundle-Download. [Protokoll](cleanup-loading-browser-results.json), reproduzierbar mit `scripts/cleanup-loading-audit.mjs`.
- Vollständige Regressionen: **1.843 Tests in 123 Dateien bestanden**. Ergänzende gezielte Prüfungen für Namens-/Speicher- und Challenge-Grenzen bestanden. Buildkennzeichnung für den überprüfbaren neuen Stand: **0.1.0-beta.10**.
- Keine echte iPhone-/WKWebView-Abnahme und keine neue Langzeit-Balancekampagne in diesem Auftrag.
