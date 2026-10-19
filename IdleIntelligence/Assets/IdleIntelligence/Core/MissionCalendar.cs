using System;
using System.Globalization;
namespace IdleIntelligence.Core
{
 // Gregorian arithmetic also preserves JavaScript's extended-year ISO slice behavior.
 public static class MissionCalendar
 {
  const double Day=86400000;
  static long Floor(long value,long divisor)=>value>=0?value/divisor:(value-divisor+1)/divisor;
  static long Days(double at){if(!ScientificNumber.Finite(at)||Math.Abs(at)>8640000000000000d)throw new FormatException("Unsupported JavaScript calendar time");return(long)Math.Floor(Math.Truncate(at)/Day);}
  static void Civil(long days,out long year,out int month,out int day)
  {long z=days+719468,era=Floor(z,146097),doe=z-era*146097,yoe=(doe-doe/1460+doe/36524-doe/146096)/365;year=yoe+era*400;long doy=doe-(365*yoe+yoe/4-yoe/100),mp=(5*doy+2)/153;day=(int)(doy-(153*mp+2)/5+1);month=(int)(mp+(mp<10?3:-9));if(month<=2)year++;}
  static long FromCivil(long year,int month,int day)
  {year-=month<=2?1:0;long era=Floor(year,400),yoe=year-era*400;long doy=(153*(month+(month>2?-3:9))+2)/5+day-1;return era*146097+yoe*365+yoe/4-yoe/100+doy-719468;}
  static string ISO(long days){Civil(days,out long year,out int month,out int day);string y=year>=0&&year<=9999?year.ToString("D4",CultureInfo.InvariantCulture):(year<0?"-":"+")+Math.Abs(year).ToString("D6",CultureInfo.InvariantCulture);return y+"-"+month.ToString("D2",CultureInfo.InvariantCulture)+"-"+day.ToString("D2",CultureInfo.InvariantCulture)+"T00:00:00.000Z";}
  static int Weekday(long days)=>(int)(((days+3)%7+7)%7);
  public static string Key(double at,int kind){long days=Days(at);return kind==0?ISO(days).Substring(0,10):kind==1?ISO(days-Weekday(days)).Substring(0,10):ISO(days).Substring(0,7);}
  public static double End(double at,int kind)
  {long days=Days(at);if(kind==0)return(days+1)*Day;if(kind==1)return(days-Weekday(days)+7)*Day;Civil(days,out long year,out int month,out int day);if(month==12){year++;month=1;}else month++;return FromCivil(year,month,1)*Day;}
 }
}
