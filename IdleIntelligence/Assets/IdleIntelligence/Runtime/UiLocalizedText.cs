using System;using System.Linq;using System.Collections.Generic;using System.Text.RegularExpressions;using IdleIntelligence.Core;using UnityEngine;using UnityEngine.UI;
namespace IdleIntelligence.Runtime
{
 // Keeps the source text so rebuilt and persistent prefab labels can change language repeatedly.
 public sealed class UiLocalizedText:MonoBehaviour
 {
  static readonly LocalizedCopy[] Copies=NativeUiCatalog.Copies.Concat(SettingsCatalog.Copies).Concat(UiSourceCatalog.Copies).ToArray();
  static readonly Dictionary<string,LocalizedCopy> Exact=new Dictionary<string,LocalizedCopy>(StringComparer.Ordinal);
  static readonly Dictionary<string,string[]> German=new Dictionary<string,string[]>(StringComparer.Ordinal);
  static readonly Dictionary<int,Regex> Patterns=new Dictionary<int,Regex>();static bool ready;
  Text label;GameRuntime game;string original,lastRendered,lastLanguage;
  static void Prepare(){if(ready)return;ready=true;foreach(var entry in Copies){foreach(string value in entry.Values)if(value.Length>0&&!Exact.ContainsKey(value))Exact.Add(value,entry);foreach(string value in entry.Values){string piece=value.Trim();if(piece.Length>=3&&!piece.Contains('{')&&!German.ContainsKey(piece))German.Add(piece,entry.Values.Select(v=>v.Trim()).ToArray());}}for(int l=0;l<7;l++){var keys=German.Where(e=>e.Value[l]!=e.Key).Select(e=>e.Key).OrderByDescending(k=>k.Length).Select(Regex.Escape).ToArray();Patterns.Add(l,new Regex("(?<![\\p{L}\\p{N}_])(?:"+string.Join("|",keys)+")(?![\\p{L}\\p{N}_])",RegexOptions.CultureInvariant));}}
  public static string Translate(string text,string language){Prepare();int l=Math.Max(0,Array.IndexOf(SettingsCatalog.Languages,language));if(Exact.TryGetValue(text,out var exact))return exact.Values[l];return Patterns[l].Replace(text,m=>German.TryGetValue(m.Value,out var values)?values[l]:m.Value);}
  public void Initialize(GameRuntime runtime){game=runtime;label=GetComponent<Text>();original=label.text;}
  void LateUpdate(){if(game==null||label==null||GetComponentInParent<InputField>()!=null)return;string language=game.State.Settings.language;if(label.text!=lastRendered)original=label.text;if(language==lastLanguage&&label.text==lastRendered)return;lastLanguage=language;string input=original;bool personal=GetComponentInParent<StoryView>()!=null||GetComponentInParent<RetentionView>()!=null;string[] names=personal?new[]{game.State.Retention.aiName,game.State.Retention.playerName}:Array.Empty<string>();for(int i=0;i<names.Length;i++)if(!string.IsNullOrEmpty(names[i]))input=input.Replace(names[i],"\uE000"+i+"\uE001");lastRendered=Translate(input,language);for(int i=0;i<names.Length;i++)if(!string.IsNullOrEmpty(names[i]))lastRendered=lastRendered.Replace("\uE000"+i+"\uE001",names[i]);label.text=lastRendered;}
 }
}
