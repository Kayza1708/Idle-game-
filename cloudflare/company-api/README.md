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
- Membership admin actions, invites/applications, project contributions, assignments, HQ, reward shop, requests, trading escrow, chat moderation/abuse reporting, Seasons and PvP.
- D1 migration/rollback rehearsal, latency and quotas monitoring, load tests, GDPR/DSGVO review and required third-party agreements.

This V1 intentionally avoids deploying a fake chat, pretending that client-side inventory is secure, or exposing paid currency to an unaudited trading system.
