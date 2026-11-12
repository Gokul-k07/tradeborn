const assert = require('node:assert/strict')
const fs = require('node:fs/promises')
const path = require('node:path')
const http = require('node:http')
const { chromium } = require('playwright')
const { fillContact, reviewOnboarding } = require('./form-test-helpers.cjs')
const base = process.env.BASE_URL || 'http://127.0.0.1:4173'
async function downloadText(download) { const stream=await download.createReadStream();let text='';for await(const chunk of stream)text+=chunk.toString();return text }
async function run() {
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']})
 try {
  for(const width of [320,1440]){
   const context=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce',hasTouch:width===320,isMobile:width===320})
   const p=await context.newPage(),errors=[],consoleErrors=[];let posts=0
   p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')consoleErrors.push(m.text())});p.on('request',r=>{if(r.method()==='POST')posts++})
   await p.goto(base+'/contact');await p.getByRole('button',{name:'Validate preview',exact:true}).click()
   assert.equal(await p.locator('[aria-invalid=true]').count(),4);assert.equal(await p.locator('#fullName').evaluate(e=>e===document.activeElement),true)
   assert.equal(await p.locator('.form-notice').count(),0)
   await fillContact(p);await p.locator('#email').fill('bad@@example.com');await p.getByRole('button',{name:'Validate preview'}).click();assert.equal(await p.locator('#email').getAttribute('aria-invalid'),'true')
   await p.locator('#email').fill('preview@example.com');await p.getByRole('button',{name:'Validate preview'}).click()
   await p.locator('.contact-form[data-delivery-state=preview]').waitFor();assert.match(await p.locator('.form-notice').textContent(),/Nothing was transmitted/)
   assert.equal(await p.getByRole('button',{name:'Validate preview'}).isDisabled(),true);assert.equal(posts,0)
   await p.getByRole('button',{name:'Start another enquiry'}).click();assert.equal(await p.locator('#fullName').inputValue(),'')
   await fillContact(p);await p.locator('#contact-website').fill('bot entry',{force:true});await p.getByRole('button',{name:'Validate preview'}).click();await p.locator('.contact-form[data-delivery-state=error]').waitFor();assert.equal(posts,0)
   await p.goto(base+'/onboarding');assert.equal(await p.locator('.journey-step-toggle').nth(2).isDisabled(),true)
   await p.getByRole('button',{name:'Continue',exact:true}).click();assert.equal(await p.locator('#onboarding-email').getAttribute('aria-invalid'),'true')
   await reviewOnboarding(p);assert.equal(await p.locator('.enquiry-review dd').count(),6)
   await p.getByRole('button',{name:'Previous',exact:true}).click();assert.equal(await p.locator('#onboarding-subject').inputValue(),'Business scope question')
   const payload='<img src=x onerror="window.__unsafe=true"> business enquiry'
   await p.locator('#onboarding-message').fill(payload);await p.getByRole('button',{name:'Review enquiry'}).click()
   assert.equal(await p.locator('.enquiry-review img').count(),0);assert((await p.locator('.enquiry-review').textContent()).includes(payload))
   await p.getByRole('button',{name:'Confirm preview'}).click();assert.equal(await p.locator('#onboarding-acknowledgement').getAttribute('aria-invalid'),'true')
   await p.locator('#onboarding-acknowledgement').check();await p.getByRole('button',{name:'Confirm preview'}).click();await p.getByRole('heading',{name:'Preview complete.',exact:true}).waitFor()
   assert.equal(await p.locator('#enquiry-progress').getAttribute('value'),'4');assert.equal(posts,0)
   await p.getByRole('button',{name:'Start another enquiry'}).click();assert.equal(await p.locator('#onboarding-name').inputValue(),'')
   assert.equal(await p.evaluate(()=>localStorage.length+sessionStorage.length),0)
   await p.goto(base+'/performance');await p.locator('.demo-table summary').click()
   assert.equal(await p.locator('.demo-table tbody tr').count(),12)
   await p.locator('#report-window').selectOption('first');assert.equal(await p.locator('.demo-table tbody tr').count(),6);assert.equal(await p.locator('.lab-readout>strong').textContent(),'109')
   await p.locator('.chart-scrubber input').fill('2');assert.equal(await p.locator('.lab-readout>strong').textContent(),'101');assert.match(await p.locator('.demo-table [data-selected=true]').textContent(),/03101-2/)
   await p.getByRole('button',{name:'Peak distance',exact:true}).click();assert.equal(await p.locator('.lab-readout>strong').textContent(),'-2')
   await p.getByRole('button',{name:'Inspect observation 02',exact:true}).click();assert.equal(await p.locator('.lab-readout>strong').textContent(),'0');assert.match(await p.locator('.chart-scrubber output').textContent(),/02/)
   await p.locator('#report-window').selectOption('last');await p.locator('.chart-scrubber input').fill('0');assert.equal(await p.locator('.lab-readout>strong').textContent(),'-2');assert.match(await p.locator('.chart-scrubber output').textContent(),/07/)
   for(const [window,count,start] of [['last',6,'07'],['first',6,'01'],['all',12,'01']]){
    await p.locator('#report-window').selectOption(window)
    const event=p.waitForEvent('download');await p.getByRole('button',{name:'Download demo CSV'}).click();const d=await event
    assert.equal(d.suggestedFilename(),`trade-born-synthetic-demo-${window}.csv`)
    const lines=(await downloadText(d)).trim().split('\r\n');assert.equal(lines.length,count+1);assert(lines[1].startsWith('ILLUSTRATIVE_SYNTHETIC_DEMO,'+start+','))
   }
   await p.goto(base+'/markets');for(const instrument of ['Stocks','Indices','Futures','Options']){
    await p.getByRole('tab',{name:new RegExp(instrument)}).click();await p.locator('#instrument-probe').fill('1');assert.match(await p.locator('#instrument-probe').getAttribute('aria-valuetext'),/Schematic point 2/)
    await p.locator('#instrument-probe').focus();await p.keyboard.press('Home');assert.equal(await p.locator('#instrument-probe').inputValue(),'0')
    const rect=await p.locator('.instrument-figure svg').boundingBox();if(width===320)await p.touchscreen.tap(rect.x+rect.width*.6,rect.y+rect.height*.5);else await p.mouse.move(rect.x+rect.width*.6,rect.y+rect.height*.5)
    assert.match(await p.locator('.instrument-probe [role=status]').textContent(),/SCHEMATIC ONLY/)
   }
   assert.equal(await p.locator('a[href^="mailto:"],a[href^="tel:"]').count(),0,'No unverified contact links')
   await p.goto(base+'/legal#%');assert.equal(await p.locator('main h1').count(),1)
   assert.deepEqual(errors,[]);assert.deepEqual(consoleErrors,[])
   console.log('PASS preview validation, enquiry steps, safe text, synchronized reports, CSVs, market inspection at '+width)
   await context.close()
  }
  const dist=process.env.INTEGRATION_DIST
  if(!dist){console.log('SKIP configured-endpoint tests: set INTEGRATION_DIST to the separately built fixture');return}
  let mode='success';const requests=[],timers=new Set()
  const server=http.createServer(async(req,res)=>{
   const url=new URL(req.url,'http://localhost')
   if(url.pathname==='/__test/enquiry'&&req.method==='POST'){
    let body='';for await(const chunk of req)body+=chunk
    requests.push({body:JSON.parse(body),headers:req.headers})
    if(mode==='network'){req.socket.destroy();return}
    if(mode==='timeout')return
    const current=mode
    const timer=setTimeout(()=>{timers.delete(timer);if(res.destroyed)return
     if(current==='500'){res.writeHead(500,{'Content-Type':'application/json'});res.end('{"ok":false}');return}
     if(current==='429'){res.writeHead(429,{'Content-Type':'application/json'});res.end('{"ok":false}');return}
     if(current==='redirect'){res.writeHead(302,{Location:'/contact'});res.end();return}
     if(current==='empty'){res.writeHead(204,{'Content-Type':'application/json'});res.end();return}
     if(current==='jsonp'){res.writeHead(200,{'Content-Type':'application/jsonp'});res.end('{"ok":true}');return}
     if(current==='html'){res.writeHead(200,{'Content-Type':'text/html'});res.end('<html>SPA fallback</html>');return}
     res.writeHead(200,{'Content-Type':'application/json'});res.end(current==='invalid'?'not json':current==='negative'?'{"ok":false,"message":"<img src=x>"}':'{"ok":true}')
    },current==='slow'?1200:300);timers.add(timer);return
   }
   try{
    const file=url.pathname==='/favicon.svg'?'favicon.svg':url.pathname.startsWith('/assets/')?url.pathname.slice(1):'index.html'
    const data=await fs.readFile(path.join(dist,file));const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.woff2':'font/woff2','.woff':'font/woff','.svg':'image/svg+xml'}
    res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'});res.end(data)
   }catch{res.writeHead(404);res.end('Not found')}
  })
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const origin='http://127.0.0.1:'+server.address().port
  const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});const p=await context.newPage(),runtime=[]
  p.on('pageerror',e=>runtime.push(e.message))
  try{
   await context.addCookies([{name:'test-session',value:'must-not-be-sent',url:origin}])
   const start=async()=>{await p.goto(origin+'/contact');await fillContact(p)}
   await start();await p.locator('#fullName').fill(' Preview User ')
   await p.locator('.contact-form').evaluate(form=>{form.requestSubmit();form.requestSubmit()})
   await p.getByRole('button',{name:'Submitting…',exact:true}).waitFor();assert.equal(await p.locator('#fullName').isDisabled(),true)
   await p.locator('.contact-form[data-delivery-state=accepted]').waitFor();assert.equal(requests.length,1)
   assert.equal(requests[0].headers.cookie,undefined);assert.equal(requests[0].headers.authorization,undefined)
   assert.equal(requests[0].body.name,'Preview User');assert.equal(requests[0].body.source,'contact')
   assert.deepEqual(Object.keys(requests[0].body).sort(),['company','email','message','name','source','subject','submissionId','topic'].sort())
   assert.match(await p.locator('.form-notice').textContent(),/does not confirm email delivery/)
   await p.locator('.contact-form').evaluate(form=>form.requestSubmit());assert.equal(requests.length,1,'Accepted enquiry remains locked')
   for(const failure of ['500','429','html','jsonp','empty','redirect','negative','invalid','network','timeout']){
    mode=failure;await start();const before=requests.length;await p.getByRole('button',{name:'Send enquiry',exact:true}).click()
    await p.locator('.contact-form[data-delivery-state=error]').waitFor({timeout:16000})
    if(failure==='network'){assert(requests.length>=before+1);assert.equal(new Set(requests.slice(before).map(r=>r.body.submissionId)).size,1,'Transport retries retain one submission identity')}else assert.equal(requests.length,before+1)
    assert.equal(await p.locator('#subject').inputValue(),'Business scope question')
    if(failure==='timeout')assert.match(await p.locator('.form-notice').textContent(),/may have received/)
    assert.equal(await p.locator('.contact-form[data-delivery-state=accepted]').count(),0)
   }
   mode='500';await start();await p.getByRole('button',{name:'Send enquiry',exact:true}).click();await p.locator('.contact-form[data-delivery-state=error]').waitFor()
   const failedId=requests.at(-1).body.submissionId;mode='success';await p.getByRole('button',{name:'Send enquiry',exact:true}).click();await p.locator('.contact-form[data-delivery-state=accepted]').waitFor();assert.equal(requests.at(-1).body.submissionId,failedId,'Retries reuse idempotency identity')
   await p.goto(origin+'/onboarding');await reviewOnboarding(p);await p.locator('#onboarding-acknowledgement').check();mode='slow';const before=requests.length
   await p.locator('.journey-enquiry').evaluate(form=>{form.requestSubmit();form.requestSubmit()})
   await p.getByRole('button',{name:'Submitting…',exact:true}).waitFor();assert.equal(await p.getByRole('button',{name:'Previous',exact:true}).isDisabled(),true)
   await p.getByRole('heading',{name:'Enquiry accepted.',exact:true}).waitFor();assert.equal(requests.length,before+1);assert.equal(requests.at(-1).body.source,'onboarding')
   mode='slow';await start();await p.getByRole('button',{name:'Send enquiry',exact:true}).click();await p.getByRole('button',{name:'Submitting…',exact:true}).waitFor();await p.locator('.desktop-nav').getByRole('button',{name:'About',exact:true}).click();await p.waitForURL('**/about')
   assert.deepEqual(runtime,[])
   console.log('PASS real local HTTP integration: JSON acceptance, loading, single flight, credential omission, 500/429/HTML/JSONP/empty/redirect/negative/malformed/network/timeout errors, idempotent retry, onboarding delivery and navigation abort')
  }finally{await context.close();for(const timer of timers)clearTimeout(timer);server.closeAllConnections();await new Promise(resolve=>server.close(resolve))}
 }finally{await browser.close()}
}
run().catch(error=>{console.error(error);process.exit(1)})
