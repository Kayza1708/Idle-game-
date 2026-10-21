using System;
using System.IO;
using System.Security.Cryptography;
using System.Text;
using System.Linq;
namespace IdleIntelligence.Core
{
    public interface ISaveCodec { string Encode(StateData data); StateData Decode(string json); }
    [Serializable] public sealed class SaveEnvelope { public string format;public int version;public string payload,sha256; }
    public interface IEnvelopeCodec : ISaveCodec { string EncodeEnvelope(SaveEnvelope data);SaveEnvelope DecodeEnvelope(string json); }
    public interface IVersionedSaveCodec:IEnvelopeCodec {StateData Decode(string json,int version);}
    public sealed class SaveLoad
    {
        public GameState State;public bool Writable;public string Message;public bool Recovered;
    }
    public sealed class AtomicSaveStore
    {
        public const int Version=18;
        public const string Format="idle-intelligence-unity-slice";
        readonly string path;readonly IEnvelopeCodec codec;
        bool writable;string diskHash;
        public string PathName=>path;
        public AtomicSaveStore(string path,IEnvelopeCodec codec) {this.path=path;this.codec=codec;}
        static string Hash(string payload) {using(var sha=SHA256.Create())return BitConverter.ToString(sha.ComputeHash(Encoding.UTF8.GetBytes(payload))).Replace("-","").ToLowerInvariant();}
        static bool ResearchIdentities(MainStateData d)=>d!=null&&(!d.hasResearchJob||d.researchJob?.identityRecorded==true)&&d.prestige?.labs!=null&&System.Linq.Enumerable.All(d.prestige.labs,j=>j?.identityRecorded==true);
        GameState Read(string filename)=>Read(filename,out _);
        GameState Read(string filename,out int version)
        {
            var info=new FileInfo(filename);if(info.Length>32*1024*1024)throw new FormatException("Save too large");return ReadJson(new UTF8Encoding(false,true).GetString(File.ReadAllBytes(filename)).TrimStart('\uFEFF'),out version);
        }
        GameState ReadJson(string json,out int version)
        {
            version=0;
            var envelope=codec.DecodeEnvelope(json);
            if(envelope==null||envelope.format!=Format||envelope.version!=Version&&envelope.version!=1&&envelope.version!=2&&envelope.version!=3&&envelope.version!=4&&envelope.version!=5&&envelope.version!=6&&envelope.version!=7&&envelope.version!=8&&envelope.version!=9&&envelope.version!=10&&envelope.version!=11&&envelope.version!=12&&envelope.version!=13&&envelope.version!=14&&envelope.version!=15&&envelope.version!=16&&envelope.version!=17)throw new NotSupportedException("Unbekannte Spielstandversion; Original bleibt erhalten.");
            if(envelope.payload==null||envelope.sha256!=Hash(envelope.payload))throw new FormatException("Spielstand-Prüfsumme ungültig.");
            version=envelope.version;var decoded=codec is IVersionedSaveCodec versioned?versioned.Decode(envelope.payload,version):codec.Decode(envelope.payload);if(version>=7&&(decoded.lifetime==null||decoded.lifetime.schema!=1||!decoded.lifetime.initialized||decoded.hasChallenge&&(decoded.challengeMain?.lifetime==null||!decoded.challengeMain.lifetime.initialized)))throw new FormatException("Missing lifetime state");if(version>=8&&(!decoded.modelLevelRecorded||decoded.retention==null||!decoded.retention.initialized||decoded.hasChallenge&&(decoded.challengeMain?.retention==null||!decoded.challengeMain.retention.initialized||!decoded.challengeMain.modelLevelRecorded)))throw new FormatException("Missing retention state");if(version>=9&&(decoded.missions==null||!decoded.missions.initialized||decoded.hasChallenge&&(decoded.challengeMain?.missions==null||!decoded.challengeMain.missions.initialized)))throw new FormatException("Missing missions state");if(version>=10&&(decoded.rewards==null||!decoded.rewards.initialized||decoded.hasChallenge&&(decoded.challengeMain?.rewards==null||!decoded.challengeMain.rewards.initialized)))throw new FormatException("Missing season reward state");if(version>=11&&(decoded.signals==null||!decoded.signals.initialized||decoded.hasChallenge&&(decoded.challengeMain?.signals==null||!decoded.challengeMain.signals.initialized)))throw new FormatException("Missing signal state");if(version>=12&&(decoded.market==null||!decoded.market.initialized||decoded.rewards.hasReceipt&&decoded.rewards.receipt?.metadataRecorded!=true||decoded.hasChallenge&&(decoded.challengeMain?.market==null||!decoded.challengeMain.market.initialized||decoded.challengeMain.rewards.hasReceipt&&decoded.challengeMain.rewards.receipt?.metadataRecorded!=true)))throw new FormatException("Missing market state");if(version>=13&&(decoded.upgrades==null||!decoded.upgrades.initialized||decoded.capsules==null||!decoded.capsules.initialized||decoded.hasChallenge&&(decoded.challengeMain?.upgrades==null||!decoded.challengeMain.upgrades.initialized||decoded.challengeMain.capsules==null||!decoded.challengeMain.capsules.initialized)))throw new FormatException("Missing Gem features state");if(version>=14&&(decoded.commerce==null||!decoded.commerce.initialized||decoded.hasChallenge&&(decoded.challengeMain?.commerce==null||!decoded.challengeMain.commerce.initialized)))throw new FormatException("Missing commerce state");if(version>=15&&(!ResearchIdentities(decoded)||decoded.hasChallenge&&!ResearchIdentities(decoded.challengeMain)))throw new FormatException("Missing research identities");if(version>=15&&(decoded.ads==null||!decoded.ads.initialized||decoded.hasChallenge&&(decoded.challengeMain?.ads==null||!decoded.challengeMain.ads.initialized)))throw new FormatException("Missing ad state");if(version>=16&&(decoded.settings==null||!decoded.settings.initialized||decoded.hasChallenge&&(decoded.challengeMain?.settings==null||!decoded.challengeMain.settings.initialized)))throw new FormatException("Missing settings");if(version>=17&&(decoded.returnReceipt==null||!decoded.returnReceipt.initialized||!decoded.storyRecorded||decoded.story==null||!decoded.story.initialized||decoded.journal==null||!decoded.journal.initialized||decoded.hasChallenge&&(decoded.challengeMain?.returnReceipt==null||!decoded.challengeMain.returnReceipt.initialized||decoded.challengeMain.storyRecorded!=true||decoded.challengeMain.story==null||!decoded.challengeMain.story.initialized||decoded.challengeMain.journal==null||!decoded.challengeMain.journal.initialized)))throw new FormatException("Missing story or event journal");return decoded.ToState(version==1,version==2,version==3,version==4,version==5);
        }
        public SaveLoad Load(double now)
        {
            writable=false;
            try
            {
                if(!File.Exists(path))
                {
                    diskHash=null;
                    // A crash before the first commit must not destroy its pending payload.
                    if(File.Exists(path+".pending")||File.Exists(path+".backup"))return new SaveLoad{Message="Hauptstand fehlt. Vorhandene Recoverydateien sichern; Speichern gesperrt."};
                    writable=true;return new SaveLoad{State=Game.New(now,guided:true),Writable=true};
                }
                try {if(new FileInfo(path).Length>32*1024*1024)throw new FormatException("Save too large");var mainBytes=File.ReadAllBytes(path);var s=ReadJson(new UTF8Encoding(false,true).GetString(mainBytes).TrimStart('\uFEFF'),out int loadedVersion);diskHash=BytesHash(mainBytes);if(diskHash!=FileHash(path))throw new IOException("Save changed while loading");if(File.Exists(path+".pending"))return new SaveLoad{State=s,Message="Unterbrochener Schreibvorgang vorhanden; Original und Pendingdatei bleiben erhalten. Speichern gesperrt."};if(loadedVersion<Version){string original=File.ReadAllText(path),copy=path+".v"+loadedVersion+"-original-"+Hash(original);if(!File.Exists(copy))File.Copy(path,copy,false);else if(File.ReadAllText(copy)!=original)throw new IOException("Migrationskopie stimmt nicht überein.");}writable=true;return new SaveLoad{State=s,Writable=true};}
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
        public sealed class Candidate {public string Path,Hash,Message;public int Version;public bool Valid;public GameState State;}
        static string FileHash(string file){using(var sha=SHA256.Create())using(var stream=File.OpenRead(file))return BitConverter.ToString(sha.ComputeHash(stream)).Replace("-","").ToLowerInvariant();}
        static string BytesHash(byte[] bytes){using(var sha=SHA256.Create())return BitConverter.ToString(sha.ComputeHash(bytes)).Replace("-","").ToLowerInvariant();}
        public Candidate Inspect(string filename){var c=new Candidate{Path=filename};try{if(new FileInfo(filename).Length>32*1024*1024)throw new FormatException("Save too large");var raw=File.ReadAllBytes(filename);c.Hash=BytesHash(raw);c.State=ReadJson(new UTF8Encoding(false,true).GetString(raw).TrimStart('\uFEFF'),out int version);if(c.Hash!=BytesHash(File.ReadAllBytes(filename)))throw new IOException("Datei während der Prüfung geändert.");c.Version=version;c.Valid=true;c.Message="Gültiger Unity-Spielstand · v"+version;}catch(Exception e){c.Message=e.Message;}return c;}
        public string[] RecoveryFiles(){string dir=System.IO.Path.GetDirectoryName(path);if(!Directory.Exists(dir))return Array.Empty<string>();return Directory.GetFiles(dir,System.IO.Path.GetFileName(path)+"*").Where(f=>f==path||f==path+".backup"||f==path+".pending"||f.Contains("-original-")).OrderBy(f=>f).ToArray();}
        string EncodeState(GameState state){Game.Validate(state);string payload=codec.Encode(StateData.From(state));return codec.EncodeEnvelope(new SaveEnvelope{format=Format,version=Version,payload=payload,sha256=Hash(payload)});}
        public void Export(GameState state,string destination){string json=EncodeState(state);string parent=System.IO.Path.GetDirectoryName(destination);if(!string.IsNullOrEmpty(parent))Directory.CreateDirectory(parent);byte[] bytes=Encoding.UTF8.GetBytes(json);using(var file=new FileStream(destination,FileMode.CreateNew,FileAccess.Write,FileShare.None)){file.Write(bytes,0,bytes.Length);file.Flush(true);}Read(destination);}
        void Preserve(string original){if(!File.Exists(original))return;string hash=FileHash(original);string copy=original+".recovery-original-"+hash;if(!File.Exists(copy))File.Copy(original,copy,false);if(FileHash(copy)!=hash||FileHash(original)!=hash)throw new IOException("Originalkopie stimmt nicht überein.");}
        public GameState Recover(string source,string expectedHash){var c=Inspect(source);if(!c.Valid||c.Hash!=expectedHash)throw new InvalidOperationException("Recoverydatei ungültig oder seit der Vorschau geändert.");string json=EncodeState(c.State);byte[] bytes=Encoding.UTF8.GetBytes(json);foreach(string f in new[]{source,path,path+".backup",path+".pending"}.Distinct())Preserve(f);if(Inspect(source).Hash!=expectedHash)throw new IOException("Recoveryquelle während der Vorbereitung geändert.");string temp=path+".recovery-"+Guid.NewGuid().ToString("N");using(var file=new FileStream(temp,FileMode.CreateNew,FileAccess.Write,FileShare.None)){file.Write(bytes,0,bytes.Length);file.Flush(true);}Read(temp);if(File.Exists(path))File.Replace(temp,path,path+".replaced-original-"+Guid.NewGuid().ToString("N"));else File.Move(temp,path);if(File.Exists(path+".pending")){string retired=path+".retired-original-"+BytesHash(File.ReadAllBytes(path+".pending"));if(File.Exists(retired)){if(!File.ReadAllBytes(retired).SequenceEqual(File.ReadAllBytes(path+".pending")))throw new IOException("Pending-Originalkollision.");File.Delete(path+".pending");}else File.Move(path+".pending",retired);}writable=true;diskHash=FileHash(path);return Read(path);}
        public void Save(GameState state)
        {
            if(!writable)throw new InvalidOperationException("Speichern gesperrt; Originaldateien zuerst sichern.");
            Game.Validate(state);
            string parent=System.IO.Path.GetDirectoryName(path);if(!string.IsNullOrEmpty(parent))Directory.CreateDirectory(parent);
            // Recheck the disk before every write, including external replacement after load.
            if(File.Exists(path)){Read(path);if(diskHash==null||diskHash!=FileHash(path))throw new IOException("Spielstand extern verändert; Original bleibt erhalten.");}else if(diskHash!=null)throw new IOException("Spielstand extern entfernt; Recovery erforderlich.");
            string payload=codec.Encode(StateData.From(state));
            string json=codec.EncodeEnvelope(new SaveEnvelope{format=Format,version=Version,payload=payload,sha256=Hash(payload)});
            byte[] bytes=Encoding.UTF8.GetBytes(json);
            using(var stream=new FileStream(path+".pending",FileMode.CreateNew,FileAccess.Write,FileShare.None)){stream.Write(bytes,0,bytes.Length);stream.Flush(true);}
            Read(path+".pending");
            // Detect concurrent replacement again immediately before committing.
            if(File.Exists(path)&&diskHash!=FileHash(path))throw new IOException("Spielstand während des Speicherns verändert; Pending und Original bleiben erhalten.");
            // Same-volume replace atomically updates main and retains its previous contents.
            if(File.Exists(path))File.Replace(path+".pending",path,path+".backup");
            else File.Move(path+".pending",path);diskHash=BytesHash(bytes);
        }
    }
}
