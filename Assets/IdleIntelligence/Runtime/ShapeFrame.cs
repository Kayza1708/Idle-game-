using System.Collections.Generic;using UnityEngine;
namespace IdleIntelligence.Runtime {
 [RequireComponent(typeof(CanvasRenderer))]
 public sealed class ShapeFrame:UnityEngine.UI.MaskableGraphic {
  public string Shape="research";public float Reveal=1;
  protected override void OnPopulateMesh(UnityEngine.UI.VertexHelper vh){vh.Clear();var rect=GetPixelAdjustedRect();var points=new List<Vector2>();int sides=Shape=="processor"?32:Shape=="core"?3:4;float rotation=Shape=="research"?45:90;for(int i=0;i<sides;i++){float a=(rotation+i*360f/sides)*Mathf.Deg2Rad;points.Add(new Vector2(Mathf.Cos(a),Mathf.Sin(a))*(Shape=="research"?1.35f:1));}if(sides<32){var cut=new List<Vector2>();for(int i=0;i<points.Count;i++){var p=points[i];cut.Add(Vector2.Lerp(p,points[(i+points.Count-1)%points.Count],.10f));cut.Add(Vector2.Lerp(p,points[(i+1)%points.Count],.10f));}points=cut;}
   // Equal visible bounds for all socket shapes, including chamfered triangles.
   float minX=float.MaxValue,minY=float.MaxValue,maxX=float.MinValue,maxY=float.MinValue;foreach(var point in points){minX=Mathf.Min(minX,point.x);maxX=Mathf.Max(maxX,point.x);minY=Mathf.Min(minY,point.y);maxY=Mathf.Max(maxY,point.y);}for(int i=0;i<points.Count;i++)points[i]=new Vector2((points[i].x-minX)/(maxX-minX)*2-1,(points[i].y-minY)/(maxY-minY)*2-1);
   var center=rect.center;float radius=Mathf.Min(rect.width,rect.height)*.47f;Vector2 Pos(Vector2 p,float inset){var a=center+p*(radius-inset);return new Vector2(Mathf.Round(a.x),Mathf.Round(a.y));}
   void Band(float outer,float inner,Color tint,bool light){for(int i=0;i<points.Count;i++){if((float)i/points.Count>=Reveal)continue;var a=points[i];var b=Vector2.Lerp(a,points[(i+1)%points.Count],Mathf.Clamp01(Reveal*points.Count-i));float strength=light?(a.y+b.y>0?1.25f:.65f):1;var c=new Color(Mathf.Min(1,tint.r*strength),Mathf.Min(1,tint.g*strength),Mathf.Min(1,tint.b*strength),tint.a);int n=vh.currentVertCount;foreach(var p in new[]{Pos(a,outer),Pos(b,outer),Pos(b,inner),Pos(a,inner)})vh.AddVert(p,c,Vector2.zero);vh.AddTriangle(n,n+1,n+2);vh.AddTriangle(n,n+2,n+3);}}
   var background=new Color(color.r*.08f,color.g*.1f,color.b*.12f,1);for(int i=0;i<points.Count;i++){int n=vh.currentVertCount;vh.AddVert(center,background,Vector2.zero);vh.AddVert(Pos(points[i],5),background,Vector2.zero);vh.AddVert(Pos(points[(i+1)%points.Count],5),background,Vector2.zero);vh.AddTriangle(n,n+1,n+2);}Band(0,1,GameTheme.Hex("030C14"),false);Band(1,3,color,true);Band(3,4,Color.Lerp(color,Color.white,.6f),true);Band(4,6,Color.Lerp(color,Color.black,.55f),true);Band(6,7,color,true);
  }
 }
}
