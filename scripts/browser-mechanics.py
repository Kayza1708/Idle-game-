"""Short UI/domain acceptance. Requires Python Playwright and Chromium, Vite running.
Run: python scripts/browser-mechanics.py [origin] [screenshot directory]
Prepared valid unlock/resource fixture; every measured action uses the real App dispatcher.
"""
import json, sys, time
from pathlib import Path
from playwright.sync_api import sync_playwright
origin = sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:5176'
out = Path(sys.argv[2] if len(sys.argv)>2 else 'node_modules/.cache/mechanics-acceptance')
out.mkdir(parents=True,exist_ok=True)
start=time.monotonic()
results=[]
fixture='''async language=>{
 const e=await import('/src/economy.ts'),i=await import('/src/inventory.ts'),d=await import('/src/durableStorage.ts'),story=await import('/src/story.ts');
 await d.removeDurableGame();localStorage.clear();
 let s=e.addData(e.addCredits(e.newGame(Date.now(),'mechanics-ui'),1e6,false),1e9);
 s=e.buyHardwareClass(s,'calculator',25);s=e.buyHardwareClass(s,'sbc',1);
 s={...s,aiName:'AURA',prestigeCount:1,nodes:['labs1','labs2'],completedResearch:['blueprints'],blueprintFragments:100,components:10000,componentInventory:Object.fromEntries(Object.keys(e.BALANCE.components).map(k=>[k,1000])),settings:{...s.settings,language},story:{...s.story,tutorial:'skipped',target:null,open:null,queue:[],seen:Object.keys(story.dialogues),chapters:story.storyChapters.map(c=>c.id),enabled:false}};
 for(let n=0;n<4;n++)s=i.createItem(s,'quantum-chip','common');
 s=i.equip(s,s.inventory[0].id);
 s=e.startResearchProject(s,'operations');s=e.startResearchProject(s,'alignment');
 await d.persistDurableGame(s,s.savedAt);
}'''
def capture(page,path):
 for selector in ['.content','.mobile-detail-sheet__body','.equipment-dialog']:
  for element in page.locator(selector).all():
   if element.is_visible():
    size=element.evaluate('e=>({scroll:e.scrollWidth,client:e.clientWidth})')
    assert size['scroll']<=size['client']+1,(selector,size)
 assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
 page.screenshot(path=str(path))
def state(page):
 page.wait_for_timeout(120)
 return page.evaluate("async()=>{const d=await import('/src/durableStorage.ts');const r=await d.loadDurableGame(Date.now());if(!r||r.error)throw Error(r?.error??'no save');return r.state;}")
def improvement_cost(page,action):
 return page.evaluate("""async action=>{const d=await import('/src/durableStorage.ts'),i=await import('/src/inventory.ts');const s=(await d.loadDurableGame(Date.now())).state;return i.itemImprovementPreview(s,s.inventory[1].id,action).componentCost;}""",action)
