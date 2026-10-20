/** Capture the actual JS normalization contract; Unity's Mono Unicode tables differ. */
import {readFileSync,writeFileSync} from 'node:fs';
const hex=(value:string)=>[...value].map(c=>c.codePointAt(0)!.toString(16)).join(',');
const decomposition:string[]=[],composition:string[]=[],marks:string[]=[],properties:Record<string,number[][]>={Letters:[],Marks:[],Numbers:[],Uppercase:[],Lowercase:[],Formats:[]};
const tests=[/\p{L}/u,/\p{M}/u,/\p{N}/u,/\p{Lu}/u,/\p{Ll}/u,/\p{Cf}/u];
function range(out:number[][],code:number){const previous=out.at(-1);if(previous&&previous[1]===code-1)previous[1]=code;else out.push([code,code]);}
for(let code=0;code<=0x10ffff;code++){
 const value=String.fromCodePoint(code),kd=value.normalize('NFKD'),canonical=value.normalize('NFD');
 if(kd!==value)decomposition.push(hex(value)+':'+hex(kd));
 if(canonical!==value&&canonical.normalize('NFC')===value){const parts=[...canonical],last=parts.pop()!,prefix=parts.join('').normalize('NFC');if([...prefix].length===1&&(prefix+last).normalize('NFC')===value)composition.push(hex(prefix+last)+':'+hex(value));}
 Object.values(properties).forEach((out,i)=>{if(tests[i].test(value))range(out,code);});
 if(tests[1].test(value)&&canonical===value&&(('a\u0345'+value).normalize('NFD')!=='a\u0345'+value||('a'+value+'\u0334').normalize('NFD')!=='a'+value+'\u0334'))marks.push(value);
}
function compare(a:string,b:string){if(a===b)return 0;if(('a'+a+b).normalize('NFD')==='a'+b+a)return 1;if(('a'+b+a).normalize('NFD')==='a'+a+b)return-1;return 0;}
marks.sort(compare);let rank=1;const ranks=marks.map((mark,i)=>{if(i&&compare(marks[i-1],mark)!==0)rank++;return[mark.codePointAt(0)!,rank];}).sort((a,b)=>a[0]-b[0]);const ranked:number[][]=[];for(const [code,rank] of ranks){const last=ranked.at(-1);if(last&&last[1]===code-1&&last[2]===rank)last[1]=code;else ranked.push([code,code,rank]);}
const chunks=(rows:string[])=>Array.from({length:Math.ceil(rows.length/256)},(_,i)=>JSON.stringify(rows.slice(i*256,(i+1)*256).join(';'))).join(',\n');
let cs=`// Generated from JavaScript Unicode ${process.versions.unicode}; no platform normalization dependency.\nnamespace IdleIntelligence.Core { public static class NameUnicode {\npublic const string Version=${JSON.stringify(process.versions.unicode)};\npublic static readonly string[] Decomposition={${chunks(decomposition)}};\npublic static readonly string[] Composition={${chunks(composition)}};\n`;
for(const [name,ranges] of [...Object.entries(properties),['CombiningRank',ranked]] as [string,number[][]][])cs+=`public static readonly int[][] ${name}={${ranges.map(r=>'new int[]{'+r.join(',')+'}').join(',')}};\n`;
cs+='} }\n';const path='IdleIntelligence/Assets/IdleIntelligence/Core/NameUnicode.g.cs';if(process.argv.includes('--check')){if(readFileSync(path,'utf8')!==cs)throw Error('Stale JS Unicode normalization data');}else writeFileSync(path,cs);
const inputs=new Set<string>();for(const row of decomposition){const input=String.fromCodePoint(parseInt(row.split(':')[0],16));inputs.add(input);}for(const raw of ['A\u030a\u0301','a\u0345\u0334','a\u0300\u0316','\u0301A','\u1100\u1161\u11a8','\uac00\u11a8','𝓝𝓸𝓿𝓪','𐐀Nova'])inputs.add(raw);
// Deterministic mixed sequences exercise ordering, blockers and compositions across input boundaries.
for(let i=0;i<1000;i++)inputs.add('A'+marks[(i*37)%marks.length]+marks[(i*103+7)%marks.length]+String.fromCodePoint(0xac00+i%11172));
const out=JSON.stringify({unicode:process.versions.unicode,cases:[...inputs].map(input=>({input,kd:input.normalize('NFKD'),kc:input.normalize('NFKC')}))})+'\n',target='IdleIntelligence/Assets/IdleIntelligence/Tests/EditMode/NameNormalizationCases.json';if(process.argv.includes('--check')){if(readFileSync(target,'utf8')!==out)throw Error('Stale normalization cases');}else writeFileSync(target,out);
console.log(`Unity JS Unicode: ${decomposition.length} decompositions / ${composition.length} compositions / ${inputs.size} shared cases`);
