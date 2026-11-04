# Mathematisches Wirtschaftsmodell · 4. November 2026

Dieser Bericht ersetzt die frei gewählte Staffel ×6/×10/×20/×35/×50/×80/×100 aus dem vorherigen Materialpreis-Entwurf. Die Zahlen in älteren Berichten bleiben historische Zwischenstände. Aktuelle Preise entstehen aus dem nachfolgenden Modell in `Assets/IdleIntelligence/Core/EconomyBalance.cs`, nicht aus dem Einkommen oder Guthaben des Spielers.

## 1. Was vorgegeben und was berechnet ist

Eine Formel kann ein gewünschtes Spieltempo abbilden; sie beweist nicht, welches Spieltempo Spaß macht. Die ausdrücklich gewünschte Produktvorgabe lautet: ein spätes Item benötigt mit passender Forschung/Ausrüstung ungefähr **1–2 Wochen Materialbeschaffung**. Daraus werden Mengen rückwärts berechnet. Der Einstieg behält seine sechs Starterrezepte. Die Zutatenwahl eines regulären Rezepts ist seine thematische Zusammensetzung, keine zweite Preisliste.

Die Referenz betrachtet laufende Zeit des gemeinsamen Materialslots mit automatischer Wiederholung beziehungsweise zeitnahem Neustart. Daten zum Bezahlen der Quellen sind in den Materialtests ausdrücklich vorfinanziert. Offline-Limits, seltene Spielbesuche, neue Forschung, Ausstattungskäufe und Prestige-/Axiomresets verlängern oder verändern Kalenderzeit. Die Rechnung verspricht deshalb nicht jedem Spielstand dieselbe Wartezeit.

## 2. Geschlossene Produktions- und Preisketten

| System | Tatsächliche mathematische Struktur | Bedeutung / Prüfung |
| --- | --- | --- |
| Hardware | Einzelpreis `B·r^n`; Menge k: `B·r^n·(r^k−1)/(r−1)` | r liegt je Klasse bei 1,16–1,31. Geometrische Summen statt linearer Mengenrabatte. Große Exponenten bleiben ScientificNumber. |
| Hardwareproduktion | `Σ(n_i·c_i·Meilensteine_i + Nachbarbeiträge_i) × Forschungs-, Item-, Modell- und Prestigeeffekte` | Der Audit misst marginales Einkommen durch tatsächlich ein zusätzliches Gerät; isolierte Basisklassen sind kein Endgame-Spielstand. |
| Nutzer | `Compute × Effizienzfaktor × Nutzerforschung × Modelle / ComputePerUser` | Gemeinsame Produktionsstufen aus Game.UsersTrace. |
| Credits | `Nutzer × 1,35 × Qualität × Forschung × INT × weitere ausgewiesene Effekte` | Alle tatsächlich angewendeten Faktoren stammen aus Game.IncomeTrace. |
| Daten | `0,1·Nutzer^0,55 × Datenforschung × weitere Effekte` | Unterlinearer Nutzer-Exponent; doppelte Nutzer bedeuten ohne weitere Effekte nur `2^0,55≈1,464` Daten. |
| Forschung | nach frühen Sonderpreisen: `ceil(B·1,85^L·4·1,15^L·Rabatt)` | Effektive Preisbasis **2,1275 pro Level**. Preise verdoppeln sich etwa alle 0,918 Level. Einmalige Projekte ohne Levelwachstum; kostenloser Tutorial-Schritt bleibt kostenlos. |
| Forschungswirkung/-arbeit | Wirkung meist `E^L`; Arbeit wächst mit 1,22 und hat eine Obergrenze | Ob Forschung rentabel ist, hängt von E, betroffener Produktionsstufe, Zahlungszeit und Arbeitszeit ab. Kein universelles „Preis = Einkommen × Wartezeit“. |
| Training | Credits `ceil(300·2,4^L·Rabatt)`; Integration eigene Basis/Wachstum; Arbeitszeit bis Cap | Stärkekurve zunächst linear, danach logarithmisch; Curriculum verschiebt die Schwelle, Distillation interpoliert zwischen logarithmischer und linearer Stärke. Nicht die Levelzahl direkt als Exponent sämtlicher Boni einsetzen. |
| INT | neue berechtigte Einkünfte erhöhen den Anspruch als Differenz einer Potenzkurve `(R/R0)^p` mit vorheriger Gewichtung | Native p = `0,50 + 0,04·A01 + 0,03·I10`, maximal **0,73**. Nur neu verdiente berechtigte Einnahmen zählen. |
| INT-Einkommen | `1 + Zyklus-INT·(0,10 + 0,06·I05 + 0,06·I10)` | Linear, kein Zinseszins durch Ausgeben/Erneutverbuchen derselben INT. |
| Wissen / Axiome | Wissen unter anderem proportional `sqrt(max(Zyklus-INT, Mindestanteil des Bestwerts))`; Axiomgewinn `floor(sqrt(INT/Schwelle) × Effekte)` | Reset-Rückgaben und gespeicherte Auftragsbelege werden nicht als neue Produktion behandelt. |
| Item-Stärke | `P = Raritätsfaktor·(1+0,01·(Level−1))·(1+0,02·Schmiedestufe)`; verschiedene Exponenteneffekte verwenden `sqrt(P)` | Level-, Schmiede- und Raritätsgrenzen bleiben erhalten. Nicht jeden zusätzlichen Itemfaktor ungeprüft auf jeden Exponenten multiplizieren. |
| Item-Levelupgrade | Materialwachstum 1,075; Datenwachstum 1,22; Komplexität aus ursprünglichem Rezept, begrenzt; neue Datengebühr ×4 | Bereits bezahlte Materialbasis wird nicht neu bewertet. |
| Schmiedestufen / Modelle / Knoten | Eigene begrenzte geometrische Kurven beziehungsweise authored Preisanker im bestehenden Katalog | Kein belastbarer Grund für eine zusätzliche pauschale Änderung aus dem aktuellen Material-Audit. |
| Shop / Gems / Belohnungen | Feste Produkt-/Belohnungsanker und deduplizierte Transaktionen | Kommerzielle Preisentscheidungen sind keine mathematisch zwingenden Ableitungen aus Produktionsraten. Keine SDK-/Storeänderung. |

