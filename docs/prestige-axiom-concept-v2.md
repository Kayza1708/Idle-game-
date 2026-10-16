# AI Singularity · Prestige, Axiome und geheimes Labor

> Freigegebener Planungsstand. Der aktuelle Code- und Testnachweis steht in [prestige-v2-implementation.md](prestige-v2-implementation.md); die folgenden Referenzprüfungen dokumentieren den damaligen Konzeptstand.

**Vollständiges Konzept v2.0 · 16. Oktober 2026**

60 unabhängige INT-Knoten · 24 Axiom-Knoten · 10 entwickelte KI-Modelle · alle 32 Audit-Befunde entschieden

**Verbindlichkeit:** Diese Fassung ersetzt v1 einschließlich dortiger Preis-, Slot-, Analyse-, Tap- und Resetregeln. Sie legt die Umsetzung fachlich fest. Es wurde noch kein Spielcode geändert und keine neue Pull Request erstellt. Die geprüften Referenzmodelle sind keine vollständige Simulation der bestehenden Economy. Spielzeiten sind deshalb Abnahmeziele, keine gemessenen Versprechen.

## 1. Das fertige System

Credits treiben Hardware und Training. Normales Prestige holt INT ab. INT kauft frei wählbare Verbesserungen und stärkt Credits über den erreichten Zyklusfortschritt. Bei 200k verdientem INT öffnet das geheime Labor: zufällige, aufwertbare KI-Modelle mit unterschiedlichen Stärken, genau eines aktiv. Ab 1e6 Zyklus-INT und 30 verschiedenen gekauften Knoten öffnet das erste Axiom die nächste Ebene. Axiome verstärken Credits dauerhaft, verbessern begrenzt den INT-Exponenten und übernehmen zunehmend die Wiederholungsarbeit.

Die frühe Ausrüstung darf niemals vom Glück an verschlossenen Slots scheitern: Prozessor, Core und Forschung sind von Anfang an frei; drei weitere feste Slots sind unabhängige, dauerhafte INT-Käufe. Für alle drei Familien existieren garantierte Starterrezepte. Ein dauerhaftes Schmiedelevel entfällt. Item-Level, Seltenheit und Integration bleiben verständliche, getrennte Verbesserungen.

Die wichtigsten Regeln:

- Ein Prestige-Knoten verlangt ausschließlich seinen INT-Preis. Keine Vorgänger, Achievement-Punkte, Challenge-Sterne oder Laborbedingungen. Verbindungen im Baum sind Orientierung.
- Hardware verlangt ausschließlich Credits. Autobuyer-Lizenzen schalten Automation frei, keine Hardwarekäufe. Challenges sind ausdrücklich gekennzeichnete Sonderregeln.
- Kosten und bereits geleistete Arbeit gehören zu bezahlten Aufträgen. KI-Wechsel verändern laufende Arbeitsgeschwindigkeit, keine bereits bezahlten Kosten oder notwendigen Grundarbeiten.
- Forschungsergebnisse, Ausrüstung, Labor, Erkenntnis und entwickelte Modelle bleiben beim Axiom erhalten. Normales Training wird neu aufgebaut. Zusätzliche reguläre Slots bleiben immer erhalten.
- Permanente Rechte werden entweder übertragen oder erstattet; niemals mit ihrer vollen Wirkung behalten und zugleich vollständig als Kaufbudget zurückgegeben.
- Große Zahlen werden wissenschaftlich gerechnet. Erträge dürfen weder von der Tickgröße noch von der Anzahl der App-Starts abhängen.

## 2. Freischaltung und verständliches Pacing

| Moment | Voraussetzung | Verbindliches Verhalten |
| --- | --- | --- |
| Start | Neuer Spielstand | 50 Credits Startkapital; drei freie Basisslots; Hardware manuell; ein Forschungslabor und eine Fertigungsstation. Crafting spätestens beim ersten Material-/Itemkontakt verfügbar, kein Prestige nötig. |
| Item-Einführung | Erster bezahlter Hardwarekauf oder erster Item-/Materialkontakt | Mira lehrt die ersten drei Rezepte und bietet einmalig fehlende Startermaterialien an; vorhandener Bestand wird angerechnet. |
| Normales Prestige | Mindestens 1 abholbares INT | Verlust-/Erhaltvorschau; alle 60 Knoten unabhängig sichtbar und ausschließlich nach INT bezahlbar. |
| Weitere Starter | Drei unterschiedliche Starteritems tatsächlich hergestellt | Die drei zusätzlichen Starterrezepte kostenlos lernen; keine Zufallsfragmente nötig. |
| Geheimes Labor | Erstmals historisch insgesamt 200.000 INT abgeholt | Dauerhafter Eintrag innerhalb Forschung. Einmalig 1.000 Erkenntnis für die erste zufällige entwickelte KI. |
| Erstes Axiom | Aktueller Zyklus: I ≥1e6 und ≥30 verschiedene entgeltlich erworbene Prestige-Knoten | Mira erklärt zuerst das bereits freigeschaltete Labor, dann Axiome. Keine künstliche Wartefrist und kein Zwang, die erste KI zu aktivieren. |
| Weitere Axiome | Einführung bereits abgeschlossen; I ≥T(A) | Keine erneute 30-Knoten-Sperre. Fünf Minuten Zyklusdauer nur für automatischen Axiom-Agenten. |
| Spätere Phase | Höhere Axiom-/INT-Erträge | Teure Endknoten, verankerte Agenten, KI-Sekundärfähigkeiten und langfristiger Ausbau. |

**Was „Hälfte des Baums“ bedeutet:** 30 von 60 unterschiedlichen Kaufentscheidungen. Die günstigsten 30 kosten zusammen **94.181 INT**, also 9,42 % der ersten Axiom-Schwelle. Das ist ausdrücklich kein Beleg für halbe Spielzeit oder halbe Macht. Die zusätzliche 1e6-Schwelle bestimmt die erste Meta-Phase. Kein Knoten erhält dafür eine neue Sperre. Bereits gekaufte und nach Axiom bekannte Knoten zählen beim ersten Entdecken nur einmal; automatisch erneut gekaufte Knoten erzeugen keinen neuen Entdeckungszähler.

**Pacing-Ziele für die spätere Vollsimulation:** erstes Prestige 60–120 Minuten bei regelmäßig aktiver Nutzung; alle drei Item-Familien sicher erreichbar, bevor das Labor zum Hauptziel wird; Labor nach mehreren Spieltagen; erstes Axiom ungefähr nach ein bis zwei Wochen regelmäßigen Spielens. Die frühen 30 Käufe sollen kein 30-Klick-Paket unmittelbar vor dem Axiom werden. Messgrößen sind reale Kaufzeitpunkte, genutzte Systeme und gewählte Builds. C0 und höchstens eine benannte Preisgruppe je Kalibrierung ändern; keine verdeckten Sperren als Reparatur.

Mira zeigt jeweils nur einen Kontextschritt. Labor und Axiom dürfen im Schnelllauf gleichzeitig berechtigt sein; die Tutorials werden in der Reihenfolge Labor → erste KI-Möglichkeit → Axiom erklärt. Das Starterbudget garantiert die Möglichkeit einer KI, ohne Spieler zum Kauf oder Warten zu zwingen.

## 3. Ressourcen, Multiplikatoren und Buchhaltung

### 3.1 Eindeutige Begriffe

A = insgesamt jemals verdiente Axiome; U_A = freie Axiome. I = in diesem Axiom-Zyklus abgeholte INT einschließlich ausgegebener INT; U = freie INT. P = investierte INT dieses Zyklus, also I=U+P für reguläre neue Spielstände. I_hist = lebenslang abgeholte INT zur Laborentdeckung. I_best = höchster abgeschlossener oder aktueller Zyklusstand I, einschließlich seines letzten Abholens unmittelbar vor Axiom. R = qualifiziert produzierte Credits dieses Zyklus. E_INT = fortgeschriebener, noch nicht ganzzahliger INT-Gesamtanspruch. Erkenntnis ist die separate Laborwährung. Q/E/G bezeichnen nur in Trainingsformeln Quality, Efficiency und Integration; E_INT wird nie als Effizienzlevel gelesen.

C0 = **765.100.329,5513278 Credits**, bewusst zunächst aus dem bisherigen Spiel beibehalten. I_hist, I_best, A und bereits entdeckte Systeme werden niemals durch Ausgeben verkleinert.

### 3.2 Genau eine Produktionskette

```text
Compute = Hardware-Rohcompute × Forschung × Items × Prestige × Axiom × aktive KI
Nutzer = Compute / Compute-pro-Nutzer × Efficiency × Forschungs-Nutzer × Item-Nutzer × KI-Nutzer
Credits/s = Nutzer × Revenue-pro-Nutzer × Quality × Forschungs-Revenue × Item-Revenue
            × Prestige-Revenue × (1+I)^a × Axiom-Revenue × gemeinsamer KI-Kern × KI-Revenue
            × zulässige zeitweilige Credits-Faktoren
Daten/s = 0,10 × Nutzer^0,55 × Forschungs-Daten × Item-Daten × Prestige-Daten × KI-Daten
```

Compute-pro-Nutzer und Revenue-pro-Nutzer behalten zunächst ihre Werte des bestehenden Core-Loops. Hardware-Basispreise, Wachstum und Rohleistung bleiben unverändert; Materialpflichten beim Hardwarekauf entfallen. Hardware-Meilensteine, Klassen-Upgrades und konkrete Item-Kombinationen gelten jeweils einmal in ihrer benannten Familie. Alte generische Besitz-, Lifetime-Daten- und Infrastrukturpfade werden nicht zusätzlich zu H07/H08/H09 weitergerechnet. Lebenslang erzeugte Daten geben keinen weiteren versteckten Creditsbonus.

Training und Forschung verbrauchen kein Compute. Ihr separater Grundgeschwindigkeitsbeitrag ist **1+0,03×log10(1+Compute/s)**. Ein Compute-Faktor wird nicht noch einmal als direkter Creditsfaktor gebucht. Der Revenue-Kern einer KI steht nur in Credits; K02 erhöht Nutzer und damit indirekt Daten; sein gemeinsamer Kern erhöht nicht nochmals die Nutzer.

### 3.3 Axiome verändern Credits und den INT-Exponenten

**M_A = (1+A)^[2+0,15×min(6,L_A02)] ×1,25^max(0,L_A02−6).**

**M_Compute,A = (1+A)^(0,05×L_A03)**, höchstens L_A03=5.

A02 erhält einen unbegrenzt kaufbaren Multiplikator-Nachlauf bei exponentiell steigenden Preisen; sein Exponent endet bei 2,90. Der alte zusätzliche +50-%-pro-Axiom-Pfad entfällt. Ausgeben von Axiomen senkt diese Faktoren nicht.

**p = 0,50+0,04×L_A01+0,02×[I10]**, maximal 0,72.

**INT-Creditsfaktor = (1+I)^a**, a=0,10+0,04×[I05]+0,04×[I10], maximal 0,18. Freie und ausgegebene INT wirken gleich; absichtliches Nichtkaufen ist keine Pflichtstrategie. Nicht abgeholter Anspruch wirkt noch nicht auf Credits.

### 3.4 INT wird beim Produzieren verdient

Bei jeder qualifizierten Creditsbuchung:

**ΔE_INT = F ×[(R_neu/C0)^p−(R_alt/C0)^p].**

Beide Potenzen verwenden denselben, zu dieser Buchung aktiven Exponenten und denselben Faktor F. Ein neuer Knoten wertet alte Credits nicht erneut aus. R und E_INT bleiben über normales Prestige erhalten.

**F = (1 +[I02]×min(1;0,02M) +[I03]×0,01×min(150;Q+E+G) +[I04]×0,02×min(100;N_F) +B_INT) ×(3 falls I09, sonst 1).**

M = in diesem Run erstmals tatsächlich bezahlte Hardware-Meilensteinkanten; N_F = Summe dauerhafter Forschungslevel plus abgeschlossene Einzelprojekte; B_INT=min(2; Summe effektiver ausgerüsteter int-yield-Bonusanteile). F ist damit höchstens **22,5**. Restaurierte Trainingslevel wirken in Q+E+G; restaurierte Forschung in N_F. Beides erzeugt keine neuen Abschlussereignisse. Meilenstein-Restore zählt niemals als neuer bezahlter Meilenstein.

**Abholbar = max(0;floor(E_INT)−I)**. Normales Prestige addiert diese Menge atomar zu I und U. Die neue größere I-Menge verbessert erst nach dem Abholen Credits. Ein Anspruch kann nicht ein zweites Mal abgeholt werden.

Qualifiziert sind tatsächlich produzierte passive Credits und angenommene reguläre Taps einschließlich ihres einmalig gebuchten Crit-/Proc-Ertrags. Nicht qualifiziert sind Startkapital, Refunds, Kompensation, direkte Geschenke, Kaufwiederherstellung und separat zurückgebuchte Rundungsreste. Keine zweite INT-Buchung aus bereits verbuchten Tap-Procs.

### 3.5 Axiom-Auszahlung

**T(A)=1e6×(1+A). Gewinn=floor(sqrt(I/T(A))).** Bei I<T(A) ist der Gewinn null. Erstes Axiom zusätzlich 30 verschiedene Knoten; spätere Axiome ohne diese Bedingung.

Beispiele: A=0 →1e6 INT; A=1 →2e6; A=9 →1e7; A=99 →1e8 für jeweils mindestens ein Axiom. Zehn Axiome in einem Reset benötigen 100×T(A). Die Schwelle verwendet A vor Auszahlung. Anschließend werden A und U_A um den Gewinn erhöht und I/U/P/R/E_INT gemeinsam auf null gesetzt. Historische Rekorde bleiben.

Ein manueller Axiom-Button darf noch abholbare INT in der Vorschau als **I_pot=I+abholbar** einbeziehen. Bestätigung führt erst Abholung, dann erneute Prüfung und Axiom-Reset als eine Transaktion aus. Abbruch verändert keinen Ledger. Normales Prestige und Axiom-Agent besitzen gegenseitigen Ausschluss; Axiom hat bei gleichzeitiger Berechtigung Vorrang.

### 3.6 Große Zahlen und Restwerte

Geld-/INT-/Axiom-/Erkenntniswerte und Kosten verwenden ScientificNumber plus gespeicherte Restwerte, keine JS-Number-Projektion für Vergleiche oder Abzüge. Für Aufträge, Kostenbelege und Ganzzahlauszahlungen werden integergenaue Belege geführt. Ein Mantissenpaar alleine kann nicht beliebig kleine Käufe von riesigen Konten exakt abziehen: nicht darstellbare Differenzen laufen in einem signierten Restledger mit; vor Grenzprüfung werden Kontostand und offene Reste gemeinsam normalisiert. UI-Rundung verändert keine Kaufberechtigung.

Für R>0 wird die Anspruchsdifferenz relativ berechnet: **ΔE_INT=F×(R/C0)^p×expm1(p×log1p(ΔR/R))**. R=0 hat einen gesonderten direkten Pfad. Keine Subtraktion fast gleicher großer Potenzen. Beträge unterhalb der Darstellungsauflösung werden akkumuliert. Bei einem Einheitenwechsel Sekunden/Millisekunden bleiben Erträge gleich. Zeiten werden als ganzzahlige Mikrosekunden und Restarbeit, nicht als gerundete Tickzähler, gespeichert.

Die beigefügten Decimal-Prüfungen zeigen das Verfahren auch für R=1e350 und ΔR=1e100. Sie ersetzen keine implementierte ScientificNumber-/Restledger-Prüfung mit Save/Load und Abzügen.

## 4. Alle 60 Prestige-Knoten

