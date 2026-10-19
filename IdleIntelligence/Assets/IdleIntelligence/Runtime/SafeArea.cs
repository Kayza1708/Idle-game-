using UnityEngine;
namespace IdleIntelligence.Runtime
{
    [RequireComponent(typeof(RectTransform))]
    public sealed class SafeArea : MonoBehaviour
    {
        Rect last;Vector2 size;
        void OnEnable()=>Apply();
        void Update(){if(last!=Screen.safeArea||size!=new Vector2(Screen.width,Screen.height))Apply();}
        public void Apply()
        {
            if(Screen.width<=0||Screen.height<=0)return;
            last=Screen.safeArea;size=new Vector2(Screen.width,Screen.height);
            var r=(RectTransform)transform;r.anchorMin=last.position/size;r.anchorMax=(last.position+last.size)/size;r.offsetMin=r.offsetMax=Vector2.zero;
        }
    }
}
