# Natürliche frühe Progression – 12. Oktober 2026

## Messstand und Reichweite

Basis ist `main` nach dem gemergten PR #87 (`deae257`); dessen Node-22-CI ist grün. In diesem Auftrag wurden **keine Spielparameter oder Domainregeln verändert**. Neue Messwerkzeuge, Ergebnisse und diese Entscheidungsvorlage bilden einen eigenen PR.

Acht echte `newGame`-Profile: je zwei Stunden, Seeds 1708/2026, kontinuierliches aktives Spiel oder kurze Sitzungen, jeweils Modell- oder Materialpriorität. Der endgültige gemeinsame Lauf dauerte **36,25 Sekunden**. Keine Wochen-/Monatskampagnen. Die ersten Instrumententwürfe wurden nach einem gefundenen Sitzungsgrenzenfehler und einer falschen Gleichsetzung von Anfragen mit Jobstarts verworfen; die gespeicherten Ergebnisse stammen ausschließlich aus dem korrigierten Lauf.

- Kontinuierlich: ein Tap pro Sekunde, maximal ein sichtbarer Drop pro Sekunde, bezahlte Entscheidungen alle zehn Sekunden.
- Kurze Sitzungen: zehn Minuten am Anfang, fünf Minuten bei Minute 60; insgesamt 15 Minuten online und 105 Minuten offline. Während Abwesenheit keine manuellen Käufe, Taps oder Drop-Claims. Rückkehrentscheidungen exakt am Sitzungsanfang.
- Hardware: je Entscheidung maximal ein regulärer Kauf, bester verfügbarer marginaler Credit-Ertrag pro Credit. Nach Prestige echte Autobuyer-Käufe nur nach regulär bezahltem Knoten und Schalter.
- Forschung: Data Generation bis Level 2, Model Architecture bis Level 1, dann das bezahlte Schlüsselprojekt Offene Baupläne. Diese begrenzte Projektliste ist ausdrücklich kein optimiertes Forschungsportfolio.
- Materialpriorität reserviert zuerst Data für eine bezahlbare erste Hardwareanalyse; anschließend Crafting/Analyse vor Modell/Forschung. Modellpriorität startet Modell/Forschung zuerst. Das sind unterschiedliche Entscheidungen, keine unterschiedlichen Stocks oder Formeln.
- Fertigung: erstes Impulsrelais, dann Quantenchip einschließlich regulärem Blueprint-Lernen und Modulherstellung. Danach bekannte erweiterte Rezepte. Dieser lineare Zielpfad untersucht noch nicht alle alternativen Itembuilds.
- Erster Prestige bei mindestens drei INT und freiem Analyseslot. Aktives Training darf dabei verfallen; Verlust und weiterlaufende Jobs sind protokolliert. Kein zweiter Reset in diesen Profilen.
- Keine Claims, Shop-/Ad-Käufe, künstlichen Ressourcen, gratis Forschung/Knoten, vorbereiteten Items, Forge, Salvage oder Challenges. Gem-Startbestand wird nicht ausgegeben.

**Bestätigter Startvertrag:** aktuell 50 Credits, null Hardware, null Data und 50 Gems. Deshalb ist der erste Taschenrechner schon bei t=0 bezahlbar. Ältere Beschreibungen eines Null-Credit-Tapstarts gelten für diesen Code nicht. Die Startgutschrift ist regulärer Spielcode, kein Mess-Grant. Eine gewünschte Rückkehr zum Nullstart wäre eine eigene Regeländerung.

`natural-progression-baseline.json` enthält Konfiguration, Seeds, exakte Ressourcenpaare, erfüllte und nicht erreichte Meilensteine, Resetverluste, bezahlte Domainereignisse, 10-Minuten-Checkpoints und bounded Trace-Samples. Die vollständigen internen Traces werden auf Sitzungstreue geprüft. Bloße blockierte Anfragen gelten nicht als bezahlte Starts. Buchungskosten werden aus Start-/Reservierungsereignissen gesammelt; automatische Hardwarekäufe gehen ebenfalls ein. Kein doppelter Crafting-Debit beim späteren Start eines schon reservierten Auftrags.

## Gemessene Zeiten

Die aufgeführten frühen Zeiten sind in beiden Seeds gleich. Entdeckte erweiterte Baupläne variieren; aus zwei Seeds folgt keine zuverlässige Dropverteilung. Beobachtungen offline haben bis zu zehn Sekunden Auflösung, manuelle Entscheidungen zehn Sekunden.

