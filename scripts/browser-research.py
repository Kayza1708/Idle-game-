"""Prepared mobile App checks; regular paid UI actions, no natural progression claim."""
import json,sys
from pathlib import Path
from datetime import datetime,timezone
from playwright.sync_api import sync_playwright
url=sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:5181'
output=Path(sys.argv[2] if len(sys.argv)>2 else '/workspace/work/research/browser.json')
fixture="""async({language,advanced,director=false})=>{const e=await import('/src/economy.ts'),p=await import('/src/prestige.ts'),d=await import('/src/durableStorage.ts'),story=await import('/src/story.ts');await d.removeDurableGame();localStorage.clear();let s=e.addData(e.newGame(Date.now(),'research-mobile-prepared'),1e10);s={...s,aiName:'AURA',discovered:['calculator','sbc'],settings:{...s.settings,language},story:{...s.story,tutorial:'skipped',target:null,open:null,queue:[],seen:Object.keys(story.dialogues),chapters:story.storyChapters.map(c=>c.id),enabled:false}};if(advanced){s={...s,unspentINT:1e6,totalINTEarned:1e6,cycleINTEarned:1e6,prestigeCount:1};for(const family of ['dataArchive','computeNet','analysis','labs'])for(let n=1;n<=4;n++)s=p.buyNode(s,family+n);s={...s,researchLevels:Object.fromEntries(Object.keys(s.researchLevels).map(id=>[id,5])),completedResearch:['operations','blueprints','alignment',...(director?['researchScheduling']:[])]};}await d.persistDurableGame(s,s.savedAt);return s;}"""
load="async()=>{const d=await import('/src/durableStorage.ts');return (await d.loadDurableGame(Date.now())).state;}"
def saved(page):
 page.evaluate("()=>window.dispatchEvent(new Event('ai-singularity:native-background'))");page.clock.run_for(100);page.wait_for_timeout(200);return page.evaluate(load)