Fixe Einzelkaufpreise in INT. Jeder Kauf ist unabhängig; keine Zeile verlangt eine andere Zeile. H/T/F/W/S/I sind Bereiche, keine Reihenfolge. Ein noch nicht benötigter Bonus ist als spätere Wirkung markiert. Funktional enthaltene Grundfunktionen dürfen nicht nochmals kostenpflichtig gekauft werden: T10 enthält T04, I07 enthält I06; B04/B06 enthalten den grundlegenden Reset-Starter. Bekanntheit und neue entgeltliche Käufe werden getrennt gezählt.

### Hardware und Compute

| ID | Knoten | Einmalpreis INT | Vollständiger Effekt |
| --- | --- | --- | --- |
| H01 | Einkaufsagent I | 1 | Autobuyer für Taschenrechner und Einplatinencomputer. |
| H02 | Einkaufsagent II | 300 | Autobuyer für Heim-PC, Gaming-GPU und GPU-Rig. |
| H03 | Einkaufsagent III | 15.000 | Autobuyer für Server, Serverfarm und Rechenzentrumscampus. |
| H04 | Einkaufsagent IV | 150.000 | Autobuyer für Hyperscale-Cloud, Flüssigkeitskühlung und Untersee-Rechenzentrum. |
| H05 | Einkaufsagent V | 3e06 | Autobuyer für Orbitalzentrum, Mondkomplex, Dyson-Schwarm und Matrioshka-Gehirn. |
| H06 | Parallelrechner | 5.000 | Globaler Compute-Faktor ×1,50. |
| H07 | Hardware-Verbund | 80.000 | Compute-Faktor min(2; 1+0,01×Summe(sqrt(Stückzahl je Klasse))). Einmal anwenden. |
| H08 | Klassenvielfalt | 250.000 | Credits-Faktor 1+0,05×K, maximal ×1,75. K = aktuell besessene unterschiedliche Hardwareklassen. |
| H09 | Industrielle KI | 3e07 | Compute ×3; zusätzlich ×(1+0,02×J), maximal ×1,30. J = aktuell mit mindestens 500 Geräten besetzte Klassen. |
| H10 | Planetare Parallelität | 2e11 | Compute zusätzlich ×8. Erhöht Credits über die Nutzerkette, kein zweites direktes Revenue-×8. |

### Modell und Training

| ID | Knoten | Einmalpreis INT | Vollständiger Effekt |
| --- | --- | --- | --- |
| T01 | Qualitätsarchitektur | 2 | Nur der Quality-Revenue-Faktor hoch 1,10. |
| T02 | Effizienzarchitektur | 8 | Nur der Efficiency-Kapazitätsfaktor hoch 1,10. |
| T03 | Trainingsplan | 40 | Zwei manuell wartende Trainings zusätzlich zum aktiven Auftrag. |
| T04 | Integration | 250 | Dritte Trainingsrichtung. Numerische Item-Boni werden mit 1,005^Integrationslevel verstärkt; Grundlimit 200. |
| T05 | Trainingsbeschleuniger | 2.000 | Trainingsgeschwindigkeit ×1,50 für alle verfügbaren Richtungen. |
| T06 | Trainingsautopilot | 12.000 | Automatisch nach Zielleveln/Prioritäten trainieren; ein aktiver Auftrag. Gemeinsame Budgets und Resetabsicht respektieren. |
| T07 | Lernkurve | 100.000 | Credits ×(1+0,005×min(100;Q+E+G)). Erhaltene Level zählen für den Faktor, nicht als neue Abschlussereignisse. |
| T08 | Modellarchiv | 400.000 | Bewahrt Q/E/G und bezahltes aktives Training bei normalem Prestige; Axiom setzt Training zurück. |
| T09 | Hochleistungsinferenz | 3.5e07 | Revenue ×3; Trainingsgeschwindigkeit zusätzlich ×1,50. |
| T10 | Perfekte Integration | 1.6e11 | Integrationsbasis 1,007 statt 1,005. Schaltet Integration intern frei; T04 ist dann als enthalten markiert und nicht erneut kaufbar. |

### Forschung und Daten

| ID | Knoten | Einmalpreis INT | Vollständiger Effekt |
| --- | --- | --- | --- |
| F01 | Parallellabor I | 3 | Ein zusätzliches reguläres Forschungslabor. |
| F02 | Forschungspuffer | 100 | Manuelle Forschungswarteschlange von zwei auf sechs Plätze erweitern. Normaler Startbutton reiht bei vollen Laboren ein. |
| F03 | Forschungswiederholung | 2.000 | Ein gewähltes wiederholbares Projekt endlos wiederholen, soweit Budget und Resetregeln es erlauben. |
| F04 | Parallellabor II | 8.000 | Ein weiteres reguläres Forschungslabor, unabhängig von F01. |
| F05 | Forschungsdirektor | 30.000 | Bis zu drei unterschiedliche Forschungsziele mit endlichen Zielleveln/Prioritäten abarbeiten. Keine endlose Wiederholung; dafür F03. |
| F06 | Forschungsbeschleuniger | 60.000 | Forschungsgeschwindigkeit ×2 außerhalb des gedämpften Forschungsbonus-Pools. |
| F07 | Datenkompression | 180.000 | Datenkosten neuer Forschung ×0,85. Keine rückwirkende Erstattung. |
| F08 | Parallellabor III | 600.000 | Ein weiteres reguläres Forschungslabor. Basis 1 plus F01/F04/F08 plus gekaufte Zusatzlabore. |
| F09 | Autonome Wissenschaft | 3.5e07 | Forschungsgeschwindigkeit zusätzlich ×3; Datenproduktion ×4. |
| F10 | Wissenschaftliche Singularität | 8e10 | Forschungsgeschwindigkeit zusätzlich ×5; Datenproduktion zusätzlich ×8. |

### Items und Fertigung

| ID | Knoten | Einmalpreis INT | Vollständiger Effekt |
| --- | --- | --- | --- |
| W01 | Zusatzprozessor | 1.000 | Öffnet ausschließlich processorAux. Dauerhafte Infrastruktur, auch nach Axiom. Basis-Prozessor/Core/Forschung sind bereits frei. |
| W02 | Zusatz-Core | 10.000 | Öffnet ausschließlich coreAux. Kein Vorgänger nötig; dauerhaft über Axiom. |
| W03 | Gezielte Materialanalyse | 100 | Neue Analysen garantieren mindestens eine seltene Komponente. Fehlt im Ergebnis eine, genau einmal Graphen hinzufügen; auch bei rein häufiger Tabelle gültig. |
| W04 | Präzisionsfertigung | 500 | Material- und Datenkosten neuer Item-Level-Upgrades ×0,85, je Input aufrunden. Kein Rabatt auf Fusion oder Rezepterwerb. |
| W05 | Item-Verstärker | 3.000 | Numerische Boni ausgerüsteter Items ×1,10 auf den Bonusanteil. |
| W06 | Zusatz-Forschungssockel | 100.000 | Öffnet ausschließlich researchAux. Kein Vorgänger nötig; dauerhaft über Axiom. |
| W07 | Serienfertigung | 180.000 | Items/Module seriell ×3/×10/×100 planen; jede Einheit besitzt eigenen bezahlten Vertrag. Eine Fertigung, keine zusätzliche Schmiede. |
| W08 | Fertigungstakt | 500.000 | Arbeitsgeschwindigkeit von Crafting und Item-Schmiede ×2. Laufende Restarbeit profitiert, Kosten/Grundarbeit bleiben erhalten. |
| W09 | Resonante Ausrüstung | 2e07 | Numerische ausgerüstete Item-Boni zusätzlich ×2; keine Extra-Slots oder Triggerwürfe. |
| W10 | Perfekte Ausrüstung | 1e11 | Numerische ausgerüstete Item-Boni zusätzlich ×3; mit W05/W09 insgesamt ×6,60 vor Integration/KI. |

### Taps und Overdrive

| ID | Knoten | Einmalpreis INT | Vollständiger Effekt |
| --- | --- | --- | --- |
| S01 | Impulsverstärker | 3 | Roher allgemeiner Tapfaktor X ×1,50 vor 1+ln(X). |
| S02 | Kritische Impulse I | 30 | Crit-Chance +5 Prozentpunkte, Basis 5 % → 10 %. |
| S03 | Kritische Leistung I | 100 | Crit-Multiplikator +0,50, Basis ×2 → ×2,50. |
| S04 | Overdrive-Verstärker I | 2.000 | Overdrive-Faktor ×2: Basis ×3 → ×6. |
| S05 | Kritische Impulse II | 6.000 | Weitere +5 Prozentpunkte Crit-Chance. Mit S02 15 % vor KI-Sekundärfähigkeit. |
| S06 | Kritische Leistung II | 20.000 | Crit-Multiplikator zusätzlich +1. Mit S03 Basis ×2 → ×3,50. |
| S07 | Overdrive-Speicher | 100.000 | Overdrive-Dauer ×1,50: 15 → 22,5 Sekunden. Fester Mindestabstand zwischen Auslösungen bleibt 60 Sekunden. |
| S08 | Impulsnetz | 400.000 | Roher allgemeiner Tapfaktor X zusätzlich ×2; mit S01 ×3. |
| S09 | Overdrive-Verstärker II | 2.5e07 | Overdrive-Faktor zusätzlich ×1,50. Mit S04 ×9; ohne S04 ×4,50. |
| S10 | Singularitätsimpuls | 8e10 | Rohe Impulsenergie zusätzlich ×8 NACH 1+ln(X), vor gemeinsamer weicher Tapbegrenzung. Vorschau zeigt effektiven statt versprochenem pauschalem ×8-Ertrag. |

### INT und Wiederanlauf

| ID | Knoten | Einmalpreis INT | Vollständiger Effekt |
| --- | --- | --- | --- |
| I01 | Kommerzialisierung | 4 | Eigener Revenue-Faktor ×1,25. |
| I02 | Meilenstein-Erkenntnis | 40 | INT-Ertragsgewicht +0,02 je erstmals in diesem Run bezahlter Hardware-Meilensteinkante; Beitrag maximal +1. |
| I03 | Modell-Erkenntnis | 200 | INT-Ertragsgewicht +0,01×min(150;Q+E+G). Erhaltene Level wirken weiter; keine neue Auszahlung durch Restore. |
| I04 | Forschungs-Erkenntnis | 1.500 | INT-Ertragsgewicht +0,02×min(100;summe Forschungslevel+erledigte Einzelprojekte). Dauerhafte Forschung bleibt im Faktor erhalten. |
| I05 | INT-Rückkopplung | 5.000 | Exponent a des INT-Creditsfaktors von 0,10 um +0,04 erhöhen. |
| I06 | Prestige-Agent | 25.000 | Auto-Prestige nach Mindest-INT, Mindestlaufzeit und Warten nur auf bereits laufende ausgewählte Jobs. Minimaler bezahlter Taschenrechner-Wiederanlauf enthalten. |
| I07 | Relatives Prestige-Ziel | 180.000 | Zusätzlich Ziel ×2/×5/×10 gegenüber letztem positivem Prestigegewinn; optionale feste Zeitobergrenze. Grundagent enthalten; I06 dann nicht erneut kaufbar. |
| I08 | Erkenntnisverdichter | 800.000 | Erkenntnisproduktion ×2. Vor Labor kaufbar, dort als spätere Wirkung angezeigt. |
| I09 | Tiefe Erkenntnis | 6e07 | INT-Ertragsgewicht zusätzlich ×3 ausschließlich für künftige qualifizierte Credits. |
| I10 | Rekursive Erkenntnis | 3e11 | INT-Exponent p +0,02; INT-Credits-Exponent a zusätzlich +0,04. Gesamtgrenzen p=0,72 und a=0,18. |

Die Summe aller 60 Einzelpreise beträgt **920.212.229.181 INT**. Die letzte Hardware-Autobuyergruppe kostet 3e6 INT; alle fünf zusammen 3.165.301 INT. Ohne Axiom gibt es keine künstliche Kaufsperre für Endknoten. Ihre wirtschaftliche Erreichbarkeit wird über gemessene Zeiten abgestimmt.

H02 bedient intern pc/gpu/rig, H03 server/farm/campus, H04 cloud/liquid/subsea, H05 orbital/lunar/dyson/matrioshka. Anzeigenamen können kürzer sein; die Klassenzuordnung ist verbindlich. H01 bedient calculator/sbc.

**Endkäufe:** H10 ×8 Compute für 2e11; S10 ×8 rohe Tapenergie nach dem Logarithmus für 8e10; W10 ×3 numerische Itembonusanteile für 1e11; T10 Integration 1,005→1,007 für 1,6e11; I10 verändert die begrenzten Exponenten für 3e11. Bei G=100 erhöht T10 den Integrationsfaktor um ungefähr ×1,220; bei G=300 um ×1,816. Diese Effekte sind bewusst buildspezifisch. Gleiche Kaufwerte werden nicht behauptet; die frühere offensichtliche ×10.000-Dominanz wird entfernt. Vorher-/Nachherwerte zeigen stets den tatsächlichen Endeffekt.

## 5. Alle 24 Axiom-Knoten und sämtliche Preise

Jeder Axiom-Knoten ist ohne Vorgängerknoten kaufbar, sobald genügend freie Axiome vorhanden sind. Stufen eines Knotens werden intern nacheinander gekauft. Kostenlisten sind **Preise der einzelnen nächsten Stufen**, keine kumulierten Summen. Alle Stufen bleiben dauerhaft erhalten.

