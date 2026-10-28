# Umsetzung des Bestandsaudits · laufender Auftrag

Ausgangspunkt: `5b6c3cf8`, [Audit](unity-presentation-audit-2026-10-27.md). Arbeitsbranch `codex/unity-rewrite`, Draft #155. Keine Balanceänderung, keine automatischen Übernahmen oder Löschungen von Spielerständen.

## 1. Nativer Unity-Startablauf

- [x] Eigene Einstiegsszene `Assets/Scenes/Boot.unity`, zuerst gerendertes Startbild, dann asynchrones Laden der vorhandenen Spielszene. Keine künstliche Wartezeit oder erfundene Prozentanzeige.
- [x] Originales Laborbild, vorhandene Fonts und Safe Area. Startsprache aus der Systemsprache, anschließend gespeicherte Spielsprache.
- [x] Tatsächlich initialisierten Spielstand abwarten. Bei nicht beschreibbaren Daten vorhandene Recovery öffnen; keine Belohnungen oder Saveoperationen im Bootcontroller.
- [x] Lokale/macOS- und iOS-Exportskripte verwenden denselben Szenenstart.
- [x] Unity6000.3.26f1 kompiliert; 3/3 gezielte PlayMode-Tests bestanden (5,24s): neuer Spielstand, unverändertes beschädigtes Original, englischer Save und echte320/390/430-Aufnahmen.390-Aufnahme selbst angesehen.
- [ ] Nativen Kaltstart im neu gebauten Player und physische iPhone-Safe-Area prüfen. Editoraufnahmen sind kein Gerätenachweis.

[Startbild390](media/unity-audit-followup/boot-en-390.png). Für Aufnahme wird der fertige Startzustand ausschließlich im Editor gehalten; normale Player schließen ihn sofort nach echter Initialisierung. Der vorangestellte Unity-Splash ist separat und unverändert.

## Weitere Abschnitte

- [ ] Restlokalisierung einschließlich technischer IDs und vollständiger Inhaltsübersetzung.
- [ ] Modelle, Challenges, Seasons, Shop-/Company-/Profilansichten und Einstellungen kompakt vereinheitlichen.
- [ ] Offenes Ergebnisfeedback und Analyseführung mit Mira.
- [ ] Persönliche Cloud und produktive Company-Anbindung; Zielanbieter nach Rücksprache: Apple iCloud/GameKit und Google Play Games Saved Games. Entwicklerkonten, Entitlements und Ende-zu-Ende-Gerätenachweise bleiben offen. Company benötigt weiterhin den eigenen verifizierenden Dienst.
- [ ] Vollregression, echte Bild-/Videoabnahme, Playerbuild, Push und Draftpflege.

## 2. Gemeinsame Darstellung, Übersetzung und Analyseführung (laufend)

- Gemeinsame höhenadaptive Labels und kompakte ActionCards; Größenberechnung nur nach Text-/Breitenänderungen. Bestehende Originalgrafiken, Aktionen, Safe Areas und Scrollinhalte erhalten. Modelle, Challenges, Shop und Einstellungen verdichtet; lange Erklärungen bleiben über Details erreichbar.
- Sieben Sprachvarianten für alle 41 Mira-Dialogkörper (einschließlich dreier neuer Analysehilfen), Originalnamen und dynamische Platzhalter geschützt. 84 Prestige-/Axiom-Knotentitel und zusätzliche Item-/Komponenten-/Shoptexte ergänzt. Zahlenformat der Darstellung folgt der Sprache; gemeinsame ursprüngliche Zahlenreferenz unverändert.
- Fehlende Sprachbindung bei dynamisch erzeugten Prefab-Elementen behoben. Sprachbindung und tatsächliche Übersetzung sind getrennte Kriterien; ausführliche Knoten-/Profiltexte sind weiterhin inhaltlich nachzuprüfen.
- Analyseplanung wird nach F02, Wiederholung nach F03 oder C02 erklärt. Keine Vorabfreischaltung. Hilfen sind in der Komponenten-/Analyseansicht auch bei abgeschalteter automatischer Story abrufbar. Keine Belohnungen. Vorhandene Dialoge werden nicht verdrängt.
- Neuer TS/C#-Referenzsatz: 8 Fälle; TS: 5 Tests; C#: 2 Tests grün. Echte manuelle Hilfe → atomare Datei → Weiter → Reload im PlayMode geprüft. Vorbereitete INT-Zustände ausdrücklich isolierte Teststände.
- PlayMode: 5/5 (76,05s), darunter 219 tatsächliche Seitenzustände in sieben Sprachen. Keine sichtbare interaktive Schaltfläche unter 44 logischen Einheiten in diesen Zuständen. Alle 36 Items verwenden unterschiedliche vorhandene Sprites. Diese Stichprobe belegt keine vollständige Inhaltsübersetzung und keine physische Geräteabnahme.
- Aufnahmehelfer warten auf die tatsächliche Lokalisierungs-/Layoutphase. Frühere mitten im Frame erfasste Rohtexte waren teilweise Messartefakte; echte fehlende Übersetzungen werden unabhängig davon ergänzt.
- Neue Bilder bei 320/390/430 und DE/EN sowie FR-Challenges und Mira-Analysehilfe geprüft. Modelle: kompakte Karten statt einzelner bildschirmfüllender Elemente. Challenges: menschlich lesbare Ziele statt technischer IDs. Mira: kurze Sprechblase mit internen Weiter-/Skip-Aktionen, Komponentenübersicht bleibt sichtbar.

