using UnityEngine;
using UnityEngine.UI;

namespace IdleIntelligence.Runtime
{
 // Orthographic projection of a lid rotating about its back edge. Points on the
 // hinge stay fixed; the visible face changes as the lid turns away from us.
 [RequireComponent(typeof(Image))]
 public sealed class HingedLidMesh : BaseMeshEffect
 {
  public Sprite Exterior,Interior;
  public float Opening { get; private set; }
  public void SetOpening(float value)
  {
   Opening=Mathf.Clamp01(value);
   float radians=Opening*104*Mathf.Deg2Rad;
   var image=(Image)graphic;image.sprite=Mathf.Cos(radians)-.92f*Mathf.Sin(radians)>=0?Exterior:Interior;
   graphic.SetVerticesDirty();
  }
  public Vector2 Project(Vector2 point)
  {
   float slope=-8*Mathf.Deg2Rad,c=Mathf.Cos(slope),s=Mathf.Sin(slope);
   float along=c*point.x+s*point.y,depth=-s*point.x+c*point.y;
   float angle=Opening*104*Mathf.Deg2Rad;
   depth*=Mathf.Cos(angle)-.92f*Mathf.Sin(angle);
   return new Vector2(c*along-s*depth,s*along+c*depth);
  }
  public override void ModifyMesh(VertexHelper vertices)
  {
   if(!IsActive())return;
   var vertex=new UIVertex();
   for(int i=0;i<vertices.currentVertCount;i++){vertices.PopulateUIVertex(ref vertex,i);var point=Project(vertex.position);vertex.position=new Vector3(point.x,point.y,0);vertices.SetUIVertex(vertex,i);}
  }
 }
}
