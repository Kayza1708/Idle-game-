# Gemeinsame V3-Verträge und noch offene Verbraucher

Dies ist eine Implementierungsinventur, **keine Freigabe**. Normale Spielstände sind noch nicht auf V3 umgestellt. „Rechenpfad“ bedeutet an `Game.Compute/Income/DataRate/WorkSpeed/KnowledgeRate` bzw. die entsprechenden TS-Funktionen angebunden und in isolierten Zuständen geprüft. Es bedeutet nicht, dass Erwerb, neue Zähler, Migration oder UI bereits fertig sind.

Bestätigte spätere Regeländerungen: [amendments.md](amendments.md), insbesondere linearer INT-Einkommensbonus10/16/22%.

## Itemfähigkeiten

| Nr. | Dauerhafte ID / Name | Tatsächlicher bisheriger V3-Pfad | Noch erforderlicher Vertrag |
|---:|---|---|---|
| 1 | `impulse-relay` | tatsächliche akzeptierte Taps, separater Zehnerbonus aus regulärer Produktion, eigener Crit×1,5; gespeicherter Exemplarstand modulo10 | vollständige V3-Dateimigration/Details; bestehende Animation bleibt kosmetisch |
| 2 | `quantum-chip` | Compute, H-Snapshot, Zweier-/Dreierkombination | natürliche Erwerbs-/Loadout-/Migrationsabnahme |
| 3 | `neural-asic` | Credits, M-Snapshot, Distilled-Kombination | gemeinsame Erwerbs-/Loadoutabnahme |
| 4 | `photonic-array` | Zweier-Lernkombination | bezahlter Trainingsabschluss, Forschungsarbeitsübertrag ohne Rekursion |
| 5 | `inference-router` | vorhandene gültige Links → globaler Compute | Start-/End-/Challengefälle im vollständigen Lauf |
| 6 | `burst-processor` | offen | gespeichertes Startfenster, Stärke, Ende und Combovertrag |
| 7 | `legacy-controller` | erste drei Klassen vor globalen Faktoren | vollständige Klassen-/Buildsuche |
| 8 | `sparse-decoder` | stabile Rangfolge vor Sparse/globalen Faktoren | alle Gleichstand-/Slotfälle |
| 9 | `photonic-matrix` | Compute und Daten bei aktivem Overdrive; kein weiterer direkter Revenuefaktor | zeitgeteilte Offline-/Start-/Wechselfälle |
| 10 | `quantum-coupler` | vorhandenes Linklimit, keine künstlichen Verbindungen | Intervall-/Challengeabnahme |
| 11 | `axiom-lattice` | Vorschaufaktor vor Abrundung, nur gültige aktuell gekaufte INT-IDs | bestätigter Reset und Migration |
| 12 | `entropy-sink` | Compute aus E-Snapshot, große Zahlen | E wird aus regulären Intervallen verbucht und am Axiomreset geleert; Import/Migration und lange Kurvenabnahme offen |
| 13 | `memory-crystal` | Credits aus D-Snapshot | D wird aus regulären Intervallen verbucht und am Prestige geleert; Import/Migration offen |
| 14 | `logic-seed` | Training aus tatsächlichen regulären bezahlten Q/E-Abschlüssen bei aktiver Ausrüstung; monotone IDs und Ursachen | vollständige V3-Save-Migration, Details und Erreichbarkeit |
| 15 | `tensor-core` | Compute aus M, optionale Modellupgrades im vollständigen Distilled-Build | gültiger Vieritem-Aufbau und Modellwechsel |
| 16 | `distillation-module` | tatsächliche Q/E-Ausgabekurve, logarithmischer Adapter | gemeinsame Schwellen-/Raritäts-/Migrationsabnahme |
| 17 | `curriculum-module` | Q/E-Schwelle vor Distillation verschoben | Kombination/Reload/Details |
| 18 | `long-term-memory` | Credits aus T-Snapshot mit weiter wachsendem Softcap | T zählt tatsächliche angerechnete Intervalle innerhalb der Offlinegrenze; vollständige numerische Split-/Wechselabnahme offen |
| 19 | `cryocontroller` | offen | Dauer am Overdrivestart speichern; alte Kappung nicht zusätzlich anwenden |
| 20 | `manufacturing-controller` | offen | bezahlte Komponenten, Rückgewinnungsreste und Gesamtprovenienz |
| 21 | `model-echo-core` | ursprünglicher Modellkern × ursprünglicher Revenuefaktor genau einmal potenziert | alle zehn Modelle/Slotwechsel und UI |
| 22 | `mnemonic-anchor` | Training aus tatsächlichen Modellupgradeleveln | alle Erwerbs-/Reset-/Wechselfälle |
| 23 | `insight-archive` | zukünftige INT-Gewichtung; V3-Lernen/Herstellen über bestehendes I04-/Research-Archive-Recht | vollständige Altimport-/Save-Migration und erreichbare V3-UI-Abnahme |
| 24 | `field-scanner` | tatsächliche bezahlte Analyseabschlüsse bei aktiver Ausrüstung; Live-Tempo mit S(A,25), W10 einmal | vollständige Save-Migration/Details; Bibliotheks-Dreierkombination separat |
| 25 | `lab-drone` | offen | Zusatzarbeit nur aus regulärer Laborarbeit; größtes Restlabor, stabile Gleichstände |
| 26 | `data-prism` | Daten aus F ohne doppelte Projektzählung | Auftrags-/Reset-/Detailsabnahme |
| 27 | `diagnostic-adapter` | offen | nur bezahlte einmalige Hardwarepakete, Restverwaltung |
| 28 | `experiment-controller` | offen | Bereichswechsel am bezahlten Start, gespeicherter Anfangsfortschritt |
| 29 | `precision-scanner` | offen | normalisierte Fokusgewichte und reduzierter Mengenabschlag am Start |
| 30 | `recycling-probe` | offen | irreversible Rare+-Zerlegung, Fraktionskonto statt zusätzlichem Zufallswurf |
| 31 | `blueprint-archive` | Forschung aus unterschiedlichen gemeisterten Bauplänen | unbekannte IDs ausschließen, vollständige Slot-/Erwerbsprüfung |
| 32 | `protocol-controller` | offen | neue Mindestdauer bei Erstellung; alte Bonuszeit entfernen |
| 33 | `photonic-analyzer` | offen | gültige Analyse-/Hardwarequellen, Snapshot und Fraktionen |
| 34 | `quantum-diagnostic-module` | offen | gleiche Quellregeln, kein Freischalten gesperrter Familien |
| 35 | `darklab-resonator` | Erkenntnis aus regulärer Datenrate ohne aktiven Overdrive | E-Zähler, Offlineintegration und echte Laborfreischaltung |
| 36 | `cycle-observatory` | Forschung aus tatsächlicher Resetanzahl ohne alten Zykluscap | mehrere echte Zyklen und Migration |
| 37 | Flottenkoordinator | noch kein freigegebener Katalogeintrag | Campuszugang, konkretes Rezept, Icon, Computeverbraucher |
| 38 | Gradientenspeicher | noch kein freigegebener Katalogeintrag | reguläre bezahlte Arbeit; begrenztes Budget und max. 50 % Startübertrag |
| 39 | Overdrive-Kondensator | noch kein freigegebener Katalogeintrag | bezahlter regulärer Forschungsabschluss, gespeicherte Bruchteile, max. eine Aktivierung |
| 40 | Synthesekoordinator | noch kein freigegebener Katalogeintrag | Synthesetempo aus selbst produziertem K, kein Verbrauchs-/Preisbonus |
| 41 | Singularitätslinse | mathematische ScientificNumber-Referenz, **noch kein Itemverbraucher** | dritter echter Zyklus, Rezept/Icon und Ausrüstung am reinen C |
| 42 | Axiomanker | noch kein freigegebener Katalogeintrag | gespeicherter Resetvertrag aus Ausrüstung vor echtem Reset, kein Importgeschenk |

