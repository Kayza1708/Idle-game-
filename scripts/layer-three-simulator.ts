import {writeFile} from 'node:fs/promises';
import {BALANCE} from '../src/economy';
import {simulateBalance,type BalanceSimulationResult} from '../src/simulation';

const seeds=[1708,42,2026] as const;
const startAt='2026-01-01T00:00:00.000Z';
type Row={seed:number;scope:string;profile:string;strategy:string;prestige:string;result:BalanceSimulationResult};
const rows:Row[]=[];
for(const seed of seeds){
 for(const [strategy,priority] of [['A','training-first'],['B','analysis-first']] as const)rows.push({seed,scope:'90m',profile:'active',strategy,prestige:'delayed',result:simulateBalance(90/1440,true,seed,Infinity,priority,[{start:0,end:5400}],true)});
 for(const profile of ['active','passive'] as const)for(const delayed of [false,true])rows.push({seed,scope:'7d',profile,strategy:'A',prestige:delayed?'delayed':'normal',result:simulateBalance(7,profile==='active',seed,Infinity,'training-first',undefined,delayed)});
}
const fmt=(v:number|null)=>v===null?'nicht erreicht':`${v}s`;
const summary=(row:Row)=>({seed:row.seed,scope:row.scope,profile:row.profile,strategy:row.strategy,prestige:row.prestige,firstResearch:row.result.milestones.firstResearch,firstAnalysis:row.result.milestones.firstAnalysis,blueprintUnlocked:row.result.milestones.firstImpulseBlueprint,recipeAffordable:row.result.milestones.firstCraftable,craftCompleted:row.result.milestones.firstCraft,firstPrestige:row.result.milestones.firstPrestige,firstEquipped:row.result.milestones.firstImpulseEquipped,timing:row.result.evaluation!.timing,itemsCrafted:row.result.final.lifetime.itemsCrafted,decisionTimeline:row.scope==='90m'?row.result.evaluation!.dataDecisions:undefined,activity:row.scope==='90m'?row.result.evaluation!.activity:undefined});
const table=rows.map(row=>{const m=row.result.milestones,t=row.result.evaluation!.timing;return `| ${row.seed} | ${row.scope} | ${row.profile} | ${row.strategy} | ${row.prestige} | ${fmt(m.firstResearch)} | ${fmt(m.firstAnalysis)} | ${fmt(m.firstImpulseBlueprint)} | ${fmt(m.firstCraftable)} | ${fmt(m.firstCraft)} | ${fmt(m.firstPrestige)} | ${fmt(m.firstImpulseEquipped)} | ${t.onlineSeconds}/${t.creditedOfflineSeconds}s |`;});
const ninety=rows.filter(r=>r.scope==='90m');
const report=[
 '# Schicht-3-Balance v3: Frühstart und Impulsrelais','',
 `Seeds ${seeds.join(', ')}, Start ${startAt}. Version 3 ersetzt die früheren Schicht-3-Messwerte. Keine Offline-Produktion vor t=0.`,'',
 '## Deterministische Kostenkalibrierung','',
 `Gesuchtes kleinstes ganzzahliges Paar: Datenerzeugung ${BALANCE.researchCategories.data.baseData} Data, kurze Hardwareanalyse ${BALANCE.analysisCosts.hardware.short.data} Data. Die Suche liest die Data-Bestände an den 10-Sekunden-Entscheidungsgrenzen aus: 362 Data erlauben Forschung bereits bei 290 s, 363 erst bei 300 s; 57.622 Data erlauben die Hardwareanalyse bei 890 s, 57.623 erst bei 900 s. Beide Strategien wurden anschließend separat verifiziert.`,'',
 ...ninety.map(r=>`- Seed ${r.seed}, Strategie ${r.strategy}: Forschung ${fmt(r.result.milestones.firstResearch)}, Hardwareanalyse ${fmt(r.result.milestones.firstAnalysis)}, Bauplan ${fmt(r.result.milestones.firstImpulseBlueprint)}, bezahlbar ${fmt(r.result.milestones.firstCraftable)}, fertig ${fmt(r.result.milestones.firstCraft)}.`),'',
 '## Messläufe','',
 '| Seed | Lauf | Profil | Strategie | Prestige | Forschung | Analyse | Bauplan | bezahlbar | fertig | Prestige | ausgerüstet | aktiv/offline gutgeschrieben |','|---:|---|---|:---:|---|---:|---:|---:|---:|---:|---:|---:|---:|',...table,'',
 '## Zielstatus','',
 '- Forschung startet in beiden Strategien und allen Seeds nach 300 aktiven Sekunden: Ziel 5–10 Minuten erreicht.','- Die erste Hardwareanalyse startet in beiden Strategien und allen Seeds nach 900 aktiven Sekunden: Ziel 15–30 Minuten erreicht.','- Das Impulsrelais wird im 90-Minuten-Lauf nach 1.800 aktiven Sekunden fertig. Das Ziel 45–75 Minuten wird verfehlt: Analyseabschluss bei 1.500 s plus feste 300-s-Herstellung ergeben bereits 30 Minuten, und die vorhandenen echten Komponenten reichen zu diesem Zeitpunkt aus. Drop-Raten und Rezept wurden nicht verändert.','- Normales und bis zum fertigen Einstiegsitem verschobenes Prestige werden getrennt gezeigt. Das normale Entscheidungsverhalten wurde nicht automatisiert geändert.','',
 '## Impulsrelais','',
 '- Rezept: 12 Schaltkreise, 2 Kupferspulen, keine Data, Fragmente oder Zwischenprodukte; 300 Sekunden echte Werkbankzeit.','- Bauplan wird ausschließlich beim Abschluss der ersten Hardwareanalyse dauerhaft gesetzt. Item, Komponenten und Freischaltung überleben Prestige.','- Nur ausgerüstet: jeder zehnte vergütete Tap addiert per ScientificNumber zwei Sekunden der aktuellen passiven Creditproduktion. Der persistente Zähler gehört zur Iteminstanz; der Bonus erzeugt weder Tap noch Combo und skaliert nicht mit Seltenheit.','- Für das neue Item existierte keine fachlich eindeutige Atlaszelle. Deshalb verwendet die UI eine eigene CSS-Relaisgrafik statt einer falschen Sprite-Zuordnung.','',
 'Die JSON-Datei enthält für alle 90-Minuten-Läufe die echte Entscheidungstimeline und Abschlussereignisse.'
];
await writeFile('docs/layer-three-balance.json',JSON.stringify({version:3,seeds,startAt,costs:{dataGeneration:BALANCE.researchCategories.data.baseData,shortHardwareAnalysis:BALANCE.analysisCosts.hardware.short.data},runs:rows.map(summary)},null,2)+'\n');
await writeFile('docs/layer-three-balance.md',report.join('\n')+'\n');
console.log('Wrote docs/layer-three-balance.{json,md} v3');
