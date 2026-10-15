/** Test-only browser entry, never imported by the production bundle. */
import React from 'react';import {createRoot} from 'react-dom/client';
import {App} from '../src/App';import {CrashRecorder} from '../src/crashDiagnostics';import {browserStorage} from '../src/storage';
import '../src/style.css';import '../src/mobile-ui.css';import '../src/pixel-game.css';import '../src/cohesive-game.css';import '../src/immersive-game.css';import '../src/item-presentation.css';import '../src/shop-market.css';
const driver={mode:'success',calls:0,resolve:null as null|((value:'success'|'cancel'|'error')=>void)};
(globalThis as any).__shopAdDriver=driver;
const provider={available:true,show:async()=>{driver.calls++;if(driver.mode==='throw')throw Error('Mock SDK failure');if(driver.mode==='hold')return new Promise<'success'|'cancel'|'error'>(resolve=>driver.resolve=resolve);return driver.mode as 'success'|'cancel'|'error'}};
document.body.innerHTML='<div id="root"></div>';createRoot(document.getElementById('root')!).render(<App recorder={new CrashRecorder(browserStorage(),null)} rewardedAdProvider={provider}/>);
