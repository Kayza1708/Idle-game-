# Achievements und Quests für V1

Implementiert am 12. Oktober 2026. Save v50. Diese Änderung integriert Ziele und schützt deren Buchung; sie beweist keine Wochen-/Monatsbalance.

## Dauerhafte Erfolge

Alle Familienschwellen stehen jetzt in `src/economy.ts`. Alte IDs und bereits beanspruchte Tier-IDs bleiben gespeichert; Gems und Achievement-Punkte werden nicht zurückgenommen oder erneut vergeben. Größere neue Schwellen gelten für noch nicht beanspruchte Stufen. Die Einstiegsschwelle für Forschung, Training und Herstellung bleibt jeweils eins.

- Itementdeckung: 1/3/5/8/12/16/20/24/27/30 statt 1–9 mit doppeltem Endziel.
- Forschung und Training: 1/20/100/500/2.000/7.500/30.000/100.000/500.000/2.000.000 Abschlüsse.
- Herstellung: 1/10/50/200/1.000/5.000/20.000/75.000/300.000/1.000.000 Exemplare.
- Credits: 1e3/1e6/1e9/1e12/1e16/1e22/1e30/1e45/1e70/1e100.
- Data: 100/1e4/1e6/1e8/1e10/1e13/1e16/1e20/1e30/1e50.

Sieben neue Familien nutzen bestehende permanente Domainnachweise:

| Familie | Nachweis | Endziel |
|---|---|---:|
| Komponentenatlas | `discoveredComponents`, eindeutige Typen | 20 |
| Bauplanbibliothek | `learnedRecipes`, bezahltes Lernen | 28 |
| Ingenieursportfolio | `craftedItemTypes`, selbst hergestellte Typen | 30 |
| Materialfamilien | `materials.families` | 5 |
| Schmiedenetz | Summe bestehender Schmiede-Ausbaustufen | 15 |
| Challenge-Stufen | Summe `challengeStages`, Erstabschlüsse | 690 |
| Challenge-Spezialist | Höchste Stufe einer Familie | 69 |

Die zwei fragmentfreien Rezepte zählen nicht zum bezahlten Bauplanlernen. Entdeckung/Fragmentbestand beweisen keinen Kauf; Inventarverkauf oder Zerlegen löschen Herstellungsnachweise nicht. Challenge-Replays zählen nicht als neue Stufen. Start-Achievements für Forschung/Training werden aus dem aktiven Katalog genommen, ihre bereits verdienten Belohnungen bleiben bestehen. Die Forschungspunktewirkung aus Achievements behält ihren bestehenden 20%-Cap. Neue Familien haben Texte in sieben Sprachen; vorhandene Alt-Achievementtexte behalten ihre bisherige DE/EN-Abdeckung.

## Wiederkehrende Quests

Weiterhin 6/12/30 Aufgaben, Bonus ab 4/8/20. Neue Perioden verwenden nur tatsächliche Abschlüsse statt Forschungs-/Trainingsstarts. Fusion und Prestige werden nicht mehr neu als Periodenpflicht gezogen; vorhandene Altaufgaben bleiben bis zum Ablauf erhalten. Crafting folgt dem ersten tatsächlichen Craft; Item-Forge folgt vorhandener Schmiede und erstem Forge-Abschluss.

Fortschrittsband wird anhand dauerhaft entdeckter Hardwareklassen bestimmt:

| Klassen | Bandmultiplikator |
|---|---:|
| 0–2 | 1 |
| 3–5 | 2 |
| 6–8 | 4 |
| 9–11 | 8 |
| 12–14 | 16 |
| 15 | 32 |

Hardwarekäufe, Meilensteine, abgeschlossene Trainings/Forschung, Herstellung und Komponenten skalieren mit dem Band. Taps, aktive Zeit und Overclock werden nicht mit höherem Accountlevel vervielfacht. Wiederholte Mengenstufen derselben Vorlage wachsen mit 2 statt pauschal 5. Hardware und Credits werden bevorzugt angeboten, um passive Alternativen sicherzustellen.

Produktionsziel = Maximum aus Basisziel und **aktueller regulärer Produktionsrate × 2/14/60 Stunden** für Tages-/Wochen-/Monatsaufgaben. Temporäre Creditboosts und Overclock werden dabei ausgeschlossen. Das ist ein Produktionsbudget, keine behauptete Abschlusszeit: Nachfolgende Verbesserungen verkürzen, Prestige verlangsamt den Abschluss. Goal und Baseline werden einmal bei Periodenbeginn gespeichert und anschließend eingefroren. Gesättigte numerische Produktionszähler bei 1e300 erhalten keine neuen Produktionsaufgaben; Ziele werden auf den verbleibenden darstellbaren Zählerraum begrenzt. Scientific-Economy bleibt unverändert.

