using UnityEngine;
using System.Threading;
using System.Threading.Tasks;
namespace IdleIntelligence.Runtime
{
 public enum RewardProviderResult{Success,Cancelled,Failed,Unavailable}
 public interface IRewardedVideoProvider{Task<RewardProviderResult> ShowAsync(string placement,string transaction,CancellationToken cancellation);}
 public interface IRewardedProviderStatus { bool Ready{get;} string Status{get;} }
 public static class RewardProviderFactory
 {
  // One persistent SDK provider per native Unity runtime. There are no fake
  // grants on Editor/Desktop or when SDK, CMP, network, IDs or ads are absent.
  public static IRewardedVideoProvider Create(GameRuntime runtime)
  {
    if(runtime==null)return new UnavailableRewardedVideoProvider();
    var provider=runtime.GetComponent<LevelPlayRewardedProvider>();
    if(provider==null)provider=runtime.gameObject.AddComponent<LevelPlayRewardedProvider>();
    return provider;
  }
  public static bool IsReady(IRewardedVideoProvider provider)
   =>provider is IRewardedProviderStatus status&&status.Ready;
  public static string Message(IRewardedVideoProvider provider)
   =>provider is IRewardedProviderStatus status?status.Status:"Videoanbieter nicht verfügbar";
 }
 // No SDK or simulated completion. A later separately authorized integration supplies a real provider.
 public sealed class UnavailableRewardedVideoProvider:IRewardedVideoProvider
 {public Task<RewardProviderResult> ShowAsync(string placement,string transaction,CancellationToken cancellation)=>Task.FromResult(cancellation.IsCancellationRequested?RewardProviderResult.Cancelled:RewardProviderResult.Unavailable);}
}
