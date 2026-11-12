/* Optional development tool: regenerate the committed PNG with Playwright, not during deployment. */
const fs=require('node:fs/promises')
const path=require('node:path')
const {chromium}=require('playwright')
async function run(){
 const root=path.resolve(__dirname,'..')
 const font=await fs.readFile(path.join(root,'node_modules/@fontsource-variable/manrope/files/manrope-latin-wght-normal.woff2'))
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']})
 try{
  const page=await browser.newPage({viewport:{width:1200,height:630},deviceScaleFactor:1})
  await page.setContent(`<style>@font-face{font-family:Manrope;src:url(data:font/woff2;base64,${font.toString('base64')})}*{box-sizing:border-box}body{margin:0;width:1200px;height:630px;background:#0a0c09;color:#e9eee5;font-family:Manrope,sans-serif;padding:58px 68px;position:relative;overflow:hidden}.grid{position:absolute;inset:0;background-image:linear-gradient(#30392e55 1px,transparent 1px),linear-gradient(90deg,#30392e55 1px,transparent 1px);background-size:60px 60px;opacity:.35;mask-image:linear-gradient(90deg,transparent 25%,#000)}header{display:flex;align-items:center;gap:17px;font-size:28px;font-weight:800;letter-spacing:-.035em}.mark{height:34px;display:flex;gap:5px;align-items:end;transform:skew(-13deg)}.mark i{display:block;width:8px;background:#c3fa68}.mark i:nth-child(1){height:15px}.mark i:nth-child(2){height:25px}.mark i:nth-child(3){height:34px}h1{position:relative;font-size:98px;font-weight:600;line-height:1.08;letter-spacing:-.04em;word-spacing:.05em;margin:75px 0 0}em{color:#c3fa68;font-style:normal}footer{position:absolute;left:68px;right:68px;bottom:47px;border-top:1px solid #30392e;padding-top:19px;display:flex;justify-content:space-between;color:#a3af9a;font-size:12px;letter-spacing:.08em}.orb{position:absolute;right:-90px;top:50px;width:520px;height:520px;border:1px solid #526440;border-radius:50%;opacity:.4}.orb:before{content:'';position:absolute;inset:60px;border:1px dashed #526440;border-radius:50%}</style><div class="grid"></div><div class="orb"></div><header><span class="mark"><i></i><i></i><i></i></span><span>TRADE BORN<span style="color:#c3fa68">.</span></span></header><h1>DISCIPLINE<br/>IN <em>MOTION.</em></h1><footer><span>INDEPENDENT THINKING / DEFINED PROCESS</span><span>TRADE BORN</span></footer>`)
  await page.evaluate(()=>document.fonts.ready)
  await page.screenshot({path:path.join(root,'public/og-image.png'),type:'png'})
 }finally{await browser.close()}
}
run().catch(error=>{console.error(error);process.exit(1)})
