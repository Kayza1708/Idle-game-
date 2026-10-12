# Passive Rückkehr, zweiter Prestige und bezahlte Automation

Stand: 12. Oktober 2026. Basis: gemergter PR #92. Keine Balance-, Save-, Reward- oder UIänderung. Die Simulatorerweiterung ist ein optionaler synchroner Beobachter für den primären Spielstand; normale Aufrufe verwenden ihn nicht. Der Beobachter liest bezahlte Ereignisse vor ihrer Verdrängung aus der begrenzten Historie. Er darf den Spielstand nicht verändern oder aufbewahren; er beobachtet keinen separat laufenden Challenge-Hauptstand.

## Messvertrag

Zwölf natürliche Profile mit Seeds 1708/2026, regulärem Startbestand, echten Kosten/Claims und festem Chipbuild (Relais bis der Chip gefertigt ist). Hardware ausschließlich gegen Credits. Keine vorbereiteten INT, Geräte, Data oder Freischaltungen. Nur reale Online-Eingaben und ein Tap/s während Besuchen. Modell/Forschung zuerst, Qualitäts-/Effizienztraining abwechselnd; DataGeneration bis 2, ModelArchitecture bis 1, dann Blueprints. Dieser einfache Controller optimiert weder Prestigezeitpunkt noch komplette Forschungsportfolios.

Acht Rückkehrprofile vergleichen zwei INT-Kaufreihenfolgen:

- Fertigung zuerst: Einkaufsagent → Dataarchiv → Analyse → Fertigung → Labor → Trainingsplan.
- Queue zuerst: Einkaufsagent → Trainingsplan → Dataarchiv → Analyse → Fertigung → Labor.

Der Einkaufsagent kostet regulär 1 INT, der Trainingsplan **3 INT**, die vier frühen Basisnodes jeweils 1 INT. Kein kostenloses Auffüllen: bis zu zwei Trainingsjobs werden bei Besuchen eingeplant, beim tatsächlichen Start bezahlt. Der Controller wartet beim ersten unbezahlbaren Node; das ist eine deklarierte Kaufpriorität, keine Spielsperre.

Besuchsmuster:

| Profil | Besuchsstarts | Besuchslängen | Beobachtungshorizont | Onlinebudget |
|---|---|---|---|---|
| Häufig | 0, 1h, 3h, 6h | 10min, danach je 5min | 6h05 | 25min |
| Über Nacht | 0, 1h, 3h, 12h, 14h55 | 10min, danach je 5min | 15h | 30min |
| Aktiver Vergleich (4 Profile) | durchgehend | 2h | 2h | 2h |

Jede tatsächliche Pause nutzt **einen** `advanceTo`-Aufruf. Der bei Abreise gültige Offlinecap wird einmal angewandt; verlorene Zeit und Wallclock bleiben getrennt. Der achtstündige Cap wird nicht durch viele kleine Offline-Aufrufe erneuert. Automatisch bezahlte Käufe/Trainingsstarts werden an Simulatorgrenzen erfasst und per Ereignisreferenz dedupliziert; Dataausgaben werden gegen verbleibende, generierte und beim Reset verlorene Data abgeglichen. Aktive Eingaben bleiben sekündlich, Entscheidungen alle zehn Sekunden und exakt bei Rückkehr. Readiness/Unlockzeiten während Pausen sind Rückkehrbeobachtungen, keine exakten Offlinezeitpunkte.

Zweiter Prestige: maximal zwei Resets, mindestens 3 beanspruchbare INT, mindestens 15 Minuten im zweiten Run und keine aktive Analyse. Das ist ausschließlich Messpolicy, keine neue Spielregel. Die früheren Profile behalten standardmäßig ihre Zwei-Stunden-Grenze und einen Reset. Der neue Rückkehrmodus ist auf 15 Kalenderstunden und 30 Minuten Online-Eingaben begrenzt. Gemeinsames Laufzeitbudget 120 Sekunden, je Profil 30 Sekunden; tatsächlicher Durchlauf **49,33 Sekunden**. Keine Wochen-/Monatskampagne.

## Bestätigte Ergebnisse

| Profil | Erster Prestige | Zweiter Prestige | Chip | Training abgeschlossen | Season-XP |
|---|---|---|---|---|---|
| Häufig, beide Seeds/Reihenfolgen | Besuch bei 6h, +6 INT | nicht erreicht | nicht gefertigt | 11 | 5.000 |
| Über Nacht, beide Seeds/Reihenfolgen | Besuch bei 12h, +10 INT | nicht erreicht | nicht gefertigt | 15 | 5.900 |
| Aktiv, Fertigung zuerst | 47:30, +3 INT | 80:10, +6 INT | 60:10 | 33 | 6.900 |
| Aktiv, Queue zuerst | 47:30, +3 INT | 80:20, +6 INT | 60:10 | 33 | 6.900 |

