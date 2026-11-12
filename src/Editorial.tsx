import { useState, type KeyboardEvent } from 'react'
import { ArrowRight, ArrowUpRight, Check, FileText, Plus, ShieldCheck } from 'lucide-react'

import { motion, useReducedMotion } from 'motion/react'
import { Collapse, DrawPath, StorySection, SwapPanel } from './Motion'

import { OnboardingEnquiry } from './EnquiryForms'
import { contactDelivery } from './contactConfig'
export { ReportingLab } from './ReportingLab'

export function RouteLink({ href, children }: { href: string; children: React.ReactNode }) {
  return <a className="route-link" href={href}>{children}<ArrowUpRight size={18} aria-hidden="true" /></a>
}

export function IdentityPlate({ number }: { number: string }) {
  const labels: Record<string, [string, string]> = {
    '01': ['IDENTITY / FIELD NOTES', 'Independent thinking. A defined point of view.'],
    '02': ['RESEARCH → DECISION → REVIEW', 'A continuous loop, with a reason for every action.'],
    '03': ['CAPABILITY / SCOPE', 'Four connected disciplines. One decision process.'],
    '04': ['EQ / IX / FT / OP', 'Explore the mechanics behind each instrument.'],
    '05': ['REPORTING / LAB', 'Demo visualization available. Verified records pending.'],
    '06': ['EXPOSURE / CONTROL / REVIEW', 'Know the limits. Revisit the assumptions.'],
    '07': ['ENQUIRE → CLARIFY → REVIEW', 'A proposed journey, before any commitment.'],
    '08': [contactDelivery.endpoint?'ENQUIRY DESK / CONFIGURED DELIVERY':'ENQUIRY DESK / PREVIEW', contactDelivery.endpoint?'Enquiries use the configured public service. Direct contact details await verification.':'Form preview only. No delivery endpoint configured.'],
    '09': ['DOCUMENT REGISTER / DRAFT', 'Business and legal approval required before launch.'],
  }
  const label = labels[number]
  return <div className="identity-plate"><span className="precision-cross" aria-hidden="true">+</span><span className="micro">{label[0]}</span><span>{label[1]}</span><span className="plate-code" aria-hidden="true">TB / {number}</span></div>
}

export function HomeIndex() {
  return <StorySection className="shell field-index"><div><span className="micro">FIELD GUIDE / TRADE BORN</span><h2>Look beyond<br/>the headline.</h2><p>Explore the thinking, the instruments and the questions that come before participation.</p></div><div className="index-links">{[
    ['/approach', '01', 'How decisions take shape', 'The trading approach'],
    ['/risk', '02', 'What deserves protection', 'Risk management'],
    ['/onboarding', '03', 'Where to begin', 'The proposed client journey'],
  ].map(([href,n,title,label]) => <a href={href} key={href}><span className="micro">{n}</span><div><h3>{title}</h3><span>{label}</span></div><ArrowUpRight size={24}/></a>)}</div></StorySection>
}

export function AboutDossier() {
  return <StorySection direction="left" className="shell identity-dossier"><div className="identity-art" aria-label="Abstract Trade Born identity study"><svg viewBox="0 0 500 440" role="img" aria-label="Three ascending bars framed by a technical construction grid"><defs><pattern id="identity-grid" width="50" height="44" patternUnits="userSpaceOnUse"><path d="M50 0H0V44" fill="none" stroke="currentColor" strokeWidth=".5"/></pattern></defs><rect width="500" height="440" fill="url(#identity-grid)"/><DrawPath d="M250 50a170 170 0 1 1 0 340a170 170 0 1 1 0-340" fill="none" stroke="currentColor"/><circle cx="250" cy="220" r="130" fill="none" stroke="currentColor" strokeDasharray="3 7"/><g fill="#c3fa68" transform="translate(155 115) skewX(-13)"><rect y="135" width="35" height="85"/><rect x="65" y="65" width="35" height="155"/><rect x="130" width="35" height="220"/></g><path d="M250 20v35M250 385v35M20 220h35M445 220h35" stroke="#c3fa68"/></svg><span className="micro">FIG. 01 / A STUDY IN STRUCTURE</span></div><div className="dossier-copy"><span className="micro">THE IDENTITY, IN PRACTICE</span><h2>Conviction needs<br/><em>a framework.</em></h2><p>Trade Born puts the work around a decision in focus: the context considered, the exposure accepted and the lessons recorded afterwards.</p><dl className="editorial-facts"><div><dt>Perspective</dt><dd>Active markets, with attention to execution and uncertainty.</dd></div><div><dt>Principle</dt><dd>A clear reason to participate—and an equally clear reason to step aside.</dd></div><div><dt>Accountability</dt><dd>Explain the process. Separate evidence from assumptions.</dd></div></dl><RouteLink href="/approach">See the decision framework</RouteLink></div></StorySection>
}