Die sechs neuen Namen erhalten ihre endgültigen dauerhaften IDs zusammen mit den Rezepten. Die vorhandenen 36 IDs werden nicht umbenannt. Die Spezifikation ist der vollständige Zielkatalog; ein nur behaupteter 42er-Katalog ist kein Implementierungsnachweis.

## Globale Verstärker: Inventur

- Integration, T10, W05/W09/W10, A05, B03 und das aktive Modell einschließlich K10 werden ausschließlich auf die allgemeinen Basiswerte abgebildet.
- W10 ist die ausdrücklich neu beauftragte Ausnahme für einzigartige Fähigkeiten: getrennte effektive Fähigkeitsstärke `1,15P` und Exponentstärke `1,05Q`. Rohes P/Q und Kombinationen bleiben unverändert. Aktuelle Produktionsreferenzen enthalten einen W05/W09/W10-Zustand mit Integration 100.
- Die alte Itemwirkung `legacyLevelFactor` ist kein Bestandteil des neuen P. Die Instanzeigenschaft bleibt erhalten; ihre Migrationsbehandlung wird ausdrücklich dokumentiert.
- Bestehende V2-Legacy-Faktoren `item:compute`, `item:credits`, `item:research` sind bereits an die jeweiligen allgemeinen Basiswerte angebunden. Weitere erhaltene `item:*`-Faktoren müssen vor Aktivierung vollständig inventarisiert werden.
- **Wichtiger offener Befund:** Die aktuelle Legacy-Kompatibilitätslogik ordnet W01/W02/W06 zusätzlich einen gemeinsamen generischen Verstärkerpool von +0,40/+0,75/+1,25 zu. Diese vorhandenen numerischen Rechte dürfen weder unbemerkt verschwinden noch neue Fähigkeiten verstärken. Die eindeutige Abbildung auf Basiswerte samt Anzeige/Migrationsbeleg ist noch abzuschließen.
- Alte sekundäre/tertiäre Profile, Device-Boni und die fünf alten Kombinationen werden im experimentellen V3-Produktionspfad nicht zusätzlich angewandt. Die vollständige Suche nach weiteren direkten Verbrauchern bleibt Teil der Abnahme.