- Bei kurzen Besuchen ist 1 INT beim 3h-Besuch beobachtet, 3 INT erst bei 6h/12h. Die Policy wartet ausdrücklich auf mindestens 3; diese Zeiten beweisen keinen optimalen ersten Prestigezeitpunkt.
- Die Pause 3h05 → 12h dauert 8h55: **8h Produktion, 55min verworfen**. Bei der späteren Pause 12h05 → 14h55 werden 2h50 vollständig angerechnet.
- Nach dem Nacht-Prestige kauft der aktivierte Einkaufsagent in dieser Pause **102 Hardwareeinheiten**, bezahlt aus Credits. Aktives Training plus zwei wartende Jobs ergeben drei Offlineabschlüsse; bei Rückkehr ist die Queue leer. Keine unbegrenzte Nachfüllautomation.
- Beide Nacht-Reihenfolgen können alle sechs Nodes bezahlen. Deshalb liefern sie dort keinen starken Buildkontrast. Beim 6h-Prestige kauft Fertigung zuerst fünf Basisnodes; Queue zuerst kauft Einkaufsagent, Trainingsplan, Dataarchiv, Analyse und hat noch keine Fertigung/Labor. Kein anschließender Offlineabschnitt im häufigen Profil: daraus lässt sich der spätere Queuevorteil nicht bewerten.
- Aktiv reichen die ersten 3 INT nach dem Einkaufsagenten nicht für den Trainingsplan. Queue zuerst wartet bis zum zweiten Reset und verschiebt die übrigen Basisnodes; beide erreichen schließlich 33 Trainingsabschlüsse. Zehn Sekunden Resetabstand sind kein belastbarer Vorteil. Am Ende sind 14–15 INT erneut beanspruchbar; der erklärte Zwei-Resetdeckel verhindert weitere Resets.
- Nachtprofile haben beim letzten Besuch erst 1 weitere INT; Blueprints werden bei 14h55 als abgeschlossen beobachtet, der Chip wird gelernt und die Module regulär begonnen. Der Chip ist bis 15h noch nicht fertig. Das ist eine konkrete Rückkehr-/Jobkette, kein Beweis fehlender Materialien.
- Tagesbonus in allen zwölf Profilen; **kein Wochen- oder Monatsbonus**. Wochenclaims 3 (kurz) / 5 (aktiv), Monatsclaims 3 (häufig) / 4 (Nacht/aktiv). Unterschiedliche Onlinebudgets/Horizonte erlauben keinen Effizienzvergleich zwischen diesen Mustern.
- Resetpreview protokolliert aktive Trainingsverluste und weiterlaufende Forschung. Save/Reload erhält Nodes, Wirtschaft, Training/Queue und Autobuyerflags. Beleg: `passive-return-profiles.json`, Prüfung: `passive-return-validation.json`.

## Entscheidung und nächste offene Abnahme

**Keine globale Balanceänderung aus dieser Stichprobe.** Der reguläre Offlinecap und die bezahlten Automationen arbeiten in diesen Verläufen korrekt. Die Warteschlange ist ein endlicher Besuchspuffer, kein eigenständiger Dauerbuild. Ihr früher Preis erzeugt einen echten Verzicht auf Basisnodes, aber diese Profile zeigen noch keinen ausgeglichenen langfristigen Nutzen. Ein pauschaler Rabatt oder automatisch unbegrenztes Nachfüllen würde diese Entscheidung ohne ausreichenden Beleg entfernen.

Nächster gezielter Block: identische kurze Besuche mit erstem Reset ab 1 versus 3 INT vergleichen; nach dem ersten Reset einen gleich langen Offlineabschnitt für beide Kaufreihenfolgen messen. Dadurch werden Wartepolicy und bezahlte Wiederaufbau-/Queuewirkung getrennt. Erst danach eine konkrete Anpassung an Preis, Freischaltung oder Rückkehrführung entscheiden. Anschließend echte zusätzliche Buildslots und gleiche Forschungsfreiheit für drei Buildstrategien prüfen.

Unkalibriert: zweiter passiver Prestige jenseits dieses Horizonts, Mid-/Late-Spiel, Wochen-/Monatsabschlüsse, Kalenderwechsel und längerfristige Season-XP. Keine Aussage über Retention, reale Geräteperformance oder neue Grafikqualität. Browser-/Geräteabnahme und übrige V1-Releasepunkte bleiben offen.

## Prüfung

Sechs neue Verträge: einmaliger Cap, exakt getrennte aktive Eingaben, begrenzte Horizonte/Policy, verhaltensneutraler Observer, unveränderter Eingabestand, reale einmalige Queuezahlungen. Zusätzlich die bestehenden Profiltests. Sourcehashes sowie vollständige Gem-/Quest-Season-XP-Buchungen der zwölf Profile abgeglichen; keine manuellen Aktionen außerhalb der Sessions, zwölf Reloads, maximale relative Data-/Tapabweichung 9,26e-15 / 2,60e-15.

Reproduktion: `npx vite-node scripts/passive-return-study.ts docs/passive-return-profiles.json`. Dies überschreibt ausschließlich das neue Messartefakt; historische Baselines bleiben erhalten.

Lokale Gesamtabnahme: **1.301 Standardtests**, App- und strikter CLI-Typecheck, Produktionsbuild und Diffcheck grün. Keine Browser-/Geräteabnahme.
