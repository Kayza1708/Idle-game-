# Unity: UTC-Missionen und Kalenderbelohnungen

Fortsetzung auf `codex/unity-rewrite`, Draft-PR #133. Kein Gesamtabschluss der Migration. Die TypeScript-Spielregeln bleiben unverändert.

## Implementierter Umfang

Alle 18 aktuellen Missionsvorlagen mit ihren tatsächlichen Verfügbarkeiten, 6/12/30 Tages-/Wochen-/Monatsaufgaben, 4/8/20 Bonuszielen, Fortschrittsbändern, Produktionszielen und zukünftigen Hardwareklassen. Wöchentliche und monatliche Wiederholungen verlangen zusätzliche Arbeit über versetzte Baselines. Wochen beginnen am Montag, alle Perioden verwenden UTC. Die bestehenden nicht angebotenen Fusion-/Prestige-/Foundryvorlagen werden nicht künstlich aktiviert.

Manuelle Claims vergeben die originalen Gems, Season-XP und zugänglichen Materialpakete. Beim Ablauf werden nur noch nicht abgeholte Gems samt erreichtem Periodenbonus verrechnet; keine nachträglichen Pakete, Bonusboxen oder XP. Die aktive Zeit wird entsprechend `simulation.ts` nach dem letzten Periodenwechsel verbucht, nicht je Simulationsschritt. Überschüssige Offlinezeit wird konsumiert, ohne zusätzliche Kalenderabrechnung am verworfenen Endzeitpunkt. Challenges pausieren das Hauptspiel; die Kalenderfristen werden nicht verlängert und erst nach der Rückkehr wieder verarbeitet.

Der Tagesbonus erstellt ausschließlich über seinen echten Claim eine eingefrorene Bonusbox. Familienauswahl, Materialmenge und eventueller Bauplan werden beim Erhalt festgelegt. Der deterministische Originalhash berücksichtigt auch das JavaScript-Verhalten bei Astralzeichen. Bereits bekannte Baupläne ergeben beim Öffnen ein Fragment. Bei 32 offenen Boxen wird nur die neu hinzugekommene automatisch mit ihrer ersten Familie geöffnet; ältere Auswahlmöglichkeiten bleiben erhalten. Veraltete UI-Callbacks und doppelte Claims vergeben nichts erneut. Auch automatische Ablaufzahlungen lösen vor der Anzeige einen geschützten atomaren Save aus.

Die notwendige Season-Abhängigkeit enthält XP, Level, 30-Tage-Wechsel, sieben Tage Kulanz und die originale Liste abgeschlossener Seasons. Die drei vollständigen Free-/Premiumkataloge und ihre Claims/Truhen folgen in Abschnitt 4. Hier werden keine zusätzlichen Gratisansprüche erzeugt.

## Erhaltene Quellbesonderheiten

- Bauplanziele rechnen die Anzahl aller bereits gelernten Rezepte von der Anzahl positiver Rezeptpreise ab. Damit kann der Quellcode diese Ziele vorzeitig aus dem Pool entfernen. Keine Ersatzrechnung.
- Missionspakete wählen zuerst die höchste dauerhaft entdeckte Familie und prüfen danach den aktuellen Forschungszugang. Ist sie gesperrt, gibt es kein Paket; kein Rückfall auf eine niedrigere Familie.
- Bonusboxen verwenden ihre eingefrorenen ursprünglichen Familienlisten. Diese unterscheiden sich bei Photonik/Frontier/Quanten vom V2-Analyse-/Missionspaketpool. Beim Öffnen gibt es keine erneute Zugangssperre.
- Der Drop-Missionsproduzent ist noch Abschnitt 5. Vorlagen und Gates werden trotzdem unverändert übernommen; eine noch nicht implementierte Sammelfunktion wird nicht durch Gratisfortschritt ersetzt.
- `claimMailbox` ist in der Vorlage ein No-op. Bestehende Unity-Post bleibt lesbar, ohne erfundene Sammelbelohnung.

## Speicherstände

Unity-Save v9 verlangt den neuen Missionsvertrag sowohl im aktiven Zustand als auch im pausierten Hauptspiel. V1–8 werden weiterhin mit unveränderter Originalkopie migriert. Weil diese Unity-Saves noch keine Missionshistorie besaßen, erhalten sie ausdrücklich `startPending`: Erst nach der Offline-Synchronisierung des Hauptspiels beginnen neue Baselines und die erste Seasonuhr. Historische Zähler ergeben keine rückwirkenden Claims. Ein älterer aktiver Challenge-Save beginnt damit erst nach Rückkehr und Hauptspiel-Synchronisierung. Ein nachweislich gespeicherter früherer Analyseabschluss erhält das entsprechende Verfügbarkeitsmerkmal; es werden keine Analysebelohnungen erneut vergeben.

Native Saves sind weiterhin getrennt von Web-Saves. Expliziter validierter Webimport, Recovery-UI und die vollständigen Feldverträge bleiben Abschnitt 8. Fehlende aktuelle Pflichtverträge und beschädigte Bonusbelege sperren das Original.

## Bedienung und Prüfung

Szene: `Assets/Scenes/IdleIntelligence.unity`. Play → **Forschung → Missionen**. Perioden über die drei beschrifteten Schaltflächen wechseln. Erreichte Aufgaben und den Periodenbonus einzeln abholen; offene Bonusboxen darunter über die gewünschte Materialfamilie öffnen. Alle Transaktionen verwenden echte Spielsysteme und das vorhandene Aktionsprefab. Keine Animation zahlt Belohnungen aus.

Die [Prüfdaten](unity-missions-verification.json) halten tatsächliche Ergebnisse fest: 208 gemeinsame Transaktionen; vollständige 52/52 EditMode- und 28/28 PlayMode-Tests, anschließend 4/4 Missions-/Save- und 3/3 UI-Nachtests. 1.868 Vitest-Tests in 134 Dateien, Typecheck, Build und reproduzierbarer Export sind erfolgreich. Mobile Editorbilder auf 320/390/430 px sowie die Bonusboxauswahl sind visuell geprüft. Kein Geräte- oder Releaseabnahmesiegel. Die gemeinsamen Fälle führen die echten TypeScript-Funktionen aus und vergleichen Ziele, Baselines, Wallet, Pakete, XP, Kalenderwechsel, eingefrorene Boxen, Wiederholung und Challengeisolation. Vorbereitete Fortschrittszähler dienen nur Transaktions-/UI-Prüfungen und gelten nicht als natürlicher Erwerbsnachweis.

Noch offen in Abschnitt 3: der vollständige Story-/Kapitelablauf wird zusammen mit Mira/Tutorial in Abschnitt 7 übernommen. Aktive Drops folgen als Missionsabhängigkeit in Abschnitt 5. Seasons, Shop, Adapter, Sprachen und vollständige Speicherberichte werden durch diesen Teilabschnitt nicht als erledigt markiert.
