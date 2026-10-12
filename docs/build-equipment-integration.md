# Buildeinstieg und einheitliche Ausrüstung

12. Oktober 2026. Basis: gemergter PR #93 (`cc946a4`). Dieser Block schließt zwei konkrete Integrationslücken und macht drei Einstiegsstrategien regulär vergleichbar. Er erklärt **nicht** drei vollständige Midgame-Builds oder deren Langzeitbalance für fertig.

## Umgesetzt und begründet

**Ausrüstung benötigt die passende erworbene Kategorie.** Das UI und die Forschungsformel verwenden Prozessor → Kern → Forschung. Der bisherige Equipvertrag prüfte teilweise nur die belegte Gesamtzahl; so konnte ein Forschungsitem einen noch gesperrten Forschungsplatz umgehen. Andere Aggregatoren zählten sogar direkt zugewiesene inkompatible/gesperrte Referenzen. Jetzt verwenden generische Itemboni, Labore, Gerätetrigger, Spezialitems und Kombinationen dieselbe Eigentums-/Kategorie-/Sockelprüfung. `equipmentEligibility` blockiert gesperrte Kategorien auch dann, wenn ein anderer Platz leer ist.

Das ist eine Korrektur an den bereits gezeigten Kategorien, kein neuer Forschungsitembuff. Inventory bleibt bestehen. Historische gesperrte Referenzen bleiben im Save, wirken aber erst nach regulärem Erwerb ihrer Kategorie. Falsch zugewiesene Referenzen erzeugen keine Boni. Bereits verbuchte Einnahmen/INT werden nicht rückwirkend neu bewertet.

**Photonenfeld-Lernen kostet 4 statt 6 Fragmente.** Der erste regulär bezahlte Abschluss „Offene Baupläne“ gibt einmalig vier Fragmente. Bisher passte der Quantenchip in diesen Vorrat, das Trainingsitem nicht. Sechs Vorprofile mit identischer Forschungsfreiheit zeigten einen ausrüstungslosen Learningzweig im Zwei-Stunden-Horizont. Nun entscheidet der Spieler zwischen Chip und Photonenfeld für denselben Einstiegsvorrat. Wer eines lernt, kann mit diesen vier Fragmenten nicht auch das andere lernen. Kein zusätzlicher Grant, keine garantierten seltenen Funde.

Unverändert am Photonenfeld: Blueprints-Abschluss erforderlich; 20 Schaltkreise, 8 Kupferspulen, 12 Siliziumwafer, 6 photonische Linsen, ein bezahlter Compute-Bus und 1.200 Data; 900 Sekunden Fertigung. Der Quantenchip benötigt weiter seine eigenen Materialien/Module, 1.800 Data und vier Lernfragmente. Sämtliche späteren Rezept-/Upgrade-/Forgepreise bleiben unverändert. Balanceparameter ausschließlich `src/economy.ts`; die geschützte Vorgängerprojektion erlaubt nur genau diese Änderung 6 → 4. Ein eigener Test lässt andere Werte/Rezepte nicht durch diese Ausnahme.

**Ausrüstungsvorschau zeigt echte Buildfolgen.** Zusätzlich zu Credits/Compute/Data zeigt sie die nächste Datazahlung für Quality/Efficiency sowie den Laborfaktor bei Forschungsstart. Trainingseffekte reduzieren die Data-Kosten, **keine Trainingszeit**: Training arbeitet nach der bestehenden Formel mit Rate 1. Forschung friert ihren Faktor beim bezahlten Start ein; laufende Endzeiten ändern sich beim Wechsel nicht. Neue Vorschautexte in DE/EN/ES/FR/PT/IT/PL. Kein zusätzliches Menü und kein neuer Savestatus.

## Drei Strategien und ihre Entwicklung

| Strategie | Regulärer Einstieg | Späteres Zielset aus bestehenden Items | Nutzen und echter Nachteil |
|---|---|---|---|
| Aktiv / Sammeln | Impulsrelais, kein Fragment-Lernpreis; erste Hardwareanalyse schaltet dessen Rezept frei | Relais + Speicherkristall + Feldscanner | Jeder zehnte bezahlte Tap erzeugt den bestehenden Burst; Material-Mapping verstärkt Analysen. Früher günstiger Einstieg und Sammelfokus. Ohne Taps kein Burst; seltene Zutaten/zusätzliche Kategorien nötig, geringere direkte Produktion im vorbereiteten Vollset. |
| Produktion | Quantenchip: vier Fragmente | Chip + Tensor-Kern + Datenprisma | Compute, Users/Credits und Data wachsen; Parallel Architecture liefert ×1,20 Compute, zusätzliche Effektkombinationen bei passender Rarität. Verzicht auf Relaisbursts und starke Learning-/Laborboni; höherer Material-/Blueprintbedarf für das volle Set. |
| Training / Forschung | Photonenfeld: nun vier Fragmente | Photonenfeld + Logik-Saat + Labordrohne | Training-Data sparen, Learning Pipeline +0,50 im Kostenbonus, Forschung über Labordrohne/seltene Logik-Saat und Training-Research-Link. Keine direkte Computeverstärkung im frühen Set; feste Trainingszeiten bleiben, Forschung kann weder Gratisjobs noch rückwirkend schnellere alte Jobs erzeugen. |

