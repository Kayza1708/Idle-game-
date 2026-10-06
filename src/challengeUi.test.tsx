import {describe,expect,it} from 'vitest';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {readFileSync} from 'node:fs';
import {newGame} from './economy';
import {startRunChallenge} from './retention';
import {ChallengeRunPanel,challengeUi} from './ChallengeRunPanel';
import {GemShop} from './GemShopPanel';
import {MissionHub} from './MetaHub';

describe('challenge UI contract',()=>{
 it.each(['de','en'] as const)('renders the real rule, progress, reward and passive main notice in %s',language=>{
  const s=startRunChallenge({...newGame(0),settings:{...newGame(0).settings,language}},'no-taps');
  const html=renderToStaticMarkup(createElement(ChallengeRunPanel,{s,act:()=>{}}));
  expect(html).toContain(challengeUi(language).passive);expect(html).toContain(challengeUi(language).start);expect(html).toContain('0 / 1 INT');
  expect(html).toContain('★ 2');expect(html).toContain(challengeUi(language).abort);expect(html).toContain('disabled');
  expect(renderToStaticMarkup(createElement(MissionHub,{s,act:()=>{}}))).toContain(challengeUi(language).blocked);
  const shop=renderToStaticMarkup(createElement(GemShop,{s,act:()=>{}}));expect(shop).toContain(language==='de'?'Während einer Challenge deaktiviert':'Disabled during a challenge');
 });
 it('keeps abort confirmation and saves/return reporting in the application action path',()=>{
  const app=readFileSync('src/App.tsx','utf8');
  expect(app).toContain("name==='challenge-run-abort'&&ref.current.retention.activeRun&&!confirm(challengeUi(ref.current.settings.language).confirm)");
  expect(app).toContain("setReport({...next.challengeReturn.report,context:'challenge'})");expect(app).toContain("'challenge-run-start','challenge-run-abort','challenge-run-complete'");
  expect(app).toContain('changed:syncStory(before,changed)');
  expect(app).toContain('writable.current=durable?.recovered?false:durable?true:loaded.current.writable');
  expect(app).toContain('loaded.current={...loaded.current,recoveryRaw:durable.recoveryRaw,writable:false}');
 });
});
