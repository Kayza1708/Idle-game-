# Unity: Axiome und neue KI-Modelle

Stand: 19.10.2026, Unity **6000.3.26f1**, Arbeitsbranch `codex/unity-rewrite`, Ausgangscommit `83cc77ef`. PR #130 wurde extern gemergt; dieser Auftrag führt keinen Merge aus. Der Gesamtrewrite bleibt offen.

## Quellen und Datenvertrag

`MetaBalance.g.cs` exportiert reproduzierbar alle **24 aktuellen V2-Axiomknoten**, sämtliche Preisstufen einschließlich des unbegrenzten A02-Tails, die **zehn KI-Modelle**, Beschreibungen, Netzgeometrie und bestehende Recoveryregeln. Zahlen stammen aus `src/economy.ts` beziehungsweise aus den tatsächlich bestehenden verteilten Regeln in `progression.ts`, `progressionReset.ts`, `progressionAutomation.ts`, `progressionWork.ts`, `experiments.ts` und `recovery.ts`. Der Export bewahrt auch deren Nebeneffekte; keine Anpassung des TypeScript-Spielcodes oder seiner Balance. `npm run unity:export` / `npm run unity:check` umfassen beide neuen Exporte und die bisherigen INT-/Itemfälle.

`MetaState`, `MetaRules` und `MetaAutomation` bleiben in der unabhängigen C#-Assembly. Exakte Guthaben, Quellengewicht und bereits beanspruchte INT bleiben getrennt. Der A01-Kauf beeinflusst ausschließlich zukünftiges qualifiziertes Einkommen, niemals rückwirkend den gespeicherten Anspruch.

## Axiome und Reset

Vor dem ersten Axiom werden **30 unterschiedliche bekannte INT-Knoten** benötigt. Der Gewinn verwendet die bereits vergebenen Zyklus-INT **plus aktuell beanspruchbare INT**, geteilt durch die mit den gesamten Axiomen steigende Originalschwelle, danach Wurzel und Ganzzahlabrundung. Weitere Zyklen benötigen die ursprüngliche Bekanntheitsschwelle nicht erneut. Axiomkäufe ziehen ausschließlich das exakte freie Axiomguthaben ab; Gesamt-Axiome bleiben als Produktionsbasis erhalten. A02 erhöht erst sechs Mal den Exponenten und verwendet anschließend den ursprünglichen Preis-/Multiplikatortail.

Das bestehende Netz besitzt eine zweite Ebene mit zentralem Axiomkern, **vier verbundenen Bereichen und 24 Knoten**. Dieselben Prefabs, Knotendetails, Linien, Pan-/Pinch-Bedienung, Safe Areas und vorhandenen Grafiken werden wiederverwendet. Verbindungen erzeugen keine zusätzlichen Kaufvoraussetzungen. Vor dem Axiomreset zeigt ein scrollbar bedienbares Bestätigungsfenster die tatsächliche Erhaltung und die aktuell erhalten bleibenden INT-Knoten; das Öffnen der Vorschau verändert keinen Spielstand.

| Erhalten | Zurückgesetzt / freigegeben |
|---|---|
| Axiomguthaben/-gesamtwert und gekaufte Axiomlevel; Gesamt-INT und bester INT-Stand | Zyklus-INT, freies/ausgegebenes INT, Einkommensledger und ungerundeter INT-Anspruch |
| Modelle, Modelllevel, aktive Auswahl und Erkenntnis; Forschung und aktive Forschung/Analyse/Modulherstellung | Hardware, Daten, alle drei Trainingslevel und aktives Training – auch mit T08 |
| Inventar, Ausrüstung, Itemlevel/-seltenheiten, Materialien und Restmengen, Baupläne, Meisterschaft und permanente Slots | Unbezahlte Warteschlangen; wartende bezahlte Module werden vorher nach Originalregel erstattet |
| Bekannte Knoten, Konfigurationen und Wiederkaufplan; aktuelle Zyklusrekorde werden als B05-Wiederaufbaurekorde gesichert | Run-Meilensteinkanten, Tap-Combo, Overdrive und letzter Tap |
| Bereits gekaufte W01/W02/W06; mit B01 bereits gekaufte H01–H05; mit B02 bereits gekaufte T03/T06/F02/F03/F05/I06/I07 | Andere aktive INT-Knoten; keine bisher unbekannten Gruppen werden kostenlos erworben |

