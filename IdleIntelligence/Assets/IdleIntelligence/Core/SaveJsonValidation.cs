using System;using System.Collections.Generic;using System.Globalization;using System.Linq;using System.Reflection;using System.Text;
namespace IdleIntelligence.Core
{
 // Validate the original bytes before a serializer can ignore keys or coerce types.
 public static class SaveJsonValidation
 {
  public sealed class Value
  {
   public string Kind,Text;public Dictionary<string,Value> Fields;public List<Value> Items;
   public Value Field(string key)=>Fields!=null&&Fields.TryGetValue(key,out var value)?value:null;
  }
  sealed class Parser
  {
   readonly string source;int at,nodes;public Parser(string json){source=json??throw new FormatException("Missing JSON");if(source.Length>32*1024*1024)throw new FormatException("JSON too large");}
   FormatException Error(string reason)=>new FormatException(reason+" at JSON offset "+at);
   void Space(){while(at<source.Length&&(source[at]==' '||source[at]=='\t'||source[at]=='\n'||source[at]=='\r'))at++;}
   bool Take(char c){Space();if(at<source.Length&&source[at]==c){at++;return true;}return false;}
   string Quoted(){Space();if(at>=source.Length||source[at++]!='"')throw Error("Expected string");int first=at;while(at<source.Length&&source[at]!='"'&&source[at]!='\\'){if(source[at]<32){at++;throw Error("Unescaped control character");}at++;}if(at<source.Length&&source[at]=='"'){string plain=source.Substring(first,at-first);at++;return Checked(plain);}at=first;var result=new StringBuilder();bool closed=false;while(at<source.Length){char c=source[at++];if(c=='"'){closed=true;break;}if(c<32)throw Error("Unescaped control character");if(c=='\\'){if(at>=source.Length)throw Error("Incomplete escape");char e=source[at++];switch(e){case '"':case '\\':case '/':c=e;break;case 'b':c='\b';break;case 'f':c='\f';break;case 'n':c='\n';break;case 'r':c='\r';break;case 't':c='\t';break;case 'u':if(at+4>source.Length||!ushort.TryParse(source.Substring(at,4),NumberStyles.AllowHexSpecifier,CultureInfo.InvariantCulture,out var code))throw Error("Invalid Unicode escape");at+=4;c=(char)code;break;default:throw Error("Invalid escape");}}result.Append(c);}if(!closed)throw Error("Unterminated string");return Checked(result.ToString());}
   string Checked(string text){for(int i=0;i<text.Length;i++){if(char.IsHighSurrogate(text[i])){if(++i>=text.Length||!char.IsLowSurrogate(text[i]))throw Error("Unpaired Unicode surrogate");}else if(char.IsLowSurrogate(text[i]))throw Error("Unpaired Unicode surrogate");}return text;}
   bool Literal(string text){if(at+text.Length>source.Length)return false;for(int i=0;i<text.Length;i++)if(source[at+i]!=text[i])return false;at+=text.Length;return true;}
   public Value Read(int depth=0){Space();if(depth>64||++nodes>250000||at>=source.Length)throw Error("Invalid JSON bounds");char c=source[at];if(c=='{'){at++;var value=new Value{Kind="object",Fields=new Dictionary<string,Value>(StringComparer.Ordinal)};if(Take('}'))return value;do{string key=Quoted();if(value.Fields.ContainsKey(key))throw Error("Duplicate field "+key);if(!Take(':'))throw Error("Expected colon");value.Fields.Add(key,Read(depth+1));if(Take('}'))return value;}while(Take(','));throw Error("Expected object delimiter");}if(c=='['){at++;var value=new Value{Kind="array",Items=new List<Value>()};if(Take(']'))return value;do{value.Items.Add(Read(depth+1));if(Take(']'))return value;}while(Take(','));throw Error("Expected array delimiter");}if(c=='"')return new Value{Kind="string",Text=Quoted()};if(Literal("true"))return new Value{Kind="bool",Text="true"};if(Literal("false"))return new Value{Kind="bool",Text="false"};if(Literal("null"))return new Value{Kind="null"};int start=at;if(source[at]=='-')at++;if(at>=source.Length)throw Error("Incomplete number");if(source[at]=='0')at++;else{if(source[at]<'1'||source[at]>'9')throw Error("Invalid number");while(at<source.Length&&source[at]>='0'&&source[at]<='9')at++;}if(at<source.Length&&source[at]=='.'){at++;int first=at;while(at<source.Length&&source[at]>='0'&&source[at]<='9')at++;if(first==at)throw Error("Missing fraction");}if(at<source.Length&&(source[at]=='e'||source[at]=='E')){at++;if(at<source.Length&&(source[at]=='+'||source[at]=='-'))at++;int first=at;while(at<source.Length&&source[at]>='0'&&source[at]<='9')at++;if(first==at)throw Error("Missing exponent");}string number=source.Substring(start,at-start);if(!double.TryParse(number,NumberStyles.Float,CultureInfo.InvariantCulture,out var n)||!ScientificNumber.Finite(n))throw Error("Nonfinite number");return new Value{Kind="number",Text=number};}
   public Value Document(){var value=Read();Space();if(at!=source.Length)throw Error("Trailing JSON content");return value;}
  }
  public static Value Parse(string json)=>new Parser(json).Document();
  public static void Validate(string json,Type type,bool complete=false,string[] optional=null)=>ValidateValue(Parse(json),type,complete,optional);
  public static void ValidateValue(Value value,Type type,bool complete=false,string[] optional=null)=>Check(value,type,new StringBuilder("$"),complete,optional);
  static readonly System.Collections.Concurrent.ConcurrentDictionary<Type,Dictionary<string,FieldInfo>> Schemas=new System.Collections.Concurrent.ConcurrentDictionary<Type,Dictionary<string,FieldInfo>>();
  static void Check(Value value,Type type,StringBuilder path,bool complete,string[] optional)
  {
   if(value.Kind=="null"){if(type.IsValueType)throw new FormatException("Null value at "+path);return;}
   if(type==typeof(string)){if(value.Kind!="string")throw new FormatException("Expected text at "+path);return;}
   if(type==typeof(bool)){if(value.Kind!="bool")throw new FormatException("Expected boolean at "+path);return;}
   if(type.IsPrimitive||type==typeof(decimal)){
    if(value.Kind!="number")throw new FormatException("Expected number at "+path);
    if(type==typeof(double)||type==typeof(float)||type==typeof(decimal)){if(type==typeof(float)&&Math.Abs(double.Parse(value.Text,CultureInfo.InvariantCulture))>float.MaxValue)throw new FormatException("Float overflow at "+path);return;}
    if(!decimal.TryParse(value.Text,NumberStyles.AllowLeadingSign,CultureInfo.InvariantCulture,out var integer))throw new FormatException("Expected exact integer at "+path);
    decimal min=type==typeof(int)?int.MinValue:type==typeof(uint)?uint.MinValue:type==typeof(long)?long.MinValue:type==typeof(ulong)?ulong.MinValue:type==typeof(short)?short.MinValue:type==typeof(byte)?byte.MinValue:0;
    decimal max=type==typeof(int)?int.MaxValue:type==typeof(uint)?uint.MaxValue:type==typeof(long)?long.MaxValue:type==typeof(ulong)?ulong.MaxValue:type==typeof(short)?short.MaxValue:type==typeof(byte)?byte.MaxValue:0;
    if(integer<min||integer>max)throw new FormatException("Integer overflow at "+path);return;
   }
   if(type.IsArray){if(value.Kind!="array")throw new FormatException("Expected array at "+path);var element=type.GetElementType();for(int i=0;i<value.Items.Count;i++){int length=path.Length;path.Append('[').Append(i).Append(']');Check(value.Items[i],element,path,complete,optional);path.Length=length;}return;}
   if(value.Kind!="object")throw new FormatException("Expected object at "+path);
   var fields=Schemas.GetOrAdd(type,t=>t.GetFields(BindingFlags.Instance|BindingFlags.Public).Where(f=>!f.IsNotSerialized).ToDictionary(f=>f.Name,StringComparer.Ordinal));
   foreach(var entry in value.Fields){if(!fields.TryGetValue(entry.Key,out var field))throw new NotSupportedException("Nicht unterstütztes Savefeld "+path+"."+entry.Key+"; Original bleibt erhalten.");int length=path.Length;path.Append('.').Append(entry.Key);Check(entry.Value,field.FieldType,path,complete,optional);path.Length=length;}
   // Unity encodes some inactive null classes as empty objects. Domain flags validate those.
   if(complete&&value.Fields.Count>0)foreach(string key in fields.Keys)if(!value.Fields.ContainsKey(key)&&!(optional??Array.Empty<string>()).Contains(key)&&!(optional??Array.Empty<string>()).Contains(fields[key].DeclaringType.FullName+"."+key))throw new FormatException("Missing save field "+path+"."+key);
  }
 }
}
