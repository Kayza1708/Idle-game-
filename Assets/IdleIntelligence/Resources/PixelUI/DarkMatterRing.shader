Shader "IdleIntelligence/UI/DarkMatterRing" {
 Properties {
  [PerRendererData] _MainTex ("Sprite",2D)="white"{}
  _StencilComp ("Stencil Comparison",Float)=8
  _Stencil ("Stencil ID",Float)=0
  _StencilOp ("Stencil Operation",Float)=0
  _StencilWriteMask ("Stencil Write Mask",Float)=255
  _StencilReadMask ("Stencil Read Mask",Float)=255
  _ColorMask ("Color Mask",Float)=15
  [Toggle(UNITY_UI_ALPHACLIP)] _UseUIAlphaClip ("Use Alpha Clip",Float)=0
 }
 SubShader {
  Tags {"Queue"="Transparent" "IgnoreProjector"="True" "RenderType"="Transparent"}
  Stencil {Ref [_Stencil] Comp [_StencilComp] Pass [_StencilOp] ReadMask [_StencilReadMask] WriteMask [_StencilWriteMask]}
  Cull Off Lighting Off ZWrite Off ZTest [unity_GUIZTestMode]
  Blend SrcAlpha OneMinusSrcAlpha ColorMask [_ColorMask]
  Pass {
   CGPROGRAM
   #pragma vertex vert
   #pragma fragment frag
   #pragma target 3.0
   #pragma multi_compile_local _ UNITY_UI_CLIP_RECT
   #pragma multi_compile_local _ UNITY_UI_ALPHACLIP
   #include "UnityCG.cginc"
   #include "UnityUI.cginc"
   struct appdata {float4 vertex:POSITION;fixed4 color:COLOR;float4 uv:TEXCOORD0;};
   struct v2f {float4 vertex:SV_POSITION;fixed4 color:COLOR;float4 uv:TEXCOORD0;float4 world:TEXCOORD1;};
   float4 _ClipRect;
   v2f vert(appdata v){v2f o;o.world=v.vertex;o.vertex=UnityObjectToClipPos(v.vertex);o.uv=v.uv;o.color=v.color;return o;}
   float hash(float2 p){p=frac(p*float2(123.34,456.21));p+=dot(p,p+45.32);return frac(p.x*p.y);}
   float noise(float2 p){float2 q=floor(p),f=frac(p);f=f*f*(3-2*f);return lerp(lerp(hash(q),hash(q+float2(1,0)),f.x),lerp(hash(q+float2(0,1)),hash(q+1),f.x),f.y);}
   float fbm(float2 p){return noise(p)*.57+noise(p*2.03+17.7)*.28+noise(p*4.13+31.2)*.15;}
   fixed4 frag(v2f i):SV_Target {
    float2 p=(i.uv.xy-.5)*2;
    float2 a=abs(p);
    // Octagonal annulus. Its empty centre is strictly untouched, including the glow.
    float r=max(max(a.x,a.y),dot(a,float2(.70710678,.70710678)));
    float aa=max(fwidth(r),.003);
    float band=smoothstep(.715-aa,.715+aa,r)*(1-smoothstep(.935-aa,.935+aa,r));
    float t=i.uv.z;
    // Closed 24-second time path avoids a visible reset at the phase boundary.
    float angle=t*6.2831853/24;
    float2 drift=float2(cos(angle),sin(angle))*2.1;
    float2 q=p*4;
    float2 warp=float2(fbm(q+drift),fbm(q+float2(9,3)-drift));
    float cloud=fbm(q+warp*3+drift*.7);
    float vein=abs(fbm(q*1.8+warp*4-drift)-.5);
    float filament=pow(saturate(1-vein*12),5);
    float ember=pow(saturate(cloud*1.45-.25),3);
    float3 ink=float3(.018,.006,.055);
    float3 purple=float3(.27,.025,.63);
    float3 plasma=float3(.78,.18,1);
    float3 rgb=lerp(ink,purple,smoothstep(.22,.73,cloud));
    rgb+=plasma*ember*.9;
    rgb+=lerp(float3(.32,.13,1),float3(1,.65,1),cloud)*filament*.95;
    // Narrow polished bevels catch the same flowing light as the surface.
    float bevel=exp(-abs(r-.73)*160)+exp(-abs(r-.922)*160);
    rgb+=float3(.48,.29,.88)*bevel*(.25+.75*cloud);
    float halo=exp(-abs(r-.94)*55)*.24*(.4+cloud);
    float alpha=band+halo*(1-band);
    alpha*=smoothstep(.70,.716,r)*(1-smoothstep(.97,1,r));
    rgb=lerp(float3(.30,.06,.60),rgb,band);
    fixed4 c=fixed4(rgb,alpha)*i.color;
    #ifdef UNITY_UI_CLIP_RECT
    c.a*=UnityGet2DClipping(i.world.xy,_ClipRect);
    #endif
    #ifdef UNITY_UI_ALPHACLIP
    clip(c.a-.001);
    #endif
    return c;
   }
   ENDCG
  }
 }
}