Vollregression, neue Animationen, vollständige Inhaltsabnahme und nativer Kaltstart noch offen; keine Gesamtfertigmeldung.

## 3. Gespeichertes Abschlussfeedback und Plattform-Cloud

- Wiederverwendbarer, nicht interaktiver Abschlussbeleg für Training, Forschung, Analyse und Knoten-/Axiomverbesserungen; kurze Einblendung statt neuer bildschirmfüllender Effekte. Genau eine wiederverwendete Darstellung, daher keine unbegrenzten Effektobjekte oder Eingabesperren. Abbruch bei Navigation/Unterbrechung, statischer Zustand bei reduzierter Bewegung. Bestehende größere Schmiede-/Truhen-/Gumballsequenzen erhalten.
- Reale Abschlüsse erzeugen einen gebündelten Speicherpunkt; zusätzliche Abschluss-Speicherpunkte höchstens zweimal je Sekunde. Normale Transaktionen werden weiterhin sofort gesichert. Erst nach erfolgreichem atomarem Schreiben folgt kosmetisches Feedback. Fehler im kosmetischen Verbraucher können keinen erfolgreichen Commit in einen Speicherfehler verwandeln; eigener Fehlerfall geprüft.
- Echte 29-Sekunden-Unity-Aufnahme: frischer isolierter Stand, ursprünglicher Tap und tatsächlich bezahlter erster Rechner, anschließend das unveränderte 20-Sekunden-Einführungstraining. Keine Zeit-/Ressourceninjektion im Aufnahmetest. Echter 48-kHz-Stereospielton. Keine interpolierten Frames, Nachbearbeitung oder künstliche Verlangsamung. [Mitschnitt](media/unity-audit-followup/training-completion.mp4), Messwerte/Hash daneben. Editoraufnahme ist kein 60-fps-Gerätenachweis.
- Vollständiger EditMode-Lauf: **170/170**, 130,66s. Vollständiger PlayMode-Zwischenlauf: **124/125**, 668,31s. Einziger Fehler war die alte DE-Zahlenformat-Erwartung im englischen UI-Test; auf sprachabhängige Darstellung korrigiert, gezielt danach **3/3** grün. Nachfolgender Abschnittslauf **9/9**, 110,45s, einschließlich absichtlich fehlerhaftem kosmetischen Verbraucher, Reload, tatsächlicher Aufnahme, Sprachen und Cloud-UI. Abschließende vollständige PlayMode-Wiederholung bleibt vor Übergabe nötig.
- TypeScript: Typecheck grün; **1.949/1.949 Vitest**; Webbuild grün (bestehende Chunkgrößenwarnung). Keine Economywerte geändert.
- [Plattform-Cloud](unity-platform-cloud.md): sicherer manueller iCloud-Backup-/Preview-/Recoverypfad und echte GameKit-Systembrücke vorbereitet. Kein vorgetäuschter Plattformkontakt. Nutzer besitzt noch keine Entwicklerkonten; produktive Freigabe und Geräteabnahme dadurch offen. Androidprovider und automatische Cloudsync ausdrücklich noch nicht implementiert. Lokale automatische Speicherung davon unabhängig.

### Konkrete verbleibende Arbeit

- Ausführliche INT-/Axiomtexte und übrige Profil-/Mailbox-/Historieninhalte vollständig redaktionell übersetzen. 41 Dialogkörper und alle 84 Knotentitel fertig; nicht mit vollständiger Inhaltslokalisierung gleichsetzen.
- Quellproblem Forschungsplanung: aktueller ursprünglicher Tooltip verweist noch auf Legacy-`labs4`; Version2 schaltet den Direktor über F05 frei. Zahlen-/Regelquelle bleibt `src/economy.ts`; native Präsentation gezielt anhand tatsächlich wirkender Regeln berichtigen, keine Ersatzfreischaltung erfinden.
- Weitere Abholaktionen und Kontextanzeigen gegen echte Verbraucher prüfen; lange Detailtexte, dezimale Prozentwerte und aktive Navigationszuordnung erneut kontrollieren.
- Finalen vollständigen Regressionlauf, neuen nativen Player-Kaltstart und verbleibende visuelle Abnahme durchführen. Physisches Gerät und echte Cloud bleiben getrennte Abnahmen.

- Zusätzlich geprüft: 40/60 INT-Knotendetails und 24 Projekt-/Itemeffekttexte nun vollständig in sechs Zielsprachen zusätzlich zu Deutsch. 17/17 Lokalisierungsprüfungen grün; numerische Literale der 40 Knotendetails werden gegen den aktuellen Quelltext geprüft. Die übrigen 20 INT- und 24 Axiomdetailtexte bleiben der nächste Übersetzungsabschnitt.
