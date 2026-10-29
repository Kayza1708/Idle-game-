# Bestätigte Ergänzungen zur gemeinsamen V3-Spezifikation

## 29.10.2026 – Linearer INT-Einkommensbonus

Der Nutzer ersetzt den bisherigen dynamischen INT-Einkommensexponenten durch einen additiv gestapelten Bonus von10% pro verdientemINT des aktuellen Axiomzyklus. Auf ausdrückliche Rückfrage bestätigt: I05 und der Einkommensanteil von I10 erhöhen den Satz jeweils um6Prozentpunkte, also10/16/22%. I10 behält seinen gesonderten INT-Gewinnexponenten+0,03.

Neue Formel: `1 + cycleINTEarned × rate`. Beispielsweise10INT→×2 und100INT→×11 ohne die beiden Upgrades. AusgegebeneINT bleiben im verdientenZyklusledger; normalerPrestige erhält ihn. Der tatsächliche Axiomreset leert ihn. Keine exponentielle Verzinsung; auch sehr großeINT bleiben ScientificNumber.

Balancequelle ausschließlich `src/economy.ts`; ursprüngliche Auftragsdateien unverändert als historische Spezifikation erhalten. Diese Ergänzung ersetzt nur deren Einkommensexponenten-Vertrag (I05/I10/0,22), nicht INT-Gewinn, Kosten, Axiombonus oder andere Resetregeln. Normale64/24-Spielstände werden weiterhin erst nach vollständiger V3-Migration umgestellt.
