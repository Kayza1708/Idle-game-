# Unity: INT-Prestige und verbundenes Knotennetz

Aktuelle Fortsetzung: [Axiome und neue KI-Modelle](unity-axioms-models.md) implementiert diese damaligen nächsten Schritte. Die folgenden Ergebnisse dokumentieren den INT-Abschnitt historisch.

Stand: 19.10.2026. Erweiterung des bestehenden Spielabschnitts auf `codex/unity-rewrite`; Axiome und neue KI-Modelle bleiben der nächste Abschnitt. Der gesamte Rewrite ist nicht abgeschlossen.

## Spielregeln und Transaktionen

`PrestigeRules` führt getrennte exakte Ledger für qualifizierte Credits, den ungerundeten INT-Anspruch, bereits vergebene Zyklus-INT, Gesamt-INT, freies Guthaben und ausgegebene INT. Berechtigte passive Produktion und echte akzeptierte Taps erhöhen den Anspruch; Kaufabzüge, Startkapital, Rückerstattungen und unberechtigte Zuschüsse nicht. Neue Einnahmen verwenden den zum Buchungszeitpunkt gültigen Exponenten und das aktuelle Ertragsgewicht. Ein später gekaufter I09-/I10-Knoten wertet ältere Einnahmen nicht rückwirkend auf. Kleine Verhältnisänderungen verwenden dieselben stabilen `log1p`-/`expm1`-Zweige wie TypeScript. Große Zahlen behalten die vorhandenen Sparse-Restterme; Ganzzahlschwellen unter Exponent 15 und exakte Zahlungen werden ausdrücklich geprüft.

Ein normales Prestige benötigt mindestens eine neue ganze INT. Die Vergabe erhöht Guthaben, Zyklus und Gesamtwerte gemeinsam. Der gespeicherte Anspruch und die qualifizierten Zykluseinnahmen bleiben bestehen; bereits beanspruchte INT werden abgezogen. Revisionstickets und der tatsächliche Anspruch verhindern eine Wiederholung derselben Resettransaktion. Kreditproduktion profitiert vom zyklusweiten INT-Faktor.

Beim Reset werden Hardware und Credits auf den originalen Runstart gesetzt (50 Credits, keine Hardware). I06/I07 führen gegebenenfalls den enthaltenen **bezahlten** Taschenrechner-Wiederanlauf aus. Ohne T08 werden Qualität, Effizienz, Integration und aktives Training zurückgesetzt; T08 erhält diese Level und den bereits bezahlten Arbeitsvertrag samt Fortschritt. Unbezahlte Trainings-/Forschungsqueues werden geleert, wartende bezahlte Modulverträge wie in TypeScript zurückerstattet. Aktive Forschung, Analyse und Modulherstellung laufen weiter. Inventar, Ausrüstung, Sperren, Itemlevel/-seltenheiten, Baupläne/Meisterschaft, Materialbestände/-reste, permanente Slots, Forschung, gekaufte INT-Knoten und Konfigurationen bleiben erhalten. Run-Meilensteinkanten, Overdrive, Combo und Tapzeit werden zurückgesetzt. Schon gebuchte Materialpakete werden beim erneuten Erreichen derselben Kante nicht doppelt vergeben.

`PrestigeBalance.g.cs` exportiert den vollständigen Katalog samt Preisen, Formeln, tatsächlichen bestehenden Nebeneffekten und Netzgeometrie aus TypeScript. Es wurden keine Balancewerte unter `src/` verändert. `npm run unity:export` und `npm run unity:check` umfassen jetzt den INT-Export und die gemeinsamen Referenzfälle.

## Wirkung der 60 Knoten

Alle 60 Knoten sind einzeln kaufbar, sobald das nötige freie INT-Guthaben vorhanden ist. Verbindungen sind ausschließlich Darstellung. T10 enthält T04, I07 enthält I06; enthaltene Knoten werden nicht erneut bezahlt. Deren eigene Käufe benötigen umgekehrt keine Vorgänger.

