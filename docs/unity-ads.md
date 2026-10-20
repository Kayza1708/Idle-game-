# Unity · Werbe-/Skipverträge (Abschnitt 6b)

Quellen: `src/commerce.ts`, `ads.ts`, `shop.ts`, `capsuleMachine.ts`, `progressionWork.ts`, `simulation.ts`, `economy.ts` und vorhandene UI-Aufrufpfade. Keine Änderungen an TypeScript-Regeln oder Balancewerten. Produktionsanbieter weiterhin unverfügbar, keine SDKs oder vorgetäuschten Anzeigen/Käufe.

## Tatsächlicher Umfang

Gems mit ursprünglichem fortlaufendem Videozähler/Bonus, Creditdrohne mit eingefrorenem Betrag, Forschungszeit bis zur Quellgrenze, Tageslimits, Cooldowns, monotone Commerce-Tagesnummer, gespeicherte zeitlich begrenzte Tickets, Kontextwechsel- und Transaktionsschutz. Quellenwerte werden reproduzierbar nach `AdBalance.g.cs` exportiert. Gewinne aus Creditdrohnen zählen weder als normale Produktion noch für INT. Die generischen Alt-API-Pfade für Creditboost, Komponenten und Creditdrop sind ebenfalls portiert; Creditboost beeinflusst die tatsächliche Produktion, kombiniert sich nach V2 multiplikativ mit Overdrive und läuft an der ursprünglichen Zeitgrenze ab.

Der aktuelle Webshop hat für die generischen Altangebote Creditboost/Komponenten keine Aktion. Die Unity-Oberfläche kennzeichnet sie ausdrücklich als vorbereitete Altangebote und verwendet ihre vorhandenen Regeln statt neue Beträge/Quoten zu erfinden. Tickets vor dem Anbieteraufruf, Abbruch, Fehler und Antwortwiederholung bleiben geschützt. Der generische Creditdrop bleibt als API-Vertrag geprüft; die erreichbare Drohnenoberfläche benutzt den aktuellen Commercevertrag.

Forschungsskip gegen Gems: Vorschau mit Auftrag, Restzeit und aufgerundetem Quellpreis; gesonderte Bestätigung prüft dieselbe Auftrags-ID und denselben Preis erneut. Nur der aktive konkrete Auftrag wird verkürzt beziehungsweise abgeschlossen. Wartende unbezahlte Forschung startet nach der Quelle bezahlt und berücksichtigt den vorhandenen Planungsitemeffekt. Bezahlte Aufträge bleiben beim Kapazitätsverlust erhalten; ein freier zulässiger Laborindex ist unabhängig von außerhalb der aktuellen Kapazität weiterlaufenden Aufträgen nutzbar.

`Forschung → Belohnungen / Forschung sofort abschließen` ist an echte Transaktionen gebunden. Markt und Gumball verwenden dieselben dauerhaften Werbefrei-Rechte. Ein tatsächliches Recht führt zu einem klar bezeichneten direkten Anspruch mit unveränderten Limits; es wird keine erfolgreich abgespielte Anzeige behauptet. Ohne dieses Recht liefert der Produktionsanbieter ausschließlich „unverfügbar“, ohne Belohnung oder Limitverbrauch. Verifier-/Anbietererfolge existieren nur als Testeingaben.

## Speichervertrag

Natives Saveformat 15 erhält Versionen 1–14 samt unveränderter Originalkopie, Gems, Rechte, Kapsel-/Shop-/Kaufhistorie und laufenden Jobs. Forschung erhält persistente Identität und Laborindex. Ältere native Jobs hatten keine gespeicherte Quell-ID: stabile `legacy-research-*`-Identitäten werden aus vorhandenen Auftragsdaten und Platz abgeleitet, ohne Arbeit, Zahlungen oder den gemeinsamen `nextId`-Zähler zu verändern. Neue Aufträge verwenden die ursprüngliche `research-{nextId}`-ID. Aktuelle fehlende Marker werden abgelehnt, nicht automatisch repariert. Tickets über Reload, falscher Kontext, Ablauf, falsche ID, Abbruch und Wiederholung werden getrennt geprüft.

Werbe-/Commercezeit wird bei einer Challenge nicht mit dem pausierten Hauptspiel verwechselt. Der zeitliche Creditboost des Hauptspiels bleibt pausiert; Challenge-Neustände erhalten wie in TypeScript Commercezähler/Rechte, aber keine aktive Hauptspielproduktion oder Creditboosts. Generische Werbequoten teilen die ursprüngliche Tages-/Transaktionsgrenze mit Kapselvideos.

Vollständige Story/Sprachen/Einstellungen folgen in 7, Rohschemavalidierung/Webimport/Recovery/Berichte in 8. Der Erkenntnisarchiv-Erwerb bleibt als separates Quellproblem ohne Ersatzregel dokumentiert. Echte Anbieter-, Server-, Store- und Geräteabnahme ist nicht Bestandteil dieses funktionalen Teilports.

[Tatsächlicher Prüfnachweis](unity-ads-verification.md).
