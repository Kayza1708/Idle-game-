import type {ReactNode} from 'react';
import {formatScientific} from './economy';
import {ScientificNumber} from './scientificNumber';

/** Presentation only: quantities come from the shared transaction quote. */
export function RecipeIngredient({name,icon,balance,required,missing,de,onClick}:{name:string;icon:ReactNode;balance:number;required:number;missing:number;de:boolean;onClick:()=>void}){
 const amount=(value:number)=>Number.isFinite(value)?formatScientific(ScientificNumber.from(value),1):(de?'Ungültig':'Invalid');
 return <li className="recipe-ingredient"><button className="ingredient-link" onClick={onClick}>
  <span className="ingredient-icon">{icon}</span>
  <span className="ingredient-copy">
   <strong className="ingredient-name">{name}</strong>
   <span className="ingredient-amounts">
    <span>{de?'Bestand':'Stock'}: {amount(balance)}</span>
    <span>{de?'Bedarf':'Required'}: {amount(required)}</span>
    <span>{de?'Fehlt':'Missing'}: {amount(missing)}</span>
   </span>
  </span>
 </button></li>;
}
