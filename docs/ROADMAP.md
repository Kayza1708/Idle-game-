# Idle Intelligence – aktueller Stand

## Unity-Rewrite lokal · 20.10.2026

- [x] Tatsächlichen Repositorypfad und Branch `codex/unity-rewrite` geprüft; TypeScript, lokale Backups, Exporte und iOS-Bestand erhalten.
- [x] Vorhandenes Unity-6000.3.26f1-Unterprojekt mit Git-Ignore für generierte Daten und Arbeitsregeln eingerichtet; vollständige Asset-/Meta-Paare geprüft.
- [x] Aktuellen Spielcode als [Migrationsliste](unity-migration.md) und [Dateikatalog](unity-source-inventory.md) erfasst; keine Spielsysteme entfernt und keine Balance geändert.
- [x] Bereits geöffneten passenden Editor und erfolgreichen Template-/Paket-Compile samt erstem Import im bestehenden Editorlog nachgewiesen.
- [x] TypeScript-Referenz unverändert geprüft: Typecheck, 1.843 reguläre Tests und Produktionsbuild erfolgreich; bekannte Bundlegrößenwarnung bleibt offen.
- [x] Separaten Batch-Import mit Unity 6000.3.26f1 nach manuellem Schließen des Projekts ausgeführt, Exitcode 0; siehe Migrationsdokument. Keine zweite Instanz gestartet.
- [x] Ersten spielbaren C#-Abschnitt umgesetzt: große Zahlen, erzeugte zentrale Balance, Hardware/Compute/Nutzer/Credits, Taps/Overdrive, Qualität/Effizienz, fünf frühe Forschungen, getrennte atomare Saves mit Backup und Offlinefortschritt. [Umfang und Grenzen](unity-playable-slice.md).
- [x] Hochformatszene mit vorhandener Labor-/Hardwaregrafik, Ressourcenleiste und wiederverwendbarem Aktionsprefab an echte Spielaktionen gebunden; 320/390/430 px gerendert und geprüft.
- [x] 24 gemeinsame TypeScript-Transaktions-/Ratenfälle und acht exakte Zahlenfälle, 13 EditMode- und drei PlayMode-Tests geprüft; TypeScript-Suite mit 1.845 Tests, Typecheck und Build erfolgreich.
- [x] Itemabschnitt: Komponenten, bezahlte Materialpakete/Analysen, Baupläne/Meisterschaft, Inventar/Ausrüstung, Sofortherstellung/Fusion und gemeinsame Schmiededarstellung mit rein kosmetischen Animationen implementiert. 509 zusätzliche TS-Fälle, 18 EditMode- und sechs PlayMode-Tests; Save-v1-Migration mit Originalkopie. [Anleitung und Grenzen](unity-playable-slice.md).
- [x] Normales INT-Prestige mit allen 60 Knoten, verbundenem Netz/Pan/Pinch, Integration, zusätzlichen Labs/Slots und benötigter Automation implementiert; 380 gemeinsame Fälle, natürlicher Erstlauf (39:38 simuliert), Save-v1/v2-Erhaltung nach v3. 25 EditMode-/9 PlayMode-Tests und 1.857 Vitest-Tests erfolgreich. [Prüfbericht](unity-int-prestige.md).
- [x] Axiome/Modelle: 24 Knoten, zehn Modelle, geheimes Labor/Mira, echte Effekte, Planer, sichere Resets und Save-v1/v2/v3-Migration nach v4. 323 gemeinsame technische Fälle; [Umfang und Prüfgrenzen](unity-axioms-models.md).
- [x] Aktuellen V2-Forschungs-/Industriekern portiert: alle 26 Forschungen, Raten, Foundry, Synthese, Durchbrüche, Fragmenttransaktionen und Save-v5-Migration mit Originalen; [221 Referenzfälle und tatsächliche Prüfergebnisse](unity-industry.md).
- [x] 690 V2-Challenge-Laufstufen mit eigenem Laufzustand, Hauptspielpause, sicheren Rückkehrtransaktionen, echter Regelwirkung und Save-v6-Migration; [Bericht](unity-challenges.md). Zwölf statische Langzeit-Challenges folgen mit ihren Abhängigkeiten.
- [x] Persistente Ereigniszähler/Mastery für vorhandene Produzenten und aktiver/offliner Zeitkontext als Abhängigkeit von Missionen/Achievements, mit konservativer Save-v7-Migration; [Umfang](unity-lifetime.md). Abschnitt 3 selbst bleibt offen.
- [x] 37 Achievementfamilien samt Claims/AP-Verbraucher, acht Laborziele und Profil/Postfach/Namensfilter mit Save-v8-Erhaltung portiert; zwölf statische Bedingungen vorhanden, zwei benötigen noch Seasons. [Teilabnahme 3b](unity-retention.md); Missionen bleiben offen.
- [x] UTC-Missionen mit originalen 6/12/30 Aufgaben, Claims/Bonus/Ablauf, eingefrorenen Tagesbonusboxen und konservativer Save-v9-Migration implementiert; [Teilumfang und Prüfgrenzen](unity-missions.md). Vollständige Seasons, aktive Drop-Erzeugung und Story/Kapitel bleiben offen.
- [x] Drei V2-Seasons mit 300 Originalbelohnungen, verdienten Truhen, Vitrine und echtem Artefakt-Einnahmenbonus portiert; Save-v10-Erhaltung und vorbereitete Premium-/XP-Referenzen getrennt von echten Käufen. [Umfang und Abnahme](unity-seasons.md).
- [x] Aktive Signal-Drops mit Originaltiming, drei Varianten, echten Qualitäts-/Belohnungsregeln und Lifetime-/Missionsproduzenten portiert; konservative Save-v11-Erhaltung. [Teilabschnitt 5a](unity-signals.md).
- [x] Markt mit allen 20 Materialpaketen, vier Gem-Truhen, freier Truhe, Tagesrotation/-rabatt/-item und sicherer gemeinsamer Truhenvergabe portiert; unverfügbarer Videoprovider ohne SDK und Save-v12-Erhaltung. [Teilabschnitt 5b](unity-market.md).
- [x] Gumball und alle 17 Gem-Angebote mit echten Zusatzlaboren/Offlinekapazitäten/Laborbonus, proportionalen Modul-/Trainingsverkürzungen und Save-v13-Erhaltung portiert; [Teilabschnitt 5c](unity-gems.md).
- [x] Vorbereitete Kaufverträge mit zwölf Originalprodukten, Restore/Widerruf, echten Einnahmen-/Tap-Verbrauchern und dauerhaftem Save vor Storeabschluss portiert; Produktionsadapter unverfügbar, keine echten Käufe. [Teilabschnitt 6a](unity-purchases.md).
- [x] Werbe-/Forschungsskipverträge mit Limits/Cooldowns, gespeicherten Aufträgen, echten Werbefrei-/Creditboostverbrauchern und Save-v15-Erhaltung portiert; [Abschnitt 6b](unity-ads.md). Produktionsanbieter unverfügbar.
- [x] Einstellungen, Kaufmengen und Original-Zahlenformate mit Save-v16-Migration sowie vorhandene Unity-Audioclips geprüft; [Teilumfang und offene Story-/Sprachabdeckung](unity-settings.md). Abschnitt 7 bleibt offen.
- [x] Aktuelle V2-Verbraucher, Kapitel/Mira/Tutorial, persistente Sprachpfade und Speicher-/Diagnoseoberflächen laut [26-Zeilen-Abgleich](unity-functional-audit.md) verbunden; Quellfallbacks, historische Sonderimporte und Nativeanbieter bleiben separat offen.
- [ ] Echte mobile Geräteabnahme durchführen; lokaler macOS-Player, Editor-PlayMode und gerenderte mobile Profile sind getrennt geprüft.

