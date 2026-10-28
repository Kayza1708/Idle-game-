import {readFileSync,writeFileSync} from 'node:fs';
const rows=readFileSync('scripts/unity-native-copy.tsv','utf8').trim().split('\n').map(x=>x.split('|').map(v=>v.replaceAll('\\n','\n')));
for(const row of rows)if(row.length!==7||row.some(x=>!x))throw Error('Invalid native copy '+row[0]);
// Native dialogue translations are presentation content. Original source mechanics and fixtures stay intact.
const narrative=readFileSync('IdleIntelligence/Assets/IdleIntelligence/Core/NarrativeCatalog.g.cs','utf8');
const definitions=new Map([...narrative.matchAll(/new NarrativeDefinition\(("(?:[^"\\]|\\.)*"),("(?:[^"\\]|\\.)*"),new string\[\]\{(.*?)\},new string\[\]\{(.*?)\}\)/g)].map(m=>[JSON.parse(m[1]),JSON.parse('['+m[4]+']')]));
const english={
 'first-milestone':'A real hardware milestone. Large quantities improve not only the class itself but the performance of the whole laboratory.',
 'prestige-ready':'{INT} INT are now available. The restart only happens when you confirm it yourself in the Prestige tab.'
};
const covered=new Set();
for(const line of readFileSync('scripts/unity-story-copy.tsv','utf8').trim().split('\n')){
 const [id,...values]=line.split('|').map(v=>v.replaceAll('\\n','\n'));
 const source=definitions.get(id);if(!source||values.length!==5||values.some(v=>!v)||covered.has(id))throw Error('Invalid narrative translation '+id);
 const required=[...source[0].matchAll(/\{([A-Z_]+)\}/g)].map(m=>m[0]).filter(v=>v!=='{ITEM_SUFFIX}');
 for(const value of values)for(const token of required)if(!value.includes(token))throw Error(id+' missing '+token);
 rows.push([source[1],english[id]??source[0],...values]);covered.add(id);
}
if(covered.size!==definitions.size)throw Error('Narrative translation coverage '+covered.size+'/'+definitions.size);
// Keyed descriptions follow the current source catalog; rules/formulas stay in source code.
const settings=readFileSync('IdleIntelligence/Assets/IdleIntelligence/Core/SettingsCatalog.g.cs','utf8');
const details=new Map([...settings.matchAll(/new LocalizedCopy\(("(?:[^"\\]|\\.)*"),new string\[\]\{(.*?)\}\)/g)].map(m=>[JSON.parse(m[1]),JSON.parse('['+m[2]+']')[1]]));
const meta=readFileSync('IdleIntelligence/Assets/IdleIntelligence/Core/MetaBalance.g.cs','utf8');
for(const m of meta.matchAll(/new AxiomNode\(("(?:[^"\\]|\\.)*"),("(?:[^"\\]|\\.)*"),("(?:[^"\\]|\\.)*"),/g))details.set('axiom-effect:'+JSON.parse(m[1]),JSON.parse(m[3]));
const detailKeys=new Set();
for(const line of readFileSync('scripts/unity-detail-copy.tsv','utf8').trim().split('\n')){
 const [key,...values]=line.split('|').map(v=>v.replaceAll('\\n','\n'));
 if(!details.has(key)||values.length!==6||values.some(v=>!v)||detailKeys.has(key))throw Error('Invalid detail translation '+key);
 rows.push([details.get(key),...values]);detailKeys.add(key);
}
const canonical=new Map(rows.map(row=>[row[0],row]));rows.splice(0,rows.length,...canonical.values());
const q=x=>JSON.stringify(x);
const source='// Generated native adapter copy. Original game catalog mechanics remain source-owned.\nnamespace IdleIntelligence.Core {public static class NativeUiCatalog {public static readonly LocalizedCopy[] Copies={\n'+rows.map(([de,en,...rest],i)=>'new LocalizedCopy('+q('native:'+i)+',new[]{'+[en,de,...rest].map(q).join(',')+'})').join(',\n')+'\n};}}\n';
const path='IdleIntelligence/Assets/IdleIntelligence/Core/NativeUiCatalog.g.cs';
if(process.argv.includes('--check')){if(readFileSync(path,'utf8')!==source)throw Error('Native copy stale');}else writeFileSync(path,source);
console.log('Unity native copy: '+rows.length+' × seven languages, including '+covered.size+' complete dialogues');
