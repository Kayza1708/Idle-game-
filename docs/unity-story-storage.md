# Mira, Spielstände und gemessene Verläufe

Prüfstand 21.10.2026, Unity 6000.3.26f1. Fortsetzung auf `codex/unity-rewrite`; #137 ist extern gemergt. Dieser Bericht ersetzt historische Aussagen „nur Dialogkatalog“ und „keine Recoveryoberfläche“. Er ist **keine Gesamtabnahme** des Rewrites. Die konkrete Restarbeit steht in `unity-functional-remaining.md`.

## Verbundene Story

`NarrativeBridge`, `StoryView` und `TutorialNavigation` verbinden die 38 Originaldialoge, fünf Kapitel und neun regulären Tutorialziele mit tatsächlichen Transaktionen. KI-Namenswahl verwendet dieselbe Namenspolicy wie das Profil. Dialogposition, Queue, gesehenen Seiten, Kapitel, Skip/Ende/Resume und automatische Kapitelöffnung werden gespeichert. Hauptspiel und Challenge besitzen getrennte Ereignisbelege. Keine Lifetime-Ersatzflag behauptet ein tatsächlich nie gestartetes Training oder eine Analyse.

Der echte Zielknopf öffnet Hardware, Training, Forschung oder Werkbank und fokussiert das zugehörige Bedienelement. Bei ungeeigneter Kaufmenge wird auf ×1 umgestellt; Voraussetzungen und fehlende Ressourcen bleiben sichtbar. Vorhandene sechsphasige Unity-Intros werden ausdrücklich als Legacy-Einführung erhalten. Ein neuer Runtime-Save beginnt mit Namenswahl und Prolog; reine alte Domainfixtures behalten ihre bisherige Einführung. Skip/Resume erfindet keine Gratisangebote.

Zusätzliche Runtime-Referenz: 84 tatsächlich ausgeführte Source-Schritte samt Dialogtexten, Zielnavigation und Ereignisbelegen, nach jedem Schritt nativer Save-Roundtrip. Vorbereitete Vorräte/Prestigeberechtigung sind im Fixture benannt; dies ist kein natürlicher Lauf. Die bisherigen 445 reinen Storyfälle und der natürliche erste-Prestige-Lauf bleiben Teil der Regression.

Quellproblem: `resumeTutorial` erzeugt vor dem ersten Impuls `tutorial-name` beziehungsweise `tutorial-prologue`, die im Originalkatalog nicht existieren. Die Runtime erklärt und sperrt diesen defekten Resumeweg; Namenswahl und reguläres Spielen bleiben verfügbar. Keine Ersatzdialoge oder Freibelohnungen. Die Originalführung kann außerdem einen SBC vor einer V2-Analyse verlangen, obwohl das reine aktuelle Analysequote diese Hardware nicht voraussetzt. Der Port ergänzt keine zusätzliche Mechaniksperre.

## Texte und Feedback

Die vorhandenen Originalkopien werden um reproduzierbar gelesene UI-/Achievement-/Rückkehrtexte ergänzt. Native Adapterbeschriftungen besitzen eigene sieben Sprachwerte. Zusammengesetzte Beschriftungen werden mit ihrem Ausgangstext erneut lokalisiert, statt mehrfach übersetzte Resultate weiterzuverarbeiten; persönliche Namen und Eingabefelder bleiben geschützt. Originale englische/deutsche Source-Fallbacks sind weiterhin Original-Fallbacks, keine neu vollständige Übersetzung des gesamten Webkatalogs. Noch fehlende Detailanbindungen werden bei der breiten Nachprüfung separat erfasst.

Die bestehenden acht Audioassets, Einstellungen und transaktionsgebundenen Feedbackrouten bleiben erhalten. Haptik meldet auf der geprüften Plattform weiterhin ausdrücklich die fehlende Unity-Patternanbindung; es gibt keine vorgetäuschte Vibration und kein neues SDK.

## Speichervertrag v18

Versionen 1–17 bleiben lesbar. Alte native Hauptdateien erhalten vor Migration eine versionsbezogene Originalkopie. Storymarker unterscheiden fehlende Daten von Unitys automatisch erzeugten leeren Objekten. Historische Ereignisse werden nicht aus Beständen erfunden. Neue Felder werden typbezogen migriert; bestehende Pflichtfelder bleiben verpflichtend.

Die Store-Ansicht unter Forschung erlaubt Export, Zwischenablage und Exportordner, Dateiprüfung, Vorschau sowie ausdrücklich bestätigte Recovery. Quelle, Hauptdatei, Backup und Pending bleiben erhalten. Beschädigte/fremde Versionen werden nicht automatisch ersetzt. Gültige externe Änderungen seit dem Laden sperren ebenfalls das veraltete Schreiben. Ein Pending unterbricht gewöhnliches Speichern, bis eine explizite Recovery erfolgt.