| Ereignis | Aktiv, Modell zuerst | Aktiv, Materialien zuerst | Kurze Sitzungen, Modell zuerst | Kurze Sitzungen, Materialien zuerst |
|---|---:|---:|---:|---:|
| Erster SBC | 3:30 | 3:30 | 3:30 | 3:30 |
| Erste bezahlte Hardwareanalyse | 7:30 | 6:30 | 7:30 | 6:30 |
| Erste Forschung gestartet | 10:40 | 11:00 | 60:00 | 60:00 |
| Heim-PC / Halbleiterfamilie | 11:20 | 15:40 | 60:00 | 60:00 |
| Erstes regulär gefertigtes Relais | 22:30 | 21:30 | 65:00 | 65:00 |
| Erster Anspruch auf 1 INT | 41:38 | 44:34 | Nicht erreicht | Nicht erreicht |
| Erster Anspruch auf 3 INT | 51:54 | 54:57 | Nicht erreicht | Nicht erreicht |
| Tatsächlicher erster Prestige | 57:30, **6 INT** | 56:40, **3 INT** | Nicht erreicht | Nicht erreicht |
| Server / Photonikfamilie | 115:50 | Nicht erreicht | Nicht erreicht | Nicht erreicht |
| Regulär gefertigter Quantenchip | Nicht erreicht | Nicht erreicht | Nicht erreicht | Nicht erreicht |

Zeitangaben sind Minuten:Sekunden ab Spielstart, **keine Versprechen für durchschnittliche Spieler**. Kontinuierlich zwei Stunden mit einem Tap pro Sekunde ist ein engagiertes Messprofil. Der Vergleich variiert Spielzeit, Taps, Drops, Entscheidungsmöglichkeiten und Resetfolge gleichzeitig. Er isoliert keinen einzelnen Tapmultiplikator.

Die Materialentscheidung ist bereits relevant: Relais eine Minute früher, aber Halbleiter vier Minuten zwanzig später und erster INT zwei Minuten sechsundfünfzig später. Das frühere tatsächliche Resetdatum der Materialpriorität ist kein allgemeiner Geschwindigkeitsvorteil: Die Pflicht, eine laufende Analyse abzuwarten, lässt das Modellprofil erst mit sechs statt drei INT zurücksetzen. Damit unterscheiden sich auch die anschließend kaufbaren Knoten. Die effektiven Tier-1-Knotenpreise stammen aus `prestigeUpgradeCost`, nicht aus den abweichenden beschreibenden `definition.cost`-Feldern.

## Konkrete Engpässe

**1. Bauplanfragmente blockieren den zweiten Fertigungsschritt.** Am Ende haben die aktiven Profile alle direkten Quantenchip-Materialien und genug Data. Es fehlen drei oder vier der vier Lernfragmente. Das Modul wurde im gewählten Pfad noch nicht hergestellt, weil Lernen zuerst geprüft wird; seine fehlende Instanz ist deshalb kein Beweis eines unzugänglichen Moduls. Die kurzen Sitzungsprofile haben zusätzlich echte Materialfehlmengen. Keines der acht Profile fertigt den Chip.

**Bestätigte Formel, ohne Geschwindigkeits-/Forschungsboni:** Hardware kurz dauert 600 Sekunden und gibt `1 × (600/14400) = 1/24` Fragment, mit dauerhaftem Bruchteilrest. Ein Fragment erfordert 24 Abschlüsse = vier Stunden Analysezeit; vier Fragmente 96 Abschlüsse = **16 Stunden**. Hardware lang liefert ein Fragment in vier Stunden. Kurze Hardwareanalysen kosten zusammen mehr Data, nicht weniger Zeit pro Fragment. Artefaktanalysen sind kein früher Fragmentausweg: zwei Fragmente in 24 Stunden, kurz entsprechend 1/6 Fragment in zwei Stunden; vier Fragmente entsprechen **48 Stunden** reiner Analysezeit. Zufallsfunde, Forschungsboni und spätere Geschwindigkeit können dies verändern. Es ist eine nachvollziehbare Basisrate, keine gemessene ETA mit allen Quellen.

Eine Dropchance von 1 % kann vor zugänglichen unbekannten erweiterten Rezepten ein Fragment liefern. Später entdeckt derselbe erfolgreiche Pfad zuerst einen neuen zugänglichen Bauplan statt eines weiteren Fragments. Entdeckung und bezahltes Lernen sind verschiedene Schritte. Sichtbar neue Rezepte müssen deshalb nicht unmittelbar nutzbar werden. In einem Modellprofil fehlt innerhalb von zwei Stunden auch der erste erweiterte Bauplan; ein fehlender Fund ist kein technischer Fehler.

