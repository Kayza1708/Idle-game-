using System.Linq;using IdleIntelligence.Core;using UnityEngine;using UnityEngine.UI;
namespace IdleIntelligence.Runtime {
[RequireComponent(typeof(CanvasRenderer))]public sealed class NetworkWires:MaskableGraphic
{
 public static readonly Color[] Colors={new Color(.25f,.85f,1),new Color(.75f,.48f,1),new Color(.25f,1,.68f),new Color(1,.68f,.23f),new Color(1,.35f,.63f),new Color(.5f,.65f,1)};
 protected override void OnPopulateMesh(VertexHelper vh){vh.Clear();foreach(var n in PrestigeBalance.Nodes){var previous=PrestigeBalance.Nodes.FirstOrDefault(p=>p.Branch==n.Branch&&p.Depth==n.Depth-1);var a=previous==null?Vector2.zero:new Vector2((float)previous.X,(float)previous.Y);var b=new Vector2((float)n.X,(float)n.Y);var direction=(b-a).normalized;var normal=new Vector2(-direction.y,direction.x)*2; a+=direction*43;b-=direction*43;int v=vh.currentVertCount;var c=Colors[n.Branch];c.a=.68f;vh.AddVert(a-normal,c,Vector2.zero);vh.AddVert(a+normal,c,Vector2.zero);vh.AddVert(b+normal,c,Vector2.zero);vh.AddVert(b-normal,c,Vector2.zero);vh.AddTriangle(v,v+1,v+2);vh.AddTriangle(v,v+2,v+3);}}
}}
