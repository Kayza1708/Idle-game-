"""9C, 390px DE/EN. Prepared technical resources; real UI learning/start and clock-driven completion."""
import json,time,sys
from pathlib import Path
from playwright.sync_api import sync_playwright
origin=sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:5179'
out=Path(sys.argv[2] if len(sys.argv)>2 else 'work/item-recipes-browser');out.mkdir(parents=True,exist_ok=True)
ids=['photonic-array','memory-crystal','logic-seed','tensor-core','lab-drone']
prices=[6,6,6,8,10]
fixture="""async ({language,completed})=>{const e=await import('/src/economy.ts'),d=await import('/src/durableStorage.ts'),story=await import('/src/story.ts');await d.removeDurableGame();localStorage.clear();let s=e.grantComponents(e.addData(e.newGame(Date.now(),'9c-ui'),20000),Object.fromEntries(Object.keys(e.BALANCE.components).map(id=>[id,1000])));s={...s,blueprintFragments:36,modules:{computeBus:10,dataLattice:10},completedResearch:completed?['blueprints']:[],impulseRelayBlueprint:true,insightArchiveBlueprint:true,aiName:'AURA',settings:{...s.settings,language},story:{...s.story,tutorial:'skipped',target:null,open:null,queue:[],seen:Object.keys(story.dialogues),chapters:story.storyChapters.map(c=>c.id),enabled:false}};await d.persistDurableGame(s,s.savedAt);} """
load="async()=>{const d=await import('/src/durableStorage.ts');return (await d.loadDurableGame(Date.now())).state;}"
geometry=r"""cards=>cards.map(card=>{
 const box=card.getBoundingClientRect(),button=card.querySelector('button'),icon=card.querySelector('.ingredient-icon'),name=card.querySelector('.ingredient-name'),amounts=card.querySelector('.ingredient-amounts');
 const inside=(r,b)=>r.left>=b.left-1&&r.right<=b.right+1&&r.top>=b.top-1&&r.bottom<=b.bottom+1;
 const lines=el=>{const range=document.createRange();range.selectNodeContents(el);return [...range.getClientRects()]};
 const art=icon.firstElementChild,texts=[name,...amounts.children],ir=art.getBoundingClientRect(),nr=name.getBoundingClientRect(),ar=amounts.getBoundingClientRect();
 const errors=[];
 if(box.left < -1 || box.right>innerWidth+1)errors.push('card outside horizontal viewport');
 if(!inside(box,card.closest('.recipe-card').getBoundingClientRect()))errors.push('ingredient outside recipe');
 for(const el of [button,icon,art,...texts]){if(!inside(el.getBoundingClientRect(),box))errors.push('element outside card');if(el.scrollWidth>el.clientWidth+1)errors.push('horizontal ingredient overflow');}
 for(const el of texts)for(const r of lines(el))if(!inside(r,box))errors.push('text line outside card');
 if(ir.right>nr.left+1)errors.push('icon overlaps name');
 if(nr.bottom>ar.top+1)errors.push('name overlaps quantities');
 const quantityLines=[...amounts.children].map(x=>x.getBoundingClientRect());for(let i=1;i<quantityLines.length;i++)if(quantityLines[i-1].bottom>quantityLines[i].top+1)errors.push('quantity rows overlap');
 if(button.getBoundingClientRect().height<44)errors.push('short touch target');
 if(getComputedStyle(name).textOverflow==='ellipsis'||getComputedStyle(name).whiteSpace==='nowrap')errors.push('name truncation');
 const rect=r=>({left:r.left,top:r.top,right:r.right,bottom:r.bottom});
 return{recipe:card.closest('.recipe-card').id,name:name.textContent,bounds:{card:rect(box),icon:rect(ir),name:rect(nr),quantities:rect(ar),nameLines:lines(name).map(rect)},errors};
})"""
def inspect(page,expected,width):
 cards=page.locator('.recipe-card');assert cards.count()==expected
 rows=page.locator('.recipe-ingredient').evaluate_all(geometry);assert rows
 assert all(not row['errors'] for row in rows),[row for row in rows if row['errors']]
 columns=page.locator('.recipe-ingredients').first.evaluate("e=>getComputedStyle(e).gridTemplateColumns.split(' ').length")
 assert columns==(1 if width<390 else 2),(width,columns)
 assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
 return {'recipes':expected,'ingredients':len(rows),'columns':columns,'geometry':rows}

