# Auftrag 9A – Impulsrelais und Erkenntnisarchiv verbessern

## Basis und Ursache

AGENTS.md gelesen; Repository /workspace/Idle-game- / Kayza1708/Idle-game-, sauberer Arbeitsbaum. Frisch gefetchtes origin/main **721db56** enthält gemergten PR #76 (d9c649c). Neuer Branch `codex/relay-archive-improvements` gegen main; Vorgängerbranches unverändert, keine offene Abhängigkeit.

In diesem Ausgangsstand ignorierten die Spezialverbraucher Qualität/Level/Forge: `registerTap` multiplizierte immer mit 2; `intYieldFactor` addierte bei Archivbesitz immer 0,25. `itemImprovementHasEffect` schloss beide Kanäle ausdrücklich aus, sodass UI-Aufwertung/Schmiede/Fusion trotz vorhandener bezahlter Domainaktionen nicht sinnvoll bedienbar waren. Effektdarstellung war ebenfalls statisch. No-Items wurde von diesen zwei direkten Verbrauchern außerdem nicht geprüft; der zentrale Quote korrigiert dies für diese beiden Effekte.

## Kanonischer Vertrag

`specialItemEffectQuote(state,item)` in src/economy.ts ist rein und liefert S, kanonischen effektiven Wert/Referenzwert, Triggerintervall, potenzielle und im aktuellen Kontext angewendete Werte, active und futureIncomeOnly. Er wird von Domain, Improvementquote, Itemdetails, Equipmentdarstellung und Export verwendet.

**S = kanonischer Effektwert / kanonischer Effektwert derselben Instanz als Common, Level 0, Forge 0 im selben Zustand.** Beide Seiten verwenden `itemEffectFor` sowie dieselbe bereits vorhandene deep-Manufacturing-Beitragsregel. Gemeinsame Kontextverstärker stehen auf beiden Seiten des Quotienten und kürzen sich; es wird kein weiterer Manufacturing-/Synergie-/Qualitäts-/Level-/Forge-Multiplikator auf die Belohnung angewendet. Seltenheitsabhängige vorhandene `itemScalingMultiplier`-Terme bleiben über den kanonischen Helfer wirksam. Es gibt keine zweite Formel für Qualitätsfaktoren oder Itemkurven. Common-Level-0-Forge-0 hat S=1; gleiche gemeinsame Verstärker werden nicht doppelt gezählt. Duplizierte relay/int-yield-Einträge höherer Itemprofile erzeugen keine Mehrfachanwendung.

- **Relais:** genau jeder zehnte tatsächlich vergütete manuelle Tap; Bonus = `creditRateScientific(..., now, false)` × **2×S Sekunden**. `temporary=false` erhält den bisherigen Begriff regulärer passiver Rate ohne aktive Creditboost-/Overclock-Zuschläge. Taps selbst behalten ihre bisherigen Vergütungs-/Umsatzregeln. Zähler ausschließlich im ausgerüsteten wirksamen Relais, einmal pro vergütetem registerTap. Bonusbuchung, Autobuyer und Offlineproduktion erzeugen keinen zusätzlichen Tap/Trigger. No-Taps oder No-Items erhöhen den Relaiszähler nicht. Bereits vorhandener Instanzzähler bleibt bei Wechsel/Reload/Prestige/Axiom erhalten; Fusion erzeugt wie bisher eine neue Instanz mit Zähler 0.
- **Archiv:** genau ein bestehender kompatibler Research-Slot, Beitrag **0,25×S** zur bestehenden additiven Run-Einnahmengewichtung. Keine neue Stapelung. `addCreditsScientific` liest den neuen Faktor nur bei einer **neuen berechtigten Buchung**. Itemwechsel oder Verbesserung rechnet weder alte Einnahmen noch beanspruchte INT neu; Rewards/Startkapital bleiben ausgenommen. Kein Credit-/Data-Multiplikator.
- Wirkungen nur für tatsächlich vorhandene und kompatibel ausgerüstete Instanzen; No-Items → angewendete Werte 0. Potenzielle Werte bleiben für Vorschau sichtbar und werden als derzeit inaktiv gekennzeichnet. Quotes erzeugen keine Events, Reservierungen, RNG oder Zustandsänderung.

Keine Änderungen an Preisen, Rezepten, Drops, Slots, Hardware, Forschung, Prestige-/Axiomformeln oder anderen Items. Kein Saveformatwechsel. Verbesserungen verwenden unverändert itemImprovementPreview→upgrade/forgeItem; Kosten und Ergebnis werden erneut beim Klick geprüft. Fusion behält genau drei eindeutige ungeschützte gleichartige/gleichqualitative Instanzen, konsumiert sie und erzeugt den bestehenden nächsten Rarity-Level-0-Forge-0-Vertrag. Ausgerüstete/gesperrte Zutaten bleiben geschützt, bestehende Kosten-/Instanzbestätigung bleibt erhalten.

## Vorher/Nachher an wenigen vorbereiteten Zuständen

