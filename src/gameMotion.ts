import {hardwareIds,type GameState} from './economy';
/** Only reacts to confirmed state changes; cosmetic and never drives game time. */
export function gameMotion(action:string,before:GameState,after:GameState){
 if(!after.settings.effects||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 const selectors:string[]=[];
 if(action==='buy-class'||action==='buy')for(const id of hardwareIds)if(after.hardwareCounts[id]>before.hardwareCounts[id])selectors.push(`#hardware-${id}`);
 if(action==='train'&&after.lifetime.trainingStarted>before.lifetime.trainingStarted)selectors.push('.training-entry');
 if(action==='research-project'&&after.lifetime.researchStarted>before.lifetime.researchStarted)selectors.push('.lab-overview');
 if(action==='node'&&after.nodes.length>before.nodes.length)selectors.push('.prestige-tree');
 if(after.inventory.length>before.inventory.length)selectors.push('.item-receipts');
 if(!selectors.length)return;requestAnimationFrame(()=>{for(const selector of selectors)for(const element of document.querySelectorAll(selector)){element.classList.remove('pixel-success');void (element as HTMLElement).offsetWidth;element.classList.add('pixel-success');element.addEventListener('animationend',()=>element.classList.remove('pixel-success'),{once:true})}});
}
