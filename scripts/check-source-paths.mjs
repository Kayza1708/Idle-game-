import {readdirSync,readFileSync} from 'node:fs';
import {resolve,relative,dirname} from 'node:path';
const root=resolve(process.argv[2]??'src');
function walk(dir){return readdirSync(dir,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?walk(resolve(dir,entry.name)):[resolve(dir,entry.name)]);}
const files=walk(root).filter(path=>/\.(ts|tsx)$/.test(path));
const modules=new Map(),errors=[];
for(const file of files){const key=file.replace(/\.(ts|tsx)$/,'').toLowerCase();const old=modules.get(key);if(old)errors.push(`Case-insensitive module collision: ${relative(root,old)} / ${relative(root,file)}`);else modules.set(key,file);}
for(const file of files){const source=readFileSync(file,'utf8');for(const match of source.matchAll(/(?:from\s*|import\s*\(\s*|import\s*)['"](\.[^'"]+)['"]/g)){const requested=resolve(dirname(file),match[1]).replace(/\.(ts|tsx)$/,'');const actual=modules.get(requested.toLowerCase())??modules.get(resolve(requested,'index').toLowerCase());if(actual&&actual.replace(/\.(ts|tsx)$/,'')!==requested&&actual.replace(/[/\\]index\.(ts|tsx)$/,'')!==requested)errors.push(`Import casing mismatch: ${relative(root,file)} -> ${match[1]} (${relative(root,actual)})`);}}
if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}else console.log(`Source paths verified: ${files.length} TypeScript modules; no case-insensitive collisions or import casing mismatches.`);
