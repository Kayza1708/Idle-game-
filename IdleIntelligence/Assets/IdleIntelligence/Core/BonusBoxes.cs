using System;
using System.Linq;
namespace IdleIntelligence.Core
{
 public static class BonusBoxes
 {
  const long Max=9007199254740991L;
  public static double Roll(string campaign,string key)
  {uint hash=2166136261;string text=campaign+":"+key;unchecked{for(int i=0;i<text.Length;i++){hash=(hash^text[i])*16777619;if(char.IsHighSurrogate(text[i])&&i+1<text.Length&&char.IsLowSurrogate(text[i+1]))i++;}hash^=hash>>16;hash*=0x7feb352d;hash^=hash>>15;}return hash/4294967296d;}
  public static string Blueprint(GameState s)
  {if(Game.Level(s,"blueprints")==0)return "fragment";for(int i=0;i<MissionBalance.ExtendedIds.Length;i++){string id=MissionBalance.ExtendedIds[i],access=MissionBalance.ExtendedAccess[i];int n=Workshop.Index(id);if(!s.Workshop.learned[n]&&!s.Workshop.knownBlueprints[n]&&(access=="prestige"?s.Prestige.resets>0:s.Industry.families[access=="server"?2:access=="campus"?3:4]))return id;}return "fragment";}
  public static GameState EarnDaily(GameState state)
  {
   var b=state.Missions.boxes;string key=state.Missions.daily.key;if(ChallengeRules.Active(state)||!state.Missions.daily.bonusClaimed||b.lastDailyKey==key||b.earned>=Max)return state;
   var choices=MissionBalance.FamilyPriority.Select(id=>Array.IndexOf(MissionBalance.FamilyIds,id)).Where(f=>state.Industry.families[f]).Select(f=>new BonusChoice{family=f,amount=(long)MissionBalance.PackageAmounts[f]}).ToArray();if(choices.Length==0)return state;
   var s=state.Copy();b=s.Missions.boxes;b.earned++;b.lastDailyKey=key;b.pending=b.pending.Concat(new[]{new BonusBox{id=b.earned,at=s.SavedAt,choices=choices,blueprint=Roll(s.Missions.campaign,key)<MissionBalance.BlueprintChance?Blueprint(s):""}}).ToArray();
   if(b.pending.Length>MissionBalance.MaxBoxes)s=Open(s,b.earned,choices[0].family,true);return s.Missions.boxes.pending.Length>MissionBalance.MaxBoxes?state:s;
  }
  public static GameState Open(GameState state,long id,int family,bool automatic=false)
  {
   if(ChallengeRules.Active(state))return state;var box=state.Missions.boxes.pending.FirstOrDefault(v=>v.id==id);var choice=box?.choices.FirstOrDefault(c=>c.family==family);if(choice==null)return state;
   string blueprint=box.blueprint;int item=Workshop.Index(blueprint);if(item>=0&&(state.Workshop.learned[item]||state.Workshop.knownBlueprints[item]))blueprint="fragment";
   var components=new long[ItemBalance.ComponentIds.Length];foreach(string c in MissionBalance.LegacyFamilyComponents[family])components[Array.IndexOf(ItemBalance.ComponentIds,c)]=choice.amount;
   if(components.Where((n,c)=>state.Workshop.components[c]>Max-n).Any()||state.Workshop.components.Sum()>Max-components.Sum()||blueprint=="fragment"&&state.Workshop.fragments>=Max)return state;
   var s=state.Copy();var b=s.Missions.boxes;b.pending=b.pending.Where(v=>v.id!=id).ToArray();b.opened++;b.hasLast=true;b.last=new BonusReceipt{id=id,at=s.SavedAt,family=family,components=components,blueprint=blueprint,automatic=automatic};for(int c=0;c<components.Length;c++){s.Workshop.components[c]+=components[c];Lifetime.Components(s,c,components[c]);}if(blueprint=="fragment")s.Workshop.fragments++;else if(item>=0)s.Workshop.knownBlueprints[item]=true;s.Workshop.revision++;return s;
  }
  static bool BlueprintValid(string id)=>id!=null&&(id==""||id=="fragment"||MissionBalance.ExtendedIds.Contains(id));
  static bool At(double at)=>ScientificNumber.Finite(at)&&at>=0&&at<=8.64e15;
  public static void Validate(GameState s)
  {
   var b=s.Missions.boxes;if(b==null||b.earned<0||b.earned>Max||b.opened<0||b.opened>b.earned||b.pending==null||b.pending.Length>MissionBalance.MaxBoxes||b.earned-b.opened!=b.pending.Length||b.lastDailyKey==null||b.lastDailyKey.Length>64||b.pending.Select(p=>p?.id).Distinct().Count()!=b.pending.Length||b.opened==0&&b.hasLast||b.opened>0&&!b.hasLast)throw new FormatException("Invalid bonus box history");
   foreach(var p in b.pending)if(p==null||p.id<=0||p.id>b.earned||!At(p.at)||!BlueprintValid(p.blueprint)||p.choices==null||p.choices.Length==0||p.choices.Length>5||p.choices.Any(c=>c==null||c.family<0||c.family>=5||c.amount<1||c.amount>MissionBalance.MaxBoxMaterial)||p.choices.Select(c=>c.family).Distinct().Count()!=p.choices.Length)throw new FormatException("Invalid frozen bonus box");
   if(b.hasLast){var r=b.last;if(r==null||r.id<=0||r.id>b.earned||b.pending.Any(p=>p.id==r.id)||!At(r.at)||r.family<0||r.family>=5||!BlueprintValid(r.blueprint)||r.components==null||r.components.Length!=ItemBalance.ComponentIds.Length||r.components.Where((n,c)=>MissionBalance.LegacyFamilyComponents[r.family].Contains(ItemBalance.ComponentIds[c])?(n<1||n>MissionBalance.MaxBoxMaterial):n!=0).Any())throw new FormatException("Invalid bonus box receipt");}
  }
 }
}
