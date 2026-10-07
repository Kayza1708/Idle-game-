"""390px DE/EN, prepared valid items/resources; real confirmed paid improvements."""
import json,time,sys
from pathlib import Path
from playwright.sync_api import sync_playwright
origin=sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:5179'
out=Path(sys.argv[2] if len(sys.argv)>2 else 'node_modules/.cache/special-items-browser');out.mkdir(parents=True,exist_ok=True)
fixture='''async language=>{const e=await import('/src/economy.ts'),inv=await import('/src/inventory.ts'),pr=await import('/src/prestige.ts'),d=await import('/src/durableStorage.ts'),story=await import('/src/story.ts');await d.removeDurableGame();localStorage.clear();let s=pr.prestige(e.addCredits(e.newGame(Date.now(),'special-items-ui'),e.BALANCE.prestigeBaseRevenue*9));s=e.grantComponents(e.addData(s,1e6),{circuits:10000});s=inv.createItem(inv.createItem(s,'impulse-relay','common'),'insight-archive','common');s={...s,aiName:'AURA',settings:{...s.settings,language},story:{...s.story,tutorial:'skipped',target:null,open:null,queue:[],seen:Object.keys(story.dialogues),chapters:story.storyChapters.map(c=>c.id),enabled:false}};await d.persistDurableGame(s,s.savedAt);}'''
rows=[];started=time.monotonic()
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 for language in ['de','en']:
  page=browser.new_page(viewport={'width':390,'height':844},is_mobile=True,has_touch=True);errors=[];page.on('pageerror',lambda e:errors.append(str(e)));page.on('dialog',lambda d:d.accept())
  page.goto(origin);page.wait_for_timeout(500);page.evaluate(fixture,language);page.reload();page.locator('#tab-inventory').click();page.get_by_role('tab',name='Items' if language=='en' else 'Items').click()
  for index,name in enumerate(['Impulsrelais','Erkenntnisarchiv'] if language=='de' else ['Impulse Relay','Insight Archive']):
   page.get_by_role('button',name=name,exact=False).first.click();sheet=page.locator('.mobile-detail-sheet');sheet.wait_for()
   assert sheet.locator('.special-item-comparison').count()==2
   page.screenshot(path=str(out/f'{language}-{index}-before.png'))
   for action,label in [('upgrade','Aufwerten' if language=='de' else 'Upgrade'),('forge','Schmieden' if language=='de' else 'Forge')]:
    card=sheet.locator('.improvement-card').filter(has=page.get_by_role('heading',name=label,exact=True));button=card.get_by_role('button',name=label,exact=True);assert button.is_enabled();assert button.bounding_box()['height']>=44
    before=page.evaluate("async()=>{const d=await import('/src/durableStorage.ts');return (await d.loadDurableGame(Date.now())).state;}")
    button.click();page.wait_for_timeout(500)
    after=page.evaluate("async()=>{const d=await import('/src/durableStorage.ts');return (await d.loadDurableGame(Date.now())).state;}")
    i=after['inventory'][index];assert (i['rarity']=='uncommon' and i['level']==1) if action=='upgrade' else i.get('forge')==1
    assert after['data']<before['data'];assert after['componentInventory']['circuits']<before['componentInventory']['circuits']
   assert page.evaluate('document.documentElement.scrollWidth<=innerWidth');page.screenshot(path=str(out/f'{language}-{index}-after.png'));page.keyboard.press('Escape')
  assert not errors,errors;rows.append({'language':language,'width':390,'details':2,'paidUpgrades':2,'paidForges':2,'errors':errors});page.close()
 browser.close()
(out/'results.json').write_text(json.dumps({'runtimeSeconds':time.monotonic()-started,'checks':rows},indent=2));print(json.dumps(rows))