| Bereich | Implementierte Verbraucher |
|---|---|
| H01–H05 | Alle 15 Hardware-Autokäufer in den originalen fünf Gruppen, bezahlte Einzelkäufe im gespeicherten Fünf-Sekunden-Takt; getrennte gespeicherte Zeitgeber für die ersten beiden und übrigen Hardwaregruppen, prozentuale Einkaufsreserve sowie additive gemeinsame feste Reserve plus Kosten wartenden Trainings |
| H06–H10 | Compute-Faktoren, gedeckelte Wurzel-Stückzahlsynergie, Klassenvielfalt, 500er-Kanten und planetare Parallelität; Revenue nur über die tatsächliche Nutzerkette |
| T01–T02 | Quality-/Efficiency-Teilfaktoren mit originalem Exponenten |
| T03 | Zwei unbezahlte wartende Trainings; Zahlung erst beim tatsächlichen Start, Entfernen und zielabhängiges Weiterlaufen |
| T04/T10 | Integration mit eigener Credit-/Datenzahlung, Arbeitsdauer und Limit; Itemverstärkung mit 1,005 bzw. 1,007 als Basis |
| T05/T07/T09 | Trainingsrate und zusätzliche Revenuefaktoren mit den originalen Caps |
| T06 | Trainingsautopilot, Ziellevel je Richtung, Auswahl nach aktuellem niedrigsten verfügbaren Level, manuelle Queue hat Vorrang, gemeinsame Reserve |
| T08 | Erhaltung der drei Trainingslevel und des aktiven bezahlten Trainings bei normalem Prestige |
| F01/F04/F08 | Je ein unabhängiges zusätzliches Forschungslabor, insgesamt vier; alle echten Arbeitsverträge und Abschlüsse werden gespeichert |
| F02 | Manuelle Forschungsqueue von zwei auf sechs Plätze, keine Zahlung beim Einreihen |
| F03 | Gewähltes wiederholbares Projekt unbegrenzt wiederholen, unter Beachtung von Kosten, Reserven und Resetabsicht |
| F05 | Drei unterschiedliche endliche Forschungsziele, Reihenfolge/Modus, explizites Gesamtbudget, Ausgabenledger und Prozentreserve; manuelle wartende Forschung hat Vorrang |
| F06/F07/F09/F10 | Forschungsrate, Rabatt ausschließlich auf neue Starts und Datenproduktion |
| W01/W02/W06 | Je ein zusätzlicher Prozessor-/Core-/Forschungsslot; gekaufte Infrastruktur wird permanent gespeichert |
| W03 | Seltene Analysekomponente garantiert, im **neuen** Vertrag eingefroren; ein späterer Kauf schreibt laufende Analysen nicht um |
| W04 | Aufgerundete Material-/Datenrabatte für neue Item-Level-Upgrades; keine Fusions- oder Bauplanrabatte |
| W05/W09/W10 | Verstärkung der tatsächlich ausgerüsteten Itembonusanteile |
| W07 | Mengenwahl ×1/×3/×10/×100, sofortige Items und serielle bezahlte Modulverträge mit originalen Mengen-/Queuegrenzen; keine Wartezeit für Itemherstellung/Fusion |
| W08 | Doppelte Arbeitsrate laufender/neuer Modulherstellung; zusätzliche Foundry-Verbraucher sind noch nicht portiert |
| S01–S10 | Rohe Tapenergie vor/nach Logarithmus, Crit-Chance/-Multiplikator, Overdrivefaktor und -dauer mit originaler weicher Begrenzung und unverändertem Auslöseabstand |
| I01–I05/I09/I10 | Revenue, bezahlte Run-Meilensteinkanten, Trainings-/Forschungs-Ertragsgewicht, INT-Creditsfaktor und ausschließlich zukünftiger INT-Anspruch |
| I06/I07 | Prestige-Agent an Simulationsanfang/-ende und zusätzlichen Zehn-Sekunden-Grenzen mit Mindestgewinn, Mindestlaufzeit, relativem Ziel, optionaler Zeitobergrenze und eingefrorenem Warten auf bereits laufende ausgewählte Jobs; keine Neustarts während Resetabsicht |
| I08 | Erkenntnisproduktion nach Laborfreischaltung, permanenter Seed und Speicherung. **Verbrauch durch neue KI-Modelle folgt im nächsten Abschnitt.** |

