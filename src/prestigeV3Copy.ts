import {BALANCE} from './economy';
import {type Language} from './i18n';
/** Presentation only. All numerical values come from the same balance as the consumer. */
const descriptions={C01:{
 en:'Passive component quantity by level: {values}. Replaces the previous bonus; applies only to regular passive finds.',
 de:'Passive Komponentenmenge je Stufe: {values}. Ersetzt den bisherigen Bonus; gilt nur für reguläre passive Funde.',
 es:'Cantidad de componentes pasivos por nivel: {values}. Sustituye la bonificación anterior; solo se aplica a hallazgos pasivos regulares.',
 fr:'Quantité de composants passifs par niveau : {values}. Remplace l’ancien bonus ; uniquement pour les trouvailles passives régulières.',
 pt:'Quantidade de componentes passivos por nível: {values}. Substitui o bônus anterior; aplica-se apenas a achados passivos regulares.',
 it:'Quantità di componenti passivi per livello: {values}. Sostituisce il bonus precedente; vale solo per ritrovamenti passivi regolari.',
 pl:'Liczba pasywnych komponentów według poziomu: {values}. Zastępuje poprzednią premię; dotyczy tylko zwykłych pasywnych znalezisk.',
}} satisfies Record<string,Record<Language,string>>;
export const prestigeV3DescriptionIds=Object.keys(descriptions);
export function prestigeV3Description(id:string,language:Language){
 if(!Object.hasOwn(descriptions,id))return null;
 const row=descriptions[id as keyof typeof descriptions],values=BALANCE.prestigeV3.axioms.C01.map(n=>'×'+new Intl.NumberFormat(language).format(n)).join(' / ');
 return row[language].replace('{values}',values);
}
