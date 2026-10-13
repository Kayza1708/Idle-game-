# Rückkehr- und Freischaltungsführung

13. Oktober 2026. Aufbau auf dem Bonuskistenblock aus Draft-PR #95. Keine Balance-, Save-, Reset- oder Rewardänderung.

## Konkrete Korrekturen

Der Rückkehrbericht unterscheidet jetzt **erzeugte Credits/Data vor automatischen Ausgaben** vom **aktuell verfügbaren Bestand**. Er zeigt außerdem die im Offlineabschnitt tatsächlich automatisch gekauften Hardwareeinheiten (`AdvanceReport.hardware`). Zeitgutschrift, verworfene Offlinezeit und reale Abschlüsse bleiben erhalten. Die Beträge verwenden die bestehende gemeinsame Zahlenformatierung einschließlich Auto/Scientific/Engineering. Weder Bericht noch Navigation vergeben Ressourcen erneut. Eine Bruttoerzeugung ist nicht der sofort ausgebbare Geldbetrag.

Bis zu zwei Navigationen basieren ausschließlich auf dem aktuellen Spielstand:

1. Pending-Bonuskisten im Inventar öffnen.
2. Einen tatsächlich erworbenen, leeren kompatiblen Ausrüstungsplatz ansehen.
3. Einen bereits freigeschalteten leeren Trainingsplan ansehen; bei nicht freigeschalteter Queue ein aktuell bezahlbares inaktives Training ansehen.
4. Einen zugänglichen, aktuell bezahlbaren Forschungsstart ansehen.
5. Wenn kein Forschungsstart möglich ist und Prestige bereits erreicht wurde: den tatsächlichen nächsten Forschungszugang im bestehenden INT-Baum ansehen.

Die Reihenfolge ist eine begrenzte Anzeigepriorität, keine Behauptung über die optimale Strategie. Ein Zugang-Link verspricht nicht, dass der Node bereits bezahlbar ist; das reguläre Nodeblatt zeigt Kosten/Voraussetzungen. Die Queueinformation sagt ausdrücklich, dass vorgemerkte Jobs nur mit ausreichender Data starten. Keiner dieser Links kauft, claimt, startet oder resetet. Der Spieler trifft die Entscheidung im normalen Detailblatt.

Main-Vorschläge werden während einer aktiven Challenge nicht gezeigt. Nach einem Challenge-Return stammen sie aus dem wiederhergestellten Hauptstand. Öffnen schließt Rückkehr-/Profil-/Menüoverlays und führt zum bestehenden Inventar, Ausrüstungsdialog, Modellblatt, Forschungsprojekt oder Prestige-Node. Der alte Rewards-Link verlässt sich nicht mehr auf einen möglicherweise fehlenden `.mission-hub-toggle`, sondern öffnet direkt Missionen bzw. bei ausschließlich neuen Seasonbelohnungen den Seasonbereich. Keine zusätzliche Hauptscreen-Zielkarte und kein neues Menü.

**Kistenbeleg:** `componentText` liefert strukturierte Daten. Der Beleg verwendet jetzt deren lokalisierten Namen statt Objektkoercion (`[object Object]`). Das tatsächliche Paket wird damit lesbar. Betrag, Inhalt und einmaliger Grant bleiben unverändert.

## Verträge

Zweck: tatsächlichen Fortschritt nach einer Pause verstehen, leere endliche Automation erkennen und vorhandene nächste Schritte erreichen. Freischaltung: nur im bereits vorhandenen Rückkehrbericht; jeder Link respektiert die echte Domainfreischaltung. Kosten: ausschließlich die bestehenden späteren Aktionen; Navigation ist kostenlos. Mathematische Wirkung: keine, nur getrennte Anzeige von Bruttoerzeugung und aktuellem Ledgerbestand. Reset/Save: keine neuen Felder und keine Migration. Automation: keine neuen Kauf-/Startregeln; bestehende automatisierte Fortschritte werden angezeigt, ein leerer Puffer wird nicht heimlich nachgefüllt.

Neue Führungs-/Abrechnungstexte DE/EN/ES/FR/PT/IT/PL. Der bestehende sonstige Rückkehrbericht behält seine bisherigen DE-/EN-Texte; hier wird keine vollständige zusätzliche Übersetzung der gesamten App behauptet. Buttons mindestens 44px, Textumbruch aktiviert. Mobile Layout-/Touchabnahme ist separat erforderlich.

## Prüfung

Zehn neue Verträge: kein Mutieren/Gratisstart, reale Research-/Trainingaffordability, erworbene Queue und deren Füllstand, korrekte Itemkategorien, begrenzte Navigation/Challenge-Suppression, tatsächlicher Forschungsnode, sieben neue Textsets, korrekte Komponentennamen in allen Sprachen und gerenderte Brutto-/Netto-/Autobuyeranzeige ohne erneute Auszahlung. Die Modalrenderverträge verwenden einen Portalstub; sie beweisen keinen realen Browserlayout-/Fokusablauf.

## Mobileprüfung: konkret blockiert

Der lokale Vite-Server läuft auf `127.0.0.1:5181`; Host `0.0.0.0` scheitert hier an `uv_interface_addresses`, Loopback funktioniert. Die Runtime enthält Playwright, aber keine ausführbare Chromium-/Headless-Shell-Datei. Der begrenzte offizielle Browserdownload liefert kein gültiges ZIP (`End of central directory record signature not found`). Die separate Cloud-Browseranbindung erhält beim lokalen Server `ERR_CONNECTION_REFUSED`.

Deshalb **keine** behauptete 360/390/430px-, Screenshot-, Fokus- oder Geräteabnahme. Kein serverseitiger Fehler des Spiels wird daraus abgeleitet. Die Domain-/Renderingprüfung und Produktionskompilierung können lokal durchgeführt werden; reale Mobileflüsse bleiben ein offenes Abnahmekriterium.

Nächste Prüfung in einer Umgebung mit Browserzugang: DE/EN bei 360/390/430px; Rückkehr mit Bruttoertrag, automatisierten Käufen und Restbestand; Kistenlink und tatsächlicher Beleg; leere Queue → Modellblatt ohne Startkosten; Research-/INT-Zugang; Rewards-/Seasonnavigation; Fokus/Escape und Overlays; keine Seitenüberbreite, alle neuen Touchziele ≥44px. Technische Ausgangsstände dürfen vorbereitet werden, müssen als solche gekennzeichnet bleiben.

Weitere V1-Agenda: reale Geräte-/Lifecycle-/Saveabnahme, Midgame-Build-/Langzeitbalance, native Monetarisierung/Analytics und Storevorbereitung. Dieser Block ist keine Releasefreigabe.

Lokale Gesamtabnahme: **1.338 Standardtests**, App-/Node-Typecheck, Produktionsbuild und Diffcheck grün. Mobile Browser-/Geräteabnahme aus den beschriebenen Gründen offen.
