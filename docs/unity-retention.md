# Unity: Erfolge, Laborziele und Profil

Funktionaler Zwischenabschnitt 3b, 19.10.2026. Branch `codex/unity-rewrite`, Folge-Draft #133. Abschnitt 3 und der Gesamtrewrite bleiben offen: Missionen/Perioden und ihre Season-/Bonusbox-Abhängigkeiten folgen als Nächstes. TypeScript und Balance bleiben unverändert.

## Tatsächlich angeschlossen

- Alle 37 Achievementfamilien und sämtliche Originalstufen: Fortschritt aus den echten Lifetime-/Industrie-/Challenge-/Inventarverbrauchern, unabhängige Stufenberechtigung, einmalige Claims, Gems, AP und persistierter Gem-Ledger. AP wirken auf die V2-Einnahmen nach `achievementProduction`; dadurch auch auf den tatsächlichen Tap-Ertragsrahmen. Der alte separate Research-Bonushelfer besitzt im aktiven V2 keinen Verbraucher und wird nicht als neuer Bonus eingeführt.
- Alle zwölf statischen Langzeit-Challenges mit den Originalbedingungen und einmaligen Sternen. Hardware-Mastery verwendet die tatsächlichen persistenten Kauf-XP. Die beiden Seasonbedingungen benötigen noch den Season-Produzenten aus Abschnitt 4; vorbereitete Season-Historien prüfen die Domaintransaktion, ersetzen aber keinen natürlichen Erwerbsweg.
- Acht ursprüngliche Onboarding-/Laborziele mit den Originalbedingungen und Claims: Credits zählen nicht als anspruchsberechtigtes INT-Einkommen, der Quantenchip entsteht einmal als echtes Item, Schaltkreise werden mit Materialstatistik vergeben. Keine Vorgängerpflicht oder automatische Belohnung beim Anzeigen.
- Profil mit validierbarem Spielernamen, einmaliger erster KI-Namenswahl, vorhandenen informativen Nachrichten und dauerhaftem Gelesenstatus. Das alte `claimMailbox` ist in TypeScript ein No-op; Unity erfindet keine Postfachauszahlungen.
- Der gemeinsame Namensfilter übernimmt die vorhandenen Listen, reservierten Namen, Dekorationen, Wiederholungen, Unicode-Normalisierung und feldabhängigen Längen. Quellen und vollständige Namensfilter-/Unicode-Lizenzen sind im Profil lesbar und im Player-Ressourcenbestand enthalten.

Die Ansichten verwenden das bestehende Aktionskarten-Prefab und gemeinsame UI-Bausteine. Transaktionen laufen im unabhängigen Kern und werden vor dem UI-Wechsel atomar gespeichert. Alte Callback-Referenzen können denselben Claim nicht nochmals auszahlen; fehlgeschlagene Saves nehmen die unbestätigte Zustandsänderung zurück.

## Play-Anleitung

`IdleIntelligence/Assets/Scenes/IdleIntelligence.unity` öffnen und Play starten. Unter **Forschung → Profil · Achievements / Laborziele / Post** stehen vier tatsächlich bedienbare Ansichten. Erreichte Achievementstufen bzw. Laborziele direkt auf ihrer Karte abholen. Die Liste ist scrollbar. **Langzeit-Challenges** zeigt die zwölf Bedingungen und lässt erfüllte Ziele einmal abholen. **Profil und Postfach** bietet die Namensfelder, Gelesenaktionen sowie **Namensfilter · Quellen und Lizenzen**.

Für einen frühen echten Claim Hardware kaufen: Die erste Hardware-Achievementstufe und die zugehörigen Einführungsziele werden über dieselben Kaufereignisse erfüllt. Der KI-Name kann genau einmal gewählt werden; spätere KI-Umbenennung wird nicht erfunden. Vollständige Mira-/Prolog-/Tutorialführung bleibt Abschnitt 7; bestehende Unity-Tutorialzustände bleiben erhalten.

## Speicher und Modelllevel

