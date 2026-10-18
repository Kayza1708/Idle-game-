/** Real startup/name interactions. Gates delay test I/O only; production has no artificial wait. */
import {spawn} from 'node:child_process';
import {mkdirSync,writeFileSync} from 'node:fs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE??'playwright');
const args=process.env.CHROMIUM_MODULE?(await import(process.env.CHROMIUM_MODULE)).default.args:['--no-sandbox'];
const out='node_modules/.cache/cleanup-loading';mkdirSync(out,{recursive:true});
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port','5301'],{stdio:'ignore'});
const origin='http://127.0.0.1:5301',results=[],check=(ok,message)=>{if(!ok)throw Error(message)};let browser;
try{
 for(let i=0;i<80;i++){try{if((await fetch(origin)).ok)break}catch{}await new Promise(r=>setTimeout(r,150))}
 for(const {width,height,reduced} of [{width:320,height:568,reduced:false},{width:390,height:844,reduced:false},{width:430,height:932,reduced:true}]){
  browser=await chromium.launch({headless:true,args,...(process.env.BROWSER_EXECUTABLE?{executablePath:process.env.BROWSER_EXECUTABLE}:{})});
  const context=await browser.newContext({viewport:{width,height},isMobile:true,hasTouch:true,reducedMotion:reduced?'reduce':'no-preference'}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400&&r.url().includes('/assets/'))errors.push(r.url())});
  await page.addInitScript(()=>{window.__idleLoadGate=new Promise(resolve=>window.__releaseIdleLoad=resolve)});
  let releaseBundle;const bundleGate=new Promise(resolve=>releaseBundle=resolve);
  await page.route('**/src/main.tsx',async route=>{await bundleGate;await route.continue()});
  await page.route('**/src/durableStorage.ts',async route=>{const response=await route.fetch(),body=await response.text(),patched=body.replace(/(async function loadDurableGame\([^\n]*?\) \{)/,'$1\n await window.__idleLoadGate;');check(body!==patched,'Save-loading gate not installed');await route.fulfill({response,body:patched})});
  await page.goto(origin,{waitUntil:'commit'});await page.locator('.loading-screen__icon').waitFor();
  check(await page.locator('.loading-screen__icon').evaluate(img=>img.complete&&img.naturalWidth>0),'Loading logo missing');
  await page.screenshot({path:`${out}/boot-${width}.png`});releaseBundle();
  await page.getByRole('status').filter({hasText:'Spielstand wird geladen'}).waitFor();
  check(await page.locator('.loading-screen').count()===1,'Multiple loading layers');
  check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Loading overflow');
  const tip=await page.locator('.loading-screen__tip p').textContent();
  if(width===390){await page.waitForFunction(previous=>document.querySelector('.loading-screen__tip p')?.textContent!==previous,tip,{timeout:7000})}
  if(reduced){check(await page.locator('.loading-screen__track span').evaluate(el=>getComputedStyle(el).animationName)==='none','Reduced motion ignored')}
  await page.screenshot({path:`${out}/loading-${width}.png`});await page.evaluate(()=>window.__releaseIdleLoad());
  await page.locator('.game-shell').waitFor();check(await page.locator('.loading-screen').count()===0,'Loading screen did not dismiss');
  const input=page.locator('#ai-name');await input.fill('Donald Trump');await page.locator('.naming-card button[type=submit]').click();await page.locator('#name-error').waitFor();check(await input.isVisible(),'Blocked name submitted');
  await input.fill('चूतिया');await page.locator('.naming-card button[type=submit]').click();check(await page.locator('#name-error').isVisible(),'Hindi name accepted');
  await input.fill('AURA');await page.locator('.naming-card button[type=submit]').click();await page.locator('.naming-card').waitFor({state:'detached'});
  await page.unroute('**/src/durableStorage.ts');
  await page.evaluate(async()=>{const d=await import('/src/durableStorage.ts'),story=await import('/src/story.ts');const loaded=await d.loadDurableGame(Date.now());if(!loaded||!('state' in loaded))throw Error('Missing actual saved state');let s=loaded.state;s={...s,aiName:'AURA',story:{...s.story,enabled:false,tutorial:'skipped',queue:[],open:null,target:null,seen:Object.keys(story.dialogues)}};await d.persistDurableGame(s,Date.now())});
  await page.reload();await page.locator('.game-shell').waitFor();await page.locator('.menu-button').click();await page.locator('[data-menu="settings"]').click();
  const player=page.getByRole('textbox',{name:'Spielername',exact:true});await player.fill('Put1n');await player.press('Tab');check(await player.getAttribute('aria-invalid')==='true','Player-name filter missing');
  await player.fill('Nova 7');await player.press('Tab');await page.waitForTimeout(400);
  check(await player.getAttribute('aria-invalid')==='false','Valid player name rejected');
  let persisted=false;for(let attempt=0;attempt<30;attempt++){persisted=await page.evaluate(async()=>{const d=await import('/src/durableStorage.ts'),loaded=await d.loadDurableGame(Date.now());return loaded?.state?.profile.playerName==='Nova 7'});if(persisted)break;await page.waitForTimeout(100)}check(persisted,'Player name was not saved promptly');
  await page.reload();await page.locator('.game-shell').waitFor();await page.locator('.menu-button').click();await page.locator('[data-menu="settings"]').click();check(await page.getByRole('textbox',{name:'Spielername',exact:true}).inputValue()==='Nova 7','Valid name lost after reload: '+await page.getByRole('textbox',{name:'Spielername',exact:true}).inputValue()+' / '+JSON.stringify(await page.evaluate(async()=>{const d=await import('/src/durableStorage.ts');return (await d.loadDurableGame(Date.now()))?.state?.profile})));
  check(!errors.length,errors.join('\n'));results.push({width,height,reduced,boot:true,ready:true,names:true,playerReload:true,rotatingTip:width===390});await context.close();await browser.close();
 }
 // A failed game-bundle download leaves a usable retry, without touching saves.
 browser=await chromium.launch({headless:true,args,...(process.env.BROWSER_EXECUTABLE?{executablePath:process.env.BROWSER_EXECUTABLE}:{})});
 const page=await browser.newPage();await page.route('**/src/main.tsx',route=>route.abort('failed'));await page.goto(origin);await page.getByRole('button',{name:'Erneut laden'}).waitFor();check(await page.locator('.loading-screen.is-failed').count()===1,'Missing startup recovery');await page.close();
 writeFileSync(out+'/results.json',JSON.stringify({profiles:results,retry:true},null,2));console.log(JSON.stringify({profiles:results,retry:true}));
}finally{await browser?.close();server.kill()}
