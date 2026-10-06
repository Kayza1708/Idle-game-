# Auftrag 6: vorhandene Mechaniken bedienen

Basis: Main `9340b1a7ea17602cbdb6c2970453f2941975e89b`. PR #70 ist
bereits gemergt; Commit `1d3de7fbb81356fc8bf3c46f122844083a2cec6e` ist
nachweislich enthalten. Eigener Branch `codex/existing-mechanics-ui`, keine offene
PR-Abhängigkeit und keine Änderungen am Vorgängerbranch. Root, sauberer
Ausgangsarbeitsbaum und HTTPS-Origin `Kayza1708/Idle-game-` wurden geprüft;
`git fetch origin main` war erfolgreich.

## Ursachen und vervollständigte Aktionen

| Vorher | Jetzt / verbindlicher Domainpfad |
| --- | --- |
| Module waren nur Zutaten im Domainmodell, nicht herstellbar in der UI. | Eigenes Modulregister mit verfügbarem Bestand, noch reservierter Menge, vollständigem Mengenrezept, Dauer und tatsächlichen Verwendungsmöglichkeiten. `craftingAffordability` → `craftModule`. |
| Inventar zeigte nur die erste Instanz jeder Itemart. | Jede vorhandene Instanz ist mit eigener ID, Qualität, Level, Ausrüstung und tatsächlichen Bonusbeiträgen erreichbar. Ausrüstung prüft die bestehende Slotkapazität über denselben reinen Helfer wie die Transaktion. |
| Aufwertung und Fusion hatten keinen Bedienweg; Schmieden keinen Kostencheck in der Anzeige. | Gemeinsame reine Verbesserungs-/Fusionsvorschauen, vollständige Kosten, Ergebnis und konkrete Sperrgründe; `upgrade`, `forgeItem`, `fuseItems`. |
| Verbrauch war nicht vorab eindeutig. | Explizite drei Instanz-IDs, gesperrte/ausgerüstete Instanzen nicht wählbar, Bestätigung mit verbrauchten IDs und Resultat. Aufwertung, Schmieden und Zerlegen bestätigen Kosten bzw. Verbrauch ebenfalls. |
| Forschungsqueue war trotz `labs2` unsichtbar. | Reihenfolge, Zielstufe, Kapazität 2, konkrete Voraussetzung und Entfernen. Vormerken reserviert keine Daten; vorhandener Simulator prüft Ressourcen beim tatsächlichen Laborstart. Entfernung erfolgt nach Projekt-ID, damit ein inzwischen gestarteter Auftrag nicht den Index verschiebt. |
| Analysen boten ausschließlich Kurzverträge. | Hardware-, Architektur- und Artefaktanalysen jeweils kurz/lang über `analysisAffordability` / `analysisBlockReason` / `queueExperiment`; unabhängiger Slot und mögliche Funde als Chancen. |
| Werkstatt-KI öffnete Modell-/Trainingdetails statt Equipment. | KI öffnet den bestehenden Equipment-Dialog; Modell-/Trainingdetails bleiben über einen eigenen Button erreichbar. |
| Zutaten hatten nur beschreibenden Quellentext. | Fehlende Komponenten führen direkt zur vorhandenen Hardwareanalyse; Module direkt zu ihrem Rezept. Komponenteninformationen verlinken Analyse und aktive Drops. Gesperrte Quellen nennen SBC, Forschungsbauplan oder Prestige-Forschungsarchiv. |
| Interne Axiom-Navigation wurde von der Fußnavigation verdeckt. | Ursache war die globale `nav { position: fixed; bottom: 0; … }`-Regel. Sie ist auf `.bottom-nav` beschränkt. Interne Reiter bleiben im Inhaltsbereich; Touchziele ≥44 px, Safe-Area-Abstände und intern scrollbare Dialoge. |

Herstellung verwendet unverändert vollständige atomare Reservierungen; bereits
abgezogene Zutaten werden nicht nochmals gebucht. Die Anzeige reservierter
Bestände zählt nur noch nicht abgeschlossene Einheiten. Aktive und wartende Jobs
zeigen im vorhandenen `JobDetails` ihre gespeicherten Kosten/Reservierungen,
Startzeit, feste Endzeit und verbleibende Zeit. Wartende Craftingaufträge können
weiterhin mit der bestehenden vollständigen Erstattung abgebrochen werden;
aktiver Crafting-Abbruch wurde nicht neu erfunden.