Das dritte Set entsteht schrittweise: Logik-Saat kostet weiterhin sechs Fragmente und seltene Materialien; die Labordrohne zehn Fragmente plus ihre echten Materialien einschließlich eines Quantenkerns. Alte Komponenten/Module bleiben deshalb relevant. Gezielte Materialbeschaffung und weitere Forschungs-/Blueprintfortschritte sind erforderlich; der Jackpotanteil wird nicht wegdefiniert.

Erster Prozessorplatz nach erstem Prestige; Kern durch Fertigung I (1 INT) oder 1e9 Credits. Forschungsplatz durch die reguläre Fertigungskette bis Fertigung V (tiefenabhängige Kosten bis 10.000 INT) oder 1e20 Credits. Diese späteren Anforderungen werden hier **nicht** gesenkt. Die sechs frühen Profile erreichen Fertigung I regulär, also zwei Plätze; sie besitzen noch nicht die Materialien/Baupläne für die vollständigen Kernsets und beweisen den dritten Platz nicht. Es wäre falsch, einen technisch vorbereiteten Forschungsplatz als natürliche Freischaltung zu präsentieren.

## Mathematik, Kosten und Resetvertrag

Training: `DataCost = ceil(BaseDataCost / (1 + SummeKostenboni))`, mit dem bestehenden Mindestfaktor. Learning Pipeline liefert +0,50 in der Summe; Gegenwert hängt von anderen Boni und Rundung ab. Nicht pauschal „50% billiger“. Bestehende Trainingsdauer- und Levelkurven unverändert.

Forschung: vorhandener logarithmischer Laborfaktor aus tatsächlich angewandten Quellen, mit bestehender Mindestzeit von 60s und einmaligen temporären Startfaktoren. Keine neue Forschungsgeschwindigkeitsrückkopplung. Rare-/Legendary-Zusatzeffekte und Synergien folgen den bestehenden Effektgewichten.

Normaler Prestige behält Inventar, gelernte Baupläne, erworbene Plätze und Forschungszugänge. Er setzt das Modell zurück und storniert aktive/vorgemerkte Trainings nach vorhandenem Vertrag; bezahlte Forschung/Crafting läuft weiter. Axiom behält die bereits erworbenen Plätze und Items, entfernt die normalen Nodes nach vorhandenem Vertrag. Main-/Challenge-Inventare und ihre Ressourcen bleiben getrennt. Keine neue Saveversion nötig: Form/Validierung der gespeicherten Felder unverändert. Früher für das Photonenfeld ausgegebene sechs Fragmente werden nicht rückwirkend erstattet; historisch bezahlte Jobs/Claims werden nicht neu berechnet.

Automation: keine automatische Itemauswahl oder kostenlosen Käufe. Equipwechsel bleiben Spielerentscheidung. Bestehende bezahlte Queue/Directorstarts verwenden die tatsächlich passende Ausrüstung. Die Messpolicy ordnet während Onlineentscheidungen feste Zielitems zu und kauft gemeinsame Node-/Researchprioritäten; sie wird nicht als neue Spielautomation installiert.

## Natürliche Gegenmessung

Je sechs Profile vor/nach dem Lernpreiswechsel, Seed 1708, kontinuierlich 0/3 Taps/s, 2h, höchstens zwei echte Resets. Zielsets unterscheiden die Craftpriorität; **gleiche** Forschungsfreiheit: gleiche zugängliche/bezahlbare Liste, Repeatables bis 3 und gleicher Nodepfad inklusive ComputeNet I. Realisierte Jobs/Endstände dürfen wegen Ressourcen-/Zeitentscheidungen abweichen. Keine vorgegebenen Items/Slots/INT, keine Shop-/Ads-/Saisongrants. Null Taps bedeutet weiterhin manuelle Einkäufe/Jobs/Claims und sichtbare Drops, nicht Abwesenheit.

