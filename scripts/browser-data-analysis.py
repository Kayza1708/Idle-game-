"""Prepared mobile contracts, real paid UI starts, not natural progression."""
import json,sys
from pathlib import Path
from datetime import datetime,timezone
from playwright.sync_api import sync_playwright
url='http://127.0.0.1:5181';output=Path(sys.argv[1])
fixture="""async({language,data=10000,pipeline=false})=>{const e=await import('/src/economy.ts'),d=await import('/src/durableStorage.ts'),story=await import('/src/story.ts');await d.removeDurableGame();localStorage.clear();let s=e.addData(e.newGame(Date.now(),'data-mobile-prepared'),data);s={...s,aiName:'AURA',discovered:['calculator','sbc'],hardware:1,hardwareCounts:{...s.hardwareCounts,calculator:1},completedResearch:pipeline?['dataPipeline']:[],settings:{...s.settings,language},story:{...s.story,tutorial:'skipped',target:null,open:null,queue:[],seen:Object.keys(story.dialogues),chapters:story.storyChapters.map(c=>c.id),enabled:false}};await d.persistDurableGame(s,s.savedAt);return s;}"""
load="async()=>{const d=await import('/src/durableStorage.ts');return (await d.loadDurableGame(Date.now())).state;}"
def saved(page):
 page.evaluate("()=>window.dispatchEvent(new Event('ai-singularity:native-background'))");page.clock.run_for(100);page.wait_for_timeout(150);return page.evaluate(load)
def analysis(page):
 page.locator('#tab-research').click();page.locator('#tutorial-subtab-analysis').click();page.wait_for_timeout(150)
def measure(page,width):
 m=page.evaluate('()=>({page:document.documentElement.scrollWidth,viewport:innerWidth,wide:[...document.querySelectorAll(".analysis-card,.contract-option,.analysis-copy,.data-comparison")].filter(x=>x.scrollWidth>x.clientWidth+1).map(x=>({class:x.className,scroll:x.scrollWidth,width:x.clientWidth}))})');assert m['page']<=width+1 and not m['wide'],m;return m
results=[]
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 for width in [360,390,430]:
  for language in ['de','en']:
   page=browser.new_page(viewport={'width':width,'height':860});errors=[];page.on('pageerror',lambda e:errors.append(str(e)));page.clock.install(time=datetime(2026,10,11,12,tzinfo=timezone.utc));page.clock.pause_at(datetime(2026,10,11,12,0,5,tzinfo=timezone.utc));page.goto(url);page.locator('.naming-backdrop').wait_for();page.wait_for_timeout(150)
   page.evaluate(fixture,{'language':language});page.reload();page.locator('.naming-backdrop').wait_for(state='hidden');analysis(page)
   assert page.locator('.analysis-card').count()==3;assert page.locator('.contract-option').count()==6
   text=page.locator('.analysis-grid').inner_text();assert ('20 % Mengenrabatt' if language=='de' else '20% bulk discount') in text;assert ('keine garantierten Funde' if language=='de' else 'not guaranteed finds') in text;assert '0.083333' in text;assert '0.062500' in text;assert ('Keine Seltenheitsgarantie' if language=='de' else 'No rare-component guarantee') in text
   m=measure(page,width);page.screenshot(path=str(output.parent/f'analysis-{width}-{language}.png'),full_page=True)
   touch=page.locator('.contract-option button').evaluate_all('(els)=>els.map(e=>e.getBoundingClientRect().height)');assert all(h>=44 for h in touch),touch
   before=saved(page);page.evaluate("()=>window.dispatchEvent(new Event('ai-singularity:native-foreground'))");page.locator('#analysis-hardware-short button').click();page.wait_for_timeout(100);paid=saved(page);job=paid['experiments']['active'];assert job['dataCost']==250;assert job['rewardFactor']==1/24;assert job['contractVersion']==2;assert abs(before['data']+paid['lifetime']['regularData']-before['lifetime']['regularData']-paid['data']-250)<.000001
   assert page.locator('.contract-option button:enabled').count()==0;assert ('Analyseslot belegt' if language=='de' else 'Analysis slot occupied') in page.locator('.analysis-grid').inner_text()
   page.reload();page.locator('.naming-backdrop').wait_for(state='hidden');analysis(page);loaded=saved(page);assert loaded['experiments']['active']==job
   page.evaluate(fixture,{'language':language,'data':10000,'pipeline':True});page.reload();page.locator('.naming-backdrop').wait_for(state='hidden');analysis(page);assert ('Datenpipeline' if language=='de' else 'Data pipeline') in page.locator('.analysis-grid').inner_text();page.locator('#analysis-architecture-short button').click();pipeline=saved(page);assert pipeline['experiments']['active']['dataCost']==400;assert pipeline['experiments']['active']['rewardFactor']==1/16
   page.evaluate(fixture,{'language':language,'data':0});page.reload();page.locator('.naming-backdrop').wait_for(state='hidden');analysis(page);assert page.locator('.contract-option button:enabled').count()==0;assert ('Daten fehlen' if language=='de' else 'Data missing') in page.locator('.analysis-grid').inner_text();measure(page,width)
   page.locator('#tutorial-subtab-research').click();page.locator('#research-dataGeneration').click();assert page.locator('.data-comparison').count()==1;measure(page,width)
   assert not errors,errors;results.append({'width':width,'language':language,'contracts':6,'paidJob':job,'pipelineJob':pipeline['experiments']['active'],'reloadIdentical':True,'shortageDisabled':True,'relativeDataPreview':page.locator('.data-comparison').inner_text(),'touchHeights':touch,'overflow':m,'errors':errors});print(json.dumps({'width':width,'language':language}),flush=True);page.close()
 browser.close()
output.write_text(json.dumps({'fixture':'explicit prepared Data, discovered SBC; regular paid UI actions; no natural progression claim','results':results},indent=2)+'\n')
