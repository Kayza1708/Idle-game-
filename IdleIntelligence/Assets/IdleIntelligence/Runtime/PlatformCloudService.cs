using System;
using System.Runtime.InteropServices;
using UnityEngine;
namespace IdleIntelligence.Runtime
{
    [Serializable] public sealed class CloudEntry {public string key,name,device;public double modified;}
    [Serializable] public sealed class CloudReply {public string request,error,payload;public bool ok;public CloudEntry[] entries;}
    public interface IPlatformCloudTransport {void Request(string receiver,string request,string operation,string value);}
    // Correlates replies and bounds a stalled platform operation; never invents a success.
    public sealed class PlatformCloudService:MonoBehaviour,IPlatformCloudTransport
    {
        Action<CloudReply> pending;string request;float deadline;IPlatformCloudTransport transport;
        public bool Busy=>pending!=null;
        public string Provider=>Application.platform==RuntimePlatform.IPhonePlayer?"Apple iCloud / GameKit":"Google Play Games Saved Games";
        public bool Available=>Application.platform==RuntimePlatform.IPhonePlayer;
        public string Unavailable=>Application.platform==RuntimePlatform.Android?"Google Play Games is not configured; no sign-in or upload is simulated.":"Platform cloud requires a provisioned physical mobile device; local saves remain available.";
        void Awake(){gameObject.name="PlatformCloud-"+Guid.NewGuid().ToString("N");transport=this;}
        public void ConfigureForTest(IPlatformCloudTransport value){transport=value;}
        public bool Begin(string operation,string value,Action<CloudReply> callback)
        {
            if(Busy)return false;
            request=Guid.NewGuid().ToString("N");pending=callback;deadline=Time.realtimeSinceStartup+30;
            try{transport.Request(gameObject.name,request,operation,value??"");}catch(Exception e){Complete(new CloudReply{error=e.Message});}return true;
        }
        public void OnCloudReply(string json)
        {
            CloudReply reply;try{reply=JsonUtility.FromJson<CloudReply>(json);}catch(Exception){return;}
            if(reply==null||reply.request!=request||!Busy)return;
            if(!reply.ok&&string.IsNullOrEmpty(reply.error))reply.error="Platform cloud returned an invalid response";
            Complete(reply);
        }
        void Complete(CloudReply reply){var callback=pending;pending=null;request=null;callback?.Invoke(reply);}
        void Update(){if(Busy&&Time.realtimeSinceStartup>=deadline)Complete(new CloudReply{error="Platform cloud timed out; local save retained. Refresh before retrying."});}
        void OnDestroy(){pending=null;request=null;}
#if UNITY_IOS && !UNITY_EDITOR
        [DllImport("__Internal")] static extern void IdleCloudRequest(string receiver,string request,string operation,string value);
#endif
        public void Request(string receiver,string token,string operation,string value)
        {
#if UNITY_IOS && !UNITY_EDITOR
            IdleCloudRequest(receiver,token,operation,value);
#else
            Complete(new CloudReply{error=Unavailable});
#endif
        }
    }
}
