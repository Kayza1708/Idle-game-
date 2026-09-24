const MIN_LENGTH=2,MAX_LENGTH=20;

const fold=(value:string)=>value.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[013457@$!|]/g,char=>({0:'o',1:'i',3:'e',4:'a',5:'s',7:'t','@':'a','$':'s','!':'i','|':'i'}[char]??char)).replace(/[^a-z]/g,'');
const blocked=['nazi','hitler','nigger','nigga','faggot','kike','spic','chink','retard','hurensohn','fotze','schlampe','kanake','neger','schwuchtel'];

export type NameValidation={ok:true;name:string}|{ok:false;message:string};
export function validateAiName(input:string):NameValidation{
 const name=input.trim().replace(/\s+/g,' ');
 if(name.length<MIN_LENGTH||name.length>MAX_LENGTH)return{ok:false,message:'Bitte wähle einen Namen mit 2 bis 20 Zeichen.'};
 if(!/^[\p{L}\p{N} _-]+$/u.test(name))return{ok:false,message:'Erlaubt sind Buchstaben, Zahlen, Leerzeichen, Bindestriche und Unterstriche.'};
 const normalized=fold(name);
 if(blocked.some(term=>normalized.includes(term)))return{ok:false,message:'Bitte wähle einen anderen Namen.'};
 return{ok:true,name};
}
