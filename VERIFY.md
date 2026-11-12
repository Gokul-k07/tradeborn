# Verification — functional features and integrations

Verified on 12 November 2026. This is the current status; earlier prototype-only form behavior has been replaced by the configurable workflow described below.

## Features implemented

### Contact and delivery

- Name, email, topic, subject and message validation with length bounds, trimmed values and single-line control-character checks. Business names are optional in Onboarding.
- Field-level messages, an accessible error summary, invalid-field focus, semantic labels and required markers. Visitor text is rendered as text, including the enquiry review.
- Explicit idle, submitting, preview, accepted and failure states. Controls lock during requests; synchronous guards prevent duplicate in-flight calls and accepted submissions remain locked until reset or editing.
- Optional public `VITE_CONTACT_ENDPOINT`, with an empty `.env.example` default. No private keys or email credentials are used in browser code.
- HTTPS/public-URL checks, credential omission, no-referrer requests, redirect rejection, a 12-second timeout, unmount cancellation and stable retry identities.
- Acceptance requires successful HTTP status, an actual `application/json` content type and JSON boolean `ok: true`. The UI does not infer delivery from a generic HTTP 200, HTML SPA fallback, empty body, malformed JSON or a negative acknowledgement.
- Preview mode makes no POST. Configured mode says acceptance does not confirm email delivery. Timeouts explicitly say the service may have received the request.
- Supplemental hidden-field bot detection. Service-side validation, rate limits, anti-spam and idempotency remain requirements of the selected endpoint; frontend controls cannot enforce them against direct callers.

### Onboarding enquiry

- Four steps within the existing timeline composition: basic details, enquiry scope, review and confirmation.
- Previous/next navigation, a progress indicator, validation before advancement and retained in-memory draft values when moving between steps.
- Required acknowledgement that this is a business enquiry, not a trading-account application.
- Preview and accepted confirmations use the same delivery adapter as Contact. Failures retain the review and editable values; restart clears the draft.
- No password, financial account, identity-document or upload fields. No browser storage is used for draft information. Navigation away clears the form and aborts an in-flight client request.

### Reports and markets

- All/first-six/last-six observation filters; table, slider, readout, cursor and tooltip use the same selected row.
- Peak distances retain the full-series running maximum when filtering a window. For example, observation 07 remains 107 index units / −2 peak-distance points in the last-six view.
- Table observation buttons select the corresponding chart point. CSV downloads contain the current window, both numeric columns and `ILLUSTRATIVE_SYNTHETIC_DEMO` on every row.
- Instrument selection retains URL behavior and now supports mouse, touch and keyboard-range inspection of schematic drawing points. These controls do not display market prices or risk estimates.
- Report touch tooltips persist after touch release. All figures remain explicitly illustrative; no real-time feed or financial results were introduced.

### Site-wide behavior

- Existing layouts, palette, typography and Motion behavior are preserved.
- Navigation, privacy/legal links, unknown-route recovery, mobile menus, focus behavior and per-entry history restoration remain functional.
- Malformed URL fragments no longer throw during decoding.
- A favicon based on the existing brand mark removes the previous missing-icon response. Chromium can still intentionally cancel asynchronous icon requests during rapid automated navigation; only those `ERR_ABORTED` icon cancellations are excluded from the network regression assertion.
- No unverified email or telephone destinations were invented. Delivery/privacy copy reflects the configured build mode.

## Actual validation results

All checks below completed against the final production output:

