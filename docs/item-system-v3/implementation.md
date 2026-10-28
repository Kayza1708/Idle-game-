# Item-System V3 – Umsetzung und Abnahme

Verbindlicher Auftrag: [unveränderte Spezifikation](specification.txt). Beginn 28.10.2026 auf `codex/unity-rewrite`; Remote-PR #155 bereits gemergt. Lokale UI-/Lokalisierungsnacharbeiten bleiben separat erhalten. V3 ist noch **nicht** im normalen Spiel aktiviert. Keine Fertigmeldung durch bloße Katalogeinträge.

Ergänzt durch den verbindlichen [Prestige-/Axiomauftrag](prestige-axiom-specification.txt). Dieser erweitert denselben V3-Vertrag. Die 60/24 bestehenden IDs und Preise bleiben erhalten. K (Komponentenproduktion im Itemauftrag) und K (Hardwareklassen im Prestigeauftrag) erhalten im Code getrennte ausgeschriebene Namen; sie sind keine neue Währung.

## Abhängigkeitsgraph vor der Implementierung

```mermaid
flowchart TD
  Save[Validierter Zustand und gültige Ausrüstung] --> Snapshot[Unverstärkter Snapshot: H M F D E U Z N T K]
  Save --> Class[Reguläre Hardwareklassen und gültige Verbindungen]
  Class --> Local[Legacy / Sparse / Kopplung: Klassenfaktoren]
  Class --> C[Reine Produktion C für Singularitätslinse]
  Snapshot --> Local
  Local --> Compute[Compute: Basiswert und einzigartige Faktoren / Kombinationen]
  C --> Compute
  Compute --> Users[Nutzer]
  Users --> Data[Reguläre Datenrate]
  Users --> Credits[Credits: Basiswert / Items / ursprünglicher Modellfaktor]
  Snapshot --> Credits
  Credits --> Temporary[Zeitverträge: Overdrive / Burst / Boost]
  Temporary --> Income[Zukünftige Einnahmen und INT-Gewichtung verbuchen]
  Income --> INT[Gültiger INT-Anspruch]
  INT --> Axiom[Axiomfaktoren am Reset, dann einmal abrunden]
  Data --> Knowledge[Erkenntnis aus Snapshot am Intervallanfang]
  Knowledge --> Next[Nächster Simulationsschritt aktualisiert D E K T]
  Next -. nächstes Intervall .-> Snapshot
  Save --> Jobs[Bezahlte Auftragsverträge mit IDs und Ursachentyp]
  Jobs --> Regular[Reguläre Arbeit]
  Regular --> Transfer[Abgegrenzte Bonus- / Übertragsarbeit]
  Transfer --> Settle[Deterministischer Abschluss ohne erneute Übertragung]
```

Keine Rückkante innerhalb einer Auswertung: insbesondere C ohne globale Faktoren, Modell-Revenue nur einmal, Erkenntnis nicht aus ihrem eigenen Intervallzuwachs. Materialprovenienz und Fraktionen gehören in den gespeicherten Vertrag, nicht in Animationen oder berechnete Handelsboni.

## Festgestellte Bestandsabweichungen

- Aktuelle Quelle verwendet Progression V2 und `ScientificNumber`; Unity hat denselben separat portierten Verbrauchergraphen. Neue Konstanten werden ausschließlich aus `src/economy.ts` generiert.
- Qualität/Effizienz besitzen einen logarithmischen Softcap, keinen Potenz-Softcap. Adapter für Distillation muss die vorhandene Ausgabekurve kontinuierlich abmildern; Curriculum verschiebt zuvor die Schwelle. Integration bleibt unverändert.
- Erkenntnisarchiv hat derzeit einen Nullpreis-Bauplan, den der normale Lernweg wegen `price > 0` nicht erwerben kann. Expliziter erreichbarer Erwerb ist Teil von V3, kein alter vermeintlich abgeschlossener Verbraucher.
- Aktuelle Saveversionen: Web 64; native Version wird vor Migration separat ermittelt. Neue Zähler dürfen nicht aus Walletbeständen oder unzuverlässigen Lifetimezahlen rekonstruiert werden.
- Slotfamilien und drei Startslots bestehen bereits. Zusätzliche Forschungs-/Prozessorslots sind für entsprechende Dreierkombinationen tatsächlich erforderlich.

