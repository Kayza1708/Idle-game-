import type {Language} from './i18n';

export const NAME_POLICY_VERSION=1;
export const NAME_MIN_LENGTH=2,AI_NAME_MAX_LENGTH=20,PLAYER_NAME_MAX_LENGTH=24;
export type NameError='length'|'characters'|'blocked';
export type NameValidation={ok:true;name:string}|{ok:false;error:NameError};
const leet:Record<string,string>={'0':'o','1':'i','2':'z','3':'e','4':'a','5':'s','6':'g','7':'t','8':'b','9':'g','@':'a','$':'s','!':'i','|':'i'};
// Common visual substitutions, rather than rejecting names written in other scripts.
const confusables:Record<string,string>={'а':'a','е':'e','о':'o','р':'p','с':'c','х':'x','у':'y','і':'i','ј':'j','ѕ':'s','ԁ':'d','ӏ':'l','α':'a','ο':'o','ι':'i','κ':'k','ν':'v','τ':'t'};
const fold=(value:string)=>value.normalize('NFKD').replace(/\p{M}/gu,'').toLowerCase().replace(/ß/g,'ss').replace(/[аеорсхуіјѕԁӏαοικντ]/g,c=>confusables[c]).replace(/[0-9@$!|]/g,c=>leet[c]).replace(/[^a-z]/g,'');
// Local precheck, shared by player/AI names and reusable by future social forms.
// Short terms require complete words to avoid Scunthorpe/Class/Spice false positives.
const words=['idiot','dummkopf','depp','spast','spasti','pisser','piss','ass','arse','dick','cock','cunt','pussy','slut','hure','arsch','fick','ficken','fuck','fucking','shit','shitty','bitch','bitches','bastard','wanker','nazi','hitler','nigger','nigga','faggot','kike','spic','chink','retard','neger','kanake','fotze','schlampe','wichser','scheiss','scheisse','merde','putain','salope','connard','encule','puta','puto','mierda','pendejo','cabron','maricon','porra','caralho','merda','cazzo','stronzo','vaffanculo','kurwa','chuj','jebac'];
const stems=['fuck','bitch','hitler','nigger','nigga','faggot','fotze','wichser','schlampe','scheiss','motherfuck','fucker','fuckyou','fuckoff','shitface','bullshit','bitchass','asshole','arsehole','dickhead','shithead','hurensohn','hurenkind','arschloch','schwuchtel','missgeburt','drecksau','fickdich','scheisskerl','scheisskopf','wixxer','wanker','pendejo','vaffanculo','pierdol'];
const collapsed=(s:string)=>s.replace(/([a-z])\1+/g,'$1');
export function containsBlockedName(input:string){
 const normalized=input.normalize('NFKC');
 const tokens=normalized.split(/[\s_-]+/u).filter(Boolean),candidates=[...tokens,normalized];
 return candidates.some(candidate=>{
  const variants=[fold(candidate),fold(candidate.replace(/[0-9]+$/g,''))];
  return variants.some(value=>words.some(term=>value===term||(term.length>=4&&collapsed(value)===collapsed(term)))||stems.some(stem=>value.includes(stem)||collapsed(value).includes(collapsed(stem))));
 });
}
export function validateName(input:string,maxLength=PLAYER_NAME_MAX_LENGTH):NameValidation{
 if(typeof input!=='string')return{ok:false,error:'characters'};
 const name=input.normalize('NFKC').trim().replace(/\s+/gu,' ');
 if([...name].length<NAME_MIN_LENGTH||[...name].length>maxLength)return{ok:false,error:'length'};
 if(containsBlockedName(name))return{ok:false,error:'blocked'};
 if(!/[\p{L}\p{N}]/u.test(name)||!/^[\p{L}\p{M}\p{N} _-]+$/u.test(name)||/\p{Cf}/u.test(name))return{ok:false,error:'characters'};
 return{ok:true,name};
}
export const validatePlayerName=(input:string)=>validateName(input,PLAYER_NAME_MAX_LENGTH);
export function nameErrorCopy(language:Language,error:NameError,maxLength=PLAYER_NAME_MAX_LENGTH){
 const de=language==='de';
 return error==='length'?(de?`Bitte wähle einen Namen mit 2 bis ${maxLength} Zeichen.`:`Choose a name between 2 and ${maxLength} characters.`):error==='characters'?(de?'Bitte verwende nur Buchstaben, Zahlen, Leerzeichen, - oder _.':'Use only letters, numbers, spaces, - or _.'):(de?'Bitte wähle einen anderen Namen.':'Please choose a different name.');
}
