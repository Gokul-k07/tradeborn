# Trade Born

A static React 19 + TypeScript + Vite website with ten responsive routes, locally bundled Manrope/DM Sans, Motion interactions and configurable business-enquiry delivery. The existing black, white and acid-lime design is preserved.

The repository is prepared for Vercel import. No Vercel deployment or live email delivery has been performed or verified. Business/legal placeholders remain deliberately visible.

## Local development

Use **Node.js 24.x**, matching `.nvmrc`, `package.json` and the intended Vercel runtime.

```bash
npm ci
npm run dev
```

Production verification:

```bash
npm run typecheck
npm run build
npm run check:data
npm run check:production
npm audit
npm run preview
```

Run browser checks in another terminal while preview is running. `dist/` is generated; do not commit it. The lockfile is committed and Vercel uses `npm ci`.

## Final project structure

```text
tradeborn/
├── public/
│   ├── favicon.svg              # Existing brand mark
│   └── og-image.png             # 1200 × 630 social card
├── src/
│   ├── App.tsx                  # Page composition and navigation UI
│   ├── Editorial.tsx            # Editorial and instrument interactions
│   ├── EnquiryForms.tsx         # Contact and four-step enquiry workflow
│   ├── ReportingLab.tsx         # Synthetic chart/filter/table/CSV controls
│   ├── demoReports.ts           # Single synthetic data source
│   ├── enquiry.ts               # Validation and public endpoint URL checks
│   ├── contactConfig.ts         # Optional public endpoint binding
│   ├── enquiryDelivery.ts       # Delivery adapter, loaded on submission only
│   ├── useEnquiryDelivery.ts    # Loading, acceptance, retry and abort states
│   ├── useSiteNavigation.ts     # History, fragments, focus and scroll restoration
│   ├── routes.ts                # Ten routes and their titles/descriptions
│   ├── metadata.ts              # Client route metadata/canonical updates
│   ├── Motion.tsx               # Finite animation primitives
│   ├── styles.css
│   ├── refinements.css
│   ├── motion.css
│   ├── features.css
│   ├── main.tsx
│   └── vite-env.d.ts
├── scripts/
│   ├── verify-data.cjs
│   ├── verify-browser.cjs
│   ├── verify-motion.cjs
│   ├── verify-features.cjs
│   ├── verify-production.cjs
│   ├── verify-deployment.cjs
│   ├── form-test-helpers.cjs
│   └── generate-social-image.cjs # Optional development tool; not a build step
├── index.html
├── vite.config.ts               # Public metadata, robots and optional sitemap
├── vercel.json                  # Build/install/output, SPA rewrite and headers
├── netlify.toml                 # Retained alternative-host configuration
├── package.json
├── package-lock.json
├── tsconfig.json
├── .nvmrc
├── .gitignore
├── .env.example
├── INTEGRATIONS.md
└── VERIFY.md
```

## Routes and static hosting

`/`, `/about`, `/approach`, `/services`, `/markets`, `/performance`, `/risk`, `/onboarding`, `/contact`, `/legal`.

The History API router needs the SPA fallback in `vercel.json`. Refreshes and direct links render the app. Query selection (`/markets?instrument=options`) and privacy fragments (`/legal#privacy`) are preserved. Fragments are resolved by the browser and are never sent to the server.

The fallback excludes `/api`, `/assets`, favicon, social image, robots and sitemap paths. A missing API or asset therefore returns a real 404 instead of misleading HTML with HTTP 200. There is no `/api/enquiry` implementation in this repository. Unknown page paths render the in-app not-found screen with a static HTTP 200; a server-rendered HTTP 404 would require a different hosting strategy.

## Vercel import settings

| Setting | Exact value |
| --- | --- |
| Git provider / repository | GitHub / `Gokul-k07/tradeborn` |
| Production branch | `main` |
| Root directory | Repository root (`./`); do not select `src` or `dist` |
| Framework preset | Vite |
| Node.js version | 24.x |
| Install command | `npm ci` |
| Build command | `npm run build` |
| Output directory | `dist` |
| Required environment variables | None for the preview-mode website |

`vercel.json` supplies the framework, install, build and output settings. Confirm the Node version in Project Settings. No serverless functions, Vercel CLI token or production backend is required.

The configuration sets `nosniff`, a referrer policy and frame protection. Only content-hashed `/assets/*` receives immutable year-long caching. These settings were tested locally; live Vercel behavior still requires the post-deployment checks below.

## Environment variables

| Variable | Default / use |
| --- | --- |
| `VITE_CONTACT_ENDPOINT` | Optional. Leave empty for explicit preview mode. A configured value must be a public HTTPS form endpoint or a same-origin path with a real handler. |
| `VITE_SITE_URL` | Optional public HTTPS origin, with no path, query or credentials. Set it to the verified canonical domain if using a custom domain. |
| `VERCEL_PROJECT_PRODUCTION_URL` | Vercel-provided public hostname, used automatically for canonical/social URLs and the sitemap when available and `VITE_SITE_URL` is unset. Do not invent a value. |

Vite embeds `VITE_*` values at build time. Rebuild/redeploy after changing them. They are public: never use them for SMTP passwords, private API keys, provider management tokens or other credentials. Keep provider credentials in the provider's own secure settings. `.env*` and `.vercel/` are ignored, except the blank `.env.example` template.

