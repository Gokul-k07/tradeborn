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
- Accessible market selector tabs and reporting tabs
- Legal disclosure accordion
- Contact form validation and **prototype-only confirmation; no data is sent or stored**

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
