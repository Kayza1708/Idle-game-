import {describe,it,expect,vi} from 'vitest';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {newGame} from './economy';
import {emptyReport} from './simulation';
import {ReturnReport} from './ReturnReport';
vi.mock('react-dom',()=>({createPortal:(node:unknown)=>node}));
describe('return report actual accounting presentation',()=>{
 it('separates gross generated income, current spendable stock and actual autobuyer units without paying again',()=>{vi.stubGlobal('document',{body:{}});try{const state=newGame(0),before=JSON.stringify(state),report={...emptyReport(),seconds:60,elapsedSeconds:120,lostSeconds:60,exactCredits:{m:1,e:2},exactData:{m:2,e:2},hardware:5};const html=renderToStaticMarkup(createElement(ReturnReport,{state,report,onClose:()=>{},onRewards:()=>{},onInventory:()=>{}}));expect(html).toContain('Erzeugt vor automatischen Ausgaben');expect(html).toContain('+100');expect(html).toContain('+200');expect(html).toContain('Jetzt verfügbar');expect(html).toContain('Credits: 50');expect(html).toContain('Automatisch gekaufte Hardware');expect(html).toContain('<b>5</b>');expect(JSON.stringify(state)).toBe(before)}finally{vi.unstubAllGlobals()}});
 it('renders only available navigation and keeps rewards separate from navigation suggestions',()=>{vi.stubGlobal('document',{body:{}});try{const s=newGame(0),state={...s,prestigeCount:1,nodes:['trainingPlan']},html=renderToStaticMarkup(createElement(ReturnReport,{state,report:emptyReport(),onClose:()=>{},onRewards:()=>{},onInventory:()=>{},onAction:()=>{}}));expect(html).toContain('Leeren Trainingsplan füllen');expect(html).toContain('Diese Übersicht startet keine Jobs');expect(html).not.toContain('Bonuskisten öffnen')}finally{vi.unstubAllGlobals()}});
});
