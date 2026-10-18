import {readFileSync,existsSync,readdirSync} from 'node:fs';
import {join} from 'node:path';
const walk=directory=>readdirSync(directory,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?walk(join(directory,entry.name)):[join(directory,entry.name)]);
const files=['index.html','public/manifest.webmanifest',...walk('src').filter(f=>/\.(?:tsx?|css)$/.test(f)&&!f.includes('.test.')&&!f.includes('/testSupport/'))];
const references=new Set(),missing=[];
for(const file of files){
 const text=readFileSync(file,'utf8');
 for(const match of text.matchAll(/["'`(](\/(?:assets|icons|licenses)\/[^"'`)\s]+|\/(?:favicon\.png|apple-touch-icon\.png|manifest\.webmanifest))["'`)]/g)){
  const asset=match[1].split(/[?#]/)[0];if(asset.includes('${'))continue;references.add(asset);if(!existsSync('public'+asset))missing.push(`${file}: ${asset}`);
 }
}
if(missing.length){console.error('Missing shipped assets:\n'+missing.join('\n'));process.exitCode=1}else console.log(`Runtime asset paths verified: ${references.size} literal public-file references.`);