Webimport ist eine bewusste zweistufige Übernahme: Der gebündelte Offline-Konverter verwendet die tatsächlichen Sourcefunktionen `restore`/`serialize` für Versionen 1–63; Unity prüft anschließend Struktur, aktuelle Domainverträge und kritische exakte Konten/Inventar/Hardware gegen den normalisierten Sourcezustand. Bei v63 werden diese Konten auch mit dem Original verglichen. Die Vorschau ersetzt keinen Stand. Erst nach Bestätigung erfolgt die atomare Recovery in den validierten nativen Kandidaten.

Der vollständige eingegebene Originaltext und der vollständige normalisierte Webstand werden im nativen Save und damit auch im Unity-Export erhalten. Die Transferdatei wird zusätzlich unverändert gesichert. Source-only-/Altmetadaten werden nicht still gelöscht. Aktive nicht abbildbare Altreservierungen, ungelöste Alt-Fusionen/Resetverträge und abweichende Testuhren müssen ausdrücklich abgelehnt beziehungsweise einzeln geprüft werden. Es gibt keinen automatischen Browserzugriff. Das ist eine lokale Kompatibilitätshilfe, kein Anti-Cheat- oder Storebelegserver.

Alte V2-Legacyfaktoren für Produktion, Forschung, Training und Itemeffekte sowie vorhandene Lizenzen/Autokäufer werden tatsächlich konsumiert. Zyklusfaktoren bleiben beim normalen Prestige und entfallen beim Axiom nach Originalregel. Trainingsboost wird an seiner wirklichen Ablaufgrenze integriert; Scannerrechte haben einen erreichbaren Verbraucher. Die erste bezahlte Bauplan-Forschung verdient ihre Fragmente ausschließlich im Hauptspiel, einmalig und mit verzögerbarer Kapazitätsbuchung.

## Rückkehr und lokale Messung

Die Simulation erfasst wirkliche wissenschaftliche Brutto-Produktion vor automatischen Ausgaben, tatsächlich gekaufte Hardware, angerechnete/verfallene Zeit, Jobabschlüsse, Komponenten/Fragmente und verbleibende neue Items. Der Beleg wird mit dem fortgeschrittenen Save vor der Anzeige geschrieben. Lesen, erneute Anzeige, Reload und Recovery vergeben keine zusätzlichen Ressourcen. Begrenzte frühere Belege bleiben im Journal.

Neue native Runs erfassen Produktionszeit/-mengen, Taps, echte Ereignisse, bezahlte Kosten und bekannte Laufzeiten. Prestige/Axiom schließen den vorherigen Run; Originalgrenzen verdichten Checkpoints und archivieren ältere Runs mit Summen statt erfundener Einzeldaten. Hauptspielmessung und Challengearchiv bleiben getrennt. Vorhandene Web-Balancehistorien werden projiziert; vollständige alte Detaildaten bleiben im normalisierten Original verfügbar. Weitere Felder und Diagnose-/Zielanbindungen werden vor der Gesamtabnahme weiter geprüft.

## Tatsächliche Prüfungen dieses Arbeitsstands

- Vollständige EditMode-Suite: **109/109**, `/tmp/unity-functional-current-edit2.xml`.
- Vorherige vollständige verbundene PlayMode-Suite: **47/47**, `/tmp/unity-story-storage-all-play.xml`; einschließlich tatsächlichem Export, Importvorschau/Bestätigung, Reload und sieben Sprachen bei 320/390/430 Breite. Die jüngsten zusätzlichen Anbindungen erhalten einen erneuten Lauf.
- Native Recovery einschließlich beschädigter Hauptdatei, Pending, Backup, geändertem Vorschaukandidaten und gültiger externer Ersetzung; bestehende Migrationsregressionen erhalten.
- 103 finanzierte Resetläufe prüfen Begrenzung/Archivierung. Drei zusätzliche Source-Runs vergleichen Produktion und exakte INT-Vergabe. Bei `pow`-basierten Produktionsraten unterscheiden sich JS/Mono im letzten Gleitkommabit (beobachtet etwa 4e-14 Credits bei 582 Credits); Prüfung mit 2e-12 Log10-Toleranz, gespeicherte wissenschaftliche Operanden und Ganzzahl-INT bleiben exakt. Keine Preis-/Formeländerung.
- Vier zusätzliche explizit vorbereitete Sourcezustände prüfen Legacyfaktoren, Boostablauf und beide Resetarten; keine natürlichen Spielstände.
- Typecheck, vollständiges Vitest **1.884/143 Dateien** und Web-Build bestanden; spätere Adapterfälle werden zusätzlich geprüft. Source unter `src/` unverändert.
- Echter lokaler **StandaloneOSX-Playerbuild**, Universal **arm64/x86_64**, 370.231.331 Bytes, Buildresultat `Succeeded`, null Fehler: `/tmp/IdleIntelligence-functional-20261021.app`, `/tmp/unity-local-player-build.log`. Das ist kein Web-Build.
- Dieser gebaute Player bestand echte Namenswahl, Prolog, Tap, bezahlten Rechner, Training und Szenenreload: **OSXPlayer**, Mac OS X 26.6.2, **Apple M4**, **390 × 844**, ausschließlich neuer temporärer Save. Bericht: `/var/folders/hj/txdyk1cj2sd36krkc8jqbg480000gn/T/idle-player-smoke-20261021a/player-smoke.json`. Seitdem ergänzte Verbraucher benötigen am Ende einen erneuten Build.
- Buildbedingte Änderungen an fünf bestehenden Engine-/Render-Settings wurden in `/tmp/unity-player-generated-settings-20261021/` erhalten und auf ihren vorherigen Stand zurückgeführt. Keine neue Analyticsanbindung.

