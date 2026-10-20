using System;
using System.Linq;
using System.Text;
using System.Globalization;
using System.Collections.Generic;
namespace IdleIntelligence.Core
{
 [Serializable]public sealed class MarketRotation
 {public long day;public int[] materials=Array.Empty<int>();public int discount;public string item;public string[] claimed=Array.Empty<string>();public MarketRotation Copy(){var r=(MarketRotation)MemberwiseClone();r.materials=(int[])materials.Clone();r.claimed=(string[])claimed.Clone();return r;}}
 [Serializable]public sealed class MarketAdTicket
 {public string id,context;public double at,expiresAt;public MarketAdTicket Copy()=>(MarketAdTicket)MemberwiseClone();}
 [Serializable]public sealed class MarketState
 {public int schema=1;public bool initialized,hasRotation,hasPending;public MarketRotation rotation;public MarketAdTicket pending;public double freeNextAt,adWindowStartedAt;public int adWindowUsed;public static MarketState New()=>new MarketState{initialized=true};public MarketState Copy(){var m=(MarketState)MemberwiseClone();m.rotation=hasRotation?rotation?.Copy():null;m.pending=hasPending?pending?.Copy():null;return m;}}
 public sealed class MarketOffer
 {public string Id,Kind,Payment,Tier="",Item="";public int Component=-1,Rarity;public long Cost,Amount,OriginalCost;public bool Stock;}
 public sealed class MarketQuote
 {public MarketOffer Offer;public string Reason;public bool Allowed=>Reason==null;public MarketTicket Ticket;public double FreeRemaining,RotationRemaining;}
 public sealed class MarketTicket{public string id;public long revision,day;}
 public sealed class MarketVideoQuote{public string Reason;public int Remaining;public double ResetIn;public bool Allowed=>Reason==null;}
 public static class Market
 {
  const long Max=9007199254740991L;
  public static bool Blocked(GameState s)=>ChallengeRules.Active(s);
  public static double Clock(GameState s)=>Math.Max(s.SavedAt,s.Rewards.shopClockAt);
  public static bool MaterialAccess(GameState s,int c)=>c>=0&&c<ItemBalance.ComponentIds.Length&&(!MarketBalance.NewMaterials[c]||MaterialAnalysis.Access(s,(int)MarketBalance.AccessFamilies[c]));
  static string Json(string value)
  {var b=new StringBuilder("\"");for(int i=0;i<value.Length;i++){char c=value[i];switch(c){case '"':b.Append("\\\"");break;case '\\':b.Append("\\\\");break;case '\b':b.Append("\\b");break;case '\f':b.Append("\\f");break;case '\n':b.Append("\\n");break;case '\r':b.Append("\\r");break;case '\t':b.Append("\\t");break;default:if(c<32||char.IsSurrogate(c)&&!(char.IsHighSurrogate(c)&&i+1<value.Length&&char.IsLowSurrogate(value[i+1]))&&!(char.IsLowSurrogate(c)&&i>0&&char.IsHighSurrogate(value[i-1])))b.Append("\\u"+((int)c).ToString("x4",CultureInfo.InvariantCulture));else b.Append(c);break;}}return b.Append('"').ToString();}
  public static string Context(GameState s)=>"["+Json(s.Missions.campaign)+","+s.Prestige.resets.ToString(CultureInfo.InvariantCulture)+","+s.Meta.resets.ToString(CultureInfo.InvariantCulture)+","+(s.Challenges.Run==null?"null":Json(s.Challenges.Run.runId))+","+(s.Challenges.Main==null?"false":"true")+"]";
  static double Hash(GameState s,string key)=>BonusBoxes.Roll(s.Missions.campaign,"shop:"+key);
  static string Number(long n)=>n.ToString(CultureInfo.InvariantCulture);
  public static MarketRotation Rotation(GameState s)
  {
   long day=(long)Math.Floor(Clock(s)/MarketBalance.CycleMilliseconds);var old=s.Market.hasRotation?s.Market.rotation:null;if(old!=null&&day<=old.day)return old;
   var ordered=Enumerable.Range(0,ItemBalance.ComponentIds.Length).Where(c=>MaterialAccess(s,c)).OrderBy(c=>Hash(s,Number(day)+":"+ItemBalance.ComponentIds[c])).ThenBy(c=>Array.IndexOf(MarketBalance.LexicalOrder,ItemBalance.ComponentIds[c])).ToArray();var pool=SeasonRules.Pool(s);int offset=(int)Math.Floor(Hash(s,"item-offset")*pool.Length);string item=pool.Length==0?"quantum-chip":pool[(day+offset)%pool.Length];if(old!=null&&item==old.item&&pool.Length>1)item=pool[(Array.IndexOf(pool,item)+1)%pool.Length];return new MarketRotation{day=day,materials=ordered.Take((int)MarketBalance.RotatingCount).ToArray(),discount=ordered.LastOrDefault(),item=item};
  }
  public static GameState Visit(GameState state)
  {if(Blocked(state))return state;var r=Rotation(state);var p=state.Market.hasPending?state.Market.pending:null;bool clear=p!=null&&(p.expiresAt<Clock(state)||p.context!=Context(state));if(ReferenceEquals(r,state.Market.rotation)&&!clear)return state;var s=state.Copy();s.Market.hasRotation=true;s.Market.rotation=r.Copy();if(clear){s.Market.hasPending=false;s.Market.pending=null;}s.Rewards.shopClockAt=Clock(state);s.Rewards.shopRevision++;return s;}
  public static MarketOffer[] Offers(GameState s)
  {
   var r=Rotation(s);var offers=new List<MarketOffer>{new MarketOffer{Id="free-common",Kind="chest",Tier="common",Payment="free"}};
   for(int i=0;i<SeasonBalance.Chests.Length;i++)offers.Add(new MarketOffer{Id="chest:"+SeasonBalance.Chests[i].Id,Kind="chest",Tier=SeasonBalance.Chests[i].Id,Cost=(long)MarketBalance.ChestCosts[i],Payment="gems"});
   for(int c=0;c<ItemBalance.ComponentIds.Length;c++)offers.Add(new MarketOffer{Id="material:"+ItemBalance.ComponentIds[c],Kind="material",Component=c,Amount=(long)MarketBalance.MaterialAmounts[c],Cost=(long)MarketBalance.MaterialCosts[c],Payment="gems"});
   foreach(int c in r.materials)offers.Add(new MarketOffer{Id="daily:"+Number(r.day)+":"+ItemBalance.ComponentIds[c],Kind="material",Component=c,Amount=(long)MarketBalance.MaterialAmounts[c],Cost=(long)MarketBalance.MaterialCosts[c],Payment="gems",Stock=true});
   offers.Add(new MarketOffer{Id="discount:"+Number(r.day)+":"+ItemBalance.ComponentIds[r.discount],Kind="material",Component=r.discount,Amount=(long)MarketBalance.MaterialAmounts[r.discount],Cost=(long)Math.Ceiling(MarketBalance.MaterialCosts[r.discount]*(100-MarketBalance.DiscountPercent)/100),OriginalCost=(long)MarketBalance.MaterialCosts[r.discount],Payment="gems",Stock=true});offers.Add(new MarketOffer{Id="item:"+Number(r.day),Kind="item",Item=r.item,Rarity=(int)MarketBalance.DailyItemRarity,Cost=(long)MarketBalance.DailyItemCost,Payment="gems",Stock=true});return offers.ToArray();
  }
  public static MarketQuote Quote(GameState s,string id)
  {var offer=Offers(s).FirstOrDefault(o=>o.Id==id);var r=Rotation(s);string reason=Blocked(s)?"challenge":s.Rewards.shopRevision>Max-2?"limit":offer==null?"expired":offer.Component>=0&&!MaterialAccess(s,offer.Component)?"locked":offer.Stock&&r.claimed.Contains(id)?"sold":id=="free-common"&&Clock(s)<s.Market.freeNextAt?"cooldown":offer.Payment=="gems"&&s.Retention.gems<offer.Cost?"gems":null;return new MarketQuote{Offer=offer,Reason=reason,Ticket=new MarketTicket{id=id,revision=s.Rewards.shopRevision,day=r.day},FreeRemaining=Math.Max(0,s.Market.freeNextAt-Clock(s)),RotationRemaining=Math.Max(0,(r.day+1)*MarketBalance.CycleMilliseconds-Clock(s))};}
  public static MarketVideoQuote VideoQuote(GameState s)
  {double now=Clock(s);int used=now>=s.Market.adWindowStartedAt+MarketBalance.CycleMilliseconds?0:s.Market.adWindowUsed;bool pending=s.Market.hasPending&&s.Market.pending.expiresAt>=now&&s.Market.pending.context==Context(s);return new MarketVideoQuote{Reason=Blocked(s)?"challenge":pending?"busy":used>=MarketBalance.VideoLimit?"limit":null,Remaining=(int)MarketBalance.VideoLimit-used,ResetIn=used>0?Math.Max(0,s.Market.adWindowStartedAt+MarketBalance.CycleMilliseconds-now):0};}
  static bool Transaction(string id)=>!string.IsNullOrEmpty(id)&&id.Length<=160;
  public static GameState BeginVideo(GameState state,string tx)
  {if(!Transaction(tx)||!VideoQuote(state).Allowed)return state;var s=state.Copy();double now=Clock(s);s.Rewards.shopClockAt=now;s.Market.hasPending=true;s.Market.pending=new MarketAdTicket{id=tx,context=Context(s),at=now,expiresAt=now+MarketBalance.AdTicketMilliseconds};return s;}
  public static GameState CancelVideo(GameState state,string tx)
  {if(!state.Market.hasPending||state.Market.pending.id!=tx)return state;var s=state.Copy();s.Market.hasPending=false;s.Market.pending=null;return s;}
  static int Weighted(double[] weights,Func<double> random)
  {double n=random()*weights.Sum();for(int i=0;i<weights.Length;i++){n-=weights[i];if(n<0)return i;}return weights.Length-1;}
  static Func<double> Seeded(GameState state)
  {int n=0;return()=>Hash(state,"receipt:"+Number(state.Rewards.shopRevision+1)+":"+n++);}
  static GameState Grant(GameState state,MarketOffer offer,string payment,Func<double> rng)
  {
   Func<double> random=()=>{double v=rng();if(!ScientificNumber.Finite(v)||v<0||v>=1)throw new ArgumentOutOfRangeException(nameof(rng));return v;};var components=new long[ItemBalance.ComponentIds.Length];string item=offer.Item;int rarity=offer.Rarity;
   if(offer.Kind=="chest"){var def=SeasonBalance.Chests.First(c=>c.Id==offer.Tier);var table=ItemBalance.MaterialFamilies.SelectMany((ids,f)=>MaterialAnalysis.Access(state,f)?ids:Array.Empty<string>()).ToArray();if(table.Length==0)return state;var weights=Enumerable.Repeat(1d,table.Length).ToArray();for(int n=0;n<def.Rolls;n++){int c=Array.IndexOf(ItemBalance.ComponentIds,table[Weighted(weights,random)]);components[c]+=def.Minimum+(long)Math.Floor(random()*(def.Maximum-def.Minimum+1));}if(random()*10000<def.ItemChance){var pool=SeasonRules.Pool(state);if(pool.Length==0)return state;rarity=Weighted(def.Weights,random);item=pool[(int)Math.Floor(random()*pool.Length)];}}
   else if(offer.Kind=="material")components[offer.Component]=offer.Amount;
   long total=components.Sum();if(state.Workshop.components.Sum()>Max-total||state.Lifetime.componentsEarned>Max-total||Math.Floor(state.Lifetime.componentsEarned+total)!=state.Lifetime.componentsEarned+total||components.Where((v,c)=>state.Workshop.components[c]>Max-v).Any())return state;var s=state;if(item!=""){s=RetentionRules.CreateItem(s,item,rarity);if(ReferenceEquals(s,state))return state;}s=s.Copy();if(total>0)for(int c=0;c<components.Length;c++){s.Workshop.components[c]+=components[c];Lifetime.Components(s,c,components[c]);}
   long cost=payment=="gems"?offer.Cost:0;s.Rewards.shopRevision=state.Rewards.shopRevision+1;s.Rewards.shopClockAt=Clock(state);if(offer.Stock&&s.Market.hasRotation)s.Market.rotation.claimed=s.Market.rotation.claimed.Concat(new[]{offer.Id}).ToArray();if(payment=="free")s.Market.freeNextAt=Clock(state)+MarketBalance.CycleMilliseconds;s.Rewards.hasReceipt=true;s.Rewards.receipt=new ChestReceipt{metadataRecorded=true,id=s.Rewards.shopRevision,at=Clock(state),offerId=offer.Id,kind=offer.Kind,payment=payment,cost=cost,tier=offer.Tier,components=components,hasItem=item!="",item=item!=""?s.Workshop.inventory.Last().Copy():null};if(cost>0)RetentionRules.Gems(s,-cost,"shop:"+s.Missions.campaign+":"+Number(s.Rewards.shopRevision),offer.Id);s.Workshop.revision++;return s;
  }
  public static GameState Buy(GameState state,MarketTicket ticket,Func<double> rng=null)
  {if(ticket==null||ticket.revision!=state.Rewards.shopRevision||ticket.day!=Rotation(state).day)return state;var q=Quote(state,ticket.id);if(!q.Allowed||q.Offer==null)return state;var ready=Visit(state);try{var next=Grant(ready,q.Offer,q.Offer.Payment,rng??Seeded(ready));return ReferenceEquals(next,ready)?state:next;}catch(Exception){return state;}}
  public static GameState CompleteVideo(GameState state,string tx,string result)
  {var p=state.Market.hasPending?state.Market.pending:null;if(p==null||p.id!=tx)return state;if(result!="success"||Blocked(state)||p.context!=Context(state)||Clock(state)>p.expiresAt)return CancelVideo(state,tx);var cleared=CancelVideo(state,tx);if(!VideoQuote(cleared).Allowed)return cleared;var ready=Visit(cleared);GameState next;try{next=Grant(ready,Offers(ready)[0],"video",Seeded(ready));}catch(Exception){return cleared;}if(ReferenceEquals(next,ready))return cleared;if(Clock(ready)>=ready.Market.adWindowStartedAt+MarketBalance.CycleMilliseconds){next.Market.adWindowStartedAt=Clock(ready);next.Market.adWindowUsed=0;}next.Market.adWindowUsed++;return next;}
  public static GameState EarnedChest(GameState state,long id)
  {var c=state.Rewards.chests.FirstOrDefault(v=>v.id==id);if(c==null||Blocked(state)||state.Rewards.shopRevision>=Max||!SeasonBalance.Chests.Any(d=>d.Id==c.tier))return state;try{var next=Grant(state,new MarketOffer{Id="season-chest:"+Number(id),Kind="chest",Tier=c.tier,Payment="free"},"season",Seeded(state));if(ReferenceEquals(next,state))return state;next.Rewards.chests=next.Rewards.chests.Where(v=>v.id!=id).ToArray();return next;}catch(Exception){return state;}}
  public static void Validate(GameState s)
  {
   var m=s.Market;if(m==null||!m.initialized||m.schema!=1||!ScientificNumber.Finite(m.freeNextAt)||m.freeNextAt<0||m.freeNextAt>8.64e15||!ScientificNumber.Finite(m.adWindowStartedAt)||m.adWindowStartedAt<0||m.adWindowStartedAt>8.64e15||m.adWindowUsed<0||m.adWindowUsed>MarketBalance.VideoLimit)throw new FormatException("Invalid market state");
   if(m.hasRotation){var r=m.rotation;if(r==null||r.day<0||r.day>Max||r.materials==null||r.materials.Length!=MarketBalance.RotatingCount||r.materials.Any(c=>c<0||c>=ItemBalance.ComponentIds.Length)||r.materials.Distinct().Count()!=r.materials.Length||r.discount<0||r.discount>=ItemBalance.ComponentIds.Length||!SeasonBalance.PoolTypes.Contains(r.item)||new[]{"impulse-relay","insight-archive"}.Contains(r.item)||r.claimed==null||r.claimed.Length>MarketBalance.RotatingCount+2||r.claimed.Distinct().Count()!=r.claimed.Length||r.claimed.Any(id=>!r.materials.Select(c=>"daily:"+Number(r.day)+":"+ItemBalance.ComponentIds[c]).Concat(new[]{"discount:"+Number(r.day)+":"+ItemBalance.ComponentIds[r.discount],"item:"+Number(r.day)}).Contains(id)))throw new FormatException("Invalid market rotation");}
   if(m.hasPending){var p=m.pending;if(p==null||!Transaction(p.id)||!ScientificNumber.Finite(p.at)||p.at<0||p.at>8.64e15||!ScientificNumber.Finite(p.expiresAt)||p.expiresAt>8.64e15||p.expiresAt-p.at!=MarketBalance.AdTicketMilliseconds||p.context==null||p.context.Length>1000)throw new FormatException("Invalid pending market video");}if(!s.Rewards.hasReceipt&&s.Rewards.shopRevision>0&&m.freeNextAt>0)throw new FormatException("Missing market receipt");
  }
 }
}
