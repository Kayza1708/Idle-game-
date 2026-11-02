using System;using System.Globalization;using System.Numerics;
namespace IdleIntelligence.Core
{
 public static class NumberFormatting
 {
  public static string Fixed(double value,int digits){if(!ScientificNumber.Finite(value)||value<0||digits<0||digits>20)throw new ArgumentOutOfRangeException();if(value==0)return digits==0?"0":"0."+new string('0',digits);long bits=BitConverter.DoubleToInt64Bits(value);int exp=(int)((bits>>52)&2047);long fraction=bits&0xfffffffffffffL;BigInteger numerator=exp==0?fraction:fraction|(1L<<52);int shift=(exp==0?-1022:exp-1023)-52;numerator*=BigInteger.Pow(10,digits);BigInteger denominator=BigInteger.One;if(shift>=0)numerator<<=shift;else denominator<<=-shift;BigInteger result=BigInteger.DivRem(numerator,denominator,out var remainder);if(remainder*2>=denominator)result++;string text=result.ToString(CultureInfo.InvariantCulture).PadLeft(digits+1,'0');return digits==0?text:text.Insert(text.Length-digits,".");}
  public static string Format(ScientificNumber value,string mode="auto",int digits=2){if(value.IsZero)return "0";digits=Math.Max(0,Math.Min(6,digits));if(mode=="auto"&&value.Log10()<15){double n=value.ToDouble();int group=n>=1e12?2:n>=1e9?1:n>=1e6?0:-1;double divisor=group<0?1:Math.Pow(10,6+group*3);decimal rounded=Math.Round((decimal)(n/divisor),digits,MidpointRounding.AwayFromZero);if(group>=0&&group<2&&rounded>=1000){group++;rounded/=1000;}string format="#,0"+(digits>0?"."+new string('#',digits):"");return rounded.ToString(format,CultureInfo.GetCultureInfo("de-DE"))+(group<0?"":"\u00a0"+new[]{"Mio.","Mrd.","Bio."}[group]);}long exponent=mode=="engineering"?(long)(Math.Floor(value.Exponent/3d)*3):value.Exponent;double mantissa=value.Mantissa*Math.Pow(10,value.Exponent-exponent);return Fixed(mantissa,digits)+"e"+(exponent>=0?"+":"")+exponent.ToString(CultureInfo.InvariantCulture);}

  public static string Format(ScientificNumber value,string mode,string language,int digits=2)
  {
   string source=Format(value,mode,digits);
   if(language=="de"||mode!="auto"||value.IsZero||value.Log10()>=15)return source;
   var pieces=source.Split('\u00a0');
   decimal amount=decimal.Parse(pieces[0],System.Globalization.NumberStyles.Number,CultureInfo.GetCultureInfo("de-DE"));
   string culture=Array.IndexOf(SettingsCatalog.Languages,language)>=0?language:"en";
   string format="#,0"+(digits>0?"."+new string('#',Math.Min(6,digits)):"");
   string text=amount.ToString(format,CultureInfo.GetCultureInfo(culture));
   if(pieces.Length==1)return text;
   string[] units;switch(culture){case "es":units=new[]{"M","mil M","bill."};break;case "fr":units=new[]{"M","Md","Bn"};break;case "pt":units=new[]{"mi","bi","tri"};break;case "it":units=new[]{"mln","mld","bil"};break;case "pl":units=new[]{"mln","mld","bln"};break;default:units=new[]{"M","B","T"};break;}
   int group=Array.IndexOf(new[]{"Mio.","Mrd.","Bio."},pieces[1]);
   return text+"\u00a0"+(group>=0?units[group]:pieces[1]);
  }
 }
}