const methodology = [
  { name: 'Research', question: 'What is actually changing?', body: 'Start with market structure, liquidity, events and the wider environment. Distinguish an observation from an interpretation.', input: 'Price structure · liquidity · event calendar', output: 'A contextual research note', check: 'Is there enough information to form a view?' },
  { name: 'Define', question: 'What would make the idea valid?', body: 'Write down the thesis, the conditions required for participation and the point at which the idea no longer holds.', input: 'Research note · instrument mechanics', output: 'A conditional trade thesis', check: 'Can the premise be disproved?' },
  { name: 'Challenge', question: 'What if the thesis is wrong?', body: 'Consider adverse moves, correlated positions and execution friction before deciding whether the proposed exposure is acceptable.', input: 'Invalidation level · exposure · adverse scenarios', output: 'A risk decision: proceed, revise or pass', check: 'Is the downside understood before entry?' },
  { name: 'Execute', question: 'Do conditions still match the plan?', body: 'Recheck liquidity and the original conditions. If the setup has changed, reassess rather than forcing participation.', input: 'Approved plan · current conditions', output: 'An execution record—or a decision not to trade', check: 'Is action justified now?' },
  { name: 'Review', question: 'Was the decision well made?', body: 'Compare the plan with what happened. Record deviations and execution quality without letting the outcome rewrite the original reasoning.', input: 'Thesis · execution record · observed outcome', output: 'A review note and a testable improvement', check: 'What should feed back into research?' },
]

export function moveTab(event: KeyboardEvent<HTMLButtonElement>, index: number, length: number, select: (n: number) => void) {
  const offset = ['ArrowRight','ArrowDown'].includes(event.key) ? 1 : ['ArrowLeft','ArrowUp'].includes(event.key) ? -1 : 0
  const next = event.key === 'Home' ? 0 : event.key === 'End' ? length - 1 : offset ? (index + offset + length) % length : null
  if (next === null) return
  event.preventDefault(); select(next)
  const tabs = event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]')
  tabs?.[next]?.focus()
}

export function MethodWorkbench() {
  const [active, setActive] = useState(0)
  const step = methodology[active]
  return <StorySection className="shell method-workbench"><div className="section-caption"><span className="micro">DECISION ARCHITECTURE / 01—05</span><span className="micro">PROPOSED FRAMEWORK</span></div><div className="method-track" role="tablist" aria-label="Methodology stages">{methodology.map((s,i)=><button key={s.name} role="tab" id={`method-tab-${i}`} aria-controls="method-panel" aria-selected={i===active} tabIndex={i===active?0:-1} onClick={()=>setActive(i)} onKeyDown={e=>moveTab(e,i,5,setActive)}><span className="micro">0{i+1}</span><strong>{s.name}</strong><ArrowRight size={17}/></button>)}</div><SwapPanel identity={active} className="method-panel" id="method-panel" role="tabpanel" aria-labelledby={`method-tab-${active}`}><div className="method-orbit" aria-hidden="true"><svg viewBox="0 0 320 320"><circle cx="160" cy="160" r="130"/><circle cx="160" cy="160" r="100" strokeDasharray="2 8"/>{methodology.map((s,i)=>{const a=(i*72-90)*Math.PI/180;return <g key={s.name}><line x1="160" y1="160" x2={160+130*Math.cos(a)} y2={160+130*Math.sin(a)}/><circle className={i===active?'selected':''} cx={160+130*Math.cos(a)} cy={160+130*Math.sin(a)} r="9"/></g>})}</svg><span>0{active+1}</span><small className="micro">{step.name.toUpperCase()}</small></div><div><span className="micro">THE QUESTION</span><h2>{step.question}</h2><p>{step.body}</p><div className="method-io"><div><span className="micro">INPUT</span><p>{step.input}</p></div><ArrowRight size={20}/><div><span className="micro">OUTPUT</span><p>{step.output}</p></div></div><div className="decision-gate"><ShieldCheck size={18}/><span>{step.check}</span></div></div></SwapPanel><p className="loop-note micro">↳ REVIEW RETURNS TO RESEARCH. PASSING ON A TRADE IS A VALID DECISION.</p></StorySection>
}

