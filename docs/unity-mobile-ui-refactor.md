# Mobile-UI-Refactor · 02.11.2026

Arbeitsbranch: `codex/mobile-ui-refactor-20261102`. Umsetzung im vorhandenen Unity-Projekt `IdleIntelligence/` mit Unity **6000.3.26f1**. Keine Migration, neue Projektversion, Veröffentlichung oder SDK-Integration. Die bereits vor Auftrag vorhandenen umfangreichen lokalen Änderungen bleiben erhalten. Insbesondere stammen die vorhandenen Core-/Balance-/Save-/Item-V3-Änderungen nicht aus diesem UI-Auftrag.

## Ausgangsbefund und Übernahme

Das vorhandene uGUI-System verwendet gemeinsame ActionCard-, LearningCard-, ItemPortrait-, DetailRoot- und ActionButton-Prefabs. Hardware, Trainings-/Forschungsquotes, Queues und Itemvergleiche waren bereits funktional; ShopHub zeigte dagegen fünf reine Weiterleitungskarten. MAX=0 zeigte null Kosten, GemFeatureView verriet den Automaten vor Prestige und große Rückkehrflächen belegten eine eigene volle Zeile.

[PR #175](https://github.com/Kayza1708/Idle-game-/pull/175) wurde am 02.11. bereits zusammengeführt, obwohl der Auftrag ihn noch als offen bezeichnete. Seine UI-Patches wurden gezielt auf den abweichenden lokalen Projektpfad und die bereits geänderte ItemCatalogV3-Implementierung übertragen. Kein pauschaler Checkout oder Überschreiben der lokalen Dateien. TypeScript-Shop und Ausrüstungsansicht sowie vorhandene Unity-Bilder wurden als Referenz gelesen bzw. angesehen.

## Umsetzung

- Eine direkte Shopfront mit horizontal scrollbarer Kategoriezeile; Tagesangebote als horizontale Reihe, danach echte Truhenangebote. Komponenten, permanente Upgrades und Paketvorschauen bleiben direkt erreichbar. Zeitangebote und vorhandene Nebenrouten bleiben über das Menü erreichbar.
- Gemeinsame `StorefrontUI`-Bausteine für Scrolltabs, kompakte Produktkarten mit separater Preis-/Aktionsspalte und Infofenster aus dem bestehenden DetailRoot. Originalspriteressourcen und bestehende Schriftfamilien bleiben erhalten.
- Original-Truhengrafiken je Tier, Tagesitemportraits, Komponentenicons und vorhandene Automatenart. Vollständige Truheninformationen und zugänglicher Itempool über Antippen der Truhengrafik; Gumball-Regeln/Chancen im Infofenster. Kostenpflichtige Marktangebote mit Preisbestätigung und unverändertem atomarem `MarketTicket`.
- Gumball verwendet ausschließlich die bestehende Regel `Prestige.resets >= 1`: vorher kein sichtbarer Shortcut, Tab oder Automat. Auch direkter Seitenaufruf bleibt gesperrt. Labor-Shortcut 60 UI-Einheiten breit mit 47 Einheiten breiter Originalgrafik. Kurze Mira-Erklärung nach einem tatsächlichen ersten Prestige-Reset; keine Änderung des Story-/Saveformats.
- Nicht verfügbare Video-/Restore-Aktionen sind unsichtbar. Bestehende werbefreie Rechte bleiben bedienbar. Pakete zeigen Vorschauen und die fehlende Storeverbindung; keine kaufbaren Echtgeldangebote oder erfundenen Storepreise.
- MAX zeigt die tatsächliche Summe bzw. bei null Kaufmenge den nächsten Einzelpreis. Quotes werden nach Präsentationsrevision, Besitz, Menge und Challenge erneuert. Berechtigung, Geldabzug und Hardwarebonusberechnung bleiben bei den bestehenden Domainfunktionen.
- Kompakte Schließen-Ziele für Menü-Rückkehr, Training, Forschungsübersicht und Forschungs-/Trainingsdetails. Gemeinsames ActionButton-Prefab mit 44 statt 54 UI-Einheiten Mindest-/Sollhöhe. Trainingskarten mit kleinerer Typografie, Innenabständen und Infoaktion; bestehende Fortschritts- und Queueansichten erhalten.
- Kompakteres Reaktorboard: Originalkern, einheitliche 76-Einheiten-Sockel, eigene holografische Raster-/Schaltkreisgeometrie, aktive Verbindungen in Cyan. Geheimes Labor bleibt auch bei direktem Routenaufruf gesperrt. Rezeptvorschauen zeigen den echten Primäreffekt; vorhandene Ausrüstungs-/Upgradevergleiche und aufklappbare Details bleiben erhalten.

Neue Geometrie ist statisch; vorhandene kosmetische Animationen respektieren weiterhin Effekteinstellung/reduzierte Bewegung und vergeben keine Ressourcen. Keine Änderungen an Economy, Dropwahrscheinlichkeiten, Freischaltbedingungen oder Speicherformaten durch diesen Auftrag. Das Inventarraster gibt keine starre Mindestbreite mehr an die Schmiede weiter; neue Tests prüfen die Sockelränder innerhalb des tatsächlichen 320/390/430-Bildschirms. Aktive Shopreiter werden in ihren Scrollbereich geholt, verborgene Unterleisten reservieren keinen Platz. Miras Dock wird beim Breitenwechsel vor dem Rendern anhand des tatsächlich umbrochenen Textes angepasst. In der Ressourcenleiste wechselt „Auto“ bei Platzmangel zur kompakten wissenschaftlichen Darstellung; die gespeicherten Werte und die gewählte Zahlenoption bleiben unverändert. Im Prestigebaum sind Bereichsfilter und Gestenhinweis über „Bereiche“ einblendbar, damit der eigentliche Baum auch bei 320 px ausreichend Höhe erhält; die Effekttaste bleibt als „FX“ einzeilig.

## Prüfungen

- `npm run typecheck`: bestanden.
- `npm test -- --testTimeout 30000`: **174 Dateien / 2108 Tests bestanden**. Der vorhandene Simulationsumfang benötigt rund sechs Minuten; kein Test entfernt oder deaktiviert. Vites optionaler WebSocketserver meldete unter der Sandbox EPERM, der Testlauf endete erfolgreich.
- `npm run build`: bestanden; bestehender Hinweis auf große JS-Chunks.
- Unity-Import/Compile: Exit 0. Erster Sandboxstart scheiterte an lokalen UPM-Sockets; regulärer Batchstart außerhalb der Sandbox erfolgreich. Keine fremde Editorinstanz geschlossen oder Lockdatei entfernt.
- Vollständige finale EditMode-Suite: **226/226 bestanden, 0 übersprungen, Exit 0**, 240,45 Sekunden. Der frühere Durchlauf mit 226/226 bestand ebenfalls (201,17 Sekunden).
- Erste gezielte PlayMode-Prüfung: **2/2 bestanden**, einschließlich echter Kauf-/Trainings-/Forschungs-/Herstellungs-/Ausrüstungsaktionen, Preisbestätigung, Replay-Schutz, gesperrtem Zugang, echtem Prestige-Reset und gespeichertem Gumball-Beleg. Separater temporärer vorbereiteter Teststand; keine natürliche Erwerbsgeschwindigkeit behauptet.
- Erster vollständiger PlayMode-Lauf: 140/148 bestanden; nach Überarbeitung alter Geometrie-/Katalogfixtures und Korrektur des sicheren UI-Katalogzugriffs 11/11 gezielte Regressionen bestanden.
- Zweiter vollständiger Stand: 145/148 bestanden. Die nun realen 320-px-Fehler betrafen Miras Umbruchhöhe, eine Ressourcenzeile und die Prestigewerkzeuge/-höhe. Ihre ursprünglichen Abnahmetests wurden beibehalten. Nach den Komponentenfixes **6/6 gezielte Tests bestanden**. Zusätzlich **7/7 Shop-/Gem-/Anbietertests** und **2/2 Rand-/Touchprüfungen** bestanden.
- Zwischenläufe mit inzwischen überholten Quellen wurden abgebrochen und zählen nicht als bestanden. **Finaler vollständiger PlayMode-Lauf: 148/148 bestanden, 0 übersprungen, Exit 0**, 824,96 Sekunden. Quellen blieben während dieses Laufs unverändert. Das [Prüfmanifest](unity-mobile-ui-refactor.verification.json) enthält Quellen-/Bildhashes und die tatsächlichen Testzusammenfassungen.

Die vorhandene CLI kann Batchtests ausführen; für PlayMode mit Bildausgabe wird zusätzlich die bestehende direkte Editor-Batchanbindung mit dem dokumentierten prozesslokalen `--burst-disable-compilation` verwendet. Keine Paket-/Projekteinstellung zur Umgehung geändert. Neue Tests: `MobileRefactorTests`; vorhandene Kauf-/Belegtests führen den echten Bestätigungsschritt aus und prüfen weiterhin Geldabzug, Wiederholung, Reload und beschädigte Originale. Verfügbarkeitsprüfungen kontrollieren zusätzlich, dass nicht angebundene Aktionen im Spieler-UI fehlen.

## Bildnachweise und Sichtbefunde

60 unveränderte, mit `PREPARED UI TEST` markierte Unity-Aufnahmen: zehn Ansichten (Labor, Training, Forschung, Modell/Inventar, Shop, Komponenten, permanente Upgrades, Gumball, Pakete, Itemdetails) × DE/EN × 320/390/430 px. Die vorbereiteten Zustände tragen `PREPARED UI TEST`; sie zeigen keine natürliche Erwerbsgeschwindigkeit. Seitenverhältnisse: 320×694, 390×844, 430×932. Bestehende Testfälle prüfen zusätzlich kürzere 320×568-Darstellungen und simulierte Safe Areas.

- [Shop 320](media/unity-mobile-ui-refactor/shop-de-320.png), [390](media/unity-mobile-ui-refactor/shop-de-390.png), [430](media/unity-mobile-ui-refactor/shop-de-430.png).
- [Reaktorboard 320](media/unity-mobile-ui-refactor/items-de-320.png), [390](media/unity-mobile-ui-refactor/items-de-390.png), [430](media/unity-mobile-ui-refactor/items-de-430.png).
- [Training 320](media/unity-mobile-ui-refactor/training-de-320.png), [Gumball 320](media/unity-mobile-ui-refactor/capsule-de-320.png), [Itemdetails 390](media/unity-mobile-ui-refactor/item-detail-de-390.png).

Zusätzlich 24 unveränderte vorbereitete Aufnahmen des Prestige-/Axiombaums und seiner Knotendetails, Dateipräfix `prepared-`, aus `PrestigeSkinTests`. Diese ursprüngliche Testsuite zeigt keinen sichtbaren Testbanner; Herkunft und Vorbereitungsstatus sind hier ausdrücklich gekennzeichnet. [Prestige 320](media/unity-mobile-ui-refactor/prepared-int-de-320.png), [Axiome 390](media/unity-mobile-ui-refactor/prepared-axiom-en-390.png).

Zusätzlich sechs echte frische, isolierte Anfangszustände ohne Entwicklerressourcen aus `MainViewRepairTests` (Dateipräfix `fresh-mira-`): [Mira/Start 320](media/unity-mobile-ui-refactor/fresh-mira-de-320.png). Damit sind 90 Rohaufnahmen abgelegt; sie verwenden ausschließlich temporäre Saves.

Die Bildmatrix wurde selbst angesehen. Konkret korrigiert: zu weit nach unten geschobene Truhen durch vertikale Tagesangebote, angeschnittene rechte Sockel/Schmiedereiter bei 320 px, herunter skalierte Touchziele, umgebrochene Shopreiter, durchscheinender Popuphintergrund, doppelte Vorschautexte, reservierter Leerraum einer verborgenen Gem-Navigation und außerhalb des sichtbaren Bereichs liegende aktive Reiter. Lange Tagesangebotsnamen können in den schmalen horizontalen Karten mehrzeilig umbrechen; Preise bleiben in einer separaten Spalte. Itemdetails und lange Produktlisten sind scrollbar. Keine pauschale Behauptung, alle späteren Nebenansichten seien nun gestalterisch fertig.

Konkrete verbleibende Sprachlücken in der EN-Bildserie: „Truhen“/„Funde“, „Zusatzlabor“, Teile der INT-Voraussetzung und „Extra-Ziehung“/„Dauerhaftes Recht“ sowie die neue Bereichs-Kurzbeschriftung „Bereiche“. Diese verwenden das bisherige fragmentweise Übersetzungssystem; auch das neue Kurzlabel benötigt vollständige Sprachfassungen. Die sieben Sprachen bleiben wählbar und funktional; vollständige sprachliche Releasequalität ist damit nicht nachgewiesen.

## Abnahmegrenzen

Editorbilder und vorbereitete Teststände ersetzen keine physische Geräteabnahme. Restlokalisierung in den sieben vorhandenen Sprachen, Systemschrift/Screenreader, physische Safe Areas, Haptik, Energieverbrauch und Unterbrechungen bleiben separat zu prüfen. Nicht angeschlossene produktive Store-/Werbe-/Cloud-/Company-Dienste bleiben unverfügbar und benötigen eigene Aufträge. Eine komplette Releasefreigabe oder pauschale Designabnahme sämtlicher später Nebenansichten wird nicht aus bestandenen Tests abgeleitet.
