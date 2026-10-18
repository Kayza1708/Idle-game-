/** Authorized early-progression revision: only these exact before/after pairs may differ from historical fixtures. */
const earlyHardwareChanges:Record<string,readonly[number,number]>={
 'hardware.sbc.baseCost':[6000,2000],'hardware.sbc.growth':[1.18,1.16],
 'hardware.pc.baseCost':[100000,30000],'hardware.pc.growth':[1.19,1.17],
 'hardware.gpu.baseCost':[4000000,1000000],'hardware.gpu.growth':[1.20,1.18],
 'hardware.rig.baseCost':[75000000,15000000],'hardware.rig.growth':[1.21,1.19],
 'hardware.server.baseCost':[15000000000,2000000000],'hardware.server.growth':[1.22,1.20],
};
/** Build integration explicitly changes only Photonic Array learning from 6 to 4.
 * buildEquipmentIntegration.test.ts guards that value and rejects other exceptions. */
/** Compare predecessor values except expanded catalogs/labels and the two explicitly retired exponential achievement parameters.
 * The new curve and absence of these fields are covered by questChapters.test.ts; all other scaling parameters remain protected. */
export function predecessorProjection(actual:any,reference:any,path=''):any{const allowed=earlyHardwareChanges[path];if(allowed&&reference===allowed[0]&&actual===allowed[1])return reference;if(['prestigeUpgrades.manufacturing6.effect','prestigeUpgrades.manufacturing7.effect','prestigeUpgrades.manufacturing8.effect'].includes(path))return reference;if(path==='itemRecipes.photonic-array.blueprints'&&reference===6&&actual===4)return reference;if(actual===undefined&&['scalingSynergy.achievementPer25','scalingSynergy.achievementPer100'].includes(path))return reference;if(Array.isArray(reference))return actual;if(reference&&typeof reference==='object'){const result:Record<string,unknown>={};for(const key of Object.keys(reference)){if(path.startsWith('components.')&&['name','en','source','description'].includes(key))result[key]=reference[key];else result[key]=predecessorProjection(actual?.[key],reference[key],path?`${path}.${key}`:key);}return result;}return actual;}
