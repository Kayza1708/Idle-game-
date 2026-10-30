using System;
using System.Collections;
using System.Linq;
using System.Reflection;
using System.Threading;
using System.Threading.Tasks;
using UnityEngine;

namespace IdleIntelligence.Runtime
{
    /// <summary>
    /// LevelPlay 9.5+ callback bridge. SDK types are resolved at runtime, rather
    /// than guessing an assembly-definition name in a project where UPM has not
    /// yet generated packages-lock.json. No SDK = no ads = no rewards.
    /// OnAdRewarded is the ONLY success path; AdClosed never grants anything.
    /// </summary>
    public sealed class LevelPlayRewardedProvider : MonoBehaviour, IRewardedVideoProvider, IRewardedProviderStatus
    {
        NativeAdConfiguration config;
        Type sdkType, rewardType, privacyType;
        object rewardedAd;
        EventInfo initSuccess, initFailure, loadedEvent, loadFailedEvent,
            displayedEvent,displayFailedEvent, earnedEvent, closedEvent;
        Delegate initSuccessHandler,initFailureHandler,loadedHandler,loadFailedHandler,
            displayedHandler,displayFailedHandler,earnedHandler,closedHandler;
        TaskCompletionSource<RewardProviderResult> pending;
        CancellationTokenRegistration pendingCancellation;
        bool initialized,initializing,loading,wasDisplayed;
        float nextInitializationAttempt;
        Coroutine closingGrace;
        string currentTransaction;
        public bool Ready => initialized && NativeAdPrivacy.CanInitialize(config)
            && rewardedAd != null && TryReady();
        public string Status {
            get {
                if(config==null)return "Konfiguration fehlt";
                if(!config.HasCredentials)return "LevelPlay App-Key oder Rewarded Ad Unit fehlt";
                if(!NativeAdPrivacy.CanInitialize(config))return "Werbeeinwilligung oder Store-CMP fehlt";
                if(sdkType==null)return "LevelPlay SDK noch nicht von Unity importiert";
                if(initializing)return "Werbeanbieter startet";
                return Ready?"Video bereit":initialized?"Video wird geladen":"Werbeanbieter nicht initialisiert";
            }
        }
        static Type Find(string name)
        {
            return AppDomain.CurrentDomain.GetAssemblies()
                .Select(a=>a.GetType("Unity.Services.LevelPlay."+name,false))
                .FirstOrDefault(t=>t!=null);
        }
        void Awake()
        {
            config=Resources.Load<NativeAdConfiguration>("NativeAdConfiguration");
            sdkType=Find("LevelPlay");
            rewardType=Find("LevelPlayRewardedAd");
            privacyType=Find("LevelPlayPrivacySettings");
            TryInitialize();
        }
        void Update(){if(!initialized&&!initializing&&Time.unscaledTime>=nextInitializationAttempt)TryInitialize();}
        void TryInitialize()
        {
            if(initialized||initializing||sdkType==null||rewardType==null||
               privacyType==null||!NativeAdPrivacy.CanInitialize(config))return;
            try
            {
                // Only explicit QA consent or certified CMP consent can reach here.
                (privacyType.GetMethod("SetGDPRConsent",BindingFlags.Public|BindingFlags.Static)
                    ??throw new MissingMethodException("LevelPlayPrivacySettings.SetGDPRConsent"))
                    .Invoke(null,new object[]{true});
                (privacyType.GetMethod("SetCCPA",BindingFlags.Public|BindingFlags.Static)
                    ??throw new MissingMethodException("LevelPlayPrivacySettings.SetCCPA"))
                    .Invoke(null,new object[]{true}); // opt out of data sale/sharing
                // General-audience game; COPPA/age declarations require Store review.
                initSuccess=Attach(sdkType,null,"OnInitSuccess",nameof(OnInitSuccess),out initSuccessHandler);
                initFailure=Attach(sdkType,null,"OnInitFailed",nameof(OnInitFailed),out initFailureHandler);
                if(initSuccess==null||initFailure==null)throw new MissingMethodException("LevelPlay init events unavailable");
                initializing=true;
                var init=sdkType.GetMethods(BindingFlags.Public|BindingFlags.Static)
                    .FirstOrDefault(m=>m.Name=="Init"&&m.GetParameters().Length==1&&
                        m.GetParameters()[0].ParameterType==typeof(string));
                if(init==null)throw new MissingMethodException("LevelPlay.Init(string)");
                init.Invoke(null,new object[]{config.AppKey});
                if(!initializing && !initialized)Debug.LogWarning("LevelPlay failed to start");
            }
            catch(Exception error)
            {
                initializing=false;
                nextInitializationAttempt=Time.unscaledTime+30f;
                Debug.LogWarning("Rewarded video SDK unavailable: "+error.GetBaseException().Message);
                UnsubscribeInit();
            }
        }
        EventInfo Attach(Type owner,object source,string eventName,string callback,out Delegate listener)
        {
            listener=null;
            var evt=owner?.GetEvent(eventName,BindingFlags.Public|BindingFlags.Instance|BindingFlags.Static);
            var method=GetType().GetMethod(callback,BindingFlags.Instance|BindingFlags.NonPublic);
            if(evt==null||method==null)return null;
            // Delegate contravariance allows a generic object handler with
            // the SDK's strongly typed event arguments without code generation.
            listener=Delegate.CreateDelegate(evt.EventHandlerType,this,method,false);
            if(listener==null)return null;
            evt.AddEventHandler(source,listener);
            return evt;
        }
        static void Detach(EventInfo evt,object source,Delegate listener)
        {
            if(evt==null||listener==null)return;
            try{evt.RemoveEventHandler(source,listener);}catch{}
        }
        void UnsubscribeInit()
        {
            Detach(initSuccess,null,initSuccessHandler);
            Detach(initFailure,null,initFailureHandler);
            initSuccess=null;initFailure=null;
        }
        void OnInitSuccess(object ignored)
        {
            initializing=false;
            UnsubscribeInit();
            try
            {
                var constructor=rewardType.GetConstructors().FirstOrDefault(c=>{
                    var args=c.GetParameters();return args.Length>=1&&args[0].ParameterType==typeof(string)&&
                        args.Skip(1).All(a=>a.IsOptional||!a.ParameterType.IsValueType);
                });
                if(constructor==null)throw new MissingMethodException("LevelPlay rewarded constructor");
                var parameters=constructor.GetParameters();
                var values=new object[parameters.Length];values[0]=config.RewardedId;
                for(int i=1;i<values.Length;i++)values[i]=parameters[i].HasDefaultValue?
                    parameters[i].DefaultValue:null;
                rewardedAd=constructor.Invoke(values);
                loadedEvent=Attach(rewardType,rewardedAd,"OnAdLoaded",nameof(OnLoaded),out loadedHandler);
                loadFailedEvent=Attach(rewardType,rewardedAd,"OnAdLoadFailed",nameof(OnLoadFailed),out loadFailedHandler);
                displayedEvent=Attach(rewardType,rewardedAd,"OnAdDisplayed",nameof(OnDisplayed),out displayedHandler);
                displayFailedEvent=Attach(rewardType,rewardedAd,"OnAdDisplayFailed",nameof(OnDisplayFailed),out displayFailedHandler);
                earnedEvent=Attach(rewardType,rewardedAd,"OnAdRewarded",nameof(OnRewarded),out earnedHandler);
                closedEvent=Attach(rewardType,rewardedAd,"OnAdClosed",nameof(OnClosed),out closedHandler);
                if(earnedEvent==null||closedEvent==null||displayedEvent==null||displayFailedEvent==null)
                    throw new InvalidOperationException("Rewarded callback wiring incomplete");
                initialized=true;
                Reload();
            }
            catch(Exception error)
            {
                initialized=false;
                rewardedAd=null;
                Debug.LogError("LevelPlay callback setup failed: "+error.GetBaseException().Message);
            }
        }
        void OnInitFailed(object error)
        {
            initializing=false;
            nextInitializationAttempt=Time.unscaledTime+30f;
            UnsubscribeInit();
            Debug.LogWarning("LevelPlay initialization failed: "+error);
        }
        bool TryReady()
        {
            try{return (bool)rewardType.GetMethod("IsAdReady",Type.EmptyTypes).Invoke(rewardedAd,null);}
            catch{return false;}
        }
        void Reload()
        {
            if(!initialized||rewardedAd==null||!NativeAdPrivacy.CanInitialize(config)||loading)return;
            try{loading=true;rewardType.GetMethod("LoadAd",Type.EmptyTypes)?.Invoke(rewardedAd,null);}
            catch(Exception ex){loading=false;Debug.LogWarning("LevelPlay load failed: "+ex.GetBaseException().Message);}
        }
        void OnLoaded(object ad){loading=false;}
        void OnLoadFailed(object error)
        {
            loading=false;
            if(NativeAdPrivacy.CanInitialize(config))Invoke(nameof(Reload),25f);
        }
        void Finish(RewardProviderResult result)
        {
            var completion=pending;
            if(completion==null)return;
            pending=null;currentTransaction=null;
            pendingCancellation.Dispose();
            if(closingGrace!=null){StopCoroutine(closingGrace);closingGrace=null;}
            completion.TrySetResult(result);
        }
        void OnDisplayed(object adInfo){if(pending!=null)wasDisplayed=true;}
        // The SDK completion callback AND a displayed ad are required. Closing,
        // loading and readiness alone cannot mint any game currency.
        void OnRewarded(object adInfo,object reward)
        {
            if(!wasDisplayed||pending==null||!NativeAdPrivacy.CanInitialize(config))return;
            object amount=reward?.GetType().GetProperty("Amount")?.GetValue(reward);
            if(amount==null)return;
            double value;
            try{value=Convert.ToDouble(amount,System.Globalization.CultureInfo.InvariantCulture);}
            catch{return;}
            if(value>0&&!double.IsInfinity(value)&&!double.IsNaN(value))
                Finish(RewardProviderResult.Success);
        }
        void OnDisplayFailed(object adInfo,object error)
        {
            loading=false;
            Finish(RewardProviderResult.Failed);
            Reload();
        }
        void OnClosed(object adInfo)
        {
            loading=false;
            // Some networks send OnAdRewarded just AFTER OnAdClosed.
            // Leave a bounded grace period; OnAdClosed itself grants nothing.
            if(pending!=null&&closingGrace==null)closingGrace=StartCoroutine(ClosedWithoutReward());
            Reload();
        }
        IEnumerator ClosedWithoutReward()
        {
            yield return new WaitForSecondsRealtime(2f);
            closingGrace=null;
            Finish(RewardProviderResult.Cancelled);
        }
        public Task<RewardProviderResult> ShowAsync(string placement,string transaction,CancellationToken cancellation)
        {
            if(cancellation.IsCancellationRequested)return Task.FromResult(RewardProviderResult.Cancelled);
            if(!Ready||pending!=null||string.IsNullOrEmpty(transaction))
                return Task.FromResult(RewardProviderResult.Unavailable);
            wasDisplayed=false;
            pending=new TaskCompletionSource<RewardProviderResult>(TaskCreationOptions.RunContinuationsAsynchronously);
            var request=pending.Task;
            currentTransaction=transaction;
            pendingCancellation=cancellation.Register(()=>pending?.TrySetResult(RewardProviderResult.Cancelled));
            try
            {
                // One rewarded unit for the five domain reward placements; the
                // pending transaction identifies the exact reward already quoted.
                var show=rewardType.GetMethods().FirstOrDefault(m=>m.Name=="ShowAd" &&
                    m.GetParameters().Length<=1);
                if(show==null)throw new MissingMethodException("LevelPlay ShowAd");
                show.Invoke(rewardedAd,show.GetParameters().Length==0?null:new object[]{null});
            }
            catch(Exception error)
            {
                Debug.LogWarning("LevelPlay show failed: "+error.GetBaseException().Message);
                Finish(RewardProviderResult.Failed);
            }
            return request;
        }
        void OnDestroy()
        {
            CancelInvoke();Finish(RewardProviderResult.Cancelled);
            Detach(loadedEvent,rewardedAd,loadedHandler);Detach(loadFailedEvent,rewardedAd,loadFailedHandler);
            Detach(displayedEvent,rewardedAd,displayedHandler);Detach(displayFailedEvent,rewardedAd,displayFailedHandler);Detach(earnedEvent,rewardedAd,earnedHandler);
            Detach(closedEvent,rewardedAd,closedHandler);UnsubscribeInit();
            try{rewardType?.GetMethod("DestroyAd",Type.EmptyTypes)?.Invoke(rewardedAd,null);}catch{}
        }
    }
}
