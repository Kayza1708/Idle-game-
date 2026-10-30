// Independent Cloudflare moderation policy. Imported from the last reviewed TS policy.
// Keep unit-test parity golden before removing the obsolete web app.
import termsByLanguage from './moderation/blockedTerms.json' with {type:'json'};
import reserved from './moderation/reservedNames.json' with {type:'json'};

export const NAME_POLICY_VERSION=2;
export const NAME_MIN_LENGTH=2,AI_NAME_MAX_LENGTH=20,PLAYER_NAME_MAX_LENGTH=24;
const leet={'0':'o','1':'i','2':'z','3':'e','4':'a','5':'s','6':'g','7':'t','8':'b','9':'g','@':'a','$':'s','!':'i','|':'i'};
const confusables={'а':'a','е':'e','о':'o','р':'p','с':'c','х':'x','у':'y','і':'i','ј':'j','ѕ':'s','ԁ':'d','ӏ':'l','α':'a','ο':'o','ι':'i','κ':'k','ν':'v','τ':'t'};
/** Keep non-Latin scripts and Indic vowel marks. Only Latin/Arabic accent marks are stripped. */
export function normalizeModerationText(value){
 return value.normalize('NFKD').toLowerCase()
  .replace(/([a-z])\p{M}+/gu,'$1').replace(/[\u064B-\u065F\u0670\u0640]/gu,'')
  .replace(/ß/g,'ss').replace(/ł/g,'l').replace(/đ/g,'d').replace(/[أإآٱ]/g,'ا').replace(/ى/g,'ي')
  .replace(/[аеорсхуіјѕԁӏαοικντ]/g,c=>confusables[c])
  .replace(/[٠-٩]/g,c=>String(c.charCodeAt(0)-0x660)).replace(/[۰-۹]/g,c=>String(c.charCodeAt(0)-0x6f0))
  .replace(/[0-9@$!|]/g,c=>leet[c]).replace(/[^\p{L}\p{M}]/gu,'');
}
const collapsed=(s:string)=>s.replace(/(\p{L})\1+/gu,'$1');
const dictionary=[...Object.values(termsByLanguage).flat(),...reserved.politicalNames,...reserved.extremismAndThreats];
const exactTerms=new Set(dictionary.map(normalizeModerationText).filter(Boolean));
const repeatedTerms=new Set([...exactTerms].filter(t=>[...t].length>=4).map(collapsed));
// Only reviewed, unambiguous terms match inside decorated names; short/ambiguous words stay whole-token.
const embeddedTerms=[
 'fuck','bitch','nigger','nigga','faggot','motherfucker','asshole','arsehole','dickhead','shithead','shitface','bullshit','blowjob','pornhub','pornography','hentai','pedophile','paedophile','whitepower','heilhitler','siegheil','neonazi',
 'fotze','wichser','wichsen','wixxer','schlampe','scheiss','hurensohn','hurenkind','hsohn','arschloch','schwuchtel','missgeburt','drecksau','fickdich','ficken','hackfresse','nutten','kacknoob',
 'pendejo','gilipollas','hijoputa','hijueputa','chupapollas','chingada','malparido','mamaguevo','comemierda','connard','connasse','putain','enfoire','encule','niquetamere','filsdepute',
 'caralho','boceta','filhodaputa','arrombado','porra','puttana','stronzo','vaffanculo','cazzo','minchia','kurwa','skurwysyn','pierdol','jebac',
 'madarchod','behenchod','benchod','bhenchod','bhosdike','bhosdk','chutiya','chootiya',
 'मादरचोद','बहनचोद','बहेंचोद','चूतिया','चुतिया','गांडू','भोसड़ीके','भोसडीके',
 'كسمك','شرموطة','قحبة','متناك','كسامك','ابنشرموطة','sharmouta','sharmoota','kosomak',
 '傻逼','傻屄','操你妈','操你媽','草泥马','他妈的','他媽的','王八蛋','婊子',
 'hitler','himmler','goebbels','mussolini','bolsonaro','netanyahu','lukashenko','wagenknecht',
].map(normalizeModerationText);
const repeatedEmbedded=embeddedTerms.map(collapsed);

export function containsBlockedName(input){
 if(typeof input!=='string')return false;
 const text=input.normalize('NFKC').replace(/\p{Cf}/gu,'');
 // Digits are also stripped independently so punctuation/number decoration cannot hide a whole word.
 const candidates=[text,...text.replace(/(\p{Ll})(\p{Lu})/gu,'$1 $2').split(/[^\p{L}\p{M}\p{N}@$!|]+/u)].filter(Boolean);
 for(const candidate of candidates){
  const value=normalizeModerationText(candidate),withoutNumbers=normalizeModerationText(candidate.replace(/\p{N}/gu,''));
  for(const variant of new Set([value,withoutNumbers,value.replace(/^x{1,3}|x{1,3}$/g,'')])){
   if(exactTerms.has(variant)||repeatedTerms.has(collapsed(variant)))return true;
   if(embeddedTerms.some(term=>variant.includes(term))||repeatedEmbedded.some(term=>collapsed(variant).includes(term)))return true;
  }
 }
 return false;
}
export function validateName(input,maxLength=PLAYER_NAME_MAX_LENGTH){
 if(typeof input!=='string')return{ok:false,error:'characters'};
 const name=input.normalize('NFKC').trim().replace(/\s+/gu,' ');
 if([...name].length<NAME_MIN_LENGTH||[...name].length>maxLength)return{ok:false,error:'length'};
 if(containsBlockedName(name))return{ok:false,error:'blocked'};
 if(!/[\p{L}\p{N}]/u.test(name)||!/^[\p{L}\p{M}\p{N} _-]+$/u.test(name)||/\p{Cf}/u.test(name))return{ok:false,error:'characters'};
 return{ok:true,name};
}
export const validatePlayerName=(input)=>validateName(input,PLAYER_NAME_MAX_LENGTH);