| ID | Knoten | Einzelpreise in Axiomen | Effekt |
| --- | --- | --- | --- |
| A01 | Axiom-Resonanz | 1 / 3 / 9 / 27 / 81 | p je Stufe +0,04: 0,50 bis 0,70; mit I10 höchstens 0,72. |
| A02 | Ökonomisches Fundament | 2 / 6 / 18 / 54 / 162 / 486 / danach 1.458×3^(L−7), L≥7 | Stufen 1–6 erhöhen Exponent von (1+A) je um 0,15: 2 bis 2,90. Ab Stufe 7 zusätzliche Multiplikatoren ×1,25 je Stufe, keine weitere Exponentenerhöhung. |
| A03 | Permanente Parallelität | 4 / 12 / 36 / 108 / 324 | Compute ×(1+A)^(0,05×L), maximal L=5. |
| A04 | Kritische Resonanz | 3 / 9 / 27 / 81 | Crit-Multiplikator ×1,15 je Stufe, maximal vier Stufen. Gemeinsame weiche Tapbegrenzung bleibt wirksam. |
| A05 | Integrationskapazität | 5 / 15 / 45 / 135 | Integrationslimit +25 je Stufe bis 300; zusätzlicher numerischer Itemfaktor ×1,02 je Stufe auch unterhalb des Limits. |
| A06 | KI-Kernverstärkung | 8 / 24 / 72 / 216 / 648 | Gemeinsamen Revenue-Bonusanteil der aktiven entwickelten KI ×1,08 je Stufe. Wirkt bei allen zehn Modellen einschließlich K10, niemals auf Slots. |
| B01 | Verankerte Einkaufsagenten | 1 | Bereits erworbene H01–H05 bleiben über Axiom aktiv und gekauft. Keine neue Gruppe wird kostenlos entdeckt. |
| B02 | Verankerte Steuerung | 2 | Bereits erworbene T03/T06/F02/F03/F05/I06/I07 inklusive Minimalstarter bleiben über Axiom erhalten. |
| B03 | Ausrüstungsresonanz | 3 / 9 / 27 | Numerische ausgerüstete Item-Boni zusätzlich ×1,10 je Stufe. Slotgedächtnis entfällt, weil reguläre Slotkapazität immer dauerhaft ist. |
| B04 | Wiederaufbauplan | 5 | Bereits bekannte INT-Knoten nach gespeicherter Reihenfolge oder günstigstem Preis wieder kaufen; Budget/INT-Sparziel beachten. Grundagent und bezahlter Minimalstarter enthalten. |
| B05 | Beschleunigter Wiederaufbau | 4 / 12 / 36 | Trainingsgeschwindigkeit unterhalb des beim letzten Axiom gespeicherten Rekords ×2/×4/×8. Keine kostenlosen Level oder neuen Abschlussereignisse. |
| B06 | Axiom-Agent | 25 | Auto-Axiom nach Mindestgewinn, mindestens fünf Minuten Axiom-Zyklusdauer und ausgewählten Job-/Laborregeln. Erstes Axiom manuell; Starter und grundlegende Abholung enthalten. Technische Portionsgrenze ist niemals eine Ertragsgrenze. |
| C01 | Komponentenarchiv | 2 / 6 / 18 | Passive Komponentenmenge +25 % je Stufe bis +75 %. Restmengen speichern, keine zusätzlichen Zufallswürfe. |
| C02 | Analyseplaner | 3 | Gewählte Analyse automatisch wiederholen. Absolutes Datensparziel und vorgemerkten Reset respektieren. |
| C03 | Fertigungsplaner | 5 | Gewähltes Rezept bis Zielbestand 1/5/10 herstellen. Aktive und reservierte Outputs mitzählen; jede Einheit genau einmal bezahlen. |
| C04 | Fusionsplaner | 12 | Explizit erlaubte Duplikate bis Zielseltenheit fusionieren. Nie gesperrte/ausgerüstete Items verwenden; kein automatisches Zerlegen. |
| C05 | Materialkreislauf | 8 / 24 / 72 | Rückgewinnung tatsächlich gebundener Inputs +5 Prozentpunkte je Stufe, von 60 % auf maximal 75 %. Keine Modell-Salvage-Wechselboni. |
| C06 | Hochleistungsfertigung | 10 / 30 / 90 | Crafting-/Schmiedegeschwindigkeit ×(1/0,85)^L, maximal drei Stufen. Dynamische Restarbeit, keine Änderung bezahlter Inputs. |
| D01 | Erkenntnisresonanz | 2 / 6 / 18 / 54 / 162 | Erkenntnisproduktion zusätzlich ×(1+A)^(0,15×L), maximal fünf Stufen. |
| D02 | Effiziente KI-Entwicklung | 3 / 9 / 27 / 81 | Kosten eines KI-Level-Upgrades ×0,90 je Stufe. Keine Freischaltpreisrabatte und keine rückwirkenden Refunds. |
| D03 | Erweiterte KI-Entwicklung | 5 / 15 / 45 / 135 | Modell-Maximallevel +5 je Stufe von 30 bis 50. Zusätzlich gemeinsamer aktiver KI-Revenue-Bonusanteil ×1,02 je Stufe; dadurch nicht nur ein ferner Grenzkauf. |
| D04 | KI-Einsatzplan | 10 | Ein aktives Modell nach Ereignissen automatisch wählen: normaler Neustart, Beginn geplanter Forschungs-/Materialphase. Nie zwei Modelle aktiv. Freie manuelle Auswahl und Loadouts sind Basisbedienung. |
| D05 | Modell-Item-Kopplung | 25 | Gemeinsamen KI-Revenue-Bonusanteil mit min(1,50;1+0,20×(b^G−1)) verstärken. Ausschließlich Integrationslevel verwenden; keine rekursive Abhängigkeit vom KI-Itembonus. |
| D06 | Vertiefte KI-Fähigkeiten | 30 | Feste zweite laufende Fähigkeit des einen aktiven Modells freischalten. Keine Startkosten-/Grundarbeitsrabatte und keine zweite aktive KI. |

Alle ausdrücklich aufgelisteten Basisstufen zusammen kosten **3.652 Axiome**, einschließlich A02 bis Level 6. A02 kann darüber hinaus unbegrenzt ausgebaut werden. Die Kosten ab Level 7 lauten 1.458 / 4.374 / 13.122 / 39.366 / …; jede Stufe gibt zusätzlich ×1,25 Credits. Es gibt kein unbegrenzt wachsendes p und keinen unbegrenzt wachsenden Axiom-Exponent.

**Bezahlbare Vergleichsprofile für neue Spielstände ohne Alt-Lizenzen:**

| Insgesamt A | Gekaufte Vergleichsstufen | Ausgegeben | Übrig | M_A | Compute-Axiomfaktor | p ohne I10 |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | A01=1 | 1 | 0 | 4 | 1 | 0.54 |
| 10 | A01=2; A02=1; A03=1 | 10 | 0 | 173.38 | 1.1274 | 0.58 |
| 100 | A01=3; A02=3; A03=3 | 91 | 9 | 81393 | 1.9982 | 0.62 |
| 1000 | A01=5; A02=5; A03=5 | 847 | 153 | 1.7832e+8 | 5.6248 | 0.70 |

Diese Profile dienen ausschließlich zum isolierten Multiplikatorenvergleich. Sie kaufen keine zusätzlichen Komfortfunktionen und sind keine angeblichen vollständigen Spielstände. Wer Planer kauft, kann dieselben Axiome nicht gleichzeitig in den obigen Verstärkern ausgeben. Nach dem ersten Axiom ist A01 für 1 sofort erreichbar; zusätzliche Slots bleiben unabhängig von B-Käufen erhalten.

## 6. Geheimlabor und zehn fähigere KI-Modelle

### 6.1 Laborwährung und Ziehungen

Labor dauerhaft entdeckt ab I_hist≥200.000. Im Forschungstab erscheint eine eigene Laborkarte. **Erkenntnis/s = 0,002×sqrt(max(I;0,02×I_best))×(2 falls I08)×(1+A)^(0,15×L_D01).** Produktion startet erst nach Entdeckung, online wie offline innerhalb des Zeitbudgets. Keine rückwirkende Produktion vor Laborentdeckung. Der 2-%-Rekordboden verhindert Stillstand nach Axiom; aktuelle Zyklusleistung bleibt wesentlich stärker.

Einmalige Laborquittung `mira-lab-seed-v2`: 1.000 Erkenntnis, atomar mit Entdeckung gespeichert, auch bei einem Bestandsaccount ohne diese Quittung. Erkenntnis wird bei normalen oder Axiom-Resets nicht gelöscht. Ausgeben von INT oder Erkenntnis senkt nicht den Grundwert I.

Bei k bereits entwickelten Modellen kostet das nächste **ceil(1.000×2,2^k)** Erkenntnis. Gleichverteilte Ziehung aus den noch nicht besessenen Modellen; keine Duplikate, kein Wechselkurs, kein bezahlter Reroll. Vor dem Kauf zeigt die UI Preis, verbleibende Modelle und gleiche Einzelchance 1/(10−k). Ziehung und Abbuchung teilen eine Transaktions-ID und gespeicherten RNG-Zustand. Nach zehn Modellen wird die Ziehung durch Sammlung/Upgrades ersetzt.

| Kauf Nr. | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Preis Erkenntnis | 1.000 | 2.200 | 4.840 | 10.648 | 23.426 | 51.537 | 113.380 | 249.436 | 548.759 | 1.20727e06 |

KI-Upgrades: von Level L auf L+1 **ceil(40×1,22^L×0,90^L_D02)** Erkenntnis. Startlevel 0, Limit 30+5×L_D03, maximal 50. Alle Modelle verwenden dieselbe Upgradepreiskurve; kein Zufallsroll der Grundstärke. Einmal entwickelte Modelle behalten Level und Fähigkeiten dauerhaft. Wechsel ist außerhalb Challenges kostenlos. Alte Basis-KI bleibt auswählbar, mit Kernfaktor 1 und ohne Spezialfähigkeit.

### 6.2 Gemeinsamer Kern, Spezialität und eine aktive KI

Jedes entwickelte Modell besitzt auf Level L einen **Revenue-Grundfaktor 1,5×(1+0,01L)**. Sein Bonusanteil über 1 wird durch A06, D03 und D05 verstärkt:

**KI-Kern = 1 +[1,5×(1+0,01L)−1]×1,08^L_A06×1,02^L_D03×Kopplung.**

Kopplung=1 ohne D05, sonst min(1,50;1+0,20×(b^G−1)). Hier ist b nur die Integrationsbasis 1,005/1,007. Kein Item-/KI-Itembonus steht auf der rechten Seite. Dadurch keine Rückkopplungsschleife. Der gemeinsame Kern gilt auch für K10 mit leeren Slots und für Forschungsmodelle ohne aktuellen Auftrag.

Numerische Spezialfaktoren der folgenden Tabelle wachsen mit **M(L)=1+(M0−1)×(1+0,08L)**. Bei Item-Spezialfaktoren wird damit der Itembonusanteil multipliziert, nicht ein zusätzlicher Komplettproduktionsfaktor erzeugt. Slots und Sekundärfähigkeiten folgen ihren ausdrücklich genannten Regeln; A06 verändert sie nicht.

| ID | Modell | Primärfähigkeit ab Entwicklung | Zweite Fähigkeit mit D06 |
| --- | --- | --- | --- |
| K01 | Kommerzmodell | Revenue ×M(L), M0=3. Klar stärkster reiner passiver Creditsfaktor bei gleichem Level. | Overdrive-Faktor ×1,10 während dieses Modell aktiv ist. |
| K02 | Inferenzmodell | Nutzer ×M(L), M0=2. Dadurch Credits ×M und Daten ×M^0,55; kein weiterer direkter Revenue-M-Faktor. | Datenproduktion ×1,25. |
| K03 | Datenmodell | Datenproduktion ×M(L), M0=4. | Forschungsgeschwindigkeit ×1,15. |
| K04 | Interaktionsmodell | Rohe Tapenergie ×M(L), M0=3, nach allgemeinem Taplogarithmus und innerhalb der gemeinsamen weichen Begrenzung. | Crit-Chance +3 Prozentpunkte, Grenze 50 %. |
| K05 | Integrationsmodell | Numerische ausgerüstete Itembonusanteile ×M(L), M0=1,20. Keine Slots/Triggerwahrscheinlichkeiten vervielfachen. | Analysegeschwindigkeit ×1,15. |
| K06 | Parallelmodell | Compute ×M(L), M0=1,60; Training und Forschung zusätzlich ×sqrt(M(L)). Compute wirkt bereits über Nutzer auf Credits/Daten. | Forschungsgeschwindigkeit zusätzlich ×1,15. |
| K07 | Wissenschaftsmodell | Forschungsgeschwindigkeit ×M(L), M0=2,50. | Datenproduktion ×1,25. |
| K08 | Lernmodell | Trainingsgeschwindigkeit aller erlaubten Richtungen ×M(L), M0=2,50. | Integrationstraining zusätzlich ×1,25. |
| K09 | Materialmodell | Analyse- und gezielte Synthesegeschwindigkeit ×M(L), M0=2; Synthese erhält keine zufällige Mehrmenge. | Passive Komponentenmenge ×1,20. |
| K10 | Modulares Modell | Ein universeller Slot ab Level 0, zwei ab Level 15. Numerische Itembonusanteile zusätzlich ×(1,05+0,002L), damit auch Zwischenlevel wirken. | Analysemengen ×1,15. |

Genau eine ausgewählte KI liefert gemeinsamen Kern, Primär- und gegebenenfalls Sekundärfähigkeit. Alle übrigen Modelle sind inaktiv. Ein Wechsel entfernt alte Faktoren sofort und setzt Ladungen, Cooldowns, Aufträge oder Kosten nicht zurück. K10-Slotbelegung wird bei Wechsel sicher ins Inventar zurückgelegt, nach Rückwechsel aus dem letzten gültigen Loadout wieder angeboten. Kein Item verschwindet; ein Item kann nie in zwei Slots zugleich stehen. D04 wählt nur an konfigurierten Ereignissen, nicht per schnellem Hin-und-her-Skript.

KI-Geschwindigkeit wirkt auf Restarbeit. Analyse-Mengenboni wie K10/D06 werden über tatsächlich geleistete Grundarbeit gewichtet: integriere Mengenfaktor×dArbeit und teile bei Abschluss durch notwendige Grundarbeit. Ein schneller letzter Wechsel erhält nicht den gesamten Mengenbonus. Passive Komponentenmenge wird beim jeweiligen Ertragsereignis mit aktueller KI ausgewertet. Startkosten, erforderliche Grundarbeit und Rückgewinnungsquoten besitzen absichtlich keine wechselbaren KI-Rabatte.

### 6.3 Gemeinsam gerechnete Preise und Erkenntnisraten

| Konstanter Zyklusstand I | Erkenntnis/s ohne I08/D01 | Pro Stunde | Wartezeit auf Kauf 2: 2.200 | Wartezeit auf Kauf 5: 23.426 |
| --- | --- | --- | --- | --- |
| 200.000 | 0.89443 | 3219.94 | 40.99 min | 7.28 h |
| 1e06 | 2.00000 | 7200.00 | 18.33 min | 3.25 h |
| 1e08 | 20.00000 | 72000.00 | 1.83 min | 0.33 h |

Die erste KI ist dank Starterbudget sofort bezahlbar. Alle zehn Entwicklungen kosten zusammen **2.2125e06 Erkenntnis**. Ein Modell von 0 auf 30 kostet ohne Rabatt insgesamt **70.696 Erkenntnis**. Bei konstant 200k INT wären das rund 21.96 Stunden für diese 30 Upgrades. Das sind **Rechnungen bei festgehaltenem I**, keine Vorhersage tatsächlicher Erwerbszeiten. Erkenntnis konkurriert zwischen Sammlung und Leveln; kein Poollos bleibt ohne den gemeinsamen Kern nutzlos.

## 7. Training und echte Item-Synergien

### 7.1 Drei Trainingsrichtungen

Zum Ziellevel n≥1: Q/E kosten ceil(300×2,4^(n−1)) Credits; Integration ceil(500×2,5^(n−1)) Credits plus ceil(100×1,5^(n−1)) Daten. Q/E-Grundarbeit min(8h;90s×1,18^(n−1)); G-Grundarbeit min(8h;120s×1,15^(n−1)). Geschwindigkeit verwendet Compute-Logbeitrag, passende Item-/Forschungs-/Prestige-/KI-Faktoren je einmal. Unveränderliche Ziellevel und Grundarbeit im Auftrag speichern.

Quality=1,12^s(Q), Efficiency=1,10^s(E); s(n)=n bis 50, danach 50+25×ln(1+(n−50)/25). T01/T02 potenzieren nur diese jeweiligen Faktoren mit 1,10. Integration=b^G, b=1,005 oder mit T10 1,007; Limit 200+25×L_A05≤300. Ein Kauf T10 enthält die Richtung Integration, auch ohne T04.

T03 erlaubt zwei manuell wartende Trainings zusätzlich zum einen aktiven. T06 verwendet dieselbe Station. Beim Start werden Credits/Daten reserviert, bei tatsächlichem Arbeitsbeginn verbraucht. Q/E/G-Zielaufträge müssen seriell gültige Folgeziellevel verwenden; nach Storno abhängige noch nicht gestartete höhere Level vollständig zurückreservieren und neu quotieren. Keine gleichzeitigen zwei Käufe desselben nächsten Levels.

B05 speichert beim Axiom die vor dem Reset erreichten Höchstlevel je Richtung. Wiederaufbau ist bis zu diesen festgeschriebenen Zielen ×2/×4/×8 schneller; spätere neue Level erhöhen das Ziel erst beim nächsten Axiom. Modelltransfer zählt die ersten sechs echten Starts je normalem Run, keine Restores. Ein Job speichert seine Startkennung, sodass Save/Load keinen neuen Startbonus erzeugt.

