using System;
using System.Linq;
namespace IdleIntelligence.Core
{
 [Serializable]public sealed class LootSignal
 {public string id;public double spawnedAt,expiresAt,rewardFactor,x,y;public bool hasRewardFactor;public int variant;public LootSignal Copy()=>(LootSignal)MemberwiseClone();}
 [Serializable]public sealed class SignalState
 {public int schema=1;public bool initialized;public double progress;public LootSignal[] visible=Array.Empty<LootSignal>();public static SignalState New()=>new SignalState{initialized=true};public SignalState Copy(){var s=(SignalState)MemberwiseClone();s.visible=visible.Select(d=>d.Copy()).ToArray();return s;}}
 public static class Signals
 {
  public static double Quality(GameState s)=>Math.Max(SignalBalance.QualityFloor,(1+Game.Level(s,"dropProtocols")*SignalBalance.ResearchEffect)*(1+Workshop.Bonus(s,"drop"))*(1+SignalBalance.LegacyNodes.Select((id,n)=>PrestigeRules.Has(s,id)?SignalBalance.NodeBonuses[n]:0).Sum()));
  public static double Interval(GameState s)=>Math.Max(SignalBalance.Minimum,SignalBalance.Seconds/Quality(s));
  public static double RewardFactor(GameState s)=>Interval(s)/Math.Max(SignalBalance.PreviousMinimum,SignalBalance.PreviousSeconds/Quality(s));
  public static void Spawn(GameState s,double seconds)
  {
   double interval=Interval(s),progress=s.Signals.progress+seconds,spawn=Math.Floor((progress+1e-9)/interval);s.Signals.progress=Math.Max(0,progress-spawn*interval);s.Signals.visible=s.Signals.visible.Where(d=>d.expiresAt>s.SavedAt).ToArray();
   for(int n=0;n<spawn&&s.Signals.visible.Length<SignalBalance.MaximumVisible;n++){long seed=s.Workshop.nextId++;s.Signals.visible=s.Signals.visible.Concat(new[]{new LootSignal{id="drop-"+seed,spawnedAt=s.SavedAt,expiresAt=s.SavedAt+SignalBalance.VisibleSeconds*1000,hasRewardFactor=true,rewardFactor=RewardFactor(s),x=SignalBalance.XBase+(seed*SignalBalance.XSeed)%SignalBalance.XRange,y=SignalBalance.YBase+(seed*SignalBalance.YSeed)%SignalBalance.YRange,variant=seed%SignalBalance.CoreModulo==0?2:seed%SignalBalance.CacheModulo==0?1:0}}).ToArray();}
  }
  public static GameState Claim(GameState state,string id,Func<double> rng)
  {
   if(ChallengeRules.Is(state,"no-taps"))return state;var drop=state.Signals.visible.FirstOrDefault(d=>d.id==id);if(drop==null)return state;var s=state.Copy();s.Signals.visible=s.Signals.visible.Where(d=>d.id!=id).ToArray();if(drop.expiresAt<s.SavedAt)return s;
   Func<double> random=()=>{double value=rng();if(!ScientificNumber.Finite(value)||value<0||value>=1)throw new ArgumentOutOfRangeException(nameof(rng));return value;};double factor=drop.hasRewardFactor?drop.rewardFactor:1,quality=Quality(s);int variant=drop.variant;var table=ItemBalance.MaterialFamilies.SelectMany((ids,f)=>MaterialAnalysis.Access(s,f)?ids:Array.Empty<string>()).ToArray();if(table.Length==0)return state;var weights=table.Select(c=>Math.Pow(Math.Max(1,quality)*SignalBalance.QualityBoost[variant],SignalBalance.QualityPowers[Array.IndexOf(ItemBalance.ComponentIds,c)])).ToArray();var found=new long[ItemBalance.ComponentIds.Length];
   for(int n=0;n<SignalBalance.Draws[variant];n++){double roll=random()*weights.Sum();int pick=weights.Length-1;for(int c=0;c<weights.Length;c++){roll-=weights[c];if(roll<=0){pick=c;break;}}double quantity=SignalBalance.PerDraw[variant]*factor,whole=Math.Floor(quantity),fraction=quantity-whole;found[Array.IndexOf(ItemBalance.ComponentIds,table[pick])]+=(long)whole+(fraction>0&&random()<fraction?1:0);}
   for(int c=0;c<found.Length;c++){s.Workshop.components[c]+=found[c];Lifetime.Components(s,c,found[c]);}s.Lifetime.dropsClaimed++;PrestigeRules.Earn(s,Game.Income(s,false).Times(SignalBalance.CreditSeconds[variant]*factor));if(SignalBalance.DataSeconds[variant]>0)s.Data=s.Data.Add(Game.DataRate(s).Times(SignalBalance.DataSeconds[variant]*factor));
   if(variant==2&&!ChallengeRules.Is(s,"closed-supply-chain")){double chance=Math.Min(1,factor*Math.Min(SignalBalance.ItemCap,SignalBalance.ItemBase+SignalBalance.ItemPer*Math.Max(0,quality-1)));if(random()<chance){var pool=SeasonBalance.PoolTypes.Where(t=>t!="impulse-relay"&&t!="insight-archive").ToArray();s=RetentionRules.CreateItem(s,pool[(int)Math.Floor(random()*pool.Length)%pool.Length],0);}}
   if(random()<MissionBalance.BlueprintChance){string blueprint=BonusBoxes.Blueprint(s);if(blueprint=="fragment")s.Workshop.fragments++;else s.Workshop.knownBlueprints[Workshop.Index(blueprint)]=true;}s.Workshop.revision++;LocalJournal.Record(s,"component-found",permanent:false);return s;
  }
  public static void Validate(GameState s)
  {var d=s.Signals;if(d==null||!d.initialized||d.schema!=1||!ScientificNumber.Finite(d.progress)||d.progress<0||d.visible==null||d.visible.Length>SignalBalance.MaximumVisible||d.visible.Select(v=>v?.id).Distinct().Count()!=d.visible.Length)throw new FormatException("Invalid active signal state");foreach(var v in d.visible)if(v==null||string.IsNullOrEmpty(v.id)||v.id.Length>160||!ScientificNumber.Finite(v.spawnedAt)||v.spawnedAt<0||v.spawnedAt>8.64e15||!ScientificNumber.Finite(v.expiresAt)||v.expiresAt<v.spawnedAt||v.expiresAt>8.64e15||v.hasRewardFactor&&(!ScientificNumber.Finite(v.rewardFactor)||v.rewardFactor<SignalBalance.FactorMinimum||v.rewardFactor>SignalBalance.FactorMaximum)||!ScientificNumber.Finite(v.x)||!ScientificNumber.Finite(v.y)||v.x<0||v.x>100||v.y<0||v.y>100||v.variant<0||v.variant>2)throw new FormatException("Invalid visible signal");}
 }
}
