# Unity · vorbereitete Kaufverträge (Abschnitt 6a)

Fortsetzung nach [Gem-Angeboten/Gumball](unity-gems.md). Quelle: `src/commerce.ts`, `shopNative.ts`, `commerceSave.ts`, `CommerceOffers.tsx` und die zwölf Produktverträge aus `src/economy.ts`. Keine TS-Regeländerung, Storepreise, SDKs oder echten Käufe.

## Portierter Umfang

Alle drei ursprünglichen Seasonprodukte, Werbefrei-/Einnahmenpass, Starter-/Baumeister-/Laborpaket und vier Gemprodukte. Einmalige und wiederholbare Inhalte, originale Komponenten, drei seltene Starteritems, sichere Zahlen-/ID-Grenzen und transaktionsbasierte Wiederholungssperren. Restore erteilt nur dauerhafte Rechte und keine erneuten Verbrauchsgüter. Widerruf entfernt dauerhafte Rechte; bereits vergebene Verbrauchsgüter werden nach Quelle nicht rückwirkend entzogen.

Bestehendes `Rewards.owned/transactions` bleibt der gemeinsame Entitlement-/Transaktionsbestand. Season-Premium prüft dieses tatsächliche Eigentum. Der Einnahmenpass wirkt jetzt auf echte passive Einnahmen und den ursprünglichen Tap-Mindestbetrag; kein bloßes Anzeigelabel. Rechte bleiben bei Prestige/Axiomreset erhalten und werden nach Quelle in Challenges übernommen, während neue Commerceaktionen darin gesperrt sind.

`IShopNativeAdapter` und `IPurchaseVerifier` sind vorbereitete Schnittstellen. Beide Produktionsimplementierungen sind unverfügbar: keine Preise, keine signierten Belege, keine verifizierten Grants. `PurchaseService` akzeptiert nur zur Storeantwort passende Verifierausgaben und bestätigt Storetransaktionen erst nach dem erfolgreich dauerhaft gespeicherten Ergebnis. Savefehler lassen die Storetransaktion offen; erneute Lieferung ist durch Original-Transaktions-IDs idempotent. Erfolgreiche Anbieter/Verifier werden ausschließlich als Test-Doubles in der Testassembly verwendet.

`Forschung → Pakete & Vorteile` zeigt die nach Source verfügbaren Produkte, Inhalte, Einmalstatus und fehlenden Storepreis. Fremde Season-SKUs werden bis zur jeweiligen aktuellen Season nicht angeboten. Kaufknöpfe bleiben ohne Anbieter gesperrt. Wiederherstellen meldet den unverfügbaren Dienst ohne Gutschrift. Es gibt keine lokale Gratisaktivierung.

Unity-Saveformat 14 ergänzt den letzten Commercebeleg; native Vorgänger 1–13 behalten ihre Rechte, Claims, Gem-/Kapselgeschichte und unveränderte Migrationsoriginale. Kein historischer Kaufbeleg wird erfunden. Fehlende aktuelle Marker im Root oder Challenge-Hauptspiel sperren den Stand.

## Bewusst noch offen

Abschnitt 6b: zusätzliche Commerce-Werbebelohnungen für Gems/Drone/Forschung, Forschungsskip mit Gem-Bestätigung, übrige generische Werbelimits/Creditboost-/Komponentenpfade sowie der tatsächliche Werbefrei-Verbraucher dieser Pfade und von Markt/Kapsel. Das Recht selbst und seine Erhaltung sind bereits vorhanden; noch fehlende Verbraucher werden dadurch nicht als abgeschlossen markiert. SDKs, Serververifikation, echte Storepreise, Widerrufsabgleich am Gerät und Finish/Restore im echten Store bleiben spätere separat beauftragte Integration.

Vollständige Story/Sprachen/Einstellungen und Roh-JSON-/Webimport-/Recovery-/Diagnoseverträge bleiben 7/8. Der Erkenntnisarchiv-Erwerb bleibt unverändert als Quellproblem dokumentiert. Die breite Migrationsabnahme bleibt offen.

Tatsächliche Prüfergebnisse: [Prüfbericht](unity-purchases-verification.md).
