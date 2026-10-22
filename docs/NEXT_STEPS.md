# Nächste Schritte · 20.10.2026

## Unity: laufende funktionale Migration

Branch `codex/unity-rewrite`, Unity `6000.3.26f1`, Szene `IdleIntelligence/Assets/Scenes/IdleIntelligence.unity`. [Play-Anleitung](unity-playable-slice.md), [Arbeitsregeln](../IdleIntelligence/AGENTS.md), [Abnahmeliste](unity-functional-acceptance.md).

Forschung/Industrie, isolierte V2-Challenges, Statistiken/Mastery, Achievements/Profil, UTC-Missionen/Tagesbonusboxen und die drei V2-Seasons sind im dokumentierten Umfang implementiert und geprüft. [Missionsbericht](unity-missions.md), [Season-Bericht](unity-seasons.md). Der gesamte Rewrite ist weiter offen.

1. Abschnitt 5c ist ergänzt: [Gumball und Gem-Angebote](unity-gems.md) mit tatsächlichen Boost-/Upgradeverbrauchern. Legacy-/Webimport bleibt Abschnitt 8. [Markt/Truhen/Rotation](unity-market.md) sind als 5b bereits portiert. [Aktive Drops](unity-signals.md) samt Missionsproduzenten sind als 5a bereits implementiert und geprüft.
2. Abschnitt 6b ist ergänzt: [Werbe-/Forschungsskipverträge](unity-ads.md), Limits, gespeicherte Aufträge, Creditboost und echte Werbefrei-Verbraucher. [Vorbereitete Kaufverträge 6a](unity-purchases.md) mit Restore/Widerruf, dauerhaften Rechten und Save-v14-Erhaltung sind ergänzt. Keine SDKs oder vorgetäuschten Käufe.
3. Abschnitt 7 in Arbeit: [dauerhafte Einstellungen, Zahlenformate, Kaufmengen und Audioassets](unity-settings.md) geprüft. Vollständige Kapitel/Mira/Tutorial-Runtime, Ereignisbelege und durchgängige Verwendung der sieben Originaltextkataloge bleiben offen. Haptikpräferenz vorhanden, native Patternanbindung unverfügbar.
4. Abschnitt 8: expliziter validierter Webimport mit Originalkopie und Erhaltung unbekannter Daten, Export/Recovery, Rückkehr-/Diagnose-/Balanceberichte und restliche Speicherverträge.
5. Danach gemeinsamer optischer Feinschliff und tatsächliche Geräte-/Player-/Releaseprüfung. TypeScript und Backups erhalten; nichts mergen oder veröffentlichen.

Die bisherigen TypeScript-/iOS-Releasepunkte unten bleiben erhalten; während der Unity-Einrichtung keinen ungeprüften Pull/Sync über lokale Bestände ausführen.

Aktueller Arbeitsstand: Bereinigung, Startbildschirm und Namensfilter nach dem gemergten frühen Balancing aus PR #125. Historische Iterationsprotokolle liegen in der Git-Historie. [Aktuelle Roadmap](ROADMAP.md), [Bereinigungsnachweis](cleanup-loading-names.md).

1. Nach Merge auf dem Mac `git pull`, anschließend `npm ci` und `npm run ios:prepare`. Der Befehl baut vor dem Capacitor-Sync; ein fehlgeschlagener Build darf nicht durch einen separaten Sync alter `dist`-Dateien umgangen werden.
2. Auf einem echten iPhone starten: Prestigenetz (Ziehen, Pinch, Kauf), Craft-/Fusionsbewegung einschließlich schneller Wiederholung, reduzierte Bewegung, Hintergrundwechsel und Share-Sheet prüfen. Vor eigenen Resettests einen Spielstand exportieren. Die Repository-Bereinigung löscht keine Geräte-Spielstände.
3. Frische aktive/gelegentliche Runs und mehrere Prestiges spielen. Balance-ZIP mit Buildversion, Run-Historie und Ereignissen exportieren. Frühere technische Prüfzustände und vorgegebene Ressourcen sind keine natürliche Balanceabnahme.
4. Native Werbung und Käufe nur als eigenen Integrationsauftrag anschließen; Produkte/Preise im Store, echte Abschluss-/Abbruchfälle, Serverprüfung und Restore gemeinsam abnehmen. Vorbereitete Produktkarten sind keine aktiven Käufe.
5. Vor Store-Einreichung die offenen Geräte-, Datenschutz-, Lokalisierungs- und Langzeitpunkte der Roadmap abarbeiten.

## Wartung

