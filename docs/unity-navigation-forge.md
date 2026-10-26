# Navigation, Schmiedereiter und kompakte Forschung · 26.10.2026

Ausgang: `f7ec3617`, Branch `codex/unity-rewrite`, bestehender Draft-PR154 offen. Arbeitsregeln und offizielle uGUI-Anleitung einschließlich ScrollView-Referenz angewandt; funktionierende Unity-Batch-Testanbindung verwendet. Keine zweite Editorinstanz. TypeScript-Referenz tatsächlich gelesen: `src/App.tsx`, `src/ResearchCatalog.tsx`, bestehende Prestige-/Forschungs-/Werkstattregeln. Keine neue Grafik- oder Animationsbibliothek installiert.

## Erreichbare Struktur

- Startnavigation: **Labor · Forschung · Schmiede · Shop**. Nach tatsächlicher INT-Freischaltung **Labor · Forschung · Schmiede · Prestige · Shop**. Vorheriger separater Trainingsreiter verborgen. Gemeinsame Leiste, Icongrößen, aktive Markierung, Safe Area und Touchziele erhalten. Labels für alle sieben vorhandenen Sprachen.
- Modell im Labor und Kern in der Ausrüstungsansicht öffnen Training. Der bisherige Trainingsknopf bleibt zusätzlich im kompakten Modellbereich erreichbar. Tutorial-/Zielnavigation nutzt die tatsächlichen Modell-/Trainingsaktionen.
- Schmiede öffnet Inventar/Ausrüstung. Eigene Reiter: **Inventar, Komponenten, Baupläne, Herstellen, Fusion**. Alle20Komponenten gleichzeitig im kleinen Raster im Komponentenreiter. Baupläne als Katalog mit Lern-/Herstellungszugang im Detail; nur gelernte Rezepte in Herstellen. Fusionsauswahl, Ausrüstung, Upgrades, Analysen, Module, Foundries und Umwandlungen behalten ihre vorhandenen Aktionen.
- Shop ganz rechts bündelt vorhandene Angebote/Truhen, Gems/Gumball, Pakete/Vorteile, Belohnungen und Seasons. Bestehende Unterseiten und deren Rückweg erhalten; Produktionsanbieter weiterhin unverfügbar.
- Forschung: oben reale freie/belegte **Labor-Slots mit ihren gespeicherten Slotnummern**, Fortschritt und Restzeit. Bereits bezahlte Aufträge außerhalb einer nach Reset geschrumpften Kapazität bleiben als „Abschluss“ sichtbar; unfreigeschaltete leere Sockel werden nicht angezeigt. Darunter fünf Bereiche: Daten, Hardware, Modelle, Material, Automation. Ein Bereich ist geöffnet; dessen vorhandene Einträge bleiben wiederverwendet. Name/Icon/Level, Kosten, Dauer und direkte Startaktion; ganze Karte öffnet Details auch bei gesperrter Startaktion. Wirkungen und ausführliche Voraussetzungen stehen dort. Volle Labore behalten automatische unbezahlte Einreihung und bedienbare Queueentfernung.

## Freischaltung ohne neue Regeln

Prestige sichtbar bei vorhandenem Prestige-/Axiomfortschritt oder erstem Anspruch von mindestens1INT; dies verwendet `PrestigeRules.Claim`, keinen neuen Umsatzschwellwert. Axiome innerhalb von Prestige erst bei möglichem Axiomreset oder vorhandenem Axiomzyklus; geheimes/dunkles Labor erst bei bestehendem `Prestige.lab`. Companyzugang behält eigenen bestehenden Anspruch. Daraus werden keine zusätzlichen unteren Reiter. Sichtbarkeit reagiert auch innerhalb derselben Transaktion sofort und bleibt nach Reset/Reload korrekt.

Keine Preise, Formeln, Effekte, Katalog-IDs, Resetverträge oder Savefelder geändert. Save23 bleibt erhalten; keine Übernahme/Überschreibung von Web-/Capacitor-Saves. Geprüft ausschließlich mit isolierten temporären Prüfsaves; finanzierte Zustände sind markiert.

## Bewegung und Audio

Vorhandene `ForgeSequence`/`ForgeAnimator`-Prefabs mit tatsächlichen Komponenten, ausgewählten drei Items, gerichteter Bewegung und tatsächlichem Ergebnis wiederverwendet. Keine Wartepflicht, Belohnung oder Transaktion in Animationen. Beim Wechsel zu anderer Rezept-/Fusionsauswahl wird das alte kosmetische Ergebnis jetzt vollständig ausgeblendet: kein zweites altes Item neben den neuen Eingaben. Abbruch, Tabwechsel, schnelle Wiederholung und reduzierte Bewegung bleiben unterstützt.

Die Regression reproduzierte verlorenes fünftes Audiofeedback bei vier noch belegten Stimmen. Die vorhandene feste Vierergrenze bleibt: neuer Ton übernimmt den ältesten Kanal statt auszufallen; keine zusätzliche AudioSource, kein SDK, keine Warteschlange. Verfügbare Originaleffekte bleiben synchron an ihren bestehenden Impactpunkten.

## Tatsächliche Abnahme

