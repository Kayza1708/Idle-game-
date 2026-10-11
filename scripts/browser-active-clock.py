"""Short prepared App check: real tap actions, native/browser-style duplicate lifecycle events."""
import json,sys
from datetime import datetime,timezone
from pathlib import Path
from playwright.sync_api import sync_playwright
url=sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:5181'
output=Path(sys.argv[2] if len(sys.argv)>2 else 'work/browser-active-clock.json')
fixture="""async()=>{const e=await import('/src/economy.ts'),d=await import('/src/durableStorage.ts'),story=await import('/src/story.ts');await d.removeDurableGame();localStorage.clear();let s=e.newGame(Date.now(),'technical-clock-browser');s={...s,aiName:'AURA',story:{...s.story,tutorial:'skipped',target:null,open:null,queue:[],seen:Object.keys(story.dialogues),chapters:story.storyChapters.map(c=>c.id),enabled:false}};await d.persistDurableGame(s,s.savedAt);return s.savedAt;}"""
load="async()=>{const d=await import('/src/durableStorage.ts');return (await d.loadDurableGame(Date.now())).state;}"
results=[]
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 for busy in [False,True]:
  page=browser.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)));page.clock.install(time=datetime(2026,10,11,12,tzinfo=timezone.utc));page.clock.pause_at(datetime(2026,10,11,12,0,5,tzinfo=timezone.utc));page.goto(url);page.evaluate(fixture);page.reload();page.locator('#tutorial-tap').wait_for();page.wait_for_timeout(200)
  for i in range(30):
   page.clock.run_for(100)
   if busy:page.locator('#tutorial-tap').dispatch_event('pointerdown');page.locator('#tutorial-tap').dispatch_event('pointerup')
  page.evaluate("()=>{window.dispatchEvent(new Event('ai-singularity:native-background'));window.dispatchEvent(new Event('ai-singularity:native-background'));Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));Object.defineProperty(document,'hidden',{configurable:true,value:false});}")
  page.wait_for_timeout(250);s=page.evaluate(load);before=s['lifetime']['activeSeconds'];assert 2.9<=before<=4.1,(busy,before)
  # The native background flag must suppress foreground ticks even with document.hidden false.
  page.clock.run_for(2000);page.evaluate("()=>window.dispatchEvent(new Event('ai-singularity:native-foreground'))");page.evaluate("()=>{window.dispatchEvent(new Event('ai-singularity:native-foreground'));document.dispatchEvent(new Event('visibilitychange'));}");page.clock.run_for(500);page.evaluate("()=>window.dispatchEvent(new Event('ai-singularity:native-background'))");page.wait_for_timeout(250);after=page.evaluate(load);delta=after['lifetime']['activeSeconds']-before;assert abs(delta-.5)<.01,(busy,delta)
  assert not errors,errors;results.append({'busy':busy,'activeBeforeBackground':before,'activeAfterResume':after['lifetime']['activeSeconds'],'resumeActiveDelta':delta,'actualPaidTaps':after['lifetime']['taps'],'errors':errors});page.close()
 browser.close()
assert abs(results[0]['activeBeforeBackground']-results[1]['activeBeforeBackground'])<.01,results
assert results[1]['actualPaidTaps']>0
output.parent.mkdir(parents=True,exist_ok=True);output.write_text(json.dumps({'preparedFixture':True,'naturalProgressionMeasurement':False,'results':results},indent=2)+'\n');print(json.dumps(results))