Runstart: 50 Credits und keine Hardware. Ein enthaltener Grundagent kauft anschließend einen Taschenrechner **bezahlt**. Der Axiomreset führt keine normale D04-Neustart-Modellphase aus; normales Prestige tut dies weiterhin. Diese Unterscheidung stammt aus TypeScript.

## Tatsächliche Verbraucher aller 24 Knoten

| Knoten | Angeschlossene Wirkung |
|---|---|
| A01 | Zukünftiger INT-Exponent nach Originalstufen |
| A02 | Gemeinsamer Axiom-Creditfaktor mit begrenztem Exponenten und anschließendem Tail |
| A03 | Zusätzlicher Compute-Faktor anhand der Gesamt-Axiome |
| A04 | Crit-Multiplikator innerhalb der bisherigen weichen Tapbegrenzung |
| A05 | Integrationslimit bis 300 und numerischer Itemfaktor |
| A06 | Bonusanteil des gemeinsamen aktiven Modell-Revenue-Kerns, keine Slotvermehrung |
| B01/B02 | Exakte Teilmengen bereits gekaufter Agenten/Steuerknoten über Axiom erhalten |
| B03 | Verstärkung numerischer ausgerüsteter Itemboni |
| B04 | Gespeicherte Wiederkaufreihenfolge, nach Preis sortierbar, exakte Einzelzahlungen unter Beachtung des absoluten INT-Sparziels; enthaltener Grundagent |
| B05 | Trainingsrate unter dem beim letzten Axiom gesicherten Richtungsrekord; keine freien Level |
| B06 | Automatisches Axiom nach Originalmindestdauer von fünf Minuten, Mindestgewinn und eingefrorenen gemeinsamen Job-Warteregeln; sicherer Save bei Zähleränderung |
| C01 | Passive Komponentenmenge mit getrennten gespeicherten Restmengen, unveränderter Zahl der RNG-Ziehungen |
| C02 | Wiederholter bezahlter Analysestart, absolutes Datensparziel und Schutz vorgemerkter Forschung/Integration; kein Neustart während Resetabsicht |
| C03 | Bezahlte Sofortherstellung des gewählten Rezepts bis Bestand 1/5/10; keine Belohnung aus Animationen |
| C04 | Genau die erlaubten Typen bis Zielseltenheit fusionieren; gesperrte, ausgerüstete und geschützte Items bleiben ausgeschlossen |
| C05 | Zerlegen mit Rückgewinnung tatsächlich gebundener, noch nicht zurückgewonnener Materialien, persistenten Bruchteilen und injiziertem Fragmentwurf; keine Credit-/Daten-/Modul-/Lernkostenerstattung |
| C06 | Dynamische Modul-Arbeitsrate mit Originalfaktor; zukünftige Foundry-Verbraucher noch offen |
| D01 | Erkenntnisproduktion anhand der gesamten Axiome |
| D02 | Ausschließlich neue Modell-Level-Upgradekosten rabattieren; keine Erwerbsrabatte |
| D03 | Modell-Maximallevel 30 bis 50 und Verstärkung des aktiven Revenue-Bonusanteils |
| D04 | Ein Modell nach normalem Neustart sowie bei Forschungs-/Materialstart wählen; ungültige oder unbezahlbare Starts bewirken keinen Wechsel |
| D05 | Revenue-Kern aus Integrationslevel verstärken, ohne rekursive Item-/Modellabhängigkeit |
| D06 | Feste zweite Fähigkeit ausschließlich des einen aktiven Modells |

Die Planer benutzen dieselbe verstrichene Zeit, Transaktionen und gespeicherten Zeitgeber online und offline. Absolute Datenreserven werden mit wartendem Integrationstraining und gewählten Forschungszielen abgeglichen. Vorhandene Forschungsdirektor-Budgets bleiben erhalten; dessen späterer erweiterter Sechs-Ziele-Modus benötigt die noch nicht portierte Forschung `researchScheduling` und wird nicht gratis freigeschaltet.