### 7.2 Bonusanteile statt unverständlicher Gesamtfaktoren

Effektiver numerischer Itembonus = ursprünglicher Bonus×bestehender Seltenheits-/Itemlevelfaktor×b^G×W-Verstärker×1,02^L_A05×1,10^L_B03×aktiver KI-Itemfaktor. Bei K05 ist letzterer M(L); bei K10 1,05+0,002L; sonst 1. Alle Verstärker stehen genau einmal darin. Boni gleicher Kategorie addieren sich anschließend. Ein +20-%-Item bei G=100 und b=1,005 liefert +32,93 % vor W/Axiom/KI; mit W05/W09/W10 insgesamt +217,36 % statt ursprünglich +20 %.

Kombinationsbedingungen, Trigger und Wahrscheinlichkeiten bleiben getrennt; Integration vervielfacht keine Slots, Proc-Chancen, festen Ladungen oder komplette Kombinationsfaktoren. Beispielhafte vorhandene Paarungen für Parallelarchitektur, Lernpipeline und Material-Mapping behalten ihre benannten Kategoriebeiträge. Alte pauschale Item-Exponenten werden durch obige Rechnung ersetzt. Besondere int-yield-Beiträge landen ausschließlich in B_INT.

### 7.3 Slots sind feste Rechte

| Slot-ID | Typ | Zugang | Nach Axiom |
| --- | --- | --- | --- |
| processor | Prozessor | Kostenlos vom Start | Erhalten |
| core | Core | Kostenlos vom Start | Erhalten |
| research | Forschung | Kostenlos vom Start | Erhalten |
| processorAux | Prozessor | W01:1.000 INT | Erhalten, W01 nicht erneut kaufen |
| coreAux | Core | W02:10.000 INT | Erhalten, W02 nicht erneut kaufen |
| researchAux | Forschung | W06:100.000 INT | Erhalten, W06 nicht erneut kaufen |
| universal1 | Beliebiger Typ | Aktive K10 | Nur solange K10 aktiv |
| universal2 | Beliebiger Typ | Aktive K10 ab Level15 | Nur solange passende K10 aktiv |

Es wird eine Menge von Slot-IDs gespeichert, kein „erste n Einträge“-Präfix. W06 vor W01 kauft ausschließlich researchAux; W01 hat später unverändert seinen eigenen Nutzen. Die drei festen Zusatzslots sind permanent finanzierte Infrastruktur. Normale neue Spielstände haben höchstens acht Slots mit K10. Bestandsrechte oberhalb dieser Zahl werden als gesonderte geschützte Überhangslots erhalten; keine gekaufte Kapazität wird abgeschnitten.

## 8. Sicherer Weg zu Items, Modulen und allen Materialien

### 8.1 Sechs garantierte Rezepte

Die ersten drei lernt Mira kostenlos beim Einstieg, die letzten drei nach drei unterschiedlichen tatsächlich hergestellten Starteritems. Alle erzeugen ein Common-Item des benannten bestehenden Typs. Keine Module, seltenen Zutaten oder Zufallsfragmente nötig. Die vorhandenen individuellen Itemprofile bleiben; die unten genannten primären Rollen werden nicht vertauscht.

| Item / Slot | Circuit / Kupferspule | Daten | Grundarbeit | Primäres Profil |
| --- | --- | --- | --- | --- |
| impulse-relay / processor | 12 / 2 | 0 | 120 s | Bestehender Impulsrelais-Proc; Zusatzenergie läuft innerhalb derselben weichen Tapbegrenzung, nicht als unbeschränkte zweite Auszahlung. |
| memory-crystal / core | 10 / 4 | 50 | 180 s | Bestehendes Credits-Itemprofil, nicht zu Daten umbenennen. |
| lab-drone / research | 10 / 6 | 80 | 180 s | Bestehendes Forschungs-Itemprofil. |
| quantum-chip / processor | 20 / 8 | 150 | 300 s | Bestehendes Compute-Itemprofil. |
| tensor-core / core | 24 / 10 | 200 | 300 s | Bestehendes Compute-Itemprofil. |
| field-scanner / research | 18 / 10 | 180 | 300 s | Bestehendes Analysegeschwindigkeits-Itemprofil. |

Einmalige Starterhilfe `mira-starter-materials-v2`: Zielvorrat 32 circuits und 12 copperCoils, genau für die ersten drei Rezepte. Bei Einführung werden je Material max(0;Ziel−vorhandener frei verfügbarer Bestand) vergeben. In Aufträgen reservierte Starterinputs zählen zum vorhandenen nutzbaren Fortschritt; bereits hergestellte erste Startertypen verringern den Zielbedarf um ihre Rezeptinputs. Quittung und Mengen atomar speichern. Bereits vorhandene passende Items erfüllen den jeweiligen Starterbedarf ebenfalls. Kein Nachfüllen durch absichtliches Ausgeben nach Erhalt.

Daten für diese Items entstehen aus der normalen Datenproduktion ab bezahlter Hardware. Ein Spieler ohne seltene Drops hat daher einen endlichen sicheren Weg in alle drei Slots.

Grundmodule nach Projekt „Offene Baupläne“: **computeBus =8 circuits+4 copperCoils+250 Daten, 60s**; **dataLattice =12 circuits+6 copperCoils+500 Daten, 120s**. Keine jeweils anderen Module als Voraussetzung. Rezepte nennen fehlende Module mit direktem Link zu deren Herstellung. Fortgeschrittene vorhandene Rezepte behalten ihre Zutaten/Module/Grundarbeit des geprüften Katalogs; ihr Lernen kostet die dort angegebene feste Fragmentzahl, nach Offene Baupläne und der erforderlichen Materialstufe. Alte Hardware- oder entfernte Prestige-Zugangssperren der Rezepte werden durch die Materialstufe ersetzt. Starter überschreiben ihre bisherigen teureren Rezeptvarianten, kein zweiter gleichnamiger Kauf.

### 8.2 Gezielte Synthese als garantierter Materialweg

Eine Analyse-/Synthesestation, ein aktiver Auftrag. Gezielte Synthese erzeugt genau eine gewählte Komponente der folgenden Gruppe. Die angegebenen Daten und die Grundarbeit sind fixe Einzelpreise. Mengenforschung, C01 und K10 erzeugen hier keine Mehrmenge; Geschwindigkeiten gelten. Keine Fragmente als Nebenprodukt. Fortgeschrittene Zutaten haben so keine zufallsabhängige Zugangsschleife.

| Gruppe | Wählbare einzelne Komponenten | Zugang | Daten/Einheit | Grundarbeit |
| --- | --- | --- | --- | --- |
| base | circuits, copperCoils, ceramicCapacitors, ferriteCores | Sofort | 50 | 60 s |
| semiconductor | siliconWafers, titaniumBolts, goldContacts, ceramicSubstrates, thermalInterface | Offene Baupläne | 250 | 180 s |
| photonic | photonicLenses, graphene, opticalFibers, photonicCircuits | materialAnalysis Level3 | 2.000 | 600 s |
| frontier | nanotubes, superconductors, diamondSubstrates | blueprintAnalysis Level5 | 20.000 | 1800 s |
| quantum | neuralCrystals, spintronicDevices, quantumCores, cryogenicResonators | materialAnalysis Level10 | 200.000 | 7200 s |

Alle benötigten Forschungen kosten ausschließlich Daten und hängen über den Forschungsgraphen an dataGeneration. Kein Rezeptzugang verlangt die eigene noch unerreichbare Komponente. Hochstufige Datenkosten sind wirtschaftliche Hürden, keine Zufallsbarrieren.

### 8.3 Normale Analysen bleiben attraktiv

Eine Analyse zieht die angegebene Basismenge einzelner Komponenten. Hardware verwendet freigegebene base/semiconductor, Architektur zusätzlich photonic, Artefakt zusätzlich frontier/quantum. Innerhalb eines freigegebenen Gesamtpools sind Komponenten gleich gewichtet. Die gewählte Materialtabelle wird beim Start eingefroren; sie öffnet keine noch nicht entdeckten Familien. In einer Familie gelten die oben genannten Forschungszugänge. Die alten versteckten Tabellen werden durch diese veröffentlichte Verteilung ersetzt.

| Analyse | Fixe Datenkosten | Grundarbeit | Basismenge | Bauplanfragmente |
| --- | --- | --- | --- | --- |
| hardware-short | 250 | 600 s | 12 | 1/24 |
| hardware-long | 6.000 | 14400 s | 360 | 1 |
| architecture-short | 800 | 1800 s | 18 | 1/8 |
| architecture-long | 12.800 | 28800 s | 360 | 2 |
| artifact-short | 4.000 | 7200 s | 30 | 1/2 |
| artifact-long | 48.000 | 86400 s | 450 | 6 |

Hardwareanalysen sind sofort verfügbar, Architektur nach Offene Baupläne, Artefakt nach blueprintAnalysis Level3. Mengenfaktor **1+0,08×materialAnalysis-Level**. Fragmentfaktor **1+0,10×blueprintAnalysis-Level**. Forschungsboni werden beim Start quotiert, Kosten/Pool/Grundmengen bleiben im Vertrag; KI-Mengenboni werden arbeitsgewichtet. Materialforschung verteuert denselben Auftrag niemals. Datenpipeline reduziert neue Analyse- und Synthesekosten um 20 %, mindestens eine Dateneinheit; keine rückwirkende Erstattung.

Jeder Langauftrag gibt bei gleicher Gesamtgrundzeit **25 % mehr Komponenten** als die entsprechende Folge kurzer Aufträge. Fragmente werden exakt als rationale Restwerte gesammelt. Ein Grundfragment ist nach 24 kurzen Hardwareanalysen garantiert; kein Zufalls-Bauplanfund ist Pflicht.

W03 wird beim neuen Analysevertrag gespeichert: Enthält das fertige Ergebnis keine seltene Komponente, genau **ein zusätzliches Graphen** vergeben. Graphen ist ausdrücklich selten und als garantierter Bonus auch vor seiner normalen Poolöffnung erlaubt. Kein wiederholtes Neuwürfeln einer Tabelle, die gar kein seltenes Ergebnis enthält. Die Garantie erzeugt nie weniger Grundkomponenten.

### 8.4 Aufträge, Fusion und Rückgewinnung

Jede Serien-Einheit hat ID, Rezeptversion, bezahlte tatsächliche Inputs, reservierte Outputs, Grundarbeit, Fortschritt und Status reserviert/laufend/abgeschlossen/storniert. Der Startbutton bezahlt beziehungsweise reserviert nur finanzierbare Einheiten; UI zeigt beispielsweise „7 von 10 finanzierbar“. Reservierte Inputs werden sofort aus frei verfügbarer Währung entfernt, erst bei Arbeitsbeginn verbraucht. Storno eines noch nicht gestarteten Auftrags gibt die tatsächlichen Reserven vollständig zurück, genau einmal. Ein laufender Auftrag gibt beim Abbruch keine verbrauchten Inputs zurück. Alle Abbruchfolgen stehen vor Bestätigung in der UI.

Planer zählen Inventar+laufende+reservierte gültige Outputs gegen einen Zielbestand. Eine C03-Bestandsregel reserviert nicht zehnmal dieselben verfügbaren Zutaten. Bereits laufende Jobs über Reset behalten ihre Verträge. Noch nicht gestartete Reservierungen werden beim Reset vor der Währungsrücksetzung aufgehoben; Materialien kommen zurück, Credits/Daten unterliegen anschließend regulär dem Reset. Dadurch kann die Queue nicht als rückzahlbare Währungsbank dienen. Forschungsrabatte gelten nur bei neuer Quotierung. Bei Update bleibt die gespeicherte Rezeptversion bezahlter Verträge gültig.

Fusion: drei ungesperrte, nicht ausgerüstete Items desselben Typs und derselben Seltenheit →ein Item der nächsten Seltenheit. Sechs Ränge Common/Uncommon/Rare/Epic/Legendary/Mythic; kein weiterer Rang nach Mythic. Fusion hat keine extra Material-/Datenkosten, Grundarbeit 60s×3^Rang, nutzt die Fertigungsstation. Ausgangs-Itemlevel des Ergebnisses = Minimum der drei Inputlevel; überschüssige Itemlevel erzeugen keine Refunds. Der Button zeigt dies. Für eine sichere Mythic-Herstellung werden höchstens 243 Common-Items eines Typs benötigt. Je Familie existieren zwei sichere Startertypen; keine fertigen Zufallsitems erforderlich.

Jedes Item besitzt ein gebundenes Inputbuch. Hergestellte Items übernehmen tatsächlich verbrauchte Materialien; Item-Upgrades fügen nur tatsächlich gezahlte Materialien hinzu. Daten, Fragmente, Gems und Erkenntnis sind nie Salvage-Inputs. Fertige kostenlose/kaufbare Beuteitems ohne Materialinputs erhalten kein frei erfundenes Materialbuch, also keine garantierte Materialrückzahlung; ihr Nutzen ist Ausrüstung/Fusion. Die UI zeigt den konkreten Ertrag vor Zerlegen. Fusion vereinigt die drei Inputbücher, sie kopiert sie nicht. Materialrecycling gibt bei Craftabschluss 5 % effektiver Materialinputs zurück und zieht dieselbe Menge vom gebundenen Buch ab. Rückgewinnung beim Zerlegen: 60 %+5 Prozentpunkte pro C05-Level bis 75 % des verbleibenden Buchs. Fraktionen pro Material werden gespeichert, nicht pro Miniitem aufgerundet. Kein Craften/Fusionieren/Zerlegen gewinnt mehr als seine realen Inputs zurück.

Item-Levelkosten, vorhandene Typidentitäten und Seltenheitsstärken werden mit dem vorhandenen Katalog übernommen, der separate globale Schmiedelevel-Faktor entfällt vollständig. W08/C06 beschleunigen Item-Levelarbeit, keine Schmiedelevelkäufe. Eine Materialrabattquote wird je tatsächlichem Input aufgerundet; Quote mindestens null, reguläre positive Inputpositionen mindestens eins.

## 9. Vollständiger Forschungszugang ohne alte Prestige-IDs

Forschungen sind echte Systeme mit fachlichen Voraussetzungen; die Freiheit von Vorgängern betrifft den **Prestige-Baum**, nicht diesen Forschungsgraphen. Kein Forschungszugang verwendet einen alten Prestige-Knotennamen. Alle Forschungs- und Projektrechte bleiben nach Axiom erhalten.

Für das nächste Ziellevel n: Kosten **ceil(Basisdaten×1,85^(n−1)×(0,85 falls F07))**; Grundarbeit **min(12h;Basissekunden×1,22^(n−1))**. Mindestpreis eine Dateneinheit. Voraussetzung „x:3“ heißt Forschungslevel mindestens 3; leer heißt sofort verfügbar. Forschungsgeschwindigkeiten wirken dynamisch auf Restarbeit, nicht als nachträgliche Kostenrabatte. Wiederholbare Forschungen haben keinen neuen künstlichen Maximallevel.

