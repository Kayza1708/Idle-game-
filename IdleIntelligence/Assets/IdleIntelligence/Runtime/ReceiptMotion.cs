using UnityEngine;
namespace IdleIntelligence.Runtime {
 // Shared cosmetic timing. All inputs are copies of already committed receipts.
 public static class ReceiptMotion {
  public static double Now=>Time.realtimeSinceStartupAsDouble;
  public static float Age(double start)=>(float)System.Math.Max(0,Now-start);
  public static float Ease(float t){t=Mathf.Clamp01(t);return t*t*(3-2*t);}
  public static float Out(float t){t=1-Mathf.Clamp01(t);return 1-t*t*t;}
  public static Vector2 Arc(Vector2 a,Vector2 b,float t,float bend){var d=b-a;var normal=new Vector2(-d.y,d.x).normalized;return Vector2.Lerp(a,b,t)+normal*(4*t*(1-t)*bend);}
  public static float Settle(float t){t=Mathf.Clamp01(t);return 1+Mathf.Sin(t*Mathf.PI)*(.22f*(1-t));}
 }
}