const serviceDetails = [
  { title:'Trading strategy', tag:'01 / THE THINKING', intro:'Turn a market observation into a conditional decision.', text:'A thesis should explain the setup, what could invalidate it and why the instrument is appropriate. It should remain understandable after the market has moved.', outputs:['Market-context note','Entry conditions and invalidation','Scenario assumptions'], href:'/approach', link:'Explore the methodology' },
  { title:'Execution discipline', tag:'02 / THE ACTION', intro:'Close the distance between a plan and an action.', text:'Execution considerations include liquidity, timing, order behavior and the possibility that conditions change before an idea can be implemented.', outputs:['Pre-action checklist','Execution considerations','Deviation and review notes'], href:'/markets', link:'Understand the instruments' },
  { title:'Risk frameworks', tag:'03 / THE PROTECTION', intro:'Make exposure visible before it becomes a result.', text:'Sizing, related exposures and adverse scenarios belong in the same conversation. A stop level alone does not account for gaps or operational disruption.', outputs:['Exposure assumptions','Adverse scenario review','Limits and escalation questions'], href:'/risk', link:'Examine the risk framework' },
  { title:'Performance reporting', tag:'04 / THE ACCOUNTABILITY', intro:'Keep the evidence beside the headline.', text:'Reporting should show its source, period, costs and limitations. A clear presentation cannot substitute for a verified underlying record.', outputs:['Proposed report structure','Methodology and cost disclosures','Review and publication checks'], href:'/performance', link:'Visit the reporting lab' },
]
export function ServiceExplorer() {
  const [open,setOpen] = useState<number|null>(0)
  return <StorySection className="shell service-explorer"><aside><span className="micro">CAPABILITY INDEX</span><h2>From idea<br/>to review.</h2><p>Explore the intended areas of focus and the work each one involves.</p><span className="status-label">SCOPE SUBJECT TO VERIFICATION</span></aside><div>{serviceDetails.map((s,i)=><article className={`service-entry ${open===i?'is-open':''}`} key={s.title}><button aria-expanded={open===i} aria-controls={`service-${i}`} onClick={()=>setOpen(open===i?null:i)}><span className="micro">{s.tag}</span><span className="service-title">{s.title}</span><Plus size={22}/></button><Collapse open={open===i}><div className="service-detail" id={`service-${i}`}><h3>{s.intro}</h3><p>{s.text}</p><span className="micro">ILLUSTRATIVE WORKING OUTPUTS</span><ul>{s.outputs.map(x=><li key={x}><Check size={14}/>{x}</li>)}</ul><RouteLink href={s.href}>{s.link}</RouteLink></div></Collapse></article>)}</div></StorySection>
}

