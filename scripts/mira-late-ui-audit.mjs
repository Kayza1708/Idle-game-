/** Prepared renderer fixtures, no gameplay timing/balance conclusions.
 * Same PLAYWRIGHT_MODULE / CHROMIUM_PATH setup as mobile-layout-audit.mjs.
 */
import {spawn} from 'node:child_process';
import {mkdirSync,writeFileSync} from 'node:fs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE??'playwright');
const output=process.env.UI_AUDIT_OUTPUT??'node_modules/.cache/mira-late-ui-audit';mkdirSync(output,{recursive:true});
const server=spawn('npm',['run','dev','--','--host','127.0.0.1','--port','5178'],{stdio:'ignore'});let browser;const results=[];
try{
 await new Promise(r=>setTimeout(r,1500));browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--no-zygote']});
 for(const width of [360,390,430])for(const language of ['de','en']){
  const context=await browser.newContext({viewport:{width,height:844},isMobile:true,hasTouch:true}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400&&/\/(assets|src)\//.test(r.url()))errors.push(`${r.status()} ${r.url()}`)});await page.goto('http://127.0.0.1:5178');await page.waitForTimeout(200);
  await page.evaluate(async language=>{
   const e=await import('/src/economy.ts'),d=await import('/src/durableStorage.ts'),i=await import('/src/inventory.ts'),story=await import('/src/story.ts'),n=await import('/src/scientificNumber.ts');await d.removeDurableGame();localStorage.clear();
   let s=e.addDataScientific(e.addCreditsScientific(e.newGame(Date.now(),'mira-late-ui'),n.ScientificNumber.fromString('1e90'),false),n.ScientificNumber.fromString('1e80'));
   s={...s,aiName:'AURA',prestigeCount:12,discovered:e.hardwareIds,hardwareCounts:Object.fromEntries(e.hardwareIds.map(id=>[id,50])),hardware:750,unlockedEquipmentSlots:3,nodes:['computeNet1','dataArchive1','labs1','labs2','analysis1'],completedResearch:Object.keys(e.BALANCE.researchProjects),researchAccessIds:[...Object.keys(e.BALANCE.researchProjects),...Object.keys(e.BALANCE.repeatableResearch)],learnedRecipes:Object.keys(e.BALANCE.itemRecipes),componentInventory:Object.fromEntries(e.componentIds.map(id=>[id,1e6])),components:20e6,materials:{...s.materials,families:Object.keys(e.BALANCE.materialFamilies),knownBlueprints:Object.keys(e.BALANCE.itemRecipes)},foundries:[0,1,2].map(()=>({level:3,active:null,queue:[]})),settings:{...s.settings,language},story:{...s.story,tutorial:'skipped',target:null,open:null,queue:[],seen:Object.keys(story.dialogues),chapters:story.storyChapters.map(c=>c.id),enabled:false}};
   for(const type of Object.keys(e.BALANCE.itemRecipes))s=i.createItem(s,type,'rare');for(const slot of e.equipmentSlots){const item=s.inventory.find(item=>e.itemTypes[item.type].slot===slot);if(item)s=i.equip(s,item.id)}
   await d.persistDurableGame(s,s.savedAt);
  },language);await page.reload();await page.locator('#tab-prestige').waitFor();await page.locator('#tab-prestige').click();
  if(await page.locator('.prestige-layer-tabs').count())throw Error('early Axioms leaked');
  const capture=async name=>{
   await page.waitForTimeout(30);const failures=await page.evaluate(()=>{const fails=[];if(document.documentElement.scrollWidth>innerWidth+1)fails.push('page overflow');for(const e of document.querySelectorAll('.mobile-detail-sheet,.mobile-detail-sheet__body,.profile-modal,.content')){const r=e.getBoundingClientRect();if(r.width&&r.height&&(r.left< -1||r.right>innerWidth+1||e.scrollWidth>e.clientWidth+1))fails.push(e.className)}return fails});if(failures.length)throw Error(`${width}/${language}/${name}: ${failures}`);await page.screenshot({path:`${output}/${name}-${language}-${width}.png`});results.push({width,language,name});
  };
  const close=async()=>page.locator('.mobile-detail-sheet__header button').click();
  const ids=await page.locator('.circuit-node').evaluateAll(nodes=>nodes.map(e=>e.id));
  for(const id of ids){await page.locator('#'+id).evaluate(e=>e.click());await page.locator('.mobile-detail-sheet').waitFor();await capture(id);if(await page.locator('.prestige-node-values').count())throw Error('legacy narrow effect boxes');await close()}
  await page.evaluate(async()=>{const d=await import('/src/durableStorage.ts'),e=await import('/src/economy.ts');const s=(await d.loadDurableGame(Date.now())).state,t=e.axiomThresholdScientific();await d.persistDurableGame({...s,cycleINTEarned:t.toNumber(),exactEconomy:{...s.exactEconomy,cycleINTEarned:t.toJSON()}},Date.now())});await page.reload();await page.locator('#tab-prestige').click();await page.locator('.prestige-layer-tabs button').last().click();await capture('axioms-reached');
  await page.locator('#tab-inventory').click();await page.locator('.inventory-segments button').last().click();await capture('items-30');await page.locator('.item-tile').first().click();await capture('item-detail');await close();
  await page.locator('.inventory-segments button').nth(2).click();await page.locator('.system-disclosure').filter({hasText:language==='de'?'Schmieden & Automation':'Foundries & automation'}).first().locator('summary').first().click();await capture('foundries');for(const index of [0,1,2]){await page.locator(`[data-foundry="${index}"]>summary`).click();await capture(`foundry-${index}`);await page.locator(`[data-foundry="${index}"]>summary`).click()}
  await page.locator('.inventory-screen .mobile-screen-title button').click();await capture('equipment-late');await page.locator('.equipment-dialog>header button').click();
  await page.locator('#tab-research').click();await capture('research-late');await page.locator('.system-disclosure').filter({hasText:language==='de'?'Forschungsautomation':'Research automation'}).first().locator('summary').first().click();await capture('research-automation');
  if(errors.length)throw Error(errors.join('\n'));await context.close();
 }
 writeFileSync(`${output}/results.json`,JSON.stringify(results,null,2));console.log(`${results.length} late-game and node views passed`);
}finally{await browser?.close();server.kill()}
