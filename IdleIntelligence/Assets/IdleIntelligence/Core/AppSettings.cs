using System;using System.Linq;
namespace IdleIntelligence.Core
{
 public sealed class LocalizedCopy{public readonly string Id;public readonly string[] Values;public LocalizedCopy(string id,string[] values){Id=id;Values=values;}}
 [Serializable]public sealed class AppSettings
 {public int schema=1;public bool initialized,effects=true,musicEnabled,sfxMuted,hapticsEnabled;public string language="de",numberFormat="auto",buyMode="1";public double musicVolume=SettingsCatalog.MusicVolume,sfxVolume=SettingsCatalog.SfxVolume;public static AppSettings New(bool reduced=false)=>new AppSettings{initialized=true,effects=!reduced};public AppSettings Copy()=>(AppSettings)MemberwiseClone();}
 public static class SettingsRules
 {
  public static string Text(string language,string id){var entry=SettingsCatalog.Copies.Concat(UiSourceCatalog.Copies).FirstOrDefault(c=>c.Id==id);int l=Array.IndexOf(SettingsCatalog.Languages,language);return entry==null?id:NativeCopy.Text(entry.Values[Math.Max(0,l)],language);}
  public static GameState Change(GameState state,string action,string value="",double amount=0){if(action=="language"&&!SettingsCatalog.Languages.Contains(value)||action=="number-format"&&!new[]{"auto","scientific","engineering"}.Contains(value)||action=="buy-mode"&&!new[]{"1","10","max"}.Contains(value)||double.IsNaN(amount))return state;var s=state.Copy();var p=s.Settings;switch(action){case "language":p.language=value;break;case "number-format":p.numberFormat=value;break;case "buy-mode":p.buyMode=value;break;case "toggle-effects":p.effects=!p.effects;s.Workshop.reducedMotion=!p.effects;break;case "toggle-haptics":p.hapticsEnabled=!p.hapticsEnabled;break;case "toggle-music":p.musicEnabled=!p.musicEnabled;break;case "toggle-sfx":p.sfxMuted=!p.sfxMuted;break;case "music-volume":p.musicVolume=Math.Max(0,Math.Min(1,amount));break;case "sfx-volume":p.sfxVolume=Math.Max(0,Math.Min(1,amount));break;default:return state;}return s;}
  public static long BuyQuantity(GameState s,int index){if(s.Settings.buyMode!="max")return s.Settings.buyMode=="10"?10:1;long low=0,high=9007199254740991L-s.Hardware[index];while(low<high){long mid=low+(high-low+1)/2;try{if(Game.HardwareCost(s,index,mid).CompareTo(s.Credits)<=0)low=mid;else high=mid-1;}catch(ArgumentOutOfRangeException){high=mid-1;}}return low;}
  public static void Validate(GameState s){var p=s.Settings;if(p==null||p.schema!=1||!p.initialized||!SettingsCatalog.Languages.Contains(p.language)||!new[]{"auto","scientific","engineering"}.Contains(p.numberFormat)||!new[]{"1","10","max"}.Contains(p.buyMode)||!ScientificNumber.Finite(p.musicVolume)||p.musicVolume<0||p.musicVolume>1||!ScientificNumber.Finite(p.sfxVolume)||p.sfxVolume<0||p.sfxVolume>1)throw new FormatException("Invalid settings");}
 }
}