| Forschung / ID | Daten Level1 | Grundsekunden Level1 | Voraussetzung | Effekt je erreichtem L |
| --- | --- | --- | --- | --- |
| Datenerzeugung / dataGeneration | 363 | 180 | Keine | Daten ×1,12^L. |
| Materialanalyse / materialAnalysis | 100 | 300 | dataGeneration:1 | Analysemengen ×(1+0,08L). Bestehende Auftragskosten bleiben unverändert. |
| Bauplananalyse / blueprintAnalysis | 180 | 600 | materialAnalysis:1 | Bauplanfragmente aus Analysen ×(1+0,10L), mit Restmengenbuchung. |
| Modellarchitektur / modelArchitecture | 250 | 900 | dataGeneration:1 | Revenue ×1,10^L. |
| Compute-Optimierung / computeOptimization | 300 | 900 | modelArchitecture:1 | Compute ×1,10^L. |
| Nutzer-Skalierung / userScaling | 350 | 1200 | computeOptimization:1 | Nutzerkapazität ×1,08^L. |
| Hardware-Integration / hardwareIntegration | 450 | 1500 | userScaling:3 | Compute ×(1+0,01K)^L, K aktuell besessene Klassen bis 15. |
| Laborautomation / labAutomation | 600 | 1800 | blueprintAnalysis:1 | Analysegeschwindigkeit ×(1+0,05L). |
| Kommerzialisierung / commercialization | 400 | 1200 | modelArchitecture:1 | Revenue ×1,10^L. |
| Netzwerkeffekte / networkEffects | 500 | 1500 | commercialization:3 | Revenue ×(1+0,01L×log10(1+Nutzer)). Kein zusätzlicher Nutzerfaktor. |
| Parallele Architektur / parallelArchitecture | 550 | 1800 | computeOptimization:3 | Compute ×(1+0,015K)^L, K aktuelle Klassen bis 15. |
| Hardware-Co-Design / hardwareCoDesign | 650 | 2400 | parallelArchitecture:3 | Compute ×(1+0,002×min(100;Q+E))^L. |
| Synthetische Daten / syntheticData | 500 | 600 | dataGeneration:3 | Daten ×(1+0,002×min(100;Q+E))^L. |
| Datenkreislauf / dataFlywheel | 800 | 900 | syntheticData:3 | Daten ×1,08^L statt unbegrenzter allgemeiner Synergie-Exponent. |
| Rekursives Lernen / recursiveLearning | 1000 | 2400 | modelArchitecture:5 | Trainingsgeschwindigkeit ×(1+0,03L). |
| Autonome Wissenschaft / autonomousScience | 1200 | 3600 | labAutomation:3 | Forschungsgeschwindigkeit ×(1+0,03L). |
| Impulsverstärkung / tapAmplification | 600 | 1200 | computeOptimization:3 | Roher Tapfaktor X ×1,08^L, vor logarithmischer Abflachung. |
| Signalprotokolle / dropProtocols | 250 | 600 | materialAnalysis:3 | Aktives Dropintervall = max(30;90/(1+0,05L)) Sekunden. Keine kostenlosen Taps offline. |

Einmalige Projekte: fixe Datenpreise; F07 reduziert neue Projekte ebenfalls ×0,85. Kein Materialinput als Forschungszugang.

| Projekt / ID | Daten | Grundsekunden | Voraussetzung | Einmaliger Effekt |
| --- | --- | --- | --- | --- |
| Labororganisation / operations | 500 | 300 | dataGeneration:1 | Manuelle Forschungsqueue +2. Basis 2, mit F02 6, mit Projekt bis 8. |
| Offene Baupläne / blueprints | 300 | 300 | dataGeneration:1 | Fortgeschrittene Rezepte und Grundmodule lernen; sechs Starterrezepte benötigen dieses Projekt nicht. |
| Reproduzierbare Modelle / alignment | 1.000 | 900 | modelArchitecture:1 | Trainingsgeschwindigkeit ×(1/0,90). Kein neuer KI-Snapshot. |
| Datenpipeline / dataPipeline | 100.000 | 3600 | dataFlywheel:3 | Datenkosten neuer Analysen und gezielter Synthesen ×0,80. |
| Verteilte Inferenz / distributedInference | 250.000 | 7200 | parallelArchitecture:3 | Ab 25 Geräten im Vorgänger werden bis zu zehn Nachfolger je Klasse mit 10 % zusätzlicher Rohleistung pro Gerät verbunden. Link nur einmal in Hardware-Rohcompute. |
| Modelltransfer / modelTransfer | 150.000 | 3600 | recursiveLearning:3 | Erste sechs tatsächlich begonnenen Trainings je normalem Run: Geschwindigkeit ×2. Startzähler wird gespeichert; Restore zählt nicht neu. |
| Materialrecycling / materialRecycling | 50.000 | 1800 | materialAnalysis:3, blueprintAnalysis:3 | 5 % der effektiv gezahlten Materialinputs bei Craftabschluss zurück; Rückgabe von gebundenem Salvage-Buch abziehen. |
| Forschungsplanung / researchScheduling | 75.000 | 3600 | labAutomation:3, autonomousScience:3 | Forschungsgeschwindigkeit ×1,10; vorhandener F05-Direktor kann sechs statt drei Ziele verwalten. |

Forschungsbereiche für Challenge-Abwechslung: Daten =dataGeneration/syntheticData/dataFlywheel; Materialien =materialAnalysis/blueprintAnalysis/dropProtocols; Architektur =modelArchitecture/computeOptimization/userScaling/parallelArchitecture/hardwareIntegration/hardwareCoDesign; Kommerz =commercialization/networkEffects/tapAmplification; Labor =labAutomation/recursiveLearning/autonomousScience. Einzelprojekte zählen zum gleichnamig passenden Bereich: operations/researchScheduling=Labor, blueprints/materialRecycling=Materialien, alignment/modelTransfer=Architektur, dataPipeline=Daten, distributedInference=Architektur. So sind alle fünf Bereiche ohne alte Prestige-IDs erreichbar.

Basis ein Labor, plus F01/F04/F08, plus einzeln gekaufte permanente Zusatzlabore. Forschungsqueue: Basis zwei wartende Jobs; F02 erhöht auf sechs; operations gibt weitere zwei, also höchstens acht in neuen Saves. Bei vollen Laboren reiht der normale Button ein. Kein separates Warteschlangenmenü und kein zweiter Startknopf. Jeder wartende Job zeigt Preis, Rückgabe bei Storno und Status. Bereits bezahlte Jobbelege behalten ihren Preis.

## 10. Taps, Crit und Overdrive ohne Dauerexploit

### 10.1 Gemeinsame, weiche Tapbegrenzung

Angenommene manuelle Taps höchstens fünf pro Sekunde, mindestens 200ms zwischen angenommenen Taps. Zu schnelle/ungültige Eingaben erzeugen weder Credits, Combo, Dropchance noch Ladung. Keine Offline-Taps; Hardware-Autobuyer sind keine künstlichen Taps. R_ref ist aktuelle passive Credits/s mit permanenten Faktoren und aktiver KI, **ohne temporäre Creditsbooster und ohne Overdrive**.

X≥1 sammelt allgemeine rohe Tapfaktoren: S01/S08, reguläre Item-Tapboni und Forschungs-Tapfaktoren jeweils einmal. Combo zählt 0–50; C_combo=1+0,01×Combo. Rohe skalierende Impulsenergie pro akzeptiertem Tap:

**q =0,02×(1+ln(X))×(8 falls S10)×(aktive K04: M(L), sonst 1)×C_combo +q_Proc.**

q_Proc ist eventuell ausgelöste zusätzliche Relais-/Itemenergie in denselben Einheiten passiver Produktionssekunden; sie geht in dieselbe Formel, nie in einen unbeschränkten zweiten Auszahlungspfad.

c=min(0,50;0,05+0,05[S02]+0,05[S05]+0,03[aktive K04-Sekundärfähigkeit]).

m=(2+0,50[S03]+1[S06])×1,15^L_A04; e_crit=1+c×(m−1).

**Normale Tap-Sekunden =4q/(4+q×e_crit). Auszahlung=max(1 Credit;R_ref×Tap-Sekunden)×tatsächlich gewürfelter Critfaktor.** Critfaktor ist m oder 1. Genau eine Creditsquittung pro Tap. Der Basis-Credit am Start ist eine ausgewiesene Bootstraphilfe; seine nicht skalierende Untergrenze ist von der folgenden Verhältnisgrenze ausgenommen.

Damit bleiben bei fünf Taps/s die **erwarteten skalierenden zusätzlichen Tapcredits unter 20×R_ref pro Sekunde**, einschließlich Crit und innerhalb der Formel gezogener Proc-Energie. Es ist eine Erwartungsgrenze, keine Deckelung einzelner Crit-Ergebnisse. Jede endliche q-Erhöhung verbessert weiterhin den Ertrag; kein harter toter Cap. Crit wirkt sichtbar, auch wenn sein zusätzlicher erwarteter Nutzen in extremen Builds abflacht. UI zeigt effektive Werte nach Abflachung. R_ref enthält Overdrive nicht erneut.

### 10.2 Drei verschiedene Zustände

Combo=0…50 steigt bei angenommenen Taps um eins; nach zwei Sekunden ohne angenommenen Tap auf null. Overdrive-Ladung=0…100 steigt separat je angenommenem Tap um eins, bleibt bei Leerlauf erhalten, sinkt nicht durch Comboverlust. Overdrive startet nur bei voller Ladung und einem angenommenen Tap frühestens 60 Sekunden nach Beginn der vorherigen Aktivierung. Ladung kann während Cooldown voll werden; sie erzeugt keine zusätzliche Laufzeit. Aktivierung verbraucht Ladung, setzt Combo nicht zurück.

Overdrive verstärkt passive Credits mit **3×2^[S04]×1,5^[S09]×(1,10 bei aktiver K01-Sekundärfähigkeit)**. Dauer=min(30s;15s×(1,50 falls S07)×explizite bestehende Dauerfaktoren). Cooldown ab Start unveränderlich 60s, also höchstens 50 % Laufzeit; mit S07 ohne weitere Dauerboni 37,5 %. Bestehende Dauerbonusse oberhalb 30s werden bei Migration in einen ausgewiesenen äquivalenten Legacy-Overdrive-Faktor überführt, nicht parallel unbegrenzt verlängert. Modellwechsel startet Overdrive nicht neu und verändert seine gespeicherte Endzeit nicht.

Ladung/Combo/temporäre Run-Stacks fallen bei Reset auf null. Bezahlte Shopbooster behalten ihre zugesagte Restdauer; ihr Vertragsende wird nicht durch den Reset verkürzt. Hintergrundmodus produziert keine Taps, verarbeitet aber das Ende eines aktiven Overdrives zum richtigen Zeitstempel. Jeder RNG-Strom für Crit/Drops/Labor wird getrennt persistiert, damit ein Reload keine Gratis-Neuziehung erzeugt.

## 11. Verbindliche Automation und Offline-Verarbeitung

### 11.1 Eine Ereignisreihenfolge für alle Agenten

1. Bis zum frühesten Ereignis produzieren; Restarbeit und RNG-Verträge fortschreiben.
2. Bereits bezahlte Jobabschlüsse und Ertragsquittungen genau einmal verbuchen.
3. Erreichte Resetbedingung vormerken. Ausgewählte zu diesem Zeitpunkt laufende Job-IDs als endliche Wartemenge festhalten. Keine künftigen Wiederholungen in diese Menge aufnehmen.
4. Solange die Absicht wartet, keine neuen automatischen Jobs in ihren Wartekategorien starten. Bereits laufende Jobs abschließen lassen; manuelle neue Aufträge zeigen „Reset wartet“ und benötigen eine bewusste Aufhebung der Absicht.
5. Berechtigten Axiom-Reset vor normalem Prestige ausführen; erforderliche INT-Abholung und Auszahlung atomar prüfen. Bei normalem Prestige I nur einmal erhöhen.
6. Nach Reset gegebenenfalls D04-Modell wählen, dann bekannten Wiederaufbau B04 ausführen, dann Budgets verteilen und neue Jobs starten.

Autotraining, wiederholte Forschung und Analyse können Auto-Prestige dadurch nicht endlos aufschieben. Verschwindet eine gemerkte Job-ID durch Storno, ist sie abgearbeitet. Aufträge, die über Axiom weiterlaufen dürfen, müssen nur warten, wenn dies im Agentenprofil gewählt wurde. Aktive Trainingsverluste werden vor dem Aktivieren der entsprechenden Strategie erklärt.

Normales Prestige verwendet runStartedAt. Axiom-Agent verwendet axiomCycleStartedAt, das normale Prestiges nicht verändern. Automatisches Axiom mindestens nach fünf Minuten Zykluszeit und konfiguriertem Mindestgewinn; ein manueller zulässiger Reset benötigt keinen Fünf-Minuten-Timer. Bei gleichzeitig erreichten Zielen gibt es niemals zwei Resettransaktionen aus demselben Zustand.

### 11.2 Ein funktionsfähiger Starter gehört zum Agenten

I06/I07/B04/B06 enthalten einen Minimalstarter unabhängig von H01: Wenn nach Reset keine Hardware vorhanden ist, einmal einen Taschenrechner regulär für 15 der 50 Startcredits kaufen. Rest 35. Dies ist ein echter Kauf, kein Creditsgewinn und kein Geschenkcompute. Er schaltet keine weiteren Klassen-Autobuyer frei. Bei einem fehlgeschlagenen Kauf zeigt der Agent einen Grund und wartet; kein kostenloser Resetloop. B02 erhält diesen Teil der gekauften Steuerung.

I06-Ziele: Mindest-INT≥1, Mindestlaufzeit in Sekunden und Auswahl „sofort / laufendes Training / laufende Analyse / laufende Forschung abwarten“. I07 ergänzt relatives Ziel ×2/×5/×10 gegenüber dem letzten positiven normalen Prestigegewinn dieses Zyklus. Fehlt ein letzter Gewinn, gilt Mindest-INT. Eine optionale feste Laufzeitobergrenze kann den relativen Wunsch durch Mindest-INT ersetzen; ohne Obergrenze ist ein nicht erreichtes Ziel bewusstes Warten mit sichtbarem Grund. Nach Axiom wird die Referenz des letzten Prestigegewinns gelöscht.

### 11.3 Gemeinsame Reserven statt konkurrierender Wiederholungen

Alle Agenten greifen auf denselben Ressourcenplan zu. Bereits bestätigte manuelle Verträge zuerst erfüllen. Danach je Ressource absolute Sparziele in expliziter Prioritätsreihenfolge aus neuem verfügbarem Bestand in ein Ziel-Escrow legen, **bevor** billige Endlosjobs kaufen dürfen. Erst Überschuss geht an laufende Automatismen. Prozentbudgets können zusätzlich gelten; sie ersetzen keine absolute Reservierung für einen teuren Zielkauf. Credits, Daten und INT jeweils getrennt anzeigen.

Eine Regel „100 Daten für das Ziel sparen“ schützt neue Daten, bis 100 erreicht sind; eine 5-Daten-Analyse kann diese nicht ständig wegkaufen. Umpriorisieren/stornieren gibt nur nicht verbrauchte Escrows frei. Zielbestand zählt aktive und reservierte Outputs. INT-Sparziel betrifft U, niemals die verdienten I oder Axiom-Berechtigung. B04 kauft ausschließlich bekannte, noch nicht erhaltene Knoten; neue Spezialisierungen brauchen manuelle Entscheidung. Dauerhafte Slots und verankerte Lizenzen werden übersprungen, kein zweites Bezahlen.

Hardware-Einkaufsschritt alle fünf Sekunden online und offline, je nach Strategie nächster Meilenstein/günstigster erlaubter Kauf/Max-Kauf. Nicht pro Renderframe. Reihenfolge bei gleichen Zeiten: Priorität, dann feste Klassen-ID. Globale Pause, Reserve und je Klasse AUTO direkt in der Hardwarezeile sind Basisbedienung. H-Knoten erteilen die Lizenzen.

### 11.4 Offline ist dasselbe Spiel mit anderer Darstellung

