import {describe,expect,it} from 'vitest';
import {newGame} from './economy';
import {chooseAiName} from './story';
import {setPlayerName} from './profileName';
import {sanitizeDisplayNames,validateName,validatePlayerName} from './namePolicy';

describe('shared player and AI name policy',()=>{
 it.each(['Nova','Mira 7','Jörg','Zoë','François','Łukasz','Scunthorpe','Cassian','Class 7','Spice','Yoshito','東京','  Nova   7  '])('accepts legitimate names without substring false positives: %s',name=>expect(validatePlayerName(name).ok).toBe(true));
 it.each(['XxFUCKxX','BitchQueen','HitlerFan','Hurensohn','H_u_r_e_n_s_o_h_n','Arschloch123','Scheiße','Sch3iss3','FUCK','F_U_C_K','fuuck','fuckyou','bitch','N 4 z i','HÏTLER','n1gg3r','ＦＵＣＫ','аsshole','schwuch tel','Wichser','merde','cazzo','kurwa','pendejo','caralho','nazi\u200b'])('blocks common insults and normalized evasions: %s',name=>expect(validatePlayerName(name)).toEqual({ok:false,error:'blocked'}));
 it.each(['','x','__','--','Nova💎','Nova\u200b','<script>'])('rejects invalid or empty names: %s',name=>expect(validatePlayerName(name).ok).toBe(false));
 it('normalizes the stored representation and enforces per-field limits',()=>{
  expect(validatePlayerName('  Ｎｏｖａ   ７ ')).toEqual({ok:true,name:'Nova 7'});
  expect(validateName('A'.repeat(21),20).ok).toBe(false);expect(validatePlayerName('A'.repeat(24)).ok).toBe(true);expect(validatePlayerName('A'.repeat(25)).ok).toBe(false);
 });
 it('rejects forbidden changes at both action boundaries, retaining progress and the old name',()=>{
  const s=newGame(0);expect(setPlayerName(s,'Arschloch')).toBe(s);expect(chooseAiName(s,'fuck')).toBe(s);
  expect(setPlayerName(s,'  Nova 7  ').profile.playerName).toBe('Nova 7');expect(chooseAiName(s,'  AURA  ').aiName).toBe('AURA');
  expect(setPlayerName(s,undefined as unknown as string)).toBe(s);
 });
});

describe('multilingual family-friendly names v2',()=>{
 it.each([
  'Arschgeige','Huan','KackNoob','Dreckssack','Wichsa','hs0hn','f_d_p','n_t_m','stfu','douchebag',
  'hijueputa','malparido','Gilipollas','Chupapollas','cabrón','pendejooo',
  'enfoiré','niquetamere','putain','vaffanculo','stronzo','spierdalaj','arrombado',
  'मादरचोद','बहनचोद','चूतिया','गांडू','भोसड़ीके','BhenChod','bsdk','chutiya',
  'كسمك','شَرْمُوطَة','قحبة','كس امك','متناك','sharmouta',
  '傻逼','操你妈','草泥马','他媽的','王八蛋','sha bi',
  'Donald Trump','TrUmP2026','T_r_u_m_p','Put1n','D0naldTrumр','xXTrumpXx','Angela Merkel','Björn Höcke',
  'Xi Jinping','习近平','習近平','नरेंद्र मोदी','نتنياهو','Путин','Kim Jong Un',
  'WhitePower','Sieg Heil','Heil88','1488','kill yourself',
  'f\u200bu\u200bc\u200bk','sh1thead','h_u_r_e_n_s_o_h_n123','xxputaXX','puta123','merde_123',
 ])('rejects profanity, political identities and evasions: %s',name=>expect(validatePlayerName(name).ok).toBe(false));
 it.each(['Analyst','Essex','Sussex','Middlesex','Cassian','Classic','Scunthorpe','Yoshito','Trumpet','Nazia','Nazim','Mona','Regina','Rishi','Donald','May','Sun','Gay','Lesbian','Queer','Trans','Muslim','Christian','Jew','Deutsch','Black','White','Negro','नमस्ते','आरव','प्रिया','नवीन','نور','محمد','ليلى','小明','智能核心','光明','Nova123','Mira_7'])('keeps benign names and neutral identities: %s',name=>expect(validatePlayerName(name).ok).toBe(true));
});


describe('previously accepted names',()=>{
 it('rechecks historical names before display without discarding progress or mutating the source',()=>{
  const original={...newGame(0),aiName:'Trump',credits:12345,profile:{...newGame(0).profile,playerName:'मादरचोद'}};
  const clean=sanitizeDisplayNames(original);
  expect(clean.aiName).toBe('AURA');expect(clean.profile.playerName).toBe('Operator');
  expect(clean.credits).toBe(12345);expect(clean.inventory).toBe(original.inventory);expect(clean.progression).toBe(original.progression);
  expect(original.aiName).toBe('Trump');expect(original.profile.playerName).toBe('मादरचोद');
 });
 it('retains valid names and the unnamed onboarding state by identity',()=>{
  const original=newGame(0);expect(sanitizeDisplayNames(original)).toBe(original);
  const named={...original,aiName:'Nova',profile:{...original.profile,playerName:'نور'}};expect(sanitizeDisplayNames(named)).toBe(named);
 });
});
