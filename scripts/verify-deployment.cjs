/* Read-only deployment QA. Without BASE_URL, model vercel.json routing against local dist/. */
const assert=require('node:assert/strict')
const fs=require('node:fs/promises')
const path=require('node:path')
const http=require('node:http')
const {chromium}=require('playwright')
async function run(){
 const root=path.resolve(__dirname,'..'),dist=path.resolve(process.env.BUILD_DIR||path.join(root,'dist'))
 const config=JSON.parse(await fs.readFile(path.join(root,'vercel.json'),'utf8'))
 let server,base=process.env.BASE_URL
 if(!base){
  const rewrite=new RegExp('^'+config.rewrites[0].source+'$')
  server=http.createServer(async(req,res)=>{
   const url=new URL(req.url,'http://localhost');let pathname
   try{pathname=decodeURIComponent(url.pathname)}catch{res.writeHead(400);res.end();return}
   let file=path.resolve(dist,'.'+pathname)
   if(!file.startsWith(dist+path.sep)&&file!==dist){res.writeHead(404);res.end();return}
   if(pathname==='/')file=path.join(dist,'index.html')
   let data
   try{data=await fs.readFile(file)}catch{if(rewrite.test(pathname)){file=path.join(dist,'index.html');data=await fs.readFile(file)}}
   if(!data){res.writeHead(404,{'Content-Type':'text/plain'});res.end('Not found');return}
   const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.txt':'text/plain','.xml':'application/xml','.woff2':'font/woff2','.woff':'font/woff'}
   const headers={'Content-Type':types[path.extname(file)]||'application/octet-stream'}
   for(const rule of config.headers){if(new RegExp('^'+rule.source+'$').test(pathname))for(const header of rule.headers)headers[header.key]=header.value}
   res.writeHead(200,headers);res.end(data)
  })
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));base='http://127.0.0.1:'+server.address().port
 }
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']})
 try{
  const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'})
  const p=await context.newPage(),errors=[],warnings=[],responses=[],requests=[]
  p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(['warning','error'].includes(m.type()))warnings.push(m.text())});p.on('request',r=>requests.push(r.url()));p.on('response',r=>{if(r.status()>=400)responses.push(r.url())})
  const titles=new Set(),descriptions=new Set()
  for(const route of ['/','/about','/approach','/services','/markets','/performance','/risk','/onboarding','/contact','/legal']){
   await p.goto(base+route);await p.locator('main h1').waitFor();await p.evaluate(()=>document.fonts.ready)
   assert.equal(await p.locator('main h1').count(),1)
   const title=await p.title(),description=await p.locator('meta[name=description]').getAttribute('content');assert(description.length>60);titles.add(title);descriptions.add(description)
   assert.equal(await p.locator('meta[property="og:image"]').count(),1);assert.equal(await p.locator('meta[property="og:title"]').getAttribute('content'),title)
   await p.reload();await p.locator('main h1').waitFor();assert.equal(await p.locator('main').getAttribute('class'),'page-'+(route.slice(1)||'home'))
  }
  assert.equal(titles.size,10);assert.equal(descriptions.size,10)
  await p.goto(base+'/markets?instrument=options');await p.locator('#instrument-panel').waitFor();assert.equal(await p.locator('#instrument-panel h2').textContent(),'Options.')
  await p.goto(base+'/legal#privacy');await p.locator('#privacy').waitFor();await p.waitForFunction(()=>{const top=document.getElementById('privacy')?.getBoundingClientRect().top;return top>=60&&top<200})
  await p.goto(base+'/unknown-page');await p.locator('.page-not-found').waitFor();assert.equal(await p.locator('meta[name=robots]').getAttribute('content'),'noindex,follow')
  await p.goto(base+'/');await p.evaluate(()=>document.fonts.ready)
  for(const asset of ['/favicon.svg','/og-image.png','/robots.txt'])assert.equal((await p.request.get(base+asset)).status(),200,asset)
  for(const missing of ['/api/enquiry','/assets/does-not-exist.js'])assert.equal((await p.request.get(base+missing)).status(),404,missing)
  const html=await(await p.request.get(base+'/')).text();const entry=html.match(/<script[^>]+src="([^"]+)"/)[1]
  const asset=await p.request.get(base+entry);assert.equal(asset.status(),200);assert.match(asset.headers()['content-type'],/javascript/);assert.match(asset.headers()['cache-control'],/immutable/)
  assert.equal((await p.request.get(base+'/')).headers()['x-content-type-options'],'nosniff')
  assert.deepEqual(errors,[]);assert.deepEqual(warnings,[]);assert.deepEqual(responses,[])
  const cold=await browser.newPage({viewport:{width:375,height:900},reducedMotion:'reduce'});const loaded=[];cold.on('request',r=>loaded.push(r.url()))
  await cold.goto(base+'/');await cold.locator('main h1').waitFor();await cold.evaluate(()=>document.fonts.ready)
  assert(!loaded.some(url=>/\/enquiryDelivery-/.test(url)),'No delivery adapter request before submission')
  await cold.goto(base+'/contact');await cold.locator('.contact-form').waitFor()
  await cold.goto(base+'/performance');await cold.locator('.reporting-lab').waitFor()
  await cold.close()
  console.log('PASS ten direct routes/refreshes, unique metadata, public assets, privacy/query URLs, API/asset 404s, headers, on-demand delivery adapter and console checks'+(server?' (local Vercel-policy model)':' (requested URL)'))
  await context.close()
 }finally{await browser.close();if(server){server.closeAllConnections();await new Promise(resolve=>server.close(resolve))}}
}
run().catch(error=>{console.error(error);process.exit(1)})
