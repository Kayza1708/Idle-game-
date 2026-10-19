using System;
using System.Linq;
using System.Text;
using System.Globalization;
using System.Collections.Generic;
using System.Text.RegularExpressions;
namespace IdleIntelligence.Core
{
 public sealed class NameResult {public bool Ok;public string Name,Error;}
 public static class NameRules
 {
  struct Point {public string Text;public int Code;public UnicodeCategory Category;}
  static IEnumerable<Point> Points(string text)
  {for(int i=0;i<text.Length;i++){bool pair=char.IsHighSurrogate(text[i])&&i+1<text.Length&&char.IsLowSurrogate(text[i+1]);yield return new Point{Text=pair?text.Substring(i,2):text[i].ToString(),Code=pair?char.ConvertToUtf32(text[i],text[i+1]):text[i],Category=Category(pair?char.ConvertToUtf32(text[i],text[i+1]):text[i])};if(pair)i++;}}
  static bool Letter(UnicodeCategory c)=>c==UnicodeCategory.UppercaseLetter||c==UnicodeCategory.LowercaseLetter||c==UnicodeCategory.TitlecaseLetter||c==UnicodeCategory.ModifierLetter||c==UnicodeCategory.OtherLetter;
  static bool Mark(UnicodeCategory c)=>c==UnicodeCategory.NonSpacingMark||c==UnicodeCategory.SpacingCombiningMark||c==UnicodeCategory.EnclosingMark;
  static bool Number(UnicodeCategory c)=>c==UnicodeCategory.DecimalDigitNumber||c==UnicodeCategory.LetterNumber||c==UnicodeCategory.OtherNumber;
  static bool Space(int c)=>c>=9&&c<=13||c==32||c==0xa0||c==0x1680||c>=0x2000&&c<=0x200a||c==0x2028||c==0x2029||c==0x202f||c==0x205f||c==0x3000||c==0xfeff;
  static UnicodeCategory Category(int code)
  {
   if(InRanges(code,NameUnicode.Uppercase))return UnicodeCategory.UppercaseLetter;if(InRanges(code,NameUnicode.Lowercase))return UnicodeCategory.LowercaseLetter;if(InRanges(code,NameUnicode.Letters))return UnicodeCategory.OtherLetter;if(InRanges(code,NameUnicode.Marks))return UnicodeCategory.NonSpacingMark;if(InRanges(code,NameUnicode.Numbers))return UnicodeCategory.OtherNumber;if(InRanges(code,NameUnicode.Formats))return UnicodeCategory.Format;return code>=0xd800&&code<=0xdfff?UnicodeCategory.Surrogate:UnicodeCategory.OtherNotAssigned;
  }
  static Dictionary<string,string> Unpack(string[] chunks)
  {var result=new Dictionary<string,string>();foreach(string chunk in chunks)foreach(string row in chunk.Split(';')){var pair=row.Split(':');string Decode(string value)=>string.Concat(value.Split(',').Select(v=>char.ConvertFromUtf32(int.Parse(v,NumberStyles.HexNumber,CultureInfo.InvariantCulture))));result.Add(Decode(pair[0]),Decode(pair[1]));}return result;}
  static readonly Dictionary<string,string> Decomposition=Unpack(NameUnicode.Decomposition),Composition=Unpack(NameUnicode.Composition);
  static int Rank(int code){int low=0,high=NameUnicode.CombiningRank.Length-1;while(low<=high){int mid=(low+high)/2;var row=NameUnicode.CombiningRank[mid];if(code<row[0])high=mid-1;else if(code>row[1])low=mid+1;else return row[2];}return 0;}
  public static string Canonical(string text,bool compose)
  {
   var decomposed=new List<Point>();foreach(var original in Points(text))foreach(var point in Points(Decomposition.TryGetValue(original.Text,out var expanded)?expanded:original.Text))
   {decomposed.Add(point);int rank=Rank(point.Code),at=decomposed.Count-1;if(rank>0)while(at>0&&Rank(decomposed[at-1].Code)>rank){var prior=decomposed[at-1];decomposed[at-1]=decomposed[at];decomposed[at]=prior;at--;}}
   if(!compose)return string.Concat(decomposed.Select(p=>p.Text));
   var output=new List<string>();int starter=-1,lastRank=0;foreach(var point in decomposed){int rank=Rank(point.Code);if(starter>=0&&(lastRank<rank||lastRank==0)&&Composition.TryGetValue(output[starter]+point.Text,out var combined)){output[starter]=combined;continue;}output.Add(point.Text);if(rank==0)starter=output.Count-1;lastRank=rank;}return string.Concat(output);
  }
  static string Normalize(string text,NormalizationForm form)=>Canonical(text,form==NormalizationForm.FormKC);
  static readonly Dictionary<string,string> Leet=NameBalance.Leet.ToDictionary(p=>p[0],p=>p[1]);
  static readonly Dictionary<string,string> Confusables=NameBalance.Confusables.ToDictionary(p=>p[0],p=>p[1]);
  static readonly Dictionary<string,string> CaseMap=NameBalance.Lowercase.ToDictionary(p=>p[0],p=>p[1]);
  static bool InRanges(int code,int[][] ranges){int low=0,high=ranges.Length-1;while(low<=high){int mid=(low+high)/2;if(code<ranges[mid][0])high=mid-1;else if(code>ranges[mid][1])low=mid+1;else return true;}return false;}
  static string Lower(string input)
  {
   var points=Points(input).ToArray();var result=new StringBuilder();
   for(int i=0;i<points.Length;i++)
   {
    var p=points[i];if(p.Code==0x3a3){int previous=i-1,next=i+1;while(previous>=0&&InRanges(points[previous].Code,NameBalance.CaseIgnorable))previous--;while(next<points.Length&&InRanges(points[next].Code,NameBalance.CaseIgnorable))next++;if(previous>=0&&InRanges(points[previous].Code,NameBalance.Cased)&&(next==points.Length||!InRanges(points[next].Code,NameBalance.Cased))){result.Append("ς");continue;}}
    result.Append(CaseMap.TryGetValue(p.Text,out var mapped)?mapped:p.Text);
   }
   return result.ToString();
  }
  public static string Moderation(string input)
  {
   var result=new StringBuilder();bool latin=false;
   foreach(var p in Points(Lower(Normalize(input,NormalizationForm.FormKD))))
   {
    if(Mark(p.Category)&&latin)continue;latin=p.Code>=97&&p.Code<=122;
    if(p.Code>=0x64b&&p.Code<=0x65f||p.Code==0x670||p.Code==0x640)continue;
    string value=p.Text;
    if(value=="ß")value="ss";else if(value=="ł")value="l";else if(value=="đ")value="d";else if("أإآٱ".Contains(value))value="ا";else if(value=="ى")value="ي";
    if(Confusables.TryGetValue(value,out var mapped))value=mapped;
    if(p.Code>=0x660&&p.Code<=0x669)value=(p.Code-0x660).ToString(CultureInfo.InvariantCulture);
    if(p.Code>=0x6f0&&p.Code<=0x6f9)value=(p.Code-0x6f0).ToString(CultureInfo.InvariantCulture);
    if(Leet.TryGetValue(value,out mapped))value=mapped;
    foreach(var character in Points(value))if(Letter(character.Category)||Mark(character.Category))result.Append(character.Text);
   }
   return result.ToString();
  }
  static string Collapse(string value)
  {var b=new StringBuilder();string previous="";foreach(var p in Points(value)){if(!(Letter(p.Category)&&p.Text==previous))b.Append(p.Text);previous=p.Text;}return b.ToString();}
  static readonly HashSet<string> Exact=new HashSet<string>(NameBalance.Exact);
  static readonly HashSet<string> Repeated=new HashSet<string>(NameBalance.Exact.Where(t=>Points(t).Count()>=4).Select(Collapse));
  static readonly string[] Embedded=NameBalance.Embedded,RepeatedEmbedded=NameBalance.Embedded.Select(Collapse).ToArray();
  public static bool Blocked(string input)
  {
   if(input==null)return false;
   string text=string.Concat(Points(Normalize(input,NormalizationForm.FormKC)).Where(p=>p.Category!=UnicodeCategory.Format).Select(p=>p.Text));
   var tokens=new List<string>{text};var word=new StringBuilder();UnicodeCategory previous=UnicodeCategory.OtherNotAssigned;
   foreach(var p in Points(text))
   {
    if(Letter(p.Category)||Mark(p.Category)||Number(p.Category)||"@$!|".Contains(p.Text))
    {if(previous==UnicodeCategory.LowercaseLetter&&p.Category==UnicodeCategory.UppercaseLetter&&word.Length>0){tokens.Add(word.ToString());word.Clear();}word.Append(p.Text);}
    else if(word.Length>0){tokens.Add(word.ToString());word.Clear();}previous=p.Category;
   }
   if(word.Length>0)tokens.Add(word.ToString());
   foreach(string token in tokens.Where(t=>t.Length>0))
   {
    string value=Moderation(token),withoutNumbers=Moderation(string.Concat(Points(token).Where(p=>!Number(p.Category)).Select(p=>p.Text)));
    foreach(string variant in new[]{value,withoutNumbers,Regex.Replace(value,"^x{1,3}|x{1,3}$","")}.Distinct())
    {string collapsed=Collapse(variant);if(Exact.Contains(variant)||Repeated.Contains(collapsed)||Embedded.Any(t=>variant.Contains(t))||RepeatedEmbedded.Any(t=>collapsed.Contains(t)))return true;}
   }
   return false;
  }
  public static NameResult Validate(string input,int maximum=-1)
  {
   if(input==null)return new NameResult{Error="characters"};if(maximum<0)maximum=NameBalance.PlayerMaximum;
   var normalized=Points(Normalize(input,NormalizationForm.FormKC)).ToArray();var name=new StringBuilder();bool pending=false;
   foreach(var p in normalized){if(Space(p.Code)){if(name.Length>0)pending=true;continue;}if(pending)name.Append(' ');pending=false;name.Append(p.Text);}
   string result=name.ToString();var points=Points(result).ToArray();
   if(points.Length<NameBalance.Minimum||points.Length>maximum)return new NameResult{Error="length"};
   if(Blocked(result))return new NameResult{Error="blocked"};
   if(!points.Any(p=>Letter(p.Category)||Number(p.Category))||points.Any(p=>!Letter(p.Category)&&!Mark(p.Category)&&!Number(p.Category)&&p.Code!=32&&p.Code!=95&&p.Code!=45))return new NameResult{Error="characters"};
   return new NameResult{Ok=true,Name=result};
  }
 }
}
