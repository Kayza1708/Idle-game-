import{describe,expect,it}from'vitest';import{validateAiName}from'./aiName';
describe('local AI name validation',()=>{
 it('trims and accepts useful local names',()=>expect(validateAiName('  Nova  7 ')).toEqual({ok:true,name:'Nova 7'}));
 it.each(['',' ','A'])('rejects empty or too-short input %j',(value:string)=>expect(validateAiName(value).ok).toBe(false));
 it('enforces the 20-character maximum',()=>{expect(validateAiName('A'.repeat(20)).ok).toBe(true);expect(validateAiName('A'.repeat(21)).ok).toBe(false)});
 it.each(['N 4 z i','HÏTLER','n!g-g3r','Schwuch tel'])('rejects normalized bypass %j',(value:string)=>expect(validateAiName(value).ok).toBe(false));
});