results=[]
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 for width in [360,390,430]:
  for language in ['de','en']:
   page=browser.new_page(viewport={'width':width,'height':860});errors=[];page.on('pageerror',lambda e:errors.append(str(e)));page.clock.install(time=datetime(2026,10,11,12,tzinfo=timezone.utc));page.clock.pause_at(datetime(2026,10,11,12,0,5,tzinfo=timezone.utc));page.goto(url);page.locator('.naming-backdrop').wait_for();page.wait_for_timeout(200);page.evaluate(fixture,{'language':language,'advanced':False});page.reload();page.locator('.naming-backdrop').wait_for(state='hidden');page.locator('#tab-research').click();page.wait_for_timeout(200)
   assert page.locator('.research-card').count()==3
   assert page.locator('.research-area-preview').count()==5
   page.locator('#research-modelArchitecture').click();assert page.locator('[data-cta-state="requirement"]').is_disabled();page.get_by_role('button',name='Schließen' if language=='de' else 'Close',exact=True).click()
   page.locator('#research-dataGeneration').click();sheet=page.locator('.mobile-detail-sheet');assert page.get_by_text('Mindestdauer: 60 Sekunden' if language=='de' else 'Minimum duration: 60 seconds').count()>0
   overflow=page.evaluate('()=>({page:document.documentElement.scrollWidth,viewport:innerWidth,sheets:[...document.querySelectorAll(".mobile-detail-sheet")].map(x=>({scroll:x.scrollWidth,width:x.clientWidth}))})');assert overflow['page']<=width+1,overflow
   page.locator('[data-cta-state="available"]').click();page.wait_for_timeout(250);started=saved(page);assert started['researchLabs'][0]['id']=='dataGeneration';assert started['researchLabs'][0]['dataCost']==363
   page.evaluate(fixture,{'language':language,'advanced':True});page.reload();page.locator('.naming-backdrop').wait_for(state='hidden');page.locator('#tab-research').click();page.wait_for_timeout(200)
   for id in ['dataPipeline','distributedInference','modelTransfer','materialRecycling','researchScheduling']:
    page.locator('#research-'+id).scroll_into_view_if_needed();page.locator('#research-'+id).click();assert page.locator('.research-quote-details').count()==1
    assert page.locator('.research-quote-details').inner_text().find('86400.0 s')>=0
    assert page.locator('[data-cta-state="available"]').count()==1
    m=page.evaluate('()=>({page:document.documentElement.scrollWidth,viewport:innerWidth,wide:[...document.querySelectorAll(".mobile-detail-sheet, .research-quote-details")].filter(x=>x.scrollWidth>x.clientWidth+1).map(x=>x.className)})');assert m['page']<=width+1 and not m['wide'],m
    page.get_by_role('button',name='Schließen' if language=='de' else 'Close',exact=True).click()
   page.locator('#research-dataPipeline').click();page.locator('[data-cta-state="available"]').click();page.wait_for_timeout(200);paid=saved(page);job=next(j for j in paid['researchLabs'] if j and j['id']=='dataPipeline');page.reload();page.locator('.naming-backdrop').wait_for(state='hidden');page.locator('#tab-research').click();loaded=saved(page);assert next(j for j in loaded['researchLabs'] if j and j['id']=='dataPipeline')==job
   page.evaluate(fixture,{'language':language,'advanced':True,'director':True});page.reload();page.locator('.naming-backdrop').wait_for(state='hidden');page.locator('#tab-research').click();director=page.locator('.research-automation details').filter(has=page.locator('summary',has_text='Forschungsdirektor' if language=='de' else 'Research director'));director.locator('summary').click();director.get_by_role('button',name='Direktor: Aus' if language=='de' else 'Director: Off',exact=True).click();assert ('Kein Budget gesetzt' if language=='de' else 'No budget set') in director.inner_text();director.get_by_role('button',name='Direktor: An' if language=='de' else 'Director: On',exact=True).click()
   # Real configuration actions: finite target, explicit budget and reserve; remains off until user toggles.
   selects=director.locator('select');selects.last.select_option('dataGeneration');budget=director.get_by_label('Data-Budget' if language=='de' else 'Data budget',exact=True);budget.fill('1e6');budget.press('Tab');selects.first.select_option('0.5');page.wait_for_timeout(200)
   state=saved(page);assert state['researchDirector']['entries'][0]['targetLevel']==6;assert state['researchDirector']['budget']=={'m':1,'e':6};assert state['researchDirector']['reservePercent']==.5;assert state['researchDirector']['enabled']==False
   page.evaluate("()=>window.dispatchEvent(new Event('ai-singularity:native-foreground'))");director.get_by_role('button',name='Direktor: Aus' if language=='de' else 'Director: Off',exact=True).click();page.clock.run_for(10000);page.wait_for_timeout(200);automated=saved(page);assert automated['researchLabs'][0]['id']=='dataGeneration';assert automated['researchLabs'][0]['level']==6;assert automated['researchDirector']['spent']==automated['researchLabs'][0]['dataCostExact']
   touch=page.evaluate('()=>[...document.querySelectorAll(".research-automation button,.research-automation summary,.research-automation input,.research-automation select")].filter(e=>e.getClientRects().length).map(e=>({tag:e.tagName,height:e.getBoundingClientRect().height,width:e.getBoundingClientRect().width}))');assert all(t['height']>=44 for t in touch),touch
   m=page.evaluate('()=>({page:document.documentElement.scrollWidth,viewport:innerWidth})');assert m['page']<=width+1,m
   assert not errors,errors
   results.append({'width':width,'language':language,'initialCards':3,'compactAreaPreviews':5,'newKeyCards':5,'actualInitialDebit':363,'actualKeyJob':job,'configuredDirector':state['researchDirector'],'actualAutomatedJob':automated['researchLabs'][0],'actualDirectorSpend':automated['researchDirector']['spent'],'touchTargets':touch,'pageWidth':m['page'],'errors':errors});print(json.dumps({'checked':width,'language':language}),flush=True);page.screenshot(path=str(output.parent/f'research-{width}-{language}.png'),full_page=True);page.close()
 browser.close()
output.parent.mkdir(parents=True,exist_ok=True);output.write_text(json.dumps({'fixture':'explicitly prepared Data/INT/levels; actual domain node purchases and paid UI starts; not natural unlock timing','checks':results},indent=2));print(json.dumps({'cases':len(results),'output':str(output),'errors':[]},indent=2))
