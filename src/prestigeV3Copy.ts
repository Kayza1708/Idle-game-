import {itemSynthesisOutputV3} from './itemSystemV3';
import {BALANCE,type GameState,type ComponentId} from './economy';
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
},C06:{
 en:'Regular synthesis yield by level: {values}. Applies to unlocked materials only. Replaces the previous crafting speed bonus.',
 de:'Reguläre Syntheseausbeute je Stufe: {values}. Nur für freigeschaltete Materialien. Ersetzt den bisherigen Fertigungstempobonus.',
 es:'Rendimiento de síntesis regular por nivel: {values}. Solo para materiales desbloqueados. Sustituye la bonificación de velocidad de fabricación.',
 fr:'Rendement de synthèse régulier par niveau : {values}. Matériaux débloqués uniquement. Remplace le bonus de vitesse de fabrication.',
 pt:'Rendimento de síntese regular por nível: {values}. Apenas materiais desbloqueados. Substitui o bônus de velocidade de fabricação.',
 it:'Resa della sintesi regolare per livello: {values}. Solo materiali sbloccati. Sostituisce il bonus alla velocità di fabbricazione.',
 pl:'Wydajność zwykłej syntezy według poziomu: {values}. Tylko odblokowane materiały. Zastępuje premię do szybkości wytwarzania.',
},I05:{
 en:'Linear income bonus per earned INT: +{income} percentage points on top of the {base}% base. Spending INT keeps this bonus.',
 de:'Linearer Einkommensbonus pro verdientem INT: +{income} Prozentpunkte auf die Basis von {base} %. Ausgeben von INT verringert den Bonus nicht.',
 es:'Bonificación lineal de ingresos por INT ganado: +{income} puntos porcentuales sobre la base del {base} %. Gastar INT conserva el bono.',
 fr:'Bonus de revenu linéaire par INT gagné : +{income} points au-dessus de la base de {base} %. Dépenser des INT conserve le bonus.',
 pt:'Bônus linear de renda por INT ganho: +{income} pontos percentuais sobre a base de {base}%. Gastar INT mantém o bônus.',
 it:'Bonus lineare al reddito per INT guadagnato: +{income} punti percentuali oltre la base del {base}%. Spendere INT mantiene il bonus.',
 pl:'Liniowa premia do dochodu za zdobyte INT: +{income} punktów procentowych ponad bazowe {base}%. Wydanie INT nie zmniejsza premii.',
},I10:{
 en:'INT gain exponent +{gain}. Linear income bonus per earned INT: another +{income} percentage points. No income exponent or compounding.',
 de:'INT-Gewinnexponent +{gain}. Linearer Einkommensbonus pro verdientem INT: weitere +{income} Prozentpunkte. Kein Einkommensexponent oder Zinseszins.',
 es:'Exponente de ganancia de INT +{gain}. Ingresos lineales por INT ganado: otros +{income} puntos porcentuales, sin capitalización.',
 fr:'Exposant de gain d’INT +{gain}. Revenu linéaire par INT gagné : encore +{income} points, sans capitalisation.',
 pt:'Expoente de ganho de INT +{gain}. Renda linear por INT ganho: mais +{income} pontos percentuais, sem juros compostos.',
 it:'Esponente del guadagno INT +{gain}. Reddito lineare per INT guadagnato: altri +{income} punti percentuali, senza capitalizzazione.',
 pl:'Wykładnik zysku INT +{gain}. Liniowy dochód za zdobyte INT: kolejne +{income} punktów procentowych, bez procentu składanego.',
}} satisfies Record<string,Record<Language,string>>;
export const prestigeV3DescriptionIds=Object.keys(descriptions);
export function prestigeV3Description(id:string,language:Language){
 if(!Object.hasOwn(descriptions,id))return null;
 const row=descriptions[id as keyof typeof descriptions],values=id==='C01'||id==='C06'?BALANCE.prestigeV3.axioms[id].map(n=>'×'+new Intl.NumberFormat(language).format(n)).join(' / '):'';
 const fmt=new Intl.NumberFormat(language);return row[language].replace('{values}',values).replace('{income}',fmt.format((id==='I10'?BALANCE.prestigeV3.int.I10credits:BALANCE.prestigeV3.int.I05)*100)).replace('{base}',fmt.format(BALANCE.prestigeV3.int.creditPerINT*100)).replace('{gain}',fmt.format(BALANCE.prestigeV3.int.I10gain));
}

export const synthesisOutputCopy={
 en:'Next synthesis: +{amount} · yield ×{multiplier}',
 de:'Nächste Synthese: +{amount} · Ausbeute ×{multiplier}',
 es:'Próxima síntesis: +{amount} · rendimiento ×{multiplier}',
 fr:'Prochaine synthèse : +{amount} · rendement ×{multiplier}',
 pt:'Próxima síntese: +{amount} · rendimento ×{multiplier}',
 it:'Prossima sintesi: +{amount} · resa ×{multiplier}',
 pl:'Następna synteza: +{amount} · wydajność ×{multiplier}',
} satisfies Record<Language,string>;
export function synthesisOutputText(s:GameState,id:ComponentId,language:Language){const q=itemSynthesisOutputV3(s,id),fmt=new Intl.NumberFormat(language);return synthesisOutputCopy[language].replace('{amount}',fmt.format(q.amount)).replace('{multiplier}',fmt.format(q.multiplier));}

export const prestigeV3Names={C06:{en:'Industrial yield',de:'Industrielle Ausbeute',es:'Rendimiento industrial',fr:'Rendement industriel',pt:'Rendimento industrial',it:'Resa industriale',pl:'Wydajność przemysłowa'}} satisfies Record<string,Record<Language,string>>;
export function prestigeV3Name(id:string,language:Language){return Object.hasOwn(prestigeV3Names,id)?prestigeV3Names[id as keyof typeof prestigeV3Names][language]:null;}
