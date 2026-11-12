/* Run against npm run preview. See VERIFY.md for the optional Playwright runner. */
const assert = require('node:assert/strict')
const { chromium } = require('playwright')
const {fillContact,reviewOnboarding}=require('./form-test-helpers.cjs')
const base = process.env.BASE_URL || 'http://127.0.0.1:4173'
const routes = ['/', '/about', '/approach', '/services', '/markets', '/performance', '/risk', '/onboarding', '/contact', '/legal']
const navigation = { About: '/about', Approach: '/approach', Services: '/services', Markets: '/markets', Reports: '/performance', Risk: '/risk', Onboarding: '/onboarding', Contact: '/contact', Legal: '/legal' }
const ctas = {
  'Explore our approach': '/approach', 'Get to know us': '/about',
  'Read about Process over impulse.': '/approach', 'Read about Risk before reward.': '/risk', 'Read about Clarity over noise.': '/approach',
  'Discover the markets': '/markets', 'Our risk framework': '/risk', 'Explore reporting': '/performance',
  'Go to contact page': '/contact', 'Connect with Trade Born': '/contact',
  'Where risk enters the process': '/risk', 'How scope is clarified': '/onboarding',
  'Read the risk disclosures': '/legal', 'Read the disclosures': '/legal',
}
async function run() {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox'] })
  const page = await browser.newPage({ reducedMotion: 'reduce' })
  const errors = [], failures = [], links = new Set()
  page.on('pageerror', e => errors.push(e.message))
  page.on('requestfailed', r => {
    // Chromium may cancel an asynchronous favicon load when the next route is opened.
    if(r.failure()?.errorText==='net::ERR_ABORTED' && new URL(r.url()).pathname==='/favicon.svg')return
    failures.push(r.url())
  })
  const visit = async path => {
    const response = await page.goto(base + path)
    assert.equal(response.status(), 200, path)
    await page.evaluate(() => document.fonts.ready)
    assert.equal(await page.locator('main h1').count(), 1, 'One h1: ' + path)
    assert.equal(await page.locator('.page-not-found').count(), 0, path)
    const expected=new URL(path,base).pathname.replace(/\/$/,'').slice(1)||'home'
    assert.equal(await page.locator('main').getAttribute('class'),'page-'+expected)
  }
  const checkLayout = async label => {
    const problems = await page.evaluate(() => {
      const issues = []
      for (const e of document.querySelectorAll('h1,h2,h3,p,button,a,.micro,dt,dd')) {
        const box = e.getBoundingClientRect()
        if (!box.width || !box.height || getComputedStyle(e).visibility === 'hidden') continue
        const range = document.createRange(); range.selectNodeContents(e)
        if ([...range.getClientRects()].some(r => r.right > innerWidth + 2 || r.left < -2)) issues.push(e.textContent.slice(0,80))
      }
      if (document.documentElement.scrollWidth > innerWidth) issues.push('Document overflow')
      return issues
    })
    assert.deepEqual(problems, [], label)
  }
  // Every route loads directly, retains its font faces, and fits phone/tablet/desktop widths.
  for (const width of [320, 375, 600, 768, 820, 1024, 1440]) {
    await page.setViewportSize({ width, height: 1000 })
    for (const route of routes) {
      await visit(route); await checkLayout(width + ' ' + route)
      assert(await page.evaluate(() => document.fonts.check('600 32px "Manrope Variable"') && document.fonts.check('400 16px "DM Sans Variable"')))
      for (const href of await page.locator('a[href]').evaluateAll(items => items.map(a => a.getAttribute('href')))) links.add(href)
    }
  }
  console.log('PASS 70 direct-route responsive checks and font loading')
  // Exercise navigation menus from every page; inspect the actual URL and selected page.
  await page.setViewportSize({ width: 1440, height: 1000 })
  let checkedCtas = 0
  for (const route of routes) {
    await visit(route)
    const buttons = await page.locator('main button').evaluateAll(items => items.map(b => b.getAttribute('aria-label') || b.textContent.trim()))
    for (const name of buttons.filter(n => ctas[n])) {
      await visit(route)
      await page.getByRole('button', { name, exact: true }).click()
      assert.equal(new URL(page.url()).pathname, ctas[name], name)
      assert.equal(await page.locator('main:focus').count(), 1, 'Focus follows navigation')
      checkedCtas++
    }
    for (const [name, path] of Object.entries(navigation)) {
      await visit(route)
      await page.locator('.footer-nav').getByRole('button', { name, exact: true }).click()
      assert.equal(new URL(page.url()).pathname, path)
    }
    for (const [name, path] of Object.entries(navigation).slice(0,5)) {
      await visit(route)
      await page.locator('.desktop-nav').getByRole('button', { name, exact: true }).click()
      assert.equal(new URL(page.url()).pathname, path)
    }
    await visit(route); await page.locator('.nav-contact').click(); assert.equal(new URL(page.url()).pathname, '/contact')
    await visit(route); await page.locator('header .wordmark').click(); assert.equal(new URL(page.url()).pathname, '/')
  }
  console.log(`PASS ${checkedCtas} main CTAs, 140 desktop/footer routes, contact and home buttons`)
  for (const width of [320, 1440]) {
    await page.setViewportSize({ width, height: 1000 })
    await visit('/approach')
    for (const name of ['Research','Define','Challenge','Execute','Review']) {
      await page.getByRole('tab', { name: new RegExp(name) }).click()
      assert.match(await page.locator('#method-panel').getAttribute('aria-labelledby'), /method-tab/)
      await checkLayout('Method ' + name)
    }
    await page.getByRole('tab', { name: /Research/ }).focus(); await page.keyboard.press('End')
    assert.equal(await page.getByRole('tab', { name: /Review/ }).getAttribute('aria-selected'), 'true')
    await page.keyboard.press('Home'); assert.equal(await page.getByRole('tab', { name: /Research/ }).getAttribute('aria-selected'), 'true')
    await visit('/services')
    for (let i=0;i<4;i++) {
      const button=page.locator('.service-entry > button').nth(i)
      if (await button.getAttribute('aria-expanded') !== 'true') await button.click()
      assert.equal(await page.locator(`#service-${i} li`).count(),3)
      for(const href of await page.locator(`#service-${i} a[href]`).evaluateAll(items=>items.map(a=>a.getAttribute('href'))))links.add(href)
      await checkLayout('Service ' + i)
      await button.click(); assert.equal(await button.getAttribute('aria-expanded'),'false')
    }
    await visit('/markets')
    for (const name of ['Stocks','Indices','Futures','Options']) {
      await page.getByRole('tab',{name:new RegExp(name)}).click()
      assert.equal(await page.locator('#instrument-panel h2').textContent(),name+'.')
      assert.equal(new URL(page.url()).searchParams.get('instrument'),name.toLowerCase())
      await checkLayout('Market ' + name)
    }
    await page.reload(); assert.equal(await page.locator('#instrument-panel h2').textContent(),'Options.')
    await page.getByRole('tab',{name:/Options/}).focus();await page.keyboard.press('ArrowRight')
    assert.equal(await page.locator('#instrument-panel h2').textContent(),'Stocks.')
    await visit('/performance')
    await page.getByRole('button',{name:'Peak distance',exact:true}).click()
    await page.locator('input[type=range]').fill('2')
    assert.equal(await page.locator('.lab-readout > strong').textContent(),'-2')
    await page.getByRole('button',{name:'Synthetic index',exact:true}).click()
    assert.equal(await page.locator('.lab-readout > strong').textContent(),'101')
    await page.locator('.demo-table summary').click(); assert.equal(await page.locator('.demo-table tbody tr').count(),12)
    await page.getByRole('tab',{name:'Reporting standards'}).click();assert.equal(await page.locator('.method-grid > div').count(),6)
    await checkLayout('Reporting controls')
    await page.getByRole('tab',{name:'Reporting standards'}).focus();await page.keyboard.press('Home');assert.equal(await page.getByRole('tab',{name:'Reporting status'}).getAttribute('aria-selected'),'true')
    await page.keyboard.press('End');assert.equal(await page.getByRole('tab',{name:'Reporting standards'}).getAttribute('aria-selected'),'true')
    await visit('/risk')
    for (const name of ['Price gap','Liquidity shock','Correlated exposure']) {
      await page.getByRole('tab',{name,exact:true}).click();await checkLayout('Scenario ' + name)
      const id=await page.getByRole('tab',{name,exact:true}).getAttribute('id')
      assert.equal(await page.locator('#scenario-panel').getAttribute('aria-labelledby'),id)
    }
    await visit('/onboarding')
    await checkLayout('Onboarding details')
    await reviewOnboarding(page)
    assert.equal(await page.locator('.enquiry-review dd').count(),6)
    await checkLayout('Onboarding review')
    await page.locator('#onboarding-acknowledgement').check()
    await page.getByRole('button',{name:'Confirm preview',exact:true}).click()
    await page.getByRole('heading',{name:'Preview complete.',exact:true}).waitFor()
    await checkLayout('Onboarding confirmation')
    await visit('/legal')
    for (const button of await page.locator('.legal-item > button').all()) {
      if(await button.getAttribute('aria-expanded')!=='true')await button.click()
      assert.equal(await page.locator('#'+await button.getAttribute('aria-controls')).count(),1)
      await checkLayout('Disclosure');await button.click();assert.equal(await button.getAttribute('aria-expanded'),'false')
    }
    await visit('/contact')
    await page.getByRole('button',{name:'Validate preview'}).click();assert.equal(await page.locator('.form-notice').count(),0)
    await fillContact(page)
    let submissions=0
    const request=r=>{if(r.method()==='POST')submissions++}
    page.on('request',request)
    await page.getByRole('button',{name:'Validate preview'}).click();assert.equal(await page.locator('.form-notice').count(),1);assert.equal(submissions,0)
    page.off('request',request);await checkLayout('Form confirmation')
    await page.getByRole('button',{name:'Dismiss notice'}).click();assert.equal(await page.locator('.form-notice').count(),0)
    console.log('PASS interactions and expanded-state layouts at '+width)
  }
  // All mobile-menu routes, close behavior, focus containment and browser history.
  await page.setViewportSize({width:375,height:900})
  for (const [name,path] of Object.entries(navigation)) {
    await visit('/')
    await page.getByRole('button',{name:'Open menu'}).click()
    await page.locator('.mobile-menu button').first().waitFor({state:'visible'})
    await page.locator('.mobile-menu').getByRole('button',{name:new RegExp(name+'$')}).click()
    assert.equal(new URL(page.url()).pathname,path)
    await page.locator('.mobile-menu').waitFor({state:'detached'})
    assert.notEqual(await page.evaluate(()=>document.body.style.overflow),'hidden')
  }
  await page.getByRole('button',{name:'Open menu'}).click();await page.keyboard.press('Escape');await page.locator('.mobile-menu').waitFor({state:'detached'})
  assert.equal(await page.getByRole('button',{name:'Open menu'}).evaluate(e=>e===document.activeElement),true)
  await page.getByRole('button',{name:'Open menu'}).click();await page.setViewportSize({width:1440,height:1000});await page.locator('.mobile-menu').waitFor({state:'detached'});assert.notEqual(await page.evaluate(()=>document.body.style.overflow),'hidden')
  await visit('/');await page.getByRole('button',{name:'Explore our approach',exact:true}).click();await page.getByRole('button',{name:'Where risk enters the process',exact:true}).click()
  await page.goBack();await page.waitForURL('**/approach');await page.locator('.page-approach').waitFor();assert.equal(new URL(page.url()).pathname,'/approach');await page.goForward();await page.waitForURL('**/risk');await page.locator('.page-risk').waitFor();assert.equal(new URL(page.url()).pathname,'/risk')
  await page.goto(base+'/unknown-page');assert.equal(await page.locator('.page-not-found').count(),1);await page.getByRole('button',{name:'Return home'}).click();assert.equal(new URL(page.url()).pathname,'/')
  await visit('/');await page.getByRole('button',{name:'BACK TO TOP ↑',exact:true}).click();assert.equal(await page.evaluate(()=>scrollY),0)
  // Resolve every unique internal anchor, including query-selected markets and privacy fragments.
  for (const href of links) {
    if (href === '#main') continue
    const url = new URL(href, base)
    assert.equal(url.origin, new URL(base).origin, 'No unintended external destinations')
    assert(routes.includes(url.pathname), href)
    await visit(url.pathname + url.search + url.hash)
    if (url.hash) assert.equal(await page.locator(url.hash).count(), 1, href)
    if (url.searchParams.has('instrument')) assert.equal((await page.locator('[aria-selected=true]').textContent()).toLowerCase().includes(url.searchParams.get('instrument')), true)
  }
  assert.deepEqual(errors,[]);assert.deepEqual(failures,[])
  console.log(`PASS ${links.size} unique internal anchors, mobile navigation, history, unknown-route recovery; no runtime/network errors`)
  await browser.close()
}
run().catch(error=>{console.error(error);process.exit(1)})