Die Editor-/Macprüfung ist keine physische iPhone-/Androidabnahme und kein Store-/Werbe-/Share-/Haptiktest. Keine Veröffentlichung und kein Merge.

## Geprüfter Commitstand

Nach den zusätzlichen Modul-Storno-/Audio-/Speicheranbindungen: vollständiges PlayMode erneut **47/47**, `/tmp/unity-checkpoint-play.xml`, Exit 0. Gezielte EditMode-Migration/JSON/Story/Modul-Storno **14/14**, `/tmp/unity-checkpoint-edit.xml`; bestehende vollständige Suite **109/109** davor. `npm run unity:check` vollständig Exit 0 (`/tmp/unity-checkpoint-source-check.log`), einschließlich drei Run-, vier Legacy- und zusätzlicher Modul-Erstattungsreferenzen. Wartende Modulaufträge sind tatsächlich in Items → Materialien stornierbar; laufende Aufträge erhalten keinen erfundenen Abbruch/Refund. Ein veralteter Klick kann keinen anderen Auftrag erstatten. Originales generisches Klickfeedback und bewusst tonloser Tap sind verbunden.

Die Browserautomatisierung hat `file://` aus Sicherheitsgründen abgewiesen. Kein Umgehungsversuch, kein tatsächlicher Browser-Downloadnachweis. Konverterfunktionen, gebündelter HTML-Stand und wirklicher Unity-Importpfad wurden unabhängig geprüft; lokales Öffnen/Dateidownload im Systembrowser bleibt ein ausdrücklich benannter manueller Prüfschritt.

## Fortsetzung: exakte Historie, Ziele und Rückkehrführung (Save v19)

Native Versionen 1–18 bleiben lesbar und ihre Originale erhalten. Neu erfasste exakte Run-/Lifetime-Konten werden bei alten Ständen ausdrücklich als historisch unvollständig markiert, statt aus Zyklus-INT-Einnahmen rekonstruiert. Vollständige native Start-/Endpunkte enthalten Inventar, Ausrüstung, Forschungs-/Modelllevel, Knoten, Entitlements und Metakonten; Checkpoints bleiben begrenzt. Importierte historische Punkte kennzeichnen einzeln nicht überlieferte Projekt-/Modell-/Metadaten. Aktive importierte Challenges erhalten das Weboriginal auch nach Rückkehr ins Hauptspiel.

Forschung → Ziele bietet alle sieben originalen Zielarten mit Source-Reihenfolge, Anheften/Lösen, Kosten/ETA und tatsächlicher Zielnavigation. 851 Originalquotes aus sechs ausdrücklich vorbereiteten Sourcezuständen prüfen Zielstatus, Kosten, Priorität, Reihenfolge, Rückkehraktionen und Reinheit. Bestehende Hardware-`pow`-Rechnung hat JS-/Mono-Rundungsunterschiede: z.B. 0,3 bei etwa 3,16e15 Credits. Die Quoteprüfung toleriert relativ 4e-14; die Formel wurde nicht geändert. Ein weiteres Quellproblem bleibt sichtbar: angeheftete Forschungsziele verwenden alte Forschungsangebote, die vom aktuellen V2-Startpreis abweichen können. Unity zeigt beide und erfindet keine vereinheitlichte Ersatzregel.

Rückkehrbelege entstehen ab originalen 60 Sekunden. Ein ungelesener aktueller Beleg bleibt sichtbar, weitere Belege erhalten eindeutige IDs im begrenzten Archiv. Lesen aktualisiert den gespeicherten Archivbeleg; erneutes Öffnen zahlt nichts aus. Die maximal zwei originalen Folgeaktionen führen wirklich zu Belohnungen, Ausrüstung, Training oder Forschung. Die im aktuellen V2 unerreichbare Forschungs-Freischaltalternative wird nicht als neue Sperre eingebaut.

