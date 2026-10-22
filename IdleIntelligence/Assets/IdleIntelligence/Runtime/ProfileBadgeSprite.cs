using System;
using System.Collections.Generic;
using UnityEngine;

namespace IdleIntelligence.Runtime
{
    // Original native pixel icons matching public/assets/game/profile/badges/*.
    // Rarity metal and a distinct family symbol combine without a large texture atlas.
    // Purely visual: claiming achievements and saving currency never happens here.
    public static class ProfileBadgeSprite
    {
        static readonly Dictionary<string, Sprite> Cache=new Dictionary<string, Sprite>();

        static Color32 Metal(int tier)
        {
            return tier>=3?new Color32(248,190,82,255):
                   tier==2?new Color32(167,216,236,255):
                            new Color32(211,138,89,255);
        }

        public static Sprite Get(string family,int tier)
        {
            tier=Mathf.Clamp(tier,1,3);
            string key=family+":"+tier;
            if(Cache.TryGetValue(key,out var existing))return existing;
            const int w=80,h=88;
            var pixels=new Color32[w*h];
            var rim=Metal(tier);
            var shine=tier>=3?new Color32(255,238,162,255):
                      tier==2?new Color32(236,255,255,255):
                               new Color32(255,205,147,255);
            var shadow=tier>=3?new Color32(128,76,39,255):
                        tier==2?new Color32(50,79,116,255):
                                 new Color32(102,57,47,255);
            var back=new Color32(28,40,73,255);
            var accent=new Color32(112,233,218,255);
            if(family=="prestige")accent=new Color32(212,155,255,255);
            if(family=="challenge")accent=new Color32(255,134,163,255);
            if(family=="company-trader")accent=new Color32(255,197,103,255);
            if(family=="achievement")accent=new Color32(255,240,147,255);
            if(family=="hardware")accent=new Color32(130,195,255,255);

            void Pixel(int x,int y,Color32 c){if(x>=0&&x<w&&y>=0&&y<h)pixels[y*w+x]=c;}
            void Rect(int x0,int y0,int x1,int y1,Color32 c)
            {for(int y=y0;y<=y1;y++)for(int x=x0;x<=x1;x++)Pixel(x,y,c);}
            void Circle(int cx,int cy,int r,Color32 c)
            {for(int y=-r;y<=r;y++)for(int x=-r;x<=r;x++)if(x*x+y*y<=r*r)Pixel(cx+x,cy+y,c);}
            void Line(int x0,int y0,int x1,int y1,Color32 c,int thick=2)
            {
                int dx=Math.Abs(x1-x0),sx=x0<x1?1:-1,dy=-Math.Abs(y1-y0),sy=y0<y1?1:-1,e=dx+dy;
                while(true){Rect(x0-thick/2,y0-thick/2,x0+thick/2,y0+thick/2,c);if(x0==x1&&y0==y1)break;int ee=2*e;if(ee>=dy){e+=dy;x0+=sx;}if(ee<=dx){e+=dx;y0+=sy;}}
            }
            // Short pair of ribbons below the large medal.
            Line(24,34,19,3,shadow,11);Line(56,34,61,3,shadow,11);
            Line(24,34,19,7,rim,6);Line(56,34,61,7,rim,6);
            Circle(40,52,33,shadow);Circle(40,53,31,rim);Circle(40,53,27,shine);
            Circle(40,53,24,back);Circle(40,53,21,new Color32(38,54,89,255));
            // One recognizable silhouette per badge family, legible at 48-64px.
            switch(family)
            {
                case "company-founder":
                    Line(24,54,40,68,accent,4);Line(40,68,56,54,accent,4);
                    Rect(26,40,54,54,accent);Rect(32,40,47,48,back);Rect(38,40,42,47,shine);
                    break;
                case "company-contributor":
                    Line(40,71,40,59,accent,4);Line(33,59,47,59,accent,3);
                    Line(38,60,25,42,accent,3);Line(42,60,55,42,accent,3);
                    Line(25,42,55,42,accent,3);Rect(33,43,46,48,accent);
                    break;
                case "company-trader":
                    Line(25,61,53,61,accent,4);Line(46,68,53,61,accent,4);Line(46,54,53,61,accent,4);
                    Line(55,45,27,45,shine,4);Line(34,52,27,45,shine,4);Line(34,38,27,45,shine,4);
                    break;
                case "prestige":
                    Circle(40,53,14,accent);Circle(40,53,9,back);Rect(43,63,58,77,back);
                    Line(52,58,55,65,accent,4);Line(55,65,47,65,accent,4);
                    Rect(37,50,43,56,shine);
                    break;
                case "challenge":
                    Line(27,69,53,69,accent,4);Line(27,69,30,47,accent,4);
                    Line(53,69,50,47,accent,4);Line(30,47,40,38,accent,4);Line(50,47,40,38,accent,4);
                    Line(33,54,47,54,shine,3);Line(40,61,40,46,shine,3);
                    break;
                case "hardware":
                    Rect(29,42,51,64,accent);Rect(35,48,45,58,back);
                    for(int x=31;x<=49;x+=8){Line(x,65,x,71,shine,2);Line(x,36,x,42,shine,2);}
                    for(int y=46;y<=62;y+=8){Line(23,y,29,y,shine,2);Line(51,y,57,y,shine,2);}
                    break;
                default:
                    for(int p=0;p<10;p++){double a=p*Math.PI/5.0-Math.PI/2;
                        int rad=p%2==0?19:9;
                        int nx=40+(int)(Math.Cos(a)*rad),ny=53+(int)(Math.Sin(a)*rad);
                        int rad2=(p+1)%2==0?19:9;double b=(p+1)*Math.PI/5.0-Math.PI/2;
                        Line(nx,ny,40+(int)(Math.Cos(b)*rad2),53+(int)(Math.Sin(b)*rad2),accent,3);}
                    Circle(40,53,5,shine);
                    break;
            }
            Rect(19,74,22,77,shine);Rect(56,29,59,32,shine);
            var texture=new Texture2D(w,h,TextureFormat.RGBA32,false);
            texture.filterMode=FilterMode.Point;
            texture.wrapMode=TextureWrapMode.Clamp;
            texture.SetPixels32(pixels);texture.Apply(false,true);
            var sprite=Sprite.Create(texture,new Rect(0,0,w,h),new Vector2(.5f,.5f),80f);
            sprite.name="ProfileBadge-"+key;
            Cache.Add(key,sprite);
            return sprite;
        }
    }