const instruments = [
  {name:'Stocks',code:'EQ',type:'EQUITY MARKETS',intro:'A business, a price and the liquidity between them.',body:'Listed equities bring company-specific events into a broader market context. Earnings, corporate actions and sector concentration can all change the character of a position.',axes:['Relative session →','Illustrative price'],line:'M40 190L90 175L140 185L190 120L240 140L290 90L340 110L390 65L440 85L490 45',notes:['Company events and earnings','Liquidity and concentration','Gap and overnight exposure'],mechanic:'Ownership exposure',risk:'A single company event can overwhelm a broader market view.'},
  {name:'Indices',code:'IX',type:'MARKET BENCHMARKS',intro:'One reference point. Many underlying exposures.',body:'An index expresses a basket of constituents. Weighting, market breadth and sector concentration matter as much as the headline direction.',axes:['Constituent group →','Illustrative weight'],line:'M40 200L100 200L100 165L160 165L160 130L220 130L220 100L280 100L280 75L340 75L340 55L430 55L430 40L490 40',notes:['Constituent weights and breadth','Sector and factor concentration','Correlated portfolio exposure'],mechanic:'Basket exposure',risk:'Diversification within an index does not remove market-wide risk.'},
  {name:'Futures',code:'FT',type:'DERIVATIVE CONTRACTS',intro:'A contract with a clock—and leverage.',body:'Futures require attention to contract size, expiry, margin and settlement. A small price movement can create a material change in exposure.',axes:['Underlying move →','Illustrative P / L'],line:'M40 230L490 35',notes:['Contract size and expiry','Margin and mark-to-market','Leverage and settlement'],mechanic:'Contractual exposure',risk:'Losses can exceed the initial margin committed.'},
  {name:'Options',code:'OP',type:'NONLINEAR EXPOSURE',intro:'Direction is only part of the equation.',body:'Time, volatility and the strike shape an option’s behavior. Buying and selling options carry different obligations and potentially very different loss profiles.',axes:['Underlying at expiry →','Illustrative P / L'],line:'M40 215L255 215L490 40',notes:['Strike and expiry','Time decay and volatility','Buyer rights and seller obligations'],mechanic:'Conditional exposure',risk:'Some short-option positions can involve losses beyond initial capital.'},
]

export function InstrumentDesk() {
  const initial = instruments.findIndex(m=>m.name.toLowerCase()===new URLSearchParams(window.location.search).get('instrument'))
  const [active,setActive]=useState(initial<0?0:initial)
  const m=instruments[active]
  const [probe,setProbe]=useState<number|null>(null)
  const reduced=useReducedMotion()
  const points=Array.from(m.line.matchAll(/[ML]\s*([\d.]+)[ ,]+([\d.]+)/g), match=>({x:Number(match[1]),y:Number(match[2])}))
  const inspect=(event:React.PointerEvent<SVGSVGElement>)=>{
    const box=event.currentTarget.getBoundingClientRect()
    if(!box.width||!box.height)return
    const x=(event.clientX-box.left)/box.width*540,y=(event.clientY-box.top)/box.height*290
    const closest=points.reduce((best,point,i)=>Math.hypot(point.x-x,point.y-y)<Math.hypot(points[best].x-x,points[best].y-y)?i:best,0)
    setProbe(closest)
  }
  const select=(i:number)=>{setActive(i);setProbe(null); const url=new URL(window.location.href);url.searchParams.set('instrument',instruments[i].name.toLowerCase());window.history.replaceState({...window.history.state},'',url)}
  return <StorySection className="shell instrument-desk"><div className="instrument-selector" role="tablist" aria-label="Market type">{instruments.map((x,i)=><button role="tab" id={`instrument-tab-${i}`} aria-controls="instrument-panel" tabIndex={active===i?0:-1} aria-selected={active===i} key={x.code} onClick={()=>select(i)} onKeyDown={e=>moveTab(e,i,4,select)}><span className="micro">{x.code} / 0{i+1}</span><span>{x.name}</span><ArrowUpRight size={20}/></button>)}</div><SwapPanel identity={active} role="tabpanel" id="instrument-panel" aria-labelledby={`instrument-tab-${active}`} className="instrument-panel"><div className="instrument-overview"><div><span className="micro">{m.type}</span><h2>{m.name}<span>.</span></h2><h3>{m.intro}</h3><p>{m.body}</p></div><figure className="instrument-figure"><div className="section-caption"><span className="micro">MECHANICS STUDY / {m.code}</span><span className="micro">SCHEMATIC</span></div><svg onPointerMove={event=>{if(event.pointerType==='mouse')inspect(event)}} onPointerDown={inspect} viewBox="0 0 540 290" role="img" aria-label={`${m.name}: ${m.axes[1]} against ${m.axes[0].replace(' →','')}. Conceptual diagram, not market data.`}>{[55,110,165,220].map(y=><line key={y} x1="40" y1={y} x2="500" y2={y} className="chart-grid"/>)}<DrawPath d="M40 20V250H500" className="chart-axis"/><DrawPath d={m.line} className="chart-line"/>{probe!==null&&points[probe]&&<motion.circle initial={false} animate={{cx:points[probe].x,cy:points[probe].y}} r="5" fill="var(--lime)" transition={{duration:reduced?0:.16}}/>}<text x="40" y="15">{m.axes[1]}</text><text x="265" y="280">{m.axes[0]}</text></svg><div className="instrument-probe"><label htmlFor="instrument-probe">Inspect schematic point <output>{String((probe??0)+1).padStart(2,'0')} / {points.length}</output><input id="instrument-probe" type="range" min="0" max={points.length-1} value={probe??0} aria-valuetext={`Schematic point ${(probe??0)+1} of ${points.length}. Drawing units only, not market data.`} onChange={e=>setProbe(Number(e.target.value))}/></label>{probe!==null&&<span className="micro" role="status">POINT {String(probe+1).padStart(2,'0')} / SCHEMATIC ONLY</span>}</div><figcaption>No live prices. Simplified mechanics only; costs and real-world conditions omitted.{active===3?' Long call at expiry, before premium. Not representative of all options strategies.':''}</figcaption></figure></div><div className="instrument-bottom"><div><span className="micro">EXPOSURE TYPE</span><h3>{m.mechanic}</h3></div><div><span className="micro">BEFORE PARTICIPATION</span><ul>{m.notes.map(n=><li key={n}>{n}</li>)}</ul></div><div className="instrument-risk"><ShieldCheck size={21}/><p>{m.risk}</p><RouteLink href="/risk">Understand the risks</RouteLink></div></div></SwapPanel></StorySection>
}

