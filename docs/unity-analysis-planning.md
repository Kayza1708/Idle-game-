# Materialanalyse: Ausbeute, Übersicht und Nachtbetrieb

Stand 26.10.2026, Arbeitsbranch `codex/unity-rewrite`, Folgearbeit im offenen Draft #154. TypeScript und Capacitor bleiben erhalten. Keine Veröffentlichung, kein Merge, keine SDK-Integration.

## Bedienung

Szene `IdleIntelligence/Assets/Scenes/IdleIntelligence.unity`, Play. Unten **Schmiede**, dann **Komponenten**. Der bestehende kompakte Bestand zeigt alle 20 Komponenten; darunter die neue Analyseübersicht:

- Drei Analysefamilien mit Originalgrafiken, kurzer/langer Basisausbeute, tatsächlicher Laufzeit und Datenpreis. Die beiden Dauerbuttons starten sofort bei freiem Platz und reihen bei belegtem Platz ein, sofern die Queue freigeschaltet ist.
- Aktiver Vertrag mit Prozent und verbleibender Zeit; Abbrechen erstattet keine Kosten. Synthesis und Analyse belegen weiterhin denselben Platz.
- **Forschungspuffer**, 100 INT: sechs wartende Analysen. Eintrag mit × entfernen. Noch wartende Aufträge sind unbezahlt.
- **Forschungswiederholung**, 2.000 INT: Wiederholung an/aus; darunter Rezept durchschalten. Derselbe Zugang bleibt über Axiom C02 möglich. Der Knoten bietet einen direkten Sprung zu dieser Ansicht.
- Tatsächlich zuletzt gefundene Komponenten mit Originalicon und gewährter Menge; gespeichert und nach Reload verfügbar. Das ist kein Versprechen über die nächste zufällige Verteilung.
- Angezeigtes persönliches Offline-Limit. Das Spiel braucht nachts nicht geöffnet zu bleiben, solange Daten und gegebenenfalls geschützte Budgets ausreichen. Wartende Aufträge haben Vorrang vor Wiederholung.

Die existierenden Forschungsfunktionen F02/F03/F05 für Forschungsqueue, Wiederholung und endliche Forschungsziele bleiben erhalten. Die Queue- und Wiederholungssteuerung ist separat; einen laufenden Auftrag abzubrechen schaltet eine bewusst aktivierte Wiederholung nicht automatisch aus. Für eine Pause Wiederholung ausschalten und gegebenenfalls wartende Einträge entfernen.

## Regeln und Speichervertrag

Bewusst beauftragte Balanceänderung: Komponenten-Basisausbeute neuer Analysen ×2. Tabelle und Auswirkungen in `economy.md`; Kosten, Zeit, Fragmente, Itemchancen und Rezepte unverändert. Bereits bezahlte Aufträge behalten ihren Vertrag. Keine nachträgliche Erhöhung bereits gewährter Funde.

Unity-Save 24 ergänzt nur die unbezahlte Analysequeue und einen letzten Fundbeleg. Version 23 wird unter Originalschutz übernommen; Inventar, Ausstattung, Tutorial, Fortschritte und laufende Aufträge bleiben bestehen. Der letzte neue Fundbeleg beginnt bei alten Saves leer, ohne historische Ergebnisse zu erfinden. Beschädigte/ungültige Daten bleiben gesperrt. Alle Aktionen laufen über die vorhandene atomare Transaktion vor der Anzeige, nicht über Effekte. Challenge-Hauptspiel bleibt getrennt.

Der TypeScript-Queuepfad startet einen Folgeauftrag jetzt über die gleiche Zugang-/Datenprüfung wie manuell; Arbeit wird vor dem ersten Simulationsschritt registriert. Der letzte Fund bleibt auch beim Start des Folgeauftrags lesbar. Die gemeinsame C#-Referenzsuite prüft bezahlte Reihenfolge, Offlinefolge und Wiederholung einschließlich Datenkompression/Reserve.

## Prüfstand