## Geheimes Labor und Modelle

Der Zugang erscheint im Tab **Forschung**. Bei **200.000 Gesamt-INT** wird das Labor entdeckt und genau einmal der bestehende Seed von **1.000 Erkenntnis** vergeben. Mira erklärt die Entdeckung und den ersten Erwerb; `lab`-/`axiom`-Tutorialzustand und die Bestätigung werden gespeichert. Ein erneutes Laden oder erneutes Öffnen vergibt den Seed nicht erneut. I08 und D01 wirken auf die tatsächliche, online/offline gespeicherte Erkenntnisproduktion.

Der Erwerb bezahlt den steigenden Originalpreis und zieht mit dem gespeicherten 32-Bit-LCG genau ein Modell aus dem **verbleibenden unbekannten Pool**. Keine Duplikate und kein versteckter zweiter Zufallswurf. Das erste erworbene Modell wird nur dann aktiv, wenn bisher keines aktiv war. Nach Poolerschöpfung gibt es keinen weiteren Erwerb. Level-Upgrades verwenden Originalpreis, D02-Rabatt und D03-Limit. Frei wählen oder deaktivieren bleibt Basisbedienung, D04 automatisiert nur Ereignisphasen.

| Modell | Primär / mit D06 zusätzlich |
|---|---|
| K01 Kommerz | Revenue / Overdrivefaktor |
| K02 Inferenz | Nutzer / Daten |
| K03 Daten | Daten / Forschungsrate |
| K04 Interaktion | Tapfaktor / Crit-Chance unter dem vorhandenen Cap |
| K05 Integration | Itemboni / Analysegeschwindigkeit |
| K06 Parallel | Compute, damit auch tatsächliche Nutzer-/Daten-/Revenuekette und Wurzelfaktor für Arbeit / weitere Forschungsrate |
| K07 Wissenschaft | Forschungsrate / Daten |
| K08 Lernen | Trainingsrate / zusätzliche Rate nur bei aktivem Integrationstraining |
| K09 Material | Analysegeschwindigkeit / passive Komponentenmenge mit Restmengen |
| K10 Modular | Ein universeller Slot, ab Level 15 zwei, eigener numerischer Itemfaktor / Analysemengen |

Jedes aktive Modell besitzt zusätzlich den gemeinsamen Revenue-Kern. A06/D03/D05 verstärken dessen **Bonusanteil**, nicht den gesamten Faktor. Beim Wechsel weg von K10 verschwinden ausschließlich die Bindungen in nicht mehr verfügbaren Slots. **Die Items bleiben unverändert im Inventar**; ein späterer Wechsel zurück rüstet sie nicht heimlich wieder aus. Analysemenge wird nach den originalen Zufallsziehungen über die laufende Arbeitsintegration verstärkt; Modellwechsel erzeugen weder zusätzliche Ziehungen noch neue Basisinputs.

## Animationen und Speichern

Axiomreset und Modellerwerb laufen zuerst über `GameRuntime.Act` und den atomaren Save. Erst danach bekommt die vorhandene wiederverwendbare `PrestigePulse` einen kosmetischen Beleg mit tatsächlichem Gewinn beziehungsweise Modellnamen und Originalgrafik. Sie besitzt keine Vergabe-/Reset-/RNG-Funktion. Reduzierte Bewegung zeigt einen automatisch verschwindenden statischen Beleg; Tabwechsel, Pause, Fokusverlust und Neustart können keine zweite Transaktion auslösen. Automatische Resets speichern bei Änderung des Axiomzählers sofort; Offline-/Load-Fortschritt erzeugt keine nachträgliche Effektserie.

## Migration alter Unity-Saves

Envelope **Version 4**, bisheriger Dateiname und Speicherort unverändert. Versionen **1, 2 und 3** werden validiert und vor dem ersten Schreiben bytegleich als `.vN-original-<SHA256>` gesichert. Hauptstand/Pending/Backup und Schreibsperre für beschädigte oder zukünftige Daten bleiben erhalten. Neue v4-Daten ohne erforderlichen Meta-/INT-Block oder mit inkonsistenten Währungen werden zurückgewiesen. Ressourcen, INT, Items, Jobs und bestehende Einstellungen bleiben erhalten.

