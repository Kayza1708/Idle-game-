import {describe,expect,it} from 'vitest';
import {newGame} from './economy';
import {chooseAiName} from './story';
import {setPlayerName} from './profileName';
import {validateName,validatePlayerName} from './namePolicy';

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
