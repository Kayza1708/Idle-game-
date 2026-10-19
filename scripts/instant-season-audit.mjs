/** Browser acceptance against the real app. Synthetic funded save; never a natural balance profile. */
import {spawn} from 'node:child_process';
import {mkdirSync,writeFileSync} from 'node:fs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE??'playwright');
const args=process.env.CHROMIUM_MODULE?(await import(process.env.CHROMIUM_MODULE)).default.args:['--no-sandbox'];
const out=process.env.UI_AUDIT_OUTPUT??'node_modules/.cache/instant-season';mkdirSync(out,{recursive:true});
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port','5291'],{stdio:'ignore'});
const origin='http://127.0.0.1:5291',errors=[],results=[];let browser;
const check=(value,message)=>{if(!value)throw Error(message)};
try{
 for(let i=0;i<80;i++){try{if((await fetch(origin)).ok)break}catch{}await new Promise(r=>setTimeout(r,150));}
 browser=await chromium.launch({headless:true,args,...(process.env.BROWSER_EXECUTABLE?{executablePath:process.env.BROWSER_EXECUTABLE}:{})});
 const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});page.on('pageerror',e=>errors.push(e.message));
 await page.goto(origin);await page.waitForSelector('#tab-inventory');
 await page.evaluate(async()=>{
  const e=await import('/src/economy.ts'),d=await import('/src/durableStorage.ts'),i=await import('/src/inventory.ts'),p=await import('/src/prestige.ts'),S=(await import('/src/scientificNumber.ts')).ScientificNumber,m=await import('/src/missions.ts');
  await d.removeDurableGame();localStorage.clear();let s=e.newGame(Date.now(),'instant-browser-fixture');
  s={...s,aiName:'AURA',prestigeCount:1,unspentINT:2e6,cycleINTEarned:2e6,totalINTEarned:2e6,exactEconomy:{...s.exactEconomy,unspentINT:S.from(2e6).toJSON(),cycleINTEarned:S.from(2e6).toJSON(),totalINTEarned:S.from(2e6).toJSON()},hardware:10,hardwareCounts:{...s.hardwareCounts,calculator:10},learnedRecipes:Object.keys(e.BALANCE.itemRecipes),completedResearch:['blueprints'],modules:{computeBus:100,dataLattice:100},materials:{...s.materials,families:['base']},progression:{...s.progression,lab:true,labSeed:true,tutorial:null},story:{...s.story,tutorial:'skipped',queue:[],open:null,target:null,enabled:false,seen:Object.keys((await import('/src/story.ts')).dialogues)},season:{...s.season,xp:10000}};
  s=e.grantComponents(e.addDataScientific(e.addCreditsScientific(s,S.from(1e7),false,false),S.from(1e5)),Object.fromEntries(e.componentIds.map(id=>[id,10000])));s=p.buyNode(s,'W07');
  for(let n=0;n<3;n++)s=i.createItem(s,'impulse-relay','common');s=i.createItem(s,'memory-crystal','uncommon');s=i.createItem(s,'field-scanner','rare');s=m.rollPeriods(s,s.savedAt);await d.persistDurableGame(s,s.savedAt);
 });
 await page.reload();await page.waitForSelector('.core-video-offer');
 const overflow=async()=>check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Page overflow');
 await overflow();await page.screenshot({path:`${out}/core-video.png`});
 await page.locator('#forge-model-entry').count();await page.locator('#tutorial-model-entry').click();await page.locator('.loadout-console').waitFor();
 for(const family of ['processor','core','research'])check(await page.locator(`.loadout-slot[data-slot-family="${family}"]`).count()===2,`Family ${family} missing`);
 await page.screenshot({path:`${out}/equipment.png`});await page.locator('.loadout-slot').filter({has:page.getByText('Prozessor I',{exact:true})}).click();await page.locator('.loadout-item-grid button').first().click();await page.locator('.loadout-equip').click();await page.locator('.item-action-toast').waitFor();await page.waitForTimeout(3200);await page.screenshot({path:`${out}/equipment-picker.png`});await page.locator('.loadout-console>header>button').click();
 await page.locator('#tab-inventory').click();await page.getByRole('button',{name:'Bauplan auswählen',exact:true}).click();await page.locator('.forge-recipe-grid button').filter({hasText:'Impulsrelais'}).click();await page.locator('#tutorial-recipe-impulse-relay').click();await page.locator('.forge-action-stage[data-forge-action="craft"]').waitFor();await page.waitForTimeout(600);await page.screenshot({path:`${out}/instant-craft.png`});await page.keyboard.press('Escape');
 check(await page.locator('.forge-order').filter({hasText:'Fertigung läuft'}).count()===0,'Unexpected timed item order');
 await page.getByRole('button',{name:'Fusionieren',exact:true}).click();
 for(let n=0;n<3;n++){await page.getByRole('button',{name:`Fusionsitem ${n+1}`,exact:true}).click();await page.locator('.forge-recipe-grid button').first().click();}
 await page.getByRole('button',{name:'FUSIONIEREN',exact:true}).click();await page.locator('.forge-action-stage[data-forge-action="fusion"]').waitFor();await page.waitForTimeout(800);await page.screenshot({path:`${out}/instant-fusion.png`});await page.keyboard.press('Escape');
 check(await page.locator('.forge-order').filter({hasText:'Fusion läuft'}).count()===0,'Unexpected fusion queue');
 await page.locator('.menu-button').click();await page.getByRole('button',{name:/Season/}).first().click();await page.locator('.season-v2').waitFor();await overflow();await page.screenshot({path:`${out}/season-free.png`});
 await page.locator('.season-selector button').filter({hasText:'S02'}).click();check(await page.locator('.season-banner').innerText().then(t=>t.includes('Neural Horizon')),'Season 02 missing');check(await page.locator('.season-prizes .can-claim').count()===0,'Future preview must not offer claims');await page.locator('.season-selector button').filter({hasText:'S03'}).click();check(await page.locator('.season-banner').innerText().then(t=>t.includes('Quantum Ascension')),'Season 03 missing');await page.locator('.season-selector button').filter({hasText:'S01'}).click();
 await page.locator('.season-prizes>article').nth(2).locator('button.free').click();await page.locator('.reward-reveal').waitFor();await page.keyboard.press('Escape');await page.locator('.season-chest-tray button').first().click();await page.locator('.reward-reveal').waitFor();await page.waitForTimeout(500);await page.screenshot({path:`${out}/season-chest.png`});await page.keyboard.press('Escape');
 let fusionSaved=false;for(let n=0;n<30;n++){fusionSaved=await page.evaluate(async()=>{const d=await import('/src/durableStorage.ts');return ((await d.loadDurableGame(Date.now()))?.state.lifetime.itemsFused??0)>=1});if(fusionSaved)break;await page.waitForTimeout(100)}check(fusionSaved,'Fusion not durably saved');
 await page.evaluate(async()=>{const d=await import('/src/durableStorage.ts'),c=await import('/src/commerce.ts');let s=(await d.loadDurableGame(Date.now())).state;s=c.fulfillVerifiedPurchase(s,{productId:'ai_singularity.season.01',transactionId:'qa-premium',originalTransactionId:'qa-premium',status:'active'});s={...s,season:{...s.season,xp:50000}};await d.persistDurableGame(s,s.savedAt);});
 await page.reload();await page.locator('.menu-button').click();await page.getByRole('button',{name:/Season/}).first().click();await page.locator('.season-v2').waitFor();check(await page.locator('.season-premium-action').innerText().then(t=>t.includes('AKTIV')),'Verified premium missing');await page.screenshot({path:`${out}/season-premium.png`});
 for(const width of [320,390,430]){await page.setViewportSize({width,height:844});await overflow();results.push({width,overflow:false});}
 await page.emulateMedia({reducedMotion:'reduce'});await page.locator('.season-prizes>article').nth(1).locator('button.free').click();await page.locator('.reward-reveal.motion-off.is-ready').waitFor();await page.keyboard.press('Escape');
 check(errors.length===0,errors.join('; '));results.push({craft:'instant receipt with animation',fusion:'instant receipt with animation',equipment:'grouped slots and real equip',seasons:3,chest:'claimed and opened',reducedMotion:true,errors});
 writeFileSync(`${out}/results.json`,JSON.stringify(results,null,2));console.log(JSON.stringify(results));
}finally{await browser?.close();server.kill('SIGTERM');}
