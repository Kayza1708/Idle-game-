# Idle Intelligence – Cloudflare Company API (V1 foundation)

This is a **non-deployed, non-production-ready** foundation for the Unity Company's multiplayer layer. It intentionally does **not** award local Gems, Gumball Tickets, items or components yet: the existing Unity inventory is currently authoritative only on the device. Granting server rewards into it now would enable save editing, duplicate grants and replay attacks.

## Included
- Cloudflare Workers API with D1 (no Supabase required)
- Server-generated guest player ID with 256-bit bearer secret (SHA-256 hash stored in D1, not the secret)
- Session rotation, 30-day session expiry
- Public Company search, creation, join, leave; 50-member capacity enforced in SQLite trigger
- Roles: CEO and member (manager role reserved for later administration)
- Research production: 100 RP per elapsed hour, 10 CT per hour, 24-hour offline cap; time from server only
- Infrastructure research increases RP earned by **every** member equally
- Company research tree, server-side RP debits and bounded personal bonus multipliers
- Company lifetime-RP leaderboard; seasonal competition is not implemented yet
- Unity C# transport component (currently not wired to visible menus)

## Cloudflare setup (do not enter secrets in the repository)
1. Register at https://dash.cloudflare.com/.
2. In a terminal, from the repository root:
   cd cloudflare/company-api
   npm install
   npx wrangler login
3. Create the D1 database in the European Union:
   npx wrangler d1 create idle-intelligence-companies --jurisdiction eu
4. Copy the resulting **database_id UUID** into wrangler.jsonc, replacing 00000000-0000-0000-0000-000000000000. Do not confuse this public database identifier with an API token.
5. Initialize local database:
   npm run db:local
6. Start local Worker:
   npm run dev
7. Test health:
   curl http://127.0.0.1:8787/v1/health
8. Once local verification is complete, explicitly approve rollout before using:
   npm run db:remote
   npm run deploy

D1 migrations are versioned in migrations/. Running db:remote affects the remote database, and deployment is not performed by this branch.

## Existing Cloudflare D1 database for this project (created 22 Oct 2026)

The EU-jurisdiction D1 database has already been created. Its public `database_id` is configured in `wrangler.jsonc`. **Do not run `wrangler d1 create` again**. The guest endpoint and Company-creation endpoint now have approximate Cloudflare rate-limit bindings; these do not replace anti-bot, server-side business quotas and account recovery requirements.

If `git switch` is blocked by local Unity documentation edits, **do not discard them**. Use a separate working tree:

```bash
cd ~/Idle-game-
git fetch origin
git worktree add --detach ../Idle-game-cloudflare origin/feature/cloudflare-companies-foundation
cd ../Idle-game-cloudflare/cloudflare/company-api
npm install
npm test
npm run db:local
npm run dev
```

This does not touch existing modifications in the primary checkout. In another terminal check `curl http://127.0.0.1:8787/v1/health`. Only the local database is migrated; the remote D1 service is **not live** until a separately approved deployment.

Security and monetization architecture: [Company commercial security specification](../../docs/company-commercial-security.md).

## API routes
- POST /v1/session/guest (no Authorization header) – returns player and accessToken
- POST /v1/session/rotate – returns a replacement accessToken; store the new one before discarding the old one
- GET /v1/me
- GET /v1/companies?q=neural
- POST /v1/companies – body {"name":"Neural Labs","tag":"NLS"}
- POST /v1/companies/{uuid}/join
- GET /v1/company
- POST /v1/company/leave – CEO must transfer leadership (not yet implemented) before leaving
- POST /v1/company/claim – server calculates earned RP and CT; calling twice gives no duplicates
- POST /v1/company/research – body {"nodeId":"computing"}; CEO or manager only
- GET /v1/leaderboards/companies

Every route except the guest and health endpoints needs:
Authorization: Bearer YOUR_GUEST_ACCESS_TOKEN

Responses and errors are JSON. Every mutation is checked by the Worker and enforced by D1 constraints/triggers. No user-controlled amount or personal economy figure is accepted for Company RP.

## Research modifiers returned by GET /v1/company
- computing: +2% personal Credits per level, cap +20%
- research: +2% personal Research per level, cap +20%
- drops: +2% personal Component Drop Rate per level, cap +20%
- infrastructure: +2% RP for **all** members per level, cap +20%