## Ereignisse und Auftragsgrenzen

| Vorgang | Eingang / gespeicherter Vertrag | Zeitpunkt der Wirkung | Ausschlüsse |
|---|---|---|---|
| Manueller Tap | akzeptierter Input, gespeicherter RNG und Exemplar-Zähler | direkt, vor kosmetischer Darstellung | abgelehnte/automatische Eingaben; no-items |
| Trainingsstart | eindeutige ID, Zahlung, Introflag, Ausgangsarbeitsanforderung, möglicher begrenzter Gradientübertrag | Zahlung und Anfangsarbeit atomar | kein Startübertrag für kostenlosen Introauftrag |
| Trainingsarbeit | reguläre bezahlte Arbeit getrennt von übertragenen/Bonusanteilen | Zeitschritt aus eingefrorenem Intervallzustand | keine Kopie von Übertrag/Introarbeit in neues Gradientbudget |
| Trainingsabschluss | gespeicherte ID und bezahlte Herkunft | genau einmal; Photonenausrüstung am Abschluss | Tutorial, Reload, Animation, erhaltene Level |
| Forschungsstart | ID, Kosten, Bereichswechsel, automatischer Startzähler, Anfangsfortschritt und Mindestdauer | beim erfolgreichen bezahlten Start | fehlgeschlagene Zahlung und doppelte Tickets |
| Forschungsarbeit | reguläre Arbeit aller belegten Labore, getrennte Drohnenarbeit | Zusatz an größte reguläre Restlaufzeit; stabil nach Slot | kein erneuter Übertrag aus Zusatzarbeit |
| Forschungsabschluss | ursprünglicher bezahlter Auftrag und Abschlussursache | genau einmal; Kondensator nur bei gültigem regulärem Abschluss | Intro, erneuter Claim, direkt erzeugte Skip-/Bonusarbeit darf keine unkontrollierte Kette bilden |
| Materialanalyse | bezahlte ID, Gewichte, Fokus, zulässige Garantie, sämtliche Ausbeutefaktoren | Startsnapshot; spätere Vergabe unveränderlich | Wechsel kurz vor Abschluss darf Ausbeute nicht neu würfeln |
| Herstellung | bezahlte Komponentenbasis je Exemplar, tatsächlich verwendete Kosten | Soforttransaktion; Rückgewinnung in derselben Transaktion | Shop-/Drop-/Tradeitems ohne Craftbasis |
| Fusion | drei gültige ausgewählte Exemplare und deren Provenienz | sofort; Provenienz und bisherige Rückgewinnung summieren | keine neue bezahlte Materialbasis aus dem bloßen Ergebnisrezept |
| Zerlegung | unwiderruflich entfernte ID, verbleibender Rückgewinnungsrahmen | einmal; Material- und Fragmentreste speichern | nie mehr als 90 % Originalbasis insgesamt; niedrigere aktuelle Quoten nicht still erhöhen |
| Prestige | bisherige Erhaltung und bezahlte laufende Verträge | D/T/A/Lernserie neu; keine Abschlüsse aus erhaltenen Leveln | keine Neubewertung alter Einnahmen |
| Axiomreset | entdecktes System, bestätigter Gewinn, Ausrüstung vor Reset | E/K/Zyklusverträge und Runzähler korrekt wechseln; Z genau einmal erhöhen | kein erster automatischer Reset, kein Gratisvertrag beim Altimport |

