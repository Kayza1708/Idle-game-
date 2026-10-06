import {describe, expect, it} from 'vitest';
import {addCredits, addCreditsScientific, addData, buyClassUpgrade, buyHardwareClass, canAffordResources, canAffordScientificCreditCost, exactEconomyValue, hardwareBulkCostScientific, hardwareCostScientific, hardwareIds, maxAffordable, newGame, spendResources, spendScientificCredits, spendScientificResources, type GameState} from './economy';
import {ScientificNumber} from './scientificNumber';
import {loadGame, persistGame, restore, SAVE_KEY, SAVE_VERSION, serialize, type StorageLike} from './storage';

const funded=(balance:ScientificNumber,owned=0):GameState=>{
  const state=addCreditsScientific(newGame(0),balance,false);
  return {...state,hardware:owned,hardwareCounts:{...state.hardwareCounts,calculator:owned}};
};

describe('scientific hardware purchase regressions', () => {
  it('refuses the audited 12.589-credit balance for a 15-credit calculator', () => {
    const state = addCreditsScientific(newGame(0), ScientificNumber.fromParts(1, 1.1));
    const cost = hardwareBulkCostScientific('calculator', 0, 1, state);
    const result = buyHardwareClass(state, 'calculator');
    console.log('Audit reproduction:', JSON.stringify({
      balance: state.credits, ledger: state.exactEconomy.credits, cost: cost.toJSON(),
      affordable: canAffordScientificCreditCost(state, cost),
      hardwareBefore: state.hardware, hardwareAfter: result.hardware, creditsAfter: result.credits,
    }));
    expect(canAffordScientificCreditCost(state, cost)).toBe(false);
    expect(result).toBe(state);
  });

  it.each([14.999999999999998,15,15.000000000000002])('uses the same quote, check and debit at balance %s', amount => {
    const state=funded(ScientificNumber.from(amount)),quote=hardwareBulkCostScientific('calculator',0,1,state);
    const result=buyHardwareClass(state,'calculator');
    if(amount<15){expect(result).toBe(state);return;}
    expect(result.hardwareCounts.calculator).toBe(1);
    expect(exactEconomyValue(result,'credits').toJSON()).toEqual(exactEconomyValue(state,'credits').subtract(quote).toJSON());
  });

  it.each([{m:15,e:0},{m:.15,e:2},{m:150,e:-1},{m:1.5,e:1}])('pays the same price with equivalent ledger pair %j', credits => {
    const base=funded(ScientificNumber.from(15)),state={...base,exactEconomy:{...base.exactEconomy,credits}};
    const result=buyHardwareClass(state,'calculator');
    expect(result.hardwareCounts.calculator).toBe(1);
    expect(result.exactEconomy.credits).toEqual({m:0,e:0});
    expect(result.credits).toBe(0);
  });

  it('does not overdraw on a second action against the new state', () => {
    const first=buyHardwareClass(funded(ScientificNumber.from(30)),'calculator');
    expect(first.hardwareCounts.calculator).toBe(1);
    expect(first.credits).toBe(15);
    const second=buyHardwareClass(first,'calculator');
    expect(second).toBe(first);
    expect(second.exactEconomy.credits).toEqual({m:1.5,e:1});
  });

  it('charges x10 like ten real consecutive single purchases', () => {
    const state=funded(ScientificNumber.from(1000));
    const quote=hardwareBulkCostScientific('calculator',0,10,state),bulk=buyHardwareClass(state,'calculator',10);
    let singles=state;
    for(let i=0;i<10;i++)singles=buyHardwareClass(singles,'calculator');
    expect(bulk.hardwareCounts).toEqual(singles.hardwareCounts);
    expect(bulk.componentInventory).toEqual(singles.componentInventory);
    expect(bulk.lifetime.hardwareBought).toBe(singles.lifetime.hardwareBought);
    expect(exactEconomyValue(bulk,'credits').divide(exactEconomyValue(singles,'credits')).toNumber()).toBeCloseTo(1,12);
    expect(exactEconomyValue(bulk,'credits').toJSON()).toEqual(exactEconomyValue(state,'credits').subtract(quote).toJSON());
  });

  it.each(hardwareIds)('keeps %s geometric bulk quotes equal to the sum of actual unit prices', id => {
    for(const owned of [0,9,499,14700]){
      let sum=ScientificNumber.zero();
      for(let i=0;i<10;i++)sum=sum.add(hardwareCostScientific(id,owned+i));
      expect(hardwareBulkCostScientific(id,owned,10).divide(sum).toNumber()).toBeCloseTo(1,11);
    }
  });

  it.each([ScientificNumber.from(14.99),ScientificNumber.from(15),ScientificNumber.from(1000),ScientificNumber.fromString('1e1000')])('buys a maximal affordable quantity for %j', budget => {
    const state=funded(budget),count=maxAffordable('calculator',0,state.credits,state);
    expect(hardwareBulkCostScientific('calculator',0,count,state).compare(budget)).toBeLessThanOrEqual(0);
    expect(hardwareBulkCostScientific('calculator',0,count+1,state).compare(budget)).toBeGreaterThan(0);
    const result=buyHardwareClass(state,'calculator','max');
    expect(result.hardwareCounts.calculator).toBe(count);
    expect(exactEconomyValue(result,'credits').toJSON()).toEqual(budget.subtract(hardwareBulkCostScientific('calculator',0,count,state)).toJSON());
    expect(buyHardwareClass(result,'calculator')).toBe(result);
  });

  it('checks MAX boundaries immediately below, at and above the true bulk quote', () => {
    const cost=hardwareBulkCostScientific('calculator',17,23);
    for(const factor of [.999999999,1,1.000000001]){
      const state=funded(cost.multiplyNumber(factor),17),count=maxAffordable('calculator',17,state.credits,state);
      expect(count).toBe(factor<1?22:23);
      expect(buyHardwareClass(state,'calculator','max').hardwareCounts.calculator).toBe(17+count);
    }
  });

  it('distinguishes capped shadows from actual balances and costs above 1e308', () => {
    const owned=14700,cost=hardwareCostScientific('calculator',owned);
    expect(cost.exponent).toBeGreaterThan(1000);
    const insufficient=funded(cost.multiplyNumber(.999),owned),funds=funded(cost,owned);
    expect(insufficient.credits).toBe(funds.credits); // Both UI shadows are capped.
    expect(canAffordScientificCreditCost(insufficient,cost)).toBe(false);
    expect(buyHardwareClass(insufficient,'calculator')).toBe(insufficient);
    const purchased=buyHardwareClass(funds,'calculator');
    expect(purchased.hardwareCounts.calculator).toBe(owned+1);
    expect(purchased.exactEconomy.credits).toEqual({m:0,e:0});
    expect(cost.isZero()).toBe(false);
    expect(buyHardwareClass(purchased,'calculator')).toBe(purchased);
  });

  it('cannot turn an unaffordable huge bulk purchase into a free purchase', () => {
    const state=funded(ScientificNumber.from(1e300)),quote=hardwareBulkCostScientific('calculator',0,14700,state);
    expect(quote.exponent).toBeGreaterThan(1000);
    expect(buyHardwareClass(state,'calculator',14700)).toBe(state);
  });

  it.each([0,-1,.5,10.5,NaN,Infinity,-Infinity,Number.MAX_SAFE_INTEGER+1,'10','invalid'])('rejects quantity %s before any debit', quantity => {
    const state=funded(ScientificNumber.from(1000)),snapshot=structuredClone(state);
    expect(buyHardwareClass(state,'calculator',quantity as number)).toBe(state);
    expect(state).toEqual(snapshot);
  });

  it('refuses quantity overflow, invalid ownership and unknown hardware', () => {
    const state=funded(ScientificNumber.fromString('1e1000'),1);
    expect(buyHardwareClass(state,'calculator',Number.MAX_SAFE_INTEGER)).toBe(state);
    expect(maxAffordable('calculator',Number.MAX_SAFE_INTEGER,state.credits,state)).toBe(0);
    for(const owned of [-1,.5,NaN,Infinity]){
      const bad={...state,hardwareCounts:{...state.hardwareCounts,calculator:owned}};
      expect(buyHardwareClass(bad,'calculator')).toBe(bad);
      expect(maxAffordable('calculator',owned,bad.credits,bad)).toBe(0);
    }
    expect(buyHardwareClass(state,'unknown' as 'calculator')).toBe(state);
  });

  it('keeps MAX within the existing safe-integer ownership limit', () => {
    const state=funded(ScientificNumber.fromParts(1,1e15),Number.MAX_SAFE_INTEGER-2);
    expect(maxAffordable('calculator',state.hardwareCounts.calculator,state.credits,state)).toBe(2);
    const result=buyHardwareClass(state,'calculator','max');
    expect(result.hardwareCounts.calculator).toBe(Number.MAX_SAFE_INTEGER);
    expect(buyHardwareClass(result,'calculator')).toBe(result);
  });

  it.each([NaN,Infinity,-Infinity,-1])('refuses invalid numeric resources/costs %s without changing state', value => {
    const state=funded(ScientificNumber.from(1000));
    expect(addCredits(state,value)).toBe(state);
    expect(addData(state,value)).toBe(state);
    expect(canAffordResources(state,{credits:value})).toBe(false);
    expect(canAffordResources(state,{data:value})).toBe(false);
    expect(spendResources(state,{credits:value})).toBe(state);
    expect(spendResources(state,{data:value})).toBe(state);
    const bad={...state,credits:value};
    expect(buyHardwareClass(bad,'calculator')).toBe(bad);
    expect(buyHardwareClass(bad,'calculator','max')).toBe(bad);
  });

  it.each([{m:NaN,e:0},{m:Infinity,e:0},{m:-1,e:0},{m:1,e:Infinity},{m:1,e:1e300}])('refuses invalid scientific ledgers %j', credits => {
    const base=funded(ScientificNumber.from(1000)),state={...base,exactEconomy:{...base.exactEconomy,credits}};
    expect(buyHardwareClass(state,'calculator')).toBe(state);
    expect(buyHardwareClass(state,'calculator','max')).toBe(state);
    expect(spendScientificCredits(state,ScientificNumber.from(1))).toBe(state);
    expect(addCredits(state,1)).toBe(state);
  });

  it('refuses forged invalid scientific costs instead of treating them as zero', () => {
    const state=funded(ScientificNumber.from(1000));
    const invalid=Object.assign(Object.create(ScientificNumber.prototype),{mantissa:NaN,exponent:0}) as ScientificNumber;
    expect(canAffordScientificCreditCost(state,invalid)).toBe(false);
    expect(spendScientificCredits(state,invalid)).toBe(state);
    expect(spendScientificResources(state,invalid)).toBe(state);
    expect(spendResources(state,{credits:null as unknown as number})).toBe(state);
    expect(spendResources(state,{data:'15' as unknown as number})).toBe(state);
    expect(spendResources(state,15 as unknown as {credits:number})).toBe(state);
  });

  it('does not use an underflowed native cost projection as a free scientific cost', () => {
    const state=newGame(0),cost=ScientificNumber.fromParts(1,-1000);
    expect(cost.toNumber()).toBe(0); // Only the native display is below its range.
    expect(cost.isZero()).toBe(false);
    expect(canAffordScientificCreditCost(state,cost)).toBe(false);
    expect(spendScientificCredits(state,cost)).toBe(state);
  });

  it.each(hardwareIds)('keeps the existing disabled %s class-upgrade action unchanged', id => {
    const state=funded(ScientificNumber.fromString('1e1000'),500);
    expect(buyClassUpgrade(state,id)).toBe(state);
  });
});

