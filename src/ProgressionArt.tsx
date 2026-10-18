import {HardwareArt,ItemArt,ResourceArt,ComponentArt} from './GameArt';
import {ShopIcon} from './ShopIcon';
import {PixelIcon} from './PixelIcon';
import type {HardwareId,ItemTypeId} from './economy';
import type {PrestigeNodeV2,AxiomNodeV2} from './progression';

// Presentation only: reuse the original game art for the capability each node unlocks.
const hardware:Partial<Record<PrestigeNodeV2,HardwareId>>={H01:'sbc',H02:'rig',H03:'campus',H04:'subsea',H05:'orbital',H06:'pc',H07:'server',H08:'farm',H09:'cloud',H10:'dyson'};
const items:Partial<Record<PrestigeNodeV2,ItemTypeId>>={
 T01:'quantum-chip',T02:'neural-asic',T03:'curriculum-module',T04:'memory-crystal',T07:'long-term-memory',T08:'blueprint-archive',T09:'inference-router',T10:'photonic-matrix',
 F02:'blueprint-archive',F05:'experiment-controller',F07:'data-prism',F09:'lab-drone',F10:'quantum-diagnostic-module',
 W01:'burst-processor',W02:'tensor-core',W03:'field-scanner',W04:'manufacturing-controller',W05:'logic-seed',W06:'precision-scanner',W07:'photonic-array',W08:'recycling-probe',W09:'quantum-coupler',W10:'photonic-matrix',
 S03:'burst-processor',S06:'neural-asic',S07:'memory-crystal',S08:'protocol-controller',S10:'quantum-chip',I03:'insight-archive',I08:'data-prism',I09:'memory-crystal',I10:'quantum-coupler'
};
export function ProgressionNodeArt({id}:{id:PrestigeNodeV2|AxiomNodeV2}){
 const device=hardware[id as PrestigeNodeV2],item=items[id as PrestigeNodeV2];
 if(device)return <HardwareArt id={device}/>;
 if(item)return <ItemArt type={item}/>;
 if(['F01','F04','F08'].includes(id))return <ShopIcon name="lab"/>;
 if(['T05','T06'].includes(id))return <ShopIcon name="trainingBoost"/>;
 if(['F03','F06','I04'].includes(id))return <ShopIcon name="researchBoost"/>;
 if(['S01','S02','S05'].includes(id))return <PixelIcon name="tap"/>;
 if(['S04','S09'].includes(id))return <ResourceArt id="compute"/>;
 if(id==='I01')return <ResourceArt id="credits"/>;
 if(id==='I02')return <ShopIcon name="trophy"/>;
 if(id==='I06')return <ShopIcon name="profile"/>;
 if(id==='I07')return <PixelIcon name="prestige"/>;
 if(id.startsWith('B'))return <ShopIcon name="offline"/>;
 if(id.startsWith('C'))return <ComponentArt id="graphene"/>;
 if(id.startsWith('D'))return <ShopIcon name="trainingBoost"/>;
 return <ResourceArt id="int"/>;
}