## Gemeinsame Prestigeabhängigkeiten

Rechenpfade für H06–H10/T07 und zukünftige INT-Gewichte sind vorhanden. F07-Neustartpreis, F08-Aktivitätsfaktor und F10-Forschungsskalierung sind an tatsächliche Verbraucher angeschlossen; W03/W04/W07/W08, Tap-/Overdriveverträge, Automationserklärungen, alle Quell-/Materialverbraucher sowie die vollständigen Modellsekundärfähigkeiten müssen noch einzeln geprüft bzw. ergänzt werden. Einzelne zentral vorhandene neue Werte gelten nicht als fertiger Verbraucher.

F02 bietet in der tatsächlichen aktuellen Quelle bereits sechs Plätze; die vorhandene Operationsforschung erweitert um zwei auf acht. Die neue Queueoberfläche erhält diese bestehenden Kapazitäten. Sie zeigt echte unbezahlte Pläne und schreibt keine fiktiven Reservierungen.

Die erste Axiomentdeckung prüft ausschließlich tatsächlich verdientes/beanspruchtes Zyklus-INT und 30 unterschiedliche gültige jemals gekaufte Knoten. Eine noch so große Vorschau reicht nicht. Das Domainereignis ist idempotent implementiert; Käufe sind vor Entdeckung gesperrt und B06 darf den ersten Reset nicht auslösen. Relative Automation ohne positiven Referenzgewinn pausiert auch bei Timeout; persistente Migration, vollständige semantische Sichtbarkeit und Mira-Anbindung sind noch offen.


### Produktionsbuchung: aktueller geprüfter Vertrag

D/E/T entstehen ausschließlich aus regulären angerechneten Simulationsintervallen. Der erste Auswertungssnapshot steht vor der neuen E-Buchung; die nächste Rate darf den Zuwachs im nächsten Intervall verwenden. Erkenntnis-Startgeschenke sind keine Produktion. Ein erneutes `Advance` auf denselben Zeitpunkt erzeugt keine zweite Buchung. D/T/Lernserie werden am normalen Prestige geleert; E/K erst am Axiomreset. Das K-Feld ist noch **nicht** an sämtliche zulässigen Komponentenproduzenten angeschlossen. Import-/Save-Migration, Bonusarbeits-/Provenienzverträge und vollständige numerische Gleichheit bei beliebigen externen Intervallteilungen bleiben vor Aktivierung offen.


## Erkenntnisarchiv: bestätigter Erwerbsvertrag