Die folgende TypeScript-Roadmap bleibt als Referenz und offener Releasebestand erhalten.

Stand: Bereinigung nach main `d3040a9` (PR #125). Frühere doppelte Arbeitsprotokolle und erledigte Branch-Abhängigkeiten stehen in der Git-Historie; diese Datei beschreibt die verbleibende Arbeit.

## Implementiert

- [x] Verbundenes INT-/Axiomnetz mit Verschieben, Zoom und Tastatur; Craft-/Fusionsbewegung direkt in der ursprünglichen Schmiede. Browserprüfung und Grenzen: [Prestigenetz und Schmiedebewegung](network-forge-motion.md).

- [x] V2-Prestige, Axiome, Modelle und zugehörige Save-/Offline-Verträge; siehe [V2-Stabilisierung](v2-stability-balance-report.md).
- [x] Sofortiges Crafting und Fusion sowie drei vorbereitete Seasons; siehe [Items und Seasons](instant-items-seasons.md).
- [x] Gemeinsame Itemdarstellung, überarbeitete Oberflächen und freigegebenes Idle-Intelligence-Branding.
- [x] Frühe Hardware-/Forschungspreise nach Nutzerbericht angepasst; gemessene Grenzen stehen im [Balancebericht](early-balance-rework.md).
- [x] Unreferenzierte Grafiken, Audioreserven, Altkomponenten, zwei unbenutzte Testbaselines, alte Vorschauen und erzeugte Prüfberichte entfernt; Save-Wiederherstellung und laufende Regressionen erhalten.
- [x] Typecheck verbietet ungenutzte Imports/Variablen/Parameter; statische Assetprüfung und einheitliche PR-Prüfungen aktiviert.
- [x] Startbildschirm vor dem Spielbundle und während des Save-Ladens, Spieltipps in sieben Spielsprachen, reduzierte Bewegung und Wiederholen bei fehlgeschlagenem Bundle-Start.
- [x] Gemeinsamer Unicode-Namensfilter mit zehn Sprachlisten, Umgangssprache, ausgewählten politischen Namen und extremistischen Parolen; Nachprüfung alter/importierter Anzeigenamen ohne Fortschrittsreset.

Die aktuelle Abnahme dieser Bereinigung wird in [cleanup-loading-names.md](cleanup-loading-names.md) dokumentiert. Implementiert bedeutet keine App-Store-Freigabe.

## Vor einem kommerziellen Release

- [ ] Echte iPhone-/WKWebView-Abnahme: Start/Resume, Hintergrund/Offline, Safe Areas, Touch, Audio/Haptik, lange Sitzungen, Save-Import/-Export und Share-Sheet.
- [ ] Natürliche V2-Runs über mehrere Prestiges bis zu späteren Systemen messen; Daten aus echten Runs mit dem erweiterten Balancebericht vergleichen. Kataloggröße und technische Fixtures belegen keine langfristige Balance.
- [ ] Storeprodukte und native Käufe/Rewarded Ads an die vorbereiteten Grenzen anschließen; serverseitige Belegprüfung, Eigentumsabgleich, Restore, Widerruf, Wiederzustellung und Einmalauslieferung real testen. Siehe [native Integrationen](native-integrations.md) und [Kommerzialisierung](commercialization-v1.md).
- [ ] Datenschutz-/Einwilligungsabläufe, erforderliche Plattformangaben und tatsächliche native Privacy-Manifeste prüfen; Storetexte und Screenshots aus dem geprüften Gerätebuild erstellen.
- [ ] Vollständigkeit und Lesbarkeit der vorhandenen Spielsprachen auf Geräten prüfen.
- [ ] Falls Benachrichtigungen zum Release gehören: echte Berechtigungs-/Planungsschnittstelle implementieren und testen; derzeit keine fertige native Zustellung.

## Vor späteren sozialen Funktionen

- [ ] Serverseitige, versionsgleiche Namensprüfung, Moderation, Meldung und Einspruch ergänzen. Die lokale Wortliste ist keine vollständige Bedeutungs- oder Personenprüfung.
- [ ] Authentifizierung, manipulationssichere Ranglisten und Clanrechte separat entwickeln und prüfen.

Unity-Zwischenstand: [konkrete funktionale Restliste](unity-functional-remaining.md), [Schutz vor ignorierten Savefeldern](unity-save-validation.md). Der aktuelle Stand ersetzt die damaligen offenen Verbraucherzeilen; konkrete Grenzen siehe `unity-functional-audit.md`.

- [x] Native Save-JSON-Struktur vor dem Serializer gegen unbekannte/doppelte Felder, falsche Typen und Zahlen prüfen; tatsächliche Originalerhaltung bei externer Dateiersetzung getestet. [Prüfgrenzen](unity-save-validation.md). Das schließt Abschnitt 8 nicht ab.

### 21.10.2026 · verbundene Mira- und Speicher-Runtime

- [x] Mira-/Kapitel-/Tutorial-Runtime mit Namenswahl, echten Ereignissen, Skip/Resume, gespeicherten Dialogen und tatsächlicher Zielnavigation; 84 zusätzliche verbundene Source-Schritte.
- [x] Explizite Export-/Recoveryansicht, Offline-Webkonverter mit Originalerhalt, gemessene Rückkehrbelege und erste echte mehrfache Runhistorien; Nachweise und Grenzen in [unity-story-storage.md](unity-story-storage.md).
- [x] Echter lokaler macOS-Universal-Player gebaut und auf Apple M4 mit isoliertem Save bedient/reloaded. Kein Ersatz für Mobilgeräte-/Storeabnahme.
- [x] Breite funktionale Verbraucher-/Detailprüfung aller 26 Zeilen anhand [unity-functional-remaining.md](unity-functional-remaining.md); konkrete Quell-/Altimport-/Gerätegrenzen bleiben ausgewiesen.

- 21.10.2026 Fortsetzung des funktionalen Unity-Auftrags: Source-Zielnavigation und Rückkehraktionen verbunden, Save-v19-Historien mit vollständigen Start-/Endpunkten und historischen Verfügbarkeitsmarkern, echte lokale Dateidiagnostik. Vollständiges PlayMode 49/49, Vitest 1.885/143. Details/Schlussabnahme und erneuter Playerbuild laufen weiter; keine pauschale Fertigmeldung.

- 21.10.2026: Tatsächliche automatische Mira-/Namensdarstellung und reine Forschungs-/Trainingsdetails verbunden (PlayMode 50/50). Passende Resetabsicht beim Agentenschalter korrigiert; Pause und ausdrücklich bestätigter Kampagnenneustart mit vollständigem vorherigem Originalexport geprüft (6/6 verbundene Folgefälle). Breiter Abschluss-/Playernachweis läuft weiter.

- 21.10.2026: erneuter Abgleich aller 26 fachlichen Migrationszeilen in `unity-functional-audit.md`. Reale Produktionsschritte statt doppelter Formeln, begrenzte aktuelle/vorige Sitzungsdiagnostik und weiter verschärfter Web-/Nativeabgleich ergänzt. Zusätzlich gefundene Keine-Items-Integrationssperre und alte Klassenupgradeproduktion samt Resetretention korrigiert. Save v20 erhält v1–19/Originale. Vollständiges EditMode 122/122 vor letzter Kontext-Migrationserweiterung; weitere Schlussläufe/Player folgen.

- 21.10.2026: Schlussabgleich mit Save v20, originalen Klassenupgrade-Verbrauchern, Challenge-/Rückkehrmigration, tatsächlichem Produktions-/Sitzungsexport und bytegetreuem explizitem Web-Dateieingang. EditMode 125/125, danach 17/17 betroffene Equip-/Save-/Item-/Retentionprüfungen; vollständiges PlayMode 53/53; Vitest 1.886/143 und Web-Build erfolgreich. Source/Altimport/Plattform/Optik bleiben getrennt; aktueller Unity-Player folgt.

- 21.10.2026: zusätzlicher abschließender Parameterabgleich ergänzt wissenschaftlich exakte Agent-Mindestziele (Save v21), leere/pausierende Direktorbudgets, unveränderte Präzisionsfelder und konkrete Reset-Jobbindungen einschließlich Schmiede. 13 zusätzliche Original-Konfigurations-/Agentfälle, erste gezielte EditMode-Prüfungen 15/15. Abschließender aktueller Player-/Regressionstest folgt.

- 21.10.2026: Aktueller Code `86559ea8` vollständig geprüft: 128/128 EditMode, 55/55 PlayMode, 1.886/143 Vitest, Typecheck/Sourcecheck/Web-Build. Neuer StandaloneOSX-Universal-Player erfolgreich, echter isolierter M4-Playerlauf bei 390×844 samt Reload bestanden. Funktionaler V2-Abgleich abgeschlossen innerhalb der ausgewiesenen Source-/Altimportgrenzen; Native/Geräte/Optik bleiben eigene Folgeabnahmen. Siehe `unity-functional-verification.json`.

### Optische Überarbeitung · erster Abschnitt

- [x] uGUI-Grundlage mit Originalgrafiken/-fonts, kompakter Ressourcenleiste, permanenter unterer Navigation, Labor/Modell/Training/Hardware sowie gemeinsamer Item-/Kostendarstellung umgesetzt.
- [x] Vorherbilder und tatsächliche DE-/EN-Unity-Renderbilder bei 320/390/430 px geprüft und korrigiert; echte Ausrüstung mit Reload, Tap/Overdrive und reduzierte Bewegung geprüft. Nachweis: `unity-design-01.md`.
- [ ] Übrige Bildschirme einzeln gestalten; native Geräte-/Schrift-/Notch-/Touchabnahme bleibt offen. Keine Balanceänderung, kein Merge/Release.

Prüfstand Design 1: vollständiges PlayMode 58/58, EditMode 128/128 plus abschließender Detail-Nachtest 1/1 (zwölf Sourcefälle), Vitest 1.886/143; Typecheck/Sourcecheck/Web-Build erfolgreich. 23 echte Unity-Bilder und zeitprotokollierter Clip versioniert. Keine native Gerätefreigabe.

### Designabschnitt 1 · zweite Überarbeitung nach PR #141

- [x] Offizielles Unity-Agent-Plugin 0.1.8-beta installiert/aktiviert; uGUI-/2D-Skills samt relevanter Referenzen gelesen, vorhandene Editor-Testanbindung erhalten. Keine parallele Sitzung neu gestartet.
- [x] Eckige gemeinsame Flächen, zurückhaltendes manuelles Speichern, kompakte Inventar-/Schlossdarstellung und tatsächlich gemeinsame Itemrahmen umgesetzt.
- [x] Kontextbezogene Itemvergleiche ohne unveränderte Werte, sichtbare Nachteile und aufklappbare seltenere Aktionen; Pointer-Tapfeedback und ausschließlich kosmetischer Overdrive-Kernzustand implementiert.
- [x] Vollständige Regressionen vor abschließender Textkorrektur: 59/59 PlayMode, 128/128 EditMode, 1.886/143 Vitest; Typecheck/Web-Build erfolgreich. Anschließend UI-Nachprüfung 4/4 und erneut vollständiges PlayMode 59/59 auf abschließendem Stand. Medienmanifest: [Prüfbericht](unity-design-02.md).
- [ ] Neue gemeinsame Grundlage auf weitere Bildschirme übertragen; echte Geräte-, Glyphen-, Notch-/Touch- und native Integrationsabnahme bleiben getrennt offen.

### Labor/Itemdetails nach verbindlichem Zielbild · 22.10.2026

- [x] Neue einzelne generierte Stahl-/Gold-/Mint-Rasterassets mit nachvollziehbarer Herkunft; tatsächlich verwendetes gemeinsames Button-Prefab und bestehende Labor-/Fenster-/Portraitprefabs weiterentwickelt.
- [x] Dominanter Originalkern, Cyan-Overdrive, Goldtraining/-käufe, größere Hardwaremotive; große zentrierte Items, einzelne ausgearbeitete Sockel und dynamische klare Detailhierarchie.
- [x] Nicht blockierende Druck-/Tap-/Aktivierungs-/Reveal-/Ausrüstungseffekte, reduzierte Bewegung und gespeicherte Transaktion vor Feedback; schnelle Craft-/Fusionsregression durch reine Layoutanpassung statt Neubinden während Culling behoben.
- [x] Vollständiger Nachlauf 60/60 PlayMode und 128/128 EditMode; Typecheck, 1.886 Vitest-Tests/143 Dateien, Web-Build und Referenzcheck. Letzter visueller Nachlauf/Medienmanifest: [unity-design-03.md](unity-design-03.md).
- [ ] Weitere Bildschirme auf dieser Grundlage bearbeiten; echte Geräte-/Notch-/Unicode-/Haptik- und Releaseabnahme bleibt gesondert offen.

### Unity · ruhige Leisten und Aktionsnachweis (22.10.2026)

- [x] Gemeinsame Ressourcen-/Navigationsflächen nach TypeScript-Gliederung, ohne dekorative Einzelrahmen; bestehende Safe Areas und Originalgrafiken erhalten.
- [x] Fünf tatsächliche Aktionen: Tap/Overdrive, Hardwarekauf, Komponentenherstellung, Fusion, Itemflug zum echten Ausrüstungssockel; Transaktionen vor Effekten gespeichert.
- [x] Durchgehender echter Unity-Mitschnitt und fünf vollständige Einzelclips mit aufgenommenem tatsächlichem Unity-Spielaudio; vorbereitete Zustände gekennzeichnet.
- [x] DE/EN bei 320/390/430 px, lange Namen, Slots/Materialmangel, Abbruch, schnelle Wiederholung, reduzierte Bewegung und Reload geprüft. Nachweise und Abgrenzung: [unity-design-04.md](unity-design-04.md).

### Unity · Fusionsinszenierung und Modellkomposition (22.10.2026)

- [x] Fusion zuerst als eigener echter Unity-Clip geprüft: große reale Eingaben, zurückgenommener Hintergrund, Vorbereitung/Beschleunigung/Kollision, große echte Verbesserung und Transfer zum Inventarregister.
- [x] Eigene Pixel-Spritefolge und gemeinsame Präsentationsprefabs; Herstellung, Ausrüsten, Kauf und Tap/Overdrive abgestimmt, sofort gespeicherte Transaktionen und reduzierte Bewegung erhalten.
- [x] Echter Gem-Bestand, Hamburger mit vorhandenen Menürouten, Nutzerdetail weiterhin erreichbar, Modell-/Slotkomposition nach der konkreten TypeScript-Vorlage und Alpha-basierte Itemzentrierung.
- [x] DE/EN bei 320/390/430 px, höchstes Fusionslevel, acht Materialarten, Abbruch/Wiederholung/Reload und echte Spielaudio-Aufnahmen nachgewiesen. Funktionale Resultate und visuelle Beurteilung getrennt: [unity-design-05.md](unity-design-05.md).


## Cloudflare Company Multiplayer – 22.10.2026

- [x] Separate Workers/D1-Basis mit serverseitigen RP- und Research-Regeln sowie Unity-HTTP-Adapter vorbereitet. Details: [Cloudflare Companies](cloudflare-companies.md).
- [ ] Worker/D1 tatsächlich deployen und integrieren; Auth, Inventar, echte Company-Oberfläche, Chat, Trading, Projektsystem, Seasons und Live-/Gerätetests sind noch offen.
