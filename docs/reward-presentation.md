# Kapselpreise und spielerisches Feedback · 14.10.2026

## Implementierter Vertrag

Freischaltung und Preis bleiben: erster Prestige, 10 Gems je Zug; keine Züge in Challenges. Hardware bleibt ausschließlich gegen Credits kaufbar. Die sichtbare Tabelle und die Domain verwenden `BALANCE.capsuleMachine`.

| Klasse | Preisart | Chance pro Zug | Menge |
|---|---|---:|---|
| Low | Komponenten | 35 % | Common 3–12 / Uncommon 2–5 / Rare 1–2 nach zugänglicher World-Tabelle |
| Low | Credits | 45 % | 15–60 Sekunden aktueller permanenter Creditrate, mindestens 100 |
| Mid | Data | 14 % | 15–60 Sekunden aktueller Datarate, mindestens 5 |
| Mid | Gems | 4,75 % | 2–8, gleichverteilt |
| High | Item | 1 % | Ein zugängliches Item; vorhandene bedingte Seltenheitsverteilung |
| High | Gem-Jackpot | 0,25 % | 20 × Gem-Zugpreis, aktuell 200 Gems |

Mengen der Zeitintervalle sind gleichverteilt in ganzen Sekunden. Creditgewinne sind direktes Guthaben, kein prestigegeeigneter Produktionsverdienst. Aktuelle Credits/Data werden in wissenschaftlicher Darstellung exakt gebucht und in der Quittung eingefroren. Sonderrezepte bleiben ausgeschlossen; erweiterte Itemtypen behalten ihre bestehenden Zugangsgates. Kein Pity und keine bezahlte Echtgeldmechanik ergänzt.

Gems werden zuerst in einem lokalen unveränderlichen Zustand belastet, danach wird die gesamte Auszahlung validiert und gebucht. Bei ungültiger Menge/Ganzzahlüberlauf wird der ursprüngliche Zustand ohne Belastung zurückgegeben. Negativer Kauf- und positiver Gem-Gewinn-Ledgereintrag haben eigene IDs. Dieselbe Draw-/Video-ID vergibt keine zweite Belohnung. Ein Zug aus 100 Gems mit Jackpot endet bei 290. Animationen lesen ausschließlich die schon gebuchte Quittung.

Save v55 ergänzt `resource` an alten Quittungen mit `null`, ohne nachträgliche Auszahlung. Der aktuelle Validator akzeptiert nur gültige positive eingefrorene Gewinne. Beide Resets behalten Automatenbestand, Beute und Draw-Nachweise; Challenge-Isolation bleibt bestehen. Video maximal sechs eindeutige erfolgreiche Abschlüsse pro Tag, nur über vorhandenen echten Providervertrag. Der Produktionsanbieter ist weiterhin nicht verfügbar; der Videobutton erzeugt keinen Fake-Grant. Keine Automation für den Automaten hinzugefügt.

## Darstellung und Bedienung

