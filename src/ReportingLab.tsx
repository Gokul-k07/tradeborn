import { useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { Download } from 'lucide-react'
import { DrawPath, ObservationTooltip, StorySection } from './Motion'
import { demoCsv, filterDemo, windowLabels, type DemoWindow } from './demoReports'

export function ReportingLab() {
  const [view, setView] = useState<'index' | 'drawdown'>('index')
  const [window, setWindow] = useState<DemoWindow>('all')
  const [selected, setSelected] = useState(12), [inspecting, setInspecting] = useState(false), [downloadState, setDownloadState] = useState('')
  const reduced = useReducedMotion()
  const rows = filterDemo(window), point = Math.max(0, rows.findIndex(row => row.observation === selected)), row = rows[point]
  const value = (index: number) => view === 'index' ? rows[index].value : rows[index].distance
  const y = (v: number) => view === 'index' ? 240 - (v - 98) * 12 : 55 - v * 45
  const x = (index: number) => 50 + index * 583 / (rows.length - 1)
  const path = rows.map((_, i) => `${i ? 'L' : 'M'}${x(i)} ${y(value(i))}`).join(' ')
  const changeWindow = (next: DemoWindow) => { const visible = filterDemo(next); setWindow(next); if (!visible.some(row => row.observation === selected)) setSelected(visible[visible.length - 1].observation); setDownloadState(''); setInspecting(false) }
  const probe = (event: React.PointerEvent<SVGSVGElement>) => {
    const box = event.currentTarget.getBoundingClientRect()
    if (!box.width) return
    const index = Math.max(0, Math.min(rows.length - 1, Math.round(((event.clientX - box.left) / box.width * 680 - 50) / 583 * (rows.length - 1))))
    setSelected(rows[index].observation); setInspecting(true)
  }
  const download = () => {
    try {
      const url = URL.createObjectURL(new Blob([demoCsv(window)], { type: 'text/csv;charset=utf-8' }))
      const link = document.createElement('a')
      link.href = url; link.download = `trade-born-synthetic-demo-${window}.csv`
      document.body.append(link); link.click(); link.remove()
      globalThis.setTimeout(() => URL.revokeObjectURL(url), 1000)
      setDownloadState(`Synthetic CSV prepared: ${rows.length} observations from the current window. No company results are included.`)
    } catch { setDownloadState('The CSV could not be prepared in this browser. The same demo values are available in the table below.') }
  }
  return <StorySection className="shell reporting-lab">
    <div className="lab-heading"><div><span className="micro">REPORT DESIGN / INTERACTIVE DEMO</span><h2>Context beside<br/><em>every curve.</em></h2></div><p>A report should make both progress and setbacks visible. Explore this synthetic example to see how a series and its distance from a previous peak tell different stories.</p></div>
    <div className="demo-banner"><span className="status-dot"/><strong>ILLUSTRATIVE DEMO DATA</strong><span>Not Trade Born performance. Not a backtest or forecast.</span></div>
    <div className="report-controls"><label htmlFor="report-window">Observation window<select id="report-window" value={window} onChange={e => changeWindow(e.target.value as DemoWindow)}>{(Object.keys(windowLabels) as DemoWindow[]).map(key => <option key={key} value={key}>{windowLabels[key]}</option>)}</select></label><button type="button" className="download-button" onClick={download}><Download size={16}/>Download demo CSV</button></div>
    {downloadState && <p className="download-status" role="status">{downloadState}</p>}
    <div className="lab-layout"><div className="lab-chart"><div className="chart-toolbar"><div role="group" aria-label="Demo chart view"><button type="button" aria-pressed={view === 'index'} onClick={() => setView('index')}>Synthetic index</button><button type="button" aria-pressed={view === 'drawdown'} onClick={() => setView('drawdown')}>Peak distance</button></div><span className="micro">{rows.length} FICTIONAL OBSERVATIONS</span></div>
      <figure className="interactive-report" onPointerLeave={event => { if (event.pointerType === 'mouse') setInspecting(false) }}><svg onPointerMove={event => { if (event.pointerType === 'mouse') probe(event) }} onPointerDown={probe} viewBox="0 0 680 310" role="img" aria-label={`${view === 'index' ? 'Synthetic index' : 'Synthetic distance below prior peak'}, observations ${rows[0].observation} through ${rows[rows.length - 1].observation}. Fictional demonstration, not financial results.`}>
        {(view === 'index' ? [100, 105, 110, 115] : [0, -1, -2, -3, -4]).map(v => <g key={v}><line x1="50" y1={y(v)} x2="640" y2={y(v)} className="chart-grid"/><text x="3" y={y(v) + 4}>{v}</text></g>)}
        <DrawPath key={window} d={path} className="chart-line"/><motion.line initial={false} animate={{ x1: x(point), x2: x(point) }} y1="25" y2="255" className="chart-cursor" transition={{ duration: reduced ? 0 : .16 }}/><motion.circle initial={false} animate={{ cx: x(point), cy: y(value(point)) }} r="5" fill="var(--lime)" transition={{ duration: reduced ? 0 : .16 }}/>
        <text x="50" y="285">OBS {String(rows[0].observation).padStart(2, '0')}</text><text x="573" y="285">OBS {String(rows[rows.length - 1].observation).padStart(2, '0')}</text>
      </svg>{inspecting && <ObservationTooltip point={row.observation - 1} value={value(point)}/>}<figcaption>{view === 'index' ? 'Arbitrary index units; observation 01 = 100.' : 'Index-point difference from the highest synthetic observation so far, computed over the full series, including observations outside the selected window.'} No fees, dates or monetary values are represented.</figcaption></figure>
      <label className="chart-scrubber">Inspect observation <output>{String(row.observation).padStart(2, '0')} / 12</output><input type="range" min="0" max={rows.length - 1} aria-valuetext={`Observation ${row.observation}: ${value(point)} ${view === 'index' ? 'synthetic index units' : 'index points below the prior peak'}`} value={point} onChange={e => setSelected(rows[Number(e.target.value)].observation)}/></label>
    </div><aside className="lab-readout"><span className="micro">DEMO / SELECTED OBSERVATION</span><motion.strong key={`${view}-${selected}`} initial={reduced ? false : { opacity: .5 }} animate={{ opacity: 1 }} transition={{ duration: reduced ? 0 : .16 }}>{value(point)}</motion.strong><span>{view === 'index' ? 'Synthetic index units' : 'Index points below prior peak'}</span><dl><div><dt>Source</dt><dd>Hand-authored demo series</dd></div><div><dt>Method</dt><dd>{view === 'index' ? '12 arbitrary index levels' : 'Current value minus full-series running maximum'}</dd></div><div><dt>Company records</dt><dd>Not supplied / not represented</dd></div></dl><a className="route-link" href="/legal">Read reporting limitations</a></aside></div>
    <details className="demo-table"><summary>View the demo values and calculation</summary><div className="table-scroll"><table><caption>{windowLabels[window]}. Synthetic only. Peak distance = value − full-series running maximum. Select an observation to inspect it on the chart.</caption><thead><tr><th scope="col">Observation</th><th scope="col">Index units</th><th scope="col">Peak distance (points)</th></tr></thead><tbody>{rows.map(row => <tr key={row.observation} aria-current={row.observation === selected ? 'true' : undefined} data-selected={row.observation === selected}><th scope="row"><button type="button" className="observation-button" aria-label={`Inspect observation ${String(row.observation).padStart(2, '0')}`} aria-pressed={row.observation === selected} onClick={() => { setSelected(row.observation); setInspecting(true) }}>{String(row.observation).padStart(2, '0')}</button></th><td>{row.value}</td><td>{row.distance}</td></tr>)}</tbody></table></div></details>
  </StorySection>
}
