/** Actual app interactions; funded synthetic fixture, no natural balance claims or live commerce. */
import {spawn} from 'node:child_process';
import {mkdirSync,writeFileSync} from 'node:fs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE??'playwright');
const args=process.env.CHROMIUM_MODULE?(await import(process.env.CHROMIUM_MODULE)).default.args:['--no-sandbox'];
const out=process.env.UI_AUDIT_OUTPUT??'node_modules/.cache/surface-polish';mkdirSync(out,{recursive:true});
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port','5297'],{stdio:'ignore'});
const origin='http://127.0.0.1:5297',results=[],check=(v,message)=>{if(!v)throw Error(message)};let browser;
try{
 for(let n=0;n<80;n++){try{if((await fetch(origin)).ok)break}catch{}await new Promise(r=>setTimeout(r,150));}
 for(const [width,height,language] of [[320,640,'de'],[390,844,'de'],[430,932,'en']]){
  browser=await chromium.launch({headless:true,args,...(process.env.BROWSER_EXECUTABLE?{executablePath:process.env.BROWSER_EXECUTABLE}:{})});

  const context=await browser.newContext({viewport:{width,height},isMobile:true,hasTouch:true}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(origin+'/assets/game/model-core-v2.webp');
  await page.evaluate(async(language)=>{
   const e=await import('/src/economy.ts'),p=await import('/src/prestige.ts'),d=await import('/src/durableStorage.ts'),st=await import('/src/story.ts'),S=(await import('/src/scientificNumber.ts')).ScientificNumber;
   await d.removeDurableGame();localStorage.clear();let s=e.newGame(Date.now(),'surface-polish-fixture');
   s={...s,aiName:'AURA',prestigeCount:1,gems:10000,unspentINT:2e6,cycleINTEarned:2e6,totalINTEarned:2e6,exactEconomy:{...s.exactEconomy,unspentINT:S.from(2e6).toJSON(),cycleINTEarned:S.from(2e6).toJSON(),totalINTEarned:S.from(2e6).toJSON()},hardware:20,hardwareCounts:{...s.hardwareCounts,calculator:10,sbc:10},discovered:['calculator','sbc'],researchLevels:{...s.researchLevels,dataGeneration:3,modelArchitecture:3},intro:{...s.intro,researchUsed:true},materials:{...s.materials,families:['base']},settings:{...s.settings,language},story:{...s.story,tutorial:'skipped',target:null,open:null,queue:[],seen:Object.keys(st.dialogues),enabled:false}};
   s=e.addDataScientific(e.addCreditsScientific(s,S.from(1e10),false,false),S.from(1e12));for(const id of ['H01','F01','F02'])s=p.buyNode(s,id);s=e.startResearchProject(e.startResearchProject(s,'dataGeneration'),'modelArchitecture');await d.persistDurableGame(s,s.savedAt);
  },language);
  await page.goto(origin);await page.locator('#tab-research').click();await page.locator('.research-catalog').waitFor();
  const overflow=async()=>check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth&&document.querySelector('.content').scrollWidth<=innerWidth),'Page overflow '+await page.evaluate(()=>JSON.stringify({doc:document.documentElement.scrollWidth,content:document.querySelector('.content').scrollWidth,width:innerWidth,offenders:[...document.querySelectorAll('.shop-market *')].filter(e=>{const b=e.getBoundingClientRect();return b.right>innerWidth+1&&getComputedStyle(e).position!=='absolute'&&!e.closest('.market-tabs')}).map(e=>({tag:e.tagName,cls:typeof e.className==='string'?e.className:e.className.baseVal,parent:e.parentElement.className,left:e.getBoundingClientRect().left,right:e.getBoundingClientRect().right,width:e.getBoundingClientRect().width,scroll:e.scrollWidth})).slice(0,12)})));
  const shot=async(name)=>page.screenshot({path:`${out}/${name}-${width}-${language}.png`});
  await page.locator('.lab-overview').scrollIntoViewIfNeeded();await overflow();await shot('labs');
  await page.locator('#research-blueprints').click();await page.locator('[data-cta-state="queue"]').waitFor();check(await page.locator('[data-cta-state="queue"]').isEnabled(),'Queue action disabled');await page.locator('[data-cta-state="queue"]').click();await page.locator('.research-queue-inline li').waitFor();
  await page.locator('.research-catalog').scrollIntoViewIfNeeded();await overflow();
  check(await page.locator('.research-card.queued').count()===1,'Queued state absent');
  const cards=await page.locator('.research-card').evaluateAll(nodes=>nodes.map(n=>{const b=n.getBoundingClientRect(),title=n.querySelector('h3').getBoundingClientRect(),meta=n.querySelector('.research-card-meta').getBoundingClientRect();return{width:b.width,height:b.height,titleInside:title.left>=b.left&&title.right<=b.right,metaInside:meta.left>=b.left&&meta.right<=b.right,titleBeforeMeta:title.bottom<=meta.top+1};}));
  check(cards.every(c=>c.width>=44&&c.height>=44&&c.titleInside&&c.metaInside&&c.titleBeforeMeta),'Research geometry '+JSON.stringify(cards));await shot('research');
  await page.locator('#tab-prestige').click();await page.locator('.network-node').first().waitFor();await overflow();
  const motifs=await page.locator('.network-node[data-branch="H"] .network-node-art>[data-art-id],.network-node[data-branch="H"] .hardware-art').count();check(motifs===10,'Hardware motifs missing');check(await page.locator('#prestige-node-H01 .hardware-art').count()===1,'Owned node lost artwork');
  await page.getByRole('combobox',{name:language==='de'?'Bereich finden':'Find branch'}).selectOption('H');await page.locator('#prestige-node-H02').click();await page.locator('.v2-dialog').waitFor();await page.getByRole('button',{name:language==='de'?'Kaufen':'Buy',exact:true}).click();await page.locator('#prestige-node-H02.owned').waitFor();await page.locator('.v2-close').click();await shot('prestige');
  await page.locator('#tab-shop').click();await page.locator('.market-daily-chest').waitFor();await overflow();
  const daily=await page.locator('.market-daily-chest').evaluate(n=>{const a=n.querySelector('.shop-chest-art').getBoundingClientRect(),b=n.lastElementChild.getBoundingClientRect();return a.right<=b.left&&a.left>=n.getBoundingClientRect().left;});check(daily,'Daily chest overlaps copy');await shot('shop');
  for(const category of ['boosts','permanent','bundles']){await page.locator(`[data-market-tab="${category}"]`).click();await overflow();check(await page.locator('.shop-market [aria-selected="true"]').getAttribute('data-market-tab')===category,'Category lost');if(category!=='bundles'){await page.locator('.market-upgrade .market-art-button').first().click();await page.locator('.mobile-detail-sheet').waitFor();await page.locator('.mobile-detail-sheet__header button').click();}await shot(category);}
  const tab=page.locator('[data-market-tab="bundles"]');await tab.focus();await page.keyboard.press('Home');check(await page.locator('[data-market-tab="today"]').getAttribute('aria-selected')==='true','Shop keyboard navigation failed');
  await page.locator('.menu-button').click();await page.locator('.meta-menu').waitFor();check(await page.locator('.meta-menu svg.shop-pixel-icon').count()===6,'Menu atlas motifs missing');await shot('menu');
  await page.locator('[data-menu="settings"]').click();await page.locator('.mobile-settings').waitFor();const switches=page.getByRole('switch');check(await switches.count()===4,'Missing accessible switches');
  const effects=switches.first();await effects.uncheck();check(!await effects.isChecked(),'Effects switch failed');await effects.check();await effects.focus();await page.keyboard.press('Space');check(!await effects.isChecked(),'Switch keyboard failed');await page.keyboard.press('Space');
  const input=page.getByRole('textbox',{name:language==='de'?'Spielername':'Player name',exact:true});await input.fill('AURA QA');await page.waitForTimeout(1200);check(await input.evaluate(e=>document.activeElement===e),'Settings input focus lost');await overflow();await page.locator('.mobile-settings').evaluate(e=>e.scrollTop=0);await shot('settings');
  const geometry=await switches.evaluateAll(nodes=>nodes.map(n=>{const b=n.getBoundingClientRect(),t=getComputedStyle(n,'::after');return{width:b.width,height:b.height,thumbTransform:t.transform};}));check(geometry.every(g=>g.width>=44&&g.height>=44),'Switch touch area too small');
  await page.emulateMedia({reducedMotion:'reduce'});check(await effects.evaluate(n=>getComputedStyle(n,'::after').transitionDuration)==='0s','Reduced motion not respected');check(!errors.length,errors.join('; '));results.push({width,height,language,researchQueue:true,researchCards:cards.length,nodePurchase:true,menuIcons:6,shopCategories:true,settingsSwitches:geometry,keyboard:true,reducedMotion:true,errors});await context.close();await browser.close();browser=null;console.log('Passed',width,language);
 }
 writeFileSync(`${out}/results.json`,JSON.stringify(results,null,2));console.log(JSON.stringify(results));
}finally{await browser?.close();server.kill('SIGTERM');}
