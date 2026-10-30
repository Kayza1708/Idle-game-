# Unity Online / Analytics / LiveOps – überprüfbarer Auslieferungsstand

Stand: 30.10.2026 · Native Unity V3, Cloudflare Worker/D1 in `cloudflare/company-api`.

Diese Anweisungen sind **keine Behauptung eines produktiven Deployments**. Ohne echte Geräteprüfung, SDK, Account-Identitätsprovider und aktivierte Cloudflare-Bindings bleibt die Unity-V3 vollständig offline spielbar. Keine lokalen Credits/INT/Gems/Items werden online als verifiziert behandelt.

## Statusmatrix

| System | Technisch enthalten | Tatsächlicher Launch-Blocker |
| --- | --- | --- |
| Apple-Identität | natives Apple-Plugin, Challenge/Nonce, Worker verifiziert signierte JWS/JWKS gegen konfigurierte Audience; tokengebundene 30-Tage-Session im iOS-Keychain | Apple Services-ID/App-ID, Capability, signierter iOS-Player, echter Provider-Test |
| Google OpenID | serverseitige Google-JWKS-Audience-/Nonce-Verifikation und OAuth-Konto-Verknüpfung | echter Google-Login-/ID-Token-Provider auf dem Android-Gerät (ohne SDK derzeit kein Button) |
| Google Play Games | optionaler Unity-Adapter mit Android-Define `IDLE_GOOGLE_PLAY_GAMES`; Server tauscht Einmal-Authcode mit geheimem Web-Client aus und prüft `games/v1/players/me` | offizielles Play Games Services v11 Unity-Paket, Play Console OAuth-Konfiguration, nativer Compile/Test |
| Sitzungsspeicher | iOS Keychain, Android Keystore und nur volatil im Editor; Bearer-Token niemals im Unity-Save/PlayerPrefs | provisionierte Builds, reale Ablauf-/Widerrufstests |
| Companies / Handel / Ranglisten | Cloudflare Worker/D1, serverseitige Uhr, Trigger/RP, Escrow, max. fünf bestätigte Transfers/UTC-Tag, Rate-Limits, Blockierungen und Löschung | 1.000 INT **nicht serverseitig verifiziert**: Companymitgliedschaft/Gründung absichtlich gesperrt. Nur nach Einführung serverautoritärer Progression freigeben |
| Spielerinventar | Unity-Item-, Gem-, Voucher-, Prestige- und Axiom-Systeme | lokale Bestände manipulierbar; niemals ungeprüft in Server-Gems, Handelsitems oder Gutscheine konvertieren |
| Cloudsave | vorhandene iCloud/GameKit-Anbindung mit ausdrücklicher Vorschau & Originalkopie | Google Play Games Saved Games unter Android **noch nicht eingerichtet**; Test auf signiertem iOS-Device |
| Analytics | Opt-in, erlaubte 18 Ereignistypen ohne PII/Token, max. 48 Offline-Events im atomaren lokalen Journal, idempotente D1-Eingänge, 30-Tage-Löschung; D1/D7-Aggregat | reale Consent-/GDPR-Prüfung, echter HTTPS-Worker, Testsession auf iPhone/Android |
| Crashdiagnostik | lokaler begrenzter Crash-Journal-/Heartbeat-Nachweis, optional nur Zählerevent `app_crash` | keine extern geprüften symbolizierten Crash-Stacks / Crashlytics-Installation |
| LiveOps | `/v1/liveops` UTC-Metadaten, Wartung/Min-App-Version, servergesteuerte Saisonstart-/Endzeiten, D1-Überlappungstrigger | Remote-0012-Migration, tatsächliche Operator-Freigabe, kein Server-Rewards-Grant |
| Native Unity-Katalog | 25 freigegebene C#-Datenblobs mit SHA-1-Git-Objektmanifest, 42 Items/60 Prestige-Nodes/24 Axiome, unabhängig vom Node-/Vite-Build kompilierbar | **keine vollständige behavioral-parity- oder Unity-Player-Zertifizierung**, 23 alte Referenzfixtures weiterhin nötig |

## Konfiguration (nur lokal/provisioniert, keine Secrets committen)

Der existierende Worker verwendet `cloudflare/company-api/wrangler.jsonc` und eine vorhandene EU-D1-Datenbank. **Keine neue D1-Datenbank erstellen**, keine migrations- oder schemaändernde Remote-Aktion ohne Freigabe.

Server-Verifikationsparameter:

- `APPLE_CLIENT_IDS`: kommaseparierte Apple Service-/Bundle-Audiences
- `GOOGLE_CLIENT_IDS`: kommaseparierte Google OAuth Client-IDs
- `IDENTITY_HASH_PEPPER`: ein langer, eindeutiger geheimer Schlüssel; nicht clientseitig speichern oder später unbedacht wechseln (sonst Konto-Zuordnung ändern)
- `GOOGLE_PLAY_GAMES_SERVER_CLIENT_ID`: öffentlicher Webserver-OAuth-Client
- `GOOGLE_PLAY_GAMES_SERVER_CLIENT_SECRET`: ausschließlich Worker-Secret, niemals Unity-Konfigurationsasset
- `ANALYTICS_ADMIN_TOKEN`: nur für den Admin-Zugang zu aggregierter Telemetrie, nicht in einer mobilen App
- Cloudflare-Bindings `DB`, `GUEST_SIGNUP_LIMIT`, `AUTH_RATE_LIMIT`, `NAME_CHECK_LIMIT`, `TELEMETRY_RATE_LIMIT`, `COMPANY_CREATE_LIMIT` wie in `wrangler.jsonc`