Frühere Unity-Versionen speicherten keinen Modell-RNG oder historischen Axiom-Trainingsrekord. Neue Modell-RNG-Daten verwenden die vorhandene TypeScript-Initialisierung mit dem gespeicherten Zeitpunkt und dem bisherigen Unity-unbekannten Kampagnennamen `unassigned`; vorhandene Level initialisieren den neuen Zyklusrekord, ohne nicht aufgezeichnete frühere Höchststände zu erfinden. Der bekannte Runstart dient als initiale Axiom-Zeitbasis. Ein bereits gespeichertes Modellprofil bleibt mit seinem Level erhalten. Ein bereits ausgespielter Laborseed wird nicht erneut vergeben; der neue Mira-Hinweis wird für bislang nicht erklärte Labore sichtbar. Laufende alte Analysen übernehmen ihre bereits erarbeitete einfache Mengenintegration. Keine automatische Web-/Capacitor-Saveübernahme.

## Nachweise und Grenzen

Die tatsächlichen Ergebnisse stehen in [unity-meta-verification.json](unity-meta-verification.json): **29/29 EditMode**, **13/13 grafische PlayMode-Tests**, anschließend **2/2 gezielte Paritätsnachtests** für den verschärften Reservefall. Separater Import/Compile: Exitcode 0, keine C#-Compilerfehler. Typecheck, Produktionsbuild und Exportprüfung erfolgreich; **1.859/1.859 Vitest-Tests in 129 Dateien**, anschließend die zwei betroffenen Exportverträge nochmals erfolgreich. Bestehende Bundlegrößenwarnung bleibt. **323 neue gemeinsame technische Referenzfälle** verwenden echte TypeScript-Funktionen. Geprüft werden alle Katalogstufen, A02-Tail, Freischaltungen, fünf RNG-Seeds und ein vollständiger Pool, Preise, alle Modellfähigkeiten, Slotwechsel, drei Axiomzyklen, normale D04-Neustarts, tatsächliche Erkenntnisproduktion, C01/K09-Restmengen, C06-Modulabschlüsse, Planer und Reserven. Bestehende 380 INT-, 510 Item-, 24 Transaktions-/Raten- und acht exakten Zahlenfälle bleiben erhalten. Online-/Offline-Segmentierung, Reload, Save-v3-Erhaltung und abgebrochene Effekte werden separat geprüft.

**Sämtliche hochpreisigen Katalog-/Animations-/Axiomzustände sind ausdrücklich finanzierte temporäre Teststände.** Keine Ressourcen oder Freischaltungen wurden in die reguläre Szene eingebaut. Der frühere natürliche erste Prestige-Replay bleibt ein Regressionstest; dieser Abschnitt behauptet keinen natürlichen Erst-Axiom- oder Zehn-Modelle-Langzeitlauf. Gerenderte mobile Profile ersetzen keine physische Touch-/Safe-Area-/Suspend-/Screenreaderabnahme.

Das **Erkenntnisarchiv-Item** ist keine KI und wird durch das geheime Labor nicht neu freigeschaltet. Der aktuelle V2-Code besitzt weiterhin einen Nullpreis für seinen Lernpfad; der zufällige normale Itempool schließt es ausdrücklich aus. Bestehende/alte Exemplare und deren INT-Effekt funktionieren, ein eindeutiger regulärer Neuerwerbsweg bleibt ungeklärt. Keine Ersatzregel und kein Gratisarchiv.

Offen bleiben volle Foundries/Schmiedeaufträge (einschließlich C06-Verbraucher), restliche Forschung und deren weitere Abhängigkeiten, Synthese, Challenges/Lizenzen, Meta-/Season-/Shop-/Drop-Systeme, Legacy-/Web-Saveimport, sieben Sprachen, originale Fonts, native Reduced-Motion-Übernahme, Audio/Haptik, Player-Build und echte Geräteabnahme. TypeScript, iOS und lokale Backups bleiben erhalten. Keine neuen SDKs, keine Veröffentlichung, kein Merge.