**2. Passive Einstiegshilfe kommt im gemessenen Nutzungsmuster spät.** Mit 15 Minuten Eingabezeit ist nach zwei Stunden kein INT claimbar und der Einkaufsagent noch nicht verfügbar. Laufende bezahlte Jobs werden offline fertig, aber neue manuelle Investitionen starten nicht selbst. Das ist eine konkrete Beobachtung dieses Sitzungsplans. Es beweist weder einen defekten Offlinepfad noch die Notwendigkeit eines kostenlosen Autobuyers. Vor einer Mechanikänderung müssen Rückkehrfrequenz und Tapintensität getrennt verglichen werden.

**3. Data sammelt sich, während ein anderer Flaschenhals sperrt.** Aktive Profile enden mit etwa 876.082 bzw. 977.033 Data; kurze Sitzungen mit etwa 37.269 bzw. 61.276. Im Modellprofil werden 1.176.643 Data insgesamt gebucht, darunter 115.867 aus tatsächlichen Drops. 7.967 werden für Jobs bezahlt, 191.643 beim Prestige gelöscht, 977.033 bleiben. Die Bilanzabweichung aller Profile liegt unter 1,1e-14 relativ. Data aus Drops wird getrennt von passiver Produktion ausgewiesen.

Diese geringe Ausgabenquote rechtfertigt **noch keine globale Kosteninflation**: Der Controller stoppt absichtlich mehrere Forschungszweige früh und das Fragmentgate verhindert zusätzliche Crafting-Sinks. Zuerst breitere echte Forschungsportfolios und ein zugänglicher zweiter Crafting-Schritt messen. Sonst können erhöhte Data-Kosten aus einer künstlich eingeschränkten Ausgabenstrategie entstehen.

**4. Spätere Familien bleiben offen.** Photonik wird nur im aktiven Modellprofil erreicht. Frontier und Quantum werden in keinem Profil freigeschaltet. Das beweist keine Wochen-/Monatsplatzierung. Die ersten zehn bisherigen Materialien behalten ihre alten Quellzugänge; Familienfreischaltungen schalten insbesondere die neuen Materialien hinzu. Materialfamilie und aktueller Zugriff auf ein altes Material sind keine identischen Nachweise.

## Priorisierte nächste Entscheidungen – Vorschläge, nicht implementiert

### A. Einmalige Brücke von bezahlter Forschung zu erstem erweitertem Crafting

| Vertrag | Konkreter Vorschlag |
|---|---|
| Zweck | Das erste relevante Item nach dem Relais braucht eine planbare Beschaffungsentscheidung statt primär glückliche Drops oder 96 manuelle Kurzanalysestarts. |
| Freischaltung | Erster regulärer Abschluss des vorhandenen Schlüsselprojekts **Offene Baupläne** im Hauptspiel. Voraussetzungen, Projektkosten und Projektzeit bleiben erhalten. |
| Ressourcen/Kosten | Bestehendes bezahltes Forschungsprojekt; einmalig **4 bestehende Bauplanfragmente** als Kandidatenwert. Kein neues Item, keine neue Währung, keine kostenlosen Materialien/Module. Der Chip kostet weiterhin 4 Lernfragmente, 1.800 Data, echte Zutaten sowie den regulär gefertigten Compute-Bus. Die Fragmente dürfen auch für eine alternative bestehende Ausgabe genutzt werden. |
| Mathematische Wirkung | Additive, pro Account auf genau vier Fragmente begrenzte Brücke. Keine Änderung der späteren Drop-, Analyse-, Forge- oder Masterykurven. Forschungsbeschleunigung kann nur den ersten Zeitpunkt verschieben, nicht die Belohnung vervielfachen. |
| Resetvertrag | Permanenter verbrauchter Grant-Nachweis; Prestige/Axiom erzeugen keine zweite Auszahlung. Challenge-Forschungsabschlüsse vergeben keine Hauptspielbelohnung. Die echte laufende Hauptspielforschung darf während einer Challenge normal abschließen. Ein neues Savefeld erfordert versionierte Migration; bereits abgeschlossene alte Forschung wird als verbraucht übernommen, nicht automatisch nachvergütet. Eine etwaige Bestandskompensation wäre separat zu beschließen. |
| Automation | Gutschrift zusammen mit dem tatsächlichen Forschungsabschluss, auch offline; vorhandenes Abschlussfeedback. Kein neues Claimmenü. |
| Prüfverfahren | Online/offline/Reload exakt einmal; laufender und bereits abgeschlossener Legacy-Save; Doppelabschluss/Reset/Challenge-Isolation; tatsächliches Blueprint-Lernen und bezahlte Modul-/Itemkette. Dann dieselben Profile erneut messen. |