Lokale Diagnostik misst tatsächliche Tick-/Save-Dauer, Dateigröße, erfolgreiche Lade-/Schreibzeitpunkte, verworfene Rückwärtsuhr-Ticks, Save-/Simulationsfehler, Recovery sowie Forschungsabschlussphasen. Vorhandene Webdiagnostik bleibt erhalten. Der Export kennzeichnet den Dateiruntime-Kontext und einen nicht implementierten nativen Watchdog; keine erfundenen nativen Watchdogereignisse.

Prüfstand vor abschließender Detailprüfung: vollständiges EditMode **115/116**; einzig der nun aktualisierte Kataloggrößentest erwartete noch 380 statt 667 Originaltexte. Natürlicher Erstprestige-Lauf erfolgreich. Vollständiges PlayMode **49/49**, `/tmp/unity-v19-full-play.xml`: echte Zielaktionen/Reload, bedienbare Recovery beschädigter Originale, tatsächlicher Diagnoseexport und sieben Sprachansichten mit 320/390/430 Breite. Typecheck und vollständiges Vitest **1.885/143 Dateien** bestanden. Der alte Playerbuild deckt diese Ergänzungen noch nicht ab.

Die anschließend gezielten EditMode-Prüfungen bestehen **10/10** (`/tmp/unity-details-edit.xml`), einschließlich aktualisiertem Originalkatalog, 851 Zielquotes, v18-Migration, aktivem Web-Challengeimport und zwölf neuen originalen Itemdetail-/Vergleichsfällen. Die Itemdetails verwenden jetzt die tatsächlichen Spezialquote-Einheiten und hypothetische kopierte Ausrüstung für die nächste Levelstufe: Compute, Credits-/Datenrate und echte gerundete Trainingspreise. Die Vorschau verändert weder Ausstattung noch Ressourcen. Der bestehende bedingte Geräteverbraucher ist lediglich als identische Einzelinstanzfunktion wiederverwendbar gemacht. Web-Build erfolgreich; bekannte Bundlegrößenwarnung bleibt. Vollständiger abschließender Lauf folgt nach dem breiten Aktionsabgleich.

## Verbundene Dialogdarstellung und Detailaktionen

Die tatsächliche Szene öffnet unbenannte KI und offene Mira-Dialoge jetzt automatisch in der vorhandenen Detail-Prefaboberfläche. Manuelle Kapitel-/Dialogansicht bleibt erreichbar. Die reine Narrativeruntime entscheidet weiter über Inhalt, Freigabe, Skip und Erhalt; die Darstellung vergibt nichts. Zusätzliche Detailaktionen zeigen aktuelle Forschungsanforderungen, bereits bezahlte laufende Aufträge und Start-/Arbeitsangebote des Trainings, ohne einen Job zu starten. INT-Zielnavigation öffnet den richtigen Knotendialog; Itemverbesserungsziele öffnen die konkrete Instanz.

Breite Aktionsnachprüfung: Die ursprünglichen Togglefälle löschen einen passenden vorgemerkten Reset beim Umschalten. Dies fehlte in der Unity-Oberfläche und ist korrigiert; „Automatische Resets pausieren“ löscht beide Automationen samt Absicht. Das Fusionsziel bietet wie die aktuelle Sourceaktion ungewöhnlich bis mythisch; alte Common-Zieldaten bleiben weiterhin lesbar. Neue Trainingsziel-Eingaben respektieren die Sourceaktionsgrenze 100.000.

Die Sourceaktion zum vollständigen Kampagnenneustart ist unter Einstellungen nach ausdrücklicher Bestätigung erreichbar. Vorschau/Abbruch ändern nichts. Der vollständige vorige Stand wird vor dem atomaren Austausch zusätzlich nach `CampaignOriginals/` exportiert; bestehende Originale/Backups werden erhalten. Diese Funktion ist im Spiel ausdrücklich eine Zurücksetzung, keine Prestigeaktion. Während Challenge oder gesperrtem Schreiben bleibt sie deaktiviert.

Tatsächliche Prüfungen: vollständiges PlayMode nach Mira-/Detailanbindung **50/50**, `/tmp/unity-mira-v19-all-play.xml`. Danach gezielte tatsächliche Mira-/Detail-/Pause-/Kampagnenneustart-/Originalerhaltaktionen **6/6**, `/tmp/unity-controls-play.xml`. Erste fehlgeschlagene Zwischenläufe wurden korrigiert (Unitys spezielles Nullverhalten bei Komponenten, falsche Introannahme im neuen Test); sie sind keine bestandene Abnahme.
