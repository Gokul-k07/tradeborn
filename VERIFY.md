# Verification — 12 November 2026

## Visual and content refinement

All ten existing pages retain the black / near-black, acid-lime, Manrope and DM Sans identity. The home hero's font sizes and explicit word boundaries are preserved. Each interior page now has subject-specific composition and content:

- Home: editorial field guide and instrument links that select the corresponding market.
- About: SVG identity construction study, editorial principles and the existing founder placeholder.
- Approach: five-stage research-to-review workbench with inputs, outputs and decision gates.
- Services: expandable scope descriptions, example working outputs and contextual next steps.
- Markets: keyboard-accessible instrument selection, shareable query URLs and mechanics diagrams.
- Reports: synthetic index and peak-distance charts, observation control and an accessible data table, separate from actual publication status.
- Risk: nested exposure diagram, adverse-scenario explorer and concrete review questions.
- Onboarding: an ordered, expandable proposed journey with preparation and clarification requirements.
- Contact: pending contact register, privacy link, bounded inputs and an explicit form-preview confirmation.
- Legal: document-status register, draft disclosures and an explanation of prototype data handling.

All figures in the reporting demo are hand-authored synthetic index units, not company returns, assets, a backtest, a forecast or a track record. Instrument diagrams are conceptual and explicitly omit real-world costs and conditions.

## Completed validation

- `npm run build`: passed (TypeScript and Vite production build).
- `git diff --check`: passed.
- `scripts/verify-browser.cjs` against the production preview: passed.
- All ten routes loaded directly at 320, 375, 600, 768, 820, 1024 and 1440 pixels: 70 route/viewport combinations, no detected text or document overflow.
- Fonts loaded successfully; no runtime errors or failed requests were observed.
- Inspected full-page screenshots of all ten routes at desktop and mobile sizes.
- Checked 17 main navigation CTAs, 140 desktop/footer route transitions, header home/contact controls, all mobile menu destinations and 13 unique internal anchors (including the skip link, instrument queries and privacy fragment).
- Tested all methodology stages, service panels, instruments, risk scenarios, onboarding steps and disclosure panels at 320 and 1440 pixels, including expanded-state layouts.
- Tested tab keyboard navigation, menu Escape/focus handling, body-scroll restoration on close and desktop resize, browser back/forward, back-to-top and unknown-route recovery.
- Verified demo observation 03 is index 101 and peak distance −2, and that the table exposes all 12 values.
- Required-field validation prevents empty form confirmation. Valid preview submissions show the stated local confirmation without making a POST request; dismissal works.

## Repeat the checks

Run `npm run build`, then `npm run preview` in another terminal. Chromium must be installed. Playwright is an optional verification tool, not an application dependency:

```bash
npm install --prefix /tmp/tradeborn-checks playwright@1.65.0
NODE_PATH=/tmp/tradeborn-checks/node_modules node scripts/verify-browser.cjs
```

Use `CHROMIUM_PATH` if Chromium is not at `/usr/bin/chromium`, and `BASE_URL` if preview is not on port 4173.

The Netlify and Vercel SPA rewrites remain configured. Direct deep links were exercised against Vite's production preview; a deployed Netlify/Vercel environment was not tested. Unknown paths render the in-app not-found page, while the static SPA fallback returns HTTP 200.

## Client-dependent items

- Legal entity, office address, jurisdictions and applicable permissions or registrations.
- Verified founder biography and any approved professional credentials.
- Final service scope, eligibility, charges and secure onboarding / documentation procedures.
- Verified reporting records, methodology and approval to publish actual performance.
- Approved business email, phone, hours and secure form endpoint.
- Final legal disclosures, service terms, privacy policy and data-processing details.

No new claims of credentials, client testimonials or actual financial results were introduced. No backend, message delivery, account creation or document upload is connected.

## Advanced motion and interactions

Implemented with the existing Motion dependency; no packages were added.

- Finite header/logo/nav entrance, staggered masked home headline lines, coordinated CTA/visual entrance and one-time technical-grid/path drawing.
- One-time directional section reveals and editorial text masks, preserving the established font sizes, word boundaries and section geometry.
- Active-route underline, refined hover/focus feedback and a three-pixel magnetic response restricted to mouse/fine-pointer CTAs.
- Single-panel methodology, instrument and risk transitions; service, onboarding, form-feedback and legal disclosure height/opacity transitions. Exiting content is immediately inert and hidden from accessibility APIs.
- Report curve interpolation, animated observation cursor/readout, pointer/touch tooltips and the existing keyboard range control with meaningful value text. Values remain explicitly synthetic and never update autonomously.
- Single-main route fades for internal buttons and ordinary internal anchors, including query-selected instruments and privacy fragments. History entries store independent scroll positions in the current session.
- Reduced-motion preferences remove entrances, interpolation, magnetic movement and disclosure animation. No perpetual animation loops were introduced.
- Header enter/exit thresholds prevent focus-induced expand/shrink feedback. Application scroll anchoring no longer competes with explicit history restoration.
- Preloaded the two existing local display/body font files to reduce cold-load font-swap movement. Vite correctly emits hashed production preload URLs.

### Motion validation

`npm run build`, `git diff --check`, `scripts/verify-browser.cjs` and `scripts/verify-motion.cjs` all passed against the final production preview.

The browser regression suite retained all 70 responsive route checks and the full CTA, internal-anchor, desktop/footer/mobile navigation, keyboard and history checks described above.

The motion suite exercised all ten routes at 375 and 1440 pixels with both `no-preference` and `reduce`: 40 route/preference/viewport cases, plus expanded panels and interactions. It verified finite settled animations, stable hero layout dimensions, overflow, runtime exceptions, mouse/touch chart selection, keyboard range changes, tab navigation, disclosure exits, single active page/panel IDs, menu focus containment, fragment visibility and exact back/forward scroll restoration. Hero text stayed at 46px on the tested phone and 126.72px on desktop.

Largest observed per-route CLS during initial loading and programmatic scrolling in this Chromium run:

| View | Motion enabled | Reduced motion |
| --- | ---: | ---: |
| 375px | 0 | 0 |
| 1440px | 0.000742 | 0.013237 |

The compact desktop header intentionally retains its existing height change. The test measures CLS separately for each loaded route; intentional route replacements and user-requested accordion changes are not treated as a single page-load measurement. These local automated measurements are not field Core Web Vitals results.

Desktop/mobile hero entrance frames and the report tooltip were visually inspected. No overflow, runtime exceptions, unsettled animation loops or unresolved motion regressions remained in the tested Chromium workflow. Other browser engines were not tested. Client-dependent content and live contact integration remain pending as listed above.
