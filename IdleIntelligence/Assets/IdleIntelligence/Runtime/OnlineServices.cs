using System;
using System.Collections;
using System.Linq;
using System.IO;
using System.Runtime.InteropServices;
using IdleIntelligence.Core;
using UnityEngine;

namespace IdleIntelligence.Runtime
{
    /// <summary>
    /// Optional native cloud connection. Without configured HTTPS or login the
    /// complete single-player Unity game remains offline. No server mutation
    /// can turn local INT, Gems or equipment into verified trade currency.
    /// </summary>
    public sealed class OnlineServices:MonoBehaviour
    {
        const string ConsentKey="idle-intelligence-usage-statistics-opt-in-v1";
        [Serializable] sealed class AccountResponse
        {public string accessToken,provider;public long expiresAt;}
        [Serializable] sealed class ChallengeResponse
        {public string challenge,nonceHash;public long expiresAt;}
        GameRuntime game;
        CompanyApiClient api;
        OnlineServicesConfiguration config;
        readonly NativeTelemetryQueue events=new NativeTelemetryQueue();
        NativeTelemetryJournal journal;
        NativeLiveOpsSnapshot latest;
        float nextLiveOps,nextFlush;
        bool requesting,telemetrySending,sessionEnded;
        string lastScreen="",status="Offline",appleChallenge="";
        Action<bool> appleResult;
#if UNITY_IOS && !UNITY_EDITOR
        [DllImport("__Internal")] static extern void IIRequestAppleIdentity(string receiver,string nonceHash);
#endif
        public CompanyApiClient Client=>api;
        public bool Configured=>config!=null&&config.Valid;
        public bool Authenticated=>api!=null&&api.HasSession;
        public bool AnalyticsAllowed=>events.Consent;
        public string Status=>status;
        public NativeLiveOpsSnapshot LiveOps=>latest;
        public bool Maintenance=>NativeLiveOpsRules.Valid(latest)&&latest.maintenance;
        public bool NeedsUpdate=>NativeLiveOpsRules.UpdateRequired(latest);
        public void Initialize(GameRuntime runtime)
        {
            game=runtime;
            config=Resources.Load<OnlineServicesConfiguration>("OnlineServicesConfiguration");
            api=GetComponent<CompanyApiClient>()??gameObject.AddComponent<CompanyApiClient>();
            var endpoint=Configured?config.cloudflareApiUrl.TrimEnd('/'):null;
            api.Configure(endpoint,Configured?NativeCredentialVault.Read():"");
            events.SetConsent(PlayerPrefs.GetInt(ConsentKey,0)==1);
            journal=new NativeTelemetryJournal(Path.Combine(Application.persistentDataPath,
                "idle-intelligence-anonymous-telemetry-v1.json"));
            journal.Restore(events);
            events.Changed+=PersistTelemetry;
            status=Configured?(Authenticated?"Gesicherte Sitzung geladen":"Onlinekonto nicht verbunden"):
                "Offline: Cloudflare HTTPS-URL noch nicht eingerichtet";
            if(Authenticated)events.Record("session_start");
            nextFlush=Time.unscaledTime+20f;
            nextLiveOps=Time.unscaledTime+2f;
        }
        void PersistTelemetry(){journal?.Store(events);}
        public void SetAnalyticsConsent(bool value)
        {
            PlayerPrefs.SetInt(ConsentKey,value?1:0);
            PlayerPrefs.Save();
            events.SetConsent(value);
            if(!value)journal?.Purge();
            if(value&&Authenticated)events.Record("session_start");
        }
        public void Disconnect()
        {
            NativeCredentialVault.Clear();
            api?.ClearSession();
            events.SetConsent(false);
            PlayerPrefs.SetInt(ConsentKey,0);
            PlayerPrefs.Save();
            status="Onlinekonto getrennt";
        }
        public void CreateGuestAccount(Action<bool> finished=null)
        {
            if(!Configured||requesting||Authenticated){finished?.Invoke(false);return;}
            requesting=true;
            StartCoroutine(api.CreateGuest((code,json)=>{
                requesting=false;
                if(code<200||code>=300){status="Gastkonto konnte nicht erstellt werden.";finished?.Invoke(false);return;}
                AccountResponse reply;
                try{reply=JsonUtility.FromJson<AccountResponse>(json);}catch{reply=null;}
                if(reply==null||!IsToken(reply.accessToken))
                {status="Ungültige Serverantwort.";finished?.Invoke(false);return;}
                bool persisted=NativeCredentialVault.Store(reply.accessToken);
                api.Configure(config.cloudflareApiUrl.TrimEnd('/'),reply.accessToken);
                status=persisted?"Gastkonto verbunden · Fortschritt lokal":
                    "Gastkonto für diese Sitzung verbunden; sichere Speicherung nicht verfügbar";
                events.Record("session_start");
                finished?.Invoke(true);
            }));
        }
        static bool IsToken(string value)
        {
            if(value==null||value.Length!=43)return false;
            return value.All(c=>char.IsLetterOrDigit(c)||c=='-'||c=='_');
        }
        public void BeginProviderChallenge(string provider,Action<bool,string,string> completed)
        {
            if(!Configured||requesting||!(provider=="apple"||provider=="google")){
                completed?.Invoke(false,null,null);return;
            }
            requesting=true;
            StartCoroutine(api.AuthChallenge((code,json)=>{
                requesting=false;
                if(code<200||code>=300){completed?.Invoke(false,null,null);return;}
                ChallengeResponse reply;
                try{reply=JsonUtility.FromJson<ChallengeResponse>(json);}catch{reply=null;}
                if(reply==null||!IsToken(reply.challenge)||string.IsNullOrEmpty(reply.nonceHash)){
                    completed?.Invoke(false,null,null);return;
                }
                completed?.Invoke(true,reply.challenge,reply.nonceHash);
            }));
        }
        /// <summary>
        /// Called ONLY after a real native Apple / Google account provider
        /// returns its ID token for the exact server-issued one-time nonce.
        /// This function alone is not proof: Cloudflare verifies JWS+JWKS.
        /// </summary>
        public void FinishProviderLogin(string provider,string challenge,string idToken,
            Action<bool> finished)
        {
            if(!Configured||requesting||!IsToken(challenge)||string.IsNullOrEmpty(idToken)||
                (provider!="apple"&&provider!="google")){finished?.Invoke(false);return;}
            requesting=true;
            IEnumerator operation=Authenticated?
                api.ProviderLink(provider,challenge,idToken,(code,json)=>{
                    requesting=false;status=code>=200&&code<300?"Kontoanbieter verknüpft":
                        "Kontoverknüpfung abgelehnt";finished?.Invoke(code>=200&&code<300);
                }):
                api.ProviderLogin(provider,challenge,idToken,(code,json)=>{
                    requesting=false;
                    if(code<200||code>=300){status="Server hat Identität nicht bestätigt";finished?.Invoke(false);return;}
                    AccountResponse result;
                    try{result=JsonUtility.FromJson<AccountResponse>(json);}catch{result=null;}
                    if(result==null||!IsToken(result.accessToken))
                    {status="Identitätsantwort ungültig";finished?.Invoke(false);return;}
                    bool saved=NativeCredentialVault.Store(result.accessToken);
                    api.Configure(config.cloudflareApiUrl.TrimEnd('/'),result.accessToken);
                    status=saved?"Identität serverseitig bestätigt":
                        "Identität bestätigt, aber sichere Sitzung konnte nicht gespeichert werden";
                    events.Record("session_start");
                    finished?.Invoke(true);
                });
            StartCoroutine(operation);
        }
        /// <summary>
        /// Only a signed-in Google Play Games Services v11 device may supply a
        /// single-use server authorization code. The Worker exchanges it using
        /// a confidential WEB OAuth client secret and calls Games players/me.
        /// This method does not trust locally reported Google player IDs.
        /// </summary>
        public void FinishPlayGamesLogin(string challenge,string serverAuthCode,
            Action<bool> finished)
        {
            if(!Configured||requesting||!IsToken(challenge)||
               string.IsNullOrEmpty(serverAuthCode)){finished?.Invoke(false);return;}
            requesting=true;
            var linking=Authenticated;
            StartCoroutine(api.PlayGamesLogin(challenge,serverAuthCode,linking,(code,json)=>{
                requesting=false;
                if(code<200||code>=300){
                    status="Google Play Games: Serveridentität nicht bestätigt";
                    finished?.Invoke(false);return;
                }
                if(linking){
                    status="Play Games sicher mit Konto verknüpft";
                    finished?.Invoke(true);return;
                }
                AccountResponse result;
                try{result=JsonUtility.FromJson<AccountResponse>(json);}catch{result=null;}
                if(result==null||!IsToken(result.accessToken)){
                    status="Play Games: ungültige Serverantwort";
                    finished?.Invoke(false);return;
                }
                var stored=NativeCredentialVault.Store(result.accessToken);
                api.Configure(config.cloudflareApiUrl.TrimEnd('/'),result.accessToken);
                status=stored?"Play Games serverseitig bestätigt":
                    "Play Games verbunden; sichere Sitzungsspeicherung fehlt";
                events.Record("session_start");
                finished?.Invoke(true);
            }));
        }
        public void SignInWithPlayGames(Action<bool> finished)
        {
            if(game==null||!Configured){finished?.Invoke(false);return;}
            var provider=GetComponent<NativePlayGamesLogin>()??
                gameObject.AddComponent<NativePlayGamesLogin>();
            provider.Begin(this,finished);
        }
        public void SignInWithApple(Action<bool> finished)
        {
#if UNITY_IOS && !UNITY_EDITOR
            if(!Configured||requesting||appleResult!=null){finished?.Invoke(false);return;}
            BeginProviderChallenge("apple",(okay,challenge,nonceHash)=>{
                if(!okay){status="Apple-Anmeldechallenge konnte nicht erstellt werden";finished?.Invoke(false);return;}
                appleChallenge=challenge;appleResult=finished;
                try{IIRequestAppleIdentity(gameObject.name,nonceHash);}
                catch(Exception){appleChallenge="";appleResult=null;status="Apple Sign-in nicht eingerichtet";finished?.Invoke(false);}
            });
#else
            status="Apple-Anmeldung benötigt einen provisionierten iOS-Gerätebuild";
            finished?.Invoke(false);
#endif
        }
        [Serializable] sealed class AppleCredential
        {public string idToken,error;}
        // Callback from the native AuthorizationServices UI, never from an
        // unauthenticated Unity gameplay or save import path.
        public void OnAppleIdentityResult(string resultJson)
        {
            var completed=appleResult;appleResult=null;
            string challenge=appleChallenge;appleChallenge="";
            AppleCredential credential;
            try{credential=JsonUtility.FromJson<AppleCredential>(resultJson);}
            catch{credential=null;}
            if(completed==null||credential==null||string.IsNullOrEmpty(credential.idToken)||
               !IsToken(challenge))
            {
                status="Apple-Anmeldung abgebrochen oder fehlgeschlagen";
                completed?.Invoke(false);return;
            }
            FinishProviderLogin("apple",challenge,credential.idToken,completed);
        }
        public void RecordScreen(string screen)
        {
            if(screen==lastScreen||!events.Consent)return;
            lastScreen=screen;
            string[] tabs={"hardware","training","research","items","prestige",
              "models","challenges","shop","ads","store","company",
              "missions","seasons","profile","settings","story","storage"};
            int index=Array.IndexOf(tabs,screen);
            if(index>=0)events.Record("screen_view",index+1);
        }
        public void RecordAction(GameState before,GameState after,string action)
        {
            if(!events.Consent||before==null||after==null||
                object.ReferenceEquals(before,after))return;
            if(before.Lifetime.hardwareBought==0&&after.Lifetime.hardwareBought>0)
                events.Record("first_purchase");
            if(after.Prestige.resets>before.Prestige.resets)
                events.Record("prestige",(int)Math.Min(1000000000,after.Prestige.resets));
            if(after.Meta.resets>before.Meta.resets)
                events.Record("axiom_reset",(int)Math.Min(1000000000,after.Meta.resets));
            if(after.Lifetime.trainingCompleted>before.Lifetime.trainingCompleted)
                events.Record("training_complete");
            if(after.Lifetime.researchCompleted>before.Lifetime.researchCompleted)
                events.Record("research_complete");
            if(after.Workshop.inventory.Length>before.Workshop.inventory.Length&&
               (action=="craft"||action=="forge"||action=="item-craft"))
                events.Record("item_craft");
            // Do not report arbitrary action names or local credits/INT/Gems.
        }
        public void ReportAdAttempt(){events.Record("ad_request");}
        public void ReportAdOutcome(bool earned){events.Record(earned?"ad_reward":"ad_failed");}
        public void ReportVerifiedPurchase(){events.Record("iap_verified");}
        public void ReportCrashMarker(){events.Record("app_crash");}
        void Update()
        {
            if(api==null||!Configured)return;
            if(Time.unscaledTime>=nextLiveOps){
                nextLiveOps=Time.unscaledTime+900f;
                StartCoroutine(api.LiveOps((code,json)=>{
                    if(code<200||code>=300)return;
                    NativeLiveOpsSnapshot parsed;
                    try{parsed=JsonUtility.FromJson<NativeLiveOpsSnapshot>(json);}
                    catch{return;}
                    if(NativeLiveOpsRules.Valid(parsed))latest=parsed;
                }));
            }
            if(Time.unscaledTime>=nextFlush){
                nextFlush=Time.unscaledTime+20f;
                Flush();
            }
        }
        void Flush()
        {
            if(telemetrySending||!Authenticated||!events.Consent)return;
            var batch=events.NextBatch();
            if(batch.Length==0)return;
            telemetrySending=true;
            StartCoroutine(api.SubmitTelemetry(new NativeTelemetryBatch{events=batch},(code,_response)=>{
                telemetrySending=false;
                if(code>=200&&code<300)events.Acknowledge(batch.Select(e=>e.id));
                // On auth/network failures retain in bounded volatile queue until
                // next session, but never send after consent is withdrawn.
            }));
        }
        // End exactly once; an offline session-end event is delivered when the
        // user next reconnects. Explicit consent withdrawal still erases it.
        void EndSession()
        {
            if(sessionEnded)return;
            sessionEnded=true;
            if(events.Consent)events.Record("session_end");
        }
        void OnApplicationQuit(){EndSession();}
        void OnDestroy(){EndSession();events.Changed-=PersistTelemetry;latest=null;}
    }
}