## Abnahmereihenfolge

- [ ] Unveränderte Baseline mit Quellfingerabdruck, natürlichen Profilen und getrennten vorbereiteten Referenzzuständen.
- [ ] Zentrale Konstanten, ScientificNumber-Formeln, sämtliche globalen Verstärker inventarisiert.
- [ ] Produktions- und Trainings-/Forschungsverbraucher, alle 42 Fähigkeiten und 12 Kombinationen.
- [ ] Ereignisursachen, gespeicherte Startverträge, Produktionszähler, Provenienz und Offlinegrenzen.
- [ ] Konkrete Rezepte, erreichbarer deterministischer Erwerb, neue Originalgrafiken.
- [ ] Atomare Migration mit Originalkopie, Duplikatbereinigung ohne Itemverlust, Challenges/Handel.
- [ ] Tatsächliche Itemdetails, Vergleiche, Kombinationen, Mira-Hinweise und sieben Sprachen.
- [ ] TS-/C#-Parität, volle Regressionen, lange Nachherkampagnen und Loadoutsuche.
- [ ] Echte Unity-Bilder und Clip, abschließender geprüfter Commit und Draft-PR.

Alle Punkte bleiben offen, bis der tatsächliche Verbraucher und sein Nachweis vorliegen. Produktionscloud/Storekonten sind keine Voraussetzung dieses lokalen Itemumbaus und bleiben separat offen.

## Geprüfte Zwischenstände, keine Gesamtfreigabe

- UI-Nacharbeiten aus dem vorherigen Auftrag in eigenem Commit `3436a08c` gesichert; davor 30 EditMode- und 4 PlayMode-Tests grün. Kein PR-Merge. Eine lokale Fast-forward-Anfrage wurde von der automatischen Freigabe abgelehnt und nicht ausgeführt.
- Erste Itemproduktionsstufe: `/tmp/idle-v3-initial-edit-fixed.xml`, 8/8 Tests, 7,893 s; darunter damals 32 tatsächliche TS-/C#-Verbraucherzustände sowie die bestehenden Itemparitätsprüfungen. Ein vorheriger Compile fand eine nicht vorhandene C#-`Sqrt`-Methode; auf die vorhandene `Pow(.5)`-API korrigiert.
- Gemeinsame Produktions-/Prestigestufe: `/tmp/idle-v3-joint-edit.xml`, 8/8 Tests, 8,131 s, inzwischen 53 Referenzzustände. Diese vergleichen echte Compute-/Income-/Data-/WorkSpeed-/KnowledgeRate-Verbraucher, keine nebenher nachgebaute Testökonomie.
- `/tmp/idle-v3-queue-unit.log`: 33/33 TS-Tests (21 Item-, 7 Prestige-, 5 Queuefälle) bestanden. Neue Queue- und mobile PlayMode-Prüfungen laufen separat; ihr Ergebnis ist noch nicht vorweggenommen.
- Baseline erfasst `baseline.json` schrittweise mit dem Fingerabdruck der unveränderten geladenen TS-Quellen und ohne Ressourceninjektion. Bisher aktive Profile bis sieben Tage: kein ungültiger Zustand, erster Prestige bis 24 h, 12 Prestiges nach sieben Tagen. 30/90 Tage und passive Profile sind noch nicht vollständig vorliegend. Keine abgeschlossene Monatsbalance behaupten.

### Noch nicht im normalen Spiel freigegeben

Aktuelle Web-/native Saveversionen bleiben 64/24. Der experimentelle V3-Vertrag ist ausschließlich für isolierte Referenzzustände zugänglich. Beide Speichergrenzen verweigern ausdrücklich das Schreiben solcher Zwischenstände, statt unvollständige Zähler oder Vertragsdaten zu verlieren. Bestehende reguläre Saves werden nicht automatisch aktiviert oder umetikettiert.

