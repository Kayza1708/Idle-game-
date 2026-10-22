# Idle Intelligence — Company monetization, identity, privacy & security specification
Status: architecture proposal / **not implemented or production-approved**. Created 2026-10-22.
Scope: commercial iOS/Android Unity mobile game, Cloudflare Workers + D1 in EU jurisdiction, up to 50 members/company. Existing Cloudflare MVP in PR #146 is **not safe to expose publicly** without the P0 mitigations below.

## 1. Non-negotiable product decisions

- Zero mandatory signup gates on first launch. Single-player may start **offline and anonymously**.
- When the player first opens Companies, provision a pseudonymous guest identity with a server-generated random player UUID and random secret (securely stored in Keychain/Keystore). No email, phone number, real name, or contact permissions required.
- Offer optional "Secure your progress" after the first meaningful Company action, using Sign in with Apple on iOS and Google identity on Android; optional cross-platform account recovery through a one-time recovery code/passkey. Identity providers' ID tokens must be validated server-side and not logged or stored. Store only a pairwise pseudonymous opaque identity (prefer keyed hash/HMAC of provider and stable subject); do not request/store email/profile fields.
- Do not claim the service is anonymous under GDPR: player IDs, nicknames, message contents, device and connection data remain potentially personal data.
- Guests may participate in social activities subject to abuse limits; **high-value, transferable item trades** can require account linking, minimum tenure and provable server inventory. No real-money purchase or forced login gate is needed for normal play.
- Company membership bonuses apply to personal gameplay during membership; **Company RP and league scores do not depend on personal Credits, INT, hardware or Prestige**. Monetization must not purchase Company War ranking points or unbounded RP.
- Prefer adding Company rewards to the existing 30-day Season Pass instead of launching a competing mandatory second paid pass.

## 2. Suggested Company monetization and fairness rules

All pricing and reward values are **test hypotheses**, not launched products.

| Mechanic | Free path | Paid or rewarded option | Safety / fairness |
|---|---|---|---|
| Company Supply Drone | One regular daily claim | Voluntary rewarded video for one extra personal supply claim; capped 1–2/day | Only personal loot; no War score |
| Research Report | Passive Company Node production | Voluntary video for capped *personal* bonus tokens/loot, not unlimited Company RP | Does not accelerate Company leagues |
| Gumball voucher | Earn shards/tickets through Company projects | Optional rewarded ad for limited non-transferable ticket shard; optional store offer | Server-issued, daily cap and one-time redemption |
| Company shop | CT earned by active contribution | Optional cosmetics and carefully capped convenience through StoreKit/Google Play Billing | No purchasing Rank/War contribution |
| Company cosmetics | Earned emblems/frames | Paid emblem pack / HQ skin / themed chat cosmetics | No gameplay advantage |
| Company Season track | Free milestone rewards | Extra cosmetics and noncompetitive personal rewards bundled into the **existing** premium season | No exclusion from co-op |

No forced interstitials in the Company chat or while trading. Avoid advertising in interactions requiring careful user consent. Reward options must be clear before the video starts; allow declining without penalty. Any paid gumball, loot box or randomized chest must display item odds **before** purchase. Paid digital vouchers and cosmetics must follow Apple/Google in-app billing rules. Publish platform-appropriate details of subscriptions and cancellation/refunds if ever added.

### Actual secure reward pipeline

1. Unity requests an ad opportunity from Workers; Workers authenticate player and create a nonce-bound reward intent (player ID, ad unit, reward type, expiry).
2. Unity displays rewarded video using a supported SDK with server-side verification (SSV) custom data referencing the intent.
3. Ad network sends signed server-to-server callback; Worker verifies signature with advertiser's public keys, time window, allowed ad unit, linked intent and globally unique transaction ID.
4. D1 transaction inserts transaction ID with unique constraint and awards *server-owned* inventory, ticket or token in one atomic unit. Replay returns same receipt but no additional credit.
5. Unity fetches verified receipt and displays celebration. Never award transferable goods or premium currency from the client SDK callback alone.
6. Consent management (appropriate Google-certified CMP / UMP for AdMob EEA use) gates SDK behavior. ATT permission on iOS applies if tracking as defined by Apple; do not falsely equate non-personalized ads with automatically exempt processing.

