using System;
using IdleIntelligence.Core;
internal static class V3RewardedAdChecks {
 static void Check(bool good,string message){if(!good)throw new Exception("V3 ADS: "+message);}
 public static void Run(){
  var s=Game.NewV3(1000,"ads-regression");
  long initial=s.Retention.gems;
  Check(AdRewards.Quote(s,"gems").Allowed,"daily quote available");
  var pending=AdRewards.Begin(s,"gems","tx-failed");
  Check(pending.Ads.hasPending,"pending receipt created");
  var failure=AdRewards.Complete(pending,"tx-failed","error");
  Check(!failure.Ads.hasPending&&failure.Retention.gems==initial&&failure.Ads.counts[0]==0,"SDK failure never grants");
  Check(AdRewards.Complete(failure,"tx-failed","success").Retention.gems==initial,"late invalid reward rejected");
  pending=AdRewards.Begin(failure,"gems","tx-earned");
  var granted=AdRewards.Complete(pending,"tx-earned","success");
  Check(granted.Retention.gems>initial&&granted.Ads.counts[0]==1,"earned video pays once");
  Check(AdRewards.Complete(granted,"tx-earned","success").Retention.gems==granted.Retention.gems,"replay rejected");
  var loaded=StateData.From(granted).ToState();
  Check(loaded.Retention.gems==granted.Retention.gems&&loaded.Ads.counts[0]==1,"reward survives native save");
  Check(AdRewards.Complete(loaded,"unrelated","success").Retention.gems==granted.Retention.gems,"stray callback rejected");
  Console.WriteLine("UNITY V3 AD TICKET AND FAIL-CLOSED CONTRACT OK");
 }
}
