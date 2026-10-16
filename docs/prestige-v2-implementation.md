# Prestige und Axiome V2 – Implementierung

Der freigegebene Entwurf steht in [prestige-axiom-concept-v2.md](prestige-axiom-concept-v2.md). Die Produktionswerte liegen unter `BALANCE.progression` in `src/economy.ts`. Das Spiel startet mit V2; die alten Kataloge bleiben ausschließlich für bestehende Belege, Migration und historische Vertragstests lesbar.

## Produktionspfade

| Bereich | Umsetzung |
| --- | --- |
| INT | 60 unabhängig kaufbare Knoten; keine AP-, Vorläufer- oder Mastery-Sperren. INT-Anspruch wird bei verdienten Credits gebucht, nicht bei späteren Exponentenkäufen rückwirkend berechnet. |
| Axiome | Erstes Axiom ab 1e6 Zyklus-INT und 30 unterschiedlichen Käufen; 24 Upgrades, begrenzter INT-Exponent, unendlicher A02-Nachlauf ohne unbegrenzte Exponentenerhöhung. |
| Ausrüstung | Drei feste Grundslots; drei weitere separat per INT. Zusatzslots überstehen Axiome. K10 gibt universelle Slots nur während seiner aktiven Nutzung. |
| Geheimes Labor | Ab 200.000 historisch erreichten INT in Forschung; einmalige 1.000 Erkenntnis; zehn zufällige Modelle ohne Duplikate, genau eines aktiv, Erkenntnis-Upgrades. |
| Training | Quality/Efficiency plus Integration; bezahlte Kosten und Grundarbeit eingefroren, laufende Geschwindigkeit dynamisch. Modelltransfer-Berechtigung pro Auftrag gespeichert. |
| Fertigung | Sechs garantierte Starterrezepte, definierte Komponentenbücher, einzelne bezahlte Auftragseinheiten, zeitbasierte Fusion, Recycling ausschließlich tatsächlich gebundener Materialien. |
| Materialien | 20 gezielte Synthesen, gemeinsame Analysestation, materialforschungsabhängige Mengen ohne nachträgliche Preissteigerung. Seltenheitsgarantie ohne RNG-Reroll. |
| Automation | Hardwaregruppen, Trainingsziele, Forschungsdirektor, Analyse-/Crafting-/Fusionsplaner, Wiederaufbau, KI-Phasen und gemeinsame Reserven. Endliche Resetabsicht wartet nur auf ausgewählte bestehende Jobs. |
| Challenges | Hauptspiel und verbleibende Boostdauer pausiert; lokale Economy und ausgewähltes Modell isoliert. Keine KI-/Prestige-/Axiomkäufe im Versuch. |
| Speicherstand | V60, V59-Konvertierung mit gezieltem Kostenrefund und übernommenen Nutzungsrechten; Originaldatei bei Fehler geschützt. Kleine Abbuchungen neben großen Zahlen bleiben als sparse Dezimalreste erhalten. |

## Tests und Grenzen

`prestigeConceptV2.test.ts` prüft die echten V2-Produktionsfunktionen und den aktuellen Speicherleser. Historische Tests benutzen explizit `legacyContractFixture.ts`, um die bisherigen V59-Verträge weiter zu prüfen; sie sind kein Nachweis für das Balancing der neuen Progression.

Die neue Oberfläche wird auf tatsächliche Controls und Katalogeinträge serverseitig gerendert geprüft. Ein visueller Browserlauf und ein iPhone-/WKWebView-Test stehen aus: In dieser Umgebung ließ sich kein Browser installieren. Native SDKs wurden nicht geändert.

Die Zahlen des Konzepts sind eine implementierte Ausgangsbalance. Vollständige 7-/30-Tage-Kampagnen, sämtliche 690 Challenge-Stufen und subjektives Spieltempo müssen vor Veröffentlichung separat abgenommen werden. Ein bestandener Unit-Test ersetzt diese Abnahme nicht.

## Abschließender lokaler Nachweis

- `npm run typecheck`: bestanden, 266 TypeScript-Module ohne Pfad-/Casingkollisionen.
- `npm test`: **1.582/1.582 Tests aus 115 Dateien bestanden**. Darin 46 echte V2-Integrations-/Offlinefälle und 34 Tests der wissenschaftlichen Zahlen.
- `npm run build`: bestanden. Vite meldet weiterhin den großen Haupt-Chunk (rund 329 kB gzip); dies ist keine gemessene iPhone-Leistungsfreigabe.
- Echte Acht-Stunden-Simulation mit mehr als 32 Axiom-Resets: 1/3/96 gespeicherte Abschnitte stimmen bei Resetanzahl, Hardware, Zyklusuhr und RNG überein; wirtschaftliche Werte innerhalb relativer Toleranz 1e-10.
- Aktive V59-Forschungsarbeit über Migration, pausierte Schmiedearbeit, acht K10-Loadoutitems und historische Lizenzen sind ausdrücklich geprüft.

Maschinenlesbarer Beleg: [prestige-v2-verification.json](prestige-v2-verification.json). Lang laufende historische Funktionstests besitzen eigene Zeitlimits; ihre Assertions bleiben erhalten. Die Zahlen-Caches sind begrenzt und ändern keine gespeicherten Werte.

## Dateien zur weiteren Arbeit

`economy.ts` enthält Kataloge und Balancewerte. `progression.ts` berechnet die V2-Wirkungen, `progressionReset.ts` die Kauf-/Resettransaktionen und Agenten, `progressionWork.ts` die Restarbeit, Synthese und Pausierung, `progressionAutomation.ts` Wiederaufbau/Fusion. `progressionSave.ts` übernimmt und validiert Altstände. `ProgressionPanel.tsx` zeigt die neuen Bereiche, das Labor und die Automation; vorhandene Pixel-Atlanten werden weiterverwendet.
