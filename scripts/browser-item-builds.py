"""9D: 390px DE/EN, explicitly prepared resources; real equipment and training clicks."""
import json,time,sys
from pathlib import Path
from playwright.sync_api import sync_playwright
origin=sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:5179'
out=Path(sys.argv[2] if len(sys.argv)>2 else 'work/item-builds-browser');out.mkdir(parents=True,exist_ok=True)
fixture="""async ({language,capped=false})=>{const e=await import('/src/economy.ts'),i=await import('/src/inventory.ts'),d=await import('/src/durableStorage.ts'),story=await import('/src/story.ts');await d.removeDurableGame();localStorage.clear();let s={...e.addCredits(e.addData(e.newGame(Date.now(),'9d-ui'),1000000),1e21),prestigeCount:1,discovered:['calculator','sbc']};s=e.buyHardwareClass(s,'calculator',1);s=i.buyEquipmentSlot(i.buyEquipmentSlot(s,2),3);for(const type of ['quantum-chip','tensor-core','photonic-array','logic-seed','field-scanner','memory-crystal'])s=i.createItem(s,type,'common');s={...s,trainingBoostUntil:capped?s.savedAt+600000:0,aiName:'AURA',settings:{...s.settings,language},story:{...s.story,tutorial:'skipped',target:null,open:null,queue:[],seen:Object.keys(story.dialogues),chapters:story.storyChapters.map(c=>c.id),enabled:false}};await d.persistDurableGame(s,s.savedAt);} """
load="async()=>{const d=await import('/src/durableStorage.ts');return (await d.loadDurableGame(Date.now())).state;}"
names={'de':{'quantum-chip':'Quantenchip','tensor-core':'Tensor-Kern','photonic-array':'Photonenfeld','logic-seed':'Logik-Saat','field-scanner':'Feldscanner','memory-crystal':'Speicherkristall'},'en':{'quantum-chip':'Quantum Chip','tensor-core':'Tensor Core','photonic-array':'Photonic Array','logic-seed':'Logic Seed','field-scanner':'Field Scanner','memory-crystal':'Memory Crystal'}}
builds=[('parallel-architecture',[('processor','quantum-chip'),('core','tensor-core')]),('learning-pipeline',[('processor','photonic-array'),('core','logic-seed')]),('material-mapping',[('research','field-scanner'),('core','memory-crystal')])]
slots={'de':{'processor':'Prozessor','core':'Kern','research':'Forschung'},'en':{'processor':'Processor','core':'Core','research':'Research'}}
def geometry(page):
 rows=page.locator('.item-combinations article').evaluate_all("""cards=>cards.map(card=>{const box=card.getBoundingClientRect(),errors=[];if(box.left<0||box.right>innerWidth+1)errors.push('horizontal card overflow');for(const el of card.querySelectorAll('p,b,li span')){if(el.scrollWidth>el.clientWidth+1)errors.push('clipped text');const range=document.createRange();range.selectNodeContents(el);for(const r of range.getClientRects())if(r.left<box.left-1||r.right>box.right+1)errors.push('text outside card');}return{id:card.dataset.combination,active:card.dataset.active,text:card.innerText,errors};})""")
 assert len(rows)==5 and all(not r['errors'] for r in rows),rows
 assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
 return rows