- `npm run build`: passed (TypeScript and Vite).
- `git diff --check`: passed.
- `node scripts/verify-data.cjs`: passed. Covered invalid/valid email formats, whitespace, field bounds, control characters, unknown topics, endpoint schemes/credentials/fragments, synthetic calculations and all CSV windows.
- `scripts/verify-browser.cjs`: passed. All ten routes at 320, 375, 600, 768, 820, 1024 and 1440 pixels (70 combinations); no detected text/document overflow. Checked 17 main CTAs, 140 desktop/footer transitions, all mobile destinations, 13 unique internal anchors, unknown-route recovery, keyboard controls and browser history.
- `scripts/verify-features.cjs`: passed at 320 and 1440 pixels in preview mode. Covered field errors, focus, no preview POSTs, honeypot rejection, onboarding progression/previous/review/acknowledgement/confirmation/reset, safe rendering of HTML-like visitor text, no draft browser storage, every report window, selected-row synchronization, three actual CSV downloads and instrument range/touch/mouse controls. No console errors or runtime exceptions occurred in those preview runs.
- Configured-endpoint tests used a separate production bundle pointed at an isolated **local HTTP test server**. Passed JSON acceptance, loading/disabled states, duplicate-call prevention, payload trimming/whitelisting, cookie/authorization omission, HTTP 500 and 429, HTML and JSONP content types, empty responses, redirects, negative acknowledgements, malformed JSON, dropped connections, actual 12-second timeout, retry identity reuse, Onboarding acceptance and navigation-away cancellation.
- The transport itself can retry a dropped connection; all such requests retained the same submission identity. An actual provider must deduplicate this identity server-side before creating duplicate side effects. No email was sent by the fixture.
- `scripts/verify-motion.cjs`: passed. All ten routes at 375 and 1440 pixels with both normal and reduced motion (40 route/preference/viewport cases), plus new form/review states, charts, menus, keyboard and scroll/history behavior. No unsettled animation loops or runtime exceptions were found. Largest measured per-route CLS was 0.013237; phone runs measured 0. These are local automated checks, not field Core Web Vitals.
- Desktop/mobile screenshots of the new form and onboarding composition were inspected. Other browser engines and a deployed production host were not tested.

Expected HTTP/network error responses were deliberately exercised in the isolated integration tests. They are distinct from unexpected application exceptions. A passing local adapter test does not prove external CORS configuration, provider abuse controls or real email delivery.

## Current integration status and client tasks

`VITE_CONTACT_ENDPOINT` is not configured in this environment. The normal production build remains in explicitly labelled preview mode. No real delivery provider, destination, credentials or email receipt has been verified.

Before enabling real delivery, the client must select and verify the public endpoint/destination, configure its server-side validation/rate limits/anti-spam/idempotency and allowed CORS origins, finalize privacy/processing information, then test actual receipt. Any provider management keys or email credentials belong only in the provider's secure settings. See [INTEGRATIONS.md](INTEGRATIONS.md) for the exact public contract and reproducible tests.

Other business placeholders remain: legal entity, jurisdictions/permissions, verified founder biography, service scope/fees/eligibility, secure business onboarding procedures, approved contact channels and actual reporting records. No trading account, financial relationship or performance claim is created by these features.

## Files changed in this stage

- Forms/delivery: `src/EnquiryForms.tsx`, `src/enquiry.ts`, `src/contactConfig.ts`, `src/enquiryDelivery.ts`, `src/useEnquiryDelivery.ts`, `src/vite-env.d.ts`.
- Reports: `src/ReportingLab.tsx`, `src/demoReports.ts`.
- Shared pages/styles/navigation: `src/App.tsx`, `src/Editorial.tsx`, `src/main.tsx`, `src/features.css`, `src/useSiteNavigation.ts`.
- Public configuration/assets: `.env.example`, `index.html`, `public/favicon.svg`.
- Verification: `scripts/form-test-helpers.cjs`, `scripts/verify-data.cjs`, `scripts/verify-features.cjs`, `scripts/verify-browser.cjs`, `scripts/verify-motion.cjs`.
- Documentation: `README.md`, `INTEGRATIONS.md`, `VERIFY.md`.

No application dependencies or production backend were added. `package.json` and `package-lock.json` are unchanged. See INTEGRATIONS.md and README.md for the build, preview, optional Playwright setup and local integration-test commands.