Unity-Save v8 erweitert v1–7 mit Wallet, AP, Claim-IDs, Gem-Ledger, Profil/Namen, Postfach, Onboarding sowie dem ausdrücklich gespeicherten Modelllevel. Alle bisherigen Ressourcen, Items, Ausrüstung, bezahlten Jobs, Meta-/Prestige- und Challenge-Felder bleiben erhalten. Originaldateien werden vor Migration bytegleich kopiert. Bei alten Unity-Ständen ohne Wallet/Claims gibt es keine geschätzten historischen Belohnungen; das neue Wallet beginnt dort mit null. Ein frisches Spiel erhält den tatsächlichen TypeScript-Anfangsbetrag von 50 Gems. Vorhandene Lifetime-Zähler aus v7 bleiben erhalten.

Das zuvor abgeleitete Modelllevel wird nun unabhängig gespeichert und bei Trainingsabschlüssen erhöht. Normales Prestige mit T08 erhält es; normales Prestige ohne T08 und Axiomreset setzen es zurück. Für ältere Unity-Saves wird ausschließlich die damals vorhandene aktuelle Summe der drei Trainingsstufen übernommen. Fehlende neue Pflichtfelder im aktiven Hauptspiel-/Challengevertrag und unbekannte Namenspolicy-Versionen werden abgewiesen. Kein automatischer Webimport. Vollständiger Import/Export, Recovery-UI und die verbleibenden strikten Feldverträge sind weiterhin Abschnitt 8.

## Unicode-Port und Prüfumfang

Mono wich bei mathematischen Schriftzeichen und Großschreibung in Zusatzebenen von JavaScript ab. Unity verwendet deshalb aus der tatsächlichen JavaScript-Laufzeit erzeugte Normalisierungs-, Kompositions-, Zeicheneigenschafts- und Kleinschreibungsdaten (Unicode 16.0), mit reiner C#-Normalisierung. Es wurde keine externe Laufzeit oder SDK eingebaut. Alle 17.086 geänderten Normalisierungs-Skalarwerte sowie gemischte Sequenzen ergeben 18.094 gemeinsame NFKD-/NFKC-Fälle; zusätzlich 330 originale/adversariale Namensprüfungen.

935 gemeinsame technische Transaktionen prüfen alle Achievementstufen, tatsächliche berechtigte erste Claims, Duplikate, statische Challenges, die acht Einführungsbelohnungen, Namensgrenzen, erste KI-Wahl, Postfach, AP-Verbraucher, normale/Axiomresets und Challenge-Walletisolation. Diese teilweise finanzierten/vorbereiteten Zustände sind ausdrücklich keine natürlichen Fortschrittsnachweise. Insbesondere vorbereitete vollständige Season-/Itemhistorien stellen keine im aktuellen neuen Spiel bereits erreichbaren Erwerbswege dar.

48/48 EditMode- und 26/26 PlayMode-Tests sind bestanden; nach den letzten Präzisierungen zusätzlich 3/3 betroffene Finanz-/Unicode- und 4/4 Profil-UI-Tests. Die TypeScript-Suite mit 1.866 Tests, Typecheck, Build und reproduzierbarer Export bestehen. Separater finaler Unity-Import/Compile: Exit 0. Mobile 320/390/430-Editorbilder sind geprüft; finanzierte Teststände ausdrücklich markiert. Details stehen im [Prüfbericht](unity-retention-verification.json). Echte Geräte und Player-/Releaseprüfung bleiben offen.

## Weiterhin offene Abnahme

- Daily-/Weekly-/Monthly-Aufgaben mit 6/12/30 Zielen, UTC-Wechseln, Baselines, Ablauf-/manuellen Rewards und Season-/Bonusbox-Abhängigkeiten (Abschnitt 3c).
- Seasonfortschritt für die beiden statischen Seasonchallenges sowie Artefaktverbraucher (4).
- Aktive Drops und übrige Shop-/Monetarisierungsproduzenten (5/6); ihre Lifetime-Felder bleiben ohne künstliche Ereignisse.
- Vollständige Tutorial-/Mira-/Prologführung, sieben UI-Sprachen, Einstellungen, Audio/Haptik und Geräte-Schriftabdeckung (7).
- Expliziter validierter Webimport, bedienbare Recovery, Export/Rückkehr-/Diagnoseberichte und vollständige unbekannte Feldverträge (8).
- Erkenntnisarchiv-Neuerwerb bleibt im aktuellen TypeScript unklar. Die Stufen mit 30 gesammelten bzw. 30 selbst hergestellten Itemtypen erhalten keine Ersatzfreischaltung; technische vollständige Historien sind keine natürliche Erreichbarkeitsabnahme.
