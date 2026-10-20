using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Collections.Generic;
using IdleIntelligence.Core;
namespace IdleIntelligence.Runtime
{
 public sealed class StoreProduct{public string Id,LocalizedPrice;public bool Available;}
 public sealed class StoreResult{public string Status,ProductId,TransactionId,SignedReceipt;}
 public interface IShopNativeAdapter{bool Available{get;}Task<StoreProduct[]> Products(CancellationToken cancellation);Task<StoreResult> Purchase(string id,CancellationToken cancellation);Task<StoreResult[]> Restore(CancellationToken cancellation);Task Finish(string transaction,CancellationToken cancellation);}
 public interface IPurchaseVerifier{bool Available{get;}Task<VerifiedPurchase> Verify(StoreResult receipt,CancellationToken cancellation);}
 public sealed class UnavailableShopNativeAdapter:IShopNativeAdapter
 {public bool Available=>false;public Task<StoreProduct[]> Products(CancellationToken cancellation)=>Task.FromResult(Array.Empty<StoreProduct>());public Task<StoreResult> Purchase(string id,CancellationToken cancellation)=>Task.FromResult(new StoreResult{Status="unavailable"});public Task<StoreResult[]> Restore(CancellationToken cancellation)=>Task.FromResult(Array.Empty<StoreResult>());public Task Finish(string transaction,CancellationToken cancellation)=>Task.CompletedTask;}
 public sealed class UnavailablePurchaseVerifier:IPurchaseVerifier{public bool Available=>false;public Task<VerifiedPurchase> Verify(StoreResult receipt,CancellationToken cancellation)=>Task.FromResult<VerifiedPurchase>(null);}
 public sealed class PurchaseService
 {
  readonly IShopNativeAdapter adapter;readonly IPurchaseVerifier verifier;bool running;
  public PurchaseService(IShopNativeAdapter adapter,IPurchaseVerifier verifier){this.adapter=adapter;this.verifier=verifier;}
  // No finish before the caller confirms exact grants reached durable storage.
  public async Task<string> Run(string product,bool restoring,Func<VerifiedPurchase[],Task<bool>> persist,CancellationToken cancellation)
  {if(running)return "busy";if(!adapter.Available||!verifier.Available)return "unavailable";running=true;try{cancellation.ThrowIfCancellationRequested();var results=restoring?await adapter.Restore(cancellation):new[]{await adapter.Purchase(product,cancellation)};var grants=new List<VerifiedPurchase>();string status="unavailable";foreach(var receipt in results){cancellation.ThrowIfCancellationRequested();if(receipt==null)continue;status=receipt.Status;if(receipt.Status!="receipt")continue;var grant=await verifier.Verify(receipt,cancellation);cancellation.ThrowIfCancellationRequested();if(grant!=null&&(grant.status=="active"||grant.status=="revoked")&&grant.productId==receipt.ProductId&&grant.transactionId==receipt.TransactionId&&PurchaseRules.Product(grant.productId)!=null&&!string.IsNullOrEmpty(grant.originalTransactionId)&&(!restoring||PurchaseRules.Product(grant.productId).Permanent))grants.Add(grant);}if(grants.Count==0)return status=="receipt"?"verification-failed":status;cancellation.ThrowIfCancellationRequested();if(!await persist(grants.ToArray()))return "save-failed";foreach(var grant in grants){cancellation.ThrowIfCancellationRequested();await adapter.Finish(grant.transactionId,cancellation);}return "persisted";}catch(OperationCanceledException){return "cancelled";}catch{return "failed";}finally{running=false;}}
 }
}
