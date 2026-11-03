using UnityEngine;
namespace IdleIntelligence.Runtime {
 // Small vector symbols share the existing uGUI tint and never intercept input.
 [RequireComponent(typeof(CanvasRenderer))]
 public sealed class CompactGlyph:UnityEngine.UI.MaskableGraphic {
  public enum Symbol {Lock,Save,Menu,AdFree} public Symbol Kind;
  protected override void OnPopulateMesh(UnityEngine.UI.VertexHelper vh){vh.Clear();var r=GetPixelAdjustedRect();
   void Box(float x,float y,float w,float h){int n=vh.currentVertCount;foreach(var p in new[]{new Vector2(x,y),new Vector2(x+w,y),new Vector2(x+w,y+h),new Vector2(x,y+h)})vh.AddVert(new Vector3(r.x+p.x*r.width,r.y+p.y*r.height),color,Vector2.zero);vh.AddTriangle(n,n+1,n+2);vh.AddTriangle(n,n+2,n+3);}
   if(Kind==Symbol.AdFree){
    Box(.1f,.2f,.8f,.08f);Box(.1f,.73f,.8f,.08f);Box(.1f,.2f,.08f,.61f);Box(.82f,.2f,.08f,.61f);
    void Triangle(Vector2 a,Vector2 b,Vector2 c){int n=vh.currentVertCount;foreach(var p in new[]{a,b,c})vh.AddVert(new Vector3(r.x+p.x*r.width,r.y+p.y*r.height),color,Vector2.zero);vh.AddTriangle(n,n+1,n+2);}
    Triangle(new Vector2(.38f,.36f),new Vector2(.38f,.65f),new Vector2(.66f,.505f));
    Triangle(new Vector2(.05f,.08f),new Vector2(.15f,.04f),new Vector2(.95f,.92f));Triangle(new Vector2(.05f,.08f),new Vector2(.95f,.92f),new Vector2(.85f,.96f));
   }else if(Kind==Symbol.Menu){Box(.14f,.72f,.72f,.1f);Box(.14f,.45f,.72f,.1f);Box(.14f,.18f,.72f,.1f);}else if(Kind==Symbol.Lock){Box(.14f,.05f,.72f,.53f);Box(.25f,.5f,.12f,.33f);Box(.63f,.5f,.12f,.33f);Box(.25f,.8f,.5f,.12f);}else{Box(.08f,.08f,.12f,.84f);Box(.8f,.08f,.12f,.84f);Box(.08f,.08f,.84f,.12f);Box(.08f,.8f,.84f,.12f);Box(.3f,.55f,.4f,.25f);Box(.32f,.15f,.36f,.25f);}
  }
 }
}
