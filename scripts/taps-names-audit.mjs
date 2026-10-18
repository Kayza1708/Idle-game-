import {spawn} from 'node:child_process';
import {mkdirSync,writeFileSync} from 'node:fs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE??'playwright');
const args=process.env.CHROMIUM_MODULE?(await import(process.env.CHROMIUM_MODULE)).default.args:['--no-sandbox'];
const out='node_modules/.cache/taps-names';mkdirSync(out,{recursive:true});
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port','5299'],{stdio:'ignore'});
const origin='http://127.0.0.1:5299',check=(v,m)=>{if(!v)throw Error(m)},results=[];let browser;
try{
 for(let i=0;i<80;i++){try{if((await fetch(origin)).ok)break}catch{}await new Promise(r=>setTimeout(r,150))}
 for(const width of [320,390,430]){
  browser=await chromium.launch({headless:true,args,...(process.env.BROWSER_EXECUTABLE?{executablePath:process.env.BROWSER_EXECUTABLE}:{})});
  const page=await browser.newPage({viewport:{width,height:844},isMobile:true,hasTouch:true}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(origin+'/favicon.png');
  await page.evaluate(async width=>{
   const e=await import('/src/economy.ts'),d=await import('/src/durableStorage.ts'),st=await import('/src/story.ts');
   await d.removeDurableGame();localStorage.clear();let s=e.newGame(Date.now());
   s={...s,aiName:'AURA',story:{...s.story,tutorial:'skipped',target:null,open:null,queue:[],seen:Object.keys(st.dialogues),enabled:false}};
   if(width===390)s={...s,hardware:82,hardwareCounts:{...s.hardwareCounts,calculator:50,sbc:25,pc:1,gpu:6},discovered:['calculator','sbc','pc','gpu'],level:10,qualityLevel:6,efficiencyLevel:4,researchLevels:{...s.researchLevels,dataGeneration:4,materialAnalysis:1,modelArchitecture:3,commercialization:1},progression:{...s.progression,critRng:1972},inventory:[{id:'relay',type:'impulse-relay',rarity:'uncommon',level:1,locked:false,forge:0,relayTaps:9}],equipped:{processor:'relay'}};
   await d.persistDurableGame(s,s.savedAt);
  },width);
  await page.goto(origin);await page.locator('#tutorial-tap').waitFor();
  await page.clock.install();await page.clock.pauseAt(new Date(Date.now()+1000));
  await page.locator('#tutorial-tap').dispatchEvent('pointerdown');await page.locator('#tutorial-tap').dispatchEvent('pointerup');
  const text=await page.locator('.tap-pop').textContent();check(text!=='+0'&&!/^\+0([,.]0+)?$/.test(text),'Zero credit animation');
  await page.evaluate(()=>window.auditFirstPop=document.querySelector('.tap-pop'));
  await page.locator('#tutorial-tap').dispatchEvent('pointerdown');await page.locator('#tutorial-tap').dispatchEvent('pointerup');
  check(await page.evaluate(()=>window.auditFirstPop===document.querySelector('.tap-pop')),'Rejected input animated a new reward');
  check(!/\+0([,.]0+)? Credits/.test(await page.locator('#tutorial-tap').getAttribute('aria-label')),'Preview displays cooldown as zero');
  await page.screenshot({path:`${out}/tap-${width}.png`});await page.clock.resume();
  await page.locator('.menu-button').click();await page.locator('[data-menu="settings"]').click();const name=page.getByRole('textbox',{name:'Spielername',exact:true});
  const previous=await name.inputValue();await name.fill('Arschloch123');await name.press('Tab');await page.getByRole('alert').filter({hasText:'Bitte wähle einen anderen Namen.'}).waitFor();
  await page.screenshot({path:`${out}/blocked-name-${width}.png`});
  await page.locator('.settings-modal>header button').click();await page.locator('.menu-button').click();await page.locator('[data-menu="settings"]').click();check(await name.inputValue()===previous,'Forbidden draft persisted');
  await name.fill('  Nova 7 ');await name.press('Enter');check(await name.inputValue()==='Nova 7','Name not normalized');await page.locator('.settings-modal>header button').click();
  await page.locator('.menu-button').click();await page.locator('[data-menu="settings"]').click();check(await name.inputValue()==='Nova 7','Valid name not saved');
  check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Page overflow');check(!errors.length,errors.join(';'));
  if(width===320){
   await page.goto(origin+'/favicon.png');
   await page.evaluate(async()=>{const e=await import('/src/economy.ts'),d=await import('/src/durableStorage.ts');await d.removeDurableGame();localStorage.clear();await d.persistDurableGame(e.newGame(Date.now()),Date.now())});
   await page.goto(origin);await page.locator('#ai-name').fill('Scheiße');await page.locator('.naming-card button[type=submit]').click();await page.locator('.naming-card [role=alert]').waitFor();check(await page.locator('.naming-card').count()===1,'Forbidden AI name accepted');
   await page.locator('#ai-name').fill('Nova 7');await page.locator('.naming-card button[type=submit]').click();await page.locator('.naming-card').waitFor({state:'detached'});
  }
  results.push({width,aiNaming:width===320?'blocked then valid name accepted':'covered at 320',fixture:width===390?'report-shaped production, critical tap and relay':'zero hardware',paidAnimation:text,cooldownHasNoNewAnimation:true,positivePreview:true,blockedNameRetainsPrevious:true,validNameNormalized:true,errors});await browser.close();browser=null;
 }
 writeFileSync(`${out}/results.json`,JSON.stringify(results,null,2));console.log(JSON.stringify(results));
}finally{await browser?.close();server.kill('SIGTERM')}
