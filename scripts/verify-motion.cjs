/* Input-driven motion checks. Uses the same optional Playwright installation as verify-browser.cjs. */
const assert = require('node:assert/strict')
const { chromium } = require('playwright')
const base = process.env.BASE_URL || 'http://127.0.0.1:4173'
const routes = ['/', '/about', '/approach', '/services', '/markets', '/performance', '/risk', '/onboarding', '/contact', '/legal']
async function run() {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] })
  const results=[]
  for (const reduced of [false,true]) for (const width of [375,1440]) {
    const context=await browser.newContext({ viewport:{width,height:1000}, reducedMotion:reduced?'reduce':'no-preference', isMobile:width===375, hasTouch:width===375 })
    await context.addInitScript(()=>{
      window.__cls=0;window.__shifts=[]
      new PerformanceObserver(list=>{for(const e of list.getEntries())if(!e.hadRecentInput){window.__cls+=e.value;window.__shifts.push({value:e.value,nodes:e.sources?.map(s=>({tag:s.node?.tagName,className:s.node?.className,before:s.previousRect.toJSON(),after:s.currentRect.toJSON()}))})}}).observe({type:'layout-shift',buffered:true})
    })
    const p=await context.newPage(),errors=[]
    p.on('pageerror',error=>errors.push(error.message))
    const settle=async()=>{await p.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));await p.waitForFunction(()=>document.getAnimations().every(a=>a.playState!=='running'),null,{timeout:8000})}
    const inspect=async(label,measureCls=true)=>{
      const state=await p.evaluate(()=>({
        cls:window.__cls,
        overflow:document.documentElement.scrollWidth>innerWidth,
        infinite:document.getAnimations().filter(a=>a.playState==='running' && a.effect?.getTiming().iterations===Infinity).length,
      }))
      assert.equal(state.overflow,false,label+' overflow');assert.equal(state.infinite,0,label+' continuous animation')
      assert(!measureCls||state.cls<.05,label+' unexpected CLS: '+state.cls+' '+JSON.stringify(await p.evaluate(()=>window.__shifts)))
      return state.cls
    }
    let highestCls=0
    for(const route of routes){
      await p.goto(base+route);await p.locator('main h1').waitFor();await p.evaluate(()=>document.fonts.ready)
      await settle()
      for(let y=0;y<await p.evaluate(()=>document.documentElement.scrollHeight);y+=800){await p.evaluate(y=>window.scrollTo({top:y,behavior:'instant'}),y);await settle()}
      highestCls=Math.max(highestCls,await inspect(route))
      if(reduced)assert.equal(await p.evaluate(()=>document.getAnimations().filter(a=>a.playState==='running').length),0)
    }
    // Capture the hero at an early and settled frame; only the transform changes, never its layout box.
    await p.goto(base+'/');await p.evaluate(()=>document.fonts.ready)
    const heroBefore=await p.locator('h1').evaluate(e=>({height:e.offsetHeight,width:e.offsetWidth}))
    if(!reduced){assert.equal(await p.locator('.hero-line').count(),3);assert(await p.evaluate(()=>document.getAnimations().some(a=>a.playState==='running')))}
    await settle()
    assert.deepEqual(await p.locator('h1').evaluate(e=>({height:e.offsetHeight,width:e.offsetWidth})),heroBefore)
    assert.match(await p.locator('h1').textContent(),/^BUILT FOR/)
    if(width===1440){
      const cta=p.getByRole('button',{name:'Explore our approach',exact:true})
      const box=await cta.boundingBox();await p.mouse.move(box.x+box.width-10,box.y+box.height/2)
      if(!reduced)await p.waitForFunction(()=>{const t=getComputedStyle(document.querySelector('.pill-link')).transform;return t!=='none'&&Math.abs(new DOMMatrix(t).m41)>.2})
      if(reduced)assert.equal(await cta.evaluate(e=>Math.abs(new DOMMatrix(getComputedStyle(e).transform).m41)),0)
      await p.mouse.move(0,0);await settle()
    }
    // Immediate state change, finite disclosure motion, and no focusable content in exiting panels.
    await p.goto(base+'/services');await p.evaluate(()=>document.fonts.ready);await settle()
    const service=p.locator('.service-entry > button').first();await service.click()
    assert.equal(await service.getAttribute('aria-expanded'),'false')
    if(!reduced && await p.locator('.motion-collapse').count()){
      const hidden=await p.locator('.motion-collapse').first().getAttribute('inert');assert.notEqual(hidden,null)
    }
    await p.locator('#service-0').waitFor({state:'detached'})
    await p.locator('.service-entry > button').nth(1).click();await settle();assert.equal(await p.locator('#service-1 li').count(),3)
    await p.goto(base+'/approach');await p.getByRole('tab',{name:/Research/}).focus();await p.keyboard.press('ArrowRight')
    assert.equal(await p.getByRole('tab',{name:/Define/}).getAttribute('aria-selected'),'true');await settle();assert.equal(await p.locator('#method-panel').count(),1)
    await p.goto(base+'/markets?instrument=options');await p.getByRole('tab',{name:/Options/}).click();await settle()
    await p.getByRole('tab',{name:/Stocks/}).click();await settle();assert.equal(await p.locator('#instrument-panel').count(),1)
    await p.goto(base+'/performance');await p.locator('.interactive-report').scrollIntoViewIfNeeded();await settle()
    const svg=p.locator('.interactive-report svg'), box=await svg.boundingBox()
    const x=box.x+((50+2*53)/680)*box.width, y=box.y+box.height/2
    if(width===375)await p.touchscreen.tap(x,y);else await p.mouse.move(x,y)
    assert.equal(await p.locator('.lab-readout > strong').textContent(),'101')
    assert.match(await p.locator('.observation-tooltip').textContent(),/OBS 03/)
    await p.getByRole('button',{name:'Peak distance',exact:true}).click();await settle()
    assert.equal(await p.locator('.lab-readout > strong').textContent(),'-2')
    await p.locator('input[type=range]').focus();await p.keyboard.press('ArrowRight');assert.match(await p.locator('.chart-scrubber output').textContent(),/04/)
    await p.goto(base+'/risk');await p.getByRole('tab',{name:'Liquidity shock',exact:true}).click();await settle();assert.equal(await p.locator('#scenario-panel').count(),1)
    await p.goto(base+'/onboarding');await p.locator('.journey-timeline button').nth(2).click();await settle();assert.equal(await p.locator('#journey-2 dd').count(),2)
    await p.goto(base+'/legal');const disclosure=p.locator('.legal-item > button').nth(2);await disclosure.click();await settle();await disclosure.click();await p.locator('#legal-panel-2').waitFor({state:'detached'})
    await p.goto(base+'/contact');await p.locator('#fullName').fill('Motion check');await p.locator('#email').fill('motion@example.com');await p.locator('#message').fill('Preview validation only.');await p.getByRole('button',{name:'Validate preview'}).click();await settle();assert.equal(await p.locator('.form-notice').count(),1)
    await p.getByRole('button',{name:'Dismiss notice'}).click();await p.locator('.form-notice').waitFor({state:'detached'})
    // SPA anchors, direct URLs, history scroll restoration, single active page and keyboard focus.
    await p.goto(base+'/approach');await settle();await p.evaluate(()=>window.scrollTo({top:500,behavior:'instant'}));await settle()
    const oldScroll=await p.evaluate(()=>scrollY)
    await p.evaluate(()=>document.querySelector('.nav-contact').click())
    await p.waitForURL('**/contact');await p.locator('.page-contact').waitFor();await settle();assert.equal(await p.evaluate(()=>scrollY),0)
    await p.goBack();await p.waitForURL('**/approach');await p.locator('.page-approach').waitFor();await settle()
    const restoredScroll=await p.evaluate(()=>scrollY)
    assert(Math.abs(restoredScroll-oldScroll)<3,`Back restores scroll: expected ${oldScroll}, got ${restoredScroll}`)
    await p.goForward();await p.waitForURL('**/contact');await settle()
    assert.equal(await p.locator('main').count(),1);assert.equal(await p.locator('main:focus').count(),1)
    await p.getByRole('link',{name:'Privacy and data handling'}).click();await p.waitForURL('**/legal#privacy');await settle()
    assert.equal(await p.locator('#privacy').count(),1);assert.equal(await p.locator('main').count(),1)
    const fragmentTop=await p.locator('#privacy').evaluate(e=>e.getBoundingClientRect().top)
    assert(fragmentTop>=60 && fragmentTop<200,'Privacy fragment remains visible below header: '+fragmentTop)
    if(width===375){
      await p.getByRole('button',{name:'Open menu'}).click();await settle();await p.locator('.mobile-menu button').last().focus();await p.keyboard.press('Tab');assert.equal(await p.getByRole('button',{name:'Close menu'}).evaluate(e=>e===document.activeElement),true)
      await p.keyboard.press('Escape');await p.locator('.mobile-menu').waitFor({state:'detached'});assert.notEqual(await p.evaluate(()=>document.body.style.overflow),'hidden')
      await p.getByRole('button',{name:'Open menu'}).click();await p.locator('.mobile-menu button').first().click();await p.locator('.mobile-menu').waitFor({state:'detached'});await p.waitForURL('**/about')
    }
    await settle();await inspect('Final state',false);assert.deepEqual(errors,[])
    results.push({width,reduced,highestCls});console.log('PASS motion, charts, panels, keyboard, routes and scroll',JSON.stringify(results.at(-1)))
    await context.close()
  }
  await browser.close()
}
run().catch(error=>{console.error(error);process.exit(1)})
