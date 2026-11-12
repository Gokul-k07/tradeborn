# Trade Born — frontend prototype

A responsive React + Vite + TypeScript frontend prototype for Trade Born. Visual direction: futuristic quant × luxury editorial.

## Setup

Requires Node.js 20.19+ or 22.12+.

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Pages

`/`, `/about`, `/approach`, `/services`, `/markets`, `/performance`, `/risk`, `/onboarding`, `/contact`, `/legal`.

Client-side routing uses the History API without a routing dependency. On static hosting, configure all unknown routes to rewrite to `/index.html`. Netlify and Vercel redirects are included. No backend is required for this prototype.

## Interactions

- Responsive mobile menu and navigation
- Scroll-based entrance animations with reduced-motion support
- Pointer-responsive abstract market structure illustration; explicitly **not live market data**
- Keyboard-accessible instrument desk with selection deep links (`/markets?instrument=options`)
- Five-stage research-to-review methodology workbench
- Expandable service scope explorer and proposed onboarding timeline
- Risk architecture diagram and interactive adverse-scenario studies
- Reporting lab with explicitly synthetic index/peak-distance views, observation scrubber and accessible data table
- Reporting status and standards tabs
- Legal disclosure accordion
- Contact validation, preview confirmation and optional public-endpoint delivery with explicit acceptance/error states
- A validated four-step onboarding enquiry with review and confirmation
- Report-window filtering, synchronized chart/table inspection and synthetic CSV downloads

## Launch blockers / information to verify

1. Confirm legal company identity, full founder bio, jurisdictions and regulatory status.
2. Confirm final permitted services, accurate onboarding/KYC flow and eligibility.
3. Provide approved physical / email / phone contact channels and a secure form destination.
4. Obtain legal and compliance review for privacy policy, terms and all risk disclosures.
5. Provide verifiable reporting records and methodology before publishing any performance claims.
6. Review all website copy and instrument descriptions with business/compliance owners.

**Do not replace placeholders with estimated returns, credentials or regulatory registrations.**

## Deployment

Free-tier static hosting such as Netlify, Vercel or Cloudflare Pages is suitable. Build command: `npm run build`; publish directory: `dist`.

## Browser regression checks

After `npm run build`, start `npm run preview` in another terminal. The browser checks use Playwright as an optional verification tool, not an application dependency:

```bash
npm install --prefix /tmp/tradeborn-checks playwright@1.65.0
NODE_PATH=/tmp/tradeborn-checks/node_modules node scripts/verify-browser.cjs
```

Chromium defaults to `/usr/bin/chromium`. Override `CHROMIUM_PATH` for your installation and `BASE_URL` for a different local preview server. The runner checks every route at seven widths, internal navigation and anchors, keyboard controls, expanded states, demo calculations, form validation and browser history. No real enquiry is submitted.

`/unknown-page` shows an in-app not-found screen. The static hosting rewrite still serves the SPA entry point with HTTP 200; a true server-side HTTP 404 would require host-specific routing configuration.

## Motion and route behavior

The motion layer uses the existing `motion/react` package. It adds a finite home entrance, one-time scroll reveals, SVG path drawing, panel transitions and input-driven chart inspection. Magnetic CTA movement is limited to three pixels and enabled only for a mouse with a fine pointer. There are no animation loops, market feeds or additional runtime dependencies.

`prefers-reduced-motion` disables entrance movement, magnetic effects, chart interpolation and disclosure animation. Controls and content remain available immediately. Closing animated panels become inert while their exit completes.

`useSiteNavigation` keeps the History API router, intercepts ordinary internal-link clicks and records scroll positions per history entry. Modified clicks retain browser behavior. Route changes mount one active main region and move keyboard focus there; browser back/forward restores the saved position. Header thresholds prevent expand/shrink feedback near a focused control.

Run the additional motion checks against the production preview:

```bash
NODE_PATH=/tmp/tradeborn-checks/node_modules node scripts/verify-motion.cjs
```

These checks cover all ten pages with motion enabled and reduced at mobile and desktop sizes, finite animations, stable hero dimensions, cumulative layout shift, mouse/touch chart inspection, disclosure exits, keyboard controls and history/fragment restoration.

## Enquiry delivery

Contact and Onboarding default to preview mode. To enable delivery, configure the public `VITE_CONTACT_ENDPOINT` before building. Never place private credentials in frontend variables. The endpoint must validate and rate-limit requests, deduplicate `submissionId` and return JSON `{ "ok": true }` after acceptance. The UI does not claim email delivery or account creation.

See [INTEGRATIONS.md](INTEGRATIONS.md) for the exact contract, required service-side controls, privacy prerequisites and the isolated integration-test workflow. No real endpoint or client destination has been configured or verified here.
