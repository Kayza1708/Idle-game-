using System;
using System.Linq;
namespace IdleIntelligence.Core
{
 public sealed class SeasonReward
 {public readonly int Level,Track,Rarity;public readonly long Gems,Amount;public readonly string Component,Artifact,Chest,Item;public SeasonReward(int level,int track,long gems,string component,long amount,string artifact,string chest,string item,int rarity){Level=level;Track=track;Gems=gems;Component=component;Amount=amount;Artifact=artifact;Chest=chest;Item=item;Rarity=rarity;}}
 public sealed class ChestDefinition
 {public readonly string Id;public readonly int Rolls,Minimum,Maximum,ItemChance;public readonly double[] Weights;public ChestDefinition(string id,int rolls,int minimum,int maximum,int chance,double[] weights){Id=id;Rolls=rolls;Minimum=minimum;Maximum=maximum;ItemChance=chance;Weights=weights;}}
 [Serializable]public sealed class EarnedChest
 {public long id;public string tier,seasonId;public EarnedChest Copy()=>(EarnedChest)MemberwiseClone();}
 [Serializable]public sealed class ChestReceipt
 {public bool metadataRecorded,voucherGranted;public long cost;public string kind,payment;public long id;public double at;public string offerId,tier;public long[] components=new long[ItemBalance.ComponentIds.Length];public bool hasItem;public ItemInstance item;public ChestReceipt Copy(){var r=(ChestReceipt)MemberwiseClone();r.components=(long[])components.Clone();r.item=hasItem?item?.Copy():null;return r;}}
 [Serializable]public sealed class RewardState
 {
  public int schema=1;public bool initialized;public string[] owned=Array.Empty<string>(),transactions=Array.Empty<string>();public long nextChest=1,shopRevision,vouchersEarned,vouchersSpent;public double shopClockAt;public EarnedChest[] chests=Array.Empty<EarnedChest>();public bool hasReceipt;public ChestReceipt receipt;
  public static RewardState New()=>new RewardState{initialized=true};
  public RewardState Copy(){var r=(RewardState)MemberwiseClone();r.owned=(string[])owned.Clone();r.transactions=(string[])transactions.Clone();r.chests=chests.Select(c=>c.Copy()).ToArray();r.receipt=hasReceipt?receipt?.Copy():null;return r;}
 }
 public static class SeasonRules
 {
  const long Max=9007199254740991L;
  public static ScientificNumber ArtifactFactor(GameState s)=>ScientificNumber.From(SeasonBalance.ArtifactBase).Pow(s.Retention.artifacts.Length).Pow(1+Math.Min(SeasonBalance.ArtifactCap,s.Retention.artifacts.Length*SeasonBalance.ArtifactPer));
  public static int Theme(string id){if(!long.TryParse(id.Split('-').Last(),out long number)||number<1)return 0;return(int)((number-1)%SeasonBalance.ThemeNames.Length);}
  public static string Product(string id)=>"ai_singularity.season."+id.Split('-')[1];
  public static bool Premium(GameState s,string id)=>s.Rewards.owned.Contains(Product(id));
  public static int Level(SeasonProgress p)=>(int)Math.Min(MissionBalance.SeasonLevels,Math.Floor(p.xp/MissionBalance.XPPerLevel));
  public static SeasonProgress Target(GameState s,string id)=>s.Missions.hasPrevious&&s.Missions.previous.id==id&&s.SavedAt<=s.Missions.previous.claimUntil?s.Missions.previous:s.Missions.season.id==id?s.Missions.season:null;
  public static SeasonReward Reward(string id,int level,int track)=>track<0||track>1||level<1||level>MissionBalance.SeasonLevels?null:SeasonBalance.Rewards[Theme(id)].First(r=>r.Level==level&&r.Track==track);
  public static string Block(GameState s,string id,int level,int track)
  {
   if(ChallengeRules.Active(s))return "Hauptspiel pausiert";var p=Target(s,id);var r=Reward(id,level,track);if(p==null||r==null)return "Nicht verfügbar";if(level>Level(p))return "Season-Level fehlt";if(track==1&&!Premium(s,id))return "Premium nicht freigeschaltet";if((track==0?p.claimed:p.premiumClaimed).Contains(level))return "Abgeholt";if(r.Chest!=""&&(s.Rewards.chests.Length>=SeasonBalance.MaxChests||s.Rewards.nextChest>=Max))return "Truhenlager voll";if(VoucherRules.SeasonAward(level,track)>0&&!VoucherRules.CanEarn(s))return "Gutscheinlimit";if(s.Retention.gems>Max-r.Gems)return "Gems-Grenze";int c=Array.IndexOf(ItemBalance.ComponentIds,r.Component);if(c>=0&&(s.Workshop.components[c]>Max-r.Amount||s.Workshop.components.Sum()>Max-r.Amount))return "Materialgrenze";if(r.Item!=""&&s.Workshop.nextId>=Max)return "Item-ID-Grenze";return null;
  }
  public static GameState Claim(GameState state,string id,int level,int track)
  {
   if(Block(state,id,level,track)!=null)return state;var r=Reward(id,level,track);var s=state.Copy();int c=Array.IndexOf(ItemBalance.ComponentIds,r.Component);if(c>=0&&r.Amount>0){s.Workshop.components[c]+=r.Amount;Lifetime.Components(s,c,r.Amount);}if(r.Item!=""){var created=RetentionRules.CreateItem(s,r.Item,r.Rarity);if(ReferenceEquals(created,s))return state;s=created;}
   if(r.Chest!=""){s.Rewards.chests=s.Rewards.chests.Concat(new[]{new EarnedChest{id=s.Rewards.nextChest++,tier=r.Chest,seasonId=id}}).ToArray();}if(VoucherRules.SeasonAward(level,track)>0)s.Rewards.vouchersEarned++;if(r.Gems>0)RetentionRules.Gems(s,r.Gems,"season:"+id+":"+(track==0?"free":"premium")+":"+level,"season-"+(track==0?"free":"premium"));if(r.Artifact!=""){s.Retention.artifacts=s.Retention.artifacts.Union(new[]{id+(track==1?"-premium-core":"-core")}).ToArray();s.Retention.completedSeasons=s.Retention.completedSeasons.Union(new[]{id}).ToArray();}var p=Target(s,id);if(track==0)p.claimed=p.claimed.Concat(new[]{level}).ToArray();else p.premiumClaimed=p.premiumClaimed.Concat(new[]{level}).ToArray();s.Workshop.revision++;LocalJournal.Record(s,"season-reward",permanent:false);return s;
  }
  public static string[] Pool(GameState s)=>SeasonBalance.PoolTypes.Where(type=>{if(type=="impulse-relay"||type=="insight-archive")return false;var d=ItemBalance.Items[Workshop.Index(type)];if(d.Access=="lab"||d.Access=="axiom"||d.Access=="model-set")return Game.Level(s,"blueprints")>0&&Workshop.LateAccess(s,d);return !MissionBalance.ExtendedIds.Contains(type)||Game.Level(s,"blueprints")>0&&(d.Access=="prestige"?s.Prestige.resets>0:s.Industry.families[d.Access=="server"?2:d.Access=="campus"?3:4]);}).ToArray();
  public static GameState OpenChest(GameState state,long id)=>Market.EarnedChest(state,id);
  public static void Validate(GameState s)
  {
   var r=s.Rewards;if(r==null||!r.initialized||r.schema!=1||r.vouchersEarned<0||r.vouchersSpent<0||r.vouchersEarned<r.vouchersSpent||r.vouchersEarned-r.vouchersSpent>VoucherBalance.MaxOwned||r.vouchersEarned>Max||r.owned==null||r.transactions==null||r.owned.Any(id=>!CommerceBalance.Products.Any(p=>p.Id==id&&p.Once))||r.owned.Distinct().Count()!=r.owned.Length||r.transactions.Any(id=>string.IsNullOrEmpty(id))||r.transactions.Distinct().Count()!=r.transactions.Length||r.nextChest<1||r.nextChest>Max||r.shopRevision<0||r.shopRevision>Max||!ScientificNumber.Finite(r.shopClockAt)||r.shopClockAt<0||r.chests==null||r.chests.Length>SeasonBalance.MaxChests||r.chests.Select(c=>c?.id).Distinct().Count()!=r.chests.Length)throw new FormatException("Invalid season reward state");
   foreach(var c in r.chests)if(c==null||c.id<1||c.id>=r.nextChest||!SeasonBalance.Chests.Any(t=>t.Id==c.tier)||c.seasonId==null)throw new FormatException("Invalid earned chest");if(r.hasReceipt){var p=r.receipt;if(p==null||p.id<1||p.id>r.shopRevision||!ScientificNumber.Finite(p.at)||p.at<0||string.IsNullOrEmpty(p.offerId)||!p.metadataRecorded||!new[]{"chest","material","item"}.Contains(p.kind)||!new[]{"free","video","gems","season"}.Contains(p.payment)||p.cost<0||p.cost>Max||p.payment!="gems"&&p.cost!=0||p.kind=="chest"&&!SeasonBalance.Chests.Any(t=>t.Id==p.tier)||p.kind!="chest"&&p.tier!=""||p.kind=="item"&&!p.hasItem||p.kind=="material"&&p.hasItem||p.components==null||p.components.Length!=ItemBalance.ComponentIds.Length||p.components.Any(n=>n<0||n>Max)||p.hasItem&&(p.item==null||Workshop.Index(p.item.type)<0||p.item.level!=1||p.item.rarity<0||p.item.rarity>=ItemBalance.RarityFactors.Length||p.item.locked||string.IsNullOrEmpty(p.item.id)||p.item.id.Length>160||new[]{"impulse-relay","insight-archive"}.Contains(p.item.type)))throw new FormatException("Invalid earned chest receipt");}
  }
 }
}