Ökonomisches Offline-Zeitbudget und gekaufte Verlängerungen bleiben erhalten. Innerhalb derselben berechtigten Zeit gilt dieselbe Ereignisfolge wie online. **32 Ereignisse sind ausschließlich eine technische Arbeitsportion**, niemals „danach keine Resets mehr“. Cursor, Restzeit, Verträge und RNG speichern; nach Yield fortsetzen. Kein App-Neustart nötig. Bei Zeitlimit/Prozessabbruch wird unfertige Verarbeitung sichtbar weitergeführt.

Onlinezeit und Offlinezeit teilen sich einen monotonen Simulationszeitstrahl. Gleichstände werden stabil geordnet. Analyse-/Tap-/Labormodell-Zufallsströme sind getrennt und ereignisgebunden, nicht von Tickzahl abhängig. Eine achtstündige berechtigte Zeitspanne muss bei gleicher Strategie/RNG als ein Block, drei Blöcke oder 96 Blöcke dasselbe Ergebnis liefern. Die Referenz prüft dies an einem absichtlich einfachen Resetmodell mit und ohne laufenden Wartejob; die vollständige Economy muss denselben Vergleich noch bestehen.

## 12. Exakter Reset-Vertrag

| Zustand | Normales Prestige | Axiom |
| --- | --- | --- |
| Credits/Hardware | Auf null, 50 synthetische Startcredits | Ebenso |
| Datenvorrat | Erhalten | Auf null; keine Rückgabe verbrauchter Daten |
| I/U/P/R/E_INT | Abholbare INT addieren, übrige Zykluswerte erhalten | Abholung und Auszahlung atomar; anschließend Zykluswerte null |
| I_hist/I_best/A | Erhalten/aktualisieren | Rekord nach letzter Abholung sichern, A erhöhen |
| Prestige-Knoten | Erhalten | W01/W02/W06 immer; B01 verankert bekannte H01–H05; B02 verankert bekannte Steuerung; übrige Knoten entfallen |
| Q/E/G | Null, mit T08 erhalten | Null; B05 speichert vor Reset Rekordziele |
| Laufendes Training | Mit T08 weiter; sonst aktive Inputs verloren. Unbegonnene Reserven vor Reset freigeben; erst danach Credits zurücksetzen. Daten bleiben normal erhalten. | Aktives Training beendet/Inputs verloren; unbegonnene Reserven vor Credits-/Datenreset freigeben, keine Entschädigung nach Reset |
| Forschungslevel/Einzelprojekte/Rezeptwissen | Erhalten; kein erneuter Abschluss | Erhalten; I04 wirkt nach erneutem Kauf direkt aus vorhandenem Wissen |
| Laufende Forschung/Crafting/Analyse | Mit bezahltem Vertrag weiter | Mit bezahltem Vertrag weiter; überschüssig belegte Labore beenden Job, danach nur berechtigte Labore neu besetzen |
| Wartende noch nicht gestartete Jobs | Reservierung aufheben, tatsächliche Inputs vor Reset freigeben; Credits anschließend zurücksetzen, Daten/Materialien bleiben. | Reservierung aufheben und Inputs vor Reset freigeben; Credits/Daten anschließend zurücksetzen, Materialien bleiben. Kein Bankkonto durch Auftragsstorno nach Reset. |
| Items/Materialien/Module/Fragmente | Erhalten | Erhalten |
| Reguläre Zusatzslots und Ausrüstung | Erhalten | Erhalten, keine Rückgabe wegen W-Knotenverlust |
| Labor/Erkenntnis/KIs/Upgrades/aktive KI | Erhalten | Erhalten; Erkenntnisrate nutzt neuen I-Stand plus Rekordboden |
| Axiom-Knoten/Planprofile/Loadouts | Erhalten | Erhalten, B04 kauft nur gültig bekannte verlorene Knoten |
| Gems/bezahlte Rechte/Labore/Offline-Verlängerung | Erhalten | Erhalten und nach Herkunft genau einmal zählen |
| Challengefortschritt/Missionen/Erfolge | Dauerhafte Fortschritte erhalten | Dauerhafte Fortschritte erhalten; Run-Zähler nach ihrem Vertrag zurücksetzen |
| Overdrive/Combo/Ladung/Run-Stacks | Auf null; bezahlte Booster behalten Laufzeit | Ebenso |
| Agenten-Uhren | runStartedAt neu; Axiomuhr unverändert | Beide neu; relative Prestigegewinn-Referenz null |

Die vollständige Stornorückgabe gilt für manuelles Stornieren außerhalb eines Resets. Ein Reset ist ein eigener Vertrag: Reserven werden vor seiner Währungsrücksetzung freigegeben, nicht als neues Startkapital hinterher ausgezahlt. Automatische Profile legen unbegonnene Ziele nach Reset nur bei erneuter Finanzierbarkeit neu an. Tatsächlich bereits gestartete laufende Verträge dürfen nach den Tabellenregeln weiterlaufen; wer einen solchen nach Reset bewusst abbricht, erhält keine verbrauchten Inputs zurück.

Normales Prestige und Axiom zeigen vor manueller Bestätigung die tatsächlichen Verluste/weiterlaufenden Aufträge. Automatische Agenten zeigen dies bei Aktivierung ihres Profils. Ein Q/E/G-Restore erhöht keine Missions-, Challenge- oder INT-Abschlusszähler. Forschung und Slots bleiben nicht nur nominell erhalten: ihre konkreten Rechte und aktuellen Bonusquellen werden aus dem neuen Zustand ausgewertet.

## 13. Alle zehn Challenge-Familien mit den neuen Systemen

### 13.1 Eine abgegrenzte Challenge-Sitzung

Genau eine Challenge aktiv; Hauptspiel wird währenddessen pausiert. Das ist eine bewusste eindeutige Regel: Es laufen nicht gleichzeitig zwei verschiedene aktive KI-Modelle. Hauptspiel-Verträge behalten Restarbeit, kein Hauptspiel-RNG-/Offline-Einkommen während der Sitzung. Bezahlte Hauptspielbooster verlieren während der Challenge keine Restdauer. Beim Verlassen wird unverändert weitergespielt plus einmalige Challengebelohnung. Lokale Items/Materialien/Credits/INT verlassen die Sitzung nicht.

Bei Eintritt werden erlaubte permanente Verstärker, die eine aktive KI samt Level/Fähigkeiten und ein gültiges Item-Loadout kopiert. Kopien können nicht zerlegt/exportiert werden. Neue lokale Crafts funktionieren normal. Keine KI-Wechsel, INT-/Axiomkäufe oder Axiom-Resets in der Sitzung. Aktive lokale Prestige-Agenten halten Challenge-Mindest-INT ein; lokale INT-/Creditledger sind von I_hist/I/R des Hauptspiels getrennt. Der eigene Familienbonus ist in seiner Challenge deaktiviert. K05/K10 können verbotene Items nicht zurückbringen; K04 kann verbotene Taps nicht ersetzen.

Eintritt: mindestens ein normales Prestige historisch, vorherige Stufe der Familie geschafft und je Kapitel eine historisch erreichte Hardwareklasse sbc/pc/gpu/server/campus/orbital. Serial Science verlangt die benötigten erreichbaren Forschungsbereiche; Closed Supply Chain Offene Baupläne; Fragmented Network distributedInference. Keine alten Prestige-IDs. Der Hands-Off-Vertrag enthält immer den bezahlten 15-Credits-Taschenrechnerstarter, keine H01-Pflicht. Inflation verändert diesen Starterkauf nicht; es verändert dort ausschließlich anschließende Klassenkäufe, damit 50 Startcredits nicht zum Deadlock werden.

### 13.2 Statische Ziele statt an aktuelle Macht angepasster Ziele

Bestehende 69 Stufen je Familie, sechs Kapitelgrenzen 10/20/30/45/60/69. Für Stufe s gilt: C=1e6×10^[0,30(s−1)], D=1e3×10^[0,20(s−1)], K=N=1e2×10^[0,25(s−1)], Mindest-INT=ceil(10^[0,15(s−1)]). Forschungs-Datenbudget=100×1,22^(s−1). Diese Basiskurven werden aus dem bestehenden Katalog übernommen, nicht nach aktueller Spielerleistung verschoben.

Kapitelwerte 1…6: benötigte Meilensteine/Trainings/Forschungen/Crafts/Klassenkäufe jeweils [1,2,3,4,5,6]; frühe Hardwaretiefe [10,25,50,100,250,500]; Bereiche [1,2,3,4,5,5]; verschiedene lokale Crafttypen [1,1,2,2,3,3]; Seltenheitsrang [0,1,2,3,4,5]; erlaubte Klassen [5,5,4,4,3,3]; Datenfaktor [0,10;0,08;0,06;0,04;0,02;0,01]; Inflation [100,150,225,350,500,750]; wählbare Nachbarschaftslinks [5,4,3,2,1,1]. Fragmented Network benötigt min(Kapitel,erlaubte Links) aktive ausgewählte Links.

Hands Off und Inflation verlangen ab Kapitel4 zusätzlich min(10;1+floor((s−1)/7)) lokale Prestiges. Jedes davon muss die Stufen-Mindest-INT erreichen; vorzeitiger lokaler Reset wird klar gesperrt. Andere Familien verlangen keine zusätzliche Anzahl Prestiges. Q-only/E-only verlangen das tatsächliche erlaubte Trainingslevel ceil(s/8), keine bloße KI-Multiplikator-Äquivalenz.

| ID / Familie | Restriktion einschließlich KI/Integration | Verbindliche Ziele zusätzlich zu Kapitel-Prestiges | Sicherer Zugang |
| --- | --- | --- | --- |
| no-taps / Hands Off | Keine Taps, aktiven Tapdrops oder manuell gestarteten Overdriveeffekte. K04-Spezialität/sekundärer Crit ohne Nutzen; gemeinsamer Kern gilt. | Passive produzierte Credits ≥C. | Bezahlter Starter, passive Credits; alle weiteren Käufe manuell oder lizenziert. |
| no-items / Bare Metal | Alle Itemboni/Combos, K05/K10-Itemfähigkeiten und Integration deaktiviert; gemeinsamer KI-Kern gilt. | Compute ≥K; bezahlte Meilensteine ≥Kapitelwert. | Hardware/Forschung; keine Itemvoraussetzung für Hardware. |
| five-hardware / Compact Stack | Nur erste erlaubte Anzahl Klassen kaufbar; bestehende Sitzungskopie beginnt ohne unzulässige Hardware. | Produzierte Credits ≥C; calculator oder sbc Stückzahl ≥frühe Tiefe. | Erste Klassen bleiben unbegrenzt mit Credits kaufbar. |
| data-crunch / Data Drought | Datenproduktion mit Kapitel-Datenfaktor. K03 erlaubt; Training/Forschung werden regulär bezahlt. | Erzeugte Daten ≥D; bezahlte lokale Trainings und Forschungen jeweils ≥Kapitelwert. | Daten entstehen ab Starterhardware; alle ersten Forschungen sind nur Datenkosten. |
| inflation / Brutal Inflation | Reguläre Hardwarepreise ×Kapitelinflation; einmaliger Starter wie oben 15 Credits. | Produzierte Credits ≥C; bezahlte Hardwarekäufe ≥Kapitelwert. | Starter produziert; weitere Geräte werden bezahlt, nicht synthetisch als Kauf gezählt. |
| quality-lock / Quality Only | Efficiency gesperrt, Quality erlaubt. Deutsche Anzeige korrigiert den missverständlichen alten Namen. | Quality ≥ceil(s/8); Credits/s ≥C. | Quality-Training gegen Credits; KI-Revenue erlaubt, ersetzt aber kein Level. |
| efficiency-lock / Efficiency Only | Quality gesperrt, Efficiency erlaubt. | Efficiency ≥ceil(s/8); Nutzer/s ≥N. | Efficiency-Training gegen Credits; KI-Nutzer erlaubt, ersetzt aber kein Level. |
| serial-science / Serial Science | Genau ein Labor; ab Kapitel2 nach jedem Forschungsstart Bereich wechseln. KI-Forschung erlaubt. | Bezahlte Abschlüsse ≥Kapitelwert; verschiedene Bereiche ≥Kapitelwertliste; bezahlte Forschungsdaten ≥Budget. | Fünf neue Forschungsbereiche erreichbar; Planer filtert gleiche letzte Startarea aus. |
| closed-supply-chain / Closed Supply Chain | Keine fertigen Zufallsitems aus Drops, Shop oder Werbung; Komponenten/gezielte Synthese/Crafting/Fusion erlaubt. | Lokale Crafts ≥Kapitelwert; maximal lokal erreichter Rang ≥Kapitelrang; verschiedene lokale Typen ≥Liste; Daten ≥D. | Sechs Startertypen, Common-Synthese und 3:1-Fusion erlauben alle sechs Seltenheiten ohne RNG. |
| fragmented-network / Fragmented Network | Nur vor Start ausgewählte Links wirksam, höchstens Kapitel-Limit; andere Nachbarschaftsbeiträge null. | Compute ≥K; aktive ausgewählte Links ≥min(Kapitel,Linklimit). | distributedInference dauerhaft zugänglich, erforderliche Vorgänger/Nachfolger regulär bezahlen. |

### 13.3 Familienboni ohne alte Doppelpfade

Pro Familie zählt ausschließlich die höchste erstmals geschaffte Stufe h: **B=0,08×ln(1+h)**, bei h=0 null. Wiederholen gibt keinen zusätzlichen permanenten Bonus. Der vorhandene Aufgaben-/Belohnungstext wird auf die folgenden genau einmaligen Zielgrößen vereinheitlicht:

| Familie | Genauer permanenter Zielpfad |
| --- | --- |
| Hands Off | Ökonomisches Offline-Zeitbudget ×(1+B), danach gekaufte additive Stunden genau einmal ergänzen. |
| Bare Metal | Hardware-Rohcompute ×(1+B), ohne separates zweites Mastery-Revenueprodukt. |
| Compact Stack | Compute-Beiträge der Meilensteine von calculator/sbc/pc im Bonusanteil ×(1+B). |
| Data Drought | Numerische Hardware-Datenmeilensteinboni im Bonusanteil ×(1+B). |
| Brutal Inflation | Allein H07-Verbund-Bonusanteil ×(1+B), nach H07-Kappung; ohne H07 als spätere Wirkung zeigen. |
| Quality Only | Quality-Bonusanteil über 1 ×(1+B), einmal vor T01-Exponent. |
| Efficiency Only | Efficiency-Bonusanteil über 1 ×(1+B), einmal vor T02-Exponent. |
| Serial Science | Forschungsgeschwindigkeit direkt ×(1+B), kein alter zweiter Meilensteinpool. |
| Closed Supply Chain | Rückgewinnungsmenge ×(1+B), weiterhin maximal 75 % gebundener Inputs einschließlich C05. |
| Fragmented Network | Zusätzlicher Link-Rohcomputeanteil ×(1+B), kein zweiter Gesamtcompute-Faktor. |

Gemeinsame funktionale Challenge-Lizenzen nach erstmals erreichten Stufensummen 21/42/70/140/245/350: research-queue→F02-Funktion, training-queue→T03, research-repeat→F03, analysis-planner→C02, crafting-planner→C03, prestige-agent→I06 samt Minimalstarter. Diese Lizenzen sind dauerhaft, kein voller Gratis-Knoten mit zusätzlichem Entdeckungszähler. Gleichwertige Prestige-/Axiomkäufe zeigen „enthalten“, Preis null und keinen zweiten Effekt. Bereits bezahlte historische Quellen werden bei Migration angerechnet, nicht doppelt angewendet. Das ist ein alternativer, genau ausgewiesener Funktionszugang; Axiom-Stufenvergleiche für regulär kaufende neue Accounts setzen ihn nicht voraus.

