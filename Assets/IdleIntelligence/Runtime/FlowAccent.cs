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
        public Color CurrentTint => IsAnimating?Spectrum(Phase):color;
        RectTransform emblem;Image emblemArt;Text identity;Color emblemRest=Color.white,identityRest=Color.white;
        GameRuntime game;Button action;bool motion=true,paused;double nextTick,epoch;
        readonly Vector2[] corners=new Vector2[8];
        static int budgetFrame=-1,movingInFrame;
        public static FlowAccent Attach(Transform target,GameRuntime runtime,Contour shape,Color tint,Button ready=null,bool animate=true)
        {
            var child=target.Find("FlowAccent");
            var effect=child!=null?child.GetComponent<FlowAccent>():null;
            if(effect==null){var node=WorkshopUIFactory.Node("FlowAccent",target,typeof(CanvasRenderer),typeof(FlowAccent),typeof(LayoutElement));effect=node.GetComponent<FlowAccent>();node.GetComponent<LayoutElement>().ignoreLayout=true;WorkshopUIFactory.Fill(effect.rectTransform);}
            if(runtime!=null)effect.game=runtime;effect.action=ready;effect.Shape=shape;effect.motion=animate;effect.color=tint;effect.raycastTarget=false;
            effect.emblem=shape==Contour.Portrait&&target.parent!=null?target.parent.Find("ProfileEmblem") as RectTransform:null;if(effect.emblem!=null&&effect.emblemArt==null){effect.emblemArt=effect.emblem.GetComponent<Image>();effect.emblemRest=effect.emblemArt.color;}effect.gameObject.SetActive(true);effect.SetVerticesDirty();return effect;
        }
        protected override void OnEnable(){base.OnEnable();epoch=Time.unscaledTimeAsDouble;nextTick=0;raycastTarget=false;}
        void ResetLivingArt(){if(emblem!=null)emblem.localScale=Vector3.one;if(emblemArt!=null)emblemArt.color=emblemRest;if(identity!=null)identity.color=identityRest;}
        protected override void OnDisable(){ResetLivingArt();base.OnDisable();}
        void OnApplicationPause(bool value)=>paused=value;
        void Update()
        {
            if(game==null)game=Object.FindFirstObjectByType<GameRuntime>();
            bool allowed=motion&&!paused&&game?.State!=null&&game.State.Settings.effects&&!game.State.Workshop.reducedMotion&&(action==null||action.IsInteractable());
            if(!Application.isBatchMode&&!Application.isFocused)allowed=false;
            if(allowed&&(canvasRenderer.cull||canvas==null||!canvas.isActiveAndEnabled)){IsAnimating=false;return;}
            if(allowed){if(budgetFrame!=Time.frameCount){budgetFrame=Time.frameCount;movingInFrame=0;}allowed=movingInFrame<6;if(allowed)movingInFrame++;}
            if(!allowed){if(IsAnimating||Phase!=0){IsAnimating=false;Phase=0;ResetLivingArt();SetVerticesDirty();}return;}
            double now=Time.unscaledTimeAsDouble;if(now<nextTick)return;nextTick=now+1d/30;
            IsAnimating=true;Phase=(float)((now-epoch)/6%1);if(emblem!=null){
                emblem.localScale=Vector3.one*(1+.045f*Mathf.Sin(Phase*Mathf.PI*4));
                if(emblemArt!=null)emblemArt.color=Color.Lerp(emblemRest,CurrentTint,.18f);
                if(identity==null){var node=emblem.parent.parent.Find("ProfileIdentityCopy/ProfileIdentityText");if(node!=null){identity=node.GetComponent<Text>();identityRest=identity.color;}}
                if(identity!=null)identity.color=Color.Lerp(identityRest,CurrentTint,.38f);
            }SetVerticesDirty();
        }
        static Color Spectrum(float position)
        {
            float t=Mathf.Repeat(position,1)*3;
            var cyan=GameTheme.Accent;var violet=GameTheme.AuroraViolet;var pink=GameTheme.AuroraPink;
            return t<1?Color.Lerp(cyan,violet,t):t<2?Color.Lerp(violet,pink,t-1):Color.Lerp(pink,cyan,t-2);
        }
        void Aura(VertexHelper mesh,Rect rect)
        {
            float radius=Mathf.Min(rect.width,rect.height)*.435f;
            for(int orbit=0;orbit<2;orbit++)for(int i=0;i<56;i++){
                float t=i/56f;float angle=(t+Phase*(orbit==0?1:-1)+orbit*.37f)*Mathf.PI*2;
                float end=angle+Mathf.PI*2/56;float envelope=Mathf.Pow(Mathf.Sin(t*Mathf.PI),2);
                var a=rect.center+new Vector2(Mathf.Cos(angle),Mathf.Sin(angle)*.86f)*radius;
                var b=rect.center+new Vector2(Mathf.Cos(end),Mathf.Sin(end)*.86f)*radius;
                var tint=Spectrum(t+Phase+orbit*.35f);tint.a=.10f*envelope;Segment(mesh,a,b,8,tint);tint.a=.62f*envelope;Segment(mesh,a,b,1.5f,tint);
            }
            for(int i=0;i<4;i++){
                float angle=(Phase+i*.25f)*Mathf.PI*2;var point=rect.center+new Vector2(Mathf.Cos(angle),Mathf.Sin(angle)*.86f)*radius;
                var tint=Spectrum(Phase+i*.25f);tint.a=.18f;Segment(mesh,point-Vector2.right*3,point+Vector2.right*3,6,tint);
                tint=Color.Lerp(tint,GameTheme.Text,.65f);tint.a=.95f;Segment(mesh,point-Vector2.right*.9f,point+Vector2.right*.9f,1.8f,tint);
            }
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
            rect.xMin+=5;rect.xMax-=5;rect.yMin+=5;rect.yMax-=5;
            float cut=Mathf.Min(rect.width,rect.height)*(Shape==Contour.Portrait?.22f:.065f);
            corners[0]=new Vector2(rect.xMin+cut,rect.yMax);corners[1]=new Vector2(rect.xMax-cut,rect.yMax);corners[2]=new Vector2(rect.xMax,rect.yMax-cut);corners[3]=new Vector2(rect.xMax,rect.yMin+cut);
            corners[4]=new Vector2(rect.xMax-cut,rect.yMin);corners[5]=new Vector2(rect.xMin+cut,rect.yMin);corners[6]=new Vector2(rect.xMin,rect.yMin+cut);corners[7]=new Vector2(rect.xMin,rect.yMax-cut);
            if(Shape==Contour.Portrait&&IsAnimating)Aura(mesh,rect);
            const int segments=64;bool ready=action==null||action.IsInteractable();
            for(int i=0;i<segments;i++){
                float t=(float)i/segments;var a=Point(t,rect);var b=Point((i+1f)/segments,rect);
                float distance=Mathf.Repeat(Phase-t+1,1);float trail=IsAnimating?Mathf.Clamp01(1-distance/.27f):0;
                var baseColor=IsAnimating?Spectrum(t-Phase):color;baseColor.a*=ready?(IsAnimating?.72f:.42f):.10f;Segment(mesh,a,b,IsAnimating?2:1.2f,baseColor);
                if(trail<=0)continue;
                var glow=Spectrum(t-Phase);glow.a*=trail*.26f;Segment(mesh,a,b,9,glow);
                var light=Color.Lerp(Spectrum(t-Phase),GameTheme.Text,trail*.6f);light.a=color.a*trail*.85f;Segment(mesh,a,b,2.4f,light);
            }
        }
    }
}
