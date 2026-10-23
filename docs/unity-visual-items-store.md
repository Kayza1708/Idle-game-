# Zusammenhängender Visual-/Item-/Store-Abschnitt · in Umsetzung

Basis: aktueller Remote-main `05376eff` lokal ohne Datenverlust in `codex/unity-rewrite` einbezogen; Mergecommit `6ed588db`. Bestehender Draft #154, kein PR-Merge/Publish, keine Cloudflare-Produktionsänderungen. Der zuvor geprüfte Truhenstand7660b235 bleibt mit echten Clips und Save-Erhaltungsnachweisen separat erhalten.

## Beauftragter Umfang und Abnahme

- Truhenscharnier erhalten; zusätzliche differenzierte Seltenheitsrückmeldung, echte gespeicherte Funde, Kürzen/Abbruch/Reduced Motion.
- Alle60 INT-/24 Axiomknoten: eigene funktionale Progressionsmotive statt Item-/Hardwareersatz, klare Zustände, keine Vorgängerkaufsperren.
- Mira: sechs eigene Ausdrucksframes, ruhige Idle-/Blink-/Sprechbewegung, Warnung/Erfolg/Meilensteine, reduzierte Bewegung; Originaldesign erhalten.
- Fünf abgeschlossene Online-Handel pro Spieler/UTC-Tag gemeinsam für Waren, Gutscheine und Geschenke, beide Parteien atomar. Serverseitige Bestände; lokale Saves bleiben untrusted.
- Datenschutz/Store: echte lokale Implementierungen und Tests der Sicherheitsgrenzen, keine unbelegte Store-/Altersfreigabe.
- Sechs neue Dark-Lab-/Meta-Items mit tatsächlichen Verbrauchern, Preisen/Unlocks aus economy.ts, sieben Namen/Effekttexte, Rezepte/Drop-Pools/Fusion/Upgrade und Save-Migration22→23.
- Sechs gleich große88×88-Hauptsockel auch gesperrt, Originalformen, gemeinsame Rahmen/Grafiken, aktive Boni erreichbar.
- Gemeinsame örtliche Rückmeldung neuer Käufe/Freischaltungen; vorhandene Animationen erhalten. Keine kosmetische Ressourcenauszahlung.
- Abschließend gemeinsame TS/C#-Referenzen, volle Web-/Unity-Regressionen und echte visuelle DE/EN-Prüfung. Einzelne gezielte Tests während Implementierung sind keine Fertigmeldung.

## Bereits belegte lokale Backend-Verträge

Migration0009: Zähler und Escrow/Transfer im selben SQL-Statement. Angebote/Storno/Ablauf zählen nicht. Geschenke und beide Handelsformen teilen das Limit; Backfill erhält Tagesverbrauch. Letzter Platz auch bei zwei parallelen SQLite-Verbindungen nur einmal verbraucht. Migration0010: feste Meldungen ohne Freitext, Blockierung von Einladungen/Handel/Geschenken, atomare Kontolöschung mit Sitzungswiderruf, Escrow-Abwicklung und Company-Erhaltung für andere Mitglieder. Private Statistiken bleiben Standard. 30 lokale SQLite-Verträge und11 Node-Tests bestanden; keine Produktionsmigration ausgeführt. Finale API-/Unity-Abnahme steht noch aus.

## Neue Balance (ausdrücklich beauftragt)

Neue IDs werden an die bisherigen30 IDs angehängt; bestehende Werte/Rezepte bleiben erhalten. Rezept-Raritäten unterscheiden den vorgesehenen Rezept-/Kostenrang; wie im bestehenden Instant-Crafting entstehen gewöhnliche Exemplare, höhere Seltenheiten entstehen über vorhandene Fusion/Drops. Keine Gratisfreischaltung.

| Item | Sockel / Zugang | Tatsächliche neue Wirkung (begrenzt) |
|---|---|---|
| Geheimlabor-Resonator | Forschung / Geheimlabor | Erkenntnisrate, Bonusanteil max35% je Exemplar |
| Modell-Echokern | Core / Geheimlabor, aktives Modell für Wirkung | Bonusanteil des Revenue-Modellkerns max25% |
| Axiomgitter | Prozessor / erster Axiomzyklus | Axiomgewinn vor Abrundung, max20% |
| Zyklus-Observatorium | Forschung / erster Axiomzyklus | Forschungstempo, max30%, Kontextfaktor min(1,Zyklen/5) |
| Entropiesenke | Prozessor / Geheimlabor | Compute, max40%, Kontextfaktor min(1,max(0,log10(unverbrauchte Erkenntnis))/6); Ausgabe senkt Wirkung |
| Mnemonischer Anker | Core / drei erworbene Modelle | Trainingstempo, max35%, Kontextfaktor min(1,Modellzahl/5) |

