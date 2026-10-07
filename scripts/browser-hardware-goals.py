"""Short 360/390/430 DE/EN pointer check, genuine regular paid purchases."""
import json,time,sys
from pathlib import Path
from playwright.sync_api import sync_playwright
origin=sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:5178'
out=Path(sys.argv[2] if len(sys.argv)>2 else 'node_modules/.cache/hardware-browser');out.mkdir(parents=True,exist_ok=True)
fixture='''async language=>{const e=await import('/src/economy.ts'),d=await import('/src/durableStorage.ts'),story=await import('/src/story.ts');await d.removeDurableGame();localStorage.clear();let s=e.newGame(Date.now(),'hardware-ui');s={...s,aiName:'AURA',settings:{...s.settings,language},story:{...s.story,tutorial:'skipped',target:null,open:null,queue:[],seen:Object.keys(story.dialogues),chapters:story.storyChapters.map(c=>c.id),enabled:false}};await d.persistDurableGame(s,s.savedAt);}'''
rows=[];started=time.monotonic()
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 for width in [360,390,430]:
  for language in ['de','en']:
   page=browser.new_page(viewport={'width':width,'height':844},is_mobile=True,has_touch=True);errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
   page.goto(origin);page.wait_for_timeout(500);page.evaluate(fixture,language);page.reload();page.locator('#hardware-calculator').wait_for()
   assert page.locator('.mobile-hardware-list article').count()==15
   assert page.locator('[data-discovered="true"]').count()==0
   for id in ['sbc','pc','gpu','rig','server','matrioshka']:
    row=page.locator('#hardware-'+id);assert row.locator('.hardware-buy span').inner_text();row.locator('.hardware-info').click();page.locator('.mobile-detail-sheet').wait_for();page.keyboard.press('Escape')
   page.locator('#hardware-calculator .hardware-buy').click();page.locator('#hardware-calculator[data-discovered="true"]').wait_for()
   assert page.locator('.hardware-savings-goals article').count()==2
   assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
   for b in page.locator('.hardware-savings-goals button').all():assert b.bounding_box()['height']>=44
   assert not errors,errors
   page.locator('#hardware-calculator').scroll_into_view_if_needed();page.screenshot(path=str(out/f'hardware-{language}-{width}.png'));rows.append({'language':language,'width':width,'classes':15,'calculatorPurchased':True,'overflow':False,'errors':errors});page.close()
 browser.close()
(out/'results.json').write_text(json.dumps({'runtimeSeconds':time.monotonic()-started,'checks':rows},indent=2))
print(json.dumps(rows))