- `npm run typecheck`: Pfadprüfung, vorhandene statische Runtime-Assets und TypeScript inklusive ungenutzter Deklarationen.
- `npm test`: reguläre Regressionen. Historische Save-/Regeltests bleiben dort, wo sie noch aktive Schutzverträge prüfen.
- `npm run test:campaigns`: vier separat gehaltene Langzeitdateien; auch über den manuellen GitHub-Workflow ausführbar. Nicht mit ungenutzten Tests verwechseln.
- `npm run build`: vollständiger Produktionsbuild; die bekannte Hauptbundle-Größenwarnung ist noch offen.
- `node scripts/cleanup-loading-audit.mjs`: Browser mit installiertem Playwright/Chromium; Start vor/nach JS, verzögerte Save-Ladung, Tipps, Reduced Motion, Namensablehnung, Speichern/Reload und Startfehler-Wiederholung. Browserpfade können über Umgebungsvariablen angegeben werden.
- `src/moderation/blockedTerms.json` und `reservedNames.json`: gepflegte Listen, Quellen/Lizenz in `NOTICE.md` und in den App-Einstellungen. Keine automatische, ungeprüfte Aktualisierung aus dem Internet.

- `node scripts/network-forge-audit.mjs`: echte App-Aktionen auf drei mobilen Browserbreiten mit finanzierten Testzuständen, Screenshots und kurzem Craft-/Fusionsclip.

Unity-Zwischenstand: [konkrete funktionale Restliste](unity-functional-remaining.md), [Schutz vor ignorierten Savefeldern](unity-save-validation.md). Aktueller Verbraucherabgleich und konkrete Grenzen stehen im folgenden Fortsetzungsstand.

### Aktuelle Fortsetzung · 21.10.2026

Der funktionale V2-Abgleich aller 26 Zeilen ist in [unity-functional-audit.md](unity-functional-audit.md) dokumentiert. Story/Mira, tatsächliche Ereignisse und Fokusführung, Ziele/Details, Speichertransfer/Recovery/Rückkehr und native Run-/Sitzungsberichte sind verbunden. Save v21 erhält v1–20 mit Originalen; große Agentparameter und konkrete Reset-Jobbindungen sind geprüft. Vollständige Regression: 128/128 EditMode, 55/55 PlayMode, 1.886/143 Vitest; Typecheck, Sourcecheck und Web-Build erfolgreich. Lokaler aktueller Player und konkrete Folgegrenzen stehen im [Prüfbericht](unity-story-storage.md).

Nach dem externen Merge von #139 nächste Änderungen als Folge-Draft pflegen; kein Merge/Release. Unabhängig erhalten: bestehende TypeScript-Version, iOS, Backups und Saveoriginale.

Verbleibende getrennte Arbeit:

- Quellentscheidungen zu Erkenntnisarchiv-Erwerb, beschädigtem frühem Resume, Analyse-/Foundry-Sonderfällen und originalen DE/EN-Sprachfallbacks. Keine erfundenen Regeln/Gratisfreischaltungen.
- Bisher ausdrücklich abgelehnte aktive historische Webreservierungen/Testuhren/Alt-Reset-/Fusionverträge separat migrieren, falls benötigt; vollständige Originale behalten. Browser-Dateikonverterdownload manuell prüfen, Automatisierung war gesperrt.
- Echte Native-/Store-/Werbe-/Share-/Haptikadapter und Belegserver separat beauftragen; Anbieter bleiben unverfügbar. Physische iPhone-/Androidtests und plattformweite Fehler-/Crashmatrix sind offen.
- Spätere Gestaltung/Animations- und Geräte-/Releaseprüfung aus `unity-visual-backlog.md`; keine neue Designrunde in diesem Auftrag.

### Nächster optischer Abschnitt

Die neue gemeinsame Grundlage ist in `unity-design-01.md` beschrieben. Erst den reviewbaren ersten Abschnitt gemeinsam bewerten; danach Forschung/INT/Axiome und die weiteren Listen/Details mit denselben Styles überarbeiten. Kein weiterer eigenständiger Designmodus und keine neuen Grafikentwürfe. Reale iPhone-/Android-, Glyphen-/Touch-/Notch-/Schriftgrößenprüfung bleibt gesondert offen. Native Anbieter unverfügbar lassen; bestehende Quellprobleme und historischen Savegrenzen unverändert erhalten.

### Designabschnitt 1 · verfeinerte Grundlage 22.10.2026

