# Final QA and Vercel preparation — 12 November 2026

## Readiness

The static repository is prepared for an authorized Vercel import in **preview mode**. No Vercel deployment was attempted, no deployed URL was supplied or tested, and no live email delivery was verified. Technical deployment readiness is separate from approval of the remaining business/legal placeholders.

README.md contains the final project structure, exact Git commit/push commands, Vercel import settings, environment-variable guidance, deployment steps and post-deployment checklist. INTEGRATIONS.md contains the delivery contract and service-side requirements.

## Final audit and fixes

- A clean `npm ci` completed with the lockfile. Node **24.x** is pinned in package.json and .nvmrc; Node v24.22.1 / npm 11.9.0 were used for these checks. Existing dependency versions were retained.
- Strict TypeScript checks and the Vite production build pass. No application dependency or production backend was added.
- Removed roughly 6 KB of obsolete CSS for replaced process/service/market/report/onboarding components, the hidden duplicate intro marker, an unused enquiry type and the unused compact-chart branch. Working components, fonts and interactions were retained.
- Added unique titles/descriptions for all ten routes, client canonical/robots/Open Graph updates, static social metadata and a committed 1200 × 630 branded PNG (44,706 bytes). The existing favicon is retained.
- Verified locally bundled fonts and both WOFF2 preloads resolve to emitted hashed assets. No remote font service is required.
- Added optional public-origin configuration, generated robots.txt and a ten-route sitemap when the real public origin is known. A reserved `.example` origin was used only in an isolated test bundle; no production host was invented.
- Reviewed lazy loading. Deferring entire report/form UI could alter scroll geometry, so page UI stays eager. Only the optional delivery adapter is loaded on a configured submission, with its failure covered by the existing error state.
- Initial privacy fragments are explicitly resolved after the route mounts. Query selection, focus and per-entry scroll restoration are preserved.
- Vercel now explicitly uses framework Vite, `npm ci`, `npm run build` and `dist`. SPA fallback excludes API/static-asset paths; content-hashed assets get immutable caching and common security headers are configured.
- `.env*`, .vercel, generated output and test reports are ignored, except the blank public .env.example. Publishable files were checked for common private-key/token formats; none were found. No credential values were printed or added.

## Actual test results

| Check | Result |
| --- | --- |
| Clean `npm ci` | Passed |
| `npm run typecheck` | Passed |
| `npm run build` | Passed |
| `npm run check:data` | Passed |
| `npm run check:production` | Passed for normal and isolated configured-origin builds |
| `npm audit` | 0 reported vulnerabilities |
| `npm audit --omit=dev` | 0 reported vulnerabilities |
| `git diff --check` | Passed |
| `verify-browser.cjs` | Passed |
| `verify-motion.cjs` | Passed |
| `verify-features.cjs` | Passed against preview mode and a local HTTP fixture |
| `verify-deployment.cjs` | Passed against a local model of vercel.json routing/headers |
| Official `@vercel/routing-utils` 6.6.1 transformation | Rewrite and header rules accepted offline |

### Routes, accessibility and browser behavior

All ten routes loaded at 320, 375, 600, 768, 820, 1024 and 1440 pixels: **70 responsive route/viewport checks**, with no detected text/document overflow. The suite checked 17 main CTAs, 140 desktop/footer transitions, all mobile destinations, 13 unique internal anchors, keyboard controls, focus, history and unknown-route recovery. It waits for complete feature readiness before navigating away.

The deployment-policy check opened and refreshed each route, verified ten unique titles/descriptions and matching client Open Graph titles, tested direct instrument queries and privacy fragments, fetched favicon/social image/robots/assets, checked reserved-path 404 behavior and configured response headers, and found no console warnings/errors or runtime exceptions. This is local evidence, not a test of the Vercel edge service.

Final desktop/mobile screenshots of the page compositions were inspected. The website remains the existing design rather than a new theme. Other browser engines were not tested.

### Motion and performance

All ten routes were tested at 375 and 1440 pixels with both normal and reduced motion: **40 route/preference/viewport cases**, plus panel, chart, form and menu interactions. Animations settled without loops. Hero sizes, keyboard/touch interaction and scroll restoration remained intact.

Largest per-route CLS in the final Chromium run:

| View | Normal motion | Reduced motion |
| --- | ---: | ---: |
| 375px | 0 | 0 |
| 1440px | 0.0001405 | 0.0132419 |

These are local automated load/programmatic-scroll measurements, not field Core Web Vitals or a Lighthouse score. The existing compact desktop header retains its height change.

Normal production output:

