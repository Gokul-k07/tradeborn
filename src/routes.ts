export const routes = [
  { key: 'home', label: 'Home', path: '/', title: 'Trade Born — Built for the Discipline of Trading', description: 'Explore Trade Born’s perspective on active markets, disciplined decisions, execution, risk and transparent reporting.' },
  { key: 'about', label: 'About', path: '/about', title: 'About Trade Born — Identity & Principles', description: 'The thinking behind Trade Born: a defined process, independent judgment, risk awareness and clear communication.' },
  { key: 'approach', label: 'Approach', path: '/approach', title: 'Trading Approach — Trade Born', description: 'Explore a proposed research-to-review trading framework, with defined inputs, decision gates and a place for choosing not to trade.' },
  { key: 'services', label: 'Services', path: '/services', title: 'Trading Services & Proposed Scope — Trade Born', description: 'Explore proposed focus areas in strategy, execution, risk frameworks and reporting. Final service scope and permissions require verification.' },
  { key: 'markets', label: 'Markets', path: '/markets', title: 'Markets & Instrument Mechanics — Trade Born', description: 'Explore stocks, indices, futures and options through clearly labelled conceptual diagrams and instrument-specific risk considerations.' },
  { key: 'performance', label: 'Reports', path: '/performance', title: 'Performance & Reporting Lab — Trade Born', description: 'Explore synthetic reporting demonstrations, observation filters and sample CSVs. These are not Trade Born performance records or forecasts.' },
  { key: 'risk', label: 'Risk', path: '/risk', title: 'Risk Management & Scenarios — Trade Born', description: 'Explore trade, portfolio and operational risk, adverse scenarios and the questions to ask before accepting market exposure.' },
  { key: 'onboarding', label: 'Onboarding', path: '/onboarding', title: 'Business Enquiry Journey — Trade Born', description: 'Prepare and review a basic business enquiry step by step. Submitting an enquiry does not open a trading account or establish a financial relationship.' },
  { key: 'contact', label: 'Contact', path: '/contact', title: 'Contact & Business Enquiries — Trade Born', description: 'Prepare a business enquiry for Trade Born. The form clearly identifies preview or configured delivery mode before submission.' },
  { key: 'legal', label: 'Legal', path: '/legal', title: 'Legal & Risk Disclosures — Trade Born', description: 'Read draft website and trading-risk disclosures, document publication status and enquiry data-handling information.' },
] as const

export type PageKey = typeof routes[number]['key'] | 'not-found'
export const pathFor = (key: PageKey) => routes.find(route => route.key === key)?.path ?? '/'
export const routeFor = (path: string): PageKey => routes.find(route => route.path === path.replace(/\/$/, '') || (route.path === '/' && path === '/'))?.key ?? 'not-found'