Without a known public origin, the build omits canonical URLs and the sitemap instead of fabricating a domain; robots and the relative social-image URL still exist. Once a real origin is available, rebuild and verify the generated URLs. No variable is required to render all ten pages.

## Git commands to publish these repository changes

Run these from the repository root after reviewing the diff. They are instructions, not a claim that a commit or push was performed in this QA stage.

```bash
git status --short
git diff --check
git add .env.example .gitignore .nvmrc README.md VERIFY.md INTEGRATIONS.md index.html package.json package-lock.json vite.config.ts vercel.json src public scripts
git diff --cached
git commit -m "Prepare Trade Born for Vercel production deployment"
git pull --rebase origin main
git push origin HEAD:main
```

Preserve any new remote work. Resolve a rebase conflict rather than force-pushing or resetting the remote. Do not stage real `.env` files, `.vercel` credentials, `node_modules` or `dist`.

## Deployment steps

1. Review and commit/push the prepared repository using the commands above.
2. In your authorized Vercel account, choose **Add New → Project** and import `Gokul-k07/tradeborn`. Authorize GitHub access through Vercel's normal flow if required.
3. Confirm the import settings in the table. Leave contact delivery unset for the first preview-mode deployment. Add the verified canonical origin only when known.
4. Choose **Deploy** yourself when ready. After the build succeeds, copy the actual URL displayed by Vercel; no URL has been created or tested by this work.
5. Run the post-deployment checklist. If a custom domain or environment value changes, redeploy and repeat the relevant checks.
6. Enable a real enquiry endpoint only after the provider-side and privacy requirements in INTEGRATIONS.md are met. Test actual receipt separately with the client's authorization.

## Post-deployment checklist

- Open all ten routes directly and refresh each one; check a phone-width layout.
- Open `/markets?instrument=options` and `/legal#privacy` directly, including after a refresh.
- Use desktop/footer/mobile navigation, Escape, Tab, visible focus, browser back/forward and back-to-top.
- Verify normal and reduced-motion behavior; there should be no perpetual animations or overflow.
- In preview mode, test invalid and valid Contact input and the complete Onboarding review/confirmation. No enquiry should be transmitted.
- Test report windows, chart/table selection and the actual synthetic CSV download.
- Check browser Console/Network for unexpected errors, missing fonts, missing images, wrong JavaScript MIME types or failed assets.
- Inspect page titles/descriptions, canonical origin, the public social image and generated robots/sitemap. Check that URLs use the real host, not localhost or a placeholder.
- Check that missing `/assets/does-not-exist.js` and `/api/enquiry` return 404, not the app HTML. Confirm asset cache/security headers.
- Confirm that entity details, permissions, services, contact channels and legal/privacy content have business-owner approval before treating the prototype as a public business launch.

`verify-deployment.cjs` is read-only and can check an actual public deployment after its real URL is available:

```bash
BASE_URL='https://REPLACE_WITH_THE_ACTUAL_DEPLOYMENT_HOST' NODE_PATH=/tmp/tradeborn-checks/node_modules node scripts/verify-deployment.cjs
```

Replace the placeholder; it is not a claimed deployment URL. A protected Vercel preview may require owner authentication. Do not bypass access controls. The broad form suites below are intended for a build with preview mode enabled, not an unapproved live recipient.

## Browser verification and integration fixtures

Playwright is an optional test tool, not an application dependency. Chromium defaults to `/usr/bin/chromium`; override `CHROMIUM_PATH` for your installation.

```bash
npm install --prefix /tmp/tradeborn-checks playwright@1.65.0
# Keep npm run preview running in another terminal:
NODE_PATH=/tmp/tradeborn-checks/node_modules node scripts/verify-browser.cjs
NODE_PATH=/tmp/tradeborn-checks/node_modules node scripts/verify-motion.cjs
NODE_PATH=/tmp/tradeborn-checks/node_modules node scripts/verify-deployment.cjs
VITE_CONTACT_ENDPOINT=/__test/enquiry VITE_SITE_URL=https://tradeborn.example ./node_modules/.bin/vite build --outDir /tmp/tradeborn-integration-dist
NODE_PATH=/tmp/tradeborn-checks/node_modules INTEGRATION_DIST=/tmp/tradeborn-integration-dist node scripts/verify-features.cjs
```

`tradeborn.example` is a reserved test-only origin, not a real business domain. The fixture bundle is outside the checkout; it does not replace normal `dist/`. The test server is local and sends no email. Without `BASE_URL`, deployment checks model Vercel routing locally and do not contact or create a Vercel deployment.

The site uses eager page UI to keep scroll geometry stable. Only the optional delivery adapter is loaded on submission; failed imports use the existing submission error state. The social image is pre-generated and committed, so deployment does not install a browser or generate imagery. Dynamic route metadata runs client-side; non-JavaScript social crawlers receive the generic Trade Born card. This is not SSR or page-specific HTML prerendering.

## Remaining client-dependent requirements

Verify legal entity, founder biography, jurisdictions/permissions, service scope/fees/eligibility, contact channels, actual reporting records and final legal/privacy documents. Live delivery needs a verified public endpoint, provider-side validation/rate limits/anti-spam/idempotency, allowed CORS origins and an authorized real-receipt test. See INTEGRATIONS.md. Do not replace these placeholders with fabricated credentials, financial claims or contact information.