| Einstiegsitem | Fertig bei 0 Taps/s | Fertig bei 3 Taps/s | Early-Equipment nach 2h |
|---|---|---|---|
| Relais | 22:40 | 22:20 | Relais |
| Chip | 62:30 | 58:30 | Chip |
| Photonenfeld vorher | nicht gefertigt | nicht gefertigt | leer |
| Photonenfeld jetzt | 72:30 | 68:30 | Photonenfeld |

Finaler Durchlauf: 55,94s unter gemeinsamem 90s-Budget, 20s je Profil. Vorlauf: 50,00s. `three-build-integration-before.json` und `three-build-integration-profiles.json` besitzen separate Quellhashes. Der Vorlauf enthält bereits die korrigierte Socketprüfung, aber noch den Lernpreis 6; er ist **keine** Gegenmessung des gesamten alten Spiels.

Alle sechs finalen Profile: sieben Forschungs- und 31 Trainingsabschlüsse, gleiche sieben erworbene Nodes. Der neue Trainingszweig spart Data, erzeugt in dieser Data-reichen Zeit aber keine zusätzlichen Abschlüsse. Die konstante Trainingsdauer erklärt dies. Bezahlte vollständige Kern-/Forschungssets und langfristiger Nutzen an Datawalls bleiben ungemessen. Frühe Endbestände sind keine isolierten Produktionsfaktorvergleiche.

Prüfung: Sourcehashes, alle Gem-/Quest-Season-XP-Buchungen, Data-/Tapabgleich, Reload und ausschließlich Online-Handlungen. Maximale relative Data-/Tapabweichung 5,98e-15 / 1,54e-15. Rohdaten/Prüfbeleg: `three-build-integration-validation.json`.

## Vorbereitete Formelkontraste — ausdrücklich nicht natürlich verdient

`build-effect-quotes.json` vergleicht gleiche Hardware/Modellwerte, drei vorbereitete erworbene Kategorien, Rare Lv0 ohne Forge. Technische Items wurden nur für diese statischen Kopien erzeugt. Kein Live-Save, keine Kampagne oder Timingbehauptung.

| Vollset | Passive Credits relativ zur nackten Kopie | Training-Datafaktor | Laborfaktor |
|---|---|---|---|
| Aktiv/Sammeln | 1,158 | 1,000 | 1,000 |
| Produktion | 1,869 | 0,907 | 1,000 |
| Learning | 1,000 | 0,551 | 1,323 |

Bei einem konstanten Modell ohne Overclock und ohne laufende Käufe ergibt der amortisierte Drei-Tap-Kontrast weiterhin mehr Einkommen für das Produktionsset als für das Relais-/Sammelset. **Damit ist kein konkurrenzfähiger später reiner Tapbuild bewiesen.** Der aktive Zweig hat frühen Zugang und Sammelsynergien; spätere Burst-/Overclockgeräte, Raritäten und echte Materialwalls müssen gezielt verglichen werden. Wir erhöhen den Relaisbonus nicht blind aus einer vorbereiteten Kopie. Auch der Learningvorteil ist erst bei knappem Data/Forschungszeiten wirtschaftlich sinnvoll, nicht als unmittelbarer Creditgewinner.

## Abnahme und verbleibende V1-Arbeit

Zehn neue Verträge: gesperrte/leere Kategorien, Eigentum und inkompatible Referenzen, gemeinsame Geräte-/Aggregatprüfung, historischer Reload, reale Equip-/Kosten-/Laborvorschau, eingefrorene Jobs, exklusiver Vier-Fragment-Einstieg, enge Balanceausnahme und natürliche Policy ohne Grants. Ältere reine Effekttests erhalten ausdrücklich erworbene Kategorien in ihren technischen Fixtures; ein alter `utility`-Fixturekey wird zur tatsächlichen Kategorie `research`. Die ursprünglichen Effekt-/Kostenassertions bleiben erhalten.

Noch offen: natürlicher dritter Platz, vollständig gefertigte Midgame-Sets, späterer aktiver Build gegenüber Produktionskombos, Learningnutzen an echten Datawalls sowie Browser-/Geräteprüfung. Diese Punkte stehen weiter in der V1-Agenda. Nächster eigenständiger Implementierungsblock: den bislang nur vorbereiteten Bonuskistenablauf vervollständigen. Weitere Contentmenüs sind keine Voraussetzung für diese Reparatur.

Reproduktion: `npx vite-node scripts/three-build-integration-study.ts docs/three-build-integration-profiles.json`; vorbereitete Zitate separat: `npx vite-node scripts/build-effect-quotes.ts docs/build-effect-quotes.json`.

Lokale Gesamtabnahme: **1.313 Standardtests**, App- und strikte CLI-Typechecks beider neuer CLIs, Produktionsbuild und Diffcheck grün. Keine Browser-/Geräteabnahme.