Purchases: Verify App Store / Google Play purchase with platform servers; check bundle ID, product ID, environment, signed transaction and idempotency; use server-side ledger; implement refund/revocation and restoration. All balances are server-authoritative.

## 3. Threat model and security backlog

| Threat | Required countermeasure | Priority |
|---|---|---|
| Unlimited anonymous-account creation | Per-IP/edge and per-player rate limits, bot/app attestation where appropriate, abuse quotas and service-level operational alerts; do not permanently store raw IP for identity purposes | P0 before public Worker |
| Guest credential stolen/lost | Opaque random token, hash at rest, iOS Keychain/Android Keystore, limited lifetime + renewal/revocation; optional Apple/Google linking and recovery | P0 |
| Forged Gems, items, Blueprints or Gumball tickets | Server-owned ledger and inventory, no trusted Unity save submissions; all grants and movements validated on Workers | P0 before reward/trading |
| Item duplication / 2-client trade race | D1 atomic escrow, optimistic version checks and UNIQUE transaction ID; tests for parallel accept/cancel/refund/retry | P0 before trading |
| Fake ad callbacks, fake IAP receipts | Cryptographic provider verification, nonce/user binding, expiry, replay prevention, signed store notifications | P0 before monetization |
| Replay / double claim / clock forgery | Server UTC time, UNIQUE idempotency keys for all mutations, atomic balance checks and time quotas | P0 |
| Forged membership or CEO actions | Identity server lookup, role-based permissions on every Worker mutation, DB constraints; never trust supplied member/role | P0 |
| Altered/sideloaded app or automation | Apple App Attest / Google Play Integrity where useful; risk scoring and friction in sensitive endpoints, not absolute device trust | P1 |
| API flooding, scraping, DDoS | Cloudflare Worker rate-limiting bindings / WAF, bounded query complexity/pagination, request limits, timeout, service monitoring | P0 |
| Chat harassment, doxxing, spam | Profanity/name filters, rate limits, mute/block/report, moderation queue, admins, incident retention and public safety contact | P0 before chat |
| SQL injection / auth leakage | Parameterized SQL, validated JSON schemas, HTTPS-only API, strict header/log redaction; Cloudflare secrets, least-privilege access | P0 |
| Credential exfiltration from client | **No long-lived secret/API admin key in Unity**; sensitive keys only Cloudflare secret bindings; device secure storage | P0 |

Cloudflare Workers rate limits are approximate and not strict global accounting: business-critical quota enforcement (daily rewards, trades, Gems, purchases) must be in D1 with transactional checks. Cloudflare WAF cannot make a hack-proof client.

**Existing PR #146 issues needing remediation:**
- `POST /v1/session/guest` has no rate limiting or app attestation. At present, guests can repeatedly create new Companies and spam D1 resources.
- Guest bearer token expires after 30 days and no refresh/recovery guarantee exists if the device loses the token. Session rotation alone does not constitute account recovery.
- The local Unity save is authoritative for personal gameplay: items produced locally are **not provably tradeable**. Option A: complete server-side authoritative inventory; option B: a separate server-minted, tradeable Company inventory, while legacy/local items stay untradeable. Option B is safer for first release.
- The Company API is not connected to an actual Unity menu yet and has no secure session persistence implementation.
- P0 service hardening, live Cloudflare EU processing check, privacy rights workflow and external security review have not been completed.

No statement that the game "cannot be hacked" is technically defensible. Objective: contain client tampering to an isolated, non-tradeable offline save and protect all shared rewards, leaderboards and transactions server-side.

## 4. Data minimization and GDPR/DSGVO

### Minimal required D1 model

