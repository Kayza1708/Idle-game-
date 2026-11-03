using UnityEngine;
using UnityEngine.UI;
namespace IdleIntelligence.Runtime
{
    // One reusable vector mesh: no particles, textures, materials or per-tick objects.
    // Motion communicates the active identity or an available primary action.
    [RequireComponent(typeof(CanvasRenderer))]
    public sealed class FlowAccent : MaskableGraphic
    {
        public enum Contour { Rail, Portrait, Window }
        public Contour Shape { get; private set; }
        public float Phase { get; private set; }
        public bool IsAnimating { get; private set; }
        public int MeshRevision { get; private set; }
        GameRuntime game;Button action;bool motion=true,paused;double nextTick,epoch;
        readonly Vector2[] corners=new Vector2[8];
        static int budgetFrame=-1,movingInFrame;
        public static FlowAccent Attach(Transform target,GameRuntime runtime,Contour shape,Color tint,Button ready=null,bool animate=true)
        {
            var child=target.Find("FlowAccent");
            var effect=child!=null?child.GetComponent<FlowAccent>():null;
            if(effect==null){var node=WorkshopUIFactory.Node("FlowAccent",target,typeof(CanvasRenderer),typeof(FlowAccent),typeof(LayoutElement));effect=node.GetComponent<FlowAccent>();node.GetComponent<LayoutElement>().ignoreLayout=true;WorkshopUIFactory.Fill(effect.rectTransform);}
            if(runtime!=null)effect.game=runtime;effect.action=ready;effect.Shape=shape;effect.motion=animate;effect.color=tint;effect.raycastTarget=false;
            effect.gameObject.SetActive(true);effect.SetVerticesDirty();return effect;
        }
        protected override void OnEnable(){base.OnEnable();epoch=Time.unscaledTimeAsDouble;nextTick=0;raycastTarget=false;}
        void OnApplicationPause(bool value)=>paused=value;
        void Update()
        {
            if(game==null)game=Object.FindFirstObjectByType<GameRuntime>();
            bool allowed=motion&&!paused&&game?.State!=null&&game.State.Settings.effects&&!game.State.Workshop.reducedMotion&&(action==null||action.IsInteractable());
            if(!Application.isBatchMode&&!Application.isFocused)allowed=false;
            if(allowed&&(canvasRenderer.cull||canvas==null||!canvas.isActiveAndEnabled)){IsAnimating=false;return;}
            if(allowed){if(budgetFrame!=Time.frameCount){budgetFrame=Time.frameCount;movingInFrame=0;}allowed=movingInFrame<6;if(allowed)movingInFrame++;}
            if(!allowed){if(IsAnimating||Phase!=0){IsAnimating=false;Phase=0;SetVerticesDirty();}return;}
            double now=Time.unscaledTimeAsDouble;if(now<nextTick)return;nextTick=now+.05;
            IsAnimating=true;Phase=(float)((now-epoch)/5.5%1);SetVerticesDirty();
        }
        Vector2 Point(float t,Rect rect)
        {
            if(Shape==Contour.Rail)return new Vector2(Mathf.Lerp(rect.xMin+6,rect.xMax-6,t),rect.yMin+3);
            float edge=t*8;int i=Mathf.Min(7,(int)edge);return Vector2.Lerp(corners[i],corners[(i+1)%8],edge-i);
        }
        void Segment(VertexHelper mesh,Vector2 a,Vector2 b,float thickness,Color tint)
        {
            var normal=new Vector2(-(b-a).y,(b-a).x).normalized*thickness*.5f;int n=mesh.currentVertCount;
            mesh.AddVert(a-normal,tint,Vector2.zero);mesh.AddVert(b-normal,tint,Vector2.zero);mesh.AddVert(b+normal,tint,Vector2.zero);mesh.AddVert(a+normal,tint,Vector2.zero);
            mesh.AddTriangle(n,n+1,n+2);mesh.AddTriangle(n,n+2,n+3);
        }
        protected override void OnPopulateMesh(VertexHelper mesh)
        {
            mesh.Clear();MeshRevision++;var rect=GetPixelAdjustedRect();if(rect.width<12||rect.height<8)return;
            rect.xMin+=3;rect.xMax-=3;rect.yMin+=3;rect.yMax-=3;
            float cut=Mathf.Min(rect.width,rect.height)*(Shape==Contour.Portrait?.22f:.065f);
            corners[0]=new Vector2(rect.xMin+cut,rect.yMax);corners[1]=new Vector2(rect.xMax-cut,rect.yMax);corners[2]=new Vector2(rect.xMax,rect.yMax-cut);corners[3]=new Vector2(rect.xMax,rect.yMin+cut);
            corners[4]=new Vector2(rect.xMax-cut,rect.yMin);corners[5]=new Vector2(rect.xMin+cut,rect.yMin);corners[6]=new Vector2(rect.xMin,rect.yMin+cut);corners[7]=new Vector2(rect.xMin,rect.yMax-cut);
            const int segments=64;bool ready=action==null||action.IsInteractable();
            for(int i=0;i<segments;i++){
                float t=(float)i/segments;var a=Point(t,rect);var b=Point((i+1f)/segments,rect);
                float distance=Mathf.Repeat(Phase-t+1,1);float trail=IsAnimating?Mathf.Clamp01(1-distance/.17f):0;
                var baseColor=color;baseColor.a*=ready?.24f:.10f;Segment(mesh,a,b,.9f,baseColor);
                if(trail<=0)continue;
                var glow=color;glow.a*=trail*.12f;Segment(mesh,a,b,5,glow);
                var light=Color.Lerp(color,GameTheme.Text,trail*.6f);light.a=color.a*trail*.85f;Segment(mesh,a,b,1.4f,light);
            }
        }
    }
}