**Ungemessene Zielvorstellung:** Das erste zweite Item soll im aktiven Einstiegsrun nach Forschung erreichbar werden, grob zwischen Minute 45 und 90. Vier Fragmente sind ein zu prüfender Kandidat, kein bereits nachgewiesenes Optimum. Materialien, Data, Modulzeit und Forschungswahl bleiben konkurrierende Ausgaben. Spätere Rezepte, Meisterschaft und Sammlung behalten ihren Grind.

### B. Passive Kadenz untersuchen, bevor der Prestige-Anreiz verändert wird

Zunächst dieselben zwei Stunden mit gleicher Gesamt-Eingabezeit, aber häufigeren kürzeren Rückkehrfenstern messen, sowie mit gleicher Kadenz und weniger Taps. Kosten, Ressourcen und Resetregeln bleiben in dieser Messphase identisch; kein neuer Unlock und keine zusätzliche Automation. Echte Domain-Autobuyer bleiben ausschließlich regulär freigeschaltet und Credit-finanziert. Abnahme: Offlineaktionen ausgeschlossen, Fortschritt und Hardwareinvestitionen getrennt von Tap-/Dropzufluss, Zeitpunkt des ersten claimbaren INT ausdrücklich als erreicht oder unerreicht ausgewiesen.

Ein früherer Autobuyer wäre erst anschließend ein Mechanikvorschlag. Ein pauschaler kostenloser Käufer würde den Einkaufsagenten entwerten; ein zu niedrig gedeckelter Helfer wäre in den gemessenen ersten zehn Minuten bereits ausgeschöpft (46–48 Taschenrechner) und würde die spätere Wall kaum lösen.

### C. Breiteres Forschungsportfolio als vorhandenen Data-Sink prüfen

Nach A mit der bestehenden Zugangslogik mehrere tatsächlich sichtbare Projekte und höhere Grundlagenlevel auswählen. Keine zusätzlichen Währungen oder generellen Data-Nerfs. Forschungszeit bleibt `growth = 1,35`, Data-Kosten `growth = 1,85`, vorhandene Mindest-/Maximalzeiten bleiben. Die nächste Messung muss offenlegen, welches Projekt aus Kosten, Zeit und Wirkung gewählt wurde und welches deshalb warten musste. Reset und Budgetautomation folgen den vorhandenen Domainverträgen. Abnahme: Wirkungen gegen bezahlte Kosten, feste gespeicherte Endzeiten, Data-Bilanz und keine unbegrenzt sich selbst finanzierende Geschwindigkeitskette.

Erst wenn diese bestehenden Sinks wirklich genutzt werden, konkrete Preis- oder Produktionseingriffe isoliert vergleichen. Höhere Zahlen allein schaffen keine Buildentscheidung.

### D. Anschließend Midgame und Challenge-Kapitel

Nach dem funktionierenden zweiten Crafting-Schritt gezielt erster Server, erste Foundry und erster Challengeabschluss untersuchen; danach einzelne weitere Kapitel. Forge/Upgrade/Fusion/Salvage benötigen natürliche Beschaffungsprofile, nicht nur die vorhandenen vorbereiteten Domainbeweise. Mehrwöchige Karten-/Routine-, Forschungs- und Challenge-Platzierung bleibt ein späterer Auftrag mit separaten Messbudgets. Es gibt hier keinen Nachweis für 690 sinnvoll verteilte Langzeitstufen.

## Verifikation und Reproduktion

`timeout 180 npx vite-node --script scripts/natural-progression-baseline.ts docs/natural-progression-baseline.json`

Gemeinsamer Messwächter 180 Sekunden, pro Profil 45 Sekunden und maximal 7.200 simulierte Sekunden. Die Spielzeit wird durch echte `advance`-Aufrufe integriert, nicht durch eine Ersatzformel. Die Shellgrenze terminiert auch einen unerwartet blockierenden Prozess. Der normale Testlauf startet diese acht Profile nicht erneut.

**1.237/1.237 Standardtests**, Typecheck, Build und Diffcheck lokal grün. Acht neue Instrumenttests prüfen echten Start/Kauf, Sitzungsgrenzen, Rückkehr, vollständige Data-Bilanz, reproduzierbare Seed-Ergebnisse, Reload und begrenzte Horizonte. Keine neue Browserabnahme; Build mit bestehender Chunk-Größenwarnung. Lokaler Node 24; Node 22 ist die konfigurierte CI-Version. PR #87 wurde separat mit grüner Node-22-CI bestätigt.
