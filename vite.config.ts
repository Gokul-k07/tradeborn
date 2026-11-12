import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { routes } from './src/routes'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const configuredOrigin = env.VITE_SITE_URL?.trim()
  const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL
  let siteOrigin = ''
  if (configuredOrigin || vercelHost) {
    const url = new URL(configuredOrigin || `https://${vercelHost}`)
    if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash || url.pathname !== '/') throw new Error('VITE_SITE_URL must be a public HTTPS origin, with no credentials, path, query or fragment.')
    siteOrigin = url.origin
  }
  return {
    plugins: [react(), {
      name: 'trade-born-public-metadata',
      transformIndexHtml: () => ({ tags: [
        { tag: 'meta', attrs: { property: 'og:image', content: `${siteOrigin}/og-image.png` }, injectTo: 'head' },
        { tag: 'meta', attrs: { name: 'twitter:image', content: `${siteOrigin}/og-image.png` }, injectTo: 'head' },
        ...(siteOrigin ? [
          { tag: 'link', attrs: { rel: 'canonical', href: siteOrigin + '/' }, injectTo: 'head' as const },
          { tag: 'meta', attrs: { property: 'og:url', content: siteOrigin + '/' }, injectTo: 'head' as const },
        ] : []),
      ] }),
      generateBundle() {
        this.emitFile({ type: 'asset', fileName: 'robots.txt', source: `User-agent: *\nAllow: /\n${siteOrigin ? `Sitemap: ${siteOrigin}/sitemap.xml\n` : ''}` })
        if (siteOrigin) this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routes.map(route => `<url><loc>${siteOrigin}${route.path}</loc></url>`).join('')}</urlset>\n` })
      },
    }],
    base: '/',
    define: { __SITE_ORIGIN__: JSON.stringify(siteOrigin) },
  }
})
