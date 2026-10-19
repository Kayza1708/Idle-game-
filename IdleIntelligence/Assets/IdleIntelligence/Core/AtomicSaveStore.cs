using System;
using System.IO;
using System.Security.Cryptography;
using System.Text;
namespace IdleIntelligence.Core
{
    public interface ISaveCodec { string Encode(StateData data); StateData Decode(string json); }
    [Serializable] public sealed class SaveEnvelope { public string format;public int version;public string payload,sha256; }
    public interface IEnvelopeCodec : ISaveCodec { string EncodeEnvelope(SaveEnvelope data);SaveEnvelope DecodeEnvelope(string json); }
    public sealed class SaveLoad
    {
        public GameState State;public bool Writable;public string Message;public bool Recovered;
    }
    public sealed class AtomicSaveStore
    {
        public const int Version=3;
        public const string Format="idle-intelligence-unity-slice";
        readonly string path;readonly IEnvelopeCodec codec;
        bool writable;
        public string PathName=>path;
        public AtomicSaveStore(string path,IEnvelopeCodec codec) {this.path=path;this.codec=codec;}
        static string Hash(string payload) {using(var sha=SHA256.Create())return BitConverter.ToString(sha.ComputeHash(Encoding.UTF8.GetBytes(payload))).Replace("-","").ToLowerInvariant();}
        GameState Read(string filename)=>Read(filename,out _);
        GameState Read(string filename,out int version)
        {
            version=0;var info=new FileInfo(filename);if(info.Length>4*1024*1024)throw new FormatException("Save too large");
            var envelope=codec.DecodeEnvelope(File.ReadAllText(filename));
            if(envelope==null||envelope.format!=Format||envelope.version!=Version&&envelope.version!=1&&envelope.version!=2)throw new NotSupportedException("Unbekannte Spielstandversion; Original bleibt erhalten.");
            if(envelope.payload==null||envelope.sha256!=Hash(envelope.payload))throw new FormatException("Spielstand-Prüfsumme ungültig.");
            version=envelope.version;return codec.Decode(envelope.payload).ToState(version==1,version==2);
        }
        public SaveLoad Load(double now)
        {
            writable=false;
            try
            {
                if(!File.Exists(path))
                {
                    // A crash before the first commit must not destroy its pending payload.
                    if(File.Exists(path+".pending")||File.Exists(path+".backup"))return new SaveLoad{Message="Hauptstand fehlt. Vorhandene Recoverydateien sichern; Speichern gesperrt."};
                    writable=true;return new SaveLoad{State=Game.New(now),Writable=true};
                }
                try {var s=Read(path,out int loadedVersion);if(File.Exists(path+".pending"))return new SaveLoad{State=s,Message="Unterbrochener Schreibvorgang vorhanden; Original und Pendingdatei bleiben erhalten. Speichern gesperrt."};if(loadedVersion<Version){string original=File.ReadAllText(path),copy=path+".v"+loadedVersion+"-original-"+Hash(original);if(!File.Exists(copy))File.Copy(path,copy,false);else if(File.ReadAllText(copy)!=original)throw new IOException("Migrationskopie stimmt nicht überein.");}writable=true;return new SaveLoad{State=s,Writable=true};}
                catch(NotSupportedException){throw;}
                catch(Exception error) when(error is IOException||error is FormatException||error is ArgumentException||error is NullReferenceException||error is OverflowException)
                {
                    // Recovery is read-only: never replace the damaged original automatically.
                    if(File.Exists(path+".backup"))return new SaveLoad{State=Read(path+".backup"),Recovered=true,Message="Backup geladen. Beschädigtes Original bleibt erhalten; Speichern gesperrt."};
                    throw;
                }
            }
            catch(Exception error) {return new SaveLoad{Message=error.Message,Writable=false};}
        }
        public void Save(GameState state)
        {
            if(!writable)throw new InvalidOperationException("Speichern gesperrt; Originaldateien zuerst sichern.");
            Game.Validate(state);
            string parent=System.IO.Path.GetDirectoryName(path);if(!string.IsNullOrEmpty(parent))Directory.CreateDirectory(parent);
            // Recheck the disk before every write, including external replacement after load.
            if(File.Exists(path))Read(path);
            string payload=codec.Encode(StateData.From(state));
            string json=codec.EncodeEnvelope(new SaveEnvelope{format=Format,version=Version,payload=payload,sha256=Hash(payload)});
            byte[] bytes=Encoding.UTF8.GetBytes(json);
            using(var stream=new FileStream(path+".pending",FileMode.CreateNew,FileAccess.Write,FileShare.None)){stream.Write(bytes,0,bytes.Length);stream.Flush(true);}
            Read(path+".pending");
            // Same-volume replace atomically updates main and retains its previous contents.
            if(File.Exists(path))File.Replace(path+".pending",path,path+".backup");
            else File.Move(path+".pending",path);
        }
    }
}
