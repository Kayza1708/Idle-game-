# Economy Phase 1

Alle abstimmbaren Zahlen stehen ausschließlich in `src/economy.ts`. UI, Simulation und Tests verwenden diese Funktionen ohne duplizierte Konstanten.

## Hardware

| Klasse | Basiskosten | Wachstum | Compute |
|---|---:|---:|---:|
| Taschenrechner | 10 | 1,15 | 1 |
| Einplatinencomputer | 180 | 1,15 | 12 |
| Heim-PC | 2.400 | 1,15 | 120 |
| Gaming-GPU | 32.000 | 1,15 | 1.200 |
| GPU-Rig | 450.000 | 1,15 | 12.000 |

`C_i(n)=b_i×r_i^n×d_i`. Bulk-Kosten verwenden die geschlossene geometrische Summe. Max-Kauf wird logarithmisch geschätzt und gegen dieselbe Bulk-Funktion korrigiert. Klassen werden bei 10 Einheiten der vorherigen Klasse entdeckt und bleiben sichtbar. Bei 10/25/50 Einheiten verdoppelt sich der Compute der Klasse jeweils. Das einmalige Run-Upgrade ab 15 Einheiten kostet `C_i(15)` und verdoppelt nur diese Klasse. Die alte globale 25-Block-Verdopplung existiert nicht mehr.

Gesamtcompute ist die Summe `n_i×p_i×M_i×U_i`, danach einmal multipliziert mit globalem Compute. Infrastruktur-Knoten sind eine additive, permanente Compute-Familie; ausgerüstete Compute-Items sind eine separate additive Itemfamilie und werden damit multipliziert. Klassen-Upgrades und Bestände werden beim Prestige zurückgesetzt, Entdeckungen bleiben.

## Einkommen, Training, Tap und Overclock

- `R_passive = 1,0 × H × 1,08^L × 1,04^L × G_prestige × G_achievement × G_credit × F_credit_temp`.
- `T_passive = 0,12 × H × G_prestige × G_training × F_training_temp`.
- Trainingsziel: `40 × 1,65^L`; Überlauf bleibt erhalten.
- Tap: `max(1; 0,20 × R_passive ohne temporäre Boni)`. Tap zählt als regulärer, prestige-berechtigter Umsatz.
- Overclock: 30 gültige Taps, eine Ladung, 15 Sekunden +100 % Credits und Training, 90 Sekunden Cooldown ab Aktivierung.
- Temporäre Boni addieren innerhalb des Kanals: Werbe-Credit + Overclock ergibt `1+1+1=×3`; Gem-Training + Overclock ebenso. Tap erhält keinen temporären Multiplikator.

Bonusfamilien: Prestige und Achievements sind permanent und bleiben; Modell- und Spezialisierungs-Credit/Training sind innerhalb ihres Kanals additiv; Items bilden je Effekt eine additive Familie; unterschiedliche Familien werden gezielt multipliziert. Der Prestigefaktor wirkt je einmal auf Credits und Training, nie zusätzlich auf Compute.

## Prestige

Nur passive Produktion und Taps erhöhen `lifetimeEligibleCredits`. Debug-, Auftrags-, Gem- und Werbe-Credits sind ausgeschlossen. `C(E)=floor(3×(E/13.000.000.000)^0,45)`, Anspruch ist `C(E)-prestigeEntitlementClaimed`. Der hohe kalibrierte Nenner folgt aus der stark beschleunigenden Fünf-Klassen-Economy; das aktive ROI-Profil erreichte den ersten Reset nach 24:41 Minuten. Erster Reset benötigt 3, folgende 1. Der Faktor bleibt `1+0,35×totalInsightEarned^0,7`.

KI-Assistent gibt +25 % im permanenten Creditkanal. Coding-KI setzt Preise auf ×0,90 und gibt +10 % Training. Forschungs-KI gibt +25 % Experimenttempo und +10 % Training. Die Wahl bleibt bis zum nächsten kostenlosen Wechsel beim Prestige.

## Forschung, Items und Aufträge

Das einmalige 60-Sekunden-Einführungsexperiment garantiert genau ein Common-Item. Kurze Experimente dauern 10 Minuten, geben 1/24 der Materialien und haben `p_lang/24`; Bruchteile aller Materialien werden gespeichert. Lange Experimente dauern 4 Stunden. Die beim Start berechnete Endzeit bleibt fest.

Beim Übertrag von Materialbruchteilen werden Werte, die höchstens 16 skalierte Maschinen-Epsilon von einer ganzen Zahl entfernt liegen, auf genau diese ganze Zahl normalisiert. Dadurch ergeben 24 kurze Experimente exakt dieselben Materialmengen wie ein langes Experiment, ohne echte Bruchteile wie `0,999` vorzeitig auszuzahlen. Die Regel bleibt bei aufgeteilten Simulationen deterministisch.

Acht accountweite Aufträge speichern Erfüllung und Claim getrennt. Creditbelohnungen erhöhen nur das Guthaben, niemals Produktionsumsatz, Achievement-Umsatz oder Prestige-Anspruch. Crafting-/Itemwerte bleiben wie in Alpha 0.2.

## Zeit und Migration

Offline sind höchstens 24 Stunden je tatsächlicher Abwesenheit erlaubt. Eine persistente Simulationsuhr hält Debug-Sprünge, Experimente, Boosts, Cooldowns und UTC-Perioden zusammen. Save v4 legt vor Migration ein Backup ab. Alte aggregierte Hardware wird konservativ vollständig auf Taschenrechner abgebildet; Metaressourcen bleiben erhalten. Historischer Formelanspruch wird mindestens auf bereits gewährte Erkenntnisse gesetzt, damit Migration keine alten Punkte erneut auszahlt. Nicht rekonstruierbare alte Credit-Herkunft wird nur konservativ als bisheriger Lifetime-Wert übernommen.
