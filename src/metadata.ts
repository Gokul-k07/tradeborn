import { useEffect } from 'react'
import { routes, type PageKey } from './routes'

declare const __SITE_ORIGIN__: string

export function usePageMetadata(page: PageKey) {
  useEffect(() => {
    const route = routes.find(route => route.key === page)
    const title = route?.title ?? 'Page Not Found — Trade Born'
    const description = route?.description ?? 'This address does not match a Trade Born page. Return home to explore the website.'
    document.title = title
    const set = (selector: string, content: string, attribute: 'name' | 'property', key: string) => {
      let element = document.head.querySelector<HTMLMetaElement>(selector)
      if (!element) { element = document.createElement('meta'); element.setAttribute(attribute, key); document.head.append(element) }
      element.content = content
    }
    set('meta[name="description"]', description, 'name', 'description')
    set('meta[name="robots"]', route ? 'index,follow' : 'noindex,follow', 'name', 'robots')
    for (const [key, content] of [['og:title', title], ['og:description', description]]) set(`meta[property="${key}"]`, content, 'property', key)
    for (const [key, content] of [['twitter:title', title], ['twitter:description', description]]) set(`meta[name="${key}"]`, content, 'name', key)
    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (__SITE_ORIGIN__ && route) {
      const url = __SITE_ORIGIN__ + route.path
      if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.append(canonical) }
      canonical.href = url
      set('meta[property="og:url"]', url, 'property', 'og:url')
    } else { canonical?.remove(); document.head.querySelector('meta[property="og:url"]')?.remove() }
  }, [page])
}