Noch offen sind insbesondere: die vollständigen 42 Itemfähigkeiten samt tatsächlichen Ereignisverbrauchern, sechs neue Erwerbswege und Originalicons, Produktions-/Auftrags-/Resetverträge und atomare Migration, alle zwölf Kombinationen inklusive Slotbeweisen, restliche 60/24-Knotenverbraucher und Texte, spoilerfreie UI-Sichtbarkeit, Mira-Entdeckungsführung, erste manuelle Axiomtransaktion, Automation/Batches/Materialschutz und lange gemeinsame Nachherkampagnen. Reine Formelfunktionen oder vorbereitete Referenzzustände schließen diese Punkte nicht ab.

## Logarithmischer Trainingssoftcap: konkreter Adapter

Die aktuelle Quelle verwendet nach der Schwelle `b` die Kurve `g(d)=s·ln(1+d/s)`, `d=level-b`, `s=25`, nicht `d^a`. Curriculum verschiebt zuerst `b`. Distillation setzt `rho=0,20Q/(1+0,20Q)` und verwendet danach `b + g(d)^(1-rho)·d^rho`.

Bei `rho=0` ist dies exakt die alte Kurve. Für `d>0` sind beide Faktoren positiv und streng monoton; das Produkt ebenfalls. `g(d)/d → 1` bei `d → 0`, somit stimmen Wert und erste Ableitung am Schwellenübergang überein. Aus `0<g'(d)≤g(d)/d≤1` folgt `0<f'(d)≤1`; daher kann auch das Anheben der Schwelle die Ausgabe nicht senken. Der Adapter liegt zwischen alter logarithmischer und linearer Ausgabe, erreicht die lineare Kurve wegen `rho<1` nicht. Keine Änderung der Integrationskurve und keine zusätzliche Drossel. Der gemeinsame Level-Sweep wird an den tatsächlichen Qualitäts-/Effizienzverbrauchern geprüft.

## Unbezahlte Queueverträge

Bestehende Trainings-/Forschungsqueues sind Pläne, keine bezahlten Reservierungen. Karten zeigen daher kompakt „Zahlung bei Start“. Umordnen und Entfernen verwenden einen gespeicherten UI-Snapshot als Transaktionsticket; nach einem Start oder einer anderen Änderung wird ein veraltetes Ticket abgewiesen. Gleiche Trainingstracks dürfen ihre Ziellevelreihenfolge nicht umkehren. Das Entfernen eines früheren Ziels entfernt weiterhin dessen spätere abhängige Ziele desselben Tracks, entsprechend der vorhandenen Regel. Kosten und Start-/Refundverträge bleiben unverändert.


## Zweiter gemeinsamer Prüfstand: 28.10.2026

Der experimentelle Rechenpfad umfasst jetzt 62 vorbereitete tatsächliche TS-/C#-Verbraucherfälle. Hinzu kamen F07-Neustartkosten (alte bezahlte Verträge bleiben), F08 aus belegten regulären Slots und F10 aus F; D05 und die native Integrationsgrenze verwenden dieselbe V3-Basis. Axiomkäufe vor Entdeckung werden abgewiesen; B06 darf den ersten Reset nicht automatisch auslösen. Relative Prestige-Automation pausiert ohne positiven Referenzgewinn auch bei erreichtem Timeout.

D/E/T werden aus tatsächlichen angerechneten Zeitintervallen verbucht. Der V3-Auswertungssnapshot liegt vor der neuen E-Buchung; Startgeschenke zählen nicht als Produktion. Wiederholtes Advance auf denselben Zeitpunkt verbucht nichts. Normales Prestige leert D/T/Lernserie, Axiomreset zusätzlich E/K. **K-Produzenten, vollständige Ereignisverträge und beliebige externe Intervallteilungen sind noch nicht vollständig abgenommen.**