[Zahlenprotokoll](special-item-comparison.json), Reproduktion Node 22: `npx vite-node --script scripts/special-item-comparison.ts`. Dies sind **vorbereitete technische Zustände, keine natürliche Progressionsmessung**. Account/Materialien sind vorbereitete Testressourcen; Items werden mit vorhandenen Domainaktionen angelegt/ausgerüstet, jede gezeigte Aufwertung/Schmiede regulär bezahlt. Basiskontext ohne Hardware-/Verstärkerextras. Vorherwerte stammen aus den festen Verbrauchern des geprüften Ausgangscommit 721db56, nicht aus einer nachgebauten Kauf-/Economysimulation.

| Zustand | Relais vorher | Relais jetzt | Archiv vorher | Archiv jetzt |
|---|---:|---:|---:|---:|
| Common, Level 0, Forge 0 | 2 s | **2 s** | 25 % | **25 %** |
| Common, Level 0, Forge 1 | 2 s | **2,24 s** | 25 % | **28 %** |
| Uncommon, Level 1, Forge 0 (eine bezahlte Aufwertung) | 2 s | **2,714 s** | 25 % | **33,925 %** |
| Uncommon, Level 1, Forge 1 | 2 s | **3,03968 s** | 25 % | **37,996 %** |
| Rare, Level 2, Forge 0 (zwei bezahlte Aufwertungen) | 2 s | **4,11264 s** | 25 % | **51,408 %** |

Archivbeitrag ist ein Anteil zur zukünftigen Einnahmengewichtung, kein direkt ausbezahlter INT-Bonus. Quote-/Upgradevergleich zeigt DE/EN tatsächliches Intervall/Bonussekunden bzw. Gewichtungsbeitrag, „nur zukünftige Einnahmen“, vorher→nachher. Potenzieller Wert unequip/No-Items wird als inaktiv markiert. Falls intern verschiedene Werte gleich auf zwei Dezimalstellen angezeigt würden, kennzeichnet der gemeinsame Vergleich ausdrücklich „gleiche gerundete Anzeige; intern kleiner Zuwachs“. Aktuelle reguläre Mindestschritte der beiden Items sind größer als diese Rundung; kein künstlicher kleiner Level-/Forge-Schritt eingeführt.

## Export und Reset-/Challengevertrag

Balancebericht und beide getrennten Haupt-/Challenge-Kontexte enthalten denselben aktuellen Quote, Zustand/Qualität/Level/Forge und wirksame Werte. Maximal 100 Spezialitem-Zeilen je Kontext, expliziter Omitted-Zähler. Keine Instanz-IDs, vollständigen Saves oder persönlichen Daten hinzugefügt. ZIP-, Filter-, Größenlimit-, Fortschritts- und Abbruchpfad unverändert. Ein Bestand ist keine Fundrate und der aktuelle Quote kein rückwirkender Verlauf.

Reload/Prestige/Axiom erhalten Items, Ausrüstung und Relaiszähler nach vorhandenem Vertrag. Axiom verliert normale INT-Nodes wie bisher, der Quote wird aus dem tatsächlichen neuen Kontext berechnet. No-Items-Challenge startet weiter getrennt ohne Hauptspielitems; gespeichertes Hauptspiel erhält seine Effekte nach Reload/Abbruch unverändert zurück. Keine Übertragung von Challenge-Ressourcen oder neu erfundene Accountboni.

## Tatsächliche Abnahme und Grenzen

- **6 Dateien / 92 Tests bestanden**, 2,90 s, maxWorkers=1/120-s-Prozesslimit: specialItems, existingMechanics, equipmentDialog, balanceExportContracts, saveValidation, sharedPreviews.
- Commonbasis, Qualität/Level/Forge-Quotient und Verstärker-/Profilduplikatschutz, bezahlte Vorschau→Transaktion→Export, Tap 10/20 einmal, unequip/No-Items/No-Taps/Autobuyer/offline, neue Archivbuchung versus alte/beanspruchte Werte, verbesserter Archivverbrauch, echte Challenge-/Hauptspielreloadtrennung, Reload/Prestige/Axiom, geschützte Fusion geprüft.
- Bestehender „unwirksame Spezialitems“-Test folgt jetzt dem ausdrücklich neuen Wirkungsvertrag; Equipmenttext-Assertion nennt vergüteten **manuellen** Tap. Keine Tests deaktiviert oder fachfremden Referenzen angepasst.
- Typecheck, Production-Build und git diff --check bestanden; Build 1,47 s, bekannte Vite-Hauptchunkwarnung 655,79 kB bleibt.
- Chromium **390×844 DE/EN**, beide Itemdetails, Upgrade-/Forge-Vorschau und tatsächliche bestätigte Verbesserung mit Data-/Komponentenabzug: bestanden, 11,84 s. ≥44-px-Aktionsbuttons, keine Seitenüberbreite/JS-Fehler. [Acht Screenshots und Protokoll](screenshots/special-items/results.json), `scripts/browser-special-items.py`. Browserfixture ausdrücklich vorbereitet, keine natürliche Progression. Vorhandene ItemArt-Zuordnungen unverändert, keine neuen Atlaszellen/Grafiken.

Keine Gesamtsuite, FAST/DEEP oder Tages-/Monatskampagnen. Commit `[skip ci]` vermeidet automatische pauschale CI-Langzeitläufe. Keine Langzeit-/Human-/Axiombalance bestätigt; bekannte Schicht-3-Referenzabweichungen und optionale Langzeitbewertung bleiben offen. Die zuvor als wirkungslos offene Relais-/Archivverbesserung ist mit dieser technischen Abnahme geschlossen.
