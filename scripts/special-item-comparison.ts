/** Prepared-state technical comparison, not natural progression. */
import {BALANCE,newGame,addCredits,addData,grantComponents,specialItemEffectQuote} from '../src/economy';
import {createItem,equip,upgrade,forgeItem} from '../src/inventory';
import {prestige} from '../src/prestige';
const results=[];
for(const type of ['impulse-relay','insight-archive'] as const){let s=grantComponents(addData(prestige(addCredits(newGame(0),BALANCE.prestigeBaseRevenue*9)),1e6),{circuits:10000});s=createItem(s,type,'common');s=equip(s,s.inventory[0].id);const id=s.inventory[0].id,base=s;for(const action of ['common','forge1','upgrade1','upgrade1-forge1','upgrade2'] as const){s=base;if(action==='forge1')s=forgeItem(s,id);if(action.startsWith('upgrade'))s=upgrade(s,id);if(action==='upgrade1-forge1')s=forgeItem(s,id);if(action==='upgrade2')s=upgrade(s,id);results.push({type,action,item:{rarity:s.inventory[0].rarity,level:s.inventory[0].level,forge:s.inventory[0].forge??0},before:{bonusSeconds:type==='impulse-relay'?2:0,intWeightContribution:type==='insight-archive'?.25:0,source:'721db56 fixed domain constants'},after:specialItemEffectQuote(s,s.inventory[0])});}}
console.log(JSON.stringify({meaning:'prepared fixtures; real paid upgrade/forge; no natural progression measurement',results},null,2));