Die kompletten aktiven Formeln stehen in `Game`, `PrestigeV3`, `MetaRules`, `ItemSystemV3`, `Workshop` und `Industry`. Die eingefrorenen Kataloge liefern historische Basisparameter; neue Tuningparameter stehen ausschließlich in EconomyBalance. Sonderfälle und Synergien bleiben im tatsächlichen Engine-Code maßgeblich.

### Rentabilität und Stabilität

Für einen Kauf ist die lokale Amortisation `T_payback = Preis / (Einkommen_nachher − Einkommen_vorher)`. Die Auditdatei berechnet die Differenz über die echten Produktionsfunktionen, einschließlich Meilensteinsprüngen. Ein Vergleich nur `Preis/Compute` würde Qualitäts-, Effizienz-, Nutzer- und Prestigeeffekte übersehen.

Bei festgehaltenen übrigen Boni führt eine INT-Rückkopplung `dR/dt = a·R^p` für p<1 zur Lösung `R(t)=[R(0)^(1−p)+(1−p)·a·t]^(1/(1−p))`. Das ist beschleunigtes, aber kein in endlicher Zeit unendliches Wachstum. Diese Teilrechnung beweist keine globale Stabilität bei gleichzeitig wechselnden Forschungs- und Itemeffekten. Der Audit prüft alle zulässigen A01/I10-Exponenten auf p<1.

Basisklassen allein zeigen im späten Hardwarekatalog sehr große Amortisationszeiten; sie setzen erhebliche globale Verstärkung voraus. Deshalb wurden die Hardwarebasispreise **nicht** anhand eines unaufgerüsteten Testzustands beliebig abgesenkt. [Alle 75 Hardwarepunkte](balance/math/hardware.csv) und [Forschungskurven](balance/math/research.csv) liegen offen. Eine komplette bezahlte Kampagne bis Matrioshka ist damit ausdrücklich nicht nachgewiesen.

## 3. Die neue Rezeptformel

Tier t läuft von 0 (Midgame) bis 6 (Apex). Zwei Produktanker und ein später linearer Deckel legen das Zeitziel fest:

```
p = ln((12 Tage · 24 Stunden · 5/7) / 6 Stunden) / ln(5)
  ≈ 2,196
T(t) = min(6 Stunden · (t+1)^p, 12 Tage · (t+1)/7)
```

| Tier | Referenzziel für neue Herstellung |
| --- | ---: |
| Midgame | 6 Stunden |
| Fortgeschritten / Server | 1,15 Tage |
| Campus | 2,80 Tage |
| Quanten / Frontier | 5,25 Tage |
| Geheimlabor / Modellsets | 8,57 Tage |
| Axiom | 10,29 Tage |
| Apex | 12 Tage |

