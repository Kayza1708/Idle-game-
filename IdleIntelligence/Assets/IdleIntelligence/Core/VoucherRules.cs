using System;
namespace IdleIntelligence.Core
{
  // The voucher wallet belongs to the LOCAL game. Never accept it as a Company trade asset.
  public static class VoucherRules
  {
    public static long Available(GameState s)=>s.Rewards.vouchersEarned-s.Rewards.vouchersSpent;
    public static bool CanEarn(GameState s)=>Available(s)<VoucherBalance.MaxOwned&&s.Rewards.vouchersEarned<9007199254740991L;
    public static int SeasonAward(int level,int track)=>(track==0&&level==VoucherBalance.SeasonFreeLevel||track==1&&level==VoucherBalance.SeasonPremiumLevel)?1:0;
    public static double ChestChance(string tier)=>tier=="common"?VoucherBalance.CommonChance:tier=="rare"?VoucherBalance.RareChance:tier=="epic"?VoucherBalance.EpicChance:tier=="legendary"?VoucherBalance.LegendaryChance:0;
  }
}
