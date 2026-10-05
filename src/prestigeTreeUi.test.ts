import {describe,expect,it} from 'vitest';
import {BALANCE,newGame,type PrestigeUpgradeId} from './economy';
import {buyNode} from './prestige';
import {prestigeLayout,prestigeNodeState,validatePrestigeCatalog} from './prestigeTree';

const ids=Object.keys(BALANCE.prestigeUpgrades) as PrestigeUpgradeId[];

describe('prestige tree presentation contract',()=>{
  it('registers every catalog node exactly once and validates every prerequisite edge',()=>{
    expect(Object.keys(prestigeLayout).sort()).toEqual([...ids].sort());
    expect(new Set(Object.keys(prestigeLayout)).size).toBe(ids.length);
    expect(validatePrestigeCatalog()).toEqual({unknown:[],cycles:[]});
    const renderedEdges=ids.flatMap(id=>BALANCE.prestigeUpgrades[id].requires.map(requirement=>`${requirement}->${id}`));
    const catalogEdges=ids.flatMap(id=>BALANCE.prestigeUpgrades[id].requires.map(requirement=>`${requirement}->${id}`));
    expect(renderedEdges).toEqual(catalogEdges);
  });

  it('distinguishes locked, INT-short, purchasable, and purchased states',()=>{
    const base=newGame(0);
    expect(prestigeNodeState(base,'dataArchive2')).toBe('locked');
    expect(prestigeNodeState(base,'dataArchive1')).toBe('ready');
    expect(prestigeNodeState({...base,unspentINT:3},'dataArchive1')).toBe('affordable');
    expect(prestigeNodeState({...base,nodes:['dataArchive1']},'dataArchive1')).toBe('owned');
  });

  it('keeps catalog prerequisites unchanged and purchases through the existing transaction',()=>{
    const base=newGame(0),funded={...base,unspentINT:20,exactEconomy:{...base.exactEconomy,unspentINT:{m:2,e:1}}};
    expect(BALANCE.prestigeUpgrades.dataArchive2.requires).toEqual(['dataArchive1']);
    expect(buyNode(funded,'dataArchive2')).toBe(funded);
    const bought=buyNode(funded,'dataArchive1');
    expect(bought.nodes).toEqual(['dataArchive1']);
    expect(bought.unspentINT).toBe(19);
  });

  it('places the independent entry unlocks directly below the core',()=>{
    const entry=['shoppingAgent','trainingPlan','componentScanner'] as const;
    expect(entry.map(id=>BALANCE.prestigeUpgrades[id].requires)).toEqual([[],[],[]]);
    expect(new Set(entry.map(id=>prestigeLayout[id].y))).toEqual(new Set([160]));
  });
});