`players(id, nickname, created_at, account_state)`,
`identity_links(player_id, provider, provider_subject_hmac, linked_at)`,
`sessions(token_hash, player_id, expiry, revoked_at)`,
`company_members`, `company_research`, `company_projects`, `research_contributions`,
`wallet_ledger`, `inventory_ledger`, `reward_receipts`,
`trade_escrow`, `consent_preferences`, `chat_messages`, `reports`,
`account_deletion_requests`.

- **Do not store** email address, phone, real name, address, contact list, DOB, raw Apple/Google ID tokens or passwords.
- Connection IP and request metadata may nevertheless be processed by Cloudflare infrastructure and ad SDKs. Minimize app logs, redact Authorization, avoid storing raw IP; ensure provider agreements and log-retention settings match privacy disclosures.
- Use server-owned player IDs, separate private identity links from public nickname/leaderboard entries, keep private account metadata inaccessible through public API.
- Set a documented retention schedule (proposed initial values, subject to legal review): ordinary chat 30 days, abandoned guest accounts 90 days after last activity, expired sessions 30 days at most, abuse records case-specific and limited, financial/purchase records per applicable legal obligations. Avoid promising immediate deletion from immutable backup archives; document rolling backup expiration and deletion policy.
- Provide in-app: privacy notice, data export, data deletion, ad personalization choices and consent withdrawal, blocked-player management.
- Provide external account deletion web resource for Google Play and a user-accessible in-app deletion route for both stores, including auto-generated guest accounts.
- On deletion: verify requester, revoke access/session tokens and identity links, remove or anonymize Company membership, chat and player-facing records, apply lawful exceptions only, avoid breaking transaction integrity, record a minimal deletion receipt.
- Sign an appropriate Cloudflare DPA (AVV) and evaluate Google/Apple/ad SDK agreements, any non-EU transfers, processor inventory, appropriate legal basis, breach process, age rating / children's audience, DSAR deadlines and security measures with qualified counsel before release.
- Accurate App Store privacy nutrition labels and Google Play Data safety forms must reflect SDK and Cloudflare data processing as deployed, not just what D1 persists.
- If AdMob is used in EEA/UK/CH, use a **Google-certified TCF CMP** such as supported Google UMP where applicable; consent choices must be reversible and recorded.
- Apple review requires report/block/filter/contact mechanics for user-generated Company chat; accounts including guest identities must be deletable.
- D1 EU jurisdiction applies to D1 storage/processing, not necessarily every request, Worker, SDK or external vendor location.

## 5. Rollout gates (do not skip)

### P0 – before public beta with Companies
- Rate-limited guest enrollment and Company creation, robust session renewal/revocation and account linking/recovery.
- HTTPS transport, no secrets in Unity, secure device storage, database hardening, parameterized queries, backups, alerting.
- Report/block name/chat abuse before enabling chat, deletion and data-export endpoints, privacy notices + store disclosures.
- Unity EditMode/PlayMode + real iOS/Android tests, D1 migration/restore, concurrent join and research claims.

### P0 – before enabling paid / tradable rewards
- Server-inventory provenance, cryptographic rewarded-ad SSV, purchase verification and refunds, escrow transactions, replay/parallel tests.
- Minors/consent handling, odds disclosures for purchasable random rewards and abuse protection.

### P1 – Company launch enhancements
- Optional Apple/Google link and cross-platform recovery UX, Company project milestones, cosmetics, bundled season rewards, Company reporting and moderation dashboard.

## 6. Reference sources verified October 2026

- Apple App Review: https://developer.apple.com/app-store/review/guidelines/
- Apple guest account deletion: https://developer.apple.com/support/offering-account-deletion-in-your-app/
- Google Play User Data: https://support.google.com/googleplay/android-developer/answer/10144311
- Google Play deletion: https://support.google.com/googleplay/android-developer/answer/13327111
- AdMob Unity rewarded + SSV: https://developers.google.com/admob/unity/rewarded and https://developers.google.com/admob/unity/ssv
- AdMob EEA certified consent: https://support.google.com/admob/answer/13554116
- Cloudflare D1 EU jurisdiction: https://developers.cloudflare.com/d1/configuration/data-location/
- Cloudflare Workers rate limiting (approximate): https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/
