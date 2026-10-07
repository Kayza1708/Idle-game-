"""360/390/430px DE/EN; prepared valid resources, real confirmed learning and two paid crafting orders."""
import json,time,sys
from pathlib import Path
from playwright.sync_api import sync_playwright
origin=sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:5179'
out=Path(sys.argv[2] if len(sys.argv)>2 else 'node_modules/.cache/blueprints-browser');out.mkdir(parents=True,exist_ok=True)
fixture='''async language=>{const e=await import('/src/economy.ts'),d=await import('/src/durableStorage.ts'),story=await import('/src/story.ts');await d.removeDurableGame();localStorage.clear();let s=e.grantComponents(e.addData(e.newGame(Date.now(),'blueprints-ui'),10000),Object.fromEntries(Object.keys(e.BALANCE.components).map(id=>[id,1000])));s={...s,blueprintFragments:4,modules:{computeBus:2,dataLattice:2},completedResearch:['blueprints'],impulseRelayBlueprint:true,insightArchiveBlueprint:true,aiName:'AURA',settings:{...s.settings,language},story:{...s.story,tutorial:'skipped',target:null,open:null,queue:[],seen:Object.keys(story.dialogues),chapters:story.storyChapters.map(c=>c.id),enabled:false}};await d.persistDurableGame(s,s.savedAt);}'''
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
 for width,language in [(w,l) for w in [360,390,430] for l in ['de','en']]:
  page=browser.new_page(viewport={'width':width,'height':844},is_mobile=True,has_touch=True);errors=[];confirmations=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  def accept(d):
   confirmations.append(d.message);d.accept()
  page.on('dialog',accept)
  page.goto(origin);page.wait_for_timeout(500);page.evaluate(fixture,language);page.reload();page.locator('#tab-inventory').click();page.get_by_role('tab',name='Baupläne / Herstellung' if language=='de' else 'Blueprints / crafting').click()
  itemGeometry=inspect(page,6,width)
  card=page.locator('#recipe-quantum-chip');learn=card.get_by_role('button',name='Bauplan lernen' if language=='de' else 'Learn blueprint',exact=True)
  assert learn.is_enabled();assert learn.bounding_box()['height']>=44
  card.scroll_into_view_if_needed();page.screenshot(animations='disabled',path=str(out/f'{language}-{width}-before-learning.png'))
  learn.click();page.wait_for_timeout(500);learned=page.evaluate(load)
  assert learned['blueprintFragments']==0 and learned['learnedRecipes']==['quantum-chip']
  assert len(confirmations)==1 and '4 → 0' in confirmations[0]
  assert card.get_by_role('button',name='Bauplanfragmente: Hardwareanalyse' if language=='de' else 'Blueprint fragments: hardware analysis',exact=True).count()==0
  assert card.get_by_text('Bauplan dauerhaft gelernt' if language=='de' else 'Blueprint permanently learned',exact=True).is_visible()
  page.screenshot(animations='disabled',path=str(out/f'{language}-{width}-learned.png'))
  # Tall overview only for capture; all layout/action assertions use the mobile 844px viewport.
  if width==360:page.set_viewport_size({'width':width,'height':1600})
  card.locator('.recipe-ingredients').screenshot(animations='disabled',path=str(out/f'{language}-{width}-ingredients.png'))
  if width==360:page.set_viewport_size({'width':width,'height':844})
  craft=card.get_by_role('button',name='Herstellen ×1' if language=='de' else 'Craft ×1',exact=True)
  for _ in range(2):
   assert craft.bounding_box()['height']>=44
   assert craft.is_enabled();craft.click();page.wait_for_timeout(500)
  paid=page.evaluate(load);jobs=[paid['crafting']['active']]+paid['crafting']['queue']
  assert len(jobs)==2 and all(j['ingredients']['blueprints']==0 for j in jobs)
  assert paid['blueprintFragments']==0 and paid['data']==6400 and paid['modules']['computeBus']==0
  assert paid['componentInventory']['circuits']==940 and all(j['durationPerUnit']==300 for j in jobs)
  assert page.evaluate('document.documentElement.scrollWidth<=innerWidth');assert not errors,errors
  page.screenshot(animations='disabled',path=str(out/f'{language}-{width}-two-paid-orders.png'))
  # Stress presentation only: no modified name/value is written to the game state.
  names=page.locator('.ingredient-name');amounts=page.locator('.ingredient-amounts>span');savedNames=names.all_text_contents();savedAmounts=amounts.all_text_contents()
  names.evaluate_all("es=>es.forEach(e=>e.textContent='ExtremelyLongUnbrokenIngredientNameForResponsiveLayoutAndScientificQuantities')")
  amounts.evaluate_all("es=>es.forEach(e=>e.textContent='Stock / Required / Missing: 9.999999999999999999999999999999e+1000')")
  stress=inspect(page,6,width)
  names.evaluate_all('(es,vs)=>es.forEach((e,i)=>e.textContent=vs[i])',savedNames);amounts.evaluate_all('(es,vs)=>es.forEach((e,i)=>e.textContent=vs[i])',savedAmounts)
  page.get_by_role('tab',name='Module' if language=='de' else 'Modules',exact=True).click();moduleGeometry=inspect(page,2,width)
  module=page.locator('#recipe-computeBus');moduleCraft=module.get_by_role('button',name='Herstellen ×1' if language=='de' else 'Craft ×1',exact=True);assert moduleCraft.bounding_box()['height']>=44;moduleCraft.click();page.wait_for_timeout(500)
  modulePaid=page.evaluate(load);assert modulePaid['data']==6150 and modulePaid['componentInventory']['circuits']==930
  assert modulePaid['crafting']['queue'][-1]['recipeId']=='computeBus'
  assert not errors,errors
  page.screenshot(animations='disabled',path=str(out/f'{language}-{width}-modules.png'))
  rows.append({'language':language,'width':width,'preparedResources':True,'paidLearningFragments':4,'paidOrders':2,'paidModuleOrders':1,'itemLayout':itemGeometry,'moduleLayout':moduleGeometry,'stressLayout':{'ingredients':stress['ingredients'],'errors':[]},'dataPaid':3600,'computeBusPaid':2,'circuitsPaid':60,'fragmentReservations':[j['ingredients']['blueprints'] for j in jobs],'confirmation':confirmations,'errors':errors});page.close()
 browser.close()
(out/'results.json').write_text(json.dumps({'runtimeSeconds':time.monotonic()-started,'checks':rows},indent=2));print(json.dumps([{k:r[k] for k in ['language','width','paidLearningFragments','paidOrders','paidModuleOrders','errors']} for r in rows]))
