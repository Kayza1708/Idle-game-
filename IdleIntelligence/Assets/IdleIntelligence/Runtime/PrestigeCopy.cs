using System;
using System.Collections.Generic;
using System.Text.RegularExpressions;
using IdleIntelligence.Core;
namespace IdleIntelligence.Runtime
{
    public static class PrestigeCopy
    {
        static readonly Dictionary<string,string> Names=Build();
        static Dictionary<string,string> Build(){var names=new Dictionary<string,string>(StringComparer.Ordinal);foreach(var n in PrestigeBalance.Nodes)names.Add(n.Id,n.Name);foreach(var n in MetaBalance.Axioms)names.Add(n.Id,n.Name);foreach(var n in MetaBalance.Models)names.Add(n.Id,n.Name);return names;}
        static readonly Regex Identifiers=new Regex(@"\b[HTFWSIABCDK][0-9]{2}\b");
        public static string Describe(string source,string language)=>Identifiers.Replace(NativeCopy.Text(source,language),m=>Names.TryGetValue(m.Value,out var name)?NativeCopy.Text(name,language):m.Value);
    }
}
