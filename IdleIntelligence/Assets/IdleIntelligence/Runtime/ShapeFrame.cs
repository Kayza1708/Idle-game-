using UnityEngine;
using UnityEngine.UI;
namespace IdleIntelligence.Runtime {
    [RequireComponent(typeof(CanvasRenderer))]
    public sealed class ShapeFrame:MaskableGraphic
    {
        public string Shape="research";
        protected override void OnPopulateMesh(VertexHelper vh)
        {
            vh.Clear();var rect=GetPixelAdjustedRect();int count=Shape=="processor"?48:Shape=="core"?3:4;float rotation=Shape=="research"?45:90;var center=rect.center;float radius=Mathf.Min(rect.width,rect.height)*.47f;
            for(int i=0;i<count;i++)
            {
                float a=(rotation+i*360f/count)*Mathf.Deg2Rad,b=(rotation+(i+1)*360f/count)*Mathf.Deg2Rad;var pa=new Vector2(Mathf.Cos(a),Mathf.Sin(a));var pb=new Vector2(Mathf.Cos(b),Mathf.Sin(b));if(count==4&&Shape=="research"){pa*=1.35f;pb*=1.35f;}
                var tint=new Color(color.r*.19f,color.g*.19f,color.b*.19f,.96f);int fill=vh.currentVertCount;vh.AddVert(center,tint,Vector2.zero);vh.AddVert(center+pa*(radius-4),tint,Vector2.zero);vh.AddVert(center+pb*(radius-4),tint,Vector2.zero);vh.AddTriangle(fill,fill+1,fill+2);int v=vh.currentVertCount;vh.AddVert(center+pa*radius,color,Vector2.zero);vh.AddVert(center+pb*radius,color,Vector2.zero);vh.AddVert(center+pb*(radius-4),color,Vector2.zero);vh.AddVert(center+pa*(radius-4),color,Vector2.zero);vh.AddTriangle(v,v+1,v+2);vh.AddTriangle(v,v+2,v+3);
            }
        }
    }
}