Die Zugangskontrolle jeder Familie ist jetzt spezifiziert. Vollständige 690-Ziel-Erreichbarkeit mit allen relevanten Modellen bleibt ein verpflichtender Simulationstest; die reine Existenz eines Quellenpfads beweist noch keine gute Laufzeit.

## 14. Bestandsmigration ohne doppelte Auszahlung

### 14.1 Geld und Rechte getrennt behandeln

Migration bekommt Versionskennung und dauerhafte Quittung. Vor Mutation unveränderten Save sichern. Quelle sind tatsächliche Kaufquittungen/Bestandsrechte, nicht die teilweise abweichenden Anzeige-Katalogpreise. Für bekannte alte Saveversionen ohne Quittungen den damaligen tatsächlichen Kaufpreis rekonstruieren: Sonderpreise shoppingAgent=1, trainingPlan=3, componentScanner=3, batchFabrication=100, milestoneMemory=100, modelSynthesis=1.000, researchArchive=10.000; übrige alte Baumknoten 10^(Tiefe−1). Bei unbekannter Version nicht raten: alten Save lesbar sichern und Migration mit erklärtem Wiederherstellungsweg anhalten.

Entscheidung: Keine pauschale Vollerstattung aller alten Käufe. Echte funktionale Entitlements werden übertragen und behalten ihren historischen investierten INT-Basiswert. Alte numerische Verbesserungen werden als ausgewiesene Legacy-Kontinuität erhalten, keine automatische moderne Endknotenstärke. Ausschließlich manufacturing1, manufacturing3 und manufacturing5 werden als nun kostenlose/entfallene Grundfunktionen aufgelöst: tatsächlich bezahlten Preis von P nach U verschieben, I bleibt gleich. Kein Wiederholungsrefund bei Reload.

### 14.2 Vollständige Zuordnung der 48 alten INT-Knoten

| Alter ID / Name | V2-Zuordnung; ein alter Kauf bleibt ein Investitionsbeleg |
| --- | --- |
| shoppingAgent / Einkaufsagent | H01-Funktion; bezahlte Autobuyerrechte erhalten |
| trainingPlan / Trainingsplan | T03-Funktion |
| componentScanner / Komponentenscanner | Legacy: passive Zielmaterialgewichtung ×2; kein zweiter Mengeneffekt |
| dataArchive1 / Datenarchiv I | Legacy Daten-/Creditskontinuität; kein zusätzlicher alter Lifetime-Datenpfad |
| dataArchive2 / Datenarchiv II | Legacy Daten-/Creditskontinuität; kein zusätzlicher alter Lifetime-Datenpfad |
| dataArchive3 / Datenarchiv III | Legacy Daten-/Creditskontinuität; kein zusätzlicher alter Lifetime-Datenpfad |
| computeNet1 / Compute-Netz I | Legacy Compute-/Creditskontinuität; vorhandene Nachbarschaftsrechte erhalten |
| computeNet2 / Compute-Netz II | Legacy Compute-/Creditskontinuität; vorhandene Nachbarschaftsrechte erhalten |
| computeNet3 / Compute-Netz III | Legacy Compute-/Creditskontinuität; vorhandene Nachbarschaftsrechte erhalten |
| analysis1 / Analyse I | Legacy Analysemenge/-geschwindigkeit; alte Itemeffekte in numerische Kontinuität überführen |
| analysis2 / Analyse II | Legacy Analysemenge/-geschwindigkeit; alte Itemeffekte in numerische Kontinuität überführen |
| analysis3 / Analyse III | W03 plus Legacy Analysemenge/-geschwindigkeit; alte Itemeffekte in numerische Kontinuität überführen |
| labs1 / Labore I | F01 |
| labs2 / Labore II | F02-Funktion |
| labs3 / Labore III | F03-Funktion |
| manufacturing1 / Fertigung I | Tatsächlichen Preis erstatten; drei Basisslots/Fertigung sind kostenlos |
| manufacturing2 / Fertigung II | W04 |
| manufacturing3 / Fertigung III | Tatsächlichen Preis erstatten; globales Schmiedelevel entfällt |
| dataArchive4 / Datenarchiv IV | Legacy Daten-/Creditskontinuität; kein zusätzlicher alter Lifetime-Datenpfad |
| dataArchive5 / Datenarchiv V | Legacy Daten-/Creditskontinuität; kein zusätzlicher alter Lifetime-Datenpfad |
| dataArchive6 / Datenarchiv VI | Legacy Daten-/Creditskontinuität; kein zusätzlicher alter Lifetime-Datenpfad |
| dataArchive7 / Datenarchiv VII | Legacy Daten-/Creditskontinuität; kein zusätzlicher alter Lifetime-Datenpfad |
| dataArchive8 / Datenarchiv VIII | Legacy Daten-/Creditskontinuität; kein zusätzlicher alter Lifetime-Datenpfad |
| computeNet4 / Compute-Netz IV | Legacy Compute-/Creditskontinuität; vorhandene Nachbarschaftsrechte erhalten |
| computeNet5 / Compute-Netz V | Legacy Compute-/Creditskontinuität; vorhandene Nachbarschaftsrechte erhalten |
| computeNet6 / Compute-Netz VI | Legacy Compute-/Creditskontinuität; vorhandene Nachbarschaftsrechte erhalten |
| computeNet7 / Compute-Netz VII | Legacy Compute-/Creditskontinuität; vorhandene Nachbarschaftsrechte erhalten |
| computeNet8 / Compute-Netz VIII | Legacy Compute-/Creditskontinuität; vorhandene Nachbarschaftsrechte erhalten |
| analysis4 / Analyse IV | Legacy Analysemenge/-geschwindigkeit; alte Itemeffekte in numerische Kontinuität überführen |
| analysis5 / Analyse V | Legacy Analysemenge/-geschwindigkeit; alte Itemeffekte in numerische Kontinuität überführen |
| analysis6 / Analyse VI | Legacy Analysemenge/-geschwindigkeit; alte Itemeffekte in numerische Kontinuität überführen |
| analysis7 / Analyse VII | Legacy Analysemenge/-geschwindigkeit; alte Itemeffekte in numerische Kontinuität überführen |
| analysis8 / Analyse VIII | Legacy Analysemenge/-geschwindigkeit; alte Itemeffekte in numerische Kontinuität überführen |
| labs4 / Labore IV | Legacy Forschungsgeschwindigkeit; explizit bereits erworbene Kapazität als Recht erhalten |
| labs5 / Labore V | T06-Funktion |
| labs6 / Labore VI | Legacy Forschungsgeschwindigkeit; explizit bereits erworbene Kapazität als Recht erhalten |
| labs7 / Labore VII | Legacy Forschungsgeschwindigkeit; explizit bereits erworbene Kapazität als Recht erhalten |
| labs8 / Labore VIII | Legacy Forschungsgeschwindigkeit; explizit bereits erworbene Kapazität als Recht erhalten |
| manufacturing4 / Fertigung IV | Legacy numerische Itemkontinuität, kein moderner Gratisendknoten |
| manufacturing5 / Fertigung V | Tatsächlichen Preis erstatten; Core/Forschung schon Basis |
| manufacturing6 / Fertigung VI | W01 dauerhaft |
| manufacturing7 / Fertigung VII | W02 dauerhaft |
| manufacturing8 / Fertigung VIII | W06 dauerhaft |
| batchFabrication / Serienfertigung | W07 |
| modelArchive / Modellarchiv | T08 |
| milestoneMemory / Milestone Memory | I02 |
| modelSynthesis / Model Synthesis | I03 |
| researchArchive / Research Archive | I04; vorhandenes Forschungswissen erhalten |

Legacy-Kontinuität wird am Snapshot kalibriert, nachdem neue Funktionsrechte angewendet sind: zuerst fehlenden Compute gegenüber dem alten Zustand durch maximal einen Compute-Legacyfaktor max(1;alt/neu) ausgleichen. Danach Daten-, Forschungs-, Trainings-, Analysegeschwindigkeits- und numerische Itembonusfamilien jeweils nur um ihre verbleibende Lücke erhöhen. Abschließend Revenue so ausgleichen, dass passive Credits und erwartete Tapcredits am Snapshot nicht sinken: größter nötiger alt/neu-Quotient. Alte Faktoren werden aus dem alten Rechenpfad entfernt; die errechneten sichtbaren Legacyfaktoren ersetzen sie. Die Faktoren erhalten eine Herkunft und Resetklasse: alte INT-Zahlenboni gelten für den aktuellen Axiom-Zyklus und verfallen beim nächsten Axiom; alte permanente Axiom-/Echtkaufrechte bleiben dauerhaft. Dafür zuerst einen Vergleich ohne alte und ohne neu zugeordnete INT-Boni für den permanenten Rest durchführen, anschließend den verbleibenden Unterschied des vollständigen Snapshots als Zyklus-Rest bestimmen. Ein Zyklus-Rest darf nicht als permanente Kompensation fortleben. Keine Rekalibrierung bei späterem Respec, KI-Wechsel oder Reset. Sonderfälle mit Nullproduktion werden anhand der zugrunde liegenden Bonusanteile/standardisierter Testhardware verglichen, nicht durch Division durch null.

Diese Ratekontinuität ist keine Garantie, dass jede alte Buildrelation nach dem Rebalancing identisch bleibt. Sie verhindert eine sofortige Entwertung des konkreten Savezustands und vermeidet die Gratisabbildung eines alten Billigkaufs auf einen modernen extrem teuren Endbonus. Anfangswerte und Faktoren werden im Migrationsreport aufgeführt. Alte Gegenstandsidentitäten und Inventarobjekte bleiben erhalten.

Gekaufte Slotrechte nach Produkt-/Transaktions-ID in eindeutige zusätzliche Rechte überführen, getrennt von W01/W02/W06. Bereits bezahlte Labore als eigene lab-entitlement IDs, niemals gleichzeitig als Prestige-Labor und bezahltes Labor zählen. Bestehende Offlineverträge als konkrete additive Stunden mit ihren Belegen übernehmen. Mehr als acht versprochene Slots oder mehr als heutige Queuekapazität als geschützte Überhangrechte erhalten. Überhanginventar löscht nichts. Bereits finanzierte zusätzliche Fertigungsstationen bleiben als eigene Kapazitätsrechte; sie sind kein globales Schmiedelevel. Für entfallene globale Schmiedelevel werden die damals tatsächlich verbrauchten Materialien einmalig zurückgegeben und deren Bonus entfernt. Quittungen oder die bekannte alte Kostenkurve bestimmen diese Menge; keine Materialerstattung plus fortbestehender Levelbonus. Alte bereits automatisch freigeschaltete Hardwareklassen erhalten je eine geschützte Autobuyer-Lizenz.

### 14.3 Alte Axiome und Challenge-Lizenzen

| Alte Funktion | Ziel |
| --- | --- |
| axiomResonance | A01 bis min(5;alte Stufe), historische Zahlung anerkennen; eventuell größere alte numerische Wirkung über ausgewiesene Legacykontinuität, nicht über p>0,72. |
| axiomAutomation / prestigeAgent | Grundlegende I06-Funktion samt Minimalstarter und B02-Verankerung. |
| axiomArchive | C01 Stufe1; historische Preisbasis erhalten. |
| anchoredShoppingAgent | B01 und zuvor tatsächlich erworbene H-Lizenzen, keine noch nie entdeckten Klassen. |
| analysisPlanner | C02-Funktion |
| craftingPlanner | C03-Funktion |
| Challenge-Funktionslizenzen | Auf die unter 13.3 genannten gleichwertigen Funktionen abbilden; Quellen vereinigen, Wirkung genau einmal. |

Freie und insgesamt verdiente Axiome bleiben unverändert; alte bezahlte Stufen dürfen historisch günstiger gewesen sein. Diese Alt-Lizenzen werden im UI ausgewiesen, nicht als neue nominal bepreiste Käufe verbucht. Doppelte Quellen ergeben ein Recht, keine mehrfachen Multiplikatoren. Historisch gekaufte INT-Knoten zählen einmal für den ersten 30er-Nachweis; neu zugeordnete Rechte werden nicht zusätzlich als zweite Käufe gezählt.

**Konkretes Buchhaltungsbeispiel des vorhandenen Reports:** I=349, U=97, investiert P=252. Falls manufacturing1 nach alter tatsächlicher Preiskurve 1 INT gekostet hat, danach I=349, U=98, P=251. Die Slotgrundfunktion ist kostenlos geworden; es wird nicht zusätzlich das gesamte P von 252 erstattet. Zweiter Migrationsaufruf verändert nichts. Für gemappte Funktionsknoten bleiben historische Investitionsbeträge bestehen, nicht die neuen höheren Listenpreise.

## 15. Alle 32 Audit-Befunde: endgültige Entscheidung

„Entschieden“ bedeutet: Die fachliche Regel steht in dieser Fassung. „Referenz geprüft“ bedeutet die begrenzte isolierte Prüfung; es ist kein behaupteter Produktionsfix. Die Implementierung und ihre Integrationsprüfungen sind noch auszuführen.

