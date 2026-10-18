import {spawn} from 'node:child_process';
import {mkdirSync,writeFileSync} from 'node:fs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE??'playwright');
const launchArgs=process.env.CHROMIUM_MODULE?(await import(process.env.CHROMIUM_MODULE)).default.args:['--no-sandbox'];
const out='node_modules/.cache/branding';mkdirSync(out,{recursive:true});
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port','5298'],{stdio:'ignore'});
const origin='http://127.0.0.1:5298',results=[],check=(ok,message)=>{if(!ok)throw Error(message)};let browser;
try{
 for(let i=0;i<80;i++){try{if((await fetch(origin)).ok)break}catch{}await new Promise(r=>setTimeout(r,150))}
 for(const width of [320,390,430]){
  browser=await chromium.launch({headless:true,args:launchArgs,...(process.env.BROWSER_EXECUTABLE?{executablePath:process.env.BROWSER_EXECUTABLE}:{})});
  const page=await browser.newPage({viewport:{width,height:844},isMobile:true,hasTouch:true}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(origin+'/icons/icon-192.png');
  await page.evaluate(async()=>{
   const e=await import('/src/economy.ts'),d=await import('/src/durableStorage.ts'),st=await import('/src/story.ts');
   localStorage.clear();let s=e.newGame(Date.now());s={...s,story:{...s.story,tutorial:'skipped',target:null,open:null,queue:[],seen:Object.keys(st.dialogues),enabled:false}};await d.persistDurableGame(s,s.savedAt);
  });
  await page.goto(origin);check(await page.title()==='Idle Intelligence','Old document title');
  await page.locator('.menu-button').click();await page.locator('.menu-brand-icon').waitFor();
  const geometry=await page.locator('.menu-brand-icon').evaluate(async image=>{await image.decode();const b=image.getBoundingClientRect();return {loaded:image.naturalWidth===512,width:b.width,height:b.height,inside:b.left>=0&&b.right<=innerWidth}});
  check(geometry.loaded&&geometry.inside&&geometry.width===64,'Logo failed to load or overflowed');
  check((await page.locator('.meta-menu header').textContent()).includes('IDLE INTELLIGENCE'),'Menu name absent');
  check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Page overflow');
  const manifest=await (await page.request.get(origin+'/manifest.webmanifest')).json();check(manifest.name==='Idle Intelligence','Manifest name mismatch');
  for(const icon of manifest.icons){const response=await page.request.get(origin+icon.src);check(response.ok()&&response.headers()['content-type'].includes('image/png'),'Manifest icon missing')}
  await page.screenshot({path:`${out}/menu-${width}.png`});check(!errors.length,errors.join(';'));
  results.push({width,title:'Idle Intelligence',logo:geometry,manifest:true,errors});await browser.close();browser=null;
 }
 writeFileSync(`${out}/results.json`,JSON.stringify(results,null,2));console.log(JSON.stringify(results));
}finally{await browser?.close();server.kill('SIGTERM')}