def close_sheet(page):
 page.locator('.mobile-detail-sheet__header button').click()
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 for width in [360,390,430]:
  for language in ['de','en']:
   context=browser.new_context(viewport={'width':width,'height':844})
   page=context.new_page();errors=[]
   page.on('pageerror',lambda e:errors.append(str(e)))
   page.on('dialog',lambda d:d.accept())
   page.goto(origin);page.wait_for_timeout(500);page.evaluate(fixture,language);page.reload();page.locator('#tutorial-equipment').wait_for()
   # Workshop model opens real equipment, training remains reachable independently.
   page.locator('#tutorial-equipment').click();page.locator('.equipment-dialog').wait_for()
   capture(page,out/f'equipment-{language}-{width}.png')
   page.get_by_role('button',name='Ausrüstung schließen' if language=='de' else 'Close equipment').click()
   page.locator('.training-entry').click();page.get_by_role('heading',name='Modell & Training' if language=='de' else 'Model & training').wait_for();close_sheet(page)
   # Ingredient route lands on the exact existing analysis source and exposes both contracts.
   page.locator('#tab-inventory').click();page.locator('.component-tile').first.click()
   page.get_by_role('button',name='Zur Hardwareanalyse' if language=='de' else 'Go to hardware analysis').click()
   page.locator('#analysis-hardware-long').wait_for()
   capture(page,out/f'analyses-{language}-{width}.png')
   # Start long, verify real saved cost/end, then cancel via existing domain for separate short case.
   page.locator('#analysis-hardware-long button').click();s=state(page)
   assert s['experiments']['active']['length']=='long'
   assert s['experiments']['active']['endsAt']>s['experiments']['active']['startedAt']
   assert page.locator('#analysis-hardware-short button').is_disabled()
   # Shortage display: prepared poor save, all materials remain adequate.
   page.evaluate(fixture,language)
   page.evaluate("""async()=>{const d=await import('/src/durableStorage.ts'),e=await import('/src/economy.ts'),n=await import('/src/scientificNumber.ts');const s=(await d.loadDurableGame(Date.now())).state;const poor=e.spendScientificResources(s,n.ScientificNumber.zero(),e.exactEconomyValue(s,'data'));await d.persistDurableGame(poor,Date.now());}""")
   page.reload();page.locator('#tab-research').click();page.locator('#tutorial-subtab-analysis').click()
   assert page.locator('#analysis-hardware-short button').is_disabled()
   assert page.locator('#analysis-hardware-long button').is_disabled()
   assert ('Daten fehlen' if language=='de' else 'Data missing') in page.locator('#analysis-hardware-short').inner_text()
   capture(page,out/f'analysis-shortage-{language}-{width}.png')
   # Reset fixture isolates subsequent action checks; no artificial grants during each checked action.
   page.evaluate(fixture,language);page.reload();page.locator('#tab-research').click();page.locator('#tutorial-subtab-analysis').click()
   page.locator('#analysis-hardware-short button').click();s=state(page);assert s['experiments']['active']['length']=='short'
   # Research queue adds/removes with occupied real labs, survives reload.
   page.locator('#tutorial-subtab-research').click();page.locator('.research-queue-panel summary').click()
   page.locator('[data-research-id="dataGeneration"] button').click();assert state(page)['researchQueue']==['dataGeneration']
   page.reload();page.locator('#tab-research').click();page.locator('.research-queue-panel li').filter(has_text='1').wait_for()
   capture(page,out/f'research-queue-{language}-{width}.png')
   page.locator('.research-queue-panel li button').click();assert state(page)['researchQueue']==[]
   # Craft module through UI. Controlled browser time advances real simulation 61 seconds.
   page.locator('#tab-inventory').click();page.get_by_role('tab',name='Module' if language=='de' else 'Modules',exact=True).click()
   before=state(page);page.locator('#recipe-computeBus > button').last.click();s=state(page)
   assert s['crafting']['active']['recipeId']=='computeBus'
   assert s['componentInventory']['circuits']==before['componentInventory']['circuits']-10
   page.clock.install();page.clock.fast_forward(61000);page.wait_for_timeout(200)
   # Trigger regular paid action to flush the current run and read actual completed stock.
   page.locator('#tab-workshop').click();page.locator('.compact-buy-modes button').first.click();page.locator('#tutorial-buy-calculator').click()
   s=state(page);assert s['modules']['computeBus']==1
   page.locator('#tab-inventory').click();page.get_by_role('tab',name='Baupläne / Herstellung' if language=='de' else 'Blueprints / crafting',exact=True).click()
   page.locator('#recipe-quantum-chip > button').last.click();s=state(page)
   assert s['modules']['computeBus']==0 and s['crafting']['active']['ingredients']['modules']['computeBus']==1
   # Concrete missing-module link opens its recipe, not an unrelated panel.
   page.locator('#recipe-quantum-chip .ingredient-link').filter(has_text='Bus').click();page.locator('#recipe-computeBus').wait_for()
   capture(page,out/f'modules-{language}-{width}.png')
   # Every instance accessible, equipped fusion input protected; costs confirmed and paid.
   page.get_by_role('tab',name='Items / Ausrüstung' if language=='de' else 'Items / equipment',exact=True).click()
   assert page.locator('.item-tile').count()==4
   page.locator('.item-tile').nth(1).click();before=state(page);cost=improvement_cost(page,'upgrade')
   page.locator('.improvement-card').first.get_by_role('button',name='Aufwerten' if language=='de' else 'Upgrade',exact=True).click()
   s=state(page);assert s['inventory'][1]['rarity']=='uncommon';assert s['componentInventory']['circuits']==before['componentInventory']['circuits']-cost
   before=s;cost=improvement_cost(page,'forge');page.locator('.improvement-card').nth(1).get_by_role('button',name='Schmieden' if language=='de' else 'Forge',exact=True).click()
   s=state(page);assert s['inventory'][1]['forge']==1;assert s['componentInventory']['circuits']==before['componentInventory']['circuits']-cost
   capture(page,out/f'item-details-{language}-{width}.png');close_sheet(page)
   # Separate fixture gives 3 available identical inputs + one equipped instance.
   page.evaluate(fixture,language);page.reload();page.locator('#tab-inventory').click();page.get_by_role('tab',name='Items / Ausrüstung' if language=='de' else 'Items / equipment',exact=True).click();page.locator('.item-tile').nth(1).click()
   checks=page.locator('.fusion-choice input');assert checks.count()==4 and checks.nth(0).is_disabled()
   for n in [1,2,3]:checks.nth(n).check()
   page.get_by_role('button',name='Fusion bestätigen' if language=='de' else 'Confirm fusion',exact=True).click();s=state(page)
   assert len(s['inventory'])==2 and s['inventory'][0]['id']==s['equipped']['processor'];assert s['inventory'][1]['rarity']=='uncommon'
   # Pointer hit-test and actual Axiom navigation, no force click.
   page.locator('#tab-prestige').click();axiom=page.locator('.prestige-layer-tabs button').filter(has_text='Axiome' if language=='de' else 'Axioms')
   box=axiom.bounding_box();assert box and box['height']>=44
   assert page.evaluate("b=>{let e=document.elementFromPoint(b.x+b.width/2,b.y+b.height/2);return !!e?.closest('.prestige-layer-tabs')}",box)
   axiom.click();page.locator('.axiom-panel').wait_for();assert page.locator('.axiom-panel .prestige-layer-tabs button').first.is_visible();capture(page,out/f'axiom-{language}-{width}.png')
   assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
   assert not errors,errors
   results.append({'width':width,'language':language,'pageErrors':errors,'actions':'equipment, training, ingredient route, long/short analysis, queue/reload/remove, module/recipe, paid upgrade/forge, protected fusion, pointer Axiom'})
   context.close()
 browser.close()
(out/'browser-results.json').write_text(json.dumps({'seconds':round(time.monotonic()-start,2),'cases':results},indent=2))
print(json.dumps({'seconds':round(time.monotonic()-start,2),'cases':results},indent=2))