Kosten, Komponenten, Module, Daten, Fragmente, Profile, Caps und Kontextwerte ausschließlich in `src/economy.ts`; Änderungen zusätzlich in `docs/economy.md`. Die endgültigen Paritätsfälle werden mit der Implementierung erzeugt, nicht aus berechneten Erwartungswerten nachträglich korrigiert.

## Offizielle Richtlinienbasis (23.10.2026 geprüft)

- [Apple App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/): digitale Inhalte, Zufallschancen vor Kauf, UGC und Datenschutz.
- [Apple Kontolöschung](https://developer.apple.com/support/offering-account-deletion-in-your-app/).
- [Google Play Payments](https://support.google.com/googleplay/android-developer/answer/9858738?hl=en): tatsächliche Preise/Chancen nahe dem Kauf.
- [Google Kontolöschung](https://support.google.com/googleplay/android-developer/answer/13327111?hl=en) und [User Data](https://support.google.com/googleplay/android-developer/answer/10144311?hl=en-gb): In-App-Pfad plus externe Webressource, Data-Safety-Angaben.
- [USK Alterskennzeichen](https://usk.de/die-usk-alterskennzeichen/) und [IARC](https://usk.de/fuer-unternehmen/spiele-und-apps-pruefen-lassen/spiele-und-apps-im-iarc-system/): Nutzungsrisiken/Zufallskäufe müssen angegeben werden; keine ungeprüfte USK-Einstufung versprechen.

Native Storeanbieter/Identitätsbindung, externe authentifizierte Lösch-Webressource, juristisch geprüfte Datenschutzerklärung/Einwilligungen, Moderationsbetrieb, Store-Metadaten/Data Safety/IARC und physische Geräteabnahme bleiben Releaseanforderungen. Die verfügbaren Produktionsanbieter bleiben unverfügbar; kein vorgetäuschter Kauf-/Werbeerfolg, kein Echtgeld-P2P/Cashout, kein Chat.

## Assetherkunft

Eigener vorhandener Progressionsatlas wird erstmals korrekt für Unity-Knoten statt Itembildern verwendet. Neue Mira- und Meta-Itemsheets mit eingebauter ImageGen-Funktion anhand des eigenen Mira-Originals bzw. eigener Sci-Fi-Motive erzeugt; transparente Alphaecken tatsächlich geprüft (0,0). Eingabesprites erhalten. Arbeitskopien: `Art/mira-expressions-v1.png`, `Art/meta-items-v1.png`, Webkopie `public/assets/game/meta-items-v1.png`. Punktfilter und Slicing per Unity-Editor-APIs. Prompts/Generatornachweis folgen im finalen Assetmanifest. Keine fremden Archero-Assets/Fonts/SDKs übernommen.

### Noch keine pauschale Storefreigabe

Die lokale API-Prüfung nutzt tatsächlich ausgeführte SQLite-Migrationen1–10 und echte Request-/Response-Objekte für Melden, Blockieren und Kontolöschung. Das ersetzt keinen Cloudflare-D1-/Produktions-/Lasttest. Die Worker-Migrationen werden bewusst nicht remote angewendet. Ein kommerziell nutzbarer sicherer Apple-/Google-Identitäts- und Fortschrittsnachweis ist weiterhin nicht eingerichtet; es wird kein lokaler INT- oder Gem-Bestand als Onlinevermögen akzeptiert. Ohne diese Bindung bleiben Onlinezugänge ehrlich gesperrt. Externe authentifizierte Kontolöschungsseite und Moderationsbetrieb sind noch nicht fertig; das neue In-App-Löschen allein erfüllt daher nicht sämtliche Releasepflichten.

## Durchgeführte zusammenhängende Implementierung

- **Truhen:** feste Scharnierachse und offene Mulde aus dem geprüften Vorgänger erhalten. Die kurze lokale Sprite-Aufprallsequenz verwendet tatsächliche Itemseltenheit und deren Farbe; Intensität/Laufzeit steigen begrenzt von Common bis Legendary/Mythic. Vier echte bezahlte Truhen öffnen vollständig nacheinander, ohne Animation als Grant. In der isolierten Aufnahmeserie lieferten Common/Rare nur Materialien, Epic eine Rare-Neural-ASIC und Legendary einen Legendary-Tensor-Core. Das wird nicht zu garantierten Inhalten umgedeutet.
- **INT/Axiome:**60/24 Zuordnungen zu einem eigenen16-Motive-Progressionsatlas, eigene Kern-/Resetsymbole; keine Item- oder Hardwareatlasreferenzen. Käuferzustände und Maximalstufe bleiben ledgerabhängig, Verbindungen bleiben ohne Vorgängerkaufsperre. Gemeinsame örtliche Kaufrückmeldung erst nach erfolgreichem Save. Kompakter Kopf, fünf gleich breite44+-Werkzeuge und viewportabhängige Netzwerkhöhe; Branch-Grid passt bei320px. Pinch liest höchstens zwei aktive Touches ohne LINQ-Array pro Frame; Axiomkatalog einmalig statt ständig neu erzeugt. Node-Refresh erzeugt keine neuen GameObjects.
- **Mira:** sechs eigene Ausdrucksframes in Dialogdock, Storyansicht und Geheimlabor. Ruhige Idle-/Blinkbewegung mit grobem Timer nur bei sichtbarem Portrait; keine Layoutschreibzugriffe für unveränderte Positionen. Warnung bei ungültigem Namen, Erfolg und Meilensteinkontext, static Reduced Motion. Erklärpose bleibt stabil; kein schnelles Wechseln ganzer Körperposen als Lippenersatz, keine künstliche Sprachausgabe. Dialogarchiv zeigt tatsächliche Titel/Textanfänge statt technischer Dialog-IDs.
- **Ausrüstung:** sechs Hauptsockel sind alle88×88, auch gesperrt. Formen/Farben bleiben; gemeinsame Alpha-Bounds zentrieren eigene Grafiken. Inventarportraits88×106 und pixelgerundete gemeinsame Artfläche erhalten dieselbe Grafikgröße wie im Sockel. Aktive tatsächliche Boni öffnen eine kompakte gemeinsame Detailansicht; Detailportrait wird danach korrekt wieder eingeblendet. Ausrüsten/Wechsel/Entfernen und Vergleiche verwenden die vorhandenen Transaktionen.
- **Items:** sechs neue Typen,36 insgesamt. Item-/Rezept-/Rollen-/Drop-/Bauplan-/Capsule-/Gumball-/Upgrade-/Fusion-/Detailsysteme einschließlich passender Art und sieben Namen/Effekttexten erweitert. Neue Primäreffekte hängen an echten Domainverbrauchern; verschiedene Modell-/Zyklus-/Erkenntniszustände und mehrere Axiomzyklen sind gemeinsame TS/C#-Fälle. Der Erkenntnisfall erzeugt ausdrücklich eine positive tatsächliche Rate, kein wirkungsloser0→0-Beleg.
- **Save23:** vorherige30 Katalogeinträge behalten ihre Indizes; neue Einträge beginnen leer. Gültige Saves1–22 erhalten Originalkopien. Save22-Original und Backup bleiben beim atomaren Upgrade erhalten; unbekannte Arraylängen werden abgewiesen. Auch suspendiertes Challenge-Hauptspiel wird erweitert. Kein automatischer Web-/Capacitor-Import und kein Austausch normaler Spielerstände durch vorbereitete Aufnahmen.
- **Handel/Datenschutz:** fünf gemeinsame bestätigte Transfers pro Person/UTC-Tag atomar für normale Angebote, Gutscheine und Geschenke. Quota/Reset im erreichbaren Handelsmenü, erschöpftes Limit sperrt Annahme. Warenbestand/-angebote, Datenschutz, Melden/Blockieren/Entblocken und bestätigtes Löschen des Onlinekontos sind über die bestehende Company-UI erreichbar. Alle Company-Aufrufe prüfen Anbieter/Auth vor dem Ausführen; ein nicht eingerichteter Anbieter löst keine Null-Delegate-Ausnahme mehr aus. Erfolgreiche Kontolöschung entfernt den transportinternen Token auch bei zwischenzeitlichem Ansichtswechsel.
- **Chancen:** tatsächliche Itemfund-/Seltenheits-/Gutscheinwahrscheinlichkeiten und Chance je zugänglichem Itemtyp an Truhen-/Gumballkaufwegen, vollständiger aktueller Pool aufklappbar. Keine Auszahlung oder Geldwert-Zusage; Produktionskäufe und Anzeigen weiterhin unverfügbar.

## Lokaler Worker-Nachweis

Wrangler4.152.0, Workerd und eine ausschließlich lokale D1-Datenbank unter dem ignorierten `Builds/company-meta-d1-review-v2`. Alle zehn Migrationen tatsächlich angewendet, **keine Remote-Migration**. Der erste lokale D1-Lauf fand die niedrigere Compound-SELECT-Grenze; Migration0009 verwendet deshalb sechs getrennte gedeckelte Backfill-Summen statt sechsfacher UNION. Eine zusätzliche Python3.12-Prüfung erzwingt die D1-Grenze5. Ein früher HTTP-Aufbau hatte die vorhandene48-Stunden-Mitgliedschaftsregel noch nicht erfüllt; nur die isolierte Fixture wurde entsprechend vorbereitet, keine Regel geändert.

Der vollständige echte HTTP-Smoke besteht: Auth/Privacy, unzulässiger Chat-Report abgewiesen, feste Meldung, Blockieren/Entblocken, vier Geschenke, zwei gleichzeitig eintreffende Anfragen auf den fünften Platz (genau ein201, ein429), beide Zähler5/5, unveränderte Bestände bei Replay/Kollision, ausdrückliche Löschbestätigung und widerrufene Session, andere Company bleibt erhalten. Teststock stammt nur aus lokaler SQL-Provisionierung, nicht aus einem Spielstand.

31 echte SQLite-Tests (Python3.12.14),14 Node-Tests (Node22.23.3), HTTP-Smoke erfolgreich. Python3.9 des Macs bietet `sqlite3.setlimit` nicht; Tests und CI benennen deshalb Python3.11+ bzw. fixieren3.12. Es wurde kein Test übersprungen oder abgeschwächt.

## Bekannte verbleibende Grenzen

- Keine Store-/USK-Freigabe und keine Produktions-Onlineabnahme. Verifizierte Identitäts-/Fortschrittsbindung, Moderationsbetrieb, externe Lösch-Webressource, Datenschutzerklärung/Einwilligungs- und Storeformulare sowie genehmigter produktiver Migrationsrollout fehlen weiterhin. Native Werbe-/Kaufanbieter bleiben unverfügbar. Kein SDK hinzugefügt.
- Company-Käufe/Projekte können ohne diese verifizierte Anbindung nicht als echte Spielerereignisse ausgeführt oder mit lokalen Saves nachgestellt werden. Vorhandene Abzeichen-/Profilrahmenanimationen bleiben erhalten; keine erfundene Company-Freischaltbelohnung. Online-Kaufrückmeldungen setzen einen real bestätigten Servervorgang voraus.
- Historische Sprachfallbacks bleiben insbesondere bei einigen INT-/Axiomnamen, langen Beschreibungen und Markt-/Companytexten sichtbar. Die sechs neuen Itemnamen und Effekttexte sind in sieben Sprachen vorhanden; das ist keine neue pauschale Vollübersetzungszusage für sämtliche bestehenden Texte.
- Langfristige Balancekampagnen der sechs **neuen** Items sind von technischer Formelparität zu trennen. Alte Werte wurden nicht nachjustiert; neue Preise/Caps/Sammlungsstufen sind ausdrücklich dokumentiert.
- Physisches iPhone, Wärme/Batterie, echte Lautsprecher/Haptik, OS-Reduced-Motion-Anbindung und60-fps-Abnahme bleiben separat. Editoraufnahme mit Screenshot-/Audio-Probe ist kein Performancebenchmark und Simulator kein Gerätenachweis.

## Abschließende technische und visuelle Abnahme

- Unity6000.3.26f1 Import/Compile erfolgreich, finale Läufe beide Exit0: **94/94 PlayMode** (404,39s) und **142/142 EditMode** (129,32s), einschließlich395Meta-/588Item-Referenzfällen, positiver Erkenntnisproduktion, mehreren Axiomzyklen, Slot-/Arraymigration, unbekannten Saves, Abbruch/Reload/Reduced Motion und acht abgesicherten Company-Aufrufwegen.
- **1937/1937 Vitest in147Dateien**, Typecheck und Webbuild bestanden. Ein Zwischenlauf traf während einer Fixture-Erweiterung auf veraltete Referenzen; nach regenerierten/fixierten Eingaben besteht der volle Schlusslauf. Die vorhandene Vite-Warnung für große Chunks bleibt sichtbar; keine Prüfung deaktiviert.
- Eigene Sichtprüfung der tatsächlichen Unity-Ausgaben: leere/gesperrte und mit allen sechs neuen Items belegte Sockel bei320/390/430 inDE/EN; Itemdetails und lange Namen/fehlende Ressourcen; beide Symbolnetze und korrigierte gleich breite Toolbar. Gefundene Größenabweichung Inventar↔Sockel und zusammengedrängte Werkzeugtexte korrigiert. Dichte Zoomtexte und vorhandene Sprachfallbacks sind oben ausdrücklich offen.
- [Mira, echte Runtime, ca.6s mit Spielaudio](media/unity-meta-visual/mira-runtime.mp4): wirkliche Spriteausdrücke/Idle/Blinken im gespeicherten wiedergeöffneten Dialog, vorbereitete Ausdruckscues kenntlich. Kein Voiceover. Absolute Enginezeit wurde ausschließlich auf Videozeit0 bezogen; Frameabstände bleiben unverändert.
- [Vier tatsächliche bezahlte Truhen, ca.14s mit Spielaudio](media/unity-meta-visual/four-chest-tiers.mp4): vier vollständige Öffnungen samt tatsächlichen Ergebnissen, keine Schnitte im Effekt, keine nachträglichen Partikel/Verlangsamung. [Tatsächliche Receipts](media/unity-meta-visual/actual-receipts.txt). Früherer vollständiger Scharnier-Vorher/Nachher-Nachweis bleibt in `unity-chest-components.md`.
- Die33PNG-Dateien unter `media/unity-meta-visual/` sind Original-Unity-Captures. `*-layout-intermediate.png` bezeichnet ausdrücklich einen früheren Layout-Zwischenstand dieser Runde, keinen finalen Render. Videos wurden zusätzlich dekodiert auf Orientierung/Dauer/Audio geprüft. [Assetherkunft](assets/meta-visual-v1.md), [maschineller Nachweis](unity-visual-items-store-verification.json).

Der native Simulatorstand ist unten mit konkreter Commit-/Save-Provenienz ergänzt. Die technischen Tests und vorliegenden Bilder sind kein pauschaler Beweis für Storefreigabe oder physische60fps.

## Tatsächlich installierter nativer Player

Implementierungscommit **`c15b51eb6496c92bd1058eac5ff2cce903e5684a`**, Unity6000.3.26f1, vorhandenes iOS-Build-Support-Modul, nativer IL2CPP/ARM64-Simulatorplayer. Separater Export `Builds/iOS-MetaVisual-c15b51eb/Xcode`, Unity-Exit0/`Succeeded errors=0`, Xcode `ReleaseForProfiling`/`iphonesimulator`, **BUILD SUCCEEDED**. Kein Webbuild und kein physisches iPhone. Vorhandener iPhone16Pro-Simulator mit iOS27.0. Kein Team-/Signingwechsel; Simulatorbuild ohne Codesignierung.

Derselbe normale Bundle-Identifier `com.kayza1708.idleintelligence.unity` ist tatsächlich installiert und gestartet; installierte Info.plist enthält den genannten Commit. Zuvor lief7660b235/Save22. Vor dem Update wurde Unity durch Öffnen der iOS-Einstellungen in den Hintergrund geschickt, ohne erzwungenes Beenden. Frische private Sicherung:15Unity- und15Capacitor-Dateien; alle30 unmittelbar vor und nach Installation vor dem ersten Start byteidentisch. Nach dem echten Kaltstart: Save23, gültige Prüfsumme,36 Katalogeinträge, alte30 Einträge sowie Inventar/Ausrüstung/permanente Slots unverändert, exaktes v22-Original vorhanden, `prepared=false`. Alle15Capacitor-Dateien auch danach unverändert. Der erste3-Sekunden-Probezeitpunkt war noch im Kaltstart; geprüft wurde der anschließend vollständig geladene Player. Keine normalen Saves durch Aufnahmezustände ersetzt.

Das normale Simulator-Labor wurde tatsächlich angesehen: korrekte Hochformat-Safe-Area, Ressourcenleiste, Labor, Overdrive, Modell-/Trainingszugang, Hardware und feste Navigation. Der private Original-Screenshot bleibt unter `Builds/iOS-MetaVisual-c15b51eb/native-normal-c15b51eb.png`; normale Spielerdaten werden nicht in den öffentlichen PR hochgeladen. Die5 Export-Nebenänderungen an Unity-Einstellungen wurden aus der frischen Sicherung bytegenau wiederhergestellt; Exportfassungen bleiben privat erhalten. Zusätzliche Geräte-/Performance-/Lautsprecher- und native Reload-Bedienabnahme bleiben getrennt von den vollständigen Editor-Reloadtests.
