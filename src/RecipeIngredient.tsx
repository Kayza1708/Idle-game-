import type {ReactNode} from 'react';
import {CostBadge} from './CostBadge';
/** Quantities and shortfall are supplied by the transaction quote, never booked here. */
export function RecipeIngredient({name,icon,balance,required,missing,de,onClick}:{name:string;icon:ReactNode;balance:number;required:number;missing:number;de:boolean;onClick:()=>void}){
 if(required===0)return null;
 return <li className="recipe-ingredient"><button className="ingredient-link" onClick={onClick} aria-label={name}><CostBadge name={name} icon={icon} balance={balance} required={required} missing={missing} de={de}/></button></li>;
}
