using UnityEngine;
namespace IdleIntelligence.Runtime
{
 // Small original pixel-sprite counterpart to public/assets/game/gumball-voucher.svg.
 // Generated once from pixel geometry: no external asset package, no screenshots in the UI.
 public static class VoucherSprite
 {
  static Sprite cached;
  public static Sprite Get()
  {
   if(cached!=null)return cached;
   const int w=64,h=48;
   var pixels=new Color32[w*h];
   Color32 clear=new Color32(0,0,0,0),
    outer=new Color32(252,182,67,255),inner=new Color32(89,43,170,255),
    main=new Color32(29,35,94,255),line=new Color32(167,109,254,255);
   for(int i=0;i<pixels.Length;i++)pixels[i]=clear;
   void Pixel(int x,int y,Color32 color){if(x>=0&&x<w&&y>=0&&y<h)pixels[y*w+x]=color;}
   void Box(int x0,int y0,int x1,int y1,Color32 color){for(int y=y0;y<=y1;y++)for(int x=x0;x<=x1;x++)Pixel(x,y,color);}
   void Circle(int cx,int cy,int radius,Color32 color){for(int y=-radius;y<=radius;y++)for(int x=-radius;x<=radius;x++)if(x*x+y*y<=radius*radius)Pixel(cx+x,cy+y,color);}
   Box(4,9,58,37,outer);Box(7,12,56,34,inner);Box(10,15,52,31,main);
   Box(52,10,58,36,new Color32(255,148,71,255));for(int y=13;y<35;y+=5)Box(53,y,57,y+1,line);
   Circle(31,23,16,line);Circle(31,23,14,new Color32(103,180,240,255));
   Circle(31,23,12,new Color32(35,65,151,255));
   Circle(23,20,5,new Color32(255,163,67,255));Circle(35,20,5,new Color32(255,95,190,255));
   Circle(29,30,6,new Color32(133,99,255,255));Circle(39,28,4,new Color32(92,218,244,255));
   Circle(20,30,4,new Color32(255,216,104,255));
   Box(14,13,40,14,new Color32(240,223,255,255));
   var texture=new Texture2D(w,h,TextureFormat.RGBA32,false);
   texture.filterMode=FilterMode.Point;texture.wrapMode=TextureWrapMode.Clamp;texture.SetPixels32(pixels);texture.Apply(false,true);
   cached=Sprite.Create(texture,new Rect(0,0,w,h),new Vector2(.5f,.5f),64);cached.name="GumballVoucherPixel";
   return cached;
  }
 }
}