Wichtige Bestandsabweichung: Der aktuelle TypeScript-Code enthält über seine alten `manufacturing6/7/8`-Zuordnungen zusätzliche gemeinsame Itembonus-Poolbeiträge von W01 **+0,40**, W02 **+0,75** und W06 **+1,25**. Diese sind teilweise nicht im Knotentext beschrieben. Sie werden im C#-Port übernommen, exportiert, in gemeinsamen Fällen geprüft und in den Knotendetails ergänzt. Keine stillschweigende „Bereinigung“ der Vorlage. Direkte bedingte Geräteeffekte und allgemeine Ausrüstungsboni verwenden weiterhin ihre jeweiligen tatsächlichen Verbraucher.

## Oberfläche und Prestige-Effekt

Szene: `Assets/Scenes/IdleIntelligence.unity`, Unity exakt **6000.3.26f1**. Der neue Tab **INT** zeigt einen echten zentralen Kern mit sechs farbigen verbundenen Bereichen und 60 sichtbaren/verschiebbaren Knoten. Die vorhandenen Hardware-/Itemgrafiken werden wiederverwendet. Bereichsschalter bewegen die Kamera zu einem Bereich; Ziehen verschiebt das Netz. Zwei Finger zoomen um den gemeinsamen Mittelpunkt, Maus/Trackpad und +/− sind ebenfalls angebunden. Die Zoomgrenzen stammen aus der vorhandenen TypeScript-Netzansicht. Alle Knoten bleiben inspizierbar; nur der Kaufbutton prüft freie INT und Besitz/Enthaltensein.

`PrestigeNode.prefab`, `PrestigeNetwork.prefab`, `NetworkWires`, gemeinsame UI-Fabriken und scrollbar bedienbare, über der Safe Area liegende Knotendetails trennen Darstellung und Domain. Dort sind die jeweiligen Automations-/Zieleinstellungen erreichbar; wartende Trainings/Forschungen können in ihren bisherigen Tabs entfernt werden. Die global gespeicherte Bewegungseinstellung ist auch im Netz erreichbar.

Der manuelle Reset wird über `GameRuntime.Act` zuerst dauerhaft gespeichert. Erst bei Erfolg erhält `PrestigePulse` einen reinen Text-/Bildbeleg. Der Effekt hat keine Referenz auf Domain, Save oder Vergabefunktionen. Er blendet kurz Kern und Licht ein; reduzierte Bewegung zeigt einen automatisch verschwindenden statischen Text. Abbruch, Detail-/Tabwechsel, Fokusverlust, Pause und Neustart können keinen zweiten Reset auslösen. Automatische Resets werden im Zeitadapter bei Änderung des Resetzählers sofort gespeichert; Laden/Offlinefortschritt spielt keine nachträgliche Resetanimation ab.

## Bestehende Unity-Spielstände

Das Envelopeformat steigt auf **Version 3**. Der Dateiname bleibt absichtlich `unity-slice-v1.json`. Version 1 und 2 werden weiter gelesen und vollständig validiert. Vor dem ersten Schreiben bleibt das bytegleiche Original unter `.v1-original-<SHA256>` bzw. `.v2-original-<SHA256>` erhalten; atomarer Commit und vorheriger Hauptstand als `.backup` bleiben bestehen. Alle bisherigen Ressourcen, Jobs, RNG-Zustände, Items und Einstellungen werden erhalten.

Die alten Unity-Formate haben keinen historischen INT-Einkommensledger gespeichert. Die Migration erfindet deshalb keinen rückwirkenden Anspruch aus dem aktuellen Creditbestand: `historicalIncomeUnavailable` markiert dies, neue qualifizierte Einnahmen werden ab dem migrierten Stand erfasst. Es gab in diesen Formaten noch keine vergebenen Unity-INT zu verlieren. Fehlende Version-3-Daten, inkonsistente Ledger, beschädigte oder unbekannte Originale bleiben gesperrt und werden nicht durch ein neues Spiel überschrieben. Kein automatischer Web-/Capacitor-Saveimport.

## Referenz- und Spielprüfung

