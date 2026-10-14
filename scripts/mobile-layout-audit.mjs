/** Render the real app; prepared save is a UI fixture, not a balance measurement.
 * PLAYWRIGHT_MODULE=/absolute/path/index.mjs CHROMIUM_PATH=/path/chrome node scripts/mobile-layout-audit.mjs
 */
import {spawn} from 'node:child_process';
import {mkdirSync,writeFileSync} from 'node:fs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE??'playwright');
const output=process.env.UI_AUDIT_OUTPUT??'node_modules/.cache/mobile-layout-audit';mkdirSync(output,{recursive:true});
const server=spawn('npm',['run','dev','--','--host','127.0.0.1','--port','5176'],{stdio:'ignore'});
const results=[];let browser;
try{
 await new Promise(r=>setTimeout(r,1500));browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,headless:true,args:['--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--no-zygote']});
 for(const width of [360,390,430])for(const language of ['de','en']){
  const context=await browser.newContext({viewport:{width,height:844},isMobile:true,hasTouch:true}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400&&/\/(assets|src)\//.test(r.url()))errors.push(`${r.status()} ${r.url()}`)});
  await page.goto('http://127.0.0.1:5176');await page.waitForTimeout(250);
  await page.evaluate(async language=>{
   const e=await import('/src/economy.ts'),d=await import('/src/durableStorage.ts'),story=await import('/src/story.ts'),items=await import('/src/inventory.ts');await d.removeDurableGame();localStorage.clear();
   let s=e.addData(e.addCredits(e.newGame(Date.now(),'mobile-layout-audit'),5e9,false),1e9);s=e.buyHardwareClass(s,'calculator',81);s=e.buyHardwareClass(s,'sbc',30);
   s={...s,aiName:'AURA',gems:126,prestigeCount:1,componentInventory:Object.fromEntries(Object.keys(e.BALANCE.components).map(k=>[k,84])),settings:{...s.settings,language},story:{...s.story,tutorial:'skipped',target:null,open:null,queue:[],seen:Object.keys(story.dialogues),chapters:story.storyChapters.map(c=>c.id),enabled:false}};s={...s,completedResearch:['blueprints'],blueprintFragments:100};for(let i=0;i<4;i++)s=items.createItem(s,'quantum-chip','common');s=items.equip(s,s.inventory[0].id);await d.persistDurableGame(s,s.savedAt);
  },language);await page.reload();await page.locator('#tab-workshop').waitFor();await page.waitForTimeout(200);
  const capture=async name=>{
   await page.waitForTimeout(80);
   const check=await page.evaluate(()=>{
    const failures=[];if(document.documentElement.scrollWidth>innerWidth+1)failures.push('page overflow');
    for(const e of document.querySelectorAll('.content,.mobile-detail-sheet,.mobile-detail-sheet__body,.profile-modal,.meta-menu,.story-dialogue')){
     const r=e.getBoundingClientRect();if(!r.width||!r.height)continue;if(r.left< -1||r.right>innerWidth+1)failures.push(`${e.className}: outside viewport`);
     if(e.scrollWidth>e.clientWidth+1)failures.push(`${e.className}: horizontal overflow`);
    }return failures;
   });if(check.length)throw Error(`${width}/${language}/${name}: ${check.join('; ')}`);
   await page.screenshot({path:`${output}/${name}-${language}-${width}.png`});results.push({width,language,name});
  };
  const closeSheet=async()=>page.locator('.mobile-detail-sheet__header button').click();
  await capture('workshop');await page.locator('#tutorial-equipment').click();await capture('equipment');await page.locator('.equipment-dialog>header button').click();await page.locator('.hardware-info').first().click();await capture('hardware-detail');await closeSheet();
  await page.locator('.training-entry').click();await capture('training');await closeSheet();
  for(const tab of ['research','inventory','prestige','shop']){await page.locator(`#tab-${tab}`).click();await capture(tab)}
  await page.locator('.shop-segments button').nth(1).click();await capture('shop-permanent');
  const shop=await page.locator('.shop-grid article').first().evaluate(e=>{const a=e.querySelector('.shop-offer-info').getBoundingClientRect(),b=e.querySelector('.shop-price').getBoundingClientRect(),g=e.querySelector('.gem-amount').getBoundingClientRect();return {aligned:Math.abs(a.top-b.top)<8,sideBySide:b.left>=a.right-1,priceHeight:g.height};});
  if(!shop.sideBySide||!shop.aligned||shop.priceHeight>30)throw Error(`shop layout ${JSON.stringify(shop)}`);
  await page.locator('.shop-offer-info').first().click();await capture('shop-detail');if(!await page.locator('.mobile-detail-sheet__footer button').isDisabled())throw Error('unaffordable purchase enabled');await page.locator('.mobile-detail-sheet__header button').focus();await page.keyboard.press('Shift+Tab');if(!await page.locator('.mobile-detail-sheet').evaluate(e=>e.contains(document.activeElement)))throw Error('dialog focus escaped');await closeSheet();
  for(const index of [2,3]){await page.locator('.shop-segments button').nth(index).click();await capture(`shop-category-${index}`)}
  await page.locator('#tab-research').click();await page.locator('.research-card').first().click();await capture('research-detail');await closeSheet();
  for(const index of [1,2]){await page.locator('.research-tabs button').nth(index).click();await capture(`research-category-${index}`)}
  await page.locator('#tab-inventory').click();await page.locator('.component-tile').first().click();await capture('material-detail');await closeSheet();
  for(const index of [1,2,3]){await page.locator('.inventory-segments button').nth(index).click();await capture(`inventory-category-${index}`);if(index===2){await page.locator('.recipe-disclosure>summary').first().click();await capture('crafting-detail')}}
  await page.locator('.menu-button').click();await capture('menu');await page.locator('.meta-menu>button').first().click();await capture('profile');
  for(let index=1;index<5;index++){await page.locator('.profile-modal>nav button').nth(index).click();await capture(`profile-section-${index}`)}
  await page.locator('.profile-modal>header>button').click();await page.locator('.menu-button').click();await page.locator('[data-menu=challenges]').click();await capture('challenge-hub');await page.locator('.challenge-family>summary').first().click();await capture('challenge-detail');if((await page.locator('.challenge-stage').first().innerText()).includes('[object Object]'))throw Error('unformatted challenge value');
  await page.locator('.profile-modal>header>button').click();await page.locator('.menu-button').click();await page.locator('.meta-menu>button').last().click();await capture('settings');
  await page.locator('.diagnostic-settings>summary').click();await page.locator('.diagnostic-settings .danger').click();await capture('reset-confirm');await closeSheet();await page.locator('.profile-modal>header>button').click();
  for(const index of [1,2]){await page.locator('.menu-button').click();await page.locator('.meta-menu>button').nth(index).click();await capture(index===1?'season':'missions')}
  // Story dialogue uses the same real renderer as the clipped screenshot.
  await page.evaluate(async()=>{const d=await import('/src/durableStorage.ts'),story=await import('/src/story.ts');const s=(await d.loadDurableGame(Date.now())).state;const id=Object.keys(story.dialogues).find(id=>story.dialogues[id].speaker==='Mira');await d.persistDurableGame({...s,story:{...s.story,enabled:true,open:id}},Date.now())});await page.reload();await page.locator('.story-dialogue').waitFor();await capture('story-dialogue');
  // Active coach, independently of story pages, must stay within the shell.
  await page.evaluate(async()=>{const d=await import('/src/durableStorage.ts');const s=(await d.loadDurableGame(Date.now())).state;await d.persistDurableGame({...s,story:{...s.story,tutorial:'active',target:'training',open:null,queue:[],enabled:false}},Date.now())});await page.reload();await page.locator('.tutorial-helper').waitFor();await capture('tutorial-coach');
  await page.locator('.tutorial-helper .story-next').click();await capture('tutorial-training');await closeSheet();
  await page.setViewportSize({width,height:640});await capture('tutorial-short');await page.evaluate(()=>document.documentElement.style.fontSize='20px');await capture('tutorial-large-text');
  if(errors.length)throw Error(errors.join('\n'));await context.close();
 }
 writeFileSync(`${output}/results.json`,JSON.stringify(results,null,2));console.log(`${results.length} rendered views passed viewport checks`);
}finally{await browser?.close();server.kill()}
