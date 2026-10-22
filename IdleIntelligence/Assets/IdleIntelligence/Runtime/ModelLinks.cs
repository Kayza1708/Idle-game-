using UnityEngine;using UnityEngine.UI;
namespace IdleIntelligence.Runtime {
 [RequireComponent(typeof(CanvasRenderer))]
 public sealed class ModelLinks:MaskableGraphic {
  public bool[] Connected=new bool[6];protected override void OnPopulateMesh(VertexHelper vh){vh.Clear();var r=rectTransform.rect;for(int i=0;i<6;i++){var p=ModelLoadout.Positions[i];Vector2 a=Vector2.zero,b=new Vector2((p.x-.5f)*r.width,(p.y-.5f)*r.height);var normal=new Vector2(-b.y,b.x).normalized*.65f;int n=vh.currentVertCount;Color tint=Connected[i]?GameTheme.Hex("3C8D92"):GameTheme.Hex("243E50");foreach(var v in new[]{a+normal,b+normal,b-normal,a-normal})vh.AddVert(v,tint,Vector2.zero);vh.AddTriangle(n,n+1,n+2);vh.AddTriangle(n,n+2,n+3);}}
 }
}
