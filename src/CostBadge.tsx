import type {ReactNode} from 'react';
import {ScientificNumber} from './scientificNumber';
import {formatScientific} from './economy';
export function CostBadge({name,icon,balance,required,missing,de=false}:{name:string;icon:ReactNode;balance:number|ScientificNumber;required:number|ScientificNumber;missing?:number;de?:boolean}){
 const sn=(value:number|ScientificNumber)=>typeof value==='number'?ScientificNumber.from(value):value;
 const valid=(value:number|ScientificNumber)=>typeof value!=='number'||Number.isFinite(value)&&value>=0;
 const ok=valid(balance)&&valid(required)&&(missing===undefined?sn(balance).compare(sn(required))>=0:Number.isFinite(missing)&&missing<=0);
 const fmt=(value:number|ScientificNumber)=>valid(value)?formatScientific(sn(value),1):(de?'Ungültig':'Invalid');
 const label=`${name}: ${fmt(balance)} / ${fmt(required)} · ${ok?(de?'ausreichend':'sufficient'):(de?'nicht ausreichend':'insufficient')}`;
 return <span className={`cost-badge ${ok?'sufficient':'insufficient'}`} title={label} aria-label={label}><span className="cost-icon" aria-hidden="true">{icon}</span><span className="cost-values">{fmt(balance)}<span className="cost-divider"> / </span>{fmt(required)}</span><span className="cost-state" aria-hidden="true">{ok?'✓':'!'}</span></span>;
}