| Befund | Verbindliche Korrektur | Abschnitt | Nachweis / Grenze |
| --- | --- | --- | --- |
| 01 · Zufallsfund ohne passenden Basisslot | Drei Basisslots ab Start; keine Item-/Fertigungs-Prestigesperre. | 7.3 / 8.1 | Slotmengen, Starterfamilien |
| 02 · Höhere Slot-Knoten entwerten niedrigere Käufe | Unabhängige feste Slot-IDs, kein Präfix; alle Kaufreihenfolgen. | 7.3 | 6 Reihenfolgen geprüft |
| 03 · Autotraining kann Auto-Prestige endlos verhindern | Resetabsicht stoppt neue Wiederholungen; wartet auf endliche bestehende Job-ID-Menge. | 11.1 | Einfaches Wartemodell geprüft |
| 04 · 32 Offline-Resets pro Aufruf verändern den Ertrag | 32 ist technische Portion; Restzeit fortsetzen. | 11.4 | 1/3/96 Segmente im Referenzmodell |
| 05 · Nutzermodell ist dem Revenue-Modell überlegen | K01 Revenue3; K02 Nutzer2 mit Datenwirkung, gemeinsame Kernbasis. | 6.2 | Isolierter Rollenkontrast geprüft; Buildmatrix noch App-Test |
| 06 · Modellarchiv erschwert den eigenen Trainings-INT-Bonus | T07/I03 aus aktuellen Q/E/G; T08 erhält deren Nutzen. | 3.4 / 7.1 | Archiv-Gewichtsbeispiel |
| 07 · Forschung bleibt erhalten, Forschungs-INT beginnt trotzdem bei null | I04 aus dauerhaften Forschungsleveln/Projekten. | 3.4 | Erhaltener Forschungsstand bleibt gewichtswirksam |
| 08 · Die teuersten Tap-/Item-Knoten konkurrieren nicht mit Compute | Compute-Endbonus8 statt10000; Kosten und alternative Endeffekte neu. | 4 / 10 | Isolierte Faktoren/Preise; Laufvergleich noch offen |
| 09 · Materialforschung verteuert Analysen stärker als sie verbessert | Materialforschung erhöht nur Ausbeute, kein automatisches1,4-Kostenwachstum. | 8.3 | Gleicher Auftrag wird effizienter |
| 10 · Ein neuer KI-Kauf garantiert noch keinen nützlichen Fortschritt | Jede KI hat sofort gemeinsamen Revenuekern, auch leere Slots. | 6.2 | Alle zehn ersten Lose nutzbarer Grundkern |
| 11 · Drei freie Slots garantieren noch keine drei Item-Familien | Sechs sichere Starterrezepte, erste drei gewöhnlich, Hilfe und Modulpfade. | 8.1 / 8.2 | Familien-/Zutatenabdeckung |
| 12 · Axiome können vor dem ersten entwickelten KI-Modell auftauchen | Einmaliges1000-Erkenntnisbudget im Labor; Tutorial vor Axiom. | 2 / 6.1 | Erster Kauf stets bezahlbar |
| 13 · Alle 15 Autobuyer sind viel früher kaufbar als geplant | Autobuyerpreise1/300/15000/150000/3e6. | 4 | Staffelung und Summe |
| 14 · Auto-Prestige und Wiederaufbau benötigen nicht enthaltene Starter | Reset-Agenten enthalten bezahlten15-Credits-Starter. | 11.2 | 50−15=35, keine H01-Abhängigkeit |
| 15 · Mehrere Agenten teilen keine verbindlichen Sparziele | Globale absolute Ziel-Escrows vor billigen Wiederholungen. | 11.3 | Teures Ziel wird nicht verhungern |
| 16 · Kosten- und Grundarbeitsrabatte fördern ständiges KI-Wechseln | KI verändert laufende Raten, keine Kosten/Grundarbeitsrabatte. | 6.2 / 8.4 | Verträge und Fähigkeiten abgegrenzt |
| 17 · Erster Axiom-Reset kann Ausrüstung stark schwächen | Feste Zusatzslots bleiben immer; B03 wird Itemresonanz. | 5 / 7.3 / 12 | Keine Erst-Axiom-Slotverlustklausel |
| 18 · Gekaufte Slots, Labore und Offline-Vorteile können doppelt gezählt werden | Rechte nach Transaktionsquelle; bezahlte Rechte additiv/genau einmal. | 14.2 | Vollständige Zuordnung, Produktionsmigration noch testen |
| 19 · Serienherstellung kann Ressourcen überreservieren oder refund-exploitbar werden | Einzelverträge/Reservestatus/Rückgabe/Rückgewinnungsbuch. | 8.4 | Abbruch einmal, Kostenbasis kein Gewinn |
| 20 · Forschungszugänge hängen noch an alten Prestige-Knoten | 18 Forschungen+8 Projekte mit reinem neuem DAG. | 9 | Alle26 erreichbar, keine alten ID-Gates |
| 21 · Prestige- und Axiom-Agent können konkurrieren | Axiomvorrang, getrennte Uhren, atomare Abholung. | 3.5 / 11 | Grenzfall und Uhrmodell |
| 22 · Drei späte Rechnerprofile passen nicht zum angegebenen Axiom-Budget | Neue Profile A1/10/100/1000 mit echtem Budget. | 5 / Rechner | Kosten1/10/91/847 geprüft |
| 23 · 30 von 60 bedeutet nicht halbe Spielzeit oder halbe Macht | 30 Knoten ist Vielfalt, keine halbe Zeit; Kosten94.181 transparent. | 2 | Summe geprüft; zeitliche Ziele als Messauftrag |
| 24 · Erkenntnisproduktion und KI-Preise sind noch nicht zusammen kalibriert | Preise2,2^k, Upgrade1,22^L und Erkenntniskurve zusammen gerechnet. | 6.3 | Statische Raten-/Preistabelle |
| 25 · Overdrive wird dauerhaft und aktive Boni überschreiten den Zielkorridor | Tapweichgrenze einschließlich Crit/Proc; ODmax30s/60s. | 10 | Erwartete Tapgrenze und OD-Duty geprüft |
| 26 · Combo, Overdrive-Ladung und Leerlauf sind nicht sauber getrennt | Combo/Ladung/Cooldown/Leerlauf/Akzeptanz getrennt. | 10 | Normative Zustandsregeln; App-Lifecycle noch testen |
| 27 · Die 39 Einzelprüfungen decken keine vollständige Wirtschaft ab | Keine Vollsimulationsbehauptung; genaue Produktions-Abnahme und Zahlenschema. | 3.6 / 17 | Decimal/Segmentprüfung, volle Economy ausstehend |
| 28 · Seltenheitsgarantie bei einer Tabelle ohne seltene Komponenten | Genau ein Graphen-Fallback; keine seltene Tabelle erforderlich. | 8.3 | Gemeinsamer Pool ohne seltene Elemente terminiert |
| 29 · Grenz- und KI-Verstärker können aktuell null Nutzen haben | A05/D03/K10-Level besitzen aktuellen Zusatznutzen; enthaltene Funktionen nicht erneut verkaufen. | 4 / 5 / 6.2 | Level-/Kernrechnung; UI-No-op-Prüfung erforderlich |
| 30 · Erhaltene Rechte und Erstattungsbudget dürfen nicht doppelt entstehen | Keine Vollerstattung plus Erhalt; historischer Investitionsbeleg. | 14 | 349/97/252→349/98/251; idempotent |
| 31 · Ein endlicher Katalog garantiert keine monatelange Bindung | Unbegrenzter A02-Multiplikatornachlauf mit begrenzten Exponenten. | 5 / 17 | Nachlaufpreise, vereinfachte Rückkopplung |
| 32 · Neue Modelle und Integration ändern sämtliche Challenge-Builds | Alle zehn Familien mit Quellen, neuen KI-/Itemregeln und festen Zielen. | 13 | Zugangsgraph spezifiziert;690 Voll-Läufe ausstehend |

## 16. Oberfläche, Präsentation und Feedback

Prestige zeigt sechs klare Bereiche mit Preis, erworbenem Status und kurzem Effekt. Knoten sind unabhängig antippbar; Kaufdialog erklärt den echten Vorher-/Nachherwert. Bereits enthaltene Funktionen sind als erfüllt markiert und kosten nicht erneut. Farbige Linien bedeuten Thema, keine Sperre. Axiome zeigen die nächste Schwelle, Creditsgesamtfaktor und INT-Exponent getrennt.

Hardware-AUTO gehört direkt in die jeweilige Zeile: aus, spart, wartet auf Preis, kauft, durch Reset pausiert. Globaler Einstieg in der Kaufleiste enthält Pause, Reserve, Prioritäten und Modus. Forschung nutzt den normalen Button „Starten“ oder „Einreihen“, zeigt Warteposition direkt auf der Karte und kein neues Warteschlangenfenster.

Das Labor lebt innerhalb Forschung. Oben Erkenntnisrate/nächster Modellpreis, darunter genau eine aktive KI mit verständlichem Effekt und eine ruhige Sammlung. Modellkarten zeigen echten Revenuekern plus Spezialität. Bei Wechsel werden die wegfallenden K10-Slots vorher genannt. Keine zweite parallele Modellwirtschaft.

Bestehende kantige Designsprache weiterführen: klare Kanten und einheitliche Rahmen, keine erneut stark abgerundeten Shop-/Prestigefenster. Itemdarstellung etwas größer, klare Typform, kräftiger Seltenheitsrahmen. Common grau, Uncommon grün, Rare blau, Epic violett, Legendary orange/gold, Mythic rot. Form/Label ergänzen Farbe. Große Touchziele mindestens44×44 CSS-Pixel, kurze Texte, gut lesbare Zahlen. Ein +20-%-Bonus wird als Bonus und resultierender Faktor erklärt, nicht als unlesbare Symbolkette.

Passende Animationen: Crafting ca.0,8–1,2s mit Aufbau und fertigem Item; Fusion ca.1,2–1,8s mit drei Inputs →ein Ergebnis und eindeutigem neuen Seltenheitsrahmen; KI-Entwicklung ca.1,5s mit verdecktem Pool →Modellkarte; manueller Axiom-Reset ca.1s mit neuer Ebene. Bei Serienaktionen eine zusammengefasste Rückmeldung; Auto-Prestiges erzeugen keine dauernden Vollbildunterbrechungen. „Bewegung reduzieren“ kürzt auf kurze Zustandswechsel. Belohnung wird vor Animation atomar gespeichert; Überspringen/Reload verliert und vervielfacht nichts. Haptik/Audio optional, Kauf-/Belohnungszustand unabhängig vom Abspielen.

Shop, Gumball und Werbezugänge dürfen Ausrüstung beschleunigen, sind kein Pflichtweg für die drei ersten Itemfamilien. Echte Echtgeldtransaktionen bleiben bis nativer Kaufanbindung als nicht kaufbare Vorschau markiert. Dieses Konzept ersetzt keine noch ausstehende Shop-/Native-Implementierung; es verhindert deren Verwechslung mit Prestige-/Slotrechten.

## 17. Gerechnete Prüfungen, Grenzen und konkrete Umsetzungsabnahme

**Ausgeführt: 116 Assertions in eigenständigen Referenzmodellen.** Kataloganzahl, alle sechs Slot-Kaufreihenfolgen, garantierte Starterfamilien/20 Materialarten, Forschungsgraph, Preis-/Axiombudgets, KI-Pool ohne Duplikate, Kernstärke/Erkenntnispreise, INT-Buchung in1000 Teilbeträgen, nicht rückwirkender Exponentenkauf, relative große Potenzdifferenz, einfache Offline-Resetmodelle mit1/3/96 Segmenten, Ziel-Escrow, Einmalstorno, Salvage-Obergrenze, Tap-Erwartungsgrenze, OD-Laufzeit und idempotentes Migrationsbeispiel.

**Bewusst begrenzt:** Dies sind keine 116 unabhängigen Spielsystemtests und kein ausgeführter Lauf der App. Mehrere Assertions prüfen Varianten derselben Regel. Beispielsweise beweist die Simulator-Portionsprüfung nur das kleine periodische Resetmodell, nicht den vollständigen Hardware-/Forschungs-/RNG-Verlauf.

Für eine vereinfachte konstante Ausgangseconomy ohne neue Forschung ergibt sich selbst mit A02-Nachlauf ein asymptotischer Axiom-Wachstumsexponent von ungefähr **0.886858<1**: b=2,90+0,25+log_3(1,25), Rückkopplung (0,72b/(1−0,72×0,18)−1)/2. Das schließt den früher naheliegenden unbegrenzten Exponentensprung in diesem Teilmodell aus. Es beweist weder vollständige Stabilität noch Monatsbindung, weil neue Hardware, Forschung, Jobs und Entscheidungen darin fehlen.

### 17.1 Vor Merge zwingend im tatsächlichen Spiel prüfen

- Frisch aktiv, drei kurze Sessions/Tag, eine Session/Tag mit Offline, bestehender349-INT-Save sowie hohe INT/Axiome. Ohne Werbung oder Kauf müssen alle Kernzugänge erreichbar bleiben.
- Alle zehn ersten KI-Lose bei gleichen Ressourcen; Level0/15/30/50 und gleiche Erkenntnisausgaben. Mindestens ein starker Einsatzfall pro Modell; K01 nicht vom Nutzermodell vollständig dominiert. Nebenfälle Datenüberschuss, volle/leere Slots, kein laufendes Training.
- H/T/F/W/S/I-Builds bei gleichem freiem INT: Credits/s, Daten/s, INT/h, Erkenntnis/h, nächster Kauf und Zeit bis Axiom. Kein Endknoten darf andere um Größenordnungen verdrängen. Axiom-Budgets immer einschließlich Planer-/Komfortausgaben.
- Normales Prestige mit Archiv darf T07/I03 nicht verschlechtern; erhaltene Forschung wirkt in I04 nach Wiederkauf. Ausgerüstete Items über erste Axiome behalten feste Slots. Speicher-/Start-/Abschlussereignisse genau einmal.
- Wiederholtes Training/Forschung/Analyse mit wartendem Auto-Prestige; paralleler Axiom-Agent; Restart mitten im Reset. Keine fehlende Starterhardware, keine Doppelabholung, keine „Warteschlange wird nie leer“-Blockade.
- Dieselbe8h-Berechtigung einmal/dreimal/96mal verarbeiten, gleicher Zufallszustand; komplette Endzustände und Quittungen identisch bis dokumentierter wissenschaftlicher Resttoleranz. Auch technische Portionierung, aktive Boosterenden und App-Unterbrechung prüfen.
- Jede der690 Challenge-Stufen auf gültigen Zugriff/abschließbare Ziele; repräsentative Voll-Läufe jeder Familie und Kapitelgrenze mit passenden KI-/Integrationsbuilds. Gesperrte Quellen, lokale Ressourcenkopien, Hauptspielpause und Rückkehr dürfen nichts leaken.
- Transaktionsabbrüche in jeder Reservierungs-/Start-/Abschlussphase, Materialrecycling+Fusion+Salvage sowie gemischte Kaufrechte/Migration zweimal. Keine negativen Ressourcen, verschwundenen bezahlten Rechte oder vervielfachten Inputs.
- ScientificNumber plus Restledger bei1e128/1e350 und kleinen Einnahmen/Abzügen, Save/Load, floor-Grenzen und Wechsel verschiedener Tickgrößen. Einmal1Credit versus1000×0,001 darf keine unterschiedliche Kaufkraft schaffen.
- UI auf kleinem iPhone und großer Schrift: lange Preise, alle Slottypen, Einreihbutton, effektive Tapwerte, „enthalten“-Knoten, Verlustvorschau, reduzierte Bewegung und exportierbarer Balance-Report.

### 17.2 Reihenfolge der Umsetzung

1. Neue Datenkataloge und eindeutige Ledger-/Rechte-/Slot-IDs; Save-Sicherung und idempotente Migration zuerst.
2. Produktions-/INT-/Axiomformeln samt großen Zahlen und Resettransaktionen. Referenzfälle als Integrationsfälle portieren.
3. Freie Itemzugänge, Starter-/Synthesepfade, Auftragsreservierung, Forschungskatalog und erhaltene Infrastruktur.
4. Genau eine aktive KI mit Erkenntnis, Ziehung, Leveln und dynamischer Restarbeit. Mira-Einführung.
5. Gemeinsamer Scheduler, Escrows, Wiederaufbau, Offlineäquivalenz und alle Challenge-Verträge.
6. Kantige UI, Seltenheitsfeedback, Animationen; anschließend Profil-Simulation und gezielte Preiskalibrierung. Erst danach native Builds/PR-Abnahme.

Der Konzeptumfang ist damit abgeschlossen: Alle32 Auditpunkte haben eine verbindliche Entscheidung, alle60 Prestige- und24 Axiom-Knoten feste Effekte und Preise, alle10 Modelle einen definierten Rechenpfad. Offene Produktionsprüfungen sind ausdrücklich als Abnahmearbeit benannt und werden nicht als erledigte Spielfixes ausgegeben.

## 18. Grundlage und Änderungsnachweis

Ausgangspunkt sind Konzeptv1, der vollständige32-Punkte-Systemaudit vom16.10.2026 und der bereits ausgewertete349-INT-Balance-Report. Aktuelle Quellbasis wurde über das Repository gelesen, insbesondere economy.ts sowie challengeStages.ts und Forschungszugänge. Tatsächlicher Code ist Grundlage für alte IDs und bestehende Kurven, nicht Beleg für die hier neu entworfenen Zahlen.

Primärquellen: [Repository](https://github.com/Kayza1708/Idle-game-), [Economy](https://github.com/Kayza1708/Idle-game-/blob/main/src/economy.ts), [Challenge-Verträge](https://github.com/Kayza1708/Idle-game-/blob/main/src/challengeStages.ts), [Forschungszugang](https://github.com/Kayza1708/Idle-game-/blob/main/src/researchAreas.ts). Neu in v2 sind insbesondere freie/persistente Slots, sichere Itempfade, neue Einzelpreise, Kernbonus für jede KI, Modellpreise2,2^k, sichere Auftrags-/Agentenregeln, begrenzte Tap-/OD-Skalierung, präzise Altzuordnung und der unbegrenzte A02-Nachlauf.

**Version2.0 ist ein Konzeptdokument. Es wurden in diesem Auftrag keine App-Dateien geändert, keine Builds erzeugt und keine Pull Request veröffentlicht.**

