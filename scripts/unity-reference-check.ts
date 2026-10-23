import {readFileSync} from 'node:fs';
import {ScientificNumber as S} from '../src/scientificNumber';
// Only accrued, transcendental INT entitlement may differ by a few binary64 ULPs
// across CPU math libraries. Payments, balances, IDs, actions and integer INT awards remain exact.
export function referenceDifferences(expected:any,actual:any,path='$',out:string[]=[],fundedLifetime=false):string[]{
 if(Object.is(expected,actual))return out;
 if(expected&&actual&&typeof expected==='object'&&typeof actual==='object'){
  const a=Object.keys(expected),b=Object.keys(actual);
  if(a.length!==b.length||a.some(k=>!Object.hasOwn(actual,k))){out.push(path+': fields differ');return out}
  if(path.endsWith('.prestige.entitlement')&&['m','e','terms'].every(k=>a.includes(k))){
   const number=(n:any)=>S.fromJSON({m:n.m,e:n.e,terms:n.terms?.map((t:any)=>[t.index,t.value])});
   const x=number(expected),y=number(actual),high=x.compare(y)>=0?x:y,low=x.compare(y)>=0?y:x;
   if(high.isZero()||high.subtract(low).compare(high.multiply(S.from(8*Number.EPSILON)))<=0)return out;
  }
  // Funded lifetime producer fixtures hold 1e80 credits; compare the accumulated
  // negative cost terms at their own magnitude, never at the enormous bank balance.
  if(fundedLifetime&&/^\$\.cases\.\d+\.before\.credits$/.test(path)&&Array.isArray(expected.terms)&&Array.isArray(actual.terms)){
   const positives=(n:any)=>n.terms.filter((t:any)=>t.value>=0);
   const debit=(n:any)=>n.terms.filter((t:any)=>t.value<0).reduce((sum:S,t:any)=>sum.add(S.fromString(`${-t.value}e${t.index*7}`)),S.zero());
   if(expected.m===actual.m&&expected.e===actual.e&&JSON.stringify(positives(expected))===JSON.stringify(positives(actual))){const x=debit(expected),y=debit(actual),high=x.compare(y)>=0?x:y,low=x.compare(y)>=0?y:x;if(high.subtract(low).compare(high.multiply(S.from(8*Number.EPSILON)))<=0)return out;}
  }
  for(const key of a)referenceDifferences(expected[key],actual[key],path+'.'+key,out,fundedLifetime);
 }else out.push(path+': '+JSON.stringify(expected)+' -> '+JSON.stringify(actual));return out;
}
export function verifyReference(path:string,output:string,label:string,fundedLifetime=false){const raw=readFileSync(path,'utf8');if(raw===output)return;const differences=referenceDifferences(JSON.parse(raw),JSON.parse(output),'$',[],fundedLifetime);if(differences.length)throw Error(label+'\n'+differences.slice(0,20).join('\n'));}
