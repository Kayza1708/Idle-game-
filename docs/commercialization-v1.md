# Kommerzialisierung V1

## Im Spiel implementiert

Der Shop hat acht obere Reiter. Unter **Pakete** stehen alle vorbereiteten Store-Produkte, unter **Upgrades** zusätzlich die beiden dauerhaften Pässe. **Belohnungen** enthält freiwillige Videos für Gems und Drohnen-Credits. Die Drohne ist außerdem unter der Werkstatt erreichbar. Keine erzwungenen Videos, Banner, erfundenen Europreise oder simulierten Kaufabschlüsse.

| Angebot | Inhalt | Wiederholung |
| --- | --- | --- |
| Werbefrei-Pass | Alle bestehenden Kisten-/Gumball-Videos und neuen Gem-/Drohnen-/Laborvideos ohne Video beanspruchen. Gleiche Limits und Cooldowns. | Dauerhaft, einmalig |
| Einkommen-Pass | Passive Credits, Taps einschließlich Mindest-Tap und Offline-Credits ×2. Der Faktor gilt auch bei ausgeschalteten temporären Boosts. | Dauerhaft, einmalig |
| Starterpaket | 300 Gems, 120 Schaltkreise, 80 Kupferspulen, je ein Rare-Quantenchip, Rare-Speicherkristall und Rare-Feldscanner, jeweils Level 1 | Einmalig |
| Baumeisterpaket | 1.200 Gems, 300 Schaltkreise, 200 Kupferspulen | Wiederholbar |
| Laborvorrat | 600 Gems und 200 Schaltkreise; Gems können für Laborabschlüsse und Boosts eingesetzt werden | Wiederholbar |
| Gem-Pakete | 100 / 550 / 1.200 / 2.600 Gems | Wiederholbar |

Die drei Starter-Items passen in die drei bereits geöffneten Grundformen und werden nicht automatisch ausgerüstet. Die Paket-Inhalte sind garantiert. Kein zufälliger Echtgeld-Itemkauf. Materialpakete eröffnen keine Forschungsgebiete oder Materialfamilien. Pässe und gekaufte Inhalte bleiben bei normalen Prestiges und Axiom-Resets erhalten.

## Freiwillige Belohnungen und Labor-Skips

| Aktion | Belohnung / Preis | Begrenzung |
| --- | --- | --- |
| Gem-Video | 10 Gems, mit Gem-Ledger-Eintrag | 5 pro UTC-Tag |
| Versorgungsdrohne | 300 Sekunden Credit-Basisproduktion, beim Start des Angebots festgehalten; temporäre Boosts ausgeschlossen | 12 pro UTC-Tag, 10 Minuten Cooldown nach Auszahlung |
| Laborvideo | Bis zu 600 Sekunden Restzeit des ausgewählten Forschungsauftrags | 6 pro UTC-Tag über alle Labore gemeinsam |
| Labor sofort abschließen | 2 Gems pro verbleibender Minute, auf ganze Gems aufgerundet | Aktiver Auftrag, ausdrückliche Bestätigung, Geld nur bei gültigem Job und Preis abbuchen |

Alle Werte liegen in `BALANCE.commerce` und `BALANCE.adLimits` in `src/economy.ts`. Tageswechsel verwenden UTC, die gespeicherte Tagesnummer kann nicht rückwärts laufen. Offline-Zeit erzeugt keine gestapelten Drohnenansprüche. Es gibt weder eine neue Drohnenwährung noch einen dauernden Popup-Zwang.

Drohnen-Credits verwenden den wissenschaftlichen Ressourcen-Ledger auch oberhalb 1e308. Sie zählen nicht als regulär verdiente Credits für den INT-Anspruch. Der Einkommen-Pass erhöht dagegen die echte Produktion und damit mittelbar den INT-Ertrag; er multipliziert eine andere Belohnung nicht ein zweites Mal.

Neue Gem-/Drohnen-/Laboranfragen haben einen gespeicherten, einmaligen Beleg mit zehn Minuten Gültigkeit, Kampagnen-/Prestige-/Axiomkontext und gegebenenfalls konkreter Job-ID. Abbruch, SDK-Fehler, abgelaufene oder falsche Belege verbrauchen keine Quote. Ein nach Neuladen verwaister Videobeleg wird in der App ohne Belohnung aufgehoben. Werbefrei verwendet dieselbe Abrechnung. Challenges blockieren Käufe und externe Belohnungen; dauerhafte Einkommensrechte gelten im Challenge-Lauf weiter, wie andere permanente Boni.

Forschungs-Skips verändern die tatsächliche Restarbeit und schließen Aufträge über die bestehende Abschlussfunktion ab. Sie beschleunigen weder andere Labore noch die Nachfolger in der Warteschlange. Ebenso korrigiert: Crafting-Zeitkäufe speichern echte Arbeit; der nächste einzelne Crafting-Durchlauf bekommt einen frischen Arbeitsvertrag. Trainings-Zeitkäufe erhöhen beim Integrationstraining den korrekten Level und melden den Abschluss an die bestehenden Geräteeffekte. Zusatzlabore erkennen den aktuellen Prestige-Knoten F01. Der Save akzeptiert bis zu sechs Laborplätze insgesamt (reguläre und gekaufte); der alte starre Vier-Labore-Check wurde für V2 korrigiert.