Aktueller Bericht/Play-Anleitung: [unity-design-02.md](unity-design-02.md). Kleine Ecken, gemeinsame Sockel-/Itemlogik, kompakte Schlossreihe, kontextbezogene Vergleiche und Tap-/Overdrive-Kernfeedback ersetzen die provisorischen Wege des ersten Abschnitts. Erst diesen Folge-Draft bewerten; weitere Bildschirme bleiben eigene Abschnitte. Offizielles Unity-Plugin installiert; für automatische Skill-Erkennung eine neue Codex-Sitzung öffnen, laufende parallele Sitzungen unverändert lassen. Live-Pipeline/MCP ist nicht eingerichtet; die geprüfte Editor-Batch-Anbindung bleibt verfügbar. Aktuelle Restpunkte zentral unter [unity-visual-backlog.md](unity-visual-backlog.md).

### Aktueller visueller Abschnitt nach Zielbild

[Labor und Itemdetails](unity-design-03.md) ersetzt die provisorische Darstellung des ersten Abschnitts mit einzeln erzeugten Pixel-UI-Skins, gemeinsamem Button-Prefab und echten gespeicherten Aktionen. Vorher/Nachher und der tatsächliche Animationsmitschnitt liegen im zugehörigen Medienordner; Assetherkunft und bewusste Abweichungen sind im Bericht ausgewiesen. Diesen Draft zuerst visuell reviewen. Danach übrige Bildschirme mit den gemeinsamen Komponenten bearbeiten; keine pauschale Geräte-/Releasefreigabe. Sourceprobleme/Native-Integrationen bleiben getrennt; keine Balance-/Saveänderung.

- Der abgeschlossene Leisten-/Animationsabschnitt ist in [unity-design-04.md](unity-design-04.md) mit vollständigem Fünf-Aktionen-Video, fünf Einzelclips und echtem Unity-Audiomix dokumentiert. Diese ruhigen gemeinsamen Leisten bilden die Grundlage weiterer Bildschirmarbeit; starke Rahmen bleiben bei Items/Fenstern/Hauptaktionen.
- Physische Touch-/Notch-/Fontfallback-, Audio-/Haptik- und Burst-/Releaseprüfung weiterhin separat ausführen. Die Editoraufnahme mit echten Transaktionen ersetzt diese Geräteabnahme nicht.

- Neuer Stand der Inszenierung: [unity-design-05.md](unity-design-05.md), mit zuerst geprüftem Fusionsablauf, aktuellem Gesamtvideo inklusive Modell/Menü und getrennten Funktions-/Sichtprüfungen. Weitere Bildschirmarbeit auf dieser Grundlage einzeln abnehmen; keine pauschale Archero-/Releasequalitätsfreigabe.
- Echte Geräteprüfung für Notches, Touch, Systemschrift/Fontfallback, Audio-/Haptik und Burst-/Releasebetrieb bleibt gesondert offen. Bestehende Quellprobleme und der vollständige funktionale Audit bleiben davon getrennt.

### Nach Aktionsinszenierung 06

Die konkreten Medien, Assetherkunft und Prüfungen stehen in [unity-design-06.md](unity-design-06.md). Zunächst diesen Stand gemeinsam visuell beurteilen. Native iPhone-/Android-Notches, Touch-/Systemschrift, Audio-/Haptikunterbrechungen und Leistungsaufnahme bleiben Geräteabnahme. Übrige Bildschirmdichte und die im Quellkatalog identisch deutsch geführten INT-Namen getrennt bearbeiten; keine Ersatzregeln oder Balanceänderungen ableiten.



## Cloudflare Company Backend – neuer Entwicklungsbranch

1. [Cloudflare Companies](cloudflare-companies.md) und [Einrichtung](../cloudflare/company-api/README.md) ansehen. D1 in EU-Jurisdiktion erstellen und Wrangler-Konfiguration mit echter Datenbank-ID versehen.
2. Node-/SQLite-Tests und lokale Worker-/D1-Integration prüfen; Unity 6000.3.26f1 kompilieren. Dieser Branch wurde noch nicht deployed oder im Editor geprüft.
3. Sichere Accountbindung und serverseitige Belohnungs-/Inventarführung implementieren, danach Company-UI, Projekte, Handels-Escrow und Seasons hinzufügen; Chat bleibt ausgeschlossen.
4. Code nur nach erfolgreichem CI-Lauf in main mergen; kein Cloudflare-Remote-Deployment oder Store-Release ohne gesonderte Freigabe.


## Company-Community ohne Chat

- [Technisches Konzept](company-social-no-chat.md) für private Spielerprofile, Bronze/Silber/Gold-Abzeichen, Profilrahmen, Leadership-Management, Einladungen und Item-Handel lesen.
- Vor dem Produktivstart D1-Migrationen 0001–0003 auf Staging prüfen, Unity 6000.3.26f1 kompilieren und Client/Server-Berechtigungen auf zwei Geräten testen.
- Persönliche Gem-Wallet und Item-Provenienz zuerst serverseitig absichern, bevor Gems-Rahmen kaufbar oder lokale Items transferierbar werden. Es wird kein Chat implementiert.


