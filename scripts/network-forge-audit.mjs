/** Funded synthetic saves, actual UI actions. No natural pacing or native-device claims. */
import {spawn,spawnSync} from 'node:child_process';
import {mkdirSync,writeFileSync} from 'node:fs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE??'playwright');
const args=process.env.CHROMIUM_MODULE?(await import(process.env.CHROMIUM_MODULE)).default.args:['--no-sandbox'];
const out=process.env.UI_AUDIT_OUTPUT??'node_modules/.cache/network-forge';mkdirSync(out,{recursive:true});
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port','5298'],{stdio:'ignore'}),origin='http://127.0.0.1:5298';
const check=(v,m)=>{if(!v)throw Error(m)},results=[];let browser;
try{
 for(let n=0;n<80;n++){try{if((await fetch(origin)).ok)break}catch{}await new Promise(r=>setTimeout(r,150))}
 for(const width of [320,390,430]){
  browser=await chromium.launch({headless:true,args,executablePath:process.env.BROWSER_EXECUTABLE});
  const context=await browser.newContext({viewport:{width,height:844},hasTouch:true,isMobile:true}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(origin+'/assets/game/model-core-v2.webp');
  const ids=await page.evaluate(async()=>{
   const e=await import('/src/economy.ts'),d=await import('/src/durableStorage.ts'),i=await import('/src/inventory.ts'),S=(await import('/src/scientificNumber.ts')).ScientificNumber;
   await d.removeDurableGame();localStorage.clear();let s=e.newGame(Date.now(),'network-forge-fixture');
   s={...s,aiName:'AURA',prestigeCount:1,unspentINT:10000,exactEconomy:{...s.exactEconomy,unspentINT:S.from(10000).toJSON()},learnedRecipes:['quantum-chip'],completedResearch:['blueprints'],materials:{...s.materials,families:['base']},story:{...s.story,tutorial:'skipped',queue:[],open:null,target:null,enabled:false,seen:Object.keys((await import('/src/story.ts')).dialogues)}};
   s=e.grantComponents(e.addDataScientific(e.addCreditsScientific(s,S.from(1e9),false,false),S.from(1e9)),Object.fromEntries(e.componentIds.map(id=>[id,10000])));
   for(let n=0;n<3;n++)s=i.createItem(s,'quantum-chip','common');
   const ids=s.inventory.map(x=>x.id);s={...s,inventory:s.inventory.map((x,n)=>({...x,level:n===1?3:1}))};await d.persistDurableGame(s,s.savedAt);return ids;
  });
  await page.goto(origin);await page.locator('#tab-prestige').click();await page.locator('.network-node').first().waitFor();
  check(await page.locator('[data-network-node]').count()===60,'60 nodes');check(await page.locator('[data-link-to]').count()===60,'60 connected links');
  await page.screenshot({path:`${out}/prestige-${width}.png`});
  const viewport=page.locator('.network-viewport'),box=await viewport.boundingBox(),world=page.locator('.network-world'),before=await world.getAttribute('style');
  await page.mouse.move(box.x+box.width/2,box.y+box.height/2+70);await page.mouse.down();await page.mouse.move(box.x+box.width/2+55,box.y+box.height/2+120,{steps:10});await page.mouse.up();
  check(await world.getAttribute('style')!==before,'Drag camera unchanged');check(await page.locator('.v2-dialog').count()===0,'Drag opened node');
  const touch=await context.newCDPSession(page),cx=box.x+box.width/2,cy=box.y+box.height/2,zBefore=await page.locator('.network-toolbar output').textContent();
  await touch.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:cx-25,y:cy,id:1},{x:cx+25,y:cy,id:2}]});
  for(let n=0;n<5;n++)await touch.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:cx-30-n*5,y:cy,id:1},{x:cx+30+n*5,y:cy,id:2}]});
  await touch.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});check(await page.locator('.network-toolbar output').textContent()!==zBefore,'Pinch did not zoom');await page.locator('[data-network-home]').click();

  await page.locator('#prestige-node-H06').focus();await page.keyboard.press('Enter');await page.locator('.v2-dialog').waitFor();await page.getByRole('button',{name:'Kaufen',exact:true}).click();await page.locator('#prestige-node-H06.owned').waitFor();check(await page.locator('#prestige-node-H01.owned').count()===0,'Prerequisite acquired unexpectedly');await page.locator('.v2-close').click();
  await page.locator('#tab-inventory').click();await page.getByRole('button',{name:'Bauplan auswählen',exact:true}).click();await page.locator('[data-recipe-id="quantum-chip"]').click();
  const frames=[];let recording;if(width===390){mkdirSync(`${out}/frames`,{recursive:true});recording=await context.newCDPSession(page);recording.on('Page.screencastFrame',async frame=>{const file=`frames/${String(frames.length).padStart(5,'0')}.jpg`;frames.push({file,time:frame.metadata.timestamp});writeFileSync(`${out}/${file}`,Buffer.from(frame.data,'base64'));await recording.send('Page.screencastFrameAck',{sessionId:frame.sessionId}).catch(()=>{})});await recording.send('Page.startScreencast',{format:'jpeg',quality:85,maxWidth:390,maxHeight:844,everyNthFrame:1})}
  await page.locator('#tutorial-recipe-quantum-chip').click();const stage=page.locator('[data-forge-action="craft"]');await stage.waitFor();
  const actor=stage.locator('[data-flight]').first(),a=await actor.evaluate(e=>getComputedStyle(e).transform);await page.waitForTimeout(180);const b=await actor.evaluate(e=>getComputedStyle(e).transform);check(a!==b,'Craft actor did not move');
  check(await page.locator('.item-action-scene').count()===0,'Blocking old scene remains');await page.waitForTimeout(480);await page.screenshot({path:`${out}/craft-${width}.png`});
  const saved=async()=>page.evaluate(async()=>{const d=await import('/src/durableStorage.ts');return(await d.loadDurableGame(Date.now())).state});
  let s;for(let n=0;n<30;n++){s=await saved();if(s.inventory.length===4)break;await page.waitForTimeout(100)}check(s.inventory.length===4,'Craft not saved immediately');check(!s.crafting.active,'Craft queued');
  await page.getByRole('button',{name:'Fusionieren',exact:true}).click();for(let n=0;n<3;n++){await page.getByRole('button',{name:`Fusionsitem ${n+1}`,exact:true}).click();await page.locator(`[data-fusion-item="${ids[n]}"]`).click()}
  await page.getByRole('button',{name:'FUSIONIEREN',exact:true}).click();const fusion=page.locator('[data-forge-action="fusion"]');await fusion.waitFor();check(await fusion.locator('[data-retained="true"][data-flight="1"]').count()===1,'Wrong retained input');await page.waitForTimeout(950);await page.screenshot({path:`${out}/fusion-${width}.png`});
  for(let n=0;n<30;n++){s=await saved();if(s.inventory.length===2)break;await page.waitForTimeout(100)}check(s.inventory.length===2,'Fusion not saved');const result=s.inventory.find(x=>x.id===ids[1]);check(result?.rarity==='uncommon'&&result.level===3,'Fusion lost retained level/rarity');
  if(recording){await page.waitForTimeout(500);await recording.send('Page.stopScreencast');writeFileSync(`${out}/frames.txt`,frames.map((f,n)=>`file '${f.file}'\nduration ${Math.max(.016,(frames[n+1]?.time??f.time+.15)-f.time)}`).join('\n'));const video=spawnSync('ffmpeg',['-y','-f','concat','-safe','0','-i',`${out}/frames.txt`,'-vf','pad=ceil(iw/2)*2:ceil(ih/2)*2','-c:v','libx264','-pix_fmt','yuv420p','-movflags','+faststart',`${out}/forge-motion.mp4`],{encoding:'utf8'});check(video.status===0,video.stderr)}
  await page.waitForTimeout(2200);check(await page.locator('[data-forge-action]').count()===0,'Feedback never cleared');check((await saved()).inventory.length===2,'Visual granted duplicate');
  await page.emulateMedia({reducedMotion:'reduce'});await page.getByRole('button',{name:'Herstellen',exact:true}).click();await page.locator('#tutorial-recipe-quantum-chip').click();await page.locator('.forge-action-stage.motion-reduced').waitFor();check(await page.locator('.forge-action-stage').evaluate(e=>e.getAnimations({subtree:true}).length)===0,'Reduced motion animates');await page.locator('#tab-prestige').click();check(await page.locator('[data-forge-action]').count()===0,'Navigation retained scene');
  check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Page overflow');if(width===430){await page.goto(origin+'/assets/game/model-core-v2.webp');await page.evaluate(async()=>{const d=await import('/src/durableStorage.ts'),S=(await import('/src/scientificNumber.ts')).ScientificNumber;let s=(await d.loadDurableGame(Date.now())).state;s={...s,axiomResetCount:1,axioms:50,availableAxioms:50,totalAxiomsEarned:50,exactAxioms:{available:S.from(50).toJSON(),total:S.from(50).toJSON()},settings:{...s.settings,language:'en',effects:false}};await d.persistDurableGame(s,s.savedAt)});await page.goto(origin);await page.locator('#tab-prestige').click();await page.getByRole('button',{name:'Axioms',exact:true}).click();check(await page.locator('[data-network-node]').count()===24,'Axiom nodes missing');check(await page.locator('[data-link-to]').count()===24,'Axiom connections missing');await page.screenshot({path:`${out}/axioms-430-en.png`})}
  check(errors.length===0,errors.join(';'));
  results.push({width,nodes:60,links:60,drag:true,pinch:true,keyboard:true,INTOnlyPurchase:true,craftMovement:true,instantCraft:true,instantFusion:true,retainedLevel:3,reducedMotion:true,errors});console.log('Passed',width);await context.close();await browser.close();browser=null;
 }
 writeFileSync(`${out}/results.json`,JSON.stringify(results,null,2));
}finally{await browser?.close();server.kill('SIGTERM')}