Kosten und Freigaben werden beim Klick am aktuellen Zustand erneut geprüft.
Verbesserungsvorschauen sind rein, ohne Events, Zustandsänderung oder RNG.
Die unveränderten Schmiedeformeln wurden lediglich aus der Transaktion in den
geteilten Vorschauhelfer verschoben. Kein Saveformatwechsel, keine neuen
Ressourcen, Items, Rezepte, Freischaltungen oder Balanceparameter.
Wissenschaftliche Ressourcenvergleiche bleiben im reparierten Ledgerpfad;
Binary64-Mantissen bieten etwa 15–16 signifikante Dezimalstellen, keine beliebig
exakte Dezimalarithmetik.

## Reproduktion und kurze Abnahme

`src/existingMechanics.test.ts` benutzt die echten Domainfunktionen. Ein
Compute-Bus kostet 10 Schaltkreise und 250 Data zusätzlich zu seinen übrigen
Komponenten. Nach regulärem Abschluss wird genau dieser Bus im Quantenchiprezept
reserviert. Aufwertung/Schmieden ziehen die tatsächlich angebotenen Kosten ab.
Fusion verbraucht drei ausgewählte ungeschützte Instanzen und erzeugt eine neue
Instanz der nächsten Qualität; wiederholter Aufruf mit alten IDs bewirkt nichts.

`python scripts/browser-mechanics.py` prüft echte App-Klicks und danach den
IndexedDB-Spielstand. Technisches Setup: gültiger vorbereiteter Stand mit
`labs1/labs2`, erster Prestige, abgeschlossenem Forschungsbauplan, ausreichend
Materialien/Data und vier Quantenchips, davon einer ausgerüstet. Taschenrechner
und SBC werden im Setup regulär gekauft, zwei Labore regulär gestartet. Das ist
keine natürliche Progressions- oder Balancemessung. Die einzelnen gemessenen
Aktionen verwenden keine Debug-Grants. Browserzeit wird ausschließlich für den
regulären Modulabschluss um 61 Sekunden vorgerückt; Langverträge werden gestartet,
aber nicht über Stunden simuliert. Ein gesonderter armer vorbereiteter Save prüft
sichtbare Data-Fehlmengen und gesperrte Startbuttons.

Browsermatrix: Chromium, 360/390/430 × 844 px, jeweils Deutsch/Englisch.
Alle sechs Fälle prüfen Equipment, weiterhin erreichbares Training, Quellenlink,
Kurz-/Langstart, belegten Slot, Fehlmengen, Queue/Reload/Entfernen, Modulherstellung
und anschließende Rezeptreservierung, bezahlte Aufwertung/Schmieden, geschützte
Fusion und Axiom-Pointerhit inklusive tatsächlicher Navigation. Keine Pageerrors
und keine horizontale Seitenüberbreite. Ein Durchlauf dauert etwa eine Minute;
alle Suiten sind auf 300 Sekunden begrenzt. Kein physisches iOS-/Android-Gerät
getestet.

42 Screenshots der sieben Ansichten sind unter `screenshots/mechanics-ui/`
versioniert. Beispiele (weitere Dateien tragen denselben Breiten-/Sprachsuffix):

| Breite / Sprache | Module | Axiome |
| --- | --- | --- |
| 360 DE | [Bild](screenshots/mechanics-ui/modules-de-360.png) | [Bild](screenshots/mechanics-ui/axiom-de-360.png) |
| 360 EN | [Bild](screenshots/mechanics-ui/modules-en-360.png) | [Bild](screenshots/mechanics-ui/axiom-en-360.png) |
| 390 DE | [Bild](screenshots/mechanics-ui/modules-de-390.png) | [Bild](screenshots/mechanics-ui/axiom-de-390.png) |
| 390 EN | [Bild](screenshots/mechanics-ui/modules-en-390.png) | [Bild](screenshots/mechanics-ui/axiom-en-390.png) |
| 430 DE | [Bild](screenshots/mechanics-ui/modules-de-430.png) | [Bild](screenshots/mechanics-ui/axiom-de-430.png) |
| 430 EN | [Bild](screenshots/mechanics-ui/modules-en-430.png) | [Bild](screenshots/mechanics-ui/axiom-en-430.png) |