Der Exponent wurde aus den Ankern rückwärts bestimmt. Der lineare späte Deckel verhindert eine unbegrenzte Eskalation der Wartezeit je neuer Stufe. [42 geprüfte Exponenten-/Tier-Kombinationen](balance/math/exponents.csv) vergleichen unter anderem 1,6, 1,9, 2,1, den gewählten Exponenten, 2,5 und 3. Ein Exponent 1,6 ergibt beim Apex nur 5,62 Tage und verfehlt die Vorgabe; eine höhere Potenz verteuert vor allem das Midgame, sobald das späte Zeitlimit greift.

Für ein Rezept mit relativen Zutatengewichten w_i wird ein einziger Skalenfaktor λ berechnet:

```
q_i(0) = ceil(λ · w_i)
q_i(m) = ceil(q_i(0) · (100−5m)/100),  m = 0…4
```

λ wird durch 64 Schritte einer deterministischen Intervallsuche so gewählt, dass die unten modellierte Beschaffungszeit T(t) entspricht. Somit entstehen die Stückzahlen aus **Zeitvorgabe plus Quellenmodell**. Es gibt keine sieben frei gewählten Multiplikatoren mehr. Mastery verändert jede einzelne gerundete Zutat; Serienfertigung multipliziert die fertigen Einzelpreise.

### Quellen statt fiktiver Stückpreise

Eine Analyse liefert mehrere Zutaten gleichzeitig. Das Modell minimiert deshalb nicht die Summe unabhängig geschätzter Sammelzeiten, sondern löst für **einen gemeinsamen Analyse-/Syntheseplatz**:

```
minimiere Σ_j x_j
unter Σ_j a_ij · x_j ≥ q_i und x_j ≥ 0
```

x_j sind Zeiten der gültigen Quellenstrategie j; a_ij ist ihre erwartete Zutatenmenge pro Sekunde. Die Quellen stammen aus den echten Regeln für Analysearbeit, Fokus, Fundmenge, Familienbonus und Synthese. Die äquivalente duale lineare Optimierung liefert einen überprüfbaren Beleg: Aus den zurückgegebenen Quellzeiten werden alle Zutatenbedarfe gedeckt. Mitfunde werden genau einmal gezählt.

Es werden drei Strategiefamilien geprüft: alle Analysen, nur kurze beziehungsweise nur lange Analysen, jeweils mit Synthese, Fokus und gültigen Ausrüstungspaaren. Die Lernzeit wird danach integriert; die schnellste dieser Strategien bestimmt die Rückwärtskalibrierung. Das ist ein konkret überprüfbares Strategiemodell, **kein Beweis global optimalen menschlichen Spiels**. Nicht modelliert: optionale Truhen, zufällige fertige Itemdrops, laufend andere Produktionsjobs und alle möglichen saisonalen Belohnungen. Sie können Herstellung umgehen oder beschleunigen.

Referenzfortschritt ist vorab definiert und unabhängig vom Spieler: pro Tier fünf Itemlevel, zwei Laborautomationslevel und fünf anfängliche Scanneranalysen, bis Epic; notwendige Familienforschung; ab fortgeschrittenem Tier W03/W06/W08/F03; ab Frontier die erste C06-Stufe. Verwendet werden nur frühere Sammelitems; das gerade bepreiste Item wird ausdrücklich ausgeschlossen. Zwei Forschungsitems benötigen den realen W06-Zusatzplatz. Sowohl deren Effekte als auch gültige Slotbegrenzungen werden berücksichtigt. Die genaue reproduzierbare Referenz steht in `EconomyBalance.MaterialReference`.

## 4. Gefundene und korrigierte Scanner-Rückkopplung

Vorher war `S(N)=N` bis K=25 und danach `25+sqrt(25·(N−25))` unbegrenzt. Der Scannerfaktor lautet `2^P·(1+0,05·P·S(N))`. Da weitere Analysen N erhöhen und damit ihre eigene Dauer reduzieren, war ein auf dem Anfangstempo kalkuliertes Zweiwochenrezept falsch bepreist.

Jetzt gilt:

```
S_cap(N) = min(S(N), 4·25)
Scannerfaktor = 2^P · (1+0,05·P·S_cap(N))
```

Das Maximum der Lernwirkung wird nach **250 Analysen** erreicht. Ein Common-Scanner auf Level 1 ohne weitere Stärkeverstärkung endet bei ×12; höhere Itemstärke bleibt wirksam. Die gespeicherte Zahl abgeschlossener Analysen wird **nicht gekürzt**. Prestige-/Axiomregeln und Saveversion ändern sich nicht. Die Detailansicht zeigt den tatsächlichen Faktor und den Lernbonus-Deckel.