- Initial JavaScript: 447,472 bytes / 141,587 bytes gzip, below the 160 KiB gzip check budget.
- Built CSS: approximately 65.37 KB / 16.58 KB gzip, below the 20 KiB gzip check budget.
- On-demand delivery adapter: approximately 1.13 KB / 0.63 KB gzip.
- Social PNG: 44,706 bytes, 1200 × 630, not loaded as a page-content image.

No photographic assets or heavy 3D dependencies are present. SVGs remain responsive. Unneeded font subsets are not requested by the browser; available glyph coverage was retained rather than stripping working font files.

### Contact, onboarding and delivery

Preview-mode checks passed on 320px and 1440px layouts: required fields, email/subject/message bounds, field errors and focus, hidden-field rejection, no preview POSTs, in-memory draft handling, previous/next controls, review, purpose acknowledgement, confirmation and reset. HTML-like visitor text stayed text, and no draft browser storage was created.

A separate production bundle pointed only at a local HTTP fixture. Actual local requests verified JSON acknowledgement, submitting/disabled states, single-flight guards, payload trimming/whitelisting, cookie/authorization omission, HTTP 500/429, HTML/JSONP responses, empty/redirect/negative/malformed acknowledgements, dropped connections, the 12-second timeout, retry-identity reuse, onboarding acceptance and navigation-away cancellation. Expected failure responses were intentional test cases; no real email was sent.

The UI does not infer email delivery from acceptance. Transport retries retained one submission identity, but a real provider must enforce deduplication/rate limits server-side. No live endpoint or client recipient is configured in the normal build.

### Reports and markets

All/first-six/last-six filters, chart/slider/readout/table synchronization, table observation selection and all three actual CSV downloads passed. Every CSV row is labelled `ILLUSTRATIVE_SYNTHETIC_DEMO`; peak distances keep the full-series reference when filtering. Instrument selection, schematic point inspection, keyboard ranges and touch/mouse controls passed. No real-time feed, financial return or company track record was introduced.

## Deployment evidence and limits

The rewrite/header format was additionally transformed successfully by Vercel's official routing utility installed only as a temporary QA tool outside the repository. No application dependency was added for this check. Vercel's published build-runtime source lists Node 24.x support. An actual account/project build, CDN behavior, protection settings and deployed URL remain untested.

The normal build has no known site origin locally, so canonical URL and sitemap are intentionally omitted. The isolated configured-origin build correctly emitted absolute social/canonical URLs, robots Sitemap and all ten sitemap entries. On Vercel, configure the verified `VITE_SITE_URL` or confirm the platform provides `VERCEL_PROJECT_PRODUCTION_URL`, then rerun the read-only URL check against the real host.

Dynamic route metadata is client-side. Crawlers that do not execute JavaScript receive the generic static Trade Born card; this is not SSR or ten prerendered HTML pages. Unknown page paths intentionally render the SPA not-found screen with HTTP 200; missing API/static paths are excluded from that fallback.

## Remaining client-dependent tasks

- Use an authorized Vercel account to import the repository and run the documented settings. No credentials or deployment authorization were assumed.
- Test the actual URL after deployment: all ten direct routes/refreshes, queries/fragments, assets/headers, console, mobile/reduced motion, navigation and CSV downloads.
- Keep enquiry delivery in preview mode until the endpoint, recipient, CORS, validation, spam controls, idempotency and privacy terms are verified. Any private provider credentials belong server-side. Actual receipt needs a separate authorized test.
- Approve legal entity, jurisdictions/permissions, founder biography, service scope/fees/eligibility, contact channels, legal/privacy terms and actual reporting records. Do not replace placeholders with fabricated claims.

## Files changed in this QA stage

- Build/hosting: `package.json`, `package-lock.json` (engine metadata only), `.nvmrc`, `vite.config.ts`, `vercel.json`, `.gitignore`, `.env.example`.
- Metadata/assets: `index.html`, `src/routes.ts`, `src/metadata.ts`, `public/og-image.png`, `scripts/generate-social-image.cjs`.
- Cleanup/stability: `src/App.tsx`, `src/Editorial.tsx`, `src/enquiry.ts`, `src/features.css`, `src/refinements.css`, `src/styles.css`, `src/useSiteNavigation.ts`, `src/useEnquiryDelivery.ts`.
- Checks/docs: `scripts/verify-browser.cjs`, `scripts/verify-production.cjs`, `scripts/verify-deployment.cjs`, `README.md`, `VERIFY.md`, `INTEGRATIONS.md`.

Exact local, Git, Vercel and post-deployment commands are in README.md. Generated dist files, temporary fixtures, browsers and QA-only tooling are not part of the repository changes.