- `npm run typecheck`: bestanden; `npm run build`: bestanden, bestehender Hinweis auf große Webchunks.
- Vollständiger TS-Lauf `/tmp/idle-v3-regenerated-vitest.log`: **152 Dateien / 1.989 Tests bestanden**, 331,18 s. Ein vorheriger Lauf fand veraltete Generatorhashes während der Erweiterung und einen falschen Testimport; anschließend alle Generatoren neu erstellt, Test korrigiert und vollständig wiederholt.
- `npm run unity:check`: vollständig bestanden (`/tmp/idle-v3-final-generated-check.log`).
- Unity Compile + gesamter EditMode-Lauf `/tmp/idle-v3-final-verified-edit.xml`: **188/188 bestanden**, 128,159 s. Vorlauf 187/188: Test setzte reguläre Erkenntnis fälschlich mit dem Walletdelta einschließlich Labor-Startgeschenk gleich. Vergleich auf gemessene Produktion korrigiert; Startgeschenk explizit ausgeschlossen.
- Gezielter Queue-/Navigationslauf `/tmp/idle-v3-retained-lab-play.xml`: **8/8 bestanden**, 65,898 s. Ein erster Gesamtlauf fand zwei veraltete Laborkindpfade und eine Localeannahme; korrigiert. Ein weiterer Gesamtlauf mit irrtümlichem `-nographics` hatte RenderTexture-Fehler und zählt ausdrücklich nicht als Grafikabnahme. Der abschließende vollständige Lauf mit Grafikgerät `/tmp/idle-v3-verified-full-play.xml` hat **129/129 bestanden**, 673,787 s; inklusive echter Game-View-Breitenassertionen und der neuen Queuebilder.
- [22 unveränderte Unity-Bilder](../media/unity-v3-queues/README.md): zwei Queuerouten, DE/EN 320/390/430, weitere fünf Sprachen 390. DE/EN selbst angesehen und gefundene Platz-/Umbruchfehler korrigiert. Vorbereitete isolierte Finanzierung und 25-%-Arbeitsstände ausdrücklich markiert. Kein physischer Gerätenachweis.
- [Sechs neue Originalmotive](art/README.md) mit eingebautem `image_gen` erstellt, Alpha beibehalten und einzeln angesehen. Kein laufender Itemkatalog-/Spriteimport- oder Animationsnachweis; bestehende Grafiken unangetastet.

### Unveränderte Baseline und Laufzeitgrenzen

Die ursprünglich geladene Quelle hat Fingerabdruck `f4a45250c30b8ed7490856a5b58983e1b85f24a457466d965476eabec0f0662b`. Derselbe vollständige Inhalt aller 330 verfolgten `src`-Dateien wurde aus Git `3436a08c` rekonstruiert und byteweise gehasht; identisch mit der vor den V3-Änderungen gestarteten Baseline. Ein separater Passivlauf benutzt ausschließlich diese eingefrorenen Quellen und verweigert einen abweichenden Fingerabdruck. Kein Spielsave wurde kopiert, kein verschachteltes Git-Repository erstellt.

`baseline.json` enthält aktive natürliche Profile bis 30 Tage, 46 Prestiges, keine ungültigen Zustände; der aktive 90-Tage-Lauf ist noch offen. `baseline-passive.json` erfasst die unabhängigen natürlichen Passivprofile schrittweise; inzwischen bis 30 Tage, 16 Prestiges, keine ungültigen Zustände; 90 Tage noch offen. Beide benutzen den bestehenden Simulator/Seed 1708 ohne Ressourceninjektion. Laufzeitangaben enthalten Mac-Unterbrechungen und sind keine CPU- oder Geräteperformance-Messung. Noch keine Nachherkampagne und keine abgeschlossene Monats-/90-Tage-/Buildbalance behaupten.


## Nachweis Editor-Anbindung und sicherer Spriteimport