These are read-only **potential modifiers**. Unity does not consume them yet. Applying them to the authoritative single-player simulation, including saved snapshots, challenges, offline simulation and resets, needs a separate tested integration.

## Tests
- npm test – pure rule tests (Node)
- python3 -m unittest discover -s test -p '*_test.py' – SQLite membership/research triggers
- Still required: real Wrangler/D1 integration tests, multiple-client concurrency tests, Unity compile and mobile device testing.

## Must be completed before publishing a commercial multiplayer feature
- Upgrade temporary guest accounts to Apple/Google identity linking and account recovery. A lost/expired guest credential is not recoverable in this MVP.
- Store bearer credentials securely with platform Keychain/Keystore integration, **not** PlayerPrefs; CompanyApiClient intentionally stores credentials in memory only.
- Abuse protection: rate limiting on guest creation, Company name moderation, reports, bans, privacy/deletion/export workflows, terms of service, retention and backups.
- Validate ownership/provenance of all Gems, IAP, inventory items, blueprints and coupon redemptions on the server. Use idempotency keys and append-only ledgers for trade and reward transactions.
- Applications, projects, assignments, HQ, server-reward shop, requests, trading eligibility, abuse reporting, Seasons and PvP. Chat and DMs are deliberately excluded.
- D1 migration/rollback rehearsal, latency and quotas monitoring, load tests, GDPR/DSGVO review and required third-party agreements.

This foundation intentionally avoids messaging, trusting client-side inventory or exposing paid currency to unaudited trading.


## Server-owned tradable Gumball tickets (D1 0006)

A **separate verified voucher wallet** can be gifted and sold inside a Company after 48 hours of mutual membership. It receives at most one voucher at each server-calculated lifetime Company RP milestone (1k, 10k, 50k), never by uploading local chest/Season saves. `GET /v1/vouchers/me`, `POST /v1/vouchers/gifts`, `GET/POST /v1/vouchers/offers`, `POST /v1/vouchers/offers/:id/accept|cancel`, `POST /v1/vouchers/redeem` and `GET /v1/vouchers/redemptions` are supported. The server issues unique redemption receipts but the Unity-native redemption-to-local-draw adapter is not yet shipped. All transfers and trade escrows are D1-trigger atomic. No chat text or Gems are traded. **Local chest vouchers remain non-transferable** until a server-verifiable chest-claim grant path exists.

### Lokale Handels- und Datenschutzprüfung

Node22.13+ (`node:sqlite`) und Python3.11+ sind für die erweiterten lokalen Tests erforderlich; keine neue Testabhängigkeit. `npm test` führt reine Node-Verträge und Request-/Response-Tests mit einer echten isolierten SQLite-Datenbank aus. `python3 -m unittest discover -s test -p '*_test.py'` prüft zusätzlich Trigger, Rollback, Bestandsgrenzen, Migration bestehender Tagesverbräuche und zwei konkurrierende Verbindungen auf den letzten freien Handel.

Migration0009 vereinigt normale Handel, Gutscheinhandel und Geschenke unter **fünf abgeschlossenen Transfers je Spieler/UTC-Tag**. Beide Teilnehmer verbrauchen gemeinsam mit dem Transfer atomar einen Platz. Migration0010 ergänzt feste Missbrauchsmeldungen ohne Chat, Sperrlisten und bestätigte Kontolöschung samt Sessions, Escrow und Company-Nachfolge. Diese Dateien sind vorbereitet und lokal geprüft; **nicht automatisch remote anwenden**.

`GET /v1/trades/limits` und beide Angebots-/Inventarwege liefern `{tradeLimit:{used,limit,resetAt}}`; die Uhr stammt vom Worker. Änderungen am zentralen Limit müssen über `BALANCE.companyTradeDailyLimit` und `scripts/export-company-policy.ts` erfolgen und eine explizite SQL-Migration erhalten. Tests vergleichen den generierten Wert und den aktiven SQL-Vertrag.

Weiterhin offene kommerzielle Grenzen: verifizierte Apple-/Google-Identität und Fortschrittsbindung, produktiver Moderationsbetrieb, externe authentifizierte Lösch-Webressource, Datenschutz-/Storeangaben und D1-Staging-/Deploymentabnahme. Unity meldet fehlende Anbieter ehrlich, statt Gast-/lokale Saves als geprüfte Onlinebestände auszugeben.
