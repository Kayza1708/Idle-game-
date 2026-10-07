import {describe,it,expect} from 'vitest';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {RecipeIngredient} from './RecipeIngredient';
import {ComponentArt,ActivityArt} from './GameArt';
import {newGame} from './economy';
import {craftingAffordability} from './inventory';
import {componentText,moduleText} from './gameplayI18n';

describe('recipe ingredient presentation',()=>{
 it.each(['de','en'] as const)('shows full component name and separate quoted quantities in %s',language=>{
  const s=newGame(0),q=craftingAffordability(s,'item','quantum-chip'),id='photonicLenses',name=componentText(id,language).name;
  const html=renderToStaticMarkup(createElement(RecipeIngredient,{name,icon:createElement(ComponentArt,{id}),balance:s.componentInventory[id],required:q.recipe!.ingredients.components[id]!,missing:q.missingComponents[id]!,de:language==='de',onClick:()=>{}}));
  expect(html).toContain(`class="ingredient-name">${name}</strong>`);expect(html).toContain('component-art');
  expect(html).toContain(`${language==='de'?'Bestand':'Stock'}: 0`);expect(html).toContain(`${language==='de'?'Bedarf':'Required'}: 2`);expect(html).toContain(`${language==='de'?'Fehlt':'Missing'}: 2`);
  expect(html).not.toContain('blueprint');expect(html).not.toContain('Bauplan');
 });
 it.each(['de','en'] as const)('uses the existing workbench illustration for a module ingredient in %s',language=>{
  const s=newGame(0),q=craftingAffordability(s,'item','field-scanner'),id='dataLattice';
  const html=renderToStaticMarkup(createElement(RecipeIngredient,{name:moduleText(id,language),icon:createElement(ActivityArt,{id:'workbench'}),balance:s.modules[id],required:q.recipe!.ingredients.modules[id]!,missing:q.missingModules[id]!,de:language==='de',onClick:()=>{}}));
  expect(html).toContain(moduleText(id,language));expect(html).toContain('activity-art');expect(html).toContain(`${language==='de'?'Bedarf':'Required'}: 1`);
 });
 it('retains a long name and scientific quantities as separate text, without changing its quote input',()=>{
  const name='ExtremelyLongUnbrokenIngredientNameForResponsiveLayoutAndScientificQuantities',input={name,icon:createElement(ComponentArt,{id:'circuits'}),balance:1e300,required:1e308,missing:1e308,de:false,onClick:()=>{}},before={...input};
  const html=renderToStaticMarkup(createElement(RecipeIngredient,input));expect(html).toContain(name);expect(html).toContain('e+300');expect(html).toContain('e+308');expect(html).not.toMatch(/NaN|Infinity|…/);expect(input).toEqual(before);
 });
 it('labels invalid display quantities without inventing a zero cost',()=>{
  const html=renderToStaticMarkup(createElement(RecipeIngredient,{name:'Circuits',icon:createElement(ComponentArt,{id:'circuits'}),balance:NaN,required:Infinity,missing:Infinity,de:false,onClick:()=>{}}));expect(html).toContain('Stock: Invalid');expect(html).toContain('Required: Invalid');expect(html).not.toContain('Required: 0');
 });
});
