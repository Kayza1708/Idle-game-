using System;
using System.IO;
using System.IO.Compression;
using System.Security.Cryptography;
using System.Text;
namespace IdleIntelligence.Core
{
    // Transport only. Never merges currencies, receipts, elapsed time or progression.
    // A download remains an untrusted original until AtomicSaveStore validates it.
    public static class CloudSnapshotStore
    {
        public const int MaxPackedBytes=2*1024*1024,MaxRawBytes=32*1024*1024;
        static readonly byte[] Header=Encoding.ASCII.GetBytes("IDLE-CLOUD-1\n");
        public static string Hash(byte[] value){using(var sha=SHA256.Create())return BitConverter.ToString(sha.ComputeHash(value)).Replace("-","").ToLowerInvariant();}
        public static byte[] Pack(byte[] nativeSave)
        {
            if(nativeSave==null||nativeSave.Length==0||nativeSave.Length>MaxRawBytes)throw new InvalidDataException("Invalid cloud snapshot size");
            using(var output=new MemoryStream())
            {
                output.Write(Header,0,Header.Length);
                using(var gzip=new GZipStream(output,CompressionMode.Compress,true))gzip.Write(nativeSave,0,nativeSave.Length);
                if(output.Length>MaxPackedBytes)throw new InvalidDataException("Cloud snapshot exceeds transport limit; local originals retained");
                return output.ToArray();
            }
        }
        public static byte[] Unpack(byte[] packed)
        {
            if(packed==null||packed.Length<=Header.Length||packed.Length>MaxPackedBytes)throw new InvalidDataException("Invalid cloud snapshot size");
            for(int i=0;i<Header.Length;i++)if(packed[i]!=Header[i])throw new NotSupportedException("Unknown cloud snapshot format; original retained");
            using(var input=new MemoryStream(packed,Header.Length,packed.Length-Header.Length))
            using(var gzip=new GZipStream(input,CompressionMode.Decompress))
            using(var output=new MemoryStream())
            {
                var buffer=new byte[16384];int count;
                while((count=gzip.Read(buffer,0,buffer.Length))>0){if(output.Length+count>MaxRawBytes)throw new InvalidDataException("Cloud snapshot expands beyond save limit");output.Write(buffer,0,count);}
                if(output.Length==0)throw new InvalidDataException("Empty cloud snapshot");return output.ToArray();
            }
        }
        public static AtomicSaveStore.Candidate Stage(byte[] packed,string directory,AtomicSaveStore store)
        {
            Directory.CreateDirectory(directory);string stem=Path.Combine(directory,"cloud-"+Hash(packed));
            Preserve(stem+".cloud",packed); // Preserve even an invalid or unsupported download.
            byte[] raw=Unpack(packed);string path=stem+".json";Preserve(path,raw);
            var candidate=store.Inspect(path);if(!candidate.Valid)throw new InvalidDataException(candidate.Message);
            return candidate;
        }
        static void Preserve(string path,byte[] bytes)
        {
            if(File.Exists(path)){if(Hash(File.ReadAllBytes(path))!=Hash(bytes))throw new IOException("Cloud original collision");return;}
            using(var file=new FileStream(path,FileMode.CreateNew,FileAccess.Write,FileShare.None)){file.Write(bytes,0,bytes.Length);file.Flush(true);}
        }
    }
}
