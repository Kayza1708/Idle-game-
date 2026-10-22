# Cloudflare Companies – Architecture and delivery status

## Objective
Independent Companies for up to 50 members. A player's personal Credits, INT, hardware, Prestige and local save must never determine Company RP. Company research unlocks meaningful personal benefits; later releases add earned Gems, Components, Blueprints, Chests and Gumball Tickets, trading and leaderboards.

## Server ownership
Cloudflare Worker = API. D1 = member registry, RP, research and tokens. Later Durable Objects = real-time chat and Company event distribution. Unity = view/controller. Personal inventory remains local **until** a separately designed server-authoritative rewards/inventory bridge is implemented.

## Phase 1 (this branch)
- [x] Worker routes for guest identity, Company creation, search, join, membership, lazy RP claims, research and lifetime Company rankings.
- [x] D1 migration includes atomic membership cap, Company RP accrual trigger, server-side research cost debit and bounded research levels.
- [x] Unity transport client prepared, without SDK, scene mutations or save changes.
- [x] Pure rules and local SQLite regression tests added.
- [ ] Worker deployment, live D1 integration tests and Unity Editor compile **not run**.
- [ ] Identity linking, game economy bonus application and real player-facing Company menu **not implemented**.

## Phase 2 – Company gameplay
Server-enforced permissions (CEO/manager/member), invitations, kicks, CEO transfer, moderated names, projects with personal contribution caps, assignments, 24-hour daily rewards and Company HQ. All members earn the same base Company production; Company-level upgrades benefit every member.

## Phase 3 – secure rewards and social
D1-backed inventory provenance, replay-safe redemption ledger, Company Token shop and Gem/Chest/Gumball-ticket grants, item/blueprint/component marketplace with escrow, donation limits and trade audit. Add moderated Durable Objects chat and a reporting/blocking system. No trade route may trust local Unity inventory amounts.

## Phase 4 – seasons
Seasonal Company leagues, normalized contributions, 20v20 research races, milestone chests and 30-day reset for rankings only. Company HQ and permanent research persist. Season rewards are server-owned and idempotent.

## Commercial release: identity, security, GDPR and monetization

Full [Company commercial security specification](company-commercial-security.md): guest-first optional Apple/Google identity linking without email storage, server-owned trade and reward ledgers, rewarded-ad SSV, purchase verification, abuse controls, deletion/export and provider agreements. This is a **proposed design**, not a completed security audit; P0 requirements are not yet done.

## Non-negotiable quality criteria
- No client-submitted currency totals or timestamps.
- No free-unlimited trade or gem/ticket faucet from anonymous guest accounts.
- No Company control of personal reward wallets.
- No branching/forked balance source for core personal economy.
- Do not merge, deploy or publish without separate explicit approval and verified tests.
