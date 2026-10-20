using System.Threading;
using System.Threading.Tasks;
namespace IdleIntelligence.Runtime
{
 public enum RewardProviderResult{Success,Cancelled,Failed,Unavailable}
 public interface IRewardedVideoProvider{Task<RewardProviderResult> ShowAsync(string placement,string transaction,CancellationToken cancellation);}
 // No SDK or simulated completion. A later separately authorized integration supplies a real provider.
 public sealed class UnavailableRewardedVideoProvider:IRewardedVideoProvider
 {public Task<RewardProviderResult> ShowAsync(string placement,string transaction,CancellationToken cancellation)=>Task.FromResult(cancellation.IsCancellationRequested?RewardProviderResult.Cancelled:RewardProviderResult.Unavailable);}
}
