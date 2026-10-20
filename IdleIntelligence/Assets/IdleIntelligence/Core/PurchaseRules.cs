using System;
using System.Linq;
using System.Globalization;
namespace IdleIntelligence.Core
{
 public sealed class CommerceProduct
 {public readonly string Id,Kind;public readonly bool Once;public readonly long Gems;public readonly long[] Components;public bool Permanent=>Kind=="adfree"||Kind=="income"||Kind=="season";public CommerceProduct(string id,string kind,bool once,long gems,long[] components){Id=id;Kind=kind;Once=once;Gems=gems;Components=components;}}
 // Input from the authenticated verifier only. Runtime never constructs an active grant.
 [Serializable]public sealed class VerifiedPurchase{public string productId,transactionId,originalTransactionId,status;}
 [Serializable]public sealed class CommerceReceipt{public string id,kind,amount;public CommerceReceipt Copy()=>(CommerceReceipt)MemberwiseClone();}
 [Serializable]public sealed class CommerceState{public int schema=1;public bool initialized,hasLast;public CommerceReceipt last;public static CommerceState New()=>new CommerceState{initialized=true};public CommerceState Copy(){var c=(CommerceState)MemberwiseClone();c.last=hasLast?last?.Copy():null;return c;}}
 public static class PurchaseRules
 {
  const long Max=9007199254740991L;
  public static CommerceProduct Product(string id)=>CommerceBalance.Products.FirstOrDefault(p=>p.Id==id);
  public static double Income(GameState s)=>s.Rewards.owned.Contains("ai_singularity.pass.income")?CommerceBalance.IncomeMultiplier:1;
  public static bool AdFree(GameState s)=>s.Rewards.owned.Contains("ai_singularity.pass.adfree");
  static void Receipt(GameState s,VerifiedPurchase p,string kind,string amount){s.Commerce.hasLast=true;s.Commerce.last=new CommerceReceipt{id=p.transactionId,kind=kind,amount=amount};}
  public static GameState Fulfill(GameState state,VerifiedPurchase p,bool restoring=false)
  {
   if(p==null||ChallengeRules.Active(state)||string.IsNullOrEmpty(p.transactionId)||string.IsNullOrEmpty(p.originalTransactionId))return state;var product=Product(p.productId);if(product==null)return state;var rights=state.Rewards;
   if(p.status=="revoked"){if(!product.Permanent)return state;var removed=state.Copy();removed.Rewards.owned=rights.owned.Where(id=>id!=p.productId).ToArray();return removed;}
   if(p.status!="active"||restoring&&!product.Permanent)return state;
   if(product.Permanent){if(rights.owned.Contains(product.Id))return state;var next=state.Copy();next.Rewards.owned=rights.owned.Concat(new[]{product.Id}).ToArray();next.Rewards.transactions=rights.transactions.Union(new[]{p.transactionId}).ToArray();Receipt(next,p,product.Kind,"0");return next;}
   if(rights.transactions.Contains(p.transactionId)||product.Once&&rights.owned.Contains(product.Id))return state;
   long total=product.Components.Sum();if(state.Retention.gems>Max-product.Gems||state.Workshop.components.Sum()>Max-total||state.Lifetime.componentsEarned>Max-total||Math.Floor(state.Lifetime.componentsEarned+total)!=state.Lifetime.componentsEarned+total||product.Kind=="starter"&&(state.Workshop.nextId>Max-CommerceBalance.StarterTypes.Length||Enumerable.Range(0,CommerceBalance.StarterTypes.Length).Any(i=>state.Workshop.inventory.Any(item=>item.id=="item-"+(state.Workshop.nextId+i)))))return state;
   var s=state.Copy();if(product.Gems>0)RetentionRules.Gems(s,product.Gems,p.transactionId,product.Id);for(int i=0;i<product.Components.Length;i++)if(product.Components[i]>0){s.Workshop.components[i]+=product.Components[i];Lifetime.Components(s,i,product.Components[i]);}if(product.Kind=="starter")for(int i=0;i<CommerceBalance.StarterTypes.Length;i++){var item=RetentionRules.CreateItem(s,CommerceBalance.StarterTypes[i],CommerceBalance.StarterRarities[i]);if(ReferenceEquals(item,s))return state;s=item;}
   if(product.Once)s.Rewards.owned=s.Rewards.owned.Concat(new[]{product.Id}).ToArray();s.Rewards.transactions=s.Rewards.transactions.Concat(new[]{p.transactionId}).ToArray();Receipt(s,p,product.Kind,product.Gems.ToString(CultureInfo.InvariantCulture));return s;
  }
  public static bool Fulfilled(GameState s,VerifiedPurchase p)=>p!=null&&(p.status=="revoked"?!s.Rewards.owned.Contains(p.productId):p.productId=="ai_singularity.pass.adfree"||p.productId=="ai_singularity.pass.income"||p.productId?.StartsWith("ai_singularity.season.",StringComparison.Ordinal)==true?s.Rewards.owned.Contains(p.productId):s.Rewards.transactions.Contains(p.transactionId));
  public static void Validate(GameState s){var c=s.Commerce;if(c==null||!c.initialized||c.schema!=1||c.hasLast&&(c.last==null||string.IsNullOrEmpty(c.last.id)||c.last.kind==null||c.last.amount==null))throw new FormatException("Invalid commerce receipt");}
 }
}
