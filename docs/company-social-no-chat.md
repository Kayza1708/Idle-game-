# Company Community (ohne Chat): Profiles, Roles, Badges, Trading

Status: Backend-Entwicklungsstand, 22.10.2026. Keine Live-Migration, keine Unity-Menü-Freigabe.

## Eindeutige Produktentscheidung
**KEIN Chat. Keine Direktnachrichten. Keine freien Nachrichtentexte bei Trades.** Zusammenarbeit erfolgt über Research/Projekte, Einladungen, Spielerprofile und strukturierte Handelsangebote. Datenminimierung: keine E-Mails, echte Namen, Chatprotokolle oder kompletten lokalen Saves speichern.

## Rollen und Administration
CEO > Executive > Manager > Member. CEO kann Leitung atomar übertragen; alter CEO wird Executive, neuer wird CEO. Befördern/Herabstufen durch CEO, Executive kann Manager/Member ändern. Manager lädt ein und kann Member entfernen. Kein CEO darf sich selbst entfernen, ohne vorher die Führung zu übertragen. Einladungen speichern nur Company-ID, Spieler-ID, Sender-ID, Status und Ablauf (7 Tage); kein Nachrichtentext. Offene Punkte: Bewerbungen, Kick-Rejoin-Sperre, Audit-Log mit Löschfristen, Reporting/Appeal.

## Öffentliche und private Profile
Öffentlich sichtbar sind nur pseudonymer Anzeigename, Company (bei Mitgliedschaft) und aktiver Profilrahmen. ALLE weiteren Daten starten verborgen und sind einzeln optional: Spielzeit, höchster Compute, Prestige-Anzahl, INT, globaler Rang und Badge-Ausstellung. Maximal drei Badges werden ausgewählt. Private Aktivierungsoptionen bedeuten nicht, dass ungeprüfte Werte hochgeladen werden. Nur vom Server verifizierte Statistiken dürfen veröffentlicht werden; für die persönliche Unity-Welt ist dies noch NICHT implementiert. Deaktivierung löscht vorhandene optionale öffentliche Stats.

## Abzeichen: Bronze/Silber/Gold
Company-Beiträge: 1.000 RP = Bronze, 10.000 RP = Silber, 50.000 RP = Gold. Company-Founder Badge wird beim Gründen vergeben. Kategorien für Prestige, Challenges, Achievements, Hardware-Meilensteine und Trading sind im Katalog vorbereitet. Persönliche Badges sind erst nach serverseitiger Verifizierung freischaltbar; nie bloß durch beliebig manipulierte lokale Saves. Freigeschaltete Badges werden gespeichert, aber nur explizit ausgewählte Badges veröffentlicht.

## Profilrahmen
Basic: kostenlos. Founder: Company-Gründung. Bronze-/Silber-/Gold-Lab: RP-Meilensteine. Neon: 60 Gems, Quantum: 150 Gems (BEIDE NOCH NICHT KAUFBAR, solange die Haupt-Gem-Wallet lokal verwaltet wird). Singularity: exklusives Event. Der Server lässt nur Rahmen aus dem tatsächlich erworbenen Besitz ausrüsten.

## Handelsmechanik ohne Nachrichten
Handelsangebot aus Art, Asset-ID und Menge für Angebot und Gesuch. Nur dieselbe Company, nicht anonym außerhalb davon. Ein Angebot sperrt nachweislich serverseitig besessene Komponenten/Blueprints/Items in Escrow, max 10 offene Angebote, 3 Tage Gültigkeit. Akzeptieren tauscht atomar, Wiederholungen dürfen keinen Doppel-Loot erzeugen. Abbrechen oder Company-Verlassen gibt gesperrtes Inventar zurück. Es gibt NOCH KEINEN sicheren Weg, lokale Unity-Items in dieses Online-Inventar zu überführen. Deshalb ist echter Handel nicht freigeschaltet. Später: Server-Minting, Anti-Fraud, Ablauf/Cleanup, Gifts/Requests und Trading-UI.

## Minimal gespeicherte Daten
player_profiles: Frame und Privatsphäre-Schalter; player_badges: Kategorie/Stufe; profile_badge_showcase: bis 3 Einträge; owned_profile_frames: Besitz; optional public_player_stats: ausschließlich opt-in und vom Server bestätigte Werte; company_invitations: IDs/Status/Ablauf; trade_inventory: nur serverauthentifizierte Güter; company_trade_offers: feste Art/Mengen/Ablauf. Kein Messages-Table, kein vollständiges Spielerprofil, keine E-Mail. Datenschutz-Selbstauskunft und Account-Löschung vor Release implementieren.

## Technische Abnahme
- SQLite-Tests: Migration, Standardprivatsphäre, CEO-Übergabe, RP-Badges, Escrow und Double-Spend, Einladungs-Trigger.
- API-Tests: Profilfreigaben, CEO-Rechte, Einladungen, Ablehnung von local-save-Trades, kein Chat.
- Noch offen: sichtbare Unity-Menüs, E2E-Sicherheit aller Spielerstatistiken, vertrauenswürdige Gem-/Item-Bestände, Integrations-/Stresstests mit mehreren Nutzern, GDPR/DSGVO, Store-Sicherheit, echte iOS/Android-Abnahme. Kein Deployment oder Merge ohne Prüfung.

## Online-Gutscheine und spätere Freischaltung (22.10.2026)
Backend-Migrationen 0005–0008 enthalten ID-basierte Anträge, echte serverseitig berechnete RP-Rankings, pseudonyme eindeutige Namen, 500-Gem-Founder-Debit und verifizierte Gutscheintransaktionen. Company-Mitgliedschaft bleibt hinter einem zunächst **lokalen** 1.000-INT-Meilenstein und einem noch fehlenden sicheren Online-Freischaltnachweis. Es gibt zwei Ticketbestände: lokale Kisten-/Season-Funde (nicht übertragbar) und verifizierte Company-Voucher (übertragbar per serverseitigem Escrow). Diese dürfen **nicht** anhand von manipulierten lokalen Spielständen zusammengeführt werden. Öffentliche Companyranglisten sind ohne Registrierung lesbar; Spielerranglisten zeigen nur freigegebene Anzeigenamen/Ränge. Vor dem Einsatz am Nutzer: Unity-Login, Remote-Migrationsabnahme, Namens-Backfill, sicheres Wallet-Bridging und DSGVO-Auskunft/Löschung.