## Native Integration: vorbereitet, noch nicht live

`App` akzeptiert `rewardedAdProvider`, `nativeShop` und `purchaseVerifier`. `src/main.tsx` übergibt absichtlich keine aktiven Anbieter. Die UI bleibt ohne Store-Metadaten und ohne vollständige Kauf-/Verifikations-/Abschlussbrücke deaktiviert. Geldpreise kommen ausschließlich aus `products()` des echten Stores.

`src/shopNative.ts` ist die aktuelle Schnittstelle; Der ungenutzte Vorgänger `nativeCommerce.ts` wurde bei der Bereinigung entfernt.

1. Store-Produkte mit den IDs aus `BALANCE.commerce.products` anlegen. Pässe und Starterpaket sind einmalig, die anderen Pakete Verbrauchsprodukte.
2. Native Store-Brücke anbinden: `products`, `purchase`, `restore`, `finish`. Unterbrochene, noch nicht abgeschlossene Kauftransaktionen beim nächsten Start erneut zur Verifikation und normalen Auslieferung anbieten. `restore` ist für dauerhafte Pässe vorgesehen und bezahlt keine Verbrauchsinhalte erneut.
3. Einen authentifizierten Backend-Verifier implementieren. Er prüft den signierten Beleg beim Store, App-/Produktzugehörigkeit, Eigentümer, Originaltransaktion, bisherige Auslieferung und aktuellen Widerrufsstatus. Raw Receipts und lokale Save-Dateien sind keine Zahlungsnachweise. `verifyStoreResults` akzeptiert nur zur erhaltenen Store-Transaktion passende Produkt-/Transaktions-IDs.
4. Die App schreibt die bestätigte Gutschrift atomar in den aktuellen Spielstand und fordert einen dauerhaften Save an. Erst nach dessen Erfolg ruft `persistAndFinishPurchases` die native `finish`-Methode auf. Bei Speicherfehler oder fehlerhaftem `finish` muss dieselbe Transaktion erneut zugestellt werden. Lokale Transaktions-IDs verhindern eine zweite Auszahlung.
5. Backendseitige Auslieferungsbestätigungen und noch offene Verbrauchskäufe über Geräte-/Save-Wechsel hinweg abgleichen. Ein bereits ausgezahltes Starterpaket darf auf einem neuen Gerät keine zweite Verbrauchsgutschrift erzeugen. Dieser serverseitige Besitz-/Auslieferungsspeicher ist noch nicht implementiert.
6. Store-Widerrufe für permanente Pässe als `VerifiedPurchase.status='revoked'` einspielen; die Laufzeitrechte werden entfernt. Bereits verbrauchte Gems oder Starter-Items werden lokal nicht rückwirkend eingezogen. Server-/Supportverfahren dafür vor Release festlegen.
7. Rewarded-Ad-SDK mit tatsächlichem Abschlussereignis anbinden; Abbruch/Fehler dürfen niemals `success` liefern. Datenschutz-/Consent- und Plattform-Konfiguration sowie echte Sandbox-Käufe, Wiederherstellung, Offline-Recovery und iPhone/WKWebView-Abnahme bleiben Release-Arbeit.

Noch keine echten Zahlungs- oder Werbe-SDKs hinzugefügt. Keine Transaktion wird im Browser als erfolgreich erfunden. Lokale Limits und Besitzdaten sind zum Spielen und Wiederladen implementiert; sie ersetzen keine serverseitige Autorität. Full Reset löscht lokale Rechte; Store-/Backend-Wiederherstellung muss vor einer Live-Veröffentlichung verfügbar sein.

## Speicherdaten und Prüfung

Save v61 ergänzt `commerce`: Besitz, Transaktions-IDs, Tageslimits, Drohnen-Cooldown, offenen Videobeleg und letzte Gutschrift. v60 wird ohne erneute Prestige-Migration ergänzt; ältere unterstützte Spielstände durchlaufen weiter die bestehenden Migrationen. Ein beschädigtes v61-Commerce-Feld wird abgewiesen und niemals durch leere Kaufrechte ersetzt.

Automatisierte Tests prüfen unter anderem echte Produktionsverdopplung, Mindest-Taps, Offline-Produktion, beide Reset-Schichten, drei verwendbare Starterfamilien, Restores/Widerrufe, Kauf-/Video-Duplikate, Speicherfehler vor `finish`, Wiederholung nach Store-Fehler, wissenschaftliche Drohnen-Credits, Tageswechsel, Cooldown, Jobwechsel, Teil-/Voll-Skips und Save-Migration. UI-Prüfungen sind SSR-Vertragsprüfungen; keine Geräte- oder visuelle Abnahme wird damit behauptet.
