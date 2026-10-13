# Echte Bonuskisten — V1-Ablauf

12. Oktober 2026. Aufbau auf dem Ausrüstungsblock aus Draft-PR #94. Implementiert: Tagesbonus verdienen → Kiste im Inventar → gespeicherte Materialfamilie wählen → genau einmal öffnen → konkreter Empfangsbeleg. Kein Login-/Timergenerator, keine zusätzliche Währung und kein Werbe-/Kauf-SDK.

## Zweck, Freischaltung und Kosten

Die Kiste verbindet Tagesmissionen mit gezielter Materialbeschaffung und einer seltenen Bauplanentdeckung. Sie ersetzt **nur das bisher sofort gebuchte Materialpaket des Tagesperiodenbonus**. Einzelmissionspakete sowie Wochen-/Monatsbonuspakete bleiben direkt. Gems und Season-XP unverändert; der Tagesbonus liefert weiter seine normalen Gems und 200 XP.

Nach dem ersten bezahlten Hardwarekauf ist mindestens die Basisfamilie zugänglich. Ein regulärer Tagesbonusabschluss und dessen Claim verdienen eine Kiste. Ohne zugängliche Materialfamilie gibt es wie zuvor kein Materialpaket; der normale Bonus wird trotzdem gebucht. Keine nachträglichen Kisten für historische oder bereits beanspruchte Boni. Keine Kiste nur für das Öffnen des Spiels.

Die Familie wird beim Öffnen aus den **beim Verdienen bereits zugänglichen** Familien gewählt. Neue Hardwarefreischaltungen erweitern alte Kisten nicht rückwirkend. Ein Öffnen kostet weder Credits, Data noch Gems; Kosten bestehen in den regulären Missionshandlungen. Alle Hardware bleibt ausschließlich gegen Credits kaufbar.

| Materialfamilie | Inhalt eines vorhandenen Pakets |
|---|---|
| Basis | 4 Komponentenarten, je 12 |
| Halbleiter | 5 Arten, je 8 |
| Photonik | 5 Arten, je 6 |
| Frontier | 4 Arten, je 3 |
| Quanten | 2 Arten, je 1 |

Die bestehende Paketmenge wird beim Verdienen im Receipt gespeichert. Jede Wahl gewährt genau ein Paket; keine Kombination aller Familien. Der normale Default ist die bisherige höchste zugängliche Familie, der Spieler kann zugunsten älterer Zutaten abweichen. Zielgerichtete Pakete sind garantiert; der zusätzliche Bauplanfund ist es ausdrücklich nicht.

## Zufall, Baupläne und doppelte Claims

Der bestehende zentrale Boxgrant wird für reale, eingefrorene Receipts erweitert. Die Bauplanchance bleibt **1%** (`BALANCE.blueprintDropChance`). Beim Verdienen wird ein reproduzierbarer Hash aus Campaign-ID und Tagesperiodenschlüssel gerollt. Das Resultat und der damals zugängliche unbekannte Bauplan werden gespeichert. Öffnen hat kein neues RNG und berücksichtigt keine späteren Freischaltungen. Keine Zufallsquelle in Render, kein Reload-Reroll.

Ein Bauplanfund entdeckt einen zugänglichen erweiterten Bauplan, **lernt ihn nicht kostenlos**. Ist er beim späteren Öffnen bereits entdeckt/gelernt, wird der gespeicherte Treffer zu einem Fragment. Bei einem Treffer ohne damals verfügbaren unbekannten Bauplan wird direkt ein Fragment vorgemerkt, entsprechend dem bisherigen zentralen Discovery-Fallback. Kein garantierter seltener Materialwurf und kein neuer Itemgrant.

IDs, Earned-/Openedzähler und Pendingliste bilden den Vertrag `earned − opened = pending.length`. Die tatsächliche Tagesbonusclaimmarkierung und `lastDailyKey` verhindern erneutes Verdienen desselben Tages. Öffnen entfernt das Receipt im selben Domainzustand wie der Grant. Ein zweiter Klick/erneuter Aufruf derselben ID bewirkt nichts. Keine unbeschränkte Liste früherer Claims nötig.

Der deterministische lokale Wurf ist eine Offline-Idempotenzregel, **kein serverseitiger Manipulationsschutz**. Die 1%-Chance ist bestehende Konfiguration, nicht in einer Langzeitspielkampagne empirisch kalibriert. Bei 30 verdienten Kisten wären unter einer unabhängigen 1%-Modellannahme durchschnittlich 0,3 Treffer zu erwarten; unterschiedliche reale Accounts/Perioden und Inhalte wurden hier nicht über Monate gemessen.

## Lager und Automation

Maximal 32 ausstehende Kisten. Bei vollem Lager öffnet sich ausschließlich die **neu verdiente** Kiste automatisch mit der höchsten bei ihrem Verdienen verfügbaren Familie. Ältere Auswahlmöglichkeiten bleiben erhalten, der Empfangsbeleg kennzeichnet den automatischen Vorgang. Keine passive Kistengenerierung, keine unbegrenzte Öffnen-Schleife, kein zusätzlicher Autoplayer.