Neue optionale Vorlagen:

- Neue bezahlte Itembaupläne: 1/2/4, erst mit Bauplanforschung und zugänglichem noch ungelerntem Rezept.
- Schmiedenausbau: 1/1/2 Ausbaustufen, erst mit bestehender ausbaubarer Schmiede.
- Neue Challenge-Stufen: 1/3/9 Erstabschlüsse, erst nach dem ersten belegten Abschluss.

Finite Vorlagen treten je Periode höchstens einmal auf. Ihre Anzahl bleibt unter oder gleich `Aufgabenanzahl − Bonusanforderung`, damit keine von ihnen für den Bonus zwingend ist. Ziele werden auf verbleibende Katalogkapazität begrenzt; vollständige Sammlungen entfallen aus dem Pool. Belohnungen erzeugen weder automatische Starts noch Käufe oder Ressourcenreservierungen.

## Belohnungen, Reset, Save und Automation

- Neue Aufgaben: feste Gems pro Periode, keine höheren Gems/Season-XP nur wegen schwererer Mengenstufen. Maximaler neuer Gem-Zufluss mit Bonus: 18/90/570 pro Tag/Woche/Monat. Materialpaket pro manuell/automatisch beanspruchter Aufgabe bzw. Bonus bleibt der bestehende zentrale Grant; Paketmenge, Season-XP-Basis und Forschungscap unverändert.
- Save v50 ergänzt optionale `objective` und `rewardTier`. v49 wird ohne Ressourcen- oder Questumschreibung übernommen. Alte Aufgaben behalten ihre historische Season-XP-Tierberechnung; neue speichern Tier eins. Unbekannte Objective-/Reward-Tier-Werte werden abgelehnt. Keine fiktiven Lifetime-Zähler oder historischen Nachvergütungen werden erzeugt.
- Bestehende Quests behalten Ziele, Baselines und Claimflags auch bei Prestige/temporär verlorenem Runzugang. Keine stille Ersetzung und kein Zurücksetzen von Fortschritt. Laufende Altquests können vorübergehend Wiederaufbau erfordern.
- Prestige/Axiom verwenden die bestehenden permanenten Accountdaten. Herausforderungen haben keine eigenen Hauptspiel-Questrollovers oder Claims; die Hauptspiel-Simulation läuft weiterhin unabhängig passiv und darf reguläre Hauptspiel-Aufgaben erfüllen. Erstabschluss erfolgt über vorhandene Rückgabe des Challenge-Stands.
- Die Simulationsgrenze für Questperioden wird in isolierten Runs ignoriert: deren eingefrorene/ungefüllte Perioden dürfen keine Mikrosekundenschritte erzwingen. Normale Hauptspielperioden behalten ihre Grenzen.
- Bestehende Quest-Claim-Automation und Offline-Systeme nutzen dieselben Domainfunktionen; keine zusätzliche Automationwährung. Export enthält die gespeicherten neuen Objectives und Baselines bereits im bestehenden Missionsabschnitt.

## Abnahme und offene Kalibrierung

Gezielte Verträge prüfen monotone Schwellen, vollständige erreichbare Sammlungen, bezahltes Lernen, alte Claims, Locale-Texte, Bandbildung, fixe Ziele, Budgetgrenzen, Nicht-Verpflichtung endlicher Ziele, Sättigung, Save-/Reload-/v49-Verträge, Domain-Doppelclaim und Challenge-Zeitfortschritt. Lokale Abnahme: 1.274 Standardtests (darunter 17 neue Verträge), Typecheck und Build grün; Diffcheck sauber. Keine Browser-/Geräteabnahme.

Unbewiesen bleiben natürliche Abschlussquoten jeder Periode, Wochen-/Monats-ETA der neuen Erfolgsschwellen und Auswirkungen des festen neuen Gem-/Season-XP-Budgets auf Extra-Labs und Seasonabschluss. Dafür die nächste kurze Progressionsmessung um Quest-/Achievementzeitpunkte und feste Builds ergänzen; anschließend repräsentative Midgame-Snapshots prüfen. Keine langen Simulationen, Browser-/Geräteabnahme oder Releasebehauptung in diesem Paket.
