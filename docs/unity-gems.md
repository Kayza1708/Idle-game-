# Unity · Gem-Angebote und Gumball (Abschnitt 5c)

Quelle bleiben `src/economy.ts`, `gemShop.ts`, `capsuleMachine.ts`, `progressionWork.ts` und die tatsächlich ausgeführten Referenzfunktionen. Keine TypeScript-Spielregeln oder Balancewerte geändert. Reproduzierbarer, schreibgeschützter Export: `GemBalance.g.cs`, `npm run unity:check`.

## Tatsächliche Verbraucher

Alle 17 aktiven Gem-Angebote: fünf Materialfamilien, zwei bezahlte Zusatzlabore, drei dauerhafte Offlinekapazitäten, Laborbonus, zwei Modulherstellungs- und zwei Trainingsverkürzungen sowie beide direkten Komponentenpakete. Preise, Freischaltungen, Reihenfolge, proportional aufgerundete Zeitkosten und Bonusobergrenze stammen aus der Vorlage. Alte Alias-ID `components` kauft das Schaltkreispaket; `training-boost` bleibt wie dort ohne Wirkung.

Zusatzlabore erweitern die tatsächliche Forschungskapazität auf bis zu sechs. Serial-Science bleibt auf ein Labor begrenzt. Forschung nutzt den Laborbonus; die erste kostenlose Intro-Forschung bleibt davon ausgenommen. Das vorhandene TS-Verhalten bei Bonusablauf zwischen Zeitscheiben bleibt erhalten: keine neue Ablaufgrenze erfunden. Offlinekapazität verwendet das Maximum aus gekauftem Limit und Hardware-/Challengebonus, keine zusätzliche Multiplikation. Während einer Challenge bleiben Hauptspielbonus und Hauptspieljobs pausiert; der Challenge-Neustand erbt bezahlte Labore, jedoch nicht die gekaufte Hauptspiel-Offlinekapazität.

Zeitverkürzungen arbeiten auf dem aktiven bezahlten Modulauftrag beziehungsweise Training. Eine Fertigstellung startet den nächsten vorhandenen Auftrag nach den ursprünglichen Zahlungs-/Queueverträgen. Sofort hergestellte Items haben keinen zeitlichen Auftrag und werden nicht nochmals hergestellt.

Gumball: Freischaltung nach erstem Prestige, 10 Gems, ursprünglicher deterministischer Kampagnenseed oder injizierter Zufall, zugänglicher Itempool und aktuelle Materialfamilien. Itemfunde sind in der aktuellen Quelle immer gewöhnlich. Credits bleiben aus normalem Einkommen und INT-Berechtigung ausgeschlossen. Daten folgen ausdrücklich `addDataScientific`: Sie erhöhen auch den normalen Daten-Lifetimezähler. Gem-/Jackpotbelege, Ziehungs-ID, Limits und Videotransaktionen werden gespeichert. Wiederholung derselben Ziehungs-ID zahlt nichts erneut aus.

## Oberfläche / Schutz

`Forschung → Gems` öffnet Upgrades, Zeit, Material und Gumball. Vorhandenes Aktionsprefab, Itemporträt, Komponentenbilder, Safe Area und Scrollnavigation bleiben in Verwendung. Ergebnisanzeige folgt erst nach erfolgreichem atomarem Save; sie vergibt nichts. Alte UI-Callbacks enthalten eine erwartete Kauf-/Ziehungsrevision, damit schnelle Wiederholung dieselbe Transaktion nicht verdoppelt. Ein bewusst neuer Klick nach Aktualisierung kann ein wiederholbares Angebot erneut kaufen.

Der Produktionsanbieter für Kapselvideos ist ausdrücklich unverfügbar. Ein gespeicherter Auftrag enthält Kontext, ID und Ablaufzeit. Fehler/Abbruch/Tabwechsel beseitigen den Auftrag ohne Belohnung oder Limitverbrauch. Ein nach Neustart offener Auftrag lässt sich abbrechen. Simulierte erfolgreiche Providerergebnisse existieren ausschließlich in Tests; keine SDKs oder echten Käufe.

Unity-Saveformat 13 ergänzt Upgrade-/Kapselzustand. Versionen 1–12 bleiben lesbar; unveränderte Migrationsoriginale werden vor dem ersten Schreiben gesichert. Keine historischen Ziehungen, Gemkäufe oder Gratisrechte erfinden. Aktuelle fehlende Marker und ungültige Verträge sperren den Stand. Vollständige Roh-JSON-Schemavalidierung, Alt-/Webimport einschließlich Legacy-Pity bleiben Abschnitt 8; JsonUtility allein ist keine vollständige Importvalidierung.

## Quellprobleme / verbleibender Umfang

Die gegenwärtige V2-Kapselmaterialtabelle ist gleichverteilt; Seltenheitsgrenzen ergeben deshalb nicht alle historischen Materialraritäten. Keine neue Pity-Regel ergänzen. Das Erkenntnisarchiv bleibt im normalen Erwerb unerreichbar; keine Ersatzfreischaltung. Die übrigen Werbe-/Kaufadapter und Entitlementverbraucher folgen in Abschnitt 6. Story, Sprachen, Einstellungen und vollständige Speicher-/Berichtsverträge bleiben offen. Keine natürliche Langzeitbalance- oder Geräteabnahme aus vorbereiteten Gemvorräten ableiten.

Prüfergebnisse und Grenzen: [Prüfbericht](unity-gems-verification.md).
