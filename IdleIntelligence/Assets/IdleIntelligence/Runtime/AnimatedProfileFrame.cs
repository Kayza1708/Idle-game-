using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

namespace IdleIntelligence.Runtime
{
    /// <summary>
    /// Short-frame pixel sparkle for earnable and premium rarity borders.
    /// Cosmetic only; frame ownership and purchases remain server-authoritative.
    /// Draws its own 96x96 frame from the shared pixel art and never grants Gems.
    /// </summary>
    public sealed class AnimatedProfileFrame : MonoBehaviour
    {
        static readonly Dictionary<string,Sprite[]> Animation=new Dictionary<string,Sprite[]>();
        Image image;
        Func<bool> motionAllowed;
        string frameId="basic";
        int last=-1;
        public static bool SupportsMotion(string id)=>
            id=="gold-lab"||id=="neon"||id=="quantum"||id=="singularity";
        public void Initialize(Image target,string id,Func<bool> allow)
        {
            image=target;
            frameId=string.IsNullOrEmpty(id)?"basic":id;
            motionAllowed=allow;
            last=-1;
            Refresh();
        }
        public static Sprite SpriteAt(string id,int phase)
        {
            var original=ProfileFrameSprite.Get(id);
            if(!SupportsMotion(id))return original;
            if(!Animation.TryGetValue(id,out var frames))
            {
                frames=new Sprite[6];
                var source=original.texture.GetPixels32();
                for(int i=0;i<frames.Length;i++)
                {
                    var pixels=(Color32[])source.Clone();
                    var glow=id=="singularity"?new Color32(111,255,205,255):
                             id=="quantum"?new Color32(189,139,255,255):
                             id=="neon"?new Color32(251,136,227,255):
                             new Color32(255,232,156,255);
                    // Moving highlights on the existing border, never cover the portrait center.
                    void Dot(int x,int y)
                    {for(int yy=y;yy<y+3;yy++)for(int xx=x;xx<x+3;xx++)
                        if(xx>=0&&xx<96&&yy>=0&&yy<96)pixels[yy*96+xx]=glow;}
                    int v=14+i*11;
                    Dot(v,7);Dot(86,Math.Min(82,v));Dot(84-i*11,87);Dot(7,82-i*11);
                    var tex=new Texture2D(96,96,TextureFormat.RGBA32,false);
                    tex.filterMode=FilterMode.Point;tex.wrapMode=TextureWrapMode.Clamp;
                    tex.SetPixels32(pixels);tex.Apply(false,true);
                    frames[i]=Sprite.Create(tex,new Rect(0,0,96,96),new Vector2(.5f,.5f),96f);
                    frames[i].name="AnimatedFrame-"+id+"-"+i;
                }
                Animation.Add(id,frames);
            }
            return frames[((phase%frames.Length)+frames.Length)%frames.Length];
        }
        void Update(){Refresh();}
        void Refresh()
        {
            if(image==null)return;
            bool moving=SupportsMotion(frameId)&&(motionAllowed==null||motionAllowed());
            int phase=moving?Mathf.FloorToInt(Time.unscaledTime*6)%6:0;
            if(phase==last)return;
            last=phase;
            image.sprite=SpriteAt(frameId,phase);
            image.preserveAspect=true;
            image.raycastTarget=false;
        }
        void OnDisable(){last=-1;}
    }
}
