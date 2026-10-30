using System;
using System.Runtime.InteropServices;
using UnityEngine;

namespace IdleIntelligence.Runtime
{
    // Only bearer sessions belong in the OS credential vault. No PlayerPrefs,
    // Unity save, screenshots or analytics can contain a bearer token.
    // The Editor deliberately keeps credentials only in memory.
    public static class NativeCredentialVault
    {
        static string editorSession="";
#if UNITY_IOS && !UNITY_EDITOR
        [DllImport("__Internal")] static extern IntPtr IIReadSession();
        [DllImport("__Internal")] static extern bool IIStoreSession(string token);
        [DllImport("__Internal")] static extern void IIClearSession();
        [DllImport("__Internal")] static extern void IIFreeSession(IntPtr value);
#endif
        public static string Read()
        {
#if UNITY_IOS && !UNITY_EDITOR
            IntPtr pointer=IntPtr.Zero;
            try{
                pointer=IIReadSession();
                return pointer==IntPtr.Zero?"":Marshal.PtrToStringAnsi(pointer)??"";
            }catch(Exception){return "";}finally{if(pointer!=IntPtr.Zero)IIFreeSession(pointer);}
#elif UNITY_ANDROID && !UNITY_EDITOR
            try{using(var activity=GetActivity())
            using(var storage=new AndroidJavaClass("com.idleintelligence.secure.CredentialVault"))
                return storage.CallStatic<string>("read",activity)??"";}
            catch(Exception){return "";}
#else
            return editorSession;
#endif
        }
        public static bool Store(string token)
        {
            if(string.IsNullOrEmpty(token)||token.Length!=43)return false;
            for(int i=0;i<token.Length;i++)
                if(!char.IsLetterOrDigit(token[i])&&token[i]!='-'&&token[i]!='_')return false;
#if UNITY_IOS && !UNITY_EDITOR
            try{return IIStoreSession(token);}catch(Exception){return false;}
#elif UNITY_ANDROID && !UNITY_EDITOR
            try{using(var activity=GetActivity())
            using(var storage=new AndroidJavaClass("com.idleintelligence.secure.CredentialVault"))
                return storage.CallStatic<bool>("store",activity,token);}
            catch(Exception){return false;}
#else
            editorSession=token;return true;
#endif
        }
        public static void Clear()
        {
#if UNITY_IOS && !UNITY_EDITOR
            try{IIClearSession();}catch(Exception){}
#elif UNITY_ANDROID && !UNITY_EDITOR
            try{using(var activity=GetActivity())
            using(var storage=new AndroidJavaClass("com.idleintelligence.secure.CredentialVault"))
                storage.CallStatic("clear",activity);}
            catch(Exception){}
#else
            editorSession="";
#endif
        }
#if UNITY_ANDROID && !UNITY_EDITOR
        static AndroidJavaObject GetActivity()
        {
            using(var player=new AndroidJavaClass("com.unity3d.player.UnityPlayer"))
                return player.GetStatic<AndroidJavaObject>("currentActivity");
        }
#endif
    }
}
