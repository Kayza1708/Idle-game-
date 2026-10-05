import {describe,expect,it} from 'vitest';
import {BALANCE,componentTotal,newGame} from './economy';
import {advance} from './simulation';
import {buyGemOffer} from './gemShop';
import {claimOnboarding} from './onboarding';
import {rewardAd} from './ads';
import {craftModule} from './inventory';

const componentEvent=(state:ReturnType<typeof newGame>,source:string)=>state.telemetry.recentEvents.find(event=>event.type==='component-found'&&event.details.source===source);

describe('specific circuit rewards',()=>{
 it('buys exactly 50 usable circuits for 30 gems and changes nothing when gems are insufficient',()=>{const rich={...newGame(10),gems:200},bought=buyGemOffer(rich,'components',10);expect(bought.gems).toBe(170);expect(bought.componentInventory.circuits).toBe(50);expect(bought.components).toBe(50);expect(bought.lifetime.componentsEarned).toBe(50);const poor={...newGame(10),gems:29};expect(buyGemOffer(poor,'components',10)).toBe(poor)});
 it('claims the onboarding circuit reward once and atomically records the claim',()=>{const base=newGame(20),eligible={...base,onboarding:{completed:['equip-item'],claimed:[]}},claimed=claimOnboarding(eligible,'equip-item');expect(claimed.componentInventory.circuits).toBe(75);expect(claimed.components).toBe(75);expect(claimed.onboarding.claimed).toEqual(['equip-item']);expect(componentEvent(claimed,'onboarding')?.details).toMatchObject({component:'circuits',amount:75});expect(claimOnboarding(claimed,'equip-item')).toBe(claimed)});
 it('grants the rewarded-ad test amount as circuits once per reward id',()=>{const eligible={...newGame(30),prestigeCount:1},rewarded=rewardAd(eligible,'components','reward-1','success',30);expect(rewarded.componentInventory.circuits).toBe(2);expect(rewarded.components).toBe(2);expect(rewarded.ads.transactions).toContain('reward-1');expect(componentEvent(rewarded,'rewarded-ad-test')?.details).toMatchObject({component:'circuits',amount:2});expect(rewardAd(rewarded,'components','reward-1','success',30)).toBe(rewarded)});
 it('spends rewarded circuits through the real module crafting path and keeps totals consistent',()=>{const base={...newGame(40),gems:200,completedResearch:['blueprints' as const],data:1000},rewarded=buyGemOffer(base,'components',40),prepared={...rewarded,componentInventory:{...rewarded.componentInventory,copperCoils:6,siliconWafers:4,titaniumBolts:4},components:componentTotal({...rewarded.componentInventory,copperCoils:6,siliconWafers:4,titaniumBolts:4})},queued=craftModule(prepared,'computeBus'),crafted=advance(queued,BALANCE.craftingSeconds.module).state;expect(crafted.modules.computeBus).toBe(1);expect(crafted.componentInventory.circuits).toBe(40);expect(crafted.components).toBe(componentTotal(crafted.componentInventory));expect(BALANCE.modules.computeBus.ingredients.circuits).toBe(10)});
});