Unity-Import/Compile erfolgreich, Batch-Exitcodes0. Abschließend vollständige **105/105PlayMode** und **142/142EditMode** bestanden. Typecheck erfolgreich, **1937/1937Vitest in147Dateien**, ein Worker,348,58s; Produktionsbuild erfolgreich (bekannte Vite-Chunkwarnung). Finale Quellversion enthält sämtliche hier dokumentierten Präsentationskorrekturen. [Maschinenlesbarer Nachweis](unity-navigation-forge.verification.json). Frühere Befunde nicht verschweigen: versteckter Prestigezugang erst einen Frame nach Freischaltung, alte Tests mit entfernten UI-Wegen, verborgene Effekttexte in Geometrieprüfung und eine ungültig von Hand erstellte Forschungsidentität im neuen Testfixture. Korrigiert und gezielt nachgeprüft; der Labortest erzeugt den Forschungsauftrag nun über die tatsächliche Domainfunktion. Zwei TypeScript-Gesamtläufe mit langen Unterbrechungen lieferten je8Timeouts; keine Testlimits verändert. Finaler Wiederholungslauf verwendet einen Worker.

Visuelle Beurteilung getrennt: echte Unity-Bilder DE/EN bei320/390/430px. Gegenüber dem Ausgangsstand: vier/fünf klare Hauptwege, weniger Forschungstext, vier Datenforschungen gleichzeitig sichtbar, keine große Schmiedebühne vor dem Bauplankatalog, alle Komponenten in eigener Übersicht. Bekannte Sprachfallbacks in älteren Material-/Detailtexten bleiben offen. Kein vollständiger Shopdesign-Durchlauf und keine physische Geräte-/60-fps-Abnahme durch Editorbilder behauptet.


## Bilder, Film und Grenzen

[Vorher: Forschung](media/unity-navigation-forge/before-research-de-390.png) · [Nachher: Forschung](media/unity-navigation-forge/research-de-390.png) · [Vier Startreiter](media/unity-navigation-forge/fresh-four-tabs-de-390.png) · [Fünf Reiter / Inventar](media/unity-navigation-forge/items-de-390.png) · [Komponenten](media/unity-navigation-forge/components-de-390.png) · [Baupläne](media/unity-navigation-forge/blueprints-en-390.png) · [Erhaltener Laborauftrag](media/unity-navigation-forge/research-retained-lab.png).

[Ununterbrochener echter Unity-Mitschnitt: Herstellung und Fusion](media/unity-navigation-forge/craft-and-fusion.mp4). Er zeigt eine vollständige Herstellung, anschließend zwei zusätzliche schnelle bezahlte Herstellungen für die drei Eingaben, Auswahl und vollständige Fusion. Die schnellen Zusatzsequenzen werden vor dem Auswahlwechsel bewusst abgebrochen; keine Schnitte oder erfundenen Ergebnisbilder. Die Runtime-Handler führen die Transaktion aus; es ist kein physischer Touchmitschnitt. 206 echte Frames mit Originalzeitstempeln, 8.988s; tatsächlicher48-kHz-Stereo-Unity-Mix als AAC, keine nachträglichen Ersatzsounds oder interpolierten Bilder. Audioprobe: `sampleRate=48000 channels=2 samples=862208 peak=0.244055`. Vollständig decodiert; Übergänge anhand tatsächlicher Eingabe-/Vorbereitungs-/Impact-/Enthüllungs-/Endframes angesehen. Der Clip zeigt die vorhandenen übernommenen2D-Sequenzen und sauberen Wechsel, keinen neuen vollständigen Effektstil.

Alle neuen Bilder stammen direkt aus Unity. Vorbereitete Ressourcen ausschließlich im markierten temporären Prüfsave, sechs zusätzliche unfinanzierte Startansichten. Neue Shop-/Bauplanstatusbeschriftungen für alle sieben vorhandenen Sprachen; ältere Sprachfallbacks insbesondere bei Analysen/Materialien bleiben dokumentiert. Keine neuen Raster-/Font-/Audioassets, daher keine zusätzliche Lizenz; bestehende Originalassets und Lizenzen unverändert. Physische Touch-/Lautsprecher-/Safe-Area-/60-fps-Abnahme bleibt separat. Lokaler Simulatorstand wird nach dem geprüften Codecommit separat protokolliert.

Direkte unveränderte Runtimeframes: [Herstellungsenthüllung](media/unity-navigation-forge/craft-reveal.png) und [Fusionsenthüllung](media/unity-navigation-forge/fusion-reveal.png). Variable Originalzeitstempel bleiben erhalten; die vollständige Decodierung wurde mit exakter1/1000-Zeitbasis ohne Fehler geprüft.

## Lesbarkeit im fortgeschrittenen Stand

Die erste native Installation von `d8176344` erhielt den unfinanzierten Save23 sowie18Unity-/15Capacitor-Dateien. Das tatsächliche Simulatorbild zeigte lange Ressourcenwerte und eine überlaufende Modellproduktionszeile. Die Ressourcenwerte verwenden nun begrenzte Schriftanpassung10bis zur bisherigen Maximalgröße; ihre vollständigen Strings und das gewählte Zahlenformat bleiben erhalten. Modellproduktion verwendet die bereits vorhandenen Einheiten C/s und D/s in einer sauberen zweiten Zeile. Neuer Test prüft tatsächliche Glyphengrenzen und vollständige Zeichenzahl, nicht nur Layout-/Fontflags. DE/EN320/390/430 mit684Mio.-Credits, ca.939.000Daten und großen Produktionswerten: [Beispiel](media/unity-navigation-forge/advanced-de-390.png). Abschließend105PlayMode und142EditMode bestanden; diese Korrektur wird separat erneut nativ gebaut.

Medien reproduzieren: vollständige PlayMode-Suite ausführen, dann `python3 scripts/package-unity-navigation.py --ffmpeg /Pfad/zu/ffmpeg`. Der Packer prüft vollständige Decodierung und identische Anzahl echter Eingabe-/Ausgabeframes. Ein minimal kürzerer Audiopuffer darf keine letzten Videoframes abschneiden; deshalb kein `-shortest`.
