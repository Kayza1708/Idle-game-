using UnityEngine;
using UnityEngine.UI;

namespace IdleIntelligence.Runtime
{
    // Keep 44-unit targets at least 44 pixels at the smallest supported width.
    // Wider phones retain the existing 390-unit art/layout reference.
    [RequireComponent(typeof(Canvas),typeof(CanvasScaler))]
    public sealed class MobileCanvasScale:MonoBehaviour
    {
        Canvas canvas;CanvasScaler scaler;
        void Awake(){canvas=GetComponent<Canvas>();scaler=GetComponent<CanvasScaler>();}
        void OnEnable(){Canvas.preWillRenderCanvases+=Adapt;}
        void OnDisable(){Canvas.preWillRenderCanvases-=Adapt;}
        void Adapt()
        {
            if(canvas==null||scaler==null||scaler.uiScaleMode!=CanvasScaler.ScaleMode.ScaleWithScreenSize)return;
            float pixels=canvas.renderMode==RenderMode.ScreenSpaceCamera&&canvas.worldCamera!=null?canvas.worldCamera.pixelRect.width:Screen.width;
            if(pixels<1)return;
            float width=Mathf.Clamp(pixels,320,390);var reference=scaler.referenceResolution;
            if(Mathf.Abs(reference.x-width)<.1f)return;
            scaler.referenceResolution=new Vector2(width,reference.y);
            // CanvasScaler normally applies on the next frame; screenshot cameras
            // and orientation changes need the same scale during this layout pass.
            canvas.scaleFactor=pixels/width;
        }
    }
}
