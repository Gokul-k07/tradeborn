# Public enquiry delivery

Trade Born remains a static React/Vite application. No application server or third-party runtime dependency has been added. With an empty `VITE_CONTACT_ENDPOINT`, Contact and Onboarding validate locally and explicitly show preview mode. No enquiry POST is made in this mode.

## Configure delivery

1. Choose a public form service or an existing HTTPS endpoint owned by the client. A free-tier form service is suitable if it supports the contract and abuse controls below. Verify the destination and final privacy terms with the business owner.
2. Set `VITE_CONTACT_ENDPOINT` in the hosting provider's build environment, or in an ignored local `.env.local`. Use a public HTTPS URL or a same-origin path such as `/api/enquiry`. Relative paths are allowed over HTTP only on local development hosts.
3. Rebuild with `npm run build` and deploy the static output. Vite embeds this value at build time; changing a server environment variable after building does not change the bundle.
4. Test acceptance in the configured service and separately confirm actual receipt using the client's verified destination. Frontend acceptance alone is not evidence that an email was delivered.

Do not put email passwords, SMTP credentials, provider management tokens, private API keys or a private destination URL in a `VITE_*` variable. Every such variable is public in the browser bundle. Secret credentials belong in the service's own secure configuration. `.env.example` intentionally leaves the public endpoint blank.

The adapter rejects credential-bearing URLs, URL fragments, protocol-relative URLs, non-HTTPS remote endpoints and insecure non-local hosting. Invalid configuration leaves the forms in explicitly labelled preview mode. The deployed website and enquiry service should use HTTPS.

## Endpoint contract

Both forms send `POST` with `Content-Type: application/json` and `Accept: application/json`. Cross-origin endpoints must support the corresponding CORS preflight for the site's permitted origins. Cookies and authorization credentials are omitted, redirects are rejected, response caching is disabled and no referrer is sent.

Payload fields:

| Field | Meaning |
| --- | --- |
| `name` | Trimmed visitor name, 1–100 characters |
| `email` | Validated visitor email, at most 254 characters |
| `company` | Optional business name, at most 120 characters; empty for Contact |
| `topic` | One of the application's listed enquiry topics |
| `subject` | Trimmed subject, 2–140 characters on one line |
| `message` | Trimmed plain-text business enquiry, 10–3,000 characters |
| `source` | `contact` or `onboarding` |
| `submissionId` | Opaque per-payload identifier retained for retries while the form remains open |

Return a successful 2xx response with an `application/json` content type and a JSON object containing the **boolean** field `ok: true` only after the request has been durably accepted for processing:

```json
{ "ok": true }
```

This acknowledges acceptance, not email delivery. The UI deliberately states that distinction and never claims to create a trading account or establish a financial relationship.

Return an appropriate error status for rejection; use `429` for rate limiting. HTML responses (including an SPA fallback), empty responses, redirects, invalid JSON and an acknowledgement other than boolean `ok: true` are treated as unconfirmed acceptance. Arbitrary provider error text is not rendered. Inputs are retained for correction or retry.

The client aborts after 12 seconds and on unmount. Aborting cannot retract a request already received by a service. A timeout therefore says the request may have arrived. The application performs no automatic retry. Browser/network transports may retry independently; repeated attempts retain the same `submissionId`.

## Required service-side controls

Before enabling real delivery, configure and verify these controls in the selected service:

- Validate every field again, enforce allowed topics/source values and cap request bodies (32 KiB is sufficient for this schema). Treat all visitor text as untrusted; escape it in HTML email/templates and never concatenate it into email headers or queries.
- Enforce rate limits and provider anti-spam/bot protection. The hidden frontend field and disabled buttons are only supplemental checks and can be bypassed by direct requests. This repository makes no claim to enforce server-side abuse prevention.
- Deduplicate accepted submissions by `submissionId`, retaining acknowledgements long enough to cover retries. Do not trigger duplicate side effects for a repeated ID. The browser guard prevents concurrent UI submissions; it cannot replace service-side idempotency.
- Restrict browser CORS origins to the deployed site, while recognizing that CORS alone does not block bots or authenticate callers. Do not require browser-exposed secrets. Configure stronger abuse controls server-side if needed.
- Keep provider credentials and delivery destinations in secure service configuration. Do not return them in API responses or log message bodies unnecessarily.
- Finalize business/privacy information, processing purpose, retention, recipient/provider terms and the client's verified contact destination. Test actual email receipt with authorization from the business owner.

No real service or verified destination is configured in this checkout. All successful delivery-path tests used an isolated local HTTP fixture with synthetic visitor data. They do not establish real-world email delivery, a live provider configuration or provider-side anti-abuse readiness.

## Reproduce verification

The existing production preview should run on port 4173. Install the optional browser test runner as described in README.md, then run:

```bash
node scripts/verify-data.cjs
npm run build
VITE_CONTACT_ENDPOINT=/__test/enquiry ./node_modules/.bin/vite build --outDir /tmp/tradeborn-integration-dist
NODE_PATH=/tmp/tradeborn-checks/node_modules INTEGRATION_DIST=/tmp/tradeborn-integration-dist node scripts/verify-features.cjs
NODE_PATH=/tmp/tradeborn-checks/node_modules node scripts/verify-browser.cjs
NODE_PATH=/tmp/tradeborn-checks/node_modules node scripts/verify-motion.cjs
```

The additional bundle lives outside the checkout and points only to a local test server that the feature runner creates and closes. The normal `dist/` build remains in preview mode when no public endpoint is configured. Test fixtures never send real email.

## Report data

The report window, view buttons, range control, tooltips and table all use the same synthetic series. Window filters select observations without resetting the full-series running maximum used for peak-distance calculations. The downloadable CSV contains only those currently visible observations, with a synthetic-data marker on every row. No personal input is included in downloads and no backend is involved.
