using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Cryptography;
using System.Text;

namespace IdleIntelligence.Core
{
    /// <summary>
    /// Frozen canonical native C# catalogue manifests. These 25 committed
    /// datasets cover balance, 42-item native extensions, Prestige/Axiom,
    /// Missions, Seasons, translations and UI references. They compile and run
    /// without Node, Vite or the old TypeScript source tree.
    ///
    /// Hash = SHA-1 of the Git blob header + original byte contents.
    /// Updating a catalog requires an intentional manifest review. This is
    /// NOT a claim that old TypeScript vs Unity behavioral parity is complete.
    /// </summary>
    public static class NativeCatalogueManifest
    {
        public const int Version=1;
        public static readonly IReadOnlyDictionary<string,string> SourceBlobs=
            new Dictionary<string,string>(StringComparer.Ordinal)
        {
            { "IdleIntelligence/Assets/IdleIntelligence/Core/AdBalance.g.cs", "ee90709df4e2171e98fab3fe05bf1c064060c91d" },
            { "IdleIntelligence/Assets/IdleIntelligence/Core/Balance.g.cs", "b7caf979dc63adcae2bd32662520b439411ce524" },
            { "IdleIntelligence/Assets/IdleIntelligence/Core/ChallengeBalance.g.cs", "9cb757be420c77779e5172db00d3a825c542a3ef" },
            { "IdleIntelligence/Assets/IdleIntelligence/Core/CommerceBalance.g.cs", "73e691d7e228c9f5f5e5fc5bb24494a3b7a071df" },
            { "IdleIntelligence/Assets/IdleIntelligence/Core/CompatibilityCatalog.g.cs", "0f07275d375e84bdd4a893f91c67077f59428b06" },
            { "IdleIntelligence/Assets/IdleIntelligence/Core/GemBalance.g.cs", "f972db144d80a42b0356d804c600ac10e17b9867" },
            { "IdleIntelligence/Assets/IdleIntelligence/Core/IndustryBalance.g.cs", "06e779114b7755096482a87e936409fce232e58b" },
            { "IdleIntelligence/Assets/IdleIntelligence/Core/ItemBalance.g.cs", "5e7835d10c8c308f7400ccd5f0e9b52abf46c401" },
            { "IdleIntelligence/Assets/IdleIntelligence/Core/ItemV3Balance.g.cs", "b5673127476afaaedc744ba4dbc7335f7ef04e09" },
            { "IdleIntelligence/Assets/IdleIntelligence/Core/JournalCatalog.g.cs", "2f97aeefeae62dfe64369818d2b091ec28451724" },
            { "IdleIntelligence/Assets/IdleIntelligence/Core/LifetimeBalance.g.cs", "7ad21e7a6b571037acc9a6e219c480dfc874d8ca" },
            { "IdleIntelligence/Assets/IdleIntelligence/Core/MarketBalance.g.cs", "dc005520cbe02c70508b3e1a644d5c50f29b6645" },
            { "IdleIntelligence/Assets/IdleIntelligence/Core/MetaBalance.g.cs", "f762f639c614386758f318f0a359b9f1df37cd36" },
            { "IdleIntelligence/Assets/IdleIntelligence/Core/MissionBalance.g.cs", "8196121b3fbde505a582afdc446deddfa1f0d8e7" },
            { "IdleIntelligence/Assets/IdleIntelligence/Core/NameUnicode.g.cs", "218c11169e3502fab3e86eef7a1c9cd6316ea5bd" },
            { "IdleIntelligence/Assets/IdleIntelligence/Core/NarrativeCatalog.g.cs", "51cdca4de08408eb04cea7def2d6908385049b26" },
            { "IdleIntelligence/Assets/IdleIntelligence/Core/NativeUiCatalog.g.cs", "d4e078c1a74ad40ef60021a9b69d5a86af649dcf" },
            { "IdleIntelligence/Assets/IdleIntelligence/Core/NavigationCatalog.g.cs", "cfe5a1757e0ba3b0edb3faa983d26d52cbad9fe6" },
            { "IdleIntelligence/Assets/IdleIntelligence/Core/PrestigeBalance.g.cs", "91eff48d597833371232525ec1a6e055e8ce60de" },
            { "IdleIntelligence/Assets/IdleIntelligence/Core/RetentionBalance.g.cs", "41a4bef4554f38bd9aa0d88dc34e23122e7170b0" },
            { "IdleIntelligence/Assets/IdleIntelligence/Core/SeasonBalance.g.cs", "2c3c49683e256411e53b29904a146d4d01475aff" },
            { "IdleIntelligence/Assets/IdleIntelligence/Core/SettingsCatalog.g.cs", "c7bf7af826a71f2034ff7f46a9bc47f01ceb9a48" },
            { "IdleIntelligence/Assets/IdleIntelligence/Core/SignalBalance.g.cs", "33a167b6af2a500d712d118aacb62eb0b1e88410" },
            { "IdleIntelligence/Assets/IdleIntelligence/Core/UiSourceCatalog.g.cs", "c4eb32c001f4d289db356eaad1a1398115d1b6a6" },
            { "IdleIntelligence/Assets/IdleIntelligence/Core/VoucherBalance.g.cs", "c0b347b46439cbb7b9e34c52eafdccd0dfff3459" },
        };
        public static string GitBlobId(byte[] bytes)
        {
            if(bytes==null)throw new ArgumentNullException(nameof(bytes));
            var prefix=Encoding.UTF8.GetBytes("blob "+bytes.Length+"\0");
            var payload=new byte[prefix.Length+bytes.Length];
            Buffer.BlockCopy(prefix,0,payload,0,prefix.Length);
            Buffer.BlockCopy(bytes,0,payload,prefix.Length,bytes.Length);
            using(var sha=SHA1.Create())
                return BitConverter.ToString(sha.ComputeHash(payload)).Replace("-","").ToLowerInvariant();
        }
        public static void VerifyAtRepositoryRoot(string root)
        {
            if(SourceBlobs.Count!=25)throw new InvalidDataException("Native source manifest incomplete");
            if(!File.Exists(Path.Combine(root,"IdleIntelligence/ProjectSettings/ProjectVersion.txt")))
                throw new DirectoryNotFoundException("Expected Unity repository checkout, not an unrelated directory.");
            foreach(var source in SourceBlobs)
            {
                var absolute=Path.Combine(root,source.Key.Replace('/',Path.DirectorySeparatorChar));
                if(!File.Exists(absolute))throw new FileNotFoundException("Native catalogue missing: "+source.Key);
                if(!string.Equals(GitBlobId(File.ReadAllBytes(absolute)),source.Value,StringComparison.Ordinal))
                    throw new InvalidDataException("Native catalogue changed without a reviewed manifest update: "+source.Key);
            }
        }
    }
}
