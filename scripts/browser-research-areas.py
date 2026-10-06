"""Short 390px DE/EN acceptance; Chromium + Python Playwright and running Vite required.
Prepared Data/INT fixture, no research areas. All access purchases use actual App buttons.
Usage: python scripts/browser-research-areas.py [origin] [output]
"""
import json,sys,time
from pathlib import Path
from playwright.sync_api import sync_playwright
origin=sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:5177'
out=Path(sys.argv[2] if len(sys.argv)>2 else 'node_modules/.cache/research-areas-browser');out.mkdir(parents=True,exist_ok=True)
fixture='''async language=>{const e=await import('/src/economy.ts'),d=await import('/src/durableStorage.ts'),story=await import('/src/story.ts');await d.removeDurableGame();localStorage.clear();let s=e.addData(e.addCredits(e.newGame(Date.now(),'research-areas-ui'),1e6,false),1e6);s=e.buyHardwareClass(e.buyHardwareClass(s,'calculator',10),'sbc');s={...s,aiName:'AURA',totalINTEarned:100,cycleINTEarned:100,unspentINT:100,exactEconomy:{...s.exactEconomy,totalINTEarned:{m:1,e:2},cycleINTEarned:{m:1,e:2},unspentINT:{m:1,e:2}},settings:{...s.settings,language},story:{...s.story,tutorial:'skipped',target:null,open:null,queue:[],seen:Object.keys(story.dialogues),chapters:story.storyChapters.map(c=>c.id),enabled:false}};await d.persistDurableGame(s,s.savedAt);}'''
def state(page):
 page.wait_for_timeout(150)
 return page.evaluate("async()=>{const d=await import('/src/durableStorage.ts');const r=await d.loadDurableGame(Date.now());if(!r||r.error)throw Error(r?.error??'no save');return r.state;}")
def capture(page,name):
 assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),name
 for element in page.locator('.research-card,.research-area-preview button').all():
  box=element.bounding_box();assert box and box['height']>=44,(name,box)
 page.screenshot(path=str(out/name))
results=[];started=time.monotonic()
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 for language in ['de','en']:
  page=browser.new_page(viewport={'width':390,'height':844},device_scale_factor=1,is_mobile=True,has_touch=True);errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.goto(origin);page.wait_for_timeout(500);page.evaluate(fixture,language);page.reload();page.locator('#tab-research').click();page.locator('.research-catalog').wait_for()
  assert page.locator('.research-card').count()==3
  assert page.locator('[data-research-area-preview="data"]').count()==1
  capture(page,f'initial-{language}-390.png')
  page.locator('.research-area-preview').scroll_into_view_if_needed();capture(page,f'preview-{language}-390.png')
  for area,node,next_area in [('data','dataArchive1','architecture'),('architecture','computeNet1','materials'),('materials','analysis1','automation'),('automation','labs1',None)]:
   page.locator('.research-area-preview button').click()
   dialog=page.locator('.mobile-detail-sheet');dialog.wait_for()
   title=dialog.locator('h2').inner_text();assert title
   # The preview must open the precise expected node; its title matches the genuine registry translation.
   expected=page.evaluate("async args=>{const text=await import('/src/gameplayI18n.ts');return text.prestigeText(args.node,args.language).name;}",{'node':node,'language':language})
   assert title==expected,(title,expected)
   page.locator('.node-buy-action').click();s=state(page);assert area in s['researchAreas'];assert s['nodes'].count(node)==1
   page.locator('#tab-research').click();page.locator(f'[data-research-area="{area}"]').wait_for()
   if next_area:assert page.locator(f'[data-research-area-preview="{next_area}"]').count()==1
   else:assert page.locator('.research-area-preview').count()==0
  capture(page,f'unlocked-{language}-390.png')
  page.reload();page.locator('#tab-research').click();page.locator('[data-research-area="automation"]').wait_for();assert state(page)['researchAreas']==['data','architecture','materials','automation']
  page.locator('#tutorial-subtab-analysis').click();page.locator('#analysis-hardware-short button').click();assert state(page)['experiments']['active']['type']=='hardware'
  capture(page,f'analysis-{language}-390.png')
  assert not errors,errors
  results.append({'language':language,'width':390,'initialCards':3,'regularNodePurchases':4,'reload':True,'hardwareAnalysis':True,'pageErrors':errors});page.close()
 browser.close()
report={'durationSeconds':round(time.monotonic()-started,2),'results':results};(out/'results.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report))
