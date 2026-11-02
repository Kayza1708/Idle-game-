using System;
using System.Collections.Generic;
namespace IdleIntelligence.Core
{
    // Exact presentation templates are resolved before runtime values/player names are inserted.
    // This preserves grammar and avoids treating personalized dialogue as a lookup key.
    public static class NativeCopy
    {
        static readonly Dictionary<string,LocalizedCopy> Entries=Build();
        static Dictionary<string,LocalizedCopy> Build()
        {
            var result=new Dictionary<string,LocalizedCopy>(StringComparer.Ordinal);
            foreach(var entry in NativeUiCatalog.Copies)foreach(string value in entry.Values)
                if(!string.IsNullOrEmpty(value)&&!result.ContainsKey(value))result.Add(value,entry);
            return result;
        }
        public static bool TryText(string source,string language,out string text)
        {
            text=source??"";if(source==null||!Entries.TryGetValue(source,out var entry))return false;
            text=entry.Values[Math.Max(0,Array.IndexOf(SettingsCatalog.Languages,language))];return true;
        }
        public static string Text(string source,string language)
        {
            if(source==null)return "";
            int locale=Math.Max(0,Array.IndexOf(SettingsCatalog.Languages,language));
            return Entries.TryGetValue(source,out var entry)?entry.Values[locale]:source;
        }
    }
}
