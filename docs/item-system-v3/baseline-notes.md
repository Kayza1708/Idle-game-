# Unveränderte Vergleichsprofile: Umfang und Grenzen

Die JSON-Originale bleiben unverändert und werden vom jeweiligen Lauf atomar ergänzt. Quellenfingerabdruck: `f4a45250c30b8ed7490856a5b58983e1b85f24a457466d965476eabec0f0662b`; vollständiger identischer Inhalt aus Git `3436a08c` nachgewiesen. `simulateBalance` verwendet die echte aktuelle `economy.newGame`-/Domainimplementierung, keine Legacy-Testfactory. Die laufenden ursprünglichen Module und der eingefrorene Passivlauf verwenden denselben unveränderten Quellstand.

## Tatsächlich erfasst

- Aktives bestehendes Profil: alle neun angeforderten Zeitpunkte bis 90 Tage; 149 Prestiges, `invalid=false`. Der ursprüngliche Gesamtlauf ergänzt danach seine Passivprofile weiter; der getrennte Passivlauf ist bereits vollständig.
- Passives bestehendes Profil: alle neun angeforderten Zeitpunkte bis 90 Tage; 44 Prestiges, `invalid=false`, kein Timeout und keine Diagnosewarnung.
- 90 Tage passiv: 7.776.000 geplante Sekunden = 81.000 Sekunden Sitzungen + 7.695.000 Sekunden Abwesenheit. Davon werden 6.426.000 Offline-Sekunden angerechnet und 1.269.000 entsprechend den bestehenden Offlinegrenzen verworfen. Null Taps, 8.100 Entscheidungspunkte; keine manuelle Aktion außerhalb der Sitzungen.
- Seed1708, vorhandene feste Sitzungs-/Kauf-/Trainingsstrategie, keine Ressourceninjektion und keine echten Anzeigen oder Käufe.

## Noch kein vollständiger Abnahmenachweis

Die bestehende Strategie ist begrenzt: Sie simuliert keine vollständige Namenswahl/Mira-Führung, keine vollständige Rezeptlern-/Itemausrüstungssuche, keine Modellentwicklungsstrategie und wählt standardmäßig keine Axiomresetstrategie. Null Axiomzyklen in diesem Profil belegen deshalb keinen unerreichbaren Axiomreset. Die Profile belegen keine acht spezialisierten Loadouts, vollständige Tutorialerreichbarkeit oder optimale/langfristig ausgewogene Spielstrategie.

`diagnoseBalanceState` gibt in diesem unveränderten Quellstand teilweise den alten Prestige-Diagnosekatalog mit Legacy-Bezeichnungen/Preisen/Vorgängertexten aus. Diese Liste ist **kein** Nachweis für die aktuellen 60 Knotenpreise oder Kaufsperren. Maßgeblich sind `BALANCE.progression.nodes`, `BALANCE.progression.axioms` und die tatsächlichen Kauftransaktionen. Die Diagnose muss vor den erweiterten Nachherkampagnen gegen diese echten Kataloge abgeglichen werden; die alten Rohberichte werden dafür nicht nachträglich umgeschrieben.

Die bisher gespeicherten Wartezähler sind Strategieindikatoren, kein vollständig gemessenes Maximum „ohne sinnvolle bezahlbare Aktion“. Ein eigener entsprechender Beobachter und die vollständigen Vorher-/Nachher-, Modell-, Axiom- und Loadoutkampagnen sind weiterhin offen. Laufzeitangaben enthalten Mac-Unterbrechungen und sind keine CPU-/GPU-/Geräteperformance-Messung.

Keines dieser Profile bewertet die noch nicht vollständig aktivierte Item-/Prestige-V3-Balance. Die echte UI-, Save-Migrations- und Geräteabnahme bleibt separat.