Der vorhandene Legacy-Mapper ordnet `researchArchive` bereits I04 („Forschungs-Erkenntnis“) zu. Für V3 gilt das erworbene Recht aus aktuellem I04, gültiger historischer I04-Ownership, vorhandenem Legacy-Blueprintrecht oder bereits gelerntem Rezept. Die bestehende Bauplanforschung bleibt nötig. Das ausdrückliche einmalige Lernen kostet weiterhin 0 Fragmente; es gewährt weder Item noch Ressourcen. Sofortherstellung benutzt unverändert die tatsächlich vorhandenen Material-/Modul-/Datenkosten. Geld allein oder fehlende Forschung reichen nicht; normale noch nicht migrierte Regeln bleiben unverändert.

Elf gemeinsame vorbereitete TS-/C#-Fälle prüfen echte Lern-/Herstellungstransaktionen, Zahlung und doppelte Lernaufrufe. Der TS-Fall enthält einen echten I04-Kauf und anschließenden tatsächlichen Axiomreset mit Item-/Bauplanerhaltung. Das konservative V3-Feld `archiveBlueprintRight` kann ein legitimes Legacyrecht halten; die echte Übernahme dieses Feldes aus älteren nativen/Web-Saves gehört zur noch offenen vollständigen Migration. Kein aktueller Import-/Reloadnachweis für V3 wird daraus behauptet.


## Trainingsereignisse und Lernserie

V3-Trainingsstarts erhalten erst nach erfolgreichem bestehendem Start/Zahlung eine eigene monotone Auftrags-ID. Der Abschlussmarker und die letzte Ursache sind getrennt von der runbezogenen Serie. Beide IDs bleiben über tatsächliches Prestige/Axiomreset erhalten; die Serie wird geleert. Kein wachsendes Set aller historischen Jobs nötig. Die53-Bit-Grenze betrifft technische IDs, keine Wallet oder Produktionsrate.

Nur ein wirklich abgeschlossener aktueller Auftrag mit ausgegebener kanonischer ID kann den Marker verändern. Doppelte/premature Aufrufe und unbekannte alte IDs gewähren keinen Effekt. Reguläre bezahlte Q/E-Abschlüsse bei aktivem Logik-Saat-Item erhöhen bei Wechsel bis10 oder halbieren bei gleichem Track abgerundet. Unequip behält die Serie und deren letzten gültigen Track; Abschlüsse ohne Item verändern sie nicht. Integration/Intro/Bonus/No-items geben keinen Serienfortschritt. Gem-Skip-Enden tragen ausdrücklich Bonusursache; normale Einführung Intro. IDs sind auch in den tatsächlichen Start-/Abschlussbelegen verknüpft.

Sechs gemeinsame vollständige TS-/C#-Folgen prüfen wirkliche Starts, Zahlungen, Zeitfortschritt, Tempo, unequip/equip, Integration, Intro, Gem-Skip und tatsächliche Resets. Zusätzliche Guards prüfen verfrühte, doppelte, falsch formatierte oder nicht ausgegebene IDs und No-items. Die Domainzustände können weiterhin nicht als unvollständiger V3-Save geschrieben werden; echte DTO-/Altvertragsmigration und V3-Datei-Reload stehen noch aus. Diese Prüfung ist kein vorweggenommener Persistenznachweis.

### C01 passive Produktion
V3-Faktoren×2/×3/×4 tatsächlich in passiver Hardwareproduktion; zentrale sieben Sprachtexte im verbundenen Netz, Stunden-/Grenz-/Guthabenparität über elf reale Komponentenfolgen. V3-Dateimigration und natürliche Entdeckungsführung bleiben offen.

### Feldscanner: reguläre Analyseereignisse
Run-Zähler steigt am tatsächlichen bezahlten Abschluss bei Ausrüstung, bleibt beim Ablegen bestehen und leert sich an beiden echten Resetarten. Abbruch/doppelte Anzeige/alte Introaufträge/No-items ausgeschlossen. Keine Beschleunigung der Synthese durch den nur für Analysen bestimmten Scannerfaktor.17gemeinsame tatsächliche Produktionsfolgen prüfen auch Ausrüsten während Auftrag, Ablegen vor Abschluss, Ablegen/Wiederanlegen, Zahlung und Resets. Vollständige V3-Speicherung und Details weiterhin offen.