Beispiel zum **interaktiven lokalen Einspielen** eines Worker-Secrets:

```sh
cd cloudflare/company-api
npx wrangler secret put IDENTITY_HASH_PEPPER
```

Die Befehle lesen den Wert verdeckt ein. Keinen Secretwert in Git, Logs, GitHub Actions-Variablen oder Unity-ScriptableObjects eintragen. Ein Server-/Admin-Token darf weder in der Konsole noch in Chatnachrichten geteilt werden.

In `IdleIntelligence/Assets/IdleIntelligence/Resources/OnlineServicesConfiguration.asset`: `cloudflareApiUrl` auf die **eigene HTTPS-Worker-Adresse** setzen, ggf. öffentliche Apple-/Google-Client-IDs zuordnen. Standard ist bewusst leer/offline. Niemals ein Bearer-/Refresh-/Web-Client-Secret dort eintragen.

## Lokale Prüfungen ohne Remote-Schreibzugriff

```sh
cd cloudflare/company-api
npm install --no-audit --no-fund
npm test
python3 -m unittest discover -s test -p '*_test.py'
npm run db:local
npm run dev
```

Separat `GET http://127.0.0.1:8787/v1/health`, `GET .../v1/liveops` gegen den **lokalen** Worker prüfen. Rate-Limits sind nur mit korrekt konfigurierten Bindings testbar; lokale Wrangler-Erfolge nicht mit echter Edge-/D1-Staging-Last verwechseln. Tests auf Doppel-Claims, verbotene IP-/Token-Felder, Kontolöschung, Trade-Escrow und das Blockieren unsignierter lokaler Ressourcen wiederholen.

**Remote-Deployment und Remote-D1-Migration nur nach gesonderter Freigabe:**

```sh
cd cloudflare/company-api
npm run db:remote
npm run deploy
```

Vorher DB-Backup/Recovery testen und `0011`/ `0012` auf einem isolierten Staging-DB prüfen. `0012` verbietet überlappende aktive Saisonintervalle, benachbarte UTC-Zeitfenster sind erlaubt. Neue Saisonmetadaten werden nur durch authentifizierte Operator-SQL-Migration/Administrationsweg geschrieben; es gibt absichtlich keine öffentliche Saison-Reward-API.

## Analytics & Retention-Interpretation

In Unity unter **Einstellungen → Onlinekonto · Datenschutz** die Nutzungsstatistik ausdrücklich aktivieren/deaktivieren. Ohne Einwilligung keine Uploads und keine gespeicherten Telemetriebelege. Bei Widerruf werden bestehende Warteschlangen samt Tempdatei verworfen. Events sind keine echten Kaufbelege: `iap_verified`, `ad_reward` oder `prestige` bleiben technisch vom Client gemeldet und dürfen niemals als Zahlung oder serverseitige Handelsberechtigung akzeptiert werden.

Das Admin-Aggregat `GET /v1/admin/analytics?days=7` (mit serverseitigem Admin-Bearer) liefert Anzahl an Ereignissen, Session-Starter und `onlineAccountCohortRetention.day1/day7`: **nur explizit zustimmende Onlinekonten**, die an ihrem UTC-Erstellungstag ein Session-Start-Ereignis gesendet haben, und nur vollständig vergangene D1-/D7-Folgetage. Das ist **keine** Install-Retention, kein ARPDAU und keine Stichprobe aller Nutzer. Keine Nutzer-ID oder Rohlogs im Admin-Aggregat.

## Unabhängiger Unity-Katalog / Entfernung des Webclients

`.github/workflows/unity-native-standalone.yml` testet die C#-Spielregeln, den vollständigen 25-Blobs-Katalog und das 120-Minuten-Bezahlprofil einmal **nachdem `src/`, `scripts/`, `public/` und Root-npm-Dateien aus dem temporären CI-Checkout verschoben wurden**. Danach läuft derselbe Test erneut und archiviert die CSV. Keine Quellcode-Löschung erfolgt durch diesen Test.

Damit ist die **Core-/Standalone-Buildunabhängigkeit** prüfbar. Bevor `src/`, die Root-npm-Dateien, Capacitor und alte Exporter endgültig entfernt werden: Unity Editor-Import/Compile, EditMode+PlayMode-Volltest, alle 42 Item-/Handels-/Saison-Pfade, Lokalisierung, Store-/Ad-Integrationen, Android/iOS-Geräteplayer, Release-Asset-Lizenzen und Unity-Referenzfixtures eigenständig abnehmen. Nicht einfach 23 große `ReferenceCases.json`-Dateien löschen.

Aktueller PR-Zustand und tatsächliche CI-Runs sind auf GitHub zu prüfen; bestandene .NET-Tests sind kein Ersatz für Google-/Apple-SDK-Import, Replay-/Netzwerk-Stresstests oder Geräte-Playtests.
