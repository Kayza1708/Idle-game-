using System;
using System.Linq;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using IdleIntelligence.Core;
using IdleIntelligence.Runtime;
using NUnit.Framework;
namespace IdleIntelligence.Tests
{
 public sealed class PurchaseProviderTests
 {
  sealed class FakeAdapter:IShopNativeAdapter
  {public bool Available=>true;public readonly List<string> calls=new List<string>();public string status="receipt";public bool failFinish;public Task<StoreProduct[]> Products(CancellationToken ct)=>Task.FromResult(Array.Empty<StoreProduct>());public Task<StoreResult> Purchase(string id,CancellationToken ct){calls.Add("purchase");return Task.FromResult(new StoreResult{Status=status,ProductId=id,TransactionId="tx",SignedReceipt="test-only"});}public async Task<StoreResult[]> Restore(CancellationToken ct)=>new[]{await Purchase("ai_singularity.pass.income",ct),await Purchase("ai_singularity.gems.100",ct)};public Task Finish(string id,CancellationToken ct){calls.Add("finish");if(failFinish)throw new InvalidOperationException();return Task.CompletedTask;}}
  sealed class FakeVerifier:IPurchaseVerifier
  {public bool Available=>true;public bool mismatch,missing;public Task<VerifiedPurchase> deferred;public Task<VerifiedPurchase> Verify(StoreResult r,CancellationToken ct)=>deferred??Task.FromResult(missing?null:new VerifiedPurchase{productId=r.ProductId,transactionId=mismatch?"other":r.TransactionId,originalTransactionId="original",status="active"});}
  [Test]public async Task ProviderCannotFinishBeforeSuccessfulDurableSaveAndRedeliveryDoesNotGrantTwice()
  {var a=new FakeAdapter();var service=new PurchaseService(a,new FakeVerifier());var state=Game.New(1000000);long initial=state.Retention.gems;int saved=0;Func<VerifiedPurchase[],Task<bool>> persist=grants=>{a.calls.Add("save");foreach(var p in grants)state=PurchaseRules.Fulfill(state,p);saved++;return Task.FromResult(true);};Assert.That(await service.Run("ai_singularity.gems.100",false,persist,CancellationToken.None),Is.EqualTo("persisted"));Assert.That(a.calls,Is.EqualTo(new[]{"purchase","save","finish"}));Assert.That(state.Retention.gems,Is.EqualTo(initial+100));await service.Run("ai_singularity.gems.100",false,persist,CancellationToken.None);Assert.That(state.Retention.gems,Is.EqualTo(initial+100));Assert.That(saved,Is.EqualTo(2));}
  [Test]public async Task VerificationFailureSaveFailureCancelPendingAndProviderFailureNeverFinish()
  {foreach(string mode in new[]{"verification","mismatch","save","cancelled","pending","unavailable"}){var a=new FakeAdapter();var v=new FakeVerifier{missing=mode=="verification",mismatch=mode=="mismatch"};if(new[]{"cancelled","pending","unavailable"}.Contains(mode))a.status=mode;int saved=0;await new PurchaseService(a,v).Run("ai_singularity.gems.100",false,g=>{saved++;return Task.FromResult(false);},CancellationToken.None);Assert.That(a.calls,Does.Not.Contain("finish"),mode);Assert.That(saved,Is.EqualTo(mode=="save"?1:0),mode);}var cancelled=new CancellationTokenSource();cancelled.Cancel();var adapter=new FakeAdapter();Assert.That(await new PurchaseService(adapter,new FakeVerifier()).Run("ai_singularity.gems.100",false,g=>Task.FromResult(true),cancelled.Token),Is.EqualTo("cancelled"));Assert.That(adapter.calls,Is.Empty);}
  [Test]public async Task RestoreFiltersConsumablesAndFinishFailureKeepsPersistedGrantForRedelivery()
  {var a=new FakeAdapter{failFinish=true};var state=Game.New(1000000);long gems=state.Retention.gems;var result=await new PurchaseService(a,new FakeVerifier()).Run(null,true,grants=>{Assert.That(grants.Length,Is.EqualTo(1));state=PurchaseRules.Fulfill(state,grants[0],true);return Task.FromResult(true);},CancellationToken.None);Assert.That(result,Is.EqualTo("failed"));Assert.That(state.Rewards.owned,Does.Contain("ai_singularity.pass.income"));Assert.That(state.Retention.gems,Is.EqualTo(gems));}
  [Test]public async Task LateVerifierAfterCancellationCannotPersistOrFinish()
  {var a=new FakeAdapter();var deferred=new TaskCompletionSource<VerifiedPurchase>();var c=new CancellationTokenSource();bool saved=false;var run=new PurchaseService(a,new FakeVerifier{deferred=deferred.Task}).Run("ai_singularity.gems.100",false,g=>{saved=true;return Task.FromResult(true);},c.Token);c.Cancel();deferred.SetResult(new VerifiedPurchase{productId="ai_singularity.gems.100",transactionId="tx",originalTransactionId="original",status="active"});Assert.That(await run,Is.EqualTo("cancelled"));Assert.That(saved,Is.False);Assert.That(a.calls,Does.Not.Contain("finish"));}
  [Test]public async Task ConcurrentRequestIsBlockedUntilDurableCallbackCompletes()
  {var a=new FakeAdapter();var service=new PurchaseService(a,new FakeVerifier());var deferred=new TaskCompletionSource<bool>();var run=service.Run("ai_singularity.gems.100",false,g=>deferred.Task,CancellationToken.None);Assert.That(await service.Run("ai_singularity.gems.100",false,g=>Task.FromResult(true),CancellationToken.None),Is.EqualTo("busy"));Assert.That(a.calls.Count(x=>x=="purchase"),Is.EqualTo(1));deferred.SetResult(false);Assert.That(await run,Is.EqualTo("save-failed"));Assert.That(a.calls,Does.Not.Contain("finish"));}
  [Test]public async Task ProductionAdaptersAreUnavailableAndNeverProvideAReceipt()
  {var adapter=new UnavailableShopNativeAdapter();var verifier=new UnavailablePurchaseVerifier();bool saved=false;Assert.That(await new PurchaseService(adapter,verifier).Run("ai_singularity.gems.100",false,g=>{saved=true;return Task.FromResult(true);},CancellationToken.None),Is.EqualTo("unavailable"));Assert.That(saved,Is.False);Assert.That((await adapter.Purchase("ai_singularity.gems.100",CancellationToken.None)).Status,Is.EqualTo("unavailable"));Assert.That(await verifier.Verify(new StoreResult{Status="receipt"},CancellationToken.None),Is.Null);}
 }
}