## Vorhandene Testabweichungen und tatsächlicher Prüfumfang

Auf unverändertem Ausgangscommit `9340b1a` separat nachgewiesen:
- `mobileFinalPass`: erwartet eine entfernte doppelte Hardware-UI-Formel.
- `mobileOverlayArchitecture`: erwartet native Forschungs-UI-Kostenprüfung.
- `analysis`: erwartet `1198` statt lokalisierter `1.198`; erwartet positive ETA
  ohne Hardware, obwohl die gemeinsame Vorschau dann korrekt `null` liefert.

Die Tests prüfen nun die gemeinsamen Domainvorschauen. Der ETA-Test behält den
Nullratenfall und kauft zusätzlich einen Taschenrechner regulär und bezahlt, um
eine positive ETA zu prüfen. Veraltete Kurzvertrag-only- und Drei-Inventarbereiche-
Assertions wurden durch Prüfungen beider realen Verträge und aller vier Bereiche
ersetzt. Keine Tests deaktiviert und keine Economy-Assertions abgesenkt.

Finale kurze Prüfungen mit Node 22.23.3:
- Typecheck: bestanden.
- 18 betroffene UI-/Inventar-/Crafting-/Forschungs-/Training-/Save-Dateien:
  234 Tests bestanden (davon 12 neue Domainregressionen).
- Analysesuite gezielt ohne den vierstündigen Abschlusslauf:
  15 bestanden, ein Langlauf bewusst nicht ausgewählt. Beide Vertragsstarts
  werden trotzdem in neuen Domain- und Browsertests geprüft.
- Browsermatrix: sechs Fälle bestanden, Screenshots erzeugt.
- Production-Build und `git diff --check`: bestanden. Bestehende Vite-Warnung
  für Hauptchunk über 500 kB bleibt sichtbar (rund 643 kB).

Kein pauschales `npm test`, keine Gesamtsuite, FAST-/DEEP-Kampagne oder
Langzeit-Balanceabnahme. Der vorhandene PR-Workflow startet sonst `npm test`;
`[skip ci]` im Commit verhindert die hier ausgeschlossenen automatischen Kampagnen.
Workflow und Runnerkonfiguration bleiben unverändert; lokale gezielte Prüfungen
sind kein vollständiger grüner CI-Nachweis.

## Mechaniken ohne realen Skalierungseffekt und offene Grenzen

- Trainingsrate ist unverändert 1. Trainingsboni von Items beschleunigen aktuell
  nichts. Das wird ausdrücklich angezeigt; Verbesserungsknöpfe ohne angewendete
  Bonusänderung sind gesperrt. Seltene sekundäre echte Effekte bleiben bedienbar.
- Impulsrelais vergütet fest jeden zehnten bezahlten Tap mit zwei Sekunden Credits;
  Erkenntnisarchiv gewichtet künftige berechtigte Einnahmen fest um +25 %. Rarität,
  Level und Schmiedegrad skalieren diese beiden Typbelohnungen derzeit nicht.
  Entsprechende wirkungslose Verbesserungen werden nicht als fertig angeboten.
- Module sind gegenwärtig Rezeptzutaten; ihr Bestand multipliziert Produktion
  nicht. Die Oberfläche nennt tatsächliche Verwendungen statt eines erfundenen
  Modulbonus. Dedizierte Modulillustrationen fehlen; das vorhandene geprüfte
  Werkbankmotiv wird verwendet. Alle Item-/Komponenten-/Analysegrafiken stammen
  aus den vorhandenen Zuordnungen, ohne neue Spritekoordinaten.
- Es gibt derzeit keine Iteminstanz-Reservierung durch einen Herstellungsauftrag:
  Rezepte reservieren Komponenten/Module/Data/Fragmente. Fusion schützt die
  tatsächlich vorhandenen Instanzsperren und Ausrüstung.
- Schicht-3-Referenzen bleiben 361 statt 313 sowie 57700 statt 59132. Keine
  Referenzkorrektur oder Parameteränderung hier; optionale Langzeitbalance offen.
