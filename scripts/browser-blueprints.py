"""390px DE/EN; prepared valid resources, real confirmed learning and two paid crafting orders."""
import json,time,sys
from pathlib import Path
from playwright.sync_api import sync_playwright
origin=sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:5179'
out=Path(sys.argv[2] if len(sys.argv)>2 else 'node_modules/.cache/blueprints-browser');out.mkdir(parents=True,exist_ok=True)
fixture='''async language=>{const e=await import('/src/economy.ts'),d=await import('/src/durableStorage.ts'),story=await import('/src/story.ts');await d.removeDurableGame();localStorage.clear();let s=e.grantComponents(e.addData(e.newGame(Date.now(),'blueprints-ui'),10000),Object.fromEntries(Object.keys(e.BALANCE.components).map(id=>[id,1000])));s={...s,blueprintFragments:4,modules:{computeBus:2,dataLattice:2},aiName:'AURA',settings:{...s.settings,language},story:{...s.story,tutorial:'skipped',target:null,open:null,queue:[],seen:Object.keys(story.dialogues),chapters:story.storyChapters.map(c=>c.id),enabled:false}};await d.persistDurableGame(s,s.savedAt);}'''
load="async()=>{const d=await import('/src/durableStorage.ts');return (await d.loadDurableGame(Date.now())).state;}"
rows=[];started=time.monotonic()
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 for language in ['de','en']:
  page=browser.new_page(viewport={'width':390,'height':844},is_mobile=True,has_touch=True);errors=[];confirmations=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  def accept(d):
   confirmations.append(d.message);d.accept()
  page.on('dialog',accept)
  page.goto(origin);page.wait_for_timeout(500);page.evaluate(fixture,language);page.reload();page.locator('#tab-inventory').click();page.get_by_role('tab',name='Baupläne / Herstellung' if language=='de' else 'Blueprints / crafting').click()
  card=page.locator('#recipe-quantum-chip');learn=card.get_by_role('button',name='Bauplan lernen' if language=='de' else 'Learn blueprint',exact=True)
  assert learn.is_enabled();assert learn.bounding_box()['height']>=44
  card.scroll_into_view_if_needed();page.screenshot(animations='disabled',path=str(out/f'{language}-before-learning.png'))
  learn.click();page.wait_for_timeout(500);learned=page.evaluate(load)
  assert learned['blueprintFragments']==0 and learned['learnedRecipes']==['quantum-chip']
  assert len(confirmations)==1 and '4 → 0' in confirmations[0]
  assert card.get_by_role('button',name='Bauplanfragmente: Hardwareanalyse' if language=='de' else 'Blueprint fragments: hardware analysis',exact=True).count()==0
  assert card.get_by_text('Bauplan dauerhaft gelernt' if language=='de' else 'Blueprint permanently learned',exact=True).is_visible()
  page.screenshot(animations='disabled',path=str(out/f'{language}-learned.png'))
  craft=card.get_by_role('button',name='Herstellen ×1' if language=='de' else 'Craft ×1',exact=True)
  for _ in range(2):
   assert craft.is_enabled();craft.click();page.wait_for_timeout(500)
  paid=page.evaluate(load);jobs=[paid['crafting']['active']]+paid['crafting']['queue']
  assert len(jobs)==2 and all(j['ingredients']['blueprints']==0 for j in jobs)
  assert paid['blueprintFragments']==0 and paid['data']==6400 and paid['modules']['computeBus']==0
  assert paid['componentInventory']['circuits']==940 and all(j['durationPerUnit']==300 for j in jobs)
  assert page.evaluate('document.documentElement.scrollWidth<=innerWidth');assert not errors,errors
  page.screenshot(animations='disabled',path=str(out/f'{language}-two-paid-orders.png'))
  rows.append({'language':language,'width':390,'preparedResources':True,'paidLearningFragments':4,'paidOrders':2,'dataPaid':3600,'computeBusPaid':2,'circuitsPaid':60,'fragmentReservations':[j['ingredients']['blueprints'] for j in jobs],'confirmation':confirmations,'errors':errors});page.close()
 browser.close()
(out/'results.json').write_text(json.dumps({'runtimeSeconds':time.monotonic()-started,'checks':rows},indent=2));print(json.dumps(rows))
