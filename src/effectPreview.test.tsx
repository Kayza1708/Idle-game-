import {newGame} from './legacyContractFixture';
import {describe,it,expect} from 'vitest';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {buyHardwareClass,addCredits,addData,addDataScientific,addCreditsScientific,type GameState} from './economy';
import {ScientificNumber} from './scientificNumber';
import {EffectPreview,effectPreviewRows} from './EffectPreview';
import {ResourceBar,compactHeaderValue,Prestige} from './Panels';
import {TutorialFocus} from './TutorialFocus';
const ready=()=>buyHardwareClass(addData(addCredits(newGame(0),1e12),10000),'calculator',25);
describe('concrete existing effect previews',()=>{
 it('shows the real multi-resource gain of the next Compute node without mutating ownership',()=>{
  const before:GameState={...ready(),nodes:['computeNet1'],discovered:['calculator','sbc','pc']},after:GameState={...before,nodes:['computeNet1','computeNet2']};
  const rows=effectPreviewRows(before,after);expect(rows.map(r=>r.id)).toEqual(expect.arrayContaining(['compute','credits','data','users']));for(const row of rows)expect(row.after.compare(row.before)).toBeGreaterThan(0);expect(before.nodes).toEqual(['computeNet1']);
 });
 it('does not show identical rows and shows negative changes with a signed percentage',()=>{const s=ready();expect(renderToStaticMarkup(createElement(EffectPreview,{before:s,after:s}))).toBe('');const html=renderToStaticMarkup(createElement(EffectPreview,{before:{...s,nodes:['computeNet1']},after:s}));expect(html).toContain('class="negative"');expect(html).toContain('−');expect(html).not.toContain('−0%');});
 it('uses the scientific balance in tiny resource cells beyond Number range',()=>{
  const s=addDataScientific(addCreditsScientific(newGame(0),ScientificNumber.fromString('1e450'),false),ScientificNumber.fromString('1e600'));
  const html=renderToStaticMarkup(createElement(ResourceBar,{s,onMenu:()=>{},hasNotice:false}));expect(html).toContain('1.0e+450');expect(html).toContain('1.0e+600');expect(compactHeaderValue(1e12,'de','auto')).toContain('Bio.');
 });
 it('hides the unreached Axiom tab and uses a transparent Mira stage with a target action',()=>{const s=ready();expect(renderToStaticMarkup(createElement(Prestige,{s,act:()=>{}}))).not.toContain('Axiome');const guide={...s,story:{...s.story,tutorial:'active' as const,target:'training' as const,open:null}};const html=renderToStaticMarkup(createElement(TutorialFocus,{state:guide,onShow:()=>{},onSkip:()=>{}}));expect(html).toContain('mira-character');expect(html).toContain('mira-speech');expect(html).toContain('mira-cue');});
});
