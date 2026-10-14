import {hardwareIds,type GameState} from './economy';
import {progressionMotionPlan} from './progressionMotionPlan';
let generation=0;const active=new Set<Animation>();const overlays=new Set<Element>();
export function clearGameMotion(){generation++;for(const animation of active)animation.cancel();active.clear();for(const element of overlays)element.remove();overlays.clear();}
function animate(element:Element,frames:Keyframe[],options:KeyframeAnimationOptions){if(typeof element.animate!=='function')return;const animation=element.animate(frames,options);active.add(animation);animation.finished.catch(()=>undefined).finally(()=>active.delete(animation));return animation;}
const visible=(element:Element)=>{const rect=element.getBoundingClientRect();return rect.width>0&&rect.height>0&&rect.right>0&&rect.bottom>0&&rect.left<innerWidth&&rect.top<innerHeight};
/** Only reacts to confirmed state changes; cosmetic and never drives game time. */
export function gameMotion(action:string,before:GameState,after:GameState){
 if(!after.settings.effects||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 const frameGeneration=generation,plan=progressionMotionPlan(action,before,after),selectors=plan.targets;
 if(action==='buy-class'||action==='buy')for(const id of hardwareIds)if(after.hardwareCounts[id]>before.hardwareCounts[id])selectors.push(`#hardware-${id}`);
 if(action==='train'&&after.lifetime.trainingStarted>before.lifetime.trainingStarted)selectors.push('.training-entry');
 if(action==='research-project'&&after.lifetime.researchStarted>before.lifetime.researchStarted)selectors.push('.lab-overview');
 if(after.inventory.length>before.inventory.length&&!['capsule-gem','capsule-video'].includes(action))selectors.push('.item-receipts');
 const source=plan.transfer?document.querySelector(`[data-motion-item="${CSS.escape(plan.transfer.id)}"] .item-art, #item-detail-${CSS.escape(plan.transfer.id)} .item-art`):null;
 const from=source&&visible(source)?source.getBoundingClientRect():null,copy=from?source!.cloneNode(true) as HTMLElement:null;
 if(!selectors.length&&!plan.links.length&&!copy)return;
 requestAnimationFrame(()=>{
  if(frameGeneration!==generation||!after.settings.effects||document.hidden||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  for(const selector of new Set(selectors))for(const element of document.querySelectorAll(selector))if(visible(element))animate(element,[{filter:'brightness(1)'},{filter:'brightness(1.65)',offset:.3},{filter:'brightness(1)'}],{duration:600,easing:'ease-out'});
  for(const selector of plan.links)for(const element of document.querySelectorAll(selector))if(visible(element))animate(element,[{stroke:'#ffe4a2',strokeDasharray:'12 8',strokeDashoffset:'40',opacity:1},{stroke:'#9fe2c8',strokeDasharray:'12 8',strokeDashoffset:'0',opacity:1}],{duration:850,easing:'ease-out'});
  const target=plan.transfer?document.querySelector(`[data-motion-slot="${plan.transfer.slot}"] .item-art`):null;
  if(copy&&from&&target&&visible(target)){const to=target.getBoundingClientRect();copy.classList.add('item-transfer-ghost');copy.setAttribute('aria-hidden','true');Object.assign(copy.style,{position:'fixed',left:`${from.left}px`,top:`${from.top}px`,width:`${from.width}px`,height:`${from.height}px`,margin:'0',transformOrigin:'top left'});document.body.append(copy);overlays.add(copy);const animation=animate(copy,[{transform:'translate(0,0) scale(1)',opacity:1},{transform:`translate(${to.left-from.left}px,${to.top-from.top-from.height*.3}px) scale(${to.width/from.width})`,opacity:1,offset:.75},{transform:`translate(${to.left-from.left}px,${to.top-from.top}px) scale(${to.width/from.width})`,opacity:0}],{duration:500,easing:'cubic-bezier(.2,.7,.3,1)'});if(animation)animation.finished.catch(()=>undefined).finally(()=>{copy.remove();overlays.delete(copy)});else{copy.remove();overlays.delete(copy)}}
 });
}
