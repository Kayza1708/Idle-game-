using UnityEngine;
using UnityEngine.UI;
namespace IdleIntelligence.Runtime {
    public sealed class ItemGrid:MonoBehaviour
    {
        public float Height=148;
        void OnEnable()=>Resize();void OnRectTransformDimensionsChange()=>Resize();void Resize(){var g=GetComponent<GridLayoutGroup>();if(g!=null)g.cellSize=new Vector2(Mathf.Max(1,(((RectTransform)transform).rect.width-g.padding.horizontal-g.spacing.x*(g.constraintCount-1))/g.constraintCount),Height);}
    }
}
