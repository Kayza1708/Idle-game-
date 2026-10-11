/** Technical fixture only: prepared resources and completed research, no progression/balance claim. */
import {writeFileSync,mkdirSync} from 'node:fs';
import assert from 'node:assert/strict';
import {BALANCE,newGame,addData,grantComponents,type ComponentId,type ModuleId} from '../src/economy';
import {learnBlueprint} from '../src/blueprints';
import {craft,craftModule,settleCrafting} from '../src/inventory';
import {restore,serialize} from '../src/storage';
import {balanceEvents} from '../src/balanceSnapshot';

const ids=['photonic-array','memory-crystal','logic-seed','tensor-core','lab-drone'] as const;
const checks=ids.map(id=>{
 const r=BALANCE.itemRecipes[id],components={...r.ingredients};let data=r.data;
 // Prepare raw resources for both the existing module recipes and the new item.
 for(const [moduleId,n] of Object.entries(r.modules)){
  const module=BALANCE.modules[moduleId as ModuleId];data+=module.data*n;
  for(const [k,v] of Object.entries(module.ingredients))components[k as ComponentId]+=v*n;
 }
 let s=grantComponents({...addData(newGame(0,`9c-proof-${id}`),data+100),completedResearch:['blueprints'],blueprintFragments:r.blueprints},components);
 const prepared={components:{...s.componentInventory},data:s.data,fragments:s.blueprintFragments,completedResearch:s.completedResearch};
 s=learnBlueprint(s,id);assert.equal(s.blueprintFragments,0);assert.deepEqual(s.learnedRecipes,[id]);
 for(const [moduleId,n] of Object.entries(r.modules)){
  s=craftModule(s,moduleId as ModuleId,n);assert.ok(s.crafting.active);
  s=settleCrafting({...s,savedAt:s.savedAt+BALANCE.craftingSeconds.module*n*1000});assert.equal(s.modules[moduleId as ModuleId],n);
 }
 const before={components:{...s.componentInventory},modules:{...s.modules},data:s.data,credits:s.credits};
 s=craft(s,id);assert.equal(s.crafting.active?.recipeId,id);assert.equal(s.crafting.active.ingredients.blueprints,0);
 const reservation=structuredClone(s.crafting.active.ingredients);
 const paid={components:{...s.componentInventory},modules:{...s.modules},data:s.data,fragments:s.blueprintFragments,credits:s.credits};
 s=restore(serialize(s),s.savedAt).state;
 s=settleCrafting({...s,savedAt:s.crafting.active!.endsAt!});assert.equal(s.inventory.length,1);
 assert.equal(s.inventory[0].type,id);assert.equal(s.inventory[0].rarity,'common');assert.equal(s.inventory[0].level,0);assert.equal(s.inventory[0].forge??0,0);
 s=settleCrafting(restore(serialize(s),s.savedAt).state);assert.equal(s.inventory.length,1);assert.equal(s.data,paid.data);assert.equal(s.credits,before.credits);
 return{id,prepared,modulesRegularlyCrafted:true,beforeItem:before,reservation,afterPayment:paid,completedAt:s.savedAt,result:s.inventory[0],effectiveForge:s.inventory[0].forge??0,learnedRecipes:s.learnedRecipes,events:balanceEvents(s).filter(e=>['blueprint-learn','crafting_completed'].includes(e.type))};
});
const out=process.argv[2]??'work/item-recipes-proof.json';mkdirSync(out.slice(0,out.lastIndexOf('/')),{recursive:true});
writeFileSync(out,JSON.stringify({technicalPreparedFixture:true,naturalReachabilityClaim:false,checks},null,2));
console.log(JSON.stringify(checks.map(r=>({id:r.id,learned:true,modulesRegularlyCrafted:r.modulesRegularlyCrafted,paidData:r.reservation.data,paidFragments:r.prepared.fragments,completedItems:1,reloadExactlyOnce:true}))));