    public static class ProfileFrameSprite
    {
        static readonly Dictionary<string, Sprite> Cache=new Dictionary<string,Sprite>();

        public static Sprite Get(string id)
        {
            id=string.IsNullOrEmpty(id)?"basic":id;
            if(Cache.TryGetValue(id,out var sprite))return sprite;
            Color32 edge=new Color32(68,111,137,255),shine=new Color32(141,207,228,255);
            switch(id)
            {
                case "founder":edge=new Color32(125,75,45,255);shine=new Color32(249,189,109,255);break;
                case "bronze-lab":edge=new Color32(121,62,54,255);shine=new Color32(232,157,91,255);break;
                case "silver-lab":edge=new Color32(67,102,139,255);shine=new Color32(198,239,255,255);break;
                case "gold-lab":edge=new Color32(138,89,38,255);shine=new Color32(255,219,111,255);break;
                case "neon":edge=new Color32(132,50,128,255);shine=new Color32(255,112,215,255);break;
                case "quantum":edge=new Color32(71,51,145,255);shine=new Color32(178,148,255,255);break;
                case "singularity":edge=new Color32(115,64,167,255);shine=new Color32(129,248,223,255);break;
            }
            const int w=96;var pixels=new Color32[w*w];
            void Box(int x0,int y0,int x1,int y1,Color32 c)
            {for(int y=y0;y<=y1;y++)for(int x=x0;x<=x1;x++)if(x>=0&&x<w&&y>=0&&y<w)pixels[y*w+x]=c;}
            // Corner-joined frame, transparent interior: can overlay a real avatar later.
            Box(10,5,85,10,edge);Box(10,85,85,90,edge);Box(5,10,10,85,edge);Box(85,10,90,85,edge);
            Box(12,7,83,9,shine);Box(12,86,83,88,shine);Box(7,12,9,83,shine);Box(86,12,88,83,shine);
            Box(3,3,20,14,shine);Box(76,3,92,14,shine);
            Box(3,82,20,92,shine);Box(76,82,92,92,shine);
            Box(13,13,19,19,edge);Box(77,13,83,19,edge);
            Box(13,77,19,83,edge);Box(77,77,83,83,edge);
            var texture=new Texture2D(w,w,TextureFormat.RGBA32,false);
            texture.filterMode=FilterMode.Point;texture.wrapMode=TextureWrapMode.Clamp;
            texture.SetPixels32(pixels);texture.Apply(false,true);
            sprite=Sprite.Create(texture,new Rect(0,0,w,w),new Vector2(.5f,.5f),96f);
            sprite.name="ProfileFrame-"+id;Cache.Add(id,sprite);
            return sprite;
        }
    }
}
