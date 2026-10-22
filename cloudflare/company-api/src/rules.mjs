// Pure company rules: personal Credits, INT, hardware and player levels do not affect RP.
export const MAX_MEMBERS = 50;
export const RP_PER_HOUR = 100;
export const CT_PER_HOUR = 10;
export const OFFLINE_HOUR_CAP = 24;
export const RESEARCH_NODES = Object.freeze(['computing','research','drops','infrastructure']);
export function claimAmount(now, last) {
  if (!Number.isSafeInteger(now) || !Number.isSafeInteger(last)) throw new TypeError('Invalid server timestamp');
  const hours = Math.min(OFFLINE_HOUR_CAP, Math.max(0, Math.floor((now-last)/3600)));
  return { hours, rp: hours*RP_PER_HOUR, tokens: hours*CT_PER_HOUR };
}
export function researchCost(nextLevel) {
  if (!Number.isInteger(nextLevel) || nextLevel<1 || nextLevel>10) throw new RangeError('Invalid research level');
  return 1000*nextLevel*nextLevel;
}
export function researchBonuses(levels) {
  const level = key => Math.min(10,Math.max(0,Number(levels[key]??0)||0));
  return {credits:1+level('computing')*0.02,research:1+level('research')*0.02,drops:1+level('drops')*0.02,companyRp:1+level('infrastructure')*0.02};
}
export function validCompanyId(value) {
  return typeof value==='string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}
export function validateCompanyInput(data) {
  const name = typeof data?.name==='string' ? data.name.trim().replace(/\s+/g,' ') : '';
  const tag = typeof data?.tag==='string' ? data.tag.trim().toUpperCase() : '';
  if (name.length<3 || name.length>32 || !/^[\p{L}\p{N}][\p{L}\p{N} _-]{2,31}$/u.test(name)) throw new RangeError('Invalid company name');
  if (!/^[A-Z0-9]{2,5}$/.test(tag)) throw new RangeError('Invalid company tag');
  return {name,tag};
}
