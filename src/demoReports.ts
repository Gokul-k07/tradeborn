// Hand-authored synthetic observations. These are not company results or a backtest.
export const demoValues = [100, 103, 101, 106, 104, 109, 107, 111, 108, 112, 110, 114]
export const demoRows = demoValues.map((value, index) => ({ observation: index + 1, value, distance: value - Math.max(...demoValues.slice(0, index + 1)) }))
export type DemoWindow = 'all' | 'first' | 'last'
export const windowLabels: Record<DemoWindow, string> = { all: 'All 12 observations', first: 'First 6 observations', last: 'Last 6 observations' }
export const filterDemo = (window: DemoWindow) => window === 'first' ? demoRows.slice(0, 6) : window === 'last' ? demoRows.slice(6) : demoRows

export function demoCsv(window: DemoWindow) {
  return ['data_type,observation,index_units,peak_distance_points', ...filterDemo(window).map(row => `ILLUSTRATIVE_SYNTHETIC_DEMO,${String(row.observation).padStart(2, '0')},${row.value},${row.distance}`)].join('\r\n') + '\r\n'
}