const scenarios = [
  {name:'Price gap',trigger:'Price moves beyond a planned exit between tradable quotes.',effect:'An intended exit level may not be available. The eventual loss can be larger than planned.',review:'Consider gap exposure, event timing and position size. An exit instruction is not a guaranteed price.'},
  {name:'Liquidity shock',trigger:'Available depth falls or the bid–ask spread widens.',effect:'Exiting may take longer or require accepting a worse price, especially for larger positions.',review:'Review normal and stressed liquidity. Avoid assuming every position can be closed immediately.'},
  {name:'Correlated exposure',trigger:'Several positions respond to the same underlying event.',effect:'Positions that appear different may lose value together; portfolio risk can be concentrated.',review:'Consider shared sectors, factors and underlying exposures across the whole book.'},
]
export function RiskConsole() {
  const [active,setActive]=useState(0);const s=scenarios[active]
  return <StorySection direction="none" className="shell risk-console"><div className="risk-blueprint"><div><span className="micro">CONTROL ARCHITECTURE / CONCEPTUAL</span><h2>Risk has<br/><em>more than<br/>one layer.</em></h2></div><figure><svg viewBox="0 0 420 380" role="img" aria-label="Nested risk layers: trade, portfolio and operations"><path d="M210 20L390 120V260L210 360L30 260V120Z"/><path d="M210 65L350 140V240L210 315L70 240V140Z"/><path d="M210 110L305 160V220L210 270L115 220V160Z"/><text x="210" y="195" textAnchor="middle">TRADE</text><text x="210" y="295" textAnchor="middle">PORTFOLIO</text><text x="210" y="345" textAnchor="middle">OPERATIONS</text><circle cx="210" cy="20" r="4"/><circle cx="390" cy="260" r="4"/><circle cx="30" cy="260" r="4"/></svg><figcaption>Position-level controls sit within portfolio exposure and operational resilience. None removes the possibility of loss.</figcaption></figure><dl><div><dt>01 / Trade</dt><dd>Thesis, size, liquidity and invalidation.</dd></div><div><dt>02 / Portfolio</dt><dd>Concentration, correlation and aggregate exposure.</dd></div><div><dt>03 / Operations</dt><dd>Systems, access, reconciliation and contingency.</dd></div></dl></div><div className="scenario-heading"><span className="micro">STRESS THE ASSUMPTIONS</span><h3>What changes when<br/>conditions change?</h3></div><div className="scenario-tabs" role="tablist" aria-label="Risk scenarios">{scenarios.map((x,i)=><button key={x.name} role="tab" id={`scenario-tab-${i}`} aria-controls="scenario-panel" aria-selected={active===i} tabIndex={active===i?0:-1} onClick={()=>setActive(i)} onKeyDown={e=>moveTab(e,i,3,setActive)}>{x.name}</button>)}</div><SwapPanel identity={active} className="scenario-panel" role="tabpanel" id="scenario-panel" aria-labelledby={`scenario-tab-${active}`}><div><span className="micro">TRIGGER</span><p>{s.trigger}</p></div><ArrowRight size={22}/><div><span className="micro">POSSIBLE EFFECT</span><p>{s.effect}</p></div><div className="scenario-review"><ShieldCheck size={22}/><span className="micro">REVIEW QUESTION</span><p>{s.review}</p></div></SwapPanel></StorySection>
}

