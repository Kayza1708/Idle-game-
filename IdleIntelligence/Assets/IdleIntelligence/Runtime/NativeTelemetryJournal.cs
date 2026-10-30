using System;
using System.IO;
using IdleIntelligence.Core;
using UnityEngine;

namespace IdleIntelligence.Runtime
{
    /// <summary>
    /// Consent-gated and bounded local retry journal for anonymous analytics.
    /// No account, token, name, email, IP, inventory, balances or crash traces.
    /// Files are purged on consent withdrawal, corrupt input or invalid schema.
    /// </summary>
    public sealed class NativeTelemetryJournal
    {
        const long MaxBytes=32768;
        readonly string path;
        public NativeTelemetryJournal(string path)
        {
            if(string.IsNullOrWhiteSpace(path))throw new ArgumentException("Journal path missing",nameof(path));
            this.path=path;
        }
        public bool Restore(NativeTelemetryQueue queue)
        {
            if(queue==null||!queue.Consent){Purge();return false;}
            if(!File.Exists(path))return true;
            try
            {
                if(new FileInfo(path).Length>MaxBytes){Purge();return false;}
                string raw=File.ReadAllText(path);
                var saved=JsonUtility.FromJson<NativeTelemetrySnapshot>(raw);
                if(queue.Restore(saved))return true;
            }
            catch(Exception e){Debug.LogWarning("Anonymous analytics journal unreadable: "+e.GetType().Name);}
            Purge();return false;
        }
        public void Store(NativeTelemetryQueue queue)
        {
            if(queue==null||!queue.Consent||queue.Count==0){Purge();return;}
            string temp=path+".pending";
            try
            {
                Directory.CreateDirectory(Path.GetDirectoryName(path));
                var json=JsonUtility.ToJson(queue.Export());
                if(System.Text.Encoding.UTF8.GetByteCount(json)>MaxBytes)
                    throw new IOException("Analytics journal is too large");
                File.WriteAllText(temp,json);
                if(File.Exists(path))File.Replace(temp,path,null);
                else File.Move(temp,path);
            }
            catch(Exception e)
            {
                Debug.LogWarning("Cannot persist anonymous analytics: "+e.GetType().Name);
                try{if(File.Exists(temp))File.Delete(temp);}catch{}
            }
        }
        public void Purge()
        {
            foreach(var candidate in new[]{path,path+".pending"})
                try{if(File.Exists(candidate))File.Delete(candidate);}catch(Exception e)
                {Debug.LogWarning("Cannot erase opt-out analytics journal: "+e.GetType().Name);}
        }
    }
}
