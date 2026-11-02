using UnityEngine;using UnityEngine.UI;
namespace IdleIntelligence.Runtime {
 [RequireComponent(typeof(CanvasRenderer))]
 public sealed class ModelLinks:MaskableGraphic {
  public bool[] Connected=new bool[6];
  protected override void OnPopulateMesh(VertexHelper vh){
   vh.Clear();var r=rectTransform.rect;
   void Line(Vector2 a,Vector2 b,float width,Color tint){var normal=new Vector2(-(b-a).y,(b-a).x).normalized*width*.5f;int n=vh.currentVertCount;foreach(var p in new[]{a+normal,b+normal,b-normal,a-normal})vh.AddVert(p,tint,Vector2.zero);vh.AddTriangle(n,n+1,n+2);vh.AddTriangle(n,n+2,n+3);}
   var grid=new Color(.12f,.45f,.55f,.12f);for(float x=-r.width*.4f;x<r.width*.45f;x+=16)Line(new Vector2(x,-r.height*.43f),new Vector2(x,r.height*.43f),.5f,grid);for(float y=-r.height*.4f;y<r.height*.45f;y+=16)Line(new Vector2(-r.width*.43f,y),new Vector2(r.width*.43f,y),.5f,grid);
   for(int i=0;i<6;i++){var p=ModelLoadout.Positions[i];float side=i<3?-1:1;Vector2 a=new Vector2(side*30,0),b=new Vector2(side*r.width*.23f,0),c=new Vector2(b.x,(p.y-.5f)*r.height),d=new Vector2((p.x-.5f)*r.width,c.y);var tint=Connected[i]?GameTheme.Accent:GameTheme.Hex("294552");Line(a,b,Connected[i]?2:1,tint);Line(b,c,Connected[i]?2:1,tint);Line(c,d,Connected[i]?2:1,tint);if(Connected[i])Line(c-Vector2.one*2,c+Vector2.one*2,3,GameTheme.Text);}
  }
 }
}