Die maschinenlesbaren Ergebnisse stehen in [unity-int-verification.json](unity-int-verification.json). Abschließend: separater Import/Compile Exitcode 0, **25/25 EditMode**, **9/9 PlayMode**, Typecheck und Build erfolgreich, **1.857/1.857 Vitest-Tests in 128 Dateien**, reproduzierbare Exporte erfolgreich. Die bestehende Bundlegrößenwarnung bleibt. Nach Erweiterung der Automationsfälle bestehen zusätzlich die zwei betroffenen Vitest-Exportverträge; TypeScript-Spielcode und Balance blieben unverändert. Der PlayMode-Aufruf mit `-nographics` konnte keine RenderTextures erzeugen; die vollständige grafische Wiederholung besteht. Frühere fehlgeschlagene Test-/Fixtureversuche sind im Prüfdatensatz benannt. Finanzierte technische Fixtures und der natürliche Lauf werden getrennt gehalten:

- `PrestigeReferenceCases.json`: **380 gemeinsame technische Fälle**, direkt durch TypeScript-Funktionen erzeugt. Alle 60 Käufe, Duplikate, Itemeffekte, Einnahmen/Taps, kombinierte Wirkung aller Knoten, Slots, bezahlte Meilensteinkanten, parallele Forschung, Trainingsqueue, Hardware-Automation, Mengenverträge, archiviertes Training und drei aufeinanderfolgende Resets werden abgeglichen.
- Zusätzlich bestehen die bisherigen 24 Transaktions-/Ratenfälle, acht exakten Zahlenfälle und nun **510 Itemfälle** (ergänzt um W03). Neue Tests prüfen Save-v2-Erhaltung, korrupte Ledger, eingefrorene Analyseverträge, Sparse-Ganzzahlrundung und Resetbelege über Reload.
- `NaturalPrestigeRun.json`: **frischer Lauf**, unveränderte 50 Startcredits, keine zusätzlichen Testvorräte oder Zuschüsse. Drei akzeptierte Taps pro Sekunde, höchstens ein bezahlter Hardwarekauf pro Sekunde nach Compute-/Preisbasis, Training der niedrigeren Q/E-Richtung und vorhandene Forschung bis Level 10. Das normale TypeScript-Tutorial wird mitgeführt; seine bestehenden kostenlosen Erstangebote und das reguläre Starterpaket bleiben erlaubt. **39:38 simulierte Minuten** bis zur ersten ganzen INT, **14.532 echte Zeit-/Tap-/Kauf-/Trainings-/Forschungsaktionen**, **41 Zustandskontrollen** einschließlich Reset. C# spielt die aufgezeichneten Aktionen nach und vergleicht Ressourcen, Level, Forschung, Slots, Inventar, INT-Ledger und Erhaltung mit TypeScript. Dies ist ein beschleunigter natürlicher Simulationslauf mit offengelegter aktiver Strategie, kein 40-minütiger manueller Gerätetest und kein Langzeitbalancenachweis.
- PlayMode nutzt für die hohen Knotenpreise ausdrücklich finanzierte temporäre Teststände. Geprüft werden reale UI-Verbindungen, Pan-/Pinch-Rechnung, unabhängiger H10-Kauf, Slotkauf, Speichern **vor** dem Effekt, Abbruch/Tabwechsel/Reload ohne Doppelreset und reduzierte Bewegung. Mobile Canvasbilder bei 320×568, 390×844 und 430×932 werden gerendert und visuell geprüft; dies ersetzt keine echte Touch-/Notch-/Suspend-Geräteabnahme.

## Nächster Abschnitt und Grenzen

Axiomwährung, Axiomkäufe/-reset, deren Erweiterungen von Budgets/Training und neue KI-Modelle/Modellwahl/-entwicklung/-verbesserung bleiben ausdrücklich offen. Erkenntnis ist schon korrekt gespeichert, besitzt aber noch keinen neuen Modellverbraucher. Item-Foundries, volle restliche Forschungskataloge, Challenges/Lizenzen, Meta-/Season-/Shopbelohnungen, Web-Save-Import, sieben Sprachen, Originalfonts, automatische native Reduced-Motion-Übernahme, Audio/Haptik, Player-Build und physische iPhone-/Android-Abnahme bleiben weitere Migrationspunkte. Keine neuen SDKs, keine Veröffentlichung, kein PR-Merge und kein Entfernen der TypeScript-Version.
