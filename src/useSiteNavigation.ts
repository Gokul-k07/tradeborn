import { useEffect, useLayoutEffect, useRef, useState, type MouseEvent } from 'react'

let sequence = 0
const newKey = () => `tb-${Date.now()}-${++sequence}`
const currentUrl = () => location.pathname + location.search + location.hash

/** The History API remains the router. Each entry owns its own scroll position. */
export function useSiteNavigation() {
  const [route, setRoute] = useState(() => ({ url: currentUrl(), key: history.state?.tbMotionKey || newKey() }))
  const entry = useRef(route.key)
  const positions = useRef(new Map<string, number>())
  const destination = useRef<number | string | null>(null)

  useEffect(() => {
    history.replaceState({ ...history.state, tbMotionKey: entry.current }, '', currentUrl())
    const previous = history.scrollRestoration
    history.scrollRestoration = 'manual'
    const pop = () => {
      positions.current.set(entry.current, window.scrollY)
      const key = history.state?.tbMotionKey || newKey()
      history.replaceState({ ...history.state, tbMotionKey: key }, '', currentUrl())
      entry.current = key
      destination.current = positions.current.get(key) ?? (location.hash || 0)
      setRoute({ url: currentUrl(), key })
    }
    window.addEventListener('popstate', pop)
    return () => { history.scrollRestoration = previous; window.removeEventListener('popstate', pop) }
  }, [])

  useLayoutEffect(() => {
    if (destination.current === null) return
    const target = destination.current
    destination.current = null
    document.getElementById('main')?.focus({ preventScroll: true })
    if (typeof target === 'string') {
      let id=target.slice(1)
      try { id=decodeURIComponent(id) } catch { /* An invalid fragment must not break navigation. */ }
      document.getElementById(id)?.scrollIntoView({ behavior: 'instant' })
    } else window.scrollTo({ top: target, behavior: 'instant' })
  }, [route])

  const navigate = (url: string) => {
    if (url === currentUrl()) { window.scrollTo({ top: 0, behavior: 'instant' }); return }
    positions.current.set(entry.current, window.scrollY)
    const key = newKey()
    history.pushState({ tbMotionKey: key }, '', url)
    entry.current = key
    destination.current = new URL(url, location.origin).hash || 0
    setRoute({ url, key })
  }

  const interceptLink = (event: MouseEvent<HTMLElement>) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    const anchor = (event.target as Element).closest<HTMLAnchorElement>('a[href]')
    if (!anchor || anchor.target || anchor.hasAttribute('download')) return
    const url = new URL(anchor.href)
    if (url.origin !== location.origin || url.hash === '#main') return
    event.preventDefault()
    navigate(url.pathname + url.search + url.hash)
  }
  return { route, navigate, interceptLink }
}
