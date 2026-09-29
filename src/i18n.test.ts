import {describe,expect,it} from 'vitest';
import {formatLocalized,languages,t} from './i18n';
describe('localization foundation',()=>{it('ships the seven launch languages with English fallback keys',()=>{expect(languages).toEqual(['en','de','es','fr','pt','it','pl']);for(const language of languages)expect(t(language,'profile')).toBeTruthy();});it('supports localized, scientific and engineering number formats',()=>{expect(formatLocalized(1234,'de','auto')).toContain('1.234');expect(formatLocalized(1.2e15,'en','scientific')).toContain('e+15');expect(formatLocalized(1.2e18,'en','engineering')).toContain('e18');});});

describe('translation interpolation',()=>{
  it('keeps existing translations working without parameters',()=>{
    expect(t('de','profile')).toBe('Profil');
    expect(t('es','profile')).toBe('Perfil');
  });

  it('accepts translation parameters without breaking fallback behavior',()=>{
    expect(t('fr','profile',{})).toBe('Profil');
    expect(t('es','playerProfile',{})).toBe('Player Profile');
  });
});
