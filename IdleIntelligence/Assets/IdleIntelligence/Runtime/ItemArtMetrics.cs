using System;using UnityEngine;
namespace IdleIntelligence.Runtime {
 public sealed class ItemArtMetrics:ScriptableObject {public Sprite[] Sprites;public Rect[] AlphaRects;public Rect For(Sprite sprite){int i=Array.IndexOf(Sprites,sprite);return i>=0&&i<AlphaRects.Length?AlphaRects[i]:new Rect(0,0,1,1);}}
}