- Fünffarbige Kugeln liegen dicht, leicht unregelmäßig und überlappend in der Glaskammer. Gemeinsame radial schattierte Kugelform statt vereinzelter Scheiben.
- Mechanische Kurbel/Kapsel/Lid-Sequenz; danach Item-/Jackpot-Enthüllung mit Lichtstrahlen, Konfetti, großer Beute und kurzem Klang. Kein Kartenrahmen. Wiedereintritt/Reload wiederholt keine Enthüllung oder Buchung. Escape, Fokusführung, mindestens 44 px und reduzierte Bewegung berücksichtigt.
- Labor randlos von links bis rechts, ohne gedrückte Skalierung/Abdunklung. Trainings-/Equipmentaktionen bleiben eigenständig. Überlappende Modellbox entfernt; tatsächliche Modellwerte bleiben im Trainingsdetail.
- Detaillierte geschlossene/offene Dropkisten, kurze Öffnung und frei schwebender aggregierter Komponenten-/Credit-/Data-Text. Kein ×1 und kein Lootkasten; vollständige Komponentennamen im zugänglichen Text. Nur tatsächlich gebuchte Dropwährungen werden angezeigt.
- Challenges besitzen einen eigenen Burger-Eintrag und eigenständige Hubansicht ohne Profilnavigation. Vorhandene Challenge-Domain unverändert.
- Gemeinsame kantige 40-unit Steuerungsglyphen für Navigation/Meta-Menüs. Spielobjekte nutzen die zusammengehörigen illustrierten Assets. Kleine Steuerungssymbole und große Beuteillustrationen haben bewusst unterschiedliche Aufgaben.
- Gemeinsame Detail-/Sheet-Inhalte blenden ein, Fortschrittsbalken wechseln weich; bestätigte Hardware-, Training-, Forschungsstart-, Prestige-Node- und Itemaktionen verwenden Erfolgsfeedback. Dialogschließen bleibt während der Animation stationär. Wiederholte Rahmen bei Listen, Forschung und Inventar reduziert. Animationen ändern weder Zeitfortschritt noch Auszahlungen.

## Eigenes neues Asset

`public/assets/game/drop-crates-v3.webp`: eigene Rasterillustration, integriertes Imagegen-Tool, transparentes 3×2-Atlasbild (1536×1024), verlustfreie WebP-Formatkonvertierung. Keine fremden Assets, Fonts oder SDKs hinzugefügt.

Verwendete Motivvorgabe: Original detailed crisp pixel art in navy/teal/copper matching the laboratory and capsule machine; exactly three equal columns and two equal rows on transparent 3:2 canvas. Top row closed gold/teal/violet crates; bottom row the same crates opened with hinged lids, light and sparks. Same pose, scale and padding; metal bevels, bolts, vents, LED, latch and cables. No UI text, logos or placeholder shapes.

## Prüfungen und Grenzen

- 1.404 Tests in 104 Dateien: gesamte Suite grün; zusätzlicher Nachlauf 66 Tests in sechs betroffenen Dateien. Typecheck, Production-Build und Diffcheck grün.
- Renderer: 222 frühe Ansichten und 336 späte/Node-/Schmiedeansichten bei 360/390/430 px, DE/EN; zusätzlich sechs reale Click-/Save-/Reload-Profile für Item, Jackpot, Drop, Challenges, randloses Labor und reduzierte Bewegung. Keine Seitenüberbreite oder fehlenden Assets im geprüften Umfang.
- Die Jackpot-/Item-UI-Profile wählen vorbereitete deterministische Gewinnerseeds. Sie belegen Buchung und Darstellung, keine gemessenen natürlichen Gewinnchancen. Wahrscheinlichkeitssumme, Intervallgrenzen, 1 %, Jackpot, Überlauf, Migration und doppelte Vergabe werden separat in Domainregressionen geprüft.
- Erwarteter direkter Gem-Rückfluss: `0,0475 × 5 + 0,0025 × 200 = 0,7375` Gems je 10-Gem-Zug; mittlere direkte Gem-Senke 9,2625. Wert von Items/Materialien/Data/Credits ist darin nicht bewertet. Neue Gewinntabelle ist eine unkalibrierte Designannahme. Ratebasierte Gewinne und kostenlose Videozüge können die langfristige Progression beeinflussen.
- Offen: natürliche langfristige Automatenbalance, echte native iPhone-/WKWebView-/VoiceOver-/Safe-Area-Abnahme und Produktions-Werbeanbieter. Kein Release-, Merge- oder Echtgeldfreigabenachweis.

Weitere sinnvolle Animationen: tatsächliche Forschungs-/Craft-/Forge-Abschlüsse und neue Freischaltungen mit jeweils einem kurzen lokal begrenzten Signal; Itemwechsel mit sichtbarer Slotübertragung; Prestige-Verbindungen beim Erwerb. Kein Dauerkonfetti, kein blockierender Dialog für normale Low-Tier-Funde und keine Bewegung auf jeder passiven Einkommensänderung.
