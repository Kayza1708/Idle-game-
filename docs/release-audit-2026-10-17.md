# Release-Audit · AI Singularity · 17.10.2026

## Urteil und geprüfter Stand

**Noch keine Freigabe für einen kommerziellen App-Store-Release.** Das Projekt ist eine umfangreiche spielbare Beta mit implementiertem Core Loop und vielen Metasystemen. Die nächste sinnvolle Ausbaustufe ist eine stabilisierte, auf echten Geräten geprüfte TestFlight-Version. Der Nachweis für ein über Wochen ausgewogenes, wirtschaftlich tragfähiges Spiel steht aus.

Aktueller geprüfter Hauptbranch: [`ff75c464ce9ce917b96335f814ee366dcdee81aa`](https://github.com/Kayza1708/Idle-game-/commit/ff75c464ce9ce917b96335f814ee366dcdee81aa), Save v61. Der Audit begann auf [`8e7f978`](https://github.com/Kayza1708/Idle-game-/commit/8e7f9782f8e222590d551ab4ff9b2ae955af40c5), Save v60. Während der Prüfung wurde [PR #118](https://github.com/Kayza1708/Idle-game-/pull/118) gemergt. Der neue Hauptbranch hat exakt denselben Git-Tree (`230448e1fe60b1ebec9ee537bb42b80f8079dc1c`) wie der separat geprüfte PR-Kopf `76eaae31acc2f84265f179029ee31bd49637bf2a`.

**A01–A05 sind deshalb inzwischen auf main behoben.** Sie werden als nachvollziehbare Vorher-/Nachher-Befunde dokumentiert und gehören nicht mehr auf die offene Fehlerliste. A06 und die folgenden Release-/Qualitätsgrenzen bestehen weiter. Testläufe sind unten ausdrücklich dem jeweiligen Stand zugeordnet.

Umfang: Economy, wissenschaftliche Zahlen, Prestige/Axiome/KI, Training, Forschung, Fertigung, Materialzugang, Challenges, Speichervalidierung/-migration, Shop/Ads/IAP, Einstiegspunkt/native Schnittstellen, Lokalisierung, Assetverweise, CI/Testabdeckung und Abhängigkeiten. Das ist eine querschnittliche Codeprüfung mit gezielten Reproduktionen, keine formale Verifikation jeder Codezeile oder Geräteabnahme. Zugriff auf das lokale Xcode-Projekt, Apple-Konto/App Store Connect und ein echtes iPhone bestand nicht.

## Was bereits vorhanden ist

| Bereich | Nachweisbarer Stand | Freigabegrenze |
| --- | --- | --- |
| Core Loop | 15 Hardwareklassen; Credits → Hardware → Compute → Users → Credits; Taps und Overdrive | Tempo/Touchverhalten auf echten Geräten abnehmen |
| Mathe | Wissenschaftliche Ressourcen, sehr kleine Abbuchungen neben großen Beträgen, exakte Bulk-Transaktionen | Keine Garantie gegen jede ungeprüfte V2-Querschnittslücke |
| Fortschritt | 60 INT-Knoten, 24 Axiom-Upgrades, geheimes Labor, zehn entwickelbare KI-Modelle | Langfristige V2-Kampagnen und tatsächliche Buildvielfalt offen |
| Items | Drei Grundformen, Rarities, Crafting, Fusion, Veredelung, Recycling und gezielte Synthese | A01/A02 im aktuellen Hauptbranch behoben; breitere V2-Matrix erforderlich |
| Speicherung | Versionierte Saves, IndexedDB, Backups, Import/Export, Schutz beschädigter Originale | V2-Validatoren noch nicht durchgehend an neue Zustände angepasst |
| Inhalte | Missionen, Achievements, Free Season und 690 Challenge-Ziele im Katalog | Kataloggröße ist kein Nachweis von 690 real abschließbaren/balancierten Stufen |
| Präsentation | Pixel-Atlanten, Itemrahmen, Reveal-/Fertigungsfeedback, Audio, Haptik-Schnittstelle | Neue V2-Flächen und reale iPhone-Darstellung nicht visuell freigegeben |
| Monetarisierung | Pakete, Pässe, Drohne, Video-/Gemaktionen und anschließbare Kauf-/Ad-Verträge auf main | Keine angeschlossenen Live-Käufe/Ads und kein autoritativer Auslieferungsserver |

Alle 39 statisch erkennbaren, wörtlichen `/assets/...`-Referenzen in produktiven TS/TSX/CSS-Dateien wurden gegen `public` geprüft: keine fehlenden Dateien. Das prüft weder Bildqualität noch korrekte Ausschnitte aller Spritezellen. Für Komponenten und Items existieren vollständige Abbildungen in `GameArt.tsx`.

## Reproduzierte Vorher-/Nachher-Befunde

Prioritäten: **P1** vor Release beheben, **P2** relevante Integrations-/Qualitätslücke. Reproduktionen verwenden gezielt vorbereitete technische Zustände; es handelt sich nicht um gemessene natürliche Spielverläufe. Daten: [Ausgangsstand 8e7f978](audits/release-2026-10-17-baseline-8e7f978.json) und [aktueller Stand ff75c46 / PR #118](audits/release-2026-10-17-current-ff75c46.json). Wiederholen: `npx vite-node --script scripts/release-audit-probe.ts`.

| ID | Einstufung | Befund im Ausgangsstand 8e7f978 | Auswirkung damals | Aktueller main / gemergter #118 |
| --- | --- | --- | --- | --- |
| A01 | Behoben; vorher P1 | `gemShop.ts`: Crafting −30 min kostet 20 Gems. Ein Auftrag mit 3.600 s zeigt danach 1.800 s; `prepareProgressionWork` bzw. Reload/Arbeitsvorbereitung setzt ihn auf 3.600 s zurück. Gespeicherte Arbeit bleibt 0. | Bezahlter Zeitgewinn geht verloren. | Reproduziert korrigiert: Arbeit 1.800, Rest 1.800 s. |
| A02 | Behoben; vorher P1 | `inventory.ts`/`progressionWork.ts`: Ein Auftrag mit zwei Einheiten à 3.600 s liefert nach 3.600,01 s bereits beide Items. Der Arbeitsvertrag der ersten Einheit bleibt vollständig und wird für die zweite wiederverwendet. | Mehrfachherstellung umgeht einen Teil der vorgesehenen Wartezeit. | Reproduziert korrigiert: ein Item, Rest 3.599,99 s. |
| A03 | Behoben; vorher P1 | `gemShop.ts`: Nach F01 sind zwei reguläre Labore vorhanden. Der Zusatzlabor-Kauf für 500 Gems prüft weiter auf den alten String `labs1` und ist gesperrt. `Panels.tsx` enthält dieselbe alte Zugangsprüfung. | Beworbener Ausbau ist für neue V2-Spielstände nicht kaufbar. | F01-Kauf im Vergleich möglich. |
| A04 | Behoben; vorher P1 | `economy.ts` kann mit F01/F04/F08 und zwei behaltenen Zusatzlaboren sechs Labore anbieten. `storage.ts:validateShape` verlangt exakt vier Einträge. Serialisieren eines sonst gültigen Sechs-Labore-Zustands wirft einen Fehler. | Betroffene Spielstände können nicht regulär gespeichert werden; Backup-/Fehlerdialog verhindert keine verlorene neue Sitzung. Alte Stände mit gekauften Laboren können den Zustand erreichen. | Sechs Labore im Vergleich speicherbar. |
| A05 | Behoben; vorher P1 | `gemShop.ts`: Trainingsskip bei Integration verbraucht Gems und beendet den Auftrag, erhöht aber nur allgemeinen Modelllevel/Abschlusszähler, nicht `integrationLevel`. Probe: ein Gem ausgegeben, Integration 0 → 0. | Bezahlter Fortschritt ohne den angekündigten Itembonus. | Integration 0 → 1 im Vergleich. |
| A06 | P2 | `queueTraining` unterstützt `integration`; `assertDomainState` ebenfalls. Die zusätzliche Prüfung in `storage.ts:validateShape` akzeptiert in `trainingQueue` aber nur `quality`/`efficiency`. Ein vorher gültiger Zustand scheitert nach Vormerken von Integration beim Speichern. | Dritte Trainingsart nicht vollständig integriert. Die aktuelle Queue-Oberfläche bietet nur die ersten beiden Tracks; daher derzeit eine API-/Integrationslücke und kein Beleg für einen überall erreichbaren Spielerabsturz. | Besteht weiterhin. |

A03 ist vom Sechs-Labore-Speicherfehler zu trennen: Der kaputte Neukauf versteckt A04 für manche neuen Spieler, behebt ihn aber nicht für übernommene Rechte. A06 muss bei Erweiterung der sichtbaren Queue zusammen mit Zugangs-/Limitprüfungen und Save/Reload abgedeckt werden.

## Weitere Befunde und offene Freigaben

### A07 · P1 für den kommerziellen Launch: Geldfluss ist noch nicht angeschlossen

`main.tsx` übergibt keine aktiven Zahlungs-/Werbeadapter; `ads.ts` und `shopNative.ts` liefern absichtlich nicht verfügbar. Die neuen Produktkarten in `CommerceOffers.tsx` bleiben ohne vollständige Store-/Verifier-Brücke deaktiviert. Die gemergte Implementierung liefert Spielfolgen und anschließbare Verträge, ersetzt aber weder StoreKit/Rewarded-Ad-Anbindung noch die serverseitige Belegprüfung.

Vor echter Zahlung erforderlich: Store-Produktkonfiguration und lokalisierte Preise, Kaufbestätigung/Abbruch/ausstehende Freigabe, verifizierter Eigentümer und Beleg, Einmalauslieferung, dauerhafte Speicherung vor Store-Abschluss, Wiederzustellung nach Unterbrechung, Restore/Widerruf und Abgleich nach Geräte-/Save-Wechsel. Insbesondere darf ein bereits ausgeliefertes Starterpaket auf einem neuen Gerät nicht erneut Verbrauchsinhalte gewähren. Lokale Transaktionslisten allein lösen dieses Problem nicht.

Für eine geschlossene kostenlose TestFlight-Beta können Geldangebote und Werbung inaktiv bleiben. Eine kommerzielle Version mit angekündigten Käufen muss diese Abläufe vollständig liefern und in der Sandbox nachweisen.

### A08 · P1 als Nachweisproblem: V2-Balancing und Testabdeckung

96 von 120 Testdateien des aktuellen Stands importieren `legacyContractFixture`. Dessen `newGame` entfernt `progression` ausdrücklich; diese Tests sichern V59-Verträge und Migrationen, nicht den neuen V2-Lauf. Das ist als Altstandschutz sinnvoll, aber keine Abnahme der gesamten neuen Spielwirtschaft. Der Audit-Ausgangsstand besaß 119 Testdateien; A01–A05 blieben dort trotz einer großen Testsuite unentdeckt. Der aktuelle Stand ergänzt 36 gezielte Monetarisierungsfälle, die diese Lücken teilweise schließen.

Die vier langen Kampagnendateien sind aus `npm test` ausgeschlossen; der separate Workflow läuft nur manuell. `longTermSimulation.test.ts` akzeptiert einen Diagnosewert `FAIL`, solange `BALANCE_STRICT=1` nicht gesetzt ist. Der Workflow setzt diesen Schalter nicht. `simulateBalance` startet zwar den aktuellen Spielstand, seine Entscheidungsstrategie arbeitet weiter überwiegend mit alten Prestigekatalogen, alten Axiom-Kaufstrategien und Q/E-Training. Eine bewusste Entwicklung/Auswahl aller neuen KI-Modelle und aller 24 Axiome bildet diese Strategie nicht ab. Auch die heutigen Laufzeit-/Worker-Timeouts müssen für einen reproduzierbar grünen Releasecheck geklärt werden: langsame Diagnosearbeit isolieren, tatsächliche Budgets messen und fachliche Assertions beibehalten; nicht pauschal Fehler ignorieren.

Das Acht-Stunden-/32-Axiom-Testprofil startet mit einer Million Axiomen und Forschung 500. Es beweist Zeit-/Reload-Konsistenz in einem vorbereiteten Zustand, nicht das natürliche Erreichen dieser Ebene.

Vor Balancingfreigabe: echte V2-Profile mit aktiver, passiver und gemischter Nutzung; mehrere Seeds; erste INT-/Item-/Labor-/Axiom-Zeitpunkte; tatsächliche Käufe und Items; 7-/30-Tage-Verläufe mit anschließendem längerem Lauf. Relevante späte Challenge-Kapitel mit echter Zielerreichung testen. Diagnoseberichte müssen tatsächliche Zielverletzungen als fehlende Freigabe behandeln. Ein pauschaler Monat-Content-Nachweis liegt noch nicht vor.

### A09 · P2: Progressiv erklären und lokalisieren

`researchAreas.ts` behandelt bei V2 alle Forschungsgebiete als zugänglich. Voraussetzungen und Kosten gelten weiter, aber die Oberfläche kann bereits früh alle fünf Bereiche mit gesperrten Folgeprojekten zeigen. Für den gewünschten schrittweisen Einstieg ist eine reduzierte, kontextbezogene Darstellung nötig; dafür müssen keine neuen Sperren im Prestige-Baum eingeführt werden.

`ProgressionPanel.tsx` verwendet deutsche Branchlabels und Katalogtexte direkt, obwohl die Einstellungen sieben Sprachen anbieten. Beispiele sind „Forschung & Daten“ und „KI-Entwicklung“ auch außerhalb Deutsch. Neue Flächen sind damit nicht vollständig lokalisiert. Vor Release entweder die tatsächlich angebotenen Sprachen vollständig abnehmen oder die Auswahl auf vollständig betreute Sprachen begrenzen.

### A10 · P2: Unfertige Produktflächen und modale Bedienung

Der sichtbare Premium-Season-Button öffnet momentan einen Hinweis über fehlende Store-Metadaten/Verifikation (`MetaHub.tsx`), keinen Premiumkauf. Die Free Season ist nutzbar; der Premiumtrack ist noch keine verkäufliche Funktion. Unfertige Angebote für V1 aus dem Spielerfluss nehmen oder vollständig anschließen.

Die neue V2-Node-/Resetoberfläche verwendet eigene modale `div`-Dialoge. Der vorhandene `MobileDetailSheet` bringt Fokusführung, Escape-Behandlung, Fokuswiederherstellung und Scroll-Lock mit; diese Mechanik wird dort nicht wiederverwendet. Ein gemeinsames Dialogverhalten plus reale Touch-/Back-/Scrollprüfung fehlt. Daraus lässt sich ohne Bild-/Gerätetest keine pauschale Note für das Aussehen ableiten.

### A11 · P2: Native Abnahme und App-Store-Paket nicht nachweisbar

`capacitor.config.json` ist vorhanden, die nativen iOS-/Android-Projekte, deren Signierung, Privacy-Manifest, Icons, konkrete Deploymentziele und App-Store-Connect-Konfiguration sind im geprüften Repository nicht enthalten. Sie können auf dem Mac bereits existieren; aus diesem Audit folgt nicht, dass sie dort fehlen. Ihre Release-Freigabe lässt sich hier nicht bestätigen. Im geprüften Einstellungsmenü ist keine Datenschutzrichtlinie verlinkt; externe Store-URLs wurden nicht eingesehen.

Gerätematrix: Erststart, langer aktiver Lauf, Sperren/Entsperren, Wechsel in den Hintergrund, harter Prozessabbruch, Relaunch, Offlinebericht, Wechsel von Sprache/Zahlenformat, Tastatur, Safe Areas, Modals, Haptik/Audio, sehr große Inventare, fehlender Speicher und Export/Teilen. Nach Geldintegration kommen Netzwerkabbruch, Store-/Ad-Abbruch, Wiederherstellung und ausstehende Kaufbestätigung hinzu. Save-Export/Import als Recovery prüfen.

Apple verlangt eine vollständige, gerätegetestete App, funktionierende angebotene IAP sowie korrekte Metadaten. Support-/Datenschutz-URL, Altersangaben, Screenshots und Datenschutzauskünfte müssen zur tatsächlich eingebundenen Funktion passen. Der Filesystem-Einsatz hat außerdem dokumentierte Privacy-Manifest-Anforderungen. Ob diese im lokalen Xcode-Target erfüllt sind, bleibt zu prüfen.

### A12 · P2: Security-Wartung der Werkzeugkette

Aktuelles `npm audit`: acht gemeldete Pakete, davon zwei kritisch, zwei hoch und vier mittel. Betroffen sind unter anderem Vitest/Tinypool, Vite und deren/CLI-Transitivedeps. `npm audit --omit=dev` meldet null bekannte Schwachstellen. Die Befunde betreffen damit in diesem Installationsgraphen die Entwicklungs-/Buildwerkzeuge; sie belegen keine direkt ausnutzbare Schwachstelle der ausgelieferten WebView-App.

Beispiel: Der kritische Vitest-Hinweis beschreibt ausdrücklich Bedingungen rund um die erreichbare UI/API bzw. Windows-Browser-/UI-Modi. Das Projekt führt normale Node-Tests aus. Trotzdem Werkzeugversionen und Lockfile kontrolliert aktualisieren, verbleibende Advisory-Ketten erneut prüfen und alle Funktions-/Migrationsprüfungen wiederholen. Kein blindes `audit fix --force` vor Release.

### A13 · P2: Messung und Wartbarkeit

Der aktuelle Produktionsbuild besitzt einen Haupt-JS-Chunk von rund 1,09 MB unkomprimiert/335 kB gzip. Das ist eine Messgröße und ein Vite-Hinweis, noch kein Nachweis schlechter iPhone-FPS. Startupzeit, RAM, Hintergrundwiederkehr, großer Save/Inventar und lange Ticks müssen auf dem Zielgerät gemessen werden; erst danach gezielt optimieren.

`App.tsx` bündelt ungefähr 44 kB in 57 Zeilen, mit einer sehr großen Aktionsverzweigung. `storage.ts` hat eine zusätzliche manuelle Validierung neben Domain-/V2-Validatoren. Alte und neue Regeln existieren parallel. Diese Struktur erhöht die Wahrscheinlichkeit inkonsistenter Änderungen, wie A04/A06 zeigen. Gemeinsame Zustandsschemata/Tracklisten, typisierte Aktionen und nach Domänen getrennte Transaktionen sollten den nächsten Stabilisierungsschritt begleiten. Ein Komplett-Rewrite vor Release ist dafür nicht erforderlich.

Telemetry, Crashdaten und Balanceexport existieren lokal. Ein aggregierter Produktmesspfad für Retention D1/D7, Sessions, frühe Abbrüche, Item-/Prestige-Funnel und Kauf-/Adfehler ist im Einstiegspunkt nicht angebunden. Ohne Soft-Launch-Daten lassen sich weder Spielspaß/Retention noch Einnahmen aus Codequalität ableiten.

## Prüfprotokoll

- Frischer Checkout des oben genannten Hauptbranches; keine Änderungen an Spielregeln oder Spielständen für diesen Auditbericht.
- `npm ci`: erfolgreich. Ursprüngliche Umgebung Node 24.19.0; Projekt verlangt Node 22. Kontrolllauf zusätzlich mit Node 22.23.3.
- `npm run build` einschließlich Typecheck/Source-Path-Prüfung: erfolgreich, Haupt-JS 1.072,22 kB/329,43 kB gzip.
- Vollständiger Standardtestlauf des Ausgangsstands 8e7f978 unter Node 24: 1.572 bestanden, 10 zeitüberschreitungsbedingt fehlgeschlagen; zusätzlich zwei Vitest-Worker-RPC-Timeouts. 106/115 Dateien grün, neun Dateien betroffen, Gesamtdauer rund 732 s. Keine der zehn Fehlerausgaben war ein fehlgeschlagener fachlicher Erwartungsvergleich. Der unveränderte Standardlauf ist damit in dieser Umgebung nicht grün..
- Kontrolllauf der betroffenen Ausgangsstand-Testdateien unter Node 22 mit 30 s Standard-Testbudget: fünf betroffene Dateien mit insgesamt 103/103 Tests bestanden. Der zusätzliche Kontrolllauf (120 s Standardbudget, ausdrücklich gesetzte Einzelbudgets unverändert) der vier weiteren betroffenen Dateien ergibt 28/31 bestanden, drei weiterhin über ihrem ausdrücklich gesetzten Laufzeitlimit (90 s / 45 s / 10 s) sowie zwei Worker-RPC-Timeouts. Über beide Node-22-Kontrollläufe sind damit 131/134 Tests bestanden; die drei übrigen Fehler sind erneut Zeitüberschreitungen. Das geänderte Laufzeitbudget ist kein bestandener Nachweis des ursprünglichen 5-s-Budgets.
- Aktueller Hauptbranch ff75c464: Build einschließlich Typecheck unter Node 22 bestanden (1.092,01 kB Haupt-JS, 335,20 kB gzip); die 36 neuen Monetarisierungstests bestanden ebenfalls unter Node 22. Ein vollständiger isolierter Node-22-Releasecheck des neuen Stands wird dadurch nicht ersetzt.
- Gezielte Mechanik-Reproduktionen auf Ausgangs-main und #118 / aktuellem main: A01–A05 bestätigt und im PR korrigiert; A06 auf beiden Ständen bestätigt.
- Statische Assetprüfung: 39 wörtliche Referenzen, keine fehlenden Dateien.
- Abhängigkeitsprüfung: Gesamtgraph 8 Meldungen; Produktionsgraph 0. Das ist keine vollständige Sicherheitsprüfung des späteren nativen Builds oder eines noch fehlenden Backends.
- Zusätzlicher frischer V2-Lauf des Ausgangsstands: zwei Stunden Kalenderzeit mit Kurzsessions (15 Minuten aktiv insgesamt, 3 Taps/s aktiv, Seed 1708, Modellpriorität, Belohnungen abgeholt). Ein Common-Impulsrelais, neun Trainings und zwei Forschungen; null Prestiges und null abholbare INT am Ende; Save/Reload und Data-Buchhaltung konsistent. Das ist ein Profil, keine Balancefreigabe oder allgemeine Spielerprognose. Der dauerhaft aktive Zwei-Stunden-Lauf überschritt das interne 60-s-Messbudget; dafür liegt kein vollständiges Ergebnis vor.
- Nicht ausgeführt/freigegeben: vollständige manuelle Langzeitkampagnen, alle 690 Challenge-Zielerreichungen, echte Zahlungen/Ads, visuelle Browser-/iPhone-Abnahme und App-Store-Review.

## Reihenfolge bis zum Release

1. **Stabilisierung:** Die bereits gemergten A01–A05 als Regressionen behalten, A06 vervollständigen und alle neuen Zustände durch echten Save/Reload sowie Auto-/Offlinepfade prüfen. Keine zusätzlichen Progressionssysteme in diese Phase aufnehmen.
2. **V2-Freigabeprofil:** neue Spielstände und echte migrierte Nutzersaves; normales Prestige, Laboröffnung, erste KI, erstes Axiom und Wiederaufbau. Aktive, passive und gemischte Spielweise gegenüber den vereinbarten Pacingzielen messen. Probleme gezielt kalibrieren.
3. **iPhone-TestFlight:** vollständigen lokalen nativen Build, Recovery und Gerätebedienung abnehmen; kleine externe Testergruppe beobachten. Verwirrende oder tote Flächen reduzieren und die tatsächlich angebotenen Sprachen vollständig prüfen.
4. **Kommerzieller Kandidat:** Store-/Ad-Anbieter und Vertrauens-/Auslieferungsmodell anschließen; Sandbox-Matrix einschließlich unterbrochener Transaktionen bestehen. Ereignismessung/Fehlermonitoring für den Soft Launch einrichten und reale Pacing-/Abbruchdaten bewerten.
5. **Store-Freigabe:** finales Datenschutz-/Support-/Metadatenpaket, Screenshots, Altersangaben, Signierung/Archiv und Reviewhinweise kontrollieren. Danach begrenzter öffentlicher Start und Beobachtung vor breiter Vermarktung.

Für die erste V1 nicht zwingend: Leaderboards, Freunde/Einladungen, zusätzliche Prestigeebenen, weitere KI-Pools oder viele neue Itemarten. Benachrichtigungen können später ergänzt werden; sie sind aktuell deaktiviert und kein technischer Muss-Punkt für eine kostenlose Beta.

Eine seriöse Fertig-Prozentzahl oder ein belastbarer Release-Termin ist ohne diese offenen Abnahmen nicht ableitbar. Der Fortschritt liegt in der vorhandenen Spielstruktur; der Engpass ist jetzt die belegte Zuverlässigkeit und Integration dieser Struktur.

Maschinenlesbares Prüfprotokoll: [release-verification-2026-10-17.json](audits/release-verification-2026-10-17.json).

## Quellen

- [Apple App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/) – insbesondere 2.1, 3.1.1 und 5.1.
- [Apple: Submitting](https://developer.apple.com/app-store/submitting/).
- [Capacitor Filesystem: Privacy Manifest](https://capacitorjs.com/docs/apis/filesystem#apple-privacy-manifest-requirements).
- [Vitest Advisory GHSA-5xrq-8626-4rwp](https://github.com/advisories/GHSA-5xrq-8626-4rwp).
- [Tinypool Advisory GHSA-5gmw-xhrv-c9v3](https://github.com/advisories/GHSA-5gmw-xhrv-c9v3).

Die App-Store-Vorgaben wurden am 17.10.2026 mit offiziellen Quellen gegengeprüft. Konkrete Spielbefunde stammen aus dem gepinnten Repository und den beigefügten Reproduktionen.