rows=[];started=time.monotonic()
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 for language in ['de','en']:
  for build,requirements in builds:
   page=browser.new_page(viewport={'width':390,'height':844},is_mobile=True,has_touch=True);errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
   page.goto(origin);page.wait_for_timeout(400);page.evaluate(fixture,{'language':language});page.reload();page.locator('#tutorial-equipment').click()
   row=page.locator(f'[data-combination="{build}"]');assert row.get_attribute('data-active')=='false'
   incomplete=geometry(page);row.scroll_into_view_if_needed();page.wait_for_timeout(300);page.screenshot(animations='disabled',path=str(out/f'{language}-{build}-incomplete.png'))
   for n,(slot,item) in enumerate(requirements):
    page.locator('.visual-equipment-slots button').filter(has=page.get_by_text(slots[language][slot],exact=True)).click()
    card=page.locator('.equipment-picker>div>article').filter(has=page.get_by_text(names[language][item],exact=True))
    card.get_by_role('button',name='Anlegen' if language=='de' else 'Equip',exact=True).click();page.wait_for_timeout(200)
    assert row.get_attribute('data-active')==('false' if n==0 else 'true')
   active=geometry(page);row.scroll_into_view_if_needed();page.wait_for_timeout(300);page.screenshot(animations='disabled',path=str(out/f'{language}-{build}-active.png'))
   s=page.evaluate(load);quote=page.evaluate("async({s,id})=>{const e=await import('/src/economy.ts');return e.itemCombinationQuote(s,id)}",{'s':s,'id':build});assert quote['active']
   prices=None;charged=None
   if build=='parallel-architecture':assert 'actual ×1.20' in row.inner_text() if language=='en' else 'tatsächlich ×1.20' in row.inner_text()
   if build=='material-mapping':assert ('Fixed at analysis start' if language=='en' else 'Bei Analysestart festgelegt') in row.inner_text()
   if build=='learning-pipeline':
    prices=page.evaluate("async s=>{const e=await import('/src/economy.ts'),q=e.trainingCombinationComparison(s,'quality');return {before:q.before.cost.toNumber(),after:q.after.cost.toNumber(),factor:q.after.factor,capped:q.after.capped}}",s)
    assert prices['before']==13 and prices['after']==9
    assert '13 → 9 Data' in row.locator('[data-track="quality"]').inner_text()
    page.get_by_role('button',name='Ausrüstung schließen' if language=='de' else 'Close equipment',exact=True).click();page.get_by_role('button',name='Modell & Training' if language=='de' else 'Model & training',exact=True).click()
    page.locator('#tutorial-quality-training').click();page.wait_for_timeout(300);paid=page.evaluate(load)
    assert paid['activeTraining']['dataCost']==9 and paid['activeTraining']['costBasis']['sources']['combination:learning-pipeline']==.5
    charged=paid['activeTraining']['dataCost'];page.screenshot(animations='disabled',path=str(out/f'{language}-actual-training-start.png'))
    # Separate explicitly prepared capped state, followed by the same real equipment actions.
    page.evaluate(fixture,{'language':language,'capped':True});page.reload();page.locator('#tutorial-equipment').click()
    for slot,item in requirements:
     page.locator('.visual-equipment-slots button').filter(has=page.get_by_text(slots[language][slot],exact=True)).click()
     page.locator('.equipment-picker>div>article').filter(has=page.get_by_text(names[language][item],exact=True)).get_by_role('button',name='Anlegen' if language=='de' else 'Equip',exact=True).click();page.wait_for_timeout(150)
    row=page.locator(f'[data-combination="{build}"]');assert ('Rabattdeckel 50 % erreicht' if language=='de' else 'Discount cap 50% reached') in row.inner_text();assert '8 → 8 Data' in row.inner_text();geometry(page);row.scroll_into_view_if_needed();page.wait_for_timeout(300);page.screenshot(animations='disabled',path=str(out/f'{language}-training-cap.png'))
   assert not errors,errors
   rows.append({'language':language,'width':390,'height':844,'build':build,'preparedResourcesAndItems':True,'slotsRegularlyPurchased':True,'realEquipClicks':2,'incomplete':incomplete,'active':active,'quote':quote,'trainingPrices':prices,'actualTrainingDataCost':charged,'errors':errors});page.close()
 browser.close()
(out/'results.json').write_text(json.dumps({'runtimeSeconds':time.monotonic()-started,'checks':rows},indent=2)+'\n');print(json.dumps([{'language':r['language'],'build':r['build'],'active':r['quote']['active'],'trainingDataCost':r['actualTrainingDataCost'],'errors':r['errors']} for r in rows]))
