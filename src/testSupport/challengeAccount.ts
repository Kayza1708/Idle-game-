import type {GameState} from '../economy';
/** Prepared historical account access for domain-isolation tests; no run resources are granted. */
export function withChallengeAccess(s:GameState):GameState{return {...s,prestigeCount:Math.max(1,s.prestigeCount),lifetime:{...s.lifetime,hardwareClasses:[...new Set([...s.lifetime.hardwareClasses,'sbc' as const])]}};}
