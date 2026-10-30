using System;
using UnityEngine;
#if UNITY_ANDROID && IDLE_GOOGLE_PLAY_GAMES
using System.Collections.Generic;
using GooglePlayGames;
using GooglePlayGames.BasicApi;
#endif
namespace IdleIntelligence.Runtime
{
    /// <summary>
    /// Optional Play Games Services v11 adapter. The Google Play Games plugin
    /// must be imported by Unity and IDLE_GOOGLE_PLAY_GAMES defined explicitly
    /// after compiling the vendor API. No fake sign-in in Editor.
    ///
    /// Requires: Play Games Services v2, provisioned Android credential and
    /// an OAuth WEB server client ID registered in Google Play Console.
    /// </summary>
    public sealed class NativePlayGamesLogin:MonoBehaviour
    {
        bool active;
        public void Begin(OnlineServices online,Action<bool> completed)
        {
            if(active||online==null){completed?.Invoke(false);return;}
#if UNITY_ANDROID && IDLE_GOOGLE_PLAY_GAMES && !UNITY_EDITOR
            active=true;
            online.BeginProviderChallenge("playgames",(ok,challenge,nonceHash)=>{
                if(!ok){active=false;completed?.Invoke(false);return;}
                try{
                    PlayGamesPlatform.Instance.Authenticate(status=>{
                        if(status!=SignInStatus.Success){
                            active=false;completed?.Invoke(false);return;
                        }
                        // No email or profile scope needed: only the one-time
                        // authorization code to check Games Player ID server-side.
                        PlayGamesPlatform.Instance.RequestServerSideAccess(
                            false,new List<AuthScope>(),response=>{
                                string authCode=response?.GetAuthCode();
                                if(string.IsNullOrEmpty(authCode)){
                                    active=false;completed?.Invoke(false);return;
                                }
                                online.FinishPlayGamesLogin(challenge,authCode,result=>{
                                    active=false;completed?.Invoke(result);
                                });
                            });
                    });
                }catch(Exception error){
                    active=false;Debug.LogWarning("Play Games login unavailable: "+
                        error.GetType().Name);
                    completed?.Invoke(false);
                }
            });
#else
            Debug.LogWarning("Google Play Games login requires PGS Unity v11 Android plugin, "+
                "Play Console OAuth setup and IDLE_GOOGLE_PLAY_GAMES scripting define. "+
                "No simulated sign-in granted.");
            completed?.Invoke(false);
#endif
        }
    }
}