Das Modell berücksichtigt auch den Weg bis zum Deckel: Es integriert `1/(1+b·S_cap(N))` über die Zahl der Jobs. Das Integral wurde mit diskreten Jobfolgen verglichen. Die zusätzliche Strategie mit kurzen Analysen verhindert, dass deren schnellerer Lernaufbau gegenüber langen Aufträgen übersehen wird. [Alter und neuer Verlauf](balance/math/scanner.csv).

## 5. Tatsächliche Beschaffung mit RNG

Zusätzlich zur Erwartungswertrechnung starten und beenden die Tests echte bezahlte Analyse-/Syntheseaufträge. Materialbestände starten bei null; Daten, Forschung und gültige Ausrüstung sind vorbereitete Testbedingungen. Ausrüstung/Fokus dürfen zwischen Quellgruppen wechseln. Es gibt keine geschenkten Komponenten. Drei Seeds pro Beispiel:

| Item | Gemessener Bereich |
| --- | ---: |
| Geheimlabor-Resonator | 8,65–8,72 Tage |
| Axiomanker | 10,32–10,37 Tage |
| Singularitätslinse | 12,02–12,06 Tage |

Der Test verwendet die echte Lernwirkung und echte Materialwürfe, nicht nur eine Multiplikation des gewünschten Zeitziels. Fehlmengen werden mit weiteren realen Aufträgen ergänzt. Die neun Läufe sind reproduzierbare Stichproben, kein statistischer Beweis für jedes Item und jeden Seed. Der verwendete kontinuierliche Plan wird durch ganze Jobs, Rundung und Zufall leicht überschritten. [Rohdaten einschließlich Jobs und ausgegebenen Daten](balance/math/seeded-materials.csv).

Die [Tabelle sämtlicher 36 regulärer Rezepte](balance/math/recipes.csv) nennt Ziel, eingefrorene Anfangsgeschwindigkeit, Zeit mit Lernfortschritt, Gesamtstücke und Datenbedarf der Materialquellen. Dieser Datenbedarf kommt wirtschaftlich **vor** der eigentlichen Craft-Datengebühr hinzu; er wurde nicht versteckt zum kostenlosen Input erklärt.

## 6. Numerische Sicherheit und Bestandsdaten

Extrem hohe zulässige Trainingslevel mit Distillation konnten bisher einen `double`-Zwischenschritt von Nutzer-/Creditproduktion überlaufen lassen. Solche Potenzen werden nun im großen Zahlenformat berechnet; gewöhnliche Werte behalten den bisherigen Rechenweg. Summen aus Qualität und Effizienz werden für begrenzte Produktionsboni vor der Addition auf double angehoben, um int-Überlauf zu verhindern.

Preise hängen niemals vom aktuellen Einkommen/Guthaben ab. Materialpreise sind deterministisch und gecacht; ausgegebene Quellenbeschreibungen sind unabhängige Kopien. Neue Items speichern ihre tatsächlich bezahlte Materialbasis. Bestehende Items, Rückgewinnungsbelege und laufende Aufträge werden nicht neu bewertet. Scannerzähler bleiben vollständig gespeichert; nur die Bonuswirkung erhält einen Deckel. Keine Migration, kein Reset und kein Überschreiben beschädigter Spielstände.

## 7. Reproduktion und Prüfgrenzen

```
dotnet run --project NativeChecks/UnityCoreCheck.csproj -- --math
dotnet run --project NativeChecks/UnityCoreCheck.csproj -- --balance
dotnet run --project NativeChecks/UnityCoreCheck.csproj -- --recipes
```

GitHub-CI führt den Mathematik-Audit aus und stellt die CSV-Dateien als Artefakt bereit. Die 120-Minuten-Kampagne ohne geschenkte Währungen bleibt gegenüber dem vorherigen Forschungs-/Hardwarestand unverändert: Minute 120 erreicht den ersten INT-Anspruch; diese einfache Strategie kauft vier Hardwareklassen und beansprucht keinen vollständigen Endgame-Nachweis.

Aktuelle Unity-/Build-Ergebnisse und Quellhashes: [Prüfmanifest](balance/math/verification.json). Die bestandenen 256 Tests des Zwischenstands und die finalen 257/257 Tests werden dort getrennt erfasst. Vollständige bezahlte Kampagnen über mehrere Axiomzyklen, alle maximalen Loadouts, Offline-Besuchsrhythmen und Echtgeldökonomie sind keine durch diese Rechnung erledigten Abnahmekriterien.

Aktuelle Handyansichten: [fünf Zutaten und Preise bei 320 px](media/economy-math/de-320-costs.png), [Scanner-Detail mit echtem Faktor und Grenze](media/economy-math/scanner-cap-de-390.png).