class MemoryStorage implements StorageLike {
  values=new Map<string,string>();
  getItem(key:string){return this.values.get(key)??null;}
  setItem(key:string,value:string){this.values.set(key,value);}
  removeItem(key:string){this.values.delete(key);}
}

describe('scientific resource persistence boundaries', () => {
  it.each([SAVE_VERSION,39,31])('preserves fractional-exponent balances from save version %s', version => {
    const state=newGame(0);
    // Include a stale scalar shadow to ensure normalization preserves the actual pair.
    state.exactEconomy.credits={m:1,e:1.1};
    state.exactEconomy.data={m:25,e:-1.5};
    const raw=JSON.stringify({version,state}),result=restore(raw,0);
    expect(result.error).toBeUndefined();
    expect(result.state.exactEconomy.credits.e).toBe(1);
    expect(result.state.credits).toBeCloseTo(10**1.1,12);
    expect(result.state.data).toBeCloseTo(25*10**-1.5,12);
    expect(buyHardwareClass(result.state,'calculator')).toBe(result.state);
    const reloaded=restore(serialize(result.state),0);
    expect(reloaded.error).toBeUndefined();
    expect(reloaded.state.exactEconomy).toEqual(result.state.exactEconomy);
    expect(buyHardwareClass(reloaded.state,'calculator')).toBe(reloaded.state);
  });

  it('normalizes valid pairs when credits/data cross the real ledger helpers', () => {
    const state=newGame(0);
    state.exactEconomy.credits={m:1,e:1.1};state.exactEconomy.data={m:150,e:-1};
    const next=spendScientificResources(addCredits(state,1),ScientificNumber.from(1),ScientificNumber.from(15));
    expect(next.credits).toBeCloseTo(10**1.1,12);
    expect(next.exactEconomy.credits.e).toBe(1);
    expect(next.exactEconomy.data).toEqual({m:0,e:0});
  });

  it('keeps a 1e1000 balance, real MAX quote and purchase decision through save/reload', () => {
    const state=funded(ScientificNumber.fromString('1e1000'));
    const loaded=restore(serialize(state),0);
    expect(loaded.error).toBeUndefined();
    expect(loaded.state.exactEconomy.credits).toEqual({m:1,e:1000});
    const count=maxAffordable('calculator',0,state.credits,state);
    expect(maxAffordable('calculator',0,loaded.state.credits,loaded.state)).toBe(count);
    const bought=buyHardwareClass(loaded.state,'calculator','max'),again=restore(serialize(bought),0);
    expect(again.error).toBeUndefined();
    expect(again.state.exactEconomy.credits).toEqual(bought.exactEconomy.credits);
    expect(buyHardwareClass(again.state,'calculator')).toBe(again.state);
  });

  it.each([null,{m:-1,e:0},{m:1,e:null},{m:1,e:1e300}])('preserves a damaged primary save with pair %j', credits => {
    const storage=new MemoryStorage(),base=newGame(0);
    const raw=JSON.stringify({version:SAVE_VERSION,state:{...base,exactEconomy:{...base.exactEconomy,credits}}});
    storage.setItem(SAVE_KEY,raw);
    const result=loadGame(storage,0);
    expect(result.error).toBeDefined();expect(result.writable).toBe(false);
    expect(result.recoveryRaw).toBe(raw);
    expect(storage.getItem(SAVE_KEY)).toBe(raw);
  });

  it('refuses a current save missing a required scientific ledger field', () => {
    const state=newGame(0),ledger={...state.exactEconomy};
    delete (ledger as Partial<typeof ledger>).credits;
    const raw=JSON.stringify({version:SAVE_VERSION,state:{...state,exactEconomy:ledger}});
    expect(restore(raw,0).error).toBeDefined();
  });

  it('refuses to serialize or persist an invalid ledger over the last valid save', () => {
    const storage=new MemoryStorage(),state=funded(ScientificNumber.from(100));
    expect(persistGame(storage,state,0).saved).toBe(true);
    const raw=storage.getItem(SAVE_KEY),bad={...state,exactEconomy:{...state.exactEconomy,credits:{m:NaN,e:0}}};
    expect(()=>serialize(bad)).toThrow();
    expect(persistGame(storage,bad,0).saved).toBe(false);
    expect(storage.getItem(SAVE_KEY)).toBe(raw);
  });
});
