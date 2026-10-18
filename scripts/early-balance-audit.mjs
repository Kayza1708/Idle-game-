import {spawn} from 'node:child_process';
import {mkdirSync,writeFileSync} from 'node:fs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE??'playwright');
const args=process.env.CHROMIUM_MODULE?(await import(process.env.CHROMIUM_MODULE)).default.args:['--no-sandbox'];
const out='node_modules/.cache/early-balance';mkdirSync(out,{recursive:true});
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port','5296'],{stdio:'ignore'}),origin='http://127.0.0.1:5296',results=[];
const check=(v,m)=>{if(!v)throw Error(m)};let browser;
try{
 for(let n=0;n<80;n++){try{if((await fetch(origin)).ok)break}catch{}await new Promise(r=>setTimeout(r,150))}
 for(const width of [320,390,430]){
  browser=await chromium.launch({headless:true,args,...(process.env.BROWSER_EXECUTABLE?{executablePath:process.env.BROWSER_EXECUTABLE}:{})});
  const page=await browser.newPage({viewport:{width,height:844},isMobile:true,hasTouch:true}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(origin+'/favicon.png');
  await page.evaluate(async()=>{const f=await import('/src/testSupport/earlyReportedState.ts'),d=await import('/src/durableStorage.ts'),st=await import('/src/story.ts');await d.removeDurableGame();localStorage.clear();let s=f.earlyReportedState(Date.now());s={...s,aiName:'AURA',story:{...s.story,tutorial:'skipped',target:null,open:null,queue:[],seen:Object.keys(st.dialogues),enabled:false}};await d.persistDurableGame(s,s.savedAt)});
  await page.goto(origin);const gpu=page.locator('#hardware-gpu');await gpu.scrollIntoViewIfNeeded();check(await gpu.locator('.hardware-buy').isEnabled(),'Repriced report-state GPU is not affordable');
  const price=await gpu.locator('.hardware-price').textContent();await gpu.locator('.hardware-buy').click();await gpu.locator('.hardware-info strong').filter({hasText:'×7'}).waitFor();
  await page.screenshot({path:`${out}/hardware-${width}.png`});
  await page.locator('#tab-research').click();await page.locator('#research-modelArchitecture').click();await page.locator('[data-cta-state="available"]').click();await page.locator('.research-card.running').waitFor();
  await page.screenshot({path:`${out}/research-${width}.png`});
  const saved=await page.evaluate(async()=>{
   window.dispatchEvent(new Event('ai-singularity:native-background'));const d=await import('/src/durableStorage.ts');
   for(let n=0;n<100;n++){const result=await d.loadDurableGame(Date.now());if(result.state.hardwareCounts.gpu===7&&result.state.researchLabs.some(j=>j?.id==='modelArchitecture')){const j=result.state.researchLabs.find(j=>j?.id==='modelArchitecture');return{gpu:7,paidResearchData:j.dataCost,baseDuration:j.quoteBasis.baseDuration,durationSeconds:j.durationSeconds}}}
   return null;
  });
  check(saved?.gpu===7&&saved.baseDuration===150,'Paid purchase/research did not persist');check(saved.durationSeconds<180,'Early research is still too long');
  await page.reload();await page.locator('#tab-research').click();await page.locator('.research-card.running').waitFor();
  check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Page overflow');check(!errors.length,errors.join(';'));
  results.push({width,reportStateGPUPrice:price,persisted:saved,reload:true,errors});await browser.close();browser=null;
 }
 writeFileSync(`${out}/results.json`,JSON.stringify(results,null,2));console.log(JSON.stringify(results));
}finally{await browser?.close();server.kill('SIGTERM')}
