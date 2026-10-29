import {itemSynthesisOutputV3} from './itemSystemV3';
import {BALANCE,type GameState,type ComponentId} from './economy';
import {type Language} from './i18n';
/** Presentation only. All numerical values come from the same balance as the consumer. */
const descriptions={W03:{
 en:'New paid analyses: selected unlocked focus family ×{focus}. Rare minimum only from an unlocked family; no locked graphene. Start terms stay fixed.',
 de:'Neue bezahlte Analysen: gewählte freigeschaltete Fokusfamilie ×{focus}. Seltene Mindestkomponente nur aus freigeschalteter Familie; kein gesperrtes Graphen. Startvertrag bleibt fest.',
 es:'Nuevos análisis pagados: familia de enfoque elegida y desbloqueada ×{focus}. Mínimo raro solo de familias desbloqueadas. Condiciones fijadas al iniciar.',
 fr:'Nouvelles analyses payées : famille ciblée débloquée ×{focus}. Minimum rare uniquement dans une famille débloquée. Conditions fixées au départ.',
 pt:'Novas análises pagas: família de foco escolhida e liberada ×{focus}. Mínimo raro apenas de família liberada. Condições fixadas no início.',
 it:'Nuove analisi pagate: famiglia scelta e sbloccata ×{focus}. Minimo raro solo da famiglie sbloccate. Condizioni fissate alla partenza.',
 pl:'Nowe płatne analizy: wybrana odblokowana rodzina ×{focus}. Minimum rzadkie tylko z odblokowanej rodziny. Warunki ustalone przy starcie.',
},W04:{
 en:'New item level upgrades: material and data costs ×{upgrade}. Round each required input up. No discount on fusion, recipes or forging.',
 de:'Neue Item-Levelupgrades: Material- und Datenkosten ×{upgrade}. Jeden benötigten Input aufrunden. Kein Rabatt auf Fusion, Rezepte oder Schmiedestufen.',
 es:'Nuevas mejoras de nivel: materiales y datos ×{upgrade}. Cada insumo se redondea hacia arriba. Sin descuento en fusión, recetas ni forja.',
 fr:'Nouvelles améliorations de niveau : matériaux et données ×{upgrade}. Chaque coût est arrondi au supérieur. Aucun rabais sur fusion, recettes ou forge.',
 pt:'Novas melhorias de nível: materiais e dados ×{upgrade}. Arredondar cada custo para cima. Sem desconto em fusão, receitas ou forja.',
 it:'Nuovi aumenti di livello: materiali e dati ×{upgrade}. Ogni costo è arrotondato per eccesso. Nessuno sconto su fusione, ricette o forgiatura.',
 pl:'Nowe ulepszenia poziomu: materiały i dane ×{upgrade}. Każdy koszt zaokrąglany w górę. Bez zniżki na fuzję, receptury i kucie.',
},W07:{
 en:'Instant crafting in batches {batches}. Full price and result count shown before purchase. All items or no payment; one shared result, no queue.',
 de:'Sofortige Herstellung in Mengen {batches}. Gesamtpreis und Ergebnisanzahl vor Kauf. Alle Items oder keine Zahlung; gemeinsames Ergebnis, keine Warteschlange.',
 es:'Fabricación instantánea por lotes {batches}. Precio total y cantidad antes de comprar. Todo o ningún pago; resultado conjunto, sin cola.',
 fr:'Fabrication instantanée par lots {batches}. Prix total et quantité avant achat. Tous les objets ou aucun paiement ; résultat commun, sans file.',
 pt:'Fabricação instantânea em lotes {batches}. Preço total e quantidade antes da compra. Todos os itens ou nenhum pagamento; resultado conjunto, sem fila.',
 it:'Creazione istantanea in lotti {batches}. Prezzo totale e quantità prima dell’acquisto. Tutti gli oggetti o nessun pagamento; risultato unico, senza coda.',
 pl:'Natychmiastowe wytwarzanie partiami {batches}. Pełna cena i liczba przed zakupem. Wszystkie przedmioty albo brak płatności; wspólny wynik, bez kolejki.',
},C01:{
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
},W08:{
 en:'Components from paid analyses and regular paid hardware milestones ×{yield}. Replaces crafting speed; no shop or recovery bonus.',
 de:'Komponenten aus bezahlten Analysen und regulären bezahlten Hardware-Meilensteinen ×{yield}. Ersetzt Fertigungstempo; kein Shop- oder Rückgewinnungsbonus.',
 es:'Componentes de análisis pagados e hitos de hardware regulares pagados ×{yield}. Sustituye la velocidad de fabricación; sin bono de tienda ni recuperación.',
 fr:'Composants des analyses payées et des paliers de matériel réguliers payés ×{yield}. Remplace la vitesse de fabrication ; aucun bonus de boutique ou récupération.',
 pt:'Componentes de análises pagas e marcos regulares de hardware pagos ×{yield}. Substitui a velocidade de fabricação; sem bônus de loja ou recuperação.',
 it:'Componenti da analisi pagate e traguardi hardware regolari pagati ×{yield}. Sostituisce la velocità di fabbricazione; nessun bonus a negozio o recupero.',
 pl:'Komponenty z płatnych analiz i zwykłych opłaconych progów sprzętu ×{yield}. Zastępuje szybkość wytwarzania; bez premii do sklepu i odzysku.',
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
 const fmt=new Intl.NumberFormat(language);return row[language].replace('{batches}',BALANCE.prestigeV3.items.W07quantities.map(n=>'×'+fmt.format(n)).join(' / ')).replace('{upgrade}',fmt.format(BALANCE.prestigeV3.items.W04)).replace('{focus}',fmt.format(BALANCE.prestigeV3.items.W03focus)).replace('{yield}',fmt.format(BALANCE.prestigeV3.items.W08)).replace('{values}',values).replace('{income}',fmt.format((id==='I10'?BALANCE.prestigeV3.int.I10credits:BALANCE.prestigeV3.int.I05)*100)).replace('{base}',fmt.format(BALANCE.prestigeV3.int.creditPerINT*100)).replace('{gain}',fmt.format(BALANCE.prestigeV3.int.I10gain));
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

export const prestigeV3Names={W08:{en:'Workshop network',de:'Werkstattverbund',es:'Red de talleres',fr:'Réseau d’ateliers',pt:'Rede de oficinas',it:'Rete di officine',pl:'Sieć warsztatów'},C06:{en:'Industrial yield',de:'Industrielle Ausbeute',es:'Rendimiento industrial',fr:'Rendement industriel',pt:'Rendimento industrial',it:'Resa industriale',pl:'Wydajność przemysłowa'}} satisfies Record<string,Record<Language,string>>;
export function prestigeV3Name(id:string,language:Language){return Object.hasOwn(prestigeV3Names,id)?prestigeV3Names[id as keyof typeof prestigeV3Names][language]:null;}

export const analysisYieldLabels={en:'Yield fixed at start',de:'Ausbeute beim Start',es:'Rendimiento fijado al iniciar',fr:'Rendement fixé au départ',pt:'Rendimento fixado no início',it:'Resa fissata all’avvio',pl:'Wydajność ustalona na starcie'} satisfies Record<Language,string>;

export const analysisFamilyCopy={
 de:['Basis','Halbleiter','Photonik','Frontier','Quanten'],en:['Basic','Semiconductor','Photonic','Frontier','Quantum'],es:['Básicos','Semiconductores','Fotónica','Frontera','Cuántica'],fr:['Base','Semi-conducteurs','Photonique','Frontière','Quantique'],pt:['Básicos','Semicondutores','Fotônica','Fronteira','Quântica'],it:['Base','Semiconduttori','Fotonica','Frontiera','Quantistica'],pl:['Podstawowe','Półprzewodniki','Fotonika','Granica','Kwantowe'],
} satisfies Record<Language,string[]>;
export const analysisBaseCopy={de:'Grundmenge',en:'Base draws',es:'Cantidad base',fr:'Quantité de base',pt:'Quantidade base',it:'Quantità base',pl:'Ilość bazowa'} satisfies Record<Language,string>;