export function JourneyTimeline() {
  const [active,setActive]=useState(0)
  const reduced=useReducedMotion()
  return <StorySection className="shell journey-layout"><aside><span className="micro">THE ENQUIRY JOURNEY</span><h2>One clear<br/>step at a time.</h2><p>Prepare a basic business enquiry, review the details and check the result. No trading account or financial relationship is created.</p><motion.div key={active} className="journey-counter" aria-hidden="true" initial={reduced?false:{opacity:.4,y:5}} animate={{opacity:1,y:0}} transition={{duration:reduced?0:.24}}>0{active+1}<span>/ 04</span></motion.div><RouteLink href="/contact">Use the contact form instead</RouteLink></aside><OnboardingEnquiry onStepChange={setActive}/></StorySection>
}

export function ContactDetails() {
  return <div className="contact-directory"><div className="section-caption"><span className="micro">CONTACT REGISTER</span><span className="status-label">NOT YET LIVE</span></div><dl><div><dt>Business email</dt><dd>Pending client verification</dd></div><div><dt>Telephone & hours</dt><dd>To be supplied by Trade Born</dd></div><div><dt>Registered / office address</dt><dd>Pending legal-entity confirmation</dd></div></dl><p>Direct contact details are awaiting client verification. Check the delivery mode shown beside the form. Please do not enter account numbers, passwords, identification documents or sensitive financial information.</p><RouteLink href="/onboarding">Understand the proposed next steps</RouteLink><RouteLink href="/legal#privacy">Privacy and data handling</RouteLink></div>
}

export function LegalRegister() {
  return <StorySection className="shell document-register"><aside><span className="micro">PUBLICATION REGISTER</span><h2>Know the status<br/>of the document.</h2><p>These are clearly marked draft disclosures. They are not a substitute for finalized, jurisdiction-specific documents.</p></aside><div><div className="register-row"><FileText size={20}/><span>Website disclosures</span><span className="status-label">DRAFT BELOW</span></div><div className="register-row"><FileText size={20}/><span>Service terms & charges</span><span className="status-label">CLIENT INPUT REQUIRED</span></div><div className="register-row"><FileText size={20}/><span>Privacy policy</span><span className="status-label">LEGAL REVIEW REQUIRED</span></div><div className="register-row"><FileText size={20}/><span>Entity & jurisdiction details</span><span className="status-label">VERIFICATION PENDING</span></div></div></StorySection>
}

export function PrivacyNote() {
  return <StorySection className="shell privacy-note" id="privacy"><span className="micro">PRIVACY / ENQUIRY DATA</span><div><h2>{contactDelivery.endpoint?<>Your enquiry.<br/>Know the route.</>:<>Your enquiry<br/>stays in this preview.</>}</h2><p>{contactDelivery.endpoint?`After validation and your submission, basic enquiry details are sent to the configured service at ${new URL(contactDelivery.endpoint).origin}. Its acknowledgement does not confirm email delivery. Review the final provider and business privacy terms before submitting real personal information.`:'The forms validate information in the browser. No delivery endpoint is configured, so preview submissions are not transmitted.'} Drafts stay in memory while the page is open; they are not saved in browser storage. No trading account is created and no analytics are connected in this implementation.</p><p>A final privacy policy must identify the legal data controller, purposes of processing, retention, lawful basis where applicable, user rights and verified contact channels before real submissions are enabled. Hosting providers may separately process ordinary connection logs.</p><RouteLink href="/contact">Return to the enquiry desk</RouteLink></div></StorySection>
}
