import {describe,expect,it} from 'vitest';
import {newGame} from './economy';
import {addSeasonXP,claimSeasonReward,rollSeason,seasonClaimable,seasonLevel,seasonProgress,SEASON_DAYS,SEASON_XP_PER_LEVEL} from './season';

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
