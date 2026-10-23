using UnityEngine;
using UnityEngine.UI;

namespace IdleIntelligence.Runtime
{
 // Recessed steel rim and dark cavity, behind the original chest front.
 [RequireComponent(typeof(CanvasRenderer))]
 public sealed class ChestWellGraphic : MaskableGraphic
 {
  public Color Accent=GameTheme.Accent;
  protected override void OnPopulateMesh(VertexHelper vertices)
  {
   vertices.Clear();
   Add(vertices,new Vector2(-102,-14),new Vector2(72,-37),new Vector2(108,36),new Vector2(-39,57),GameTheme.Hex("73919F"));
   Add(vertices,new Vector2(-96,-14),new Vector2(69,-32),new Vector2(100,35),new Vector2(-38,51),GameTheme.Hex("152D39"));
   Add(vertices,new Vector2(-87,-16),new Vector2(62,-33),new Vector2(91,30),new Vector2(-37,44),GameTheme.Hex("030C14"));
   Add(vertices,new Vector2(-86,-17),new Vector2(63,-35),new Vector2(63,-32),new Vector2(-86,-14),Accent*.55f);
   foreach(var center in new[]{new Vector2(-25,53),new Vector2(89,37)}){Add(vertices,center+new Vector2(-7,-5),center+new Vector2(7,-5),center+new Vector2(7,5),center+new Vector2(-7,5),GameTheme.Hex("111E2A"));Add(vertices,center+new Vector2(-5,-3),center+new Vector2(5,-3),center+new Vector2(5,3),center+new Vector2(-5,3),GameTheme.Hex("B4CDD5"));}
  }
  static void Add(VertexHelper v,Vector2 a,Vector2 b,Vector2 c,Vector2 d,Color tint){int n=v.currentVertCount;v.AddVert(a,tint,Vector2.zero);v.AddVert(b,tint,Vector2.zero);v.AddVert(c,tint,Vector2.zero);v.AddVert(d,tint,Vector2.zero);v.AddTriangle(n,n+1,n+2);v.AddTriangle(n,n+2,n+3);}
 }
}