Kann eine Menge nicht sicher in den bestehenden Ganzzahlbestand gebucht werden, bleibt ein manuell geöffnetes Receipt unverbraucht. Bei vollem Lager und nicht buchbarem neuem Overflow wird der **gesamte Tagesbonusclaim** unverändert zurückgegeben; es werden weder Gems/XP gebucht noch die Bonusmarkierung gesetzt. Damit entsteht kein ungültiger 33er-Save und keine verlorene Belohnung. Diese numerische Grenze ist ein Vertragsfall, keine gemessene natürliche Progressionswall.

## Save, Reset und Challenge-Isolation

Save v52 enthält `bonusBoxes`: Earned/Opened, höchstens 32 Pendingreceipts, letzten Tageskey und einen tatsächlichen letzten Öffnungsbeleg. Choicefamilien, positive begrenzte Paketmengen, bekannte IDs, Zeitwerte und konsistente Zähler werden validiert. Aktuelle v52-Saves müssen die Felder besitzen. Beschädigte oder inkompatible Saves bleiben nach dem bestehenden Storagevertrag unangetastet.

Migration v51 und älter ergänzt ausschließlich leere Kistenfelder, auch rekursiv im isolierten Challenge-Hauptstand. Laufende Quests, historische Bonusclaims, Gems, XP, Materialien und Jobs werden nicht umgeschrieben. Keine retroaktive Kiste. Normale Prestiges und Axiom behalten Kisten und Receipts durch die vorhandenen Statepreservation-Verträge.

Challenge-Starts haben ihr eigenes leeres Kistenlager. Main-Pending liegt nur in `challengeSession.main`. Domainaktionen blockieren Öffnen/Verdienen, solange eine Challenge aktiv ist; Abort/Return und Reload behalten das Mainlager. Der Balanceexport zeigt Main-/Challengebesitz separat, Saveexport enthält die vollständigen Receipts. Neue Ereignisse `bonus-box-earned`/`bonus-box-open` werden in der bestehenden begrenzten Historie mit tatsächlichem Inhalt protokolliert.

Öffnen, Missionsclaim und Bonusclaim gehen jetzt in den unmittelbaren bestehenden Savepfad/SaveCoordinator. Weitere Domainoperationen und Economy-Ticks bleiben wie bisher. Es werden keine Zahlungs-/SDKtransaktionen hinzugefügt.

## Oberfläche

Der Tagesbonus erklärt seine Kiste und bietet bei Pendingkisten einen Weg ins Inventar. Dort steht eine kompakte Kistenkarte unter dem normalen Inventartitel: Menge, beim Verdienen eingefrorene Familienwahl, 1%-Chance und Öffnen. Buttons mindestens 44px; Text kann umbrechen. Das tatsächliche letzte Paket und ein gegebenenfalls entdeckter Bauplan/Fragment bleiben als Empfangsbeleg sichtbar. Kein Popup, kein separates Kistenmenü und kein leerer Startplatzhalter. Texte DE/EN/ES/FR/PT/IT/PL; bestehende lokalisierte Komponentennamen. Öffnen nutzt vorhandenen Belohnungssound/Haptik.

## Nachweis und Grenzen

15 neue gezielte Tests: echter Bonusclaim, kein unverdienter Claim, exact-one Öffnung/Reload, eingefrorene Familien/Rolls, Discovery statt Lernen, Duplicatefallback, Lagergrenze und numerischer Rollback, normale/Axiom-Resets, Challenge/Return, rekursive Migration, strenge v52-Validierung und Korruptsave-Erhalt, alle sieben Sprachen, Auditkontexte. Zusätzlich ein **natürlicher 600-Sekunden-Verlauf** über den regulären Controller: normaler Start, bezahlte Hardware/Jobs, echte generierte Quests/Claims; eine verdiente Pendingkiste, kein vorbereiteter Materialgrant. Die anderen technischen Grenztests verwenden ausdrücklich vorbereitete Zustände und beweisen keine Spieltimings.

Historische natürliche Profile bleiben Artefakte ihrer ursprünglichen Quellhashes. Der aktuelle Controller erfasst Kisten in Reload-/Endzuständen, öffnet sie aber nicht automatisch. Neue Messungen müssen eine deklarierte Öffnungsstrategie verwenden, wenn Materialverfügbarkeit verglichen wird.

Nicht geprüft: Browser-/Geräteabnahme dieser neuen Karte, reale Speicher-/Appabbruchläufe auf Geräten, Monatsbelohnungsökonomie und Farm-/Retentionquoten. Keine Veröffentlichung oder SDKintegration. Nächster V1-Block: Rückkehr-/Freischaltungsführung und Mobileabnahme der vollständigen Abläufe; Midgame-/Buildbalance und Releaseintegration bleiben offen.

Lokale Gesamtabnahme: **1.328 Standardtests**, App-/Node-Typecheck, Produktionsbuild und Diffcheck grün. Keine Browser-/Geräteabnahme.