rows=[];started=time.monotonic()
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 for language in ['de','en']:
  page=browser.new_page(viewport={'width':390,'height':844},is_mobile=True,has_touch=True);errors=[];confirmations=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  def accept(d):
   confirmations.append(d.message);d.accept()
  page.on('dialog',accept)
  def capture_card(card,path):
   # Capture-only height fits the full card; assertions/actions retain 390x844.
   height=max(844,int(card.evaluate('e=>e.getBoundingClientRect().height'))+180)
   page.set_viewport_size({'width':390,'height':height});card.scroll_into_view_if_needed();page.wait_for_timeout(120)
   card.screenshot(animations='disabled',path=str(path));page.set_viewport_size({'width':390,'height':844})
  def workbench():
   page.locator('#tab-inventory').click();page.get_by_role('tab',name='Baupläne / Herstellung' if language=='de' else 'Blueprints / crafting').click()
  page.goto(origin);page.wait_for_timeout(500);page.evaluate(fixture,{'language':language,'completed':False});page.reload();workbench()
  locked=inspect(page,11,390)
  for id,price in zip(ids,prices):
   card=page.locator('#recipe-'+id);card.scroll_into_view_if_needed()
   assert card.get_by_role('button',name='Bauplan lernen' if language=='de' else 'Learn blueprint',exact=True).is_disabled()
   assert card.get_by_role('button',name='Herstellen ×1' if language=='de' else 'Craft ×1',exact=True).is_disabled()
   assert card.locator('.recipe-prerequisite').inner_text().endswith('Noch nicht abgeschlossen' if language=='de' else 'Not completed')
   assert card.get_by_role('button',name='Offene Baupläne erforschen' if language=='de' else 'Research Open Blueprints',exact=True).is_enabled()
   assert str(price)+' '+('Bauplanfragmente' if language=='de' else 'blueprint fragments') in card.locator('.blueprint-learning').inner_text()
   capture_card(card,out/f'{language}-{id}-locked.png')
  # Explicitly prepare completed research; no research-area flag or item find grants ownership.
  page.evaluate(fixture,{'language':language,'completed':True});page.reload();workbench()
  available=inspect(page,11,390);balance=36
  for id,price in zip(ids,prices):
   card=page.locator('#recipe-'+id);card.scroll_into_view_if_needed()
   assert card.locator('.recipe-result-effects li').count()==1
   assert 'Level 0 · Forge 0' in card.inner_text()
   learn=card.get_by_role('button',name='Bauplan lernen' if language=='de' else 'Learn blueprint',exact=True);assert learn.is_enabled();learn.click();page.wait_for_timeout(300)
   balance-=price;s=page.evaluate(load);assert s['blueprintFragments']==balance and id in s['learnedRecipes']
   assert f'{balance+price} → {balance}' in confirmations[-1]
   capture_card(card,out/f'{language}-{id}-learned.png')
  assert len(confirmations)==5
  # Actual user click reserves a photonic array. Only browser time is accelerated afterward.
  card=page.locator('#recipe-photonic-array');card.scroll_into_view_if_needed();before=page.evaluate(load)
  card.get_by_role('button',name='Herstellen ×1' if language=='de' else 'Craft ×1',exact=True).click();page.wait_for_timeout(500);paid=page.evaluate(load)
  assert paid['crafting']['active']['recipeId']=='photonic-array'
  assert paid['crafting']['active']['ingredients']['blueprints']==0
  assert abs(before['data']-paid['data']-1200)<0.000001
  assert before['modules']['computeBus']-paid['modules']['computeBus']==1
  for k,n in {'circuits':20,'copperCoils':8,'siliconWafers':12,'photonicLenses':6}.items():assert before['componentInventory'][k]-paid['componentInventory'][k]==n
  assert paid['blueprintFragments']==0
  page.screenshot(animations='disabled',path=str(out/f'{language}-paid-craft.png'))
  page.clock.install();page.clock.fast_forward(901000);page.wait_for_timeout(1000);page.reload();page.wait_for_timeout(1000)
  done=page.evaluate(load);assert len(done['inventory'])==1
  item=done['inventory'][0];assert item['type']=='photonic-array' and item['rarity']=='common' and item['level']==0 and item.get('forge',0)==0
  page.reload();page.wait_for_timeout(600);again=page.evaluate(load);assert again['inventory']==done['inventory']
  workbench();complete=inspect(page,11,390);card=page.locator('#recipe-photonic-array');card.scroll_into_view_if_needed();page.screenshot(animations='disabled',path=str(out/f'{language}-completed-reloaded.png'))
  assert not errors,errors
  rows.append({'language':language,'width':390,'preparedResources':True,'preparedCompletedResearch':True,'lockedLayout':locked,'availableLayout':available,'completedLayout':complete,'learnedIds':ids,'paidFragments':36,'realCraftClick':True,'completion':'regular simulation with accelerated browser clock','result':item,'reloadExactlyOnce':True,'confirmations':confirmations,'errors':errors});page.close()
 browser.close()
(out/'results.json').write_text(json.dumps({'runtimeSeconds':time.monotonic()-started,'checks':rows},indent=2));print(json.dumps([{'language':r['language'],'cards':11,'learned':5,'completedItems':1,'errors':r['errors']} for r in rows]))
