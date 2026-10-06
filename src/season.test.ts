import {describe,expect,it} from 'vitest';
import {newGame} from './economy';
import {addSeasonXP,claimSeasonReward,rollSeason,seasonClaimable,seasonLevel,seasonProgress,seasonRewardTiers,SEASON_DAYS,SEASON_LEVELS,SEASON_XP_PER_LEVEL} from './season';
import {restore,serialize} from './storage';

describe('30 day season',()=>{
  it('reports level progress and a claimable reward consistently',()=>{
    let state=newGame(0);
    state=addSeasonXP(state,SEASON_XP_PER_LEVEL+250,'test');
    expect(seasonLevel(state)).toBe(1);
    expect(seasonProgress(state)).toBe(.25);
    expect(seasonClaimable(state)).toBe(true);
    state=claimSeasonReward(state,1);
    expect(seasonClaimable(state)).toBe(false);
  });

  it('levels, claims gems/components and keeps rewards once',()=>{
    let state=newGame(0);
    state=addSeasonXP(state,5000,'test');
    expect(seasonLevel(state)).toBe(5);
    const before=state.gems;
    state=claimSeasonReward(state,5);
    expect(state.gems).toBeGreaterThan(before);
    expect(state.season.claimed).toContain(5);
    const gems=state.gems;
    expect(claimSeasonReward(state,5).gems).toBe(gems);
  });

  it('keeps locked rewards unclaimed',()=>{
    const state=newGame(0);
    const attempted=claimSeasonReward(state,1);
    expect(attempted.season.claimed).toEqual([]);
    expect(attempted.gems).toBe(state.gems);
  });

  it('rolls after 30 days and archives a completed season',()=>{
    let state=newGame(0);
    state=addSeasonXP(state,50000,'test');
    state=rollSeason(state,SEASON_DAYS*86400000+1);
    expect(state.season.id).toBe('season-02');
    expect(state.season.xp).toBe(0);
    expect(state.profile.completedSeasons).toContain('season-01');
  });
});

describe('free and premium reward curve',()=>{
  const score=(reward:(typeof seasonRewardTiers)[number]['free'])=>(reward.gems??0)+(reward.amount??0)*10+(reward.artifact?1000:0);
  it('defines every level once with meaningfully distinct tracks',()=>{expect(seasonRewardTiers).toHaveLength(SEASON_LEVELS);expect(seasonRewardTiers.map(tier=>tier.level)).toEqual(Array.from({length:SEASON_LEVELS},(_,i)=>i+1));for(const tier of seasonRewardTiers)expect(tier.premium).not.toEqual(tier.free);});
  it('makes each five-level milestone stronger than its preceding regular level',()=>{for(const level of [5,10,15,20,25,30,35,40,45,50]){const milestone=seasonRewardTiers[level-1],previous=seasonRewardTiers[level-2];expect(milestone.milestone).toBe(true);expect(score(milestone.free)).toBeGreaterThan(score(previous.free));expect(score(milestone.premium)).toBeGreaterThan(score(previous.premium));}});
  it('gives level 30 a major reward and level 50 the existing season artifact finale',()=>{const level30=seasonRewardTiers[29],finale=seasonRewardTiers[49];expect(level30.free.gems).toBeGreaterThanOrEqual(100);expect(level30.premium.gems).toBeGreaterThan(level30.free.gems!);expect(finale.free.artifact).toBe('boot-sequence-core');expect(finale.premium.artifact).toBe('boot-sequence-core');});
  it('keeps free claims and save reload compatibility unchanged',()=>{let state=addSeasonXP(newGame(0),SEASON_XP_PER_LEVEL,'test');state=claimSeasonReward(state,1);const loaded=restore(serialize(state),state.savedAt).state;expect(loaded.season.claimed).toEqual([1]);expect(claimSeasonReward(loaded,1)).toEqual(loaded);});
});

describe('season archive grace period',()=>{
  it('keeps one previous season claimable for seven days and grants it once',()=>{
    let state=addSeasonXP(newGame(0),2000,'test');
    state=rollSeason(state,SEASON_DAYS*86400000+1);
    expect(state.previousSeason?.id).toBe('season-01');
    state=claimSeasonReward(state,1,'season-01');
    const gems=state.gems;
    expect(claimSeasonReward(state,1,'season-01').gems).toBe(gems);
  });
  it('expires the archive and never retains more than one previous season',()=>{
    let state=addSeasonXP(newGame(0),1000,'test');
    state=rollSeason(state,(SEASON_DAYS+8)*86400000);
    expect(state.previousSeason).toBeNull();
    const again=rollSeason(state,SEASON_DAYS*3*86400000);
    expect(again.previousSeason===null||again.previousSeason.id!==state.season.id).toBe(true);
  });
});
