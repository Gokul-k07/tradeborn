const assert=require('node:assert/strict')
const fs=require('node:fs')
const path=require('node:path')
const zlib=require('node:zlib')
const {execFileSync}=require('node:child_process')
const root=path.resolve(__dirname,'..'),dist=path.resolve(process.env.BUILD_DIR||path.join(root,'dist'))
const config=JSON.parse(fs.readFileSync(path.join(root,'vercel.json'),'utf8'))
const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'))
assert.equal(config.framework,'vite');assert.equal(config.installCommand,'npm ci');assert.equal(config.buildCommand,'npm run build');assert.equal(config.outputDirectory,'dist');assert.equal(pkg.engines.node,'24.x')
const match=new RegExp('^'+config.rewrites[0].source+'$')
for(const route of ['/','/about','/approach','/services','/markets','/performance','/risk','/onboarding','/contact','/legal','/unknown'])assert(match.test(route),route)
for(const route of ['/api','/api/enquiry','/assets/missing.js','/favicon.svg','/og-image.png','/robots.txt','/sitemap.xml'])assert(!match.test(route),route)
const html=fs.readFileSync(path.join(dist,'index.html'),'utf8')
assert(!html.includes('/node_modules/')&&!html.includes('/src/'),'Only built URLs in production HTML')
for(const [,url] of html.matchAll(/(?:src|href)="(\/[^"#]+)"/g))assert(fs.existsSync(path.join(dist,url)),url)
const preloads=[...html.matchAll(/<link rel="preload"[^>]*href="([^"]+)"/g)].map(m=>m[1])
assert.equal(preloads.length,2);assert(preloads.every(url=>url.endsWith('.woff2')))
assert(html.includes('og:image')&&html.includes('summary_large_image'))
const files=fs.readdirSync(path.join(dist,'assets'))
assert(files.some(name=>/^enquiryDelivery-.+\.js$/.test(name)))
const entry=html.match(/<script[^>]+src="([^"]+)"/)[1]
const js=fs.readFileSync(path.join(dist,entry))
assert(zlib.gzipSync(js).length<160*1024,'Initial JavaScript gzip budget')
for(const file of files.filter(file=>file.endsWith('.css'))){
 const css=fs.readFileSync(path.join(dist,'assets',file),'utf8');assert(zlib.gzipSync(css).length<20*1024,'CSS gzip budget')
 for(const [,raw] of css.matchAll(/url\(([^)]+)\)/g)){const url=raw.replace(/["']/g,'');if(url.startsWith('data:'))continue;assert(fs.existsSync(url.startsWith('/')?path.join(dist,url):path.resolve(dist,'assets',url)),url)}
}
const image=fs.readFileSync(path.join(dist,'og-image.png'));assert.equal(image.readUInt32BE(16),1200);assert.equal(image.readUInt32BE(20),630);assert(image.length<100*1024)
const robots=fs.readFileSync(path.join(dist,'robots.txt'),'utf8')
assert(robots.includes('User-agent: *'))
const canonical=html.match(/rel="canonical" href="([^"]+)"/)
if(canonical){
 const origin=new URL(canonical[1]).origin
 assert(html.includes(`content="${origin}/og-image.png"`),'Absolute social image URL')
 const sitemap=fs.readFileSync(path.join(dist,'sitemap.xml'),'utf8');assert.equal([...sitemap.matchAll(/<loc>/g)].length,10);assert(robots.includes(origin+'/sitemap.xml'))
}else assert(!robots.includes('Sitemap:'),'No fabricated deployment origin')
const tracked=execFileSync('git',['ls-files','--cached','--others','--exclude-standard'],{cwd:root,encoding:'utf8'}).trim().split('\n')
assert.deepEqual(tracked.filter(file=>/(^|\/)\.env(?:\.|$)/.test(file)),['.env.example'])
for(const name of ['.env','.env.local','.env.production','.vercel/project.json'])execFileSync('git',['check-ignore',name],{cwd:root})
const patterns=[/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,/AKIA[0-9A-Z]{16}/,/gh[pousr]_[a-zA-Z0-9]{30,}/]
for(const file of tracked.filter(file=>!file.endsWith('.png'))){const data=fs.readFileSync(path.join(root,file),'utf8');for(const pattern of patterns)assert(!pattern.test(data),'Potential credential format in '+file)}
console.log('PASS Vercel configuration, built assets/fonts, OG image, deferred delivery adapter, gzip budgets and tracked environment/credential-format checks')
console.log(JSON.stringify({initialJsBytes:js.length,initialJsGzip:zlib.gzipSync(js).length,ogImageBytes:image.length},null,2))