- Typecheck erfolgreich; vollständige148Vitest-Dateien mit1.944/1.944Tests,329,66s; `npm run build` erfolgreich, bestehender Hinweis auf große Web-Chunks.
- Unity6000.3.26f1 importiert/kompiliert;147/147EditMode,124,35s; vollständiger erster PlayMode-Lauf113/113,529,90s. Abschlusslauf nach Ableitung aller UI-Platzzahlen aus den generierten Katalogen wird separat protokolliert.
- 235 tatsächliche TypeScript-Industrie-Referenzfälle, einschließlich neuer Analyseplanung/Wiederholung; keine reine Katalogzählung. Gezielte TS-Save-/Analyse-/Webtransfer-Prüfung35/35.
- Reale uGUI-Aktionen starten, reihen ein, entfernen, speichern, laden und schließen die Aufträge einmal ab. Der normale Spielerstand wird dabei nicht benutzt. Verglichen werden auch neun Stunden Abwesenheit gegen das unveränderte Acht-Stunden-Limit sowie die Datenreserve.
- Version23 mit laufender bezahlter12er-Analyse und Inventar bleibt erhalten; nach Migration immer noch12, Originaldatei und Backup bytegleich. Neue Analyse24. Manipulierte Webqueues/Fundbelege werden zurückgewiesen.
- 13unveränderte echte Unity-Kamerabilder, DE/EN320/390/430; alle selbst angesehen. Die provisorische abgeschnittene Fundaufnahme wurde durch korrekt ausgerichteten Scrollnachweis ersetzt. UI-Aktionen mindestens44logische Einheiten; die Analysebuttons bleiben beim Tick dieselben Objekte.

[Prüfdaten](unity-analysis-planning.verification.json), [Deutsch320](media/unity-analysis-planning/planning-de-320.png), [Englisch390](media/unity-analysis-planning/planning-en-390.png), [tatsächlich gewährter Fund](media/unity-analysis-planning/actual-receipt.png), [Bildmanifest](media/unity-analysis-planning/capture.json). Alle Testbilder verwenden einen ausdrücklich vorbereiteten, isolierten Zustand mit finanzierten Ressourcen und F02/F03; kein natürlicher Lauf bis2.000INT und kein physischer iPhone-Test. Keine neue Animation erstellt; daher kein künstlicher Animationsnachweis.

Visuelle Beurteilung: Originalgrafiken, drei klar getrennte Analysefamilien, einheitliche kompakte Dauer-/Kostenaktionen, ruhige Fortschrittsleiste und ein separater gespeicherter Fundbeleg. Auf320px bleibt die Bedienung lesbar; größere Queues scrollen. Nicht alle Bestandstypen und alle sechs wartenden Aufträge passen gleichzeitig auf einen Bildschirm. Die Vollständigkeit der Funktionen folgt aus getrennten Transaktions-/Referenztests, nicht aus den Bildern.

## Später / Grenzen

- Gezielte Komponenten-/Mengenziele und automatische Wahl geeigneter Analyse/Fokus: späterer Abschnitt. Aktuell wird ein gewähltes Rezept wiederholt; keine garantierte Auswahl eines einzelnen Materials.
- Keine Erhöhung der bestehenden Offlinekapazität.
- Originalgrafiken wiederverwendet, keine neuen Rasterassets oder Fremdlizenzen.
- Physisches iPhone, 60-fps-Gerätenachweis und native Hintergrundprozesse sind eigenständige Abnahmen. Editor und Simulator dürfen dafür nicht als Gerätenachweis gelten.

Web-Speichervertrag: Version 64 erweitert die erlaubten Queue-IDs um kurze/lange Rezepte. Version 63 bleibt als vollständiger v2-Spielstand erhalten und wird nicht durch den alten Prestige-Legacypfad geschickt. Expliziter Webimport behält weiterhin Original und normalisierten Datenstand; kein Zugriff auf bestehende Browser-/Capacitor-Saves bei normalem Unity-Start.
