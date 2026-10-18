import snapshot from './earlyReportedSnapshot.json';
import {newGame,type GameState} from '../economy';
import {ScientificNumber,type ScientificJSON} from '../scientificNumber';

/** Anonymized production reconstruction; not a restored full save or a claim about unseen fields. */
export function earlyReportedState(now=0):GameState{
 let s=newGame(now,'reported-early-production');
 const balances=snapshot.balances as unknown as GameState['exactEconomy'];
 s={...s,...snapshot.resources,nextId:Math.max(s.nextId,...snapshot.items.inventory.map(i=>Number(i.id.split('-').at(-1))||0))+1,hardware:snapshot.hardware.total,hardwareCounts:{...snapshot.hardware.counts},discovered:snapshot.hardware.discovered as GameState['discovered'],classUpgrades:snapshot.hardware.classUpgrades as GameState['classUpgrades'],level:snapshot.model.level,qualityLevel:snapshot.model.qualityLevel,efficiencyLevel:snapshot.model.efficiencyLevel,researchLevels:{...snapshot.researchLevels},completedResearch:snapshot.completedResearch as GameState['completedResearch'],inventory:snapshot.items.inventory as GameState['inventory'],equipped:{...snapshot.items.equipped},intro:{...s.intro,qualityUsed:true,researchUsed:true},progression:{...s.progression,entitlement:snapshot.entitlement as ScientificJSON},exactEconomy:{...s.exactEconomy,...balances}};
 for(const key of Object.keys(balances) as (keyof GameState['exactEconomy'])[])s={...s,[key]:ScientificNumber.fromJSON(balances[key]).toNumber()};
 return s;
}