### C06 und linearer INT-Bonus
Neue bezahlte Synthesen speichern ihren Ausbeutefaktor(1,5/2/3) in einem eindeutig zugeordneten Vertrag. Komponentenweise Bruchteilsreste, Kopierisolation und Erhaltung laufender bezahlter Synthesen an beiden echten Resetarten geprüft; spätere C06-Käufe bewerten nichts rückwirkend. Alte bezahlte Synthesen ohneV3-Beleg behalten Ertrag1. Industrielle Zweierkombination im Faktor vorbereitet; neue Katalogitems/Rezepte weiter offen. Neue sieben Sprachbeschreibungen und wahrer nächster ganzzahliger Syntheseertrag in tatsächlichen Details.

Nutzerergänzung29.10.: Einkommensbonus jetztlinear `1+cycleINTEarned×Satz`, Satz10/16/22%. AusgegebeneINT zählen, normalerPrestige erhältZyklus, Axiomreset leert. I10-INT-Gewinnanteil unverändert. Die ursprüngliche Exponentenforderung ist ausdrücklich ersetzt, siehe amendments.md.91Produktionsreferenzen bis10^1000INT plus23tatsächliche Komponenten-/Resetfolgen vergleichen unter anderem Einkommensfaktor und verdiente/freieINT. V3-Speicherung/Aktivierung weiterhin offen.

### W08 – ausschließlich bezahlte Materialproduzenten
Alter Fertigungs-/Schmiedetempofaktor im V3-Pfad entfernt. Bezahlte Analyse hält×2 beim Start im vorhandenen eindeutigen Ausbeutevertrag fest; alte Aufträge werden nicht nachträglich aufgewertet. Reguläre einmalige bezahlte Hardware-Meilensteinpakete werden vor Rundung verstärkt, vorhandene Bruchteile nicht verdoppelt. Allgemeine Zuschüsse/Shop/Handel/Erstattung/Zerlegung/passive Funde/Synthese bleiben unverändert; gesonderte Klassenupgrade-Extraauszahlungen sind keine erneuten regulären Meilensteine und bleiben ausgeschlossen. Der native Klassenkauf ist weiterhin ein getrenntes offenes Quellproblem.

Neuer Name/Verbraucherbeschreibung in sieben Sprachen, tatsächliche Analyse-Mengenanzeige einschließlich eingefrorenem Aktivauftrag angepasst.29tatsächliche Produktionsfolgen vergleichen auch laufenden Auftrag über Prestige, späteren W08-Kauf und unveränderte ausgeschlossene Quellen. Alle15Hardwareklassen/sechsMeilensteine mit vorhandenen Bruchteilen unabhängig geprüft. Normale64/24-Regeln unverändert.

Nächste konkret gefundene Abhängigkeit: beide tatsächlichen Challenge-Einstiegskonstruktoren erstellen frischen Zustand ohneItemV3-Flag. Vor vollständiger Freigabe neue Regeln in Shadow übernehmen, persönliche Zähler isolieren und Hauptspiel samt pausierten bezahlten Aufträgen verlustfrei wiederherstellen; monotone Trainings-IDs dabei nicht wiederverwenden. Keine Abnahme allein anhand früherer direkter No-items-Fixtures.


### Tatsächliche Challenge-Eintritts-/Rückkehrverträge
V3-Regelkennung über die echten Fabriken erhalten; neuer persönlicher Produktionsscope, dauerhafte Z-Historie/B05-Rekorde und legitime Entdeckungsrechte getrennt. Hauptspieljobs und -zähler bleiben pausiert. Nur monotone nächste Trainingsnummer zurückführen; niemals den Challenge-Abschlussmarker auf einen älteren bezahlten Hauptspieljob anwenden. Neue kopierte Relais haben eigenen Triggerstand0; Hauptitem unverändert. Fünf gemeinsame echte Start-/Arbeits-/Rückkehrfolgen, einschließlich aktiver/offliner Arbeit, Erfolg/Abbruch, doppeltem Claim und bezahlter Hauptspiel-Fortsetzung. Dateimigration und tatsächlicher V3-Reload bleiben separat offen.