## Gutschein-Integration (Draft-PR #149)

1. [Gumball Voucher Design-/Mechanikbericht](gumball-vouchers.md) und tatsächliche TypeScript-/Unity-Tests prüfen.
2. `npm run typecheck`, `npm test`, `npm run unity:check`, `npm run build` prüfen. Generierte Unity-Referenzen werden auf dem isolierten Feature-Branch synchronisiert. Keine Golden-Fixture-Abweichungen verdecken.
3. Unity 6000.3.26f1 Import/Compile, EditMode/PlayMode und tatsächliche Ticket-Ziehung mit v21/v22 Save-Migration durchführen.
4. Shop/Gumball/Season bei 320/390/430px in DE/EN und weitere Sprachen samt Ticketgrafik/Audio/Reduced Motion abnehmen.
5. Company-Profilrahmen/Badge-Kataloge weiter visualisieren, ohne Chat einzuführen oder lokale Voucher in serverseitiges Handelsinventar umzuwandeln.


## Gumball Art + Abzeichen (Feature-Branch, nicht mergen ohne Abnahme)

1. [Art-/Funktionsabgleich](profile-gumball-art-audit.md) prüfen; die Gutschein-Belohnungslogik ist bereits in main enthalten und wird nicht neu verdoppelt.
2. Web: npm run typecheck, npm test, npm run build. Unity: tatsächlichen Editor in 6000.3.26f1 kompilieren, EditMode ProfileBadgeArtTests und existierende GumballVoucherTests, anschließend Profil/Season/Shop bei 320/390/430 px und DE/EN prüfen.
3. Fehlende echte Profileinbindung mit gesicherter Auth, online einstellbaren 3 Badge-Slots, Frame-Käufen nur gegen serverbestätigte Gems und Privacy-Schaltern implementieren. Kein Chat.

## Company-/Gutschein-Main-Integration · 22.10.2026
1. GitHub Game checks und Cloudflare Companies API am finalen PR-Head prüfen, Referenzexports nur aus src/economy.ts generieren; rote CI nie ignorieren.
2. Die neuen Spielquellen in main können **ohne Cloudflare-Remote-Migration** bleiben; remote Wrangler D1 migrations apply erst nach D1-Backup und geprüftem Nutzer-/Namensdaten-Upgrade ausführen.
3. Sicheres Gast/Apple/Google-Konto und späteres Recovery ohne E-Mail-Pflicht implementieren. Serverseitig prüfbare Freischaltung ab 1.000 Gesamt-INT und 500-Gem-Founder-Wallet implementieren; bis dahin bleiben Online-Beitritte absichtlich gesperrt.
4. Normale Kisten-/Season-Gutscheinquittungen, Gems und Trading-Items nur anhand serververifizierter Belege online handelbar machen. UI muss lokale vs. geprüfte Tickets sichtbar trennen und Offline-/Crashfälle behandeln.
5. Namenscheck kann öffentlich und gedrosselt erfolgen; erst authentifizierter PUT reserviert einen Namen. Frühere bereits existierende Pseudonyme vor produktiver Aktivierung anhand einheitlicher Unicode-/Leetspeak-Schlüssel migrieren.
6. In Unity prüfen: 1.000-INT-Mira-Text, Claim-! auf Missionen/Achievements, Company-Rankings ohne Login, opt-in Profil-/Badge-Ausstellung, handhabbarer Trade-Flow und reduzierte Bewegung.
7. Datenschutz/Auskunft/Löschung, Missbrauchsmeldung, Privatsphäre für Ranglisten, EU-D1-Aufbewahrung und Stress-/Mobiltests vor Veröffentlichung vervollständigen. Kein Chat.

- Aktionsrunde 06 / Draft #152: Main-Integration `aebd1174` erhält die vorhandenen Unity-Company-/Profil-/Gutscheinwege. Neuer Company-Menü-/Gutschein-/Reload-Fall und zwei übernommene Compile-Anschlüsse korrigiert; finale integrierte Prüfergebnisse stehen im Abschnitt-06-Bericht. Optische Company-Abnahme bleibt separat.

- Referenzdateien reproduzierbar mit `TZ=Europe/Berlin npm run unity:export` erzeugen; lokale und Linux-PR-Prüfung verwenden diese Referenzzeitzone. Andere Zeitzonen nicht als Balanceänderung in Referenzdateien übernehmen.
