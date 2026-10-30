using System;
using System.Collections.Generic;
using UnityEngine;
using IdleIntelligence.Core;
namespace IdleIntelligence.Runtime
{
    /// <summary>
    /// Six distinct Unity-native pixel-art device sprites. Point-filtered and
    /// generated once per runtime, not cropped from unrelated legacy items.
    /// Designed for 32x32 icons and the existing socket/rarity frame.
    /// </summary>
    public static class UnityV3PixelArt
    {
        static readonly Dictionary<string,Sprite> Cache=new Dictionary<string,Sprite>();
        static readonly Color32 Transparent=new Color32(0,0,0,0);
        static Color32 Ink=new Color32(13,20,38,255),Steel=new Color32(73,96,126,255);
        static Color32 Cyan=new Color32(92,238,232,255),Green=new Color32(143,247,168,255);
        static Color32 Gold=new Color32(255,204,105,255),Purple=new Color32(188,126,255,255);
        static Color32 Pale=new Color32(232,246,255,255);
        static void P(Color32[] px,int x,int y,Color32 col){if(x>=0&&x<32&&y>=0&&y<32)px[y*32+x]=col;}
        static void Rect(Color32[] px,int x,int y,int w,int h,Color32 color)
        {for(int a=x;a<x+w;a++)for(int b=y;b<y+h;b++)P(px,a,b,color);}
        static void Border(Color32[] px,int x,int y,int w,int h,Color32 col)
        {Rect(px,x,y,w,1,col);Rect(px,x,y+h-1,w,1,col);Rect(px,x,y,1,h,col);Rect(px,x+w-1,y,1,h,col);}
        static void Line(Color32[] px,int x0,int y0,int x1,int y1,Color32 col)
        {int dx=Math.Abs(x1-x0),sx=x0<x1?1:-1,dy=-Math.Abs(y1-y0),sy=y0<y1?1:-1,err=dx+dy;while(true){P(px,x0,y0,col);if(x0==x1&&y0==y1)break;int e=2*err;if(e>=dy){err+=dy;x0+=sx;}if(e<=dx){err+=dx;y0+=sy;}}}
        static void Hex(Color32[] px,int cx,int cy,int rx,int ry,Color32 col)
        {Line(px,cx-rx,cy,cx-rx/2,cy+ry,col);Line(px,cx-rx/2,cy+ry,cx+rx/2,cy+ry,col);Line(px,cx+rx/2,cy+ry,cx+rx,cy,col);Line(px,cx+rx,cy,cx+rx/2,cy-ry,col);Line(px,cx+rx/2,cy-ry,cx-rx/2,cy-ry,col);Line(px,cx-rx/2,cy-ry,cx-rx,cy,col);}
        static void Draw(Color32[] px,string id)
        {
            Rect(px,5,4,22,24,Ink);Border(px,5,4,22,24,Steel);
            switch(id)
            {
                case "fleet-coordinator":
                    for(int x=8;x<=24;x+=8){Line(px,x,9,16,16,Cyan);Line(px,x,23,16,16,Cyan);}
                    Rect(px,12,12,9,9,Ink);Border(px,12,12,9,9,Gold);Rect(px,15,15,3,3,Pale);
                    for(int x=8;x<=24;x+=8){Rect(px,x-2,7,5,5,Steel);Rect(px,x-1,8,3,3,Green);Rect(px,x-2,21,5,5,Steel);Rect(px,x-1,22,3,3,Green);}break;
                case "gradient-buffer":
                    for(int y=8;y<=24;y+=4){Rect(px,8,y,16,2,Steel);Rect(px,8,y,2,2,Green);}
                    for(int x=10;x<=23;x++){P(px,x,11+x/5,Green);P(px,x,12+x/5,Cyan);}
                    Border(px,7,7,18,19,Gold);Rect(px,22,9,2,14,Cyan);break;
                case "overdrive-capacitor":
                    Rect(px,10,8,5,18,Steel);Rect(px,18,8,5,18,Steel);
                    for(int y=10;y<25;y+=4){Rect(px,11,y,3,2,Cyan);Rect(px,19,y,3,2,Gold);}
                    Line(px,15,17,18,17,Pale);Line(px,16,18,20,14,Purple);P(px,16,17,Pale);
                    Rect(px,8,6,17,2,Gold);Rect(px,8,26,17,2,Cyan);break;
                case "synthesis-coordinator":
                    Hex(px,16,16,11,10,Gold);Hex(px,16,16,8,7,Cyan);
                    Rect(px,12,12,9,9,Steel);Border(px,12,12,9,9,Pale);
                    Rect(px,15,15,3,3,Green);
                    Line(px,6,16,12,16,Gold);Line(px,21,16,26,16,Gold);break;
                case "singularity-lens":
                    Hex(px,16,16,11,11,Purple);Hex(px,16,16,8,8,Cyan);
                    Hex(px,16,16,5,5,Gold);Rect(px,15,15,3,3,Pale);
                    Line(px,16,5,16,11,Pale);Line(px,16,22,16,27,Pale);
                    Line(px,5,16,11,16,Pale);Line(px,22,16,27,16,Pale);break;
                case "axiom-anchor":
                    Hex(px,16,16,11,10,Purple);Line(px,16,24,16,8,Gold);
                    Line(px,16,24,9,16,Gold);Line(px,16,24,23,16,Gold);
                    Rect(px,14,19,5,5,Steel);Rect(px,15,20,3,3,Pale);
                    Rect(px,14,7,5,5,Steel);Rect(px,15,8,3,3,Cyan);break;
            }
        }
        public static Sprite Get(string id)
        {
            if(!UnityV3Catalog.IsAdded(id))return null;
            if(Cache.TryGetValue(id,out var found)&&found!=null)return found;
            var pixels=new Color32[32*32];
            for(int i=0;i<pixels.Length;i++)pixels[i]=Transparent;
            Draw(pixels,id);
            var texture=new Texture2D(32,32,TextureFormat.RGBA32,false){filterMode=FilterMode.Point,wrapMode=TextureWrapMode.Clamp,name="V3-"+id};
            texture.SetPixels32(pixels);texture.Apply(false,true);
            var sprite=Sprite.Create(texture,new Rect(0,0,32,32),new Vector2(.5f,.5f),32,0,SpriteMeshType.FullRect);
            sprite.name="V3-"+id;Cache[id]=sprite;return sprite;
        }
    }
}