Offizielles `com.unity.pipeline@0.9.1-exp.1` über `unity pipeline install` ergänzt; vorhandene Pakete/SDK-Sperren erhalten. Eine eigene Instanz von 6000.3.26f1 importierte die sechs neuen PNGs über Live-`script eval_file`; alle Pivot-Capabilities positiv, sechs eigenständige Sprites und GUIDs im Assetkatalog/Project-Auswahl verifiziert. Echte Console nach Import/Play: null Fehler, keine fehlgeschlagene Kompilierung. Originalbytes erhalten; Importmaximalgröße512, Point, keine Mipmaps, keine Kompression. Noch keine Katalogfreigabe.

Live-Play begann aus einer leeren eigenen Szene; erst danach wurde der temporäre Savepfad gesetzt und die echte Spielszene geladen. Nachgewiesener Framefortschritt: 163328 → 163335, zwei beobachtete Frames, 125 ms; keine Performance-/60-fps-Behauptung. Die echte 390×846-Aufnahme wurde selbst angesehen und unverändert nach `docs/media/unity-v3-queues/live-pipeline-390.png` kopiert. Der Capture-Befehl legte seinen Pfad in dieser Paketversion unter Assets ab; der ausschließlich von ihm erzeugte temporäre Capture-Asset wurde danach über AssetDatabase entfernt. Keine normalen Saves oder Szenen geändert. Eigene Play-Sitzung beendet, sitzungsbezogene Hintergrundoptionen zurückgesetzt und eigener Editor nach SaveAssets sauber geschlossen.

Ein nicht wartender CLI-Start beendete sich nach „ready“; keine funktionierende Live-Anbindung daraus behauptet. Der zulässige wartende Start plus separate Bereitschaftsprüfung wurde tatsächlich nachgewiesen. [Maschinenlesbarer Nachweis](art/live-editor-proof.json), [Spriteimport](art/unity-import.json). Nachprüfung mit installiertem Editorpaket: Compile + **8/8 EditMode**, 5,062 s (`/tmp/idle-v3-pipeline-import-edit.xml`), und **5/5 PlayMode**, 31,977 s (`/tmp/idle-v3-pipeline-import-play.xml`), Queues sowie bestehende Modell-/Slotdarstellung. Die vorherige188/129-Vollregression gilt für den geprüften Commit9550fac2.


## Archiv-Erwerb: tatsächliche Verbraucher, keine Savefreigabe

Der V3-Lernweg verwendet nun das bestehende I04-/researchArchive-Recht; keine erfundenen Ersatzkosten. Gültige frühere Rechte und gelerntes Rezept bleiben nutzbar, fehlende Bauplanforschung oder bloße Finanzierung reichen nicht. Lernen vergibt kein Item. Die tatsächliche Sofortherstellung bleibt bezahlt. Neue Sperrbeschriftung verwendet den wirklichen Knotennamen statt einer technischen ID und ist zentral in sieben Sprachen hinterlegt.

- 49 gezielte Vitest inklusive bisheriger Blueprintverträge bestanden; tatsächlicher I04-Kauf sowie echter Axiomreset mit Item-/Rezepterhaltung im TS-Fall.
- 62 Produktionsfälle plus **11 neue tatsächliche Archiv-Erwerbs-/Zahlungsfälle** werden aus TS generiert. Unity Compile/9 EditMode-Prüfungen bestanden, 5,405 s (`/tmp/idle-v3-archive-edit.xml`). Bestehende Schmiede-/Queue-PlayMode-Regression **5/5**, 23,809 s (`/tmp/idle-v3-archive-play.xml`).
- Typecheck/Build bestanden, vollständiger Generatorvergleich bestanden; vollständiger erneuter TS-Lauf **153 Dateien / 1.992 Tests bestanden**, 323,03 s (`/tmp/idle-v3-archive-full-vitest.log`).

Das ist ein experimenteller V3-Domainvertrag, keine fertige Save-Migration oder Spielerfreigabe. Insbesondere muss die vollständige native/Web-Migration das rechtmäßige Legacyrecht tatsächlich übernehmen. Bestehende reguläre Saves bleiben64/24, der V3-Schreibschutz bleibt aktiv. Weitere Ereignisverbraucher und die V3-Erwerbs-/Detailoberfläche sind offen.
